// pers-alesa-wasserfilter · „Nullpunkt“ (world.md §6.5, Alesa, Nachspiel). Start in Alesas Gespräch (npc-quantum/alesa-zero.ts).
// Zentrator-Kern aus der Werkstatt „Nullpunkt“ (digitech-areal:glasfassade) holen, Alesa und Elsa zusammenbringen
// (`[Ausstrahlung 6]`, Elsas eigenen Filter vorzeigen, oder ohne Check: Alesa repariert vor Elsas Augen ihre Pumpe),
// Einbau am Brunnen (`[Technik 7]`, Ventil-Minispiel oder ohne Check die Nacht durch die Lampe halten). Ruf aussiedler +20.
import type { QuestDef } from '../../../modules/contracts';
import type { ContentPart } from '../../part';
import {
  L, N, P, VEX, active, all, any, byId, c, cc, chk, cut, dlg, ding, flag, give, item, karten, msg, node, noFlag,
  rede, rel, schritt, set, spiel, stelle, szene, tafel, take, time, zeit,
} from './_lib';

const Q = 'pers-alesa-wasserfilter';
const A = 'alesa-zero';
const E = 'elsa';
const KERN = 'p23-zentrator-kern';
const AKTIV = active(Q);
const HAT = any(item(KERN), flag('awf_eingebaut'));
const EINIG = flag('awf_einig');

const quest: QuestDef = {
  id: Q, kind: 'personal', act: 3, giver: A,
  title: 'Nullpunkt',
  summary: 'Der Zentrator hat Gedanken umgeschrieben. Alesa will, dass er ab jetzt Wasser putzt. Am Aussiedlerhof gibt es eine Frau, die Wasserfilter baut und Quantum hasst. Die beiden müssen zusammenarbeiten. Viel Glück.',
  steps: [
    schritt('kern', 'Hol mit Alesa den Zentrator-Kern aus ihrer Werkstatt „Nullpunkt“ (Digitech-Areal, Glasfassade).', HAT, ['digitech-areal', 'glasfassade']),
    schritt('elsa', 'Bring Alesa und Elsa zusammen (Aussiedlerhof, Elsas Werkstatt, tagsüber).', EINIG, ['aussiedlerhof', 'elsas-werkstatt'], { when: HAT }),
    schritt('einbau', 'Bau den Filter in den Brunnen ein (Aussiedlerhof).', 'awf_eingebaut', ['aussiedlerhof', 'brunnen'], { when: EINIG }),
  ],
  reward: { xp: 380, relations: { [A]: 100, [E]: 40 }, rep: { aussiedler: 20 }, items: { wasserfilter: 2 } },
};

const kern = ding(KERN, 'Zentrator-Kern', 'Ein Glaszylinder mit einer Spirale aus Licht darin, so groß wie eine Thermoskanne. Er summt in einer Frequenz, bei der man an früher denkt. Alesa hat „GUT JETZT“ auf das Etikett geschrieben.', 'datenkristall');

// ------------------------------------------------------------------------------------------- Nullpunkt
const nullpunkt = dlg('p23-awf-nullpunkt', [
  node('start', [
    N('Werkstatt „Nullpunkt“ hinter der zersplitterten Glasfassade: ein Feldbett, drei Feuerlöscher, eine Tafel voller Formeln, die jemand mit „NEIN“ übermalt und dann neu geschrieben hat. Mittendrin, auf einem Schweißtisch, der Zentrator. Abgeschaltet. Ausgeweidet.'),
    L(A, 'Der Kern ist das Einzige, was ich behalten habe. Er kann Muster erkennen. Gedanken, Proteine, Keime. Er hat gelernt, Menschen zu filtern. Jetzt soll er Wasser filtern.', 'besorgt'),
    L(A, 'Ich kann ihn nicht allein rausbringen. Ich zittere, wenn ich ihn anfasse. Das ist keine Metapher. Das ist Neurologie.'),
  ], {
    choices: [
      c('Den Kern aus der Halterung heben und einpacken.', 'gepackt', { effects: [give(KERN)] }),
      cc('Die Restladung vorher sauber ableiten, damit er unterwegs nicht summt.', 'abgeleitet', chk('awf-ladung', 'technik', 5, ['reparieren', 'strom']), { effects: [give(KERN), set('awf_leise')] }),
      c('„Aria hatte so ein Ding im Kopf. Weißt du das?“', 'aria', { when: VEX }),
    ],
  }),
  node('aria', [
    L(A, 'Ja. Ich weiß es. Ich hab die Kalibrierung geschrieben, die bei ihr versagt hat. Das ist der Grund, warum ich das hier mache.', 'trauer'),
    L(A, 'Du musst mir nicht verzeihen. Du musst nur tragen.'),
  ], { next: 'start' }),
  node('abgeleitet', [N('Ein kurzer Blitz, ein Geruch nach Gewitter, dann ist der Kern still. Alesa atmet aus, als hätte sie seit Monaten nicht ausgeatmet.')], { next: 'gepackt' }),
  node('gepackt', [
    L(A, 'Aussiedlerhof. Ich komm nach. Sag dieser Elsa … sag ihr nichts. Ich sag es selbst. Oder ich stottere es selbst. Eins von beidem.', 'verlegen'),
  ], { effects: [msg('Zentrator-Kern eingepackt. Alesa kommt zum Aussiedlerhof.')] }),
]);

// ------------------------------------------------------------------------------------------- Elsa und Alesa
const treffen = dlg('p23-awf-treffen', [
  node('start', [
    N('Elsas Werkstatt. Alesa steht in der Tür, den Laborkittel gegen eine geliehene Arbeitsjacke getauscht, die ihr drei Nummern zu groß ist. Elsa sieht den Kern auf der Werkbank und dann Alesa.'),
    L(E, 'Quantum. In meiner Werkstatt. Mit einem Gehirnkocher. Ich hab zwanzig Jahre gebraucht, um von euch wegzukommen.', 'wut'),
    L(A, 'Ich auch. Ich hab nur länger gebraucht, um es zu merken.', 'trauer'),
  ], {
    choices: [
      cc('„Ihr baut beide Dinge, die Leute retten sollen. Die eine aus Schrott, die andere aus Schuld. Baut eins zusammen.“', 'einig', chk('awf-reden', 'ausstrahlung', 6, ['ueberreden', 'schlichten'])),
      c('Elsas eigenen Wasserfilter auf den Tisch stellen. „Kann deiner Keime erkennen? Ihrer schon.“', 'filter', { when: item('wasserfilter') }),
      c('Nichts sagen. Alesa die kaputte Pumpe in der Ecke zeigen.', 'pumpe'),
    ],
  }),
  node('filter', [
    L(A, 'Aktivkohle, Keramik, Kupferspirale. Das ist … elegant. Das ist eleganter als alles, was ich bei Quantum gesehen habe.', 'ueberrascht'),
    L(E, 'Elegant. Hm. Das hat mir seit Gustav keiner mehr gesagt.', 'verlegen'),
  ], { next: 'einig' }),
  node('pumpe', [
    N('Alesa kniet sich vor die Pumpe. Ohne zu fragen. Zwei Stunden lang sagt keiner was. Elsa reicht ihr irgendwann einen Schraubenschlüssel, ohne hinzusehen. Alesa nimmt ihn, ohne hinzusehen. Die Pumpe läuft.'),
  ], { effects: [zeit(120)], next: 'einig' }),
  node('einig', [
    L(E, 'Gut. Wir versuchen es. Aber ich halte den Feuerlöscher.', 'signatur'),
    L(A, 'Ich hab drei mitgebracht.', 'freude'),
  ], { effects: [set('awf_einig'), rel(E, 20), msg('Elsa und Alesa bauen den Filter. Einbau am Brunnen.')] }),
]);

// ------------------------------------------------------------------------------------------- Einbau
const einbau = dlg('p23-awf-einbau', [
  node('start', [
    N('Am Brunnen. Elsa hat ein Gestell gebaut, Alesa hat den Kern eingesetzt, und beide sehen dich an, weil du die einzige Person bist, die gerade nicht streitet.'),
    L(A, 'Die Durchflussregelung muss jemand von Hand einstellen. Zu viel Druck, und der Kern filtert die Mineralien gleich mit. Zu wenig, und er filtert gar nichts.'),
  ], {
    choices: [
      cc('Das Druckventil einstellen, den Kern auf Keimmuster kalibrieren.', 'laeuft', chk('awf-einbau', 'technik', 7, ['reparieren', 'kalibrieren'])),
      c('Am Ventil drehen, bis die Anzeige grün wird.', undefined, {
        tag: '[Ventil]',
        effects: [spiel('akt-ventil', 3, 'p23-awf-ventil', 'Druckventil am Brunnen', [take(KERN), set('awf_eingebaut'), cut('p23-awf-klar')],
          [msg('Das Ventil zischt, der Kern flackert. Alesa: „Nochmal. Langsamer. Wie Atmen.“')])],
      }),
      c('Die beiden machen lassen. Die Nacht durch die Lampe halten.', 'nacht', { effects: [zeit(240)] }),
    ],
  }),
  node('nacht', [N('Vier Stunden. Elsa flucht, Alesa rechnet, beide fluchen und rechnen. Gegen drei Uhr lachen sie zum ersten Mal zusammen, über etwas, das du nicht verstehst. Gegen vier läuft das Wasser klar.')], { next: 'laeuft' }),
  node('laeuft', [], { effects: [take(KERN), set('awf_eingebaut'), cut('p23-awf-klar')] }),
]);

const klar = szene('p23-awf-klar', 'Klares Wasser', [
  tafel('Aussiedlerhof, früh am Morgen. Aus dem Brunnen läuft Wasser, so klar, dass man den Eimerboden sieht.', [
    N('Der Kern summt leise im Gestell. Die Frequenz erinnert nicht mehr an früher. Sie erinnert an Regen.'),
  ]),
  tafel('Alesa trinkt den ersten Becher. Sie zittert nicht.', [
    L(A, 'Das ist das Erste, was ich gebaut habe, das niemandem wehtut.', 'trauer'),
    L(E, 'Das Zweite. Das Erste war deine Entschuldigung. Die war auch gut gebaut.', 'zaertlich'),
    P('Ihr solltet zusammen eine Werkstatt aufmachen.'),
    L(E, 'Sag das nie wieder. … Sag das morgen nochmal.', 'freude'),
  ], 1800),
], [set('alesa_filter_hof'), msg('Der Aussiedlerhof hat sauberes Wasser. Alesa und Elsa reden jetzt jeden Tag. Meistens laut.')]);

export const part: ContentPart = {
  quests: { [Q]: quest },
  items: { [KERN]: kern },
  dialogues: byId(nullpunkt, treffen, einbau),
  cutscenes: { [klar.id]: klar },
  mapAdditions: karten([
    ['digitech-areal', rede('p23-awf-nullpunkt', 'glasfassade', 'Alesa: Den Zentrator-Kern holen', nullpunkt.id,
      all(AKTIV, { not: HAT }, time('morgen', 'tag', 'abend')))],
    ['aussiedlerhof', stelle('p23-awf-alesa', A, 'elsas-werkstatt', treffen.id, all(AKTIV, item(KERN), noFlag('awf_einig'), time('morgen', 'tag'))), 'npc'],
    ['aussiedlerhof', rede('p23-awf-einbau', 'brunnen', 'Den Filter in den Brunnen einbauen', einbau.id,
      all(AKTIV, EINIG, noFlag('awf_eingebaut')), { kind: 'use' })],
  ]),
};
