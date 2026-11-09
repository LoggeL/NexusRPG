// Hilfen für Gegnerwerte nach world.md §8.4/§8.5 (keine Inhaltsdatei: exportiert kein `part`).
//
// world.md nennt den Schaden „inklusive Attribut“ als Spanne. Die Engine rechnet
// Schaden = Waffenschaden + Attribut (Nahkampf Körper, Fernkampf Reflexe, Smart Technik) − Panzerung, ohne Spanne.
// `foe` setzt deshalb den Waffenschaden so, dass Waffe + Attribut die Mitte der Spanne ergibt.
// Firewall (FW) gibt es in der Engine noch nicht; sie fließt als Technik ein (FW = 2 + Technik / 2).
import type { AbilityId, AiProfile, AttributeId, EnemyDef, FactionId, ItemId, WeaponKind } from '../../../modules/contracts';

const WEAPON_ATTR: Record<WeaponKind, AttributeId> = { nahkampf: 'koerper', fernkampf: 'reflexe', smart: 'technik' };

export interface FoeSpec {
  id: string;
  name: string;
  level: number;
  hp: number;
  /** Panzerung (Pz). */
  armor: number;
  /** Reflexe (Ref). */
  ref: number;
  /** Firewall (FW); ohne Angabe 2. */
  fw?: number;
  /** Moral (Mor); ohne Angabe keine Moral (Drohnen, Tiere ohne Moral, Bosse, Gechippte). */
  morale?: number;
  /** Schaden inklusive Attribut als Spanne aus world.md. */
  dmg: readonly [number, number];
  kind: WeaponKind;
  range: number;
  /** Treffer-Bonus der Waffe. */
  hit?: number;
  /** Abweichende Attribute (sonst Körper 3 + Stufe/2, Ausstrahlung 3, Straße 3, Technik aus FW). */
  attrs?: Partial<Record<AttributeId, number>>;
  ai: AiProfile;
  abilities?: AbilityId[];
  sprite?: string;
  portrait?: string;
  faction?: FactionId;
  /** Ohne Angabe 10 × Stufe (Bosse 30 × Stufe, world.md §8.1). */
  xp?: number;
  boss?: boolean;
  credits?: readonly [number, number];
  loot?: { item: ItemId; chance: number; qty?: number }[];
  phases?: EnemyDef['phases'];
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

export function foe(spec: FoeSpec): EnemyDef {
  const mid = Math.round((spec.dmg[0] + spec.dmg[1]) / 2);
  const fw = spec.fw ?? 2;
  const attributes: Record<AttributeId, number> = {
    technik: clamp((fw - 2) * 2, 1, 10),
    koerper: clamp(3 + Math.floor(spec.level / 2), 1, 10),
    reflexe: spec.ref,
    ausstrahlung: 3,
    strasse: 3,
    ...spec.attrs,
  };
  const attr = WEAPON_ATTR[spec.kind];
  // Smart-Waffen: Technik nicht höher als der Schaden hergibt (sonst wäre die Waffe wertlos).
  if (spec.kind === 'smart' && !spec.attrs?.technik) attributes.technik = clamp(Math.min(attributes.technik, mid - 2), 1, 10);
  const weaponDamage = Math.max(1, mid - attributes[attr]);
  const def: EnemyDef = {
    id: spec.id,
    name: spec.name,
    level: spec.level,
    stats: {
      hp: spec.hp,
      armor: spec.armor,
      attributes,
      weapon: { kind: spec.kind, damage: weaponDamage, range: spec.range, ...(spec.hit ? { hit: spec.hit } : {}) },
      abilities: spec.abilities ?? [],
      ...(spec.morale !== undefined ? { morale: spec.morale } : {}),
    },
    ai: spec.ai,
    xp: spec.xp ?? spec.level * (spec.boss ? 30 : 10),
  };
  if (spec.sprite) def.sprite = spec.sprite;
  if (spec.portrait) def.portrait = spec.portrait;
  if (spec.faction) def.faction = spec.faction;
  if (spec.credits) def.credits = spec.credits;
  if (spec.loot) def.loot = spec.loot;
  if (spec.phases) def.phases = spec.phases;
  return def;
}

export const byId = <T extends { id: string }>(list: readonly T[]): Record<string, T> =>
  Object.fromEntries(list.map((x) => [x.id, x]));

/** Credits nach Stufe für Menschen mit Taschen. */
export const pocket = (level: number): readonly [number, number] => [level * 3, level * 8];

/** Beute für Maschinen. */
export const scrap = (chance = 0.6, qty = 1) => ({ item: 'schrott-ersatzteil', chance, qty });
