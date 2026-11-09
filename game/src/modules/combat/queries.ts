// Kampfregeln: Lesende Hilfen über den Kampfzustand (keine Änderungen).
import type { AbilityDef, AbilityId, AttributeId, Cell, EnemyRule, StatusId, Team } from '../contracts';
import { has } from '../campaign/ids';
import { sameCell } from './grid';
import { builtinAbility, CHIPPED_HIT_BONUS, POSITIVE_STATUS } from './rules';
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

/** Eigentliche Seite (auch während „gesteuert“ für die Gegenseite gekämpft wird). */
export const homeTeam = (unit: CombatUnit): Team => unit.home ?? unit.team;

/** Gilt eine Bossregel gerade (Phase, vor Phase, erst nach dem Ausfall bestimmter Gegner)? */
export function ruleOpen(state: CombatState, unit: CombatUnit, rule: EnemyRule): boolean {
  if (rule.phase !== undefined && unit.phase < rule.phase) return false;
  if (rule.untilPhase !== undefined && unit.phase >= rule.untilPhase) return false;
  if (rule.afterDown?.length && state.units.some(other =>
    isActive(other) && other.source.kind === 'enemy' && rule.afterDown!.includes(other.source.enemy))) return false;
  return true;
}

/** Regeln einer Art mit Index (für Laufzeitschlüssel `<Einheit>#<Index>`). */
export function rulesOf<K extends EnemyRule['kind']>(unit: CombatUnit, kind: K): { rule: Extract<EnemyRule, { kind: K }>; key: string }[] {
  const out: { rule: Extract<EnemyRule, { kind: K }>; key: string }[] = [];
  (unit.rules ?? []).forEach((rule, index) => {
    if (rule.kind === kind) out.push({ rule: rule as Extract<EnemyRule, { kind: K }>, key: `${unit.id}#${index}` });
  });
  return out;
}

/** Unverwundbar, solange einer der schützenden Gegner kämpft (z. B. Nexus-Kern hinter den Knoten). */
export function isInvulnerable(state: CombatState, unit: CombatUnit): boolean {
  return rulesOf(unit, 'invulnerable').some(({ rule }) => ruleOpen(state, unit, rule) && state.units.some(other =>
    other.id !== unit.id && isActive(other) && other.source.kind === 'enemy' && rule.while.includes(other.source.enemy)));
}

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
  return builtinAbility(id);
}

/** Gechippt (EnemyRule `chipped`): befreien statt besiegen. */
export const isChipped = (unit: CombatUnit): boolean => !!unit.rules?.some(rule => rule.kind === 'chipped');

/** Trefferbonus eines Gechippten, solange einer seiner Nexus-Knoten (`boostWhile`) kämpft. */
export function chipBoost(state: CombatState, unit: CombatUnit): number {
  let bonus = 0;
  for (const { rule } of rulesOf(unit, 'chipped')) {
    if (!rule.boostWhile?.length) continue;
    const node = state.units.some(other => other.id !== unit.id && isActive(other) && other.source.kind === 'enemy' && rule.boostWhile!.includes(other.source.enemy));
    if (node) bonus = Math.max(bonus, rule.hit ?? CHIPPED_HIT_BONUS);
  }
  return bonus;
}

/** Positive Zustände einer Einheit (für „Ich teile nicht gerne“). */
export const positiveStatuses = (unit: CombatUnit): StatusId[] =>
  (Object.keys(unit.status) as StatusId[]).filter(status => POSITIVE_STATUS.has(status) && (unit.status[status] ?? 0) > 0);

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
