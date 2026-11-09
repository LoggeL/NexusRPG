// Hauptquest main-2-krisensitzung „Was jetzt, Hunter?“ (world.md §5.3). hv-hinterzimmer, nach main-2-countdown.
//
// Raven stellt Hunter zur Rede, Hunter will als Aussiedler in die Ödnis.
//   gc-35 [Ausstrahlung 6] Hunter aus der Resignation holen (Hunter ♥ +60, Raven ♥ +30) · sonst überzeugt Raven ihn.
//   gc-36 [Straße 7] die Releaseparty-Idee selbst einbringen (party_idee_spieler: freie Rolle in Akt 3) · sonst Hunters
//   eigene Idee.
//   Keksalarm mit Drei-Sekunden-Regel (akt-keksalarm oder einfach vom Boden essen): alle Crew ♥ +20.
//   Hunters Plan: gefälschte Ausweise (Fräulein Pixel), stick-hunter, „Geht da nicht in diesen Lumpen hin.“ (Gina),
//   startet die sechs Party-Vorbereitungen. Danach bleibt die Quest offen, bis die Releaseparty beginnt
//   (mindestens drei Vorbereitungen, Planungstafel → planungstafel-party.ts).
import type { ContentPart } from '../../part';
import type { DialogueDef, Effect, QuestDef } from '../../../modules/contracts';
import {
  ACT3, CREW_HERZEN, DREI_PREPS, PARTY_PREPS, PLAN_STEHT, PREP_HINWEIS, active, all, dlg, done, herz, l, msg, nar,
  node, not, partyPrepQuest, set,
} from './_lib';

const Q = 'main-2-krisensitzung';
const AKTIV = active(Q);

const PLAN_FX: Effect[] = [
  set('releaseparty_geplant'),
  { give: 'stick-hunter' },
  ...PARTY_PREPS.map(k => ({ startQuest: partyPrepQuest(k) })),
  { phone: 'tel-m2s-pixel' },
  { phone: 'tel-m2s-gina' },
  msg('Sechs Vorbereitungen sind offen. Mindestens drei, dann an der Planungstafel die Releaseparty starten.'),
];

// ---------------------------------------------------------------------------------------------- Quest

const quest: QuestDef = {
  id: Q,
  kind: 'main',
  title: 'Was jetzt, Hunter?',
  summary: 'Nyra sitzt im Turm, Quantum chippt die Stadt, und Hunter will Kartoffeln anbauen. Krisensitzung im Hinterzimmer.',
  giver: 'hunter',
  act: 2,
  autoStart: done('main-2-countdown'),
  steps: [
    {
      id: 'sitzung',
      text: 'Krisensitzung im Hinterzimmer des High Voltage.',
      done: PLAN_STEHT,
      marker: { map: 'hv-hinterzimmer', at: 'sofa' },
    },
    {
      id: 'preps',
      text: PREP_HINWEIS,
      when: PLAN_STEHT,
      done: DREI_PREPS,
      marker: { map: 'hv-hinterzimmer', at: 'planungstisch' },
      // party_bereit (npc-crew-b PARTY_BEREIT): Abend vor der Party, z. B. rom-aria-stirn.
      effects: [set('party_bereit'), msg('Drei Vorbereitungen stehen. An der Planungstafel kann die Releaseparty starten.')],
    },
    {
      id: 'start',
      text: 'Planungstafel im Hinterzimmer: Releaseparty starten. Einlass ab 20:00 am Quantum-Campus.',
      when: all(PLAN_STEHT, DREI_PREPS),
      done: ACT3,
      marker: { map: 'hv-hinterzimmer', at: 'planungstisch' },
    },
  ],
  reward: { xp: 200, rep: { 'crew-hunter': 10 } },
};

// ---------------------------------------------------------------------------------------------- Sitzung

const sitzung: DialogueDef = dlg('m2s-sitzung', [
  node('start', [
    nar('Hinterzimmer. Hunter liegt auf dem Sofa, einen Arm über den Augen, die Schuhe noch an. Auf dem Planungstisch: eine Broschüre. „Neues Leben in der Ödnis – Aussiedlerhof sucht Hände.“'),
    l('hunter', 'Ich hab nachgelesen. Kartoffeln wachsen von allein. Man steckt sie in den Dreck, und dann kommen mehr Kartoffeln raus. Das ist der beste Plan, den ich je hatte.', 'trauer'),
    l('raven', 'Steh auf.', 'wut'),
    l('hunter', 'Nyra sitzt im Turm, Raven. Wegen MEINES Plans. Aria hätte …', 'trauer'),
    l('raven', 'Aria sitzt hier und frisst deine letzten Erdnüsse. Steh auf, Hunter. Du hast mich aus dem Knast geholt, damit ich dir beim Aufgeben zugucke? Fick dich.', 'wut'),
  ], {
    choices: [
      { text: '„Hunter. Guck mich an. Wir haben verloren. Einmal. Das heißt nicht, dass wir verloren sind.“', check: 'gc-35', next: 'aufgerichtet' },
      { text: '(Raven reden lassen.)', next: 'raven' },
    ],
  }),
  node('aufgerichtet', [
    nar('Hunter nimmt den Arm vom Gesicht. Er sieht dich lange an. Dann setzt er sich auf, langsam, wie ein Mann, der sich erinnert, wie das geht.'),
    l('hunter', 'Einmal. Ja. Einmal. Ich hab sieben Jahre lang „einmal“ gesagt und es nicht geglaubt.', 'neutral'),
    l('hunter', 'Du redest wie ich, als ich noch Haare hatte. Danke, Kind.', 'freude'),
    l('raven', 'Na also. Hat ja nur einen Neuen gebraucht.', 'signatur'),
  ], { effects: [herz('hunter', 60), herz('raven', 30), set('hunter_aufgerichtet')], next: 'idee' }),
  node('raven', [
    nar('Raven zieht Hunter am Kragen vom Sofa. Nicht grob. Nur bestimmt. Wie man einen Hund aus dem Wasser holt.'),
    l('raven', 'Weißt du, was mir sieben Jahre lang durch den Kopf ging? Nicht Blade. Du. Wie du gesagt hast: „Wir schaffen das, weil wir zusammen sind.“ Du hast es geglaubt. Ich hab’s dir geglaubt.', 'trauer'),
    l('hunter', '… Das hab ich gesagt?', 'ueberrascht'),
    l('raven', 'Betrunken. Aber ja.', 'signatur'),
  ], { effects: [herz('raven', 20), set('hunter_von_raven_ueberzeugt')], next: 'idee' }),
  node('idee', [
    l('hunter', 'Gut. Gut. Was haben wir? Einen toten Chip, einen Dante, eine Aria mit schlafendem Arm. Und Quantum hat … alles.', 'neutral'),
    l('dante', 'Quantum hat eine Releaseparty. Chrome 10. In vier Tagen. Steht auf jeder Litfaßsäule.', 'neutral'),
  ], {
    choices: [
      {
        text: '„Dann gehen wir hin. Als Gäste. Wir holen Nyra, während die Oberstadt Häppchen frisst, und reißen Nexus vor laufender Kamera den Stecker raus.“',
        check: 'gc-36', effects: [set('party_idee_spieler'), herz('hunter', 30)], next: 'idee-spieler',
      },
      { text: '(Hunter denken lassen.)', next: 'idee-hunter' },
    ],
  }),
  node('idee-spieler', [
    l('hunter', '…', 'ueberrascht'),
    l('hunter', 'Das ist wahnsinnig. Das ist komplett wahnsinnig. Das ist MEIN Wahnsinn, und du hast ihn mir geklaut.', 'freude'),
    l('hunter', 'Du kriegst auf der Party keine feste Rolle. Du machst, was du für richtig hältst. Das hast du dir verdient.', 'neutral'),
  ], { next: 'keks' }),
  node('idee-hunter', [
    nar('Hunter steht auf. Er geht zum Planungstisch, schiebt die Ödnis-Broschüre runter und klatscht ein Plakat drauf. „QUANTUM PRÄSENTIERT: CHROME 10. RELEASEPARTY.“'),
    l('hunter', 'Eine Party. Die Oberstadt, Kameras, Champagner. Und mitten drin: wir. Als Gäste. Wir holen Nyra und zeigen ganz Noxius, was dieser Turm wirklich macht.', 'signatur'),
  ], { next: 'keks' }),
  // --- Keksalarm
  node('keks', [
    nar('Hunter schlägt so begeistert auf den Tisch, dass die Keksdose umkippt. Sie rollt über die Kante. Kekse regnen.'),
    l('aria', 'KEKSALARM!', 'ueberrascht'),
    l('dante', 'Drei-Sekunden-Regel! DREI SEKUNDEN!', 'ueberrascht'),
  ], {
    choices: [
      {
        text: '(Hechten.)',
        effects: [{
          minigame: 'akt-keksalarm', level: 2, key: 'keksalarm-krisensitzung', label: 'Keksalarm!',
          win: [...CREW_HERZEN(20), set('keksalarm_gerettet'), { xp: 30 }, msg('Kein Keks hat den Boden länger als drei Sekunden berührt. Die Crew jubelt wie bei einem Tor.'), { dialogue: 'm2s-plan' }],
          lose: [...CREW_HERZEN(20), msg('Die Hälfte lag vier Sekunden. Dante isst sie trotzdem. „Vier ist auch eine Art drei.“'), { dialogue: 'm2s-plan' }],
        }],
      },
      { text: '(Einen Keks vom Boden aufheben und essen. Langsam. Mit Blickkontakt.)', effects: [...CREW_HERZEN(20), { dialogue: 'm2s-plan' }] },
    ],
  }),
]);

const plan: DialogueDef = dlg('m2s-plan', [
  node('start', [
    nar('Alle sitzen auf dem Boden zwischen Krümeln. Es ist das erste Mal seit dem Bruch, dass jemand lacht. Hunter wischt sich die Finger an der Hose ab und wird ernst.'),
    l('hunter', 'Also. Der Plan. Erstens: Ausweise. Gefälschte. Fräulein Pixel am Stufenplatz macht die besten, sie braucht Fotos, Druckerfolie und einen Behördenstempel.', 'neutral'),
    l('hunter', 'Zweitens: Gästeliste. Wer drauf steht, kommt durch die Vordertür. Das NX-1-Studio hat sie. Oder das Foyer selbst.', 'neutral'),
    l('hunter', 'Drittens: Wir brauchen eine Karre für danach. Eine, die nicht verfolgt wird. Viertens: Wie kommen wir im Turm zum Serverkern? Nyra wüsste das.', 'neutral'),
    l('dante', 'Fünftens: Gegenmittel. Wenn die da oben Chips verteilen, will ich was dagegen in der Tasche haben. Gib mir den toten Chip oder Quantum-Schrott, und ich bau Blocker.', 'neutral'),
    nar('Hunter zieht einen Datenstick aus der Brusttasche, versiegelt mit rotem Nagellack, und drückt ihn dir in die Hand.'),
    l('hunter', 'Und das hier. Nicht reinschauen. Ernsthaft. Wenn alles schiefgeht, steckst du den in den Kern.', 'neutral'),
    l('hunter', 'Und Sechstens, und das ist das Wichtigste: Geht da nicht in diesen Lumpen hin. Gina am Stufenplatz. Sagt, ich schick euch. Dann wird’s teurer, aber schöner.', 'signatur'),
    l('raven', 'Und wie viel davon brauchen wir?', 'neutral'),
    l('hunter', 'Alles. Aber drei reichen, wenn wir improvisieren. Wir improvisieren immer.', 'freude'),
  ], { effects: PLAN_FX }),
]);

// Nach der Sitzung: Hunter am Planungstisch (Erinnerung) – die eigentliche Tafel steht in planungstafel-party.ts.
const hunterDanach: DialogueDef = dlg('m2s-hunter', [
  node('start', [
    l('hunter', 'Drei von sechs. Mindestens. Und dann: Releaseparty, Einlass um acht. Pünktlich. Die Oberstadt ist pünktlich, das ist ihr einziger Charakterfehler.', 'neutral'),
  ]),
]);

// ---------------------------------------------------------------------------------------------- Karten

export const part: ContentPart = {
  quests: { [Q]: quest },
  dialogues: Object.fromEntries([sitzung, plan, hunterDanach].map(d => [d.id, d])),
  phone: {
    'tel-m2s-pixel': {
      id: 'tel-m2s-pixel', from: 'fraeulein-pixel',
      text: 'Hunter sagt, ihr braucht Papiere. Drei Sachen: Fotos (Automat Bahnhof Mitte), Druckerfolie (Quantum-Depot Hafenkante), Stempel (Eisenhof). Bringt’s mir, ich mach den Rest. Und kein Blitz, ich hasse Blitz.',
    },
    'tel-m2s-gina': {
      id: 'tel-m2s-gina', from: 'stylistin-gina',
      text: 'Hunter hat angerufen. Er sagt, ihr seht aus wie ein Unfall in einem Altkleidercontainer. Salon am Stufenplatz. Ich mach Wunder. Wunder kosten.',
    },
  },
  mapAdditions: {
    'hv-hinterzimmer': {
      onEnter: [
        { id: 'm2s-sitzung-auto', when: all(AKTIV, not(PLAN_STEHT)), dialogue: sitzung.id },
      ],
      npcs: [
        { id: 'm2s-hunter-sofa', npc: 'hunter', at: 'sofa', facing: 'n', dialogue: sitzung.id, when: all(AKTIV, not(PLAN_STEHT)) },
        { id: 'm2s-hunter-tisch', npc: 'hunter', at: 'schreibtisch', facing: 's', dialogue: hunterDanach.id, when: all(AKTIV, PLAN_STEHT, not(ACT3)) },
      ],
      hotspots: [
        { id: 'm2s-sofa', at: 'sofa', label: 'Hunter', kind: 'talk', dialogue: sitzung.id, when: all(AKTIV, not(PLAN_STEHT)) },
      ],
    },
    'high-voltage': {
      hotspots: [
        {
          id: 'm2s-tresen-hinweis', at: 'tresen', label: 'Barkeeper', kind: 'look', when: all(AKTIV, not(PLAN_STEHT)),
          lines: [nar('Der Barkeeper deutet mit dem Daumen nach hinten. „Hunter ist im Hinterzimmer. Seit gestern. Er hat die Ödnis-Broschüre schon dreimal gelesen. Geh rein, bevor er sich Gummistiefel kauft.“')],
        },
      ],
    },
  },
};
