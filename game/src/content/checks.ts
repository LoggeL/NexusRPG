// TESTINHALT – Schwellen-Checks (design.md §3.2). Wert = Attribut + Boni; bestanden bei Wert ≥ Schwelle.
// Jeder Check braucht im Inhalt einen anderen Weg (content.test.ts prüft Dialoge).
import type { CharacterCheckDef } from '../modules/character/types';

export const CHECKS: Record<string, CharacterCheckDef> = {
  'test-chip-technik': {
    id: 'test-chip-technik', attribute: 'technik', threshold: 6, tags: ['hacken'],
    bonuses: [{ when: { hearts: 'raven', min: 2 }, value: 1, label: 'Ravens Tipp' }],
  },
  'test-schloss': { id: 'test-schloss', attribute: 'reflexe', threshold: 5, tags: ['schloss'] },
  'test-kiste': { id: 'test-kiste', attribute: 'koerper', threshold: 5, tags: ['kiste'] },
  'test-einschuechtern': { id: 'test-einschuechtern', attribute: 'ausstrahlung', threshold: 7, tags: ['einschuechtern'] },
  'test-gosse': { id: 'test-gosse', attribute: 'strasse', threshold: 4, hiddenIfFailed: true },
};
