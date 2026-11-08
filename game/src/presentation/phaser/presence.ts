// Figuren nach Tagesablauf (Bereich explore-presentation), ohne Phaser testbar.
// Die Darstellung fragt nur ab, WER gerade WO ist (Resolver, Standard `campaign.presentNpcs`); Regeln bleiben
// in modules/campaign. Hier wird nur entschieden, wie ein Wechsel aussieht: hinlaufen, weggehen, neu aufbauen.
import type { ExitDef, MapDef, MapId, NpcPresence, Point } from '../../modules/contracts';

/** Schmale Schnittstelle zum Tagesablauf: Figuren, die jetzt auf dieser Karte sind. */
export type PresenceResolver = (map: MapId) => NpcPresence[];

/** Wechsel größer als diese Spielzeit (Schlafen, Debug-Uhr, Zusammenbruch) → sofort umsetzen statt laufen. */
export const TELEPORT_MINUTES = 30;

export interface PresenceDiff {
  /** Unverändert (gleicher Ort, gleiche Pose, gleicher Dialog, gleiche Patrouille). */
  stay: { before: NpcPresence; after: NpcPresence }[];
  /** Gleiche Figur, neuer Punkt, keine Pose: läuft hin. */
  move: { before: NpcPresence; after: NpcPresence }[];
  /** Gleiche Figur, Pose oder Darstellung geändert: an Ort und Stelle neu aufbauen. */
  rebuild: { before: NpcPresence; after: NpcPresence }[];
  /** Neu auf der Karte. */
  enter: NpcPresence[];
  /** Nicht mehr auf der Karte. */
  leave: NpcPresence[];
}

const samePoint = (a: Point, b: Point) => Math.abs(a[0] - b[0]) < 0.5 && Math.abs(a[1] - b[1]) < 0.5;
const route = (points?: readonly Point[]) => (points ?? []).map((point) => point.join(',')).join(';');

/** Vergleicht zwei Anwesenheitslisten je Figur (eine Figur steht höchstens einmal auf einer Karte). */
export function diffPresences(before: readonly NpcPresence[], after: readonly NpcPresence[]): PresenceDiff {
  const diff: PresenceDiff = { stay: [], move: [], rebuild: [], enter: [], leave: [] };
  const old = new Map(before.map((entry) => [entry.npc, entry]));
  const seen = new Set<string>();
  for (const next of after) {
    if (seen.has(next.npc)) continue;
    seen.add(next.npc);
    const prev = old.get(next.npc);
    if (!prev) { diff.enter.push(next); continue; }
    if ((prev.pose ?? '') !== (next.pose ?? '')) { diff.rebuild.push({ before: prev, after: next }); continue; }
    const placeSame = samePoint(prev.at, next.at) && route(prev.patrol) === route(next.patrol);
    if (placeSame && prev.facing === next.facing && (prev.dialogue ?? '') === (next.dialogue ?? '') && prev.source === next.source) {
      diff.stay.push({ before: prev, after: next });
    } else if (!placeSame && !next.pose) diff.move.push({ before: prev, after: next });
    else diff.stay.push({ before: prev, after: next });
  }
  for (const prev of before) if (!seen.has(prev.npc)) diff.leave.push(prev);
  return diff;
}

/** Mittelpunkt eines Ausgangs. */
export function exitCenter(exit: ExitDef): Point {
  const [x, y, w, h] = exit.rect;
  return [x + w / 2, y + h / 2];
}

/** Nächster Ausgang (nur Betreten, keine Türen hinter Checks bevorzugt) – dorthin gehen und von dort kommen Figuren. */
export function nearestExit(map: MapDef, from: Point): ExitDef | null {
  let best: ExitDef | null = null;
  let bestScore = Infinity;
  for (const exit of map.exits) {
    const [cx, cy] = exitCenter(exit);
    const score = Math.hypot(cx - from[0], cy - from[1]) + (exit.check ? 4000 : 0);
    if (score < bestScore) { best = exit; bestScore = score; }
  }
  return best;
}

/** Fortlaufende Spielminute (Tag × 1440 + Minute) für den Teleport-Vergleich. */
export function absoluteMinute(clock: { day: number; minutes: number }): number {
  return clock.day * 1440 + clock.minutes;
}
