// Schreibhilfen für die Figuren Daria, Freya, Jakko, Oma Volt und Opa Gustav (keine Inhaltsdatei: exportiert kein `part`).
import type {
  AttributeId, CheckDef, Condition, DialogueDef, DialogueLine, DialogueNode, Effect, Expression, NpcId, SpeakerId,
} from '../../../modules/contracts';

/** Dialogzeile. */
export const L = (speaker: SpeakerId, text: string, expr?: Expression): DialogueLine =>
  expr ? { speaker, text, expr } : { speaker, text };

/** Erzählzeile. */
export const N = (text: string): DialogueLine => ({ speaker: 'narrator', text });

/** Zeile der Spielfigur. */
export const P = (text: string): DialogueLine => ({ speaker: 'player', text });

/** Dialogknoten. */
export const node = (id: string, lines: DialogueLine[], rest: Omit<DialogueNode, 'id' | 'lines'> = {}): DialogueNode =>
  ({ id, lines, ...rest });

/** Dialog aus Knoten; Start ist der erste Knoten. */
export const dlg = (id: string, nodes: DialogueNode[]): DialogueDef => ({ id, start: nodes[0]!.id, nodes });

/** Sammelt Dialoge in einen Record nach ID. */
export const dialogs = (...list: DialogueDef[]): Record<string, DialogueDef> =>
  Object.fromEntries(list.map((d) => [d.id, d]));

/** Eingebetteter Check für Herz-Ereignisse (world.md nennt dort keine gc-Nummer). */
export const chk = (id: string, attribute: AttributeId, threshold: number, tags: string[] = []): CheckDef =>
  ({ id, attribute, threshold, tags });

/** Beziehungseffekt. */
export const herz = (npc: NpcId, delta: number): Effect => ({ relation: npc, delta });

/** Uhrzeiten in Minuten seit 0:00 (Spieluhr 06:00 = 360 … 02:00 = 1560). */
export const UHR = (h: number, m = 0): number => h * 60 + m;

export const VEX: Condition = { playerIs: 'vex' };
export const NICHT_VEX: Condition = { not: { playerIs: 'vex' } };
export const AKT2: Condition = { act: 2 };
export const VOR_AKT2: Condition = { not: { act: 2 } };

/** Straßenkinder dürfen bis 20 Uhr draußen sein (world.md §3.8); danach Nest. */
export const KINDERZEIT: Condition = { clockBetween: [UHR(6), UHR(20)] };
export const NACH_ZWANZIG: Condition = { clockBetween: [UHR(20), UHR(26)] };

/** Herkunft-Bedingungen (world.md §2.2). */
export const GOSSE: Condition = { origin: 'origin-gossenkind' };
export const OEDNIS: Condition = { origin: 'origin-oednis' };
export const EXWACHE: Condition = { origin: 'origin-ex-wache' };
export const SCHROTT: Condition = { origin: 'origin-schrott' };
export const KNAST: Condition = { origin: 'origin-knastvogel' };
export const OBERSTADT: Condition = { origin: 'origin-oberstadt' };

/**
 * Hinweis „Diese Freundschaft braucht noch Zeit“ (world.md §11.2): einmalig ab ♥8 in Akt 1, danach normale Gespräche.
 * Talk-Eintrag: `{ dialogue: id, minHearts: 8, when: zeitHinweisWann(id) }`.
 */
export const zeitHinweisWann = (id: string): Condition => ({ all: [VOR_AKT2, { not: { seen: id } }] });

export function zeitHinweis(id: string, lines: DialogueLine[]): DialogueDef {
  return dlg(id, [
    node('a', [...lines, N('Diese Freundschaft braucht noch Zeit. (Herz-Ereignisse ab ♥8 folgen in Akt 2.)')], {
      effects: [{ markSeen: id }],
    }),
  ]);
}

// ------------------------------------------------------------------------------------------- Akt 2, Akt 3, Nachspiel
// Phasen nach act23.json (Flags) und world.md §5.3–5.5. „act: n“ heißt Akt ≥ n; das Nachspiel ist das Flag `epilog`.

export const AKT3: Condition = { act: 3 };
export const NUR_AKT2: Condition = { all: [AKT2, { not: AKT3 }] };
export const EPILOG: Condition = { flag: 'epilog' };
/** Ende 3 ohne 3b: Unterstadt feindselig, Crew-Quests gesperrt. */
export const MASTER: Condition = { all: [{ flag: 'master_modus' }, { notFlag: 'ende_doch_noch_meer' }] };
export const NICHT_MASTER: Condition = { not: MASTER };
/** Partynacht (Akt 3 läuft, Nachspiel noch nicht). */
export const PARTYNACHT: Condition = { all: [AKT3, { notFlag: 'epilog' }] };
/** Dante ist in der Crew, Aria wach (main-2-countdown erledigt). */
export const DANTE_DA: Condition = { any: [{ flag: 'dante_beigetreten' }, { quest: 'main-2-countdown', state: 'done' }] };
/** Releaseparty ist beschlossen (main-2-krisensitzung). */
export const PARTY_GEPLANT: Condition = { any: [{ flag: 'releaseparty_geplant' }, { quest: 'main-2-krisensitzung', state: 'done' }] };
/** Nach dem Bruch, bevor Aria zurück und Dante dabei ist: Chip-Panik, Drohnen, Nyra weg. */
export const A2_CHAOS: Condition = { all: [NUR_AKT2, { not: DANTE_DA }] };
/** Freie Phase Akt 2: Dante in der Crew, Chrome 10 überall, Party noch nicht beschlossen. */
export const A2_FREI: Condition = { all: [NUR_AKT2, DANTE_DA, { not: PARTY_GEPLANT }] };
/** Akt 2 bis zur Party, egal welche Phase. */
export const A2_OFFEN: Condition = { all: [NUR_AKT2, { not: PARTY_GEPLANT }] };
/** Party-Vorbereitungen laufen (Akt 2, Party beschlossen). */
export const A2_PARTY: Condition = { all: [NUR_AKT2, PARTY_GEPLANT] };
export const ARIA_GECHIPPT: Condition = { flag: 'aria_gechippt' };
export const NYRA_BEFREIT: Condition = { flag: 'nyra_befreit' };
/** Nachspiel nach Ende 1, 2 oder 3b. */
export const NACHSPIEL: Condition = { all: [EPILOG, NICHT_MASTER] };
export const ENDE_MEER: Condition = { any: [{ flag: 'ende_meer' }, { flag: 'ende_doch_noch_meer' }] };
export const ENDE_NEXUS: Condition = { flag: 'ende_neue_nexus' };
export const ENDE_3B: Condition = { flag: 'ende_doch_noch_meer' };
/** Herz-Ereignisse 8/10: ab Akt 2, nicht in der Partynacht, nicht im Master-Modus. */
export const HERZ_SPAET: Condition = { all: [AKT2, { not: PARTYNACHT }, NICHT_MASTER] };
/** Einmal-Gespräch: noch nicht gesehen. Dazu gehört `{ markSeen: id }` im ersten Knoten. */
export const einmal = (id: string, when: Condition): Condition => ({ all: [when, { not: { seen: id } }] });
/** Die Kinder kommen im Nachspiel samstags mit ans Meer (in einem Nachspiel-Gespräch eingeladen). */
export const KINDER_MEER: Condition = { all: [NACHSPIEL, { flag: 'kinder_meer_dabei' }] };
