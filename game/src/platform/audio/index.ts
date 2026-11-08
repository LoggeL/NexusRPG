// Prozedurales Audio (reines WebAudio, keine Dateien, keine Abhängigkeiten).
//
// Graph:  Ambience (dry/wet je Instanz, überblendet) ─┐
//                                    Musik-Hall ──────┼─► Musikbus ─┐
//         Effekte (dry/wet)          Effekt-Hall ─────┴─► Effektbus ┴─► Master ─► Kompressor ─► Ausgabe
//
// Der AudioContext entsteht erst bei unlock() (Autoplay-Regeln). Fehlt WebAudio
// oder scheitert der Aufbau, wird jede Methode zum No-op.

import type { AmbienceId, AudioPort, SfxId } from '../../modules/contracts';
import { AMBIENCES } from './ambiences';
import { barRock, endingTheme, titleTheme } from './music';
import { SFX, SFX_GAP } from './sfx';
import { type Ambience, type AmbienceFactory, type Kit, type Out, createKit, gain, impulse } from './synth';
import { type TrackEngine, createTracks } from './tracks';

/** Prozedurale Stücke, die schweigen, solange Lyria-Musik läuft. */
const MUSIC_KEYS: ReadonlySet<AmbienceKey> = new Set<AmbienceKey>(['title', 'ending', 'battle', 'club']);

export type AmbienceKey = AmbienceId | 'title' | 'ending' | 'battle';

export const AMBIENCE_KEYS: readonly AmbienceKey[] = [
  'unterstadt', 'club', 'oberstadt', 'kanal', 'oednis', 'meer', 'innen', 'labor', 'title', 'ending', 'battle',
];

export const SFX_IDS: readonly SfxId[] = [
  'step', 'pickup', 'success', 'fail', 'door', 'talk', 'hurt', 'heal', 'shot', 'alarm', 'engine', 'switch', 'page',
  'hack', 'hit', 'heart-up', 'heart-down', 'coin', 'phone', 'levelup', 'cookie',
];

const FACTORIES: Record<AmbienceKey, AmbienceFactory> = { ...AMBIENCES, title: titleTheme, ending: endingTheme, battle: barRock };

/**
 * Pegelabgleich je Ambience (Musikbus = 1), gemessen per Offline-Rendering:
 * Ambiences ≈ −30 dBFS RMS, Raumton leiser, Titel/Ende ≈ −25 dBFS bei Standardlautstärke.
 */
const TRIM: Record<AmbienceKey, number> = {
  unterstadt: 4.5, club: 1.4, oberstadt: 2.1, kanal: 1.4, oednis: 6, meer: 2, innen: 3, labor: 2.1, title: 2.3, ending: 1.8, battle: 1.6,
};

const LOOKAHEAD = 0.6;
const TICK_MS = 100;
const DEFAULT_FADE = 2.2;
const MIN_FADE = 1.5;
const MAX_FADING = 3;

export interface AudioOptions {
  /** Eigener Kontext (Tests, Offline-Rendering). Standard: window.AudioContext bzw. webkitAudioContext. */
  createContext?: () => AudioContext;
  /** Zufallsquelle 0 ≤ x < 1 – für Tests deterministisch. */
  random?: () => number;
  /** Überblendzeit in Sekunden, mindestens 1,5 s. */
  crossfade?: number;
  /** Kontext pausieren, solange der Tab verborgen ist (Standard: true). */
  pauseWhenHidden?: boolean;
  /** Startlautstärken 0..1. */
  volumes?: { music: number; sfx: number; voices?: number };
}

export interface AudioDebugState {
  supported: boolean;
  unlocked: boolean;
  disposed: boolean;
  contextState: string;
  requested: AmbienceKey | null;
  playing: AmbienceKey | null;
  fading: AmbienceKey[];
  volumes: { music: number; sfx: number; voices: number };
  music: string | null;
  /** Abgefangene Fehler (Audio darf das Spiel nie stören, soll sie aber nicht verschlucken). */
  errors: number;
  lastError: string | null;
}

export interface ProceduralAudio extends AudioPort {
  /** Zustand für Tests und den Test-Hook. */
  debug(): AudioDebugState;
}

interface Graph {
  ctx: AudioContext;
  kit: Kit;
  music: GainNode;
  effects: GainNode;
  musicVerb: AudioNode;
  sfxOut: Out;
  voices: GainNode;
  tracks: TrackEngine;
}

interface Playing {
  id: AmbienceKey;
  dry: GainNode;
  wet: GainNode;
  instance: Ambience;
  endsAt: number;
}

type ContextCtor = new () => AudioContext;

function findContext(): (() => AudioContext) | null {
  const scope = globalThis as unknown as { AudioContext?: ContextCtor; webkitAudioContext?: ContextCtor };
  const Ctor = scope.AudioContext ?? scope.webkitAudioContext;
  return typeof Ctor === 'function' ? () => new Ctor() : null;
}

function clamp01(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : fallback;
}

function isKey(id: unknown): id is AmbienceKey {
  return typeof id === 'string' && (AMBIENCE_KEYS as readonly string[]).includes(id);
}

export function createAudio(options: AudioOptions = {}): ProceduralAudio {
  const random = options.random ?? Math.random;
  const fade = Math.max(MIN_FADE, options.crossfade ?? DEFAULT_FADE);
  const pauseWhenHidden = options.pauseWhenHidden ?? true;
  const volumes = {
    music: clamp01(options.volumes?.music, 0.6),
    sfx: clamp01(options.volumes?.sfx, 0.8),
    voices: clamp01(options.volumes?.voices, 0.8),
  };
  let musicWanted: { id: string | null; muffled: boolean } = { id: null, muffled: false };

  let graph: Graph | null = null;
  let supported = true;
  let disposed = false;
  let requested: AmbienceKey | null = null;
  let current: Playing | null = null;
  const fading: Playing[] = [];
  let timer: ReturnType<typeof setInterval> | null = null;
  let autoSuspended = false;
  const lastSfx = new Map<SfxId, number>();
  let errors = 0;
  let lastError: string | null = null;
  const note = (error: unknown) => {
    errors++;
    lastError = error instanceof Error ? error.message : String(error);
  };

  function build(): Graph | null {
    const make = options.createContext ?? findContext();
    if (!make) {
      supported = false;
      return null;
    }
    let ctx: AudioContext | null = null;
    try {
      ctx = make();
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -14;
      comp.knee.value = 10;
      comp.ratio.value = 4;
      comp.attack.value = 0.004;
      comp.release.value = 0.25;
      comp.connect(ctx.destination);
      const master = gain(ctx, 0.9, comp);
      const music = gain(ctx, volumes.music, master);
      const effects = gain(ctx, volumes.sfx, master);

      const musicVerb = ctx.createConvolver();
      musicVerb.buffer = impulse(ctx, 3.2, 2.4, random);
      musicVerb.connect(gain(ctx, 0.55, music));
      const sfxVerb = ctx.createConvolver();
      sfxVerb.buffer = impulse(ctx, 1.6, 3, random);
      sfxVerb.connect(gain(ctx, 0.5, effects));

      const voiceBus = gain(ctx, volumes.voices, master);
      const g: Graph = { ctx, kit: createKit(ctx, random), music, effects, musicVerb, sfxOut: { dry: effects, wet: sfxVerb }, voices: voiceBus, tracks: null as unknown as TrackEngine };
      g.tracks = createTracks(ctx, music, voiceBus, () => { if (graph) apply(graph); }, note);
      return g;
    } catch (error) {
      note(error);
      supported = false;
      if (ctx) void Promise.resolve().then(() => ctx?.close()).catch(() => undefined);
      return null;
    }
  }

  function resume(g: Graph): void {
    if (g.ctx.state === 'running' || g.ctx.state === 'closed') return;
    try {
      void Promise.resolve(g.ctx.resume()).catch(() => undefined);
    } catch { /* manche Browser werfen synchron */ }
  }

  function startPlaying(g: Graph, id: AmbienceKey): Playing | null {
    const { ctx } = g;
    const now = ctx.currentTime;
    const level = TRIM[id];
    const dry = gain(ctx, 0, g.music);
    const wet = gain(ctx, 0, g.musicVerb);
    for (const p of [dry.gain, wet.gain]) {
      p.setValueAtTime(0, now);
      p.linearRampToValueAtTime(level, now + fade);
    }
    try {
      const instance = FACTORIES[id](g.kit, { dry, wet }, now + 0.05);
      instance.schedule(now + LOOKAHEAD, now);
      return { id, dry, wet, instance, endsAt: Infinity };
    } catch (error) {
      note(error);
      dry.disconnect();
      wet.disconnect();
      return null;
    }
  }

  function fadeOut(g: Graph, p: Playing): void {
    const now = g.ctx.currentTime;
    for (const param of [p.dry.gain, p.wet.gain]) {
      const value = param.value;
      param.cancelScheduledValues(now);
      param.setValueAtTime(value, now);
      param.linearRampToValueAtTime(0, now + fade);
    }
    p.endsAt = now + fade + 0.05;
    fading.push(p);
    while (fading.length > MAX_FADING) finish(g, fading[0]);
  }

  function finish(g: Graph, p: Playing): void {
    const index = fading.indexOf(p);
    if (index >= 0) fading.splice(index, 1);
    if (current === p) current = null;
    try {
      p.instance.stop(g.ctx.currentTime);
    } catch (error) { note(error); }
    p.dry.disconnect();
    p.wet.disconnect();
  }

  function apply(g: Graph): void {
    const effective = requested && g.tracks.active && MUSIC_KEYS.has(requested) ? null : requested;
    if ((current?.id ?? null) === effective) return;
    if (current) {
      fadeOut(g, current);
      current = null;
    }
    if (effective) current = startPlaying(g, effective);
  }

  function tick(): void {
    const g = graph;
    if (!g || disposed) return;
    const now = g.ctx.currentTime;
    const until = now + LOOKAHEAD;
    for (const p of [...fading]) {
      if (now >= p.endsAt) finish(g, p);
    }
    for (const p of current ? [current, ...fading] : [...fading]) {
      try {
        p.instance.schedule(until, now);
      } catch (error) {
        note(error);
        finish(g, p);
      }
    }
  }

  function onVisibility(): void {
    const g = graph;
    if (!g || disposed || typeof document === 'undefined') return;
    try {
      if (document.hidden) {
        if (g.ctx.state === 'running') {
          autoSuspended = true;
          void Promise.resolve(g.ctx.suspend()).catch(() => undefined);
        }
      } else if (autoSuspended) {
        autoSuspended = false;
        resume(g);
      }
    } catch (error) { note(error); }
  }

  const port: ProceduralAudio = {
    unlock() {
      if (disposed || !supported) return;
      try {
        if (!graph) {
          graph = build();
          if (!graph) return;
          timer = setInterval(tick, TICK_MS);
          if (pauseWhenHidden && typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
            document.addEventListener('visibilitychange', onVisibility);
          }
          graph.tracks.setMusic(musicWanted.id, musicWanted.muffled);
          apply(graph);
        }
        resume(graph);
      } catch (error) {
        note(error); // Audio ist Beiwerk – nie das Spiel stören.
      }
    },

    setAmbience(id) {
      if (disposed) return;
      const next = isKey(id) ? id : null;
      requested = next;
      if (!graph) return;
      try {
        apply(graph);
      } catch (error) { note(error); }
    },

    setMusic(id, options) {
      if (disposed) return;
      musicWanted = { id: typeof id === 'string' && id ? id : null, muffled: !!options?.muffled };
      graph?.tracks.setMusic(musicWanted.id, musicWanted.muffled);
    },

    stinger(id) {
      const g = graph;
      if (!g || disposed || volumes.music <= 0 || g.ctx.state !== 'running') return;
      g.tracks.stinger(id);
    },

    voice(file, opts) {
      const g = graph;
      if (!g || disposed || g.ctx.state !== 'running') return null;
      return g.tracks.voice(file, opts?.gain ?? 1, opts?.pan ?? 0);
    },

    sfx(id) {
      const g = graph;
      if (!g || disposed || volumes.sfx <= 0) return;
      const play = SFX[id];
      if (!play) return;
      try {
        if (g.ctx.state !== 'running') return;
        const now = g.ctx.currentTime;
        const gap = SFX_GAP[id] ?? 0.03;
        const last = lastSfx.get(id);
        if (last !== undefined && now - last < gap && now >= last) return;
        lastSfx.set(id, now);
        play(g.kit, g.sfxOut, now + 0.01);
      } catch (error) { note(error); }
    },

    setVolumes(next) {
      if (disposed) return;
      volumes.music = clamp01(next?.music, volumes.music);
      volumes.sfx = clamp01(next?.sfx, volumes.sfx);
      volumes.voices = clamp01(next?.voices, volumes.voices);
      const g = graph;
      if (!g) return;
      try {
        const now = g.ctx.currentTime;
        for (const [param, value] of [[g.music.gain, volumes.music], [g.effects.gain, volumes.sfx], [g.voices.gain, volumes.voices]] as const) {
          param.cancelScheduledValues(now);
          param.setValueAtTime(param.value, now);
          param.setTargetAtTime(value, now, 0.04);
        }
      } catch (error) { note(error); }
    },

    dispose() {
      if (disposed) return;
      disposed = true;
      if (timer !== null) clearInterval(timer);
      timer = null;
      if (typeof document !== 'undefined' && typeof document.removeEventListener === 'function') {
        document.removeEventListener('visibilitychange', onVisibility);
      }
      const g = graph;
      if (!g) return;
      g.tracks.dispose();
      for (const p of current ? [current, ...fading] : [...fading]) {
        try { finish(g, p); } catch (error) { note(error); }
      }
      current = null;
      fading.length = 0;
      try {
        void Promise.resolve(g.ctx.close()).catch(() => undefined);
      } catch (error) { note(error); }
    },

    debug() {
      return {
        supported,
        unlocked: graph !== null,
        disposed,
        contextState: graph ? String(graph.ctx.state) : 'none',
        requested,
        playing: current?.id ?? null,
        fading: fading.map(p => p.id),
        volumes: { ...volumes },
        music: musicWanted.id,
        errors,
        lastError,
      };
    },
  };
  return port;
}
