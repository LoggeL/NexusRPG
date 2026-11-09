// Innenraum Das Nest (world.md §3.5 Rohrsiedlung, Plan design/plan/act1.json maps.das-nest, Paket pkg-rohrsiedlung).
// Versteck von Daria, Freya und Jakko im Tank des Wasserturms. Kinderzone: hier gibt es keine Kämpfe.
// Figuren (Kinder M/A/N, Babette 17–18 Uhr, Captain Kuschel Mo/Mi) kommen über ihre Tagesabläufe auf die Spots.
import type { Condition, DialogueDef, DialogueLine, MapDef, Polygon } from '../../../modules/contracts';
import type { ContentPart } from '../../part';

const n = (text: string): DialogueLine => ({ speaker: 'narrator', text });
const ich = (text: string, expr?: DialogueLine['expr']): DialogueLine => ({ speaker: 'player', text, ...(expr ? { expr } : {}) });

const V: Condition = { playerIs: 'vex' };
const KINDERBILD_DA: Condition = { quest: 'side-zehn-credits', state: 'done' };
const DACH_HEIL: Condition = { quest: 'pers-kinder-wasserturm', state: 'done' };

// Koordinaten in Kartenpixeln am fertigen Bild (game/public/assets/bg/das-nest.webp, 1024×768).
const BODEN: Polygon = [
  [200, 258], [660, 256], [700, 250], [852, 252], [868, 300], [872, 498], [962, 506], [962, 560], [870, 586], [866, 742],
  [300, 744], [292, 552], [200, 538],
];

const dasNest: MapDef = {
  id: 'das-nest',
  name: 'Das Nest',
  subtitle: 'Rohrsiedlung · Wasserturm',
  size: [1024, 768],
  district: 'unterstadt',
  lighting: 'indoor',
  bg: 'bg-das-nest',
  walk: [BODEN],
  block: [
    // Eins!-Kiste mit Kissen
    [[470, 362], [578, 362], [578, 462], [470, 462]],
    // Teetischchen
    [[792, 408], [878, 408], [878, 480], [792, 480]],
  ],
  exits: [
    { id: 'nach-rohrsiedlung', rect: [446, 640, 140, 104], to: 'rohrsiedlung', entry: 'von-das-nest', label: 'Raus in die Rohrsiedlung', interact: true, minutes: 2 },
  ],
  entries: {
    'von-rohrsiedlung': { at: [514, 600], facing: 'n' },
  },
  spots: {
    schlafnischen: { at: [250, 400], facing: 'w' },
    'eins-kiste': { at: [524, 500], facing: 'n' },
    'kuschel-platz': { at: [838, 340], facing: 'e' },
    teekraenzchen: { at: [740, 446], facing: 'e' },
    'karte-der-stadt': { at: [540, 280], facing: 'n' },
    'undichtes-dach': { at: [846, 290], facing: 'e' },
    essensplatz: { at: [330, 620], facing: 'w' },
    'kinderbild-wand': { at: [360, 280], facing: 'n' },
  },
  hotspots: [
    {
      id: 'eins-kiste', at: [524, 470], radius: 70, label: 'Eins! an der Kiste spielen', kind: 'use', when: { time: 'tag' },
      lines: [n('Auf der umgedrehten Obstkiste liegt ein Stapel Eins!-Karten, zerknickt, geklebt und mit Marmelade markiert. Zwei Nachbarskinder aus den Rohren – Kralle und Lucky Lu – warten schon. „Einsatz: deine Würde.“')],
      effects: [{
        minigame: 'akt-eins', level: 1, key: 'eins-nest', label: 'Eins! im Nest',
        win: [
          { xp: 15 }, { relation: 'daria', delta: 10 },
          { message: 'Gewonnen! Kralle wirft die Karten hin. Daria trägt deinen Sieg ins Ehrenbuch ein. Mit Bleistift. Damit sie ihn später wegradieren kann.' },
        ],
        lose: [{ message: 'Lucky Lu legt eine Plus-Vier auf deine Plus-Vier. „Revanche nächsten Sonntag!“ Das sagen hier alle. Immer.' }],
      }],
    },
    {
      id: 'eins-kiste-leer', at: [524, 470], radius: 70, label: 'Die Eins!-Kiste', kind: 'look', when: { not: { time: 'tag' } },
      lines: [n('Die Karten liegen ordentlich gestapelt, obenauf ein Zettel: „SPIELZEIT NUR TAGSÜBER. GEZ. FREYA, RICHTERIN.“')],
    },
    {
      id: 'karte-der-stadt', at: [540, 262], radius: 70, label: 'Darias Karte der Stadt', kind: 'look',
      lines: [
        n('Zusammengeklebte Papierbögen, darauf die ganze Stadt in Buntstift: Neon-Gasse, Schrottmarkt, Bahnhof, sogar das Meer – als blaue Wellenlinie ganz unten, mit dem Vermerk „GIBT ES!!!“.'),
        n('Rote Fäden verbinden Botengänge, Abkürzungen und Orte, an denen es Essen gibt. Bei der Oberstadt steht nur: „Nicht hin. Doofe Leute.“'),
      ],
    },
    {
      id: 'kinderzeichnungen', at: [360, 262], radius: 60, label: 'Kinderzeichnungen', kind: 'look', hideWhen: KINDERBILD_DA,
      lines: [n('Kreise, Dreiecke, ein Stern. Darunter in Freyas Schrift: „AUSSTELLUNG. ANFASSEN KOSTET EINEN KEKS.“ Eine Lücke an der Wand ist schon frei gelassen. Für ein besonderes Bild, sagt Jakko.')],
    },
    {
      id: 'kinderbild', at: [360, 262], radius: 60, label: 'Das Kinderbild', kind: 'look', when: KINDERBILD_DA,
      lines: [
        n('In der Lücke an der Wand hängt jetzt das Bild: die ganze Crew in Buntstift, Captain Kuschel größer als alle, und du – mit Krone. Darunter: „UNSERE HELDEN. (UND HUNTER)“'),
        ich('Ich hab eine Krone. Das wird nie wieder so gut, oder?', 'freude'),
      ],
    },
    {
      id: 'schlafnischen-ansehen', at: [232, 380], radius: 60, label: 'Schlafnischen', kind: 'look',
      lines: [
        n('Drei Nischen aus Matratzen und Pappwänden. Darias: Sticker überall, eine Kasse aus einer Keksdose. Freyas: ordentlich gefaltet, ein Hammer aus Pappe als Richterhammer. Jakkos: Kissenberg, Teddy und ein Löffel unter dem Kopfkissen. Für Notfälle.'),
      ],
    },
    {
      id: 'nest-dach-eimer', at: [892, 286], radius: 56, label: 'Eimer unter dem Leck', kind: 'look', hideWhen: DACH_HEIL,
      lines: [n('Plink. Plink. Plink. Aus dem Rohr an der Decke tropft es in einen verbeulten Eimer. Jemand hat einen Strich an den Eimer gemalt: „WENN WASSER HIER – FREYA WECKEN“. Der Strich ist fast erreicht.')],
    },
    {
      id: 'nest-dach-heil', at: [892, 286], radius: 56, label: 'Der trockene Eimer', kind: 'look', when: DACH_HEIL,
      lines: [n('Der Eimer steht noch da, trocken, umgedreht – jetzt ist er ein Hocker. Daneben ein Kreideschild: „DACH: REPARIRT. VON UNS. (UND {name})“')],
    },
    {
      id: 'essensplatz-ansehen', at: [300, 600], radius: 56, label: 'Der Esstisch', kind: 'look',
      lines: [n('Ein niedriger Tisch, drei Schüsseln, ein Topf mit Deckel. Am Rand klebt ein Zettel: „BABETTE KOMMT UM FÜNF. NICHT VORHER ESSEN. (JAKKO!!!)“')],
    },
    {
      id: 'sessel', at: [850, 380], radius: 46, label: 'Der Gästesessel', kind: 'look',
      lines: [n('Ein Ledersessel mit Fellüberwurf, der beste Platz im Nest. Montags und mittwochs reserviert für einen ausgeliehenen Ehrengast mit Knopfaugen. Wer sich sonst reinsetzt, zahlt Strafe in Keksen.')],
    },
  ],
  lights: [
    { at: [240, 196], radius: 90, color: '#ffc861', intensity: 0.8 },
    { at: [100, 266], radius: 80, color: '#ffc861', intensity: 0.7 },
    { at: [88, 414], radius: 80, color: '#ffc861', intensity: 0.7 },
    { at: [524, 182], radius: 110, color: '#ffc861', intensity: 0.7 },
    { at: [104, 580], radius: 90, color: '#ffb347', intensity: 0.8 },
    { at: [848, 378], radius: 90, color: '#ffb347', intensity: 0.8 },
    { at: [140, 60], radius: 90, color: '#3ef2ff', intensity: 0.5 },
    { at: [210, 60], radius: 70, color: '#ff3fa4', intensity: 0.5 },
  ],
  ambience: 'innen',
  onEnter: [
    { id: 'nest-erstbesuch', once: true, when: { not: V }, dialogue: 'dlg-nest-ankunft', effects: [{ markSeen: 'nest-erstbesuch' }] },
    { id: 'nest-erstbesuch-vex', once: true, when: V, dialogue: 'dlg-nest-ankunft-vex', effects: [{ markSeen: 'nest-erstbesuch' }] },
  ],
};

const ankunft: DialogueDef = {
  id: 'dlg-nest-ankunft',
  start: 'start',
  nodes: [{
    id: 'start',
    lines: [
      n('Durch die Luke in den Tank: Holzdielen, Lichterketten, drei Schlafnischen, ein Sessel, der nach Abenteuer riecht. Das Nest. Hier drin ist die Stadt draußen.'),
      n('An der Wand hängt eine Regeltafel in drei Handschriften: „1. Keine Waffen. 2. Keine Erwachsenen-Probleme. 3. Wer schummelt, spült.“'),
    ],
    next: 'regel',
  }, {
    id: 'regel',
    lines: [ich('Keine Waffen, keine Probleme, wer schummelt, spült. Ehrlich gesagt: besser als die meisten Verfassungen.', 'freude')],
  }],
};

// Vex hat eigene Zeile beim ersten Besuch.
const ankunftVex: DialogueDef = {
  id: 'dlg-nest-ankunft-vex',
  start: 'start',
  nodes: [{
    id: 'start',
    lines: [
      n('Durch die Luke in den Tank: Holzdielen, Lichterketten, drei Schlafnischen. An der Wand eine Regeltafel: „1. Keine Waffen. 2. Keine Erwachsenen-Probleme. 3. Wer schummelt, spült.“'),
      ich('Waffen bleiben draußen am Rohr hängen. Regel eins. Ich leg mich doch nicht mit Freya an – die hat einen Richterhammer aus Pappe.', 'freude'),
    ],
  }],
};

export const part: ContentPart = {
  maps: { 'das-nest': dasNest },
  dialogues: {
    [ankunft.id]: ankunft,
    [ankunftVex.id]: ankunftVex,
  },
};
