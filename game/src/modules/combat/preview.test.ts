import { describe, expect, it } from 'vitest';
import { activate, battle, buddy, combatData, hero, place } from './__fixtures__/combat';
import { act } from './actions';
import { reachableCells } from './movement';
import {
  abilityOptions, actionOptions, areaPreview, attackTargets, itemOptions, moveOptions, previewAttack,
} from './preview';
import { ABILITY_INTIMIDATE, ABILITY_REVIVE } from './rules';
import { upcomingTurns } from './turns';

const data = combatData();

describe('Vorschau für die Oberfläche', () => {
  it('zeigt erreichbare Felder der aktiven Einheit mit AP-Kosten', () => {
    const state = battle('duell');
    const held = state.units.find(u => u.id === 'held')!;
    expect(moveOptions(state)).toEqual(reachableCells(state, held, 2));
    expect(moveOptions(state).some(c => c.ap === 2)).toBe(true);
    expect(moveOptions(state, 'schlaeger#1').length).toBeGreaterThan(0);
  });

  it('listet Ziele mit Trefferchance, Begründung und erwartetem Schaden', () => {
    const state = battle('duell');
    let [far] = attackTargets(data, state);
    expect(far).toMatchObject({ target: 'schlaeger#1', valid: false, reason: 'Außer Reichweite.' });
    place(state, 'schlaeger#1', [5, 0], { facing: 'w' });
    [far] = attackTargets(data, state);
    expect(far).toMatchObject({ valid: true, chance: 85, damage: 10, expected: 8.5, lethal: false, cover: 0, flank: false });
    expect(far.parts).toEqual([{ label: 'Grundwert', value: 75 }, { label: 'Reflexe', value: 10 }]);
  });

  it('rechnet „erst bewegen, dann angreifen“ von einem anderen Feld aus', () => {
    const state = battle('duell');
    place(state, 'schlaeger#1', [10, 4], { facing: 'w' });
    expect(previewAttack(data, state, 'held', 'schlaeger#1')!.valid).toBe(false);
    const fromCell = previewAttack(data, state, 'held', 'schlaeger#1', { from: [5, 4] })!;
    expect(fromCell.valid).toBe(true);
    expect(fromCell.from).toEqual([5, 4]);
    place(state, 'held', [0, 0], { ap: 1 });
    expect(previewAttack(data, state, 'held', 'schlaeger#1', { from: [5, 4] })!.reason).toBe('Braucht 2 AP.');
  });

  it('zeigt Fähigkeiten mit Bereitschaft, Abklingzeit und Grund', () => {
    let state = battle('duell', { party: [hero({ abilities: ['schnellschuss', 'einmal'] }), buddy()] });
    let options = abilityOptions(data, state);
    expect(options.map(o => o.ability.id)).toEqual(['schnellschuss', 'einmal', ABILITY_INTIMIDATE, ABILITY_REVIVE]);
    expect(options[0]).toMatchObject({ ready: false, reason: 'Kein Ziel in Reichweite.', cooldown: 0, uses: null });
    expect(options[1].uses).toBe(1);
    expect(options[3].reason).toBe('Niemand zum Aufrichten in der Nähe.');
    place(state, 'schlaeger#1', [5, 0], { hp: 99, maxHp: 99 });
    expect(abilityOptions(data, state)[0].ready).toBe(true);
    state = act(data, state, { type: 'ability', ability: 'schnellschuss', target: 'schlaeger#1' }).state;
    options = abilityOptions(data, state);
    expect(options[0]).toMatchObject({ ready: false, cooldown: 1 });
    expect(abilityOptions(data, state, 'kumpel')[0].reason).toBe('Nicht am Zug.');
  });

  it('zeigt Gegenstände aus dem Gepäck mit Bereitschaft', () => {
    const state = battle('duell', { bag: { kaffee: 2, granate: 1, messer: 1 } });
    let items = itemOptions(data, state);
    expect(items.map(i => [i.item.id, i.qty, i.ready, i.reason])).toEqual([
      ['granate', 1, false, 'Kein Ziel in Reichweite.'],
      ['kaffee', 2, false, 'Niemand verletzt in der Nähe.'],
    ]);
    place(state, 'held', [0, 0], { hp: 10 });
    place(state, 'schlaeger#1', [3, 0]);
    items = itemOptions(data, state);
    expect(items.every(i => i.ready)).toBe(true);
    expect(items[0].ability?.id).toBe('granate');
  });

  it('zeigt Wirkungsbereich und Betroffene einer Fläche', () => {
    const state = battle('gang', { bag: { granate: 1 } });
    place(state, 'held', [3, 3]);
    place(state, 'schlaeger#1', [6, 3]);
    place(state, 'schlaeger#2', [6, 4]);
    activate(state, 'held');
    const area = areaPreview(data, state, 'held', { item: 'granate' }, [6, 3]);
    expect(area.valid).toBe(true);
    expect(area.cells).toHaveLength(5);
    expect(area.affected.map(a => [a.target, a.damage, a.autoHit, a.status?.id])).toEqual([
      ['schlaeger#1', 5, true, 'brennt'],
      ['schlaeger#2', 5, true, 'brennt'],
    ]);
    expect(areaPreview(data, state, 'held', { item: 'granate' }, [0, 7])).toMatchObject({ valid: false, reason: 'Außer Reichweite.' });
  });

  it('fasst die Aktionen der aktiven Einheit zusammen', () => {
    const state = battle('terminal', { party: [hero(), buddy()] });
    const options = actionOptions(data, state)!;
    expect(options).toMatchObject({ unit: 'held', ap: 2, move: true, attack: false, overwatch: true, cover: true, interact: false, flee: true, swap: true });
    place(state, 'held', [2, 3]);
    expect(actionOptions(data, state)!.interact).toBe(true);
    expect(actionOptions(data, { ...state, outcome: 'win' })).toBeNull();
  });

  it('zeigt die kommenden Züge für die Porträtleiste', () => {
    const state = battle('gang', { party: [hero(), buddy()] });
    const turns = upcomingTurns(state, 6);
    expect(turns).toHaveLength(6);
    expect(turns[0]).toBe(state.active);
    expect(turns.slice(0, state.order.length)).toEqual(state.order);
  });
});
