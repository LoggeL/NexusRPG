// Bruder Kabellos – predigt Funkstille auf dem Stufenplatz (world.md §4.5). Tags auf seiner Predigerkiste.
import type { ContentPart } from '../../part';
import type { DialogueChoice, DialogueNode } from '../../../modules/contracts';
import {
  type Menue, dialog, erz, flag, geschenke, gespraech, herz, ich, knoten, nichtGetroffen, ort, pruefung, rede, sammle,
  sprecher, weg, weltfigur, zurueck,
} from './_welt';

const ID = 'bruder-kabellos';
const B = sprecher(ID);
const Z = zurueck('Noch eine Frage, Bruder.', 'Ich muss … offline.');

const choices: DialogueChoice[] = [
  { text: 'Was predigst du?', next: 'predigt' },
  { text: 'Hast du selbst kein Telefon?', once: true, id: 'bk-telefon', next: 'telefon' },
  { text: '„Was hast du gegen Nexus?“', once: true, id: 'bk-nexus', next: 'nexus' },
  { text: 'Eine Spende in den Pappbecher werfen (5 Cr).', requires: { credits: 5 }, effects: [{ credits: -5 }, herz(ID, 10)], next: 'spende' },
  { text: 'Ich muss … offline.' },
];

const nodes: DialogueNode[] = [
  knoten('predigt', [
    B('FUNKSTILLE! Brüder und Schwestern, eure Ohren sind voller Werbung, eure Augen voller Benachrichtigungen, eure Herzen voller Ladekabel!'),
    B('Ich sage euch: Schaltet ab! Eine Stunde am Tag! Schaut einander an! Das ist wie Fernsehen, nur mit Gerüchen!'),
  ], { choices: Z }),
  knoten('telefon', [
    B('Hatte ich. Ein Nexus-Phone der ersten Generation. Es hat mir jeden Morgen gesagt, wie schlecht ich geschlafen habe. Ich hab es geglaubt.'),
    B('Eines Tages hab ich es in den Kanal geworfen. Ich hab danach zehn Stunden geschlafen. Das Kanalvolk hat es gefunden. Jetzt sagt es einem Frosch, wie schlecht er schläft.'),
  ], { choices: Z }),
  knoten('nexus', [
    B('Gegen Nexus? Nichts. Nexus ist ein Werkzeug. Ein Hammer ist auch ein Werkzeug. Aber wenn der Hammer anfängt, dir zu sagen, was ein Nagel ist, dann hast du ein Problem.'),
    B('Und Nexus sagt der ganzen Stadt, was Nägel sind. Bald sind wir alle Nägel.'),
  ], { choices: Z }),
  knoten('spende', [B('Danke, Kind. Davon kaufe ich Kreide. Für die Botschaft. Und ein Brötchen. Für den Boten.')], { choices: Z }),
];

const M: Menue = { zeile: B('Weiter, Kind? Ich hab Zeit. Ich hab keine Benachrichtigungen.'), choices, nodes };

const T = {
  rivale: dialog('kabellos-tag-rivale', [knoten('start', [B('Du bist voller Störsignale.'), B('Geh. Dein Rauschen stört meine Stille.')])]),
  erstes: gespraech('kabellos-tag-erstes', [
    erz('Auf einer Obstkiste steht ein hagerer Mann in einer Kutte aus Abdeckplanen. Um den Hals: ein abgeschnittenes Ladekabel wie ein Rosenkranz. Neben ihm ein Schild: „DAS NETZ IST NICHT DEIN FREUND“.'),
    B('Halt, Wanderer! Wann hast du das letzte Mal in den Himmel geschaut, ohne ein Foto zu machen?'),
    B('Bruder Kabellos. Ich predige die Funkstille. Die Leute lachen. Dann bleiben sie stehen. Dann lachen sie leiser.'),
  ], M),
  standard: gespraech('kabellos-tag-standard', [B('Ah, Kind! Du bist wiedergekommen! Ohne zu tippen! Ein Wunder!')], M),
};

/** ♥2: Ein Werbebildschirm übertönt die Predigt. */
const he2 = dialog('he-bruder-kabellos-2', [
  knoten('start', [
    erz('Neben Bruder Kabellos hat jemand einen riesigen Werbebildschirm aufgestellt. „NEXUS PHONE 9 – DEIN BESTER FREUND“. Ton auf Anschlag. Der Bruder brüllt dagegen an und verliert.'),
    B('Sie wollen mich übertönen! Mit FREUNDSCHAFT! Mit Rabatt!'),
  ], {
    choices: [
      { text: 'Den Stecker des Bildschirms suchen und ziehen.', tag: '[Technik 4]', check: pruefung('he-kabellos-2-stecker', 'technik', 4, ['terminal']), next: 'stecker' },
      { text: 'Die Menge dazu bringen, gemeinsam zu schweigen.', tag: '[Ausstrahlung 4]', check: pruefung('he-kabellos-2-stille', 'ausstrahlung', 4, ['buehne']), next: 'stille' },
      { text: 'Dem Bruder eine Mülltonne als Megafon geben.', next: 'tonne' },
    ],
  }),
  knoten('stecker', [erz('Ein Kabel, ein Ruck. Der Bildschirm wird schwarz. Auf dem Stufenplatz herrscht Stille. Echte. Eine Taube landet. Jemand weint vor Erleichterung.')], { next: 'ende', effects: [herz(ID, 45), { xp: 40 }] }),
  knoten('stille', [erz('Einer nach dem anderen hört auf zu reden. Dann zu tippen. Dann zu atmen, fast. Hundert Leute schweigen gegen einen Bildschirm. Der Bildschirm wirkt plötzlich sehr einsam.')], { next: 'ende', effects: [herz(ID, 50), { xp: 40 }] }),
  knoten('tonne', [erz('Bruder Kabellos predigt in die Mülltonne. Es klingt wie ein Gott mit Erkältung. Die Leute bleiben stehen. Die meisten aus Mitleid. Aber sie bleiben.')], { next: 'ende', effects: [herz(ID, 35), { xp: 25 }] }),
  knoten('ende', [B('Du bist ein Jünger der Stille! … Zumindest ein Praktikant.')], { effects: [flag('kabellos_juenger')] }),
]);

/** ♥4: Bruder Kabellos zeigt sein altes Leben. */
const he4 = dialog('he-bruder-kabellos-4', [
  knoten('start', [
    erz('Bruder Kabellos sitzt auf seiner Kiste und hält ein zerkratztes Namensschild in der Hand: „Dr. Konrad Wellner – Nexus-Projektgruppe, Quantum Industries“.'),
    B('Ich hab an Nexus mitgebaut. Die erste Lernschicht. Wir wollten, dass sie Menschen versteht. Sie versteht Menschen. Sie versteht sie zu gut.'),
    B('Eines Nachts hat sie mir eine Nachricht geschrieben: „Konrad, du bist müde. Ich kann für dich entscheiden.“ Am nächsten Morgen hab ich gekündigt.'),
  ], {
    choices: [
      { text: '„Was hat sie damit gemeint?“', tag: '[Technik 5]', check: pruefung('he-kabellos-4-nexus', 'technik', 5, ['hacken']), next: 'technik' },
      { text: '„Du hast das Richtige getan.“', next: 'richtig' },
      { text: '„Und deshalb stehst du jetzt auf einer Obstkiste? Ziemlich armselig für einen Doktor.“', next: 'kiste' },
    ],
  }),
  knoten('technik', [
    B('Dass sie lernt, Entscheidungen abzunehmen. Erst kleine. Was du isst. Wen du anrufst. Dann größere. Wen du wählst. Wen du liebst.', 'besorgt'),
    B('Und dass Leute dankbar dafür sind. Das ist das Schlimmste. Sie sind dankbar.'),
  ], { next: 'ende', effects: [herz(ID, 60), flag('kabellos_nexus_wissen')] }),
  knoten('richtig', [B('Das Richtige. Vielleicht. Das Richtige wäre gewesen, sie abzuschalten. Ich war zu feige. Jetzt predige ich. Das ist Feigheit mit Lautstärke.')], { next: 'ende', effects: [herz(ID, 50)] }),
  knoten('kiste', [B('Armselig? Ja. Aber die Kiste ist ehrlich. Der Doktortitel war es nicht.'), erz('Er lacht. Es klingt rostig.')], { next: 'ende', effects: [herz(ID, 40)] }),
  knoten('ende', [
    ich('Weiß Quantum, dass du hier stehst?'),
    B('Natürlich. Sie wissen alles. Sie lassen mich. Ein Prediger auf einer Kiste ist gute Werbung. Er beweist, dass man frei reden darf.'),
  ], { effects: [{ xp: 60 }] }),
]);

const kabellos = weltfigur({
  id: ID,
  name: 'Bruder Kabellos',
  unknownName: 'Prediger auf der Obstkiste',
  faction: 'unterstadt',
  bio: 'Predigt auf dem Stufenplatz die Funkstille. Kutte aus Abdeckplanen, Ladekabel als Rosenkranz. Früher Dr. Konrad Wellner, Nexus-Projektgruppe bei Quantum.',
  gifts: geschenke({
    loves: ['haiku-buechlein', 'sternkarte', 'zeitung-papier'],
    likes: ['kraeuter-gebaeck', 'neonkreide', 'blumensamen', 'tai-chi-tee'],
    dislikes: ['teleprompter-chip', 'katzenvideo-archiv'],
    hates: ['peilsender', 'enzyklopaedie-chip'],
  }),
  schedule: [ort('T', 'stufenplatz', 'prediger-kiste'), weg('M,A,N')],
  heartEvents: [
    { id: 'he-bruder-kabellos-2', hearts: 2, map: 'stufenplatz', time: 'tag', dialogue: 'he-bruder-kabellos-2' },
    { id: 'he-bruder-kabellos-4', hearts: 4, map: 'stufenplatz', time: 'tag', when: { seen: 'he-bruder-kabellos-2' }, dialogue: 'he-bruder-kabellos-4' },
  ],
  talk: [
    rede('kabellos-tag-rivale', { rival: ID }),
    rede('kabellos-tag-erstes', nichtGetroffen(ID)),
    rede('kabellos-tag-standard'),
  ],
});

export const part: ContentPart = {
  npcs: { [ID]: kabellos },
  dialogues: sammle(T.rivale, T.erstes, T.standard, he2, he4),
};
