// Start, Unterschlupf, Akt-Einstiege und Ende (design/plan/start.md). Bezirke, Stationen, Fraktionen und
// Cutscenes liegen in den Inhaltsteilen (content/parts/**).
import type { GameContent } from '../modules/contracts';

export const START: GameContent['start'] = {
  map: 'digitech-areal',
  entry: 'prolog-start',
  cutscene: 'intro-noxius',
  minutes: 360, // 06:00 – die Ankunft am Bahnhof springt auf 16:30 (siehe design/plan/start.md)
};

export const HOME: GameContent['home'] = {
  map: 'crew-quartier',
  entry: 'aufwachen',
  collapseNotes: [
    'Zettel von Captain Kuschel: „Schlaf ist auch ein Plan. – C. K.“',
    'Zettel von Captain Kuschel: „Hab dich heimgeschleppt. Bezahlung in Keksen. – C. K.“',
    'Zettel von Captain Kuschel: „Du schnarchst. Dante hat’s aufgenommen. Ich hab’s gelöscht. Fast. – C. K.“',
  ],
};

const PROLOG_FLAGS = ['prolog_done', 'prolog_raven_misstrauisch', 'prolog_tuer_offen', 'prolog_geschlichen'];
const PROLOG_SEEN = ['enter:digitech-areal:prolog-funk'];

const ACT2: GameContent['actStarts'][2] = { map: 'crew-quartier', entry: 'aufwachen' };
const ACT3: GameContent['actStarts'][3] = { map: 'crew-quartier', entry: 'aufwachen' };

/** Zustände für `?act=` und den Debug-Warp. Akt 2/3 sind vorläufig Akt-1-Orte mit erledigtem Hauptstrang. */
export const ACT_STARTS: GameContent['actStarts'] = {
  1: {
    map: 'bahnhof-mitte', entry: 'start',
    flags: PROLOG_FLAGS,
    quests: { 'main-0-digitech': 'done' },
    seen: PROLOG_SEEN,
    visited: ['digitech-areal', 'digitech-tresor'],
  },
  2: ACT2,
  3: ACT3,
};

export const ENDING: GameContent['ending'] = {
  cutscenes: ['ende-fortsetzung-folgt'],
  epilogue: [
    { text: 'Noxius leuchtet weiter – mit dir mittendrin.' },
    { when: { flag: 'act1_done' }, text: 'Hunters Crew hat eine Nacht überlebt, über die in der Unterstadt noch lange geredet wird.' },
  ],
};
