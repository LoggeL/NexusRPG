// Der Richter – streng, gärtnert, backt, streamt heimlich als „RichtigLauteMusik79“ (world.md §4.4, §11.2).
// Tagesablauf nach design/plan/act1.json (npcSchedules.richter), Herz-Ereignisse he-richter-2/4/6 in Akt 1,
// he-richter-8/10 angelegt und an act2 gebunden. Kein Begleiter, keine Romanze.
// Quests nur als Verweis: pers-richter-goldene-gurke, side-streaming-suenden (Quest-Agent), side-feierabend-fuer-kessel.
import type { ContentPart } from '../../part';
import type { DialogueChoice, DialogueNode, NpcDef } from '../../../modules/contracts';
import {
  type Menue, AB_AKT2, NICHT_AKT2, ZEIT_HINWEIS, dialog, erz, flag, herz, ich, knoten, neu, pruefung, rede, sammle,
  sprecher, tagesgespraech,
} from './_helfer';

const R = sprecher('richter');
const D = sprecher('dexter');
const G = sprecher('opa-gustav');
const DA = sprecher('dante');

const STREAMING = 'side-streaming-suenden';
const GURKE = 'pers-richter-goldene-gurke';

// ---------------------------------------------------------------------------------------------- Menü

function menue(): Menue {
  const zurueck: DialogueChoice[] = [{ text: 'Noch eine Frage, Euer Ehren.', next: 'menue', id: 'zurueck' }, { text: 'Ich empfehle mich.' }];

  const choices: DialogueChoice[] = [
    { text: 'Was wird hier eigentlich verhandelt?', next: 'bagatell', once: true, id: 'r-bagatell' },
    {
      text: 'Kann ich im Beet helfen?', next: 'beet', once: true, id: 'r-beet',
      when: { time: 'tag' }, effects: [{ advanceTime: 20 }, herz('richter', 15)],
    },
    {
      text: 'Sie sehen aus, als hätten Sie was zu verbergen, Euer Ehren.', next: 'streaming',
      when: { all: [{ quest: STREAMING, state: 'inactive' }, { time: ['tag', 'abend'] }] },
      effects: [{ startQuest: STREAMING }],
    },
    {
      text: 'Was ist mit der Gurke da? Die sieht … angeknabbert aus.', next: 'gurke', tag: '[Richter ♥2]',
      when: { quest: GURKE, state: 'inactive' }, requires: { hearts: 'richter', min: 2 },
      effects: [{ startQuest: GURKE }],
    },
    { text: 'Sie haben Dante zu 10.000 Stunden verurteilt. Warum so hart?', tag: '[Richter ♥3]', requires: { hearts: 'richter', min: 3 }, once: true, id: 'r-dante', next: 'dante' },
    { text: '„RichtigLauteMusik79“, hm?', when: { quest: STREAMING, state: 'done' }, once: true, id: 'r-rlm79', next: 'rlm79' },
    { text: 'Ich hab gehört, Sie spielen donnerstags Karten.', when: { seen: 'richter-karten-gesehen' }, once: true, id: 'r-karten', next: 'karten-frage' },
    { text: 'Kessel will kündigen. Wussten Sie das?', when: { quest: 'side-feierabend-fuer-kessel', state: 'active' }, once: true, id: 'r-kessel', next: 'kessel' },
    { text: 'Ich empfehle mich.' },
  ];

  const nodes: DialogueNode[] = [
    knoten('menue', [R('Weiter im Text. Das Gericht hat nicht ewig Zeit. Das Gericht hat Tomaten im Gewächshaus.')], { choices }),
    knoten('bagatell', [
      R('Mittwochs: Bagatellgericht. Gestohlene Fahrräder, geklaute Kabel, ein Toaster, der einen Nachbarn beleidigt hat.'),
      R('Ich höre mir alles an. Dann sage ich „Schuldig“. In neun von zehn Fällen stimmt das sogar.', 'neutral'),
      R('Der zehnte Fall ist meistens Dexter. Da stimmt es auch, aber anders.'),
    ], { choices: zurueck }),
    knoten('beet', [
      erz('Du kniest dich neben ihn ins Gemüsebeet des Gerichtsgartens. Er reicht dir wortlos eine Harke mit Inventarnummer.'),
      R('Der da. Löwenzahn. Wiederholungstäter. Schuldig!', 'wut'),
      erz('Zwanzig Minuten später ist das Beet sauber und dein Rücken verurteilt.'),
      R('Ordentliche Arbeit. Fast so ordentlich wie ein Urteil.'),
    ], { choices: zurueck }),
    knoten('streaming', [
      R('Verbergen? Ich? Ich bin das Gesetz. Das Gesetz hat nichts zu verbergen.', 'wut'),
      R('…', 'neutral'),
      R('Hören Sie. Rein hypothetisch. Wenn auf einem beschlagnahmten Streaming-Server ein Nutzername stünde. Ein harmloser Name. Etwas mit Musik.'),
      R('Und wenn die Asservatenkammer diesen Server nächste Woche auswertet. Und der Name zufällig auf einen ehrenwerten Mann zurückgeht …', 'ueberrascht'),
      R('Beweismittellager. Hinter dem Garten. Mehr sage ich nicht. Ich habe schon zu viel gesagt. Ich bin befangen. Gehen Sie.'),
    ], { choices: zurueck }),
    knoten('gurke', [
      R('ANGEKNABBERT. Ja. Meine Preisgurke. „Die Goldene“. Achtzehn Monate Pflege, zwei Hitzewellen, ein Rostregen.', 'wut'),
      R('Und heute Morgen: Zahnspuren. Kleine. Metallisch. Kreisrund.'),
      R('Ich will den Täter. Kein Urteil ohne Täter. Spuren lesen kann jeder, der Augen hat. Sie haben Augen. Benutzen Sie sie.'),
    ], { choices: zurueck }),
    knoten('dante', [
      R('Zehntausend Stunden illegal gestreamte Musik und Filme. Das Gesetz kennt dafür eine Zahl.', 'neutral'),
      R('Ich habe die Zahl ausgesprochen. Das ist mein Beruf. Zahlen aussprechen und dabei nicht zittern.'),
      R('Dass ich dabei an meine eigene Wiedergabeliste gedacht habe, steht in keinem Protokoll.', 'ueberrascht'),
      R('Das war jetzt nicht protokollfähig. Streichen Sie es aus Ihrem Gedächtnis. Paragraf eins.'),
    ], { choices: zurueck, effects: [herz('richter', 15)] }),
    knoten('rlm79', [
      R('Pssst! Nicht so laut! Die Wände hier haben Ohren. Und Kessel hat eine Strichliste.', 'wut'),
      R('„RichtigLauteMusik“. Neunundsiebzig ist mein Geburtsjahr. Ich war jung. Ich war … zwanzig. Und dann vierzig. Und dann sechzig.'),
      R('Wissen Sie, wie es ist, den ganzen Tag „Ruhe im Saal“ zu brüllen? Abends braucht ein Mann Lärm. Richtigen Lärm.', 'neutral'),
      R('Danke. Für das, was Sie getan haben. Ein Richter vergisst keine Verdienste. Auch keine Vergehen. Aber Verdienste zuerst.'),
    ], { choices: zurueck, effects: [herz('richter', 20)] }),
    knoten('karten-frage', [
      R('Karten? Ich? Donnerstags? Im HIGH VOLTAGE?', 'ueberrascht'),
      R('Unbewiesen. Haltlos. Und wenn doch: Ich ermittle verdeckt. Gegen das Glücksspiel. Indem ich gewinne.'),
    ], { choices: zurueck }),
    knoten('kessel', [
      R('Kessel. Natürlich wusste ich das. Sie hat mir drei Kündigungen in den Dienstbriefkasten gelegt. Alle ohne Stempel.', 'neutral'),
      R('Ohne Stempel ist eine Kündigung ein Brief. Und Briefe beantworte ich nicht. Ich bin kein Brieffreund, ich bin ein Gericht.'),
      R('Wenn sie es ernst meint, soll sie es ordentlich machen. Formular, Stempel, Unterschrift. Oder Sie überzeugen mich. Viel Glück.'),
    ], { choices: zurueck }),
  ];
  return { choices, nodes };
}

const M = menue();

/** Rivalität: Sozialstunden oder Plädoyer setzen auf null (world.md §4.1 Versöhnung). */
const RIVALE: Menue = {
  choices: [
    { text: 'Ich leiste Sozialstunden. Zwei Stunden Unkraut.', next: 'sozial', effects: [{ advanceTime: 120 }, { reconcile: 'richter' }, { xp: 30 }] },
    {
      text: '„Euer Ehren, ich plädiere auf Neuanfang. Mildernde Umstände: Ich bin lernfähig.“', next: 'plaedoyer',
      check: pruefung('richter-versoehnung-plaedoyer', 'ausstrahlung', 6, ['ueberzeugen']), effects: [{ reconcile: 'richter' }],
    },
    { text: 'Ich geh ja schon.' },
  ],
  nodes: [
    knoten('sozial', [
      erz('Zwei Stunden. Löwenzahn, Quecke, ein Kronkorken, der Wurzeln geschlagen hat. Der Richter steht daneben und zählt mit.'),
      R('Strafe verbüßt. Akte geschlossen. Ich hoffe, Sie haben was gelernt. Ich habe gelernt, dass Sie gut jäten.', 'neutral'),
    ]),
    knoten('plaedoyer', [
      R('Lernfähig.', 'ueberrascht'),
      R('Das hat mir in vierzig Dienstjahren noch keiner gesagt. Alle sagen „unschuldig“. Lernfähig ist neu.'),
      R('Bewährung. Die Akte bleibt im Schrank. Aber ich schließ ihn ab.'),
    ]),
  ],
};

// ---------------------------------------------------------------------------------------------- Tagesgespräche

const T = {
  rivale: tagesgespraech('richter-tag-rivale',
    [R('Sie schon wieder. Ich habe Ihre Akte. Sie ist dick. Sie wird dicker. Gehen Sie mir aus der Sonne.', 'wut')],
    [R('Wissen Sie, was ich mit Wiederholungstätern mache? Ich setze die Strafe hoch. Und dann noch höher. Mathematik ist gerecht.', 'wut')],
    RIVALE),
  knast: tagesgespraech('richter-tag-knast',
    [
      R('Moment. Dieses Gesicht kenne ich. Aus der Akte. Haftentlassen, Bewährung, Auflagen.', 'wut'),
      R('Ich habe Sie verurteilt. Oder jemand, der genauso aussieht wie ich. Ich war es. Ich vergesse kein Gesicht. Nur Namen. Und Geburtstage.'),
    ],
    [R('Ich behalte Sie im Auge. Beide Augen. Und die Kamera am Tor.', 'neutral')],
    M, { effects: [herz('richter', -100), flag('richter_herkunft')] }),
  exWache: tagesgespraech('richter-tag-ex-wache',
    [
      R('Na sieh einer an. Ehemals Ordnungsdienst. Sie haben mir die Akten getragen, damals. Pünktlich. Ohne Kaffeeflecken.', 'ueberrascht'),
      R('So jemand ist mir hier willkommen. Bedingt. Unter Vorbehalt. Aber willkommen.'),
    ],
    [R('Warum sind Sie gegangen? … Nein, sagen Sie nichts. Ein Richter kennt die Antwort: der Kaffee in der Kantine.', 'neutral')],
    M, { effects: [herz('richter', 100), flag('richter_herkunft')] }),
  zeit: tagesgespraech('richter-tag-zeit',
    [
      R('Setzen Sie sich. Nein, nicht da, da sitzt der Kürbis. Daneben.', 'neutral'),
      erz(ZEIT_HINWEIS),
    ],
    [R('Ich hätte da ein Anliegen. Ehrenamtlich. Gerichtlich. Aber nicht jetzt. Die Stadt hat gerade andere Sorgen. Ich spüre es in den Knien.')],
    M),
  streaming: tagesgespraech('richter-tag-streaming',
    [R('Und? Der Server? Ich frage rein dienstlich. Mein Puls ist dienstlich. Er ist bei hundertachtzig.', 'ueberrascht')],
    [R('Ich habe heute zweimal „Schuldig“ zu einem Gänseblümchen gesagt. Zweimal. Das Gänseblümchen war unschuldig. Ich bin nicht ich selbst.', 'wut')],
    M),
  gurke: tagesgespraech('richter-tag-gurke',
    [R('Die Goldene. Angeknabbert. Haben Sie den Täter? Ich will einen Namen. Ich will ein Geständnis. Ich will eine neue Gurke.', 'wut')],
    [R('Kleine, runde Zahnspuren. Metallisch. Kreisrund. Das war kein Mensch. Das war kein Tier. Das war ein … Gerät.', 'ueberrascht')],
    M),
  karten: tagesgespraech('richter-tag-karten',
    [
      R('Sie haben mich hier nicht gesehen. Ich bin nicht hier. Ich bin zu Hause und lese Kommentare zum Mietrecht.', 'ueberrascht'),
      erz('Er hält vier Karten verdeckt vor die Brust, eine fünfte klemmt unter seinem Ärmelaufschlag. Vor ihm ein ordentlicher Stapel Chips.'),
    ],
    [R('Eins! … Das ist kein Glücksspiel, das ist Mathematik mit Farben. Und wer „Erwischt!“ ruft, wird von mir persönlich angehört.', 'neutral')],
    M, { effects: [{ markSeen: 'richter-karten-gesehen' }] }),
  garkueche: tagesgespraech('richter-tag-garkueche',
    [R('Freitag. Dampfnudeln. Ein Mann darf einmal pro Woche ein Verbrechen gegen seinen Cholesterinspiegel begehen. Paragraf Babette.', 'neutral')],
    [R('Babette hat mir einmal eine Dampfnudel ohne Füllung gegeben, weil ich unhöflich war. Ohne Füllung! Das war das härteste Urteil, das ich je erlebt habe.', 'ueberrascht')],
    M),
  flohmarkt: tagesgespraech('richter-tag-flohmarkt',
    [R('Sonntag. Flohmarkt. Ich bin privat hier. Privat heißt: Ich darf feilschen und Sie dürfen mich nicht „Euer Ehren“ nennen.', 'neutral')],
    [R('Diese Platte da. Vinyl. „Bass bis der Putz fällt, Vol. 3.“ Ich kaufe sie natürlich nicht. Ich beschlagnahme sie. Für mich. Als Beweisstück.')],
    M),
  morgen: tagesgespraech('richter-tag-morgen',
    [R('Ruhe im Saal! … Ach, Sie sind es. Ruhe trotzdem. Ich übe für später.', 'wut')],
    [
      R('Heute auf der Liste: ein geklauter Gartenzwerg, ein Rostzahn ohne Helm, zwei Nachbarn, die sich um einen Parkplatz für einen Einkaufswagen streiten.'),
      R('Schuldig. Schuldig. Und beide schuldig. Ich hab die Akten noch nicht gelesen, aber ich habe Erfahrung.', 'neutral'),
    ],
    M),
  garten: tagesgespraech('richter-tag-garten',
    [R('Schuldig! … Nicht Sie. Der Giersch. Der Giersch ist immer schuldig.', 'wut')],
    [
      R('Ein Garten ist wie ein Gerichtssaal. Man reißt raus, was nicht dahin gehört. Und man gießt, was eine zweite Chance verdient.'),
      R('Diese Tomate da hat drei Chancen gehabt. Sie wächst trotzdem schief. Ich respektiere das.', 'neutral'),
    ],
    M),
  vertraut: tagesgespraech('richter-tag-vertraut',
    [R('{name}. Gut, dass Sie da sind. Hören Sie mal. Nein, nicht mir. Der Amsel. Die singt in Moll.', 'neutral')],
    [R('Ich habe angefangen, beim Urteilsspruch leise Musik laufen zu lassen. Barock. Ganz leise. Seitdem weint keiner mehr. Nur ich, innerlich, beim Cembalo.')],
    M),
  abend: tagesgespraech('richter-tag-abend',
    [R('Feierabend. Die Bank hier ist meine. Seit 2061. Sie hat eine Plakette. Na ja. Ich habe ihr eine Plakette gegeben.', 'neutral')],
    [R('Abends hört man vom Gefängnishof die Gitarre von Zelle neun. Spielt falsch. Hat Lebenslang. Ich habe ihm zwei Saiten genehmigt.')],
    M),
  standard: tagesgespraech('richter-tag-standard',
    [R('Bürger. Sie wünschen? Fassen Sie sich kurz. Kurz ist ein Wort, das ich mag. Fast so sehr wie „schuldig“.', 'neutral')],
    [R('Die Unterstadt braucht Ordnung. Ordnung braucht Paragrafen. Paragrafen brauchen jemanden, der sie laut vorliest. Das bin ich. Mit Freude. Innerlich.')],
    M),
};

// ---------------------------------------------------------------------------------------------- Herz-Ereignisse

const he2 = dialog('he-richter-2', [
  knoten('start', [
    erz('Der Gerichtsgarten. Zwischen Stacheldraht und Kohlköpfen kniet der Richter in Robe und Gummistiefeln im Beet und reißt Unkraut aus, als wäre es eine Anklagebank.'),
    R('Schuldig! … Schuldig! … Du auch. SCHULDIG!', 'wut'),
    erz('Ein Grasbüschel fliegt über deinen Kopf. Er bemerkt dich und richtet sich auf, die Robe voller Erde.'),
    R('Sie. Gut. Ein Paar Hände mehr. Das Beet wird von Löwenzahn besetzt. Hartnäckige Täter. Wurzeln bis zum Kanal.', 'neutral'),
  ], {
    choices: [
      {
        text: 'Den dicksten Löwenzahn mit der Wurzel rausreißen.', next: 'wurzel',
        check: pruefung('he-richter-2-wurzel', 'koerper', 4, ['kraft']), effects: [herz('richter', 30)],
      },
      {
        text: 'Erst mal die verrostete Bewässerung reparieren. Da tropft es nur.', next: 'ventil',
        check: pruefung('he-richter-2-ventil', 'technik', 4, ['reparieren']), effects: [herz('richter', 30)],
      },
      { text: 'Einfach mitzupfen. Stück für Stück.', next: 'zupfen', effects: [{ advanceTime: 30 }, herz('richter', 20)] },
    ],
  }),
  knoten('wurzel', [
    erz('Du packst den Stängel, stemmst die Füße ein und ziehst. Die Erde knackt, dann hältst du eine Wurzel in der Hand, so lang wie dein Arm. Unten hängt ein Kronkorken dran.'),
    R('Ein Geständnis! Mit Beweismittel!', 'ueberrascht'),
  ], { next: 'kleeblatt' }),
  knoten('ventil', [
    erz('Ein Schlag mit dem Harkenstiel, eine Drehung mit Gefühl, und aus dem Schlauch schießt ein satter Strahl. Genau auf die Robe.'),
    R('…', 'wut'),
    R('Das Gericht stellt fest: Die Bewässerung funktioniert. Das Gericht stellt auch fest: Das Gericht ist nass.'),
  ], { next: 'kleeblatt' }),
  knoten('zupfen', [
    erz('Eine halbe Stunde lang arbeitet ihr schweigend. Nur ab und zu murmelt er „schuldig“ in die Erde, leiser jedes Mal, fast zärtlich.'),
    R('Sie zupfen ordentlich. Nicht schnell. Ordentlich. Das ist mehr wert.', 'neutral'),
  ], { next: 'kleeblatt' }),
  knoten('kleeblatt', [
    erz('Zwischen den Kohlköpfen wuchert ein Teppich aus Klee. Der Richter hebt die Hand wie zum Urteil.'),
    R('Und der hier? Klee. Unerlaubte Ausbreitung auf öffentlichem Grund. Was meinen Sie? Schuldig?'),
  ], {
    choices: [
      { text: '„Freispruch. Die Bienen brauchen den.“', next: 'freispruch', effects: [herz('richter', 20), flag('richter_klee_frei')] },
      { text: '„Schuldig. Raus damit.“', next: 'schuldig', effects: [herz('richter', 10)] },
      { text: '„Bewährung. Er darf bleiben, wenn er sich benimmt.“', next: 'bewaehrung', effects: [herz('richter', 15)] },
    ],
  }),
  knoten('freispruch', [
    R('Bienen. Hm. Ich habe seit elf Jahren keine Biene gesehen. Aber das Gesetz denkt voraus.', 'ueberrascht'),
    R('Freispruch für den Klee. Das Protokoll vermerkt: auf Antrag der Verteidigung.'),
  ], { next: 'ende' }),
  knoten('schuldig', [
    R('So ist es recht. Strenge ist eine Form von Fürsorge. Sagt man. Ich sage das.', 'neutral'),
  ], { next: 'ende' }),
  knoten('bewaehrung', [
    R('Bewährung. Für Klee.', 'ueberrascht'),
    R('Sie sind entweder sehr weise oder sehr faul. Beides kommt im Justizdienst weit.'),
  ], { next: 'ende' }),
  knoten('ende', [
    erz('Er wischt sich die Hände an der Robe ab, was nichts besser macht, und drückt dir ein Papiertütchen in die Hand. Darauf, in Schönschrift: „Beweismittel Nr. 1 – Ringelblume“.'),
    R('Samen. Säen Sie die irgendwo, wo es keiner erwartet. Das ist ein Befehl. Ein freundlicher.', 'neutral'),
  ], { effects: [{ give: 'blumensamen' }, { xp: 40 }, herz('richter', 20)] }),
]);

const he4 = dialog('he-richter-4', [
  knoten('start', [
    erz('Mittwoch, Bagatellgericht. Der Saal riecht nach Bohnerwachs und Schmieröl. Auf der Anklagebank: Dexter. Neben ihm, an einer Kette, ein Ziegenroboter mit Hörnern aus Auspuffrohr, der gerade an der Bank kaut.'),
    R('Sie. Hier vorne. Der Schöffe ist krank. Grippe, sagt er. Wahrscheinlich Angeln. Sie sind jetzt Schöffe. Setzen Sie sich und gucken Sie streng.', 'neutral'),
    G('Euer Ehren, das Vieh hat mir meine Ölkännchen gefressen! Alle sieben! Die von 2040! Und meine Radioantenne!'),
    D('Gerlinde frisst nur Metall von minderer Qualität! Das ist praktisch Qualitätskontrolle! Ich zahle immer, Euer Ehren! Irgendwann!', 'besorgt'),
    erz('Die Ziegenrobotin Gerlinde meckert. Es klingt wie ein Modem von 2010.'),
    R('Schöffe. Ihre Meinung. Ich höre.', 'neutral'),
  ], {
    choices: [
      {
        text: 'Gerlindes Halsband ansehen. Da klebt was.', next: 'sabotage', tag: '[Straße 4]',
        check: pruefung('he-richter-4-sabotage', 'strasse', 4, ['spuren', 'geruecht']), effects: [herz('richter', 40), herz('dexter', 30)],
      },
      {
        text: '„Vergleich: Gerlinde mäht einen Monat lang Gustavs Platz. Gratis.“', next: 'vergleich',
        check: pruefung('he-richter-4-vergleich', 'ausstrahlung', 5, ['ueberzeugen', 'verhandeln']),
        effects: [herz('richter', 35), herz('dexter', 20), herz('opa-gustav', 20)],
      },
      { text: '„Schuldig. Aber mildernde Umstände: Er ist Dexter.“', next: 'milde', effects: [herz('richter', 25), herz('opa-gustav', 10)] },
      { text: '„Schuldig. Die Ziege kommt ins Tierheim.“', next: 'hart', effects: [herz('richter', 15), herz('dexter', -40)] },
    ],
  }),
  knoten('sabotage', [
    erz('Unter dem Halsband steckt ein Chip mit einem aufgekratzten Zahn-Logo. Rostzähne. Jemand hat Gerlindes Futterliste umgeschrieben: „ALLES VON GUSTAV“.'),
    ich('Gerlinde wurde umprogrammiert. Sie hat nur getan, was auf ihrem Chip stand.'),
    R('Ein manipuliertes Tier. Mit Vorsatz. Von Dritten.', 'ueberrascht'),
    R('Das Verfahren gegen Dexter wird eingestellt. Gegen die Rostzähne wird ermittelt. Das heißt: Ich schreibe es auf einen Zettel und schaue ihn böse an.'),
    D('Freispruch? FREISPRUCH! Gerlinde, hast du gehört? Wir sind unschuldig! Zum ersten Mal!', 'freude'),
    G('Und meine Ölkännchen?'),
    D('Ich zahle! Ich zahle immer! Gerlinde, spuck sie aus! … Okay, drei. Drei kommen wieder raus.', 'besorgt'),
  ], { next: 'ende', effects: [flag('richter_gerlinde_sabotage')] }),
  knoten('vergleich', [
    G('Einen Monat? Gerlinde mäht? … Mein Platz ist ein Schrottplatz. Da wächst nix.'),
    ich('Dann frisst sie den Rost. Ihr Kran glänzt danach wie neu.'),
    G('Hm. Hmmmm. Ein glänzender Kran. Wie früher. Als hier alles grün war.'),
    R('Vergleich angenommen. Das Gericht spart sich ein Urteil, und ich spar mir die Tinte.', 'neutral'),
    D('Ein Vergleich! Ich hab noch nie einen Vergleich gewonnen! Ich hab immer nur verloren und dann Raten gezahlt!', 'freude'),
  ], { next: 'ende', effects: [flag('richter_gerlinde_vergleich')] }),
  knoten('milde', [
    R('„Er ist Dexter.“ Das ist in der Tat ein mildernder Umstand. Ein chronischer.', 'neutral'),
    R('Schuldig. Zehn Credits pro Woche an Herrn Gustav, bis die Ölkännchen bezahlt sind. Und Gerlinde bekommt einen Maulkorb.'),
    D('Zehn die Woche! Ich zahle immer! Ab nächster Woche! Oder übernächster!', 'besorgt'),
  ], { next: 'ende' }),
  knoten('hart', [
    erz('Gerlinde lässt den Kopf hängen. Dexter auch. Es ist schwer zu sagen, wer trauriger aussieht.'),
    R('Ein strenges Urteil. Ein korrektes Urteil.', 'neutral'),
    R('… Bewährung für die Ziege. Ich bin ja kein Unmensch. Nur Richter. Eine Woche Maulkorb.'),
    D('Danke, Euer Ehren. Und dir, Schöffe … dir zahle ich nichts. Nie. Aus Prinzip. Außer du fragst nett.', 'besorgt'),
  ], { next: 'ende' }),
  knoten('ende', [
    R('Die Sitzung ist geschlossen. Schöffe, Sie haben das gut gemacht. Besser als der echte. Der schläft immer ein.', 'neutral'),
    erz('Beim Rausgehen klopft er dir auf die Schulter. Zweimal. Für einen Richter ist das eine Umarmung.'),
  ], { effects: [{ xp: 60 }, { rep: 'ordnungsdienst', delta: 3 }, herz('richter', 20)] }),
]);

const he6 = dialog('he-richter-6', [
  knoten('start', [
    erz('Abend. Der Richter sitzt auf seiner Bank, die Robe über dem Arm, eine Papiertüte auf dem Schoß. Er dreht sie und dreht sie, als wäre sie ein Urteil, das er noch nicht unterschrieben hat.'),
    R('{name}. Setzen Sie sich. Ich brauche einen Zeugen. Oder einen Komplizen. Was Sie lieber sind.', 'neutral'),
    erz('In der Tüte: eine Schallplatte. Analoge Erstpressung, die Hülle vergilbt. „Kabelbrand – Live im Bunker, 2069“.'),
    R('Dante. Vier Jahre. Zehntausend Stunden. Ich habe die Zahl damals ausgesprochen, ohne zu zittern.'),
    R('Heute zittere ich. Nicht wegen des Urteils. Das war richtig. Wegen der Musik. Die war auch richtig.', 'ueberrascht'),
    R('Ich will sie ihm schicken. Anonym. Ein Richter kann sich nicht entschuldigen. Aber eine Platte kann es.'),
  ], {
    choices: [
      { text: '„Ich bring sie ihm. Keiner erfährt, von wem.“', next: 'anonym', effects: [herz('richter', 30), herz('dante', 30), flag('richter_platte_anonym')] },
      {
        text: '„Schreiben Sie einen Satz dazu. Nur einen. Mit Ihrer Handschrift.“', next: 'karte',
        check: pruefung('he-richter-6-karte', 'ausstrahlung', 6, ['ueberzeugen']),
        effects: [herz('richter', 40), herz('dante', 50), flag('richter_platte_karte')],
      },
      { text: '„Ich hab auch gesessen. Ein Urteil ist nie nur ein Urteil.“', tag: '[Knast]', when: { origin: 'origin-knastvogel' }, next: 'knast', effects: [herz('richter', 40)] },
      { text: '„Hören Sie sie zuerst selbst. Jetzt. Hier.“', next: 'hoeren', effects: [herz('richter', 30)] },
    ],
  }),
  knoten('anonym', [
    R('Keiner. Auch Dante nicht. Vor allem Dante nicht. Er würde mich umarmen. Ich vertrage keine Umarmungen von Verurteilten.', 'neutral'),
    erz('Am nächsten Morgen lehnt die Platte an Dantes Werkstatttür. Abends hört man aus der Werkstatt Kabelbrand, laut, und einen Mann, der falsch mitsingt und dabei weint.'),
    DA('Heiliges Kanonenrohr. Wer macht so was? Wer verschenkt eine ERSTPRESSUNG? … Danke, wer auch immer. Danke.'),
  ], { next: 'ende' }),
  knoten('karte', [
    R('Ein Satz.', 'ueberrascht'),
    erz('Er zieht einen Füller aus der Robe, setzt an, setzt ab, setzt wieder an. Dann schreibt er, in steiler Gerichtsschrift, auf die Innenhülle:'),
    erz('„Das Urteil war richtig. Die Musik auch. – R.“'),
    R('Wenn er das „R“ nicht versteht, ist er dümmer, als die Akte sagt. Wenn er es versteht … dann ist es eben so.'),
    DA('„Die Musik auch.“ … Der alte Paragrafenreiter. Der ALTE PARAGRAFENREITER! Ich muss ihm Kekse backen. Mit Bass drin.'),
  ], { next: 'ende' }),
  knoten('knast', [
    R('Sie auch. Hm.', 'neutral'),
    R('Wissen Sie, wie oft ich nachts an die Gesichter denke? An alle. Nicht weil ich falsch lag. Weil sie danach weitergelebt haben und ich nie gefragt habe, wie.'),
    R('Danke, dass Sie mir das sagen. Und nicht mit Steinen werfen.'),
  ], {
    choices: [
      { text: '„Dann schicken wir die Platte. Ich trag sie hin.“', next: 'anonym', effects: [herz('dante', 30), flag('richter_platte_anonym')] },
    ],
  }),
  knoten('hoeren', [
    erz('Aus der Aktentasche holt er einen Koffer-Plattenspieler mit Batterie. Natürlich hat er einen dabei. Die Nadel senkt sich. Knistern. Dann Gitarren, so laut, dass im Gefängnishof jemand „JAAA!“ brüllt.'),
    R('…', 'neutral'),
    erz('Der Richter wippt mit dem Fuß. Dann mit dem Knie. Dann nickt er im Takt, die Augen geschlossen, die Lippen bewegen sich zum Refrain.'),
    R('Das ist kein Lärm. Das ist ein Plädoyer.', 'ueberrascht'),
    erz('Als das Lied vorbei ist, steckt er die Platte zurück und gibt sie dir.'),
    R('Bringen Sie sie ihm. Anonym. Ich hab sie jetzt gehört. Das reicht für ein Leben.'),
  ], { next: 'anonym', effects: [herz('dante', 30), flag('richter_platte_anonym')] }),
  knoten('ende', [
    R('Sie sind ein seltsamer Mensch, {name}. Sie machen, dass ein alter Mann über seine Urteile nachdenkt. Das ist strafbar. Irgendwo.', 'neutral'),
    R('Ich spreche Sie frei. Dieses Mal.'),
  ], { effects: [{ xp: 80 }, herz('richter', 20), flag('richter_dante_platte')] }),
]);

// ♥8 und ♥10: angelegt, erst ab act2 (world.md §11.2).
const he8 = dialog('he-richter-8', [
  knoten('start', [
    erz('Großer Keks-Wettbewerb in Dantes Werkstatt. Auf einem umgedrehten Eimer thront der Richter, Robe frisch gebügelt, eine Serviette im Kragen. Vor ihm: sieben Teller. Hinter ihm: sieben nervöse Bäcker.'),
    R('Ich bin unbestechlich. Ich bin unparteiisch. Ich bin hungrig. In dieser Reihenfolge.', 'neutral'),
    DA('Euer Ehren, Nummer drei sind meine! Also, äh, Nummer drei ist anonym! Anonym und mit Schokostückchen!'),
  ], {
    choices: [
      { text: 'Ihm heimlich verraten, welcher Keks von Babette ist.', next: 'tipp', effects: [herz('richter', -10)] },
      { text: '„Euer Ehren, urteilen Sie mit dem Bauch.“', next: 'bauch', effects: [herz('richter', 40)] },
    ],
  }),
  knoten('tipp', [
    R('Bestechung eines Jurors. Mit Informationen. Das ist sogar schlimmer als mit Geld. Geld ist wenigstens ehrlich.', 'wut'),
    R('Ich ignoriere das. Und Ihre Kekse bekommen einen Punkt Abzug. Sie haben keine Kekse? Dann eben Ihre Zukunft.'),
  ], { next: 'urteil' }),
  knoten('bauch', [R('Der Bauch. Das ehrlichste Organ der Justiz.', 'ueberrascht')], { next: 'urteil' }),
  knoten('urteil', [
    erz('Er probiert. Er kaut. Er schließt die Augen. Bei Nummer drei hält er inne.'),
    R('Nummer drei. Schuldig. Schuldig der vorsätzlichen Köstlichkeit.', 'neutral'),
    DA('JAAAAA! Captain Kuschel, wir sind SCHULDIG!'),
  ], { effects: [{ xp: 120 }, herz('richter', 30), herz('dante', 30), flag('richter_keks_juror')] }),
]);

const he10 = dialog('he-richter-10', [
  knoten('start', [
    erz('Gerichtsgarten, Abendlicht. Der Richter steht zwischen seinen Beeten, in der Hand ein Kästchen aus Nussholz.'),
    R('{name}. Ich habe einen Antrag gestellt. Bei mir. Und ihn bewilligt.', 'neutral'),
    R('Sie sind ab heute ehrenamtliches Mitglied des Bagatellgerichts. Streitschlichtung. Nachbarn, Ziegen, Toaster. Sie gehen hin, Sie hören zu, Sie sagen, was gerecht ist.'),
    erz('Im Kästchen: ein Richterhammer in Miniatur, mit Messingring. Auf dem Griff eingraviert: „RLM79“.'),
    R('Wenn jemand fragt, wofür die Gravur steht: „Recht, Lauterkeit, Mäßigung“. Neunundsiebzig ist die Seriennummer.', 'ueberrascht'),
  ], {
    effects: [{ give: 'richterhammer-mini' }, flag('richter_schlichter'), { xp: 200 }],
    choices: [
      { text: '„Ich nehme an, Euer Ehren.“', next: 'an', effects: [herz('richter', 50)] },
      { text: '„Schuldig. Der Bewilligung schuldig.“', next: 'schuldig', effects: [herz('richter', 50)] },
    ],
  }),
  knoten('an', [R('Gut. Dann ist die Sitzung geschlossen. Und Sie gießen die Tomaten. Ehrenamt fängt unten an.', 'neutral')]),
  knoten('schuldig', [
    erz('Der Richter lacht. Kurz, laut, überrascht. Im Gefängnishof antwortet jemand mit einem Gitarrenriff.'),
    R('Das, {name}, ist das erste Mal, dass mich jemand mit meinem eigenen Wort erwischt. Ich lege Berufung ein. Bei mir. Abgelehnt.'),
  ]),
]);

// ---------------------------------------------------------------------------------------------- Figur

const richter: NpcDef = {
  id: 'richter',
  name: 'Der Richter',
  portrait: 'richter',
  sprite: 'richter-walk',
  faction: 'ordnungsdienst',
  bio: 'Strenger Richter am Eisenhof, der Dante zu 10.000 Stunden verurteilte. Gärtnert, backt, ruft „Schuldig!“ auch beim Unkrautjäten. Spielt donnerstags heimlich Karten und wird weich bei Musik.',
  gifts: {
    loves: ['blumensamen', 'kraeuter-gebaeck', 'stempelkissen', 'kartendeck'],
    likes: ['gesetzbuch', 'dantes-kekse', 'samenbombe', 'synth-kaffee', 'echtobst-apfel', 'hofhonig', 'vinyl-platte'],
    dislikes: ['volt-limo', 'chrome-10-gutschein'],
    hates: ['raubkopie-stick', 'plastikpflanze', 'rostige-dose', 'virus-implantat'],
  },
  schedule: [
    // Sonntag tagsüber Flohmarkt (privat).
    { slot: 'tag', days: ['so'], place: { map: 'schrottmarkt', at: 'flohmarkt' } },
    { slot: 'morgen', place: { map: 'gerichtssaal', at: 'richterbank' } },
    { slot: 'tag', place: { map: 'eisenhof', at: 'gerichtsgarten' } },
    { slot: 'abend', days: ['do'], place: { map: 'high-voltage', at: 'kartentisch' } },
    { slot: 'abend', days: ['fr'], place: { map: 'schrottmarkt', at: 'garkueche-bank' } },
    { slot: 'abend', place: { map: 'eisenhof', at: 'richter-bank' } },
    { slot: 'nacht', place: 'away' },
  ],
  heartEvents: [
    { id: 'he-richter-2', hearts: 2, map: 'eisenhof', time: 'tag', dialogue: 'he-richter-2' },
    { id: 'he-richter-4', hearts: 4, map: 'gerichtssaal', time: 'morgen', when: { weekday: 'mi' }, dialogue: 'he-richter-4' },
    { id: 'he-richter-6', hearts: 6, map: 'eisenhof', time: 'abend', when: { not: { weekday: ['do', 'fr'] } }, dialogue: 'he-richter-6' },
    { id: 'he-richter-8', hearts: 8, map: 'dantes-werkstatt', time: 'tag', when: { all: [AB_AKT2, { weekday: 'so' }] }, dialogue: 'he-richter-8' },
    { id: 'he-richter-10', hearts: 10, map: 'eisenhof', time: 'abend', when: { all: [AB_AKT2, { seen: 'he-richter-8' }] }, dialogue: 'he-richter-10' },
  ],
  talk: [
    rede('richter-tag-rivale', { rival: 'richter' }),
    rede('richter-tag-knast', { all: [{ origin: 'origin-knastvogel' }, { notFlag: 'richter_herkunft' }] }),
    rede('richter-tag-ex-wache', { all: [{ origin: 'origin-ex-wache' }, { notFlag: 'richter_herkunft' }] }),
    rede('richter-tag-zeit', NICHT_AKT2, 8),
    rede('richter-tag-streaming', { quest: STREAMING, state: 'active' }),
    rede('richter-tag-gurke', { quest: GURKE, state: 'active' }),
    rede('richter-tag-karten', { all: [{ weekday: 'do' }, { time: 'abend' }] }),
    rede('richter-tag-garkueche', { all: [{ weekday: 'fr' }, { time: 'abend' }] }),
    rede('richter-tag-flohmarkt', { all: [{ weekday: 'so' }, { time: 'tag' }] }),
    rede('richter-tag-vertraut', undefined, 6),
    rede('richter-tag-morgen', { time: 'morgen' }),
    rede('richter-tag-garten', { time: 'tag' }),
    rede('richter-tag-abend', { time: 'abend' }),
    rede('richter-tag-standard'),
  ],
};

export const part: ContentPart = {
  npcs: { richter },
  dialogues: sammle(
    T.rivale, T.knast, T.exWache, T.zeit, T.streaming, T.gurke, T.karten, T.garkueche, T.flohmarkt, T.morgen, T.garten,
    T.vertraut, T.abend, T.standard,
    he2, he4, he6, he8, he10,
  ),
  phone: {
    'tel-richter-schoeffe': {
      id: 'tel-richter-schoeffe', from: 'richter',
      text: 'Mittwoch, Bagatellgericht, Gerichtssaal, morgens. Der Schöffe ist krank. Sie sind gesund. Erscheinen Sie. – Das Gericht.',
      auto: { all: [{ hearts: 'richter', min: 4 }, neu('he-richter-4')] },
      replies: [{ text: 'Ich komme, Euer Ehren.' }, { text: 'Muss ich eine Robe tragen?' }],
    },
  },
};
