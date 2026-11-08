// Datei-Audio: Lyria-Musik (nahtlose Schleifen), Stinger und Hintergrundstimmen.
// Läuft im selben AudioContext wie die prozeduralen Klänge; Fehler bleiben stumm (Audio ist Beiwerk).

import type { VoiceHandle } from '../../modules/contracts';
import { assetUrl } from '../assets/manifest';

interface TrackInfo { id: string; file: string; kind: 'loop' | 'stinger' }

export interface TrackEngine {
  /** true, solange ein bekanntes Musikstück angefordert ist (prozedurale Musik schweigt dann). */
  readonly active: boolean;
  setMusic(id: string | null, muffled: boolean): void;
  stinger(id: string): void;
  voice(file: string, gain: number, pan: number): VoiceHandle | null;
  dispose(): void;
}

const FADE = 2;
const OPEN_HZ = 20000;
const MUFFLED_HZ = 520;
const MAX_MUSIC_BUFFERS = 3;
const MAX_VOICE_BUFFERS = 40;

export function createTracks(
  ctx: AudioContext,
  musicOut: AudioNode,
  voiceOut: AudioNode,
  onChange: () => void,
  note: (error: unknown) => void,
): TrackEngine {
  let catalog: Map<string, TrackInfo> | null = null;
  let catalogLoading: Promise<void> | null = null;
  const failed = new Set<string>();
  const musicCache = new Map<string, Promise<AudioBuffer | null>>();
  const voiceCache = new Map<string, Promise<AudioBuffer | null>>();
  let disposed = false;

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = OPEN_HZ;
  filter.Q.value = 0.7;
  const duck = ctx.createGain();
  filter.connect(duck);
  duck.connect(musicOut);

  let wanted: string | null = null;
  let current: { id: string; src: AudioBufferSourceNode; gain: GainNode } | null = null;
  let token = 0;

  function loadCatalog(): Promise<void> {
    if (catalog) return Promise.resolve();
    catalogLoading ??= fetch(assetUrl('assets/music/manifest.json'))
      .then((r) => (r.ok ? r.json() : { tracks: [] }))
      .then((data: { tracks?: TrackInfo[] }) => {
        catalog = new Map((data.tracks ?? []).map((t) => [t.id, t]));
      })
      .catch((error) => { note(error); catalog = new Map(); });
    return catalogLoading;
  }

  function decode(url: string, cache: Map<string, Promise<AudioBuffer | null>>, limit: number): Promise<AudioBuffer | null> {
    const hit = cache.get(url);
    if (hit) {
      cache.delete(url);
      cache.set(url, hit); // LRU
      return hit;
    }
    const job = fetch(url)
      .then((r) => { if (!r.ok) throw new Error(`${r.status} ${url}`); return r.arrayBuffer(); })
      .then((data) => ctx.decodeAudioData(data))
      .catch((error) => { note(error); cache.delete(url); return null; });
    cache.set(url, job);
    while (cache.size > limit) cache.delete(cache.keys().next().value as string);
    return job;
  }

  function stopCurrent(at: number): void {
    if (!current) return;
    const { src, gain } = current;
    gain.gain.cancelScheduledValues(at);
    gain.gain.setValueAtTime(gain.gain.value, at);
    gain.gain.linearRampToValueAtTime(0, at + FADE);
    try { src.stop(at + FADE + 0.05); } catch { /* schon gestoppt */ }
    src.onended = () => gain.disconnect();
    current = null;
  }

  async function start(id: string, mine: number): Promise<void> {
    await loadCatalog();
    const info = catalog?.get(id);
    if (!info) { failed.add(id); onChange(); return; }
    const buffer = await decode(assetUrl(`assets/music/${info.file}`), musicCache, MAX_MUSIC_BUFFERS);
    if (disposed || mine !== token) return;
    if (!buffer) { failed.add(id); onChange(); return; }
    const now = ctx.currentTime;
    stopCurrent(now);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(1, now + FADE);
    gain.connect(filter);
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = info.kind === 'loop';
    src.connect(gain);
    src.start(now + 0.02);
    current = { id, src, gain };
  }

  return {
    get active() { return wanted !== null && !failed.has(wanted); },

    setMusic(id, muffled) {
      if (disposed) return;
      try {
        const now = ctx.currentTime;
        filter.frequency.cancelScheduledValues(now);
        filter.frequency.setValueAtTime(filter.frequency.value, now);
        filter.frequency.exponentialRampToValueAtTime(muffled ? MUFFLED_HZ : OPEN_HZ, now + 0.8);
        if (id === wanted) return;
        wanted = id;
        token++;
        onChange();
        if (!id) { stopCurrent(now); return; }
        if (current?.id === id) return;
        void start(id, token).catch(note);
      } catch (error) { note(error); }
    },

    stinger(id) {
      if (disposed) return;
      void loadCatalog().then(async () => {
        const info = catalog?.get(id);
        if (!info) return;
        const buffer = await decode(assetUrl(`assets/music/${info.file}`), voiceCache, MAX_VOICE_BUFFERS);
        if (!buffer || disposed) return;
        const now = ctx.currentTime;
        const src = ctx.createBufferSource();
        src.buffer = buffer;
        src.connect(musicOut);
        duck.gain.cancelScheduledValues(now);
        duck.gain.setValueAtTime(duck.gain.value, now);
        duck.gain.linearRampToValueAtTime(0.3, now + 0.25);
        duck.gain.setValueAtTime(0.3, now + buffer.duration);
        duck.gain.linearRampToValueAtTime(1, now + buffer.duration + 1.2);
        src.start(now + 0.05);
        src.onended = () => src.disconnect();
      }).catch(note);
    },

    voice(file, gainValue, pan) {
      if (disposed) return null;
      let src: AudioBufferSourceNode | null = null;
      let stopped = false;
      let finish: () => void = () => undefined;
      const ended = new Promise<void>((resolve) => { finish = resolve; });
      const gain = ctx.createGain();
      gain.gain.value = Math.max(0, Math.min(1, gainValue));
      const panner = ctx.createStereoPanner();
      panner.pan.value = Math.max(-1, Math.min(1, pan));
      gain.connect(panner);
      panner.connect(voiceOut);
      const cleanup = () => { try { panner.disconnect(); gain.disconnect(); } catch { /* egal */ } finish(); };
      void decode(assetUrl(file), voiceCache, MAX_VOICE_BUFFERS).then((buffer) => {
        if (!buffer || stopped || disposed) { cleanup(); return; }
        src = ctx.createBufferSource();
        src.buffer = buffer;
        src.connect(gain);
        src.onended = cleanup;
        src.start(ctx.currentTime + 0.02);
      }).catch((error) => { note(error); cleanup(); });
      return {
        ended,
        stop() {
          if (stopped) return;
          stopped = true;
          if (!src) return;
          const now = ctx.currentTime;
          gain.gain.cancelScheduledValues(now);
          gain.gain.setValueAtTime(gain.gain.value, now);
          gain.gain.linearRampToValueAtTime(0, now + 0.35);
          try { src.stop(now + 0.4); } catch { cleanup(); }
        },
      };
    },

    dispose() {
      disposed = true;
      try { stopCurrent(ctx.currentTime); } catch { /* egal */ }
      musicCache.clear();
      voiceCache.clear();
    },
  };
}
