// Begehbarkeit, Gleiten an Kanten, Rasterpfadsuche (A*) und Follower-Spur.
import type { Facing, Point, Polygon } from '../contracts';

export interface NavArea {
  walk: readonly Polygon[];
  block?: readonly Polygon[];
  /** Kartengröße in Pixeln (MapDef.size); Standard 1536×1024. */
  size?: readonly [w: number, h: number];
}

export interface NavOptions {
  /** Zellgröße des Suchrasters in Pixeln (Standard 4). */
  cell?: number;
  width?: number;
  height?: number;
  /**
   * Halbe Fußbreite in Pixeln (Standard 0 = reiner Punkttest). Mit `foot > 0` müssen zusätzlich
   * die Punkte links/rechts im Abstand `foot` und `foot / 2` darüber begehbar sein.
   */
  foot?: number;
}

export const NAV_CELL = 4;
const DEFAULT_W = 1536;
const DEFAULT_H = 1024;
const SQRT2 = Math.SQRT2;

// ---------------------------------------------------------------------------
// Geometrie

/** Gerade-Ungerade-Regel; Punkte exakt auf der Kante zählen nicht sicher als innen. */
export function pointInPolygon(point: Point, polygon: Polygon): boolean {
  const [x, y] = point;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

const pointWalkable = (area: NavArea, x: number, y: number): boolean =>
  area.walk.some(poly => pointInPolygon([x, y], poly)) && !(area.block ?? []).some(poly => pointInPolygon([x, y], poly));

/** Begehbar = in irgendeinem Laufpolygon und in keiner Sperrfläche (optional mit Fußbreite). */
export function isWalkable(area: NavArea, point: Point, options: NavOptions = {}): boolean {
  const [x, y] = point;
  if (!Number.isFinite(x) || !Number.isFinite(y) || !pointWalkable(area, x, y)) return false;
  const foot = options.foot ?? 0;
  if (foot <= 0) return true;
  return pointWalkable(area, x - foot, y) && pointWalkable(area, x + foot, y) && pointWalkable(area, x, y - foot / 2);
}

/** Prüft die Strecke in Schritten ≤ 1 px auf Begehbarkeit (inklusive Endpunkte). */
export function hasLineOfSight(area: NavArea, from: Point, to: Point, options: NavOptions = {}): boolean {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const steps = Math.max(1, Math.ceil(Math.hypot(dx, dy)));
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    if (!isWalkable(area, [from[0] + dx * t, from[1] + dy * t], options)) return false;
  }
  return true;
}

/**
 * Bewegt um (dx, dy) in Teilschritten ≤ 2 px. Ist der volle Schritt gesperrt, wird jede Achse
 * einzeln versucht – so gleitet die Figur an schrägen Kanten entlang statt stehen zu bleiben.
 */
export function moveWithSlide(area: NavArea, from: Point, dx: number, dy: number, options: NavOptions = {}): Point {
  if (!Number.isFinite(dx) || !Number.isFinite(dy)) return from;
  const steps = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)) / 2));
  const sx = dx / steps;
  const sy = dy / steps;
  let x = from[0];
  let y = from[1];
  for (let i = 0; i < steps; i += 1) {
    if (isWalkable(area, [x + sx, y + sy], options)) { x += sx; y += sy; }
    else if (sx !== 0 && isWalkable(area, [x + sx, y], options)) x += sx;
    else if (sy !== 0 && isWalkable(area, [x, y + sy], options)) y += sy;
    else break;
  }
  return [x, y];
}

/** Blickrichtung nach der dominanten Achse; bei Stillstand bleibt `fallback`. */
export function facingFromVector(dx: number, dy: number, fallback: Facing = 's'): Facing {
  if (Math.abs(dx) < 1e-6 && Math.abs(dy) < 1e-6) return fallback;
  if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? 'e' : 'w';
  return dy > 0 ? 's' : 'n';
}

// ---------------------------------------------------------------------------
// Raster

export interface NavGrid {
  cell: number;
  cols: number;
  rows: number;
  walkable: Uint8Array;
}

const gridCache = new WeakMap<NavArea, Map<string, NavGrid>>();

/** Raster aus Zellmittelpunkten; wird je Fläche und Größe zwischengespeichert. */
export function navGrid(area: NavArea, options: NavOptions = {}): NavGrid {
  const cell = options.cell ?? NAV_CELL;
  const width = options.width ?? area.size?.[0] ?? DEFAULT_W;
  const height = options.height ?? area.size?.[1] ?? DEFAULT_H;
  const key = `${cell}:${width}:${height}:${options.foot ?? 0}`;
  let byKey = gridCache.get(area);
  const cached = byKey?.get(key);
  if (cached) return cached;
  const cols = Math.ceil(width / cell);
  const rows = Math.ceil(height / cell);
  const walkable = new Uint8Array(cols * rows);
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      if (isWalkable(area, [c * cell + cell / 2, r * cell + cell / 2], options)) walkable[r * cols + c] = 1;
    }
  }
  const grid = { cell, cols, rows, walkable };
  if (!byKey) { byKey = new Map(); gridCache.set(area, byKey); }
  byKey.set(key, grid);
  return grid;
}

const center = (grid: NavGrid, index: number): Point => [
  (index % grid.cols) * grid.cell + grid.cell / 2,
  Math.floor(index / grid.cols) * grid.cell + grid.cell / 2,
];

function nearestCell(grid: NavGrid, point: Point): number {
  let best = -1;
  let bestDist = Infinity;
  for (let i = 0; i < grid.walkable.length; i += 1) {
    if (!grid.walkable[i]) continue;
    const [cx, cy] = center(grid, i);
    const d = (cx - point[0]) ** 2 + (cy - point[1]) ** 2;
    if (d < bestDist) { bestDist = d; best = i; }
  }
  return best;
}

function cellOf(grid: NavGrid, point: Point): number {
  const c = Math.floor(point[0] / grid.cell);
  const r = Math.floor(point[1] / grid.cell);
  if (c < 0 || r < 0 || c >= grid.cols || r >= grid.rows) return -1;
  return r * grid.cols + c;
}

/** Nächster begehbarer Punkt; liegt `point` schon auf begehbarer Fläche, wird er unverändert geliefert. */
export function nearestWalkablePoint(area: NavArea, point: Point, options: NavOptions = {}): Point | null {
  if (isWalkable(area, point, options)) return [point[0], point[1]];
  const grid = navGrid(area, options);
  const index = nearestCell(grid, point);
  if (index < 0) return null;
  // Vom Zellmittelpunkt aus bis knapp an den Rand Richtung Zielpunkt annähern.
  let inside = center(grid, index);
  let outside: Point = [point[0], point[1]];
  for (let i = 0; i < 10; i += 1) {
    const mid: Point = [(inside[0] + outside[0]) / 2, (inside[1] + outside[1]) / 2];
    if (isWalkable(area, mid, options)) inside = mid; else outside = mid;
  }
  return inside;
}

class MinHeap {
  private items: number[] = [];
  constructor(private readonly score: Float64Array) {}
  get size() { return this.items.length; }
  push(value: number) {
    const items = this.items;
    items.push(value);
    let i = items.length - 1;
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (this.score[items[parent]] <= this.score[items[i]]) break;
      [items[parent], items[i]] = [items[i], items[parent]];
      i = parent;
    }
  }
  pop(): number {
    const items = this.items;
    const top = items[0];
    const last = items.pop() as number;
    if (items.length > 0) {
      items[0] = last;
      let i = 0;
      for (;;) {
        const l = i * 2 + 1;
        const r = l + 1;
        let m = i;
        if (l < items.length && this.score[items[l]] < this.score[items[m]]) m = l;
        if (r < items.length && this.score[items[r]] < this.score[items[m]]) m = r;
        if (m === i) break;
        [items[m], items[i]] = [items[i], items[m]];
        i = m;
      }
    }
    return top;
  }
}

const NEIGHBOURS: readonly [dc: number, dr: number, cost: number][] = [
  [1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1],
  [1, 1, SQRT2], [1, -1, SQRT2], [-1, 1, SQRT2], [-1, -1, SQRT2],
];

function astar(grid: NavGrid, start: number, goal: number): number[] {
  const { cols, rows, walkable } = grid;
  const n = walkable.length;
  const g = new Float64Array(n).fill(Infinity);
  const f = new Float64Array(n).fill(Infinity);
  const from = new Int32Array(n).fill(-1);
  const closed = new Uint8Array(n);
  const gc = goal % cols;
  const gr = Math.floor(goal / cols);
  const h = (i: number) => {
    const dc = Math.abs((i % cols) - gc);
    const dr = Math.abs(Math.floor(i / cols) - gr);
    return Math.max(dc, dr) + (SQRT2 - 1) * Math.min(dc, dr);
  };
  const heap = new MinHeap(f);
  g[start] = 0;
  f[start] = h(start);
  heap.push(start);
  let best = start;
  let bestH = h(start);
  while (heap.size > 0) {
    const current = heap.pop();
    if (closed[current]) continue;
    closed[current] = 1;
    const hc = h(current);
    if (hc < bestH) { bestH = hc; best = current; }
    if (current === goal) { best = goal; break; }
    const c = current % cols;
    const r = Math.floor(current / cols);
    for (const [dc, dr, cost] of NEIGHBOURS) {
      const nc = c + dc;
      const nr = r + dr;
      if (nc < 0 || nr < 0 || nc >= cols || nr >= rows) continue;
      const next = nr * cols + nc;
      if (!walkable[next] || closed[next]) continue;
      // Keine Ecken schneiden: beide Nachbarn der Diagonale müssen frei sein.
      if (dc !== 0 && dr !== 0 && (!walkable[r * cols + nc] || !walkable[nr * cols + c])) continue;
      const tentative = g[current] + cost;
      if (tentative < g[next]) {
        g[next] = tentative;
        f[next] = tentative + h(next);
        from[next] = current;
        heap.push(next);
      }
    }
  }
  // Unerreichbares Ziel: zur erreichbaren Zelle mit der kleinsten Restdistanz laufen.
  const path: number[] = [];
  for (let i = best; i !== -1; i = from[i]) path.push(i);
  return path.reverse();
}

/** Lässt Zwischenpunkte weg, solange eine freie Sichtlinie besteht. */
export function smoothPath(area: NavArea, points: readonly Point[], options: NavOptions = {}): Point[] {
  if (points.length <= 2) return points.map(p => [p[0], p[1]] as Point);
  const result: Point[] = [points[0]];
  let anchor = 0;
  while (anchor < points.length - 1) {
    // Weitesten sichtbaren Punkt suchen: erst in Verdopplungsschritten, dann binär. Jede gewählte Strecke
    // ist per Sichtlinie geprüft; statt n Prüfungen je Anker nur O(log n) (Klicks auf großen Karten blieben sonst bei bis zu 85 ms).
    const last = points.length - 1;
    let next = anchor + 1;
    let fail = -1;
    for (let step = 1; next < last; step *= 2) {
      const k = Math.min(last, anchor + 1 + step);
      if (!hasLineOfSight(area, points[anchor], points[k], options)) { fail = k; break; }
      next = k;
    }
    while (fail !== -1 && fail - next > 1) {
      const mid = (next + fail) >> 1;
      if (hasLineOfSight(area, points[anchor], points[mid], options)) next = mid; else fail = mid;
    }
    result.push(points[next]);
    anchor = next;
  }
  return result;
}

/**
 * Pfad von `start` zu `goal` (bzw. zum nächsten begehbaren, erreichbaren Punkt).
 * Liefert Wegpunkte ohne den Startpunkt; `[]` = schon da, `null` = keine begehbare Fläche.
 */
export function findPath(area: NavArea, start: Point, goal: Point, options: NavOptions = {}): Point[] | null {
  const grid = navGrid(area, options);
  const from = nearestWalkablePoint(area, start, options);
  const to = nearestWalkablePoint(area, goal, options);
  if (!from || !to) return null;
  if (Math.hypot(to[0] - start[0], to[1] - start[1]) < 0.5) return [];
  if (hasLineOfSight(area, from, to, options)) return samePoint(from, start) ? [to] : [from, to];

  const startCell = gridCell(grid, from);
  const goalCell = gridCell(grid, to);
  if (startCell < 0 || goalCell < 0) return null;
  const cells = astar(grid, startCell, goalCell);
  const reached = cells[cells.length - 1] === goalCell;
  const points: Point[] = [from, ...cells.slice(1, -1).map(i => center(grid, i))];
  points.push(reached ? to : center(grid, cells[cells.length - 1]));
  const smooth = smoothPath(area, points, options);
  if (samePoint(smooth[0], start)) smooth.shift();
  return smooth;
}

const samePoint = (a: Point, b: Point) => Math.abs(a[0] - b[0]) < 1e-9 && Math.abs(a[1] - b[1]) < 1e-9;

/** Zelle des Punkts, falls begehbar, sonst die nächstgelegene begehbare Zelle. */
function gridCell(grid: NavGrid, point: Point): number {
  const index = cellOf(grid, point);
  if (index >= 0 && grid.walkable[index]) return index;
  return nearestCell(grid, point);
}

// ---------------------------------------------------------------------------
// Objektschnittstelle für die Darstellung

export interface Navigation {
  walkable(x: number, y: number): boolean;
  /** Wegpunkte ohne Startpunkt; leer, wenn schon am Ziel oder keine begehbare Fläche existiert. */
  findPath(from: Point, to: Point): Point[];
  /** Nächster begehbarer Punkt; mit `maxRadius` nur innerhalb dieses Abstands. */
  nearestWalkable(point: Point, maxRadius?: number): Point | null;
  move(from: Point, dx: number, dy: number): Point;
  lineOfSight(from: Point, to: Point): boolean;
}

/** Bündelt die Funktionen für eine Karte (z. B. `createNavigation(mapDef, { foot: 4 })`). */
export function createNavigation(area: NavArea, options: NavOptions = {}): Navigation {
  return {
    walkable: (x, y) => isWalkable(area, [x, y], options),
    findPath: (from, to) => findPath(area, from, to, options) ?? [],
    nearestWalkable(point, maxRadius) {
      const found = nearestWalkablePoint(area, point, options);
      if (!found || maxRadius === undefined) return found;
      return Math.hypot(found[0] - point[0], found[1] - point[1]) <= maxRadius ? found : null;
    },
    move: (from, dx, dy) => moveWithSlide(area, from, dx, dy, options),
    lineOfSight: (from, to) => hasLineOfSight(area, from, to, options),
  };
}

// ---------------------------------------------------------------------------
// Follower-Spur

export interface Trail {
  /** Neue Führungsposition melden (kleine Bewegungen < `minStep` werden zusammengefasst). */
  record(point: Point): void;
  /** Punkt `distance` Pixel Pfadlänge hinter der Führung. */
  sample(distance: number): Point;
  reset(point: Point): void;
  /** Gespeicherte Länge der Spur in Pixeln. */
  length(): number;
}

/** Brotkrumen-Puffer der Führungsposition; Begleiter folgen in festen Pfadabständen. */
export function createTrail(start: Point, options: { maxLength?: number; minStep?: number } = {}): Trail {
  const maxLength = options.maxLength ?? 400;
  const minStep = options.minStep ?? 1;
  // Neueste Position am Ende.
  let points: Point[] = [[start[0], start[1]]];
  let total = 0;

  const trim = () => {
    while (points.length > 2) {
      const seg = Math.hypot(points[1][0] - points[0][0], points[1][1] - points[0][1]);
      if (total - seg < maxLength) break;
      total -= seg;
      points.shift();
    }
  };

  return {
    record(point) {
      const last = points[points.length - 1];
      const d = Math.hypot(point[0] - last[0], point[1] - last[1]);
      if (d < minStep) return;
      points.push([point[0], point[1]]);
      total += d;
      trim();
    },
    sample(distance) {
      let remaining = Math.max(0, distance);
      for (let i = points.length - 1; i > 0; i -= 1) {
        const a = points[i];
        const b = points[i - 1];
        const seg = Math.hypot(a[0] - b[0], a[1] - b[1]);
        if (remaining <= seg) {
          const t = seg === 0 ? 0 : remaining / seg;
          return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
        }
        remaining -= seg;
      }
      const oldest = points[0];
      return [oldest[0], oldest[1]];
    },
    reset(point) {
      points = [[point[0], point[1]]];
      total = 0;
    },
    length: () => total,
  };
}
export * from './subway';
