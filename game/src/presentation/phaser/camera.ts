// Kamera-Hilfen der Erkundung (Bereich explore-presentation), ohne Phaser-Abhängigkeit testbar.
import { GAME_H, GAME_W } from '../dom/layout';

/**
 * Kameragrenzen [x, y, w, h] für eine Karte der Größe `size`.
 * Kleinere Karten als die Spielfläche werden mittig gezeigt statt links oben angeheftet.
 */
export function cameraBounds(size: readonly [number, number], view: readonly [number, number] = [GAME_W, GAME_H]): [number, number, number, number] {
  const [w, h] = size;
  const bw = Math.max(w, view[0]);
  const bh = Math.max(h, view[1]);
  return [(w - bw) / 2, (h - bh) / 2, bw, bh];
}

/** Kamera-Ausschnitt (linke obere Ecke), wenn die Kamera `target` folgt und an `bounds` geklemmt ist. */
export function cameraScroll(target: readonly [number, number], bounds: readonly [number, number, number, number], view: readonly [number, number] = [GAME_W, GAME_H]): [number, number] {
  const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
  return [
    clamp(target[0] - view[0] / 2, bounds[0], bounds[0] + bounds[2] - view[0]),
    clamp(target[1] - view[1] / 2, bounds[1], bounds[1] + bounds[3] - view[1]),
  ];
}
