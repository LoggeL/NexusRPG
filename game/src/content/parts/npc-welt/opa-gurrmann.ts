// Opa Gurrmann – Taubendrohnen-Post in den Lötgassen (world.md §4.5, §3.9 akt-taubenpost).
// Empfänger der Schrapnell-Pakete Mo/Do (Flag vex_paket_gurrmann, siehe vex-schrapnell.ts).
import type { ContentPart } from '../../part';
import type { DialogueChoice, DialogueNode } from '../../../modules/contracts';
import {
  type Menue, dialog, erz, flag, geschenke, gespraech, herz, ich, knoten, nichtGetroffen, ort, pruefung, rede, sammle,
  sprecher, weg, weltfigur, zurueck,
} from './_welt';
import { akt23 } from './opa-gurrmann-akt23';

const ID = 'opa-gurrmann';
const G = sprecher(ID);
const Z = zurueck('Noch was, Opa.', 'Gurr gurr.');

const choices: DialogueChoice[] = [
  {
    text: 'Paket von den Schrapnell-Kurieren. Es gurrt.', tag: '[Kurier]', when: { flag: 'vex_paket_gurrmann' }, next: 'paket',
    effects: [flag('vex_paket_gurrmann', false), { credits: 25 }, herz('vex-schrapnell', 15), herz(ID, 10), { xp: 15 }],
  },
  {
    text: 'Einen Brief per Taubendrohne verschicken.', tag: '[Taubenpost]', next: 'post',
    effects: [{ minigame: 'akt-taubenpost', level: 1, key: 'taubenpost', label: 'Taubendrohnen-Post' }],
  },
  { text: 'Wie funktionieren die Taubendrohnen?', once: true, id: 'g-technik', next: 'technik' },
  { text: 'Kennst du die Kuriere oben am Funkmast?', tag: '[Gurrmann ♥3]', requires: { hearts: ID, min: 3 }, once: true, id: 'g-funkmast', next: 'funkmast' },
  { text: 'Gurr gurr.' },
];

const nodes: DialogueNode[] = [
  knoten('paket', [
    erz('Opa Gurrmann reißt das Panzertape auf. Drinnen sitzt eine Taube. Eine echte. Aus Federn. Sie guckt beleidigt.'),
    G('Erna! Da bist du ja! Die war drei Wochen in der Oberstadt. Ist einem Lieferwagen hinterhergeflogen. Hat sich verliebt. In den Lieferwagen.'),
    G('Hier, fünfundzwanzig. Und grüß die Schrapnell. Sag ihr, sie soll mal wieder hochkommen. Die Tauben fragen nach ihr.'),
  ], { choices: Z }),
  knoten('post', [G('Ich schick sie los. Wenn sie nicht ankommt, hat sie unterwegs jemanden kennengelernt. Das passiert.')]),
  knoten('technik', [
    G('Halb Taube, halb Drohne. Federn außen, Rotor innen. Die Rotoren sind von Dexter. Die Federn sind von echten Tauben. Die Tauben sind einverstanden. Ich hab sie gefragt.'),
    G('Sie finden jeden, den du schon mal getroffen hast. Riechen dich. Am Herz. Oder am Deo, ich bin mir nicht ganz sicher.'),
  ], { choices: Z }),
  knoten('funkmast', [
    G('Die Kuriere? Die sitzen da oben, wenn’s ihnen schlecht geht. Hängen Armbänder an die Streben. Für die, die nicht mehr rennen.'),
    G('Die Schrapnell sitzt oft da. Allein. Ich schick ihr dann Erna hoch. Erna setzt sich auf ihren Metallarm. Das hilft. Glaub ich.'),
  ], { choices: Z, effects: [herz(ID, 20)] }),
];

const M: Menue = { zeile: G('Gurr? Ich meine: Noch was?'), choices, nodes };

const T = {
  rivale: dialog('gurrmann-tag-rivale', [knoten('start', [G('Die Tauben mögen dich nicht.'), G('Und ich mag, was die Tauben mögen.')])]),
  erstes: gespraech('gurrmann-tag-erstes', [
    erz('Ein Taubenschlag aus Wellblech und Antennen. Davor ein alter Mann mit Federn im Bart, auf jeder Schulter eine Taube. Eine davon hat einen Rotor.'),
    G('Gurr. Oh, Verzeihung. Berufskrankheit. Gurrmann, Taubendrohnen-Post. Briefe, Päckchen, Liebesgrüße. Fliegt überallhin, wo kein Dach zu hoch ist.'),
  ], M),
  paket: gespraech('gurrmann-tag-paket', [
    G('Ich hör was gurren. In deiner Tasche. Hast du mir was mitgebracht? Ist es Erna? Sag, dass es Erna ist.'),
  ], M),
  standard: gespraech('gurrmann-tag-standard', [G('Gurr. Guten Tag. Die Tauben sagen, heute wird’s windig. Die Drohnen sagen, heute wird’s Smog. Ich sag: beides.')], M),
};

/** ♥2: Eine Taubendrohne hängt am Funkmast fest. */
const he2 = dialog('he-opa-gurrmann-2', [
  knoten('start', [
    erz('Opa Gurrmann zeigt nach oben. Ganz oben am Funkmast zappelt eine Taubendrohne in einem Kabelgewirr. Der Rotor brummt hilflos.'),
    G('Das ist Horst. Horst ist dumm. Horst ist mein Liebling. Holst du ihn runter? Meine Knie sind älter als die Antenne.'),
  ], {
    choices: [
      { text: 'Die Leiter hoch und Horst befreien.', tag: '[Reflexe 4]', check: pruefung('he-gurrmann-2-klettern', 'reflexe', 4, ['klettern']), next: 'klettern' },
      { text: 'Horsts Rotor per Fernsteuerung umpolen, damit er sich rausdreht.', tag: '[Technik 4]', check: pruefung('he-gurrmann-2-technik', 'technik', 4), next: 'technik' },
      { text: 'Mit einem Brotkrumen locken.', next: 'brot' },
    ],
  }),
  knoten('klettern', [erz('Rost unter den Fingern, Wind im Gesicht. Horst pickt dir zum Dank ins Ohr. Unten applaudiert Opa Gurrmann. Die Tauben auch, irgendwie.')], { next: 'ende', effects: [herz(ID, 40), { xp: 40 }] }),
  knoten('technik', [erz('Der Rotor brummt rückwärts, Horst dreht sich aus dem Kabelsalat wie ein Korkenzieher und landet stolz auf Opas Kopf.')], { next: 'ende', effects: [herz(ID, 40), { xp: 40 }] }),
  knoten('brot', [
    erz('Du wedelst mit einem Brotkrumen. Horst reißt sich los, stürzt ab, fängt sich drei Meter über dem Boden und frisst dir das Brot aus der Hand. Samt Fingerkuppe.'),
    G('Siehste. Dumm, aber hungrig. Das reicht oft.'),
  ], { next: 'ende', effects: [herz(ID, 30), { xp: 25 }, { damage: 2 }] }),
  knoten('ende', [G('Danke. Hier, ein Brief ist ab jetzt gratis für dich. Jeden Tag einer. Sag’s nicht weiter, sonst schreibt mir die ganze Gasse Liebesbriefe.')], { effects: [flag('gurrmann_gratispost')] }),
]);

/** ♥4: Opa Gurrmann benennt eine Taube nach der Spielfigur. */
const he4 = dialog('he-opa-gurrmann-4', [
  knoten('start', [
    erz('Im Taubenschlag piepst es. In einem Nest aus Kabelresten sitzt ein Küken mit einem winzigen Rotor auf dem Rücken, so groß wie ein Fingerhut.'),
    G('Neugeboren. Halb, halb. Ich weiß selber nicht, wie das passiert ist. Dexter sagt, er war’s nicht. Dexter war’s.'),
    G('Ich will sie nach dir benennen. Wenn du erlaubst.'),
  ], {
    choices: [
      { text: '„Ich fühl mich geehrt. Sie heißt {name}.“', next: 'name' },
      { text: '„Nenn sie Nougatbombe. Die wird mal groß.“', next: 'nougat' },
      { text: '„Sie soll fliegen lernen. Ich zeig’s ihr.“', tag: '[Ausstrahlung 4]', check: pruefung('he-gurrmann-4-fliegen', 'ausstrahlung', 4), next: 'fliegen' },
    ],
  }),
  knoten('name', [G('{name}. Klingt nach einer, die ankommt.')], { next: 'ende', effects: [herz(ID, 50)] }),
  knoten('nougat', [G('Nougatbombe. Die Unterstadt wird sie lieben. Hunter wird sie hassen. Perfekt.')], { next: 'ende', effects: [herz(ID, 45)] }),
  knoten('fliegen', [
    erz('Du redest auf das Küken ein, wedelst mit den Armen wie ein Vollidiot. Das Küken sieht dich an, sieht die Welt an und hebt ab. Zehn Zentimeter. Dann landet es auf dem Kopf.'),
    G('Sie hat’s versucht. Mehr kann keiner.'),
  ], { next: 'ende', effects: [herz(ID, 60), { xp: 30 }] }),
  knoten('ende', [
    ich('Kommt sie zu mir, wenn ich einen Brief bekomme?'),
    G('Zu dir zuerst. Immer. Tauben vergessen nie, wer sie zuerst angeschaut hat.'),
  ], { effects: [{ xp: 50 }, flag('gurrmann_taube_benannt')] }),
]);

// Akt 2, Partynacht und Nachspiel: opa-gurrmann-akt23.ts.
const A23 = akt23(M);

const gurrmann = weltfigur({
  id: ID,
  name: 'Opa Gurrmann',
  unknownName: 'Alter Mann mit Tauben',
  faction: 'unterstadt',
  bio: 'Betreibt die Taubendrohnen-Post im Taubenschlag der Lötgassen: halb Taube, halb Drohne. Federn im Bart, gurrt aus Gewohnheit. Lieblingstauben: Erna (verliebt in Lieferwagen) und Horst (dumm).',
  gifts: geschenke({
    loves: ['drohnen-propeller', 'ersatz-rotor', 'brezel'],
    likes: ['zeitung-papier', 'synth-kaffee', 'postkarte-meer', 'kraeuter-gebaeck'],
    dislikes: ['magnet-stoerer', 'peilsender'],
    hates: ['waschpulver'],
  }),
  schedule: [ort('M,T,A', 'loetgassen', 'taubenschlag'), weg('N')],
  heartEvents: [
    { id: 'he-opa-gurrmann-2', hearts: 2, map: 'loetgassen', time: ['morgen', 'tag'], dialogue: 'he-opa-gurrmann-2' },
    { id: 'he-opa-gurrmann-4', hearts: 4, map: 'loetgassen', time: 'tag', when: { seen: 'he-opa-gurrmann-2' }, dialogue: 'he-opa-gurrmann-4' },
  ],
  talk: [
    rede('gurrmann-tag-rivale', { rival: ID }),
    rede('gurrmann-tag-erstes', nichtGetroffen(ID)),
    ...A23.talk,
    rede('gurrmann-tag-paket', { flag: 'vex_paket_gurrmann' }),
    rede('gurrmann-tag-standard'),
  ],
});

export const part: ContentPart = {
  npcs: { [ID]: gurrmann },
  dialogues: sammle(T.rivale, T.erstes, T.paket, T.standard, he2, he4, ...A23.dialogues),
};
