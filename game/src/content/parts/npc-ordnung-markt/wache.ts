// Wachtmeisterin Kessel – Wache am Eisenhof mit Strichliste, will Yogalehrerin werden, heimlich Collin-Fan
// (world.md §4.4, §4.6, §11.2). Tagesablauf nach design/plan/act1.json (npcSchedules.wache).
// Herz-Ereignisse he-wache-2/4/6 in Akt 1, he-wache-8/10 angelegt und an act2 gebunden.
// Begleiterin ab ♥8 und nach side-feierabend-fuer-kessel (Quest baut der Quest-Agent, hier nur Start und Verweis).
import type { ContentPart } from '../../part';
import type { Condition, DialogueChoice, DialogueNode, NpcDef } from '../../../modules/contracts';
import {
  type Menue, AB_AKT2, NICHT_AKT2, VEX, ZEIT_HINWEIS, dialog, erz, flag, herz, ich, knoten, neu, pruefung, rede, sammle,
  sprecher, tagesgespraech,
} from './_helfer';

const K = sprecher('wache');
const D = sprecher('dexter');

const FEIERABEND_QUEST = 'side-feierabend-fuer-kessel';
/** Kessel hat gekündigt (Flag aus der Quest oder Quest erledigt). */
const GEKUENDIGT: Condition = { any: [{ flag: 'kessel_feierabend' }, { quest: FEIERABEND_QUEST, state: 'done' }] };
/** world.md §4.6: Begleiterin ab ♥8 und nach ihrer Quest. */
const REKRUT: Condition = { all: [{ hearts: 'wache', min: 8 }, { quest: FEIERABEND_QUEST, state: 'done' }] };

// ---------------------------------------------------------------------------------------------- Menü

function menue(): Menue {
  const zurueck: DialogueChoice[] = [{ text: 'Noch was, Wachtmeisterin.', next: 'menue', id: 'zurueck' }, { text: 'Schönen Dienst noch.' }];

  const choices: DialogueChoice[] = [
    { text: 'Was steht eigentlich auf Ihrer Strichliste?', next: 'strichliste', once: true, id: 'k-strichliste' },
    {
      text: 'Sie sehen aus, als würden Sie lieber woanders sein.', next: 'kuendigen',
      when: { all: [{ quest: FEIERABEND_QUEST, state: 'inactive' }, { quest: 'main-1-raven', state: 'done' }] },
      effects: [{ startQuest: FEIERABEND_QUEST }],
    },
    { text: 'Collin Charleston, hm?', when: { seen: 'he-wache-4' }, once: true, id: 'k-collin', next: 'collin' },
    {
      text: 'Die Autogrammkarte von Collin. Für Sie.', when: { all: [{ item: 'autogrammkarte-collin' }, { flag: 'kessel_autogramm_versprochen' }, { notFlag: 'kessel_autogramm' }] },
      next: 'autogramm', effects: [{ take: 'autogrammkarte-collin' }, flag('kessel_autogramm'), herz('wache', 80)],
    },
    { text: '„Wie läuft die Nachtschicht ohne mich?“', tag: '[Ex-Wache]', when: { origin: 'origin-ex-wache' }, once: true, id: 'k-exwache', next: 'exwache' },
    {
      text: 'Lust auf Außendienst? Mit mir. Ohne Formular.', next: 'rekrut', tag: '[Kessel ♥8]',
      when: { all: [{ quest: FEIERABEND_QUEST, state: 'done' }, { not: { recruited: 'wache' } }] }, requires: REKRUT,
      effects: [{ recruit: 'wache' }],
    },
    { text: 'Schönen Dienst noch.' },
  ];

  const nodes: DialogueNode[] = [
    knoten('menue', [K('Bitte. Ich höre. Dienstlich. Privat höre ich nur Collin.', 'neutral')], { choices }),
    knoten('strichliste', [
      erz('Sie klappt ein abgegriffenes Notizbuch auf. Spalten über Spalten, mit Lineal gezogen.'),
      K('Entlassungen: 4.471. Rückfälle: 3.012. Leute, die „Wir sehen uns wieder!“ gerufen haben: 2.890. Leute, bei denen das stimmte: 2.889.', 'neutral'),
      K('Kaffee, der kalt war: alle. Tage bis zur Pension: zu viele. Ein Strich pro Tag. Ich habe Kugelschreiber verbraucht wie andere Leute Hoffnung.'),
      K('Und hier. Spalte „Unterhaltungen, die nett waren“. Da stehen Sie jetzt drin. Ein Strich. Machen Sie was draus.'),
    ], { choices: zurueck, effects: [herz('wache', 10)] }),
    knoten('kuendigen', [
      K('Woanders. Ja. Das ist das schönste Wort der Welt. Woanders.', 'neutral'),
      K('Ich will Yogalehrerin werden. Lachen Sie nicht. Ich hab schon gelacht. Dreimal. Dann hab ich mich angemeldet.'),
      K('Aber eine Kündigung im Ordnungsdienst? Formular 17b, Stempel vom Richter, Fundkammer übergeben. Und die Fundkammer ist … die Fundkammer ist ein Verbrechen gegen die Ordnung.', 'wut'),
      K('Wenn Sie mir helfen, schreibe ich Ihnen einen Strich in die Spalte „Menschen, die ich vermissen werde“. Die Spalte ist noch leer.'),
    ], { choices: zurueck }),
    knoten('collin', [
      K('Ich weiß nicht, was Sie meinen.', 'ueberrascht'),
      K('…', 'neutral'),
      K('Montag, Mittwoch, Freitag, zwölf Uhr, Stufenplatz. Ich habe mir die Mittagspause darauf gelegt. Seit sechs Jahren. Er hat einmal in meine Richtung gewunken. Es war ein Taxi hinter mir. Egal.'),
    ], { choices: zurueck }),
    knoten('autogramm', [
      K('Das ist …', 'ueberrascht'),
      erz('Sie hält die Karte mit zwei Fingern, als könnte sie zerfallen. Auf ihrer Unterlippe zittert etwas, das bei anderen Menschen ein Kreischen wäre.'),
      K('„Für Kessel – bleib ordentlich! Collin.“ ER HAT MEINEN NAMEN GESCHRIEBEN.'),
      K('Ich notiere: bester Tag im Dienst. Ich notiere es mit dem guten Kuli.', 'neutral'),
    ], { choices: zurueck }),
    knoten('exwache', [
      K('Ohne Sie? Schlechter. Der Neue liest beim Rundgang Comics. Und er unterschreibt die Strichliste mit Smiley.', 'wut'),
      K('Ich habe ihm den Smiley verboten. Er macht jetzt Sternchen. Ich kann nicht mehr.'),
    ], { choices: zurueck }),
    knoten('rekrut', [
      K('Außendienst. Ohne Formular.', 'ueberrascht'),
      K('Das ist gegen jede Vorschrift. … Ich habe keine Vorschriften mehr. Ich habe Feierabend.'),
      K('Gut. Ich komme mit. Ich halte die Linie, Sie machen den Rest. Und wenn einer fragt: Ich bin zur Beobachtung da. Und zum Schlagen.', 'neutral'),
      erz('Sie knöpft die Uniformjacke zu, steckt den Schockstab ein und zieht einen frischen Kuli aus der Brusttasche. Für die Strichliste unterwegs.'),
    ], { choices: zurueck }),
  ];
  return { choices, nodes };
}

const M = menue();

/** Rivalität: Taschenkontrollen; Versöhnung über Formular, Gebühr oder Kaffee. */
const RIVALE: Menue = {
  choices: [
    {
      text: 'Formular „Wiederherstellung Vertrauensverhältnis“ ausfüllen. Fehlerfrei.', next: 'formular',
      check: pruefung('wache-versoehnung-formular', 'technik', 5, ['formular']), effects: [{ reconcile: 'wache' }],
    },
    { text: 'Bearbeitungsgebühr zahlen. 30 Credits.', requires: { credits: 30 }, next: 'gebuehr', effects: [{ credits: -30 }, { reconcile: 'wache' }] },
    { text: 'Ihr einen Synth-Kaffee hinstellen. Wortlos.', when: { item: 'synth-kaffee' }, next: 'kaffee', effects: [{ take: 'synth-kaffee' }, { reconcile: 'wache' }] },
    { text: 'Ich geh schon.' },
  ],
  nodes: [
    knoten('formular', [
      erz('Vier Seiten. Durchschlag. Kästchen, in die kein Buchstabe passt. Du schreibst trotzdem so klein, dass es passt.'),
      K('Fehlerfrei. Mit Durchschlag. Das hat noch keiner geschafft.', 'ueberrascht'),
      K('Akte geschlossen. Ich radiere Ihre Striche. Alle. Mit dem guten Radiergummi.'),
    ]),
    knoten('gebuehr', [K('Gebühr erhalten. Quittung folgt per Post. Post gibt es nicht. Wir sind quitt.', 'neutral')]),
    knoten('kaffee', [
      K('…', 'neutral'),
      erz('Sie trinkt. Sie stellt den Becher ab. Sie streicht in ihrem Notizbuch etwas durch.'),
      K('Bestechung mit Heißgetränken ist nicht strafbar. Ich habe das geprüft. Mehrmals. In schwachen Momenten.'),
    ]),
  ],
};

// ---------------------------------------------------------------------------------------------- Tagesgespräche

const T = {
  rivale: tagesgespraech('wache-tag-rivale',
    [K('Halt. Taschenkontrolle. Arme hoch. Nein, höher. Das ist kein Gruß, das ist eine Anweisung.', 'wut')],
    [K('Sie stehen auf meiner Liste. Spalte „Leute, die ich nicht wiedersehen will“. Sie sind wieder da. Das ist ein Problem. Für Sie.', 'wut')],
    RIVALE),
  exWache: tagesgespraech('wache-tag-ex-wache',
    [
      K('Moment. MOMENT. Du warst doch bei der Nachtschicht! Block C! Du hast den Kaffeeautomaten mit dem Gummiknüppel repariert!', 'ueberrascht'),
      K('Entschuldigung. Sie. Sie haben. Ich bin … dienstlich erfreut.'),
    ],
    [K('Weißt du noch, die Nacht mit dem Stromausfall? Wir haben mit Taschenlampen Schattentiere gemacht, bis der Generator lief. Ich hab den Hasen gemacht. Bester Hase der Schicht.', 'neutral')],
    M, { effects: [herz('wache', 200), flag('wache_herkunft')] }),
  knast: tagesgespraech('wache-tag-knast',
    [
      K('Sie kenne ich. Häftlingsnummer … nicht mehr wichtig. Sie sind draußen. Und Sie sind nicht wiedergekommen.', 'ueberrascht'),
      K('Das ist auf meiner Liste die seltenste Spalte. Gratuliere. Dienstlich. Und ein bisschen privat.'),
    ],
    [K('Wissen Sie, warum ich „Ich hoffe, wir sehen uns nicht wieder“ sage? Weil es der einzige Satz ist, bei dem ich mich jedes Mal freue, wenn ich unrecht habe.', 'neutral')],
    M, { effects: [herz('wache', 100), flag('wache_herkunft')] }),
  vexaria: tagesgespraech('wache-tag-vexaria',
    [
      K('Frau Schrapnell. Ich habe eine neue Spalte angelegt. Bitte nicht erschrecken.', 'neutral'),
      erz('Auf der Seite steht in Druckbuchstaben: „KURIERIN + BRECHERIN, ÖFFENTLICHES HÄNDCHENHALTEN“. Darunter elf Striche. Einer davon ist ein Herz, sehr klein, sehr verwischt.'),
      K('Das Herz war ein Versehen. Der Kuli ist ausgerutscht. Elfmal.', 'ueberrascht'),
    ],
    [K('Vorschrift sagt: Zuneigung im öffentlichen Raum ist erlaubt, solange der Verkehr nicht behindert wird. Gestern haben Sie den Verkehr behindert. Ich habe trotzdem weggesehen. Zweimal. Sehr langsam.', 'neutral')],
    M, { effects: [flag('wache_kommentar_vexaria')] }),
  zeit: tagesgespraech('wache-tag-zeit',
    [
      K('{name}. Ich habe Ihnen eine eigene Seite angelegt. Eine ganze Seite.', 'neutral'),
      erz(ZEIT_HINWEIS),
    ],
    [K('Irgendwann zeige ich Ihnen die Stadt von oben. Mit Feuerwerk. Wenn die Stadt wieder Feuerwerk verdient. Ich sag Bescheid. Per Dienstweg.')],
    M),
  gekuendigt: tagesgespraech('wache-tag-gekuendigt',
    [
      K('Namaste. Nein. Doch. Namaste. Ich übe noch.', 'neutral'),
      erz('Kessel trägt Leggings mit Uniformmuster und einen Pulli mit der Aufschrift „ATMEN IST KEINE VORSCHRIFT“. Die Strichliste hat sie trotzdem dabei.'),
    ],
    [K('Heute gezählt: Atemzüge. Sechshundertzwölf. Hunter war gestern da, hat „Diese Pose ist eine Beleidigung“ gesagt und ist dann im „Hund“ eingeschlafen. Ich hab ihm einen Strich gegeben. Einen guten.', 'neutral')],
    M),
  quest: tagesgespraech('wache-tag-quest',
    [K('Formular 17b liegt bereit. Mein Mut liegt daneben. Er ist kleiner.', 'neutral')],
    [K('Wenn ich wirklich gehe, wer passt dann auf, dass hier alles ordentlich ist? … Der mit dem Sternchen. Oh Gott. Ich muss gehen, bevor ich es mir anders überlege.', 'ueberrascht')],
    M),
  saal: tagesgespraech('wache-tag-saal',
    [K('Saalwache. Bitte Ruhe. Der Richter verhandelt gerade über einen Toaster. Der Toaster ist unschuldig, aber das sage ich nicht laut.', 'neutral')],
    [K('Die Regel im Saal: Nicht lachen, nicht weinen, nicht klatschen. Ich habe bisher alle drei gebrochen. Beim Toaster. Innerlich.')],
    M),
  besucher: tagesgespraech('wache-tag-besucher',
    [K('Besuchszeit. Taschen auf den Tisch, Hände sichtbar, keine Kuchen mit Feilen drin. Wir prüfen jeden Kuchen. Persönlich. Mit Gabel.', 'neutral')],
    [K('Heute schon drei Kuchen beschlagnahmt. Keine Feilen drin. Aber Vorschrift ist Vorschrift. Und Streusel ist Streusel.')],
    M),
  kiosk: tagesgespraech('wache-tag-kiosk',
    [
      K('Ich bin nicht im Dienst. Sehen Sie? Keine Mütze. Ich bin eine Bürgerin, die eine Zeitschrift liest.', 'ueberrascht'),
      erz('Die Zeitschrift heißt „NX-1 Hautnah“. Auf dem Titel: Collin Charleston mit Mikrofon. Sie hält sie so, dass das Titelbild nach innen zeigt.'),
    ],
    [K('Nach Dienstschluss eine Neon-Limo am Bahnhofskiosk. Das ist mein Feierabend. Dreiundzwanzig Minuten, dann fährt meine Bahn. Wenn sie fährt. Sie fährt nie.', 'neutral')],
    M),
  vertraut: tagesgespraech('wache-tag-vertraut',
    [K('Ich hoffe, wir sehen uns nicht wieder. … Das war ein Witz. Ich habe den Witz extra für Sie geübt. Vor dem Spiegel.', 'neutral')],
    [K('Seit Sie hier rumlaufen, habe ich eine Spalte, die wächst. „Gute Tage“. Sie ist noch nicht die längste. Aber sie holt auf.')],
    M),
  morgen: tagesgespraech('wache-tag-morgen',
    [K('Eisenhof, Entlassungstor. Name, Anliegen, Grund des Aufenthalts. Und bitte nicht „Ich wollte nur mal gucken“. Das schreiben alle.', 'neutral')],
    [
      K('Heute früh: zwei Entlassungen, eine Taube im Wachhäuschen, ein Mann, der freiwillig wieder rein wollte, weil drinnen das Frühstück besser ist.'),
      K('Ich habe ihm ein Brötchen gegeben und ihn rausgeschickt. Vorschrift. Und weil das Frühstück drinnen wirklich besser ist.', 'neutral'),
    ],
    M),
  standard: tagesgespraech('wache-tag-standard',
    [K('Wachtmeisterin Kessel, Ordnungsdienst. Was kann ich für Sie tun, das nicht gegen Paragraf 3 bis 117 verstößt?', 'neutral')],
    [K('Ich hoffe, wir sehen uns nicht wieder. Das sage ich zu allen. Bei Ihnen meine ich es … weniger.')],
    M),
};

// ---------------------------------------------------------------------------------------------- Herz-Ereignisse

const he2 = dialog('he-wache-2', [
  knoten('start', [
    erz('Das Wachhäuschen am Eisenhof: ein Stuhl, ein Ventilator, ein Kaffeeautomat mit Schild „AUSSER BETRIEB SEIT 2079“. Kessel sitzt davor, das Notizbuch auf dem Knie, und zieht mit Lineal einen Strich.'),
    K('Neunhundertsiebenundvierzig. Tage ohne Kaffee aus diesem Automaten. Ich führe Buch. Irgendwer muss es tun.', 'neutral'),
    K('Die Kollegen holen sich ihren in der Kantine. Ich nicht. Aus Prinzip. Der Automat ist Dienstausstattung. Wenn er nicht geht, geht auch die Ordnung nicht.'),
  ], {
    choices: [
      { text: 'Ihr meinen Synth-Kaffee in die Hand drücken.', when: { item: 'synth-kaffee' }, next: 'geschenkt', effects: [{ take: 'synth-kaffee' }, herz('wache', 40)] },
      {
        text: 'Den Automaten aufschrauben. Das ist bestimmt nur die Brühgruppe.', next: 'repariert',
        check: pruefung('he-wache-2-automat', 'technik', 4, ['reparieren']), effects: [herz('wache', 50)],
      },
      {
        text: '„Kantinenhintertür. Da steht die gute Maschine, die keiner kennt.“', next: 'hintertuer',
        check: pruefung('he-wache-2-hintertuer', 'strasse', 4, ['geruecht']), effects: [herz('wache', 40)],
      },
      { text: 'Ihr anbieten, kurz das Tor zu übernehmen, während sie selbst Kaffee holt.', next: 'vertretung', effects: [{ advanceTime: 15 }, herz('wache', 30)] },
    ],
  }),
  knoten('geschenkt', [
    K('Das ist … nicht Dienstausstattung.', 'ueberrascht'),
    erz('Sie riecht daran. Sie trinkt. Ihr Gesicht macht etwas, das es lange nicht gemacht hat.'),
    K('Neunhundertsiebenundvierzig Tage. Und dann kommen Sie und machen einen Strich kaputt. Ich muss eine neue Spalte anfangen.'),
  ], { next: 'ende' }),
  knoten('repariert', [
    erz('Zwei Schrauben, ein verkalkter Schlauch, ein Klaps mit der flachen Hand an die richtige Stelle. Der Automat röchelt, hustet – und spuckt einen Becher Kaffee aus. Heiß. Schwarz. Echt.'),
    K('Er … er lebt.', 'ueberrascht'),
    K('Ich muss das melden. Formular „Wiederinbetriebnahme Dienstgerät“. Ich hab es seit zwei Jahren ausgefüllt in der Schublade. Für diesen Tag.'),
  ], { next: 'ende', effects: [flag('kessel_automat_repariert')] }),
  knoten('hintertuer', [
    ich('Kantine, Hintereingang, hinter den Mülltonnen. Da steht die Maschine vom Küchenchef. Echte Bohnen. Der Code ist das Geburtsjahr des Richters.'),
    K('Neunundsiebzig. Natürlich.', 'ueberrascht'),
    erz('Fünf Minuten später ist sie zurück, mit zwei Bechern und einem Blick, als hätte sie ein Staatsgeheimnis gestohlen.'),
    K('Ich habe gegen eine Vorschrift verstoßen. Es war die beste Vorschrift, gegen die ich je verstoßen habe.'),
  ], { next: 'ende' }),
  knoten('vertretung', [
    erz('Du stehst eine Viertelstunde am Tor. Ein Entlassener fragt, ob du neu bist. Ein Rostzahn fragt, ob du käuflich bist. Eine Taube fragt nichts, setzt sich aber auf deine Schulter.'),
    K('Und? Vorkommnisse?', 'neutral'),
    ich('Eine Taube. Die hat Ihren Stuhl besetzt.'),
    K('Die Taube heißt Paragraf. Sie gehört zum Inventar.'),
  ], { next: 'ende' }),
  knoten('ende', [
    erz('Kessel schlägt das Notizbuch auf einer neuen Seite auf, zieht mit dem Lineal eine Spalte und schreibt oben in Schönschrift deinen Namen. Darunter: ein Strich.'),
    K('Spalte „Hilfsbereit“. Das ist die erste Spalte in elf Jahren, die nicht mit „Vorfall“ anfängt.', 'neutral'),
    K('Ich hoffe, wir sehen uns nicht wieder. … Ich meine: nicht so bald. Doch, bald. Ach, egal. Gehen Sie, bevor ich weich werde.'),
  ], { effects: [{ xp: 40 }, herz('wache', 20), flag('kessel_strichliste_kaffee')] }),
]);

const he4 = dialog('he-wache-4', [
  knoten('start', [
    erz('Bahnhofskiosk, Feierabend. Kessel ohne Mütze, die Uniformjacke über dem Arm, eine Neon-Limo in der Hand und eine Zeitschrift auf dem Tresen. Collin Charleston grinst vom Titel. Sie klappt sie zu, als sie dich sieht. Zu spät.'),
    K('Das ist dienstlich. Ich prüfe die Presse auf … Volksverhetzung.', 'ueberrascht'),
    K('…', 'neutral'),
    K('Na gut. Ich mag ihn. Er sagt immer „Bleibt ordentlich, Noxius!“. Keiner sonst sagt mir, ich soll ordentlich bleiben. Alle sagen mir, ich soll mich entspannen.'),
    K('Wissen Sie, was ich will? Einmal Feierabend, der länger ist als dreiundzwanzig Minuten. Eine Yogamatte. Und einmal Feuerwerk sehen, von oben, bei der Neonnacht. Ich hab jedes Jahr Dienst. Ich sehe nur den Rauch.'),
  ], {
    choices: [
      {
        text: '„Ich kenn Collin. Ich besorg Ihnen ein Autogramm.“', tag: '[Collin ♥2]', requires: { hearts: 'collin-charleston', min: 2 },
        next: 'autogramm', effects: [flag('kessel_autogramm_versprochen'), herz('wache', 40), herz('collin-charleston', 10)],
      },
      {
        text: '„Kündigen Sie. Nicht irgendwann. Diese Woche.“', next: 'mut',
        check: pruefung('he-wache-4-mut', 'ausstrahlung', 5, ['ueberzeugen']), effects: [herz('wache', 50), flag('kessel_mut')],
      },
      { text: 'Zwei Neon-Limos bestellen und einfach zuhören.', requires: { credits: 6 }, next: 'zuhoeren', effects: [{ credits: -6 }, herz('wache', 35)] },
      { text: '„Sie würden eine furchtbare Yogalehrerin sein. Herrlich furchtbar.“', next: 'furchtbar', effects: [herz('wache', 30)] },
    ],
  }),
  knoten('autogramm', [
    K('Sie kennen ihn. Persönlich. Mit Händeschütteln.', 'ueberrascht'),
    K('Ich will nicht drängeln. Ich will es aber. Schreiben Sie „Für Kessel“ drauf. Nicht „Für Wachtmeisterin“. Nur Kessel. Das ist privat.'),
    erz('Collin verteilt Autogrammkarten in den Glasarkaden, abends. Oder er hat noch welche in der Jackentasche, wenn man ihn nett fragt.'),
  ], { next: 'ende' }),
  knoten('mut', [
    K('Diese Woche.', 'ueberrascht'),
    K('Das ist gegen jede Dienstplanung. Das ist … das ist eine Idee. Eine richtig schlechte, wunderbare Idee.'),
    erz('Sie zieht das Notizbuch raus und schreibt eine neue Spalte: „Tage bis Feierabend (für immer)“. Sie zögert. Dann schreibt sie eine Sieben.'),
  ], { next: 'ende' }),
  knoten('zuhoeren', [
    erz('Ihr steht eine Weile am Kiosk. Sie erzählt von der Nachtschicht 2081, als ein ganzer Block Häftlinge „Ordnung muss sein“ von Collin mitgesungen hat, und wie sie mitgesungen hat, ganz leise, hinter der Panzerglasscheibe.'),
    K('Das habe ich noch nie jemandem erzählt. Nicht mal der Strichliste.', 'neutral'),
  ], { next: 'ende' }),
  knoten('furchtbar', [
    K('Furchtbar.', 'wut'),
    K('… Sie haben recht. Ich würde Leute anbrüllen, die falsch atmen. „EINATMEN, PARAGRAF ZWEI!“', 'ueberrascht'),
    erz('Sie lacht. Laut. Ein Pendler lässt vor Schreck seinen Kaffee fallen.'),
  ], { next: 'ende' }),
  knoten('ende', [
    erz('Ihre Bahn fährt ein. Natürlich zu spät. Kessel steckt die Zeitschrift unter den Arm, Titelbild nach außen.'),
    K('Ich hoffe, wir sehen uns nicht wieder. … Morgen. Ich hoffe, wir sehen uns morgen nicht wieder. Übermorgen ist in Ordnung.', 'neutral'),
  ], { effects: [{ xp: 60 }, herz('wache', 20), flag('kessel_feierabend_traum')] }),
]);

const he6 = dialog('he-wache-6', [
  knoten('start', [
    erz('Morgens am Entlassungstor. Kessel steht steif wie ein Laternenpfahl, die Strichliste in der Hand – Regeldienst, Übergabeschicht, egal, wenn am Tor was los ist, steht Kessel da. Hinter ihr rollt ein Wäschekorb auf Rädern aus der Gefängniswäscherei. Er wackelt. Er niest.'),
    D('Psst! Psst! Hallo! Nicht hingucken! Ich bin Wäsche! Ersatzhaft wegen Bußgeldern, 48 Stunden, und das Frühstück ist SCHLECHTER als in den Prospekten!', 'besorgt'),
    erz('Ein Paar Socken hebt sich und darunter blinzelt Dexter heraus. Kessel dreht ganz langsam den Kopf. Zu ihm. Dann zu dir.'),
    K('Ich sehe einen Wäschekorb. Wäschekörbe stehen nicht auf meiner Liste.', 'neutral'),
    erz('Über dem Tor schwenkt die Kamera herum. Im Wachhäuschen gähnt ihr Kollege und greift nach dem Monitor.'),
  ], {
    choices: [
      {
        text: 'Den Kollegen im Häuschen in ein langes Gespräch über Formulare verwickeln.', next: 'ablenken',
        check: pruefung('he-wache-6-ablenken', 'ausstrahlung', 6, ['ablenken']), effects: [herz('wache', 40), herz('dexter', 40)],
      },
      {
        text: 'Den Korb packen und durchs Tor schieben, bevor es zufährt.', next: 'schieben',
        check: pruefung('he-wache-6-schieben', 'reflexe', 5, ['flink']), effects: [herz('wache', 40), herz('dexter', 40)],
      },
      { text: 'Mich vor die Kamera stellen und Kessel nach dem Weg fragen. Sehr ausführlich.', next: 'fragen', effects: [herz('wache', 30), herz('dexter', 30)] },
      { text: '„Wachtmeisterin, im Korb sitzt Dexter.“', next: 'melden', effects: [herz('wache', 10), herz('dexter', -50)] },
    ],
  }),
  knoten('ablenken', [
    ich('Entschuldigung, wenn ich Formular 17b mit Durchschlag einreiche, muss der Durchschlag dann auch unterschrieben sein oder nur abgestempelt?'),
    erz('Der Kollege richtet sich auf. Seine Augen leuchten. Endlich fragt mal jemand. Er holt aus. Weit. Hinter dir rollt ein Wäschekorb sehr leise durchs Tor.'),
  ], { next: 'weggeschaut' }),
  knoten('schieben', [
    erz('Du sprintest los, packst den Korb an der Kante und gibst ihm einen Stoß. Er rattert über das Pflaster, kippt fast, fängt sich, und das Tor schließt sich zwei Fingerbreit hinter einem fliegenden Unterhemd.'),
    D('Ich bin frei! Ich bin FREI! Ich zahle immer! Dir! Irgendwann! MIT ZINSEN!', 'freude'),
  ], { next: 'weggeschaut' }),
  knoten('fragen', [
    ich('Wachtmeisterin, wie komme ich zum Stufenplatz? Und dann zur Kantine? Und gibt es da vegane Optionen? Und Parkplätze für Einkaufswagen?'),
    K('Stufenplatz: links. Kantine: rechts. Vegan: Brötchen. Einkaufswagen: nur mit Genehmigung.', 'neutral'),
    erz('Sie antwortet ruhig, gründlich, mit der Hand am Kinn. Und sie steht dabei genau so, dass die Kamera nur ihren Rücken sieht. Der Korb verschwindet um die Ecke.'),
  ], { next: 'weggeschaut' }),
  knoten('melden', [
    K('Ein Wäschekorb, der Dexter enthält.', 'neutral'),
    K('…', 'wut'),
    K('Herr Dexter. Aussteigen. Sie haben noch sechs Stunden. Ich bringe Ihnen nachher einen Kaffee. Aus dem reparierten Automaten. Wenn es einen gibt.'),
    D('Verräter! VERRÄTER! … Mit Milch, bitte.', 'besorgt'),
    erz('Als Dexter weg ist, sieht Kessel dich lange an.'),
    K('Korrekt gehandelt. Vorschriftsmäßig. Ich hätte es genauso gemacht.', 'neutral'),
    K('Ich hätte nur gehofft, dass Sie es nicht tun.'),
  ], { effects: [{ xp: 40 }, flag('kessel_dexter_gemeldet')] }),
  knoten('weggeschaut', [
    erz('Kessel klappt das Notizbuch auf. Sie zieht einen Strich. Dann radiert sie ihn wieder weg.'),
    K('Ich notiere: keine Vorkommnisse.', 'neutral'),
    K('Ich habe in elf Jahren nie weggesehen. Nicht einmal. Heute habe ich drei Sekunden lang einen sehr interessanten Fleck an der Wand angeschaut.'),
    K('Es war ein schöner Fleck. Ich würde ihn wieder anschauen.', 'ueberrascht'),
  ], {
    choices: [
      { text: '„Willkommen in der Unterstadt, Kessel.“', next: 'ende', effects: [herz('wache', 20)] },
      { text: '„Der Fleck bleibt unter uns.“', next: 'ende', effects: [herz('wache', 20)] },
    ],
  }),
  knoten('ende', [
    K('Ich hoffe, wir sehen uns nicht wieder. Bei so einer Sache. Bei anderen Sachen …', 'neutral'),
    K('Bei anderen Sachen gern.'),
  ], { effects: [{ xp: 80 }, flag('kessel_weggeschaut')] }),
]);

// ♥8 und ♥10: angelegt, erst ab act2 (world.md §11.2).
const he8 = dialog('he-wache-8', [
  knoten('start', [
    erz('Bahnhofskiosk. Kessel schiebt dir einen gefalteten Zettel über den Tresen, ohne dich anzusehen.'),
    K('Dienstplan Einlass. Für eine gewisse Feier in einem gewissen Turm. Ich stehe am Seiteneingang. Zwischen 22:10 und 22:25 kontrolliere ich sehr gründlich meine Schnürsenkel.', 'neutral'),
    K('Das habe ich nicht gesagt. Ich habe nur laut über Schnürsenkel nachgedacht.'),
  ], {
    effects: [flag('kessel_einlass_abkuerzung')],
    choices: [
      { text: '„Kessel. Sie riskieren Ihren Job.“', next: 'job' },
      { text: '„Ihre Schnürsenkel sind mir heilig.“', next: 'heilig' },
    ],
  }),
  knoten('job', [K('Welchen Job? Ich bin halb Yogalehrerin. Halb ist genug Risiko.', 'neutral')], { effects: [herz('wache', 40), { xp: 120 }] }),
  knoten('heilig', [K('Gut. Doppelknoten. Dauert länger.', 'ueberrascht')], { effects: [herz('wache', 40), { xp: 120 }] }),
]);

const he10 = dialog('he-wache-10', [
  knoten('start', [
    erz('Neonnacht. Kessel hat zum ersten Mal in elf Jahren frei und zieht dich eine Feuerleiter am Bahnhof hinauf, bis aufs Dach des Stellwerks.'),
    K('Stadtführung. Inoffiziell. Da: der Eisenhof, sieht von oben aus wie ein Kuchenblech. Da: Babettes Dampf. Da: der Stufenplatz, wo Collin immer winkt. Nicht mir. Aber in meine Richtung.', 'neutral'),
    erz('Dann knallt es. Über der Unterstadt platzen Farben, Rot, Gold, Neongrün, und spiegeln sich in jeder Pfütze bis zur Flutmauer.'),
    K('Kein Rauch. Diesmal kein Rauch. Nur Licht.', 'ueberrascht'),
    erz('Sie zieht die Strichliste aus der Jacke, reißt die Seite mit deinem Namen heraus und drückt sie dir in die Hand.'),
    K('Die gehört Ihnen. Die längste Spalte, die ich je geführt habe. Ich fang eine neue an. Mit einem Strich. Für heute.'),
  ], {
    effects: [{ give: 'wachen-strichliste' }, flag('kessel_feuerwerk'), { xp: 200 }, herz('wache', 50)],
    choices: [
      { text: '„Ich hoffe, wir sehen uns wieder, Kessel.“', next: 'wieder' },
    ],
  }),
  knoten('wieder', [
    K('Das ist der falsche Satz.', 'ueberrascht'),
    K('… Es ist der richtige. Ich notiere ihn.'),
  ]),
]);

// ---------------------------------------------------------------------------------------------- Figur

const wache: NpcDef = {
  id: 'wache',
  name: 'Wachtmeisterin Kessel',
  unknownName: 'Wachtmeisterin',
  portrait: 'wache',
  sprite: 'wache-walk',
  faction: 'ordnungsdienst',
  bio: 'Wachtmeisterin am Eisenhof. Führt eine Strichliste über alles, will kündigen und Yogalehrerin werden, ist heimlich Collin-Fan. „Ich hoffe, wir sehen uns nicht wieder.“ Meint es zunehmend nett.',
  gifts: {
    loves: ['stickerbogen', 'nougatbombe', 'synth-nudeln'],
    likes: ['synth-kaffee', 'bao-dampfnudel', 'neon-limo', 'autogrammkarte-collin', 'echtobst-apfel', 'hofhonig'],
    dislikes: ['dietrich-set', 'wurfmesser-poliert'],
    hates: ['raubkopie-stick', 'rostige-dose', 'virus-implantat'],
  },
  schedule: [
    // Nach der Kündigung: Yoga im Hinterhof-Studio (Lötgassen).
    { slot: ['morgen', 'tag'], when: GEKUENDIGT, place: { map: 'loetgassen', at: 'hinterhof-studio' } },
    { slot: 'morgen', days: ['mi'], place: { map: 'gerichtssaal', at: 'saalwache' } },
    { slot: 'morgen', place: { map: 'eisenhof', at: 'entlassungstor' } },
    { slot: 'tag', place: { map: 'zellentrakt', at: 'besucherraum-tuer' } },
    { slot: 'abend', place: { map: 'bahnhof-mitte', at: 'kiosk-bahnhof' } },
    { slot: 'nacht', place: 'away' },
  ],
  heartEvents: [
    { id: 'he-wache-2', hearts: 2, map: 'eisenhof', time: 'morgen', when: { not: { weekday: 'mi' } }, dialogue: 'he-wache-2' },
    { id: 'he-wache-4', hearts: 4, map: 'bahnhof-mitte', time: 'abend', dialogue: 'he-wache-4' },
    { id: 'he-wache-6', hearts: 6, map: 'eisenhof', time: 'morgen', when: { not: { weekday: 'mi' } }, dialogue: 'he-wache-6' },
    { id: 'he-wache-8', hearts: 8, map: 'bahnhof-mitte', time: 'abend', when: AB_AKT2, dialogue: 'he-wache-8' },
    { id: 'he-wache-10', hearts: 10, map: 'bahnhof-mitte', time: 'nacht', when: { all: [AB_AKT2, { seen: 'he-wache-8' }, { cycleDay: 7 }] }, dialogue: 'he-wache-10' },
  ],
  companion: {
    recruit: REKRUT,
    stats: {
      hp: 58, armor: 3, morale: 95,
      attributes: { technik: 4, koerper: 6, reflexe: 4, ausstrahlung: 4, strasse: 3 },
      weapon: { kind: 'nahkampf', damage: 5, range: 1, hit: 5, ability: 'waffe-schockstoss' },
      abilities: ['wache-schildwall', 'wache-vorschrift'],
    },
    heartAbilities: [{ hearts: 10, ability: 'wache-wir-sehen-uns-nicht-wieder' }],
  },
  partyCheckBonus: [
    { attribute: 'ausstrahlung', tags: ['formular', 'behoerde', 'ueberzeugen'], value: 1, label: 'Kessel kennt die Vorschrift' },
  ],
  talk: [
    rede('wache-tag-rivale', { rival: 'wache' }),
    rede('wache-tag-ex-wache', { all: [{ origin: 'origin-ex-wache' }, { notFlag: 'wache_herkunft' }] }),
    rede('wache-tag-knast', { all: [{ origin: 'origin-knastvogel' }, { notFlag: 'wache_herkunft' }] }),
    rede('wache-tag-vexaria', { all: [VEX, { flag: 'aria_romanze_zusammen' }, { notFlag: 'wache_kommentar_vexaria' }] }),
    rede('wache-tag-gekuendigt', GEKUENDIGT),
    rede('wache-tag-zeit', NICHT_AKT2, 8),
    rede('wache-tag-quest', { quest: FEIERABEND_QUEST, state: 'active' }),
    rede('wache-tag-saal', { all: [{ weekday: 'mi' }, { time: 'morgen' }] }),
    rede('wache-tag-vertraut', undefined, 6),
    rede('wache-tag-besucher', { time: 'tag' }),
    rede('wache-tag-kiosk', { time: 'abend' }),
    rede('wache-tag-morgen', { time: 'morgen' }),
    rede('wache-tag-standard'),
  ],
};

export const part: ContentPart = {
  npcs: { wache },
  dialogues: sammle(
    T.rivale, T.exWache, T.knast, T.vexaria, T.zeit, T.gekuendigt, T.quest, T.saal, T.besucher, T.kiosk, T.vertraut,
    T.morgen, T.standard,
    he2, he4, he6, he8, he10,
  ),
  phone: {
    'tel-wache-kiosk': {
      id: 'tel-wache-kiosk', from: 'wache',
      text: 'Dienstliche Mitteilung: Ich bin heute Abend am Bahnhofskiosk. Privat. Diese Nachricht ist nicht privat. Sie ist eine Information. – Kessel',
      auto: { all: [{ hearts: 'wache', min: 4 }, neu('he-wache-4')] },
      replies: [{ text: 'Ich komme vorbei.' }, { text: 'Ist das eine Einladung?', effects: [herz('wache', 5)] }],
    },
  },
};
