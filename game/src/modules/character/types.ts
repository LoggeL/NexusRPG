// Typen des Bereichs „Spielfigur und Checks“.
//
// Die früheren Erweiterungstypen (Kontextregeln, automatisches Bestehen, Ersatzattribut, passive Wirkungen,
// Mindeststufe, Herkunftswahl, Werkstattgebühr, vorübergehende Boni) stehen jetzt in contracts.ts. Die Namen hier
// bleiben als Aliase erhalten, damit Inhalte und Regeln unverändert weiter kompilieren.
import type {
  AbilityId, AutoPassRule, CharacterInput, CheckBonusRule, CheckBuff, CheckDef, CombatBonus, CyberwareDef, ItemDef, NpcDef,
  OriginDef, PassiveEffects, PerkDef, ShopDef, SubstituteRule,
} from '../contracts';

export type { AutoPassRule, CheckBuff, PassiveEffects, SubstituteRule };

/** Check-Bonusregel mit Kontext (`when`, `maps`, `districts`, `factions`, `label`). */
export type CheckRule = CheckBonusRule;
/** Kampfboni samt Netz-Werten (Bandbreite, Firewall). */
export type CharacterCombatBonus = CombatBonus;
export type CharacterPerkDef = PerkDef;
export type CharacterCyberwareDef = CyberwareDef;
export type CharacterOriginDef = OriginDef;
export type CharacterItemDef = ItemDef;
export type CharacterCheckDef = CheckDef;
export type CharacterNpcDef = NpcDef;
export type CharacterShopDef = ShopDef;
export type CharacterCreationInput = CharacterInput;

/** Herkunft einer freigeschalteten Kampffähigkeit. */
export interface UnlockedAbility {
  ability: AbilityId;
  source: 'perk' | 'cyberware' | 'waffe';
  /** ID der Quelle (Perk, Cyberware, Gegenstand). */
  from: string;
  /** Anzeigename der Quelle. */
  label: string;
}

// ---------------------------------------------------------------------------
// Lesende Sicht (seit der Übernahme in contracts.ts Identitäten; bleiben für bestehende Aufrufer).

export const asPerk = (def: PerkDef): CharacterPerkDef => def;
export const asCyberware = (def: CyberwareDef): CharacterCyberwareDef => def;
export const asOrigin = (def: OriginDef): CharacterOriginDef => def;
export const asItem = (def: ItemDef): CharacterItemDef => def;
export const asCheck = (def: CheckDef): CharacterCheckDef => def;
export const asNpc = (def: NpcDef): CharacterNpcDef => def;
export const asShop = (def: ShopDef): CharacterShopDef => def;
