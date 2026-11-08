// Reine Geometrie der Begleiterkette (ohne Phaser, testbar).
import type { Facing, Point } from '../../modules/contracts';

/**
 * Spur hinter der Spielfigur für die Begleiterkette (Punkte von hinten nach vorn, letzter Punkt = Spielfigur).
 * Läuft in geraden Stücken möglichst nach hinten und biegt an Wänden in die Richtung mit dem
 * längsten freien Weg ab (seitlich vor vorn), statt Begleiter auf der Spielfigur zu stapeln – so bleibt der
 * Abstand auch an Kartenrändern und in engen Innenräumen erhalten.
 */
export function buildTrail(start: Point, facing: Facing, length: number, walkable: (x: number, y: number) => boolean, step = 2, fallbackPath?: () => Point[]): Point[] {
  const back: Record<Facing, number> = { s: -Math.PI / 2, n: Math.PI / 2, e: Math.PI, w: 0 };
  const points: Point[] = [start];
  let [x, y] = start;
  let heading = back[facing];
  let remaining = length;
  // Nicht in die eigene Spur zurücklaufen (sonst Knäuel statt Kette).
  const crowded = (px: number, py: number) => {
    // Die letzten Punkte (≈ 10 px) zählen nicht – sonst wäre jedes Abbiegen an einer Ecke „zu nah“.
    for (let i = 0; i < points.length - 5; i++) if (Math.hypot(points[i][0] - px, points[i][1] - py) < 9) return true;
    return false;
  };
  const run = (angle: number, max: number) => {
    let d = 0;
    while (d + step <= max) {
      const nx = x + Math.cos(angle) * (d + step);
      const ny = y + Math.sin(angle) * (d + step);
      if (!walkable(nx, ny) || crowded(nx, ny)) break;
      d += step;
    }
    return d;
  };
  for (let guard = 0; remaining >= step && guard < 12; guard++) {
    let best = { angle: heading, distance: 0, score: -Infinity };
    for (let k = 0; k < 16; k++) {
      const turn = ((k + 8) % 16 - 8) * (Math.PI / 8); // 0, ±22,5°, … ±180°
      const angle = heading + turn;
      const distance = run(angle, remaining);
      // Abbiegen kostet etwas: lieber nach hinten bzw. seitlich als vor der Spielfigur.
      const score = distance - Math.abs(turn) * 6;
      if (distance >= step && score > best.score) best = { angle, distance, score };
    }
    if (best.distance < step) break;
    for (let d = step; d <= best.distance; d += step) points.push([x + Math.cos(best.angle) * d, y + Math.sin(best.angle) * d]);
    [x, y] = points[points.length - 1];
    heading = best.angle;
    remaining -= best.distance;
  }
  // Zu kurz (Einstieg in einer schmalen, gewundenen Randgasse): Weg ins Karteninnere nehmen, falls länger.
  if (remaining >= step && fallbackPath) {
    const path = [start, ...fallbackPath()];
    if (polylineLength(path) > length - remaining) return path.reverse();
  }
  // Fehlende Länge (Sackgasse): restliche Begleiter sammeln sich am Spurende.
  return points.reverse();
}

export function polylineLength(points: readonly Point[]): number {
  let total = 0;
  for (let i = 1; i < points.length; i++) total += Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]);
  return total;
}

/** Punkt auf der Spur in `distance` Pfadlänge hinter dem Spurende (Spielfigur). */
export function pointAlong(trail: readonly Point[], distance: number, fallback: Point): Point {
  let remaining = distance;
  for (let i = trail.length - 1; i > 0; i--) {
    const a = trail[i];
    const b = trail[i - 1];
    const segment = Math.hypot(a[0] - b[0], a[1] - b[1]);
    if (segment >= remaining) {
      const t = segment ? remaining / segment : 0;
      return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
    }
    remaining -= segment;
  }
  return trail[0] ?? fallback;
}
