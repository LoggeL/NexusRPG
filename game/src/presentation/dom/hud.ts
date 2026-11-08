// HUD (Bereich dom-ui): Crew-Leiste mit Porträts und LP, Uhr mit Tageszeit-Symbol und Wochentag, Credits,
// aktives Ziel, Menüknöpfe, Interaktionshinweis, Kartenname. Toasts (inkl. Herz +/−) zeigt die UiShell.
import { monogramUrl, playerAccent } from '../appearance/accent';
import type { CampaignPort, GameState, NpcId, TimeSlot } from '../../modules/contracts';
import type { AssetCatalog } from '../../platform/assets/manifest';
import { GAME_H, GAME_W } from './layout';
import { clear, h, setPortrait } from './dom';
import type { UiShell } from './shell';
import { clockModel, hpModel } from './viewModels';

const SVG_NS = 'http://www.w3.org/2000/svg';

/** Kleine Neon-Symbole je Tageszeit (Sonnenaufgang, Sonne, Abendsonne, Mond). */
const SLOT_PATHS: Record<TimeSlot, string[]> = {
  morgen: ['M3 17h18', 'M7 17a5 5 0 0 1 10 0', 'M12 6v3', 'M5.6 10.6l1.8 1.4', 'M18.4 10.6l-1.8 1.4'],
  tag: ['M12 8a4 4 0 1 0 0.01 0', 'M12 2v2', 'M12 20v2', 'M2 12h2', 'M20 12h2', 'M4.9 4.9l1.4 1.4', 'M17.7 17.7l1.4 1.4', 'M4.9 19.1l1.4-1.4', 'M17.7 6.3l1.4-1.4'],
  abend: ['M3 18h18', 'M6 18a6 6 0 0 1 12 0', 'M5 21h14', 'M12 9v2'],
  nacht: ['M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z', 'M17 3v2', 'M16 4h2'],
};

export function slotIcon(slot: TimeSlot): SVGSVGElement {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('class', `slot-icon ${slot}`);
  svg.setAttribute('aria-hidden', 'true');
  for (const d of SLOT_PATHS[slot]) {
    const path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('d', d);
    svg.append(path);
  }
  return svg;
}

export interface HudActions {
  inventory(): void;
  character(): void;
  quests(): void;
  relations(): void;
  map(): void;
  phone(): void;
  menu(): void;
}

interface MemberEl { root: HTMLElement; img: HTMLImageElement; bar: HTMLElement; fill: HTMLElement; portrait: string }

export class Hud {
  readonly el: HTMLElement;
  private party: HTMLElement;
  private status: HTMLElement;
  private objective: HTMLElement;
  private objectiveToggle: HTMLButtonElement;
  private objectiveText: HTMLElement;
  private objectiveKey = '';
  private objectivePinned = false;
  private objectiveTimer = 0;
  private buttons: HTMLButtonElement[] = [];
  private hint: HTMLElement;
  private banner: HTMLElement;
  private hover: HTMLElement;
  private coords: HTMLElement;
  private partyKey = '';
  private statusKey = '';
  private memberEls = new Map<string, MemberEl>();
  private bannerTimer = 0;

  constructor(private readonly shell: UiShell, private readonly catalog: AssetCatalog, private readonly campaign: CampaignPort, actions: HudActions) {
    this.party = h('div', { class: 'hud-party', role: 'list', 'aria-label': 'Crew', 'data-testid': 'hud-party' });
    this.status = h('div', { class: 'hud-status', 'data-testid': 'hud-status', 'aria-live': 'off' });
    this.objectiveToggle = h('button', {
      class: 'obj-toggle', type: 'button', 'aria-expanded': 'false', 'aria-controls': 'hud-objective-text',
      title: 'Ziel ein-/ausklappen', 'data-testid': 'hud-objective-toggle',
      onclick: (event: Event) => { if ((event as MouseEvent).detail > 0) (event.currentTarget as HTMLElement).blur(); this.toggleObjective(); },
    }, 'Ziel');
    this.objectiveText = h('span', { class: 'obj-text', id: 'hud-objective-text', 'aria-live': 'polite', 'data-testid': 'hud-objective-text' });
    this.objective = h('div', { class: 'hud-objective', 'data-testid': 'hud-objective', hidden: true }, this.objectiveToggle, this.objectiveText);
    this.objective.addEventListener('pointerenter', () => this.objective.classList.add('hover'));
    this.objective.addEventListener('pointerleave', () => this.objective.classList.remove('hover'));
    const button = (label: string, key: string, testid: string, action: () => void) =>
      h('button', {
        class: 'btn hud-btn', type: 'button', 'data-testid': testid, title: `${label} (${key})`, 'aria-keyshortcuts': key,
        onclick: (event: Event) => {
          if (event.currentTarget instanceof HTMLElement && event.currentTarget.getAttribute('aria-disabled') === 'true') return;
          if ((event as MouseEvent).detail > 0) (event.currentTarget as HTMLElement).blur();
          action();
        },
      }, label, h('kbd', null, key));
    this.buttons = [
      button('Inventar', 'I', 'hud-inventory', actions.inventory),
      button('Figur', 'C', 'hud-character', actions.character),
      button('Quests', 'Q', 'hud-quests', actions.quests),
      button('Crew', 'R', 'hud-relations', actions.relations),
      button('Karte', 'M', 'hud-map', actions.map),
      button('Telefon', 'P', 'hud-phone', actions.phone),
      button('Menü', 'Esc', 'hud-menu', actions.menu),
    ];
    const buttons = h('nav', { class: 'hud-buttons', 'aria-label': 'Menüs' }, ...this.buttons);
    this.hint = h('div', { class: 'hud-hint', 'data-testid': 'hud-hint', hidden: true });
    this.banner = h('div', { class: 'map-banner', 'aria-live': 'polite' });
    this.hover = h('div', { class: 'hover-label', hidden: true });
    this.coords = h('div', { class: 'debug-coords', hidden: true, 'data-testid': 'debug-coords' });
    this.el = h('div', { class: 'hud', 'data-testid': 'hud', hidden: true }, this.party, this.status, this.objective, buttons, this.hint);
    shell.frame.append(this.banner, this.el, this.hover, this.coords);
  }

  setVisible(visible: boolean) {
    this.el.hidden = !visible;
    if (!visible) this.hover.hidden = true;
  }

  setBlocked(blocked: boolean) {
    for (const button of this.buttons) button.setAttribute('aria-disabled', String(blocked));
    this.el.classList.toggle('blocked', blocked);
  }

  revealObjective(ms = 4500) {
    if (this.objective.hidden) return;
    this.objective.classList.add('open');
    this.objectiveToggle.setAttribute('aria-expanded', 'true');
    window.clearTimeout(this.objectiveTimer);
    this.objectiveTimer = window.setTimeout(() => {
      if (this.objectivePinned) return;
      this.objective.classList.remove('open');
      this.objectiveToggle.setAttribute('aria-expanded', 'false');
    }, ms);
  }

  toggleObjective() {
    window.clearTimeout(this.objectiveTimer);
    this.objectivePinned = !this.objective.classList.contains('open');
    this.objective.classList.toggle('open', this.objectivePinned);
    this.objectiveToggle.setAttribute('aria-expanded', String(this.objectivePinned));
  }

  objectiveExpanded(): boolean { return this.objective.classList.contains('open'); }

  update(state: Readonly<GameState>) {
    const members: ('player' | NpcId)[] = ['player', ...state.party];
    const key = members.join(',');
    if (key !== this.partyKey) {
      this.partyKey = key;
      clear(this.party);
      this.memberEls.clear();
      for (const id of members) {
        const img = h('img', { alt: '', draggable: 'false' });
        const fill = h('span');
        const bar = h('div', { class: 'hp', 'aria-hidden': 'true' }, fill);
        const root = h('div', { class: `party-member${id === 'player' ? ' is-player' : ''}`, role: 'listitem', 'data-member': id }, img, bar);
        this.party.append(root);
        this.memberEls.set(id, { root, img, bar, fill, portrait: '' });
      }
    }
    const maxHp = this.campaign.maxHp();
    for (const [id, entry] of this.memberEls) {
      const name = this.campaign.displayName(id);
      if (id === 'player') {
        const hp = hpModel(state.player.hp, maxHp);
        entry.fill.style.width = `${hp.percent}%`;
        entry.bar.classList.toggle('low', hp.level === 'low');
        entry.bar.classList.toggle('crit', hp.level === 'crit');
        entry.root.setAttribute('aria-label', `${name}: ${state.player.hp} von ${maxHp} LP`);
      } else {
        const hearts = this.campaign.hearts(id);
        entry.fill.style.width = `${hearts * 10}%`;
        entry.bar.classList.add('hearts-bar');
        entry.root.setAttribute('aria-label', `${name}: ${hearts} Herzen`);
        entry.root.title = `${name} · ${hearts} ♥`;
      }
      const portrait = this.campaign.portraitKey(id) ?? '';
      // Spielfigur ohne Porträt (Ich-Perspektive): Monogramm in der Kennfarbe.
      const accent = id === 'player' && !portrait ? playerAccent(this.campaign.content, state.player) : '';
      if (portrait + name + accent !== entry.portrait) {
        entry.portrait = portrait + name + accent;
        if (accent) { entry.img.onerror = null; entry.img.src = monogramUrl(name, accent); }
        else setPortrait(entry.img, this.catalog, portrait || null, name);
      }
    }
    const clock = clockModel(state.clock.day, state.clock.minutes, this.campaign.timeSlot(), this.campaign.weekday());
    const statusKey = `${clock.label}|${state.credits}|${state.player.hp}/${maxHp}`;
    if (statusKey !== this.statusKey) {
      this.statusKey = statusKey;
      clear(this.status);
      const hp = hpModel(state.player.hp, maxHp);
      this.status.setAttribute('aria-label', `${clock.label}, ${state.credits} Credits, ${state.player.hp} von ${maxHp} Lebenspunkten`);
      this.status.dataset.slot = clock.slot;
      this.status.append(
        h('span', { class: 'clock', title: clock.label, 'data-testid': 'hud-clock' }, slotIcon(clock.slot), h('span', { class: 'time' }, clock.time)),
        h('span', { class: 'day', title: clock.label }, `${clock.weekday.slice(0, 2)} · Tag ${clock.day}`),
        h('span', { class: `lp ${hp.level}`, title: 'Lebenspunkte', 'data-testid': 'hud-hp' }, h('span', { class: 'lp-label' }, 'LP'), `${state.player.hp}/${maxHp}`),
        h('span', { class: 'credits', title: 'Credits', 'data-testid': 'hud-credits' }, `${state.credits} ¢`),
      );
    }
    const objective = this.campaign.objective();
    const text = objective?.text ?? '';
    if (text !== this.objectiveKey) {
      this.objectiveKey = text;
      this.objectiveText.textContent = text;
      this.objective.title = text;
      this.objective.hidden = !text;
      if (text) this.revealObjective();
    }
  }

  setHint(text: string | null, key = 'E') {
    clear(this.hint);
    if (!text) { this.hint.hidden = true; return; }
    this.hint.hidden = false;
    this.hint.append(h('kbd', null, key), text);
  }

  hintText(): string | null { return this.hint.hidden ? null : this.hint.textContent; }

  showBanner(name: string, subtitle?: string, ms = 2600) {
    clear(this.banner);
    this.banner.append(h('div', { class: 'name' }, name));
    if (subtitle) this.banner.append(h('div', { class: 'sub' }, subtitle));
    this.banner.classList.add('show');
    this.revealObjective(ms + 1800);
    window.clearTimeout(this.bannerTimer);
    this.bannerTimer = window.setTimeout(() => this.banner.classList.remove('show'), ms);
  }

  /** Mausover-Label an Bildschirmkoordinaten der Spielfläche (GAME_W × GAME_H). */
  setHover(text: string | null, screenX = 0, screenY = 0) {
    if (!text) { this.hover.hidden = true; return; }
    const frame = this.shell.frame.getBoundingClientRect();
    this.hover.textContent = text;
    this.hover.style.left = `${(screenX / GAME_W) * frame.width}px`;
    this.hover.style.top = `${(screenY / GAME_H) * frame.height - 6}px`;
    this.hover.hidden = false;
  }

  setCoords(text: string | null) {
    this.coords.hidden = !text;
    if (text) this.coords.textContent = text;
  }
}
