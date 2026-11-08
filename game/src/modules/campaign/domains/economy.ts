// Domäne „Wirtschaft“: Credits, Ruf, Händler mit Tagesbestand, Preise (design.md §3.5, §3.6).
// Zuständig: Bereich quests+economy. Die Rechenregeln liegen in modules/economy und modules/reputation;
// diese Datei schreibt sie in den Entwurf (Effekte, Fassaden-Aktionen) und prüft das Speicherformat.
import { derivedStats } from '../../character';
import type { FactionId, GameContent, GameState, ItemId, PriceView, ShopDef, ShopId, ShopState } from '../../contracts';
import {
  creditDeltaText, discountPercent as shownDiscount, planPurchase, planSale, recordStockSale, sellUnitPrice, shopPrices,
  soldToday as soldTodayOf,
} from '../../economy';
import { REP_TIERS, applyRepDelta, factionTier, repMessages, repOf as repValue } from '../../reputation';
import { MAX_CREDITS, MAX_STACK, REP_MAX, REP_MIN, clamp, has } from '../ids';
import type { ConditionSpecs, EffectContext, EffectSpecs } from '../registry';
import { SAVE_LIMITS, int, isNum, obj, record } from '../validate';
import { addItem, itemName, removeItem } from './core';

type Evaluate = EffectContext['evaluate'];

export const repOf = (state: Readonly<GameState>, faction: FactionId): number => repValue(state, faction);

export function addCredits(ctx: EffectContext, delta: number): string | null {
  const amount = Math.round(delta);
  const next = ctx.draft.credits + amount;
  if (next < 0) return `Nicht genug Credits (${ctx.draft.credits} von ${-amount}).`;
  ctx.draft.credits = Math.min(MAX_CREDITS, next);
  if (amount !== 0) ctx.messages.push(creditDeltaText(amount));
  if (amount > 0) ctx.requests.push({ sfx: 'coin' });
  return null;
}

/** Ruf ändern (begrenzt auf −100 … 100) mit Banner „Kanalvolk +15“ und ggf. „Kanalvolk: jetzt Geduldet“. */
export function addRep(ctx: EffectContext, faction: FactionId, delta: number): string | null {
  if (!has(ctx.content.factions, faction)) return `Unbekannte Fraktion: ${faction}`;
  if (!Number.isFinite(delta)) return 'Ungültige Rufänderung.';
  const change = applyRepDelta(repOf(ctx.draft, faction), delta);
  ctx.draft.reputation[faction] = change.after;
  ctx.messages.push(...repMessages(ctx.content.factions[faction].name, change));
  return null;
}

/** Angezeigter Rabatt in Prozent (Perks plus Rufstufe; negativ = Aufschlag). */
export const discountPercent = (content: GameContent, state: Readonly<GameState>, shop: ShopDef): number => shownDiscount(content, state, shop);

/** Bestand des Tages (ein neuer Tag füllt auf). */
export const soldToday = (state: Readonly<GameState>, shop: ShopId, item: ItemId): number => soldTodayOf(state, shop, item);

export const pricesOf = (content: GameContent, state: Readonly<GameState>, shopId: ShopId, evaluate: Evaluate): PriceView[] =>
  shopPrices(content, state, shopId, evaluate);

/** Ankaufspreis für beliebige Gegenstände im Inventar (auch ohne Sortiment); null = kauft der Händler nicht. */
export const sellPrice = (content: GameContent, state: Readonly<GameState>, shop: ShopDef, item: ItemId, evaluate: Evaluate = () => true): number | null =>
  sellUnitPrice(content, state, shop, item, evaluate);

export function buyIn(ctx: EffectContext, shopId: ShopId, item: ItemId, qty: number): string | null {
  const plan = planPurchase(ctx.content, ctx.draft, shopId, item, qty, ctx.evaluate);
  if (!plan.ok) return plan.reason;
  const problem = addCredits(ctx, -plan.total);
  if (problem) return problem;
  addItem(ctx.draft, item, plan.qty);
  if (plan.tracked) recordStockSale(ctx.draft.shops, shopId, ctx.draft.clock.day, item, plan.qty);
  ctx.messages.push(`Gekauft: ${itemName(ctx.content, item)}${plan.qty > 1 ? ` ×${plan.qty}` : ''}`);
  return null;
}

export function sellIn(ctx: EffectContext, shopId: ShopId, item: ItemId, qty: number): string | null {
  const plan = planSale(ctx.content, ctx.draft, shopId, item, qty, ctx.evaluate);
  if (!plan.ok) return plan.reason;
  const problem = removeItem(ctx.content, ctx.draft, item, plan.qty);
  if (problem) return problem;
  if (!has(ctx.draft.inventory, item)) {
    // Ausgerüstete Gegenstände, die verkauft werden, legt die Figur ab.
    for (const [slot, equipped] of Object.entries(ctx.draft.player.equipment)) {
      if (equipped === item) delete ctx.draft.player.equipment[slot as keyof typeof ctx.draft.player.equipment];
    }
    // Verkaufte Kleidung kann das LP-Maximum senken.
    ctx.draft.player.hp = clamp(ctx.draft.player.hp, 1, derivedStats(ctx.content, ctx.draft.player).maxHp);
  }
  ctx.messages.push(`Verkauft: ${itemName(ctx.content, item)}${plan.qty > 1 ? ` ×${plan.qty}` : ''}`);
  return addCredits(ctx, plan.total);
}

// ---------------------------------------------------------------------------
// Handler

/** Rang einer Rufstufe (0 = Verhasst … 6 = Verehrt); unbekannte Stufen −1. */
const tierRank = (id: string): number => REP_TIERS.findIndex(tier => tier.id === id);

export const economyConditions: ConditionSpecs<'rep' | 'repTier' | 'credits'> = {
  rep: { test: (c, { state }) => repOf(state, c.rep) >= c.min, refs: c => [{ kind: 'factions', id: c.rep }] },
  repTier: {
    test: (c, { state }) => tierRank(c.min) >= 0 && tierRank(factionTier(state, c.repTier).id) >= tierRank(c.min),
    refs: c => [{ kind: 'factions', id: c.repTier }],
  },
  credits: { test: (c, { state }) => state.credits >= c.credits },
};

export const economyEffects: EffectSpecs<'credits' | 'rep' | 'shop'> = {
  credits: {
    apply(e, ctx) {
      if (!Number.isFinite(e.credits)) return 'Ungültiger Betrag.';
      return addCredits(ctx, e.credits);
    },
  },
  rep: {
    apply: (e, ctx) => addRep(ctx, e.rep, e.delta),
    refs: e => [{ kind: 'factions', id: e.rep }],
  },
  shop: {
    apply(e, { content, requests }) {
      if (!has(content.shops, e.shop)) return `Unbekannter Händler: ${e.shop}`;
      requests.push({ shop: e.shop });
      return null;
    },
    refs: e => [{ kind: 'shops', id: e.shop }],
  },
};

// ---------------------------------------------------------------------------
// Speicherformat

export function parseReputation(value: unknown, content: GameContent): Record<FactionId, number> {
  return record(value, 'Ruf', key => has(content.factions, key), (raw, key) => int(raw, REP_MIN, REP_MAX, `Ruf ${key}`));
}

export function parseShops(value: unknown, content: GameContent): Record<ShopId, ShopState> {
  return record(value, 'Händler', key => has(content.shops, key), (raw, key) => {
    const s = obj(raw, `Händler ${key}`);
    return {
      day: int(s.day, 1, SAVE_LIMITS.day, `Händlertag ${key}`),
      sold: record(s.sold, `Verkäufe ${key}`, item => has(content.items, item), v => int(v, 0, MAX_STACK, 'Verkaufsmenge')),
    };
  });
}

export const isCredits = (value: unknown): value is number => isNum(value, 0, MAX_CREDITS) && Number.isInteger(value);
