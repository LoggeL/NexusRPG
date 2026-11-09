// side-drohnenrennen „Rostkai-Rallye“ (world.md §6.2 Nr. 21) · Dexter · hafenkante (Rostkai-Kräne) · Fr A, danach wöchentlich
// (das freie Rennen am Hotspot `drohnenrennen` der Zone).
// Schritte: Renndrohne bauen (Rahmen Dexter, Motor Gustav, Steuerchip) → drei Läufe gegen Turbo-Tilda.
// Wege: fahren und gewinnen (akt-drohnenrennen) · gc-82 Abkürzung durchs Kranfundament · Turbomotor 250 Cr (leichter)
// · Tildas Drohne manipulieren (Ruf unterstadt −5) · [Nyra ♥4] Nyra programmiert den Chip (leichter).
import type { ContentPart } from '../../part';
import type { CheckDef, CutsceneDef, DialogueChoice, DialogueDef, Effect, ItemDef, QuestDef } from '../../../modules/contracts';
import { L, N, P, active, all, any, bye, done, flag, hearts, inactive, item, msg, node, noFlag, not, rel, set, tafel, time, welt } from './_lib';

const Q = 'side-drohnenrennen';
const DX = 'dexter';
const T = 'turbo-tilda';

const RAHMEN = item('renndrohne-rahmen');
const MOTOR = any(item('renndrohne-motor'), item('renndrohne-turbomotor'));
const CHIP = item('renndrohne-steuerchip');
const GEBAUT = flag('dr_gebaut');
const RENNABEND = all({ weekday: 'fr' }, time('abend'));
const LEICHT = any(flag('dr_turbo'), flag('dr_nyra'));

const quest: QuestDef = {
  id: Q,
  kind: 'side',
  title: 'Rostkai-Rallye',
  summary: 'Turbo-Tilda gewinnt jedes Drohnenrennen an den Rostkai-Kränen. Dexter will sie schlagen. Mit einer Drohne, die es noch nicht gibt. Gebaut von dir.',
  giver: DX,
  act: 1,
  steps: [
    { id: 'rahmen', text: 'Den Rahmen hat Dexter. Hol ihn ab.', done: any(RAHMEN, GEBAUT), marker: { map: 'schrottmarkt', at: [1172, 284] } },
    {
      id: 'motor', text: 'Einen Motor von Opa Gustav (tags am Schrottkram-Stand) – den alten gratis, den Turbo für 250 Cr.',
      done: any(MOTOR, GEBAUT), marker: { map: 'schrottmarkt', at: [500, 732] },
    },
    {
      id: 'chip', text: 'Einen Steuerchip: am Elektronikstand kaufen, Nyra programmieren lassen, oder auf der Halde einen ausschlachten.',
      done: any(CHIP, GEBAUT), marker: { map: 'schrottmarkt', at: [1022, 724] },
    },
    {
      id: 'bauen', text: 'Bei Dexter im Wellblechbüro die Drohne zusammenbauen.',
      done: GEBAUT, when: all(any(RAHMEN, GEBAUT), any(MOTOR, GEBAUT), any(CHIP, GEBAUT)), marker: { map: 'schrottmarkt', at: [1172, 284] },
    },
    {
      id: 'rennen', text: 'Freitagabend an den Rostkai-Kränen: drei Läufe gegen Turbo-Tilda.',
      done: flag('dr_sieg_3'), when: GEBAUT, marker: { map: 'hafenkante', at: [1120, 560] },
    },
  ],
  reward: {
    xp: 180,
    credits: 400,
    items: { 'schallplatte-04': 1, 'rostlaube-zuendkerze': 1 },
    relations: { [DX]: 60 },
    effects: [msg('Die Rostkai-Rallye läuft jetzt jeden Freitagabend. Tilda will Revanche. Jede Woche.')],
  },
};

// --------------------------------------------------------------------------------------------- Dexter
const auftrag: DialogueDef = {
  id: 'dr-dexter-auftrag',
  start: 'start',
  nodes: [
    node('start', [
      N('In Dexters Wellblechbüro hängt ein Poster: Turbo-Tilda mit Siegerpokal. Jemand hat ihr mit Kuli einen Schnurrbart gemalt. Und Teufelshörner. Und „ARROGANT“ auf die Stirn.'),
      L(DX, 'Die. Die da. Turbo-Tilda. Sieben Jahre ungeschlagen bei der Rostkai-Rallye. Jeden Freitag. Und jeden Freitag verliere ich gegen sie und muss ihr eine Runde ausgeben. Ich hab keine Credits für Runden!'),
      L(DX, 'Ich hab einen Rahmen. Einen guten Rahmen. Carbon, aus einem Quantum-Lieferdrohnen-Wrack. Mir fehlt nur … alles andere. Motor. Chip. Pilot. Talent.'),
    ], {
      choices: [
        { text: '„Ich bau dir das Ding. Und ich fahr.“', next: 'ja' },
        { text: '„Was springt dabei raus?“', next: 'preis' },
        bye('„Kauf dir ein anderes Hobby, Dexter.“'),
      ],
    }),
    node('preis', [
      L(DX, 'Das Preisgeld! Vierhundert Credits! Und eine seltene Platte, die Tilda letztes Jahr gewonnen hat und als Einsatz anbietet, weil sie sie nicht mag. Und eine Zündkerze. Die ist wertvoller, als sie klingt.'),
      L(DX, 'Also, das Preisgeld kriegst du. Ich will nur Tildas Gesicht sehen. Das ist mein Preis. Ihr Gesicht.'),
    ], { next: 'ja' }),
    node('ja', [
      L(DX, 'Hier, der Rahmen. Motor: frag Gustav, der hat eine ganze Kiste davon und erzählt dir zu jedem eine Geschichte. Chip: Nyra am Elektronikstand. Die ist ein Genie. Ein beängstigendes Genie.'),
      L(DX, 'Und dann bauen wir zusammen. Hier. Freitag ist Rennen. Abends. An den Kränen.'),
    ], { effects: [{ give: 'renndrohne-rahmen' }, { startQuest: Q }], choices: [{ text: '„Wird gemacht.“' }] }),
  ],
};

const bauen: DialogueDef = {
  id: 'dr-dexter-bauen',
  start: 'start',
  nodes: [
    node('start', [
      L(DX, 'Du hast alles? ALLES? Leg’s auf den Tisch. Nicht auf den Stuhl, der Stuhl gehört der Bank.'),
      N('Rahmen, Motor, Chip. Dexter schraubt, du lötest, und irgendwann zwischen zwei Flüchen und einem Stromschlag steht auf dem Tisch eine Renndrohne. Mattschwarz, zwei Propeller, eine LED-Leiste, die „DEXTER RACING“ in den Abend blinkt.'),
      L(DX, 'Sie ist wunderschön. Ich hab Tränen in den Augen. Das kann aber auch der Lötrauch sein.'),
    ], {
      effects: [
        { take: 'renndrohne-rahmen' }, { take: 'renndrohne-steuerchip' }, set('dr_gebaut'), { give: 'renndrohne' }, { advanceTime: 60 },
        msg('Die Renndrohne ist fertig. Freitagabend: Rostkai-Kräne.'),
      ],
      choices: [{ text: 'Motor einbauen.', next: 'motor' }],
    }),
    node('motor', [N('Der Motor schnurrt im Rumpf. Bereit für Freitag.')], {
      effects: [],
      choices: [
        { text: 'Weiter.', when: item('renndrohne-turbomotor'), effects: [{ take: 'renndrohne-turbomotor' }] },
        { text: 'Weiter.', when: all(not(item('renndrohne-turbomotor')), item('renndrohne-motor')), effects: [{ take: 'renndrohne-motor' }] },
        { text: 'Weiter.', when: all(not(item('renndrohne-turbomotor')), not(item('renndrohne-motor'))) },
      ],
    }),
  ],
};

// --------------------------------------------------------------------------------------------- Gustav (Motor)
const gustav: DialogueDef = {
  id: 'dr-gustav-motor',
  start: 'start',
  nodes: [
    node('start', [
      L('opa-gustav', 'Ein Motor für eine Renndrohne? Für Dexter? Hihi. Der Junge verliert seit sieben Jahren gegen Tilda. Früher war hier alles grün, weißt du. Und Dexter hat damals schon verloren.'),
      N('Opa Gustav zieht eine Kiste unter dem Stand hervor. Darin: Elektromotoren, sortiert nach Jahrgang, jeder mit einem Zettel.'),
      L('opa-gustav', 'Den hier hab ich aus einem Rasenmäher von 2052. Ein Rasenmäher! Damals gab’s noch Rasen. Den kriegst du geschenkt, wenn du dir die Geschichte anhörst.'),
      L('opa-gustav', 'Und den hier – Turbo. Aus einem Polizeigleiter. Der ist schneller als Tilda, schneller als die Möwen, schneller als dein Verstand. Zweihundertfünfzig.'),
    ], {
      choices: [
        { text: 'Sich die Rasenmäher-Geschichte anhören.', next: 'geschichte' },
        { text: 'Den Turbomotor kaufen (250 Cr).', requires: { credits: 250 }, effects: [{ credits: -250 }, { give: 'renndrohne-turbomotor' }, set('dr_turbo')], next: 'turbo' },
        bye('„Ich überleg’s mir.“'),
      ],
    }),
    node('geschichte', [
      L('opa-gustav', 'Also. Es war Sommer 2052. Elsa hatte ein gelbes Kleid an. Ich hab den Rasen gemäht, und sie hat Limonade gebracht, und der Mäher hat einen Stein erwischt, und der Stein flog durchs Küchenfenster, und Elsa hat gelacht, und ich hab gewusst: Die heirat ich.'),
      N('Er schweigt einen Moment. Dann drückt er dir den Motor in die Hand.'),
      L('opa-gustav', 'Pass gut auf ihn auf. Er hat schon mal jemanden glücklich gemacht.'),
    ], { effects: [{ give: 'renndrohne-motor' }, rel('opa-gustav', 30), { advanceTime: 20 }] }),
    node('turbo', [L('opa-gustav', 'Pass auf, dass du nicht in die Kräne knallst. Der Turbo hat keinen Rückwärtsgang. Wie das Leben.')]),
  ],
};

// --------------------------------------------------------------------------------------------- Chip
const chipCheck: CheckDef = welt('dr-chip-ausschlachten', 'technik', 4, ['reparieren', 'drohne'], '[Technik 4]');
const nyra: DialogueDef = {
  id: 'dr-nyra-chip',
  start: 'start',
  nodes: [
    node('start', [
      L('nyra', 'Steuerchip für eine Renndrohne? Für Dexter? Gegen Tilda? Oh, oh, warte – Tilda fliegt mit einer adaptiven Kurvenroutine, ich hab ihre Funkfrequenz letzten Freitag mitgeschnitten, aus Versehen, also absichtlich aus Versehen –'),
    ], {
      choices: [
        { text: '„Kannst du einen Chip programmieren, der sie schlägt?“', tag: '[Nyra ♥4]', requires: hearts('nyra', 4), next: 'programm' },
        { text: 'Einen Standard-Steuerchip kaufen (80 Cr).', requires: { credits: 80 }, effects: [{ credits: -80 }, { give: 'renndrohne-steuerchip' }], next: 'gekauft' },
        bye('„Danke, später.“'),
      ],
    }),
    node('programm', [
      L('nyra', 'Kann ich? KANN ICH? Gib mir eine halbe Stunde und einen Synth-Kaffee. Nein, keinen Kaffee, ich zittere schon so.'),
      N('Nyra tippt so schnell, dass ihr Laptop zu qualmen beginnt. Sie macht ein Selfie mit dem Chip. Sie macht ein Selfie mit dir und dem Chip. Dann drückt sie ihn dir in die Hand, noch warm.'),
      L('nyra', 'Der liest Tildas Linie und fliegt sie innen. Wenn Dante fragt: Ich hab nichts gehackt. Ich hab … optimiert.'),
    ], { effects: [{ give: 'renndrohne-steuerchip' }, set('dr_nyra'), rel('nyra', 30), { advanceTime: 30 }] }),
    node('gekauft', [L('nyra', 'Standardchip. Fliegt geradeaus. Und in Kurven. Meistens. Viel Glück!')]),
  ],
};

const halde: DialogueDef = {
  id: 'dr-halde-chip',
  start: 'start',
  nodes: [
    node('start', [N('Auf der Halde liegt das Wrack einer Lieferdrohne, Rumpf aufgeplatzt. Im Inneren blinkt noch ein grünes Lämpchen. Der Steuerchip ist verlötet, verschmort und verdammt fest.')], {
      choices: [
        { text: 'Den Chip vorsichtig auslöten.', check: chipCheck, effects: [{ give: 'renndrohne-steuerchip' }], next: 'ok' },
        bye('Liegen lassen.'),
      ],
    }),
    node('ok', [N('Zischen, Rauch, ein leiser Fluch. Dann liegt der Chip in deiner Hand. Er blinkt beleidigt, aber er lebt.')]),
  ],
};

// --------------------------------------------------------------------------------------------- Tildas Box (Sabotage)
const box: DialogueDef = {
  id: 'dr-tilda-box',
  start: 'start',
  nodes: [
    node('start', [
      N('Tildas Box an der Hafenkante: ein Container mit Rolltor, halb offen. Drinnen, auf einem Samtkissen, ihre Renndrohne. Rot lackiert, „TURBO“ in goldenen Lettern. Tilda ist nicht da. Ihr Kaffeebecher ist noch warm.'),
    ], {
      choices: [
        { text: 'Einen Propeller ein bisschen lockern. Nur ein bisschen.', next: 'sabotage' },
        bye('Finger weg. So gewinnt man nicht.'),
      ],
    }),
    node('sabotage', [
      N('Eine halbe Umdrehung an einer Schraube. Niemand sieht es. Außer einer Möwe auf dem Containerdach, die dich sehr vorwurfsvoll anguckt.'),
      N('Irgendwer wird es trotzdem mitkriegen. In der Unterstadt kriegt man immer alles mit.'),
    ], { effects: [set('dr_sabotage'), { rep: 'unterstadt', delta: -5 }] }),
  ],
};

// --------------------------------------------------------------------------------------------- Die Läufe
const lauf = (n: number, next: string): DialogueChoice[] => {
  const key = `dr-lauf-${n}`;
  const sieg: Effect[] = [{ setFlag: `dr_sieg_${n}` }, { message: `Lauf ${n}: gewonnen!` }, { dialogue: next }];
  const lose: Effect[] = [{ message: 'Tilda zieht vorbei. Die Möwen jubeln. Noch mal, solange der Abend jung ist.' }, { advanceTime: 15 }];
  const okay = all(flag(`dr_sieg_${n - 1}`), noFlag(`dr_sieg_${n}`));
  const erste = n === 1 ? noFlag('dr_sieg_1') : okay;
  return [
    {
      id: `${key}-normal`, text: `Lauf ${n}: Abheben.`, when: all(erste, not(LEICHT)),
      effects: [{ minigame: 'akt-drohnenrennen', level: 3, key, label: `Rostkai-Rallye · Lauf ${n}`, win: sieg, lose }],
    },
    {
      id: `${key}-leicht`, text: `Lauf ${n}: Abheben. (${n === 1 ? 'Turbo/Nyras Chip' : 'Vorteil'} an Bord)`, when: all(erste, LEICHT),
      effects: [{ minigame: 'akt-drohnenrennen', level: 2, key, label: `Rostkai-Rallye · Lauf ${n}`, win: sieg, lose }],
    },
    {
      id: `${key}-abkuerzung`, text: `Lauf ${n}: Mitten durchs Kranfundament. Da passt man nur durch, wenn man nicht zuckt.`, when: erste, check: 'gc-82',
      effects: sieg,
    },
    {
      id: `${key}-sabotage`, text: `Lauf ${n}: Zusehen, wie Tildas Propeller in der ersten Kurve eiert.`, when: all(erste, flag('dr_sabotage')),
      effects: sieg,
    },
  ];
};

const rennen: DialogueDef = {
  id: 'dr-rennen',
  start: 'start',
  nodes: [
    node('start', [
      N('Freitagabend an den Rostkai-Kränen. Zwischen den Auslegern blinken Ringe, Wetten gehen von Hand zu Hand. Dexter steht neben dir und kaut auf seinem Ärmel.'),
      L(T, 'Na sieh mal an. Dexter hat sich einen Piloten gekauft. Was zahlt er dir? Gutscheine?'),
      L(T, 'Drei Läufe, Neuling. Wer zwei verliert, zahlt die Runde. Wer drei gewinnt, kriegt den Pott. Und meinen Respekt. Aber den kriegt keiner.'),
    ], {
      choices: [
        ...lauf(1, 'dr-nach-lauf-1'),
        ...lauf(2, 'dr-nach-lauf-2'),
        ...lauf(3, 'dr-sieg'),
        bye('„Moment noch, ich muss die Propeller putzen.“'),
      ],
    }),
  ],
};

const nachLauf = (n: number, lines: ReturnType<typeof L>[]): DialogueDef => ({
  id: `dr-nach-lauf-${n}`,
  start: 'start',
  nodes: [node('start', lines, { choices: [{ text: 'Weiter zum nächsten Lauf.', next: 'weiter' }, bye('Kurz durchatmen.')] }), node('weiter', [], { effects: [{ dialogue: 'dr-rennen' }] })],
});

const nach1 = nachLauf(1, [
  L(T, '… Glück. Das war Glück. Die Möwe war im Weg.'),
  L(DX, 'Die Möwe war auf UNSERER Seite! Die Möwe ist Team Dexter!'),
]);
const nach2 = nachLauf(2, [
  N('Tilda nimmt den Helm ab. Sie lacht nicht mehr.'),
  L(T, 'Okay. Okay. Du fliegst nicht schlecht. Für jemanden mit einer Drohne aus Rasenmäherteilen.'),
]);

const sieg: DialogueDef = {
  id: 'dr-sieg',
  start: 'start',
  nodes: [node('start', [], { effects: [{ cutscene: 'dr-siegerehrung' }] })],
};

const siegerehrung: CutsceneDef = {
  id: 'dr-siegerehrung',
  title: 'Rostkai-Rallye',
  beats: [
    tafel('Dritter Lauf. Letzte Kurve am Kran Nummer sieben. Deine Drohne zieht innen vorbei, so knapp am Ausleger, dass die LED-Leiste Funken schlägt.', undefined, 'in'),
    tafel('Die Zuschauer brüllen. Irgendwer wirft einen Hut. Dexter fällt auf die Knie und weint ganz offen.', [
      L(DX, 'Sieben Jahre! SIEBEN JAHRE! Tilda! Guck mich an! Guck mir ins Gesicht! Das ist mein Siegergesicht!'),
      L(T, 'Ich seh es, Dexter. Es ist fleckig.'),
    ]),
    tafel('Tilda drückt dir das Preisgeld, eine Schallplatte und eine Zündkerze in die Hand. Dann hält sie dir die Hand hin.', [
      L(T, 'Nächsten Freitag. Revanche. Und dann flieg ich nicht mehr nett.'),
      P('Das war nett?'),
      L(T, 'Das war Tilda auf halber Kraft. Bis Freitag, Rennsemmel.'),
    ]),
  ],
  effects: [set('dr_sieg_3'), rel(T, 40), { completeQuest: Q }],
};

// --------------------------------------------------------------------------------------------- Gegenstände
const Qi = (id: string, name: string, description: string): ItemDef =>
  ({ id, name, category: 'quest', icon: id, price: 0, sellable: false, description });
const items: Record<string, ItemDef> = {
  'renndrohne-rahmen': Qi('renndrohne-rahmen', 'Drohnenrahmen', 'Carbon aus einem Quantum-Lieferdrohnen-Wrack. Leicht, stabil, ein bisschen gestohlen.'),
  'renndrohne-motor': Qi('renndrohne-motor', 'Rasenmäher-Motor (2052)', 'Opa Gustavs alter Rasenmähermotor. Er hat schon mal jemanden glücklich gemacht.'),
  'renndrohne-turbomotor': Qi('renndrohne-turbomotor', 'Turbomotor', 'Aus einem Polizeigleiter. Kein Rückwärtsgang. Wie das Leben.'),
  'renndrohne-steuerchip': Qi('renndrohne-steuerchip', 'Steuerchip', 'Ein Drohnen-Steuerchip. Fliegt geradeaus. Und in Kurven. Meistens.'),
  renndrohne: Qi('renndrohne', 'Renndrohne „Dexter Racing“', 'Mattschwarz, zwei Propeller, eine LED-Leiste, die „DEXTER RACING“ in den Abend blinkt.'),
};

export const part: ContentPart = {
  quests: { [Q]: quest },
  dialogues: {
    [auftrag.id]: auftrag, [bauen.id]: bauen, [gustav.id]: gustav, [nyra.id]: nyra, [halde.id]: halde, [box.id]: box,
    [rennen.id]: rennen, [nach1.id]: nach1, [nach2.id]: nach2, [sieg.id]: sieg,
  },
  cutscenes: { [siegerehrung.id]: siegerehrung },
  items,
  mapAdditions: {
    schrottmarkt: {
      hotspots: [
        {
          id: 'dr-dexter-auftrag', at: 'dexter-buero', label: 'Dexter: Turbo-Tilda schlagen', kind: 'talk', dialogue: auftrag.id,
          when: all(inactive(Q), done('main-1-dexter'), time('tag', 'abend', 'nacht')),
        },
        {
          id: 'dr-dexter-bauen', at: 'dexter-buero', label: 'Mit Dexter die Drohne bauen', kind: 'use', dialogue: bauen.id,
          when: all(active(Q), RAHMEN, MOTOR, CHIP, noFlag('dr_gebaut'), time('tag', 'abend', 'nacht')),
        },
        {
          id: 'dr-gustav-motor', at: 'schrottkram-stand', label: 'Opa Gustav: Motor', kind: 'talk', dialogue: gustav.id,
          when: all(active(Q), not(MOTOR), noFlag('dr_gebaut'), time('tag')),
        },
        {
          id: 'dr-nyra-chip', at: 'elektronikstand', label: 'Nyra: Steuerchip', kind: 'talk', dialogue: nyra.id,
          when: all(active(Q), not(CHIP), noFlag('dr_gebaut'), time('tag')),
        },
        {
          id: 'dr-halde-chip', at: 'halde', label: 'Drohnenwrack ausschlachten', kind: 'use', dialogue: halde.id,
          when: all(active(Q), not(CHIP), noFlag('dr_gebaut')),
        },
      ],
    },
    hafenkante: {
      hotspots: [
        {
          id: 'dr-rennen', at: 'rostkai-kraene', label: 'Rostkai-Rallye gegen Turbo-Tilda', kind: 'talk', dialogue: rennen.id,
          when: all(active(Q), GEBAUT, RENNABEND, noFlag('dr_sieg_3')),
        },
        {
          id: 'dr-tilda-box', at: 'tildas-box', label: 'Tildas Box', kind: 'use', dialogue: box.id,
          when: all(active(Q), GEBAUT, noFlag('dr_sabotage'), time('morgen', 'nacht')),
        },
        {
          id: 'dr-tilda-tag', at: 'tildas-box', label: 'Turbo-Tilda', kind: 'talk', when: all(active(Q), time('tag')),
          lines: [
            L(T, 'Dexters neuer Pilot? Süß. Freitagabend, Kräne. Bring Taschentücher mit. Für Dexter.'),
          ],
        },
      ],
    },
  },
};
