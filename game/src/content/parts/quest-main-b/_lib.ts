// Kleine Helfer für den Hauptstrang Teil 2 (quest-main-b). Keine eigene `part`-Ausfuhr: wird nur importiert.
import type { Condition, DialogueLine, Expression, SpeakerId } from '../../../modules/contracts';

/** Dialogzeile mit optionalem Ausdruck. */
export const l = (speaker: SpeakerId, text: string, expr?: Expression): DialogueLine =>
  expr ? { speaker, text, expr } : { speaker, text };

/** Erzählzeile. */
export const nar = (text: string): DialogueLine => ({ speaker: 'narrator', text });

export const active = (quest: string): Condition => ({ quest, state: 'active' });
export const done = (quest: string): Condition => ({ quest, state: 'done' });
export const flag = (name: string): Condition => ({ flag: name });
export const noFlag = (name: string): Condition => ({ notFlag: name });
export const all = (...conditions: Condition[]): Condition => ({ all: conditions });
export const any = (...conditions: Condition[]): Condition => ({ any: conditions });

/** Spielfigur ist Vex Schrapnell. */
export const VEX: Condition = { playerIs: 'vex' };
export const NOT_VEX: Condition = { not: VEX };

/** Romanzefassung Aria (freigeschaltet, ♥8, Strang angebahnt), world.md §4.7. */
export const ARIA_ROM: Condition = all({ romance: 'aria' }, flag('aria_romanze_angebahnt'));
/** Strang Vex × Aria, Romanzefassung. */
export const VEXARIA: Condition = all(VEX, ARIA_ROM);
/** Aria-Romanze mit Baukasten-Spielfigur. */
export const ARIA_ROM_GENERIC: Condition = all(NOT_VEX, ARIA_ROM);

/** Die fünf Vorbereitungen des Bruchs (world.md §5.2) und ihre Abschluss-Flags (§11.8 `prep_*`). */
export const PREPS = ['grundriss', 'zugangskarte', 'wachplan', 'fluchtweg', 'ablenkung'] as const;
export type PrepKey = (typeof PREPS)[number];
export const prepFlag = (key: PrepKey): string => `prep_${key}`;

/** Mindestens zwei Vorbereitungen erledigt. */
export const TWO_PREPS: Condition = any(
  ...PREPS.flatMap((a, i) => PREPS.slice(i + 1).map(b => all(flag(prepFlag(a)), flag(prepFlag(b))))),
);
