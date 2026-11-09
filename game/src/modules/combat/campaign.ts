// Kampfregeln: Brücke zur Kampagne – Party aus dem Spielstand, Kampfgepäck, Seed und BattleResult.
import { PLAYER_SPRITE } from '../appearance';
import type { AbilityId, AttributeId, BattleResult, CompanionDef, EncounterDef, EncounterId, GameContent, GameState, ItemId, UnitStats, WeaponStats } from '../contracts';
import { combatBonus, effectiveAttribute, maxHpOf } from '../campaign/domains/character';
import { heartsOf, relationOf } from '../campaign/domains/relations';
import { ATTRIBUTE_IDS, CYBER_SLOTS, has, hashText } from '../campaign/ids';
import { evaluateCondition } from '../campaign/conditions';
import { itemAbility, usableInBattle } from './actions';
import { findUnit } from './queries';
import type { BattleSetup, CombatData, CombatState, PartyMemberSpec } from './types';

/** Reihenfolge der Waffen in der Hand: Fernkampf zuerst, dann Nahkampf, dann Smart. */
const WEAPON_SLOTS = ['fernkampf', 'nahkampf', 'smart'] as const;

export const PLAYER_UNIT_ID = 'player';
export const companionUnitId = (npc: string): string => `crew:${npc}`;

/** Fähigkeitsregeln eines Begleiters anwenden (`abilityRules`: hinzufügen bzw. tauschen, wenn die Bedingung gilt). */
export function applyAbilityRules(
  base: readonly AbilityId[], companion: CompanionDef, test: (condition: CompanionDef['recruit']) => boolean,
): AbilityId[] {
  let out = [...base];
  for (const rule of companion.abilityRules ?? []) {
    if (!test(rule.when)) continue;
    if (rule.replace) {
      const [from, to] = rule.replace;
      out = out.map(id => (id === from ? to : id));
    }
    if (rule.add && !out.includes(rule.add)) out.push(rule.add);
    if (rule.remove) out = out.filter(id => id !== rule.remove);
  }
  return out;
}

/** Ab dieser Stufe wachsen Begleiter ohne `statsByLevel` von selbst mit (Akt 1 endet um Stufe 5). */
export const COMPANION_SCALE_FROM = 5;

/**
 * Begleiterwerte für die Stufe der Spielfigur: `statsByLevel` (aufsteigend, alle Einträge bis zur Stufe gelten
 * nacheinander) – ohne Einträge +6 % LP je Stufe über 5 und +1 Waffenschaden je 3 Stufen darüber.
 */
export function companionStatsAt(companion: CompanionDef, level: number): UnitStats {
  const base = companion.stats;
  const out: UnitStats = { ...base, attributes: { ...base.attributes }, weapon: { ...base.weapon }, abilities: [...base.abilities] };
  const steps = (companion.statsByLevel ?? []).filter(entry => level >= entry.minLevel).sort((a, b) => a.minLevel - b.minLevel);
  if (companion.statsByLevel?.length) {
    for (const step of steps) {
      if (step.hp !== undefined) out.hp = step.hp;
      if (step.armor !== undefined) out.armor = step.armor;
      if (step.morale !== undefined) out.morale = step.morale;
      for (const [id, value] of Object.entries(step.attributes ?? {})) if (typeof value === 'number') out.attributes[id as AttributeId] = value;
      if (step.weapon) Object.assign(out.weapon, step.weapon);
    }
    return out;
  }
  const over = Math.max(0, Math.floor(level) - COMPANION_SCALE_FROM);
  if (over > 0) {
    out.hp = Math.round(base.hp * (1 + 0.06 * over));
    out.weapon.damage = base.weapon.damage + Math.floor(over / 3);
  }
  return out;
}

/** Spielfigur und aktive Begleiter als Kampfeinheiten (effektive Attribute, Kampfboni, Ausrüstung, Herzen, Duos). */
export function partyFromCampaign(content: GameContent, state: Readonly<GameState>): PartyMemberSpec[] {
  const test = (condition: CompanionDef['recruit']) => evaluateCondition(content, state, condition);
  const player = state.player;
  const attributes = {} as PartyMemberSpec['attributes'];
  for (const id of ATTRIBUTE_IDS) attributes[id] = effectiveAttribute(content, player, id);
  const bonus = combatBonus(content, player);
  const weapons: WeaponStats[] = [];
  const abilities: AbilityId[] = [];
  for (const slot of WEAPON_SLOTS) {
    const id = player.equipment[slot];
    const weapon = id && has(content.items, id) ? content.items[id].weapon : undefined;
    if (!weapon) continue;
    weapons.push({ ...weapon });
    if (weapon.ability) abilities.push(weapon.ability);
  }
  for (const perk of player.perks) { const ability = content.perks[perk]?.ability; if (ability) abilities.push(ability); }
  for (const slot of CYBER_SLOTS) {
    const id = player.cyberware[slot];
    const ability = id ? content.cyberware[id]?.ability : undefined;
    if (ability) abilities.push(ability);
  }
  // Duo-Aktionen „Spielfigur + Begleiter“: Fähigkeit für die Spielfigur, solange der Partner in der Party ist.
  for (const npcId of state.party) {
    for (const duo of content.npcs[npcId]?.companion?.duo ?? []) {
      if (duo.holder === 'player' && test(duo.when)) abilities.push(duo.ability);
    }
  }
  const look = has(content.looks, player.look) ? content.looks[player.look] : undefined;
  const preset = player.preset ? content.presets?.[player.preset] : undefined;
  const maxHp = maxHpOf(content, player);
  const party: PartyMemberSpec[] = [{
    id: PLAYER_UNIT_ID, name: player.name, source: { kind: 'player' },
    sprite: preset?.sprite ?? look?.sprite ?? PLAYER_SPRITE, portrait: preset?.portrait ?? (look?.portrait || undefined), level: player.level,
    hp: Math.max(1, Math.min(maxHp, player.hp)), maxHp, armor: bonus.armor, attributes, weapons,
    abilities: [...new Set(abilities.filter(id => has(content.abilities, id)))], bonus: { ...bonus, armor: 0, hp: 0 },
  }];
  for (const npcId of state.party) {
    const npc = has(content.npcs, npcId) ? content.npcs[npcId] : undefined;
    if (!npc?.companion?.stats) continue;
    // Gerade nicht verfügbar (gefangen, gechippt): kämpft nicht mit, auch wenn die Party noch nicht bereinigt ist.
    if (npc.companion.unavailableWhen && test(npc.companion.unavailableWhen)) continue;
    const stats = companionStatsAt(npc.companion, player.level);
    const hearts = heartsOf(relationOf(state, npcId).points);
    const companion = npc.companion as CompanionDef;
    const extra = (companion.heartAbilities ?? []).filter(entry => hearts >= entry.hearts).map(entry => entry.ability);
    for (const duo of companion.duo ?? []) if (duo.holder !== 'player' && test(duo.when)) extra.push(duo.ability);
    const own = applyAbilityRules([...stats.abilities, ...extra], companion, test);
    party.push({
      id: companionUnitId(npcId), name: npc.name, source: { kind: 'companion', npc: npcId },
      sprite: npc.sprite ?? `${npcId}-walk`, portrait: npc.portrait, level: player.level,
      hp: stats.hp, maxHp: stats.hp, armor: stats.armor, attributes: { ...stats.attributes },
      weapons: [{ ...stats.weapon }], abilities: [...new Set(own.filter(id => has(content.abilities, id)))],
      morale: stats.morale,
    });
  }
  return party;
}

/** Zustände ab Kampfbeginn (`EncounterDef.startStatus`), deren Bedingung im Spielstand gilt. */
export function startStatusFromCampaign(content: GameContent, state: Readonly<GameState>, encounter: EncounterDef): NonNullable<BattleSetup['startStatus']> {
  return (encounter.startStatus ?? [])
    .filter(entry => evaluateCondition(content, state, entry.when))
    .map(({ target, status, rounds }) => ({ target, status, rounds }));
}

/** Gegenstände aus dem Inventar, die im Kampf nutzbar sind (Kampffähigkeit oder Heilung). */
export function bagFromInventory(data: CombatData, inventory: Readonly<Record<ItemId, number>>): Record<ItemId, number> {
  const bag: Record<ItemId, number> = {};
  for (const [id, qty] of Object.entries(inventory)) {
    if (qty <= 0 || !has(data.items, id)) continue;
    const item = data.items[id];
    if (!usableInBattle(data, item)) continue;
    if (!itemAbility(data, item) && item.use?.consumes === false) continue;
    bag[id] = qty;
  }
  return bag;
}

/** Deterministischer Kampf-Seed aus Spielstand und Begegnung (gleiche Lage → gleicher Kampf). */
export function battleSeed(state: Readonly<GameState>, encounter: EncounterId): number {
  return (state.seed ^ hashText(`${encounter}:${state.clock.day}:${state.clock.minutes}:${state.stats.battlesWon}:${state.stats.battlesLost}`)) >>> 0;
}

/** Ergebnis für `CampaignPort.finishBattle` (LP der Spielfigur, Verbrauch, Beute, XP, Credits). */
export function battleResult(state: CombatState, outcome = state.outcome ?? 'fled'): BattleResult {
  const player = findUnit(state, PLAYER_UNIT_ID) ?? state.units.find(unit => unit.source.kind === 'player');
  const result: BattleResult = { encounter: state.encounter, outcome, playerHp: player ? player.hp : 1 };
  if (Object.keys(state.used).length) result.used = { ...state.used };
  if (outcome === 'win' && state.rewards) {
    if (Object.keys(state.rewards.loot).length) result.loot = { ...state.rewards.loot };
    if (state.rewards.xp) result.xp = state.rewards.xp;
    if (state.rewards.credits) result.credits = state.rewards.credits;
  }
  return result;
}
