// Kleine Synthesizer-Bausteine für prozedurales WebAudio.
// Alles hier arbeitet auf BaseAudioContext, damit es auch in einem
// OfflineAudioContext gerendert (und so gemessen) werden kann.

export interface Kit {
  readonly ctx: BaseAudioContext;
  readonly rnd: () => number;
  /** 4 s weißes Rauschen, stereo – als Schleife nahtlos. */
  readonly noise: AudioBuffer;
  /** Pulswellen für Chiptune-Klänge (null, falls PeriodicWave fehlt). */
  readonly pulse25: PeriodicWave | null;
  readonly pulse12: PeriodicWave | null;
}

/** Ausgangspaar einer Klangquelle: trocken und in den Hall. */
export interface Out {
  readonly dry: AudioNode;
  readonly wet: AudioNode;
}

export interface Ambience {
  /** Plant Ereignisse bis `until` (Kontextzeit); `now` dient zum Überspringen verspäteter Ereignisse. */
  schedule(until: number, now: number): void;
  /** Beendet alle dauerhaften Quellen zum Zeitpunkt `at`. */
  stop(at: number): void;
}

export type AmbienceFactory = (kit: Kit, out: Out, t0: number) => Ambience;
export type Stream = (until: number, now: number) => void;

export const SILENT = 0.0001;

export function rand(kit: Kit, a: number, b: number): number {
  return a + (b - a) * kit.rnd();
}

export function pick<T>(kit: Kit, list: readonly T[]): T {
  return list[Math.min(list.length - 1, Math.floor(kit.rnd() * list.length))];
}

export function midiHz(midi: number): number {
  return 440 * 2 ** ((midi - 69) / 12);
}

export function createKit(ctx: BaseAudioContext, rnd: () => number): Kit {
  return {
    ctx,
    rnd,
    noise: noiseBuffer(ctx, 4, rnd),
    pulse25: pulseWave(ctx, 0.25),
    pulse12: pulseWave(ctx, 0.125),
  };
}

export function noiseBuffer(ctx: BaseAudioContext, seconds: number, rnd: () => number): AudioBuffer {
  const length = Math.max(1, Math.floor(ctx.sampleRate * seconds));
  const buffer = ctx.createBuffer(2, length, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch);
    for (let i = 0; i < data.length; i++) data[i] = rnd() * 2 - 1;
  }
  return buffer;
}

/** Stereo-Impulsantwort aus abklingendem Rauschen für einen ConvolverNode. */
export function impulse(ctx: BaseAudioContext, seconds: number, decay: number, rnd: () => number): AudioBuffer {
  const length = Math.max(1, Math.floor(ctx.sampleRate * seconds));
  const buffer = ctx.createBuffer(2, length, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch);
    const n = data.length;
    for (let i = 0; i < n; i++) data[i] = (rnd() * 2 - 1) * (1 - i / n) ** decay;
  }
  return buffer;
}

function pulseWave(ctx: BaseAudioContext, duty: number): PeriodicWave | null {
  if (typeof ctx.createPeriodicWave !== 'function') return null;
  const harmonics = 40;
  const real = new Float32Array(harmonics);
  const imag = new Float32Array(harmonics);
  for (let n = 1; n < harmonics; n++) {
    real[n] = (2 / (n * Math.PI)) * Math.sin(2 * Math.PI * n * duty);
    imag[n] = (2 / (n * Math.PI)) * (1 - Math.cos(2 * Math.PI * n * duty));
  }
  try {
    return ctx.createPeriodicWave(real, imag);
  } catch {
    return null;
  }
}

export function gain(ctx: BaseAudioContext, value: number, dest?: AudioNode | AudioParam | null): GainNode {
  const node = ctx.createGain();
  node.gain.value = value;
  if (dest) connect(node, dest);
  return node;
}

export function biquad(
  ctx: BaseAudioContext,
  type: BiquadFilterType,
  frequency: number,
  q: number,
  dest?: AudioNode | null,
): BiquadFilterNode {
  const node = ctx.createBiquadFilter();
  node.type = type;
  node.frequency.value = frequency;
  node.Q.value = q;
  if (dest) node.connect(dest);
  return node;
}

function connect(node: AudioNode, dest: AudioNode | AudioParam): void {
  // Zwei Überladungen von connect – getrennt aufrufen, damit TypeScript zufrieden ist.
  if (isParam(dest)) node.connect(dest);
  else node.connect(dest);
}

function isParam(x: AudioNode | AudioParam): x is AudioParam {
  return typeof (x as AudioParam).setValueAtTime === 'function' && typeof (x as AudioNode).connect !== 'function';
}

/** Stereo-Panner vor `dest`, falls verfügbar; sonst `dest` selbst. */
export function pan(kit: Kit, dest: AudioNode, value: number): AudioNode {
  const ctx = kit.ctx;
  if (typeof ctx.createStereoPanner !== 'function') return dest;
  const node = ctx.createStereoPanner();
  node.pan.value = Math.max(-1, Math.min(1, value));
  node.connect(dest);
  return node;
}

/** Eingang, der in trocken und Hall verteilt. */
export function bus(kit: Kit, out: Out, dry: number, wet: number): GainNode {
  const input = gain(kit.ctx, 1);
  if (dry > 0) input.connect(gain(kit.ctx, dry, out.dry));
  if (wet > 0) input.connect(gain(kit.ctx, wet, out.wet));
  return input;
}

/**
 * Hüllkurve: linearer Anstieg auf `peak`, Halten, exponentielles Ausklingen.
 * Liefert den Endzeitpunkt.
 */
export function envelope(param: AudioParam, t: number, peak: number, attack: number, hold: number, release: number): number {
  const a = Math.max(0.002, attack);
  const r = Math.max(0.005, release);
  const p = Math.max(SILENT * 2, peak);
  param.setValueAtTime(0, t);
  param.linearRampToValueAtTime(p, t + a);
  if (hold > 0) param.setValueAtTime(p, t + a + hold);
  param.exponentialRampToValueAtTime(SILENT, t + a + hold + r);
  return t + a + hold + r;
}

export interface FilterSpec {
  type: BiquadFilterType;
  freq: number;
  q?: number;
  /** Zielfrequenz am Ende der Hüllkurve. */
  to?: number;
}

export interface ToneSpec {
  t: number;
  freq: number;
  /** Exponentielles Gleiten zur Zielfrequenz über `glide` Sekunden (Standard: ganze Note). */
  to?: number;
  glide?: number;
  /** Frequenzverlauf: [Zeit ab t, Faktor] – exponentiell verbunden. */
  bend?: readonly (readonly [number, number])[];
  type?: OscillatorType;
  wave?: PeriodicWave | null;
  detune?: number;
  gain: number;
  attack?: number;
  hold?: number;
  release: number;
  filter?: FilterSpec;
  pan?: number;
}

/** Einmalige Note; räumt sich nach dem Ausklingen selbst auf. */
export function tone(kit: Kit, dest: AudioNode, s: ToneSpec): OscillatorNode {
  const ctx = kit.ctx;
  const o = ctx.createOscillator();
  if (s.wave) o.setPeriodicWave(s.wave);
  else o.type = s.type ?? 'sine';
  const attack = s.attack ?? 0.005;
  const hold = s.hold ?? 0;
  const length = Math.max(0.002, attack) + hold + Math.max(0.005, s.release);
  o.frequency.setValueAtTime(Math.max(1, s.freq), s.t);
  if (s.to) o.frequency.exponentialRampToValueAtTime(Math.max(1, s.to), s.t + (s.glide ?? length));
  if (s.bend) {
    for (const [dt, ratio] of s.bend) o.frequency.exponentialRampToValueAtTime(Math.max(1, s.freq * ratio), s.t + dt);
  }
  if (s.detune) o.detune.value = s.detune;
  const g = ctx.createGain();
  const end = envelope(g.gain, s.t, s.gain, attack, hold, s.release);
  const target = s.pan !== undefined ? pan(kit, dest, s.pan) : dest;
  let head: AudioNode = o;
  let filterNode: BiquadFilterNode | null = null;
  if (s.filter) {
    filterNode = biquad(ctx, s.filter.type, s.filter.freq, s.filter.q ?? 0.7);
    filterNode.frequency.setValueAtTime(s.filter.freq, s.t);
    if (s.filter.to) filterNode.frequency.exponentialRampToValueAtTime(Math.max(1, s.filter.to), end);
    o.connect(filterNode);
    head = filterNode;
  }
  head.connect(g);
  g.connect(target);
  o.start(s.t);
  o.stop(end + 0.02);
  o.onended = () => {
    g.disconnect();
    filterNode?.disconnect();
    if (target !== dest) target.disconnect();
  };
  return o;
}

export interface NoiseSpec {
  t: number;
  gain: number;
  attack?: number;
  hold?: number;
  release: number;
  filter?: FilterSpec;
  rate?: number;
  pan?: number;
}

/** Einmaliger Rauschstoß, optional gefiltert. */
export function noiseHit(kit: Kit, dest: AudioNode, s: NoiseSpec): AudioBufferSourceNode {
  const ctx = kit.ctx;
  const src = ctx.createBufferSource();
  src.buffer = kit.noise;
  if (s.rate) src.playbackRate.value = s.rate;
  const g = ctx.createGain();
  const end = envelope(g.gain, s.t, s.gain, s.attack ?? 0.002, s.hold ?? 0, s.release);
  const target = s.pan !== undefined ? pan(kit, dest, s.pan) : dest;
  let head: AudioNode = src;
  let filterNode: BiquadFilterNode | null = null;
  if (s.filter) {
    filterNode = biquad(ctx, s.filter.type, s.filter.freq, s.filter.q ?? 0.7);
    filterNode.frequency.setValueAtTime(s.filter.freq, s.t);
    if (s.filter.to) filterNode.frequency.exponentialRampToValueAtTime(Math.max(1, s.filter.to), end);
    src.connect(filterNode);
    head = filterNode;
  }
  head.connect(g);
  g.connect(target);
  const duration = kit.noise.duration || 1;
  const offset = Math.max(0, kit.rnd() * (duration - (end - s.t) - 0.05));
  src.start(s.t, offset);
  src.stop(end + 0.02);
  src.onended = () => {
    g.disconnect();
    filterNode?.disconnect();
    if (target !== dest) target.disconnect();
  };
  return src;
}

/** Dauerhafte Rauschschleife ab `t` (Startpunkt im Puffer zufällig). */
export function noiseLoop(kit: Kit, dest: AudioNode, t: number, rate = 1): AudioBufferSourceNode {
  const src = kit.ctx.createBufferSource();
  src.buffer = kit.noise;
  src.loop = true;
  if (rate !== 1) src.playbackRate.value = rate;
  src.connect(dest);
  src.start(t, kit.rnd() * (kit.noise.duration || 1));
  return src;
}

/** Dauerhafter Oszillator ab `t`. */
export function osc(kit: Kit, type: OscillatorType, freq: number, dest: AudioNode, t: number, detune = 0): OscillatorNode {
  const o = kit.ctx.createOscillator();
  o.type = type;
  o.frequency.value = freq;
  if (detune) o.detune.value = detune;
  o.connect(dest);
  o.start(t);
  return o;
}

/** Niederfrequente Modulation eines Parameters um seinen Grundwert. */
export function lfo(kit: Kit, target: AudioParam, rate: number, depth: number, t: number, type: OscillatorType = 'sine'): OscillatorNode {
  const o = kit.ctx.createOscillator();
  o.type = type;
  o.frequency.value = rate;
  const g = kit.ctx.createGain();
  g.gain.value = depth;
  o.connect(g);
  g.connect(target);
  o.start(t);
  return o;
}

/**
 * Ereignisstrom: ruft `step(t, play)` für jeden fälligen Zeitpunkt bis `until`.
 * `play` ist false, wenn der Zeitpunkt schon verstrichen ist (Hänger im Hauptthread) –
 * dann soll nur der Zustand fortgeschrieben, aber nichts gespielt werden.
 */
export function stream(first: number, step: (t: number, play: boolean) => number): Stream {
  let t = first;
  return (until, now) => {
    let guard = 0;
    while (t < until && guard++ < 256) {
      const dt = step(t, t >= now - 0.03);
      t += Math.max(0.01, Number.isFinite(dt) ? dt : 1);
    }
  };
}

/** Sammelt dauerhafte Quellen und Knoten einer Ambience, damit sie sauber enden. */
export function voices() {
  const sources: AudioScheduledSourceNode[] = [];
  const nodes: AudioNode[] = [];
  return {
    add<T extends AudioScheduledSourceNode>(source: T): T {
      sources.push(source);
      return source;
    },
    own<T extends AudioNode>(node: T): T {
      nodes.push(node);
      return node;
    },
    ambience(streams: readonly Stream[]): Ambience {
      let stopped = false;
      return {
        schedule(until, now) {
          if (stopped) return;
          for (const s of streams) s(until, now);
        },
        stop(at) {
          if (stopped) return;
          stopped = true;
          for (const s of sources) {
            try { s.stop(at); } catch { /* bereits gestoppt */ }
          }
          for (const n of nodes) {
            try { n.disconnect(); } catch { /* egal */ }
          }
        },
      };
    },
  };
}
