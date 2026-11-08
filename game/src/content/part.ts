// Inhaltsteile: Jede Datei unter content/parts/** exportiert `export const part: ContentPart = { … }`.
// scripts/gen_content_parts.mjs sammelt sie in content/parts/index.ts (erzeugt, nicht von Hand ändern).
// So arbeiten mehrere Autoren parallel an eigenen Dateien; doppelte IDs fallen beim Zusammenführen auf.
import type {
  GameContent, HotspotDef, LightDef, MapDef, MapEncounterDef, MapId, NpcPlacement, Point,
} from '../modules/contracts';

/** Ort auf einer fremden Karte: Kartenpixel oder Name eines Spots dieser Karte (`MapDef.spots`). */
export type At = Point | string;

/**
 * Ergänzungen für Karten, die ein anderer Teil besitzt (Quest-Hotspots, feste Figuren, Begegnungen, onEnter).
 * `at` darf ein Spot-Name sein; fehlt der Spot, landet das Element am ersten Einstieg und es gibt eine Warnung.
 */
export interface MapAddition {
  hotspots?: (Omit<HotspotDef, 'at'> & { at: At })[];
  npcs?: (Omit<NpcPlacement, 'at'> & { at: At })[];
  encounters?: (Omit<MapEncounterDef, 'at'> & { at: At })[];
  onEnter?: NonNullable<MapDef['onEnter']>;
  lights?: LightDef[];
}

type RecordKey =
  | 'maps' | 'districts' | 'stations' | 'dialogues' | 'cutscenes' | 'items' | 'npcs' | 'checks' | 'perks'
  | 'cyberware' | 'origins' | 'looks' | 'factions' | 'quests' | 'jobs' | 'jobBoards' | 'shops' | 'encounters'
  | 'arenas' | 'enemies' | 'abilities' | 'news' | 'phone';

export type ContentPart = { [K in RecordKey]?: NonNullable<GameContent[K]> } & {
  /** Ergänzungen fremder Karten, Schlüssel = Karten-ID. */
  mapAdditions?: Record<MapId, MapAddition>;
};

/** Warnungen beim Zusammenführen (fehlende Karten/Spots, doppelte Element-IDs); content.test.ts zeigt sie. */
export const PART_WARNINGS: string[] = [];

export const PART_KEYS: readonly RecordKey[] = [
  'maps', 'districts', 'stations', 'dialogues', 'cutscenes', 'items', 'npcs', 'checks', 'perks',
  'cyberware', 'origins', 'looks', 'factions', 'quests', 'jobs', 'jobBoards', 'shops', 'encounters',
  'arenas', 'enemies', 'abilities', 'news', 'phone',
];

/** Führt Teile in den Grundinhalt zusammen; doppelte IDs (auch gegen den Grundinhalt) landen in PART_WARNINGS. */
export function mergeParts(base: GameContent, parts: readonly (readonly [string, ContentPart])[]): GameContent {
  const out: Record<string, unknown> = { ...base };
  const owner = new Map<string, string>();
  for (const key of PART_KEYS) {
    const target: Record<string, unknown> = { ...((base as unknown as Record<string, Record<string, unknown>>)[key] ?? {}) };
    for (const id of Object.keys(target)) owner.set(`${key}:${id}`, 'Grundinhalt');
    for (const [file, part] of parts) {
      const add = part[key] as Record<string, unknown> | undefined;
      if (!add) continue;
      for (const [id, value] of Object.entries(add)) {
        const k = `${key}:${id}`;
        const prev = owner.get(k);
        // Spätere Teile gewinnen (Testinhalt liegt in parts/_test und kommt zuerst); doppelte IDs sind eine Warnung.
        if (prev) PART_WARNINGS.push(`${file}: ${key}.${id} überschreibt ${prev}`);
        owner.set(k, file);
        target[id] = value;
      }
    }
    out[key] = target;
  }
  const merged = out as unknown as GameContent;
  applyMapAdditions(merged, parts);
  return merged;
}

function applyMapAdditions(content: GameContent, parts: readonly (readonly [string, ContentPart])[]): void {
  const maps = content.maps as Record<string, MapDef>;
  for (const [file, part] of parts) {
    for (const [mapId, add] of Object.entries(part.mapAdditions ?? {})) {
      const map = maps[mapId];
      if (!map) { PART_WARNINGS.push(`${file}: Karte „${mapId}“ fehlt (mapAdditions übersprungen)`); continue; }
      const fallback: Point = Object.values(map.entries)[0]?.at ?? [map.size[0] / 2, map.size[1] / 2];
      const resolve = (at: At, what: string): Point => {
        if (typeof at !== 'string') return at;
        const spot = map.spots?.[at] ?? map.entries[at];
        if (spot) return spot.at;
        PART_WARNINGS.push(`${file}: Spot „${at}“ fehlt auf ${mapId} (${what})`);
        return fallback;
      };
      const append = <T extends { id: string }>(list: T[] | undefined, extra: T[]): T[] => {
        const result = [...(list ?? [])];
        for (const item of extra) {
          if (result.some((x) => x.id === item.id)) { PART_WARNINGS.push(`${file}: ${mapId} hat schon „${item.id}“`); continue; }
          result.push(item);
        }
        return result;
      };
      const next: MapDef = { ...map };
      if (add.hotspots) next.hotspots = append(map.hotspots, add.hotspots.map((h) => ({ ...h, at: resolve(h.at, h.id) })));
      if (add.npcs) next.npcs = append(map.npcs, add.npcs.map((n) => ({ ...n, at: resolve(n.at, n.id) })));
      if (add.encounters) next.encounters = append(map.encounters, add.encounters.map((e) => ({ ...e, at: resolve(e.at, e.id) })));
      if (add.onEnter) next.onEnter = append(map.onEnter, add.onEnter);
      if (add.lights) next.lights = [...(map.lights ?? []), ...add.lights];
      maps[mapId] = next;
    }
  }
}
