// Opa Gustav (Schrotthändler mit Kran „Elsa“, Wohnwagen und Wachroboter Knurri, Schrottmarkt): NpcDef,
// Tagesgespräche, he-opa-gustav-2…10 (world.md §4.4). Kein Begleiter, keine Romanze.
// Werkbank: Die Karte schrottmarkt zeigt `gustavs-werkbank`, sobald he-opa-gustav-6 gesehen ist.
// pers-gustav-alte-liebe (Elsa im Aussiedlerhof, Akt 2) baut der Quest-Agent; he-opa-gustav-8 startet sie.
// Akt 2/3, Nachspiel, he-opa-gustav-8/10: opa-gustav-akt23.ts.
import type { DialogueChoice, NpcDef } from '../../../modules/contracts';
import type { ContentPart } from '../../part';
import { L, N, OEDNIS, SCHROTT, chk, dialogs, dlg, herz, node, zeitHinweis, zeitHinweisWann } from './_dsl';
import { GUSTAV_HE_23, GUSTAV_SCHEDULE_23, GUSTAV_TALK_FRUEH, GUSTAV_TALK_POOL } from './opa-gustav-akt23';

const G = 'opa-gustav';

const handel: DialogueChoice = { text: '„Was hast du heute im Angebot?“', when: { time: ['morgen', 'tag'] }, effects: [{ shop: 'gustavs-schrottkram' }] };

const npc: NpcDef = {
  id: G,
  name: 'Opa Gustav',
  unknownName: 'Alter Mann am Kran',
  portrait: 'opa-gustav',
  sprite: 'opa-gustav-walk',
  faction: 'unterstadt',
  bio: 'Alter Schrotthändler mit Kran („Elsa“) und Wohnwagen am Schrottmarkt, Wachroboter Knurri. Seine Frau Elsa ging vor zwanzig Jahren zu den Aussiedlern.',
  gifts: {
    loves: ['rostige-schraube', 'alte-euromuenze', 'oelkaennchen'],
    likes: ['glitzerschrott', 'vinyl-platte', 'quietsche-mutter', 'synth-kaffee', 'echtobst-apfel', 'hofhonig'],
    dislikes: ['seltenes-implantat', 'datenkristall'],
    hates: ['plastikpflanze', 'virus-implantat'],
  },
  schedule: [
    ...GUSTAV_SCHEDULE_23,
    { slot: 'tag', days: ['so'], place: { map: 'schrottmarkt', at: 'flohmarkt' } },
    { slot: 'morgen', place: { map: 'schrottmarkt', at: 'kran' } },
    { slot: 'tag', place: { map: 'schrottmarkt', at: 'schrottkram-stand' } },
    { slot: 'abend', days: ['fr'], place: { map: 'high-voltage', at: 'oldie-ecke' } },
    { slot: 'abend', place: { map: 'schrottmarkt', at: 'wohnwagen' } },
    { place: 'away' },
  ],
  heartEvents: [
    { id: 'he-opa-gustav-2', hearts: 2, map: 'schrottmarkt', time: 'morgen', dialogue: 'dlg-he-opa-gustav-2', effects: [{ xp: 25 }] },
    {
      id: 'he-opa-gustav-4', hearts: 4, map: 'schrottmarkt', time: 'abend', when: { not: { weekday: 'fr' } },
      dialogue: 'dlg-he-opa-gustav-4', effects: [{ xp: 35 }, { give: 'kuestenkarte-fragment' }],
    },
    {
      id: 'he-opa-gustav-6', hearts: 6, map: 'schrottmarkt', time: 'tag', when: { not: { weekday: 'so' } },
      dialogue: 'dlg-he-opa-gustav-6', effects: [{ xp: 45 }, { setFlag: 'gustav_werkbank' }],
    },
    ...GUSTAV_HE_23,
    { id: 're-opa-gustav-2', hearts: -2, map: 'schrottmarkt', time: ['morgen', 'tag'], dialogue: 'dlg-re-opa-gustav-2' },
  ],
  talk: [
    { dialogue: 'opa-gustav-knurri', when: { rival: G } },
    { dialogue: 'opa-gustav-zeit', minHearts: 8, when: zeitHinweisWann('opa-gustav-zeit') },
    ...GUSTAV_TALK_FRUEH,
    { dialogue: 'opa-gustav-elsa', when: { quest: 'pers-gustav-alte-liebe', state: 'active' } },
    { dialogue: 'opa-gustav-flohmarkt', when: { all: [{ weekday: 'so' }, { time: 'tag' }] } },
    { dialogue: 'opa-gustav-oldies', when: { all: [{ weekday: 'fr' }, { time: 'abend' }] } },
    { dialogue: 'opa-gustav-morgen', when: { time: 'morgen' } },
    { dialogue: 'opa-gustav-radio', when: { time: 'abend' } },
    ...GUSTAV_TALK_POOL,
    { dialogue: 'opa-gustav-tag-6', minHearts: 6 },
    { dialogue: 'opa-gustav-tag-2', minHearts: 2 },
    { dialogue: 'opa-gustav-tag-0' },
  ],
};

const dialogues = dialogs(
  // ------------------------------------------------------------------------------------------- Tagesgespräche
  dlg('opa-gustav-tag-0', [
    node('a', [
      N('Gustavs Stand: Kisten voller Schrauben, Kabel, Zahnräder und Dinge, deren Namen niemand mehr weiß. Daneben liegt Knurri, ein Wachroboter in Form eines sehr dicken, sehr rostigen Hundes, und knurrt im Schlaf.'),
      L(G, 'Na? Gucken ist umsonst. Anfassen kostet. Fragen kostet doppelt. Und Knurri wecken kostet dich die Hose.', 'signatur'),
    ], {
      choices: [
        handel,
        { text: '„Du bist doch Gustav, oder?“', next: 'wer' },
        { text: '[Schrott] „Gustav. Ich bin’s. Vom alten Platz.“', tag: '[Schrott]', when: SCHROTT, next: 'schrott', once: true, id: 'schrott' },
        { text: '„Nur gucken.“' },
      ],
    }),
    node('wer', [
      L(G, 'Gustav, Schrott, seit 2054. Früher war hier alles grün. Jetzt ist hier alles meins. Ist auch eine Entwicklung.'),
      L(G, 'Wenn du was suchst, frag. Wenn ich’s nicht hab, gibt’s das nicht. Wenn’s das nicht gibt, bau ich’s dir. Dauert halt.'),
    ]),
    node('schrott', [
      L(G, 'Vom alten Platz? …Du bist doch das Gör vom alten Platz! Das immer die Kupferspulen aus meinen Kisten geklaut hat!', 'ueberrascht'),
      L(G, 'Ha! Guck dich an! Groß geworden und immer noch dreckige Finger. Komm her, lass dich drücken. Nein, lass es, du riechst nach Hafen. Doch, komm her.', 'freude'),
    ], { effects: [herz(G, 20)] }),
  ]),

  dlg('opa-gustav-tag-2', [
    node('a', [
      L(G, 'Ah, Kundschaft mit Gesicht. Die mag ich. Kundschaft ohne Gesicht kommt aus der Oberstadt und hat nur Brieftasche.'),
      N('Knurri öffnet ein Auge, erkennt dich und schließt es wieder. Das ist bei Knurri die höchste Form von Zuneigung.'),
    ], {
      choices: [
        handel,
        { text: '„Erzähl mir von früher.“', next: 'frueher' },
        { text: '„Was ist mit Knurri los?“', next: 'knurri' },
      ],
    }),
    node('frueher', [
      L(G, 'Früher war hier alles grün. Da, wo jetzt Rippers Praxis steht, war ein Teich. Mit Enten. Echten Enten, mit Federn und Meinung.', 'freude'),
      L(G, 'Und dann kam Quantum und hat gesagt: „Enten sind ineffizient.“ Jetzt gibt’s Drohnen, die quaken. Für Kinder. Gegen Gebühr.'),
    ]),
    node('knurri', [
      L(G, 'Knurri ist ein Sicherheitsroboter. Modell „Wachhund“, Baujahr 2061. Er bewacht meinen Stand, meinen Wohnwagen und meine Würde. Mit der Würde ist er überfordert.', 'signatur'),
      L(G, 'Er knurrt jeden an, den er nicht kennt. Und jeden, den er kennt, aber nicht mag. Also fast alle. Babette nicht. Babette gibt ihm Öl.'),
    ]),
  ]),

  dlg('opa-gustav-tag-6', [
    node('a', [
      L(G, 'Na, mein Lieblingsmensch unter sechzig! Die Werkbank ist frei. Werkzeug zurück an den Haken, sonst kommt Knurri und frisst dir die Schnürsenkel.', 'freude'),
    ], {
      choices: [
        handel,
        { text: '„Hast du ein Lied für mich?“', next: 'lied' },
        { text: '„Bis später, Gustav.“' },
      ],
    }),
    node('lied', [
      N('Gustav räuspert sich, schließt die Augen und singt mit einer Stimme wie ein rostiges Scharnier, das verliebt ist.'),
      L(G, '„Mein Herz ist ein Getriebe, das stottert, wenn du gehst …“ – 2031, Platz eins, sieben Wochen lang. Elsa hat es gehasst. Sie hat jedes Mal mitgesungen.', 'trauer'),
    ]),
  ]),

  dlg('opa-gustav-morgen', [
    node('a', [
      N('Oben in der Kabine des Krans sitzt Gustav mit einer Thermoskanne. Der Kran heißt Elsa, steht in verblassten Buchstaben auf dem Ausleger.'),
      L(G, 'Morgen! Komm nicht hoch, Elsa mag am Morgen keinen Besuch. Elsa ist wie ich, die muss erst warm werden.', 'signatur'),
    ], {
      choices: [
        { text: '„Warum heißt der Kran Elsa?“', next: 'elsa' },
        { text: '„Kaffee?“', requires: { credits: 2 }, effects: [{ credits: -2 }, { heal: 5 }, herz(G, 5)], next: 'kaffee' },
        { text: '„Schönen Morgen, Gustav.“' },
      ],
    }),
    node('elsa', [
      L(G, 'Weil er sich nie bewegt, wenn ich es will, und immer, wenn ich nicht damit rechne. Und weil er quietscht, wenn ich ihn anfasse.', 'freude'),
      L(G, 'Meine Frau hieß Elsa. Heißt. Sie lebt noch, irgendwo draußen bei den Aussiedlern. Sie ist gegangen, ich bin geblieben. Der Kran ist geblieben. Lange Geschichte. Zwanzig Jahre lang.', 'trauer'),
    ]),
    node('kaffee', [L(G, 'Zwei Credits für die Kanne? Du bist ein Engel. Ein dummer Engel, der Kaffee ist von gestern. Aber ein Engel.', 'freude')]),
  ]),

  dlg('opa-gustav-radio', [
    node('a', [
      N('Vor dem Wohnwagen sitzt Gustav auf seinem Klappstuhl mit der Kuhle. Das Kofferradio spielt einen Schlager, in dem sich „Herz“ auf „Schmerz“ reimt. Knurri liegt zu seinen Füßen und schnarcht im Takt.'),
      L(G, 'Setz dich. Da ist eine Kiste. Die Kiste ist bequemer, als sie aussieht. Das sag ich mir seit zwanzig Jahren.'),
    ], {
      choices: [
        { text: '(Hinsetzen und ein Lied lang zuhören.)', effects: [herz(G, 10), { advanceTime: 10 }], next: 'hoeren' },
        { text: '„Was hörst du da?“', next: 'was' },
        { text: '„Ich muss weiter.“' },
      ],
    }),
    node('hoeren', [
      N('Ihr hört zu. Ein Saxofon jault, eine Frau singt von einem Mann, der nie zurückkam. Gustav bewegt die Lippen mit und tut so, als würde er nicht.'),
      L(G, 'Die neuen Lieder haben keine Melodie mehr. Die haben nur Beat und Werbung. Das hier, das hat Geschichte. Das hat Staub. Staub ist wichtig.', 'trauer'),
    ]),
    node('was', [
      L(G, 'Radio Rost. Sendet von irgendwo da draußen in der Ödnis. Der Moderator ist älter als ich. Ich glaub, er ist tot und sendet trotzdem. Respekt.', 'signatur'),
    ]),
  ]),

  dlg('opa-gustav-oldies', [
    node('a', [
      N('Freitagabend im High Voltage. In der Oldie-Ecke steht Gustav hinter einem Plattenspieler, der aussieht, als hätte er den Krieg gewonnen. Ein paar Leute in Glitzer tanzen. Unbeholfen. Glücklich.'),
      L(G, 'Gustavs Oldie-Stunde! Musik, die älter ist als eure Implantate! Wer jetzt tanzt, kriegt nächste Woche Rabatt auf Schrauben!', 'freude'),
    ], {
      choices: [
        { text: '(Tanzen. Schlecht. Mit Hingabe.)', effects: [herz(G, 10), { advanceTime: 15 }], next: 'tanzen' },
        { text: '„Spiel was für mich.“', next: 'wunsch' },
        { text: '(Zuhören.)' },
      ],
    }),
    node('tanzen', [L(G, 'Ha! Du tanzt wie ein Kran bei Seitenwind! Genau so muss das! Früher hat die ganze Stadt so getanzt!', 'freude')]),
    node('wunsch', [L(G, 'Ein Wunsch? Für dich? Klar. „Rostrot ist die Liebe“, 2029. Das ist ein Lied für Leute, die nichts haben außer einem guten Herz und einem schlechten Rücken.', 'signatur')]),
  ]),

  dlg('opa-gustav-flohmarkt', [
    node('a', [
      N('Sonntag. Gustavs Flohmarktstand steht direkt neben dem von Oma Volt. So direkt, dass sich die Planen berühren. Die beiden reden nicht miteinander. Sehr laut.'),
      L(G, 'Die Frau sortiert ihre Knöpfe nach Durchmesser. NACH DURCHMESSER! Wer macht so was?', 'signatur'),
      N('Von nebenan, ohne hinzusehen: „Jemand, der nicht in einem Wohnwagen voller Kabelsalat lebt, Gustav!“'),
    ], {
      choices: [
        handel,
        { text: '„Ihr zwei solltet mal einen Kaffee trinken gehen.“', next: 'kaffee' },
        { text: '(Grinsen und weitergehen.)' },
      ],
    }),
    node('kaffee', [
      L(G, 'Kaffee? Mit der? Die würde mir erklären, wie man Kaffee richtig trinkt. Mit Durchmesser.', 'freude'),
      L(G, '…Vielleicht. Nächsten Sonntag. Sag’s ihr nicht. Sie soll von allein draufkommen.'),
    ]),
  ]),

  dlg('opa-gustav-elsa', [
    node('a', [
      L(G, 'Hast du was von ihr gehört? Von Elsa? Ich hab einen Brief geschrieben. Siebzehn Seiten. Fünfzehn davon sind durchgestrichen. Auf den letzten zwei steht „Hallo“.', 'trauer'),
    ], {
      choices: [
        { text: '„Ich bring ihn ihr.“', next: 'bringen' },
        { text: '„Schreib noch was dazu. Was Ehrliches.“', next: 'ehrlich' },
      ],
    }),
    node('bringen', [L(G, 'Danke. Und wenn sie lacht, sag ihr, ich hab’s ernst gemeint. Und wenn sie weint, sag ihr, ich hab’s nicht so gemeint. Und wenn sie nichts sagt … sag mir’s nicht.', 'trauer')]),
    node('ehrlich', [L(G, 'Ehrlich? Ich bin zweiundachtzig. Ehrlich ist das Einzige, was ich noch hab. Na gut. Ich schreib: „Der Kran heißt immer noch wie du.“', 'signatur')]),
  ]),

  dlg('opa-gustav-knurri', [
    node('a', [
      N('Knurri steht vor Gustavs Stand und knurrt. Nicht im Schlaf. Wach. Mit Absicht. Seine Augen leuchten rot.'),
      L(G, 'Knurri mag dich nicht mehr. Und Knurri irrt sich nie. Fast nie. Einmal bei einem Briefträger. Den hat er trotzdem gebissen.', 'signatur'),
    ], {
      choices: [
        {
          text: '(Knurri ein Ölkännchen hinstellen.) „Für dich. Und für dich, Gustav: Es tut mir leid.“',
          requires: { item: 'oelkaennchen' },
          effects: [{ take: 'oelkaennchen' }, { reconcile: G }],
          next: 'frieden',
        },
        { text: '„Gustav, ich hab’s verbockt.“', next: 'sorry' },
        { text: '(Gehen. Langsam. Ohne Knurri den Rücken zuzudrehen.)' },
      ],
    }),
    node('sorry', [L(G, 'Ja. Hast du. Knurri ist nachtragend, und ich bin alt. Wir haben beide Zeit. Und Knurri mag Öl.')]),
    node('frieden', [
      N('Knurri schnuppert. Knurri leckt. Knurri legt sich hin und schnurrt, was bei einem Hund aus Blech wie ein Rasenmäher klingt.'),
      L(G, 'Na also. Wenn Knurri dir verzeiht, muss ich wohl auch. Aber ich bin nicht so billig. Ich bin nur halb so billig.', 'freude'),
    ]),
  ]),

  zeitHinweis('opa-gustav-zeit', [
    L(G, 'Weißt du, du erinnerst mich an Elsa. Nicht im Gesicht, Gott bewahre. Aber du kommst immer wieder. Das hat sie auch gemacht. Bis sie’s nicht mehr gemacht hat.', 'trauer'),
  ]),

  // ------------------------------------------------------------------------------------------- Herz-Ereignisse
  dlg('dlg-he-opa-gustav-2', [
    node('a', [
      N('Morgens am Kran. Gustav lehnt aus der Kabine und winkt mit der Thermoskanne.'),
      L(G, 'He! Du! Komm hoch! Elsa hat heute gute Laune. Das kommt alle drei Wochen vor. Wenn’s regnet, alle vier.', 'freude'),
      N('Die Leiter ist rostig, die Kabine eng, der Sitz mit einem alten Kissen gepolstert, auf dem „Opa ist der Beste“ steht. Gustav legt einen Hebel um. Elsa ächzt, hebt den Ausleger und dreht sich. Langsam. Majestätisch. Quietschend.'),
      L(G, 'Guck. Da unten. Das ist die Unterstadt. Von hier oben sieht sie fast aus wie früher.'),
    ], {
      choices: [
        { text: '„Wie war es früher?“', next: 'frueher' },
        { text: '„Was glitzert da drüben auf den Dächern?“', next: 'glitzer' },
        { text: '(Den roten Knopf drücken.)', next: 'knopf' },
      ],
    }),
    node('frueher', [
      L(G, 'Grün. Alles grün. Da, wo der Markt ist, war Wiese. Da, wo der Hafen ist, war Strand. Und da, wo der Quantum-Tower steht, war gar nichts. Das war das Schönste.', 'trauer'),
      L(G, 'Elsa und ich haben da unten geheiratet. Unter einer Linde. Die Linde ist jetzt ein Parkhaus.'),
    ], { effects: [herz(G, 30)], next: 'glitzer' }),
    node('knopf', [
      N('Eine Hupe. Sehr laut. Sehr lang. Unten auf dem Markt lassen drei Leute ihre Einkäufe fallen. Babette wirft einen Bambuskorb nach dem Kran. Sie trifft.'),
      L(G, 'HA! Das hab ich seit Silvester nicht mehr gemacht! Noch mal! Nein. Nicht noch mal. Babette hat noch mehr Körbe.', 'freude'),
    ], { effects: [herz(G, 25)], next: 'glitzer' }),
    node('glitzer', [
      L(G, 'Von hier oben sieht man alles, was die Leute verlieren. Münzen in den Rinnen, Platten auf den Dächern, kleine Sterne an den Masten. Siehst du? Da. Und da. Und da hinten.', 'signatur'),
      N('Gustav zeigt dir mit seinem knotigen Finger jede Ecke der Unterstadt. Wo etwas glänzt, wo etwas liegt, wo sich ein Weg lohnt. Du prägst dir alles ein. Für heute weißt du, wo in der Unterstadt Schätze liegen.'),
      L(G, 'Morgen ist das alles weg. Oder woanders. Die Unterstadt ist wie ein Fluss, Kind. Sie hält nichts fest. Außer mich.'),
    ], {
      choices: [
        { text: '„Danke, Gustav. Das war der beste Ausblick der Stadt.“', effects: [herz(G, 10)], next: 'ende' },
        { text: '[Schrott] „Wie damals. Du hast mich auch früher mitgenommen.“', tag: '[Schrott]', when: SCHROTT, effects: [herz(G, 20)], next: 'damals' },
      ],
    }),
    node('damals', [L(G, 'Hab ich. Und du hast in die Kabine gekotzt. Elsa hat’s dir verziehen. Ich nicht.', 'freude')], { next: 'ende' }),
    node('ende', [
      L(G, 'Komm wieder, wenn Elsa gute Laune hat. Und jetzt runter mit dir, ich muss arbeiten. Also: Kaffee trinken und über die Jugend schimpfen.', 'signatur'),
    ], { effects: [{ setFlag: 'gustav_kranblick' }, { markSeen: 'gustav-kranblick' }, { message: 'Gustavs Kranblick: Für heute kennst du die Fundorte der Unterstadt.' }] }),
  ]),

  dlg('dlg-he-opa-gustav-4', [
    node('a', [
      N('Abends vor dem Wohnwagen. Das Radio spielt leise, Knurri schnarcht, und Gustav hat eine Schuhschachtel auf den Knien. Darin: Fotos. Echte Fotos, auf Papier, mit Knicken und Fingerabdrücken.'),
      L(G, 'Setz dich. Ich zeig dir was. Das hab ich noch keinem gezeigt. Außer Knurri, und der hat draufgesabbert.', 'neutral'),
      N('Das erste Foto: eine Wiese mit Löwenzahn. Im Hintergrund, ganz klein, die ersten Türme. Das zweite: ein Strand. Ein echter Strand mit Sand und Wasser, das blau ist. Blau!'),
      L(G, 'Noxius, 2048. Da hinten, wo jetzt die Hafenkante ist. Wir sind am Wochenende mit dem Rad hingefahren. Elsa ist immer zuerst ins Wasser. Ich nie. Ich hab auf die Räder aufgepasst.', 'trauer'),
    ], {
      choices: [
        { text: '„Das Wasser ist … blau.“', next: 'blau' },
        { text: '„Wer ist die Frau auf dem Foto?“', next: 'elsa' },
        { text: '[Ödnis] „Die Küstenlinie. Die kenn ich. Von den alten Karten draußen.“', tag: '[Ödnis]', when: OEDNIS, next: 'oednis' },
      ],
    }),
    node('blau', [
      L(G, 'War es. Ist es vielleicht noch. Irgendwo da draußen, hinter der Ödnis, hinter dem Sand. Die Aussiedler sagen, wenn man lang genug fährt, kommt das Meer. Das echte.', 'ueberrascht'),
    ], { effects: [herz(G, 25)], next: 'karte' }),
    node('elsa', [
      L(G, 'Das ist Elsa. Mit dem Strohhut. Den hat sie auf dem Flohmarkt für zwei Euro gekauft. Euro, Kind. Damals gab’s noch Euro.', 'trauer'),
      L(G, 'Sie wollte raus. Ich wollte bleiben. Sie hat gesagt: „Gustav, die Stadt frisst uns.“ Ich hab gesagt: „Die Stadt ist alles, was wir haben.“ Wir hatten beide recht. Das ist das Schlimmste.'),
    ], { effects: [herz(G, 35)], next: 'karte' }),
    node('oednis', [
      L(G, 'Du kommst von da draußen? Dann weißt du ja, wovon ich rede. Dann hast du vielleicht … nein. Nein. Hast du sie gesehen? Eine alte Frau, die Sachen repariert? Mit einem Strohhut?', 'ueberrascht'),
      N('Du schüttelst den Kopf. Gustav nickt, als hätte er nichts anderes erwartet.'),
      L(G, 'Na ja. Die Ödnis ist groß. Und Strohhüte halten nicht ewig.', 'trauer'),
    ], { effects: [herz(G, 40)], next: 'karte' }),
    node('karte', [
      N('Ganz unten in der Schachtel liegt ein Stück Papier. Eine Seekarte, abgerissen, mit Küstenlinie, Bojen und einer handschriftlichen Notiz.'),
      L(G, 'Das hat Elsa dagelassen. Ein Stück von ihrer Karte. Sie hat gesagt, wenn ich es mir anders überlege, soll ich die anderen Stücke suchen und nachkommen.', 'trauer'),
      L(G, 'Ich hab’s mir nie anders überlegt. Ich hab nur zwanzig Jahre lang draufgeguckt.'),
      L(G, 'Nimm du es. Du bist jung. Du hast Beine, die noch wollen. Wenn du irgendwann die anderen Stücke findest … dann guck dir das Meer an. Für mich. Und wenn du Elsa siehst, sag ihr, der Kran heißt immer noch so.', 'signatur'),
    ], {
      choices: [
        { text: '„Ich such die anderen Stücke. Versprochen.“', effects: [herz(G, 10)], next: 'ende' },
        { text: '„Komm doch mit, Gustav.“', next: 'mit' },
      ],
    }),
    node('mit', [L(G, 'Ich? In die Ödnis? Mit meinem Rücken? Kind, ich komm ja nicht mal mehr ohne Kran aus dem Stuhl. …Frag mich nochmal. Später. Wenn ich mutiger bin. Oder dümmer.', 'freude')], { effects: [herz(G, 15)], next: 'ende' }),
    node('ende', [N('Gustav klappt die Schachtel zu. Das Radio spielt weiter. Ihr sitzt noch eine Weile da und sagt nichts. Es ist ein gutes Nichts.')]),
  ]),

  dlg('dlg-he-opa-gustav-6', [
    node('a', [
      N('Mittags an Gustavs Stand. Unter der Markise hat er eine alte Werkbank aufgebaut, Schraubstock, Haken für Werkzeug, eine Lampe mit Krokodilklemme. Daneben ein Radio. Kaputt.'),
      L(G, 'Das ist meine alte Werkbank. Da hab ich in vierzig Jahren alles repariert, was in der Unterstadt kaputt war. Außer meiner Ehe.', 'signatur'),
      L(G, 'Ich werd langsam zu alt, um daran zu stehen. Meine Finger zittern. Also, zittern sie nicht, aber sie denken drüber nach.'),
      L(G, 'Wer die Werkbank will, muss eine Prüfung machen. Hier. Das Radio. Mach es heil. Oder zeig mir, dass du’s verdienst.'),
    ], {
      choices: [
        {
          text: '(Das Radio aufschrauben, den gerissenen Draht finden, nachlöten.)',
          check: chk('he-opa-gustav-6-radio', 'technik', 5, ['reparieren']),
          next: 'heil',
        },
        { text: '[Schrott] (Dem Radio da einen Klaps geben, wo Gustav es früher immer gemacht hat.)', tag: '[Schrott]', when: SCHROTT, next: 'klaps' },
        { text: '(Die große Kiste mit unsortierten Schrauben sortieren. Alle.)', next: 'sortieren' },
        { text: '„Ich kann das nicht. Zeig’s mir.“', next: 'zeigen' },
      ],
    }),
    node('heil', [
      N('Zwanzig Minuten, ein angekokelter Finger. Dann knackt es, und aus dem Radio kommt ein Schlager von 2031. Gustav schließt die Augen.'),
      L(G, 'Das ist das Radio, das Elsa mir zur Hochzeit geschenkt hat. Ich hab es seit zehn Jahren nicht mehr gehört. Ich hab mich nicht getraut, es selbst zu reparieren. Falls ich’s kaputt mache.', 'trauer'),
    ], { effects: [herz(G, 50), { advanceTime: 20 }], next: 'werkbank' }),
    node('klaps', [
      N('Ein Klaps, oben links, mit der flachen Hand. Das Radio hustet, knackt und spielt. Gustav starrt dich an.'),
      L(G, 'Das hast du dir gemerkt? Seit damals? Du Rotzlöffel. Du wunderbarer Rotzlöffel.', 'ueberrascht'),
    ], { effects: [herz(G, 55)], next: 'werkbank' }),
    node('sortieren', [
      N('Zwei Stunden. Sechshundert Schrauben. Kreuz, Schlitz, Torx, Sechskant und eine Sorte, für die es keinen Namen gibt. Knurri schaut die ganze Zeit zu und knurrt, wenn du eine falsch einordnest.'),
      L(G, 'Wer Schrauben sortieren kann, kann alles. Das ist kein Spruch, das ist Physik. Geduld ist das beste Werkzeug. Das zweitbeste ist ein Hammer.', 'freude'),
    ], { effects: [herz(G, 45), { advanceTime: 120 }], next: 'werkbank' }),
    node('zeigen', [
      L(G, 'Ha! Ehrlichkeit. Das ist auch eine Prüfung. Die meisten bestehen sie nicht.', 'freude'),
      N('Gustav zeigt es dir. Langsam. Jeden Handgriff zweimal. Er erklärt den Draht, das Lot, den Klaps. Am Ende hältst du den Lötkolben, und seine Hand liegt auf deiner, ganz leicht, wie früher bei jemandem, der das gelernt hat.'),
      N('Das Radio spielt. Ein Schlager von 2031.'),
      L(G, 'Siehste. War doch nicht schwer. War doch nur vierzig Jahre Übung, im Schnelldurchlauf.', 'signatur'),
    ], { effects: [herz(G, 45), { advanceTime: 45 }], next: 'werkbank' }),
    node('werkbank', [
      L(G, 'Die Werkbank gehört ab jetzt dir. Also, sie gehört mir, aber du darfst dran. Wann du willst. Werkzeug zurück an den Haken. Sonst Hausverbot. Auch für die Seele.', 'freude'),
      L(G, 'Und wenn Jakko kommt und was bauen will, hilfst du ihm. Der Junge hat Hände wie ich früher. Nur sauberer.'),
      N('Gustavs Werkbank ist freigeschaltet: Aus Schrott-Ersatzteilen werden Reparatursets und andere nützliche Dinge.'),
    ]),
  ]),

  // he-opa-gustav-8 und he-opa-gustav-10: opa-gustav-akt23.ts

  dlg('dlg-re-opa-gustav-2', [
    node('a', [
      N('Als du am Schrottmarkt vorbeikommst, steht Knurri mitten im Weg. Er knurrt. Er bewegt sich nicht. Hinter ihm sitzt Gustav und liest demonstrativ Zeitung. Verkehrt herum.'),
    ]),
  ]),
);

export const part: ContentPart = {
  npcs: { [G]: npc },
  dialogues,
};
