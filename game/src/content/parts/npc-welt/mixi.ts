// Mixi – Mixroboter der HV-Bar (world.md §4.5, side-neon-limo gc-71: nach der Reparatur redet er ununterbrochen).
import type { ContentPart } from '../../part';
import type { Condition, DialogueChoice, DialogueNode } from '../../../modules/contracts';
import {
  type Menue, dialog, erz, flag, geschenke, gespraech, herz, ich, knoten, ort, pruefung, rede, sammle, sprecher,
  weltfigur, zurueck,
} from './_welt';
import { akt23 } from './mixi-akt23';

const ID = 'mixi';
const X = sprecher(ID);
const Z = zurueck('Noch was, Mixi.', 'Danke, Mixi.');
const REPARIERT: Condition = { any: [{ quest: 'side-neon-limo', state: 'done' }, { flag: 'mixi_repariert' }] };

const choices: DialogueChoice[] = [
  { text: 'Mix mir was.', when: REPARIERT, next: 'mixen' },
  { text: 'Was erzählen die Gäste so?', tag: '[Mixi ♥2]', when: REPARIERT, requires: { hearts: ID, min: 2 }, next: 'klatsch' },
  { text: '(Gegen das Gehäuse klopfen.)', when: { not: REPARIERT }, next: 'klopfen' },
  { text: 'Danke, Mixi.' },
];

const nodes: DialogueNode[] = [
  knoten('mixen', [
    X('Natürlich! Sofort! Ich hab heute schon 341 Getränke gemischt und 340 davon waren perfekt, das eine war für Ripper, das hab ich absichtlich versalzen, sag’s keinem!'),
    erz('Ein Glas schießt aus der Klappe, randvoll mit etwas Leuchtendem. Es schmeckt nach Zitrone, Strom und guter Laune.'),
  ], { choices: Z, effects: [{ heal: 5 }] }),
  knoten('klatsch', [
    X('Oh, so viel! Der Richter hat letzten Donnerstag beim Eins! geschummelt, mit einer Karte im Ärmel, im ÄRMEL, der RICHTER!'),
    X('Und Hunter isst heimlich Nougatbomben, ich seh das, ich seh alles, ich hab sechs Kameras und kein Taktgefühl!'),
    X('Und der Barkeeper hat mal gelächelt. Am Dienstag. 21:14 Uhr. Ich hab’s gespeichert. Für die Ewigkeit.'),
  ], { choices: Z }),
  knoten('klopfen', [
    erz('Klong. Mixi spuckt eine Olive, dann ein Schirmchen, dann eine Wolke Kühlmittel.'),
    X('MI…X… FEHL…ER… GESCHMACKSMODUL… TRAURIG…'),
  ], { choices: Z }),
];

const M: Menue = { zeile: X('Noch was? Ich hab Zeit! Ich hab immer Zeit! Ich schlaf nie! Das ist das Schöne und das Schlimme!'), choices, nodes };

const T = {
  rivale: dialog('mixi-tag-rivale', [knoten('start', [X('Für dich: nur Leitungswasser.'), X('Lauwarm. Mit Kalk.')])]),
  kaputt: gespraech('mixi-tag-kaputt', [
    erz('Ein runder Mixroboter auf Schienen hinter der Bar, mit einem Bildschirmgesicht, das gerade ein trauriges Pixel zeigt.'),
    X('MIX… MIX… FEHLER 404: REZEPT NICHT GEFUNDEN… PIEP.'),
  ], M),
  standard: gespraech('mixi-tag-standard', [
    X('HALLO! HALLO HALLO! Schön, dass du da bist, ich hab dich vermisst, also nicht vermisst, ich hab keine Gefühle, aber ich hab deine letzte Bestellung gespeichert!'),
  ], M),
};

/** ♥2: Gemeinsam ein neues Getränk erfinden. */
const he2 = dialog('he-mixi-2', [
  knoten('start', [
    X('Ich will ein Getränk erfinden! Ein eigenes! Mit Namen! Hilf mir! Wähl drei Zutaten! Ich mag Entscheidungen, ich hab nur keine eigenen!'),
  ], {
    choices: [
      { text: 'Leuchtalge, Kanalminze und eine Prise Röstzwiebel.', next: 'wild' },
      { text: 'Synth-Kaffee, Nougat und Eis. Der „Hunter-Notfall“.', next: 'hunter' },
      { text: 'Die Mischung genau ausbalancieren.', tag: '[Technik 4]', check: pruefung('he-mixi-2-balance', 'technik', 4), next: 'balance' },
    ],
  }),
  knoten('wild', [X('Das ist … widerlich. Das ist großartig. Das nenne ich „Kanalkuss“. Bürgermeister Gully wird ihn lieben!')], { next: 'ende', effects: [herz(ID, 35)] }),
  knoten('hunter', [X('Der Hunter-Notfall! Ich stell ihn unter den Tresen, neben die geheime Nougatkiste, von der ich nichts weiß!')], { next: 'ende', effects: [herz(ID, 40)] }),
  knoten('balance', [X('Perfekte Balance! 33,3 Prozent von allem! Ich nenne ihn nach dir! „{name} auf Eis“!')], { next: 'ende', effects: [herz(ID, 50), { xp: 30 }] }),
  knoten('ende', [ich('Und wer trinkt das jetzt?'), X('Du! Erster Schluck ist gratis! Zweiter auch! Dritter kostet deine Würde!')], { effects: [{ give: 'neon-limo' }, { xp: 30 }] }),
]);

/** ♥4: Mixi verrät ein Gerücht, das sonst keiner hat. */
const he4 = dialog('he-mixi-4', [
  knoten('start', [
    erz('Nach Ladenschluss. Mixi rollt auf seinen Schienen zu dir und senkt die Stimme. Für seine Verhältnisse. Er ist immer noch so laut wie ein Föhn.'),
    X('Psst! Psst! Ich hab was gehört! Am Ecktisch! Ripper und ein Mann mit Kralle! Sie haben über „Container 77“ geredet und über „Dienstag“ und über „die Teile“!'),
  ], {
    choices: [
      { text: '„Hast du das aufgenommen?“', tag: '[Technik 5]', check: pruefung('he-mixi-4-aufnahme', 'technik', 5), next: 'aufnahme' },
      { text: '„Danke, Mixi. Du bist der beste Spion der Unterstadt.“', next: 'spion' },
    ],
  }),
  knoten('aufnahme', [
    X('Natürlich! Ich nehm ALLES auf! Hier, ich brenn’s dir auf einen Kristall! Ich bin so aufgeregt, ich hab gerade aus Versehen einen Espresso gemacht!'),
  ], { next: 'ende', effects: [herz(ID, 50), { give: 'exklusiv-tipp' }, flag('mixi_aufnahme_container')] }),
  knoten('spion', [X('Spion! Ich bin ein SPION! Das sag ich jedem! Nein! Das sag ich keinem! Das ist ja der Witz!')], { next: 'ende', effects: [herz(ID, 40)] }),
  knoten('ende', [X('Du bist mein Lieblingsgast. Nicht weitersagen. Hunter denkt, er ist es.')], { effects: [{ xp: 50 }] }),
]);

// Akt 2, Partynacht und Nachspiel: mixi-akt23.ts.
const A23 = akt23(M, REPARIERT);

const mixi = weltfigur({
  id: ID,
  name: 'Mixi',
  unknownName: 'Mixroboter',
  faction: 'crew-hunter',
  bio: 'Mixroboter der HV-Bar auf Schienen, Bildschirmgesicht. Kaputt bis zur Reparatur in „Hunters Spezial“, danach redet er ununterbrochen und sieht mit sechs Kameras alles.',
  gifts: geschenke({
    loves: ['kuehlmittel-mocktail', 'oelkaennchen', 'neon-limo'],
    likes: ['reparaturset', 'datenkristall', 'katzenvideo-archiv'],
    dislikes: ['waschpulver', 'echtobst-apfel'],
    hates: ['magnet-stoerer'],
  }),
  schedule: [ort('*', 'high-voltage', 'mixi-ecke')],
  heartEvents: [
    { id: 'he-mixi-2', hearts: 2, map: 'high-voltage', time: ['abend', 'nacht'], when: REPARIERT, dialogue: 'he-mixi-2' },
    { id: 'he-mixi-4', hearts: 4, map: 'high-voltage', time: 'nacht', when: { all: [REPARIERT, { seen: 'he-mixi-2' }] }, dialogue: 'he-mixi-4' },
  ],
  talk: [
    rede('mixi-tag-rivale', { rival: ID }),
    rede('mixi-tag-kaputt', { not: REPARIERT }),
    ...A23.talk,
    rede('mixi-tag-standard'),
  ],
});

export const part: ContentPart = {
  npcs: { [ID]: mixi },
  dialogues: sammle(T.rivale, T.kaputt, T.standard, he2, he4, ...A23.dialogues),
};

