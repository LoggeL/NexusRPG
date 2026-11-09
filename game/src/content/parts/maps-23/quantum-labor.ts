// Innenraum Quantum-Labor (world.md §3.5 quantum-campus, §3.6; ID-Plan design/plan/act23.json · pkg-quantum-turm).
// Schauplatz von main-2-bruch (Nexus erwacht, Xion-Kampf, Nyra bleibt zurück, Aria/Proband) und main-3-labor (Nyra holen).
// Die Quest-Hotspots (zentralrechner, chip-tresor, notschalter, nyras-tastatur, pims-notizen) und die Kämpfe legen die
// Quest-Agenten per mapAdditions an den Spots unten an. Diese Karte liefert Geometrie, Spots, Ausgänge, Stimmung und
// Blick-Hotspots, die sich ausblenden, solange die jeweilige Quest dort läuft.
// Figuren (Nyra, Alesa, Pim, Jimmy, Captain Kuschel) kommen über ihre Tagesabläufe (act23.json npcSchedules).
import type { Condition, DialogueDef, DialogueLine, HotspotDef, MapDef, Polygon, Rect } from '../../../modules/contracts';
import type { ContentPart } from '../../part';

const box = ([x, y, w, h]: Rect): Polygon => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
const say = (...texts: string[]): DialogueLine[] => texts.map(text => ({ speaker: 'narrator', text }));

const EPILOG: Condition = { flag: 'epilog' };
const BRUCH: Condition = { quest: 'main-2-bruch', state: 'active' };
const NACH_BRUCH: Condition = { quest: 'main-2-bruch', state: ['done', 'failed'] };
const LABOR3: Condition = { quest: 'main-3-labor', state: 'active' };
const PARTY: Condition = { all: [{ act: 3 }, { notFlag: 'epilog' }] };
/** Kernschacht: ab main-3-nexus (Akt 3) oder im Nachspiel (side-zweite-chance, side-offene-werkstatt). */
const KERNSCHACHT_OFFEN: Condition = { any: [{ quest: 'main-3-nexus', state: ['active', 'done'] }, EPILOG] };

/** Blick-Hotspot in mehreren Fassungen: die erste passende Fassung zählt (die anderen schließen sich per `when` aus). */
function look(id: string, at: [number, number], label: string, variants: { when?: Condition; lines: string[] }[], radius = 60,
  hideWhen?: Condition): HotspotDef[] {
  const out: HotspotDef[] = [];
  const before: Condition[] = [];
  variants.forEach((v, i) => {
    const conds: Condition[] = [...before.map(c => ({ not: c }) as Condition), ...(v.when ? [v.when] : [])];
    out.push({
      id: i === 0 ? id : `${id}-${i + 1}`, at, radius, label, kind: 'look',
      ...(conds.length ? { when: conds.length === 1 ? conds[0] : { all: conds } } : {}),
      ...(hideWhen ? { hideWhen } : {}),
      lines: say(...v.lines),
    });
    if (v.when) before.push(v.when);
  });
  return out;
}

const RACKS_HACK = 'quantum-labor-racks';

const hotspots: HotspotDef[] = [
  ...look('laborfenster', [1140, 350], 'Panzerglas zum Kernschacht', [
    { when: EPILOG, lines: [
      'Jemand hat eine Fototapete mit Bäumen vor das Panzerglas geklebt, damit der Kernschacht nicht so traurig guckt. Durch eine Ecke, die sich löst, siehst du unten den Kern glimmen, wie eine Herdplatte, die jemand vergessen hat.',
      'Auf der Scheibe klebt ein Post-it: „NICHT KLOPFEN. ER SCHLÄFT.“ Darunter, in anderer Schrift: „ER? ES!“ Darunter: „SIE?“',
    ] },
    { when: { quest: 'main-3-nexus', state: 'active' }, lines: [
      'Unten im Schacht pulsiert der Kern, cyan und rot, schneller als vorhin. Das ist kein Herzschlag. Das ist Lampenfieber.',
    ] },
    { lines: [
      'Panzerglas, dick wie ein Telefonbuch. Dahinter ein Schacht, so tief, dass dir schwindelig wird, und ganz unten ein Licht, das atmet.',
      'Das ist kein Server. Das ist ein Gehirn mit Stromrechnung. Und es guckt hoch.',
    ] },
  ], 70),
  ...look('zentralrechner-blick', [775, 305], 'Zentralrechner', [
    { when: EPILOG, lines: [
      'Der Zentralrechner trägt eine Staubschutzhaube mit Quantum-Logo. Jemand hat mit Edding einen Schnurrbart auf das Logo gemalt.',
      'Unter der Haube summt es leise. Vielleicht ein Lüfter. Vielleicht ein Kinderlied.',
    ] },
    { when: NACH_BRUCH, lines: [
      'Der Zentralrechner. Auf dem gebogenen Schirm schwimmt Nexus’ Gesicht aus Lichtpunkten. Als du näher kommst, dreht es sich zu dir.',
      'Zwischen zwei Servertürmen steckt noch der kleine Splitter von Nyras Abschirmstecker. Wie ein Zahn nach der Kneipenschlägerei.',
    ] },
    { lines: [
      'Ein Block aus schwarzem Glas, so groß wie ein Bus, mit einem Bildschirm, der lächelt. Hier denkt Nexus. Laut, wenn man genau hinhört.',
      'Ein Aufkleber an der Seite: „Bitte nicht füttern.“ Darunter jemand mit Kuli: „Womit denn?“',
    ] },
  ], 80, BRUCH),
  ...look('chip-tresor-blick', [195, 300], 'Chip-Tresor', [
    { when: NACH_BRUCH, lines: [
      'Der Chip-Tresor steht offen und leer. Auf dem Boden des Fachs liegt ein Zettel: „Inventur: 1 Chip fehlt. Verdächtige: alle.“',
    ] },
    { lines: [
      'Ein Stahlschrank mit Zahlenrad und Tastenfeld, beides poliert wie ein Siegerpokal. Darin, laut Hunter: der Chip. Und alle Daten. Und dein Gehalt für die nächsten zehn Jahre.',
    ] },
  ], 64, BRUCH),
  ...look('notschalter-blick', [462, 345], 'Roter Notschalter', [
    { when: EPILOG, lines: [
      'Der Notschalter hat jetzt einen Plexiglasdeckel und ein Schild mit Strichmännchen, das den Knopf drückt und danach traurig guckt. Lernkurve.',
    ] },
    { when: { flag: 'notschalter' }, lines: [
      'Ein dicker roter Pilzknopf auf einer gelb-schwarzen Säule. Nyra hat ihn umgelegt: Ein Druck, und Licht, Kameras und Türen gehen schlafen.',
      'Sie hatte recht. Am Ende ist es ein Knopf.',
    ] },
    { lines: [
      'Ein dicker roter Pilzknopf auf einer gelb-schwarzen Säule. NOT-AUS, steht drauf. Er schaltet garantiert irgendwas aus. Wahrscheinlich dich.',
    ] },
  ], 56, BRUCH),
  ...look('op-tisch-blick', [760, 648], 'OP-Tisch', [
    { when: EPILOG, lines: [
      'Der OP-Tisch ist mit einem Laken abgedeckt. Auf dem Laken: Konfetti. Irgendwer hat hier gefeiert, dass hier nie wieder jemand liegen muss.',
    ] },
    { when: { all: [{ flag: 'aria_gechippt' }, { not: LABOR3 }] }, lines: [
      'Der OP-Tisch. Die Fesseln hängen offen herunter. An einer klebt ein schwarzes Haar, an der anderen eine Delle, so groß wie eine Faust.',
      'Hier haben sie Aria den Chip gesetzt. Du merkst, wie du die Zähne zusammenbeißt, bis es knirscht.',
    ] },
    { lines: [
      'Ein OP-Tisch mit zwei weißen Roboterarmen, die über ihm schweben wie Geier mit Händen. Die Lampe darüber ist so hell, dass man sich schuldig fühlt.',
      'An der Seite ein Zettel: „Probandenzufriedenheit: 100 %. (Keine Beschwerden eingegangen.)“',
    ] },
  ], 70, { any: [BRUCH, LABOR3] }),
  ...look('probanden-liege-blick', [1080, 648], 'Probanden-Liege', [
    { when: { flag: 'jimmy_gechippt' }, lines: [
      'Die Probanden-Liege. Ein Kopfhörer voller Kabel, Polster mit Abdrücken. In der Ritze steckt ein Glückschip mit Kratzer. Jimmys. Er lag hier.',
    ] },
    { lines: [
      'Eine zurückgeklappte Liege mit Polsterfesseln und einem Helm voller Kabel. Wie ein Zahnarztstuhl, nur dass hier keiner nach Schmerzen fragt.',
      'Am Fußende ein Klemmbrett: „Proband Nr. 214. Name: unwichtig.“',
    ] },
  ], 64, { any: [BRUCH, LABOR3] }),
  ...look('nyras-schreibtisch', [330, 790], 'Schreibtisch mit drei Bildschirmen', [
    { when: EPILOG, lines: [
      'Nyras alter Platz ist leer geräumt. Nur ein Wellen-Sticker klebt noch am Monitor, zu fest, um ihn abzukriegen. Sie hat ihn absichtlich dagelassen. Garantiert.',
    ] },
    { when: { flag: 'nyra_zurueckgelassen' }, lines: [
      'Drei Bildschirme, eine Tastatur mit abgewetzten Tasten, Energydrinks in Pyramidenform. Auf einem Post-it in winziger Schrift: „Dinge, die ich am Meer mache: 1. Gucken.“',
      'Der Stuhl ist noch warm. Oder du bildest dir das ein. Beides tut weh.',
    ] },
    { lines: [
      'Ein leerer Arbeitsplatz mit drei Bildschirmen und einem Namensschild ohne Namen. Quantum stellt die Möbel schon mal hin. Die Menschen kommen dann von allein.',
    ] },
  ], 64, { any: [LABOR3, { all: [BRUCH, { flag: 'nexus_erwacht' }] }] }),
  ...look('alesas-pult-blick', [1325, 640], 'Alesas Pult', [
    { when: EPILOG, lines: [
      'Alesas Pult ist leer bis auf eine Kiste mit der Aufschrift „Nullpunkt“ und einem Feuerlöscher, der aussieht, als hätte er Angst.',
    ] },
    { lines: [
      'Ein Stehpult mit schwebenden Holo-Tafeln voller Formeln. Mittendrin eine Kritzelei: ein kleiner Roboter, der eine Blume hält. Er brennt ein bisschen.',
      'Darunter, sehr ordentlich: „Projekt Zündholz – nicht anfassen. Nicht. Anfassen.“',
    ] },
  ], 64, LABOR3),
  ...look('pims-werkbank-blick', [1230, 755], 'Pims Werkbank', [
    { lines: [
      'Pinzetten, nach Größe sortiert. Schraubenzieher, nach Größe sortiert. Ein Notizblock, beschrieben in einer Schrift so winzig, dass sie vermutlich Steuern spart.',
      'Du kneifst die Augen zusammen. Du erkennst das Wort „Mikrokäfer“. Und ein Herz. Oder eine Lötstelle.',
    ] },
  ], 60, { quest: 'pers-pim-kleine-schrift', state: 'active' }),
  ...look('labortuer', [772, 915], 'Labortür zum Flur', [
    { when: EPILOG, lines: ['Die Labortür steht auf Dauer-Auf. Draußen auf dem Flur hängt ein Schild in Kinderschrift: „Hier gehts zur Offenen Werkstatt →“'] },
    { lines: [
      'Die Schiebetür zum Flur. Dahinter Kameras, Wachleute und ein Kaffeeautomat, der verdächtig freundlich piept. Da willst du nicht raus.',
      'Daneben ein Schild mit einem Strichmännchen, das sich die Hände wäscht. Wenigstens die Toilette ist ausgeschildert. Gut zu wissen.',
    ] },
  ], 64, LABOR3),
  ...look('sicherheitstuer', [1430, 450], 'Sicherheitstür', [
    { when: NACH_BRUCH, lines: [
      'Die Sicherheitstür hat jetzt vier tiefe Kratzer auf Brusthöhe. Xions Kralle. Jemand hat mit Edding daneben geschrieben: „Ich bin nicht dumm.“ Die Handschrift ist erstaunlich schön.',
    ] },
    { lines: [
      'Eine schwere graue Tür mit roter Warnlampe. Dahinter der Sicherheitsflur. Wenn die Lampe angeht, wird es hier sehr schnell sehr eng.',
    ] },
  ], 60, BRUCH),
  {
    id: 'kernschacht-tuer', at: [1375, 255], radius: 60, label: 'Runde Tür mit Rad', kind: 'look', when: { not: KERNSCHACHT_OFFEN },
    lines: say('Eine runde Stahltür mit einem Rad wie bei einem U-Boot, gelb-schwarz umrahmt. Dahinter brummt etwas, das sehr viel denkt.',
      'Das Rad bewegt sich keinen Millimeter. Entweder braucht man einen Code, oder einen sehr guten Grund.'),
  },
  {
    id: 'ausschuss-tonne', at: [1420, 690], radius: 52, label: 'Tonne „Ausschuss“ durchwühlen', kind: 'loot', once: true,
    when: { act: 2 },
    lines: say('Eine Tonne mit Biogefahr-Symbol. Darin: Handschuhe, Kaffeebecher und zwei Chips, die beim Test „versagt“ haben. Sie glimmen beleidigt.',
      'Dante kann daraus was bauen. Dante kann aus allem was bauen. Einmal aus einem Toaster ein Liebesgedicht.'),
    effects: [{ give: 'quantum-chip-schrott', qty: 2 }, { message: '2 × Quantum-Chip-Schrott eingesteckt' }],
  },
  {
    id: 'labor-racks', at: [130, 700], radius: 60, label: 'Serverracks anzapfen', kind: 'use',
    hideWhen: { wonMinigame: RACKS_HACK },
    lines: say('Ein Rack mit blinkenden Lichtern und einer Wartungsbuchse, die genau so groß ist wie dein Daumen. Oder wie ein Dietrich-Kabel.'),
    effects: [{
      minigame: 'akt-hacken', level: 4, key: RACKS_HACK, label: 'Quantum-Serverrack',
      win: [{ credits: 180 }, { xp: 40 }, { message: 'Du leitest die Spesenkasse der Forschungsabteilung um. 180 Credits. „Kaffee für Probanden“ – den gab es eh nie.' }],
      lose: [{ message: 'Das Rack piept dreimal und zeigt dir ein Smiley mit Augenbrauen. Wütenden Augenbrauen. Nochmal.' }],
    }],
  },
  {
    id: 'labor-racks-blick', at: [130, 700], radius: 60, label: 'Serverracks', kind: 'look', when: { wonMinigame: RACKS_HACK },
    lines: say('Die Racks blinken unschuldig. Irgendwo in der Buchhaltung fehlen 180 Credits. Irgendwo in der Unterstadt gibt es heute Nudeln.'),
  },
  {
    id: 'kittelhaken', at: [640, 910], radius: 52, label: 'Kittelhaken', kind: 'loot', once: true,
    when: { any: [{ act: 3 }, EPILOG] },
    lines: say('Am Haken neben der Tür hängt ein nagelneuer Laborkittel, noch mit Etikett. Größe: „Genie“. Den vermisst keiner. Alesa vielleicht. Die würde sich bestimmt freuen, wenn ihn jemand vorbeibringt.'),
    effects: [{ give: 'laborkittel-neu' }],
  },
  {
    id: 'wasserspender', at: [1045, 345], radius: 48, label: 'Wasserspender', kind: 'use', daily: true,
    lines: say('Gefiltertes Oberstadt-Wasser, mit einem Hauch Gurke. Es schmeckt nach Geld. Du trinkst zwei Becher aus Trotz.'),
    effects: [{ heal: 10 }],
  },
];

const labor: MapDef = {
  id: 'quantum-labor',
  name: 'Quantum-Labor',
  subtitle: 'Quantum-Campus · Turm',
  size: [1536, 1024],
  district: 'oberstadt',
  lighting: 'indoor',
  bg: 'bg-quantum-labor',
  // Bruch und Laborbefreiung in der Partynacht: Schleichmusik.
  musicWhen: [{ when: { any: [BRUCH, { quest: 'main-3-labor', state: 'active' }] }, music: 'schleichen' }],
  bgVariants: [
    { when: EPILOG, bg: 'bg-quantum-labor-leer' },
    { when: { all: [BRUCH, { flag: 'nexus_erwacht' }] }, bg: 'bg-quantum-labor-bruch' },
  ],
  walk: [[[70, 225], [1462, 225], [1462, 925], [850, 925], [850, 1000], [695, 1000], [695, 925], [70, 925]]],
  block: [
    box([575, 150, 405, 125]), // Zentralrechner mit Kabelsockeln
    box([62, 222, 100, 125]), // Chip-Tresor
    box([432, 228, 60, 92]), // Notschalter-Säule
    box([62, 470, 50, 120]), // Leiter unter dem Lüftungsgitter
    box([40, 588, 70, 230]), // Serverracks
    box([222, 490, 305, 110]), // Laborbank
    box([585, 470, 335, 150]), // OP-Tisch mit Roboterarmen
    box([1000, 450, 160, 170]), // Probanden-Liege
    box([1270, 470, 110, 140]), // Alesas Pult
    box([1015, 225, 250, 105]), // Wasserspender, Pflanze, Instrumentenwagen
    box([1435, 640, 35, 80]), // Ausschuss-Tonne
    box([158, 815, 312, 112]), // Nyras Schreibtisch mit Stuhl
    box([1075, 780, 312, 147]), // Pims Werkbank
  ],
  exits: [
    { id: 'nach-quantum-foyer', rect: [120, 150, 125, 90], to: 'quantum-foyer', entry: 'von-quantum-labor', label: 'Laboraufzug nach oben', interact: true, minutes: 5 },
    { id: 'lueftung', rect: [55, 395, 80, 105], to: 'quantum-campus', entry: 'lueftungsschacht', label: 'Lüftungsschacht (raus)', interact: true, minutes: 15 },
    {
      id: 'kernschacht', rect: [1310, 150, 130, 90], to: 'server-kern', entry: 'von-quantum-labor', label: 'Kernschacht (Serverkern)', interact: true,
      when: KERNSCHACHT_OFFEN, minutes: 5,
      lockedText: 'Eine runde Tür mit Rad. Dahinter brummt etwas, das sehr viel denkt.',
    },
  ],
  entries: {
    'von-quantum-foyer': { at: [182, 262], facing: 's' },
    lueftung: { at: [165, 520], facing: 'e' },
    'von-server-kern': { at: [1375, 265], facing: 's' },
  },
  spots: {
    'aufzug-labor': { at: [182, 262], facing: 's' },
    lueftungsgitter: { at: [160, 450], facing: 'w' },
    zentralrechner: { at: [775, 305], facing: 'n' },
    'chip-tresor': { at: [195, 300], facing: 'w' },
    notschalter: { at: [462, 345], facing: 'n' },
    'op-tisch': { at: [760, 648], facing: 'n' },
    'probanden-liege': { at: [1080, 648], facing: 'n' },
    'nyras-arbeitsplatz': { at: [300, 798], facing: 's' },
    'kuschel-ablage': { at: [440, 800], facing: 's' },
    'alesas-pult': { at: [1325, 640], facing: 'n' },
    'pims-werkbank': { at: [1230, 755], facing: 's' },
    labortuer: { at: [772, 915], facing: 's' },
    'xion-tuer': { at: [1430, 450], facing: 'e' },
    kernschacht: { at: [1375, 255], facing: 'n' },
    laborfenster: { at: [1140, 350], facing: 'n' },
  },
  hotspots,
  foreground: [{ rect: [575, 310, 360, 165], baseY: 625 }],
  lights: [
    { at: [775, 150], radius: 260, color: '#3ef2ff', intensity: 0.6 },
    { at: [760, 420], radius: 200, color: '#e8f6ff', intensity: 0.45 },
    { at: [1140, 150], radius: 180, color: '#b06bff', intensity: 0.45 },
    { at: [1490, 380], radius: 120, color: '#ff3a4a', intensity: 0.45 },
    { at: [330, 830], radius: 150, color: '#46b8ff', intensity: 0.5 },
    { at: [1325, 470], radius: 150, color: '#7fe8ff', intensity: 0.4 },
    { at: [1375, 150], radius: 110, color: '#ffc24a', intensity: 0.3 },
  ],
  ambient: {
    count: 0,
    sprites: ['passant-anzug-walk', 'passant-arbeiterin-walk'],
    bySlot: { morgen: 1, tag: 2, abend: 0, nacht: 0 },
    routes: [
      [[772, 900], [772, 690], [560, 680], [300, 680], [600, 380]],
      [[182, 280], [600, 370], [960, 380], [1240, 690], [900, 720]],
    ],
    barks: [
      { text: 'Haben Sie Ihren Laborausweis? Ich frage nur, weil Sie keinen Laborausweis haben.', when: { notFlag: 'epilog' } },
      { text: 'Nexus hat mir heute „Guten Morgen“ gesagt. Ich hab nicht gefragt.', when: { notFlag: 'epilog' } },
      { text: 'Ich kann die Releaseparty kaum erwarten. Ich weiß nur nicht mehr, warum.', when: { all: [{ act: 2 }, { notFlag: 'epilog' }] } },
      { text: 'Ich decke jetzt seit drei Tagen Geräte ab. Ich glaube, die Geräte sind dankbar.', when: EPILOG },
      { text: 'Ich hab heute selbst Kaffee gekocht. Er war furchtbar. Ich bin so stolz.', when: EPILOG },
    ],
  },
  ambience: 'labor',
  music: 'quantum-labor',
  onEnter: [
    // Beim Bruch erzählt main-2-bruch die Ankunft selbst.
    { id: 'quantum-labor-ankunft', once: true, when: { all: [{ not: PARTY }, { not: BRUCH }, { not: EPILOG }] }, dialogue: 'quantum-labor-ankunft', effects: [{ markSeen: 'quantum-labor-betreten' }] },
    // Beim Einlass über die Lüftung erzählt main-3-einlass selbst; sonst ein Satz zur Partynacht.
    { id: 'quantum-labor-partynacht', once: true, when: { all: [PARTY, { not: { quest: 'main-3-einlass', state: 'active' } }] }, dialogue: 'quantum-labor-partynacht' },
    { id: 'quantum-labor-nachspiel', once: true, when: EPILOG, dialogue: 'quantum-labor-nachspiel' },
  ],
  fastTravel: { to: 'quantum-foyer', entry: 'von-quantum-labor' },
};

const DIALOGUES: Record<string, DialogueDef> = {
  'quantum-labor-ankunft': {
    id: 'quantum-labor-ankunft', start: 'a',
    nodes: [{
      id: 'a',
      lines: [
        { speaker: 'narrator', text: 'Das Quantum-Labor. Weißer Boden, so sauber, dass man sich darin rasieren könnte. Es riecht nach Desinfektionsmittel und schlechtem Gewissen.' },
        { speaker: 'narrator', text: 'In der Mitte ein OP-Tisch mit Roboterarmen, hinten ein Rechner, so groß wie ein Bus, mit einem Gesicht aus Licht. Das Gesicht schläft. Hoffentlich.' },
        { speaker: 'player', text: 'Okay. Nichts anfassen, was blau leuchtet. Also … nichts anfassen.' },
      ],
    }],
  },
  'quantum-labor-partynacht': {
    id: 'quantum-labor-partynacht', start: 'a',
    nodes: [{
      id: 'a',
      lines: [
        { speaker: 'narrator', text: 'Durch die Decke wummert der Bass der Releaseparty. Die Reagenzgläser auf der Laborbank tanzen mit. Unpassend fröhlich.' },
        { speaker: 'narrator', text: 'Oben trinken sie Champagner. Hier unten riecht es immer noch nach Desinfektion und nach dem Abend, an dem ihr Nyra zurücklassen musstet.' },
      ],
    }],
  },
  'quantum-labor-nachspiel': {
    id: 'quantum-labor-nachspiel', start: 'a',
    nodes: [{
      id: 'a',
      lines: [
        { speaker: 'narrator', text: 'Das Labor ist still. Die Geräte stecken unter weißen Hauben wie Möbel in einem Haus, in dem keiner mehr wohnt.' },
        { speaker: 'narrator', text: 'Auf dem Boden liegt Konfetti. Viel Konfetti. Niemand weiß, woher. Niemand fegt es weg.' },
      ],
    }],
  },
};

export const part: ContentPart = { maps: { 'quantum-labor': labor }, dialogues: DIALOGUES };
