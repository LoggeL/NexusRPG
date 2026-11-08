// Nachrichten und Telefon (design.md §3.8, world.md 10.5): welche Sendung gerade läuft und welche Telefonnachricht
// fällig ist – abhängig vom Fortschritt. Reine Rechnungen; Zustellung und „gesehen“ schreibt die Kampagne
// (Effekte `news`/`phone`, Nachlauf in campaign/domains/core.ts, `markSeen('news:<id>')` beim Ansehen).
// Zuständig: Bereich quests+economy.
//
// Regeln
// - Eine Sendung läuft, wenn ihre Bedingung `when` gilt (ohne Bedingung immer) oder sie per Effekt `news`
//   freigeschaltet wurde (`GameState.news`).
// - Hauptmeldung: noch nicht gesehene vor gesehenen, dann höhere `priority`, dann die spätere im Inhalt
//   (Fortschrittsmeldungen stehen weiter hinten). Gesehen = `seen` enthält `news:<id>`.
// - Kurzmeldungen: bis zu zwei weitere laufende Sendungen, täglich wechselnd (deterministisch aus Startwert und Tag),
//   ungesehene zuerst.
import { has, hashText, seededRandom } from '../campaign/ids';
import type { Condition, GameContent, GameState, NewsDef, NewsId, NpcId, PhoneMessageDef, PhoneMessageId } from '../contracts';

export type Evaluate = (condition?: Condition) => boolean;

/** Kennung in `GameState.seen` für eine angesehene Sendung (so schreibt sie der Director). */
export const newsSeenKey = (id: NewsId): string => `news:${id}`;
export const DEFAULT_SHORT_NEWS = 2;

export interface NewsFilter {
  /** Nur Sendungen dieser Sprecher (z. B. NX-1 mit Collin und Delya, Radio Rost mit Opa Funk). */
  anchors?: readonly NpcId[];
  /** Anzahl Kurzmeldungen (Standard 2). */
  shorts?: number;
}

export interface NewsBulletin {
  main: NewsDef | null;
  shorts: NewsDef[];
  /** Hauptmeldung noch nicht gesehen. */
  fresh: boolean;
}

const seenNews = (state: Readonly<GameState>, id: NewsId): boolean => state.seen.includes(newsSeenKey(id));

/** Läuft diese Sendung gerade? */
export function newsAvailable(state: Readonly<GameState>, news: NewsDef, evaluate: Evaluate): boolean {
  return state.news.includes(news.id) || evaluate(news.when);
}

/** Laufende Sendungen in Inhaltsreihenfolge (optional nach Sprechern gefiltert). */
export function availableNews(content: GameContent, state: Readonly<GameState>, evaluate: Evaluate, filter: NewsFilter = {}): NewsDef[] {
  return Object.values(content.news).filter(news =>
    (!filter.anchors || filter.anchors.includes(news.anchor)) && newsAvailable(state, news, evaluate));
}

/** Rangfolge für die Hauptmeldung (größer = wichtiger). */
function rankNews(state: Readonly<GameState>, list: NewsDef[]): NewsDef[] {
  return list
    .map((news, index) => ({ news, index, fresh: !seenNews(state, news.id), priority: news.priority ?? 0 }))
    .sort((a, b) => Number(b.fresh) - Number(a.fresh) || b.priority - a.priority || b.index - a.index)
    .map(entry => entry.news);
}

/** Hauptmeldung plus Kurzmeldungen der aktuellen Sendung. */
export function newsBulletin(content: GameContent, state: Readonly<GameState>, evaluate: Evaluate, filter: NewsFilter = {}): NewsBulletin {
  const ranked = rankNews(state, availableNews(content, state, evaluate, filter));
  const main = ranked[0] ?? null;
  const count = Math.max(0, Math.floor(filter.shorts ?? DEFAULT_SHORT_NEWS));
  const rest = ranked.slice(1);
  const random = seededRandom(hashText(`${state.seed}:${state.clock.day}:news`));
  const rolled = rest.map(news => ({ news, fresh: !seenNews(state, news.id), roll: random() }));
  rolled.sort((a, b) => Number(b.fresh) - Number(a.fresh) || a.roll - b.roll);
  return { main, shorts: rolled.slice(0, count).map(entry => entry.news), fresh: main !== null && !seenNews(state, main.id) };
}

/** Hauptmeldung (Vertragsmethode `CampaignPort.currentNews`). */
export const currentNews = (content: GameContent, state: Readonly<GameState>, evaluate: Evaluate, filter: NewsFilter = {}): NewsDef | null =>
  newsBulletin(content, state, evaluate, filter).main;

/** Anzahl laufender, noch nicht gesehener Sendungen (Hinweis „Neu“ am Bildschirm). */
export const unseenNewsCount = (content: GameContent, state: Readonly<GameState>, evaluate: Evaluate, filter: NewsFilter = {}): number =>
  availableNews(content, state, evaluate, filter).filter(news => !seenNews(state, news.id)).length;

// ---------------------------------------------------------------------------
// Telefon

/** Fällige Telefonnachrichten: `auto` erfüllt und noch nicht zugestellt (Inhaltsreihenfolge). */
export function duePhoneMessages(content: GameContent, state: Readonly<GameState>, evaluate: Evaluate): PhoneMessageDef[] {
  const delivered = new Set(state.phone.map(entry => entry.id));
  return Object.values(content.phone).filter(message => message.auto !== undefined && !delivered.has(message.id) && evaluate(message.auto));
}

export interface PhoneInboxEntry {
  id: PhoneMessageId;
  from: NpcId;
  text: string;
  day: number;
  read: boolean;
  /** Gewählte Antwort (Text), falls beantwortet. */
  reply?: string;
  /** Antwortmöglichkeiten, solange noch nicht geantwortet wurde. */
  replies: string[];
}

/** Posteingang, neueste zuerst (Namen löst die Darstellung über `displayName` auf). */
export function phoneInbox(content: GameContent, state: Readonly<GameState>): PhoneInboxEntry[] {
  const out: PhoneInboxEntry[] = [];
  for (const entry of [...state.phone].reverse()) {
    if (!has(content.phone, entry.id)) continue;
    const def = content.phone[entry.id];
    const view: PhoneInboxEntry = {
      id: entry.id, from: def.from, text: def.text, day: entry.day, read: entry.read,
      replies: entry.replied === undefined ? (def.replies ?? []).map(reply => reply.text) : [],
    };
    const chosen = entry.replied !== undefined ? def.replies?.[entry.replied] : undefined;
    if (chosen) view.reply = chosen.text;
    out.push(view);
  }
  return out;
}

export const unreadPhoneCount = (state: Readonly<GameState>): number => state.phone.filter(entry => !entry.read).length;
