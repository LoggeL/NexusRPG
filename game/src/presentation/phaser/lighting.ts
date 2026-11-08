// Tageszeit-Beleuchtung der Erkundung (Bereich explore-presentation), ohne Phaser testbar.
// design.md §3.4 und world.md §3.8: Morgen kühles Blau-Grau, Tag neutral (im Smog leicht gelblich),
// Abend warm-violett, Nacht dunkelblau mit stärkerem Neon-Glow über additive Lichtpunkte.
import type { LightDef, Lighting, TimeSlot } from '../../modules/contracts';

export const TIME_SLOTS: readonly TimeSlot[] = ['morgen', 'tag', 'abend', 'nacht'];

/** Farb-Overlay [Farbe, Deckkraft] je Beleuchtungsart und Tageszeit. Untergrund nutzt stattdessen die Dunkelmaske. */
export const TINT: Record<Exclude<Lighting, 'underground'>, Record<TimeSlot, readonly [number, number]>> = {
  outdoor: { morgen: [0x8fa6c8, 0.14], tag: [0xfff1b0, 0.05], abend: [0x7a2cff, 0.22], nacht: [0x0a0630, 0.5] },
  indoor: { morgen: [0x9fb2d0, 0.05], tag: [0x000000, 0], abend: [0x5020a0, 0.08], nacht: [0x0a0630, 0.22] },
};

/** Deckkraft der Dunkelmaske im Untergrund (Lichtkegel um Spielfigur, Crew und Lichtpunkte werden ausgespart). */
export const UNDERGROUND_DARKNESS = 0.88;

/** Standard-Tageszeiten eines Lichtpunkts ohne `slots`: draußen abends und nachts, drinnen/unten immer. */
export function lightSlots(light: LightDef, lighting: Lighting): readonly TimeSlot[] {
  if (light.slots?.length) return light.slots;
  return lighting === 'outdoor' ? ['abend', 'nacht'] : TIME_SLOTS;
}

export function tintFor(lighting: Lighting, slot: TimeSlot): readonly [number, number] {
  if (lighting === 'underground') return [0x000000, 0];
  return TINT[lighting][slot];
}

/** Stärke je Tageszeit: nachts voller Glow, abends gedämpft, tagsüber (falls ausdrücklich gewünscht) schwach. */
const SLOT_GAIN: Record<TimeSlot, number> = { morgen: 0.45, tag: 0.35, abend: 0.7, nacht: 1 };

/** Deckkraft eines Lichtpunkts jetzt (0 = unsichtbar). Im Untergrund leuchten Lichter immer voll. */
export function lightAlpha(light: LightDef, lighting: Lighting, slot: TimeSlot): number {
  const base = Math.min(1, Math.max(0, light.intensity ?? 0.7));
  if (lighting === 'underground') return base;
  if (!lightSlots(light, lighting).includes(slot)) return 0;
  return lighting === 'indoor' ? base : base * SLOT_GAIN[slot];
}

/** CSS-Farbe ('#rgb', '#rrggbb', '#rrggbbaa') → 0xRRGGBB; Unlesbares wird weiß. */
export function parseColor(css: string): number {
  const hex = css.trim().replace(/^#/, '');
  if (/^[0-9a-f]{3}$/i.test(hex)) return parseInt(hex.split('').map((c) => c + c).join(''), 16);
  if (/^[0-9a-f]{6}([0-9a-f]{2})?$/i.test(hex)) return parseInt(hex.slice(0, 6), 16);
  return 0xffffff;
}

/**
 * Neon-Flackern: meist ruhig (≈ 1), selten ein kurzer Aussetzer – je Lichtpunkt versetzt über `seed`.
 * Bei reduzierter Bewegung immer 1.
 */
export function neonFlicker(time: number, seed: number, reduced: boolean): number {
  if (reduced) return 1;
  const slow = 1 + Math.sin(time / 900 + seed) * 0.04;
  const window = Math.sin(time / 1700 + seed * 7.3);
  const blink = window > 0.985 ? 0.55 + 0.45 * Math.abs(Math.sin(time / 23 + seed)) : 1;
  return slow * blink;
}
