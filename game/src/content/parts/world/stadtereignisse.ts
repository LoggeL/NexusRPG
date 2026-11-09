// Stadtereignisse und Wochenrhythmus (world.md §3.4 „Woche“/„Feste“, §10.6), soweit über Daten abbildbar:
// - Abendjournal live, täglich 19–20 Uhr am Stufenplatz (Kameramann, Delya; Ruf nx1-medien, eigene Kurzmeldung).
// - Feste am Sonntag im 28-Tage-Zyklus: Neonnacht (Tag 7, Neon-Gasse), Stadtmeisterschaft Eins! (Tag 14, High Voltage),
//   Schrottparade (Tag 28, Schrottmarkt). Gründertag (Tag 21) baut das Stufenplatz-Paket.
// - Plakatsäule am Bahnhof Mitte: Wochenplan „Was läuft heute?“ und das nächste Fest.
// Flohmarkt, Karaoke, Tanz, Bagatellgericht, Drohnenrennen, Collin live liegen bei den Zonen-Paketen.
// Belohnungen hängen an `once`-Wahlen (gilt fürs ganze Spiel): Die Engine kennt keine Tages-/Zyklus-Flags (gaps/world.md).
import type { DialogueDef, DialogueNode, NewsDef, Weekday } from '../../../modules/contracts';
import type { ContentPart } from '../../part';
import {
  AKT1, KARTEN_TURNIER, NEONNACHT, SCHROTTPARADE, VEX, all, byId, cr, cycle, flag, herz, ich, msg, nar, range, rep, say, sendung,
  wcheck, xp,
} from './_w';

const ARIA_ZUSAMMEN = flag('aria_romanze_zusammen');
const ABENDJOURNAL = { clockBetween: [1140, 1200] as const };

// --------------------------------------------------------------------------------------------- Abendjournal live

const abendjournal: DialogueDef = {
  id: 'welt-abendjournal',
  start: 'start',
  nodes: [
    {
      id: 'start',
      lines: [
        nar('Scheinwerfer, Kamerakran, ein Pulk aus Schaulustigen, die so tun, als wären sie zufällig hier. Das NX-1-Abendjournal sendet live vom Stufenplatz.'),
        say('delya-delloraine', 'Guten Abend, Noxius! Wir suchen heute die Stimme der Straße. Sie da. Ja, Sie, mit dem Gesicht.', 'signatur'),
        say('kameramann', '(leise) Nicht in die Linse starren. Und nicht fluchen. Ich muss das sonst piepen, und das Piepen ist kaputt.'),
      ],
      choices: [
        {
          text: '„Die Unterstadt lässt sich nicht kaufen. Nicht von Quantum, nicht von sonst wem.“',
          check: wcheck('abendjournal-ansage', 'ausstrahlung', 5, { faction: 'nx1-medien' }),
          once: true, id: 'aj-unterstadt',
          effects: [{ setFlag: 'tv_passant_unterstadt' }, rep('nx1-medien', 3), rep('unterstadt', 2)],
          next: 'unterstadt',
        },
        {
          text: '„Grüße an Hunter. Du schuldest mir noch einen Drink, du geiziger Sack.“',
          once: true, id: 'aj-hunter',
          effects: [{ setFlag: 'tv_passant_hunter' }, rep('nx1-medien', 1), herz('hunter', 10)],
          next: 'hunter',
        },
        {
          text: '„Aria, falls du zusiehst: Heute Nacht. Dach. Zieh was Warmes an. Oder nicht.“',
          tag: '[Aria ♥]', when: all(VEX, ARIA_ZUSAMMEN, AKT1),
          once: true, id: 'aj-aria',
          effects: [{ setFlag: 'tv_passant_aria' }, rep('nx1-medien', 2), herz('aria', 20)],
          next: 'aria',
        },
        {
          text: 'Hinter Delya Grimassen ziehen, bis die Regie schreit.',
          once: true, id: 'aj-winken',
          effects: [rep('nx1-medien', 1), xp(15)],
          next: 'winken',
        },
        {
          text: 'Das wackelnde Kamerakabel unauffällig festklemmen.',
          check: wcheck('abendjournal-kabel', 'technik', 4), once: true, id: 'aj-kabel',
          effects: [rep('nx1-medien', 2), herz('kameramann', 20)],
          next: 'kabel',
        },
        {
          text: 'Dem Kameramann einen Synth-Kaffee zustecken.',
          requires: { item: 'synth-kaffee' }, once: true, id: 'aj-kaffee',
          effects: [{ take: 'synth-kaffee' }, herz('kameramann', 25), rep('nx1-medien', 1)],
          next: 'kaffee',
        },
        { text: 'Weitergehen. Fernsehen macht dumm, und ich bin schon da.' },
      ],
    },
    {
      id: 'unterstadt',
      lines: [
        ich('Die Unterstadt lässt sich nicht kaufen. Nicht von Quantum, nicht von sonst wem. Wir sind zu billig dafür. Und zu stur.'),
        nar('Für eine Sekunde ist es still am Stufenplatz. Dann klatscht jemand. Dann pfeift jemand. Dann wirft jemand eine Brezel, aber eine freundliche.'),
        say('delya-delloraine', '… Das war die Stimme der Straße. Ziemlich laut, die Straße heute.', 'ueberrascht'),
      ],
      effects: [msg('Deine Ansage läuft morgen in den Kurzmeldungen.')],
    },
    {
      id: 'hunter',
      lines: [
        say('delya-delloraine', 'Hunter, wie in … Hunters Club? Der Hunter?', 'ueberrascht'),
        ich('Genau der. Er weiß, was er getan hat.'),
        say('kameramann', '(murmelt) Geizig darf man sagen. Sack darf man auch sagen. Hab’s nachgeschlagen.'),
      ],
      effects: [msg('Dein Gruß läuft morgen in den Kurzmeldungen. Hunter wird das sehen. Ganz sicher.')],
    },
    {
      id: 'aria',
      lines: [
        ich('Aria, falls du zusiehst: Heute Nacht. Dach. Zieh was Warmes an.', 'signatur'),
        nar('Kurze Pause. Du schaust direkt in die Linse.'),
        ich('Oder nicht.'),
        say('delya-delloraine', 'Das … war live. Das war sehr live. Wir schalten zum Wetter.', 'verlegen'),
        nar('Dein Telefon brummt, noch bevor das Wetter fertig ist: „du bist so tot. dach. 23 uhr. komm ja nicht zu spät“'),
      ],
      effects: [msg('Die ganze Stadt hat es gesehen. Die ganze Stadt.')],
    },
    {
      id: 'winken',
      lines: [
        nar('Du machst Hasenohren hinter Delya. Dann Teufelshörner. Dann etwas, das die Regie in drei Sekunden wegschneidet.'),
        say('delya-delloraine', '(ohne sich umzudrehen) Ich seh dich im Monitor, Arschloch. Lächeln, wir sind live.', 'signatur'),
      ],
    },
    {
      id: 'kabel',
      lines: [
        nar('Ein Griff, ein Klicken, das Bild hört auf zu zittern. Der Kameramann hebt den Daumen, ohne den Blick vom Sucher zu nehmen.'),
        say('kameramann', 'Danke. Seit drei Wochen sage ich, dass das Kabel spinnt. Seit drei Wochen sagt Collin, es liegt an meiner „Energie“.'),
      ],
    },
    {
      id: 'kaffee',
      lines: [
        say('kameramann', 'Synth-Kaffee. Du bist ein Engel. Ein Engel mit schlechtem Geschmack, aber ein Engel.', 'freude'),
        nar('Er trinkt ihn in einem Zug, während die Kamera keinen Millimeter wackelt. Profi.'),
      ],
    },
  ],
};

// --------------------------------------------------------------------------------------------- Neonnacht

const neonnacht: DialogueDef = {
  id: 'welt-neonnacht',
  start: 'start',
  nodes: [
    {
      id: 'start',
      lines: [
        nar('Die Gasse glüht. Jemand hat jede Laterne mit Leuchtfarbe angestrichen, auch die geklaute – sie steht wieder da, mit Schleife. Aus dem High Voltage wummert Bass, auf den Pfützen tanzt Pink.'),
        say('oma-volt', 'Neonnacht, Kindchen! Leuchtfarbe, zehn Credits der Topf. Für Haare, Jacke, Gesicht. Nicht für Zähne. Das hatten wir letztes Jahr.', 'freude'),
      ],
      choices: [
        {
          text: 'Leuchtfarbe kaufen (10 Cr) und sich anmalen.',
          requires: { credits: 10 },
          effects: [cr(-10), { checkBuff: { id: 'neonnacht-farbe', label: 'Neonfarbe', value: 1, attribute: 'ausstrahlung' } }, { sfx: 'coin' }],
          next: 'farbe',
        },
        {
          text: 'Auf die Mülltonne steigen und die Menge anheizen.',
          check: wcheck('neonnacht-menge', 'ausstrahlung', 5, { faction: 'unterstadt' }),
          once: true, id: 'nn-menge',
          effects: [rep('unterstadt', 3), cr(30), { sfx: 'success' }],
          next: 'menge',
        },
        {
          text: 'Mitten in der Gasse tanzen.',
          once: true, id: 'nn-tanz',
          effects: [{ minigame: 'akt-tanz', level: 1, key: 'neonnacht-tanz', label: 'Neonnacht-Tanz', win: [xp(25), rep('unterstadt', 1), msg('Die Gasse johlt. Irgendwer filmt. Morgen bist du ein Meme.')], lose: [msg('Du stolperst über ein Kabel und tanzt den Rest als „Interpretation“.')] }],
        },
        {
          text: 'Noch eine Runde tanzen.',
          when: { wonMinigame: 'neonnacht-tanz' },
          effects: [{ minigame: 'akt-tanz', level: 2, key: 'neonnacht-tanz-zugabe', label: 'Neonnacht-Tanz', win: [msg('Zugabe! Zugabe! (Eine Taube nickt im Takt.)')], lose: [msg('Der Bass ist schneller als deine Beine.')] }],
        },
        {
          text: 'Aria in der Menge suchen.',
          tag: '[Aria ♥]', when: all(VEX, ARIA_ZUSAMMEN, AKT1),
          once: true, id: 'nn-aria',
          effects: [herz('aria', 20), { advanceTime: 45 }],
          next: 'aria',
        },
        { text: 'Nur zuschauen. Ein bisschen Licht tut auch mal gut.', next: 'zuschauen' },
      ],
    },
    {
      id: 'farbe',
      lines: [
        nar('Oma Volt tupft dir einen leuchtenden Blitz auf die Wange, mit der Präzision einer Frau, die früher Platinen gelötet hat.'),
        say('oma-volt', 'So. Jetzt siehst du aus wie jemand, dem man was glaubt. Nutz es, bevor es abgeht.'),
      ],
      effects: [msg('Neonfarbe: +1 Ausstrahlung beim nächsten Check.')],
    },
    {
      id: 'menge',
      lines: [
        ich('NEONNACHT, IHR HALBVERROSTETEN SÄCKE! WER JETZT NICHT TANZT, ZAHLT DIE NÄCHSTE RUNDE!'),
        nar('Die Gasse brüllt zurück. Jemand wirft Credits, jemand einen Schuh, Bruno an der Samtkordel nickt dir zu wie ein Kollege.'),
      ],
      effects: [msg('Trinkgeld der Menge: 30 Cr.')],
    },
    {
      id: 'aria',
      lines: [
        nar('Du findest sie am Rand der Tanzfläche, wo das Neon pink auf ihre Schultern fällt. Jemand hat ihr Leuchtfarbe ins Haar geschmiert. Sie hat ihm dafür eine geschmiert.'),
        say('aria', 'Da bist du ja. Ich hab schon angefangen, mich zu langweilen. Das ist gefährlich, frag den Typen da drüben.', 'signatur'),
        nar('Sie taucht zwei Finger in einen Farbtopf, ohne zu fragen, und drückt dir ihre leuchtende Hand mitten auf die Brust. Langsam. Mit Absicht.'),
        say('aria', 'Markiert. Damit jeder in dieser Gasse weiß, wem du gehörst.', 'zaertlich'),
        ich('Und wo ist meine Markierung auf dir?'),
        say('aria', 'Such sie.', 'signatur'),
        nar('Sie zieht dich am Kragen hinter die Mülltonnen, wo das Neon nicht hinkommt. Nur der Abdruck auf deiner Brust leuchtet noch. Dann ihre Finger. Dann wandern sie.'),
        nar('Der Bass aus dem Club übertönt alles. Das ist auch besser so.'),
      ],
      effects: [msg('Eine Dreiviertelstunde später hast du mehr Leuchtfarbe an dir als Oma Volt im ganzen Topf.')],
    },
    {
      id: 'zuschauen',
      lines: [nar('Pink, Cyan, Violett. Für einen Abend sieht die Unterstadt aus, als hätte sie es so gewollt.')],
      effects: [{ heal: 10 }],
    },
  ],
};

// --------------------------------------------------------------------------------------------- Stadtmeisterschaft Eins!

const turnier: DialogueDef = {
  id: 'welt-eins-stadtmeisterschaft',
  start: 'start',
  nodes: [
    {
      id: 'start',
      lines: [
        nar('Am Stammtisch liegen sechs Kartenstapel und ein Pokal aus einem lackierten Ölkännchen. Um den Tisch: Leute, die ihre Großmutter für eine Plus-Vier verkaufen würden.'),
        say('barkeeper', 'Stadtmeisterschaft Eins! Startgeld zwanzig. Wer schummelt, fliegt. Wer beim Schummeln erwischt wird, fliegt weiter.'),
      ],
      choices: [
        {
          text: 'Antreten (20 Cr).',
          when: { not: { wonMinigame: 'eins-stadtmeisterschaft' } }, requires: { credits: 20 },
          effects: [
            cr(-20), { advanceTime: 60 },
            { minigame: 'akt-eins', level: 4, key: 'eins-stadtmeisterschaft', label: 'Stadtmeisterschaft Eins!', win: [cr(200), xp(80), rep('unterstadt', 3), msg('Stadtmeisterin, Stadtmeister, Stadtmonster: Du hast gewonnen. 200 Cr und ein Ölkännchen-Pokal (leider nur fürs Foto).')], lose: [msg('Rausgeflogen in Runde drei. Gegen ein Kind. Mit nur Plus-Vier-Karten.')] },
          ],
        },
        {
          text: 'Titel verteidigen (20 Cr).',
          when: { wonMinigame: 'eins-stadtmeisterschaft' }, requires: { credits: 20 },
          effects: [
            cr(-20), { advanceTime: 60 },
            { minigame: 'akt-eins', level: 5, key: 'eins-titelverteidigung', label: 'Titelverteidigung', win: [cr(60), xp(20), msg('Titel verteidigt. Der Barkeeper nickt. Das ist bei ihm ein Ehrenkranz.')], lose: [msg('Entthront. Der neue Champion trägt deinen Pokal wie eine Krone. Arschloch.')] },
          ],
        },
        {
          text: 'Den Favoriten am Nebentisch beim Mischen beobachten.',
          check: wcheck('turnier-zinken', 'strasse', 5), once: true, id: 'eins-zinken',
          effects: [xp(20), rep('unterstadt', 1)],
          next: 'zinken',
        },
        { text: 'Lieber zuschauen. Und Popcorn klauen.', next: 'zuschauen' },
      ],
    },
    {
      id: 'zinken',
      lines: [
        nar('Der Favorit mischt mit links und hält rechts eine Karte im Ärmel. Ein Blick zum Barkeeper, ein Nicken. Zwei Sekunden später fliegt der Favorit. Dann weiter.'),
        say('barkeeper', 'Gutes Auge. Der nächste Drink geht auf … dich. Aber ich mach ihn stark.'),
      ],
    },
    {
      id: 'zuschauen',
      lines: [nar('Eine Plus-Vier, noch eine Plus-Vier, ein Aufschrei, ein umgeworfener Stuhl. Dante wäre stolz. Oder würde weinen. Bei Dante weiß man das nie.')],
    },
  ],
};

// --------------------------------------------------------------------------------------------- Schrottparade

const parade: DialogueDef = {
  id: 'welt-schrottparade',
  start: 'start',
  nodes: [
    {
      id: 'start',
      lines: [
        nar('Schrottbots in Reih und Glied. Na ja, in Reih. Glied ist Ansichtssache. Opa Gustav lenkt den Kran wie einen Festwagen, am Haken baumelt ein glitzernder Kühlschrank.'),
        say('opa-gustav', 'Kind! Der Paradewagen klemmt! Schieben oder flicken, mir egal – Hauptsache, der Kühlschrank fällt nicht auf den Bürgermeister. Der ist extra aus dem Kanal hochgekommen.', 'besorgt'),
      ],
      choices: [
        {
          text: 'Den Paradewagen mit der Schulter anschieben.',
          check: wcheck('parade-schieben', 'koerper', 5), once: true, id: 'sp-schieben',
          effects: [rep('unterstadt', 3), herz('opa-gustav', 20)],
          next: 'geschafft',
        },
        {
          text: 'Die verbogene Achse mit Draht flicken.',
          check: wcheck('parade-achse', 'technik', 5), once: true, id: 'sp-achse',
          effects: [rep('unterstadt', 3), herz('opa-gustav', 20)],
          next: 'geschafft',
        },
        {
          text: 'Ein Ersatzteil als Keil unters Rad stopfen.',
          requires: { item: 'schrott-ersatzteil' }, once: true, id: 'sp-teil',
          effects: [{ take: 'schrott-ersatzteil' }, rep('unterstadt', 2), herz('opa-gustav', 15)],
          next: 'geschafft',
        },
        {
          text: 'Die Kinder holen – zu fünft schiebt sich alles.',
          once: true, id: 'sp-kinder',
          effects: [{ advanceTime: 30 }, rep('unterstadt', 2), herz('opa-gustav', 10)],
          next: 'kinder',
        },
        { text: 'Konfetti werfen. Viel Konfetti.', once: true, id: 'sp-konfetti', effects: [xp(10)], next: 'konfetti' },
        { text: 'Weitergehen, bevor der Kühlschrank fällt.' },
      ],
    },
    {
      id: 'geschafft',
      lines: [
        nar('Ein Ruck, ein Quietschen, der Wagen rollt. Der Kühlschrank schwingt einmal gefährlich über Bürgermeister Gully und bleibt hängen. Gully salutiert ihm.'),
        say('opa-gustav', 'HA! So macht man das! Früher haben wir das mit Spucke und Gebeten gemacht. Spucke hat besser funktioniert.', 'freude'),
      ],
    },
    {
      id: 'kinder',
      lines: [
        nar('Eine halbe Stunde später schieben fünf Kinder, ein Hund aus Blech und du den Wagen über den Markt. Niemand weiß, wer lenkt. Es funktioniert trotzdem.'),
        say('opa-gustav', 'Teamarbeit! Das sollte man im Fernsehen zeigen. Stattdessen zeigen die Pudel.', 'freude'),
      ],
    },
    {
      id: 'konfetti',
      lines: [nar('Du wirfst Konfetti. Ein Schrottbot hält es für Futter. Der Schrottbot ist jetzt sehr glücklich und sehr bunt.')],
    },
  ],
};

// --------------------------------------------------------------------------------------------- Plakatsäule (Wochenplan)

const TAGE: Record<Weekday, [string, string[]]> = {
  mo: ['Montag', [
    '12 Uhr: Collin live am Stufenplatz. Bitte winken, nicht zu doll.',
    'Babettes Garküche: Ruhetag. „Auch Kochlöffel brauchen Urlaub.“',
    'High Voltage: Der Barkeeper hat abends frei. Hunter mixt. Gott steh euch bei.',
  ]],
  di: ['Dienstag', [
    'Nachts: Karaoke im High Voltage, Moderation: Collin Charleston.',
    'Glasarkaden: Chrome-10-Werbestand. (Darunter, mit Edding: „NICHT ANFASSEN“.)',
    'Hafen-Hannes rät: Nachts von Container 77 fernhalten. Warum, sagt er nicht.',
  ]],
  mi: ['Mittwoch', [
    '12 Uhr: Collin live am Stufenplatz.',
    '10–14 Uhr: Bagatellgericht im Eisenhof. Zuschauen kostenlos, Aussagen auch.',
    'Rennhalle 9: Schrottbot-Rennen „wegen Umbau verschoben“. (Seit drei Jahren.)',
  ]],
  do: ['Donnerstag', [
    'Abends: Eins!-Abend in Dantes Werkstatt. Kekse frei, Verlieren auch.',
    'Gekritzelt: „Der Richter spielt donnerstags heimlich Karten im High Voltage. Psst.“',
  ]],
  fr: ['Freitag', [
    '12 Uhr: Collin live am Stufenplatz.',
    'Nachts: Karaoke und Tanzfläche im High Voltage. Wachmann Pfeffer kommt auch. Leider.',
    'Abends: Drohnenrennen an den Rostkai-Kränen.',
    'Gustavs Oldie-Stunde im Radio. Lauter als nötig.',
  ]],
  sa: ['Samstag', [
    'Marla Sand aus der Ödnis am Schrottmarkt. Wasserfilter, Trockenobst, Geschichten.',
    'Nachts: Tanzfläche im High Voltage. Gerücht: Dante tanzt. Augenzeugen bestätigen. Leider.',
  ]],
  so: ['Sonntag', [
    '10–17 Uhr: Flohmarkt am Schrottmarkt. Eigener Stand möglich.',
    'Früh morgens: Hunter angelt mit Käpt’n Nebelhorn an der Hafenkante. (Hunter: „Tu ich nicht.“)',
  ]],
};

const FESTE: [string, number[], string][] = [
  ['neonnacht', range(1, 7), 'Neonnacht – die Unterstadt leuchtet, doppelte Trinkgelder, Tanz in der Neon-Gasse.'],
  ['turnier', range(8, 14), 'Stadtmeisterschaft Eins! – abends im High Voltage, Startgeld 20 Cr.'],
  ['gruendertag', range(15, 21), 'Gründertag – Quantum feiert sich am Stufenplatz, Collin live, Gratis-Häppchen.'],
  ['parade', range(22, 28), 'Schrottparade – Schrottbots, Konfetti und Opa Gustavs Kran über dem Schrottmarkt.'],
];

const plakatNodes: DialogueNode[] = [
  {
    id: 'start',
    lines: [nar('Eine Säule voller Plakate, übereinander geklebt wie Jahresringe. Ganz oben, frisch: der Wochenplan. Darunter das nächste Fest. Darunter ein vermisster Hamster.')],
    choices: [
      ...(Object.keys(TAGE) as Weekday[]).map((d) => ({ text: `Was läuft heute? (${TAGE[d][0]})`, when: { weekday: d }, next: `tag-${d}` })),
      ...FESTE.map(([id, days]) => ({ text: 'Wann ist das nächste Fest?', when: cycle(...days), next: `fest-${id}` })),
      { text: 'Täglich: Abendjournal?', next: 'abendjournal' },
      { text: 'Der vermisste Hamster.', next: 'hamster' },
      { text: 'Gehen.' },
    ],
  },
  ...(Object.keys(TAGE) as Weekday[]).map((d): DialogueNode => ({
    id: `tag-${d}`,
    lines: [nar(`${TAGE[d][0]}:`), ...TAGE[d][1].map((t) => nar(`· ${t}`))],
    next: 'start',
  })),
  ...FESTE.map(([id, , text]): DialogueNode => ({
    id: `fest-${id}`,
    lines: [
      nar(`Diesen Sonntag: ${text}`),
      ...(id === 'neonnacht' ? [nar('Darunter klebt ein Zettel: „Leuchtfarbe bei Oma Volt. Nicht für Zähne.“')] : []),
    ],
    next: 'start',
  })),
  {
    id: 'abendjournal',
    lines: [nar('Jeden Abend 19 Uhr: NX-1-Abendjournal live vom Stufenplatz. „Werden Sie die Stimme der Straße!“ Jemand hat „Stimme“ durchgestrichen und „Fresse“ drübergeschrieben.')],
    next: 'start',
  },
  {
    id: 'hamster',
    lines: [nar('„VERMISST: Bernd. Hamster. Antwortet auf ‚Bernd‘. Hat ein Implantat im linken Ohr und schlechte Laune. Finderlohn: ein Händedruck.“ Das Plakat ist zwei Jahre alt. Bernd ist vermutlich Bürgermeister im Kanal.')],
    next: 'start',
  },
];

const plakatsaeule: DialogueDef = { id: 'welt-plakatsaeule', start: 'start', nodes: plakatNodes };

// --------------------------------------------------------------------------------------------- Eigene Kurzmeldungen

/** Was die Spielfigur im Abendjournal gesagt hat, läuft am nächsten Tag in den Kurzmeldungen (akt-fernsehen). */
const passantNews: NewsDef[] = [
  sendung('news-passant-unterstadt', 'Die Stimme der Straße', [
    say('delya-delloraine', 'Gestern im Abendjournal: eine Stimme aus der Unterstadt. „Wir sind zu billig, um uns kaufen zu lassen. Und zu stur.“', 'neutral'),
    say('collin-charleston', 'Die Quote war so hoch wie seit meiner Perücken-Folge nicht mehr. Nicht dass ich je eine Perücke …', 'verlegen'),
  ], flag('tv_passant_unterstadt'), 3),
  sendung('news-passant-hunter', 'Ein offener Brief an Hunter', [
    say('collin-charleston', 'Ein Passant hat gestern live einen gewissen Hunter einen „geizigen Sack“ genannt. Hunter, falls du zusiehst: Zahl deine Drinks. Auch meine.', 'freude'),
  ], flag('tv_passant_hunter'), 3),
  sendung('news-passant-aria', 'Liebesgruß live aufs Dach', [
    say('collin-charleston', 'Die meistgesehene Szene der Woche: ein Liebesgruß, live in unsere Kamera, adressiert an eine gewisse Aria. „Dach. Zieh was Warmes an. Oder nicht.“', 'freude'),
    say('delya-delloraine', 'Wir haben bei Aria nachgefragt. Zitat: „Kein Kommentar. Und wer das noch einmal abspielt, kriegt eine.“', 'signatur'),
    say('collin-charleston', 'Wir spielen es nicht noch einmal ab. Wir sind ja nicht lebensmüde.', 'besorgt'),
  ], flag('tv_passant_aria'), 3),
];

// --------------------------------------------------------------------------------------------- Platzierung

const ABEND_NACHT = { time: ['abend', 'nacht'] as const };

export const part: ContentPart = {
  news: byId(passantNews),
  dialogues: {
    [abendjournal.id]: abendjournal,
    [neonnacht.id]: neonnacht,
    [turnier.id]: turnier,
    [parade.id]: parade,
    [plakatsaeule.id]: plakatsaeule,
  },
  mapAdditions: {
    stufenplatz: {
      hotspots: [
        { id: 'welt-abendjournal', at: [940, 520], radius: 80, label: 'Abendjournal live (NX-1)', kind: 'talk', dialogue: abendjournal.id, when: ABENDJOURNAL },
      ],
      onEnter: [
        { id: 'welt-abendjournal-hinweis', once: true, when: ABENDJOURNAL, effects: [msg('19 Uhr: Das NX-1-Abendjournal sendet live vom Stufenplatz. Der Kameramann sucht Gesichter.')] },
      ],
    },
    'neon-gasse': {
      hotspots: [
        { id: 'welt-neonnacht', at: 'gassenmitte', radius: 80, label: 'Neonnacht feiern', kind: 'talk', dialogue: neonnacht.id, when: all(NEONNACHT, ABEND_NACHT, AKT1) },
      ],
      onEnter: [
        { id: 'welt-neonnacht-hinweis', once: true, when: all(NEONNACHT, ABEND_NACHT), effects: [msg('Neonnacht! Die Unterstadt leuchtet – in der Gassenmitte wird gefeiert, im Club gibt es doppelte Trinkgelder.')] },
      ],
    },
    'high-voltage': {
      hotspots: [
        { id: 'welt-eins-stadtmeisterschaft', at: 'stammtisch', radius: 70, label: 'Stadtmeisterschaft Eins!', kind: 'talk', dialogue: turnier.id, when: all(KARTEN_TURNIER, ABEND_NACHT) },
      ],
      onEnter: [
        { id: 'welt-turnier-hinweis', once: true, when: all(KARTEN_TURNIER, ABEND_NACHT), effects: [msg('Heute Abend: Stadtmeisterschaft Eins! am Stammtisch.')] },
      ],
    },
    schrottmarkt: {
      hotspots: [
        { id: 'welt-schrottparade', at: 'marktplatz-mitte', radius: 80, label: 'Schrottparade', kind: 'talk', dialogue: parade.id, when: all(SCHROTTPARADE, { time: ['morgen', 'tag', 'abend'] }) },
      ],
      onEnter: [
        { id: 'welt-parade-hinweis', once: true, when: SCHROTTPARADE, effects: [msg('Schrottparade! Schrottbots, Konfetti und ein Kühlschrank am Kran ziehen über den Markt.')] },
      ],
    },
    'bahnhof-mitte': {
      hotspots: [
        { id: 'welt-plakatsaeule', at: [956, 470], radius: 60, label: 'Plakatsäule (Wochenplan)', kind: 'look', dialogue: plakatsaeule.id },
      ],
    },
  },
};
