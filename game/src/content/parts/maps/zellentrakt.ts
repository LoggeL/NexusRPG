// Innenraum „Zellentrakt“ (world.md §3.5 Eisenhof, §10.3 Fahndung, ID-Plan design/plan/act1.json · pkg-eisenhof).
// Besucherraum (Raven vor der Entlassung, Di/Do/Sa tags), Zellenreihe (Raven, Haftzelle, Nachbarin), Gang.
// Haft: Einstieg `haft` in der Haftzelle, Flag `in_haft`. In Haft ist der Trakt begehbar (Gefangenengespräche),
// nur die Tür zum Hof bleibt zu. Pritsche = Nacht durchschlafen und raus; morgens an der Tür klopfen = raus.
// Wer um 02:00 noch wach ist, wacht in der Zelle auf (Notschlafplatz ohne Credit-Schutz: −10 %).
// Koordinaten in Kartenpixeln (1024×768), am fertigen Bild bg-zellentrakt nachgezogen.
import type { Condition, DialogueDef, Effect, MapDef } from '../../../modules/contracts';
import type { ContentPart } from '../../part';

const N = 'narrator' as const;
const inHaft: Condition = { flag: 'in_haft' };

/** Entlassung aus der Haft: Fahndung auf 0, raus in den Hof (world.md §10.3). */
const entlassen: Effect[] = [
  { setFlag: 'in_haft', value: false },
  { setFlag: 'fahndung_1', value: false },
  { setFlag: 'fahndung_2', value: false },
  { setFlag: 'fahndung_3', value: false },
  { travel: 'eisenhof', entry: 'von-zellentrakt', minutes: 0 },
];

const map: MapDef = {
  id: 'zellentrakt',
  name: 'Zellentrakt',
  subtitle: 'Eisenhof · Besucherraum und Zellen',
  size: [1024, 768],
  district: 'mittelring',
  lighting: 'indoor',
  bg: 'bg-zellentrakt',
  music: 'gefaengnis',
  ambience: 'innen',
  walk: [
    // Besucherraum, Gang vor den Zellen, offene Haftzelle (Lichtvorhang) und Streifen vor den Zellentüren unten rechts.
    [
      [10, 245], [420, 245], [420, 332], [676, 332], [676, 258], [730, 258], [730, 200], [786, 200], [786, 222],
      [832, 222], [832, 332], [1015, 332], [1015, 442], [427, 445], [427, 706], [1015, 706],
      [1015, 765], [325, 765], [325, 600], [10, 600],
    ],
  ],
  block: [
    [[0, 210], [70, 210], [70, 360], [0, 360]], // Snackautomat
    [[68, 296], [96, 296], [96, 342], [68, 342]], // Mülleimer
    [[0, 352], [54, 352], [54, 520], [0, 520]], // Wartestühle
    [[176, 364], [352, 364], [352, 502], [176, 502]], // Tisch mit Stühlen
  ],
  exits: [
    {
      id: 'nach-eisenhof', rect: [168, 582, 144, 30], to: 'eisenhof', entry: 'von-zellentrakt', label: 'Raus in den Hof',
      when: { not: inHaft }, lockedText: 'Die Tür hat innen keine Klinke. Das ist der Witz an Zellen.',
    },
  ],
  entries: {
    'von-eisenhof': { at: [240, 560], facing: 'n' },
    haft: { at: [760, 292], facing: 's' },
  },
  spots: {
    besucherraum: { at: [256, 206], facing: 's' },
    'besucherraum-tuer': { at: [370, 560], facing: 'w' },
    'zelle-raven': { at: [555, 292], facing: 's' },
    zellennachbarin: { at: [880, 300], facing: 's' },
    haftzelle: { at: [760, 292], facing: 's' },
  },
  hotspots: [
    // --- Haft ------------------------------------------------------------------------------------------------
    {
      id: 'pritsche', at: [702, 262], label: 'Auf der Pritsche schlafen', kind: 'use', when: inHaft,
      lines: [
        { speaker: N, text: 'Die Matratze ist so dünn wie die Ausreden der Leute, die hier vor dir lagen. Du schläfst trotzdem. Irgendwann.' },
      ],
      effects: [
        { sleep: true },
        ...entlassen,
        { message: '06:00. Kessel schließt auf: „Raus. Und ich hoffe, wir sehen uns nicht wieder.“' },
      ],
    },
    {
      id: 'pritsche-probeliegen', at: [702, 262], label: 'Pritsche', kind: 'look', when: { not: inHaft },
      lines: [{ speaker: N, text: 'Ein Schild über der Pritsche: „Probeliegen verboten.“ Darunter, in Kugelschreiber: „Lohnt sich eh nicht.“' }],
    },
    {
      id: 'zellentuer-morgens', at: [240, 592], label: 'An die Tür klopfen', kind: 'use',
      when: { all: [inHaft, { time: 'morgen' }] },
      lines: [{ speaker: N, text: 'Kessel schlurft heran, Kaffeebecher in der Hand: „Morgenappell. Sie sind entlassen. Benehmen Sie sich, sonst sehen wir uns heute Abend wieder.“' }],
      effects: [...entlassen, { message: 'Entlassen. Der erste Morgen draußen schmeckt nach Rost.' }],
    },
    {
      id: 'zellentuer-nachts', at: [240, 592], label: 'An die Tür klopfen', kind: 'look',
      when: { all: [inHaft, { not: { time: 'morgen' } }] },
      lines: [
        { speaker: N, text: 'Du hämmerst gegen die Tür. Aus dem Dunkel: „Nachtruhe, du Arschgeige!“ Bis sechs Uhr bleibt hier alles zu.' },
        { speaker: N, text: 'Die Pritsche in der mittleren Zelle wartet. Nebenan klappert eine Teetasse.' },
      ],
    },
    {
      id: 'lichtvorhang', at: [756, 345], label: 'Mittlere Zelle', kind: 'look', when: { not: inHaft },
      lines: [{ speaker: N, text: 'Die mittlere Zelle hat statt Gitter einen Lichtvorhang, der nachts hochfährt. Gerade ist er aus. Kessel nennt das Ding „Wellness“.' }],
    },
    // --- Wand, Fenster, Kleinkram ----------------------------------------------------------------------------
    { id: 'klopfcode-wand', at: [652, 318], label: 'Kerben in der Wand', kind: 'use', dialogue: 'zellentrakt-klopfcode' },
    {
      id: 'besucherfenster', at: [150, 252], label: 'Besucherfenster', kind: 'look',
      lines: [
        { speaker: N, text: 'Panzerglas voller Kratzer: Herzchen, Telefonnummern und ein erstaunlich detaillierter Schwanz. Die Sprechmuschel riecht nach Kaugummi und Reue.' },
      ],
    },
    {
      id: 'snackautomat', at: [96, 270], label: 'Snackautomat', kind: 'look',
      lines: [{ speaker: N, text: 'Im Automaten: Knastkrokant, Gitterwaffeln und Kaugummi der Sorte „Freiheit“. Ausverkauft. Natürlich.' }],
    },
    {
      id: 'schluesselkasten', at: [128, 588], label: 'Schlüsselkasten', kind: 'look',
      lines: [{ speaker: N, text: 'Jeder Haken beschriftet, einer heißt „Ersatz für Ersatz“. Daneben Kessels Strichliste: „Fluchtversuche: 0. Kaffee: 2.418.“' }],
    },
  ],
  foreground: [
    { rect: [427, 225, 214, 105], baseY: 330 }, // Gitter vor Ravens Zelle
    { rect: [859, 225, 165, 105], baseY: 330 }, // Gitter vor der Nachbarzelle
  ],
  lights: [
    { at: [754, 52], radius: 110, color: '#ff3a3a', intensity: 0.8 }, // Rotlicht über der Haftzelle
    { at: [998, 128], radius: 120, color: '#ffb04a', intensity: 0.6 }, // Lampe der Nachbarin
    { at: [235, 60], radius: 160, color: '#7fe8ff', intensity: 0.5 },
    { at: [60, 280], radius: 70, color: '#ff4fd0', intensity: 0.5 }, // Automat
    { at: [60, 620], radius: 80, color: '#ffc46b', intensity: 0.5 }, // Wachtisch
  ],
  shelter: { when: inHaft, entry: 'haft', keepCredits: false },
  onEnter: [
    { id: 'zellentrakt-haft', when: inHaft, dialogue: 'zellentrakt-haft' },
    {
      id: 'zellentrakt-ankunft', once: true, when: { not: inHaft },
      effects: [
        { message: 'Der Zellentrakt. Neonröhren, Bohnerwachs und ein Geruch, den man nur mit „Reue in Linoleum“ beschreiben kann.' },
        { markSeen: 'zellentrakt-ankunft' },
      ],
    },
  ],
};

const haft: DialogueDef = {
  id: 'zellentrakt-haft',
  start: 'start',
  nodes: [
    {
      id: 'start',
      lines: [
        { speaker: N, text: 'Die Tür zum Hof fällt ins Schloss. Kessels Stimme durch die Sprechanlage: „Eine Nacht. Morgen früh sind Sie wieder draußen.“' },
        { speaker: N, text: '„Ich hoffe, wir sehen uns nicht wieder. Und wehe, Sie schnarchen.“' },
        { speaker: N, text: 'Die Pritsche quietscht einladend. Nebenan klappert eine Teetasse, links kratzt jemand Kerben in die Wand.' },
      ],
    },
  ],
};

const ravenNochDrin: Condition = { quest: 'main-1-raven', state: ['inactive', 'active'] };

const klopfcode: DialogueDef = {
  id: 'zellentrakt-klopfcode',
  start: 'start',
  nodes: [
    {
      id: 'start',
      lines: [{ speaker: N, text: 'Die Wand zwischen den Zellen. Jemand hat Kerben hineingekratzt: lang, kurz, kurz, lang. Das ist kein Kunstwerk, das ist ein Alphabet.' }],
      choices: [
        {
          text: 'Klopfcode an Raven: „Kopf hoch. Ich hol dich raus.“', next: 'knast-raven', tag: '[Knast]', once: true, id: 'klopf-raven',
          when: { all: [{ origin: 'origin-knastvogel' }, ravenNochDrin] },
        },
        {
          text: 'Klopfcode an die Nachbarin: „Noch Tee da?“', next: 'knast-nachbarin', tag: '[Knast]',
          when: { origin: 'origin-knastvogel' },
        },
        { text: 'Einfach mal irgendwas klopfen.', next: 'klopfen' },
        { text: 'Lassen. Wände haben Ohren, hier sogar Mikrofone.' },
      ],
    },
    {
      id: 'knast-raven',
      lines: [
        { speaker: N, text: 'Du klopfst. Stille. Dann, von drüben, langsam und fast zärtlich: lang, kurz, lang.' },
        { speaker: N, text: '„Verpiss dich.“ Pause. „Danke.“' },
      ],
      effects: [{ relation: 'raven', delta: 20 }],
    },
    {
      id: 'knast-nachbarin',
      lines: [{ speaker: N, text: 'Von nebenan kommt prompt zurück: „Tee um sechs. Bring Kekse. Keine Rosinen, ich bin doch kein Tier.“' }],
    },
    {
      id: 'klopfen',
      lines: [{ speaker: N, text: 'Du klopfst irgendwas. Zurück kommt, in perfektem Code: „Halt die Fresse, ich schlaf.“' }],
    },
  ],
};

export const part: ContentPart = {
  maps: { zellentrakt: map },
  dialogues: { [haft.id]: haft, [klopfcode.id]: klopfcode },
};
