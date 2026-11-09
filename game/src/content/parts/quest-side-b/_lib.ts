// Schreibhilfen für die Akt-1-Nebenquests §6.2 Nr. 12–22 (quest-side-b). Reine Bausteine, keine Inhaltsdatei.
import type {
  CheckDef, Condition, CutsceneBeat, DialogueChoice, DialogueLine, DialogueNode, Effect, Expression, SpeakerId, TimeSlot,
} from '../../../modules/contracts';

/** Dialogzeile mit optionalem Ausdruck. */
export const L = (speaker: SpeakerId, text: string, expr?: Expression): DialogueLine =>
  expr ? { speaker, text, expr } : { speaker, text };
/** Erzählzeile. */
export const N = (text: string): DialogueLine => ({ speaker: 'narrator', text });
/** Zeile der Spielfigur. */
export const P = (text: string, expr?: Expression): DialogueLine => L('player', text, expr);

/** Dialogknoten. */
export const node = (id: string, lines: DialogueLine[], rest: Omit<DialogueNode, 'id' | 'lines'> = {}): DialogueNode =>
  ({ id, lines, ...rest });

/** Erzähltafel auf Schwarz (keine eigene Plate vorhanden). */
export const tafel = (caption: string, lines?: DialogueLine[], fade?: CutsceneBeat['fade']): CutsceneBeat =>
  ({ image: 'black', caption, ...(lines ? { lines } : {}), ...(fade ? { fade } : {}) });

// ---------------------------------------------------------------------------- Bedingungen
export const flag = (name: string): Condition => ({ flag: name });
export const noFlag = (name: string): Condition => ({ notFlag: name });
export const all = (...list: Condition[]): Condition => ({ all: list });
export const any = (...list: Condition[]): Condition => ({ any: list });
export const not = (c: Condition): Condition => ({ not: c });
export const active = (quest: string): Condition => ({ quest, state: 'active' });
export const done = (quest: string): Condition => ({ quest, state: 'done' });
export const inactive = (quest: string): Condition => ({ quest, state: 'inactive' });
export const time = (...slots: TimeSlot[]): Condition => ({ time: slots });
export const hearts = (npc: string, min: number): Condition => ({ hearts: npc, min });
export const item = (id: string, min?: number): Condition => (min ? { item: id, min } : { item: id });
export const step = (quest: string, id: string): Condition => ({ questStep: quest, step: id });

/** Spielfigur ist Vex Schrapnell (eigene Antwortzeilen). */
export const VEX: Condition = { playerIs: 'vex' };
export const NICHT_VEX: Condition = not(VEX);
/** Vex × Aria, Romanzefassung angebahnt oder zusammen (Flags aus parts/vexaria, world.md §4.7). */
export const VEXARIA: Condition = all(VEX, { romance: 'aria' }, any(flag('aria_romanze_angebahnt'), flag('aria_romanze_zusammen')));
/** Vex × Aria, Romanzefassung „zusammen“ (nach dem Kuss). */
export const VEXARIA_ZUSAMMEN: Condition = all(VEX, { romance: 'aria' }, flag('aria_romanze_zusammen'));
/** Vex ohne Romanzefassung (Rivalinnen-Ton, Sticheleien). */
export const VEX_OHNE_ROM: Condition = all(VEX, not(VEXARIA));

// ---------------------------------------------------------------------------- Effekte
export const set = (name: string, value?: boolean): Effect => (value === undefined ? { setFlag: name } : { setFlag: name, value });
export const rel = (npc: string, delta: number): Effect => ({ relation: npc, delta });
export const msg = (text: string): Effect => ({ message: text });
export const xp = (n: number): Effect => ({ xp: n });

/** Wahl ohne Check, Bedingung und Voraussetzung (Pflicht neben jeder Check-Wahl, content.test.ts). */
export const bye = (text = 'Später.'): DialogueChoice => ({ text });

/** Eingebetteter Welt-Check ohne gc-ID (world.md nennt keine). */
export const welt = (id: string, attribute: CheckDef['attribute'], threshold: number, tags: string[], label: string): CheckDef =>
  ({ id, attribute, threshold, tags, label });

/** Uhrzeit in Minuten seit 0:00. */
export const UHR = (h: number, m = 0): number => h * 60 + m;
