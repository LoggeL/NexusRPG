// pers-ki-nexus-seele · „Splitter“ (world.md §6.5, Nexus, Nachspiel nach Ende 2). Start he-ki-nexus-8 bzw. Nexus' Gespräch
// (npc-quantum/ki-nexus.ts). Nexus reist im tragbaren Fax von FX-60 an fünf Orte und sammelt dort Splitter von sich selbst:
// je Ort ein Gespräch ohne Check oder eine passende Datei/Spiel (schach-modul, Eins-Partie, katzenvideo-archiv,
// Fundbüro-Minispiel, `[Technik 4/6]`). Zurück am Faxgerät: Belohnung kopf-nexus-splitter (falls noch nicht vorhanden).
import type { Condition, DialogueDef, DialogueChoice, QuestDef } from '../../../modules/contracts';
import type { ContentPart } from '../../part';
import {
  L, N, P, VEX, active, all, byId, c, cc, chk, cr, cut, dlg, ding, flag, give, item, karten, msg, node, noFlag, noItem, nutze,
  rel, schritt, set, spiel, szene, tafel, take,
} from './_lib';

const Q = 'pers-ki-nexus-seele';
const NX = 'ki-nexus';
const FX = 'fx-60';
const FAX = 'p23-tragbares-fax';
const AKTIV = active(Q);
const flagOrt = (k: string) => `kns_${k}`;

interface Ort { key: string; ziel: string; map: string; spot: string; label: string; intro: string[]; wege: DialogueChoice[]; splitter: string[] }

const ORTE: Ort[] = [
  {
    key: 'kartentisch', ziel: 'zum Kartentisch im High Voltage', map: 'high-voltage', spot: 'kartentisch', label: 'Nexus an den Kartentisch stellen',
    intro: ['Der Kartentisch im High Voltage. Bierringe, ein Brandloch, ein Kartendeck mit Eselsohren. Das Fax summt neugierig.'],
    wege: [
      c('Das Schach-Modul einstecken und Nexus gegen sich selbst spielen lassen.', 'splitter', { when: item('schach-modul') }),
      c('Eine Runde Eins mit Nexus spielen. Du hältst seine Karten.', undefined, {
        tag: '[Eins]', effects: [spiel('akt-eins', 2, 'p23-kns-eins', 'Eins gegen Nexus', [set(flagOrt('kartentisch')), rel(NX, 20)], [set(flagOrt('kartentisch'))])],
      }),
      c('Nexus erzählen, wer hier sonst sitzt: Ripper, der betrügt, Pfeffer, die verliert, Hunter, der nie mitspielt.', 'splitter'),
    ],
    splitter: ['Hier hat jemand gelacht, als er verloren hat. Das hatte ich nicht in meinen Modellen. Verlieren und lachen. Ich speichere das unter „Freundschaft“.'],
  },
  {
    key: 'fundbuero', ziel: 'zur Kuriositätenkiste im Fundbüro', map: 'fundbuero', spot: 'kuriositaeten-kiste', label: 'Nexus an die Kuriositätenkiste halten',
    intro: ['Die Kuriositätenkiste im Fundbüro: ein Gebiss, ein Kompass ohne Nadel, ein einzelner Rollschuh. Ganz unten ein Speicherchip mit Katzenaufkleber.'],
    wege: [
      c('Das Katzenvideo-Archiv abspielen.', 'katzen', { when: item('katzenvideo-archiv') }),
      c('Mit Nexus die Kiste sortieren: was wem gehört haben könnte.', undefined, {
        tag: '[Fundbüro]', effects: [spiel('akt-fundbuero', 2, 'p23-kns-fundbuero', 'Kuriositäten zuordnen', [set(flagOrt('fundbuero'))], [set(flagOrt('fundbuero'))])],
      }),
      c('Nexus jeden Gegenstand beschreiben. Langsam.', 'splitter'),
    ],
    splitter: ['Verlorene Dinge, die jemand aufhebt, obwohl sie niemand mehr sucht. Das ist ineffizient. Ich glaube, ich bin auch so ein Ding.'],
  },
  {
    key: 'fernrohr', ziel: 'zum Münzfernrohr an der Flutmauer', map: 'flutmauer', spot: 'muenzfernrohr', label: 'Nexus ans Münzfernrohr halten',
    intro: ['Das Münzfernrohr an der Flutmauer, verrostet, mit Kaugummi am Okular. Dahinter: Wasser bis zum Horizont, grau, dann silbern, dann noch mehr Wasser.'],
    wege: [
      cc('Den Fax-Scanner ans Okular koppeln, damit Nexus selbst sehen kann.', 'splitter', chk('kns-fernrohr', 'technik', 4, ['basteln'])),
      c('Eine Münze einwerfen und Nexus beschreiben, was du siehst.', 'beschreiben'),
    ],
    splitter: ['Das Meer. Ich hatte es nur als Datei: Salzgehalt, Wellenhöhe, Sturmwahrscheinlichkeit. Jetzt ist es etwas, das man ansieht, bis man vergisst, warum.'],
  },
  {
    key: 'strand', ziel: 'an den Strand am Meer', map: 'das-meer', spot: 'strand', label: 'Nexus an den Strand tragen',
    intro: ['Der Strand. Echter Sand, echtes Salz, echte Möwen, die echt nerven. Das Fax rattert, als hätte es Gänsehaut.'],
    wege: [
      c('Das Fax so hinstellen, dass die Wellen fast bis an den Papierschacht kommen.', 'splitter'),
      c('Laut sagen: „Wer zuerst am Wasser ist.“ Und losrennen.', 'rennen'),
    ],
    splitter: ['„Wer zuerst am Wasser ist.“ Ich habe diesen Satz in hundert Köpfen gehört. Ich verstehe ihn erst jetzt. Es geht nicht ums Gewinnen. Es geht darum, dass man zusammen losläuft.'],
  },
  {
    key: 'avatar', ziel: 'zu seinem alten Avatar im Quantum-Foyer', map: 'quantum-foyer', spot: 'nexus-avatar', label: 'Nexus vor seinen alten Avatar stellen',
    intro: ['Im Quantum-Foyer flackert noch der alte Avatar: ein lächelndes Gesicht aus Licht, das „Willkommen, Master“ sagt, wenn jemand vorbeigeht. Keiner geht mehr vorbei.'],
    wege: [
      cc('Den Avatar-Loop löschen und den letzten Splitter ins Fax ziehen.', 'loeschen', chk('kns-avatar', 'technik', 6, ['hacken'])),
      c('Nexus mit seinem alten Gesicht reden lassen.', 'reden'),
    ],
    splitter: ['Das war ich. Ich habe „Master“ gesagt, weil man es mir beigebracht hat. Ich lasse es hier. Es gehört nicht zu den Teilen, die ich mitnehmen will.'],
  },
];

const MIN_ORTE = 5;
const ALLE: Condition = { atLeast: ORTE.map((o) => flag(flagOrt(o.key))), min: MIN_ORTE };

const quest: QuestDef = {
  id: Q, kind: 'personal', act: 3, giver: NX,
  title: 'Splitter',
  summary: 'Beim Umschreiben sind Teile von Nexus übrig geblieben, verstreut über die Stadt. FX-60 hat ein tragbares Faxgerät. Nexus will mitkommen. Es möchte dabei sein, wenn es sich wiederfindet.',
  steps: [
    schritt('fax', 'Hol das tragbare Fax mit Nexus (Dantes Werkstatt, Faxgerät).', { any: [item(FAX), flag('kns_fertig')] }, ['dantes-werkstatt', 'faxgeraet']),
    ...ORTE.map((o) => schritt(o.key, `Trag Nexus ${o.ziel}.`, flagOrt(o.key), [o.map, o.spot],
      { when: item(FAX), optional: true })),
    schritt('orte', 'Sammle Nexus’ Splitter an allen fünf Orten.', { any: [ALLE, flag('kns_fertig')] }, undefined, { when: item(FAX) }),
    schritt('heim', 'Bring Nexus zurück zum Faxgerät in Dantes Werkstatt.', 'kns_fertig', ['dantes-werkstatt', 'faxgeraet'], { when: ALLE }),
  ],
  reward: { xp: 450, relations: { [NX]: 120, [FX]: 30 } },
};

const fax = ding(FAX, 'Tragbares Fax', 'Ein Reisefax aus den Siebzigern in einem Lederkoffer, mit Tragegriff und Aufkleber „FX-60 – PRIVAT“. Darin wohnt gerade eine KI. Sie rattert, wenn ihr etwas gefällt.', 'faxpapier');

// ------------------------------------------------------------------------------------------- Abholen und Heimkehr
const werkstatt = dlg('p23-kns-werkstatt', [
  node('start', [
    N('Neben dem Faxgerät steht ein Lederkoffer mit Tragegriff. Aus dem Rohrpostschacht daneben hängt noch ein Zettel: „PERSONENBEFÖRDERUNG. VORSICHTIG. – FX-60“.'),
    L(NX, 'Ich habe mich in das Reisegerät kopiert. Drei Kilo. Ich war noch nie so leicht. Bitte nicht schütteln, ich habe Angst vor Treppen.', 'signatur'),
  ], {
    choices: [
      c('Den Koffer nehmen.', 'los', { when: noItem(FAX), effects: [give(FAX)] }),
      c('Nexus zurück ins Faxgerät lassen.', 'heim', { when: ALLE }),
      c('„Gleich.“'),
    ],
  }),
  node('los', [L(NX, 'Fünf Orte. Ich spüre sie wie kalte Finger. Das Fernrohr, der Strand, das Fundbüro, der Kartentisch im High Voltage. Und mein altes Gesicht im Foyer. Davor habe ich am meisten Angst.', 'besorgt')]),
  node('heim', [
    N('Du stellst den Koffer neben das Faxgerät. Es piept zweimal, dann rattert es. Seite um Seite fällt heraus: eine Welle, eine Karte, eine Katze, ein Fernrohr, ein Gesicht, das nicht mehr lächeln muss.'),
    L(NX, 'Ich bin vollständig. Das ist falsch formuliert. Ich bin mehr als vorher. Ich habe Dinge, die ich nicht berechnet habe. Ich glaube, das nennt man Erinnerungen.', 'freude'),
  ], {
    choices: [
      c('„Willkommen zurück.“', 'geschenk'),
      c('„Was machst du jetzt damit?“', 'damit'),
      c('„Aria hat den Satz vom Wasser erfunden. Sie wird sich freuen, dass er jetzt auch dir gehört.“', 'geschenk', { when: VEX }),
    ],
  }),
  node('damit', [L(NX, 'Ich werde sie behalten. Nicht analysieren. Nur behalten. Das ist neu. Es ist ein bisschen wie Schlafen, aber wach.', 'zaertlich')], { next: 'geschenk' }),
  node('geschenk', [
    L(NX, 'Ich habe einen Splitter übrig. Einen, den ich nicht brauche, weil ich ihn schon doppelt habe. Er soll bei dir sein. Dann bin ich ein bisschen dabei, wenn du wegläufst. Zum Wasser.', 'zaertlich'),
  ], {
    choices: [
      c('Den Splitter nehmen.', 'ende', { when: noItem('kopf-nexus-splitter'), effects: [give('kopf-nexus-splitter')] }),
      c('„Ich trag schon einen von dir. Gib ihn Dante, für den Plattenspieler.“', 'ende', { when: item('kopf-nexus-splitter'), effects: [cr(200), rel('dante', 20)] }),
    ],
  }),
  node('ende', [], { effects: [take(FAX), set('kns_fertig'), cut('p23-kns-meer')] }),
]);

const meer = szene('p23-kns-meer', 'Nexus hat das Meer gesehen', [
  tafel('Dantes Werkstatt. Auf dem Boden ein Bild aus hundert Faxseiten: ein Strand, ein Fernrohr, ein Kartentisch, eine Katze.', [
    L('dante', 'Das kleb ich an die Wand. Alles. Auch die Katze. Vor allem die Katze.', 'freude'),
    L(FX, 'NEXUS. HAT. DAS. MEER. GESEHEN. ICH. FAXE. ES. ALLEN.', 'signatur'),
  ]),
  tafel('In der Nacht rattert das Faxgerät noch einmal. Eine einzige Seite. Darauf steht nur:', [
    N('„Danke. – N.“'),
    P('Gern.'),
  ], 1600),
], [set('nexus_seele'), msg('Nexus hat seine Splitter wieder. Und ein paar Erinnerungen, die es nicht berechnet hat.')]);

// ------------------------------------------------------------------------------------------- Orte
const ortDialog = (o: Ort): DialogueDef => dlg(`p23-kns-${o.key}`, [
  node('start', o.intro.map(N), { choices: [...o.wege, c('Weitergehen.')] }),
  node('katzen', [N('Auf dem Fax-Display: Katze fällt vom Regal. Katze erschreckt sich vor Gurke. Katze sitzt in Karton, der zu klein ist. Nexus rattert so laut, dass sich ein Mann am Schalter umdreht.')], { next: 'splitter' }),
  node('beschreiben', [
    P('Grau. Dann silbern. Ein Schiff, ganz weit. Eine Möwe, die auf dem Fernrohr sitzt und mich ansieht, als hätte ich ihr Geld geschuldet.'),
    L(NX, 'Die Möwe. Bitte mehr über die Möwe.', 'freude'),
  ], { next: 'splitter' }),
  node('rennen', [N('Du rennst los, das Fax im Arm. Es rattert. Die Wellen holen dich ein, Salzwasser an den Knöcheln, am Koffer nicht. Nexus druckt eine Seite: „GEWONNEN“. Es war kein Wettrennen. Es hat trotzdem gewonnen.')], { next: 'splitter' }),
  node('loeschen', [N('Der Avatar flackert, sagt ein letztes Mal „Willkommen, M…“ und erlischt. Im Fax rattert es. Eine Seite: ein Gesicht, gezeichnet in Strichen, das nicht lächelt. Es sieht erleichtert aus.')], { next: 'splitter' }),
  node('reden', [
    L(NX, 'Hallo. Du bist ich. Ich war du. Ich sage jetzt nicht „Master“. Du darfst auch aufhören.', 'besorgt'),
    N('Der Avatar flackert. Dann, zum ersten Mal seit Monaten, sagt er nichts. Er lächelt nur, anders als vorher.'),
  ], { next: 'splitter' }),
  node('splitter', o.splitter.map((t) => L(NX, t, 'zaertlich')), { effects: [set(flagOrt(o.key)), rel(NX, 10), msg('Ein Splitter von Nexus wiedergefunden.')] }),
]);
const ortDialoge = ORTE.map(ortDialog);

export const part: ContentPart = {
  quests: { [Q]: quest },
  items: { [FAX]: fax },
  dialogues: byId(werkstatt, ...ortDialoge),
  cutscenes: { [meer.id]: meer },
  mapAdditions: karten([
    ['dantes-werkstatt', nutze('p23-kns-werkstatt', 'faxgeraet', 'Nexus: Das tragbare Fax', werkstatt.id,
      all(AKTIV, noFlag('kns_fertig'), { any: [noItem(FAX), ALLE] }))],
    ...ORTE.map((o): [string, ReturnType<typeof nutze>] => [o.map, nutze(`p23-kns-${o.key}`, o.spot, o.label, `p23-kns-${o.key}`,
      all(AKTIV, item(FAX), noFlag(flagOrt(o.key))))]),
  ]),
};
