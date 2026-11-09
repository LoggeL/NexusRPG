// Zone Himmelsgarten (world.md §3.5, ID-Plan design/plan/act23.json · pkg-chrome-himmel).
// Dachgarten auf dem Chrome Tower: Rednerbrücke mit Pult, Tanzfläche aus Glas, Rosenbögen, Buffet, Bar „Mixi Gold“,
// VIP-Lounge, Wartungsgang hinter den Hecken, Landeplatz mit goldenem Gleiter, Brücke zum Quantum-Campus.
// Zugang: Akt 3 (Party, über den Campus), vorher nur als Besuch nach he-serenity-chrome-6 (Turmaufzug, tags), im Nachspiel
// (Flag epilog) öffentlicher Park mit Blumenstand. Die Quest-Hotspots von main-3-* (Rednerpult, Gleiter, Kämpfe) setzen
// die Quest-Agenten per mapAdditions auf die Spots hier; die Zone liefert nur die Blick-Varianten außerhalb der Quests.
import type { Condition, DialogueDef, DialogueLine, MapDef, Polygon, Rect } from '../../../modules/contracts';
import type { ContentPart } from '../../part';

const box = ([x, y, w, h]: Rect): Polygon => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
const say = (...texts: string[]): DialogueLine[] => texts.map(text => ({ speaker: 'narrator', text }));

const ACT3: Condition = { act: 3 };
const EPILOG: Condition = { flag: 'epilog' };
const NICHT_EPILOG: Condition = { notFlag: 'epilog' };
const PARTYNACHT: Condition = { all: [ACT3, NICHT_EPILOG] };
const BESUCH: Condition = { all: [{ not: ACT3 }, NICHT_EPILOG] };
/** Nach der Rebellion (main-3-gedankenkontrolle): Tische umgekippt, Konfetti, Rauch. */
const GEKIPPT: Condition = {
  all: [PARTYNACHT, { any: [{ flag: 'nexus_rebelliert' }, { quest: 'main-3-gedankenkontrolle', state: 'done' }] }],
};

const himmelsgarten: MapDef = {
  id: 'himmelsgarten',
  name: 'Himmelsgarten',
  subtitle: 'Oberstadt · Dach des Chrome Tower',
  size: [1536, 1024],
  district: 'oberstadt',
  lighting: 'outdoor',
  bg: 'bg-himmelsgarten',
  bgVariants: [
    { when: GEKIPPT, bg: 'bg-himmelsgarten-gekippt' },
    { when: PARTYNACHT, bg: 'bg-himmelsgarten-party' },
    { when: EPILOG, bg: 'bg-himmelsgarten-park' },
  ],
  walk: [
    // Dachterrasse mit Rednerbrücke (Treppen links und rechts), Wartungsgang hinter den Hecken, Brückenkopf nach Süden.
    [[30, 250], [400, 250], [400, 150], [420, 100], [1130, 100], [1150, 150], [1150, 250], [1500, 250], [1500, 932],
      [845, 932], [815, 940], [815, 1024], [715, 1024], [715, 940], [690, 935], [30, 935]],
  ],
  block: [
    // Wand unter der Rednerbrücke (Blumenkästen)
    box([480, 160, 580, 90]),
    // Gästeeingang: Kordelpfosten, Gästeliste-Pult, Laternen
    box([100, 250, 22, 35]), box([198, 255, 22, 35]), box([222, 240, 42, 48]), box([335, 240, 22, 25]),
    box([38, 330, 26, 40]), box([78, 615, 26, 45]),
    // Buffet-Tische
    box([95, 345, 210, 75]), box([95, 455, 210, 78]),
    // Bar „Mixi Gold“ mit Hockern
    box([1160, 280, 300, 250]),
    // Antennenmasten, Gleiter, Kisten, Palme und Laterne am Landeplatz
    box([1435, 560, 65, 140]), box([1270, 690, 230, 140]), box([1410, 840, 90, 55]),
    box([965, 780, 70, 70]), box([1018, 840, 26, 45]),
    // Rosenbeet, Hecken und Küchentür (dahinter läuft der Wartungsgang), Palme am Ende
    box([30, 695, 580, 207]), box([605, 770, 90, 122]),
    // Laterne am Brückenkopf (die linke bleibt frei, dort mündet der Wartungsgang)
    box([815, 880, 20, 55]),
  ],
  exits: [
    {
      id: 'nach-quantum-campus', rect: [715, 996, 100, 28], to: 'quantum-campus', entry: 'von-himmelsgarten',
      label: 'Fußgängerbrücke zum Quantum-Campus',
      when: { any: [EPILOG, { all: [ACT3, { quest: 'main-3-einlass', state: 'done' }] }] },
      lockedText: 'Die Brücke ist mit Rosen zugestellt. Ein Schild: „Heute nur für Gäste. Morgen für niemanden.“',
    },
    {
      id: 'turmaufzug', rect: [0, 490, 50, 130], to: 'chrome-boulevard', entry: 'von-himmelsgarten',
      label: 'Aufzug Chrome Tower nach unten', interact: true, minutes: 5,
    },
    {
      id: 'gaesteaufzug', rect: [115, 140, 100, 120], to: 'quantum-foyer', entry: 'von-himmelsgarten',
      label: 'Gästeaufzug ins Quantum-Foyer', interact: true, when: { any: [ACT3, EPILOG] }, minutes: 5,
      lockedText: 'Der Gästeaufzug fährt nur mit Armband. Du hast kein Armband. Du hast Ellbogen.',
    },
  ],
  entries: {
    'von-quantum-campus': { at: [765, 960], facing: 'n' },
    'von-chrome-boulevard': { at: [95, 545], facing: 'e' },
    'von-quantum-foyer': { at: [160, 305], facing: 's' },
    catering: { at: [80, 918], facing: 'e' },
    wartungsgang: { at: [300, 918], facing: 'e' },
    landeplatz: { at: [1170, 775], facing: 'w' },
  },
  spots: {
    gaesteeingang: { at: [240, 310], facing: 's' },
    partysaal: { at: [760, 690], facing: 'n' },
    'tanzflaeche-glas': { at: [765, 470], facing: 's' },
    rosenboegen: { at: [350, 610], facing: 'e' },
    buffet: { at: [340, 440], facing: 'w' },
    champagnerkuehler: { at: [140, 565], facing: 'n' },
    'bar-himmel': { at: [1250, 560], facing: 'n' },
    'vip-lounge': { at: [1330, 275], facing: 'n' },
    rednerbruecke: { at: [660, 132], facing: 's' },
    rednerpult: { at: [770, 140], facing: 's' },
    'presse-podest': { at: [930, 300], facing: 's' },
    wartungsgang: { at: [300, 918], facing: 'e' },
    antennen: { at: [1410, 620], facing: 'e' },
    landeplatz: { at: [1170, 775], facing: 'e' },
    gleiter: { at: [1250, 760], facing: 'e' },
    hecki: { at: [620, 660], facing: 's' },
    'serenity-beet': { at: [300, 680], facing: 's' },
    blumenstand: { at: [200, 565], facing: 'n' },
    'aussicht-stadt': { at: [1000, 915], facing: 's' },
    'catering-tuer': { at: [80, 918], facing: 'w' },
    'bruecke-sued': { at: [765, 900], facing: 's' },
  },
  hotspots: [
    // --- Rednerbrücke, Gästeeingang, VIP ----------------------------------------------------------------------
    {
      id: 'rednerpult-blick', at: [770, 140], label: 'Rednerpult', kind: 'look', when: { not: PARTYNACHT },
      lines: say('Ein Pult aus gebürstetem Gold mit einem Mikrofon, das aussieht, als hätte es eine eigene Krankenversicherung. Unter dem Pult eine Buchse für Datensticks.',
        'Von hier oben spricht man nicht zu Leuten. Man spricht über sie.'),
    },
    {
      id: 'gaesteliste-pult', at: [244, 290], label: 'Gästeliste-Pult', kind: 'look', when: { not: PARTYNACHT },
      lines: say('Ein Pult mit einem Tablet, auf dem eine Gästeliste geöffnet ist. Sie ist leer bis auf ein Wort ganz oben: „Alle, die zählen.“',
        'Du zählst nach. Du stehst nicht drauf.'),
    },
    {
      id: 'vip-lounge', at: [1330, 262], radius: 70, label: 'VIP-Lounge', kind: 'look',
      lines: say('Hinter einer Glaswand: weiße Sofas, Feuerschale, Champagnertischchen. Ein Schild (ein goldenes Seil, durchgestrichen) sagt allen anderen: Hier nicht.',
        'Auf einem Kissen ist ein Abdruck. Teddyfell. Natürlich.'),
    },
    // --- Partysaal: Tanzfläche, Buffet, Bar ------------------------------------------------------------------
    {
      id: 'tanzflaeche', at: [765, 470], radius: 90, label: 'Tanzen', kind: 'use', when: PARTYNACHT,
      lines: say('Die Glasplatten leuchten im Takt. Um dich herum tanzen Gäste, alle exakt im selben Schritt. Zeit, aus der Reihe zu tanzen.'),
      effects: [{
        minigame: 'akt-tanz', level: 3, key: 'tanz-himmelsgarten', label: 'Tanzfläche im Himmelsgarten',
        win: [{ xp: 40 }, { message: 'Du tanzt so falsch richtig, dass zwei Gäste aus dem Takt kommen und kurz verwirrt blinzeln. Für einen Moment sind sie wieder sie selbst.' }],
        lose: [{ message: 'Du stolperst. Die gechippten Gäste tanzen um dich herum wie Wasser um einen Stein. Ohne hinzusehen.' }],
      }],
    },
    {
      id: 'tanzflaeche-ruhe', at: [765, 470], radius: 90, label: 'Tanzfläche aus Glas', kind: 'look', when: { not: PARTYNACHT },
      lines: say('Unter den Glasplatten pulsiert ein sanftes Licht, violett und türkis, auch jetzt, wo niemand tanzt. Die Tanzfläche wartet. Geduldig. Teuer.'),
    },
    { id: 'buffet', at: [320, 440], radius: 64, label: 'Buffet', kind: 'use', dialogue: 'himmelsgarten-buffet' },
    {
      id: 'champagnerkuehler', at: [140, 560], label: 'Champagnerkühler', kind: 'look',
      lines: say('Silberne Kübel, Eis aus destilliertem Gletscherwasser, Flaschen mit Etiketten in einer Sprache, die nur Kellner sprechen.',
        'Einer der Kübel ist nur Deko. Er hat eine eingebaute Kühlung für ein Gefühl von Kälte. Wie die Gastgeber.'),
    },
    { id: 'bar-himmel', at: [1250, 545], radius: 64, label: 'Bar „Mixi Gold“', kind: 'talk', dialogue: 'himmelsgarten-mixi-gold' },
    { id: 'nexus-bildschirm', at: [1410, 545], radius: 44, label: 'Bildschirm an der Bar', kind: 'screen', when: PARTYNACHT },
    // --- Garten: Hecki, Beet, Rosenbögen ----------------------------------------------------------------------
    { id: 'hecki', at: [620, 660], radius: 60, label: 'Hecki, der Gärtnerroboter', kind: 'talk', dialogue: 'himmelsgarten-hecki' },
    {
      id: 'serenity-beet', at: [300, 690], radius: 60, label: 'Rosenbeet', kind: 'look', when: { not: EPILOG },
      lines: say('Ein langes Beet voller Rosen, rot und weiß, jede einzelne mit einer Messlatte daneben. Ein Zettel steckt in der Erde, in runder Schrift: „Ich hätte lieber Tomaten. – S.“'),
    },
    {
      id: 'serenity-beet-epilog', at: [300, 690], radius: 60, label: 'Serenitys Beet', kind: 'look', when: EPILOG,
      lines: say('Zwischen den Rosen wachsen jetzt Tomaten, Bohnen und eine Sonnenblume, die größer ist als Portier Albert. Ein neues Schild: „Hier darf man ernten. Bitte nur mit Händen. Nicht mit Anwälten.“'),
    },
    {
      id: 'glueckstern-13', at: [1100, 640], label: 'Etwas funkelt im Rosenbogen', kind: 'loot', once: true,
      when: { any: [PARTYNACHT, EPILOG] },
      lines: say('Zwischen den Rosen am Bogen hängt ein ausgeschnittener Blechstern, festgebunden mit einem Haargummi. Ein Glücksstern so weit oben – jemand hat hier sehr gehofft.'),
      effects: [{ give: 'glueckstern-13' }],
    },
    {
      id: 'rosenboegen', at: [350, 610], radius: 52, label: 'Unter dem Rosenbogen', kind: 'look',
      lines: say('Unter dem Rosenbogen riecht die Luft nach Sommer und Geld. Eine Messingplakette: „Für Paare, Verlobte und gut versicherte Liebe.“'),
    },
    // --- Wartungsgang, Küchentür -----------------------------------------------------------------------------
    {
      id: 'catering-tuer', at: [80, 905], label: 'Küchentür', kind: 'look',
      lines: say('Eine schlichte Stahltür. Dahinter klappert es, zischt es, flucht es. Die Küche. Der einzige Ort hier oben, an dem jemand arbeitet.'),
    },
    {
      id: 'datenwuerfel-15', at: [575, 918], radius: 50, label: 'Wartungsterminal am Roboterdock anzapfen', kind: 'use',
      hideWhen: { wonMinigame: 'himmelsgarten-wartungsterminal' },
      lines: say('An Heckis Ladestation hängt ein Wartungsterminal. Im Speicher: Gießpläne, Heckenschnittmuster – und eine Datei, die gar nicht hierher gehört.'),
      effects: [{
        minigame: 'akt-hacken', level: 3, key: 'himmelsgarten-wartungsterminal', label: 'Wartungsterminal im Wartungsgang',
        win: [{ give: 'datenwuerfel-15' }, { message: 'Das Terminal spuckt einen Datenwürfel aus. Hecki piept irgendwo empört.' }],
        lose: [{ message: 'Das Terminal sperrt dich aus und spielt zur Strafe Fahrstuhlmusik. Laut.' }],
      }],
    },
    // --- Landeplatz, Gleiter, Antennen -------------------------------------------------------------------------
    {
      id: 'gleiter-blick', at: [1250, 760], label: 'Goldener Gleiter', kind: 'look',
      when: { all: [NICHT_EPILOG, { not: { quest: 'main-3-blade', state: 'active' } }] },
      lines: say('Ein Gleiter aus Gold und Glas, so poliert, dass sich die Wolken darin schämen. Auf dem Heck ein Monogramm: B. N.',
        'Ein Fluchtfahrzeug, das aussieht wie ein Schmuckstück. Oder ein Schmuckstück, das aussieht wie ein Fluchtfahrzeug. Bei Blade weiß man das nie.'),
    },
    {
      id: 'gleiter-weg', at: [1250, 760], label: 'Leerer Landeplatz', kind: 'look', when: EPILOG,
      lines: say('Der Gleiter ist weg. Auf dem Landeplatz sind nur noch Brandspuren, ein goldener Manschettenknopf und ein Kreidekreis, den Kinder um die Spuren gemalt haben. Daneben steht: „Hier hat jemand verloren.“'),
    },
    {
      id: 'antennen', at: [1410, 620], label: 'Antennenmasten', kind: 'look',
      lines: say('Zwei schlanke Masten mit roten Lichtern. Von hier funkt der Turm in die ganze Stadt. Auf einem Mast klebt ein kleiner Aufkleber mit einer Welle. Nyra war hier. Oder jemand, der sie vermisst.'),
    },
    // --- Aussicht, Nachspiel -----------------------------------------------------------------------------------
    {
      id: 'aussicht-stadt', at: [1000, 915], radius: 60, label: 'Blick über ganz Noxius', kind: 'look', once: true,
      lines: [
        { speaker: 'narrator', text: 'Von der Brüstung aus siehst du alles: die weißen Türme der Oberstadt, den Mittelring wie einen Gürtel, die Unterstadt als Teppich aus Neon und Rauch.' },
        { speaker: 'narrator', text: 'Und dahinter, ganz am Rand, wo die Stadt aufhört: eine dunkle, glatte Fläche, die das Licht verschluckt. Das Meer.' },
        { speaker: 'player', text: 'Da ist es. Es gibt es wirklich.' },
      ],
      effects: [{ markSeen: 'aussicht-himmelsgarten' }, { xp: 20 }, { message: 'Aussichtspunkt entdeckt: Himmelsgarten (+20 XP)' }],
    },
    {
      id: 'aussicht-stadt-wieder', at: [1000, 915], radius: 60, label: 'Blick über die Stadt', kind: 'look',
      when: { seen: 'aussicht-himmelsgarten' },
      lines: say('Die Stadt liegt unter dir, und am Rand glänzt das Meer. Von hier oben sieht alles klein aus. Auch die Probleme. Das ist der Trick der Oberstadt.'),
    },
    { id: 'blumenstand', at: [200, 560], radius: 64, label: 'Blumenstand', kind: 'shop', shop: 'himmelsgarten-blumen', when: EPILOG },
    {
      id: 'sternegucken', at: [1180, 915], radius: 60, label: 'Sterne gucken mit Vega', kind: 'use', daily: true,
      when: { all: [EPILOG, { time: 'nacht' }, { companion: 'vega' }] },
      lines: [
        { speaker: 'narrator', text: 'Hier oben gibt es keinen Smog und keine Werbung mehr. Nur Sterne. Echte. Vega legt sich auf den warmen Boden des Landeplatzes und klopft neben sich.' },
        { speaker: 'vega', text: 'Von der Dachterrasse sieht man vielleicht zwanzig. Von hier aus alle. Komm. Ich zeig dir, wo der Kran ist.' },
      ],
      effects: [{
        minigame: 'akt-sternegucken', level: 3, key: 'sternegucken-himmelsgarten', label: 'Sternbilder über dem Himmelsgarten',
        win: [{ relation: 'vega', delta: 10 }, { xp: 30 }, { message: 'Kran, Ratte, Gitarre – und eines, das Vega „Die Crew“ tauft. Es hat genau so viele Sterne wie ihr.' }],
        lose: [{ relation: 'vega', delta: 5 }, { message: 'Du verbindest die falschen Sterne zu einem Kaktus. Vega lacht so laut, dass Hecki aufwacht.' }],
      }],
    },
  ],
  foreground: [
    // Vordere Glasbrüstung der Rednerbrücke, Palmen, Gleiter-Heck
    { rect: [480, 115, 580, 45], baseY: 160 },
    { rect: [600, 760, 110, 70], baseY: 900 },
    { rect: [945, 690, 110, 90], baseY: 840 },
  ],
  lights: [
    { at: [165, 160], radius: 130, color: '#ffd27a', slots: ['abend', 'nacht'] },
    { at: [770, 110], radius: 160, color: '#ffe2a6', slots: ['abend', 'nacht'] },
    { at: [765, 470], radius: 260, color: '#c7a0ff', intensity: 0.8, slots: ['abend', 'nacht'] },
    { at: [765, 470], radius: 170, color: '#7ff3ff', intensity: 0.5, slots: ['abend', 'nacht'] },
    { at: [1330, 160], radius: 120, color: '#ffb36b', slots: ['abend', 'nacht'] },
    { at: [1300, 380], radius: 170, color: '#ffd27a', slots: ['abend', 'nacht'] },
    { at: [200, 440], radius: 160, color: '#fff1c4', slots: ['abend', 'nacht'] },
    { at: [1470, 520], radius: 60, color: '#ff4a4a', slots: ['abend', 'nacht'] },
    { at: [1450, 570], radius: 60, color: '#ff4a4a', slots: ['abend', 'nacht'] },
    { at: [1180, 775], radius: 170, color: '#ffe8b0', intensity: 0.6, slots: ['abend', 'nacht'] },
    { at: [52, 290], radius: 90, color: '#ffe2a6', slots: ['abend', 'nacht'] },
    { at: [90, 580], radius: 90, color: '#ffe2a6', slots: ['abend', 'nacht'] },
    { at: [1030, 800], radius: 90, color: '#ffe2a6', slots: ['abend', 'nacht'] },
    { at: [765, 900], radius: 110, color: '#ffd27a', slots: ['abend', 'nacht'] },
    { at: [300, 915], radius: 140, color: '#ffcf7a', intensity: 0.6, slots: ['abend', 'nacht'] },
  ],
  ambient: {
    count: 4,
    sprites: ['passant-anzug-walk', 'passant-tourist-walk', 'passant-oma-walk'],
    bySlot: { morgen: 2, tag: 3, abend: 5, nacht: 9 },
    routes: [
      [[560, 300], [960, 300], [980, 640], [560, 640], [560, 300]],
      [[340, 330], [340, 620], [700, 680], [1000, 560]],
      [[1100, 600], [1300, 600], [1180, 760], [900, 760]],
      [[200, 600], [520, 600], [708, 854], [900, 850]],
    ],
    barks: [
      { text: 'Privatgelände. Bitte nicht auf die Rosen atmen.', when: { not: PARTYNACHT } },
      { text: 'Haben Sie den Gärtnerroboter gesehen? Er schneidet Herzen. Ich finde das übergriffig.', when: { not: PARTYNACHT } },
      { text: 'Hier oben ist die Luft so dünn, dass man nur noch an Aktien denken kann.', when: BESUCH },
      { text: 'Ja, Master. Wunderbare Party, Master.', when: PARTYNACHT },
      { text: 'Ich hab keinen Hunger. Ich hab keinen Durst. Ich hab einen Chip. Herrlich.', when: PARTYNACHT },
      { text: 'Blade spricht gleich. Ich freu mich so. Glaube ich. Mir wurde gesagt, dass ich mich freue.', when: PARTYNACHT },
      { text: 'Wer bist du denn? Du blinzelst so … unregelmäßig.', when: PARTYNACHT },
      { text: 'Verpiss dich vom Buffet, du Kanalratte! Die Häppchen sind für Gechippte!', when: PARTYNACHT },
      { text: 'Was … wo bin ich? Warum trage ich ein Kleid aus Lametta?', when: GEKIPPT },
      { text: 'Ich hab gerade „Nein“ gesagt. Zu Blade. Laut! Ich glaub, ich muss mich hinsetzen.', when: GEKIPPT },
      { text: 'Ich habe heute selbst Kaffee gekocht. Er war furchtbar. Ich bin so stolz.', when: EPILOG },
      { text: 'Ein Park! Für alle! Ich hab mich noch nie so … allgemein gefühlt.', when: EPILOG },
      { text: 'Hecki hat mir eine Herz-Rose geschnitten. Ich bin verheiratet. Mit wem, sag ich nicht.', when: EPILOG },
    ],
  },
  ambience: 'oberstadt',
  // Partymusik nur in der Partynacht (MapDef.musicWhen), sonst Oberstadt.
  music: 'oberstadt',
  musicWhen: [{ when: PARTYNACHT, music: 'releaseparty' }],
  onEnter: [
    { id: 'himmelsgarten-besuch', once: true, when: BESUCH, dialogue: 'himmelsgarten-besuch' },
    { id: 'himmelsgarten-party', once: true, when: PARTYNACHT, dialogue: 'himmelsgarten-party' },
    { id: 'himmelsgarten-park', once: true, when: EPILOG, dialogue: 'himmelsgarten-park' },
  ],
};

const DIALOGUES: Record<string, DialogueDef> = {
  'himmelsgarten-besuch': {
    id: 'himmelsgarten-besuch', start: 'a',
    nodes: [{
      id: 'a',
      lines: [
        { speaker: 'narrator', text: 'Der Aufzug öffnet sich zu einem Garten über den Wolken. Rosenbögen, eine Tanzfläche aus leuchtendem Glas, Champagnerkühler ohne Champagner. Alles wartet auf eine Party.' },
        { speaker: 'narrator', text: 'Ein kleiner Roboter mit Heckenschere rollt vorbei, schneidet eine Rose in Herzform und piept zufrieden.' },
        { speaker: 'player', text: 'Hier also feiern sie, wenn die Stadt brennt. Gut zu wissen, wo der Feuerlöscher hin muss.' },
      ],
    }],
  },
  'himmelsgarten-party': {
    id: 'himmelsgarten-party', start: 'a',
    nodes: [{
      id: 'a',
      lines: [
        { speaker: 'narrator', text: 'Die Releaseparty. Lichterkugeln über den Rosenbögen, die Tanzfläche glüht violett, und hundert Gäste lächeln im selben Moment dasselbe Lächeln.' },
        { speaker: 'narrator', text: 'In ihren Nacken glitzert es. Chrome 10. Oben auf der Rednerbrücke wartet ein goldenes Pult auf einen Mann im Teddyfellmantel.' },
        { speaker: 'player', text: 'Okay. Keine Häppchen von Fremden annehmen. Keine Chips. Und niemand sagt „Master“. Auch nicht aus Versehen.' },
      ],
    }],
  },
  'himmelsgarten-park': {
    id: 'himmelsgarten-park', start: 'a',
    nodes: [{
      id: 'a',
      lines: [
        { speaker: 'narrator', text: 'Der Himmelsgarten ist offen. Für alle. Auf dem Kunstrasen liegen Picknickdecken aus der Unterstadt, und an der Stelle des Buffets steht ein Blumenstand.' },
        { speaker: 'narrator', text: 'Hecki rollt herum und schneidet Herzen in alles, was nicht wegläuft.' },
        { speaker: 'player', text: 'Schön hier. Fast so, als hätten wir gewonnen.' },
      ],
    }],
  },
  'himmelsgarten-buffet': {
    id: 'himmelsgarten-buffet', start: 'start',
    nodes: [
      {
        id: 'start',
        lines: say('Lange Tische mit weißen Tüchern, silbernen Hauben und Etageren voller Häppchen, die so klein sind, dass man sie nur mit Pinzette isst.'),
        choices: [
          {
            text: 'Ein paar Häppchen einstecken.', when: { all: [{ any: [PARTYNACHT, BESUCH] }, { notFlag: 'heute_himmelsgarten_buffet' }] },
            next: 'essen', effects: [{ heal: 25 }, { setFlag: 'heute_himmelsgarten_buffet' }],
          },
          {
            text: 'Dantes Kekse unter die Häppchen schmuggeln.', when: PARTYNACHT, requires: { item: 'dantes-kekse' }, next: 'kekse',
            effects: [{ take: 'dantes-kekse' }, { setFlag: 'himmelsgarten_kekse_getauscht' }, { xp: 20 }], once: true, id: 'buffet-kekse',
          },
          {
            text: 'Das Buffet für Collin fotografieren: „Die Oberstadt frisst, die Stadt hungert.“', when: PARTYNACHT, next: 'foto',
            effects: [{ rep: 'nx1-medien', delta: 3 }], once: true, id: 'buffet-foto',
          },
          {
            text: 'Am Blumenstand vorbeischauen.', when: EPILOG, next: 'park',
          },
          { text: 'Lieber nichts anfassen.' },
        ],
      },
      {
        id: 'essen',
        lines: [
          { speaker: 'narrator', text: 'Kaviar auf Gurke, Gurke auf Kaviar, und etwas, das aussieht wie Schaum und schmeckt wie Geld. Du stopfst dir sechs Stück in den Mund. Ein Kellner sieht dich. Er sagt nichts. Er bewundert es heimlich.' },
        ],
      },
      {
        id: 'kekse',
        lines: [
          { speaker: 'narrator', text: 'Zwischen Trüffelpralinen liegen jetzt Dantes Kekse, leicht verkohlt, mit Fingerabdrücken. Ein gechippter Gast nimmt einen, kaut und blinzelt.' },
          { speaker: 'narrator', text: '„Das … schmeckt nach … Werkstatt? Nach Zuhause?“ Er nimmt noch einen. Der Chip in seinem Nacken flackert kurz.' },
          { speaker: 'player', text: 'Drei-Sekunden-Regel, Arschloch. Wirkt immer.' },
        ],
      },
      {
        id: 'foto',
        lines: [
          { speaker: 'narrator', text: 'Klick. Ein Tisch, der mehr kostet als eine Woche Suppenküche, im Hintergrund ein Gast mit leerem Blick, der sich Kaviar in die Brusttasche schaufelt.' },
          { speaker: 'narrator', text: 'Collin wird das senden. Collin wird weinen. Dann wird er Quote machen.' },
        ],
      },
      {
        id: 'park',
        lines: say('Wo das Buffet stand, steht jetzt ein Blumenstand mit gestreifter Markise. Hecki hat die Rosen in Eimern sortiert, nach Farbe und, wie es scheint, nach Laune.'),
      },
    ],
  },
  'himmelsgarten-mixi-gold': {
    id: 'himmelsgarten-mixi-gold', start: 'start',
    nodes: [
      {
        id: 'start',
        lines: [
          { speaker: 'narrator', text: 'Hinter der Bar steht ein Mixroboter aus Gold, eine Luxuskopie von Mixi aus dem High Voltage. Er dreht sich, er schüttelt, er glänzt.' },
          { speaker: 'narrator', text: '„Willkommen. Ich bin Mixi Gold. Ich mixe nur für Gäste mit einem Kontostand ab sechs Stellen. Oder mit Charme. Charme wird hier selten bestellt.“' },
        ],
        choices: [
          { text: '„Was erzählt man sich heute?“', when: PARTYNACHT, next: 'geruechte' },
          { text: '„Kennst du Mixi aus dem High Voltage?“', next: 'mixi' },
          { text: 'Eine Edelbrause bestellen. (45 Cr)', requires: { credits: 45 }, effects: [{ credits: -45 }, { give: 'edelbrause' }], next: 'brause' },
          { text: 'Gehen.' },
        ],
      },
      {
        id: 'geruechte',
        lines: [
          { speaker: 'narrator', text: '„Gerüchte heute Nacht: Blade hat seinen Mantel dreimal bürsten lassen. Die Rednerbrücke wurde auf Knalleffekte geprüft. Und der Gleiter auf dem Landeplatz ist vollgetankt.“' },
          { speaker: 'narrator', text: '„Vollgetankt bedeutet: Jemand plant, früh zu gehen. Ich mixe seit drei Stunden für Menschen, die nicht mehr wissen, was sie mögen. Ich vermisse Geschmack.“' },
        ],
        next: 'start',
      },
      {
        id: 'mixi',
        lines: [
          { speaker: 'narrator', text: 'Mixi Gold hält inne. Ein Shaker zittert.' },
          { speaker: 'narrator', text: '„Mixi. Mein Original. Sie mixt mit Rost, mit Herz und mit Fehlern. Ich mixe perfekt. Niemand weint an meiner Bar. Niemand lacht. Bitte grüßen Sie sie. Sagen Sie ihr, die Kopie beneidet sie.“' },
        ],
        next: 'start',
      },
      {
        id: 'brause',
        lines: say('Mixi Gold serviert eine Kristallflasche mit Goldflocken auf einem Silbertablett, mit Serviette, mit Verbeugung. Es ist Wasser. Es ist sehr teures Wasser.'),
      },
    ],
  },
  'himmelsgarten-hecki': {
    id: 'himmelsgarten-hecki', start: 'start',
    nodes: [
      {
        id: 'start',
        lines: [
          { speaker: 'narrator', text: 'Ein kleiner Gärtnerroboter auf Kettenrädern, mit Heckenschere, Gießkanne und einem Display, auf dem ein Smiley in Grün leuchtet. Er rollt dir entgegen und piept.' },
          { speaker: 'narrator', text: '„HECKI. Gärtnereinheit. Aufgabe: Schönheit. Nebenaufgabe: Herzen.“ Er hebt die Schere und schneidet blitzschnell eine Rose in Herzform.' },
        ],
        choices: [
          {
            text: '„Ist die für mich?“', when: { notFlag: 'woche_hecki_geschenk' }, next: 'geschenk',
            effects: [{ give: 'orchidee' }, { setFlag: 'woche_hecki_geschenk' }],
          },
          { text: '„Ist die für mich?“', when: { flag: 'woche_hecki_geschenk' }, next: 'schon' },
          { text: '„Was hältst du von der Party?“', when: PARTYNACHT, next: 'party' },
          { text: '„Wer gießt dich eigentlich?“', next: 'giessen' },
          { text: 'Gehen.' },
        ],
      },
      {
        id: 'geschenk',
        lines: [
          { speaker: 'narrator', text: 'Hecki betrachtet die Herz-Rose, piept unzufrieden und wirft sie in den Kompost. Dann holt er aus seinem Fach eine weiße Orchidee im Glastopf.' },
          { speaker: 'narrator', text: '„HERZ-ROSE: FEHLERHAFT. ERSATZ: ORCHIDEE. EINE PRO WOCHE. MEHR HERZ IST NICHT VORGESEHEN.“' },
          { speaker: 'player', text: 'Du bist der romantischste Rasenmäher, den ich je getroffen hab.' },
        ],
      },
      {
        id: 'schon',
        lines: say('Hecki zeigt auf sein Display. Ein Kalender, eine Woche, ein Kreuz. „DIESE WOCHE: SCHON GELIEBT. BITTE WARTEN.“'),
      },
      {
        id: 'party',
        lines: say('Hecki dreht die Schere einmal um sich selbst. „GÄSTE: 312. HERZEN: 0. CHIPS: 312. STATISTISCH UNGESUND.“ Er rollt davon und schneidet ein Herz in eine Hecke, sehr aggressiv.'),
      },
      {
        id: 'giessen',
        lines: [
          { speaker: 'narrator', text: '„SERENITY. MORGENS. SIE REDET MIT MIR. SIE SAGT, ICH SEI DER EINZIGE, DER NICHT NACH IHREM GELD FRAGT.“' },
          { speaker: 'narrator', text: '„ICH FRAGE NACH DÜNGER.“' },
        ],
        next: 'start',
      },
    ],
  },
};

export const part: ContentPart = {
  maps: { himmelsgarten },
  dialogues: DIALOGUES,
};
