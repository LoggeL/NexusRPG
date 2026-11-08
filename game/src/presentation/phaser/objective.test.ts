import { describe, expect, it } from 'vitest';
import type { Condition, MapDef, MapId, ObjectiveView } from '../../modules/contracts';
import { edgeIndicator, firstExitTowards, objectiveTarget } from './objective';

const map = (id: string, exits: { id: string; to: string; x: number; when?: Condition }[]): MapDef => ({
  id, name: id, size: [1536, 1024], district: 'd', lighting: 'outdoor', bg: `bg-${id}`, walk: [], hotspots: [], entries: {}, ambience: 'unterstadt',
  exits: exits.map((exit) => ({ id: exit.id, to: exit.to, entry: 'start', label: `Nach ${exit.to}`, rect: [exit.x, 500, 40, 40], ...(exit.when ? { when: exit.when } : {}) })),
}) as MapDef;

const maps: Record<MapId, MapDef> = {
  a: map('a', [{ id: 'ab', to: 'b', x: 100 }, { id: 'ad', to: 'd', x: 900, when: { flag: 'zu' } }]),
  b: map('b', [{ id: 'ba', to: 'a', x: 0 }, { id: 'bc', to: 'c', x: 600 }]),
  c: map('c', [{ id: 'cb', to: 'b', x: 0 }]),
  d: map('d', [{ id: 'dc', to: 'c', x: 0 }]),
};
const open = (condition?: Condition) => !condition;
const objective = (marker?: ObjectiveView['marker']): ObjectiveView => ({ quest: 'q', title: 'Paket abliefern', text: 'Bring das Paket zu Dante.', ...(marker ? { marker } : {}) });

describe('Zielmarker', () => {
  it('findet den ersten Ausgang auf dem kürzesten offenen Weg', () => {
    expect(firstExitTowards(maps, 'a', 'c', open)?.id).toBe('ab');
    expect(firstExitTowards(maps, 'a', 'a', open)).toBeNull();
    // Nur über einen gesperrten Ausgang erreichbar → trotzdem zeigen (zweiter Durchgang).
    expect(firstExitTowards(maps, 'a', 'd', open)?.id).toBe('ad');
    expect(firstExitTowards(maps, 'c', 'x', open)).toBeNull();
  });

  it('zeigt auf das Ziel hier, sonst auf den Ausgang dorthin', () => {
    expect(objectiveTarget(maps.a, maps, objective({ map: 'a', at: [10, 20] }), open)).toMatchObject({ kind: 'here', point: [10, 20] });
    expect(objectiveTarget(maps.a, maps, objective({ map: 'a' }), open)).toBeNull();
    expect(objectiveTarget(maps.a, maps, objective({ map: 'c', at: [1, 1] }), open)).toMatchObject({ kind: 'exit', point: [120, 520], label: 'Nach b' });
    expect(objectiveTarget(maps.a, maps, objective(), open)).toBeNull();
    expect(objectiveTarget(maps.a, maps, null, open)).toBeNull();
  });

  it('Randpfeil nur außerhalb der Ansicht, eingerückt am Rand', () => {
    const view = { x: 0, y: 0, w: 960, h: 540 };
    expect(edgeIndicator(view, [480, 270])).toBeNull();
    const right = edgeIndicator(view, [3000, 270])!;
    expect(right.x).toBeCloseTo(960 - 36);
    expect(right.y).toBeCloseTo(270);
    expect(right.angle).toBeCloseTo(0);
    const up = edgeIndicator({ ...view, x: 100, y: 1000 }, [580, 0])!;
    expect(up.y).toBeCloseTo(36);
    expect(up.angle).toBeCloseTo(-Math.PI / 2);
  });
});
