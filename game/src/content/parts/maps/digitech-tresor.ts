// Innenkarte Digitech-Tresor: Keller (links), Wächtergang (Mitte), Tresorraum (rechts) – Paket pkg-stufenplatz-digitech.
// Bild heute: bg-digitech-tresor; Prolog main-0-digitech: bg-digitech-tresor-damals (Chip-Vitrine im Tresor).
// Prolog-Interaktionen (Kartenleser [Technik 4] ausgegraut, Dante öffnet per Funk, Blade kettet Raven ans Rohr) baut der
// Hauptstrang an den Spots kartenleser und tresor-rohr; die Hotspot-IDs `kartenleser` und `fx-60` bleiben dafür frei.
import type { Condition, DialogueDef, HotspotDef, MapDef } from '../../../modules/contracts';
import type { ContentPart } from '../../part';
import { PROLOG_AKTIV } from './digitech-areal';

const nichtImProlog: Condition = { not: PROLOG_AKTIV };

const hotspots: HotspotDef[] = [
  {
    id: 'tresor-rohr', at: [1420, 440], radius: 64, label: 'Das Rohr', kind: 'look',
    when: nichtImProlog,
    lines: [
      { speaker: 'narrator', text: 'Ein dickes, rostiges Rohr an der Tresorwand. In Hüfthöhe: tiefe, glänzende Kratzer, rundherum. Die Sorte Kratzer, die Handschellen machen, wenn jemand sehr lange sehr wütend ist.' },
      { speaker: 'narrator', text: 'Jemand hat sieben Striche daneben geritzt. Und darunter, kleiner: „B.“ Mit einem Pfeil nach unten.' },
    ],
  },
  {
    id: 'tresor-rohr-raven', at: [1420, 440], radius: 64, label: 'Das Rohr (mit Raven)', kind: 'look',
    when: { all: [nichtImProlog, { companion: 'raven' }] },
    lines: [
      { speaker: 'raven', expr: 'neutral', text: 'Hier. Genau hier. Vier Stunden, bis die Wache kam. Das Rohr war kalt. Ich war es dann auch.' },
      { speaker: 'raven', expr: 'wut', text: 'Wenn du mich fragst, ob ich drüber weg bin: Frag nicht.' },
    ],
  },
  {
    id: 'rostlaube-batterie', at: [196, 520], radius: 64, label: 'Notstrom-Batterie ausbauen', kind: 'loot',
    when: { all: [nichtImProlog, { quest: 'side-rostlaube', state: 'active' }] },
    hideWhen: { item: 'rostlaube-batterie' },
    once: true,
    lines: [{ speaker: 'narrator', text: 'Im Regal summen noch drei Digitech-Notstrombatterien. Eine davon hat genau die Form, die Nebelhorn beschrieben hat: „wie ein Brotkasten mit Wut“.' }],
    effects: [{ give: 'rostlaube-batterie' }, { message: 'Die Batterie ist schwer und leicht warm. Dante soll sie noch mal durchlöten.' }],
  },
  {
    id: 'batterie-regal', at: [196, 520], radius: 64, label: 'Batterieregal', kind: 'look',
    when: { all: [nichtImProlog, { not: { quest: 'side-rostlaube', state: 'active' } }] },
    lines: [{ speaker: 'narrator', text: 'Ein Regal voller Notstrombatterien. Die grünen Lämpchen blinken im Takt, als würden sie heimlich Eins! spielen.' }],
  },
  {
    id: 'faxgeraet-blick', at: [260, 840], radius: 56, label: 'Terminal mit Faxgerät', kind: 'look',
    when: nichtImProlog,
    lines: [
      { speaker: 'narrator', text: 'Ein Röhrenterminal mit einem Faxgerät obendrauf. Das Fax summt. Es summt dich an. Aus dem Schlitz kriecht langsam ein Blatt Papier.' },
      { speaker: 'narrator', text: '„HALLO. ICH BIN FX-60. BITTE ANTWORTEN SIE PER FAX. ODER BRIEFTAUBE. NICHT PER STIMME. STIMMEN SIND SO … FEUCHT.“' },
    ],
  },
  {
    id: 'kartenleser-blick', at: [884, 470], radius: 52, label: 'Kartenleser', kind: 'look',
    when: nichtImProlog,
    lines: [{ speaker: 'narrator', text: 'Ein Kartenleser mit rotem Lämpchen. Er blinkt seit sieben Jahren „Zugang verweigert“, obwohl die Tür sperrangelweit offen steht. Treue Seele.' }],
  },
  {
    id: 'schliessfaecher', at: [1180, 420], radius: 72, label: 'Schließfächer', kind: 'look',
    when: nichtImProlog,
    lines: [
      { speaker: 'narrator', text: 'Hunderte Schließfächer, ein paar aufgebrochen. In einem liegt nur ein Zettel: „Ich war zuerst hier. – J.“' },
      { speaker: 'narrator', text: 'In einem anderen: ein einzelner Socken. Wer schließt einen Socken in einen Tresor? Wer klaut den zweiten?' },
    ],
  },
  {
    id: 'spinde', at: [660, 480], radius: 60, label: 'Spinde im Gang', kind: 'look',
    when: nichtImProlog,
    lines: [{ speaker: 'narrator', text: 'Spinde mit Namensschildern: „Gerhard“, „Gerhard 2“, „Praktikant (Gerhard)“. Digitech hatte ein klares Personalkonzept.' }],
  },
  {
    id: 'keller-rohre', at: [300, 300], radius: 64, label: 'Freiliegende Rohre', kind: 'look',
    when: nichtImProlog,
    lines: [{ speaker: 'narrator', text: 'Rohre in allen Größen, ein rotes Handrad, Tropfen im Takt. Ein Ventil pfeift ganz leise eine Melodie. Sie ist nicht gut, aber sie ist beharrlich.' }],
  },
];

const tresor: MapDef = {
  id: 'digitech-tresor',
  name: 'Digitech-Tresor',
  subtitle: 'Tresorraum und Keller',
  size: [1536, 1024],
  district: 'oberstadt',
  lighting: 'underground',
  bg: 'bg-digitech-tresor',
  bgVariants: [{ when: PROLOG_AKTIV, bg: 'bg-digitech-tresor-damals' }],
  ambience: 'labor',
  music: 'schleichen',
  walk: [
    [
      [166, 206], [204, 206], [204, 186], [356, 186], [356, 206], [412, 206], [412, 472], [906, 472], [906, 392],
      [1394, 392], [1394, 712], [1440, 724], [1490, 724], [1490, 862], [906, 862], [906, 592], [412, 592],
      [412, 970], [166, 970],
    ],
  ],
  block: [
    // Batterieregal links, Schreibtisch mit Terminal und Fax, Hocker, Kasten
    [[150, 330], [168, 330], [168, 700], [150, 700]],
    [[166, 774], [258, 774], [258, 904], [166, 904]],
    [[166, 904], [196, 904], [196, 970], [166, 970]],
    // Tresortür (Fußlinie)
    [[936, 520], [1012, 520], [1012, 600], [936, 600]],
  ],
  foreground: [
    { rect: [924, 236, 168, 360], baseY: 596 },
  ],
  exits: [
    {
      id: 'nach-digitech-areal', rect: [200, 150, 160, 72], to: 'digitech-areal', entry: 'von-digitech-tresor',
      label: 'Kellertreppe nach oben', interact: true,
    },
  ],
  entries: {
    'von-digitech-areal': { at: [280, 252], facing: 's' },
    prolog: { at: [300, 262], facing: 's' },
  },
  spots: {
    'tresor-rohr': { at: [1380, 470], facing: 'e' },
    kartenleser: { at: [870, 520], facing: 'e' },
    keller: { at: [290, 420], facing: 's' },
    'fx-60-terminal': { at: [290, 856], facing: 'w' },
    'batterie-regal': { at: [214, 520], facing: 'w' },
    'waechter-gang': { at: [660, 530], facing: 'w' },
    // zusätzliche Punkte
    'chip-vitrine': { at: [1180, 560], facing: 'n' },
    tresortuer: { at: [1060, 640], facing: 'w' },
  },
  hotspots,
  encounters: [
    {
      id: 'keller-waechter', encounter: 'enc-ruine-waechter', at: [660, 530], sprite: 'digitech-waechter-walk',
      when: nichtImProlog, radius: 56,
      patrol: [[520, 530], [820, 530]],
      avoid: { id: 'welt-keller-waechter-umgehen', attribute: 'reflexe', threshold: 5, tags: ['schleichen'], label: '[Reflexe 5] Zwischen den Spinden durchschlüpfen' },
    },
  ],
  lights: [
    { at: [280, 90], radius: 130, color: '#ffcf7a', intensity: 0.5 },
    { at: [130, 760], radius: 120, color: '#ffcf7a', intensity: 0.45 },
    { at: [660, 370], radius: 150, color: '#3dffb0', intensity: 0.45 },
    { at: [660, 640], radius: 130, color: '#3dffb0', intensity: 0.35 },
    { at: [1190, 170], radius: 220, color: '#7fffe0', intensity: 0.4 },
    { at: [902, 446], radius: 50, color: '#ff3030', intensity: 0.6 },
  ],
  onEnter: [
    {
      id: 'digitech-tresor-erstbesuch', once: true, when: nichtImProlog,
      dialogue: 'digitech-tresor-ankunft', effects: [{ markSeen: 'digitech-tresor-erstbesuch' }],
    },
  ],
};

const dialogues: Record<string, DialogueDef> = {
  'digitech-tresor-ankunft': {
    id: 'digitech-tresor-ankunft',
    start: 'a',
    nodes: [{
      id: 'a',
      lines: [
        { speaker: 'narrator', text: 'Unten ist es kalt und grün. Rohre tropfen, ein Faxgerät summt, und weiter hinten klappert etwas Metallisches im Gang, das nach „Bitte lächeln“ klingt.' },
        { speaker: 'narrator', text: 'Ganz hinten steht die Tresortür offen. Sieben Jahre schon. Niemand hat sich die Mühe gemacht, sie zu schließen. Es gibt nichts mehr zu bewachen. Fast nichts.' },
      ],
    }],
  },
};

export const part: ContentPart = {
  maps: { 'digitech-tresor': tresor },
  dialogues,
};
