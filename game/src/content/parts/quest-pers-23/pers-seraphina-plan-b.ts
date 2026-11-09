// pers-seraphina-plan-b · „Plan B“ (world.md §6.5, Seraphina, Akt 2). Start im Penthouse-Gespräch (npc-quantum/seraphina-chrome.ts).
// Drei Lücken in beliebiger Reihenfolge: Generator (Gustav), Band (Lio), Catering (Babette). Jede mit Weg ohne Check.
// Gala abends auf der Promenade: der Generator stottert, `[Ausstrahlung 7]` Rede, Lio unplugged oder ein schneller Handgriff.
import type { QuestDef } from '../../../modules/contracts';
import type { ContentPart } from '../../part';
import {
  L, N, P, VEX, active, all, bye, byId, c, cc, chk, cr, credits, cut, dlg, flag, hearts, item, karten, msg, node, noFlag,
  rede, rel, schritt, set, stelle, szene, tafel, take, time,
} from './_lib';

const Q = 'pers-seraphina-plan-b';
const S = 'seraphina-chrome';
const G = 'opa-gustav';
const LIO = 'lio-funkel';
const B = 'babette-bao';
const AKTIV = active(Q);
const ALLES = all(flag('spb_generator'), flag('spb_band'), flag('spb_catering'));

const quest: QuestDef = {
  id: Q, kind: 'personal', act: 2, giver: S,
  title: 'Plan B',
  summary: 'Seraphina Chromes Gala steht auf der Kippe: Strom instabil, Band abgesagt, Catering verhaftet. Sie hat nie einen Plan B gebraucht. Jetzt ist der Plan B die Unterstadt.',
  steps: [
    schritt('generator', 'Besorg einen Generator (Gustav, Schrottmarkt).', 'spb_generator', ['schrottmarkt', 'schrottkram-stand']),
    schritt('band', 'Besorg eine Band (Lio: abends am Schrottmarkt, nachts in der Neon-Gasse).', 'spb_band', ['neon-gasse', 'lichterketten-bank']),
    schritt('catering', 'Besorg ein Catering (Babettes Garküche, Schrottmarkt).', 'spb_catering', ['schrottmarkt', 'garkueche']),
    schritt('gala', 'Abends: Rette die Gala auf der Promenade (Chrome-Boulevard).', 'spb_gala', ['chrome-boulevard', 'promenade'], { when: ALLES }),
  ],
  reward: { xp: 350, credits: 300, relations: { [S]: 100, [G]: 20, [LIO]: 20, [B]: 20 }, rep: { 'chrome-haus': 20, unterstadt: 5 } },
};

// ------------------------------------------------------------------------------------------- Gustav
const gustav = dlg('p23-spb-gustav', [
  node('start', [
    L(G, 'Ein Generator? Für die Chromes? Für eine GALA? Ich hab einen. Baujahr 2051, Diesel, klingt wie ein Bär mit Husten. Der hat die Flutnacht durchgebrummt.', 'freude'),
    L(G, 'Aber der Vergaser ist verharzt. Und ich verleih ihn nicht an Leute, die Kaviar auf Toast essen. Außer, die bezahlen. Oder du bist nett zu mir.'),
  ], {
    choices: [
      cc('Den Vergaser ausbauen, reinigen, wieder einsetzen.', 'laeuft', chk('spb-vergaser', 'technik', 5, ['reparieren'])),
      c('„Für mich, Gustav. Nicht für die Chromes.“', 'laeuft', { tag: '[Gustav ♥6]', requires: hearts(G, 6) }),
      c('Hundert Credits Leihgebühr auf den Tisch legen.', 'laeuft', { requires: credits(100), effects: [cr(-100)] }),
      c('„Was willst du dafür?“', 'deal'),
      bye('„Ich komm wieder.“'),
    ],
  }),
  node('deal', [
    L(G, 'Ich will, dass die da oben ihn hören. Einmal. Einen Abend lang soll der Chrome-Boulevard nach Schrottmarkt klingen. Das ist mein Preis. Den Rest kriegt ihr umsonst.', 'signatur'),
  ], { next: 'laeuft' }),
  node('laeuft', [
    N('Gustav zieht am Seilzug. Einmal, zweimal. Beim dritten Mal hustet der Bär, schüttelt sich und brummt. Tauben fliegen auf. Eine Lampe am Stand geht an, die seit Jahren kaputt war.'),
    L(G, 'Ich bring ihn mit dem Lastenaufzug hoch. Wenn einer von denen „Oh, wie rustikal“ sagt, stell ich ihn auf Volllast.', 'freude'),
  ], { effects: [set('spb_generator'), msg('Generator: Gustav bringt ihn hoch.')] }),
]);

// ------------------------------------------------------------------------------------------- Lio
const lio = dlg('p23-spb-lio', [
  node('start', [
    L(LIO, 'Eine Gala. Oben. Mit Leuten, die Applaus für etwas halten, das man mit Handschuhen macht.', 'neutral'),
    L(LIO, 'Ich hab nicht mal ein Hemd. Ich hab eine Jacke mit Lichterkette. Die Hälfte der Lämpchen ist kaputt.'),
  ], {
    choices: [
      c('„Genau das wollen die. Echt. Nicht gekauft.“', 'ja'),
      cc('„Spiel dein Album. Zum ersten Mal vor Leuten, die sich eine Platte leisten können.“', 'ja', chk('spb-lio', 'ausstrahlung', 5, ['ueberreden', 'musik']), { effects: [rel(LIO, 20)] }),
      c('„Zweihundert Credits Gage. Und ein Buffet.“', 'gage', { requires: credits(200), effects: [cr(-200)] }),
      c('„Du spielst. Ich trag deinen Verstärker. Und wir nehmen die Kinder vom Markt mit, die sollen mal Kristallleuchter sehen.“', 'kinder'),
    ],
  }),
  node('gage', [L(LIO, 'Zweihundert? Das ist mehr, als ich im Monat am Bahnhof … okay. Okay. Aber das Buffet ist nicht verhandelbar.', 'ueberrascht')], { next: 'ja' }),
  node('kinder', [L(LIO, 'Wenn Daria mit ihrem Klemmbrett zwischen den Chromes rumläuft und Bestellungen aufnimmt … dafür spiel ich umsonst.', 'freude')], { next: 'ja' }),
  node('ja', [
    L(LIO, 'Gut. Ich spiel. Erst leise, damit sie zuhören. Dann laut, damit sie nicht mehr anders können.', 'signatur'),
  ], { effects: [set('spb_band'), msg('Band: Lio spielt.')] }),
]);

// ------------------------------------------------------------------------------------------- Babette
const babette = dlg('p23-spb-babette', [
  node('start', [
    L(B, 'Catering? Für die OBERSTADT? Kindchen, die essen Schaum. Schaum mit Gold drauf. Ich mach Bao. Bao ist das Gegenteil von Schaum.', 'wut'),
    L(B, 'Und ich brauch Gemüse. Echtes. Nicht das Zeug von Quantum, das nach Hoffnung riecht und nach Pappe schmeckt.'),
  ], {
    choices: [
      c('Frisches Gemüse vom Aussiedlerhof auf den Tresen legen.', 'zusage', { when: item('frisches-gemuese'), effects: [take('frisches-gemuese'), rel(B, 20)] }),
      cc('„Die zahlen das Dreifache. Und alle sehen dein Schild: „Babettes Bao, Schrottmarkt“.“', 'zusage', chk('spb-babette', 'ausstrahlung', 5, ['ueberreden'])),
      c('Achtzig Credits für Zutaten dalassen.', 'zusage', { requires: credits(80), effects: [cr(-80)] }),
      c('„Dann mach Bao. Genau deshalb.“', 'trotz'),
    ],
  }),
  node('trotz', [L(B, 'Genau deshalb. Hm. Du hast recht. Die sollen mal was Ehrliches im Mund haben. Ich nehm Kohl. Viel Kohl.', 'signatur')], { next: 'zusage' }),
  node('zusage', [
    L(B, 'Zweihundert Bao, drei Töpfe Brühe, und wehe, einer sagt „Fingerfood“. Ich hab zehn Finger und alle kochen.', 'freude'),
  ], { effects: [set('spb_catering'), msg('Catering: Babette kocht.')] }),
]);

// ------------------------------------------------------------------------------------------- Gala
const gala = dlg('p23-spb-gala', [
  node('start', [
    N('Promenade, Abend. Kristalllampen an Seilen, weiße Tischdecken, Gäste in Kleidern, die mehr kosten als die Rohrsiedlung. Daneben, unübersehbar: Gustavs Generator, der brummt. Babettes Dampftöpfe, die dampfen. Lio auf einer Kiste, der stimmt.'),
    L(S, 'Es ist … laut. Es riecht nach Kohl. Die Hälfte meiner Gäste ist entsetzt. Die andere Hälfte hat schon drei Bao gegessen.', 'besorgt'),
    N('Dann hustet der Generator. Einmal, zweimal. Die Lampen flackern. Mitten in Seraphinas Begrüßung geht das Licht aus. Dreihundert reiche Leute halten den Atem an.'),
  ], {
    choices: [
      cc('Aufs Podest, ins Dunkle sprechen: „Willkommen in der Unterstadt. Hier geht manchmal das Licht aus. Dann rücken wir zusammen.“', 'rede', chk('spb-rede', 'ausstrahlung', 7, ['rede', 'ueberreden'])),
      c('Lio zuwinken: unplugged weiterspielen.', 'unplugged'),
      cc('Zum Generator. Gegen den Luftfilter treten, Choke rein.', 'tritt', chk('spb-tritt', 'technik', 4, ['reparieren'])),
      c('Gustav einfach machen lassen.', 'gustav'),
    ],
  }),
  node('rede', [
    N('Stille. Dann lacht jemand. Dann klatscht jemand. Dann geht ein Feuerzeug an, ein zweites, dreihundert. Die Gala leuchtet wie ein Hinterhof in der Neon-Gasse.'),
  ], { effects: [rel(S, 40)], next: 'licht' }),
  node('unplugged', [
    N('Lio spielt im Dunkeln, nur Gitarre und Stimme. Keiner redet. Man hört Babettes Töpfe und das Meer weit weg. Als das Licht zurückkommt, weinen zwei Gäste und einer davon ist der Kulturreferent.'),
  ], { effects: [rel(LIO, 20)], next: 'licht' }),
  node('tritt', [N('Ein Tritt, ein Klacken, ein Bärenbrüllen. Licht. Gustav nickt dir zu wie ein Kollege. Das ist bei ihm die höchste Auszeichnung.')], { effects: [rel(G, 20)], next: 'licht' }),
  node('gustav', [N('Gustav schlurft zum Generator, spricht mit ihm wie mit einem alten Hund, haut zweimal aufs Gehäuse. Licht. Dreihundert Gäste applaudieren einem Diesel.')], { next: 'licht' }),
  node('licht', [
    L(S, 'Das war … das war keine Gala. Das war ein Fest. Ich wusste nicht, dass wir das noch können.', 'freude'),
    L(S, '{name}. Ich vergesse nicht, wo Sie herkommen. Ich werde es mir merken. Das ist besser.', 'zaertlich'),
  ], {
    choices: [
      c('„Nächstes Mal ladet ihr den Schrottmarkt ein. Ohne Gala.“', 'ende'),
      c('„Aria hätte das Buffet leergefressen. Sag ihr nicht, dass ich das gesagt hab.“', 'ende', { when: VEX }),
      c('Ein Bao nehmen. Zwei.', 'ende'),
    ],
  }),
  node('ende', [], { effects: [set('spb_gala'), cut('p23-spb-fest')] }),
]);

const fest = szene('p23-spb-fest', 'Plan B', [
  tafel('Chrome-Boulevard, spät. Der Generator brummt, Lio spielt das dritte Zugabe-Lied.', [
    N('Daria nimmt Bestellungen auf einem Klemmbrett auf, Babette verteilt Brühe in Kristallgläsern. Ein Mann im Seidenanzug fragt Gustav nach dem Baujahr seines Generators. Sie reden zwei Stunden.'),
  ]),
  tafel('Seraphina Chrome zieht die Schuhe aus. Das hat sie seit der Schule nicht getan.', [
    P('Und? Plan B?'),
    L(S, 'Plan B war besser als Plan A. Sagen Sie es niemandem. Sie würden mir die Schwester wegnehmen.', 'freude'),
  ], 1600),
], [set('seraphina_gala_gerettet'), msg('Ruf Chrome-Haus steigt. Die Oberstadt hat Bao gegessen.')]);

export const part: ContentPart = {
  quests: { [Q]: quest },
  dialogues: byId(gustav, lio, babette, gala),
  cutscenes: { [fest.id]: fest },
  mapAdditions: karten([
    ['schrottmarkt', rede('p23-spb-gustav', 'schrottkram-stand', 'Gustav: Generator für die Gala', gustav.id, all(AKTIV, noFlag('spb_generator'), time('morgen', 'tag')))],
    ['schrottmarkt', rede('p23-spb-gustav-abend', 'wohnwagen', 'Gustav: Generator für die Gala', gustav.id, all(AKTIV, noFlag('spb_generator'), time('abend')))],
    ['schrottmarkt', rede('p23-spb-lio-markt', 'lio-ecke', 'Lio: Band für die Gala', lio.id, all(AKTIV, noFlag('spb_band'), time('abend')))],
    ['neon-gasse', rede('p23-spb-lio', 'lichterketten-bank', 'Lio: Band für die Gala', lio.id, all(AKTIV, noFlag('spb_band'), time('nacht')))],
    ['schrottmarkt', rede('p23-spb-babette', 'garkueche', 'Babette: Catering für die Gala', babette.id, all(AKTIV, noFlag('spb_catering'), time('morgen', 'tag')))],
    ['chrome-boulevard', stelle('p23-spb-seraphina', S, 'promenade', gala.id, all(AKTIV, ALLES, noFlag('spb_gala'), time('abend'))), 'npc'],
  ]),
};
