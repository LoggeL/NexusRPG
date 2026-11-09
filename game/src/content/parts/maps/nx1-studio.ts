// Innenraum NX-1-Studio (Mittelring, Akt 1) – Paket pkg-stufenplatz-digitech.
// Größe abweichend vom Plan (1024×768) als 1536×1024: Das Bild ist im Zonenmaßstab gemalt (Tür ~110 px), so bleiben
// Figuren und Möbel im selben Verhältnis wie auf dem Stufenplatz.
// Frei gelassen für Figuren/Quests: Hotspot-IDs `radio-mikro` (he-collin-charleston-2) und `story-pitch`
// (side-live-dabei, prep-ablenkung) – die Zone legt dort nur Blick-Hotspots mit eigenen IDs an.
import type { Condition, DialogueDef, HotspotDef, MapDef } from '../../../modules/contracts';
import type { ContentPart } from '../../part';

const geoeffnet: Condition = { time: ['morgen', 'tag', 'abend'] };

const hotspots: HotspotDef[] = [
  {
    id: 'redaktions-terminal', at: [606, 612], radius: 60, label: 'Redaktionsrechner hacken', kind: 'use',
    when: { not: { hearts: 'collin-charleston', min: 2 } },
    hideWhen: { wonMinigame: 'nx1-redaktion' },
    lines: [{ speaker: 'narrator', text: 'Ein Redaktionsrechner, eingeloggt, Bildschirmschoner: Collin, der in Zeitlupe zwinkert. Niemand guckt hin.' }],
    effects: [{
      minigame: 'akt-hacken', level: 3, key: 'nx1-redaktion', label: 'Redaktionsrechner',
      win: [
        { credits: 40 }, { xp: 20 }, { rep: 'nx1-medien', delta: -2 },
        { message: 'Ordner „Exklusiv“: Collins Gehaltsabrechnung, Delyas unveröffentlichte Recherchen und 40 Credits aus der Kaffeekasse-App.' },
      ],
      lose: [{ message: 'Der Bildschirmschoner-Collin hört auf zu zwinkern und starrt dich an. Du gehst lieber mal Kaffee holen.' }],
    }],
  },
  {
    id: 'redaktions-terminal-blick', at: [606, 612], radius: 60, label: 'Redaktionsrechner', kind: 'look',
    when: { hearts: 'collin-charleston', min: 2 },
    lines: [{ speaker: 'narrator', text: 'Collins Bildschirmschoner zwinkert dir zu. Du zwinkerst zurück. Ihr habt jetzt ein Ding.' }],
  },
  {
    id: 'teleprompter', at: [1268, 530], radius: 60, label: 'Teleprompter', kind: 'look',
    lines: [
      { speaker: 'narrator', text: 'Auf dem Teleprompter steht der Text für heute Abend: „Guten Abend, Nexus-Stadt. [ERNST GUCKEN] Die Lage ist [WORT EINSETZEN].“' },
      { speaker: 'narrator', text: 'Darunter in Collins Handschrift auf Klebeband: „NICHT ins Licht niesen. Nie wieder.“' },
    ],
  },
  {
    id: 'radio-kabine-blick', at: [300, 290], radius: 60, label: 'Radiokabine', kind: 'look',
    lines: [
      { speaker: 'narrator', text: 'Eine Glaskabine mit Mikrofon am Schwenkarm. Über der Tür eine rote Lampe. Wenn sie leuchtet, hält das ganze Studio die Luft an. Und den Kaffee.' },
    ],
  },
  {
    id: 'monitorwand', at: [690, 282], radius: 64, label: 'Regie: Monitorwand', kind: 'screen',
    lines: [{ speaker: 'narrator', text: 'Zwölf Monitore, zwölfmal dieselbe Stadt. Auf einem läuft gerade eine Wiederholung von gestern. Sie ist noch genauso schlimm.' }],
  },
  {
    id: 'schminkspiegel-blick', at: [250, 520], radius: 60, label: 'Schminkspiegel', kind: 'look',
    lines: [
      { speaker: 'narrator', text: 'Ein Spiegel mit Glühbirnen, Puderquasten, und auf einem Styroporkopf: eine Perücke in kühnem Pink. Sie sieht besser aus als die meisten Gäste.' },
      { speaker: 'narrator', text: 'Neben dem Spiegel ein Post-it: „Das ist NICHT die Ersatzperücke. Es gibt KEINE Ersatzperücke. – C.“' },
    ],
  },
  {
    id: 'themenwand', at: [96, 604], radius: 60, label: 'Themenwand', kind: 'look',
    lines: [
      { speaker: 'narrator', text: 'Pinnwand der Redaktion. „Taube klaut Brezel“ – durchgestrichen. „Brezel klaut Taube?“ – eingekreist. „Was macht Quantum eigentlich?“ – mit drei Fragezeichen.' },
      { speaker: 'narrator', text: 'Ganz unten, klein: „Gute Geschichten bitte direkt zu Delya. Schlechte zu Collin.“' },
    ],
  },
  {
    id: 'nachrichtenkamera', at: [1062, 440], radius: 60, label: 'Studiokamera', kind: 'look',
    lines: [{ speaker: 'narrator', text: 'Eine Studiokamera, so groß wie ein Kühlschrank. An der Seite klebt ein Sticker: „Ich bin nicht dick, ich bin HD.“' }],
  },
  {
    id: 'empfangsdrohne', at: [1076, 760], radius: 56, label: 'Empfangsdrohne', kind: 'look',
    lines: [
      { speaker: 'narrator', text: '„Willkommen bei NX-1! Haben Sie einen Termin, eine Story oder eine Beschwerde? Beschwerden bitte in die Tonne links. Die Tonne ist das Archiv.“' },
    ],
  },
  {
    id: 'fanshop', at: [1196, 780], radius: 64, label: 'Empfang: NX-1-Fanartikel', kind: 'shop', shop: 'nx1-fanshop',
    when: { time: ['morgen', 'tag'] },
  },
  {
    id: 'nachrichtentisch', at: [1260, 360], radius: 60, label: 'Nachrichtentisch', kind: 'look',
    when: { not: { time: 'abend' } },
    lines: [{ speaker: 'narrator', text: 'Der Nachrichtentisch, poliert wie ein Versprechen. Unter Delyas Stuhl: Turnschuhe. Oben Abendkleid, unten Feierabend.' }],
  },
];

const studio: MapDef = {
  id: 'nx1-studio',
  name: 'NX-1-Studio',
  subtitle: 'Redaktion, Regie, Studio',
  size: [1536, 1024],
  district: 'mittelring',
  lighting: 'indoor',
  bg: 'bg-nx1-studio',
  ambience: 'innen',
  walk: [
    [
      [40, 252], [452, 252], [460, 246], [918, 246], [930, 212], [1500, 212], [1512, 470], [1500, 1010], [40, 1010],
    ],
  ],
  block: [
    // Schminktisch, Perückenschrank, Pflanze links
    [[118, 382], [272, 382], [272, 496], [118, 496]],
    [[254, 380], [322, 380], [322, 442], [254, 442]],
    [[40, 440], [120, 440], [120, 504], [40, 504]],
    // Redaktion: Schreibtischinseln, Pinnwand, Pflanze
    [[160, 560], [620, 560], [620, 702], [160, 702]],
    [[100, 690], [582, 690], [582, 892], [100, 892]],
    [[40, 528], [70, 528], [70, 700], [40, 700]],
    [[40, 700], [100, 700], [100, 770], [40, 770]],
    // Eingang: Wandstücke und Pflanzen neben der Glastür
    [[628, 860], [680, 860], [680, 962], [628, 962]],
    [[908, 860], [956, 860], [956, 962], [908, 962]],
    [[590, 920], [660, 920], [660, 980], [590, 980]],
    [[928, 920], [1010, 920], [1010, 984], [928, 984]],
    [[680, 900], [908, 900], [908, 958], [680, 958]],
    // Empfangstresen
    [[1020, 800], [1362, 800], [1362, 936], [1020, 936]],
    // Studio: Nachrichtentisch, Kamera, Teleprompter, Scheinwerfer
    [[1110, 230], [1420, 230], [1420, 336], [1110, 336]],
    [[1000, 436], [1122, 436], [1122, 482], [1000, 482]],
    [[1222, 470], [1316, 470], [1316, 516], [1222, 516]],
    [[920, 326], [1002, 326], [1002, 366], [920, 366]],
    [[1440, 296], [1512, 296], [1512, 344], [1440, 344]],
    // Kisten, Pflanze, Schrank rechts
    [[1408, 420], [1536, 420], [1536, 556], [1408, 556]],
    [[1428, 650], [1500, 650], [1500, 722], [1428, 722]],
    [[1430, 740], [1536, 740], [1536, 910], [1430, 910]],
  ],
  foreground: [
    { rect: [600, 772, 410, 190], baseY: 962 },
    { rect: [1000, 280, 124, 160], baseY: 482 },
    { rect: [1218, 316, 100, 160], baseY: 516 },
  ],
  exits: [
    {
      id: 'nach-stufenplatz', rect: [684, 958, 222, 56], to: 'stufenplatz', entry: 'von-nx1-studio',
      label: 'Raus auf den Stufenplatz', interact: true,
    },
  ],
  entries: {
    'von-stufenplatz': { at: [794, 990], facing: 'n' },
  },
  spots: {
    'radio-kabine': { at: [238, 290], facing: 'n' },
    schminkspiegel: { at: [200, 530], facing: 'n' },
    redaktion: { at: [664, 640], facing: 'w' },
    regie: { at: [690, 300], facing: 'n' },
    'studio-set': { at: [1186, 372], facing: 's' },
    teleprompter: { at: [1268, 560], facing: 'n' },
    // zusätzliche Punkte
    empfang: { at: [1190, 770], facing: 's' },
    eingang: { at: [794, 990], facing: 'n' },
  },
  hotspots,
  lights: [
    { at: [1080, 110], radius: 160, color: '#fff2cc', intensity: 0.45 },
    { at: [1460, 110], radius: 160, color: '#fff2cc', intensity: 0.45 },
    { at: [1260, 160], radius: 260, color: '#ff4fd8', intensity: 0.35 },
    { at: [690, 140], radius: 220, color: '#4fc3ff', intensity: 0.35 },
    { at: [190, 340], radius: 120, color: '#ffd38a', intensity: 0.5 },
    { at: [1076, 760], radius: 90, color: '#5ad8ff', intensity: 0.5 },
  ],
  onEnter: [
    { id: 'nx1-studio-erstbesuch', once: true, when: geoeffnet, dialogue: 'nx1-studio-ankunft', effects: [{ markSeen: 'nx1-studio-erstbesuch' }] },
  ],
};

const dialogues: Record<string, DialogueDef> = {
  'nx1-studio-ankunft': {
    id: 'nx1-studio-ankunft',
    start: 'a',
    nodes: [{
      id: 'a',
      lines: [
        { speaker: 'narrator', text: 'Das NX-1-Studio. Teppich, der nach neuem Auto riecht, Kabel mit Klebeband auf dem Boden, und überall Licht, das schmeichelt.' },
        { speaker: 'narrator', text: 'Die Empfangsdrohne schwebt heran: „Bitte nicht in die Kameras starren. Die Kameras starren zurück. Vertraglich.“' },
      ],
    }],
  },
};

export const part: ContentPart = {
  maps: { 'nx1-studio': studio },
  dialogues,
};
