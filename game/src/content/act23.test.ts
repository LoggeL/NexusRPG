// Spielbarkeit Akt 2, Akt 3 und Enden (ohne Browser): Vom Akt-2-Start (ACT_STARTS 2) über main-2-bruch …
// main-2-krisensitzung, drei Party-Vorbereitungen, die Planungstafel („Releaseparty starten“) und main-3-einlass …
// main-3-blade bis zu jedem Ende (Upload Stick, Umschreiben, Überzeugt, Master und 3b). Schritte werden über Flags,
// Gegenstände und gewonnene Kämpfe erfüllt – aber nur, wenn der Inhalt dafür wirklich einen Auslöser hat. Die
// Übergänge (Planungstafel, Landeplatz, Ende-Cutscenes, Ankunft am Meer, Zweite Chance) laufen dagegen als echte
// Dialoge, Cutscenes, Reisen und Kartenauslöser über einen kopflosen Regisseur.
import { describe, expect, it } from 'vitest';
import { createCampaign, runEnterTriggers } from '../modules/campaign';
import { createDialogueSession } from '../modules/dialogue';
import type { CampaignPort, Condition, Effect, EffectOutcome, QuestDef, Request } from '../modules/contracts';
import { content } from './index';

const AKT2 = ['main-2-bruch', 'main-2-kanal', 'main-2-countdown', 'main-2-krisensitzung'];
const PREPS = ['prep-outfits', 'prep-ausweise', 'prep-gaesteliste'];
const AKT3 = ['main-3-einlass', 'main-3-labor', 'main-3-gedankenkontrolle', 'main-3-nexus', 'main-3-blade', 'main-epilog'];

const JSON_CONTENT = JSON.stringify({ ...content, romance: [] });
const has = (pattern: string) => JSON_CONTENT.includes(pattern);
const flagSetter = (flag: string) => has(`"setFlag":"${flag}"`);
const itemSource = (item: string) =>
  has(`"give":"${item}"`) || has(`"items":{"${item}"`) || has(`"item":"${item}","qty"`) || has(`"item":"${item}"}`) ||
  new RegExp(`"items":\\{[^}]*"${item}"`).test(JSON_CONTENT);
const battleSource = (encounter: string) => has(`"battle":"${encounter}"`) || has(`"encounter":"${encounter}"`);

/** Alle Effektlisten des Inhalts (Dialogknoten, Wahlen, Cutscenes, Hotspots, Kartenauslöser, Questschritte). */
function effectLists(): Effect[][] {
  const out: Effect[][] = [];
  const walk = (x: unknown) => {
    if (!x || typeof x !== 'object') return;
    if (Array.isArray(x)) { for (const y of x) walk(y); return; }
    const o = x as Record<string, unknown>;
    if (Array.isArray(o.effects)) out.push(o.effects as Effect[]);
    for (const [k, v] of Object.entries(o)) if (k !== 'effects' && typeof v === 'object') walk(v);
  };
  walk([content.dialogues, content.cutscenes, content.maps, content.quests, content.phone]);
  return out;
}
const EFFECT_LISTS = effectLists();
/** Die Effektliste, mit der der Inhalt ein Flag setzt (damit Anwerben, Reisen, Gegenstände mitlaufen). */
const setterOf = (flag: string) => EFFECT_LISTS
  .filter((list) => list.some((e) => 'setFlag' in e && e.setFlag === flag && e.value !== false))
  .sort((a, b) => a.length - b.length)[0]; // die schlichteste Stelle (am wenigsten Nebenwirkungen)

/** Inhalts-Effektlisten, die der Port abgelehnt hat (transaktional: nichts passiert) – im Spiel ein stiller Fehler. */
const REJECTED: string[] = [];
function applyContent(c: CampaignPort, effects: readonly Effect[], where: string): EffectOutcome {
  const before = JSON.stringify(c.state());
  const outcome = c.apply(effects);
  if (effects.length && JSON.stringify(c.state()) === before && !outcome.requests.length && !outcome.messages.length) {
    REJECTED.push(`${where}: ${JSON.stringify(effects).slice(0, 160)}`);
  }
  return outcome;
}

/** Kopfloser Regisseur: spielt Anfragen ab wie presentation/director.ts (Dialoge automatisch, Kämpfe gewonnen). */
class Headless {
  readonly log: string[] = [];
  ended = false;
  constructor(readonly campaign: CampaignPort, private prefs: RegExp[] = []) {}

  prefer(prefs: RegExp[]) { this.prefs = prefs; }

  async outcome(outcome: EffectOutcome | null | undefined, depth = 0) {
    if (!outcome) return;
    for (const request of outcome.requests) await this.request(request, depth);
  }

  async request(request: Request, depth: number) {
    if (depth > 12 || this.ended) return;
    const c = this.campaign;
    if ('dialogue' in request) await this.dialogue(request.dialogue, depth + 1);
    else if ('cutscene' in request) await this.cutscene(request.cutscene, depth + 1);
    else if ('travel' in request) await this.travel(request.travel, request.entry, request.minutes, depth + 1);
    else if ('battle' in request) {
      const { battle, ...after } = request;
      this.log.push(`Kampf ${battle}`);
      await this.outcome(c.finishBattle({ encounter: battle, outcome: 'win', playerHp: c.maxHp() }, after), depth + 1);
    } else if ('minigame' in request) await this.outcome(c.finishMinigame(request.minigame, true), depth + 1);
    else if ('ending' in request) this.ended = true;
  }

  async cutscene(id: string, depth: number) {
    const def = content.cutscenes[id];
    expect(def, `Cutscene ${id}`).toBeDefined();
    this.log.push(`Cutscene ${id}`);
    this.campaign.markSeen(id);
    await this.outcome(def.effects?.length ? applyContent(this.campaign, def.effects, `Cutscene ${id}`) : null, depth);
  }

  async dialogue(id: string, depth: number) {
    expect(content.dialogues[id], `Dialog ${id}`).toBeDefined();
    this.log.push(`Dialog ${id}`);
    const session = createDialogueSession(this.campaign, id);
    const taken = new Map<string, number>();
    for (let i = 0; i < 400; i++) {
      const view = session.view();
      if (view.done) break;
      if (!view.choices) { session.advance(); continue; }
      const enabled = view.choices.filter((ch) => ch.enabled);
      if (!enabled.length) { this.log.push(`  festgefahren in ${id}/${view.nodeId}`); break; }
      const key = (ch: { index: number }) => `${view.nodeId}#${ch.index}`;
      const fresh = enabled.filter((ch) => (taken.get(key(ch)) ?? 0) < 2);
      const pool = fresh.length ? fresh : enabled;
      const pick = this.prefs.map((re) => pool.find((ch) => re.test(ch.text))).find(Boolean) ?? pool[0];
      taken.set(key(pick), (taken.get(key(pick)) ?? 0) + 1);
      session.choose(pick.index);
    }
    await this.outcome(session.outcome(), depth);
  }

  async travel(map: string, entry: string | undefined, minutes: number | undefined, depth: number) {
    const def = content.maps[map];
    expect(def, `Karte ${map}`).toBeDefined();
    const spawn = entry ? def.entries[entry] : Object.values(def.entries)[0];
    expect(spawn, `Einstieg ${map}#${entry}`).toBeDefined();
    this.log.push(`Reise ${map}/${entry ?? '-'}`);
    this.campaign.setLocation(map, spawn.at, spawn.facing ?? 's', { minutes: minutes ?? 10 });
    await runEnterTriggers(this.campaign, def, {
      playCutscene: (id) => this.cutscene(id, depth + 1),
      runDialogue: (id) => this.dialogue(id, depth + 1),
      handleOutcome: (outcome) => this.outcome(outcome, depth + 1),
      stillHere: () => !this.ended && this.campaign.state().map === map,
    });
  }
}

/** Stellt eine Bedingung her, wie der Inhalt es täte; liefert eine Fehlermeldung, wenn es keinen Weg gibt. */
function satisfy(c: CampaignPort, condition: Condition, where: string, outcomes: EffectOutcome[]): string | null {
  if (c.evaluate(condition)) return null;
  if ('flag' in condition) {
    if (!flagSetter(condition.flag)) return `${where}: kein setFlag für „${condition.flag}“`;
    const setter = setterOf(condition.flag);
    const outcome = setter ? applyContent(c, setter, `${where} (Setter ${condition.flag})`) : null;
    if (outcome) outcomes.push(outcome);
    if (!c.evaluate(condition)) outcomes.push(c.apply([{ setFlag: condition.flag }])); // Setter abgelehnt (z. B. fehlender Gegenstand)
  } else if ('item' in condition) {
    if (!itemSource(condition.item)) return `${where}: keine Quelle für „${condition.item}“`;
    outcomes.push(c.apply([{ give: condition.item, qty: condition.min ?? 1 }]));
  } else if ('visited' in condition) {
    const map = content.maps[condition.visited];
    if (!map) return `${where}: Karte „${condition.visited}“ fehlt`;
    c.setLocation(map.id, Object.values(map.entries)[0].at, 's');
  } else if ('won' in condition) {
    if (!battleSource(condition.won)) return `${where}: Begegnung „${condition.won}“ wird nie ausgelöst`;
    outcomes.push(c.finishBattle({ encounter: condition.won, outcome: 'win', playerHp: c.maxHp() }));
  } else if ('seen' in condition) {
    if (!content.dialogues[condition.seen] && !content.cutscenes[condition.seen]) return `${where}: „${condition.seen}“ gibt es nicht`;
    c.markSeen(condition.seen);
  } else if ('all' in condition) {
    for (const part of condition.all) { const err = satisfy(c, part, where, outcomes); if (err) return err; }
  } else if ('any' in condition) {
    const errors: string[] = [];
    // Flags zuerst (so setzt der Inhalt meist auch die Folgeweichen), Kämpfe zuletzt.
    const rank = (x: Condition) => ('flag' in x ? 0 : 'won' in x ? 2 : 1);
    for (const part of [...condition.any].sort((a, b) => rank(a) - rank(b))) {
      const err = satisfy(c, part, where, outcomes);
      if (!err && c.evaluate(condition)) return null;
      if (err) errors.push(err);
    }
    return errors.join(' | ') || `${where}: keine Alternative erfüllbar`;
  } else if ('atLeast' in condition) {
    for (const part of condition.atLeast) {
      if (c.evaluate(condition)) break;
      satisfy(c, part, where, outcomes);
    }
  } else {
    return `${where}: ${JSON.stringify(condition)} nicht automatisch herstellbar`;
  }
  return c.evaluate(condition) ? null : `${where}: ${JSON.stringify(condition)} bleibt unerfüllt`;
}

/** Eine Quest von Start bis Abschluss; `special` darf einzelne Schritte selbst erledigen (echte Dialoge). */
async function playQuest(
  c: CampaignPort, id: string, problems: string[], outcomes: EffectOutcome[],
  special: Record<string, () => Promise<void>> = {},
) {
  const quest: QuestDef = content.quests[id];
  expect(quest, id).toBeDefined();
  outcomes.push(c.apply([]));
  if (c.state().quests[id]?.status !== 'active' && quest.autoStart) {
    const err = satisfy(c, quest.autoStart, `${id} Start`, outcomes);
    if (err) problems.push(err);
    outcomes.push(c.apply([]));
  }
  expect(c.state().quests[id]?.status, `${id} läuft`).toBe('active');
  for (const step of quest.steps) {
    if (c.state().quests[id]?.status !== 'active') break;
    if (step.when && !c.evaluate(step.when)) continue; // Weiche des anderen Wegs bzw. noch nicht sichtbar
    if (special[step.id]) await special[step.id]();
    else {
      // Optionale Schritte (Weichen, Extras) nur mitnehmen, wenn sie sich herstellen lassen.
      const err = satisfy(c, step.done, `${id}/${step.id}`, outcomes);
      if (err && !step.optional) problems.push(err);
    }
    outcomes.push(c.apply([]));
  }
  expect(c.state().quests[id]?.status, `${id} abgeschlossen ${JSON.stringify(c.state().quests[id])} ${problems.join(' / ')}`).toBe('done');
}

const UPLOADS = ['upload_stick', 'upload_umschreiben', 'upload_ueberzeugt', 'upload_master'] as const;

async function playthrough(upload: (typeof UPLOADS)[number]) {
  const c = createCampaign(content, { storage: null, seed: 23, random: () => 0.5 });
  c.warpAct(2);
  const director = new Headless(c);
  const problems: string[] = [];
  const outcomes: EffectOutcome[] = [];
  const s = c.state();
  expect(s.act).toBe(2);
  expect(s.map).toBe('quantum-campus');
  expect(s.quests['main-2-bruch']?.status).toBe('active');
  expect(s.recruited).not.toContain('dante');

  for (const id of AKT2.slice(0, 2)) await playQuest(c, id, problems, outcomes);
  // Countdown: Dantes Beitritt (Freeze-Szene) wirbt ihn wirklich an.
  const beitritt = EFFECT_LISTS.find((list) => list.some((e) => 'recruit' in e && e.recruit === 'dante')
    && list.some((e) => 'setFlag' in e && e.setFlag === 'dante_beigetreten'));
  expect(beitritt, 'Beitritt mit recruit dante').toBeDefined();
  await playQuest(c, 'main-2-countdown', problems, outcomes, {
    dante: async () => { outcomes.push(applyContent(c, beitritt ?? [], 'Dantes Beitritt')); },
  });
  expect(c.state().recruited, 'Dante tritt bei').toContain('dante');

  await playQuest(c, 'main-2-krisensitzung', problems, outcomes, {
    preps: async () => {
      for (const id of PREPS) await playQuest(c, id, problems, outcomes);
    },
    // Akt 2 → 3 über die echte Planungstafel: Einlass ab 20:00.
    start: async () => {
      const now = c.state().clock.minutes;
      if (now > 1200) c.sleep();
      c.advanceClock(1200 - c.state().clock.minutes);
      director.prefer([/^Releaseparty starten/, /Jetzt\. Wir fahren los/]);
      await director.dialogue('m2p-tafel', 0);
      director.prefer([]);
    },
  });
  expect(c.state().act, 'Planungstafel startet Akt 3').toBe(3);
  expect(c.state().party).toEqual(expect.arrayContaining(['aria', 'dante']));

  for (const id of AKT3.slice(0, 5)) {
    // Die Upload-Entscheidung im Serverkern: diesen Weg wählen.
    if (id === 'main-3-nexus') {
      await playQuest(c, id, problems, outcomes, {
        upload: async () => { outcomes.push(c.apply([{ setFlag: upload }])); },
      });
    } else await playQuest(c, id, problems, outcomes);
  }
  expect(problems).toEqual([]);

  // main-epilog startet von selbst und ruft den Landeplatz-Dialog.
  outcomes.push(c.apply([]));
  expect(c.state().quests['main-epilog']?.status, 'main-epilog startet').toBeDefined();
  const asked = outcomes.flatMap((o) => o.requests).some((r) => 'dialogue' in r && r.dialogue === 'ende-landeplatz');
  expect(asked, 'Landeplatz-Dialog wird angefordert').toBe(true);
  await director.dialogue('ende-landeplatz', 0);
  return { c, director };
}

describe('Akt 2, Akt 3 und Enden', () => {
  it('Hauptweg ACT_STARTS 2 → main-3-blade → jedes Ende über den Kampagnen-Port', async () => {
    // Akt 1 → 2: Der Cliffhanger nach dem „los“ an der Planungstafel startet Akt 2 nahtlos.
    const cliff = content.cutscenes['akt1-cliffhanger'];
    expect(cliff.effects).toEqual(expect.arrayContaining([
      { setAct: 2 }, { startQuest: 'main-2-bruch' }, expect.objectContaining({ travel: 'quantum-campus', entry: 'bruch-treffpunkt' }),
    ]));
    // Akt-3-Warp ist spielbar: main-3-einlass läuft am Vorplatz.
    const a3 = createCampaign(content, { storage: null, seed: 3, random: () => 0.5 });
    a3.warpAct(3);
    expect(a3.state().map).toBe('quantum-campus');
    expect(a3.state().quests['main-3-einlass']?.status).toBe('active');
    expect(content.ending.cutscenes.every((id) => !!content.cutscenes[id])).toBe(true);

    const expected: Record<(typeof UPLOADS)[number], { cutscene: string; flag: string; map: string }> = {
      upload_stick: { cutscene: 'ende-das-meer', flag: 'ende_meer', map: 'das-meer' },
      upload_umschreiben: { cutscene: 'ende-neue-nexus', flag: 'ende_neue_nexus', map: 'das-meer' },
      upload_ueberzeugt: { cutscene: 'ende-das-meer', flag: 'ende_meer', map: 'das-meer' },
      upload_master: { cutscene: 'ende-master', flag: 'ende_master', map: 'blades-buero' },
    };
    for (const upload of UPLOADS) {
      const { c, director } = await playthrough(upload);
      const want = expected[upload];
      const where = `${upload}: ${director.log.join(' → ')}`;
      expect(director.log, where).toContain(`Cutscene ${want.cutscene}`);
      expect(c.evaluate({ flag: want.flag }), where).toBe(true);
      expect(c.evaluate({ flag: 'epilog' }), where).toBe(true);
      expect(c.state().quests['main-epilog']?.status, where).toBe('done');
      expect(c.state().map, where).toBe(want.map);
      if (want.map === 'das-meer') {
        expect(c.evaluate({ flag: 'meer_offen' }), where).toBe(true);
        expect(c.evaluate({ flag: 'ende_ankunft_gesehen' }), `${where}: Ankunft am Meer`).toBe(true);
        expect(content.maps['das-meer'].hotspots.some((h) => h.id === 'abspann' && c.evaluate(h.when)), 'Abspann am Wagenplatz').toBe(true);
      } else {
        expect(c.evaluate({ flag: 'master_modus' }), where).toBe(true);
        expect(c.evaluate({ flag: 'meer_offen' }), `${where}: Meer zu`).toBe(false);
        // Ende 3b: Kuschel im Turmbüro → side-zweite-chance → Ravens Einladung → doch noch ans Meer.
        director.prefer([/verkackt/, /Kuschel unter den Arm/]);
        await director.dialogue('zc-kuschel', 0);
        director.prefer([]);
        expect(c.state().quests['side-zweite-chance']?.status, 'Zweite Chance läuft').toBe('active');
        const problems: string[] = [];
        await playQuest(c, 'side-zweite-chance', problems, [], {
          heimkehr: async () => { await director.outcome(c.readPhone('tel-zc-raven-lagerfeuer', 0)); },
        });
        expect(problems).toEqual([]);
        expect(director.log).toContain('Cutscene ende-doch-noch-ans-meer');
        expect(c.evaluate({ flag: 'ende_doch_noch_meer' })).toBe(true);
        expect(c.evaluate({ flag: 'master_modus' })).toBe(false);
        expect(c.state().map).toBe('das-meer');
      }
    }
    expect(REJECTED, 'abgelehnte Effektlisten').toEqual([]);
  });
});
