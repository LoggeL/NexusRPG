// Feste Kennungen, Grenzwerte und kleine Hilfen der Regel-Engine (ohne Inhaltsbezug).
import type { ActId, AttributeId, CyberSlot, EquipSlot, Facing, TimeSlot, Weekday } from '../contracts';

export const ATTRIBUTE_IDS: readonly AttributeId[] = ['technik', 'koerper', 'reflexe', 'ausstrahlung', 'strasse'];
export const ATTRIBUTE_LABELS: Readonly<Record<AttributeId, string>> = {
  technik: 'Technik',
  koerper: 'Körper',
  reflexe: 'Reflexe',
  ausstrahlung: 'Ausstrahlung',
  strasse: 'Straße',
};
export const TIME_SLOTS: readonly TimeSlot[] = ['morgen', 'tag', 'abend', 'nacht'];
export const TIME_SLOT_LABELS: Readonly<Record<TimeSlot, string>> = { morgen: 'Morgen', tag: 'Tag', abend: 'Abend', nacht: 'Nacht' };
export const WEEKDAYS: readonly Weekday[] = ['mo', 'di', 'mi', 'do', 'fr', 'sa', 'so'];
export const WEEKDAY_LABELS: Readonly<Record<Weekday, string>> = {
  mo: 'Montag', di: 'Dienstag', mi: 'Mittwoch', do: 'Donnerstag', fr: 'Freitag', sa: 'Samstag', so: 'Sonntag',
};
export const FACINGS: readonly Facing[] = ['s', 'w', 'e', 'n'];
export const ACT_IDS: readonly ActId[] = [1, 2, 3];
export const CYBER_SLOTS: readonly CyberSlot[] = ['kopf', 'augen', 'arme', 'beine', 'nervensystem', 'haut'];
export const EQUIP_SLOTS: readonly EquipSlot[] = ['nahkampf', 'fernkampf', 'smart', 'kleidung'];

// Spielfigur (design.md §3.1)
export const ATTR_START = 3;
export const ATTR_FREE_POINTS = 4;
export const ATTR_MIN = 1;
export const ATTR_MAX = 10;
export const NAME_MIN = 2;
export const NAME_MAX = 16;
export const LEVEL_MAX = 20;
export const DEFAULT_PLAYER_NAME = 'Neuling';

// Beziehungen (design.md §3.3)
export const POINTS_MIN = -1000;
export const POINTS_MAX = 1000;
export const RIVAL_BELOW = -200;
export const ROMANCE_HEARTS = 8;
export const MAX_PARTY = 2;

// Zeit (design.md §3.4)
export const DAY_START = 360;   // 06:00
export const DAY_END = 1560;    // 02:00 am Folgetag
export const DEFAULT_START_MINUTES = 480; // 08:00
export const MAP_CHANGE_MINUTES = 10;
export const SUBWAY_MINUTES = 30;

// Wirtschaft
export const REP_MIN = -100;
export const REP_MAX = 100;
export const MAX_CREDITS = 9_999_999;
export const MAX_STACK = 9999;
export const DEFAULT_BUY_RATE = 0.4;
export const JOBS_PER_BOARD = 3;

/** Standardgröße einer Karte (native Imagegen-Größe). */
export const DEFAULT_MAP_SIZE: readonly [number, number] = [1536, 1024];
export const UNKNOWN_NAME = '???';

export const actFlag = (act: ActId): string => `act${act}`;

export const isActId = (value: unknown): value is ActId =>
  typeof value === 'number' && (ACT_IDS as readonly number[]).includes(value);
export const isFacing = (value: unknown): value is Facing =>
  typeof value === 'string' && (FACINGS as readonly string[]).includes(value);
export const isAttributeId = (value: unknown): value is AttributeId =>
  typeof value === 'string' && (ATTRIBUTE_IDS as readonly string[]).includes(value);
export const isTimeSlot = (value: unknown): value is TimeSlot =>
  typeof value === 'string' && (TIME_SLOTS as readonly string[]).includes(value);

export const has = (record: object, key: string): boolean =>
  typeof key === 'string' && Object.prototype.hasOwnProperty.call(record, key);
export const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));
export const asList = <T>(value: T | readonly T[]): readonly T[] => (Array.isArray(value) ? value : [value as T]);

/** Deterministischer Zufall (mulberry32) aus einem Startwert. */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Stabiler Hash für Startwerte aus Text (FNV-1a). */
export function hashText(text: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash >>> 0;
}
