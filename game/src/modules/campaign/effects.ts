// Effekte auf einem Entwurf des Zustands: setzt die Handler aller Domänen zusammen.
//
// Erweiterungspunkte (siehe docs/engine-notes.md):
// - Neue Effektvariante: `EffectMap` in contracts.ts ergänzen, Handler in der zuständigen Datei unter domains/.
// - Nachlauf nach jeder vollständigen Änderung: SETTLE_HOOKS (Quest-Fortschritt, Telefon, Stationen).
//
// Zuständigkeit der Domänen:
//   core.ts        Fundament (Flags, Inventar, Akte, Reisen, Abläufe, Stationen, Nachrichten, Telefon)
//   character.ts   character (XP, LP, Perks, Cyberware, Ausrüstung) – checks.ts ebenso
//   relations.ts   relationships+time (Punkte, Geschenke, Romanze, Crew)
//   clock.ts       relationships+time (Uhr, Schlafen, Zusammenbruch) – schedule.ts ebenso
//   quests.ts      quests+economy (Quests, Aufträge)
//   economy.ts     quests+economy (Credits, Ruf, Händler)
//   combat.ts      combat-rules (Kampfstart, Abrechnung)
import type { Condition, Effect, GameContent, GameState, Request } from '../contracts';
import { evaluateCondition } from './conditions';
import { characterEffects } from './domains/character';
import { clockEffects } from './domains/clock';
import { combatEffects } from './domains/combat';
import { coreEffects, coreSettle } from './domains/core';
import { economyEffects } from './domains/economy';
import { minigameEffects } from './domains/minigames';
import { jobSettle, questEffects, questSettle } from './domains/quests';
import { relationEffects } from './domains/relations';
import { discriminant, type EffectContext, type EffectSpec, type EffectSpecs, type SettleHook } from './registry';

/** Alle Effekthandler. Eine neue Variante in `EffectMap` ohne Handler ist ein Compilerfehler. */
export const EFFECT_SPECS: EffectSpecs = {
  ...coreEffects,
  ...characterEffects,
  ...relationEffects,
  ...clockEffects,
  ...questEffects,
  ...economyEffects,
  ...combatEffects,
  ...minigameEffects,
};

/** Nachlauf in dieser Reihenfolge; jeder Haken meldet, ob er etwas geändert hat. */
export const SETTLE_HOOKS: SettleHook[] = [questSettle, jobSettle, coreSettle];

const MAX_NESTING = 16;
const MAX_SETTLE_ROUNDS = 8;

export type EffectRun =
  | { ok: true; requests: Request[]; messages: string[] }
  | { ok: false; message: string };

export function createEffectContext(content: GameContent, draft: GameState, random: () => number): EffectContext {
  let depth = 0;
  const ctx: EffectContext = {
    content,
    draft,
    requests: [],
    messages: [],
    random,
    evaluate: (condition?: Condition) => evaluateCondition(content, draft, condition),
    run(effects) {
      if (!Array.isArray(effects)) return 'Ungültige Effektliste.';
      if (depth >= MAX_NESTING) return 'Effekte zu tief verschachtelt.';
      depth++;
      try {
        for (const effect of effects) {
          const problem = applyOne(effect, ctx);
          if (problem) return problem;
        }
        return null;
      } finally {
        depth--;
      }
    },
  };
  return ctx;
}

function applyOne(effect: Effect, ctx: EffectContext): string | null {
  if (!effect || typeof effect !== 'object') return 'Ungültiger Effekt.';
  const key = discriminant(effect, EFFECT_SPECS);
  if (!key) return 'Unbekannter Effekt.';
  try {
    return (EFFECT_SPECS[key as keyof EffectSpecs] as EffectSpec<keyof EffectSpecs>).apply(effect as never, ctx);
  } catch (error) {
    return error instanceof Error ? `Effekt fehlgeschlagen: ${error.message}` : 'Effekt fehlgeschlagen.';
  }
}

/** Nachlauf, bis sich nichts mehr ändert (begrenzt). */
export function settle(ctx: EffectContext): void {
  for (let round = 0; round < MAX_SETTLE_ROUNDS; round++) {
    let changed = false;
    for (const hook of SETTLE_HOOKS) if (hook(ctx)) changed = true;
    if (!changed) return;
  }
}

/** Wendet die Effekte nacheinander auf `draft` an (inklusive Nachlauf). Bei `ok: false` ist der Entwurf unbrauchbar. */
export function runEffects(draft: GameState, effects: readonly Effect[], content: GameContent, random: () => number = () => 0.5): EffectRun {
  const ctx = createEffectContext(content, draft, random);
  const problem = ctx.run(effects);
  if (problem) return { ok: false, message: problem };
  settle(ctx);
  return { ok: true, requests: ctx.requests, messages: ctx.messages };
}
