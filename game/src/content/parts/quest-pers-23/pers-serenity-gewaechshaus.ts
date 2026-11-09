// pers-serenity-gewaechshaus · „Grün auf Wellblech“ (world.md §6.5, Serenity, Akt 2). Start im Gespräch mit Serenity
// (npc-quantum/serenity-chrome.ts). Samen aus Serenitys Beet im Himmelsgarten (oder eigene `blumensamen`), Gewächshaus auf der
// Dachterrasse der Neon-Gasse: `[Technik 5]`, zwei Schrott-Ersatzteile, 120 Cr Material oder ohne Check einen Tag schuften.
// Dann pflanzt Serenity selbst. Belohnung: täglich eine Blume vom Dach (Geschenk), Serenity ♥ +100.
import type { QuestDef } from '../../../modules/contracts';
import type { ContentPart } from '../../part';
import {
  L, N, P, active, all, any, bye, byId, c, cc, chk, cr, credits, cut, dlg, done, flag, give, item, karten, msg, node, noFlag,
  noItem, rede, rel, schau, schritt, set, stelle, szene, tafel, take, time, zeit,
} from './_lib';

const Q = 'pers-serenity-gewaechshaus';
const SE = 'serenity-chrome';
const AKTIV = active(Q);
const SAMEN = 'blumensamen';
const HAT_SAMEN = any(item(SAMEN), flag('sg_gepflanzt'));
const GEBAUT = flag('sg_gebaut');

const quest: QuestDef = {
  id: Q, kind: 'personal', act: 2, giver: SE,
  title: 'Grün auf Wellblech',
  summary: 'Serenity Chrome will ein Gewächshaus. Nicht im Himmelsgarten, wo alles schon wächst, sondern auf einem Dach in der Unterstadt, wo es regnet und nach Rost riecht. Sie bringt Samen und Sonnenhut. Du bringst den Rest.',
  steps: [
    schritt('samen', 'Hol Samen aus Serenitys Beet im Himmelsgarten (oder bring eigene Blumensamen mit).', HAT_SAMEN, ['himmelsgarten', 'serenity-beet']),
    schritt('bau', 'Bau das Gewächshaus auf der Dachterrasse der Neon-Gasse.', GEBAUT, ['neon-gasse', 'dachterrasse']),
    schritt('pflanzen', 'Tagsüber: Pflanz mit Serenity die ersten Beete (Dachterrasse).', 'sg_gepflanzt', ['neon-gasse', 'dachterrasse'], { when: all(GEBAUT, HAT_SAMEN) }),
  ],
  reward: { xp: 260, relations: { [SE]: 100 }, rep: { unterstadt: 5, 'chrome-haus': 5 } },
};

// ------------------------------------------------------------------------------------------- Samen im Himmelsgarten
const beet = dlg('p23-sg-beet', [
  node('start', [
    N('Serenitys Beet im Himmelsgarten: ordentlich wie eine Bilanz, Reihe um Reihe, jede mit einem kleinen Schild in Schönschrift. Am Rand ein Tontopf mit Samentüten. Auf dem Topf: „Für das Dach. Nicht für Seraphina.“'),
  ], {
    choices: [
      c('Drei Tüten einstecken.', 'genommen', { effects: [give(SAMEN, 3)] }),
      bye('Liegen lassen.'),
    ],
  }),
  node('genommen', [N('Ringelblume, Kapuzinerkresse, Sonnenblume „Riesin der Ödnis“. Auf der letzten Tüte steht: „Wächst überall. Sogar bei Leuten, die nicht an sie glauben.“')], { effects: [msg('Blumensamen eingesteckt.')] }),
]);

// ------------------------------------------------------------------------------------------- Bau auf dem Dach
const bau = dlg('p23-sg-bau', [
  node('start', [
    N('Die Dachterrasse über der Neon-Gasse: Teerpappe, zwei Plastikstühle, ein Antennenmast, Aussicht auf eine Million Leuchtreklamen. In der Ecke liegt ein Stapel alter Fensterrahmen, die jemand vor Jahren hier hochgeschleppt und dann vergessen hat.'),
  ], {
    choices: [
      cc('Die Rahmen zu einem Gewächshaus zusammenschrauben, Folie spannen, Regenrinne als Bewässerung.', 'gebaut', chk('sg-bau', 'technik', 5, ['bauen', 'reparieren'])),
      c('Zwei Schrott-Ersatzteile als Scharniere und Streben verbauen.', 'gebaut', { when: item('schrott-ersatzteil', 2), effects: [take('schrott-ersatzteil', 2)] }),
      c('Bei Gustav Material bestellen und hochschleppen lassen (120 Cr).', 'gebaut', { requires: credits(120), effects: [cr(-120)] }),
      c('Einen Tag lang schleppen, sägen, fluchen. Ohne Plan, mit Ausdauer.', 'tag', { effects: [zeit(360)] }),
      bye('„Später.“'),
    ],
  }),
  node('tag', [N('Sechs Stunden. Du lernst, dass Fensterrahmen nicht gerade sind, dass Folie Wind liebt und dass Raven nachts auf dieser Terrasse sitzt und dir am Morgen einen Schraubenzieher hingelegt hat, ohne Kommentar.')], { next: 'gebaut' }),
  node('gebaut', [
    N('Am Ende steht da ein schiefes Glashaus aus zwölf verschiedenen Fenstern. Eins davon hat noch einen Aufkleber: „Bitte nicht klopfen“. Drinnen ist es warm. Draußen regnet es. Es ist das Schönste auf dem ganzen Dach.'),
  ], { effects: [set('sg_gebaut'), msg('Das Gewächshaus steht. Serenity kommt tagsüber zum Pflanzen.')] }),
]);

// ------------------------------------------------------------------------------------------- Pflanzen mit Serenity
const pflanzen = dlg('p23-sg-pflanzen', [
  node('start', [
    N('Serenity steht im Gewächshaus, Sonnenhut auf, Gummistiefel an, die nagelneu sind und rosa. Sie fasst ein Fenster an, dann noch eins. Ihre Hand zittert.'),
    L(SE, 'Das ist schief. Das ist völlig schief. Das ist das Beste, was ich je gesehen hab.', 'freude'),
  ], {
    choices: [
      c('Ihr die Samen geben.', 'saeen', { when: item(SAMEN), effects: [take(SAMEN)] }),
      bye('„Ich hol die Samen.“'),
    ],
  }),
  node('saeen', [
    N('Sie kniet sich in die Erde, ohne an die Hose zu denken. Steckt die Samen mit dem Finger rein, einen nach dem anderen, und redet dabei mit jedem. Du hörst „Halt durch“ und „Du schaffst das“ und einmal „Seraphina ist ein Biest, aber sie meint es gut“.'),
    L(SE, 'Im Himmelsgarten wächst alles, weil Quantum es bezahlt. Hier wächst es, weil es will. Das ist ein Unterschied. Ich wusste nicht, dass ich ihn spüren kann.', 'zaertlich'),
  ], {
    choices: [
      c('„Komm jeden Samstag. Ich gieße unter der Woche.“', 'ende'),
      c('„Gib ihnen Namen. Die halten länger, wenn sie Namen haben.“', 'namen'),
    ],
  }),
  node('namen', [L(SE, 'Die Sonnenblume heißt Bilanz. Die Ringelblume heißt Rendite. Die Kresse heißt … Kresse. Kresse ist ehrlich.', 'freude')], { next: 'ende' }),
  node('ende', [], { effects: [set('sg_gepflanzt'), rel(SE, 20), cut('p23-sg-blueten')] }),
]);

const blueten = szene('p23-sg-blueten', 'Grün auf Wellblech', [
  tafel('Zwei Wochen später, Neon-Gasse, Dachterrasse. Zwischen Leuchtreklamen ein schiefes Glashaus voller Gelb und Orange.', [
    N('Leute bleiben auf der Feuerleiter stehen und sehen hoch. Die Kinder vom Markt bringen Gießkannen aus alten Kanistern. Jemand hat ein Schild drangehängt: „Gewächshaus Chrome. Blumen umsonst. Wer klaut, gießt.“'),
  ]),
  tafel('Serenity schreibt dir eine Nachricht. Mit drei Blumen-Emojis und einem Foto von Kresse.', [
    P('Kresse sieht gut aus.'),
    L(SE, 'Kresse ist ehrlich. Ich sag ja.', 'freude'),
  ], 1400),
], [set('serenity_gewaechshaus'), msg('Neu: Auf der Dachterrasse der Neon-Gasse kannst du jeden Tag eine Blume pflücken.')]);

export const part: ContentPart = {
  quests: { [Q]: quest },
  dialogues: byId(beet, bau, pflanzen),
  cutscenes: { [blueten.id]: blueten },
  mapAdditions: karten([
    ['himmelsgarten', rede('p23-sg-beet', 'serenity-beet', 'Samentüten am Beet', beet.id, all(AKTIV, noItem(SAMEN), noFlag('sg_gepflanzt')), { kind: 'use' })],
    ['neon-gasse', rede('p23-sg-bau', 'dachterrasse', 'Gewächshaus bauen', bau.id, all(AKTIV, noFlag('sg_gebaut')), { kind: 'use' })],
    ['neon-gasse', stelle('p23-sg-serenity', SE, 'dachterrasse', pflanzen.id, all(AKTIV, GEBAUT, noFlag('sg_gepflanzt'), time('tag'))), 'npc'],
    ['neon-gasse', schau('p23-sg-blume', 'dachterrasse', 'Eine Blume aus dem Gewächshaus pflücken', [
      N('Im schiefen Glashaus blüht es. Du pflückst eine Orchidee, die eigentlich nicht hier wachsen dürfte. Sie tut es trotzdem.'),
    ], done(Q), { kind: 'loot', daily: true, effects: [give('orchidee')] })],
  ]),
};
