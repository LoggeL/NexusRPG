// Jakko (Straßenkind, Jüngster der drei, will Koch werden): NpcDef, Tagesgespräche, he-jakko-2…10 (world.md §4.4).
// Nur Freundschaft (child: true). he-jakko-6 startet pers-jakko-kochbuch (baut der Quest-Agent).
import type { NpcDef } from '../../../modules/contracts';
import type { ContentPart } from '../../part';
import { JAKKO_HE_23, JAKKO_SCHEDULE_23, JAKKO_TALK_FRUEH, JAKKO_TALK_POOL } from './jakko-akt23';
import {
  KINDERZEIT, L, N, OEDNIS, SCHROTT, chk, dialogs, dlg, herz, node, zeitHinweis, zeitHinweisWann,
} from './_dsl';

const J = 'jakko';
const KRANTAGE = ['mo', 'mi', 'fr'] as const;

const npc: NpcDef = {
  id: J,
  name: 'Jakko',
  unknownName: 'Junge mit Kochlöffel',
  portrait: 'jakko',
  sprite: 'jakko-walk',
  faction: 'unterstadt',
  child: true,
  bio: 'Jüngster der drei Straßenkinder. Will Koch werden, hilft bei Babette und bei Gustav am Kran. Hat immer Hunger.',
  gifts: {
    loves: ['bao-dampfnudel', 'nougatbombe', 'dantes-kekse', 'pluesch-pixelpalast'],
    likes: ['synth-nudeln', 'chips-tuete', 'aufzieh-roboter', 'kaktusfrucht', 'echtobst-apfel', 'hofhonig'],
    dislikes: ['tai-chi-tee', 'kassenbuch'],
    hates: ['algen-chips', 'virus-implantat', 'rostige-dose'],
  },
  schedule: [
    ...JAKKO_SCHEDULE_23,
    { slot: 'morgen', place: { map: 'schrottmarkt', at: 'garkueche-hocker' } },
    { slot: 'tag', days: KRANTAGE, place: { map: 'schrottmarkt', at: 'kran' } },
    { slot: 'tag', place: { map: 'schrottmarkt', at: 'garkueche-hocker' } },
    { slot: 'abend', days: ['do'], place: { map: 'dantes-werkstatt', at: 'eins-tisch' } },
    { slot: 'abend', when: KINDERZEIT, place: { map: 'schrottmarkt', at: 'garkueche-hocker' } },
    { slot: ['abend', 'nacht'], place: { map: 'das-nest', at: 'schlafnischen' } },
  ],
  heartEvents: [
    {
      id: 'he-jakko-2', hearts: 2, map: 'schrottmarkt', time: 'morgen', when: { not: { weekday: 'mo' } },
      dialogue: 'dlg-he-jakko-2', effects: [{ xp: 25 }],
    },
    {
      id: 'he-jakko-4', hearts: 4, map: 'schrottmarkt', time: 'tag', when: { weekday: KRANTAGE },
      dialogue: 'dlg-he-jakko-4', effects: [{ xp: 35 }],
    },
    {
      id: 'he-jakko-6', hearts: 6, map: 'schrottmarkt', time: 'abend', when: { all: [KINDERZEIT, { not: { weekday: ['mo', 'do'] } }] },
      dialogue: 'dlg-he-jakko-6', effects: [{ xp: 45 }],
    },
    ...JAKKO_HE_23,
    { id: 're-jakko-2', hearts: -2, map: 'schrottmarkt', time: ['morgen', 'tag'], dialogue: 'dlg-re-jakko-2' },
  ],
  talk: [
    { dialogue: 'jakko-schmollen', when: { rival: J } },
    { dialogue: 'jakko-zeit', minHearts: 8, when: zeitHinweisWann('jakko-zeit') },
    ...JAKKO_TALK_FRUEH,
    { dialogue: 'jakko-kochbuch', when: { quest: 'pers-jakko-kochbuch', state: 'active' } },
    { dialogue: 'jakko-montag', when: { all: [{ weekday: 'mo' }, { time: ['morgen', 'abend'] }] } },
    { dialogue: 'jakko-morgen', when: { time: 'morgen' } },
    { dialogue: 'jakko-kran', when: { all: [{ time: 'tag' }, { weekday: KRANTAGE }] } },
    { dialogue: 'jakko-dante', when: { all: [{ time: 'abend' }, { weekday: 'do' }] } },
    { dialogue: 'jakko-abend', when: { time: 'abend' } },
    ...JAKKO_TALK_POOL,
    { dialogue: 'jakko-tag-4', minHearts: 4 },
    { dialogue: 'jakko-tag-0' },
  ],
};

const dialogues = dialogs(
  // ------------------------------------------------------------------------------------------- Tagesgespräche
  dlg('jakko-tag-0', [
    node('a', [
      N('Jakko sitzt auf einem Hocker neben Babettes Dampfkörben und schnuppert, als könne er davon satt werden.'),
      L(J, 'Riechst du das? Das ist Dampfnudel mit Pilzen. Die riecht wie ein warmes Bett. Ein warmes Bett mit Soße.', 'freude'),
    ], {
      choices: [
        { text: '„Hast du schon gegessen?“', next: 'gegessen' },
        { text: '[Ödnis] „Draußen in der Ödnis braten wir Kaktus. Mit Salz.“', tag: '[Ödnis]', when: OEDNIS, next: 'kaktus', once: true, id: 'kaktus' },
        { text: '„Guten Hunger, Jakko.“', effects: [herz(J, 5)] },
      ],
    }),
    node('gegessen', [
      L(J, 'Ja! Zweimal! Also, einmal ganz und einmal die Ecke von Darias. Die zählt nicht, die war nur Teig.'),
      L(J, 'Ich hab eigentlich immer Hunger. Babette sagt, ich hab ein Loch im Bauch. Ich hab nachgeguckt. Da ist keins.', 'besorgt'),
    ]),
    node('kaktus', [
      L(J, 'KAKTUS? Man kann KAKTUS essen?! Wie schmeckt das? Wie eine Gurke? Wie eine piksige Gurke? Hast du ein Rezept? Schreibst du’s mir auf?', 'ueberrascht'),
      L(J, 'Du bist ab jetzt meine Lieblingsperson. Nach Babette. Und nach Captain Kuschel. Platz drei! Das ist sehr gut!', 'freude'),
    ], { effects: [herz(J, 30)] }),
  ]),

  dlg('jakko-tag-4', [
    node('a', [
      L(J, 'Ich hab heute gelernt, wie man Zwiebeln schneidet, ohne zu weinen. Man weint trotzdem, aber man tut so, als wär’s Absicht.', 'signatur'),
    ], {
      choices: [
        { text: '„Was ist dein Lieblingsessen?“', next: 'liebling' },
        { text: '„Was kochst du, wenn du groß bist?“', next: 'gross' },
      ],
    }),
    node('liebling', [
      L(J, 'Dampfnudel. Dann Nougatbombe. Dann Dantes Kekse. Dann Dampfnudel nochmal, weil man die zweimal mögen darf.', 'freude'),
      L(J, 'Algen-Chips sind das Schlimmste. Die schmecken wie ein Fisch, der traurig war.', 'wut'),
    ]),
    node('gross', [
      L(J, 'Alles! Für alle! Ich mach ein Restaurant, da darf jeder rein. Auch Leute ohne Geld. Die zahlen mit Geschichten.'),
      L(J, 'Und Ripper zahlt doppelt. Weil er gemein ist. Das hat Freya gesagt, das ist gerecht.', 'signatur'),
    ]),
  ]),

  dlg('jakko-morgen', [
    node('a', [
      N('An der Garküche schält Jakko Kartoffeln. Er hat eine Schürze an, die ihm bis zu den Knöcheln geht. Babette rührt im großen Topf.'),
      L(J, 'Morgen! Ich bin Küchenhilfe! Babette sagt, Küchenhilfen kriegen kein Geld, aber das Angebrannte!', 'freude'),
      L('babette-bao', 'Das Angebrannte und eine Ohrfeige, wenn er wieder vom Teig nascht. Was willst du, Herzchen? Hunger? Du siehst aus wie Hunger.'),
    ], {
      choices: [
        { text: '„Kann ich mithelfen?“', effects: [herz(J, 10), herz('babette-bao', 10), { advanceTime: 20 }], next: 'helfen' },
        { text: '„Nur schnell Hallo sagen.“' },
      ],
    }),
    node('helfen', [
      N('Zwanzig Minuten Kartoffeln. Jakko erklärt dir jede einzelne. „Die sieht aus wie Dexter. Die sieht aus wie Dexter, wenn Aria kommt.“'),
      L(J, 'Du schälst wie ein Profi. Also wie ein Profi, der noch übt. Das ist so gut wie eine Dampfnudel!', 'freude'),
    ]),
  ]),

  dlg('jakko-montag', [
    node('a', [
      N('Die Plane der Garküche ist unten. Jakko sitzt davor auf seinem Hocker und starrt die Plane an, als könne er sie mit Willenskraft öffnen.'),
      L(J, 'Montag ist der schlimmste Tag. Babette ist am Fischmarkt. Die Garküche ist zu. Die Welt ist kalt.', 'trauer'),
    ], {
      choices: [
        { text: '„Ich hab was für dich.“', when: { any: [{ item: 'bao-dampfnudel' }, { item: 'nougatbombe' }, { item: 'chips-tuete' }] }, next: 'was' },
        { text: '„Nächsten Dienstag macht sie wieder auf.“', next: 'dienstag' },
      ],
    }),
    node('was', [
      L(J, 'Echt? ECHT? Für mich? Du bist wie ein Montag, der sich als Dienstag verkleidet hat!', 'freude'),
      N('(Über das Geschenk-Menü kannst du es ihm geben.)'),
    ]),
    node('dienstag', [L(J, 'Morgen schon. Dienstag ist morgen. Das weiß ich, weil ich die Tage nach Essen zähle.', 'signatur')]),
  ]),

  dlg('jakko-kran', [
    node('a', [
      N('Am Fuß des Krans sitzt Jakko auf einem Ölfass und hält eine Kurbel fest, als hänge sein Leben daran. Oben in der Kabine winkt Opa Gustav.'),
      L(J, 'Gustav lässt mich die Kurbel halten! Die macht nichts, aber ich halt sie! Das ist Verantwortung!', 'freude'),
      L('opa-gustav', 'Gut so, Junge! Wenn die Kurbel wegläuft, ist das deine Schuld!'),
    ], {
      choices: [
        { text: '„Was macht die Kurbel eigentlich?“', next: 'kurbel' },
        { text: '„Halt sie gut fest.“', effects: [herz(J, 5)] },
      ],
    }),
    node('kurbel', [
      L(J, 'Weiß ich nicht. Gustav sagt, früher hat sie das Radio angemacht. Jetzt ist sie einfach eine Kurbel. Wie ich ein Jakko bin.', 'signatur'),
      L('opa-gustav', 'Früher war hier alles grün! Und Kurbeln hatten noch einen Sinn!'),
    ]),
  ]),

  dlg('jakko-dante', [
    node('a', [
      N('Eins!-Abend bei Dante. Jakko spielt nicht wirklich mit. Jakko sitzt am Ofen und guckt durch die Scheibe auf die Kekse.'),
      L(J, 'Noch vier Minuten. Ich zähle. Wenn ich nicht zähle, verbrennt Dante sie. Dann geht der Keksalarm, und Dante schreit „Drei-Sekunden-Regel!“', 'besorgt'),
      L('dante', 'Ich schreie nicht. Ich informiere laut.'),
    ], {
      choices: [
        { text: '(Mitzählen.)', effects: [herz(J, 10), herz('dante', 5)], next: 'zaehlen' },
        { text: '„Die Kekse sind dir wichtiger als das Spiel, hm?“', next: 'wichtig' },
      ],
    }),
    node('zaehlen', [
      N('Drei, zwei, eins – Jakko reißt die Ofentür auf, bevor der Alarm losgeht. Zum ersten Mal in der Geschichte der Werkstatt bleibt es still.'),
      L('dante', 'Heiliges Kanonenrohr. Das ist … das ist ein Wunder. Jemand schreib das auf.'),
      L(J, 'Das war so gut wie zwei Dampfnudeln. Gleichzeitig!', 'freude'),
    ]),
    node('wichtig', [L(J, 'Karten kann man nicht essen. Ich hab’s probiert. Eine „Plus Zwei“. Die schmeckt nach Plastik und Niederlage.')]),
  ]),

  dlg('jakko-abend', [
    node('a', [
      N('Die Garküche ist voll, die Laternen brennen. Jakko trägt Schüsseln, die größer sind als sein Kopf, und balanciert sie wie ein Kellner im Sturm.'),
      L(J, 'Achtung, heiß! Achtung, Suppe! Achtung, ich!', 'freude'),
    ], {
      choices: [
        { text: '(Ihm eine Schüssel abnehmen.)', effects: [herz(J, 5), herz('babette-bao', 5)], next: 'tragen' },
        { text: '„Um acht ab ins Nest, Kellner.“', next: 'acht' },
      ],
    }),
    node('tragen', [L(J, 'Danke! Jetzt hab ich eine Hand frei. Für die Dampfnudel, die mir Babette gleich gibt. Wenn ich brav bin.', 'signatur')]),
    node('acht', [
      L(J, 'Jaha. Babette bringt uns um acht noch was ins Nest. Sie sagt, das ist kein Essen, das sind „Reste“. Aber die Reste sind immer ganz.', 'freude'),
    ]),
  ]),

  dlg('jakko-kochbuch', [
    node('a', [
      L(J, 'Hast du schon ein Rezept? Babette hat mir eins von ihren gegeben, aber nur die Hälfte. Die andere Hälfte sagt sie mir, wenn ich groß bin.', 'freude'),
      L(J, 'Ich brauch noch eins von Mutter Brühe in der Suppenküche. Und eins von Rudi, aber der ist in der Ödnis. Die Ödnis ist weit. Weiter als bis zum Hafen!', 'besorgt'),
    ], {
      choices: [
        { text: '„Ich kümmer mich drum.“', effects: [herz(J, 5)] },
        { text: '„Was machst du mit dem Kochbuch?“', next: 'wozu' },
      ],
    }),
    node('wozu', [L(J, 'Wenn ich alle Rezepte hab, kann ich für alle kochen. Dann muss niemand mehr Reste einpacken. Auch ich nicht.', 'signatur')]),
  ]),

  dlg('jakko-schmollen', [
    node('a', [
      N('Jakko sitzt mit dem Rücken zu dir auf seinem Hocker und isst demonstrativ eine Dampfnudel. Sehr laut.'),
      L(J, 'Ich red nicht mit dir. Ich ess nur noch. Für immer.', 'wut'),
    ], {
      choices: [
        {
          text: '„Drei Dampfnudeln. Eine für jeden von euch. Frieden?“',
          requires: { item: 'bao-dampfnudel', min: 3 },
          effects: [{ take: 'bao-dampfnudel', qty: 3 }, { reconcile: J }, herz('daria', 10), herz('freya', 10)],
          next: 'frieden',
        },
        { text: '„Jakko, es tut mir leid.“', next: 'sorry' },
        { text: '(Gehen.)' },
      ],
    }),
    node('sorry', [L(J, 'Tut-mir-leid ist nicht mal ein Snack.', 'trauer')]),
    node('frieden', [L(J, 'Frieden! Ich wollte sowieso nicht für immer böse sein. Für immer ist so lang wie zwischen Frühstück und Mittag.', 'freude')]),
  ]),

  zeitHinweis('jakko-zeit', [
    L(J, 'Weißt du was? Wenn ich mein Restaurant hab, kriegst du einen Stammplatz. Mit Kissen. Und deinem Namen auf dem Stuhl. Mit Soße geschrieben.', 'freude'),
  ]),

  // ------------------------------------------------------------------------------------------- Herz-Ereignisse
  dlg('dlg-he-jakko-2', [
    node('a', [
      N('Morgens an der Garküche. Babette steht mit verschränkten Armen neben dem Dampfkorb, Jakko steht mit verschränkten Fingern davor. Im Korb liegt etwas Rundes. Fast rund. Rund im weitesten Sinne.'),
      L(J, '{name}! Du musst probieren! Das ist meine erste eigene Dampfnudel! Ganz allein! Babette hat nur geguckt und dreimal geseufzt!', 'freude'),
      L('babette-bao', 'Viermal. Einmal leise.'),
      N('Die Dampfnudel ist auf einer Seite blass, auf der anderen golden, und in der Mitte hat sie einen Krater. Aus dem Krater dampft es. Es riecht … gut. Erstaunlich gut.'),
    ], {
      choices: [
        { text: '(Abbeißen und ehrlich sein.) „Außen super. Innen noch ein bisschen roh.“', next: 'ehrlich' },
        { text: '(Abbeißen und strahlen.) „Die beste Dampfnudel der Stadt.“', next: 'nett' },
        {
          text: '(Die ganze Dampfnudel auf einmal in den Mund stopfen.)',
          check: chk('he-jakko-2-stopfen', 'koerper', 3, ['kraft']),
          next: 'stopfen',
        },
        { text: '„Mit Kaktusfrucht in der Füllung wär die genial.“', tag: '[Ödnis]', when: OEDNIS, next: 'kaktus' },
        { text: '„Babette, was sagst du?“', next: 'babette' },
      ],
    }),
    node('ehrlich', [
      L(J, 'Roh? Wie roh? Roh wie ein bisschen oder roh wie Teig?', 'besorgt'),
      L('babette-bao', 'Roh wie „zu früh aus dem Korb, weil jemand nicht warten konnte“. Siehste, Jakko? Die Leute merken das.'),
      L(J, 'Okay. Okay! Nächstes Mal warte ich. Ich zähl bis hundert. Bis zweihundert! Danke, dass du’s gesagt hast. Daria hätte gelogen. Daria lügt beim Essen immer, damit sie mehr kriegt.', 'freude'),
    ], { effects: [herz(J, 40), herz('babette-bao', 10)], next: 'ende' }),
    node('nett', [
      L(J, 'Echt?! Die BESTE?! Babette, hast du gehört?!', 'freude'),
      L('babette-bao', 'Ich hab gehört. Und ich hab gesehen, wie {name} beim Kauen geguckt hat. Herzchen, die Mitte ist roh. Aber für die erste ist sie gut. Richtig gut.'),
      L(J, 'Roh … Na gut. Aber „richtig gut“ hast du auch gesagt. Das schreib ich mir auf. Auf die Hand. Mit Soße.', 'signatur'),
    ], { effects: [herz(J, 30)], next: 'ende' }),
    node('stopfen', [
      N('Du schiebst die ganze Dampfnudel in den Mund. Sie ist heiß. Sehr heiß. Deine Augen tränen. Jakko starrt dich an wie einen Zauberer.'),
      L(J, 'Du hast sie … GANZ … Das hat noch keiner geschafft! Nicht mal Hunter! Hunter hat nur zwei Drittel geschafft und dann gehustet!', 'ueberrascht'),
      L('babette-bao', 'Und du hast trotzdem gemerkt, dass die Mitte roh war. Ich seh’s an deinem Gesicht.'),
      L(J, 'Egal! Du bist ein Held! Ein Dampfnudel-Held! Das ist so gut wie … wie zehn Dampfnudeln!', 'freude'),
    ], { effects: [herz(J, 45), { heal: 10 }], next: 'ende' }),
    node('kaktus', [
      L(J, 'KAKTUS?! In die Füllung?! Babette, darf ich? Darf ich? Darf ich?', 'ueberrascht'),
      L('babette-bao', 'Wenn {name} dir eine Kaktusfrucht besorgt, darfst du. Und wenn sie nach Gartenschlauch schmeckt, isst du sie allein.'),
    ], { effects: [herz(J, 45), { setFlag: 'jakko_kaktus_idee' }], next: 'ende' }),
    node('babette', [
      L('babette-bao', 'Ich sag: zu früh rausgenommen, zu viel Hefe, zu wenig Geduld. Und ich sag: Ich hab mit zwölf schlechtere gemacht. Viel schlechtere. Meine erste ist explodiert.'),
      L(J, 'EXPLODIERT? Deine?! Dann bin ich ja schon besser als du warst!', 'freude'),
      L('babette-bao', 'Werd nicht frech. Aber ja.'),
    ], { effects: [herz(J, 35), herz('babette-bao', 10)], next: 'ende' }),
    node('ende', [
      L(J, 'Hier. Die zweite. Die hab ich länger drin gelassen. Für dich. Die ist nicht roh. Ich hab gewartet. Bis sechzig. Das ist fast hundert.', 'freude'),
      N('Er drückt dir eine warme Dampfnudel in die Hand. Sie ist ein bisschen schief. Sie ist perfekt.'),
    ], { effects: [{ give: 'bao-dampfnudel' }] }),
  ]),

  dlg('dlg-he-jakko-4', [
    node('a', [
      N('Am Kran sitzt Jakko auf einem Ölfass. Nein – er sitzt nicht drauf, er misst es aus. Mit einem Stück Schnur. Opa Gustav lehnt am Wohnwagen und raucht eine Pfeife, die nicht brennt.'),
      L(J, 'Ich bau einen Herd! Für das Nest! Dann kann ich abends selber kochen, und Babette muss nicht mehr extra kommen. Die hat eh schon so viel Rücken.', 'freude'),
      L('opa-gustav', 'Der Junge will aus meinem Ölfass einen Herd machen. Aus meinem besten Ölfass. Das hab ich seit 2061. Das ist älter als die meisten Ehen hier.', 'signatur'),
      L(J, 'Aber das ist leer!'),
      L('opa-gustav', 'Leer ist es seit 2062. Das hat sentimentalen Wert.'),
    ], {
      choices: [
        {
          text: '(Das Fass aufschneiden, Rost abschleifen, ein Gitter einsetzen, einen Abzug biegen.)',
          check: chk('he-jakko-4-herd', 'technik', 4, ['reparieren', 'maschine']),
          next: 'gebaut',
        },
        { text: '„Ich hab sowas schon gebaut. Auf dem alten Platz.“', tag: '[Schrott]', when: SCHROTT, next: 'schrott' },
        { text: '„Gustav, zeigst du’s uns? Wir machen die Drecksarbeit.“', next: 'gustav' },
        {
          text: '(Zwei Schrott-Ersatzteile als Gitter und Abzug hergeben.)',
          requires: { item: 'schrott-ersatzteil', min: 2 },
          effects: [{ take: 'schrott-ersatzteil', qty: 2 }],
          next: 'teile',
        },
      ],
    }),
    node('gebaut', [
      N('Eine Stunde, drei Schrammen und ein Fluch später steht da ein Herd. Ein schiefer, rostiger, wunderschöner Herd. Mit Abzug, Rost und einer Klappe, die quietscht wie ein Kater.'),
      L('opa-gustav', '…Das ist ein guter Herd. Verdammt. Das ist ein besserer Herd als meiner.', 'ueberrascht'),
    ], { effects: [herz(J, 50), herz('opa-gustav', 15), { advanceTime: 60 }], next: 'ende' }),
    node('schrott', [
      L('opa-gustav', 'Vom alten Platz? Dann weißt du ja, wo man den Abzug hinbiegt. Nicht nach oben, nach hinten. Oben ist der Nachbar.', 'freude'),
      N('Du arbeitest wie früher: schnell, schmutzig, mit Gefühl. Jakko reicht dir Werkzeug, als hätte er nie was anderes gemacht.'),
    ], { effects: [herz(J, 50), herz('opa-gustav', 20), { advanceTime: 45 }], next: 'ende' }),
    node('gustav', [
      L('opa-gustav', 'Ich zeig’s euch. Aber ich mach nichts. Ich sag nur, was ihr falsch macht. Das ist die Aufgabe des Alters.', 'signatur'),
      N('Zwei Stunden lang sagt Gustav, was ihr falsch macht. Es ist alles. Am Ende steht ein Herd da, und Gustav hat einen Schlager von 2031 gesummt, in dem sich „Herd“ auf „verkehrt“ reimt.'),
      L('opa-gustav', 'Früher war hier alles grün. Und Herde hatten noch Gas. Aber der hier geht.', 'freude'),
    ], { effects: [herz(J, 45), herz('opa-gustav', 25), { advanceTime: 120 }], next: 'ende' }),
    node('teile', [
      N('Mit deinen Teilen geht es schneller. Ein Gitter, ein krummes Rohr, ein Scharnier, das Jakko „Herbert“ tauft. Nach einer halben Stunde brennt das erste Feuerchen im Fass.'),
    ], { effects: [herz(J, 45), herz('opa-gustav', 10), { advanceTime: 30 }], next: 'ende' }),
    node('ende', [
      L(J, 'Ein Herd! Ein echter Herd! Das ist so gut wie … wie … das ist besser als eine Dampfnudel! Das ist eine Dampfnudel-MASCHINE!', 'freude'),
      L('opa-gustav', 'Den schleppen wir heute Abend ins Nest. Ich nehm den Kran. Den Kran nehm ich immer, ich hab Rücken.'),
      L(J, 'Ich koch dir als Erstes was. Du kriegst die erste Portion. Und Gustav die zweite. Und ich die dritte bis zehnte.', 'signatur'),
    ], { effects: [{ setFlag: 'jakko_herd' }] }),
  ]),

  dlg('dlg-he-jakko-6', [
    node('a', [
      N('Abends an der Garküche. Babette ist gerade beim Fischhändler nebenan. Und Jakko steht über einer Schüssel mit Resten und stopft sich Dampfnudeln in die Jackentaschen. Alle Taschen. Auch die, die eigentlich keine Taschen sind.'),
      N('Er sieht dich. Er erstarrt. Eine Dampfnudel rollt aus seinem Ärmel und bleibt vor deinen Füßen liegen.'),
      L(J, 'Das ist nicht, wonach es aussieht.', 'besorgt'),
      L(J, '…Das ist genau, wonach es aussieht.', 'trauer'),
    ], {
      choices: [
        { text: '„Jakko. Was ist los?“', next: 'los' },
        { text: '„Babette gibt dir doch eh was. Warum klaust du?“', next: 'warum' },
        { text: '(Die Dampfnudel aufheben und ihm wortlos zurück in die Tasche stecken.)', next: 'zurueck' },
      ],
    }),
    node('warum', [
      L(J, 'Ich klau nicht! Das sind Reste! Reste gehören keinem! Das steht … das steht bestimmt irgendwo!', 'wut'),
      N('Er hält es keine drei Sekunden durch. Seine Unterlippe zittert.'),
    ], { next: 'los' }),
    node('zurueck', [
      N('Jakko guckt auf seine Tasche. Dann auf dich. Dann setzt er sich auf den Hocker, als hätte ihm jemand die Luft abgelassen.'),
    ], { effects: [herz(J, 20)], next: 'los' }),
    node('los', [
      L(J, 'Ich geb meine Portion immer Daria und Freya. Weil die größer sind. Größere brauchen mehr. Das ist Mathematik.', 'trauer'),
      L(J, 'Und dann hab ich Hunger. Und dann pack ich Reste ein. Für nachts. Nachts ist es am schlimmsten. Nachts denkt der Bauch so laut.'),
      L(J, 'Bitte sag’s Babette nicht. Die denkt dann, ich bin undankbar. Ich bin nicht undankbar. Ich bin nur … hohl.'),
    ], {
      choices: [
        { text: '„Wir sagen’s ihr zusammen. Sie wird nicht böse sein.“', next: 'babette' },
        {
          text: '(Mit Babette reden, sobald sie zurück ist – so, dass Jakko nicht als Dieb dasteht.)',
          check: chk('he-jakko-6-babette', 'ausstrahlung', 4, ['trost', 'ueberreden']),
          next: 'geredet',
        },
        { text: '„Ich halt den Mund. Aber du musst was ändern.“', next: 'schweigen' },
      ],
    }),
    node('babette', [
      N('Babette kommt zurück, sieht die Taschen, sieht Jakkos Gesicht, sieht deins. Sie sagt erst mal gar nichts. Dann stellt sie den Fischkorb ab und nimmt Jakko in den Arm, Dampfnudeln und alles.'),
      L('babette-bao', 'Du dummes, dummes Kind. Du gibst dein Essen weg und hungerst? Das ist das Dümmste, was ich seit Dexters Chrome-Gutscheinen gehört hab.'),
      L('babette-bao', 'Ab heute kriegst du eine Portion, die gehört nur dir. Und wenn du sie weggibst, kriegst du eine zweite. Und ich guck zu, wie du sie isst.'),
      L(J, 'Eine ZWEITE?', 'ueberrascht'),
    ], { effects: [herz(J, 40), herz('babette-bao', 15)], next: 'kochbuch' }),
    node('geredet', [
      N('Als Babette zurückkommt, redest du zuerst. Von großen Schwestern, die mehr brauchen. Von kleinen Brüdern, die rechnen. Von Bäuchen, die nachts laut denken. Jakko steht daneben und nickt nur.'),
      L('babette-bao', 'Ich wusste, dass da Teig fehlt. Ich dachte, es ist Dexter.'),
      L('babette-bao', 'Jakko. Herzchen. Ab heute packst du ein, so viel du tragen kannst. Offiziell. Mit Tüte. Taschen machen Flecken.'),
    ], { effects: [herz(J, 50), herz('babette-bao', 20)], next: 'kochbuch' }),
    node('schweigen', [
      L(J, 'Okay. Okay. Ich ändere was. Ich weiß nur nicht, was. Ich bin der Kleinste. Als Kleinster weiß man noch nicht so viel.', 'besorgt'),
    ], { effects: [herz(J, 25)], next: 'kochbuch' }),
    node('kochbuch', [
      L(J, 'Weißt du, was ich mach? Ich lern kochen. Richtig. Alle Rezepte. Von Babette, von Mutter Brühe, von allen. Dann koch ich für uns drei. Dann muss nie wieder einer was einpacken.', 'signatur'),
      L(J, 'Ein Kochbuch! Ich schreib ein Kochbuch! Hilfst du mir? Du musst nicht kochen. Du musst nur probieren. Probieren ist das Wichtigste.', 'freude'),
    ], {
      choices: [
        { text: '„Ich bin deine Vorkosterin. Dein Vorkoster. Egal – ich bin dabei.“', next: 'quest' },
        { text: '„Ich helf dir. Versprochen.“', next: 'quest' },
      ],
    }),
    // Eigener Knoten, damit ein fehlender Quest-Eintrag die Herz-Effekte oben nicht verschluckt.
    node('quest', [L(J, 'Erstes Rezept: Babettes Dampfnudel. Das kann ich schon. Fast. Bis zur Mitte.', 'freude')], {
      effects: [{ startQuest: 'pers-jakko-kochbuch' }],
    }),
  ]),

  // he-jakko-8 und he-jakko-10: jakko-akt23.ts

  dlg('dlg-re-jakko-2', [
    node('a', [
      N('An der Garküche reicht dir Babette eine Dampfnudel. Du beißt rein. Sie ist mit Algen-Chips gefüllt. Hinter dem Dampfkorb kichert jemand und hört sofort auf, als du hinsiehst.'),
    ]),
  ]),
);

export const part: ContentPart = {
  npcs: { [J]: npc },
  dialogues,
};
