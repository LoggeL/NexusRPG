// Schlüsselszenen-Plates (design.md §6.1) als reines Modell: Ken-Burns-Fahrten, Zeiten, Bildquellen-Reihenfolge.
// Vorbild: SelantisRPG game/src/ui/plate.ts (nur gelesen). Ohne DOM, damit es testbar bleibt.
import type { PanMode } from '../../modules/contracts';

/** Bildanteile 0..1 (Mittelpunkt) und Zoom ≥ 1. */
export type PanPoint = readonly [x: number, y: number, zoom: number];
export interface PanPath { from: PanPoint; to: PanPoint }

export const PAN_MODES: readonly PanMode[] = ['in', 'out', 'left', 'right', 'none'];

/** Fahrt je PanMode; 'none' (und reduzierte Bewegung) steht still. Höchstens ~4 % Beschnitt je Seite beim Schwenk. */
export function panFor(mode: PanMode | undefined): PanPath | undefined {
  switch (mode) {
    case 'in': return { from: [0.5, 0.5, 1], to: [0.5, 0.46, 1.1] };
    case 'out': return { from: [0.5, 0.46, 1.1], to: [0.5, 0.5, 1] };
    case 'left': return { from: [0.56, 0.5, 1.08], to: [0.44, 0.5, 1.08] };
    case 'right': return { from: [0.44, 0.5, 1.08], to: [0.56, 0.5, 1.08] };
    default: return undefined;
  }
}

/** CSS-Transform für einen Fahrtpunkt; die Verschiebung bleibt im Bild (kein Rand sichtbar). */
export function panTransform(point: PanPoint): string {
  const zoom = Math.max(1, point[2] || 1);
  const limit = ((zoom - 1) / (2 * zoom)) * 100;
  const tx = clampNum((0.5 - point[0]) * 100, -limit, limit);
  const ty = clampNum((0.5 - point[1]) * 100, -limit, limit);
  // Verschiebung zur Mitte hin runden, damit nie ein Rand ins Bild rutscht.
  return `scale(${round(zoom)}) translate(${toZero(tx)}%, ${toZero(ty)}%)`;
}

/** Keyframes für Web Animations; reduzierte Bewegung → Standbild am Zielpunkt. */
export function panKeyframes(path: PanPath | undefined, reduced: boolean): { transform: string }[] {
  if (!path) return [{ transform: 'none' }, { transform: 'none' }];
  if (reduced) return [{ transform: panTransform(path.to) }, { transform: panTransform(path.to) }];
  return [{ transform: panTransform(path.from) }, { transform: panTransform(path.to) }];
}

/** Hochformat: das 4:5-Fenster wandert über das breite Bild (object-position statt Verschiebung). */
export function portraitTravel(mode: PanMode | undefined): readonly [from: string, to: string] {
  switch (mode) {
    case 'left': return ['72% 50%', '28% 50%'];
    case 'right': return ['28% 50%', '72% 50%'];
    case 'in': return ['40% 50%', '60% 50%'];
    case 'out': return ['60% 50%', '40% 50%'];
    default: return ['50% 50%', '50% 50%'];
  }
}

/** Leitet aus einem Fahrtpfad den PanMode ab (für Hochformat und Galerie). */
export function panModeOf(path: PanPath | undefined): PanMode {
  if (!path) return 'none';
  const [fx, , fz] = path.from;
  const [tx, , tz] = path.to;
  if (Math.abs(tz - fz) > 0.01) return tz > fz ? 'in' : 'out';
  if (Math.abs(tx - fx) > 0.01) return tx < fx ? 'left' : 'right';
  return 'none';
}

/** Zeiten der Einblendung (ms); reduzierte Bewegung blendet hart bzw. sehr kurz. */
export function plateTimings(reduced: boolean): { letterbox: number; fade: number; cross: number; glitch: number; out: number } {
  return reduced
    ? { letterbox: 0, fade: 0, cross: 0, glitch: 0, out: 0 }
    : { letterbox: 520, fade: 700, cross: 900, glitch: 420, out: 600 };
}

/** Dauer der Kamerafahrt je Beat: mindestens `hold`, sonst Grundzeit plus Lesezeit je Text. */
export function panDuration(texts: number, hold = 0): number {
  return Math.max(hold, 9000 + Math.max(0, texts) * 3000);
}

const clampNum = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const round = (value: number) => Math.round(value * 1000) / 1000;
const toZero = (value: number) => Math.trunc(value * 1000) / 1000 + 0;
