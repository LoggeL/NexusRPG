// pers-bolzen-bein · Ein neues Hinterbein für Bolzen (world.md §6.5; Start in npc-unterstadt/bolzen.ts).
// Wege: drei Teile sammeln (Halde, Kanal, Dexter) und bei Dante bauen – `[Technik 6]` selbst oder zu dritt mit Gustav
// (ohne Check, dauert) – oder Dexter das fertige Bein für 250 Cr abkaufen. Einbau am Hundekorb im Crew-Quartier.
import type { QuestDef } from '../../../modules/contracts';
import type { ContentPart } from '../../part';
import {
  type Beitrag, L, N, P, active, all, any, beitrag, bye, byId, c, chk, cr, dlg, flag, give, item, node, noFlag, nochWas, rel,
  set, schritt, spotUse, szene, tafel, take, zeit,
} from './_lib';

const Q = 'pers-bolzen-bein';
const AKTIV = active(Q);
const GU = 'opa-gustav';
const DA = 'dante';
const DX = 'dexter';
const TEIL = 'bolzen-beinteil';
const BEIN = 'bolzen-bein';
const KEIN_BEIN = { noItem: BEIN };
const TEILE_DA = item(TEIL, 3);

const quest: QuestDef = {
  id: Q, kind: 'personal', act: 1, giver: 'bolzen',
  title: 'Ein Bein für Bolzen',
  summary: 'Bolzens linkes Hinterbein knirscht, das Servo heult, ein Gelenk hält nur noch mit Klebeband. Gustav und Dante könnten ihm ein neues bauen.',
  steps: [
    schritt('gustav', 'Frag Opa Gustav, was für ein Bein man braucht (Schrottmarkt: Kran morgens, Schrottkram-Stand tagsüber, Wohnwagen abends).', 'bb_plan', { marker: { map: 'schrottmarkt' } }),
    { id: 'teile', text: 'Besorg drei Beinteile: Halde, Kanal und Dexter – oder kauf Dexter ein fertiges Bein ab.',
      done: any(TEILE_DA, item(BEIN), flag('bb_fertig')), when: flag('bb_plan'), marker: { map: 'schrottmarkt' } },
    { id: 'bauen', text: 'Lass Dante das Bein bauen (Dantes Werkstatt, tagsüber an der Werkbank).',
      done: any(item(BEIN), flag('bb_fertig')), when: all(flag('bb_plan'), noFlag('bb_gekauft')), marker: { map: 'dantes-werkstatt' } },
    schritt('einbau', 'Bau Bolzen das Bein ein (Crew-Quartier, Hundekorb).', 'bb_fertig', { when: any(item(BEIN), flag('bb_fertig')), marker: { map: 'crew-quartier' } }),
  ],
  reward: { xp: 180, relations: { bolzen: 100, 'opa-gustav': 20, dante: 20 } },
};

// ------------------------------------------------------------------------------------------- Gustav
const plan = beitrag(GU, all(AKTIV, noFlag('bb_plan')), '„Bolzens Hinterbein ist hinüber. Kannst du helfen?“', [
  node('bb-g-start', [
    L(GU, 'Der Blechköter? Hab ich gehört, wie der knirscht. Klingt wie mein Knie im Winter. Nur dass meins nicht mit Klebeband hält.', 'freude'),
    L(GU, 'Wir brauchen drei Sachen. Einen Hydraulikzylinder – liegt auf der Halde, irgendwo unter dem Wrack. Ein Kniegelenk – im Kanal treibt allerhand, die Ratten horten so Zeug. Und ein Servo, ein gutes. Hat Dexter. Dexter hat immer alles. Fragt sich nur, wem es vorher gehört hat.'),
    L(GU, 'Dann bauen wir das bei Dante zusammen. Der hat die bessere Werkbank. Und Kekse. Hauptsächlich die Kekse.'),
  ], { effects: [set('bb_plan')], choices: [nochWas(), bye()] }),
]);

// ------------------------------------------------------------------------------------------- Dexter
const dexter = beitrag(DX, all(AKTIV, flag('bb_plan'), noFlag('bb_servo'), KEIN_BEIN, noFlag('bb_fertig')), '„Gustav sagt, du hast ein Servo. Für einen Hund.“', [
  node('bb-d-start', [
    L(DX, 'Ein Servo? Ich hab VIER Servos. Und ein komplettes Hinterbein. Militärware, Einheit 7-B, praktisch unbenutzt. Also, einmal benutzt. Vom Vorbesitzer. Der braucht es nicht mehr.', 'freude'),
    L(DX, 'Servo: vierzig Credits. Das ganze Bein, eingepackt und mit Schleifchen: zweihundertfünfzig. Freundschaftspreis. Ich hab keine Freunde, deshalb ist der Preis so hoch.'),
  ], {
    choices: [
      c('Vierzig Credits für das Servo.', 'bb-d-servo', { requires: { credits: 40 }, effects: [cr(-40)] }),
      c('„Vierzig? Für ein Servo, das du aus einer Polizeidrohne geschraubt hast? Ich sag nur: Ordnungsdienst.“', 'bb-d-servo',
        { check: chk('bb-dexter-servo', 'strasse', 5, ['feilschen', 'einschuechtern']) }),
      c('„Ich räum dafür dein Lager auf.“', 'bb-d-lager'),
      c('Zweihundertfünfzig für das ganze Bein.', 'bb-d-bein', { requires: { credits: 250 }, effects: [cr(-250)] }),
    ],
  }),
  node('bb-d-lager', [
    N('Anderthalb Stunden zwischen Kisten mit Aufschriften wie „NICHT ÖFFNEN“, „WIRKLICH NICHT“ und „OKAY, DU HAST ES GEWOLLT“. In einer liegen zweihundert Gummienten. Du fragst nicht.'),
    L(DX, 'Du hast die Enten gefunden. Vergiss die Enten.', 'besorgt'),
  ], { effects: [zeit(90)], next: 'bb-d-servo' }),
  node('bb-d-servo', [
    L(DX, 'Hier. Ein Servo. Funktioniert. Meistens. Wenn es piept, ist das normal. Wenn es singt, lauf.'),
  ], { effects: [give(TEIL), set('bb_servo')], choices: [nochWas(), bye()] }),
  node('bb-d-bein', [
    L(DX, 'Ein Mann mit Geschmack. Oder eine Frau. Oder ein Kunde mit zu viel Geld. Hier, das Bein. Die Seriennummer ist abgeschliffen, das ist ein Qualitätsmerkmal.', 'freude'),
  ], { effects: [give(BEIN), set('bb_gekauft')], choices: [nochWas(), bye()] }),
]);

// ------------------------------------------------------------------------------------------- Dante
const bauen = beitrag(DA, all(AKTIV, TEILE_DA, KEIN_BEIN, noFlag('bb_fertig')), 'Drei Beinteile auf die Werkbank legen. „Für Bolzen.“', [
  node('bb-w-start', [
    L(DA, 'Für den Hund? Na klar. Zylinder, Gelenk, Servo. Das wird ein Bein, auf das die Ordnungsdienst-Drohnen neidisch sind.', 'freude'),
    L(DA, 'Willst du selbst schrauben? Oder holen wir Gustav, und ich mach Kekse, und das dauert die halbe Nacht?'),
  ], {
    choices: [
      c('Selbst bauen. Zylinder ans Gelenk, Servo dran, Kalibrierung.', 'bb-w-selbst', { check: chk('bb-bein-bauen', 'technik', 6, ['reparieren', 'maschine']) }),
      c('„Wir drei. Gustav, du und ich. Mit Keksen.“', 'bb-w-zusammen'),
    ],
  }),
  node('bb-w-selbst', [
    N('Die Teile passen, als wären sie füreinander gemacht. Zwei Mal klemmt das Gelenk, beim dritten Mal schnurrt es. Dante pfeift anerkennend durch die Zähne.'),
  ], { next: 'bb-w-fertig' }),
  node('bb-w-zusammen', [
    N('Gustav kommt mit seinem Werkzeugkoffer, der älter ist als ihr beide zusammen. Er erzählt vom Krieg der Kräne, Dante backt zwei Bleche, Kuschel liegt auf dem Bauplan. Um zwei Uhr nachts steht das Bein auf der Werkbank und wackelt mit dem Fuß.'),
    L(GU, 'So. Das hält länger als ich.', 'freude'),
  ], { effects: [zeit(240), rel(GU, 20)], next: 'bb-w-fertig' }),
  node('bb-w-fertig', [
    L(DA, 'Ein Bein. Ein richtiges. Jetzt nur noch dranmachen. Halt ihm einen Keks hin, dann hält er still. Zwei Kekse, dann hält er sehr still.', 'freude'),
  ], { effects: [take(TEIL, 3), give(BEIN)], choices: [nochWas(), bye()] }),
]);

export const beitraege: Beitrag[] = [plan, dexter, bauen];

// ------------------------------------------------------------------------------------------- Teile suchen
const halde = dlg('pj-bb-halde', [
  node('start', [N('Unter dem alten Wrack auf der Halde schimmert etwas Hydraulisches. Es steckt fest zwischen einer Kühlschranktür und etwas, das mal ein Fahrrad war.')], {
    choices: [
      c('Mit einem Hebel genau an der richtigen Stelle ansetzen.', 'gefunden', { check: chk('bb-halde', 'technik', 4, ['reparieren']) }),
      c('Graben. Mit den Händen. Bis es nachgibt.', 'graben'),
      bye('Später.'),
    ],
  }),
  node('graben', [N('Eine Stunde. Zwei Fingernägel. Ein Schrei, als eine Ratte aus der Kühlschranktür springt. Dann rutscht der Zylinder raus.')], { effects: [zeit(60)], next: 'gefunden' }),
  node('gefunden', [N('Ein Hydraulikzylinder, ölverschmiert, aber dicht.'), P('Teil eins. Bolzen, du schuldest mir einen Knochen.', 'freude')], { effects: [give(TEIL), set('bb_halde')] }),
]);

const kanal = dlg('pj-bb-kanal', [
  node('start', [N('Im Rattennest glänzt zwischen Kronkorken und Kabelresten ein Kniegelenk aus Edelstahl. Drei Ratten sitzen davor und sehen dich an, als wüssten sie genau, was es wert ist.')], {
    choices: [
      c('Zugreifen, bevor sie reagieren.', 'gefunden', { check: chk('bb-ratten', 'reflexe', 4, ['schnell']) }),
      c('Einen Keks hinlegen und warten, bis sie tauschen.', 'tausch', { requires: item('dantes-kekse'), effects: [take('dantes-kekse')] }),
      c('Warten, bis sie schlafen gehen.', 'warten'),
      bye('Später.'),
    ],
  }),
  node('tausch', [N('Die größte Ratte schnuppert am Keks, schubst das Gelenk mit der Nase zu dir und zieht mit der Beute ab. Ein fairer Handel. Fairer als bei Dexter.')], { next: 'gefunden' }),
  node('warten', [N('Ratten schlafen nicht. Ratten machen Schichtwechsel. Nach einer Stunde ist das Nest kurz leer.')], { effects: [zeit(60)], next: 'gefunden' }),
  node('gefunden', [N('Ein Kniegelenk aus Edelstahl. Irgendwer hat „7-B“ eingraviert.'), P('Na sieh mal an. Bolzens alte Einheit.')], { effects: [give(TEIL), set('bb_kanal')] }),
]);

// ------------------------------------------------------------------------------------------- Einbau
const einbau = dlg('pj-bb-einbau', [
  node('start', [
    N('Du pfeifst. Bolzen kommt angehumpelt, sieht das Bein in deiner Hand und setzt sich sofort hin. Kerzengerade. Das Klebeband an seinem alten Gelenk flattert.'),
    L('bolzen', 'Wuff? (Das heißt: Ist das für mich? Das ist für mich. Sag, dass das für mich ist.)', 'freude'),
  ], { choices: [c('„Für dich, Kumpel. Halt still.“', 'dran')] }),
  node('dran', [N('Klick. Zisch. Ein Servo piept, ein zweites singt kurz. Du läufst nicht weg.')], { effects: [take(BEIN), { cutscene: 'pj-bb-rennen' }] }),
]);

const rennen = szene('pj-bb-rennen', 'Bolzen rennt', [
  tafel('Bolzen steht auf. Er prüft das Bein, einmal, zweimal. Dann rennt er. Einmal durchs ganze Quartier, über das Sofa, unter dem Tisch durch, gegen die Tür, zurück. Funken sprühen aus dem Schwanz.'),
  tafel('Er legt dir eine Quietsche-Mutter vor die Füße. Seine wertvollste. Schneller als je zuvor findet er ab jetzt alles, was irgendwo rumliegt.', [
    L('bolzen', 'WUFF! (Das heißt: Raketen wären besser gewesen. Aber das hier ist auch gut. Sehr gut. DANKE.)', 'freude'),
  ]),
], [set('bb_fertig'), set('bolzen_neues_bein')]);

export const part: ContentPart = {
  quests: { [Q]: quest },
  dialogues: byId(halde, kanal, einbau),
  cutscenes: byId(rennen),
  mapAdditions: {
    schrottmarkt: { hotspots: [spotUse('pj-bb-halde', 'halde', 'Unter dem Wrack suchen', halde.id, all(AKTIV, flag('bb_plan'), noFlag('bb_halde'), KEIN_BEIN, noFlag('bb_gekauft')))] },
    'kanal-sammler': { hotspots: [spotUse('pj-bb-kanal', 'rattennest-2', 'Glänzendes im Rattennest', kanal.id, all(AKTIV, flag('bb_plan'), noFlag('bb_kanal'), KEIN_BEIN, noFlag('bb_gekauft')))] },
    'crew-quartier': { hotspots: [spotUse('pj-bb-einbau', [250, 520], 'Bolzen das neue Bein anbauen', einbau.id, all(AKTIV, item(BEIN)))] },
  },
};
