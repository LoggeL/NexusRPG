// Zone Quantum-Campus (Oberstadt, Akt 2 außen und Bruch, Akt 3 Party, Nachspiel) – Paket pkg-quantum-campus.
// ID-Plan: design/plan/act23.json maps.quantum-campus (Ausgänge, Einstiege, Spots exakt so).
// Akt-2-Start: Einstieg bruch-treffpunkt (main-2-bruch), Akt-3-Start: Einstieg party-vorplatz (main-3-einlass).
// Der Bruch (main-2-bruch) läuft über eigene Reise-Hotspots der Quest (quest-main-2, Präfix m2b-) an den Spots
// seiteneingang, lueftungsgitter, haupttor, brueckenkopf; die Ausgänge hier öffnen daher erst ab Akt 3 bzw. im Nachspiel,
// und die Blick-Hotspots dort blenden sich im Bruch aus. Einlass zur Party (main-3-einlass): Haupteingang mit Kessel
// und Lüftung (gc-40) hier, Gästeliste und Catering im Foyer – alle setzen die Flags einlass_*.
// Frei gelassen für Quest-Agenten (Hotspot-IDs aus dem Plan): kamera-west, kamera-ost, scheinwerfer (Bruch-Overwatch),
// altlager-tor, loeschtank (side-alesas-zuendholz). Die Zone legt dort nur Blick-Hotspots mit eigenen IDs an.
import type { Condition, DialogueDef, HotspotDef, MapDef } from '../../../modules/contracts';
import type { ContentPart } from '../../part';

const BRUCH: Condition = { quest: 'main-2-bruch', state: 'active' };
const EPILOG: Condition = { flag: 'epilog' };
const ACT3: Condition = { act: 3 };
const EINLASS: Condition = { quest: 'main-3-einlass', state: 'active' };
/** Partynacht: Akt 3, aber noch nicht im Nachspiel. */
const PARTY: Condition = { all: [ACT3, { not: EPILOG }] };
/** Gewöhnlicher Akt-2-Alltag auf dem Außengelände (kein Bruch, keine Party). */
const ALLTAG2: Condition = { all: [{ act: 2 }, { not: ACT3 }, { not: BRUCH }] };
/** Irgendein Einlassweg der Party ist geschafft (Flags aus act23.json „flags.act3“). */
const EINLASS_GESCHAFFT: Condition = {
  any: [
    { flag: 'einlass_haupteingang' }, { flag: 'einlass_catering' }, { flag: 'einlass_lueftung' },
    { flag: 'einlass_gaesteliste' }, { flag: 'einlass_wache' }, { flag: 'einlass_kampf' }, { flag: 'einlass_presse' },
    { won: 'enc-einlass-kontrolle' }, { quest: 'main-3-einlass', state: 'done' },
  ],
};
const say = (...texts: string[]) => texts.map(text => ({ speaker: 'narrator' as const, text }));

const loot = (id: string, at: readonly [number, number], label: string, text: string, when?: Condition): HotspotDef => ({
  id, at, radius: 52, label, kind: 'loot', once: true, ...(when ? { when } : {}),
  lines: say(text),
  effects: [{ give: id }],
});

const hotspots: HotspotDef[] = [
  // --- Spire und Foyer-Front ----------------------------------------------------------------------------------
  {
    id: 'spire', at: [575, 262], radius: 60, label: 'Quantum-Spire', kind: 'look',
    lines: say(
      'Der Quantum-Spire. Ein Glasfinger, der dem Himmel den Stinkefinger zeigt. Ganz oben pulsiert die Spitze violett, ruhig wie ein Herzschlag. Einer, der dir nicht gehört.',
      'Von hier unten sieht man keine Fenster, nur Spiegelung. Der Turm guckt nicht raus. Er guckt dich an.',
    ),
  },
  {
    id: 'spire-nacht', at: [575, 262], radius: 60, label: 'Violettes Pulsieren', kind: 'look',
    when: { all: [{ flag: 'nexus_erwacht' }, { not: EPILOG }] },
    lines: say('Seit dem Bruch pulsiert die Spitze schneller. Als hätte jemand dem Turm einen Kaffee gegeben. Oder einen Grund.'),
  },
  {
    id: 'spire-nachspiel', at: [575, 262], radius: 60, label: 'Der Spire, ganz ruhig', kind: 'look',
    when: EPILOG,
    lines: say('Die Spitze leuchtet jetzt in einem müden Blau. Jemand hat einen Wimpel an die Glasfront geklebt. Er hält. Gegen jede Firmenrichtlinie.'),
  },
  {
    id: 'foyer-front', at: [872, 290], radius: 60, label: 'Drehtür aus Panzerglas', kind: 'look',
    when: { all: [ALLTAG2, { noItem: 'blades-visitenkarte' }, { noItem: 'xion-passierschein' }] },
    lines: say(
      'Hinter der Drehtür leuchtet das Foyer wie ein Aquarium für reiche Fische. Ein riesiges Logo dreht sich hinter Glas, sehr langsam, sehr selbstverliebt.',
      'Rein kommst du hier nur mit Termin, Visitenkarte oder einer sehr guten Ausrede. Du hast nichts davon. Noch nicht.',
    ),
  },

  // --- Seiteneingang (Personalschleuse) -----------------------------------------------------------------------
  {
    id: 'kartenleser-blick', at: [1130, 266], radius: 52, label: 'Kartenleser', kind: 'look',
    when: { not: BRUCH },
    lines: say('Ein Kartenleser, der rot blinkt. Darunter klebt ein Kaugummi in Form eines Herzens. Romantik auf Konzernart: klebrig und ohne Zugang.'),
  },

  // --- Lüftungsgitter am Sockel des Spire --------------------------------------------------------------------
  {
    id: 'lueftung-party', at: [630, 266], radius: 52, label: 'Lüftungsschacht: hineinklettern', kind: 'check', check: 'gc-40',
    when: { all: [EINLASS, { not: EINLASS_GESCHAFFT }] },
    lines: say(
      'Drinnen läuft die Party, draußen läuft die Lüftung. Das Gitter ist frisch verschraubt, aber die Schrauben sind für Partygäste gemacht, nicht für dich.',
    ),
    altText: 'Zu steif für den Schacht. Andere Wege: Kessel am roten Teppich, die Gästeliste im Foyer oder das Catering.',
    effects: [
      { setFlag: 'einlass_lueftung' }, { xp: 30 },
      { message: 'Du kriechst durch den Schacht. Der Smoking überlebt es nicht ganz. Du schon.' },
      { travel: 'quantum-labor', entry: 'lueftung', minutes: 10 },
    ],
  },
  {
    id: 'lueftungsgitter-blick', at: [630, 266], radius: 52, label: 'Lüftungsgitter', kind: 'look',
    when: { all: [{ not: BRUCH }, { not: EINLASS }] },
    lines: say('Ein Gitter am Sockel des Spire. Warme Luft strömt raus, riecht nach Serverraum und Wochenendarbeit. Das Gitter ist verschraubt, und zwar ernsthaft.'),
  },

  // --- Haupteingang: roter Teppich, Einlasskontrolle (main-3-einlass) -----------------------------------------
  {
    id: 'einlass-haupteingang', at: [872, 300], radius: 64, label: 'Einlasskontrolle am roten Teppich', kind: 'talk',
    when: { all: [EINLASS, { not: EINLASS_GESCHAFFT }] },
    dialogue: 'campus-einlass-haupteingang',
  },
  {
    id: 'roter-teppich', at: [872, 300], radius: 64, label: 'Roter Teppich', kind: 'look',
    when: { all: [PARTY, EINLASS_GESCHAFFT] },
    lines: say('Der rote Teppich ist voller Absatzlöcher und Champagnerflecken. Ein Butler-Droide saugt ihn ab, während Leute darauf stehen. Er entschuldigt sich bei jedem Schuh einzeln.'),
  },
  {
    id: 'haupttor', at: [765, 866], radius: 60, label: 'Haupttor mit Schranke', kind: 'look',
    when: { not: BRUCH },
    lines: say(
      'Eine Schranke, rot-weiß, poliert. Sie geht hoch für Limousinen und runter für alles mit Rost. Daneben ein Schild: „Willkommen bei Quantum. Bitte lächeln, Sie werden gefilmt.“',
    ),
  },

  // --- Wiese, Brunnen, Pausenraum ----------------------------------------------------------------------------
  {
    id: 'brunnen', at: [793, 612], radius: 70, label: 'Leuchtbrunnen', kind: 'look',
    lines: say(
      'Ein Brunnen, dessen Wasser von unten leuchtet. Wer eine Münze reinwirft, bekommt per Lautsprecher ein „Danke für Ihre Spende an Quantum“.',
      'Auf dem Grund liegen hunderte Münzen. Und ein Gebiss. Die Oberstadt hat Geheimnisse.',
    ),
  },
  {
    id: 'brunnen-muenze', at: [915, 560], radius: 40, label: 'Münze reinwerfen (1 Cr)', kind: 'use', daily: true,
    when: { credits: 1 },
    effects: [
      { credits: -1 },
      { message: '„Danke für Ihre Spende an Quantum. Ihr Wunsch wurde gespeichert und wird gegebenenfalls ausgewertet.“' },
    ],
  },
  {
    id: 'campus-wiese', at: [470, 560], radius: 72, label: 'Geometrische Wiese', kind: 'look',
    when: { not: { quest: 'side-offene-werkstatt', state: 'done' } },
    lines: say('Ein Rasenstück, exakt quadratisch, exakt grün. Ein kleiner Roboter fährt drüber und schneidet jeden Halm auf 31 Millimeter. Ein Gänseblümchen hat sich versteckt. Respekt.'),
  },
  {
    id: 'campus-wiese-werkstatt', at: [470, 560], radius: 72, label: 'Offene Werkstatt', kind: 'look',
    when: { quest: 'side-offene-werkstatt', state: 'done' },
    lines: say(
      'Wo früher der Rasenroboter seine Runden drehte, stehen jetzt Stände: Lötzinn, Schrauben, Gustavs Werkbank, Pims Tisch mit sehr kleinen Schraubendrehern.',
      'Der Rasenroboter hat einen Platz bekommen. Er mäht jetzt nur noch, wenn ihn jemand höflich darum bittet.',
    ),
  },
  {
    id: 'pausenraum', at: [1380, 432], radius: 64, label: 'Pausenpavillon', kind: 'look',
    lines: say(
      'Ein Glaspavillon mit Automat, sechs weißen Stühlen und einer Tafel: „Pausen fördern die Produktivität. Pausen über 7 Minuten fördern die Kündigung.“',
    ),
  },
  {
    id: 'datenwuerfel-12', at: [1290, 428], radius: 46, label: 'Pausenautomat: Wartungsklappe hacken', kind: 'use',
    hideWhen: { item: 'datenwuerfel-12' },
    effects: [{
      minigame: 'akt-hacken', level: 2, key: 'campus-pausenautomat', label: 'Pausenautomat knacken',
      win: [
        { give: 'datenwuerfel-12' }, { xp: 15 },
        { message: 'Die Wartungsklappe springt auf. Zwischen Ersatzspiralen klemmt ein Datenwürfel. Jemand hat hier seine Überstunden versteckt.' },
      ],
      lose: [{ message: 'Der Automat spuckt dir eine Tüte Algen-Chips vor die Füße. Die Packung ist leer. Er lacht nicht, aber er denkt es.' }],
    }],
  },

  // --- Wachen, Masten, Wachhäuschen --------------------------------------------------------------------------
  {
    id: 'kamera-mast-west-blick', at: [505, 482], radius: 44, label: 'Kameramast West', kind: 'look',
    lines: say('Eine Kamera auf einem weißen Mast. Sie dreht sich nach dir um, langsam, wie eine Tante auf einer Hochzeit.'),
  },
  {
    id: 'kamera-mast-ost-blick', at: [1105, 482], radius: 44, label: 'Kameramast Ost', kind: 'look',
    lines: say('Die Ostkamera hat einen kleinen Aufkleber: ein Smiley mit Augenklappe. Irgendwer hier hat Humor. Oder hatte. Bis zum Personalgespräch.'),
  },
  {
    id: 'scheinwerfer-turm-blick', at: [412, 296], radius: 56, label: 'Wachturm mit Scheinwerfer', kind: 'look',
    lines: say(
      'Ein schlanker Wachturm mit einem Scheinwerfer, der heller ist als die Zukunft. Oben sitzt nachts eine Scharfschützin und isst Sonnenblumenkerne. Die Schalen fallen in Zeitlupe.',
    ),
  },
  {
    id: 'wachhaeuschen', at: [1022, 860], radius: 56, label: 'Wachhäuschen', kind: 'look',
    when: { not: { time: 'nacht' } },
    lines: say('Ein weißes Häuschen mit Kaffeemaschine, Monitorwand und einem Kalender mit Pudelbildern. Auf dem Dienstplan steht: „Schichtwechsel 01:00. Nicht zu spät. Pfeffer, ich meine dich.“'),
  },
  {
    id: 'datenwuerfel-14', at: [1022, 860], radius: 56, label: 'Wachhäuschen: Schublade knacken', kind: 'use',
    when: { time: 'nacht' },
    hideWhen: { item: 'datenwuerfel-14' },
    lines: say('Das Häuschen ist leer, die Wache dreht ihre Runde. In der Schreibtischschublade klappert etwas, das kein Kugelschreiber ist.'),
    effects: [{
      minigame: 'akt-schloss', level: 3, key: 'campus-wachhaeuschen', label: 'Schublade knacken',
      win: [
        { give: 'datenwuerfel-14' }, { xp: 15 },
        { message: 'Unter einem Stapel Pudelkalender: ein Datenwürfel mit der Aufschrift „Privat. Wirklich.“' },
      ],
      lose: [{ message: 'Der Dietrich bricht ab. Irgendwo pfeift eine Wache ein Lied. Es kommt näher.' }],
    }],
  },

  // --- Brückenkopf und Brücke --------------------------------------------------------------------------------
  {
    id: 'aussicht-brueckenkopf', at: [240, 190], radius: 60, label: 'Aussichtspunkt: Brückenkopf', kind: 'look',
    hideWhen: { seen: 'aussicht-brueckenkopf' },
    lines: say(
      'Vom Brückenkopf aus liegt der Campus unter dir wie ein Schachbrett, auf dem jemand nur weiße Figuren aufgestellt hat. Die Wachrunden ziehen ihre Kreise, pünktlich wie Zahnräder.',
      'Dahinter fällt die Stadt ab: Glasarkaden, Mittelring, ganz unten das Neonflackern der Unterstadt. Von hier oben sieht sie fast hübsch aus. Fast.',
    ),
    effects: [{ markSeen: 'aussicht-brueckenkopf' }, { xp: 20 }, { message: 'Aussichtspunkt entdeckt: Quantum-Campus' }],
  },
  {
    id: 'aussicht-brueckenkopf-blick', at: [240, 190], radius: 60, label: 'Blick vom Brückenkopf', kind: 'look',
    when: { seen: 'aussicht-brueckenkopf' },
    lines: say('Die Wachen drehen ihre Runde. Unten blinkt die Unterstadt. Irgendwo da unten sitzt Hunter und tut so, als würde er sich keine Sorgen machen.'),
  },
  {
    id: 'bruecke-sperre', at: [240, 48], radius: 60, label: 'Brückentor', kind: 'look',
    when: { not: { any: [EPILOG, { all: [ACT3, { quest: 'main-3-einlass', state: 'done' }] }] } },
    lines: say('Das Brückentor ist zu. Ein Schild: „Brücke gesperrt bis zur Releaseparty. Freut euch drauf.“ Darunter hat jemand ein trauriges Gesicht gemalt. Mit Lippenstift.'),
  },
  loot('chip-fragment-02', [298, 290], 'Etwas glitzert am Geländer',
    'Unter dem Glasgeländer klemmt ein winziger Chipsplitter, violett schillernd. Als hätte jemand hier oben einen Chrome-10 zertreten. Mit Absicht, hoffst du.'),

  // --- Altlager (Projekt Zündholz) ---------------------------------------------------------------------------
  {
    id: 'altlager-blick', at: [265, 720], radius: 70, label: 'Altlager', kind: 'look',
    when: { not: { quest: 'side-alesas-zuendholz', state: 'done' } },
    lines: say(
      'Das Altlager: zwei Containerhallen, älter als der Rest des Campus, und Brandflecken auf dem Beton, die keiner wegpoliert hat. Quantum versteckt hier, was nicht ins Prospekt passt.',
      'Aus der hinteren Halle kommt ein leises Knistern. Wie ein Kamin. Oder wie etwas, das gern einer wäre.',
    ),
  },
  {
    id: 'altlager-blick-danach', at: [265, 720], radius: 70, label: 'Altlager', kind: 'look',
    when: { quest: 'side-alesas-zuendholz', state: 'done' },
    lines: say('Das Altlager riecht nach nassem Ruß. Zündholz ist kalt. Jemand hat ein Schild an die Halle geschraubt: „Hier wurde nichts abgefackelt. Fast nichts.“'),
  },
  {
    id: 'loeschtank-blick', at: [285, 652], radius: 56, label: 'Löschwassertank', kind: 'look',
    lines: say('Ein roter Tank auf Stelzen, randvoll Löschwasser, mit einem Ventilrad so groß wie ein Lenkrad. Auf dem Tank steht in Schablonenschrift: „Für den Fall der Fälle“. Hier gab es offenbar schon einige Fälle.'),
  },
  loot('datenwuerfel-13', [95, 664], 'Datenwürfel im Ruß',
    'Im Ruß vor der Halle liegt ein Datenwürfel, angekokelt, aber heil. Auf dem Etikett: „Zündholz, Versuch 41. Diesmal klappt’s.“ Hat es nicht.',
    { quest: 'side-alesas-zuendholz', state: 'done' }),

  // --- Lieferzone, Drohnenrampe, Wartungsdeckel --------------------------------------------------------------
  {
    id: 'drohnenrampe', at: [1262, 818], radius: 60, label: 'Drohnenrampe', kind: 'look',
    lines: say(
      'Lieferdrohnen landen, laden ab, starten wieder, ohne Pause, ohne Gewerkschaft. Eine bleibt kurz hängen und guckt dich an, dann fliegt sie weiter. Kollegialer als die Wachen.',
    ),
  },
  loot('chip-fragment-01', [1395, 795], 'Splitter unter einer Ladeplatte',
    'Unter einer Ladeplatte klemmt ein Chipsplitter. Eine Drohne hat ihn wohl fallen lassen. Sie wird dafür keinen Ärger bekommen. Drohnen bekommen nie Ärger.'),
  {
    id: 'wartungsdeckel', at: [1175, 866], radius: 50, label: 'Gullydeckel mit Quantum-Logo', kind: 'look',
    when: { not: { flag: 'wartungsleiter_gefunden' } },
    lines: say('Ein Gullydeckel mit eingeprägtem Quantum-Logo. Selbst die Kanalisation hat hier Markenrichtlinien. Von oben geht er nicht auf. Von unten vielleicht.'),
  },
  {
    id: 'wartungsdeckel-verkeilen', at: [1175, 866], radius: 50, label: 'Deckel verkeilen', kind: 'use',
    when: { all: [{ not: { flag: 'wartungsleiter_gefunden' } }, { visited: 'datentunnel' }] },
    lines: say('Du klemmst eine leere Nougatbomben-Dose ins Scharnier. Jetzt geht der Deckel auch von oben auf. Der schnellste Weg zwischen Kanal und Konzern: eine Leiter und etwas Müll.'),
    effects: [{ setFlag: 'wartungsleiter_gefunden' }, { xp: 10 }],
  },
  {
    id: 'lieferzone-schild', at: [1333, 872], radius: 50, label: 'Lieferzone', kind: 'look',
    lines: say('Gelb-schwarze Streifen, ein Schild: „Lieferzone. Unbefugte werden optimiert.“ Der Weg führt hinunter zum alten Digitech-Areal. Die Oberstadt entsorgt ihre Vergangenheit gern bergab.'),
  },

  // --- Hecke am Zaun Ost (Bruch-Treffpunkt) ------------------------------------------------------------------
  {
    id: 'hecke-ost', at: [1428, 600], radius: 56, label: 'Hecke am Zaun', kind: 'look',
    lines: say('Eine Hecke, so akkurat geschnitten, dass sie aussieht wie eine grüne Wand. An einer Stelle ist ein Loch, genau groß genug für eine Crew mit schlechten Absichten.'),
  },
];

const campus: MapDef = {
  id: 'quantum-campus',
  name: 'Quantum-Campus',
  subtitle: 'Oberstadt',
  size: [1536, 1024],
  district: 'oberstadt',
  lighting: 'outdoor',
  bg: 'bg-quantum-campus',
  ambience: 'oberstadt',
  // Bruch: Schleichmusik; Partynacht: Releaseparty (MapDef.musicWhen).
  musicWhen: [{ when: BRUCH, music: 'schleichen' }, { when: PARTY, music: 'releaseparty' }],
  bgVariants: [
    { when: { all: [BRUCH, { flag: 'nexus_erwacht' }] }, bg: 'bg-quantum-campus-alarm' },
    { when: PARTY, bg: 'bg-quantum-campus-party' },
    { when: { quest: 'side-offene-werkstatt', state: 'done' }, bg: 'bg-quantum-campus-werkstatt' },
  ],
  walk: [
    // Weißer Platz vom Foyer bis zum Tor, Brückentreppe oben links, Altlager-Hof links (Tor im Zaun bei y 830–905),
    // Hauptstraße und Lieferstraße unten bis zum Bildrand.
    [
      [190, 0], [290, 0], [290, 195], [345, 250], [1225, 250], [1225, 240], [1455, 240], [1455, 905], [1405, 905],
      [1405, 1024], [1262, 1024], [1262, 905], [880, 905], [880, 1024], [650, 1024], [650, 905], [0, 905],
      [0, 250], [135, 250], [185, 195],
    ],
  ],
  block: [
    // Geländer der Brückentreppe
    [[176, 195], [192, 195], [160, 342], [140, 342]],
    [[284, 195], [300, 195], [347, 340], [328, 340]],
    // Wachturm, Pflanzbeet links
    [[355, 238], [470, 238], [470, 278], [355, 278]],
    [[0, 345], [105, 345], [105, 440], [0, 440]],
    // Altlager: zwei Hallen, Zaun oben und rechts (Tor unten offen), Tank, Kisten
    [[0, 462], [190, 462], [190, 645], [0, 645]],
    [[0, 682], [190, 682], [190, 872], [0, 872]],
    [[175, 452], [348, 452], [348, 472], [175, 472]],
    [[333, 452], [357, 452], [357, 828], [333, 828]],
    [[212, 472], [330, 472], [330, 614], [212, 614]],
    [[188, 594], [240, 594], [240, 642], [188, 642]],
    [[198, 742], [240, 742], [240, 794], [198, 794]],
    // Brunnen
    [[702, 452], [884, 452], [906, 526], [884, 602], [702, 602], [682, 526]],
    // Bänke mit Blumenkübeln, Kameramasten
    [[404, 424], [477, 424], [477, 478], [404, 478]],
    [[426, 640], [502, 640], [502, 702], [426, 702]],
    [[1134, 424], [1208, 424], [1208, 478], [1134, 478]],
    [[490, 428], [522, 428], [522, 466], [490, 466]],
    [[1088, 428], [1126, 428], [1126, 466], [1088, 466]],
    // Pausenpavillon, Drohnenrampe, Kistenstapel
    [[1226, 260], [1466, 260], [1466, 416], [1226, 416]],
    [[1180, 666], [1346, 666], [1346, 802], [1180, 802]],
    [[1338, 656], [1455, 656], [1455, 774], [1338, 774]],
    // Torpfosten links, Wachhäuschen
    [[584, 848], [650, 848], [650, 905], [584, 905]],
    [[880, 788], [1002, 788], [1002, 905], [880, 905]],
  ],
  foreground: [
    { rect: [355, 0, 116, 240], baseY: 278 },
    { rect: [1226, 262, 240, 64], baseY: 416 },
    { rect: [880, 788, 122, 60], baseY: 905 },
    { rect: [212, 472, 118, 80], baseY: 614 },
  ],
  exits: [
    {
      id: 'nach-chrome-boulevard', rect: [650, 996, 230, 28], to: 'chrome-boulevard', entry: 'von-quantum-campus',
      label: 'Zum Chrome-Boulevard',
    },
    {
      id: 'lieferzone', rect: [1262, 996, 143, 28], to: 'digitech-areal', entry: 'von-quantum-campus',
      label: 'Lieferzone zum Digitech-Areal',
    },
    {
      id: 'foyer-tuer', rect: [815, 222, 115, 46], to: 'quantum-foyer', entry: 'von-quantum-campus',
      label: 'Gläsernes Foyer', interact: true,
      when: { any: [ACT3, EPILOG, { item: 'blades-visitenkarte' }, { item: 'xion-passierschein' }] },
      lockedText: 'Drehtür aus Panzerglas. Sie dreht sich, du nicht. Eine Stimme: „Zutritt verweigert. Haben Sie es schon mit Freundlichkeit versucht?“',
    },
    {
      id: 'seiteneingang', rect: [1080, 212, 50, 50], to: 'quantum-foyer', entry: 'seiteneingang',
      label: 'Seiteneingang (Personalschleuse)', interact: true,
      when: { any: [ACT3, EPILOG] },
      lockedText: 'Ein Kartenleser blinkt rot. Darunter klebt ein Kaugummi in Form eines Herzens. Hilft nicht.',
    },
    {
      id: 'lueftungsschacht', rect: [600, 212, 60, 50], to: 'quantum-labor', entry: 'lueftung',
      label: 'Lüftungsschacht', interact: true,
      when: { flag: 'einlass_lueftung' },
      lockedText: 'Das Gitter ist verschraubt. Mit einem Grundriss wüsstest du, welcher Schacht nicht im Häcksler endet.',
    },
    {
      id: 'wartungsleiter', rect: [1140, 836, 70, 60], to: 'datentunnel', entry: 'von-quantum-campus',
      label: 'Wartungsleiter nach unten', interact: true,
      when: { flag: 'wartungsleiter_gefunden' },
      lockedText: 'Ein Gullydeckel mit Quantum-Logo. Von oben geht er nicht auf. Von unten vielleicht.',
    },
    {
      id: 'bruecke', rect: [190, 0, 100, 24], to: 'himmelsgarten', entry: 'von-quantum-campus',
      label: 'Fußgängerbrücke zum Himmelsgarten',
      when: { any: [{ all: [ACT3, { quest: 'main-3-einlass', state: 'done' }] }, EPILOG] },
      lockedText: 'Wachtürme, Scheinwerfer, ein Schild: „Brücke gesperrt bis zur Releaseparty. Freut euch drauf.“',
    },
  ],
  entries: {
    'von-chrome-boulevard': { at: [765, 950], facing: 'n' },
    'von-digitech-areal': { at: [1333, 950], facing: 'n' },
    'von-quantum-foyer': { at: [872, 330], facing: 's' },
    seiteneingang: { at: [1105, 296], facing: 's' },
    lueftungsschacht: { at: [630, 296], facing: 's' },
    'von-datentunnel': { at: [1120, 880], facing: 'e' },
    'von-himmelsgarten': { at: [240, 110], facing: 's' },
    'bruch-treffpunkt': { at: [1420, 560], facing: 'w' },
    'party-vorplatz': { at: [765, 830], facing: 'n' },
  },
  spots: {
    hauptallee: { at: [790, 720], facing: 'n' },
    haupttor: { at: [765, 860], facing: 'n' },
    haupteingang: { at: [872, 300], facing: 's' },
    'party-vorplatz': { at: [765, 830], facing: 'n' },
    'bruch-treffpunkt': { at: [1420, 560], facing: 'w' },
    brueckenkopf: { at: [240, 200], facing: 's' },
    'kamera-mast-west': { at: [505, 486], facing: 'n' },
    'kamera-mast-ost': { at: [1105, 486], facing: 'n' },
    'scheinwerfer-turm': { at: [412, 296], facing: 'n' },
    seiteneingang: { at: [1105, 290], facing: 'n' },
    lueftungsgitter: { at: [630, 290], facing: 'n' },
    lieferzone: { at: [1333, 880], facing: 's' },
    drohnenrampe: { at: [1262, 822], facing: 'n' },
    wartungsdeckel: { at: [1215, 870], facing: 'w' },
    patrouillenweg: { at: [1000, 640], facing: 'w' },
    'wachhaeuschen-campus': { at: [1040, 860], facing: 'w' },
    'altlager-zaun': { at: [392, 760], facing: 'w' },
    altlager: { at: [265, 720], facing: 'w' },
    loeschwassertank: { at: [285, 652], facing: 'n' },
    pausenraum: { at: [1345, 440], facing: 'n' },
    'campus-wiese': { at: [470, 560], facing: 's' },
    'spire-sockel': { at: [570, 290], facing: 'n' },
    'bruecke-nord': { at: [240, 40], facing: 'n' },
    'auftrag-a': { at: [1000, 380], facing: 's' },
    // zusätzliche Punkte
    brunnen: { at: [793, 630], facing: 'n' },
    'hecke-ost': { at: [1420, 600], facing: 'e' },
    'altlager-tor': { at: [370, 866], facing: 'w' },
  },
  hotspots,
  encounters: [
    {
      id: 'campus-patrouille', encounter: 'enc-campus-patrouille', at: [1000, 640], sprite: 'quantum-wachmann-walk', radius: 52,
      patrol: [[1000, 640], [1000, 380], [600, 380], [600, 760], [1000, 760]],
      when: { all: [ALLTAG2, { time: 'nacht' }] },
      avoid: { id: 'campus-patrouille-ausweichen', attribute: 'reflexe', threshold: 6, tags: ['schleichen'], label: '[Reflexe 6] Im Schatten der Hecken bleiben' },
    },
  ],
  lights: [
    { at: [575, 120], radius: 240, color: '#b45cff', intensity: 0.7, slots: ['abend', 'nacht'] },
    { at: [872, 190], radius: 190, color: '#dff6ff', intensity: 0.6, slots: ['abend', 'nacht'] },
    { at: [412, 110], radius: 120, color: '#fff6d8', intensity: 0.6, slots: ['abend', 'nacht'] },
    { at: [505, 330], radius: 55, color: '#ff3a3a', intensity: 0.6, slots: ['abend', 'nacht'] },
    { at: [1105, 330], radius: 55, color: '#ff3a3a', intensity: 0.6, slots: ['abend', 'nacht'] },
    { at: [793, 527], radius: 150, color: '#3ef2ff', intensity: 0.6, slots: ['abend', 'nacht'] },
    { at: [1290, 360], radius: 120, color: '#ff4fd8', intensity: 0.5, slots: ['abend', 'nacht'] },
    { at: [1262, 735], radius: 150, color: '#5ad8ff', intensity: 0.5, slots: ['abend', 'nacht'] },
    { at: [940, 850], radius: 100, color: '#ffe8b0', intensity: 0.5, slots: ['abend', 'nacht'] },
    { at: [105, 610], radius: 90, color: '#ffc36a', intensity: 0.5, slots: ['abend', 'nacht'] },
    { at: [105, 850], radius: 90, color: '#ffc36a', intensity: 0.5, slots: ['abend', 'nacht'] },
    { at: [1130, 215], radius: 40, color: '#ff2a2a', intensity: 0.6, slots: ['abend', 'nacht'] },
  ],
  ambient: {
    count: 3,
    bySlot: { morgen: 3, tag: 5, abend: 3, nacht: 1 },
    sprites: ['passant-anzug-walk', 'passant-kurier-walk', 'passant-tourist-walk', 'quantum-wachmann-walk'],
    routes: [
      [[765, 950], [765, 700], [600, 640], [700, 420], [872, 330]],
      [[1333, 950], [1333, 840], [1100, 700], [1000, 420], [1345, 440]],
      [[60, 300], [400, 320], [1000, 330], [1200, 330], [1420, 470]],
      [[460, 830], [700, 830], [700, 650], [1000, 650]],
    ],
    barks: [
      { text: 'Unterstadt? Das klingt wie eine Erkältung.', when: { not: ACT3 } },
      { text: 'Riechst du das? Das ist Erfolg. Oder der neue Bodenreiniger.', when: { not: ACT3 } },
      { text: 'Ich kann die Releaseparty kaum erwarten. Ich weiß nur nicht mehr, warum.', when: { all: [{ act: 2 }, { not: ACT3 }] } },
      { text: 'Blade sagt, Teilen ist was für Leute ohne Personal.', when: { all: [{ act: 2 }, { not: ACT3 }] } },
      { text: 'Mein Chip sagt, ich hatte heute schon genug Pause. Mein Chip ist so fürsorglich.', when: { all: [{ act: 2 }, { not: ACT3 }] } },
      { text: 'Das ist eine ausgezeichnete Entscheidung, Master.', when: { all: [{ act: 2 }, { not: EPILOG }] } },
      { text: 'Hast du gesehen, wie der Rasen heute wieder rechtwinklig ist? Wahnsinn. Einfach Wahnsinn.', when: { time: ['morgen', 'tag'] } },
      { text: 'Gästeliste? Ich bin die Gästeliste, Schätzchen.', when: PARTY },
      { text: 'Champagner mit Blattgold. Schmeckt nach nichts, aber teuer.', when: PARTY },
      { text: 'Collin ist hier! Live! Wie sitzen meine Haare? Lüg mich an.', when: PARTY },
      { text: 'Ich habe heute selbst Kaffee gekocht. Er war furchtbar. Ich bin so stolz.', when: EPILOG },
      { text: 'Hier gibt es jetzt eine Werkstatt für alle. Für ALLE! Auch für die mit Rost!', when: { quest: 'side-offene-werkstatt', state: 'done' } },
      { text: 'Halt, wer da? Ach so, nur ein Busch. Gute Nacht, Busch.', when: { time: 'nacht' } },
    ],
  },
  onEnter: [
    {
      id: 'quantum-campus-erstbesuch', once: true,
      when: { all: [{ not: BRUCH }, { not: EINLASS }] },
      dialogue: 'quantum-campus-ankunft', effects: [{ markSeen: 'quantum-campus-erstbesuch' }],
    },
  ],
};

const dialogues: Record<string, DialogueDef> = {
  'quantum-campus-ankunft': {
    id: 'quantum-campus-ankunft',
    start: 'a',
    nodes: [{
      id: 'a',
      lines: say(
        'Der Quantum-Campus. Weißer Stein, Glas, Rasen mit Lineal geschnitten. Sogar die Luft riecht nach Firmenrichtlinie.',
        'In der Mitte der Spire, die Spitze violett. Dort oben sitzt Blade. Irgendwo tiefer schläft Nexus. Oder tut so.',
      ),
      choices: [
        { text: 'Kameras zählen, Wachen zählen, Ausgänge zählen.', next: 'profi' },
        { text: '„Hübsch. Wie ein Zahnarztlächeln mit Stacheldraht.“', next: 'spruch' },
        { text: 'Weitergehen.' },
      ],
    }, {
      id: 'profi',
      lines: say('Zwei Kameramasten, ein Wachturm mit Scheinwerfer, ein Häuschen am Tor. Eine Personalschleuse rechts vom Foyer, ein Lüftungsgitter am Sockel. Und hinten links ein Zaun um etwas, das nach Brand riecht.'),
      effects: [{ xp: 10 }],
    }, {
      id: 'spruch',
      lines: say('Ein Rasenroboter hält kurz an, als hätte er dich gehört. Dann mäht er weiter. Beleidigt, aber pünktlich.'),
    }],
  },

  // Einlasskontrolle am roten Teppich (main-3-einlass): Haupteingang gc-38, [Oberstadt] automatisch (Bonus im Check),
  // Einladung/Party-Ausweis ohne Check, [Wache ♥8] Abkürzung, Gewalt (enc-einlass-kontrolle setzt Fahndung 3).
  'campus-einlass-haupteingang': {
    id: 'campus-einlass-haupteingang',
    start: 'a',
    nodes: [
      {
        id: 'a',
        lines: [
          { speaker: 'narrator', text: 'Roter Teppich, Blitzlichter, zwei Türsteher-Droiden mit Fliege. Am Pult steht Wachtmeisterin Kessel in Abendgarderobe und Dienstmütze. Beides gleichzeitig. Mutig.' },
          { speaker: 'wache', text: 'Name. Einladung. Und bitte kein Theater, ich hab heute schon drei Influencer weggeschickt. Einer hat geweint. Ich auch, aber innerlich.' },
        ],
        choices: [
          {
            text: 'Die Chrome-Einladung vorzeigen.', when: { item: 'chrome-einladung' }, next: 'einladung',
          },
          {
            text: 'Den gefälschten Party-Ausweis zücken.', when: { item: 'party-ausweis' }, next: 'ausweis',
          },
          {
            text: '„Kessel. Du kennst mich. Du weißt, warum ich hier bin.“', tag: '[Wache ♥8]',
            requires: { hearts: 'wache', min: 8 }, next: 'kessel',
          },
          {
            text: '„Mein Name steht ganz oben. Unter ‚Wichtig‘. Lesen Sie mal genauer.“', check: 'gc-38', next: 'ueberredet',
          },
          { text: 'Lieber einen anderen Weg suchen.', next: 'andere' },
          { text: 'Die Droiden umnieten und durch.', next: 'gewalt' },
        ],
      },
      {
        id: 'einladung',
        lines: [
          { speaker: 'wache', text: 'Chrome-Einladung. Mit Wasserzeichen und Parfüm. Die Schwestern haben dich eingeladen? Na, dann.' },
          { speaker: 'wache', text: 'Rein mit dir. Und fass das Buffet nicht mit den Fingern an, da sind Kameras drauf. Auf dem Buffet.' },
        ],
        effects: [{ setFlag: 'einlass_haupteingang' }, { xp: 30 }, { message: 'Du stehst auf der Gästeliste. Der Gästeaufzug im Foyer wartet.' }],
      },
      {
        id: 'ausweis',
        lines: [
          { speaker: 'wache', text: 'Hm.' },
          { speaker: 'narrator', text: 'Sie hält den Ausweis ins Licht. Fräulein Pixels Fälschung glänzt wie echt. Echter als echt. Der Hologrammvogel zwinkert sogar.' },
          { speaker: 'wache', text: 'Sieht gut aus. Zu gut, wenn du mich fragst. Aber mich fragt ja keiner. Weiter.' },
        ],
        effects: [{ setFlag: 'einlass_haupteingang' }, { xp: 30 }, { message: 'Erste Kontrolle geschafft. Der Gästeaufzug im Foyer wartet.' }],
      },
      {
        id: 'kessel',
        lines: [
          { speaker: 'wache', text: 'Ich weiß gar nichts. Ich hab dich nicht gesehen. Und wenn da drin gleich was passiert, war ich auf der Toilette.' },
          { speaker: 'wache', text: 'Seitentür, Gästeaufzug, zweiter Knopf. Und {name}: Komm heil wieder raus. Ich hab keine Lust auf Papierkram.' },
        ],
        effects: [{ setFlag: 'einlass_wache' }, { relation: 'wache', delta: 30 }, { xp: 40 }],
      },
      {
        id: 'ueberredet',
        lines: [
          { speaker: 'wache', text: 'Ganz oben. Unter „Wichtig“.' },
          { speaker: 'narrator', text: 'Sie scrollt. Sie scrollt zurück. Du schaust sie so an, als hätte sie dich beleidigt. Ein Droide räuspert sich elektronisch.' },
          { speaker: 'wache', text: 'Ach, da. Mein Fehler. Viel Spaß, und … entschuldigen Sie die Unannehmlichkeiten, äh, Hoheit?' },
        ],
        effects: [{ setFlag: 'einlass_haupteingang' }, { xp: 40 }, { message: 'Du bist drin. Selbstbewusstsein ist die beste Fälschung.' }],
      },
      {
        id: 'andere',
        lines: [
          { speaker: 'narrator', text: 'Du trittst zurück in die Menge. Drinnen gibt es ein Gästelisten-Pult, an dem man sicher etwas ändern könnte. Neben der Küche schleppt das Catering Kisten. Und am Sockel des Spire summt ein Lüftungsgitter.' },
        ],
      },
      {
        id: 'gewalt',
        lines: [
          { speaker: 'wache', text: 'Ernsthaft? Vor laufender Kamera? Na schön. Ich hab Feierabend in drei Stunden, das wird ein langer Abend.' },
        ],
        choices: [
          { text: 'Ja. Ernsthaft.', effects: [{ setFlag: 'einlass_kampf' }, { battle: 'enc-einlass-kontrolle' }] },
          { text: 'Nein, war ein Witz. Ein schlechter.', next: 'a' },
        ],
      },
    ],
  },
};

export const part: ContentPart = {
  maps: { 'quantum-campus': campus },
  dialogues,
};
