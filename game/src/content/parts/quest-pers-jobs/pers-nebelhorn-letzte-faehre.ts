// pers-nebelhorn-letzte-faehre · Das Leuchtfeuer auf der Bojeninsel (world.md §6.5).
// Lampe: Henk Angler (Flutmauer) – kaufen, `[Technik 5]` selbst bauen oder beim Angeln helfen (ohne Check).
// Reparatur auf der Insel: `[Technik 5]` oder mit Nebelhorns Seemannsknoten (ohne Check, dauert). Fähre fahren gehört dazu.
// Belohnung: Leuchtturm nachts (Flag `bojenfeuer_brennt`), Nebelhorn ♥ +120.
import type { QuestDef } from '../../../modules/contracts';
import type { ContentPart } from '../../part';
import {
  type Beitrag, L, N, active, all, any, beitrag, bye, byId, c, chk, cr, flag, give, hearts, item, node, noFlag, nochWas, rel, set,
  schritt, szene, tafel, take, zeit,
} from './_lib';

const Q = 'pers-nebelhorn-letzte-faehre';
const AKTIV = active(Q);
const NH = 'kaeptn-nebelhorn';
const HA = 'henk-angler';
const LAMPE = 'leuchtfeuer-lampe';

const quest: QuestDef = {
  id: Q, kind: 'personal', act: 1, giver: NH,
  title: 'Die letzte Fähre',
  summary: 'Auf der Bojeninsel, ganz am Rand der Bucht, steht ein Leuchtfeuer, das seit zwanzig Jahren dunkel ist. Käpt’n Nebelhorn war nie da. Zu nah am offenen Meer.',
  autoStart: hearts(NH, 3),
  steps: [
    schritt('nebelhorn', 'Sprich mit Käpt’n Nebelhorn (Hafenkante: Steg morgens und abends, Fähre tagsüber).', 'nf_start', { marker: { map: 'hafenkante' } }),
    { id: 'lampe', text: 'Besorg eine Leuchtfeuer-Lampe – Henk Angler am Leuchtturm der Flutmauer hat Ersatzteile.', done: item(LAMPE), when: all(flag('nf_start'), noFlag('nf_fertig')), marker: { map: 'flutmauer' } },
    schritt('fahrt', 'Fahr mit Nebelhorn zur Bojeninsel (Fähre, tagsüber) und bring das Feuer zum Brennen.', 'nf_fertig',
      { when: any(item(LAMPE), flag('nf_fertig')), marker: { map: 'hafenkante' } }),
  ],
  reward: { xp: 200, relations: { 'kaeptn-nebelhorn': 120, 'henk-angler': 20 } },
};

// ------------------------------------------------------------------------------------------- Nebelhorn
const start = beitrag(NH, all(AKTIV, noFlag('nf_start')), '„Das dunkle Leuchtfeuer da draußen. Was ist damit?“', [
  node('nf-n-start', [
    L(NH, 'Die Bojeninsel. Klar Schiff, da wär’n wir. Da draußen, hinter der dritten Boje, wo die Bucht aufhört und das Meer anfängt.', 'besorgt'),
    L(NH, 'Meine Großmutter hat das Feuer angezündet, jeden Abend, vierzig Jahre lang. Dann ist sie gestorben, und das Feuer mit. Ich bin nie hingefahren. Nicht ein Mal.', 'trauer'),
    L(NH, 'Ich fahr quer übers Becken und zurück. Tausendmal am Tag. Aber da raus? Da wo’s nicht mehr aufhört? Da hab ich Schiss, Landratte. Richtigen.'),
    N('Er bläst ins Horn. Leise. Es klingt wie eine Entschuldigung.'),
  ], {
    choices: [
      c('„Ich fahr mit. Und wir machen das Feuer wieder an.“', 'nf-n-ja', { effects: [set('nf_start'), rel(NH, 20)] }),
    ],
  }),
  node('nf-n-ja', [
    L(NH, 'Du … ja? Na dann, klar Schiff! Aber ohne Lampe brauchen wir gar nicht ablegen. Henk drüben an der Flutmauer hat sowas. Der hortet Leuchtturmzeug wie ich Muscheln.', 'freude'),
  ], { choices: [nochWas(), bye()] }),
]);

const fahrt = beitrag(NH, all(AKTIV, item(LAMPE), noFlag('nf_fertig')), 'Die Lampe hochhalten. „Leinen los, Käpt’n.“', [
  node('nf-f-start', [
    L(NH, 'Jetzt? Heute? … Gut. Gut, gut, gut. Klar Schiff. Ich hab nur kurz … Herzrasen. Das ist normal. Das ist Seemannsart.', 'besorgt'),
    N('Die Fähre legt ab. Am Ende des Beckens, wo er sonst wendet, wird Nebelhorn sehr still. Dann dreht er das Steuer nicht. Er fährt einfach weiter.'),
  ], { effects: [{ cutscene: 'pj-nf-insel' }] }),
]);

const insel = szene('pj-nf-insel', 'Die Bojeninsel', [
  tafel('Die Bojeninsel ist ein Felsen, eine Möwenkolonie und ein Leuchtturm, rostig wie ein alter Nagel. Die Tür klemmt. Drinnen: Großmutters Ölzeug am Haken, als käme sie gleich wieder.', [
    L(NH, 'Sie hat ihre Jacke hiergelassen. Zwanzig Jahre. Sie hat auf mich gewartet.', 'trauer'),
  ]),
], [{ dialogue: 'pj-nf-reparatur' }]);

// Reparatur nach der Ankunft (als eigener Dialog, damit Checks sichtbar sind).
const reparatur = {
  id: 'pj-nf-reparatur', start: 'start',
  nodes: [
    node('start', [N('Oben in der Laterne: eine leere Fassung, ein zerbrochener Spiegel, Kabel, die Möwen zum Nestbau benutzt haben. Die Lampe in deiner Hand ist schwer und warm.')], {
      choices: [
        c('Spiegel ausrichten, Kabel flicken, Lampe einsetzen.', 'licht', { check: chk('nf-feuer', 'technik', 5, ['reparieren', 'elektronik']) }),
        c('„Käpt’n. Ihre Knoten. Wir binden den Spiegel fest.“', 'knoten'),
      ],
    }),
    node('knoten', [
      L(NH, 'Palstek, Webeleinstek, Großmutters Doppelter. Ha! Den kann ich im Schlaf. Hab ich auch schon. Im Schlaf.', 'freude'),
      N('Zwei Stunden. Er knotet, du hältst. Die Möwen schauen zu und kommentieren alles.'),
    ], { effects: [zeit(120)], next: 'licht' }),
    node('licht', [N('Du legst den Schalter um.')], { effects: [take(LAMPE), { cutscene: 'pj-nf-feuer' }] }),
  ],
};
const feuer = szene('pj-nf-feuer', 'Das Feuer brennt', [
  tafel('Das Licht geht an. Es dreht sich. Ein heller Arm streicht über die Bucht, über den Hafen, über die Flutmauer – und hinaus aufs offene Meer.'),
  tafel('Nebelhorn steht an der Brüstung und sieht zum ersten Mal in seinem Leben nach draußen. Er bläst ins Horn. Laut. Weit draußen antwortet etwas. Vielleicht ein Schiff. Vielleicht das Echo.', [
    L(NH, 'Klar Schiff, Großmutter. Ich war da.', 'zaertlich'),
  ]),
], [set('nf_fertig'), set('bojenfeuer_brennt')]);

// ------------------------------------------------------------------------------------------- Henk
const henk = beitrag(HA, all(AKTIV, flag('nf_start'), { noItem: LAMPE }, noFlag('nf_fertig')), '„Nebelhorn will das Bojenfeuer anzünden. Hast du eine Lampe?“', [
  node('nf-h-start', [
    L(HA, 'Das Bojenfeuer? Der alte Nebelhorn? Der traut sich doch nicht mal, die Füße ins Wasser zu halten.', 'ueberrascht'),
    L(HA, 'Ich hab eine Signallampe. Eine richtige. Sechzig Credits, weil ich Leuchtturmwärter bin und Leuchtturmwärter nichts verdienen. Oder du baust dir eine aus meiner Kiste. Oder du hilfst mir beim Angeln, dann schenk ich sie dir.'),
  ], {
    choices: [
      c('Sechzig Credits zahlen.', 'nf-h-lampe', { requires: { credits: 60 }, effects: [cr(-60)] }),
      c('Aus Flaschenglas, einer Taschenlampe und Henks Kiste eine Lampe bauen.', 'nf-h-lampe', { check: chk('nf-lampe-bauen', 'technik', 5, ['reparieren', 'handwerk']) }),
      c('„Ich angle mit. Wie lange?“', 'nf-h-angeln'),
    ],
  }),
  node('nf-h-angeln', [
    N('Anderthalb Stunden. Ihr fangt zwei Fische, einen Stiefel und eine Flasche ohne Nachricht. Henk erzählt dir, wie man Nebel riecht. Es riecht nach Rost und Salz und ein bisschen nach Abschied.'),
  ], { effects: [zeit(90), rel(HA, 20)], next: 'nf-h-lampe' }),
  node('nf-h-lampe', [
    L(HA, 'Hier. Und sag dem alten Hasenfuß: Wenn er das wirklich macht, spendier ich ihm ein Bier. Ein ganzes.', 'freude'),
  ], { effects: [give(LAMPE)], choices: [nochWas(), bye()] }),
]);

export const beitraege: Beitrag[] = [start, fahrt, henk];

export const part: ContentPart = {
  quests: { [Q]: quest },
  dialogues: byId(reparatur),
  cutscenes: byId(insel, feuer),
};
