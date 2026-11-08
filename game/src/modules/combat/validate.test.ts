import { describe, expect, it } from 'vitest';
import { combatData } from './__fixtures__/combat';
import { validateCombatContent } from './validate';

describe('Kampf-Inhaltsprüfung', () => {
  it('akzeptiert die Testdaten', () => {
    expect(validateCombatContent(combatData())).toEqual([]);
  });

  it('findet kaputte Arenen, Ziele, Gegner und Fähigkeiten', () => {
    const data = combatData();
    data.arenas.kaputt = { id: 'kaputt', name: 'Kaputt', bg: 'x', layout: ['P....#.....E', ...Array(7).fill('.....#......')] };
    data.arenas.kurz = { id: 'kurz', name: 'Kurz', bg: 'x', layout: ['P..E'] };
    data.encounters.getrennt = { id: 'getrennt', name: 'Getrennt', arena: 'kaputt', enemies: [{ enemy: 'schlaeger' }], objective: { kind: 'reach', cells: [[11, 7]] } };
    data.encounters.terminal = { ...data.encounters.terminal, objective: { kind: 'hack', cell: [8, 0], ap: 0 } };
    data.encounters.falsch = { id: 'falsch', name: 'Falsch', arena: 'offen', enemies: [{ enemy: 'schlaeger', at: [99, 0] }, { enemy: 'geist' }] };
    data.abilities.leer = { id: 'leer', name: 'Leer', description: '', kind: 'nahkampf', ap: 3, target: 'enemy', range: 0 };
    data.enemies.boss.phases = [{ below: 0.3 }, { below: 0.6 }];
    data.enemies.schlaeger.stats.morale = 150;
    const problems = validateCombatContent(data);
    const has = (text: RegExp) => expect(problems.some(p => text.test(p)), `${text}\n${problems.join('\n')}`).toBe(true);
    has(/Arena kaputt: Party- und Gegnerstart sind nicht durchgehend verbunden/);
    has(/Arena kurz: .*8 Zeilen/);
    has(/Begegnung getrennt: Ausgangsfeld \(11, 7\) vom Party-Start aus unerreichbar/);
    has(/Begegnung terminal: Terminal braucht ap ≥ 1/);
    has(/Begegnung falsch: Startfeld \(99, 0\)/);
    has(/Begegnung falsch: unbekannter Gegner „geist“/);
    has(/Fähigkeit leer: ap muss 1 oder 2 sein/);
    has(/Fähigkeit leer: Gegnerziele brauchen range ≥ 1/);
    has(/Fähigkeit leer: wirkt nicht/);
    has(/Gegner boss: Phasen absteigend/);
    has(/Gegner schlaeger: Moral liegt zwischen 0 und 100/);
  });
});
