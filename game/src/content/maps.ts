// TESTINHALT – Karten. Wird durch die echten Zonen aus docs/world.md ersetzt.
// Koordinaten in Kartenpixeln; Geometrie später am fertigen Bild nachziehen (scripts/map_tool.mjs).
import type { MapDef, Polygon, Rect } from '../modules/contracts';

/** Rechteck als Polygon (im Uhrzeigersinn). */
const box = ([x, y, w, h]: Rect): Polygon => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];

const testStrasse: MapDef = {
  id: 'test-strasse',
  name: 'Teststraße',
  subtitle: 'Unterstadt',
  size: [1536, 1024],
  district: 'test-unterstadt',
  lighting: 'outdoor',
  bg: 'bg-test-strasse',
  walk: [box([32, 380, 1472, 600])],
  block: [box([620, 640, 200, 110])],
  exits: [
    { id: 'tuer', rect: [1180, 372, 120, 40], to: 'test-innen', entry: 'tuer', label: 'In den Unterschlupf' },
    {
      id: 'hintertuer', rect: [32, 600, 36, 160], to: 'test-innen', entry: 'hinten', label: 'Hintertür',
      interact: true, check: 'test-schloss', lockedText: 'Abgeschlossen. Der Vordereingang ist offen.',
    },
  ],
  entries: {
    start: { at: [240, 760], facing: 'e' },
    tuer: { at: [1240, 460], facing: 's' },
    hinten: { at: [120, 680], facing: 'e' },
    station: { at: [400, 470], facing: 's' },
  },
  spots: {
    ecke: { at: [520, 480], facing: 's' },
    stand: { at: [960, 480], facing: 's' },
  },
  hotspots: [
    {
      id: 'automat', at: [760, 420], label: 'Snackautomat ansehen', kind: 'look',
      lines: [{ speaker: 'narrator', text: 'Der Automat summt. Im Fach liegt ein einzelner Proteinriegel – seit 2079.' }],
    },
    { id: 'kiosk', at: [1000, 420], label: 'Kiosk', kind: 'shop', shop: 'test-kiosk' },
    { id: 'tafel', at: [1100, 420], label: 'Auftragstafel', kind: 'board', board: 'test-tafel' },
    { id: 'bildschirm', at: [300, 420], label: 'Nachrichten ansehen', kind: 'screen' },
    {
      id: 'kiste', at: [1400, 900], label: 'Kiste aufstemmen', kind: 'check', check: 'test-kiste', once: true,
      effects: [{ give: 'synth-kaffee', qty: 2 }, { message: 'In der Kiste: zwei Becher Synth-Kaffee. Noch warm. Verdächtig.' }],
      altText: 'Zu schwer. Mit mehr Körper ginge es – oder du lässt sie einfach stehen.',
    },
  ],
  encounters: [
    { id: 'schlaeger', encounter: 'test-schlaeger', at: [1300, 780], sprite: 'wache-walk', patrol: [[1300, 780], [1420, 780]], avoid: 'test-einschuechtern' },
  ],
  lights: [
    { at: [1000, 400], radius: 160, color: '#ff3fa4', slots: ['abend', 'nacht'] },
    { at: [300, 400], radius: 120, color: '#3ef2ff', slots: ['abend', 'nacht'] },
  ],
  ambient: {
    count: 2,
    sprites: ['barkeeper-walk', 'kameramann-walk'],
    routes: [[[200, 900], [1300, 900]], [[600, 560], [1400, 560]]],
    barks: [{ text: 'Hast du mal ’nen Credit?' }, { text: 'Schon wieder Smog-Alarm …', when: { time: 'morgen' } }],
    bySlot: { nacht: 1 },
  },
  station: 'test-station',
  ambience: 'unterstadt',
  onEnter: [{ id: 'ankunft', once: true, effects: [{ setFlag: 'test-angekommen' }] }],
};

const testInnen: MapDef = {
  id: 'test-innen',
  name: 'Testunterschlupf',
  subtitle: 'Innenraum',
  size: [1024, 768],
  district: 'test-unterstadt',
  lighting: 'indoor',
  bg: 'bg-test-innen',
  walk: [box([32, 300, 960, 440])],
  block: [box([420, 440, 180, 90])],
  exits: [{ id: 'raus', rect: [440, 716, 144, 52], to: 'test-strasse', entry: 'tuer', label: 'Auf die Straße' }],
  entries: {
    tuer: { at: [512, 680], facing: 'n' },
    hinten: { at: [100, 420], facing: 'e' },
  },
  spots: {
    tresen: { at: [700, 360], facing: 's' },
    werkbank: { at: [260, 360], facing: 's' },
  },
  hotspots: [
    { id: 'telefon', at: [600, 330], label: 'Telefon', kind: 'phone' },
    {
      id: 'poster', at: [860, 330], label: 'Poster ansehen', kind: 'look',
      lines: [{ speaker: 'narrator', text: '„High Voltage – heute: Neon-Karaoke.“ Jemand hat einen Schnurrbart dazugemalt.' }],
    },
  ],
  bed: { at: [880, 640], label: 'Auf der Pritsche schlafen' },
  ambience: 'innen',
};

export const MAPS: Record<string, MapDef> = {
  [testStrasse.id]: testStrasse,
  [testInnen.id]: testInnen,
};
