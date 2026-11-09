// Innenraum Suppenküche (world.md §3.5 Rohrsiedlung, §3.9 akt-suppenkueche, Plan design/plan/act1.json maps.suppenkueche).
// Mutter Brühes Container-Küche: Kessel und Ausgabe (Händler suppenkueche), lange Bänke, Spendenkasse (Ruf unterstadt),
// Rezeptecke für pers-jakko-kochbuch. Geöffnet morgens bis abends (Ausgang in der Rohrsiedlung ist nachts gesperrt).
import type { Condition, DialogueDef, DialogueLine, MapDef, Polygon } from '../../../modules/contracts';
import type { ContentPart } from '../../part';

const n = (text: string): DialogueLine => ({ speaker: 'narrator', text });
const ich = (text: string, expr?: DialogueLine['expr']): DialogueLine => ({ speaker: 'player', text, ...(expr ? { expr } : {}) });
const bruehe = (text: string, expr?: DialogueLine['expr']): DialogueLine => ({ speaker: 'mutter-bruehe', text, ...(expr ? { expr } : {}) });

/** Spenden heben den Ruf nur bis 20; danach freut sich die Kasse trotzdem. */
const RUF_GESPENDET: Condition = { rep: 'unterstadt', min: 20 };

// Koordinaten in Kartenpixeln am fertigen Bild (game/public/assets/bg/suppenkueche.webp, 1024×768).
const BODEN: Polygon = [
  [16, 286], [280, 290], [282, 302], [716, 302], [720, 296], [1008, 298],
  [1008, 682], [604, 682], [604, 768], [438, 768], [438, 682], [16, 682],
];

const suppenkueche: MapDef = {
  id: 'suppenkueche',
  name: 'Suppenküche',
  subtitle: 'Rohrsiedlung · Mutter Brühe',
  size: [1024, 768],
  district: 'unterstadt',
  lighting: 'indoor',
  bg: 'bg-suppenkueche',
  walk: [BODEN],
  block: [
    // lange Tische mit Bänken
    [[50, 384], [410, 384], [410, 530], [50, 530]],
    [[610, 384], [976, 384], [976, 530], [610, 530]],
    // Spendenkasse an der Kette
    [[896, 556], [982, 556], [982, 682], [896, 682]],
  ],
  foreground: [
    { rect: [50, 470, 360, 60], baseY: 530 },
    { rect: [610, 470, 366, 60], baseY: 530 },
  ],
  exits: [
    { id: 'nach-rohrsiedlung', rect: [440, 700, 160, 68], to: 'rohrsiedlung', entry: 'von-suppenkueche', label: 'Raus in die Rohrsiedlung', interact: true, minutes: 2 },
  ],
  entries: {
    'von-rohrsiedlung': { at: [520, 650], facing: 'n' },
  },
  spots: {
    kessel: { at: [540, 318], facing: 's' },
    ausgabe: { at: [380, 322], facing: 'n' },
    'lange-baenke': { at: [230, 560], facing: 'n' },
    spendenkasse: { at: [860, 620], facing: 'e' },
    'rezept-ecke': { at: [112, 300], facing: 'n' },
    // Zusätzlich
    'baenke-rechts': { at: [790, 560], facing: 'n' },
    'zwischen-tischen': { at: [510, 450], facing: 's' },
  },
  hotspots: [
    {
      id: 'suppenkueche', at: [560, 300], radius: 72, label: 'Suppe bei Mutter Brühe holen', kind: 'shop', shop: 'suppenkueche',
      lines: [n('Der Kessel blubbert wie ein Vulkan mit Hausrezept. Eine Kelle, eine Schüssel, drei Credits. Fragen stellt man hier nicht.')],
    },
    {
      id: 'suppe-austeilen', at: [380, 304], radius: 64, label: 'Suppe austeilen helfen', kind: 'use', when: { time: 'morgen' },
      lines: [n('Die Morgenschlange reicht bis raus auf den Hof: Arbeiterinnen, Rohrputzer, eine Oma mit drei Tupperdosen. Mutter Brühe drückt dir eine Kelle in die Hand. „Nicht kleckern. Nicht quatschen. Nicht klauen.“')],
      effects: [{
        minigame: 'akt-suppenkueche', level: 1, key: 'suppenkueche-schicht', label: 'Suppe austeilen',
        win: [
          { rep: 'unterstadt', delta: 2 }, { xp: 15 }, { give: 'bruehes-suppe' },
          { message: 'Alle satt, keiner verbrüht. Mutter Brühe raunt dir ein Gerücht zu: „Die Rostzähne zahlen ihre Suppe neuerdings in Quantum-Gutscheinen. Wer verschenkt denn so was?“' },
        ],
        lose: [
          { rep: 'unterstadt', delta: 1 },
          { message: 'Halb daneben, halb auf dem Rohrputzer. Mutter Brühe seufzt: „Gut gemeint ist auch gekocht.“ Ein bisschen Dank gibt’s trotzdem.' },
        ],
      }],
    },
    {
      id: 'suppe-austeilen-vorbei', at: [380, 304], radius: 64, label: 'Die Ausgabe', kind: 'look', when: { not: { time: 'morgen' } },
      lines: [n('Die große Ausgabe ist morgens. Jetzt stapeln sich hier nur Schüsseln, und ein Rohrputzer leckt heimlich die Kelle ab.')],
    },
    {
      id: 'spendenkasse', at: [880, 620], radius: 60, label: 'Spendenkasse', kind: 'use', dialogue: 'dlg-suppenkueche-spendenkasse',
    },
    {
      id: 'rezept-ecke', at: [112, 284], radius: 64, label: 'Rezeptecke', kind: 'look',
      lines: [
        n('Gläser mit Gewürzen, getrocknete Kräuter an einer Schnur, eine Pinnwand voller Rezeptzettel in drei Handschriften und einer Kritzelei. Auf einem steht nur: „Geheim. Wer liest, schält Kartoffeln.“'),
        ich('Mutter Brühes Geheimrezept hängt öffentlich an der Wand. Das ist entweder Mut oder eine Falle.', 'freude'),
      ],
    },
    {
      id: 'vorratsregal', at: [870, 304], radius: 60, label: 'Vorratsregal', kind: 'look',
      lines: [n('Säcke voller Kartoffeln, Kisten mit Karotten, Kohl und ein Netz Tomaten, das aussieht, als hätte es schon mal jemanden gerettet. Dazu ein Schild: „GESPENDET VON GUSTAV. ZURÜCKGEGEBEN AN ALLE.“')],
    },
    {
      id: 'lange-tische', at: [230, 560], radius: 70, label: 'Die langen Tische', kind: 'look',
      lines: [n('Lange Tische, schiefe Bänke, eine Laterne je Tisch. Wer hier sitzt, sitzt neben Fremden – und steht als Nachbar wieder auf. Eingeritzt ins Holz: „KNUT WAR HIER“, darunter „KNUT IST EIN ARSCH“.')],
    },
  ],
  lights: [
    { at: [146, 72], radius: 140, color: '#ffc861', intensity: 0.8 },
    { at: [510, 50], radius: 180, color: '#ffb347', intensity: 0.9 },
    { at: [892, 80], radius: 140, color: '#ffc861', intensity: 0.8 },
    { at: [530, 210], radius: 120, color: '#ff9a3c', intensity: 0.7 },
    { at: [258, 42], radius: 100, color: '#ff3fa4', intensity: 0.6 },
    { at: [678, 112], radius: 90, color: '#3ef2ff', intensity: 0.5 },
    { at: [978, 90], radius: 90, color: '#3ef2ff', intensity: 0.5 },
    { at: [213, 400], radius: 90, color: '#ffc861', intensity: 0.7 },
    { at: [802, 400], radius: 90, color: '#ffc861', intensity: 0.7 },
    { at: [440, 700], radius: 70, color: '#3ef2ff', intensity: 0.6 },
    { at: [596, 700], radius: 70, color: '#3ef2ff', intensity: 0.6 },
  ],
  ambient: {
    count: 3,
    bySlot: { morgen: 4, tag: 3, abend: 3, nacht: 0 },
    sprites: ['passant-arbeiterin-walk', 'passant-oma-walk', 'passant-kanalvolk-walk', 'passant-schrotti-walk'],
    routes: [
      [[520, 640], [520, 340], [300, 340], [300, 560]],
      [[480, 640], [700, 340], [760, 560], [480, 600]],
      [[120, 600], [460, 600], [560, 330], [800, 340]],
    ],
    barks: [
      { text: 'Mutter Brühe sagt, heute gibt’s Suppe. Gestern gab’s auch Suppe.' },
      { text: 'Was ist da drin? – Frag nicht. – Ist das Fleisch? – Ich sagte, frag nicht.' },
      { text: 'Zweite Schüssel? Nur wenn du die erste nicht in die Tasche gekippt hast, du Gierschlund.' },
      { text: 'Drei Credits und ein warmer Bauch. Bestes Geschäft der ganzen Scheißstadt.' },
      { text: 'Die Kelle hat mich mal getroffen. Ich hab’s verdient. Und nachgeschlagen.' },
      { text: 'Frühschicht im Kanal, Suppe zum Frühstück. Gibt Schlimmeres. Den Kanal zum Beispiel.', when: { time: 'morgen' } },
      { text: 'Abendsuppe ist dicker. Das ist die Morgensuppe, nur länger gekocht.', when: { time: 'abend' } },
      { text: 'In der Oberstadt kostet Suppe dreißig Credits und heißt „Velouté“. Ich kotz gleich.', when: { not: { act: 2 } } },
      { text: 'Seit Chrome 10 sagt mein Kumpel zur Suppe „Danke, Master“. Mutter Brühe hat ihn rausgeworfen.', when: { act: 2 } },
    ],
  },
  ambience: 'innen',
  onEnter: [
    { id: 'suppenkueche-erstbesuch', once: true, dialogue: 'dlg-suppenkueche-ankunft', effects: [{ markSeen: 'suppenkueche-erstbesuch' }] },
  ],
};

const ankunft: DialogueDef = {
  id: 'dlg-suppenkueche-ankunft',
  start: 'start',
  nodes: [{
    id: 'start',
    lines: [
      n('Zwei zusammengeschweißte Container, ein Kessel so groß wie ein Kleinwagen und ein Geruch, der dich am Kragen packt und reinzieht. Die Suppenküche von Mutter Brühe.'),
      n('Hinter dem Tresen thront Mutter Brühe mit einer Kelle, die sie hält wie ein Zepter. Am Kessel hängt ein Schild ohne Worte, nur eine gemalte Kelle mit Ausrufezeichen. Jeder hier versteht es.'),
    ],
  }],
};

const spendenkasse: DialogueDef = {
  id: 'dlg-suppenkueche-spendenkasse',
  start: 'start',
  nodes: [
    {
      id: 'start',
      lines: [n('Eine verbeulte Blechkasse, mit einer Kette an die Wand geschlossen. Auf dem Papierherz steht in Kinderschrift: „DANKE. WER KLAUT, KRIEGT KEINE SUPPE.“')],
      choices: [
        {
          text: 'Fünf Credits rein.', requires: { credits: 5 }, when: { not: RUF_GESPENDET },
          effects: [{ credits: -5 }, { rep: 'unterstadt', delta: 1 }], next: 'danke',
        },
        {
          text: 'Fünf Credits rein.', requires: { credits: 5 }, when: RUF_GESPENDET, id: 'fuenf-voll',
          effects: [{ credits: -5 }], next: 'danke-voll',
        },
        {
          text: 'Fünfzig Credits. Heute bin ich großzügig.', requires: { credits: 50 }, once: true, id: 'fuenfzig',
          effects: [{ credits: -50 }, { rep: 'unterstadt', delta: 5 }, { xp: 15 }], next: 'gross',
        },
        {
          text: 'Früher hab ich hier selbst gegessen. Zwanzig für die Kasse.', tag: '[Gosse]', when: { origin: 'gosse' },
          requires: { credits: 20 }, once: true, id: 'gosse',
          effects: [{ credits: -20 }, { rep: 'unterstadt', delta: 4 }], next: 'gosse',
        },
        { text: 'Mal schütteln, ob da was drin ist.', next: 'klauen' },
        { text: 'Lieber nicht.' },
      ],
    },
    {
      id: 'danke',
      lines: [n('Klimper. Aus der Küche ruft Mutter Brühe, ohne sich umzudrehen: „Gehört! Gott segne deine Taschen!“')],
    },
    {
      id: 'danke-voll',
      lines: [n('Klimper. Mutter Brühe nickt dir zu, als wärst du Stammgast. Bist du ja auch. Die Kasse rettet keine Welt – nur Abendessen.')],
    },
    {
      id: 'gross',
      lines: [
        n('Die Kasse schluckt die Scheine mit einem dankbaren Scheppern.'),
        bruehe('Fünfzig? Kind, davon kriegt die halbe Siedlung Suppe mit Einlage. Setz dich. Nachschlag geht aufs Haus. Und nicht widersprechen.', 'freude'),
      ],
    },
    {
      id: 'gosse',
      lines: [
        bruehe('Dich kenn ich doch. Du hast mir mal die Kelle geklaut. Mit sieben. Und zurückgebracht. Mit acht.', 'freude'),
        ich('Ich hatte ein schlechtes Gewissen.', 'verlegen'),
        bruehe('Du hattest Hunger. Ist dasselbe, nur lauter. Danke, Kleines.'),
      ],
    },
    {
      id: 'klauen',
      lines: [
        n('Du rüttelst. Drin klimpert es verlockend. Aus der Küche zischt eine Kelle durch die Luft und verfehlt deinen Kopf um eine Haaresbreite.'),
        bruehe('Finger weg, du Kanalratte! Noch einmal, und du kriegst Suppe – und zwar durch die Nase!', 'wut'),
      ],
      effects: [{ rep: 'unterstadt', delta: -2 }],
    },
  ],
};

export const part: ContentPart = {
  maps: { suppenkueche },
  dialogues: {
    [ankunft.id]: ankunft,
    [spendenkasse.id]: spendenkasse,
  },
};
