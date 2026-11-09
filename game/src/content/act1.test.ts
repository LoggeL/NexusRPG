// Spielbarkeit Akt 1 (ohne Browser): Der Hauptstrang vom Prolog bis main-1-der-plan läuft über den Kampagnen-Port.
// Jede Hauptquest muss von selbst starten, jeder Pflichtschritt sichtbar werden und sich erfüllen lassen. Flags werden
// so gesetzt, wie der Inhalt sie setzt – aber nur, wenn es im Inhalt wirklich einen Auslöser dafür gibt (setFlag,
// Gegenstandsquelle, Begegnung mit battle-Effekt oder Kartengruppe, Karte mit Zugang).
import { describe, expect, it } from 'vitest';
import { createCampaign } from '../modules/campaign';
import type { CampaignPort, Condition, QuestDef } from '../modules/contracts';
import { content } from './index';

const MAIN_PATH = [
  'main-0-digitech', 'main-1-ankunft', 'main-1-probezeit', 'main-1-dexter', 'main-1-raven', 'main-1-auf-raven',
  'main-1-dante', 'main-1-der-plan',
];

const JSON_CONTENT = JSON.stringify({ ...content, romance: [] });
const has = (pattern: string) => JSON_CONTENT.includes(pattern);
const flagSetter = (flag: string) => has(`"setFlag":"${flag}"`);
const itemSource = (item: string) =>
  has(`"give":"${item}"`) || has(`"items":{"${item}"`) || has(`"item":"${item}","qty"`) || has(`"item":"${item}"}`) ||
  new RegExp(`"items":\\{[^}]*"${item}"`).test(JSON_CONTENT);
const battleSource = (encounter: string) => has(`"battle":"${encounter}"`) || has(`"encounter":"${encounter}"`);
const mapEntrance = (map: string) => Object.values(content.maps).some((m) => m.exits.some((e) => e.to === map)) || has(`"travel":"${map}"`);

/** Versucht eine Bedingung so herzustellen, wie der Inhalt es täte; liefert eine Fehlermeldung, wenn es keinen Weg gibt. */
function satisfy(campaign: CampaignPort, condition: Condition, where: string): string | null {
  if (campaign.evaluate(condition)) return null;
  if ('flag' in condition) {
    if (!flagSetter(condition.flag)) return `${where}: kein setFlag für „${condition.flag}“ im Inhalt`;
    campaign.apply([{ setFlag: condition.flag }]);
  } else if ('visited' in condition) {
    const map = content.maps[condition.visited];
    if (!map || !mapEntrance(condition.visited)) return `${where}: Karte „${condition.visited}“ ohne Zugang`;
    campaign.setLocation(map.id, Object.values(map.entries)[0].at, 's');
  } else if ('item' in condition) {
    if (!itemSource(condition.item)) return `${where}: keine Quelle für Gegenstand „${condition.item}“`;
    campaign.apply([{ give: condition.item, qty: condition.min ?? 1 }]);
  } else if ('dayAtLeast' in condition) {
    for (let i = 0; i < 10 && !campaign.evaluate(condition); i++) campaign.sleep();
  } else if ('won' in condition) {
    return battleSource(condition.won) ? `${where}: nur über Kampf „${condition.won}“ (hier nicht simuliert)` : `${where}: Begegnung „${condition.won}“ wird nie ausgelöst`;
  } else if ('all' in condition) {
    for (const part of condition.all) { const err = satisfy(campaign, part, where); if (err) return err; }
  } else if ('any' in condition) {
    // Erster Weg ohne Kampf, der sich herstellen lässt (Kämpfe sind eigene Tests: encounters.test.ts).
    const errors: string[] = [];
    for (const part of condition.any) {
      const err = satisfy(campaign, part, where);
      if (!err && campaign.evaluate(condition)) return null;
      if (err) errors.push(err);
    }
    return errors.join(' | ') || `${where}: keine Alternative erfüllbar`;
  } else {
    return `${where}: Bedingung ${JSON.stringify(condition)} nicht automatisch herstellbar`;
  }
  return campaign.evaluate(condition) ? null : `${where}: ${JSON.stringify(condition)} bleibt unerfüllt`;
}

describe('Akt 1', () => {
  it('Hauptstrang vom Prolog bis main-1-der-plan: jede Hauptquest startet und lässt sich abschließen', () => {
    const campaign = createCampaign(content, { storage: null, seed: 11, random: () => 0.5 });
    const created = campaign.createCharacter({
      name: 'Testfigur', look: 'look-neonbomber', origin: 'origin-gossenkind',
      attributes: { technik: 4, koerper: 4, reflexe: 4, ausstrahlung: 4, strasse: 3 },
    });
    expect(created.ok, created.message).toBe(true);
    const start = content.maps[content.start.map];
    campaign.setLocation(start.id, start.entries[content.start.entry].at, 's');
    expect(content.cutscenes[content.start.cutscene ?? '']).toBeDefined();

    const problems: string[] = [];
    for (const id of MAIN_PATH) {
      const quest: QuestDef = content.quests[id];
      expect(quest, id).toBeDefined();
      if (quest.autoStart && !campaign.evaluate(quest.autoStart)) problems.push(...[satisfy(campaign, quest.autoStart, `${id} Start`)].filter((p): p is string => !!p));
      campaign.apply([]); // Quests prüfen ihre Startbedingung beim nächsten Abgleich
      expect(campaign.state().quests[id]?.status, `${id} läuft`).toBe('active');
      for (const step of quest.steps.filter((s) => !s.optional)) {
        if (step.when) expect(campaign.evaluate(step.when), `${id}/${step.id} wird sichtbar`).toBe(true);
        const err = satisfy(campaign, step.done, `${id}/${step.id}`);
        if (err) problems.push(err);
        campaign.apply([]);
      }
      expect(campaign.state().quests[id]?.status, `${id} abgeschlossen`).toBe('done');
    }
    expect(problems).toEqual([]);

    // Nach dem Briefing: Planungstafel und mindestens zwei Vorbereitungen sind erreichbar (Bruch = act1_done).
    const preps = Object.values(content.quests).filter((q) => q.id.startsWith('prep-'));
    expect(preps.length).toBeGreaterThanOrEqual(2);
    for (const prep of preps) {
      const startable = (prep.autoStart && campaign.evaluate(prep.autoStart)) || has(`"startQuest":"${prep.id}"`);
      expect(startable, `${prep.id} startbar`).toBe(true);
    }
    expect(flagSetter('act1_done')).toBe(true);
    expect(content.cutscenes['akt1-cliffhanger']).toBeDefined();
  });
});
