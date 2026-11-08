// Weltbeschriftungen (Namensschilder, Aktionslabel, Sprechblasen) – reine Auswahllogik (Bereich explore-presentation).
// Die Darstellung als DOM-Overlay steckt in worldLabels.ts.
import type { Point } from '../../modules/contracts';
import { GAME_H, GAME_W } from '../dom/layout';

/** Namensschild erscheint ab dieser Nähe zur Spielfigur … */
export const NAMEPLATE_SHOW = 190;
/** … und verschwindet erst jenseits dieser (Hysterese gegen Flackern am Rand). */
export const NAMEPLATE_HIDE = 230;
/** Höchstens so viele Namensschilder gleichzeitig (nächste zuerst). */
export const NAMEPLATE_MAX = 4;
/** Passanten sprechen nur in dieser Nähe zur Spielfigur. */
export const BARK_RADIUS = 340;
/** Höchstens so viele Passanten-Sprechblasen gleichzeitig. */
export const BUBBLE_MAX = 2;

export interface LabelCandidate { id: string; x: number; y: number }

/** Namensschilder mit Hysterese: bisher sichtbare bleiben bis NAMEPLATE_HIDE, neue erst ab NAMEPLATE_SHOW. */
export function nearbyNameplates(player: Point, candidates: readonly LabelCandidate[], shown: ReadonlySet<string>, show = NAMEPLATE_SHOW, hide = NAMEPLATE_HIDE, max = NAMEPLATE_MAX): Set<string> {
  const ranked = candidates
    .map((entry) => ({ id: entry.id, distance: Math.hypot(entry.x - player[0], entry.y - player[1]) }))
    .filter((entry) => entry.distance <= (shown.has(entry.id) ? hide : show))
    .sort((a, b) => a.distance - b.distance || a.id.localeCompare(b.id));
  return new Set(ranked.slice(0, max).map((entry) => entry.id));
}

/** Bildschirmpunkt der Spielfläche (GAME_W × GAME_H) → Prozent der Fläche (unabhängig von der Skalierung). */
export function toFramePercent(screen: Point): [number, number] {
  return [(screen[0] / GAME_W) * 100, (screen[1] / GAME_H) * 100];
}

/** Liegt ein Bildschirmpunkt (mit Rand) auf der Spielfläche? */
export function onScreen(screen: Point, margin = 0): boolean {
  return screen[0] >= -margin && screen[1] >= -margin && screen[0] <= GAME_W + margin && screen[1] <= GAME_H + margin;
}

/** Text gekürzt für Namensschilder (lange Titel brechen sonst die Zeile). */
export function clampLabel(text: string, max = 32): string {
  return text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`;
}

/** Mittelpunkt (px) eines Schilds der Breite `width` so verschieben, dass es mit `pad` Abstand im Rahmen bleibt. */
export function clampCenter(center: number, width: number, frame: number, pad = 4): number {
  const half = width / 2 + pad;
  if (half * 2 >= frame) return frame / 2;
  return Math.min(Math.max(center, half), frame - half);
}
