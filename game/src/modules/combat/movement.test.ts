import { describe, expect, it } from 'vitest';
import { battle, buddy, hero, place } from './__fixtures__/combat';
import { cellKey } from './grid';
import { distanceField, findPath, reachableCells } from './movement';

describe('Bewegung', () => {
  it('reicht 3 + floor(Reflexe / 3) Felder je Aktionspunkt', () => {
    const state = battle('duell');
    const held = place(state, 'held', [0, 4]);
    expect(held.move).toBe(5);
    const one = reachableCells(state, held, 1);
    expect(Math.max(...one.map(c => c.steps))).toBe(5);
    expect(one.every(c => c.ap === 1)).toBe(true);
    const two = reachableCells(state, held, 2);
    expect(Math.max(...two.map(c => c.steps))).toBe(10);
    expect(two.find(c => c.steps === 7)?.ap).toBe(2);
    expect(reachableCells(state, held, 0)).toEqual([]);
  });

  it('läuft nicht durch Gegner und endet nie auf belegten Feldern', () => {
    const state = battle('duell');
    const held = place(state, 'held', [0, 3]);
    place(state, 'schlaeger#1', [1, 3]);
    const route = findPath(state, held, [2, 3], 1)!;
    expect(route.steps).toBe(4);
    expect(route.path.some(c => c[0] === 1 && c[1] === 3)).toBe(false);
    expect(findPath(state, held, [1, 3], 1)).toBeNull();
  });

  it('durchquert Verbündete, bleibt aber nicht auf ihnen stehen', () => {
    const state = battle('duell', { party: [hero(), buddy()] });
    const held = place(state, 'held', [0, 3]);
    place(state, 'kumpel', [1, 3]);
    expect(findPath(state, held, [2, 3], 1)!.steps).toBe(2);
    expect(findPath(state, held, [1, 3], 1)).toBeNull();
  });

  it('meidet Gefahrenfelder bei gleicher Weglänge', () => {
    const state = battle('deckung');
    const held = place(state, 'held', [5, 5]);
    const route = findPath(state, held, [7, 7], 1)!;
    expect(route.steps).toBe(4);
    expect(route.hazards).toBe(0);
    const through = findPath(state, place(state, 'held', [6, 5]), [6, 7], 1)!;
    expect(through.steps).toBe(2);
    expect(through.hazards).toBe(1);
  });

  it('meldet gegnerische Überwachung auf dem Weg', () => {
    const state = battle('duell');
    const held = place(state, 'held', [0, 3]);
    place(state, 'schlaeger#1', [4, 5], { overwatch: true, weapon: { kind: 'fernkampf', damage: 4, range: 3 } });
    const route = findPath(state, held, [4, 3], 1)!;
    expect(route.watched).toEqual(['schlaeger#1']);
    expect(findPath(state, held, [0, 0], 1)!.watched).toEqual([]);
  });

  it('berechnet Entfernungsfelder um Hindernisse herum', () => {
    const state = battle('deckung');
    const held = place(state, 'held', [3, 2]);
    const field = distanceField(state, held, [[7, 2]]);
    expect(field.get(cellKey([6, 2]))).toBe(1);
    expect(field.get(cellKey([4, 2]))).toBe(7); // um h/H/# herum über Zeile 0 bzw. 4
    expect(field.has(cellKey([5, 2]))).toBe(false);
  });
});
