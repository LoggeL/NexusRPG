import type { IntentEvent } from '../../platform/input/router';
import type { EndingStats } from '../context';
import { append, clear, focusables, formatTime, h } from './dom';
import type { UiShell } from './shell';

export interface TitleActions {
  hasSave(): boolean;
  /** Der vorhandene Spielstand ist eine abgeschlossene Partie (Abspann gesehen). */
  saveEnded(): boolean;
  newGame(): void;
  continueGame(): void;
  /** Spielstand aus Datei importieren. */
  loadFile(): Promise<{ ok: boolean; message: string }>;
  settings(): void;
  /** Kurzinfo zum Autosave („Kim · Stufe 3 · Tag 4, 18:20 · Neon-Gasse“). */
  saveSummary?(): string | null;
  /** Speicherplätze zum Laden öffnen (drei Plätze). */
  slots?(): void;
  /** Laufenden Spielstand als Datei exportieren. */
  exportFile?(): void;
  /** Galerie gesehener Schlüsselszenen. */
  gallery?(): void;
  /** Anzahl gesehener / aller Schlüsselszenen für die Galerie-Schaltfläche. */
  galleryCount?(): { seen: number; total: number };
  /** Versteckter Fünfklick-Shortcut auf dem Titel. */
  unlockGallery?(): void;
}

/** Vollbild-Bildschirme über dem Canvas: Boot, Titel, Abspann. */
export class Screens {
  readonly el: HTMLElement;
  private popLayer: (() => void) | null = null;
  current: 'boot' | 'title' | 'ending' | null = null;

  constructor(private readonly shell: UiShell) {
    this.el = h('div', { class: 'screen', hidden: true });
    shell.frame.append(this.el);
  }

  private open(kind: 'boot' | 'title' | 'ending', handler?: (event: IntentEvent) => boolean) {
    this.close();
    this.current = kind;
    clear(this.el);
    this.el.hidden = false;
    this.el.dataset.screen = kind;
    if (handler) this.popLayer = this.shell.input.push(`screen:${kind}`, handler, { modal: true });
  }

  close() {
    this.popLayer?.();
    this.popLayer = null;
    this.current = null;
    this.el.hidden = true;
    clear(this.el);
  }

  boot(status: string, warnings: string[] = []) {
    if (this.current !== 'boot') this.open('boot');
    clear(this.el);
    this.el.append(h('p', { class: 'title-logo', style: 'font-size:clamp(28px,8vh,64px)' }, 'Nexus'), h('p', { class: 'boot-status', role: 'status' }, status), ...warnings.map((warning) => h('p', { class: 'boot-warn' }, warning)));
  }

  private navHandler(container: HTMLElement) {
    return (event: IntentEvent) => {
      const intent = event.intent;
      if (intent.type === 'nav') {
        const items = focusables(container);
        if (!items.length) return true;
        const index = items.indexOf(document.activeElement as HTMLElement);
        const delta = intent.dir === 'up' || intent.dir === 'left' ? -1 : 1;
        items[(index + delta + items.length) % items.length].focus();
        return true;
      }
      if (intent.type === 'interact') {
        const active = document.activeElement;
        if (active instanceof HTMLElement && container.contains(active)) active.click();
        else focusables(container)[0]?.focus();
        return true;
      }
      return true;
    };
  }

  title(actions: TitleActions) {
    const menu = h('div', { class: 'title-menu', role: 'menu', 'aria-label': 'Hauptmenü' });
    const status = h('div', { class: 'status-line', role: 'status', 'aria-live': 'polite', 'data-testid': 'title-status' });
    this.open('title', this.navHandler(menu));
    const hasSave = actions.hasSave();
    // Abgeschlossene Partie: kein „Fortsetzen“ in eine Erkundung ohne Ziel – stattdessen den Abschluss erneut zeigen.
    const ended = hasSave && actions.saveEnded();
    const resumable = hasSave && !ended;
    const summary = hasSave ? actions.saveSummary?.() ?? null : null;
    const say = (result: { ok: boolean; message: string }) => { status.className = `status-line ${result.ok ? '' : 'bad'}`; status.textContent = result.message; };
    const button = (label: string, testid: string, action: () => void, extra: Record<string, string | boolean> = {}, sub?: string | null) =>
      h('button', { class: 'btn', type: 'button', role: 'menuitem', 'data-testid': testid, onclick: action, ...extra },
        h('span', { class: 'label' }, label), sub ? h('span', { class: 'sub' }, sub) : null);
    const gallery = actions.galleryCount?.();
    const galleryButton = actions.gallery
      ? button('Galerie', 'title-gallery', () => actions.gallery?.(), {}, gallery ? `${gallery.seen} / ${gallery.total} Szenen` : null)
      : null;
    let titleClicks = 0;
    const onTitleClick = () => {
      if (!actions.unlockGallery || ++titleClicks !== 5) return;
      actions.unlockGallery();
      const count = actions.galleryCount?.();
      const subtitle = galleryButton?.querySelector('.sub');
      if (count && subtitle) subtitle.textContent = `${count.seen} / ${count.total} Szenen`;
      say({ ok: true, message: 'Alle Galerie-Szenen freigeschaltet.' });
    };
    const newGame = async () => {
      if (resumable && !(await this.shell.confirm('Neue Partie', 'Die laufende Partie wird ersetzt. Gesicherte Speicherplätze bleiben erhalten.', 'Neu beginnen', 'Abbrechen'))) return;
      actions.newGame();
    };
    append(menu, [
      ended
        ? button('Abspann ansehen', 'title-continue', () => actions.continueGame(), { 'data-ended': 'true', class: 'btn primary' }, summary)
        : button('Fortsetzen', 'title-continue', () => actions.continueGame(), hasSave ? { class: 'btn primary' } : { disabled: true, 'aria-disabled': 'true' }, summary),
      button('Neue Partie', 'title-new', () => void newGame(), resumable ? {} : { class: 'btn primary' }),
      actions.slots ? button('Speicherplätze', 'title-slots', () => actions.slots?.(), {}, 'drei Plätze laden') : null,
      button('Importieren', 'title-load', async () => say(await actions.loadFile()), {}, 'Spielstand aus Datei'),
      actions.exportFile
        ? button('Exportieren', 'title-export', () => { actions.exportFile?.(); say({ ok: true, message: 'Spielstand als Datei gespeichert.' }); }, hasSave ? {} : { disabled: true, 'aria-disabled': 'true' }, 'Spielstand als Datei')
        : null,
      galleryButton,
      button('Einstellungen', 'title-settings', () => actions.settings()),
    ]);
    this.el.append(
      h('div', { class: 'title-bg', 'aria-hidden': 'true' }),
      h('h1', { class: 'title-logo', 'data-testid': 'title-logo', 'data-text': 'Nexus', onclick: onTitleClick }, 'Nexus'),
      h('p', { class: 'title-sub' }, 'Das RPG · Noxius 2086'),
      menu, status,
      h('div', { class: 'title-foot' }, 'WASD/Pfeile · E · I · C · Q · R · M · P · Esc'));
    requestAnimationFrame(() => (menu.querySelector('.btn.primary:not([disabled])') as HTMLElement | null ?? focusables(menu)[0])?.focus());
  }

  ending(stats: EndingStats, onTitle: () => void) {
    const panel = h('section', { class: 'ending panel', role: 'dialog', 'aria-label': 'Abspann', 'data-testid': 'ending' });
    this.open('ending', this.navHandler(panel));
    panel.append(
      h('h2', null, 'Noxius leuchtet weiter'),
      h('div', { class: 'epilogue' }, stats.epilogue.map((line) => h('p', null, line))),
      h('dl', { class: 'stats' },
        h('dt', null, 'Spielzeit'), h('dd', null, stats.playTimeText || formatTime(stats.playTimeMs)),
        h('dt', null, 'Tage in Noxius'), h('dd', null, String(stats.days)),
        h('dt', null, 'Stufe'), h('dd', null, String(stats.level)),
        h('dt', null, 'Quests abgeschlossen'), h('dd', null, `${stats.quests.found} / ${stats.quests.total}`),
        h('dt', null, 'Orte besucht'), h('dd', null, `${stats.places.found} / ${stats.places.total}`),
        h('dt', null, 'Galerie'), h('dd', null, `${stats.gallery.found} / ${stats.gallery.total}`),
        h('dt', null, 'Herzen gesamt'), h('dd', null, String(stats.hearts)),
        h('dt', null, 'Checks bestanden'), h('dd', null, String(stats.checksPassed)),
        h('dt', null, 'Kämpfe gewonnen'), h('dd', null, String(stats.battlesWon))),
      h('button', { class: 'btn primary', type: 'button', 'data-testid': 'ending-title', onclick: onTitle }, 'Zum Titel'));
    this.el.append(panel);
    requestAnimationFrame(() => { (panel.querySelector('button') as HTMLElement | null)?.focus({ preventScroll: true }); const epilogue = panel.querySelector('.epilogue'); if (epilogue) epilogue.scrollTop = 0; });
  }
}
