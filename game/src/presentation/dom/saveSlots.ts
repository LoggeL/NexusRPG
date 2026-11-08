// Drei Speicherplätze (Bereich dom-ui). Der Autosave bleibt die laufende Partie; Plätze sind Kopien davon.
// Speichern = exportSave() in einen Platz, Laden = importSave(raw). Ablage in platform/storage (createSaveSlots).
import type { SaveSlotStore, SlotSummary } from '../../platform/storage';
import { clear, formatTime, h } from './dom';
import { Modal, type UiShell } from './shell';
import { savedAtText, slotLine } from './viewModels';

export type SlotMode = 'save' | 'load';

export interface SaveSlotActions {
  readonly slots: SaveSlotStore;
  /** Aktueller Stand als Text (nur Speichern). Null, wenn gerade nicht gespeichert werden kann. */
  snapshot?(): string | null;
  /** Spielstand übernehmen und weiterspielen; false = abgelehnt. */
  load?(raw: string): boolean | Promise<boolean>;
  /** Kartenname für die Zeile. */
  mapName(id: string): string;
  /** Rückfrage vor dem Laden, weil der laufende Fortschritt ersetzt wird. */
  confirmLoad?: boolean;
}

export function openSaveSlots(shell: UiShell, mode: SlotMode, actions: SaveSlotActions): Modal {
  const modal = new Modal(shell, { name: `slots-${mode}`, title: mode === 'save' ? 'Speichern' : 'Laden', size: 'narrow' });
  const list = h('ul', { class: 'slot-list', 'aria-label': 'Speicherplätze', 'data-testid': `slots-${mode}` });
  const status = h('div', { class: 'status-line', role: 'status', 'aria-live': 'polite', 'data-testid': 'slots-status' });
  modal.body.append(list);
  modal.foot.append(status);
  const say = (text: string, ok = true) => { status.className = `status-line${ok ? '' : ' bad'}`; status.textContent = text; };

  const save = async (summary: SlotSummary) => {
    const raw = actions.snapshot?.() ?? null;
    if (!raw) { say('Gerade kann nicht gespeichert werden.', false); return; }
    if (!summary.empty && !(await shell.confirm('Überschreiben?', `Platz ${summary.slot} enthält schon „${slotLine(summary, actions.mapName)}“.`, 'Überschreiben', 'Abbrechen', 'confirm-slot'))) return;
    if (actions.slots.write(summary.slot, raw)) { say(`Auf Platz ${summary.slot} gespeichert.`); shell.toast(`Gespeichert auf Platz ${summary.slot}`, 'good'); }
    else say('Speichern fehlgeschlagen. Ist der Browserspeicher voll oder gesperrt?', false);
    render(summary.slot);
  };

  const load = async (summary: SlotSummary) => {
    const raw = actions.slots.read(summary.slot);
    if (!raw || summary.corrupt) { say('Dieser Platz lässt sich nicht laden.', false); return; }
    if (actions.confirmLoad && !(await shell.confirm('Laden?', 'Der laufende Fortschritt wird durch diesen Spielstand ersetzt.', 'Laden', 'Abbrechen', 'confirm-slot'))) return;
    const ok = await actions.load?.(raw);
    if (ok) modal.close();
    else say('Der Spielstand wurde abgelehnt (beschädigt oder zu neu).', false);
  };

  const remove = async (summary: SlotSummary) => {
    if (!(await shell.confirm('Platz leeren?', `Platz ${summary.slot} wird endgültig gelöscht. Das lässt sich nicht rückgängig machen.`, 'Löschen', 'Abbrechen', 'confirm-slot'))) return;
    actions.slots.clear(summary.slot);
    say(`Platz ${summary.slot} geleert.`);
    render(summary.slot);
  };

  const render = (focusSlot?: number) => {
    clear(list);
    for (const summary of actions.slots.list()) {
      const usable = mode === 'save' || (!summary.empty && !summary.corrupt);
      const meta = [savedAtText(summary.savedAt), summary.playTimeMs ? `Spielzeit ${formatTime(summary.playTimeMs)}` : ''].filter(Boolean).join(' · ');
      list.append(h('li', { class: `slot${summary.empty ? ' empty' : ''}${summary.corrupt ? ' corrupt' : ''}`, 'data-slot': String(summary.slot) },
        h('button', {
          class: 'slot-main', type: 'button', 'data-testid': `slot-${mode}-${summary.slot}`, 'aria-disabled': String(!usable),
          'aria-label': `Platz ${summary.slot}: ${slotLine(summary, actions.mapName)}${mode === 'save' ? ', hier speichern' : ', laden'}`,
          onclick: () => { if (!usable) { say('Dieser Platz ist leer.', false); return; } void (mode === 'save' ? save(summary) : load(summary)); },
        },
        h('span', { class: 'slot-no' }, String(summary.slot)),
        h('span', { class: 'row-main' }, h('strong', null, slotLine(summary, actions.mapName)), meta ? h('span', { class: 'meta' }, meta) : null)),
        !summary.empty
          ? h('button', { class: 'btn small', type: 'button', 'data-testid': `slot-clear-${summary.slot}`, 'aria-label': `Platz ${summary.slot} löschen`, onclick: () => void remove(summary) }, 'Löschen')
          : null));
    }
    const target = focusSlot ? list.querySelector<HTMLElement>(`[data-testid="slot-${mode}-${focusSlot}"]`) : null;
    if (target) target.focus({ preventScroll: true });
  };
  render();
  return modal;
}
