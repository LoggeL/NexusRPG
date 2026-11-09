// Gemeinsame Bausteine der Minispiele aus Teil 2 (Sprechblasen, Zeigerposition, Ende-Signal, Ziel-Leiste).
import './minigames2.css';
import { h } from '../dom/dom';
import type { MinigameHost } from './types';
import { clamp } from './util';

/** Sprechblase: `say(text)` blendet sie für gut drei Sekunden ein. */
export function speaker(className = '', who?: string) {
  const el = h('div', { class: `m2-say ${className}` });
  const say = (text: string) => {
    el.textContent = '';
    if (who) el.append(h('b', null, `${who}: `));
    el.append(text);
    el.classList.remove('show');
    void el.offsetWidth;
    el.classList.add('show');
  };
  return { el, say };
}

/** Zeigerposition relativ zu einem Element in Prozent (0–100). */
export function relPoint(event: PointerEvent | MouseEvent, el: HTMLElement): { x: number; y: number } {
  const rect = el.getBoundingClientRect();
  return {
    x: clamp(((event.clientX - rect.left) / Math.max(1, rect.width)) * 100, 0, 100),
    y: clamp(((event.clientY - rect.top) / Math.max(1, rect.height)) * 100, 0, 100),
  };
}

/** Einmal auflösbares Ende (gewonnen/verloren); `over` sagt, ob schon entschieden. */
export function ending() {
  let resolve!: (won: boolean) => void;
  const done = new Promise<boolean>((r) => { resolve = r; });
  const state = {
    over: false,
    done,
    finish(won: boolean) { if (!state.over) { state.over = true; resolve(won); } },
  };
  return state;
}

/** Wartet auf das erste von Ende oder Countdown; liefert `null`, wenn die Zeit ablief. */
export async function raceClock(end: ReturnType<typeof ending>, clock: { done: Promise<void> }): Promise<boolean | null> {
  const result = await Promise.race([end.done, clock.done.then(() => null)]);
  return result;
}

/** Fortschrittsbalken (0..1) mit optionaler Zielmarke. */
export function meter(className = '', label = '') {
  const fill = h('i', { class: 'm2-meter-fill' });
  const mark = h('b', { class: 'm2-meter-mark' });
  const text = h('span', { class: 'm2-meter-label' }, label);
  const el = h('div', { class: `m2-meter ${className}` }, fill, mark, text);
  return {
    el,
    set(value: number) { fill.style.width = `${clamp(value, 0, 1) * 100}%`; },
    mark(value: number | null) { mark.style.display = value === null ? 'none' : 'block'; if (value !== null) mark.style.left = `${clamp(value, 0, 1) * 100}%`; },
    label(textValue: string) { text.textContent = textValue; },
  };
}

/** Auswahl aus Knöpfen (Maus/Touch, Ziffern 1–9, ←/→ + Leertaste). Liefert den Index. */
export function choose(host: MinigameHost, container: HTMLElement, labels: (string | Node)[], className = ''): Promise<number> {
  return new Promise((resolve) => {
    let cursor = 0;
    let open = true;
    const buttons: HTMLButtonElement[] = [];
    const done = (index: number) => {
      if (!open) return;
      open = false;
      buttons.forEach((b, i) => { b.disabled = true; b.classList.toggle('picked', i === index); });
      resolve(index);
    };
    const mark = () => buttons.forEach((b, i) => b.classList.toggle('cursor', i === cursor));
    labels.forEach((label, index) => {
      let pressedAt = 0;
      const button = h('button', { type: 'button', class: `mg-btn m2-choice ${className}`, tabindex: '-1' },
        h('span', { class: 'm2-key' }, String(index + 1)), label);
      button.addEventListener('pointerdown', (event) => { event.preventDefault(); pressedAt = performance.now(); done(index); });
      button.addEventListener('click', (event) => { event.preventDefault(); if (performance.now() - pressedAt > 600) done(index); });
      buttons.push(button);
      container.append(button);
    });
    mark();
    host.onKey((event, down) => {
      if (!open || !down || event.repeat) return;
      const match = /^(?:Digit|Numpad)([1-9])$/.exec(event.code);
      if (match && Number(match[1]) <= buttons.length) { done(Number(match[1]) - 1); return; }
      if (event.code === 'ArrowLeft' || event.code === 'ArrowUp' || event.code === 'KeyA' || event.code === 'KeyW') { cursor = (cursor + buttons.length - 1) % buttons.length; mark(); }
      else if (event.code === 'ArrowRight' || event.code === 'ArrowDown' || event.code === 'KeyD' || event.code === 'KeyS') { cursor = (cursor + 1) % buttons.length; mark(); }
      else if (event.code === 'Space' || event.code === 'Enter' || event.code === 'NumpadEnter') done(cursor);
    });
  });
}

/** Gedrückt-halten-Eingabe für Leertaste/Enter/E und eine Fläche (Maus/Touch). */
export function holdInput(host: MinigameHost, surface: HTMLElement) {
  const state = { held: false, pressed: 0 };
  const press = () => { if (!state.held) state.pressed++; state.held = true; };
  surface.addEventListener('pointerdown', (event) => { event.preventDefault(); press(); });
  const release = () => { state.held = false; };
  surface.addEventListener('pointerup', release);
  surface.addEventListener('pointercancel', release);
  surface.addEventListener('pointerleave', release);
  host.onKey((event, down) => {
    if (event.code !== 'Space' && event.code !== 'Enter' && event.code !== 'KeyE' && event.code !== 'NumpadEnter') return;
    if (down) { if (!event.repeat) press(); } else release();
  });
  return state;
}
