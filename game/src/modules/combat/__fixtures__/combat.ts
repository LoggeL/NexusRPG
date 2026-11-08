// Testdaten für die Kampfregeln (unabhängig von content/).
import type { AbilityDef, ArenaDef, Cell, EncounterDef, EnemyDef, ItemDef, UnitStats } from '../../contracts';
import { createBattle } from '../setup';
import type { BattleSetup, CombatData, CombatState, CombatUnit, PartyMemberSpec } from '../types';

const OPEN = [
  'P..........E',
  'P..........E',
  'P..........E',
  '............',
  '............',
  '............',
  '............',
  '............',
];

const arena = (id: string, layout: string[], extra: Partial<ArenaDef> = {}): ArenaDef => ({ id, name: id, bg: `arena-${id}`, layout, ...extra });

const ability = (id: string, def: Omit<AbilityDef, 'id' | 'name' | 'description'> & { name?: string }): AbilityDef =>
  ({ id, name: def.name ?? id, description: `${id}.`, ...def });

const stats = (hp: number, extra: Partial<UnitStats> = {}): UnitStats => ({
  hp, armor: 0, attributes: { technik: 3, koerper: 4, reflexe: 4, ausstrahlung: 3, strasse: 3 },
  weapon: { kind: 'nahkampf', damage: 4, range: 1 }, abilities: [], ...extra,
});

const enemy = (id: string, def: Partial<EnemyDef> & { stats: UnitStats }): EnemyDef =>
  ({ id, name: id[0].toUpperCase() + id.slice(1), level: 1, ai: 'aggressiv', xp: 10, ...def });

const encounter = (id: string, def: Partial<EncounterDef>): EncounterDef =>
  ({ id, name: id, arena: 'offen', enemies: [{ enemy: 'schlaeger' }], ...def });

const items: Record<string, ItemDef> = {
  kaffee: { id: 'kaffee', name: 'Kaffee', description: 'Heiß.', category: 'verbrauch', icon: 'kaffee', price: 5, use: { label: 'Trinken', heal: 10 } },
  granate: { id: 'granate', name: 'Funkengranate', description: 'Bumm.', category: 'verbrauch', icon: 'granate', price: 50, use: { label: 'Werfen', battle: 'granate' } },
  rauchtopf: { id: 'rauchtopf', name: 'Rauchtopf', description: 'Puff.', category: 'verbrauch', icon: 'rauch', price: 20, use: { label: 'Werfen', battle: 'nebel' } },
  messer: { id: 'messer', name: 'Messer', description: 'Spitz.', category: 'waffe', icon: 'messer', price: 50, weapon: { kind: 'nahkampf', damage: 5, range: 1 } },
};

export function combatData(): CombatData {
  return {
    abilities: {
      hieb: ability('hieb', { kind: 'nahkampf', ap: 1, target: 'enemy', range: 1, damage: 2, attribute: 'koerper' }),
      schnellschuss: ability('schnellschuss', { kind: 'fernkampf', ap: 1, target: 'enemy', range: 5, damage: 1, hit: -10, cooldown: 1 }),
      stoersignal: ability('stoersignal', { kind: 'hack', ap: 2, target: 'enemy', range: 4, status: { id: 'gehackt', turns: 1 }, cooldown: 2 }),
      granate: ability('granate', { kind: 'gegenstand', ap: 1, target: 'area', range: 4, radius: 1, damage: 6, status: { id: 'brennt', turns: 2 } }),
      nebel: ability('nebel', { kind: 'gegenstand', ap: 1, target: 'area', range: 3, radius: 1, status: { id: 'geschuetzt', turns: 1 } }),
      flicken: ability('flicken', { kind: 'support', ap: 1, target: 'ally', range: 4, heal: 8, cooldown: 1 }),
      schild: ability('schild', { kind: 'support', ap: 1, target: 'ally', range: 3, status: { id: 'geschuetzt', turns: 1 } }),
      markieren: ability('markieren', { kind: 'fernkampf', ap: 1, target: 'enemy', range: 6, status: { id: 'markiert', turns: 2 } }),
      betaeuben: ability('betaeuben', { kind: 'nahkampf', ap: 1, target: 'enemy', range: 1, damage: 1, status: { id: 'betaeubt', turns: 1 } }),
      schnitt: ability('schnitt', { kind: 'nahkampf', ap: 1, target: 'enemy', range: 1, damage: 1, status: { id: 'blutet', turns: 3 } }),
      wirbel: ability('wirbel', { kind: 'nahkampf', ap: 2, target: 'area', range: 0, radius: 1, damage: 3 }),
      drohung: ability('drohung', { kind: 'sozial', ap: 1, target: 'enemy', range: 5, damage: 40 }),
      einmal: ability('einmal', { kind: 'fernkampf', ap: 1, target: 'enemy', range: 6, damage: 5, uses: 1 }),
    },
    arenas: {
      offen: arena('offen', OPEN),
      deckung: arena('deckung', [
        'P...........',
        'P....h......',
        'P....H.....E',
        '.....#.....E',
        '...........E',
        '............',
        '......~.....',
        '............',
      ]),
      feuer: arena('feuer', ['P..~~......E', 'P..~~......E', 'P..~~......E', '...~~.......', '...~~.......', '............', '............', '............'], { hazard: { status: 'brennt', damage: 2 } }),
    },
    enemies: {
      schlaeger: enemy('schlaeger', { stats: stats(20, { armor: 1, morale: 50, attributes: { technik: 2, koerper: 5, reflexe: 4, ausstrahlung: 2, strasse: 4 }, abilities: ['hieb'] }), xp: 15, credits: [5, 10], loot: [{ item: 'kaffee', chance: 1 }] }),
      schuetze: enemy('schuetze', { name: 'Schütze', ai: 'vorsichtig', stats: stats(16, { morale: 40, attributes: { technik: 2, koerper: 3, reflexe: 6, ausstrahlung: 2, strasse: 3 }, weapon: { kind: 'fernkampf', damage: 4, range: 6 } }), xp: 20 }),
      sani: enemy('sani', { ai: 'support', stats: stats(14, { morale: 40, weapon: { kind: 'fernkampf', damage: 2, range: 4 }, abilities: ['flicken', 'schild'] }) }),
      drohne: enemy('drohne', { stats: stats(12, { armor: 2, weapon: { kind: 'smart', damage: 3, range: 4 } }) }),
      boss: enemy('boss', {
        ai: 'boss', xp: 60, credits: [50, 50],
        stats: stats(60, { armor: 2, attributes: { technik: 3, koerper: 6, reflexe: 5, ausstrahlung: 4, strasse: 4 }, abilities: ['hieb'] }),
        phases: [{ below: 0.5, ai: 'aggressiv', abilities: ['wirbel'], line: 'Jetzt reicht’s!' }],
      }),
      zivilist: enemy('zivilist', { name: 'Zivilist', stats: stats(18) }),
    },
    encounters: {
      duell: encounter('duell', {}),
      gang: encounter('gang', { enemies: [{ enemy: 'schlaeger', count: 2 }, { enemy: 'schuetze' }], reward: { xp: 20 } }),
      deckung: encounter('deckung', { arena: 'deckung', enemies: [{ enemy: 'schuetze' }, { enemy: 'sani' }] }),
      terminal: encounter('terminal', { objective: { kind: 'hack', cell: [3, 3], ap: 2 }, enemies: [{ enemy: 'drohne' }] }),
      rettung: encounter('rettung', { objective: { kind: 'rescue', unit: 'zivilist', cell: [1, 5] } }),
      ueberleben: encounter('ueberleben', { objective: { kind: 'survive', rounds: 3 }, canFlee: false, enemies: [{ enemy: 'drohne', count: 2 }] }),
      ausgang: encounter('ausgang', { objective: { kind: 'reach', cells: [[2, 7]] } }),
      boss: encounter('boss', { enemies: [{ enemy: 'boss' }], canFlee: false }),
      feuer: encounter('feuer', { arena: 'feuer' }),
    },
    items,
    npcs: {},
  };
}

export function hero(overrides: Partial<PartyMemberSpec> = {}): PartyMemberSpec {
  return {
    id: 'held', name: 'Held', source: { kind: 'player' }, sprite: 'held-walk', level: 3, hp: 40, maxHp: 40, armor: 1,
    attributes: { technik: 5, koerper: 5, reflexe: 6, ausstrahlung: 5, strasse: 4 },
    weapons: [{ kind: 'fernkampf', damage: 5, range: 6 }, { kind: 'nahkampf', damage: 5, range: 1 }],
    abilities: ['schnellschuss'],
    ...overrides,
  };
}

export function buddy(overrides: Partial<PartyMemberSpec> = {}): PartyMemberSpec {
  return hero({ id: 'kumpel', name: 'Kumpel', source: { kind: 'companion', npc: 'kumpel' }, abilities: ['flicken'], morale: 80, ...overrides });
}

export function battle(encounterId: string, extra: Partial<BattleSetup> = {}, data = combatData()): CombatState {
  return createBattle(data, { encounter: encounterId, seed: 7, party: [hero()], ...extra });
}

/** Testhilfe: Einheit direkt umstellen (Zustand ist reine Daten). */
export function place(state: CombatState, id: string, cell: Cell, patch: Partial<CombatUnit> = {}): CombatUnit {
  const unit = state.units.find(u => u.id === id);
  if (!unit) throw new Error(`Einheit fehlt: ${id}`);
  unit.cell = cell;
  Object.assign(unit, patch);
  return unit;
}

/** Testhilfe: Einheit an den Zug bringen (volle AP, frischer Zug). */
export function activate(state: CombatState, id: string, ap = 2): CombatUnit {
  const unit = place(state, id, state.units.find(u => u.id === id)!.cell, { ap, attacked: false, swapped: false, usedThisTurn: [] });
  state.active = id;
  return unit;
}

/** Testhilfe: Zufall mit festem Ergebnis (0 → jeder Wurf trifft, nahe 1 → jeder Wurf verfehlt). */
export function forceRolls(state: CombatState, value: 'hit' | 'miss'): void {
  // Sucht einen RNG-Zustand, dessen nächster Wert passt (deterministisch, wenige Versuche).
  for (let seed = 1; seed < 100000; seed++) {
    const next = (seed + 0x6d2b79f5) >>> 0;
    let t = next;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    const v = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    if ((value === 'hit' && v < 0.04) || (value === 'miss' && v > 0.96)) { state.rng = seed; return; }
  }
  throw new Error('Kein passender Zufallswert.');
}
