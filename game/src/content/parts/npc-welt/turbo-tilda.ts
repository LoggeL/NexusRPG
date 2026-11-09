// Turbo-Tilda – Drohnenrenn-Champion der Hafenkante (world.md §4.5). Gegnerin in side-drohnenrennen (quest-side-b,
// Rennen am Hotspot dr-rennen, Freitag abends an den Rostkai-Kränen); tagsüber an ihrer Box.
import type { ContentPart } from '../../part';
import type { DialogueChoice, DialogueNode } from '../../../modules/contracts';
import {
  type Menue, dialog, erz, flag, geschenke, gespraech, herz, ich, knoten, nichtGetroffen, ort, pruefung, rede, sammle,
  sprecher, weg, weltfigur, zurueck,
} from './_welt';

const ID = 'turbo-tilda';
const QUEST = 'side-drohnenrennen';
const T_ = sprecher(ID);
const Z = zurueck('Noch was, Champ.', 'Wir sehen uns auf der Strecke.');

const choices: DialogueChoice[] = [
  { text: 'Wie wird man Drohnenrenn-Champion?', once: true, id: 't-champ', next: 'champ' },
  { text: 'Zeig mir deine Drohne.', next: 'drohne' },
  {
    text: 'Eine Trainingsrunde gegen dich fliegen.', tag: '[Drohnenrennen]', when: { quest: QUEST, state: 'done' }, next: 'training',
    effects: [{
      minigame: 'akt-drohnenrennen', level: 2, key: 'tilda-training', label: 'Training gegen Turbo-Tilda',
      win: [herz(ID, 10), { xp: 20 }, { message: 'Tilda: „Nicht schlecht. Morgen fliege ich mit der linken Hand.“' }],
      lose: [{ message: 'Tilda: „Zu früh gebremst. Bremsen ist was für Leute mit Zukunftsplänen.“' }],
    }],
  },
  { text: '„Hast du je verloren?“', tag: '[Tilda ♥3]', requires: { hearts: ID, min: 3 }, once: true, id: 't-verloren', next: 'verloren' },
  { text: 'Wir sehen uns auf der Strecke.' },
];

const nodes: DialogueNode[] = [
  knoten('champ', [
    T_('Mit zwölf hab ich einen Toaster an einen Rasenmähermotor geschraubt. Er ist geflogen. Drei Sekunden. Dann hat er die Garage angezündet.'),
    T_('Seitdem gewinne ich. Mit fünfzehn hab ich Dexter geschlagen. Er hat geheult. Er sagt, es war Heuschnupfen. Im Hafen gibt es kein Heu.'),
  ], { choices: Z }),
  knoten('drohne', [
    erz('Tilda zieht eine Plane weg. Darunter: eine Renndrohne, flach wie ein Rochen, lackiert in Flammen. Auf dem Rumpf steht „OMA“.'),
    T_('„Oma“. Weil sie alt ist, laut und keinen Respekt vor anderen hat. Wie meine Oma.'),
  ], { choices: Z }),
  knoten('training', [T_('Los geht’s. Und wehe, du lässt mich gewinnen. Dann fliege ich dir in den Hinterkopf.')]),
  knoten('verloren', [
    T_('Einmal. Gegen Kas Schrapnell. Vor Jahren. Er ist gar keine Drohne geflogen. Er ist die Strecke zu Fuß gerannt, über die Kräne. Und war schneller.'),
    T_('Das zählt nicht, hab ich gesagt. Er hat gelacht. Ich hab mitgelacht. Wir haben die ganze Nacht gelacht. Vor zwei Jahren ist er gefallen. Über der Neon-Gasse.'),
  ], { choices: Z, effects: [herz(ID, 25)] }),
];

const M: Menue = { zeile: T_('Noch was? Mach schnell, ich hab Rotoren zu wuchten.'), choices, nodes };

const T = {
  rivale: dialog('tilda-tag-rivale', [knoten('start', [T_('Du willst reden? Gewinn erst mal ein Rennen.'), T_('Oder geh heim und flieg mit deinem Kühlschrank, du Bruchpilot.')])]),
  erstes: gespraech('tilda-tag-erstes', [
    erz('In einer Garage aus Wellblech, zwischen Rotoren und Lötdämpfen, sitzt eine Frau in Overall und Fliegerbrille. Ihre Unterarme sind voller Pokale-Tattoos.'),
    T_('Turbo-Tilda. Vierfache Rostkai-Meisterin. Fünffach, wenn man das Rennen mitzählt, bei dem alle anderen abgestürzt sind. Ich zähl es mit.'),
  ], M),
  rennen: gespraech('tilda-tag-rennen', [
    erz('An den Rostkai-Kränen wimmelt es. Drohnen summen wie Hornissen. Tilda steht auf einem Container und reckt die Faust. Die Menge brüllt.'),
    T_('Freitagabend, Baby! Wer mich heute schlägt, kriegt meinen Respekt. Und eine Schallplatte. Der Respekt ist mehr wert.'),
  ], M),
  besiegt: gespraech('tilda-tag-besiegt', [T_('Da ist sie ja. Die Person, die meinen Pokalschrank ruiniert hat. Ich hab einen Platz frei gemacht. Für die Revanche.')], M),
  standard: gespraech('tilda-tag-standard', [T_('Na, Nachwuchspilot? Brauchst du einen Rat? Hier ist einer: Nicht gegen Kräne fliegen.')], M),
};

/** ♥2: Tilda testet einen neuen Motor – und braucht eine zweite Hand. */
const he2 = dialog('he-turbo-tilda-2', [
  knoten('start', [
    erz('Tilda hat „Oma“ auf eine Werkbank geschraubt. Der neue Motor heult wie ein Jet. Die Werkbank fängt an zu wandern.'),
    T_('Halt die Bank! Halt sie fest! Und lies mir die Drehzahl vor! WENN SIE ÜBER ZWÖLFTAUSEND GEHT, SCHREI!'),
  ], {
    choices: [
      { text: 'Die Bank mit dem ganzen Körper festhalten.', tag: '[Körper 4]', check: pruefung('he-tilda-2-bank', 'koerper', 4, ['kraft']), next: 'gehalten' },
      { text: 'Die Drehzahl ablesen und im richtigen Moment schreien.', tag: '[Technik 4]', check: pruefung('he-tilda-2-drehzahl', 'technik', 4, ['drohne']), next: 'gehalten' },
      { text: 'Den Stecker ziehen.', next: 'stecker' },
    ],
  }),
  knoten('gehalten', [erz('Zwölftausend. Dreizehntausend. Tilda dreht ab. Stille. Ihre Fliegerbrille ist voller Ruß. Sie grinst wie ein Kind an Weihnachten.')], { next: 'ende', effects: [herz(ID, 45), { xp: 40 }] }),
  knoten('stecker', [erz('Stille. Die Werkbank bleibt stehen, einen halben Meter weiter als vorher. Tilda starrt dich an.'), T_('Du hast … meinen Test … abgebrochen. … Gute Entscheidung. Er wär explodiert.')], { next: 'ende', effects: [herz(ID, 35), { xp: 30 }] }),
  knoten('ende', [T_('Du hast Nerven. Ich mag Leute mit Nerven. Und mit Händen. Du hast beides.')], { effects: [flag('tilda_mechaniker')] }),
]);

/** ♥4: Tilda fliegt für Kas. */
const he4 = dialog('he-turbo-tilda-4', [
  knoten('start', [
    erz('Nacht über den Rostkai-Kränen. Tilda steht ganz oben auf einem Ausleger, die Drohne in der Hand. Neben ihr: ein Bündel Kurierarmbänder, verblichen.'),
    T_('Kas’ Todestag. Ich flieg seine Strecke. Die über die Kräne. Mit der Drohne. Einmal im Jahr. Damit jemand die Strecke noch kennt.'),
    T_('Flieg mit. Oder lauf. Wie er.'),
  ], {
    choices: [
      { text: 'Die Strecke zu Fuß laufen, über die Kräne, wie Kas.', tag: '[Reflexe 5]', check: pruefung('he-tilda-4-laufen', 'reflexe', 5, ['dach', 'springen']), next: 'gelaufen' },
      { text: 'Neben ihr sitzen bleiben und zusehen.', next: 'zusehen' },
      { text: '„Vex sollte hier sein.“', when: { met: 'vex-schrapnell' }, next: 'vex' },
    ],
  }),
  knoten('gelaufen', [erz('Kran zu Kran, Ausleger zu Ausleger, die Drohne summt neben dir. Am letzten Kran bleibst du stehen. Tilda landet die Drohne neben deinen Füßen. Sie weint und lacht.')], { next: 'ende', effects: [herz(ID, 60), { xp: 30 }] }),
  knoten('zusehen', [erz('Die Drohne zieht eine Lichtspur über den Hafen. Unten bleiben Hafenarbeiter stehen und nehmen die Mützen ab. Sie wissen, wer heute fliegt.')], { next: 'ende', effects: [herz(ID, 50)] }),
  knoten('vex', [T_('Seine kleine Schwester? Die kommt nie mit. Sie sagt, sie hasst Gedenkzeug. Aber jedes Jahr hängt am nächsten Morgen ein neues Armband am Funkmast.'), T_('Sag ihr nichts. Sie weiß, dass ich’s weiß.')], { next: 'ende', effects: [herz(ID, 55), flag('tilda_vex_armband')] }),
  knoten('ende', [
    ich('Kas wäre stolz.'),
    T_('Kas wäre sauer, dass ich immer noch langsamer bin als er. Und dann stolz. In der Reihenfolge.'),
  ], { effects: [{ xp: 60 }] }),
]);

const tilda = weltfigur({
  id: ID,
  name: 'Turbo-Tilda',
  unknownName: 'Frau mit Fliegerbrille',
  faction: 'unterstadt',
  bio: 'Drohnenrenn-Champion der Hafenkante, vierfache Rostkai-Meisterin. Overall, Fliegerbrille, Pokal-Tattoos. Ihre Renndrohne heißt „Oma“. Kannte Kas Schrapnell, Vex’ verstorbenen Bruder.',
  gifts: geschenke({
    loves: ['drohnen-propeller', 'ersatz-rotor', 'schweissbrille-gelb'],
    likes: ['volt-limo', 'oelkaennchen', 'synth-kaffee', 'stickerbogen'],
    dislikes: ['haiku-buechlein', 'seidentuch-rot'],
    hates: ['magnet-stoerer', 'peilsender'],
  }),
  schedule: [
    ort('A', 'hafenkante', 'rostkai-kraene', { days: ['fr'] }),
    ort('T', 'hafenkante', 'tildas-box'),
    weg(),
  ],
  heartEvents: [
    { id: 'he-turbo-tilda-2', hearts: 2, map: 'hafenkante', time: 'tag', dialogue: 'he-turbo-tilda-2' },
    { id: 'he-turbo-tilda-4', hearts: 4, map: 'hafenkante', time: ['abend', 'nacht'], when: { seen: 'he-turbo-tilda-2' }, dialogue: 'he-turbo-tilda-4' },
  ],
  talk: [
    rede('tilda-tag-rivale', { rival: ID }),
    rede('tilda-tag-erstes', nichtGetroffen(ID)),
    rede('tilda-tag-rennen', { all: [{ weekday: 'fr' }, { time: 'abend' }] }),
    rede('tilda-tag-besiegt', { quest: QUEST, state: 'done' }),
    rede('tilda-tag-standard'),
  ],
});

export const part: ContentPart = {
  npcs: { [ID]: tilda },
  dialogues: sammle(T.rivale, T.erstes, T.rennen, T.besiegt, T.standard, he2, he4),
};
