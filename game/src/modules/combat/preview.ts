// Kampfregeln: Vorschau-API für die Kampfoberfläche (liest nur, ändert nichts).
// - `moveOptions`: erreichbare Felder mit AP-Kosten, Weg, Gefahrenfeldern und gegnerischer Überwachung.
// - `attackTargets` / `previewAttack`: Trefferchance je Ziel mit Aufschlüsselung, erwarteter Schaden, Volltreffer.
// - `abilityOptions` / `itemOptions` / `areaPreview`: was geht gerade, warum nicht, wen trifft eine Fläche.
// - `actionOptions`: Überblick für die Aktionsleiste der aktiven Einheit.
import type { AbilityDef, AbilityId, Cell, ItemId } from '../contracts';
import { has } from '../campaign/ids';
import { abilityBlocker, abilityTargets, canInteract, downedNeighbors, itemAbility, usableInBattle } from './actions';
import { cellsInRadius, distance } from './grid';
import { reachableCells } from './movement';
import { abilityDef, activeUnit, findUnit, isActive, isAttackAbility, isBeneficial, opponents } from './queries';
import { strikePreview } from './resolve';
import { ABILITY_REVIVE } from './rules';
import type {
  AbilityOption, ActionOptions, AreaPreview, AttackPreview, CombatData, CombatState, CombatUnit, ItemOption, ReachCell,
} from './types';

const unitFor = (state: CombatState, unitId?: string): CombatUnit | undefined => (unitId ? findUnit(state, unitId) : activeUnit(state));

/** Erreichbare Felder der Einheit (Standard: aktive Einheit, mit ihren restlichen AP). */
export function moveOptions(state: CombatState, unitId?: string): ReachCell[] {
  const unit = unitFor(state, unitId);
  if (!unit || !isActive(unit) || state.outcome) return [];
  const ap = state.active === unit.id ? unit.ap : 2;
  return reachableCells(state, unit, ap);
}

export interface AttackQuery {
  ability?: AbilityId;
  /** Gegenstand mit Kampffähigkeit (z. B. Granate). */
  item?: ItemId;
  /** Angreiferfeld für „erst bewegen, dann angreifen“. */
  from?: Cell;
}

function queryDef(data: CombatData, query: AttackQuery): AbilityDef | undefined | null {
  if (query.item) {
    if (!has(data.items, query.item)) return null;
    return itemAbility(data, data.items[query.item]) ?? null;
  }
  if (query.ability) return abilityDef(data, query.ability) ?? null;
  return undefined;
}

/** Vorschau eines Angriffs (Waffe, Fähigkeit oder Gegenstand) einer Einheit auf ein Ziel. */
export function previewAttack(data: CombatData, state: CombatState, unitId: string, targetId: string, query: AttackQuery = {}): AttackPreview | null {
  const unit = findUnit(state, unitId);
  const target = findUnit(state, targetId);
  const def = queryDef(data, query);
  if (!unit || !target || def === null) return null;
  const preview = strikePreview(state, unit, target, { ability: def, from: query.from });
  const invalid = (reason: string) => { preview.valid = false; preview.reason = preview.reason ?? reason; };
  if (state.outcome) invalid('Der Kampf ist vorbei.');
  if (state.active !== unit.id) invalid('Nicht am Zug.');
  if (!isActive(unit)) invalid('Kann nicht handeln.');
  const needAp = (def?.ap ?? 1) + (query.from && distance(query.from, unit.cell) > 0 ? 1 : 0);
  if (unit.ap < needAp) invalid(`Braucht ${needAp} AP.`);
  if (!def) {
    if (unit.attacked) invalid('In diesem Zug wurde schon angegriffen.');
    if (!isActive(target) || !opponents(unit, target)) invalid('Kein gültiges Ziel.');
  } else {
    const blocker = abilityBlocker({ ...unit, ap: Math.max(unit.ap, def.ap) }, def, !!query.item);
    if (blocker) invalid(blocker);
    const resolved = abilityTargets(state, unit, def, target.id, undefined, query.from ?? unit.cell);
    if (typeof resolved === 'string') invalid(resolved);
  }
  if (query.item && (state.bag[query.item] ?? 0) <= 0) invalid('Nicht im Gepäck.');
  return preview;
}

/** Alle möglichen Ziele einer Aktion mit Vorschau, gültige zuerst (dann höhere Chance). */
export function attackTargets(data: CombatData, state: CombatState, unitId?: string, query: AttackQuery = {}): AttackPreview[] {
  const unit = unitFor(state, unitId);
  if (!unit) return [];
  const def = queryDef(data, query);
  if (def === null) return [];
  const beneficial = !!def && isBeneficial(def);
  const revive = def?.id === ABILITY_REVIVE;
  const candidates = state.units.filter(other => {
    if (revive) return other.state === 'down' && !opponents(unit, other);
    if (!isActive(other)) return false;
    if (def?.target === 'self') return other.id === unit.id;
    return beneficial ? !opponents(unit, other) : opponents(unit, other);
  });
  return candidates
    .map(target => previewAttack(data, state, unit.id, target.id, query))
    .filter((preview): preview is AttackPreview => !!preview)
    .sort((a, b) => Number(b.valid) - Number(a.valid) || b.chance * Math.max(1, b.damage) - a.chance * Math.max(1, a.damage) || (a.target < b.target ? -1 : 1));
}

/** Fähigkeiten der Einheit mit Bereitschaft, Abklingzeit und verbleibenden Einsätzen. */
export function abilityOptions(data: CombatData, state: CombatState, unitId?: string): AbilityOption[] {
  const unit = unitFor(state, unitId);
  if (!unit) return [];
  const options: AbilityOption[] = [];
  for (const id of unit.abilities) {
    const ability = abilityDef(data, id);
    if (!ability) continue;
    let reason = state.active !== unit.id ? 'Nicht am Zug.' : abilityBlocker(unit, ability) ?? undefined;
    if (!reason && !hasAnyTarget(state, unit, ability)) reason = id === ABILITY_REVIVE ? 'Niemand zum Aufrichten in der Nähe.' : 'Kein Ziel in Reichweite.';
    options.push({
      ability, ready: !reason, reason, cooldown: unit.cooldowns[id] ?? 0,
      uses: ability.uses === undefined ? null : unit.uses[id] ?? ability.uses,
    });
  }
  return options;
}

function hasAnyTarget(state: CombatState, unit: CombatUnit, def: AbilityDef): boolean {
  if (def.target === 'self') return true;
  if (def.id === ABILITY_REVIVE) return downedNeighbors(state, unit).length > 0;
  if (def.target === 'enemy' || def.target === 'ally') {
    return state.units.some(other => typeof abilityTargets(state, unit, def, other.id) !== 'string');
  }
  for (const other of state.units) {
    if (!isActive(other)) continue;
    for (const cell of cellsInRadius(other.cell, def.radius ?? (def.target === 'area' ? 1 : 0))) {
      if (distance(unit.cell, cell) <= def.range && typeof abilityTargets(state, unit, def, undefined, cell) !== 'string') return true;
    }
  }
  return false;
}

/** Kampfgegenstände der Party (Gepäck) mit Bereitschaft. */
export function itemOptions(data: CombatData, state: CombatState, unitId?: string): ItemOption[] {
  const unit = unitFor(state, unitId);
  if (!unit) return [];
  const options: ItemOption[] = [];
  for (const [id, qty] of Object.entries(state.bag)) {
    if (qty <= 0 || !has(data.items, id)) continue;
    const item = data.items[id];
    if (!usableInBattle(data, item)) continue;
    const ability = itemAbility(data, item);
    let reason: string | undefined;
    if (state.active !== unit.id) reason = 'Nicht am Zug.';
    else if (unit.team !== 'party') reason = 'Nur die Party hat Gegenstände dabei.';
    else if (ability) reason = abilityBlocker(unit, ability, true) ?? (hasAnyTarget(state, unit, ability) ? undefined : 'Kein Ziel in Reichweite.');
    else if (unit.ap < 1) reason = 'Keine Aktionspunkte mehr.';
    else if (!state.units.some(o => isActive(o) && !opponents(unit, o) && distance(o.cell, unit.cell) <= 1 && o.hp < o.maxHp)) reason = 'Niemand verletzt in der Nähe.';
    options.push({ item, qty, ability, ready: !reason, reason });
  }
  return options.sort((a, b) => a.item.name.localeCompare(b.item.name, 'de'));
}

/** Wirkungsbereich und betroffene Einheiten einer Flächenfähigkeit (oder eines Gegenstands) auf ein Feld. */
export function areaPreview(data: CombatData, state: CombatState, unitId: string, query: AttackQuery, cell: Cell): AreaPreview {
  const unit = findUnit(state, unitId);
  const def = queryDef(data, query);
  if (!unit || !def) return { valid: false, reason: 'Unbekannte Fähigkeit.', cells: [], affected: [] };
  const radius = def.radius ?? (def.target === 'area' ? 1 : 0);
  const cells = cellsInRadius(cell, radius);
  const resolved = abilityTargets(state, unit, def, undefined, cell);
  if (typeof resolved === 'string') return { valid: false, reason: resolved, cells, affected: [] };
  const affected = resolved.units.map(target => strikePreview(state, unit, target, { ability: def, area: true }));
  const blocker = state.active !== unit.id ? 'Nicht am Zug.' : abilityBlocker(unit, def, !!query.item);
  return { valid: !blocker, reason: blocker ?? undefined, cells: resolved.cells, affected };
}

/** Überblick über die Aktionen der aktiven Einheit (null, wenn niemand handeln kann). */
export function actionOptions(data: CombatData, state: CombatState): ActionOptions | null {
  const unit = activeUnit(state);
  if (!unit || state.outcome || !isActive(unit)) return null;
  const hasAp = unit.ap >= 1;
  const attack = hasAp && !unit.attacked && attackTargets(data, state, unit.id).some(p => p.valid);
  return {
    unit: unit.id,
    ap: unit.ap,
    move: hasAp && moveOptions(state).length > 0,
    attack,
    overwatch: hasAp,
    cover: hasAp,
    interact: hasAp && canInteract(state, unit),
    flee: unit.team === 'party' && state.canFlee && !unit.vip,
    swap: !unit.swapped && unit.weapons.length > 1,
    abilities: abilityOptions(data, state, unit.id),
    items: unit.team === 'party' ? itemOptions(data, state, unit.id) : [],
  };
}

/** Zählt die Aktion als Angriff? (Für die Anzeige „ein Angriff je Zug“.) */
export const countsAsAttack = (def: AbilityDef | undefined): boolean => !def || isAttackAbility(def);
