// Gerda Gleis – Fundbüro am Bahnhof Mitte (world.md §4.5, §3.9 akt-fundbuero, Shop fundbuero).
// Empfängerin der Schrapnell-Pakete Mi/Sa (Flag vex_paket_gerda, siehe vex-schrapnell.ts).
import type { ContentPart } from '../../part';
import type { DialogueChoice, DialogueNode } from '../../../modules/contracts';
import {
  type Menue, dialog, erz, flag, geschenke, gespraech, herz, ich, knoten, nichtGetroffen, ort, pruefung, rede, sammle,
  sprecher, weg, weltfigur, zurueck,
} from './_welt';
import { TALK_23 } from './gerda-gleis-akt23';

const ID = 'gerda-gleis';
const G = sprecher(ID);
const Z = zurueck('Noch eine Sache, Frau Gleis.', 'Auf Wiedersehen.');

const choices: DialogueChoice[] = [
  {
    text: 'Paket von den Schrapnell-Kurieren. Dringend. Seit 2079.', tag: '[Kurier]', when: { flag: 'vex_paket_gerda' }, next: 'paket',
    effects: [flag('vex_paket_gerda', false), { credits: 25 }, herz('vex-schrapnell', 15), herz(ID, 10), { xp: 15 }],
  },
  { text: 'Was gibt’s an Fundsachen zu kaufen?', next: 'laden', effects: [{ shop: 'fundbuero' }] },
  {
    text: 'Kann ich helfen, Besitzer zu finden?', tag: '[Fundbüro]', next: 'suchen',
    effects: [{
      minigame: 'akt-fundbuero', level: 1, key: 'fundbuero', label: 'Besitzer finden',
      win: [{ credits: 30 }, { rep: 'unterstadt', delta: 1 }, herz(ID, 10)],
      lose: [{ message: 'Gerda: „Nicht schlimm. Die Sachen warten. Die sind geduldiger als Menschen.“' }],
    }],
  },
  { text: 'Was ist das Seltsamste, was je abgegeben wurde?', once: true, id: 'g-seltsam', next: 'seltsam' },
  { text: 'Auf Wiedersehen.' },
];

const nodes: DialogueNode[] = [
  knoten('paket', [
    erz('Gerda nimmt das flache Paket, liest den Stempel, liest ihn noch mal und setzt die Brille ab.'),
    G('„Dringend – seit 2079“. Das ist mein Antrag auf eine neue Schublade. Die Verwaltung hat ihn genehmigt. Sieben Jahre. Ich bin gerührt.'),
    G('Fünfundzwanzig Credits. Quittung kommt per Post. In sieben Jahren.'),
  ], { choices: Z }),
  knoten('laden', [G('Alles, was nach neunzig Tagen keiner abholt, verkaufe ich. Das ist Vorschrift. Die Handschellen sind übrigens alle von Kessel. Sie verliert sie dauernd.')]),
  knoten('suchen', [G('Wunderbar. Nimm die Kiste da. Jedes Ding hat einen Menschen. Man muss nur hinhören.')]),
  knoten('seltsam', [
    G('Ein Gebiss. Mit Zahnspange. Für einen Hund.'),
    G('Ein Koffer voller Nougatbomben. Abgeholt hat ihn ein Mann mit Sonnenbrille, der sehr laut „Das ist nicht meins“ gesagt hat und ihn trotzdem genommen hat.'),
    G('Und letzten Monat: eine komplette Erinnerung. Auf einem Chip. Von einem Mann, der „Ja, Master“ gesagt hat und sie nicht mehr haben wollte.'),
  ], { choices: Z, effects: [herz(ID, 15)] }),
];

const M: Menue = { zeile: G('Noch etwas? Bitte deutlich sprechen, die Bahn ist laut und ich bin achtundsechzig.'), choices, nodes };

const T = {
  rivale: dialog('gerda-tag-rivale', [knoten('start', [G('Für Sie ist das Fundbüro geschlossen.'), G('Sie haben etwas verloren. Meinen Respekt.')])]),
  erstes: gespraech('gerda-tag-erstes', [
    erz('Hinter einem Schalter voller Regale – Regenschirme, ein einzelner Rollschuh, eine Kiste mit der Aufschrift „ZÄHNE?“ – sitzt eine Dame mit Strickjacke und Stempelkissen.'),
    G('Gerda Gleis, Fundbüro Bahnhof Mitte. Haben Sie etwas verloren oder etwas gefunden? Oder sich selbst? Das kommt öfter vor, als man denkt.'),
  ], M),
  paket: gespraech('gerda-tag-paket', [G('Ist das für mich? Es sieht dringend aus. Und alt. Wie ich.')], M),
  vertraut: gespraech('gerda-tag-vertraut', [G('Ah, mein Lieblingsfinder. Ich hab Ihnen einen Keks zurückgelegt. Den hat keiner abgeholt. Drei Monate. Er ist noch gut. Fast.')], M),
  standard: gespraech('gerda-tag-standard', [G('Guten Tag. Haben Sie heute etwas verloren? Nein? Dann sind Sie heute ein Glückspilz.')], M),
};

/** ♥2: Einen verlorenen Gegenstand seinem Besitzer zuordnen. */
const he2 = dialog('he-gerda-gleis-2', [
  knoten('start', [
    erz('Gerda hält einen kleinen Plüschhasen mit Polizeimütze hoch. Ein Ohr ist angenäht, schief.'),
    G('Seit einer Woche hier. Kein Name, keine Adresse. Aber jemand hat ihn sehr lieb gehabt. Man sieht das an dem Ohr.'),
  ], {
    choices: [
      { text: '„Den hat Wachmann Pfeffers Tochter gemalt. Mila. Der gehört ihr.“', when: { met: 'pfeffer' }, next: 'mila' },
      { text: 'Herumfragen, wer einen Hasen vermisst.', tag: '[Straße 4]', check: pruefung('he-gerda-2-fragen', 'strasse', 4), next: 'gefunden' },
      { text: '„Ich häng einen Zettel auf.“', next: 'zettel' },
    ],
  }),
  knoten('mila', [erz('Am nächsten Freitag drückt dir Pfeffer im High Voltage stumm beide Hände. Er weint ein bisschen. Mila hat dir einen Hasen gemalt. Mit Lederjacke.')], { next: 'ende', effects: [herz(ID, 45), herz('pfeffer', 30), { xp: 40 }] }),
  knoten('gefunden', [erz('Am Schrottmarkt erfährst du, dass ein kleines Mädchen jeden Tag an der Ecke steht und nach einem Hasen fragt. Mila. Gerda gibt dir den Hasen mit. Mila quietscht so laut, dass Gustavs Kran wackelt.')], { next: 'ende', effects: [herz(ID, 40), { xp: 40 }] }),
  knoten('zettel', [erz('Zwei Tage später holt eine kleine Hand den Hasen ab. Sie hinterlässt eine Zeichnung: Gerda mit Strickjacke, groß wie ein Riese.')], { next: 'ende', effects: [herz(ID, 25), { xp: 20 }] }),
  knoten('ende', [G('Sehen Sie. Jedes Ding hat einen Menschen. Ab heute bekommen Sie bei mir zehn Prozent Finderlohn extra. Sagen Sie es nicht der Verwaltung.')], { effects: [flag('gerda_finderlohn')] }),
]);

/** ♥4: Gerdas eigene Fundsache – ein Liebesbrief von 2050. */
const he4 = dialog('he-gerda-gleis-4', [
  knoten('start', [
    erz('Gerda hat einen vergilbten Umschlag vor sich liegen. Sie hat ihn aufgemacht. Das macht sie nie.'),
    G('Den hat jemand 2050 im Wartehäuschen liegen lassen. Adressiert an „die Frau mit dem roten Schal am Bahnsteig 3“.'),
    G('Ich hatte damals einen roten Schal. Und ich stand an Bahnsteig 3. Jeden Morgen. Sechsunddreißig Jahre hab ich den Brief nicht aufgemacht.'),
  ], {
    choices: [
      { text: '„Was steht drin?“', next: 'drin' },
      { text: '„Willst du wissen, wer ihn geschrieben hat? Ich kann suchen.“', tag: '[Straße 5]', check: pruefung('he-gerda-4-suche', 'strasse', 5), next: 'suche' },
      { text: 'Ihr einfach die Hand auf die Schulter legen.', next: 'still' },
    ],
  }),
  knoten('drin', [
    G('„Ich steige jeden Morgen eine Station zu spät aus, damit ich Sie länger sehe. Wenn Sie mich auch sehen, tragen Sie morgen den Schal links.“'),
    G('Ich hab ihn rechts getragen. Ich hab den Brief ja nie gelesen.', 'trauer'),
    G('… Ach. Wie schön, dass es ihn gab.'),
  ], { next: 'ende', effects: [herz(ID, 50)] }),
  knoten('suche', [
    erz('Die Handschrift passt zu den Wartungszetteln an der Pförtnerbank im Digitech-Areal. Ole Gähn. Der Mann, der jeden Morgen eine Station zu spät aufwacht. Seit 2050.'),
    G('Ole? Der schläft doch immer. … Er hat gar nicht verschlafen. Er ist sitzen geblieben. Meinetwegen.', 'ueberrascht'),
    G('Ich glaube, ich fahre morgen mal bis zur Endstation. Und wecke jemanden.'),
  ], { next: 'ende', effects: [herz(ID, 60), herz('ole-gaehn', 20), flag('gerda_brief_ole')] }),
  knoten('still', [erz('Ihr sitzt zwischen Regenschirmen und Rollschuhen. Eine U-Bahn fährt ein, pünktlich. Gerda lacht, ganz leise.')], { next: 'ende', effects: [herz(ID, 45)] }),
  knoten('ende', [
    ich('Was machst du mit dem Brief?'),
    G('Ich lege ihn ins Fundbüro. In die Abteilung „Abgeholt“. Die gab es bisher nicht. Ich hab sie gerade erfunden.'),
  ], { effects: [{ xp: 60 }] }),
]);

const gerda = weltfigur({
  id: ID,
  name: 'Gerda Gleis',
  unknownName: 'Dame im Fundbüro',
  faction: 'unterstadt',
  bio: 'Führt seit Jahrzehnten das Fundbüro am Bahnhof Mitte. Strickjacke, Stempelkissen, Engelsgeduld. „Jedes Ding hat einen Menschen.“',
  gifts: geschenke({
    loves: ['stempelkissen', 'nadel-und-faden', 'kraeuter-gebaeck'],
    likes: ['zeitung-papier', 'synth-kaffee', 'liebesroman', 'postkarte-meer'],
    dislikes: ['raubkopie-stick', 'volt-limo'],
    hates: ['kanalschlamm'],
  }),
  schedule: [ort('M,T', 'fundbuero', 'schalter'), weg('A,N')],
  heartEvents: [
    { id: 'he-gerda-gleis-2', hearts: 2, map: 'fundbuero', time: ['morgen', 'tag'], dialogue: 'he-gerda-gleis-2' },
    { id: 'he-gerda-gleis-4', hearts: 4, map: 'fundbuero', time: 'tag', when: { seen: 'he-gerda-gleis-2' }, dialogue: 'he-gerda-gleis-4' },
  ],
  talk: [
    rede('gerda-tag-rivale', { rival: ID }),
    rede('gerda-tag-erstes', nichtGetroffen(ID)),
    ...TALK_23,
    rede('gerda-tag-paket', { flag: 'vex_paket_gerda' }),
    rede('gerda-tag-vertraut', undefined, 4),
    rede('gerda-tag-standard'),
  ],
});

export const part: ContentPart = {
  npcs: { [ID]: gerda },
  dialogues: sammle(T.rivale, T.erstes, T.paket, T.vertraut, T.standard, he2, he4),
};
