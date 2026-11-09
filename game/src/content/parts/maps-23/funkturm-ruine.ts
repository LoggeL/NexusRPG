// Funkturm-Ruine (world.md §3.5, §3.9 akt-radio-rost, §6.3 side-verlorene-frequenz, §8.7, §10.4/§10.7;
// Plan design/plan/act23.json → maps.funkturm-ruine, Paket pkg-staubstrasse).
// Zone 1536×1024: Felswand mit Bunker und Antennenwald, Radio-Rost-Studio unter einer Plane, Plattenarchiv, Windrad mit
// Stoffbändern (Drohnennest oben), Wäscheleine mit Schallplatten, Felspfad hinauf zum Plateau mit dem umgeknickten
// Sendemast (Aussichtspunkt), Opa Funks Wohnwagen, Schrotthaufen. Ausgang nach Süden zur Staubstraße, Kiki-Taxi-Ziel.
// Quest-Hotspots mit Plan-ID `windrad` (gc-139, side-verlorene-frequenz) und die feste Begegnung enc-funkturm-windraeder
// setzt das Quest-Paket per mapAdditions an die Spots `windrad` / `windrad-drohnen-nest`.
import type { Condition, MapDef, Point, Polygon, Rect } from '../../../modules/contracts';
import type { ContentPart } from '../../part';

const box = ([x, y, w, h]: Rect): Polygon => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];

/** Plan-Spots (act23.json) plus eigene Punkte. */
const S = {
  'pisten-ende': [760, 960],
  'bunker-eingang': [595, 470],
  'radio-rost-pult': [890, 505],
  plattenarchiv: [330, 482],
  windrad: [235, 548],
  'windrad-drohnen-nest': [115, 585],
  sendemast: [1330, 205],
  plattenleine: [1260, 650],
  felsplateau: [1110, 105],
  'auftrag-a': [560, 760],
  // eigene
  'felspfad-unten': [1265, 450],
  wohnwagen: [300, 920],
  schrotthaufen: [1100, 760],
  'bunker-tuer-tag': [690, 462],
} satisfies Record<string, Point>;

const at = (id: keyof typeof S): Point => S[id];
const off = (id: keyof typeof S, dx: number, dy: number): Point => [S[id][0] + dx, S[id][1] + dy];

const N = 'narrator';
const FREQUENZ: Condition = { quest: 'side-verlorene-frequenz', state: 'done' };
const FREQUENZ_AKTIV: Condition = { quest: 'side-verlorene-frequenz', state: 'active' };
const NACHTS: Condition = { time: 'nacht' };

const funkturm: MapDef = {
  id: 'funkturm-ruine',
  name: 'Funkturm-Ruine',
  subtitle: 'Ödnis · Radio Rost',
  size: [1536, 1024],
  district: 'oednis',
  lighting: 'outdoor',
  bg: 'bg-funkturm-ruine',
  bgVariants: [{ when: FREQUENZ, bg: 'bg-funkturm-ruine-sendet' }],
  walk: [
    // Hof vor Bunker und Studio
    [
      [0, 530], [45, 530], [45, 455], [230, 452], [440, 450], [720, 445], [760, 475], [1080, 478], [1090, 440], [1220, 440],
      [1310, 445], [1420, 470], [1536, 480], [1536, 720], [1420, 740], [1180, 760], [1120, 860], [1000, 920], [870, 945],
      [865, 1024], [665, 1024], [650, 935], [500, 912], [0, 912],
    ],
    // Felspfad hinauf
    [
      [1220, 445], [1300, 450], [1320, 380], [1335, 330], [1325, 270], [1345, 232], [1405, 215], [1470, 205], [1500, 175],
      [1470, 150], [1400, 165], [1330, 190], [1290, 230], [1270, 285], [1268, 335], [1238, 385],
    ],
    // Plateau mit dem Sendemast
    [[1040, 0], [1536, 0], [1536, 195], [1465, 205], [1400, 175], [1335, 192], [1300, 145], [1200, 138], [1060, 132], [1040, 60]],
  ],
  block: [
    box([0, 640, 200, 260]), // Wohnwagen
    box([185, 810, 160, 75]), // Stühle, Laterne
    box([370, 800, 40, 90]), // Kaktus
    box([1060, 580, 30, 40]), box([1440, 580, 30, 40]), // Pfosten der Plattenleine
    box([45, 440, 175, 85]), // Werkzeugkiste, Reifen, Gasflasche am Windrad
    box([1090, 330, 125, 105]), // Fässer, Kabeltrommel, Solarpanel
    [[1200, 20], [1330, 0], [1525, 115], [1525, 170], [1460, 180], [1300, 92], [1210, 85]], // umgeknickter Sendemast
    box([1150, 50, 65, 70]), // Mastfuß
  ],
  foreground: [
    { rect: [1060, 500, 410, 130], baseY: 625 },
    { rect: [0, 640, 360, 260], baseY: 895 },
  ],
  exits: [
    { id: 'nach-staubstrasse', rect: [670, 1000, 190, 24], to: 'staubstrasse', entry: 'von-funkturm-ruine', label: 'Piste zur Staubstraße' },
  ],
  entries: {
    'von-staubstrasse': { at: [760, 960], facing: 'n' },
    taxi: { at: [560, 700], facing: 's' },
  },
  spots: Object.fromEntries(Object.entries(S).map(([id, p]) => [id, { at: p }])),
  hotspots: [
    // ---------------------------------------------------------------- Aktivität: Radio Rost (world.md §3.9)
    {
      id: 'radio-rost', at: off('radio-rost-pult', 70, 0), radius: 56, label: 'Gastmoderation bei Radio Rost', kind: 'use',
      when: { all: [{ time: 'abend' }, { not: FREQUENZ }] }, daily: true,
      lines: [
        { speaker: N, text: 'Opa Funk schiebt dir das zweite Mikro hin, ohne aufzusehen. „Abendsendung. Du machst die Ansagen, ich mach die Platten, und wenn einer anruft, bist du nett. Auch wenn er ein Arschloch ist. Besonders dann.“' },
      ],
      effects: [{
        minigame: 'akt-radio-rost', level: 2, key: 'radio-rost-gast', label: 'Radio Rost – Abendsendung',
        win: [
          { rep: 'aussiedler', delta: 3 }, { credits: 25 },
          { message: 'Bis zum Lagerfeuer an der Staubstraße hat man dich gehört. Opa Funk zahlt dich in Credits und einem Nicken, das mehr wert ist.' },
        ],
        lose: [{ message: 'Funkstille, Rückkopplung, ein Anrufer, der nur „Hä?“ sagt. Opa Funk: „Hab Schlimmeres gehört. Von mir.“' }],
      }],
    },
    {
      id: 'radio-rost-stadt', at: off('radio-rost-pult', 70, 0), radius: 56, label: 'Gastmoderation: Sendung für die Stadt', kind: 'use',
      when: { all: [{ time: 'abend' }, FREQUENZ] }, daily: true,
      lines: [
        { speaker: N, text: 'Das Relais an der Flutmauer brummt, und die rote Lampe brennt heller als früher. „Heute hört uns die ganze Stadt“, sagt Opa Funk, und seine Hände zittern ein bisschen. „Also reiß dich zusammen. Oder genau nicht.“' },
      ],
      effects: [{
        minigame: 'akt-radio-rost', level: 3, key: 'radio-rost-stadt', label: 'Radio Rost – Sendung für die ganze Stadt',
        win: [
          { rep: 'aussiedler', delta: 5 }, { rep: 'unterstadt', delta: 2 }, { credits: 50 },
          { message: 'Von der Ödnis bis in die Neon-Gasse: Deine Stimme läuft in Garküchen, Taxis und Zellen. Opa Funk legt dir eine Hand auf die Schulter. „Das bleibt. Das kann keiner abschalten.“' },
        ],
        lose: [{ message: 'Die halbe Stadt hört, wie du dich dreimal versprichst. Die andere Hälfte hört es in der Wiederholung.' }],
      }],
    },
    {
      id: 'radio-pult-ansehen', at: off('radio-rost-pult', 70, 0), radius: 56, label: 'Radio-Pult ansehen', kind: 'look',
      when: { not: { time: 'abend' } },
      lines: [
        { speaker: N, text: 'Unter einer geflickten Plane: ein Mischpult mit mehr Reglern als ein Raumschiff, eine Bandmaschine, zwei Mikrofone mit Socken als Windschutz und ein Ohrensessel, der Opa Funks Form angenommen hat. Über allem eine rote Lampe. „Auf Sendung“, ohne Worte.' },
        { speaker: N, text: 'Gastmoderationen gibt’s abends. Vorher, sagt Opa Funk, „hört eh keiner zu außer den Skorpionen, und die rufen nicht an“.' },
      ],
    },
    // ---------------------------------------------------------------- Händler
    { id: 'plattenarchiv', at: at('plattenarchiv'), radius: 60, label: 'Plattenarchiv durchstöbern', kind: 'shop', shop: 'radio-rost', when: { not: NACHTS } },
    {
      id: 'plattenarchiv-nachts', at: at('plattenarchiv'), radius: 60, label: 'Plattenarchiv', kind: 'look', when: NACHTS,
      lines: [
        { speaker: N, text: 'Ein Vorhang aus Funkkabel hängt vor den Regalen. Daran ein Zettel: „Geschlossen. Platten schlafen auch.“ Darunter, kleiner: „Wer klaut, kriegt Schlager. Für immer.“' },
      ],
    },
    // ---------------------------------------------------------------- Orte
    {
      id: 'bunker-tuer', at: at('bunker-eingang'), radius: 56, label: 'Bunkertür', kind: 'look',
      lines: [
        { speaker: N, text: 'Eine Stahltür, schwer wie eine Bankfiliale, mit gelb-schwarzen Streifen und einer Lampe darüber, die summt. Dahinter, sagt man, schläft Opa Funk zwischen zehntausend Platten und einem Notstromaggregat, das er „Gisela“ nennt.' },
        { speaker: N, text: 'An der Tür klebt ein Aufkleber: „Hier wohnt Radio Rost. Klingeln zwecklos, wir senden.“' },
      ],
    },
    {
      id: 'windrad-ansehen', at: off('windrad', 40, 10), radius: 50, label: 'Windrad ansehen', kind: 'look',
      hideWhen: FREQUENZ_AKTIV, when: { not: FREQUENZ },
      lines: [
        { speaker: N, text: 'Ein Windrad auf einem Gittermast, die Flügel mit bunten Stoffbändern behängt, die im Wind flattern wie Gebetsfahnen eines sehr müden Gottes. Es dreht sich nicht. Es zuckt nur, wenn eine Böe kommt, und knarzt beleidigt.' },
        { speaker: N, text: 'Oben an der Nabe hängt ein Nest aus Schrott und Draht. Etwas darin surrt. Etwas darin hat dich gesehen.' },
      ],
    },
    {
      id: 'windrad-dreht', at: off('windrad', 40, 10), radius: 50, label: 'Windrad ansehen', kind: 'look', when: FREQUENZ,
      lines: [
        { speaker: N, text: 'Das Windrad dreht sich, gleichmäßig und stolz, und die Stoffbänder flattern wie Applaus. Das Drohnennest oben an der Nabe ist leer, die Bewohner sind ausgezogen, unfreiwillig. Auf dem Bunkerdach blinkt eine neue rote Lampe: „Wir senden.“' },
      ],
    },
    {
      id: 'drohnennest-ansehen', at: at('windrad-drohnen-nest'), radius: 46, label: 'Drohnennest beobachten', kind: 'look',
      when: { not: FREQUENZ }, hideWhen: FREQUENZ_AKTIV,
      lines: [
        { speaker: N, text: 'Du legst den Kopf in den Nacken. Im Nest blinken drei rote Augen. Windrad-Drohnen: Rotoren mit schlechter Laune. Sie lieben Windräder. Sie lieben sie so sehr, dass sie sie kaputtmachen.' },
      ],
    },
    {
      id: 'plattenleine', at: off('plattenleine', 0, 20), radius: 60, label: 'Plattenleine ansehen', kind: 'look',
      when: { not: FREQUENZ },
      lines: [
        { speaker: N, text: 'Eine Wäscheleine, und an ihr hängen dreißig Schallplatten an Klammern und trocknen in der Sonne. Opa Funk wäscht seine Platten. Mit Wasser. In der Ödnis. Das ist entweder Liebe oder Wahnsinn, und bei Opa Funk ist das dasselbe.' },
      ],
    },
    {
      id: 'plattenleine-sendet', at: off('plattenleine', 0, 20), radius: 60, label: 'Plattenleine ansehen', kind: 'look', when: FREQUENZ,
      lines: [
        { speaker: N, text: 'Die Platten an der Leine glänzen. In die Hüllen daneben hat Opa Funk Zettel gesteckt: Hörerwünsche aus der Stadt. „Für Oma Volt, von ihrem Neffen.“ „Für Hunter. Hör auf zu singen.“ „Für alle im Kanal. Ihr seid nicht vergessen.“' },
      ],
    },
    {
      id: 'sendemast', at: at('sendemast'), radius: 60, label: 'Umgeknickter Sendemast', kind: 'look',
      lines: [
        { speaker: N, text: 'Der alte Sendemast liegt quer über dem Plateau wie ein erschlagener Riese aus Rot und Weiß. Achtzig Meter Stahl, mitten durchgeknickt. Ein Sturm, sagt Opa Funk. Quantum, sagen die anderen. Opa Funk sagt dann: „Sag ich doch. Ein Sturm.“' },
        { speaker: N, text: 'Im Gitter hängen noch Isolatoren aus Glas. Wenn der Wind durchgeht, singen sie leise, einen Ton zu tief.' },
      ],
    },
    {
      id: 'aussicht-felsplateau', at: at('felsplateau'), radius: 60, label: 'Über die Ödnis schauen', kind: 'use', dialogue: 'funkturm-aussicht',
    },
    {
      id: 'wohnwagen', at: off('wohnwagen', 0, -20), radius: 56, label: 'Wohnwagen', kind: 'look',
      lines: [
        { speaker: N, text: 'Ein alter Wohnwagen mit gestreifter Markise, zwei Plastikstühlen und einer Satellitenschüssel, die auf einen Satelliten zeigt, der seit vierzig Jahren nicht mehr da ist. „Gästezimmer“, sagt Opa Funk. Die Gäste sind meistens Skorpione.' },
      ],
    },
    {
      id: 'kaputtes-radio', at: at('schrotthaufen'), radius: 56, label: 'Altes Röhrenradio flicken', kind: 'check', once: true,
      check: { id: 'ft-roehrenradio', attribute: 'technik', threshold: 5, tags: ['reparieren'], label: '[Technik 5]' },
      altText: 'Die Röhren sind tot, die Lötstellen kalt. Mit mehr Technik – oder einem Reparaturset – bekommst du es wieder zum Laufen.',
      effects: [
        { setFlag: 'funkturm_roehrenradio' },
        { credits: 40 },
        { message: 'Ein Funke, ein Knacken, und das Röhrenradio aus dem Schrott spielt Radio Rost, einen Hauch zu langsam. Opa Funk kauft es dir für 40 Cr ab. „Für die Küche. Jeder braucht ein Radio in der Küche.“' },
      ],
    },
    {
      id: 'kaputtes-radio-set', at: off('schrotthaufen', 50, 0), radius: 40, label: 'Röhrenradio mit Reparaturset flicken', kind: 'use', once: true,
      when: { all: [{ item: 'reparaturset' }, { notFlag: 'funkturm_roehrenradio' }] },
      lines: [{ speaker: N, text: 'Lötzinn, Klebeband, zwei Ersatzröhren aus dem Set. Es ist keine Kunst. Es ist Handwerk. Das Radio knistert, dann läuft es.' }],
      effects: [
        { take: 'reparaturset' }, { setFlag: 'funkturm_roehrenradio' }, { credits: 40 },
        { message: 'Opa Funk kauft dir das Radio für 40 Cr ab und stellt es neben sein Mischpult. „Zweitgerät. Falls das erste stirbt. Oder ich.“' },
      ],
    },
    {
      id: 'schrott-fund', at: off('schrotthaufen', -60, 40), radius: 46, label: 'Im Schrott wühlen', kind: 'loot', daily: true,
      lines: [{ speaker: N, text: 'Zwischen Lautsprechern, Radiogehäusen und Wellblech findet man immer was. Heute: ein Teil, das wichtig aussieht.' }],
      effects: [{ give: 'schrott-ersatzteil' }],
    },
    // ---------------------------------------------------------------- Sammelobjekt
    {
      id: 'neon-tag-10', at: at('bunker-tuer-tag'), radius: 40, label: 'Neon-Tag an der Bunkertür abfotografieren', kind: 'loot', once: true,
      lines: [{ speaker: N, text: 'Neben der Bunkertür, zwischen den gelben Warnstreifen, leuchtet ein Tag: ein Funkturm mit Notenschlüssel, aus dessen Spitze Wellen kommen. Opa Funk: „Hab ich nicht gesprüht. Hab ich nur nicht weggemacht.“' }],
      effects: [{ give: 'neon-tag-10' }],
    },
  ],
  encounters: [
    {
      id: 'windraeder-tag', encounter: 'enc-zufall-funkturm-ruine-windraeder-tag', at: [300, 640],
      sprite: 'windrad-drohne-walk', when: { all: [{ time: 'tag' }, { not: FREQUENZ }] },
      patrol: [[300, 640], [520, 600], [420, 760]],
      avoid: { id: 'ft-windraeder-ausweichen', attribute: 'reflexe', threshold: 6, tags: ['ausweichen'], label: '[Reflexe 6]' },
    },
    {
      id: 'kraehen-abend', encounter: 'enc-zufall-funkturm-ruine-gemischt-abend', at: [1000, 700],
      sprite: 'windrad-drohne-walk', when: { time: 'abend' },
      patrol: [[1000, 700], [1300, 700], [1150, 640]],
      avoid: { id: 'ft-drohne-stoeren', attribute: 'technik', threshold: 5, tags: ['drohne'], label: '[Technik 5]' },
    },
  ],
  lights: [
    { at: [905, 340], radius: 120, color: '#ff2a2a', intensity: 0.7, slots: ['abend', 'nacht'] },
    { at: [890, 400], radius: 200, color: '#ffcf7a', intensity: 0.55, slots: ['abend', 'nacht'] },
    { at: [595, 270], radius: 150, color: '#ffcf7a', intensity: 0.6, slots: ['abend', 'nacht'] },
    { at: [470, 280], radius: 70, color: '#3ef2ff', intensity: 0.6, slots: ['abend', 'nacht'] },
    { at: [695, 280], radius: 70, color: '#3ef2ff', intensity: 0.6, slots: ['abend', 'nacht'] },
    { at: [790, 255], radius: 90, color: '#ff3fa4', intensity: 0.6, slots: ['abend', 'nacht'] },
    { at: [320, 330], radius: 110, color: '#ffb36b', intensity: 0.5, slots: ['abend', 'nacht'] },
    { at: [262, 870], radius: 90, color: '#ffcf7a', intensity: 0.6, slots: ['abend', 'nacht'] },
    { at: [190, 100], radius: 60, color: '#ff2a2a', intensity: 0.5, slots: ['nacht'] },
    { at: [1330, 90], radius: 220, color: '#ffd89a', intensity: 0.45, slots: ['abend', 'nacht'] },
    { at: [760, 600], radius: 900, color: '#ff9a3c', intensity: 0.12, slots: ['abend'] },
  ],
  ambient: {
    count: 1,
    bySlot: { morgen: 0, tag: 2, abend: 2, nacht: 0 },
    sprites: ['passant-arbeiterin-walk', 'passant-schrotti-walk'],
    routes: [
      [[760, 960], [700, 600], [330, 520]],
      [[760, 960], [900, 560], [1260, 680]],
    ],
    barks: [
      { text: 'Radio Rost spielt heute wieder nur Platten mit Sprung.' },
      { text: 'Wasser ist Leben. Sand ist … auch da.' },
      { text: 'Opa Funk hat mir die Wettervorhersage für nächste Woche vorgelesen. Heiß. Er hatte recht. Er hat immer recht.' },
      { text: 'Ich bring ihm Platten, er bringt mir Musik bei. Fairer Tausch. Er hält mich für taub.' },
      { text: 'Pass auf das Windrad auf. Die Drohnen da oben sind nicht zum Kuscheln.', when: { not: FREQUENZ } },
      { text: 'Die Falken fliegen tief. Gibt Sturm oder Ärger.', when: { act: 2 } },
      { text: 'Sie hören uns in der Stadt! Meine Schwester hat angerufen. Sie hat nur geweint. Gutes Weinen.', when: FREQUENZ },
      { text: 'Der Konvoi fährt jetzt jeden Tag ans Meer. Mit Sonnencreme!', when: { flag: 'epilog' } },
    ],
  },
  ambience: 'oednis',
  onEnter: [
    { id: 'funkturm-ruine-erstbesuch', once: true, dialogue: 'funkturm-ruine-ankunft', effects: [{ markSeen: 'funkturm-ruine-betreten' }] },
  ],
};

export const part: ContentPart = {
  maps: { [funkturm.id]: funkturm },
  dialogues: {
    'funkturm-ruine-ankunft': {
      id: 'funkturm-ruine-ankunft',
      start: 'a',
      nodes: [{
        id: 'a',
        lines: [
          { speaker: N, text: 'Die Piste endet vor einer roten Felswand. Aus dem Fels wächst ein Bunker, und aus dem Bunker wächst ein Wald aus Antennen, Schüsseln und Drähten, als hätte jemand versucht, mit dem ganzen Himmel gleichzeitig zu telefonieren.' },
          { speaker: N, text: 'Unter einer Plane knistert ein Mischpult, oben auf dem Plateau liegt ein Sendemast auf der Seite wie ein Betrunkener, und aus einem Lautsprecher am Wohnwagen singt eine Stimme mit Sprung in der Platte: „… Radio Rost … sendet … immer noch …“' },
        ],
      }],
    },
    'funkturm-aussicht': {
      id: 'funkturm-aussicht',
      start: 'a',
      nodes: [
        {
          id: 'a',
          lines: [{ speaker: N, text: 'Die Plateaukante. Ein Schritt weiter, und es geht dreißig Meter runter auf Fels, der nichts verzeiht.' }],
          choices: [
            { text: 'An die Kante treten und schauen.', next: 'oben', when: { not: { seen: 'aussicht-funkturm-ruine' } } },
            { text: 'Nochmal schauen.', next: 'nochmal', when: { seen: 'aussicht-funkturm-ruine' } },
            { text: 'Lieber nicht.' },
          ],
        },
        {
          id: 'oben',
          lines: [
            { speaker: N, text: 'Unter dir die ganze Ödnis: die Staubstraße als dünner grauer Strich, Rudis Leuchtschild als rosa Punkt, die Wrackburg wie ein Haufen Spielzeugautos. Im Süden die Solarsegel des Aussiedlerhofs, im Westen ein Glitzern, das die Augen schmerzen lässt: die Glasdünen.' },
            { speaker: N, text: 'Und dahinter, ganz am Rand der Welt, ein dunkelblauer Streifen. Vielleicht Dunst. Vielleicht Einbildung. Vielleicht das Meer.' },
            { speaker: N, text: 'Hinter dir, im Osten, liegt die Stadt unter ihrer Smogglocke wie ein Gericht unter einem schmutzigen Deckel. Von hier aus sieht sie klein aus. Fast harmlos. Fast.' },
          ],
          effects: [{ markSeen: 'aussicht-funkturm-ruine' }, { xp: 20 }, { message: 'Aussichtspunkt entdeckt: Felsplateau am Funkturm (+20 XP)' }],
        },
        {
          id: 'nochmal',
          lines: [{ speaker: N, text: 'Die Ödnis ist noch da, der Wind auch. Du bleibst, bis dir der Sand das Hirn durchgeschmirgelt hat. Es hilft.' }],
          effects: [{ advanceTime: 15 }],
        },
      ],
    },
  },
};
