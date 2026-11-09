// Paul – Oma Volts Neffe in der Neon-Gasse (world.md §4.5). In Akt 1 noch normal, nur verdächtig begeistert von
// Xions Werbestand; ab act2 Beta-Chip-Träger („so komisch höflich“, side-ki-fluestern von Oma Volt).
import type { ContentPart } from '../../part';
import type { DialogueChoice, DialogueNode } from '../../../modules/contracts';
import {
  type Menue, dialog, erz, flag, geschenke, gespraech, herz, ich, knoten, nichtGetroffen, ort, pruefung, rede, sammle,
  sprecher, weg, weltfigur, zurueck,
} from './_welt';

const ID = 'paul';
const P = sprecher(ID);
const O = sprecher('oma-volt');
const Z = zurueck('Noch was, Paul.', 'Mach’s gut.');

const choices: DialogueChoice[] = [
  { text: 'Was machst du hier den ganzen Tag?', once: true, id: 'p-tag', next: 'tag' },
  { text: 'Wie ist es, Oma Volts Neffe zu sein?', next: 'oma' },
  { text: 'Der Werbestand da drüben. „Freiwillige gesucht“. Gehst du hin?', next: 'werbestand' },
  { text: 'Mach’s gut.' },
];

const nodes: DialogueNode[] = [
  knoten('tag', [
    P('Ich schreib Bewerbungen. Auf dem Telefon. Mit dem Daumen. Ich hab schon zweiundvierzig geschrieben.'),
    P('Antworten: drei. Zwei davon waren Werbung. Eine war von meiner Tante, die wissen wollte, ob ich gegessen hab.'),
  ], { choices: Z }),
  knoten('oma', [
    P('Sie näht mir Namensschilder in die Jacken. Ich bin dreiundzwanzig.'),
    P('Und sie nennt mich „Kindchen“. Vor Leuten. Vor Kunden. Vor Bruno! Bruno hat gelacht. Bruno lacht nie.'),
    P('Aber sie hat mich aufgenommen, als keiner sonst wollte. Also trag ich die Schilder.'),
  ], { choices: Z, effects: [herz(ID, 10)] }),
  knoten('werbestand', [
    P('Vielleicht! Die zahlen fünfzig Credits für einen Test. Nur ein kleiner Chip-Test. Und es gibt Snacks.', 'freude'),
    P('Der Typ mit der Kralle sagt, ich hätte „Potenzial für Optimierung“. Das hat noch nie einer zu mir gesagt.'),
  ], {
    choices: [
      { text: '„Paul. Lass die Finger von Gratis-Chips.“', tag: '[Ausstrahlung 5]', check: pruefung('paul-warnen', 'ausstrahlung', 5), once: true, id: 'p-warnen', next: 'gewarnt' },
      { text: '„Mach, was du willst. Ist dein Kopf.“', next: 'menue' },
    ],
  }),
  knoten('gewarnt', [
    P('Meinst du? Echt? … Jimmy hat auch so einen Chip genommen, sagt Tante Volt. Und jetzt baut er nachts am Hafen Türme aus Ölfässern und begrüßt sie als Kunden.', 'besorgt'),
    P('Okay. Ich warte. Erst mal. Vielleicht kriegt man woanders auch Snacks.'),
  ], { choices: Z, effects: [herz(ID, 30), flag('paul_gewarnt')] }),
];

const M: Menue = { zeile: P('Ja? Ich hab Zeit. Ich hab sehr viel Zeit.'), choices, nodes };

const T = {
  rivale: dialog('paul-tag-rivale', [knoten('start', [P('Tante Volt sagt, ich soll nicht mit dir reden.'), P('Ich sag’s ihr auch nicht, dass ich’s doch getan hab. Tschüss.')])]),
  erstes: gespraech('paul-tag-erstes', [
    erz('Ein junger Mann mit zu großer Jacke und einem eingenähten Namensschild: „PAUL – bei Verlust bitte bei Oma Volt abgeben“.'),
    P('Hi! Ich bin Paul. Steht da. Ich bin Oma Volts Neffe. Großneffe. Irgendwas mit Neffe.'),
    P('Bist du neu? Ich bin auch neu. Seit vier Jahren.'),
  ], M),
  vertraut: gespraech('paul-tag-vertraut', [P('Hey! Ich hab die dreiundvierzigste Bewerbung geschrieben. An dich. Spaß. Oder?')], M),
  standard: gespraech('paul-tag-standard', [P('Hi. Ich steh hier. Wie immer. Willst du mitstehen?')], M),
};

/** ♥2: Bewerbungsgespräch üben. */
const he2 = dialog('he-paul-2', [
  knoten('start', [
    erz('Paul steht vor dem Stadt-TV und murmelt Sätze. Er hat Karteikarten. Auf einer steht „STÄRKEN: pünktlich (meistens)“.'),
    P('Ich hab morgen ein Vorstellungsgespräch! Beim Imbiss „Lötkolben“! Kannst du mit mir üben? Du bist der Chef. Sei fies.'),
  ], {
    choices: [
      { text: 'Den fiesen Chef spielen: „Warum sollte ich ausgerechnet SIE nehmen?“', tag: '[Ausstrahlung 4]', check: pruefung('he-paul-2-chef', 'ausstrahlung', 4), next: 'chef' },
      { text: '„Sag einfach, du kannst Nudeln warm machen, ohne den Laden abzufackeln.“', next: 'nudeln' },
    ],
  }),
  knoten('chef', [
    P('Weil … weil ich … weil ich meine Tante nie im Stich gelassen hab. Und weil ich Nudeln umrühren kann, ohne zu weinen. Meistens.', 'ueberrascht'),
    ich('Eingestellt.'),
    P('ECHT? Oh. Du bist ja nicht der echte Chef. Aber das war gut. Das war richtig gut!'),
  ], { next: 'ende', effects: [herz(ID, 40), { xp: 40 }] }),
  knoten('nudeln', [P('Ohne abfackeln. Okay. Das schreib ich auf die Karte. „Kann Nudeln. Ohne Feuer.“ Klingt professionell.')], { next: 'ende', effects: [herz(ID, 25), { xp: 25 }] }),
  knoten('ende', [P('Danke! Wenn ich den Job krieg, kriegst du Nudeln. Umsonst. Bis ich gefeuert werde.')], { effects: [flag('paul_bewerbung')] }),
]);

/** ♥4: Paul hat den Job – und Oma Volt ist stolz. */
const he4 = dialog('he-paul-4', [
  knoten('start', [
    erz('Paul rennt dir entgegen, eine Papiermütze vom Imbiss „Lötkolben“ auf dem Kopf. Hinter ihm am Kiosk tupft sich Oma Volt die Augen mit einem Spültuch.'),
    P('Ich hab ihn! Den Job! Probezeit! Drei Schichten die Woche! Ich darf die Fritteuse ANSCHAUEN!'),
    O('Kindchen, er hat’s geschafft. Er hat’s wirklich geschafft. Ich hab ihm Namensschilder in die Mütze genäht.'),
  ], {
    choices: [
      { text: '„Ich hab’s gewusst. Feiern wir?“', next: 'feiern' },
      { text: '„Und der Werbestand? Vergiss den jetzt, ja?“', tag: '[Straße 4]', check: pruefung('he-paul-4-werbung', 'strasse', 4), next: 'werbung' },
    ],
  }),
  knoten('feiern', [
    erz('Oma Volt spendiert zwei Volt-Limos. Paul verschluckt sich vor Freude. Ihr klopft ihm gleichzeitig auf den Rücken.'),
  ], { next: 'ende', effects: [herz(ID, 40), { give: 'volt-limo' }] }),
  knoten('werbung', [
    P('Den Chip-Test? Ja. Der Typ mit der Kralle war eh komisch. Hat mich „Rohmaterial“ genannt. Ich bin doch kein Rohmaterial. Ich bin Imbiss-Personal!'),
  ], { next: 'ende', effects: [herz(ID, 50), flag('paul_gewarnt'), { xp: 30 }] }),
  knoten('ende', [P('Du bist mein erster Freund in der Gasse, der nicht mit mir verwandt ist. Das schreib ich mir auch auf eine Karte.')], { effects: [{ xp: 50 }, herz('oma-volt', 30)] }),
]);

const paul = weltfigur({
  id: ID,
  name: 'Paul',
  unknownName: 'Junger Mann mit Namensschild',
  faction: 'unterstadt',
  bio: 'Oma Volts (Groß-)Neffe, 23, zu große Jacke mit eingenähtem Namensschild. Schreibt Bewerbungen mit dem Daumen. Findet Xions Werbestand gefährlich interessant.',
  gifts: geschenke({
    loves: ['comic-heft', 'bao-dampfnudel', 'aufzieh-roboter'],
    likes: ['volt-limo', 'chips-tuete', 'stickerbogen', 'synth-nudeln'],
    dislikes: ['gesetzbuch', 'tai-chi-tee'],
    hates: ['handschellen'],
  }),
  schedule: [ort('T', 'neon-gasse', 'paul-ecke'), weg()],
  heartEvents: [
    { id: 'he-paul-2', hearts: 2, map: 'neon-gasse', time: 'tag', dialogue: 'he-paul-2' },
    { id: 'he-paul-4', hearts: 4, map: 'neon-gasse', time: 'tag', when: { seen: 'he-paul-2' }, dialogue: 'he-paul-4' },
  ],
  talk: [
    rede('paul-tag-rivale', { rival: ID }),
    rede('paul-tag-erstes', nichtGetroffen(ID)),
    rede('paul-tag-vertraut', undefined, 3),
    rede('paul-tag-standard'),
  ],
});

export const part: ContentPart = {
  npcs: { [ID]: paul },
  dialogues: sammle(T.rivale, T.erstes, T.vertraut, T.standard, he2, he4),
};
