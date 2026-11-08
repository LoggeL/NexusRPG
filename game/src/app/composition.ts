// Komposition (gemeinsam, Änderungen absprechen): Regeln, Inhalte, Audio und Plattform zu einem GameContext verbinden.

import { content } from '../content';
import { createCampaign } from '../modules/campaign';
import type { AssetManifest, AudioPort } from '../modules/contracts';
import { createDialogueSession } from '../modules/dialogue';
import { endingStats as computeEndingStats, epilogueLines } from '../modules/ending';
import { AssetCatalog } from '../platform/assets/manifest';
import { createAudio } from '../platform/audio';
import type { InputRouter } from '../platform/input/router';
import type { SettingsStore } from '../platform/settings';
import { createLocalSaveStorage, DEBUG_SAVE_KEY, gateSaveStorage, SAVE_KEY, type GatedSaveStorage } from '../platform/storage';
import { parseEntry } from './urlEntry';
import type { EndingStats, GameContext } from '../presentation/context';

/** Null-Audio, falls WebAudio nicht erzeugt werden kann. */
export function createNullAudio(): AudioPort {
  return { unlock() {}, setAmbience() {}, setMusic() {}, stinger() {}, voice: () => null, sfx() {}, setVolumes() {}, dispose() {} };
}

/** Deterministischer Zufall (mulberry32) für Tests und `?seed=`. */
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

/** Zufallsquelle der Kampagne mit umschaltbarem Startwert (Tests, `?seed=`). */
export interface RandomControl {
  /** Zufall mit Startwert; null = Math.random. */
  seed(seed: number | null): void;
}

export function createRandom(): RandomControl & { random: () => number } {
  let source: () => number = Math.random;
  return {
    seed(seed) { source = seed === null || !Number.isFinite(seed) ? Math.random : seededRandom(seed); },
    random: () => source(),
  };
}

export interface Composition {
  ctx: GameContext;
  storage: GatedSaveStorage;
  random: RandomControl;
}

export function compose(options: { manifest: AssetManifest; settings: SettingsStore; input: InputRouter; debug: boolean; params?: URLSearchParams }): Composition {
  const warnings: string[] = [];
  // URL-Einstiege (?act=, ?map=, ?battle=, ?newchar …) spielen auf einem eigenen Speicherplatz; der echte Autosave bleibt unberührt.
  const warp = options.params ? parseEntry(`?${options.params.toString()}`, content).entry.kind !== 'title' : false;
  const storage = gateSaveStorage(createLocalSaveStorage(warp ? DEBUG_SAVE_KEY : SAVE_KEY));
  const random = createRandom();
  const seedParam = options.params?.get('seed');
  const seed = seedParam && Number.isFinite(Number(seedParam)) ? Number(seedParam) >>> 0 : undefined;
  if (seed !== undefined) random.seed(seed);

  // Vorhandenen Spielstand merken, bevor die Kampagne entsteht (Speicher ist bis begin() gesperrt).
  const campaign = createCampaign(content, { storage, random: random.random, ...(seed !== undefined ? { seed } : {}) });
  const settings = options.settings.get();
  let audio: AudioPort;
  try {
    audio = createAudio({ volumes: { music: settings.music, sfx: settings.sfx, voices: settings.voices } });
  } catch (error) {
    console.warn('[app] Audio nicht verfügbar', error);
    warnings.push('Audio nicht verfügbar – das Spiel bleibt stumm.');
    audio = createNullAudio();
  }

  const endingStats = (): EndingStats => ({
    ...computeEndingStats(content, campaign.state()),
    epilogue: epilogueLines(content, (condition) => campaign.evaluate(condition)),
  });

  const ctx: GameContext = {
    campaign,
    content,
    audio,
    settings: options.settings,
    input: options.input,
    catalog: new AssetCatalog(options.manifest),
    createDialogue: (id) => createDialogueSession(campaign, id),
    saves: {
      existing: () => {
        const raw = storage.existing();
        return raw && raw.trim() ? raw : null;
      },
      begin: () => storage.enableWrites(),
    },
    endingStats,
    debug: options.debug,
    warnings,
  };
  return { ctx, storage, random };
}
