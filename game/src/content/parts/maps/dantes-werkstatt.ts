// Innenraum Dantes Werkstatt (world.md §3.5/§4.2 Dante, Plan design/plan/act1.json maps.dantes-werkstatt).
// Ofen, Werkbank, Einbau-Liege, Plattenspieler, Faxgerät, Fotoschrank, Eins!-Tisch, Kuschel-Regal, Sofa.
// Bild: output/imagegen/raw/maps/dantes-werkstatt.png (Variante b, oben/unten auf 4:3 aufgefüllt).
import type { Condition, DialogueDef, DialogueLine, MapDef } from '../../../modules/contracts';
import type { ContentPart } from '../../part';

const n = (text: string): DialogueLine => ({ speaker: 'narrator', text });
const DANTE_4: Condition = { hearts: 'dante', min: 4 };

const ankunft: DialogueDef = {
  id: 'dlg-dantes-werkstatt-ankunft',
  start: 'start',
  nodes: [
    {
      id: 'start',
      lines: [
        n('Warm. Das ist das Erste. Dann der Geruch: Lötzinn, Vanille, alter Staub und noch älteres Vinyl. Irgendwo knistert eine Platte, irgendwo piept ein Ofen, und irgendwo ruft jemand „Drei Sekunden!“.'),
        n('Überall Kabel, Kassetten, Röhrenmonitore. Ein Faxgerät, das älter ist als die halbe Unterstadt, rattert vor sich hin. Auf einer Werkbank liegt ein halber Roboterarm wie ein Patient, der auf die nächste Folge wartet.'),
      ],
    },
  ],
};

const werkstatt: MapDef = {
  id: 'dantes-werkstatt',
  name: 'Dantes Werkstatt',
  subtitle: 'Lötgassen',
  size: [1024, 768],
  district: 'unterstadt',
  lighting: 'indoor',
  bg: 'bg-dantes-werkstatt',
  walk: [[[45, 255], [980, 255], [980, 682], [45, 682]]],
  block: [
    // Hocker an der Werkbank
    [[470, 250], [526, 250], [526, 282], [470, 282]],
    // Faxtisch
    [[43, 268], [140, 268], [140, 432], [43, 432]],
    // Sofa und Beistelltisch
    [[33, 445], [186, 445], [186, 682], [33, 682]],
    [[176, 600], [244, 600], [244, 686], [176, 686]],
    // Einbau-Liege mit Geräten
    [[795, 292], [980, 292], [980, 485], [795, 485]],
    // Kuschel-Regal
    [[826, 494], [983, 494], [983, 686], [826, 686]],
    // Eins!-Tisch mit Stühlen und Hocker
    [[372, 316], [626, 316], [626, 465], [372, 465]],
    [[448, 460], [506, 460], [506, 516], [448, 516]],
    // Tür mit Lampen (Ausgang davor)
    [[455, 615], [570, 615], [570, 690], [455, 690]],
  ],
  exits: [
    { id: 'nach-loetgassen', rect: [462, 585, 100, 32], to: 'loetgassen', entry: 'von-dantes-werkstatt', label: 'Raus in die Lötgassen', interact: true },
  ],
  entries: {
    'von-loetgassen': { at: [512, 560], facing: 'n' },
    aufwachen: { at: [240, 540], facing: 'w' },
  },
  spots: {
    ofen: { at: [240, 285], facing: 'n' },
    werkbank: { at: [600, 290], facing: 'n' },
    'einbau-liege': { at: [760, 400], facing: 'e' },
    plattenspieler: { at: [830, 285], facing: 'n' },
    faxgeraet: { at: [170, 345], facing: 'w' },
    fotoschrank: { at: [135, 285], facing: 'n' },
    'eins-tisch': { at: [660, 410], facing: 'w' },
    'kuschel-regal': { at: [800, 580], facing: 'e' },
    'jimmy-hocker': { at: [420, 285], facing: 'n' },
    sofa: { at: [230, 540], facing: 'w' },
    geburtstagstisch: { at: [580, 520], facing: 'n' },
  },
  hotspots: [
    // Dienste: Einbau und Reparatur (Laden öffnet nach main-1-dante, Einbau gratis ab Dante ♥2 – siehe shops.ts)
    {
      id: 'dante-werkstatt', at: [765, 370], radius: 64, label: 'Einbau & Reparatur', kind: 'shop', shop: 'dantes-werkstatt',
      when: { quest: 'main-1-dante', state: 'done' },
    },
    {
      id: 'einbau-liege-ansehen', at: [765, 370], radius: 64, label: 'Einbau-Liege', kind: 'look',
      when: { not: { quest: 'main-1-dante', state: 'done' } },
      lines: [n('Eine gepolsterte Liege mit OP-Lampe, sauber wie sonst nichts hier. Auf dem Tablett: Pinzetten, ein Lötkolben und ein Keks. Der Keks ist vermutlich nicht steril.')],
    },
    {
      id: 'reparaturliste', at: [360, 275], radius: 56, label: 'Dantes Reparaturliste', kind: 'board', board: 'dantes-reparaturliste',
      when: { hearts: 'dante', min: 2 },
    },
    {
      id: 'roehrenmonitor', at: [335, 270], radius: 40, label: 'Röhrenmonitor', kind: 'screen',
      when: { not: { hearts: 'dante', min: 2 } },
    },
    // Keksalarm am Ofen (M/A, world.md §3.9 akt-keksalarm)
    {
      id: 'keksalarm-ofen', at: [240, 270], radius: 56, label: 'Keksalarm!', kind: 'use',
      when: { all: [{ time: ['morgen', 'abend'] }, { met: 'dante' }] },
      lines: [n('Der Ofen piept wie ein Rauchmelder mit Lampenfieber. Durch die Scheibe: zwölf Kekse, kurz vor knusprig, kurz vor Katastrophe.')],
      effects: [{
        minigame: 'akt-keksalarm', level: 2, key: 'keksalarm', label: 'Keksalarm',
        win: [
          { give: 'dantes-kekse', qty: 2 }, { relation: 'dante', delta: 10 },
          { message: 'Blech gerettet! Dante: „Heiliges Kanonenrohr, du hast Hände wie ein Bäcker! Ein dreckiger, schneller Bäcker!“' },
        ],
        lose: [
          { give: 'dantes-kekse', qty: 1 },
          { message: 'Ein Blech auf dem Boden. Dante, schon in der Hocke: „DREI-SEKUNDEN-REGEL!“ Einer war noch gut. Behauptet er.' },
        ],
      }],
    },
    {
      id: 'ofen-ansehen', at: [240, 270], radius: 56, label: 'Ofen', kind: 'look',
      when: { not: { all: [{ time: ['morgen', 'abend'] }, { met: 'dante' }] } },
      lines: [n('Ein emaillierter Ofen, älter als Dantes Vorstrafen. An der Tür hängen Topflappen in Herzform. Einer hat ein Brandloch genau in der Mitte. Romantik.')],
    },
    // Eins!-Abend (Do A, world.md §3.9 akt-eins)
    {
      id: 'eins-tisch', at: [660, 400], radius: 60, label: 'Eins! spielen', kind: 'use',
      when: { all: [{ weekday: 'do' }, { time: 'abend' }] },
      lines: [n('Karten, Kekse, Kakao. Dante mischt mit der Verbissenheit eines Mannes, der seit elf Wochen nicht gewonnen hat. Die Kinder grinsen wie Haie.')],
      effects: [{
        minigame: 'akt-eins', level: 2, key: 'eins-dante', label: 'Eins!-Abend bei Dante',
        win: [
          { relation: 'dante', delta: 10 }, { give: 'dantes-kekse' },
          { message: 'Gewonnen! Dante legt die Karten sehr, sehr ruhig hin, geht in die Küche, schließt die Tür. Man hört gedämpftes Fluchen. Dann kommt er mit Keksen zurück.' },
        ],
        lose: [
          { relation: 'dante', delta: 5 },
          { message: 'Verloren. Jakko macht einen Siegestanz auf dem Stuhl. Dante: „Siehst du? SIEHST DU? So fühlt sich das an! Jede Woche!“' },
        ],
      }],
    },
    {
      id: 'kartentisch-ansehen', at: [660, 400], radius: 60, label: 'Kartentisch', kind: 'look',
      when: { not: { all: [{ weekday: 'do' }, { time: 'abend' }] } },
      lines: [n('Ein runder Tisch, zerkratzt, mit Kaffeeringen wie Jahresringe. In die Platte geritzt: eine Strichliste. Links „Kinder“: 47. Rechts „Dante“: 3. Eine der drei ist durchgestrichen.')],
    },
    {
      id: 'faxgeraet-ansehen', at: [165, 340], radius: 52, label: 'Faxgerät', kind: 'look',
      lines: [
        n('Ein beiges Faxgerät von 2060, so schwer, dass es vermutlich eine eigene Postleitzahl hat. Es spuckt eine endlose Papierschlange aus: Zahlenkolonnen, Grüße, ein Rezept für Zimtschnecken.'),
        n('Ganz unten auf dem Papier, in krakeligen Großbuchstaben: „FX-60 AN DANTE: IMMER NOCH DA.“ Wer oder was FX-60 ist, sagt das Fax nicht.'),
      ],
    },
    {
      id: 'fotoschrank', at: [135, 275], radius: 50, label: 'Schrank', kind: 'look',
      when: { not: { seen: 'he-dante-6' } },
      lines: [n('Ein dunkler Holzschrank, abgeschlossen. Der Schlüssel steckt nicht. Wo alles in dieser Werkstatt offen herumliegt, ist das das Verdächtigste im ganzen Raum.')],
    },
    {
      id: 'fotoschrank-gesehen', at: [135, 275], radius: 50, label: 'Schrank', kind: 'look',
      when: { seen: 'he-dante-6' },
      lines: [n('Der Schrank ist zu. Du weißt, was drin ist: Fotos von Raven, sorgfältig sortiert, mit Datum. Dante hat dich gebeten, die Klappe zu halten. Du hältst sie.')],
    },
    {
      id: 'plattenregal-ansehen', at: [880, 280], radius: 54, label: 'Plattenregal', kind: 'look',
      lines: [
        n('Hunderte Platten, sortiert nach einem System, das nur Dante versteht. „Kabelbrand“ steht neben „Opa Funk liest Wetterberichte“, daneben „Walgesänge, Remix“.'),
        n('Zwischen den Platten stecken VHS-Kassetten mit handgeschriebenen Etiketten: „Knast-Gitarre, Übung 4000“, „Nicht löschen“, „WIRKLICH nicht löschen“.'),
      ],
    },
    {
      id: 'plattenspieler-ansehen', at: [780, 280], radius: 44, label: 'Plattenspieler', kind: 'look',
      lines: [n('Ein Plattenspieler mit Holzzarge, der Tonarm repariert mit einer Büroklammer und sehr viel Liebe. Es läuft etwas mit Saxophon. Das Saxophon klingt, als hätte es auch eine schwere Kindheit gehabt.')],
    },
    {
      id: 'kuschel-kissen', at: [800, 610], radius: 44, label: 'Kissen im Regal', kind: 'look',
      when: { not: { quest: 'side-captain-kuschel', state: 'active' } },
      lines: [n('Im Regal ein rundes Kissen, plattgelegen in Form eines kleinen Roboters. Daneben eine Schale mit Schrauben, sortiert nach Geschmack. Captain Kuschels Thron.')],
    },
    // Dantes Sofa: Notschlafplatz ab Dante ♥4 (world.md §3.8)
    {
      id: 'sofa', at: [215, 560], radius: 56, label: 'Auf Dantes Sofa pennen', kind: 'sleep', when: DANTE_4,
      lines: [n('Das Sofa riecht nach Keksen und Lötzinn. Eine Wolldecke, ein Kissen mit Brandfleck, der Plattenspieler läuft leise aus. Gute Nacht, Werkstatt.')],
    },
    {
      id: 'sofa-ansehen', at: [215, 560], radius: 56, label: 'Sofa', kind: 'look', when: { not: DANTE_4 },
      lines: [n('Ein durchgesessenes Ledersofa mit Flicken in fünf Farben. Darauf eine Strickdecke. Dante sieht dich an, als würdest du gleich ein Familienmitglied anfassen. Lass es.')],
    },
  ],
  shelter: { entry: 'aufwachen', when: DANTE_4 },
  lights: [
    { at: [500, 95], radius: 170, color: '#ffc861', intensity: 0.9 },
    { at: [255, 70], radius: 90, color: '#ff3fa4', intensity: 0.6 },
    { at: [45, 140], radius: 90, color: '#ff3fa4', intensity: 0.5 },
    { at: [985, 140], radius: 90, color: '#ff3fa4', intensity: 0.5 },
    { at: [330, 140], radius: 70, color: '#3ef2ff', intensity: 0.5 },
    { at: [840, 300], radius: 70, color: '#3ef2ff', intensity: 0.5 },
    { at: [60, 270], radius: 70, color: '#ffc861', intensity: 0.6 },
    { at: [510, 340], radius: 90, color: '#ffc861', intensity: 0.5 },
    { at: [470, 650], radius: 50, color: '#3ef2ff', intensity: 0.6 },
    { at: [560, 650], radius: 50, color: '#3ef2ff', intensity: 0.6 },
    { at: [920, 510], radius: 60, color: '#3ef2ff', intensity: 0.5 },
  ],
  ambience: 'innen',
  music: 'dantes-werkstatt',
  onEnter: [
    { id: 'dantes-werkstatt-erstbesuch', once: true, dialogue: 'dlg-dantes-werkstatt-ankunft', effects: [{ markSeen: 'dantes-werkstatt-erstbesuch' }] },
  ],
};

export const part: ContentPart = {
  maps: { 'dantes-werkstatt': werkstatt },
  dialogues: { [ankunft.id]: ankunft },
};
