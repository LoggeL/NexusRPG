// pers-delya-quelle · „Delyas Quelle“ (world.md §6.5, Delya ♥4, Akt 2). Ersetzt den Platzhalter aus parts/integration/luecken.ts.
// Start: Delyas Tagesgespräch (npc-medien-club, nach he-delya-delloraine-4). Drei „Kanal-Schlafwandler“ – Menschen mit
// Gratis-Chip, die nachts dem Jingle hinterherlaufen – finden und zu Dante bringen (act23.json):
//   Ede am Floß-Anleger (kanal-sammler), Rosi an der Schlafwandler-Pumpe (pumpwerk-sieben), Bert im Datentunnel.
// Je Schlafwandler: Eskorte mit Kampf (eigene Rettungsbegegnung), `[Technik 5]` Chip stummschalten, ein Weg ohne Check
// (Jingle summen, Kommunikator piepen lassen, Schlafenszeit abwarten), dazu `chip-blocker` als Gegenstand.
// Danach Dante (Werkstatt, Sofa) zieht die Chips, die drei erzählen Delya, wo sie den Chip herhaben → Sendung, Ruf nx1-medien +20.
import type { DialogueDef, EncounterDef, QuestDef } from '../../../modules/contracts';
import type { ContentPart } from '../../part';
import {
  L, N, P, VEX, active, all, bye, byId, c, cc, chk, cut, dlg, fight, flag, item, karten, msg, node, noFlag, nutze,
  rede, rel, schritt, set, szene, tafel, take, zeit,
} from './_lib';

const Q = 'pers-delya-quelle';
const D = 'delya-delloraine';
const DA = 'dante';
const AKTIV = active(Q);

interface Wandler {
  key: 'ede' | 'rosi' | 'bert';
  flag: string;
  name: string;
  map: string;
  spot: string;
  ort: string;
  bild: string;
  /** Weg ohne Check. */
  frei: { text: string; lines: string[]; minutes: number };
  enc: EncounterDef;
}

const FLAGS = { ede: 'schlafwandler_ede_gerettet', rosi: 'schlafwandlerin_rosi_gerettet', bert: 'schlafwandler_bert_gerettet' } as const;

const rettung = (key: Wandler['key'], arena: string, enemies: EncounterDef['enemies'], intro: string): EncounterDef => ({
  id: `p23-enc-schlafwandler-${key}`,
  name: 'Schlafwandler-Eskorte',
  arena,
  enemies,
  objective: { kind: 'rescue', unit: 'kanal-schlafwandler', cell: [1, 1] },
  when: { act: 2 },
  intro: [
    { speaker: 'narrator', text: intro },
    { speaker: 'narrator', text: 'Ziel: alle Gegner vertreiben. Fällt der Schlafwandler, ist die Quelle verloren.' },
  ],
  reward: { xp: 60 },
  onWin: [{ setFlag: FLAGS[key] }, { message: 'Gerettet. Du bringst den Schlafwandler zu Dante.' }, { advanceTime: 40 }],
});

const WANDLER: Wandler[] = [
  {
    key: 'ede', flag: FLAGS.ede, name: 'Ede', map: 'kanal-sammler', spot: 'floss-anleger', ort: 'Kanal-Sammler, Floß-Anleger',
    bild: 'Am Floß-Anleger steht ein Mann im Bademantel bis zu den Knien im Kanal und summt den Quantum-Jingle. „Quan-tum, Quan-tum, Zukunft für dich …“ Hinter seinem Ohr blinkt es grün. Ede, sagt das Namensschild an seinem Bademantel. Darunter: „Bademeister a. D.“',
    frei: {
      text: 'Den Jingle mitsummen und rückwärts gehen. Er folgt dem Ton.',
      lines: [
        'Du summst. Falsch, aber laut. Ede dreht den Kopf wie ein Radio, das einen Sender sucht, und stapft hinter dir her. Durchs Wasser, über die Planken, die Leiter hoch.',
        'Zwei Stunden. Dein Hals ist wund. Ede ist trocken, weil du ihm deine Jacke gegeben hast. Er summt immer noch. Du summst immer noch. Ihr seid jetzt eine Band.',
      ],
      minutes: 120,
    },
    enc: rettung('ede', 'arena-kanal', [{ enemy: 'rattenschwarm' }, { enemy: 'rohrkriecher' }, { enemy: 'kanalratte', count: 2 }],
      'Ede läuft geradewegs auf den Laufsteg zu, unter dem es raschelt. Sehr viel. Die Ratten haben gemerkt, dass er nicht wegläuft.'),
  },
  {
    key: 'rosi', flag: FLAGS.rosi, name: 'Rosi', map: 'pumpwerk-sieben', spot: 'schlafwandler-pumpe', ort: 'Pumpwerk Sieben, alte Pumpe',
    bild: 'An der alten Pumpe sitzt eine Frau mit Lockenwicklern und zählt Tropfen. „Dreihundertzwölf. Dreihundertdreizehn. Master mag gerade Zahlen.“ Ihre Pantoffeln sind nass, ihre Augen glimmen. Rosi. Die aus der Rohrsiedlung, die alle vermissen.',
    frei: {
      text: 'Den Kommunikator piepen lassen wie einen Quantum-Rufton. Sie folgt dem Piepen.',
      lines: [
        'Piep. Rosi steht auf. Piep. Sie macht einen Schritt. Piep. Noch einen. Es dauert. Pumpwerk Sieben ist groß, und Rosi bleibt an jedem Ventil stehen, um es zu zählen.',
        'Irgendwann sitzt ihr im Überlaufrohr, Rosi summt, du piepst, und eine Kanalratte sieht euch an wie zwei Leute, die ihr Leben falsch geplant haben.',
      ],
      minutes: 150,
    },
    enc: rettung('rosi', 'arena-rohre', [{ enemy: 'kabelmolch' }, { enemy: 'kanalratte', count: 2 }],
      'Rosi zählt laut weiter. Aus dem Molch-Nest kriecht etwas Langes, Feuchtes, das gerade Zahlen offenbar überhaupt nicht mag.'),
  },
  {
    key: 'bert', flag: FLAGS.bert, name: 'Bert', map: 'datentunnel', spot: 'schlafwandler-tunnel', ort: 'Datentunnel, Kabelnische',
    bild: 'In einer Kabelnische hockt ein dürrer Mann, ein Glasfaserkabel in der Faust, das andere Ende hinter seinem Ohr. Er flüstert Zahlenkolonnen. Niemand vermisst Bert, weil niemand Bert kannte. Bert kennt dafür jetzt jede Leitung unter der Stadt.',
    frei: {
      text: 'Neben ihm warten, bis der Tunnel-Lautsprecher „Schlafenszeit“ sagt, und ihn dann am Ärmel mitnehmen.',
      lines: [
        'Du setzt dich neben Bert. Er rechnet. Du wartest. Er rechnet. Der Lautsprecher im Tunnel knackt: „Ruhemodus für Testpersonen.“ Bert lässt das Kabel los wie ein Kind einen Luftballon.',
        'Er geht mit, ganz brav, die Augen halb zu. Unterwegs sagt er nur einen Satz: „Die Leitungen sind traurig.“ Dann nichts mehr.',
      ],
      minutes: 180,
    },
    enc: rettung('bert', 'arena-rohre-datentunnel', [{ enemy: 'sicherheitsprogramm', count: 2 }, { enemy: 'stoerdrohne' }],
      'Kaum ziehst du an Berts Kabel, flackert der Tunnel rot. Zwei Sicherheitsprogramme falten sich aus der Wand. „Testperson bleibt angeschlossen.“'),
  },
];

const ALLE = all(...WANDLER.map((w) => flag(w.flag)));
const QUELLE = 'delya_quelle_gesprochen';

const quest: QuestDef = {
  id: Q, kind: 'personal', act: 2, giver: D,
  title: 'Delyas Quelle',
  summary: 'In der Unterstadt verschwinden Menschen. Sie laufen nachts einem Jingle hinterher, in den Kanal, ins Pumpwerk, in den Datentunnel. Delya braucht einen, der zurückkommt und erzählen kann. Am besten drei.',
  steps: [
    ...WANDLER.map((w) => schritt(w.key, `Finde ${w.name} (${w.ort}) und bring ${w.key === 'rosi' ? 'sie' : 'ihn'} zu Dante.`, w.flag, [w.map, w.spot])),
    schritt('dante', 'Dante soll die Chips ziehen. Seine Werkstatt, Lötgassen (das Sofa ist schon belegt).', 'delya_chips_gezogen',
      ['dantes-werkstatt', 'sofa'], { when: ALLE }),
    schritt('delya', 'Bring Delya die Geschichte (NX-1-Studio, Redaktion).', QUELLE, ['nx1-studio', 'redaktion'], { when: flag('delya_chips_gezogen') }),
  ],
  reward: { xp: 350, credits: 120, relations: { [D]: 120, [DA]: 40 }, rep: { 'nx1-medien': 20, unterstadt: 5 } },
};

const finden = (w: Wandler): DialogueDef => dlg(`p23-dq-${w.key}`, [
  node('start', [N(w.bild)], {
    choices: [
      cc('Den Chip mit dem Kommunikator stummschalten.', 'technik', chk(`dq-${w.key}-chip`, 'technik', 5, ['elektronik', 'chip', 'hacken']),
        { effects: [set(w.flag), zeit(40)] }),
      c('Einen Chip-Blocker hinters Ohr kleben.', 'blocker', { when: item('chip-blocker'), effects: [take('chip-blocker'), set(w.flag), zeit(40)] }),
      c(w.frei.text, 'frei', { effects: [set(w.flag), zeit(w.frei.minutes)] }),
      c('Am Arm packen und losziehen. Wer sich in den Weg stellt, hat Pech.', undefined, { effects: [fight(w.enc.id)] }),
      bye('Später wiederkommen.'),
    ],
  }),
  node('technik', [
    N('Ein Störimpuls, genau auf der Frequenz des Jingles. Das grüne Licht hinter dem Ohr flackert, wird gelb, dann aus. Der Blick wird weich, dann verwirrt, dann sehr müde.'),
    P('Komm. Da ist ein Sofa, das auf dich wartet. Es ist durchgesessen, aber ehrlich.'),
  ], { next: 'weg' }),
  node('blocker', [N('Der Blocker zischt leise. Das Licht hinter dem Ohr geht aus wie eine Kerze im Wind. Die Person blinzelt, gähnt und lässt sich führen.')], { next: 'weg' }),
  node('frei', w.frei.lines.map(N), { next: 'weg' }),
  node('weg', [N('Durch Gitter, Leitern und eine Gasse in den Lötgassen, bis Dantes Werkstatt nach Keksen riecht. Auf dem Sofa ist Platz. Noch.')], {
    effects: [msg(`${w.name} liegt auf Dantes Sofa.`)],
  }),
]);

// ------------------------------------------------------------------------------------------- Dante
const dante = dlg('p23-dq-dante', [
  node('start', [
    N('Dantes Sofa ist voll. Ede im Bademantel, Rosi mit Lockenwicklern, Bert mit einem Stück Glasfaser, das er nicht loslassen will. Alle drei schlafen. Alle drei summen.'),
    L(DA, 'Heiliges Kanonenrohr. Du hast mir eine Boyband gebracht. Eine summende, gechippte Boyband. Um Himmels Willen, wer hat denen das angetan?', 'ueberrascht'),
    L(DA, 'Okay. Pinzette, Lupe, Lötkolben auf kleinster Stufe. Und du hältst die Lampe. Wenn ich „Licht!“ sage, Licht. Wenn ich „Scheiße!“ sage, auch Licht, aber schneller.'),
  ], {
    choices: [
      cc('Selbst mit anpacken: den Chip lösen, während Dante die Leitung hält.', 'mit', chk('dq-dante-helfen', 'technik', 6, ['chip', 'reparieren', 'medizin'])),
      c('Die Lampe halten und Dante machen lassen.', 'lampe'),
    ],
  }),
  node('mit', [
    N('Drei Chips, drei Lötstellen, drei sehr ruhige Minuten. Dante redet die ganze Zeit. Über Kondensatoren, über Raven, über Kekse. Deine Hand zittert nicht. Seine schon, ein bisschen.'),
    L(DA, 'Du hast ruhige Hände. Das ist das Schönste, was ich je über jemanden gesagt hab. Und ich hab schon viel über Platten gesagt.', 'freude'),
  ], { effects: [rel(DA, 30)], next: 'wach' }),
  node('lampe', [
    N('Zwei Stunden. Dante flucht leise, präzise, mit Fachbegriffen. Bei Bert sagt er dreimal „Scheiße!“ und du hältst dreimal schneller Licht. Dann liegen drei Chips in einer Untertasse, und drei Menschen blinzeln.'),
  ], { effects: [zeit(120)], next: 'wach' }),
  node('wach', [
    N('Ede setzt sich auf: „Wo ist mein Handtuch?“ Rosi greift sich an die Lockenwickler: „Wer hat mich so gehen lassen?“ Bert sieht die Untertasse an und sagt: „Der war gratis. Am Werbestand. Ein Mann mit Kralle hat gesagt, er hilft beim Konzentrieren.“'),
    L(DA, 'Gratis. Natürlich. Das teuerste Wort der Welt.', 'wut'),
    L(DA, 'Ruf Delya an. Die will das hören. Und sag ihr, sie soll Kekse mitbringen. Meine sind alle.'),
  ], { effects: [set('delya_chips_gezogen'), cut('p23-dq-erwachen')] }),
]);

const erwachen = szene('p23-dq-erwachen', 'Drei auf dem Sofa', [
  tafel('Drei Chips in einer Untertasse. Sie glimmen noch eine Weile grün, als würden sie warten. Dann geben sie auf.'),
  tafel('Ede, Rosi und Bert sitzen nebeneinander auf Dantes Sofa, trinken Synth-Kaffee und erzählen dir alles. Wer, wann, wo. Ein Werbestand in der Neon-Gasse. „Freiwillige gesucht – Snacks inklusive!“', [
    L(DA, 'Ich hätte die Kekse nicht anbieten sollen. Die gehen jetzt nie wieder.', 'besorgt'),
  ]),
]);

// ------------------------------------------------------------------------------------------- Delya
const delya = dlg('p23-dq-delya', [
  node('start', [
    N('In der Redaktion ist es still, bis auf Delyas Tastatur. Sie hört dir zu, ohne zu tippen. Das hast du bei ihr noch nie erlebt.'),
    L(D, 'Drei Zeugen. Mit Namen, mit Gesicht, mit Chip in einer Untertasse. Und alle sagen dasselbe: Werbestand, Gratis-Chip, ein Mann mit Kralle.', 'ueberrascht'),
    L(D, 'Wenn ich das sende, hab ich morgen Quantum am Hals. Und den Sender. Und Collin, der fragt, warum er nicht moderieren darf.'),
  ], {
    choices: [
      c('„Sende es. Mit Namen. Die drei wollen das.“', 'senden'),
      c('„Sende es ohne Namen. Die drei haben genug durch.“', 'anonym'),
      cc('„Mach die Sendung wasserdicht. Ich besorg dir die Werbestand-Listen vom Quantum-Server.“', 'listen',
        chk('dq-delya-listen', 'technik', 7, ['hacken', 'daten'])),
      c('„Dass die Kralle dahintersteckt, weiß ich. Ich war dabei, als Aria …“', 'vex', { when: VEX }),
    ],
  }),
  node('senden', [L(D, 'Mit Namen. Ede hat schon gefragt, ob er seinen Bademantel tragen darf. Ich hab Ja gesagt. Das ist Journalismus.', 'freude')], { next: 'ende' }),
  node('anonym', [L(D, 'Ich nenne keine Namen. Das ist mein Satz. Schön, dass du ihn mir zurückgibst.', 'zaertlich')], { effects: [rel(D, 20)], next: 'ende' }),
  node('listen', [
    N('Ein Zugang über das Kantinennetz von Quantum, drei Umwege, ein Passwort, das „Master123“ lautet. Siebenhundert Namen. Siebenhundert Gratis-Chips. Delya wird blass, dann sehr ruhig.'),
    L(D, 'Das ist keine Geschichte mehr. Das ist eine Akte. Und ich hab sie.', 'signatur'),
  ], { effects: [set('delya_chipliste'), rel(D, 30)], next: 'ende' }),
  node('vex', [
    L(D, '… Du warst dabei. Ich frag nicht, was passiert ist. Wenn du es irgendwann erzählen willst: ohne Kamera. Nur ich, ein Notizbuch und ein Kaffee, der zu stark ist.', 'besorgt'),
  ], { next: 'ende' }),
  node('ende', [
    L(D, 'Heute Abend, Spätnachrichten. Ich schulde dir eine Quelle. Und ich vergesse nie, wem ich etwas schulde. Das macht mich unbeliebt. Und gut.', 'signatur'),
  ], { effects: [set(QUELLE), { news: 'p23-news-schlafwandler' }] }),
]);

export const part: ContentPart = {
  quests: { [Q]: quest },
  encounters: byId(...WANDLER.map((w) => w.enc)),
  dialogues: byId(...WANDLER.map(finden), dante, delya),
  cutscenes: byId(erwachen),
  news: {
    'p23-news-schlafwandler': {
      id: 'p23-news-schlafwandler', anchor: D, headline: 'Die Schlafwandler der Unterstadt', priority: 3,
      when: flag(QUELLE),
      lines: [
        L(D, 'Guten Abend. Drei Menschen aus der Unterstadt sind aufgewacht. Wochenlang liefen sie nachts durch Kanal und Datentunnel. Der Grund: ein Gratis-Chip vom Quantum-Werbestand.', 'neutral'),
        L(D, 'Quantum Industries war für eine Stellungnahme nicht zu erreichen. Ihr Werbestand in der Neon-Gasse schon. Er verteilt weiter Snacks. Wir raten ab.', 'signatur'),
      ],
    },
  },
  mapAdditions: karten([
    ...WANDLER.map((w): [string, ReturnType<typeof nutze>] =>
      [w.map, rede(`p23-dq-${w.key}`, w.spot, `Schlafwandler: ${w.name}`, `p23-dq-${w.key}`, all(AKTIV, noFlag(w.flag)))]),
    ['dantes-werkstatt', nutze('p23-dq-dante', 'sofa', 'Die Schlafwandler auf dem Sofa (Dante holen)', dante.id, all(AKTIV, ALLE, noFlag('delya_chips_gezogen')))],
    ['nx1-studio', rede('p23-dq-delya', 'redaktion', 'Delya die Geschichte bringen', delya.id, all(AKTIV, flag('delya_chips_gezogen'), noFlag(QUELLE)))],
  ]),
};
