// pers-marla-brunnen · „Tiefer graben“ (world.md §6.5, Marla, Akt 2). Start am Brunnen des Aussiedlerhofs (Marla morgens,
// npc-oednis/folgen.ts). Elsa leiht den alten Bohrkopf, dann wird gebohrt: `[Körper 6]` Kurbel, `[Technik 6]` Ziegenroboter
// als Motor, Rostlauben-Batterie als Antrieb oder ohne Check einen ganzen Tag in Schichten mit den Aussiedlern.
// Belohnung: eigenes Feld (maps-23/aussiedlerhof.ts schaltet es über den Queststatus frei), Marla ♥ +100, Ruf aussiedler.
import type { QuestDef } from '../../../modules/contracts';
import type { ContentPart } from '../../part';
import {
  ACT2, L, MASTER, N, P, active, all, any, bild, bye, byId, c, cc, chk, cut, dlg, ding, flag, give, hearts, inactive,
  item, karten, msg, node, noFlag, not, rede, rel, schritt, set, startQ, szene, tafel, tage, take, time, zeit,
} from './_lib';

const Q = 'pers-marla-brunnen';
const M = 'marla-sand';
const E = 'elsa';
const BOHR = 'p23-bohrkopf';
const AKTIV = active(Q);

const quest: QuestDef = {
  id: Q, kind: 'personal', act: 2, giver: M,
  title: 'Tiefer graben',
  summary: 'Der Brunnen am Aussiedlerhof zieht Sand statt Wasser. Marla sagt, zwanzig Meter tiefer liegt eine Ader, die seit der Flut keiner angefasst hat. Elsa hat einen Bohrkopf. Jemand muss kurbeln.',
  steps: [
    schritt('bohrkopf', 'Leih dir bei Elsa den alten Bohrkopf (Aussiedlerhof, Werkstatt).', any(item(BOHR), flag('mb_gebohrt')), ['aussiedlerhof', 'elsas-werkstatt']),
    schritt('bohren', 'Bohr den Brunnen tiefer (Aussiedlerhof, Brunnen).', 'mb_gebohrt', ['aussiedlerhof', 'brunnen'], { when: any(item(BOHR), flag('mb_gebohrt')) }),
  ],
  reward: { xp: 320, relations: { [M]: 100, [E]: 20 }, rep: { aussiedler: 15 }, items: { hofhonig: 2 } },
};

const bohrkopf = ding(BOHR, 'Alter Bohrkopf', 'Ein Bohrkopf aus Hartmetall, so schwer wie ein schlechtes Gewissen. Elsa hat „NICHT VERLIEREN“ mit Schweißnaht draufgeschrieben.', 'rohrzange');

// ------------------------------------------------------------------------------------------- Auftakt (Marla am Brunnen)
const auftakt = dlg('p23-mb-auftakt', [
  node('start', [
    N('Marla kurbelt an der Handpumpe. Es gurgelt, spuckt, und in den Eimer fällt ein Strahl, der zur Hälfte aus Sand besteht. Sie kippt ihn in die Beete, ohne hinzusehen.'),
    L(M, 'Jeden Monat einen Meter weniger. Der Pegel sinkt, der Sand steigt. Irgendwann pumpen wir die Ödnis und trinken sie.', 'besorgt'),
    L(M, 'Unter uns liegt eine zweite Ader. Tiefer. Die Alten sagen, vor der Flut war hier ein Bach. Man müsste bohren. Zwanzig Meter. Mit Muskeln, die wir nicht mehr haben.'),
  ], {
    choices: [
      c('„Ich hab Muskeln. Und schlechte Ideen. Lass uns bohren.“', 'ja', { effects: [startQ(Q)] }),
      c('„Was ist mit Brösel? Der verkauft doch Wasser.“', 'broesel'),
      bye('„Ich denk drüber nach.“'),
    ],
  }),
  node('broesel', [
    L(M, 'Brösel verkauft Wasser, das er uns vorher geklaut hat. Er hat die alte Leitung vom Pumpenhaus umgeleitet. Jeder Becher bei ihm ist ein Becher, der in unseren Beeten fehlt.', 'wut'),
    L(M, 'Ein tiefer Brunnen, und der kleine Hutständer kann seinen Stand zusammenklappen.'),
  ], { next: 'start' }),
  node('ja', [
    L(M, 'Gut. Elsa hat einen Bohrkopf, irgendwo zwischen Schrott und Gerümpel. Frag sie. Sag ihr, ich hab gesagt „bitte“. Ich hab das nicht gesagt. Aber sag es trotzdem.', 'freude'),
  ], { effects: [msg('Marla will den Brunnen tiefer bohren. Elsa hat einen Bohrkopf.')] }),
]);

// ------------------------------------------------------------------------------------------- Elsa
const elsa = dlg('p23-mb-elsa', [
  node('start', [
    L(E, 'Den Bohrkopf? Für Marlas Brunnen? Natürlich. Ich hab den seit zwölf Jahren. Ich hab ihn nie benutzt, weil keiner verrückt genug war, zwanzig Meter von Hand zu kurbeln.', 'freude'),
    L(E, 'Du siehst verrückt genug aus. Das mein ich als Kompliment.'),
  ], {
    choices: [
      c('Den Bohrkopf schultern.', 'gegeben', { effects: [give(BOHR)] }),
      cc('„Zeig mir, wie man ihn ans Gestänge koppelt.“', 'kupplung', chk('mb-kupplung', 'technik', 4, ['reparieren']), { effects: [give(BOHR), set('mb_kupplung')] }),
    ],
  }),
  node('kupplung', [
    N('Elsa zeigt dir den Bajonettverschluss, die Sicherung und den Trick mit dem Fuß gegen das Gestänge, falls er sich verkantet. Du vergisst die Hälfte. Die wichtige Hälfte behältst du.'),
  ], { next: 'gegeben' }),
  node('gegeben', [L(E, 'Wenn er bricht, bringst du mir die Stücke. Wenn du brichst, bringt Marla mir deine. Viel Glück.', 'signatur')]),
]);

// ------------------------------------------------------------------------------------------- Bohren
const bohren = dlg('p23-mb-bohren', [
  node('start', [
    N('Gestänge, Dreibein, Kurbel. Der Bohrkopf sitzt. Unter dir zwanzig Meter Sand, Lehm, Glas und Vergangenheit. Marla stellt sich mit verschränkten Armen daneben. Ein paar Aussiedler kommen dazu, mit Tee, Meinungen und Wetten.'),
    L(M, 'Fünf Credits, dass du bei Meter acht aufgibst. Ich setz auf dich. Die anderen nicht.', 'signatur'),
  ], {
    choices: [
      cc('Selbst kurbeln. Meter um Meter, bis die Arme brennen.', 'kurbel', chk('mb-kurbel', 'koerper', 6, ['kraft', 'ausdauer'])),
      cc('Den Ziegenroboter umbauen: Laufwerk an die Kurbel, er geht im Kreis, der Bohrer dreht.', 'ziege', chk('mb-ziege', 'technik', 6, ['reparieren', 'basteln'])),
      c('Die Rostlauben-Batterie an Elsas alten Motor klemmen.', 'batterie', { when: item('rostlaube-batterie'), effects: [take('rostlaube-batterie')] }),
      c('Schichten einteilen: jeder kurbelt eine Stunde, du die längste.', 'schichten', { effects: [zeit(480)] }),
      bye('„Morgen. Ich brauch Frühstück.“'),
    ],
  }),
  node('kurbel', [
    N('Meter drei: Sand. Meter acht: die Aussiedler zahlen Marla fünf Credits. Meter zwölf: Lehm, zäh wie Ripper beim Bezahlen. Meter neunzehn: deine Arme sind nicht mehr deine Arme. Meter zwanzig: es knackt.'),
  ], { next: 'wasser' }),
  node('ziege', [
    N('Der Ziegenroboter protestiert, meckert digital und läuft dann im Kreis, Runde um Runde, mit dem Gesichtsausdruck eines Wesens, das sein Leben überdenkt. Die Kurbel dreht. Der Bohrer frisst sich nach unten.'),
    L(M, 'Wenn er danach keine Milch mehr gibt, bist du schuld. Er hat nie Milch gegeben. Aber trotzdem.', 'freude'),
  ], { next: 'wasser' }),
  node('batterie', [
    N('Die Batterie brummt, Elsas alter Motor raucht, hustet, läuft. Der Bohrer singt. Die Aussiedler verlieren ihre Wetten, weil keiner auf „Motor“ gesetzt hat.'),
  ], { next: 'wasser' }),
  node('schichten', [
    N('Acht Stunden. Jeder kurbelt. Juna kurbelt und singt, die Kinder kurbeln zu zweit, ein alter Mann kurbelt mit einem Arm und erzählt dabei von seiner Hüfte. Du kurbelst am längsten. Bei Meter zwanzig lehnt Marla sich auf die Kurbel, um dir die letzte Umdrehung abzunehmen.'),
  ], { effects: [rel(M, 20)], next: 'wasser' }),
  node('wasser', [
    N('Ein Gurgeln, tief unten. Dann ein Zischen. Dann steigt im Rohr ein Geräusch hoch, das hier draußen keiner mehr kennt: kaltes Wasser, das nach oben will.'),
  ], { effects: [take(BOHR), set('mb_gebohrt'), cut('p23-mb-quelle')] }),
]);

const quelle = szene('p23-mb-quelle', 'Wasser', [
  tafel('Der Brunnen spuckt. Erst braun, dann grau, dann klar.', [
    N('Marla hält die Hand in den Strahl. Sie sagt nichts. Sie hält einfach die Hand rein, bis sie zittert, weil das Wasser so kalt ist.'),
  ]),
  bild('cut-marla-brunnen', 'in', 'Die Kinder tanzen unter dem Rohr. Elsa schreit „NICHT VERSCHWENDEN!“ und tanzt dann mit.', [
    L(M, 'Das Feld hinter den Beeten. Das, wo nie was gewachsen ist. Das gehört jetzt dir. Pflanz was. Pflanz irgendwas, was nicht nach Staub schmeckt.', 'zaertlich'),
    P('Kartoffeln?'),
    L(M, 'Kartoffeln schmecken nach Staub. Aber nach gutem Staub.', 'freude'),
  ], 1800),
], [set('marla_brunnen_tief'), msg('Neu: Dein eigenes Feld am Aussiedlerhof.')]);

export const part: ContentPart = {
  quests: { [Q]: quest },
  items: { [BOHR]: bohrkopf },
  dialogues: byId(auftakt, elsa, bohren),
  cutscenes: { [quelle.id]: quelle },
  mapAdditions: karten([
    ['aussiedlerhof', rede('p23-mb-auftakt', 'brunnen', 'Marla: Was ist mit dem Brunnen?', auftakt.id,
      all(ACT2, not(MASTER), inactive(Q), any(hearts(M, 4), { rep: 'aussiedler', min: 20 }), time('morgen'), not(tage('sa'))))],
    ['aussiedlerhof', rede('p23-mb-elsa', 'elsas-werkstatt', 'Elsa nach dem Bohrkopf fragen', elsa.id,
      all(AKTIV, { noItem: BOHR }, noFlag('mb_gebohrt'), time('morgen', 'tag')))],
    ['aussiedlerhof', rede('p23-mb-bohren', 'brunnen', 'Den Brunnen tiefer bohren', bohren.id,
      all(AKTIV, item(BOHR), noFlag('mb_gebohrt'), time('morgen', 'tag')), { kind: 'use' })],
  ]),
};
