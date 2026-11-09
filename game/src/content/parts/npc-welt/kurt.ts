// Kurt – der jüngere der Abzieher-Brüder vom Bahnhof Mitte (world.md §4.5, side-abzieher in quest-side-b).
// „Das sag ich meiner Mama!“ Tagesablauf wie Knut, abends am zweiten Bahnsteig.
import type { ContentPart } from '../../part';
import type { Condition, DialogueChoice, DialogueNode } from '../../../modules/contracts';
import {
  type Menue, dialog, erz, flag, geschenke, gespraech, herz, ich, knoten, nichtGetroffen, ort, pruefung, rede, sammle,
  sprecher, weg, weltfigur, zurueck,
} from './_welt';

const ID = 'kurt';
const KU = sprecher(ID);
const KN = sprecher('knut');
const TUERSTEHER: Condition = { flag: 'ab_tuersteher' };
const Z = zurueck('Noch was, Kurt.', 'Tschüss, Kurt.');

const choices: DialogueChoice[] = [
  { text: 'Warum sagst du eigentlich alles deiner Mama?', once: true, id: 'ku-mama', next: 'mama' },
  { text: 'Was machst du, wenn Knut nicht da ist?', next: 'allein' },
  { text: 'Hast du Hunger?', next: 'hunger' },
  { text: 'Tschüss, Kurt.' },
];

const nodes: DialogueNode[] = [
  knoten('mama', [
    KU('Weil Mama gesagt hat: „Kurt, wenn Knut Mist baut, sagst du’s mir.“ Und Knut baut immer Mist. Also sag ich immer was.'),
    KU('Einmal hab ich’s mir selbst gesagt. Weil ich Mist gebaut hab. Mama war verwirrt. Ich auch.'),
  ], { choices: Z, effects: [herz(ID, 15)] }),
  knoten('allein', [
    KU('Dann stell ich mich da hin, wo Knut immer steht. Und guck so wie Knut. So.'),
    erz('Kurt verzieht das Gesicht zu einer Grimasse, die vermutlich gefährlich aussehen soll. Eine Taube landet auf seinem Kopf.'),
  ], { choices: Z }),
  knoten('hunger', [
    KU('Immer. Mutter Brühe sagt, ich hab zwei Mägen. Wie eine Kuh. Ich hab nachgeschaut. Kühe haben vier. Ich hab noch Platz.'),
  ], { choices: Z }),
];

const M: Menue = { zeile: KU('Noch was? Ich kann mir nur drei Sachen merken. Zwei sind schon voll.'), choices, nodes };

const T = {
  rivale: dialog('kurt-tag-rivale', [knoten('start', [KU('Ich red nicht mit dir. Knut sagt, du bist doof.'), KU('Das sag ich meiner Mama!')])]),
  erstes: gespraech('kurt-tag-erstes', [
    erz('Ein riesiger Kerl im Trainingsanzug, die Kapuze halb über die Augen. Er sieht dich an. Er sieht sich um, ob Knut in der Nähe ist. Knut ist nicht in der Nähe.'),
    KU('Ich bin Kurt. Ich bin der Bruder. Ich bin auch gefährlich. Glaub ich.'),
    KU('… Bist du von der Wache? Wenn du von der Wache bist: Das sag ich meiner Mama!'),
  ], M),
  tuer: gespraech('kurt-tag-tuer', [
    erz('Kurt steht neben Knut am High Voltage. Er trägt eine Fliege. Sie ist ihm um den Hals geknotet wie eine Krawatte. Falsch, aber mit Liebe.'),
    KU('Nur Gäste mit Stil! Das hat Bruno gesagt. Ich weiß nicht, was Stil ist. Aber du hast welchen. Rein mit dir.'),
  ], M),
  standard: gespraech('kurt-tag-standard', [KU('Hallo! Ich zieh dich heute nicht ab. Knut hat gesagt, du bist jetzt Kundschaft. Was ist Kundschaft?')], M),
};

/** ♥2: Kurt hat sich verlaufen – ohne Knut. */
const he2 = dialog('he-kurt-2', [
  knoten('start', [
    erz('Am zweiten Bahnsteig steht Kurt und dreht sich im Kreis. Er hat einen Stadtplan. Er hält ihn verkehrt herum. Dann richtig herum. Dann wieder verkehrt.'),
    KU('Knut hat gesagt: „Warte am Bahnsteig.“ Aber er hat nicht gesagt, an welchem. Es gibt ZWEI. Wer baut denn zwei Bahnsteige?'),
  ], {
    choices: [
      { text: '„Ich bring dich hin. Komm.“', next: 'bringen' },
      { text: 'Knut per Gerücht in der Halle aufspüren.', tag: '[Straße 4]', check: pruefung('he-kurt-2-suchen', 'strasse', 4, ['geruecht']), next: 'gefunden' },
    ],
  }),
  knoten('bringen', [
    erz('Du führst Kurt zum ersten Bahnsteig. Knut steht da und isst ein Brötchen. Kurt rennt auf ihn zu und umarmt ihn so fest, dass das Brötchen spritzt.'),
    KN('Kurt! Mein Brötchen!'),
    KU('Das sag ich meiner Mama!'),
  ], { next: 'ende', effects: [herz(ID, 40), herz('knut', 15), { xp: 30 }] }),
  knoten('gefunden', [
    erz('Ein Schuhputzer weiß, dass Knut am Imbiss steht, ein Rentner weiß, was er bestellt hat. Du bringst Kurt hin, bevor die Wurst kalt ist.'),
    KU('Du hast ihn GEFUNDEN. Du bist wie ein Hund. Ein schlauer Hund. Das ist ein Kompliment.'),
  ], { next: 'ende', effects: [herz(ID, 45), { xp: 40 }] }),
  knoten('ende', [KU('Du bist jetzt mein Freund. Das sag ich meiner Mama. Aber im Guten.')], { effects: [flag('kurt_freund')] }),
]);

/** ♥4: Kurt hat ein Geheimnis: Er malt. */
const he4 = dialog('he-kurt-4', [
  knoten('start', [
    erz('Kurt zieht dich hinter einen Fahrkartenautomaten und zeigt dir ein Heft. Darin: Zeichnungen. Tauben. Züge. Mama mit Nudelholz. Sie sind gut. Richtig gut.'),
    KU('Knut weiß das nicht. Keiner weiß das. Abzieher malen nicht. Abzieher ziehen ab.'),
    KU('Aber Sina an der Flutmauer, die malt auch. Die ist cool. Glaubst du, die lacht mich aus?'),
  ], {
    choices: [
      { text: '„Ich stell dich ihr vor. Sie wird dich lieben.“', next: 'sina' },
      { text: '„Zeig’s Knut. Er ist dein Bruder.“', tag: '[Ausstrahlung 5]', check: pruefung('he-kurt-4-knut', 'ausstrahlung', 5, ['ueberreden']), next: 'knut' },
      { text: '„Die Taube da ist schief.“', next: 'schief' },
    ],
  }),
  knoten('sina', [erz('An der Flutmauer blättert Sina durch das Heft, ganz langsam. Dann drückt sie Kurt eine Spraydose in die Hand. Kurt hält sie wie ein Neugeborenes.')], { next: 'ende', effects: [herz(ID, 55), herz('sina-spray', 15), flag('kurt_malt_mit_sina')] }),
  knoten('knut', [
    erz('Knut blättert durch das Heft. Er bleibt bei Mama mit dem Nudelholz hängen. Er schluckt.'),
    KN('Du … Kurt. Du Hohlbrot. Warum hast du nie was gesagt?'),
    KU('Das sag ich meiner Mama!'),
    KN('Ja. Tu das. Die wird stolz sein.'),
  ], { next: 'ende', effects: [herz(ID, 60), herz('knut', 25)] }),
  knoten('schief', [KU('Die ist nicht schief. Die hat Wind. Tauben haben immer Wind.'), erz('Er hat recht. Jetzt siehst du es auch.')], { next: 'ende', effects: [herz(ID, 40)] }),
  knoten('ende', [
    ich('Was willst du als Nächstes malen?'),
    KU('Dich. Aber mit Muskeln. Du brauchst mehr Muskeln.'),
  ], { effects: [{ xp: 60 }] }),
]);

const kurt = weltfigur({
  id: ID,
  name: 'Kurt',
  unknownName: 'Riesiger Kerl mit Kapuze',
  faction: 'rostzaehne',
  bio: 'Der jüngere Abzieher-Bruder vom Bahnhof Mitte. Groß, gutmütig, kann sich drei Dinge merken. Malt heimlich. „Das sag ich meiner Mama!“',
  gifts: geschenke({
    loves: ['nougatbombe', 'neonkreide', 'comic-heft'],
    likes: ['chips-tuete', 'stickerbogen', 'plueschmoehre', 'bruehes-suppe'],
    dislikes: ['gesetzbuch', 'rechenfibel'],
    hates: ['handschellen', 'kanalschlamm'],
  }),
  schedule: [
    weg('*', { when: { flag: 'ab_lockvogel' } }),
    ort('A,N', 'neon-gasse', 'hv-eingang', { when: TUERSTEHER }),
    ort('A', 'bahnhof-mitte', 'bahnsteig-2'),
    ort('N', 'ubahn-wagen', 'abzieher-lager'),
    weg('M,T'),
  ],
  heartEvents: [
    { id: 'he-kurt-2', hearts: 2, map: 'bahnhof-mitte', time: 'abend', dialogue: 'he-kurt-2' },
    { id: 'he-kurt-4', hearts: 4, map: 'bahnhof-mitte', time: 'abend', when: { seen: 'he-kurt-2' }, dialogue: 'he-kurt-4' },
  ],
  talk: [
    rede('kurt-tag-rivale', { rival: ID }),
    rede('kurt-tag-erstes', nichtGetroffen(ID)),
    rede('kurt-tag-tuer', TUERSTEHER),
    rede('kurt-tag-standard'),
  ],
});

export const part: ContentPart = {
  npcs: { [ID]: kurt },
  dialogues: sammle(T.rivale, T.erstes, T.tuer, T.standard, he2, he4),
};
