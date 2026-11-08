import type { InputRouter, IntentEvent } from '../../platform/input/router';
import { clear, focusables, h } from './dom';
import { classifyToast, type ToastKind } from './viewModels';

export type Tone = 'info' | 'good' | 'bad';

const TOAST_GLYPH: Partial<Record<ToastKind, string>> = { xp: '✦', level: '▲', credits: '¢', quest: '◆', item: '▣', station: 'Ⓤ', phone: '✉' };

/** Toast-Element: Herz-Meldungen („Raven ♥ +45“) mit Herzsymbol in Pink bzw. gebrochen, sonst Symbol je Art. */
function toastElement(text: string, tone: Tone): HTMLElement {
  const model = classifyToast(text);
  if (model.kind === 'heart' && model.heart) {
    const up = model.heart.delta > 0;
    return h('div', { class: `toast panel heart ${up ? 'up good' : 'down bad'}`, 'data-text': text, 'data-kind': 'heart' },
      h('span', { class: 'toast-glyph', 'aria-hidden': 'true' }, up ? '♥' : '♡'),
      h('span', { class: 'toast-name' }, model.heart.name),
      h('span', { class: 'toast-delta' }, `${up ? '+' : '−'}${Math.abs(model.heart.delta)}`),
      h('span', { class: 'sr-only' }, up ? ' Herzpunkte' : ' Herzpunkte verloren'));
  }
  const glyph = TOAST_GLYPH[model.kind];
  return h('div', { class: `toast panel ${tone}`, 'data-text': text, 'data-kind': model.kind },
    glyph ? h('span', { class: 'toast-glyph', 'aria-hidden': 'true' }, glyph) : null, h('span', null, text));
}

/** Reiterleiste (role=tablist); Pfeil links/rechts wechselt im Modal den Reiter. */
export function tabBar<T extends string>(label: string, items: readonly { id: T; label: string; badge?: number | string }[], active: T, select: (id: T) => void): HTMLElement {
  return h('div', { class: 'tabs', role: 'tablist', 'aria-label': label },
    ...items.map((item) => h('button', {
      type: 'button', role: 'tab', 'aria-selected': String(item.id === active), tabindex: item.id === active ? '0' : '-1', 'data-tab': item.id,
      onclick: () => select(item.id),
    }, item.label, item.badge !== undefined && item.badge !== 0 && item.badge !== '' ? h('span', { class: 'badge' }, String(item.badge)) : null)));
}

export interface ModalOptions {
  name: string;
  title: string;
  size?: 'narrow' | 'wide';
  closable?: boolean;
  onClose?: () => void;
  /** Eigene Absichtsbehandlung vor der Standardlogik (true = verbraucht). */
  onIntent?: (event: IntentEvent) => boolean | void;
}

let modalSeq = 0;

/** Modales Overlay mit Fokusführung, ARIA, Escape-Schließen und Router-Layer. */
export class Modal {
  readonly backdrop: HTMLElement;
  readonly el: HTMLElement;
  readonly body: HTMLElement;
  readonly foot: HTMLElement;
  readonly titleEl: HTMLElement;
  readonly closed: Promise<void>;
  private resolveClosed!: () => void;
  private popLayer: () => void;
  private previousFocus: Element | null;
  private isClosed = false;

  constructor(private readonly shell: UiShell, readonly options: ModalOptions) {
    const id = `modal-${++modalSeq}`;
    this.previousFocus = document.activeElement;
    this.closed = new Promise((resolve) => { this.resolveClosed = resolve; });
    this.titleEl = h('h2', { id: `${id}-title` }, options.title);
    const closeButton = options.closable === false ? null : h('button', { class: 'btn small modal-close', type: 'button', 'aria-label': 'Schließen', title: 'Schließen (Esc)', onclick: () => this.close() }, '✕');
    this.body = h('div', { class: 'modal-body' });
    this.foot = h('div', { class: 'modal-foot' });
    this.el = h('section', { class: `modal panel ${options.size ?? ''}`, role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': `${id}-title`, 'data-overlay': options.name },
      h('header', { class: 'modal-head' }, this.titleEl, closeButton), this.body, this.foot);
    this.backdrop = h('div', { class: 'modal-backdrop', 'data-overlay-backdrop': options.name }, this.el);
    this.backdrop.addEventListener('pointerdown', (event) => {
      if (event.target === this.backdrop && options.closable !== false) this.close();
    });
    this.el.addEventListener('keydown', (event) => this.trapTab(event));
    shell.root.append(this.backdrop);
    this.popLayer = shell.input.push(`overlay:${options.name}`, (event) => this.handle(event), { modal: true });
    shell.registerModal(this);
    requestAnimationFrame(() => this.focusFirst());
  }

  get name() { return this.options.name; }
  get open() { return !this.isClosed; }

  focusFirst() {
    if (this.isClosed) return;
    const preferred = this.el.querySelector<HTMLElement>('[data-autofocus]');
    const target = preferred && preferred.offsetParent !== null ? preferred : focusables(this.body)[0] ?? focusables(this.el)[0];
    target?.focus({ preventScroll: true });
  }

  close() {
    if (this.isClosed) return;
    this.isClosed = true;
    this.popLayer();
    this.backdrop.remove();
    this.shell.unregisterModal(this);
    this.options.onClose?.();
    if (this.previousFocus instanceof HTMLElement && document.contains(this.previousFocus)) this.previousFocus.focus({ preventScroll: true });
    else (document.activeElement as HTMLElement | null)?.blur?.();
    this.resolveClosed();
  }

  private handle(event: IntentEvent): boolean {
    if (this.options.onIntent?.(event)) return true;
    const intent = event.intent;
    if (intent.type === 'cancel') {
      if (this.options.closable !== false) this.close();
      return true;
    }
    if (intent.type === 'nav') {
      this.moveFocus(intent.dir === 'up' || intent.dir === 'left' ? -1 : 1, intent.dir);
      return true;
    }
    if (intent.type === 'interact') {
      const active = document.activeElement;
      if (active instanceof HTMLElement && this.el.contains(active) && active !== this.el) active.click();
      return true;
    }
    // Dieselbe Menütaste schließt das eigene Overlay wieder (Modalname = Absicht).
    if (['inventory', 'character', 'quests', 'relations', 'map', 'phone'].includes(intent.type)) {
      if (this.options.name === intent.type) this.close();
      return true;
    }
    return true;
  }

  private moveFocus(delta: number, dir: string) {
    const active = document.activeElement as HTMLElement | null;
    // Tabs: links/rechts wechselt den Reiter.
    if (active?.getAttribute('role') === 'tab' && (dir === 'left' || dir === 'right')) {
      const tabs = [...(active.parentElement?.querySelectorAll<HTMLElement>('[role="tab"]') ?? [])];
      const next = tabs[(tabs.indexOf(active) + delta + tabs.length) % tabs.length];
      next?.focus();
      next?.click();
      return;
    }
    if (active instanceof HTMLInputElement && active.type === 'range' && (dir === 'left' || dir === 'right')) {
      // stepUp zählt in Vielfachen von `step` (5 %) – ein Tastendruck = ein Schritt.
      active.stepUp(delta > 0 ? 1 : -1);
      active.dispatchEvent(new Event('input', { bubbles: true }));
      return;
    }
    const items = focusables(this.el);
    if (!items.length) return;
    const index = active ? items.indexOf(active) : -1;
    const next = items[(index + delta + items.length) % items.length];
    next.focus();
    next.scrollIntoView?.({ block: 'nearest' });
  }

  private trapTab(event: KeyboardEvent) {
    if (event.key !== 'Tab') return;
    const items = focusables(this.el);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
}

/** Wurzel der DOM-Oberfläche: Rahmen über dem Canvas, Toasts, Modale. */
export class UiShell {
  readonly frame: HTMLElement;
  readonly toasts: HTMLElement;
  private modals: Modal[] = [];
  private live: HTMLElement;
  private modalListeners = new Set<() => void>();
  reducedMotion = false;

  constructor(readonly root: HTMLElement, readonly input: InputRouter) {
    clear(root);
    this.frame = h('div', { class: 'frame', id: 'frame' });
    this.toasts = h('div', { class: 'toasts', 'aria-live': 'polite', role: 'status' });
    this.live = h('div', { class: 'sr-only', 'aria-live': 'assertive' });
    this.frame.append(this.toasts);
    root.append(this.frame, this.live);
  }

  registerModal(modal: Modal) { this.modals.push(modal); this.emitModal(); }
  unregisterModal(modal: Modal) { this.modals = this.modals.filter((entry) => entry !== modal); this.emitModal(); }
  onModalChange(listener: () => void) { this.modalListeners.add(listener); return () => this.modalListeners.delete(listener); }
  private emitModal() { for (const listener of this.modalListeners) listener(); }

  topModal(): Modal | null { return this.modals.at(-1) ?? null; }
  modalOpen(name?: string): boolean { return name ? this.modals.some((modal) => modal.name === name) : this.modals.length > 0; }
  closeAllModals() { for (const modal of [...this.modals].reverse()) modal.close(); }
  closeModal(name: string) { for (const modal of [...this.modals].reverse()) if (modal.name === name) modal.close(); }

  announce(text: string) { this.live.textContent = text; }

  /** Kurzmeldung. Höchstens MAX_TOASTS gleichzeitig sichtbar; ältere blenden aus, gleiche Texte ersetzen sich. */
  toast(text: string, tone: Tone = 'info', ms = 3200) {
    const active = () => [...this.toasts.children].filter((child) => !child.classList.contains('leaving')) as HTMLElement[];
    for (const existing of active()) if (existing.dataset.text === text) this.dismissToast(existing, true);
    const element = toastElement(text, tone);
    this.toasts.append(element);
    const visible = active();
    for (const old of visible.slice(0, Math.max(0, visible.length - UiShell.MAX_TOASTS))) this.dismissToast(old);
    setTimeout(() => this.dismissToast(element), ms);
  }

  private static readonly MAX_TOASTS = 3;

  private dismissToast(element: HTMLElement, instant = false) {
    if (element.classList.contains('leaving')) return;
    if (instant || this.reducedMotion) { element.remove(); return; }
    element.classList.add('leaving');
    setTimeout(() => element.remove(), 300);
  }

  setReducedMotion(value: boolean) {
    this.reducedMotion = value;
    document.documentElement.classList.toggle('reduced-motion', value);
  }

  /** Schriftgröße der Oberfläche (Einstellung „Textgröße“); main.css skaliert über `--text-scale`. */
  setTextScale(scale: number) {
    const value = Number.isFinite(scale) && scale > 0 ? scale : 1;
    document.documentElement.style.setProperty('--text-scale', String(value));
    document.documentElement.dataset.textScale = String(value);
  }

  /** Bestätigungsdialog; liefert true bei „Ja“. */
  confirm(title: string, text: string, yes = 'Ja', no = 'Abbrechen', name = 'confirm'): Promise<boolean> {
    return new Promise((resolve) => {
      let answered = false;
      const modal = new Modal(this, { name, title, size: 'narrow', onClose: () => { if (!answered) resolve(false); } });
      modal.body.append(h('p', { class: 'lead' }, text));
      const answer = (value: boolean) => { answered = true; resolve(value); modal.close(); };
      modal.foot.append(
        h('button', { class: 'btn', type: 'button', onclick: () => answer(false), 'data-autofocus': true }, no),
        h('button', { class: 'btn primary', type: 'button', onclick: () => answer(true), 'data-testid': 'confirm-yes' }, yes),
      );
    });
  }

  /** Einfacher Hinweisdialog. */
  alert(title: string, text: string, button = 'OK'): Promise<void> {
    const modal = new Modal(this, { name: 'alert', title, size: 'narrow' });
    modal.body.append(h('p', { class: 'lead' }, text));
    modal.foot.append(h('button', { class: 'btn primary', type: 'button', onclick: () => modal.close(), 'data-autofocus': true }, button));
    return modal.closed;
  }
}
