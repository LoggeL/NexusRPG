// Chiptune-Musik: Titelthema, hoffnungsvolle Endvariante und der gedämpfte
// 80er-Rock aus Jenkins' Bar. Sequenziert über Ereignisströme, daher ohne Naht.

import {
  type Ambience, type AmbienceFactory, type Kit, type Out,
  biquad, bus, gain, lfo, midiHz, noiseHit, noiseLoop, rand, stream, tone, voices,
} from './synth';

const AEOLIAN = [0, 2, 3, 5, 7, 8, 10] as const;
const IONIAN = [0, 2, 4, 5, 7, 9, 11] as const;

function degree(mode: readonly number[], d: number): number {
  const octave = Math.floor(d / 7);
  return mode[((d % 7) + 7) % 7] + 12 * octave;
}

function wrap(midi: number, low: number, high: number): number {
  let m = midi;
  while (m > high) m -= 12;
  while (m < low) m += 12;
  return m;
}

// ---------------------------------------------------------------------------
// Titelthema: 16 Takte, Melodie als Skalenstufen (0 = Grundton A).
// Moll (äolisch) für den Titel, Dur (ionisch) für das Ende – dieselbe Linie.

type Note = readonly [deg: number | null, beats: number];

const THEME: readonly (readonly Note[])[] = [
  [[4, 2], [2, 1], [0, 1]],
  [[2, 1.5], [3, 0.5], [2, 1], [0, 1]],
  [[4, 1], [3, 1], [4, 2]],
  [[3, 3], [null, 1]],
  [[4, 2], [2, 1], [0, 1]],
  [[5, 1], [4, 1], [2, 1], [0, 1]],
  [[3, 2], [1, 2]],
  [[1, 3], [null, 1]],
  [[7, 2], [5, 1], [7, 1]],
  [[8, 1.5], [7, 0.5], [6, 2]],
  [[6, 2], [4, 2]],
  [[7, 3], [null, 1]],
  [[5, 1.5], [4, 0.5], [3, 2]],
  [[2, 1], [0, 1], [2, 1], [4, 1]],
  [[1, 1.5], [0, 0.5], [1, 2]],
  [[0, 3], [null, 1]],
];

interface Chord { d: number; major?: boolean }

interface ThemeVariant {
  mode: readonly number[];
  bpm: number;
  chords: readonly Chord[];
  /** Ab diesem Takt laufen Arpeggien mit. */
  arpFrom: number;
  shaker: boolean;
  bassBeats: readonly number[];
  leadGain: number;
  bright: boolean;
}

const c = (d: number, major = false): Chord => ({ d, major });

const TITLE: ThemeVariant = {
  mode: AEOLIAN,
  bpm: 96, // 16 Takte ≈ 40 s
  chords: [c(0), c(5), c(2), c(6), c(0), c(5), c(6), c(4, true), c(5), c(6), c(4), c(0), c(3), c(0), c(4, true), c(0)],
  arpFrom: 8,
  shaker: false,
  bassBeats: [0, 2],
  leadGain: 0.05,
  bright: false,
};

const ENDING: ThemeVariant = {
  mode: IONIAN,
  bpm: 104, // 16 Takte ≈ 37 s
  chords: [c(0), c(5), c(2), c(4), c(0), c(5), c(4), c(4), c(3), c(4), c(2), c(0), c(3), c(0), c(4), c(0)],
  arpFrom: 0,
  shaker: true,
  bassBeats: [0, 1.5, 2, 3],
  leadGain: 0.05,
  bright: true,
};

function chordTones(variant: ThemeVariant, chord: Chord): number[] {
  const tones = [chord.d, chord.d + 2, chord.d + 4].map(x => degree(variant.mode, x));
  if (chord.major) tones[1] += 1;
  return tones;
}

function theme(variant: ThemeVariant): AmbienceFactory {
  return (kit: Kit, out: Out, t0: number): Ambience => {
    const { ctx } = kit;
    const v = voices();
    const beat = 60 / variant.bpm;
    const barLength = beat * 4;

    // Lead mit Echo (Delay mit Rückkopplung, gefiltert).
    const lead = bus(kit, out, 1, 0.35);
    const leadTone = biquad(ctx, 'lowpass', variant.bright ? 3200 : 2400, 0.6, lead);
    const echo = v.own(ctx.createDelay(2));
    echo.delayTime.value = beat * 0.75;
    const feedback = v.own(gain(ctx, 0.3, echo));
    const echoTone = v.own(biquad(ctx, 'lowpass', 1600, 0.5, feedback));
    echo.connect(echoTone);
    echoTone.connect(gain(ctx, 0.4, lead));
    const leadIn = v.own(gain(ctx, 1, leadTone));
    leadIn.connect(echo);

    const pad = bus(kit, out, 0.8, 0.6);
    const padTone = v.own(biquad(ctx, 'lowpass', variant.bright ? 1100 : 800, 0.5, pad));
    v.add(lfo(kit, padTone.frequency, 0.07, 220, t0));
    const low = bus(kit, out, 1, 0.1);
    const arp = bus(kit, out, 0.8, 0.5);
    const shaker = variant.shaker ? bus(kit, out, 0.7, 0.2) : null;

    // Ganz leises Meeresrauschen als Bett, damit die Pausen nicht „tot“ wirken.
    const sea = gain(ctx, 0.012, out.dry);
    v.add(lfo(kit, sea.gain, 0.09, 0.008, t0));
    v.add(noiseLoop(kit, biquad(ctx, 'lowpass', 420, 0.5, sea), t0, 0.5));

    let bar = 0;
    const bars = stream(t0, (t, play) => {
      const index = bar % THEME.length;
      bar++;
      if (!play) return barLength;
      const chord = variant.chords[index];
      const tones = chordTones(variant, chord);

      // Melodie
      let pos = 0;
      for (const [deg, beats] of THEME[index]) {
        if (deg !== null) {
          const length = beats * beat;
          tone(kit, leadIn, {
            t: t + pos * beat, freq: midiHz(69 + degree(variant.mode, deg)), wave: kit.pulse25, type: 'square',
            detune: rand(kit, -4, 4), gain: variant.leadGain, attack: 0.012, hold: Math.max(0.05, length * 0.7), release: 0.35,
          });
        }
        pos += beats;
      }

      // Fläche: je Akkordton zwei leicht verstimmte Sägezähne, weich überlappend.
      for (const semi of tones) {
        const freq = midiHz(wrap(57 + semi, 52, 66));
        for (const detune of [-7, 7]) {
          tone(kit, padTone, { t, freq, type: 'sawtooth', detune, gain: 0.011, attack: 0.7, hold: barLength - 0.5, release: 1.4 });
        }
      }

      // Bass
      const root = midiHz(wrap(45 + tones[0], 40, 52));
      for (const b of variant.bassBeats) {
        tone(kit, low, { t: t + b * beat, freq: root, type: 'triangle', gain: 0.09, attack: 0.01, hold: beat * 0.9, release: 0.25 });
      }

      // Arpeggio in Achteln
      if (index >= variant.arpFrom) {
        const arpNotes = tones.map(s => wrap(69 + s, 64, 78)).sort((a, b) => a - b);
        const order = [0, 1, 2, 1, 0, 1, 2, 1];
        order.forEach((n, i) => {
          tone(kit, arp, {
            t: t + i * beat * 0.5, freq: midiHz(arpNotes[n] + 12), type: 'triangle',
            wave: variant.bright ? kit.pulse12 : null, gain: variant.bright ? 0.012 : 0.016, attack: 0.004, release: 0.22,
          });
        });
      }

      if (shaker) {
        for (let i = 0; i < 8; i++) {
          noiseHit(kit, shaker, { t: t + i * beat * 0.5, gain: i % 2 ? 0.012 : 0.006, release: 0.05, filter: { type: 'highpass', freq: 6000 } });
        }
      }
      return barLength;
    });
    return v.ambience([bars]);
  };
}

export const titleTheme = theme(TITLE);
export const endingTheme = theme(ENDING);

// ---------------------------------------------------------------------------
// Bar: gedämpfter 80er-Rock „durch die Wand“ – Powerchords, Bass, einfacher Beat.

const ROCK_ROOTS = [52, 52, 48, 50, 52, 52, 55, 57] as const; // E E C D E E G A
const ROCK_BPM = 128;

export function barRock(kit: Kit, out: Out, t0: number): Ambience {
  const { ctx } = kit;
  const v = voices();
  const eighth = 60 / ROCK_BPM / 2;

  // Die Wand: zwei Tiefpässe hintereinander, wenig Hall.
  const wall = gain(ctx, 0.6, bus(kit, out, 1, 0.22));
  const wall2 = v.own(biquad(ctx, 'lowpass', 900, 0.7, wall));
  const wallIn = v.own(biquad(ctx, 'lowpass', 520, 1, wall2));

  // Raum vor der Wand: leises Grundrauschen.
  v.add(noiseLoop(kit, biquad(ctx, 'lowpass', 300, 0.5, gain(ctx, 0.04, out.dry)), t0, 0.5));

  let step = 0;
  const steps = stream(t0, (t, play) => {
    const barIndex = Math.floor(step / 8) % ROCK_ROOTS.length;
    const s = step % 8;
    step++;
    if (!play) return eighth;
    const root = ROCK_ROOTS[barIndex];
    const lastBar = barIndex === ROCK_ROOTS.length - 1;

    // Gitarre: abgedämpfte Achtel, Akzente klingen länger.
    const open = s === 0 || s === 3 || s === 6;
    const len = open ? 0.26 : 0.07;
    const level = open ? 0.03 : 0.022;
    for (const interval of [0, 7, 12]) {
      const freq = midiHz(root + interval);
      tone(kit, wallIn, { t, freq, type: 'square', gain: level, attack: 0.003, hold: len, release: 0.08 });
      tone(kit, wallIn, { t, freq, type: 'sawtooth', detune: 9, gain: level * 0.8, attack: 0.003, hold: len, release: 0.08 });
    }
    // Bass
    tone(kit, wallIn, { t, freq: midiHz(root - 12), type: 'square', gain: 0.07, attack: 0.004, hold: eighth * 0.6, release: 0.06 });

    // Schlagzeug
    if (s === 0 || s === 3 || s === 4) {
      tone(kit, wallIn, { t, freq: 140, to: 45, glide: 0.12, gain: 0.45, attack: 0.002, release: 0.24 });
    }
    const snare = s === 2 || s === 6 || (lastBar && s >= 4);
    if (snare) {
      const fill = lastBar && s >= 4 ? 0.6 + (s - 4) * 0.15 : 1;
      noiseHit(kit, wallIn, { t, gain: 0.25 * fill, release: 0.14, filter: { type: 'bandpass', freq: 1800, q: 0.8 } });
      tone(kit, wallIn, { t, freq: 190, to: 150, type: 'triangle', gain: 0.12 * fill, release: 0.08 });
    }
    noiseHit(kit, wallIn, { t, gain: s === 7 ? 0.06 : 0.035, release: s === 7 ? 0.12 : 0.035, filter: { type: 'highpass', freq: 7000 } });
    return eighth;
  });
  return v.ambience([steps]);
}
