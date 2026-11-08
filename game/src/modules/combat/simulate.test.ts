import { describe, expect, it } from 'vitest';
import { battle, buddy, combatData, hero } from './__fixtures__/combat';
import { battleResult } from './campaign';
import { createBattle } from './setup';
import { simulateBattle } from './simulate';

const data = combatData();
const SEEDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

describe('Simulierte Kämpfe', () => {
  it.each(Object.keys(data.encounters))('Begegnung %s endet immer ohne Regelfehler', (encounter) => {
    for (const seed of SEEDS) {
      const state = createBattle(data, { encounter, seed, party: [hero(), buddy()], bag: { kaffee: 2, granate: 1 } });
      const result = simulateBattle(data, state);
      expect(result.error, `${encounter} / Seed ${seed}`).toBeNull();
      expect(result.state.outcome, `${encounter} / Seed ${seed}`).not.toBeNull();
      expect(result.state.log.at(-1)).toEqual({ type: 'end', outcome: result.state.outcome });
      for (const unit of result.state.units) {
        expect(unit.hp).toBeGreaterThanOrEqual(0);
        expect(unit.hp).toBeLessThanOrEqual(unit.maxHp);
      }
    }
  });

  it('ist bei gleichem Seed exakt wiederholbar', () => {
    const a = simulateBattle(data, battle('gang', { seed: 42, party: [hero(), buddy()] }));
    const b = simulateBattle(data, battle('gang', { seed: 42, party: [hero(), buddy()] }));
    expect(JSON.stringify(a.state.log)).toBe(JSON.stringify(b.state.log));
    expect(a.state.rng).toBe(b.state.rng);
  });

  it('verläuft mit anderem Seed anders', () => {
    const logs = new Set(SEEDS.map(seed => JSON.stringify(simulateBattle(data, battle('gang', { seed, party: [hero(), buddy()] })).state.log)));
    expect(logs.size).toBeGreaterThan(1);
  });

  it('eine starke Party gewinnt das Duell immer und bekommt Belohnung', () => {
    for (const seed of SEEDS) {
      const result = simulateBattle(data, battle('duell', { seed }));
      expect(result.state.outcome).toBe('win');
      const summary = battleResult(result.state);
      expect(summary.outcome).toBe('win');
      expect(summary.xp).toBeGreaterThan(0);
      expect(summary.playerHp).toBeGreaterThan(0);
    }
  });

  it('eine schwache Figur verliert gegen den Boss', () => {
    const weak = hero({ hp: 6, maxHp: 6, attributes: { technik: 1, koerper: 1, reflexe: 1, ausstrahlung: 1, strasse: 1 }, weapons: [] });
    for (const seed of SEEDS.slice(0, 4)) {
      const result = simulateBattle(data, battle('boss', { seed, party: [weak] }));
      expect(result.state.outcome).toBe('lose');
      expect(battleResult(result.state)).toMatchObject({ outcome: 'lose', playerHp: 0 });
    }
  });

  it('der Autopilot erfüllt Missionsziele (Terminal, Ausgang)', () => {
    for (const seed of SEEDS.slice(0, 4)) {
      const hack = simulateBattle(data, battle('terminal', { seed, party: [hero({ hp: 200, maxHp: 200 })] }));
      expect(hack.state.outcome).toBe('win');
      const exit = simulateBattle(data, battle('ausgang', { seed, party: [hero({ hp: 200, maxHp: 200 })] }));
      expect(exit.state.outcome).toBe('win');
    }
  });

  it('der Boss wechselt im Kampf die Phase', () => {
    const result = simulateBattle(data, battle('boss', { seed: 3, party: [hero({ hp: 200, maxHp: 200 }), buddy({ hp: 200, maxHp: 200 })] }));
    expect(result.state.outcome).toBe('win');
    expect(result.state.log).toContainEqual({ type: 'phase', unit: 'boss#1', phase: 0 });
  });
});
