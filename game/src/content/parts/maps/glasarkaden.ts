// Zone Glasarkaden (world.md §3.5, ID-Plan design/plan/act1.json · pkg-glasarkaden).
// Passage hinter dem Drehkreuz + Lieferhof als eigene Laufinsel (nur über den Lieferanteneingang).
// Station: station-glasarkaden wird NICHT über MapDef.station freigeschaltet (das täte schon der Lieferhof),
// sondern am U-Bahn-Zugang in der Passage bzw. beim Betreten mit Drehkreuz-Berechtigung (Flag drehkreuz_passiert).
// Lücke dazu: design/plan/gaps/maps-glasarkaden.md
import type { Condition, DialogueDef, DialogueLine, MapDef, Polygon, Rect } from '../../../modules/contracts';
import type { ContentPart } from '../../part';

const box = ([x, y, w, h]: Rect): Polygon => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
const say = (...texts: string[]): DialogueLine[] => texts.map(text => ({ speaker: 'narrator', text }));

const Q_AKTIV: Condition = { quest: 'side-alte-gewohnheiten', state: 'active' };
const EINBRUCH_BEREIT: Condition = { all: [Q_AKTIV, { time: 'nacht' }, { companion: 'raven' }] };
const PIXEL_OFFEN: Condition = { any: [{ time: ['tag', 'abend'] }, { all: [{ weekday: ['fr', 'sa'] }, { time: 'nacht' }] }] };
/** Drehkreuz-Berechtigung ohne Check (world.md §3.2); der Check-Weg gc-106 läuft über den U-Bahn-Zugang. */
const DREHKREUZ_FREI: Condition = {
  any: [{ act: 2 }, { item: 'presseausweis' }, { item: 'outfit-ordentlich' }, { origin: 'origin-oberstadt' }],
};

const glasarkaden: MapDef = {
  id: 'glasarkaden',
  name: 'Glasarkaden',
  subtitle: 'Mittelring',
  size: [1536, 1024],
  district: 'mittelring',
  lighting: 'outdoor',
  bg: 'bg-glasarkaden',
  walk: [
    // Passage: Marmor vor den Läden, Glaspark, Brunnen, Streifen über und unter der Feinkost, Drehkreuz-Durchgang.
    [[0, 272], [1536, 272], [1536, 300], [1128, 300], [1128, 560], [1536, 560], [1536, 586], [1036, 586],
      [1036, 960], [920, 960], [920, 1024], [520, 1024], [520, 960], [0, 960]],
    // Lieferhof: eigene Insel, nur über das Stahltor unten.
    [[1078, 694], [1524, 694], [1524, 962], [1362, 962], [1362, 1024], [1196, 1024], [1196, 962], [1078, 962]],
  ],
  block: [
    // Glaspark-Beete mit Bänken, Mülleimer
    box([92, 395, 156, 112]), box([287, 395, 156, 112]), box([92, 585, 156, 112]), box([287, 585, 156, 112]),
    box([444, 448, 26, 44]), box([444, 636, 28, 44]),
    // Palmen und Eimer am linken Rand, Putzroboter
    box([0, 300, 60, 120]), box([0, 650, 60, 110]), box([55, 700, 70, 70]),
    // Samtkordel vor Satin & Chrom, Liftboy-Pult
    box([238, 228, 124, 44]), box([744, 236, 54, 56]),
    // Springbrunnen (Achteck)
    [[600, 500], [650, 470], [780, 470], [832, 500], [836, 580], [780, 608], [650, 608], [596, 580]],
    // Chrome-10-Stand, Palme und Eimer daneben
    box([864, 612, 124, 82]), box([960, 744, 34, 50]), box([990, 676, 46, 140]),
    // U-Bahn-Treppe mit Geländer, Palme
    box([28, 790, 346, 234]), box([366, 800, 72, 130]),
    // Drehkreuz-Sperre: Pflanzkübel und Pfosten (Lücken dazwischen sind die Durchgänge)
    box([420, 900, 100, 124]), box([920, 900, 116, 124]),
    box([588, 910, 26, 66]), box([668, 910, 26, 66]), box([746, 910, 26, 66]), box([822, 910, 26, 66]),
    // Lieferhof: Kisten, Wäscheschacht mit Wagen, Paletten, Hubwagen, Container, Tonnen, Kiste
    box([1078, 694, 66, 120]), box([1136, 694, 72, 40]), box([1378, 694, 124, 70]), box([1302, 716, 62, 58]),
    box([1292, 784, 80, 72]), box([1360, 868, 130, 94]), box([1476, 784, 48, 178]), box([1082, 900, 46, 62]),
  ],
  exits: [
    { id: 'nach-stufenplatz', rect: [520, 998, 400, 26], to: 'stufenplatz', entry: 'von-glasarkaden', label: 'Durchs Drehkreuz zum Stufenplatz' },
    {
      id: 'lieferhof-raus', rect: [1196, 958, 166, 66], to: 'stufenplatz', entry: 'lieferanteneingang',
      label: 'Lieferanteneingang zum Stufenplatz', interact: true,
    },
    {
      id: 'nach-cafe-sahnehaube', rect: [532, 150, 72, 136], to: 'cafe-sahnehaube', entry: 'von-glasarkaden',
      label: 'Café Sahnehaube', interact: true, when: { time: ['morgen', 'tag', 'abend'] },
      lockedText: 'Stühle hochgestellt. Hinter der Scheibe glänzt eine Torte, nur für dich, aber ohne dich.',
    },
    {
      id: 'nach-quantum-schauraum', rect: [1274, 118, 72, 168], to: 'quantum-schauraum', entry: 'von-glasarkaden',
      label: 'Quantum-Schauraum', interact: true, when: { time: ['morgen', 'tag', 'abend'] },
      lockedText: 'Die Glastür bleibt zu. Das Hologramm winkt trotzdem.',
    },
    {
      id: 'lastenaufzug', rect: [1378, 640, 124, 150], to: 'chrome-penthouse', entry: 'lastenaufzug',
      label: 'Lastenaufzug nach oben', interact: true, when: EINBRUCH_BEREIT, minutes: 5,
      lockedText: 'Lastenaufzug: „Nur für Lieferungen.“ Du bist keine Lieferung. Noch nicht.',
    },
    {
      id: 'panoramaaufzug', rect: [690, 120, 160, 166], to: 'chrome-boulevard', entry: 'von-glasarkaden',
      label: 'Panoramaaufzug zum Chrome-Boulevard', interact: true,
      // Im ersten Stand gesperrt (Zielkarte kommt mit Akt 2); danach Ausweis, Ruf, Liftboy-Check (Flag) oder Akt 3.
      when: {
        all: [{ act: 2 }, {
          any: [{ item: 'ausweis-oberstadt' }, { rep: 'chrome-haus', min: 20 }, { flag: 'liftboy_ueberredet' }, { act: 3 }],
        }],
      },
      lockedText: 'Der Liftboy lächelt mit allen Zähnen: „Oberstadt-Ausweis? Nein? Dann genießen Sie die Aussicht. Von hier.“',
    },
  ],
  entries: {
    'von-stufenplatz': { at: [720, 872], facing: 'n' },
    lieferanteneingang: { at: [1280, 920], facing: 'n' },
    'von-cafe-sahnehaube': { at: [568, 300], facing: 's' },
    'von-quantum-schauraum': { at: [1310, 288], facing: 's' },
    'von-chrome-penthouse': { at: [1440, 800], facing: 's' },
    'von-chrome-boulevard': { at: [800, 316], facing: 's' },
    station: { at: [250, 770], facing: 'e' },
  },
  spots: {
    'drehkreuz-innen': { at: [720, 860], facing: 'n' },
    springbrunnen: { at: [716, 640], facing: 'n' },
    glaspark: { at: [266, 546], facing: 's' },
    'glaspark-tauben': { at: [168, 740], facing: 'n' },
    'glaspark-bank': { at: [365, 528], facing: 's' },
    'satin-und-chrom': { at: [300, 290], facing: 's' },
    pixelpalast: { at: [1066, 292], facing: 's' },
    'feinkost-theke': { at: [1330, 574], facing: 'n' },
    'kiki-landeplatz': { at: [880, 820], facing: 'w' },
    'chrome-10-werbestand': { at: [926, 712], facing: 'n' },
    panoramaaufzug: { at: [820, 296], facing: 's' },
    lieferhof: { at: [1250, 880], facing: 'n' },
    'feinkost-rampe': { at: [1252, 806], facing: 'n' },
    lastenaufzug: { at: [1440, 790], facing: 'n' },
    waescheschacht: { at: [1160, 830], facing: 'w' },
    'station-abgang': { at: [240, 770], facing: 's' },
    'auftrag-a': { at: [500, 760], facing: 's' },
  },
  hotspots: [
    // --- Läden oben ------------------------------------------------------------------------------------
    { id: 'satin-und-chrom', at: [300, 278], radius: 70, label: 'Satin & Chrom', kind: 'shop', shop: 'satin-und-chrom' },
    {
      id: 'satin-schaufenster', at: [130, 282], label: 'Schaufenster ansehen', kind: 'look',
      lines: say('Eine Schaufensterpuppe in einem Kleid, das mehr kostet als deine Niere. Beide Nieren. Mit Zinsen.',
        'Auf dem Preisschild steht nur ein Punkt. Wer fragen muss, kann es sich nicht leisten.'),
    },
    {
      id: 'satin-terminal', at: [214, 282], label: 'Kassenterminal anzapfen', kind: 'use', when: { job: 'job-datenraub' },
      lines: say('Das Kassenterminal von Satin & Chrom schläft im Standby. Madame Satin poliert gerade einen Spiegel. Jetzt oder nie.'),
      effects: [{
        minigame: 'akt-hacken', level: 3, key: 'terminal-satin-und-chrom', label: 'Kassenterminal von Satin & Chrom',
        win: [{ completeJob: 'job-datenraub' }, { message: 'Kundendaten gezogen. Halb die Oberstadt kauft hier Unterwäsche mit Monogramm.' }],
        lose: [{ message: 'Das Terminal piept beleidigt. Madame Satin hebt eine Augenbraue, die mehr gekostet hat als dein Monatslohn.' }],
      }],
    },
    {
      id: 'cafe-schaufenster', at: [466, 282], label: 'Tortenfenster ansehen', kind: 'look',
      lines: say('Sahnetorten, dreistöckig, mit Blattgold. Eine davon hat mehr Etagen als dein Wohnblock.'),
    },
    {
      id: 'aussicht-panorama', at: [716, 300], label: 'Aussicht vom Panoramaaufzug', kind: 'look', once: true,
      lines: [
        { speaker: 'narrator', text: 'Durch das Glas der Aufzugröhre siehst du nach oben: weiße Türme, goldene Kanten, Wolken, die man hier oben offenbar mietet.' },
        { speaker: 'narrator', text: 'Und nach unten: die Unterstadt. Von hier sieht sie aus wie ein umgekippter Werkzeugkasten, in dem jemand Neon verschüttet hat.' },
        { speaker: 'player', text: 'Hübsch. Aus der Ferne.' },
      ],
      effects: [{ markSeen: 'aussicht-glasarkaden' }, { xp: 20 }, { message: 'Aussichtspunkt entdeckt: Panoramaaufzug (+20 XP)' }],
    },
    {
      id: 'pixelpalast', at: [1000, 282], radius: 64, label: 'Pixelpalast: Automaten spielen', kind: 'use',
      when: PIXEL_OFFEN, dialogue: 'glasarkaden-pixelpalast',
    },
    {
      id: 'pixelpalast-zu', at: [1066, 282], label: 'Pixelpalast', kind: 'look', when: { not: PIXEL_OFFEN },
      lines: say('Rollgitter unten. Hinter dem Gitter blinkt ein einsamer Automat im Demo-Modus und spielt gegen sich selbst. Er verliert.'),
    },
    { id: 'pixelpalast-preise', at: [1140, 282], label: 'Pixelpalast-Preistheke', kind: 'shop', shop: 'pixelpalast', when: PIXEL_OFFEN },
    {
      id: 'datenwuerfel-09', at: [1180, 292], label: 'Datenwürfel im Highscore-Automaten', kind: 'loot', once: true,
      when: { wonMinigame: 'pixelpalast-chipstapler' },
      lines: say('Als dein Name ganz oben auf der Highscore-Liste aufleuchtet, spuckt der Chipstapler-Automat einen alten Datenwürfel aus. Den hatte wohl der letzte Rekordhalter drin vergessen.'),
      effects: [{ give: 'datenwuerfel-09' }],
    },
    {
      id: 'hologramm-fenster', at: [1440, 282], label: 'Hologramm im Schaufenster', kind: 'look',
      lines: [
        { speaker: 'narrator', text: 'Hinter der Scheibe des Quantum-Schauraums dreht sich ein leuchtendes Hologramm und winkt dir zu. Es winkt allen zu. Es hat Zeit.' },
        { speaker: 'narrator', text: 'Eine sanfte Stimme flüstert durch das Glas: „Chrome 10. Denken war gestern.“' },
      ],
    },
    // --- Passage ---------------------------------------------------------------------------------------
    {
      id: 'springbrunnen', at: [716, 622], label: 'Springbrunnen', kind: 'look',
      lines: say('Der Springbrunnen plätschert in Dur. Am Boden glitzern Münzen. Oberstadt-Münzen.',
        'Du könntest … Nein. Über dir hängen mehr Kameras als in einem Studio.'),
    },
    {
      id: 'datenwuerfel-08', at: [586, 548], label: 'Etwas glitzert am Beckenrand', kind: 'loot', once: true,
      lines: say('Zwischen zwei Wunschmünzen klemmt ein Datenwürfel am Beckenrand. Wer wünscht sich bitte so was?'),
      effects: [{ give: 'datenwuerfel-08' }],
    },
    {
      id: 'glaspark', at: [266, 546], label: 'Glaspark', kind: 'look',
      lines: say('Gepflegte Hecken, auf Kante geschnitten. Jemand misst hier jeden Morgen mit dem Lineal nach.',
        'Ein Schild (ein Symbol: durchgestrichener Fuß) verbietet das Betreten des Rasens. Der Rasen ist aus Kunststoff.'),
    },
    {
      id: 'glueckstern-10', at: [64, 560], label: 'Etwas funkelt in der Hecke', kind: 'loot', once: true,
      lines: say('Unter den Zweigen der Hecke funkelt ein Glücksstern. Hier hat jemand Glück gehabt – und es verloren.'),
      effects: [{ give: 'glueckstern-10' }],
    },
    {
      id: 'chrome-10-werbestand', at: [926, 704], label: 'Chrome-10-Werbestand', kind: 'look', when: { weekday: 'di' },
      lines: [
        { speaker: 'narrator', text: 'Ein Stand aus Chrom, darüber kreist ein Hologramm-Chip. Eine Promoterin mit Dauerlächeln verteilt Prospekte.' },
        { speaker: 'narrator', text: '„Chrome 10 – Freiwillige für die Testphase gesucht! Mehr Fokus, mehr Ruhe, weniger Zweifel.“' },
        { speaker: 'player', text: 'Weniger Zweifel klingt nach etwas, das man bezweifeln sollte.' },
      ],
    },
    {
      id: 'werbe-hologramm', at: [866, 660], label: 'Werbe-Hologramm (Nachrichten)', kind: 'screen',
      when: { not: { weekday: 'di' } },
    },
    { id: 'feinkost', at: [1330, 574], radius: 60, label: 'Feinkost Glasarkaden', kind: 'shop', shop: 'feinkost' },
    {
      id: 'putzroboter', at: [92, 744], label: 'Putzroboter', kind: 'look',
      lines: say('Ein Putzroboter folgt deinen Schuhabdrücken und seufzt hörbar. Er hat eine Seufz-Funktion. Für Leute wie dich.'),
    },
    {
      id: 'ubahn-zugang', at: [200, 772], radius: 80, label: 'U-Bahn Glasarkaden', kind: 'use',
      lines: say('Die Treppe zur U-Bahn ist so sauber, dass du dich fragst, ob hier je ein Zug hält. Ein Schild verspricht: Pünktlichkeit. Ein Zweites: ohne Gewähr.'),
      effects: [{ setFlag: 'drehkreuz_passiert' }, { unlockStation: 'station-glasarkaden' }, { cityMap: true }],
    },
    { id: 'ticketautomat', at: [416, 806], label: 'Ticketautomat', kind: 'shop', shop: 'ticketautomat' },
    {
      id: 'drehkreuz', at: [720, 892], label: 'Drehkreuz', kind: 'look',
      lines: say('Das Drehkreuz dreht sich nur in eine Richtung: raus. Rein muss man es sich verdienen.'),
    },
    // --- Lieferhof (eigene Laufinsel) -----------------------------------------------------------------
    {
      id: 'feinkost-rampe', at: [1254, 790], radius: 64, label: 'Feinkost-Rampe (Lieferanten-Verkauf)', kind: 'shop', shop: 'feinkost',
    },
    {
      id: 'lieferhof-container', at: [1420, 852], label: 'Müllcontainer', kind: 'look',
      lines: say('Die Oberstadt wirft Lebensmittel weg, die in der Unterstadt als Festmahl gelten. Ein ganzer Brie. Ungeöffnet. Beleidigt.'),
    },
    {
      id: 'lastenaufzug-schaltkasten', at: [1334, 700], radius: 72, label: 'Schaltkasten: Aufzug auf „Blumenlieferung“ stellen', kind: 'check',
      check: 'gc-143', when: EINBRUCH_BEREIT, hideWhen: { flag: 'alte-gewohnheiten-getarnt' },
      lines: say('Drei Kabel umgesteckt, ein Code getippt: Im Hauslog steht jetzt „Blumenlieferung, Chrome-Penthouse, Rosen, dringend“.'),
      effects: [
        { setFlag: 'alte-gewohnheiten-getarnt' }, { setFlag: 'alte-gewohnheiten-blumenlieferung' },
        { message: 'Der Lastenaufzug fährt jetzt als Blumenlieferung. Niemand prüft Blumen.' },
      ],
      altText: 'Zu viele Kabel, zu wenig Plan. Raven kennt andere Wege: den Wäscheschacht, Kikis Taxi aufs Dach oder einfach rauffahren und rennen.',
    },
    {
      id: 'lastenaufzug-schild', at: [1440, 790], label: 'Lastenaufzug', kind: 'look', when: { not: EINBRUCH_BEREIT },
      lines: say('„Nur für Lieferungen. Zielgeschoss: Penthouse Chrome.“ Daneben ein Aufkleber: „Lächeln, Sie werden gefilmt.“'),
    },
    {
      id: 'waescheschacht', at: [1150, 790], radius: 64, label: 'Durch den Wäscheschacht klettern', kind: 'check',
      check: 'gc-142', when: EINBRUCH_BEREIT,
      lines: [
        { speaker: 'narrator', text: 'Der Schacht ist eng, riecht nach Lavendel und Geld. Siebenundvierzig Stockwerke Seidenwäsche über euch.' },
        { speaker: 'raven', text: 'Ellbogen rein, Atem anhalten, nicht an Seraphinas Unterwäsche denken.' },
      ],
      effects: [
        { setFlag: 'alte-gewohnheiten-getarnt' }, { setFlag: 'alte-gewohnheiten-schacht' },
        { travel: 'chrome-penthouse', entry: 'waescheschacht', minutes: 15 },
      ],
      altText: 'Zu eng, zu glatt, zu hoch. Der Schaltkasten am Aufzug oder Kikis Taxi wären bequemer – oder ihr fahrt einfach rauf und rennt.',
    },
    {
      id: 'waescheschacht-look', at: [1150, 790], label: 'Wäscheschacht', kind: 'look', when: { not: EINBRUCH_BEREIT },
      lines: say('Aus dem Schacht fällt alle paar Minuten ein Seidenkissenbezug in den Wäschewagen. Ganz oben: das Penthouse der Chrome-Schwestern.'),
    },
  ],
  foreground: [
    // Baumkronen über den Beeten, Feinkost-Gebäude
    { rect: [128, 326, 92, 74], baseY: 430 }, { rect: [312, 326, 92, 74], baseY: 430 },
    { rect: [124, 515, 92, 74], baseY: 620 }, { rect: [318, 515, 92, 74], baseY: 620 },
    { rect: [1128, 300, 408, 258], baseY: 558 },
  ],
  lights: [
    { at: [130, 170], radius: 140, color: '#ff5a8a', slots: ['abend', 'nacht'] },
    { at: [480, 170], radius: 130, color: '#ffd28a', slots: ['abend', 'nacht'] },
    { at: [770, 150], radius: 170, color: '#7ff3ff', slots: ['abend', 'nacht'] },
    { at: [1066, 120], radius: 150, color: '#ff3fe0', slots: ['abend', 'nacht'] },
    { at: [1000, 200], radius: 110, color: '#3ef2ff', slots: ['abend', 'nacht'] },
    { at: [1440, 160], radius: 150, color: '#3ef2ff', slots: ['abend', 'nacht'] },
    { at: [716, 520], radius: 170, color: '#9ff0ff', intensity: 0.7, slots: ['abend', 'nacht'] },
    { at: [200, 818], radius: 120, color: '#3ef2ff', slots: ['abend', 'nacht'] },
    { at: [926, 570], radius: 120, color: '#ff6af0', slots: ['abend', 'nacht'] },
    { at: [1330, 470], radius: 160, color: '#ffcf7a', slots: ['abend', 'nacht'] },
    { at: [1246, 628], radius: 110, color: '#ffd27a', slots: ['abend', 'nacht'] },
    { at: [1440, 646], radius: 90, color: '#5ff2ff', slots: ['abend', 'nacht'] },
  ],
  ambient: {
    count: 8,
    sprites: ['passant-anzug-walk', 'passant-tourist-walk', 'passant-oma-walk', 'passant-kurier-walk', 'passant-arbeiterin-walk'],
    bySlot: { morgen: 4, tag: 10, abend: 8, nacht: 2 },
    routes: [
      [[80, 304], [1000, 304], [1500, 290]],
      [[520, 330], [540, 680], [720, 690], [900, 560], [1000, 330]],
      [[720, 880], [720, 690], [560, 420], [300, 310]],
      [[266, 546], [470, 546], [480, 740], [150, 770], [70, 546]],
      [[1060, 330], [1060, 560], [1460, 574]],
      [[480, 880], [960, 860], [1010, 600], [900, 320]],
    ],
    barks: [
      { text: 'Unterstadt? Das klingt wie eine Erkältung.' },
      { text: 'Mein Pudel hat mehr Implantate als du.' },
      { text: 'Riechst du das? Das ist Erfolg. Oder der neue Bodenreiniger.' },
      { text: 'Ich habe einen Termin um zehn. Den hatte ich auch gestern schon.', when: { time: 'morgen' } },
      { text: 'Collin ist live? Schnell, Haare richten!', when: { weekday: ['mo', 'mi', 'fr'] } },
      { text: 'Schatz, nicht den Brunnen anfassen. Da war heute schon Unterstadt dran.' },
      { text: 'Ich kaufe nichts. Ich lasse mich nur beraten. Seit vier Stunden.' },
      { text: 'Geh mir aus dem Licht, du Rostbeule. Das ist mein Sonnenstreifen.' },
      { text: 'Igitt, Schuhe mit Profil. Wer braucht denn hier Profil?' },
      { text: 'Sahnetorte zum Frühstück ist kein Laster, wenn man sie mit Goldgabel isst.', when: { time: 'morgen' } },
      { text: 'Der Pixelpalast ist was für Kinder und Männer in der Midlife-Crisis. Also für meinen Mann.', when: { time: ['tag', 'abend'] } },
      { text: 'Chrome 10 gratis testen? Ich teste lieber Champagner.', when: { weekday: 'di' } },
      { text: 'Psst. Der Wachmann schläft. Der Springbrunnen auch.', when: { time: 'nacht' } },
      { text: 'Haben Sie auch das neue Update? Ich fühle mich so … aktualisiert.', when: { act: 2 } },
      { text: 'Master hat gesagt, ich soll lächeln. Ist das richtig so?', when: { act: 2 } },
      { text: 'Einbruch im Penthouse? Ein Vogel auf dem Spiegel? Wie geschmacklos. Und wie mutig.', when: { flag: 'alte-gewohnheiten-rabe-gemalt' } },
    ],
  },
  ambience: 'oberstadt',
  music: 'oberstadt',
  onEnter: [
    { id: 'glasarkaden-ankunft', once: true, dialogue: 'glasarkaden-ankunft' },
    {
      id: 'glasarkaden-drehkreuz', when: { all: [DREHKREUZ_FREI, { notFlag: 'drehkreuz_passiert' }] },
      effects: [{ setFlag: 'drehkreuz_passiert' }, { unlockStation: 'station-glasarkaden' }],
    },
    {
      id: 'alte-gewohnheiten-zurueck', once: true,
      when: { all: [{ flag: 'alte-gewohnheiten-rabe-gemalt' }, { notFlag: 'alte-gewohnheiten-entkommen' }] },
      dialogue: 'glasarkaden-raven-zurueck',
    },
  ],
};

const DIALOGUES: Record<string, DialogueDef> = {
  'glasarkaden-ankunft': {
    id: 'glasarkaden-ankunft', start: 'a',
    nodes: [{
      id: 'a',
      lines: [
        { speaker: 'narrator', text: 'Die Glasarkaden. Weißer Marmor, so sauber, dass du dich darin spiegelst – und dein Spiegelbild schämt sich ein bisschen.' },
        { speaker: 'narrator', text: 'Es riecht nach Parfüm, Sahne und Geld, das nie in einer Pfütze lag. Selbst die Tauben hier haben Haltung.' },
        { speaker: 'player', text: 'Ich fass nichts an. Außer vielleicht alles.' },
      ],
    }],
  },
  'glasarkaden-pixelpalast': {
    id: 'glasarkaden-pixelpalast', start: 'a',
    nodes: [
      {
        id: 'a',
        lines: [
          { speaker: 'narrator', text: 'Der Pixelpalast piept, blinkt und riecht nach heißem Plastik und Teenagerschweiß. Drei Automaten buhlen um dich wie Türsteher um Trinkgeld.' },
        ],
        choices: [
          {
            text: '„Drohnenjagd“ – zum Aufwärmen (5 Cr)', requires: { credits: 5 },
            effects: [{ credits: -5 }, {
              minigame: 'akt-pixelpalast', level: 1, key: 'pixelpalast-drohnenjagd', label: 'Drohnenjagd',
              win: [{ give: 'plueschmoehre' }, { message: 'Gewonnen! Die Greifzange spuckt eine Plüschmöhre aus. Sie guckt vorwurfsvoll.' }],
              lose: [{ message: 'Game over. Die Drohnen tanzen auf deinem Ego Polka.' }],
            }],
          },
          {
            text: '„Neon-Schlange“ – mittelschwer (10 Cr)', requires: { credits: 10 },
            effects: [{ credits: -10 }, {
              minigame: 'akt-pixelpalast', level: 3, key: 'pixelpalast-neon-schlange', label: 'Neon-Schlange',
              win: [{ give: 'pluesch-pixelpalast' }, { message: 'Die Schlange ist lang, dein Grinsen länger: ein Plüschtier für dich!' }],
              lose: [{ message: 'Die Schlange beißt sich in den Schwanz. Und dir in den Stolz.' }],
            }],
          },
          {
            text: '„Chipstapler“ – den Highscore knacken (20 Cr)', requires: { credits: 20 },
            when: { not: { wonMinigame: 'pixelpalast-chipstapler' } },
            effects: [{ credits: -20 }, {
              minigame: 'akt-pixelpalast', level: 5, key: 'pixelpalast-chipstapler', label: 'Chipstapler – Highscore',
              win: [{ give: 'schallplatte-09' }, { xp: 40 }, { message: 'NEUER HIGHSCORE! Der Hauptpreis gehört dir: Schallplatte „Pixel & Puls – Highscore“.' }],
              lose: [{ message: 'Der Turm wackelt, der Turm fällt. Ein Zwölfjähriger neben dir lacht nicht mal. Er nickt nur mitleidig.' }],
            }],
          },
          {
            text: '„Chipstapler“ – Rekord verteidigen (20 Cr)', requires: { credits: 20 },
            when: { wonMinigame: 'pixelpalast-chipstapler' },
            effects: [{ credits: -20 }, {
              minigame: 'akt-pixelpalast', level: 5, key: 'pixelpalast-chipstapler-revanche', label: 'Chipstapler – Revanche',
              win: [{ credits: 45 }, { message: 'Rekord gehalten. Der Automat zahlt 45 Cr Siegprämie und verflucht dich leise.' }],
              lose: [{ message: 'Knapp daneben ist auch vorbei. Dein Name steht trotzdem noch oben. Noch.' }],
            }],
          },
          { text: 'Nur gucken.' },
        ],
      },
    ],
  },
  'glasarkaden-raven-zurueck': {
    id: 'glasarkaden-raven-zurueck', start: 'a',
    nodes: [{
      id: 'a',
      lines: [
        { speaker: 'narrator', text: 'Der Lieferhof. Kalte Nachtluft, Müllcontainer, der schönste Geruch der Welt: Freiheit mit einem Hauch Brie.' },
        { speaker: 'raven', expr: 'signatur', text: 'Rabe auf dem Spiegel, Puls bei achtzig. Ich bin nicht eingerostet.' },
        { speaker: 'raven', expr: 'freude', text: 'Und du warst auch nicht schlecht. Für jemanden, der beim Schleichen atmet wie ein Kompressor.' },
      ],
      effects: [{ setFlag: 'alte-gewohnheiten-entkommen' }],
    }],
  },
};

export const part: ContentPart = {
  maps: { glasarkaden },
  // Station: steht mit Stadtkarten-Lage in world/bezirke-fraktionen.ts.
  dialogues: DIALOGUES,
};
