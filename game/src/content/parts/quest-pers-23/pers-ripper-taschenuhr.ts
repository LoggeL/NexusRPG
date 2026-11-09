// pers-ripper-taschenuhr · „Die Taschenuhr“ (world.md §6.5, Ripper ♥6, Akt 2). Ersetzt den Platzhalter aus parts/integration/luecken.ts.
// Start: Rippers Gespräch über die Uhr (npc-medien-club/ripper.ts) ab Akt 2; wer ihm in Akt 1 nur versprochen hat
// nachzusehen (Flag ripper_taschenuhr_versprochen), bekommt die Quest in Akt 2 automatisch.
// Uhr holen in Sybellas Boutique „Chrome & Co.“ (chrome-boulevard): kaufen 600 Cr (Laden, maps-23/shops-chrome-himmel),
// `[Straße 7]` gegen eine Attrappe tauschen, `[Sybella ♥4]` zum Selbstkostenpreis, oder Tausch gegen ein Kassenbuch + 200 Cr.
// Zurück zu Ripper (Praxis tagsüber, Ecktisch im High Voltage abends): Ripper ♥ +150.
import type { QuestDef } from '../../../modules/contracts';
import type { ContentPart } from '../../part';
import {
  ACT2, L, MASTER, N, P, VEX, active, all, any, bye, byId, c, cc, chk, cr, credits, dlg, flag, give, hearts, item, karten, msg,
  node, noFlag, not, noItem, rede, rel, rep, schritt, set, take, time,
} from './_lib';

const Q = 'pers-ripper-taschenuhr';
const R = 'ripper';
const SY = 'sybella-chrome';
const UHR = 'taschenuhr-ripper';
const AKTIV = active(Q);
const HAT_UHR = any(item(UHR), flag('tu_zurueck'));

const quest: QuestDef = {
  id: Q, kind: 'personal', act: 2, giver: R,
  title: 'Die Taschenuhr',
  summary: 'Rippers Vater hatte eine Taschenuhr aus Messing. Jetzt hängt sie in einer Vitrine auf dem Chrome-Boulevard, mit roter Seide und Preisschild. Ripper will nur wissen, ob sie noch tickt. Sagt er.',
  autoStart: all(ACT2, flag('ripper_taschenuhr_versprochen'), not(MASTER)),
  steps: [
    schritt('uhr', 'Hol die Taschenuhr aus Sybellas Boutique „Chrome & Co.“ (Chrome-Boulevard).', HAT_UHR, ['chrome-boulevard', 'boutique-chrome']),
    schritt('ripper', 'Bring Ripper die Uhr (Praxis tagsüber, Ecktisch im High Voltage abends).', 'tu_zurueck', ['ripper-praxis', 'behandlungsstuhl'],
      { when: HAT_UHR }),
  ],
  reward: { xp: 250, relations: { [R]: 150 }, rep: { unterstadt: 5 } },
};

// ------------------------------------------------------------------------------------------- Boutique
const boutique = dlg('p23-tu-boutique', [
  node('start', [
    N('„Chrome & Co.“ riecht nach Ozonparfüm und Geld, das nie gearbeitet hat. In der Vitrine neben der Kasse, auf roter Seide: eine zerkratzte Messing-Taschenuhr mit Sprung im Glas. Kärtchen: „Vintage-Unikat. Patina echt. 600 Cr.“'),
    L(SY, 'Ah! Ein Kenner! Diese Uhr hat Geschichte. Ich weiß nicht welche, aber man sieht, dass sie eine hat. Patina, Liebling. Patina ist Geschichte zum Anfassen. Anfassen kostet extra.', 'signatur'),
  ], {
    choices: [
      c('„Sechshundert. Okay. Zeig mir die Kasse.“', undefined, { effects: [{ shop: 'chrome-und-co' }] }),
      cc('Nach dem Preisschild greifen, die Uhr ablenken und gegen Rippers Messing-Attrappe tauschen.', 'tausch',
        chk('tu-tausch', 'strasse', 7, ['taschendieb', 'tricks']), { effects: [give(UHR), set('tu_getauscht')] }),
      c('„Sybella. Die Uhr gehört einem alten Freund. Selbstkostenpreis?“', 'freundin', { tag: '[Sybella ♥4]', requires: hearts(SY, 4) }),
      c('Ein Kassenbuch auf den Tresen legen. „Gebunden, liniert, unbenutzt. Plus zweihundert.“', 'kassenbuch',
        { when: item('kassenbuch'), requires: credits(200), effects: [take('kassenbuch'), cr(-200), give(UHR), rel(SY, 30)] }),
      c('„Wer hat sie dir verkauft?“', 'herkunft'),
      bye('Nur gucken.'),
    ],
  }),
  node('herkunft', [
    L(SY, 'Ein Hehler vom Schrottmarkt, vor zwanzig Jahren. Er hat sie mir für drei Credits und einen Gutschein überlassen. Ich hab den Gutschein nie eingelöst. Ich bin sentimental.', 'neutral'),
    L(SY, 'Der Mann sagte, die Uhr gehörte einem Schrauber, der „für immer weg“ ist. Ich hab nicht gefragt, wohin. Wer fragt, zahlt mehr.'),
  ], { next: 'start' }),
  node('tausch', [
    N('Du fragst nach dem Seidentuch im Schaufenster, nach dem Parfüm im dritten Regal und nach der Uhrzeit. Sybella dreht sich dreimal. Beim dritten Mal liegt auf der roten Seide eine Messinguhr von Ripper. Sie tickt nicht. Aber sie glänzt hübsch.'),
    L(SY, 'Und die Uhrzeit ist: Zeit, etwas zu kaufen! Nein? Schade. Kommen Sie wieder, wenn Sie reicher sind.', 'freude'),
    P('Garantiert.'),
  ], { effects: [msg('Taschenuhr eingesteckt. Auf der Seide liegt jetzt ein sehr glänzendes Nichts.')] }),
  node('freundin', [
    L(SY, 'Selbstkostenpreis. Du weißt, dass mir dieses Wort körperliche Schmerzen bereitet. Hier. Und hier. Und ein bisschen im Portemonnaie.', 'trauer'),
    L(SY, 'Drei Credits und ein Gutschein. So viel hab ich bezahlt. Den Gutschein will ich behalten. Du zahlst drei. Und erzählst niemandem, dass ich einen Herz habe. Ein Herz. Siehst du, ich bin ganz durcheinander.', 'verlegen'),
  ], {
    choices: [
      c('Drei Credits hinlegen.', 'gekauft', { requires: credits(3), effects: [cr(-3), give(UHR), rel(SY, 40)] }),
      c('„Lass gut sein. Ich zahl den vollen Preis.“', undefined, { effects: [{ shop: 'chrome-und-co' }] }),
    ],
  }),
  node('kassenbuch', [
    L(SY, 'Ein Kassenbuch! Liniert! Mit doppelter Spalte für Soll und Haben! Weißt du, wie selten das ist? In der Oberstadt rechnen alle nur noch mit Gefühl.', 'freude'),
  ], { next: 'gekauft' }),
  node('gekauft', [N('Sybella schlägt die Uhr in rotes Seidenpapier, bindet eine Schleife und gibt sie dir mit beiden Händen, als würde sie ein Baby übergeben, das sie nie wollte, aber jetzt doch vermisst.')]),
]);

// ------------------------------------------------------------------------------------------- Ripper
const ripper = dlg('p23-tu-ripper', [
  node('start', [
    N('Ripper sieht die Uhr in deiner Hand, bevor du sie hochhältst. Er wird nicht blass. Ripper wird nie blass. Er wird nur sehr still.'),
    L(R, 'Was haben wir denn da.', 'besorgt'),
    N('Er nimmt sie, als wäre sie heiß. Drückt den Springdeckel. Der Deckel springt nicht. Er drückt noch mal, mit dem Daumen, der sich das gemerkt hat. Klack.'),
    L(R, '„Für meinen Jungen. Die Zeit gehört dir.“ … Der Kratzer ist da. Wo ich reingebissen hab. Ich dachte, die ist aus Schokolade. Ich war sechs. Er hat gelacht.', 'trauer'),
  ], {
    choices: [
      c('„Sie tickt nicht mehr. Willst du, dass ich sie aufziehe?“', 'aufziehen'),
      cc('„Gib her. Die Unruh klemmt, das krieg ich hin.“', 'repariert', chk('tu-unruh', 'technik', 6, ['reparieren', 'feinmechanik'])),
      c('Nichts sagen. Warten.', 'warten'),
    ],
  }),
  node('aufziehen', [
    N('Ripper dreht die Krone selbst. Langsam. Vier, fünf Umdrehungen. Nichts. Dann, ganz leise: tick.'),
  ], { next: 'tickt' }),
  node('repariert', [
    N('Ein Haar aus Rippers eigener Pinzette, ein Tropfen Öl, ein sanfter Stoß gegen die Unruh. Die Uhr holt Luft wie jemand, der aus tiefem Wasser kommt. Tick. Tick. Tick.'),
    L(R, 'Du hast meine Pinzette benutzt. Ohne zu fragen. Die kostet … ach, scheiß drauf.', 'freude'),
  ], { effects: [rel(R, 30)], next: 'tickt' }),
  node('warten', [
    N('Ripper sitzt da, die Uhr in der Faust, eine Minute, zwei. Dann zieht er sie auf, ohne hinzusehen, so wie man sich die Schuhe bindet. Tick.'),
  ], { next: 'tickt' }),
  node('tickt', [
    L(R, 'Sie tickt. Das alte Mistding tickt.', 'ueberrascht'),
    L(R, 'Mein Vater hat in den Lötgassen Uhren repariert. Als die Fabrik zugemacht hat, hat er die Werkstatt verkauft und die Uhr behalten. Dann hat er die Uhr verkauft. Dann war er weg. Ich war elf. Ich hab Kabel geklaut, um zu essen. Wie die Gören am Markt.', 'trauer'),
    L(R, 'Was hat sie gekostet? Und lüg nicht. Ich merk das. Bei allen außer bei mir selbst.'),
  ], {
    choices: [
      c('„Das geht dich nichts an.“', 'nichts'),
      c('„Zahl’s den Kindern am Markt. Fair.“', 'kinder'),
      c('„Du schuldest mir einen Gefallen, Kassierer.“', 'gefallen', { when: VEX }),
      c('„Sechshundert. Oder drei. Kommt drauf an, wen du fragst.“', 'preis'),
    ],
  }),
  node('nichts', [L(R, 'Geht mich nichts an. Ha. Das hat mir seit dreißig Jahren keiner gesagt. Normalerweise geht mich alles was an. Gegen Gebühr.', 'freude')], { next: 'ende' }),
  node('kinder', [
    L(R, 'Den Kindern. Fair. Du redest wie Freya. Die hat mir neulich eine Preistafel unter die Nase gehalten, mit Stempel.', 'wut'),
    L(R, '… Ja. Okay. Ein Monat fairer Preis. Danach sehen wir weiter. Sag’s keinem.'),
  ], { effects: [set('ripper_zahlt_fair_monat'), rep('unterstadt', 5)], next: 'ende' }),
  node('gefallen', [L(R, 'Kurierin. Du weißt, dass dein Arm noch nicht abbezahlt ist. … Diesen Monat ist die Rate gestrichen. Nur diesen. Und nur, weil die Uhr tickt.', 'signatur')], { effects: [set('ripper_rate_erlassen_uhr')], next: 'ende' }),
  node('preis', [L(R, 'Drei? DREI? Sybella Chrome hat drei Credits für die Uhr meines Vaters gezahlt? Ich hasse die Oberstadt. Ich hasse sie so sehr, dass ich fast lachen muss.', 'wut')], { next: 'ende' }),
  node('ende', [
    N('Er hängt die Uhr an eine Kette, steckt sie in die Westentasche, holt sie wieder raus, sieht drauf, steckt sie wieder ein. Das wird er jetzt öfter machen.'),
    L(R, 'Raus jetzt. Ich hab Kundschaft. Ich hab keine Kundschaft. Aber ich will allein sein mit meiner Uhr, verstanden?', 'zaertlich'),
  ], { effects: [take(UHR), set('tu_zurueck'), set('ripper_taschenuhr')] }),
]);

export const part: ContentPart = {
  quests: { [Q]: quest },
  dialogues: byId(boutique, ripper),
  mapAdditions: karten([
    ['chrome-boulevard', rede('p23-tu-boutique', 'boutique-chrome', 'Sybella auf die Taschenuhr ansprechen', boutique.id,
      all(AKTIV, noItem(UHR), noFlag('tu_zurueck'), any(time('morgen'), time('tag'))))],
    ['ripper-praxis', rede('p23-tu-ripper-praxis', 'behandlungsstuhl', 'Ripper die Taschenuhr geben', ripper.id,
      all(AKTIV, item(UHR), noFlag('tu_zurueck'), time('tag')))],
    ['high-voltage', rede('p23-tu-ripper-hv', 'ecktisch', 'Ripper die Taschenuhr geben', ripper.id,
      all(AKTIV, item(UHR), noFlag('tu_zurueck'), time('abend')))],
  ]),
};
