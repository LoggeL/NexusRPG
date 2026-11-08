// Charakter-Baukasten als DOM-Editor (design.md §3.1a „Editor-UI“): große laufende/drehbare Vorschau, Reiter,
// Kacheln und Farbfelder, Zufall mit Schlössern, Vorlagen, Rückgängig/Wiederholen (50 Schritte), Zurücksetzen.
// Tastatur: Bild↑/↓ Reiter, ↑/↓ Zeile, ←/→ Option, Q/E drehen, R Zufall, Strg+Z/Strg+Y, Enter weiter (Esc zurück
// übernimmt das umgebende Modal). Fehlende Kunstteile werden ausgeblendet (Katalog).
import {
  APPEARANCE_CATEGORIES, BODY_IDS, CAP_IDS, CHAIN_PART, CYBER_PARTS, FACE_IDS, GLASSES_IDS, HAIR_COLOR_IDS, HAIR_IDS, HEADPHONES_PART,
  JACKET_IDS, LEG_IDS, MASK_IDS, PALETTE_IDS, PANTS_IDS, SHOE_IDS, SKIN_IDS, TATTOO_IDS, TOP_IDS,
  appearanceTemplates, applyPatch, capPart, cloneAppearance, conflictHint, glassesPart, legPart, maskPart, randomAppearance, softHints,
  type AppearanceCategory, type AppearancePatch,
} from '../../modules/appearance';
import type { GameContent, LookId, PlayerAppearance, PlayerCyberLook } from '../../modules/contracts';
import { partAvailable, type CreatorCatalog } from '../appearance/compose';
import { FigurePreview } from '../appearance/preview';
import { clear, h } from './dom';

const TAB_LABEL: Record<AppearanceCategory, string> = {
  koerper: 'Körper', haare: 'Haare', oberteil: 'Oberteil', jacke: 'Jacke', hose: 'Hose', schuhe: 'Schuhe',
  farben: 'Farben', cyber: 'Cyberware', extras: 'Extras',
};

interface Option { id: string; label: string; swatch?: string; part?: string | null }
interface Row {
  id: string;
  label: string;
  kind: 'tiles' | 'swatches';
  options: Option[];
  current(a: PlayerAppearance): string;
  patch(id: string): AppearancePatch;
}

const HISTORY_MAX = 50;

export interface CreatorOptions {
  content: GameContent;
  catalog: CreatorCatalog | null;
  initial: PlayerAppearance;
  look: LookId;
  reducedMotion: boolean;
  /** Enter / „Weiter“. */
  onNext(): void;
  /** Ist der Editor gerade oben (kein anderes Modal darüber)? */
  isActive(): boolean;
  random?: () => number;
}

export interface CreatorHandle {
  readonly el: HTMLElement;
  appearance(): PlayerAppearance;
  look(): LookId;
  focus(): void;
  destroy(): void;
}

export function mountCreator(options: CreatorOptions): CreatorHandle {
  const { content, catalog } = options;
  const names = content.appearance?.names ?? {};
  const name = (id: string) => names[id] ?? id;
  const available = (part: string | null | undefined) => part === null || part === undefined || partAvailable(catalog, part);
  const random = options.random ?? Math.random;

  let current = cloneAppearance(options.initial);
  let look = options.look;
  const initial = cloneAppearance(options.initial);
  const initialLook = options.look;
  const undo: { a: PlayerAppearance; look: LookId }[] = [];
  const redo: { a: PlayerAppearance; look: LookId }[] = [];
  const locks = new Set<AppearanceCategory>();
  let tab: AppearanceCategory = 'koerper';
  let showTemplates = false;

  // ------------------------------------------------------------ Zeilen je Reiter
  const swatchOf = (table: Record<string, { name: string; mid: string }> | undefined, id: string): Option =>
    ({ id, label: table?.[id]?.name ?? id, swatch: table?.[id]?.mid ?? '#888' });
  const tiles = (ids: readonly string[], part: (id: string) => string | null = (id) => id): Option[] =>
    ids.map((id) => ({ id, label: name(id), part: part(id) }));
  const toggle = (part: string): Option[] => [{ id: 'aus', label: 'Ohne', part: null }, { id: 'an', label: 'Mit', part }];
  const cyberRow = (key: 'armL' | 'armR' | 'eyes' | 'facePlate' | 'neckCable'): Row => ({
    id: `cyber-${key}`, label: name(CYBER_PARTS[key]), kind: 'tiles', options: toggle(CYBER_PARTS[key]),
    current: (a) => (a.cyber[key] ? 'an' : 'aus'),
    patch: (id) => ({ cyber: { [key]: id === 'an' } as Partial<PlayerCyberLook> }),
  });
  const palette = content.appearance?.palette;
  const ROWS: Record<AppearanceCategory, Row[]> = {
    koerper: [
      { id: 'body', label: 'Körperbau', kind: 'tiles', options: tiles(BODY_IDS, () => null), current: (a) => a.body, patch: (id) => ({ body: id as PlayerAppearance['body'] }) },
      { id: 'skin', label: 'Hautton', kind: 'swatches', options: SKIN_IDS.map((id) => swatchOf(content.appearance?.skin, id)), current: (a) => a.skin, patch: (id) => ({ skin: id }) },
      { id: 'face', label: 'Gesicht', kind: 'tiles', options: tiles(FACE_IDS), current: (a) => a.face, patch: (id) => ({ face: id }) },
    ],
    haare: [
      { id: 'hair', label: 'Frisur', kind: 'tiles', options: tiles(HAIR_IDS), current: (a) => a.hair, patch: (id) => ({ hair: id }) },
      { id: 'hairColor', label: 'Haarfarbe', kind: 'swatches', options: HAIR_COLOR_IDS.map((id) => swatchOf(content.appearance?.hairColors, id)), current: (a) => a.hairColor, patch: (id) => ({ hairColor: id }) },
    ],
    oberteil: [{ id: 'top', label: 'Oberteil', kind: 'tiles', options: tiles(TOP_IDS), current: (a) => a.top, patch: (id) => ({ top: id }) }],
    jacke: [{ id: 'jacket', label: 'Jacke', kind: 'tiles', options: tiles(JACKET_IDS), current: (a) => a.jacket, patch: (id) => ({ jacket: id }) }],
    hose: [{ id: 'pants', label: 'Hose', kind: 'tiles', options: tiles(PANTS_IDS), current: (a) => a.pants, patch: (id) => ({ pants: id }) }],
    schuhe: [{ id: 'shoes', label: 'Schuhe', kind: 'tiles', options: tiles(SHOE_IDS), current: (a) => a.shoes, patch: (id) => ({ shoes: id }) }],
    farben: [
      { id: 'colorA', label: 'Hauptfarbe', kind: 'swatches', options: PALETTE_IDS.map((id) => swatchOf(palette, id)), current: (a) => a.colorA, patch: (id) => ({ colorA: id }) },
      { id: 'colorB', label: 'Zweitfarbe', kind: 'swatches', options: PALETTE_IDS.map((id) => swatchOf(palette, id)), current: (a) => a.colorB, patch: (id) => ({ colorB: id }) },
    ],
    cyber: [
      cyberRow('armL'), cyberRow('armR'), cyberRow('eyes'), cyberRow('facePlate'), cyberRow('neckCable'),
      { id: 'leg', label: 'Cyber-Bein', kind: 'tiles', options: tiles(LEG_IDS.map((id) => `cyber-bein-${id}`), (id) => legPart(id.replace('cyber-bein-', '') as PlayerCyberLook['leg'])), current: (a) => `cyber-bein-${a.cyber.leg}`, patch: (id) => ({ cyber: { leg: id.replace('cyber-bein-', '') as PlayerCyberLook['leg'] } }) },
      { id: 'glow', label: 'Leuchtfarbe', kind: 'swatches', options: PALETTE_IDS.map((id) => swatchOf(palette, id)), current: (a) => a.cyber.glow, patch: (id) => ({ cyber: { glow: id } }) },
    ],
    extras: [
      { id: 'tattoo', label: 'Tattoo', kind: 'tiles', options: tiles(TATTOO_IDS, (id) => (id === 'tattoo-keins' ? null : id)), current: (a) => a.tattoo, patch: (id) => ({ tattoo: id }) },
      { id: 'glasses', label: 'Brille', kind: 'tiles', options: tiles(GLASSES_IDS.map((id) => `brille-${id}`), (id) => glassesPart(id.slice(7) as PlayerAppearance['acc']['glasses'])), current: (a) => `brille-${a.acc.glasses}`, patch: (id) => ({ acc: { glasses: id.slice(7) as PlayerAppearance['acc']['glasses'] } }) },
      { id: 'mask', label: 'Maske', kind: 'tiles', options: tiles(MASK_IDS.map((id) => `maske-${id}`), (id) => maskPart(id.slice(6) as PlayerAppearance['acc']['mask'])), current: (a) => `maske-${a.acc.mask}`, patch: (id) => ({ acc: { mask: id.slice(6) as PlayerAppearance['acc']['mask'] } }) },
      { id: 'cap', label: 'Kappe', kind: 'tiles', options: tiles(CAP_IDS.map((id) => `kappe-${id}`), (id) => capPart(id.slice(6) as PlayerAppearance['acc']['cap'])), current: (a) => `kappe-${a.acc.cap}`, patch: (id) => ({ acc: { cap: id.slice(6) as PlayerAppearance['acc']['cap'] } }) },
      { id: 'chain', label: name(CHAIN_PART), kind: 'tiles', options: toggle(CHAIN_PART), current: (a) => (a.acc.chain ? 'an' : 'aus'), patch: (id) => ({ acc: { chain: id === 'an' } }) },
      { id: 'headphones', label: name(HEADPHONES_PART), kind: 'tiles', options: toggle(HEADPHONES_PART), current: (a) => (a.acc.headphones ? 'an' : 'aus'), patch: (id) => ({ acc: { headphones: id === 'an' } }) },
    ],
  };
  /** Nur Optionen mit Grafik; Zeilen mit weniger als zwei Optionen entfallen. */
  const visibleRows = (category: AppearanceCategory): Row[] =>
    ROWS[category]
      .map((row) => ({ ...row, options: row.options.filter((option) => available(option.part)) }))
      .filter((row) => row.options.length > 1);
  const tabs = APPEARANCE_CATEGORIES.filter((category) => visibleRows(category).length > 0);

  // ------------------------------------------------------------ Gerüst
  const preview = new FigurePreview({ catalog, texts: content.appearance, scale: 3, reducedMotion: options.reducedMotion });
  const status = h('div', { class: 'status-line creator-status', role: 'status', 'aria-live': 'polite', 'data-testid': 'creator-status' });
  const walkBtn = h('button', { class: 'btn small', type: 'button', 'data-testid': 'creator-walk', 'aria-pressed': String(preview.walking) });
  const turn = (delta: number) => { preview.turn(delta); syncWalk(); };
  const syncWalk = () => {
    walkBtn.textContent = preview.walking ? 'Stehen' : 'Laufen';
    walkBtn.setAttribute('aria-pressed', String(preview.walking));
  };
  walkBtn.addEventListener('click', () => { preview.setWalking(!preview.walking); if (preview.walking) preview.setCircling(true); syncWalk(); });
  syncWalk();
  const stage = h('div', { class: 'creator-stage', 'aria-label': 'Vorschau der Figur (ziehen zum Drehen)', role: 'img' }, preview.canvas, h('div', { class: 'creator-floor', 'aria-hidden': 'true' }));
  // Wischen/Ziehen dreht die Figur.
  let dragX: number | null = null;
  stage.addEventListener('pointerdown', (event) => { dragX = event.clientX; stage.setPointerCapture?.(event.pointerId); });
  stage.addEventListener('pointermove', (event) => {
    if (dragX === null) return;
    const dx = event.clientX - dragX;
    if (Math.abs(dx) >= 40) { turn(dx > 0 ? 1 : -1); dragX = event.clientX; }
  });
  const endDrag = () => { dragX = null; };
  stage.addEventListener('pointerup', endDrag);
  stage.addEventListener('pointercancel', endDrag);

  const undoBtn = h('button', { class: 'btn small', type: 'button', 'data-testid': 'creator-undo', title: 'Rückgängig (Strg+Z)', onclick: () => step(undo, redo) }, '↶ Rückgängig');
  const redoBtn = h('button', { class: 'btn small', type: 'button', 'data-testid': 'creator-redo', title: 'Wiederholen (Strg+Y)', onclick: () => step(redo, undo) }, '↷ Wiederholen');
  const randomBtn = h('button', { class: 'btn small', type: 'button', 'data-testid': 'creator-random', title: 'Zufall (R) – gesperrte Kategorien bleiben', onclick: () => randomize() }, '🎲 Zufall');
  const templatesBtn = h('button', { class: 'btn small', type: 'button', 'data-testid': 'creator-templates', 'aria-expanded': 'false', onclick: () => { showTemplates = !showTemplates; render(); } }, 'Vorlagen');
  const resetBtn = h('button', { class: 'btn small', type: 'button', 'data-testid': 'creator-reset', onclick: () => commit(cloneAppearance(initial), 'Zurückgesetzt.', initialLook) }, 'Zurücksetzen');

  const previewCol = h('section', { class: 'creator-preview', 'aria-label': 'Vorschau' },
    stage,
    h('div', { class: 'creator-turn' },
      h('button', { class: 'btn small', type: 'button', 'aria-label': 'Nach links drehen (Q)', title: 'Drehen (Q)', 'data-testid': 'creator-turn-left', onclick: () => turn(-1) }, '⟲'),
      walkBtn,
      h('button', { class: 'btn small', type: 'button', 'aria-label': 'Nach rechts drehen (E)', title: 'Drehen (E)', 'data-testid': 'creator-turn-right', onclick: () => turn(1) }, '⟳')),
    h('div', { class: 'creator-tools' }, randomBtn, templatesBtn, undoBtn, redoBtn, resetBtn),
    status);
  const tabBarEl = h('div', { class: 'tabs creator-tabs', role: 'tablist', 'aria-label': 'Kategorien' });
  const panel = h('div', { class: 'creator-panel', role: 'tabpanel' });
  const controls = h('section', { class: 'creator-controls', 'aria-label': 'Aussehen wählen' }, tabBarEl, panel);
  const el = h('div', { class: 'creator', 'data-testid': 'creator' }, previewCol, controls);

  // ------------------------------------------------------------ Zustand
  const say = (text: string) => { status.textContent = text; };
  const hintText = () => softHints(current).join(' ');

  function commit(next: PlayerAppearance, message?: string, nextLook: LookId = look) {
    undo.push({ a: current, look });
    if (undo.length > HISTORY_MAX) undo.shift();
    redo.length = 0;
    current = next;
    look = nextLook;
    preview.set(current);
    render();
    say([message, hintText()].filter(Boolean).join(' '));
  }

  function step(from: typeof undo, to: typeof undo) {
    const entry = from.pop();
    if (!entry) return;
    to.push({ a: current, look });
    current = entry.a;
    look = entry.look;
    preview.set(current);
    render();
    say(from === undo ? 'Rückgängig gemacht.' : 'Wiederholt.');
  }

  function choose(row: Row, option: Option) {
    if (row.current(current) === option.id) return;
    const { appearance, dropped } = applyPatch(current, row.patch(option.id));
    commit(appearance, dropped.length ? `${dropped.join(', ')}.` : `${row.label}: ${option.label}`);
  }

  function randomize() {
    const next = randomAppearance(random, current, locks, (part) => partAvailable(catalog, part));
    commit(next, locks.size ? `Zufall (festgehalten: ${[...locks].map((id) => TAB_LABEL[id]).join(', ')}).` : 'Zufall.');
  }

  // ------------------------------------------------------------ Darstellung
  const focusSelected = (rowIndex: number) => {
    const rowEl = panel.querySelectorAll<HTMLElement>('[data-row]')[rowIndex];
    (rowEl?.querySelector<HTMLElement>('[aria-checked="true"]') ?? rowEl?.querySelector<HTMLElement>('button'))?.focus({ preventScroll: false });
  };

  function renderTabs() {
    clear(tabBarEl);
    for (const id of tabs) {
      tabBarEl.append(h('button', {
        type: 'button', role: 'tab', 'aria-selected': String(id === tab && !showTemplates), tabindex: id === tab ? '0' : '-1', 'data-tab': id,
        onclick: () => { tab = id; showTemplates = false; render(); (tabBarEl.querySelector(`[data-tab="${id}"]`) as HTMLElement | null)?.focus(); },
      }, TAB_LABEL[id], locks.has(id) ? h('span', { class: 'lock-mark', 'aria-label': ' (festgehalten)' }, ' 🔒') : null));
    }
  }

  function renderTemplates() {
    const list = h('div', { class: 'creator-options tiles', role: 'radiogroup', 'aria-label': 'Vorlagen', 'data-row': 'templates' });
    for (const template of appearanceTemplates(content)) {
      list.append(h('button', {
        class: 'creator-tile', type: 'button', role: 'radio', 'aria-checked': String(template.id === look), 'data-option': template.id,
        onclick: () => { showTemplates = false; commit(cloneAppearance(template.appearance), `Vorlage: ${template.name}`, template.id); },
      }, template.name));
    }
    panel.append(h('div', { class: 'creator-row' }, h('h4', null, 'Vorlagen'), h('p', { class: 'meta' }, 'Startpunkte – jede Wahl bleibt änderbar.'), list));
  }

  function renderPanel() {
    clear(panel);
    templatesBtn.setAttribute('aria-expanded', String(showTemplates));
    if (showTemplates) { renderTemplates(); return; }
    const locked = locks.has(tab);
    panel.append(h('div', { class: 'creator-panel-head' },
      h('button', {
        class: `btn small lock${locked ? ' on' : ''}`, type: 'button', 'aria-pressed': String(locked), 'data-testid': `creator-lock-${tab}`,
        title: 'Beim Zufall festhalten',
        onclick: () => { if (locks.has(tab)) locks.delete(tab); else locks.add(tab); render(); (panel.querySelector('.lock') as HTMLElement | null)?.focus(); },
      }, locked ? '🔒 Festgehalten' : '🔓 Beim Zufall festhalten')));
    visibleRows(tab).forEach((row) => {
      const selected = row.current(current);
      const group = h('div', { class: `creator-options ${row.kind}`, role: 'radiogroup', 'aria-label': row.label, 'data-row': row.id });
      for (const option of row.options) {
        const hint = conflictHint(current, row.patch(option.id));
        const isSelected = option.id === selected;
        const attrs = {
          type: 'button', role: 'radio', 'aria-checked': String(isSelected), tabindex: isSelected ? '0' : '-1', 'data-option': option.id,
          title: hint ?? option.label, 'aria-label': hint ? `${option.label} – ${hint}` : option.label,
          onclick: () => choose(row, option),
        };
        group.append(row.kind === 'swatches'
          ? h('button', { ...attrs, class: `creator-swatch${hint ? ' blocked' : ''}`, style: `--swatch:${option.swatch}` })
          : h('button', { ...attrs, class: `creator-tile${hint ? ' blocked' : ''}` }, option.label));
      }
      if (!group.querySelector('[tabindex="0"]')) group.querySelector('button')?.setAttribute('tabindex', '0');
      const chosen = row.options.find((option) => option.id === selected);
      panel.append(h('div', { class: 'creator-row' }, h('h4', null, row.label, row.kind === 'swatches' && chosen ? h('span', { class: 'meta' }, ` · ${chosen.label}`) : null), group));
    });
  }

  function render() {
    const active = document.activeElement as HTMLElement | null;
    const focus = active && el.contains(active)
      ? { tab: active.dataset.tab, row: active.closest<HTMLElement>('[data-row]')?.dataset.row, option: active.dataset.option, testid: active.dataset.testid }
      : null;
    renderTabs();
    renderPanel();
    undoBtn.disabled = undo.length === 0;
    redoBtn.disabled = redo.length === 0;
    if (focus) {
      const target = focus.tab ? tabBarEl.querySelector<HTMLElement>(`[data-tab="${focus.tab}"]`)
        : focus.row && focus.option ? panel.querySelector<HTMLElement>(`[data-row="${focus.row}"] [data-option="${CSS.escape(focus.option)}"]`)
          : focus.testid ? el.querySelector<HTMLElement>(`[data-testid="${focus.testid}"]`) : null;
      (target && !(target as HTMLButtonElement).disabled ? target : null)?.focus({ preventScroll: true });
    }
  }

  // ------------------------------------------------------------ Tastatur
  const rowIndexOfFocus = (): number => {
    const rows = [...panel.querySelectorAll<HTMLElement>('[data-row]')];
    const active = document.activeElement as HTMLElement | null;
    return active ? rows.findIndex((row) => row.contains(active)) : -1;
  };

  const moveOption = (delta: number) => {
    const rows = [...panel.querySelectorAll<HTMLElement>('[data-row]')];
    let index = rowIndexOfFocus();
    if (index < 0) { focusSelected(0); return; }
    const buttons = [...rows[index].querySelectorAll<HTMLButtonElement>('button')];
    const at = buttons.indexOf(document.activeElement as HTMLButtonElement);
    const next = buttons[(at + delta + buttons.length) % buttons.length];
    next?.click();
    index = rowIndexOfFocus();
    requestAnimationFrame(() => {
      const row = panel.querySelectorAll<HTMLElement>('[data-row]')[index < 0 ? 0 : index];
      (row?.querySelector<HTMLElement>(`[data-option="${CSS.escape(next?.dataset.option ?? '')}"]`))?.focus();
    });
  };

  const moveRow = (delta: number) => {
    const rows = panel.querySelectorAll<HTMLElement>('[data-row]');
    if (!rows.length) return;
    const index = rowIndexOfFocus();
    focusSelected(index < 0 ? 0 : (index + delta + rows.length) % rows.length);
  };

  const switchTab = (delta: number) => {
    const index = tabs.indexOf(tab);
    tab = tabs[(index + delta + tabs.length) % tabs.length];
    showTemplates = false;
    render();
    focusSelected(0);
  };

  const onKey = (event: KeyboardEvent) => {
    // Der Eingabe-Router verhindert bei Pfeilen/E/Q/R bereits den Standard; die Absichten schluckt das Modal.
    if (!options.isActive()) return;
    const target = event.target as HTMLElement | null;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;
    const mod = event.ctrlKey || event.metaKey;
    if (mod && (event.code === 'KeyZ' || event.code === 'KeyY')) {
      event.preventDefault();
      if (event.code === 'KeyY' || event.shiftKey) step(redo, undo); else step(undo, redo);
      return;
    }
    if (mod || event.altKey) return;
    switch (event.code) {
      case 'PageUp': event.preventDefault(); switchTab(-1); return;
      case 'PageDown': event.preventDefault(); switchTab(1); return;
      case 'ArrowUp': case 'KeyW': event.preventDefault(); moveRow(-1); return;
      case 'ArrowDown': case 'KeyS': event.preventDefault(); moveRow(1); return;
      case 'ArrowLeft': case 'KeyA':
        event.preventDefault();
        if (target?.getAttribute('role') === 'tab') switchTab(-1); else moveOption(-1);
        return;
      case 'ArrowRight': case 'KeyD':
        event.preventDefault();
        if (target?.getAttribute('role') === 'tab') switchTab(1); else moveOption(1);
        return;
      case 'KeyQ': event.preventDefault(); turn(-1); return;
      case 'KeyE': event.preventDefault(); turn(1); return;
      case 'KeyR': event.preventDefault(); randomize(); return;
      case 'Enter': case 'NumpadEnter': {
        // Auf Werkzeugknöpfen löst Enter den Knopf aus, sonst geht es weiter.
        const tool = target?.closest('.creator-tools, .creator-turn, .creator-panel-head, .modal-foot');
        if (tool) return;
        event.preventDefault();
        options.onNext();
        return;
      }
      default:
    }
  };
  window.addEventListener('keydown', onKey);

  preview.set(current);
  render();
  say(hintText());

  return {
    el,
    appearance: () => cloneAppearance(current),
    look: () => look,
    focus: () => focusSelected(0),
    destroy: () => { window.removeEventListener('keydown', onKey); preview.destroy(); },
  };
}
