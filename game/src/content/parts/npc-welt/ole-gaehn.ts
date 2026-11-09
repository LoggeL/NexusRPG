// Ole Gähn – Hausmeister im Digitech-Areal, schläft immer (world.md §4.5). Sitzt auf der Bank am Pförtnerhaus.
// Er hat 2050 Gerda Gleis einen Brief geschrieben (he-gerda-gleis-4, Flag gerda_brief_ole).
import type { ContentPart } from '../../part';
import type { Condition, DialogueChoice, DialogueNode } from '../../../modules/contracts';
import {
  type Menue, dialog, erz, flag, geschenke, gespraech, herz, ich, knoten, nichtGetroffen, ort, pruefung, rede, sammle,
  sprecher, weg, weltfigur, zurueck,
} from './_welt';

const ID = 'ole-gaehn';
const O = sprecher(ID);
const BRIEF: Condition = { flag: 'gerda_brief_ole' };
const Z = zurueck('Ole. OLE. Noch was.', 'Schlaf weiter.');

const choices: DialogueChoice[] = [
  { text: 'Was machst du hier eigentlich?', next: 'job' },
  { text: 'Hast du in der Digitech-Nacht was gesehen?', once: true, id: 'ol-nacht', next: 'nacht' },
  { text: 'Ihm einen Kaffee hinhalten.', requires: { item: 'synth-kaffee' }, effects: [{ take: 'synth-kaffee' }, herz(ID, 15)], next: 'kaffee' },
  { text: '„Gerda lässt grüßen. Vom Bahnsteig 3.“', when: BRIEF, once: true, id: 'ol-gerda', next: 'gerda' },
  { text: 'Schlaf weiter.' },
];

const nodes: DialogueNode[] = [
  knoten('job', [
    O('Hausmeister. Ich halte das Haus. Es fällt nicht um. Seit sieben Jahren. Gute Arbeit.'),
    erz('Er schläft mitten im Satz ein. Dann wacht er auf.'),
    O('… Wo war ich? Ach ja. Gute Arbeit.'),
  ], { choices: Z }),
  knoten('nacht', [
    O('Die Nacht? Hab geschlafen. Wie immer. Aber ich hab was gehört. Im Traum. Einen Mann, der „Ich teile nicht gerne“ gesagt hat. Und ein Klicken. Handschellen.'),
    O('Und jemand hat am Rohr geweint. Lange. Ich dachte, das ist der Traum. Am Morgen waren Kratzer am Rohr.'),
  ], { choices: Z, effects: [flag('ole_traum_digitech')] }),
  knoten('kaffee', [
    erz('Ole trinkt. Seine Augen öffnen sich ganz. Er sieht aus wie ein Mann, der zum ersten Mal die Welt sieht. Und sie nicht besonders mag.'),
    O('Oh. Es ist hell. Wann ist das passiert?'),
  ], { choices: Z }),
  knoten('gerda', [
    O('Gerda? Mit dem roten Schal? … Sie hat den Brief gelesen?', 'ueberrascht'),
    erz('Ole ist plötzlich hellwach. So wach, dass er sich an der Bank festhalten muss.'),
    O('Ich bin jeden Morgen eine Station zu spät ausgestiegen. Sechsunddreißig Jahre. Ich bin davon so müde geworden.'),
  ], { choices: Z, effects: [herz(ID, 40)] }),
];

const M: Menue = { zeile: O('Hm? … Ja. Ich bin wach. Fast.'), choices, nodes };

const T = {
  rivale: dialog('ole-tag-rivale', [knoten('start', [erz('Ole schnarcht. Laut. Lauter, als du näherkommst. Er macht das absichtlich.')])]),
  erstes: gespraech('ole-tag-erstes', [
    erz('Auf der Bank vor dem Pförtnerhaus liegt ein Mann im Blaumann, die Mütze übers Gesicht gezogen, einen Besen im Arm wie einen Teddy. Er schnarcht im Takt des Notstromgenerators.'),
    O('… Hm? … Wer? … Ole. Gähn. Hausmeister. Ich hab nicht geschlafen. Ich hab die Augen ausgeruht. Sehr gründlich.'),
  ], M),
  gerda: gespraech('ole-tag-gerda', [
    erz('Ole sitzt aufrecht auf der Bank. Er hat sich gekämmt. Neben ihm liegt ein Fahrplan der Linie 3, mit Kugelschreiber eingekreist: Bahnsteig 3.'),
    O('Ich bin heute nicht eingeschlafen. Nicht einmal. Weißt du, wie anstrengend das ist?'),
  ], M),
  standard: gespraech('ole-tag-standard', [erz('Ole schläft. Ein Spatz sitzt auf seinem Besen.'), O('… Bin wach. … Was gibt’s?')], M),
};

/** ♥2: Ole schläft auf der Patrouille ein – und der Wachroboter rollt an. */
const he2 = dialog('he-ole-gaehn-2', [
  knoten('start', [
    erz('Ein verrosteter Wachroboter rollt über das Areal, die Sensoren rot. Er steuert direkt auf die Bank zu, auf der Ole schläft. „EINDRINGLING“, plärrt er. Er meint Ole.'),
  ], {
    choices: [
      { text: 'Den Wachroboter umprogrammieren: Ole ist Personal.', tag: '[Technik 4]', check: pruefung('he-ole-2-roboter', 'technik', 4, ['maschine']), next: 'programmiert' },
      { text: 'Ole schnell von der Bank ziehen und hinter dem Pförtnerhaus verstecken.', tag: '[Körper 4]', check: pruefung('he-ole-2-ziehen', 'koerper', 4, ['kraft']), next: 'gezogen' },
      { text: 'Ole wecken. Laut.', next: 'wecken' },
    ],
  }),
  knoten('programmiert', [erz('Der Roboter piept, rollt zurück und stellt sich neben die Bank. Wie ein Hund. Er bleibt da. Ole wacht auf und tätschelt ihn. Er hält ihn für einen Mülleimer.')], { next: 'ende', effects: [herz(ID, 45), { xp: 40 }] }),
  knoten('gezogen', [erz('Du zerrst Ole hinter das Pförtnerhaus. Er wacht nicht auf. Der Roboter verhaftet die Bank. Das Pförtnerhaus hat jetzt eine Bank weniger.')], { next: 'ende', effects: [herz(ID, 40), { xp: 40 }] }),
  knoten('wecken', [
    ich('OLE! ROBOTER!'),
    O('… Hm? Ah. Hallo, Rudolf.'),
    erz('Ole hält dem Roboter die Hand hin. Der Roboter stoppt, scannt, piept freundlich. Sie kennen sich. Seit Jahren.'),
  ], { next: 'ende', effects: [herz(ID, 35), { xp: 25 }] }),
  knoten('ende', [O('Danke. Du hast mir den Mittagsschlaf gerettet. Das ist der wichtigste Schlaf. Nach dem Vormittagsschlaf.')], { effects: [flag('ole_freund')] }),
]);

/** ♥4: Ole bleibt wach – für eine Stunde. */
const he4 = dialog('he-ole-gaehn-4', [
  knoten('start', [
    erz('Ole steht vor der Bank. Steht. Er hält sich mit beiden Händen am Besen fest wie an einem Geländer.'),
    O('Ich will eine Stunde wach bleiben. Eine ganze. Am Stück. Ich hab das seit 2050 nicht geschafft. Hilf mir.'),
  ], {
    choices: [
      { text: 'Mit ihm reden, eine Stunde lang. Über alles.', tag: '[Ausstrahlung 5]', check: pruefung('he-ole-4-reden', 'ausstrahlung', 5, ['ueberreden']), next: 'geschafft' },
      { text: 'Mit ihm über das Areal laufen. Wer läuft, schläft nicht.', next: 'laufen' },
      { text: '„Geh zu Gerda. Da wirst du nicht einschlafen.“', when: BRIEF, next: 'gerda' },
    ],
  }),
  knoten('geschafft', [erz('Ihr redet über Rostregen, Tauben, alte Fahrpläne. Nach einer Stunde schlägt die Uhr am Pförtnerhaus. Ole ist wach. Er reißt die Arme hoch. Dann schläft er sofort ein. Glücklich.')], { next: 'ende', effects: [herz(ID, 60)] }),
  knoten('laufen', [erz('Ihr lauft. Ole schläft zweimal im Gehen ein und läuft trotzdem weiter. Das ist ein Talent. Nach einer Stunde sitzt er auf der Bank und grinst.'), O('Zweimal geschlafen. Aber im Gehen. Das zählt halb.')], { next: 'ende', effects: [herz(ID, 50)] }),
  knoten('gerda', [
    erz('Am Bahnsteig 3 steht eine Dame mit rotem Schal. Links getragen. Ole steigt aus der Bahn. Pünktlich. Zum ersten Mal.'),
    O('Gerda.'),
    sprecher('gerda-gleis')('Du bist zu spät. Sechsunddreißig Jahre.'),
    O('Ich weiß. Ich war müde.'),
  ], { next: 'ende', effects: [herz(ID, 70), herz('gerda-gleis', 30), flag('ole_gerda_bahnsteig')] }),
  knoten('ende', [
    ich('Wie fühlt es sich an, wach zu sein?'),
    O('Laut. Hell. Und ein bisschen schön. Aber jetzt schlaf ich. Ich hab’s mir verdient.'),
  ], { effects: [{ xp: 60 }] }),
]);

const ole = weltfigur({
  id: ID,
  name: 'Ole Gähn',
  unknownName: 'Schlafender Hausmeister',
  faction: 'digitech',
  bio: 'Hausmeister im Digitech-Areal. Blaumann, Mütze, Besen im Arm. Schläft immer, überall, im Stehen. Ist seit 2050 jeden Morgen eine Station zu spät ausgestiegen.',
  gifts: geschenke({
    loves: ['synth-kaffee', 'kapuzenpulli', 'kraeuter-gebaeck'],
    likes: ['zeitung-papier', 'plueschmoehre', 'teddyfell-buerste', 'brezel'],
    dislikes: ['volt-limo', 'mikrofon-puschel'],
    hates: ['feuerloescher-mini', 'kanalschlamm'],
  }),
  schedule: [ort('M,T,A', 'digitech-areal', 'pfoertnerhaus-bank'), weg('N')],
  heartEvents: [
    { id: 'he-ole-gaehn-2', hearts: 2, map: 'digitech-areal', time: ['morgen', 'tag'], dialogue: 'he-ole-gaehn-2' },
    { id: 'he-ole-gaehn-4', hearts: 4, map: 'digitech-areal', time: ['morgen', 'tag'], when: { seen: 'he-ole-gaehn-2' }, dialogue: 'he-ole-gaehn-4' },
  ],
  talk: [
    rede('ole-tag-rivale', { rival: ID }),
    rede('ole-tag-erstes', nichtGetroffen(ID)),
    rede('ole-tag-gerda', BRIEF),
    rede('ole-tag-standard'),
  ],
});

export const part: ContentPart = {
  npcs: { [ID]: ole },
  dialogues: sammle(T.rivale, T.erstes, T.gerda, T.standard, he2, he4),
};
