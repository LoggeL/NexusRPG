// Kleine Helfer für die Minispiele (Zufall, Knöpfe ohne Fokusklau, Tastencodes).
import { h } from '../dom/dom';

export const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const randInt = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));
export const pick = <T>(list: readonly T[]): T => list[Math.floor(Math.random() * list.length)];
/** Wert je Schwierigkeitsstufe 1–5 (Index level-1, gekappt). */
export const byLevel = <T>(level: number, values: readonly T[]): T => values[clamp(Math.round(level), 1, values.length) - 1];

export function shuffle<T>(list: T[]): T[] {
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

/**
 * Knopf für die Spielfläche: nimmt keinen Fokus (Leertaste löst sonst doppelt aus),
 * reagiert sofort auf pointerdown (Touch ohne 300-ms-Verzögerung) und auf Klick per Tastatur-Hilfstechnik.
 */
export function gameButton(label: string | Node, onPress: () => void, className = ''): HTMLButtonElement {
  let pressedAt = 0;
  const button = h('button', { type: 'button', class: `mg-btn ${className}`, tabindex: '-1' }, label);
  button.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    if (button.disabled) return;
    pressedAt = performance.now();
    onPress();
  });
  // Klick ohne vorheriges pointerdown (Screenreader, Tests) – sonst ignorieren.
  button.addEventListener('click', (event) => {
    event.preventDefault();
    if (button.disabled || performance.now() - pressedAt < 600) return;
    onPress();
  });
  return button;
}

/** Taste ist „Bestätigen/Aktion“ (Leertaste, Enter, E). */
export const isAction = (code: string) => code === 'Space' || code === 'Enter' || code === 'NumpadEnter' || code === 'KeyE';
export const isLeft = (code: string) => code === 'ArrowLeft' || code === 'KeyA';
export const isRight = (code: string) => code === 'ArrowRight' || code === 'KeyD';
export const isUp = (code: string) => code === 'ArrowUp' || code === 'KeyW';
export const isDown = (code: string) => code === 'ArrowDown' || code === 'KeyS';
/** Ziffer 1–9 aus Digit/Numpad, sonst 0. */
export function digitOf(code: string): number {
  const match = /^(?:Digit|Numpad)([1-9])$/.exec(code);
  return match ? Number(match[1]) : 0;
}

/** Element mit `--x`/`--y` in Prozent positionieren. */
export function place(element: HTMLElement, x: number, y: number) {
  element.style.left = `${x}%`;
  element.style.top = `${y}%`;
}
