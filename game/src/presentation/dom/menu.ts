// Einstellungen und Spielmenü (Esc) der DOM-Oberfläche (Bereich dom-ui).
import { TEXT_SCALE_LABEL, TEXT_SCALES, TEXT_SPEED_LABEL, type SettingsStore, type TextScale, type TextSpeed } from '../../platform/settings';
import { append, h } from './dom';
import { Modal, type UiShell } from './shell';

/** Segmentierte Auswahl (role=radiogroup) mit Pfeiltasten über den Modal-Fokus. */
function segmented<T extends string | number>(label: string, options: readonly T[], text: (value: T) => string, current: () => T, pick: (value: T) => void): HTMLElement {
  const group = h('div', { class: 'seg', role: 'radiogroup', 'aria-label': label });
  const render = () => {
    group.replaceChildren(...options.map((value) => h('button', {
      type: 'button', class: 'btn small', role: 'radio', 'aria-checked': String(current() === value), 'data-value': String(value),
      onclick: () => { pick(value); render(); (group.querySelector(`[data-value="${CSS.escape(String(value))}"]`) as HTMLElement | null)?.focus(); },
    }, text(value))));
  };
  render();
  return group;
}

/** Einstellungen: Musik, Effekte, Stimmen, reduzierte Bewegung, Textgeschwindigkeit, Textgröße (persistiert). */
export function openSettings(shell: UiShell, settings: SettingsStore): Modal {
  const modal = new Modal(shell, { name: 'settings', title: 'Einstellungen', size: 'narrow' });
  const current = settings.get();
  const slider = (id: string, label: string, value: number, onInput: (value: number) => void) => {
    const output = h('output', { for: id }, `${Math.round(value * 100)} %`);
    const input = h('input', { id, type: 'range', min: '0', max: '100', step: '5', value: String(Math.round(value * 100)), 'aria-valuetext': `${Math.round(value * 100)} Prozent` });
    input.addEventListener('input', () => {
      const next = Number(input.value) / 100;
      output.textContent = `${input.value} %`;
      input.setAttribute('aria-valuetext', `${input.value} Prozent`);
      onInput(next);
    });
    return [h('label', { for: id }, label), h('div', { class: 'range-row' }, input, output)];
  };
  const motion = h('input', { id: 'set-motion', type: 'checkbox', 'data-testid': 'settings-motion' });
  motion.checked = current.reducedMotion;
  motion.addEventListener('change', () => settings.update({ reducedMotion: motion.checked }));
  const speeds = segmented<TextSpeed>('Textgeschwindigkeit', Object.keys(TEXT_SPEED_LABEL) as TextSpeed[], (speed) => TEXT_SPEED_LABEL[speed],
    () => settings.get().textSpeed, (textSpeed) => settings.update({ textSpeed }));
  const scales = segmented<TextScale>('Textgröße', TEXT_SCALES, (scale) => TEXT_SCALE_LABEL[String(scale)] ?? String(scale),
    () => settings.get().textScale, (textScale) => { settings.update({ textScale }); shell.setTextScale(textScale); });
  modal.body.append(h('div', { class: 'settings-form' },
    ...slider('set-music', 'Musik', current.music, (music) => settings.update({ music })),
    ...slider('set-sfx', 'Effekte', current.sfx, (sfx) => settings.update({ sfx })),
    ...slider('set-voices', 'Stimmen', current.voices, (voices) => settings.update({ voices })),
    h('label', { for: 'set-motion' }, 'Reduzierte Bewegung'),
    h('div', { class: 'check-row' }, motion, h('span', { class: 'meta' }, 'keine Kamerafahrten und Blitze, Text sofort')),
    h('span', { class: 'label' }, 'Textgeschwindigkeit'), speeds,
    h('span', { class: 'label' }, 'Textgröße'), scales));
  modal.foot.append(h('button', { class: 'btn primary', type: 'button', 'data-testid': 'settings-done', onclick: () => modal.close() }, 'Fertig'));
  return modal;
}

export interface MenuActions {
  exportSave(): void;
  importSave(): Promise<{ ok: boolean; message: string }>;
  settings(): void;
  toTitle(): void;
  newGame(): void;
  /** Speicherplätze: Speichern (Kopie des laufenden Stands). */
  saveSlots?(): void;
  /** Speicherplätze: Laden. */
  loadSlots?(): void;
  /** Galerie gesehener Schlüsselszenen. */
  gallery?(): void;
}

/** Spielmenü (Esc). */
export function openMenu(shell: UiShell, actions: MenuActions): Modal {
  const modal = new Modal(shell, { name: 'menu', title: 'Menü', size: 'narrow' });
  const status = h('div', { class: 'status-line', role: 'status', 'aria-live': 'polite', 'data-testid': 'menu-status' });
  const say = (text: string, ok = true) => { status.className = `status-line${ok ? '' : ' bad'}`; status.textContent = text; };
  const item = (label: string, testid: string, action: () => void, primary = false) =>
    h('button', { class: `btn ${primary ? 'primary' : ''}`, type: 'button', 'data-testid': testid, onclick: action }, label);
  const list = h('div', { class: 'menu-list' });
  append(list, [
    item('Fortsetzen', 'menu-resume', () => modal.close(), true),
    actions.saveSlots ? item('Speichern', 'menu-save', () => actions.saveSlots?.()) : null,
    actions.loadSlots ? item('Laden', 'menu-load', () => actions.loadSlots?.()) : null,
    actions.gallery ? item('Galerie', 'menu-gallery', () => actions.gallery?.()) : null,
    item('Spielstand exportieren', 'menu-export', () => { actions.exportSave(); say('Spielstand als Datei gespeichert.'); }),
    item('Spielstand importieren', 'menu-import', async () => {
      const result = await actions.importSave();
      say(result.message, result.ok);
      if (result.ok) modal.close();
    }),
    item('Einstellungen', 'menu-settings', () => actions.settings()),
    item('Zum Titel', 'menu-title', () => { modal.close(); actions.toTitle(); }),
    item('Neues Spiel', 'menu-new', async () => {
      const ok = await shell.confirm('Neues Spiel', 'Wirklich neu beginnen? Der laufende Fortschritt wird überschrieben. Speicherplätze bleiben erhalten.', 'Neu beginnen', 'Abbrechen');
      if (ok) { modal.close(); actions.newGame(); }
    }),
  ]);
  modal.body.append(list, status);
  return modal;
}
