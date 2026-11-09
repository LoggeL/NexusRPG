// pers-freya-fairer-lohn · Faire Preistafel für Kinder-Implantate (world.md §6.5).
// Wege bei Ripper: `[Ausstrahlung 6]`, Unterschriften der Händler (ohne Check, über die Händlerversammlung), `[Freya ♥4]`
// Kindergericht. Unterschriften: `[Ausstrahlung 4]` Rede, Dampfnudel-Runde (30 Cr) oder Stand für Stand (ohne Check).
import type { QuestDef } from '../../../modules/contracts';
import type { ContentPart } from '../../part';
import {
  type Beitrag, L, N, P, active, all, beitrag, bye, byId, c, chk, cr, dlg, done, flag, give, hearts, node, noFlag, nochWas,
  rel, rep, set, schritt, spotUse, take, time, zeit,
} from './_lib';

const Q = 'pers-freya-fairer-lohn';
const AKTIV = active(Q);
const FR = 'freya';
const RI = 'ripper';
const TAFEL = 'preistafel-entwurf';

const quest: QuestDef = {
  id: Q, kind: 'personal', act: 1, giver: FR,
  title: 'Fairer Lohn',
  summary: 'Ripper zahlt Kindern zehn Credits für ein Auge. Freya hat eine Preistafel entworfen. Jetzt muss Ripper sie nur noch aufhängen. Freiwillig. Haha.',
  autoStart: all(hearts(FR, 3), done('main-1-probezeit')),
  steps: [
    schritt('entwurf', 'Sprich mit Freya am Botenstand auf dem Schrottmarkt (tagsüber).', 'fl_entwurf', { marker: { map: 'schrottmarkt' } }),
    schritt('unterschriften', 'Optional: Hol die Unterschriften der Markthändler (Marktplatz-Mitte, tagsüber oder abends).', 'fl_unterschriften',
      { when: flag('fl_entwurf'), optional: true, marker: { map: 'schrottmarkt' } }),
    schritt('ripper', 'Bring Ripper dazu, die Tafel anzuerkennen (Praxis am Schrottmarkt, tagsüber).', 'fl_ripper', { when: flag('fl_entwurf'), marker: { map: 'ripper-praxis' } }),
    schritt('bericht', 'Erzähl Freya, dass die Tafel hängt.', 'fl_fertig', { when: flag('fl_ripper'), marker: { map: 'schrottmarkt' } }),
  ],
  reward: { xp: 180, relations: { freya: 100, daria: 20, jakko: 20 }, rep: { unterstadt: 5 } },
};

// ------------------------------------------------------------------------------------------- Freya
const entwurf = beitrag(FR, all(AKTIV, noFlag('fl_entwurf')), '„Daria sagt, du hast was gegen Ripper in der Hand.“', [
  node('fl-f-start', [
    L(FR, 'Nicht in der Hand. Auf Pappe. Das hier ist eine Preistafel. Auge: hundertzwanzig Credits. Finger: dreißig. Hörimplantat: achtzig. Gerechte Preise, nach Marktwert, abzüglich Ripper-Gier.', 'neutral'),
    L(FR, 'Ripper zahlt zehn. Zehn! Für ein Auge! Das ist kein Preis, das ist Diebstahl mit Quittung. Einspruch!', 'wut'),
    L(FR, 'Er muss die Tafel aufhängen. Und sich dran halten. Ich bin zwölf, mir hört keiner zu. Dir vielleicht.'),
  ], {
    choices: [
      c('„Gib her. Ich bring sie ihm.“', 'fl-f-ja', { effects: [give(TAFEL), set('fl_entwurf')] }),
      c('„Was, wenn er Nein sagt?“', 'fl-f-nein', { once: true, id: 'fl-f-nein' }),
    ],
  }),
  node('fl-f-nein', [
    L(FR, 'Dann holen wir Unterschriften. Babette, Gustav, Vinyl-Vincent, Frau Klingel. Wenn der ganze Markt dafür ist, kann er nicht allein dagegen sein. Das ist Demokratie. Oder Erpressung. Ich hab das Kapitel noch nicht fertig.', 'signatur'),
  ], { next: 'fl-f-start' }),
  node('fl-f-ja', [
    L(FR, 'Hier ist Platz für Unterschriften. Unten. Bitte nicht knicken. Und nicht fluchen, wenn du sie Ripper zeigst. Das macht einen Keks.', 'freude'),
  ], { choices: [nochWas(), bye()] }),
]);

const bericht = beitrag(FR, all(AKTIV, flag('fl_ripper'), noFlag('fl_fertig')), '„Die Tafel hängt. Ripper hält sich dran.“', [
  node('fl-b-start', [
    L(FR, 'Er hat … wirklich? Mit Nagel? An der Wand? Nicht hinter dem Kühlschrank?', 'ueberrascht'),
    N('Freya steht sehr gerade. Dann bricht ihr Gesicht in ein Grinsen, das sie sofort wieder einsammelt. Richterinnen grinsen nicht. Aber ihre Ohren werden rot.'),
    L(FR, 'Hiermit erkläre ich: Der Markt ist ein bisschen gerechter. Die Sitzung ist geschlossen. Und du kriegst einen Keks. Einen ganzen.', 'freude'),
    L('daria', '(vom Botenstand) Das ist Freyas höchste Auszeichnung. Ich hab erst einen gekriegt. In drei Jahren.'),
  ], { effects: [set('fl_fertig')] }),
]);

// ------------------------------------------------------------------------------------------- Händlerversammlung
const versammlung = dlg('pj-fl-versammlung', [
  node('start', [
    N('Mitten auf dem Markt, zwischen Garküche und Schrottkram: Babette mit Kochlöffel, Gustav mit Ölkännchen, Vinyl-Vincent mit verschränkten Armen und Frau Klingel, deren Hörimplantat gerade Schlager spielt.'),
    L('babette-bao', 'Freyas Pappe? Natürlich unterschreib ich. Wer Kinder bescheißt, kriegt bei mir keine Dampfnudel. Aber die anderen …', 'neutral'),
    L('vinyl-vincent', 'Ich unterschreib nichts. Unterschriften sind der Anfang von Steuern.', 'wut'),
  ], {
    choices: [
      c('Auf eine Kiste steigen und eine Rede halten.', 'rede', { check: chk('fl-rede', 'ausstrahlung', 4, ['ueberzeugen', 'rede']) }),
      c('„Runde Dampfnudeln für alle. Ich zahl. Und dann wird unterschrieben.“', 'nudeln', { requires: { credits: 30 }, effects: [cr(-30)] }),
      c('Stand für Stand abklappern, jeden einzeln überzeugen.', 'runde'),
      bye('Später.'),
    ],
  }),
  node('rede', [
    P('Ihr alle kauft Teile von Kindern. Ihr alle wisst, dass Ripper sie bescheißt. Und morgen bescheißt er euch. Wer unterschreibt, zahlt fair – und kriegt ab jetzt die guten Teile zuerst.', 'signatur'),
    N('Stille. Dann klatscht Gustav. Dann Babette. Frau Klingels Implantat spielt einen Tusch, ganz zufällig. Vinyl-Vincent unterschreibt mit einem Seufzer, der für drei Steuererklärungen reicht.'),
  ], { effects: [set('fl_unterschriften'), rep('unterstadt', 3), rel('babette-bao', 15), rel('opa-gustav', 15)] }),
  node('nudeln', [
    N('Babette verteilt Dampfnudeln. Satte Händler sind gnädige Händler. Selbst Vinyl-Vincent unterschreibt, mit Puderzucker am Kinn und Würde im Rest.'),
  ], { effects: [set('fl_unterschriften'), rel('babette-bao', 20)] }),
  node('runde', [
    N('Zwei Stunden. Gustav erzählt dir von früher, als hier alles grün war. Frau Klingel versteht „Preistafel“ als „Brezeltafel“ und will drei. Vinyl-Vincent unterschreibt erst, als du ihm versprichst, nie wieder „Steuern“ zu sagen.'),
    N('Am Ende hast du vier Unterschriften, zwei Brezeln und einen Ohrwurm.'),
  ], { effects: [zeit(120), set('fl_unterschriften'), rel('opa-gustav', 10)] }),
]);

// ------------------------------------------------------------------------------------------- Ripper
const ripper = beitrag(RI, all(AKTIV, flag('fl_entwurf'), noFlag('fl_ripper')), 'Freyas Preistafel auf den Behandlungsstuhl legen.', [
  node('fl-r-start', [
    L(RI, 'Was haben wir denn da? Pappe. Mit Zahlen. Hundertzwanzig für ein Kinderauge? Da ist ein Virus drauf! Auf der Pappe! Auf den Zahlen!', 'wut'),
    L(RI, 'Ich zahl, was der Markt hergibt. Und der Markt gibt her, was ich sage. So funktioniert Wirtschaft, Herzchen.'),
  ], {
    choices: [
      c('„Du warst selbst ein Straßenkind. Hat dich einer fair bezahlt? Na also. Sei der Erste.“', 'fl-r-ueberzeugt',
        { check: chk('fl-ripper', 'ausstrahlung', 6, ['ueberzeugen', 'feilschen']) }),
      c('Die Unterschriften zeigen. „Der ganze Markt ist dafür. Willst du allein dagegen sein?“', 'fl-r-markt',
        { when: flag('fl_unterschriften') }),
      c('„Freya, komm rein. Wir halten Gericht.“', 'fl-r-gericht', { tag: '[Freya ♥4]', requires: hearts(FR, 4) }),
      bye('„Denk drüber nach.“'),
    ],
  }),
  node('fl-r-ueberzeugt', [
    L(RI, '… Wer hat dir das erzählt? Gustav? Der alte Sack redet zu viel.', 'ueberrascht'),
    N('Er schaut lange auf die Pappe. Dann nimmt er einen Nagel aus einem Glas mit der Aufschrift „Finger (gebraucht)“ und schlägt die Tafel neben die Tür.'),
    L(RI, 'Wenn einer fragt: Das war Marketing. Ehrlicher Restposten. Meistens.', 'signatur'),
  ], { effects: [take(TAFEL), set('fl_ripper'), rel(RI, 20)] }),
  node('fl-r-markt', [
    L(RI, 'Babette? Gustav? VINCENT? Vincent unterschreibt nicht mal seinen Mietvertrag!', 'wut'),
    L(RI, 'Wenn ich Nein sag, kauft keiner mehr bei mir. Und Babette spuckt mir in die Suppe. Sie hat das schon mal gemacht. Ich hab’s gemerkt. Zu spät.', 'besorgt'),
    N('Er hängt die Tafel auf. Schief. Absichtlich schief. Aber sie hängt.'),
  ], { effects: [take(TAFEL), set('fl_ripper'), rel(RI, -10)] }),
  node('fl-r-gericht', [
    N('Freya marschiert herein, mit Stempelkissen und einem Hammer aus einer Holzlatte. Hinter ihr Daria, Jakko und drei Kinder aus der Rohrsiedlung, die Ripper alle schon mal ein Auge verkauft haben.'),
    L(FR, 'Das Kindergericht tagt. Angeklagter Ripper. Anklage: Gier in einem besonders schweren Fall. Wie plädieren Sie?', 'wut'),
    L(RI, 'Ich … plädiere … auf …', 'besorgt'),
    L(FR, 'Schuldig. Strafe: Tafel aufhängen. Sofort. Und einen Keks an jedes anwesende Kind.', 'signatur'),
    N('Ripper hängt die Tafel auf. Er hat keine Kekse. Er zahlt jedem Kind fünf Credits. Das ist das erste Mal, dass er Kindern mehr zahlt, als er muss. Er sieht krank aus dabei.'),
  ], { effects: [take(TAFEL), set('fl_ripper'), rel(FR, 40), rel(RI, -20), rep('unterstadt', 3)] }),
]);

export const beitraege: Beitrag[] = [entwurf, bericht, ripper];

export const part: ContentPart = {
  quests: { [Q]: quest },
  dialogues: byId(versammlung),
  mapAdditions: {
    schrottmarkt: {
      hotspots: [
        spotUse('pj-fl-versammlung', 'marktplatz-mitte', 'Händler zusammentrommeln (Preistafel)', versammlung.id,
          all(AKTIV, flag('fl_entwurf'), noFlag('fl_unterschriften'), noFlag('fl_ripper'), time('tag', 'abend'))),
      ],
    },
  },
};
