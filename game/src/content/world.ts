// Start, Unterschlupf, Akt-Einstiege und Ende (design/plan/start.md). Bezirke, Stationen, Fraktionen und
// Cutscenes liegen in den Inhaltsteilen (content/parts/**).
import type { ActStart, GameContent } from '../modules/contracts';

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

/** Hauptstrang Akt 1 abgeschlossen (Flags, die die Hauptquests als erledigt kennzeichnen). */
const AKT1_FLAGS = [
  ...PROLOG_FLAGS,
  'ankunft_uhr', 'ankunft_abzieher_geloest', 'hunter_nachricht', 'hv_einlass',
  'probezeit_gespraech', 'probezeit_ripper_geloest', 'probezeit_bestanden',
  'dexter_trupp', 'dexter_drohnen_freundlich', 'dexter_geld', 'dexter_abgerechnet',
  'raven_entlassen', 'raven_frei', 'raven_party_begonnen', 'raven_partyfoto',
  'dante_tuer', 'dante_abgelehnt', 'dante_nachgespraech', 'plan_gefasst',
  'act1_done', 'losschlagen_bestaetigt',
];
const AKT1_QUESTS: NonNullable<ActStart['quests']> = Object.fromEntries([
  'main-0-digitech', 'main-1-ankunft', 'main-1-probezeit', 'main-1-dexter', 'main-1-raven', 'main-1-auf-raven',
  'main-1-dante', 'main-1-der-plan',
].map((id) => [id, 'done' as const]));
const AKT1_STATIONS = [
  'station-bahnhof-mitte', 'station-neon-gasse', 'station-hafenkante', 'station-rohrbogen', 'station-stufenplatz',
];
const AKT1_VISITED = [
  'digitech-areal', 'digitech-tresor', 'bahnhof-mitte', 'neon-gasse', 'high-voltage', 'hv-hinterzimmer', 'crew-quartier',
  'schrottmarkt', 'ripper-praxis', 'dantes-werkstatt', 'stufenplatz', 'eisenhof', 'zellentrakt', 'hafenkante',
  'rohrsiedlung', 'loetgassen',
];
const CREW = ['raven', 'aria', 'vega', 'nyra', 'hunter', 'dante'];

/**
 * Akt 2 und 3 gibt es noch nicht. Bis dahin starten beide Warps nach dem Akt-1-Bruch (`act1_done`) mit erledigtem
 * Hauptstrang, voller Crew und passender Stufe in der Unterstadt (world.md §2.7: Ende Akt 1 Stufe 5–6, Ende Akt 2 10–11).
 */
const ACT2: ActStart = {
  map: 'crew-quartier', entry: 'aufwachen',
  flags: AKT1_FLAGS, quests: AKT1_QUESTS, seen: PROLOG_SEEN, visited: AKT1_VISITED, stations: AKT1_STATIONS,
  recruited: CREW, party: ['raven', 'aria'],
  relations: { raven: 450, aria: 450, vega: 300, nyra: 300, hunter: 350, dante: 300 },
  items: { medipflaster: 3, reparaturset: 1, nougatbombe: 2 }, credits: 400, level: 6, day: 10,
};
const ACT3: ActStart = {
  ...ACT2,
  map: 'neon-gasse', entry: 'station',
  relations: { raven: 650, aria: 650, vega: 500, nyra: 500, hunter: 550, dante: 500 },
  items: { medipflaster: 5, nanogel: 2, reparaturset: 2, nougatbombe: 3 }, credits: 1200, level: 11, day: 30,
};

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
