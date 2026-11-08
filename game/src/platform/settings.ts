import { safeLocalStorage } from './storage';

export type TextSpeed = 'langsam' | 'normal' | 'schnell' | 'sofort';

export interface Settings {
  music: number;          // 0..1
  sfx: number;            // 0..1
  /** Hintergrundstimmen 0..1 */
  voices: number;
  reducedMotion: boolean;
  textSpeed: TextSpeed;
  /** Schriftgröße der Oberfläche (1 = Standard). */
  textScale: TextScale;
}

export type TextScale = 1 | 1.15 | 1.3;
export const TEXT_SCALES: readonly TextScale[] = [1, 1.15, 1.3];
export const TEXT_SCALE_LABEL: Record<string, string> = { '1': 'Normal', '1.15': 'Groß', '1.3': 'Sehr groß' };

export const SETTINGS_KEY = 'nexusrpg-settings-v1';

export const TEXT_SPEED_CPS: Record<TextSpeed, number> = { langsam: 28, normal: 50, schnell: 90, sofort: Infinity };
export const TEXT_SPEED_LABEL: Record<TextSpeed, string> = { langsam: 'Langsam', normal: 'Normal', schnell: 'Schnell', sofort: 'Sofort' };

function systemReducedMotion(): boolean {
  try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { return false; }
}

export function defaultSettings(): Settings {
  return { music: 0.6, sfx: 0.8, voices: 0.8, reducedMotion: systemReducedMotion(), textSpeed: 'normal', textScale: 1 };
}

const clamp01 = (value: unknown, fallback: number) =>
  typeof value === 'number' && Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : fallback;

export function sanitizeSettings(raw: unknown): Settings {
  const base = defaultSettings();
  if (!raw || typeof raw !== 'object') return base;
  const value = raw as Partial<Settings>;
  return {
    music: clamp01(value.music, base.music),
    sfx: clamp01(value.sfx, base.sfx),
    voices: clamp01(value.voices, base.voices),
    reducedMotion: typeof value.reducedMotion === 'boolean' ? value.reducedMotion : base.reducedMotion,
    textSpeed: value.textSpeed && value.textSpeed in TEXT_SPEED_CPS ? value.textSpeed : base.textSpeed,
    textScale: (TEXT_SCALES as readonly unknown[]).includes(value.textScale) ? value.textScale as TextScale : base.textScale,
  };
}

export interface SettingsStore {
  get(): Readonly<Settings>;
  update(patch: Partial<Settings>): Readonly<Settings>;
  subscribe(listener: (settings: Readonly<Settings>) => void): () => void;
}

export function createSettingsStore(key = SETTINGS_KEY): SettingsStore {
  let current: Settings;
  try {
    const raw = safeLocalStorage()?.getItem(key);
    current = sanitizeSettings(raw ? JSON.parse(raw) : null);
  } catch {
    current = defaultSettings();
  }
  const listeners = new Set<(settings: Readonly<Settings>) => void>();
  return {
    get: () => current,
    update(patch) {
      current = sanitizeSettings({ ...current, ...patch });
      try { safeLocalStorage()?.setItem(key, JSON.stringify(current)); } catch { /* nicht persistierbar */ }
      for (const listener of listeners) listener(current);
      return current;
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
