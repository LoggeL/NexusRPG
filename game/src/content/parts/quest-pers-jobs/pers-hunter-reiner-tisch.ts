// pers-hunter-reiner-tisch · Versöhnung mit Hunter (world.md §4.2/§6.5; Start im Rivalen-Menü von npc-crew-a/hunter.ts).
// 1) Schulden begleichen: 150 Cr bar (ohne Check) oder `[Ausstrahlung 6]` auf 100 Cr runterreden.
// 2) Ein Abend hinter der Bar: Bar-Minispiel, `[Ausstrahlung 5]` eine Schlägerei wegreden oder stumm Gläser spülen (ohne Check).
// Ergebnis: Rivalität auf 0 (`reconcile`).
import type { QuestDef } from '../../../modules/contracts';
import type { ContentPart } from '../../part';
import {
  type Beitrag, L, N, P, active, all, beitrag, bye, byId, c, chk, cr, dlg, flag, node, noFlag, nochWas, set, schritt, spotUse,
  time, zeit,
} from './_lib';

const Q = 'pers-hunter-reiner-tisch';
const AKTIV = active(Q);
const H = 'hunter';
const SUMME = 150;
const RABATT = 100;

const quest: QuestDef = {
  id: Q, kind: 'personal', act: 1, giver: H,
  title: 'Reiner Tisch',
  summary: 'Hunter und du, ihr seid fertig miteinander. Fast. Er will sein Geld. Alles. Und einen Abend, an dem du hinter seiner Bar stehst und lächelst.',
  autoStart: { rival: H },
  steps: [
    schritt('schulden', `Begleich deine Schulden bei Hunter (${SUMME} Cr).`, 'ht_bezahlt', { marker: { map: 'high-voltage' } }),
    schritt('bar', 'Arbeite einen Abend hinter der Bar im High Voltage (abends am Tresen).', 'ht_schicht', { when: flag('ht_bezahlt'), marker: { map: 'high-voltage' } }),
    schritt('hunter', 'Rede mit Hunter.', 'ht_fertig', { when: flag('ht_schicht'), marker: { map: 'high-voltage' } }),
  ],
  reward: { xp: 150, rep: { 'crew-hunter': 10 } },
};

// ------------------------------------------------------------------------------------------- Hunter
const schulden = beitrag(H, all(AKTIV, noFlag('ht_bezahlt')), '„Ich bin hier, um zu zahlen.“', [
  node('ht-s-start', [
    L(H, 'Zahlen. Du. Das hab ich noch nie erlebt. Warte, ich hol mein Buch.', 'signatur'),
    N('Er knallt ein Notizbuch auf den Tresen. Dein Name steht oben. In Rot. Mit drei Ausrufezeichen und einer kleinen Zeichnung von einem Galgen.'),
    L(H, `Doppelte Miete, drei zerbrochene Gläser, ein Barhocker, ein Ruf. ${SUMME} Credits. Der Ruf ist geschätzt.`, 'wut'),
  ], {
    choices: [
      c(`${SUMME} Credits auf den Tresen zählen.`, 'ht-s-bezahlt', { requires: { credits: SUMME }, effects: [cr(-SUMME)] }),
      c('„Der Barhocker war schon vorher kaputt. Und den Ruf hast du dir selbst ruiniert. Hundert.“', 'ht-s-rabatt',
        { check: chk('ht-rabatt', 'ausstrahlung', 6, ['ueberreden', 'feilschen']) }),
      c('„Ich komm wieder, wenn ich’s hab.“', 'ht-s-spaeter'),
    ],
  }),
  node('ht-s-rabatt', [
    L(H, 'Der Barhocker … war wackelig, ja. Weil DU auf ihm gesessen hast. Aber gut. Hundert. Und ich streich den Galgen.', 'wut'),
  ], {
    choices: [
      c(`${RABATT} Credits zahlen.`, 'ht-s-bezahlt', { requires: { credits: RABATT }, effects: [cr(-RABATT)] }),
      c('„Ich hol das Geld.“', 'ht-s-spaeter'),
    ],
  }),
  node('ht-s-spaeter', [L(H, 'Ich zähl mit. Ich zähl immer mit.', 'signatur')], { choices: [nochWas(), bye()] }),
  node('ht-s-bezahlt', [
    N('Hunter zählt nach. Zweimal. Dann streicht er deinen Namen durch. Mit Lineal.'),
    L(H, 'Erster Teil erledigt. Zweiter Teil: ein Abend. Hinter dem Tresen. Abends, wenn’s voll ist. Sei pünktlich. Pünktlich heißt bei mir: vor mir.'),
  ], { effects: [set('ht_bezahlt')], choices: [nochWas(), bye()] }),
]);

const versoehnung = beitrag(H, all(AKTIV, flag('ht_schicht'), noFlag('ht_fertig')), '„Und? Sind wir quitt?“', [
  node('ht-v-start', [
    L(H, 'Quitt. Hm.', 'signatur'),
    N('Er gießt zwei Gläser ein. Das teure Zeug, das unter dem Tresen steht und das er niemandem anbietet. Er schiebt dir eins hin.'),
    L(H, 'Weißt du, was ich an Schulden mag? Man kann sie begleichen. Bei Menschen geht das selten. Du hast beides gemacht.'),
    L(H, 'Reiner Tisch. Wenn du ihn wieder dreckig machst, wisch ich ihn mit dir ab.', 'freude'),
  ], {
    effects: [{ reconcile: H }, set('ht_fertig')],
    choices: [
      c('Anstoßen.', 'ht-v-prost'),
      c('„Du hast gerade fast was Nettes gesagt.“', 'ht-v-nett'),
    ],
  }),
  node('ht-v-prost', [N('Die Gläser klingen. Hunter trinkt aus, stellt das Glas ab und schreibt in sein Buch. Neue Seite. Dein Name. In Schwarz.')]),
  node('ht-v-nett', [L(H, 'Fast. Erzähl’s keinem. Sonst wollen hier alle Rabatt.', 'signatur')]),
]);

export const beitraege: Beitrag[] = [schulden, versoehnung];

// ------------------------------------------------------------------------------------------- Barschicht
const schicht = dlg('pj-ht-schicht', [
  node('start', [
    N('Freitagsgefühl, egal welcher Tag. Der Laden ist voll, die Musik zu laut, und Hunter wirft dir ein Handtuch zu. „Lächeln.“ Du lächelst. Er schaudert.'),
  ], {
    choices: [
      c('Ran an die Zapfhähne. Bestellungen, Shaker, Wechselgeld.', 'bar-mini', {
        effects: [{
          minigame: 'akt-barschicht', level: 2, key: 'hunter-reiner-tisch', label: 'Abend hinter der Bar',
          win: [{ message: 'Kein Glas verschüttet, kein Gast vergessen. Hunter nickt. Einmal. Das ist bei ihm eine Ehrenmedaille.' }],
          lose: [{ message: 'Zwei Gläser hin, ein Gast nass. Hunter schreibt es nicht auf. Diesmal nicht.' }],
        }],
      }),
      c('Gläser spülen. Den ganzen Abend. Klappe halten.', 'spuelen'),
    ],
  }),
  node('bar-mini', [N('Gegen Mitternacht knallt es am Billardtisch. Zwei Rostzähne gehen aufeinander los, einer hat ein Queue, der andere einen Bierkrug.')], {
    choices: [
      c('Dazwischengehen: „Jungs. Freirunde, wenn ihr euch hinsetzt. Keine, wenn ich die Polizei rufe. Und die Polizei ist Hunter.“', 'beruhigt',
        { check: chk('ht-schlaegerei', 'ausstrahlung', 5, ['ueberreden', 'beruhigen']) }),
      c('Bruno winken und weiterzapfen.', 'bruno'),
    ],
  }),
  node('beruhigt', [N('Die beiden setzen sich. Einer entschuldigt sich sogar. Beim Queue.'), L(H, 'Hm. Nicht schlecht. Die Freirunde zahlst du.', 'signatur')], { next: 'ende' }),
  node('bruno', [N('Bruno Brecher kommt, nimmt jeden unter einen Arm und trägt beide raus. Es dauert vier Sekunden. Der Laden klatscht.')], { next: 'ende' }),
  node('spuelen', [
    N('Sechs Stunden. Siebenhundert Gläser. Ein Becher, in dem etwas lebt. Du sagst kein Wort. Hunter sieht dir zwischendurch zu und sagt auch keins.'),
  ], { effects: [zeit(240)], next: 'ende' }),
  node('ende', [N('Um drei Uhr dreht Hunter das Schild auf „ZU“ und stellt die Stühle hoch. Er wirft dir das Handtuch nicht mehr zu. Er legt es dir hin.'), P('Das war’s dann wohl.')], {
    effects: [set('ht_schicht')],
  }),
]);

export const part: ContentPart = {
  quests: { [Q]: quest },
  dialogues: byId(schicht),
  mapAdditions: {
    'high-voltage': {
      hotspots: [spotUse('pj-ht-schicht', 'tresen', 'Hinter den Tresen (Schicht)', schicht.id, all(AKTIV, flag('ht_bezahlt'), noFlag('ht_schicht'), time('abend')))],
    },
  },
};
