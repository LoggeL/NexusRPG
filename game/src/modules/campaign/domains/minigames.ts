// Domäne „Minispiele“ (world.md §3.9): Start als Anfrage an die Darstellung, Abrechnung über finishMinigame.
import type { MinigameRequest } from '../../contracts';
import type { ConditionSpecs, EffectContext, EffectSpecs } from '../registry';
import { markSeenIn } from './core';

export const minigameKey = (key: string): string => `spiel:${key}`;

export function finishMinigameIn(ctx: EffectContext, request: MinigameRequest, won: boolean): string | null {
  if (won) {
    markSeenIn(ctx.draft, minigameKey(request.key));
    return ctx.run(request.win ?? []);
  }
  return ctx.run(request.lose ?? []);
}

export const minigameConditions: ConditionSpecs<'wonMinigame'> = {
  wonMinigame: { test: (c, { state }) => state.seen.includes(minigameKey(c.wonMinigame)) },
};

export const minigameEffects: EffectSpecs<'minigame'> = {
  minigame: {
    apply(e, { requests }) {
      if (typeof e.minigame !== 'string' || !e.minigame) return 'Minispiel ohne ID.';
      const level = Math.max(1, Math.min(5, Math.round(e.level ?? 2)));
      requests.push({ minigame: { id: e.minigame, level, key: e.key ?? e.minigame, label: e.label, win: e.win ?? [], lose: e.lose ?? [] } });
      return null;
    },
  },
};
