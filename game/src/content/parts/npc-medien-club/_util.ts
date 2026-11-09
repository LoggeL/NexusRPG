// Bausteine für die Figuren Ripper, Barkeeper, Kameramann, Collin Charleston und Delya Delloraine.
// Keine Inhaltsdatei (kein `part`), nur Hilfen für die Dateien in diesem Ordner.
import type {
  AttributeId, CheckDef, Condition, CutsceneBeat, CutsceneDef, DialogueChoice, DialogueDef, DialogueLine,
  DialogueNode, Effect, Expression, SpeakerId, TalkDef,
} from '../../../modules/contracts';

/** Zeilenbauer je Sprecher: `R('Text', 'wut')`. */
export const sp = (speaker: SpeakerId) => (text: string, expr?: Expression): DialogueLine =>
  expr ? { speaker, text, expr } : { speaker, text };

export const ich = sp('player');
export const erz = sp('narrator');

/** Eingebetteter Check mit eindeutiger ID. */
export const chk = (id: string, attribute: AttributeId, threshold: number, tags?: string[]): CheckDef =>
  tags ? { id, attribute, threshold, tags } : { id, attribute, threshold };

export const node = (id: string, lines: DialogueLine[], rest: Omit<DialogueNode, 'id' | 'lines'> = {}): DialogueNode =>
  ({ id, lines, ...rest });

export const dlg = (id: string, nodes: DialogueNode[], start = 'start'): DialogueDef => ({ id, start, nodes });

export const byId = <T extends { id: string }>(list: T[]): Record<string, T> =>
  Object.fromEntries(list.map((x) => [x.id, x]));

export const talk = (dialogue: string, when?: Condition, minHearts?: number): TalkDef => {
  const t: TalkDef = { dialogue };
  if (when) t.when = when;
  if (minHearts !== undefined) t.minHearts = minHearts;
  return t;
};

// Bedingungen
export const all = (...list: Condition[]): Condition => ({ all: list });
export const any = (...list: Condition[]): Condition => ({ any: list });
export const not = (c: Condition): Condition => ({ not: c });
export const seen = (id: string): Condition => ({ seen: id });
export const flag = (f: string): Condition => ({ flag: f });
export const noFlag = (f: string): Condition => ({ notFlag: f });
export const hearts = (npc: string, min: number): Condition => ({ hearts: npc, min });
export const VEX: Condition = { playerIs: 'vex' };
export const NOT_VEX: Condition = { not: VEX };
export const AKT2: Condition = { act: 2 };
export const AKT1: Condition = { not: { act: 2 } };
/** Vex × Aria sind zusammen (Kuss gesehen oder Status zusammen). */
export const VEXARIA: Condition = { all: [VEX, { any: [{ flag: 'aria_kuss' }, { flag: 'aria_romanze_zusammen' }] }] };
/** Irgendeine gemeinsame Nacht mit einer Romanzefigur (Flags `<npc>_nacht`, world.md §4.7). */
export const IRGENDEINE_NACHT: Condition = {
  any: ['aria_nacht', 'hunter_nacht', 'dante_nacht', 'collin-charleston_nacht', 'collin_nacht', 'lio-funkel_nacht', 'lio_nacht']
    .map((f) => ({ flag: f })),
};

// Effekte
export const rel = (npc: string, delta: number): Effect => ({ relation: npc, delta });
export const set = (f: string, value = true): Effect => (value ? { setFlag: f } : { setFlag: f, value: false });
export const xp = (n: number): Effect => ({ xp: n });
export const msg = (text: string): Effect => ({ message: text });
export const rep = (faction: string, delta: number): Effect => ({ rep: faction, delta });

/** Abblende auf Schwarz (Romanzen: Nacht nur angedeutet). */
export const abblende = (caption: string): CutsceneBeat => ({ image: 'black', fade: 'out', caption, hold: 1600 });

export const cut = (id: string, title: string, beats: CutsceneBeat[], effects?: Effect[]): CutsceneDef =>
  effects ? { id, title, beats, effects } : { id, title, beats };

/** Hinweis für Herz-Ereignisse 8/10 in Akt 1 (world.md §11.2). */
export const ZEIT_HINWEIS = 'Diese Freundschaft braucht noch Zeit. (Weiter mit Akt 2.)';

/** Menü eines Tagesgesprächs: gemeinsame Wahlen und Folgeknoten. */
export interface Menu { choices: DialogueChoice[]; nodes: DialogueNode[] }

/**
 * Tagesgespräch: eigene Begrüßung + eigener Plausch je Variante, gemeinsames Menü.
 * Knoten: start (Gruß) → plausch → Menü-Knoten.
 */
export function daily(
  id: string, gruss: DialogueLine[], plausch: DialogueLine[], menu: Menu,
  opts: { plauschText?: string; effects?: Effect[] } = {},
): DialogueDef {
  const start = node('start', gruss, { choices: [{ text: opts.plauschText ?? 'Und sonst so?', next: 'plausch', id: 'plausch' }, ...menu.choices] });
  if (opts.effects) start.effects = opts.effects;
  return dlg(id, [start, node('plausch', plausch, { choices: menu.choices }), ...menu.nodes]);
}
