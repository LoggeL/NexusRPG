// Kampfregeln: Aufbau eines Kampfs aus EncounterDef, ArenaDef, EnemyDefs und der Party.
import type { AttributeId, BattleObjective, Cell, CombatBonus, EnemyDef, UnitStats } from '../contracts';
import { ATTRIBUTE_IDS, has } from '../campaign/ids';
import { cellsWith, distance, inBounds, isWalkable, parseLayout, sameCell } from './grid';
import { startBattle, initiativeOrder } from './turns';
import { initialRng } from './rng';
import {
  DEFAULT_HAZARD_DAMAGE, DEFAULT_MAX_ROUNDS, DIFFICULTY_HP, GRID_COLS, GRID_ROWS, INITIATIVE_REFLEX_FACTOR,
  MOVE_BASE, MOVE_REFLEX_DIVISOR, PARTY_BUILTINS, UNARMED,
} from './rules';
import type { BattleSetup, CombatData, CombatState, CombatUnit, PartyMemberSpec } from './types';
import type { Ctx } from './effects';

const ZERO_BONUS: Required<CombatBonus> = { hit: 0, damage: 0, armor: 0, hp: 0, move: 0, initiative: 0, bandwidth: 0, firewall: 0 };

const fullBonus = (bonus?: CombatBonus): Required<CombatBonus> => ({ ...ZERO_BONUS, ...(bonus ?? {}) });

function normalizeAttributes(attributes: Partial<Record<AttributeId, number>>): Record<AttributeId, number> {
  const result = {} as Record<AttributeId, number>;
  for (const id of ATTRIBUTE_IDS) result[id] = Math.max(0, Math.round(attributes[id] ?? 0));
  return result;
}

const moveOf = (reflexe: number, bonus: Required<CombatBonus>) => Math.max(1, MOVE_BASE + Math.floor(reflexe / MOVE_REFLEX_DIVISOR) + bonus.move);
const initiativeOf = (reflexe: number, bonus: Required<CombatBonus>) => reflexe * INITIATIVE_REFLEX_FACTOR + bonus.initiative;

/** Einheit aus einer Party-Beschreibung. */
function partyUnit(spec: PartyMemberSpec, cell: Cell, spawn: number): CombatUnit {
  const bonus = fullBonus(spec.bonus);
  const attributes = normalizeAttributes(spec.attributes);
  const weapons = spec.weapons.length ? spec.weapons.map(w => ({ ...w })) : [{ ...UNARMED }];
  const abilities = [...new Set([...spec.abilities, ...PARTY_BUILTINS])];
  const maxHp = Math.max(1, Math.round(spec.maxHp));
  return {
    id: spec.id, name: spec.name, team: 'party', source: spec.source, sprite: spec.sprite, portrait: spec.portrait,
    cell, facing: 'e', hp: Math.max(1, Math.min(maxHp, Math.round(spec.hp))), maxHp, armor: Math.max(0, Math.round(spec.armor)),
    ap: 0, attributes, weapon: weapons[0], abilities, cooldowns: {}, uses: {}, status: {},
    morale: spec.morale, moraleMax: spec.morale, state: 'active', overwatch: false,
    controller: spec.controller ?? 'player', vip: false, level: Math.max(1, spec.level), weapons, weaponIndex: 0,
    move: moveOf(attributes.reflexe, bonus), initiative: initiativeOf(attributes.reflexe, bonus), bonus,
    attacked: false, swapped: false, usedThisTurn: [], phase: -1, stunImmune: 0, spawn,
  };
}

function statsUnit(base: {
  id: string; name: string; team: CombatUnit['team']; source: CombatUnit['source']; sprite: string; portrait?: string;
  stats: UnitStats; level: number; hpFactor: number; ai: CombatUnit['ai'];
}, cell: Cell, spawn: number): CombatUnit {
  const bonus = fullBonus();
  const attributes = normalizeAttributes(base.stats.attributes);
  const maxHp = Math.max(1, Math.round(base.stats.hp * base.hpFactor));
  const weapon = { ...(base.stats.weapon ?? UNARMED) };
  return {
    id: base.id, name: base.name, team: base.team, source: base.source, sprite: base.sprite, portrait: base.portrait,
    cell, facing: base.team === 'party' ? 'e' : 'w', hp: maxHp, maxHp, armor: Math.max(0, base.stats.armor),
    ap: 0, attributes, weapon, abilities: [...base.stats.abilities], cooldowns: {}, uses: {}, status: {},
    ai: base.ai, morale: base.stats.morale, moraleMax: base.stats.morale, state: 'active', overwatch: false,
    controller: 'ai', vip: false, level: base.level, weapons: [weapon], weaponIndex: 0,
    move: moveOf(attributes.reflexe, bonus), initiative: initiativeOf(attributes.reflexe, bonus), bonus,
    attacked: false, swapped: false, usedThisTurn: [], phase: -1, stunImmune: 0, spawn,
  };
}

/** Schutzperson ohne eigene Werte. */
const CIVILIAN: UnitStats = {
  hp: 20, armor: 0, attributes: { technik: 3, koerper: 3, reflexe: 3, ausstrahlung: 3, strasse: 3 },
  weapon: UNARMED, abilities: [],
};

class Placer {
  private taken: Cell[] = [];
  constructor(private readonly layout: readonly string[]) {}

  free(cell: Cell): boolean {
    return inBounds(cell) && isWalkable(this.layout, cell) && !this.taken.some(t => sameCell(t, cell));
  }

  take(cell: Cell): Cell { this.taken.push(cell); return cell; }

  /** Gewünschtes Feld, sonst nächster freier Start, sonst nächstes freies Feld von der eigenen Seite aus. */
  place(preferred: Cell | undefined, starts: readonly Cell[], side: 'left' | 'right'): Cell {
    if (preferred && this.free(preferred)) return this.take(preferred);
    const start = starts.find(cell => this.free(cell));
    if (start) return this.take(start);
    const anchor: Cell = preferred && inBounds(preferred) ? preferred : side === 'left' ? [0, 3] : [GRID_COLS - 1, 3];
    const all: Cell[] = [];
    for (let row = 0; row < GRID_ROWS; row++) for (let col = 0; col < GRID_COLS; col++) all.push([col, row]);
    const sorted = all
      .filter(cell => this.free(cell))
      .sort((a, b) =>
        (side === 'left' ? a[0] - b[0] : b[0] - a[0]) * (preferred ? 0 : 1) ||
        distance(a, anchor) - distance(b, anchor) || a[1] - b[1] || a[0] - b[0]);
    if (!sorted.length) throw new Error('Kein freies Feld mehr in der Arena.');
    return this.take(sorted[0]);
  }
}

function vipUnit(data: CombatData, objective: Extract<BattleObjective, { kind: 'rescue' }>, cell: Cell, spawn: number): CombatUnit {
  const npc = has(data.npcs, objective.unit) ? data.npcs[objective.unit] : undefined;
  const enemy = has(data.enemies, objective.unit) ? data.enemies[objective.unit] : undefined;
  const unit = statsUnit({
    id: `schutz:${objective.unit}`,
    name: objective.name ?? npc?.name ?? enemy?.name ?? 'Zivilperson',
    team: 'party',
    source: npc ? { kind: 'companion', npc: npc.id } : enemy ? { kind: 'enemy', enemy: enemy.id } : { kind: 'companion', npc: objective.unit },
    sprite: objective.sprite ?? npc?.sprite ?? enemy?.sprite ?? `${objective.unit}-walk`,
    portrait: npc?.portrait ?? enemy?.portrait,
    stats: npc?.companion?.stats ?? enemy?.stats ?? CIVILIAN,
    level: enemy?.level ?? 1, hpFactor: 1, ai: 'vorsichtig',
  }, cell, spawn);
  unit.vip = true;
  unit.morale = undefined;
  unit.moraleMax = undefined;
  unit.abilities = [];
  return unit;
}

/** Namen bei mehreren gleichen Gegnern durchnummerieren („Schläger 1“, „Schläger 2“). */
function enemyNames(entries: { def: EnemyDef }[]): string[] {
  const totals = new Map<string, number>();
  for (const entry of entries) totals.set(entry.def.id, (totals.get(entry.def.id) ?? 0) + 1);
  const seen = new Map<string, number>();
  return entries.map(entry => {
    const n = (seen.get(entry.def.id) ?? 0) + 1;
    seen.set(entry.def.id, n);
    return (totals.get(entry.def.id) ?? 1) > 1 ? `${entry.def.name} ${n}` : entry.def.name;
  });
}

/**
 * Neuer Kampf. Wirft bei unbekannter Begegnung/Arena/Gegner oder ungültigem Layout (Inhaltsfehler, die
 * `validateCombatContent` vorher findet). Nach dem Aufbau ist die erste handlungsfähige Einheit am Zug.
 */
export function createBattle(data: CombatData, setup: BattleSetup): CombatState {
  const encounter = has(data.encounters, setup.encounter) ? data.encounters[setup.encounter] : undefined;
  if (!encounter) throw new Error(`Unbekannte Begegnung: ${setup.encounter}`);
  const arena = has(data.arenas, encounter.arena) ? data.arenas[encounter.arena] : undefined;
  if (!arena) throw new Error(`Unbekannte Arena: ${encounter.arena}`);
  // Duell (`EncounterDef.solo`): nur die Spielfigur kämpft.
  const party = encounter.solo ? setup.party.filter(spec => spec.source.kind === 'player') : setup.party;
  if (!party.length) throw new Error('Kampf ohne Party.');
  const layout = parseLayout(arena.layout, `Arena ${arena.id}`);
  const difficulty = setup.difficulty ?? 'normal';
  // Einstieg: ausdrücklich übergeben (Schleichen, Hinterhalt auf der Karte) vor der Vorgabe der Begegnung.
  const start = setup.start ?? encounter.start ?? 'normal';
  const objective: BattleObjective = encounter.objective ?? { kind: 'defeat' };
  const placer = new Placer(layout);
  const units: CombatUnit[] = [];
  const partyStarts = cellsWith(layout, 'P');
  const enemyStarts = cellsWith(layout, 'E');

  const ids = new Set<string>();
  for (const spec of party) {
    if (ids.has(spec.id)) throw new Error(`Doppelte Einheit: ${spec.id}`);
    ids.add(spec.id);
    units.push(partyUnit(spec, placer.place(undefined, partyStarts, 'left'), units.length));
  }
  if (objective.kind === 'rescue') units.push(vipUnit(data, objective, placer.place(objective.cell, partyStarts, 'left'), units.length));

  const entries: { def: EnemyDef; at?: Cell }[] = [];
  for (const entry of encounter.enemies) {
    const def = has(data.enemies, entry.enemy) ? data.enemies[entry.enemy] : undefined;
    if (!def) throw new Error(`Unbekannter Gegner: ${entry.enemy}`);
    const count = Math.max(1, Math.floor(entry.count ?? 1));
    for (let i = 0; i < count; i++) entries.push({ def, at: i === 0 ? entry.at : undefined });
  }
  const names = enemyNames(entries);
  const counters = new Map<string, number>();
  entries.forEach((entry, index) => {
    const n = (counters.get(entry.def.id) ?? 0) + 1;
    counters.set(entry.def.id, n);
    units.push(statsUnit({
      id: `${entry.def.id}#${n}`, name: names[index], team: 'enemy', source: { kind: 'enemy', enemy: entry.def.id },
      sprite: entry.def.sprite ?? `${entry.def.id}-walk`, portrait: entry.def.portrait, stats: entry.def.stats,
      level: entry.def.level, hpFactor: DIFFICULTY_HP[difficulty], ai: entry.def.ai,
    }, placer.place(entry.at, enemyStarts, 'right'), units.length));
  });

  const state: CombatState = {
    encounter: encounter.id, arena: arena.id, round: 1, order: initiativeOrder(units, start), active: null,
    units, log: [], outcome: null, rng: initialRng(setup.seed, encounter.id), layout,
    hazard: { status: arena.hazard?.status, damage: arena.hazard?.damage ?? (arena.hazard?.status ? 0 : DEFAULT_HAZARD_DAMAGE) },
    objective, progress: 0, canFlee: encounter.canFlee ?? true, start, difficulty, surprise: start === 'ueberrumpelt',
    bag: Object.fromEntries(Object.entries(setup.bag ?? {}).filter(([item, qty]) => qty > 0 && has(data.items, item))),
    used: {}, rewards: null, maxRounds: Math.max(1, Math.floor(setup.maxRounds ?? encounter.maxRounds ?? DEFAULT_MAX_ROUNDS)),
  };
  // Vorbereitungen (EncounterDef.startStatus): Zustände ab der ersten Runde.
  for (const entry of setup.startStatus ?? []) {
    const rounds = Math.max(0, Math.floor(entry.rounds));
    if (!rounds) continue;
    for (const unit of units) {
      const hit = entry.target === 'party' ? unit.team === 'party'
        : entry.target === 'enemies' ? unit.team === 'enemy'
        : entry.target === 'player' ? unit.source.kind === 'player'
        : unit.source.kind === 'enemy' && unit.source.enemy === entry.target;
      if (hit && !unit.vip) unit.status[entry.status] = Math.max(unit.status[entry.status] ?? 0, rounds);
    }
  }
  const ctx: Ctx = { data, s: state, events: [] };
  startBattle(ctx);
  return state;
}
