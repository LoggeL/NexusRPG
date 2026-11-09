// pers-blade-teddymantel · „Der Teddymantel“ (world.md §6.5, Blade, Nachspiel). Start he-blade-8 (npc-quantum/blade.ts).
// Mantel aus dem Beweismittellager im Eisenhof: `[Straße 6]` reinschleichen, Wachtmeisterin Kessel um einen Freigabeschein
// bitten (ohne Check, nur Formulare und Zeit; schneller mit `[Kessel ♥4]` oder dem Gefallen des Richters).
// Übergabe im Besucherraum (Blade Di/Do/Sa tagsüber) oder über Kessel an jedem Tag. Blade ♥ +100.
import type { QuestDef } from '../../../modules/contracts';
import type { ContentPart } from '../../part';
import {
  L, N, P, VEX, active, all, any, bye, byId, c, cc, chk, dlg, ding, fahndung, flag, give, hearts, item, karten, msg, node,
  noFlag, noItem, nutze, rede, rel, schritt, set, tage, take, time, zeit,
} from './_lib';

const Q = 'pers-blade-teddymantel';
const BL = 'blade';
const KE = 'wache';
const MANTEL = 'blades-mantel';
const SCHEIN = 'p23-freigabeschein';
const AKTIV = active(Q);
const HAT = any(item(MANTEL), flag('btm_uebergeben'));

const quest: QuestDef = {
  id: Q, kind: 'personal', act: 3, giver: BL,
  title: 'Der Teddymantel',
  summary: 'Blade sitzt im Zellentrakt und vermisst ausgerechnet seinen Mantel. Teddyfell, Oberstadt-Schnitt, liegt im Beweismittellager des Eisenhofs zwischen einem Brecheisen und einem Kanister Schwarzgebranntem. Er will ihn nicht tragen. Er will nur wissen, dass er nicht neben dem Brecheisen liegt.',
  steps: [
    schritt('schein', 'Optional: Bitte Wachtmeisterin Kessel um einen Freigabeschein (Zellentrakt, Besuchertür, tagsüber).', any(item(SCHEIN), HAT), ['zellentrakt', 'besucherraum-tuer'], { optional: true }),
    schritt('mantel', 'Hol den Mantel aus dem Beweismittellager (Eisenhof).', HAT, ['eisenhof', 'beweismittellager']),
    schritt('blade', 'Bring Blade den Mantel (Besucherraum Di/Do/Sa tagsüber, sonst über Kessel).', 'btm_uebergeben', ['zellentrakt', 'besucherraum'], { when: HAT }),
  ],
  reward: { xp: 300, relations: { [BL]: 100, [KE]: 20 } },
};

const schein = ding(SCHEIN, 'Freigabeschein 27b', 'Ein Formular in dreifacher Ausfertigung: weiß, gelb, rosa. Unterschrieben von Kessel, gestempelt vom Richter, gegengezeichnet von einem Wachmann, der „Klaus“ heißt und nicht schreiben kann.', 'zeitung-papier');

// ------------------------------------------------------------------------------------------- Kessel
const kessel = dlg('p23-btm-kessel', [
  node('start', [
    L(KE, 'Ein Mantel. Aus der Asservatenkammer. Für einen Häftling. Wissen Sie, wie viele Formulare das sind?', 'neutral'),
    L(KE, 'Drei. In dreifacher Ausfertigung. Neun. Plus Durchschlag. Ich liebe Durchschläge. Sie sind das Einzige hier, das sich an Regeln hält.'),
  ], {
    choices: [
      c('„Dann füllen wir eben neun Formulare aus.“', 'formulare', { effects: [zeit(90)] }),
      c('„Kessel. Bitte. Du kennst mich.“', 'schnell', { tag: '[Kessel ♥4]', requires: hearts(KE, 4) }),
      c('Den Gefallen des Richters vorlegen.', 'richter', { when: item('richters-gefallen'), effects: [take('richters-gefallen')] }),
      bye('„Ich such mir einen anderen Weg.“'),
    ],
  }),
  node('formulare', [
    N('Neunzig Minuten. Du lernst, was „Asservat“ heißt, warum „Teddyfell“ nicht in die Spalte „Tierprodukt“ gehört und dass Kessel beim Stempeln leise summt. Ein Collin-Lied. Sie merkt, dass du es merkst.'),
    L(KE, 'Kein Wort.', 'verlegen'),
  ], { next: 'fertig' }),
  node('schnell', [L(KE, 'Ich kenne Sie. Das ist das Problem. … Gut. Ich mach die Durchschläge morgen. Heute bin ich nachlässig. Einmal im Jahr darf ich das.', 'freude')], { next: 'fertig' }),
  node('richter', [L(KE, 'Der Richter schuldet Ihnen einen Gefallen? Und Sie verschwenden ihn auf einen Mantel? Sie sind entweder sehr nett oder sehr dumm. Ich respektiere beides.', 'ueberrascht')], { next: 'fertig' }),
  node('fertig', [N('Kessel reicht dir den Schein, weiß, gelb, rosa. Die rosa Kopie behält sie. „Für meine Sammlung.“')], { effects: [give(SCHEIN), rel(KE, 10)] }),
]);

// ------------------------------------------------------------------------------------------- Beweismittellager
const lager = dlg('p23-btm-lager', [
  node('start', [
    N('Das Beweismittellager: Gitterkäfig, Regale bis zur Decke, an jedem Teil ein Anhänger. Ein Brecheisen. Ein Kanister mit der Aufschrift „Medizin“. Dazwischen, auf einem Kleiderbügel, der sich schämt: ein Teddyfell-Mantel, so flauschig, dass er fast atmet.'),
    N('Hinter dem Schalter döst ein Wachmann über einer Zeitung.'),
  ], {
    choices: [
      c('Den Freigabeschein durch den Schlitz schieben.', 'schein', { when: item(SCHEIN), effects: [take(SCHEIN), give(MANTEL)] }),
      cc('Warten, bis er wegnickt, das Gitter anheben, den Bügel angeln.', 'geschlichen', chk('btm-lager', 'strasse', 6, ['schleichen', 'stehlen']), { effects: [give(MANTEL)] }),
      c('Einfach reingreifen und rennen.', 'gerannt', { effects: [give(MANTEL), fahndung(1)] }),
      bye('Später wiederkommen.'),
    ],
  }),
  node('schein', [
    N('Der Wachmann schreckt hoch, liest weiß, gelb, rosa. Nein, nur weiß und gelb. Er sucht das Rosa. Er findet es nicht. Er zuckt mit den Schultern und gibt dir den Mantel.'),
    L('wachmann-brezel', 'Unterschreiben Sie hier. Und hier. Und hier, dass Sie unterschrieben haben.', 'neutral'),
  ]),
  node('geschlichen', [N('Der Bügel klirrt nicht. Der Mantel flüstert nicht. Der Wachmann schnarcht weiter. Draußen merkst du, dass du die Luft angehalten hast, seit du drin warst.')]),
  node('gerannt', [N('Du greifst, du rennst. Hinter dir: „HEY! DAS IST EIN BEWEISSTÜCK!“ – „WOFÜR?“ – „FÜR … GESCHMACK!“ Der Eisenhof wird sich an dein Gesicht erinnern.')]),
]);

// ------------------------------------------------------------------------------------------- Übergabe
const uebergabe = dlg('p23-btm-blade', [
  node('start', [
    N('Besucherraum. Plexiglas, Hörer, Kreuzworträtsel. Du legst den Mantel in die Durchreiche. Die Wache prüft ihn, findet nichts außer einer Pfefferminz in der Tasche und schiebt ihn durch.'),
    N('Blade nimmt ihn nicht hoch. Er legt das Gesicht hinein. Lange.'),
    L(BL, 'Er riecht noch nach dem Penthouse. Nach dem Leben, das ich nicht verdient hatte. Und ein bisschen nach Brecheisen. Das wird wieder.', 'trauer'),
  ], {
    choices: [
      c('„Warum ausgerechnet der Mantel?“', 'warum'),
      c('„Aria saß in deinem Labor. Das riecht man nicht raus.“', 'aria', { when: VEX }),
      c('„Pass auf ihn auf.“', 'behalten'),
    ],
  }),
  node('warum', [
    L(BL, 'Meine Mutter hat ihn mir gekauft. Vom ersten Gehalt. Ich war achtzehn und hab gesagt, er ist peinlich. Sie hat gelacht und gesagt: „Dann wachs rein.“', 'trauer'),
    L(BL, 'Ich bin nie reingewachsen. Ich bin nur größer geworden.'),
  ], { next: 'behalten' }),
  node('aria', [
    L(BL, 'Nein. Das riecht man nicht raus. Das soll man auch nicht.', 'trauer'),
    L(BL, 'Sag ihr nicht, dass ich gefragt habe, wie es ihr geht. Sie würde mir zu Recht die Scheibe einschlagen. Aber … wie geht es ihr?'),
    P('Besser. Ohne dich.'),
    L(BL, 'Gut. Das ist die richtige Antwort.', 'neutral'),
  ], { next: 'behalten' }),
  node('behalten', [
    L(BL, 'Ich darf ihn hier drin nicht tragen. Er kommt in meine Effekten, zu Uhr und Schnürsenkeln. Oder …', 'besorgt'),
    L(BL, 'Oder du trägst ihn. Draußen. Dann ist er wenigstens unterwegs. Er war nie gern zu Hause.'),
  ], {
    choices: [
      c('„In deine Effekten. Er wartet auf dich.“', 'effekten', { effects: [take(MANTEL), set('btm_uebergeben'), rel(BL, 20)] }),
      c('Den Mantel zurücknehmen. „Ich führ ihn aus.“', 'tragen', { effects: [set('btm_uebergeben'), set('blade_mantel_getragen')] }),
    ],
  }),
  node('effekten', [L(BL, 'Er wartet. Das hat noch nie jemand für mich getan. Danke. Siehst du, das Wort geht immer leichter.', 'zaertlich')], { effects: [msg('Blades Mantel liegt in seinen Effekten. Er wartet.')] }),
  node('tragen', [L(BL, 'Und wenn die Crew dich auslacht, sag ihnen: Es ist Teddy. Teddy ist zeitlos.', 'freude')], { effects: [msg('Du trägst jetzt Blades Teddyfell-Mantel. Die Crew wird Kommentare haben.')] }),
]);

/** Übergabe über Kessel, wenn Blade heute keinen Besuch empfangen darf. */
const ueberKessel = dlg('p23-btm-kessel-uebergabe', [
  node('start', [
    L(KE, 'Heute ist kein Besuchstag. Ich kann ihn weitergeben. Gegen Quittung. Natürlich in dreifacher Ausfertigung.', 'neutral'),
  ], {
    choices: [
      c('Den Mantel abgeben.', 'ab', { effects: [take(MANTEL), set('btm_uebergeben')] }),
      bye('„Ich komm am Besuchstag wieder.“'),
    ],
  }),
  node('ab', [
    L(KE, 'Er hat gefragt, ob jemand für ihn was abgibt. Jeden Tag. Ich hab jeden Tag „nein“ gesagt. Morgen sag ich „ja“.', 'zaertlich'),
  ], { effects: [msg('Kessel gibt Blade den Mantel. Er wird ihn in seinen Effekten aufbewahren.')] }),
]);

const BESUCHSTAG = tage('di', 'do', 'sa');

export const part: ContentPart = {
  quests: { [Q]: quest },
  items: { [SCHEIN]: schein },
  dialogues: byId(kessel, lager, uebergabe, ueberKessel),
  mapAdditions: karten([
    ['zellentrakt', rede('p23-btm-kessel', 'besucherraum-tuer', 'Kessel: Freigabeschein für den Mantel', kessel.id,
      all(AKTIV, noItem(SCHEIN), { not: HAT }, time('morgen', 'tag')))],
    ['eisenhof', nutze('p23-btm-lager', 'beweismittellager', 'Beweismittellager: Blades Mantel', lager.id, all(AKTIV, { not: HAT }))],
    ['zellentrakt', rede('p23-btm-blade', 'besucherraum', 'Blade den Mantel geben', uebergabe.id,
      all(AKTIV, item(MANTEL), noFlag('btm_uebergeben'), time('tag'), BESUCHSTAG))],
    ['zellentrakt', rede('p23-btm-kessel-ab', 'besucherraum-tuer', 'Kessel: Mantel für Blade abgeben', ueberKessel.id,
      all(AKTIV, item(MANTEL), noFlag('btm_uebergeben'), time('morgen', 'tag'), { not: BESUCHSTAG }))],
  ]),
};
