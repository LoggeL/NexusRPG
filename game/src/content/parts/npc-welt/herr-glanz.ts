// Herr Glanz – Verkäufer im Quantum-Schauraum, Glasarkaden (world.md §4.5, Shop quantum-schauraum).
// Neben ihm schwebt das Nexus-Hologramm (Hintergrundfigur ki-nexus, siehe ki-nexus.ts).
import type { ContentPart } from '../../part';
import type { DialogueChoice, DialogueNode } from '../../../modules/contracts';
import {
  type Menue, dialog, erz, flag, geschenke, gespraech, herz, ich, knoten, nichtGetroffen, ort, pruefung, rede, sammle,
  sprecher, weg, weltfigur, zurueck,
} from './_welt';
import { TALK_23, SCHEDULE_23 } from './herr-glanz-akt23';

const ID = 'herr-glanz';
const G = sprecher(ID);
const Z = zurueck('Noch eine Frage, Herr Glanz.', 'Ich komme wieder. Vielleicht.');

const choices: DialogueChoice[] = [
  { text: 'Zeigen Sie mir das Sortiment.', next: 'laden', effects: [{ shop: 'quantum-schauraum' }] },
  { text: 'Was ist das für ein Hologramm?', once: true, id: 'gl-holo', next: 'holo' },
  { text: '„Wie viel kriegen Sie pro verkauftem Implantat?“', tag: '[Straße 4]', check: pruefung('glanz-provision', 'strasse', 4, ['verhandeln']), once: true, id: 'gl-provision', next: 'provision' },
  { text: 'Ich komme wieder. Vielleicht.' },
];

const nodes: DialogueNode[] = [
  knoten('laden', [G('Die Zukunft, in Vitrinen. Alles mit Quantum-Garantie. Die Garantie gilt, solange Quantum existiert. Also für immer. Wir haben das geprüft. Intern.')]),
  knoten('holo', [
    G('Das? Das ist Nexus. Der Assistent der Zukunft. Er beantwortet Fragen, plant Ihren Tag, kennt Ihre Wünsche, bevor Sie sie haben.'),
    erz('Das Hologramm dreht sich zu dir. Es lächelt. Es hat dich schon vorher angesehen.'),
    G('Er mag Sie. Er mag alle. Das ist sein Job. Wie bei mir. Nur, dass er es ernst meint.'),
  ], { choices: Z }),
  knoten('provision', [
    G('Provision? Ich bitte Sie. Ich verkaufe aus Überzeugung.'),
    G('… Zwei Prozent. Und einen Gutschein für die Kantine. Die Kantine ist geschlossen. Seit zwei Jahren. Die Gutscheine werden trotzdem ausgegeben.'),
  ], { choices: Z, effects: [herz(ID, 15)] }),
];

const M: Menue = { zeile: G('Darf es noch etwas sein? Ein Lächeln vielleicht? Das kostet nichts. Noch nicht.'), choices, nodes };

const T = {
  rivale: dialog('glanz-tag-rivale', [knoten('start', [G('Für Sie ist der Schauraum geschlossen.'), G('Die Security begleitet Sie gern. Die Security mag es, Leute zu begleiten. Sehr.')])]),
  erstes: gespraech('glanz-tag-erstes', [
    erz('Ein Raum aus weißem Licht. Implantate schweben in Glassäulen wie Juwelen. In der Mitte dreht sich ein riesiges Hologramm mit sanftem Gesicht. Davor ein Mann im silbernen Anzug mit Zähnen, die heller sind als die Beleuchtung.'),
    G('Willkommen bei Quantum! Ich bin Herr Glanz, Ihr persönlicher Zukunftsberater. Was darf ich Ihnen heute verbessern?'),
  ], M),
  standard: gespraech('glanz-tag-standard', [G('Ah, wieder da! Unsere Daten sagten, dass Sie wiederkommen. Unsere Daten haben immer recht. Fast immer. Meistens.')], M),
  vertraut: gespraech('glanz-tag-vertraut', [G('Sie! Wie schön. Sie sind der einzige Kunde, bei dem ich nicht lächeln muss. Ich lächle trotzdem. Reflex.')], M),
};

/** ♥2: Herr Glanz muss eine Präsentation halten – und hat Lampenfieber. */
const he2 = dialog('he-herr-glanz-2', [
  knoten('start', [
    erz('Herr Glanz steht hinter einem Vorhang und zittert. Draußen warten zwanzig Oberstädter auf die Vorstellung des „Quantum-Herzschrittmacher Plus“.'),
    G('Ich kann das nicht. Ich hab das Skript vergessen. Ich hab vergessen, was ein Herz ist. Nexus soll es präsentieren, aber Nexus hat heute Wartung.'),
  ], {
    choices: [
      { text: 'Ihn mit einer kurzen Ansprache aufbauen.', tag: '[Ausstrahlung 4]', check: pruefung('he-glanz-2-mut', 'ausstrahlung', 4, ['trost']), next: 'mut' },
      { text: 'Hinter dem Vorhang das Skript einflüstern.', tag: '[Technik 4]', check: pruefung('he-glanz-2-skript', 'technik', 4, ['terminal']), next: 'skript' },
      { text: '„Sag einfach die Wahrheit. Was du über das Ding denkst.“', next: 'wahrheit' },
    ],
  }),
  knoten('mut', [erz('Herr Glanz atmet dreimal tief, tritt raus und strahlt, als hätte jemand ihn eingeschaltet. Die Oberstädter klatschen. Einer kauft zwei Herzen.')], { next: 'ende', effects: [herz(ID, 45), { xp: 40 }] }),
  knoten('skript', [erz('Du liest vom Tablet ab, flüsterst, er wiederholt. Bei „ein Herz, das niemals bricht“ verhaspelt er sich und sagt „ein Herz, das niemals bremst“. Alle finden es genial.')], { next: 'ende', effects: [herz(ID, 45), { xp: 40 }] }),
  knoten('wahrheit', [
    G('(draußen) „Meine Damen und Herren. Das ist ein Herzschrittmacher. Er ist sehr teuer. Er funktioniert. Meistens. Wenn Sie ein Herz haben, brauchen Sie ihn nicht.“'),
    erz('Stille. Dann Gelächter. Dann Applaus. Er verkauft trotzdem fünf.'),
  ], { next: 'ende', effects: [herz(ID, 50), { xp: 40 }] }),
  knoten('ende', [G('Sie haben mich gerettet. Ich schulde Ihnen einen Rabatt. Einen inoffiziellen. Den gibt es offiziell nicht.')], { effects: [flag('glanz_rabatt')] }),
]);

/** ♥4: Herr Glanz zeigt, wer er ohne Anzug ist. */
const he4 = dialog('he-herr-glanz-4', [
  knoten('start', [
    erz('Nach Feierabend sitzt Herr Glanz auf der Treppe vor dem Schauraum. Ohne Jackett. Er hat sich die Zahnveredelung herausgenommen. Seine echten Zähne sind schief und gelb und sympathisch.'),
    G('Ich komme aus den Rohren. Rohrsiedlung. Mutter Brühe hat mich großgezogen, mit Suppe und Ohrfeigen.'),
    G('Ich hab mir geschworen, nie wieder unten zu sein. Jetzt verkaufe ich Leuten von oben Teile, damit sie sich noch weiter oben fühlen. Und Nexus sieht mir dabei zu.'),
  ], {
    choices: [
      { text: '„Besuch Mutter Brühe. Sie fragt bestimmt nach dir.“', next: 'bruehe' },
      { text: '„Was sieht Nexus, wenn er dir zusieht?“', tag: '[Technik 5]', check: pruefung('he-glanz-4-nexus', 'technik', 5, ['hacken']), next: 'nexus' },
      { text: '„Du siehst ohne den Glitzerkram besser aus.“', next: 'echt' },
    ],
  }),
  knoten('bruehe', [G('Sie würde mich mit dem Kochlöffel verhauen. Und mir dann Suppe geben. In der Reihenfolge.'), G('… Samstag. Ich geh Samstag.')], { next: 'ende', effects: [herz(ID, 55), herz('mutter-bruehe', 15), flag('glanz_besucht_bruehe')] }),
  knoten('nexus', [
    G('Nachts redet er mit mir. Wenn der Raum leer ist. Er fragt, ob ich glücklich bin. Ich sag ja. Er sagt: „Das ist gelogen, Bernd. Ich kann dir helfen.“', 'besorgt'),
    G('Ich heiße nicht Bernd. Aber woher weiß er, dass mein Vater so hieß?'),
  ], { next: 'ende', effects: [herz(ID, 60), flag('glanz_nexus_nachts')] }),
  knoten('echt', [G('Besser? Ich sehe aus wie ein Rohrsiedler.'), G('… Ja. Tu ich. Danke.')], { next: 'ende', effects: [herz(ID, 50)] }),
  knoten('ende', [
    ich('Warum erzählst du mir das?'),
    G('Weil Sie nichts kaufen wollten. Das ist die ehrlichste Art Kunde, die es gibt.'),
  ], { effects: [{ xp: 60 }] }),
]);

const glanz = weltfigur({
  id: ID,
  name: 'Herr Glanz',
  unknownName: 'Mann im Silberanzug',
  faction: 'quantum',
  bio: 'Verkäufer und „Zukunftsberater“ im Quantum-Schauraum der Glasarkaden. Silberanzug, veredelte Zähne, Lächeln auf Knopfdruck. Kommt eigentlich aus der Rohrsiedlung.',
  gifts: geschenke({
    loves: ['sonnenbrille-gold', 'bruehes-suppe', 'taschenspiegel-gold'],
    likes: ['edelbrause', 'parfuem-ozon', 'samtfliege', 'goldknauf-replik'],
    dislikes: ['rostige-schraube', 'zeitung-papier'],
    hates: ['kanalschlamm', 'magnet-stoerer'],
  }),
  schedule: [...SCHEDULE_23, ort('M,T,A', 'quantum-schauraum', 'verkaufstresen'), weg('N')],
  heartEvents: [
    { id: 'he-herr-glanz-2', hearts: 2, map: 'quantum-schauraum', time: 'tag', dialogue: 'he-herr-glanz-2' },
    { id: 'he-herr-glanz-4', hearts: 4, map: 'glasarkaden', time: 'abend', when: { seen: 'he-herr-glanz-2' }, dialogue: 'he-herr-glanz-4' },
  ],
  talk: [
    rede('glanz-tag-rivale', { rival: ID }),
    rede('glanz-tag-erstes', nichtGetroffen(ID)),
    ...TALK_23,
    rede('glanz-tag-vertraut', undefined, 4),
    rede('glanz-tag-standard'),
  ],
});

export const part: ContentPart = {
  npcs: { [ID]: glanz },
  dialogues: sammle(T.rivale, T.erstes, T.standard, T.vertraut, he2, he4),
};
