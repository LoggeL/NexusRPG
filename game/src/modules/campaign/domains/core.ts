// Domäne „Kern“ (Fundament): Flags, Inventar, Akte, Orte, Abläufe, U-Bahn, Nachrichten, Telefon.
// Zuständig: Fundament. Telefon/Nachrichten-Feinheiten darf der DOM-UI-Bereich ergänzen.
import type { GameContent, GameState, ItemId, PhoneEntry } from '../../contracts';
import { ACT_IDS, MAX_STACK, actFlag, has, isActId } from '../ids';
import type { ConditionSpecs, EffectContext, EffectSpecs, SettleHook } from '../registry';
import { SAVE_LIMITS, fail, int, isKey, isObj, isReserved, obj, uniqueList } from '../validate';

export const count = (state: Readonly<GameState>, item: ItemId): number =>
  has(state.inventory, item) ? state.inventory[item] ?? 0 : 0;

export const flagSet = (state: Readonly<GameState>, flag: string): boolean =>
  has(state.flags, flag) && state.flags[flag] === true;

export function itemName(content: GameContent, id: ItemId): string {
  return has(content.items, id) ? content.items[id].name : id;
}

const quantity = (value: number | undefined): number | null =>
  value === undefined ? 1 : Number.isInteger(value) && value >= 1 && value <= MAX_STACK ? value : null;

/** Gegenstände hinzufügen (begrenzt auf MAX_STACK). */
export function addItem(draft: GameState, item: ItemId, qty: number): void {
  draft.inventory[item] = Math.min(MAX_STACK, count(draft, item) + qty);
}

/** Gegenstände entfernen; Fehlermeldung, wenn nicht genug vorhanden. */
export function removeItem(content: GameContent, draft: GameState, item: ItemId, qty: number): string | null {
  const have = count(draft, item);
  const label = itemName(content, item);
  if (have < qty) return have === 0 ? `Nicht im Inventar: ${label}` : `Nicht genug: ${label} (${have} von ${qty})`;
  if (have === qty) delete draft.inventory[item];
  else draft.inventory[item] = have - qty;
  return null;
}

export function markSeenIn(draft: GameState, id: string): void {
  if (id && !draft.seen.includes(id) && draft.seen.length < SAVE_LIMITS.seen) draft.seen.push(id);
}

export function unlockStationIn(ctx: EffectContext, station: string): void {
  if (ctx.draft.stations.includes(station)) return;
  ctx.draft.stations.push(station);
  ctx.messages.push(`U-Bahn-Station freigeschaltet: ${ctx.content.stations[station]?.name ?? station}`);
}

export function deliverPhone(ctx: EffectContext, id: string): void {
  if (ctx.draft.phone.some(entry => entry.id === id) || ctx.draft.phone.length >= SAVE_LIMITS.phone) return;
  ctx.draft.phone.push({ id, day: ctx.draft.clock.day, read: false });
  const from = ctx.content.phone[id]?.from;
  ctx.messages.push(`Neue Nachricht${from && ctx.content.npcs[from] ? ` von ${ctx.content.npcs[from].name}` : ''}`);
  ctx.requests.push({ phone: id });
}

export const coreConditions: ConditionSpecs<
  'flag' | 'notFlag' | 'item' | 'noItem' | 'act' | 'visited' | 'seen' | 'station' | 'all' | 'any' | 'not' | 'itemsOf' | 'atLeast'
> = {
  flag: { test: (c, { state }) => flagSet(state, c.flag) },
  notFlag: { test: (c, { state }) => !flagSet(state, c.notFlag) },
  item: { test: (c, { state }) => count(state, c.item) >= (c.min ?? 1), refs: c => [{ kind: 'items', id: c.item }] },
  noItem: { test: (c, { state }) => count(state, c.noItem) <= 0, refs: c => [{ kind: 'items', id: c.noItem }] },
  act: { test: (c, { state }) => state.act >= c.act },
  visited: { test: (c, { state }) => state.visited.includes(c.visited), refs: c => [{ kind: 'maps', id: c.visited }] },
  seen: { test: (c, { state }) => state.seen.includes(c.seen) },
  station: { test: (c, { state }) => state.stations.includes(c.station), refs: c => [{ kind: 'stations', id: c.station }] },
  all: { test: (c, ctx) => Array.isArray(c.all) && c.all.every(x => ctx.evaluate(x)) },
  any: { test: (c, ctx) => Array.isArray(c.any) && c.any.some(x => ctx.evaluate(x)) },
  not: { test: (c, ctx) => !!c.not && typeof c.not === 'object' && !ctx.evaluate(c.not) },
  itemsOf: {
    test: (c, { state }) => {
      if (typeof c.itemsOf !== 'string' || !c.itemsOf) return false;
      let total = 0;
      for (const [item, qty] of Object.entries(state.inventory)) {
        if (!item.startsWith(c.itemsOf) || !(qty > 0)) continue;
        total += c.distinct ? 1 : qty;
      }
      return total >= c.min;
    },
  },
  atLeast: {
    test: (c, ctx) => {
      if (!Array.isArray(c.atLeast)) return false;
      let hits = 0;
      for (const inner of c.atLeast) if (ctx.evaluate(inner) && ++hits >= c.min) return true;
      return hits >= c.min;
    },
  },
};

export const coreEffects: EffectSpecs<
  'setFlag' | 'give' | 'take' | 'markSeen' | 'message' | 'setAct' | 'cutscene' | 'dialogue' | 'travel' | 'sfx' | 'ending'
  | 'unlockStation' | 'news' | 'phone' | 'cityMap' | 'wanted'
> = {
  setFlag: {
    apply(e, { draft }) {
      if (!isKey(e.setFlag)) return 'Ungültiges Flag.';
      if (e.value === false) delete draft.flags[e.setFlag];
      else draft.flags[e.setFlag] = true;
      return null;
    },
  },
  give: {
    apply(e, { content, draft, messages }) {
      const qty = quantity(e.qty);
      if (!has(content.items, e.give)) return `Unbekannter Gegenstand: ${e.give}`;
      if (qty === null) return `Ungültige Menge für ${itemName(content, e.give)}.`;
      addItem(draft, e.give, qty);
      messages.push(qty > 1 ? `Erhalten: ${itemName(content, e.give)} ×${qty}` : `Erhalten: ${itemName(content, e.give)}`);
      return null;
    },
    refs: e => [{ kind: 'items', id: e.give }],
  },
  take: {
    apply(e, { content, draft, messages }) {
      const qty = quantity(e.qty);
      if (!has(content.items, e.take)) return `Unbekannter Gegenstand: ${e.take}`;
      if (qty === null) return `Ungültige Menge für ${itemName(content, e.take)}.`;
      const problem = removeItem(content, draft, e.take, qty);
      if (problem) return problem;
      // Ausgerüstete Gegenstände, die abgegeben werden, legt die Figur ab.
      if (count(draft, e.take) === 0) {
        for (const [slot, item] of Object.entries(draft.player.equipment)) {
          if (item === e.take) delete draft.player.equipment[slot as keyof typeof draft.player.equipment];
        }
      }
      const label = itemName(content, e.take);
      messages.push(qty > 1 ? `Abgegeben: ${label} ×${qty}` : `Abgegeben: ${label}`);
      return null;
    },
    refs: e => [{ kind: 'items', id: e.take }],
  },
  markSeen: {
    apply(e, { draft }) {
      if (!isKey(e.markSeen)) return 'Ungültige Kennung.';
      markSeenIn(draft, e.markSeen);
      return null;
    },
  },
  message: {
    apply(e, { messages }) {
      if (typeof e.message !== 'string' || !e.message) return 'Ungültige Meldung.';
      messages.push(e.message);
      return null;
    },
  },
  setAct: {
    apply(e, { draft }) {
      if (!isActId(e.setAct)) return 'Ungültiger Akt.';
      if (e.setAct > draft.act) draft.act = e.setAct;
      for (const id of ACT_IDS) if (id <= draft.act) draft.flags[actFlag(id)] = true;
      return null;
    },
  },
  cutscene: {
    apply(e, { content, requests }) {
      if (!has(content.cutscenes, e.cutscene)) return `Unbekannte Zwischensequenz: ${e.cutscene}`;
      requests.push({ cutscene: e.cutscene });
      return null;
    },
    refs: e => [{ kind: 'cutscenes', id: e.cutscene }],
  },
  dialogue: {
    apply(e, { content, requests }) {
      if (!has(content.dialogues, e.dialogue)) return `Unbekannter Dialog: ${e.dialogue}`;
      requests.push({ dialogue: e.dialogue });
      return null;
    },
    refs: e => [{ kind: 'dialogues', id: e.dialogue }],
  },
  travel: {
    apply(e, { content, requests }) {
      if (!has(content.maps, e.travel)) return `Unbekannter Ort: ${e.travel}`;
      if (e.entry !== undefined && !has(content.maps[e.travel].entries, e.entry)) return `Unbekannter Einstieg: ${e.travel}#${e.entry}`;
      requests.push(e.entry === undefined ? { travel: e.travel } : { travel: e.travel, entry: e.entry });
      return null;
    },
    refs: e => [e.entry === undefined ? { kind: 'maps', id: e.travel } : { kind: 'entry', id: `${e.travel}#${e.entry}` }],
  },
  sfx: {
    apply(e, { requests }) {
      if (typeof e.sfx !== 'string') return 'Ungültiger Effektklang.';
      requests.push({ sfx: e.sfx });
      return null;
    },
  },
  ending: {
    apply(_e, { draft, requests }) {
      draft.ended = true;
      requests.push({ ending: true });
      return null;
    },
  },
  unlockStation: {
    apply(e, ctx) {
      if (!has(ctx.content.stations, e.unlockStation)) return `Unbekannte Station: ${e.unlockStation}`;
      unlockStationIn(ctx, e.unlockStation);
      return null;
    },
    refs: e => [{ kind: 'stations', id: e.unlockStation }],
  },
  news: {
    apply(e, { content, draft, requests }) {
      if (!has(content.news, e.news)) return `Unbekannte Sendung: ${e.news}`;
      if (!draft.news.includes(e.news)) draft.news.push(e.news);
      requests.push({ news: e.news });
      return null;
    },
    refs: e => [{ kind: 'news', id: e.news }],
  },
  phone: {
    apply(e, ctx) {
      if (!has(ctx.content.phone, e.phone)) return `Unbekannte Nachricht: ${e.phone}`;
      deliverPhone(ctx, e.phone);
      return null;
    },
    refs: e => [{ kind: 'phone', id: e.phone }],
  },  cityMap: {
    apply(_e, { requests }) {
      requests.push({ cityMap: true });
      return null;
    },
  },
  wanted: {
    apply(e, { draft, messages }) {
      if (!Number.isInteger(e.wanted) || Math.abs(e.wanted) > WANTED_MAX) return 'Ungültige Fahndungsänderung.';
      const before = wantedLevel(draft);
      const after = Math.max(0, Math.min(WANTED_MAX, before + e.wanted));
      for (let level = 1; level <= WANTED_MAX; level++) {
        if (level <= after) draft.flags[`fahndung_${level}`] = true;
        else delete draft.flags[`fahndung_${level}`];
      }
      if (after !== before) messages.push(after > before ? `Fahndung ${after} (+${after - before})` : after === 0 ? 'Fahndung aufgehoben' : `Fahndung ${after} (−${before - after})`);
      return null;
    },
  },
};

/** Höchste Fahndungsstufe 0–3 (Flags `fahndung_1` … `fahndung_3`). */
export const WANTED_MAX = 3;
export function wantedLevel(state: Readonly<GameState>): number {
  for (let level = WANTED_MAX; level >= 1; level--) if (flagSet(state, `fahndung_${level}`)) return level;
  return 0;
}

/** Nachlauf: Telefonnachrichten mit `auto`-Bedingung zustellen; Station der aktuellen Karte freischalten. */
export const coreSettle: SettleHook = (ctx) => {
  let changed = false;
  for (const message of Object.values(ctx.content.phone)) {
    if (!message.auto || ctx.draft.phone.some(entry => entry.id === message.id)) continue;
    if (!ctx.evaluate(message.auto)) continue;
    deliverPhone(ctx, message.id);
    changed = true;
  }
  const station = ctx.content.maps[ctx.draft.map]?.station;
  if (station && has(ctx.content.stations, station) && !ctx.draft.stations.includes(station)) {
    unlockStationIn(ctx, station);
    changed = true;
  }
  return changed;
};

// ---------------------------------------------------------------------------
// Speicherformat

export function parseInventory(value: unknown, content: GameContent): Record<ItemId, number> {
  const input = obj(value, 'Inventar');
  const inventory: Record<ItemId, number> = {};
  for (const [item, qty] of Object.entries(input)) {
    if (isReserved(item) || !has(content.items, item)) fail(`Unbekannter Gegenstand: ${item}`);
    const amount = int(qty, 0, MAX_STACK, `Menge ${item}`);
    if (amount > 0) inventory[item] = amount;
  }
  return inventory;
}

export function parseFlags(value: unknown): Record<string, boolean> {
  const entries = Object.entries(obj(value, 'Flags'));
  if (entries.length > SAVE_LIMITS.flags) fail('Zu viele Flags.');
  const flags: Record<string, boolean> = {};
  for (const [flag, on] of entries) {
    if (!isKey(flag) || typeof on !== 'boolean') fail('Ungültiges Flag.');
    if (on) flags[flag] = true;
  }
  return flags;
}

export function parsePhone(value: unknown, content: GameContent): PhoneEntry[] {
  if (!Array.isArray(value) || value.length > SAVE_LIMITS.phone) fail('Ungültige Telefonnachrichten.');
  const seen = new Set<string>();
  return (value as unknown[]).map((entry) => {
    if (!isObj(entry) || typeof entry.id !== 'string' || !has(content.phone, entry.id) || seen.has(entry.id)) fail('Ungültige Telefonnachricht.');
    seen.add(entry.id as string);
    const out: PhoneEntry = { id: entry.id as string, day: int(entry.day, 1, SAVE_LIMITS.day, 'Nachrichtentag'), read: entry.read === true };
    if (entry.replied !== undefined) out.replied = int(entry.replied, 0, 20, 'Antwort');
    return out;
  });
}

export const parseIdList = (value: unknown, record: object, label: string): string[] =>
  uniqueList(value, Math.max(0, Object.keys(record).length), (id) => isKey(id) && has(record, id as string), label);
