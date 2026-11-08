// TESTINHALT – Begegnungen und Arenen (design.md §3.7). Arena: 12 × 8 Felder à 128 px.
// Zeichen: '.' Boden, '#' Hindernis, 'h' halbe, 'H' volle Deckung, '~' Gefahr, 'P' Party-Start, 'E' Gegner-Start.
// Je eine Begegnung pro Missionsziel (besiegen, Terminal hacken, entkommen, Person schützen, überleben, Boss).
import type { ArenaDef, EncounterDef } from '../modules/contracts';

export const ARENAS: Record<string, ArenaDef> = {
  'test-gasse': {
    id: 'test-gasse',
    name: 'Testgasse',
    bg: 'arena-test-gasse',
    layout: [
      '............',
      'P...h....#.E',
      'P...h......E',
      '.......H....',
      '..##...H..~.',
      'P.........hE',
      '....h.......',
      '............',
    ],
    hazard: { status: 'brennt', damage: 2 },
  },
  'test-labor': {
    id: 'test-labor',
    name: 'Testlabor',
    bg: 'arena-test-labor',
    layout: [
      '..h.....#..E',
      'P.h..H..#...',
      'P..........E',
      '...~~....h..',
      '...~~....h..',
      'P..........E',
      '..h..H..#...',
      '..h.....#..E',
    ],
    hazard: { damage: 4 },
  },
};

export const ENCOUNTERS: Record<string, EncounterDef> = {
  'test-schlaeger': {
    id: 'test-schlaeger',
    name: 'Schläger an der Kreuzung',
    arena: 'test-gasse',
    enemies: [{ enemy: 'test-schlaeger', count: 2 }],
    objective: { kind: 'defeat' },
    canFlee: true,
    intro: [{ speaker: 'narrator', text: 'Zwei Schläger versperren den Weg. Einer knackt mit den Fingerknöcheln.' }],
    reward: { xp: 40, credits: 25 },
    onWin: [{ setFlag: 'test-schlaeger-besiegt' }],
  },
  'test-hinterhof': {
    id: 'test-hinterhof',
    name: 'Hinterhof mit Scharfschützin',
    arena: 'test-gasse',
    enemies: [{ enemy: 'test-schlaeger' }, { enemy: 'test-schuetze', at: [11, 5] }, { enemy: 'test-sani' }],
    reward: { xp: 30 },
  },
  'test-terminal': {
    id: 'test-terminal',
    name: 'Terminal im Labor',
    arena: 'test-labor',
    enemies: [{ enemy: 'test-drohne', count: 2 }, { enemy: 'test-sani' }],
    objective: { kind: 'hack', cell: [8, 3], ap: 3 },
    intro: [{ speaker: 'narrator', text: 'Ein Terminal blinkt hinter der Glaswand. Drei Aktionspunkte am Terminal, dann ist es offen.' }],
    reward: { xp: 50 },
  },
  'test-flucht': {
    id: 'test-flucht',
    name: 'Raus aus dem Labor',
    arena: 'test-labor',
    enemies: [{ enemy: 'test-drohne', count: 3 }],
    objective: { kind: 'reach', cells: [[11, 3], [11, 4]] },
    reward: { xp: 30 },
  },
  'test-eskorte': {
    id: 'test-eskorte',
    name: 'Dante beschützen',
    arena: 'test-gasse',
    enemies: [{ enemy: 'test-schlaeger', count: 2 }],
    objective: { kind: 'rescue', unit: 'dante', cell: [1, 3] },
    reward: { xp: 40 },
  },
  'test-ueberleben': {
    id: 'test-ueberleben',
    name: 'Drei Runden durchhalten',
    arena: 'test-labor',
    enemies: [{ enemy: 'test-drohne', count: 2 }],
    objective: { kind: 'survive', rounds: 3 },
    canFlee: false,
    reward: { xp: 30 },
  },
  'test-boss': {
    id: 'test-boss',
    name: 'Ripper am Tisch',
    arena: 'test-gasse',
    enemies: [{ enemy: 'test-boss', at: [10, 2] }, { enemy: 'test-schlaeger' }],
    canFlee: false,
    intro: [{ speaker: 'narrator', text: 'Ripper lehnt sich zurück: „Was haben wir denn da?“' }],
    reward: { xp: 80, credits: 50 },
  },
};
