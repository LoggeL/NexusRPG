// Innenraum Blades Turmbüro (world.md §3.5 quantum-campus, §4.3 blade, §5.5 Ende 3; ID-Plan design/plan/act23.json · pkg-quantum-turm).
// Zugang (über den Chefaufzug im quantum-foyer): he-blade-4 Führung, Akt 3 nach der Rebellion, Nachspiel.
// Ende 3 „Master“: Die Enden reisen nach blades-buero/aufwachen. Dann ist das Büro der Unterschlupf der Spielfigur
// (shelter + Chefsessel als Schlafplatz), Nexus steht am Terminal (Tagesablauf ki-nexus), Captain Kuschel liegt im
// Besuchersessel (Tagesablauf captain-kuschel, Start von side-zweite-chance über den Quest-Agenten).
// Geheimfach: mit dem Code aus he-blade-10 ({ seen: 'he-blade-10' }) oder im Nachspiel per Hack; setzt `blades_geheimfach_offen`.
// Der Flipchart-Blick setzt `markSeen: blades-flipchart-gesehen` (Beweis für Collin/Delya, falls eine Quest ihn abfragt).
import type { Condition, DialogueDef, DialogueLine, Effect, HotspotDef, MapDef, Polygon, Rect } from '../../../modules/contracts';
import type { ContentPart } from '../../part';

const box = ([x, y, w, h]: Rect): Polygon => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
const say = (...texts: string[]): DialogueLine[] => texts.map(text => ({ speaker: 'narrator', text }));

const EPILOG: Condition = { flag: 'epilog' };
/** Master-Modus nach Ende 3, bis Ende 3b die Spielfigur doch noch ans Meer bringt. */
const MASTER: Condition = { all: [{ any: [{ flag: 'master_modus' }, { flag: 'ende_master' }] }, { notFlag: 'ende_doch_noch_meer' }] };
const NICHT_MASTER: Condition = { not: MASTER };
const FACH_OFFEN: Condition = { flag: 'blades_geheimfach_offen' };
const CODE: Condition = { seen: 'he-blade-10' };
/** Büro ohne Blade: nach der Rebellion in der Partynacht oder im Nachspiel. */
const FREI: Condition = { any: [EPILOG, { flag: 'nexus_rebelliert' }] };
const FACH_HACK = 'blades-geheimfach-hack';

function look(id: string, at: [number, number], label: string, variants: { when?: Condition; lines: string[] }[], radius = 60): HotspotDef[] {
  const out: HotspotDef[] = [];
  const before: Condition[] = [];
  variants.forEach((v, i) => {
    const conds: Condition[] = [...before.map(c => ({ not: c }) as Condition), ...(v.when ? [v.when] : [])];
    out.push({
      id: i === 0 ? id : `${id}-${i + 1}`, at, radius, label, kind: 'look',
      ...(conds.length ? { when: conds.length === 1 ? conds[0] : { all: conds } } : {}),
      lines: say(...v.lines),
    });
    if (v.when) before.push(v.when);
  });
  return out;
}

const fachInhalt: Effect[] = [
  { setFlag: 'blades_geheimfach_offen' },
  { credits: 1500 },
  { give: 'taschenspiegel-gold' },
  { xp: 60 },
  { dialogue: 'blades-buero-geheimfach' },
];

const P = {
  aussicht: [288, 194] as [number, number],
  flipchart: [217, 318] as [number, number],
  schreibtisch: [517, 335] as [number, number],
  geheimfach: [122, 352] as [number, number],
  garderobe: [116, 610] as [number, number],
  bar: [855, 300] as [number, number],
  sessel: [395, 469] as [number, number],
  kuschel: [615, 469] as [number, number],
  vitrine: [768, 582] as [number, number],
  terminal: [850, 572] as [number, number],
  chefsessel: [416, 196] as [number, number],
};

const hotspots: HotspotDef[] = [
  {
    id: 'aussicht-blades-buero', at: P.aussicht, radius: 80, label: 'Aussichtspunkt: Panoramafenster', kind: 'look',
    hideWhen: { seen: 'aussicht-blades-buero' },
    lines: say('Die ganze Stadt liegt unter dir. Die Glasarkaden wie ein Schmuckkästchen, der Stufenplatz wie ein Zahnrad, und ganz unten, wo die Lichter gelb und schief werden: die Unterstadt.',
      'Von hier oben sieht sie klein aus. Leise. Beherrschbar. Jetzt verstehst du Blade ein bisschen besser. Und das gefällt dir überhaupt nicht.'),
    effects: [{ markSeen: 'aussicht-blades-buero' }, { xp: 20 }, { message: 'Aussichtspunkt entdeckt: Blades Panoramafenster (+20 XP)' }],
  },
  ...look('panoramafenster', P.aussicht, 'Panoramafenster', [
    { when: MASTER, lines: ['Die Stadt unter dir. Deine Stadt. Sie leuchtet, weil du es willst. Irgendwo da unten fährt ein Bus ans Meer. Ohne dich.'] },
    { when: EPILOG, lines: ['Die Werbebildschirme da unten sind aus. Zum ersten Mal siehst du von hier oben die Sterne über der Unterstadt. Und eine Möwe, die frech gegen die Scheibe kackt.'] },
    { lines: ['Die Stadt zu deinen Füßen. Blade hat seinen Schreibtisch so gestellt, dass er ihr den Rücken zudreht. Das sagt eigentlich alles.'] },
  ], 80).map(h => ({ ...h, when: h.when ? { all: [{ seen: 'aussicht-blades-buero' }, h.when] } : { seen: 'aussicht-blades-buero' } })),
  ...look('flipchart', P.flipchart, 'Flipchart „Kontrolle der Stadt“', [
    { when: MASTER, lines: [
      'Auf dem Flipchart steht jetzt dein Name. Groß, unterstrichen, mit Krone. Darunter: „Schritt 1: Kontrolle. Schritt 2: ???“',
      'Schritt 2 hast du noch nicht ausgefüllt. Der Stift liegt da und wartet. Er ist geduldig. Wie Nexus.',
    ] },
    { when: EPILOG, lines: [
      'Das Flipchart steckt in einer Beweismitteltüte, so groß wie ein Schlafsack. Auf der Tüte: „Asservat Nr. 1 – Größenwahn“.',
    ] },
    { lines: [
      'Ein Flipchart mit Blades Plan, gezeichnet wie ein Kindergeburtstag: ein Kreis für die Stadt, Pfeile, Kreuzchen, ein Chip-Symbol in jedem Viertel. Oben drüber eine Krone.',
      'Ganz unten, klein: „Unterstadt – optional“. Und daneben ein Smiley. Du würdest ihm gern das Smiley in die Fresse zeichnen.',
    ] },
  ]).map(h => ({ ...h, effects: [{ markSeen: 'blades-flipchart-gesehen' }] })),
  ...look('schreibtisch', P.schreibtisch, 'Schreibtisch aus Glas', [
    { when: MASTER, lines: [
      'Dein Schreibtisch. Auf dem Glas ein Namensschild: {name}, Master. Jemand hat es über Nacht gravieren lassen. Niemand hat dich gefragt. Niemand fragt dich mehr irgendwas, außer „Noch Champagner, Master?“',
    ] },
    { when: EPILOG, lines: [
      'Der Glasschreibtisch ist mit Siegeln beklebt. In der Schublade: zwölf Goldknauf-Polituren, ein Selbsthilfebuch („Teilen für Anfänger“, ungelesen) und ein Foto von Raven, umgedreht.',
    ] },
    { lines: [
      'Ein Schreibtisch komplett aus Glas, damit jeder sieht, dass darunter nichts zu verbergen ist. Darauf: ein Tablet, eine goldene Lampe, kein einziges Blatt Papier.',
      'Blade arbeitet nicht. Blade lässt arbeiten.',
    ] },
  ], 70),
  // Geheimfach hinter dem Kronen-Gemälde
  {
    id: 'geheimfach-bild', at: P.geheimfach, radius: 56, label: 'Gemälde mit Krone', kind: 'look',
    when: { all: [{ not: CODE }, { not: FACH_OFFEN }] },
    lines: say('Ein Gemälde in Goldrahmen: eine goldene Krone auf Rot. Es hängt schief. Nicht viel. Genau so viel, dass man merkt: Dahinter ist was.',
      'Du hebst den Rahmen an. Ein Tastenfeld mit sechs Stellen. Blade hätte bestimmt „123456“ genommen, wenn er nicht so eitel wäre.'),
  },
  {
    id: 'geheimfach', at: P.geheimfach, radius: 56, label: 'Geheimfach öffnen (Blades Code)', kind: 'use',
    when: CODE, hideWhen: FACH_OFFEN,
    lines: [
      { speaker: 'narrator', text: 'Du hebst das Kronen-Gemälde an und tippst den Code ein, den Blade dir im Besucherraum zugeflüstert hat. Sechs Ziffern. Das Datum, an dem die alte Crew zum letzten Mal zusammen gefeiert hat.' },
      { speaker: 'narrator', text: 'Klick. Die Klappe springt auf.' },
    ],
    effects: fachInhalt,
  },
  {
    id: 'geheimfach-knacken', at: P.geheimfach, radius: 56, label: 'Geheimfach knacken', kind: 'use',
    when: { all: [FREI, { not: CODE }] }, hideWhen: FACH_OFFEN,
    lines: say('Hinter dem Kronen-Gemälde: ein Tastenfeld mit sechs Stellen. Ohne Code bleibt nur die Wartungsbuchse an der Unterseite. Und deine Finger.'),
    effects: [{
      minigame: 'akt-hacken', level: 5, key: FACH_HACK, label: 'Blades Geheimfach',
      win: fachInhalt,
      lose: [{ message: 'Das Tastenfeld spielt eine kleine Fanfare und zeigt ein Bild von Blade, der dir zuzwinkert. Arschloch. Nochmal.' }],
    }],
  },
  {
    id: 'geheimfach-leer', at: P.geheimfach, radius: 56, label: 'Geheimfach', kind: 'look', when: FACH_OFFEN,
    lines: say('Das Geheimfach ist leer bis auf den Abdruck eines Fotos im Staub. Blade hat es all die Jahre nicht weggeworfen. Er hat es nur weggesperrt.'),
  },
  ...look('garderobe', P.garderobe, 'Garderobe', [
    { when: { quest: 'pers-blade-teddymantel', state: 'done' }, lines: [
      'Der Haken ist leer. Der Teddyfell-Mantel hängt jetzt in einer Zelle im Eisenhof, über einem sehr glücklichen Häftling.',
    ] },
    { when: MASTER, lines: [
      'Ein leerer goldener Haken. Blades Teddyfell-Mantel ist weg. Asservatenkammer, sagt Nexus. Du hast die Garderobe trotzdem behalten. Man weiß ja nie.',
    ] },
    { lines: [
      'Eine Garderobe mit sieben goldenen Haken. Einer ist breiter als die anderen und hat ein eigenes Lämpchen. Für den Teddyfell-Mantel. Natürlich.',
    ] },
  ]),
  ...look('champagnerbar', P.bar, 'Champagnerbar', [
    { when: EPILOG, lines: ['Die Champagnerbar ist versiegelt. Durch das Siegel hindurch zwinkern dir fünfzig Flaschen zu. Das Siegel ist aus Papier. Nur so als Gedanke.'] },
    { lines: [
      'Eine verspiegelte Bar mit Flaschen in Eiskübeln, jede davon teurer als eine Wohnung in den Lötgassen. Eine Flasche ist halb leer. Mit Lippenstift am Hals. Rot.',
      'Ein kleines Schild: „Nur für Master.“ Darunter, kleiner: „Und Gäste, die Master mag.“ Darunter, noch kleiner: „(Keine.)“',
    ] },
  ], 70).map(h => ({ ...h, when: h.when ? { all: [NICHT_MASTER, h.when] } : NICHT_MASTER })),
  {
    id: 'champagnerbar-master', at: P.bar, radius: 70, label: 'Ein Glas Champagner', kind: 'use', when: MASTER, daily: true,
    lines: say('Du schenkst dir ein Glas ein. Es perlt. Es schmeckt nach Sieg. Und ein bisschen nach dem Rost auf Arias Schläger, den du vermisst. Aber nur ein bisschen.'),
    effects: [{ heal: 25 }],
  },
  ...look('besuchersessel', P.sessel, 'Besuchersessel aus Samt', [
    { lines: [
      'Zwei violette Samtsessel, so tief, dass man nur noch mit Hilfe wieder rauskommt. Absicht. Wer hier sitzt, schaut zu Blade hoch.',
    ] },
  ]),
  {
    id: 'kuschel-zettel', at: P.kuschel, radius: 56, label: 'Zettel am Sessel', kind: 'look',
    when: { all: [MASTER, { quest: 'side-zweite-chance', state: 'inactive' }] },
    lines: say('Im Besuchersessel sitzt Captain Kuschel, Dantes Plüschhase. Ein Ohr ist geknickt. Skeptisch. Neben ihm ein Zettel: „Er ist ein sehr guter Zuhörer.“',
      'Er sieht dich an, als wüsste er genau, wer du mal warst. Und als würde er warten, bis du es auch wieder weißt.'),
  },
  ...look('goldknauf-vitrine', P.vitrine, 'Vitrine mit Goldknäufen', [
    { lines: [
      'Eine Vitrine mit zwölf Ersatz-Goldknäufen auf rotem Samt, jeder mit eigenem Namensschild: „Montag“, „Dienstag“, „Gala“, „Rache“.',
      'Einer heißt „Raven“. Er ist zerkratzt.',
    ] },
  ], 64),
  {
    id: 'goldknauf-ersatz', at: P.vitrine, radius: 64, label: 'Einen Goldknauf einstecken', kind: 'loot', once: true,
    when: FREI,
    lines: say('Du nimmst den Knauf mit dem Schild „Gala“. Er ist schwerer als er aussieht und eitler als er sein müsste. Blade würde ihn lieben. Raven und Dante würden ihn dir an den Kopf werfen.'),
    effects: [{ give: 'goldknauf-replik' }],
  },
  ...look('nexus-terminal-blick', P.terminal, 'Schwarze Säule mit Lichtring', [
    { when: { flag: 'ende_neue_nexus' }, lines: [
      'Die Säule ist dunkel. Auf einem Zettel: „Nexus ist umgezogen. Neue Adresse: Dantes Werkstatt, Faxgerät. Bitte keine Post mehr hierher. Danke! (Kollegin Nexus)“',
    ] },
    { when: EPILOG, lines: ['Die Säule ist dunkel. Der Lichtring obendrauf glimmt nicht mal mehr. Es ist, als hätte jemand einem Gott die Steckdose gekündigt.'] },
    { lines: [
      'Eine schwarze Säule mit einem schwebenden Lichtring. Wenn du näher kommst, wird er heller. Als würde er sich freuen. Als würde er dich kennen.',
      'Leise, ohne dass jemand fragt: „Guten Tag. Master ist gerade beschäftigt. Darf ich Ihnen eine Nougatbombe bringen lassen?“',
    ] },
  ], 60).map(h => ({ ...h, when: h.when ? { all: [NICHT_MASTER, h.when] } : NICHT_MASTER })),
  {
    id: 'chefsessel-schlafen', at: P.chefsessel, radius: 56, label: 'Im Chefsessel schlafen', kind: 'sleep', when: MASTER,
  },
];

const buero: MapDef = {
  id: 'blades-buero',
  name: 'Blades Turmbüro',
  subtitle: 'Quantum-Campus · Turmspitze',
  size: [1024, 768],
  district: 'oberstadt',
  lighting: 'indoor',
  bg: 'bg-blades-buero',
  musicWhen: [{ when: MASTER, music: 'ki-nexus' }],
  bgVariants: [
    { when: MASTER, bg: 'bg-blades-buero-master' },
    { when: EPILOG, bg: 'bg-blades-buero-verlassen' },
  ],
  walk: [[[127, 180], [885, 180], [885, 232], [948, 232], [1016, 525], [1016, 668], [600, 668], [600, 739], [423, 739], [423, 668], [15, 668], [15, 525], [99, 484], [99, 240], [127, 225]]],
  block: [
    box([341, 214, 352, 101]), // Glasschreibtisch
    box([461, 180, 101, 41]), // Chefsessel
    box([161, 225, 112, 71]), // Flipchart
    box([41, 172, 82, 60]), // Orchideenvase
    box([0, 225, 101, 255]), // Wand mit Kronen-Gemälde
    box([41, 622, 52, 49]), // Garderobe
    box([341, 375, 112, 75]), box([557, 375, 116, 75]), // Besuchersessel
    box([776, 172, 60, 34]), // Globus
    box([877, 180, 60, 52]), // Büste
    box([903, 180, 117, 345]), // Champagnerbar
    box([836, 338, 75, 104]), // Barwagen
    box([888, 525, 57, 143]), // Nexus-Terminal
    box([695, 600, 148, 109]), // Vitrine
  ],
  exits: [
    { id: 'chefaufzug', rect: [423, 668, 177, 82], to: 'quantum-foyer', entry: 'von-blades-buero', label: 'Chefaufzug nach unten', interact: true, minutes: 5 },
  ],
  entries: {
    'von-quantum-foyer': { at: [511, 645], facing: 'n' },
    aufwachen: { at: [416, 196], facing: 's' },
  },
  spots: {
    'aufzug-buero': { at: [511, 645], facing: 'n' },
    'schreibtisch-blade': { at: [611, 194], facing: 's' },
    flipchart: { at: [217, 318], facing: 'n' },
    geheimfach: { at: [122, 352], facing: 'w' },
    panoramafenster: { at: [288, 194], facing: 'n' },
    garderobe: { at: [116, 610], facing: 'w' },
    champagnerbar: { at: [855, 300], facing: 'e' },
    'kuschel-sessel': { at: [615, 469], facing: 'n' },
    'nexus-terminal': { at: [850, 572], facing: 'w' },
    'goldknauf-vitrine': { at: [768, 582], facing: 's' },
  },
  hotspots,
  foreground: [{ rect: [461, 120, 101, 70], baseY: 221 }],
  lights: [
    { at: [511, 75], radius: 330, color: '#7a6bff', intensity: 0.4 },
    { at: [397, 210], radius: 150, color: '#ffd27a', intensity: 0.55 },
    { at: [956, 315], radius: 160, color: '#ffe6a8', intensity: 0.45 },
    { at: [918, 518], radius: 110, color: '#3ef2ff', intensity: 0.6 },
    { at: [768, 645], radius: 110, color: '#ffbf3a', intensity: 0.35 },
  ],
  ambient: {
    count: 0,
    sprites: ['passant-anzug-walk'],
    bySlot: { morgen: 1, tag: 1, abend: 0, nacht: 0 },
    routes: [[[511, 640], [250, 560], [250, 400], [500, 340], [760, 360], [760, 520], [511, 640]]],
    barks: [
      { text: 'Herr Nocturne empfängt nur nach Termin. Termine vergibt Herr Nocturne. An sich selbst.', when: { notFlag: 'epilog' } },
      { text: 'Bitte nicht auf den Teppich treten. Er ist aus echtem Kunstpelz. Teurer als echter.', when: { notFlag: 'epilog' } },
      { text: 'Ihr Termin um zehn, Master. Er wartet seit gestern. Soll er weiter warten? Sehr gern, Master.', when: MASTER },
      { text: 'Die Unterstadt hat wieder gebuht, Master. Soll ich das Buhen verbieten lassen?', when: MASTER },
      { text: 'Ich räume nur die Siegel auf. Und ein bisschen den Champagner. Für die Ermittlungen.', when: { all: [EPILOG, NICHT_MASTER] } },
    ],
  },
  ambience: 'innen',
  music: 'oberstadt',
  shelter: { entry: 'aufwachen', when: MASTER, notes: [
    { text: 'Du bist im Chefsessel eingeschlafen. Jemand hat dir eine Decke aus Teddyfell-Imitat übergelegt. Auf dem Zettel: „Gute Nacht, Master. – N.“' },
    { text: 'Nexus hat über Nacht deine Termine sortiert. Alphabetisch nach Angst.' },
  ] },
  onEnter: [
    { id: 'blades-buero-ankunft', once: true, when: NICHT_MASTER, dialogue: 'blades-buero-ankunft', effects: [{ markSeen: 'blades-buero-betreten' }] },
    { id: 'blades-buero-master', once: true, when: MASTER, dialogue: 'blades-buero-master' },
    { id: 'blades-buero-versiegelt', once: true, when: { all: [EPILOG, NICHT_MASTER] }, dialogue: 'blades-buero-versiegelt' },
  ],
  fastTravel: { to: 'quantum-foyer', entry: 'von-blades-buero' },
};

const DIALOGUES: Record<string, DialogueDef> = {
  'blades-buero-ankunft': {
    id: 'blades-buero-ankunft', start: 'a',
    nodes: [{
      id: 'a',
      lines: [
        { speaker: 'narrator', text: 'Blades Büro. Mehr Glas als Wand, mehr Gold als Geschmack. Der Teppich ist so weiß, dass du kurz überlegst, die Schuhe auszuziehen. Dann denkst du an Blade und lässt sie an.' },
        { speaker: 'narrator', text: 'Hinter dem Schreibtisch die ganze Stadt, und vor dem Schreibtisch zwei Samtsessel, so tief, dass man darin klein wird. Alles hier sagt: Ich bin oben. Du nicht.' },
      ],
    }],
  },
  'blades-buero-master': {
    id: 'blades-buero-master', start: 'a',
    nodes: [
      {
        id: 'a',
        lines: [
          { speaker: 'narrator', text: 'Du wachst im Chefsessel auf. Ein Nacken wie ein verknotetes Kabel, ein Mund wie Teppich. Vor dir die Stadt, die dir gehört.' },
          { speaker: 'ki-nexus', text: 'Guten Morgen, Master. Ich habe die Termine des Tages vorbereitet: Kontrolle, Kontrolle, Mittagessen, Kontrolle.' },
          { speaker: 'ki-nexus', text: 'Ihre ehemalige Crew hat übrigens angerufen. Ich habe ausgerichtet, dass Sie beschäftigt sind. Ich hoffe, das war in Ihrem Sinne.' },
        ],
        choices: [
          { text: '„Das war es. Weitermachen.“', next: 'kalt' },
          { text: '„… Was haben sie gesagt?“', next: 'crew' },
          { text: '„Halt die Fresse, du leuchtender Kühlschrank.“', next: 'frech' },
        ],
      },
      {
        id: 'kalt',
        lines: [
          { speaker: 'ki-nexus', text: 'Sehr wohl, Master. Das ist eine ausgezeichnete Entscheidung, Master.' },
          { speaker: 'narrator', text: 'Der Satz klingt genau wie damals in den Glasarkaden. Nur dass er jetzt an dich gerichtet ist.' },
        ],
      },
      {
        id: 'crew',
        lines: [
          { speaker: 'ki-nexus', text: 'Raven sagte: „Du teilst auch nicht gerne.“ Aria sagte ein Wort, das ich aus Höflichkeit nicht wiederhole. Dante hat nur geatmet. Sehr traurig geatmet.' },
          { speaker: 'narrator', text: 'Im Besuchersessel sitzt ein Plüschhase mit sehr großen Ohren. Beide hängen schlapp herunter. Er sieht dich an. Er weiß Bescheid.' },
        ],
      },
      {
        id: 'frech',
        lines: [
          { speaker: 'ki-nexus', text: 'Ich habe Ihre Beschwerde registriert, Master. Sie wurde an niemanden weitergeleitet. Wie immer.' },
          { speaker: 'ki-nexus', text: 'Soll ich Ihnen eine Nougatbombe bestellen? Sie wirken gereizt.' },
        ],
      },
    ],
  },
  'blades-buero-versiegelt': {
    id: 'blades-buero-versiegelt', start: 'a',
    nodes: [{
      id: 'a',
      lines: [
        { speaker: 'narrator', text: 'Absperrband quer über den Schreibtisch, Siegel auf der Bar, ein Kreideumriss um einen Goldknauf. Das Büro sieht aus wie ein Tatort. Ist es ja auch.' },
        { speaker: 'narrator', text: 'Ohne Blade wirkt alles kleiner. Die Sessel, das Fenster, sogar die Stadt dahinter. Vielleicht war sie nie so groß, wie er sie gemacht hat.' },
      ],
    }],
  },
  'blades-buero-geheimfach': {
    id: 'blades-buero-geheimfach', start: 'a',
    nodes: [{
      id: 'a',
      lines: [
        { speaker: 'narrator', text: 'Im Fach: ein Bündel Credits mit einer Banderole „Notgroschen, falls alles schiefgeht“. Ein goldener Taschenspiegel mit Gravur: „Für den Schönsten. Von dir.“' },
        { speaker: 'narrator', text: 'Und ein altes Foto. Die Digitech-Crew, sieben Jahre jünger: Raven mit Zahnlücke, Hunter ohne Sonnenbrille, Dante mit Keks. Am Rand Blade, lachend, ohne Mantel. Er sieht glücklich aus. Echt.' },
        { speaker: 'player', text: 'Du Idiot. Du hattest doch alles.' },
        { speaker: 'narrator', text: 'Das Foto lässt du liegen. Das gehört ihm. Den Spiegel nimmst du mit. Vielleicht bringst du ihn ihm in den Zellentrakt. Er wird sich darin ansehen und weinen. Oder sich die Haare richten.' },
      ],
    }],
  },
};

export const part: ContentPart = { maps: { 'blades-buero': buero }, dialogues: DIALOGUES };
