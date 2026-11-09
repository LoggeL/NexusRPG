// Frau Klingel – Glockenhändlerin am Schrottmarkt, deren Hörimplantat Radio spielt (world.md §4.5).
// side-zweite-hand (quest-side-b) setzt klingel_kalibriert (Radio weg) oder klingel_radio (Radio bleibt).
import type { ContentPart } from '../../part';
import type { Condition, DialogueChoice, DialogueNode } from '../../../modules/contracts';
import {
  type Menue, dialog, erz, flag, geschenke, gespraech, herz, ich, knoten, nichtGetroffen, ort, pruefung, rede, sammle,
  sprecher, weg, weltfigur, zurueck,
} from './_welt';

const ID = 'frau-klingel';
const K = sprecher(ID);
const RADIO = sprecher('narrator');
const KALIBRIERT: Condition = { flag: 'klingel_kalibriert' };
const Z = zurueck('NOCH EINE FRAGE!', 'AUF WIEDERSEHEN!');

const choices: DialogueChoice[] = [
  { text: 'Was läuft gerade in Ihrem Ohr?', when: { not: KALIBRIERT }, next: 'radio' },
  { text: 'Wie hört sich die Welt ohne Radio an?', when: KALIBRIERT, next: 'still' },
  { text: 'Was verkaufen Sie für Glocken?', next: 'glocken' },
  { text: 'Erzählen Sie mir von Ihrem Kurt.', tag: '[Klingel ♥3]', requires: { hearts: ID, min: 3 }, once: true, id: 'kl-kurt', next: 'kurt' },
  { text: 'AUF WIEDERSEHEN!' },
];

const nodes: DialogueNode[] = [
  knoten('radio', [
    K('Moment, ich dreh lauter. Ach nee, geht ja nicht.'),
    RADIO('Aus ihrem Ohr, blechern: „… und das Wetter: Rostregen mit Aussicht auf Rostregen. Jetzt die Werbung: Nougatbombe, Hunger? Bombe!“'),
    K('Seit drei Jahren. Radio Rost, Tag und Nacht. Ich kann jeden Werbespruch auswendig. Fragen Sie mich was. Egal was.'),
  ], { choices: Z }),
  knoten('still', [
    K('Komisch. Ich hör die Tauben. Ich hör die Glocken. Ich hör meine eigenen Schritte. Ich wusste nicht, dass ich so schlurfe.'),
    K('Manchmal vermisse ich den Wetterbericht. Dann sag ich ihn mir selbst auf. Rostregen. Ist eh immer Rostregen.'),
  ], { choices: Z }),
  knoten('glocken', [
    K('Kirchenglocken aus der Altstadt, Fahrradklingeln, Kuhglocken, Türglocken, eine Glocke von einem Schiff, das gesunken ist. Die klingt nass.'),
    K('Und Taschenglöckchen. Für Leute, die gern gehört werden wollen. Das sind die meisten.'),
  ], { choices: Z }),
  knoten('kurt', [
    K('Mein Kurt war Glöckner. Der letzte in der Unterstadt. Er hat jeden Sonntag geläutet, auch als keiner mehr in die Kirche kam. „Damit sie wissen, dass Sonntag ist“, hat er gesagt.'),
    K('Seit er tot ist, läutet keiner. Ich hab die Glocken aufgekauft, bevor sie eingeschmolzen werden. Jetzt stehen sie hier. Und warten.'),
  ], { choices: Z, effects: [herz(ID, 25)] }),
];

const M: Menue = { zeile: K('WAS NOCH? Ich höre Sie! Halbwegs!'), choices, nodes };

const T = {
  rivale: dialog('klingel-tag-rivale', [knoten('start', [K('WAS? Ich höre Sie nicht!'), K('Und ich will Sie auch nicht hören.')])]),
  erstes: gespraech('klingel-tag-erstes', [
    erz('Ein Stand voller Glocken, von fingerhutklein bis fassgroß. Dazwischen eine alte Dame mit Dutt und Strickweste. Aus ihrem Ohr dudelt leise Schlagermusik.'),
    K('GUTEN TAG! Klingel mein Name, Glocken mein Geschäft! Sprechen Sie laut, in meinem Ohr läuft gerade die Hitparade!'),
  ], M),
  kalibriert: gespraech('klingel-tag-kalibriert', [K('Ah, da sind Sie ja! Ich hab Sie schon an den Schritten erkannt. Sie gehen wie jemand, der was vorhat.')], M),
  standard: gespraech('klingel-tag-standard', [
    RADIO('Aus ihrem Ohr: „… Verkehr: Linie 3 fährt wieder rückwärts. Wir bitten um Verständnis.“'),
    K('HALLO! Haben Sie das gehört? Linie 3! Schon wieder!'),
  ], M),
};

/** ♥2: Frau Klingel hört im Radio etwas, das nicht ins Radio gehört. */
const he2 = dialog('he-frau-klingel-2', [
  knoten('start', [
    erz('Frau Klingel winkt dich hektisch heran und tippt sich ans Ohr.'),
    K('Seit heute Morgen kommt da kein Schlager mehr. Da kommt Funk. Zwei Männer. „Lieferung Hafen, Container, Dienstag.“ Ich glaub, ich hör Gauner!'),
  ], {
    choices: [
      { text: 'Das Implantat nah ans eigene Ohr halten und mithören.', tag: '[Technik 4]', check: pruefung('he-klingel-2-funk', 'technik', 4, ['terminal']), next: 'gehoert' },
      { text: '„Schreiben Sie auf, was die sagen. Jedes Wort.“', next: 'notiert' },
    ],
  }),
  knoten('gehoert', [
    erz('Durch das Rauschen: „… Ripper will den Ausschuss bis Dienstag … Container siebenundsiebzig … Venom kommt selbst.“ Dann wieder Schlager.'),
    K('Venom? Das klingt nach Gift. Ich mag kein Gift. Ich hab einen Kaktus, der ist giftig. Den mag ich auch nicht.'),
  ], { next: 'ende', effects: [herz(ID, 45), { xp: 40 }, flag('klingel_funk_c77')] }),
  knoten('notiert', [
    erz('Frau Klingel schreibt mit Bleistift auf eine Papiertüte. Die Hälfte sind Werbesprüche, die andere Hälfte steht: „Container 77. Dienstag. Nachts.“'),
  ], { next: 'ende', effects: [herz(ID, 35), { xp: 30 }, flag('klingel_funk_c77')] }),
  knoten('ende', [K('Sie sind ein Schatz. Hier, ein Glöckchen. Klingeln Sie, wenn Sie Hilfe brauchen. Ich höre es. Wahrscheinlich.')]),
]);

/** ♥4: Am Sonntag noch einmal läuten. */
const he4 = dialog('he-frau-klingel-4', [
  knoten('start', [
    erz('Sonntagmorgen. Frau Klingel steht vor der größten Glocke an ihrem Stand, einem grünen Bronzeriesen. In der Hand hält sie einen Klöppel, den sie kaum heben kann.'),
    K('Kurts Glocke. Die vom Kirchturm. Heute wäre sein Siebzigster gewesen. Ich will einmal läuten. Einmal. Aber meine Arme sind achtzig.'),
  ], {
    choices: [
      { text: 'Den Klöppel nehmen und mit aller Kraft schlagen.', tag: '[Körper 4]', check: pruefung('he-klingel-4-laeuten', 'koerper', 4, ['kraft']), next: 'laut' },
      { text: 'Ihre Hände auf dem Klöppel lassen und gemeinsam schwingen.', next: 'gemeinsam' },
      { text: '„Ich hol Knut und Kurt. Die sind stark.“', when: { met: 'knut' }, next: 'brueder' },
    ],
  }),
  knoten('laut', [erz('BONGGG. Der Ton rollt über den Schrottmarkt, durch die Lötgassen, bis zur Hafenkante. Händler halten inne. Meister Watt blinzelt. Zum ersten Mal seit Jahren.')], { next: 'ende', effects: [herz(ID, 55)] }),
  knoten('gemeinsam', [erz('Zusammen schwingt ihr den Klöppel. Der Ton ist leiser als früher, sagt sie. Aber er ist da. Frau Klingel lacht und weint gleichzeitig.')], { next: 'ende', effects: [herz(ID, 60)] }),
  knoten('brueder', [
    erz('Knut und Kurt kommen, sehen die Glocke und schlagen gleichzeitig. Der Ton ist so laut, dass drei Dachziegel fallen.'),
    sprecher('kurt')('Das sag ich meiner Mama!'),
    K('Kurt? Ein Kurt? … Ja. Sag’s deiner Mama. Sag ihr, ein Kurt hat geläutet.'),
  ], { next: 'ende', effects: [herz(ID, 60), herz('kurt', 15), herz('knut', 15)] }),
  knoten('ende', [
    ich('Er hätte es gehört.'),
    K('Er hat es gehört. Kurt hat alles gehört. Er war nicht schwerhörig. Ich bin es nur geworden, damit ich nicht mehr höre, dass er nicht mehr da ist.'),
  ], { effects: [{ xp: 60 }, flag('klingel_sonntag_laeuten')] }),
]);

const klingel = weltfigur({
  id: ID,
  name: 'Frau Klingel',
  unknownName: 'Alte Dame mit Glocken',
  faction: 'unterstadt',
  bio: 'Verkauft am Schrottmarkt Glocken jeder Größe. Witwe des letzten Glöckners der Unterstadt. Ihr altes Hörimplantat empfängt Radio Rost – Tag und Nacht.',
  gifts: geschenke({
    loves: ['kraeuter-gebaeck', 'liebesroman', 'akkordeon-balg'],
    likes: ['synth-kaffee', 'nadel-und-faden', 'postkarte-meer', 'vinyl-platte'],
    dislikes: ['raubkopie-stick', 'mikrofon-puschel'],
    hates: ['magnet-stoerer', 'kanalschlamm'],
  }),
  schedule: [ort('T,A', 'schrottmarkt', 'klingel-stand'), weg('M,N')],
  heartEvents: [
    { id: 'he-frau-klingel-2', hearts: 2, map: 'schrottmarkt', time: 'tag', dialogue: 'he-frau-klingel-2' },
    { id: 'he-frau-klingel-4', hearts: 4, map: 'schrottmarkt', time: 'tag', when: { all: [{ seen: 'he-frau-klingel-2' }, { weekday: 'so' }] }, dialogue: 'he-frau-klingel-4' },
  ],
  talk: [
    rede('klingel-tag-rivale', { rival: ID }),
    rede('klingel-tag-erstes', nichtGetroffen(ID)),
    rede('klingel-tag-kalibriert', KALIBRIERT),
    rede('klingel-tag-standard'),
  ],
});

export const part: ContentPart = {
  npcs: { [ID]: klingel },
  dialogues: sammle(T.rivale, T.erstes, T.kalibriert, T.standard, he2, he4),
};
