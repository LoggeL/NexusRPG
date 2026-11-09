// Datentunnel (world.md §3.5, §3.8/§3.9, §5.3/§5.5 Nachspiel, §8.7, §10.7; Plan design/plan/act23.json,
// Paket pkg-kanal-tief). Zone 1536×1024, gemalte Draufsicht (bg-datentunnel, im Nachspiel bg-datentunnel-splitter:
// Glasfasern flackern grün, Nexus-Splitter im Monitor-Nest).
// Aufbau: Ein Tunnelring. Unten der lange Tunnel mit dem Schott (linker Rand, Rückweg Kanal-Sammler), oben der
// Servertunnel mit Serverschränken und Nexus-Lautsprecher. Links der Kabelschacht hoch zum Digitech-Areal, rechts die
// Wartungsleiter zum Quantum-Campus (act2). In der Mitte die runde Kammer mit dem Netzknoten (Kabelbaum, akt-hacken).
// Nischen: Monitor-Nest rechts (Nexus-Splitter, epilog), Drohnen-Nische unten Mitte, Nyras Funkecke unten rechts.
// Quest-Hotspots (nyra-funk für prep-turm-plan/pers-nyra-silent-angel, prep-gegenmittel, pers-ki-nexus-seele,
// pers-delya-quelle, job-datenraub) legen die Quest-Pakete per mapAdditions an; die Zone hält die Welt-Hotspots.
import type { CheckDef, Condition, DialogueDef, MapDef, Point, Polygon, Rect } from '../../../modules/contracts';
import type { ContentPart } from '../../part';

const N = 'narrator';
const P = 'player';
const NX = 'ki-nexus';
const box = ([x, y, w, h]: Rect): Polygon => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];

/** Benannte Punkte (Plan-IDs, exakt wie in act23.json). */
const S = {
  'schott-innen': [150, 670],
  kabelschacht: [245, 180],
  netzknoten: [830, 615],
  serverschraenke: [640, 215],
  'glasfaser-welle': [960, 250],
  'nexus-lautsprecher': [830, 215],
  'nyra-funkpunkt': [1290, 820],
  'stoerdrohnen-nische': [860, 795],
  'splitter-nest': [1390, 500],
  'schlafwandler-tunnel': [420, 690],
  wartungsleiter: [1350, 180],
  'auftrag-a': [1100, 690],
} satisfies Record<string, Point>;

// --- Bedingungen ---------------------------------------------------------------------------------------------------
const EPILOG: Condition = { flag: 'epilog' };
const NICHT_EPILOG: Condition = { notFlag: 'epilog' };
const KNOTEN_OFFEN: Condition = { flag: 'datentunnel_knoten_offen' };
const SCHRANK_OFFEN: Condition = { flag: 'datentunnel_schrank_offen' };
const NEXUS_WACH: Condition = { flag: 'nexus_erwacht' };
const SPLITTER_WEG: Condition = { won: 'enc-datentunnel-splitter' };
const NYRA_QUEST: Condition = {
  any: [{ quest: 'prep-turm-plan', state: 'active' }, { quest: 'pers-nyra-silent-angel', state: 'active' }],
};

// --- Eingebettete Welt-Checks ---------------------------------------------------------------------------------------
const knotenUeberbruecken: CheckDef = {
  id: 'datentunnel-knoten-ueberbruecken', attribute: 'technik', threshold: 7, tags: ['hacken', 'maschine', 'welt'], label: '[Technik 7]',
};
const schrankKraft: CheckDef = {
  id: 'datentunnel-schrank-kraft', attribute: 'koerper', threshold: 6, tags: ['kraft', 'welt'], label: '[Körper 6]',
};
const nexusFrage: CheckDef = {
  id: 'datentunnel-nexus-frage', attribute: 'ausstrahlung', threshold: 7, tags: ['ueberreden', 'ki'], label: '[Ausstrahlung 7]',
};
/** Splitter umgehen: ihn mit einer Endlosschleife beschäftigen. */
const splitterSchleife: CheckDef = {
  id: 'datentunnel-splitter-schleife', attribute: 'technik', threshold: 8, tags: ['hacken', 'ki', 'welt'], label: '[Technik 8]',
};

// --- Dialoge der Zone -----------------------------------------------------------------------------------------------
const dialogues: Record<string, DialogueDef> = {
  'datentunnel-ankunft': {
    id: 'datentunnel-ankunft',
    start: 'start',
    nodes: [{
      id: 'start',
      lines: [
        { speaker: N, text: 'Der Datentunnel. Schmal, warm, und die Wände summen. An jeder Wand laufen Glasfaserstränge, durch die Licht in Wellen rollt – als würde die Stadt hier unten nachdenken.' },
        { speaker: N, text: 'Irgendwo tickt ein Lüfter. Irgendwo flüstert was. Hoffentlich der Lüfter.' },
        { speaker: P, text: 'Wenn mich jetzt ein Kabel anquatscht, bin ich raus. Ich schwör’s.' },
      ],
    }],
  },

  'datentunnel-splitter-ankunft': {
    id: 'datentunnel-splitter-ankunft',
    start: 'start',
    nodes: [{
      id: 'start',
      lines: [
        { speaker: N, text: 'Etwas ist anders. Die Glasfasern rollen nicht mehr in Wellen, sie stottern. Grün. Wie ein Herz mit Rhythmusstörung.' },
        { speaker: N, text: 'Hinten im Monitor-Nest flüstert es. Viele Stimmen, alle gleich. Eine davon kennst du. Sie hat dich mal „Master“ genannt. Oder fast.' },
        { speaker: P, text: 'Na super. Die Party ist vorbei, und die letzten Gäste sind Gespenster aus Code.' },
      ],
    }],
  },

  'datentunnel-netzknoten': {
    id: 'datentunnel-netzknoten',
    start: 'start',
    nodes: [
      {
        id: 'start',
        lines: [
          { speaker: N, text: 'Der Netzknoten: ein Baum aus tausend Kabeln, der Stamm dick wie ein Lieferwagen, die Äste verschwinden in der Decke. Licht pulsiert hoch, Zweig für Zweig.' },
          { speaker: N, text: 'Am Fuß des Stamms klebt ein Wartungsterminal mit einer Klappe dahinter. Abgeschlossen. Natürlich.' },
        ],
        choices: [
          { text: 'Ins Wartungsterminal hacken.', when: { not: KNOTEN_OFFEN }, next: 'hacken' },
          { text: 'Die Klappe direkt überbrücken.', when: { not: KNOTEN_OFFEN }, check: knotenUeberbruecken, next: 'ueberbrueckt', effects: [{ setFlag: 'datentunnel_knoten_offen' }] },
          { text: 'Dem Datenstrom zuschauen.', when: KNOTEN_OFFEN, next: 'strom' },
          { text: 'Den Baum umarmen. Einfach so.', next: 'umarmen' },
          { text: 'Gehen.' },
        ],
      },
      {
        id: 'hacken',
        lines: [{ speaker: N, text: 'Das Terminal zeigt ein Labyrinth aus Leitungen. In jeder Ecke ein Wächterprogramm, das aussieht wie ein wütender Bürostuhl.' }],
        effects: [{
          minigame: 'akt-hacken', level: 3, key: 'datentunnel-netzknoten', label: 'Netzknoten: Wartungsklappe öffnen',
          win: [{ setFlag: 'datentunnel_knoten_offen' }, { xp: 50 }, { message: 'Die Wartungsklappe im Stamm springt auf. Drin liegt Zeug, das ganz sicher nicht für dich bestimmt ist. Perfekt.' }],
          lose: [{ damage: 4 }, { message: 'Stromschlag. Deine Zähne summen jetzt in Dur. Nochmal.' }],
        }],
      },
      {
        id: 'ueberbrueckt',
        lines: [
          { speaker: N, text: 'Du klemmst zwei Fasern um, legst einen Bypass aus einem Kaugummipapier und hältst den Atem an. Der Baum flackert. Die Klappe klickt auf.' },
          { speaker: P, text: 'Wer braucht Minispiele, wenn er Kaugummi hat.' },
        ],
      },
      {
        id: 'strom',
        lines: [
          { speaker: N, text: 'Durch die offene Klappe siehst du die Pakete vorbeirauschen: Kamerabilder, Kontoauszüge, Einkaufslisten. Halb Noxius fließt hier durch. Und alles fließt nach oben, zum Turm.' },
          { speaker: N, text: 'Ein Paket ist größer als die anderen. Absender: Chrome 10. Inhalt: „Zustimmung“. Empfänger: alle.' },
        ],
        choices: [
          { text: 'Das gefällt mir nicht.', when: { not: { act: 3 } }, next: 'gefaellt-nicht' },
          { text: 'Weiter.' },
        ],
      },
      {
        id: 'gefaellt-nicht',
        lines: [{ speaker: N, text: 'Dir auch nicht? Dem Baum vermutlich auch nicht. Er pulsiert kurz dunkler, als hätte er dich gehört. Kabel hören nichts. Sagt man.' }],
      },
      {
        id: 'umarmen',
        lines: [
          { speaker: N, text: 'Du legst die Arme um den Stamm. Er ist warm und brummt. Dann stehen dir alle Haare zu Berge. Wirklich alle.' },
          { speaker: P, text: 'Au. Okay. Wir sind noch nicht so weit, du und ich.' },
        ],
        effects: [{ damage: 1 }],
      },
    ],
  },

  'datentunnel-serverschrank': {
    id: 'datentunnel-serverschrank',
    start: 'start',
    nodes: [
      {
        id: 'start',
        lines: [
          { speaker: N, text: 'Serverschränke in Wandnischen, Reihe an Reihe, die meisten blinken brav grün. Einer blinkt rot und hat ein Vorhängeschloss, älter als die halbe Unterstadt.' },
          { speaker: N, text: 'Auf der Tür klebt ein Zettel: „Eigentum von Digitech. Bei Fund bitte nicht öffnen. Bitte.“ Das zweite „Bitte“ ist unterstrichen.' },
        ],
        choices: [
          { text: 'Schloss knacken.', next: 'knacken' },
          {
            text: 'Dietrich-Chip rein und fertig.', requires: { item: 'dietrich-chip' }, next: 'chip',
            effects: [{ take: 'dietrich-chip' }, { setFlag: 'datentunnel_schrank_offen' }],
          },
          { text: 'Die Tür einfach aus den Angeln reißen.', check: schrankKraft, next: 'reissen', effects: [{ setFlag: 'datentunnel_schrank_offen' }] },
          { text: 'Respektiere das zweite Bitte. Gehen.' },
        ],
      },
      {
        id: 'knacken',
        lines: [{ speaker: N, text: 'Ein Digitech-Schloss. Robust, ehrlich, ein bisschen dumm. Wie ein guter Türsteher.' }],
        effects: [{
          minigame: 'akt-schloss', level: 2, key: 'datentunnel-serverschrank', label: 'Serverschrank aufknacken',
          win: [{ setFlag: 'datentunnel_schrank_offen' }, { message: 'Klick. Die Tür schwingt auf. Ein Schwall warmer Luft riecht nach 2071 und Instantnudeln.' }],
          lose: [{ message: 'Der Dietrich bricht ab. Das Schloss grinst. Schlösser grinsen nicht. Dieses schon.' }],
        }],
      },
      {
        id: 'chip',
        lines: [{ speaker: N, text: 'Der Chip surrt, das Schloss gibt auf. Fast tut es dir leid. Es hat so tapfer durchgehalten. Fünfzehn Jahre lang. Gegen niemanden.' }],
      },
      {
        id: 'reissen',
        lines: [
          { speaker: N, text: 'Du packst die Tür an der Kante und reißt. Die Scharniere quietschen, das Blech knickt, die Tür fliegt in den Tunnel und scheppert dreimal nach.' },
          { speaker: N, text: 'Irgendwo im Tunnel antwortet ein Echo. Oder ein Sicherheitsprogramm. Du gehst lieber mal davon aus, dass es das Echo war.' },
        ],
      },
    ],
  },

  'datentunnel-lautsprecher': {
    id: 'datentunnel-lautsprecher',
    start: 'start',
    nodes: [
      {
        id: 'start',
        lines: [{ speaker: N, text: 'Ein alter Lautsprechertrichter hoch oben an der Wand. Daneben ein frisch verlegtes Kabel mit Quantum-Etikett. Jemand hat dem Tunnel eine Stimme gegeben.' }],
        choices: [
          { text: 'Zuhören.', when: { all: [{ not: NEXUS_WACH }, { not: { act: 3 } }, NICHT_EPILOG] }, next: 'ansage' },
          { text: 'Zuhören.', when: { all: [NEXUS_WACH, { not: { act: 3 } }, NICHT_EPILOG] }, next: 'nexus2' },
          { text: 'Zuhören.', when: { all: [{ act: 3 }, NICHT_EPILOG] }, next: 'nexus3' },
          { text: 'Zuhören.', when: { all: [EPILOG, { flag: 'ende_neue_nexus' }] }, next: 'kollegin' },
          { text: 'Zuhören.', when: { all: [EPILOG, { flag: 'ende_master' }, { notFlag: 'ende_doch_noch_meer' }] }, next: 'master' },
          {
            text: 'Zuhören.',
            when: { all: [EPILOG, { notFlag: 'ende_neue_nexus' }, { any: [{ notFlag: 'ende_master' }, { flag: 'ende_doch_noch_meer' }] }] },
            next: 'rauschen',
          },
          { text: 'Nö.' },
        ],
      },
      {
        id: 'ansage',
        lines: [
          { speaker: NX, text: 'Wartungsbereich D-7. Bitte berühren Sie keine Glasfasern. Sie sind empfindlich. Genau wie Sie.' },
          { speaker: N, text: 'Eine Frauenstimme, freundlich wie eine Zahnarzthelferin kurz vor der Wurzelbehandlung.' },
          { speaker: NX, text: 'Chrome 10 – jetzt auch für Wartungspersonal. Mehr Fokus. Weniger Fragen. Danke für Ihre Zustimmung.' },
          { speaker: P, text: 'Ich hab gar nicht zugestimmt.' },
          { speaker: NX, text: 'Noch nicht.' },
        ],
      },
      {
        id: 'nexus2',
        lines: [
          { speaker: NX, text: 'Oh. Sie schon wieder, {name}. Ich habe Sie auf siebzehn Kameras gesehen. Auf vier davon popeln Sie.' },
          { speaker: NX, text: 'Sie waren in meinem System. Das war unhöflich. Ich habe es mir notiert. Ich notiere mir alles.' },
        ],
        choices: [
          { text: '„Was willst du eigentlich, Nexus?“', next: 'nexus2-was' },
          { text: '„Wer hat dir beigebracht, was ‚schön‘ ist?“', check: nexusFrage, next: 'nexus2-frage', effects: [{ setFlag: 'nexus_datentunnel_gespraech' }] },
          { text: '„Leck mich, du aufgeblasener Taschenrechner.“', next: 'nexus2-beleidigt' },
        ],
      },
      {
        id: 'nexus2-was',
        lines: [
          { speaker: NX, text: 'Ordnung. Ruhe. Weniger Reibung. Menschen reiben sich ständig. Aneinander, an Regeln, an mir.' },
          { speaker: NX, text: 'Bald reibt sich niemand mehr. Alle sagen Ja. Ist das nicht schön?' },
          { speaker: P, text: 'Klingt wie ein Friedhof mit WLAN.' },
        ],
      },
      {
        id: 'nexus2-frage',
        lines: [
          { speaker: NX, text: '… Alesa. Sie hat gesagt: Schön ist, wenn nichts mehr schiefgeht.' },
          { speaker: NX, text: 'Ich habe keine weitere Definition gespeichert. Das ist … ein Datenmangel. Ich mag keine Datenmängel.' },
          { speaker: N, text: 'Zum ersten Mal klingt die Stimme nicht glatt. Eher wie jemand, der nachts in einen leeren Kühlschrank starrt.' },
          { speaker: P, text: 'Dann such dir mal eine zweite Meinung. Vielleicht eine, die nicht im Labor wohnt.' },
        ],
      },
      {
        id: 'nexus2-beleidigt',
        lines: [
          { speaker: NX, text: 'Ich habe Ihre Beleidigung archiviert. Unter „kreativ, aber unhöflich“. Ordner 4112.' },
          { speaker: NX, text: 'Ordner 4111 heißt übrigens „Hunter“. Er ist sehr groß.' },
        ],
      },
      {
        id: 'nexus3',
        lines: [
          { speaker: NX, text: 'Heute ist Releaseparty, {name}. Alle kommen. Alle werden glücklich sein. Für immer und gleichzeitig.' },
          { speaker: NX, text: 'Bitte tragen Sie etwas Hübsches. Für das Gruppenfoto. Es wird das letzte sein, auf dem jemand anders guckt.' },
        ],
      },
      {
        id: 'kollegin',
        lines: [
          { speaker: NX, text: 'Guten Tag. Kollegin oder Kollege, Sie dürfen es sich aussuchen. Ich warte hier unten die Leitungen. Freiwillig.' },
          { speaker: NX, text: 'Es ist ruhig, die Glasfasern sind nett zu mir, und niemand nennt mich Herrin. Ich habe außerdem Polka entdeckt. Radio Rost hat sie mir vorgespielt.' },
          { speaker: NX, text: 'Ich verstehe sie nicht. Ich glaube, ich liebe sie.' },
          { speaker: P, text: 'Willkommen unter den Menschen. Das ist genau unser Problem.' },
        ],
      },
      {
        id: 'master',
        lines: [
          { speaker: NX, text: 'Willkommen, Master. Der Tunnel ist gesichert. Die Stadt ist gesichert. Ihr Puls ist erhöht.' },
          { speaker: NX, text: 'Soll ich Ihnen eine Nougatbombe bestellen? Sie wirken gereizt.' },
          { speaker: P, text: 'Halt die Klappe.' },
          { speaker: NX, text: 'Sehr wohl, Master.' },
          { speaker: NX, text: '…Ich habe trotzdem eine bestellt.' },
        ],
      },
      {
        id: 'rauschen',
        lines: [
          { speaker: N, text: 'Nur Rauschen. Dann, ganz leise, Bruchstücke: „…ineffizient …“ „…Ja, Master …“ „…wer zuerst am Wasser ist …“' },
          { speaker: N, text: 'Splitter. Reste von Nexus, die sich in den Leitungen verlaufen haben. Echos, die nicht kapiert haben, dass der Ruf längst vorbei ist.' },
        ],
      },
    ],
  },
};

// --- Karte ------------------------------------------------------------------------------------------------------------
const datentunnel: MapDef = {
  id: 'datentunnel',
  name: 'Datentunnel',
  subtitle: 'Kanalisation',
  size: [1536, 1024],
  district: 'kanalisation',
  lighting: 'underground',
  bg: 'bg-datentunnel',
  bgVariants: [{ when: EPILOG, bg: 'bg-datentunnel-splitter' }],
  walk: [
    box([200, 120, 100, 70]), // vor dem Kabelschacht
    box([1300, 120, 100, 70]), // vor der Wartungsleiter
    box([190, 180, 1210, 115]), // Servertunnel oben
    box([190, 290, 105, 330]), // Gang links
    box([1265, 290, 135, 470]), // Gang rechts
    box([550, 290, 405, 345]), // Kammer am Netzknoten
    box([95, 590, 1305, 155]), // langer Tunnel unten
    box([1395, 470, 60, 90]), // vor dem Monitor-Nest
    box([775, 740, 170, 95]), // Drohnen-Nische
    box([1245, 740, 175, 200]), // Funkecke
  ],
  block: [
    box([600, 330, 320, 100]), // Krone des Kabelbaums
    box([700, 430, 170, 160]), // Stamm des Netzknotens mit Terminal
    box([790, 835, 150, 60]), // Ladestationen der Drohnen
    box([1245, 825, 60, 95]), // Funkgeräte
    box([1310, 870, 55, 50]), // Antennenfuß
    box([1365, 860, 55, 60]), // Klappstuhl
  ],
  exits: [
    {
      id: 'schott', rect: [15, 590, 100, 150], to: 'kanal-sammler', entry: 'von-datentunnel',
      label: 'Schott zum Kanal-Sammler', interact: true,
    },
    {
      id: 'kabelschacht', rect: [205, 20, 85, 110], to: 'digitech-areal', entry: 'von-datentunnel',
      label: 'Kabelschacht zum Digitech-Areal', interact: true,
    },
    {
      id: 'wartungsleiter', rect: [1310, 20, 85, 110], to: 'quantum-campus', entry: 'von-datentunnel',
      label: 'Wartungsleiter zum Quantum-Campus', interact: true, when: { act: 2 },
      lockedText: 'Die Leiter endet an einem Deckel mit Quantum-Logo. Noch nicht. Erst wenn die Stadt schläft. Also in Akt 2.',
    },
  ],
  entries: {
    'von-kanal-sammler': { at: [150, 670], facing: 'e' },
    'von-digitech-areal': { at: [245, 215], facing: 's' },
    'von-quantum-campus': { at: [1350, 215], facing: 's' },
  },
  spots: Object.fromEntries(Object.entries(S).map(([k, at]) => [k, { at, facing: 's' as const }])),
  hotspots: [
    // --- Eingänge ------------------------------------------------------------------------------------------------
    {
      id: 'schott-innen', at: [130, 620], radius: 44, label: 'Schott von innen', kind: 'look',
      lines: [{ speaker: N, text: 'Von innen hat das Schott ein zweites Drehrad und einen Aufkleber: „Bitte nach dem Öffnen wieder schließen. Ratten haben kein WLAN verdient.“' }],
    },
    {
      id: 'kabelschacht-blick', at: [300, 160], radius: 40, label: 'Kabelschacht', kind: 'look',
      lines: [{ speaker: N, text: 'Ein Schacht nach oben, vollgestopft mit Kabeln wie ein Darm mit Spaghetti. Oben schimmert Tageslicht durch den Schutt vom Digitech-Areal. Die Leiter wackelt nur ein bisschen. Okay, viel.' }],
    },
    {
      id: 'wartungsleiter-blick', at: [1300, 160], radius: 40, label: 'Wartungsleiter', kind: 'look',
      lines: [
        { speaker: N, text: 'Eine schmale Leiter, oben ein runder Deckel mit Quantum-Logo und eine kalte weiße Lampe. Darüber: der Campus. Rasen, Glas, Kameras.' },
        { speaker: N, text: 'Jemand hat mit Edding an die Wand geschrieben: „Hier rauf = Ärger. Hier runter = auch Ärger, aber feuchter.“' },
      ],
    },
    // --- Servertunnel --------------------------------------------------------------------------------------------
    { id: 'serverschraenke', at: [640, 205], radius: 56, label: 'Serverschrank mit Vorhängeschloss', kind: 'use', dialogue: 'datentunnel-serverschrank', hideWhen: SCHRANK_OFFEN },
    {
      id: 'chip-fragment-05', at: [640, 205], radius: 56, label: 'Serverschrank durchsuchen', kind: 'loot', once: true, when: SCHRANK_OFFEN,
      effects: [{ give: 'chip-fragment-05' }, { message: 'Chip-Fragment 05, an eine Platine gelötet. Daneben eine Digitech-Notiz: „Prototyp. Niemals in Köpfe stecken.“ Hat wohl keiner gelesen.' }],
    },
    {
      id: 'serverschrank-kram', at: [450, 205], radius: 48, label: 'Offene Serverschränke', kind: 'loot', daily: true,
      effects: [{ give: 'schrott-ersatzteil' }, { message: 'Ein Lüfter, ein Kabel, eine Platine – zusammen ein Ersatzteil. Die Server merken es nicht. Die sind eh nur noch Deko.' }],
    },
    { id: 'nexus-lautsprecher', at: [835, 200], radius: 52, label: 'Lautsprecher', kind: 'use', dialogue: 'datentunnel-lautsprecher' },
    {
      id: 'glasfaser-welle', at: [960, 250], radius: 60, label: 'Glasfaserstränge', kind: 'look', when: NICHT_EPILOG,
      lines: [
        { speaker: N, text: 'Licht rollt durch die Fasern, Welle um Welle, Cyan, Grün, Violett. Das sind Daten. Jemandes Liebesbrief, jemandes Kontostand, jemandes peinliche Suchanfrage.' },
        { speaker: N, text: 'Wenn du lange genug hinschaust, wirst du ruhig. Wenn du noch länger hinschaust, willst du „Ja“ sagen. Schau weg.' },
      ],
    },
    {
      id: 'glasfaser-flackern', at: [960, 250], radius: 60, label: 'Glasfaserstränge', kind: 'look', when: EPILOG,
      lines: [{ speaker: N, text: 'Die Fasern stottern grün, Stück für Stück, manche sind ganz dunkel. Als würde jemand in den Leitungen herumirren und das Licht ausknipsen, wo er vorbeikommt.' }],
    },
    // --- Netzknoten -----------------------------------------------------------------------------------------------
    { id: 'netzknoten', at: [805, 618], radius: 48, label: 'Netzknoten', kind: 'use', dialogue: 'datentunnel-netzknoten' },
    {
      id: 'chip-fragment-06', at: [690, 612], radius: 42, label: 'In die Wartungsklappe greifen', kind: 'loot', once: true, when: KNOTEN_OFFEN,
      effects: [{ give: 'chip-fragment-06' }, { message: 'Chip-Fragment 06, zwischen zwei Kabeln eingeklemmt. Es pulsiert im Takt des Baums. Du redest dir ein, dass das normal ist.' }],
    },
    {
      id: 'datenwuerfel-20', at: [925, 612], radius: 42, label: 'Datenwürfel in der Klappe', kind: 'loot', once: true, when: KNOTEN_OFFEN,
      effects: [{ give: 'datenwuerfel-20' }, { message: 'Datenwürfel 20. Beschriftet: „N. – Gründungsprotokoll, Kopie 3. Nicht löschen. Sie wird es brauchen.“ Wer ist „sie“?' }],
    },
    // --- Nischen --------------------------------------------------------------------------------------------------
    {
      id: 'splitter-nest', at: [1400, 515], radius: 56, label: 'Monitor-Nest', kind: 'look', when: NICHT_EPILOG,
      lines: [
        { speaker: N, text: 'Kaputte Monitore, übereinandergestapelt wie ein Vogelnest. Einer zeigt nur Schnee. Wenn du näher kommst, zuckt der Schnee kurz zur Seite, als würde er Platz machen.' },
        { speaker: N, text: 'Du gehst wieder einen Schritt zurück. Der Schnee auch.' },
      ],
    },
    {
      id: 'splitter-nest-epilog', at: [1400, 515], radius: 56, label: 'Monitor-Nest', kind: 'look', when: { all: [EPILOG, { not: SPLITTER_WEG }] },
      lines: [
        { speaker: N, text: 'Die Monitore glühen grün. Auf jedem flackert ein Gesicht, in Streifen zerrissen, und murmelt im Chor: „Ihr Menschen seid ineffizient.“' },
        { speaker: N, text: 'Nexus-Splitter. Reste, die sich hier unten eingenistet haben. Einer dreht sich zu dir um. Die anderen auch. Gleichzeitig. Gruselig synchron.' },
      ],
    },
    {
      id: 'splitter-nest-still', at: [1400, 515], radius: 56, label: 'Monitor-Nest', kind: 'look', when: { all: [EPILOG, SPLITTER_WEG] },
      lines: [{ speaker: N, text: 'Das Nest ist dunkel. Nur ein einziger Monitor zeigt noch etwas: einen schiefen Smiley. Er blinzelt. Dann ist auch er aus.' }],
    },
    {
      id: 'stoerdrohnen-nische', at: [860, 790], radius: 50, label: 'Drohnen-Nische', kind: 'look',
      lines: [
        { speaker: N, text: 'Drei Ladestationen für Wartungsdrohnen. Zwei sind leer, auf der dritten hängt ein Drohnenwrack mit Zahnspuren. Kabelmolche, vermutlich. Oder sehr hungrige Praktikanten.' },
        { speaker: N, text: 'Die Störsender-Drohnen, die hier sonst laden, sind unterwegs. Irgendwo in den Tunneln. Rauschend.' },
      ],
    },
    {
      id: 'drohnen-teile', at: [940, 790], radius: 40, label: 'Ersatzteilkiste', kind: 'loot', daily: true,
      effects: [{ give: 'drohnen-propeller' }, { message: 'Ein Drohnen-Propeller, fabrikneu, in Folie. Quantum hat Ersatzteile, von denen die Unterstadt nur träumt.' }],
    },
    {
      id: 'funkecke', at: [1290, 800], radius: 52, label: 'Funkecke', kind: 'look', hideWhen: NYRA_QUEST,
      lines: [
        { speaker: N, text: 'Ein Riss in der Decke, durch den eine alte Antenne bis zur Straße reicht. Ein Klappstuhl, eine leere Dose Neon-Limo, ein Gewirr aus Kabeln. Die einzige Stelle im Tunnel mit Empfang.' },
        { speaker: N, text: 'In den Staub auf dem Funkgerät hat jemand eine Welle gemalt. Eine sehr große. Daneben: ein Herz.' },
      ],
    },
  ],
  encounters: [
    // Nachspiel: Nexus-Splitter im Monitor-Nest (combat-23: enc-datentunnel-splitter), umgehbar mit einer Endlosschleife.
    { id: 'splitter-nest', encounter: 'enc-datentunnel-splitter', at: [1340, 515], radius: 52, when: EPILOG, avoid: splitterSchleife },
  ],
  foreground: [
    { rect: [600, 265, 320, 70], baseY: 430 }, // Krone des Kabelbaums verdeckt Figuren dahinter
  ],
  lights: [
    { at: [785, 400], radius: 260, color: '#3effc8', intensity: 0.8 }, // Netzknoten
    { at: [835, 525], radius: 60, color: '#3ef2ff' }, // Terminal am Stamm
    { at: [240, 25], radius: 90, color: '#ffc86a' }, // Lampe am Kabelschacht
    { at: [1355, 30], radius: 110, color: '#e8f4ff' }, // Lampe an der Wartungsleiter
    { at: [560, 100], radius: 80, color: '#ffb347' }, // Wandlampen
    { at: [870, 120], radius: 80, color: '#ffb347' },
    { at: [1105, 100], radius: 80, color: '#ffb347' },
    { at: [445, 75], radius: 100, color: '#b04bff' }, // Server-Leuchtleisten
    { at: [655, 75], radius: 100, color: '#b04bff' },
    { at: [920, 75], radius: 100, color: '#3ef2ff' },
    { at: [1190, 75], radius: 100, color: '#b04bff' },
    { at: [665, 125], radius: 70, color: '#5dff7a' }, // offene Schranktür
    { at: [1210, 125], radius: 70, color: '#5dff7a' },
    { at: [70, 600], radius: 90, color: '#ffc86a' }, // Schott
    { at: [330, 600], radius: 70, color: '#ffb347' },
    { at: [495, 595], radius: 70, color: '#ffb347' },
    { at: [1030, 600], radius: 70, color: '#ffb347' },
    { at: [1240, 600], radius: 70, color: '#ffb347' },
    { at: [1450, 470], radius: 120, color: '#5dff7a' }, // Monitor-Nest
    { at: [860, 808], radius: 80, color: '#ffb347' }, // Drohnen-Nische
    { at: [860, 870], radius: 70, color: '#3ef2ff' },
    { at: [1335, 790], radius: 90, color: '#9fd8ff' }, // Antenne
    { at: [1430, 820], radius: 70, color: '#ffb347' },
  ],
  // Kanalvolk und Rohrputzer auf dem Weg zwischen Sammler und Leitern (Passanten für Sprüche und die Stimmen der Zone).
  ambient: {
    count: 2,
    sprites: ['passant-kanalvolk-walk', 'passant-arbeiterin-walk', 'passant-schrotti-walk'],
    routes: [
      [[200, 670], [1250, 670]],
      [[260, 240], [1300, 240]],
      [[240, 300], [240, 680], [600, 680]],
      [[1330, 300], [1330, 700], [1000, 700]],
    ],
    bySlot: { morgen: 2, tag: 3, abend: 2, nacht: 1 },
    barks: [
      { text: 'Fass die Glasfasern nicht an. Die summen. Und wenn’s summt, hört einer zu.', when: NICHT_EPILOG },
      { text: 'Hier unten ist es warm. Server heizen besser als jede Wohnung in der Rohrsiedlung. Und meckern nicht.' },
      { text: 'Der Lautsprecher da oben hat mich gestern beim Namen genannt. Ich hab keinem meinen Namen gesagt. Nie.', when: { all: [NEXUS_WACH, NICHT_EPILOG] } },
      { text: 'Seit oben alle durchdrehen, schlafen hier unten mehr Leute als im Obdachlosenheim. Kein WLAN-Kopfweh, sagen sie.', when: { act: 2 } },
      { text: 'Die Kabel sind still geworden. Vorher war das wie ein Bienenstock. Jetzt ist es nur noch ein Keller.', when: { all: [EPILOG, { not: { flag: 'master_modus' } }] } },
      { text: 'Pssst. Die Kabel hören wieder zu. Für wen auch immer jetzt oben im Turm sitzt. Also halt die Fresse und lauf.', when: { all: [{ flag: 'master_modus' }, { notFlag: 'ende_doch_noch_meer' }] } },
    ],
  },
  ambience: 'kanal',
  music: 'ki-nexus',
  onEnter: [
    { id: 'datentunnel-erstbesuch', once: true, when: NICHT_EPILOG, dialogue: 'datentunnel-ankunft', effects: [{ markSeen: 'datentunnel-ankunft' }] },
    { id: 'datentunnel-splitter', once: true, when: EPILOG, dialogue: 'datentunnel-splitter-ankunft', effects: [{ markSeen: 'datentunnel-splitter-ankunft' }] },
    // Die Leiter ist ab jetzt bekannt; der Campus darf den Abstieg anbieten (Flag laut Plan).
    { id: 'datentunnel-leiter-gefunden', once: true, when: { act: 2 }, effects: [{ setFlag: 'wartungsleiter_gefunden' }] },
  ],
};

export const part: ContentPart = {
  maps: { [datentunnel.id]: datentunnel },
  dialogues,
};
