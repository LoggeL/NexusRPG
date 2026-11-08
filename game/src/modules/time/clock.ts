// Spieluhr als reine Zeitrechnung ohne Spielzustand (design.md §3.4, world.md §3.4).
//
// Ein Spieltag läuft von 06:00 (360) bis 02:00 am Folgetag (1560); Minuten zählen ab 0:00 des Spieltags weiter über
// Mitternacht hinaus (01:30 = 1530). Tag 1 ist ein Montag. Erreicht die Uhr 02:00, bricht die Spielfigur zusammen und
// der nächste Tag beginnt um 06:00 (Folgen wie Credits-Verlust regelt collapse.ts bzw. die Kampagne).
import type { ClockState, TimeSlot, Weekday } from '../contracts';

export const MINUTES_PER_DAY = 1440;
/** 06:00 */
export const DAY_START = 360;
/** 02:00 am Folgetag */
export const DAY_END = 1560;
/** 08:00 – Standard beim Spielstart. */
export const DEFAULT_START_MINUTES = 480;
/** Obergrenze für Spieltage (wie SAVE_LIMITS.day). */
export const MAX_DAY = 100_000;
/** Festkalender: Feste wiederholen sich alle 28 Tage (world.md §3.4). */
export const CYCLE_DAYS = 28;
export const DAYS_PER_WEEK = 7;

export const TIME_SLOTS: readonly TimeSlot[] = ['morgen', 'tag', 'abend', 'nacht'];
export const TIME_SLOT_LABELS: Readonly<Record<TimeSlot, string>> = { morgen: 'Morgen', tag: 'Tag', abend: 'Abend', nacht: 'Nacht' };
/** Tageszeiten als halboffene Intervalle [von, bis) in Minuten des Spieltags. */
export const SLOT_RANGES: Readonly<Record<TimeSlot, readonly [from: number, to: number]>> = {
  morgen: [360, 600],
  tag: [600, 1020],
  abend: [1020, 1260],
  nacht: [1260, 1560],
};

export const WEEKDAYS: readonly Weekday[] = ['mo', 'di', 'mi', 'do', 'fr', 'sa', 'so'];
export const WEEKDAY_LABELS: Readonly<Record<Weekday, string>> = {
  mo: 'Montag', di: 'Dienstag', mi: 'Mittwoch', do: 'Donnerstag', fr: 'Freitag', sa: 'Samstag', so: 'Sonntag',
};
export const WEEKDAY_SHORT: Readonly<Record<Weekday, string>> = {
  mo: 'Mo', di: 'Di', mi: 'Mi', do: 'Do', fr: 'Fr', sa: 'Sa', so: 'So',
};

export const isTimeSlot = (value: unknown): value is TimeSlot =>
  typeof value === 'string' && (TIME_SLOTS as readonly string[]).includes(value);
export const isWeekday = (value: unknown): value is Weekday =>
  typeof value === 'string' && (WEEKDAYS as readonly string[]).includes(value);

const safeDay = (day: number): number => (Number.isFinite(day) ? Math.min(MAX_DAY, Math.max(1, Math.floor(day))) : 1);

/** morgen 06–10, tag 10–17, abend 17–21, nacht 21–02. Werte außerhalb des Spieltags zählen zur Nacht. */
export function timeSlotOf(minutes: number): TimeSlot {
  if (minutes >= SLOT_RANGES.morgen[0] && minutes < SLOT_RANGES.morgen[1]) return 'morgen';
  if (minutes >= SLOT_RANGES.tag[0] && minutes < SLOT_RANGES.tag[1]) return 'tag';
  if (minutes >= SLOT_RANGES.abend[0] && minutes < SLOT_RANGES.abend[1]) return 'abend';
  return 'nacht';
}

/** Wochentag eines Spieltags (Tag 1 = Montag). */
export const weekdayOf = (day: number): Weekday => WEEKDAYS[(safeDay(day) - 1) % DAYS_PER_WEEK];
/** Woche ab 0 (Tage 1–7 = Woche 0). */
export const weekOf = (day: number): number => Math.floor((safeDay(day) - 1) / DAYS_PER_WEEK);
/** Tag im Festkalender 1..cycle (Tag 29 = Tag 1 des nächsten Zyklus). */
export const cycleDayOf = (day: number, cycle = CYCLE_DAYS): number => ((safeDay(day) - 1) % Math.max(1, Math.floor(cycle))) + 1;

/** Liegt die Uhrzeit innerhalb des Spieltags (06:00 ≤ t < 02:00)? */
export const isAwakeTime = (minutes: number): boolean => Number.isFinite(minutes) && minutes >= DAY_START && minutes < DAY_END;

/** „14:05“; Minuten ab 24:00 erscheinen als Uhrzeit des Folgetags („01:30“). */
export function formatClock(minutes: number): string {
  const total = ((Math.floor(Number.isFinite(minutes) ? minutes : 0) % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

/** „Tag 3 · Mittwoch · 14:05“ */
export const clockLabel = (clock: Readonly<ClockState>): string =>
  `Tag ${safeDay(clock.day)} · ${WEEKDAY_LABELS[weekdayOf(clock.day)]} · ${formatClock(clock.minutes)}`;

/** Uhrzeit „HH:MM“ (auch „01:30“ für die Nacht) → Minuten des Spieltags; ungültig → null. */
export function parseClockTime(text: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(text.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const mins = Number(match[2]);
  if (hours > 23 || mins > 59) return null;
  const minutes = hours * 60 + mins;
  // 00:00–01:59 gehören zur Nacht des laufenden Spieltags.
  const value = minutes < DAY_START ? minutes + MINUTES_PER_DAY : minutes;
  return value < DAY_END ? value : null;
}

/** Uhr in gültige Grenzen bringen (Tag ≥ 1, 06:00 ≤ Minuten < 02:00). */
export function normalizeClock(clock: Readonly<ClockState>): ClockState {
  const minutes = Number.isFinite(clock.minutes) ? Math.round(clock.minutes) : DEFAULT_START_MINUTES;
  return { day: safeDay(clock.day), minutes: Math.min(DAY_END - 1, Math.max(DAY_START, minutes)) };
}

/** Startuhr einer neuen Partie. */
export const startClockAt = (minutes = DEFAULT_START_MINUTES): ClockState => normalizeClock({ day: 1, minutes });

/** Minuten bis zum Zusammenbruch um 02:00. */
export const minutesUntilCollapse = (clock: Readonly<ClockState>): number => Math.max(0, DAY_END - clock.minutes);

/**
 * Minuten bis zum Beginn einer Tageszeit am selben Spieltag; 0, wenn sie gerade läuft; null, wenn sie heute schon
 * vorbei ist (dann hilft nur Schlafen).
 */
export function minutesUntilSlot(clock: Readonly<ClockState>, slot: TimeSlot): number | null {
  const [from, to] = SLOT_RANGES[slot];
  if (clock.minutes >= from && clock.minutes < to) return 0;
  return clock.minutes < from ? from - clock.minutes : null;
}

// ---------------------------------------------------------------------------
// Vorrücken mit Ereignissen

export type ClockEvent =
  /** Wechsel der Tageszeit am selben Spieltag. */
  | { type: 'slot'; day: number; from: TimeSlot; to: TimeSlot; at: number }
  /** Um 02:00 bricht die Spielfigur zusammen (Tag = abgelaufener Spieltag). */
  | { type: 'collapse'; day: number }
  /** Ein neuer Spieltag beginnt um 06:00 (nach Schlaf oder Zusammenbruch). */
  | { type: 'day'; day: number; weekday: Weekday; reason: 'sleep' | 'collapse' };

export interface ClockAdvance {
  clock: ClockState;
  events: ClockEvent[];
  /** Tatsächlich vergangene Minuten bis 02:00 bzw. bis zum Ziel (Rest nach einem Zusammenbruch verfällt). */
  minutes: number;
  collapsed: boolean;
}

/** Tageszeitwechsel zwischen zwei Uhrzeiten desselben Spieltags (from < to). */
function slotEvents(day: number, from: number, to: number): ClockEvent[] {
  const events: ClockEvent[] = [];
  let slot = timeSlotOf(from);
  for (const next of TIME_SLOTS) {
    const start = SLOT_RANGES[next][0];
    if (start > from && start <= to && next !== slot) {
      events.push({ type: 'slot', day, from: slot, to: next, at: start });
      slot = next;
    }
  }
  return events;
}

/** Neuer Morgen: nächster Tag 06:00. */
export function nextMorning(clock: Readonly<ClockState>): ClockState {
  return { day: Math.min(MAX_DAY, safeDay(clock.day) + 1), minutes: DAY_START };
}

/**
 * Uhr um `minutes` vorstellen. Erreicht sie 02:00, folgen Zusammenbruch und neuer Morgen; der Rest verfällt.
 * Ungültige oder nicht positive Angaben ändern nichts.
 */
export function advanceClock(clock: Readonly<ClockState>, minutes: number): ClockAdvance {
  const start = normalizeClock(clock);
  if (!Number.isFinite(minutes) || minutes <= 0) return { clock: start, events: [], minutes: 0, collapsed: false };
  const step = Math.max(1, Math.round(minutes));
  const target = start.minutes + step;
  if (target < DAY_END) {
    return { clock: { day: start.day, minutes: target }, events: slotEvents(start.day, start.minutes, target), minutes: step, collapsed: false };
  }
  const events = slotEvents(start.day, start.minutes, DAY_END - 1);
  events.push({ type: 'collapse', day: start.day });
  const morning = nextMorning(start);
  events.push({ type: 'day', day: morning.day, weekday: weekdayOf(morning.day), reason: 'collapse' });
  return { clock: morning, events, minutes: DAY_END - start.minutes, collapsed: true };
}

/** Schlafen: nächster Tag 06:00 (egal ob vor oder nach Mitternacht). */
export function sleepClock(clock: Readonly<ClockState>): ClockAdvance {
  const start = normalizeClock(clock);
  const morning = nextMorning(start);
  return {
    clock: morning,
    events: [{ type: 'day', day: morning.day, weekday: weekdayOf(morning.day), reason: 'sleep' }],
    // bis 06:00 des Folgetags
    minutes: MINUTES_PER_DAY + DAY_START - start.minutes,
    collapsed: false,
  };
}

/** Hat sich Tageszeit oder Tag geändert? (Darstellung, Tagesabläufe neu auflösen.) */
export const slotChanged = (events: readonly ClockEvent[]): boolean => events.some(event => event.type === 'slot' || event.type === 'day');
/** Hat ein neuer Spieltag begonnen? */
export const dayChanged = (events: readonly ClockEvent[]): boolean => events.some(event => event.type === 'day');
