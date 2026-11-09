// Opa Gustav in Akt 2, Akt 3 und im Nachspiel (world.md §4.4, §5.3–5.5, §6.5; act23.json npcSchedules/events).
// Volle Herz-Ereignisse he-opa-gustav-8 (Oldie-Stunde, Tanz mit Babette, Start pers-gustav-alte-liebe) und
// he-opa-gustav-10 (Schrottkrone, mit und ohne Elsa), Tagesgespräche nach Phase (Knurri frisst Drohnen), Abende bei Elsa.
// Tagesablauf: Sonntagabend bei Elsa und Samstag an der Offenen Werkstatt stellt npc-oednis/folgen.ts als feste
// Platzierung auf; hier steht er dann auf 'away', damit es ihn nicht doppelt gibt.
import type { Condition, DialogueChoice, HeartEventDef, ScheduleEntry, TalkDef } from '../../../modules/contracts';
import type { ContentPart } from '../../part';
import {
  A2_CHAOS, A2_FREI, A2_OFFEN, A2_PARTY, ARIA_GECHIPPT, ENDE_3B, ENDE_MEER, ENDE_NEXUS, HERZ_SPAET, L, MASTER, N,
  NACHSPIEL, OEDNIS, PARTYNACHT, SCHROTT, chk, dialogs, dlg, einmal, herz, node,
} from './_dsl';

const G = 'opa-gustav';
const LIEBE_AKTIV = { quest: 'pers-gustav-alte-liebe', state: 'active' } as const;
const LIEBE_FERTIG = { quest: 'pers-gustav-alte-liebe', state: 'done' } as const;
const WERKSTATT_FERTIG = { quest: 'side-offene-werkstatt', state: 'done' } as const;
const GUSTAV_MEER: Condition = { all: [NACHSPIEL, { flag: 'gustav_meer_dabei' }] };

const handel: DialogueChoice = { text: '„Was hast du heute im Angebot?“', when: { time: ['morgen', 'tag'] }, effects: [{ shop: 'gustavs-schrottkram' }] };

export const GUSTAV_HE_23: HeartEventDef[] = [
  {
    id: 'he-opa-gustav-8', hearts: 8, map: 'high-voltage', time: 'abend', when: { all: [HERZ_SPAET, { weekday: 'fr' }] },
    dialogue: 'dlg-he-opa-gustav-8', effects: [{ xp: 60 }],
  },
  {
    id: 'he-opa-gustav-10', hearts: 10, map: 'schrottmarkt', time: 'abend', when: { all: [HERZ_SPAET, { not: { weekday: 'fr' } }] },
    dialogue: 'dlg-he-opa-gustav-10', effects: [{ xp: 80 }, { give: 'schrottkrone' }],
  },
];

export const GUSTAV_TALK_FRUEH: TalkDef[] = [
  { dialogue: 'opa-gustav-master', when: MASTER },
  { dialogue: 'opa-gustav-3b', when: einmal('opa-gustav-3b', ENDE_3B) },
  { dialogue: 'opa-gustav-bei-elsa', when: { all: [LIEBE_FERTIG, { weekday: 'so' }, { time: 'abend' }] } },
  { dialogue: 'opa-gustav-nachspiel', when: einmal('opa-gustav-nachspiel', NACHSPIEL) },
  { dialogue: 'opa-gustav-meer', when: { all: [GUSTAV_MEER, { weekday: 'sa' }, { time: 'tag' }, { not: WERKSTATT_FERTIG }] } },
  { dialogue: 'opa-gustav-partynacht', when: PARTYNACHT },
  { dialogue: 'opa-gustav-a2-bruch', when: einmal('opa-gustav-a2-bruch', A2_CHAOS) },
  { dialogue: 'opa-gustav-a2-aria', when: einmal('opa-gustav-a2-aria', { all: [A2_FREI, ARIA_GECHIPPT] }) },
  { dialogue: 'opa-gustav-a2-party', when: einmal('opa-gustav-a2-party', A2_PARTY) },
];

export const GUSTAV_TALK_POOL: TalkDef[] = [
  { dialogue: 'opa-gustav-a2-tag', when: A2_OFFEN },
  { dialogue: 'opa-gustav-a2-nervoes', when: A2_PARTY },
  { dialogue: 'opa-gustav-nachspiel-tag', when: NACHSPIEL },
];

export const GUSTAV_SCHEDULE_23: ScheduleEntry[] = [
  // act23.json „vorangestellt“: die Orte selbst setzt npc-oednis/folgen.ts (mapAdditions.npcs).
  { slot: 'abend', days: ['so'], when: LIEBE_FERTIG, place: 'away' },
  { slot: 'tag', days: ['sa'], when: WERKSTATT_FERTIG, place: 'away' },
  { slot: 'tag', days: ['sa'], when: GUSTAV_MEER, place: { map: 'das-meer', at: 'steg' } },
];

const dialogues = dialogs(
  // ------------------------------------------------------------------------------------------- Herz-Ereignis 8
  dlg('dlg-he-opa-gustav-8', [
    node('a', [
      N('Freitagabend, Oldie-Stunde im High Voltage. Weniger Leute als sonst. Zwei Gäste an der Bar tanzen steif und vorsichtig, als hätten sie vergessen, wie das geht, und müssten es neu lernen.'),
      L(G, 'Früher war die Oldie-Stunde voll. Früher war hier alles … ach, lassen wir das. Heute tanzen die Leute wie Scheibenwischer.', 'trauer'),
      N('Er zieht eine Platte aus der Hülle, die er sonst nie spielt. Die Hülle ist weich vom Anfassen. Akkordeon und Geige, steht drauf, und eine Jahreszahl: 2034.'),
      L(G, '„Der letzte Zug nach Grün“. Elsas und mein Lied. Ich hab’s zwanzig Jahre nicht aufgelegt.'),
      N('Die Nadel senkt sich. Es knackt. Drei Takte Geige. Dann springt die Platte. Immer wieder dieselbe halbe Sekunde, wie ein Herz, das hängen bleibt.'),
      L(G, 'Natürlich. Natürlich springt sie. Das ist Schicksal. Oder Staub. Bei mir ist das dasselbe.', 'wut'),
    ], {
      choices: [
        {
          text: '(Den Tonarm beschweren.) „Eine Münze auf den Kopf, ein Haar Gegengewicht. Hat mein Onkel immer so gemacht.“',
          check: chk('he-opa-gustav-8-platte', 'technik', 4, ['reparieren', 'musik']),
          next: 'platte',
        },
        { text: '(Die Melodie weiterpfeifen, da wo die Platte hängt.)', next: 'pfeifen' },
        { text: '„Gustav, lass die Platte. Erzähl mir das Lied.“', next: 'erzaehlen' },
      ],
    }),
    node('platte', [
      N('Du legst eine Münze auf den Tonarmkopf, eine alte Euromünze aus Gustavs Weste. Die Nadel rutscht über den Sprung. Dann läuft das Lied. Ganz.'),
      L(G, 'Ein Euro. Ausgerechnet. Damit hab ich ihr damals die Platte gekauft. Am Bahnhof. Der hatte noch ein Dach.', 'ueberrascht'),
    ], { effects: [herz(G, 20)], next: 'babette' }),
    node('pfeifen', [
      N('Du pfeifst. Schief. Gustav sieht dich an, als würdest du gerade auf seinem Grab tanzen. Dann pfeift er mit. Weniger schief. Und als die Platte sich endlich einkriegt, singt er den Refrain. Mit einer Stimme wie ein rostiges Scharnier, das sich erinnert, wie man Tür ist.'),
    ], { effects: [herz(G, 30)], next: 'babette' }),
    node('erzaehlen', [
      L(G, 'Das Lied? Ein Mädchen will ins Grüne, ein Junge will in der Stadt bleiben. Am Ende fährt der Zug, und einer sitzt drin und einer winkt.', 'trauer'),
      L(G, 'Hab immer gedacht, das ist ein trauriges Lied. Elsa hat gesagt, das ist ein Lied über Mut. Wir haben uns nie geeinigt. Dann ist sie gefahren. Und ich hab gewinkt.'),
    ], { effects: [herz(G, 20)], next: 'babette' }),
    node('babette', [
      N('Babette steht von ihrem Hocker an der Bar auf, wischt sich die Hände an der Schürze ab und streckt Gustav die Hand hin.'),
      L('babette-bao', 'Komm, du alter Schrotthaufen. Einer muss mit dir tanzen, bevor du in deine Platten weinst. Die rosten sonst.'),
      L(G, 'Ich tanz nicht. Ich hab einen Rücken. Und Knie. Und Würde.', 'verlegen'),
    ], {
      choices: [
        {
          text: '„Gustav. Elsa würde wollen, dass du zu eurem Lied tanzt. Nicht dass du es dir anhörst wie eine Beerdigung.“',
          check: chk('he-opa-gustav-8-mut', 'ausstrahlung', 5, ['ueberreden', 'troesten']),
          next: 'tanz',
        },
        { text: '(Selbst Babettes Hand nehmen und vormachen, wie’s geht.)', next: 'vormachen' },
        { text: '„Deine Würde passt in eine Schuhschachtel, Gustav. Steh auf.“', next: 'tanz-ruppig' },
      ],
    }),
    node('vormachen', [
      N('Babette führt. Du stolperst. Sie lacht und tritt dir auf den Fuß, absichtlich, „damit du merkst, wo dein Fuß ist“.'),
    ], {
      effects: [{
        minigame: 'akt-tanz', level: 2, key: 'gustav-oldie-tanz', label: 'Oldie-Tanz mit Babette',
        win: [herz('babette-bao', 15), { message: 'Babette: „Nicht schlecht. Für jemanden, der aussieht wie eine Leiter.“' }],
        lose: [herz('babette-bao', 10), { message: 'Babette: „Du tanzt wie ein Dampfkorb auf Rollen. Aber du tanzt.“' }],
      }],
      next: 'tanz',
    }),
    node('tanz-ruppig', [
      L(G, 'Frechheit. Unverschämtheit. … Die Schuhschachtel ist sehr groß. Da sind Fotos drin.', 'wut'),
      N('Aber er steht auf.'),
    ], { next: 'tanz' }),
    node('tanz', [
      N('Und Gustav tanzt. Langsam, steif, mit Rücken und Knien, aber er tanzt. Die beiden Gäste an der Bar hören auf zu tanzen und gucken zu. Einer runzelt die Stirn, als würde er sich an etwas erinnern.'),
      N('Als das Lied vorbei ist, sitzt Gustav an der Bar und guckt auf seine Hände. Sie haben Öl in den Falten, das nie rausgeht.'),
      L(G, 'Ich hab’s nie versucht. Zwanzig Jahre. Ich hab nie nach ihr gesucht. Ich hab mir eingeredet, sie will mich nicht sehen. Dabei wollte ich sie nicht sehen. Weil sie recht hatte.', 'trauer'),
      L(G, 'Die Stadt dreht sich dauernd, Kind. Erst wird alles lila, dann wieder grau, die Leute sagen „Master“ und dann wieder „Scheiße“. Und ich sitz hier und wink einem Zug hinterher, der vor zwanzig Jahren abgefahren ist.'),
    ], {
      choices: [
        { text: '„Ich hab sie gesehen, Gustav. Aussiedlerhof. Strohhut, Schweißerbrille, eine Ziege namens Mecker.“', when: { met: 'elsa' }, next: 'gesehen' },
        { text: '„Die Aussiedler draußen kennen jede Bastlerin der Ödnis. Ich frag rum.“', tag: '[Ödnis]', when: OEDNIS, next: 'oednis' },
        { text: '„Dann such sie jetzt. Ich helf dir.“', next: 'suchen' },
        { text: '„Schreib ihr. Ich bring den Brief hin.“', next: 'suchen' },
      ],
    }),
    node('gesehen', [
      L(G, 'Mecker. Sie hat eine Ziege und nennt sie Mecker. Natürlich tut sie das. Weil ICH immer meckere.', 'ueberrascht'),
      N('Er lacht. Es klingt, als würde ein Kran anspringen, der lange gestanden hat. Dann muss er sich die Nase putzen.'),
    ], { effects: [herz(G, 20)], next: 'suchen' }),
    node('oednis', [
      L(G, 'Du bist von da draußen? Dann weißt du, wie still es da ist. Elsa hat gesagt, in der Stadt kann man seine Gedanken nicht hören. Ich hab gesagt, gut so, meine Gedanken sind langweilig.', 'trauer'),
      L(G, 'Frag rum. Frag nach einer, die aus Kühlschränken Roboter baut. Das ist sie. Garantiert.'),
    ], { effects: [herz(G, 20)], next: 'suchen' }),
    node('suchen', [
      L(G, 'Nie zu spät … Das sagen nur junge Leute. Aber gut. Gut! Ich schreib ihr einen Brief. Mit der Hand. Nicht diktiert an eine Taube. Sie hasst Tauben.', 'freude'),
      L(G, 'Und du bringst ihn hin. Und wenn sie mich auslacht, dann lach ich mit. Und wenn sie nicht lacht … dann sag’s mir langsam.'),
    ], { effects: [herz(G, 40), { setFlag: 'gustav_tanz' }], next: 'quest' }),
    // Eigener Knoten, damit ein fehlender Quest-Eintrag die Herz-Effekte oben nicht verschluckt.
    node('quest', [N('Gustav will Elsa wiedersehen. Der Brief ist noch nicht geschrieben, aber er hat schon drei Stifte zerbissen.')], {
      effects: [{ startQuest: 'pers-gustav-alte-liebe' }],
    }),
  ]),

  // ------------------------------------------------------------------------------------------- Herz-Ereignis 10
  dlg('dlg-he-opa-gustav-10', [
    node('a', [
      N('Vor dem Wohnwagen ist ein Tisch gedeckt. Klapptisch, Wachstuch, zwei Kerzen in Schraubgläsern. Gustav trägt ein Hemd mit Kragen. Knurri trägt eine Fliege und hasst es.'),
      L(G, 'Setz dich. Nicht da, da ist der Stuhl mit der Kuhle. Der ist meiner. Seit 2052.', 'signatur'),
    ], {
      choices: [
        { text: '„Ist Elsa auch da?“', when: LIEBE_FERTIG, next: 'mit-elsa' },
        { text: '„Was feiern wir, Gustav?“', when: { not: LIEBE_FERTIG }, next: 'ohne-elsa' },
      ],
    }),
    node('mit-elsa', [
      N('Aus dem Wohnwagen kommt eine kleine Frau mit Strohhut und einer Schüssel Kartoffelsalat. Elsa. Sie stellt die Schüssel ab, als würde sie hier wohnen. Und dann, ganz kurz, legt sie Gustav die Hand in den Nacken.'),
      L('elsa', 'Ich bin mit dem Konvoi gekommen. Zwölf Stunden Sand für einen Abend mit dem alten Meckerer. Das ist das Unvernünftigste, was ich seit zwanzig Jahren gemacht hab.', 'freude'),
      L(G, 'Das Zweitunvernünftigste. Das Unvernünftigste war, dass ich dich hab fahren lassen.', 'zaertlich'),
      L('elsa', 'Er hat gesagt, er hat was gebaut. Für dich. Er war nervös wie ein Kind vorm Zahnarzt. Er hat drei Nächte gelötet.'),
    ], { next: 'krone' }),
    node('ohne-elsa', [
      L(G, 'Dich. Wir feiern dich. Du hast für mich mehr getan als irgendwer in zwanzig Jahren. Du bist geblieben. In dieser Stadt bleibt keiner. Alle gehen oder werden lila.', 'trauer'),
      L(G, 'Und weil ich keine Rede halten kann, hab ich was gebaut. Aus dem Besten, was ich hab.'),
    ], { next: 'krone' }),
    node('krone', [
      N('Er zieht ein Tuch von etwas auf dem Tisch. Darunter: eine Krone. Aus Schrauben, Zahnrädern, Gliedern einer Fahrradkette, einer alten Euromünze vorne in der Mitte und einem Stück Kupferspule, das sich wie Efeu um den Rand windet.'),
      N('Sie ist schief. Sie ist großartig.'),
      L(G, 'Die Schrottkrone. Für den König oder die Königin der Halde. Die erste hab ich mal für Elsa gebaut, aber sie hat gesagt, sie trägt keine Kronen, nur Strohhüte. Die hier ist neu. Die ist für dich.', 'signatur'),
    ], {
      choices: [
        { text: '(Die Krone aufsetzen.)', next: 'aufsetzen' },
        { text: '„Warum ich, Gustav?“', next: 'warum' },
        { text: '„Die Krone vom alten Platz. Du hast damals gesagt, die kriegt nur, wer den Platz nicht verrät.“', tag: '[Schrott]', when: SCHROTT, next: 'schrott' },
      ],
    }),
    node('warum', [
      L(G, 'Weil du Schrott verstehst. Nicht den aus Metall. Den anderen. Leute, die keiner mehr will. Kinder auf Kisten. Alte Männer mit Kran. Eine Stadt, die rostet.', 'zaertlich'),
      L(G, 'Du wirfst nichts weg. Das ist das Einzige, was einen König ausmacht. Der Rest ist Blech.'),
    ], { effects: [herz(G, 20)], next: 'aufsetzen' }),
    node('schrott', [
      L(G, 'Du weißt das noch? Du weißt das NOCH? Da warst du so hoch wie Knurri. Und hast mich gefragt, ob die Krone echt Gold ist.', 'ueberrascht'),
      L(G, 'Sie war Messing. Diese hier auch. Aber jetzt hast du sie dir verdient. Und den Platz hast du nie verraten. Ich hab nachgezählt.'),
    ], { effects: [herz(G, 30)], next: 'aufsetzen' }),
    node('aufsetzen', [
      N('Die Krone ist schwerer, als sie aussieht. Eine Schraube piekst. Knurri setzt sich vor dich und knurrt, sehr leise, sehr anerkennend.'),
      L(G, 'Und wenn jemand fragt, sag: „Gustav hat gesagt, früher war hier alles grün. Und jetzt ist hier alles meins.“', 'freude'),
      L(G, 'Komm. Es ist dunkel genug. Ich zeig dir was. Von oben.'),
    ], {
      choices: [
        { text: '(Mit Gustav in die Kabine des Krans klettern.)', when: { notFlag: 'epilog' }, next: 'kran' },
        { text: '(Mit Gustav in die Kabine des Krans klettern.)', when: { flag: 'epilog' }, next: 'kran-nachspiel', id: 'kran-nachspiel' },
        { text: '„Ein andermal, Gustav. Genieß deinen Abend.“', next: 'abend' },
      ],
    }),
    node('kran', [
      N('Die Kabine riecht nach Öl und Kaffee. Gustav lässt den Ausleger ausfahren, langsam, ruckelnd. Unter euch: die Unterstadt, ein Teppich aus Neon und Rost. Über euch: der Quantum-Spire. Seine Spitze pulsiert lila, in einem Rhythmus, der dir nicht gefällt.'),
      L(G, 'Früher war hier alles grün. Jetzt ist alles lila. Ich weiß nicht, was schlimmer ist. Grün war wenigstens ehrlich.', 'besorgt'),
      L(G, 'Ihr geht da wieder hoch, oder? Ich seh’s an deinem Gesicht. Hunter hat dasselbe Gesicht. Und Dante. Und die mit dem Arm.'),
    ], {
      choices: [
        { text: '„Ja. Und danach fahren wir ans Meer.“', next: 'meer' },
        { text: '„Ich weiß es noch nicht, Gustav.“', next: 'weiss-nicht' },
      ],
    }),
    node('kran-nachspiel', [
      N('Die Kabine riecht nach Öl und Kaffee. Gustav lässt den Ausleger ausfahren, langsam, ruckelnd. Unter euch: die Unterstadt, ein Teppich aus Neon und Rost. Über euch: der Quantum-Spire. Dunkel. Kein Lila mehr, kein Pulsieren.'),
      L(G, 'Guck. Sterne. Drei Stück. Mehr sind’s nicht, der Smog frisst den Rest. Aber drei sind mehr als null. Die hab ich seit 2060 nicht gesehen.', 'zaertlich'),
      L(G, 'Das warst du. Und deine verrückte Crew. Ich sag’s nur einmal, und hier oben hört’s keiner: Ich bin stolz auf euch.'),
    ], { effects: [herz(G, 20)], next: 'abend' }),
    node('meer', [
      L(G, 'Ans Meer. Das hat Elsa auch immer gesagt. „Gustav, irgendwann fahren wir ans Meer.“ Ich hab gesagt, ich hab genug Wasser im Keller.', 'trauer'),
      L(G, 'Wenn ihr fahrt … nehmt einen alten Mann mit. Ich setz mich hinten hin. Ich meckere auch nur ein bisschen.', 'zaertlich'),
    ], { effects: [herz(G, 20), { setFlag: 'gustav_will_ans_meer' }], next: 'abend' }),
    node('weiss-nicht', [
      L(G, 'Gut. Wer’s schon weiß, hat meistens nicht nachgedacht. Blade wusste immer alles. Siehst ja, wo das hinführt.', 'signatur'),
    ], { effects: [herz(G, 10)], next: 'abend' }),
    node('abend', [
      N('Später sitzt ihr wieder am Tisch. Das Radio im Wohnwagen spielt eine Polka. Knurri hat die Fliege abgekaut. Gustav sieht zufrieden aus, auf diese mürrische Art, die bei ihm Glück bedeutet.'),
    ], { effects: [{ setFlag: 'gustav_koenig' }] }),
  ]),

  // ------------------------------------------------------------------------------------------- Akt 2
  dlg('opa-gustav-a2-bruch', [
    node('a', [
      N('Knurri liegt vor dem Stand und kaut auf etwas Lila herum. Es piept. Es piept immer leiser.'),
      L(G, 'Knurri hat heute Nacht eine Drohne gefressen. Eine von denen mit Quantum drauf. Die flog zu tief über meinen Kran. Das macht man nicht. Das ist mein Himmel.', 'signatur'),
      L(G, 'Die ganze Nacht war die Hölle los. Sirenen, Drohnen, irgendwo am Campus hat’s geknallt. Und heute Morgen sagt mir der Bäcker „Guten Morgen, Master“. Ich hab ihm eine Schraube an den Kopf geworfen.'),
    ], {
      effects: [{ markSeen: 'opa-gustav-a2-bruch' }],
      choices: [
        { text: '„Kann ich mir den Rest von der Drohne ansehen?“', next: 'drohne' },
        { text: '„Hat Knurri sich den Magen verdorben?“', next: 'magen' },
      ],
    }),
    node('drohne', [
      N('Gustav zieht Knurri das Ding aus dem Maul. Viel ist nicht übrig: ein halber Rotor, Kabel, eine Platine mit einem winzigen „Chrome 10“-Aufdruck.'),
      L(G, 'Nimm’s. Ich will das Zeug nicht auf meinem Platz. Das guckt einen an, auch wenn’s kaputt ist.', 'besorgt'),
    ], { effects: [{ give: 'quantum-chip-schrott' }, herz(G, 10)] }),
    node('magen', [
      L(G, 'Knurri? Der hat einen Magen aus Panzerblech. Der hat mal einen Toaster gefressen. Mit Toast. Der Toast war schlimmer.', 'freude'),
      L(G, 'Hier, nimm den Rest. Vielleicht kann euer Bastler was damit. Der Plattenmann. Dante.'),
    ], { effects: [{ give: 'quantum-chip-schrott' }, herz(G, 10)] }),
  ]),

  dlg('opa-gustav-a2-aria', [
    node('a', [
      L(G, 'Die mit dem Arm war hier. Aria. Hat sich an meinen Kran gehängt und Klimmzüge gemacht. Zwanzig. Mit einer Hand. Ich hab gesagt, der Kran ist kein Turngerät. Sie hat gesagt, jetzt schon.', 'signatur'),
    ], {
      effects: [{ markSeen: 'opa-gustav-a2-aria' }],
      choices: [
        { text: '„Quantum hat ihren Arm gesperrt. Er macht manchmal nicht, was sie will.“', when: { flag: 'aria_arm_gesperrt' }, next: 'gesperrt' },
        { text: '„Sie ist wieder ganz die Alte.“', next: 'alte' },
      ],
    }),
    node('gesperrt', [
      L(G, 'Gesperrt? Einen Arm? Hab ich noch nie gehört, dass man Schrott sperren kann. Schrott gehört dem, der ihn benutzt. Das ist das älteste Gesetz der Halde.', 'wut'),
      L(G, 'Sag eurem Plattenmann, er soll die Sperre rausreißen. Und wenn er’s nicht kann, bring sie her. Ich hab Zangen, die sind älter als Quantum.'),
    ], { effects: [herz(G, 10)] }),
    node('alte', [L(G, 'Gut. Die Alte war mir lieber als die, die sie aus ihr machen wollten. Die hätte nicht geturnt. Die hätte salutiert.', 'besorgt')]),
  ]),

  dlg('opa-gustav-a2-tag', [
    node('a', [
      N('Gustav sitzt auf seinem Klappstuhl mit der Kuhle. Über ihm summt eine Quantum-Drohne. Knurri starrt sie an, ohne zu blinzeln. Die Drohne hält Abstand.'),
      L(G, 'Die kennen Knurri inzwischen. Die fliegen einen Bogen. Das ist das Einzige in der Stadt, wovor Quantum Respekt hat: ein rostiger Hund mit Hunger.', 'signatur'),
    ], {
      choices: [
        handel,
        { text: '„Willst du kein Chrome 10, Gustav? Ist gratis.“', next: 'chrome' },
        { text: '„Wie geht’s mit Elsa?“', when: LIEBE_AKTIV, next: 'elsa' },
        {
          text: '„Hat Knurri noch was gefangen?“', tag: '[Gustav ♥6]', requires: { hearts: G, min: 6 },
          once: true, id: 'gustav-knurri-beute', next: 'beute',
        },
        { text: '„Bis später, Gustav.“', effects: [herz(G, 5)] },
      ],
    }),
    node('chrome', [
      L(G, 'Ich hab schon ein Implantat. Ein Hörgerät von 2041. Das sagt nur „Piep“, wenn die Batterie alle ist. Mehr Zukunft brauch ich nicht.', 'signatur'),
      L(G, 'Gratis. Pah. Früher hat man Leuten gratis Zigaretten gegeben. Dann gratis Telefone. Jetzt gratis Gedanken. Ich behalt meine. Die sind alt, aber sie gehören mir.'),
    ]),
    node('elsa', [
      L(G, 'Ich hab den Brief geschrieben. Und dreimal zerrissen. Und wieder zusammengeklebt. Er sieht jetzt aus wie eine Landkarte.', 'verlegen'),
      L(G, 'Wenn du sie siehst … sag ihr nicht, dass ich nervös bin. Sag ihr, ich bin gelassen. Wie ein Fels. Ein Fels mit Herzrasen.'),
    ]),
    node('beute', [
      L(G, 'Gestern zwei. Eine hat er wieder ausgespuckt, die schmeckte ihm nicht. Die andere liegt im Eimer. Nimm. Und sag dem Plattenmann: Knurri will Anteile.', 'freude'),
    ], { effects: [{ give: 'quantum-chip-schrott' }, herz(G, 10)] }),
  ]),

  dlg('opa-gustav-a2-party', [
    node('a', [
      L(G, 'Ich hab gehört, ihr wollt auf die Party im Turm. Mit Anzug und Lügen. Das hab ich auch mal gemacht. 2051, Hochzeit vom Bürgermeister. Ich war als Kellner da. Ich hab das Silber geklaut.', 'signatur'),
      L(G, 'Na ja, das Silber war Edelstahl. Aber der Gedanke zählt.'),
    ], {
      effects: [{ markSeen: 'opa-gustav-a2-party' }],
      choices: [
        { text: '„Hast du einen Tipp für uns?“', next: 'tipp' },
        { text: '„Wir brauchen vielleicht noch einen Fluchtwagen.“', next: 'wagen' },
      ],
    }),
    node('tipp', [
      L(G, 'Ja. Immer ein Tablett tragen. Mit einem Tablett bist du unsichtbar. Keiner guckt einen Kellner an. Nicht mal Blade. Besonders nicht Blade.', 'signatur'),
      L(G, 'Und nimm das hier. Für wenn was klemmt.'),
    ], { effects: [{ give: 'reparaturset' }, herz(G, 10)] }),
    node('wagen', [
      L(G, 'Ich hab einen Kran. Der fährt zwei Meter die Stunde. Das ist kein Fluchtwagen, das ist ein Geständnis.', 'freude'),
      L(G, 'Frag Tilda in Halle 9. Oder die Rostlaube an der Hafenkante, falls die noch anspringt. Und nimm das hier, für wenn sie nicht anspringt.'),
    ], { effects: [{ give: 'reparaturset' }, herz(G, 10)] }),
  ]),

  dlg('opa-gustav-a2-nervoes', [
    node('a', [
      N('Gustav hat das Radio laut gedreht. Es läuft eine Polka. Er hört sie nicht, er starrt auf den Spire.'),
      L(G, 'Ich bin zweiundachtzig. Ich hab drei Stadtregierungen überlebt, zwei Fluten und Dexters Kochkurs. Aber das hier macht mich nervös.', 'besorgt'),
    ], {
      choices: [
        { text: '„Wir kommen zurück, Gustav.“', next: 'zurueck' },
        handel,
      ],
    }),
    node('zurueck', [L(G, 'Das hat Elsa auch gesagt. Sie hat zwanzig Jahre gebraucht. Ihr habt eine Nacht. Also beeilt euch.', 'zaertlich')], { effects: [herz(G, 10)] }),
  ]),

  // ------------------------------------------------------------------------------------------- Akt 3
  dlg('opa-gustav-partynacht', [
    node('a', [
      N('Gustav sitzt vor dem Wohnwagen. Das Radio rauscht. Radio Rost sendet nicht, nur eine Platte mit Sprung. Er hat den Fernseher für die Kinder ins Nest getragen und sich selbst keinen behalten.'),
      L(G, 'Ich guck nicht zu. Ich hör nur. Wenn das Radio wieder spielt, ist es vorbei. So oder so.', 'besorgt'),
    ], { effects: [herz(G, 5)] }),
  ]),

  // ------------------------------------------------------------------------------------------- Nachspiel
  dlg('opa-gustav-nachspiel', [
    node('a', [
      N('Gustav sitzt auf dem Klappstuhl. Über dem Schrottmarkt fliegen keine Drohnen mehr. Knurri liegt auf dem Rücken und lässt sich die Sonne auf den Blechbauch scheinen.'),
      L(G, 'Na also. Hat doch geklappt. Ich hab’s immer gesagt. Ich hab’s nie gesagt. Aber ich hab’s gedacht. Manchmal.', 'freude'),
    ], {
      effects: [{ markSeen: 'opa-gustav-nachspiel' }, herz(G, 20)],
      choices: [
        { text: '„Wir waren am Meer.“', when: ENDE_MEER, next: 'meer' },
        { text: '„Nexus ist jetzt auf unserer Seite. Sagt sie.“', when: ENDE_NEXUS, next: 'nexus' },
        { text: '„Und, was sagt Elsa?“', when: LIEBE_FERTIG, next: 'elsa' },
        { text: '„Alles gut bei dir?“', next: 'gut' },
      ],
    }),
    node('meer', [
      L(G, 'Und? Ist es grün?', 'ueberrascht'),
      L(G, '… Blau. Natürlich ist es blau. Elsa hat das auch immer gesagt. Ich hab ihr nie geglaubt. Ich dachte, das Meer ist braun, wie im Hafenbecken.'),
    ], {
      choices: [
        { text: '„Komm mit, Gustav. Samstag. Guck’s dir selbst an.“', effects: [{ setFlag: 'gustav_meer_dabei' }, herz(G, 30)], next: 'samstag' },
        { text: '„Irgendwann zeig ich’s dir.“', next: 'gut' },
      ],
    }),
    node('samstag', [
      L(G, 'Ich? Ans Meer? Mit meinem Rücken? … Ich nehm meine Angel mit. Und den Klappstuhl. Und Knurri. Knurri war auch noch nie am Meer. Der rostet da bestimmt sofort. Das wird ein Spaß.', 'freude'),
    ], { next: 'gut' }),
    node('nexus', [
      L(G, 'Die KI hat mich gefragt, ob sie meinen Kran „optimieren“ darf. Ich hab Nein gesagt. Sie hat „Verstanden, Gustav“ gesagt und es gelassen.', 'ueberrascht'),
      L(G, 'Das hat noch nie eine Maschine gemacht. Ich trau ihr trotzdem nicht. Aber ich hab ihr eine Polka vorgespielt. Sie hat gesagt, sie findet die Akkordeonstimme „unerwartet“. Ich nehm das als Kompliment.'),
    ], { next: 'gut' }),
    node('elsa', [
      L(G, 'Elsa sagt, ich soll das Meer angucken. Ich hab gesagt, ich hab genug Wasser im Keller. Sie hat gesagt: „Gustav. Halt die Klappe und pack.“', 'zaertlich'),
      L(G, 'Sie hat mir einen Strohhut geschenkt. Ich trag ihn nicht. Ich trag ihn nur, wenn keiner guckt. Ich trag ihn eigentlich dauernd.'),
    ], { next: 'gut' }),
    node('gut', [L(G, 'Gut. Früher war hier alles grün. Jetzt ist es wenigstens wieder grau. Das ist ein Anfang.', 'signatur')]),
  ]),

  dlg('opa-gustav-nachspiel-tag', [
    node('a', [
      N('Gustavs Stand hat ein neues Schild: „SCHROTTKRAM GUSTAV · Reparaturen · Ankauf · KEINE CHIPS!!!“ Das letzte Wort ist dreimal unterstrichen und einmal durchgeschweißt.'),
      L(G, 'Na, Majestät? Die Krone sitzt? Nicht? Mehr Schrauben. Das hilft immer.', 'signatur'),
    ], {
      choices: [
        handel,
        { text: '„Wie geht’s dem Kran?“', next: 'kran' },
        { text: '„Und die Leute? Sind die wieder normal?“', next: 'leute' },
        { text: '„Bis später, Gustav.“', effects: [herz(G, 5)] },
      ],
    }),
    node('kran', [L(G, 'Elsa geht’s gut. Der Kran, mein ich. Die Frau auch. Ich hab beide geölt. Nein. Das klang falsch. Vergiss es.', 'verlegen')]),
    node('leute', [
      L(G, 'Die meisten. Die werfen jetzt ihre Chips weg. Ich kauf sie an, zwei Credits das Stück, und schmelz sie ein. Aus dem Zeug mach ich Türklinken. Jeder, der eine Tür aufmacht, drückt Quantum die Hand runter.', 'freude'),
    ]),
  ]),

  dlg('opa-gustav-bei-elsa', [
    node('a', [
      N('Auf der Bank vor Elsas Werkstatt sitzt Gustav, einen Strohhut auf dem Kopf, und meckert über den Sand. Aus der Werkstatt kommt das Zischen eines Lötkolbens und ab und zu ein Fluch, der ihn zum Lächeln bringt.'),
      L(G, 'Sonntags bin ich hier. Ich sitz auf der Bank und sag, dass der Sand überall ist. Dann repariert sie was. Dann reparier ich, was sie repariert hat. Dann streiten wir. Dann gibt’s Tee.', 'zaertlich'),
    ], {
      choices: [
        { text: '„Klingt nach einer guten Ehe.“', next: 'ehe' },
        { text: '„Vermisst du den Schrottmarkt?“', next: 'markt' },
      ],
    }),
    node('ehe', [L(G, 'Das ist die beste. Die zweitbeste war die erste. Mit derselben Frau. Mit weniger Sand.', 'freude')], { effects: [herz(G, 10)] }),
    node('markt', [L(G, 'Montags. Dann fahr ich zurück und vermiss den Sand. So ist das, wenn man alt ist. Man vermisst immer, wo man gerade nicht ist.', 'signatur')], { effects: [herz(G, 5)] }),
  ]),

  dlg('opa-gustav-meer', [
    node('a', [
      N('Am Ende des Stegs sitzt Gustav auf seinem Klappstuhl, die Angel ausgeworfen, die Hose bis zu den Knien hochgekrempelt. Knurri steht bis zum Bauch im Wasser und knurrt die Wellen an. Die Wellen machen weiter.'),
      L(G, 'Blau. Es ist wirklich blau. Zweiundachtzig Jahre hab ich gebraucht, um mir das anzugucken. Elsa sagt, das sei typisch.', 'zaertlich'),
    ], {
      choices: [
        { text: '„Beißt was?“', next: 'beisst' },
        { text: '(Sich neben ihn setzen und aufs Wasser gucken.)', effects: [herz(G, 10)], next: 'gucken' },
      ],
    }),
    node('beisst', [L(G, 'Nein. Aber das ist egal. Angeln ist, wenn man so tut, als hätte man was zu tun, damit man aufs Wasser gucken darf.', 'signatur')]),
    node('gucken', [
      N('Ihr sagt lange nichts. Irgendwann schläft Gustav ein. Seine Angel zuckt. Knurri bellt. Gustav wacht nicht auf. Es ist trotzdem ein perfekter Nachmittag.'),
    ]),
  ]),

  dlg('opa-gustav-master', [
    node('a', [
      N('Knurri steht mitten im Weg und knurrt. Nicht im Schlaf. Hellwach.'),
      L(G, 'Früher war hier alles grün. Dann kam Quantum. Dann kamst du. Ich weiß nicht mehr, was schlimmer war.', 'wut'),
      L(G, 'Für dich hab ich nix im Angebot. Keine Schraube, kein Kaffee, kein Wort mehr. Die Krone kannst du behalten. Die ist eh nur Messing. Wie alles an dir.'),
    ], {
      choices: [
        { text: '„Gustav …“', next: 'gustav' },
        { text: '(Gehen.)' },
      ],
    }),
    node('gustav', [
      L(G, 'Ich hab zwanzig Jahre gebraucht, um einen Fehler wiedergutzumachen. Du hast vielleicht weniger Zeit. Die Stadt wartet nicht so geduldig wie Elsa.', 'trauer'),
    ]),
  ]),

  dlg('opa-gustav-3b', [
    node('a', [
      N('Knurri sieht dich an. Er knurrt nicht. Er legt sich hin. Das ist bei Knurri das, was andere Hunde mit Schwanzwedeln sagen.'),
      L(G, 'Na, da ist ja jemand zurück aus dem Turm. Hat ja auch lange genug gedauert.', 'signatur'),
      L(G, 'Ich hab zwanzig Jahre gebraucht. Du nur ein paar Wochen. Du bist also deutlich schlauer als ich. Das ist kein großes Lob.'),
    ], { effects: [{ markSeen: 'opa-gustav-3b' }, herz(G, 60)], choices: [handel, { text: '„Danke, Gustav.“' }] }),
  ]),
);

export const part: ContentPart = { dialogues };
