// Fahndung verfällt mit der Zeit (world.md §10.3: „Sinkt um 1 pro vollem Tag ohne Vergehen“).
// Die Stufe selbst liegt weiter auf den Flags `fahndung_1` … `fahndung_3` (Effekt `wanted`, campaign/domains/core.ts).
// Dieser Nachlauf merkt sich in genau einem Flag `fahndung_stand_<stufe>_<minute>`, seit wann die Stufe ohne neues
// Vergehen gilt (Minute = absolute Spielzeit). Steigt die Stufe, beginnt die Frist neu; sinkt sie anders (Dr. Winkel,
// Oma Volts Versteck, Haft), läuft die alte Frist weiter. Rivalität mit dem Richter: Fahndung verfällt halb so schnell.
// Zuständig: Bereich Wirtschaft (Fahndung).
import type { ClockState, Condition, GameState } from '../contracts';
import type { EffectContext, SettleHook } from '../campaign/registry';

/** Höchste Fahndungsstufe (wie WANTED_MAX in campaign/domains/core.ts). */
export const WANTED_LEVELS = 3;
/** Ein voller Tag ohne Vergehen senkt die Fahndung um 1. */
export const WANTED_DECAY_MINUTES = 24 * 60;
/** Richter-Rivalität (world.md §4.5 Richter): „Fahndung verfällt langsamer“ – doppelte Frist. */
export const WANTED_SLOW_DECAY: Condition = { rival: 'richter' };
export const WANTED_SLOW_FACTOR = 2;

const MARK_PREFIX = 'fahndung_stand_';
const MARK = /^fahndung_stand_([0-3])_(\d+)$/;

/** Fahndungsstufe 0–3 aus den Flags. */
export function wantedLevelOf(state: Readonly<Pick<GameState, 'flags'>>): number {
  for (let level = WANTED_LEVELS; level >= 1; level--) if (state.flags[`fahndung_${level}`] === true) return level;
  return 0;
}

/** Absolute Spielminute (monoton: 02:00 des Vortags liegt vor 06:00 des Folgetags). */
export const absoluteMinute = (clock: Readonly<ClockState>): number => (Math.max(1, clock.day) - 1) * 1440 + clock.minutes;

interface WantedMark { key: string; level: number; since: number }

function readMark(flags: Readonly<Record<string, boolean>>): WantedMark | null {
  for (const key of Object.keys(flags)) {
    if (!key.startsWith(MARK_PREFIX) || flags[key] !== true) continue;
    const match = MARK.exec(key);
    if (match) return { key, level: Number(match[1]), since: Number(match[2]) };
  }
  return null;
}

function writeMark(draft: GameState, previous: WantedMark | null, level: number, since: number): boolean {
  const key = `${MARK_PREFIX}${level}_${Math.max(0, Math.floor(since))}`;
  if (previous?.key === key) return false;
  for (const old of Object.keys(draft.flags)) if (old.startsWith(MARK_PREFIX)) delete draft.flags[old];
  if (level > 0) draft.flags[key] = true;
  return true;
}

function setLevel(draft: GameState, level: number): void {
  for (let n = 1; n <= WANTED_LEVELS; n++) {
    if (n <= level) draft.flags[`fahndung_${n}`] = true;
    else delete draft.flags[`fahndung_${n}`];
  }
}

/** Frist in Minuten, bis die Fahndung um eine Stufe sinkt. */
export const wantedDecayMinutes = (evaluate: EffectContext['evaluate']): number =>
  WANTED_DECAY_MINUTES * (evaluate(WANTED_SLOW_DECAY) ? WANTED_SLOW_FACTOR : 1);

/** Nachlauf: Frist führen und die Fahndung nach vollen Tagen ohne Vergehen senken. */
export const wantedDecaySettle: SettleHook = (ctx) => {
  const { draft } = ctx;
  const level = wantedLevelOf(draft);
  const mark = readMark(draft.flags);
  const now = absoluteMinute(draft.clock);
  if (level === 0) return mark ? writeMark(draft, mark, 0, 0) : false;
  // Neues Vergehen (Stufe gestiegen) oder noch keine Frist: ab jetzt zählen.
  if (!mark || mark.level < level || mark.since > now) return writeMark(draft, mark, level, now);
  // Anders gesenkt (Dienst, Versteck): alte Frist läuft weiter.
  if (mark.level > level) return writeMark(draft, mark, level, mark.since);
  const period = wantedDecayMinutes(ctx.evaluate);
  const steps = Math.min(level, Math.floor((now - mark.since) / period));
  if (steps <= 0) return false;
  const after = level - steps;
  setLevel(draft, after);
  writeMark(draft, mark, after, mark.since + steps * period);
  ctx.messages.push(after === 0
    ? 'Fahndung aufgehoben – die Wache hat dein Gesicht vergessen.'
    : `Fahndung ${after} (−${steps}) – Gras wächst über die Sache.`);
  return true;
};
