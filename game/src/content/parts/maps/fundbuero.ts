// Innenraum Fundbüro (world.md §3.5/§3.6/§3.9 akt-fundbuero, Plan maps.fundbuero, Paket pkg-bahnhof-mitte).
// Geöffnet morgens und tagsüber (Ausgang in bahnhof-mitte sperrt sonst). Bild 1152×768.
import type { MapDef, Polygon, Rect } from '../../../modules/contracts';
import type { ContentPart } from '../../part';

const box = ([x, y, w, h]: Rect): Polygon => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
const n = (text: string) => ({ speaker: 'narrator' as const, text });

const fundbuero: MapDef = {
  id: 'fundbuero',
  name: 'Fundbüro',
  subtitle: 'Bahnhof Mitte',
  size: [1152, 768],
  district: 'unterstadt',
  lighting: 'indoor',
  bg: 'bg-fundbuero',
  ambience: 'innen',
  walk: [
    box([49, 420, 1053, 304]), // Kundenbereich vor dem Tresen
    box([949, 292, 153, 136]), // Durchgang rechts neben dem Tresen
  ],
  block: [
    box([49, 495, 259, 225]), // Kiste mit Fundsachen
    box([773, 518, 112, 172]), // Schirmständer
    box([893, 446, 210, 255]), // Garderobe
    box([491, 596, 173, 128]), // Türrahmen
  ],
  foreground: [
    { rect: [49, 470, 259, 250], baseY: 718 },
    { rect: [893, 430, 210, 270], baseY: 700 },
  ],
  exits: [
    { id: 'nach-bahnhof-mitte', rect: [500, 578, 155, 146], to: 'bahnhof-mitte', entry: 'von-fundbuero', label: 'Zurück in die Halle', interact: true },
  ],
  entries: {
    'von-bahnhof-mitte': { at: [574, 572], facing: 'n' },
  },
  spots: {
    schalter: { at: [975, 345], facing: 'w' },
    regale: { at: [1020, 305], facing: 'n' },
    'kuriositaeten-kiste': { at: [332, 600], facing: 'w' },
  },
  hotspots: [
    { id: 'fundbuero', at: [430, 434], radius: 64, label: 'Fundbüro-Schalter', kind: 'shop', shop: 'fundbuero' },
    {
      id: 'klingel', at: [600, 434], radius: 48, label: 'Klingel drücken', kind: 'look',
      lines: [
        n('Ding!'),
        { speaker: 'gerda-gleis', text: 'Ja, ja, ich hab Ohren. Drei Paar sogar. Liegen alle da hinten im Regal, Fach K.' },
      ],
    },
    {
      id: 'besitzer-finden', at: [322, 560], radius: 70, label: 'Fundsachen zurückbringen', kind: 'use', when: { time: 'tag' }, daily: true,
      lines: [n('Gerda kippt dir eine Handvoll Fundsachen hin: „Such die Besitzer. Wer’s schafft, kriegt Finderlohn. Wer’s versaut, kriegt einen Vortrag.“')],
      effects: [{
        minigame: 'akt-fundbuero', level: 1, key: 'fundbuero-besitzer', label: 'Besitzer finden',
        win: [
          { credits: 25 }, { rep: 'unterstadt', delta: 2 }, { advanceTime: 30 },
          { message: 'Ein Gebiss, ein Teddy und eine Tuba sind wieder zu Hause. Gerda zahlt 25 Cr Finderlohn und nickt fast anerkennend.' },
        ],
        lose: [{ advanceTime: 30 }, { message: 'Der Teddy ging an einen Rostzahn. Er hat sich gefreut. Gerda nicht.' }],
      }],
    },
    {
      id: 'kiste-ansehen', at: [322, 560], radius: 70, label: 'Fundkiste ansehen', kind: 'look', when: { not: { time: 'tag' } },
      lines: [n('Die Kiste quillt über: Handschuhe, eine Tastatur, ein Teddy mit Fliege. Gerda sortiert erst ab zehn. „Vorher bin ich selbst ein Fundstück.“')],
    },
    {
      id: 'regale', at: [1020, 300], label: 'Regale durchstöbern', kind: 'look',
      lines: [
        n('Regal F: eine Tuba, ein ausgestopftes Krokodil, ein Gartenzwerg mit Cyberauge. Der Zwerg zwinkert. Bestimmt nur ein Wackelkontakt.'),
        n('Regal R: ein Roboterarm mit Zettel: „Bitte nicht füttern.“ Daneben zwei Motorradhelme und ein Vogelkäfig ohne Vogel. Der Vogel liegt in Regal V.'),
      ],
    },
    {
      id: 'fragezeichen', at: [800, 434], radius: 48, label: 'Schild ansehen', kind: 'look',
      lines: [n('Ein Pappschild mit einem Fragezeichen. Auf der Rückseite: „Wer hier fragt, wo seine Würde ist: Die hat noch keiner abgegeben.“')],
    },
    {
      id: 'schirmstaender', at: [830, 504], radius: 48, label: 'Schirmständer', kind: 'look',
      lines: [n('Einundvierzig Regenschirme. In der Unterstadt regnet es Rost. Keiner von denen hat das überlebt.')],
    },
  ],
  lights: [
    { at: [292, 72], radius: 170, color: '#ffc46b', intensity: 0.6 },
    { at: [581, 70], radius: 170, color: '#ffc46b', intensity: 0.6 },
    { at: [971, 66], radius: 170, color: '#ffc46b', intensity: 0.6 },
    { at: [161, 440], radius: 190, color: '#ffbe5a', intensity: 0.7 },
    { at: [574, 660], radius: 140, color: '#3ef2ff', intensity: 0.5 },
    { at: [600, 20], radius: 160, color: '#3ef2ff', intensity: 0.35 },
    { at: [220, 20], radius: 160, color: '#ff3fd0', intensity: 0.35 },
  ],
  onEnter: [
    {
      id: 'fundbuero-erstbesuch', once: true,
      effects: [{ markSeen: 'zone:fundbuero' }, { message: 'Das Fundbüro. Hier landet alles, was die Unterstadt verliert. Außer Hoffnung, die gibt keiner ab.' }],
    },
  ],
};

export const part: ContentPart = {
  maps: { [fundbuero.id]: fundbuero },
};
