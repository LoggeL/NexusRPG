// Bewegungslogik der Erkundung (Bereich explore-presentation), ohne Phaser testbar:
// Blickrichtung mit Hysterese, Routenlaufen (Patrouillen, Passanten, Wege nach Tagesablauf), Atmen im Stand.
import type { Facing, Point } from '../../modules/contracts';

/**
 * Blickrichtung aus einem Bewegungsvektor. Mit `hysteresis` (0..1) bleibt die bisherige Richtung erhalten,
 * solange ihre Achse nicht deutlich schwächer ist – verhindert Flackern zwischen zwei Blättern beim Diagonallaufen.
 */
export function facingFrom(dx: number, dy: number, fallback: Facing, hysteresis = 0): Facing {
  const ax = Math.abs(dx);
  const ay = Math.abs(dy);
  if (ax < 0.01 && ay < 0.01) return fallback;
  if (hysteresis > 0) {
    const keep = 1 - Math.min(0.9, hysteresis);
    if ((fallback === 'e' && dx > 0) || (fallback === 'w' && dx < 0)) { if (ax >= ay * keep) return fallback; }
    if ((fallback === 's' && dy > 0) || (fallback === 'n' && dy < 0)) { if (ay >= ax * keep) return fallback; }
  }
  if (ax > ay) return dx > 0 ? 'e' : 'w';
  return dy > 0 ? 's' : 'n';
}

/** Zustand einer Figur, die eine Route abläuft. */
export interface RouteWalker {
  /** Wegpunkte in Kartenpixeln. */
  route: readonly Point[];
  /** Nächster Wegpunkt. */
  index: number;
  /** Echtzeit (ms), bis zu der die Figur am Wegpunkt wartet. */
  waitUntil: number;
  /** 'loop': zyklisch (A → B → A …), 'once': bleibt am letzten Punkt stehen. */
  mode: 'loop' | 'once';
  /** Wartezeit je erreichtem Wegpunkt (ms); bei Zwischenpunkten aus der Pfadsuche 0. */
  pause: (index: number) => number;
  /** 'once': letzter Punkt erreicht. */
  finished?: boolean;
}

export interface StepResult {
  x: number;
  y: number;
  dx: number;
  dy: number;
  walking: boolean;
  /** In diesem Schritt einen Wegpunkt erreicht (Index des erreichten Punkts). */
  reached: number | null;
}

/**
 * Bewegt eine Figur höchstens `distance` Pixel entlang ihrer Route. Überschüssige Strecke läuft am nächsten
 * Wegpunkt weiter, wenn dort nicht gewartet wird (gleichmäßiges Tempo über Pfadknicke).
 */
export function stepRoute(walker: RouteWalker, from: Point, distance: number, now: number): StepResult {
  let [x, y] = from;
  const result: StepResult = { x, y, dx: 0, dy: 0, walking: false, reached: null };
  if (!walker.route.length || walker.finished) return result;
  if (now < walker.waitUntil) return result;
  let remaining = distance;
  for (let guard = 0; guard < 16 && remaining > 1e-6; guard++) {
    const [tx, ty] = walker.route[walker.index % walker.route.length];
    const gap = Math.hypot(tx - x, ty - y);
    if (gap > remaining) {
      x += ((tx - x) / gap) * remaining;
      y += ((ty - y) / gap) * remaining;
      remaining = 0;
      break;
    }
    x = tx;
    y = ty;
    remaining -= gap;
    const reached = walker.index % walker.route.length;
    result.reached = reached;
    if (walker.mode === 'once' && reached === walker.route.length - 1) { walker.finished = true; break; }
    walker.index = (reached + 1) % walker.route.length;
    const pause = walker.pause(reached);
    if (pause > 0) { walker.waitUntil = now + pause; break; }
  }
  result.dx = x - from[0];
  result.dy = y - from[1];
  result.x = x;
  result.y = y;
  result.walking = Math.hypot(result.dx, result.dy) > 1e-3;
  return result;
}

/**
 * Route über die Pfadsuche ausrollen: zwischen je zwei Wegpunkten (bei 'loop' auch vom letzten zum ersten)
 * die Zwischenpunkte einfügen. Liefert die Punkte und je Punkt, ob er ein Original-Wegpunkt ist (dort wird gewartet).
 */
export function expandRoute(points: readonly Point[], findPath: (from: Point, to: Point) => Point[], loop: boolean): { route: Point[]; anchors: boolean[] } {
  const route: Point[] = [];
  const anchors: boolean[] = [];
  if (!points.length) return { route, anchors };
  const count = loop && points.length > 1 ? points.length : points.length - 1;
  route.push([points[0][0], points[0][1]]);
  anchors.push(true);
  for (let i = 0; i < count; i++) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    const path = findPath(a, b);
    const inner = path.length && Math.hypot(path[path.length - 1][0] - b[0], path[path.length - 1][1] - b[1]) < 24 ? path.slice(0, -1) : path;
    for (const point of inner) { route.push([point[0], point[1]]); anchors.push(false); }
    if (i + 1 < points.length) { route.push([b[0], b[1]]); anchors.push(true); }
  }
  return { route, anchors };
}

/** Leichtes Atmen im Stand: vertikale Skalierung um 1 (0 bei reduzierter Bewegung). */
export function idleBreath(time: number, phase: number, amplitude = 0.012, periodMs = 2600): number {
  return 1 + amplitude * Math.sin(((time + phase) / periodMs) * Math.PI * 2);
}

/** Abstand zweier Punkte. */
export function distance(a: Point, b: Point): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1]);
}

/** Kleiner deterministischer Zufallsgenerator (Mulberry32) für Darstellungszufall mit Startwert. */
export function seededRandom(seed: number): () => number {
  let value = seed >>> 0;
  return () => {
    value = (value + 0x6d2b79f5) >>> 0;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Text → 32-Bit-Startwert. */
export function hashSeed(text: string): number {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) hash = Math.imul(hash ^ text.charCodeAt(i), 16777619);
  return hash >>> 0;
}
