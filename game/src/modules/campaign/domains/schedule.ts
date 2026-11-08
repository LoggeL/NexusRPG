// Domäne „Tagesablauf“: Wo ist welche Figur gerade? (design.md §3.4) Die Regeln stehen in modules/time/schedule.ts;
// diese Datei verbindet sie mit dem Spielzustand. Zuständig: Bereich relationships+time.
import type { Condition, GameContent, GameState, MapId, NpcId, NpcPresence, Point, ScheduleEntry } from '../../contracts';
import { pickScheduleEntry, presentOn, queryOf, resolveSpot, whereIs, type Whereabouts } from '../../time';
import { has } from '../ids';

type Evaluate = (condition?: Condition) => boolean;

/** Erster passender Eintrag des Tagesablaufs (Tageszeit, Wochentag, Bedingung) oder null. */
export function scheduleEntryOf(content: GameContent, state: Readonly<GameState>, npc: NpcId, evaluate: Evaluate): ScheduleEntry | null {
  return pickScheduleEntry(has(content.npcs, npc) ? content.npcs[npc].schedule : undefined, queryOf(state, evaluate));
}

/** Punkt eines Tagesablauf-Orts: Koordinate oder benannter Punkt aus MapDef.spots. */
export function resolvePlace(content: GameContent, map: MapId, at: Point | string): { at: Point; facing?: 's' | 'w' | 'e' | 'n' } | null {
  return resolveSpot(has(content.maps, map) ? content.maps[map] : undefined, at);
}

/** Alle benannten Figuren, die gerade auf `map` stehen: feste Platzierungen zuerst, dann Tagesabläufe. */
export function presentNpcsOn(content: GameContent, state: Readonly<GameState>, map: MapId, evaluate: Evaluate): NpcPresence[] {
  const present = presentOn(content, state, map, evaluate);
  // Spielt man die fertige Figur (Vex), steht ihre Weltfigur nicht zusätzlich herum (design.md §3.1b).
  const preset = state.player.preset ? content.presets?.[state.player.preset] : undefined;
  return preset?.worldNpc ? present.filter(entry => entry.npc !== preset.worldNpc) : present;
}

/** Aufenthaltsort einer Figur jetzt (Party, feste Platzierung, Tagesablauf, away, unbekannt). */
export function whereaboutsOf(content: GameContent, state: Readonly<GameState>, npc: NpcId, evaluate: Evaluate): Whereabouts {
  return whereIs(content, state, npc, evaluate);
}
