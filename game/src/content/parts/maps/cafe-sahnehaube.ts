// Innenraum Café Sahnehaube (world.md §3.5 glasarkaden, ID-Plan design/plan/act1.json · pkg-glasarkaden).
// Figuren (Barista Perle, Alesa, Blade, Serenity, Collin) kommen über ihre Tagesabläufe an die Spots.
import type { DialogueDef, DialogueLine, MapDef, Polygon, Rect } from '../../../modules/contracts';
import type { ContentPart } from '../../part';

const box = ([x, y, w, h]: Rect): Polygon => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
const say = (...texts: string[]): DialogueLine[] => texts.map(text => ({ speaker: 'narrator', text }));

const cafe: MapDef = {
  id: 'cafe-sahnehaube',
  name: 'Café Sahnehaube',
  subtitle: 'Glasarkaden',
  size: [1024, 768],
  district: 'mittelring',
  lighting: 'indoor',
  bg: 'bg-cafe-sahnehaube',
  walk: [[[16, 332], [166, 332], [166, 250], [546, 250], [546, 290], [1008, 290], [1008, 646], [556, 646], [556, 700],
    [470, 700], [470, 646], [16, 646]]],
  block: [
    box([20, 322, 158, 96]), // Fenstertisch mit zwei Sesseln
    box([220, 364, 200, 156]), // runder Autogramm-Tisch mit vier Sesseln
    box([546, 380, 194, 112]), // Tisch mit Rose
    box([806, 512, 202, 134]), box([918, 430, 92, 84]), // Eckbank, Pflanze
    box([368, 614, 88, 32]), box([574, 614, 88, 32]), // Kübelpflanzen an der Tür
    box([312, 236, 50, 30]), // Blumenhocker
  ],
  exits: [
    { id: 'nach-glasarkaden', rect: [470, 600, 86, 100], to: 'glasarkaden', entry: 'von-cafe-sahnehaube', label: 'Zurück in die Arkaden', interact: true },
  ],
  entries: {
    'von-glasarkaden': { at: [512, 610], facing: 'n' },
  },
  spots: {
    theke: { at: [610, 306], facing: 's' },
    fenstertisch: { at: [148, 398], facing: 'w' },
    'blade-tisch': { at: [706, 446], facing: 'w' },
    'ecktisch-cafe': { at: [836, 578], facing: 'e' },
    'autogramm-tisch': { at: [320, 540], facing: 'n' },
  },
  hotspots: [
    { id: 'cafe-sahnehaube', at: [760, 304], radius: 72, label: 'Café Sahnehaube: Theke', kind: 'shop', shop: 'cafe-sahnehaube' },
    {
      id: 'tortenvitrine', at: [880, 304], label: 'Tortenvitrine', kind: 'look',
      lines: say('Eine Torte mit Blattgold, eine mit essbaren Perlen, eine mit einem winzigen Zuckerguss-Porträt von Seraphina Chrome.',
        'Ein Stück kostet achtzehn Credits. In der Unterstadt kriegt man dafür Suppe für eine Woche. Und Mutter Brühe würde trotzdem nachschenken.'),
    },
    {
      id: 'trinkgeldglas', at: [986, 304], label: 'Trinkgeldglas', kind: 'look',
      lines: say('Im Trinkgeldglas liegen Münzen, ein Manschettenknopf und eine Visitenkarte mit dem Satz „Ruf mich an, Süße“. Perle hat sie mit Sahne zugekleistert.'),
    },
    { id: 'cafe-fernseher', at: [256, 262], radius: 64, label: 'Fernseher (NX-1)', kind: 'screen' },
    {
      id: 'romanregal', at: [174, 300], label: 'Regal mit Liebesromanen', kind: 'look',
      lines: say('„Leidenschaft im Lastenaufzug“, „Der Cyborg, der mich liebte“, „Fünfzig Schattierungen Chrom“. Die Rücken sind abgegriffen. Sehr abgegriffen.',
        'Auf einem Buch klebt ein Zettel: „Nicht ausleihen! Gehört Serenity. Mit Eselsohren an den guten Stellen.“'),
    },
    {
      id: 'autogrammkarten', at: [320, 534], label: 'Autogrammkarten', kind: 'look', when: { not: { time: 'abend' } },
      lines: say('Ein Stapel Autogrammkarten von Collin Charleston. Auf jeder lächelt er, als hätte er gerade „gratis“ gehört.'),
    },
    {
      id: 'rose', at: [643, 506], label: 'Tisch mit Rose', kind: 'look', when: { not: { time: 'abend' } },
      lines: say('Ein Tisch mit einer einzigen Rose und einem Reserviert-Schild ohne Namen. Wer hier sitzt, braucht keinen Namen. Nur Termine.'),
    },
  ],
  foreground: [
    { rect: [806, 470, 202, 50], baseY: 640 },
  ],
  lights: [
    { at: [300, 300], radius: 160, color: '#ffcf8a', intensity: 0.6 },
    { at: [640, 320], radius: 160, color: '#ffcf8a', intensity: 0.6 },
    { at: [890, 490], radius: 120, color: '#ffcf8a', intensity: 0.6 },
    { at: [256, 140], radius: 120, color: '#c58aff', intensity: 0.5 },
    { at: [760, 120], radius: 220, color: '#ff8ac8', intensity: 0.5 },
  ],
  ambient: {
    count: 2,
    sprites: ['passant-anzug-walk', 'passant-oma-walk', 'passant-tourist-walk'],
    bySlot: { morgen: 2, tag: 3, abend: 2, nacht: 0 },
    routes: [
      [[512, 610], [600, 330], [900, 330]],
      [[512, 610], [460, 560], [180, 560], [120, 450]],
      [[512, 610], [780, 560], [760, 330]],
    ],
    barks: [
      { text: 'Einen Hafermilch-Sahne-Cappuccino, ohne Milch, ohne Sahne. Danke, Liebes.' },
      { text: 'Ich nehme die Torte mit dem Gold. Das andere Gold ist mir zu billig.' },
      { text: 'Ist das Collin? Da hinten? Nein, nur ein Kerl mit Perücke. Ach, das ist Collin.', when: { time: 'abend' } },
      { text: 'Hier riecht es plötzlich nach Rost. Ah, das sind Sie.' },
    ],
  },
  ambience: 'innen',
  music: 'oberstadt',
  onEnter: [{ id: 'cafe-sahnehaube-ankunft', once: true, dialogue: 'cafe-sahnehaube-ankunft' }],
};

const DIALOGUES: Record<string, DialogueDef> = {
  'cafe-sahnehaube-ankunft': {
    id: 'cafe-sahnehaube-ankunft', start: 'a',
    nodes: [{
      id: 'a',
      lines: [
        { speaker: 'narrator', text: 'Café Sahnehaube. Rosa Fliesen, goldene Lampen und so viel Sahne in der Luft, dass dein Blutzucker beim Atmen steigt.' },
        { speaker: 'narrator', text: 'Ein paar Gäste mustern deine Schuhe. Dann deine Jacke. Dann beschließen sie, dass du Personal bist.' },
        { speaker: 'player', text: 'Ein Stück Torte, und ich vergebe euch allen.' },
      ],
    }],
  },
};

export const part: ContentPart = { maps: { 'cafe-sahnehaube': cafe }, dialogues: DIALOGUES };
