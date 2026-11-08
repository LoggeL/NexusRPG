import { describe, expect, it } from 'vitest';
import { activate, battle, buddy, combatData, forceRolls, hero, place } from './__fixtures__/combat';
import { act } from './actions';
import { runAiTurn } from './ai';
import { battleResult } from './campaign';
import { hitChance } from './resolve';
import { ABILITY_INTIMIDATE, ABILITY_REVIVE } from './rules';
import type { CombatAction, CombatState } from './types';

const data = combatData();

function run(state: CombatState, action: CombatAction): CombatState {
  const result = act(data, state, action);
  expect(result.error).toBeNull();
  return result.state;
}

const unit = (state: CombatState, id: string) => state.units.find(u => u.id === id)!;
const types = (state: CombatState) => state.log.map(e => e.type);

/** Spielt bis die Party wieder dran ist (Gegner per KI). */
function enemyTurns(state: CombatState): CombatState {
  let current = state;
  for (let i = 0; i < 20 && !current.outcome && unit(current, current.active!).team === 'enemy'; i++) current = runAiTurn(data, current).state;
  return current;
}

describe('Zugreihenfolge', () => {
  it('beginnt mit der höchsten Initiative (Reflexe × 2), Party bei Gleichstand zuerst', () => {
    const state = battle('duell');
    expect(state.order).toEqual(['held', 'schlaeger#1']);
    expect(state.active).toBe('held');
    expect(unit(state, 'held').ap).toBe(2);
    expect(unit(state, 'held').initiative).toBe(12);
    expect(state.log.slice(0, 2)).toEqual([{ type: 'round', round: 1 }, { type: 'turn', unit: 'held', round: 1 }]);
    const tie = battle('duell', { party: [hero({ attributes: { technik: 3, koerper: 3, reflexe: 4, ausstrahlung: 3, strasse: 3 } })] });
    expect(tie.order[0]).toBe('held');
  });

  it('lässt beim Überrumpeln die Party und im Hinterhalt die Gegner zuerst handeln', () => {
    const slow = hero({ attributes: { technik: 3, koerper: 3, reflexe: 1, ausstrahlung: 3, strasse: 3 } });
    expect(battle('gang', { party: [slow], start: 'ueberrumpelt' }).order[0]).toBe('held');
    expect(battle('gang', { party: [slow] }).order[0]).not.toBe('held');
    const ambush = battle('duell', { start: 'hinterhalt' });
    expect(ambush.active).toBe('schlaeger#1');
    let next = enemyTurns(ambush);
    expect(next.round).toBe(1);
    expect(next.active).toBe('held');
    next = run(next, { type: 'end' });
    expect(next.round).toBe(2);
    expect(next.order).toEqual(['held', 'schlaeger#1']);
  });

  it('gibt +15 auf den ersten Angriff nach dem Überrumpeln', () => {
    let state = battle('duell', { start: 'ueberrumpelt' });
    place(state, 'schlaeger#1', [5, 0], { facing: 'w' });
    expect(hitChance(state, unit(state, 'held'), unit(state, 'schlaeger#1')).parts).toContainEqual({ label: 'Überrumpelt', value: 15 });
    state = run(state, { type: 'attack', target: 'schlaeger#1' });
    expect(state.surprise).toBe(false);
  });
});

describe('Aktionspunkte', () => {
  it('kostet je Bewegung 1 AP und beendet den Zug bei 0 AP', () => {
    let state = battle('duell');
    state = run(state, { type: 'move', to: [3, 0] });
    expect(unit(state, 'held').ap).toBe(1);
    expect(state.active).toBe('held');
    state = run(state, { type: 'move', to: [3, 4] });
    expect(state.active).toBe('schlaeger#1');
    expect(unit(state, 'held').cell).toEqual([3, 4]);
  });

  it('erlaubt eine Doppelbewegung für 2 AP', () => {
    const state = run(battle('duell'), { type: 'move', to: [8, 0] });
    expect(unit(state, 'held').cell).toEqual([8, 0]);
    expect(state.active).toBe('schlaeger#1');
    expect(state.log.filter(e => e.type === 'move')).toEqual([{ type: 'move', unit: 'held', path: [[1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0], [7, 0], [8, 0]] }]);
  });

  it('lehnt ungültige Aktionen ab, ohne den Zustand anzufassen', () => {
    const state = battle('duell');
    const before = JSON.stringify(state);
    expect(act(data, state, { type: 'move', to: [11, 7] }).error).toBe('Zu weit entfernt.');
    expect(act(data, state, { type: 'move', to: [11, 0] }).error).toBe('Dort kann niemand stehen.');
    expect(act(data, state, { type: 'attack', target: 'schlaeger#1' }).error).toBe('Außer Reichweite.');
    expect(act(data, state, { type: 'attack', target: 'held' }).error).toBe('Kein gültiges Ziel.');
    expect(act(data, state, { type: 'ability', ability: 'hieb' }).error).toMatch(/beherrscht/);
    expect(act(data, state, { type: 'item', item: 'kaffee' }).error).toBe('Nicht im Gepäck.');
    expect(act(data, state, { type: 'interact' }).error).toBe('Hier gibt es nichts zu bedienen.');
    const result = act(data, state, { type: 'weapon', index: 0 });
    expect(result.error).toBe('Ungültige Waffe.');
    expect(result.state).toBe(state);
    expect(JSON.stringify(state)).toBe(before);
  });

  it('erlaubt höchstens einen Angriff je Zug', () => {
    let state = battle('duell');
    place(state, 'schlaeger#1', [4, 0], { hp: 99, maxHp: 99 });
    state = run(state, { type: 'attack', target: 'schlaeger#1' });
    expect(act(data, state, { type: 'attack', target: 'schlaeger#1' }).error).toBe('In diesem Zug wurde schon angegriffen.');
    expect(act(data, state, { type: 'ability', ability: 'schnellschuss', target: 'schlaeger#1' }).error).toBe('In diesem Zug wurde schon angegriffen.');
    expect(act(data, state, { type: 'cover' }).error).toBeNull();
  });

  it('wechselt die Waffe für 0 AP einmal je Zug', () => {
    let state = battle('duell');
    state = run(state, { type: 'weapon', index: 1 });
    expect(unit(state, 'held').weapon.kind).toBe('nahkampf');
    expect(unit(state, 'held').ap).toBe(2);
    expect(act(data, state, { type: 'weapon', index: 0 }).error).toMatch(/schon gewechselt/);
  });
});

describe('Angriff', () => {
  it('zieht bei Treffer den angezeigten Schaden ab, bei Fehlschuss nichts', () => {
    let state = battle('duell');
    place(state, 'schlaeger#1', [4, 0], { facing: 'w' });
    forceRolls(state, 'hit');
    state = run(state, { type: 'attack', target: 'schlaeger#1' });
    expect(unit(state, 'schlaeger#1').hp).toBe(10);
    expect(state.log.at(-1)).toMatchObject({ type: 'attack', unit: 'held', target: 'schlaeger#1', hit: true, chance: 85, damage: 10 });

    let missed = battle('duell');
    place(missed, 'schlaeger#1', [4, 0], { facing: 'w' });
    forceRolls(missed, 'miss');
    missed = run(missed, { type: 'attack', target: 'schlaeger#1' });
    expect(unit(missed, 'schlaeger#1').hp).toBe(20);
    expect(missed.log.at(-1)).toMatchObject({ type: 'attack', hit: false, damage: 0 });
  });

  it('schlägt K.O., siegt und zieht die Belohnung', () => {
    let state = battle('duell');
    place(state, 'schlaeger#1', [4, 0], { hp: 3 });
    forceRolls(state, 'hit');
    state = run(state, { type: 'attack', target: 'schlaeger#1' });
    expect(unit(state, 'schlaeger#1').state).toBe('down');
    expect(state.outcome).toBe('win');
    expect(state.active).toBeNull();
    expect(types(state).slice(-3)).toEqual(['attack', 'down', 'end']);
    expect(state.rewards!.xp).toBe(15);
    expect(state.rewards!.credits).toBeGreaterThanOrEqual(5);
    expect(state.rewards!.credits).toBeLessThanOrEqual(10);
    expect(state.rewards!.loot).toEqual({ kaffee: 1 });
    expect(battleResult(state)).toEqual({
      encounter: 'duell', outcome: 'win', playerHp: 40, loot: { kaffee: 1 }, xp: 15, credits: state.rewards!.credits,
    });
    expect(act(data, state, { type: 'end' }).error).toBe('Der Kampf ist vorbei.');
  });

  it('verliert, wenn alle Kämpfer der Party K.O. sind', () => {
    let state = battle('duell');
    place(state, 'held', [10, 0], { hp: 1 });
    state = run(state, { type: 'end' });
    activate(state, 'schlaeger#1');
    forceRolls(state, 'hit');
    state = run(state, { type: 'attack', target: 'held' });
    expect(state.outcome).toBe('lose');
    expect(state.rewards).toBeNull();
    expect(battleResult(state)).toEqual({ encounter: 'duell', outcome: 'lose', playerHp: 0 });
  });
});

describe('Überwachung', () => {
  it('schießt mit −10 auf die erste gegnerische Bewegung in Reichweite und endet dann', () => {
    let state = battle('duell');
    place(state, 'held', [5, 4]);
    place(state, 'schlaeger#1', [9, 4], { hp: 99, maxHp: 99 });
    state = run(state, { type: 'overwatch' });
    expect(unit(state, 'held').overwatch).toBe(true);
    expect(state.active).toBe('schlaeger#1');
    const normal = hitChance(state, unit(state, 'held'), { ...unit(state, 'schlaeger#1'), cell: [8, 4] }).chance;
    state = run(state, { type: 'move', to: [7, 4] });
    const events = state.log.slice(state.log.findIndex(e => e.type === 'turn' && e.unit === 'schlaeger#1'));
    expect(events.map(e => e.type)).toEqual(['turn', 'move', 'bark', 'attack', 'move']);
    expect(events[3]).toMatchObject({ type: 'attack', unit: 'held', target: 'schlaeger#1', reaction: true, chance: normal - 10 });
    expect(unit(state, 'held').overwatch).toBe(false);
  });

  it('endet zu Beginn des eigenen Zugs', () => {
    let state = battle('duell');
    state = run(state, { type: 'overwatch' });
    state = run(state, { type: 'end' });
    expect(state.active).toBe('held');
    expect(unit(state, 'held').overwatch).toBe(false);
  });
});

describe('Zustände', () => {
  it('Gehackt lässt den nächsten Zug aussetzen', () => {
    let state = battle('duell', { party: [hero({ abilities: ['stoersignal'] })] });
    place(state, 'schlaeger#1', [4, 0]);
    state = run(state, { type: 'ability', ability: 'stoersignal', target: 'schlaeger#1' });
    expect(state.log).toContainEqual({ type: 'status', unit: 'schlaeger#1', status: 'gehackt', turns: 1 });
    expect(state.active).toBe('held');
    expect(state.round).toBe(2);
    expect(state.log).toContainEqual({ type: 'skip', unit: 'schlaeger#1', status: 'gehackt' });
    expect(unit(state, 'schlaeger#1').status.gehackt).toBeUndefined();
  });

  it('Betäubt lässt aussetzen und macht danach eine Runde immun', () => {
    let state = battle('duell', { party: [hero({ abilities: ['betaeuben'] })] });
    place(state, 'held', [5, 4]);
    place(state, 'schlaeger#1', [6, 4]);
    forceRolls(state, 'hit');
    state = run(state, { type: 'ability', ability: 'betaeuben', target: 'schlaeger#1' });
    state = run(state, { type: 'end' });
    expect(state.log).toContainEqual({ type: 'skip', unit: 'schlaeger#1', status: 'betaeubt' });
    expect(state.active).toBe('held');
    expect(unit(state, 'schlaeger#1').stunImmune).toBe(1);
    forceRolls(state, 'hit');
    state = run(state, { type: 'ability', ability: 'betaeuben', target: 'schlaeger#1' });
    expect(state.log.at(-1)).toEqual({ type: 'resist', unit: 'schlaeger#1', status: 'betaeubt' });
  });

  it('Brennt (4) und Angeschlagen (2) schaden zu Zugbeginn und laufen ab', () => {
    let state = battle('duell');
    place(state, 'schlaeger#1', [11, 7], { status: { brennt: 2, blutet: 3 } });
    state = run(state, { type: 'end' });
    expect(unit(state, 'schlaeger#1').hp).toBe(14);
    expect(state.log.filter(e => e.type === 'damage')).toEqual([
      { type: 'damage', unit: 'schlaeger#1', amount: 4, source: 'brennt' },
      { type: 'damage', unit: 'schlaeger#1', amount: 2, source: 'blutet' },
    ]);
    expect(unit(state, 'schlaeger#1').status).toEqual({ brennt: 1, blutet: 2 });
    state = run(state, { type: 'end' });
    state = run(state, { type: 'end' });
    expect(unit(state, 'schlaeger#1').hp).toBe(8);
    expect(unit(state, 'schlaeger#1').status).toEqual({ blutet: 1 });
  });

  it('Deckung suchen gibt „Geschützt“ und entfernt „Markiert“', () => {
    let state = battle('duell');
    place(state, 'held', [3, 3], { status: { markiert: 2 } });
    state = run(state, { type: 'cover' });
    expect(unit(state, 'held').status).toEqual({ geschuetzt: 1 });
    expect(unit(state, 'held').ap).toBe(1);
    state = run(state, { type: 'end' });
    state = run(state, { type: 'end' });
    expect(unit(state, 'held').status).toEqual({});
  });

  it('Gefahrenfelder schaden beim Betreten und setzen ihren Zustand', () => {
    const state = run(battle('feuer'), { type: 'move', to: [3, 0] });
    expect(unit(state, 'held').hp).toBe(38);
    expect(state.log).toContainEqual({ type: 'damage', unit: 'held', amount: 2, source: 'gefahr' });
    expect(unit(state, 'held').status.brennt).toBe(2);
  });
});

describe('Fähigkeiten und Gegenstände', () => {
  it('beachtet Abklingzeiten in eigenen Zügen', () => {
    let state = battle('duell');
    place(state, 'schlaeger#1', [5, 0], { hp: 999, maxHp: 999 });
    state = run(state, { type: 'ability', ability: 'schnellschuss', target: 'schlaeger#1' });
    expect(unit(state, 'held').cooldowns.schnellschuss).toBe(1);
    state = run(state, { type: 'end' });
    state = run(state, { type: 'end' });
    expect(state.round).toBe(2);
    expect(act(data, state, { type: 'ability', ability: 'schnellschuss', target: 'schlaeger#1' }).error).toBe('Lädt noch 1 Zug(e).');
    state = run(state, { type: 'end' });
    state = run(state, { type: 'end' });
    expect(act(data, state, { type: 'ability', ability: 'schnellschuss', target: 'schlaeger#1' }).error).toBeNull();
  });

  it('zählt Einsätze je Kampf', () => {
    let state = battle('duell', { party: [hero({ abilities: ['einmal'] })] });
    place(state, 'schlaeger#1', [5, 0], { hp: 999, maxHp: 999 });
    state = run(state, { type: 'ability', ability: 'einmal', target: 'schlaeger#1' });
    state = run(state, { type: 'end' });
    state = run(state, { type: 'end' });
    expect(act(data, state, { type: 'ability', ability: 'einmal', target: 'schlaeger#1' }).error).toBe('Keine Einsätze mehr.');
  });

  it('wirft Flächengegenstände nur auf Gegner und verbraucht sie', () => {
    let state = battle('gang', { party: [hero(), buddy()], bag: { granate: 2, unbekannt: 3 } });
    expect(state.bag).toEqual({ granate: 2 });
    place(state, 'held', [3, 4]);
    place(state, 'kumpel', [6, 3]);
    place(state, 'schlaeger#1', [6, 4]);
    place(state, 'schlaeger#2', [6, 5]);
    activate(state, 'held');
    state = run(state, { type: 'item', item: 'granate', cell: [6, 4] });
    expect(unit(state, 'schlaeger#1').hp).toBe(15);
    expect(unit(state, 'schlaeger#2').hp).toBe(15);
    expect(unit(state, 'kumpel').hp).toBe(40);
    expect(unit(state, 'schlaeger#1').status.brennt).toBe(2);
    expect(state.bag).toEqual({ granate: 1 });
    expect(state.used).toEqual({ granate: 1 });
    expect(unit(state, 'held').ap).toBe(1);
    // Granaten zählen als Angriff (höchstens einer je Zug).
    expect(act(data, state, { type: 'item', item: 'granate', cell: [6, 4] }).error).toBe('In diesem Zug wurde schon angegriffen.');
    state = run(state, { type: 'end' });
    state = enemyTurns(state);
    activate(state, 'held');
    expect(act(data, state, { type: 'item', item: 'granate', cell: [0, 7] }).error).toBe('Außer Reichweite.');
  });

  it('heilt mit Gegenständen sich selbst oder Nachbarn', () => {
    let state = battle('duell', { bag: { kaffee: 1 } });
    place(state, 'held', [0, 0], { hp: 20 });
    state = run(state, { type: 'item', item: 'kaffee' });
    expect(unit(state, 'held').hp).toBe(30);
    expect(state.bag).toEqual({});
    expect(battleResult(state).used).toEqual({ kaffee: 1 });
  });

  it('heilt Verbündete mit Fähigkeiten (Heilwert, höchstens bis zum Maximum)', () => {
    let state = battle('duell', { party: [hero(), buddy()] });
    place(state, 'held', [2, 2], { hp: 35 });
    activate(state, 'kumpel');
    state = run(state, { type: 'ability', ability: 'flicken', target: 'held' });
    expect(unit(state, 'held').hp).toBe(40);
    expect(state.log.at(-1)).toEqual({ type: 'heal', unit: 'kumpel', target: 'held', amount: 5 });
  });

  it('richtet K.O.-Verbündete auf dem Nachbarfeld wieder auf', () => {
    let state = battle('duell', { party: [hero(), buddy()] });
    place(state, 'held', [3, 3]);
    place(state, 'kumpel', [4, 3], { hp: 0, state: 'down' });
    expect(act(data, state, { type: 'move', to: [4, 3] }).error).toBe('Dort kann niemand stehen.');
    state = run(state, { type: 'ability', ability: ABILITY_REVIVE, target: 'kumpel' });
    expect(unit(state, 'kumpel')).toMatchObject({ state: 'active', hp: 10 });
  });
});

describe('Moral', () => {
  it('Einschüchtern lässt Gegner unter 30 fliehen (halbe XP)', () => {
    let state = battle('duell');
    place(state, 'schlaeger#1', [5, 0]);
    state = run(state, { type: 'ability', ability: ABILITY_INTIMIDATE, target: 'schlaeger#1' });
    expect(state.log).toContainEqual({ type: 'morale', unit: 'schlaeger#1', morale: 20, delta: -30 });
    expect(unit(state, 'schlaeger#1').state).toBe('fled');
    expect(state.outcome).toBe('win');
    expect(state.rewards).toEqual({ xp: 7, credits: 0, loot: {} });
  });

  it('unter 15 ergibt sich der Gegner (volle Belohnung)', () => {
    let state = battle('duell');
    place(state, 'schlaeger#1', [5, 0], { morale: 25 });
    state = run(state, { type: 'ability', ability: ABILITY_INTIMIDATE, target: 'schlaeger#1' });
    expect(unit(state, 'schlaeger#1').state).toBe('surrendered');
    expect(state.rewards!.xp).toBe(15);
    expect(state.rewards!.loot).toEqual({ kaffee: 1 });
  });

  it('ein K.O. senkt die Moral der Verbündeten um 20', () => {
    let state = battle('gang');
    place(state, 'held', [3, 3]);
    place(state, 'schlaeger#1', [5, 3], { hp: 1 });
    activate(state, 'held');
    forceRolls(state, 'hit');
    state = run(state, { type: 'attack', target: 'schlaeger#1' });
    expect(unit(state, 'schlaeger#2').morale).toBe(30);
    expect(unit(state, 'schlaeger#2').state).toBe('active');
    expect(unit(state, 'schuetze#1').morale).toBe(20);
    expect(unit(state, 'schuetze#1').state).toBe('fled');
  });

  it('Gegner ohne Moral lassen sich nicht einschüchtern', () => {
    const state = battle('terminal');
    place(state, 'drohne#1', [4, 0]);
    activate(state, 'held');
    expect(act(data, state, { type: 'ability', ability: ABILITY_INTIMIDATE, target: 'drohne#1' }).error).toBe('Lässt sich nicht beeindrucken.');
  });
});

describe('Missionsziele', () => {
  it('Terminal hacken: AP neben dem Terminal bis zum Ziel', () => {
    let state = battle('terminal');
    activate(state, 'held');
    place(state, 'held', [2, 3]);
    state = run(state, { type: 'interact' });
    expect(state.progress).toBe(1);
    expect(state.log.at(-1)).toEqual({ type: 'objective', unit: 'held', progress: 1, needed: 2 });
    state = run(state, { type: 'interact' });
    expect(state.outcome).toBe('win');
    place(state, 'held', [8, 3]);
  });

  it('Ausgang erreichen gewinnt', () => {
    const state = run(battle('ausgang'), { type: 'move', to: [2, 7] });
    expect(state.outcome).toBe('win');
  });

  it('X Runden überleben gewinnt, Flucht ist dort verboten', () => {
    let state = battle('ueberleben', { party: [hero({ hp: 500, maxHp: 500 })] });
    expect(act(data, state, { type: 'flee' }).error).toBe('Aus diesem Kampf gibt es keine Flucht.');
    for (let i = 0; i < 40 && !state.outcome; i++) {
      state = unit(state, state.active!).team === 'party' ? run(state, { type: 'end' }) : runAiTurn(data, state).state;
    }
    expect(state.outcome).toBe('win');
    expect(state.round).toBe(4);
  });

  it('Schutzperson: fällt sie, ist der Kampf verloren', () => {
    let state = battle('rettung');
    const vip = unit(state, 'schutz:zivilist');
    expect(vip).toMatchObject({ team: 'party', vip: true, cell: [1, 5], controller: 'ai', name: 'Zivilist' });
    place(state, 'schutz:zivilist', [5, 5], { hp: 1 });
    place(state, 'schlaeger#1', [6, 5]);
    activate(state, 'schlaeger#1');
    forceRolls(state, 'hit');
    state = run(state, { type: 'attack', target: 'schutz:zivilist' });
    expect(state.outcome).toBe('lose');
  });

  it('Flucht beendet den Kampf ohne Belohnung', () => {
    const state = run(battle('duell'), { type: 'flee' });
    expect(state.outcome).toBe('fled');
    expect(battleResult(state)).toEqual({ encounter: 'duell', outcome: 'fled', playerHp: 40 });
  });
});

describe('Bosse und Schwierigkeit', () => {
  it('wechselt unter dem LP-Anteil in die nächste Phase', () => {
    let state = battle('boss');
    place(state, 'boss#1', [5, 0], { hp: 31, facing: 'w' });
    forceRolls(state, 'hit');
    state = run(state, { type: 'attack', target: 'boss#1' });
    const boss = unit(state, 'boss#1');
    expect(boss.phase).toBe(0);
    expect(boss.ai).toBe('aggressiv');
    expect(boss.abilities).toContain('wirbel');
    expect(state.log).toContainEqual({ type: 'bark', unit: 'boss#1', text: 'Jetzt reicht’s!' });
  });

  it('skaliert Gegner-LP nach Schwierigkeit und gibt auf Leicht +10 Treffer', () => {
    expect(unit(battle('duell', { difficulty: 'hart' }), 'schlaeger#1').maxHp).toBe(25);
    const easy = battle('duell', { difficulty: 'leicht' });
    expect(unit(easy, 'schlaeger#1').maxHp).toBe(15);
    expect(hitChance(easy, unit(easy, 'held'), unit(easy, 'schlaeger#1')).parts).toContainEqual({ label: 'Leicht', value: 10 });
  });
});
