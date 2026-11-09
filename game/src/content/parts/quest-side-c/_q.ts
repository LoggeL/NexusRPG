// Schreibhilfen für die Akt-1-Nebenquests §6.2 Nr. 23–31 und 50 (Ordner quest-side-c).
// Keine Inhaltsdatei: nur Bausteine für die Questdateien in diesem Ordner.
import type {
  CheckDef, Condition, DialogueChoice, DialogueDef, DialogueLine, DialogueNode, Effect, Expression, SpeakerId,
} from '../../../modules/contracts';

/** Dialogzeile mit optionalem Ausdruck. */
export const l = (speaker: SpeakerId, text: string, expr?: Expression): DialogueLine =>
  expr ? { speaker, text, expr } : { speaker, text };
/** Erzählzeile. */
export const n = (text: string): DialogueLine => ({ speaker: 'narrator', text });
/** Zeile der Spielfigur. */
export const p = (text: string, expr?: Expression): DialogueLine => l('player', text, expr);

/** Dialogknoten. */
export const node = (id: string, lines: DialogueLine[], rest: Omit<DialogueNode, 'id' | 'lines'> = {}): DialogueNode =>
  ({ id, lines, ...rest });
/** Dialog mit Startknoten = erster Knoten. */
export const dlg = (id: string, nodes: DialogueNode[]): DialogueDef => ({ id, start: nodes[0].id, nodes });
/** Wahl. */
export const ch = (text: string, next?: string, rest: Omit<DialogueChoice, 'text' | 'next'> = {}): DialogueChoice =>
  next ? { text, next, ...rest } : { text, ...rest };

/** Eingebetteter Check für Wege, die world.md ohne gc-ID nennt. */
export const chk = (id: string, attribute: CheckDef['attribute'], threshold: number, tags: string[] = []): CheckDef =>
  ({ id, attribute, threshold, tags });

// Bedingungen
export const active = (quest: string): Condition => ({ quest, state: 'active' });
export const done = (quest: string): Condition => ({ quest, state: 'done' });
export const inactive = (quest: string): Condition => ({ quest, state: 'inactive' });
export const flag = (name: string): Condition => ({ flag: name });
export const noFlag = (name: string): Condition => ({ notFlag: name });
export const all = (...list: Condition[]): Condition => ({ all: list });
export const any = (...list: Condition[]): Condition => ({ any: list });
export const not = (c: Condition): Condition => ({ not: c });
export const hearts = (npc: string, min: number): Condition => ({ hearts: npc, min });
export const item = (id: string, min?: number): Condition => (min ? { item: id, min } : { item: id });

/** Spielfigur ist Vex Schrapnell (design.md §3.1b). */
export const VEX: Condition = { playerIs: 'vex' };
export const NOT_VEX: Condition = not(VEX);
/** Aria-Romanze angebahnt (world.md §4.7, Wert-Flag-Konvention aria_romanze_<wert>). */
export const ARIA_ROM: Condition = all({ romance: 'aria' }, flag('aria_romanze_angebahnt'));
export const VEXARIA_ROM: Condition = all(VEX, ARIA_ROM);

// Effekte
export const set = (name: string, value?: boolean): Effect => (value === false ? { setFlag: name, value } : { setFlag: name });
export const herz = (npc: string, delta: number): Effect => ({ relation: npc, delta });
export const msg = (text: string): Effect => ({ message: text });
export const step = (quest: string, id: string): Effect => ({ questStep: quest, step: id });

/** „Mindestens k von n“ (Engine-Bedingung `atLeast`). */
export function atLeast(k: number, conditions: Condition[]): Condition {
  return { atLeast: conditions, min: k };
}
