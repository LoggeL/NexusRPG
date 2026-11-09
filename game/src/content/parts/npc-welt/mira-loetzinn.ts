// Mira Lötzinn – Händlerin für Neu-Cyberware und Schrauberin in den Lötgassen (world.md §4.5, §2.6, Shop loetzinn-laden).
import type { ContentPart } from '../../part';
import type { DialogueChoice, DialogueNode } from '../../../modules/contracts';
import {
  type Menue, dialog, erz, flag, geschenke, gespraech, herz, ich, knoten, nichtGetroffen, ort, pruefung, rede, sammle,
  sprecher, weg, weltfigur, zurueck,
} from './_welt';
import { akt23 } from './mira-loetzinn-akt23';

const ID = 'mira-loetzinn';
const M_ = sprecher(ID);
const Z = zurueck('Noch eine Frage.', 'Danke, Mira.');

const choices: DialogueChoice[] = [
  { text: 'Zeig mir deine Ware.', next: 'laden', effects: [{ shop: 'loetzinn-laden' }] },
  { text: 'Was unterscheidet dich von Ripper?', once: true, id: 'm-ripper', next: 'ripper' },
  { text: 'Woher kriegst du Neuteile, hier unten?', tag: '[Mira ♥2]', requires: { hearts: ID, min: 2 }, once: true, id: 'm-quelle', next: 'quelle' },
  { text: '„Zentratoren mit Rückkopplungsschutz – führst du die?“', tag: '[Schrott]', when: { origin: 'origin-schrott' }, once: true, id: 'm-schrott', next: 'schrott' },
  { text: 'Danke, Mira.' },
];

const nodes: DialogueNode[] = [
  knoten('laden', [M_('Fass nichts an, was blinkt. Was blinkt, ist entweder teuer oder geladen. Meistens beides.')]),
  knoten('ripper', [
    M_('Ripper verkauft dir Teile, die schon in drei Leuten gesteckt haben. Mit Macke. Mit Geschichte. Mit Restblut.'),
    M_('Ich verkauf Neuteile. Versiegelt. Mit Garantie. Die Garantie bin ich. Wenn was kaputtgeht, komm ich zu dir und schrei das Teil an, bis es wieder geht.'),
    M_('Achtzig Credits Einbau. Dafür wachst du nicht mit einem Arm auf, der nachts salutiert.'),
  ], { choices: Z }),
  knoten('quelle', [
    M_('Restposten. Konkurs-Auktionen im Mittelring. Und manchmal steht nachts eine Kiste vor meinem Tor, ohne Absender. Die Schrapnell-Kuriere liefern. Ich frag nicht.'),
    M_('Wer in den Lötgassen zu viel fragt, kriegt Lötzinn in die Ohren. Nicht von mir. Von den Gassen.'),
  ], { choices: Z, effects: [herz(ID, 20)] }),
  knoten('schrott', [
    M_('Du kennst Rückkopplungsschutz? Kein Mensch kennt Rückkopplungsschutz. Kein Mensch AUSSER MIR.'),
    M_('Setz dich. Willst du Tee? Ich hab keinen Tee. Ich hab Kühlmittel. Ist fast dasselbe.'),
  ], { choices: Z, effects: [herz(ID, 60)] }),
];

const M: Menue = { zeile: M_('Noch was? Ich hab einen Kunden mit halbem Gesicht auf der Liege.'), choices, nodes };

const T = {
  rivale: dialog('mira-tag-rivale', [knoten('start', [M_('Für dich ist heute Inventur.'), M_('Morgen auch. Und übermorgen.')])]),
  erstes: gespraech('mira-tag-erstes', [
    erz('Hinter einer Theke aus Panzerglas, darunter Augen in Gläsern, Finger in Schaumstoff, ein Arm in einer Vitrine wie ein Schmuckstück. Eine Frau mit Lupenbrille und verbrannten Fingerspitzen schaut nicht auf.'),
    M_('Mira Lötzinn. Neuteile, versiegelt, Garantie. Gebrauchtware gibt’s bei Ripper, Krankheiten auch.'),
    M_('Du hast saubere Ports. Gut. Lass das so.'),
  ], M),
  morgen: gespraech('mira-tag-morgen', [
    erz('Mira lötet mit einer Hand und trinkt mit der anderen etwas Dampfendes aus einem Becher mit der Aufschrift „ICH HAB KEINE ZEIT“.'),
    M_('Morgens kalibrier ich. Wer morgens kommt, kriegt kalibrierte Laune. Also schlechte.'),
  ], M),
  vertraut: gespraech('mira-tag-vertraut', [M_('Ah. Du. Gut. Dich darf ich anschreien, wenn was nicht funktioniert. Das ist bei mir Zuneigung.')], M),
  standard: gespraech('mira-tag-standard', [M_('Was brauchst du? Und sag nicht „irgendwas Billiges“. Billig ist bei Ripper.')], M),
};

/** ♥2: Ein frisches Implantat kalibrieren helfen. */
const he2 = dialog('he-mira-loetzinn-2', [
  knoten('start', [
    erz('Auf der Liege sitzt ein Hafenarbeiter mit einem neuen Auge, das in alle Richtungen gleichzeitig schaut. Mira flucht.'),
    M_('Du. Halt das hier. Und dreh das Rädchen, wenn ich „jetzt“ sag. Nicht vorher. Nicht danach. JETZT ist ein Zeitpunkt, kein Gefühl.'),
  ], {
    choices: [
      { text: 'Im richtigen Moment drehen.', tag: '[Technik 4]', check: pruefung('he-mira-2-kalibrieren', 'technik', 4), next: 'gut' },
      { text: 'Mit ruhiger Hand halten und abwarten.', tag: '[Reflexe 4]', check: pruefung('he-mira-2-ruhig', 'reflexe', 4), next: 'gut' },
      { text: 'Einfach drehen, wenn es sich richtig anfühlt.', next: 'gefuehl' },
    ],
  }),
  knoten('gut', [
    erz('Klick. Das Auge schnurrt und schaut geradeaus. Der Hafenarbeiter weint, aber nur mit einem Auge. Dem alten.'),
    M_('Sauber. Hm. Sauber.'),
  ], { next: 'ende', effects: [herz(ID, 40), { xp: 40 }] }),
  knoten('gefuehl', [
    erz('Das Auge dreht sich einmal komplett um, schaut in den Kopf des Hafenarbeiters und kommt wieder nach vorne. Er sagt, er hat sein Gehirn gesehen. Es war kleiner als gedacht.'),
    M_('Gefühl. GEFÜHL. … Funktioniert trotzdem. Das ist das Schlimmste daran.'),
  ], { next: 'ende', effects: [herz(ID, 25), { xp: 20 }] }),
  knoten('ende', [M_('Hier. Zwei Dietrich-Chips. Nicht als Dank. Als Werbung. Erzähl rum, wo du die herhast.')], { effects: [{ give: 'dietrich-chip', qty: 2 }] }),
]);

/** ♥4: Mira zeigt ihren Prototyp aus Digitech-Zeiten. */
const he4 = dialog('he-mira-loetzinn-4', [
  knoten('start', [
    erz('Nach Ladenschluss holt Mira eine Kiste unter der Theke hervor. Darin: eine Hand aus mattem Kupfer, filigran, mit Gravuren. Jedes Gelenk ein kleines Kunstwerk.'),
    M_('Mein Gesellenstück. Digitech, 2079. Ich war die Jüngste in der Feinmechanik.'),
    M_('Dann kam Quantum, Digitech ging pleite, und auf einmal wollte keiner mehr Hände, die schön sind. Nur noch Hände, die billig sind.'),
  ], {
    choices: [
      { text: '„Die ist wunderschön. Warum verkaufst du sowas nicht?“', next: 'warum' },
      { text: '„Warum war in der Digitech-Nacht keiner da? Weißt du was?“', tag: '[Straße 5]', check: pruefung('he-mira-4-nacht', 'strasse', 5), next: 'nacht' },
      { text: 'Die Gravuren genau ansehen.', tag: '[Technik 5]', check: pruefung('he-mira-4-gravur', 'technik', 5), next: 'gravur' },
    ],
  }),
  knoten('warum', [M_('Weil hier keiner zweitausend Credits für eine Hand hat. Und weil ich sie nicht hergeben will. Das ist der ehrlichere Grund.')], { next: 'ende', effects: [herz(ID, 40)] }),
  knoten('nacht', [
    M_('Die Wachen wurden abgezogen. Eine Stunde vorher. Befehl vom Nachtschichtleiter. Ein Typ mit einer Kralle statt Hand. Hab ich nur gehört. Von einer, die da war.', 'besorgt'),
    M_('Sag nicht, dass du’s von mir hast. Ich will weiter in Ruhe löten.'),
  ], { next: 'ende', effects: [herz(ID, 50), flag('mira_digitech_hinweis')] }),
  knoten('gravur', [
    erz('Zwischen den Ornamenten, winzig: „Für M. – Du kannst mehr als Schrauben. A. Z.“'),
    M_('Meine Ausbilderin. Ist jetzt bei Quantum. Ganz oben. Ich red nicht drüber.', 'trauer'),
  ], { next: 'ende', effects: [herz(ID, 50), flag('mira_alesa_ausbilderin')] }),
  knoten('ende', [
    ich('Danke, dass du sie mir gezeigt hast.'),
    M_('Hm. Ab jetzt baue ich dir Teile ein, ohne dabei zu fluchen. Fast ohne.'),
  ], { effects: [{ xp: 60 }, flag('mira_stammkunde')] }),
]);

// Akt 2, Partynacht und Nachspiel: mira-loetzinn-akt23.ts.
const A23 = akt23(M);

const mira = weltfigur({
  id: ID,
  name: 'Mira Lötzinn',
  unknownName: 'Frau mit Lupenbrille',
  faction: 'unterstadt',
  bio: 'Händlerin für Neu-Cyberware und Schrauberin in den Lötgassen (80 Cr Einbau). Lupenbrille, verbrannte Fingerspitzen, ehemals Digitech-Feinmechanik. Hält Ripper für eine wandelnde Infektion.',
  gifts: geschenke({
    loves: ['loetkolben-gold', 'pinzetten-set', 'alter-neurochip'],
    likes: ['synth-kaffee', 'datenkristall', 'retro-tastatur', 'kuehlmittel-mocktail'],
    dislikes: ['glitzerschrott', 'parfuem-ozon'],
    hates: ['seltenes-implantat', 'defekter-neurochip'],
  }),
  schedule: [ort('M,T,A', 'loetzinn-laden', 'theke'), weg('N')],
  heartEvents: [
    { id: 'he-mira-loetzinn-2', hearts: 2, map: 'loetzinn-laden', time: 'tag', dialogue: 'he-mira-loetzinn-2' },
    { id: 'he-mira-loetzinn-4', hearts: 4, map: 'loetzinn-laden', time: 'abend', when: { seen: 'he-mira-loetzinn-2' }, dialogue: 'he-mira-loetzinn-4' },
  ],
  talk: [
    rede('mira-tag-rivale', { rival: ID }),
    rede('mira-tag-erstes', nichtGetroffen(ID)),
    ...A23.talk,
    rede('mira-tag-vertraut', undefined, 4),
    rede('mira-tag-morgen', { time: 'morgen' }),
    rede('mira-tag-standard'),
  ],
});

export const part: ContentPart = {
  npcs: { [ID]: mira },
  dialogues: sammle(T.rivale, T.erstes, T.morgen, T.vertraut, T.standard, he2, he4, ...A23.dialogues),
};
