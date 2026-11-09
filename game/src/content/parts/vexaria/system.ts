// Tageswechsel und Wochenzähler für Arias Stränge („Zerberster-Herz“ und Vex × Aria, world.md §4.7).
//
// Läuft über die Tageswechsel-Regeln der Engine (`GameContent.daily`, nach Schlaf oder Zusammenbruch) – kein
// Kartenwechsel mehr nötig, kein verlorener Zähltag.
// - `aria_heute`: höchstens eine Station pro Tag (beide Stränge). Gesetzt beim Start jeder Station, fällt jeden Morgen.
// - `aria_warte2` → `aria_warte1` → frei: „frühestens zwei Tage nach …“ (ein Schritt pro neuem Tag).
// - Wochenflags (Wiederholungen „höchstens einmal pro Woche“) fallen am Montag, Rippers Rate (montags) an jedem
//   anderen Tag.
import type { ContentPart } from '../../part';
import { flag, not, set } from './_util';

const WOCHE = ['vexaria_nacht_woche', 'vexaria_mast_woche', 'vexaria_rennen_woche'];

export const part: ContentPart = {
  daily: {
    // Reihenfolge zählt: erst warte1 abbauen, dann warte2 → warte1.
    'aria-tag-warte1': { id: 'aria-tag-warte1', when: flag('aria_warte1'), effects: [set('aria_warte1', false)] },
    'aria-tag-warte2': { id: 'aria-tag-warte2', when: flag('aria_warte2'), effects: [set('aria_warte2', false), set('aria_warte1')] },
    'aria-tag-neu': { id: 'aria-tag-neu', effects: [set('aria_heute', false)] },
    'aria-woche-neu': { id: 'aria-woche-neu', when: { weekday: 'mo' }, effects: WOCHE.map((f) => set(f, false)) },
    'aria-rate-frei': { id: 'aria-rate-frei', when: not({ weekday: 'mo' }), effects: [set('vexaria_rate_diese_woche', false)] },
  },
};
