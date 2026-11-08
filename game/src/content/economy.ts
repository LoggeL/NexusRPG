// TESTINHALT – Händler und Auftragsvorlagen (design.md §3.5, §3.6).
import type { JobTemplateDef, ShopDef } from '../modules/contracts';

export const SHOPS: Record<string, ShopDef> = {
  'test-kiosk': {
    id: 'test-kiosk',
    name: 'Dantes Stand',
    owner: 'dante',
    faction: 'unterstadt',
    open: { time: ['morgen', 'tag', 'abend'] },
    stock: [
      { item: 'synth-kaffee', qty: 5 },
      { item: 'neon-messer', qty: 1 },
    ],
    ripperdoc: { freeWhen: { hearts: 'dante', min: 2 } },
  },
};

/** Je Tafel und Tag werden bis zu 3 verschiedene Vorlagen gezogen. */
export const JOBS: Record<string, JobTemplateDef> = {
  'test-kurier': {
    id: 'test-kurier', kind: 'kurier', title: 'Päckchen nach {ziel}', text: 'Nicht reinschauen. Bezahlung: {credits} Credits.',
    boards: ['test-tafel'], targets: [{ map: 'test-innen', label: 'Unterschlupf' }],
    reward: { credits: [30, 60], xp: 20, rep: { unterstadt: 2 } },
  },
  'test-schulden': {
    id: 'test-schulden', kind: 'schulden', title: 'Schulden eintreiben: {ziel}', text: 'Freundlich bleiben. Meistens.',
    boards: ['test-tafel'], targets: [{ map: 'test-strasse', label: 'Kiosk-Kunde', at: [1000, 500] }],
    reward: { credits: [40, 80], xp: 25 },
  },
  'test-kopfgeld': {
    id: 'test-kopfgeld', kind: 'kopfgeld', title: 'Kopfgeld: {ziel}', text: 'Die Schläger an der Kreuzung nerven alle.',
    boards: ['test-tafel'], targets: [{ map: 'test-strasse', label: 'Schläger', at: [1300, 780] }], encounter: 'test-schlaeger',
    reward: { credits: [80, 120], xp: 40, rep: { unterstadt: 5 } },
  },
};
