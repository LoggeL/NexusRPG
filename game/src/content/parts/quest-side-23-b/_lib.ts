// Schreibhilfen für die Akt-2-Nebenquests §6.3 Nr. 40–46 (Ordner quest-side-23-b).
// Keine Inhaltsdatei: nur Bausteine für die Questdateien in diesem Ordner.
import type {
  AttributeId, CheckBuff, CheckDef, Condition, CutsceneBeat, DialogueChoice, DialogueDef, DialogueLine, DialogueNode,
  Effect, Expression, SpeakerId, TimeSlot,
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
export const chk = (id: string, attribute: AttributeId, threshold: number, tags: string[] = []): CheckDef =>
  ({ id, attribute, threshold, tags });

// ---------------------------------------------------------------------------------------------- Bedingungen

export const active = (quest: string): Condition => ({ quest, state: 'active' });
export const done = (quest: string): Condition => ({ quest, state: 'done' });
export const inactive = (quest: string): Condition => ({ quest, state: 'inactive' });
export const flag = (name: string): Condition => ({ flag: name });
export const noFlag = (name: string): Condition => ({ notFlag: name });
export const item = (id: string, min?: number): Condition => (min ? { item: id, min } : { item: id });
export const noItem = (id: string): Condition => ({ noItem: id });
export const all = (...list: Condition[]): Condition => ({ all: list });
export const any = (...list: Condition[]): Condition => ({ any: list });
export const not = (c: Condition): Condition => ({ not: c });
export const hearts = (npc: string, min: number): Condition => ({ hearts: npc, min });
export const companion = (npc: string): Condition => ({ companion: npc });
export const won = (encounter: string): Condition => ({ won: encounter });
export const time = (...slots: TimeSlot[]): Condition => ({ time: slots.length === 1 ? slots[0] : slots });
export const seen = (id: string): Condition => ({ seen: id });

export const ACT2: Condition = { act: 2 };
/** Tagsüber bis abends (die meisten Auftraggeber stehen da). */
export const WACH: Condition = time('morgen', 'tag', 'abend');

/** Spielfigur ist Vex Schrapnell (design.md §3.1b). */
export const VEX: Condition = { playerIs: 'vex' };
export const NOT_VEX: Condition = not(VEX);
/** Aria ist mit in der Party (in Akt 2 nicht selbstverständlich: Variante A, gechippt). */
export const ARIA_DA: Condition = companion('aria');

// ---------------------------------------------------------------------------------------------- Effekte

export const set = (name: string, value?: boolean): Effect => (value === false ? { setFlag: name, value } : { setFlag: name });
export const herz = (npc: string, delta: number): Effect => ({ relation: npc, delta });
export const msg = (text: string): Effect => ({ message: text });
export const rep = (faction: string, delta: number): Effect => ({ rep: faction, delta });
export const buff = (b: Omit<CheckBuff, 'untilDay'>): Effect => ({ checkBuff: b });

// ---------------------------------------------------------------------------------------------- Cutscenes

/** Erzähltafel ohne eigenes Bild (Schwarzbild mit Unterschrift). */
export const tafel = (caption: string, rest: Omit<CutsceneBeat, 'caption' | 'image'> = {}): CutsceneBeat =>
  ({ image: 'black', caption, ...rest });
/** Bild-Beat (Kartenhintergrund oder Tafel) mit Kamerafahrt. */
export const bild = (image: string, rest: Omit<CutsceneBeat, 'image'> = {}): CutsceneBeat => ({ image, ...rest });
