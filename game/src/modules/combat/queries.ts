// Kampfregeln: Lesende Hilfen über den Kampfzustand (keine Änderungen).
import type { AbilityDef, AbilityId, AttributeId, Cell, StatusId } from '../contracts';
import { has } from '../campaign/ids';
import { sameCell } from './grid';
import { BUILTIN_ABILITIES, POSITIVE_STATUS } from './rules';
import type { CombatData, CombatState, CombatUnit } from './types';

export const isActive = (unit: CombatUnit): boolean => unit.state === 'active';
/** Noch auf dem Feld (aktiv oder K.O. – K.O.-Einheiten lassen sich aufrichten). */
export const isOnField = (unit: CombatUnit): boolean => unit.state === 'active' || unit.state === 'down';

export function findUnit(state: CombatState, id: string | null | undefined): CombatUnit | undefined {
  return id ? state.units.find(unit => unit.id === id) : undefined;
}

export function unitOrThrow(state: CombatState, id: string): CombatUnit {
  const unit = findUnit(state, id);
  if (!unit) throw new Error(`Unbekannte Einheit: ${id}`);
  return unit;
}

export const activeUnit = (state: CombatState): CombatUnit | undefined => findUnit(state, state.active);

export const opponents = (a: CombatUnit, b: CombatUnit): boolean => a.team !== b.team;

/** Aktive Einheit auf einem Feld (K.O.-Einheiten zählen nicht). */
export function unitAt(state: CombatState, cell: Cell): CombatUnit | undefined {
  return state.units.find(unit => isActive(unit) && sameCell(unit.cell, cell));
}

/** Irgendeine Einheit auf dem Feld (auch K.O.) – darauf darf niemand stehen bleiben. */
export function occupantAt(state: CombatState, cell: Cell): CombatUnit | undefined {
  return state.units.find(unit => isOnField(unit) && sameCell(unit.cell, cell));
}

export const hasStatus = (unit: CombatUnit, status: StatusId): boolean => (unit.status[status] ?? 0) > 0;

export const attributeOf = (unit: CombatUnit, attribute: AttributeId): number => unit.attributes[attribute] ?? 0;

export function livingOf(state: CombatState, team: CombatUnit['team']): CombatUnit[] {
  return state.units.filter(unit => unit.team === team && isActive(unit));
}

/** Fähigkeitsdefinition aus dem Inhalt oder den eingebauten Kampfaktionen. */
export function abilityDef(data: CombatData, id: AbilityId): AbilityDef | undefined {
  if (has(data.abilities, id)) return data.abilities[id];
  return has(BUILTIN_ABILITIES, id) ? BUILTIN_ABILITIES[id] : undefined;
}

/** Ist die Fähigkeit für Verbündete gedacht (Heilung, Unterstützung, positiver Zustand)? */
export function isBeneficial(def: AbilityDef): boolean {
  if (def.target === 'ally' || def.target === 'self') return true;
  if (def.target === 'enemy') return false;
  if ((def.damage ?? 0) > 0) return false;
  return (def.heal ?? 0) > 0 || (!!def.status && POSITIVE_STATUS.has(def.status.id));
}

/** Zählt die Fähigkeit als Angriff (höchstens einer je Zug)? */
export function isAttackAbility(def: AbilityDef): boolean {
  return !isBeneficial(def) && (def.damage ?? 0) > 0 && def.kind !== 'sozial';
}

/** Braucht die Fähigkeit freie Sicht? Nur Fernkampf; Hacks laufen übers Netz, Würfe gehen im Bogen. */
export function needsSight(kind: AbilityDef['kind'] | 'waffe-fernkampf'): boolean {
  return kind === 'fernkampf' || kind === 'waffe-fernkampf';
}
