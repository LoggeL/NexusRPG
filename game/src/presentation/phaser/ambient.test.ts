import { describe, expect, it } from 'vitest';
import type { AmbientDef, Condition, Point } from '../../modules/contracts';
import { ambientCount, bubbleDuration, MAX_PASSERSBY, pickBark, planPassersby, pointOnLoop } from './ambient';
import { seededRandom } from './motion';

const straight = (_from: Point, to: Point): Point[] => [to];
const options = { seed: 'karte:1:tag', size: [1536, 1024] as const, walkable: (_x: number, y: number) => y > 300, findPath: straight };

describe('Passanten', () => {
  const def: AmbientDef = { count: 3, sprites: ['a-walk', 'b-walk'], routes: [[[100, 400], [900, 400]]], bySlot: { nacht: 1 } };

  it('Anzahl je Tageszeit, begrenzt und ohne Laufblätter null', () => {
    expect(ambientCount(def, 'tag')).toBe(3);
    expect(ambientCount(def, 'nacht')).toBe(1);
    expect(ambientCount({ ...def, count: 99 }, 'tag')).toBe(MAX_PASSERSBY);
    expect(ambientCount({ ...def, sprites: [] }, 'tag')).toBe(0);
    expect(ambientCount(undefined, 'tag')).toBe(0);
  });

  it('plant reproduzierbar, Laufblätter reihum, jede zweite Runde andersherum', () => {
    const plans = planPassersby(def, 'tag', options);
    expect(plans).toEqual(planPassersby(def, 'tag', options));
    expect(plans.map((plan) => plan.sprite)).toEqual(['a-walk', 'b-walk', 'a-walk']);
    expect(plans[0].route[0]).toEqual([100, 400]);
    const two = planPassersby({ ...def, count: 2, routes: [[[100, 400], [900, 400]]] }, 'tag', options);
    expect(two[1].route[0]).toEqual([900, 400]);
    // Startpunkte liegen verteilt auf der Route.
    const starts = new Set(plans.map((plan) => plan.start.join(',')));
    expect(starts.size).toBe(3);
    for (const plan of plans) {
      expect(plan.start[1]).toBe(400);
      expect(plan.speed).toBeGreaterThanOrEqual(38);
      expect(plan.anchors.length).toBe(plan.route.length);
    }
  });

  it('ohne Routen zwischen zufälligen begehbaren Punkten', () => {
    const plans = planPassersby({ count: 4, sprites: ['a-walk'] }, 'tag', options);
    expect(plans).toHaveLength(4);
    for (const plan of plans) for (const point of plan.route) expect(point[1]).toBeGreaterThan(300);
  });

  it('Punkt auf zyklischer Route', () => {
    const route: Point[] = [[0, 0], [10, 0]];
    expect(pointOnLoop(route, 5)).toEqual({ at: [5, 0], next: 1 });
    expect(pointOnLoop(route, 15)).toEqual({ at: [5, 0], next: 0 });
    expect(pointOnLoop([[3, 3]], 7).at).toEqual([3, 3]);
  });
});

describe('Passantensprüche', () => {
  const barks: AmbientDef['barks'] = [
    { text: 'Eins' },
    { text: 'Zwei' },
    { text: 'Morgens', when: { time: 'morgen' } },
  ];
  const evaluate = (condition?: Condition) => !condition;

  it('neue Sprüche zuerst, Bedingungen gelten', () => {
    const seen = new Set<string>();
    const random = seededRandom(1);
    const first = pickBark(barks, evaluate, seen, random);
    const second = pickBark(barks, evaluate, seen, random, first);
    expect(new Set([first, second])).toEqual(new Set(['Eins', 'Zwei']));
    expect(seen.has('Morgens')).toBe(false);
  });

  it('wenn alle gezeigt sind: nicht zweimal hintereinander', () => {
    const seen = new Set(['Eins', 'Zwei']);
    const random = seededRandom(7);
    let last: string | null = 'Eins';
    for (let i = 0; i < 20; i++) {
      const next = pickBark(barks, evaluate, seen, random, last);
      expect(next).not.toBe(last);
      last = next;
    }
  });

  it('ohne passenden Spruch null; Anzeigedauer nach Länge', () => {
    expect(pickBark([{ text: 'Nur nachts', when: { time: 'nacht' } }], evaluate, new Set(), Math.random)).toBeNull();
    expect(pickBark(undefined, evaluate, new Set(), Math.random)).toBeNull();
    expect(bubbleDuration('Hi')).toBe(2600);
    expect(bubbleDuration('x'.repeat(500))).toBe(6500);
  });
});
