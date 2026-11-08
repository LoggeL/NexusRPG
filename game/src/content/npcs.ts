// TESTINHALT – Figuren mit Tagesablauf (design.md §3.4). Erster passender Eintrag gewinnt.
// Tageszeiten: morgen 06–10, tag 10–17, abend 17–21, nacht 21–02.
import type { NpcDef } from '../modules/contracts';
import { GIFTS, HEART_EVENTS } from './relationships';

export const NPCS: Record<string, NpcDef> = {
  raven: {
    id: 'raven',
    name: 'Raven',
    unknownName: 'Frau in Schwarz',
    knownFlag: 'raven-bekannt',
    portrait: 'raven',
    sprite: 'raven-walk',
    faction: 'crew',
    romanceable: true,
    gifts: GIFTS.raven,
    schedule: [
      { slot: ['morgen', 'tag'], place: { map: 'test-strasse', at: 'ecke' } },
      { slot: 'abend', place: { map: 'test-innen', at: 'tresen' } },
      { place: 'away' },
    ],
    heartEvents: HEART_EVENTS.raven,
    companion: {
      recruit: { flag: 'test-chip-entschluesselt' },
      stats: {
        hp: 30, armor: 1, morale: 80,
        attributes: { technik: 4, koerper: 5, reflexe: 7, ausstrahlung: 5, strasse: 6 },
        weapon: { kind: 'fernkampf', damage: 4, range: 5 },
        abilities: ['test-schnellschuss'],
      },
      heartAbilities: [{ hearts: 4, ability: 'test-hieb' }],
    },
    talk: [
      { dialogue: 'test-raven-chip', when: { all: [{ quest: 'test-chip', state: 'active' }, { notFlag: 'test-chip-entschluesselt' }] } },
      { dialogue: 'test-raven-alltag' },
    ],
  },
  dante: {
    id: 'dante',
    name: 'Dante',
    portrait: 'dante',
    sprite: 'dante-walk',
    faction: 'crew',
    romanceable: true,
    gifts: GIFTS.dante,
    schedule: [
      { slot: 'morgen', place: { map: 'test-innen', at: 'werkbank' } },
      { slot: ['tag', 'abend'], place: { map: 'test-strasse', at: 'stand' } },
      { slot: 'nacht', place: { map: 'test-innen', at: 'werkbank', facing: 'n' } },
    ],
    heartEvents: HEART_EVENTS.dante,
    companion: {
      recruit: { hearts: 'dante', min: 1 },
      stats: {
        hp: 26, armor: 2, morale: 70,
        attributes: { technik: 8, koerper: 4, reflexe: 4, ausstrahlung: 4, strasse: 5 },
        weapon: { kind: 'smart', damage: 3, range: 4 },
        abilities: ['test-stoersignal'],
      },
    },
    talk: [{ dialogue: 'test-dante-alltag' }],
  },
  aria: {
    // Romanze vom Nutzer freigegeben (romance.ts); Platzhalter bis zum Akt-1-Inhalt.
    id: 'aria',
    name: 'Aria',
    portrait: 'aria',
    sprite: 'aria-walk',
    faction: 'crew',
    romanceable: true,
    schedule: [
      { slot: ['abend', 'nacht'], place: { map: 'test-innen', at: 'tresen' } },
      { place: 'away' },
    ],
    talk: [{ dialogue: 'test-dante-alltag' }],
  },
};
