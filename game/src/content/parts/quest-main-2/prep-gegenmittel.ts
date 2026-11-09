// Party-Vorbereitung prep-gegenmittel „Blocker“ (world.md §5.3; drei chip-blocker im Finale).
// Dante baut an der Werkbank (dantes-werkstatt:werkbank) aus
//   nexus-chip-defekt (bleibt im Inventar: Upload 2 in main-3-nexus braucht ihn noch) · 3 quantum-chip-schrott ·
//   6 verschiedene chip-fragment-* (Sammelreihe, werden nicht verbraucht)
// Quellen für Schrott-Chips: Ausschusskiste der Quantum-Außenstelle (pumpwerk-sieben, Karte), Monitor-Nest im
// Datentunnel (hier), Gertrud die Mülltonne (main-2-countdown), Chip-Stände der freien Phase (freie-phase.ts).
// Ohne Bauteile: Dante schickt los (Hinweise). Abschluss-Flag prep_gegenmittel.
import type { ContentPart } from '../../part';
import type { DialogueDef, Effect, QuestDef } from '../../../modules/contracts';
import { PLAN_STEHT, active, all, any, dlg, flag, herz, item, l, msg, nar, node, not, set } from './_lib';

const Q = 'prep-gegenmittel';
const AKTIV = active(Q);
const FERTIG = flag('prep_gegenmittel');
const OFFEN = all(AKTIV, not(FERTIG));
const FRAGMENTE = { itemsOf: 'chip-fragment-', min: 6, distinct: true } as const;
const SCHROTT3 = item('quantum-chip-schrott', 3);
const DEFEKT = item('nexus-chip-defekt');
const BAUTEILE = any(DEFEKT, SCHROTT3, FRAGMENTE);

const BAU: Effect[] = [{ give: 'chip-blocker', qty: 3 }, set('prep_gegenmittel'), { advanceTime: 60 }, msg('Gegenmittel für die Releaseparty: drei Chip-Blocker.')];

const quest: QuestDef = {
  id: Q,
  kind: 'main',
  title: 'Blocker',
  summary: 'Wenn die da oben Chips verteilen, will Dante was dagegen in der Tasche haben. Er braucht den defekten Nexus-Chip, drei Quantum-Schrott-Chips oder sechs Chip-Fragmente.',
  giver: 'dante',
  act: 2,
  autoStart: PLAN_STEHT,
  steps: [
    {
      id: 'teile',
      text: 'Bauteile für Dante: der defekte Nexus-Chip, drei Quantum-Schrott-Chips oder sechs verschiedene Chip-Fragmente.',
      done: any(BAUTEILE, FERTIG),
      marker: { map: 'pumpwerk-sieben', at: 'quantum-aussenstelle' },
    },
    {
      id: 'bauen',
      text: 'Dante baut die Blocker an seiner Werkbank.',
      when: any(BAUTEILE, FERTIG),
      done: FERTIG,
      marker: { map: 'dantes-werkstatt', at: 'werkbank' },
    },
  ],
  reward: { xp: 150, relations: { dante: 40 } },
};

const werkbank: DialogueDef = dlg('m2-prep-werkbank', [
  node('start', [
    nar('Dantes Werkbank. Lupe, Lötkolben, eine Kaffeetasse mit Schraubenziehern drin und ein Plattenspieler, der leise Coltrane spielt.'),
    l('dante', 'Blocker. Ein Ding hinters Ohr, das dem Chip sagt: „Hier wohnt schon wer.“ Was hast du mir mitgebracht?', 'neutral'),
  ], {
    choices: [
      { text: '(Den defekten Nexus-Chip hinlegen.)', when: DEFEKT, next: 'defekt' },
      { text: '(Drei Quantum-Schrott-Chips hinlegen.)', when: SCHROTT3, effects: [{ take: 'quantum-chip-schrott', qty: 3 }], next: 'schrott' },
      { text: '(Die sechs Chip-Fragmente ausbreiten.)', when: FRAGMENTE, next: 'fragmente' },
      { text: '„Noch nichts. Wo find ich so was?“', when: not(BAUTEILE), next: 'hinweis' },
      { text: '„Später.“' },
    ],
  }),
  node('defekt', [
    l('dante', 'Der tote Chip. Zwei Hälften, die nicht mehr miteinander reden. Wunderbar. Ich kratz nur eine Probe ab, den Rest brauchst du noch. Glaub mir.', 'freude'),
  ], { next: 'bau' }),
  node('schrott', [
    l('dante', 'Ausschuss. Quantum schmeißt seine Fehler weg wie andere Leute Pizzakartons. Ihr Pech.', 'signatur'),
  ], { next: 'bau' }),
  node('fragmente', [
    l('dante', 'Alle sechs? Du hast die ganze Stadt umgegraben, was? Daraus kann ich sogar was Hübsches machen.', 'ueberrascht'),
  ], { effects: [herz('dante', 20)], next: 'bau' }),
  node('bau', [
    nar('Eine Stunde lang lötet Dante und summt falsch mit. Dann legt er drei kleine Kupferplättchen in eine Pillendose und schreibt mit Edding „NICHT LUTSCHEN“ drauf.'),
    l('dante', 'Hinters Ohr kleben, bevor sie euch was reinsetzen. Hält eine Stunde. Danach seid ihr auf euch gestellt. Wie immer.', 'neutral'),
  ], { effects: BAU }),
  node('hinweis', [
    l('dante', 'Quantum hat im Pumpwerk eine Außenstelle mit Ausschusskiste. Im Datentunnel liegen Splitter in den alten Monitoren. Und die Stände, an denen sie Gratis-Chips verteilen … die verteilen auch kaputte. Ohne es zu merken.', 'neutral'),
  ]),
]);

export const part: ContentPart = {
  quests: { [Q]: quest },
  dialogues: { [werkbank.id]: werkbank },
  mapAdditions: {
    'dantes-werkstatt': {
      hotspots: [
        { id: 'm2-prep-werkbank', at: 'werkbank', label: 'Dante: Chip-Blocker bauen', kind: 'talk', dialogue: werkbank.id, when: OFFEN },
      ],
    },
    datentunnel: {
      hotspots: [
        {
          id: 'm2-prep-monitor-nest', at: 'splitter-nest', radius: 50, label: 'Im Monitor-Nest wühlen', kind: 'loot', once: true, when: OFFEN,
          lines: [nar('Zwischen gesprungenen Bildschirmen und Kabelnestern blitzt etwas Quantumblaues. Ein Chip, angeschmort, aber ganz. Er flüstert. Du steckst ihn trotzdem ein.')],
          effects: [{ give: 'quantum-chip-schrott' }],
        },
      ],
    },
    'pumpwerk-sieben': {
      hotspots: [
        {
          id: 'm2-prep-aussenstelle-hinweis', at: 'quantum-aussenstelle', radius: 40, label: 'Quantum-Container', kind: 'look', when: all(OFFEN, not(flag('aussenstelle_offen'))),
          lines: [nar('Die weißen Container der Quantum-Außenstelle. Dante sagt, drinnen steht eine Ausschusskiste. Das Terminal daneben lässt sich hacken. Oder man fragt nett. Hier unten fragt keiner nett.')],
        },
      ],
    },
  },
};
