// pers-kiki-reichweite · Akkuteile für Kikis Schwebetaxi (world.md §6.5; Start bei he-kiki-karbon-6: „Ich will ans Meer.“).
// Drei Akkuzellen: Mira Lötzinn (kaufen oder `[Technik 6]` aus Schrott bauen), Dexter (Tausch, 50 Cr oder Drohne ausschlachten),
// Kikis alte Zelle (`[Technik 6]` wiederbeleben oder bei Mira eine zweite kaufen). Einbau `[Technik 6]` oder Mira baut ein.
// Belohnung: Flag `kiki_reichweite` (Schwebetaxi bis in die Ödnis, sobald die Ödnis offen ist) und ein Testflug bis an den Stadtrand.
import type { QuestDef } from '../../../modules/contracts';
import type { ContentPart } from '../../part';
import {
  type Beitrag, L, N, active, all, any, beitrag, bye, byId, c, chk, cr, flag, give, hearts, item, node, noFlag, nochWas, rel,
  seen, set, schritt, szene, tafel, take, zeit,
} from './_lib';

const Q = 'pers-kiki-reichweite';
const AKTIV = active(Q);
const KK = 'kiki-karbon';
const MI = 'mira-loetzinn';
const ZELLE = 'taxi-akkuzelle';

const quest: QuestDef = {
  id: Q, kind: 'personal', act: 1, giver: KK,
  title: 'Kurs liegt an: Meer',
  summary: 'Kiki will einmal bis ans Meer fliegen. Ihr Taxi schafft gerade mal die Stadtgrenze. Drei Akkuzellen, dann geht’s weiter. Viel weiter.',
  autoStart: any(seen('he-kiki-karbon-6'), hearts(KK, 6)),
  steps: [
    schritt('kiki', 'Sprich mit Kiki über die Reichweite (Taxistand morgens, Neon-Gasse abends).', 'kr_start', { marker: { map: 'neon-gasse' } }),
    schritt('mira', 'Akkuzelle von Mira Lötzinn (Lötzinns Laden, Lötgassen).', 'kr_mira', { when: flag('kr_start'), marker: { map: 'loetzinn-laden' } }),
    schritt('dexter', 'Akkuzelle aus Dexters Drohnenlager (Schrottmarkt).', 'kr_dexter', { when: flag('kr_start'), marker: { map: 'schrottmarkt' } }),
    schritt('alt', 'Kikis alte Akkuzelle wiederbeleben – oder Ersatz bei Mira besorgen.', 'kr_alt', { when: flag('kr_start'), marker: { map: 'loetzinn-laden' } }),
    schritt('einbau', 'Bring Kiki die drei Zellen und bau sie ein.', 'kr_fertig',
      { when: all(flag('kr_mira'), flag('kr_dexter'), flag('kr_alt')), marker: { map: 'neon-gasse' } }),
  ],
  reward: { xp: 200, relations: { 'kiki-karbon': 100 } },
};

// ------------------------------------------------------------------------------------------- Kiki
const start = beitrag(KK, all(AKTIV, noFlag('kr_start')), '„Ans Meer, hast du gesagt. Was fehlt dir?“', [
  node('kr-k-start', [
    L(KK, 'Was mir fehlt? Saft, Süße! Das Taxi zieht vierzig Kilometer. Bis zum Meer sind’s hundertzwanzig. Und dazwischen nur Sand, Staubfalken und kein einziger Ladepunkt.', 'neutral'),
    L(KK, 'Drei Akkuzellen, Typ Hummel-9. Mira hat welche, die sind teuer. Dexter hat eine in irgendeiner Drohne verbaut, die er „Prototyp“ nennt. Und meine alte liegt im Kofferraum und schmollt.', 'signatur'),
    L(KK, 'Ich frag nicht oft um Hilfe. Eigentlich nie. Ich frag sonst nur nach Trinkgeld.'),
  ], {
    choices: [
      c('„Kurs liegt an. Ich besorg dir die Zellen.“', 'kr-k-ja', { effects: [set('kr_start'), rel(KK, 20)] }),
    ],
  }),
  node('kr-k-ja', [
    L(KK, 'Kurs liegt an, sagt sie! Ich hör schon das Meer! Das ist nicht das Meer, das ist der Lüfter, aber ich hör es trotzdem!', 'freude'),
    N('Sie drückt dir eine verrußte Akkuzelle in die Hand. „Die alte. Mach was draus. Oder wirf sie Ripper an den Kopf.“'),
  ], { effects: [give(ZELLE)], choices: [nochWas(), bye()] }),
]);

const einbau = beitrag(KK, all(AKTIV, flag('kr_mira'), flag('kr_dexter'), flag('kr_alt'), noFlag('kr_fertig')), 'Drei Akkuzellen aufs Taxidach stellen.', [
  node('kr-e-start', [
    L(KK, 'Drei Hummeln! Drei! Sieh dir die an, die summen ja richtig! Okay, rein damit. Wer schraubt?', 'freude'),
  ], {
    choices: [
      c('Selbst einbauen: Reihenschaltung, Kühlung, Notabschaltung.', 'kr-e-flug', { check: chk('kr-einbau', 'technik', 6, ['reparieren', 'elektronik']), effects: [take(ZELLE, 3)] }),
      c('„Mira baut ein. Ich halt die Taschenlampe.“', 'kr-e-mira', { effects: [take(ZELLE, 3)] }),
    ],
  }),
  node('kr-e-mira', [
    N('Mira kommt mit Werkzeugkoffer, flucht dreimal über Kikis Verkabelung („Wer hat das gelötet? Ein Huhn?“), und nach zwei Stunden leuchtet die Ladeanzeige grün. Ganz rechts. Wo sie noch nie war.'),
  ], { effects: [zeit(120), rel(MI, 10)], next: 'kr-e-flug' }),
  node('kr-e-flug', [L(KK, 'Einsteigen, Süße. Testflug. Anschnallen ist Pflicht, Kotzen ist erlaubt.', 'signatur')], { effects: [{ cutscene: 'pj-kr-testflug' }] }),
]);

const testflug = szene('pj-kr-testflug', 'Kurs liegt an', [
  tafel('Kiki fliegt über die Dächer der Unterstadt, über den Hafen, über die Flutmauer – und weiter. Die Stadt wird ein Leuchten hinter euch. Vor euch nur Dunkel und Sand.'),
  tafel('Am Rand der Ödnis dreht sie bei. Die Anzeige sagt: Reichweite 140 Kilometer. Kiki lacht so laut, dass das Funkgerät knackt.', [
    L(KK, 'Hundertvierzig! Das reicht bis zum Meer und zurück! Und für einen Umweg über deinen Lieblingsimbiss!', 'freude'),
    L(KK, 'Noch nicht heute. Die Staubstraße ist zu, sagen sie. Aber bald. Und dann fliegen wir. Du und ich und das Meer.', 'zaertlich'),
  ]),
], [set('kr_fertig'), set('kiki_reichweite')]);

// ------------------------------------------------------------------------------------------- Mira
const mira = beitrag(MI, all(AKTIV, flag('kr_start'), any(noFlag('kr_mira'), noFlag('kr_alt'))), '„Hummel-9-Akkuzellen. Für Kikis Taxi.“', [
  node('kr-m-start', [
    L(MI, 'Hummel-9? Für Kiki? Die fliegt mit einem Taxi, das ich nicht mal als Toaster zulassen würde.', 'neutral'),
    L(MI, 'Ich hab zwei. Achtzig das Stück. Oder du baust dir eine aus meinem Schrottregal, wenn du dich traust. Dann zahlst du nur das Lot.'),
  ], {
    choices: [
      c('Eine Zelle kaufen. (80 Cr)', 'kr-m-gekauft', { requires: { credits: 80 }, effects: [cr(-80), give(ZELLE)] }),
      c('Aus dem Schrottregal eine Zelle zusammenlöten.', 'kr-m-gebaut', { check: chk('kr-zelle-bauen', 'technik', 6, ['elektronik', 'reparieren']), effects: [give(ZELLE)] }),
      c('Kikis alte Zelle auf den Tisch legen. „Kriegst du die wieder hin?“', 'kr-m-alt', { when: all(item(ZELLE), noFlag('kr_alt')) }),
      bye('Ich überleg’s mir.'),
    ],
  }),
  node('kr-m-gekauft', [L(MI, 'Gute Wahl. Neu ist neu. Und sag Kiki, sie soll die nicht wieder mit Klebeband sichern.')], { next: 'kr-m-buchen' }),
  node('kr-m-gebaut', [
    N('Lötkolben, drei Zellenreste, ein Kühlblech aus einer Kaffeemaschine. Mira schaut dir über die Schulter und sagt nichts. Bei ihr ist das Lob.'),
    L(MI, 'Nicht schlecht. Nicht gut, aber nicht schlecht. Die hält. Ein Jahr. Vielleicht zwei.', 'freude'),
  ], { next: 'kr-m-buchen' }),
  node('kr-m-buchen', [N('Die Zelle summt in deiner Hand wie eine sehr kleine, sehr zufriedene Biene.')], {
    choices: [
      c('„Die ist für die Mira-Zeile.“', 'kr-m-ende', { when: noFlag('kr_mira'), effects: [set('kr_mira')] }),
      c('„Die ersetzt Kikis alte.“', 'kr-m-ende', { when: all(flag('kr_mira'), noFlag('kr_alt')), effects: [set('kr_alt')] }),
    ],
  }),
  node('kr-m-alt', [
    L(MI, 'Die ist tot. Mausetot. Ich kann sie wiederbeleben – Tiefentladung, Zellausgleich –, aber das kostet zwei Stunden und fünfzig Credits. Oder du machst es selbst. Werkbank ist frei.', 'neutral'),
  ], {
    choices: [
      c('Selbst wiederbeleben.', 'kr-m-alt-ok', { check: chk('kr-zelle-alt', 'technik', 6, ['elektronik']) }),
      c('Mira machen lassen. (50 Cr)', 'kr-m-alt-mira', { requires: { credits: 50 }, effects: [cr(-50)] }),
      c('Lieber eine neue kaufen.', 'kr-m-start'),
    ],
  }),
  node('kr-m-alt-ok', [N('Die Zelle summt wieder. Leise, beleidigt, aber sie summt.')], { effects: [set('kr_alt')], next: 'kr-m-ende' }),
  node('kr-m-alt-mira', [N('Mira verschwindet mit der Zelle in der Werkstatt. Zwei Stunden später kommt sie wieder, riecht nach Ozon und sagt: „Lebt.“')], {
    effects: [zeit(120), set('kr_alt')], next: 'kr-m-ende',
  }),
  node('kr-m-ende', [L(MI, 'Noch was? Sonst raus, ich hab Kundschaft. Also, ich hätte gern Kundschaft.')], { choices: [nochWas(), bye()] }),
]);

// ------------------------------------------------------------------------------------------- Dexter
const DX = 'dexter';
const dexter = beitrag(DX, all(AKTIV, flag('kr_start'), noFlag('kr_dexter')), '„Kiki sagt, du hast eine Hummel-9 in einer Drohne verbaut.“', [
  node('kr-d-start', [
    L(DX, 'Im Prototyp! Der Prototyp ist mein Lebenswerk! Er kann fliegen! Theoretisch! Wenn er eine Hummel-9 hat!', 'besorgt'),
    L(DX, 'Na gut, er fliegt nicht. Er ist nie geflogen. Aber er hat Potenzial. Und ich hab Gefühle.'),
  ], {
    choices: [
      c('„Fünfzig Credits für die Zelle. Und dein Prototyp kriegt einen Namen.“', 'kr-d-gibt', { requires: { credits: 50 }, effects: [cr(-50)] }),
      c('Eine VHS-Kassette anbieten. „Für deine Sammlung.“', 'kr-d-gibt', { when: item('vhs-kassette'), effects: [take('vhs-kassette'), rel(DX, 30)] }),
      c('„Ich bau dir die Drohne um, dass sie mit Solar fliegt. Dafür die Zelle.“', 'kr-d-umbau'),
    ],
  }),
  node('kr-d-umbau', [
    N('Eine Stunde später hat der Prototyp ein Solarsegel aus einer alten Markise. Er fliegt nicht. Aber er schaukelt im Wind, und Dexter weint ein bisschen.'),
  ], { effects: [zeit(60), rel(DX, 20)], next: 'kr-d-gibt' }),
  node('kr-d-gibt', [
    L(DX, 'Hier. Pass auf sie auf. Sie hat noch nie die Welt gesehen. Nur mein Büro. Und mein Büro ist keine Welt.', 'trauer'),
  ], { effects: [give(ZELLE), set('kr_dexter')], choices: [nochWas(), bye()] }),
]);

export const beitraege: Beitrag[] = [start, einbau, mira, dexter];

export const part: ContentPart = { quests: { [Q]: quest }, cutscenes: byId(testflug) };

