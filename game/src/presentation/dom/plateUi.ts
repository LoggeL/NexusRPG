// Schlüsselszenen-Einblendung „PlateUi“ (Bereich dom-ui, design.md §6.1) nach dem Vorbild der Selantis-Plates:
// Letterbox fährt ein, das fotoreale Standbild blendet in einem dünnen Neon-Rahmen mit kurzem Glitch auf,
// langsame Ken-Burns-Fahrt, Vignette und Scanline-Hauch, Bildunterschrift in der Display-Schrift, Überblendung
// zwischen Bildern, Dialogzeilen mit Porträt über dem Bild, Blurhash-Platzhalter bis zum Laden.
// Reduzierte Bewegung: keine Fahrt, kein Glitch, harte Schnitte.
import type { AssetCatalog } from '../../platform/assets/manifest';
import { assetUrl } from '../../platform/assets/manifest';
import { canvasToDataUrl, drawCutscene } from '../placeholders';
import { blurhashDataUrl } from './blurhash';
import type { DisplayLine } from './dialogueBox';
import { clear, h, setPortrait } from './dom';
import { panKeyframes, panModeOf, plateTimings, portraitTravel, type PanPath } from './plateModel';
import type { UiShell } from './shell';

export const SKIP_HOLD_MS = 900;

export interface PlateImageOptions {
  pan?: PanPath;
  fade?: 'in' | 'out' | 'cross';
  durationMs: number;
  reduced: boolean;
  /** Ersatzbild, wenn die Datei nicht lädt (Platzhalter mit Titel). */
  fallback?: () => string;
}

const isPortraitLayout = () => document.documentElement.dataset.layout === 'portrait-touch';

/** Startet die Kamerafahrt auf einem Bild (Web Animations); Hochformat wandert per object-position. */
export function applyPan(img: HTMLImageElement, path: PanPath | undefined, durationMs: number, reduced: boolean, from?: string): void {
  for (const animation of img.getAnimations?.() ?? []) animation.cancel();
  if (typeof img.animate !== 'function') return;
  const easing = 'cubic-bezier(.45,.05,.55,.95)';
  if (isPortraitLayout()) {
    const [a, b] = portraitTravel(reduced ? 'none' : panModeOf(path));
    img.animate([{ objectPosition: a, transform: 'none' }, { objectPosition: b, transform: 'none' }], { duration: Math.max(1, durationMs), easing, fill: 'forwards' });
    return;
  }
  const frames = panKeyframes(path, reduced);
  if (from && from !== 'none' && !reduced) frames[0] = { transform: from };
  img.animate(frames, { duration: reduced ? 1 : Math.max(1, durationMs), easing, fill: 'forwards' });
}

/** Plate-Bühne über dem Spielbild. API passend zum Cutscene-Ablauf des Directors (früher CutsceneUi). */
export class PlateUi {
  readonly el: HTMLElement;
  current: { caption?: string; speaker?: string; text: string } | null = null;
  private frameEl: HTMLElement;
  private layers: [HTMLImageElement, HTMLImageElement];
  private blur: HTMLImageElement;
  private front = 0;
  private black: HTMLElement;
  private captionEl: HTMLElement;
  private linesEl: HTMLElement;
  private titleEl: HTMLElement;
  private skipBtn: HTMLButtonElement;
  private ring: HTMLElement;
  private next: HTMLElement;
  private popLayer: (() => void) | null = null;
  private advanceResolve: (() => void) | null = null;
  private readyAt = 0;
  private onSkip: (() => void) | null = null;
  private hideTimer = 0;
  private glitchTimer = 0;
  private blurByUrl: Map<string, string> | null = null;
  private reduced = false;

  constructor(private readonly shell: UiShell, private readonly catalog: AssetCatalog) {
    this.layers = [
      h('img', { class: 'plate-img', alt: '', draggable: 'false', decoding: 'async' }),
      h('img', { class: 'plate-img', alt: '', draggable: 'false', decoding: 'async' }),
    ];
    this.blur = h('img', { class: 'plate-blur', alt: '', draggable: 'false', 'aria-hidden': 'true' });
    this.frameEl = h('div', { class: 'plate-frame', 'data-testid': 'plate-frame' },
      h('div', { class: 'plate-view' }, this.blur, this.layers[0], this.layers[1], h('div', { class: 'plate-vignette' }), h('div', { class: 'plate-scan' })),
      h('span', { class: 'plate-corner tl' }), h('span', { class: 'plate-corner br' }));
    this.captionEl = h('div', { class: 'plate-caption', hidden: true, 'data-testid': 'plate-caption' });
    this.linesEl = h('div', { class: 'plate-lines panel', hidden: true, 'data-testid': 'cutscene-text', 'aria-live': 'polite' });
    this.black = h('div', { class: 'plate-black' });
    this.titleEl = h('div', { class: 'plate-title' });
    this.ring = h('span', { class: 'ring', 'aria-hidden': 'true' });
    this.skipBtn = h('button', {
      class: 'btn small plate-skip', type: 'button', 'data-testid': 'cutscene-skip', title: 'Überspringen (Esc halten)',
      onclick: (event: Event) => { event.stopPropagation(); this.onSkip?.(); },
    }, this.ring, 'Überspringen');
    this.next = h('span', { class: 'plate-next', hidden: true, 'aria-hidden': 'true' }, '▼');
    this.el = h('div', { class: 'plate-ui', hidden: true, 'data-testid': 'cutscene', role: 'region', 'aria-label': 'Schlüsselszene' },
      h('div', { class: 'plate-bar top', 'aria-hidden': 'true' }), h('div', { class: 'plate-bar bottom', 'aria-hidden': 'true' }),
      h('div', { class: 'plate-stage' }, this.frameEl), this.black, this.captionEl, this.linesEl, this.titleEl, this.skipBtn, this.next);
    this.el.addEventListener('pointerup', (event) => {
      if ((event.target as HTMLElement).closest('.plate-skip')) return;
      this.advance();
    });
    shell.frame.append(this.el);
  }

  get active() { return !this.el.hidden && this.el.classList.contains('is-open'); }

  open(title: string | undefined, skippable: boolean, onSkip: () => void) {
    window.clearTimeout(this.hideTimer);
    this.reduced = this.shell.reducedMotion;
    this.el.hidden = false;
    this.el.classList.remove('closing');
    this.el.classList.toggle('reduced', this.reduced);
    this.titleEl.textContent = title ?? '';
    this.skipBtn.hidden = !skippable;
    this.onSkip = skippable ? onSkip : null;
    this.setHold(0);
    this.black.style.transition = 'none';
    this.black.style.opacity = '1';
    // Letterbox fährt im nächsten Bild ein (Übergang über CSS).
    void this.el.offsetWidth;
    this.el.classList.add('is-open');
    this.popLayer?.();
    this.popLayer = this.shell.input.push('cutscene', (event) => {
      if (event.intent.type === 'interact') { this.advance(); return true; }
      return true;
    }, { modal: true });
  }

  close() {
    this.popLayer?.();
    this.popLayer = null;
    this.onSkip = null;
    this.clearText();
    const resolve = this.advanceResolve;
    this.advanceResolve = null;
    resolve?.();
    this.el.classList.remove('is-open');
    this.el.classList.add('closing');
    const finish = () => {
      this.el.hidden = true;
      this.el.classList.remove('closing');
      this.frameEl.classList.remove('shown', 'glitch');
      for (const layer of this.layers) {
        for (const animation of layer.getAnimations?.() ?? []) animation.cancel();
        layer.removeAttribute('src');
        layer.classList.remove('on');
      }
      this.blur.removeAttribute('src');
      this.blur.classList.remove('on');
      this.black.style.transition = 'none';
      this.black.style.opacity = '1';
    };
    const out = plateTimings(this.reduced).out;
    window.clearTimeout(this.hideTimer);
    if (out <= 0) finish();
    else this.hideTimer = window.setTimeout(finish, out);
  }

  /** Blurhash zum Bild (über den Manifest-Schlüssel, dessen Pfad diese URL ergibt). */
  private blurhashFor(url: string): string | null {
    const manifest = this.catalog.manifest;
    if (!manifest.blurhash) return null;
    if (!this.blurByUrl) {
      this.blurByUrl = new Map();
      for (const [key, hash] of Object.entries(manifest.blurhash)) {
        const file = manifest.images[key];
        if (file) this.blurByUrl.set(assetUrl(file), hash);
      }
    }
    const hash = this.blurByUrl.get(url);
    return hash ? blurhashDataUrl(hash) : null;
  }

  /**
   * Zeigt ein Standbild im Rahmen. fade: 'in' aus Schwarz, 'cross' Überblendung vom vorigen Bild, sonst Schnitt.
   * `null` (bzw. 'black') blendet den Rahmen aus.
   */
  showImage(url: string | null, options: PlateImageOptions) {
    const timings = plateTimings(options.reduced);
    this.reduced = options.reduced;
    if (!url) {
      this.black.style.transition = `opacity ${timings.fade}ms`;
      this.black.style.opacity = '1';
      this.frameEl.classList.remove('shown');
      this.captionEl.hidden = true;
      return;
    }
    const frontLayer = this.layers[this.front];
    const same = frontLayer.getAttribute('src') === url && frontLayer.classList.contains('on');
    if (same) {
      // Gleiches Bild: die Fahrt läuft vom aktuellen Stand zum neuen Ziel weiter, ohne Sprung.
      const live = getComputedStyle(frontLayer).transform;
      applyPan(frontLayer, options.pan, options.durationMs, options.reduced, live);
      this.revealFrame(false, timings);
      return;
    }
    const cross = options.fade === 'cross' && !!frontLayer.getAttribute('src');
    const target = cross ? this.layers[1 - this.front] : frontLayer;
    const other = target === this.layers[0] ? this.layers[1] : this.layers[0];
    this.captionEl.hidden = true;
    target.style.transition = `opacity ${cross ? timings.cross : timings.fade}ms ease`;
    other.style.transition = `opacity ${cross ? timings.cross : timings.fade}ms ease`;
    target.classList.remove('on');
    const placeholder = this.blurhashFor(url);
    if (placeholder) { this.blur.src = placeholder; this.blur.classList.add('on'); } else this.blur.classList.remove('on');
    let triedFallback = false;
    const reveal = () => {
      if (target.getAttribute('src') === null) return;
      // Beide Übergänge laufen gleichzeitig: das neue Bild blendet auf, das alte ab (Überblendung).
      target.classList.add('on');
      other.classList.remove('on');
      this.blur.classList.remove('on');
      applyPan(target, options.pan, options.durationMs, options.reduced);
    };
    target.onload = () => { target.onload = null; reveal(); };
    target.onerror = () => {
      if (triedFallback) return;
      triedFallback = true;
      target.src = options.fallback?.() || canvasToDataUrl(drawCutscene(this.titleEl.textContent || 'Schlüsselszene', url));
    };
    target.src = url;
    if (target.complete && target.naturalWidth > 0) { target.onload = null; reveal(); }
    if (!cross) other.classList.remove('on');
    this.front = this.layers.indexOf(target);
    this.revealFrame(true, timings);
  }

  /** Rahmen einblenden; bei neuem Bild mit kurzem Glitch (nicht bei reduzierter Bewegung). */
  private revealFrame(glitch: boolean, timings: ReturnType<typeof plateTimings>) {
    this.frameEl.classList.add('shown');
    this.black.style.transition = `opacity ${timings.fade}ms`;
    this.black.style.opacity = '0';
    if (!glitch || timings.glitch <= 0) return;
    window.clearTimeout(this.glitchTimer);
    this.frameEl.classList.remove('glitch');
    void this.frameEl.offsetWidth;
    this.frameEl.classList.add('glitch');
    this.glitchTimer = window.setTimeout(() => this.frameEl.classList.remove('glitch'), timings.glitch);
  }

  fadeOut(reduced: boolean): Promise<void> {
    const ms = plateTimings(reduced).out;
    this.black.style.transition = `opacity ${ms}ms`;
    this.black.style.opacity = '1';
    this.frameEl.classList.remove('shown');
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  setHold(progress: number) {
    this.ring.style.setProperty('--p', String(Math.max(0, Math.min(1, progress))));
  }

  clearText() {
    this.linesEl.hidden = true;
    clear(this.linesEl);
    this.captionEl.hidden = true;
    this.captionEl.textContent = '';
    this.current = null;
  }

  /** Bildunterschrift unten in der Display-Schrift (bleibt, bis ein neues Bild kommt). */
  caption(text: string) {
    this.linesEl.hidden = true;
    clear(this.linesEl);
    this.captionEl.textContent = text;
    this.captionEl.hidden = false;
    this.current = { caption: text, text };
  }

  /** Dialogzeile mit Porträt über dem Bild; Erzählzeilen ohne Porträt. */
  line(line: DisplayLine) {
    clear(this.linesEl);
    this.linesEl.hidden = false;
    this.linesEl.classList.toggle('narration', line.narrator);
    if (!line.narrator) {
      const img = h('img', { alt: line.speakerName, draggable: 'false' });
      setPortrait(img, this.catalog, line.portrait, line.speakerName);
      this.linesEl.append(h('div', { class: 'dlg-portrait' }, img));
    }
    this.linesEl.append(h('div', { class: 'dlg-body' },
      line.narrator ? null : h('div', { class: 'dlg-name', 'data-speaker': line.speakerId === 'player' ? 'player' : 'npc' }, line.speakerName),
      h('div', { class: `dlg-text ${line.narrator ? 'narration' : ''}` }, line.text)));
    this.current = { speaker: line.speakerName, text: line.text };
  }

  /** Wartet auf Weiter (E/Enter/Klick/Tippen), frühestens nach `minMs`. */
  waitAdvance(minMs: number): Promise<void> {
    this.readyAt = performance.now() + Math.max(0, minMs);
    this.next.hidden = true;
    window.setTimeout(() => { if (this.advanceResolve) this.next.hidden = false; }, Math.max(0, minMs));
    return new Promise((resolve) => { this.advanceResolve = resolve; });
  }

  advance(force = false): boolean {
    if (!this.advanceResolve) return false;
    if (!force && performance.now() < this.readyAt) return false;
    const resolve = this.advanceResolve;
    this.advanceResolve = null;
    this.next.hidden = true;
    resolve();
    return true;
  }
}
