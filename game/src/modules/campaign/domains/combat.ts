// Domäne „Kampf ↔ Kampagne“: Kampfstart als Anfrage, Abrechnung von Sieg/Niederlage/Flucht (design.md §3.7).
// Zuständig: Bereich combat-rules. Die Kampfregeln selbst (Raster, Trefferchance, KI) liegen in modules/combat.
import type { BattleFollowUp, BattleResult, Effect, EncounterId } from '../../contracts';
import { has } from '../ids';
import type { ConditionSpecs, EffectContext, EffectSpecs } from '../registry';
import { healPlayer, maxHpOf } from './character';
import { markSeenIn, removeItem } from './core';
import { completeJobsForEncounterIn } from './quests';
import { addPoints } from './relations';

export const COMPANION_WIN_POINTS = 5;
export const winKey = (encounter: EncounterId): string => `sieg:${encounter}`;

/**
 * Kampfergebnis übernehmen.
 * - Sieg: Belohnung (Begegnung + Gegnerbeute), Begleiter +5 Punkte, `sieg:<id>` gesehen, onWin.
 * - Niederlage: keine Sackgasse – zurück in den Unterschlupf mit halben LP, onLose; die Begegnung bleibt wiederholbar.
 * - Flucht: LP übernehmen, sonst nichts.
 * Danach der Nachlauf aus dem Effekt (`after.win/lose/flee`); `stay` bzw. `stayOnLose` spart den Heimweg.
 */
export function finishBattleIn(ctx: EffectContext, result: BattleResult, after?: BattleFollowUp): string | null {
  const { content, draft } = ctx;
  const def = has(content.encounters, result.encounter) ? content.encounters[result.encounter] : undefined;
  if (!def) return `Unbekannte Begegnung: ${result.encounter}`;
  for (const [item, qty] of Object.entries(result.used ?? {})) {
    if (qty > 0 && has(content.items, item)) removeItem(content, draft, item, Math.min(qty, draft.inventory[item] ?? 0) || 0);
  }
  const max = maxHpOf(content, draft.player);
  draft.player.hp = Math.max(1, Math.min(max, Math.round(Number.isFinite(result.playerHp) ? result.playerHp : max)));
  if (result.outcome === 'win') {
    draft.stats.battlesWon += 1;
    markSeenIn(draft, winKey(def.id));
    ctx.messages.push(`Sieg: ${def.name}`);
    const effects: Effect[] = [];
    const xp = (def.reward?.xp ?? 0) + Math.max(0, Math.round(result.xp ?? 0));
    const credits = (def.reward?.credits ?? 0) + Math.max(0, Math.round(result.credits ?? 0));
    if (xp > 0) effects.push({ xp });
    if (credits > 0) effects.push({ credits });
    for (const [give, qty] of Object.entries({ ...(def.reward?.items ?? {}) })) effects.push({ give, qty });
    for (const [give, qty] of Object.entries(result.loot ?? {})) if (qty > 0 && has(content.items, give)) effects.push({ give, qty });
    const problem = ctx.run(effects);
    if (problem) return problem;
    for (const npc of draft.party) addPoints(ctx, npc, COMPANION_WIN_POINTS);
    // Kopfgeld-Aufträge, deren Vorlage diese Begegnung nennt, schließen mit dem Sieg ab.
    const jobs = completeJobsForEncounterIn(ctx, def.id);
    if (jobs) return jobs;
    return ctx.run(def.onWin ?? []) ?? ctx.run(after?.win ?? []);
  }
  if (result.outcome === 'lose') {
    draft.stats.battlesLost += 1;
    healPlayer(content, draft, 'full');
    draft.player.hp = Math.max(1, Math.floor(maxHpOf(content, draft.player) / 2));
    if (after?.stay || def.stayOnLose) ctx.messages.push('Niederlage – du rappelst dich wieder auf.');
    else {
      ctx.messages.push('Niederlage – du kommst im Unterschlupf wieder zu dir.');
      if (has(content.maps, content.home.map)) ctx.requests.push({ travel: content.home.map, entry: content.home.entry, minutes: 0 });
    }
    return ctx.run(def.onLose ?? []) ?? ctx.run(after?.lose ?? []);
  }
  ctx.messages.push('Du bist entkommen.');
  return ctx.run(after?.flee ?? []);
}

/** Nachlauf eines `battle`-Effekts (nur die gesetzten Felder, damit die Anfrage schlank bleibt). */
function followUpOf(e: BattleFollowUp): BattleFollowUp | null {
  const out: BattleFollowUp = {};
  if (e.win?.length) out.win = e.win;
  if (e.lose?.length) out.lose = e.lose;
  if (e.flee?.length) out.flee = e.flee;
  if (e.stay) out.stay = true;
  return Object.keys(out).length ? out : null;
}

export const combatConditions: ConditionSpecs<'won'> = {
  won: { test: (c, { state }) => state.seen.includes(winKey(c.won)), refs: c => [{ kind: 'encounters', id: c.won }] },
};

export const combatEffects: EffectSpecs<'battle'> = {
  battle: {
    apply(e, { content, requests }) {
      if (!has(content.encounters, e.battle)) return `Unbekannte Begegnung: ${e.battle}`;
      const after = followUpOf(e);
      requests.push(after ? { battle: e.battle, ...after } : { battle: e.battle });
      return null;
    },
    refs: e => [{ kind: 'encounters', id: e.battle }],
  },
};
