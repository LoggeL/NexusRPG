// Zone Neon-Gasse (world.md §3.5, Plan design/plan/act1.json maps.neon-gasse, Paket pkg-neon-gasse).
// Zentrum der Crew: Eingang High Voltage mit Samtkordel, Kiosk Volt-Eck, Stadt-TV, U-Bahn-Treppe, Feuerleiter zur
// Dachterrasse (Teil dieser Karte, über die Treppe begehbar) mit Vegas Ausguck, Lichterketten-Bank, Klingen-Ecke,
// Dachkante und der Lücke (Szenenorte Vex × Aria und Aria-Strang). Legt Bezirk `unterstadt` und `station-neon-gasse` an.
// Koordinaten am fertigen Bild game/public/assets/bg/neon-gasse.webp (1536×1024) nachgezogen.
import type { Condition, DialogueDef, DialogueLine, HotspotDef, MapDef, Polygon, Rect } from '../../../modules/contracts';
import type { ContentPart } from '../../part';

const box = ([x, y, w, h]: Rect): Polygon => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
const n = (text: string): DialogueLine => ({ speaker: 'narrator', text });
const ich = (text: string, expr?: DialogueLine['expr']): DialogueLine => ({ speaker: 'player', text, ...(expr ? { expr } : {}) });

const V: Condition = { playerIs: 'vex' };
const NICHT_V: Condition = { not: V };
const PROBEZEIT_DONE: Condition = { quest: 'main-1-probezeit', state: 'done' };
/** Einlass ins High Voltage: Flag (Bruno überzeugt), nach der Probezeit immer, morgens/tags ohne Türsteher. */
const HV_OFFEN: Condition = { any: [{ flag: 'hv_einlass' }, PROBEZEIT_DONE, { time: ['morgen', 'tag'] }] };
const LUECKE_GESEHEN: Condition = { seen: 'rom-vexaria-luecke' };
const DACH_GESEHEN: Condition = { seen: 'rom-aria-dach' };

// ---------------------------------------------------------------------------------------------------- Sammelobjekte

function loot(id: string, at: readonly [number, number], label: string, text: string, extra: Partial<HotspotDef> = {}): HotspotDef {
  return {
    id, at, label, kind: 'loot', once: true, radius: 48,
    lines: [n(text)],
    effects: [{ give: id }, { setFlag: `gefunden_${id}` }],
    ...extra,
  };
}

// ---------------------------------------------------------------------------------------------------- Dialoge

/** Samtkordel: Bruno Brecher lässt nur „Gäste mit Stil“ rein (main-1-probezeit). Jeder Weg setzt hv_einlass. */
const samtkordel: DialogueDef = {
  id: 'ng-samtkordel',
  start: 'start',
  nodes: [
    {
      id: 'start',
      lines: [
        n('Ein Schrank von einem Mann steht vor der Samtkordel. Der Schrank hat Arme. Die Arme haben Arme.'),
        { speaker: 'bruno-brecher', text: 'Nur Gäste mit Stil.' },
        { speaker: 'bruno-brecher', text: 'Du bist keiner. Noch nicht. Überzeug mich, zahl, oder geh woanders scheitern.' },
      ],
      choices: [
        {
          text: '„Stil? Ich bin der Grund, warum es hier überhaupt Stil gibt.“', check: 'gc-04',
          effects: [{ setFlag: 'hv_einlass' }], next: 'charme',
        },
        {
          text: '(Hunters Nachricht auf dem Telefon zeigen.)',
          when: { quest: 'main-1-probezeit', state: 'active' },
          effects: [{ setFlag: 'hv_einlass' }], next: 'nachricht',
        },
        {
          text: '(20 Credits in seine Brusttasche stecken.)', requires: { credits: 20 },
          effects: [{ credits: -20 }, { setFlag: 'hv_einlass' }, { sfx: 'coin' }], next: 'zahlen',
        },
        { text: '„Bruno. Ich bin’s. Die Postbotin. Ich hab dir letzte Woche deine Proteinpulver-Lieferung gebracht.“', when: V, next: 'vex' },
        { text: 'Ich komm wieder. Mit mehr Stil. Oder mit einem Bagger.' },
      ],
    },
    {
      id: 'charme',
      lines: [
        { speaker: 'bruno-brecher', text: '…' },
        { speaker: 'bruno-brecher', text: 'Das war so dreist, das war schon wieder Stil. Rein mit dir, bevor ich’s mir anders überleg.' },
      ],
    },
    {
      id: 'nachricht',
      lines: [
        { speaker: 'bruno-brecher', text: '„Lass die Pfeife rein. – H.“ Hm. „Pfeife“ ist bei Hunter ein Kompliment. Rein.' },
      ],
    },
    {
      id: 'zahlen',
      lines: [
        { speaker: 'bruno-brecher', text: 'Stil kann man nicht kaufen. Aber man kann ihn mieten. Viel Spaß drin.' },
      ],
    },
    {
      id: 'vex',
      lines: [
        { speaker: 'bruno-brecher', text: 'Und es war verbeult. Die Dose. Und der Deckel war offen. Und das Pulver hat nach Abgas geschmeckt.' },
        ich('Das war die Gasse. Die schmeckt nach Abgas.'),
        { speaker: 'bruno-brecher', text: 'Charmant wie immer, Schrapnell. Zahl, überzeug mich oder fahr weiter Pakete.' },
      ],
      next: 'start',
    },
  ],
};

/** Aussichtspunkt Dachterrasse (§3.9): einmalig 20 XP, deckt die Zonenkarte auf. */
const aussicht: DialogueLine[] = [
  n('Von hier oben sieht die Unterstadt aus wie ein umgekippter Werkzeugkasten, in den jemand Lichterketten gekippt hat.'),
  n('Rechts der Schrottmarkt mit Gustavs Kran, unten die Lötgassen mit ihren Funken, dahinter, ganz weit oben, der Quantum-Tower – so hell, dass er Schatten auf die Wolken wirft.'),
];

// ---------------------------------------------------------------------------------------------------- Karte

const gasse: MapDef = {
  id: 'neon-gasse',
  name: 'Neon-Gasse',
  subtitle: 'Unterstadt',
  size: [1536, 1024],
  district: 'unterstadt',
  lighting: 'outdoor',
  bg: 'bg-neon-gasse',
  walk: [
    // Gasse: Vorplatz, Kiosk, U-Bahn-Treppe, Bogen Richtung Schrottmarkt, Werkstattgasse nach Süden, Streifen hinter den Mülltonnen
    [
      [200, 322], [402, 322], [406, 298], [526, 298], [530, 320], [746, 318], [778, 300], [782, 206], [998, 206],
      [1004, 300], [1030, 322], [1032, 446], [1336, 450], [1350, 470], [1536, 470], [1536, 560], [1472, 560],
      [1462, 706], [1150, 708], [1150, 748], [746, 748], [746, 1020], [10, 1020], [10, 992], [492, 992], [492, 742],
      [300, 738], [296, 708], [132, 708], [130, 648], [202, 642], [238, 600], [238, 540], [212, 530], [212, 334],
    ],
    // Feuerleiter: vier Treppenläufe, drei Podeste
    [[1180, 454], [1222, 454], [1296, 350], [1256, 350]],
    box([1252, 316, 64, 58]),
    [[1250, 332], [1292, 332], [1212, 258], [1170, 258]],
    box([1128, 232, 72, 62]),
    [[1176, 264], [1214, 264], [1312, 164], [1274, 164]],
    box([1268, 146, 68, 60]),
    [[1272, 168], [1312, 168], [1222, 98], [1180, 98]],
    // Dachterrasse
    box([1066, 68, 348, 62]),
  ],
  block: [
    box([1220, 448, 84, 40]), // Einkaufswagen
    box([1252, 50, 70, 52]), // Terrassentisch mit Stühlen
  ],
  exits: [
    { id: 'nach-schrottmarkt', rect: [1500, 470, 36, 90], to: 'schrottmarkt', entry: 'von-neon-gasse', label: 'Zum Schrottmarkt' },
    { id: 'nach-loetgassen', rect: [496, 996, 250, 28], to: 'loetgassen', entry: 'von-neon-gasse', label: 'Zu den Lötgassen' },
    { id: 'nach-bahnhof-mitte', rect: [786, 206, 208, 28], to: 'bahnhof-mitte', entry: 'von-neon-gasse', label: 'U-Bahn-Treppe: Bahnhof Mitte' },
    {
      id: 'nach-high-voltage', rect: [405, 248, 120, 56], to: 'high-voltage', entry: 'von-neon-gasse', label: 'High Voltage', interact: true,
      when: HV_OFFEN,
      lockedText: 'Bruno Brecher verschränkt die Arme: „Nur Gäste mit Stil. Du bist keiner. Noch nicht.“',
    },
    {
      id: 'nach-crew-quartier', rect: [176, 252, 68, 74], to: 'crew-quartier', entry: 'von-neon-gasse', label: 'Hintertreppe: Crew-Quartier', interact: true,
      when: PROBEZEIT_DONE,
      lockedText: 'Die Hintertreppe gehört Hunters Leuten. Auf dem Geländer klebt ein Zettel: „Fremde fliegen. – C. K.“',
    },
    {
      id: 'dachsprung-loetgassen', rect: [1398, 92, 36, 40], to: 'loetgassen', entry: 'dach-taubenschlag', label: 'Dachsprung zu den Lötgassen', interact: true,
      check: 'gc-150', minutes: 2,
      lockedText: 'Drei Meter Luft und sieben Stockwerke Meinung. Dein Körper sagt Nein. Dein Ego auch, leise.',
    },
  ],
  entries: {
    'von-schrottmarkt': { at: [1488, 515], facing: 'w' },
    'von-loetgassen': { at: [620, 984], facing: 'n' },
    'von-bahnhof-mitte': { at: [890, 290], facing: 's' },
    'von-high-voltage': { at: [465, 366], facing: 's' },
    'von-crew-quartier': { at: [224, 350], facing: 's' },
    dachkante: { at: [1370, 116], facing: 'w' },
    station: { at: [860, 322], facing: 's' },
    taxi: { at: [640, 600], facing: 's' },
  },
  spots: {
    kiosk: { at: [250, 480], facing: 'w' },
    'kiosk-waechter': { at: [256, 612], facing: 's' },
    'hv-eingang': { at: [582, 332], facing: 's' },
    vorplatz: { at: [520, 424], facing: 's' },
    werbestand: { at: [1090, 472], facing: 's' },
    'stadt-tv': { at: [232, 348], facing: 'w' },
    gassenmitte: { at: [780, 560], facing: 's' },
    'pfandflaschen-ecke': { at: [330, 700], facing: 's' },
    'paul-ecke': { at: [1000, 476], facing: 's' },
    'lumos-ecke': { at: [662, 332], facing: 's' },
    'kalle-ecke': { at: [360, 382], facing: 'e' },
    'pfeffer-gasse': { at: [620, 880], facing: 'n' },
    muelltonnen: { at: [300, 1004], facing: 'w' },
    'stellwerk-kasten': { at: [722, 332], facing: 'n' },
    vordach: { at: [236, 410], facing: 's' },
    feuerleiter: { at: [1200, 472], facing: 'n' },
    dachterrasse: { at: [1250, 118], facing: 's' },
    'vegas-ausguck': { at: [1372, 106], facing: 'e' },
    'lichterketten-bank': { at: [1222, 96], facing: 's' },
    'klingen-ecke': { at: [1332, 118], facing: 's' },
    'kamera-stativ': { at: [1160, 104], facing: 's' },
    'apportier-strecke': { at: [1300, 112], facing: 'w' },
    dachkante: { at: [1150, 124], facing: 's' },
    'die-luecke': { at: [1080, 100], facing: 'w' },
    'nils-reklame': { at: [1340, 84], facing: 'n' },
    'ubahn-abgang': { at: [890, 250], facing: 'n' },
    'auftrag-a': { at: [980, 640], facing: 's' },
  },
  hotspots: [
    // ------------------------------------------------------------------ Gasse
    { id: 'volt-eck', at: [206, 482], radius: 60, label: 'Volt-Eck (Kiosk)', kind: 'shop', shop: 'volt-eck' },
    { id: 'stadt-tv', at: [150, 318], radius: 72, label: 'Stadt-TV (Nachrichten)', kind: 'screen' },
    {
      id: 'samtkordel', at: [465, 330], radius: 60, label: 'Samtkordel', kind: 'talk', dialogue: 'ng-samtkordel',
      when: { all: [{ not: HV_OFFEN }, { time: ['abend', 'nacht'] }] },
    },
    {
      id: 'samtkordel-look', at: [465, 330], radius: 60, label: 'Samtkordel ansehen', kind: 'look',
      when: HV_OFFEN,
      lines: [n('Samtkordel, zwei Messingpfosten, ein roter Teppich mit Kaugummi-Sternbild. Darüber knistert der Blitz. „Nur Gäste mit Stil.“ Du bist jetzt offiziell Stil. Herzlichen Glückwunsch.')],
    },
    {
      id: 'werbestand-xion', at: [1090, 456], radius: 60, label: 'Werbestand', kind: 'look',
      when: { time: 'abend' },
      lines: [
        n('Ein Klapptisch mit weißer Decke, darauf Gratis-Snacks und ein Schild: „Freiwillige gesucht – Snacks inklusive!“'),
        { speaker: 'xion-venom', text: 'Quantum sucht Menschen mit Zukunft. Du siehst nicht danach aus. Nimm trotzdem einen Keks.' },
      ],
    },
    {
      id: 'stellwerk-neon', at: [722, 316], radius: 56, label: 'Stellwerk entstören', kind: 'check', check: 'gc-50',
      when: { quest: 'side-uebliche-verspaetung', state: 'active' }, hideWhen: { flag: 'stellwerk_neon_entstoert' },
      lines: [n('Ein grauer Kasten mit Kabelsalat. Irgendwer hat einen Störsender drangeklebt, mit Panzertape und viel Liebe.')],
      effects: [{ setFlag: 'stellwerk_neon_entstoert' }, { message: 'Störsender ab, Kabel zurück. Irgendwo unter dir fährt eine U-Bahn plötzlich pünktlich los. Unheimlich.' }],
      altText: 'Zu viel Technik für deine Finger. Mit Dexters Schraubschlüssel geht’s auch – dauert halt eine Stunde.',
    },
    {
      id: 'stellwerk-neon-schluessel', at: [722, 316], radius: 56, label: 'Stellwerk mit Schraubschlüssel bearbeiten (1 Std.)', kind: 'use',
      when: { all: [{ quest: 'side-uebliche-verspaetung', state: 'active' }, { item: 'dexters-schraubschluessel' }] },
      hideWhen: { flag: 'stellwerk_neon_entstoert' },
      effects: [
        { advanceTime: 60 }, { setFlag: 'stellwerk_neon_entstoert' },
        { message: 'Eine Stunde, vier Flüche und ein Schraubschlüssel später ist der Störsender ab. Dexter wäre stolz. Oder würde Geld verlangen.' },
      ],
    },
    {
      id: 'muelltonne', at: [150, 1000], radius: 70, label: 'Mülltonnen durchwühlen', kind: 'loot', once: true,
      lines: [n('Du wühlst in der Tonne. Die Tonne wühlt zurück. Zwischen Pizzakartons und einem einzelnen Stöckelschuh: Brauchbares.')],
      effects: [{ give: 'rostige-dose' }, { give: 'schrott-ersatzteil' }],
    },
    {
      id: 'muelltonne-leer', at: [150, 1000], radius: 70, label: 'Mülltonnen', kind: 'look',
      when: { seen: 'muelltonne' },
      lines: [n('Die Tonnen sind leer gewühlt. Eine Ratte guckt dich vorwurfsvoll an. Du warst ihr Abendessen-Lieferservice.')],
    },
    {
      id: 'datenwuerfel-01', at: [250, 700], radius: 56, label: 'Lüftungsgitter aufknacken', kind: 'use',
      hideWhen: { flag: 'gefunden_datenwuerfel-01' },
      lines: [n('Unter dem dampfenden Gitter glimmt etwas Blaues. Das Gitter ist mit einem Vorhängeschloss gesichert, das älter ist als du.')],
      effects: [{
        minigame: 'akt-schloss', level: 1, key: 'schloss-neon-gitter', label: 'Lüftungsgitter',
        win: [{ give: 'datenwuerfel-01' }, { setFlag: 'gefunden_datenwuerfel-01' }, { message: 'Klick. Darunter, warm und feucht: ein Datenwürfel. Riecht nach Club-Abluft.' }],
        lose: [{ message: 'Das Schloss gewinnt. Der Dampf lacht dich aus. Versuch’s gleich nochmal.' }],
      }],
    },
    {
      id: 'ubahn-zugang', at: [890, 240], radius: 64, label: 'U-Bahn Neon-Gasse', kind: 'look',
      lines: [
        n('Die Treppe zur Station Neon-Gasse. Unten riecht es nach Bremsstaub und Pommes. Von hier fährst du mit der U-Bahn überall hin, wo du schon mal warst (Stadtkarte).'),
      ],
    },
    loot('neon-tag-01', [1100, 446], 'Neon-Tag an der Wand', 'Ein Blitz-Graffiti, das nachts von selbst leuchtet. Darunter hängt ein kleiner Sticker mit demselben Motiv. Der Sticker kommt mit. Die Wand bleibt.'),
    loot('glueckstern-01', [1314, 476], 'Glitzern beim Einkaufswagen', 'Im Kinderfach des umgekippten Einkaufswagens liegt ein Glücksstern. Jemand hatte heute wohl keinen.'),
    // ------------------------------------------------------------------ Feuerleiter und Dach
    {
      id: 'feuerleiter', at: [1200, 456], radius: 52, label: 'Feuerleiter', kind: 'look',
      when: { not: { all: [V, { seen: 'rom-aria-albtraum' }] } },
      lines: [n('Eine rostige Feuerleiter, Zickzack bis aufs Dach. Jede dritte Stufe quietscht. Die siebte ist eine Lüge – nicht drauftreten.')],
    },
    {
      id: 'feuerleiter-albtraum', at: [1200, 456], radius: 52, label: 'Feuerleiter', kind: 'look',
      when: { all: [V, { seen: 'rom-aria-albtraum' }] },
      lines: [
        n('Die vierte Stufe von unten. Da saß sie um drei Uhr nachts, barfuß, die Prothese im Schoß, und hat dich angesehen, als wärst du die einzige Lampe in der Gasse.'),
        ich('Sie hat nicht geweint. Sie hat nur meinen Ärmel nicht losgelassen. Eine Stunde lang. Ich hab den Arm nicht mehr gespürt. Den guten.', 'trauer'),
      ],
    },
    {
      id: 'aussicht-dachterrasse', at: [1320, 112], radius: 54, label: 'Aussicht genießen', kind: 'look', once: true,
      lines: aussicht,
      effects: [{ xp: 20 }, { setFlag: 'aussicht_neon-gasse' }, { markSeen: 'aussicht-neon-gasse' }, { message: 'Aussichtspunkt entdeckt: Dachterrasse Neon-Gasse.' }],
    },
    {
      id: 'aussicht-dachterrasse-wieder', at: [1320, 112], radius: 54, label: 'Aussicht', kind: 'look',
      when: { seen: 'aussicht-dachterrasse' },
      lines: [n('Die Stadt glitzert, als hätte sie sich extra schick gemacht. Für wen, sagt sie nicht.')],
    },
    {
      id: 'sternegucken', at: [1376, 100], radius: 50, label: 'Sterne gucken (mit Vega)', kind: 'use',
      when: { all: [{ time: 'nacht' }, { met: 'vega' }] },
      lines: [{ speaker: 'vega', text: 'Smog ist heute dünn. Komm her. Und fass das Fernrohr nicht mit Fettfingern an.' }],
      effects: [{
        minigame: 'akt-sternegucken', level: 1, key: 'akt-sternegucken', label: 'Sternbilder verbinden',
        win: [{ relation: 'vega', delta: 10 }, { xp: 15 }, { message: 'Ein Sternbild, das aussieht wie ein Schraubenschlüssel. Vega nennt es „Dexters Gürtel“ und lächelt fast.' }],
        lose: [{ message: 'Du hast drei Satelliten und ein Flugtaxi verbunden. Vega seufzt in Sternbildform.' }],
      }],
    },
    {
      id: 'vegas-ausguck', at: [1376, 100], radius: 50, label: 'Vegas Ausguck', kind: 'look',
      when: { not: { time: 'nacht' } },
      lines: [
        n('Ein Klappstuhl, ein altes Fernrohr mit Panzertape, ein Notizbuch voller Zahlen, Windrichtungen und einer Liste: „Leute, die mir auf die Nerven gehen“. Die Liste ist lang. Hunter steht dreimal drauf.'),
      ],
    },
    {
      id: 'lichterketten-bank', at: [1222, 92], radius: 48, label: 'Bank unter den Lichterketten', kind: 'look',
      when: { not: DACH_GESEHEN },
      lines: [n('Zwei Stühle, ein wackliger Tisch, warme Glühbirnen an einem Kabel, das eindeutig vom Club angezapft ist. Der schönste Diebstahl der Unterstadt.')],
    },
    {
      id: 'lichterketten-bank-aria', at: [1222, 92], radius: 48, label: 'Bank unter den Lichterketten', kind: 'look',
      when: DACH_GESEHEN,
      lines: [
        n('Der linke Stuhl hat noch die Delle von Arias Stiefel, den sie auf deinen Stuhl gestellt hat, „weil da Platz war“. Da war kein Platz. Da warst du.'),
        { speaker: 'player', text: 'Zweimal hier oben mit ihr. Und beide Male hab ich vergessen, wie man atmet.', expr: 'ueberrascht' },
      ],
    },
    {
      id: 'klingen-ecke', at: [1332, 116], radius: 46, label: 'Kerben im Geländer', kind: 'look',
      lines: [n('Das Geländer hat hundert feine Schnitte, alle exakt gleich tief. Der Barkeeper übt hier tags mit seiner Klinge. Er hat noch nie danebengeschnitten. Auch nicht, als ihn eine Taube erschreckt hat. Die Taube schon.')],
    },
    // Dachkante und Lücke (Vex × Aria, Priorität)
    {
      id: 'dachkante', at: [1150, 124], radius: 50, label: 'Dachkante', kind: 'look',
      when: NICHT_V,
      lines: [n('Unter dir die Gasse: Pfützen voller Neon, Dampf, eine Mülltonne, die sich mit einem Betrunkenen streitet. Freitags und samstags nachts rennen hier Kuriere über die Dächer, als hätten sie ein Ersatzgenick.')],
    },
    {
      id: 'dachkante-vex', at: [1150, 124], radius: 50, label: 'Dachkante', kind: 'look',
      when: { all: [V, { not: LUECKE_GESEHEN }] },
      lines: [
        n('Die Dachkante. Von hier startet das Freitagsrennen der Kuriere: über die Neon-Gasse, die Lötgassen, bis zum Taubenschlag.'),
        ich('Startlinie. Riecht wie früher. Nach Teer, Regen und zu wenig Schlaf.'),
      ],
    },
    {
      id: 'dachkante-vex-danach', at: [1150, 124], radius: 50, label: 'Dachkante', kind: 'look',
      when: { all: [V, LUECKE_GESEHEN] },
      lines: [
        n('Hier hat sie dich am Gurtzeug gepackt, bevor du losrennen konntest. Zwei Finger unter dem Riemen, flach auf deinem Brustbein, und dieses Grinsen: „Rennsemmel. Ich lauf mit.“'),
        ich('Ich hätte sie abhängen können. Hab ich nicht. Wollte ihre Hand da nicht wegnehmen. Sag ich ihr nie.', 'neutral'),
      ],
    },
    {
      id: 'die-luecke', at: [1080, 100], radius: 50, label: 'Die Lücke', kind: 'look',
      when: NICHT_V,
      lines: [
        n('Zwischen diesem Dach und dem nächsten klafft ein Spalt. Viereinhalb Meter breit, neun Stockwerke tief. Unten glimmt ein Lüftungskasten, schief aus der Wand gerissen.'),
        n('Die Kuriere nennen das hier nur „die Lücke“. Keiner springt. Keiner redet drüber. An der Kante klebt ein ausgeblichener Sticker: eine Eins mit Blitz.'),
      ],
    },
    {
      id: 'die-luecke-vex', at: [1080, 100], radius: 50, label: 'Die Lücke', kind: 'look',
      when: { all: [V, { not: LUECKE_GESEHEN }] },
      lines: [
        n('Die Lücke. Viereinhalb Meter. Neun Stockwerke. Unten der Lüftungskasten, den du mit deinem Arm aus der Wand gerissen hast. Er hängt immer noch da. Du auch, irgendwie.'),
        ich('Hinter mir hat’s geknackt. Ich hab mich nicht umgedreht. Man dreht sich nicht um. Hat Kas gesagt.', 'trauer'),
        n('Deine linke Hand ballt sich im fingerlosen Handschuh. Die Narben ziehen. Du springst hier nicht. Nicht mit Sprungfedern, nicht mit Flügeln, nicht mal im Traum.'),
      ],
    },
    {
      id: 'die-luecke-vex-danach', at: [1080, 100], radius: 50, label: 'Die Lücke', kind: 'look',
      when: { all: [V, LUECKE_GESEHEN] },
      lines: [
        n('Die Lücke. Gleiche Breite, gleiche Tiefe. Aber seit sie neben dir an der Kante stand, ist es nicht mehr nur Kas’ Ort.'),
        ich('Sie hat nicht gefragt. Sie hat nur meinen Ratenarm genommen, als wär’s ein normaler Arm, und gesagt: „Wir gehen außen rum, Postbotin. Ich hab Zeit.“', 'trauer'),
        n('Zeit. Das hat dir noch nie jemand angeboten.'),
      ],
    },
    {
      id: 'nils-reklame', at: [1340, 82], radius: 44, label: 'Leuchtreklame auf dem Dach', kind: 'look',
      lines: [n('Die Rückseite einer Leuchtreklame: Kabel, Tauben, ein klebriger Rest Fake-Plakat mit „QUANTUM LIEBT DI…“. Den Rest hat der Regen gefressen. Oder Neon-Nils.')],
    },
    loot('neon-tag-02', [1394, 76], 'Neon-Tag am Wassertank', 'Am Wassertank klebt ein Neon-Tag in Pink und Cyan: ein Herz mit Stecker. Kitschig. Du nimmst es trotzdem mit.'),
    // ------------------------------------------------------------------ Vordach (Aria-Strang)
    {
      id: 'vordach', at: [236, 400], radius: 50, label: 'Vordach am Kiosk', kind: 'look',
      when: { not: { seen: 'rom-aria-regen' } },
      lines: [n('Die gelbe Markise vom Volt-Eck. Der trockenste Quadratmeter der Gasse, wenn’s regnet. Oma Volt verlangt dafür keinen Eintritt. Noch nicht.')],
    },
    {
      id: 'vordach-regen', at: [236, 400], radius: 50, label: 'Vordach am Kiosk', kind: 'look',
      when: { seen: 'rom-aria-regen' },
      lines: [
        n('Hier hast du mit ihr gestanden, nass bis auf die Knochen, Schulter an Schulter unter einem Vordach, das für eine Person gebaut ist. Ihr habt beide so getan, als wäre das Zufall.'),
        n('Oma Volt hat das Licht im Kiosk ausgemacht. Diskret. Für ihre Verhältnisse.'),
      ],
    },
  ],
  encounters: [
    {
      id: 'abzieher-werkstattgasse', encounter: 'enc-zufall-neon-gasse-abzieher-nacht', at: [620, 860], sprite: 'passant-punk-walk',
      patrol: [[600, 820], [660, 940]], when: { time: 'nacht' },
      avoid: { id: 'ng-abzieher-umgehen', attribute: 'strasse', threshold: 4, tags: ['einschuechtern', 'geruecht'], label: '[Straße 4]' },
    },
  ],
  foreground: [
    { rect: [1064, 116, 344, 22], baseY: 134 }, // Terrassengeländer vorn
  ],
  lights: [
    { at: [465, 110], radius: 230, color: '#ff3fd0', intensity: 0.9, slots: ['abend', 'nacht'] },
    { at: [465, 360], radius: 160, color: '#ff3fa4', intensity: 0.5, slots: ['abend', 'nacht'] },
    { at: [890, 80], radius: 200, color: '#3ef2ff', intensity: 0.8, slots: ['abend', 'nacht'] },
    { at: [890, 330], radius: 160, color: '#3ef2ff', intensity: 0.4, slots: ['abend', 'nacht'] },
    { at: [65, 220], radius: 150, color: '#3ef2ff', intensity: 0.7, slots: ['abend', 'nacht'] },
    { at: [130, 420], radius: 130, color: '#ffd35a', intensity: 0.7, slots: ['abend', 'nacht'] },
    { at: [30, 340], radius: 90, color: '#ff3fa4', intensity: 0.6, slots: ['abend', 'nacht'] },
    { at: [1440, 300], radius: 170, color: '#ffb347', intensity: 0.7, slots: ['abend', 'nacht'] },
    { at: [1250, 30], radius: 190, color: '#ffcf7a', intensity: 0.7, slots: ['abend', 'nacht'] },
    { at: [995, 800], radius: 170, color: '#ffae42', intensity: 0.7, slots: ['abend', 'nacht'] },
    { at: [1360, 860], radius: 130, color: '#3ef2ff', intensity: 0.6, slots: ['abend', 'nacht'] },
    { at: [240, 830], radius: 120, color: '#ff3fd0', intensity: 0.6, slots: ['abend', 'nacht'] },
    { at: [345, 910], radius: 90, color: '#ffae42', intensity: 0.6, slots: ['abend', 'nacht'] },
    { at: [660, 30], radius: 90, color: '#3ef2ff', intensity: 0.5, slots: ['abend', 'nacht'] },
    { at: [1110, 320], radius: 90, color: '#ff5fd0', intensity: 0.4, slots: ['nacht'] },
  ],
  ambient: {
    count: 8,
    sprites: [
      'passant-punk-walk', 'passant-arbeiterin-walk', 'passant-kurier-walk', 'passant-oma-walk', 'passant-anzug-walk',
      'passant-tourist-walk', 'passant-strassenhaendler-walk', 'passant-schrotti-walk',
    ],
    bySlot: { morgen: 4, tag: 10, abend: 9, nacht: 5 },
    routes: [
      [[240, 400], [760, 420], [1300, 500], [1490, 515]],
      [[620, 990], [620, 700], [880, 560], [890, 300]],
      [[1490, 515], [1000, 620], [500, 600], [250, 450]],
      [[300, 650], [700, 500], [1100, 480]],
      [[880, 320], [700, 380], [470, 380], [300, 340]],
      [[1400, 680], [1100, 650], [700, 700], [560, 900]],
    ],
    barks: [
      { text: 'Wer hat schon wieder die Laterne geklaut? Die war festgeschraubt!' },
      { text: 'Mutter Brühe sagt, heute gibt’s Suppe. Gestern gab’s auch Suppe.' },
      { text: 'Die Rostzähne haben gestern meinen Schatten erpresst.' },
      { text: 'Spielt jemand Eins? Ich hab nur noch Plus-Vier-Karten.' },
      { text: 'Jemand hat 40 Gummienten bestellt? Die Drohne hat sie bei mir abgeworfen. Alle. Auf den Kopf.' },
      { text: 'Oma Volt hat eben mit einer Taube geschimpft. Die Taube hat sich entschuldigt.' },
      { text: 'Kaffee. Kaffee. Wer hat den Morgen erfunden? Ich will seine Adresse.', when: { time: 'morgen' } },
      { text: 'Heute Abend High Voltage? Ich hab mein Glitzerhemd an. Es ist auch mein Arbeitshemd.', when: { time: 'abend' } },
      { text: 'Bruno hat mich wieder nicht reingelassen. Er sagt, mein Stil hat Hausverbot.', when: { time: ['abend', 'nacht'] } },
      { text: 'Psst. Die zwei da oben auf dem Dach. Die knutschen nicht, die streiten. Glaub ich. Schwer zu sagen.', when: { all: [V, { flag: 'aria_romanze_zusammen' }, { time: 'nacht' }] } },
      { text: 'Ist das nicht die Postbotin? Die mit dem Ratenarm? Ich hab ein Paket für dich, Süße. Ach nee, umgekehrt.', when: V },
      { text: 'Mein Nachbar sagt jetzt immer „Ja, Master“. Früher hat er nur gegrunzt.', when: { act: 2 } },
      { text: 'Chrome 10 hier, Chrome 10 da. Ich will einfach nur meine Nougatbombe.', when: { act: 2 } },
      { text: 'Hunters Leute waren hier. Jetzt ist alles ruhiger. Und lauter.', when: { act: 2 } },
    ],
  },
  station: 'station-neon-gasse',
  ambience: 'unterstadt',
  onEnter: [
    {
      id: 'neon-gasse-erstbesuch', once: true,
      effects: [
        { markSeen: 'neon-gasse-betreten' },
        { message: 'Neon-Gasse. Pfützen voller Pink, Kabel über dem Kopf, Bass aus dem High Voltage. Hier lebt die Unterstadt – laut, nass und pleite.' },
      ],
    },
    {
      id: 'neon-gasse-vex', once: true, when: V,
      effects: [{ message: 'Vex kennt hier jede Pfütze beim Vornamen. Und jedes Dach. Eins davon meidet sie.' }],
    },
  ],
};

export const part: ContentPart = {
  maps: { 'neon-gasse': gasse },
  dialogues: { 'ng-samtkordel': samtkordel },
  districts: {
    unterstadt: { id: 'unterstadt', name: 'Unterstadt', ambience: 'unterstadt', music: { day: 'unterstadt-tag', night: 'unterstadt-nacht' } },
  },
  stations: {
    'station-neon-gasse': { id: 'station-neon-gasse', name: 'Neon-Gasse', map: 'neon-gasse', entry: 'station', cityPos: [0.36, 0.62] },
  },
};
