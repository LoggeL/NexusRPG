// Helfer für persönliche Quests, Aufträge und Kopfgelder (quest-pers-jobs). Kein eigener Inhaltsteil: exportiert kein `part`.
import type {
  AttributeId, CheckDef, Condition, CutsceneBeat, CutsceneDef, DialogueChoice, DialogueDef, DialogueLine, DialogueNode,
  Effect, Expression, HotspotDef, NpcPlacement, PhoneMessageDef, QuestStepDef, SpeakerId, TimeSlot,
} from '../../../modules/contracts';
import type { At } from '../../part';

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

/** Eingebetteter Check mit eindeutiger ID (Präfix pj-). */
export const chk = (id: string, attribute: AttributeId, threshold: number, tags?: string[]): CheckDef =>
  tags ? { id: `pj-${id}`, attribute, threshold, tags } : { id: `pj-${id}`, attribute, threshold };

/** Auswahl kurz: `c('Text', 'ziel', { effects })`. */
export const c = (text: string, next?: string, rest: Omit<DialogueChoice, 'text' | 'next'> = {}): DialogueChoice =>
  next ? { text, next, ...rest } : { text, ...rest };
export const bye = (text = 'Gehen.'): DialogueChoice => ({ text, id: 'tschuess' });

// ------------------------------------------------------------------------------------------- Bedingungen

export const active = (quest: string): Condition => ({ quest, state: 'active' });
export const done = (quest: string): Condition => ({ quest, state: 'done' });
export const inactive = (quest: string): Condition => ({ quest, state: 'inactive' });
export const flag = (name: string): Condition => ({ flag: name });
export const noFlag = (name: string): Condition => ({ notFlag: name });
export const all = (...list: Condition[]): Condition => ({ all: list });
export const any = (...list: Condition[]): Condition => ({ any: list });
export const not = (cond: Condition): Condition => ({ not: cond });
export const hearts = (npc: string, min: number): Condition => ({ hearts: npc, min });
export const item = (id: string, min = 1): Condition => (min === 1 ? { item: id } : { item: id, min });
export const time = (...slots: TimeSlot[]): Condition => ({ time: slots.length === 1 ? slots[0] : slots });
export const job = (id: string): Condition => ({ job: id });
export const seen = (id: string): Condition => ({ seen: id });
export const credits = (n: number): Condition => ({ credits: n });
export const VEX: Condition = { playerIs: 'vex' };
export const NICHT_VEX: Condition = { not: VEX };

/** Rang an Hunters Auftragstafel (world.md §6.6): Ruf crew-hunter 0/20/40/60/80. */
export const RANG_MIN = [0, 0, 20, 40, 60, 80] as const;
export const abRang = (rang: number): Condition => ({ rep: 'crew-hunter', min: RANG_MIN[rang] });
export const genauRang = (rang: number): Condition =>
  rang >= 5 ? abRang(5) : all(abRang(rang), not(abRang(rang + 1)));

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

// ------------------------------------------------------------------------------------------- Quests

/** Schritt, der über ein Flag erledigt wird (der übliche Weg in diesem Ordner). */
export const schritt = (id: string, text: string, flagName: string, rest: Omit<QuestStepDef, 'id' | 'text' | 'done'> = {}): QuestStepDef =>
  ({ id, text, done: flag(flagName), ...rest });

// ------------------------------------------------------------------------------------------- Karten

export type Hotspot = Omit<HotspotDef, 'at'> & { at: At };
export type Placement = Omit<NpcPlacement, 'at'> & { at: At };

/** Gesprächs-Hotspot an einem Spot einer fremden Karte. */
export const spotTalk = (id: string, at: At, label: string, dialogue: string, when?: Condition, rest: Partial<Hotspot> = {}): Hotspot =>
  ({ id, at, label, kind: 'talk', dialogue, ...(when ? { when } : {}), ...rest });
export const spotUse = (id: string, at: At, label: string, dialogue: string, when?: Condition, rest: Partial<Hotspot> = {}): Hotspot =>
  ({ id, at, label, kind: 'use', dialogue, ...(when ? { when } : {}), ...rest });

/** Story-Platzierung einer Figur (überschreibt den Tagesablauf, solange `when` gilt). */
export const stelle = (id: string, npc: string, at: At, dialogue: string, when: Condition): Placement =>
  ({ id, npc, at, dialogue, when });

// ------------------------------------------------------------------------------------------- Szenen und Telefon

/** Erzähltafel (schwarz, mit Bildunterschrift). */
export const tafel = (caption: string, lines?: DialogueLine[], hold = 1200): CutsceneBeat =>
  lines ? { image: 'black', caption, lines, hold } : { image: 'black', caption, hold };
export const szene = (id: string, title: string, beats: CutsceneBeat[], effects?: Effect[]): CutsceneDef =>
  effects ? { id, title, beats, effects, gallery: false } : { id, title, beats, gallery: false };

export const tel = (id: string, from: string, text: string, rest: Omit<PhoneMessageDef, 'id' | 'from' | 'text'> = {}): PhoneMessageDef =>
  ({ id, from, text, ...rest });

// ------------------------------------------------------------------------------------------- Figuren-Knoten
//
// Viele Quests dieses Ordners brauchen dieselben Figuren (Gustav, Babette, Oma Volt …). Damit keine Figur doppelt
// auf der Karte steht, steuert jede Quest „Beiträge“ bei; `figuren.ts` baut daraus je Figur EIN Gespräch
// (`pj-hub-<npc>`) und setzt die Figur an ihre üblichen Plätze, solange irgendein Beitrag gebraucht wird.

export interface Beitrag {
  npc: string;
  /** Solange erfüllt, steht die Figur mit dem Sammelgespräch an ihren Plätzen; die Auswahl ist sichtbar. */
  when: Condition;
  /** Auswahl im Sammelgespräch. */
  text: string;
  /** Erster Knoten des Beitrags (ID aus `nodes`). */
  start: string;
  /** Knoten mit global eindeutigen IDs (Präfix der Quest). */
  nodes: DialogueNode[];
  tag?: string;
}

export const beitrag = (npc: string, when: Condition, text: string, nodes: DialogueNode[], start = nodes[0]?.id ?? 'start'): Beitrag =>
  ({ npc, when, text, start, nodes });

/** Zurück ins Sammelgespräch der Figur. */
export const nochWas = (text = 'Noch was anderes.'): DialogueChoice => ({ text, next: 'start', id: 'zurueck-hub' });
