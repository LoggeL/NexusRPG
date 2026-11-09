// pers-babette-markttag · Marktfest gegen Quantums Imbisskette (world.md §6.5).
// Stände anwerben: Salzige Grete (Fisch), Lio (Musik), Opa Gustav (Licht am Kran) – je mit Weg ohne Check.
// Am Festabend: `[Ausstrahlung 6]` Rede gegen den Quantum-Promoter, Dampfnudel-Wettessen (ohne Check) oder Jakko kocht
// (nach pers-jakko-kochbuch). Belohnung: Marktfest jeden Monat (Flag `marktfest_monatlich`).
import type { QuestDef } from '../../../modules/contracts';
import type { ContentPart } from '../../part';
import {
  type Beitrag, L, N, P, active, all, beitrag, bye, byId, c, chk, cr, dlg, done, flag, hearts, item, node, noFlag, nochWas, rel,
  set, schritt, spotUse, szene, tafel, take, time, zeit,
} from './_lib';

const Q = 'pers-babette-markttag';
const AKTIV = active(Q);
const BB = 'babette-bao';

const quest: QuestDef = {
  id: Q, kind: 'personal', act: 1, giver: BB,
  title: 'Markttag',
  summary: 'Quantum stellt einen „SnackPoint“ auf den Schrottmarkt: Dampfnudeln aus dem Drucker, zwei Credits, schmecken nach Plastik und Reue. Babette will ein Marktfest, das man nicht vergisst.',
  autoStart: hearts(BB, 4),
  steps: [
    schritt('babette', 'Sprich mit Babette an der Garküche über Quantums SnackPoint.', 'mt_start', { marker: { map: 'schrottmarkt' } }),
    schritt('grete', 'Wirb Salzige Grete an: Fisch fürs Fest (Hafenkante, morgens und tagsüber).', 'mt_grete', { when: flag('mt_start'), marker: { map: 'hafenkante' } }),
    schritt('lio', 'Wirb Lio Funkel an: Musik fürs Fest (Bahnhof Mitte tagsüber, Schrottmarkt abends).', 'mt_lio', { when: flag('mt_start'), marker: { map: 'bahnhof-mitte' } }),
    schritt('gustav', 'Bitte Opa Gustav um Licht: Lichterketten am Kran.', 'mt_gustav', { when: flag('mt_start'), marker: { map: 'schrottmarkt' } }),
    schritt('fest', 'Das Marktfest beginnt: abends auf dem Marktplatz.', 'mt_fertig',
      { when: all(flag('mt_grete'), flag('mt_lio'), flag('mt_gustav')), marker: { map: 'schrottmarkt' } }),
  ],
  reward: { xp: 200, relations: { 'babette-bao': 100, jakko: 20 }, rep: { unterstadt: 10 } },
};

// ------------------------------------------------------------------------------------------- Babette
const start = beitrag(BB, all(AKTIV, noFlag('mt_start')), '„Was ist das für ein Plastikkasten da drüben? SnackPoint?“', [
  node('mt-b-start', [
    L(BB, 'Das? Das ist Quantum. Ein Kasten, der Dampfnudeln druckt. DRUCKT, Kindchen! Zwei Credits das Stück. Die Kinder stehen Schlange, weil’s billig ist.', 'wut'),
    L(BB, 'Ich hab eine aufgemacht. Innen war Schaum. Rosa Schaum. Meine Großmutter hat eine Flut überlebt, damit ich rosa Schaum sehen muss?', 'trauer'),
    L(BB, 'Ich will ein Fest. Ein richtiges Marktfest. Mit Fisch, Musik, Licht und echten Dampfnudeln. Damit jeder sieht, was der Schrottmarkt ist. Hilfst du mir?'),
  ], {
    choices: [
      c('„Fest klingt gut. Wen brauchen wir?“', 'mt-b-ja', { effects: [set('mt_start')] }),
    ],
  }),
  node('mt-b-ja', [
    L(BB, 'Salzige Grete für Fisch – die mag mich nicht, aber sie hasst Quantum mehr. Lio für Musik. Und Gustav soll Licht an seinen Kran hängen. Wenn der Kran leuchtet, kommt die ganze Unterstadt.', 'freude'),
  ], { choices: [nochWas(), bye()] }),
]);

// ------------------------------------------------------------------------------------------- Stände
const grete = beitrag('salzige-grete', all(AKTIV, flag('mt_start'), noFlag('mt_grete')), '„Babette macht ein Marktfest. Gegen Quantum. Machst du Fisch?“', [
  node('mt-g-start', [
    L('salzige-grete', 'Babette? Die mit den Nudeln, die meinem Fisch die Kundschaft klauen? … Gegen Quantum, sagst du?', 'neutral'),
    L('salzige-grete', 'Quantum hat mir einen Fischdrucker angeboten. Einen FISCHDRUCKER. Ich hab dem Vertreter einen Hering in die Aktentasche gesteckt. Einen lebenden.'),
  ], {
    choices: [
      c('„Dann zeig ihnen, wie echter Fisch riecht.“', 'mt-g-ja'),
      c('„Ich kauf dir vorab zwanzig Credits Fisch ab. Für die Stimmung.“', 'mt-g-ja', { requires: { credits: 20 }, effects: [cr(-20), rel('salzige-grete', 20)] }),
    ],
  }),
  node('mt-g-ja', [L('salzige-grete', 'Ich bring die Räucherkiste. Und sag Babette: Wenn ihre Nudeln nach Fisch riechen, ist das Absicht.', 'freude')], {
    effects: [set('mt_grete')], choices: [nochWas(), bye()],
  }),
]);
const lio = beitrag('lio-funkel', all(AKTIV, flag('mt_start'), noFlag('mt_lio')), '„Marktfest am Schrottmarkt. Babette braucht Musik.“', [
  node('mt-l-start', [
    L('lio-funkel', 'Ein Fest? Mit Licht und Fisch und Nudeln? Ich schreib ein Lied. Ich schreib es jetzt. „Der Kasten druckt Nudeln, die Nudeln sind rosa …“', 'freude'),
    L('lio-funkel', 'Mist, reimt sich nicht. Oder doch. Auf „Mimosa“. Wer isst Mimosa? Egal. Ich komm.'),
  ], {
    choices: [
      c('„Du kriegst das Lied hin. Ich hör’s schon.“', 'mt-l-ja', { effects: [rel('lio-funkel', 15)] }),
      c('Ihm ein Akkordeon-Balg hinlegen. „Für mehr Luft.“', 'mt-l-ja', { when: item('akkordeon-balg'), effects: [take('akkordeon-balg'), rel('lio-funkel', 60)] }),
    ],
  }),
  node('mt-l-ja', [L('lio-funkel', 'Ich spiel, bis die Rostregenwolken tanzen. Sag Babette, ich nehm meine Gage in Dampfnudeln.', 'zaertlich')], {
    effects: [set('mt_lio')], choices: [nochWas(), bye()],
  }),
]);
const gustav = beitrag('opa-gustav', all(AKTIV, flag('mt_start'), noFlag('mt_gustav')), '„Babette macht ein Fest. Häng Licht an deinen Kran?“', [
  node('mt-gu-start', [
    L('opa-gustav', 'Lichter am Kran? Wie früher, zur Wintersonnenwende? Ach du grüne Neune. Ich hab noch Lichterketten. Drei Kilometer. Die Hälfte geht.', 'freude'),
    L('opa-gustav', 'Aber ich bin alt. Wer klettert?'),
  ], {
    choices: [
      c('Den Kran hochklettern und die Ketten aufhängen.', 'mt-gu-klettern', { check: chk('mt-kran', 'reflexe', 4, ['klettern']) }),
      c('„Ich halt die Leiter. Du kletterst. Langsam.“', 'mt-gu-langsam'),
    ],
  }),
  node('mt-gu-klettern', [N('Du hängst Lichterketten bis zur Spitze. Von oben siehst du den SnackPoint – ein grauer Kasten in einem Meer aus Buden. Er wirkt plötzlich sehr klein.')], {
    effects: [set('mt_gustav'), rel('opa-gustav', 20)], choices: [nochWas(), bye()],
  }),
  node('mt-gu-langsam', [N('Gustav klettert. Sehr langsam. Er erzählt bei jeder Sprosse eine Geschichte. Es sind vierzig Sprossen. Zwei Stunden später leuchtet der Kran.')], {
    effects: [zeit(120), set('mt_gustav'), rel('opa-gustav', 15)], choices: [nochWas(), bye()],
  }),
]);

export const beitraege: Beitrag[] = [start, grete, lio, gustav];

// ------------------------------------------------------------------------------------------- Festabend
const fest = dlg('pj-mt-fest', [
  node('start', [
    N('Der Kran leuchtet wie ein Weihnachtsbaum, der zu viel getrunken hat. Grete räuchert, Lio spielt, Babette dampft. Die halbe Unterstadt ist da.'),
    N('Neben dem SnackPoint steht ein Quantum-Promoter in Glanzweste und ruft durch ein Megafon: „Zwei Credits! Gedruckt in Sekunden! Garantiert ohne Großmutter!“'),
    L(BB, 'Ich bring ihn um. Ich bring ihn mit einem Kochlöffel um.', 'wut'),
  ], {
    choices: [
      c('Auf Gustavs Kiste steigen. Die Menge übernehmen.', 'rede', { check: chk('mt-rede', 'ausstrahlung', 6, ['rede', 'ueberzeugen']) }),
      c('„Wettessen! Dampfnudeln gegen Druckwerk! Wer zuerst kotzt, verliert!“', 'wettessen'),
      c('„Jakko. Dein Eintopf. Jetzt.“', 'jakko', { when: done('pers-jakko-kochbuch') }),
    ],
  }),
  node('rede', [
    P('Die da druckt dir Essen. Babette kocht es dir. Der Kasten weiß nicht, wie du heißt. Babette weiß es seit fünf Jahren und schreibt trotzdem an. Wer von beiden ist Unterstadt?', 'signatur'),
    N('Einen Herzschlag lang nichts. Dann johlt jemand „BABETTE!“, und die ganze Menge johlt mit. Der Promoter versucht, das Megafon lauter zu drehen. Das Megafon gibt auf.'),
  ], { next: 'ende' }),
  node('wettessen', [
    N('Zwei Freiwillige. Einer isst Babettes Dampfnudeln, einer die gedruckten. Nach drei Stück schaut der zweite sehr ernst. Nach vier rennt er hinter den Kran. Der erste bestellt Nachschlag.'),
    L(BB, 'Das nennt man Marktforschung, Kindchen.', 'signatur'),
  ], { effects: [zeit(30)], next: 'ende' }),
  node('jakko', [
    L('jakko', 'Jakkos Eintopf! Rezept von drei Köchen und mir! Kostet nichts, wer Hunger hat, und zwei Credits, wer angibt!', 'freude'),
    N('Die Schlange vor Jakkos Topf ist länger als die vor dem SnackPoint. Dann ist vor dem SnackPoint gar keine mehr.'),
  ], { effects: [rel('jakko', 30)], next: 'ende' }),
  node('ende', [N('Lio spielt bis nach Mitternacht. Der Kran leuchtet noch, als alle schon schlafen.')], { effects: [{ cutscene: 'pj-mt-fest-szene' }] }),
]);
const festSzene = szene('pj-mt-fest-szene', 'Markttag', [
  tafel('Am nächsten Morgen ist der SnackPoint weg. Auf dem Fleck, wo er stand, liegt eine einzelne rosa Dampfnudel. Niemand fasst sie an.'),
  tafel('Babette hängt ein Schild an die Garküche: „MARKTFEST – JEDEN MONAT. ECHTES ESSEN. ECHTE LEUTE. KEIN SCHAUM.“', [
    L(BB, 'Du kommst nächsten Monat wieder. Du kommst jeden Monat. Und du isst zwei. Das ist ein Befehl.', 'freude'),
  ]),
], [set('mt_fertig'), set('marktfest_monatlich')]);

export const part: ContentPart = {
  quests: { [Q]: quest },
  dialogues: byId(fest),
  cutscenes: byId(festSzene),
  mapAdditions: {
    schrottmarkt: {
      hotspots: [
        spotUse('pj-mt-festplatz', 'marktplatz-mitte', 'Marktfest eröffnen', fest.id,
          all(AKTIV, flag('mt_grete'), flag('mt_lio'), flag('mt_gustav'), noFlag('mt_fertig'), time('abend'))),
      ],
    },
  },
};

