// Zone „Eisenhof“ (world.md §3.5, ID-Plan design/plan/act1.json · pkg-eisenhof).
// Justizkomplex im Mittelring: Innenhof mit Gerichtsgarten, Entlassungstor, Fundkammer, Beweismittellager,
// Dr. Winkels Praxis, Gerichtskantine. Türen zu `gerichtssaal` (tags) und `zellentrakt` (nur mit Grund).
// Koordinaten in Kartenpixeln, am fertigen Bild bg-eisenhof nachgezogen (scripts/map_tool.mjs eisenhof).
import type { Condition, DialogueDef, MapDef } from '../../../modules/contracts';
import type { ContentPart } from '../../part';

const N = 'narrator' as const;

/** Gründe für den Zellentrakt (Plan: main-1-raven, Besuchszeit Di/Do/Sa T, he-raven-6, Kessel-Quest, Haft). */
export const ZELLENTRAKT_GRUND: Condition = {
  any: [
    { quest: 'main-1-raven', state: 'active' },
    { all: [{ weekday: ['di', 'do', 'sa'] }, { time: 'tag' }] },
    { hearts: 'raven', min: 6 },
    { quest: 'side-feierabend-fuer-kessel', state: 'active' },
    { flag: 'in_haft' },
  ],
};

const kesselQuest: Condition = { quest: 'side-feierabend-fuer-kessel', state: 'active' };
const streamingQuest: Condition = { quest: 'side-streaming-suenden', state: 'active' };
const tagsueber: Condition = { time: ['morgen', 'tag'] };

const map: MapDef = {
  id: 'eisenhof',
  name: 'Eisenhof',
  subtitle: 'Mittelring · Justizkomplex',
  size: [1536, 1024],
  district: 'mittelring',
  lighting: 'outdoor',
  bg: 'bg-eisenhof',
  music: 'gefaengnis',
  ambience: 'oberstadt',
  walk: [
    // Innenhof mit Kiesgarten, Gang durchs Drehkreuz nach Osten, schmaler Weg rechts an der Mauer runter
    // und Gehweg vor der unteren Häuserzeile (Lager, Praxis, Kantine, Plane).
    [
      [45, 310], [300, 300], [1275, 325], [1275, 388], [1345, 392], [1345, 440], [1536, 440], [1536, 545],
      [1350, 552], [1350, 562], [1500, 562], [1500, 995], [15, 995], [15, 930], [1448, 930], [1448, 705],
      [390, 705], [390, 560], [45, 560],
    ],
  ],
  block: [
    [[75, 330], [240, 330], [240, 470], [75, 470]], // Bonsai
    [[245, 405], [292, 405], [292, 445], [245, 445]], // Stein
    [[160, 455], [212, 455], [212, 495], [160, 495]], // Stein
    [[180, 515], [232, 515], [232, 548], [180, 548]], // Stein
    [[78, 478], [126, 478], [126, 548], [78, 548]], // Laterne
    [[258, 500], [356, 500], [356, 552], [258, 552]], // Bank im Garten
    [[845, 520], [1010, 520], [1010, 626], [845, 626]], // Justitia-Sockel
    [[75, 925], [160, 925], [160, 950], [75, 950]], // Gabelstapler (steht an der Wand)
    [[438, 935], [527, 935], [527, 954], [438, 954]], // Kisten am Lager
    [[954, 966], [974, 966], [974, 988], [954, 988]], // Stehtisch (nur der Fuß, oben bleibt Platz zum Vorbeigehen)
    [[1078, 966], [1098, 966], [1098, 988], [1078, 988]], // Stehtisch (nur der Fuß)
    [[1188, 930], [1292, 930], [1292, 950], [1188, 950]], // Kistenstapel
    [[1412, 930], [1460, 930], [1460, 950], [1412, 950]], // Metallkisten
    [[1490, 805], [1500, 805], [1500, 850], [1490, 850]], // Flutlichtmast (schmal, damit der Mauerweg frei bleibt)
  ],
  exits: [
    { id: 'nach-stufenplatz', rect: [1496, 440, 40, 105], to: 'stufenplatz', entry: 'von-eisenhof', label: 'Zum Stufenplatz' },
    {
      id: 'nach-gerichtssaal', rect: [505, 285, 120, 50], to: 'gerichtssaal', entry: 'von-eisenhof', label: 'Gerichtssaal',
      interact: true, when: tagsueber,
      lockedText: 'Die Saaltür ist verriegelt. Ein Aushang: „Recht ruht. Morgen wieder.“',
    },
    {
      id: 'nach-zellentrakt', rect: [1082, 285, 86, 50], to: 'zellentrakt', entry: 'von-eisenhof', label: 'Zellentrakt',
      interact: true, when: ZELLENTRAKT_GRUND,
      lockedText: 'Kessel, ohne aufzusehen: „Zellentrakt nur mit Grund. ‚Ich bin neugierig‘ ist keiner.“',
    },
  ],
  entries: {
    'von-stufenplatz': { at: [1405, 495], facing: 'w' },
    'von-gerichtssaal': { at: [565, 372], facing: 's' },
    'von-zellentrakt': { at: [1125, 375], facing: 's' },
    taxi: { at: [1420, 640], facing: 'w' },
  },
  spots: {
    entlassungstor: { at: [1290, 500], facing: 's' },
    wachhaeuschen: { at: [1310, 410], facing: 's' },
    gerichtsgarten: { at: [300, 470], facing: 's' },
    gemuesebeete: { at: [420, 620], facing: 'w' },
    'richter-bank': { at: [306, 512], facing: 's' },
    fundkammer: { at: [240, 328], facing: 'n' },
    beweismittellager: { at: [320, 965], facing: 's' },
    'behoerden-terminal': { at: [872, 345], facing: 'n' },
    'winkels-praxis': { at: [665, 960], facing: 's' },
    gerichtskantine: { at: [1030, 958], facing: 'n' },
    gerichtsplatz: { at: [1120, 640], facing: 's' },
    'freigang-ecke': { at: [1345, 962], facing: 'n' },
    nachtwache: { at: [1200, 380], facing: 's' },
  },
  hotspots: [
    // --- Händler -------------------------------------------------------------------------------------------
    {
      id: 'dr-winkel', at: [665, 945], label: 'Dr. Winkels Praxis', kind: 'shop', shop: 'dr-winkel', when: tagsueber,
      lines: [{ speaker: N, text: 'Grünes Kreuz, Wartebank, ein Schild „Diskretion ist Ehrensache. Bargeld auch.“ Dr. Winkel macht Fahndungen kleiner. Gegen Gebühr.' }],
    },
    {
      id: 'winkels-praxis-zu', at: [665, 945], label: 'Praxistür', kind: 'look', when: { time: ['abend', 'nacht'] },
      lines: [{ speaker: N, text: 'Geschlossen. Unter der Tür klebt ein Zettel: „Notfälle bitte morgen. Echte Notfälle bitte woanders.“' }],
    },
    {
      id: 'gerichtskantine', at: [1030, 945], radius: 64, label: 'Gerichtskantine', kind: 'shop', shop: 'gerichtskantine', when: tagsueber,
      lines: [{ speaker: N, text: 'Die Kantine riecht nach Filterkaffee und Aktenstaub. Der Kaffee ist billig, weil er schmeckt wie ein Urteil.' }],
    },
    {
      id: 'kantine-zu', at: [1030, 945], radius: 64, label: 'Kantinenklappe', kind: 'look', when: { time: ['abend', 'nacht'] },
      lines: [{ speaker: N, text: 'Klappe zu. Auf dem Tresen ein einsamer Becher mit der Aufschrift „KESSEL“. Er sieht dich vorwurfsvoll an.' }],
    },
    // --- Quest- und Weltorte --------------------------------------------------------------------------------
    { id: 'fundkammer', at: [240, 318], label: 'Fundkammer', kind: 'use', dialogue: 'eisenhof-fundkammer' },
    {
      id: 'ravens-alte-jacke', at: [170, 318], label: 'Ravens alte Jacke', kind: 'loot', once: true,
      when: { all: [kesselQuest, { flag: 'kessel_fundkammer_sortiert' }] }, hideWhen: { item: 'ravens-alte-jacke' },
      lines: [{ speaker: N, text: 'Die Lederjacke mit dem eingeritzten Raben. Kessel hat „Persönliche Habe – bei Gelegenheit zurück“ draufgeklebt. Die Gelegenheit bist du.' }],
      effects: [{ give: 'ravens-alte-jacke' }],
    },
    { id: 'beweismittellager', at: [320, 948], radius: 64, label: 'Beweismittellager', kind: 'use', dialogue: 'eisenhof-beweismittellager' },
    { id: 'behoerden-terminal', at: [872, 332], label: 'Behördenterminal', kind: 'use', dialogue: 'eisenhof-behoerden-terminal' },
    {
      id: 'preisgurke', at: [372, 618], radius: 64, label: 'Preisgurke ansehen', kind: 'look',
      lines: [
        { speaker: N, text: 'Die Preisgurke des Richters: golden, prall, einundvierzig Zentimeter. Daneben ein Schild mit einer Schleife. Erster Platz, drei Jahre in Folge.' },
        { speaker: N, text: 'Am Ende: kleine, sehr regelmäßige Bissspuren. Metallisch. Wie von einem Roboterhund, der sich für einen Feinschmecker hält.' },
      ],
      effects: [{ setFlag: 'gurke_bissspuren_gesehen' }],
    },
    { id: 'freigang-ecke', at: [1345, 948], radius: 64, label: 'Plane hinter den Kisten', kind: 'use', dialogue: 'eisenhof-freigang-ecke' },
    // --- Sammelobjekte --------------------------------------------------------------------------------------
    {
      id: 'glueckstern-11', at: [300, 372], label: 'Etwas glitzert im Kies', kind: 'loot', once: true,
      lines: [{ speaker: N, text: 'Jemand hat ein Muster in den Kies geharkt, das verdächtig nach einem Mittelfinger aussieht. In der Mitte: ein Glücksstern.' }],
      effects: [{ give: 'glueckstern-11' }],
    },
    {
      id: 'datenwuerfel-10', at: [482, 958], label: 'Zwischen den Asservatenkisten', kind: 'loot', once: true,
      lines: [{ speaker: N, text: 'Zwischen zwei versiegelten Kisten klemmt ein Datenwürfel ohne Etikett. Offiziell existiert er nicht. Inoffiziell gehört er jetzt dir.' }],
      effects: [{ give: 'datenwuerfel-10' }],
    },
    // --- Kleinkram und Geheimnis ---------------------------------------------------------------------------
    {
      id: 'justitia-roboter', at: [928, 640], radius: 64, label: 'Statue ansehen', kind: 'look',
      lines: [
        { speaker: N, text: 'Eine Bronzestatue: Justitia als Roboter, Augenbinde, Waage. Eine Waagschale ist voller Taubenscheiße, die andere voller Kippen. Ausgeglichen.' },
      ],
    },
    {
      id: 'entlassungstor', at: [1360, 500], label: 'Entlassungstor', kind: 'look',
      lines: [
        { speaker: N, text: 'Das Drehkreuz dreht nur nach außen. Wer hier rauskommt, blinzelt, als hätte er die Sonne zum ersten Mal gesehen. Es ist keine Sonne da. Nur Smog.' },
      ],
    },
    {
      id: 'wachhaeuschen-strichliste', at: [1305, 398], label: 'Wachhäuschen', kind: 'look',
      lines: [
        { speaker: N, text: 'Im Wachhäuschen: eine Kaffeemaschine, ein Collin-Kalender und eine Strichliste. Spalten: „Kaffee“, „Idioten“, „Idioten mit Kaffee“. Die letzte Spalte ist voll.' },
      ],
    },
    {
      id: 'kies-harke', at: [250, 485], label: 'Harke im Kiesgarten', kind: 'look',
      lines: [
        { speaker: N, text: 'Ein Zen-Garten im Gerichtshof. Die Linien im Kies sind exakt parallel. Jemand hat ein Schild hingestellt: „Wer hier latscht, wird verurteilt. – R.“' },
      ],
    },
    {
      id: 'regenrinne', at: [690, 332], label: 'Regenrinne am Gericht', kind: 'check', once: true,
      check: { id: 'eisenhof-regenrinne', attribute: 'koerper', threshold: 6, tags: ['klettern', 'welt'] },
      altText: 'Die Rinne ist glitschig und du bist es auch. Mit mehr Körper ginge es – oder du wartest, bis sie von selbst runterkommt. In zwanzig Jahren.',
      lines: [{ speaker: N, text: 'In der Dachrinne über dem Gerichtssaal steckt etwas, das nach einem Geldbeutel aussieht. Hochziehen?' }],
      effects: [{ credits: 40 }, { message: 'Eine vergessene Kaution: 40 Credits. Der Besitzer sitzt vermutlich noch.' }],
    },
  ],
  encounters: [
    {
      id: 'freigang-gang', encounter: 'enc-gerichtsplatz-gang', at: [1120, 640], sprite: 'rostzahn-schlaeger-walk',
      patrol: [[1080, 640], [1280, 640], [1280, 680], [1080, 680]],
      when: { all: [kesselQuest, { flag: 'kessel_fundkammer_sortiert' }, { notFlag: 'kessel_kisten_zurueck' }, { not: { time: 'nacht' } }] },
      avoid: { id: 'eisenhof-gang-abwimmeln', attribute: 'strasse', threshold: 5, tags: ['einschuechtern'], label: '[Straße 5]' },
    },
  ],
  foreground: [
    { rect: [850, 340, 160, 260], baseY: 600 }, // Justitia
    { rect: [1466, 600, 64, 240], baseY: 845 }, // Flutlichtmast unten rechts
    { rect: [1275, 190, 180, 196], baseY: 388 }, // Wachhäuschen
  ],
  lights: [
    { at: [565, 160], radius: 170, color: '#7fd8ff', intensity: 0.8, slots: ['abend', 'nacht'] }, // Waage über dem Gericht
    { at: [1120, 185], radius: 120, color: '#ff3a3a', intensity: 0.85, slots: ['abend', 'nacht'] }, // Rotlicht Zellentrakt
    { at: [872, 235], radius: 100, color: '#3ef2ff', slots: ['abend', 'nacht'] }, // Terminal
    { at: [650, 800], radius: 110, color: '#3dff8a', slots: ['abend', 'nacht'] }, // Grünes Kreuz
    { at: [1030, 860], radius: 140, color: '#ffc46b', slots: ['morgen', 'abend'] }, // Kantine
    { at: [1355, 280], radius: 120, color: '#ffe3a0', slots: ['abend', 'nacht'] }, // Wachhäuschen
    { at: [100, 505], radius: 90, color: '#ffd27a', slots: ['abend', 'nacht'] }, // Gartenlaterne
    { at: [1385, 840], radius: 90, color: '#ffb04a', slots: ['abend', 'nacht'] }, // Laterne unter der Plane
    { at: [40, 110], radius: 280, color: '#e8f4ff', intensity: 0.45, slots: ['abend', 'nacht'] }, // Flutlichter
    { at: [1490, 60], radius: 280, color: '#e8f4ff', intensity: 0.45, slots: ['abend', 'nacht'] },
    { at: [1495, 630], radius: 260, color: '#e8f4ff', intensity: 0.45, slots: ['abend', 'nacht'] },
  ],
  ambient: {
    count: 8,
    sprites: ['passant-anzug-walk', 'passant-arbeiterin-walk', 'passant-oma-walk', 'passant-kurier-walk', 'passant-tourist-walk', 'ordnungshueter-walk'],
    routes: [
      [[1405, 495], [1100, 470], [700, 380], [565, 372]],
      [[1125, 375], [1150, 560], [1420, 640]],
      [[420, 400], [760, 470], [1100, 450], [1260, 520]],
      [[430, 680], [800, 670], [1200, 690], [1480, 720], [1480, 965], [1100, 965], [700, 965], [300, 965]],
      [[650, 965], [1030, 960], [1345, 962]],
      [[300, 360], [420, 480], [700, 600], [760, 680]],
    ],
    bySlot: { morgen: 6, tag: 9, abend: 5, nacht: 3 },
    barks: [
      { text: 'Bitte nicht auf die Stufen sitzen, die sind frisch gewischt.' },
      { text: 'Ich habe einen Termin um zehn. Den hatte ich auch gestern schon.' },
      { text: 'Ich bin nur als Zeuge hier. Glaub ich.' },
      { text: 'Mein Anwalt ist eine App. Die App hat sich krankgemeldet.' },
      { text: 'Der Richter hat mich angeschaut. Ich glaub, ich bin jetzt schuldig.' },
      { text: 'Wer latscht hier durch den Kies? Der Richter kriegt Herzrasen, du Trampel!' },
      { text: 'Kaffee aus der Kantine? Da kannst du auch gleich die Pfütze saufen.' },
      { text: 'Collin ist live? Schnell, Haare richten!', when: { weekday: ['mo', 'mi', 'fr'] } },
      { text: 'Bagatellgericht! Heute wird über einen Toaster verhandelt. Der Toaster plädiert auf unschuldig.', when: { weekday: 'mi' } },
      { text: 'Morgenkaffee und Morgenappell. Beides bitter.', when: { time: 'morgen' } },
      { text: 'Nachtwache. Weitergehen, Freundchen, hier gibt’s nichts zu glotzen.', when: { time: 'nacht' } },
      { text: 'Moment … dich kenn ich doch vom Fahndungsbildschirm. Ach nee, der war hässlicher.', when: { flag: 'fahndung_1' } },
      { text: 'Die Warteschlange beim Gericht geht heute bis zum Bahnhof.', when: { act: 2 } },
      { text: 'Master hat gesagt, ich soll lächeln. Ist das richtig so?', when: { act: 2 } },
      { text: 'Endlich raus. Der erste Morgen draußen schmeckt nach Rost.', when: { time: 'morgen' } },
    ],
  },
  onEnter: [
    {
      id: 'eisenhof-ankunft', once: true,
      effects: [
        { message: 'Der Eisenhof. Hier wird Recht gesprochen, verwahrt und gelegentlich gegrillt. Die Mauern sind so dick, dass sogar der Smog draußen bleibt.' },
        { markSeen: 'eisenhof-ankunft' },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------------------------------------------
// Dialoge der Ortshotspots

const fundkammer: DialogueDef = {
  id: 'eisenhof-fundkammer',
  start: 'start',
  nodes: [
    {
      id: 'start',
      lines: [{ speaker: N, text: 'Die Fundkammer. Regale bis unter die Decke, beschriftet mit „Sonstiges“, „Sonstiges II“ und „Frag nicht“.' }],
      choices: [
        { text: 'Kessels Chaos sortieren.', next: 'sort-jacke', when: { all: [kesselQuest, { notFlag: 'kessel_fundkammer_sortiert' }] } },
        { text: 'Im Fach „Frag nicht“ wühlen.', next: 'frag-nicht' },
        { text: 'Lieber nichts anfassen. Hier fasst dich am Ende noch was an.' },
      ],
    },
    {
      id: 'frag-nicht',
      lines: [
        { speaker: N, text: 'Ein Gebiss mit Goldzahn. Ein einzelner Rollschuh. Eine Urne mit dem Etikett „Onkel Benno (?)“.' },
        { speaker: N, text: 'Du fragst nicht.' },
      ],
    },
    {
      id: 'sort-jacke',
      lines: [
        { speaker: N, text: 'Erstes Fundstück: eine abgewetzte Lederjacke, Schnitt im Ärmel, riecht nach Regen und Ärger. Am Kragen ein eingeritzter Rabe.' },
      ],
      choices: [
        { text: '„Persönliche Habe – Raven.“ Ins Fach damit.', next: 'sort-laptop' },
        { text: '„Altkleider.“ Das Ding ist durch.', next: 'sort-jacke-falsch' },
      ],
    },
    {
      id: 'sort-jacke-falsch',
      lines: [
        { speaker: N, text: 'Aus der Innentasche fällt ein Zettel: „Finger weg, du Wichser. – R.“' },
        { speaker: 'player', text: 'Okay. Persönliche Habe. Ganz persönlich.' },
      ],
      next: 'sort-laptop',
    },
    {
      id: 'sort-laptop',
      lines: [
        { speaker: N, text: 'Zweites Fundstück: ein versiegelter Laptop. Siegel „Beweisstück – Fall Dante“, auf dem Deckel ein Keks-Aufkleber mit Bissspur.' },
      ],
      choices: [
        { text: 'Asservate. Siegel bleibt dran.', next: 'sort-becher' },
        {
          text: 'Nur ganz kurz reinschauen.', next: 'sort-laptop-offen',
          check: { id: 'eisenhof-dantes-laptop', attribute: 'technik', threshold: 5, tags: ['hacken'] },
        },
      ],
    },
    {
      id: 'sort-laptop-offen',
      lines: [
        { speaker: N, text: 'Passwort: „kekse123“. Natürlich. Drauf: vierhundert Stunden Lo-Fi, ein Ordner „Steuern (lol)“ und ein Foto von Dante mit einer Katze, beide mit Sonnenbrille.' },
        { speaker: N, text: 'Du klappst ihn zu, klebst das Siegel zurück und guckst unschuldig. Das kannst du gut. Zu gut.' },
      ],
      effects: [{ setFlag: 'dantes_laptop_gesehen' }],
      next: 'sort-becher',
    },
    {
      id: 'sort-becher',
      lines: [
        { speaker: N, text: 'Drittes Fundstück: dreihundert identische Kaffeebecher. Auf jedem steht in Edding: „KESSEL. NICHT ANFASSEN.“' },
      ],
      choices: [
        { text: 'Alle in die Spüle. Diese Frau braucht Hilfe.', next: 'fertig' },
        { text: 'Einen einstecken. Bei dreihundert fällt das nicht auf.', next: 'fertig', effects: [{ message: 'Ein Becher wandert in deine Tasche. Irgendwo macht Kessel einen Strich.' }] },
      ],
    },
    {
      id: 'fertig',
      lines: [
        { speaker: N, text: 'Die Fundkammer sieht fast nach Ordnung aus. Nur drei Lücken im Regal: „Kiste 7, 8, 9 – Freigang“.' },
        { speaker: N, text: 'Draußen am Gerichtsplatz lachen drei Rostzähne. Sie sitzen auf etwas, das verdächtig nach Kisten aussieht.' },
      ],
      effects: [
        { setFlag: 'kessel_fundkammer_sortiert' },
        { xp: 30 },
        { message: 'Fundkammer sortiert. Drei Kisten fehlen: Freigang-Gang am Gerichtsplatz – oder nachts heimlich zurückholen.' },
      ],
    },
  ],
};

const beweismittellager: DialogueDef = {
  id: 'eisenhof-beweismittellager',
  start: 'start',
  nodes: [
    {
      id: 'start',
      lines: [{ speaker: N, text: 'Rolltor, drei Schlösser, ein Piktogramm mit durchgestrichenem Finger. Dahinter liegt alles, was die Unterstadt je verloren hat. Inklusive Würde.' }],
      choices: [
        {
          text: 'Über das Wartungspanel an den alten Streaming-Server.', next: 'geloescht', check: 'gc-69',
          when: { all: [streamingQuest, { notFlag: 'richter_eintrag_geloescht' }, { notFlag: 'richter_server_geholt' }] },
        },
        {
          text: 'Das Schloss knacken und den Server rausholen.', requires: { time: 'nacht' }, tag: '[Nachts]',
          when: { all: [streamingQuest, { notFlag: 'richter_eintrag_geloescht' }, { notFlag: 'richter_server_geholt' }] },
          effects: [{
            minigame: 'akt-schloss', level: 3, key: 'eisenhof-beweismittellager', label: 'Beweismittellager',
            win: [{ setFlag: 'richter_server_geholt' }, { message: 'Der Server unterm Arm, schwer wie ein schlechtes Gewissen. Ab zum Richter.' }],
            lose: [{ message: 'Das Schloss gewinnt. Es hat mehr Berufserfahrung als du.' }],
          }],
        },
        { text: 'Mit der Behördenkarte durchziehen.', next: 'karte', when: { item: 'behoerdenkarte' }, tag: '[Behördenkarte]' },
        { text: 'Weitergehen. Asservate sind was für Leute mit Durchsuchungsbeschluss.' },
      ],
    },
    {
      id: 'geloescht',
      lines: [
        { speaker: N, text: 'Du hängst dich ans Panel. Nutzer „RichtigLauteMusik79“: zehntausend Stunden Schlager-Remixe, Lieblingslied „Paragraph der Liebe (Club Mix)“.' },
        { speaker: N, text: 'Löschen. Weg. Als hätte es den Mann nie gegeben. Also, musikalisch.' },
      ],
      effects: [{ setFlag: 'richter_eintrag_geloescht' }, { message: 'Eintrag gelöscht. Der Richter will das bestimmt hören. Leise.' }],
    },
    {
      id: 'karte',
      lines: [{ speaker: N, text: 'Piep. Grün. Das Rolltor rattert hoch. Kessel weiß davon nichts. Offiziell.' }],
      choices: [
        {
          text: 'Den Streaming-Server einpacken.',
          when: { all: [streamingQuest, { notFlag: 'richter_eintrag_geloescht' }, { notFlag: 'richter_server_geholt' }] },
          effects: [{ setFlag: 'richter_server_geholt' }, { message: 'Server eingepackt. Leise, freundlich, völlig illegal.' }],
        },
        { text: 'Nach der eigenen Akte suchen.', next: 'akte' },
        { text: 'Wieder zumachen, bevor jemand guckt.' },
      ],
    },
    {
      id: 'akte',
      lines: [
        { speaker: N, text: 'Du findest einen Ordner mit deinem Namen. Er ist dünner als gedacht. Beleidigend dünn.' },
        { speaker: 'player', text: 'Ich muss mehr Scheiße bauen. Für die Statistik.' },
      ],
    },
  ],
};

const behoerdenTerminal: DialogueDef = {
  id: 'eisenhof-behoerden-terminal',
  start: 'start',
  nodes: [
    {
      id: 'start',
      lines: [{ speaker: N, text: 'Ein öffentliches Behördenterminal. Auf dem Bildschirm dreht sich eine Sanduhr. Wahrscheinlich seit 2079.' }],
      choices: [
        { text: 'Die Fahndungsliste durchscrollen.', next: 'liste' },
        {
          text: 'Seriennummer der Handschelle prüfen.', next: 'handschelle', tag: '[Behördenkarte]',
          when: { all: [{ quest: 'pers-raven-handschellen', state: 'active' }, { notFlag: 'handschellen_seriennummer' }] },
          requires: { item: 'behoerdenkarte' },
        },
        {
          text: 'Ins Gerichtsarchiv einbrechen (Leitungs-Hack).', when: { job: 'job-datenraub' },
          effects: [{
            minigame: 'akt-hacken', level: 2, key: 'eisenhof-gerichtsarchiv', label: 'Gerichtsarchiv',
            win: [{ message: 'Daten gezogen. Das Archiv hat nicht mal geschrien.' }, { completeJob: 'job-datenraub' }],
            lose: [{ message: 'Das Terminal piept beleidigt und zeigt dir einen Smiley. Einen bösen.' }],
          }],
        },
        {
          text: 'Mit Admin-Rechten aus dem Wartungsmenü ins Archiv.', when: { job: 'job-datenraub' },
          check: { id: 'eisenhof-archiv-wartungsmenue', attribute: 'technik', threshold: 6, tags: ['hacken', 'terminal'] },
          effects: [{ message: 'Passwort „admin“, Benutzer „admin“. Der Mittelring ist ein Wunder der Sicherheit.' }, { completeJob: 'job-datenraub' }],
        },
        { text: 'Abmelden.' },
      ],
    },
    {
      id: 'liste',
      lines: [
        { speaker: N, text: 'Gesucht: ein Mann, der seinen Pudel „Chef“ genannt hat. Gesucht: wer „Kessel ist eine Bratwurst“ ins Besucherbuch geschrieben hat.' },
        { speaker: N, text: 'Dein Gesicht ist nicht dabei. Noch nicht.' },
      ],
    },
    {
      id: 'handschelle',
      lines: [
        { speaker: N, text: 'Seriennummer HS-0815-C. Sonderanfertigung, Besteller: Haushalt Chrome, Oberstadt. Freigabe mit einem schwungvollen „B“.' },
        { speaker: 'player', text: 'Blade. Die kannte Raven schon vor dem Bruch. Das wird Raven so richtig ankotzen.' },
      ],
      effects: [{ setFlag: 'handschellen_seriennummer' }, { message: 'Spur: Die Handschelle war eine Sonderanfertigung für die Chrome-Familie.' }],
    },
  ],
};

const freigangEcke: DialogueDef = {
  id: 'eisenhof-freigang-ecke',
  start: 'start',
  nodes: [
    {
      id: 'start',
      lines: [{ speaker: N, text: 'Hinter einer Plane: ein Kistentisch, Kippen, Bierdeckel und ein Kartenspiel mit vier Herz-Assen. Das Versteck der Freigang-Gang.' }],
      choices: [
        {
          text: 'Die drei Kisten heimlich zurückschleppen.', next: 'zurueck', tag: '[Nachts]', requires: { time: 'nacht' },
          when: { all: [kesselQuest, { flag: 'kessel_fundkammer_sortiert' }, { notFlag: 'kessel_kisten_zurueck' }] },
        },
        { text: 'Weiter. Hier riecht es nach Bewährung.' },
      ],
    },
    {
      id: 'zurueck',
      lines: [
        { speaker: N, text: 'Kiste 7, 8, 9. Die Gang schnarcht im Schatten der Mauer, einer murmelt im Schlaf „Ich war’s nicht“.' },
        { speaker: N, text: 'Du schleppst, fluchst lautlos und stapelst alles vor die Fundkammer. Ein Kunstwerk der Unterstadt.' },
      ],
      effects: [{ setFlag: 'kessel_kisten_zurueck' }, { advanceTime: 30 }, { xp: 25 }, { message: 'Die Kisten sind zurück. Kessel wird morgen staunen. Oder einen Strich machen.' }],
    },
  ],
};

export const part: ContentPart = {
  maps: { eisenhof: map },
  dialogues: {
    [fundkammer.id]: fundkammer,
    [beweismittellager.id]: beweismittellager,
    [behoerdenTerminal.id]: behoerdenTerminal,
    [freigangEcke.id]: freigangEcke,
  },
};
