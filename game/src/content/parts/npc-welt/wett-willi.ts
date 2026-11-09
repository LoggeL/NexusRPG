// Wett-Willi – Hütchenspieler am Schrottmarkt (world.md §4.5, §3.9 akt-huetchenspiel, Welt-Check gc-151 [Reflexe 6]).
// Tageslimit „50 Cr pro Tag“ kennt die Engine nicht (gaps/npc-welt.md): Der Check zahlt einmal, das Minispiel kostet Einsatz.
import type { ContentPart } from '../../part';
import type { DialogueChoice, DialogueNode } from '../../../modules/contracts';
import {
  type Menue, dialog, erz, flag, geschenke, gespraech, herz, ich, knoten, nichtGetroffen, ort, pruefung, rede, sammle,
  sprecher, weg, weltfigur, zurueck,
} from './_welt';

const ID = 'wett-willi';
const W = sprecher(ID);
const Z = zurueck('Noch was, Willi.', 'Ich spiel lieber Lotto.');

const choices: DialogueChoice[] = [
  {
    text: 'Eine Runde Hütchen. Einsatz 20 Cr.', tag: '[Hütchenspiel]', requires: { credits: 20 }, next: 'runde',
    effects: [{ credits: -20 }, {
      minigame: 'akt-huetchenspiel', level: 1, key: 'huetchenspiel', label: 'Wett-Willis Hütchen',
      win: [{ credits: 50 }, herz(ID, 5), { message: 'Willi: „Anfängerglück. Das gibt’s. Hab ich gehört.“' }],
      lose: [{ message: 'Willi: „Knapp daneben ist auch vorbei. Nochmal?“' }],
    }],
  },
  { text: 'Dem Trick zuschauen, ohne zu spielen.', check: 'gc-151', once: true, id: 'w-trick', next: 'trick', effects: [{ credits: 50 }, flag('willi_trick_durchschaut')] },
  { text: 'Wie lange machst du das schon?', once: true, id: 'w-lange', next: 'lange' },
  { text: '„Erzähl mir was über die Leute hier. Du siehst doch alles.“', tag: '[Willi ♥3]', requires: { hearts: ID, min: 3 }, next: 'tratsch' },
  { text: 'Ich spiel lieber Lotto.' },
];

const nodes: DialogueNode[] = [
  knoten('runde', [W('Rechts, links, Mitte, Mitte, links. Wo ist die Kugel? Wo ist sie? Sie ist in deinem Herzen. Und unter einem der Becher. Vielleicht.')]),
  knoten('trick', [
    erz('Du schaust zu. Lange. Beim dritten Durchgang siehst du es: Die Kugel ist nie unter einem Becher. Sie steckt zwischen Willis Fingern.'),
    ich('Die Kugel steckt in deiner Hand.'),
    W('PSSST. Hier, fünfzig. Schweigegeld. Du bist mir sympathisch, und das ärgert mich.', 'verlegen'),
  ], { choices: Z, effects: [herz(ID, 15)] }),
  knoten('lange', [
    W('Seit ich sieben bin. Mein Opa hat mir das beigebracht. Der hat mit Kronkorken gespielt, unter Joghurtbechern. Ich hab aufgerüstet. Edelstahl.'),
    W('Ich hab mal gegen Ripper gewonnen. Er hat mir dafür einen Zahn gezogen. Gratis. War nicht nötig. Er wollte es halt.'),
  ], { choices: Z }),
  knoten('tratsch', [
    W('Gutschein-Gerd druckt die Gutscheine hinten im Hof selber. Vinyl-Vincent hat eine Platte, die er keinem zeigt. Und Meister Watt hat sich letzte Woche bewegt. Einen Zentimeter. Der ganze Markt hat applaudiert.'),
  ], { choices: Z }),
];

const M: Menue = { zeile: W('Noch eine? Nur eine. Nur noch eine. So fängt’s an.'), choices, nodes };

const T = {
  rivale: dialog('willi-tag-rivale', [knoten('start', [W('Für dich hab ich keine Becher. Nur noch Löcher.'), W('Verzieh dich, du Pechvogel.')])]),
  erstes: gespraech('willi-tag-erstes', [
    erz('Ein Klapptisch, drei Edelstahlbecher, ein Mann mit Hosenträgern und einem Lächeln, das schon viele Leute Geld gekostet hat.'),
    W('Treten Sie näher! Wett-Willi, der ehrlichste Betrüger der Unterstadt! Drei Becher, eine Kugel, null Garantie!'),
  ], M),
  standard: gespraech('willi-tag-standard', [W('Na, Glückspilz? Oder Pechpilz? Gibt nur zwei Sorten Pilze. Ich bin der Pilzsammler.')], M),
  vertraut: gespraech('willi-tag-vertraut', [W('Ah, mein Lieblingsverlierer! Kleiner Scherz. Du verlierst gar nicht so oft. Leider.')], M),
};

/** ♥2: Ein Großmaul aus der Oberstadt will Willi auffliegen lassen. */
const he2 = dialog('he-wett-willi-2', [
  knoten('start', [
    erz('Ein junger Mann im Seidenhemd hat Willis Tisch umgestellt und brüllt: „BETRUG! Ich hab’s gesehen! Ich ruf die Wache!“ Willi schwitzt in seine Hosenträger.'),
    W('Hilf mir. Bitte. Wenn Kessel kommt, nimmt sie mir die Becher weg. Die Becher sind von Opa.'),
  ], {
    choices: [
      { text: 'Dem Oberstädter zeigen, dass er einfach schlecht geraten hat.', tag: '[Reflexe 4]', check: pruefung('he-willi-2-vorfuehren', 'reflexe', 4, ['beobachten']), next: 'vorgefuehrt' },
      { text: '„Hier wird nicht betrogen. Hier wird unterhalten. Das ist ein Unterschied.“', tag: '[Ausstrahlung 4]', check: pruefung('he-willi-2-reden', 'ausstrahlung', 4, ['bluff']), next: 'geredet' },
      { text: 'Dem Kerl seine 20 Credits zurückgeben.', requires: { credits: 20 }, effects: [{ credits: -20 }], next: 'bezahlt' },
      { text: 'Die Becher in die Tasche stecken, bevor Kessel kommt.', next: 'versteckt' },
    ],
  }),
  knoten('vorgefuehrt', [erz('Du spielst eine Runde vor Publikum und findest die Kugel. Ehrlich. Der Oberstädter läuft rot an und verzieht sich. Willi hat die Kugel diesmal wirklich unter den Becher gelegt. Für dich.')], { next: 'ende', effects: [herz(ID, 45), { xp: 40 }] }),
  knoten('geredet', [erz('Die Umstehenden nicken. Einer klatscht. Der Oberstädter merkt, dass er im falschen Bezirk zu laut ist, und geht.')], { next: 'ende', effects: [herz(ID, 45), { xp: 40 }] }),
  knoten('bezahlt', [W('Du hast ihm das Geld gegeben? MEIN Geld? … Dein Geld. Na gut. Danke.', 'verlegen')], { next: 'ende', effects: [herz(ID, 35), { xp: 25 }] }),
  knoten('versteckt', [erz('Kessel kommt, findet einen leeren Klapptisch und einen Mann, der behauptet, er verkaufe Klapptische. Sie verkauft ihm fast einen.')], { next: 'ende', effects: [herz(ID, 40), { xp: 30 }] }),
  knoten('ende', [W('Du hast was gut bei Willi. Willi vergisst nie. Außer Geldbeträge. Die vergisst er dauernd.')], { effects: [flag('willi_freund')] }),
]);

/** ♥4: Willi zeigt seinen Opa-Trick – den ehrlichen. */
const he4 = dialog('he-wett-willi-4', [
  knoten('start', [
    erz('Nach Marktschluss. Willi hat drei Joghurtbecher aufgestellt, uralt, und einen Kronkorken.'),
    W('Das ist Opas Spiel. Ohne Trick. Nur Augen. Er hat gesagt: „Willi, wer ehrlich gewinnt, schläft besser.“ Ich schlafe seit vierzig Jahren schlecht.'),
    W('Spiel mit mir. Ehrlich. Einmal.'),
  ], {
    choices: [
      { text: 'Die Becher genau verfolgen.', tag: '[Reflexe 5]', check: pruefung('he-willi-4-ehrlich', 'reflexe', 5, ['beobachten']), next: 'gewonnen' },
      { text: 'Einfach tippen. Mitte.', next: 'getippt' },
    ],
  }),
  knoten('gewonnen', [W('Gefunden. Ehrlich gefunden. Ha! Weißt du, wie sich das anfühlt? Das fühlt sich an wie Opa.', 'freude')], { next: 'ende', effects: [herz(ID, 60)] }),
  knoten('getippt', [erz('Du tippst auf die Mitte. Leer. Willi hebt den linken Becher: Kronkorken. Er grinst.'), W('Siehst du. Ehrlich verlieren ist auch schön. Fast so schön wie unehrlich gewinnen.')], { next: 'ende', effects: [herz(ID, 45)] }),
  knoten('ende', [
    erz('Willi drückt dir den alten Kronkorken in die Hand.'),
    W('Behalt ihn. Wenn du je glaubst, dass dich einer bescheißt: Schau auf seine Finger, nicht auf die Becher.'),
  ], { effects: [{ xp: 60 }, flag('willi_opa_trick')] }),
]);

const willi = weltfigur({
  id: ID,
  name: 'Wett-Willi',
  unknownName: 'Mann mit drei Bechern',
  faction: 'unterstadt',
  bio: 'Hütchenspieler am Schrottmarkt, „der ehrlichste Betrüger der Unterstadt“. Hosenträger, Edelstahlbecher von Opa, Kugel meistens in der Hand.',
  gifts: geschenke({
    loves: ['kartendeck', 'alte-euromuenze', 'murmelbeutel'],
    likes: ['synth-kaffee', 'chips-tuete', 'sonnenbrille-gold', 'zeitung-papier'],
    dislikes: ['gesetzbuch', 'handschellen'],
    hates: ['peilsender', 'kanalschlamm'],
  }),
  schedule: [ort('T,A', 'schrottmarkt', 'huetchenspiel'), weg('M,N')],
  heartEvents: [
    { id: 'he-wett-willi-2', hearts: 2, map: 'schrottmarkt', time: 'tag', dialogue: 'he-wett-willi-2' },
    { id: 'he-wett-willi-4', hearts: 4, map: 'schrottmarkt', time: 'abend', when: { seen: 'he-wett-willi-2' }, dialogue: 'he-wett-willi-4' },
  ],
  talk: [
    rede('willi-tag-rivale', { rival: ID }),
    rede('willi-tag-erstes', nichtGetroffen(ID)),
    rede('willi-tag-vertraut', undefined, 4),
    rede('willi-tag-standard'),
  ],
});

export const part: ContentPart = {
  npcs: { [ID]: willi },
  dialogues: sammle(T.rivale, T.erstes, T.standard, T.vertraut, he2, he4),
};
