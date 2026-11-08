// Kampfregeln: Gegner-KI (und Autopilot für Simulationen). Deterministisch: gleicher Zustand → gleiche Aktion.
//
// Profile (design.md §3.7, world.md §8.3):
// - aggressiv: kürzester Weg zum schwächsten Ziel, greift an, wo es geht.
// - vorsichtig: sucht volle Deckung, hält Abstand, Überwachung statt blindem Vorrücken, flieht bei wenig LP.
// - support: heilt und schützt Verbündete, hält Abstand, schießt nur nebenbei.
// - boss: wie aggressiv mit stärkerer Gewichtung von Fähigkeiten; Phasen (EnemyDef.phases) wechseln Profil und
//   Fähigkeiten über die Regeln in effects.ts.
// - Schutzperson (Missionsziel `rescue`): weicht Gegnern aus und sucht Deckung.
// Party-Einheiten im Autopiloten verfolgen zusätzlich das Missionsziel (Terminal hacken, Ausgang erreichen).
import type { AbilityDef, Cell, StatusId } from '../contracts';
import { has } from '../campaign/ids';
import { abilityBlocker, abilityTargets, act, canInteract, itemAbility, usableInBattle } from './actions';
import { cellKey, coverAgainst, distance, inBounds, isHazard, isWalkable, lineOfSight, sameCell } from './grid';
import { distanceField, reachableCells } from './movement';
import { abilityDef, activeUnit, findUnit, isActive, isBeneficial, opponents } from './queries';
import { moraleDamage, strikePreview } from './resolve';
import { ABILITY_INTIMIDATE, ABILITY_REVIVE, MORALE_FLEE_BELOW } from './rules';
import type { ActResult, AiRole, AttackPreview, CombatAction, CombatData, CombatEvent, CombatState, CombatUnit } from './types';

interface Option { action: CombatAction; value: number; reason: string }

/** Kurzbegründung der letzten Planung (für Debug-Anzeige und Tests). */
export interface AiPlan { action: CombatAction; reason: string; value: number }

const STATUS_VALUE: Readonly<Record<StatusId, number>> = {
  gehackt: 6, betaeubt: 6, brennt: 4, blutet: 3, markiert: 2.5, geschuetzt: 2,
};

export function roleOf(unit: CombatUnit): AiRole {
  if (unit.vip) return 'schutz';
  return unit.ai ?? 'aggressiv';
}

// ---------------------------------------------------------------------------
// Bewertung

function strikeValue(state: CombatState, unit: CombatUnit, target: CombatUnit, preview: AttackPreview, def: AbilityDef | undefined): number {
  const p = preview.chance / 100;
  if (def && isBeneficial(def)) {
    if (def.id === ABILITY_REVIVE) return 12;
    const missing = target.maxHp - target.hp;
    const healed = Math.min(missing, preview.heal ?? 0);
    let value = healed >= 3 ? healed * 0.6 * (target.hp < target.maxHp / 2 ? 1.6 : 1) : 0;
    if (def.status && !(target.status[def.status.id] ?? 0)) {
      const threatened = state.units.some(o => isActive(o) && opponents(o, target) && distance(o.cell, target.cell) <= o.move + o.weapon.range);
      value += threatened ? STATUS_VALUE[def.status.id] * ((preview.status?.chance ?? 100) / 100) : 0.2;
    }
    if (target.vip) value *= 1.3;
    return value;
  }
  if (def?.kind === 'sozial') {
    if (target.morale === undefined) return 0;
    const drop = moraleDamage(unit, def);
    if (target.morale - drop < MORALE_FLEE_BELOW) return 5 + target.hp / Math.max(1, target.maxHp) * 3;
    return drop / 15;
  }
  let value = preview.damage * p;
  if (preview.lethal) value += 6 * p;
  value += (1 - target.hp / Math.max(1, target.maxHp)) * 2 * p;
  if (def?.status && !(target.status[def.status.id] ?? 0)) value += STATUS_VALUE[def.status.id] * (preview.status!.chance / 100) * (preview.autoHit ? 1 : p);
  if (target.vip) value += 4 * p;
  if (preview.crit) value += 0.5;
  return value;
}

/** Wie gut ist ein Standfeld für dieses Profil? (Deckung gegen Bedrohungen, Gefahr, Gefahrenfelder.) */
export function positionScore(state: CombatState, unit: CombatUnit, cell: Cell, role: AiRole = roleOf(unit)): number {
  const threats = state.units.filter(o => isActive(o) && opponents(unit, o));
  let cover = 0;
  let danger = 0;
  let nearest = Infinity;
  for (const threat of threats) {
    const dist = distance(cell, threat.cell);
    nearest = Math.min(nearest, dist);
    const reach = threat.move + threat.weapon.range;
    if (dist <= reach) {
      danger += 1;
      cover += coverAgainst(state.layout, cell, threat.cell).value / 20;
    }
  }
  const coverScore = danger ? cover / danger : 0;
  let score = 0;
  switch (role) {
    case 'aggressiv': score = 0.4 * coverScore - 0.1 * danger; break;
    case 'boss': score = 0.5 * coverScore - 0.05 * danger; break;
    case 'vorsichtig': score = 1.5 * coverScore - 0.6 * danger; break;
    case 'support': {
      const allies = state.units.filter(o => isActive(o) && !opponents(unit, o) && o.id !== unit.id && distance(o.cell, cell) <= 3).length;
      score = 1.0 * coverScore - 0.8 * danger + 0.3 * allies;
      break;
    }
    case 'schutz': score = 1.5 * coverScore - 1.5 * danger + 0.2 * Math.min(nearest, 8); break;
  }
  if (isHazard(state.layout, cell)) score -= 8;
  return score;
}

/** Mögliche Schläge, Fähigkeiten und Gegenstände von einem Feld aus mit `ap` Aktionspunkten. */
function strikeOptions(data: CombatData, state: CombatState, unit: CombatUnit, from: Cell, ap: number): Option[] {
  const options: Option[] = [];
  const role = roleOf(unit);
  if (role === 'schutz' || ap < 1) return options;
  const probe: CombatUnit = { ...unit, ap };
  const foes = state.units.filter(o => isActive(o) && opponents(unit, o));

  if (!unit.attacked) {
    for (const target of foes) {
      const preview = strikePreview(state, unit, target, { from });
      if (!preview.valid) continue;
      const value = strikeValue(state, unit, target, preview, undefined) * (role === 'support' ? 0.7 : 1);
      options.push({ action: { type: 'attack', target: target.id }, value, reason: `Angriff auf ${target.name}` });
    }
  }

  const consider = (def: AbilityDef, viaItem: string | null) => {
    if (abilityBlocker(probe, def, !!viaItem)) return;
    const make = (target?: string, cell?: Cell): CombatAction => viaItem
      ? { type: 'item', item: viaItem, target, cell }
      : { type: 'ability', ability: def.id, target, cell };
    const weight = (role === 'boss' ? 1.15 : 1) * (viaItem ? 0.8 : 1) * (def.ap > 1 ? 0.85 : 1);
    if (def.target === 'enemy' || def.target === 'ally' || def.target === 'self') {
      const candidates = def.target === 'self' ? [unit]
        : def.id === ABILITY_REVIVE ? state.units.filter(o => o.state === 'down' && !opponents(unit, o))
          : def.target === 'ally' ? state.units.filter(o => isActive(o) && !opponents(unit, o)) : foes;
      for (const target of candidates) {
        const resolved = abilityTargets(state, unit, def, target.id, undefined, from);
        if (typeof resolved === 'string') continue;
        const preview = strikePreview(state, { ...unit, cell: from }, target, { ability: def, from });
        const value = strikeValue(state, unit, target, preview, def) * weight;
        if (value > 0) options.push({ action: make(target.id), value, reason: `${def.name} auf ${target.name}` });
      }
      return;
    }
    const centers = new Map<string, Cell>();
    for (const other of state.units) if (isActive(other)) centers.set(cellKey(other.cell), other.cell);
    for (const center of centers.values()) {
      const resolved = abilityTargets(state, unit, def, undefined, center, from);
      if (typeof resolved === 'string') continue;
      let value = 0;
      for (const target of resolved.units) {
        value += strikeValue(state, unit, target, strikePreview(state, { ...unit, cell: from }, target, { ability: def, area: true }), def);
      }
      if (value > 0) options.push({ action: make(undefined, center), value: value * weight, reason: `${def.name} auf Feld ${center[0]},${center[1]}` });
    }
  };

  for (const id of unit.abilities) {
    const def = abilityDef(data, id);
    if (!def) continue;
    if (def.id === ABILITY_INTIMIDATE && unit.controller !== 'ai') continue;
    consider(def, null);
  }
  if (unit.team === 'party') {
    for (const [itemId, qty] of Object.entries(state.bag)) {
      if (qty <= 0 || !has(data.items, itemId)) continue;
      const item = data.items[itemId];
      if (!usableInBattle(data, item)) continue;
      const def = itemAbility(data, item);
      if (def) { consider(def, itemId); continue; }
      // Heilgegenstand: nur bei echter Not und nur auf Nachbarn.
      for (const target of state.units) {
        if (!isActive(target) || opponents(unit, target) || distance(target.cell, from) > 1) continue;
        if (target.hp > target.maxHp * 0.4) continue;
        const healed = Math.min(target.maxHp - target.hp, item.use?.heal ?? 0);
        options.push({ action: { type: 'item', item: itemId, target: target.id }, value: healed * 0.7, reason: `${item.name} für ${target.name}` });
      }
    }
  }
  return options;
}

const best = (options: Option[]): Option | null =>
  options.reduce<Option | null>((top, option) => (!top || option.value > top.value + 1e-9 ? option : top), null);

// ---------------------------------------------------------------------------
// Planung

/** Plant die nächste Aktion der aktiven Einheit (oder `unitId`) mit Begründung. */
export function planAi(data: CombatData, state: CombatState, unitId: string | null = state.active): AiPlan {
  const unit = findUnit(state, unitId);
  const end: AiPlan = { action: { type: 'end' }, reason: 'nichts zu tun', value: 0 };
  if (!unit || !isActive(unit) || state.outcome || state.active !== unit.id || unit.ap <= 0) return end;
  const role = roleOf(unit);

  // Vorsichtige Gegner mit Moral fliehen bei wenig LP.
  if (unit.team === 'enemy' && role === 'vorsichtig' && unit.morale !== undefined && unit.hp <= unit.maxHp * 0.25) {
    return { action: { type: 'flee' }, reason: 'zu verletzt', value: 1 };
  }

  if (role === 'schutz') return planShelter(state, unit) ?? end;

  if (unit.team === 'party') {
    const objective = planObjective(state, unit);
    if (objective) return objective;
  }

  const here = best(strikeOptions(data, state, unit, unit.cell, unit.ap));
  const posWeight = role === 'vorsichtig' || role === 'support' ? 1 : 0.5;
  const hereScore = here ? here.value + posWeight * positionScore(state, unit, unit.cell, role) : -Infinity;

  // Erst bewegen, dann handeln.
  let moveFirst: { cell: Cell; score: number; option: Option } | null = null;
  if (unit.ap >= 2) {
    for (const reach of reachableCells(state, unit, 1)) {
      const option = best(strikeOptions(data, state, unit, reach.cell, unit.ap - 1));
      if (!option || option.value <= 0) continue;
      const score = option.value + posWeight * positionScore(state, unit, reach.cell, role) - 0.05 * reach.steps - 2 * reach.watched.length - 3 * reach.hazards;
      if (!moveFirst || score > moveFirst.score + 1e-9) moveFirst = { cell: reach.cell, score, option };
    }
  }
  if (moveFirst && moveFirst.score > hereScore + 0.25) {
    return { action: { type: 'move', to: moveFirst.cell }, reason: `Stellung für ${moveFirst.option.reason}`, value: moveFirst.score };
  }
  if (here && here.value > 0) return { action: here.action, reason: here.reason, value: here.value };

  return planReposition(state, unit, role) ?? end;
}

/** Nächste Aktion der aktiven Einheit. */
export const planAiAction = (data: CombatData, state: CombatState, unitId?: string): CombatAction =>
  planAi(data, state, unitId ?? state.active).action;

/** Felder, von denen aus die Einheit `target` mit ihrer Waffe erreicht. */
function attackCells(state: CombatState, unit: CombatUnit, target: CombatUnit): Cell[] {
  const cells: Cell[] = [];
  const range = unit.weapon.range;
  for (let dy = -range; dy <= range; dy++) {
    for (let dx = -range; dx <= range; dx++) {
      const d = Math.abs(dx) + Math.abs(dy);
      if (d < 1 || d > range) continue;
      const cell: Cell = [target.cell[0] + dx, target.cell[1] + dy];
      if (!inBounds(cell) || !isWalkable(state.layout, cell)) continue;
      if (unit.weapon.kind === 'fernkampf' && !lineOfSight(state.layout, cell, target.cell)) continue;
      cells.push(cell);
    }
  }
  return cells;
}

/** Ohne Angriffsmöglichkeit: annähern, Deckung suchen, Überwachung. */
function planReposition(state: CombatState, unit: CombatUnit, role: AiRole): AiPlan | null {
  const foes = state.units.filter(o => isActive(o) && opponents(unit, o));
  if (!foes.length) return null;
  const careful = role === 'vorsichtig' || role === 'support';
  const ap = careful ? 1 : unit.ap;
  const reach = reachableCells(state, unit, ap);

  // Ziel: das schwächste erreichbare (LP plus Weg).
  let focus: { target: CombatUnit; field: Map<string, number>; score: number } | null = null;
  for (const target of foes) {
    const goals = attackCells(state, unit, target);
    if (!goals.length) continue;
    const field = distanceField(state, unit, goals);
    const dist = field.get(cellKey(unit.cell));
    if (dist === undefined) continue;
    const score = target.hp + 2 * dist - (target.vip ? 6 : 0);
    if (!focus || score < focus.score) focus = { target, field, score };
  }

  const currentDist = focus ? focus.field.get(cellKey(unit.cell)) ?? Infinity : Infinity;
  const pull = careful ? 0.35 : 1;
  let pick: { cell: Cell; score: number; dist: number } | null = null;
  const scoreOf = (cell: Cell, steps: number, watched: number, hazards: number) => {
    const dist = focus ? focus.field.get(cellKey(cell)) ?? Infinity : Infinity;
    const approach = Number.isFinite(dist) ? -dist * pull : -20;
    return { dist, score: approach + positionScore(state, unit, cell, role) - 0.01 * steps - 2 * watched - 3 * hazards };
  };
  const stay = scoreOf(unit.cell, 0, 0, 0);
  for (const entry of reach) {
    const { dist, score } = scoreOf(entry.cell, entry.steps, entry.watched.length, entry.hazards);
    if (!pick || score > pick.score + 1e-9) pick = { cell: entry.cell, score, dist };
  }
  if (pick && pick.score > stay.score + 0.2 && (pick.dist < currentDist || careful)) {
    return { action: { type: 'move', to: pick.cell }, reason: focus ? `nähert sich ${focus.target.name}` : 'sucht Deckung', value: pick.score };
  }
  if (unit.weapon.kind !== 'nahkampf' || careful) return { action: { type: 'overwatch' }, reason: 'Überwachung', value: 0.5 };
  if (positionScore(state, unit, unit.cell, role) < 0 && !unit.status.geschuetzt) return { action: { type: 'cover' }, reason: 'Deckung suchen', value: 0.3 };
  return null;
}

function planShelter(state: CombatState, unit: CombatUnit): AiPlan | null {
  const stay = positionScore(state, unit, unit.cell, 'schutz');
  let pick: { cell: Cell; score: number } | null = null;
  for (const entry of reachableCells(state, unit, 1)) {
    const score = positionScore(state, unit, entry.cell, 'schutz') - 2 * entry.watched.length - 3 * entry.hazards;
    if (!pick || score > pick.score + 1e-9) pick = { cell: entry.cell, score };
  }
  if (pick && pick.score > stay + 0.3) return { action: { type: 'move', to: pick.cell }, reason: 'bringt sich in Sicherheit', value: pick.score };
  return null;
}

/** Autopilot der Party: Terminal hacken bzw. Ausgang erreichen. */
function planObjective(state: CombatState, unit: CombatUnit): AiPlan | null {
  const objective = state.objective;
  if (objective.kind === 'hack') {
    if (canInteract(state, unit)) return { action: { type: 'interact' }, reason: 'hackt das Terminal', value: 10 };
    const helpers = state.units.filter(o => o.team === 'party' && isActive(o) && !o.vip);
    const closest = helpers.sort((a, b) => distance(a.cell, objective.cell) - distance(b.cell, objective.cell) || a.spawn - b.spawn)[0];
    if (closest?.id !== unit.id) return null;
    return moveToward(state, unit, [objective.cell], 'läuft zum Terminal');
  }
  if (objective.kind === 'reach' && unit.source.kind === 'player') {
    return moveToward(state, unit, objective.cells as Cell[], 'läuft zum Ausgang', true);
  }
  return null;
}

function moveToward(state: CombatState, unit: CombatUnit, goals: Cell[], reason: string, onGoal = false): AiPlan | null {
  const targets = onGoal ? goals : goals.flatMap(goal => [goal, ...[[0, 1], [1, 0], [0, -1], [-1, 0]].map(([dx, dy]) => [goal[0] + dx, goal[1] + dy] as Cell)]);
  const field = distanceField(state, unit, targets.filter(cell => inBounds(cell) && isWalkable(state.layout, cell)));
  const current = field.get(cellKey(unit.cell)) ?? Infinity;
  let pick: { cell: Cell; dist: number; steps: number } | null = null;
  for (const entry of reachableCells(state, unit, unit.ap)) {
    const dist = field.get(cellKey(entry.cell)) ?? Infinity;
    if (!pick || dist < pick.dist || (dist === pick.dist && entry.steps < pick.steps)) pick = { cell: entry.cell, dist, steps: entry.steps };
  }
  if (!pick || pick.dist >= current || sameCell(pick.cell, unit.cell)) return null;
  return { action: { type: 'move', to: pick.cell }, reason, value: 5 };
}

// ---------------------------------------------------------------------------
// Ausführen

/** Spielt den ganzen Zug der aktiven Einheit per KI. */
export function runAiTurn(data: CombatData, state: CombatState): ActResult {
  const unitId = state.active;
  let current = state;
  const events: CombatEvent[] = [];
  for (let guard = 0; guard < 12 && !current.outcome && current.active === unitId && unitId; guard++) {
    let result = act(data, current, planAiAction(data, current));
    if (result.error) result = act(data, current, { type: 'end' });
    if (result.error) return { state: current, events, error: result.error };
    events.push(...result.events);
    current = result.state;
  }
  if (!current.outcome && current.active === unitId) {
    const result = act(data, current, { type: 'end' });
    events.push(...result.events);
    current = result.state;
  }
  return { state: current, events, error: null };
}

/** Spielt KI-Züge, bis eine von der Darstellung gesteuerte Einheit am Zug ist oder der Kampf endet. */
export function runAiUntilPlayer(data: CombatData, state: CombatState, maxTurns = 200): ActResult {
  let current = state;
  const events: CombatEvent[] = [];
  for (let turns = 0; turns < maxTurns && !current.outcome; turns++) {
    const unit = activeUnit(current);
    if (!unit || unit.controller === 'player') break;
    const result = runAiTurn(data, current);
    if (result.error) return { state: current, events, error: result.error };
    events.push(...result.events);
    current = result.state;
  }
  return { state: current, events, error: null };
}
