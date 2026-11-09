// Rasterkampf als reine Regeln (design.md §3.7, world.md §8). Öffentliche API für Darstellung und App.
//
// Ablauf:
//   const setup = { encounter, seed: battleSeed(state, encounter), party: partyFromCampaign(content, state),
//                   bag: bagFromInventory(content, state.inventory) };
//   let battle = createBattle(content, setup);              // erste Einheit ist am Zug
//   battle = runAiUntilPlayer(content, battle).state;       // Gegner-Züge bis die Party dran ist
//   moveOptions(battle) / attackTargets(content, battle) / actionOptions(content, battle)   // Vorschau
//   const { state, events, error } = act(content, battle, { type: 'attack', target }); // Aktion ausführen
//   … bis battle.outcome gesetzt ist, dann campaign.finishBattle(battleResult(battle)).
// Jede Aktion liefert einen neuen Zustand und die Ereignisse zum Animieren; Fehler ändern nichts.
export type * from './types';
export * from './rules';
export { act, validateAction, abilityTargets, abilityBlocker, canInteract, itemAbility, usableInBattle } from './actions';
export { createBattle } from './setup';
export { initiativeOrder, upcomingTurns } from './turns';
export { planAi, planAiAction, positionScore, roleOf, runAiTurn, runAiUntilPlayer, type AiPlan } from './ai';
export { actionOptions, abilityOptions, areaPreview, attackTargets, itemOptions, moveOptions, previewAttack, countsAsAttack, type AttackQuery } from './preview';
export { damageOf, hitChance, strikePreview } from './resolve';
export { reachableCells, findPath } from './movement';
export {
  bestCoverAt, cellKey, cellsInRadius, coverAgainst, distance, facingToward, inBounds, isHazard, isWalkable, lineOfSight,
  parseLayout, relationTo, sameCell,
} from './grid';
export { activeUnit, findUnit, hasStatus, isActive, livingOf, abilityDef } from './queries';
export { PLAYER_UNIT_ID, battleResult, battleSeed, bagFromInventory, companionStatsAt, companionUnitId, partyFromCampaign, startStatusFromCampaign } from './campaign';
export { simulateBattle, withAutopilot, type SimulationResult } from './simulate';
export { validateCombatContent } from './validate';
export { ruleMarks } from './bossRules';
export { initialRng, nextRandom } from './rng';
