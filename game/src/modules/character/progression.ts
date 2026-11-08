// Stufen, XP und Punkte je Stufe (design.md §3.1, world.md §2.7).
import { LEVEL_MAX, clamp } from '../campaign/ids';

/** Je Stufenaufstieg: +1 Attributpunkt und +1 Perkpunkt. */
export const ATTR_POINTS_PER_LEVEL = 1;
export const PERK_POINTS_PER_LEVEL = 1;

/** Kumulative XP für Stufe `level`: 100 × n × (n + 1) / 2 mit n = level − 1 (Stufe 2 bei 100, 3 bei 300 …). */
export const xpForLevel = (level: number): number => {
  const n = clamp(Math.floor(Number.isFinite(level) ? level : 1), 1, LEVEL_MAX) - 1;
  return (100 * n * (n + 1)) / 2;
};

/** Stufe zu kumulativen XP (1..20). */
export function levelForXp(xp: number): number {
  if (!Number.isFinite(xp) || xp <= 0) return 1;
  let level = 1;
  while (level < LEVEL_MAX && xp >= xpForLevel(level + 1)) level++;
  return level;
}

export interface LevelProgress {
  level: number;
  xp: number;
  /** XP-Schwelle der aktuellen Stufe. */
  floor: number;
  /** XP-Schwelle der nächsten Stufe (null auf Höchststufe). */
  next: number | null;
  /** XP seit Erreichen der aktuellen Stufe. */
  into: number;
  /** Noch fehlende XP bis zur nächsten Stufe (0 auf Höchststufe). */
  needed: number;
  /** Anteil 0..1 für Fortschrittsbalken (1 auf Höchststufe). */
  ratio: number;
}

export function levelProgress(xp: number): LevelProgress {
  const safe = Number.isFinite(xp) ? Math.max(0, Math.floor(xp)) : 0;
  const level = levelForXp(safe);
  const floor = xpForLevel(level);
  if (level >= LEVEL_MAX) return { level, xp: safe, floor, next: null, into: safe - floor, needed: 0, ratio: 1 };
  const next = xpForLevel(level + 1);
  return { level, xp: safe, floor, next, into: safe - floor, needed: next - safe, ratio: (safe - floor) / (next - floor) };
}

/** Punkte, die ein Aufstieg von Stufe `from` auf `to` bringt. */
export function levelGains(from: number, to: number): { levels: number; attributePoints: number; perkPoints: number } {
  const levels = Math.max(0, Math.floor(to) - Math.floor(from));
  return { levels, attributePoints: levels * ATTR_POINTS_PER_LEVEL, perkPoints: levels * PERK_POINTS_PER_LEVEL };
}

/** Insgesamt bis zu dieser Stufe verdiente Punkte (Stufe 1: keine). */
export const pointsUpToLevel = (level: number): { attributePoints: number; perkPoints: number } => {
  const { attributePoints, perkPoints } = levelGains(1, clamp(Math.floor(level), 1, LEVEL_MAX));
  return { attributePoints, perkPoints };
};

/** LP-Maximum = 20 + 4 × Körper + 2 × Stufe (+ LP-Boni), mindestens 1. */
export const maxHpFormula = (koerper: number, level: number, bonus = 0): number =>
  Math.max(1, 20 + 4 * koerper + 2 * level + bonus);
