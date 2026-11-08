// Herz- und Rivalitätsereignisse (design.md §3.3, world.md §4.1).
//
// Herz-Ereignisse bei 2/4/6/8/10 Herzen, Rivalitätsereignisse bei Stufe 2/5/8 (`hearts: -2 | -5 | -8`).
// Auslöser: Betreten der Karte `map`, optional zur Tageszeit `time` und mit Bedingung `when`; jedes Ereignis genau
// einmal (gesehen-Liste `RelationState.events`). Fällig sind mehrere? Dann zuerst das niedrigste (2 vor 4), bei
// Gleichstand in Inhaltsreihenfolge – Geschichten laufen so in der vorgesehenen Abfolge.
import type { Condition, GameContent, HeartEventDef, HeartEventId, MapId, NpcId, RelationState, TimeSlot } from '../contracts';
import { maxHeartsOf } from './extras';
import { heartCap, heartsOf, rivalryOf } from './points';

export const HEART_EVENT_LEVELS: readonly number[] = [2, 4, 6, 8, 10];
export const RIVAL_EVENT_LEVELS: readonly number[] = [-2, -5, -8];

const own = (record: object, key: string): boolean => Object.prototype.hasOwnProperty.call(record, key);
const listOf = <T>(value: T | readonly T[]): readonly T[] => (Array.isArray(value) ? value : [value as T]);

export const isRivalEvent = (event: HeartEventDef): boolean => event.hearts < 0;

/** Ist die nötige Herz- bzw. Rivalitätsstufe erreicht? */
export function eventReached(event: HeartEventDef, points: number, maxHearts?: number): boolean {
  if (!Number.isFinite(event.hearts) || event.hearts === 0) return false;
  return event.hearts > 0 ? heartsOf(points, maxHearts) >= event.hearts : rivalryOf(points) >= -event.hearts;
}

/** Passt die Tageszeit? (ohne Angabe immer) */
export const eventTimeMatches = (event: HeartEventDef, slot: TimeSlot): boolean =>
  event.time === undefined || listOf(event.time).includes(slot);

export interface HeartEventQuery {
  map: MapId;
  slot: TimeSlot;
  relationOf(npc: NpcId): Readonly<Pick<RelationState, 'points' | 'events'>>;
  evaluate(condition?: Condition): boolean;
}

export interface HeartEventCandidate { npc: NpcId; event: HeartEventDef }

/** Alle jetzt auf dieser Karte fälligen Ereignisse, in Auslösereihenfolge. */
export function dueHeartEvents(content: GameContent, query: HeartEventQuery): HeartEventCandidate[] {
  const due: { npc: NpcId; event: HeartEventDef; order: number }[] = [];
  let order = 0;
  for (const npc of Object.values(content.npcs)) {
    const rel = query.relationOf(npc.id);
    const cap = maxHeartsOf(npc);
    for (const event of npc.heartEvents ?? []) {
      order++;
      if (event.map !== query.map || rel.events.includes(event.id)) continue;
      if (!eventReached(event, rel.points, cap) || !eventTimeMatches(event, query.slot)) continue;
      if (!query.evaluate(event.when)) continue;
      due.push({ npc: npc.id, event, order });
    }
  }
  due.sort((a, b) => Math.abs(a.event.hearts) - Math.abs(b.event.hearts) || a.order - b.order);
  return due.map(({ npc, event }) => ({ npc, event }));
}

/** Nächstes fälliges Ereignis oder null. */
export const nextHeartEvent = (content: GameContent, query: HeartEventQuery): HeartEventCandidate | null =>
  dueHeartEvents(content, query)[0] ?? null;

/** Ereignis samt Figur zu einer ID. */
export function findHeartEvent(content: GameContent, id: HeartEventId): HeartEventCandidate | null {
  for (const npc of Object.values(content.npcs)) {
    const event = npc.heartEvents?.find(entry => entry.id === id);
    if (event) return { npc: npc.id, event };
  }
  return null;
}

/** Noch offene Ereignisse einer Figur (für Beziehungsanzeigen: „Nächstes Ereignis bei ♥4“). */
export function upcomingHeartEvents(content: GameContent, npc: NpcId, seen: readonly HeartEventId[]): HeartEventDef[] {
  const def = own(content.npcs, npc) ? content.npcs[npc] : undefined;
  return (def?.heartEvents ?? []).filter(event => !seen.includes(event.id)).sort((a, b) => Math.abs(a.hearts) - Math.abs(b.hearts));
}

/** Strukturfehler in Herz-Ereignissen (für die Inhaltsprüfung); Verweise prüft campaign/lint.ts. */
export function heartEventProblems(content: GameContent): string[] {
  const problems: string[] = [];
  const ids = new Map<string, NpcId>();
  for (const npc of Object.values(content.npcs)) {
    const cap = heartCap(maxHeartsOf(npc));
    for (const event of npc.heartEvents ?? []) {
      const where = `Figur ${npc.id} Herz-Ereignis ${event.id}`;
      const owner = ids.get(event.id);
      if (owner) problems.push(`${where}: ID schon bei ${owner} vergeben`);
      ids.set(event.id, npc.id);
      if (!Number.isInteger(event.hearts) || event.hearts === 0 || event.hearts > cap || event.hearts < -10 || event.hearts === -1) {
        problems.push(`${where}: ungültige Stufe ${event.hearts} (erlaubt 1…${cap} bzw. −2…−10)`);
      }
      if (event.time !== undefined && !listOf(event.time).every(slot => ['morgen', 'tag', 'abend', 'nacht'].includes(slot))) {
        problems.push(`${where}: unbekannte Tageszeit`);
      }
    }
  }
  return problems;
}
