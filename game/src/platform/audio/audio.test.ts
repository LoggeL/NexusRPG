import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AMBIENCE_KEYS, SFX_IDS, createAudio } from './index';

// ---------------------------------------------------------------------------
// Gemockter AudioContext: zeichnet Knoten und Automationen auf und prüft dabei,
// dass keine ungültigen Werte geplant werden (NaN, exponentielle Rampen auf ≤ 0).

interface Call { method: string; args: number[] }

class MockParam {
  value: number;
  calls: Call[] = [];
  constructor(value = 0) { this.value = value; }
  private record(method: string, args: number[]) {
    for (const a of args) if (!Number.isFinite(a)) throw new Error(`${method}: ungültiger Wert ${a}`);
    this.calls.push({ method, args });
  }
  setValueAtTime(v: number, t: number) { this.record('setValueAtTime', [v, t]); this.value = v; return this; }
  linearRampToValueAtTime(v: number, t: number) { this.record('linearRampToValueAtTime', [v, t]); return this; }
  exponentialRampToValueAtTime(v: number, t: number) {
    if (v <= 0) throw new RangeError('exponentielle Rampe auf ≤ 0');
    this.record('exponentialRampToValueAtTime', [v, t]);
    return this;
  }
  setTargetAtTime(v: number, t: number, c: number) { this.record('setTargetAtTime', [v, t, c]); return this; }
  cancelScheduledValues(t: number) { this.record('cancelScheduledValues', [t]); return this; }
  last(method: string) { return [...this.calls].reverse().find(c => c.method === method); }
}

class MockNode {
  kind: string;
  outputs: unknown[] = [];
  disconnected = 0;
  started: number[] = [];
  stopped: number[] = [];
  type = '';
  buffer: unknown = null;
  loop = false;
  onended: (() => void) | null = null;
  gain = new MockParam(1);
  frequency = new MockParam(440);
  detune = new MockParam(0);
  Q = new MockParam(1);
  pan = new MockParam(0);
  playbackRate = new MockParam(1);
  delayTime = new MockParam(0);
  threshold = new MockParam(0);
  knee = new MockParam(0);
  ratio = new MockParam(1);
  attack = new MockParam(0);
  release = new MockParam(0);
  constructor(kind: string) { this.kind = kind; }
  connect(target: unknown) { this.outputs.push(target); return target; }
  disconnect() { this.disconnected++; }
  start(t = 0) { if (!Number.isFinite(t)) throw new Error('start NaN'); this.started.push(t); }
  stop(t = 0) { if (!Number.isFinite(t)) throw new Error('stop NaN'); this.stopped.push(t); }
  setPeriodicWave() { /* nichts */ }
}

class MockContext {
  static instances: MockContext[] = [];
  state: 'suspended' | 'running' | 'closed' = 'running';
  currentTime = 0;
  sampleRate = 800; // klein, damit Puffer billig bleiben
  destination = new MockNode('destination');
  nodes: MockNode[] = [];
  resume = vi.fn(async () => { this.state = 'running'; });
  suspend = vi.fn(async () => { this.state = 'suspended'; });
  close = vi.fn(async () => { this.state = 'closed'; });
  constructor() { MockContext.instances.push(this); }
  private make(kind: string) { const n = new MockNode(kind); this.nodes.push(n); return n; }
  createGain() { return this.make('gain'); }
  createOscillator() { return this.make('osc'); }
  createBiquadFilter() { return this.make('biquad'); }
  createBufferSource() { return this.make('source'); }
  createConvolver() { return this.make('convolver'); }
  createDynamicsCompressor() { return this.make('compressor'); }
  createDelay() { return this.make('delay'); }
  createStereoPanner() { return this.make('panner'); }
  createPeriodicWave() { return {}; }
  createBuffer(channels: number, length: number, sampleRate: number) {
    const data = Array.from({ length: channels }, () => new Float32Array(length));
    return { duration: length / sampleRate, numberOfChannels: channels, getChannelData: (ch: number) => data[ch] };
  }
  of(kind: string) { return this.nodes.filter(n => n.kind === kind); }
}

function seeded(seed = 1) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function setup(extra: Parameters<typeof createAudio>[0] = {}) {
  const audio = createAudio({
    createContext: () => new MockContext() as unknown as AudioContext,
    random: seeded(7),
    pauseWhenHidden: false,
    ...extra,
  });
  return audio;
}

const ctx = () => MockContext.instances[MockContext.instances.length - 1];

/** Musik- und Effektbus: die Gains direkt am Master (Master hängt am Kompressor). */
function buses(c: MockContext) {
  const comp = c.of('compressor')[0];
  const master = c.of('gain').find(g => g.outputs.includes(comp))!;
  const [music, effects] = c.of('gain').filter(g => g.outputs.includes(master));
  return { master, music, effects };
}

beforeEach(() => {
  MockContext.instances = [];
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('Audio ohne WebAudio', () => {
  it('ist ein stilles No-op, wenn kein AudioContext existiert', () => {
    vi.stubGlobal('AudioContext', undefined);
    vi.stubGlobal('webkitAudioContext', undefined);
    const audio = createAudio();
    expect(() => {
      audio.unlock();
      audio.setAmbience('meer');
      audio.sfx('hack');
      audio.setVolumes({ music: 0.2, sfx: 0.3 });
      vi.advanceTimersByTime(1000);
      audio.dispose();
    }).not.toThrow();
    expect(audio.debug()).toMatchObject({ supported: false, unlocked: false });
  });

  it('übersteht einen Konstruktor, der wirft', () => {
    const audio = createAudio({ createContext: () => { throw new Error('nope'); } });
    expect(() => { audio.unlock(); audio.unlock(); audio.sfx('step'); audio.setAmbience('kanal'); }).not.toThrow();
    expect(audio.debug().supported).toBe(false);
    expect(audio.debug().errors).toBe(1);
  });

  it('nutzt den globalen AudioContext, falls vorhanden', () => {
    vi.stubGlobal('AudioContext', MockContext);
    const audio = createAudio({ pauseWhenHidden: false });
    audio.unlock();
    expect(MockContext.instances).toHaveLength(1);
    audio.dispose();
  });
});

describe('Freischalten', () => {
  it('erzeugt den Kontext erst bei unlock() und nur einmal', () => {
    const audio = setup();
    audio.setAmbience('meer');
    audio.sfx('pickup');
    expect(MockContext.instances).toHaveLength(0);
    audio.unlock();
    audio.unlock();
    expect(MockContext.instances).toHaveLength(1);
    expect(audio.debug()).toMatchObject({ unlocked: true, playing: 'meer' });
    audio.dispose();
  });

  it('setzt einen pausierten Kontext beim Freischalten fort', () => {
    const audio = createAudio({
      createContext: () => { const c = new MockContext(); c.state = 'suspended'; return c as unknown as AudioContext; },
      random: seeded(3),
      pauseWhenHidden: false,
    });
    audio.unlock();
    expect(ctx().resume).toHaveBeenCalledTimes(1);
    audio.dispose();
  });
});

describe('Busse und Lautstärken', () => {
  it('legt Musik- und Effektbus mit den Startlautstärken an', () => {
    const audio = setup({ volumes: { music: 0.25, sfx: 0.75 } });
    audio.unlock();
    const { music, effects } = buses(ctx());
    expect(music.gain.value).toBe(0.25);
    expect(effects.gain.value).toBe(0.75);
    audio.dispose();
  });

  it('übernimmt vor unlock() gesetzte Lautstärken', () => {
    const audio = setup();
    audio.setVolumes({ music: 0.1, sfx: 0.9 });
    audio.unlock();
    const { music, effects } = buses(ctx());
    expect(music.gain.value).toBe(0.1);
    expect(effects.gain.value).toBe(0.9);
    audio.dispose();
  });

  it('blendet Lautstärken weich und begrenzt auf 0..1', () => {
    const audio = setup();
    audio.unlock();
    audio.setVolumes({ music: 3, sfx: -1 });
    const { music, effects } = buses(ctx());
    expect(music.gain.last('setTargetAtTime')?.args[0]).toBe(1);
    expect(effects.gain.last('setTargetAtTime')?.args[0]).toBe(0);
    expect(audio.debug().volumes).toEqual({ music: 1, sfx: 0, voices: 0.8 });
    audio.setVolumes({ music: Number.NaN, sfx: 0.5 });
    expect(audio.debug().volumes).toEqual({ music: 1, sfx: 0.5, voices: 0.8 });
    audio.dispose();
  });

  it('spielt Effekte über den Effektbus und Ambiences über den Musikbus', () => {
    const audio = setup();
    audio.unlock();
    const c = ctx();
    const { music, effects } = buses(c);
    audio.setAmbience('kanal');
    const instanceGains = c.of('gain').filter(g => g.outputs.includes(music));
    // Instanz-Dry hängt direkt am Musikbus (zusätzlich zum Hall-Rückweg).
    expect(instanceGains.length).toBeGreaterThanOrEqual(2);
    const before = c.nodes.length;
    audio.sfx('pickup');
    const added = c.nodes.slice(before);
    expect(added.some(n => n.outputs.some(o => o === effects || (o as MockNode).outputs?.includes(effects)))).toBe(true);
    audio.dispose();
  });

  it('erzeugt bei Effektlautstärke 0 keine Knoten', () => {
    const audio = setup({ volumes: { music: 0.5, sfx: 0 } });
    audio.unlock();
    const before = ctx().nodes.length;
    audio.sfx('shot');
    expect(ctx().nodes.length).toBe(before);
    audio.dispose();
  });
});

describe('Ambiences', () => {
  it('blendet beim Wechsel über mindestens 1,5 s', () => {
    const audio = setup();
    audio.unlock();
    const c = ctx();
    const { music } = buses(c);
    audio.setAmbience('meer');
    const beachDry = c.of('gain').filter(g => g.outputs.includes(music)).at(-1)!;
    const fadeIn = beachDry.gain.last('linearRampToValueAtTime')!;
    expect(fadeIn.args[1] - c.currentTime).toBeGreaterThanOrEqual(1.5);

    c.currentTime = 5;
    audio.setAmbience('unterstadt');
    const fadeOut = beachDry.gain.last('linearRampToValueAtTime')!;
    expect(fadeOut.args[0]).toBe(0);
    expect(fadeOut.args[1] - 5).toBeGreaterThanOrEqual(1.5);
    expect(audio.debug()).toMatchObject({ playing: 'unterstadt', fading: ['meer'] });

    // Nach Ablauf der Blende wird die alte Ambience entsorgt.
    c.currentTime = 5 + 2.5;
    vi.advanceTimersByTime(200);
    expect(audio.debug().fading).toEqual([]);
    expect(beachDry.disconnected).toBeGreaterThan(0);
    audio.dispose();
  });

  it('ignoriert dieselbe Ambience und unbekannte IDs', () => {
    const audio = setup();
    audio.unlock();
    audio.setAmbience('kanal');
    const count = ctx().nodes.length;
    audio.setAmbience('kanal');
    expect(ctx().nodes.length).toBe(count);
    audio.setAmbience('lava' as never);
    expect(audio.debug()).toMatchObject({ requested: null, playing: null, fading: ['kanal'] });
    audio.dispose();
  });

  it('null blendet aus', () => {
    const audio = setup();
    audio.unlock();
    audio.setAmbience('title');
    audio.setAmbience(null);
    expect(audio.debug()).toMatchObject({ playing: null, fading: ['title'] });
    audio.dispose();
  });

  it('begrenzt gleichzeitig ausblendende Ambiences bei schnellem Wechsel', () => {
    const audio = setup();
    audio.unlock();
    for (const id of AMBIENCE_KEYS) audio.setAmbience(id);
    expect(audio.debug().fading.length).toBeLessThanOrEqual(3);
    expect(audio.debug().playing).toBe(AMBIENCE_KEYS[AMBIENCE_KEYS.length - 1]);
    audio.dispose();
  });

  it.each(AMBIENCE_KEYS)('%s plant über 90 s gültige Ereignisse', id => {
    const audio = setup();
    audio.unlock();
    audio.setAmbience(id);
    const c = ctx();
    for (let i = 0; i < 900; i++) {
      c.currentTime += 0.1;
      vi.advanceTimersByTime(100);
    }
    expect(audio.debug().playing).toBe(id); // kein Fehler hat die Ambience abgeräumt
    expect(audio.debug().errors).toBe(0);
    const started = c.nodes.filter(n => n.started.length > 0);
    expect(started.length).toBeGreaterThan(0);
    // Alle Starts liegen nicht weit in der Zukunft (Lookahead-Planung).
    for (const n of started) expect(n.started[0]).toBeLessThanOrEqual(c.currentTime + 10);
    audio.dispose();
  });

  it('startet die vor unlock() gewünschte Ambience mit dem Freischalten', () => {
    const audio = setup();
    audio.setAmbience('title');
    expect(audio.debug()).toMatchObject({ requested: 'title', playing: null });
    audio.unlock();
    expect(audio.debug().playing).toBe('title');
    audio.dispose();
  });
});

describe('Effekte', () => {
  it.each(SFX_IDS)('%s erzeugt gültige Knoten', id => {
    const audio = setup();
    audio.unlock();
    const before = ctx().nodes.length;
    audio.sfx(id);
    expect(ctx().nodes.length).toBeGreaterThan(before);
    expect(audio.debug().errors).toBe(0);
    audio.dispose();
  });

  it('drosselt schnell wiederholte Schritte', () => {
    const audio = setup();
    audio.unlock();
    const c = ctx();
    audio.sfx('step');
    const after1 = c.nodes.length;
    audio.sfx('step');
    expect(c.nodes.length).toBe(after1);
    c.currentTime += 0.2;
    audio.sfx('step');
    expect(c.nodes.length).toBeGreaterThan(after1);
    audio.dispose();
  });

  it('spielt nichts, solange der Kontext pausiert ist', () => {
    const audio = createAudio({
      createContext: () => { const c = new MockContext(); c.state = 'suspended'; c.resume = vi.fn(async () => undefined); return c as unknown as AudioContext; },
      pauseWhenHidden: false,
    });
    audio.unlock();
    const before = ctx().nodes.length;
    audio.sfx('door');
    expect(ctx().nodes.length).toBe(before);
    audio.dispose();
  });
});

describe('Aufräumen', () => {
  it('dispose() schließt den Kontext, stoppt den Takt und macht alles zum No-op', () => {
    const audio = setup();
    audio.unlock();
    audio.setAmbience('club');
    const c = ctx();
    audio.dispose();
    expect(c.close).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
    const count = c.nodes.length;
    audio.unlock();
    audio.sfx('hack');
    audio.setAmbience('kanal');
    audio.dispose();
    expect(c.nodes.length).toBe(count);
    expect(MockContext.instances).toHaveLength(1);
  });

  it('pausiert bei verborgenem Tab und setzt danach fort', () => {
    const listeners = new Map<string, () => void>();
    const doc = {
      hidden: false,
      addEventListener: (name: string, fn: () => void) => listeners.set(name, fn),
      removeEventListener: (name: string) => listeners.delete(name),
    };
    vi.stubGlobal('document', doc);
    const audio = setup({ pauseWhenHidden: true });
    audio.unlock();
    const c = ctx();
    doc.hidden = true;
    listeners.get('visibilitychange')?.();
    expect(c.suspend).toHaveBeenCalledTimes(1);
    doc.hidden = false;
    listeners.get('visibilitychange')?.();
    expect(c.resume).toHaveBeenCalled();
    audio.dispose();
    expect(listeners.size).toBe(0);
  });
});
