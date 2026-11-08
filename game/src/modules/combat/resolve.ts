// Kampfregeln: Trefferchance und Schaden (design.md §3.7, world.md §8.1).
//
// Trefferchance = 75 + 5 × (Reflexe Angreifer − Reflexe Ziel) − Deckung (halb 20, voll 40) + Flanke 15
//   + Markiert 20 − Geschützt 20 + Waffe/Fähigkeit/Kampfbonus − Überwachungsfeuer 10 (+ Überrumpelt, Schwierigkeit),
//   begrenzt auf 5..95.
// Schaden = Waffenschaden + Attribut (Nahkampf Körper, Fernkampf Reflexe, Smart/Hack Technik) + Fähigkeit + Bonus
//   − Panzerung, mindestens 1. Volltreffer ×1,5 bei Flanke ohne Deckung oder auf „Markiert“ (kein Zufallskrit).
// Fähigkeiten nutzen den Waffenschaden, wenn ihre Art zur Waffe in der Hand passt (nahkampf ↔ Nahkampfwaffe,
// fernkampf ↔ Fernwaffe, hack ↔ Smart-Waffe); sonst zählt nur ihr eigener Schaden plus Attribut.
import type { AbilityDef, AttributeId, Cell } from '../contracts';
import { ATTRIBUTE_LABELS, clamp } from '../campaign/ids';
import { coverAgainst, distance, lineOfSight, relationTo } from './grid';
import { attributeOf, hasStatus, isBeneficial, needsSight } from './queries';
import {
  ABILITY_REVIVE, ABILITY_WEAPON, COVER_FULL, CRIT_MULTIPLIER, EASY_HIT_BONUS, FLANK_BONUS, HIT_BASE, HIT_MAX,
  HIT_MIN, HIT_PER_REFLEX, MARKED_BONUS, MIN_DAMAGE, OVERWATCH_PENALTY, PROTECTED_PENALTY, REVIVE_FRACTION,
  SOCIAL_ATTRIBUTE_FACTOR, SURPRISE_BONUS, WEAPON_ATTRIBUTE,
} from './rules';
import type { AttackPreview, CombatState, CombatUnit, HitPart } from './types';

export interface StrikeOptions {
  /** Fähigkeit statt Waffenangriff. */
  ability?: AbilityDef;
  /** Abweichendes Feld des Angreifers (Vorschau „erst bewegen, dann angreifen“). */
  from?: Cell;
  /** Überwachungsfeuer (−10). */
  reaction?: boolean;
  /** Fläche: kein Wurf, keine Reichweitenprüfung zum einzelnen Ziel. */
  area?: boolean;
}

/** Nutzt die Fähigkeit den Schaden der Waffe in der Hand? */
export function usesWeapon(unit: CombatUnit, def: AbilityDef | undefined): boolean {
  if (!def) return true;
  const kind = ABILITY_WEAPON[def.kind];
  return !!kind && kind === unit.weapon.kind;
}

/** Würfelt die Aktion auf Treffer? Waffenangriffe und schädigende Einzelziel-Fähigkeiten. */
export function rollsToHit(def: AbilityDef | undefined): boolean {
  if (!def) return true;
  return def.target === 'enemy' && (def.damage ?? 0) > 0 && def.kind !== 'sozial';
}

/** Reichweite einer Aktion. */
export const rangeOf = (unit: CombatUnit, def: AbilityDef | undefined): number => (def ? def.range : unit.weapon.range);

/** Braucht die Aktion freie Sicht? */
export function strikeNeedsSight(unit: CombatUnit, def: AbilityDef | undefined): boolean {
  if (!def) return needsSight(unit.weapon.kind === 'fernkampf' ? 'waffe-fernkampf' : 'nahkampf');
  if (def.target === 'cell' || def.target === 'area' || def.target === 'self') return false;
  return needsSight(def.kind);
}

/** Attribut, das Schaden bzw. Wirkung der Aktion erhöht. */
export function strikeAttribute(unit: CombatUnit, def: AbilityDef | undefined): AttributeId | null {
  if (!def) return WEAPON_ATTRIBUTE[unit.weapon.kind];
  if (def.attribute) return def.attribute;
  return usesWeapon(unit, def) ? WEAPON_ATTRIBUTE[unit.weapon.kind] : null;
}

/** Trefferchance mit Aufschlüsselung. */
export function hitChance(state: CombatState, attacker: CombatUnit, target: CombatUnit, options: StrikeOptions = {}):
  { chance: number; parts: HitPart[]; cover: number; flank: boolean } {
  const from = options.from ?? attacker.cell;
  const def = options.ability;
  const parts: HitPart[] = [{ label: 'Grundwert', value: HIT_BASE }];
  const add = (label: string, value: number) => { if (value) parts.push({ label, value }); };
  add('Reflexe', HIT_PER_REFLEX * (attributeOf(attacker, 'reflexe') - attributeOf(target, 'reflexe')));
  const cover = coverAgainst(state.layout, target.cell, from).value;
  add(cover >= COVER_FULL ? 'Volle Deckung' : 'Halbe Deckung', -cover);
  const flank = relationTo(target, from) === 'back';
  add('Flanke', flank ? FLANK_BONUS : 0);
  add('Markiert', hasStatus(target, 'markiert') ? MARKED_BONUS : 0);
  add('Geschützt', hasStatus(target, 'geschuetzt') ? -PROTECTED_PENALTY : 0);
  add('Waffe', usesWeapon(attacker, def) ? attacker.weapon.hit ?? 0 : 0);
  add('Fähigkeit', def?.hit ?? 0);
  add('Kampfbonus', attacker.bonus.hit);
  add('Überwachungsfeuer', options.reaction ? -OVERWATCH_PENALTY : 0);
  add('Überrumpelt', state.surprise && attacker.team === 'party' ? SURPRISE_BONUS : 0);
  add('Leicht', state.difficulty === 'leicht' && attacker.team === 'party' ? EASY_HIT_BONUS : 0);
  const sum = parts.reduce((total, part) => total + part.value, 0);
  return { chance: clamp(sum, HIT_MIN, HIT_MAX), parts, cover, flank };
}

/** Schaden bei Treffer mit Aufschlüsselung. */
export function damageOf(attacker: CombatUnit, target: CombatUnit, options: StrikeOptions & { crit: boolean }):
  { damage: number; parts: HitPart[] } {
  const def = options.ability;
  const parts: HitPart[] = [];
  const add = (label: string, value: number) => { if (value) parts.push({ label, value }); };
  if (usesWeapon(attacker, def)) add('Waffe', attacker.weapon.damage);
  add(def?.name ?? 'Fähigkeit', def?.damage ?? 0);
  const attribute = strikeAttribute(attacker, def);
  if (attribute) add(ATTRIBUTE_LABELS[attribute], attributeOf(attacker, attribute));
  add('Kampfbonus', attacker.bonus.damage);
  add('Panzerung', -target.armor);
  let damage = Math.max(MIN_DAMAGE, parts.reduce((total, part) => total + part.value, 0));
  if (options.crit) {
    const boosted = Math.round(damage * CRIT_MULTIPLIER);
    parts.push({ label: 'Volltreffer', value: boosted - damage });
    damage = boosted;
  }
  return { damage, parts };
}

/** Moralverlust einer Gesprächsaktion. */
export function moraleDamage(attacker: CombatUnit, def: AbilityDef): number {
  const attribute = def.attribute ? attributeOf(attacker, def.attribute) * SOCIAL_ATTRIBUTE_FACTOR : 0;
  return Math.max(0, (def.damage ?? 0) + attribute);
}

/** Heilung einer Fähigkeit (Heilwert + Attribut). Aufrichten nutzt den Mindestanteil der LP. */
export function healOf(attacker: CombatUnit, target: CombatUnit, def: AbilityDef): number {
  if (def.id === ABILITY_REVIVE) return Math.max(1, Math.floor(target.maxHp * REVIVE_FRACTION));
  if (!def.heal) return 0;
  return def.heal + (def.attribute ? attributeOf(attacker, def.attribute) : 0);
}

/**
 * Vollständige Vorschau eines Schlags gegen ein Ziel: Reichweite, Sicht, Chance, Schaden, Zustand.
 * Prüft keine AP, Abklingzeiten oder Zugregeln – das ergänzt `previewAttack` in preview.ts.
 */
export function strikePreview(state: CombatState, attacker: CombatUnit, target: CombatUnit, options: StrikeOptions = {}): AttackPreview {
  const from = options.from ?? attacker.cell;
  const def = options.ability;
  const range = rangeOf(attacker, def);
  const dist = distance(from, target.cell);
  const inRange = options.area ? true : dist >= (def?.target === 'self' || def?.target === 'ally' ? 0 : 1) && dist <= range;
  const sight = options.area || !strikeNeedsSight(attacker, def) || lineOfSight(state.layout, from, target.cell);
  const base: AttackPreview = {
    attacker: attacker.id, target: target.id, ability: def?.id, from, valid: inRange && sight,
    reason: !inRange ? 'Außer Reichweite.' : !sight ? 'Keine freie Sicht.' : undefined,
    inRange, sight, autoHit: true, chance: 100, parts: [], damage: 0, damageParts: [], crit: false, expected: 0,
    lethal: false, cover: 0, flank: false,
  };
  if (def?.status) base.status = { id: def.status.id, turns: def.status.turns, chance: Math.round(100 * clamp(def.status.chance ?? 1, 0, 1)) };

  if (def && isBeneficial(def)) {
    base.heal = healOf(attacker, target, def);
    return base;
  }
  if (def?.kind === 'sozial') {
    base.morale = moraleDamage(attacker, def);
    if (target.morale === undefined) { base.valid = false; base.reason = 'Lässt sich nicht beeindrucken.'; }
    return base;
  }
  const hit = hitChance(state, attacker, target, options);
  base.cover = hit.cover;
  base.flank = hit.flank;
  const rolls = !options.area && rollsToHit(def);
  if (rolls) {
    base.autoHit = false;
    base.chance = hit.chance;
    base.parts = hit.parts;
  }
  // Fähigkeiten ohne eigenen Schadenswert wirken nur über ihren Zustand (z. B. Störsignal).
  if (!def || (def.damage ?? 0) > 0) {
    const crit = (hit.flank && hit.cover === 0) || hasStatus(target, 'markiert');
    const dmg = damageOf(attacker, target, { ...options, crit });
    base.crit = crit;
    base.damage = dmg.damage;
    base.damageParts = dmg.parts;
    base.expected = Math.round((dmg.damage * base.chance) / 10) / 10;
    base.lethal = dmg.damage >= target.hp;
  }
  return base;
}
