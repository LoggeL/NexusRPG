// Perks: Voraussetzungen (Attributwert, Mindeststufe, Perkpunkte) und gesammelte passive Wirkungen aus Perks,
// Cyberware und getragener Kleidung (Händlerrabatt, Ankauf, Geschenk- und Gesprächsbonus, Merkmale, Kampfboni,
// freigeschaltete Kampffähigkeiten). design.md §3.1, world.md §2.5.
import type { AttributeId, GameContent, PerkDef, PerkId, PlayerState } from '../contracts';
import { ATTRIBUTE_IDS, ATTRIBUTE_LABELS, LEVEL_MAX, has } from '../campaign/ids';
import { effectiveAttribute, equippedItems, installedParts, wornItems } from './attributes';
import { asPerk, type CharacterCombatBonus, type CharacterPerkDef, type PassiveEffects, type UnlockedAbility } from './types';

export const DEFAULT_PERK_COST = 1;

export const perkCost = (def: PerkDef): number => Math.max(0, Math.floor(def.cost ?? DEFAULT_PERK_COST));
/** Mindeststufe (Standard 1). */
export const perkLevel = (def: PerkDef): number => Math.min(LEVEL_MAX, Math.max(1, Math.floor(asPerk(def).level ?? 1)));

export interface PerkStatus {
  perk: CharacterPerkDef;
  learned: boolean;
  /** Jetzt lernbar (alle Voraussetzungen erfüllt, noch nicht gelernt). */
  available: boolean;
  /** Voraussetzungen ohne Perkpunkte erfüllt (Anzeige „bald verfügbar“ vs. „gesperrt“). */
  qualified: boolean;
  cost: number;
  level: number;
  /** Fehlende Punkte im Attribut bzw. fehlende Stufen/Perkpunkte (0 = erfüllt). */
  missing: { attribute: number; level: number; points: number };
  /** Grund, warum der Perk nicht lernbar ist (null, wenn lernbar). */
  reason: string | null;
  /** Kurze Voraussetzung für die Anzeige, z. B. „Technik 6 · Stufe 5“. */
  requirement: string;
}

export function perkRequirementText(def: PerkDef): string {
  const level = perkLevel(def);
  const attr = `${ATTRIBUTE_LABELS[def.attribute] ?? def.attribute} ${def.min}`;
  return level > 1 ? `${attr} · Stufe ${level}` : attr;
}

/** Status eines Perks für die Spielfigur; unbekannte Perks liefern null. */
export function perkStatus(content: GameContent, player: Readonly<PlayerState>, id: PerkId): PerkStatus | null {
  if (!has(content.perks, id)) return null;
  const perk = asPerk(content.perks[id]);
  const learned = player.perks.includes(id);
  const cost = perkCost(perk);
  const level = perkLevel(perk);
  const missing = {
    attribute: Math.max(0, perk.min - effectiveAttribute(content, player, perk.attribute)),
    level: Math.max(0, level - player.level),
    points: Math.max(0, cost - player.perkPoints),
  };
  const qualified = missing.attribute === 0 && missing.level === 0;
  let reason: string | null = null;
  if (learned) reason = `${perk.name} ist bereits gelernt.`;
  else if (missing.attribute > 0) reason = `Benötigt ${ATTRIBUTE_LABELS[perk.attribute] ?? perk.attribute} ${perk.min}.`;
  else if (missing.level > 0) reason = `Benötigt Stufe ${level}.`;
  else if (missing.points > 0) reason = 'Nicht genug Perkpunkte.';
  return {
    perk, learned, available: reason === null, qualified, cost, level, missing, reason, requirement: perkRequirementText(perk),
  };
}

/**
 * Grund, warum der Perk nicht gelernt werden kann, oder null. `free` (Belohnung, Herz-Ereignis) überspringt
 * Perkpunkte und Voraussetzungen.
 */
export function learnPerkProblem(content: GameContent, player: Readonly<PlayerState>, id: PerkId, free = false): string | null {
  if (!has(content.perks, id)) return 'Unbekannter Perk.';
  if (player.perks.includes(id)) return `${content.perks[id].name} ist bereits gelernt.`;
  if (free) return null;
  if (content.perks[id].exclusive) return `${content.perks[id].name} lässt sich nicht lernen.`;
  return perkStatus(content, player, id)?.reason ?? null;
}

/** Alle Perks nach Attribut (Reihenfolge der Attribute) und Mindestwert/Stufe sortiert, mit Status. */
export function perkOverview(content: GameContent, player: Readonly<PlayerState>): PerkStatus[] {
  const order = (attribute: AttributeId) => ATTRIBUTE_IDS.indexOf(attribute);
  return Object.keys(content.perks)
    .filter(id => !content.perks[id].exclusive || player.perks.includes(id))
    .map(id => perkStatus(content, player, id))
    .filter((status): status is PerkStatus => status !== null)
    .sort((a, b) => order(a.perk.attribute) - order(b.perk.attribute) || a.perk.min - b.perk.min || a.level - b.level);
}

/** Gelernte Perks (unbekannte IDs übersprungen). */
export const learnedPerks = (content: GameContent, player: Readonly<PlayerState>): CharacterPerkDef[] =>
  player.perks.filter(id => has(content.perks, id)).map(id => asPerk(content.perks[id]));

// ---------------------------------------------------------------------------
// Passive Wirkungen

/** Eine Quelle passiver Wirkungen mit Herkunft (für Aufschlüsselungen). */
export interface PassiveSource {
  kind: 'perk' | 'cyberware' | 'kleidung';
  id: string;
  name: string;
  effects: PassiveEffects;
}

/** Alle Quellen: gelernte Perks, eingebaute Cyberware, getragene Kleidung. */
export function passiveSources(content: GameContent, player: Readonly<PlayerState>): PassiveSource[] {
  const sources: PassiveSource[] = [];
  for (const perk of learnedPerks(content, player)) sources.push({ kind: 'perk', id: perk.id, name: perk.name, effects: perk });
  for (const part of installedParts(content, player)) sources.push({ kind: 'cyberware', id: part.id, name: part.name, effects: part });
  for (const item of wornItems(content, player)) {
    const wear = item.wear ?? {};
    sources.push({ kind: 'kleidung', id: item.id, name: item.name, effects: wear });
  }
  return sources;
}

export type FullCombatBonus = Required<CharacterCombatBonus>;
export const emptyCombatBonus = (): FullCombatBonus =>
  ({ hit: 0, damage: 0, armor: 0, hp: 0, move: 0, initiative: 0, bandwidth: 0, firewall: 0 });

export function addCombatBonus(total: FullCombatBonus, bonus?: CharacterCombatBonus): FullCombatBonus {
  if (!bonus) return total;
  for (const key of Object.keys(total) as (keyof FullCombatBonus)[]) {
    const value = bonus[key];
    if (typeof value === 'number' && Number.isFinite(value)) total[key] += value;
  }
  return total;
}

export interface CharacterModifiers {
  /** Händlerrabatt in Prozent (Summe, ungekappt – der Handel kappt). */
  shopDiscount: number;
  /** Ankaufsaufschlag in Prozentpunkten. */
  sellBonus: number;
  /** Zusätzliche Prozent auf positive Geschenkpunkte. */
  giftBonus: number;
  /** Zusätzliche Punkte beim Tagesgespräch. */
  talkBonus: number;
  /** Kampfboni aus Perks, Cyberware und Kleidung. */
  combat: FullCombatBonus;
  /** Alle Merkmale (ohne Doppelungen). */
  traits: string[];
  /** Je Wert die beitragenden Quellen, z. B. für Tooltips („Feilscher −10 %“). */
  breakdown: { key: 'shopDiscount' | 'sellBonus' | 'giftBonus' | 'talkBonus'; label: string; value: number }[];
}

const num = (value: unknown): number => (typeof value === 'number' && Number.isFinite(value) ? value : 0);

export function characterModifiers(content: GameContent, player: Readonly<PlayerState>): CharacterModifiers {
  const out: CharacterModifiers = {
    shopDiscount: 0, sellBonus: 0, giftBonus: 0, talkBonus: 0, combat: emptyCombatBonus(), traits: [], breakdown: [],
  };
  const traits = new Set<string>();
  for (const source of passiveSources(content, player)) {
    const fx = source.effects;
    for (const key of ['shopDiscount', 'sellBonus', 'giftBonus', 'talkBonus'] as const) {
      const value = num(fx[key]);
      if (!value) continue;
      out[key] += value;
      out.breakdown.push({ key, label: source.name, value });
    }
    addCombatBonus(out.combat, fx.combat);
    for (const trait of fx.traits ?? []) if (typeof trait === 'string' && trait) traits.add(trait);
  }
  out.traits = [...traits];
  return out;
}

/** Kampfboni aus Perks, Cyberware und Kleidung. */
export const combatBonusOf = (content: GameContent, player: Readonly<PlayerState>): FullCombatBonus =>
  characterModifiers(content, player).combat;

/** Hat die Spielfigur dieses Merkmal (aus Perk, Cyberware oder Kleidung)? */
export const hasTrait = (content: GameContent, player: Readonly<PlayerState>, trait: string): boolean =>
  passiveSources(content, player).some(source => source.effects.traits?.includes(trait) ?? false);

/**
 * Freigeschaltete Kampffähigkeiten: Perks, Cyberware und ausgerüstete Waffen.
 * Jede Fähigkeit erscheint einmal (erste Quelle gewinnt); unbekannte Fähigkeiten werden übersprungen.
 */
export function unlockedAbilities(content: GameContent, player: Readonly<PlayerState>): UnlockedAbility[] {
  const out: UnlockedAbility[] = [];
  const seen = new Set<string>();
  const add = (ability: string | undefined, source: UnlockedAbility['source'], from: string, label: string) => {
    if (!ability || seen.has(ability) || !has(content.abilities, ability)) return;
    seen.add(ability);
    out.push({ ability, source, from, label });
  };
  for (const perk of learnedPerks(content, player)) add(perk.ability, 'perk', perk.id, perk.name);
  for (const part of installedParts(content, player)) add(part.ability, 'cyberware', part.id, part.name);
  for (const item of equippedItems(content, player)) add(item.weapon?.ability, 'waffe', item.id, item.name);
  return out;
}
