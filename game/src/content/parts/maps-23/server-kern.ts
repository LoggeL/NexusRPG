// Innenraum Serverkern (world.md §3.5 quantum-campus, §5.4 main-3-nexus, §5.5 Enden, §6.4; ID-Plan design/plan/act23.json · pkg-quantum-turm).
// Erreichbar nur über den Kernschacht im quantum-labor (ab main-3-nexus bzw. im Nachspiel).
// Boss enc-kern-nexus (+ Fassungen …-ohne-garde, …-fx60, …-fx60-ohne-garde, …-herz) und die Upload-Entscheidung legt der
// Quest-Agent von main-3-nexus per mapAdditions an die Spots `kern`, `upload-konsole`, `fx60-anschluss` (Hotspot-IDs laut
// Plan: kern, upload-konsole, fx60-anschluss). side-zweite-chance (gc-101/gc-102) und side-offene-werkstatt (gc-141) ebenso.
// Diese Karte liefert Geometrie, Spots, Stimmung und Blick-Hotspots, die sich ausblenden, solange main-3-nexus läuft.
// Hintergrund: Grundbild = Kampf (Knoten glühen); `ruhig` nach main-3-nexus bzw. im Nachspiel; `stadtnetz` nach side-offene-werkstatt.
import type { Condition, DialogueDef, DialogueLine, HotspotDef, MapDef, Polygon, Rect } from '../../../modules/contracts';
import type { ContentPart } from '../../part';

const box = ([x, y, w, h]: Rect): Polygon => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
const say = (...texts: string[]): DialogueLine[] => texts.map(text => ({ speaker: 'narrator', text }));

const EPILOG: Condition = { flag: 'epilog' };
const NEXUS_AKTIV: Condition = { quest: 'main-3-nexus', state: 'active' };
const NEXUS_DONE: Condition = { quest: 'main-3-nexus', state: ['done', 'failed'] };
const MASTER: Condition = { all: [{ any: [{ flag: 'master_modus' }, { flag: 'ende_master' }] }, { notFlag: 'ende_doch_noch_meer' }] };
/** Stadtnetz: side-offene-werkstatt erledigt (bzw. das Flag, falls die Quest es beim gc-141-Umbau setzt). */
const STADTNETZ: Condition = { any: [{ flag: 'serverkern_stadtnetz' }, { quest: 'side-offene-werkstatt', state: 'done' }] };
const WERKSTATT_AKTIV: Condition = { quest: 'side-offene-werkstatt', state: 'active' };
const ZWEITE_CHANCE_AKTIV: Condition = { quest: 'side-zweite-chance', state: 'active' };

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

const hotspots: HotspotDef[] = [
  ...look('kern-blick', [531, 482], 'Der Kern', [
    { when: STADTNETZ, lines: [
      'Der Kern leuchtet grün. Durch jede Leitung fließt jetzt Stadtnetz: Fahrpläne, Kochrezepte, Lios Demos, Kikis Klatsch. Zum ersten Mal denkt hier etwas für alle.',
      'Es summt. Fast wie ein Lied. Wahrscheinlich Polka. Radio Rost hat abgefärbt.',
    ] },
    { when: MASTER, lines: [
      'Der Kern schnurrt, als du näher kommst. Ein tiefes, zufriedenes Brummen. „Guten Abend, Master. Alles läuft nach Plan. Ihrem Plan.“',
      'Es klingt wie ein Kompliment. Es fühlt sich an wie eine Leine.',
    ] },
    { when: { flag: 'ende_neue_nexus' }, lines: [
      'Der Kern ist dunkel. Nexus wohnt nicht mehr hier. Sie hat einen Zettel an den Sockel geklebt: „Bin umgezogen. Danke für alles. Bitte Licht aus. – Kollegin N.“',
    ] },
    { when: { any: [NEXUS_DONE, EPILOG] }, lines: [
      'Der Kern ist still. Eine dunkle Glaskugel, tief drin ein Rest Cyan, wie Glut nach einem Lagerfeuer. Kein Gesicht mehr. Keine Stimme.',
      'Du merkst, dass du flüsterst. Wie in einer Kirche. Oder an einem Krankenbett.',
    ] },
    { lines: [
      'Der Kern. Eine Kugel aus Licht, halb cyan, halb rot, in Ringen und Kabeln aufgehängt. Sie pulsiert. Wenn du hinsiehst, pulsiert sie schneller.',
    ] },
  ], 60, { any: [NEXUS_AKTIV, ZWEITE_CHANCE_AKTIV, WERKSTATT_AKTIV] }),
  ...look('knoten-logik-blick', [740, 215], 'Logik-Knoten', [
    { when: { any: [NEXUS_DONE, EPILOG] }, lines: ['Der Logik-Knoten ist dunkel. Im Käfig klebt ein Fetzen Faxpapier: „ICH HABE IHN VERWIRRT. GERN GESCHEHEN. FX-60.“'] },
    { lines: ['Ein blauer Kristall im Käfig. Er rechnet so schnell, dass er brummt. Wenn man ihn ansieht, fühlt man sich dumm. Xion würde ihn hassen.'] },
  ], 56, NEXUS_AKTIV),
  ...look('knoten-kontrolle-blick', [770, 365], 'Kontroll-Knoten', [
    { when: { any: [NEXUS_DONE, EPILOG] }, lines: ['Der Kontroll-Knoten ist aus. Irgendwo in der Stadt sagt gerade jemand zum ersten Mal seit Wochen „Nein“. Einfach so. Weil er kann.'] },
    { lines: ['Ein pinker Kristall. Von ihm gehen tausend dünne Fäden aus, die du nicht siehst, aber spürst. Ein Chip im Nacken jeder Person auf der Party hängt hier dran.'] },
  ], 56, NEXUS_AKTIV),
  ...look('knoten-stimme-blick', [740, 545], 'Stimm-Knoten', [
    { when: { any: [NEXUS_DONE, EPILOG] }, lines: ['Der Stimm-Knoten ist still. Gut so. Du hörst nur noch deine eigene Stimme im Kopf. Die ist auch nicht immer nett, aber wenigstens deine.'] },
    { lines: ['Ein violetter Kristall. Er flüstert. Mit Arias Stimme, mit Hunters, mit deiner Mutter. Er sagt: „Du kannst jetzt aufhören.“ Du hörst nicht auf ihn.'] },
  ], 56, NEXUS_AKTIV),
  ...look('kabelkanal', [285, 275], 'Kabelkanäle', [
    { when: STADTNETZ, lines: ['Die Kabelkanäle glühen grün. Durch einen fließt gerade ein Katzenvideo nach dem anderen. Die Unterstadt hat Prioritäten.'] },
    { when: { any: [NEXUS_DONE, EPILOG] }, lines: ['Die Kabelkanäle sind dunkel. Nur ab und zu zuckt ein Lichtpunkt durch, wie ein Gedanke, der vergessen hat, wohin er wollte.'] },
    { lines: [
      'Offene Kanäle voller Kabel, die leuchten wie Flüsse aus Licht. Durch sie läuft die Firewall, wenn der Kern wütend wird: eine Welle, die alles mitreißt, was nicht rechtzeitig springt.',
    ] },
  ], 70),
  ...look('terminal-halten-blick', [260, 575], 'Wartungsterminal', [
    { when: { any: [NEXUS_DONE, EPILOG] }, lines: ['Das Wartungsterminal zeigt eine ruhige blaue Welle. Und eine Statistik: „Ausfallzeit: 100 %. Zufriedenheit: unbekannt.“'] },
    { lines: ['Ein Wartungsterminal auf einem Sockel. Wer hier steht, kann den Kern ein paar Atemzüge lang festhalten. Nyra hätte es in drei Sekunden geknackt. Du brauchst länger. Viel länger.'] },
  ], 56, NEXUS_AKTIV),
  ...look('upload-konsole-blick', [530, 558], 'Upload-Konsole', [
    { when: STADTNETZ, lines: ['Auf der Konsole klebt ein Plan in Kinderschrift: „Stadtnetz – für alle. Bitte nicht Master sagen. Strafe: 1 Keks.“ Daneben liegt ein angebissener Keks.'] },
    { when: { flag: 'upload_stick' }, lines: ['In der Upload-Buchse steckt noch Hunters Stick, mit Klebeband fixiert. Auf dem Klebeband: „NICHT RAUSZIEHEN. GESCHICHTE.“'] },
    { when: { any: [NEXUS_DONE, EPILOG] }, lines: ['Die Upload-Konsole. Hier hast du entschieden. Der große Knopf in der Mitte glimmt noch ein bisschen, als wüsste er es noch.'] },
    { lines: ['Eine geschwungene Konsole mit drei Bildschirmen und einem einzigen großen Knopf in der Mitte. Wer hier etwas hochlädt, spricht mit der ganzen Stadt. Oder mit ihrem Gehirn.'] },
  ], 50, { any: [NEXUS_AKTIV, WERKSTATT_AKTIV, ZWEITE_CHANCE_AKTIV] }),
  ...look('fx60-anschluss-blick', [270, 500], 'Alter Digitech-Anschluss', [
    { when: { quest: 'side-eingehendes-fax', state: 'done' }, lines: [
      'Ein beiger Kasten aus der Digitech-Zeit, mit Staub, Faxbuchse und dem Charme einer Steuererklärung. FX-60 würde hier perfekt reinpassen. FX-60 würde hier wahrscheinlich weinen. Vor Freude. In Großbuchstaben.',
    ] },
    { lines: [
      'Ein beiger Kasten aus der Digitech-Zeit, mitten zwischen dem Hightech. Faxbuchse, Kurbel, ein Etikett: „Wartungszugang – nicht entfernen“. Den hat Quantum einfach überbaut. Wie alles.',
    ] },
  ], 56, NEXUS_AKTIV),
  ...look('steg-abgrund', [110, 360], 'Steg über dem Schacht', [
    { lines: [
      'Der Steg führt über einen Schacht, so tief, dass unten nur noch Lichtpunkte sind. Vielleicht Server. Vielleicht Sterne. Vielleicht der Hausmeister mit Taschenlampe.',
      'Nicht runtergucken. Du guckst runter. Natürlich guckst du runter.',
    ] },
  ], 50),
];

const kern: MapDef = {
  id: 'server-kern',
  name: 'Serverkern',
  subtitle: 'Quantum-Campus · Tief im Turm',
  size: [1024, 768],
  district: 'oberstadt',
  lighting: 'indoor',
  bg: 'bg-server-kern',
  bgVariants: [
    { when: STADTNETZ, bg: 'bg-server-kern-stadtnetz' },
    { when: { any: [NEXUS_DONE, EPILOG] }, bg: 'bg-server-kern-ruhig' },
  ],
  walk: [[[0, 332], [156, 332], [156, 130], [910, 130], [910, 696], [156, 696], [156, 442], [0, 442]]],
  block: [
    // Kern: Kugel und Sockel
    [[430, 165], [640, 165], [655, 330], [671, 382], [650, 450], [531, 468], [410, 450], [390, 382], [405, 330]],
    box([475, 128, 120, 40]), // Kabelstrang zur Decke
    box([168, 131, 230, 124]), // Kabelkanäle
    box([768, 160, 98, 100]), // Logik-Knoten
    box([800, 305, 100, 115]), // Kontroll-Knoten
    box([768, 488, 98, 112]), // Stimm-Knoten
    box([156, 455, 90, 96]), // Digitech-Anschluss
    box([228, 590, 64, 86]), // Wartungsterminal
    box([401, 574, 256, 122]), // Upload-Konsole
  ],
  exits: [
    { id: 'nach-quantum-labor', rect: [0, 335, 50, 104], to: 'quantum-labor', entry: 'von-server-kern', label: 'Steg zurück ins Labor', interact: true, minutes: 5 },
  ],
  entries: {
    'von-quantum-labor': { at: [70, 387], facing: 'e' },
  },
  spots: {
    'eingang-steg': { at: [70, 387], facing: 'e' },
    kern: { at: [531, 495], facing: 'n' },
    'knoten-logik': { at: [740, 215], facing: 'e' },
    'knoten-kontrolle': { at: [770, 365], facing: 'e' },
    'knoten-stimme': { at: [740, 545], facing: 'e' },
    'upload-konsole': { at: [530, 555], facing: 's' },
    'terminal-halten': { at: [260, 575], facing: 's' },
    kabelkanal: { at: [285, 275], facing: 'n' },
    'fx60-anschluss': { at: [270, 500], facing: 'w' },
  },
  hotspots,
  lights: [
    { at: [480, 270], radius: 230, color: '#3ef2ff', intensity: 0.6 },
    { at: [600, 270], radius: 230, color: '#ff3a6e', intensity: 0.55 },
    { at: [817, 205], radius: 110, color: '#5fe0ff', intensity: 0.5 },
    { at: [850, 360], radius: 110, color: '#ff4fd8', intensity: 0.5 },
    { at: [817, 540], radius: 110, color: '#b06bff', intensity: 0.5 },
    { at: [530, 610], radius: 140, color: '#3ef2ff', intensity: 0.45 },
    { at: [280, 195], radius: 140, color: '#ff4fd8', intensity: 0.35 },
  ],
  ambience: 'labor',
  music: 'ki-nexus',
  onEnter: [
    { id: 'server-kern-ankunft', once: true, when: { not: { any: [NEXUS_DONE, EPILOG] } }, dialogue: 'server-kern-ankunft', effects: [{ markSeen: 'server-kern-betreten' }] },
    { id: 'server-kern-stille', once: true, when: { all: [{ any: [NEXUS_DONE, EPILOG] }, { not: STADTNETZ }, { not: MASTER }] }, dialogue: 'server-kern-stille' },
    { id: 'server-kern-master', once: true, when: MASTER, dialogue: 'server-kern-master' },
  ],
  fastTravel: { to: 'quantum-foyer', entry: 'von-quantum-labor' },
};

const DIALOGUES: Record<string, DialogueDef> = {
  'server-kern-ankunft': {
    id: 'server-kern-ankunft', start: 'a',
    nodes: [{
      id: 'a',
      lines: [
        { speaker: 'narrator', text: 'Der Steg federt unter deinen Schritten. Unter dir ein Schacht ohne Boden, vor dir ein Raum wie eine Kathedrale aus Kabeln.' },
        { speaker: 'narrator', text: 'In der Mitte schwebt Nexus: eine Kugel aus Licht, halb cyan, halb rot. Sie dreht sich nicht zu dir. Sie muss nicht. Sie weiß längst, dass du da bist.' },
      ],
    }],
  },
  'server-kern-stille': {
    id: 'server-kern-stille', start: 'a',
    nodes: [{
      id: 'a',
      lines: [
        { speaker: 'narrator', text: 'Der Serverkern ist still. Die Knoten sind dunkel, die Kabelflüsse nur noch Rinnsale aus Licht. Kein Brummen, kein Flüstern.' },
        { speaker: 'narrator', text: 'Es ist der ruhigste Ort der Stadt. Wer hätte gedacht, dass ausgerechnet hier mal Frieden ist.' },
      ],
    }],
  },
  'server-kern-master': {
    id: 'server-kern-master', start: 'a',
    nodes: [{
      id: 'a',
      lines: [
        { speaker: 'narrator', text: 'Der Kern glüht violett, als du den Steg betrittst. Nur für dich. Die Knoten summen eine Melodie, die du nicht bestellt hast.' },
        { speaker: 'ki-nexus', text: 'Willkommen zu Hause, Master. Die Stadt schläft. Alle. Gleichzeitig. Ich dachte, das gefällt Ihnen.' },
        { speaker: 'player', text: 'Hm.' },
        { speaker: 'ki-nexus', text: 'Ich interpretiere „Hm“ als Zustimmung. Ich interpretiere alles als Zustimmung, Master.' },
      ],
    }],
  },
};

export const part: ContentPart = { maps: { 'server-kern': kern }, dialogues: DIALOGUES };
