// Käpt'n Nebelhorns Hausboot (world.md §3.6, §4.4 kaeptn-nebelhorn, §3.8 Notschlafplätze; Plan design/plan/act1.json).
// Innenraum 1024×768, Zugang von der Hafenkante (Gangway). Koje = Notschlafplatz ab Nebelhorn ♥4.
// Geometrie am fertigen Bild game/public/assets/bg/hausboot-nebelhorn.webp nachgezogen (scripts/map_tool.mjs).
import type { MapDef, Polygon, Rect } from '../../../modules/contracts';
import type { ContentPart } from '../../part';

const box = ([x, y, w, h]: Rect): Polygon => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];

const NEBELHORN_4 = { hearts: 'kaeptn-nebelhorn', min: 4 } as const;

const hausboot: MapDef = {
  id: 'hausboot-nebelhorn',
  name: 'Hausboot Nebelhorn',
  subtitle: 'Hafenkante · liegt seit 31 Jahren fest',
  size: [1024, 768],
  district: 'unterstadt',
  lighting: 'indoor',
  bg: 'bg-hausboot-nebelhorn',
  walk: [
    [[32, 255], [925, 255], [925, 598], [32, 598]],
  ],
  block: [
    box([25, 240, 195, 80]), // Koje
    box([25, 400, 250, 210]), // Kombüse mit Holzkorb
    box([405, 315, 195, 120]), // Kajütentisch
    box([340, 372, 60, 82]), box([602, 376, 64, 82]), box([476, 432, 64, 82]), // Hocker
    box([405, 548, 56, 60]), box([560, 548, 56, 60]), // Türrahmen
  ],
  exits: [
    { id: 'nach-hafenkante', rect: [465, 572, 90, 26], to: 'hafenkante', entry: 'von-hausboot-nebelhorn', label: 'Von Bord', interact: true },
  ],
  entries: {
    'von-hafenkante': { at: [510, 540], facing: 'n' },
    aufwachen: { at: [250, 350], facing: 's' },
  },
  spots: {
    kajuete: { at: [700, 430], facing: 'w' },
    steuerrad: { at: [510, 280], facing: 'n' },
    'logbuch-regal': { at: [860, 285], facing: 'n' },
    koje: { at: [250, 350], facing: 'w' },
  },
  hotspots: [
    {
      id: 'koje', at: [105, 330], radius: 50, label: 'In der Koje schlafen', kind: 'sleep', when: NEBELHORN_4,
      lines: [
        { speaker: 'narrator', text: 'Die Koje riecht nach Salz, Pfeifentabak und einem Kissen, das seit 2070 nicht mehr aufgeschüttelt wurde. Das Boot schaukelt. Du bist weg, bevor du „Klar Schiff“ sagen kannst.' },
      ],
    },
    {
      id: 'koje-fremd', at: [105, 330], radius: 50, label: 'Koje ansehen', kind: 'look', when: { not: NEBELHORN_4 },
      lines: [
        { speaker: 'narrator', text: 'Eine Patchworkdecke, ein Strickkissen, darüber ein gerahmter Zettel: „Wer hier ohne Erlaubnis pennt, schläft bei den Fischen. – N.“' },
        { speaker: 'narrator', text: 'Darunter, kleiner: „Ausnahme: Kuchen.“' },
      ],
    },
    {
      id: 'steuerrad', at: [510, 265], radius: 50, label: 'Steuerrad drehen', kind: 'use',
      lines: [
        { speaker: 'narrator', text: 'Das Rad dreht sich butterweich. Es ist mit nichts verbunden. Nebelhorn hat das Ruder vor Jahren abgeschraubt, „damit ich nicht aus Versehen losfahre“.' },
        { speaker: 'player', text: 'Kurs aufs offene Meer. Volle Kraft voraus.' },
        { speaker: 'narrator', text: 'Das Boot knarzt beleidigt und bleibt exakt da, wo es seit einunddreißig Jahren liegt.' },
      ],
    },
    {
      id: 'logbuch', at: [830, 265], radius: 46, label: 'Logbücher ansehen', kind: 'look',
      lines: [
        { speaker: 'narrator', text: 'Ledergebundene Logbücher, aufgereiht wie Soldaten. Jedes Jahr ein Band. Jeder Eintrag: „Wetter: grau. Kurs: Steg. Vorkommnisse: keine.“' },
        { speaker: 'narrator', text: 'Ganz oben liegt ein älteres Buch mit verblasster Handschrift und einem Kompass auf dem Deckel. Es ist mit Bindfaden zugeknotet. Dreifach.' },
      ],
    },
    {
      id: 'logbuch-grossmutter', at: [900, 268], radius: 40, label: 'Das zugeknotete Logbuch', kind: 'look', when: { act: 2 },
      lines: [
        { speaker: 'narrator', text: 'Auf dem Deckel, eingeritzt: „Hedda Nebelhorn, Kapitänin. Bis zur Bojeninsel und weiter.“' },
        { speaker: 'narrator', text: 'Der Knoten ist ein Seemannsknoten, den nur einer hier lösen darf. Frag ihn. Wenn er so weit ist.' },
      ],
    },
    {
      id: 'flaschenpost-regal', at: [905, 390], radius: 50, label: 'Flaschenpost-Regal ansehen', kind: 'look',
      lines: [
        { speaker: 'narrator', text: 'Hunderte Flaschen, grün, braun, blau, manche mit Zettel, manche mit Sand, eine mit einem winzigen Plastikhai. Alles aus dem Hafenbecken gefischt.' },
        { speaker: 'narrator', text: 'Ein Schild: „ANTWORTEN – noch nicht geöffnet“. Das Fach ist voll. Er traut sich nicht.' },
      ],
    },
    {
      id: 'flaschenpost-regal-karte', at: [905, 480], radius: 40, label: 'Die offene Flasche', kind: 'look',
      when: { item: 'kuestenkarte-fragment' },
      lines: [
        { speaker: 'narrator', text: 'Eine Flasche steht offen und leer neben den anderen, wie ein ausgezogener Zahn. Das Kartenstück daraus trägst du jetzt bei dir. Nebelhorn hat sie trotzdem wieder ins Regal gestellt. „Für den Fall, dass sie Heimweh kriegt.“' },
      ],
    },
    {
      id: 'kombuese', at: [225, 390], radius: 40, label: 'Kombüse ansehen', kind: 'look',
      lines: [
        { speaker: 'narrator', text: 'Ein Kessel pfeift leise vor sich hin, obwohl die Platte aus ist. Im Korb liegt Treibholz, sortiert nach „schön“, „sehr schön“ und „zum Heizen, leider“.' },
        { speaker: 'narrator', text: 'An der Wand hängt ein Rezept: „Algen-Chips à la Grete. Schritt 1: Grete fragen. Schritt 2: Nicht selbst machen.“' },
      ],
    },
    {
      id: 'kajuetentisch', at: [690, 360], radius: 50, label: 'Tisch ansehen', kind: 'look',
      lines: [
        { speaker: 'narrator', text: 'Zwei Becher, einer mit „Käpt’n“, einer mit „Gast“. Der Gast-Becher ist sauber. Sehr sauber. Unbenutzt sauber.' },
        { speaker: 'narrator', text: 'Eine Kerze in einer Flasche, eine Seekarte der Bucht mit lauter Kreisen um die Bojeninsel. Kein einziger Strich führt hinaus.' },
      ],
    },
    {
      id: 'bullauge', at: [330, 265], radius: 50, label: 'Durchs Bullauge schauen', kind: 'look',
      lines: [
        { speaker: 'narrator', text: 'Draußen schwappt das grüne Hafenwasser gegen den Rumpf. Neonreklamen zittern auf der Oberfläche. Irgendwo dahinter, hinter Mauer und Bojen, soll das echte Meer sein.' },
      ],
    },
  ],
  lights: [
    { at: [540, 330], radius: 160, color: '#ffcf7a', intensity: 0.8 },
    { at: [75, 85], radius: 120, color: '#ffd89a', intensity: 0.6 },
    { at: [615, 70], radius: 120, color: '#ffd89a', intensity: 0.6 },
    { at: [960, 90], radius: 110, color: '#ffd89a', intensity: 0.6 },
    { at: [425, 615], radius: 90, color: '#ffcf7a', intensity: 0.6 },
    { at: [595, 615], radius: 90, color: '#ffcf7a', intensity: 0.6 },
    { at: [960, 400], radius: 120, color: '#4fe3c8', intensity: 0.5 },
    { at: [510, 100], radius: 220, color: '#3ef2ff', intensity: 0.3, slots: ['abend', 'nacht'] },
  ],
  shelter: {
    entry: 'aufwachen',
    when: NEBELHORN_4,
    notes: [
      'Nebelhorn hat dich zugedeckt und daneben einen Becher Tee hingestellt. Mit Rum. Viel Rum. „Klar Schiff, Landratte.“',
      'Ein Zettel am Kissen: „Du hast im Schlaf gerudert. Falsche Richtung. Frühstück auf dem Steg. – N.“',
      'Das Nebelhorn weckt dich um 06:00. Aus zwanzig Zentimetern. Absichtlich.',
    ],
  },
  ambience: 'innen',
  onEnter: [
    { id: 'hausboot-nebelhorn-erstbesuch', once: true, dialogue: 'hausboot-nebelhorn-ankunft', effects: [{ markSeen: 'hausboot-nebelhorn-betreten' }] },
  ],
};

export const part: ContentPart = {
  maps: { [hausboot.id]: hausboot },
  dialogues: {
    'hausboot-nebelhorn-ankunft': {
      id: 'hausboot-nebelhorn-ankunft',
      start: 'a',
      nodes: [
        {
          id: 'a',
          lines: [
            { speaker: 'narrator', text: 'Die Kajüte ist eng, warm und riecht nach Tee, Teer und alten Socken mit Seefahrtserfahrung. Überall Flaschen, Seile, Logbücher.' },
            { speaker: 'narrator', text: 'Über der Tür hängt ein Rettungsring mit der Aufschrift „Notfall“. Er ist noch nie benutzt worden. Das Boot auch nicht.' },
          ],
        },
      ],
    },
  },
};
