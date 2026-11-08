// Kampfoberfläche (Bereich combat-presentation) als DOM-Overlay über der Kampfszene:
// Zugreihenfolge, Rundenanzeige, Einheitenkarte, Aktionsleiste 1–8 mit Untermenüs, Zielvorschau,
// Protokoll, Banner, gesprochene Zeilen und Sieg-/Niederlage-Bildschirm mit Belohnungen.
// Läuft als Modal „battle“, damit Director.battle() ihn beim Abbruch schließen kann und Bewegung gesperrt ist.
import type { StatusId } from '../../modules/contracts';
import type { AssetCatalog } from '../../platform/assets/manifest';
import type { IntentEvent } from '../../platform/input/types';
import type { ActionKey } from '../phaser/battle/actions';
import { statusIconUrl } from '../phaser/battle/art';
import type { BattleHudView, HudModel, ResultModel, UnitCard } from '../phaser/battle/controller';
import { GAME_H } from './layout';
import type { Insets } from '../phaser/battle/geometry';
import { STATUS_META } from '../phaser/battle/text';
import { clear, h, portraitImg } from './dom';
import { Modal, type UiShell } from './shell';
import './battle.css';

export interface BattleUiHandlers {
  action(key: ActionKey): void;
  pickSub(index: number): void;
  cancel(): void;
  confirm(): void;
  selectUnit(id: string): void;
  /** Tastatur und Router (Pfeile, Enter, Esc, Ziffern). */
  intent(event: IntentEvent): void;
  toggleZoom(): 'fit' | 'close';
  /** Modal wurde von außen geschlossen (Director bricht den Kampf ab). */
  closed(): void;
  /** Einstellungen: reduzierte Bewegung. */
  reducedMotion(): boolean;
  sfx?(id: 'select' | 'confirm' | 'deny'): void;
}

type Waiter = { resolve: () => void; timer: ReturnType<typeof setTimeout> | null };

const LOG_LINES = 4;

export class BattleUi implements BattleHudView {
  private readonly modal: Modal;
  private readonly root: HTMLElement;
  private readonly top: HTMLElement;
  private readonly order: HTMLElement;
  private readonly round: HTMLElement;
  private readonly objective: HTMLElement;
  private readonly zoomButton: HTMLButtonElement;
  private readonly bottom: HTMLElement;
  private readonly card: HTMLElement;
  private readonly actions: HTMLElement;
  private readonly controls: HTMLElement;
  private readonly menu: HTMLElement;
  private readonly prompt: HTMLElement;
  private readonly target: HTMLElement;
  private readonly logEl: HTMLElement;
  private readonly bannerEl: HTMLElement;
  private readonly sayEl: HTMLElement;
  private readonly toastEl: HTMLElement;
  private readonly resultEl: HTMLElement;
  private waiter: Waiter | null = null;
  private resultWaiter: (() => void) | null = null;
  private closedByUs = false;
  private lines: string[] = [];
  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private readonly shell: UiShell, private readonly catalog: AssetCatalog, private readonly handlers: BattleUiHandlers, title: string, initialZoom: 'fit' | 'close' = 'fit') {
    this.modal = new Modal(shell, {
      name: 'battle', title, closable: false,
      onIntent: (event) => { this.onIntent(event); return true; },
      onClose: () => { if (!this.closedByUs) handlers.closed(); this.resolveAll(); },
    });
    this.modal.backdrop.classList.add('battle-host', 'on-frame');
    this.modal.el.classList.add('battle-modal');
    const button = (label: string, cls: string, onclick: () => void, attrs: Record<string, string> = {}) => h('button', {
      type: 'button', class: `btn small ${cls}`, onclick: (event: Event) => { event.stopPropagation(); onclick(); },
      onmousedown: (event: Event) => event.preventDefault(), ...attrs,
    }, label);

    this.order = h('ol', { class: 'bui-order bui-hit', 'aria-label': 'Zugreihenfolge' });
    this.round = h('div', { class: 'bui-round' });
    this.objective = h('div', { class: 'bui-objective' });
    this.zoomButton = button('Zoom', 'bui-zoom bui-hit', () => this.toggleZoom(), { 'data-testid': 'battle-zoom', title: 'Ansicht: ganze Arena oder Nahansicht (auch Mausrad/zwei Finger)' });
    this.top = h('header', { class: 'bui-top' }, h('div', { class: 'bui-status' }, this.round, this.objective), this.order, this.zoomButton);

    this.card = h('div', { class: 'bui-card' });
    this.actions = h('div', { class: 'bui-actions bui-hit', role: 'toolbar', 'aria-label': 'Aktionen' });
    this.controls = h('div', { class: 'bui-controls bui-hit' });
    this.menu = h('div', { class: 'bui-menu panel bui-hit', role: 'menu', hidden: true });
    this.prompt = h('div', { class: 'bui-prompt', 'aria-live': 'polite' });
    this.bottom = h('footer', { class: 'bui-bottom' }, this.card, this.actions, this.controls);

    this.target = h('aside', { class: 'bui-target panel', hidden: true });
    this.logEl = h('div', { class: 'bui-log', 'aria-hidden': 'true' });
    this.bannerEl = h('div', { class: 'bui-banner bui-hit', hidden: true, onclick: () => this.skip() });
    this.sayEl = h('div', { class: 'bui-say panel bui-hit', hidden: true, onclick: () => this.skip() });
    this.toastEl = h('div', { class: 'bui-toast', role: 'status', hidden: true });
    this.resultEl = h('div', { class: 'bui-result-wrap bui-hit', hidden: true });

    this.root = h('div', { class: 'battle-ui', tabindex: '-1', 'data-autofocus': true, 'data-testid': 'battle-ui' },
      this.top, this.target, this.logEl, this.prompt, this.menu, this.bottom, this.bannerEl, this.sayEl, this.toastEl, this.resultEl);
    this.modal.body.append(this.root);
    this.syncZoomLabel(initialZoom);
  }

  // ---------------------------------------------------------------- BattleHudView

  update(model: HudModel) {
    this.root.dataset.phase = model.phase;
    this.round.textContent = `Runde ${model.round} · ${phaseLabel(model)}`;
    this.objective.textContent = model.objective;
    this.renderOrder(model);
    this.renderCard(model.active);
    this.renderActions(model);
    this.renderMenu(model);
    this.renderTarget(model);
    this.prompt.textContent = model.prompt;
    this.prompt.hidden = !model.prompt;
  }

  banner(text: string, sub?: string): Promise<void> {
    clear(this.bannerEl);
    this.bannerEl.append(h('strong', null, text));
    if (sub) this.bannerEl.append(h('span', null, sub));
    this.bannerEl.hidden = false;
    this.bannerEl.classList.remove('show');
    void this.bannerEl.offsetWidth;
    this.bannerEl.classList.add('show');
    this.shell.announce(sub ? `${text}. ${sub}` : text);
    return this.hold(this.handlers.reducedMotion() ? 650 : 1100).then(() => { this.bannerEl.hidden = true; });
  }

  say(speaker: string, text: string): Promise<void> {
    clear(this.sayEl);
    if (speaker) this.sayEl.append(h('strong', null, speaker));
    this.sayEl.append(h('p', null, text), h('span', { class: 'bui-say-next' }, 'Weiter ▸'));
    this.sayEl.hidden = false;
    this.shell.announce(speaker ? `${speaker}: ${text}` : text);
    return this.hold(Math.max(2600, text.length * 55)).then(() => { this.sayEl.hidden = true; });
  }

  log(line: string) {
    this.lines.push(line);
    if (this.lines.length > LOG_LINES) this.lines.splice(0, this.lines.length - LOG_LINES);
    clear(this.logEl);
    this.lines.forEach((entry, index) => this.logEl.append(h('p', { class: index === this.lines.length - 1 ? 'new' : '' }, entry)));
    this.shell.announce(line);
  }

  toast(text: string, tone: 'info' | 'good' | 'bad' = 'info') {
    this.toastEl.textContent = text;
    this.toastEl.className = `bui-toast ${tone}`;
    this.toastEl.hidden = false;
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => { this.toastEl.hidden = true; }, 2600);
    this.shell.announce(text);
  }

  sfx(id: 'select' | 'confirm' | 'deny') { this.handlers.sfx?.(id); }

  showResult(model: ResultModel): Promise<void> {
    clear(this.resultEl);
    const next = h('button', { type: 'button', class: 'btn primary', 'data-testid': 'battle-continue', onclick: () => this.finishResult() }, 'Weiter');
    const panel = h('section', { class: `bui-result panel ${model.outcome}`, role: 'dialog', 'aria-label': model.title },
      h('h2', { class: 'bui-result-title', 'data-text': model.title }, model.title),
      h('p', { class: 'bui-result-sub' }, model.subtitle),
      model.rewards.length
        ? h('ul', { class: 'bui-rewards' }, model.rewards.map((reward) => h('li', null, h('span', null, reward.label), h('strong', null, reward.value))))
        : null,
      ...model.notes.map((note) => h('p', { class: 'bui-note' }, note)),
      h('div', { class: 'bui-result-foot' }, next));
    this.resultEl.append(panel);
    this.resultEl.hidden = false;
    this.bottom.hidden = true;
    this.menu.hidden = true;
    this.target.hidden = true;
    this.prompt.hidden = true;
    this.shell.announce(`${model.title}. ${model.subtitle}`);
    requestAnimationFrame(() => next.focus({ preventScroll: true }));
    return new Promise((resolve) => { this.resultWaiter = resolve; });
  }

  // ---------------------------------------------------------------- Außen

  /** Von der DOM-Oberfläche verdeckte Ränder in logischen Canvas-Pixeln (für die Kamera). */
  insets(): Insets {
    const frame = this.shell.frame.getBoundingClientRect();
    if (!frame.height) return { top: 0, right: 0, bottom: 0, left: 0 };
    const scale = frame.height / GAME_H;
    const top = this.top.getBoundingClientRect();
    const bottom = this.bottom.getBoundingClientRect();
    const covered = (value: number) => Math.max(0, Math.min(GAME_H / 2, value / scale));
    return {
      top: top.height && top.bottom > frame.top && top.top < frame.bottom ? covered(top.bottom - frame.top) : 0,
      bottom: !this.bottom.hidden && bottom.height && bottom.top < frame.bottom && bottom.bottom > frame.top ? covered(frame.bottom - bottom.top) : 0,
      left: 0,
      right: 0,
    };
  }

  /** Rückruf, sobald sich die verdeckten Ränder ändern könnten (Größe der Leisten oder des Spielbilds). */
  onInsetsChange(callback: () => void): () => void {
    if (typeof ResizeObserver === 'undefined') return () => {};
    let frame = 0;
    const observer = new ResizeObserver(() => {
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => { frame = 0; callback(); });
    });
    observer.observe(this.top);
    observer.observe(this.bottom);
    observer.observe(this.shell.frame);
    return () => { observer.disconnect(); if (frame) cancelAnimationFrame(frame); };
  }

  /** Banner/Zeile überspringen; true, wenn etwas wartete. */
  skip(): boolean {
    const waiter = this.waiter;
    if (!waiter) return false;
    this.waiter = null;
    if (waiter.timer) clearTimeout(waiter.timer);
    waiter.resolve();
    return true;
  }

  syncZoomLabel(mode: 'fit' | 'close') {
    this.zoomButton.textContent = mode === 'fit' ? 'Nah' : 'Übersicht';
    this.zoomButton.setAttribute('aria-label', mode === 'fit' ? 'Nahansicht' : 'Ganze Arena zeigen');
  }

  close() {
    if (!this.modal.open) return;
    this.closedByUs = true;
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.modal.close();
  }

  get isOpen() { return this.modal.open; }

  // ---------------------------------------------------------------- intern

  private toggleZoom() {
    this.syncZoomLabel(this.handlers.toggleZoom());
  }

  private onIntent(event: IntentEvent) {
    const intent = event.intent;
    if (this.resultWaiter) {
      if (intent.type === 'interact' || intent.type === 'cancel') this.finishResult();
      return;
    }
    if (this.waiter && (intent.type === 'interact' || intent.type === 'cancel')) { this.skip(); return; }
    this.handlers.intent(event);
  }

  private finishResult() {
    const resolve = this.resultWaiter;
    this.resultWaiter = null;
    resolve?.();
  }

  private hold(ms: number): Promise<void> {
    this.skip();
    return new Promise((resolve) => {
      const waiter: Waiter = { resolve, timer: null };
      waiter.timer = setTimeout(() => { if (this.waiter === waiter) this.waiter = null; resolve(); }, ms);
      this.waiter = waiter;
    });
  }

  private resolveAll() {
    this.skip();
    this.finishResult();
  }

  private portrait(unit: Pick<UnitCard, 'portrait' | 'name' | 'id'>): HTMLImageElement {
    return portraitImg(this.catalog, unit.portrait ?? null, unit.name, unit.name);
  }

  private renderOrder(model: HudModel) {
    clear(this.order);
    model.order.forEach((unit, index) => {
      const ratio = Math.max(0, Math.min(1, unit.hp / Math.max(1, unit.maxHp)));
      const item = h('li', {
        class: `bui-chip ${unit.team}${unit.active ? ' active' : ''}${model.inspect?.id === unit.id ? ' inspect' : ''}`,
        title: `${unit.name} · LP ${unit.hp}/${unit.maxHp}${index === 0 ? ' · am Zug' : ''}`,
      },
      h('button', {
        type: 'button', class: 'bui-chip-btn', 'aria-label': `${unit.name}, LP ${unit.hp} von ${unit.maxHp}`,
        onmousedown: (event: Event) => event.preventDefault(), onclick: () => this.handlers.selectUnit(unit.id),
      },
      this.portrait(unit),
      h('span', { class: 'bui-chip-hp' }, h('span', { style: `width:${Math.round(ratio * 100)}%` })),
      unit.statuses.length ? h('span', { class: 'bui-chip-status' }, unit.statuses.slice(0, 3).map((status) => statusImg(status.id, 14))) : null));
      this.order.append(item);
    });
  }

  private renderCard(unit: UnitCard | null) {
    clear(this.card);
    this.card.hidden = !unit;
    if (!unit) return;
    const ratio = Math.max(0, Math.min(1, unit.hp / Math.max(1, unit.maxHp)));
    const pips = h('span', { class: 'bui-ap', 'aria-label': `${unit.ap} Aktionspunkte` },
      [0, 1].map((index) => h('i', { class: index < unit.ap ? 'on' : '' })), unit.ap > 2 ? h('em', null, `+${unit.ap - 2}`) : null);
    this.card.className = `bui-card ${unit.team}`;
    this.card.append(
      this.portrait(unit),
      h('div', { class: 'bui-card-text' },
        h('strong', null, unit.name),
        h('span', { class: `bui-hp${ratio <= 0.25 ? ' crit' : ratio <= 0.5 ? ' low' : ''}` }, h('span', { style: `width:${Math.round(ratio * 100)}%` }), h('em', null, `LP ${unit.hp}/${unit.maxHp}`)),
        h('span', { class: 'bui-card-row' }, pips,
          unit.overwatch ? h('span', { class: 'bui-tag', title: 'Überwachung aktiv' }, 'Wache') : null,
          unit.statuses.map((status) => h('span', { class: 'bui-tag', title: `${STATUS_META[status.id].label}: ${STATUS_META[status.id].description}` }, statusImg(status.id, 16), `${status.turns}`)))));
  }

  private renderActions(model: HudModel) {
    clear(this.actions);
    clear(this.controls);
    const waiting = model.phase !== 'player';
    this.actions.classList.toggle('waiting', waiting);
    for (const entry of model.actions) {
      const pressed = model.selected === entry.key;
      const reason = entry.enabled ? entry.hint : entry.reason ?? entry.hint;
      this.actions.append(h('button', {
        type: 'button', class: `bui-act${entry.enabled ? '' : ' off'}${pressed ? ' on' : ''}${entry.key === 'end' ? ' end' : ''}${entry.key === 'flee' ? ' flee' : ''}`,
        'data-action': entry.key, 'data-testid': `battle-action-${entry.key}`, 'aria-disabled': entry.enabled ? 'false' : 'true', 'aria-pressed': pressed ? 'true' : 'false',
        title: `${entry.label} (${entry.hotkey})${entry.ap ? ` · ${entry.ap} AP` : ''} – ${reason}`,
        onmousedown: (event: Event) => event.preventDefault(),
        onclick: () => this.handlers.action(entry.key),
      }, h('kbd', null, String(entry.hotkey)), h('span', { class: 'bui-act-label' }, entry.label), entry.ap && entry.key !== 'end' ? h('span', { class: 'bui-act-ap' }, `${entry.ap}`) : null));
    }
    if (!waiting && (model.selected || model.pending || model.menu)) {
      this.controls.append(h('button', {
        type: 'button', class: 'btn small bui-back', 'data-testid': 'battle-back', onmousedown: (event: Event) => event.preventDefault(), onclick: () => this.handlers.cancel(),
      }, h('kbd', null, 'Esc'), ' Zurück'));
    }
    if (!waiting && model.pending) {
      this.controls.append(h('button', {
        type: 'button', class: 'btn small primary bui-confirm', 'data-testid': 'battle-confirm', onmousedown: (event: Event) => event.preventDefault(), onclick: () => this.handlers.confirm(),
      }, 'Bestätigen'));
    }
  }

  private renderMenu(model: HudModel) {
    clear(this.menu);
    const menu = model.menu;
    this.menu.hidden = !menu;
    if (!menu) return;
    this.menu.append(h('h3', null, menu.title));
    if (!menu.entries.length) this.menu.append(h('p', { class: 'meta' }, 'Nichts verfügbar.'));
    menu.entries.forEach((entry, index) => {
      this.menu.append(h('button', {
        type: 'button', role: 'menuitem', class: `bui-sub${entry.enabled ? '' : ' off'}${index === menu.index ? ' on' : ''}`,
        'data-testid': `battle-sub-${entry.id}`, 'aria-disabled': entry.enabled ? 'false' : 'true', title: entry.reason ?? entry.description,
        onmousedown: (event: Event) => event.preventDefault(), onclick: () => this.handlers.pickSub(index),
      }, h('kbd', null, String(index + 1)), h('span', { class: 'bui-sub-text' }, h('strong', null, entry.label), h('small', null, entry.reason ?? entry.meta))));
    });
  }

  private renderTarget(model: HudModel) {
    clear(this.target);
    const target = model.target;
    this.target.hidden = !target;
    if (!target) return;
    this.target.className = `bui-target panel ${target.tone}`;
    this.target.append(h('strong', null, target.title), ...target.lines.filter(Boolean).map((line) => h('p', null, line)));
  }
}

function statusImg(id: StatusId, size: number): HTMLImageElement {
  return h('img', { src: statusIconUrl(id), width: String(size), height: String(size), alt: STATUS_META[id].label, class: 'bui-status-icon', draggable: 'false' });
}

function phaseLabel(model: HudModel): string {
  switch (model.phase) {
    case 'player': return model.active ? `${model.active.name} ist am Zug` : 'Dein Zug';
    case 'enemy': return 'Gegnerzug';
    case 'intro': return 'Kampfbeginn';
    case 'busy': return 'Aktion läuft';
    case 'over': return 'Kampfende';
  }
}
