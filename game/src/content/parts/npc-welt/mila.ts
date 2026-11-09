// Mila (8) – Tochter von Wachmann Pfeffer, Freundin der Unterstadt-Kinder (world.md §4.5). Nur Freundschaft, Kind
// (`child: true`, in NEVER_ROMANCE). Tags an ihrer Ecke am Schrottmarkt. Kein rauer Ton ihr gegenüber.
import type { ContentPart } from '../../part';
import type { DialogueChoice, DialogueNode } from '../../../modules/contracts';
import {
  type Menue, dialog, erz, flag, geschenke, gespraech, herz, ich, knoten, nichtGetroffen, ort, pruefung, rede, sammle,
  sprecher, weg, weltfigur, zurueck,
} from './_welt';

const ID = 'mila';
const MI = sprecher(ID);
const Z = zurueck('Erzähl noch was, Mila.', 'Tschüss, Mila.');

const choices: DialogueChoice[] = [
  { text: 'Was malst du da?', next: 'malen' },
  { text: 'Wo ist dein Papa?', next: 'papa' },
  { text: 'Mit wem spielst du so?', once: true, id: 'mi-freunde', next: 'freunde' },
  { text: '„Willst du einen Trick sehen?“', tag: '[Mila ♥2]', requires: { hearts: ID, min: 2 }, next: 'trick' },
  { text: 'Tschüss, Mila.' },
];

const nodes: DialogueNode[] = [
  knoten('malen', [
    erz('Auf dem Pflaster: ein Kreidebild. Ein Mann mit Uniform und riesigem Schnurrbart hält ein Kind auf den Schultern. Über ihnen: eine Sonne mit Sonnenbrille.'),
    MI('Das ist Papa. Und ich. Und die Sonne. Die Sonne ist cool. Darum hat sie eine Brille.'),
  ], { choices: Z }),
  knoten('papa', [
    MI('Papa arbeitet. Bei Quantum. Er passt auf, dass keiner was klaut. Er sagt, das ist ein wichtiger Job.'),
    MI('Am Wochenende geht er abends in den Club. Er sagt, er tanzt. Ich glaub, er schläft auf einem Stuhl. Er kommt immer mit Glitzer im Bart zurück.'),
  ], { choices: Z }),
  knoten('freunde', [
    MI('Mit Jakko, der kann Kekse aus Nichts machen. Und mit Pim, die baut kleine Käfer aus Schrauben. Und mit Bolzen. Bolzen ist ein Hund. Aber aus Blech. Er zählt.'),
    MI('Freya ist die Größte. Sie sagt immer, wer mitspielen darf. Ich darf immer. Weil ich die Kreide hab.'),
  ], { choices: Z, effects: [herz(ID, 10)] }),
  knoten('trick', [
    erz('Du lässt eine Münze hinter Milas Ohr verschwinden und hinter deinem wieder auftauchen.'),
    MI('NOCHMAL! Nochmal nochmal nochmal!'),
  ], { choices: Z, effects: [herz(ID, 10)] }),
];

const M: Menue = { zeile: MI('Und jetzt?'), choices, nodes };

const T = {
  rivale: dialog('mila-tag-rivale', [knoten('start', [MI('Papa sagt, ich soll nicht mit dir reden.'), erz('Mila dreht sich weg und malt weiter. Mit sehr viel Nachdruck.')])]),
  erstes: gespraech('mila-tag-erstes', [
    erz('An einer Ecke des Schrottmarkts kniet ein Mädchen mit zwei schiefen Zöpfen und Kreide an allen zehn Fingern. Es schaut dich prüfend an.'),
    MI('Du stehst auf meiner Wolke. Die ist frisch.'),
    MI('… Ich bin Mila. Ich bin acht. Fast neun. Neun ist im Winter.'),
  ], M),
  standard: gespraech('mila-tag-standard', [MI('Hallo! Willst du was sehen? Ich hab einen Drachen gemalt. Der ist eigentlich eine Taube. Aber er ist ein Drache.')], M),
  vertraut: gespraech('mila-tag-vertraut', [MI('Du bist da! Ich hab dich gemalt. Da. Mit Flügeln. Weil du immer so schnell weg bist.')], M),
};

/** ♥2: Mila will ein Bild für den Geburtstag ihres Papas. */
const he2 = dialog('he-mila-2', [
  knoten('start', [
    erz('Mila sitzt vor ihrer Ecke und weint leise. Die Kreide ist alle. Nur noch ein grauer Stummel.'),
    MI('Papa hat morgen Geburtstag. Ich wollte ihm einen Regenbogen malen. Aber grau ist kein Regenbogen. Grau ist nur Wetter.'),
  ], {
    choices: [
      { text: 'Neonkreide schenken.', requires: { item: 'neonkreide' }, effects: [{ take: 'neonkreide' }], next: 'kreide' },
      { text: 'Bei den Händlern Farbreste zusammenschnorren.', tag: '[Straße 3]', check: pruefung('he-mila-2-farbe', 'strasse', 3), next: 'farbe' },
      { text: '„Dann malen wir einen grauen Regenbogen. Für Rostwetter.“', next: 'grau' },
    ],
  }),
  knoten('kreide', [erz('Mila malt einen Regenbogen, der im Dunkeln leuchtet. Sie malt so schnell, dass die Zöpfe fliegen.')], { next: 'ende', effects: [herz(ID, 50), { xp: 30 }] }),
  knoten('farbe', [erz('Ein Lackrest von Dexter, ein Lippenstift von Babette, Kohle aus Mutter Brühes Ofen. Mila malt einen Regenbogen, der nach Suppe riecht.')], { next: 'ende', effects: [herz(ID, 45), { xp: 30 }] }),
  knoten('grau', [
    erz('Ihr malt zusammen einen Regenbogen in sieben Grautönen. Mila gibt jedem Grau einen Namen. „Taubengrau. Papabartgrau. Montagsgrau.“'),
    MI('Das ist der beste graue Regenbogen der Welt. Es gibt nur einen. Darum.'),
  ], { next: 'ende', effects: [herz(ID, 45), { xp: 25 }] }),
  knoten('ende', [MI('Papa wird weinen. Er weint immer. Aber nur, wenn er sich freut. Sonst nie. Er ist ja Wachmann.')], { effects: [flag('mila_regenbogen'), herz('pfeffer', 15)] }),
]);

/** ♥4: Mila macht sich Sorgen um ihren Papa. */
const he4 = dialog('he-mila-4', [
  knoten('start', [
    erz('Mila malt heute nicht. Sie sitzt auf einem Reifen und hält einen Zettel mit dem Quantum-Logo, ganz zerknittert.'),
    MI('Papa muss jetzt Nachtschicht machen. Am Campus. Er sagt, das ist eine Beförderung. Aber er hat dabei so geguckt wie damals, als Oma krank war.'),
    MI('Glaubst du, Papa passiert was?'),
  ], {
    choices: [
      { text: '„Dein Papa ist stark. Und er hat dich. Das macht ihn noch stärker.“', tag: '[Ausstrahlung 4]', check: pruefung('he-mila-4-trost', 'ausstrahlung', 4, ['trost']), next: 'trost' },
      { text: '„Ich halt ein Auge auf ihn. Versprochen.“', next: 'versprechen' },
      { text: '„Mal ihm was für die Nachtschicht. Damit er dich dabeihat.“', next: 'bild' },
    ],
  }),
  knoten('trost', [MI('Stärker? Wie ein Roboter? … Wie ein Roboter mit Schnurrbart.'), erz('Sie kichert. Dann umarmt sie dich ganz kurz, so fest sie kann.')], { next: 'ende', effects: [herz(ID, 60)] }),
  knoten('versprechen', [MI('Versprochen-versprochen? Mit kleinem Finger?'), erz('Ihr hakt die kleinen Finger ein. Mila nickt ernst, als hättet ihr gerade einen Vertrag unterschrieben.')], { next: 'ende', effects: [herz(ID, 55), flag('mila_versprechen')] }),
  knoten('bild', [erz('Mila malt auf die Rückseite des Quantum-Zettels: Papa mit Taschenlampe, daneben eine kleine Mila mit noch größerer Taschenlampe. „Damit er nie im Dunkeln ist.“')], { next: 'ende', effects: [herz(ID, 55), herz('pfeffer', 15)] }),
  knoten('ende', [
    ich('Du bist eine gute Tochter, Mila.'),
    MI('Ich weiß. Papa sagt das auch. Aber er sagt auch, dass ich Gemüse mag. Und das stimmt nicht.'),
  ], { effects: [{ xp: 50 }] }),
]);

const mila = weltfigur({
  id: ID,
  name: 'Mila',
  unknownName: 'Mädchen mit Kreide',
  faction: 'unterstadt',
  child: true,
  bio: 'Acht Jahre alt, fast neun. Tochter von Wachmann Pfeffer. Malt mit Kreide an ihrer Ecke am Schrottmarkt, spielt mit Jakko, Pim, Freya und Bolzen.',
  gifts: geschenke({
    loves: ['neonkreide', 'plueschmoehre', 'stickerbogen'],
    likes: ['nougatbombe', 'comic-heft', 'murmelbeutel', 'aufzieh-roboter'],
    dislikes: ['frisches-gemuese', 'zeitung-papier'],
    hates: ['kanalschlamm', 'handschellen'],
  }),
  schedule: [ort('T', 'schrottmarkt', 'mila-ecke'), weg('M,A,N')],
  heartEvents: [
    { id: 'he-mila-2', hearts: 2, map: 'schrottmarkt', time: 'tag', dialogue: 'he-mila-2' },
    { id: 'he-mila-4', hearts: 4, map: 'schrottmarkt', time: 'tag', when: { seen: 'he-mila-2' }, dialogue: 'he-mila-4' },
  ],
  talk: [
    rede('mila-tag-rivale', { rival: ID }),
    rede('mila-tag-erstes', nichtGetroffen(ID)),
    rede('mila-tag-vertraut', undefined, 4),
    rede('mila-tag-standard'),
  ],
});

export const part: ContentPart = {
  npcs: { [ID]: mila },
  dialogues: sammle(T.rivale, T.erstes, T.standard, T.vertraut, he2, he4),
};
