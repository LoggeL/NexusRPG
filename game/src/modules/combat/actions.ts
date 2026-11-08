// Kampfregeln: Aktionen der aktiven Einheit (2 AP je Zug).
// Bewegen 1 AP je `move` Felder · Angriff 1 AP (höchstens ein Angriff je Zug) · Fähigkeit `ap` · Gegenstand ·
// Überwachung 1 AP (beendet den Zug, schießt mit −10 auf die erste gegnerische Bewegung in Reichweite) ·
// Deckung suchen 1 AP („Geschützt“, entfernt „Markiert“) · Terminal hacken 1 AP · Waffe wechseln 0 AP ·
// Flucht (Party, wenn erlaubt) · Zug beenden.
// `act` arbeitet auf einer Kopie: Bei einem Fehler bleibt der übergebene Zustand gültig und unverändert.
import type { AbilityDef, Cell, ItemDef } from '../contracts';
import { clamp, has } from '../campaign/ids';
import {
  applyHazard, applyStatus, changeMorale, checkOutcome, dealDamage, emit, faceNearestOpponent, finish, heal,
  leaveField, removeStatus, rollPercent, type Ctx,
} from './effects';
import { cellsInRadius, distance, facingToward, isHazard, lineOfSight, sameCell } from './grid';
import { canEndOn, findPath } from './movement';
import {
  abilityDef, activeUnit, findUnit, isActive, isAttackAbility, isBeneficial, isOnField, opponents,
} from './queries';
import { healOf, moraleDamage, rollsToHit, strikePreview } from './resolve';
import { ABILITY_REVIVE, MORALE_CRIT } from './rules';
import { finishTurn } from './turns';
import type { ActResult, CombatAction, CombatData, CombatState, CombatUnit } from './types';

const clone = (state: CombatState): CombatState => JSON.parse(JSON.stringify(state)) as CombatState;

/** Führt eine Aktion der aktiven Einheit aus. */
export function act(data: CombatData, state: CombatState, action: CombatAction): ActResult {
  if (state.outcome) return { state, events: [], error: 'Der Kampf ist vorbei.' };
  if (!activeUnit(state)) return { state, events: [], error: 'Niemand ist am Zug.' };
  const ctx: Ctx = { data, s: clone(state), events: [] };
  const unit = activeUnit(ctx.s)!;
  const error = perform(ctx, unit, action);
  if (error) return { state, events: [], error };
  if (!ctx.s.outcome && !checkOutcome(ctx) && ctx.s.active === unit.id && (unit.ap <= 0 || !isActive(unit))) finishTurn(ctx);
  return { state: ctx.s, events: ctx.events, error: null };
}

/** Prüft eine Aktion, ohne sie auszuführen (null = erlaubt). */
export function validateAction(data: CombatData, state: CombatState, action: CombatAction): string | null {
  return act(data, state, action).error;
}

function perform(ctx: Ctx, unit: CombatUnit, action: CombatAction): string | null {
  switch (action.type) {
    case 'move': return move(ctx, unit, action.to);
    case 'attack': return attack(ctx, unit, action.target);
    case 'ability': return useAbility(ctx, unit, action.ability, action.target, action.cell);
    case 'item': return useItem(ctx, unit, action.item, action.target, action.cell);
    case 'overwatch': return overwatch(ctx, unit);
    case 'cover': return takeCover(ctx, unit);
    case 'interact': return interact(ctx, unit);
    case 'weapon': return swapWeapon(ctx, unit, action.index);
    case 'flee': return flee(ctx, unit);
    case 'end': finishTurn(ctx); return null;
    default: return 'Unbekannte Aktion.';
  }
}

// ---------------------------------------------------------------------------
// Bewegung und Überwachungsfeuer

function move(ctx: Ctx, unit: CombatUnit, to: Cell): string | null {
  if (unit.ap < 1) return 'Keine Aktionspunkte mehr.';
  if (!Array.isArray(to) || sameCell(to, unit.cell)) return 'Ungültiges Ziel.';
  if (!canEndOn(ctx.s, unit, to)) return 'Dort kann niemand stehen.';
  const route = findPath(ctx.s, unit, to, unit.ap);
  if (!route) return 'Zu weit entfernt.';
  unit.ap -= route.ap;
  walk(ctx, unit, route.path);
  return null;
}

/** Läuft einen Weg Feld für Feld ab; Gefahrenfelder und Überwachungsfeuer unterbrechen die Animation. */
export function walk(ctx: Ctx, unit: CombatUnit, path: readonly Cell[]): void {
  let segment: Cell[] = [];
  const flush = () => { if (segment.length) emit(ctx, { type: 'move', unit: unit.id, path: segment }); segment = []; };
  for (const step of path) {
    unit.facing = facingToward(unit.cell, step, unit.facing);
    unit.cell = [step[0], step[1]];
    segment.push(unit.cell);
    const watchers = ctx.s.units.filter(w => isActive(w) && w.overwatch && opponents(w, unit) && canReact(ctx, w, unit));
    if (watchers.length || isHazard(ctx.s.layout, step)) {
      flush();
      applyHazard(ctx, unit);
      for (const watcher of watchers) {
        if (!isActive(unit)) break;
        watcher.overwatch = false;
        emit(ctx, { type: 'bark', unit: watcher.id, text: 'Überwachungsfeuer!' });
        strike(ctx, watcher, unit, undefined, true);
      }
    }
    if (!isActive(unit)) break;
  }
  flush();
}

function canReact(ctx: Ctx, watcher: CombatUnit, mover: CombatUnit): boolean {
  if (watcher.status.gehackt || watcher.status.betaeubt) return false;
  const dist = distance(watcher.cell, mover.cell);
  if (dist < 1 || dist > watcher.weapon.range) return false;
  return watcher.weapon.kind !== 'fernkampf' || lineOfSight(ctx.s.layout, watcher.cell, mover.cell);
}

function overwatch(ctx: Ctx, unit: CombatUnit): string | null {
  if (unit.ap < 1) return 'Keine Aktionspunkte mehr.';
  unit.overwatch = true;
  emit(ctx, { type: 'overwatch', unit: unit.id });
  finishTurn(ctx);
  return null;
}

function takeCover(ctx: Ctx, unit: CombatUnit): string | null {
  if (unit.ap < 1) return 'Keine Aktionspunkte mehr.';
  unit.ap -= 1;
  removeStatus(ctx, unit, 'markiert');
  emit(ctx, { type: 'cover', unit: unit.id });
  applyStatus(ctx, unit, 'geschuetzt', 1);
  faceNearestOpponent(ctx, unit);
  return null;
}

// ---------------------------------------------------------------------------
// Angriff

function attack(ctx: Ctx, unit: CombatUnit, targetId: string): string | null {
  if (unit.ap < 1) return 'Keine Aktionspunkte mehr.';
  if (unit.attacked) return 'In diesem Zug wurde schon angegriffen.';
  const target = findUnit(ctx.s, targetId);
  if (!target || !isActive(target) || !opponents(unit, target)) return 'Kein gültiges Ziel.';
  const preview = strikePreview(ctx.s, unit, target);
  if (!preview.valid) return preview.reason ?? 'Kein gültiges Ziel.';
  unit.ap -= 1;
  unit.attacked = true;
  strike(ctx, unit, target, undefined, false);
  return null;
}

/**
 * Ein Schlag (Waffe oder Fähigkeit) gegen ein Ziel: Wurf, Schaden, Volltreffer-Moral, Zustand, Gesprächswirkung.
 * `area` = Flächenwirkung ohne Trefferwurf.
 */
function strike(ctx: Ctx, attacker: CombatUnit, target: CombatUnit, def: AbilityDef | undefined, reaction: boolean, area = false): void {
  if (!isActive(target)) return;
  const preview = strikePreview(ctx.s, attacker, target, { ability: def, reaction, area });
  attacker.facing = facingToward(attacker.cell, target.cell, attacker.facing);
  if (attacker.team === 'party' && ctx.s.surprise && !reaction) ctx.s.surprise = false;

  if (def?.kind === 'sozial') {
    emit(ctx, { type: 'attack', unit: attacker.id, target: target.id, hit: true, chance: 100, damage: 0, ability: def.id });
    changeMorale(ctx, target, -moraleDamage(attacker, def));
    if (def.status && isActive(target)) tryStatus(ctx, target, def);
    return;
  }
  const hit = preview.autoHit || !rollsToHit(def) || rollPercent(ctx, preview.chance);
  emit(ctx, {
    type: 'attack', unit: attacker.id, target: target.id, hit, chance: preview.chance, damage: hit ? Math.min(preview.damage, target.hp) : 0,
    ability: def?.id, crit: hit && preview.crit && preview.damage > 0 ? true : undefined, reaction: reaction || undefined,
  });
  if (!hit) return;
  if (preview.damage > 0) dealDamage(ctx, target, preview.damage);
  if (preview.crit && preview.damage > 0 && isActive(target)) changeMorale(ctx, target, -MORALE_CRIT);
  if (def?.status && isActive(target)) tryStatus(ctx, target, def);
}

function tryStatus(ctx: Ctx, target: CombatUnit, def: AbilityDef): void {
  const status = def.status!;
  const chance = clamp(status.chance ?? 1, 0, 1) * 100;
  if (rollPercent(ctx, chance)) applyStatus(ctx, target, status.id, status.turns);
  else emit(ctx, { type: 'resist', unit: target.id, status: status.id });
}

// ---------------------------------------------------------------------------
// Fähigkeiten und Gegenstände

/** Warum die Einheit die Fähigkeit jetzt nicht einsetzen kann (null = bereit). */
export function abilityBlocker(unit: CombatUnit, def: AbilityDef, viaItem = false): string | null {
  if (!viaItem && !unit.abilities.includes(def.id)) return 'Diese Fähigkeit beherrscht die Einheit nicht.';
  if (unit.ap < def.ap) return `Braucht ${def.ap} AP.`;
  if (!viaItem && (unit.cooldowns[def.id] ?? 0) > 0) return `Lädt noch ${unit.cooldowns[def.id]} Zug(e).`;
  if (!viaItem && def.uses !== undefined && (unit.uses[def.id] ?? def.uses) <= 0) return 'Keine Einsätze mehr.';
  if (isAttackAbility(def) && unit.attacked) return 'In diesem Zug wurde schon angegriffen.';
  return null;
}

/** Betroffene Einheiten einer Fähigkeit auf Ziel/Feld oder Fehlertext. */
export function abilityTargets(state: CombatState, unit: CombatUnit, def: AbilityDef, targetId?: string, cell?: Cell, from: Cell = unit.cell):
  { units: CombatUnit[]; center: Cell; cells: Cell[] } | string {
  const beneficial = isBeneficial(def);
  if (def.target === 'self') return { units: [unit], center: from, cells: [from] };
  if (def.target === 'enemy' || def.target === 'ally') {
    const target = findUnit(state, targetId ?? (def.target === 'ally' && def.range === 0 ? unit.id : undefined));
    if (!target) return 'Kein Ziel gewählt.';
    const revive = def.id === ABILITY_REVIVE;
    if (def.target === 'enemy' && (!isActive(target) || !opponents(unit, target))) return 'Kein gültiges Ziel.';
    if (def.target === 'ally') {
      if (opponents(unit, target)) return 'Nur für Verbündete.';
      if (revive ? target.state !== 'down' : !isActive(target)) return revive ? 'Steht noch.' : 'Kein gültiges Ziel.';
    }
    const preview = strikePreview(state, unit, target, { ability: def, from });
    if (!preview.valid) return preview.reason ?? 'Kein gültiges Ziel.';
    return { units: [target], center: target.cell, cells: [target.cell] };
  }
  const center = cell ?? findUnit(state, targetId)?.cell;
  if (!center) return 'Kein Zielfeld gewählt.';
  if (distance(from, center) > def.range) return 'Außer Reichweite.';
  const radius = def.radius ?? (def.target === 'area' ? 1 : 0);
  const cells = cellsInRadius(center, radius);
  const units = state.units.filter(other =>
    isActive(other) && cells.some(c => sameCell(c, other.cell)) && (beneficial ? !opponents(unit, other) : opponents(unit, other)));
  if (!units.length) return 'Niemand im Wirkungsbereich.';
  return { units, center, cells };
}

function applyAbility(ctx: Ctx, unit: CombatUnit, def: AbilityDef, targets: CombatUnit[], center: Cell, targetId?: string): void {
  emit(ctx, { type: 'ability', unit: unit.id, ability: def.id, target: targetId, cell: def.target === 'cell' || def.target === 'area' ? center : undefined });
  if (!sameCell(center, unit.cell)) unit.facing = facingToward(unit.cell, center, unit.facing);
  const area = def.target === 'cell' || def.target === 'area';
  for (const target of targets) {
    if (def.id === ABILITY_REVIVE) {
      target.state = 'active';
      target.hp = healOf(unit, target, def);
      emit(ctx, { type: 'revive', unit: unit.id, target: target.id, hp: target.hp });
      continue;
    }
    if (isBeneficial(def)) {
      const amount = healOf(unit, target, def);
      if (amount > 0) heal(ctx, unit, target, amount);
      if (def.status) tryStatus(ctx, target, def);
      continue;
    }
    strike(ctx, unit, target, def, false, area);
  }
}

function useAbility(ctx: Ctx, unit: CombatUnit, abilityId: string, targetId?: string, cell?: Cell): string | null {
  const def = abilityDef(ctx.data, abilityId);
  if (!def) return `Unbekannte Fähigkeit: ${abilityId}`;
  const blocker = abilityBlocker(unit, def);
  if (blocker) return blocker;
  const resolved = abilityTargets(ctx.s, unit, def, targetId, cell);
  if (typeof resolved === 'string') return resolved;
  unit.ap -= def.ap;
  if (isAttackAbility(def)) unit.attacked = true;
  if (def.cooldown && def.cooldown > 0) { unit.cooldowns[def.id] = def.cooldown; unit.usedThisTurn.push(def.id); }
  if (def.uses !== undefined) unit.uses[def.id] = (unit.uses[def.id] ?? def.uses) - 1;
  applyAbility(ctx, unit, def, resolved.units, resolved.center, targetId);
  return null;
}

/** Kampffähigkeit eines Gegenstands oder null (Heilgegenstand / nicht im Kampf nutzbar). */
export function itemAbility(data: CombatData, item: ItemDef): AbilityDef | null {
  return item.use?.battle ? abilityDef(data, item.use.battle) ?? null : null;
}

/** Im Kampf nutzbar: mit Kampffähigkeit oder als Heilung. */
export const usableInBattle = (data: CombatData, item: ItemDef): boolean =>
  !!item.use && (!!itemAbility(data, item) || (item.use.heal ?? 0) > 0);

function useItem(ctx: Ctx, unit: CombatUnit, itemId: string, targetId?: string, cell?: Cell): string | null {
  if (unit.team !== 'party') return 'Nur die Party hat Gegenstände dabei.';
  if ((ctx.s.bag[itemId] ?? 0) <= 0 || !has(ctx.data.items, itemId)) return 'Nicht im Gepäck.';
  const item = ctx.data.items[itemId];
  if (!usableInBattle(ctx.data, item)) return 'Im Kampf nicht nutzbar.';
  const def = itemAbility(ctx.data, item);
  if (def) {
    const blocker = abilityBlocker(unit, def, true);
    if (blocker) return blocker;
    const resolved = abilityTargets(ctx.s, unit, def, targetId, cell);
    if (typeof resolved === 'string') return resolved;
    consume(ctx, itemId);
    unit.ap -= def.ap;
    if (isAttackAbility(def)) unit.attacked = true;
    emit(ctx, { type: 'item', unit: unit.id, item: itemId, target: targetId });
    applyAbility(ctx, unit, def, resolved.units, resolved.center, targetId);
    return null;
  }
  if (unit.ap < 1) return 'Keine Aktionspunkte mehr.';
  const target = findUnit(ctx.s, targetId ?? unit.id);
  if (!target || !isActive(target) || opponents(unit, target)) return 'Kein gültiges Ziel.';
  if (distance(unit.cell, target.cell) > 1) return 'Nur für dich oder ein Nachbarfeld.';
  if (target.hp >= target.maxHp) return 'Schon bei vollen LP.';
  consume(ctx, itemId);
  unit.ap -= 1;
  emit(ctx, { type: 'item', unit: unit.id, item: itemId, target: target.id });
  heal(ctx, unit, target, item.use!.heal ?? 0);
  return null;
}

function consume(ctx: Ctx, item: string): void {
  ctx.s.bag[item] = (ctx.s.bag[item] ?? 0) - 1;
  if (ctx.s.bag[item] <= 0) delete ctx.s.bag[item];
  ctx.s.used[item] = (ctx.s.used[item] ?? 0) + 1;
}

// ---------------------------------------------------------------------------
// Missionsziel, Waffe, Flucht

/** Kann die Einheit das Terminal (Missionsziel `hack`) bedienen? */
export function canInteract(state: CombatState, unit: CombatUnit): boolean {
  return state.objective.kind === 'hack' && unit.team === 'party' && !unit.vip && distance(unit.cell, state.objective.cell) <= 1;
}

function interact(ctx: Ctx, unit: CombatUnit): string | null {
  const objective = ctx.s.objective;
  if (objective.kind !== 'hack') return 'Hier gibt es nichts zu bedienen.';
  if (!canInteract(ctx.s, unit)) return 'Zu weit vom Terminal entfernt.';
  if (unit.ap < 1) return 'Keine Aktionspunkte mehr.';
  unit.ap -= 1;
  ctx.s.progress += 1;
  unit.facing = facingToward(unit.cell, objective.cell, unit.facing);
  emit(ctx, { type: 'objective', unit: unit.id, progress: ctx.s.progress, needed: objective.ap });
  return null;
}

function swapWeapon(ctx: Ctx, unit: CombatUnit, index: number): string | null {
  if (unit.swapped) return 'Die Waffe wurde in diesem Zug schon gewechselt.';
  if (!Number.isInteger(index) || index < 0 || index >= unit.weapons.length || index === unit.weaponIndex) return 'Ungültige Waffe.';
  unit.weaponIndex = index;
  unit.weapon = unit.weapons[index];
  unit.swapped = true;
  emit(ctx, { type: 'weapon', unit: unit.id, weapon: unit.weapon.kind, index });
  return null;
}

function flee(ctx: Ctx, unit: CombatUnit): string | null {
  if (unit.team === 'party') {
    if (!ctx.s.canFlee) return 'Aus diesem Kampf gibt es keine Flucht.';
    if (unit.vip) return 'Die Schutzperson kann nicht allein fliehen.';
    finish(ctx, 'fled');
    return null;
  }
  if (unit.morale === undefined) return 'Diese Einheit flieht nicht.';
  leaveField(ctx, unit, 'fled');
  return null;
}

/** Ist der Einheit eine K.O.-Einheit benachbart (für Aufrichten)? */
export const downedNeighbors = (state: CombatState, unit: CombatUnit): CombatUnit[] =>
  state.units.filter(other => other.state === 'down' && !opponents(unit, other) && isOnField(other) && distance(other.cell, unit.cell) <= 1);
