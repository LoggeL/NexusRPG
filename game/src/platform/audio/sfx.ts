// Kurze Effekte. Jeder Aufruf variiert leicht, damit Wiederholungen nicht ermüden.

import type { SfxId } from '../../modules/contracts';
import { type Kit, type Out, bus, gain, midiHz, noiseHit, pick, rand, tone } from './synth';

export type SfxPlayer = (kit: Kit, out: Out, t: number) => void;

const step: SfxPlayer = (kit, out, t) => {
  const dest = bus(kit, out, 1, 0);
  const side = rand(kit, -0.15, 0.15);
  noiseHit(kit, dest, {
    t, gain: rand(kit, 0.07, 0.12), attack: 0.003, release: rand(kit, 0.04, 0.08),
    filter: { type: 'bandpass', freq: rand(kit, 260, 700), q: 1.2 }, pan: side,
  });
  tone(kit, dest, { t, freq: rand(kit, 90, 130), to: 60, gain: 0.04, attack: 0.002, release: 0.05, pan: side });
};

const pickup: SfxPlayer = (kit, out, t) => {
  const dest = bus(kit, out, 1, 0.25);
  const base = pick(kit, [76, 77, 79]);
  tone(kit, dest, { t, freq: midiHz(base), wave: kit.pulse25, type: 'square', gain: 0.06, attack: 0.003, hold: 0.04, release: 0.1 });
  tone(kit, dest, { t: t + 0.07, freq: midiHz(base + 7), wave: kit.pulse25, type: 'square', gain: 0.06, attack: 0.003, hold: 0.05, release: 0.14 });
  tone(kit, dest, { t: t + 0.13, freq: midiHz(base + 19), type: 'triangle', gain: 0.035, attack: 0.003, release: 0.3 });
};

const success: SfxPlayer = (kit, out, t) => {
  const dest = bus(kit, out, 1, 0.3);
  [72, 76, 79, 84].forEach((m, i) => {
    const last = i === 3;
    tone(kit, dest, {
      t: t + i * 0.075, freq: midiHz(m), wave: kit.pulse25, type: 'square',
      gain: 0.05, attack: 0.004, hold: last ? 0.18 : 0.04, release: last ? 0.35 : 0.1,
    });
  });
  tone(kit, dest, { t: t + 0.225, freq: midiHz(60), type: 'triangle', gain: 0.06, attack: 0.01, hold: 0.15, release: 0.3 });
};

const fail: SfxPlayer = (kit, out, t) => {
  const dest = bus(kit, out, 1, 0.2);
  const filter = { type: 'lowpass' as const, freq: 1400, q: 0.8 };
  tone(kit, dest, { t, freq: midiHz(64), type: 'sawtooth', gain: 0.05, attack: 0.005, hold: 0.1, release: 0.12, filter });
  tone(kit, dest, {
    t: t + 0.17, freq: midiHz(59), type: 'sawtooth', bend: [[0.25, 1], [0.55, 0.92]],
    gain: 0.055, attack: 0.005, hold: 0.25, release: 0.3, filter,
  });
};

const door: SfxPlayer = (kit, out, t) => {
  const dest = bus(kit, out, 1, 0.22);
  const bend: [number, number][] = [];
  for (let i = 1; i <= 5; i++) bend.push([i * 0.06, rand(kit, 0.85, 1.25)]);
  tone(kit, dest, {
    t, freq: rand(kit, 85, 115), type: 'sawtooth', bend,
    gain: 0.05, attack: 0.03, hold: 0.22, release: 0.12, filter: { type: 'bandpass', freq: 850, q: 5 },
  });
  const thud = t + 0.36;
  tone(kit, dest, { t: thud, freq: 110, to: 48, glide: 0.18, gain: 0.25, attack: 0.002, release: 0.25 });
  noiseHit(kit, dest, { t: thud, gain: 0.1, release: 0.12, filter: { type: 'lowpass', freq: 450 } });
};

const talk: SfxPlayer = (kit, out, t) => {
  const dest = bus(kit, out, 1, 0);
  tone(kit, dest, {
    t, freq: rand(kit, 380, 560), wave: kit.pulse25, type: 'square',
    gain: 0.025, attack: 0.002, release: 0.035, filter: { type: 'lowpass', freq: 2200 },
  });
};

const hurt: SfxPlayer = (kit, out, t) => {
  const dest = bus(kit, out, 1, 0.12);
  tone(kit, dest, {
    t, freq: rand(kit, 300, 340), to: 105, glide: 0.2, type: 'square',
    gain: 0.07, attack: 0.003, hold: 0.04, release: 0.18, filter: { type: 'lowpass', freq: 1600 },
  });
  noiseHit(kit, dest, { t, gain: 0.08, release: 0.1, filter: { type: 'bandpass', freq: 900, q: 1 } });
};

const heal: SfxPlayer = (kit, out, t) => {
  const dest = bus(kit, out, 0.9, 0.5);
  [79, 84, 88, 91].forEach((m, i) => {
    tone(kit, dest, { t: t + i * 0.065, freq: midiHz(m), type: 'triangle', gain: 0.04, attack: 0.006, hold: 0.04, release: 0.4 });
  });
  tone(kit, dest, { t: t + 0.05, freq: midiHz(67), to: midiHz(79), glide: 0.3, gain: 0.03, attack: 0.05, hold: 0.15, release: 0.4 });
};

const shot: SfxPlayer = (kit, out, t) => {
  const dest = bus(kit, out, 1, 0.45);
  noiseHit(kit, dest, { t, gain: 0.4, attack: 0.001, release: 0.4, filter: { type: 'lowpass', freq: 1500, to: 280, q: 0.6 } });
  tone(kit, dest, { t, freq: 120, to: 36, glide: 0.25, gain: 0.35, attack: 0.001, release: 0.3 });
  // Nachhall vom Hang zurück.
  noiseHit(kit, dest, { t: t + 0.28, gain: 0.06, attack: 0.01, release: 0.4, filter: { type: 'lowpass', freq: 600 } });
};

const alarm: SfxPlayer = (kit, out, t) => {
  // Muschelhorn: langer, leicht ansteigender Ton mit sich öffnendem Filter.
  const dest = bus(kit, out, 0.8, 0.55);
  const f = rand(kit, 190, 205);
  const bend: [number, number][] = [[0.3, 1.06], [1.25, 1.02], [1.75, 0.9]];
  const filter = { type: 'lowpass' as const, freq: 500, to: 1300, q: 2 };
  tone(kit, dest, { t, freq: f, type: 'sawtooth', bend, gain: 0.07, attack: 0.35, hold: 1.0, release: 0.45, filter });
  tone(kit, dest, { t, freq: f * 1.006, type: 'sawtooth', bend, gain: 0.05, attack: 0.4, hold: 0.95, release: 0.45, filter });
  tone(kit, dest, { t, freq: f * 2, type: 'triangle', bend, gain: 0.02, attack: 0.5, hold: 0.8, release: 0.4 });
  noiseHit(kit, dest, { t, gain: 0.012, attack: 0.3, hold: 1, release: 0.4, filter: { type: 'bandpass', freq: 900, q: 1 } });
};

const engine: SfxPlayer = (kit, out, t) => {
  // Flugzeugmotor: Anlasser, Fehlzündungen, dann hochlaufendes Brummen.
  const dest = bus(kit, out, 1, 0.2);
  tone(kit, dest, {
    t, freq: 70, to: 150, glide: 0.9, type: 'sawtooth', gain: 0.04, attack: 0.1, hold: 0.7, release: 0.15,
    filter: { type: 'lowpass', freq: 650 },
  });
  for (const dt of [0.95, 1.3, 1.52]) {
    noiseHit(kit, dest, { t: t + dt, gain: 0.22, release: 0.16, filter: { type: 'lowpass', freq: 520 } });
    tone(kit, dest, { t: t + dt, freq: 75, to: 38, gain: 0.18, attack: 0.002, release: 0.18 });
  }
  const run = t + 1.65;
  const filter = { type: 'lowpass' as const, freq: 300, to: 900, q: 1 };
  tone(kit, dest, { t: run, freq: 22, to: 68, glide: 2.2, type: 'sawtooth', gain: 0.16, attack: 0.25, hold: 1.9, release: 0.9, filter });
  tone(kit, dest, { t: run, freq: 44, to: 136, glide: 2.2, type: 'square', gain: 0.05, attack: 0.3, hold: 1.8, release: 0.9, filter });
  noiseHit(kit, dest, { t: run, gain: 0.05, attack: 0.6, hold: 1.4, release: 0.9, filter: { type: 'bandpass', freq: 260, to: 520, q: 0.8 } });
};

const switchSfx: SfxPlayer = (kit, out, t) => {
  const dest = bus(kit, out, 1, 0.15);
  noiseHit(kit, dest, { t, gain: 0.15, attack: 0.001, release: 0.015, filter: { type: 'highpass', freq: 2000 } });
  tone(kit, dest, { t, freq: 1800, type: 'square', gain: 0.03, attack: 0.001, release: 0.02 });
  const sparks = 5 + Math.floor(kit.rnd() * 5);
  for (let i = 0; i < sparks; i++) {
    noiseHit(kit, dest, {
      t: t + 0.03 + rand(kit, 0, 0.35), gain: rand(kit, 0.025, 0.08), attack: 0.001, release: rand(kit, 0.006, 0.02),
      filter: { type: 'highpass', freq: 4000 }, pan: rand(kit, -0.5, 0.5),
    });
  }
  tone(kit, dest, {
    t: t + 0.04, freq: 2600, to: 900, glide: 0.08, type: 'sawtooth', gain: 0.025, attack: 0.002, release: 0.08,
    filter: { type: 'bandpass', freq: 2000, q: 1.5 },
  });
};

const page: SfxPlayer = (kit, out, t) => {
  const dest = bus(kit, out, 1, 0.08);
  noiseHit(kit, dest, {
    t, gain: 0.07, attack: 0.05, hold: 0.04, release: 0.12,
    filter: { type: 'bandpass', freq: rand(kit, 1600, 2200), to: rand(kit, 4500, 5500), q: 0.9 },
  });
  noiseHit(kit, dest, { t: t + 0.13, gain: 0.03, attack: 0.01, release: 0.06, filter: { type: 'highpass', freq: 3000 } });
};

// ---------------------------------------------------------------------------
// Nexus-Effekte (Hack, Treffer, Herzen, Credits, Telefon, Stufenaufstieg, Keksalarm)

const hack: SfxPlayer = (kit, out, t) => {
  const dest = bus(kit, out, 1, 0.2);
  for (let i = 0; i < 6; i++) {
    tone(kit, dest, {
      t: t + i * 0.045, freq: rand(kit, 900, 2400), wave: kit.pulse25, type: 'square',
      gain: 0.03, attack: 0.001, hold: 0.02, release: 0.03, pan: rand(kit, -0.5, 0.5),
    });
  }
  noiseHit(kit, dest, { t: t + 0.27, gain: 0.05, attack: 0.002, release: 0.12, filter: { type: 'bandpass', freq: 3200, q: 4 } });
};

const hit: SfxPlayer = (kit, out, t) => {
  const dest = bus(kit, out, 1, 0.15);
  noiseHit(kit, dest, { t, gain: 0.28, attack: 0.001, release: 0.12, filter: { type: 'lowpass', freq: 1800, to: 400, q: 0.8 } });
  tone(kit, dest, { t, freq: rand(kit, 140, 170), to: 55, glide: 0.1, gain: 0.25, attack: 0.001, release: 0.15 });
};

const heartUp: SfxPlayer = (kit, out, t) => {
  const dest = bus(kit, out, 1, 0.35);
  [79, 84, 88].forEach((m, i) => {
    tone(kit, dest, { t: t + i * 0.09, freq: midiHz(m), type: 'triangle', gain: 0.06, attack: 0.005, hold: 0.05, release: 0.3 });
  });
};

const heartDown: SfxPlayer = (kit, out, t) => {
  const dest = bus(kit, out, 1, 0.3);
  [76, 72, 67].forEach((m, i) => {
    tone(kit, dest, { t: t + i * 0.11, freq: midiHz(m), type: 'triangle', gain: 0.055, attack: 0.005, hold: 0.06, release: 0.28 });
  });
};

const coin: SfxPlayer = (kit, out, t) => {
  const dest = bus(kit, out, 1, 0.25);
  tone(kit, dest, { t, freq: midiHz(83), wave: kit.pulse25, type: 'square', gain: 0.05, attack: 0.002, hold: 0.04, release: 0.06 });
  tone(kit, dest, { t: t + 0.06, freq: midiHz(88), wave: kit.pulse25, type: 'square', gain: 0.05, attack: 0.002, hold: 0.08, release: 0.25 });
};

const phone: SfxPlayer = (kit, out, t) => {
  const dest = bus(kit, out, 1, 0.15);
  for (let i = 0; i < 2; i++) {
    tone(kit, dest, { t: t + i * 0.18, freq: 1320, type: 'sine', gain: 0.05, attack: 0.005, hold: 0.08, release: 0.05 });
    tone(kit, dest, { t: t + i * 0.18, freq: 1760, type: 'sine', gain: 0.03, attack: 0.005, hold: 0.08, release: 0.05 });
  }
};

const levelup: SfxPlayer = (kit, out, t) => {
  const dest = bus(kit, out, 1, 0.4);
  [60, 64, 67, 72, 76, 79].forEach((m, i) => {
    const last = i === 5;
    tone(kit, dest, {
      t: t + i * 0.07, freq: midiHz(m + 12), wave: kit.pulse25, type: 'square',
      gain: 0.045, attack: 0.004, hold: last ? 0.3 : 0.04, release: last ? 0.5 : 0.08,
    });
  });
};

const cookie: SfxPlayer = (kit, out, t) => {
  // Keksalarm: zwei freche Hupen mit Abwärtsrutsch.
  const dest = bus(kit, out, 1, 0.2);
  for (let i = 0; i < 2; i++) {
    tone(kit, dest, {
      t: t + i * 0.22, freq: midiHz(74 - i * 3), type: 'sawtooth', bend: [[0.12, 1], [0.18, 0.85]],
      gain: 0.05, attack: 0.004, hold: 0.12, release: 0.08, filter: { type: 'lowpass', freq: 2200, q: 1 },
    });
  }
};

/** Pegel je Effekt, abgeglichen per Offline-Rendering (Spitzen ≈ −20 … −10 dBFS). */
function level(player: SfxPlayer, amount: number): SfxPlayer {
  if (amount === 1) return player;
  return (kit, out, t) => player(kit, { dry: gain(kit.ctx, amount, out.dry), wet: gain(kit.ctx, amount, out.wet) }, t);
}

export const SFX: Record<SfxId, SfxPlayer> = {
  step: level(step, 3),
  pickup: level(pickup, 3.5),
  success: level(success, 3.2),
  fail: level(fail, 3.5),
  door: level(door, 1.4),
  talk: level(talk, 3.5),
  hurt: level(hurt, 3),
  heal: level(heal, 3.2),
  shot: shot,
  alarm: level(alarm, 3),
  engine: level(engine, 1.5),
  switch: level(switchSfx, 1.3),
  page: level(page, 2.5),
  hack: level(hack, 2.5),
  hit: level(hit, 2),
  'heart-up': level(heartUp, 3),
  'heart-down': level(heartDown, 3),
  coin: level(coin, 3),
  phone: level(phone, 2.5),
  levelup: level(levelup, 3),
  cookie: level(cookie, 2.5),
};

/** Mindestabstand zwischen zwei gleichen Effekten (Sekunden), damit Spam nicht knattert. */
export const SFX_GAP: Partial<Record<SfxId, number>> = { step: 0.09, talk: 0.045, coin: 0.06, hit: 0.05 };
