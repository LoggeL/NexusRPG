// Kampfregeln: Änderungen am Kampfzustand (Schaden, Zustände, Moral, Bossphasen, Ausgang, Belohnung).
// Alle Funktionen arbeiten auf einer Arbeitskopie (`Ctx.s`), die `act` vorher erzeugt hat.
import type { BattleOutcome, Cell, StatusId } from '../contracts';
import { clamp, has } from '../campaign/ids';
import { distance, facingToward, isHazard, sameCell } from './grid';
import { findUnit, homeTeam, isActive, isInvulnerable, livingOf, opponents, ruleOpen, rulesOf } from './queries';
import { nextRandom, randomInt } from './rng';
import {
  FLED_XP_FACTOR, MORALE_ALLY_DOWN, MORALE_FLEE_BELOW, MORALE_SURRENDER_BELOW, STATUS_LABELS,
} from './rules';
import type { CombatData, CombatEvent, CombatRewards, CombatState, CombatUnit } from './types';

export interface Ctx {
  data: CombatData;
  s: CombatState;
  events: CombatEvent[];
}

export function emit(ctx: Ctx, event: CombatEvent): void {
  ctx.s.log.push(event);
  ctx.events.push(event);
}

/** Nächster Zufallswert 0 ≤ x < 1 aus dem Kampf-Seed. */
export function roll(ctx: Ctx): number {
  const [value, next] = nextRandom(ctx.s.rng);
  ctx.s.rng = next;
  return value;
}

/** Erfolg mit Wahrscheinlichkeit `percent` (0..100). */
export const rollPercent = (ctx: Ctx, percent: number): boolean => percent >= 100 || roll(ctx) * 100 < percent;

// ---------------------------------------------------------------------------
// Lebenspunkte

/**
 * Schaden ohne weitere Abzüge anwenden; 0 LP = K.O. Liefert den tatsächlichen Schaden.
 * Bossregeln: Unverwundbare nehmen nichts; mit Regel `yield` gibt die Einheit unter ihrer Schwelle auf, statt K.O. zu gehen.
 */
export function dealDamage(ctx: Ctx, target: CombatUnit, amount: number): number {
  if (!isActive(target) || amount <= 0) return 0;
  if (isInvulnerable(ctx.s, target)) {
    emit(ctx, { type: 'notice', unit: target.id, text: `${target.name} ist unverwundbar.`, tone: 'warn' });
    return 0;
  }
  const dealt = Math.min(target.hp, Math.round(amount));
  const giveUp = rulesOf(target, 'yield').find(({ rule }) => ruleOpen(ctx.s, target, rule) && (target.hp - dealt) / Math.max(1, target.maxHp) < rule.below);
  if (giveUp) {
    target.hp = Math.max(1, target.hp - dealt);
    checkPhases(ctx, target);
    yieldField(ctx, target, giveUp.rule);
    return dealt;
  }
  target.hp -= dealt;
  if (target.hp <= 0) knockOut(ctx, target);
  else checkPhases(ctx, target);
  return dealt;
}

/** Aufgabe/Flucht statt K.O. (Regel `yield`); mit `all` hören die übrigen Mitstreiter mit auf. */
function yieldField(ctx: Ctx, unit: CombatUnit, rule: { mode: 'surrender' | 'flee'; line?: string; all?: boolean }): void {
  if (rule.line) emit(ctx, { type: 'bark', unit: unit.id, text: rule.line });
  leaveField(ctx, unit, rule.mode === 'flee' ? 'fled' : 'surrendered');
  if (!rule.all) return;
  const team = homeTeam(unit);
  for (const other of ctx.s.units) if (other.id !== unit.id && isActive(other) && homeTeam(other) === team) leaveField(ctx, other, 'surrendered');
}

export function heal(ctx: Ctx, by: CombatUnit, target: CombatUnit, amount: number): number {
  if (!isActive(target) || amount <= 0) return 0;
  const healed = Math.min(target.maxHp - target.hp, Math.round(amount));
  target.hp += healed;
  emit(ctx, { type: 'heal', unit: by.id, target: target.id, amount: healed });
  return healed;
}

function knockOut(ctx: Ctx, unit: CombatUnit): void {
  unit.hp = 0;
  unit.state = 'down';
  unit.status = {};
  unit.overwatch = false;
  unit.ap = 0;
  emit(ctx, { type: 'down', unit: unit.id });
  for (const ally of livingOf(ctx.s, unit.team)) changeMorale(ctx, ally, -MORALE_ALLY_DOWN);
}

/** Bossphasen nach verbleibendem LP-Anteil (EnemyDef.phases, jede Phase einmal). */
export function checkPhases(ctx: Ctx, unit: CombatUnit): void {
  if (unit.source.kind !== 'enemy' || !has(ctx.data.enemies, unit.source.enemy)) return;
  const phases = ctx.data.enemies[unit.source.enemy].phases ?? [];
  const fraction = unit.maxHp > 0 ? unit.hp / unit.maxHp : 0;
  for (let index = unit.phase + 1; index < phases.length; index++) {
    const phase = phases[index];
    if (fraction >= phase.below) continue;
    unit.phase = index;
    if (phase.ai) unit.ai = phase.ai;
    for (const ability of phase.abilities ?? []) if (!unit.abilities.includes(ability)) unit.abilities.push(ability);
    emit(ctx, { type: 'phase', unit: unit.id, phase: index });
    if (phase.line) emit(ctx, { type: 'bark', unit: unit.id, text: phase.line });
  }
}

// ---------------------------------------------------------------------------
// Zustände und Moral

export function applyStatus(ctx: Ctx, target: CombatUnit, status: StatusId, turns: number): boolean {
  if (!isActive(target) || turns <= 0) return false;
  if (status === 'betaeubt' && target.stunImmune > 0) {
    emit(ctx, { type: 'resist', unit: target.id, status });
    return false;
  }
  target.status[status] = Math.max(target.status[status] ?? 0, Math.floor(turns));
  emit(ctx, { type: 'status', unit: target.id, status, turns: target.status[status]! });
  return true;
}

export function removeStatus(ctx: Ctx, target: CombatUnit, status: StatusId): void {
  if (!target.status[status]) return;
  delete target.status[status];
  emit(ctx, { type: 'statusEnd', unit: target.id, status });
}

/**
 * Moral ändern (nur Gegner mit Moralwert; Drohnen, Bosse und die Party sind unbeeindruckt).
 * Unter 15 ergibt sich die Einheit, unter 30 flieht sie.
 */
export function changeMorale(ctx: Ctx, unit: CombatUnit, delta: number): void {
  if (unit.team !== 'enemy' || unit.home || unit.morale === undefined || !isActive(unit) || delta === 0) return;
  const before = unit.morale;
  unit.morale = clamp(before + delta, 0, 100);
  emit(ctx, { type: 'morale', unit: unit.id, morale: unit.morale, delta: unit.morale - before });
  if (unit.morale < MORALE_SURRENDER_BELOW) leaveField(ctx, unit, 'surrendered');
  else if (unit.morale < MORALE_FLEE_BELOW) leaveField(ctx, unit, 'fled');
}

/** Einheit verlässt den Kampf (Flucht oder Aufgabe). */
export function leaveField(ctx: Ctx, unit: CombatUnit, state: 'fled' | 'surrendered'): void {
  if (!isActive(unit)) return;
  unit.state = state;
  unit.overwatch = false;
  unit.ap = 0;
  emit(ctx, state === 'fled' ? { type: 'flee', unit: unit.id } : { type: 'surrender', unit: unit.id });
}

/** Gefahrenfeld (ArenaDef.hazard) beim Betreten und zu Zugbeginn. */
export function applyHazard(ctx: Ctx, unit: CombatUnit): void {
  if (!isActive(unit) || !isHazard(ctx.s.layout, unit.cell)) return;
  const { damage, status } = ctx.s.hazard;
  if (damage > 0) {
    emit(ctx, { type: 'damage', unit: unit.id, amount: Math.min(unit.hp, damage), source: 'gefahr' });
    dealDamage(ctx, unit, damage);
  }
  if (status && isActive(unit)) applyStatus(ctx, unit, status, status === 'brennt' ? 2 : 1);
}

/** Blickrichtung zum nächsten aktiven Gegner (am Zugende; bestimmt, wo die Flanke liegt). */
export function faceNearestOpponent(ctx: Ctx, unit: CombatUnit): void {
  let best: CombatUnit | null = null;
  for (const other of ctx.s.units) {
    if (!isActive(other) || !opponents(unit, other)) continue;
    if (!best || distance(unit.cell, other.cell) < distance(unit.cell, best.cell)) best = other;
  }
  if (best) unit.facing = facingToward(unit.cell, best.cell, unit.facing);
}

export const statusLabel = (status: StatusId): string => STATUS_LABELS[status];

// ---------------------------------------------------------------------------
// Ausgang und Belohnung

/** Party-Kämpfer (ohne Schutzperson; gesteuerte zählen zu ihrer eigentlichen Seite). */
const partyFighters = (s: CombatState) => s.units.filter(unit => homeTeam(unit) === 'party' && !unit.vip);

/** Prüft Sieg und Niederlage; beendet den Kampf, wenn entschieden. */
export function checkOutcome(ctx: Ctx): boolean {
  const s = ctx.s;
  if (s.outcome) return true;
  if (!partyFighters(s).some(isActive)) return finish(ctx, 'lose');
  if (s.units.some(unit => unit.vip && unit.state === 'down')) return finish(ctx, 'lose');
  if (!s.units.some(unit => homeTeam(unit) === 'enemy' && isActive(unit))) return finish(ctx, 'win');
  const objective = s.objective;
  if (objective.kind === 'hack' && s.progress >= objective.ap) return finish(ctx, 'win');
  if (objective.kind === 'reach') {
    const runners = s.units.filter(unit => unit.team === 'party' && isActive(unit) && unit.source.kind === 'player');
    const candidates = runners.length ? runners : partyFighters(s).filter(isActive);
    if (candidates.some(unit => objective.cells.some(cell => sameCell(cell as Cell, unit.cell)))) return finish(ctx, 'win');
  }
  return false;
}

export function finish(ctx: Ctx, outcome: BattleOutcome): true {
  const s = ctx.s;
  s.outcome = outcome;
  s.active = null;
  for (const unit of s.units) { unit.ap = 0; unit.overwatch = false; releaseControl(unit); }
  s.rewards = outcome === 'win' ? rollRewards(ctx) : null;
  emit(ctx, { type: 'end', outcome });
  return true;
}

/** XP, Credits und Beute der besiegten Gegner (Geflohene: halbe XP, keine Beute). */
function rollRewards(ctx: Ctx): CombatRewards {
  const rewards: CombatRewards = { xp: 0, credits: 0, loot: {} };
  for (const unit of ctx.s.units) {
    if (unit.team !== 'enemy' || unit.source.kind !== 'enemy' || !has(ctx.data.enemies, unit.source.enemy)) continue;
    const def = ctx.data.enemies[unit.source.enemy];
    if (unit.state === 'fled') { rewards.xp += Math.floor(def.xp * FLED_XP_FACTOR); continue; }
    if (unit.state !== 'down' && unit.state !== 'surrendered') continue;
    rewards.xp += def.xp;
    if (def.credits) rewards.credits += randomInt(roll(ctx), def.credits[0], def.credits[1]);
    for (const entry of def.loot ?? []) {
      if (!has(ctx.data.items, entry.item)) continue;
      if (roll(ctx) < entry.chance) rewards.loot[entry.item] = (rewards.loot[entry.item] ?? 0) + Math.max(1, entry.qty ?? 1);
    }
  }
  return rewards;
}

export const unitById = (ctx: Ctx, id: string | undefined): CombatUnit | undefined => findUnit(ctx.s, id);

/** „Gesteuert“: Die Einheit kämpft ihren Zug für die Gegenseite (KI steuert). */
export function takeControl(ctx: Ctx, unit: CombatUnit): void {
  if (unit.home) return;
  unit.home = unit.team;
  unit.homeController = unit.controller;
  unit.team = unit.team === 'party' ? 'enemy' : 'party';
  unit.controller = 'ai';
  unit.overwatch = false;
  emit(ctx, {
    type: 'notice', unit: unit.id, tone: 'warn',
    text: unit.home === 'party' ? `${unit.name} ist gesteuert und kämpft diesen Zug gegen euch!` : `${unit.name} kämpft diesen Zug auf eurer Seite.`,
  });
}

/** Ende von „gesteuert“: zurück auf die eigene Seite. */
export function releaseControl(unit: CombatUnit): void {
  if (!unit.home) return;
  unit.team = unit.home;
  unit.controller = unit.homeController ?? (unit.home === 'party' ? 'player' : 'ai');
  delete unit.home;
  delete unit.homeController;
}
