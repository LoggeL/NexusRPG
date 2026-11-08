// Geschenke (design.md §3.3, world.md §4.1): höchstens 1 pro Tag und 2 pro Woche je Figur;
// liebt +80, mag +45, neutral +20, mag nicht −20, hasst −40; Geburtstag ×3; Perks verstärken positive Geschenke.
//
// Vorlieben (`GiftPrefs`) enthalten Gegenstands-IDs oder Stichwörter mit '#' (→ `ItemDef.giftTags`).
// Reihenfolge: Varianten (`giftVariants`, erste passende mit Treffer) vor den Grundvorlieben; je Liste gehen
// Gegenstands-IDs vor Stichwörtern; bei gleicher Art gilt liebt > hasst > mag > mag nicht.
import type { Condition, GameContent, GameState, GiftPrefs, GiftTaste, ItemId, NpcDef, NpcId } from '../contracts';
import { npcExtras } from './extras';

export const GIFT_POINTS: Readonly<Record<GiftTaste, number>> = { loves: 80, likes: 45, neutral: 20, dislikes: -20, hates: -40 };
export const GIFTS_PER_DAY = 1;
export const GIFTS_PER_WEEK = 2;
export const BIRTHDAY_MULTIPLIER = 3;
export const GIFT_TASTES: readonly GiftTaste[] = ['loves', 'likes', 'neutral', 'dislikes', 'hates'];
export const GIFT_TASTE_LABELS: Readonly<Record<GiftTaste, string>> = {
  loves: 'liebt es', likes: 'mag es', neutral: 'nimmt es höflich an', dislikes: 'mag es nicht', hates: 'hasst es',
};
/** Kurzform für Listen („liebt“, „mag“ …). */
export const GIFT_TASTE_SHORT: Readonly<Record<GiftTaste, string>> = {
  loves: 'liebt', likes: 'mag', neutral: 'neutral', dislikes: 'mag nicht', hates: 'hasst',
};

type Evaluate = (condition?: Condition) => boolean;
const MATCH_ORDER: readonly Exclude<GiftTaste, 'neutral'>[] = ['loves', 'hates', 'likes', 'dislikes'];

/** Geschmack innerhalb einer Vorliebenliste oder null, wenn der Gegenstand dort nicht vorkommt. */
export function tasteIn(prefs: GiftPrefs | undefined, item: ItemId, tags: readonly string[]): Exclude<GiftTaste, 'neutral'> | null {
  if (!prefs) return null;
  for (const taste of MATCH_ORDER) if (prefs[taste]?.includes(item)) return taste;
  for (const taste of MATCH_ORDER) {
    if (prefs[taste]?.some(entry => entry.startsWith('#') && tags.includes(entry.slice(1)))) return taste;
  }
  return null;
}

/** Geschmack einer Figur für einen Gegenstand. */
export function giftTasteFor(def: NpcDef | undefined, item: ItemId, tags: readonly string[], evaluate: Evaluate): GiftTaste {
  for (const variant of def?.giftVariants ?? []) {
    if (!evaluate(variant.when)) continue;
    const taste = tasteIn(variant.gifts, item, tags);
    if (taste) return taste;
  }
  return tasteIn(def?.gifts, item, tags) ?? 'neutral';
}

// ---------------------------------------------------------------------------
// Tages- und Wochenlimit

export interface GiftCounters { giftDay: number; giftWeek: number; giftsThisWeek: number }
export type GiftLimit = 'day' | 'week';
export const GIFT_LIMIT_TEXT: Readonly<Record<GiftLimit, string>> = {
  day: 'Heute gab es schon ein Geschenk.',
  week: 'Diese Woche gab es schon zwei Geschenke.',
};

const weekOfDay = (day: number): number => Math.floor((Math.max(1, Math.floor(day)) - 1) / 7);

/** Geschenke dieser Woche (alte Wochen zählen nicht). */
export const giftsThisWeekOf = (rel: Readonly<GiftCounters>, day: number): number =>
  rel.giftWeek === weekOfDay(day) ? rel.giftsThisWeek : 0;

/** Welches Limit greift heute? null = Geschenk möglich. */
export function giftLimitOf(rel: Readonly<GiftCounters>, day: number): GiftLimit | null {
  if (rel.giftDay === day) return 'day';
  if (giftsThisWeekOf(rel, day) >= GIFTS_PER_WEEK) return 'week';
  return null;
}

/** Wie viele Geschenke heute noch gehen (0 oder 1). */
export const giftsLeftToday = (rel: Readonly<GiftCounters>, day: number): number =>
  giftLimitOf(rel, day) ? 0 : Math.min(GIFTS_PER_DAY, GIFTS_PER_WEEK - giftsThisWeekOf(rel, day));

/** Zähler nach einem Geschenk an `day`. */
export function recordGift(rel: Readonly<GiftCounters>, day: number): GiftCounters {
  const week = weekOfDay(day);
  const before = rel.giftWeek === week ? rel.giftsThisWeek : 0;
  return { giftDay: day, giftWeek: week, giftsThisWeek: Math.min(GIFTS_PER_WEEK, before + 1) };
}

// ---------------------------------------------------------------------------
// Boni (Hook): Perks, Geburtstag; weitere Quellen hängen weitere Hooks an `GIFT_BONUS_HOOKS` an.

export interface GiftModifier {
  /** Herkunft, z. B. 'perk:charmant' oder 'geburtstag'. */
  source: string;
  /** Anzeige, z. B. „Charmant +50 %“. */
  label: string;
  /** Prozent auf positive Grundpunkte. */
  percent?: number;
  /** Feste Zusatzpunkte auf positive Geschenke. */
  flat?: number;
  /** Faktor auf das Ergebnis (positiv wie negativ), z. B. Geburtstag ×3. */
  multiplier?: number;
}

export interface GiftHookInput {
  content: GameContent;
  state: Readonly<GameState>;
  npc: NpcId;
  item: ItemId;
  taste: GiftTaste;
  evaluate: Evaluate;
}

export type GiftBonusHook = (input: GiftHookInput) => GiftModifier | readonly GiftModifier[] | null;

/** Perks mit `giftBonus` (Prozent auf positive Geschenkpunkte). */
export const perkGiftBonus: GiftBonusHook = ({ content, state }) => {
  const out: GiftModifier[] = [];
  for (const perk of state.player.perks) {
    const def = Object.prototype.hasOwnProperty.call(content.perks, perk) ? content.perks[perk] : undefined;
    if (def?.giftBonus && Number.isFinite(def.giftBonus)) {
      out.push({ source: `perk:${def.id}`, label: `${def.name} +${def.giftBonus} %`, percent: def.giftBonus });
    }
  }
  return out;
};

/** Geburtstag der Figur: alles zählt dreifach. */
export const birthdayGiftBonus: GiftBonusHook = ({ content, npc, evaluate }) => {
  const def = Object.prototype.hasOwnProperty.call(content.npcs, npc) ? content.npcs[npc] : undefined;
  const birthday = npcExtras(def).birthday;
  return birthday && evaluate(birthday) ? { source: 'geburtstag', label: `Geburtstag ×${BIRTHDAY_MULTIPLIER}`, multiplier: BIRTHDAY_MULTIPLIER } : null;
};

/** Standard-Hooks in Anwendungsreihenfolge (additiv erweiterbar). */
export const GIFT_BONUS_HOOKS: readonly GiftBonusHook[] = [perkGiftBonus, birthdayGiftBonus];

export function collectGiftModifiers(input: GiftHookInput, hooks: readonly GiftBonusHook[] = GIFT_BONUS_HOOKS): GiftModifier[] {
  const out: GiftModifier[] = [];
  for (const hook of hooks) {
    const result = hook(input);
    if (!result) continue;
    for (const modifier of Array.isArray(result) ? result : [result as GiftModifier]) out.push(modifier);
  }
  return out;
}

export interface GiftValue {
  taste: GiftTaste;
  base: number;
  /** Endgültige Punkte. */
  delta: number;
  modifiers: GiftModifier[];
}

/**
 * Punkte eines Geschenks: Grundwert; bei positivem Grundwert + Prozent- und Festboni; danach alle Faktoren.
 * Negative Geschenke werden von Perks nicht gemildert, am Geburtstag aber ebenfalls verdreifacht.
 */
export function giftValue(taste: GiftTaste, modifiers: readonly GiftModifier[] = []): GiftValue {
  const base = GIFT_POINTS[taste];
  let value = base;
  if (base > 0) {
    const percent = modifiers.reduce((sum, m) => sum + (Number.isFinite(m.percent) ? (m.percent as number) : 0), 0);
    const flat = modifiers.reduce((sum, m) => sum + (Number.isFinite(m.flat) ? (m.flat as number) : 0), 0);
    value = Math.max(0, base * (1 + percent / 100) + flat);
  }
  for (const m of modifiers) if (Number.isFinite(m.multiplier) && (m.multiplier as number) >= 0) value *= m.multiplier as number;
  return { taste, base, delta: Math.round(value), modifiers: [...modifiers] };
}

/** Häufige Inhaltsfehler in Vorlieben (für die Inhaltsprüfung). */
export function giftPrefsProblems(prefs: GiftPrefs | undefined): string[] {
  if (!prefs) return [];
  const seen = new Map<string, GiftTaste>();
  const problems: string[] = [];
  for (const taste of ['loves', 'likes', 'dislikes', 'hates'] as const) {
    for (const entry of prefs[taste] ?? []) {
      if (entry === '#' || entry.length === 0) problems.push(`leerer Eintrag in ${GIFT_TASTE_SHORT[taste]}`);
      const before = seen.get(entry);
      if (before && before !== taste) problems.push(`„${entry}“ steht unter ${GIFT_TASTE_SHORT[before]} und ${GIFT_TASTE_SHORT[taste]}`);
      else if (before) problems.push(`„${entry}“ doppelt unter ${GIFT_TASTE_SHORT[taste]}`);
      seen.set(entry, taste);
    }
  }
  return problems;
}
