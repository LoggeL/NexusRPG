// Madame Satin – Boutique „Satin & Chrom“ in den Glasarkaden (world.md §4.5, Shop satin-und-chrom).
// Frühere beste Freundin von Stylistin Gina (Flag gina_satin_versoehnt aus he-stylistin-gina-4).
import type { ContentPart } from '../../part';
import type { DialogueChoice, DialogueNode } from '../../../modules/contracts';
import {
  type Menue, dialog, erz, flag, geschenke, gespraech, herz, ich, knoten, nichtGetroffen, ort, pruefung, rede, sammle,
  sprecher, weg, weltfigur, zurueck,
} from './_welt';
import { akt23 } from './madame-satin-akt23';

const ID = 'madame-satin';
const S = sprecher(ID);
const Z = zurueck('Noch eine Frage, Madame.', 'Au revoir.');

const choices: DialogueChoice[] = [
  { text: 'Ich möchte mich umsehen.', next: 'laden', effects: [{ shop: 'satin-und-chrom' }] },
  { text: 'Was trägt man in der Oberstadt gerade?', next: 'mode' },
  { text: '„Ich bin hier oben aufgewachsen. Sie haben meiner Mutter das Hochzeitskleid geschneidert.“', tag: '[Oberstadt]', when: { origin: 'origin-oberstadt' }, once: true, id: 'sa-ober', next: 'ober' },
  { text: '„Gina lässt grüßen.“', when: { flag: 'gina_satin_versoehnt' }, next: 'gina' },
  { text: 'Au revoir.' },
];

const nodes: DialogueNode[] = [
  knoten('laden', [S('Bitte fassen Sie nur an, was Sie bezahlen können. Das schließt erfahrungsgemäß das meiste aus. Aber ich glaube an Wunder. Gelegentlich.')]),
  knoten('mode', [
    S('Chrom. Immer noch Chrom. Chrom an Kragen, Chrom an Absätzen, Chrom an Stellen, die ich in einer Boutique nicht benennen werde.'),
    S('Nächste Saison: Satin. Ich weiß das, weil ich es entscheide.'),
  ], { choices: Z }),
  knoten('ober', [
    S('Ach. Ein Kind von oben. Ich erinnere mich an jedes Kleid. Champagner, Spitze, ein Saum, der zu kurz war, weil Ihre Großmutter es so wollte.'),
    S('Und jetzt kommen Sie in Stiefeln voller Unterstadt zu mir. Wie mutig. Wie geschmacklos. Ich bin entzückt.'),
  ], { choices: Z, effects: [herz(ID, 40)] }),
  knoten('gina', [S('Gina. Diese Frau hat Haare in Kunst verwandelt und Freundschaft in Stolz. Ich auch. Wir sind zwei sehr dumme, sehr gut frisierte Weiber.'), S('Sagen Sie ihr, Donnerstag. Tee. Bei mir. Sie soll die Perücke mitbringen.')], { choices: Z, effects: [herz(ID, 20)] }),
];

const M: Menue = { zeile: S('Noch etwas? Ich habe Zeit. Zeit ist das einzige Luxusgut, das ich nicht verkaufe.'), choices, nodes };

const T = {
  rivale: dialog('satin-tag-rivale', [knoten('start', [S('Wir haben geschlossen.'), S('Für Sie dauerhaft. Hinaus, bevor Ihr Geruch in die Seide zieht.')])]),
  erstes: gespraech('satin-tag-erstes', [
    erz('Eine Boutique aus Glas und Seide. Kleider schweben an unsichtbaren Fäden, Chromschuhe stehen auf Samtkissen wie Reliquien. Hinter der Theke eine Dame, schmal wie eine Nadel, mit einem Monokel aus Bergkristall.'),
    S('Bonjour. Satin. Madame Satin. Sie sind … von unten. Man sieht es am Gang. Und am Rest.'),
    S('Keine Sorge. Hier wird niemand verurteilt. Nur eingekleidet.'),
  ], M),
  standard: gespraech('satin-tag-standard', [S('Ah, Sie wieder. Ihre Garderobe hat sich nicht verbessert. Ihr Mut schon.')], M),
};

/** ♥2: Ein Kunde aus der Oberstadt macht Ärger. */
const he2 = dialog('he-madame-satin-2', [
  knoten('start', [
    erz('Ein Mann im Chromanzug schreit Madame Satin an. Ein Knopf sei abgefallen. Er verlangt sein Geld zurück, eine Entschuldigung und ihre Entlassung, obwohl ihr der Laden gehört.'),
    S('(leise) Er ist der Neffe eines Quantum-Direktors. Wenn ich ihn rauswerfe, bin ich nächste Woche ein Hologramm-Studio.'),
  ], {
    choices: [
      { text: 'Den Knopf vor seinen Augen in Sekunden annähen.', requires: { item: 'nadel-und-faden' }, next: 'naehen' },
      { text: '„Der Knopf ist mit Absicht lose. Das ist die neue Kollektion. Wussten Sie das nicht?“', tag: '[Ausstrahlung 4]', check: pruefung('he-satin-2-bluff', 'ausstrahlung', 4, ['bluff', 'etikette']), next: 'bluff' },
      { text: 'Sich einfach daneben stellen und den Mann anstarren.', next: 'starren' },
    ],
  }),
  knoten('naehen', [erz('Drei Stiche, ein Knoten. Der Mann starrt auf den Knopf, dann auf dich. Er zahlt doppelt, „für den Service“. Madame Satin rückt das Monokel zurecht. Sie lächelt.')], { next: 'ende', effects: [herz(ID, 50), { xp: 40 }] }),
  knoten('bluff', [S('(zu dir, kaum hörbar) Sie sind ein Ungeheuer. Ein hinreißendes.'), erz('Der Mann kauft drei weitere Anzüge mit losen Knöpfen. Die „Kollektion Lose“ ist geboren.')], { next: 'ende', effects: [herz(ID, 50), { xp: 40 }] }),
  knoten('starren', [erz('Du starrst. Er schreit weiter, wird leiser, schaut auf deine Stiefel, auf den Schmutz, auf dein Gesicht. Er erinnert sich an einen Termin. Er geht.')], { next: 'ende', effects: [herz(ID, 35), { xp: 25 }] }),
  knoten('ende', [S('Merci. Ab heute bekommen Sie bei mir den Preis für Freunde. Er ist kaum niedriger. Aber er ist herzlicher.')], { effects: [flag('satin_freund')] }),
]);

/** ♥4: Das Kleid, das Madame Satin nie verkauft. */
const he4 = dialog('he-madame-satin-4', [
  knoten('start', [
    erz('Nach Ladenschluss führt Madame Satin dich in ein Hinterzimmer. Unter einem Tuch: ein Kleid aus dunkelgrüner Seide, mit Chromfäden durchwirkt, die wie Regen glänzen.'),
    S('Mein erstes Kleid. Für einen Ball, 2058. Ich war achtzehn und hatte kein Geld und keine Einladung. Ich bin trotzdem hingegangen.'),
    S('Ich habe mit einem jungen Mann aus der Oberstadt getanzt. Einen ganzen Walzer lang war ich jemand. Danach hat er mich nie wieder angesehen. Ich habe nie wieder getanzt.'),
  ], {
    choices: [
      { text: 'Ihr die Hand hinhalten. „Darf ich bitten?“', next: 'tanz' },
      { text: '„Wer war er?“', tag: '[Straße 5]', check: pruefung('he-satin-4-wer', 'strasse', 5, ['geruecht']), next: 'wer' },
      { text: '„Das Kleid ist wunderschön. Sie sollten es tragen.“', next: 'tragen' },
    ],
  }),
  knoten('tanz', [erz('Ohne Musik, im Hinterzimmer zwischen Stoffballen. Madame Satin führt. Natürlich führt sie. Am Ende hat sie Tränen im Monokel.')], { next: 'ende', effects: [herz(ID, 60)] }),
  knoten('wer', [S('Ein Chrome. Damals noch ohne Töchter. Er hat drei bekommen. Ich habe ihnen ihre ersten Kleider genäht. Ohne ein Wort über ihn.', 'trauer'), S('Seraphina hat sich bedankt. Als Einzige. Ich mag sie dafür. Ich sollte nicht.')], { next: 'ende', effects: [herz(ID, 55), flag('satin_chrome_vergangenheit')] }),
  knoten('tragen', [S('Tragen? In meinem Alter? … Ach, warum nicht. Zum nächsten Ball. Ohne Einladung. Das war schon immer mein Stil.', 'freude')], { next: 'ende', effects: [herz(ID, 55)] }),
  knoten('ende', [
    ich('Danke, dass Sie es mir gezeigt haben.'),
    S('Erzählen Sie es keinem. Und falls doch, erzählen Sie, dass ich hinreißend aussah. Das stimmt nämlich.'),
  ], { effects: [{ xp: 60 }, { give: 'seidentuch-gruen' }] }),
]);

// Akt 2, Partynacht und Nachspiel: madame-satin-akt23.ts.
const A23 = akt23(M);

const satin = weltfigur({
  id: ID,
  name: 'Madame Satin',
  unknownName: 'Dame mit Kristallmonokel',
  faction: 'unterstadt',
  bio: 'Führt die Boutique „Satin & Chrom“ in den Glasarkaden. Schmal wie eine Nadel, Monokel aus Bergkristall, Zunge aus Rasierklingen. Hat allen Chrome-Töchtern die ersten Kleider genäht.',
  gifts: geschenke({
    loves: ['seidentuch-blau', 'perlenkette', 'orchidee'],
    likes: ['nadel-und-faden', 'taschenspiegel-gold', 'samtfliege', 'liebesroman'],
    dislikes: ['glitzerschrott', 'chips-tuete'],
    hates: ['kanalschlamm', 'rostige-schraube'],
  }),
  schedule: [...A23.schedule, ort('M,T,A', 'glasarkaden', 'satin-und-chrom'), weg('N')],
  heartEvents: [
    { id: 'he-madame-satin-2', hearts: 2, map: 'glasarkaden', time: 'tag', dialogue: 'he-madame-satin-2' },
    { id: 'he-madame-satin-4', hearts: 4, map: 'glasarkaden', time: 'abend', when: { seen: 'he-madame-satin-2' }, dialogue: 'he-madame-satin-4' },
  ],
  talk: [
    rede('satin-tag-rivale', { rival: ID }),
    rede('satin-tag-erstes', nichtGetroffen(ID)),
    ...A23.talk,
    rede('satin-tag-standard'),
  ],
});

export const part: ContentPart = {
  npcs: { [ID]: satin },
  dialogues: sammle(T.rivale, T.erstes, T.standard, he2, he4, ...A23.dialogues),
};
