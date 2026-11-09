// Mutter Brühe – Suppenküche der Rohrsiedlung (world.md §4.5, §3.9 akt-suppenkueche, Ruf unterstadt).
// Rezept für pers-jakko-kochbuch (Flag bruehe_rezept), Empfängerin der Schrapnell-Pakete sonntags (vex_paket_bruehe).
import type { ContentPart } from '../../part';
import type { DialogueChoice, DialogueNode } from '../../../modules/contracts';
import {
  type Menue, dialog, erz, flag, geschenke, gespraech, herz, ich, knoten, nichtGetroffen, ort, pruefung, rede, sammle,
  sprecher, weg, weltfigur, zurueck,
} from './_welt';
import { akt23 } from './mutter-bruehe-akt23';

const ID = 'mutter-bruehe';
const B = sprecher(ID);
const Z = zurueck('Noch was, Mutter Brühe.', 'Danke für die Suppe.');

const choices: DialogueChoice[] = [
  {
    text: 'Kartoffeln von den Schrapnell-Kurieren.', tag: '[Kurier]', when: { flag: 'vex_paket_bruehe' }, next: 'paket',
    effects: [flag('vex_paket_bruehe', false), { credits: 25 }, herz('vex-schrapnell', 15), herz(ID, 10), { xp: 15 }],
  },
  { text: 'Eine Schüssel, bitte.', next: 'suppe', effects: [{ shop: 'suppenkueche' }] },
  {
    text: 'Ich helf beim Austeilen.', tag: '[Suppe austeilen]', when: { time: 'morgen' }, next: 'austeilen',
    effects: [{
      minigame: 'akt-suppenkueche', level: 1, key: 'suppenkueche', label: 'Suppe austeilen',
      win: [{ rep: 'unterstadt', delta: 2 }, herz(ID, 10), { message: 'Mutter Brühe: „Gut gekellt, Kindchen. Kein Tropfen daneben.“' }],
      lose: [{ rep: 'unterstadt', delta: 1 }, { message: 'Mutter Brühe: „Halb voll ist auch voll. Für manche.“' }],
    }],
  },
  {
    text: 'Jakko sammelt Rezepte für sein Kochbuch. Verrätst du ihm deins?', when: { all: [{ quest: 'pers-jakko-kochbuch', state: 'active' }, { notFlag: 'bruehe_rezept' }] },
    next: 'rezept',
  },
  { text: 'Was hört man so in der Rohrsiedlung?', next: 'geruechte' },
  { text: '„Ich hab früher hier gegessen. Jeden Winter.“', tag: '[Gosse]', when: { origin: 'origin-gossenkind' }, once: true, id: 'b-gosse', next: 'gosse' },
  { text: 'Danke für die Suppe.' },
];

const nodes: DialogueNode[] = [
  knoten('paket', [
    erz('Sie wiegt den Sack in den Händen wie ein Neugeborenes.'),
    B('Kartoffeln! Echte! Mit Erde dran! Die Schrapnell ist ein Engel mit Nagelpistole.'),
    B('Hier, fünfundzwanzig. Und nimm ein Stück Brot mit, du siehst aus wie ein Laternenpfahl mit Sorgen.'),
  ], { choices: Z }),
  knoten('suppe', [B('Drei Credits. Wer nicht zahlen kann, zahlt nicht. Wer zahlen kann und nicht zahlt, kriegt die Kelle.')]),
  knoten('austeilen', [B('Schürze an. Kelle hoch. Und lächeln. Wer Suppe kriegt, soll nicht auch noch Angst kriegen.')]),
  knoten('rezept', [
    B('Mein Rezept? Das ist geheim. Das hat meine Mutter mir verraten und ihre Mutter ihr.'),
    B('… Für Jakko. Na gut. Wasser, was da ist, eine Zwiebel, und dann rühren, bis jemand „Hunger“ sagt. Das ist das Geheimnis: Man kocht, bis einer Hunger hat.'),
  ], {
    choices: [
      { text: '„Das ist kein Rezept. Das ist eine Lebenseinstellung.“', tag: '[Ausstrahlung 4]', check: pruefung('bruehe-rezept-charme', 'ausstrahlung', 4), next: 'rezept-gut' },
      { text: '„Danke. Ich schreib’s ihm auf.“', next: 'rezept-ok' },
    ],
  }),
  knoten('rezept-gut', [B('Hah! Genau. Und Lorbeer. Zwei Blätter. Das hab ich noch keinem gesagt. Für Jakko.')], { choices: Z, effects: [flag('bruehe_rezept'), flag('bruehe_lorbeer'), herz(ID, 30)] }),
  knoten('rezept-ok', [B('Schreib’s groß. Der Junge kann lesen, aber nur mit Hunger.')], { choices: Z, effects: [flag('bruehe_rezept'), herz(ID, 15)] }),
  knoten('geruechte', [
    B('Die Rostzähne haben gestern meinen Schatten erpresst. Ich hab ihm Suppe gegeben, jetzt ist er wieder ruhig.'),
    B('Und nachts schleichen Leute mit Kühlboxen zum Kanal. Rippers Leute. Ich hab nichts gesehen. Ich koche nur.'),
  ], { choices: Z }),
  knoten('gosse', [
    B('Jeden Winter? Lass dich ansehen … Ja! Du hast immer die Zwiebeln rausgefischt und unter den Tisch gelegt! Mit dem Knut zusammen!'),
    B('Der Knut zieht jetzt Leuten am Bahnhof die Jacken ab. Sag ihm, Mutter Brühe hat’s gehört. Er kriegt einen Schreck. Ich bin seine Patentante.'),
  ], { choices: Z, effects: [herz(ID, 50), flag('bruehe_kennt_knut')] }),
];

const M: Menue = { zeile: B('Noch was, Kindchen? Die Suppe wartet nicht. Die wird kalt. Wie die Welt.'), choices, nodes };

const T = {
  rivale: dialog('bruehe-tag-rivale', [knoten('start', [B('Für dich ist die Suppe alle.'), B('Und sie bleibt alle, solange du so guckst.')])]),
  erstes: gespraech('bruehe-tag-erstes', [
    erz('Ein Kessel, groß wie eine Badewanne, dampft unter einer Plane. Davor steht eine kleine, breite Frau mit Kelle wie mit einem Zepter.'),
    B('Mutter Brühe. Suppenküche. Drei Credits die Schüssel, null Credits, wenn du nichts hast. Wer drängelt, kriegt die Kelle.'),
    B('Du siehst neu aus. Neue kriegen Brot dazu. Iss. Reden kannst du, wenn du satt bist.'),
  ], M),
  sonntag: gespraech('bruehe-tag-sonntag', [B('Sonntag ist Kartoffeltag. Wenn die Schrapnell die Kartoffeln bringt. Sonst ist Sonntag Wassertag.')], M),
  morgen: gespraech('bruehe-tag-morgen', [
    erz('Die Schlange vor dem Kessel reicht bis zur Hängebrücke. Mutter Brühe kellt wie eine Maschine.'),
    B('Morgens ist Hochbetrieb. Wenn du Hände hast, nimm eine Kelle. Wenn du nur Mund hast, stell dich hinten an.'),
  ], M),
  vertraut: gespraech('bruehe-tag-vertraut', [B('Da ist ja mein Lieblingslaternenpfahl. Komm her, ich hab dir was aufgehoben. Den Boden vom Kessel. Da ist der Geschmack.')], M),
  standard: gespraech('bruehe-tag-standard', [B('Heute gibt’s Suppe. Gestern gab’s auch Suppe. Morgen? Rate mal.')], M),
};

/** ♥2: Mitten im Ansturm fällt der Gasbrenner aus. */
const he2 = dialog('he-mutter-bruehe-2', [
  knoten('start', [
    erz('Morgens, die Schlange ist lang. Der Gasbrenner unter dem Kessel hustet, spuckt und geht aus. Ein Raunen geht durch die Wartenden.'),
    B('Nicht jetzt. Nicht heute. Da hinten steht die Familie mit den Zwillingen, die haben seit gestern nichts.'),
  ], {
    choices: [
      { text: 'Den Brenner reparieren.', tag: '[Technik 3]', check: pruefung('he-bruehe-2-brenner', 'technik', 3), next: 'brenner' },
      { text: 'Die Schlange bei Laune halten, bis er wieder geht.', tag: '[Ausstrahlung 4]', check: pruefung('he-bruehe-2-schlange', 'ausstrahlung', 4), next: 'schlange' },
      { text: 'Holz aus den Hängebrücken-Resten sammeln und ein Feuer machen.', next: 'feuer' },
    ],
  }),
  knoten('brenner', [erz('Eine verstopfte Düse, ein Haarnadel-Trick, ein Fauchen. Der Brenner läuft wieder. Mutter Brühe küsst den Kessel. Dann dich. Auf die Stirn, ganz fest, wie ein Stempel.')], { next: 'ende', effects: [herz(ID, 40), { xp: 40 }] }),
  knoten('schlange', [erz('Du erzählst Witze, die nicht lustig sind. Die Zwillinge lachen trotzdem. Nach zehn Minuten springt der Brenner von selbst wieder an, als hätte er sich geschämt.')], { next: 'ende', effects: [herz(ID, 40), { xp: 40 }, { rep: 'unterstadt', delta: 2 }] }),
  knoten('feuer', [erz('Eine halbe Stunde, Splitter in den Fingern und ein Feuer, das mehr qualmt als wärmt. Aber die Suppe wird heiß. Langsam.')], { next: 'ende', effects: [herz(ID, 30), { xp: 30 }, { advanceTime: 30 }] }),
  knoten('ende', [B('Du kriegst ab heute deine Suppe umsonst. Keine Widerrede. Widerrede kostet drei Credits.')], { effects: [flag('bruehe_gratis')] }),
]);

/** ♥4: Mutter Brühe erzählt, wie die Suppenküche entstand. */
const he4 = dialog('he-mutter-bruehe-4', [
  knoten('start', [
    erz('Nachmittag, die Suppenküche ist leer. Mutter Brühe sitzt auf einem umgedrehten Eimer und schält Zwiebeln, ohne zu weinen.'),
    B('Weißt du, warum es hier Suppe gibt? Weil vor dreißig Jahren der große Rohrbruch war. Alles stand unter Wasser. Keiner hatte was.'),
    B('Ich hatte einen Topf. Einen. Und zwei Zwiebeln. Ich hab Suppe gekocht, und dann kamen die Leute. Und ich hab einfach nie aufgehört.'),
  ], {
    choices: [
      { text: '„Und wer kocht für dich?“', next: 'fuer-dich' },
      { text: 'Ihr eine Zwiebel abnehmen und mitschälen.', next: 'schaelen' },
      { text: '„Die Unterstadt schuldet dir was. Ich sorg dafür, dass sie das weiß.“', tag: '[Straße 5]', check: pruefung('he-bruehe-4-ruf', 'strasse', 5), next: 'ruf' },
    ],
  }),
  knoten('fuer-dich', [
    B('Für mich? … Keiner.', 'trauer'),
    B('Doch. Babette. Montags. Da hat sie Ruhetag und bringt mir Dampfnudeln. Wir sitzen hier und reden über Männer, die wir nicht geheiratet haben.'),
  ], { next: 'ende', effects: [herz(ID, 45)] }),
  knoten('schaelen', [erz('Ihr schält schweigend. Du weinst. Sie nicht. Sie reicht dir ein Taschentuch, ohne hinzusehen.')], { next: 'ende', effects: [herz(ID, 50)] }),
  knoten('ruf', [
    erz('Am nächsten Tag hängt am Schrottmarkt ein Zettel: „Mutter Brühe hat euch alle schon mal satt gemacht. Bringt was mit.“ Am Abend stehen vier Säcke Gemüse vor der Suppenküche.'),
  ], { next: 'ende', effects: [herz(ID, 60), { rep: 'unterstadt', delta: 5 }] }),
  knoten('ende', [
    ich('Danke, dass du mir das erzählt hast.'),
    B('Erzählt hab ich’s nur dir und der Kelle. Und die Kelle redet nicht.'),
  ], { effects: [{ xp: 60 }, { give: 'bruehes-suppe', qty: 2 }] }),
]);

// Akt 2, Partynacht und Nachspiel: mutter-bruehe-akt23.ts.
const A23 = akt23(M);

const bruehe = weltfigur({
  id: ID,
  name: 'Mutter Brühe',
  unknownName: 'Frau mit Kelle',
  faction: 'unterstadt',
  bio: 'Führt seit dem großen Rohrbruch vor dreißig Jahren die Suppenküche der Rohrsiedlung. Drei Credits die Schüssel, null, wenn man nichts hat. Kelle als Zepter, kennt jeden.',
  gifts: geschenke({
    loves: ['frisches-gemuese', 'kraeuter-gebaeck', 'hofhonig'],
    likes: ['bao-dampfnudel', 'synth-kaffee', 'tai-chi-tee', 'leuchtpilz'],
    dislikes: ['synth-nudeln', 'chrome-10-gutschein'],
    hates: ['plastikpflanze', 'kanalschlamm'],
  }),
  schedule: [...A23.schedule, ort('M,T,A', 'suppenkueche', 'kessel'), weg('N')],
  heartEvents: [
    { id: 'he-mutter-bruehe-2', hearts: 2, map: 'suppenkueche', time: 'morgen', dialogue: 'he-mutter-bruehe-2' },
    { id: 'he-mutter-bruehe-4', hearts: 4, map: 'suppenkueche', time: 'tag', when: { seen: 'he-mutter-bruehe-2' }, dialogue: 'he-mutter-bruehe-4' },
  ],
  talk: [
    rede('bruehe-tag-rivale', { rival: ID }),
    rede('bruehe-tag-erstes', nichtGetroffen(ID)),
    ...A23.talk,
    rede('bruehe-tag-vertraut', undefined, 4),
    rede('bruehe-tag-sonntag', { weekday: 'so' }),
    rede('bruehe-tag-morgen', { time: 'morgen' }),
    rede('bruehe-tag-standard'),
  ],
});

export const part: ContentPart = {
  npcs: { [ID]: bruehe },
  dialogues: sammle(T.rivale, T.erstes, T.sonntag, T.morgen, T.vertraut, T.standard, he2, he4, ...A23.dialogues),
};
