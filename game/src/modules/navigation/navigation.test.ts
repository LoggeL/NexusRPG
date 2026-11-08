import { describe, expect, it } from 'vitest';
import type { Point, Polygon } from '../contracts';
import {
  createNavigation, createTrail, facingFromVector, findPath, hasLineOfSight, isWalkable, moveWithSlide,
  nearestWalkablePoint, pointInPolygon, type NavArea,
} from './index';

const rect = (x: number, y: number, w: number, h: number): Polygon => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
// Laufbereich 20..620 × 20..340 mit einer Wand in der Mitte (Lücke unten bei y > 300).
const area: NavArea = { walk: [rect(20, 20, 600, 320)], block: [rect(300, 0, 40, 300)] };
// Zwei getrennte Inseln.
const islands: NavArea = { walk: [rect(20, 20, 100, 100), rect(400, 20, 100, 100)] };

const pathLength = (start: Point, path: Point[]) =>
  path.reduce((sum, p, i) => sum + Math.hypot(p[0] - (i ? path[i - 1] : start)[0], p[1] - (i ? path[i - 1] : start)[1]), 0);

describe('Begehbarkeit', () => {
  it('Punkt-in-Polygon und Sperrflächen', () => {
    const triangle: Polygon = [[0, 0], [100, 0], [0, 100]];
    expect(pointInPolygon([10, 10], triangle)).toBe(true);
    expect(pointInPolygon([80, 80], triangle)).toBe(false);
    expect(isWalkable(area, [100, 100])).toBe(true);
    expect(isWalkable(area, [320, 100])).toBe(false); // Wand
    expect(isWalkable(area, [320, 320])).toBe(true); // Lücke
    expect(isWalkable(area, [5, 5])).toBe(false);
    expect(isWalkable(area, [Number.NaN, 5])).toBe(false);
  });

  it('Fußbreite prüft seitliche Punkte', () => {
    expect(isWalkable(area, [296, 100])).toBe(true);
    expect(isWalkable(area, [296, 100], { foot: 6 })).toBe(false);
  });
});

describe('Bewegung', () => {
  it('gleitet an einer Wand entlang', () => {
    const moved = moveWithSlide(area, [290, 100], 20, 20);
    expect(moved[0]).toBeLessThan(300);
    expect(moved[1]).toBeCloseTo(120);
    expect(isWalkable(area, moved)).toBe(true);
  });

  it('bleibt an einer Ecke stehen und tunnelt nicht', () => {
    expect(moveWithSlide(area, [21, 21], -10, -10)).toEqual([21, 21]);
    const far = moveWithSlide(area, [200, 100], 500, 0);
    expect(far[0]).toBeLessThan(300);
  });

  it('Blickrichtung aus dominanter Achse', () => {
    expect(facingFromVector(5, 1)).toBe('e');
    expect(facingFromVector(-5, 1)).toBe('w');
    expect(facingFromVector(1, 5)).toBe('s');
    expect(facingFromVector(1, -5)).toBe('n');
    expect(facingFromVector(0, 0, 'w')).toBe('w');
  });
});

describe('Pfadsuche', () => {
  it('direkte Sichtlinie liefert nur das Ziel', () => {
    expect(findPath(area, [50, 50], [250, 250])).toEqual([[250, 250]]);
    expect(findPath(area, [50, 50], [50, 50])).toEqual([]);
  });

  it('führt um ein Hindernis herum durch die Lücke', () => {
    const start: Point = [200, 100];
    const goal: Point = [450, 100];
    const path = findPath(area, start, goal)!;
    expect(path.at(-1)).toEqual(goal);
    expect(path.length).toBeGreaterThanOrEqual(2);
    expect(path.length).toBeLessThan(8); // geglättet
    let prev = start;
    for (const point of path) {
      expect(hasLineOfSight(area, prev, point)).toBe(true);
      prev = point;
    }
    expect(path.some(p => p[1] > 300)).toBe(true);
    expect(pathLength(start, path)).toBeLessThan(700);
  });

  it('Ziel außerhalb → nächster begehbarer Punkt', () => {
    const path = findPath(area, [100, 100], [100, 355])!;
    const end = path.at(-1)!;
    expect(isWalkable(area, end)).toBe(true);
    expect(end[1]).toBeGreaterThan(335);
    expect(Math.abs(end[0] - 100)).toBeLessThan(4);
    const inWall = findPath(area, [100, 100], [320, 150])!;
    expect(isWalkable(area, inWall.at(-1)!)).toBe(true);
  });

  it('unerreichbares Ziel → so nah wie möglich', () => {
    const path = findPath(islands, [50, 50], [450, 50])!;
    const end = path.at(-1)!;
    expect(isWalkable(islands, end)).toBe(true);
    expect(end[0]).toBeGreaterThan(110);
    expect(end[0]).toBeLessThanOrEqual(120);
  });

  it('Start außerhalb wird auf die Fläche gezogen, leere Fläche → null', () => {
    const path = findPath(area, [5, 100], [100, 100])!;
    expect(isWalkable(area, path[0])).toBe(true);
    expect(findPath({ walk: [] }, [0, 0], [10, 10])).toBeNull();
  });

  it('nächster begehbarer Punkt liegt nah am Rand', () => {
    const p = nearestWalkablePoint(area, [320, 100])!;
    expect(isWalkable(area, p)).toBe(true);
    expect(Math.abs(p[0] - 320)).toBeLessThanOrEqual(22);
    expect(nearestWalkablePoint(area, [100, 100])).toEqual([100, 100]);
  });

  it('Objektschnittstelle für die Darstellung', () => {
    const nav = createNavigation(area, { foot: 2 });
    expect(nav.walkable(100, 100)).toBe(true);
    expect(nav.findPath([200, 100], [450, 100]).at(-1)).toEqual([450, 100]);
    expect(nav.nearestWalkable([320, 100], 5)).toBeNull();
    expect(nav.nearestWalkable([320, 100], 40)).not.toBeNull();
    expect(createNavigation({ walk: [] }).findPath([0, 0], [5, 5])).toEqual([]);
  });
});

describe('Follower-Spur', () => {
  it('liefert Punkte im Pfadabstand hinter der Führung', () => {
    const trail = createTrail([0, 0], { maxLength: 100 });
    for (let x = 1; x <= 50; x += 1) trail.record([x, 0]);
    for (let y = 1; y <= 30; y += 1) trail.record([50, y]);
    expect(trail.sample(0)).toEqual([50, 30]);
    expect(trail.sample(10)).toEqual([50, 20]);
    expect(trail.sample(40)).toEqual([40, 0]); // um die Ecke gemessen
    expect(trail.sample(1000)).toEqual([0, 0]);
    for (let x = 51; x <= 200; x += 1) trail.record([x, 30]);
    expect(trail.length()).toBeLessThanOrEqual(101);
    expect(trail.sample(1000)[0]).toBeGreaterThanOrEqual(99);
    trail.record([200.2, 30]); // zu kleiner Schritt
    expect(trail.sample(0)).toEqual([200, 30]);
    trail.reset([5, 5]);
    expect(trail.sample(20)).toEqual([5, 5]);
  });
});
