// Tageswechsel und Wochenzähler für Arias Stränge („Zerberster-Herz“ und Vex × Aria, world.md §4.7).
//
// - `aria_heute`: höchstens eine Station pro Tag (beide Stränge). Gesetzt beim Start jeder Station.
// - `aria_abend`: merkt sich, dass der Tag den Abend erreicht hat; der erste Kartenwechsel am Morgen/Tag danach ist
//   der Tageswechsel: `aria_heute` und `aria_abend` fallen, „zwei Tage warten“ zählt einen Schritt weiter.
// - `aria_warte2` → `aria_warte1` → frei: „frühestens zwei Tage nach …“.
// - Wochenflags (Wiederholungen „höchstens einmal pro Woche“) fallen am Montag, Rippers Rate an jedem anderen Tag.
import type { ContentPart } from '../../part';
import type { MapId } from '../../../modules/contracts';
import { all, flag, noFlag, not, set } from './_util';

const KARTEN: MapId[] = [
  'neon-gasse', 'high-voltage', 'hv-hinterzimmer', 'crew-quartier', 'loetgassen', 'dantes-werkstatt', 'loetzinn-laden',
  'schrottmarkt', 'hafenkante', 'flutmauer', 'bahnhof-mitte', 'rohrsiedlung', 'stufenplatz', 'glasarkaden', 'ripper-praxis',
  'suppenkueche', 'netzcafe-datenkruemel', 'cafe-sahnehaube', 'fundbuero',
];

const FRUEH = { time: ['morgen', 'tag'] } as const;
const SPAET = { time: ['abend', 'nacht'] } as const;
const WOCHE = ['vexaria_nacht_woche', 'vexaria_mast_woche', 'vexaria_rennen_woche'];

const trigger = (map: MapId) => [
  // Reihenfolge: erst warte1 abbauen, dann warte2 → warte1, dann den Tag zurücksetzen.
  { id: `aria-tag-warte1-${map}`, once: false, when: all(flag('aria_abend'), FRUEH, flag('aria_warte1')), effects: [set('aria_warte1', false)] },
  { id: `aria-tag-warte2-${map}`, once: false, when: all(flag('aria_abend'), FRUEH, flag('aria_warte2')), effects: [set('aria_warte2', false), set('aria_warte1')] },
  { id: `aria-tag-neu-${map}`, once: false, when: all(flag('aria_abend'), FRUEH), effects: [set('aria_heute', false), set('aria_abend', false)] },
  { id: `aria-tag-abend-${map}`, once: false, when: all(noFlag('aria_abend'), SPAET), effects: [set('aria_abend')] },
  // Woche: an jedem Tag außer Montag scharf schalten, am Montag einmal zurücksetzen.
  { id: `aria-woche-bereit-${map}`, once: false, when: all(not({ weekday: 'mo' }), noFlag('aria_woche_bereit')), effects: [set('aria_woche_bereit'), set('vexaria_rate_diese_woche', false)] },
  { id: `aria-woche-neu-${map}`, once: false, when: all({ weekday: 'mo' }, flag('aria_woche_bereit')), effects: [set('aria_woche_bereit', false), ...WOCHE.map((f) => set(f, false))] },
];

export const part: ContentPart = {
  mapAdditions: Object.fromEntries(KARTEN.map((m) => [m, { onEnter: trigger(m) }])),
};
