// Innenraum Quantum-Foyer (Oberstadt) – Paket pkg-quantum-campus. ID-Plan: design/plan/act23.json maps.quantum-foyer.
// Zugang: Bruch (main-2-bruch), blades-visitenkarte (he-blade-4), xion-passierschein, Akt 3 (Party), Nachspiel.
// Einlasswege von main-3-einlass im Foyer: Gästelisten-Pult (gc-41 / prep_gaesteliste / Einladung) und Catering (gc-39);
// Haupteingang (Kessel, gc-38) und Lüftung (gc-40) liegen draußen auf quantum-campus. Alle setzen die Flags einlass_*.
// Bruch (main-2-bruch): Laboraufzug und Funkgerät bedient die Quest selbst (quest-main-2, m2b-laboraufzug,
// m2b-sicherheitszentrale); der Laboraufzug-Ausgang öffnet deshalb erst mit main-3-labor/main-3-nexus/Nachspiel.
// Frei gelassen (Hotspot-IDs aus dem Plan) für Figuren/Quests: nexus-avatar (ki-nexus steht per Tagesablauf am Spot),
// fundbuero-schalter (side-captain-kuschel), funkgeraet (boss-xion-Funkruf).
import type { Condition, DialogueDef, HotspotDef, MapDef } from '../../../modules/contracts';
import type { ContentPart } from '../../part';

const BRUCH: Condition = { quest: 'main-2-bruch', state: 'active' };
const EPILOG: Condition = { flag: 'epilog' };
const ACT3: Condition = { act: 3 };
const PARTY: Condition = { all: [ACT3, { not: EPILOG }] };
const EINLASS: Condition = { quest: 'main-3-einlass', state: 'active' };
const EINLASS_GESCHAFFT: Condition = {
  any: [
    { flag: 'einlass_haupteingang' }, { flag: 'einlass_catering' }, { flag: 'einlass_lueftung' },
    { flag: 'einlass_gaesteliste' }, { flag: 'einlass_wache' }, { flag: 'einlass_kampf' }, { flag: 'einlass_presse' },
    { won: 'enc-einlass-kontrolle' }, { quest: 'main-3-einlass', state: 'done' },
  ],
};
const say = (...texts: string[]) => texts.map(text => ({ speaker: 'narrator' as const, text }));

const hotspots: HotspotDef[] = [
  {
    id: 'logo-wand', at: [770, 240], radius: 80, label: 'Logo-Wand', kind: 'look',
    lines: say(
      'Das Quantum-Logo, drei Meter hoch, ein Kreis mit einem Fadenkreuz drin. Wer das entworfen hat, wusste genau, was er tut. Oder hatte einen sehr ehrlichen Tag.',
      'Es leuchtet violett und cyan und brummt ganz leise. Wie ein Kühlschrank, der Macht hat.',
    ),
  },
  {
    id: 'logo-wand-party', at: [770, 240], radius: 80, label: 'Fotowand', kind: 'look',
    when: PARTY,
    lines: say('Vor dem Logo posieren Gäste für Fotos. Ein Droide sagt „Cheese“, in einem Tonfall, als wäre Käse eine Drohung. Der Blitz ist so hell, dass die Leute danach eine Minute lang höflich sind.'),
  },
  {
    id: 'empfang', at: [770, 478], radius: 70, label: 'Empfangstresen', kind: 'look',
    when: { not: BRUCH },
    lines: say(
      'Ein Tresen aus weißem Stein, drei Bildschirme, ein Stuhl, der mehr gekostet hat als dein Leben bisher. Ein Schild: „Bitte warten Sie, bis Sie gesehen werden. Sie werden gesehen.“',
    ),
  },
  {
    id: 'nexus-avatar-blick', at: [490, 560], radius: 70, label: 'Hologramm-Podest', kind: 'look',
    when: { any: [EPILOG, { all: [{ not: ACT3 }, { time: ['morgen', 'tag'] }] }] },
    lines: say(
      'Über dem Podest flimmert nur ein Ruhebildschirm aus Lichtscheiben. Kein Gesicht, keine Stimme. Ein Schild: „Nexus ist gerade in einem Meeting. Mit sich selbst.“',
    ),
  },
  {
    id: 'sicherheitszentrale', at: [322, 500], radius: 60, label: 'Sicherheitszentrale', kind: 'look',
    when: { not: BRUCH },
    lines: say(
      'Ein Glaskasten voller Monitore. Jeder Winkel des Campus, jede Toilette, jedes Lächeln. Auf dem Tisch ein Funkgerät und eine Tasse mit der Aufschrift … nein, keine Aufschrift. Nur ein Totenkopf.',
    ),
  },
  {
    id: 'fundbuero-quantum', at: [300, 800], radius: 56, label: 'Quantum-Fundbüro', kind: 'look',
    lines: say(
      'Ein Schalter mit Klingel und Regalen voller Kisten: verlorene Schirme, Ausweise, ein Gebiss, drei einzelne Designer-Handschuhe. Alles beschriftet, alles katalogisiert, nichts je zurückgegeben.',
    ),
  },
  {
    id: 'treppe', at: [200, 286], radius: 56, label: 'Treppe zur Galerie', kind: 'look',
    lines: say('Eine Treppe hinauf zur Galerie. Oben steht ein Schild: „Nur für Personal. Und für Personal, das wichtiger ist als anderes Personal.“'),
  },
  {
    id: 'wartebank', at: [1080, 880], radius: 60, label: 'Wartebank', kind: 'look',
    lines: say('Eine weiße Bank, so bequem wie eine Gehaltsverhandlung. Wer hier wartet, wartet auf etwas, das nie kommt: einen Termin, einen Rückruf, eine Entschuldigung.'),
  },
  {
    id: 'sybella-stand-blick', at: [1170, 596], radius: 64, label: 'Werbestand', kind: 'look',
    when: { not: PARTY },
    lines: say('Ein leerer Werbestand mit einem Display, das sich langsam dreht. Darauf ein Chip in Großaufnahme. „Chrome 10. Weniger denken, mehr leben.“ Gegen den ersten Teil hast du nichts.'),
  },
  {
    id: 'sybella-stand-party', at: [1170, 596], radius: 64, label: 'Chrome-10-Stand', kind: 'look',
    when: PARTY,
    lines: say('Der Chrome-10-Stand glitzert wie ein Weihnachtsbaum mit Geschäftsmodell. Gratis-Chips in kleinen Samtschachteln. Neben jeder Schachtel liegt ein Taschentuch. Für die Freudentränen, sagt das Schild.'),
  },
  {
    id: 'aufzug-labor-blick', at: [400, 250], radius: 56, label: 'Laboraufzug', kind: 'look',
    when: { not: { any: [BRUCH, EPILOG] } },
    lines: say('Ein Stahlaufzug mit Fingerabdruckscanner. Darunter ein Aufkleber: „Ebene −3. Bitte keine Fragen.“ Darunter ein kleinerer: „Wirklich nicht.“'),
  },
  {
    id: 'chefaufzug-blick', at: [1135, 250], radius: 56, label: 'Goldener Aufzug', kind: 'look',
    lines: say('Ein goldener Aufzug mit nur einem Knopf: „MASTER“. Er ist so poliert, dass du dich darin siehst. Du siehst nicht aus wie ein Master. Du siehst aus wie jemand, der gleich was klaut.'),
  },

  // --- Kantinen-Automat (Händler quantum-kantine, ab Akt 3 und im Nachspiel) ----------------------------------
  {
    id: 'kantine', at: [1325, 886], radius: 60, label: 'Kantinen-Automat', kind: 'shop', shop: 'quantum-kantine',
    when: { any: [ACT3, EPILOG] },
  },
  {
    id: 'kantine-aus', at: [1325, 886], radius: 60, label: 'Kantinen-Automat', kind: 'look',
    when: { not: { any: [ACT3, EPILOG] } },
    lines: say('Der Automat ist ausgeschaltet. Auf dem Display: „Neue Sorten zur Releaseparty!“ Hinter der Scheibe stehen Synth-Kaffee und Algen-Chips stramm, wie Soldaten, die auf den Krieg warten.'),
  },

  // --- Einlass zur Party (main-3-einlass) ---------------------------------------------------------------------
  {
    id: 'gaesteliste', at: [1265, 430], radius: 56, label: 'Gästelisten-Pult', kind: 'talk',
    when: { all: [EINLASS, { not: EINLASS_GESCHAFFT }] },
    dialogue: 'foyer-gaesteliste',
  },
  {
    id: 'gaesteliste-blick', at: [1265, 430], radius: 56, label: 'Gästelisten-Pult', kind: 'look',
    when: { not: { all: [EINLASS, { not: EINLASS_GESCHAFFT }] } },
    lines: say('Ein Pult mit Touchscreen und Samtkordel. Der Bildschirm zeigt einen leeren Kreis. Die Gästeliste ist ein Kreis. Entweder du bist drin oder nicht.'),
  },
  {
    id: 'catering', at: [1362, 546], radius: 56, label: 'Catering-Durchgang', kind: 'check', check: 'gc-39',
    when: { all: [EINLASS, { not: EINLASS_GESCHAFFT }] },
    lines: say('Hinter der Schwingtür hetzt das Catering: Kellner-Droiden, Kisten mit Kanapees, ein Koch, der einen Hummer anschreit. Niemand achtet auf ein Gesicht mehr. Wenn es ein Tablett trägt.'),
    altText: 'Zu auffällig. Die Kellner kennen sich. Andere Wege: Kessel am roten Teppich, das Gästelisten-Pult oder die Lüftung draußen.',
    effects: [
      { setFlag: 'einlass_catering' }, { xp: 30 },
      { message: 'Du schnappst dir ein Tablett mit Lachshäppchen und läufst los. Niemand hält jemanden auf, der Lachs trägt.' },
      { travel: 'himmelsgarten', entry: 'catering', minutes: 5 },
    ],
  },
  {
    id: 'catering-blick', at: [1362, 546], radius: 56, label: 'Schwingtür', kind: 'look',
    when: { not: { all: [EINLASS, { not: EINLASS_GESCHAFFT }] } },
    lines: say('Eine Schwingtür mit Bullaugen. Dahinter riecht es nach Sauce, Stress und Champagner. Ein Schild: „Nur Catering. Und Leute, die so tun.“'),
  },
];

const foyer: MapDef = {
  id: 'quantum-foyer',
  name: 'Quantum-Foyer',
  subtitle: 'Quantum-Campus',
  size: [1536, 1024],
  district: 'oberstadt',
  lighting: 'indoor',
  bg: 'bg-quantum-foyer',
  musicWhen: [{ when: BRUCH, music: 'schleichen' }, { when: PARTY, music: 'releaseparty' }],
  bgVariants: [
    { when: { all: [BRUCH, { flag: 'nexus_erwacht' }] }, bg: 'bg-quantum-foyer-alarm' },
    { when: PARTY, bg: 'bg-quantum-foyer-party' },
  ],
  ambience: 'labor',
  music: 'oberstadt',
  walk: [
    // Marmorboden zwischen Rückwand (oben), Seitenwänden und Drehtür (unten Mitte).
    [[46, 214], [1490, 214], [1490, 1010], [46, 1010]],
  ],
  block: [
    // Treppe zur Galerie oben links
    [[46, 176], [300, 176], [300, 242], [162, 242], [152, 352], [46, 352]],
    // Sicherheitszentrale (Glaskasten), Fundbüro-Schalter
    [[46, 380], [302, 380], [302, 612], [46, 612]],
    [[46, 728], [282, 728], [282, 882], [46, 882]],
    // Empfangstresen mit Pflanzen
    [[540, 288], [1000, 288], [1000, 410], [945, 452], [596, 452], [540, 412]],
    // Hologramm-Podest
    [[386, 596], [596, 596], [596, 690], [386, 690]],
    // Gästeaufzug, Pult mit Kordel
    [[1394, 252], [1490, 252], [1490, 398], [1394, 398]],
    [[1220, 318], [1392, 318], [1392, 406], [1220, 406]],
    // Catering-Tür, Personaltür (Wandnischen)
    [[1374, 484], [1490, 484], [1490, 606], [1374, 606]],
    [[1428, 684], [1490, 684], [1490, 806], [1428, 806]],
    // Werbestand mit Pflanzen, Wartebank, Automat
    [[1060, 620], [1282, 620], [1282, 730], [1060, 730]],
    [[924, 756], [1232, 756], [1232, 856], [924, 856]],
    [[1344, 824], [1432, 824], [1432, 942], [1344, 942]],
    // Drehtür mit Pflanzen und Kordeln
    [[664, 836], [872, 836], [872, 1010], [664, 1010]],
    [[504, 880], [664, 880], [664, 1000], [504, 1000]],
    [[872, 880], [1006, 880], [1006, 1000], [872, 1000]],
    // Reinigungsroboter-Docks
    [[50, 930], [124, 930], [124, 994], [50, 994]],
    [[1432, 930], [1490, 930], [1490, 994], [1432, 994]],
  ],
  foreground: [
    { rect: [396, 404, 210, 196], baseY: 640 },
    { rect: [540, 288, 460, 122], baseY: 452 },
  ],
  exits: [
    {
      id: 'nach-quantum-campus', rect: [690, 790, 160, 50], to: 'quantum-campus', entry: 'von-quantum-foyer',
      label: 'Drehtür nach draußen', interact: true,
    },
    {
      id: 'personalschleuse', rect: [1418, 690, 72, 120], to: 'quantum-campus', entry: 'seiteneingang',
      label: 'Personalschleuse nach draußen', interact: true,
    },
    {
      id: 'laboraufzug', rect: [345, 206, 110, 44], to: 'quantum-labor', entry: 'von-quantum-foyer',
      label: 'Laboraufzug (Ebene −3)', interact: true,
      when: {
        any: [
          { quest: 'main-3-labor', state: ['active', 'done'] },
          { quest: 'main-3-nexus', state: ['active', 'done'] },
          EPILOG,
        ],
      },
      lockedText: 'Der Aufzug verlangt einen Fingerabdruck. Deiner gefällt ihm nicht. „Bitte waschen Sie sich die Hände und Ihre Absichten.“',
    },
    {
      id: 'chefaufzug', rect: [1070, 206, 130, 44], to: 'blades-buero', entry: 'von-quantum-foyer',
      label: 'Chefaufzug (Turmbüro)', interact: true,
      when: {
        any: [
          { flag: 'chefaufzug_frei' }, { flag: 'nexus_rebelliert' },
          { quest: 'main-3-nexus', state: ['active', 'done'] }, { flag: 'ende_master' }, EPILOG,
        ],
      },
      lockedText: 'Ein goldener Aufzug mit nur einem Knopf: „MASTER“. Er leuchtet nicht für dich.',
    },
    {
      id: 'gaesteaufzug', rect: [1394, 396, 96, 44], to: 'himmelsgarten', entry: 'von-quantum-foyer',
      label: 'Gästeaufzug zum Himmelsgarten', interact: true,
      when: { any: [{ all: [ACT3, EINLASS_GESCHAFFT] }, EPILOG] },
      lockedText: 'Ein Türsteher-Droide mit Fliege: „Ihr Name steht nicht auf der Liste. Ihr Name steht nirgends.“',
    },
  ],
  entries: {
    'von-quantum-campus': { at: [767, 770], facing: 'n' },
    seiteneingang: { at: [1396, 750], facing: 'w' },
    'von-quantum-labor': { at: [400, 268], facing: 's' },
    'von-blades-buero': { at: [1135, 268], facing: 's' },
    'von-himmelsgarten': { at: [1442, 458], facing: 's' },
  },
  spots: {
    drehtuer: { at: [767, 790], facing: 'n' },
    empfang: { at: [770, 480], facing: 'n' },
    'nexus-avatar': { at: [490, 560], facing: 's' },
    'logo-wand': { at: [770, 252], facing: 'n' },
    'xion-posten': { at: [220, 272], facing: 's' },
    sicherheitszentrale: { at: [322, 500], facing: 'w' },
    'fundbuero-quantum': { at: [150, 756], facing: 's' },
    'kantinen-automat': { at: [1320, 890], facing: 'e' },
    wartebank: { at: [1080, 838], facing: 's' },
    'presse-ecke': { at: [1100, 520], facing: 'w' },
    'gaesteliste-pult': { at: [1265, 430], facing: 'n' },
    'catering-tuer': { at: [1356, 546], facing: 'e' },
    'sybella-stand': { at: [1010, 672], facing: 'e' },
    laboraufzug: { at: [400, 256], facing: 'n' },
    chefaufzug: { at: [1135, 256], facing: 'n' },
    gaesteaufzug: { at: [1442, 450], facing: 'n' },
    personalgang: { at: [1396, 750], facing: 'e' },
  },
  hotspots,
  lights: [
    { at: [770, 110], radius: 260, color: '#b45cff', intensity: 0.6 },
    { at: [770, 140], radius: 140, color: '#3ef2ff', intensity: 0.5 },
    { at: [1135, 150], radius: 150, color: '#ffc861', intensity: 0.5 },
    { at: [400, 150], radius: 120, color: '#9fe8ff', intensity: 0.4 },
    { at: [490, 520], radius: 190, color: '#7fe8ff', intensity: 0.65 },
    { at: [770, 380], radius: 160, color: '#3ef2ff', intensity: 0.4 },
    { at: [175, 470], radius: 140, color: '#c58aff', intensity: 0.45 },
    { at: [1388, 880], radius: 110, color: '#ff4fd8', intensity: 0.45 },
    { at: [1442, 320], radius: 110, color: '#5ad8ff', intensity: 0.45 },
  ],
  ambient: {
    count: 2,
    bySlot: { morgen: 2, tag: 3, abend: 2, nacht: 0 },
    sprites: ['passant-anzug-walk', 'passant-kurier-walk', 'passant-tourist-walk'],
    routes: [
      [[767, 770], [767, 520], [1100, 500], [1265, 440]],
      [[400, 268], [400, 520], [700, 520], [767, 770]],
      [[1135, 268], [1135, 480], [1320, 700], [1320, 990]],
    ],
    barks: [
      { text: 'Ich habe einen Termin bei Herrn Nocturne. Seit drei Wochen. Täglich.', when: { not: ACT3 } },
      { text: 'Haben Sie auch schon das neue Update? Ich fühle mich so … aktualisiert.', when: { all: [{ act: 2 }, { not: ACT3 }] } },
      { text: 'Nexus hat heute „Guten Morgen“ zu mir gesagt. Mit meinem Namen. Ich hab ihn nie gesagt.', when: { all: [{ act: 2 }, { not: EPILOG }] } },
      { text: 'Gästeliste? Ich BIN die Gästeliste.', when: PARTY },
      { text: 'Die Häppchen sind so klein, man braucht ein Implantat, um sie zu sehen.', when: PARTY },
      { text: 'Collin hat mich angeschaut! Live! Ich glaube, ich bin jetzt berühmt.', when: PARTY },
      { text: 'Der Automat hat mir eine Suppe gegeben, um die ich nicht gebeten hatte. Sie war gut. Ich bin verwirrt.', when: EPILOG },
      { text: 'Früher musste man hier seinen Ausweis zeigen. Jetzt reicht ein Lächeln. Ich übe noch.', when: EPILOG },
    ],
  },
  onEnter: [
    {
      id: 'quantum-foyer-erstbesuch', once: true,
      when: { all: [{ not: BRUCH }, { not: EINLASS }] },
      dialogue: 'quantum-foyer-ankunft', effects: [{ markSeen: 'quantum-foyer-erstbesuch' }],
    },
  ],
};

const dialogues: Record<string, DialogueDef> = {
  'quantum-foyer-ankunft': {
    id: 'quantum-foyer-ankunft',
    start: 'a',
    nodes: [{
      id: 'a',
      lines: say(
        'Das Foyer von Quantum. Marmor, Glas und eine Stille, die Geld kostet. Deine Schritte hallen, als wolle der Boden sich über dich beschweren.',
        'Hinter dem Empfang leuchtet das Logo wie ein Zielfernrohr. Links ein Glaskasten voller Monitore, rechts ein goldener Aufzug. Und mitten im Raum flimmert ein Hologramm-Podest.',
      ),
      choices: [
        { text: 'Nicht anstarren. Aussehen, als gehöre man hierher.', next: 'cool' },
        { text: '„Schick. Wie ein Krankenhaus für Leute, die nie krank werden.“' },
      ],
    }, {
      id: 'cool',
      lines: say('Du gehst los wie jemand mit einem Termin. Ein Reinigungsroboter weicht dir aus. Respekt. Oder Programmierung. Bei Quantum ist das dasselbe.'),
    }],
  },

  // Gästelisten-Pult (main-3-einlass): gc-41 [Technik 7] Liste ändern; ohne Check mit prep_gaesteliste,
  // chrome-einladung oder party-ausweis.
  'foyer-gaesteliste': {
    id: 'foyer-gaesteliste',
    start: 'a',
    nodes: [
      {
        id: 'a',
        lines: [
          { speaker: 'narrator', text: 'Am Pult steht ein Droide mit Fliege und Touchscreen-Gesicht. Hinter ihm der Gästeaufzug, gläsern, mit Samtkordel davor.' },
          { speaker: 'narrator', text: '„Guten Abend. Ihr Name, bitte. Und bitte nicht lügen, ich habe heute schon vier Mal ‚Blade Nocturne‘ gehört. Einer davon war ein Hund.“' },
        ],
        choices: [
          { text: 'Den Namen nennen, den Nyra und Collin auf die Liste geschmuggelt haben.', when: { flag: 'prep_gaesteliste' }, next: 'liste' },
          { text: 'Die Chrome-Einladung hinhalten.', when: { item: 'chrome-einladung' }, next: 'liste' },
          { text: 'Den Party-Ausweis auf den Scanner legen.', when: { item: 'party-ausweis' }, next: 'liste' },
          { text: 'Ablenken und kurz auf den Bildschirm tippen.', check: 'gc-41', next: 'hack' },
          { text: '„Ich suche nur die Toiletten.“', next: 'nein' },
        ],
      },
      {
        id: 'liste',
        lines: [
          { speaker: 'narrator', text: 'Der Droide scannt. Er blinkt grün. Er macht eine winzige Verbeugung, die nur ein Droide mit Fliege so beleidigend höflich hinbekommt.' },
          { speaker: 'narrator', text: '„Willkommen, verehrter Gast. Der Aufzug bringt Sie in den Himmelsgarten. Bitte füttern Sie keine Pudel.“' },
        ],
        effects: [{ setFlag: 'einlass_gaesteliste' }, { xp: 30 }, { message: 'Der Gästeaufzug ist frei.' }],
      },
      {
        id: 'hack',
        lines: [
          { speaker: 'player', text: 'Oh, ist das da hinten nicht Seraphina Chrome? Ohne Schuhe?' },
          { speaker: 'narrator', text: 'Der Droide dreht den Kopf um 180 Grad. Du tippst. Neuer Eintrag, ganz oben, Kategorie „Ehrengast, nicht ansprechen“.' },
          { speaker: 'narrator', text: '„Ich sehe niemanden ohne Schuhe. Oh. Sie stehen auf der Liste. Ganz oben. Verzeihung, Ehrengast.“' },
        ],
        effects: [{ setFlag: 'einlass_gaesteliste' }, { xp: 40 }],
      },
      {
        id: 'nein',
        lines: [
          { speaker: 'narrator', text: '„Die Toiletten sind hinter dem Empfang. Die Party nicht.“' },
          { speaker: 'narrator', text: 'Andere Wege rein: Kessel am roten Teppich draußen, das Catering hinter der Schwingtür, oder das Lüftungsgitter am Sockel des Spire.' },
        ],
      },
    ],
  },

};

export const part: ContentPart = {
  maps: { 'quantum-foyer': foyer },
  dialogues,
};
