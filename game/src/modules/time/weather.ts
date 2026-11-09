// Wetter je Spieltag und Bezirk als reine Rechnung (world.md §3.4, docs/concepts/welt.md §5.2). Bereich engine-welt.
//
// Stadt (alle Bezirke außer der Ödnis, auch Kanalisation, Küste und Innenräume): Der 28-Tage-Festkalender legt vier
// Tage jeder Zykluswoche fest – Zyklustag 1/8/15/22 klar, 2/9/16/23 Smog, 3/10/17/24 Neonnebel, 5/12/19/26 Rostregen.
// Das sind genau die Tage der bisherigen Inhaltskonstanten WETTER_KLAR, WETTER_SMOG, WETTER_NEONSCHAUER und
// WETTER_ROSTREGEN (content/parts/world/_w.ts), damit Nachrichten und Telefon weiter zum Himmel passen. Die übrigen Tage
// zieht der Startwert der Partie deterministisch (gewichtet nach welt.md §5.2): gleicher Spielstand, gleiches Wetter.
//
// Ödnis: eigenes Wetter. Sandsturm an Zyklustag 4/11/18/25 (wie SANDSTURM in content/parts/world-23/_w23.ts), sonst
// Hitzeglocke oder klar, ebenfalls aus dem Startwert.
import type { ClockState, DistrictId, MapDef, MapId, WeatherId } from '../contracts';
import { cycleDayOf } from './clock';

export const WEATHER_IDS: readonly WeatherId[] = ['klar', 'smog', 'rostregen', 'neonnebel', 'hitzeglocke', 'sandsturm'];

export const WEATHER_LABELS: Readonly<Record<WeatherId, string>> = {
  klar: 'Klar', smog: 'Smog', rostregen: 'Rostregen', neonnebel: 'Neonnebel', hitzeglocke: 'Hitzeglocke', sandsturm: 'Sandsturm',
};

/** Kurzer Wetterbericht für HUD-Tooltip und Ansagen. */
export const WEATHER_TEXT: Readonly<Record<WeatherId, string>> = {
  klar: 'Klare Sicht bis zum Meer. Selten genug.',
  smog: 'Dichter Smog. Die Luft schmeckt nach Montag und Reifen.',
  rostregen: 'Rostregen. Schirm auf, Garküchen voll, Angler glücklich.',
  neonnebel: 'Neonnebel in Reklamefarben. Wachen sehen kürzer.',
  hitzeglocke: 'Hitzeglocke. Wasser mitnehmen, Hirn beschatten.',
  sandsturm: 'Sandsturm. Ohne Staubmantel oder Maske schmirgelt dir der Wind die Haut ab.',
};

export const isWeatherId = (value: unknown): value is WeatherId =>
  typeof value === 'string' && (WEATHER_IDS as readonly string[]).includes(value);

/** Wetterzone eines Bezirks: Die Ödnis hat eigenes Wetter, alle anderen Bezirke teilen das Stadtwetter. */
export type WeatherZone = 'stadt' | 'oednis';
export const weatherZoneOf = (district: DistrictId | null | undefined): WeatherZone => (district === 'oednis' ? 'oednis' : 'stadt');

/** Feste Tage je Zykluswoche (Position 1–7 innerhalb der 28-Tage-Zyklus-Woche). */
const FIXED: Readonly<Record<WeatherZone, Readonly<Partial<Record<number, WeatherId>>>>> = {
  stadt: { 1: 'klar', 2: 'smog', 3: 'neonnebel', 5: 'rostregen' },
  oednis: { 4: 'sandsturm' },
};

/** Gewichte für die freien Tage. Sandsturm bleibt an die festen Tage gebunden (≈ 15 % der Ödnis-Tage). */
const ROLL: Readonly<Record<WeatherZone, readonly (readonly [WeatherId, number])[]>> = {
  stadt: [['klar', 30], ['smog', 25], ['rostregen', 20], ['neonnebel', 15], ['hitzeglocke', 10]],
  oednis: [['klar', 65], ['hitzeglocke', 35]],
};

/** Deterministische Zahl 0 ≤ x < 1 aus Startwert, Tag und Zone (kein Zustand, kein Math.random). */
function roll(seed: number, day: number, salt: number): number {
  let h = ((seed >>> 0) ^ Math.imul(day | 0, 0x9e3779b1) ^ Math.imul(salt, 0x85ebca6b)) >>> 0;
  h = Math.imul(h ^ (h >>> 16), 0x7feb352d);
  h = Math.imul(h ^ (h >>> 15), 0x846ca68b);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

/** Wetter eines Spieltags in einem Bezirk. */
export function weatherFor(seed: number, day: number, district?: DistrictId | null): WeatherId {
  const zone = weatherZoneOf(district);
  const position = ((cycleDayOf(day) - 1) % 7) + 1;
  const fixed = FIXED[zone][position];
  if (fixed) return fixed;
  const table = ROLL[zone];
  const total = table.reduce((sum, [, weight]) => sum + weight, 0);
  let pick = roll(Number.isFinite(seed) ? seed : 0, day, zone === 'oednis' ? 2 : 1) * total;
  for (const [id, weight] of table) {
    if (pick < weight) return id;
    pick -= weight;
  }
  return table[0][0];
}

/** Wetter für den Spielzustand: Bezirk der aktuellen Karte, sofern kein Bezirk angegeben ist. */
export function weatherAt(
  maps: Readonly<Record<MapId, Pick<MapDef, 'district'>>>,
  state: { readonly seed: number; readonly clock: Readonly<ClockState>; readonly map: MapId },
  district?: DistrictId | null,
): WeatherId {
  const where = district ?? (Object.prototype.hasOwnProperty.call(maps, state.map) ? maps[state.map].district : null);
  return weatherFor(state.seed, state.clock.day, where);
}

/** Vorschau über mehrere Tage (z. B. Wetterbericht im Radio). */
export function weatherForecast(seed: number, fromDay: number, days: number, district?: DistrictId | null): WeatherId[] {
  const count = Math.max(0, Math.min(28, Math.floor(days)));
  return Array.from({ length: count }, (_, i) => weatherFor(seed, fromDay + i, district));
}
