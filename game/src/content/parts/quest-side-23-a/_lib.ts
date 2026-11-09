// Schreibhilfen für die Akt-2-Nebenquests §6.3 Nr. 32–38 (Ordner quest-side-23-a).
// Keine Inhaltsdatei: nur Bausteine für die Questdateien in diesem Ordner.
import type {
  CheckDef, Condition, CutsceneBeat, CutsceneDef, DialogueChoice, DialogueDef, DialogueLine, DialogueNode, Effect,
  Expression, PhoneMessageDef, SpeakerId,
} from '../../../modules/contracts';

// ---------------------------------------------------------------------------------------------- Zeilen und Knoten

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

/** Eingebetteter Check für Wege, die world.md ohne gc-ID nennt (eigene, sprechende ID). */
export const chk = (id: string, attribute: CheckDef['attribute'], threshold: number, tags: string[] = []): CheckDef =>
  ({ id, attribute, threshold, tags });

/** Cutscene. */
export const cut = (id: string, title: string, beats: CutsceneBeat[], effects?: Effect[]): CutsceneDef =>
  ({ id, title, beats, ...(effects ? { effects } : {}) });
/** Erzähltafel ohne Bild. */
export const tafel = (caption: string, hold = 2200): CutsceneBeat => ({ image: 'black', caption, fade: 'in', hold });

/** Record nach `id`. */
export const byId = <T extends { id: string }>(list: readonly T[]): Record<string, T> =>
  Object.fromEntries(list.map((entry) => [entry.id, entry]));

/** Telefonnachricht. */
export const phone = (id: string, from: string, text: string, rest: Omit<PhoneMessageDef, 'id' | 'from' | 'text'> = {}): PhoneMessageDef =>
  ({ id, from, text, ...rest });

// ---------------------------------------------------------------------------------------------- Bedingungen

export const active = (quest: string): Condition => ({ quest, state: 'active' });
export const done = (quest: string): Condition => ({ quest, state: 'done' });
export const inactive = (quest: string): Condition => ({ quest, state: 'inactive' });
export const stepDone = (quest: string, id: string): Condition => ({ questStep: quest, step: id });
export const flag = (name: string): Condition => ({ flag: name });
export const noFlag = (name: string): Condition => ({ notFlag: name });
export const all = (...list: Condition[]): Condition => ({ all: list });
export const any = (...list: Condition[]): Condition => ({ any: list });
export const not = (c: Condition): Condition => ({ not: c });
export const hearts = (npc: string, min: number): Condition => ({ hearts: npc, min });
export const item = (id: string, min?: number): Condition => (min ? { item: id, min } : { item: id });
export const noItem = (id: string): Condition => ({ noItem: id });
export const won = (encounter: string): Condition => ({ won: encounter });
export const seen = (id: string): Condition => ({ seen: id });
export const origin = (id: string): Condition => ({ origin: id });
export const zeit = (...slots: ('morgen' | 'tag' | 'abend' | 'nacht')[]): Condition => ({ time: slots });
export const atLeast = (min: number, list: Condition[]): Condition => ({ atLeast: list, min });

export const AKT2: Condition = { act: 2 };
export const EPILOG: Condition = flag('epilog');
export const NICHT_EPILOG: Condition = noFlag('epilog');
/** Freie Phase Akt 2 beginnt nach dem Countdown in Dantes Werkstatt (world.md §5.3). */
export const COUNTDOWN: Condition = done('main-2-countdown');
/** Spielfigur ist Vex Schrapnell (design.md §3.1b). */
export const VEX: Condition = { playerIs: 'vex' };
export const NOT_VEX: Condition = not(VEX);
/** Vex mit Aria in der Romanze (Wert-Flag-Konvention world.md §4.7). */
export const VEXARIA: Condition = all(VEX, { romance: 'aria' }, any(flag('aria_romanze_angebahnt'), flag('aria_romanze_zusammen')));

// ---------------------------------------------------------------------------------------------- Effekte

export const set = (name: string, value?: boolean): Effect => (value === false ? { setFlag: name, value } : { setFlag: name });
export const herz = (npc: string, delta: number): Effect => ({ relation: npc, delta });
export const msg = (text: string): Effect => ({ message: text });
export const xp = (amount: number): Effect => ({ xp: amount });
export const giveItem = (id: string, qty?: number): Effect => (qty ? { give: id, qty } : { give: id });
