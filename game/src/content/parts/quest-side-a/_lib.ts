// Kleine Helfer für die Akt-1-Nebenquests Nr. 1–11 (quest-side-a). Keine eigene `part`-Ausfuhr: wird nur importiert.
import type {
  Condition, DialogueChoice, DialogueDef, DialogueLine, DialogueNode, Effect, Expression, SpeakerId, TimeSlot,
} from '../../../modules/contracts';
import type { MapAddition } from '../../part';

/** Dialogzeile mit optionalem Ausdruck. */
export const l = (speaker: SpeakerId, text: string, expr?: Expression): DialogueLine =>
  expr ? { speaker, text, expr } : { speaker, text };
/** Erzählzeile. */
export const nar = (text: string): DialogueLine => ({ speaker: 'narrator', text });
/** Spielfigur. */
export const ich = (text: string, expr?: Expression): DialogueLine => l('player', text, expr);

/** Knoten kurz. */
export const node = (
  id: string, lines: DialogueLine[], extra: Omit<DialogueNode, 'id' | 'lines'> = {},
): DialogueNode => ({ id, lines, ...extra });
export const dlg = (id: string, nodes: DialogueNode[], start = nodes[0].id): DialogueDef => ({ id, start, nodes });
/** Gesprächsende ohne weitere Wirkung. */
export const tschuess = (text = '„Später.“'): DialogueChoice => ({ text });

// ---------------------------------------------------------------------------------------------- Bedingungen

export const active = (quest: string): Condition => ({ quest, state: 'active' });
export const done = (quest: string): Condition => ({ quest, state: 'done' });
export const inactive = (quest: string): Condition => ({ quest, state: 'inactive' });
export const step = (quest: string, id: string): Condition => ({ questStep: quest, step: id });
export const flag = (name: string): Condition => ({ flag: name });
export const noFlag = (name: string): Condition => ({ notFlag: name });
export const all = (...c: Condition[]): Condition => ({ all: c });
export const any = (...c: Condition[]): Condition => ({ any: c });
export const not = (c: Condition): Condition => ({ not: c });
export const time = (...slots: TimeSlot[]): Condition => ({ time: slots });
export const hearts = (npc: string, min: number): Condition => ({ hearts: npc, min });
export const item = (id: string, min?: number): Condition => (min ? { item: id, min } : { item: id });

/** Spielfigur ist Vex Schrapnell. */
export const VEX: Condition = { playerIs: 'vex' };
/** Vex × Aria angebahnt und Aria in der Party (Romanzefassung, world.md §4.7). */
export const VEXARIA_DABEI: Condition = all(VEX, { romance: 'aria' }, flag('aria_romanze_angebahnt'), { companion: 'aria' });
/** Aria in der Party (ohne Romanze). */
export const ARIA_DABEI: Condition = { companion: 'aria' };

/** Alle k-Kombinationen (für „mindestens k von n Gegenständen“). */
export function kombinationen<T>(list: readonly T[], k: number): T[][] {
  if (k === 0) return [[]];
  if (list.length < k) return [];
  const [head, ...rest] = list;
  return [...kombinationen(rest, k - 1).map((c) => [head, ...c]), ...kombinationen(rest, k)];
}
/** „Mindestens k verschiedene der Gegenstände“ (Engine-Bedingung `atLeast`). */
export const mindestens = (items: readonly string[], k: number): Condition =>
  ({ atLeast: items.map((id) => ({ item: id })), min: k });

// ---------------------------------------------------------------------------------------------- Effekte

export const set = (name: string, value = true): Effect => (value ? { setFlag: name } : { setFlag: name, value: false });
export const herz = (npc: string, delta: number): Effect => ({ relation: npc, delta });
export const msg = (text: string): Effect => ({ message: text });
export const xp = (amount: number): Effect => ({ xp: amount });

/** Hotspot für `mapAdditions` (at darf ein Spot-Name sein). */
export type AddHotspot = NonNullable<MapAddition['hotspots']>[number];
export type AddEncounter = NonNullable<MapAddition['encounters']>[number];
