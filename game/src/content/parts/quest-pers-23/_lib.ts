// Helfer für persönliche Quests Akt 2/3/Nachspiel, Hunters Sonderaufträge, neue Auftragsvorlagen und Kopfgelder Stufe 3
// (quest-pers-23). Kein eigener Inhaltsteil: exportiert kein `part`.
import type {
  AttributeId, CheckDef, Condition, CutsceneBeat, CutsceneDef, DialogueChoice, DialogueDef, DialogueLine, DialogueNode,
  Effect, Expression, HotspotDef, ItemDef, NpcPlacement, PanMode, PhoneMessageDef, QuestStepDef, SpeakerId, TimeSlot, Weekday,
} from '../../../modules/contracts';
import type { At, MapAddition } from '../../part';

// ------------------------------------------------------------------------------------------- Zeilen

export const L = (speaker: SpeakerId, text: string, expr?: Expression): DialogueLine =>
  expr ? { speaker, text, expr } : { speaker, text };
/** Erzählzeile. */
export const N = (text: string): DialogueLine => ({ speaker: 'narrator', text });
/** Spielfigur. */
export const P = (text: string, expr?: Expression): DialogueLine => L('player', text, expr);

// ------------------------------------------------------------------------------------------- Dialoge

export const node = (id: string, lines: DialogueLine[], rest: Omit<DialogueNode, 'id' | 'lines'> = {}): DialogueNode =>
  ({ id, lines, ...rest });
export const dlg = (id: string, nodes: DialogueNode[], start = 'start'): DialogueDef => ({ id, start, nodes });
export const byId = <T extends { id: string }>(...list: T[]): Record<string, T> =>
  Object.fromEntries(list.map((x) => [x.id, x]));

/** Eingebetteter Check mit eindeutiger ID (Präfix p23-). */
export const chk = (id: string, attribute: AttributeId, threshold: number, tags?: string[]): CheckDef =>
  tags ? { id: `p23-${id}`, attribute, threshold, tags } : { id: `p23-${id}`, attribute, threshold };

/** Auswahl kurz: `c('Text', 'ziel', { effects })`. */
export const c = (text: string, next?: string, rest: Omit<DialogueChoice, 'text' | 'next'> = {}): DialogueChoice =>
  next ? { text, next, ...rest } : { text, ...rest };
/** Wahl mit Check: `[Technik 6]` erscheint automatisch über den Check. */
export const cc = (text: string, next: string | undefined, check: CheckDef, rest: Omit<DialogueChoice, 'text' | 'next' | 'check'> = {}): DialogueChoice =>
  c(text, next, { check, ...rest });
export const bye = (text = 'Gehen.'): DialogueChoice => ({ text });

// ------------------------------------------------------------------------------------------- Bedingungen

export const active = (quest: string): Condition => ({ quest, state: 'active' });
export const done = (quest: string): Condition => ({ quest, state: 'done' });
export const inactive = (quest: string): Condition => ({ quest, state: 'inactive' });
export const stepDone = (quest: string, step: string): Condition => ({ questStep: quest, step });
export const flag = (name: string): Condition => ({ flag: name });
export const noFlag = (name: string): Condition => ({ notFlag: name });
export const all = (...list: Condition[]): Condition => ({ all: list });
export const any = (...list: Condition[]): Condition => ({ any: list });
export const not = (cond: Condition): Condition => ({ not: cond });
export const hearts = (npc: string, min: number): Condition => ({ hearts: npc, min });
export const item = (id: string, min = 1): Condition => (min === 1 ? { item: id } : { item: id, min });
export const noItem = (id: string): Condition => ({ noItem: id });
export const time = (...slots: TimeSlot[]): Condition => ({ time: slots.length === 1 ? slots[0] : slots });
export const job = (id: string): Condition => ({ job: id });
export const seen = (id: string): Condition => ({ seen: id });
export const won = (id: string): Condition => ({ won: id });
export const credits = (n: number): Condition => ({ credits: n });
export const companion = (npc: string): Condition => ({ companion: npc });
export const romance = (npc: string): Condition => ({ romance: npc });
export const tage = (...days: Weekday[]): Condition => ({ weekday: days.length === 1 ? days[0] : days });
export const VEX: Condition = { playerIs: 'vex' };
export const NICHT_VEX: Condition = { not: VEX };

export const ACT2: Condition = { act: 2 };
export const ACT3: Condition = { act: 3 };
/** Nachspiel (world.md §5.5): Flag `epilog`. */
export const EPILOG: Condition = { flag: 'epilog' };
/** Ende 3 „Master“ (Master-Modus: Crew-Quests gesperrt). */
export const MASTER: Condition = all({ flag: 'ende_master' }, { notFlag: 'ende_doch_noch_meer' });
/** Akt 2 frei unterwegs: nicht in der Partynacht von Akt 3, nicht im Master-Modus. */
export const FREI: Condition = all(ACT2, any(not(ACT3), EPILOG), not(MASTER));
/** Nachspiel ohne Master-Modus. */
export const NACHSPIEL: Condition = all(EPILOG, not(MASTER));

/** Rang an Hunters Auftragstafel (world.md §6.6): Ruf crew-hunter 0/20/40/60/80. */
export const RANG_MIN = [0, 0, 20, 40, 60, 80] as const;
export const abRang = (rang: number): Condition => ({ rep: 'crew-hunter', min: RANG_MIN[rang] });

// ------------------------------------------------------------------------------------------- Effekte

export const rel = (npc: string, delta: number): Effect => ({ relation: npc, delta });
export const xp = (n: number): Effect => ({ xp: n });
export const cr = (n: number): Effect => ({ credits: n });
export const give = (id: string, qty = 1): Effect => (qty === 1 ? { give: id } : { give: id, qty });
export const take = (id: string, qty = 1): Effect => (qty === 1 ? { take: id } : { take: id, qty });
export const set = (name: string, value = true): Effect => (value ? { setFlag: name } : { setFlag: name, value: false });
export const msg = (text: string): Effect => ({ message: text });
export const rep = (faction: string, delta: number): Effect => ({ rep: faction, delta });
export const zeit = (minutes: number): Effect => ({ advanceTime: minutes });
export const fight = (encounter: string): Effect => ({ battle: encounter });
export const cut = (id: string): Effect => ({ cutscene: id });
export const startQ = (id: string): Effect => ({ startQuest: id });
export const fahndung = (n: number): Effect => ({ wanted: n });
export const spiel = (
  minigame: string, level: number, key: string, label: string, win: Effect[], lose: Effect[] = [],
): Effect => ({ minigame, level, key, label, win, lose });

// ------------------------------------------------------------------------------------------- Quests

/** Schritt, der über ein Flag erledigt wird. `marker` = [Karte, Spot]. */
export const schritt = (
  id: string, text: string, doneWhen: Condition | string, marker?: [string, string?], rest: Omit<QuestStepDef, 'id' | 'text' | 'done' | 'marker'> = {},
): QuestStepDef => ({
  id, text, done: typeof doneWhen === 'string' ? flag(doneWhen) : doneWhen,
  ...(marker ? { marker: marker[1] ? { map: marker[0], at: marker[1] } : { map: marker[0] } } : {}),
  ...rest,
});

// ------------------------------------------------------------------------------------------- Karten

export type Hotspot = Omit<HotspotDef, 'at'> & { at: At };
export type Placement = Omit<NpcPlacement, 'at'> & { at: At };

/** Gesprächs-Hotspot an einem Spot einer fremden Karte. */
export const rede = (id: string, at: At, label: string, dialogue: string, when?: Condition, rest: Partial<Hotspot> = {}): Hotspot =>
  ({ id, at, label, kind: 'talk', dialogue, ...(when ? { when } : {}), ...rest });
/** Benutzen-Hotspot (Gegenstand, Ort, Terminal). */
export const nutze = (id: string, at: At, label: string, dialogue: string, when?: Condition, rest: Partial<Hotspot> = {}): Hotspot =>
  ({ id, at, label, kind: 'use', dialogue, ...(when ? { when } : {}), ...rest });

/** Hinweis-Hotspot ohne Dialog (kurze Beschreibung). */
export const schau = (id: string, at: At, label: string, lines: DialogueLine[], when?: Condition, rest: Partial<Hotspot> = {}): Hotspot =>
  ({ id, at, label, kind: 'look', lines, ...(when ? { when } : {}), ...rest });

/** Story-Platzierung einer Figur (überschreibt den Tagesablauf, solange `when` gilt). */
export const stelle = (id: string, npc: string, at: At, dialogue: string | undefined, when: Condition): Placement =>
  dialogue ? { id, npc, at, dialogue, when } : { id, npc, at, when };

/** Sammelt Hotspots und Figuren je Karte zu mapAdditions. */
export function karten(list: ([string, Hotspot] | [string, Placement, 'npc'])[]): Record<string, MapAddition> {
  const out: Record<string, MapAddition> = {};
  for (const entry of list) {
    const add = (out[entry[0]] ??= {});
    if (entry.length === 3) (add.npcs ??= []).push(entry[1]);
    else (add.hotspots ??= []).push(entry[1]);
  }
  return out;
}

// ------------------------------------------------------------------------------------------- Szenen und Telefon

/** Erzähltafel (schwarz, mit Bildunterschrift). */
export const tafel = (caption: string, lines?: DialogueLine[], hold = 1200): CutsceneBeat =>
  lines ? { image: 'black', caption, lines, hold } : { image: 'black', caption, hold };
/** Bildtafel `cut-<id>` mit Kamerafahrt (fehlt das Bild, zeigt das Spiel einen Platzhalter). */
export const bild = (image: string, pan: PanMode, caption: string, lines?: DialogueLine[], hold = 1400): CutsceneBeat =>
  lines ? { image, pan, caption, lines, hold, fade: 'cross' } : { image, pan, caption, hold, fade: 'cross' };
export const szene = (id: string, title: string, beats: CutsceneBeat[], effects?: Effect[]): CutsceneDef =>
  effects ? { id, title, beats, effects } : { id, title, beats };

export const tel = (id: string, from: string, text: string, rest: Omit<PhoneMessageDef, 'id' | 'from' | 'text'> = {}): PhoneMessageDef =>
  ({ id, from, text, ...rest });

// ------------------------------------------------------------------------------------------- Gegenstände

/** Quest-Gegenstand (nicht verkäuflich). */
export const ding = (id: string, name: string, description: string, icon = 'kurierpaket', price = 0): ItemDef =>
  ({ id, name, description, category: 'quest', icon, price, sellable: false });
