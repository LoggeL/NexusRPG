// Salzige Grete – Fischstand an der Hafenkante (world.md §4.5, Shop salzige-grete).
// Empfängerin der Schrapnell-Pakete Di/Fr (Flag vex_paket_grete, siehe vex-schrapnell.ts).
import type { ContentPart } from '../../part';
import type { DialogueChoice, DialogueNode } from '../../../modules/contracts';
import {
  type Menue, dialog, erz, flag, geschenke, gespraech, herz, ich, knoten, nichtGetroffen, ort, pruefung, rede, sammle,
  sprecher, weg, weltfigur, zurueck,
} from './_welt';
import { akt23 } from './salzige-grete-akt23';

const ID = 'salzige-grete';
const G = sprecher(ID);
const Z = zurueck('Noch was, Grete.', 'Tschüss, Grete.');

const choices: DialogueChoice[] = [
  {
    text: 'Paket von den Schrapnell-Kurieren. Es tropft.', tag: '[Kurier]', when: { flag: 'vex_paket_grete' }, next: 'paket',
    effects: [flag('vex_paket_grete', false), { credits: 25 }, herz('vex-schrapnell', 15), herz(ID, 10), { xp: 15 }],
  },
  { text: 'Was gibt’s heute?', next: 'laden', effects: [{ shop: 'salzige-grete' }] },
  { text: 'Woher kommt der Fisch eigentlich?', once: true, id: 'g-fisch', next: 'fisch' },
  { text: 'Warum „Salzige“ Grete?', once: true, id: 'g-name', next: 'name' },
  { text: 'Tschüss, Grete.' },
];

const nodes: DialogueNode[] = [
  knoten('paket', [
    erz('Grete reißt das Paket mit einem Fischmesser auf. Drinnen: Eis, Salz und ein einzelner, sehr großer, sehr toter Aal.'),
    G('Da ist er ja! Bertram! Der Aal aus der Brackbucht! Sechs Kilo Liebe! Den räucher ich für Käpt’n Nebelhorn, der hat Geburtstag.'),
    G('Hier, fünfundzwanzig. Und sag der Kurierin, sie soll sich mal was zu essen bei mir holen. Die Kleine ist dünner als meine Gräten.'),
  ], { choices: Z }),
  knoten('laden', [G('Frisch von heute! Oder von gestern. Oder von irgendwann, aber gut gesalzen. Salz macht alles wieder frisch. Außer Ehen.')]),
  knoten('fisch', [
    G('Aus dem Hafenbecken, aus der Brackbucht, aus dem Kanal. Der aus dem Kanal leuchtet nachts ein bisschen. Den verkauf ich als „Neonfilet“. Läuft super.'),
    G('Echte Meeresfische gibt’s nur von Käpt’n Nebelhorn. Der fährt raus. Ganz raus. Ans Meer. Er sagt, es gibt das Meer noch. Ich glaub ihm. Meistens.'),
  ], { choices: Z }),
  knoten('name', [
    G('Weil ich alles einsalze. Fisch, Brot, Kaffee, meinen Exmann. Den hab ich in eine Tonne Salz gesteckt.'),
    G('Nur symbolisch! Seine Klamotten. Er ist nackt nach Hause gelaufen. Durch den Hafen. Im Winter. Das ganze Kai hat applaudiert.'),
  ], { choices: Z }),
];

const M: Menue = { zeile: G('Noch was, Schätzchen? Die Möwen gucken schon.'), choices, nodes };

const T = {
  rivale: dialog('grete-tag-rivale', [knoten('start', [G('Für dich hab ich nur Gräten.'), G('Und die werf ich dir hinterher, du Sardine.')])]),
  erstes: gespraech('grete-tag-erstes', [
    erz('Ein Fischstand aus Treibholz und Wellblech, Eis in alten Badewannen, Fische, die dich vorwurfsvoll anstarren. Dahinter eine Frau mit Gummischürze, Unterarmen wie Schiffstaue und einer Stimme wie ein Nebelhorn.'),
    G('FISCH! FRISCHER FISCH! … Na, du siehst hungrig aus. Grete. Die Salzige. Kauf was, oder ich sing.'),
  ], M),
  paket: gespraech('grete-tag-paket', [G('Riech ich da was? Riecht nach Aal. Riecht nach BERTRAM. Gib her!')], M),
  vertraut: gespraech('grete-tag-vertraut', [G('Da ist ja mein Lieblingskunde! Für dich hab ich den schönsten Hering zurückgelegt. Er heißt Harald. Er ist tot, aber charmant.')], M),
  standard: gespraech('grete-tag-standard', [G('FISCH! Na, du? Heute im Angebot: Fisch. Morgen im Angebot: auch Fisch. Überraschung.')], M),
};

/** ♥2: Eine Möwe klaut Gretes Kasse. */
const he2 = dialog('he-salzige-grete-2', [
  knoten('start', [
    erz('Ein Kreischen. Eine fette Möwe flattert mit Gretes Geldbeutel im Schnabel über das Hafenbecken. Grete wirft einen Hering hinterher. Verfehlt.'),
    G('DIE HAT MEINE TAGESEINNAHMEN! Das ist die Möwe vom Kai! Die klaut jedem das Frühstück, und jetzt hat sie mein Geld!'),
  ], {
    choices: [
      { text: 'Mit einem Fisch nach der Möwe werfen.', tag: '[Reflexe 4]', check: pruefung('he-grete-2-wurf', 'reflexe', 4, ['fernkampf']), next: 'getroffen' },
      { text: 'Die Möwe mit einem Köder anlocken.', requires: { item: 'koeder' }, effects: [{ take: 'koeder' }], next: 'koeder' },
      { text: 'Der Möwe bis zu ihrem Nest auf dem Kran folgen.', next: 'nest' },
    ],
  }),
  knoten('getroffen', [erz('Der Hering fliegt, dreht sich, trifft. Die Möwe lässt den Beutel fallen, du fängst ihn im Hechtsprung. Die Hafenarbeiter johlen.')], { next: 'ende', effects: [herz(ID, 45), { xp: 40 }] }),
  knoten('koeder', [erz('Die Möwe sieht den Köder, sieht den Beutel, sieht wieder den Köder. Gier gewinnt. Sie tauscht. Möwen sind bessere Händler als Gutschein-Gerd.')], { next: 'ende', effects: [herz(ID, 45), { xp: 35 }] }),
  knoten('nest', [
    erz('Das Nest auf dem Kran ist ein Schatz: Gretes Beutel, drei Schlüsselbunde, eine Taschenuhr, ein Gebiss und ein Ehering. Du bringst alles zu Gerda ins Fundbüro. Nur Gretes Beutel nicht.'),
  ], { next: 'ende', effects: [herz(ID, 40), herz('gerda-gleis', 10), { xp: 40 }] }),
  knoten('ende', [G('Du bist ein Engel! Ein salziger Engel! Komm her, ich drück dich!'), erz('Sie drückt dich. Du riechst danach drei Tage nach Fisch.')], { effects: [flag('grete_moewe')] }),
]);

/** ♥4: Grete singt – wirklich. */
const he4 = dialog('he-salzige-grete-4', [
  knoten('start', [
    erz('Feierabend am Fischstand. Grete schrubbt die Badewannen. Dabei summt sie. Dann singt sie. Ein altes Hafenlied, tief und rau und so schön, dass die Möwen still werden.'),
    G('… Oh. Du hast zugehört. Das macht keiner. Die Leute denken, ich kann nur schreien.'),
    G('Ich hab früher im Hafenchor gesungen. Mit meinem Vater. Er war Fischer. Er ist rausgefahren und nicht wiedergekommen. Seitdem schrei ich nur noch.'),
  ], {
    choices: [
      { text: '„Sing weiter. Bitte.“', next: 'weiter' },
      { text: '„Sing im High Voltage. Die Leute würden durchdrehen.“', tag: '[Ausstrahlung 5]', check: pruefung('he-grete-4-buehne', 'ausstrahlung', 5, ['buehne']), next: 'buehne' },
      { text: 'Mitsingen. Schief, aber mit Herz.', next: 'mit' },
    ],
  }),
  knoten('weiter', [erz('Sie singt das ganze Lied. Am Ende steht Hafen-Hannes am Rand und hat die Mütze abgenommen. Er sagt, das ist der Wind. Es ist nicht der Wind.')], { next: 'ende', effects: [herz(ID, 55)] }),
  knoten('buehne', [G('Im HV? Vor diesen Neonpüppchen? … Sag dem Barkeeper, Freitag. Wenn ich auf der Bühne Angst krieg, schrei ich einfach. Das kann ich.', 'freude')], { next: 'ende', effects: [herz(ID, 60), flag('grete_buehne')] }),
  knoten('mit', [erz('Ihr singt zusammen. Du triffst keinen Ton. Grete lacht so sehr, dass sie in eine Badewanne mit Eis fällt. Sie singt weiter, im Eis.')], { next: 'ende', effects: [herz(ID, 50)] }),
  knoten('ende', [
    ich('Dein Vater hätte das gern gehört.'),
    G('Er hört’s. Das Meer trägt alles. Sagt Nebelhorn. Und Nebelhorn lügt nur über Fische.'),
  ], { effects: [{ xp: 60 }] }),
]);

// Akt 2, Partynacht und Nachspiel: salzige-grete-akt23.ts.
const A23 = akt23(M);

const grete = weltfigur({
  id: ID,
  name: 'Salzige Grete',
  unknownName: 'Fischfrau mit Gummischürze',
  faction: 'unterstadt',
  bio: 'Betreibt den Fischstand an der Hafenkante. Gummischürze, Arme wie Schiffstaue, Stimme wie ein Nebelhorn. Salzt alles ein. Singt heimlich wunderschön.',
  gifts: geschenke({
    loves: ['muschel-glas', 'postkarte-meer', 'algen-chips'],
    likes: ['synth-kaffee', 'treibholz', 'muschel-frisch', 'zeitung-papier'],
    dislikes: ['parfuem-ozon', 'sonnencreme'],
    hates: ['waschpulver', 'kanalschlamm'],
  }),
  schedule: [ort('M,T', 'hafenkante', 'fischstand'), weg('A,N')],
  heartEvents: [
    { id: 'he-salzige-grete-2', hearts: 2, map: 'hafenkante', time: ['morgen', 'tag'], dialogue: 'he-salzige-grete-2' },
    { id: 'he-salzige-grete-4', hearts: 4, map: 'hafenkante', time: 'tag', when: { seen: 'he-salzige-grete-2' }, dialogue: 'he-salzige-grete-4' },
  ],
  talk: [
    rede('grete-tag-rivale', { rival: ID }),
    rede('grete-tag-erstes', nichtGetroffen(ID)),
    ...A23.talk,
    rede('grete-tag-paket', { flag: 'vex_paket_grete' }),
    rede('grete-tag-vertraut', undefined, 4),
    rede('grete-tag-standard'),
  ],
});

export const part: ContentPart = {
  npcs: { [ID]: grete },
  dialogues: sammle(T.rivale, T.erstes, T.paket, T.vertraut, T.standard, he2, he4, ...A23.dialogues),
};
