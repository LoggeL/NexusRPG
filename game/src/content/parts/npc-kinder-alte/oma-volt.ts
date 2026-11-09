// Oma Volt (Kiosk Volt-Eck, Neon-Gasse): NpcDef, Tagesgespräche nach Wochentag, he-oma-volt-2/4/6 (world.md §4.4).
// Weltfigur mit erweitertem Eintrag: höchstens 6 Herzen. Kein Begleiter, keine Romanze.
// side-oma-volts-lager (Rostzähne, Opa Blech) und side-ki-fluestern (Akt 2, Neffe Paul) baut der Quest-Agent.
// he-oma-volt-6 läuft in Akt 1 als Vorahnung (Paul ist „so komisch höflich“); die Quest startet ab Akt 2 im Gespräch.
import type { DialogueChoice, DialogueLine, ItemDef, NpcDef } from '../../../modules/contracts';
import type { ContentPart } from '../../part';
import { AKT2, L, N, VEX, NICHT_VEX, chk, dialogs, dlg, herz, node } from './_dsl';

const O = 'oma-volt';
const LAGER_FERTIG = { quest: 'side-oma-volts-lager', state: 'done' } as const;

const rezept: ItemDef = {
  id: 'rezept-blitzbrause',
  name: 'Rezept: Großmutters Blitzbrause',
  category: 'quest',
  icon: 'rezept-blitzbrause',
  price: 0,
  sellable: false,
  giftTags: ['rezept'],
  description: 'Oma Volts Familienrezept auf einer Rabattmarke: Zitrone, Zucker, Sprudel und „ein Hauch Strom“. Die Menge Strom ist mit „Gefühl“ angegeben und dreimal unterstrichen.',
  inspect: 'Ganz unten, sehr klein: „Nicht an Hunter weitergeben. Der macht Cocktails draus.“',
};

const npc: NpcDef = {
  id: O,
  name: 'Oma Volt',
  unknownName: 'Alte Frau im Kiosk',
  portrait: 'oma-volt',
  sprite: 'oma-volt-walk',
  faction: 'unterstadt',
  maxHearts: 6,
  bio: 'Kioskbesitzerin des Volt-Eck in der Neon-Gasse. Kennt jeden, näht alles, hat einen eingemotteten Sicherheitsroboter „Opa Blech“ und einen Neffen Paul.',
  gifts: {
    loves: ['nadel-und-faden', 'hofhonig', 'kraeuter-gebaeck'],
    likes: ['synth-kaffee', 'comic-heft', 'zeitung-papier', 'echtobst-apfel'],
    dislikes: ['volt-limo'],
    hates: ['virus-implantat', 'rostige-dose'],
  },
  schedule: [
    { slot: 'tag', days: ['so'], place: { map: 'schrottmarkt', at: 'flohmarkt' } },
    { slot: ['morgen', 'tag', 'abend'], place: { map: 'neon-gasse', at: 'kiosk' } },
    { place: 'away' },
  ],
  heartEvents: [
    {
      id: 'he-oma-volt-2', hearts: 2, map: 'neon-gasse', time: ['morgen', 'tag'], when: { not: { weekday: 'so' } },
      dialogue: 'dlg-he-oma-volt-2', effects: [{ xp: 25 }, { give: 'rezept-blitzbrause' }, { setFlag: 'rezept_blitzbrause' }],
    },
    {
      id: 'he-oma-volt-4', hearts: 4, map: 'neon-gasse', time: 'tag', when: { not: { weekday: 'so' } },
      dialogue: 'dlg-he-oma-volt-4', effects: [{ xp: 35 }, { setFlag: 'opa_blech_kioskwaechter' }],
    },
    {
      id: 'he-oma-volt-6', hearts: 6, map: 'neon-gasse', time: 'abend',
      dialogue: 'dlg-he-oma-volt-6', effects: [{ xp: 45 }, { setFlag: 'paul_komisch' }],
    },
  ],
  talk: [
    { dialogue: 'oma-volt-sauer', when: { rival: O } },
    {
      dialogue: 'oma-volt-paul',
      when: { all: [AKT2, { flag: 'paul_komisch' }, { quest: 'side-ki-fluestern', state: 'inactive' }] },
    },
    { dialogue: 'oma-volt-lager', when: { quest: 'side-oma-volts-lager', state: 'active' } },
    { dialogue: 'oma-volt-flohmarkt', when: { all: [{ weekday: 'so' }, { time: 'tag' }] } },
    { dialogue: 'oma-volt-morgen', when: { time: 'morgen' } },
    { dialogue: 'oma-volt-mo', when: { weekday: 'mo' } },
    { dialogue: 'oma-volt-di', when: { weekday: 'di' } },
    { dialogue: 'oma-volt-mi', when: { weekday: 'mi' } },
    { dialogue: 'oma-volt-do', when: { weekday: 'do' } },
    { dialogue: 'oma-volt-fr', when: { weekday: 'fr' } },
    { dialogue: 'oma-volt-sa', when: { weekday: 'sa' } },
    { dialogue: 'oma-volt-so' },
  ],
};

/** Standardwahlen am Kiosk: einkaufen, flicken lassen, gehen. */
const kiosk: DialogueChoice[] = [
  { text: '„Zeig mal, was du hast.“', effects: [{ shop: 'volt-eck' }] },
  {
    text: '„Kannst du mir das hier flicken?“ (15 Cr)', requires: { credits: 15 }, next: 'flicken',
    effects: [
      { credits: -15 },
      { checkBuff: { id: 'oma-volt-geflickt', label: 'Frisch geflickt', value: 1, attribute: 'ausstrahlung' } },
    ],
  },
  { text: '„Bis dann, Oma.“' },
];
const flicken = node('flicken', [
  N('Oma Volt fädelt ein, ohne hinzusehen, sticht dreimal zu, beißt den Faden ab. Der Riss ist weg. Sie hat auch gleich einen losen Knopf angenäht, den du gar nicht hattest.'),
  L(O, 'So. Jetzt siehst du aus wie ein Mensch und nicht wie ein Unfall mit Taschen.', 'signatur'),
]);

/** Klatsch nach Wochentag (world.md §3.4). */
const klatsch = (day: string, lines: DialogueLine[]) =>
  dlg(`oma-volt-${day}`, [node('a', lines, { choices: kiosk }), flicken]);

const dialogues = dialogs(
  // ------------------------------------------------------------------------------------------- Tagesgespräche
  dlg('oma-volt-morgen', [
    node('a', [
      N('Das Volt-Eck hat gerade aufgemacht. Oma Volt stapelt Zeitungen, die keiner mehr liest, und brüht Kaffee, den jeder trinkt.'),
      L(O, 'Morgen, Kindchen. Du siehst aus, als hättest du nicht geschlafen. Oder als hättest du geschlafen, aber in einer Mülltonne.', 'signatur'),
    ], {
      choices: [
        { text: '„Einen Kaffee, bitte.“', requires: { credits: 3 }, effects: [{ credits: -3 }, { heal: 5 }], next: 'kaffee' },
        { text: '[Vex] „Pakete für heute?“', when: VEX, next: 'pakete' },
        ...kiosk,
      ],
    }),
    node('kaffee', [
      L(O, 'Drei Credits. Schwarz, weil Milch hier eine Legende ist. Pass auf, der weckt Tote. Hab ich schon zweimal gesehen.', 'freude'),
    ]),
    node('pakete', [
      L(O, 'Zwei für den Bahnhof, eins für Babette. Das für Babette ist ein Fischmesser, frag nicht. Und nicht reingucken, Vex. Ich seh das. Ich seh immer alles.', 'signatur'),
    ]),
    flicken,
  ]),

  klatsch('mo', [
    L(O, 'Montag. Babette hat Ruhetag, der Barkeeper hat frei, und Hunter mixt heut Abend selbst. Kindchen, bestell dir bloß nix mit mehr als zwei Zutaten.', 'signatur'),
    L(O, 'Und Collin ist mittags live am Stufenplatz. Hab meine gute Bluse an. Nur für den Fall, dass er mich im Hintergrund filmt. Der filmt immer jemand anderen, der Sack.'),
  ]),
  klatsch('di', [
    L(O, 'Dienstag ist Karaoke im High Voltage. Letzte Woche hat Dexter „Mein Herz ist ein Akku“ gesungen. Drei Leute sind gegangen. Einer davon war Bruno, und der ist Türsteher.', 'signatur'),
    L(O, 'In den Glasarkaden stehen sie heute wieder mit ihrem „Chrome 10“-Stand. Kostenloses Glück für alle. Kindchen, wenn was kostenlos ist, bist du die Ware.', 'besorgt'),
  ]),
  klatsch('mi', [
    L(O, 'Mittwoch. Der Richter hält wieder Bagatellgericht. Die kleine Freya sitzt in der ersten Reihe und guckt, als würde sie gleich selber urteilen. Würd ich ihr zutrauen.', 'freude'),
    L(O, 'Und Collin ist wieder live. Zweimal die Woche guck ich jetzt in die Kamera. Irgendwann sieht er mich. Und dann ist er dran.'),
  ]),
  klatsch('do', [
    L(O, 'Psst. Komm näher. Noch näher. Nicht so nah, du riechst nach Hafen.', 'signatur'),
    L(O, 'Der Richter spielt donnerstags heimlich Karten im High Voltage. Ecktisch, mit Sonnenbrille und falschem Schnurrbart. Der Schnurrbart ist von mir. Den hat er bar bezahlt.', 'freude'),
    L(O, 'Und abends bei Dante ist Eins!. Wenn du hingehst, nimm Kekse mit und verlier gegen Daria. Dann hast du Ruhe für eine Woche.'),
  ]),
  klatsch('fr', [
    L(O, 'Freitag! Karaoke, Drohnenrennen am Hafen und abends Gustavs Oldie-Stunde. Der alte Schrottkopf legt Platten auf, die älter sind als meine Hüfte. Und die ist aus Titan.', 'freude'),
    L(O, 'Wachmann Pfeffer hängt heut auch im Club rum. Der trinkt Milch. In einem Club. Ich trau keinem, der Milch trinkt, wenn’s Kaffee gibt.'),
  ]),
  klatsch('sa', [
    L(O, 'Samstag. Dante tanzt heut Nacht im Club. Wenn du das siehst, kannst du nie wieder ernst mit ihm reden. Ich hab’s einmal gesehen. Ich lach jetzt noch, wenn er „Hallo“ sagt.', 'freude'),
    L(O, 'Und am Markt ist Marla aus der Ödnis. Die hat echten Honig. ECHTEN, Kindchen. Wenn du mir einen mitbringst, vererb ich dir meinen Kiosk. Vielleicht. Halb.', 'signatur'),
  ]),
  klatsch('so', [
    L(O, 'Sonntag ist Flohmarkt. Ich bin den ganzen Tag drüben am Schrottmarkt, mein Stand ist der mit den sortierten Knöpfen. Ja, sortiert. Nach Farbe UND Durchmesser. Ich bin keine Wilde.', 'signatur'),
  ]),

  dlg('oma-volt-flohmarkt', [
    node('a', [
      N('Oma Volts Flohmarktstand: drei Kisten Knöpfe, sortiert nach Farbe und Durchmesser, ein Korb Strickmützen und ein Schild: „ANFASSEN KOSTET“.'),
      L(O, 'Kindchen! Kauf mir was ab, sonst steh ich hier für die Katz. Und die Katz kauft nix, die klaut nur.', 'freude'),
      L(O, 'Gustav hat seinen Stand neben meinen gestellt. Mit Absicht. Damit er mich den ganzen Tag ärgern kann. Der alte Rostkopf.', 'signatur'),
    ], {
      choices: [
        { text: '(Einen Knopf kaufen. Den blauen.)', requires: { credits: 2 }, effects: [{ credits: -2 }, herz(O, 5)], next: 'knopf' },
        { text: '„Du magst Gustav, oder?“', next: 'gustav' },
        { text: '„Schönen Flohmarkt, Oma.“' },
      ],
    }),
    node('knopf', [L(O, 'Gute Wahl. Der ist von einer Uniform aus der Oberstadt. Der hat schon mehr gesehen als du. Halt ihn in Ehren.', 'freude')]),
    node('gustav', [
      L(O, 'Pah. Der ist seit zwanzig Jahren nicht über seine Elsa weg. Und ich nicht über meinen Heinz. Wir sind zwei alte Konservendosen, die nebeneinander rosten.', 'besorgt'),
      L(O, 'Das ist keine Liebe, Kindchen. Das ist Gesellschaft. Ist manchmal mehr wert.'),
    ]),
  ]),

  dlg('oma-volt-lager', [
    node('a', [
      L(O, 'Die Rostzähne wollen Schutzgeld. Für meine LEUCHTREKLAME. Die leuchtet seit 2059, die hat mehr Schutz gesehen als die ganzen Rotznasen zusammen.', 'wut'),
      L(O, 'Heut Abend kommen sie kassieren. Ich hab einen Nudelholz und eine Meinung. Mehr nicht.'),
    ], {
      choices: [
        { text: '„Ich bin da, wenn sie kommen.“', effects: [herz(O, 5)], next: 'da' },
        { text: '„Was ist mit Opa Blech?“', next: 'blech' },
      ],
    }),
    node('da', [L(O, 'Du bist ein gutes Kind. Ein dummes, aber ein gutes. Komm nicht zu spät. Ich hau sonst allein zu, und dann tut’s mir morgen im Kreuz weh.', 'freude')]),
    node('blech', [L(O, 'Der steht im Lager am Schrottmarkt und rostet. Wenn den einer wach kriegt, kriegt er von mir Kaffee umsonst. Bis an sein Lebensende. Oder meins.', 'besorgt')]),
  ]),

  dlg('oma-volt-paul', [
    node('a', [
      L(O, 'Kindchen. Paul ist schlimmer geworden. Er hat heute meinen Kiosk gefegt. Ohne dass ich was gesagt hab. Und dann hat er „Master“ gesagt. Zu einem Besen.', 'besorgt'),
      L(O, 'Und er ist nicht der Einzige. Der Bäcker am Bahnhof, die Kleine vom Netzcafé – alle so freundlich. Alle so … leer. Wie Schaufensterpuppen mit Manieren.'),
      L(O, 'Du findest raus, was mit denen los ist. Bitte. Ich frag nicht oft. Ich frag eigentlich nie.', 'wut'),
    ], {
      choices: [
        { text: '„Ich kümmer mich drum, Oma.“', effects: [{ startQuest: 'side-ki-fluestern' }], next: 'danke' },
        { text: '„Später. Ich hab gerade zu viel um die Ohren.“' },
      ],
    }),
    node('danke', [L(O, 'Danke. Und wenn du ihn findest – den, der das macht –, dann hau ihm eine. Von mir. Mit Schwung.', 'signatur')]),
  ]),

  dlg('oma-volt-sauer', [
    node('a', [
      N('Am Volt-Eck hängt ein Schild: „FÜR DICH GESCHLOSSEN“. Oma Volt hinter der Scheibe tut so, als würde sie dich nicht sehen. Sehr laut.'),
      L(O, 'Ach, guck. Undank kommt mich besuchen. Undank kauft hier nix. Undank kann woanders seine Kaugummis klauen.', 'wut'),
    ], {
      choices: [
        {
          text: '„Oma, ich hab Mist gebaut. Hier, Kräutergebäck. Selbst gekauft.“',
          requires: { item: 'kraeuter-gebaeck' },
          effects: [{ take: 'kraeuter-gebaeck' }, { reconcile: O }],
          next: 'frieden',
        },
        { text: '„Es tut mir leid.“', next: 'sorry' },
        { text: '(Gehen.)' },
      ],
    }),
    node('sorry', [L(O, 'Leid tun ist billig, Kindchen. Kräutergebäck ist teuer. Merkst du was?', 'signatur')]),
    node('frieden', [
      L(O, '…Mit Rosmarin. Du weißt, dass ich Rosmarin mag. Das ist unfair.', 'freude'),
      L(O, 'Na gut. Schild kommt ab. Aber ich behalt’s. Für nächstes Mal.'),
    ]),
  ]),

  // ------------------------------------------------------------------------------------------- Herz-Ereignisse
  dlg('dlg-he-oma-volt-2', [
    node('a', [
      N('Am Volt-Eck klappert es. Oma Volt hat drei Flaschen, eine Zitrone, eine Tüte Zucker und eine alte Autobatterie auf den Tresen gestellt. Sie trägt eine Schutzbrille. Über der Lesebrille.'),
      L(O, 'Kindchen! Gut, dass du kommst. Ich brauch zwei Hände, die nicht zittern. Meine zittern nicht, aber ich brauch sie zum Schimpfen.', 'signatur'),
      L(O, 'Großmutters Blitzbrause. Familienrezept. Meine Oma hat’s 2011 erfunden, als der Strom ausfiel und die Limo warm wurde. Die einzige Limo, die prickelt, BEVOR du sie trinkst.'),
      L(O, 'Also. Was kommt zuerst rein?'),
    ], {
      choices: [
        { text: '„Zitrone.“', next: 'zitrone' },
        { text: '„Der Strom.“', next: 'strom' },
        { text: '„Der Zucker.“', next: 'zucker' },
      ],
    }),
    node('strom', [
      L(O, 'Kindchen, NEIN!', 'wut'),
      N('Zu spät. Du hältst die Kabel an die Flasche. Es zischt, es knallt, und Oma Volts Haare stehen zwei Sekunden lang senkrecht. Danach sehen sie genauso aus wie vorher. Oma Volt hat Erfahrung.'),
      L(O, 'Strom kommt ZULETZT. Wer zuerst den Strom reinmacht, hat nachher kein Rezept, sondern eine Beerdigung.', 'signatur'),
    ], { effects: [{ damage: 3 }], next: 'zitrone' }),
    node('zucker', [
      L(O, 'Zucker zuerst, sagt sie. Kindchen, dann klebt’s am Boden wie Dexter an seinen Schulden. Zitrone. Immer erst die Zitrone. Die ist sauer, die macht Platz.', 'signatur'),
    ], { next: 'zitrone' }),
    node('zitrone', [
      N('Zitrone, dann Zucker, dann Sprudel. Oma Volt schüttelt die Flasche mit beiden Händen, als würde sie jemanden schütteln, der ihr Geld schuldet.'),
      L(O, 'Und jetzt der Strom. Aber mit Gefühl. Mit GEFÜHL, Kindchen. Nicht wie Ripper an einem Kinderarm.'),
    ], {
      choices: [
        {
          text: '(Die Kabel nur ganz kurz an den Flaschenhals tippen.)',
          check: chk('he-oma-volt-2-gefuehl', 'reflexe', 4, ['geschick']),
          next: 'perfekt',
        },
        {
          text: '(Die Spannung an der Batterie runterregeln, bevor du die Kabel anlegst.)',
          check: chk('he-oma-volt-2-technik', 'technik', 4, ['maschine']),
          next: 'perfekt',
        },
        { text: '(Oma Volt die Kabel geben.) „Mach du. Ich guck zu und lern.“', next: 'oma' },
      ],
    }),
    node('perfekt', [
      N('Ein leises „Bzzt“. Die Flasche leuchtet einen Moment blassblau. Als Oma Volt sie aufmacht, springen kleine Funken aus dem Hals, wie Sterne, die zu früh dran sind.'),
      L(O, 'Na also. Na ALSO! Das ist sie. Genau wie bei Oma. Ich hab Gänsehaut. Oder das ist der Restschlag. Egal.', 'freude'),
    ], { effects: [herz(O, 40)], next: 'ende' }),
    node('oma', [
      N('Oma Volt nimmt die Kabel, tippt sie an die Flasche, ohne hinzusehen, und redet dabei weiter über den Preis von Zitronen. Die Flasche leuchtet blassblau.'),
      L(O, 'Siehst du? Gefühl. Das lernst du nicht, das kriegst du nach siebzig Jahren Stromschlägen von allein.', 'signatur'),
    ], { effects: [herz(O, 30)], next: 'ende' }),
    node('ende', [
      L(O, 'Hier. Das Rezept. Hab ich dir auf eine Rabattmarke geschrieben. Die gibt dir nebenbei zehn Prozent auf Kaugummi. Zweimal gut.', 'freude'),
      L(O, 'Das Rezept gebe ich nicht jedem, Kindchen. Paul hab ich’s nie gegeben. Der hätte es an Quantum verkauft. Oder schlimmer: an Hunter.'),
    ], {
      choices: [
        { text: '[Vex] „Ich dachte, du kannst mich nicht leiden. Ich klau doch immer Kaugummi.“', when: VEX, next: 'vex' },
        { text: '„Danke, Oma. Ich halt’s geheim.“', when: NICHT_VEX, next: 'geheim' },
        { text: '„Danke, Oma.“', when: VEX, next: 'geheim' },
      ],
    }),
    node('vex', [
      L(O, 'Du klaust einen Kaugummi pro Woche, Vex. Immer Pfefferminz. Und du legst jedes Mal einen Credit unter die Zeitung, wenn du denkst, ich guck nicht.', 'signatur'),
      L(O, 'Ich guck immer. Du bist die ehrlichste Diebin, die ich kenne. Das ist ein Kompliment. Glaub ich.'),
    ], { effects: [herz(O, 20)] }),
    node('geheim', [L(O, 'Sollst du auch. Und wenn dich einer fragt: Das ist Großmutters Rezept. Nicht meins. Ich hab nur die Batterie verbessert.', 'freude')]),
  ]),

  dlg('dlg-he-oma-volt-4', [
    node('a', [
      N('Vor dem Volt-Eck steht ein Roboter, so groß wie ein Kühlschrank und ungefähr genauso elegant. Lack in Polizeiblau, an vielen Stellen in Rostbraun. Auf der Brust steht „SICHERHEIT“, das „HEIT“ ist abgeblättert.'),
      L(O, 'Darf ich vorstellen: Opa Blech. Sicherheitsroboter, Baujahr 2049. Hat dreißig Jahre eine Bank bewacht. Die Bank ist pleite, er nicht.', 'signatur'),
    ], {
      choices: [
        { text: '„Und was macht der hier?“', when: LAGER_FERTIG, next: 'held' },
        { text: '„Und was macht der hier?“', when: { not: LAGER_FERTIG }, next: 'wecken', id: 'wecken' },
      ],
    }),
    node('held', [
      L(O, 'Seit er die Rostzähne mit dem Wasserschlauch vom Hof gejagt hat, lässt er sich nicht mehr einmotten. Er steht jeden Morgen vor meiner Tür und piepst. Wie ein Hund. Ein Hund aus Blech mit Rente.', 'freude'),
      L(O, 'Also kriegt er einen Job. Kioskwächter. Aber er muss lernen, wie man Kundschaft begrüßt. Bis jetzt sagt er nur „HALT! WAFFE FALLEN LASSEN!“.'),
    ], { next: 'programm' }),
    node('wecken', [
      L(O, 'Den hab ich gestern mit Paul aus dem Lager geschleppt. Paul hat dabei „Sehr gern, Tante“ gesagt. Das ist auch so eine Sache. Später.', 'besorgt'),
      L(O, 'Jetzt steht er hier und schläft. Er braucht einen Tritt. Oder einen Techniker. Oder einen Tritt von einem Techniker.'),
    ], {
      choices: [
        {
          text: '(Die Wartungsklappe öffnen und den Notstart überbrücken.)',
          check: chk('he-oma-volt-4-wecken', 'technik', 4, ['maschine', 'reparieren']),
          next: 'wach',
        },
        {
          text: '(Ihm genau dorthin treten, wo bei alten Robotern der Wackelkontakt sitzt.)',
          check: chk('he-oma-volt-4-tritt', 'koerper', 4, ['kraft', 'maschine']),
          next: 'wach',
        },
        { text: '„Mach du, Oma.“', next: 'oma-tritt' },
      ],
    }),
    node('oma-tritt', [
      N('Oma Volt nimmt drei Schritte Anlauf. Mit Hausschuhen. Der Tritt hallt durch die ganze Gasse. Bruno vor dem High Voltage zuckt zusammen.'),
      L(O, 'So hat das mein Heinz auch immer gemacht. Mit dem Toaster. Und mit dem Finanzamt.', 'signatur'),
    ], { next: 'wach' }),
    node('wach', [
      N('Opa Blechs Augen flackern auf, rot, dann gelb, dann ein freundliches Grün. Irgendwo in ihm dreht sich ein Lüfter, der seit Jahren nicht mehr wollte.'),
      L('opa-blech', 'HALT! WAFFE FALLEN LASSEN! …GUTEN MORGEN.'),
      L(O, 'Siehst du? Da ist er wieder. Er kriegt einen Job. Kioskwächter. Aber er muss lernen, wie man Kundschaft begrüßt.', 'freude'),
    ], { next: 'programm' }),
    node('programm', [
      L(O, 'Du darfst entscheiden, was er sagt, Kindchen. Ich hab keine Nerven für Technik. Ich hab nur Nerven für Leute, die zu spät zahlen.'),
    ], {
      choices: [
        { text: '„Herzlich willkommen im Volt-Eck. Bitte nichts klauen.“', effects: [herz(O, 30), { setFlag: 'opa_blech_gruss_hoeflich' }], next: 'hoeflich' },
        { text: '„Kauf was oder verpiss dich, Bürger.“', effects: [herz(O, 40), { setFlag: 'opa_blech_gruss_ruppig' }], next: 'ruppig' },
        {
          text: '(Ihm Collins Begrüßung aus den Nachrichten einprogrammieren.)',
          check: chk('he-oma-volt-4-collin', 'technik', 5, ['hacken', 'medien']),
          effects: [herz(O, 50), { setFlag: 'opa_blech_gruss_collin' }],
          next: 'collin',
        },
      ],
    }),
    node('hoeflich', [
      L('opa-blech', 'HERZLICH WILLKOMMEN IM VOLT-ECK. BITTE NICHTS KLAUEN. DAS IST EINE BITTE. NOCH.'),
      L(O, 'Das „noch“ hat er selbst dazugedichtet. Ich mag ihn.', 'freude'),
    ], { next: 'ende' }),
    node('ruppig', [
      L('opa-blech', 'KAUF WAS ODER VERPISS DICH, BÜRGER. ICH WÜNSCHE EINEN ANGENEHMEN TAG.'),
      N('Oma Volt lacht so laut, dass sie sich am Tresen festhalten muss. Die erste Kundin, eine Frau mit Einkaufsnetz, kauft sofort drei Zeitungen.'),
      L(O, 'Das bleibt so. Das bleibt GENAU so. Endlich spricht hier mal einer meine Sprache.', 'freude'),
    ], { next: 'ende' }),
    node('collin', [
      L('opa-blech', 'GUTEN ABEND, NOXIUS! HIER IST COLLIN CHARLESTON MIT DEN NACHRICHTEN, DIE SIE NICHT HÖREN WOLLEN. ZEITUNGEN DREI CREDITS.'),
      L(O, 'Oh. Oh, das ist … Kindchen, das ist das Schönste, was mir seit 2070 passiert ist. Den lass ich nie wieder ausschalten.', 'freude'),
    ], { next: 'ende' }),
    node('ende', [
      L(O, 'Ab heute steht er hier. Tag und Nacht. Wer am Volt-Eck klaut, kriegt Opa Blech. Und Opa Blech hat einen Wasserschlauch und keine Hemmungen.', 'signatur'),
    ]),
  ]),

  dlg('dlg-he-oma-volt-6', [
    node('a', [
      N('Abends am Volt-Eck. Die Reklame summt, Opa Blech brummt, und Oma Volt sitzt hinter dem Tresen und strickt so schnell, dass die Nadeln Funken schlagen.'),
      L(O, 'Kindchen. Bleib mal kurz. Ich muss mit jemandem reden, der nicht Opa Blech ist. Der hört zu, aber er antwortet immer „BITTE NICHTS KLAUEN“.', 'besorgt'),
      L(O, 'Es geht um Paul. Meinen Neffen. Der Junge ist … so komisch höflich.'),
      N('Wie aufs Stichwort kommt ein junger Mann um die Ecke. Gebügeltes Hemd, gekämmte Haare, ein Lächeln, das ein bisschen zu weit geht. Er trägt Oma Volts Einkäufe. Alle. Ohne Tüte.'),
      L('paul', 'Guten Abend, Tante. Darf ich Ihnen die Last abnehmen? Es ist mir eine Freude. Es ist mir eine große Freude.'),
      L(O, 'Du nimmst sie mir doch schon ab, Paul. Du trägst sie seit dem Bahnhof.', 'wut'),
      L('paul', 'Natürlich. Verzeihung. Eine Verbesserung ist immer möglich.'),
      N('Er stellt die Einkäufe ab, verbeugt sich – verbeugt sich! – und geht. Sein Lächeln bleibt noch einen Moment in der Luft hängen, wie ein Geruch.'),
      L(O, 'Siehst du das? Der Junge hat mich mit vierzehn „alte Schachtel“ genannt und mein Fahrrad geklaut. Der hat noch NIE „Sie“ zu mir gesagt. Nicht mal vor Gericht.', 'besorgt'),
    ], {
      choices: [
        {
          text: '(Paul nachsehen und auf seinen Nacken achten.)',
          check: chk('he-oma-volt-6-nacken', 'technik', 5, ['beobachten', 'cyberware']),
          next: 'narbe',
        },
        {
          text: '„Hat er irgendwas Neues? Freunde, Arbeit, ’nen Arzt?“',
          check: chk('he-oma-volt-6-fragen', 'strasse', 4, ['geruecht']),
          next: 'programm',
        },
        { text: '„Vielleicht ist er einfach erwachsen geworden.“', next: 'erwachsen' },
        { text: '(Ihre Hand nehmen.) „Hey. Ich bin da.“', next: 'hand' },
      ],
    }),
    node('narbe', [
      N('Als Paul unter der Laterne vorbeigeht, siehst du es: hinter dem rechten Ohr eine frische, sehr saubere Narbe. Zu sauber für die Unterstadt. Darin ein winziges Licht, das im Takt pulsiert. Blau. Quantum-Blau.'),
      L(O, 'Ein Implantat? Paul hat Angst vor Spritzen! Der ist beim Ohrlochstechen umgekippt! Zweimal! Beim zweiten Mal war’s nicht mal sein Ohr!', 'wut'),
    ], { effects: [herz(O, 40), { setFlag: 'paul_chip_gesehen' }], next: 'sorge' }),
    node('programm', [
      L(O, 'Er hat sich für was angemeldet. Ein „Programm“. Quantum sucht Testpersonen, hat er gesagt. Für ein „besseres Miteinander“. Mit Gratis-Frühstück.', 'besorgt'),
      L(O, 'Gratis-Frühstück, Kindchen! Bei Quantum! Die verlangen Eintritt fürs Atmen!'),
    ], { effects: [herz(O, 35), { setFlag: 'paul_programm_bekannt' }], next: 'sorge' }),
    node('erwachsen', [
      L(O, 'Erwachsen? Erwachsene sind unhöflich, Kindchen. Erwachsene haben Rücken und Steuern und schlechte Laune. Der Junge ist nicht erwachsen. Der ist … poliert.', 'wut'),
    ], { effects: [herz(O, 15)], next: 'sorge' }),
    node('hand', [
      N('Ihre Hand ist kalt und knochig und voller kleiner Stiche von dreißig Jahren Nadel und Faden. Sie lässt sie liegen.'),
      L(O, 'Pah. Sentimental wirst du mir hier nicht. …Noch einen Moment. Dann wieder nicht.', 'besorgt'),
    ], { effects: [herz(O, 40)], next: 'sorge' }),
    node('sorge', [
      L(O, 'Ich hab den Jungen großgezogen, nachdem meine Schwester weg war. Er war ein Rotzlöffel. Aber er war MEIN Rotzlöffel. Wer auch immer ihm das angetan hat …', 'wut'),
      L(O, 'Halt die Augen offen, Kindchen. Wenn du noch mehr so Höfliche siehst, sag’s mir. Ich glaub, das hier fängt gerade erst an.'),
      N('Sie greift unter den Tresen und drückt dir etwas in die Hand: einen Aufnäher mit einem Blitz, frisch gestickt.'),
      L(O, 'Für deine Jacke. Wer den trägt, gehört zum Volt-Eck. Dann weiß jeder in der Gasse: Wer dir was tut, kriegt’s mit mir zu tun. Und mit Opa Blech.', 'signatur'),
    ], {
      effects: [{ checkBuff: { id: 'oma-volt-aufnaeher', label: 'Volt-Eck-Aufnäher', value: 1, attribute: 'strasse', tags: ['einschuechtern', 'geruecht'], consumes: false } }],
    }),
  ]),
);

export const part: ContentPart = {
  npcs: { [O]: npc },
  items: { [rezept.id]: rezept },
  dialogues,
};
