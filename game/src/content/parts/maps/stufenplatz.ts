// Zone Stufenplatz (Mittelring, Akt 1) – Paket pkg-stufenplatz-digitech.
// Bild: game/public/assets/bg/stufenplatz.webp (Roh: output/imagegen/raw/maps/stufenplatz.png), Geometrie am Bild nachgezogen.
// Legt außerdem die Bezirke mittelring und oberstadt sowie station-stufenplatz an (design/plan/act1.json districts/stations).
//
// Drehkreuz und Bauzaun: Die Engine verlangt bei Ausgängen when UND check. world.md will „Gegenstand/Auftrag ODER Check“.
// Deshalb: Ausgang mit when (alle Wege ohne Wert) + Check-Hotspot direkt davor (gc-106/gc-107), der selbst reist.
import type { Condition, DialogueDef, HotspotDef, MapDef } from '../../../modules/contracts';
import type { ContentPart } from '../../part';

const act1Only: Condition = { not: { act: 2 } };
const act2: Condition = { act: 2 };

/** Drehkreuz ohne Check passierbar (world.md §3.2). */
export const DREHKREUZ_OFFEN: Condition = {
  any: [
    act2,
    { item: 'outfit-ordentlich' },
    { item: 'presseausweis' },
    { origin: 'origin-oberstadt' },
    { flag: 'drehkreuz_passiert' },
    { seen: 'check:gc-106' },
  ],
};

/** Bauzaun ohne Check passierbar: act2, ein Digitech-Auftrag oder schon einmal drübergeklettert. */
export const BAUZAUN_OFFEN: Condition = {
  any: [
    act2,
    { quest: 'side-eingehendes-fax', state: ['active', 'done'] },
    { quest: 'side-digitech-geist', state: ['active', 'done'] },
    { quest: 'prep-grundriss', state: ['active', 'done'] },
    { flag: 'bauzaun_offen' },
    { seen: 'check:gc-107' },
  ],
};

const liveSendung: Condition = {
  all: [{ weekday: ['mo', 'mi', 'fr'] }, { clockBetween: [720, 780] }],
};

const loot = (id: string, at: readonly [number, number], label: string, text: string, radius = 48): HotspotDef => ({
  id, at, radius, label, kind: 'loot', once: true,
  lines: [{ speaker: 'narrator', text }],
  effects: [{ give: id }],
});

const hotspots: HotspotDef[] = [
  {
    id: 'brezel-imbiss', at: [1185, 760], radius: 72, label: 'Brezel-Imbiss', kind: 'shop', shop: 'imbisswagen-stufenplatz',
    lines: [{ speaker: 'narrator', text: 'Auf dem Dach dreht sich eine Brezel so groß wie ein Autoreifen. Riecht nach Salz, Fett und Versprechen.' }],
  },
  {
    id: 'salon-gina', at: [205, 560], radius: 64, label: 'Salon Gina', kind: 'shop', shop: 'salon-gina',
    when: { time: ['tag', 'abend'] },
  },
  {
    id: 'salon-gina-zu', at: [205, 560], radius: 64, label: 'Salon Gina (geschlossen)', kind: 'look',
    when: { time: ['morgen', 'nacht'] },
    lines: [{ speaker: 'narrator', text: 'Ein Schild an der Tür: „Bin bei einem Haarnotfall.“ Darunter, kleiner: „Es ist immer ein Haarnotfall.“' }],
  },
  {
    id: 'drehkreuz', at: [812, 228], radius: 60, label: 'Drehkreuz: vorsprechen', kind: 'check', check: 'gc-106',
    hideWhen: DREHKREUZ_OFFEN,
    lines: [{ speaker: 'narrator', text: 'Drei Chromsäulen mit Lämpchen. Das mittlere scannt dich von den Schuhen aufwärts und wird dabei immer enttäuschter.' }],
    altText: 'Ordentliche Klamotten von Gina, ein Presseausweis oder der Lieferanteneingang der Feinkost (rechts, immer offen) gehen auch.',
    effects: [
      { message: 'Das Drehkreuz seufzt elektronisch und lässt dich durch. „Willkommen, äh … Kundschaft.“' },
      { setFlag: 'drehkreuz_passiert' },
      { unlockStation: 'station-glasarkaden' },
      { travel: 'glasarkaden', entry: 'von-stufenplatz' },
    ],
  },
  {
    id: 'bauzaun', at: [1470, 760], radius: 72, label: 'Bauzaun: rüberklettern', kind: 'check', check: 'gc-107',
    hideWhen: BAUZAUN_OFFEN,
    lines: [
      { speaker: 'narrator', text: 'Bauzaun, Plakat „Bald hier: Quantum Park“. Oben Stacheldraht, unten ein Wachroboter, der so tut, als würde er schlafen.' },
      { speaker: 'narrator', text: 'Er schnarcht in perfekt gleichmäßigen Abständen. Niemand schnarcht so gleichmäßig.' },
    ],
    altText: 'Mit einem Digitech-Auftrag zeigt dir jemand die Lücke im Zaun: Dantes Fax, Ravens alter Fall oder der Laborgrundriss.',
    effects: [
      { message: 'Rauf, rüber, Jacke nur ein bisschen zerrissen. Der Wachroboter schnarcht weiter. Profi.' },
      { setFlag: 'bauzaun_offen' },
      { travel: 'digitech-areal', entry: 'von-stufenplatz' },
    ],
  },
  {
    id: 'bauzaun-plakat', at: [1304, 590], radius: 64, label: 'Plakatwand', kind: 'look',
    lines: [
      { speaker: 'narrator', text: 'Ein gemalter Park, Kirschblüten, lachende Familien mit perfekten Zähnen. „Quantum Park – Natur, wie sie sein sollte.“' },
      { speaker: 'narrator', text: 'Jemand hat einer der lachenden Mütter einen Schnurrbart gesprüht. Er steht ihr ausgezeichnet.' },
    ],
  },
  {
    id: 'aussicht-bruecke', at: [1478, 138], radius: 64, label: 'Aussichtspunkt: Fernrohr', kind: 'look',
    hideWhen: { seen: 'aussicht-bruecke' },
    lines: [
      { speaker: 'narrator', text: 'Du wirfst eine Münze ins Fernrohr. Es frisst sie und zeigt dir trotzdem was: den Quantum-Campus, weiß und glatt wie ein Zahnarztlächeln.' },
      { speaker: 'narrator', text: 'Streifen mit Drohnen, Lieferwagen, ein Rasen, der gestaubsaugt wird. Unten die Unterstadt, die zurückstarrt. Jetzt kennst du den Platz von oben.' },
    ],
    effects: [{ markSeen: 'aussicht-bruecke' }, { xp: 20 }, { message: 'Aussichtspunkt entdeckt: Stufenplatz' }],
  },
  {
    id: 'aussicht-bruecke-blick', at: [1478, 138], radius: 64, label: 'Fernrohr', kind: 'look',
    when: { seen: 'aussicht-bruecke' },
    lines: [{ speaker: 'narrator', text: 'Der Campus glänzt. Irgendwo da drin sitzt jemand und plant deinen Montag. Das Fernrohr frisst noch eine Münze, aus Prinzip.' }],
  },
  {
    id: 'buehne-winken', at: [760, 492], radius: 64, label: 'Live-Sendung: hinter Collin winken', kind: 'use',
    when: liveSendung,
    lines: [{ speaker: 'narrator', text: 'Rotes Licht am Kamerakran. Collin strahlt in die Linse, als hätte er sie erfunden. Hinter ihm ist noch Platz im Bild.' }],
    effects: [{
      minigame: 'akt-fernsehen', level: 2, key: 'fernsehen-stufenplatz', label: 'Hinter Collin winken',
      win: [
        { rep: 'nx1-medien', delta: 3 }, { xp: 25 },
        { message: 'Du bist live! Deine Mutter hätte es gesehen, wenn sie einen Fernseher hätte.' },
      ],
      lose: [{ message: 'Im Bild ist nur dein Ellbogen. Der Ellbogen bekommt Fanpost.' }],
    }],
  },
  {
    id: 'buehne', at: [800, 470], radius: 56, label: 'Bühne', kind: 'look',
    when: { not: liveSendung },
    lines: [
      { speaker: 'narrator', text: 'Die Bühne, auf der Collin Charleston montags, mittwochs und freitags um zwölf die Stadt erklärt. Auf dem Boden kleben Markierungen: „Collin hier“, „Collin auch hier“.' },
    ],
  },
  {
    id: 'kamerakran', at: [1075, 470], radius: 56, label: 'Kamerakran', kind: 'look',
    lines: [{ speaker: 'narrator', text: 'Auf dem Kranarm sitzen drei Tauben in Sendeposition. Das sind die einzigen hier mit Festvertrag.' }],
  },
  {
    id: 'prediger-kiste', at: [510, 500], radius: 52, label: 'Predigerkiste', kind: 'look',
    when: { not: { time: 'tag' } },
    lines: [{ speaker: 'narrator', text: 'Eine Holzkiste mit einem ausgeweideten Radio darauf. Ein Zettel: „Funkstille ist Gottesdienst. Bin um zehn wieder da. Nicht anrufen.“' }],
  },
  {
    id: 'ubahn-zugang', at: [270, 760], radius: 64, label: 'U-Bahn Stufenplatz', kind: 'use',
    lines: [{ speaker: 'narrator', text: 'Eine Treppe nach unten, Geländer in Cyan. Unten riecht es nach Bremsstaub und Brezel. Von hier fährst du zu jeder Station, die du kennst (Stadtkarte).' }],
    effects: [{ unlockStation: 'station-stufenplatz' }],
  },
  {
    id: 'nx1-schaufenster', at: [560, 300], radius: 52, label: 'NX-1-Schaufenster', kind: 'look',
    lines: [{ speaker: 'narrator', text: 'Hinter der Scheibe leuchten Studiolichter. Ein Pappaufsteller von Collin zeigt mit dem Finger auf dich. Er zeigt auf alle. Das ist sein Ding.' }],
  },
  {
    id: 'nx1-tuer-zu', at: [422, 300], radius: 56, label: 'NX-1-Studio (geschlossen)', kind: 'look',
    when: { time: 'nacht' },
    lines: [{ speaker: 'narrator', text: 'Glastür, Empfangsdrohne: „Sendeschluss. Kommen Sie morgen wieder. Mit Einschaltquote.“' }],
  },
  {
    id: 'kaffee-praktikantin', at: [470, 640], radius: 64, label: 'Praktikantin mit Kaffeetablett', kind: 'talk',
    when: { all: [{ time: ['morgen', 'tag'] }, { weekday: ['mo', 'di', 'mi', 'do', 'fr'] }] },
    hideWhen: { seen: 'kaffee-praktikantin-erledigt' },
    dialogue: 'stufenplatz-praktikantin',
  },
  {
    id: 'putzroboter', at: [222, 318], radius: 48, label: 'Reinigungsroboter', kind: 'look',
    lines: [
      { speaker: 'narrator', text: 'Ein Reinigungsroboter wischt die Stufen. Zum vierten Mal. Er piept dich an, als wärst du ein Fleck.' },
      { speaker: 'narrator', text: '„BITTE NICHT AUF DIE STUFEN SITZEN. SIE SIND FRISCH GEWISCHT. SIE SIND IMMER FRISCH GEWISCHT.“' },
    ],
  },
  {
    id: 'lieferhof-blick', at: [1210, 290], radius: 52, label: 'Lieferwagen', kind: 'look',
    lines: [{ speaker: 'narrator', text: 'Ein weißer Lieferwagen der Feinkost. Auf dem Beifahrersitz liegt ein Klemmbrett: „Butter, 40 Kilo. Edelbrause. Kaviar für den Hund.“' }],
  },
  {
    id: 'gruendertag-buffet', at: [700, 560], radius: 64, label: 'Gründertag-Buffet', kind: 'use',
    when: { cycleDay: 21 },
    once: true,
    lines: [
      { speaker: 'narrator', text: 'Quantum feiert sich selbst. Weiße Tischdecken, Häppchen in Firmenblau, ein Banner, auf dem Nexus lächelt wie ein Bildschirmschoner.' },
      { speaker: 'narrator', text: 'Du steckst dir eine Brezel ein. Niemand guckt. Alle gucken auf die Leinwand.' },
    ],
    effects: [{ give: 'brezel' }],
  },
  loot('datenwuerfel-07', [930, 420], 'Etwas glimmt hinter der Leinwand',
    'Hinter dem Leinwandgerüst, zwischen Kabelbindern und einem verlorenen Ohrring: ein Datenwürfel. Die Technik hat ihn wohl für ein Stück Bühne gehalten.'),
  loot('glueckstern-09', [1188, 530], 'Glitzern im Baumkübel',
    'In der Erde des Baumkübels steckt ein kleiner Stern aus Blech. Glück wächst hier offenbar auf Bäumen. Auf einem.'),
  loot('neon-tag-07', [1300, 470], 'Neon-Tag am Bauzaun',
    'Am Bauzaun, halb unter einem Plakat: ein leuchtendes Tag. Ein Brezel-Smiley mit Krone. Du fotografierst es für die Sammlung.'),
];

const stufenplatz: MapDef = {
  id: 'stufenplatz',
  name: 'Stufenplatz',
  subtitle: 'Mittelring',
  size: [1536, 1024],
  district: 'mittelring',
  lighting: 'outdoor',
  bg: 'bg-stufenplatz',
  ambience: 'oberstadt',
  station: 'station-stufenplatz',
  walk: [
    // Platz mit Amphitheater-Stufen, oberer Gehweg vor Studio/Arkaden/Feinkost, Treppe nach Süden, Westgasse unten links.
    [
      [140, 312], [640, 312], [652, 258], [738, 248], [742, 140], [884, 140], [888, 248], [960, 254], [1160, 262], [1290, 266],
      [1290, 560], [1536, 762], [1536, 896], [978, 896], [978, 1024], [584, 1024], [584, 896], [402, 896], [402, 772],
      [140, 772], [140, 896], [0, 896], [0, 782], [66, 782], [66, 626], [206, 626], [206, 382], [140, 382],
    ],
    // Fußgängerbrücke hinauf zum Aussichtspunkt
    [
      [1192, 352], [1240, 300], [1380, 196], [1396, 150], [1440, 112], [1526, 106], [1532, 160], [1480, 196], [1420, 218],
      [1300, 306], [1278, 352],
    ],
  ],
  block: [
    // Leinwandgerüst (Fußlinie) und Lautsprecher
    [[640, 300], [956, 300], [956, 444], [640, 444]],
    [[584, 386], [640, 386], [640, 468], [584, 468]],
    [[956, 386], [1008, 386], [1008, 472], [956, 472]],
    // Kamerakran-Fuß
    [[1036, 442], [1114, 442], [1114, 506], [1036, 506]],
    // Predigerkiste
    [[484, 458], [536, 458], [536, 510], [484, 510]],
    // Baumkübel
    [[326, 524], [404, 524], [404, 576], [326, 576]],
    [[1150, 526], [1226, 526], [1226, 578], [1150, 578]],
    // Laternen
    [[284, 462], [304, 462], [304, 482], [284, 482]],
    [[1166, 456], [1186, 456], [1186, 476], [1166, 476]],
    // Imbisswagen, Bistrotische, Pflanzkübel rechts
    [[1052, 682], [1290, 682], [1290, 772], [1052, 772]],
    [[990, 734], [1040, 734], [1040, 768], [990, 768]],
    [[1052, 790], [1104, 790], [1104, 826], [1052, 826]],
    [[1160, 790], [1214, 790], [1214, 826], [1160, 826]],
    [[1290, 690], [1374, 690], [1374, 776], [1290, 776]],
    // Mülleimer links, Pflanzen am Salon, Kehrroboter, Kübel am Studio
    [[40, 740], [82, 740], [82, 806], [40, 806]],
    [[232, 522], [262, 522], [262, 576], [232, 576]],
    [[190, 280], [262, 280], [262, 332], [190, 332]],
    [[530, 286], [572, 286], [572, 322], [530, 322]],
    // Klimakästen am Bauzaun
    [[1324, 584], [1376, 584], [1376, 656], [1324, 656]],
    [[1380, 638], [1426, 638], [1426, 706], [1380, 706]],
  ],
  foreground: [
    // Leinwand: Wer dahinter auf dem oberen Gehweg läuft, verschwindet hinter dem Bild.
    { rect: [636, 252, 324, 194], baseY: 444 },
    // Imbisswagen-Aufbau mit Riesenbrezel
    { rect: [1050, 606, 244, 90], baseY: 690 },
    // Baumkronen
    { rect: [318, 418, 92, 108], baseY: 528 },
    { rect: [1142, 424, 90, 106], baseY: 530 },
  ],
  exits: [
    {
      id: 'nach-bahnhof-mitte', rect: [600, 986, 362, 38], to: 'bahnhof-mitte', entry: 'von-stufenplatz',
      label: 'Große Treppe zum Bahnhof Mitte',
    },
    {
      id: 'nach-eisenhof', rect: [0, 786, 28, 106], to: 'eisenhof', entry: 'von-stufenplatz', label: 'Zum Eisenhof',
    },
    {
      id: 'drehkreuz', rect: [744, 140, 138, 42], to: 'glasarkaden', entry: 'von-stufenplatz', label: 'Drehkreuz: Glasarkaden',
      when: DREHKREUZ_OFFEN,
      lockedText: 'Das Drehkreuz piept beleidigt: „Zugang nur für Kundschaft mit Stil.“ Hinter dir lacht eine Taube. (Am Drehkreuz vorsprechen – oder hinten über den Lieferanteneingang.)',
    },
    {
      id: 'lieferanteneingang', rect: [1018, 208, 126, 60], to: 'glasarkaden', entry: 'lieferanteneingang',
      label: 'Lieferanteneingang Feinkost', interact: true,
    },
    {
      id: 'bauzaun', rect: [1506, 768, 30, 126], to: 'digitech-areal', entry: 'von-stufenplatz', label: 'Bauzaun: Digitech-Areal',
      when: BAUZAUN_OFFEN,
      lockedText: 'Bauzaun, Plakat „Bald hier: Quantum Park“. Oben Stacheldraht, unten ein Wachroboter, der so tut, als würde er schlafen.',
    },
    {
      id: 'nach-nx1-studio', rect: [352, 252, 140, 64], to: 'nx1-studio', entry: 'von-stufenplatz', label: 'NX-1-Studio',
      interact: true, when: { time: ['morgen', 'tag', 'abend'] },
      lockedText: 'Glastür, Empfangsdrohne: „Sendeschluss. Kommen Sie morgen wieder. Mit Einschaltquote.“',
    },
  ],
  entries: {
    'von-bahnhof-mitte': { at: [780, 944], facing: 'n' },
    'von-eisenhof': { at: [56, 840], facing: 'e' },
    'von-glasarkaden': { at: [812, 278], facing: 's' },
    lieferanteneingang: { at: [1082, 300], facing: 's' },
    'von-digitech-areal': { at: [1452, 842], facing: 'w' },
    'von-nx1-studio': { at: [422, 340], facing: 's' },
    station: { at: [270, 738], facing: 's' },
    taxi: { at: [700, 800], facing: 's' },
  },
  spots: {
    buehne: { at: [800, 482], facing: 's' },
    kamerakran: { at: [1078, 528], facing: 'w' },
    'stufen-oben': { at: [452, 470], facing: 's' },
    fussgaengerbruecke: { at: [1456, 152], facing: 'n' },
    'brezel-imbiss': { at: [1134, 798], facing: 'n' },
    'salon-gina': { at: [246, 604], facing: 'w' },
    'prediger-kiste': { at: [556, 492], facing: 's' },
    windkante: { at: [1252, 470], facing: 'e' },
    drehkreuz: { at: [812, 262], facing: 'n' },
    'lieferhof-tor': { at: [1082, 286], facing: 'n' },
    bauzaun: { at: [1452, 830], facing: 'e' },
    'nx1-eingang': { at: [422, 330], facing: 'n' },
    'station-treppe': { at: [270, 748], facing: 's' },
    'auftrag-a': { at: [640, 760], facing: 's' },
    // zusätzliche Punkte
    'stufen-rechts': { at: [1110, 590], facing: 'w' },
    'bistrotische': { at: [1010, 812], facing: 'n' },
    'gehweg-studio': { at: [600, 340], facing: 's' },
  },
  hotspots,
  lights: [
    { at: [800, 360], radius: 230, color: '#c45cff', intensity: 0.55, slots: ['abend', 'nacht'] },
    { at: [430, 70], radius: 150, color: '#ff3fa4', intensity: 0.6, slots: ['abend', 'nacht'] },
    { at: [420, 230], radius: 140, color: '#ffd38a', intensity: 0.45, slots: ['abend', 'nacht'] },
    { at: [812, 150], radius: 150, color: '#bfe6ff', intensity: 0.45, slots: ['abend', 'nacht'] },
    { at: [270, 820], radius: 150, color: '#22e5ff', intensity: 0.6, slots: ['abend', 'nacht'] },
    { at: [1180, 640], radius: 160, color: '#ffb347', intensity: 0.55, slots: ['abend', 'nacht'] },
    { at: [130, 500], radius: 120, color: '#ffcf7a', intensity: 0.5, slots: ['abend', 'nacht'] },
    { at: [1360, 230], radius: 170, color: '#ffd38a', intensity: 0.35, slots: ['abend', 'nacht'] },
    { at: [296, 340], radius: 90, color: '#ffd38a', intensity: 0.4, slots: ['abend', 'nacht'] },
    { at: [1176, 336], radius: 90, color: '#ffd38a', intensity: 0.4, slots: ['abend', 'nacht'] },
    { at: [1080, 180], radius: 110, color: '#ffcf7a', intensity: 0.35, slots: ['abend', 'nacht'] },
  ],
  ambient: {
    count: 9,
    bySlot: { morgen: 6, tag: 12, abend: 10, nacht: 4 },
    sprites: [
      'passant-anzug-walk', 'passant-anzug-walk', 'passant-tourist-walk', 'passant-arbeiterin-walk',
      'passant-kurier-walk', 'passant-oma-walk', 'passant-punk-walk', 'passant-strassenhaendler-walk',
    ],
    routes: [
      [[56, 840], [400, 700], [800, 650], [1300, 850], [1452, 842]],
      [[790, 960], [760, 610], [430, 340], [812, 268]],
      [[270, 740], [520, 620], [1000, 600], [1240, 420], [1330, 256], [1460, 150]],
      [[246, 650], [700, 560], [1100, 556], [1082, 300]],
      [[600, 340], [1000, 300], [1240, 330], [1110, 600], [640, 760], [270, 740]],
    ],
    barks: [
      { text: 'Bitte nicht auf die Stufen sitzen, die sind frisch gewischt.', when: act1Only },
      { text: 'Ich habe einen Termin um zehn. Den hatte ich auch gestern schon.', when: act1Only },
      { text: 'Collin ist live? Schnell, Haare richten!', when: { all: [act1Only, { weekday: ['mo', 'mi', 'fr'] }, { time: ['morgen', 'tag'] }] } },
      { text: 'Hast du gesehen, wie die Tauben auf dem Kamerakran sitzen? Die haben bessere Plätze als ich.', when: { time: ['tag', 'abend'] } },
      { text: 'Bruder Kabellos predigt gerade einem Toaster. Der Toaster wirkt überzeugt.', when: { time: 'tag' } },
      { text: 'Die Brezeln hier sind so groß, ich brauch dafür einen Kredit. Und einen Physiotherapeuten.' },
      { text: 'Ich war mal im Hintergrund von Collins Sendung. Meine Mutter hat mich an der Jacke erkannt.' },
      { text: 'Psst. Der Wachroboter am Bauzaun schläft nicht. Der wartet.', when: { time: ['abend', 'nacht'] } },
      { text: 'Nachts ist hier keiner. Außer dir. Und mir. Ich geh dann mal.', when: { time: 'nacht' } },
      { text: 'Nicht hingucken. Das ist die aus dem Phantombild. Das schlechte Phantombild.', when: { flag: 'fahndung_2' } },
      { text: 'Haben Sie auch das neue Update? Ich fühle mich so … aktualisiert.', when: act2 },
      { text: 'Master hat gesagt, ich soll lächeln. Ist das richtig so?', when: act2 },
      { text: 'Die Warteschlange beim Gericht geht heute bis zum Bahnhof.', when: act2 },
      { text: 'Der Richter hat heute alle freigesprochen. Auch sich selbst.', when: { act: 3 } },
      { text: 'Ich habe beschlossen, morgen einfach blauzumachen.', when: { act: 3 } },
      { text: 'Gründertag! Gratis-Häppchen! Ich weiß nicht mal, wer gegründet wurde!', when: { cycleDay: 21 } },
    ],
  },
  onEnter: [
    { id: 'stufenplatz-erstbesuch', once: true, dialogue: 'stufenplatz-ankunft', effects: [{ markSeen: 'stufenplatz-erstbesuch' }] },
  ],
};

const dialogues: Record<string, DialogueDef> = {
  'stufenplatz-ankunft': {
    id: 'stufenplatz-ankunft',
    start: 'a',
    nodes: [{
      id: 'a',
      lines: [
        { speaker: 'narrator', text: 'Der Stufenplatz. Eine Etage über der Unterstadt, und man riecht es: weniger Rost, mehr Bodenreiniger.' },
        { speaker: 'narrator', text: 'Betonstufen wie ein Amphitheater, eine Riesenleinwand, ein Kamerakran voller Tauben. Hier sitzt die Stadt und sieht sich selbst im Fernsehen zu.' },
      ],
    }],
  },
  'stufenplatz-praktikantin': {
    id: 'stufenplatz-praktikantin',
    start: 'a',
    nodes: [
      {
        id: 'a',
        lines: [
          { speaker: 'narrator', text: 'Eine Studio-Praktikantin balanciert ein Tablett mit acht Kaffeebechern die Stufen hinunter. Sie murmelt Bestellungen: „Hafer, doppelt, ohne Liebe …“' },
          { speaker: 'narrator', text: 'Ihr Absatz verhakt sich. Das Tablett kippt. Acht Becher fliegen in Zeitlupe, wie in einem sehr teuren Werbespot.' },
        ],
        choices: [
          {
            text: 'Hechtsprung! Alle Becher fangen.', next: 'gefangen',
            check: { id: 'welt-kaffee-auffangen', attribute: 'reflexe', threshold: 4, tags: ['welt'], xp: 10 },
          },
          { text: 'Beim Aufsammeln helfen.', next: 'geholfen' },
          { text: 'Zusehen. Ist ja nicht dein Kaffee.', next: 'zugesehen' },
        ],
      },
      {
        id: 'gefangen',
        lines: [
          { speaker: 'narrator', text: 'Du fängst sechs Becher mit den Händen, einen mit dem Ellbogen und einen mit purem Willen. Kein Tropfen auf den Stufen. Der Putzroboter klatscht.' },
          { speaker: 'narrator', text: '„Du hast gerade meine Karriere gerettet. Collin trinkt nur Kaffee, den niemand berührt hat. Außer dir jetzt. Sag’s ihm nicht.“' },
        ],
        effects: [{ rep: 'nx1-medien', delta: 1 }, { markSeen: 'kaffee-praktikantin-erledigt' }],
      },
      {
        id: 'geholfen',
        lines: [
          { speaker: 'narrator', text: 'Ihr sammelt zusammen Becher und Deckel ein. Der Kaffee bleibt auf den Stufen. Der Putzroboter rollt heran und sieht euch an wie ein enttäuschter Vater.' },
          { speaker: 'narrator', text: '„Danke. Ehrlich. Ich sag einfach, die Tauben waren’s. Es waren immer die Tauben.“' },
        ],
        effects: [{ xp: 5 }, { markSeen: 'kaffee-praktikantin-erledigt' }],
      },
      {
        id: 'zugesehen',
        lines: [{ speaker: 'narrator', text: 'Acht Becher, acht Platscher. Die Praktikantin starrt dich an. Du starrst zurück. Ein Mann im Anzug applaudiert langsam.' }],
        effects: [{ markSeen: 'kaffee-praktikantin-erledigt' }],
      },
    ],
  },
};

export const part: ContentPart = {
  maps: { stufenplatz },
  dialogues,
  districts: {
    mittelring: { id: 'mittelring', name: 'Mittelring', ambience: 'oberstadt', music: 'mittelring' },
    oberstadt: { id: 'oberstadt', name: 'Oberstadt', ambience: 'oberstadt', music: 'oberstadt' },
  },
  stations: {
    'station-stufenplatz': {
      id: 'station-stufenplatz', name: 'Stufenplatz', map: 'stufenplatz', entry: 'station', cityPos: [0.44, 0.38],
      when: { any: [{ quest: 'main-1-probezeit', state: 'done' }, { visited: 'stufenplatz' }] },
    },
  },
};
