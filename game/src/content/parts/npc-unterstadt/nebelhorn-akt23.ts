// Käpt'n Nebelhorn in Akt 2, Akt 3 und im Nachspiel (world.md §4.4, act23.json he-kaeptn-nebelhorn-8/10).
// Kein eigener Inhaltsteil: kaeptn-nebelhorn.ts holt Menü-Ergänzung, Phasen, Fahrplan-Vorsatz und he-8/10 von hier.
import type { ContentPart } from '../../part';
import type { DialogueDef, ScheduleEntry, TalkDef } from '../../../modules/contracts';
import {
  type Menue, AKT2_NUR, AKT3_NACHT, ARIA_GECHIPPT, COUNTDOWN_DONE, ENDE_3B, ENDE_MEER, ENDE_NEXUS, EPILOG, EPILOG_FREI, MASTER,
  NYRA_WEG, PARTY_VORB, alle, dialog, erz, flag, herz, ich, knoten, phasen, pruefung, sprecher,
} from './_lib';

const ID = 'kaeptn-nebelhorn';
const N = sprecher(ID);

// ---------------------------------------------------------------------------------------------- Menü (ab Akt 2)

export const MENUE_23: Menue = {
  choices: [
    {
      text: 'Kontrolliert Quantum jetzt auch die Fähre?', next: 'n23-kontrolle',
      when: alle(AKT2_NUR, { notFlag: 'nebelhorn_23_kontrolle' }), effects: [flag('nebelhorn_23_kontrolle'), herz(ID, 10)],
    },
    {
      text: 'Erzähl mir was aus dem Logbuch.', tag: '[Logbuch]', next: 'n23-logbuch',
      when: alle({ flag: 'nebelhorn_logbuch' }, { notFlag: 'heute_nebelhorn_logbuch' }), effects: [flag('heute_nebelhorn_logbuch'), herz(ID, 5)],
    },
  ],
  nodes: [
    knoten('n23-kontrolle', [
      N('Kontrollieren! Eine Drohne hat sich auf meinen Schornstein gesetzt und gefragt, ob die Fahrt „notwendig“ ist. NOTWENDIG! Ich fahr seit einunddreißig Jahren im Kreis. Natürlich ist das nicht notwendig! Das ist Tradition!', 'wut'),
      N('Ich hab getutet. Die Drohne ist ins Becken gefallen. Seitdem schickt Quantum mir Rechnungen. Ich falte Schiffchen draus.', 'freude'),
    ], { next: 'menue' }),
    knoten('n23-logbuch', [
      N('Tag neun: „Die Möwen hier sind größer als Katzen und frecher als Zöllner. Ich habe eine Fritzi genannt. Fritzi hat meinen Hut.“', 'freude'),
      N('Großmutter hatte Humor. Und keinen Hut mehr. Ich hab beides geerbt.'),
    ], { next: 'menue' }),
  ],
};

// ---------------------------------------------------------------------------------------------- Herz-Ereignis 8

/** ♥8 (Hausboot, nachts, act2): das Logbuch der Großmutter – nasse Seiten, eine Route, ein Satz. */
const he8 = dialog('he-kaeptn-nebelhorn-8', [
  knoten('start', [
    erz('Hausboot, nachts. Regen trommelt aufs Dach, über dem Becken kreist ein Suchscheinwerfer von Quantum. Nebelhorn hat das Buch mit den Salzflecken aus dem Regal geholt. „Logbuch – M. Nebelhorn“ steht auf dem Einband. Er legt es zwischen euch auf den Tisch, neben zwei Gläser Rum.'),
    N('Das Logbuch meiner Großmutter. Ich hab es vierzig Jahre nicht aufgemacht. Heute machen wir es auf. Zusammen. Sonst trau ich mich nie.', 'besorgt'),
    N('Und weil die Drohnen jetzt alles zählen, was schwimmt. Wenn sie mir das Boot wegnehmen, will ich vorher wissen, was drinsteht.'),
    erz('Er schlägt es auf. Die ersten Seiten sind klar. Die letzten sind vom Wasser verklebt, die Tinte ausgelaufen.'),
  ], {
    choices: [
      {
        text: 'Die verklebten Seiten mit Dampf und einem Messer lösen.', next: 'geloest',
        check: pruefung('he-nebelhorn-8-seiten', 'technik', 5, ['reparieren', 'feinmechanik']), effects: [herz(ID, 50)],
      },
      {
        text: 'Die Kursnotizen am Rand entschlüsseln: Seemannskürzel, Peilungen, Strömung.', next: 'route',
        check: pruefung('he-nebelhorn-8-route', 'strasse', 6, ['karten', 'spuren']), effects: [herz(ID, 50), flag('nebelhorn_route')],
      },
      { text: '„Lies du. Ich bin da.“', next: 'er-liest', effects: [herz(ID, 60)] },
    ],
  }),
  knoten('geloest', [
    erz('Dampf aus dem Wasserkessel, ein Buttermesser, unendliche Geduld. Seite um Seite löst sich. Die Schrift ist verschwommen, aber lesbar. Die letzte Seite ist fast trocken geblieben, als hätte sie gewartet.'),
  ], { next: 'lesen' }),
  knoten('route', [
    ich('„NNO, zwei Tage gegen den Strom. Dann West bei den drei Wracks. Dann den Möwen nach.“ Käpt’n, das ist eine Route. Eine echte.'),
    N('Eine Route. Sie hat mir eine Route hinterlassen. Und ich hab vierzig Jahre lang ein Buch angestarrt, das mir den Weg zeigt.', 'ueberrascht'),
  ], { next: 'lesen' }),
  knoten('lesen', [
    ich('Die letzte Seite: „Tag drei. Land in Sicht. Es ist schön hier. Ich bleibe eine Weile. Wenn mein Junge das liest: Komm nach. Es ist nicht weit. Es ist nur weiter, als man denkt.“'),
    N('… Nur weiter, als man denkt.', 'besorgt'),
  ], { next: 'karte' }),
  knoten('er-liest', [
    erz('Nebelhorn liest. Leise, mit dem Finger unter der Zeile. Bei den verklebten Seiten rät er, bei der letzten bricht seine Stimme. Er liest sie trotzdem zu Ende.'),
    N('„Komm nach. Es ist nicht weit. Es ist nur weiter, als man denkt.“', 'trauer'),
    N('Sie ist angekommen. Sie ist nicht ertrunken. Sie ist ANGEKOMMEN. Und sie hat gewartet. Auf mich.', 'freude'),
  ], { next: 'karte' }),
  knoten('karte', [
    erz('Zwischen den letzten Seiten steckt ein vergilbtes Stück Seekarte, gefaltet, mit einem Bleistiftkreuz an einer Küste, die es auf keiner Quantum-Karte gibt.'),
  ], {
    choices: [
      { text: 'Marlas Kartenstück daneben legen.', tag: '[Küstenkarte]', when: { item: 'kuestenkarte-fragment' }, next: 'passt', effects: [flag('nebelhorn_karte_passt'), herz(ID, 20)] },
      { text: 'Mit ihm anstoßen.', next: 'ende' },
    ],
  }),
  knoten('passt', [
    erz('Die Kanten passen. Nicht perfekt, aber gut genug. Zwei Hälften eines Weges, die sich dreißig Jahre lang gesucht haben, auf einem Hausbootstisch neben zwei Gläsern Rum.'),
    N('Kleines. Das ist … das ist kein Zufall mehr. Das ist ein Kurs.', 'ueberrascht'),
  ], { next: 'ende' }),
  knoten('ende', [
    N('Ich fahr hin. Nicht heute. Aber bald. Wenn die Fähre wieder läuft und der Boss seinen Strandclub kriegt. Ich fahr nicht mehr im Kreis. Das schwör ich bei Großmutters Hut.', 'signatur'),
    erz('Ihr stoßt an. Draußen streift der Suchscheinwerfer das Boot, findet nichts Verdächtiges und zieht weiter. Er hat keine Ahnung.'),
  ], { effects: [flag('nebelhorn_logbuch'), { xp: 150 }] }),
]);

// ---------------------------------------------------------------------------------------------- Herz-Ereignis 10

/** ♥10 (Hafenkante, tags, act2 nach ♥8 und pers-nebelhorn-letzte-faehre): die Fahrt hinaus. */
const he10 = dialog('he-kaeptn-nebelhorn-10', [
  knoten('start', [
    erz('Die Fähre läuft. Frisch geflickt, frisch gestrichen, mit einem Kreidestrich am Bug: „NICHT IM KREIS“. Nebelhorn steht am Ruder, Mütze gerade, Pfeife kalt.'),
    N('Heute fahren wir raus. Nur bis hinter die Flutmauer. Nur einmal gucken. Großmutter hat drei Tage gebraucht. Wir brauchen zwanzig Minuten. Bis zum Gucken.', 'besorgt'),
    erz('An der Hafenausfahrt hängt eine Kette aus Bojen. Darauf: rote Quantum-Linsen. Ein Lautsprecher plärrt: „AUSFAHRT GESPERRT. BITTE KEHREN SIE LÄCHELND UM.“'),
  ], {
    choices: [
      {
        text: 'Das Ruder übernehmen und zwischen zwei Bojen durchziehen.', next: 'durch',
        check: pruefung('he-nebelhorn-10-ruder', 'reflexe', 6, ['fahren', 'flink']), effects: [herz(ID, 40)],
      },
      {
        text: 'Über Funk eine Ausnahmegenehmigung erfinden: „Fischereiforschung, Quantum-Auftrag 4-4-7.“', next: 'funk',
        check: pruefung('he-nebelhorn-10-funk', 'ausstrahlung', 5, ['luegen', 'ueberzeugen']), effects: [herz(ID, 40)],
      },
      { text: '„Käpt’n. Tut einfach.“', next: 'tuten', effects: [herz(ID, 50)] },
    ],
  }),
  knoten('durch', [erz('Du reißt das Ruder herum. Die Fähre legt sich schief, eine Boje schrammt am Rumpf entlang und verliert ihre Linse. Nebelhorn lacht so laut, dass er seine Pfeife verschluckt. Fast.')], { next: 'meer' }),
  knoten('funk', [erz('„Fischereiforschung bestätigt. Gute Fahrt. Bitte fangen Sie produktiv.“ Die Bojenkette senkt sich. Nebelhorn starrt dich an. „Du lügst wie meine Großmutter. Das ist ein Kompliment.“')], { next: 'meer' }),
  knoten('tuten', [
    N('Tuten. Einfach tuten. Kleines, du bist ein Genie.', 'freude'),
    erz('Nebelhorn zieht am Horn. Einunddreißig Jahre Kreisfahrt liegen in diesem Ton. Die Bojen vibrieren. Die Linsen springen. Eine Drohne fällt ins Wasser, eine zweite fliegt ihr freiwillig hinterher. Die Kette reißt.'),
  ], { next: 'meer' }),
  knoten('meer', [
    erz('Hinter der Flutmauer öffnet sich das Wasser, grau, dann grün, dann silbern bis zum Horizont. Der Wind schmeckt nach Salz und nach etwas, das du nicht kennst. Wahrscheinlich Freiheit. Vielleicht auch Diesel.'),
    N('Da ist es. Da ist es, Kleines. Das Meer.', 'besorgt'),
    erz('Er weint nicht. Er hat nur Salz im Auge. Sehr viel Salz.'),
    N('Hier. Nimm. Ein kleines Horn. Hab ich selbst gegossen. Wenn du es bläst, hört man es an jedem Hafen. Und dann weiß ich, dass du heimkommst.', 'freude'),
    N('TUUUUUUUUUUUUT! Klar Schiff! KLAR SCHIFF, VERDAMMT!'),
  ], {
    effects: [{ give: 'nebelhorn-mini' }, flag('nebelhorn_meer'), { xp: 200 }, herz(ID, 50)],
    choices: [
      { text: '„Grüß deine Großmutter, wenn du sie findest.“', next: 'gruss' },
      { text: '„Und jetzt? Zurück?“', next: 'zurueck' },
    ],
  }),
  knoten('gruss', [N('Sie ist längst weg, Kleines. Aber ihr Hut wartet bestimmt irgendwo am Strand. Mit einer Möwe drin. Fritzi dem Dritten.', 'freude')]),
  knoten('zurueck', [N('Zurück. Ja. Heute noch. Aber ab jetzt fahr ich nie wieder bloß im Kreis. Ab jetzt fahr ich Spiralen. Jedes Mal ein Stück weiter.', 'signatur')]),
]);

// ---------------------------------------------------------------------------------------------- Phasen und Fahrplan

export function akt23(M: Menue): { dialogues: DialogueDef[]; talk: TalkDef[]; schedule: ScheduleEntry[]; teil: ContentPart } {
  const p = phasen(ID, 'kaeptn-nebelhorn-23', M, [
    {
      id: 'master', when: MASTER, ohneMenue: true,
      gruss: [
        N('Kein Platz an Bord. Für dich nicht.', 'wut'),
        erz('Er tutet nicht. Zum ersten Mal, seit du ihn kennst, tutet er nicht. Die Fähre fährt wieder im Kreis. Langsamer als früher.'),
      ],
    },
    {
      id: 'ende-3b', when: ENDE_3B, einmal: true,
      gruss: [
        N('Kleines! Da bist du! Ich hab das Horn jeden Abend geblasen. Jeden! Damit du weißt, wo der Hafen ist. Und jetzt bist du heimgekommen. Siehst du? Hat funktioniert!', 'freude'),
        N('TUUUUUT! Das war für dich. Und das hier auch: TUUUUUT!'),
      ],
    },
    {
      id: 'ende-nexus', when: ENDE_NEXUS, einmal: true,
      gruss: [
        N('Die neue Stadt hat mir eine Fährlinie genehmigt. Hafen bis Küste, zweimal die Woche. Mit Fahrplan! Ich hatte noch nie einen Fahrplan. Ich halt ihn nicht ein, aber ich hab ihn.', 'freude'),
        N('Die KI hat gefragt, warum ich tute. Ich hab gesagt: damit man weiß, dass jemand da ist. Seitdem tutet die Stadt mittags zurück. Ganz leise. Durch die Lautsprecher am Bahnhof.'),
      ],
    },
    {
      id: 'ende-meer', when: ENDE_MEER, einmal: true,
      gruss: [
        N('Kleines! Ich hab am Strand angelegt! Ich wohn jetzt sonntags am Steg! Der Boss hat seinen Strandclub, ich hab meine Bar, und keiner von uns fährt mehr im Kreis!', 'freude'),
        N('Und weißt du, was ich gefunden hab? Einen Hut. Im Sand. Mit einer Möwe drin. Ich hab ihn Fritzi genannt. Den Hut, nicht die Möwe. Die heißt Großmutter.'),
      ],
    },
    {
      id: 'epilog', when: EPILOG_FREI, taeglich: true,
      gruss: [N('Moin, Kleines! Wind von achtern, Rum im Bauch, Fähre im Wasser. Mehr braucht ein alter Kapitän nicht. Ach doch: Gesellschaft. Setz dich.', 'freude')],
      plausch: [N('Hunter angelt jetzt jeden Sonntag mit mir. Er fängt nichts. Er will auch nichts fangen. Er will nur nicht reden. Wir reden trotzdem. Also ich.', 'signatur')],
    },
    {
      id: 'akt3', when: AKT3_NACHT, einmal: true, effects: [flag('nebelhorn_faehre_bereit')],
      gruss: [
        N('Heute Nacht, hm? Ich lass den Motor laufen. Die ganze Nacht. Wenn ihr rausmüsst, schnell und übers Wasser: Hafenkante, Steg, drei Mal tuten. Dann bin ich da.', 'besorgt'),
        N('Und wenn nicht … dann tut ich trotzdem. Für alle, die nicht heimkommen. Das macht man so. Aber du kommst heim. Kapiert?'),
      ],
    },
    {
      id: 'akt3-nach', when: AKT3_NACHT,
      gruss: [N('Motor läuft, Kleines. Drei Mal tuten. Geh jetzt.', 'besorgt')],
    },
    {
      id: 'party', when: PARTY_VORB, taeglich: true,
      gruss: [N('Eine Party im Turm! Mit Anzug und Schnittchen! Ich war mal auf einer Party mit Anzug. 2061. Ich bin in den Pool gefallen. Mit Absicht. Es war ein guter Abend.', 'freude')],
      plausch: [N('Wenn’s brenzlig wird da oben: Fenster auf, raus, runter. Wasser ist weich, wenn man richtig fällt. Und wenn man falsch fällt, ist es egal.', 'signatur')],
    },
    {
      id: 'gerettet', when: alle(COUNTDOWN_DONE, { notFlag: 'epilog' }), einmal: true,
      gruss: [N('Die Kleine mit den Fäusten ist wieder da! Ich hab’s gehört. Ich hab vor Freude getutet. Vierzehnmal. Die Hafenpolizei war da. Ich hab ihnen Rum gegeben.', 'freude')],
    },
    {
      id: 'nyra', when: NYRA_WEG, taeglich: true,
      gruss: [N('Wer zurückbleibt, für den lässt man das Licht an. Das ist Seemannsrecht. Ich hab eine Laterne an den Mast gehängt. Für das Mädchen. Sie brennt, bis sie zurück ist.', 'trauer')],
    },
    {
      id: 'chip', when: ARIA_GECHIPPT, taeglich: true,
      gruss: [N('Ich hab sie gesehen. Die Laute. Sie stand am Kai und hat aufs Wasser geguckt. Sie hat nicht geflucht. Sie hat nicht gespuckt. Sie hat gelächelt. Das Wasser hat sich geschämt.', 'trauer')],
      plausch: [N('Bring sie zurück, Kleines. Und dann bring sie mit an Bord. Ich zeig ihr, wie man richtig spuckt. Über die Reling. Mit Wind.', 'wut')],
    },
    {
      id: 'akt2', when: AKT2_NUR, taeglich: true,
      gruss: [N('Moin! Die halbe Stadt grinst wie bekifft und die andere Hälfte hat Angst. Und ich fahr im Kreis. Wenigstens einer, der weiß, wo er hinwill.', 'signatur')],
      plausch: [N('Gechippte fahren nicht Fähre. Die fahren nur noch geradeaus. Mit Ziel. Ohne Umweg. Wie langweilig muss das sein. Einunddreißig Jahre Kreis, und ich hab keine Sekunde bereut. Fast keine.', 'neutral')],
    },
  ]);

  const schedule: ScheduleEntry[] = [
    // act23.json „vorangestellt“ (auch als Platz in npc-oednis/folgen.ts).
    { slot: 'tag', days: ['so'], when: alle(EPILOG, { seen: 'he-kaeptn-nebelhorn-10' }), place: { map: 'das-meer', at: 'steg' } },
  ];

  return { dialogues: [...p.dialogues, he8, he10], talk: p.talk, schedule, teil: {} };
}
