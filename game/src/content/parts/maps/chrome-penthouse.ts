// Questraum Chrome-Penthouse (side-alte-gewohnheiten, world.md §6.2 Nr. 50; ID-Plan design/plan/act1.json).
// Zugang in Akt 1 nur über den Lastenaufzug bzw. den Wäscheschacht im Glasarkaden-Lieferhof oder Kikis Taxi (Einstieg dach).
// Die Quest selbst gehört dem Quest-Agenten; diese Karte setzt nur Flags, die die Questschritte abfragen können:
//   alte-gewohnheiten-getarnt (ungesehen rein: gc-143, gc-142 oder Kiki), alte-gewohnheiten-albert-abgewimmelt (gc-144),
//   alte-gewohnheiten-bijou-ruhig (leckerli-schraube), alte-gewohnheiten-rabe-gemalt (Questziel),
//   alte-gewohnheiten-tuch (mindestens ein Seidentuch genommen), alte-gewohnheiten-entkommen (zurück im Lieferhof).
import type { Condition, DialogueDef, DialogueLine, MapDef, Polygon, Rect } from '../../../modules/contracts';
import type { ContentPart } from '../../part';

const box = ([x, y, w, h]: Rect): Polygon => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
const say = (...texts: string[]): DialogueLine[] => texts.map(text => ({ speaker: 'narrator', text }));

const Q_AKTIV: Condition = { quest: 'side-alte-gewohnheiten', state: 'active' };
const GEMALT: Condition = { flag: 'alte-gewohnheiten-rabe-gemalt' };

const tuch = (farbe: 'blau' | 'rot' | 'gruen', at: readonly [number, number], name: string, text: string) => ({
  id: `seidentuch-${farbe}`, at, radius: 56, label: `Seidentuch (${name}) vom Balkon nehmen`, kind: 'loot' as const, once: true,
  when: Q_AKTIV,
  lines: say(text),
  effects: [{ give: `seidentuch-${farbe}` }, { setFlag: 'alte-gewohnheiten-tuch' }, { rep: 'chrome-haus', delta: -4 }],
});

const penthouse: MapDef = {
  id: 'chrome-penthouse',
  name: 'Chrome-Penthouse',
  subtitle: 'Oberstadt · Haus Chrome',
  size: [1536, 1024],
  district: 'oberstadt',
  lighting: 'indoor',
  bg: 'bg-chrome-penthouse',
  // Eine Fläche: drei Schlafzimmer (oben), Salon, Bibliothek, Diele, Dienstgang vor Aufzug/Wäsche/Drohnen (unten).
  walk: [[[64, 128], [1440, 128], [1440, 838], [64, 838]]],
  block: [
    // Wände zwischen den Zimmern (Türlücken bei x 212–280, 616–686, 1046–1120)
    box([598, 115, 18, 262]), box([1028, 115, 18, 262]),
    box([56, 368, 156, 26]), box([280, 368, 336, 26]), box([686, 368, 360, 26]), box([1120, 368, 356, 26]),
    // Blaues Zimmer: Kommode, Pflanze, Himmelbett, Schminktisch mit Spiegel
    box([64, 195, 92, 130]), box([150, 160, 50, 100]), box([182, 125, 262, 218]), box([440, 125, 120, 170]),
    // Rotes Zimmer: rundes Bett, Pflanze, Flasche
    box([720, 150, 230, 185]), box([950, 160, 55, 100]), box([616, 236, 28, 44]),
    // Grünes Zimmer: Bett, Pflanzen
    box([1178, 135, 190, 175]), box([1108, 185, 70, 100]), box([1388, 120, 52, 160]),
    // Bibliothek: Pflanze, Regale, Sessel, Globus, Champagnerwagen
    box([64, 392, 46, 388]), box([110, 425, 222, 192]), box([138, 628, 96, 86]), box([252, 565, 76, 70]), box([340, 662, 92, 112]),
    // Salon: Skulptur, Kristall, Vasen, Sofagruppe
    box([503, 445, 50, 110]), box([1018, 430, 46, 125]), box([478, 690, 64, 90]), box([1030, 690, 52, 90]),
    box([590, 482, 370, 258]),
    // Diele: Konsole, Stehlampe, Garderobe
    box([1172, 548, 106, 98]), box([1246, 520, 16, 130]), box([1298, 520, 44, 138]),
  ],
  exits: [
    { id: 'lastenaufzug', rect: [100, 800, 140, 140], to: 'glasarkaden', entry: 'von-chrome-penthouse', label: 'Lastenaufzug nach unten', interact: true, minutes: 5 },
    {
      id: 'wohnungstuer', rect: [1410, 515, 70, 185], to: 'chrome-boulevard', entry: 'von-chrome-penthouse', label: 'Wohnungstür', interact: true,
      when: { act: 2 },
      lockedText: 'Unten sitzt Portier Albert. Durch diese Tür geht heute keiner raus. Nicht mit Lippenstift an den Fingern.',
    },
  ],
  entries: {
    lastenaufzug: { at: [170, 822], facing: 'n' },
    waescheschacht: { at: [532, 826], facing: 'n' },
    dach: { at: [1080, 300], facing: 's' },
    'von-chrome-boulevard': { at: [1380, 612], facing: 'w' },
  },
  spots: {
    salon: { at: [776, 780], facing: 'n' },
    'sofa-bijou': { at: [866, 672], facing: 's' },
    'seraphinas-spiegel': { at: [500, 318], facing: 'n' },
    bibliothek: { at: [292, 712], facing: 'w' },
    'balkon-blau': { at: [330, 84], facing: 's' },
    'balkon-rot': { at: [810, 84], facing: 's' },
    'balkon-gruen': { at: [1270, 84], facing: 's' },
    'schlafzimmer-blau': { at: [312, 236], facing: 's' },
    'schlafzimmer-rot': { at: [834, 244], facing: 's' },
    'schlafzimmer-gruen': { at: [1272, 226], facing: 's' },
    haustelefon: { at: [1376, 604], facing: 'e' },
    'portier-runde': { at: [1300, 720], facing: 'w' },
    'drohnen-nische': { at: [1290, 818], facing: 'n' },
  },
  hotspots: [
    {
      id: 'seraphinas-spiegel', at: [500, 312], radius: 64, label: 'Seraphinas Spiegel', kind: 'use',
      when: Q_AKTIV, hideWhen: GEMALT, dialogue: 'chrome-penthouse-spiegel',
    },
    {
      id: 'spiegel-rabe', at: [500, 312], radius: 64, label: 'Der Rabe auf dem Spiegel', kind: 'look', when: GEMALT,
      lines: say('Ein kleiner schwarzer Rabe, mit drei Strichen Lippenstift. Elegant, frech und kussecht. Morgen früh wird Seraphina schreien. Leise. Wegen der Nachbarn.'),
    },
    {
      id: 'spiegel-look', at: [500, 312], radius: 64, label: 'Spiegel', kind: 'look', when: { not: Q_AKTIV },
      lines: say('Ein Schminkspiegel mit Goldrahmen. Er ist teurer als dein Gesicht. Und ehrlicher.'),
    },
    tuch('blau', [580, 140], 'blau', 'Über der Lehne eines blauen Balkonsessels hängt ein Seidentuch mit Chrome-Monogramm. Seraphinas Farbe. Wehe, du verwechselst sie.'),
    tuch('rot', [668, 140], 'rot', 'Auf dem roten Balkon flattert ein Seidentuch im Höhenwind, festgeklemmt unter einem Champagnerglas. Sybella hat Geschmack. Und Durst.'),
    tuch('gruen', [1078, 140], 'grün', 'Zwischen den Pflanzen auf dem grünen Balkon liegt ein grünes Seidentuch, ordentlich gefaltet, mit einem Lesezeichen darin. Typisch Serenity.'),
    {
      id: 'haustelefon', at: [1384, 572], radius: 64, label: 'Haustelefon: Portier Albert abwimmeln', kind: 'check', check: 'gc-144',
      when: Q_AKTIV, hideWhen: { flag: 'alte-gewohnheiten-albert-abgewimmelt' },
      lines: [
        { speaker: 'player', text: '„Albert? Hier ist die Floristin. Ich hab die Rosen im falschen Stock abgestellt, können Sie im Keller nachsehen? Alle Keller. Gründlich.“' },
        { speaker: 'narrator', text: 'Albert seufzt wie ein Mann, der seit dreißig Jahren falsche Rosen sucht. „Sehr wohl.“ Klick.' },
      ],
      effects: [{ setFlag: 'alte-gewohnheiten-albert-abgewimmelt' }, { message: 'Portier Albert sucht jetzt im Keller nach Rosen. Ihr habt Zeit.' }],
      altText: 'Deine Stimme zittert wie Wackelpudding. Lass es lieber und seid einfach schnell – oder schleicht an der Diele vorbei.',
    },
    {
      id: 'bijou', at: [866, 690], radius: 74, label: 'Bijou ein Schrauben-Leckerli geben', kind: 'use',
      when: { all: [Q_AKTIV, { item: 'leckerli-schraube' }] }, hideWhen: { flag: 'alte-gewohnheiten-bijou-ruhig' },
      lines: say('Bijou öffnet ein Auge, schnuppert, schnappt sich die Schraube und kaut zufrieden mit leisem Mahlgeräusch. Dann rollt sie sich wieder ein und schnarcht elektrisch.'),
      effects: [{ take: 'leckerli-schraube' }, { setFlag: 'alte-gewohnheiten-bijou-ruhig' }],
    },
    {
      id: 'bijou-look', at: [866, 690], radius: 74, label: 'Bijou', kind: 'look',
      when: { all: [Q_AKTIV, { noItem: 'leckerli-schraube' }] }, hideWhen: { flag: 'alte-gewohnheiten-bijou-ruhig' },
      lines: say('Bijou, der Roboterpudel, schläft auf dem Sofa, eine Schleife am Ohr, ein Sensor blinkt im Takt seines Schnarchens.',
        'Ein Schrauben-Leckerli würde sie garantiert ruhig halten. Ohne eins: Zehenspitzen.'),
    },
    {
      id: 'bibliothek', at: [300, 720], label: 'Bibliothek', kind: 'look',
      lines: say('Erstausgaben, in Leder gebunden, nach Farbe sortiert. Ein Buch heißt „Wie man Bedienstete motiviert, ohne sie anzusehen“. Es hat Randnotizen.'),
    },
    {
      id: 'champagnerwagen', at: [448, 728], label: 'Champagnerwagen', kind: 'look',
      lines: say('Champagner, der älter ist als du. Daneben ein Glas mit Lippenstiftrand in Rot. Sybella war zuletzt hier. Mit Durst.'),
    },
    {
      id: 'kristall', at: [1040, 568], label: 'Kristall auf dem Sockel', kind: 'look',
      lines: say('Ein violetter Kristall, so groß wie ein Babykopf, auf einem Sockel mit Alarmsensor. Raven sieht ihn nicht mal an. Profis üben heute nur.'),
    },
    {
      id: 'waeschekammer', at: [360, 826], label: 'Wäschekammer', kind: 'look',
      lines: say('Zwei Waschmaschinen, die leiser schnurren als dein Kühlschrank. Daneben die Klappe des Wäscheschachts – ein Weg nach unten, siebenundvierzig Stockwerke Seide.'),
    },
    {
      id: 'drohnen-schlafen', at: [1290, 826], label: 'Drohnen-Nische', kind: 'look',
      when: { flag: 'alte-gewohnheiten-getarnt' },
      lines: say('Drei Wachdrohnen schlafen in ihren Ladeschalen, die Lichter auf Rot gedimmt. Für sie seid ihr eine Blumenlieferung. Eine sehr leise.'),
    },
  ],
  npcs: [],
  encounters: [
    {
      id: 'penthouse-drohnen', encounter: 'enc-penthouse-drohnen', at: [1290, 816], sprite: 'spaeherdrohne-walk', radius: 56,
      patrol: [[1420, 816], [700, 816], [520, 800], [1000, 800]],
      when: { all: [Q_AKTIV, { notFlag: 'alte-gewohnheiten-getarnt' }] },
      avoid: 'gc-142',
    },
  ],
  foreground: [
    { rect: [478, 600, 64, 90], baseY: 780 }, { rect: [1026, 600, 60, 90], baseY: 780 },
    { rect: [182, 120, 262, 80], baseY: 342 },
  ],
  lights: [
    { at: [776, 450], radius: 220, color: '#ffd89a', intensity: 0.7 },
    { at: [230, 220], radius: 140, color: '#ffcf7a', intensity: 0.5 },
    { at: [500, 200], radius: 110, color: '#ffcf7a', intensity: 0.5 },
    { at: [834, 230], radius: 140, color: '#ff8a7a', intensity: 0.4 },
    { at: [1272, 220], radius: 140, color: '#c8ff9a', intensity: 0.4 },
    { at: [218, 600], radius: 120, color: '#ffcf7a', intensity: 0.5 },
    { at: [1195, 560], radius: 110, color: '#ffcf7a', intensity: 0.5 },
    { at: [1290, 880], radius: 170, color: '#ff3b3b', intensity: 0.6 },
    { at: [170, 820], radius: 80, color: '#ff3b3b', intensity: 0.4 },
  ],
  ambience: 'innen',
  music: 'schleichen',
  onEnter: [{ id: 'chrome-penthouse-ankunft', once: true, when: Q_AKTIV, dialogue: 'chrome-penthouse-ankunft' }],
};

const DIALOGUES: Record<string, DialogueDef> = {
  'chrome-penthouse-ankunft': {
    id: 'chrome-penthouse-ankunft', start: 'a',
    nodes: [{
      id: 'a',
      lines: [
        { speaker: 'narrator', text: 'Das Penthouse der Chrome-Schwestern. Marmor, Kristall, ein Kronleuchter, der aussieht, als würde er Steuern hinterziehen. Alles schläft.' },
        { speaker: 'raven', expr: 'signatur', text: 'Regeln: Nichts anfassen, was piept. Nichts anfassen, was schnarcht. Und nichts mitnehmen. Wir üben nur.' },
        { speaker: 'raven', text: 'Seraphinas Zimmer ist das blaue. Ich male, du stehst Schmiere. Wenn Albert kommt, bist du eine Vase.' },
        { speaker: 'player', text: 'Ich war schon immer eine sehr überzeugende Vase.' },
      ],
    }],
  },
  'chrome-penthouse-spiegel': {
    id: 'chrome-penthouse-spiegel', start: 'a',
    nodes: [
      {
        id: 'a',
        lines: [
          { speaker: 'narrator', text: 'Seraphinas Schminkspiegel. Im Goldrahmen spiegeln sich zwei Einbrecher, ein Himmelbett und eine schlafende Frau, die im Traum Vorstandssitzungen leitet.' },
          { speaker: 'raven', expr: 'signatur', text: 'Schwarzer Lippenstift. Matt, kussecht, perfekt für Kunst und schlechte Entscheidungen.' },
        ],
        choices: [
          { text: '„Mal ihn groß. Sie soll ihn vom Bett aus sehen.“', next: 'gross' },
          { text: '„Klein und elegant. Wie eine Unterschrift.“', next: 'klein' },
          { text: '„Mal ihm ein Krönchen auf. Für die Hausherrin.“', next: 'krone' },
        ],
      },
      {
        id: 'gross', next: 'ende',
        lines: [{ speaker: 'raven', expr: 'freude', text: 'Groß ist was für Amateure. Aber gut, ein bisschen Angeberei hat sie verdient.' }],
      },
      {
        id: 'klein', next: 'ende',
        lines: [{ speaker: 'raven', expr: 'zaertlich', text: 'Du lernst schnell. Klein ist gemein. Sie wird es erst beim dritten Blick sehen und dann wochenlang nicht mehr schlafen.' }],
      },
      {
        id: 'krone', next: 'ende',
        lines: [{ speaker: 'raven', expr: 'freude', text: 'Ein Rabe mit Krone. Frech. Gefällt mir. Sag es keinem.' }],
      },
      {
        id: 'ende',
        lines: [
          { speaker: 'narrator', text: 'Drei schnelle Striche, ein Schnabel, ein Flügel. Ein kleiner schwarzer Rabe sitzt auf dem Spiegel, als hätte er schon immer da gesessen.' },
          { speaker: 'raven', expr: 'signatur', text: 'Fertig. Jetzt raus, bevor Albert seine Runde dreht. Zum Aufzug – oder wie wir reingekommen sind.' },
        ],
        effects: [{ setFlag: 'alte-gewohnheiten-rabe-gemalt' }, { markSeen: 'penthouse-rabe' }],
      },
    ],
  },
};

export const part: ContentPart = { maps: { 'chrome-penthouse': penthouse }, dialogues: DIALOGUES };
