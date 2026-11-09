// Zone Rohrsiedlung (world.md §3.5, Plan design/plan/act1.json maps.rohrsiedlung, Paket pkg-rohrsiedlung).
// Siedlung aus gestapelten Riesenrohren: Wasserturm mit dem Nest (Tankdach als Dialogszene, Aussichtspunkt),
// Suppenküche, Rohrschacht zum Kanal, U-Bahn-Station Rohrbogen. Keine festen Kämpfe; Ratten am Schacht kommen
// aus der Zufallstabelle (parts/combat/random.ts). Legt station-rohrbogen an.
import type { Condition, DialogueDef, DialogueLine, HotspotDef, MapDef, Polygon, StationDef } from '../../../modules/contracts';
import type { ContentPart } from '../../part';

const n = (text: string): DialogueLine => ({ speaker: 'narrator', text });
const ich = (text: string, expr?: DialogueLine['expr']): DialogueLine => ({ speaker: 'player', text, ...(expr ? { expr } : {}) });

const V: Condition = { playerIs: 'vex' };
const ACT2: Condition = { act: 2 };
const NUR_AKT1: Condition = { not: ACT2 };
/** Die Kinder lassen dich rein bzw. ihre Leiter runter (world.md §3.5, §3.9). */
const KINDER_2: Condition = { any: [{ hearts: 'daria', min: 2 }, { hearts: 'freya', min: 2 }, { hearts: 'jakko', min: 2 }] };
const NEST_OFFEN: Condition = { any: [KINDER_2, { quest: 'side-zehn-credits', state: 'done' }] };
/** Gleiche Bedingung wie auf der Lötgassen-Seite (parts/maps/loetgassen.ts). */
const WAESCHEHOF_OFFEN: Condition = { any: [{ dayAtLeast: 2 }, { flag: 'waeschehof_offen' }, { origin: 'gosse' }] };
const SUPPE_OFFEN: Condition = { time: ['morgen', 'tag', 'abend'] };

function loot(id: string, at: readonly [number, number], label: string, text: string, extra: Partial<HotspotDef> = {}): HotspotDef {
  return {
    id, at, label, kind: 'loot', once: true, radius: 48,
    lines: [n(text)],
    effects: [{ give: id }, { setFlag: `gefunden_${id}` }],
    hideWhen: { flag: `gefunden_${id}` },
    ...extra,
  };
}

// ---------------------------------------------------------------------------------------------------- Geometrie
// Koordinaten in Kartenpixeln am fertigen Bild (game/public/assets/bg/rohrsiedlung.webp, 1536×1024).

const HOF: Polygon = [
  [0, 548], [130, 550], [200, 578], [292, 548], [300, 458], [402, 458], [412, 478], [496, 470], [530, 382],
  [990, 382], [998, 250], [1010, 0], [1140, 0], [1136, 180], [1078, 250], [1068, 496], [1496, 496],
  [1494, 600], [1466, 640], [1446, 760], [1432, 868], [1382, 932], [1380, 1024], [482, 1024], [482, 952], [470, 878],
  [386, 860], [380, 762], [330, 690], [300, 668], [150, 662], [60, 690], [0, 690],
];

const rohrsiedlung: MapDef = {
  id: 'rohrsiedlung',
  name: 'Rohrsiedlung',
  subtitle: 'Unterstadt',
  size: [1536, 1024],
  district: 'unterstadt',
  lighting: 'outdoor',
  bg: 'bg-rohrsiedlung',
  walk: [HOF],
  block: [
    // Bänke vor der Suppenküche
    [[1074, 470], [1250, 470], [1250, 580], [1074, 580]],
    [[1290, 494], [1446, 494], [1446, 548], [1420, 548], [1420, 592], [1286, 592]],
    // Rohrschacht mit Gitterdeckel
    [[1142, 812], [1290, 762], [1422, 762], [1422, 860], [1362, 946], [1150, 946]],
    // Tonne links neben der Suppenküche
    [[1028, 398], [1068, 398], [1068, 458], [1028, 458]],
  ],
  foreground: [
    { rect: [205, 330, 75, 190], baseY: 520 },
    { rect: [405, 330, 75, 132], baseY: 462 },
  ],
  exits: [
    { id: 'nach-schrottmarkt', rect: [1010, 0, 130, 26], to: 'schrottmarkt', entry: 'von-rohrsiedlung', label: 'Zum Schrottmarkt' },
    {
      id: 'nach-loetgassen', rect: [0, 552, 26, 134], to: 'loetgassen', entry: 'von-rohrsiedlung',
      label: 'Wäschehof-Durchgang zu den Lötgassen', when: WAESCHEHOF_OFFEN,
      lockedText: 'Wäscheleinen voller Overalls, dahinter ein Typ mit Rohrzange: „Morgen vielleicht, Frischling. Heute wird hier getrocknet.“',
    },
    {
      id: 'nach-das-nest', rect: [326, 420, 72, 66], to: 'das-nest', entry: 'von-rohrsiedlung', label: 'Das Nest (Wasserturm)',
      interact: true, when: NEST_OFFEN, minutes: 2,
      lockedText: 'Daria von oben: „Passwort?“ – „Ich hab keins.“ – „Dann nicht. Tschüss.“',
    },
    {
      id: 'nach-suppenkueche', rect: [1418, 418, 62, 82], to: 'suppenkueche', entry: 'von-rohrsiedlung', label: 'Suppenküche',
      interact: true, when: SUPPE_OFFEN, minutes: 2,
      lockedText: 'Der Kessel ist kalt. Mutter Brühe schläft. Wer sie weckt, kriegt Suppe ins Gesicht.',
    },
    { id: 'rohrschacht', rect: [1104, 786, 56, 72], to: 'kanal-sammler', entry: 'von-rohrsiedlung', label: 'Rohrschacht zum Kanal', interact: true },
  ],
  entries: {
    'von-schrottmarkt': { at: [1074, 70], facing: 's' },
    'von-loetgassen': { at: [70, 610], facing: 'e' },
    'von-das-nest': { at: [362, 500], facing: 's' },
    'von-suppenkueche': { at: [1472, 530], facing: 's' },
    'von-kanal-sammler': { at: [1060, 812], facing: 'w' },
    station: { at: [520, 808], facing: 'e' },
    taxi: { at: [760, 960], facing: 'n' },
  },
  spots: {
    wasserturm: { at: [330, 506], facing: 'n' },
    'kinder-leiter': { at: [440, 492], facing: 'n' },
    'wasserturm-rohr': { at: [150, 620], facing: 'n' },
    // Das Tankdach selbst ist eine Dialogszene; der Spot liegt am Turmfuß unter der Leiter (begehbar).
    'wasserturm-dach': { at: [310, 500], facing: 'n' },
    'suppenkueche-tuer': { at: [1472, 566], facing: 'n' },
    haengebruecke: { at: [720, 420], facing: 's' },
    rohrschacht: { at: [1040, 780], facing: 'e' },
    'rohrbogen-station': { at: [470, 800], facing: 'w' },
    'quantum-streife': { at: [760, 720], facing: 's' },
    'auftrag-a': { at: [880, 560], facing: 's' },
    // Zusätzlich
    'baenke': { at: [1266, 640], facing: 'n' },
    'hof-mitte': { at: [700, 640], facing: 's' },
  },
  hotspots: [
    // --- Wasserturm, Nest und Aussichtspunkt
    {
      id: 'wasserturm', at: [250, 566], radius: 56, label: 'Wasserturm mit Kinderzeichnungen', kind: 'look',
      lines: [
        n('Ein alter Wasserturm auf rostigen Stelzen, der Tank vollgemalt mit Kreide: eine Sonne, eine Rakete, eine Katze mit sechs Beinen. Oben hängen zwei Planen wie Piratensegel.'),
        n('An der Tür steht in Kinderschrift: „PRIWAT. ERWAKSENE NUR MIT PASWORT. RIPPER NIE.“'),
      ],
    },
    {
      id: 'aussicht-wasserturm', at: [444, 470], radius: 56, label: 'Strickleiter zum Aussichtspunkt hochklettern', kind: 'use', when: KINDER_2,
      lines: [n('Von oben fällt eine Strickleiter vor deine Füße. Jemand kichert. „Aber nicht auf die dritte Sprosse, die ist eine Falle!“')],
      effects: [{ advanceTime: 10 }], dialogue: 'dlg-rohrsiedlung-turmdach',
    },
    {
      id: 'wasserturm-rohr', at: [150, 606], radius: 50, label: 'Am Rohr zum Wasserturm hochklettern', kind: 'check', check: 'gc-146',
      lines: [n('Ein dickes Zulaufrohr zieht sich an der Wand hoch bis zum Tankdach. Glitschig, voller Nieten, perfekt für Leute mit Armen aus Stahl oder sehr wenig Selbsterhaltungstrieb.')],
      effects: [{ advanceTime: 10 }], dialogue: 'dlg-rohrsiedlung-turmdach',
      altText: 'Du rutschst nach einem Meter ab und landest auf dem Hintern. Mit mehr Körper ginge es – oder du freundest dich mit den Kindern an, dann lassen sie dir ihre Strickleiter runter.',
    },
    // --- Hof, Rohre, Hängebrücken
    {
      id: 'haengebruecken', at: [720, 400], radius: 70, label: 'Hängebrücken zwischen den Rohren', kind: 'look',
      lines: [
        n('Zwischen den Rohren schwingen Brücken aus Seil, Brettern und Hoffnung. Wenn sie quietschen, halten sie noch. Wenn sie still sind, lauf.'),
        n('In den Rohröffnungen hängen bunte Vorhänge. Hinter einem streiten zwei Leute darüber, wessen Rohr das eigentlich ist.'),
      ],
    },
    {
      id: 'rohrwohnungen', at: [570, 404], radius: 56, label: 'Rohrwohnung mit Vorhang', kind: 'look',
      lines: [
        n('Ein Rohr mit türkisem Vorhang, Teppich und einem Stuhl, der aussieht, als hätte er drei Kriege überlebt. Auf einem Pappschild: „Zimmer frei. Mit Echo.“'),
        n('Von drinnen brüllt jemand: „Glotz woanders hin, du Spanner! Das hier ist ein Zuhause, kein Aquarium!“'),
      ],
    },
    {
      id: 'kreidezeichnungen', at: [1050, 920], radius: 48, label: 'Kreidezeichnungen auf dem Boden', kind: 'look',
      lines: [n('Eine Rakete, eine Sonne, ein Stern – mit Leuchtkreide auf den Beton gemalt. Daneben ein Pfeil zum Schacht und die Warnung: „NICHT REIN. RATTEN BEISSEN. AUSER JAKKO.“')],
    },
    {
      id: 'suppenkueche-fenster', at: [1266, 498], radius: 40, label: 'Durchreiche der Suppenküche', kind: 'look',
      lines: [n('Hinter der Durchreiche dampft ein Kessel, groß genug, um darin zu baden. Auf dem Schild darüber nur eine gemalte Schüssel. Mehr Werbung braucht Mutter Brühe nicht.')],
    },
    {
      id: 'ubahn-zugang', at: [420, 818], radius: 96, label: 'U-Bahn Rohrbogen', kind: 'use',
      lines: [n('Eine Treppe führt in ein halb vergrabenes Riesenrohr hinunter. Das Stationsschild leuchtet cyan, irgendwer hat einen Schnurrbart auf das U-Bahn-Logo gesprüht. Mit der Stadtkarte (M) fährst du von hier zu jeder freigeschalteten Station.')],
      effects: [{ unlockStation: 'station-rohrbogen' }],
    },
    {
      id: 'waeschehof-typ', at: [52, 604], radius: 56, label: 'Mit dem Wäsche-Typen reden', kind: 'talk',
      when: { not: WAESCHEHOF_OFFEN }, dialogue: 'dlg-loetgassen-waeschehof',
    },
    {
      id: 'waeschehof-leinen', at: [52, 604], radius: 56, label: 'Wäscheleinen', kind: 'look', when: WAESCHEHOF_OFFEN,
      lines: [n('Overalls, Bettlaken und eine Unterhose mit Totenköpfen. Der Wäsche-Typ hat sie heute rausgehängt wie eine Kriegsflagge.')],
    },
    // --- Sammelobjekte (world.md §3.5 Rohrsiedlung)
    loot('glueckstern-05', [870, 392], 'Glücksstern hinter der Kiste', 'Hinter einer Holzkiste unter den Rohren klemmt ein ausgeschnittener Blechstern. Jemand hat „MEINS“ draufgekratzt. Jetzt ist er deiner. So ist das Leben.'),
    loot('neon-tag-04', [1436, 800], 'Neon-Tag am Rohr', 'Am Rohr neben der pinken Leuchtröhre prangt ein frisches Graffiti: ein Wasserturm mit Kindergesicht. Sina Spray war hier. Du fotografierst es – zählt als gefunden.'),
    loot('jimmy-spur-02', [488, 930], 'Ölfass-Türmchen', 'Drei Ölfässer übereinandergestapelt, ganz oben ein Kronkorken, sorgfältig ausgerichtet. Wer baut so was? Jemand mit sehr viel Zeit. Und sehr ruhigen Händen.'),
  ],
  lights: [
    { at: [355, 292], radius: 90, color: '#ffc861', intensity: 0.9, slots: ['abend', 'nacht'] },
    { at: [60, 440], radius: 90, color: '#ffb347', intensity: 0.7, slots: ['abend', 'nacht'] },
    { at: [40, 90], radius: 120, color: '#ff3fa4', intensity: 0.7, slots: ['abend', 'nacht'] },
    { at: [20, 620], radius: 100, color: '#ff3fa4', intensity: 0.6, slots: ['abend', 'nacht'] },
    { at: [578, 250], radius: 90, color: '#ffc861', intensity: 0.8, slots: ['abend', 'nacht'] },
    { at: [752, 240], radius: 90, color: '#ffc861', intensity: 0.8, slots: ['abend', 'nacht'] },
    { at: [928, 240], radius: 90, color: '#ffc861', intensity: 0.8, slots: ['abend', 'nacht'] },
    { at: [995, 200], radius: 70, color: '#ffc861', intensity: 0.6, slots: ['abend', 'nacht'] },
    { at: [1110, 20], radius: 130, color: '#ff6ec7', intensity: 0.6, slots: ['abend', 'nacht'] },
    { at: [1260, 400], radius: 150, color: '#ff9a3c', intensity: 0.9, slots: ['morgen', 'tag', 'abend'] },
    { at: [1450, 340], radius: 80, color: '#ffc861', intensity: 0.8, slots: ['abend', 'nacht'] },
    { at: [212, 790], radius: 160, color: '#3ef2ff', intensity: 0.9, slots: ['abend', 'nacht'] },
    { at: [1250, 890], radius: 110, color: '#52ff8a', intensity: 0.7, slots: ['abend', 'nacht'] },
    { at: [1480, 880], radius: 110, color: '#ff3fa4', intensity: 0.7, slots: ['abend', 'nacht'] },
  ],
  ambient: {
    count: 8,
    bySlot: { morgen: 5, tag: 9, abend: 8, nacht: 3 },
    sprites: [
      'passant-arbeiterin-walk', 'passant-oma-walk', 'passant-strassenhaendler-walk', 'passant-kanalvolk-walk',
      'passant-schrotti-walk', 'passant-punk-walk',
    ],
    routes: [
      [[140, 600], [600, 560], [980, 430], [1070, 120]],
      [[1100, 640], [1400, 660], [1360, 780], [900, 800], [600, 900]],
      [[520, 900], [760, 700], [1000, 600], [1060, 520]],
      [[300, 520], [700, 450], [960, 420], [700, 600], [300, 600]],
      [[1074, 40], [1030, 300], [800, 620], [560, 940]],
      [[1200, 620], [1440, 560], [1420, 720], [1100, 720], [1200, 620]],
    ],
    barks: [
      { text: 'Wer hat schon wieder die Laterne geklaut? Die war festgeschraubt!', when: NUR_AKT1 },
      { text: 'Mutter Brühe sagt, heute gibt’s Suppe. Gestern gab’s auch Suppe.' },
      { text: 'Die Rostzähne haben gestern meinen Schatten erpresst.', when: NUR_AKT1 },
      { text: 'Spielt jemand Eins? Ich hab nur noch Plus-Vier-Karten.', when: NUR_AKT1 },
      { text: 'Mein Rohr hat jetzt einen Vorhang. Und einen Nachbarn. Den Nachbarn wollte ich nicht.' },
      { text: 'Wenn die Hängebrücke quietscht, hält sie noch. Wenn sie still ist, lauf, verdammt!' },
      { text: 'Die Kinder im Wasserturm haben mir ein Passwort verkauft. Zehn Credits. Es war „Passwort“.' },
      { text: 'Verpiss dich aus meinem Rohr, du Schimmelpilz! Ach, du bist nur Kundschaft? Dann rein.' },
      { text: 'Der Scheißschacht stinkt heute wieder nach Kanalgott und alten Socken.' },
      { text: 'Erst Kaffee, dann Leiter. Andersrum hat’s letztes Mal geblutet.', when: { time: 'morgen' } },
      { text: 'Schlange vor der Suppenküche! Wer drängelt, kriegt die Kelle!', when: { time: ['morgen', 'tag'] } },
      { text: 'Babette bringt den Kindern wieder Dampfnudeln. Ich will auch Kind sein.', when: { time: 'abend' } },
      { text: 'Psst. Nachts gehört der Schacht den Ratten. Und die zahlen keine Miete.', when: { time: 'nacht' } },
      { text: 'Licht aus im Wasserturm. Gut. Wer die Kinder weckt, kriegt’s mit mir zu tun.', when: { time: 'nacht' } },
      { text: 'Na, Kurierin? Lieferst du jetzt auch in Rohre? Ich hab da ’ne Bestellung …', when: V },
      { text: 'Mein Nachbar sagt jetzt immer „Ja, Master“. Früher hat er nur gegrunzt.', when: ACT2 },
      { text: 'Chrome 10 hier, Chrome 10 da. Ich will einfach nur meine Nougatbombe.', when: ACT2 },
      { text: 'Hunters Leute waren hier. Jetzt ist alles ruhiger. Und lauter.', when: ACT2 },
      { text: 'Quantum-Streife! Alle Vorhänge zu, und keiner sagt „Master“!', when: { all: [ACT2, { time: 'nacht' }] } },
    ],
  },
  station: 'station-rohrbogen',
  ambience: 'unterstadt',
  onEnter: [
    { id: 'rohrsiedlung-erstbesuch', once: true, when: { not: V }, dialogue: 'dlg-rohrsiedlung-ankunft', effects: [{ markSeen: 'rohrsiedlung-erstbesuch' }] },
    { id: 'rohrsiedlung-erstbesuch-vex', once: true, when: V, dialogue: 'dlg-rohrsiedlung-ankunft-vex', effects: [{ markSeen: 'rohrsiedlung-erstbesuch' }] },
  ],
};

const ankunft: DialogueDef = {
  id: 'dlg-rohrsiedlung-ankunft',
  start: 'start',
  nodes: [{
    id: 'start',
    lines: [
      n('Die Rohrsiedlung: Riesenrohre, übereinandergestapelt wie Brennholz eines Riesen, in jedem eine Familie, ein Vorhang und eine Meinung. Es riecht nach Suppe, Rost und nassem Beton.'),
      n('Links ein Wasserturm voller Kreidezeichnungen, rechts dampft ein Kessel. Unten im Schacht murmelt der Kanal. Niemand hier ist reich. Alle hier sind laut.'),
    ],
  }],
};

const ankunftVex: DialogueDef = {
  id: 'dlg-rohrsiedlung-ankunft-vex',
  start: 'start',
  nodes: [{
    id: 'start',
    lines: [
      n('Die Rohrsiedlung. Vex kennt jede Leiter hier vom Ausliefern: dritte Hängebrücke nur mit leichtem Paket, Wasserturm nur mit Passwort, Suppenküche nur mit Hunger.'),
      ich('Riecht nach Brühe und Rost. Also nach Zuhause, nur ohne Miete.', 'neutral'),
    ],
  }],
};

/** Tankdach des Wasserturms (Aussichtspunkt, glueckstern-06, undichte Stelle). Erreichbar über Kinderleiter oder gc-146. */
const turmdach: DialogueDef = {
  id: 'dlg-rohrsiedlung-turmdach',
  start: 'start',
  nodes: [
    {
      id: 'start',
      lines: [n('Oben auf dem Tankdach. Wind, zwei Planen wie Piratensegel, ein Geländer, dem man besser nicht vertraut. Unter dir summt die Rohrsiedlung.')],
      choices: [
        {
          text: 'Die Aussicht genießen.', when: { not: { seen: 'aussicht-rohrsiedlung' } }, next: 'aussicht',
          effects: [{ xp: 20 }, { markSeen: 'aussicht-rohrsiedlung' }, { message: 'Aussichtspunkt entdeckt: Rohrsiedlung (+20 XP).' }],
        },
        { text: 'Noch mal runtergucken.', when: { seen: 'aussicht-rohrsiedlung' }, next: 'aussicht-wieder' },
        {
          text: 'Den Blechstern am Geländer abmachen.', when: { not: { flag: 'gefunden_glueckstern-06' } }, next: 'stern',
          effects: [{ give: 'glueckstern-06' }, { setFlag: 'gefunden_glueckstern-06' }],
        },
        {
          text: 'Die rostige Ecke ansehen.', next: 'loch',
          when: { not: { quest: 'pers-kinder-wasserturm', state: 'done' } },
        },
        {
          text: 'Das geflickte Dach bewundern.', next: 'geflickt',
          when: { quest: 'pers-kinder-wasserturm', state: 'done' },
        },
        { text: 'Wieder runterklettern.', next: 'runter' },
      ],
    },
    {
      id: 'aussicht',
      lines: [
        n('Von hier oben sieht die Rohrsiedlung aus wie ein umgekippter Orgelpfeifen-Haufen, in dem jemand wohnt. Hinter jedem Vorhang brennt Licht, über die Hängebrücke balanciert eine Oma mit einem Topf Suppe.'),
        n('Im Norden leuchten die Laternen vom Schrottmarkt, westlich flattern die Overalls im Wäschehof. Aus dem Rohrschacht steigt grüner Dampf. Irgendwo da unten singt eine Ratte. Oder ein Rohr. Schwer zu sagen.'),
      ],
      next: 'start',
    },
    {
      id: 'aussicht-wieder',
      lines: [n('Der Wind riecht nach Suppe, Rost und Regen. Die Unterstadt sieht von oben fast friedlich aus. Fast. Unten brüllt jemand: „WER HAT MEIN ROHR ABGESCHLOSSEN?!“')],
      next: 'start',
    },
    {
      id: 'stern',
      lines: [n('Am Geländer baumelt ein ausgeschnittener Blechstern an einer Schnur. Die Kinder haben ihn hier oben „für Notfälle“ versteckt. Jetzt ist er deiner. Notfall ist Ansichtssache.')],
      next: 'start',
    },
    {
      id: 'loch',
      lines: [
        n('Eine Ecke des Dachs ist durchgerostet, ein Loch so groß wie ein Teller. Darunter, im Nest, steht garantiert ein Eimer. Daneben mit Kreide: „REPARIREN!!! (irgentwann)“.'),
        ich('Blech, Dichtmasse, ein bisschen Ahnung. Oder Opa Gustav. Merk ich mir.', 'besorgt'),
      ],
      next: 'start',
    },
    {
      id: 'geflickt',
      lines: [n('Wo das Loch war, glänzt jetzt ein Flicken aus Blech, festgenietet und mit drei Unterschriften in Kreide verziert. Und deiner, etwas schief. Kein Tropfen kommt mehr durch.')],
      next: 'start',
    },
    {
      id: 'runter',
      lines: [n('Du kletterst wieder runter. Unten applaudiert niemand. Aber eine Katze schaut kurz beeindruckt.')],
    },
  ],
};

const station: StationDef = {
  id: 'station-rohrbogen', name: 'Rohrbogen', map: 'rohrsiedlung', entry: 'station', cityPos: [0.48, 0.78],
};

export const part: ContentPart = {
  maps: { rohrsiedlung },
  stations: { [station.id]: station },
  dialogues: {
    [ankunft.id]: ankunft,
    [ankunftVex.id]: ankunftVex,
    [turmdach.id]: turmdach,
  },
};
