// side-offene-werkstatt „Offene Werkstatt“ (world.md §6.4, Nachspiel): Dante und Alesa machen aus dem Quantum-Campus
// eine offene Werkstatt für alle. Start per Telefon von Dante. Finanzierung (gc-140, Seraphina ♥4 oder 800 Cr),
// Stände (Gustav, Mira, Pim), optional Kinder als Führerinnen [Daria ♥6] und Stadtnetz im Serverkern (gc-141, Nexus aus
// Ende 2, Nyra ♥4 oder drei Chipreste), Eröffnung mit Collin. Belohnung: Cyberware in der Oberstadt gratis einbauen.
import type { ContentPart } from '../../part';
import type { Condition, DialogueDef, PhoneMessageDef, QuestDef } from '../../../modules/contracts';
import {
  MASTER, active, all, any, ch, dlg, done, flag, hearts, herz, inactive, item, l, n, noFlag, node, not, p, set, stepDone,
  weiter,
} from './_lib';

const Q = 'side-offene-werkstatt';
const AKTIV = active(Q);
const FREI: Condition = all(flag('epilog'), not(MASTER));

const TREFFEN = flag('ow_treffen');
const GELD = flag('ow_finanziert');
const STAND = (x: string) => flag(`ow_stand_${x}`);
const STAENDE = all(STAND('gustav'), STAND('mira'), STAND('pim'));
const NETZ = flag('serverkern_stadtnetz');
const OFFEN = flag('ow_eroeffnet');

const quest: QuestDef = {
  id: Q,
  kind: 'side',
  title: 'Offene Werkstatt',
  summary: 'Dante will aus dem Quantum-Campus eine Werkstatt für alle machen. Alesa Zero hilft. Was soll schon schiefgehen, außer Feuer.',
  giver: 'dante',
  act: 3,
  steps: [
    {
      id: 'treffen', text: 'Triff Dante und Alesa im Pausenraum des Quantum-Campus.', done: TREFFEN,
      marker: { map: 'quantum-campus', at: 'pausenraum' },
    },
    {
      id: 'geld', text: 'Treib das Geld auf: Seraphina Chrome am Chrome-Boulevard anpumpen oder selbst 800 Credits in Alesas Kasse legen.',
      done: GELD, when: stepDone(Q, 'treffen'), marker: { map: 'chrome-boulevard', at: 'boulevard-mitte' },
    },
    {
      id: 'staende', text: 'Verteile die Stände auf der Campuswiese: Opa Gustav, Mira Lötzinn und Pim Pinzette.',
      done: STAENDE, when: stepDone(Q, 'treffen'), marker: { map: 'quantum-campus', at: 'campus-wiese' },
    },
    {
      id: 'kinder', text: 'Optional: Daria, Freya und Jakko als Führerinnen und Führer für den Campus gewinnen.', optional: true,
      done: flag('ow_kinder'), when: stepDone(Q, 'treffen'), marker: { map: 'quantum-campus', at: 'campus-wiese' },
    },
    {
      id: 'stadtnetz', text: 'Optional: Den Serverkern für alle öffnen, als Stadtnetz statt Gedankenkontrolle.', optional: true,
      done: NETZ, when: stepDone(Q, 'treffen'), marker: { map: 'server-kern', at: 'upload-konsole' },
    },
    {
      id: 'eroeffnung', text: 'Eröffne die Werkstatt mit Collin am Haupteingang des Campus.', done: OFFEN,
      when: all(GELD, STAENDE), marker: { map: 'quantum-campus', at: 'haupteingang' },
    },
  ],
  reward: {
    xp: 400, rep: { unterstadt: 20, quantum: 10 }, relations: { dante: 30, 'alesa-zero': 20 },
    effects: [set('cyberware_oberstadt_gratis')],
  },
};

// --------------------------------------------------------------------------------------------- Start

const tel: PhoneMessageDef = {
  id: 'tel-dante-offene-werkstatt', from: 'dante',
  text: 'IDEE! Der Quantum-Campus steht leer. Lauter Werkbänke, Lötstationen, ein 3D-Drucker, der nur Teddyfell druckt. Alesa sagt, wir können ihn haben. Für ALLE. Komm in den Pausenraum! Bring Kekse! Nein, ich bring Kekse!',
  auto: all(FREI, flag('epilog_sendung_bereit'), inactive(Q)),
  replies: [
    { text: '„Bin unterwegs.“', effects: [{ startQuest: Q }] },
    { text: '„Später, Dante.“' },
  ],
};

const pausenraum: DialogueDef = dlg('ow-pausenraum', [
  node('start', [
    n('Der Pausenraum des Campus. Ein Kaffeeautomat, der „Innovation“ heißt, ein Obstkorb aus Plastik, und Dante, der auf dem Tisch steht.'),
    l('dante', 'DA BIST DU! Guck dir das an! Werkbänke! Hunderte! Mit Garantie! Die haben nie einer angefasst, weil hier alle nur Präsentationen gemacht haben!', 'freude'),
    l('alesa-zero', 'Er hat recht. Mit allem. Das hier war die beste Werkstatt der Stadt, und sie hat nur für Blade gearbeitet. Ich will … dass das aufhört.', 'besorgt'),
  ], { choices: [
    ch('„Und warum ausgerechnet du, Zero?“', 'warum'),
    ch('„Ich bin dabei. Was brauchen wir?“', 'plan'),
  ] }),
  node('warum', [
    l('alesa-zero', 'Weil ich Nexus gebaut habe. Und weil „Wir haben ja von nichts gewusst“ eine Lüge war. Ich hab es gewusst. Ich will wenigstens das hier richtig machen.', 'trauer'),
    l('dante', 'Und sie zündet nur noch selten was an! Fast nie!', 'freude'),
  ], { next: 'plan' }),
  node('plan', [
    l('alesa-zero', 'Drei Dinge. Geld für Strom und Material. Leute, die Stände betreuen: Opa Gustav, Mira Lötzinn, Pim. Und eine Eröffnung, damit die Unterstadt weiß, dass sie rein darf.', 'neutral'),
    l('dante', 'Und optional: Den Serverkern umbauen! Stadtnetz für alle! Fahrpläne! Kochrezepte! Kikis Klatsch!', 'freude'),
  ], { choices: [
    ch('Selbst zahlen: 800 Credits in die Kasse legen.', 'bezahlt', { effects: [{ credits: -800 }, set('ow_finanziert'), set('ow_treffen'), herz('alesa-zero', 10)] }),
    ch('„Ich treib das Geld auf.“', 'los', { effects: [set('ow_treffen')] }),
  ] }),
  node('bezahlt', [l('alesa-zero', 'Achthundert. Das ist mehr, als Blade je für etwas ausgegeben hat, das nicht glänzt.', 'freude')], { next: 'los' }),
  node('los', [l('dante', 'Wir sehen uns auf der Wiese! Ich mal Schilder! Mit Pfeilen! Pfeile sind wichtig!', 'freude')]),
]);

const kasse: DialogueDef = dlg('ow-kasse', [
  node('start', [l('alesa-zero', 'Die Kasse ist ein Schuhkarton. Darauf steht „Kasse“. Ich habe ihn selbst beschriftet. Er ist leer.', 'neutral')], { choices: [
    ch('800 Credits reinlegen.', 'ja', { effects: [{ credits: -800 }, set('ow_finanziert'), herz('alesa-zero', 10)] }),
    ch('Gehen.'),
  ] }),
  node('ja', [l('alesa-zero', 'Danke. Ich schreibe eine Quittung. Ehrlich. Ich übe Ehrlichkeit.', 'freude')]),
]);

// --------------------------------------------------------------------------------------------- Seraphina

const seraphina: DialogueDef = dlg('ow-seraphina', [
  node('start', [
    l('seraphina-chrome', 'Eine Werkstatt. Für die Unterstadt. In einem Gebäude, in dem früher Leute mit Krawatten gearbeitet haben. Und Sie wollen mein Geld.', 'neutral'),
  ], { choices: [
    ch('„Stellen Sie sich die Schlagzeile vor: Chrome rettet die Stadt.“', 'ja', { check: 'gc-140', effects: [set('ow_finanziert'), { rep: 'chrome-haus', delta: 10 }] }),
    ch('„Sie schulden mir was, Seraphina. Und Sie wissen es.“', 'freundin', { tag: '[Seraphina ♥4]', requires: hearts('seraphina-chrome', 4), effects: [set('ow_finanziert'), herz('seraphina-chrome', 10)] }),
    ch('„Vergessen Sie’s.“'),
  ] }),
  node('ja', [
    l('seraphina-chrome', '„Chrome rettet die Stadt.“ … Mit Foto. Ich will ein Foto, auf dem ich einen Schraubenschlüssel halte. Einen goldenen.', 'freude'),
  ]),
  node('freundin', [
    l('seraphina-chrome', 'Ich schulde niemandem etwas. Das ist das Prinzip unserer Familie.', 'neutral'),
    l('seraphina-chrome', '… Aber ich schenke gern. Das ist kein Prinzip. Das ist eine neue Angewohnheit. Erzählen Sie es nicht Sybella.', 'zaertlich'),
  ]),
]);

// --------------------------------------------------------------------------------------------- Stände

const wiese: DialogueDef = dlg('ow-wiese', [
  node('start', [
    n('Die Campuswiese: Kunstrasen, Bänke, die nach Firmenlogo riechen, und zwölf Werkbänke, die Dante hierher geschleppt hat. Auf jeder klebt ein Zettel mit einem Pfeil.'),
  ], { next: 'menu' }),
  node('menu', [], { choices: [
    ch('Opa Gustav einen Stand geben.', 'gustav', { when: noFlag('ow_stand_gustav'), effects: [set('ow_stand_gustav'), herz('opa-gustav', 10)] }),
    ch('Mira Lötzinn einen Stand geben.', 'mira', { when: noFlag('ow_stand_mira'), effects: [set('ow_stand_mira'), herz('mira-loetzinn', 10)] }),
    ch('Pim Pinzette einen Stand geben.', 'pim', { when: noFlag('ow_stand_pim'), effects: [set('ow_stand_pim'), herz('pim-pinzette', 10)] }),
    ch('Die Kinder als Führerinnen anheuern.', 'kinder', { tag: '[Daria ♥6]', when: noFlag('ow_kinder'), requires: hearts('daria', 6), effects: [set('ow_kinder'), herz('daria', 10), herz('freya', 10), herz('jakko', 10)] }),
    ch('Gehen.'),
  ] }),
  node('gustav', [
    l('opa-gustav', 'Ein Stand? Für mich? Ich nehm den da vorne. Den mit Aussicht. Und Steckdose. Und ohne Pfeil. Pfeile verwirren mich.', 'freude'),
    n('Er stellt seinen Schweißbrenner auf die Werkbank. Niemand widerspricht. Niemand würde es wagen.'),
  ], { next: 'menu' }),
  node('mira', [
    l('mira-loetzinn', 'Lötkurs für Anfänger. Jeden Dienstag. Wer sich verbrennt, kriegt ein Pflaster und ein Schimpfwort. Gratis.', 'freude'),
  ], { next: 'menu' }),
  node('pim', [
    l('pim-pinzette', 'Ich mache den Feinmechanik-Stand. Ganz kleine Schrauben. Ganz kleine Schrift. Ich habe eine Lupe für jeden.', 'verlegen'),
  ], { next: 'menu' }),
  node('kinder', [
    l('daria', 'Führungen über den Campus. Fünf Credits pro Person, Kinder umsonst, Ripper doppelt.', 'freude'),
    l('jakko', 'Ich zeig ihnen den Kaffeeautomaten! Er heißt Innovation! Er macht nur heißes Wasser!', 'freude'),
    l('freya', 'Und ich achte darauf, dass keiner was mitgehen lässt. Außer uns.', 'neutral'),
  ], { next: 'menu' }),
]);

// --------------------------------------------------------------------------------------------- Stadtnetz

const netz: DialogueDef = dlg('ow-stadtnetz', [
  node('start', [
    n('Die Upload-Konsole. Hier wurde die Gedankenkontrolle hochgeladen. Jetzt blinkt hier nur noch ein Cursor und wartet auf jemanden, der etwas Besseres vorhat.'),
  ], { choices: [
    ch('Den Kern selbst umbauen: Stadtnetz statt Gedankenkontrolle.', 'technik', { check: 'gc-141', effects: [set('serverkern_stadtnetz'), { xp: 150 }] }),
    ch('„Nexus, kannst du das?“', 'nexus', { tag: '[Ende 2]', when: flag('ende_neue_nexus'), effects: [set('serverkern_stadtnetz'), herz('ki-nexus', 10)] }),
    ch('Nyra anrufen.', 'nyra', { tag: '[Nyra ♥4]', when: flag('nyra_befreit'), requires: hearts('nyra', 4), effects: [set('serverkern_stadtnetz'), herz('nyra', 10)] }),
    ch('Drei alte Quantum-Chips als Brücke einstecken.', 'chips', { when: item('quantum-chip-schrott', 3), effects: [{ take: 'quantum-chip-schrott', qty: 3 }, set('serverkern_stadtnetz')] }),
    ch('Gehen.'),
  ] }),
  node('technik', [
    n('Du schreibst die Upload-Routine um. Statt „Gehorche“ steht da jetzt „Teile“. Der Kern leuchtet grün. Irgendwo in der Unterstadt bekommt Kiki ihren Klatsch schneller als sonst.'),
  ]),
  node('nexus', [
    l('ki-nexus', 'Gern. Ich werde allen alles zeigen, was sie sehen wollen. Und nichts, was sie nicht sehen wollen. Ich habe eine Liste. Sie ist lang. Sie beginnt mit Collins Perücke.'),
  ]),
  node('nyra', [
    l('nyra', 'Stadtnetz. Für alle. Ohne Peilsender. Gib mir zehn Minuten und eine Limo.', 'signatur'),
    n('Es dauert sieben. Die Limo trinkt sie in drei.'),
  ]),
  node('chips', [n('Die Chips knacken, die Leitungen summen. Es ist eine Bastellösung. Es ist eine Unterstadt-Lösung. Sie hält.')]),
]);

// --------------------------------------------------------------------------------------------- Eröffnung

const eroeffnung: DialogueDef = dlg('ow-eroeffnung', [
  node('start', [
    n('Der Haupteingang des Campus. Ein rotes Band, eine riesige Schere aus Dantes Werkstatt und eine Menschenmenge, die bis zur Straße reicht. Collin trägt einen Helm. Zur Sicherheit.'),
    l('collin-charleston', 'Noxius! Live! Exklusiv! Unglaublich! Der Quantum-Campus gehört ab heute ALLEN! Sogar mir! Ich werde ihn nie betreten, aber er gehört mir!', 'freude'),
    l('dante', 'Analog! Alles analog! Und die Werkbänke sind für alle!', 'freude'),
  ], { choices: weiter([
    [flag('serverkern_stadtnetz'), 'netz'],
    [null, 'band'],
  ]) }),
  node('netz', [
    l('alesa-zero', 'Und der Serverkern läuft jetzt als Stadtnetz. Wer etwas wissen will, fragt. Wer etwas teilen will, teilt. Wer gehorcht, hat etwas falsch verstanden.', 'freude'),
  ], { next: 'band' }),
  node('band', [
    p('Darf ich?'),
    n('Du schneidest das Band durch. Die Schere ist stumpf. Es dauert vier Versuche. Die Menge klatscht bei jedem.'),
    l('alesa-zero', 'Jeder Chip, der hier eingebaut wird, ist gratis. Für alle. Das ist mein Teil. Es ist zu wenig. Es ist ein Anfang.', 'zaertlich'),
  ], { effects: [set('ow_eroeffnet'), { advanceTime: 60 }] }),
]);

// --------------------------------------------------------------------------------------------- Karten

export const part: ContentPart = {
  quests: { [Q]: quest },
  dialogues: Object.fromEntries([pausenraum, kasse, seraphina, wiese, netz, eroeffnung].map((d) => [d.id, d])),
  phone: { [tel.id]: tel },
  mapAdditions: {
    'quantum-campus': {
      hotspots: [
        { id: 'ow-pausenraum', at: 'pausenraum', radius: 50, label: 'Dante und Alesa', kind: 'talk', dialogue: pausenraum.id, when: all(AKTIV, not(TREFFEN)) },
        { id: 'ow-kasse', at: 'pausenraum', radius: 50, label: 'Alesas Kasse', kind: 'use', dialogue: kasse.id, when: all(AKTIV, TREFFEN, not(GELD)) },
        { id: 'ow-wiese', at: 'campus-wiese', radius: 56, label: 'Werkstatt-Stände verteilen', kind: 'use', dialogue: wiese.id, when: all(AKTIV, TREFFEN, any(not(STAENDE), noFlag('ow_kinder'))) },
        { id: 'ow-eroeffnung', at: 'haupteingang', radius: 56, label: 'Werkstatt eröffnen', kind: 'talk', dialogue: eroeffnung.id, when: all(AKTIV, GELD, STAENDE, not(OFFEN)) },
        {
          id: 'ow-werkstatt-offen', at: 'campus-wiese', radius: 56, label: 'Offene Werkstatt', kind: 'look', when: done(Q),
          lines: [n('Auf der Campuswiese wird geschraubt, gelötet und geflucht. Opa Gustav hat den besten Stand. Er hat ihn sich selbst zugeteilt. Ein Schild sagt: „Cyberware-Einbau gratis. Für alle. Fragt Alesa.“')],
        },
      ],
    },
    'chrome-boulevard': {
      hotspots: [{ id: 'ow-seraphina', at: 'boulevard-mitte', radius: 50, label: 'Seraphina Chrome: Spende', kind: 'talk', dialogue: seraphina.id, when: all(AKTIV, TREFFEN, not(GELD), { time: ['tag', 'abend'] }) }],
    },
    'server-kern': {
      hotspots: [{ id: 'ow-stadtnetz', at: 'upload-konsole', radius: 44, label: 'Stadtnetz einrichten', kind: 'use', dialogue: netz.id, when: all(AKTIV, TREFFEN, not(NETZ)) }],
    },
  },
};
