// Abgeleitete Werte der Spielfigur (design.md §3.1, §3.7; world.md §2.4):
//   LP = 20 + 4 × Körper + 2 × Stufe (+ LP-Boni)
//   Bewegung = 3 + floor(Reflexe / 3) (+ Boni), Initiative = Reflexe × 2 (+ Boni)
//   Bandbreite = 2 + Technik (+ Boni), Firewall = 2 + floor(Technik / 2) (+ Boni)
// Grundlage für den Kampfaufbau (modules/combat) und den Figurbogen.
import type { AttributeId, GameContent, PlayerState, WeaponKind, WeaponStats } from '../contracts';
import { effectiveAttributes } from './attributes';
import { combatBonusOf, unlockedAbilities, type FullCombatBonus } from './perks';
import { maxHpFormula } from './progression';
import type { UnlockedAbility } from './types';

export interface DerivedStats {
  maxHp: number;
  move: number;
  initiative: number;
  bandwidth: number;
  firewall: number;
  /** Panzerung aus Boni (Grundwert 0). */
  armor: number;
  /** Trefferbonus in Prozentpunkten. */
  hit: number;
  /** Schadensbonus. */
  damage: number;
}

export const baseMove = (reflexe: number): number => 3 + Math.floor(reflexe / 3);
export const baseInitiative = (reflexe: number): number => reflexe * 2;
export const baseBandwidth = (technik: number): number => 2 + technik;
export const baseFirewall = (technik: number): number => 2 + Math.floor(technik / 2);

export function derivedStats(content: GameContent, player: Readonly<PlayerState>): DerivedStats {
  const attrs = effectiveAttributes(content, player);
  const bonus = combatBonusOf(content, player);
  return derivedFrom(attrs, player.level, bonus);
}

/** Reine Formel aus effektiven Attributen, Stufe und Boni. */
export function derivedFrom(attrs: Readonly<Record<AttributeId, number>>, level: number, bonus: FullCombatBonus): DerivedStats {
  return {
    maxHp: maxHpFormula(attrs.koerper, level, bonus.hp),
    move: Math.max(1, baseMove(attrs.reflexe) + bonus.move),
    initiative: baseInitiative(attrs.reflexe) + bonus.initiative,
    bandwidth: Math.max(0, baseBandwidth(attrs.technik) + bonus.bandwidth),
    firewall: Math.max(0, baseFirewall(attrs.technik) + bonus.firewall),
    armor: Math.max(0, bonus.armor),
    hit: bonus.hit,
    damage: bonus.damage,
  };
}

/** Attribut, das den Waffenschaden erhöht (design.md §3.7: Nahkampf Körper, Fernkampf Reflexe, Hack Technik). */
export const WEAPON_ATTRIBUTE: Readonly<Record<WeaponKind, AttributeId>> = { nahkampf: 'koerper', fernkampf: 'reflexe', smart: 'technik' };

/** Waffe ohne Ausrüstung (Fäuste). */
export const UNARMED: WeaponStats = { kind: 'nahkampf', damage: 2, range: 1 };

export interface PlayerCombatProfile {
  name: string;
  attributes: Record<AttributeId, number>;
  hp: number;
  stats: DerivedStats;
  /** Aktive Waffe: Nahkampf vor Fernkampf vor Smart, sonst Fäuste. */
  weapon: WeaponStats;
  /** Alle ausgerüsteten Waffen. */
  weapons: { slot: WeaponKind; item: string; stats: WeaponStats }[];
  abilities: UnlockedAbility[];
  bonus: FullCombatBonus;
}

/** Kampfprofil der Spielfigur aus Zustand und Inhalt (Einheit baut modules/combat). */
export function playerCombatProfile(content: GameContent, player: Readonly<PlayerState>, preferred?: WeaponKind): PlayerCombatProfile {
  const attributes = effectiveAttributes(content, player);
  const bonus = combatBonusOf(content, player);
  const weapons: PlayerCombatProfile['weapons'] = [];
  for (const slot of ['nahkampf', 'fernkampf', 'smart'] as const) {
    const id = player.equipment[slot];
    const stats = id ? content.items[id]?.weapon : undefined;
    if (id && stats) weapons.push({ slot, item: id, stats });
  }
  const weapon = (preferred && weapons.find(w => w.slot === preferred)?.stats) ?? weapons[0]?.stats ?? UNARMED;
  return {
    name: player.name,
    attributes,
    hp: player.hp,
    stats: derivedFrom(attributes, player.level, bonus),
    weapon,
    weapons,
    abilities: unlockedAbilities(content, player),
    bonus,
  };
}
