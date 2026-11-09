// Innenraum High Voltage (world.md §3.5/§3.6/§3.9, Plan design/plan/act1.json maps.high-voltage, Paket pkg-neon-gasse).
// Hunters Club: Bar mit Mixi, Bühne mit Moderatorenpult, DJ-Pult, Tanzfläche, Ecktisch (Armdrücken), Kartentisch,
// Stammtische, Jukebox-Ecke, Frühstückstisch, Personaltreppe zum Crew-Quartier, Tür zum Hinterzimmer.
// Koordinaten am fertigen Bild game/public/assets/bg/high-voltage.webp (1536×1024) nachgezogen.
import type { Condition, DialogueDef, DialogueLine, MapDef, Polygon, Rect } from '../../../modules/contracts';
import type { ContentPart } from '../../part';

const box = ([x, y, w, h]: Rect): Polygon => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
const n = (text: string): DialogueLine => ({ speaker: 'narrator', text });
const ich = (text: string): DialogueLine => ({ speaker: 'player', text });

const V: Condition = { playerIs: 'vex' };
const PROBEZEIT_DONE: Condition = { quest: 'main-1-probezeit', state: 'done' };
const ABEND_NACHT: Condition = { time: ['abend', 'nacht'] };
const POSTER_VEX: Condition = { all: [V, { seen: 'rom-vexaria-oberlicht' }] };
/** Erster Morgen nach rom-vexaria-licht/-morgen: die Crew am Frühstückstisch (einmalig). */
const FRUEHSTUECK_DANACH: Condition = {
  all: [{ seen: 'rom-vexaria-morgen' }, { time: 'morgen' }, { not: { seen: 'fruehstueck-danach' } }],
};

// ---------------------------------------------------------------------------------------------------- Dialoge

const ecktischLook: DialogueDef = {
  id: 'hv-ecktisch',
  start: 'start',
  nodes: [
    {
      id: 'start',
      lines: [
        n('Der Ecktisch. Rotes Leder, ein Brandloch pro Sitzplatz, eine Armdrückmatte mit zwei Ellbogendellen, tief wie Schlaglöcher.'),
        n('In die Tischplatte sind Namen geritzt. Die meisten durchgestrichen. Ganz oben, frisch: „ARIA – UNGESCHLAGEN“. Darunter, noch frischer und mit anderem Messer: „noch“.'),
      ],
      choices: [
        { text: '(Mit dem Finger über das „noch“ fahren.)', when: V, next: 'vex' },
        { text: 'Lieber nicht anfassen. Klebt.' },
      ],
    },
    {
      id: 'vex',
      lines: [
        ich('Das „noch“ ist von mir. Mit dem Schraubenzieher vom Ratenarm. Sie hat drei Tage gebraucht, um es zu merken, und dann einen ganzen Abend lang so getan, als wär’s ihr egal.'),
        n('Es war ihr nicht egal. Sie hat beim nächsten Armdrücken deine Hand ein bisschen zu lange festgehalten, nachdem sie gewonnen hatte.'),
      ],
    },
  ],
};

const tanzLook: DialogueDef = {
  id: 'hv-tanzflaeche',
  start: 'start',
  nodes: [
    {
      id: 'start',
      lines: [n('Die Tanzfläche pulsiert pink und cyan. Unter den Kacheln summt etwas, das definitiv nicht vom TÜV abgenommen ist.')],
      choices: [
        { text: '(An die letzte Nacht hier denken.)', when: { all: [V, { seen: 'rom-vexaria-tanz' }] }, next: 'erinnerung' },
        { text: 'Weitergehen.' },
      ],
    },
    {
      id: 'erinnerung',
      lines: [
        n('Langsamer Song, falsche Kachel, Arias Hand flach auf deinem Rücken unter dem Gurtzeug, als würde sie prüfen, ob dein Herz wirklich so rast oder ob du bluffst.'),
        ich('Ich hab nicht geblufft. Sie wusste das. Hat trotzdem nachgefühlt. Gründlich.'),
      ],
    },
  ],
};

// ---------------------------------------------------------------------------------------------------- Karte

const club: MapDef = {
  id: 'high-voltage',
  name: 'High Voltage',
  subtitle: 'Hunters Club',
  size: [1536, 1024],
  district: 'unterstadt',
  lighting: 'indoor',
  bg: 'bg-high-voltage',
  walk: [[
    [245, 212], [300, 212], [300, 272], [760, 272], [762, 248], [1060, 246], [1060, 206], [1156, 206], [1156, 240],
    [1362, 240], [1366, 528], [1404, 528], [1404, 776], [1526, 776], [1526, 802], [816, 802], [816, 874], [664, 874],
    [664, 802], [22, 802], [22, 780], [178, 774], [212, 724], [276, 702], [276, 300], [245, 280],
  ]],
  block: [
    [[1190, 226], [1338, 226], [1338, 334], [1190, 334]], // Kartentisch mit Stühlen
    box([1214, 394, 150, 118]), // Tisch Vega/Aria
    box([1248, 584, 144, 128]), // Tisch rechts unten
  ],
  exits: [
    { id: 'nach-neon-gasse', rect: [664, 834, 152, 44], to: 'neon-gasse', entry: 'von-high-voltage', label: 'Raus in die Gasse', interact: true },
    {
      id: 'nach-hv-hinterzimmer', rect: [1060, 196, 96, 46], to: 'hv-hinterzimmer', entry: 'von-high-voltage', label: 'Hinterzimmer', interact: true,
      when: { any: [{ flag: 'probezeit_gespraech' }, PROBEZEIT_DONE] },
      lockedText: 'Hunter, ohne aufzusehen: „Personal. Bist du Personal? Eben.“',
    },
    {
      id: 'nach-crew-quartier', rect: [1420, 740, 104, 50], to: 'crew-quartier', entry: 'von-high-voltage', label: 'Personaltreppe: Crew-Quartier', interact: true,
      when: PROBEZEIT_DONE,
      lockedText: 'Der Barkeeper stellt sich wortlos vor die Treppe. Das reicht.',
    },
  ],
  entries: {
    'von-neon-gasse': { at: [740, 790], facing: 'n' },
    'von-hv-hinterzimmer': { at: [1108, 262], facing: 's' },
    'von-crew-quartier': { at: [1430, 790], facing: 'w' },
  },
  spots: {
    tresen: { at: [292, 420], facing: 'w' },
    'tresen-ende': { at: [292, 640], facing: 'w' },
    kasse: { at: [290, 580], facing: 'w' },
    'mixi-ecke': { at: [262, 232], facing: 'w' },
    'bar-hocker': { at: [250, 470], facing: 'e' },
    ecktisch: { at: [1350, 248], facing: 'n' },
    kartentisch: { at: [1265, 348], facing: 'n' },
    tanzflaeche: { at: [735, 500], facing: 's' },
    buehne: { at: [505, 286], facing: 's' },
    moderatorenpult: { at: [725, 276], facing: 's' },
    'dj-pult': { at: [915, 256], facing: 's' },
    'vega-aria-tisch': { at: [1200, 452], facing: 'e' },
    'vega-aria-tisch-2': { at: [1290, 522], facing: 'n' },
    'laptop-ecke': { at: [312, 792], facing: 's' },
    'sitzecke-gaeste': { at: [1000, 792], facing: 's' },
    'dexter-tisch': { at: [1320, 574], facing: 's' },
    'pfeffer-tisch': { at: [485, 792], facing: 's' },
    stammtisch: { at: [1232, 646], facing: 'e' },
    'oldie-ecke': { at: [115, 790], facing: 'n' },
    fruehstueckstisch: { at: [1285, 794], facing: 's' },
    'begleiter-brett': { at: [1352, 520], facing: 'e' },
    eingang: { at: [740, 760], facing: 'n' },
    personaltreppe: { at: [1440, 770], facing: 'e' },
  },
  hotspots: [
    { id: 'hv-bar', at: [262, 420], radius: 66, label: 'Bar (Getränke, Geschenke)', kind: 'shop', shop: 'hv-bar' },
    {
      id: 'barschicht', at: [262, 340], radius: 60, label: 'Schicht hinter der Bar', kind: 'use',
      when: { all: [{ time: 'abend' }, { not: { weekday: 'mo' } }, PROBEZEIT_DONE] },
      lines: [{ speaker: 'barkeeper', text: 'Schürze. Lappen. Lächeln optional. Wer Gläser fallen lässt, zahlt in Würde.' }],
      effects: [{
        minigame: 'akt-barschicht', level: 2, key: 'akt-barschicht', label: 'Schicht hinter der Bar',
        win: [{ credits: 40 }, { xp: 20 }, { rep: 'crew-hunter', delta: 1 }, { message: 'Schicht geschafft: 40 Cr plus Trinkgeld. Der Richter hat „was Unauffälliges“ bestellt und es in einem Zug geleert.' }],
        lose: [{ credits: 15 }, { message: 'Zwei Gläser, ein Tablett, eine Würde. Der Barkeeper zahlt dir trotzdem 15 Cr. Mitleid ist auch eine Währung.' }],
      }],
    },
    {
      id: 'karaoke', at: [505, 290], radius: 64, label: 'Karaoke singen', kind: 'use',
      when: { all: [{ weekday: ['di', 'fr'] }, { time: 'nacht' }] },
      effects: [{
        minigame: 'akt-karaoke', level: 2, key: 'akt-karaoke', label: 'Karaoke',
        win: [{ rep: 'crew-hunter', delta: 2 }, { xp: 20 }, { message: 'Applaus! Jemand wirft einen BH auf die Bühne. Es ist Captain Kuschels. Er will ihn wiederhaben.' }],
        lose: [{ message: 'Du triffst jeden Ton – nur leider die falschen. Hunter hält sich die Ohren zu und klatscht trotzdem. Loyalität.' }],
      }],
    },
    {
      id: 'karaoke-aus', at: [505, 290], radius: 64, label: 'Bühne ansehen', kind: 'look',
      when: { not: { all: [{ weekday: ['di', 'fr'] }, { time: 'nacht' }] } },
      lines: [n('Ein Mikro, zwei Boxen, ein Vorhang, der schon mehr Peinlichkeiten gesehen hat als ein Ripperdoc. Karaoke ist dienstags und freitags nachts.')],
    },
    {
      id: 'tanzflaeche', at: [735, 480], radius: 90, label: 'Tanzen', kind: 'use',
      when: { all: [{ weekday: ['fr', 'sa'] }, { time: 'nacht' }] },
      effects: [{
        minigame: 'akt-tanz', level: 2, key: 'akt-tanz', label: 'Tanzfläche',
        win: [{ xp: 20 }, { setFlag: 'tanzstufe_1' }, { message: 'Du triffst den Beat. DJ Lumo nickt dir zu. Bei DJ Lumo ist das ein Heiratsantrag.' }],
        lose: [{ message: 'Deine Beine tanzen, dein Rhythmus guckt zu.' }],
      }],
    },
    {
      id: 'tanzflaeche-look', at: [735, 480], radius: 90, label: 'Tanzfläche ansehen', kind: 'look', dialogue: 'hv-tanzflaeche',
      when: { not: { all: [{ weekday: ['fr', 'sa'] }, { time: 'nacht' }] } },
    },
    {
      id: 'armdruecken', at: [1340, 244], radius: 60, label: 'Armdrücken am Ecktisch', kind: 'use',
      when: { time: 'abend' },
      effects: [{
        minigame: 'akt-armdruecken', level: 2, key: 'akt-armdruecken', label: 'Armdrücken',
        win: [{ credits: 40 }, { xp: 15 }, { message: 'Der Arm deines Gegners knallt auf die Matte. Am Ecktisch wird anerkennend in Gläser gegrunzt. +40 Cr.' }],
        lose: [{ message: 'Dein Handrücken küsst die Matte. Der Ecktisch lacht. Nicht böse. Nur laut.' }],
      }],
    },
    {
      id: 'ecktisch', at: [1340, 244], radius: 60, label: 'Ecktisch ansehen', kind: 'look', dialogue: 'hv-ecktisch',
      when: { not: { time: 'abend' } },
    },
    {
      id: 'eins-kartentisch', at: [1265, 344], radius: 60, label: 'Eins! spielen', kind: 'use',
      when: ABEND_NACHT,
      effects: [{
        minigame: 'akt-eins', level: 2, key: 'akt-eins-hv', label: 'Eins! am Kartentisch',
        win: [{ credits: 25 }, { xp: 15 }, { message: '„Eins!“ – und der Tisch flucht kollektiv. +25 Cr.' }],
        lose: [{ message: 'Plus vier. Plus vier. Plus vier. Irgendwer hier spielt mit gezinkten Karten, und es bist nicht du.' }],
      }],
    },
    {
      id: 'mixi', at: [210, 205], radius: 60, label: 'Mixi reparieren', kind: 'check', check: 'gc-71',
      when: { quest: 'side-neon-limo', state: 'active' }, hideWhen: { flag: 'mixi_repariert' },
      lines: [n('Mixi, der Mixroboter, gluckert traurig. Sein Rührarm zuckt, der Sirupschlauch tropft auf den Boden wie ein Robo mit Liebeskummer.')],
      effects: [
        { setFlag: 'mixi_repariert' }, { xp: 20 },
        { message: 'Mixi rattert, rülpst und mischt die perfekte Neon-Limo. Ab jetzt redet er ununterbrochen. Das ist der Preis.' },
      ],
      altText: 'Zu viele Schläuche, zu wenig Technik. Oma Volt kennt ein Familienrezept, und in der Fundkammer liegt angeblich eine Rezeptkarte.',
    },
    {
      id: 'mixi-look', at: [210, 205], radius: 60, label: 'Mixi ansehen', kind: 'look',
      when: { not: { quest: 'side-neon-limo', state: 'active' } },
      lines: [n('Mixi, der Mixroboter: ein Glaskopf voller pinkem Sirup auf einem Kupferbauch. Er summt beim Mischen. Manchmal summt er auch, wenn er nicht mischt. Dann hat er Gefühle.')],
    },
    { id: 'hv-tv', at: [1350, 272], radius: 60, label: 'Fernseher (Nachrichten)', kind: 'screen' },
    {
      id: 'begleiter-brett', at: [1352, 500], radius: 64, label: 'Crew-Brett', kind: 'look',
      lines: [
        n('Ein Korkbrett mit Dienstplan, Schulden-Liste und einem Polaroid, auf dem Aria Vega Hasenohren macht. Vega guckt, als würde sie es wissen.'),
        n('(Wen du mitnimmst, regelst du über das Crew-Menü. Wer gerade frei ist, hängt hier im Club oder auf dem Dach rum.)'),
      ],
    },
    {
      id: 'kabelbrand-poster', at: [1386, 548], radius: 60, label: 'Kabelbrand-Tourplakat 2081', kind: 'look',
      when: { not: POSTER_VEX },
      lines: [
        n('Ein Tourplakat: Totenkopf, zwei Blitze, „Kabelbrand – Abschied 2081“. Die Ecken sind mit Klebeband geflickt, das Klebeband mit Klebeband.'),
        { speaker: 'aria', text: 'Fass das an, und ich brech dir jeden Finger einzeln. In alphabetischer Reihenfolge.' },
      ],
    },
    {
      id: 'kabelbrand-poster-vex', at: [1386, 548], radius: 60, label: 'Kabelbrand-Tourplakat 2081', kind: 'look',
      when: POSTER_VEX,
      lines: [
        n('Abschied 2081. Das Konzert, bei dem du mit Kas auf dem Oberlicht lagst. Das Konzert, bei dem unten jemand geschrien hat.'),
        ich('Sie hat das Ding seitdem hängen lassen. Ich auch. Jetzt wissen wir beide, warum.'),
      ],
    },
    {
      id: 'jukebox', at: [115, 790], radius: 60, label: 'Jukebox', kind: 'look',
      lines: [n('Die Jukebox spielt nur noch drei Lieder, alle von Opa Gustavs Lieblingsband. Ein Credit pro Lied, zwei, wenn du willst, dass sie aufhört.')],
    },
    {
      id: 'fruehstueckstisch', at: [1285, 790], radius: 64, label: 'Frühstückstisch', kind: 'look',
      when: { not: FRUEHSTUECK_DANACH },
      lines: [n('Der lange Tisch, an dem die Crew frühstückt. Brandflecken, Kaffeeringe und ein eingeritztes „VEGA HAT ANGEFANGEN“. Vega hat definitiv angefangen.')],
    },
    {
      id: 'fruehstueck-danach', at: [1285, 790], radius: 64, label: 'Frühstück mit der Crew', kind: 'look',
      when: FRUEHSTUECK_DANACH, once: true,
      lines: [
        n('Du kommst rein, und der ganze Tisch verstummt gleichzeitig. Fünf Leute heben fünf Kaffeebecher. Niemand trinkt.'),
        { speaker: 'hunter', text: 'Na? Gut geschlafen? Oder überhaupt?' },
        { speaker: 'ripper', text: 'Sind alle Implantate noch dran? Ich frag aus medizinischen Gründen. Und aus Neid.' },
        { speaker: 'aria', text: 'Noch ein Wort, und ich schütte euch den Kaffee in die Hosen. Alle. Nacheinander. Langsam.', expr: 'verlegen' },
        n('Sie trägt deinen Pulli. Der ganze Tisch sieht es. Keiner sagt was. Der Barkeeper stellt dir wortlos einen doppelten Espresso hin.'),
      ],
    },
  ],
  lights: [
    { at: [735, 500], radius: 380, color: '#ff3fd0', intensity: 0.5 },
    { at: [735, 500], radius: 260, color: '#3ef2ff', intensity: 0.35 },
    { at: [500, 60], radius: 260, color: '#ff5fd0', intensity: 0.6 },
    { at: [915, 110], radius: 200, color: '#3ef2ff', intensity: 0.7 },
    { at: [765, 55], radius: 140, color: '#c7a8ff', intensity: 0.5 },
    { at: [165, 160], radius: 150, color: '#ff3fd0', intensity: 0.6 },
    { at: [120, 860], radius: 140, color: '#ffb347', intensity: 0.6 },
    { at: [1350, 70], radius: 200, color: '#ffbf6b', intensity: 0.5 },
    { at: [1470, 270], radius: 120, color: '#3ef2ff', intensity: 0.5 },
    { at: [740, 900], radius: 150, color: '#ff3fa4', intensity: 0.5 },
    { at: [1110, 55], radius: 90, color: '#ff4040', intensity: 0.6 },
  ],
  ambient: {
    count: 0,
    sprites: ['passant-punk-walk', 'passant-tourist-walk', 'passant-arbeiterin-walk', 'passant-anzug-walk'],
    bySlot: { morgen: 0, tag: 0, abend: 3, nacht: 5 },
    routes: [
      [[520, 360], [950, 360], [950, 620], [520, 620]],
      [[300, 360], [600, 700], [300, 700]],
      [[1000, 300], [1180, 560], [1000, 760], [700, 760]],
      [[640, 420], [840, 560], [640, 560]],
    ],
    barks: [
      { text: 'Noch ein Neon-Spritz! Mit Schirmchen! Ich will das Schirmchen!' },
      { text: 'Ist das da hinten Hunter? Nicht hinsehen. Er merkt das.' },
      { text: 'Wer hat den Bass so laut gedreht? Ich spür meine Füllungen.' },
      { text: 'Ich tanz nicht. Ich wippe. Das ist ein Unterschied.' },
      { text: 'Der Barkeeper hat mich angeschaut. Einfach so. Ich zittere immer noch.' },
      { text: 'Karaoke! Ich sing „Kabelbrand“! Alle Strophen! Auch die verbotene!', when: { weekday: ['di', 'fr'] } },
      { text: 'Ripper sitzt wieder am Ecktisch. Niemand bestellt Rippchen, wenn Ripper da ist.', when: { time: 'abend' } },
      { text: 'Hast du die zwei gesehen? Die Postbotin und die mit den Zöpfen? Die gucken sich an, als wollten sie sich gleich verprügeln. Oder … du weißt schon.', when: { all: [V, { seen: 'rom-vexaria-armdruecken' }] } },
    ],
  },
  ambience: 'club',
  music: 'high-voltage',
  onEnter: [
    {
      id: 'hv-erstbesuch', once: true,
      effects: [
        { markSeen: 'high-voltage-betreten' },
        { message: 'High Voltage. Bass in den Knochen, Neon im Gesicht, und es riecht nach Bier, Schweiß und schlechten Entscheidungen. Hier ist Hunter zu Hause.' },
      ],
    },
    {
      id: 'hv-vex', once: true, when: V,
      effects: [{ message: 'Vex kennt den Laden. Von außen. Als Kurierin kommt man nur bis zur Samtkordel – und hört Bruno beim Atmen zu.' }],
    },
  ],
};

export const part: ContentPart = {
  maps: { 'high-voltage': club },
  dialogues: { 'hv-ecktisch': ecktischLook, 'hv-tanzflaeche': tanzLook },
};
