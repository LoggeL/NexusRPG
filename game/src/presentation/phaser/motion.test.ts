import { describe, expect, it } from 'vitest';
import type { Point } from '../../modules/contracts';
import { expandRoute, facingFrom, hashSeed, idleBreath, seededRandom, stepRoute, type RouteWalker } from './motion';

const walker = (route: Point[], options: Partial<RouteWalker> = {}): RouteWalker => ({ route, index: 0, waitUntil: 0, mode: 'loop', pause: () => 0, ...options });

describe('Blickrichtung', () => {
  it('nimmt die stärkere Achse', () => {
    expect(facingFrom(5, 1, 's')).toBe('e');
    expect(facingFrom(-5, 1, 's')).toBe('w');
    expect(facingFrom(1, 5, 'e')).toBe('s');
    expect(facingFrom(1, -5, 'e')).toBe('n');
    expect(facingFrom(0, 0, 'w')).toBe('w');
  });

  it('hält mit Hysterese die bisherige Richtung beim Diagonallaufen', () => {
    expect(facingFrom(1, 1.2, 'e', 0.3)).toBe('e');
    expect(facingFrom(1.2, 1, 's', 0.3)).toBe('s');
    // Deutlich andere Richtung wechselt trotzdem.
    expect(facingFrom(1, 2, 'e', 0.3)).toBe('s');
    // Gegenrichtung zählt nicht als „bisherige“ Achse.
    expect(facingFrom(-1, 1.1, 'e', 0.3)).toBe('s');
  });
});

describe('Routenlaufen', () => {
  it('läuft gleichmäßig über Wegpunkte hinweg (ohne Pause)', () => {
    const w = walker([[10, 0], [10, 10], [0, 0]]);
    const step = stepRoute(w, [0, 0], 15, 0);
    expect(step.x).toBeCloseTo(10);
    expect(step.y).toBeCloseTo(5);
    expect(step.reached).toBe(0);
    expect(w.index).toBe(1);
    expect(step.walking).toBe(true);
  });

  it('wartet an Wegpunkten mit Pause', () => {
    const w = walker([[10, 0], [20, 0]], { pause: (index) => (index === 0 ? 1000 : 0) });
    const first = stepRoute(w, [0, 0], 50, 100);
    expect(first.x).toBe(10);
    expect(w.waitUntil).toBe(1100);
    const waiting = stepRoute(w, [10, 0], 50, 500);
    expect(waiting.walking).toBe(false);
    expect(waiting.x).toBe(10);
    const again = stepRoute(w, [10, 0], 5, 1200);
    expect(again.x).toBe(15);
  });

  it('zyklisch zurück zum Anfang, einmalig bleibt am Ende stehen', () => {
    const loop = walker([[10, 0], [0, 0]]);
    stepRoute(loop, [0, 0], 10, 0);
    stepRoute(loop, [10, 0], 10, 0);
    expect(loop.index).toBe(0);
    const once = walker([[10, 0], [20, 0]], { mode: 'once' });
    const step = stepRoute(once, [0, 0], 100, 0);
    expect(step.x).toBe(20);
    expect(once.finished).toBe(true);
    expect(stepRoute(once, [20, 0], 100, 0).walking).toBe(false);
  });

  it('leere Route bewegt nichts', () => {
    expect(stepRoute(walker([]), [3, 4], 10, 0)).toMatchObject({ x: 3, y: 4, walking: false });
  });

  it('rollt Routen über die Pfadsuche aus und markiert Original-Wegpunkte', () => {
    const findPath = (from: Point, to: Point): Point[] => [[(from[0] + to[0]) / 2, (from[1] + to[1]) / 2 + 50], to];
    const loop = expandRoute([[0, 0], [100, 0]], findPath, true);
    expect(loop.route).toEqual([[0, 0], [50, 50], [100, 0], [50, 50]]);
    expect(loop.anchors).toEqual([true, false, true, false]);
    const open = expandRoute([[0, 0], [100, 0]], findPath, false);
    expect(open.route).toEqual([[0, 0], [50, 50], [100, 0]]);
    expect(expandRoute([], findPath, true).route).toEqual([]);
  });
});

describe('Kleinkram', () => {
  it('Atmen bleibt im Rahmen', () => {
    for (let t = 0; t < 5000; t += 137) {
      const value = idleBreath(t, 0);
      expect(value).toBeGreaterThanOrEqual(0.988);
      expect(value).toBeLessThanOrEqual(1.012);
    }
  });

  it('Zufall mit Startwert ist reproduzierbar', () => {
    const a = seededRandom(hashSeed('bahnhof-mitte:1:tag'));
    const b = seededRandom(hashSeed('bahnhof-mitte:1:tag'));
    const values = Array.from({ length: 5 }, () => a());
    expect(values).toEqual(Array.from({ length: 5 }, () => b()));
    for (const value of values) { expect(value).toBeGreaterThanOrEqual(0); expect(value).toBeLessThan(1); }
    expect(hashSeed('a')).not.toBe(hashSeed('b'));
  });
});
