// Gemeinsame Bausteine für Draufsicht-Spiele mit Sichtkegeln (akt-schleichen, akt-overwatch):
// SVG-Helfer, Wände als Rechtecke, Sichtlinien, Kegel-Polygone (an Wänden abgeschnitten) und Streifengänge.
import { clamp } from './util';

export const SVGNS = 'http://www.w3.org/2000/svg';

/** Kleines Hyperscript für SVG-Elemente. */
export function s<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number> = {}, ...children: (SVGElement | string)[]): SVGElementTagNameMap[K] {
  const element = document.createElementNS(SVGNS, tag);
  for (const [key, value] of Object.entries(attrs)) element.setAttribute(key, String(value));
  for (const child of children) element.append(child);
  return element;
}

export interface Rect { x: number; y: number; w: number; h: number }
export type Pt = readonly [number, number];

export const inRect = (x: number, y: number, r: Rect, pad = 0) => x >= r.x - pad && x <= r.x + r.w + pad && y >= r.y - pad && y <= r.y + r.h + pad;
export const insideAny = (x: number, y: number, walls: readonly Rect[], pad = 0) => walls.some((r) => inRect(x, y, r, pad));

/** Sichtlinie von a nach b durch eine Wand verdeckt? */
export function blocked(ax: number, ay: number, bx: number, by: number, walls: readonly Rect[]): boolean {
  const dist = Math.hypot(bx - ax, by - ay);
  const steps = Math.max(1, Math.ceil(dist / 0.5));
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    if (insideAny(ax + (bx - ax) * t, ay + (by - ay) * t, walls)) return true;
  }
  return false;
}

/** Wie weit reicht ein Strahl, bevor er auf eine Wand trifft? */
export function rayLength(x: number, y: number, angle: number, max: number, walls: readonly Rect[]): number {
  const dx = Math.cos(angle), dy = Math.sin(angle);
  for (let d = 0.5; d <= max; d += 0.5) if (insideAny(x + dx * d, y + dy * d, walls)) return Math.max(0, d - 0.5);
  return max;
}

/** Kegel als SVG-Punkteliste (Strahlen enden an Wänden). */
export function conePoints(x: number, y: number, dir: number, half: number, len: number, walls: readonly Rect[], rays = 14): string {
  const pts: string[] = [`${x.toFixed(2)},${y.toFixed(2)}`];
  for (let i = 0; i <= rays; i++) {
    const a = dir - half + (2 * half * i) / rays;
    const l = rayLength(x, y, a, len, walls);
    pts.push(`${(x + Math.cos(a) * l).toFixed(2)},${(y + Math.sin(a) * l).toFixed(2)}`);
  }
  return pts.join(' ');
}

const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));

/** Punkt im Sichtkegel (Reichweite, Winkel, freie Sichtlinie)? */
export function inCone(px: number, py: number, x: number, y: number, dir: number, half: number, len: number, walls: readonly Rect[]): boolean {
  const dist = Math.hypot(px - x, py - y);
  if (dist > len) return false;
  if (dist > 1.2 && Math.abs(wrap(Math.atan2(py - y, px - x) - dir)) > half) return false;
  return !blocked(x, y, px, py, walls);
}

/** Zeigerposition in SVG-Koordinaten (berücksichtigt preserveAspectRatio). */
export function svgPoint(svg: SVGSVGElement, event: PointerEvent | MouseEvent): { x: number; y: number } {
  const matrix = svg.getScreenCTM();
  if (!matrix) return { x: 0, y: 0 };
  const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
  return { x: point.x, y: point.y };
}

/** Wache oder Drohne auf Streife: läuft Punkte ab, bleibt kurz stehen, dreht sich weich. */
export interface Patrol {
  pts: Pt[];
  i: number;
  x: number;
  y: number;
  dir: number;
  speed: number;
  pause: number;
  waitLeft: number;
  /** Untersucht ein Geräusch (Ziel, Restzeit). */
  noise: { x: number; y: number; left: number } | null;
}

export function patrol(pts: Pt[], speed: number, pause = 0.8): Patrol {
  const [x, y] = pts[0];
  const next = pts[1] ?? pts[0];
  return { pts, i: pts.length > 1 ? 1 : 0, x, y, dir: Math.atan2(next[1] - y, next[0] - x), speed, pause, waitLeft: 0, noise: null };
}

function turnTo(p: Patrol, target: number, dt: number, rate = 4) {
  const diff = wrap(target - p.dir);
  p.dir = wrap(p.dir + clamp(diff, -rate * dt, rate * dt));
}

/** Einen Schritt der Streife (inkl. Geräusch untersuchen). */
export function stepPatrol(p: Patrol, dt: number, walls: readonly Rect[] = []) {
  const goal = p.noise ? [p.noise.x, p.noise.y] as const : p.pts[p.i];
  if (p.noise) {
    p.noise.left -= dt;
    if (p.noise.left <= 0) { p.noise = null; return; }
  }
  if (p.waitLeft > 0 && !p.noise) { p.waitLeft -= dt; if (p.pts.length <= 1) p.dir = wrap(p.dir + dt * 0.6); return; }
  const dx = goal[0] - p.x, dy = goal[1] - p.y;
  const dist = Math.hypot(dx, dy);
  if (dist < 0.4) {
    if (p.noise) { turnTo(p, p.dir + 1.2, dt, 1.5); return; }
    p.waitLeft = p.pause;
    p.i = (p.i + 1) % p.pts.length;
    return;
  }
  const want = Math.atan2(dy, dx);
  turnTo(p, want, dt);
  if (Math.abs(wrap(want - p.dir)) < 0.6) {
    const step = Math.min(dist, p.speed * dt * (p.noise ? 1.3 : 1));
    const nx = p.x + (dx / dist) * step, ny = p.y + (dy / dist) * step;
    if (!insideAny(nx, ny, walls, 0.6)) { p.x = nx; p.y = ny; }
    else if (p.noise) p.noise = null;
  }
}

/** Kamera, die hin- und herschwenkt. */
export interface Cam { x: number; y: number; base: number; amp: number; speed: number; phase: number; dir: number; off: number }
export function cam(x: number, y: number, base: number, amp = 0.7, speed = 0.7): Cam {
  return { x, y, base, amp, speed, phase: Math.random() * 6, dir: base, off: 0 };
}
export function stepCam(c: Cam, dt: number) {
  c.phase += dt * c.speed;
  c.dir = c.base + Math.sin(c.phase) * c.amp;
  if (c.off > 0) c.off = Math.max(0, c.off - dt);
}

/** Wände als SVG-Rechtecke. */
export function drawWalls(group: SVGGElement, walls: readonly Rect[], className = 'sk-wall') {
  for (const r of walls) group.append(s('rect', { x: r.x, y: r.y, width: r.w, height: r.h, class: className }));
}

/** Bewegung mit Wandgleiten (Achsen getrennt). */
export function moveWithWalls(x: number, y: number, dx: number, dy: number, radius: number, walls: readonly Rect[], width: number, height: number) {
  let nx = clamp(x + dx, radius, width - radius), ny = y;
  if (insideAny(nx, ny, walls, radius)) nx = x;
  ny = clamp(y + dy, radius, height - radius);
  if (insideAny(nx, ny, walls, radius)) ny = y;
  return { x: nx, y: ny };
}
