// Zufallsbegegnungen (EncounterDef.random, world.md §8.7): höchstens eine je Kartenbesuch, als sichtbare,
// umgehbare Gegnergruppe auf einem Spot der Karte. Reine Rechnung; die Erkundung legt die Gruppe an.
import type { Condition, GameContent, GameState, MapEncounterDef, MapId, Point } from '../contracts';
import { has, hashText } from '../campaign/ids';
import { timeSlotOf } from '../time';

/** ID-Präfix der erzeugten Gruppe (je Besuch eine; verschwindet nach Kontakt). */
export const RANDOM_GROUP_PREFIX = 'zufall:';

/** Mindestabstand der Gruppe zur Spielfigur und zu Einstiegen beim Betreten (Kartenpixel). */
const MIN_DISTANCE = 260;

/**
 * Würfelt beim Betreten von `map` eine Zufallsbegegnung aus (deterministisch je Spielstand, Karte, Tag und Uhrzeit –
 * Neuladen würfelt nicht neu). Begegnungen, die die Karte schon als feste Gruppe zeigt, zählen nicht.
 */
export function rollRandomEncounter(
  content: GameContent, state: Readonly<GameState>, map: MapId, evaluate: (condition?: Condition) => boolean,
): MapEncounterDef | null {
  const def = has(content.maps, map) ? content.maps[map] : undefined;
  if (!def) return null;
  const fixed = new Set((def.encounters ?? []).map(group => group.encounter));
  const slot = timeSlotOf(state.clock.minutes);
  const candidates = Object.values(content.encounters)
    .filter(enc => enc.random && enc.random.maps.includes(map) && !fixed.has(enc.id))
    .filter(enc => !enc.random!.time?.length || enc.random!.time.includes(slot))
    .filter(enc => Number.isFinite(enc.random!.chance) && enc.random!.chance > 0 && evaluate(enc.when))
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  if (!candidates.length) return null;
  const roll = (hashText(`${state.seed}:${map}:${state.clock.day}:${state.clock.minutes}`) % 10_000) / 10_000;
  let sum = 0;
  const picked = candidates.find((enc) => { sum += Math.min(1, enc.random!.chance); return roll < Math.min(1, sum); });
  if (!picked) return null;
  const at = pickSpot(def.spots ?? {}, [state.position, ...Object.values(def.entries).map(entry => entry.at)], roll);
  if (!at) return null;
  const first = picked.enemies[0]?.enemy;
  const enemy = first && has(content.enemies, first) ? content.enemies[first] : undefined;
  return {
    id: `${RANDOM_GROUP_PREFIX}${picked.id}`,
    encounter: picked.id,
    at,
    sprite: enemy?.sprite ?? (first ? `${first}-walk` : undefined),
    once: false,
  };
}

function pickSpot(spots: Record<string, { at: Point }>, avoid: readonly Point[], roll: number): Point | null {
  const free = Object.keys(spots).sort()
    .map(name => spots[name].at)
    .filter(at => avoid.every(point => Math.hypot(point[0] - at[0], point[1] - at[1]) >= MIN_DISTANCE));
  if (!free.length) return null;
  return free[Math.floor(roll * 7919) % free.length];
}
