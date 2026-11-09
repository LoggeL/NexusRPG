// Kampfregeln: Zugreihenfolge, Zugbeginn und Zugende.
// - Initiative = Reflexe × 2 + Bonus; Gleichstand: Party zuerst, dann höhere Reflexe, dann Aufstellungsreihenfolge.
// - Überrumpelt: in Runde 1 handelt die ganze Party zuerst; Hinterhalt: die Gegner zuerst. Ab Runde 2 gilt die
//   Initiative.
// - Zugbeginn: 2 AP, Überwachung endet, Gefahrenfeld, Brennen und Bluten, dann ticken die Zustände; „Gehackt“
//   oder „Betäubt“ lassen den Zug aussetzen.
// - Zugende: Blick zum nächsten Gegner, Abklingzeiten laufen (außer für in diesem Zug Eingesetztes).
import { rulesAtRoundStart, rulesAtTurnStart } from './bossRules';
import {
  applyHazard, checkOutcome, dealDamage, emit, faceNearestOpponent, finish, releaseControl, removeStatus, takeControl, type Ctx,
} from './effects';
import { activeUnit, findUnit, hasStatus, isActive } from './queries';
import { AP_PER_TURN, BLEED_DAMAGE, BURN_DAMAGE, ENCOURAGED_AP, SKIP_STATUS } from './rules';
import type { BattleStart, CombatState, CombatUnit } from './types';
import type { StatusId } from '../contracts';

/** Reihenfolge der Einheiten-IDs nach Initiative (für Runde 1 abhängig vom Einstieg). */
export function initiativeOrder(units: readonly CombatUnit[], start: BattleStart = 'normal'): string[] {
  const first = start === 'ueberrumpelt' ? 'party' : start === 'hinterhalt' ? 'enemy' : null;
  return [...units]
    .sort((a, b) =>
      (first ? Number(b.team === first) - Number(a.team === first) : 0) ||
      b.initiative - a.initiative ||
      Number(b.team === 'party') - Number(a.team === 'party') ||
      (b.attributes.reflexe ?? 0) - (a.attributes.reflexe ?? 0) ||
      a.spawn - b.spawn)
    .map(unit => unit.id);
}

/** Startet den Kampf: Runde 1, erste Einheit am Zug. */
export function startBattle(ctx: Ctx): void {
  emit(ctx, { type: 'round', round: ctx.s.round });
  rulesAtRoundStart(ctx);
  if (!checkOutcome(ctx)) advance(ctx);
}

/** Beendet den Zug der aktiven Einheit und gibt an die nächste weiter. */
export function finishTurn(ctx: Ctx): void {
  const unit = activeUnit(ctx.s);
  if (unit) closeTurn(ctx, unit);
  if (!checkOutcome(ctx)) advance(ctx);
}

/** Zustände, die erst am Ende des eigenen Zugs herunterzählen (sie wirken auf genau diesen Zug). */
const TURN_END_STATUS: readonly StatusId[] = ['gesteuert', 'ermutigt'];

function closeTurn(ctx: Ctx, unit: CombatUnit): void {
  releaseControl(unit);
  for (const status of TURN_END_STATUS) {
    if (!unit.status[status]) continue;
    const left = unit.status[status]! - 1;
    if (left > 0) unit.status[status] = left;
    else removeStatus(ctx, unit, status);
  }
  if (isActive(unit)) faceNearestOpponent(ctx, unit);
  for (const [ability, left] of Object.entries(unit.cooldowns)) {
    if (unit.usedThisTurn.includes(ability)) continue;
    if (left <= 1) delete unit.cooldowns[ability];
    else unit.cooldowns[ability] = left - 1;
  }
  unit.usedThisTurn = [];
  unit.ap = 0;
}

function newRound(ctx: Ctx): void {
  const s = ctx.s;
  s.round += 1;
  emit(ctx, { type: 'round', round: s.round });
  if (s.objective.kind === 'survive' && s.round > s.objective.rounds) { finish(ctx, 'win'); return; }
  if (s.round > s.maxRounds) { finish(ctx, 'fled'); return; }
  if (s.round === 2 && s.start !== 'normal') s.order = initiativeOrder(s.units, 'normal');
  rulesAtRoundStart(ctx);
}

/** Nächste Einheit in der Reihenfolge, die noch kämpft (startet bei Bedarf eine neue Runde). */
function nextUnit(ctx: Ctx): CombatUnit | null {
  const s = ctx.s;
  let index = s.active ? s.order.indexOf(s.active) : -1;
  for (let guard = 0; guard <= s.order.length * 2 + 1; guard++) {
    index += 1;
    if (index >= s.order.length) {
      newRound(ctx);
      if (s.outcome) return null;
      index = 0;
    }
    const unit = findUnit(s, s.order[index]);
    if (unit && isActive(unit)) return unit;
  }
  return null;
}

/** Gibt den Zug weiter, bis eine Einheit handeln kann oder der Kampf endet. */
function advance(ctx: Ctx): void {
  const s = ctx.s;
  for (let guard = 0; guard < s.units.length * 4 + 8; guard++) {
    if (s.outcome) return;
    const unit = nextUnit(ctx);
    if (!unit) { checkOutcome(ctx); return; }
    const ready = beginTurn(ctx, unit);
    if (s.outcome || checkOutcome(ctx)) return;
    if (ready) return;
    closeTurn(ctx, unit);
  }
  // Sicherheitsnetz: niemand kann mehr handeln.
  if (!s.outcome) finish(ctx, 'fled');
}

/** Zugbeginn; liefert true, wenn die Einheit jetzt handeln kann. */
function beginTurn(ctx: Ctx, unit: CombatUnit): boolean {
  const s = ctx.s;
  s.active = unit.id;
  emit(ctx, { type: 'turn', unit: unit.id, round: s.round });
  // „Ermutigt“ gibt diesem Zug +1 AP, „Gesteuert“ steuert diesen Zug; beide zählen erst am Zugende herunter.
  const encouraged = hasStatus(unit, 'ermutigt');
  const controlled = hasStatus(unit, 'gesteuert');
  unit.ap = AP_PER_TURN + (encouraged ? ENCOURAGED_AP : 0);
  unit.attacked = false;
  unit.swapped = false;
  unit.usedThisTurn = [];
  unit.overwatch = false;

  applyHazard(ctx, unit);
  if (isActive(unit) && hasStatus(unit, 'brennt')) {
    emit(ctx, { type: 'damage', unit: unit.id, amount: Math.min(unit.hp, BURN_DAMAGE), source: 'brennt' });
    dealDamage(ctx, unit, BURN_DAMAGE);
  }
  if (isActive(unit) && hasStatus(unit, 'blutet')) {
    emit(ctx, { type: 'damage', unit: unit.id, amount: Math.min(unit.hp, BLEED_DAMAGE), source: 'blutet' });
    dealDamage(ctx, unit, BLEED_DAMAGE);
  }
  if (!isActive(unit)) return false;

  const skip = SKIP_STATUS.find(status => hasStatus(unit, status));
  if (unit.stunImmune > 0) unit.stunImmune -= 1;
  for (const status of Object.keys(unit.status) as StatusId[]) {
    if (TURN_END_STATUS.includes(status)) continue;
    const left = (unit.status[status] ?? 0) - 1;
    if (left > 0) unit.status[status] = left;
    else {
      removeStatus(ctx, unit, status);
      if (status === 'betaeubt') unit.stunImmune = 1;
    }
  }
  if (skip) {
    emit(ctx, { type: 'skip', unit: unit.id, status: skip });
    unit.ap = 0;
    return false;
  }
  if (controlled) takeControl(ctx, unit);
  if (rulesAtTurnStart(ctx, unit)) return false;
  return true;
}

/** Kommende Züge ab der aktiven Einheit (für die Porträtleiste), höchstens `count` Einträge. */
export function upcomingTurns(state: CombatState, count = 8): string[] {
  const living = state.order.filter(id => { const unit = findUnit(state, id); return !!unit && isActive(unit); });
  if (!living.length) return [];
  const start = state.active ? Math.max(0, living.indexOf(state.active)) : 0;
  const result: string[] = [];
  for (let i = 0; result.length < count && i < count * 2; i++) result.push(living[(start + i) % living.length]);
  return result;
}
