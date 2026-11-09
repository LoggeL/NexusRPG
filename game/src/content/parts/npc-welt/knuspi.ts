// Knuspi – Nougatbomben-Schmuggler an der Hafenkante (world.md §4.5). Seine Rolle in side-riegel-krise (gc-54,
// Dialog side-riegel-knuspi in quest-side-a) bleibt dort; hier Tagesgespräche, Schwarzmarkt-Riegel und Herz-Ereignisse.
import type { ContentPart } from '../../part';
import type { DialogueChoice, DialogueNode } from '../../../modules/contracts';
import {
  type Menue, dialog, erz, flag, geschenke, gespraech, herz, ich, knoten, nichtGetroffen, ort, pruefung, rede, sammle,
  sprecher, weg, weltfigur, zurueck,
} from './_welt';

const ID = 'knuspi';
const K = sprecher(ID);
const Z = zurueck('Noch was, Knuspi.', 'Bleib süß.');

const choices: DialogueChoice[] = [
  {
    text: 'Eine Nougatbombe kaufen (10 Cr).', requires: { credits: 10 }, next: 'kauf',
    effects: [{ credits: -10 }, { give: 'nougatbombe' }],
  },
  { text: 'Wie wird man Schokoladenschmuggler?', once: true, id: 'kn-beruf', next: 'beruf' },
  { text: 'Wer kauft bei dir?', next: 'kunden' },
  { text: '„Was schmuggelst du außer Riegeln?“', tag: '[Knuspi ♥3]', requires: { hearts: ID, min: 3 }, once: true, id: 'kn-mehr', next: 'mehr' },
  { text: 'Bleib süß.' },
];

const nodes: DialogueNode[] = [
  knoten('kauf', [K('Zehn. Ja, im Laden kostet die sechs. Im Laden gibt’s aber keine. Das ist der Unterschied zwischen Wirtschaft und Leidenschaft.')], { choices: Z }),
  knoten('beruf', [
    K('Ich war Lagerist bei der Nougatbomben-Fabrik. Nachtschicht. Irgendwann hab ich gemerkt: Die zählen nur die Kisten, nicht die Riegel in den Kisten.'),
    K('Ich hab nie eine ganze Kiste geklaut. Nur aus jeder Kiste einen. Das ist kein Diebstahl. Das ist Statistik.'),
  ], { choices: Z }),
  knoten('kunden', [
    K('Alle. Hunter. Die Wache. Kinder. Rentner. Einmal ein Typ mit einer Kralle als Hand, der hat zwanzig genommen und sich dafür entschuldigt. Sehr höflich. Sehr gruselig.'),
  ], { choices: Z }),
  knoten('mehr', [
    K('Manchmal Briefe. Manchmal Medikamente für das Kanalvolk. Einmal einen Hamster. Der Hamster hatte Schulden.'),
    K('Riegel sind die Tarnung. Wer würde einen Kerl verdächtigen, der nach Karamell riecht? Keiner. Karamell ist unschuldig.'),
  ], { choices: Z, effects: [herz(ID, 20)] }),
];

const M: Menue = { zeile: K('Noch was? Schnell, meine Ware schmilzt. Und ich auch, wenn die Wache kommt.'), choices, nodes };

const T = {
  rivale: dialog('knuspi-tag-rivale', [knoten('start', [K('Für dich: ausverkauft.'), erz('Er kaut demonstrativ einen Riegel. Mit offenem Mund.')])]),
  erstes: gespraech('knuspi-tag-erstes', [
    erz('Zwischen zwei Containern sitzt ein rundlicher Typ auf einer Kühlbox. Schokoflecken am Hemd, an den Fingern, irgendwie auch an der Seele.'),
    K('Psst. Hey. Du. Ja, du. Hungrig? Ich hab Bomben. Nougat. Echt. Nicht diese Quantum-Testpampe.'),
    K('Knuspi. Nenn mich Knuspi. Alle nennen mich Knuspi. Meine Mutter nennt mich Herbert. Aber die kauft nichts.'),
  ], M),
  standard: gespraech('knuspi-tag-standard', [K('Psst! Na? Süße Sünde gefällig? Ich hab auch die mit Krokant. Die mit Krokant sind illegal. Fast.')], M),
};

/** ♥2: Knuspis Kühlbox fällt aus – Notfall. */
const he2 = dialog('he-knuspi-2', [
  knoten('start', [
    erz('Knuspi kniet vor seiner Kühlbox und fächelt ihr mit einer Zeitung Luft zu. Aus der Box tropft es braun.'),
    K('Die Kühlung ist hin! Zweihundert Riegel! Die schmelzen! Das ist ein Massaker! Ein Nougatmassaker!'),
  ], {
    choices: [
      { text: 'Die Kühlschlange kurzschließen und neu starten.', tag: '[Technik 4]', check: pruefung('he-knuspi-2-kuehlung', 'technik', 4, ['maschine']), next: 'repariert' },
      { text: 'Die Box ins Hafenbecken hängen. Wasser ist kalt.', next: 'becken' },
      { text: 'Die Riegel schnell an die Hafenarbeiter verteilen, bevor sie schmelzen.', tag: '[Straße 4]', check: pruefung('he-knuspi-2-verteilen', 'strasse', 4, ['verhandeln']), next: 'verteilt' },
    ],
  }),
  knoten('repariert', [erz('Ein Zischen, ein Brummen. Die Box kühlt wieder. Knuspi umarmt die Kühlbox. Dann dich. Du hast jetzt Schokoflecken.')], { next: 'ende', effects: [herz(ID, 45), { xp: 40 }] }),
  knoten('becken', [
    erz('Ihr lasst die Box an einem Seil ins Hafenbecken. Sie kühlt. Sie schwimmt auch ein bisschen weg. Hafen-Hannes fischt sie mit dem Greifarm zurück und klaut sich drei Riegel als Finderlohn.'),
  ], { next: 'ende', effects: [herz(ID, 40), herz('hafen-hannes', 10), { xp: 30 }] }),
  knoten('verteilt', [erz('Zehn Minuten später kauen dreißig Hafenarbeiter gleichzeitig. Knuspi zählt die Credits. Es sind mehr als sonst. Er weint vor Glück.')], { next: 'ende', effects: [herz(ID, 45), { xp: 40 }, { credits: 30 }] }),
  knoten('ende', [K('Du bist ein Held. Ein Schokoheld. Ab jetzt kriegst du jede fünfte Bombe gratis. Ich zähl mit. Ungefähr.')], { effects: [flag('knuspi_stammkunde'), { give: 'nougatbombe', qty: 2 }] }),
]);

/** ♥4: Knuspis Geheimnis – eine eigene Rezeptur. */
const he4 = dialog('he-knuspi-4', [
  knoten('start', [
    erz('Knuspi führt dich in einen Container, in dem es nach Karamell und Diesel riecht. Auf einem Campingkocher blubbert ein Topf.'),
    K('Ich hab ein eigenes Rezept. Die „Knuspi-Bombe“. Mit Algenkaramell und Rostsalz. Schmeckt wie die Unterstadt. Also schlecht, aber man will mehr.'),
    K('Probier. Bitte. Du bist der Erste. Meine Mutter hat abgelehnt.'),
  ], {
    choices: [
      { text: 'Probieren und ehrlich sagen, was du denkst.', next: 'ehrlich' },
      { text: 'Probieren und vorschlagen, wie man es besser macht.', tag: '[Technik 5]', check: pruefung('he-knuspi-4-rezept', 'technik', 5), next: 'besser' },
      { text: '„Das musst du Babette zeigen. Die verkauft das.“', when: { met: 'babette-bao' }, next: 'babette' },
    ],
  }),
  knoten('ehrlich', [ich('Es schmeckt … nach Hafen. Auf eine gute Art.'), K('AUF EINE GUTE ART! Ich lass das drucken! Auf die Verpackung!', 'freude')], { next: 'ende', effects: [herz(ID, 50)] }),
  knoten('besser', [erz('Eine Prise weniger Rostsalz, eine Minute länger köcheln. Knuspi probiert, schließt die Augen und sinkt auf einen Eimer.'), K('Das ist … Das ist Kunst. Du hast mein Lebenswerk verbessert. Ich hasse dich. Ich liebe dich. Platonisch.')], { next: 'ende', effects: [herz(ID, 60)] }),
  knoten('babette', [K('Babette? Die Babette? Die mich mal mit der Bratpfanne vom Markt gejagt hat? … Ja. Ja, die kann das verkaufen. Wenn sie mich nicht vorher brät.')], { next: 'ende', effects: [herz(ID, 50), flag('knuspi_babette')] }),
  knoten('ende', [
    K('Wenn ich je einen Laden aufmache, einen legalen, dann hängt dein Foto an der Wand. „Erster Kunde.“'),
  ], { effects: [{ xp: 60 }, flag('knuspi_rezept')] }),
]);

const knuspi = weltfigur({
  id: ID,
  name: 'Knuspi',
  unknownName: 'Typ mit Schokoflecken',
  faction: 'unterstadt',
  bio: 'Nougatbomben-Schmuggler an der Hafenkante, ehemals Lagerist der Fabrik. Schokoflecken überall, Kühlbox als Thron. Heißt eigentlich Herbert.',
  gifts: geschenke({
    loves: ['nougatbombe', 'sahnetorte-stueck', 'algen-chips'],
    likes: ['chips-tuete', 'kraeuter-gebaeck', 'edelbrause', 'synth-kaffee'],
    dislikes: ['frisches-gemuese', 'gesetzbuch'],
    hates: ['handschellen', 'peilsender'],
  }),
  schedule: [ort('A,N', 'hafenkante', 'knuspi-versteck'), weg('M,T')],
  heartEvents: [
    { id: 'he-knuspi-2', hearts: 2, map: 'hafenkante', time: 'abend', dialogue: 'he-knuspi-2' },
    { id: 'he-knuspi-4', hearts: 4, map: 'hafenkante', time: ['abend', 'nacht'], when: { seen: 'he-knuspi-2' }, dialogue: 'he-knuspi-4' },
  ],
  talk: [
    rede('knuspi-tag-rivale', { rival: ID }),
    rede('knuspi-tag-erstes', nichtGetroffen(ID)),
    rede('knuspi-tag-standard'),
  ],
});

export const part: ContentPart = {
  npcs: { [ID]: knuspi },
  dialogues: sammle(T.rivale, T.erstes, T.standard, he2, he4),
};
