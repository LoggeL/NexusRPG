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
