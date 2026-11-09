// Probelauf Vex×Aria Akt 2/3/Enden/Nachspiel (Skript, kein Test): Debug-Sprünge aus design/plan/vexaria.md.
// Aufruf: cd game && npx vite-node ../scripts/dev/vexaria23_probe.ts  (OK/XX je Station, REJ = abgelehnte Effektlisten)
import { content } from '../../game/src/content';
import { createCampaign, runEnterTriggers } from '../../game/src/modules/campaign';
import { createDialogueSession } from '../../game/src/modules/dialogue';
import type { ActId, CampaignPort, Effect, Weekday } from '../../game/src/modules/contracts';

const SLOT: Record<string, number> = { morgen: 480, tag: 720, abend: 1140, nacht: 1350 };
interface St { name: string; expect: string; act: ActId; map: string; slot: string; day?: Weekday; hearts?: number;
  flags?: string[]; seen?: string[]; quests?: Record<string, 'active' | 'done'>; items?: string[]; recruit?: string[]; vex?: boolean }

const DONE = (...ids: string[]) => Object.fromEntries(ids.map((i) => [i, 'done' as const]));
const ST: St[] = [
  { name: 'A-a Bruch-Anruf', expect: 'vexaria-bruch-a', act: 2, map: 'loetgassen', slot: 'tag', flags: ['aria_gechippt', 'bruch_entkommen'], quests: DONE('main-2-bruch') },
  { name: 'R Rettung', expect: 'rom-vexaria-rettung', act: 2, map: 'pumpwerk-sieben', slot: 'tag', hearts: 8, flags: ['aria_gechippt', 'bruch_entkommen'], quests: DONE('main-2-bruch') },
  { name: 'A-b Hinterhof', expect: 'vexaria-bruch-b', act: 2, map: 'high-voltage', slot: 'abend', flags: ['aria_entkommen', 'bruch_entkommen'], quests: DONE('main-2-bruch') },
  { name: '8b he-aria-8', expect: 'he-aria-8', act: 2, map: 'schrottmarkt', slot: 'tag', hearts: 8, quests: DONE('main-2-bruch'), flags: ['aria_entkommen', 'bruch_entkommen'], recruit: ['aria'] },
  { name: 'A5 Ausfall B', expect: 'rom-aria-ausfall', act: 2, map: 'dantes-werkstatt', slot: 'nacht', hearts: 8, seen: ['he-aria-8'], quests: DONE('main-2-bruch'), flags: ['aria_entkommen', 'bruch_entkommen', 'aria_arm_gesperrt'], recruit: ['aria'] },
  { name: 'A6 Streit (Kanon)', expect: 'rom-aria-streit', act: 2, map: 'neon-gasse', slot: 'abend', hearts: 8, quests: DONE('main-2-bruch', 'pers-aria-zerberster'), flags: ['aria_streit_deal', 'aria_weg_deal', 'aria_romanze_angebahnt', 'aria_arm_frei'], recruit: ['aria'] },
  { name: 'A7 Vega', expect: 'rom-aria-vega', act: 2, map: 'neon-gasse', slot: 'morgen', hearts: 8, seen: ['rom-aria-streit', 'rom-vexaria-funkstille'], quests: DONE('main-2-bruch', 'pers-aria-zerberster'), flags: ['aria_romanze_streit', 'aria_streit_deal', 'aria_arm_frei'], recruit: ['aria'] },
  { name: 'A8 Regen', expect: 'rom-aria-regen', act: 2, map: 'neon-gasse', slot: 'abend', hearts: 8, seen: ['rom-aria-streit', 'rom-vexaria-funkstille', 'rom-vexaria-umdrehen', 'rom-aria-vega'], items: ['beglichener-schuldschein'], quests: DONE('main-2-bruch', 'pers-aria-zerberster'), flags: ['aria_romanze_streit', 'aria_vega_rat', 'aria_streit_deal', 'aria_arm_frei', 'vexaria_umgedreht'], recruit: ['aria'] },
  { name: 'K1 Krise (Brücke)', expect: 'rom-vexaria-krise', act: 2, map: 'neon-gasse', slot: 'abend', hearts: 8, seen: ['rom-vexaria-ripperdeal'], quests: DONE('main-2-bruch', 'pers-aria-zerberster'), flags: ['aria_romanze_zusammen', 'aria_weg_deal', 'aria_arm_frei'], recruit: ['aria'] },
  { name: 'K2 Dachnacht', expect: 'rom-vexaria-dachnacht', act: 2, map: 'loetgassen', slot: 'nacht', hearts: 8, seen: ['rom-vexaria-ripperdeal', 'rom-vexaria-krise'], quests: DONE('main-2-bruch', 'pers-aria-zerberster'), flags: ['aria_romanze_zusammen', 'aria_weg_deal', 'vexaria_krise', 'vexaria_krise_offen', 'aria_arm_frei'], recruit: ['aria'] },
  { name: 'Outfit', expect: 'rom-vexaria-outfit', act: 2, map: 'stufenplatz', slot: 'tag', hearts: 8, quests: DONE('main-2-bruch', 'pers-aria-zerberster'), flags: ['aria_arm_frei', 'aria_romanze_zusammen', 'releaseparty_geplant'], recruit: ['aria'] },
  { name: 'A10 Stirn', expect: 'rom-aria-stirn', act: 2, map: 'neon-gasse', slot: 'nacht', hearts: 8, quests: DONE('main-2-bruch', 'pers-aria-zerberster', 'main-2-countdown', 'main-2-krisensitzung'), flags: ['party_bereit', 'aria_romanze_zusammen', 'aria_arm_frei', 'releaseparty_geplant'], recruit: ['aria'] },
  { name: 'Party Tanz', expect: 'rom-vexaria-himmelsgarten', act: 3, map: 'himmelsgarten', slot: 'nacht', hearts: 8, quests: DONE('main-3-einlass'), flags: ['aria_romanze_zusammen'], recruit: ['aria'] },
  { name: 'Party Sorge', expect: 'vexaria-gedanken-sorge', act: 3, map: 'himmelsgarten', slot: 'nacht', hearts: 8, quests: { ...DONE('main-3-einlass', 'main-3-labor'), 'main-3-gedankenkontrolle': 'active' }, flags: ['aria_romanze_zusammen', 'aria_gechippt'], recruit: ['aria'] },
  { name: 'Party Geständnis', expect: 'vexaria-gestaendnis', act: 3, map: 'himmelsgarten', slot: 'nacht', hearts: 8, quests: { ...DONE('main-3-einlass', 'main-3-labor'), 'main-3-gedankenkontrolle': 'active' }, flags: ['aria_romanze_zusammen', 'raven_zurueck'], recruit: ['aria'] },
  { name: 'Meer (Ende 1)', expect: 'rom-vexaria-meer', act: 3, map: 'das-meer', slot: 'abend', day: 'fr', hearts: 9, quests: DONE('main-3-blade', 'main-epilog'), flags: ['epilog', 'ende_meer', 'meer_offen', 'aria_romanze_zusammen', 'ende_ankunft_gesehen'], recruit: ['aria'] },
  { name: 'Meer (3b)', expect: 'rom-vexaria-meer', act: 3, map: 'das-meer', slot: 'abend', day: 'fr', hearts: 9, quests: DONE('main-3-blade', 'main-epilog', 'side-zweite-chance'), flags: ['epilog', 'ende_master', 'ende_doch_noch_meer', 'meer_offen', 'aria_romanze_zusammen', 'zc_ankunft_gesehen'], recruit: ['aria'] },
  { name: 'Autoradio (Ende 2)', expect: 'vexaria-ende-autoradio', act: 3, map: 'das-meer', slot: 'morgen', hearts: 9, seen: ['rom-vexaria-meer'], quests: DONE('main-3-blade', 'main-epilog'), flags: ['epilog', 'ende_neue_nexus', 'meer_offen', 'aria_romanze_zusammen', 'vexaria_meer', 'ende_ankunft_gesehen'], recruit: ['aria'] },
  { name: 'Master (Ende 3)', expect: 'vexaria-ende-master', act: 3, map: 'blades-buero', slot: 'morgen', hearts: 9, quests: DONE('main-3-blade', 'main-epilog'), flags: ['epilog', 'ende_master', 'master_modus', 'aria_romanze_zusammen'] },
  { name: 'Nachspiel Zähne', expect: 'vexaria-alltag-zaehne', act: 3, map: 'das-meer', slot: 'morgen', hearts: 9, seen: ['rom-vexaria-meer'], quests: DONE('main-3-blade', 'main-epilog'), flags: ['epilog', 'ende_meer', 'meer_offen', 'aria_romanze_zusammen', 'vexaria_meer', 'ende_ankunft_gesehen'], recruit: ['aria'] },
  { name: 'Nachspiel Schlüssel', expect: 'vexaria-alltag-schluessel', act: 3, map: 'loetgassen', slot: 'abend', hearts: 9, seen: ['rom-vexaria-meer'], quests: DONE('main-3-blade', 'main-epilog'), flags: ['epilog', 'ende_meer', 'meer_offen', 'aria_romanze_zusammen', 'vexaria_meer'], recruit: ['aria'] },
  { name: 'Nachspiel Rate', expect: 'vexaria-alltag-rate', act: 3, map: 'ripper-praxis', slot: 'tag', day: 'mo', hearts: 9, seen: ['rom-vexaria-meer'], quests: DONE('main-3-blade', 'main-epilog'), flags: ['epilog', 'ende_meer', 'meer_offen', 'aria_romanze_zusammen', 'vexaria_meer'], recruit: ['aria'] },
  { name: 'Nachspiel Ausblick', expect: 'vexaria-ausblick', act: 3, map: 'das-meer', slot: 'nacht', hearts: 9, seen: ['rom-vexaria-meer'], quests: DONE('main-3-blade', 'main-epilog'), flags: ['epilog', 'ende_meer', 'meer_offen', 'aria_romanze_zusammen', 'vexaria_meer', 'ende_ankunft_gesehen', 'vexaria_alltag_zaehne', 'vexaria_alltag_schluessel'], recruit: ['aria'] },
];

function setup(st: St): CampaignPort {
  const c = createCampaign(content, { storage: null, seed: 5, random: () => 0.5 });
  c.warpAct(st.act);
  const save = JSON.parse(c.exportSave());
  const s = save.state ?? save;
  const p = s.player;
  if (st.vex !== false) { p.preset = 'vex'; p.name = 'Vex'; }
  for (const [q, status] of Object.entries(st.quests ?? {})) s.quests[q] = { status, steps: status === 'done' ? content.quests[q].steps.map((x) => x.id) : [], startedDay: 1, ...(status === 'done' ? { endedDay: 1 } : {}) };
  for (const r of st.recruit ?? []) { if (!s.recruited.includes(r)) s.recruited.push(r); }
  if (!c.importSave(JSON.stringify(save))) throw new Error('importSave ' + st.name + ' ' + JSON.stringify(c.lastImportNotes?.()));
  const fx: Effect[] = [
    { setFlag: 'aria_heute', value: false }, { setFlag: 'aria_warte1', value: false }, { setFlag: 'aria_warte2', value: false },
    ...(st.flags ?? []).map((f): Effect => ({ setFlag: f })), ...(st.seen ?? []).map((m): Effect => ({ markSeen: m })),
    ...(st.items ?? []).map((i): Effect => ({ give: i })),
  ];
  for (const e of fx) c.apply([e]);
  if (st.hearts) c.apply([{ relation: 'aria', delta: st.hearts * 100 + 50 - (c.state().relations.aria?.points ?? 0) }]);
  // Wochentag und Uhrzeit
  for (let i = 0; i < 8 && st.day && c.weekday() !== st.day; i++) c.sleep();
  if (!st.day) c.sleep();
  c.advanceClock(SLOT[st.slot] - c.state().clock.minutes);
  return c;
}

const REJ: string[] = [];
async function play(c: CampaignPort, id: string, log: string[], depth = 0): Promise<void> {
  if (depth > 6) return;
  const s = createDialogueSession(c, id); log.push('D:' + id);
  const taken = new Map<string, number>();
  for (let i = 0; i < 300; i++) {
    const v = s.view(); if (v.done) break;
    if (!v.choices) { s.advance(); continue; }
    const en = v.choices.filter((x) => x.enabled); if (!en.length) { log.push(`FEST ${id}/${v.nodeId}`); break; }
    const fresh = en.filter((x) => (taken.get(v.nodeId + x.index) ?? 0) < 1); const pick = (fresh.length ? fresh : en)[0];
    taken.set(v.nodeId + pick.index, (taken.get(v.nodeId + pick.index) ?? 0) + 1);
    s.choose(pick.index);
  }
  for (const r of s.outcome().requests) {
    if ('dialogue' in r) await play(c, r.dialogue, log, depth + 1);
    else if ('cutscene' in r) { const d = content.cutscenes[r.cutscene]; if (!d) log.push('FEHLT cut ' + r.cutscene); else { log.push('C:' + r.cutscene); c.markSeen(r.cutscene); if (d.effects?.length) { const b = JSON.stringify(c.state()); const o = c.apply(d.effects); if (b === JSON.stringify(c.state()) && !o.requests.length) REJ.push('cut ' + r.cutscene); for (const q of o.requests) if ('dialogue' in q) await play(c, q.dialogue, log, depth + 1); } } }
    else if ('battle' in r) { log.push('B:' + r.battle); const { battle, ...after } = r; c.finishBattle({ encounter: battle, outcome: 'win', playerHp: c.maxHp() }, after); }
    else if ('travel' in r) log.push('T:' + r.travel);
  }
}

(async () => {
  for (const st of ST) {
    const c = setup(st);
    const map = content.maps[st.map];
    const entry = Object.values(map.entries)[0];
    c.setLocation(st.map, entry.at, 's', { minutes: 0 });
    const found: string[] = [];
    const log: string[] = [];
    // Kandidaten sammeln: onEnter, Herz-Ereignis, sichtbare Hotspots, Telefon
    for (const t of map.onEnter ?? []) if (c.evaluate(t.when) && !c.hasSeen(`enter:${st.map}:${t.id}`)) found.push(`onEnter ${t.id}→${t.dialogue ?? t.cutscene ?? ''}`);
    const skipped: string[] = [];
    for (let k = 0; k < 8; k++) { const h0 = c.pendingHeartEvent(st.map); if (!h0 || h0.id.startsWith(st.expect)) break; skipped.push(h0.id); c.completeHeartEvent(h0.id); c.apply([{ setFlag: 'aria_heute', value: false }]); }
    if (skipped.length) found.push(`(vorher erledigt: ${skipped.join(' ')})`);
    const he = c.pendingHeartEvent(st.map); if (he) found.push(`herz ${he.id}→${he.dialogue ?? ''}`);
    for (const h of map.hotspots) if ((h.id.includes('vex') || h.id.includes('aria') || (h.dialogue ?? '').includes(st.expect)) && c.evaluate(h.when) && !(h.hideWhen && c.evaluate(h.hideWhen))) found.push(`hotspot ${h.id}→${h.dialogue ?? ''}`);
    for (const ph of Object.values(content.phone)) if (ph.auto && ph.from === 'aria' && c.evaluate(ph.auto)) found.push(`telefon ${ph.id}`);
    const hit = found.find((f) => f.includes(st.expect));
    // Abspielen über die echten Kartenauslöser bzw. den Dialog
    if (hit) {
      const dlg = hit.split('→')[1] || st.expect;
      if (hit.startsWith('onEnter') || hit.startsWith('herz')) {
        await runEnterTriggers(c, map, {
          playCutscene: async (id) => { log.push('C:' + id); c.markSeen(id); },
          runDialogue: (id) => play(c, id, log), handleOutcome: async () => {}, stillHere: () => true,
        });
      } else if (content.dialogues[dlg]) await play(c, dlg, log);
      else if (hit.startsWith('telefon')) { const o = c.readPhone(hit.split(' ')[1], 0); for (const r of o.requests) if ('dialogue' in r) await play(c, r.dialogue, log); else if ('cutscene' in r) log.push('C:' + r.cutscene); }
    }
    console.log(`${hit ? 'OK ' : 'XX '} ${st.name.padEnd(22)} ${st.expect.padEnd(28)} ${c.weekday()} ${c.state().clock.minutes} | ${found.join(', ') || '–'}\n      ${log.join(' ').slice(0, 400)}`);
  }
  console.log('REJ', REJ);
})();
