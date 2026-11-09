// Dr. Winkel – Winkeladvokat im Eisenhof, senkt Fahndung gegen Gebühr (world.md §4.5, §10.3).
// Fahndung läuft über die Flags fahndung_1…3 (siehe combat/random.ts, maps/zellentrakt.ts): Winkel nimmt für 150 Cr die
// höchste Stufe weg. Die Karte eisenhof hat einen Shop-Hotspot `dr-winkel`: Der Laden (Medizin, Ausweise) steht hier.
import type { ContentPart } from '../../part';
import type { Condition, DialogueChoice, DialogueNode, ShopDef } from '../../../modules/contracts';
import {
  type Menue, dialog, erz, flag, geschenke, gespraech, herz, ich, knoten, nichtGetroffen, ort, pruefung, rede, sammle,
  sprecher, weg, weltfigur, zurueck,
} from './_welt';
import { TALK_23 } from './dr-winkel-akt23';

const ID = 'dr-winkel';
const W = sprecher(ID);
const PREIS = 150;
/** Halber Preis, solange der Richter erpresst ist (side-streaming-suenden, Flag richter_fahndung_halb). */
const HALB: Condition = { flag: 'richter_fahndung_halb' };
const GEFALLEN = 'richters-gefallen';
const GESUCHT: Condition = { any: [{ flag: 'fahndung_1' }, { flag: 'fahndung_2' }, { flag: 'fahndung_3' }] };
const Z = zurueck('Noch eine Rechtsfrage.', 'Ich hab nichts gesagt.');

const senken = (stufe: 1 | 2 | 3, halb: boolean): DialogueChoice => {
  const preis = halb ? PREIS / 2 : PREIS;
  const stand: Condition = stufe === 3 ? { flag: 'fahndung_3' } : stufe === 2 ? { all: [{ flag: 'fahndung_2' }, { notFlag: 'fahndung_3' }] } : { all: [{ flag: 'fahndung_1' }, { notFlag: 'fahndung_2' }, { notFlag: 'fahndung_3' }] };
  return {
    text: `Fahndung senken lassen (Stufe ${stufe} → ${stufe - 1}, ${preis} Cr${halb ? ', Richterrabatt' : ''}).`,
    tag: '[Fahndung]',
    requires: { credits: preis },
    when: { all: [stand, halb ? HALB : { not: HALB }] },
    effects: [{ credits: -preis }, { wanted: -1 }, herz(ID, 5), { advanceTime: halb ? 30 : 60 }],
    next: halb ? 'gesenkt-halb' : 'gesenkt',
  };
};

const choices: DialogueChoice[] = [
  senken(3, false), senken(2, false), senken(1, false),
  senken(3, true), senken(2, true), senken(1, true),
  {
    text: 'Richters Gefallen vorlegen (Fahndung auf 0).', tag: '[Fahndung]',
    when: { all: [GESUCHT, { item: GEFALLEN }] },
    effects: [{ take: GEFALLEN }, { wanted: -3 }, herz(ID, 10), { advanceTime: 30 }],
    next: 'gefallen',
  },
  {
    text: '„Sie haben was gut bei mir“ – Sie erinnern sich? (eine Stufe Fahndung)', tag: '[Fahndung]',
    when: { all: [GESUCHT, { flag: 'winkel_gefallen' }, { notFlag: 'winkel_gefallen_eingeloest' }] },
    effects: [{ wanted: -1 }, { setFlag: 'winkel_gefallen_eingeloest' }, { advanceTime: 30 }],
    next: 'gefallen-winkel',
  },
  { text: 'Was haben Sie im Angebot?', next: 'laden', effects: [{ shop: 'dr-winkel' }] },
  { text: 'Wie senkt man eine Fahndung?', once: true, id: 'wi-wie', next: 'wie' },
  { text: '„Sie sind doch gar kein Anwalt, oder?“', tag: '[Straße 4]', check: pruefung('winkel-anwalt', 'strasse', 4, ['bluff']), once: true, id: 'wi-anwalt', next: 'anwalt' },
  { text: 'Ich hab nichts gesagt.' },
];

const nodes: DialogueNode[] = [
  knoten('gesenkt', [
    erz('Dr. Winkel tippt, telefoniert, flüstert, stempelt. Eine Stunde später schiebt er dir ein Formular hin: „Personenverwechslung – bestätigt“.'),
    W('Sie sind jetzt jemand anderes. Für die Wache. Für mich sind Sie immer noch eine Einnahmequelle.'),
  ], { choices: Z }),
  knoten('gesenkt-halb', [
    erz('Dr. Winkel ruft genau eine Nummer an. Er sagt nur: „Winkel hier. Sie wissen schon, weswegen.“ Am anderen Ende hört man jemanden schwer schlucken.'),
    W('Halber Preis, halbe Stunde. Wer den Richter an den Eiern hat, muss nicht lange telefonieren. Ich will gar nicht wissen, womit Sie ihn haben. Doch, will ich. Aber nicht schriftlich.'),
  ], { choices: Z }),
  knoten('gefallen-winkel', [
    erz('Dr. Winkel zieht ein Notizbuch aus der Schublade, das es angeblich nicht gibt, und streicht mit spitzen Fingern eine Zeile durch.'),
    W('Eine Stufe. Wie versprochen. Ich halte mein Wort, das ist das Einzige an mir, das nicht abrechnet. Wir sind quitt. Kommen Sie mir nicht wieder sentimental.'),
  ], { choices: Z }),
  knoten('gefallen', [
    erz('Du legst den Zettel auf den Tisch. Dr. Winkel liest ihn zweimal, hält ihn gegen das Licht, riecht daran.'),
    W('Die Handschrift des Richters. „Ein Gefallen. Einer. Nicht übertreiben.“ Wissen Sie, wie selten so etwas ist? Das ist ein Freispruch mit Briefmarke.'),
    W('Ich lese ihm seinen eigenen Zettel am Telefon vor, und Sie sind unbescholten. Gratis. Es tut mir körperlich weh, das zu sagen.', 'verlegen'),
  ], { choices: Z }),
  knoten('laden', [W('Pflaster, Gel, Staubmasken. Für Leute, die Ärger hatten und nicht zum Arzt können. Ich bin kein Arzt. Ich bin Doktor. Der Unterschied ist juristisch.')]),
  knoten('wie', [
    W('Man verliert Akten. Man findet Zeugen. Man erinnert einen Wachtmeister daran, wo er letzten Samstag war und mit wem.'),
    W('Hundertfünfzig pro Stufe. Das ist kein Preis. Das ist eine Gebühr. Gebühren sind legal. Meistens.'),
  ], { choices: Z }),
  knoten('anwalt', [
    W('Mein Doktortitel ist von der Fernuniversität Neu-Lagos. Fach: Tanzpädagogik.', 'verlegen'),
    W('Aber ich kenne jedes Gesetz. Ich hab sie alle gelesen. Im Knast. Siebenmal. Das ist mehr als der Richter.'),
  ], { choices: Z, effects: [herz(ID, 20)] }),
];

const M: Menue = { zeile: W('Weiter. Meine Zeit kostet. Die Ihre offenbar nicht.'), choices, nodes };

const T = {
  rivale: dialog('winkel-tag-rivale', [knoten('start', [W('Ich vertrete Sie nicht.'), W('Ich vertrete nicht mal Ihren Schatten. Raus, Sie juristischer Totalschaden.')])]),
  erstes: gespraech('winkel-tag-erstes', [
    erz('Eine Praxis zwischen Pfandleihe und Kneipe. An der Tür ein Messingschild: „Dr. Winkel – Recht, Rat, Rabatt“. Drinnen ein kleiner Mann mit Hornbrille, Fliege und sehr vielen Aktenordnern, die alle leer sind.'),
    W('Dr. Winkel. Sie haben ein Problem mit der Wache? Gut. Ich habe eine Lösung. Sie kostet. Lösungen kosten immer.'),
  ], M),
  gesucht: gespraech('winkel-tag-gesucht', [
    W('Ah. Ich sehe Ihr Gesicht. Ich sehe es auf drei Fahndungsbildschirmen gleichzeitig. Setzen Sie sich. Schließen Sie die Tür. Zahlen Sie.'),
  ], M),
  standard: gespraech('winkel-tag-standard', [W('Mein Lieblingsmandant. Sie sind sauber? Wie langweilig. Kommen Sie wieder, wenn Sie etwas angestellt haben.')], M),
};

/** ♥2: Winkel braucht einen „Zeugen“. */
const he2 = dialog('he-dr-winkel-2', [
  knoten('start', [
    erz('Dr. Winkel fängt dich vor der Praxis ab und zieht dich an der Jacke hinein.'),
    W('Ich brauche einen Zeugen. Für eine Oma aus der Rohrsiedlung, die angeblich einen Quantum-Laster angezündet hat. Sie ist neunzig. Sie kann kein Feuerzeug halten.'),
    W('Sie müssen nur sagen, dass Sie sie zur fraglichen Zeit bei Mutter Brühe gesehen haben. Hat sie wirklich. Ich hab nur keinen, der es sagt.'),
  ], {
    choices: [
      { text: 'Vor Gericht aussagen, klar und ruhig.', tag: '[Ausstrahlung 4]', check: pruefung('he-winkel-2-aussage', 'ausstrahlung', 4, ['ueberreden']), next: 'aussage' },
      { text: 'Mutter Brühe überreden, selbst auszusagen.', when: { met: 'mutter-bruehe' }, next: 'bruehe' },
      { text: 'Eine schriftliche Aussage unterschreiben.', next: 'schriftlich' },
    ],
  }),
  knoten('aussage', [erz('Im Gerichtssaal zitterst du kein bisschen. Der Richter gähnt, nickt, spricht frei. Die Oma schenkt dir einen Topflappen. Gehäkelt. Mit Totenkopf.')], { next: 'ende', effects: [herz(ID, 45), { xp: 40 }, { rep: 'unterstadt', delta: 2 }] }),
  knoten('bruehe', [erz('Mutter Brühe kommt mit dem Suppenkessel ins Gericht. Sie sagt drei Sätze. Der Richter spricht frei und bestellt eine Portion.')], { next: 'ende', effects: [herz(ID, 50), herz('mutter-bruehe', 10), { xp: 40 }] }),
  knoten('schriftlich', [W('Schriftlich. Sehr gut. Papier ist geduldig. Richter weniger. Aber es wird reichen.'), erz('Es reicht. Knapp. Die Oma kommt mit einer Verwarnung davon. Sie findet das unverschämt.')], { next: 'ende', effects: [herz(ID, 35), { xp: 25 }] }),
  knoten('ende', [W('Sie haben was gut bei mir. Eine Stufe Fahndung. Irgendwann. Ich schreib’s auf. In ein Buch, das es nicht gibt.')], { effects: [flag('winkel_gefallen')] }),
]);

/** ♥4: Warum Winkel tut, was er tut. */
const he4 = dialog('he-dr-winkel-4', [
  knoten('start', [
    erz('Spät in der Praxis. Winkel hat die Fliege abgelegt. Vor ihm liegt ein Zeitungsausschnitt von 2070: „Elfjähriger verhaftet – Brot gestohlen“. Das Foto zeigt einen Jungen mit Hornbrille.'),
    W('Drei Jahre Jugendknast. Für ein Brot. Mein Pflichtverteidiger hat während der Verhandlung gegessen. Ein Brötchen. Ich hab es nie vergessen.'),
    W('Ich bin kein echter Anwalt. Aber ich bin der einzige, der hier unten zuhört.'),
  ], {
    choices: [
      { text: '„Dann mach es richtig. Lern es offiziell.“', tag: '[Ausstrahlung 5]', check: pruefung('he-winkel-4-studium', 'ausstrahlung', 5, ['ueberreden']), next: 'studium' },
      { text: '„Du bist ein besserer Anwalt als alle mit Diplom.“', next: 'besser' },
      { text: '„Und das Geld? Hundertfünfzig pro Stufe ist kein Ehrenamt.“', next: 'geld' },
    ],
  }),
  knoten('studium', [W('Offiziell? Mit Prüfung? Mit … Kleiderordnung?'), W('… Die Abendschule am Gericht nimmt Leute über fünfzig. Ich bin einundfünfzig. Das ist ein Zeichen. Oder ein Rechenfehler.')], { next: 'ende', effects: [herz(ID, 60), flag('winkel_abendschule')] }),
  knoten('besser', [W('Besser. Hm. Besser als ein Brötchenesser ist kein hoher Maßstab. Aber ich nehme es.'), erz('Er rückt die Hornbrille zurecht. Seine Hand zittert ein bisschen.')], { next: 'ende', effects: [herz(ID, 50)] }),
  knoten('geld', [W('Die Hälfte geht in einen Topf. Für Kinder, die Brot klauen. Damit sie einen Anwalt haben, der nicht isst.'), W('Die andere Hälfte geht in Fliegen. Ich hab vierzig.')], { next: 'ende', effects: [herz(ID, 55)] }),
  knoten('ende', [
    ich('Danke, dass du mir das erzählst.'),
    W('Erzählen Sie es niemandem. Mein Ruf als Halsabschneider ist mein wichtigstes Kapital.'),
  ], { effects: [{ xp: 60 }, { give: 'samtfliege' }] }),
]);

const winkel = weltfigur({
  id: ID,
  name: 'Dr. Winkel',
  unknownName: 'Mann mit Hornbrille und Fliege',
  faction: 'unterstadt',
  bio: 'Winkeladvokat im Eisenhof, „Recht, Rat, Rabatt“. Hornbrille, Fliege, leere Aktenordner. Doktor der Tanzpädagogik, kennt trotzdem jedes Gesetz. Senkt Fahndung gegen Gebühr.',
  gifts: geschenke({
    loves: ['gesetzbuch', 'samtfliege', 'stempelkissen'],
    likes: ['synth-kaffee', 'zeitung-papier', 'kassenbuch', 'brezel'],
    dislikes: ['handschellen', 'glitzerschrott'],
    hates: ['peilsender', 'kanalschlamm'],
  }),
  schedule: [ort('M,T', 'eisenhof', 'winkels-praxis'), weg('A,N')],
  heartEvents: [
    { id: 'he-dr-winkel-2', hearts: 2, map: 'eisenhof', time: ['morgen', 'tag'], dialogue: 'he-dr-winkel-2' },
    { id: 'he-dr-winkel-4', hearts: 4, map: 'eisenhof', time: 'tag', when: { seen: 'he-dr-winkel-2' }, dialogue: 'he-dr-winkel-4' },
  ],
  talk: [
    rede('winkel-tag-rivale', { rival: ID }),
    rede('winkel-tag-erstes', nichtGetroffen(ID)),
    ...TALK_23,
    rede('winkel-tag-gesucht', GESUCHT),
    rede('winkel-tag-standard'),
  ],
});

/** Kleiner Laden für den Shop-Hotspot `dr-winkel` der Karte eisenhof (Öffnung wie die Praxis). */
const laden: ShopDef = {
  id: 'dr-winkel',
  name: 'Dr. Winkels Praxis',
  owner: ID,
  faction: 'unterstadt',
  open: { time: ['morgen', 'tag'] },
  stock: [
    { item: 'medipflaster', qty: 6 },
    { item: 'nanogel', qty: 2 },
    { item: 'staubmaske', qty: 2 },
    { item: 'u-bahn-ticket', qty: 5 },
  ],
  // Fahndungsdienst im Laden (dieselben Preise wie im Gespräch): −1 Stufe für 150 Cr, 75 Cr bei erpresstem Richter,
  // Richters Gefallen setzt auf 0.
  wantedService: { fee: PREIS, halfWhen: HALB, pardonItem: GEFALLEN },
};

export const part: ContentPart = {
  npcs: { [ID]: winkel },
  shops: { [laden.id]: laden },
  dialogues: sammle(T.rivale, T.erstes, T.gesucht, T.standard, he2, he4),
};
