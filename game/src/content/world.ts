// TESTINHALT – Bezirke, U-Bahn-Stationen, Fraktionen, Cutscenes, Start, Unterschlupf, Akte und Ende.
import type {
  CutsceneDef, DistrictDef, FactionDef, GameContent, StationDef,
} from '../modules/contracts';

export const DISTRICTS: Record<string, DistrictDef> = {
  'test-unterstadt': { id: 'test-unterstadt', name: 'Unterstadt', ambience: 'unterstadt' },
};

export const STATIONS: Record<string, StationDef> = {
  'test-station': { id: 'test-station', name: 'Teststraße', map: 'test-strasse', entry: 'station', cityPos: [0.42, 0.64] },
};

export const FACTIONS: Record<string, FactionDef> = {
  crew: { id: 'crew', name: 'Hunters Crew', description: 'Eine kleine Crew mit großem Mundwerk.' },
  unterstadt: { id: 'unterstadt', name: 'Unterstadt', description: 'Die Leute der Straße.' },
};

/** Schlüsselszenen mit fotorealen Plates (cut-<id>); fehlende Bilder zeigt die Darstellung als Platzhalter. */
export const CUTSCENES: Record<string, CutsceneDef> = {
  'test-intro': {
    id: 'test-intro',
    title: 'Ankunft in Noxius',
    beats: [
      { image: 'cut-test-intro', pan: 'in', fade: 'in', caption: 'Noxius, 2086. Die Unterstadt schläft nie.', hold: 1200 },
      { image: 'cut-test-intro', pan: 'left', lines: [{ speaker: 'raven', text: 'Neu hier? Dann bleib in meiner Nähe, {name}.' }] },
    ],
    effects: [{ setFlag: 'test-intro-gesehen' }],
  },
  'test-ende': {
    id: 'test-ende',
    title: 'Ende des Testinhalts',
    beats: [{ image: 'black', caption: 'Ende des Testinhalts.' }],
    gallery: false,
  },
};

export const START: GameContent['start'] = {
  map: 'test-strasse',
  entry: 'start',
  cutscene: 'test-intro',
  credits: 50,
  minutes: 480,
  items: { 'synth-kaffee': 1 },
};

export const HOME: GameContent['home'] = {
  map: 'test-innen',
  entry: 'tuer',
  collapseNotes: [
    'Notiz von Captain Kuschel: „Hab dich heimgeschleppt. Bezahlung in Keksen.“',
    'Notiz von Captain Kuschel: „Du schnarchst. Ich hab’s aufgenommen.“',
  ],
};

/** Zustände für `?act=` und den Debug-Warp. */
export const ACT_STARTS: GameContent['actStarts'] = {
  1: { map: 'test-strasse', entry: 'start', seen: ['test-intro'] },
  2: {
    map: 'test-innen', entry: 'tuer',
    flags: ['test-angekommen', 'test-chip-entschluesselt', 'raven-bekannt'],
    quests: { 'test-chip': 'done' },
    recruited: ['raven'], party: ['raven'],
    relations: { raven: 250, dante: 120 },
    stations: ['test-station'], visited: ['test-strasse', 'test-innen'], seen: ['test-intro'],
    items: { 'neon-messer': 1 }, credits: 200, level: 3, day: 3,
  },
  3: {
    map: 'test-strasse', entry: 'station',
    flags: ['test-angekommen', 'test-chip-entschluesselt', 'raven-bekannt'],
    quests: { 'test-chip': 'done' },
    recruited: ['raven', 'dante'], party: ['raven', 'dante'],
    relations: { raven: 450, dante: 300 },
    stations: ['test-station'], visited: ['test-strasse', 'test-innen'], seen: ['test-intro'],
    items: { 'neon-messer': 1, 'synth-kaffee': 3 }, credits: 500, level: 6, day: 8,
  },
};

export const ENDING: GameContent['ending'] = {
  cutscenes: ['test-ende'],
  epilogue: [
    { text: 'Noxius leuchtet weiter – mit dir mittendrin.' },
    { when: { hearts: 'raven', min: 4 }, text: 'Raven hebt dir einen Platz am Tresen frei.' },
    { when: { won: 'test-schlaeger' }, text: 'Die Schläger von der Kreuzung machen seitdem einen großen Bogen um dich.' },
  ],
};
