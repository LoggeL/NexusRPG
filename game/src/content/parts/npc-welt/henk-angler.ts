// Henk Angler – Leuchtturmwärter und Angler an der Flutmauer (world.md §4.5, Shop henk-angler). Questgeber
// side-hunde-der-brackbucht (Start über den Hotspot hb-henk-auftrag der Quest, quest-side-b). Ab ♥3 öffnen die Karte
// flutmauer die Notunterkunft im Leuchtturm und der Shop die Profi-Angel (beides an `hearts henk-angler ≥ 3`).
import type { ContentPart } from '../../part';
import type { DialogueChoice, DialogueNode } from '../../../modules/contracts';
import {
  type Menue, dialog, erz, flag, geschenke, gespraech, herz, ich, knoten, nichtGetroffen, ort, pruefung, rede, sammle,
  sprecher, weltfigur, zurueck,
} from './_welt';

const ID = 'henk-angler';
const QUEST = 'side-hunde-der-brackbucht';
const H = sprecher(ID);
const Z = zurueck('Noch was, Henk.', 'Petri Heil.');

const choices: DialogueChoice[] = [
  { text: 'Was hast du an Anglerbedarf?', next: 'laden', effects: [{ shop: 'henk-angler' }] },
  {
    text: 'Eine Runde mit dir angeln.', tag: '[Angeln]', next: 'angeln',
    effects: [{
      minigame: 'akt-angeln', level: 1, key: 'henk-angeln', label: 'Angeln mit Henk',
      win: [{ give: 'muschel-frisch' }, herz(ID, 10), { xp: 15 }, { advanceTime: 30 }],
      lose: [{ advanceTime: 30 }, { message: 'Henk: „Der Fisch hat gewonnen. Das kommt vor. Meistens.“' }],
    }],
  },
  { text: 'Was ist mit den Hunden in der Brackbucht?', when: { quest: QUEST, state: 'inactive' }, next: 'hunde' },
  { text: 'Darf ich mal oben in den Leuchtturm?', tag: '[Henk ♥3]', requires: { hearts: ID, min: 3 }, once: true, id: 'he-turm', next: 'turm' },
  { text: 'Petri Heil.' },
];

const nodes: DialogueNode[] = [
  knoten('laden', [H('Haken, Schnur, Köder, Geduld. Geduld verkaufe ich nicht. Die musst du mitbringen. Oder hier lernen. Dauert zehn Jahre.')]),
  knoten('angeln', [H('Wurf weit raus. Nicht reißen, wenn’s zuckt. Warten. Dann reißen. Die meisten reißen zu früh. Im Angeln wie im Leben.')]),
  knoten('hunde', [
    H('Robohunde. Ein ganzes Rudel. Irgendwer hat sie in der Brackbucht ausgesetzt, und jetzt fressen sie meine Netze. Aus Draht. Die mögen Draht.'),
    H('Komm morgens zum Leuchtturm, wenn du helfen willst. Morgens schlafen sie. Halbwegs.'),
  ], { choices: Z }),
  knoten('turm', [
    H('Na klar. Die Tür ist offen. Oben steht ein Feldbett. Wenn du mal keinen Platz zum Schlafen hast, schlaf da. Die Lampe dreht sich, aber man gewöhnt sich dran.'),
    H('Nur nicht die Lampe anfassen. Die ist älter als ich und launischer.'),
  ], { choices: Z, effects: [flag('henk_turm_erlaubt')] }),
];

const M: Menue = { zeile: H('Noch was? Leise. Die Fische hören mit.'), choices, nodes };

const T = {
  rivale: dialog('henk-tag-rivale', [knoten('start', [H('Du verscheuchst die Fische.'), H('Und mich. Geh woanders deine Zeit verschwenden, du Landplage.')])]),
  erstes: gespraech('henk-tag-erstes', [
    erz('Am Fuß des Leuchtturms sitzt ein alter Mann mit Ölzeug und Fischerhut auf einem umgedrehten Eimer. Drei Angeln hängen über die Flutmauer. Keine bewegt sich. Er auch nicht.'),
    H('Henk. Leuchtturmwärter. Und Angler. Das Erste bezahlt die Stadt, das Zweite bezahlt meine Seele.'),
    H('Setz dich. Aber leise. Hinter der Mauer ist das Meer. Das Meer hört alles.'),
  ], M),
  nacht: gespraech('henk-tag-nacht', [
    erz('Ganz oben im Leuchtturm, im Kreis der Lampe, sitzt Henk und schaut aufs schwarze Wasser. Die Lampe streift ihn alle sieben Sekunden.'),
    H('Nachts sieht man die Schiffe. Es kommen keine mehr. Aber man sieht sie trotzdem. Die alten.'),
  ], M),
  standard: gespraech('henk-tag-standard', [H('Na. Nichts gebissen heute. Gestern auch nicht. Morgen bestimmt. Sag ich seit 2071.')], M),
};

/** ♥2: Henk zeigt, wie man das Meer liest. */
const he2 = dialog('he-henk-angler-2', [
  knoten('start', [
    erz('Henk drückt dir eine Angel in die Hand, ohne zu fragen. Seine Hand ist rau wie ein Tau.'),
    H('Schau aufs Wasser. Nicht drauf, rein. Wo es dunkler ist, ist es tiefer. Wo es kräuselt, ist was drunter. Sag mir, wo du werfen würdest.'),
  ], {
    choices: [
      { text: 'Lange aufs Wasser starren und die dunkle Stelle wählen.', tag: '[Straße 4]', check: pruefung('he-henk-2-lesen', 'strasse', 4, ['beobachten']), next: 'gelesen' },
      { text: 'Einfach dahin werfen, wo die Möwen kreisen.', next: 'moewen' },
    ],
  }),
  knoten('gelesen', [erz('Du wirfst. Die Schnur zuckt sofort. Ein silberner Fisch, so lang wie dein Unterarm. Henk nickt einmal. Das ist bei ihm Applaus.')], { next: 'ende', effects: [herz(ID, 45), { xp: 40 }] }),
  knoten('moewen', [
    erz('Du wirfst zu den Möwen. Eine Möwe schnappt den Köder in der Luft. Sie hängt jetzt an deiner Schnur und ist sehr unzufrieden.'),
    H('Na. Auch ein Fang. Lass sie los. Sie hat Familie.'),
  ], { next: 'ende', effects: [herz(ID, 35), { xp: 25 }] }),
  knoten('ende', [H('Komm wieder. Angeln ist wie Leuchtturm: Man muss einfach da sein. Der Rest passiert.')], { effects: [flag('henk_schueler')] }),
]);

/** ♥4: Henk erzählt vom letzten Schiff. */
const he4 = dialog('he-henk-angler-4', [
  knoten('start', [
    erz('Nacht, oben im Leuchtturm. Henk hat einen Flachmann dabei und zwei Becher. Die Lampe dreht sich.'),
    H('2071 kam das letzte große Schiff. Die „Morgenrot“. Ich hab es reingeleitet, mit der Lampe. Sie ist an der Flutmauer zerschellt. Die Lampe war kaputt. Für drei Minuten.'),
    H('Seitdem hab ich die Lampe jeden Tag repariert. Jeden. Es kommt kein Schiff mehr. Aber falls doch.'),
  ], {
    choices: [
      { text: '„Es war nicht deine Schuld.“', tag: '[Ausstrahlung 5]', check: pruefung('he-henk-4-schuld', 'ausstrahlung', 5, ['trost']), next: 'schuld' },
      { text: 'Schweigend mit ihm anstoßen.', next: 'anstossen' },
      { text: 'Die alte Lampe überprüfen.', tag: '[Technik 5]', check: pruefung('he-henk-4-lampe', 'technik', 5, ['maschine', 'reparieren']), next: 'lampe' },
    ],
  }),
  knoten('schuld', [H('Hab ich mir auch tausendmal gesagt. Klingt anders, wenn’s ein anderer sagt.'), erz('Er trinkt. Die Lampe dreht sich weiter. Henk lehnt sich zurück und schließt die Augen. Zum ersten Mal ohne aufs Wasser zu schauen.')], { next: 'ende', effects: [herz(ID, 60)] }),
  knoten('anstossen', [erz('Der Schnaps schmeckt nach Teer und Salz. Ihr sitzt bis die Lampe hundertmal gedreht hat. Henk zählt mit. Laut. Bei hundert lacht er.')], { next: 'ende', effects: [herz(ID, 50)] }),
  knoten('lampe', [erz('Du findest einen Wackelkontakt, den Henk in fünfzehn Jahren nicht gefunden hat, weil er die Lampe nie ausgeschaltet hat. Du lötest ihn fest.'), H('Fünfzehn Jahre. Du Teufelskerl. … Danke.', 'ueberrascht')], { next: 'ende', effects: [herz(ID, 60), flag('henk_lampe_repariert')] }),
  knoten('ende', [
    ich('Was machst du, wenn doch mal ein Schiff kommt?'),
    H('Dann leite ich es rein. Und dann geh ich angeln. Und dann schlaf ich. Zum ersten Mal seit 2071 eine ganze Nacht.'),
  ], { effects: [{ xp: 60 }] }),
]);

const henk = weltfigur({
  id: ID,
  name: 'Henk Angler',
  unknownName: 'Alter Mann mit Fischerhut',
  faction: 'unterstadt',
  bio: 'Leuchtturmwärter und Angler an der Flutmauer. Ölzeug, Fischerhut, Hände wie Taue. Repariert die Lampe jeden Tag, seit 2071 die „Morgenrot“ zerschellte. Verkauft Anglerbedarf.',
  gifts: geschenke({
    loves: ['koeder', 'muschel-glas', 'postkarte-meer'],
    likes: ['synth-kaffee', 'treibholz', 'sternkarte', 'oelkaennchen'],
    dislikes: ['volt-limo', 'parfuem-ozon'],
    hates: ['waschpulver', 'plastikpflanze'],
  }),
  schedule: [ort('M,T,A', 'flutmauer', 'leuchtturm'), ort('N', 'flutmauer', 'leuchtturm-oben')],
  heartEvents: [
    { id: 'he-henk-angler-2', hearts: 2, map: 'flutmauer', time: ['morgen', 'tag'], dialogue: 'he-henk-angler-2' },
    { id: 'he-henk-angler-4', hearts: 4, map: 'flutmauer', time: 'nacht', when: { seen: 'he-henk-angler-2' }, dialogue: 'he-henk-angler-4' },
  ],
  talk: [
    rede('henk-tag-rivale', { rival: ID }),
    rede('henk-tag-erstes', nichtGetroffen(ID)),
    rede('henk-tag-nacht', { time: 'nacht' }),
    rede('henk-tag-standard'),
  ],
});

export const part: ContentPart = {
  npcs: { [ID]: henk },
  dialogues: sammle(T.rivale, T.erstes, T.nacht, T.standard, he2, he4),
};
