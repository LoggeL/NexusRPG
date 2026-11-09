// Start, Unterschlupf, Akt-Einstiege und Ende (design/plan/start.md). Bezirke, Stationen, Fraktionen und
// Cutscenes liegen in den Inhaltsteilen (content/parts/**).
import type { ActStart, GameContent } from '../modules/contracts';
import { ENDING_EPILOGUE } from './parts/quest-enden/epilog-karten';

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
const CREW_OHNE_DANTE = ['raven', 'aria', 'vega', 'nyra', 'hunter'];

/** Akt 1 → 2: die drei Bruch-Vorbereitungen aus act23.json (die übrigen zwei bleiben offen). */
const BRUCH_PREPS = ['prep-grundriss', 'prep-wachplan', 'prep-fluchtweg'];

/**
 * Akt 2 „Der Chip“ (design/plan/act23.json actStarts): direkt nach dem „los“ an der Planungstafel, 22:00 an der Hecke
 * am Zaun Ost. Party Aria + Nyra, Dante ist noch nicht in der Crew (tritt in main-2-countdown bei).
 */
const ACT2: ActStart = {
  map: 'quantum-campus', entry: 'bruch-treffpunkt',
  flags: [...AKT1_FLAGS, 'prep_grundriss', 'prep_wachplan', 'prep_fluchtweg'],
  quests: {
    ...AKT1_QUESTS,
    ...Object.fromEntries(BRUCH_PREPS.map((id) => [id, 'done' as const])),
    'main-2-bruch': 'active',
  },
  seen: [...PROLOG_SEEN, 'akt1-cliffhanger'],
  visited: [...AKT1_VISITED, 'quantum-campus'],
  stations: AKT1_STATIONS,
  recruited: CREW_OHNE_DANTE, party: ['aria', 'nyra'],
  relations: { raven: 450, aria: 450, vega: 300, nyra: 300, hunter: 350, dante: 250 },
  items: { medipflaster: 3, reparaturset: 1, nougatbombe: 2 }, credits: 400, level: 6, day: 10,
  minutes: 1320, // 22:00 – wie nach der Wartetreppe der Planungstafel
};

/** Hauptstrang Akt 2 erledigt (Variante A: Aria war gechippt, Dante hat den Chip gezogen). */
const AKT2_FLAGS = [
  'bruch_rolle_drinnen', 'bruch_drin', 'bruch_im_labor', 'bruch_entkommen', 'bruch_flucht_kanal',
  'nexus_erwacht', 'nyra_zurueckgelassen', 'aria_gechippt', 'aria_verkauft_an_ripper',
  'kanal_befreit', 'kanal_freigekauft', 'kanal_bei_dante',
  'countdown_entschaerft', 'aria_chip_entfernt', 'dante_beigetreten',
  'hunter_aufgerichtet', 'party_idee_spieler', 'releaseparty_geplant',
  'prep_outfits', 'outfits_schlicht', 'prep_ausweise', 'prep_gaesteliste', 'gaesteliste_foto', 'party_bereit',
];
const AKT2_QUESTS = ['main-2-bruch', 'main-2-kanal', 'main-2-countdown', 'main-2-krisensitzung',
  'prep-outfits', 'prep-ausweise', 'prep-gaesteliste'];

/**
 * Akt 3 „Releaseparty“: Abend der Party (20:00) am Vorplatz. Party Aria + Dante; Nyra sitzt im Turm, Raven fährt mit
 * Hunter vor. `nexus-chip-defekt` fehlt bewusst (nur nach gc-34).
 */
const ACT3: ActStart = {
  map: 'quantum-campus', entry: 'party-vorplatz',
  flags: [...AKT1_FLAGS, 'prep_grundriss', 'prep_wachplan', 'prep_fluchtweg', ...AKT2_FLAGS],
  quests: {
    ...AKT1_QUESTS,
    ...Object.fromEntries([...BRUCH_PREPS, ...AKT2_QUESTS].map((id) => [id, 'done' as const])),
    'main-3-einlass': 'active',
  },
  seen: [...PROLOG_SEEN, 'akt1-cliffhanger'],
  visited: [...AKT1_VISITED, 'quantum-campus', 'quantum-foyer', 'quantum-labor', 'pumpwerk-sieben', 'chrome-boulevard',
    'glasarkaden', 'staubstrasse', 'aussiedlerhof', 'nx1-studio'],
  stations: [...AKT1_STATIONS, 'station-chrome-allee'],
  recruited: ['raven', 'aria', 'vega', 'hunter', 'dante'], party: ['aria', 'dante'],
  relations: { raven: 650, aria: 650, vega: 500, nyra: 500, hunter: 550, dante: 500 },
  items: { medipflaster: 5, nanogel: 2, reparaturset: 2, nougatbombe: 3, 'party-ausweis': 1, 'stick-hunter': 1, 'outfit-ordentlich': 1 },
  credits: 1200, level: 11, day: 30,
  minutes: 1200, // 20:00 – Einlass
};

/** Zustände für `?act=` und den Debug-Warp. */
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

/** Abspann und Endbildschirm (design/plan/ending.md). Die Enden selbst laufen als Cutscene + Reise (quest-enden). */
export const ENDING: GameContent['ending'] = {
  cutscenes: ['ende-abspann'],
  epilogue: ENDING_EPILOGUE,
};
