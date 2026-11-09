// Innenraum Stillgelegter U-Bahn-Wagen (world.md §3.5/§6.2 side-abzieher, Plan maps.ubahn-wagen, Paket pkg-bahnhof-mitte).
// Versteck von Knut und Kurt (nachts per Tagesablauf am Spot abzieher-lager). Bild 1152×768.
import type { MapDef, Polygon, Rect } from '../../../modules/contracts';
import type { ContentPart } from '../../part';

const box = ([x, y, w, h]: Rect): Polygon => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
const n = (text: string) => ({ speaker: 'narrator' as const, text });

const KISTE_KEY = 'ubahn-beutekiste';

const ubahnWagen: MapDef = {
  id: 'ubahn-wagen',
  name: 'Stillgelegter U-Bahn-Wagen',
  subtitle: 'Bahnhof Mitte · Abstellgleis',
  size: [1152, 768],
  district: 'unterstadt',
  lighting: 'indoor',
  bg: 'bg-ubahn-wagen',
  ambience: 'innen',
  walk: [
    box([225, 334, 750, 142]), // Mittelgang
    box([169, 315, 68, 172]), // Lager zwischen den Matratzen
    box([552, 470, 52, 80]), // Schiebetür
    box([517, 544, 113, 224]), // Laufsteg zum Bahnsteig
  ],
  block: [
    box([432, 240, 108, 112]), // angekettete Beutekiste
  ],
  exits: [
    { id: 'nach-bahnhof-mitte', rect: [520, 700, 110, 68], to: 'bahnhof-mitte', entry: 'von-ubahn-wagen', label: 'Raus auf den Bahnsteig', interact: true },
  ],
  entries: {
    'von-bahnhof-mitte': { at: [578, 456], facing: 'n' },
  },
  spots: {
    'abzieher-lager': { at: [200, 420], facing: 'e' },
    sitzbank: { at: [375, 352], facing: 'n' },
    fahrerkabine: { at: [952, 400], facing: 'e' },
  },
  hotspots: [
    {
      id: 'beutekiste', at: [486, 356], radius: 60, label: 'Beutekiste knacken', kind: 'use',
      hideWhen: { wonMinigame: KISTE_KEY },
      lines: [n('Eine Stahlkiste, mit einer Kette an die Sitzstange gefesselt. Am Schloss klebt ein Zettel: „FINGER WEG. – K. & K.“ Dann klein: „Bitte.“')],
      effects: [{
        minigame: 'akt-schloss', level: 2, key: KISTE_KEY, label: 'Beutekiste',
        win: [
          { credits: 45 }, { give: 'nougatbombe' }, { xp: 10 },
          { message: 'Klick. Drin: 45 Credits in Münzen, eine Nougatbombe und ein Brief: „Lieber Knut, lieber Kurt, esst auch mal Gemüse. Mama.“' },
        ],
        lose: [{ message: 'Der Dietrich bricht ab und bleibt im Schloss stecken. Irgendwo in der Unterstadt lacht eine Mutter.' }],
      }],
    },
    {
      id: 'fahrerkabine', at: [952, 400], label: 'Fahrerkabine ansehen', kind: 'look',
      lines: [
        n('Hinter einer gesprungenen Scheibe: Hebel, Tacho, ein Mikrofon. Am Spiegel hängt ein Duftbaum, der nach nichts mehr riecht, seit 2071.'),
        n('Auf dem Fahrersitz liegt ein Kissen mit Aufschrift „Chef“. Knut und Kurt haben ausgelost, wer darauf sitzen darf. Es hat Tränen gegeben.'),
      ],
    },
    {
      id: 'handtaschen', at: [236, 396], radius: 60, label: 'Handtaschen-Haufen', kind: 'look',
      lines: [
        n('Handtaschen, Brieftaschen, ein Autoradio. Ein Zettel obendrauf: „Alles ans Fundbüro zurück?? – Kurt.“ Durchgestrichen. Darunter: „Nö. – Knut.“'),
      ],
    },
    {
      id: 'mama-foto', at: [196, 336], radius: 56, label: 'Foto am Kühlschrank', kind: 'look',
      lines: [
        n('Am Mini-Kühlschrank klebt ein Foto: zwei kleine Jungs mit Pilzkopf, dazwischen eine Frau mit Lockenwicklern und dem Blick einer Generalin.'),
        n('Darunter mit Kinderschrift: „MAMA. Die BESTE. Sag’s ihr nicht.“'),
      ],
    },
    {
      id: 'sitzbank', at: [375, 344], radius: 52, label: 'Sitzbank ansehen', kind: 'look',
      lines: [n('Der Bezug ist zerschnitten, die Füllung quillt raus. Jemand hat mit Kuli „Kurt stinkt“ reingeritzt und, kleiner, „Knut auch“.')],
    },
  ],
  encounters: [
    {
      // Die angeheuerten Rostzähne halten Wache; Berühren startet den Kampf gegen Knut, Kurt und die Rostzähne.
      id: 'rostzahn-wache', encounter: 'enc-ubahn-abzieher', at: [720, 410], sprite: 'rostzahn-schlaeger-walk',
      patrol: [[660, 410], [860, 410]], avoid: 'gc-74',
      when: { all: [{ quest: 'side-abzieher', state: 'active' }, { time: ['abend', 'nacht'] }] },
    },
  ],
  lights: [
    { at: [100, 220], radius: 170, color: '#ffc46b', intensity: 0.75 },
    { at: [130, 250], radius: 110, color: '#ffb24a', intensity: 0.6 },
    { at: [55, 480], radius: 110, color: '#ffb24a', intensity: 0.6 },
    { at: [578, 540], radius: 170, color: '#3ef2ff', intensity: 0.65 },
    { at: [500, 200], radius: 200, color: '#ff3fd0', intensity: 0.4 },
    { at: [820, 210], radius: 200, color: '#ff3fd0', intensity: 0.4 },
    { at: [1060, 300], radius: 160, color: '#6fb6ff', intensity: 0.4 },
  ],
  onEnter: [
    {
      id: 'ubahn-wagen-erstbesuch', once: true,
      effects: [{ markSeen: 'zone:ubahn-wagen' }, { message: 'Der alte Wagen riecht nach Kerzenwachs, Socken und Brüdern, die sich ein Zimmer teilen.' }],
    },
  ],
};

export const part: ContentPart = {
  maps: { [ubahnWagen.id]: ubahnWagen },
};
