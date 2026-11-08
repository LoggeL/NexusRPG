import { describe, expect, it } from 'vitest';
import { activate, battle, buddy, combatData, hero, place } from './__fixtures__/combat';
import { planAi, planAiAction, positionScore, runAiTurn, runAiUntilPlayer } from './ai';
import { distance } from './grid';
import type { CombatState } from './types';

const data = combatData();
const unit = (state: CombatState, id: string) => state.units.find(u => u.id === id)!;

describe('KI aggressiv', () => {
  it('nähert sich auf kürzestem Weg, wenn kein Angriff möglich ist', () => {
    const state = battle('duell');
    place(state, 'held', [0, 4]);
    activate(state, 'schlaeger#1');
    const before = distance(unit(state, 'schlaeger#1').cell, [0, 4]);
    const plan = planAi(data, state);
    expect(plan.action.type).toBe('move');
    expect(plan.reason).toMatch(/nähert sich Held/);
    const after = runAiTurn(data, state).state;
    expect(distance(unit(after, 'schlaeger#1').cell, [0, 4])).toBeLessThan(before);
    expect(after.active).toBe('held');
  });

  it('greift an, wenn ein Ziel in Reichweite ist (stärkste Option)', () => {
    const state = battle('duell');
    place(state, 'held', [5, 4]);
    place(state, 'schlaeger#1', [6, 4]);
    activate(state, 'schlaeger#1', 1);
    expect(planAiAction(data, state)).toEqual({ type: 'ability', ability: 'hieb', target: 'held' });
  });

  it('läuft für Flanke und Volltreffer hinter das Ziel, wenn die AP reichen', () => {
    const state = battle('duell');
    place(state, 'held', [5, 4], { facing: 'e' });
    place(state, 'schlaeger#1', [6, 4]);
    activate(state, 'schlaeger#1');
    expect(planAiAction(data, state)).toEqual({ type: 'move', to: [4, 4] });
    const result = runAiTurn(data, state);
    expect(result.events.find(e => e.type === 'attack')).toMatchObject({ unit: 'schlaeger#1', target: 'held', ability: 'hieb' });
  });

  it('läuft erst heran und schlägt dann zu', () => {
    const state = battle('duell');
    place(state, 'held', [5, 4]);
    place(state, 'schlaeger#1', [9, 4]);
    activate(state, 'schlaeger#1');
    const action = planAiAction(data, state);
    expect(action.type).toBe('move');
    const result = runAiTurn(data, state);
    expect(result.events.some(e => e.type === 'attack' && e.unit === 'schlaeger#1')).toBe(true);
  });

  it('bevorzugt das schwächste Ziel', () => {
    const state = battle('duell', { party: [hero(), buddy()] });
    place(state, 'held', [4, 4]);
    place(state, 'kumpel', [6, 4], { hp: 5 });
    place(state, 'schlaeger#1', [5, 4]);
    activate(state, 'schlaeger#1');
    const action = planAiAction(data, state);
    expect('target' in action && action.target).toBe('kumpel');
  });
});

describe('KI vorsichtig und support', () => {
  it('schießt aus der Deckung und flieht bei wenig LP', () => {
    const state = battle('deckung');
    place(state, 'held', [2, 5]);
    place(state, 'schuetze#1', [6, 6]);
    activate(state, 'schuetze#1');
    const plan = planAi(data, state);
    expect(['attack', 'move']).toContain(plan.action.type);
    place(state, 'schuetze#1', [6, 6], { hp: 3 });
    expect(planAiAction(data, state)).toEqual({ type: 'flee' });
    const fled = runAiTurn(data, state).state;
    expect(unit(fled, 'schuetze#1').state).toBe('fled');
  });

  it('wählt Felder mit Deckung gegen die Bedrohung', () => {
    const state = battle('deckung');
    place(state, 'held', [0, 2]);
    const schuetze = unit(state, 'schuetze#1');
    const covered = positionScore(state, schuetze, [6, 2], 'vorsichtig');
    const open = positionScore(state, schuetze, [6, 5], 'vorsichtig');
    expect(covered).toBeGreaterThan(open);
  });

  it('geht in Überwachung, wenn nichts zu holen ist', () => {
    const state = battle('deckung');
    place(state, 'held', [0, 0]);
    place(state, 'schuetze#1', [11, 7]);
    place(state, 'sani#1', [11, 6]);
    activate(state, 'schuetze#1', 1);
    const after = runAiTurn(data, state).state;
    const s = unit(after, 'schuetze#1');
    expect(s.overwatch || distance(s.cell, [0, 0]) < distance([11, 7], [0, 0])).toBe(true);
  });

  it('heilt verletzte Verbündete', () => {
    const state = battle('deckung');
    place(state, 'held', [0, 0]);
    place(state, 'schuetze#1', [9, 4], { hp: 4 });
    place(state, 'sani#1', [10, 4]);
    activate(state, 'sani#1');
    expect(planAiAction(data, state)).toEqual({ type: 'ability', ability: 'flicken', target: 'schuetze#1' });
  });
});

describe('KI boss und Schutzperson', () => {
  it('setzt nach dem Phasenwechsel die neue Flächenfähigkeit ein', () => {
    const state = battle('boss', { party: [hero(), buddy()] });
    place(state, 'held', [4, 4]);
    place(state, 'kumpel', [6, 4]);
    place(state, 'boss#1', [5, 4], { hp: 20, phase: 0, ai: 'aggressiv', abilities: ['hieb', 'wirbel'] });
    activate(state, 'boss#1');
    expect(planAiAction(data, state)).toMatchObject({ type: 'ability', ability: 'wirbel' });
  });

  it('die Schutzperson weicht Gegnern aus', () => {
    const state = battle('rettung');
    place(state, 'schutz:zivilist', [6, 4]);
    place(state, 'schlaeger#1', [8, 4]);
    activate(state, 'schutz:zivilist');
    const plan = planAi(data, state);
    expect(plan.action.type).toBe('move');
    const after = runAiTurn(data, state).state;
    expect(distance(unit(after, 'schutz:zivilist').cell, [8, 4])).toBeGreaterThan(2);
  });

  it('spielt Gegnerzüge, bis die Party wieder dran ist', () => {
    const state = battle('gang', { start: 'hinterhalt' });
    const result = runAiUntilPlayer(data, state);
    expect(result.error).toBeNull();
    expect(result.state.outcome ?? unit(result.state, result.state.active!).controller).toBe('player');
    expect(result.events.filter(e => e.type === 'turn').length).toBeGreaterThanOrEqual(3);
  });
});
