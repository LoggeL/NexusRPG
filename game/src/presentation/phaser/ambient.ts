// Passanten (MapDef.ambient) – Planung und Sprüche (Bereich explore-presentation), ohne Phaser testbar.
// world.md §10.4: Sprüche zufällig aus dem Pool (Bedingungen z. B. nach Akt/Tageszeit), neue Sprüche haben Vorrang.
import type { AmbientDef, Condition, Point, TimeSlot } from '../../modules/contracts';
import { expandRoute, hashSeed, seededRandom } from './motion';

/** Obergrenze je Karte (Leistung, Übersicht). */
export const MAX_PASSERSBY = 16;

export interface PasserbyPlan {
  id: string;
  sprite: string;
  /** Ausgerollte Route (Pfadsuche zwischen den Wegpunkten), zyklisch. */
  route: Point[];
  /** Je Routenpunkt: Original-Wegpunkt (dort kurz verweilen)? */
  anchors: boolean[];
  /** Index des nächsten Routenpunkts ab `start`. */
  index: number;
  start: Point;
  /** Pixel je Sekunde. */
  speed: number;
}

export interface PlanOptions {
  /** Startwert (z. B. Karte + Tag + Tageszeit), damit dieselbe Szene gleich aussieht. */
  seed: string;
  size: readonly [number, number];
  walkable(x: number, y: number): boolean;
  findPath(from: Point, to: Point): Point[];
}

/** Anzahl Passanten jetzt: `bySlot` vor `count`, begrenzt auf 0..MAX_PASSERSBY; ohne Laufblätter 0. */
export function ambientCount(def: AmbientDef | undefined, slot: TimeSlot): number {
  if (!def || !def.sprites.length) return 0;
  const raw = def.bySlot?.[slot] ?? def.count;
  return Math.max(0, Math.min(MAX_PASSERSBY, Math.floor(Number.isFinite(raw) ? raw : 0)));
}

function randomWalkable(random: () => number, options: PlanOptions): Point | null {
  const [w, h] = options.size;
  for (let attempt = 0; attempt < 80; attempt++) {
    const point: Point = [Math.round(32 + random() * (w - 64)), Math.round(32 + random() * (h - 64))];
    if (options.walkable(point[0], point[1])) return point;
  }
  return null;
}

/** Länge einer zyklischen Route. */
function loopLength(route: readonly Point[]): number {
  let total = 0;
  for (let i = 0; i < route.length; i++) {
    const a = route[i];
    const b = route[(i + 1) % route.length];
    total += Math.hypot(b[0] - a[0], b[1] - a[1]);
  }
  return total;
}

/** Punkt in Pfadlänge `offset` auf der zyklischen Route und Index des nächsten Routenpunkts. */
export function pointOnLoop(route: readonly Point[], offset: number): { at: Point; next: number } {
  if (route.length < 2) return { at: route[0] ?? [0, 0], next: 0 };
  const total = loopLength(route);
  let remaining = total > 0 ? ((offset % total) + total) % total : 0;
  for (let i = 0; i < route.length; i++) {
    const a = route[i];
    const b = route[(i + 1) % route.length];
    const segment = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (remaining <= segment) {
      const t = segment ? remaining / segment : 0;
      return { at: [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t], next: (i + 1) % route.length };
    }
    remaining -= segment;
  }
  return { at: [route[0][0], route[0][1]], next: 1 % route.length };
}

/**
 * Passanten für die aktuelle Tageszeit planen: Laufblatt reihum, Route aus `routes` (reihum, jede zweite Figur
 * läuft andersherum) oder – ohne Routen – zwischen zufälligen begehbaren Punkten. Startpunkte verteilt über die Route.
 */
export function planPassersby(def: AmbientDef | undefined, slot: TimeSlot, options: PlanOptions): PasserbyPlan[] {
  const count = ambientCount(def, slot);
  if (!def || !count) return [];
  const random = seededRandom(hashSeed(options.seed));
  const routes = (def.routes ?? []).filter((route) => route.length >= 1);
  const plans: PasserbyPlan[] = [];
  for (let i = 0; i < count; i++) {
    let points: Point[];
    if (routes.length) {
      const base = routes[i % routes.length];
      points = Math.floor(i / routes.length) % 2 === 1 ? [...base].reverse() : [...base];
    } else {
      points = [];
      const stops = 2 + Math.floor(random() * 2);
      for (let k = 0; k < stops; k++) {
        const point = randomWalkable(random, options);
        if (point) points.push(point);
      }
    }
    if (!points.length) continue;
    const { route, anchors } = expandRoute(points, options.findPath, true);
    const share = (i + random() * 0.6) / count;
    const { at, next } = pointOnLoop(route, share * loopLength(route));
    plans.push({
      id: `passant-${i}`,
      sprite: def.sprites[i % def.sprites.length],
      route,
      anchors,
      index: next,
      start: [Math.round(at[0]), Math.round(at[1])],
      speed: 38 + Math.round(random() * 32),
    });
  }
  return plans;
}

/**
 * Spruchauswahl: nur Sprüche, deren Bedingung gilt; noch nie gezeigte zuerst (Gedächtnis über `seen`,
 * das die Szene je Karte für die Sitzung aufbewahrt). Sind alle gezeigt, zufällig – aber nicht zweimal hintereinander.
 */
export function pickBark(barks: AmbientDef['barks'], evaluate: (condition?: Condition) => boolean, seen: Set<string>, random: () => number, last: string | null = null): string | null {
  const eligible = (barks ?? []).filter((bark) => bark.text.trim() && evaluate(bark.when)).map((bark) => bark.text);
  if (!eligible.length) return null;
  const fresh = eligible.filter((text) => !seen.has(text));
  const pool = fresh.length ? fresh : eligible.length > 1 ? eligible.filter((text) => text !== last) : eligible;
  const text = pool[Math.min(pool.length - 1, Math.floor(random() * pool.length))];
  seen.add(text);
  return text;
}

/** Pause bis zum nächsten Spruch eines Passanten (ms). */
export function nextBarkDelay(random: () => number): number {
  return 7000 + Math.round(random() * 9000);
}

/** Anzeigedauer einer Sprechblase nach Textlänge (ms). */
export function bubbleDuration(text: string): number {
  return Math.max(2600, Math.min(6500, 1600 + text.length * 55));
}
