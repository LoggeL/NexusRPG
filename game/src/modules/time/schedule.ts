// Tagesablauf-Auflösung: Wo steht Figur X jetzt? (design.md §3.4)
//
// Reihenfolge der Quellen je Figur:
// 1. In der Party: Die Figur folgt der Spielfigur und steht nirgends herum.
// 2. Feste Platzierungen (`MapDef.npcs`) mit erfüllter Bedingung: Story-Überschreibungen. Ist eine aktiv, gilt der
//    Tagesablauf nicht – die Figur steht nie gleichzeitig an zwei Orten (außer an mehreren festen Plätzen, die der
//    Inhalt ausdrücklich gleichzeitig freigibt).
// 3. Tagesablauf (`NpcDef.schedule`): erster passender Eintrag nach Tageszeit, Wochentag und Bedingung gewinnt;
//    Sonderfälle (Quest, Akt, Wochentag) stehen deshalb vorn. `away` = nicht in der Stadt sichtbar.
import type {
  ClockState, Condition, Facing, GameContent, MapDef, MapId, NpcId, NpcPlacement, NpcPresence, Point, ScheduleEntry,
  TimeSlot, Weekday,
} from '../contracts';
import { TIME_SLOTS, WEEKDAYS, isTimeSlot, isWeekday, timeSlotOf, weekdayOf } from './clock';

export type Evaluate = (condition?: Condition) => boolean;

/** Ausschnitt des Spielzustands, den die Auflösung braucht (GameState erfüllt ihn). */
export interface ScheduleState {
  readonly clock: Readonly<ClockState>;
  readonly party: readonly NpcId[];
}

export interface ScheduleQuery {
  slot: TimeSlot;
  weekday: Weekday;
  evaluate: Evaluate;
}

const own = (record: object | undefined, key: string): boolean =>
  !!record && typeof key === 'string' && Object.prototype.hasOwnProperty.call(record, key);
const listOf = <T>(value: T | readonly T[]): readonly T[] => (Array.isArray(value) ? value : [value as T]);

export const queryOf = (state: ScheduleState, evaluate: Evaluate): ScheduleQuery =>
  ({ slot: timeSlotOf(state.clock.minutes), weekday: weekdayOf(state.clock.day), evaluate });

/** Passt ein Eintrag zu Tageszeit, Wochentag und Bedingung? Fehlende Angaben gelten immer. */
export function entryMatches(entry: ScheduleEntry, query: ScheduleQuery): boolean {
  if (entry.slot !== undefined && !listOf(entry.slot).includes(query.slot)) return false;
  if (entry.days?.length && !entry.days.includes(query.weekday)) return false;
  return query.evaluate(entry.when);
}

/** Erster passender Eintrag oder null. */
export function pickScheduleEntry(entries: readonly ScheduleEntry[] | undefined, query: ScheduleQuery): ScheduleEntry | null {
  for (const entry of entries ?? []) if (entryMatches(entry, query)) return entry;
  return null;
}

/** Punkt eines Orts: Koordinate oder benannter Punkt aus `MapDef.spots`; unbekannter Name → null. */
export function resolveSpot(map: MapDef | undefined, at: Point | string): { at: Point; facing?: Facing } | null {
  if (typeof at !== 'string') return Array.isArray(at) && at.length === 2 ? { at } : null;
  const spot = map?.spots && own(map.spots, at) ? map.spots[at] : undefined;
  return spot ? (spot.facing ? { at: spot.at, facing: spot.facing } : { at: spot.at }) : null;
}

// ---------------------------------------------------------------------------
// Feste Platzierungen je Figur (zwischengespeichert je Inhalt)

interface PlacementRef { map: MapId; placement: NpcPlacement }
const placementCache = new WeakMap<GameContent, Map<NpcId, PlacementRef[]>>();

function placementsByNpc(content: GameContent): Map<NpcId, PlacementRef[]> {
  let index = placementCache.get(content);
  if (!index) {
    index = new Map();
    for (const map of Object.values(content.maps)) {
      for (const placement of map.npcs ?? []) {
        const list = index.get(placement.npc) ?? [];
        list.push({ map: map.id, placement });
        index.set(placement.npc, list);
      }
    }
    placementCache.set(content, index);
  }
  return index;
}

const placementActive = (placement: NpcPlacement, evaluate: Evaluate): boolean =>
  evaluate(placement.when) && !(placement.hideWhen && evaluate(placement.hideWhen));

/** Aktive feste Platzierungen einer Figur (in Kartenreihenfolge). */
export function activePlacements(content: GameContent, npc: NpcId, evaluate: Evaluate): PlacementRef[] {
  return (placementsByNpc(content).get(npc) ?? []).filter(ref => placementActive(ref.placement, evaluate));
}

// ---------------------------------------------------------------------------
// Aufenthaltsort

export type Whereabouts =
  | { kind: 'map'; presence: NpcPresence }
  /** Tagesablauf sagt `away` (nicht in der Stadt sichtbar). */
  | { kind: 'away' }
  /** Begleitet die Spielfigur. */
  | { kind: 'party' }
  /** Kein passender Eintrag (oder unbekannter Punkt): nirgends. */
  | { kind: 'unknown' };

function presenceFromPlacement(map: MapId, placement: NpcPlacement): NpcPresence {
  const presence: NpcPresence = { npc: placement.npc, map, at: placement.at, facing: placement.facing ?? 's', source: placement.id };
  if (placement.dialogue) presence.dialogue = placement.dialogue;
  if (placement.patrol) presence.patrol = placement.patrol;
  if (placement.pose) presence.pose = placement.pose;
  return presence;
}

function presenceFromSchedule(content: GameContent, npc: NpcId, entry: ScheduleEntry): NpcPresence | null {
  if (entry.place === 'away') return null;
  const map = own(content.maps, entry.place.map) ? content.maps[entry.place.map] : undefined;
  if (!map) return null;
  const point = resolveSpot(map, entry.place.at);
  if (!point) return null;
  const presence: NpcPresence = { npc, map: map.id, at: point.at, facing: entry.place.facing ?? point.facing ?? 's', source: 'schedule' };
  if (entry.dialogue) presence.dialogue = entry.dialogue;
  if (entry.patrol) presence.patrol = entry.patrol;
  if (entry.pose) presence.pose = entry.pose;
  return presence;
}

/** Wo ist die Figur laut Tagesablauf zu dieser Tageszeit und an diesem Wochentag (ohne Party und Platzierungen)? */
export function scheduleAt(content: GameContent, npc: NpcId, query: ScheduleQuery): Whereabouts {
  const def = own(content.npcs, npc) ? content.npcs[npc] : undefined;
  const entry = pickScheduleEntry(def?.schedule, query);
  if (!entry) return { kind: 'unknown' };
  if (entry.place === 'away') return { kind: 'away' };
  const presence = presenceFromSchedule(content, npc, entry);
  return presence ? { kind: 'map', presence } : { kind: 'unknown' };
}

/** Wo ist die Figur jetzt? */
export function whereIs(content: GameContent, state: ScheduleState, npc: NpcId, evaluate: Evaluate): Whereabouts {
  if (!own(content.npcs, npc)) return { kind: 'unknown' };
  if (state.party.includes(npc)) return { kind: 'party' };
  const placed = activePlacements(content, npc, evaluate)[0];
  if (placed) return { kind: 'map', presence: presenceFromPlacement(placed.map, placed.placement) };
  return scheduleAt(content, npc, queryOf(state, evaluate));
}

/** Alle benannten Figuren, die gerade auf `map` stehen: feste Platzierungen zuerst, dann Tagesabläufe. */
export function presentOn(content: GameContent, state: ScheduleState, map: MapId, evaluate: Evaluate): NpcPresence[] {
  const def = own(content.maps, map) ? content.maps[map] : undefined;
  if (!def) return [];
  const out: NpcPresence[] = [];
  const shown = new Set<NpcId>();
  for (const placement of def.npcs ?? []) {
    if (!own(content.npcs, placement.npc) || state.party.includes(placement.npc)) continue;
    if (shown.has(placement.npc) || !placementActive(placement, evaluate)) continue;
    shown.add(placement.npc);
    out.push(presenceFromPlacement(map, placement));
  }
  const query = queryOf(state, evaluate);
  for (const npc of Object.values(content.npcs)) {
    if (shown.has(npc.id) || !npc.schedule?.length || state.party.includes(npc.id)) continue;
    // Eine aktive feste Platzierung auf einer anderen Karte geht dem Tagesablauf vor.
    if (activePlacements(content, npc.id, evaluate).length) continue;
    const entry = pickScheduleEntry(npc.schedule, query);
    if (!entry || entry.place === 'away' || entry.place.map !== map) continue;
    const presence = presenceFromSchedule(content, npc.id, entry);
    if (presence) out.push(presence);
  }
  return out;
}

/** Ort je Wochentag und Tageszeit für Übersichten („Wo finde ich Raven?“). */
export type PlanCell = { map: MapId; spot: Point | string } | 'away' | null;
export type WeekPlan = Record<Weekday, Record<TimeSlot, PlanCell>>;

/**
 * Wochenplan einer Figur aus dem Tagesablauf. Bedingungen werden gegen den aktuellen Zustand ausgewertet;
 * Zeitbedingungen (`time`, `weekday`) in `when` sind deshalb nur für den aktuellen Zeitpunkt aussagekräftig –
 * Inhalte sollen dafür `slot`/`days` verwenden.
 */
export function weekPlan(content: GameContent, npc: NpcId, evaluate: Evaluate): WeekPlan {
  const def = own(content.npcs, npc) ? content.npcs[npc] : undefined;
  const plan = {} as WeekPlan;
  for (const weekday of WEEKDAYS) {
    plan[weekday] = {} as Record<TimeSlot, PlanCell>;
    for (const slot of TIME_SLOTS) {
      const entry = pickScheduleEntry(def?.schedule, { slot, weekday, evaluate });
      plan[weekday][slot] = !entry ? null : entry.place === 'away' ? 'away' : { map: entry.place.map, spot: entry.place.at };
    }
  }
  return plan;
}

/** Strukturfehler in Tagesabläufen (für die Inhaltsprüfung); Verweise prüft campaign/lint.ts. */
export function scheduleProblems(content: GameContent): string[] {
  const problems: string[] = [];
  for (const npc of Object.values(content.npcs)) {
    (npc.schedule ?? []).forEach((entry, index) => {
      const where = `Figur ${npc.id} Tagesablauf #${index + 1}`;
      if (entry.slot !== undefined && !listOf(entry.slot).every(isTimeSlot)) problems.push(`${where}: unbekannte Tageszeit`);
      if (entry.slot !== undefined && listOf(entry.slot).length === 0) problems.push(`${where}: leere Tageszeitliste`);
      if (entry.days !== undefined && !entry.days.every(isWeekday)) problems.push(`${where}: unbekannter Wochentag`);
    });
    const list = npc.schedule ?? [];
    const catchAll = list.findIndex(entry => entry.slot === undefined && !entry.days?.length && entry.when === undefined);
    if (catchAll >= 0 && catchAll < list.length - 1) {
      problems.push(`Figur ${npc.id} Tagesablauf #${catchAll + 1}: Eintrag ohne Einschränkung verdeckt alle folgenden`);
    }
  }
  return problems;
}
