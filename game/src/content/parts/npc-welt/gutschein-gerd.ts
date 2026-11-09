// Gutschein-Gerd – Betrüger mit „Chrome 10“-Gutscheinen am Schrottmarkt (world.md §4.5). Seine Entlarvung ist
// side-chrome-10 (quest-side-a, Flag gerd_erledigt). Tags am Stand, abends im Hinterhof (Drucker).
import type { ContentPart } from '../../part';
import type { Condition, DialogueChoice, DialogueNode } from '../../../modules/contracts';
import {
  type Menue, dialog, erz, flag, geschenke, gespraech, herz, ich, knoten, nichtGetroffen, ort, pruefung, rede, sammle,
  sprecher, weg, weltfigur, zurueck,
} from './_welt';
import { TALK_23 } from './gutschein-gerd-akt23';

const ID = 'gutschein-gerd';
const G = sprecher(ID);
const ENTLARVT: Condition = { any: [{ flag: 'gerd_erledigt' }, { quest: 'side-chrome-10', state: 'done' }] };
const Z = zurueck('Noch was, Gerd.', 'Ich überleg’s mir.');

const choices: DialogueChoice[] = [
  { text: 'Was ist ein „Chrome 10“-Gutschein?', when: { not: ENTLARVT }, next: 'gutschein' },
  {
    text: 'Einen Gutschein kaufen (30 Cr).', requires: { credits: 30 }, when: { not: ENTLARVT }, next: 'gekauft',
    effects: [{ credits: -30 }, { give: 'chrome-10-gutschein' }],
  },
  { text: '„Diese Gutscheine sind gedruckter Müll, oder?“', tag: '[Straße 4]', check: pruefung('gerd-muell', 'strasse', 4, ['bluff']), when: { not: ENTLARVT }, once: true, id: 'g-muell', next: 'muell' },
  { text: 'Was machst du jetzt beruflich?', when: ENTLARVT, next: 'beruf' },
  { text: 'Ich überleg’s mir.' },
];

const nodes: DialogueNode[] = [
  knoten('gutschein', [
    G('Das, mein Freund, ist die Zukunft. Ein Gutschein für zehn Prozent auf Chrome-Implantate. Heute dreißig Credits, morgen fünfzig, übermorgen bist du Millionär.'),
    G('Wie? Ganz einfach: Die Gutscheine werden knapper. Weil ich weniger drucke. Ich meine: weil sie limitiert sind. Von der Firma. Die es gibt.'),
  ], { choices: Z }),
  knoten('gekauft', [G('Herzlichen Glückwunsch! Du bist jetzt Investor. Erzähl’s deinen Freunden. Am besten den reichen.')]),
  knoten('muell', [
    G('Müll? MÜLL? … Ja. Aber hübscher Müll. Mit Hologramm. Das Hologramm ist von einer Müslipackung. Es ist ein sehr gutes Hologramm.', 'verlegen'),
    G('Erzähl’s keinem. Hier, ein Gutschein gratis. Das ist kein Bestechungsversuch. Das ist ein Bestechungserfolg.'),
  ], { choices: Z, effects: [{ give: 'chrome-10-gutschein' }] }),
  knoten('beruf', [
    G('Ich verkaufe jetzt Glückskekse. Echte. Mit Sprüchen, die ich selber schreibe. „Du wirst heute betrogen.“ Läuft super. Die Leute finden es ehrlich.'),
  ], { choices: Z }),
];

const M: Menue = { zeile: G('Noch was? Die Gutscheine werden nicht billiger, während du nachdenkst. Die werden teurer. Glaub mir.'), choices, nodes };

const T = {
  rivale: dialog('gerd-tag-rivale', [knoten('start', [G('Kein Gutschein für dich. Auch nicht für Geld.'), G('Gut, für viel Geld. Aber du hast nicht viel Geld.')])]),
  erstes: gespraech('gerd-tag-erstes', [
    erz('Ein Klapptisch mit Glitzerdecke, darauf Stapel bunter Karten. Dahinter ein Mann in einem Anzug, der zwei Nummern zu groß und drei Jahrzehnte zu alt ist. Er strahlt dich an wie ein Scheinwerfer.'),
    G('Gutschein-Gerd! Ihr Partner für Wertanlagen! Chrome 10, zehn Prozent, null Risiko! Na ja. Wenig Risiko. Mittel. Fragen Sie nicht nach Risiko.'),
  ], M),
  entlarvt: gespraech('gerd-tag-entlarvt', [
    erz('Gerds Stand ist leer bis auf eine Schüssel Glückskekse und ein handgeschriebenes Schild: „EHRLICH. JETZT WIRKLICH.“'),
    G('Ah. Die Person, die mein Lebenswerk zerstört hat. Keks? Der ist gratis. Ehrlich gratis.'),
  ], M),
  hinterhof: gespraech('gerd-tag-hinterhof', [
    erz('Im Hinterhof rattert ein Drucker unter einer Plane. Gerd steht davor und tut so, als würde er sich die Wand ansehen.'),
    G('Ich … gucke die Wand an. Schöne Wand. Altbau. Hör nicht auf das Rattern. Das ist mein Magen.'),
  ], M),
  standard: gespraech('gerd-tag-standard', [G('Mein Lieblingsinvestor! Na, wie entwickelt sich das Portfolio? Gut? Sag gut.')], M),
};

/** ♥2: Gerd will einem Kind einen Gutschein verkaufen – und bekommt Gewissensbisse. */
const he2 = dialog('he-gutschein-gerd-2', [
  knoten('start', [
    erz('Vor Gerds Stand steht ein Junge mit Sparschwein. Er schüttelt es. Es klimpert traurig.'),
    sprecher('narrator')('Junge: „Ich will einen Gutschein. Für meine Mama. Für ein neues Auge.“'),
    erz('Gerd sieht das Sparschwein an. Dann dich. Dann wieder das Sparschwein. Sein Gesicht macht etwas, das es lange nicht gemacht hat.'),
  ], {
    choices: [
      { text: 'Gerd anstarren, bis er das Richtige tut.', next: 'starren' },
      { text: '„Gerd. Sag ihm die Wahrheit. Jetzt.“', tag: '[Ausstrahlung 4]', check: pruefung('he-gerd-2-wahrheit', 'ausstrahlung', 4, ['ueberreden']), next: 'wahrheit' },
      { text: 'Den Jungen zu Mira Lötzinn schicken, die hat faire Preise.', when: { met: 'mira-loetzinn' }, next: 'mira' },
    ],
  }),
  knoten('starren', [erz('Gerd hält drei Sekunden durch. Dann schiebt er dem Jungen das Sparschwein zurück und flüstert: „Ausverkauft. Komm wieder, wenn du groß bist. Oder nie.“')], { next: 'ende', effects: [herz(ID, 35), { xp: 25 }] }),
  knoten('wahrheit', [
    G('Die Gutscheine sind … nicht ganz echt. Spar dein Geld. Und sag deiner Mama, sie soll zu Mira gehen. Die ist teuer, aber ehrlich. Wie ich. Nur ohne das „wie ich“.'),
    erz('Der Junge zieht ab. Gerd setzt sich auf einen Kanister und starrt auf seine Hände.'),
  ], { next: 'ende', effects: [herz(ID, 50), { xp: 40 }] }),
  knoten('mira', [erz('Der Junge rennt los. Gerd sieht ihm nach und murmelt: „Das war jetzt ein verlorener Kunde. Warum fühlt sich das gut an?“')], { next: 'ende', effects: [herz(ID, 40), herz('mira-loetzinn', 10), { xp: 30 }] }),
  knoten('ende', [G('Sag’s keinem. Ich hab einen Ruf zu verlieren. Einen schlechten. Aber er gehört mir.')], { effects: [flag('gerd_gewissen')] }),
]);

/** ♥4: Gerds alter Traum. */
const he4 = dialog('he-gutschein-gerd-4', [
  knoten('start', [
    erz('Gerd zeigt dir im Hinterhof eine Kiste. Darin: Hunderte echte Rabattmarken aus den 2050ern, sorgfältig eingeklebt. Ein Album.'),
    G('Mein Vater hat die gesammelt. Er hat geglaubt, dass sie irgendwann was wert sind. Er hat vierzig Jahre gespart. Dann hat der Laden zugemacht. Die Marken waren nichts mehr wert.'),
    G('Ich wollte immer beweisen, dass man mit Papier reich werden kann. Ich hab halt das falsche Papier gedruckt.'),
  ], {
    choices: [
      { text: '„Das Album ist für Sammler was wert. Ein echtes Stück Unterstadt.“', tag: '[Straße 5]', check: pruefung('he-gerd-4-wert', 'strasse', 5, ['verhandeln']), next: 'wert' },
      { text: '„Dein Vater hat was gesammelt, das ihm Freude gemacht hat. Das reicht.“', next: 'freude' },
      { text: '„Druck doch was Ehrliches. Flyer. Plakate. Hochzeitseinladungen.“', next: 'druck' },
    ],
  }),
  knoten('wert', [G('Vincent würde dafür … Vincent würde dafür eine Niere geben. Eine von seinen. Glaub ich. Hm. Vielleicht behalt ich’s trotzdem.')], { next: 'ende', effects: [herz(ID, 55)] }),
  knoten('freude', [G('Freude. Ja. Er hat jeden Abend geklebt und gepfiffen. Ich hab vergessen, dass er gepfiffen hat.', 'trauer')], { next: 'ende', effects: [herz(ID, 50)] }),
  knoten('druck', [G('Hochzeitseinladungen. Mit Hologramm! Von der Müslipackung! … Das könnte funktionieren. Bruno heiratet vielleicht. Irgendwann. Er ist verliebt in ein Plüschtier.', 'freude')], { next: 'ende', effects: [herz(ID, 50), flag('gerd_druckerei')] }),
  knoten('ende', [
    ich('Was machst du jetzt mit dem Album?'),
    G('Ich kleb weiter. Mit echten Marken. Ich fang heute an. Mit dem hier.'),
    erz('Er klebt einen deiner Kronkorken ins Album. Darunter schreibt er dein Datum.'),
  ], { effects: [{ xp: 60 }] }),
]);

const gerd = weltfigur({
  id: ID,
  name: 'Gutschein-Gerd',
  unknownName: 'Mann im zu großen Anzug',
  faction: 'unterstadt',
  bio: 'Verkauft am Schrottmarkt „Chrome 10“-Gutscheine als Wertanlage, gedruckt im eigenen Hinterhof. Anzug zu groß, Lächeln zu breit, Gewissen zu klein. Meistens.',
  gifts: geschenke({
    loves: ['goldknauf-replik', 'sonnenbrille-gold', 'kassenbuch'],
    likes: ['zeitung-papier', 'stickerbogen', 'glitzerschrott', 'alte-euromuenze'],
    dislikes: ['gesetzbuch', 'reporter-notizbuch'],
    hates: ['chrome-10-gutschein', 'handschellen'],
  }),
  schedule: [
    ort('T', 'schrottmarkt', 'gerds-stand'),
    ort('A', 'schrottmarkt', 'gerds-hinterhof'),
    weg('M,N'),
  ],
  heartEvents: [
    { id: 'he-gutschein-gerd-2', hearts: 2, map: 'schrottmarkt', time: 'tag', dialogue: 'he-gutschein-gerd-2' },
    { id: 'he-gutschein-gerd-4', hearts: 4, map: 'schrottmarkt', time: 'abend', when: { seen: 'he-gutschein-gerd-2' }, dialogue: 'he-gutschein-gerd-4' },
  ],
  talk: [
    rede('gerd-tag-rivale', { rival: ID }),
    rede('gerd-tag-erstes', nichtGetroffen(ID)),
    ...TALK_23,
    rede('gerd-tag-entlarvt', ENTLARVT),
    rede('gerd-tag-hinterhof', { time: 'abend' }),
    rede('gerd-tag-standard'),
  ],
});

export const part: ContentPart = {
  npcs: { [ID]: gerd },
  dialogues: sammle(T.rivale, T.erstes, T.entlarvt, T.hinterhof, T.standard, he2, he4),
};
