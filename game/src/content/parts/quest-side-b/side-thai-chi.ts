// side-thai-chi „Finde deine innere Mitte“ (world.md §6.2 Nr. 19) · Hunter (heimlich) · loetgassen Hinterhof-Studio · M,
// ab Hunter ♥3 und nach main-1-dante. Start über Hunters Tagesgespräch (parts/npc-crew-a/hunter.ts, Flyer unterm Kassenbuch).
// Schritte: Lehrerin finden (Kessel nach ihrer Quest oder Meister Watt) → drei Morgenstunden (Minispiel, langsame Folgen)
// → Aria fernhalten: gc-80 Kran-Mutprobe · Hunter durch die Hinterhöfe führen (Sichtkegel als Wegrätsel) · [Aria ♥5] einweihen.
// Vex × Aria: eigene Zeilen in Arias Szenen (Rivalinnen-Ton bzw. Romanzefassung).
import type { ContentPart } from '../../part';
import type { CutsceneDef, DialogueDef, Effect, QuestDef } from '../../../modules/contracts';
import {
  L, N, P, VEXARIA, VEX_OHNE_ROM, active, all, any, bye, done, flag, hearts, msg, node, noFlag, not, rel, set, tafel, time,
} from './_lib';

const Q = 'side-thai-chi';
const H = 'hunter';
const A = 'aria';

const KESSEL_FREI = any(done('side-feierabend-fuer-kessel'), flag('kessel_feierabend'));
const LEHRER = any(flag('tc_lehrer_kessel'), flag('tc_lehrer_watt'));
const ARIA_GELOEST = any(flag('tc_aria_abgelenkt'), flag('tc_hinterhoefe'), flag('tc_aria_eingeweiht'));
const S1 = flag('tc_stunde_1');
const S2 = flag('tc_stunde_2');
const S3 = flag('tc_stunde_3');
const MORGENS = time('morgen');

const quest: QuestDef = {
  id: Q,
  kind: 'personal',
  title: 'Finde deine innere Mitte',
  summary: 'Hunter will die „Diva“ loswerden, die in ihm erwacht, wenn er Hunger hat. Mit Tai Chi. Heimlich. Wenn du lachst, kriegst du Hausverbot. In der ganzen Unterstadt.',
  giver: H,
  act: 1,
  steps: [
    {
      id: 'lehrer', text: 'Eine Lehrkraft finden: Meister Watt hält seit dreißig Jahren dieselbe Pose am Schrottmarkt. Oder Wachtmeisterin Kessel – falls sie schon gekündigt hat.',
      done: LEHRER, marker: { map: 'schrottmarkt', at: [212, 650] },
    },
    { id: 'stunde-1', text: 'Erste Morgenstunde im Hinterhof-Studio der Lötgassen.', done: S1, when: LEHRER, marker: { map: 'loetgassen', at: [200, 470] } },
    {
      id: 'aria', text: 'Aria schnüffelt herum. Halt sie fern: mit einer Mutprobe am Kran, über die Hinterhöfe – oder weih sie ein.',
      done: ARIA_GELOEST, when: S1, marker: { map: 'schrottmarkt', at: [1232, 300] },
    },
    { id: 'stunde-2', text: 'Zweite Morgenstunde.', done: S2, when: all(S1, ARIA_GELOEST), marker: { map: 'loetgassen', at: [200, 470] } },
    { id: 'stunde-3', text: 'Dritte Morgenstunde. Die innere Mitte wartet. Sie ist sehr geduldig.', done: S3, when: S2, marker: { map: 'loetgassen', at: [200, 470] } },
  ],
  reward: {
    xp: 160,
    relations: { [H]: 100 },
    effects: [set('hunter_innere_mitte'), set('hunter_keine_diva'), msg('Hunter hat seine innere Mitte gefunden. Im Kampf: „Innere Mitte“ – einmal pro Kampf alle negativen Zustände der Crew weg.')],
  },
};

// ------------------------------------------------------------------------------------------ Lehrkräfte
const watt: DialogueDef = {
  id: 'tc-meister-watt',
  start: 'start',
  nodes: [
    node('start', [
      N('Meister Watt steht auf einem Bein auf einem umgedrehten Ölfass, die Arme wie ein Kranich ausgebreitet. Er steht so seit dreißig Jahren. Die Händler stellen ihre Preisschilder an ihn.'),
      N('Eine Taube sitzt auf seinem Kopf. Sie wirkt, als wohne sie dort.'),
      P('Meister Watt? Ich such jemanden, der … einem Freund Tai Chi beibringt. Morgens. Heimlich.'),
      N('Eine Minute vergeht. Dann bewegt Meister Watt ein Augenlid.'),
      L('meister-watt', '… Ein … Freund.'),
      L('meister-watt', '… Groß. … Sonnenbrille. … Wird … zur … Diva.'),
      P('Woher –'),
      L('meister-watt', '… Ich … stehe … hier … seit … dreißig … Jahren. … Ich … sehe … alles.'),
    ], {
      choices: [
        { text: '„Bringen Sie es ihm bei?“', next: 'ja' },
        bye('„Ich frag wen anders.“'),
      ],
    }),
    node('ja', [
      N('Noch eine Minute. Die Taube putzt sich.'),
      L('meister-watt', '… Morgen. … Früh. … Hinterhof-Studio. … Ich … komme.'),
      P('Sie bewegen sich doch nie von hier weg.'),
      L('meister-watt', '… Für … eine … Diva … mache … ich … eine … Ausnahme.'),
    ], { effects: [set('tc_lehrer_watt'), rel('meister-watt', 30), msg('Meister Watt kommt morgens ins Hinterhof-Studio. Langsam.')] }),
  ],
};

const kessel: DialogueDef = {
  id: 'tc-kessel',
  start: 'start',
  nodes: [
    node('start', [
      N('Wachtmeisterin Kessel – ehemalige Wachtmeisterin Kessel – rollt im Hinterhof-Studio eine Matte aus. Sie trägt Leggings mit Polizeiwappen. Alte Gewohnheiten.'),
      L('wache', 'Erster Kurs der Saison. Teilnehmer bisher: null. Ich hoffe, wir sehen uns nicht wieder. … Nein, falsch. Ich HOFFE, wir sehen uns wieder. Das muss ich noch üben.'),
      P('Ich hab einen Schüler für Sie. Groß. Sonnenbrille. Ein bisschen empfindlich, wenn er Hunger hat.'),
      L('wache', 'Hunter? DER Hunter? Den ich zwei Jahre lang beim Freigang beaufsichtigt habe? Der hat mir mal einen Kaffee an die Wand geworfen, weil der Zucker fehlte.'),
      L('wache', 'Vorschrift sagt: ehemalige Häftlinge nur mit Bescheinigung. Mein Herz sagt: Ich brauche Kundschaft. Morgens. Matte drei.'),
    ], { effects: [set('tc_lehrer_kessel'), rel('wache', 30)], choices: [{ text: '„Er wird da sein. Grummelnd.“' }] }),
  ],
};

// ------------------------------------------------------------------------------------------ Die Stunden
const stunde = (n: number, win: Effect[]): Effect => ({
  minigame: 'akt-tanz', level: 1, key: `tc-stunde-${n}`, label: `Tai Chi · Stunde ${n}: langsame Folgen`,
  win: [{ setFlag: `tc_stunde_${n}` }, { advanceTime: 90 }, ...win],
  lose: [{ advanceTime: 30 }, { message: 'Zu schnell. Tai Chi ist kein Wettrennen. Hunter grinst schadenfroh. Morgen noch mal.' }],
});

const studio: DialogueDef = {
  id: 'tc-studio',
  start: 'start',
  nodes: [
    node('start', [
      N('Das Hinterhof-Studio: ein ehemaliger Waschsalon mit einer Matte aus Kartonage, einem Räucherstäbchen, das nach verbranntem Kabel riecht, und einem Zettel: „Bitte leise. Die innere Mitte schläft noch.“'),
      L(H, 'Wenn hier jemand ein Foto macht, kauf ich die Lötgassen und reiß sie ab.'),
    ], {
      choices: [
        { text: 'Erste Stunde mit Meister Watt.', when: all(noFlag('tc_stunde_1'), flag('tc_lehrer_watt')), next: 's1-watt' },
        { text: 'Erste Stunde mit Kessel.', when: all(noFlag('tc_stunde_1'), flag('tc_lehrer_kessel'), noFlag('tc_lehrer_watt')), next: 's1-kessel' },
        { text: '„Aria lungert vorne an der Gasse. Ich führ dich hinten rum.“', when: all(S1, not(ARIA_GELOEST)), next: 'route-1' },
        { text: 'Zweite Stunde.', when: all(S1, ARIA_GELOEST, noFlag('tc_aria_eingeweiht'), noFlag('tc_stunde_2')), next: 's2' },
        { text: 'Zweite Stunde. Aria kommt mit.', when: all(S1, flag('tc_aria_eingeweiht'), noFlag('tc_stunde_2')), next: 's2-aria' },
        { text: 'Dritte Stunde.', when: all(S2, noFlag('tc_stunde_3')), next: 's3' },
        bye('„Noch nicht. Erst mal Kaffee.“'),
      ],
    }),
    node('s1-watt', [
      N('Meister Watt steht schon da. Niemand hat ihn kommen sehen. Die Taube ist auch da.'),
      L('meister-watt', '… Hebe … den … Arm.'),
      N('Hunter hebt den Arm.'),
      L('meister-watt', '… Langsamer.'),
      N('Hunter hebt den Arm langsamer.'),
      L('meister-watt', '… Noch … langsamer. … Du … hebst … ihn … wie … eine … Rechnung.'),
      L(H, 'Ich bin ein Geschäftsmann! Ich hebe ALLES wie eine Rechnung!', 'wut'),
    ], { effects: [stunde(1, [rel(H, 20), set('tc_aria_droht'), { dialogue: 'tc-nach-stunde-1' }])] }),
    node('s1-kessel', [
      L('wache', 'Füße schulterbreit. Knie weich. Wie bei einer Leibesvisitation, nur von der anderen Seite.'),
      L(H, 'Kessel. Ich warne Sie.'),
      L('wache', 'Und atmen. Ein. Aus. Sie atmen wie jemand, der gleich einen Kaffee an die Wand wirft. Langsamer.'),
      L(H, '… Das war EIN Kaffee. EINMAL.', 'wut'),
    ], { effects: [stunde(1, [rel(H, 20), set('tc_aria_droht'), { dialogue: 'tc-nach-stunde-1' }])] }),
    node('s1-ende', [
      N('Nach der Stunde steht Hunter in der Hoftür und reckt den Hals. Vorne an der Gasse, auf dem Weg zum Schrottmarkt, lehnt jemand mit zwei Zöpfen und einem Baseballschläger an der Wand und guckt sehr interessiert in eure Richtung.'),
      L(H, 'Aria. Scheiße. Wenn die das rauskriegt, erzählt sie es jedem. Sie erzählt es Vega. Vega rechnet aus, wie viele Leute es wissen. Dann steht es in der Zeitung.'),
      L(H, 'Mach was. Lenk sie ab. Oder bring mich ungesehen hier rein. Oder … ich weiß nicht. Du bist doch die mit den Ideen.'),
    ]),
    // --- Wegrätsel durch die Hinterhöfe (Sichtkegel)
    node('route-1', [
      N('Ihr schleicht hinten aus dem Studio. Vor euch der erste Hof: links eine Wäscheleine voller Laken, rechts ein Stapel Paletten. Am Hofeingang, mit dem Rücken zu euch, Aria. Sie dreht sich alle paar Sekunden um, wie ein Leuchtturm mit schlechter Laune.'),
    ], {
      choices: [
        { text: 'Hinter den Laken entlang, wenn sie sich wegdreht.', next: 'route-2' },
        { text: 'Über die Paletten klettern.', next: 'route-fail-1' },
      ],
    }),
    node('route-fail-1', [
      N('Hunter tritt auf die erste Palette. Sie knarrt wie ein Sarg. Aria dreht sich um. Ihr presst euch flach an die Wand. Sie kneift die Augen zusammen, zuckt mit den Schultern, dreht sich wieder weg. Knapp.'),
      L(H, 'Ich wiege so viel wie ich wiege, Neuling. Paletten sind nicht für Männer mit Verantwortung gebaut.'),
    ], { next: 'route-1' }),
    node('route-2', [
      N('Hinter den Laken. Hunter bückt sich so tief, dass seine Sonnenbrille fast auf den Boden fällt. Zweiter Hof: eine Katze auf einer Mülltonne, eine offene Kellertreppe, und ein Fenster, hinter dem ein Fernseher läuft.'),
    ], {
      choices: [
        { text: 'Die Kellertreppe runter, unten durch.', next: 'route-3' },
        { text: 'An der Katze vorbei.', next: 'route-fail-2' },
      ],
    }),
    node('route-fail-2', [
      N('Die Katze faucht Hunter an. Hunter faucht zurück. Laut. Aria ruft „Hallo?“ in den Hof. Ihr sprintet zurück hinter die Laken.'),
      L(H, 'Die hat angefangen.'),
    ], { next: 'route-2' }),
    node('route-3', [
      N('Der Keller riecht nach Kohle und alten Liebesbriefen. Am anderen Ende eine Leiter zurück nach oben, direkt neben dem Studio. Oben summt jemand: Aria, zwei Meter entfernt, auf der anderen Seite einer Bretterwand.'),
    ], {
      choices: [
        { text: 'Warten, bis sie weitergeht.', next: 'route-ende' },
        { text: 'Sofort hoch.', next: 'route-fail-3' },
      ],
    }),
    node('route-fail-3', [
      N('Hunters Kopf erscheint über der Kante. Aria ist noch da. Ihr Blick trifft seine Sonnenbrille. Er duckt sich zurück so schnell, dass er dir auf die Finger tritt. Sie flucht, guckt, sieht nichts. Ihr fangt den Kellerweg noch mal an.'),
    ], { next: 'route-1' }),
    node('route-ende', [
      N('Dreißig lange Sekunden. Dann hört ihr ihre Stiefel weggehen, Richtung Schrottmarkt. Ihr klettert hoch. Das Studio ist nur noch eine Tür entfernt.'),
      L(H, 'Wir nehmen ab jetzt immer diesen Weg. Jeden Morgen. Und wenn die Katze wieder da ist, bezahl ich sie.'),
    ], { effects: [set('tc_hinterhoefe'), rel(H, 20)] }),
    node('s2', [
      N('Zweite Stunde. Hunter steht. Hunter atmet. Hunter bewegt die Hände, als würde er sehr langsam eine Theke abwischen. Es sieht fast gut aus.'),
      L(H, 'Ich hab heute Morgen nichts gegessen. Und ich bin nicht schlecht gelaunt. Ich bin … neutral. Ist das normal? Ist das gefährlich?', 'ueberrascht'),
    ], { effects: [stunde(2, [rel(H, 20)])] }),
    node('s2-aria', [
      N('Aria steht auf der Matte neben Hunter. Sie bewegt den Zerberster in einer langsamen, fließenden Bewegung, und die Federn am Oberarm surren leise. Es ist das Ruhigste, was du je an ihr gesehen hast.'),
      L(A, 'Was? Guck nicht so. Ich hatte drei Jahre Physiotherapie. Langsam ist mein Geheimnis. Erzähl’s keinem.'),
      L(H, 'Sie ist besser als ich. Warum ist sie besser als ich?'),
      L(A, 'Weil ich nicht so tue, als hätte ich keine Gefühle, Boss. Ich lass sie nur langsam raus.', 'signatur'),
    ], { effects: [rel(A, 30), stunde(2, [rel(H, 20)])] }),
    node('s3', [
      N('Dritte Stunde. Das Räucherstäbchen brennt runter. Hunter steht auf einem Bein. Er wackelt nicht. Er atmet. Eine Taube landet auf seiner Schulter und bleibt.'),
      L(H, '…'),
      L(H, 'Ich hab Hunger. Seit zwei Stunden. Und ich will niemanden anschreien.'),
    ], { effects: [stunde(3, [{ cutscene: 'tc-innere-mitte' }])] }),
  ],
};

const nachStunde1: DialogueDef = { id: 'tc-nach-stunde-1', start: 's1-ende', nodes: studio.nodes };

// ------------------------------------------------------------------------------------------ Aria fernhalten
const aria: DialogueDef = {
  id: 'tc-aria',
  start: 'start',
  nodes: [
    node('start', [
      L(A, 'Hey. Du. Was macht Hunter jeden Morgen in den Lötgassen? Der schleicht da rum wie einer, der ’ne Affäre hat. Hat er ’ne Affäre? Sag, dass er ’ne Affäre hat. Ich will das so sehr.'),
    ], {
      choices: [
        { text: '„Vergiss Hunter. Ich wette, du traust dich nicht, ganz oben auf Gustavs Kran zu klettern. Bis zur Spitze.“', check: 'gc-80', next: 'kran' },
        { text: '„Kannst du ein Geheimnis für dich behalten? Ein echtes?“', tag: '[Aria ♥5]', requires: hearts(A, 5), next: 'einweihen' },
        { text: '„Zöpfe. Ich wette, du kommst nicht als Erste oben auf Gustavs Kran an. Gegen mich.“', when: VEX_OHNE_ROM, next: 'vex-rival' },
        { text: 'Ganz nah rangehen. „Wenn ich’s dir sag, was krieg ich dafür?“', tag: '[Vex × Aria]', when: VEXARIA, next: 'vex-rom' },
        bye('„Keine Ahnung. Ich bin nicht sein Kindermädchen.“'),
      ],
    }),
    node('kran', [
      L(A, 'Ich trau mich nicht? ICH? Ich bin in der Rennhalle auf die Traverse geklettert, als ich siebzehn war! Mit einem Bier in der Hand!'),
      N('Aria lässt den Schläger an die Wand fallen und marschiert Richtung Kran. Opa Gustav ruft „Halt! Versicherung!“ hinter ihr her. Sie klettert trotzdem.'),
      N('Zwanzig Minuten später sitzt sie ganz oben im Ausleger, schwenkt den Arm und brüllt über den ganzen Schrottmarkt, dass sie die Königin der Unterstadt ist. Sie bleibt da oben. Sie hat Hunter vergessen.'),
    ], { effects: [set('tc_aria_abgelenkt'), rel(A, 20)] }),
    node('einweihen', [
      P('Hunter macht Tai Chi. Morgens. Damit er nicht mehr zur Diva wird.'),
      N('Aria sieht dich an. Dann prustet sie los. Dann hört sie auf. Dann sieht sie dich wieder an.'),
      L(A, 'Ernsthaft?'),
      P('Ernsthaft. Und wenn du lachst, kriegst du Hausverbot. Sagt er.'),
      L(A, '… Okay. Okay. Ich lach nicht.', 'besorgt'),
      L(A, 'Weißt du, nach dem Arm … da hatte ich drei Jahre lang so eine Physiotherapeutin. Die hat auch so langsames Zeug mit mir gemacht. Ich hab sie gehasst. Und dann hab ich wieder schlafen können.'),
      L(A, 'Sag ihm, ich komm mit. Ich halt die Klappe. Fast.'),
    ], { effects: [set('tc_aria_eingeweiht'), rel(A, 40)] }),
    node('vex-rival', [
      L(A, 'Gegen DICH? Postbotin, du kletterst wie ein Paket. Ich warte oben auf dich und mach ein Foto.'),
      N('Sie rennt los, bevor du „los“ sagen kannst. Natürlich. Du rennst hinterher. Natürlich.'),
      N('Oben im Ausleger keucht ihr beide. Sie war eine halbe Sekunde schneller. Sagt sie. Du sagst was anderes. Ihr streitet zwanzig Minuten lang über eine halbe Sekunde, und keine von euch denkt mehr an Hunter.'),
      L(A, 'Revanche. Morgen. Und übermorgen. Bis du zugibst, dass ich gewonnen hab.', 'signatur'),
    ], { effects: [set('tc_aria_abgelenkt'), rel(A, 30)] }),
    node('vex-rom', [
      N('Du stehst so nah, dass ihr Schläger zwischen euch klemmt. Sie weicht nicht zurück. Natürlich nicht.'),
      L(A, 'Krieg? Du willst was KRIEGEN? Für Hunters schmutziges Geheimnis?'),
      P('Hab ich so gesagt.'),
      N('Aria leckt sich über die Lippe, langsam, mit Absicht, und sieht dabei auf deinen Mund.'),
      L(A, 'Was willst du denn, Rennsemmel?', 'zaertlich'),
    ], {
      choices: [
        { text: '„Dass du für ’ne Stunde vergisst, dass Hunter existiert.“', next: 'vex-rom-kran' },
        { text: '„Dass du mitkommst. Hunter macht Tai Chi. Du hältst die Klappe. Und ich halt deine Hand, falls du lachen musst.“', next: 'vex-rom-einweihen' },
      ],
    }),
    node('vex-rom-kran', [
      L(A, 'Eine Stunde? Das ist alles?', 'verlegen'),
      N('Sie greift mit der Hand im Handschuh in deinen Gurtriemen, zieht dich die letzten Zentimeter heran, bis ihre Stirn an deiner liegt. Ihr Atem riecht nach Brause und Schlafmangel.'),
      L(A, 'Komm mit. Gustavs Kran. Ganz oben. Da guckt keiner. Da hört keiner. Da ist nur Wind und du und ich und dieser bescheuerte Ausleger.'),
      N('Ihr klettert. Oben, im Führerhaus mit den blinden Scheiben, drückt sie dich gegen die Wand, und dann küsst sie dich, hart, hungrig, als hätte sie den ganzen Morgen nichts anderes gedacht. Deine Finger finden ihre Zöpfe. Ihre Hand rutscht unter dein Gurtzeug, flach auf dein Top, genau da, wo dein Herz gegen ihre Handfläche hämmert.'),
      L(A, 'Scheiße. Du bist so … Halt still. Nein. Halt nicht still.', 'zaertlich'),
      N('Irgendwann ruft Opa Gustav von unten, ob da oben alles in Ordnung ist. Aria ruft „NEIN!“ zurück und lacht so laut, dass die Scheiben klirren. Hunter hat eine sehr ruhige, sehr ungestörte Morgenstunde.'),
    ], { effects: [set('tc_aria_abgelenkt'), rel(A, 50), msg('Aria hat Hunter vergessen. Komplett. Du auch.')] }),
    node('vex-rom-einweihen', [
      L(A, 'Hunter macht WAS?'),
      N('Sie prustet. Du legst ihr zwei Finger auf den Mund. Sie hört auf zu prusten. Sie hört auf zu atmen. Dann beißt sie dir ganz leicht in die Fingerspitze, ohne den Blick von dir zu nehmen.'),
      L(A, 'Okay. Ich komm mit. Ich halt die Klappe. Aber du hältst meine Hand. Die ganze Stunde. Auch wenn er auf einem Bein steht und ich sterbe.', 'zaertlich'),
    ], { effects: [set('tc_aria_eingeweiht'), rel(A, 50)] }),
  ],
};

const innereMitte: CutsceneDef = {
  id: 'tc-innere-mitte',
  title: 'Innere Mitte',
  beats: [
    tafel('Hinterhof-Studio, Lötgassen. Sieben Uhr morgens. Das Licht fällt schräg durch eine kaputte Scheibe.', undefined, 'in'),
    tafel('Hunter steht auf einem Bein, die Arme ausgebreitet, die Sonnenbrille auf der Stirn. Seine Augen sind zu. Er ist hungrig. Er ist ruhig.', [
      L(H, 'Ich hab’s.'),
      P('Was hast du?'),
      L(H, 'Die Mitte. Sie ist hier. Irgendwo zwischen Bauch und Kasse.'),
    ]),
    tafel('Er öffnet die Augen. Zum ersten Mal, seit du ihn kennst, sieht er nicht aus wie ein Mann, der die Welt in Rechnung stellt.', [
      L(H, 'Danke, Neuling. Und jetzt hol mir eine Nougatbombe. Ganz ruhig. Ohne Eile. Aber hol sie.'),
    ]),
  ],
};

export const part: ContentPart = {
  quests: { [Q]: quest },
  dialogues: { [watt.id]: watt, [kessel.id]: kessel, [studio.id]: studio, [nachStunde1.id]: nachStunde1, [aria.id]: aria },
  cutscenes: { [innereMitte.id]: innereMitte },
  mapAdditions: {
    loetgassen: {
      hotspots: [
        { id: 'hinterhof-studio', at: 'hinterhof-studio', label: 'Hinterhof-Studio', kind: 'use', dialogue: studio.id, when: all(active(Q), LEHRER, MORGENS) },
        {
          id: 'tc-studio-zu', at: 'hinterhof-studio', label: 'Hinterhof-Studio', kind: 'look', when: all(active(Q), LEHRER, not(MORGENS)),
          lines: [N('Ein Zettel an der Tür: „Tai Chi nur morgens. Die innere Mitte hat danach frei.“')],
        },
        { id: 'tc-kessel', at: 'hinterhof-studio', label: 'Kessel: Yogakurs', kind: 'talk', dialogue: kessel.id, when: all(active(Q), not(LEHRER), KESSEL_FREI, MORGENS) },
      ],
    },
    schrottmarkt: {
      hotspots: [
        { id: 'tc-meister-watt', at: 'watt-pose', label: 'Meister Watt fragen', kind: 'talk', dialogue: watt.id, when: all(active(Q), not(LEHRER), time('morgen', 'tag', 'abend')) },
        { id: 'tc-aria', at: 'inkasso-gasse', label: 'Aria abwimmeln', kind: 'talk', dialogue: aria.id, when: all(active(Q), S1, not(ARIA_GELOEST), MORGENS) },
      ],
    },
    'neon-gasse': {
      hotspots: [
        { id: 'tc-aria-tag', at: 'gassenmitte', label: 'Aria abwimmeln', kind: 'talk', dialogue: aria.id, when: all(active(Q), S1, not(ARIA_GELOEST), time('tag')) },
      ],
    },
  },
};
