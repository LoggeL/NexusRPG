// Beziehungspunkte, Herzen und Rivalität (design.md §3.3, world.md §4.1).
//
// Punkte −1000…1000, Herzen = floor(Punkte / 100) (0–10). Unter −200 beginnt die Rivalität mit Stufen 2…10
// (−250 → Stufe 2, −300 → 3, −1000 → 10). Weltfiguren dürfen weniger Herzen haben (z. B. höchstens 5); dann enden
// die Punkte bei `maxHearts × 100`. Kein Abbau durch Nichtbeachtung.

export const POINTS_MIN = -1000;
export const POINTS_MAX = 1000;
export const POINTS_PER_HEART = 100;
export const HEARTS_MAX = 10;
/** Unter diesem Wert beginnt die Rivalität. */
export const RIVAL_BELOW = -200;
export const RIVALRY_MIN = 2;
export const RIVALRY_MAX = 10;

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

/** Gültige Herz-Obergrenze 1..10 (Standard 10). */
export const heartCap = (maxHearts?: number): number =>
  maxHearts !== undefined && Number.isFinite(maxHearts) ? clamp(Math.floor(maxHearts), 1, HEARTS_MAX) : HEARTS_MAX;

/** Höchste Punktzahl einer Figur mit dieser Herz-Obergrenze. */
export const pointsCap = (maxHearts?: number): number => Math.min(POINTS_MAX, heartCap(maxHearts) * POINTS_PER_HEART);

export const clampPoints = (points: number, maxHearts?: number): number =>
  Number.isFinite(points) ? clamp(Math.round(points), POINTS_MIN, pointsCap(maxHearts)) : 0;

export const heartsOf = (points: number, maxHearts?: number): number =>
  Number.isFinite(points) ? clamp(Math.floor(Math.max(0, points) / POINTS_PER_HEART), 0, heartCap(maxHearts)) : 0;

/** Rivalitätsstufe 2..10 unter −200 Punkten, sonst 0. */
export const rivalryOf = (points: number): number =>
  Number.isFinite(points) && points < RIVAL_BELOW ? clamp(Math.floor(-points / POINTS_PER_HEART), RIVALRY_MIN, RIVALRY_MAX) : 0;

/** Versöhnung (Versöhnungsquest): Rivalität und negative Punkte enden bei 0, positive bleiben. */
export const reconciledPoints = (points: number): number => (Number.isFinite(points) && points > 0 ? points : 0);

export type Standing = 'rivalitaet' | 'angespannt' | 'fremd' | 'bekannt' | 'befreundet' | 'vertraut' | 'seelenverwandt';
export const STANDING_LABELS: Readonly<Record<Standing, string>> = {
  rivalitaet: 'Rivalität',
  angespannt: 'Angespannt',
  fremd: 'Fremd',
  bekannt: 'Bekannt',
  befreundet: 'Befreundet',
  vertraut: 'Vertraut',
  seelenverwandt: 'Unzertrennlich',
};

/** Grobe Einordnung für Anzeigen. */
export function standingOf(points: number, maxHearts?: number): Standing {
  if (rivalryOf(points) > 0) return 'rivalitaet';
  if (points < 0) return 'angespannt';
  const hearts = heartsOf(points, maxHearts);
  if (hearts >= heartCap(maxHearts) && hearts >= 5) return 'seelenverwandt';
  if (hearts >= 6) return 'vertraut';
  if (hearts >= 3) return 'befreundet';
  if (hearts >= 1) return 'bekannt';
  return 'fremd';
}

export interface HeartProgress {
  hearts: number;
  maxHearts: number;
  /** Fortschritt zum nächsten Herz 0..1 (1 bei voller Stufe). */
  progress: number;
  /** Fehlende Punkte bis zum nächsten Herz, null bei Höchststand. */
  toNext: number | null;
}

export function heartProgress(points: number, maxHearts?: number): HeartProgress {
  const cap = heartCap(maxHearts);
  const hearts = heartsOf(points, cap);
  if (hearts >= cap) return { hearts, maxHearts: cap, progress: 1, toNext: null };
  const within = Math.max(0, points) - hearts * POINTS_PER_HEART;
  return { hearts, maxHearts: cap, progress: within / POINTS_PER_HEART, toNext: POINTS_PER_HEART - within };
}

export interface PointsChange {
  before: number;
  after: number;
  /** Tatsächliche Änderung nach Begrenzung. */
  applied: number;
  heartsBefore: number;
  heartsAfter: number;
  rivalryBefore: number;
  rivalryAfter: number;
  /** Neu erreichte Herzstufen (aufsteigend). */
  heartsGained: number[];
  /** Verlorene Herzstufen (absteigend). */
  heartsLost: number[];
  rivalryStarted: boolean;
  rivalryEnded: boolean;
}

/** Punkte ändern (gerundet und begrenzt) und alle Stufenwechsel melden. */
export function changePoints(points: number, delta: number, maxHearts?: number): PointsChange {
  const before = clampPoints(points, maxHearts);
  const after = clampPoints(before + (Number.isFinite(delta) ? Math.round(delta) : 0), maxHearts);
  const heartsBefore = heartsOf(before, maxHearts);
  const heartsAfter = heartsOf(after, maxHearts);
  const rivalryBefore = rivalryOf(before);
  const rivalryAfter = rivalryOf(after);
  const heartsGained: number[] = [];
  for (let h = heartsBefore + 1; h <= heartsAfter; h++) heartsGained.push(h);
  const heartsLost: number[] = [];
  for (let h = heartsBefore; h > heartsAfter; h--) heartsLost.push(h);
  return {
    before, after, applied: after - before, heartsBefore, heartsAfter, rivalryBefore, rivalryAfter, heartsGained, heartsLost,
    rivalryStarted: rivalryBefore === 0 && rivalryAfter > 0,
    rivalryEnded: rivalryBefore > 0 && rivalryAfter === 0,
  };
}

/** Anzeige „♥ 3/10“ bzw. „Rivalität 4“. */
export function heartLabel(points: number, maxHearts?: number): string {
  const rivalry = rivalryOf(points);
  if (rivalry > 0) return `Rivalität ${rivalry}`;
  return `♥ ${heartsOf(points, maxHearts)}/${heartCap(maxHearts)}`;
}
