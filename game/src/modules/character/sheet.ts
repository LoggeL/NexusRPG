// Figurbogen: alle lesenden Werte der Spielfigur in einer Ansicht (für `CampaignPort.characterSheet`).
import type { AttributeId, GameContent, PlayerState } from '../contracts';
import { effectiveAttributes } from './attributes';
import { cyberwareSlots, type SlotView } from './cyberware';
import { derivedStats, type DerivedStats } from './derived';
import { characterModifiers, perkOverview, unlockedAbilities, type CharacterModifiers, type PerkStatus } from './perks';
import { levelProgress, type LevelProgress } from './progression';
import type { UnlockedAbility } from './types';

export interface CharacterSheet {
  name: string;
  /** Stufe, XP und Balken bis zur nächsten Stufe. */
  progress: LevelProgress;
  /** Basiswerte (ohne Cyberware und Kleidung). */
  base: Record<AttributeId, number>;
  /** Wirksame Werte (Basis + Cyberware + Kleidung). */
  attributes: Record<AttributeId, number>;
  unspentAttr: number;
  perkPoints: number;
  hp: number;
  derived: DerivedStats;
  cyberware: SlotView[];
  perks: PerkStatus[];
  abilities: UnlockedAbility[];
  modifiers: CharacterModifiers;
}

export function characterSheet(content: GameContent, player: Readonly<PlayerState>): CharacterSheet {
  return {
    name: player.name,
    progress: levelProgress(player.xp),
    base: { ...player.attributes },
    attributes: effectiveAttributes(content, player),
    unspentAttr: player.unspentAttr,
    perkPoints: player.perkPoints,
    hp: player.hp,
    derived: derivedStats(content, player),
    cyberware: cyberwareSlots(content, player),
    perks: perkOverview(content, player),
    abilities: unlockedAbilities(content, player),
    modifiers: characterModifiers(content, player),
  };
}
