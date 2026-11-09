// Babette Bao – Garküche „Bao Babette – Dampfnudeln seit 2061“ am Schrottmarkt, kommt aus dem überfluteten
// Möwenhafen, füttert die Straßenkinder heimlich mit (world.md §4.4, §11.2). Tagesablauf nach design/plan/act1.json.
// Herz-Ereignisse he-babette-bao-2/4/6 in Akt 1, -8/-10 angelegt und an act2 gebunden. Kein Begleiter, keine Romanze.
// Dazu: „Abendessen bei Babette“ als Date-Ort der Aria-Romanze (world.md §4.7 Ablauf), nur mit aria_romanze_zusammen.
// Quests nur als Verweis/Start: pers-babette-markttag, pers-jakko-kochbuch (Rezept).
import type { ContentPart } from '../../part';
import type { Condition, DialogueChoice, DialogueNode, NpcDef } from '../../../modules/contracts';
import {
  type Menue, AB_AKT2, NICHT_AKT2, VEX, ZEIT_HINWEIS, dialog, erz, flag, herz, ich, knoten, neu, pruefung, rede, sammle,
  sprecher, tagesgespraech, erweitere,
} from './_helfer';
import { MENUE_23, akt23 } from './babette-akt23';

const B = sprecher('babette-bao');
const A = sprecher('aria');
const DA = sprecher('daria');
const FR = sprecher('freya');
const JA = sprecher('jakko');

const MARKTTAG = 'pers-babette-markttag';
const GARKUECHE_OFFEN: Condition = { all: [{ time: ['morgen', 'tag'] }, { not: { weekday: 'mo' } }] };
/** Aria-Romanze ist zusammen (Vex × Aria oder klassische Aria-Romanze), höchstens eine Aria-Szene am Tag. */
const ARIA_DATE: Condition = {
  all: [{ flag: 'aria_romanze_zusammen' }, { romance: 'aria' }, { time: 'abend' }, { not: { weekday: 'mo' } }, { notFlag: 'aria_heute' }],
};

// ---------------------------------------------------------------------------------------------- Menü

function menue(): Menue {
  const zurueck: DialogueChoice[] = [{ text: 'Noch was, Babette.', next: 'menue', id: 'zurueck' }, { text: 'Danke, Babette. Bis später.' }];

  const choices: DialogueChoice[] = [
    { text: 'Ich hab Hunger.', when: GARKUECHE_OFFEN, effects: [{ shop: 'garkueche-babette' }] },
    {
      text: 'Einen Tisch für zwei, Babette. Für mich und Aria.', tag: '[Romanze]', when: ARIA_DATE, once: true, id: 'b-date',
      effects: [{ setFlag: 'aria_heute' }, { dialogue: 'babette-bao-date-aria' }],
    },
    { text: 'Woher kommst du eigentlich?', next: 'herkunft', once: true, id: 'b-herkunft' },
    { text: 'Du fütterst die Kinder mit, oder? Daria, Freya, Jakko.', next: 'kinder', once: true, id: 'b-kinder' },
    {
      text: 'Was ist mit der Quantum-Imbisskette, die hier aufmachen will?', tag: '[Babette ♥3]', next: 'markttag',
      when: { quest: MARKTTAG, state: 'inactive' }, requires: { hearts: 'babette-bao', min: 3 },
      effects: [{ startQuest: MARKTTAG }],
    },
    {
      text: 'Jakko sammelt Rezepte. Verrätst du ihm eins?', next: 'rezept', once: true, id: 'b-rezept',
      when: { quest: 'pers-jakko-kochbuch', state: 'active' }, effects: [flag('rezept_babette'), herz('jakko', 10)],
    },
    { text: '„Draußen kochen wir Kaktus. Willst du wissen, wie?“', tag: '[Ödnis]', when: { origin: 'origin-oednis' }, once: true, id: 'b-oednis', next: 'kaktus' },
    { text: 'Danke, Babette. Bis später.' },
  ];

  const nodes: DialogueNode[] = [
    knoten('menue', [B('Was noch, Schätzchen? Red ruhig. Aber iss dabei. Reden auf leeren Magen gibt Falten.', 'neutral')], { choices }),
    knoten('herkunft', [
      B('Von der Küste. Weiter runter, als die Karten heute zeigen. Ein Hafen mit Möwen und Fischbuden. Möwenhafen hieß das.', 'neutral'),
      B('Heißt es nicht mehr. Da heißt jetzt alles Wasser.', 'trauer'),
      B('So. Genug davon. Iss deine Nudel, die wird kalt, und kalte Nudeln sind eine Beleidigung für meine Großmutter.'),
    ], { choices: zurueck }),
    knoten('kinder', [
      B('Ich? Die Kinder füttern? Wo denkst du hin. Ich koche nur immer zu viel. Ich kann nicht rechnen. Seit vierzig Jahren nicht.', 'signatur'),
      B('Und wenn zu viel übrig ist, bring ich es ins Nest, bevor es schlecht wird. Das ist kein Füttern. Das ist Müllvermeidung.'),
      B('Und wenn du das Daria erzählst, kriegst du eine Woche nur Brühe. Ohne Einlage.', 'wut'),
    ], { choices: zurueck }),
    knoten('markttag', [
      B('„Quick&Quantum“. Plastiknudeln aus dem Drucker, zwölf Geschmacksrichtungen, alle nach Pappe. Die wollen den ganzen Platz hier.', 'wut'),
      B('Hören wir auf zu kochen, hört der Markt auf zu atmen. Ich will ein Fest. Ein Markttag. Alle Stände, Musik, Essen bis zum Umfallen. Damit die sehen, was sie kaputtmachen wollen.'),
      B('Hilfst du mir? Du hast so ein Gesicht, dem die Leute zuhören. Und Beine, die Kisten tragen können.', 'signatur'),
    ], { choices: zurueck }),
    knoten('rezept', [
      B('Jakko. Der Kleine mit den großen Ohren und dem leeren Bauch.', 'freude'),
      B('Sag ihm: Teig drei Mal falten, nicht vier. Beim vierten Mal wird er stolz und geht nicht mehr auf. Wie Männer.', 'signatur'),
      B('Und Salz ins Wasser, nicht in den Teig. Und Liebe in alles. Das schreibst du genauso auf. Mit „Liebe“. Großgeschrieben.'),
    ], { choices: zurueck }),
    knoten('kaktus', [
      B('Kaktus? Kochen? Erzähl!', 'freude'),
      ich('Stacheln abflämmen, in Streifen schneiden, mit Salz und Rauch. Schmeckt wie grüne Bohnen mit Charakter.'),
      B('Mit Charakter! Ich mach dir eine Kaktus-Dampfnudel. Die erste der Unterstadt. Und wenn sie scheußlich ist, war es deine Idee.', 'signatur'),
    ], { choices: zurueck, effects: [herz('babette-bao', 20)] }),
  ];
  return { choices, nodes };
}

const M = erweitere(menue(), MENUE_23);

/** Rivalität: kleinere Portionen; Versöhnung über Abwasch, Kaktusfrucht oder eine ehrliche Entschuldigung. */
const RIVALE: Menue = {
  choices: [
    { text: 'Eine Stunde lang abwaschen. Ohne Murren.', next: 'abwasch', effects: [{ advanceTime: 60 }, { reconcile: 'babette-bao' }] },
    { text: 'Ihr eine Kaktusfrucht hinlegen.', when: { item: 'kaktusfrucht' }, next: 'kaktusfrucht', effects: [{ take: 'kaktusfrucht' }, { reconcile: 'babette-bao' }] },
    {
      text: '„Ich hab mich wie ein Arsch benommen, Babette. Es tut mir leid.“', next: 'sorry',
      check: pruefung('babette-versoehnung-sorry', 'ausstrahlung', 5, ['ueberzeugen']), effects: [{ reconcile: 'babette-bao' }],
    },
    { text: 'Dann eben nicht.' },
  ],
  nodes: [
    knoten('abwasch', [
      erz('Eine Stunde, drei Bottiche, ein Berg Dampfkörbe. Babette schaut dir dabei zu, die Arme verschränkt. Nach einer halben Stunde stellt sie dir wortlos eine Schale Brühe hin.'),
      B('Gut. Abgewaschen ist abgewaschen. Ab morgen kriegst du wieder normale Portionen. Mit Einlage.', 'neutral'),
    ]),
    knoten('kaktusfrucht', [
      B('Eine echte? Von draußen?', 'freude'),
      B('Na gut. Na gut! Komm her, du Schlingel. Wer Obst bringt, dem kann ich nicht böse sein. Das ist ein Naturgesetz.', 'freude'),
    ]),
    knoten('sorry', [
      B('…', 'neutral'),
      B('Wie ein Arsch, ja. Ein großer. Mit Soße.', 'wut'),
      B('Aber du sagst es. Das können die wenigsten. Setz dich. Iss. Die Portion ist groß. Schweig dabei.', 'freude'),
    ]),
  ],
};

// ---------------------------------------------------------------------------------------------- Tagesgespräche

const T = {
  rivale: tagesgespraech('babette-bao-tag-rivale',
    [B('Du. Eine Nudel. Eine kleine. Ohne Füllung. Mehr gibt es heute nicht für dich.', 'wut')],
    [B('Bei mir kriegt jeder, was er verdient. Du verdienst eine kleine Nudel. Und einen bösen Blick. Den kriegst du gratis.', 'wut')],
    RIVALE),
  oednis: tagesgespraech('babette-bao-tag-oednis',
    [
      B('Du bist von draußen. Ich seh’s an den Lippen. Rissig vom Sand. Komm her.', 'neutral'),
      erz('Sie drückt dir eine Dampfnudel in die Hand, noch bevor du etwas sagen kannst.'),
      B('Wer von draußen kommt, isst zuerst. Das ist bei mir Gesetz. Der Richter soll sich das anschauen.', 'signatur'),
    ],
    [B('Ich war auch mal von draußen. Von ganz woanders draußen. Man gewöhnt sich an die Stadt. Aber nicht an den Hunger.', 'trauer')],
    M, { effects: [herz('babette-bao', 50), flag('babette_herkunft'), { give: 'bao-dampfnudel' }] }),
  gosse: tagesgespraech('babette-bao-tag-gosse',
    [
      B('Dich kenn ich. Du hast früher an meinem Stand rumgelungert, mit großen Augen und kleinen Taschen. Und hast nie geklaut. Nie.', 'neutral'),
      B('Dafür hab ich dir manchmal eine runterfallen lassen. Aus Versehen. Drei Jahre lang aus Versehen.', 'signatur'),
    ],
    [B('Groß bist du geworden. Und dünn bist du geblieben. Das ändern wir. Heute. Sofort.', 'freude')],
    M, { effects: [herz('babette-bao', 50), flag('babette_herkunft'), { give: 'bao-dampfnudel' }] }),
  ariaRomanze: tagesgespraech('babette-bao-tag-aria',
    [
      B('Na sieh mal einer an. Du und das Mädchen mit dem Metallarm und dem Schläger.', 'signatur'),
      B('Die isst neuerdings im SITZEN. Mit Serviette. Vorgestern hat sie sich sogar bedankt. Ich hätte fast den Topf fallen lassen.'),
    ],
    [B('Wenn ihr mal einen Abend wollt, wo keiner zuhört: hinten bei mir, zwischen den Dampfkörben. Da zieht’s nicht, da guckt keiner, und der Dampf beschlägt die Brillen der Neugierigen.', 'freude')],
    M, { effects: [flag('babette_kommentar_aria')] }),
  zeit: tagesgespraech('babette-bao-tag-zeit',
    [
      B('Irgendwann zeig ich dir, wie die Dampfnudeln wirklich gehen. Das ganze Rezept. Auch den Teil, den ich niemandem sage.', 'neutral'),
      erz(ZEIT_HINWEIS),
    ],
    [B('Nicht heute. Heute hat die Stadt Bauchweh. Ich spür das. Wenn die Stadt Bauchweh hat, kocht man Brühe und wartet.', 'trauer')],
    M),
  markttag: tagesgespraech('babette-bao-tag-markttag',
    [B('Markttag! Wie viele Stände hast du schon? Und hat jemand Ja gesagt, der nicht Gustav ist? Gustav sagt immer Ja.', 'freude')],
    [B('Quick&Quantum hat heute Flyer verteilt. „Nudeln in 9 Sekunden.“ Neun Sekunden! Meine Nudeln brauchen vier Stunden und eine Großmutter.', 'wut')],
    M),
  fischmarkt: tagesgespraech('babette-bao-tag-fischmarkt',
    [B('Montag. Ruhetag. Heißt: Ich hab Ruhe vor allen, außer vor den Fischen. Riech mal. Das ist Meer. Na ja. Fast.', 'freude')],
    [
      B('Salzige Grete hat heute Rostkai-Barsch. Der schmeckt nach Diesel, aber er hat ein gutes Herz. Ich mach ihn mit Ingwer, dann vergisst er, wo er herkommt.'),
      B('Wie wir alle, Schätzchen.', 'signatur'),
    ],
    M),
  nest: tagesgespraech('babette-bao-tag-nest',
    [
      B('Pssst. Ich bin nicht hier. Ich bringe nur Reste. Die waren zu viel. Wie immer.', 'signatur'),
      erz('Drei Töpfe dampfen auf der Kiste. Hinter Babette stehen drei Kinder in einer sehr ordentlichen Schlange, die Löffel in der Hand.'),
    ],
    [B('Jakko, nicht schubsen! Freya, du hast schon zwei! Daria, du bist die Älteste, du isst zuletzt und am meisten! So sind die Regeln!', 'wut')],
    M),
  vertraut: tagesgespraech('babette-bao-tag-vertraut',
    [B('Da ist ja mein Lieblingsgast! Setz dich, setz dich. Du kriegst die gute Schale. Die ohne Sprung.', 'freude')],
    [B('Weißt du, warum ich koche? Weil man beim Essen nicht lügen kann. Wer hungrig ist, isst ehrlich. Und du isst ehrlich. Das mag ich.')],
    M),
  morgen: tagesgespraech('babette-bao-tag-morgen',
    [B('Morgen! Hast du schon gegessen? Lüg nicht, ich seh’s an den Augenringen. Hier. Eine mit Pilzen. Für die Augenringe.', 'neutral')],
    [B('Seit vier Uhr steh ich hier. Der Teig wartet nicht. Der Teig ist wie ein Säugling. Wenn man ihn vergisst, schreit er nicht, er wird nur traurig und flach.', 'signatur')],
    M),
  tag: tagesgespraech('babette-bao-tag-tag',
    [B('Mittagszeit! Alle wollen gleichzeitig. Stell dich hinten an, Schätzchen. Oder hilf beim Körbetragen, dann darfst du vor.', 'neutral')],
    [B('Die Rostzähne wollen Schutzgeld. Ich hab ihnen gesagt: Ihr kriegt eine Dampfnudel, und wenn ihr wiederkommt, kriegt ihr den Kochlöffel. Seitdem kaufen sie. Normal. Mit Geld.', 'signatur')],
    M),
  abend: tagesgespraech('babette-bao-tag-abend',
    [B('Abend. Jetzt kommen die Hungrigen nach der Schicht. Die sind die Besten. Die sagen nichts und essen alles.', 'neutral')],
    [B('Freitags sitzt der Richter da hinten auf der Bank. Er tut so, als wäre er inkognito. Mit Robe. Ich geb ihm extra Füllung. Wenn er nett ist.', 'signatur')],
    M),
  standard: tagesgespraech('babette-bao-tag-standard',
    [B('Bao Babette, Dampfnudeln seit 2061! Was darf’s sein? Und sag nicht „nichts“. „Nichts“ hab ich nicht im Angebot.', 'freude')],
    [B('Erst essen, dann jammern. Das ist die Reihenfolge. Andersrum wird man nur traurig und hungrig.', 'neutral')],
    M),
};

// ---------------------------------------------------------------------------------------------- Herz-Ereignisse

const he2 = dialog('he-babette-bao-2', [
  knoten('start', [
    erz('Dienstag, früh. Über der Garküche hängt der Dampf wie eine weiße Wolke. Babette sieht dich kommen, stemmt die Hände in die Hüften und schüttelt den Kopf.'),
    B('Nein. Nein, nein, nein. So nicht. Guck dich an. Du bist ja durchsichtig.', 'wut'),
    B('Montags ist Ruhetag. Deshalb ist dienstags Gratisfrühstück. Für alle, die zu dünn aussehen. Du siehst zu dünn aus. Setz dich.', 'neutral'),
    erz('Vor dir landet ein Dampfkorb. Dann noch einer. Dann ein dritter, mit Ei.'),
  ], {
    choices: [
      {
        text: 'Alles aufessen. Bis zum letzten Krümel.', next: 'aufessen',
        check: pruefung('he-babette-bao-2-aufessen', 'koerper', 4, ['ausdauer']), effects: [herz('babette-bao', 40)],
      },
      {
        text: 'Erst mal helfen: Der Dampfkessel pfeift schief.', next: 'kessel',
        check: pruefung('he-babette-bao-2-kessel', 'technik', 4, ['reparieren']), effects: [herz('babette-bao', 40)],
      },
      { text: '„Draußen haben wir für so ein Frühstück eine Woche gearbeitet.“', tag: '[Ödnis]', when: { origin: 'origin-oednis' }, next: 'heimweh', effects: [herz('babette-bao', 40)] },
      { text: '„Du hast mir das früher immer runterfallen lassen. Aus Versehen.“', tag: '[Gosse]', when: { origin: 'origin-gossenkind' }, next: 'heimweh', effects: [herz('babette-bao', 40)] },
      { text: 'Essen. Und sagen, dass es schmeckt. Weil es schmeckt.', next: 'schmeckt', effects: [herz('babette-bao', 30)] },
    ],
  }),
  knoten('aufessen', [
    erz('Drei Körbe. Neun Dampfnudeln. Eine Schale Brühe hinterher. Am Ende lehnst du dich zurück, und dein Gürtel stellt dir eine sehr ernste Frage.'),
    B('ALLES? Du hast ALLES gegessen?', 'freude'),
    B('Das hat seit Gustav im Jahr 2070 keiner geschafft. Und der hat danach zwei Tage im Kran geschlafen.', 'freude'),
  ], { next: 'ende', effects: [{ checkBuff: { id: 'babette-satt', label: 'Babettes Frühstück', value: 1, attribute: 'koerper' } }] }),
  knoten('kessel', [
    erz('Ein Ventil sitzt schief, eine Dichtung ist porös. Ein Lappen, ein Dreh, ein Schlag mit dem Schöpflöffel. Der Kessel hört auf zu pfeifen und fängt an zu summen.'),
    B('Er summt. Er hat seit 2075 nicht mehr gesummt. Damals hat er Hochzeitslieder gesummt. Jetzt summt er … was ist das?', 'freude'),
    B('Egal. Du hast meinen Kessel glücklich gemacht. Jetzt iss, bevor ich weinen muss.', 'freude'),
  ], { next: 'schmeckt' }),
  knoten('heimweh', [
    B('Ach, Schätzchen.', 'trauer'),
    erz('Sie setzt sich neben dich auf die Bank. Babette setzt sich sonst nie.'),
    B('Weißt du, warum ich das Frühstück mache? Weil mir einmal jemand eins gemacht hat. Als ich hier ankam, mit nichts als nassen Schuhen. Eine alte Frau mit einem Fischstand. Ich hab nie erfahren, wie sie hieß.'),
    B('Jetzt mach ich es. Für alle, die nasse Schuhe haben. Auch wenn’s nicht regnet.', 'neutral'),
  ], { next: 'schmeckt' }),
  knoten('schmeckt', [
    erz('Der Teig ist weich wie ein Kissen, die Füllung salzig und süß zugleich. Für einen Moment ist die Unterstadt ganz weit weg.'),
    ich('Babette. Das ist das Beste, was ich je gegessen hab.'),
    B('Natürlich ist es das. Ich koche seit vierzig Jahren. Aber sag es ruhig nochmal. Lauter. Die Quantum-Leute da drüben sollen das hören.', 'signatur'),
  ], { next: 'ende' }),
  knoten('ende', [
    B('So. Und jetzt nimm zwei mit. Eine für dich, eine für jemanden, der heute noch nichts hatte. Du findest schon wen.', 'neutral'),
    B('Dienstags. Immer. Und wenn du nicht kommst, komm ich dich holen. Mit dem Kochlöffel.', 'freude'),
  ], { effects: [{ heal: 'full' }, { give: 'bao-dampfnudel', qty: 2 }, { xp: 40 }, herz('babette-bao', 20), flag('babette_fruehstueck')] }),
]);

const he4 = dialog('he-babette-bao-4', [
  knoten('start', [
    erz('Siebzehn Uhr. Vor dem Nest steht Babette, schwer atmend, drei Töpfe zu ihren Füßen. Ein Henkel ist abgebrochen. Drinnen johlen die Kinder, die Löffel klappern schon gegen die Kiste.'),
    B('Die Gasse hoch, mit drei Töpfen und meinen Knien. Und dann bricht der Henkel. Natürlich. Der Henkel hat auf diesen Moment gewartet.', 'wut'),
    JA('BABETTE! Ist das Linsen? Sag, dass das Linsen ist!'),
    DA('Jakko, du sollst warten! Wir machen eine Schlange! Eine ordentliche!'),
    FR('Ich hab gewaschen! Die Hände! Beide!'),
    B('Schätzchen. Hilf mir. Der große Topf muss rein, ohne dass der Boden ihn frisst. Und ohne dass Jakko reinspringt.', 'neutral'),
  ], {
    choices: [
      {
        text: 'Den großen Topf ohne Henkel reinwuchten.', next: 'wuchten',
        check: pruefung('he-babette-bao-4-wuchten', 'koerper', 4, ['kraft']), effects: [herz('babette-bao', 40)],
      },
      {
        text: '„Okay, Leute: Nest-Regeln. Wer schubst, spült.“', next: 'schlange',
        check: pruefung('he-babette-bao-4-schlange', 'strasse', 4, ['anfuehren']),
        effects: [herz('babette-bao', 40), herz('daria', 10), herz('freya', 10), herz('jakko', 10)],
      },
      { text: 'Zweimal laufen. Erst den einen Topf, dann den anderen.', next: 'zweimal', effects: [{ advanceTime: 20 }, herz('babette-bao', 30)] },
    ],
  }),
  knoten('wuchten', [
    erz('Du packst den Topf mit beiden Armen von unten. Er ist heiß, schwer und riecht nach Lorbeer. Drei Schritte, ein Stolpern über einen Schuh, der keinem gehört, und dann steht er auf der Kiste. Kein Tropfen daneben.'),
    JA('UNSER HELD!'),
    B('Siehst du, so trägt man Essen. Wie ein Baby. Oder wie eine Bombe. Kommt aufs Essen an.', 'freude'),
  ], { next: 'essen' }),
  knoten('schlange', [
    ich('Ältere hinten, Kleinere vorne, wer schubst, spült, wer kleckert, wischt. Und Captain Kuschel kriegt nichts, der ist ein Plüschhase.'),
    DA('Hey! Das sind MEINE Regeln!', 'wut'),
    ich('Deshalb funktionieren sie ja.'),
    DA('… Okay. Das war gut. Merk ich mir.', 'freude'),
    erz('Die Schlange steht so gerade, dass Babette den großen Topf in aller Ruhe reinrollen kann.'),
  ], { next: 'essen' }),
  knoten('zweimal', [
    erz('Zweimal die Gasse hoch, zweimal runter. Beim zweiten Mal läuft Freya neben dir her und zählt laut deine Schritte. Es sind zweihundertvierzehn. Sie ist sehr stolz auf die Zahl.'),
    FR('Zweihundertvierzehn! Das ist eine Primzahl! Glaub ich!'),
  ], { next: 'essen' }),
  knoten('essen', [
    erz('Dann wird gegessen. Laut, schnell, mit vollen Backen. Babette steht dazwischen, schöpft nach, wischt Münder ab, droht mit dem Kochlöffel und lacht.'),
    FR('Babette? Hast du eigentlich Kinder?'),
    B('Ich?', 'freude'),
    erz('Sie schaut in die Runde. Drei verschmierte Gesichter, sechs große Augen.'),
    B('Ich hab jetzt dreiundzwanzig. Ihr seid drei davon. Die anderen zwanzig kommen später. Und jetzt iss, bevor Jakko deine Portion findet.', 'freude'),
  ], {
    choices: [
      { text: '„Ich nehm mir auch was. Nur ein bisschen.“', next: 'mitessen', effects: [{ heal: 30 }] },
      { text: 'Nichts nehmen. Den Kindern bleibt so mehr.', next: 'verzicht', effects: [herz('babette-bao', 10), herz('jakko', 10)] },
    ],
  }),
  knoten('mitessen', [
    JA('Das ist MEINE Kelle! … Okay. Eine halbe. Weil du getragen hast.'),
    B('Siehst du, so ist das. Wer trägt, isst mit. Das ist das älteste Gesetz der Welt. Älter als alles, was der Richter kennt.', 'signatur'),
  ], { next: 'ende' }),
  knoten('verzicht', [
    erz('Babette sieht es. Natürlich sieht sie es. Sie sagt nichts, aber als ihr später zurückgeht, drückt sie dir eine eingewickelte Dampfnudel in die Jackentasche.'),
    B('Für unterwegs. Und keine Widerrede. Die Widerrede ist bei mir ausverkauft.', 'neutral'),
  ], { next: 'ende', effects: [{ give: 'bao-dampfnudel' }] }),
  knoten('ende', [
    B('Danke, Schätzchen. Das war Hilfe, wie sie sein soll. Ohne großes Gerede. Mit Topf.', 'freude'),
  ], { effects: [{ xp: 60 }, herz('babette-bao', 20), herz('daria', 10), herz('freya', 10), herz('jakko', 10), { rep: 'unterstadt', delta: 2 }, flag('babette_nest_geholfen')] }),
]);

const he6 = dialog('he-babette-bao-6', [
  knoten('start', [
    erz('Ein ruhiger Nachmittag. Die Garküche ist leer bis auf dich. Babette wischt den Tresen, obwohl er längst sauber ist, und hat dabei eine alte, gewellte Fotokarte vor sich liegen.'),
    erz('Darauf: ein kleiner Hafen, bunte Boote, eine Garküche am Kai mit dem Schild „Bao – seit 2031“. Davor eine junge Frau mit Kochmütze und eine ältere mit genau demselben Kinn.'),
    B('Das bin ich. Und das ist meine Mutter. Möwenhafen, 2054.', 'trauer'),
    B('Vier Jahre später kam das Wasser. Nicht auf einmal. Langsam. Jedes Jahr eine Stufe höher. Erst die Kaimauer. Dann die Straße. Dann der Herd.'),
    B('Wir haben den Herd ins Obergeschoss getragen. Dann aufs Dach. Dann haben wir ihn losgelassen.', 'trauer'),
  ], {
    choices: [
      {
        text: '„Erzähl mir von Möwenhafen. Wie es gerochen hat. Wie es geklungen hat.“', next: 'erzaehlen',
        check: pruefung('he-babette-bao-6-erzaehlen', 'ausstrahlung', 5, ['zuhoeren']), effects: [herz('babette-bao', 50)],
      },
      { text: '„Draußen haben wir auch alles verloren. Den Brunnen. Das Land. Fast alle.“', tag: '[Ödnis]', when: { origin: 'origin-oednis' }, next: 'oednis', effects: [herz('babette-bao', 50)] },
      { text: 'Nichts sagen. Ihr die Hand auf den Arm legen.', next: 'hand', effects: [herz('babette-bao', 40)] },
      { text: '„Und deine Mutter?“', next: 'mutter', effects: [herz('babette-bao', 30)] },
    ],
  }),
  knoten('erzaehlen', [
    B('Gerochen? Nach Salz. Nach Diesel und Fisch und Ingwer. Nach dem Teig meiner Mutter, der um vier Uhr morgens schon in der ganzen Gasse hing.', 'neutral'),
    B('Und geklungen hat es nach Möwen. Unverschämte Viecher. Haben uns die Nudeln aus dem Korb geklaut, direkt vor den Gästen. Mutter hat sie mit dem Kochlöffel verjagt. Den da.'),
    erz('Sie zeigt auf einen alten, schwarzen Holzlöffel, der über dem Herd hängt. Sie benutzt ihn nie.'),
    B('Hier unten gibt es keine Möwen. Manchmal vermisse ich es, beklaut zu werden.', 'trauer'),
  ], { next: 'meer' }),
  knoten('oednis', [
    B('Dann weißt du es. Wie es ist, wenn die Welt einem den Boden wegnimmt. Bei dir war es Sand. Bei mir Wasser. Am Ende ist es dasselbe Loch.', 'trauer'),
    B('Und trotzdem kochen wir weiter. Weil irgendwer kochen muss. Sonst gewinnt das Loch.'),
  ], { next: 'meer' }),
  knoten('hand', [
    erz('Du legst ihr die Hand auf den Arm. Ihr Arm ist warm und mehlig. Sie hält still.'),
    B('…', 'trauer'),
    B('Weißt du, das macht keiner. Alle wollen, dass Babette stark ist. Babette ist auch stark. Aber manchmal ist Babette auch nur Babette.'),
  ], { next: 'meer' }),
  knoten('mutter', [
    B('Sie hat es bis hierher geschafft. Bis zu diesem Markt. Sie hat noch drei Jahre lang Dampfnudeln gemacht, mit mir zusammen. Dann hat ihr Herz gesagt, es reicht jetzt.', 'trauer'),
    B('„Bao Babette – seit 2061“. Das war ihr Jahr. Das Jahr, in dem wir wieder angefangen haben. Ich hab ihr Schild behalten. Nur den Namen getauscht.', 'neutral'),
  ], { next: 'meer' }),
  knoten('meer', [
    B('Wenn ich je wieder ans Meer komme, an ein richtiges, eins, das blau ist und nicht braun … dann koche ich dort. Am Strand. Für alle. Und lass mir von den Möwen die Nudeln klauen.', 'neutral'),
    erz('Sie wischt sich mit dem Handrücken über die Augen und tut so, als wäre es Dampf.'),
    B('So. Genug geweint. Das Weinen versalzt den Teig.', 'signatur'),
  ], {
    choices: [
      { text: '„Wir finden das Meer, Babette. Und dann kochst du da.“', next: 'versprechen', effects: [herz('babette-bao', 20), flag('babette_meer_versprochen')] },
      { text: '„Ich will die Dampfnudel deiner Mutter probieren. Die echte.“', next: 'echte', effects: [herz('babette-bao', 20)] },
    ],
  }),
  knoten('versprechen', [
    B('Versprich nichts, was du nicht halten kannst, Schätzchen.', 'trauer'),
    B('… Aber wenn du es hältst, koch ich dir das Festessen deines Lebens.', 'freude'),
  ], { next: 'ende' }),
  knoten('echte', [
    B('Die echte. Hm.', 'signatur'),
    erz('Sie greift unter den Tresen und holt eine Dampfnudel hervor, die anders aussieht. Kleiner, dunkler, mit einer eingeritzten Möwe auf dem Teig.'),
    B('Die mach ich nur für mich. Einmal in der Woche. Mit Ingwer und Salzpflaume. Iss. Langsam. Das ist Möwenhafen.', 'neutral'),
  ], { next: 'ende' }),
  knoten('ende', [
    B('Danke, {name}. Fürs Zuhören. Wer zuhört, kriegt bei mir lebenslang Nachschlag. Das steht jetzt fest.', 'freude'),
  ], { effects: [{ xp: 80 }, { give: 'bao-dampfnudel', qty: 2 }, herz('babette-bao', 20), flag('babette_moewenhafen')] }),
]);

// ♥8 und ♥10 samt Akt-2/3-/Nachspiel-Gesprächen: babette-akt23.ts.
const A23 = akt23(M);

// ---------------------------------------------------------------------------------------------- Date: Abendessen bei Babette (Aria-Romanze)

const date = dialog('babette-bao-date-aria', [
  knoten('start', [
    erz('Hinter der Garküche, zwischen gestapelten Dampfkörben, hat Babette eine Kiste mit einem Tischtuch bedeckt. In einer Mutter-Schraube steckt eine Kerze. Der Dampf aus den Töpfen hängt wie Nebel um euch und schluckt den Lärm vom Markt.'),
    B('So. Tisch für zwei. Kein Durchzug, keine Zuschauer, und die Kerze ist echt. Ich hab sie dem Richter abgeschwatzt.', 'signatur'),
    erz('Aria kommt fünf Minuten zu spät, die Haare noch nass vom Duschen, im frischen Kabelbrand-Shirt. Sie bleibt kurz stehen, als sie die Kerze sieht. Dann wird sie rot. Aria wird nie rot.'),
    A('Eine Kerze. Babette. Das ist … das ist ja ein richtiges Date.', 'verlegen'),
    B('Natürlich ist es ein richtiges Date. Setz dich, Kind. Und nimm den Schläger vom Tisch, da kommt das Essen hin.', 'wut'),
  ], {
    choices: [
      { text: 'Ihr den Stuhl rausziehen.', next: 'stuhl', effects: [herz('aria', 10)] },
      { text: '„Du siehst gut aus, Aria. Verdammt gut.“', next: 'kompliment', effects: [herz('aria', 15)] },
      { text: 'Vex-Art: die Lieferweste ausziehen und über die Stuhllehne hängen. „Feierabend.“', when: VEX, next: 'weste', effects: [herz('aria', 15)] },
    ],
  }),
  knoten('stuhl', [
    A('Du ziehst mir den Stuhl raus. Mir. Ich hab mal einen Stuhl durch ein Fenster geworfen.', 'ueberrascht'),
    A('… Mach das nochmal irgendwann. Das war gut.', 'zaertlich'),
  ], { next: 'essen' }),
  knoten('kompliment', [
    A('„Verdammt gut“. Hm.', 'verlegen'),
    A('Ich hab zwanzig Minuten vor dem Spiegel gestanden und mich gefragt, ob das Shirt zu eng ist. Jetzt weiß ich: genau richtig eng.', 'signatur'),
  ], { next: 'essen' }),
  knoten('weste', [
    A('Die Weste. Du ziehst die Weste aus. Vor mir. Mit Kerze.', 'ueberrascht'),
    A('Postbotin, wenn du so weitermachst, ess ich heute nichts. Dann guck ich nur.', 'verlegen'),
  ], { next: 'essen' }),
  knoten('essen', [
    erz('Babette bringt Dampfnudeln, eine Schale Brühe mit Ingwer und zwei Gläser Neon-Limo mit Strohhalmen, die sich in der Mitte zu einem Herz verbiegen. Sie stellt alles hin und tut so, als würde sie nicht grinsen.'),
    B('Die Strohhalme waren im Angebot. Zufall. Ich bin nicht romantisch. Ich bin praktisch.', 'signatur'),
    erz('Aria isst wie immer: schnell, mit der echten Hand, die Metallhand liegt auf dem Tisch, ganz nah bei deiner. Unter dem Tisch stößt ihr Knie an deins. Sie zieht es nicht weg.'),
    A('Weißt du, was das Schlimmste an dir ist? Ich hab Hunger, und ich guck trotzdem dich an statt das Essen. Das ist mir noch nie passiert. Nicht mal bei Babettes Nudeln.', 'verlegen'),
  ], {
    choices: [
      {
        text: 'Ihr eine Dampfnudel hinhalten. Mit den Stäbchen. Ganz langsam.', next: 'fuettern',
        check: pruefung('babette-date-fuettern', 'ausstrahlung', 5, ['flirt']), effects: [herz('aria', 30)],
      },
      { text: 'Unterm Tisch das Knie gegen ihres lehnen. Fester.', next: 'knie', effects: [herz('aria', 20)] },
      { text: '„Iss, Aria. Ich lauf dir nicht weg.“', next: 'weglaufen', effects: [herz('aria', 20)] },
    ],
  }),
  knoten('fuettern', [
    erz('Du nimmst eine Dampfnudel zwischen die Stäbchen und hältst sie ihr hin. Aria sieht dich an, sehr lange. Dann beugt sie sich vor, beißt ab, ohne den Blick zu senken, und leckt sich eine Spur Füllung von der Unterlippe.'),
    A('Du machst das mit Absicht.', 'signatur'),
    ich('Ja.'),
    A('Gut. Dann mach ich das auch mit Absicht.', 'zaertlich'),
    erz('Sie greift über den Tisch, nimmt dir die Stäbchen aus der Hand, ihre Finger bleiben einen Herzschlag zu lang auf deinen, und füttert dich zurück. Irgendwo hinter dem Dampf lässt Babette einen Topfdeckel fallen.'),
    B('ICH HAB NICHTS GESEHEN! Ich hab den Deckel gesehen! Nur den Deckel!', 'freude'),
  ], { next: 'naehe' }),
  knoten('knie', [
    erz('Du drückst dein Knie fester gegen ihres. Aria hört auf zu kauen. Unter dem Tisch rutscht ihr Fuß an deinem Schienbein hoch, ganz langsam, über den Stiefelschaft, bis zur Kniekehle.'),
    A('Ich mach das nicht. Das ist mein Fuß. Der macht, was er will. Ich bin nur zufällig dran.', 'verlegen'),
    erz('Die Kerze flackert. Es ist eindeutig nicht der Wind.'),
  ], { next: 'naehe' }),
  knoten('weglaufen', [
    A('Weglaufen. Ha. Du kannst gar nicht weglaufen. Ich weiß, wo du wohnst, wo du arbeitest und welche Feuerleiter du nimmst.', 'signatur'),
    A('… Das klang romantischer in meinem Kopf. In meinem Kopf klang alles romantischer. Bis du da warst. Jetzt klingt’s echt.', 'zaertlich'),
  ], { next: 'naehe' }),
  knoten('naehe', [
    erz('Das Essen ist längst kalt. Ihr merkt es nicht. Aria hat sich vorgebeugt, die Ellbogen auf dem Tisch, das Kinn auf der Metallhand. Im Kerzenlicht glänzen die Servos wie Kupfer.'),
    A('Weißt du, was ich will? Hier. Jetzt. Zwischen Babettes Dampfkörben, die nach Ingwer riechen und nach meiner Kindheit, die ich nie hatte.', 'zaertlich'),
  ], {
    choices: [
      { text: 'Über den Tisch greifen, ihr Kinn anheben und sie küssen.', next: 'kuss', effects: [herz('aria', 30), flag('babette_date_kuss')] },
      { text: '„Sag es mir.“', next: 'sag', effects: [herz('aria', 25)] },
      { text: 'Vex: „Ich halt nicht an, Zöpfe. Nicht heute.“', when: VEX, next: 'nicht-anhalten', effects: [herz('aria', 30)] },
    ],
  }),
  knoten('kuss', [
    erz('Du beugst dich über die Kerze. Aria kommt dir entgegen, schneller als du, wie immer. Der Kuss schmeckt nach Ingwer und Neon-Limo und nach dem Lachen, das sie dabei nicht ganz runterschlucken kann. Ihre echte Hand krallt sich in deinen Kragen, die Metallhand liegt warm an deiner Wange, so vorsichtig, als könnte sie dich zerbrechen.'),
    erz('Als ihr euch löst, hat sie die Augen noch zu.'),
    A('Okay. Okay. Das war … Das war besser als die Nudeln. Sag das nicht Babette.', 'verlegen'),
    B('Ich hab’s GEHÖRT!', 'wut'),
  ], { next: 'ende' }),
  knoten('sag', [
    A('Sagen? Ich bin nicht gut im Sagen. Ich bin gut im Machen.', 'verlegen'),
    erz('Sie steht auf, kommt um die Kiste herum, setzt sich ungefragt auf deinen Schoß und legt dir die Arme um den Hals. Ihr Atem ist warm an deinem Ohr.'),
    A('Das. Das will ich. Und noch ein bisschen mehr. Aber nicht hier, Babette hat Ohren wie ein Abhörgerät.', 'zaertlich'),
  ], { next: 'ende' }),
  knoten('nicht-anhalten', [
    A('Nicht anhalten.', 'ueberrascht'),
    A('Weißt du, wie gefährlich das ist, wenn du so was sagst? Mit dieser Stimme? Bei Kerzenlicht?', 'verlegen'),
    erz('Sie zieht dich am Gurtriemen über den Tisch, so weit, dass die Kerze bedrohlich wackelt, und küsst dich. Hart, kurz, ein bisschen wütend darüber, wie sehr sie es will. Dann noch einmal, langsamer. Viel langsamer.'),
    A('Postbotin. Ich will Nachtisch. Und der steht nicht auf Babettes Karte.', 'signatur'),
  ], { next: 'ende', effects: [flag('babette_date_kuss')] }),
  knoten('ende', [
    erz('Babette taucht aus dem Dampf auf, mit einem eingewickelten Päckchen und einem sehr unschuldigen Gesicht.'),
    B('Nachtisch. Zum Mitnehmen. Ich mach jetzt zu. Früher als sonst. Ganz zufällig. Raus mit euch, ihr zwei, bevor die Kerze das Tischtuch abfackelt.', 'signatur'),
    A('Babette, du bist die Beste.', 'freude'),
    B('Ich weiß. Und Aria? Wenn du {name} wehtust, gibt’s für dich nie wieder Füllung. Und du, Schätzchen: Wenn du ihr wehtust, für dich auch nicht. Ich hab zwei Kochlöffel.', 'wut'),
    erz('Draußen ist die Gasse dunkel und warm. Aria nimmt deine Hand, die echte in deine, und zieht dich los, schneller als nötig. Ihr redet nicht viel auf dem Weg. Ihr müsst nicht.'),
  ], { effects: [{ give: 'bao-dampfnudel', qty: 2 }, { xp: 50 }, herz('babette-bao', 20), flag('babette_date_aria')] }),
]);

// ---------------------------------------------------------------------------------------------- Figur

const babette: NpcDef = {
  id: 'babette-bao',
  name: 'Babette Bao',
  portrait: 'babette-bao',
  sprite: 'babette-bao-walk',
  faction: 'unterstadt',
  bio: 'Betreibt die Garküche „Bao Babette – Dampfnudeln seit 2061“ am Schrottmarkt. Kommt aus dem überfluteten Möwenhafen an der Küste, füttert die Kinder aus dem Nest heimlich mit. Mütterlich, resolut, Essen ist ihre Antwort auf alles.',
  gifts: {
    loves: ['kaktusfrucht', 'blumensamen', 'kraeuter-gebaeck'],
    likes: ['tai-chi-tee', 'algen-chips', 'synth-kaffee', 'dantes-kekse', 'echtobst-apfel', 'hofhonig'],
    dislikes: ['synth-nudeln', 'nougatbombe'],
    hates: ['plastikpflanze', 'rostige-dose', 'virus-implantat'],
  },
  schedule: [
    ...A23.schedule,
    // Montag: Ruhetag, abends Fischmarkt an der Hafenkante.
    { slot: 'abend', days: ['mo'], place: { map: 'hafenkante', at: 'fischmarkt' } },
    { days: ['mo'], place: 'away' },
    { slot: ['morgen', 'tag'], place: { map: 'schrottmarkt', at: 'garkueche' } },
    // Kurz nach 17 Uhr bringt sie Essen ins Nest.
    { slot: 'abend', when: { clockBetween: [1020, 1080] }, place: { map: 'das-nest', at: 'essensplatz' } },
    { slot: 'abend', place: { map: 'schrottmarkt', at: 'garkueche' } },
    { slot: 'nacht', place: 'away' },
  ],
  heartEvents: [
    { id: 'he-babette-bao-2', hearts: 2, map: 'schrottmarkt', time: 'morgen', when: { weekday: 'di' }, dialogue: 'he-babette-bao-2' },
    { id: 'he-babette-bao-4', hearts: 4, map: 'das-nest', time: 'abend', when: { all: [{ clockBetween: [1020, 1080] }, { not: { weekday: 'mo' } }] }, dialogue: 'he-babette-bao-4' },
    { id: 'he-babette-bao-6', hearts: 6, map: 'schrottmarkt', time: 'tag', when: { not: { weekday: 'mo' } }, dialogue: 'he-babette-bao-6' },
    { id: 'he-babette-bao-8', hearts: 8, map: 'schrottmarkt', time: 'morgen', when: { all: [AB_AKT2, { not: { weekday: 'mo' } }] }, dialogue: 'he-babette-bao-8' },
    { id: 'he-babette-bao-10', hearts: 10, map: 'schrottmarkt', time: 'abend', when: { all: [AB_AKT2, { seen: 'he-babette-bao-8' }, { weekday: 'mo' }] }, dialogue: 'he-babette-bao-10' },
  ],
  talk: [
    rede('babette-bao-tag-rivale', { rival: 'babette-bao' }),
    rede('babette-bao-tag-oednis', { all: [{ origin: 'origin-oednis' }, { notFlag: 'babette_herkunft' }] }),
    rede('babette-bao-tag-gosse', { all: [{ origin: 'origin-gossenkind' }, { notFlag: 'babette_herkunft' }] }),
    rede('babette-bao-tag-aria', { all: [{ flag: 'aria_romanze_zusammen' }, { notFlag: 'babette_kommentar_aria' }] }),
    ...A23.talk,
    rede('babette-bao-tag-zeit', NICHT_AKT2, 8),
    rede('babette-bao-tag-fischmarkt', { weekday: 'mo' }),
    rede('babette-bao-tag-nest', { all: [{ time: 'abend' }, { clockBetween: [1020, 1080] }] }),
    rede('babette-bao-tag-markttag', { quest: MARKTTAG, state: 'active' }),
    rede('babette-bao-tag-vertraut', undefined, 6),
    rede('babette-bao-tag-morgen', { time: 'morgen' }),
    rede('babette-bao-tag-tag', { time: 'tag' }),
    rede('babette-bao-tag-abend', { time: 'abend' }),
    rede('babette-bao-tag-standard'),
  ],
};

export const part: ContentPart = {
  npcs: { 'babette-bao': babette },
  dialogues: sammle(
    T.rivale, T.oednis, T.gosse, T.ariaRomanze, T.zeit, T.markttag, T.fischmarkt, T.nest, T.vertraut, T.morgen, T.tag,
    T.abend, T.standard,
    he2, he4, he6, ...A23.dialogues, date,
  ),
  phone: {
    'tel-babette-fruehstueck': {
      id: 'tel-babette-fruehstueck', from: 'babette-bao',
      text: 'Dienstag früh. Garküche. Gratisfrühstück. Keine Ausreden, Schätzchen, du bist zu dünn. – B.',
      auto: { all: [{ hearts: 'babette-bao', min: 2 }, neu('he-babette-bao-2')] },
      replies: [{ text: 'Ich komme hungrig.' }, { text: 'Ich bin nicht zu dünn!' }],
    },
  },
};
