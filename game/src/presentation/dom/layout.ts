export const GAME_W = 960;
export const GAME_H = 540;

export type LayoutMode = 'desktop' | 'landscape-touch' | 'portrait-touch';

export interface LayoutResult { mode: LayoutMode; scale: number; x: number; y: number; width: number; height: number; touch: boolean }

/**
 * Ganzzahlige Skalierung, wenn sie mindestens 85 % der möglichen Fläche nutzt, sonst FIT.
 * Hochformat (Touch): Spielbild oben, darunter HUD-Band, Dialog und Bedienung.
 */
export function computeLayout(viewportW: number, viewportH: number, touch: boolean, safeTop = 0): LayoutResult {
  const portrait = touch && viewportH > viewportW * 1.05;
  const mode: LayoutMode = portrait ? 'portrait-touch' : touch ? 'landscape-touch' : 'desktop';
  let availW = viewportW;
  let availH = viewportH;
  if (portrait) {
    availW = viewportW;
    availH = Math.min(viewportH * 0.42, viewportW * (GAME_H / GAME_W));
  }
  const fit = Math.max(0.25, Math.min(availW / GAME_W, availH / GAME_H));
  const integer = Math.floor(fit);
  const scale = integer >= 1 && integer / fit >= 0.85 ? integer : fit;
  const width = Math.round(GAME_W * scale);
  const height = Math.round(GAME_H * scale);
  const x = Math.round((viewportW - width) / 2);
  const y = portrait ? Math.round(safeTop) : Math.round((viewportH - height) / 2);
  return { mode, scale, x, y, width, height, touch };
}

export function prefersTouch(): boolean {
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.has('touch')) return params.get('touch') !== '0';
    return window.matchMedia('(pointer: coarse)').matches;
  } catch {
    return false;
  }
}

export function installLayout(apply: (layout: LayoutResult) => void): () => void {
  let frame = 0;
  const shell = document.getElementById('shell');
  const coarse = window.matchMedia('(pointer: coarse)');
  const run = () => {
    frame = 0;
    const viewport = window.visualViewport;
    const width = Math.round(viewport?.width ?? window.innerWidth);
    const height = Math.round(viewport?.height ?? window.innerHeight);
    const touch = prefersTouch();
    const layout = computeLayout(width, height, touch);
    const root = document.documentElement;
    root.style.setProperty('--cx', `${layout.x}px`);
    root.style.setProperty('--cy', `${layout.y}px`);
    root.style.setProperty('--cw', `${layout.width}px`);
    root.style.setProperty('--ch', `${layout.height}px`);
    root.style.setProperty('--scale', String(layout.scale));
    root.dataset.touch = String(touch);
    if (shell) shell.dataset.layout = layout.mode;
    root.dataset.layout = layout.mode;
    apply(layout);
  };
  const queue = () => {
    if (frame) cancelAnimationFrame(frame);
    frame = requestAnimationFrame(run);
  };
  window.addEventListener('resize', queue);
  window.visualViewport?.addEventListener('resize', queue);
  coarse.addEventListener?.('change', queue);
  run();
  return () => {
    window.removeEventListener('resize', queue);
    window.visualViewport?.removeEventListener('resize', queue);
    coarse.removeEventListener?.('change', queue);
  };
}
