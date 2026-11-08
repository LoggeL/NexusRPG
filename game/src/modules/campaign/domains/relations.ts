// Domäne „Beziehungen und Crew“: verbindet die reinen Regeln aus modules/relationships/ (Punkte, Herzen, Rivalität,
// Ansprechen, Geschenke, Herz-Ereignisse, Crew, Romanze-Schalter; design.md §3.3) mit Spielzustand, Bedingungen,
// Effekten und Speicherformat. Zuständig: Bereich relationships+time.
import type {
  DialogueId, GameContent, GameState, GiftTaste, HeartEventDef, ItemId, NpcId, RelationState,
} from '../../contracts';
import {
  GIFT_LIMIT_TEXT, GIFT_POINTS, GIFT_TASTE_LABELS, GIFTS_PER_WEEK, MAX_PARTY, POINTS_MAX, POINTS_MIN,
  changePoints, clampPoints, collectGiftModifiers, dailyTalk, dismiss as dismissFrom, emptyRelation, findHeartEvent as findEvent,
  giftLimitOf, giftTasteFor, giftValue, heartsOf as heartsFromPoints, maxHeartsOf, nextHeartEvent, pickTalk,
  recordGift, recruit as recruitInto, reconciledPoints, rivalryOf as rivalryFromPoints, romanceStatus, talkBonusExtra,
  type GiftValue,
} from '../../relationships';
import { timeSlotOf } from '../../time';
import { has } from '../ids';
import { displayName } from '../names';
import type { ConditionContext, ConditionSpecs, EffectContext, EffectSpecs } from '../registry';
import { SAVE_LIMITS, fail, int, isKey, obj, record, uniqueList } from '../validate';

export { GIFT_POINTS, GIFT_TASTE_LABELS, GIFTS_PER_WEEK, emptyRelation };
/** Tagesbonus fürs Ansprechen (ohne Perk-Zuschlag). */
export { TALK_BONUS } from '../../relationships';

type Evaluate = ConditionContext['evaluate'];

export const relationOf = (state: Readonly<GameState>, npc: NpcId): Readonly<RelationState> =>
  has(state.relations, npc) ? state.relations[npc] : emptyRelation();

/** Beziehung im Entwurf (legt sie bei Bedarf an). */
export function relationIn(draft: GameState, npc: NpcId): RelationState {
  if (!has(draft.relations, npc)) draft.relations[npc] = emptyRelation();
  return draft.relations[npc];
}

const npcDef = (content: GameContent, npc: NpcId) => (has(content.npcs, npc) ? content.npcs[npc] : undefined);

/** Herzen 0..10 aus Punkten (optional mit Herz-Obergrenze der Figur). */
export const heartsOf = (points: number, maxHearts?: number): number => heartsFromPoints(points, maxHearts);
/** Rivalitätsstufe 2..10 unter −200 Punkten, sonst 0. */
export const rivalryOf = (points: number): number => rivalryFromPoints(points);

/** Herzen einer Figur im Zustand (berücksichtigt ihre Obergrenze). */
export const heartsWith = (content: GameContent, state: Readonly<GameState>, npc: NpcId): number =>
  heartsFromPoints(relationOf(state, npc).points, maxHeartsOf(npcDef(content, npc)));

/** Punkte ändern (begrenzt, mit Herz-Obergrenze) und Meldungen „Raven ♥ +45“ sowie Stufenwechsel erzeugen. */
export function addPoints(ctx: EffectContext, npc: NpcId, delta: number): void {
  const rel = relationIn(ctx.draft, npc);
  const change = changePoints(rel.points, delta, maxHeartsOf(npcDef(ctx.content, npc)));
  rel.points = change.after;
  const shown = Math.round(delta);
  const name = displayName(ctx.content, ctx.draft, npc);
  if (shown !== 0) ctx.messages.push(`${name} ${shown > 0 ? '♥ +' : '♥ −'}${Math.abs(shown)}`);
  if (change.heartsGained.length) {
    ctx.messages.push(`${name}: neue Herzstufe ♥${change.heartsAfter}`);
    ctx.requests.push({ sfx: 'heart-up' });
  } else if (shown < 0) {
    ctx.requests.push({ sfx: 'heart-down' });
  }
  if (change.rivalryStarted) ctx.messages.push(`Rivalität mit ${name} (Stufe ${change.rivalryAfter})`);
  else if (change.rivalryAfter > change.rivalryBefore && change.rivalryBefore > 0) ctx.messages.push(`Rivalität mit ${name}: Stufe ${change.rivalryAfter}`);
  else if (change.rivalryEnded) ctx.messages.push(`Die Rivalität mit ${name} ist vorbei.`);
}

/** Versöhnung: negative Punkte und Rivalität auf 0 (positive Punkte bleiben). */
export function reconcileIn(ctx: EffectContext, npc: NpcId): void {
  const rel = relationIn(ctx.draft, npc);
  const before = rel.points;
  rel.points = reconciledPoints(rel.points);
  if (rivalryFromPoints(before) > 0) ctx.messages.push(`Die Rivalität mit ${displayName(ctx.content, ctx.draft, npc)} ist vorbei.`);
}

export function romanceOpen(content: GameContent, state: Readonly<GameState>, npc: NpcId): boolean {
  return romanceStatus(content, npc, relationOf(state, npc).points).open;
}

// ---------------------------------------------------------------------------
// Geschenke

/** Geschmack einer Figur für einen Gegenstand (Varianten vor den Grundvorlieben, IDs vor Stichwörtern). */
export function giftTasteOf(content: GameContent, _state: Readonly<GameState>, npc: NpcId, item: ItemId, evaluate: Evaluate): GiftTaste {
  const tags = has(content.items, item) ? content.items[item].giftTags ?? [] : [];
  return giftTasteFor(npcDef(content, npc), item, tags, evaluate);
}

/** Geschenkbonus der Perks in Prozent (nur auf positive Punkte). */
export function giftBonusPercent(content: GameContent, state: Readonly<GameState>): number {
  return state.player.perks.reduce((sum, perk) => sum + (has(content.perks, perk) ? content.perks[perk].giftBonus ?? 0 : 0), 0);
}

/** Punkte eines Geschenks mit allen Boni (Perks, Geburtstag … über GIFT_BONUS_HOOKS). */
export function giftValueOf(content: GameContent, state: Readonly<GameState>, npc: NpcId, item: ItemId, evaluate: Evaluate): GiftValue {
  const taste = giftTasteOf(content, state, npc, item, evaluate);
  return giftValue(taste, collectGiftModifiers({ content, state, npc, item, taste, evaluate }));
}

/** Prüft Tages- und Wochenlimit; liefert den Grund oder null. */
export function giftBlocked(state: Readonly<GameState>, npc: NpcId): string | null {
  const limit = giftLimitOf(relationOf(state, npc), state.clock.day);
  return limit ? GIFT_LIMIT_TEXT[limit] : null;
}

/** Geschenk im Entwurf verbuchen (Zähler, Statistik, Punkte). Gegenstand entfernt der Aufrufer. */
export function recordGiftIn(ctx: EffectContext, npc: NpcId, value: GiftValue): void {
  const rel = relationIn(ctx.draft, npc);
  Object.assign(rel, recordGift(rel, ctx.draft.clock.day));
  rel.met = true;
  ctx.draft.stats.giftsGiven = Math.min(SAVE_LIMITS.counter, ctx.draft.stats.giftsGiven + 1);
  addPoints(ctx, npc, value.delta);
}

// ---------------------------------------------------------------------------
// Ansprechen

/** Tagesgespräch-Dialog: erster passender Eintrag aus NpcDef.talk. */
export function talkDialogue(content: GameContent, state: Readonly<GameState>, npc: NpcId, evaluate: Evaluate): DialogueId | null {
  return pickTalk(npcDef(content, npc)?.talk, heartsWith(content, state, npc), evaluate, id => has(content.dialogues, id));
}

/** Ansprechen: als getroffen markieren, einmal täglich +20 (+ Perk-Zuschlag; nur bei ≥ 0 Punkten). */
export function talkIn(ctx: EffectContext, npc: NpcId): void {
  const rel = relationIn(ctx.draft, npc);
  rel.met = true;
  const talk = dailyTalk(rel, ctx.draft.clock.day, talkBonusExtra(ctx.content, ctx.draft));
  if (!talk.first) return;
  rel.talkedDay = ctx.draft.clock.day;
  if (talk.delta > 0) addPoints(ctx, npc, talk.delta);
}

// ---------------------------------------------------------------------------
// Herz-Ereignisse

/** Fälliges Herz- bzw. Rivalitätsereignis beim Betreten der Karte. */
export function pendingHeartEventOf(content: GameContent, state: Readonly<GameState>, map: string, evaluate: Evaluate): HeartEventDef | null {
  return nextHeartEvent(content, {
    map,
    slot: timeSlotOf(state.clock.minutes),
    relationOf: npc => relationOf(state, npc),
    evaluate,
  })?.event ?? null;
}

export const findHeartEvent = (content: GameContent, id: string): { npc: NpcId; event: HeartEventDef } | null => findEvent(content, id);

/** Herz-Ereignis im Entwurf als gesehen eintragen (Effekte wendet der Aufrufer an). */
export function markHeartEventIn(draft: GameState, npc: NpcId, id: string): void {
  const rel = relationIn(draft, npc);
  if (!rel.events.includes(id)) rel.events.push(id);
}

// ---------------------------------------------------------------------------
// Crew

export function recruitIn(ctx: EffectContext, npc: NpcId): string | null {
  const def = npcDef(ctx.content, npc);
  const { draft } = ctx;
  const allowed = !!def?.companion && (draft.recruited.includes(npc) || ctx.evaluate(def.companion.recruit));
  const result = recruitInto(ctx.content, draft, npc, allowed);
  if (!result.ok) return result.reason;
  draft.recruited = result.crew.recruited;
  draft.party = result.crew.party;
  const name = def?.name ?? npc;
  if (result.joinedCrew) ctx.messages.push(`${name} gehört jetzt zur Crew.`);
  if (result.joinedParty) ctx.messages.push(`${name} begleitet dich.`);
  return null;
}

export function dismissIn(ctx: EffectContext, npc: NpcId): string | null {
  const def = npcDef(ctx.content, npc);
  if (!def) return `Unbekannte Figur: ${npc}`;
  const result = dismissFrom(ctx.draft, npc);
  ctx.draft.party = result.crew.party;
  if (result.left) ctx.messages.push(`${def.name} bleibt zurück.`);
  return null;
}

// ---------------------------------------------------------------------------
// Handler

/** Schlüssel in `GameState.seen`: Geschmack dieser Figur für diesen Gegenstand ist bekannt (nach einem Geschenk). */
export const giftKnowledgeKey = (npc: NpcId, item: ItemId): string => `gift:${npc}:${item}`;

/** Gegenstände, deren Wirkung bei dieser Figur bekannt ist (Reihenfolge der Entdeckung). */
export function knownGiftItems(state: Readonly<GameState>, npc: NpcId): ItemId[] {
  const prefix = `gift:${npc}:`;
  return state.seen.filter(key => key.startsWith(prefix)).map(key => key.slice(prefix.length)).filter(Boolean);
}

const npcRef = (id: string) => [{ kind: 'npcs' as const, id }];

export const relationConditions: ConditionSpecs<'hearts' | 'rival' | 'met' | 'romance' | 'companion' | 'recruited'> = {
  hearts: { test: (c, { content, state }) => heartsWith(content, state, c.hearts) >= c.min, refs: c => npcRef(c.hearts) },
  rival: { test: (c, { state }) => rivalryFromPoints(relationOf(state, c.rival).points) >= Math.max(2, c.min ?? 2), refs: c => npcRef(c.rival) },
  met: { test: (c, { state }) => relationOf(state, c.met).met, refs: c => npcRef(c.met) },
  romance: { test: (c, { content, state }) => romanceOpen(content, state, c.romance), refs: c => npcRef(c.romance) },
  companion: { test: (c, { state }) => state.party.includes(c.companion), refs: c => npcRef(c.companion) },
  recruited: { test: (c, { state }) => state.recruited.includes(c.recruited), refs: c => npcRef(c.recruited) },
};

export const relationEffects: EffectSpecs<'relation' | 'recruit' | 'dismiss' | 'reconcile'> = {
  reconcile: {
    apply(e, ctx) {
      if (!has(ctx.content.npcs, e.reconcile)) return `Unbekannte Figur: ${e.reconcile}`;
      reconcileIn(ctx, e.reconcile);
      return null;
    },
    refs: e => npcRef(e.reconcile),
  },
  relation: {
    apply(e, ctx) {
      if (!has(ctx.content.npcs, e.relation)) return `Unbekannte Figur: ${e.relation}`;
      if (!Number.isFinite(e.delta)) return 'Ungültige Beziehungsänderung.';
      addPoints(ctx, e.relation, e.delta);
      return null;
    },
    refs: e => npcRef(e.relation),
  },
  recruit: { apply: (e, ctx) => recruitIn(ctx, e.recruit), refs: e => npcRef(e.recruit) },
  dismiss: { apply: (e, ctx) => dismissIn(ctx, e.dismiss), refs: e => npcRef(e.dismiss) },
};

// ---------------------------------------------------------------------------
// Speicherformat

export function parseRelations(value: unknown, content: GameContent): Record<NpcId, RelationState> {
  return record(value, 'Beziehungen', key => has(content.npcs, key), (raw, key) => {
    const r = obj(raw, `Beziehung ${key}`);
    if (typeof r.met !== 'boolean') fail(`Ungültige Beziehung ${key}.`);
    return {
      // Nach einer gesenkten Herz-Obergrenze im Inhalt wird gekappt statt abgelehnt.
      points: clampPoints(int(r.points, POINTS_MIN, POINTS_MAX, `Punkte ${key}`), maxHeartsOf(content.npcs[key])),
      met: r.met as boolean,
      talkedDay: int(r.talkedDay, 0, SAVE_LIMITS.day, `Gesprächstag ${key}`),
      giftDay: int(r.giftDay, 0, SAVE_LIMITS.day, `Geschenktag ${key}`),
      giftWeek: int(r.giftWeek, 0, SAVE_LIMITS.day, `Geschenkwoche ${key}`),
      giftsThisWeek: int(r.giftsThisWeek, 0, GIFTS_PER_WEEK, `Geschenke ${key}`),
      events: uniqueList(r.events, 64, isKey, `Ereignisse ${key}`),
    };
  });
}

export function parseCrew(recruitedRaw: unknown, partyRaw: unknown, content: GameContent): { recruited: NpcId[]; party: NpcId[] } {
  const companion = (id: unknown) => isKey(id) && has(content.npcs, id as string) && !!content.npcs[id as string].companion;
  const recruited = uniqueList(recruitedRaw, Object.keys(content.npcs).length, companion, 'Crew');
  const party = uniqueList(partyRaw, MAX_PARTY, id => companion(id) && recruited.includes(id as string), 'Party');
  return { recruited, party };
}
