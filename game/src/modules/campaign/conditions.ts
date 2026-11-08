// Auswertung von Bedingungen: setzt die Handler aller Domänen zusammen (Erweiterungspunkt siehe registry.ts).
import type { Condition, GameContent, GameState } from '../contracts';
import { characterConditions } from './domains/character';
import { clockConditions } from './domains/clock';
import { combatConditions } from './domains/combat';
import { minigameConditions } from './domains/minigames';
import { coreConditions } from './domains/core';
import { economyConditions } from './domains/economy';
import { questConditions } from './domains/quests';
import { relationConditions } from './domains/relations';
import { discriminant, type ConditionContext, type ConditionSpec, type ConditionSpecs } from './registry';

/** Alle Bedingungshandler. Eine neue Variante in `ConditionMap` ohne Handler ist ein Compilerfehler. */
export const CONDITION_SPECS: ConditionSpecs = {
  ...coreConditions,
  ...characterConditions,
  ...relationConditions,
  ...clockConditions,
  ...questConditions,
  ...economyConditions,
  ...combatConditions,
  ...minigameConditions,
};

const MAX_DEPTH = 32;

/** Fehlende Bedingung gilt als erfüllt. Unbekannte oder kaputte Formen gelten als nicht erfüllt. */
export function evaluateCondition(content: GameContent, state: Readonly<GameState>, condition?: Condition, depth = 0): boolean {
  if (condition === undefined || condition === null) return true;
  if (depth > MAX_DEPTH || typeof condition !== 'object') return false;
  const key = discriminant(condition, CONDITION_SPECS);
  if (!key) return false;
  const ctx: ConditionContext = { content, state, evaluate: inner => evaluateCondition(content, state, inner, depth + 1) };
  try {
    return (CONDITION_SPECS[key as keyof ConditionSpecs] as ConditionSpec<keyof ConditionSpecs>).test(condition as never, ctx) === true;
  } catch {
    return false;
  }
}
