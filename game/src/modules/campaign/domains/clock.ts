// Domäne „Zeit“: verbindet die Spieluhr aus modules/time/ (Tageszeiten, Wochentage, Vorrücken mit Ereignissen,
// Schlafen, Zusammenbruch um 02:00; design.md §3.4) mit Spielzustand, Bedingungen und Effekten.
// Zuständig: Bereich relationships+time.
import type { ClockState, GameContent } from '../../contracts';
import {
  DAY_END, DAY_START, DEFAULT_START_MINUTES, advanceClock, collapsePlan, cycleDayOf, formatClock, shelterOf, sleepClock,
  startClockAt, timeSlotOf, weekOf, weekdayOf, type ClockAdvance,
} from '../../time';
import { asList, has } from '../ids';
import type { ConditionSpecs, EffectContext, EffectSpecs } from '../registry';
import { SAVE_LIMITS, fail, int, obj } from '../validate';
import { healPlayer } from './character';

export { cycleDayOf, formatClock, timeSlotOf, weekOf, weekdayOf };

/** Flag-Präfixe, die beim Tageswechsel von selbst fallen (täglich, montags, an Zyklustag 1). */
export const DAILY_FLAG_PREFIX = 'heute_';
export const WEEKLY_FLAG_PREFIX = 'woche_';
export const CYCLE_FLAG_PREFIX = 'zyklus_';

/** Gesehen-Schlüssel bzw. Flag eines Hotspots mit `daily: true` (fällt mit den `heute_`-Flags). */
export const dailyHotspotFlag = (map: string, hotspot: string): string => `${DAILY_FLAG_PREFIX}hs_${map}_${hotspot}`;

/**
 * Neuer Spieltag (Uhr steht schon auf 06:00 des neuen Tags): Tages-/Wochen-/Zyklus-Flags zurücksetzen, danach die
 * Tageswechsel-Regeln (`GameContent.daily`). Eine fehlerhafte Regel stoppt nur sich selbst, nicht den Schlaf.
 */
export function startNewDayIn(ctx: EffectContext): void {
  const { draft } = ctx;
  const day = draft.clock.day;
  const prefixes = [DAILY_FLAG_PREFIX];
  if (weekdayOf(day) === 'mo') prefixes.push(WEEKLY_FLAG_PREFIX);
  if (cycleDayOf(day) === 1) prefixes.push(CYCLE_FLAG_PREFIX);
  for (const flag of Object.keys(draft.flags)) if (prefixes.some(prefix => flag.startsWith(prefix))) delete draft.flags[flag];
  for (const rule of Object.values(ctx.content.daily ?? {})) {
    if (!rule || !Array.isArray(rule.effects) || !ctx.evaluate(rule.when)) continue;
    ctx.run(rule.effects);
  }
}

/** Schlafen im Unterschlupf: nächster Tag 06:00, volle LP. */
export function sleepIn(ctx: EffectContext): void {
  const step = sleepClock(ctx.draft.clock);
  ctx.draft.clock = { day: Math.min(SAVE_LIMITS.day, step.clock.day), minutes: step.clock.minutes };
  healPlayer(ctx.content, ctx.draft, 'full');
  ctx.messages.push(`Tag ${ctx.draft.clock.day} beginnt.`);
  ctx.requests.push({ sleep: 'bed' });
  startNewDayIn(ctx);
}

/**
 * 02:00: Zusammenbruch. Aufwachen im Unterschlupf (`content.home`) mit −10 % Credits und Notiz – oder auf einem
 * Notschlafplatz der aktuellen Karte ohne Verlust. Der neue Tag beginnt um 06:00.
 */
export function collapseIn(ctx: EffectContext, endedDay: number): void {
  const { content, draft } = ctx;
  const plan = collapsePlan({
    credits: draft.credits,
    seed: draft.seed,
    day: endedDay,
    map: draft.map,
    home: content.home,
    shelter: shelterOf(has(content.maps, draft.map) ? content.maps[draft.map] : undefined),
    evaluate: ctx.evaluate,
  });
  draft.credits = Math.max(0, draft.credits - plan.lost);
  healPlayer(content, draft, plan.heal);
  if (plan.note) ctx.messages.push(plan.note);
  if (plan.lost > 0) ctx.messages.push(`−${plan.lost} Credits`);
  if (has(content.maps, plan.wake.map) && (plan.wake.map !== draft.map || plan.wake.entry)) {
    const travel: { travel: string; entry?: string; minutes: number } = { travel: plan.wake.map, minutes: 0 };
    if (plan.wake.entry) travel.entry = plan.wake.entry;
    ctx.requests.push(travel);
  }
  ctx.requests.push({ sleep: 'collapse' });
  startNewDayIn(ctx);
}

/** Uhr vorstellen; erreicht sie 02:00, folgt der Zusammenbruch (Rest verfällt). Liefert die Zeitereignisse. */
export function advanceClockIn(ctx: EffectContext, minutes: number): ClockAdvance {
  const step = advanceClock(ctx.draft.clock, minutes);
  if (step.minutes === 0) return step;
  const endedDay = ctx.draft.clock.day;
  ctx.draft.clock = { day: Math.min(SAVE_LIMITS.day, step.clock.day), minutes: step.clock.minutes };
  if (step.collapsed) collapseIn(ctx, endedDay);
  return step;
}

export const clockConditions: ConditionSpecs<'time' | 'weekday' | 'dayAtLeast' | 'clockBetween' | 'cycleDay'> = {
  cycleDay: { test: (c, { state }) => asList(c.cycleDay).includes(cycleDayOf(state.clock.day)) },
  time: { test: (c, { state }) => asList(c.time).includes(timeSlotOf(state.clock.minutes)) },
  weekday: { test: (c, { state }) => asList(c.weekday).includes(weekdayOf(state.clock.day)) },
  dayAtLeast: { test: (c, { state }) => state.clock.day >= c.dayAtLeast },
  clockBetween: {
    test: (c, { state }) => Array.isArray(c.clockBetween) && state.clock.minutes >= c.clockBetween[0] && state.clock.minutes < c.clockBetween[1],
  },
};

export const clockEffects: EffectSpecs<'advanceTime' | 'sleep'> = {
  advanceTime: {
    apply(e, ctx) {
      if (!Number.isFinite(e.advanceTime) || e.advanceTime < 0) return 'Ungültige Zeitangabe.';
      advanceClockIn(ctx, e.advanceTime);
      return null;
    },
  },
  sleep: { apply(_e, ctx) { sleepIn(ctx); return null; } },
};

export function startClock(content: GameContent): ClockState {
  return startClockAt(content.start.minutes ?? DEFAULT_START_MINUTES);
}

export function parseClock(value: unknown): ClockState {
  const c = obj(value, 'Uhr');
  const day = int(c.day, 1, SAVE_LIMITS.day, 'Spieltag');
  const minutes = int(c.minutes, DAY_START, DAY_END - 1, 'Uhrzeit');
  if (Object.keys(c).some(key => key !== 'day' && key !== 'minutes')) fail('Unbekannte Angabe in der Uhr.');
  return { day, minutes };
}
