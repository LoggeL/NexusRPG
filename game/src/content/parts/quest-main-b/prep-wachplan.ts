// Vorbereitung prep-wachplan „Patrouillenzeiten“ (world.md §5.2). Bonus im Bruch: Patrouillen sichtbar, Schichtwechsel 01:00.
// Wege: mit Vega abends von der Fußgängerbrücke beobachten (Vega ♥ +60) · gc-25 Wachmann am Brezel-Imbiss (tags) ·
// Wachplan nachts aus der Lieferzone im Digitech-Areal stehlen (Schlossknacken).
import type { ContentPart } from '../../part';
import type { DialogueDef, Effect, QuestDef } from '../../../modules/contracts';
import { active, all, any, flag, l, nar } from './_lib';

const Q = 'prep-wachplan';
const PLAN = 'wachplan-campus';
const OFFEN = all(active(Q), { noItem: PLAN });
const PLAN_HER = (weg: string): Effect[] => [{ give: PLAN }, { setFlag: weg }];

const quest: QuestDef = {
  id: Q,
  kind: 'main',
  title: 'Vorbereitung: Patrouillenzeiten',
  summary: 'Wann laufen die Streifen, wann trinken sie Kaffee, wann schaut keiner hin? Vega will es wissen. Auf die Minute.',
  giver: 'vega',
  act: 1,
  autoStart: flag('plan_gefasst'),
  steps: [
    {
      id: 'wachplan',
      text: 'Finde heraus, wann die Quantum-Streifen am Campus wechseln.',
      done: any({ item: PLAN }, { questStep: Q, step: 'weg-vega' }, { questStep: Q, step: 'weg-imbiss' }, { questStep: Q, step: 'weg-lieferzone' }),
    },
    {
      id: 'weg-vega',
      text: 'Weg: Abends liegt Vega auf der Fußgängerbrücke am Stufenplatz und zählt Streifen. Leg dich dazu.',
      done: flag('wachplan_vega'),
      optional: true,
      marker: { map: 'stufenplatz', at: 'fussgaengerbruecke' },
    },
    {
      id: 'weg-imbiss',
      text: 'Weg: Tagsüber macht ein Quantum-Wachmann Pause am Brezel-Imbiss. Er kann Xion Venom nicht ausstehen.',
      done: flag('wachplan_imbiss'),
      optional: true,
      marker: { map: 'stufenplatz', at: 'brezel-imbiss' },
    },
    {
      id: 'weg-lieferzone',
      text: 'Weg: Nachts liegt der Dienstplan in einer Kiste in der Lieferzone des Digitech-Areals.',
      done: flag('wachplan_lieferzone'),
      optional: true,
      marker: { map: 'digitech-areal', at: 'lieferzone' },
    },
  ],
  reward: {
    xp: 50,
    effects: [
      { setFlag: 'prep_wachplan' },
      { message: 'Planungstafel: Patrouillenzeiten abgehakt. Im Bruch: Streifen sichtbar, Schichtwechsel um 01:00.' },
    ],
  },
};

const bruecke: DialogueDef = {
  id: 'prep-wachplan-vega',
  start: 'start',
  nodes: [
    {
      id: 'start',
      lines: [
        nar('Vega liegt bäuchlings auf dem Geländer der Fußgängerbrücke, das Zielfernrohr auf den Campus gerichtet, als wäre das die normalste Feierabendbeschäftigung der Welt.'),
        l('vega', 'Du bist spät. Leg dich hin. Nein, nicht da. Da sieht dich die Kamera auf dem Fahnenmast. Hier. Zwei Meter links.', 'neutral'),
        l('vega', 'Wir zählen. Jede Streife, jede Pause, jeden Kaffee. Das dauert. Du darfst nicht reden. Du darfst atmen. Leise.', 'neutral'),
      ],
      choices: [
        { text: 'Hinlegen. Stundenlang still liegen und zählen.', next: 'zaehlen' },
        { text: '„Später, Vega.“', next: 'spaeter' },
      ],
    },
    {
      id: 'spaeter',
      lines: [l('vega', 'Die Streifen laufen auch später. Ich auch.', 'neutral')],
    },
    {
      id: 'zaehlen',
      lines: [
        nar('Drei Stunden. Ein Wachmann gähnt elfmal. Einer kratzt sich an Stellen, über die Vega nichts notiert. Ein Dritter füttert heimlich eine Taube.'),
        nar('Um 01:00 wechselt die Schicht, und für vier Minuten schaut am Westtor niemand hin.'),
        l('vega', 'Vier Minuten. Das ist eine Ewigkeit.', 'freude'),
        l('vega', 'Du hast nicht einmal geredet. Respekt. Hunter hätte nach zehn Minuten über Geld geredet und Aria nach zwei über Essen.', 'freude'),
        nar('Sie reißt dir die Seite aus ihrem Notizbuch heraus. Jede Streife, jede Pause, jeder Kaffee. In einer Handschrift, die aussieht wie ein Fadenkreuz.'),
      ],
      effects: [{ advanceTime: 180 }, ...PLAN_HER('wachplan_vega'), { relation: 'vega', delta: 60 }],
    },
  ],
};

const imbiss: DialogueDef = {
  id: 'prep-wachplan-brezel',
  start: 'start',
  nodes: [
    {
      id: 'start',
      lines: [
        nar('Ein Quantum-Wachmann kaut an einer Brezel, so groß wie ein Lenkrad. Auf seinem Namensschild steht „Hallo, ich bin GERNOT“. Gernot sieht nicht so aus, als würde er gern Hallo sagen.'),
        l('wachmann-brezel', 'Was? Ich hab Pause. Pause heißt Pause. Pause heißt nicht „Herr Wachmann, wo ist das Klo“.'),
      ],
      choices: [
        { text: '„Hast du gehört, was Xion Venom letzte Woche über eure Nachtschicht erzählt hat?“', check: 'gc-25', next: 'klatsch' },
        { text: '„Wo ist denn das Klo?“', next: 'klo' },
        { text: 'Gernot in Ruhe kauen lassen.' },
      ],
    },
    {
      id: 'klo',
      lines: [l('wachmann-brezel', 'Ich hab’s gewusst. Ich hab’s GEWUSST. Hinter dem Salon. Und jetzt verpiss dich.')],
    },
    {
      id: 'klatsch',
      lines: [
        l('wachmann-brezel', 'Xion? Was hat der gesagt? WAS hat der gesagt?'),
        l('player', 'Dass die Nachtschicht am Westtor schläft.'),
        l('wachmann-brezel', 'Schläft?! Wir schlafen nicht! Wir WECHSELN! Um eins! Pünktlich! Vier Minuten Übergabe, das ist Vorschrift! Und Streife B geht immer erst zum Kaffeeautomaten, weil der auf der Ostseite keinen Zucker hat, und Bernd –'),
        nar('Er erzählt dir den kompletten Dienstplan. Mit Pausen. Mit Namen. Mit einem Kollegen namens Bernd, den er aus tiefstem Herzen hasst.'),
        l('wachmann-brezel', 'Das kannst du Xion ausrichten! Und Bernd auch!'),
      ],
      effects: PLAN_HER('wachplan_imbiss'),
    },
  ],
};

export const part: ContentPart = {
  quests: { [Q]: quest },
  dialogues: { [bruecke.id]: bruecke, [imbiss.id]: imbiss },
  mapAdditions: {
    stufenplatz: {
      hotspots: [
        { id: 'prep-wachplan-bruecke', at: 'fussgaengerbruecke', label: 'Mit Vega die Streifen beobachten', kind: 'use', dialogue: bruecke.id, when: all(OFFEN, { time: 'abend' }) },
        { id: 'prep-wachplan-imbiss', at: 'brezel-imbiss', label: 'Quantum-Wachmann in der Pause', kind: 'talk', dialogue: imbiss.id, when: all(OFFEN, { time: 'tag' }) },
      ],
    },
    'digitech-areal': {
      hotspots: [
        {
          id: 'prep-wachplan-kiste',
          at: 'lieferzone',
          label: 'Kiste mit Dienstplänen',
          kind: 'use',
          when: all(OFFEN, { time: 'nacht' }),
          lines: [nar('Eine Metallkiste mit Quantum-Logo und einem Vorhängeschloss, das teurer aussieht als die Kiste. Daneben ein Zettel: „Dienstpläne Campus – NICHT HIER LIEGEN LASSEN“. Liegt hier.')],
          effects: [{
            minigame: 'akt-schloss', level: 2, key: 'prep-wachplan-kiste', label: 'Vorhängeschloss knacken',
            win: [...PLAN_HER('wachplan_lieferzone'), { message: 'Klick. Der Dienstplan des Campus, mit Kaffeeflecken an den richtigen Stellen.' }],
            lose: [{ message: 'Der Dietrich rutscht ab. Irgendwo bellt ein Robohund. Später noch mal.' }],
          }],
        },
      ],
    },
  },
};
