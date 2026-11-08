// Ansicht einer Beziehung für Menüs (Beziehungsliste, Figurbogen, Telefon) – liest nur, ändert nichts.
// Nutzung in der Darstellung: `relationView(campaign.content, campaign.state(), npc)`.
import type { GameContent, GameState, HeartEventDef, NpcId, RelationState } from '../contracts';
import { maxHeartsOf } from './extras';
import { giftLimitOf, giftsLeftToday, giftsThisWeekOf, GIFTS_PER_WEEK, type GiftLimit } from './gifts';
import { upcomingHeartEvents } from './events';
import { heartLabel, heartProgress, rivalryOf, standingOf, STANDING_LABELS, type Standing } from './points';
import { romanceStatus, type RomanceStatus } from './romance';

export const emptyRelation = (): RelationState =>
  ({ points: 0, met: false, talkedDay: 0, giftDay: 0, giftWeek: 0, giftsThisWeek: 0, events: [] });

/** Beziehung aus dem Zustand (fehlend = unberührt mit 0 Punkten). */
export const relationOf = (state: Readonly<GameState>, npc: NpcId): Readonly<RelationState> =>
  Object.prototype.hasOwnProperty.call(state.relations, npc) ? state.relations[npc] : emptyRelation();

export interface RelationView {
  npc: NpcId;
  points: number;
  hearts: number;
  maxHearts: number;
  /** Fortschritt zum nächsten Herz 0..1. */
  progress: number;
  toNext: number | null;
  /** Rivalitätsstufe 0 oder 2..10. */
  rivalry: number;
  standing: Standing;
  standingLabel: string;
  /** „♥ 3/10“ bzw. „Rivalität 4“ */
  label: string;
  met: boolean;
  talkedToday: boolean;
  giftsLeftToday: number;
  giftsLeftThisWeek: number;
  giftLimit: GiftLimit | null;
  recruited: boolean;
  inParty: boolean;
  romance: RomanceStatus;
  /** Nächstes noch nicht gesehenes Ereignis (Herz bzw. Rivalität passend zur Lage). */
  nextEvent: HeartEventDef | null;
  seenEvents: number;
}

export function relationView(content: GameContent, state: Readonly<GameState>, npc: NpcId): RelationView {
  const rel = relationOf(state, npc);
  const def = Object.prototype.hasOwnProperty.call(content.npcs, npc) ? content.npcs[npc] : undefined;
  const cap = maxHeartsOf(def);
  const progress = heartProgress(rel.points, cap);
  const rivalry = rivalryOf(rel.points);
  const standing = standingOf(rel.points, cap);
  const upcoming = upcomingHeartEvents(content, npc, rel.events).filter(event => (rivalry > 0 ? event.hearts < 0 : event.hearts > 0));
  const day = state.clock.day;
  return {
    npc,
    points: rel.points,
    hearts: progress.hearts,
    maxHearts: progress.maxHearts,
    progress: progress.progress,
    toNext: progress.toNext,
    rivalry,
    standing,
    standingLabel: STANDING_LABELS[standing],
    label: heartLabel(rel.points, cap),
    met: rel.met,
    talkedToday: rel.talkedDay === day,
    giftsLeftToday: giftsLeftToday(rel, day),
    giftsLeftThisWeek: Math.max(0, GIFTS_PER_WEEK - giftsThisWeekOf(rel, day)),
    giftLimit: giftLimitOf(rel, day),
    recruited: state.recruited.includes(npc),
    inParty: state.party.includes(npc),
    romance: romanceStatus(content, npc, rel.points),
    nextEvent: upcoming[0] ?? null,
    seenEvents: rel.events.length,
  };
}

/** Alle Figuren, die die Spielfigur schon getroffen hat, nach Herzen absteigend (Rivalen zuletzt). */
export function knownRelations(content: GameContent, state: Readonly<GameState>): RelationView[] {
  return Object.keys(state.relations)
    .filter(npc => Object.prototype.hasOwnProperty.call(content.npcs, npc) && state.relations[npc].met)
    .map(npc => relationView(content, state, npc))
    .sort((a, b) => b.points - a.points);
}
