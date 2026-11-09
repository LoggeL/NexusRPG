// Vinyl-Vincent – Plattenhehler am Schrottmarkt (world.md §4.5, Shop vinyl-vincent). Die Schallplatten-Quest
// side-schallplatten (quest-side-a) hat einen eigenen Hotspot am Plattenstand; hier nur Tagesgespräche.
import type { ContentPart } from '../../part';
import type { DialogueChoice, DialogueNode } from '../../../modules/contracts';
import {
  type Menue, dialog, erz, flag, geschenke, gespraech, herz, ich, knoten, nichtGetroffen, ort, pruefung, rede, sammle,
  sprecher, weg, weltfigur, zurueck,
} from './_welt';
import { akt23 } from './vinyl-vincent-akt23';

const ID = 'vinyl-vincent';
const V = sprecher(ID);
const Z = zurueck('Noch was, Vincent.', 'Keep on spinning.');

const choices: DialogueChoice[] = [
  { text: 'Lass mich stöbern.', next: 'laden', effects: [{ shop: 'vinyl-vincent' }] },
  { text: 'Woher hast du die ganzen Platten?', once: true, id: 'v-woher', next: 'woher' },
  { text: 'Was läuft gerade?', next: 'laeuft' },
  { text: 'Was ist die eine Platte, die du keinem zeigst?', tag: '[Vincent ♥3]', requires: { hearts: ID, min: 3 }, once: true, id: 'v-geheim', next: 'geheim' },
  { text: 'Keep on spinning.' },
];

const nodes: DialogueNode[] = [
  knoten('laden', [V('Nicht mit Fettfingern anfassen. Nicht pusten. Nicht atmen, wenn’s geht. Vinyl spürt deine Seele, und deine Seele hat Chips gegessen.')]),
  knoten('woher', [
    V('Woher? Von Leuten, die sie nicht mehr brauchen. Weil sie umgezogen sind. Oder gestorben. Oder weil ich sie sehr nett gefragt hab, während ihr Haus leer war.'),
    V('Hehlerei ist ein hartes Wort. Ich sag lieber: musikalische Umverteilung.'),
  ], { choices: Z }),
  knoten('laeuft', [
    erz('Auf dem Plattenteller dreht sich etwas, das klingt wie ein Saxofon, das von einem Bus überfahren wurde. Liebevoll.'),
    V('Kabelbrand, Erstpressung, 2069. Bevor sie berühmt wurden. Bevor sie Ärger hatten. Bevor sie Aria hatten. Hör dir den Bass an. Der Bass hat Schulden.'),
  ], { choices: Z }),
  knoten('geheim', [
    V('„Neon Nocturne“, Lou Lametta, Testpressung. Nur fünf Stück gibt’s. Eins hab ich. Die anderen vier sind mit Lou verschwunden. Zusammen mit Lou.'),
    V('Die verkauf ich nie. Die spiel ich nur, wenn’s regnet. Rostregen. Dann klingt sie wie sie.'),
  ], { choices: Z, effects: [herz(ID, 20)] }),
];

const M: Menue = { zeile: V('Sonst noch was? Die B-Seite läuft schon. B-Seiten sind die ehrlichen.'), choices, nodes };

const T = {
  rivale: dialog('vincent-tag-rivale', [knoten('start', [V('Für dich gibt’s nur noch Kassetten.'), V('Leere.')])]),
  erstes: gespraech('vincent-tag-erstes', [
    erz('Kisten voller Schallplatten unter einer Plane, ein Plattenspieler auf einem Ölfass. Davor ein dürrer Typ mit Koteletten bis zum Kinn und einer Sonnenbrille, obwohl hier keine Sonne scheint.'),
    V('Vinyl-Vincent. Seltene Pressungen, Raritäten, Dinge, die offiziell nicht existieren. Wenn du nach Streamingmüll suchst: Das ist der falsche Stand und das falsche Jahrhundert.'),
  ], M),
  standard: gespraech('vincent-tag-standard', [V('Na? Brauchst du Rillen? Ich hab Rillen. Tiefe Rillen. Seelenrillen.')], M),
};

/** ♥2: Ein Kratzer in Vincents Lieblingsplatte. */
const he2 = dialog('he-vinyl-vincent-2', [
  knoten('start', [
    erz('Vincent sitzt auf seinem Ölfass und hält eine Platte gegen das Licht, wie einen kranken Vogel.'),
    V('Kratzer. Mitten im Solo. Irgendein Arsch hat sie mit dem Ellbogen vom Tisch gefegt. Ich hab ihn mit Kabelbrand-Postern beworfen. Er hat sich gefreut.'),
  ], {
    choices: [
      { text: 'Die Rille mit einer Nadel vorsichtig nachziehen.', tag: '[Technik 4]', check: pruefung('he-vincent-2-rille', 'technik', 4, ['reparieren']), next: 'repariert' },
      { text: '„Mach den Kratzer zum Teil der Platte. Wie eine Narbe.“', tag: '[Ausstrahlung 4]', check: pruefung('he-vincent-2-narbe', 'ausstrahlung', 4, ['trost']), next: 'narbe' },
      { text: 'Zu Dante bringen, der kennt sich mit sowas aus.', next: 'dante' },
    ],
  }),
  knoten('repariert', [erz('Du ziehst die Nadel durch die Rille, die Hand ganz ruhig. Das Solo läuft durch. Vincent nimmt die Sonnenbrille ab. Seine Augen sind feucht.')], { next: 'ende', effects: [herz(ID, 45), { xp: 40 }] }),
  knoten('narbe', [V('Eine Narbe. Hm. Jedes Mal, wenn sie springt, denk ich an den Arsch mit dem Ellbogen. Und an dich. Das gleicht sich aus.')], { next: 'ende', effects: [herz(ID, 45), { xp: 40 }] }),
  knoten('dante', [erz('Dante spielt die Platte mit einem selbst gebogenen Tonarm und tanzt dabei. Der Kratzer ist weg. Vincent behauptet, er habe ihn trotzdem gehört.')], { next: 'ende', effects: [herz(ID, 30), herz('dante', 10), { xp: 25 }] }),
  knoten('ende', [V('Ab jetzt kriegst du die guten Kisten zu sehen. Die unter dem Tisch. Mit den Spinnen.')], { effects: [flag('vincent_gute_kisten')] }),
]);

/** ♥4: Vincent spielt die Platte, die er keinem zeigt. */
const he4 = dialog('he-vinyl-vincent-4', [
  knoten('start', [
    erz('Es regnet Rost. Der Markt ist leer. Vincent hat unter der Plane eine Platte aufgelegt, und die Unterstadt wird für drei Minuten still.'),
    V('Lou Lametta. Sie hat bei mir gekauft, als sie noch keinen Namen hatte. Hat mit Kronkorken bezahlt. Ich hab sie alle noch.'),
    V('Sie hat gesagt: „Vincent, wenn ich berühmt werde, kauf ich dir einen richtigen Laden.“ Dann wurde sie berühmt. Dann war sie weg. Eines Nachts. Einfach weg.'),
  ], {
    choices: [
      { text: 'Einfach zuhören, bis die Platte zu Ende ist.', next: 'zuhoeren' },
      { text: '„Sie wäre stolz, dass ihre Musik noch jemand liebt.“', tag: '[Ausstrahlung 5]', check: pruefung('he-vincent-4-trost', 'ausstrahlung', 5, ['trost']), next: 'trost' },
      { text: '„Was ist mit ihr passiert?“', tag: '[Straße 5]', check: pruefung('he-vincent-4-fass', 'strasse', 5, ['geruecht']), next: 'fass' },
    ],
  }),
  knoten('zuhoeren', [erz('Die Nadel läuft aus. Knistern. Vincent lässt sie noch eine Weile in der Auslaufrille kreisen. Ihr sagt beide nichts.')], { next: 'ende', effects: [herz(ID, 50)] }),
  knoten('trost', [V('Stolz? Sie wäre beleidigt, dass ich die Platte nur bei Rostregen spiele. Sie hat Sonnenschein gehasst. Sie hätte gesagt: „Spiel sie öfter, du Feigling.“'), V('… Vielleicht tu ich das.')], { next: 'ende', effects: [herz(ID, 60)] }),
  knoten('fass', [
    V('Offiziell? Ausgewandert. Inoffiziell stand in der Nacht ein schwarzer Wagen mit Quantum-Kennzeichen vor ihrer Tür. Sie hatte gerade einen Song über Quantum geschrieben. Keinen netten.', 'besorgt'),
    V('Ich hab das nie gesagt. Ich bin ein Plattenhehler. Ich kenn nur Musik.'),
  ], { next: 'ende', effects: [herz(ID, 55), flag('vincent_fass_hinweis')] }),
  knoten('ende', [
    ich('Danke, dass ich sie hören durfte.'),
    V('Hier. Eine Vinyl-Platte. Nichts Besonderes. Aber sie ist von mir. Das macht sie besonders. Behaupte ich.'),
  ], { effects: [{ xp: 60 }, { give: 'vinyl-platte' }] }),
]);

// Akt 2, Partynacht und Nachspiel: vinyl-vincent-akt23.ts.
const A23 = akt23(M);

const vincent = weltfigur({
  id: ID,
  name: 'Vinyl-Vincent',
  unknownName: 'Typ mit Koteletten',
  faction: 'unterstadt',
  bio: 'Plattenhehler am Schrottmarkt. Koteletten, Sonnenbrille, Plattenspieler auf einem Ölfass. Nennt Hehlerei „musikalische Umverteilung“. Kannte die verschwundene Sängerin Lou Lametta, bevor sie berühmt wurde.',
  gifts: geschenke({
    loves: ['vinyl-platte', 'bandshirt', 'lio-demo-chip'],
    likes: ['poster-hv', 'vhs-kassette', 'sonnenbrille-gold', 'synth-kaffee'],
    dislikes: ['raubkopie-stick', 'teleprompter-chip'],
    hates: ['magnet-stoerer', 'kanalschlamm'],
  }),
  schedule: [ort('T,A', 'schrottmarkt', 'plattenstand-vincent'), weg('M,N')],
  heartEvents: [
    { id: 'he-vinyl-vincent-2', hearts: 2, map: 'schrottmarkt', time: 'tag', dialogue: 'he-vinyl-vincent-2' },
    { id: 'he-vinyl-vincent-4', hearts: 4, map: 'schrottmarkt', time: 'abend', when: { seen: 'he-vinyl-vincent-2' }, dialogue: 'he-vinyl-vincent-4' },
  ],
  talk: [
    rede('vincent-tag-rivale', { rival: ID }),
    rede('vincent-tag-erstes', nichtGetroffen(ID)),
    ...A23.talk,
    rede('vincent-tag-standard'),
  ],
});

export const part: ContentPart = {
  npcs: { [ID]: vincent },
  dialogues: sammle(T.rivale, T.erstes, T.standard, he2, he4, ...A23.dialogues),
};
