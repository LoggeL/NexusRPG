import type { SaveStoragePort } from '../modules/contracts';

export const SAVE_KEY = 'nexusrpg-save-v1';
/** Eigener Speicherplatz für URL-Einstiege (?act=, ?map=, ?cut=), damit sie den echten Autosave nicht überschreiben. */
export const DEBUG_SAVE_KEY = 'nexusrpg-save-debug';

/** Sicherer Zugriff auf localStorage; private Fenster oder volle Speicher werfen nie bis ins Spiel durch. */
export function safeLocalStorage(): Storage | null {
  try {
    const storage = window.localStorage;
    const probe = '__nexus_probe__';
    storage.setItem(probe, '1');
    storage.removeItem(probe);
    return storage;
  } catch {
    return null;
  }
}

export function createLocalSaveStorage(key = SAVE_KEY): SaveStoragePort {
  const memory = { value: null as string | null };
  return {
    read() {
      try {
        const storage = safeLocalStorage();
        return storage ? storage.getItem(key) : memory.value;
      } catch {
        return memory.value;
      }
    },
    write(raw: string) {
      memory.value = raw;
      try { safeLocalStorage()?.setItem(key, raw); } catch { /* Speicher voll oder gesperrt: Partie läuft im Speicher weiter. */ }
    },
    clear() {
      memory.value = null;
      try { safeLocalStorage()?.removeItem(key); } catch { /* ignorieren */ }
    },
  };
}

/** Speicher nur für Tests oder Debug-Einstiege. */
export function createMemorySaveStorage(initial: string | null = null): SaveStoragePort {
  let value = initial;
  return { read: () => value, write: (raw) => { value = raw; }, clear: () => { value = null; } };
}

/**
 * Schreibsperre bis zum Spielbeginn: verhindert, dass eine frisch erzeugte Kampagne
 * beim Start einen vorhandenen Spielstand überschreibt, bevor der Spieler „Fortsetzen“
 * oder „Neue Expedition“ gewählt hat.
 */
export interface GatedSaveStorage extends SaveStoragePort {
  enableWrites(): void;
  readonly writesEnabled: boolean;
  /** Spielstand, der beim Start bereits vorlag (bzw. der zuletzt geschriebene). */
  existing(): string | null;
}

export function gateSaveStorage(inner: SaveStoragePort): GatedSaveStorage {
  let enabled = false;
  return {
    read: () => inner.read(),
    write(raw: string) { if (enabled) inner.write(raw); },
    clear() { if (enabled) inner.clear(); },
    enableWrites() { enabled = true; },
    get writesEnabled() { return enabled; },
    existing: () => inner.read(),
  };
}

// ---------------------------------------------------------------------------
// Drei Speicherplätze (design.md §2): Kopien des laufenden Spielstands mit Zeitstempel.
// Der Autosave bleibt die laufende Partie; Laden eines Platzes übernimmt dessen Stand als laufende Partie.

export const SLOT_COUNT = 3;
export const SLOT_KEY_PREFIX = 'nexusrpg-slot-';

/** Kurzinfo eines Speicherplatzes für Titel und Menü (aus dem gespeicherten JSON, ohne Inhaltsprüfung). */
export interface SlotSummary {
  /** 1..SLOT_COUNT */
  slot: number;
  empty: boolean;
  /** Nicht lesbar (wird beim Laden ohnehin abgelehnt). */
  corrupt?: boolean;
  savedAt?: number;
  name?: string;
  level?: number;
  day?: number;
  minutes?: number;
  map?: string;
  act?: number;
  playTimeMs?: number;
  ended?: boolean;
}

export interface SaveSlotStore {
  list(): SlotSummary[];
  /** Roher Spielstand (für CampaignPort.importSave) oder null. */
  read(slot: number): string | null;
  /** false, wenn der Platz ungültig ist oder der Speicher voll/gesperrt ist. */
  write(slot: number, raw: string, now?: number): boolean;
  clear(slot: number): void;
}

interface SlotEnvelope { v: 1; savedAt: number; save: string }

const asRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : null;
const finiteOr = (value: unknown): number | undefined => (typeof value === 'number' && Number.isFinite(value) ? value : undefined);

/** Liest Name, Stufe, Tag, Uhrzeit, Karte und Spielzeit aus einem Spielstand-JSON (fehlertolerant). */
export function summarizeSave(raw: string | null, slot = 0, savedAt?: number): SlotSummary {
  if (!raw) return { slot, empty: true };
  try {
    const state = asRecord(JSON.parse(raw));
    if (!state) return { slot, empty: false, corrupt: true, ...(savedAt ? { savedAt } : {}) };
    const player = asRecord(state.player);
    const clock = asRecord(state.clock);
    const summary: SlotSummary = { slot, empty: false };
    if (savedAt) summary.savedAt = savedAt;
    if (typeof player?.name === 'string') summary.name = player.name.slice(0, 32);
    const level = finiteOr(player?.level); if (level !== undefined) summary.level = level;
    const day = finiteOr(clock?.day); if (day !== undefined) summary.day = day;
    const minutes = finiteOr(clock?.minutes); if (minutes !== undefined) summary.minutes = minutes;
    if (typeof state.map === 'string') summary.map = state.map;
    const act = finiteOr(state.act); if (act !== undefined) summary.act = act;
    const play = finiteOr(state.playTimeMs); if (play !== undefined) summary.playTimeMs = play;
    if (state.ended === true) summary.ended = true;
    return summary;
  } catch {
    return { slot, empty: false, corrupt: true, ...(savedAt ? { savedAt } : {}) };
  }
}

export function createSaveSlots(storage: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> | null = safeLocalStorage(), prefix = SLOT_KEY_PREFIX): SaveSlotStore {
  const memory = new Map<number, string>();
  const valid = (slot: number) => Number.isInteger(slot) && slot >= 1 && slot <= SLOT_COUNT;
  const readEnvelope = (slot: number): SlotEnvelope | null => {
    if (!valid(slot)) return null;
    let text: string | null = null;
    try { text = storage ? storage.getItem(prefix + slot) : memory.get(slot) ?? null; } catch { text = memory.get(slot) ?? null; }
    if (!text) return null;
    try {
      const parsed = asRecord(JSON.parse(text));
      if (parsed && parsed.v === 1 && typeof parsed.save === 'string') {
        return { v: 1, savedAt: finiteOr(parsed.savedAt) ?? 0, save: parsed.save };
      }
    } catch { /* unten als beschädigt gemeldet */ }
    return { v: 1, savedAt: 0, save: text };
  };
  return {
    list() {
      const out: SlotSummary[] = [];
      for (let slot = 1; slot <= SLOT_COUNT; slot++) {
        const envelope = readEnvelope(slot);
        out.push(envelope ? summarizeSave(envelope.save, slot, envelope.savedAt || undefined) : { slot, empty: true });
      }
      return out;
    },
    read(slot) { return readEnvelope(slot)?.save ?? null; },
    write(slot, raw, now = Date.now()) {
      if (!valid(slot) || typeof raw !== 'string' || !raw) return false;
      const text = JSON.stringify({ v: 1, savedAt: now, save: raw } satisfies SlotEnvelope);
      memory.set(slot, text);
      if (!storage) return true;
      try { storage.setItem(prefix + slot, text); return true; } catch { return false; }
    },
    clear(slot) {
      if (!valid(slot)) return;
      memory.delete(slot);
      try { storage?.removeItem(prefix + slot); } catch { /* ignorieren */ }
    },
  };
}

// ---------------------------------------------------------------------------
// Galerie über alle Partien: einmal gesehene Schlüsselszenen bleiben freigeschaltet.

export const GALLERY_KEY = 'nexusrpg-gallery-v1';

export interface GalleryStore {
  ids(): string[];
  /** Fügt neue IDs hinzu; true, wenn sich etwas geändert hat. */
  add(ids: readonly string[]): boolean;
}

export function createGalleryStore(storage: Pick<Storage, 'getItem' | 'setItem'> | null = safeLocalStorage(), key = GALLERY_KEY): GalleryStore {
  let cache: string[] | null = null;
  const load = (): string[] => {
    if (cache) return cache;
    cache = [];
    try {
      const parsed = JSON.parse(storage?.getItem(key) ?? '[]') as unknown;
      if (Array.isArray(parsed)) cache = parsed.filter((id): id is string => typeof id === 'string' && id.length > 0 && id.length <= 120).slice(0, 2000);
    } catch { cache = []; }
    return cache;
  };
  return {
    ids: () => [...load()],
    add(ids) {
      const list = load();
      const fresh = ids.filter((id) => typeof id === 'string' && id && !list.includes(id));
      if (!fresh.length) return false;
      list.push(...fresh);
      try { storage?.setItem(key, JSON.stringify(list)); } catch { /* Galerie bleibt im Speicher */ }
      return true;
    },
  };
}
