// Welt-Systeme: Bezirke, U-Bahn-Stationen (Lage auf der Stadtkarte) und Fraktionen (world.md §3.1, §3.3, §10.1).
//
// Bezirke unterstadt/mittelring/oberstadt/kanalisation/kueste legen die Zonen-Pakete an (design/plan/act1.json
// "districts"); hier fehlt nur noch die Ödnis (Akt 2, aber schon auf der Stadtkarte zu sehen).
//
// Stationen: Die Zonen-Pakete legen ihre Station an. `cityPos` richtet sich aber nach dem gemalten Bild
// assets/ui/city-map.webp (Schlüssel ui-city-map), deshalb stehen die Stationen hier noch einmal mit den
// Bildkoordinaten. Felder außer cityPos sind 1:1 aus den Zonen-Dateien übernommen (siehe gaps/world.md).
// `station-chrome-allee` (Ausweis, Akt 2) fehlt bewusst: Ohne Karte chrome-boulevard meldet die Prüfung einen Fehler.
import type { DistrictDef, FactionDef, StationDef } from '../../../modules/contracts';
import type { ContentPart } from '../../part';
import { byId } from './_w';

const districts: DistrictDef[] = [
  { id: 'oednis', name: 'Ödnis', ambience: 'oednis', music: 'oednis' },
];

/** Lage auf ui-city-map (1536×1024): Metro-Knoten, Blitz-Schild, Kaischuppen, Rohr-Station, Treppe, Glasdach. */
const stations: StationDef[] = [
  { id: 'station-bahnhof-mitte', name: 'Bahnhof Mitte', map: 'bahnhof-mitte', entry: 'station', cityPos: [0.417, 0.45] },
  { id: 'station-neon-gasse', name: 'Neon-Gasse', map: 'neon-gasse', entry: 'station', cityPos: [0.285, 0.49] },
  { id: 'station-hafenkante', name: 'Hafenkante', map: 'hafenkante', entry: 'station', cityPos: [0.72, 0.5] },
  { id: 'station-rohrbogen', name: 'Rohrbogen', map: 'rohrsiedlung', entry: 'station', cityPos: [0.455, 0.665] },
  {
    id: 'station-stufenplatz', name: 'Stufenplatz', map: 'stufenplatz', entry: 'station', cityPos: [0.4, 0.33],
    when: { any: [{ quest: 'main-1-probezeit', state: 'done' }, { visited: 'stufenplatz' }] },
  },
  {
    id: 'station-glasarkaden', name: 'Glasarkaden', map: 'glasarkaden', entry: 'station', cityPos: [0.55, 0.22],
    when: { flag: 'drehkreuz_passiert' },
  },
];

const factions: FactionDef[] = [
  {
    id: 'crew-hunter', name: 'Hunters Crew',
    description: 'Hunter, Raven, Dante, Vega, Aria, Nyra und ein Stofftier mit Führungsanspruch. Sitz: High Voltage und das Crew-Quartier darüber. Steigt durch Hauptquests, Crew-Hilfe und Aufträge im Club. Wer die Crew hängen lässt, hängt bald selbst.',
  },
  {
    id: 'unterstadt', name: 'Unterstadt',
    description: 'Händler, Anwohner, Garküchen und alle, die zu arm für die Oberstadt und zu stur zum Gehen sind. Mag Nachbarschaftshilfe, Suppenküche und Leute, die die Rostzähne vertreiben. Hasst Diebe und Schlägereien auf dem Markt.',
  },
  {
    id: 'zerleger', name: 'Die Zerleger',
    description: 'Rippers Leute. Teile rein, Teile raus, keine Fragen, keine Quittung. Belohnt Lieferungen und Schweigen; wer sie bei der Wache verpfeift oder Kinder vor Ripper schützt, steht auf ihrer Liste. Oder unter ihrem Messer.',
  },
  {
    id: 'quantum', name: 'Quantum Industries',
    description: 'Der Konzern mit dem Turm, dem Ring und der Releaseparty. Zahlt gut für Werksjobs und Gehorsam. Ab Akt 2 steht die Crew dort fest bei −30 – Sabotage ist kein Karriereweg.',
  },
  {
    id: 'chrome-haus', name: 'Haus Chrome',
    description: 'Seraphina, Sybella und Serenity Chrome: Geld, Seide und Stil, in dieser Reihenfolge. Sitz am Chrome-Boulevard. Mag Geschenke und gute Kleidung, verzeiht keine verwechselten Seidentücher.',
  },
  {
    id: 'digitech', name: 'Digitech-Restbelegschaft',
    description: 'Was von Digitech übrig ist, nachdem Quantum „freundlich“ übernommen hat: eine Direktorin, ein Notstromaggregat und viel Groll. Mag Reparaturen im Areal, hasst Plünderer.',
  },
  {
    id: 'ordnungsdienst', name: 'Ordnungsdienst',
    description: 'Wache und Gericht im Eisenhof. Freut sich über abgelieferte Kopfgelder und ehrliche Aussagen, weniger über Bestechung und Zellenausbrüche. Hoher Ruf lässt die Fahndung schneller sinken.',
  },
  {
    id: 'nx1-medien', name: 'NX-1 Medien',
    description: 'Collin Charleston, Delya Delloraine und ein Kameramann, der mehr gesehen hat als die beiden zusammen. Interviews und Tipps bringen Sendezeit; wer Live-Sendungen sprengt, wird zur Schlagzeile.',
  },
  {
    id: 'kanalvolk', name: 'Kanalvolk',
    description: 'Bürgermeister Gully und sein Volk aus Rohrputzern, Floßkindern und Ratten mit Stimmrecht. Mag Ersatzteile und Respekt vor der Krone. Wer Ventile sabotiert, schwimmt allein.',
  },
  {
    id: 'aussiedler', name: 'Aussiedler der Ödnis',
    description: 'Marla Sand und die Höfe draußen vor der Mauer. Wasser ist Leben, Sand ist auch da. Mag Wasserfilter und sichere Konvois, hasst verschmutzte Brunnen und Staubfalken-Freunde.',
  },
  {
    id: 'staubfalken', name: 'Staubfalken',
    description: 'Motorradbande der Ödnis unter Krähe. Ehre, Wettfahrten, Tribut. Wer den Konvoi verteidigt, macht sich keine Freunde; wer Krähe im Ehrenduell schlägt, schon.',
  },
  {
    id: 'rostzaehne', name: 'Rostzähne',
    description: 'Straßenbande der Hafenkante mit Schutzgeld-Geschäftsmodell und Frisuren aus Rostschutzfarbe. Mag Zahler und Mitrenner. Wer Stände schützt, ist ihr Feind – und der Liebling vom Markt.',
  },
];

export const part: ContentPart = {
  districts: byId(districts),
  stations: byId(stations),
  factions: byId(factions),
};
