// TESTINHALT – Nachrichtensendungen und Telefonnachrichten (design.md §3.8).
import type { NewsDef, PhoneMessageDef } from '../modules/contracts';

export const NEWS: Record<string, NewsDef> = {
  'test-morgen': {
    id: 'test-morgen', anchor: 'dante', headline: 'Smog über der Unterstadt',
    lines: [{ speaker: 'dante', text: 'Testsendung: Heute dichter Smog. Atemfilter nicht vergessen.' }],
  },
  'test-schlaeger': {
    id: 'test-schlaeger', anchor: 'dante', headline: 'Ruhe an der Kreuzung', priority: 5, when: { won: 'test-schlaeger' },
    lines: [{ speaker: 'dante', text: 'Testsendung: Die Schläger an der Kreuzung wurden vertrieben. Von wem? Man munkelt.' }],
  },
};

export const PHONE: Record<string, PhoneMessageDef> = {
  'test-raven-hallo': {
    id: 'test-raven-hallo', from: 'raven', text: 'Gut gemacht mit dem Chip. Abends bin ich im Unterschlupf.',
    auto: { flag: 'test-chip-entschluesselt' },
    replies: [
      { text: 'Bis später!', effects: [{ relation: 'raven', delta: 5 }] },
      { text: 'War doch nix.' },
    ],
  },
};
