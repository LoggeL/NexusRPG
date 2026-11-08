// Dialogbox (Bereich dom-ui): Porträt, Namensschild, Schreibmaschinentext, Wahlen mit Check-Präfix „[Technik 6]“
// in Attributfarbe (nicht erfüllt: ausgegraut, „Dir fehlen 2 Punkte“), fotoreale Halbporträts (design.md §6.2).
import type {
  Expression as ContractExpression,
  AudioPort, CampaignPort, CheckEvaluation, DialogueChoiceView, DialogueLine, DialogueSession, DialogueView, SpeakerId,
} from '../../modules/contracts';
import type { AssetCatalog } from '../../platform/assets/manifest';
import type { IntentEvent } from '../../platform/input/router';
import { TEXT_SPEED_CPS, type SettingsStore } from '../../platform/settings';
import { playerAccent } from '../appearance/accent';
import { clear, h, setPortrait } from './dom';
import type { UiShell } from './shell';
import { checkReason, checkTooltip } from './viewModels';

/** Gesichtsausdrücke der Dialogfotos (design.md §6.2, `DialogueLine.expr`). */
export type Expression = ContractExpression;
export const EXPRESSIONS: readonly Expression[] = ['neutral', 'freude', 'wut', 'trauer', 'ueberrascht', 'besorgt', 'signatur', 'verlegen', 'zaertlich'];
/** Dialogzeile; `expr` kann aus älteren Daten auch ein freier Text sein (dann gilt die Porträtvariante bzw. neutral). */
export type ExpressiveLine = Omit<DialogueLine, 'expr'> & { expr?: string };

/** Ältere Porträtvarianten → Ausdruck. */
const VARIANT_EXPR: Record<string, Expression> = { angry: 'wut', happy: 'freude', sad: 'trauer', surprised: 'ueberrascht', worried: 'besorgt' };

export function expressionOf(line: ExpressiveLine): Expression {
  const raw = line.expr ?? line.portrait;
  if (raw && (EXPRESSIONS as readonly string[]).includes(raw)) return raw as Expression;
  if (raw && VARIANT_EXPR[raw]) return VARIANT_EXPR[raw];
  return 'neutral';
}

export interface DisplayLine {
  speakerName: string;
  portrait: string | null;
  text: string;
  narrator: boolean;
  speakerId: string;
  /** URL des fotorealen Halbporträts (fehlt → gemaltes Porträt). */
  photo?: string | null;
  expr?: Expression;
}

export interface DialogueHooks {
  /** Nach einer Check-Wahl (bestanden): z. B. kurze Rückmeldung mit Aufschlüsselung. */
  onCheck?(evaluation: CheckEvaluation): void;
  onMessages(messages: string[]): void;
}

export interface DialogueSnapshot {
  speaker: string;
  text: string;
  typing: boolean;
  choices: { index: number; text: string; check?: string; enabled: boolean }[] | null;
  dialogueId?: string;
  nodeId?: string;
}

type Pick = { index: number };

/** Ein Fotoplatz (links Gegenüber, rechts Spielfigur) mit zwei Ebenen für die 150-ms-Überblendung. */
class PhotoSlot {
  readonly el: HTMLElement;
  private layers: [HTMLImageElement, HTMLImageElement];
  private front = 0;
  url: string | null = null;
  speaker: string | null = null;

  constructor(side: 'left' | 'right') {
    this.layers = [h('img', { alt: '', draggable: 'false', decoding: 'async' }), h('img', { alt: '', draggable: 'false', decoding: 'async' })];
    this.el = h('div', { class: `dlg-photo ${side}`, hidden: true, 'aria-hidden': 'true', 'data-testid': `dialogue-photo-${side}` }, ...this.layers);
  }

  show(url: string, speaker: string, onMissing: () => void) {
    if (this.url === url) { this.el.hidden = false; return; }
    const newSpeaker = speaker !== this.speaker;
    this.url = url;
    this.speaker = speaker;
    const next = this.layers[this.el.hidden ? this.front : 1 - this.front];
    const prev = this.layers[next === this.layers[0] ? 1 : 0];
    next.onerror = () => { next.onerror = null; if (this.url === url) { this.hide(); onMissing(); } };
    next.onload = () => { next.classList.add('on'); prev.classList.remove('on'); };
    next.src = url;
    if (next.complete && next.naturalWidth > 0) { next.classList.add('on'); prev.classList.remove('on'); }
    this.front = this.layers.indexOf(next);
    this.el.hidden = false;
    if (newSpeaker) {
      this.el.classList.remove('enter');
      void this.el.offsetWidth;
      this.el.classList.add('enter');
    }
  }

  setActive(active: boolean) { this.el.classList.toggle('dim', !active); }

  hide() {
    this.el.hidden = true;
    this.url = null;
    this.speaker = null;
    for (const layer of this.layers) { layer.classList.remove('on'); layer.removeAttribute('src'); }
  }
}

/** Dialogkasten unten: Porträt, Name, Schreibmaschinentext, Auswahl; darüber die Dialogfotos. */
export class DialogueBox {
  readonly el: HTMLElement;
  private stage: HTMLElement;
  private photos: { left: PhotoSlot; right: PhotoSlot };
  private portraitBox: HTMLElement;
  private portraitImg: HTMLImageElement;
  private nameEl: HTMLElement;
  private textEl: HTMLElement;
  private choicesEl: HTMLOListElement;
  private tipEl: HTMLElement;
  private nextEl: HTMLButtonElement;
  /** Unsichtbare Ansage: jede Zeile genau einmal vollständig (der sichtbare Text tippt sich Zeichen für Zeichen). */
  private srLine: HTMLElement;
  private srTimer = 0;
  private typing = false;
  private fullText = '';
  private timer = 0;
  private advanceResolve: (() => void) | null = null;
  private pickResolve: ((pick: Pick) => void) | null = null;
  private finishResolve: (() => void) | null = null;
  private choiceViews: DialogueChoiceView[] = [];
  private activeChoice = 0;
  private popLayer: (() => void) | null = null;
  private snapshot: DialogueSnapshot | null = null;
  private lastTick = 0;
  private depth = 0;
  private missingPhotos = new Set<string>();

  constructor(
    private readonly shell: UiShell,
    private readonly catalog: AssetCatalog,
    private readonly campaign: CampaignPort,
    private readonly settings: SettingsStore,
    private readonly audio: AudioPort,
  ) {
    this.photos = { left: new PhotoSlot('left'), right: new PhotoSlot('right') };
    this.stage = h('div', { class: 'dlg-stage', hidden: true, 'aria-hidden': 'true' }, this.photos.left.el, this.photos.right.el);
    this.portraitImg = h('img', { alt: '', draggable: 'false' });
    this.portraitBox = h('div', { class: 'dlg-portrait' }, this.portraitImg);
    this.nameEl = h('div', { class: 'dlg-name', 'data-testid': 'dialogue-name' });
    this.textEl = h('div', { class: 'dlg-text', 'data-testid': 'dialogue-text' });
    this.srLine = h('div', { class: 'sr-only', 'aria-live': 'polite', 'aria-atomic': 'true', 'data-testid': 'dialogue-announce' });
    // Normale Liste mit Knöpfen: Pfeiltasten, Tab, Ziffern und Screenreader teilen sich dieselbe (fokussierte) Auswahl.
    this.choicesEl = h('ol', { class: 'dlg-choices', 'aria-label': 'Antwort wählen', 'data-testid': 'dialogue-choices' });
    this.tipEl = h('div', { class: 'dlg-tip', id: 'dlg-tip', hidden: true, 'data-testid': 'dialogue-tip' });
    this.nextEl = h('button', { class: 'dlg-next', type: 'button', 'aria-label': 'Weiter', onclick: () => this.advance() }, '▼ Weiter');
    this.el = h('section', { class: 'dialogue panel', role: 'dialog', 'aria-label': 'Dialog', 'data-testid': 'dialogue', hidden: true },
      this.portraitBox, h('div', { class: 'dlg-body' }, this.nameEl, this.textEl, this.choicesEl, this.tipEl, this.nextEl), this.srLine);
    this.el.addEventListener('click', (event) => {
      if ((event.target as HTMLElement).closest('button')) return;
      this.advance();
    });
    shell.frame.append(this.stage, this.el);
  }

  get active() { return this.depth > 0; }
  view(): DialogueSnapshot | null { return this.depth > 0 ? this.snapshot : null; }

  /** Manifest-URL des Dialogfotos `photo-<porträt>-<ausdruck>` (Rückfall `neutral`) oder null. */
  photoUrl(speaker: SpeakerId, expr: Expression): string | null {
    if (speaker === 'narrator') return null;
    const base = this.photoBase(speaker);
    if (!base) return null;
    for (const candidate of [`photo-${base}-${expr}`, `photo-${base}-neutral`]) {
      if (this.missingPhotos.has(candidate)) continue;
      const url = this.catalog.imageUrl(this.catalog.imageKey(candidate));
      if (url) return url;
    }
    return null;
  }

  private photoBase(speaker: SpeakerId): string | null {
    const content = this.campaign.content;
    if (speaker === 'player') {
      // Nur die fertige Figur (Vex) hat Fotos; die eigene Figur bleibt bildlos (Ich-Perspektive, design.md §3.1a).
      const player = this.campaign.state().player;
      const preset = player.preset ? content.presets?.[player.preset] : undefined;
      if (preset) return preset.portrait.replace(/^portrait-/, '');
      const look = content.looks[player.look];
      return look?.portrait ? look.portrait.replace(/^portrait-/, '') : null;
    }
    const npc = content.npcs[speaker];
    return npc ? npc.portrait.replace(/^portrait-/, '') : speaker;
  }

  toDisplay(line: DialogueLine, speakerName?: string, portrait?: string | null): DisplayLine {
    if (line.speaker === 'narrator') return { speakerId: 'narrator', narrator: true, speakerName: '', portrait: null, text: line.text, photo: null };
    const speaker = line.speaker;
    const expr = expressionOf(line);
    return {
      speakerId: speaker,
      narrator: false,
      speakerName: speakerName ?? this.campaign.displayName(speaker),
      portrait: portrait !== undefined ? portrait : this.campaign.portraitKey(speaker, line.portrait),
      text: line.text,
      photo: this.photoUrl(speaker, expr),
      expr,
    };
  }

  /** Kurze Textzeilen (Hotspot „Ansehen“) ohne Dialogsitzung. */
  async showLines(lines: readonly DialogueLine[]): Promise<void> {
    if (!lines.length) return;
    this.begin();
    try {
      for (const line of lines) {
        await this.showLine(this.toDisplay({ ...line, text: line.text.replace(/\{name\}/g, this.campaign.state().player.name) }));
        await this.waitAdvance();
      }
    } finally {
      this.end();
    }
  }

  async runSession(session: DialogueSession, hooks: DialogueHooks): Promise<void> {
    this.begin();
    let shownMessages = 0;
    const flushMessages = () => {
      try {
        const messages = session.outcome().messages;
        if (messages.length > shownMessages) hooks.onMessages(messages.slice(shownMessages));
        shownMessages = messages.length;
      } catch { /* Sitzung ohne Ausgabe */ }
    };
    try {
      let view: DialogueView = session.view();
      let lastKey = '';
      let guard = 0;
      while (!view.done && guard++ < 2000) {
        const key = view.line ? `${view.nodeId}|${view.line.speaker}|${view.line.text}` : '';
        if (view.line && key !== lastKey) {
          lastKey = key;
          await this.showLine(this.toDisplay(view.line, view.speakerName || undefined, view.portrait), view);
          if (!view.choices?.length) {
            await this.waitAdvance();
            view = session.advance();
            flushMessages();
            continue;
          }
        }
        if (view.choices?.length) {
          const pick = await this.pickChoice(view.choices, view);
          if (pick.index < 0) break; // Notausgang: keine Wahl wählbar, Esc beendet das Gespräch
          const result = session.choose(pick.index);
          lastKey = '';
          if (result.check) hooks.onCheck?.(result.check);
          flushMessages();
          view = result.view;
          continue;
        }
        if (!view.line) {
          view = session.advance();
          flushMessages();
          continue;
        }
        // Gleiche Zeile ohne Wahl: weiterschalten
        await this.waitAdvance();
        view = session.advance();
        flushMessages();
      }
      flushMessages();
    } finally {
      this.end();
    }
  }

  /** E/Enter/Klick: erst vervollständigen, dann weiter. */
  advance(): boolean {
    if (!this.active) return false;
    if (this.typing) { this.finishTyping(); return true; }
    if (this.advanceResolve) {
      const resolve = this.advanceResolve;
      this.advanceResolve = null;
      resolve();
      return true;
    }
    if (this.pickResolve && this.choiceViews.length) {
      const choice = this.choiceViews[this.activeChoice] ?? this.choiceViews.find((entry) => entry.enabled);
      if (choice?.enabled) this.pick(choice.index);
      return true;
    }
    return false;
  }

  /** Programmatische Wahl (Test-Hook): Index der Wahl; gesperrte Wahlen werden abgelehnt. */
  choose(index: number): boolean {
    if (this.typing) this.finishTyping();
    if (!this.pickResolve) return false;
    const choice = this.choiceViews.find((entry) => entry.index === index) ?? this.choiceViews[index];
    if (!choice?.enabled) return false;
    this.pick(choice.index);
    return true;
  }

  private begin() {
    this.depth++;
    if (this.depth > 1) return;
    this.el.hidden = false;
    document.documentElement.dataset.dialogue = 'true';
    this.popLayer = this.shell.input.push('dialogue', (event) => this.handle(event), { modal: true });
  }

  private end() {
    this.depth = Math.max(0, this.depth - 1);
    if (this.depth > 0) return;
    this.stopTyping();
    this.el.hidden = true;
    this.stage.hidden = true;
    this.photos.left.hide();
    this.photos.right.hide();
    this.el.classList.remove('has-photo');
    delete document.documentElement.dataset.dialogue;
    window.clearTimeout(this.srTimer);
    this.srLine.textContent = '';
    this.snapshot = null;
    this.advanceResolve = null;
    this.pickResolve = null;
    this.choiceViews = [];
    clear(this.choicesEl);
    this.tipEl.hidden = true;
    this.popLayer?.();
    this.popLayer = null;
  }

  private handle(event: IntentEvent): boolean {
    const intent = event.intent;
    if (intent.type === 'interact') { this.advance(); return true; }
    if (intent.type === 'nav' && this.pickResolve) {
      const delta = intent.dir === 'up' || intent.dir === 'left' ? -1 : 1;
      this.setActive((this.activeChoice + delta + this.choiceViews.length) % this.choiceViews.length);
      return true;
    }
    if (intent.type === 'cancel' && this.pickResolve && !this.choiceViews.some((choice) => choice.enabled)) {
      const resolve = this.pickResolve;
      this.pickResolve = null;
      resolve({ index: -1 });
      return true;
    }
    if (intent.type === 'digit' && this.pickResolve) {
      const choice = this.choiceViews[intent.value - 1];
      if (choice?.enabled) this.pick(choice.index);
      return true;
    }
    return true; // Dialog ist modal
  }

  /** Fotos: Gegenüber links, Spielfigur rechts; aktiver Sprecher hell, der andere abgedunkelt. */
  private showPhoto(line: DisplayLine) {
    if (line.narrator) {
      this.photos.left.setActive(false);
      this.photos.right.setActive(false);
      this.syncPhotoState();
      return;
    }
    const side = line.speakerId === 'player' ? 'right' : 'left';
    const other = side === 'left' ? 'right' : 'left';
    const slot = this.photos[side];
    if (line.photo) {
      slot.show(line.photo, line.speakerId, () => {
        // Datei fehlt trotz Manifest: nicht erneut versuchen, gemaltes Porträt zeigen.
        this.missingPhotos.add(line.photo ?? '');
        this.syncPhotoState();
      });
      slot.setActive(true);
    } else if (slot.speaker !== null) {
      slot.hide();
    }
    this.photos[other].setActive(false);
    this.syncPhotoState();
  }

  private syncPhotoState() {
    const { left, right } = this.photos;
    this.stage.hidden = left.el.hidden && right.el.hidden;
    // Steht das Foto des aktuellen Sprechers, braucht die Box kein kleines Porträt.
    const lit = (slot: PhotoSlot) => !slot.el.hidden && !slot.el.classList.contains('dim');
    this.el.classList.toggle('has-photo', lit(left) || lit(right));
  }

  private showLine(line: DisplayLine, view?: DialogueView): Promise<void> {
    clear(this.choicesEl);
    this.choiceViews = [];
    this.tipEl.hidden = true;
    this.nameEl.textContent = line.speakerName;
    this.nameEl.dataset.speaker = line.speakerId === 'player' ? 'player' : 'npc';
    // Namensschild der Spielfigur in ihrer Kennfarbe (colorA).
    if (line.speakerId === 'player') this.nameEl.style.setProperty('--player-color', playerAccent(this.campaign.content, this.campaign.state().player));
    else this.nameEl.style.removeProperty('--player-color');
    this.textEl.classList.toggle('narration', line.narrator);
    this.el.classList.toggle('narrator', line.narrator);
    // Spielfigur ohne Porträt: nur der Name (kein Bild).
    if (line.narrator || (line.speakerId === 'player' && !line.portrait)) this.portraitBox.hidden = true;
    else {
      this.portraitBox.hidden = false;
      setPortrait(this.portraitImg, this.catalog, line.portrait, line.speakerName || '?');
      this.portraitImg.alt = line.speakerName;
    }
    this.snapshot = { speaker: line.speakerName || 'Erzähler', text: line.text, typing: true, choices: null, dialogueId: view?.dialogueId, nodeId: view?.nodeId };
    this.showPhoto(line);
    this.announce(line.narrator ? line.text : `${line.speakerName}: ${line.text}`);
    return this.type(line.text);
  }

  /** Leeren und im nächsten Takt setzen, damit auch zwei gleiche Zeilen nacheinander angesagt werden. */
  private announce(text: string) {
    window.clearTimeout(this.srTimer);
    this.srLine.textContent = '';
    this.srTimer = window.setTimeout(() => { this.srLine.textContent = text; }, 30);
  }

  private type(text: string): Promise<void> {
    this.stopTyping();
    this.fullText = text;
    this.nextEl.hidden = true;
    const cps = this.settings.get().reducedMotion ? Infinity : TEXT_SPEED_CPS[this.settings.get().textSpeed];
    if (!Number.isFinite(cps)) {
      this.textEl.textContent = text;
      this.typing = false;
      this.afterTyping();
      return Promise.resolve();
    }
    this.typing = true;
    let shown = 0;
    this.textEl.textContent = '';
    return new Promise((resolve) => {
      const step = () => {
        if (!this.typing) { resolve(); return; }
        shown = Math.min(text.length, shown + Math.max(1, Math.round(cps / 30)));
        this.textEl.textContent = text.slice(0, shown);
        const now = performance.now();
        if (now - this.lastTick > 90 && /\S/.test(text[shown - 1] ?? '')) { this.lastTick = now; this.audio.sfx('talk'); }
        if (shown >= text.length) { this.typing = false; this.afterTyping(); resolve(); return; }
        this.timer = window.setTimeout(step, 1000 / 30);
      };
      this.finishResolve = resolve;
      step();
    });
  }

  private finishTyping() {
    if (!this.typing) return;
    this.stopTyping();
    this.textEl.textContent = this.fullText;
    this.afterTyping();
    const resolve = this.finishResolve;
    this.finishResolve = null;
    resolve?.();
  }

  private stopTyping() {
    this.typing = false;
    window.clearTimeout(this.timer);
  }

  private afterTyping() {
    if (this.snapshot) this.snapshot.typing = false;
  }

  private waitAdvance(): Promise<void> {
    this.nextEl.hidden = false;
    return new Promise((resolve) => {
      this.advanceResolve = () => { this.nextEl.hidden = true; resolve(); };
    });
  }

  private pickChoice(choices: DialogueChoiceView[], view: DialogueView): Promise<Pick> {
    this.nextEl.hidden = true;
    this.choiceViews = choices;
    clear(this.choicesEl);
    choices.forEach((choice, position) => {
      // Check-Wahl: „[Technik 6]“ in Attributfarbe; nicht erfüllt → ausgegraut mit „Dir fehlen 2 Punkte“.
      const prefix = choice.check
        ? h('span', { class: `check-tag${choice.check.ok ? ' ok' : ''}`, 'data-attr': choice.check.attribute }, choice.check.label)
        : choice.tag ? h('span', { class: 'check-tag tag' }, choice.tag) : null;
      const reasonText = !choice.enabled ? (choice.check ? checkReason(choice.check) : '') || choice.reason || 'Nicht verfügbar.' : '';
      const tooltip = choice.check ? checkTooltip(choice.check) : choice.reason ?? '';
      const button = h('button', {
        type: 'button', class: `choice${choice.check ? ' has-check' : ''}`, 'data-choice': choice.index, 'aria-disabled': String(!choice.enabled),
        title: tooltip, 'aria-describedby': tooltip ? 'dlg-tip' : null,
        onclick: () => { if (choice.enabled) this.pick(choice.index); },
        onpointerenter: () => this.setActive(position, false), onfocus: () => this.setActive(position, false),
      }, h('span', { class: 'num' }, `${position + 1}.`), prefix, h('span', { class: 'choice-text' }, choice.text),
      reasonText ? h('span', { class: 'reason' }, reasonText) : null);
      this.choicesEl.append(h('li', null, button));
    });
    if (this.snapshot) {
      this.snapshot.choices = choices.map((choice) => ({ index: choice.index, text: choice.text, check: choice.check?.checkId, enabled: choice.enabled }));
      this.snapshot.typing = false;
      this.snapshot.dialogueId = view.dialogueId;
      this.snapshot.nodeId = view.nodeId;
    }
    this.setActive(Math.max(0, choices.findIndex((choice) => choice.enabled)));
    return new Promise((resolve) => { this.pickResolve = resolve; });
  }

  /** Aktive Antwort = fokussierte Antwort (Pfeile, Tab, Hover und E/Enter wirken auf dieselbe). */
  private setActive(position: number, focus = true) {
    this.activeChoice = position;
    [...this.choicesEl.querySelectorAll('button')].forEach((button, index) => {
      button.classList.toggle('active', index === position);
      if (index !== position) return;
      if (focus && document.activeElement !== button) button.focus({ preventScroll: true });
      button.scrollIntoView?.({ block: 'nearest' });
    });
    // Aufschlüsselung der aktiven Check-Wahl sichtbar (auch für Touch und Tastatur, wo es keinen Tooltip gibt).
    const check = this.choiceViews[position]?.check;
    this.tipEl.hidden = !check;
    if (check) {
      this.tipEl.textContent = checkTooltip(check);
      this.tipEl.dataset.ok = String(check.ok);
    }
  }

  private pick(index: number) {
    const resolve = this.pickResolve;
    if (!resolve) return;
    this.pickResolve = null;
    this.choiceViews = [];
    clear(this.choicesEl);
    this.tipEl.hidden = true;
    if (this.snapshot) this.snapshot.choices = null;
    this.audio.sfx('page');
    resolve({ index });
  }
}
