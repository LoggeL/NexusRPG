// Umgebungsklänge je Kartentyp. Dauerhafte Betten laufen als nahtlose Rauschschleifen
// bzw. Oszillatoren, alles Wiederkehrende wird zufällig über Ereignisströme geplant –
// so entsteht keine hörbare Schleifennaht.

import type { AmbienceId } from '../../modules/contracts';
import {
  type Ambience, type AmbienceFactory, type Kit, type Out, type Stream,
  biquad, bus, gain, lfo, noiseHit, noiseLoop, osc, pan, pick, rand, stream, tone, voices,
} from './synth';
import { barRock } from './music';

type Voices = ReturnType<typeof voices>;

/** Leichter Wind: bandbegrenztes Rauschen mit langsam wandernder Mitte und Lautstärke. */
function wind(kit: Kit, v: Voices, dest: AudioNode, t0: number, level: number, center: number, q = 0.7): GainNode {
  const g = gain(kit.ctx, level, dest);
  const bp = biquad(kit.ctx, 'bandpass', center, q, g);
  v.add(noiseLoop(kit, bp, t0, 0.5));
  v.add(lfo(kit, bp.frequency, rand(kit, 0.035, 0.07), center * 0.4, t0));
  v.add(lfo(kit, g.gain, rand(kit, 0.045, 0.09), level * 0.5, t0));
  return g;
}

// ---------------------------------------------------------------------------

/** Höhle: tiefes Brummen, Grollen, Tropfen mit viel Hall. */
function cave(kit: Kit, out: Out, t0: number): Ambience {
  const { ctx } = kit;
  const v = voices();
  const bed = bus(kit, out, 1, 0.25);
  const hum = gain(ctx, 0.05, bed);
  v.add(osc(kit, 'sine', 55, hum, t0));
  v.add(osc(kit, 'sine', 82.6, gain(ctx, 0.45, hum), t0));
  v.add(lfo(kit, hum.gain, 0.06, 0.018, t0));
  v.add(noiseLoop(kit, biquad(ctx, 'lowpass', 130, 0.5, gain(ctx, 0.12, bed)), t0, 0.5));

  const drops = bus(kit, out, 0.3, 1.1);
  const drop = (t: number) => {
    const f = rand(kit, 700, 1500);
    tone(kit, drops, {
      t, freq: f, to: f * rand(kit, 1.6, 2.4), glide: 0.05,
      gain: rand(kit, 0.05, 0.1), attack: 0.002, release: rand(kit, 0.08, 0.14), pan: rand(kit, -0.7, 0.7),
    });
  };
  const dropStream = stream(t0 + rand(kit, 0.4, 1.4), (t, play) => {
    if (play) {
      drop(t);
      if (kit.rnd() < 0.22) drop(t + rand(kit, 0.12, 0.3));
    }
    return rand(kit, 0.8, 3.4);
  });
  return v.ambience([dropStream]);
}

/** Strand: Wellen aus gefiltertem Rauschen mit langsamer Hüllkurve, gelegentliche Möwen. */
function beach(kit: Kit, out: Out, t0: number): Ambience {
  const { ctx } = kit;
  const v = voices();
  const sea = bus(kit, out, 1, 0.12);
  v.add(noiseLoop(kit, biquad(ctx, 'lowpass', 260, 0.5, gain(ctx, 0.05, sea)), t0));

  const waveLayer = (side: number, start: number): Stream => {
    const out1 = pan(kit, sea, side);
    const body = gain(ctx, 0, out1);
    const lp = biquad(ctx, 'lowpass', 320, 0.6, body);
    v.add(noiseLoop(kit, lp, t0));
    const fizz = gain(ctx, 0, out1);
    v.add(noiseLoop(kit, biquad(ctx, 'highpass', 2600, 0.5, fizz), t0));
    body.gain.setValueAtTime(0.01, t0);
    lp.frequency.setValueAtTime(320, t0);
    fizz.gain.setValueAtTime(0, t0);
    return stream(start, t => {
      const len = rand(kit, 6.5, 10.5);
      const rise = len * rand(kit, 0.33, 0.45);
      const peak = rand(kit, 0.12, 0.22);
      body.gain.linearRampToValueAtTime(peak, t + rise);
      body.gain.linearRampToValueAtTime(0.01, t + len);
      lp.frequency.exponentialRampToValueAtTime(rand(kit, 1000, 1700), t + rise);
      lp.frequency.exponentialRampToValueAtTime(320, t + len);
      fizz.gain.linearRampToValueAtTime(0, t + rise * 0.7);
      fizz.gain.linearRampToValueAtTime(peak * 0.12, t + rise + 0.7);
      fizz.gain.linearRampToValueAtTime(0, t + len);
      return len;
    });
  };
  const waves = [waveLayer(-0.45, t0), waveLayer(0.45, t0 + rand(kit, 2.5, 4.5))];

  const birds = bus(kit, out, 0.45, 0.6);
  const gull = (t: number, side: number) => {
    const f = rand(kit, 1250, 1650);
    tone(kit, birds, {
      t, freq: f * 0.8, type: 'sawtooth', bend: [[0.06, 1.12], [0.34, 0.7]],
      gain: rand(kit, 0.012, 0.022), attack: 0.04, hold: 0.06, release: 0.28,
      filter: { type: 'bandpass', freq: 1700, q: 1.4 }, pan: side,
    });
  };
  const gulls = stream(t0 + rand(kit, 4, 9), (t, play) => {
    if (play) {
      const side = rand(kit, -0.8, 0.8);
      const n = 1 + Math.floor(kit.rnd() * 3);
      let at = t;
      for (let i = 0; i < n; i++) {
        gull(at, side);
        at += rand(kit, 0.35, 0.6);
      }
    }
    return rand(kit, 10, 24);
  });
  return v.ambience([...waves, gulls]);
}

/** Straße: Wind und fernes Trommeln. Keine Stimmen (die kommen nur aus den Hintergrundstimmen). */
function village(kit: Kit, out: Out, t0: number): Ambience {
  const { ctx } = kit;
  const v = voices();
  const air = bus(kit, out, 1, 0.1);
  wind(kit, v, air, t0, 0.025, 450);

  // Ferne Trommeln: dumpf, viel Hall.
  const drumIn = biquad(ctx, 'lowpass', 380, 0.7, bus(kit, out, 0.8, 0.9));
  v.own(drumIn);
  const patterns = [
    [1, 0, 1, 0, 1, 1, 0, 1],
    [1, 0, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1],
    [1, 1, 0, 1, 0, 1, 0, 0, 1],
  ] as const;
  const drums = stream(t0 + rand(kit, 2, 5), (t, play) => {
    if (play) {
      const pattern = pick(kit, patterns);
      const spacing = rand(kit, 0.24, 0.3);
      const repeats = 1 + Math.floor(kit.rnd() * 2);
      for (let r = 0; r < repeats; r++) {
        pattern.forEach((hit, i) => {
          if (!hit) return;
          const at = t + (r * pattern.length + i) * spacing;
          const accent = i === 0 ? 1.4 : 1;
          tone(kit, drumIn, { t: at, freq: 108, to: 62, glide: 0.2, gain: 0.08 * accent, attack: 0.003, release: 0.36 });
          noiseHit(kit, drumIn, { t: at, gain: 0.025 * accent, release: 0.08, filter: { type: 'lowpass', freq: 320 } });
        });
      }
      return repeats * pattern.length * spacing + rand(kit, 6, 13);
    }
    return rand(kit, 6, 13);
  });

  return v.ambience([drums]);
}

/** Krater: hohler Wind mit Resonanzen und Böen. */
function crater(kit: Kit, out: Out, t0: number): Ambience {
  const { ctx } = kit;
  const v = voices();
  const gust = gain(ctx, 0.45, bus(kit, out, 1, 0.35));
  for (const [freq, q, level] of [[320, 9, 0.22], [470, 11, 0.14], [210, 6, 0.16]] as const) {
    const bp = biquad(ctx, 'bandpass', freq, q, gain(ctx, level, gust));
    v.add(noiseLoop(kit, bp, t0, 0.7));
    v.add(lfo(kit, bp.frequency, rand(kit, 0.03, 0.08), freq * 0.12, t0));
  }
  v.add(noiseLoop(kit, biquad(ctx, 'lowpass', 380, 0.5, gain(ctx, 0.05, gust)), t0));
  gust.gain.setValueAtTime(0.45, t0);
  const gusts = stream(t0 + rand(kit, 1, 3), t => {
    const len = rand(kit, 5, 11);
    gust.gain.linearRampToValueAtTime(rand(kit, 0.7, 1), t + len * rand(kit, 0.3, 0.5));
    gust.gain.linearRampToValueAtTime(rand(kit, 0.3, 0.5), t + len);
    return len;
  });
  return v.ambience([gusts]);
}

/** Störsender: gleichmäßiges elektrisches Summen mit Modulation, Funkrauschen. */
function jammer(kit: Kit, out: Out, t0: number): Ambience {
  const { ctx } = kit;
  const v = voices();
  const humBus = bus(kit, out, 1, 0.15);
  const humAmp = gain(ctx, 0.05, humBus);
  v.add(lfo(kit, humAmp.gain, 0.37, 0.012, t0));
  v.add(lfo(kit, humAmp.gain, 5.5, 0.004, t0));
  const humLp = biquad(ctx, 'lowpass', 520, 1.2, humAmp);
  v.add(lfo(kit, humLp.frequency, 0.11, 180, t0));
  v.add(osc(kit, 'sawtooth', 50, humLp, t0));
  v.add(osc(kit, 'square', 100, gain(ctx, 0.35, humLp), t0));
  v.add(osc(kit, 'sine', 150.6, gain(ctx, 0.4, humAmp), t0));

  const radio = bus(kit, out, 1, 0.1);
  const statik = gain(ctx, 0.012, radio);
  v.add(lfo(kit, statik.gain, 0.23, 0.007, t0));
  v.add(noiseLoop(kit, biquad(ctx, 'bandpass', 2400, 0.8, statik), t0));

  const crackle = stream(t0 + 0.2, (t, play) => {
    if (play && kit.rnd() < 0.7) {
      noiseHit(kit, radio, {
        t, gain: rand(kit, 0.006, 0.03), attack: 0.001, release: rand(kit, 0.005, 0.02),
        filter: { type: 'highpass', freq: 3500 }, pan: rand(kit, -0.4, 0.4),
      });
    }
    return rand(kit, 0.04, 0.4);
  });
  const sweeps = stream(t0 + rand(kit, 4, 8), (t, play) => {
    if (play) {
      if (kit.rnd() < 0.6) {
        const f = rand(kit, 500, 800);
        tone(kit, radio, { t, freq: f, to: f * 2.2, glide: 1.4, gain: 0.008, attack: 0.2, hold: 0.8, release: 0.5 });
      } else {
        const n = 3 + Math.floor(kit.rnd() * 4);
        for (let i = 0; i < n; i++) {
          tone(kit, radio, { t: t + i * 0.16, freq: 880, gain: 0.006, attack: 0.005, hold: kit.rnd() < 0.5 ? 0.04 : 0.1, release: 0.02 });
        }
      }
    }
    return rand(kit, 9, 17);
  });
  return v.ambience([crackle, sweeps]);
}

/** Innenraum: leiser Raumton, selten ein Knarzen. */
function interior(kit: Kit, out: Out, t0: number): Ambience {
  const { ctx } = kit;
  const v = voices();
  const room = bus(kit, out, 1, 0.06);
  v.add(noiseLoop(kit, biquad(ctx, 'lowpass', 170, 0.5, gain(ctx, 0.07, room)), t0, 0.5));
  v.add(noiseLoop(kit, biquad(ctx, 'bandpass', 1800, 0.4, gain(ctx, 0.003, room)), t0));
  const creakBus = bus(kit, out, 0.7, 0.4);
  const creaks = stream(t0 + rand(kit, 6, 14), (t, play) => {
    if (play) {
      const bend: [number, number][] = [];
      for (let i = 1; i <= 6; i++) bend.push([i * 0.09, rand(kit, 0.85, 1.2)]);
      tone(kit, creakBus, {
        t, freq: rand(kit, 70, 110), type: 'sawtooth', bend,
        gain: 0.014, attack: 0.05, hold: 0.35, release: 0.2,
        filter: { type: 'bandpass', freq: 700, q: 5 }, pan: rand(kit, -0.6, 0.6),
      });
    }
    return rand(kit, 14, 30);
  });
  return v.ambience([creaks]);
}

/**
 * Bezirks-Ambiences (Platzhalter aus dem vorhandenen Klangfundus; eigene Stimmungen folgen):
 * Unterstadt = Wind und ferne Trommeln (keine Stimmen), Club = treibender Beat, Oberstadt/Labor = elektrisches Summen,
 * Kanal = tropfende Höhle, Ödnis = hohler Wind, Meer = Wellen, Innen = Raumton.
 */
export const AMBIENCES: Record<AmbienceId, AmbienceFactory> = {
  unterstadt: village,
  club: barRock,
  oberstadt: jammer,
  kanal: cave,
  oednis: crater,
  meer: beach,
  innen: interior,
  labor: jammer,
};
