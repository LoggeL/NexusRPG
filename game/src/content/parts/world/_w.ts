// Bausteine für die Welt-Systeme (Bezirke, Fraktionen, Nachrichten, Telefon, Stadtereignisse).
// Keine eigene Inhaltsdatei (exportiert keinen Inhaltsteil).
import type {
  CheckDef, Condition, DialogueLine, Effect, Expression, NewsDef, PhoneMessageDef, SpeakerId, Weekday,
} from '../../../modules/contracts';

// ---------------------------------------------------------------------------
// Bedingungen

export const all = (...list: Condition[]): Condition => ({ all: list });
export const any = (...list: Condition[]): Condition => ({ any: list });
export const not = (c: Condition): Condition => ({ not: c });
export const flag = (f: string): Condition => ({ flag: f });
export const done = (quest: string): Condition => ({ quest, state: 'done' });
export const active = (quest: string): Condition => ({ quest, state: 'active' });
export const day = (weekday: Weekday | readonly Weekday[]): Condition => ({ weekday });
export const cycle = (...days: number[]): Condition => ({ cycleDay: days });
export const range = (from: number, to: number): number[] => Array.from({ length: to - from + 1 }, (_, i) => from + i);
/** Nur Akt 1 (vor dem Akt-2-Morgen). */
export const AKT1: Condition = { not: { act: 2 } };
export const AKT2: Condition = { act: 2 };
export const AKT3: Condition = { act: 3 };
/** Spielfigur ist Vex. */
export const VEX: Condition = { playerIs: 'vex' };

/**
 * Festkalender (world.md §3.4): 28-Tage-Zyklus, Tag 1 ist Montag. Die Festtage 7/14/21/28 fallen deshalb immer
 * auf einen Sonntag: Neonnacht (1. Sonntag), Karten-Turnier (2.), Gründertag (3.), Schrottparade (4.).
 */
export const NEONNACHT = cycle(7);
export const KARTEN_TURNIER = cycle(14);
export const GRUENDERTAG = cycle(21);
export const SCHROTTPARADE = cycle(28);

/** „Wetterlage“ als fester Zyklus, solange die Engine kein Wetter kennt (design/plan/gaps/world.md). */
export const WETTER_SMOG = cycle(2, 9, 16, 23);
export const WETTER_NEONSCHAUER = cycle(3, 10, 17, 24);
export const WETTER_ROSTREGEN = cycle(5, 12, 19, 26);
export const WETTER_KLAR = cycle(1, 8, 15, 22);

// ---------------------------------------------------------------------------
// Zeilen und Effekte

export const say = (speaker: SpeakerId, text: string, expr?: Expression): DialogueLine =>
  (expr ? { speaker, text, expr } : { speaker, text });
export const nar = (text: string): DialogueLine => ({ speaker: 'narrator', text });
export const ich = (text: string, expr?: Expression): DialogueLine => say('player', text, expr);

export const xp = (amount: number): Effect => ({ xp: amount });
export const rep = (faction: string, delta: number): Effect => ({ rep: faction, delta });
export const cr = (credits: number): Effect => ({ credits });
export const msg = (message: string): Effect => ({ message });
export const herz = (npc: string, delta: number): Effect => ({ relation: npc, delta });

/** Eingebetteter Welt-Check (IDs mit Präfix `welt-`, damit sie nie mit gc-… kollidieren). */
export const wcheck = (id: string, attribute: CheckDef['attribute'], threshold: number, extra: Partial<CheckDef> = {}): CheckDef =>
  ({ id: `welt-${id}`, attribute, threshold, ...extra });

// ---------------------------------------------------------------------------
// Sammlungen

export const byId = <T extends { id: string }>(list: readonly T[]): Record<string, T> =>
  Object.fromEntries(list.map((item) => [item.id, item]));

/** Sendung mit einer oder mehreren Zeilen; der erste Sprecher ist der Anker. */
export const sendung = (id: string, headline: string, lines: DialogueLine[], when?: Condition, priority = 0): NewsDef => {
  const anchor = lines.find((l) => l.speaker !== 'narrator' && l.speaker !== 'player')?.speaker ?? 'collin-charleston';
  const def: NewsDef = { id, anchor, headline, lines };
  if (when) def.when = when;
  if (priority) def.priority = priority;
  return def;
};

export const sms = (id: string, from: string, text: string, auto?: Condition, replies?: PhoneMessageDef['replies']): PhoneMessageDef => {
  const def: PhoneMessageDef = { id, from, text };
  if (auto) def.auto = auto;
  if (replies) def.replies = replies;
  return def;
};
