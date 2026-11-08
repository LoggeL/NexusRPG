// Kennfarbe und Monogramm der Spielfigur (design.md §3.1a „Kein Bild der Spielfigur“): Namensschild im Dialog in
// `colorA`, HUD/Menüs ein Monogramm (Anfangsbuchstabe im Kreis). Dunkle Farben werden für die Lesbarkeit aufgehellt.
import type { GameContent, PlayerState } from '../../modules/contracts';
import { hexToRgb } from './compose';

const FALLBACK = '#3ef2ff';

/** Lesbare Kennfarbe (Hex) aus `colorA`; zu dunkle Töne werden mit Weiß gemischt. */
export function playerAccent(content: GameContent, player: Readonly<PlayerState>): string {
  const hex = content.appearance?.palette[player.appearance?.colorA ?? '']?.mid;
  if (!hex) return FALLBACK;
  const [r, g, b] = hexToRgb(hex);
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  if (luminance >= 0.35) return hex;
  const t = Math.min(0.7, 0.35 - luminance + 0.35);
  const mix = (v: number) => Math.round(v + (255 - v) * t).toString(16).padStart(2, '0');
  return `#${mix(r)}${mix(g)}${mix(b)}`;
}

const monogramCache = new Map<string, string>();

/** Monogramm als data-URL: Anfangsbuchstabe im Kreis in der Kennfarbe. */
export function monogramUrl(name: string, color: string, size = 128): string {
  const letter = (name.trim()[0] ?? '?').toLocaleUpperCase('de-DE');
  const key = `${letter}|${color}|${size}`;
  const hit = monogramCache.get(key);
  if (hit) return hit;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#0b0716';
  ctx.fillRect(0, 0, size, size);
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size * 0.42, 0, Math.PI * 2);
  ctx.fillStyle = '#130c26';
  ctx.fill();
  ctx.lineWidth = size * 0.06;
  ctx.strokeStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = size * 0.08;
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.fillStyle = color;
  ctx.font = `600 ${Math.round(size * 0.48)}px "Chakra Petch", "Atkinson Hyperlegible", system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(letter, size / 2, size / 2 + size * 0.03);
  const url = canvas.toDataURL('image/png');
  monogramCache.set(key, url);
  return url;
}
