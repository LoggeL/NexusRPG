// TESTINHALT – Quests (design.md §3.5). Schritte rasten ein, sobald `done` gilt; Lösungswege über `any`.
import type { QuestDef } from '../modules/contracts';

export const QUESTS: Record<string, QuestDef> = {
  'test-chip': {
    id: 'test-chip',
    kind: 'main',
    title: 'Der verschlüsselte Chip',
    summary: 'Raven hat einen Chip, den niemand lesen kann.',
    giver: 'raven',
    act: 1,
    autoStart: { flag: 'test-angekommen' },
    steps: [
      { id: 'raven', text: 'Sprich mit Raven an der Straßenecke.', done: { met: 'raven' }, marker: { map: 'test-strasse', at: [520, 480] } },
      { id: 'chip', text: 'Finde heraus, was auf dem Chip ist.', done: { flag: 'test-chip-entschluesselt' }, when: { met: 'raven' } },
      { id: 'schlaeger', text: 'Vertreibe die Schläger an der Kreuzung (optional).', done: { won: 'test-schlaeger' }, optional: true, marker: { map: 'test-strasse', at: [1300, 780] } },
    ],
    reward: { xp: 120, credits: 50, relations: { raven: 40 }, rep: { crew: 5 } },
  },
};
