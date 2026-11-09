// Handel und Credits (design.md §3.6): Preise mit Perk- und Rufrabatt, Ankauf 40 %, Sortiment mit Bedingungen und
// Tagesbestand. Reine Rechnungen auf dem Zustand; geschrieben wird nur in campaign/domains/economy.ts.
// Zuständig: Bereich quests+economy.
import { DEFAULT_BUY_RATE, MAX_CREDITS, MAX_STACK, clamp, has } from '../campaign/ids';
import type {
  Condition, GameContent, GameState, ItemDef, ItemId, PriceView, ShopDef, ShopId, ShopState,
} from '../contracts';
import { characterModifiers } from '../character';
import { factionTier, type RepTierDef } from '../reputation';

export type Evaluate = (condition?: Condition) => boolean;

/** Höchster Gesamtrabatt (Kaufpreis höchstens halbiert) und höchster Aufschlag (doppelt). */
export const MIN_BUY_FACTOR = 0.5;
export const MAX_BUY_FACTOR = 2;
/** Obergrenze der Ankaufsquote. */
export const MAX_SELL_RATE = 0.9;
/** Höchstmenge je Kauf bzw. Verkauf. */
export const MAX_TRADE_QTY = 99;

export const formatCredits = (amount: number): string => `${Math.round(amount)} ¢`;
/** „+50 Credits“ bzw. „−50 Credits“ (Toast). */
export const creditDeltaText = (delta: number): string => `${delta < 0 ? '−' : '+'}${Math.abs(Math.round(delta))} Credits`;
export const clampCredits = (value: number): number => (Number.isFinite(value) ? clamp(Math.round(value), 0, MAX_CREDITS) : 0);

const shopDef = (content: GameContent, shop: ShopId): ShopDef | undefined => (has(content.shops, shop) ? content.shops[shop] : undefined);
const itemDef = (content: GameContent, item: ItemId): ItemDef | undefined => (has(content.items, item) ? content.items[item] : undefined);
const itemLabel = (content: GameContent, item: ItemId): string => itemDef(content, item)?.name ?? item;
const owned = (state: Readonly<GameState>, item: ItemId): number => (has(state.inventory, item) ? state.inventory[item] ?? 0 : 0);

/** Händlerrabatt der Spielfigur in Prozent (Perks, Cyberware, Kleidung – modules/character). */
export const perkDiscount = (content: GameContent, state: Readonly<GameState>): number =>
  characterModifiers(content, state.player).shopDiscount;

/** Ankaufsaufschlag der Spielfigur in Prozentpunkten (Perks, Cyberware, Kleidung – modules/character). */
export const perkSellBonus = (content: GameContent, state: Readonly<GameState>): number =>
  characterModifiers(content, state.player).sellBonus;

/** Alles, was die Preise eines Händlers für die Spielfigur bestimmt. */
export interface TradeTerms {
  /** Rufstufe bei der Händlerfraktion (ohne Fraktion „Neutral“). */
  tier: RepTierDef;
  /** Rabatt aus Perks, Cyberware und Kleidung in Prozent. */
  perkDiscount: number;
  /** Faktor auf den Grundpreis beim Kauf (1 = Normalpreis). */
  buyFactor: number;
  /** Ankaufsquote 0 … 0,9 (Standard 0,4 plus Perk und Ruf). */
  sellRate: number;
  /** Grund, warum der Händler nicht handelt (Ruf „Verhasst“), sonst null. */
  refused: string | null;
  /** Hinweise der passenden Preisregeln (`priceRules[].note`), z. B. „Familienrabatt“. */
  notes: string[];
}

/** Konditionen; mit `evaluate` gelten auch die Preisregeln des Händlers (`ShopDef.priceRules`). */
export function tradeTerms(content: GameContent, state: Readonly<GameState>, shop: ShopDef, evaluate?: Evaluate): TradeTerms {
  const tier = factionTier(state, shop.faction);
  const discount = perkDiscount(content, state);
  let ruleDiscount = 0;
  let ruleRefused: string | null = null;
  const notes: string[] = [];
  for (const rule of evaluate ? shop.priceRules ?? [] : []) {
    if (!evaluate?.(rule.when)) continue;
    if (Number.isFinite(rule.discount)) ruleDiscount += rule.discount ?? 0;
    if (rule.refuse && !ruleRefused) ruleRefused = rule.refuse;
    if (rule.note && !notes.includes(rule.note)) notes.push(rule.note);
  }
  const buyFactor = clamp(1 + (tier.priceModifier - discount - ruleDiscount) / 100, MIN_BUY_FACTOR, MAX_BUY_FACTOR);
  const sellRate = clamp((shop.buyRate ?? DEFAULT_BUY_RATE) + (perkSellBonus(content, state) + tier.sellBonus) / 100, 0, MAX_SELL_RATE);
  const refused = tier.refusesTrade ? `${shop.name} handelt nicht mit dir (Ruf: ${tier.name}).` : ruleRefused;
  return { tier, perkDiscount: discount, buyFactor, sellRate, refused, notes };
}

/** Verweigert die Werkstatt den Einbau (`ripperdoc.refuseWhen`)? Liefert den Grund oder null. */
export function installRefusal(shop: ShopDef, evaluate: Evaluate): string | null {
  const doc = shop.ripperdoc;
  if (!doc?.refuseWhen || !evaluate(doc.refuseWhen)) return null;
  return doc.refuseText ?? `${shop.name} baut dir nichts ein.`;
}

/** Gebühr für „Fahndung −1“ bei einem Händler mit `wantedService` (halbiert bei `halfWhen`), sonst null. */
export function wantedServiceFee(shop: ShopDef, evaluate: Evaluate): number | null {
  const service = shop.wantedService;
  if (!service || !(Number.isFinite(service.fee) && service.fee >= 0)) return null;
  const fee = service.halfWhen && evaluate(service.halfWhen) ? service.fee / 2 : service.fee;
  return Math.max(0, Math.round(fee));
}

/** Rabatt (positiv) bzw. Aufschlag (negativ) in Prozent gegenüber dem Grundpreis, wie er im Laden angezeigt wird. */
export const discountPercent = (content: GameContent, state: Readonly<GameState>, shop: ShopDef, evaluate?: Evaluate): number =>
  Math.round((1 - tradeTerms(content, state, shop, evaluate).buyFactor) * 100);

/** Kaufpreis je Stück (mindestens 1 Credit). */
export const buyUnitPrice = (base: number, terms: TradeTerms): number => Math.max(1, Math.round(Math.max(0, base) * terms.buyFactor));

/** Verkaufte Menge eines Gegenstands heute (ein neuer Tag füllt den Bestand auf). */
export function soldToday(state: Readonly<GameState>, shop: ShopId, item: ItemId): number {
  const entry = has(state.shops, shop) ? state.shops[shop] : undefined;
  return entry && entry.day === state.clock.day && has(entry.sold, item) ? entry.sold[item] : 0;
}

/** Erster sichtbarer Sortimentseintrag eines Gegenstands (Bedingung erfüllt). */
function stockEntry(content: GameContent, shop: ShopDef, item: ItemId, evaluate: Evaluate) {
  return shop.stock.find(entry => entry.item === item && has(content.items, entry.item) && evaluate(entry.when));
}

/** Darf dieser Händler den Gegenstand ankaufen? */
export function buysCategory(shop: ShopDef, item: ItemDef): boolean {
  if (!(item.sellable ?? item.category !== 'quest')) return false;
  if (shop.buys) return shop.buys.includes(item.category);
  return item.category !== 'quest';
}

/**
 * Ankaufspreis je Stück oder null (kauft der Händler nicht). Liegt der Ankauf über dem eigenen Verkaufspreis, wird er
 * darunter gedeckelt – Kaufen und sofort Zurückverkaufen bringt nie Gewinn.
 */
export function sellUnitPrice(content: GameContent, state: Readonly<GameState>, shop: ShopDef, item: ItemId, evaluate: Evaluate, terms = tradeTerms(content, state, shop, evaluate)): number | null {
  const def = itemDef(content, item);
  if (!def || !buysCategory(shop, def)) return null;
  const price = Math.max(0, Math.floor(def.price * terms.sellRate));
  const entry = stockEntry(content, shop, item, evaluate);
  if (!entry) return price;
  return Math.min(price, Math.max(0, buyUnitPrice(entry.price ?? def.price, terms) - 1));
}

/** Sortiment mit Preisen (Vertragsform `PriceView`); Einträge mit unerfüllter Bedingung fehlen. */
export function shopPrices(content: GameContent, state: Readonly<GameState>, shopId: ShopId, evaluate: Evaluate): PriceView[] {
  const shop = shopDef(content, shopId);
  if (!shop) return [];
  const terms = tradeTerms(content, state, shop, evaluate);
  const open = evaluate(shop.open) && terms.refused === null;
  const views: PriceView[] = [];
  const listed = new Set<string>();
  for (const entry of shop.stock) {
    const item = itemDef(content, entry.item);
    if (!item || listed.has(entry.item) || !evaluate(entry.when)) continue;
    listed.add(entry.item);
    views.push({
      item: entry.item,
      buy: buyUnitPrice(entry.price ?? item.price, terms),
      sell: sellUnitPrice(content, state, shop, entry.item, evaluate, terms) ?? 0,
      available: entry.qty === undefined ? null : Math.max(0, entry.qty - soldToday(state, shopId, entry.item)),
      open,
    });
  }
  return views;
}

export interface SellOffer { item: ItemId; name: string; qty: number; price: number }

/** Ladenansicht für die Oberfläche: Konditionen, Sortiment und was der Händler aus dem Inventar ankauft. */
export interface ShopView {
  shop: ShopId;
  name: string;
  /** Geöffnet (Öffnungszeit) und nicht verweigert. */
  open: boolean;
  /** „Geschlossen“ bzw. Ruf-Verweigerung, sonst null. */
  closedReason: string | null;
  terms: TradeTerms;
  /** Angezeigter Rabatt in Prozent (negativ = Aufschlag). */
  discount: number;
  stock: (PriceView & { name: string; soldOut: boolean; affordable: boolean })[];
  sellable: SellOffer[];
}

export function shopView(content: GameContent, state: Readonly<GameState>, shopId: ShopId, evaluate: Evaluate): ShopView | null {
  const shop = shopDef(content, shopId);
  if (!shop) return null;
  const terms = tradeTerms(content, state, shop, evaluate);
  const timeOpen = evaluate(shop.open);
  const closedReason = terms.refused ?? (timeOpen ? null : `${shop.name} hat gerade geschlossen.`);
  const stock = shopPrices(content, state, shopId, evaluate).map(view => ({
    ...view,
    name: itemLabel(content, view.item),
    soldOut: view.available === 0,
    affordable: state.credits >= view.buy,
  }));
  const sellable: SellOffer[] = [];
  for (const [item, qty] of Object.entries(state.inventory)) {
    if (!qty || qty <= 0) continue;
    const price = sellUnitPrice(content, state, shop, item, evaluate, terms);
    if (price === null) continue;
    sellable.push({ item, name: itemLabel(content, item), qty, price });
  }
  return { shop: shopId, name: shop.name, open: closedReason === null, closedReason, terms, discount: Math.round((1 - terms.buyFactor) * 100), stock, sellable };
}

export type TradePlan =
  | { ok: true; item: ItemId; qty: number; unit: number; total: number; /** Tagesbestand mitzählen. */ tracked: boolean }
  | { ok: false; reason: string };

const validQty = (qty: number, max: number): boolean => Number.isInteger(qty) && qty >= 1 && qty <= max;

/** Prüft einen Kauf und rechnet ihn aus, ohne etwas zu ändern. */
export function planPurchase(content: GameContent, state: Readonly<GameState>, shopId: ShopId, item: ItemId, qty: number, evaluate: Evaluate): TradePlan {
  const shop = shopDef(content, shopId);
  if (!shop) return { ok: false, reason: 'Unbekannter Händler.' };
  if (!validQty(qty, MAX_TRADE_QTY)) return { ok: false, reason: 'Ungültige Menge.' };
  const terms = tradeTerms(content, state, shop, evaluate);
  if (terms.refused) return { ok: false, reason: terms.refused };
  if (!evaluate(shop.open)) return { ok: false, reason: `${shop.name} hat gerade geschlossen.` };
  const entry = stockEntry(content, shop, item, evaluate);
  const def = itemDef(content, item);
  if (!entry || !def) return { ok: false, reason: `${itemLabel(content, item)} gibt es hier nicht.` };
  if (entry.qty !== undefined) {
    const available = Math.max(0, entry.qty - soldToday(state, shopId, item));
    if (available < qty) return { ok: false, reason: available === 0 ? 'Heute ausverkauft.' : `Nur noch ${available} vorrätig.` };
  }
  if (owned(state, item) + qty > MAX_STACK) return { ok: false, reason: 'So viel passt nicht ins Inventar.' };
  const unit = buyUnitPrice(entry.price ?? def.price, terms);
  const total = unit * qty;
  if (total > state.credits) return { ok: false, reason: `Nicht genug Credits (${state.credits} von ${total}).` };
  return { ok: true, item, qty, unit, total, tracked: entry.qty !== undefined };
}

/** Prüft einen Verkauf an den Händler und rechnet ihn aus, ohne etwas zu ändern. */
export function planSale(content: GameContent, state: Readonly<GameState>, shopId: ShopId, item: ItemId, qty: number, evaluate: Evaluate): TradePlan {
  const shop = shopDef(content, shopId);
  if (!shop) return { ok: false, reason: 'Unbekannter Händler.' };
  if (!validQty(qty, MAX_STACK)) return { ok: false, reason: 'Ungültige Menge.' };
  const terms = tradeTerms(content, state, shop, evaluate);
  if (terms.refused) return { ok: false, reason: terms.refused };
  if (!evaluate(shop.open)) return { ok: false, reason: `${shop.name} hat gerade geschlossen.` };
  const unit = sellUnitPrice(content, state, shop, item, evaluate, terms);
  if (unit === null) return { ok: false, reason: `${itemLabel(content, item)} kauft hier niemand.` };
  const have = owned(state, item);
  if (have < qty) return { ok: false, reason: have === 0 ? `Nicht im Inventar: ${itemLabel(content, item)}` : `Nicht genug: ${itemLabel(content, item)} (${have} von ${qty})` };
  return { ok: true, item, qty, unit, total: unit * qty, tracked: false };
}

/** Bucht einen Verkauf aus dem Tagesbestand (schreibt in den übergebenen Entwurf). */
export function recordStockSale(shops: Record<ShopId, ShopState>, shopId: ShopId, day: number, item: ItemId, qty: number): void {
  const current = has(shops, shopId) ? shops[shopId] : undefined;
  const entry: ShopState = current && current.day === day ? current : { day, sold: {} };
  entry.sold[item] = Math.min(MAX_STACK, (has(entry.sold, item) ? entry.sold[item] : 0) + qty);
  shops[shopId] = entry;
}

/** Strukturprüfung der Händler (ergänzt die Verweisprüfung in campaign/lint.ts). */
export function shopProblems(content: GameContent): string[] {
  const problems: string[] = [];
  for (const shop of Object.values(content.shops)) {
    const at = `Händler ${shop.id}`;
    if (shop.buyRate !== undefined && !(shop.buyRate >= 0 && shop.buyRate <= MAX_SELL_RATE)) problems.push(`${at}: buyRate außerhalb 0 … ${MAX_SELL_RATE}`);
    const seen = new Set<string>();
    for (const entry of shop.stock) {
      if (seen.has(entry.item) && !entry.when) problems.push(`${at}: „${entry.item}“ mehrfach ohne Bedingung im Sortiment`);
      seen.add(entry.item);
      if (entry.price !== undefined && !(Number.isFinite(entry.price) && entry.price >= 0)) problems.push(`${at}: ungültiger Preis für „${entry.item}“`);
      if (entry.qty !== undefined && !(Number.isInteger(entry.qty) && entry.qty >= 1)) problems.push(`${at}: ungültiger Tagesbestand für „${entry.item}“`);
    }
  }
  for (const item of Object.values(content.items)) {
    if (!(Number.isFinite(item.price) && item.price >= 0)) problems.push(`Gegenstand ${item.id}: ungültiger Grundpreis`);
  }
  return problems;
}
