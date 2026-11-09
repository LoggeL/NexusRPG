// Zone Digitech-Areal (Oberstadt-Rand, Akt 1) – Paket pkg-stufenplatz-digitech.
// Bild heute: bg-digitech-areal; Prolog main-0-digitech („vor sieben Jahren“): bg-digitech-areal-damals (bgVariants).
// Geometrie am heutigen Bild nachgezogen; die Damals-Fassung hat denselben Grundriss (Brunnen statt Skulptur-Beet,
// Drohnenplatz statt Wachkoloss, Servicewagen statt Plündererlager – die Sperrflächen passen grob auf beide).
import type { Condition, DialogueDef, HotspotDef, MapDef } from '../../../modules/contracts';
import type { ContentPart } from '../../part';

/** Prolog läuft gerade (Raven, sieben Jahre früher); gleiche Bedingung wie quest-main-a/main-0-digitech (IM_PROLOG). */
export const PROLOG_AKTIV: Condition = { notFlag: 'prolog_done' };
const nichtImProlog: Condition = { not: PROLOG_AKTIV };
const act1Only: Condition = { not: { act: 2 } };

const loot = (id: string, at: readonly [number, number], label: string, text: string, radius = 52): HotspotDef => ({
  id, at, radius, label, kind: 'loot', once: true, when: nichtImProlog,
  lines: [{ speaker: 'narrator', text }],
  effects: [{ give: id }],
});

const hotspots: HotspotDef[] = [
  {
    id: 'hartlauf', at: [392, 856], radius: 64, label: 'Pförtnerhaus: Digitech-Restposten', kind: 'shop', shop: 'hartlauf-restposten',
    when: { all: [nichtImProlog, { time: 'tag' }] },
  },
  {
    id: 'pfoertnerhaus-fenster', at: [392, 856], radius: 64, label: 'Pförtnerhaus', kind: 'look',
    when: { all: [nichtImProlog, { not: { time: 'tag' } }] },
    lines: [
      { speaker: 'narrator', text: 'Hinter der Scheibe brennt eine Schreibtischlampe. Ein Schild: „Digitech-Restposten. Öffnungszeiten: wenn die Direktorin da ist. Die Direktorin ist pünktlich.“' },
    ],
  },
  {
    id: 'notstrom-terminal', at: [1068, 336], radius: 60, label: 'Notstrom-Terminal: Logs auslesen', kind: 'check', check: 'gc-76',
    when: { all: [nichtImProlog, { quest: 'side-digitech-geist', state: 'active' }] },
    hideWhen: { item: 'dienstplan-2079' },
    lines: [{ speaker: 'narrator', text: 'Das Terminal flackert grün. Unter dem Staub laufen noch Protokolle: Türöffnungen, Stromspitzen, Dienstpläne. Sieben Jahre Gedächtnis auf Notstrom.' }],
    altText: 'Ohne Technik-Kenntnis: die Leitung direkt anzapfen (Hack) oder die alten Hafenarbeiter fragen, die damals Schicht hatten.',
    effects: [
      { give: 'dienstplan-2079' }, { xp: 20 },
      { message: 'Ein Dienstplan vom Abend des Kabelbrands. Ein Name ist durchgestrichen: Xion Venom.' },
    ],
  },
  {
    id: 'notstrom-terminal-hack', at: [1010, 336], radius: 52, label: 'Notstrom-Leitung anzapfen', kind: 'use',
    when: { all: [nichtImProlog, { quest: 'side-digitech-geist', state: 'active' }] },
    hideWhen: { item: 'dienstplan-2079' },
    effects: [{
      minigame: 'akt-hacken', level: 3, key: 'digitech-notstrom', label: 'Notstrom-Logs anzapfen',
      win: [{ give: 'dienstplan-2079' }, { xp: 15 }, { message: 'Die Logs spucken einen Dienstplan von 2079 aus. Ein Name ist durchgestrichen: Xion Venom.' }],
      lose: [{ damage: 3 }, { message: 'Funken, Geruch nach Haarspray. Das Terminal flackert schadenfroh.' }],
    }],
  },
  {
    id: 'notstrom-terminal-blick', at: [1068, 336], radius: 60, label: 'Notstrom-Terminal', kind: 'look',
    when: { all: [nichtImProlog, { not: { quest: 'side-digitech-geist', state: 'active' } }] },
    lines: [
      { speaker: 'narrator', text: 'Ein Terminal, das seit sieben Jahren auf Notstrom grün flackert. Im Staub vor dem Bildschirm hat jemand „HALLO?“ geschrieben.' },
      { speaker: 'narrator', text: 'Der Bildschirm antwortet mit einem einzelnen blinkenden Cursor. Gesprächiger als die meisten Leute im Mittelring.' },
    ],
  },
  {
    id: 'archiv', at: [230, 330], radius: 60, label: 'Archiv: Aktenterminal knacken', kind: 'check', check: 'gc-112',
    when: nichtImProlog,
    hideWhen: { seen: 'digitech-archiv-fragment' },
    lines: [{ speaker: 'narrator', text: 'Aktenschränke, ein Terminal mit Passwortabfrage und ein Post-it: „Passwort ist NICHT 1234“. Darunter: „Jetzt schon.“' }],
    altText: 'Direktorin Hartlauf gibt dir den Archivschlüssel, wenn Digitech dir vertraut (Ruf 20).',
    effects: [
      { give: 'kuestenkarte-fragment' }, { markSeen: 'digitech-archiv-fragment' },
      { message: 'Unter „Liegenschaften, Küste, vergessen“ liegt ein Stück Seekarte. Küstenlinie, Bojen, ein Kaffeerand.' },
    ],
  },
  {
    id: 'archiv-schluessel', at: [176, 316], radius: 52, label: 'Archiv aufschließen', kind: 'use',
    when: { all: [nichtImProlog, { rep: 'digitech', min: 20 }] },
    hideWhen: { seen: 'digitech-archiv-fragment' },
    lines: [{ speaker: 'narrator', text: 'Hartlaufs Schlüssel passt. Die Schublade „Küste“ quietscht wie eine beleidigte Möwe.' }],
    effects: [{ give: 'kuestenkarte-fragment' }, { markSeen: 'digitech-archiv-fragment' }],
  },
  {
    id: 'archiv-blick', at: [230, 330], radius: 60, label: 'Archiv', kind: 'look',
    when: { all: [nichtImProlog, { seen: 'digitech-archiv-fragment' }] },
    lines: [{ speaker: 'narrator', text: 'Ordner über Ordner. „Spesen 2078“, „Spesen 2078 (echt)“, „Spesen 2078 (für die Steuer)“. Digitech war gründlich.' }],
  },
  {
    id: 'digitech-plaene', at: [282, 300], radius: 48, label: 'Digitech-Baupläne', kind: 'loot',
    when: { all: [nichtImProlog, { origin: 'origin-ex-wache' }, { quest: 'prep-grundriss', state: 'active' }] },
    hideWhen: { item: 'grundriss-labor' },
    once: true,
    lines: [
      { speaker: 'narrator', text: '[Ex-Wache] Du kennst die Ablage noch aus deiner Dienstzeit: Baupläne immer ganz unten, unter den Kantinenplänen.' },
      { speaker: 'narrator', text: 'Da ist er: der Grundriss des Quantum-Labors, damals von Digitech gebaut. Ein Kaffeefleck verdeckt den Notausgang. Klassiker.' },
    ],
    effects: [{ give: 'grundriss-labor' }, { xp: 20 }],
  },
  {
    id: 'wachplan-kiste', at: [1420, 272], radius: 56, label: 'Wachhäuschen: Schublade knacken', kind: 'use',
    when: { all: [nichtImProlog, { time: 'nacht' }, { quest: 'prep-wachplan', state: 'active' }] },
    hideWhen: { item: 'wachplan-campus' },
    lines: [{ speaker: 'narrator', text: 'Im Wachhäuschen der Lieferzone liegt eine abgeschlossene Schublade. Darin, laut Aufkleber: „Wachplan. Nicht klauen.“' }],
    effects: [{
      minigame: 'akt-schloss', level: 2, key: 'wachplan-kiste', label: 'Schublade knacken',
      win: [{ give: 'wachplan-campus' }, { xp: 20 }, { message: 'Jede Streife, jede Pause, jeder Kaffee. Schichtwechsel um 01:00.' }],
      lose: [{ message: 'Klick. Falscher Klick. Die Kamera am Mast dreht sich langsam zu dir. Lieber gleich noch mal, bevor sie fertig gedreht hat.' }],
    }],
  },
  {
    id: 'lieferzone-schranke', at: [1330, 262], radius: 56, label: 'Schranke der Lieferzone', kind: 'look',
    when: nichtImProlog,
    lines: [{ speaker: 'narrator', text: 'Schranke, Kamera, ein Schild: „Lieferzone Quantum – Unbefugte werden optimiert.“ Dahinter führt eine glatte Straße hinauf zum Campus.' }],
  },
  {
    id: 'glasfassade', at: [790, 360], radius: 72, label: 'Eingestürzte Glasfassade', kind: 'look',
    when: nichtImProlog,
    lines: [
      { speaker: 'narrator', text: 'Ein Wasserfall aus Glas, eingefroren mitten im Fallen. Zwischen den Scherben wächst Löwenzahn, sehr selbstbewusst.' },
      { speaker: 'narrator', text: 'Abends kommen die Schrottkrähen und holen sich Fensterrahmen. Morgens sind ein paar weniger da. Das Gebäude wird jeden Tag ein bisschen leichter.' },
    ],
  },
  {
    id: 'wachroboter-reste', at: [1060, 540], radius: 64, label: 'Umgekippte Wachroboter', kind: 'look',
    when: nichtImProlog,
    lines: [
      { speaker: 'narrator', text: 'Zwei Wachroboter liegen da wie nach einer sehr langen Betriebsfeier. Auf einem steht „Gerhard“, auf dem anderen „Auch Gerhard“.' },
      { speaker: 'narrator', text: 'Einer zuckt, als du vorbeigehst. „ZUTRITT NUR FÜR MITARB…“ Dann nichts mehr. Er hat es versucht.' },
    ],
  },
  {
    id: 'wachkoloss', at: [1240, 470], radius: 64, label: 'Der Wachkoloss', kind: 'look',
    when: nichtImProlog,
    lines: [
      { speaker: 'narrator', text: 'Vier Meter Panzerstahl, auf die Knie gesunken, Efeu im Nacken. Der Wachkoloss ist im Ruhemodus. Aus einem Lüftungsschlitz kommt ein gleichmäßiges Summen.' },
      { speaker: 'narrator', text: 'Ein Zettel auf dem Fuß, in Hartlaufs Handschrift: „Nicht wecken. Er war nie ein Morgenmensch.“' },
    ],
  },
  {
    id: 'wachkoloss-nacht', at: [1300, 380], radius: 56, label: 'Rotes Auge', kind: 'look',
    when: { all: [nichtImProlog, { time: 'nacht' }] },
    lines: [{ speaker: 'narrator', text: 'Nachts glimmt im Kopf des Kolosses ein rotes Licht. Es folgt dir. Langsam. Du gehst weiter. Schneller.' }],
  },
  {
    id: 'bauzaun-innen', at: [130, 470], radius: 60, label: 'Bauzaun von innen', kind: 'look',
    when: nichtImProlog,
    lines: [{ speaker: 'narrator', text: 'Von innen sind die Quantum-Park-Plakate nur graue Rückseiten mit Klebeband. Ein ehrlicheres Werbeversprechen gab es hier nie.' }],
  },
  {
    id: 'kabelschacht-blick', at: [772, 852], radius: 56, label: 'Kabelschacht', kind: 'look',
    when: { all: [nichtImProlog, { not: { act: 2 } }] },
    lines: [{ speaker: 'narrator', text: 'Der Kabelschacht ist zugeschüttet. Jemand hat „Bald“ auf den Schutt gesprüht. Darunter, kleiner: „Echt jetzt, bald.“' }],
  },
  {
    id: 'pluenderer-lager', at: [1010, 772], radius: 60, label: 'Plündererlager', kind: 'look',
    when: { all: [nichtImProlog, { not: { quest: 'side-digitech-geist', state: 'active' } }] },
    lines: [
      { speaker: 'narrator', text: 'Planen, ein brennendes Ölfass, Schlafsäcke und ein Berg Kabel. Die Plünderer sind gerade nicht da. Ihr Fernseher läuft trotzdem – für niemanden.' },
    ],
  },
  {
    id: 'skulptur', at: [365, 470], radius: 56, label: 'Firmenskulptur', kind: 'look',
    when: nichtImProlog,
    lines: [{ speaker: 'narrator', text: 'Eine Edelstahlschleife, „Unendliche Innovation“. Sie ist in der Mitte gebrochen. Kunst wird mit dem Alter ehrlicher.' }],
  },
  loot('schallplatte-05', [1018, 820], 'Plattenhülle zwischen Kabelrollen',
    'Zwischen Kabelrollen und einer leeren Dose „Nougatbombe“ steckt eine Schallplatte. Die Plünderer hielten sie wohl für einen Untersetzer. Banausen.'),
  loot('datenwuerfel-16', [820, 352], 'Funkeln im Glasbruch',
    'Zwischen den Scherben der Fassade: ein Datenwürfel, noch mit Digitech-Inventaraufkleber. „Eigentum der Firma“. Die Firma ist weg. Der Würfel nicht.'),
  loot('datenwuerfel-17', [1100, 584], 'Etwas im Wachroboter',
    'Im Brustfach eines umgekippten Wachroboters klemmt ein Datenwürfel. Gerhard hat ihn sieben Jahre lang bewacht. Gut gemacht, Gerhard.'),
  loot('glueckstern-14', [366, 600], 'Glitzern an der Skulptur',
    'Am Sockel der gebrochenen Skulptur liegt ein kleiner Blechstern. Unendliche Innovation, endliches Glück.'),
];

const areal: MapDef = {
  id: 'digitech-areal',
  name: 'Digitech-Areal',
  subtitle: 'Oberstadt-Rand',
  size: [1536, 1024],
  district: 'oberstadt',
  lighting: 'outdoor',
  bg: 'bg-digitech-areal',
  bgVariants: [{ when: PROLOG_AKTIV, bg: 'bg-digitech-areal-damals' }],
  ambience: 'oberstadt',
  walk: [
    // Rissiger Platz vor der Turmruine; Lücke im Bauzaun links, Lieferzonenstraße oben rechts bis zur Schranke.
    [
      [0, 326], [150, 316], [450, 318], [590, 318], [604, 336], [1000, 336], [1010, 312], [1140, 312], [1246, 306],
      [1250, 232], [1410, 232], [1410, 264], [1536, 264], [1536, 1010], [0, 1010],
    ],
  ],
  block: [
    // Bauzaun links (oben und unten, dazwischen die Lücke), Büsche
    [[0, 396], [126, 396], [126, 544], [0, 544]],
    [[0, 602], [126, 602], [126, 766], [0, 766]],
    [[0, 766], [94, 766], [94, 1024], [0, 1024]],
    // Pförtnerhaus, Bank, Pflanzbeet
    [[96, 774], [362, 774], [362, 936], [96, 936]],
    [[172, 892], [272, 892], [272, 948], [172, 948]],
    [[354, 830], [496, 830], [496, 894], [354, 894]],
    // Skulptur im Beet
    [[230, 478], [500, 478], [500, 598], [230, 598]],
    // Bänke
    [[344, 300], [432, 300], [432, 348], [344, 348]],
    [[1158, 412], [1232, 412], [1232, 468], [1158, 468]],
    // Wachkoloss, umgekippte Wachroboter, Beete rechts
    [[1250, 420], [1536, 420], [1536, 606], [1250, 606]],
    [[1100, 496], [1236, 496], [1236, 560], [1100, 560]],
    [[1166, 578], [1300, 578], [1300, 618], [1166, 618]],
    [[1430, 592], [1536, 592], [1536, 646], [1430, 646]],
    [[1380, 646], [1536, 646], [1536, 730], [1380, 730]],
    // Plündererlager mit Beet
    [[1040, 782], [1536, 782], [1536, 1024], [1040, 1024]],
    [[976, 830], [1062, 830], [1062, 894], [976, 894]],
    // Kabelschacht-Luke
    [[716, 870], [832, 870], [832, 952], [716, 952]],
  ],
  foreground: [
    { rect: [94, 688, 270, 92], baseY: 780 },
    { rect: [286, 412, 130, 70], baseY: 520 },
    { rect: [1260, 316, 276, 106], baseY: 470 },
    { rect: [1040, 700, 496, 84], baseY: 800 },
  ],
  exits: [
    {
      id: 'nach-stufenplatz', rect: [0, 548, 30, 52], to: 'stufenplatz', entry: 'von-digitech-areal',
      label: 'Durch den Bauzaun zum Stufenplatz',
      when: nichtImProlog,
      lockedText: 'Hunter im Funk: „Wo willst du hin? Der Tresor ist da vorne. Rein, Chip, raus. Ganz einfach.“',
    },
    {
      id: 'kellertreppe', rect: [456, 270, 120, 64], to: 'digitech-tresor', entry: 'von-digitech-areal',
      label: 'Kellertreppe: Tresor und Keller', interact: true,
    },
    {
      id: 'lieferzone', rect: [1256, 232, 150, 34], to: 'quantum-campus', entry: 'von-digitech-areal',
      label: 'Lieferzone zum Quantum-Campus',
      when: { act: 2 }, check: 'gc-109',
      lockedText: 'Schranke, Kamera, ein Schild: „Lieferzone Quantum – Unbefugte werden optimiert.“',
    },
    {
      id: 'kabelschacht', rect: [706, 846, 140, 112], to: 'datentunnel', entry: 'von-digitech-areal',
      label: 'Kabelschacht', interact: true, when: { act: 2 },
      lockedText: 'Der Kabelschacht ist zugeschüttet. Jemand hat „Bald“ auf den Schutt gesprüht.',
    },
  ],
  entries: {
    'von-stufenplatz': { at: [60, 574], facing: 'e' },
    'von-digitech-tresor': { at: [516, 352], facing: 's' },
    'von-quantum-campus': { at: [1330, 286], facing: 's' },
    'von-datentunnel': { at: [774, 828], facing: 'n' },
    'prolog-start': { at: [190, 640], facing: 'e' },
    taxi: { at: [700, 660], facing: 's' },
  },
  spots: {
    'bauzaun-innen': { at: [150, 574], facing: 'e' },
    pfoertnerhaus: { at: [398, 812], facing: 'w' },
    'pfoertnerhaus-bank': { at: [222, 966], facing: 's' },
    'notstrom-terminal': { at: [1068, 350], facing: 'n' },
    archiv: { at: [230, 342], facing: 'n' },
    lieferzone: { at: [1330, 280], facing: 'n' },
    glasfassade: { at: [790, 372], facing: 'n' },
    'wachroboter-reste': { at: [1080, 600], facing: 'e' },
    wachkoloss: { at: [1238, 480], facing: 'e' },
    'pluenderer-lager': { at: [1000, 760], facing: 'e' },
    'prolog-funkpunkt': { at: [600, 640], facing: 'n' },
    'auftrag-a': { at: [640, 780], facing: 's' },
    // zusätzliche Punkte
    kellertreppe: { at: [516, 346], facing: 'n' },
    'platz-mitte': { at: [760, 560], facing: 's' },
  },
  hotspots,
  encounters: [
    {
      id: 'pluenderer', encounter: 'enc-ruine-pluenderer', at: [1000, 760], sprite: 'abzieher-walk',
      when: { all: [nichtImProlog, { quest: 'side-digitech-geist', state: 'active' }] }, radius: 56,
    },
  ],
  lights: [
    { at: [1068, 250], radius: 170, color: '#3dff7a', intensity: 0.6, slots: ['abend', 'nacht'] },
    { at: [516, 220], radius: 140, color: '#5ad8ff', intensity: 0.55, slots: ['abend', 'nacht'] },
    { at: [230, 230], radius: 140, color: '#ffd38a', intensity: 0.5, slots: ['abend', 'nacht'] },
    { at: [1160, 900], radius: 180, color: '#ff8a3d', intensity: 0.7, slots: ['abend', 'nacht'] },
    { at: [1460, 200], radius: 120, color: '#ffcf7a', intensity: 0.45, slots: ['abend', 'nacht'] },
    { at: [366, 778], radius: 110, color: '#ffcf7a', intensity: 0.45, slots: ['abend', 'nacht'] },
    { at: [1240, 196], radius: 80, color: '#ff4d4d', intensity: 0.5, slots: ['abend', 'nacht'] },
    { at: [1320, 370], radius: 60, color: '#ff2a2a', intensity: 0.6, slots: ['nacht'] },
    { at: [60, 570], radius: 120, color: '#ff4fd8', intensity: 0.4, slots: ['abend', 'nacht'] },
  ],
  ambient: {
    count: 2,
    bySlot: { morgen: 1, tag: 3, abend: 2, nacht: 1 },
    sprites: ['passant-schrotti-walk', 'passant-tourist-walk', 'passant-kurier-walk'],
    routes: [
      [[150, 574], [600, 660], [900, 700], [980, 760]],
      [[516, 352], [760, 420], [1080, 380], [1330, 290]],
      [[200, 990], [700, 990], [900, 760], [600, 420]],
    ],
    barks: [
      { text: 'Unterstadt? Das klingt wie eine Erkältung.', when: act1Only },
      { text: 'Mein Pudel hat mehr Implantate als du.', when: act1Only },
      { text: 'Riechst du das? Das ist Erfolg. Oder der neue Bodenreiniger.', when: act1Only },
      { text: 'Ich bin nur wegen der Ruinen-Tour hier. Mit Selfie am Koloss. Ist der … an?' },
      { text: 'Kupfer, Glas, ein halber Roboter. Heute ist Weihnachten.', when: { time: ['abend', 'nacht'] } },
      { text: 'Ich kann die Releaseparty kaum erwarten. Ich weiß nur nicht mehr, warum.', when: { act: 2 } },
      { text: 'Blade sagt, Teilen ist was für Leute ohne Personal.', when: { act: 2 } },
      { text: 'Ich habe heute selbst Kaffee gekocht. Er war furchtbar. Ich bin so stolz.', when: { act: 3 } },
    ],
  },
  onEnter: [
    {
      id: 'digitech-areal-erstbesuch', once: true, when: nichtImProlog,
      dialogue: 'digitech-areal-ankunft', effects: [{ markSeen: 'digitech-areal-erstbesuch' }],
    },
  ],
};

const dialogues: Record<string, DialogueDef> = {
  'digitech-areal-ankunft': {
    id: 'digitech-areal-ankunft',
    start: 'a',
    nodes: [{
      id: 'a',
      lines: [
        { speaker: 'narrator', text: 'Das Digitech-Areal. Vor sieben Jahren die glänzendste Adresse am Rand der Oberstadt. Heute wächst Efeu aus den Glasfassaden.' },
        { speaker: 'narrator', text: 'Ein Wachkoloss kniet im Efeu, ein Terminal flackert grün, und irgendwo unter deinen Füßen liegt ein Tresor mit einem Rohr, das Geschichten erzählen könnte.' },
      ],
      choices: [
        { text: 'Raven war hier. Damals.', when: { met: 'raven' }, next: 'raven' },
        { text: 'Schauen wir uns um.' },
      ],
    }, {
      id: 'raven',
      lines: [{ speaker: 'narrator', text: 'Hier hat alles angefangen: der Chip, der Verrat, die Handschellen. Der Boden erinnert sich nicht. Das Rohr im Keller schon.' }],
    }],
  },
};

export const part: ContentPart = {
  maps: { 'digitech-areal': areal },
  dialogues,
};
