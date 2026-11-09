// Bausteine für Minispiele Teil 3: Auswahl unter Zeitdruck (Etikette, Hochstapeln, Radio Rost) und Zweitasten-Sprint.
import './minigames3.css';
import { h } from '../dom/dom';
import type { MinigameHost } from './types';
import { clamp } from './util';

/**
 * Auswahl aus Knöpfen mit eigener Zeitleiste (Maus/Touch, Ziffern 1–9, Pfeile + Leertaste).
 * Liefert den Index oder −1, wenn die Zeit abläuft. `seconds <= 0` = ohne Zeitlimit.
 */
export function chooseTimed(host: MinigameHost, container: HTMLElement, labels: (string | Node)[], seconds: number, className = ''): Promise<number> {
  return new Promise((resolve) => {
    let cursor = -1;
    let open = true;
    const buttons: HTMLButtonElement[] = [];
    const fill = h('i', { class: 'm3-timer-fill' });
    const bar = h('div', { class: 'm3-timer' }, fill);
    if (seconds > 0) container.append(bar);
    const done = (index: number) => {
      if (!open) return;
      open = false;
      buttons.forEach((b, i) => { b.disabled = true; b.classList.toggle('picked', i === index); });
      bar.classList.add('stopped');
      resolve(index);
    };
    const mark = () => buttons.forEach((b, i) => b.classList.toggle('cursor', i === cursor));
    const list = h('div', { class: `m3-choices ${className}` });
    labels.forEach((label, index) => {
      let pressedAt = 0;
      const button = h('button', { type: 'button', class: 'mg-btn m2-choice m3-choice', tabindex: '-1' },
        h('span', { class: 'm2-key' }, String(index + 1)), label);
      button.addEventListener('pointerdown', (event) => { event.preventDefault(); pressedAt = performance.now(); done(index); });
      button.addEventListener('click', (event) => { event.preventDefault(); if (performance.now() - pressedAt > 600) done(index); });
      buttons.push(button);
      list.append(button);
    });
    container.append(list);
    host.onKey((event, down) => {
      if (!open || !down || event.repeat) return;
      const match = /^(?:Digit|Numpad)([1-9])$/.exec(event.code);
      if (match && Number(match[1]) <= buttons.length) { done(Number(match[1]) - 1); return; }
      if (event.code === 'ArrowLeft' || event.code === 'ArrowUp' || event.code === 'KeyA' || event.code === 'KeyW') { cursor = cursor <= 0 ? buttons.length - 1 : cursor - 1; mark(); }
      else if (event.code === 'ArrowRight' || event.code === 'ArrowDown' || event.code === 'KeyD' || event.code === 'KeyS') { cursor = (cursor + 1) % buttons.length; mark(); }
      else if ((event.code === 'Space' || event.code === 'Enter' || event.code === 'NumpadEnter') && cursor >= 0) done(cursor);
    });
    if (seconds > 0) {
      const start = performance.now();
      host.frame((_, now) => {
        if (!open) return false;
        const left = 1 - (now - start) / (seconds * 1000);
        fill.style.width = `${clamp(left, 0, 1) * 100}%`;
        bar.classList.toggle('low', left < 0.3);
        if (left <= 0) { done(-1); return false; }
        return true;
      });
    }
  });
}

/** Zwei Tasten im Wechsel (←/→, A/D oder zwei Touch-Flächen). `onStep(ok)` meldet jeden Schritt. */
export function alternateInput(host: MinigameHost, leftPad: HTMLElement, rightPad: HTMLElement, onStep: (ok: boolean) => void) {
  let last: 'l' | 'r' | null = null;
  const step = (side: 'l' | 'r') => { onStep(last !== side); last = side; };
  leftPad.addEventListener('pointerdown', (event) => { event.preventDefault(); step('l'); });
  rightPad.addEventListener('pointerdown', (event) => { event.preventDefault(); step('r'); });
  host.onKey((event, down) => {
    if (!down || event.repeat) return;
    if (event.code === 'ArrowLeft' || event.code === 'KeyA') step('l');
    else if (event.code === 'ArrowRight' || event.code === 'KeyD') step('r');
  });
}
