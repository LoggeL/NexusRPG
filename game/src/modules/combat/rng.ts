// Deterministischer Kampf-Zufall (mulberry32). Der Zustand ist eine Zahl in CombatState.rng, damit Kämpfe
// speicherbar, wiederholbar und in Tests exakt vorhersagbar sind.

/** Nächster Wert 0 ≤ x < 1 und neuer Zustand. */
export function nextRandom(state: number): [value: number, state: number] {
  const next = (state + 0x6d2b79f5) >>> 0;
  let t = next;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return [((t ^ (t >>> 14)) >>> 0) / 4294967296, next];
}

/** Startzustand aus Seed und Begegnung (gleicher Seed, andere Begegnung → anderer Verlauf). */
export function initialRng(seed: number, salt: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < salt.length; i++) {
    hash ^= salt.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return ((Math.floor(seed) >>> 0) ^ hash) >>> 0;
}

/** Ganzzahl min..max (inklusive). */
export function randomInt(value: number, min: number, max: number): number {
  const lo = Math.min(min, max);
  const hi = Math.max(min, max);
  return lo + Math.min(hi - lo, Math.floor(value * (hi - lo + 1)));
}
