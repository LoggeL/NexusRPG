// Meister Watt – hält seit 30 Jahren dieselbe Pose am Schrottmarkt, Tai-Chi-Lehrer (world.md §4.5).
// In side-thai-chi (quest-side-b) kann er Hunters Lehrer werden (Flag tc_lehrer_watt): dann morgens im Hinterhof-Studio.
// Spricht … sehr … langsam.
import type { ContentPart } from '../../part';
import type { Condition, DialogueChoice, DialogueNode } from '../../../modules/contracts';
import {
  type Menue, dialog, erz, flag, geschenke, gespraech, herz, ich, knoten, nichtGetroffen, ort, pruefung, rede, sammle,
  sprecher, weg, weltfigur, zurueck,
} from './_welt';
import { akt23 } from './meister-watt-akt23';

const ID = 'meister-watt';
const W = sprecher(ID);
const LEHRER: Condition = { all: [{ quest: 'side-thai-chi', state: 'active' }, { flag: 'tc_lehrer_watt' }] };
const Z = zurueck('Noch … eine … Frage.', 'Ich … geh … dann.');

const choices: DialogueChoice[] = [
  { text: 'Warum stehen Sie seit dreißig Jahren so da?', once: true, id: 'wa-pose', next: 'pose' },
  { text: 'Was sehen Sie von hier aus?', next: 'sehen' },
  { text: 'Können Sie mir was beibringen?', next: 'lehre', effects: [{ advanceTime: 60 }] },
  { text: 'Ich … geh … dann.' },
];

const nodes: DialogueNode[] = [
  knoten('pose', [
    W('… Die … Pose … heißt … „Kranich … wartet … auf … Strom“.'),
    W('… Als … ich … anfing … gab … es … Stromausfall. … Ich … warte … noch.'),
    erz('Ein Händler ruft im Vorbeigehen: „Watt, das Netz läuft seit 2061 wieder!“ Meister Watt bewegt keinen Muskel.'),
    W('… Ich … warte … auf … den … richtigen … Strom.'),
  ], { choices: Z }),
  knoten('sehen', [
    W('… Alles. … Wer … klaut. … Wer … liebt. … Wer … Gutscheine … druckt.'),
    W('… Und … eine … große … Frau … mit … Schläger … die … auf … dem … Kran … sitzt … und … zu … den … Lötgassen … schaut. … Jeden … Abend. … Sehnsüchtig.'),
  ], { choices: Z }),
  knoten('lehre', [
    erz('Meister Watt zeigt dir, wie man den Arm hebt. Es dauert eine Stunde. Am Ende ist dein Arm auf Schulterhöhe und du hast Muskelkater an Stellen, von denen du nichts wusstest.'),
    W('… Gut. … Morgen … der … andere … Arm.'),
  ], { choices: Z, effects: [herz(ID, 10), { xp: 10 }] }),
];

const M: Menue = { zeile: W('… Und … weiter?'), choices, nodes };

const T = {
  rivale: dialog('watt-tag-rivale', [knoten('start', [erz('Meister Watt schließt die Augen. Langsam. Das ist bei ihm ein Türknallen.')])]),
  erstes: gespraech('watt-tag-erstes', [
    erz('Mitten im Gewühl des Schrottmarkts steht ein alter Mann auf einem Bein, die Arme ausgebreitet, ein Fuß am Knie. Auf seinem Kopf sitzt eine Taube. Auf der Taube sitzt eine zweite.'),
    W('… Willkommen.'),
    erz('Eine Minute vergeht.'),
    W('… Ich … bin … Watt.'),
  ], M),
  studio: gespraech('watt-tag-studio', [
    erz('Im Hinterhof-Studio steht Meister Watt auf einem Bein. Diesmal auf dem anderen. Das ist eine Sensation.'),
    W('… Die … Diva … kommt … gleich. … Sie … kommt … immer … zu … spät. … Wie … der … Strom.'),
  ], M),
  standard: gespraech('watt-tag-standard', [W('… Hallo.'), erz('Die Taube auf seinem Kopf gurrt. Watt nickt einen Millimeter.')], M),
};

/** ♥2: Eine Woche lang jeden Tag einen Atemzug mit Watt. */
const he2 = dialog('he-meister-watt-2', [
  knoten('start', [
    erz('Meister Watt öffnet die Augen, als du vorbeikommst. Ganz.'),
    W('… Stell … dich … neben … mich. … Ein … Bein. … Eine … Minute.'),
  ], {
    choices: [
      { text: 'Auf einem Bein balancieren, eine volle Minute.', tag: '[Reflexe 4]', check: pruefung('he-watt-2-balance', 'reflexe', 4), next: 'gehalten' },
      { text: 'Es versuchen und umfallen. Wieder und wieder.', next: 'umgefallen' },
    ],
  }),
  knoten('gehalten', [
    erz('Sechzig Sekunden. Der Markt rauscht. Eine Taube landet auf deinem Kopf. Du hältst.'),
    W('… Gut. … Die … Taube … mag … dich.'),
  ], { next: 'ende', effects: [herz(ID, 45), { xp: 40 }] }),
  knoten('umgefallen', [
    erz('Du fällst. Du fällst noch einmal. Beim fünften Mal fällst du in Willis Hütchenstand. Willi verliert eine Kugel. Er findet sie in deiner Kapuze.'),
    W('… Fallen … ist … auch … eine … Pose. … Die … erste.'),
  ], { next: 'ende', effects: [herz(ID, 35), { xp: 25 }] }),
  knoten('ende', [W('… Komm … wieder. … In … dreißig … Jahren … bist … du … gut.')], { effects: [flag('watt_schueler')] }),
]);

/** ♥4: Meister Watt bewegt sich. */
const he4 = dialog('he-meister-watt-4', [
  knoten('start', [
    erz('Abendsonne über dem Schrottmarkt, rostrot. Meister Watt steht da wie immer. Dann, ganz langsam, senkt er den Fuß. Er steht auf zwei Beinen. Händler lassen ihre Ware fallen.'),
    W('… Dreißig … Jahre. … Heute … ist … der … Strom … gekommen.'),
    ich('Welcher Strom?'),
    W('… Du. … Jemand … der … wiederkommt.'),
  ], {
    choices: [
      { text: 'Die Pose spiegeln, ganz langsam, Arm für Arm.', tag: '[Reflexe 5]', check: pruefung('he-watt-4-spiegeln', 'reflexe', 5), next: 'spiegel' },
      { text: '„Und was machen Sie jetzt, wo Sie sich bewegen?“', next: 'jetzt' },
      { text: 'Ihm ein Tai-Chi-Tee hinhalten.', requires: { item: 'tai-chi-tee' }, effects: [{ take: 'tai-chi-tee' }], next: 'tee' },
    ],
  }),
  knoten('spiegel', [erz('Ihr steht euch gegenüber und bewegt euch wie zwei Seiten eines Spiegels. Der Markt schaut still zu. Sogar Gerd hört auf zu verkaufen.')], { next: 'ende', effects: [herz(ID, 60)] }),
  knoten('jetzt', [W('… Jetzt … gehe … ich … zur … Garküche. … Ich … habe … seit … dreißig … Jahren … nicht … gegessen. … Das … ist … gelogen. … Babette … füttert … mich.')], { next: 'ende', effects: [herz(ID, 50)] }),
  knoten('tee', [erz('Watt trinkt. Es dauert zehn Minuten. Am Ende lächelt er. Das dauert noch einmal fünf.')], { next: 'ende', effects: [herz(ID, 60)] }),
  knoten('ende', [
    W('… Morgen … stehe … ich … wieder. … Auf … einem … Bein. … Aber … anders.'),
    W('… Weil … ich … weiß … dass … ich … gehen … kann.'),
  ], { effects: [{ xp: 60 }, flag('watt_bewegt')] }),
]);

// Akt 2, Partynacht und Nachspiel: meister-watt-akt23.ts.
const A23 = akt23(M);

const watt = weltfigur({
  id: ID,
  name: 'Meister Watt',
  unknownName: 'Mann auf einem Bein',
  faction: 'unterstadt',
  bio: 'Steht seit dreißig Jahren in der Pose „Kranich wartet auf Strom“ mitten im Schrottmarkt. Tai-Chi-Meister, Taubenständer, sieht alles. Spricht … sehr … langsam.',
  gifts: geschenke({
    loves: ['tai-chi-tee', 'haiku-buechlein', 'orchidee'],
    likes: ['kraeuter-gebaeck', 'blumensamen', 'sternkarte'],
    dislikes: ['volt-limo', 'synth-kaffee'],
    hates: ['magnet-stoerer', 'kanalschlamm'],
  }),
  schedule: [
    ort('M', 'loetgassen', 'hinterhof-studio', { when: LEHRER }),
    ort('M,T,A', 'schrottmarkt', 'watt-pose'),
    weg('N'),
  ],
  heartEvents: [
    { id: 'he-meister-watt-2', hearts: 2, map: 'schrottmarkt', time: ['morgen', 'tag'], dialogue: 'he-meister-watt-2' },
    { id: 'he-meister-watt-4', hearts: 4, map: 'schrottmarkt', time: 'abend', when: { seen: 'he-meister-watt-2' }, dialogue: 'he-meister-watt-4' },
  ],
  talk: [
    rede('watt-tag-rivale', { rival: ID }),
    rede('watt-tag-erstes', nichtGetroffen(ID)),
    ...A23.talk,
    rede('watt-tag-studio', { all: [LEHRER, { time: 'morgen' }] }),
    rede('watt-tag-standard'),
  ],
});

export const part: ContentPart = {
  npcs: { [ID]: watt },
  dialogues: sammle(T.rivale, T.erstes, T.studio, T.standard, he2, he4, ...A23.dialogues),
};
