// pers-jakko-kochbuch · Jakkos Kochbuch (world.md §6.5; Start bei he-jakko-6: er packt Reste ein, weil er Hunger hat).
// Drei Rezepte: Babette (akt-kochen, [Ausstrahlung 4] oder eine Schicht helfen), Mutter Brühe (Kartoffeln schälen,
// [Ausstrahlung 4] oder `kraeuter-gebaeck`), Rudi aus der Staubstraße (in Akt 1 über Marla am Samstag oder Opa Gurrmanns
// Taubenpost). Am Ende kochen beide zusammen (akt-kochen). Belohnung: `jakkos-eintopf`, `keks-katapult`.
import type { QuestDef } from '../../../modules/contracts';
import type { ContentPart } from '../../part';
import {
  type Beitrag, L, N, active, all, any, beitrag, bye, c, chk, cr, flag, give, hearts, item, node, noFlag, nochWas, rel, seen,
  set, schritt, take, zeit,
} from './_lib';

const Q = 'pers-jakko-kochbuch';
const AKTIV = active(Q);
const JK = 'jakko';
const BB = 'babette-bao';
const MB = 'mutter-bruehe';
const R_BAB = 'rezeptzettel-babette';
const R_BRU = 'rezeptzettel-bruehe';
const R_RUD = 'rezeptzettel-rudi';
const ALLE_REZEPTE = all(item(R_BAB), item(R_BRU), item(R_RUD));

const quest: QuestDef = {
  id: Q, kind: 'personal', act: 1, giver: JK,
  title: 'Jakkos Kochbuch',
  summary: 'Jakko will ein Kochbuch schreiben, damit im Nest nie wieder einer Reste einpacken muss. Er braucht drei Rezepte von drei Köchen, die alle ihre Geheimnisse hüten.',
  autoStart: any(seen('he-jakko-6'), hearts(JK, 6)),
  steps: [
    schritt('jakko', 'Sprich mit Jakko an der Garküche (Schrottmarkt).', 'jk_start', { marker: { map: 'schrottmarkt' } }),
    { id: 'babette', text: 'Hol Babettes Dampfnudel-Rezept (Garküche).', done: any(item(R_BAB), flag('jk_fertig')), when: flag('jk_start'), marker: { map: 'schrottmarkt' } },
    { id: 'bruehe', text: 'Hol Mutter Brühes Suppenrezept (Suppenküche, Rohrsiedlung).', done: any(item(R_BRU), flag('jk_fertig')), when: flag('jk_start'), marker: { map: 'suppenkueche' } },
    {
      id: 'rudi', text: 'Rudis Eintopf aus der Staubstraße: Marla Sand kennt ihn (samstags am Schrottmarkt) – oder Opa Gurrmann schickt eine Taube (Lötgassen).',
      done: any(item(R_RUD), flag('jk_fertig')), when: flag('jk_start'), marker: { map: 'loetgassen' },
    },
    schritt('kochen', 'Koch mit Jakko das erste Rezept seines Kochbuchs.', 'jk_fertig', { when: any(ALLE_REZEPTE, flag('jk_fertig')), marker: { map: 'schrottmarkt' } }),
  ],
  reward: { xp: 220, items: { 'keks-katapult': 1 }, relations: { jakko: 100, 'babette-bao': 30 } },
};

// ------------------------------------------------------------------------------------------- Jakko
const start = beitrag(JK, all(AKTIV, noFlag('jk_start')), '„Jakko. Die Reste in deiner Jacke. Reden wir drüber?“', [
  node('jk-j-start', [
    L(JK, 'Das sind keine Reste. Das ist … Vorrat. Für später. Für schlechte Tage. Für Freya, wenn sie wieder vergisst zu essen, weil sie Gesetze liest.', 'verlegen'),
    L(JK, 'Ich will ein Kochbuch machen. Ein echtes. Mit Rezepten, die man mit nichts kochen kann. Damit im Nest keiner mehr Reste klauen muss. Auch ich nicht.', 'besorgt'),
    L(JK, 'Babette macht die besten Dampfnudeln. Mutter Brühe die beste Suppe. Und Marla sagt, in der Staubstraße gibt’s einen Rudi, der macht Eintopf aus Sand und Liebe. Ich will alle drei!', 'freude'),
  ], {
    choices: [
      c('„Wir besorgen dir alle drei. Und dann kochen wir.“', 'jk-j-ja', { effects: [set('jk_start'), rel(JK, 20)] }),
    ],
  }),
  node('jk-j-ja', [
    L(JK, 'Echt? ECHT? Das ist so gut wie eine Dampfnudel! Nein! Besser! Das ist so gut wie ZWEI Dampfnudeln!', 'freude'),
  ], { choices: [nochWas(), bye()] }),
]);

const kochen = beitrag(JK, all(AKTIV, ALLE_REZEPTE, noFlag('jk_fertig')), 'Drei Rezeptzettel auf den Hocker legen. „Küche frei?“', [
  node('jk-k-start', [
    L(JK, 'Babette hat gesagt, wir dürfen ihren zweiten Herd benutzen! Den kleinen! Der nur ein bisschen brennt!', 'freude'),
    N('Jakko schiebt drei Zettel nebeneinander: Babettes Teig, Mutter Brühes Brühe, Rudis „Was da ist. Mehr davon.“ Er mischt alles zu einem Plan. Der Plan heißt „Jakkos Eintopf“.'),
  ], {
    choices: [
      c('Kochlöffel schnappen. Los geht’s.', 'jk-k-fertig', {
        effects: [{
          minigame: 'akt-kochen', level: 2, key: 'jakkos-eintopf', label: 'Jakkos Eintopf',
          win: [give('jakkos-eintopf', 3), { message: 'Perfekt gewürzt. Babette guckt in den Topf und sagt nichts. Das ist bei ihr ein Orden.' }],
          lose: [give('jakkos-eintopf', 1), { message: 'Ein bisschen angebrannt. Jakko sagt, das ist „Röstaroma“. Er hat recht.' }],
        }],
      }),
      c('Jakko einfach machen lassen und Zwiebeln schneiden.', 'jk-k-fertig', { effects: [zeit(60), give('jakkos-eintopf', 2)] }),
    ],
  }),
  node('jk-k-fertig', [
    N('Der Eintopf blubbert. Die halbe Garküche steht drum herum. Freya schreibt das Rezept ab, in Schönschrift. Daria verhandelt schon über Verkaufsrechte.'),
    L(JK, 'Das ist das erste Rezept in meinem Buch. Seite eins. Da steht dein Name drunter. Klein. Mein Name ist größer. Aber deiner steht da!', 'freude'),
    L(JK, 'Und hier. Das hab ich mit Gustav gebaut. Ein Keks-Katapult. Wenn du jemanden triffst, den du magst, kriegt er einen Keks statt einer Beule. Glaub ich. Hab’s an Bolzen getestet.', 'signatur'),
  ], { effects: [take(R_BAB), take(R_BRU), take(R_RUD), set('jk_fertig'), set('rezept_jakkos_eintopf')] }),
]);

// ------------------------------------------------------------------------------------------- Babette
const babette = beitrag(BB, all(AKTIV, flag('jk_start'), { noItem: R_BAB }, noFlag('jk_fertig')), '„Jakko schreibt ein Kochbuch. Er will dein Dampfnudel-Rezept.“', [
  node('jk-b-start', [
    L(BB, 'Mein Rezept? Das Rezept meiner Großmutter? Das sie aus der Flut gerettet hat, in einer Plastiktüte, zwischen den Zähnen?', 'wut'),
    L(BB, '… Für Jakko. Hm. Der Junge hat Hände wie ein Koch. Und einen Magen wie ein Loch. Aber ich geb es nicht einfach so her. Wer mein Rezept will, muss zeigen, dass er’s verdient.', 'neutral'),
  ], {
    choices: [
      c('An den Herd. Zeigen, was du kannst.', 'jk-b-gekocht', {
        effects: [{
          minigame: 'akt-kochen', level: 1, key: 'jk-babette-probe', label: 'Dampfnudel-Probe',
          win: [rel(BB, 30), { message: 'Babette kostet. Nickt. Du hast eine Dampfnudel gemacht, die nach Zuhause schmeckt.' }],
          lose: [rel(BB, 10), { message: 'Die Dampfnudel ist flach wie ein Bierdeckel. Babette lacht so laut, dass der Kran wackelt.' }],
        }],
      }),
      c('„Babette. Er hat Hunger, und er will, dass andere keinen haben. Das ist dein Rezept, oder? Genau dafür.“', 'jk-b-gerührt',
        { check: chk('jk-babette', 'ausstrahlung', 4, ['trost', 'ueberzeugen']) }),
      c('„Ich helf dir die Abendschicht. Teller, Teig, Abwasch.“', 'jk-b-schicht'),
    ],
  }),
  node('jk-b-gekocht', [
    L(BB, 'Gut. Oder schlecht. Ist egal. Du hast es versucht, mit Mehl bis zu den Ellbogen. Das reicht mir.', 'freude'),
  ], { next: 'jk-b-zettel' }),
  node('jk-b-gerührt', [
    L(BB, '… Kindchen. Du redest wie meine Großmutter. Und die hat nie geredet, die hat gekocht.', 'trauer'),
  ], { next: 'jk-b-zettel' }),
  node('jk-b-schicht', [
    N('Drei Stunden. Teig kneten, Teller schleppen, Kinder verscheuchen, Kinder füttern, Kinder wieder verscheuchen. Am Ende tun dir die Arme weh, als hättest du mit Aria Armdrücken gespielt.'),
  ], { effects: [zeit(180), rel(BB, 20)], next: 'jk-b-zettel' }),
  node('jk-b-zettel', [
    N('Babette schreibt. Langsam, mit der Zunge im Mundwinkel. Einen Absatz schwärzt sie mit dem Kugelschreiber.'),
    L(BB, 'Der schwarze Teil ist Familie. Der bleibt bei mir. Alles andere gehört Jakko. Und sag ihm: Wer eine Dampfnudel verschwendet, kriegt Hausverbot. Lebenslang.'),
  ], { effects: [give(R_BAB)], choices: [nochWas(), bye()] }),
]);

// ------------------------------------------------------------------------------------------- Mutter Brühe
const bruehe = beitrag(MB, all(AKTIV, flag('jk_start'), { noItem: R_BRU }, noFlag('jk_fertig')), '„Jakko, der Kleine vom Nest, will Ihre Suppe ins Kochbuch schreiben.“', [
  node('jk-m-start', [
    L(MB, 'Jakko. Der mit dem Loch im Bauch. Der kriegt immer eine Kelle extra, wenn er glaubt, ich guck nicht.'),
    L(MB, 'Mein Rezept hängt da an der Wand. Wer es liest, schält Kartoffeln. Steht da. Ist Gesetz.'),
  ], {
    choices: [
      c('Ärmel hoch. Kartoffeln schälen.', 'jk-m-schaelen'),
      c('„Sie füttern seit Jahren die ganze Rohrsiedlung. Lassen Sie das ein Kind weitermachen.“', 'jk-m-gerührt',
        { check: chk('jk-bruehe', 'ausstrahlung', 4, ['ueberzeugen']) }),
      c('Kräutergebäck hinstellen. „Für die Köchin.“', 'jk-m-gebaeck', { when: item('kraeuter-gebaeck'), effects: [take('kraeuter-gebaeck')] }),
    ],
  }),
  node('jk-m-schaelen', [
    N('Ein Sack Kartoffeln. Dann noch einer. Mutter Brühe schaut dir einmal über die Schulter und sagt: „Dünner.“ Das ist alles, was sie in einer Stunde sagt.'),
  ], { effects: [zeit(60), rel(MB, 20)], next: 'jk-m-zettel' }),
  node('jk-m-gerührt', [L(MB, 'Weitermachen. Hm. Irgendwer muss ja, wenn ich mal umfalle. Der Junge hat das Herz dafür. Und den Hunger.', 'trauer')], { next: 'jk-m-zettel' }),
  node('jk-m-gebaeck', [L(MB, 'Bestechung. Mit Kräutern. Na gut. Das ist die einzige Bestechung, die ich nehme.', 'freude')], { effects: [rel(MB, 30)], next: 'jk-m-zettel' }),
  node('jk-m-zettel', [
    N('Sie nimmt einen Zettel von der Wand, schreibt „für Jakko“ drauf und rechnet die Mengen auf Kinderportionen um. Die Umrechnung ist falsch. Die Suppe wird trotzdem gut.'),
  ], { effects: [give(R_BRU)], choices: [nochWas(), bye()] }),
]);

// ------------------------------------------------------------------------------------------- Rudi (über Marla oder Taubenpost)
const rudiWann = all(AKTIV, flag('jk_start'), { noItem: R_RUD }, noFlag('jk_fertig'));
const marla = beitrag('marla-sand', rudiWann, '„Kennen Sie Rudi? Den mit dem Diner in der Staubstraße?“', [
  node('jk-ma-start', [
    L('marla-sand', 'Rudi. Jeder kennt Rudi. Er kocht mit dem, was der Wind bringt. Manchmal bringt der Wind Kaktus. Manchmal Bolzen. Manchmal einen Reisenden.', 'neutral'),
    L('marla-sand', 'Für ein Kind, das kochen will? Ich hab sein Rezept im Kopf. Wer den Wind liest, vergisst keine Zutaten.', 'freude'),
    N('Sie kritzelt auf die Rückseite einer alten Speisekarte. Oben: „Rudis Eintopf“. Darunter: „Was da ist. Mehr davon.“ Dann, kleiner: „Salz nicht vergessen, du Idiot. – R.“'),
  ], { effects: [give(R_RUD), rel('marla-sand', 20)], choices: [nochWas(), bye()] }),
]);
const taube = beitrag('opa-gurrmann', rudiWann, '„Kann eine Ihrer Tauben bis in die Staubstraße fliegen? Zu Rudi?“', [
  node('jk-gu-start', [
    L('opa-gurrmann', 'In die Staubstraße? Bis zum Diner? Meine Hilde schafft das. Hilde schafft alles. Hilde hat mal einen Brief durch einen Sandsturm gebracht. Er war danach Sand, aber er war da.', 'freude'),
    L('opa-gurrmann', 'Zehn Credits für den Flug, zwei Stunden hin und zurück. Rudi antwortet immer. Rudi langweilt sich.'),
  ], {
    choices: [
      c('Zehn Credits zahlen und warten.', 'jk-gu-warten', { requires: { credits: 10 }, effects: [cr(-10)] }),
      c('„Ich hab keine zehn. Ich putz den Taubenschlag.“', 'jk-gu-putzen'),
    ],
  }),
  node('jk-gu-putzen', [N('Taubendrohnen machen keinen Dreck. Sie machen Öl. Viel Öl. Du putzt eine Stunde. Hilde schaut dir zu und klappert anerkennend.')], { effects: [zeit(60)], next: 'jk-gu-warten' }),
  node('jk-gu-warten', [
    N('Hilde startet mit einem Brummen. Zwei Stunden später landet sie wieder, mit Sand in den Rotoren und einer Speisekarte im Schnabel: „Rudis Eintopf. Was da ist. Mehr davon. Salz nicht vergessen, du Idiot. – R.“'),
  ], { effects: [zeit(120), give(R_RUD), rel('opa-gurrmann', 15)], choices: [nochWas(), bye()] }),
]);

export const beitraege: Beitrag[] = [start, kochen, babette, bruehe, marla, taube];

export const part: ContentPart = { quests: { [Q]: quest } };

