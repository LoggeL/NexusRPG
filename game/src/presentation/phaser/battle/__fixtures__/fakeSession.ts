// Kleiner, deterministischer Regel-Ersatz für Tests der Kampfdarstellung (kein Teil des Spiels).
// Erfüllt BattleSessionPort mit einfachen Regeln: 2 AP, Bewegung 3 Felder, Treffer abwechselnd.
import type {
  AbilityDef, ArenaDef, BattleAction, BattleEvent, BattleResult, BattleState, BattleUnit, Cell, EncounterDef, GameContent, ItemDef,
} from '../../../../modules/contracts';
import { manhattan, sameCell } from '../geometry';
import type { BattleSessionPort, PerformResult, ReachOption, TargetPreview, TargetedAction } from '../rulesPort';

export const FAKE_ABILITIES: Record<string, AbilityDef> = {
  aufputschen: { id: 'aufputschen', name: 'Aufputschen', description: 'Heilt dich selbst.', kind: 'support', ap: 1, target: 'self', range: 0, heal: 3, cooldown: 2 },
  stoersignal: { id: 'stoersignal', name: 'Störsignal', description: 'Hackt ein Ziel.', kind: 'hack', ap: 2, target: 'enemy', range: 4, status: { id: 'gehackt', turns: 1 } },
  granate: { id: 'granate', name: 'Granate', description: 'Fläche.', kind: 'gegenstand', ap: 1, target: 'area', range: 4, radius: 1, damage: 3 },
  medi: { id: 'medi', name: 'Medi-Spray', description: 'Heilt.', kind: 'support', ap: 1, target: 'ally', range: 1, heal: 5 },
};

export const FAKE_ITEMS: Record<string, ItemDef> = {
  medkit: { id: 'medkit', name: 'Medkit', description: 'Heilt 5 LP.', category: 'verbrauch', icon: 'medkit', price: 20, use: { label: 'Benutzen', battle: 'medi' } },
  rauchgranate: { id: 'rauchgranate', name: 'Splittergranate', description: 'Fläche.', category: 'verbrauch', icon: 'g', price: 30, use: { label: 'Werfen', battle: 'granate' } },
  kaffee: { id: 'kaffee', name: 'Kaffee', description: 'Nur draußen.', category: 'verbrauch', icon: 'k', price: 3 },
};

export const FAKE_CONTENT: Pick<GameContent, 'abilities' | 'items' | 'enemies'> = { abilities: FAKE_ABILITIES, items: FAKE_ITEMS, enemies: {} };

export const FAKE_ARENA: ArenaDef = { id: 'test', name: 'Test', bg: 'arena-test', layout: ['............', '............', '............', '............', '............', '............', '............', '............'] };

export const FAKE_ENCOUNTER: EncounterDef = {
  id: 'fake', name: 'Testkampf', arena: 'test', enemies: [{ enemy: 'schlaeger', count: 2 }], canFlee: true,
  reward: { xp: 40, credits: 25, items: { kaffee: 1 } }, intro: [{ speaker: 'narrator', text: 'Los geht es.' }],
};

const attrs = { technik: 4, koerper: 4, reflexe: 4, ausstrahlung: 3, strasse: 3 };

function unit(id: string, team: 'party' | 'enemy', cell: Cell, extra: Partial<BattleUnit> = {}): BattleUnit {
  return {
    id, name: id, team, source: team === 'enemy' ? { kind: 'enemy', enemy: 'schlaeger' } : id === 'player' ? { kind: 'player' } : { kind: 'companion', npc: id },
    sprite: `${id}-walk`, cell, facing: 's', hp: 12, maxHp: 12, armor: 0, ap: 2, attributes: { ...attrs },
    weapon: { kind: team === 'enemy' ? 'nahkampf' : 'fernkampf', damage: 4, range: team === 'enemy' ? 1 : 5 },
    abilities: id === 'player' ? ['aufputschen', 'stoersignal'] : [], cooldowns: {}, uses: {}, status: {}, state: 'active', overwatch: false, ...extra,
  };
}

export interface FakeOptions { stallAi?: boolean; enemyHp?: number }

export class FakeSession implements BattleSessionPort {
  readonly encounter = FAKE_ENCOUNTER;
  readonly arena = FAKE_ARENA;
  private s: BattleState;
  private hitToggle = true;
  performed: BattleAction[] = [];
  aiCalls = 0;
  stock: Record<string, number> = { medkit: 2, rauchgranate: 1 };

  constructor(private readonly options: FakeOptions = {}) {
    const hp = options.enemyHp ?? 4;
    this.s = {
      encounter: 'fake', arena: 'test', round: 1, order: ['player', 'crew', 'e1', 'e2'], active: 'player',
      units: [
        unit('player', 'party', [1, 3]), unit('crew', 'party', [1, 5]),
        unit('e1', 'enemy', [6, 3], { hp, maxHp: hp }), unit('e2', 'enemy', [9, 5], { hp, maxHp: hp }),
      ],
      log: [], outcome: null, rng: 1,
    };
  }

  state(): Readonly<BattleState> { return this.s; }
  start(): BattleEvent[] { return [{ type: 'turn', unit: 'player', round: 1 }]; }

  private u(id: string | null | undefined) { return this.s.units.find((entry) => entry.id === id); }
  private occupied(cell: Cell) { return this.s.units.some((entry) => entry.state === 'active' && sameCell(entry.cell, cell)); }

  reachable(unitId: string): ReachOption[] {
    const self = this.u(unitId);
    if (!self || self.ap < 1) return [];
    const result: ReachOption[] = [];
    const seen = new Set<string>([String(self.cell)]);
    let frontier: { cell: Cell; path: Cell[] }[] = [{ cell: self.cell, path: [] }];
    for (let step = 0; step < 3; step++) {
      const next: typeof frontier = [];
      for (const node of frontier) {
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const cell: Cell = [node.cell[0] + dx, node.cell[1] + dy];
          if (cell[0] < 0 || cell[0] > 11 || cell[1] < 0 || cell[1] > 7 || seen.has(String(cell)) || this.occupied(cell)) continue;
          seen.add(String(cell));
          const path = [...node.path, cell];
          result.push({ cell, path, ap: 1 });
          next.push({ cell, path });
        }
      }
      frontier = next;
    }
    return result;
  }

  targets(unitId: string, action: TargetedAction): TargetPreview[] {
    const self = this.u(unitId);
    if (!self) return [];
    const ability = action.type === 'ability' ? FAKE_ABILITIES[action.ability] : action.type === 'item' ? FAKE_ABILITIES[FAKE_ITEMS[action.item]?.use?.battle ?? ''] : undefined;
    const team = ability?.target === 'ally' ? self.team : self.team === 'party' ? 'enemy' : 'party';
    const range = ability ? ability.range : self.weapon.range;
    return this.s.units
      .filter((other) => other.state === 'active' && other.team === team && (ability?.target !== 'enemy' || other.id !== self.id) && (ability?.target !== 'area' || true))
      .filter((other) => ability?.target === 'area' || manhattan(other.cell, self.cell) <= range)
      .map((other) => (ability?.heal ? { unit: other.id, cell: other.cell, heal: ability.heal } : { unit: other.id, cell: other.cell, chance: 70, damage: [3, 5] as const, cover: 'half' as const }));
  }

  items() { return Object.entries(this.stock).map(([item, qty]) => ({ item, qty })); }

  perform(action: BattleAction): PerformResult {
    this.performed.push(action);
    const self = this.u(this.s.active);
    if (!self) return { ok: false, error: 'Niemand am Zug.' };
    const events: BattleEvent[] = [];
    switch (action.type) {
      case 'move': {
        const option = this.reachable(self.id).find((entry) => sameCell(entry.cell, action.to));
        if (!option) return { ok: false, error: 'Feld nicht erreichbar.' };
        self.cell = option.cell;
        self.ap -= 1;
        events.push({ type: 'move', unit: self.id, path: option.path });
        break;
      }
      case 'attack': {
        const target = this.u(action.target);
        if (!target || self.ap < 1) return { ok: false, error: 'Kein Ziel.' };
        self.ap -= 1;
        events.push(...this.hit(self, target, 4));
        break;
      }
      case 'ability': {
        const def = FAKE_ABILITIES[action.ability];
        if (!def || self.ap < def.ap) return { ok: false, error: 'Geht nicht.' };
        self.ap -= def.ap;
        if (def.heal) { self.hp = Math.min(self.maxHp, self.hp + def.heal); events.push({ type: 'heal', unit: self.id, target: self.id, amount: def.heal }); }
        if (def.status && action.target) { const target = this.u(action.target); if (target) { target.status = { ...target.status, [def.status.id]: def.status.turns }; events.push({ type: 'status', unit: target.id, status: def.status.id, turns: def.status.turns }); } }
        break;
      }
      case 'item': {
        if (!this.stock[action.item]) return { ok: false, error: 'Nicht im Gepäck.' };
        this.stock[action.item] -= 1;
        self.ap -= 1;
        const target = this.u(action.target ?? self.id);
        if (target) { target.hp = Math.min(target.maxHp, target.hp + 5); events.push({ type: 'heal', unit: self.id, target: target.id, amount: 5 }); }
        break;
      }
      case 'overwatch': self.overwatch = true; self.ap = 0; break;
      case 'cover': self.ap = 0; break;
      case 'flee': this.s.outcome = 'fled'; events.push({ type: 'end', outcome: 'fled' }); break;
      case 'end': events.push(...this.advance()); break;
    }
    this.s.log.push(...events);
    this.s = { ...this.s };
    return { ok: true, events };
  }

  aiStep(): BattleEvent[] {
    this.aiCalls++;
    if (this.options.stallAi) return [];
    const self = this.u(this.s.active);
    if (!self) return [];
    if (self.ap <= 0) { const events = this.advance(); this.s.log.push(...events); return events; }
    const foe = this.s.units.filter((other) => other.team === 'party' && other.state === 'active').sort((a, b) => manhattan(a.cell, self.cell) - manhattan(b.cell, self.cell))[0];
    const events: BattleEvent[] = [];
    if (foe && manhattan(foe.cell, self.cell) <= 1) { self.ap -= 1; events.push(...this.hit(self, foe, 2)); }
    else if (foe) {
      const best = this.reachable(self.id).sort((a, b) => manhattan(a.cell, foe.cell) - manhattan(b.cell, foe.cell))[0];
      self.ap -= 1;
      if (best) { self.cell = best.cell; events.push({ type: 'move', unit: self.id, path: best.path }); }
    }
    this.s.log.push(...events);
    this.s = { ...this.s };
    return events;
  }

  private hit(self: BattleUnit, target: BattleUnit, damage: number): BattleEvent[] {
    const hit = this.hitToggle;
    this.hitToggle = !this.hitToggle;
    this.s.rng += 1;
    const events: BattleEvent[] = [{ type: 'attack', unit: self.id, target: target.id, hit, chance: 70, damage: hit ? damage : 0 }];
    if (hit) {
      target.hp = Math.max(0, target.hp - damage);
      if (target.hp === 0) { target.state = 'down'; events.push({ type: 'down', unit: target.id }); }
    }
    const enemiesLeft = this.s.units.some((other) => other.team === 'enemy' && other.state === 'active');
    const partyLeft = this.s.units.some((other) => other.team === 'party' && other.state === 'active');
    if (!enemiesLeft) { this.s.outcome = 'win'; events.push({ type: 'end', outcome: 'win' }); }
    else if (!partyLeft) { this.s.outcome = 'lose'; events.push({ type: 'end', outcome: 'lose' }); }
    return events;
  }

  private advance(): BattleEvent[] {
    const alive = this.s.order.filter((id) => this.u(id)?.state === 'active');
    const index = alive.indexOf(this.s.active ?? '');
    const nextIndex = (index + 1) % alive.length;
    if (nextIndex === 0) this.s.round += 1;
    const next = this.u(alive[nextIndex]);
    if (!next) return [];
    next.ap = 2;
    next.overwatch = false;
    this.s.active = next.id;
    return [{ type: 'turn', unit: next.id, round: this.s.round }];
  }

  result(): BattleResult {
    const player = this.u('player');
    return { encounter: 'fake', outcome: this.s.outcome ?? 'fled', playerHp: player?.hp ?? 1, xp: 10, credits: 5, loot: { kaffee: 1 }, used: { medkit: 2 - (this.stock.medkit ?? 0) } };
  }
}
