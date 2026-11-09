// Tageswechsel und Wochenzähler für Arias Stränge („Zerberster-Herz“ und Vex × Aria, world.md §4.7).
//
// Läuft über die Tageswechsel-Regeln der Engine (`GameContent.daily`, nach Schlaf oder Zusammenbruch) – kein
// Kartenwechsel mehr nötig, kein verlorener Zähltag.
// - `aria_heute`: höchstens eine Station pro Tag (beide Stränge). Gesetzt beim Start jeder Station, fällt jeden Morgen.
// - `aria_warte2` → `aria_warte1` → frei: „frühestens zwei Tage nach …“ (ein Schritt pro neuem Tag).
// - Wochenflags (Wiederholungen „höchstens einmal pro Woche“) fallen am Montag, Rippers Rate (montags) an jedem
//   anderen Tag.
import type { ContentPart } from '../../part';
import { all, flag, not, NOT_V, set } from './_util';

const WOCHE = ['vexaria_nacht_woche', 'vexaria_mast_woche', 'vexaria_rennen_woche', 'vexaria_dach_woche', 'vexaria_strand_woche'];

/** Abzählkette `<p>N` → … → `<p>1` → frei (pro neuem Tag ein Schritt; erst die kleinste Stufe abbauen). */
const kette = (p: string, n: number, last: ReturnType<typeof set>[] = []) => {
  const out: Record<string, { id: string; when: ReturnType<typeof flag>; effects: ReturnType<typeof set>[] }> = {};
  out[`${p}1`] = { id: `${p}1`, when: flag(`${p}1`), effects: [set(`${p}1`, false), ...last] };
  for (let i = 2; i <= n; i++) out[`${p}${i}`] = { id: `${p}${i}`, when: flag(`${p}${i}`), effects: [set(`${p}${i}`, false), set(`${p}${i - 1}`)] };
  return out;
};

export const part: ContentPart = {
  daily: {
    // Reihenfolge zählt: erst warte1 abbauen, dann warte2 → warte1.
    'aria-tag-warte1': { id: 'aria-tag-warte1', when: flag('aria_warte1'), effects: [set('aria_warte1', false)] },
    'aria-tag-warte2': { id: 'aria-tag-warte2', when: flag('aria_warte2'), effects: [set('aria_warte2', false), set('aria_warte1')] },
    'aria-tag-neu': { id: 'aria-tag-neu', effects: [set('aria_heute', false)] },
    'aria-woche-neu': { id: 'aria-woche-neu', when: { weekday: 'mo' }, effects: WOCHE.map((f) => set(f, false)) },
    // Akt 2 (versoehnung.ts): „vier Tage seit Station 6“, Freundschaftskrach zwei Tage, Streitfolgen drei Tage nach Misslingen.
    ...kette('aria_streit_t', 4),
    ...kette('aria_gescheitert_t', 3, [set('aria_romanze_streit', false)]),
    ...kette('aria_krach_t', 2),
    'aria-krach-vorbei': { id: 'aria-krach-vorbei', when: all(NOT_V, flag('aria_krach'), not(flag('aria_krach_t1')), not(flag('aria_krach_t2'))), effects: [set('aria_krach', false)] },
    'aria-rate-frei': { id: 'aria-rate-frei', when: not({ weekday: 'mo' }), effects: [set('vexaria_rate_diese_woche', false)] },
  },
};
