// Zone Bahnhof Mitte (world.md §3.5, Plan design/plan/act1.json maps.bahnhof-mitte, Paket pkg-bahnhof-mitte).
// Startzone: Einstieg `start` (Tag 1, 16:30, main-1-ankunft). Legt die Station station-bahnhof-mitte an.
// Bild: game/public/assets/bg/bahnhof-mitte.webp (Rohbild output/imagegen/raw/maps/bahnhof-mitte-b.png).
// Koordinaten in Kartenpixeln, am fertigen Bild nachgezogen (node scripts/map_tool.mjs bahnhof-mitte).
import type { CheckDef, Condition, DialogueDef, DialogueChoice, MapDef, Polygon, Rect } from '../../../modules/contracts';
import type { ContentPart } from '../../part';

const box = ([x, y, w, h]: Rect): Polygon => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
const n = (text: string) => ({ speaker: 'narrator' as const, text });

const ABEND_NACHT: Condition = { time: ['abend', 'nacht'] };
const MORGEN_TAG: Condition = { time: ['morgen', 'tag'] };

/** Große Treppe: offen nach der Probezeit, ab Akt 2 oder nachdem man die Kontrolle einmal umgangen hat. */
const TREPPE_OFFEN: Condition = {
  any: [{ quest: 'main-1-probezeit', state: 'done' }, { act: 2 }, { flag: 'treppe_kontrolle_umgangen' }],
};

/** world.md §3.2: „[Straße 5] Kontrolle umgehen“ – world.md nennt keine gc-ID, daher eingebettet. */
const TREPPE_CHECK: CheckDef = {
  id: 'bahnhof-treppe-kontrolle', attribute: 'strasse', threshold: 5, tags: ['schleichen', 'geruecht', 'welt'],
};

// ------------------------------------------------------------------ Schwebetaxi (Kiki ab ♥2, vorher Herr Blitz)

const TAXI_ZIELE: readonly (readonly [map: string, name: string])[] = [
  ['neon-gasse', 'Neon-Gasse'], ['schrottmarkt', 'Schrottmarkt'], ['loetgassen', 'Lötgassen'],
  ['rohrsiedlung', 'Rohrsiedlung'], ['hafenkante', 'Hafenkante'], ['stufenplatz', 'Stufenplatz'],
  ['eisenhof', 'Eisenhof'], ['digitech-areal', 'Digitech-Areal'], ['flutmauer', 'Flutmauer'],
];

function taxiChoices(preis: number): DialogueChoice[] {
  return TAXI_ZIELE.map(([map, name]) => ({
    text: `${name} (${preis} Cr)`,
    when: { visited: map },
    requires: { credits: preis },
    effects: [{ credits: -preis }, { travel: map, entry: 'taxi', minutes: 20 }],
  }));
}

const taxiKiki: DialogueDef = {
  id: 'bahnhof-taxi-kiki',
  start: 'start',
  nodes: [
    {
      id: 'start',
      lines: [
        { speaker: 'kiki-karbon', expr: 'signatur', text: 'Einsteigen, anschnallen, Klappe halten. Wohin, Fahrgast?' },
        n('Kikis Schwebetaxi riecht nach Ozon und Gummibärchen. Der Gurt ist mit Panzertape geflickt.'),
      ],
      choices: [
        ...taxiChoices(20),
        { text: 'Doch nicht. Ich lauf.', next: 'nein' },
      ],
    },
    {
      id: 'nein',
      lines: [{ speaker: 'kiki-karbon', text: 'Laufen. Wie im Mittelalter. Viel Spaß mit deinen Knien.' }],
    },
  ],
};

const taxiBlitz: DialogueDef = {
  id: 'bahnhof-taxi-blitz',
  start: 'start',
  nodes: [
    {
      id: 'start',
      lines: [
        { speaker: 'herr-blitz', text: 'Schwebetaxi Blitz! Schneller als die U-Bahn – und die U-Bahn ist ja nie da, hehe. Merkwürdig, nicht?' },
        n('Am Armaturenbrett blinkt ein Kasten mit Antenne, der verdächtig nach Störsender aussieht. Eine Lizenz hängt nirgends.'),
      ],
      choices: [
        ...taxiChoices(35),
        { text: '35 Credits? Für ’ne fliegende Blechdose ohne Lizenz? Verpiss dich.', next: 'nein' },
      ],
    },
    {
      id: 'nein',
      lines: [{ speaker: 'herr-blitz', text: 'Lizenz, Lizenz. Ich hab ein Lenkrad. Das reicht vor jedem Gericht. Fast jedem.' }],
    },
  ],
};

// ------------------------------------------------------------------ Karte

const bahnhofMitte: MapDef = {
  id: 'bahnhof-mitte',
  name: 'Bahnhof Mitte',
  subtitle: 'Unterstadt · U-Bahn',
  size: [1536, 1024],
  district: 'unterstadt',
  lighting: 'underground',
  bg: 'bg-bahnhof-mitte',
  station: 'station-bahnhof-mitte',
  ambience: 'unterstadt',
  walk: [
    // Halle, oberer Bahnsteig und linker Hallenarm bis zur Treppe zur Neon-Gasse
    [[22, 268], [1460, 268], [1460, 588], [362, 588], [362, 876], [300, 876], [296, 1024], [142, 1024], [138, 876], [22, 876]],
    // Große Treppe zum Stufenplatz
    box([668, 0, 138, 274]),
    // Taxibucht unter dem Lichtschacht
    box([936, 70, 92, 204]),
    // Tunnelbogen und Gleissteg zur Hafenkante
    [[1440, 356], [1536, 356], [1536, 594], [1446, 594], [1446, 466], [1440, 466]],
    // Inselbahnsteig zwischen den Gleisen (links an den Hallenarm angebunden)
    box([340, 722, 1196, 96]),
  ],
  block: [
    box([10, 298, 152, 222]), // Kiosk
    box([104, 252, 94, 74]), // Ticketautomaten
    box([24, 526, 78, 80]), // Pendlerbank links
    box([60, 614, 80, 60]), // Gitarrenkoffer der Musikerecke
    box([16, 640, 42, 52]), // Kiste
    box([18, 700, 74, 136]), // kaputter Automat
    box([94, 776, 38, 50]), // Mülleimer
    box([262, 436, 56, 60]), box([932, 436, 56, 60]), box([1275, 436, 56, 60]), // Säulen
    box([812, 226, 104, 60]), // Wachhäuschen der Quantum-Kontrolle
    box([690, 212, 32, 68]), box([757, 212, 33, 68]), // Drehsperren
    box([1418, 452, 24, 146]), // Geländer am Gleissteg
    box([503, 760, 20, 32]), box([535, 750, 32, 42]), box([575, 762, 122, 30]), // Laterne, Eimer, Bank
    box([800, 705, 16, 86]), box([1013, 705, 16, 86]), box([868, 762, 90, 26]), // Wartehäuschen
    box([1066, 760, 18, 32]), box([1163, 762, 120, 30]), box([1286, 750, 34, 42]), box([1331, 760, 18, 32]),
  ],
  foreground: [
    { rect: [258, 372, 64, 126], baseY: 496 },
    { rect: [928, 372, 64, 126], baseY: 496 },
    { rect: [1271, 372, 64, 126], baseY: 496 },
    { rect: [796, 700, 236, 100], baseY: 792 },
    { rect: [10, 296, 152, 226], baseY: 520 },
  ],
  exits: [
    { id: 'nach-neon-gasse', rect: [146, 992, 128, 32], to: 'neon-gasse', entry: 'von-bahnhof-mitte', label: 'Treppe zur Neon-Gasse' },
    { id: 'nach-hafenkante', rect: [1500, 360, 36, 232], to: 'hafenkante', entry: 'von-bahnhof-mitte', label: 'Gleissteg zur Hafenkante' },
    {
      id: 'nach-stufenplatz', rect: [672, 0, 130, 36], to: 'stufenplatz', entry: 'von-bahnhof-mitte',
      label: 'Große Treppe zum Stufenplatz', when: TREPPE_OFFEN,
      lockedText: 'Quantum-Kontrolle an der Großen Treppe: „Ausweis, Termin oder Abflug.“',
    },
    { id: 'nach-netzcafe', rect: [266, 236, 60, 56], to: 'netzcafe-datenkruemel', entry: 'von-bahnhof-mitte', label: 'Netzcafé Datenkrümel', interact: true },
    {
      id: 'nach-fundbuero', rect: [1256, 236, 48, 56], to: 'fundbuero', entry: 'von-bahnhof-mitte', label: 'Fundbüro',
      interact: true, when: MORGEN_TAG,
      lockedText: 'Gerda Gleis hat ein Schild ans Glas geklebt: „Verloren: meine Geduld. Morgen wieder.“',
    },
    { id: 'nach-ubahn-wagen', rect: [966, 796, 110, 22], to: 'ubahn-wagen', entry: 'von-bahnhof-mitte', label: 'Stillgelegter U-Bahn-Wagen', interact: true },
  ],
  entries: {
    start: { at: [1030, 566], facing: 'n' },
    station: { at: [1262, 566], facing: 'n' },
    'von-neon-gasse': { at: [208, 948], facing: 'n' },
    'von-hafenkante': { at: [1478, 412], facing: 'w' },
    'von-stufenplatz': { at: [740, 310], facing: 's' },
    'von-netzcafe-datenkruemel': { at: [296, 300], facing: 's' },
    'von-fundbuero': { at: [1280, 302], facing: 's' },
    'von-ubahn-wagen': { at: [990, 806], facing: 'n' },
    taxi: { at: [982, 300], facing: 's' },
  },
  spots: {
    bahnsteig: { at: [900, 548], facing: 's' },
    'bahnsteig-2': { at: [962, 552], facing: 's' },
    'bahnsteig-ende': { at: [1470, 770], facing: 'w' },
    wartehaeuschen: { at: [912, 742], facing: 's' },
    gleise: { at: [560, 566], facing: 's' },
    fotoautomat: { at: [450, 290], facing: 's' },
    musikerecke: { at: [168, 612], facing: 'e' },
    taxistand: { at: [982, 262], facing: 's' },
    'taxistand-blitz': { at: [1064, 300], facing: 's' },
    stellwerk: { at: [1404, 300], facing: 's' },
    paketausgabe: { at: [1222, 298], facing: 's' },
    'kiosk-bahnhof': { at: [196, 420], facing: 'w' },
    pendlerbank: { at: [118, 566], facing: 'e' },
    'fundbuero-schalter': { at: [1180, 290], facing: 'n' },
    ticketautomat: { at: [174, 346], facing: 'n' },
    'treppe-gross': { at: [740, 300], facing: 'n' },
    'oma-turbo-strecke': { at: [700, 430], facing: 'e' },
    'quellen-ecke': { at: [250, 840], facing: 'w' },
    'abzieher-ecke': { at: [420, 768], facing: 'e' },
    'auftrag-a': { at: [1130, 420], facing: 's' },
  },
  hotspots: [
    // --- Händler
    {
      id: 'fotoautomat', at: [450, 284], label: 'Fotoautomat (Fräulein Pixel)', kind: 'shop', shop: 'fraeulein-pixel', when: ABEND_NACHT,
    },
    {
      id: 'fotoautomat-zu', at: [450, 284], label: 'Fotoautomat ansehen', kind: 'look', when: MORGEN_TAG,
      lines: [
        n('Der Vorhang ist zugezogen. Auf einem Pappschild: „Geschlossen. Ich schlafe. Wer klopft, kriegt ein Passfoto mit Doppelkinn.“'),
        n('Aus der Kabine kommt leises Schnarchen und das Summen eines Laminiergeräts.'),
      ],
    },
    {
      id: 'fotoautomat-puzzle', at: [398, 290], label: 'Pixel beim Ausweis helfen', kind: 'use', when: ABEND_NACHT, daily: true,
      lines: [n('Fräulein Pixel schiebt dir ein halbes Gesicht, drei Stempel und ein Hologramm hin. „Mach was draus. Und lass den Daumen vom Laminat.“')],
      effects: [{
        minigame: 'akt-fotoautomat', level: 2, key: 'fotoautomat-ausweis', label: 'Ausweis-Puzzle',
        win: [
          { credits: 30 }, { relation: 'fraeulein-pixel', delta: 10 }, { advanceTime: 20 },
          { message: 'Pixel hält den Ausweis ins Licht. „Sauber. Sieht echter aus als echt. 30 Credits, und kein Wort.“' },
        ],
        lose: [{ advanceTime: 20 }, { message: 'Der Ausweis zeigt jetzt jemanden mit drei Augenbrauen. Pixel: „Kunst. Aber keine, die durch die Kontrolle kommt.“' }],
      }],
    },
    { id: 'ticketautomat', at: [172, 340], label: 'Ticketautomat', kind: 'shop', shop: 'ticketautomat' },
    { id: 'kiosk-bahnhof', at: [176, 410], label: 'Bahnhofskiosk', kind: 'shop', shop: 'kiosk-bahnhof' },

    // --- U-Bahn, Taxi, Treppe, Gleise
    {
      id: 'ubahn-zugang', at: [1150, 574], label: 'U-Bahn (Linie 4)', kind: 'use',
      lines: [
        n('Linie 4. Die Anzeige verspricht „in 3 Minuten“. Das tut sie, laut Kratzspuren im Lack, seit 2071.'),
        n('Mit dem Ticket fährst du zu jeder freigeschalteten Station: Station wählen (oder unterwegs die Stadtkarte, M). Schwarzfahren geht auch. Bis einer kontrolliert.'),
      ],
      effects: [{ cityMap: true }],
    },
    {
      id: 'gleis-abkuerzung', at: [560, 576], label: 'Über die Gleise zur Hafenkante', kind: 'check', check: 'gc-03',
      altText: 'Zu weit, zu tief, zu viel Strom in der Schiene. Der Gleissteg ganz rechts bringt dich auch hin – nur langsamer.',
      effects: [
        { message: 'Du springst in den Gleisgraben, sprintest durch den Tunnel und ziehst dich an der Hafenkante wieder hoch. Hinter dir hupt ein Zug. Zu spät, wie immer.' },
        { travel: 'hafenkante', entry: 'von-bahnhof-mitte', minutes: 5 },
      ],
    },
    {
      id: 'taxistand', at: [982, 236], label: 'Schwebetaxi rufen (Kiki)', kind: 'use', dialogue: 'bahnhof-taxi-kiki',
      when: { hearts: 'kiki-karbon', min: 2 },
    },
    {
      id: 'taxistand-ansehen', at: [982, 236], label: 'Taxistand ansehen', kind: 'look',
      when: { not: { hearts: 'kiki-karbon', min: 2 } },
      lines: [
        n('Eine Landebucht unter einem Lichtschacht, gelbe Pfeile, Ölflecken. Hier landet Kiki Karbon morgens ihr Schwebetaxi.'),
        n('Ein Schild: „Fahrgäste nur nach Vereinbarung. Idioten gar nicht.“ Wer Kiki kennt, fliegt mit.'),
      ],
    },
    {
      id: 'taxistand-blitz', at: [1066, 288], label: '„Schwebetaxi Blitz“ nehmen', kind: 'use', dialogue: 'bahnhof-taxi-blitz',
      when: { all: [{ time: 'tag' }, { not: { quest: 'side-uebliche-verspaetung', state: 'done' } }] },
    },
    {
      id: 'treppe-kontrolle', at: [740, 292], label: 'Quantum-Kontrolle umgehen', kind: 'check', check: TREPPE_CHECK,
      when: { not: TREPPE_OFFEN },
      altText: 'Die Wachen kennen jeden Trick, den du kennst. Erledige erst deine Probezeit bei Hunter – danach winken sie Hunters Leute durch.',
      effects: [
        { setFlag: 'treppe_kontrolle_umgangen' },
        { message: 'Du hängst dich an eine Gruppe Pendler, nickst der Wache zu wie einer alten Bekannten und bist durch. Ab jetzt halten sie dich für die Lieferantin vom Kantinenkaffee.' },
        { travel: 'stufenplatz', entry: 'von-bahnhof-mitte' },
      ],
    },

    // --- Orte zum Ansehen
    {
      id: 'stellwerk', at: [1404, 292], label: 'Stellwerk ansehen', kind: 'look',
      lines: [
        n('Das Stellwerk thront auf Stelzen über der Halle. Vier Uhren, vier verschiedene Uhrzeiten, keine davon stimmt.'),
        n('Hinter der Scheibe ticken vierzehn Stoppuhren an einem Brett. Frau Takt misst alles. Auch, wie lange du hier rumglotzt.'),
      ],
    },
    {
      id: 'musikerecke', at: [168, 650], label: 'Musikerecke ansehen', kind: 'look',
      lines: [
        n('Eine Kiste, ein offener Gitarrenkoffer, darin drei Credits, ein Knopf und ein Zettel: „Für Lio. Spiel mal was Fröhliches. Bitte.“'),
      ],
    },
    {
      id: 'paketausgabe', at: [1236, 290], label: 'Paketausgabe der Kuriere', kind: 'look', when: { not: { playerIs: 'vex' } },
      lines: [
        n('Ein zerbeulter Paketkasten mit Kreidestrichen: jeder Strich eine Lieferung der Schrapnell-Kuriere. Ganz unten ein Spruch: „Pakete bleiben eine Nacht.“'),
      ],
    },
    {
      id: 'paketausgabe-vex', at: [1236, 290], label: 'Paketausgabe der Kuriere', kind: 'look', when: { playerIs: 'vex' },
      lines: [
        n('Dein Kasten. Deine Kreidestriche. Morgens holst du hier die Pakete ab, die sonst keiner anfasst.'),
        { speaker: 'player', text: 'Pakete bleiben eine Nacht. Ich auch nicht länger.' },
      ],
    },
    {
      id: 'fundbuero-schalter', at: [1180, 282], label: 'Fundbüro-Schalter ansehen', kind: 'look',
      lines: [
        n('Hinter der Glasscheibe: eine Tuba, ein Roboterarm, ein Bündel Regenschirme. Ein Aushang: „Gefunden: ein Gebiss. Besitzer bitte lächelnd melden.“'),
      ],
    },
    {
      id: 'zug', at: [880, 578], label: 'U-Bahn ansehen', kind: 'look',
      lines: [
        n('Der Zug sieht aus, als hätte ihn jemand mit dem Kopf voran durch drei Jahrzehnte geschoben. Die Türen schließen mit einem Seufzen.'),
      ],
    },
    {
      id: 'dampfgitter', at: [222, 800], label: 'Dampfgitter', kind: 'look',
      lines: [n('Warmer Dampf steigt aus dem Gitter. Riecht nach Kanal, Bratfett und, ganz entfernt, nach Hoffnung. Nein. Doch nur Kanal.')],
    },
    {
      id: 'muelleimer', at: [114, 842], label: 'Mülleimer', kind: 'look',
      lines: [n('Auf dem Mülleimer klebt ein Aufkleber: „Ich bin ein Roboter. Ich sage Danke.“ Er sagt nichts. Jemand hat ihm die Lautsprecher geklaut.')],
    },
    { id: 'bahnhof-bildschirm', at: [566, 278], label: 'Infobildschirm (Nachrichten)', kind: 'screen' },

    // --- Sammelobjekte (world.md §3.5)
    {
      id: 'neon-tag-05', at: [1478, 376], label: 'Neon-Tag an der Tunnelwand', kind: 'loot', once: true,
      effects: [{ give: 'neon-tag-05' }, { message: 'Ein leuchtendes Tag am Tunnelbogen: ein Blitz mit Zahnspange. Abfotografiert – Neon-Tag 05.' }],
    },
    {
      id: 'glueckstern-07', at: [118, 606], label: 'Etwas glitzert unter der Bank', kind: 'loot', once: true,
      effects: [{ give: 'glueckstern-07' }, { message: 'Unter der Pendlerbank, zwischen Kaugummis aus drei Jahrzehnten: ein Glücksstern. Nummer 07.' }],
    },
    {
      id: 'datenwuerfel-04', at: [1352, 294], label: 'Kasten unter dem Stellwerk', kind: 'loot', once: true,
      effects: [{ give: 'datenwuerfel-04' }, { message: 'Zwischen den Stelzen des Stellwerks klemmt ein Datenwürfel mit Bahnhofs-Archivstempel.' }],
    },
    {
      id: 'jimmy-spur-03', at: [912, 744], label: 'Zeichnung im Wartehäuschen', kind: 'loot', once: true,
      effects: [{ give: 'jimmy-spur-03' }, { message: 'In die Bank geritzt: ein Strichmännchen, das ein Ölfass umarmt. Daneben eine leere Dose Volt-Limo. Jimmys Spur 03.' }],
    },
    {
      id: 'jimmy-spur-04', at: [1500, 772], label: 'Kreidestriche am Bahnsteig-Ende', kind: 'loot', once: true,
      effects: [{ give: 'jimmy-spur-04' }, { message: 'Am Bahnsteig-Ende: Kreidestriche, gezählt bis 412, dann ein Pfeil Richtung Hafen. Jimmys Spur 04.' }],
    },
  ],
  lights: [
    { at: [290, 115], radius: 150, color: '#ff3fd0', intensity: 0.8 }, // Netzcafé-Maus
    { at: [150, 200], radius: 170, color: '#3ef2ff', intensity: 0.6 }, // Bildschirme im Fenster
    { at: [445, 150], radius: 150, color: '#ffc46b', intensity: 0.7 }, // Fotoautomat
    { at: [740, 60], radius: 220, color: '#3ef2ff', intensity: 0.7 }, // Große Treppe
    { at: [862, 236], radius: 120, color: '#cfe8ff', intensity: 0.6 }, // Wachhäuschen
    { at: [980, 90], radius: 200, color: '#ffd66b', intensity: 0.8 }, // Lichtschacht Taxi
    { at: [1180, 190], radius: 170, color: '#ffbe6b', intensity: 0.6 }, // Fundbüro
    { at: [1430, 150], radius: 210, color: '#7dff9a', intensity: 0.55 }, // Stellwerk
    { at: [70, 360], radius: 190, color: '#ffd36b', intensity: 0.7 }, // Kiosk
    { at: [14, 640], radius: 150, color: '#ff3fd0', intensity: 0.7 }, // Neonröhre links
    { at: [290, 430], radius: 200, color: '#ffcf7a', intensity: 0.65 },
    { at: [960, 430], radius: 200, color: '#ffcf7a', intensity: 0.65 },
    { at: [1303, 430], radius: 200, color: '#ffcf7a', intensity: 0.65 },
    { at: [620, 420], radius: 230, color: '#ff4fd8', intensity: 0.45 }, // Neonspiegelung Hallenmitte
    { at: [1150, 470], radius: 230, color: '#3ef2ff', intensity: 0.45 },
    { at: [1478, 400], radius: 140, color: '#ffbe6b', intensity: 0.6 }, // Tunnellampe
    { at: [1480, 530], radius: 130, color: '#3ef2ff', intensity: 0.6 }, // Gleissteg
    { at: [210, 920], radius: 170, color: '#3ef2ff', intensity: 0.8 }, // Treppe Neon-Gasse
    { at: [230, 760], radius: 170, color: '#ff4fd8', intensity: 0.45 },
    { at: [1100, 655], radius: 260, color: '#ffbf6b', intensity: 0.55 }, // Zugfenster
    { at: [512, 745], radius: 150, color: '#ffcf7a', intensity: 0.7 },
    { at: [912, 722], radius: 170, color: '#ffd36b', intensity: 0.75 }, // Wartehäuschen
    { at: [1340, 745], radius: 170, color: '#ffcf7a', intensity: 0.7 },
    { at: [1040, 930], radius: 150, color: '#ffb24a', intensity: 0.8 }, // Kerzenlicht im alten Wagen
    { at: [420, 650], radius: 120, color: '#ff5a3c', intensity: 0.5 }, // Prellbock-Lampe
  ],
  ambient: {
    count: 8,
    bySlot: { morgen: 7, tag: 11, abend: 9, nacht: 4 },
    sprites: [
      'passant-arbeiterin-walk', 'passant-kurier-walk', 'passant-oma-walk', 'passant-anzug-walk',
      'passant-tourist-walk', 'passant-strassenhaendler-walk', 'passant-punk-walk', 'passant-schrotti-walk',
    ],
    routes: [
      [[216, 296], [640, 300], [640, 560], [1400, 560]],
      [[1440, 400], [900, 330], [380, 330], [210, 900]],
      [[740, 300], [740, 410], [220, 540], [208, 960]],
      [[380, 806], [1500, 806]],
      [[1220, 300], [1220, 560], [560, 560], [560, 300]],
      [[1100, 300], [1380, 330], [1456, 560], [1100, 520]],
    ],
    barks: [
      { text: 'Wer hat schon wieder die Laterne geklaut? Die war festgeschraubt!' },
      { text: 'Mutter Brühe sagt, heute gibt’s Suppe. Gestern gab’s auch Suppe.' },
      { text: 'Die Rostzähne haben gestern meinen Schatten erpresst.' },
      { text: 'Spielt jemand Eins? Ich hab nur noch Plus-Vier-Karten.' },
      { text: 'Linie 4 kommt in drei Minuten. Steht da seit Dienstag.' },
      { text: 'Siebenundvierzig Minuten Verspätung? Anfänger. Rekord sind elf Tage.' },
      { text: 'Frau Takt hat mich gestoppt. Mit der Stoppuhr. Ich war zu langsam zum Leben.' },
      { text: 'Ich hab im Fundbüro meinen Ex abgegeben. Den will nicht mal Gerda.' },
      { text: 'Pass auf deine Taschen auf. Und auf deine Nieren.' },
      { text: 'Scheiß Rolltreppe. … Ach so. Ist ja ’ne Treppe.' },
      { text: 'Kaffee. Kaffee. Wo ist der verdammte Kaffee?', when: { time: 'morgen' } },
      { text: 'Ich bin nicht müde. Ich bin nur seit 2079 im Feierabendverkehr.', when: { time: 'morgen' } },
      { text: 'Hier unten ist nachts nur Gesindel. Und ich. Ich bin Gesindel.', when: { time: 'nacht' } },
      { text: 'Pssst. Die zwei Kapuzen da hinten? Geh einfach weiter.', when: { time: ['abend', 'nacht'] } },
      { text: 'Der Fotoautomat hat mir ein Passfoto gemacht. Jetzt heiße ich Doris.', when: { time: ['abend', 'nacht'] } },
      { text: 'Die U-Bahn war pünktlich! Ich bin so verwirrt, ich geh wieder heim.', when: { quest: 'side-uebliche-verspaetung', state: 'done' } },
      { text: 'Mein Nachbar sagt jetzt immer „Ja, Master“. Früher hat er nur gegrunzt.', when: { act: 2 } },
      { text: 'Chrome 10 hier, Chrome 10 da. Ich will einfach nur meine Nougatbombe.', when: { act: 2 } },
      { text: 'Hunters Leute waren hier. Jetzt ist alles ruhiger. Und lauter.', when: { act: 2 } },
      { text: 'Fährt hier echt ein Bus ans Meer?', when: { act: 3 } },
    ],
  },
  onEnter: [
    {
      id: 'bahnhof-mitte-erstbesuch', once: true,
      effects: [{ markSeen: 'zone:bahnhof-mitte' }, { message: 'Bahnhof Mitte. Hier kommt jeder an. Pünktlich keiner.' }],
    },
  ],
};

export const part: ContentPart = {
  maps: { [bahnhofMitte.id]: bahnhofMitte },
  // Station: steht mit Stadtkarten-Lage in world/bezirke-fraktionen.ts.
  dialogues: { [taxiKiki.id]: taxiKiki, [taxiBlitz.id]: taxiBlitz },
};
