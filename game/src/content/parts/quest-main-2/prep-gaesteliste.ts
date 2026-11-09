// Party-Vorbereitung prep-gaesteliste „Auf der Liste“ (world.md §5.3). Einlassroute als Gast in main-3-einlass.
// Wege:
//   NX-1-Studio Redaktion: Collin (♥4 oder side-live-dabei: „Presse-Plus-Eins“) · Delya mit eigenem
//     Ausstrahlung-Check (Exklusivstory nach der Party) · nachts die Liste vom Schreibtisch fotografieren (ohne Check,
//     nur nachts)
//   NX-1-Studio Regie: akt-hacken in den Sendeplan, Namen in die Live-Gästeliste schieben
//   quantum-foyer Gästelisten-Pult (mit blades-visitenkarte/xion-passierschein drin): eigener Technik-Check oder
//     den Concierge mit 500 Cr „Spende“ bestechen
// Abschluss-Flag prep_gaesteliste (quantum-foyer.ts/main-3-einlass werten es aus).
import type { ContentPart } from '../../part';
import type { DialogueDef, Effect, QuestDef } from '../../../modules/contracts';
import { PLAN_STEHT, active, all, any, dlg, done, flag, hearts, herz, l, msg, nar, node, not, pruef, set } from './_lib';

const Q = 'prep-gaesteliste';
const AKTIV = active(Q);
const FERTIG = flag('prep_gaesteliste');
const OFFEN = all(AKTIV, not(FERTIG));

const delyaStory = pruef('prep-gaesteliste-delya', 'ausstrahlung', 6, ['ueberreden', 'verhandeln']);
const pultHack = pruef('prep-gaesteliste-pult', 'technik', 6, ['hacken', 'terminal']);

const ABSCHLUSS = (wie: string): Effect[] => [set('prep_gaesteliste'), set(`gaesteliste_${wie}`), msg('Gästeliste für die Releaseparty: erledigt.')];

const quest: QuestDef = {
  id: Q,
  kind: 'main',
  title: 'Auf der Liste',
  summary: 'Wer auf der Gästeliste steht, geht durch die Vordertür. Das NX-1-Studio hat die Liste, weil es live überträgt. Das Foyer von Quantum hat sie auch.',
  giver: 'hunter',
  act: 2,
  autoStart: PLAN_STEHT,
  steps: [
    {
      id: 'liste',
      text: 'Namen auf die Gästeliste bringen: NX-1-Studio (Redaktion oder Regie) oder das Pult im Quantum-Foyer.',
      done: FERTIG,
      marker: { map: 'nx1-studio', at: 'redaktion' },
    },
  ],
  reward: { xp: 120 },
};

const redaktion: DialogueDef = dlg('m2-prep-redaktion', [
  node('start', [
    nar('Die NX-1-Redaktion. Kaffeebecher, Teleprompter-Ausdrucke, ein Whiteboard mit „CHROME 10 – LIVE – GÄSTE A–Z“. Darunter ein Tablet mit der Liste.'),
  ], {
    choices: [
      { text: '„Collin. Ich brauch eine Plus-Eins. Oder vier.“', tag: '[Collin]', when: any(hearts('collin-charleston', 4), done('side-live-dabei')), next: 'collin' },
      { text: '„Delya. Exklusivstory nach der Party. Was wirklich im Turm passiert. Dafür: vier Namen auf der Liste.“', check: delyaStory, effects: ABSCHLUSS('delya'), next: 'delya' },
      { text: '(Nachts wiederkommen und die Liste abfotografieren.)', when: { time: 'nacht' }, effects: [{ advanceTime: 20 }, ...ABSCHLUSS('foto')], next: 'nacht' },
      { text: 'Später wiederkommen.' },
    ],
  }),
  node('collin', [
    l('collin-charleston', 'Plus-Eins? Für meine Lieblingsquelle? Schätzchen, ich trag dich als „Kulturkorrespondenz“ ein. Mit Gefolge. Das klingt wichtig und bedeutet nichts.', 'freude'),
    l('collin-charleston', 'Und wenn auf der Party was explodiert, steh bitte so, dass mein gutes Profil im Bild ist.', 'signatur'),
  ], { effects: [...ABSCHLUSS('collin'), herz('collin-charleston', 30)] }),
  node('delya', [
    l('delya-delloraine', 'Exklusiv. Mit Bildern. Und du gehst danach zu keinem anderen Sender. Nicht mal zu Collins Haarspraywerbung.', 'neutral'),
    nar('Sie tippt vier Namen ins Tablet. Sie klingen nach Segelyacht und Erbschaftssteuer.'),
  ], { effects: [herz('delya-delloraine', 30)] }),
  node('nacht', [nar('Die Redaktion ist dunkel, das Tablet nicht gesperrt. Ein Foto, ein Abgleich, vier Zeilen hinzugefügt und die Änderung auf „Collin“ geschoben. Der merkt eh nichts.')]),
]);

const regie: DialogueDef = dlg('m2-prep-regie', [
  node('start', [
    nar('Der Regieraum. Vierzig Bildschirme, ein Pult mit mehr Knöpfen als ein Flugzeug. Der Sendeplan für die Releaseparty läuft auf Bildschirm sieben, mit der Gästeliste als Bauchbinde.'),
  ], {
    choices: [
      {
        text: 'In den Sendeplan hacken und eure Namen in die Bauchbinde schieben.',
        effects: [{ minigame: 'akt-hacken', level: 3, key: 'prep-gaesteliste-regie', label: 'NX-1-Sendeplan', win: [...ABSCHLUSS('regie'), { xp: 30 }], lose: [msg('Bildschirm sieben zeigt plötzlich eine Katze. Der Regieassistent schaut rüber. Du gehst. Langsam.')] }],
      },
      { text: 'Lieber nichts anfassen.' },
    ],
  }),
]);

const pult: DialogueDef = dlg('m2-prep-pult', [
  node('start', [
    nar('Das Gästelisten-Pult im Foyer. Ein Concierge mit Haaren aus Lack bewacht ein Terminal wie einen Gral.'),
    l('ki-nexus', 'Das ist eine ausgezeichnete Entscheidung, Master. Willkommen bei Quantum.', 'neutral'),
  ], {
    choices: [
      { text: '(Den Concierge ablenken und die Liste im Terminal ergänzen.)', check: pultHack, effects: ABSCHLUSS('pult'), next: 'hack' },
      { text: '„Für Ihre Kaffeekasse. Fünfhundert. Vier Namen.“', requires: { credits: 500 }, effects: [{ credits: -500 }, ...ABSCHLUSS('bestochen')], next: 'bestochen' },
      { text: 'Weggehen, bevor er fragt.' },
    ],
  }),
  node('hack', [nar('Während der Concierge eine Wespe verfolgt, die du nicht freigelassen hast, ergänzt du vier Zeilen. Das Terminal sagt „Danke“. Höflich, diese Maschinen.')]),
  node('bestochen', [nar('Der Concierge nimmt das Geld, ohne hinzusehen, und tippt. „Spenden sind steuerlich absetzbar“, sagt er. Für dich nicht.')]),
]);

export const part: ContentPart = {
  quests: { [Q]: quest },
  dialogues: Object.fromEntries([redaktion, regie, pult].map(d => [d.id, d])),
  checks: { [delyaStory.id]: delyaStory, [pultHack.id]: pultHack },
  mapAdditions: {
    'nx1-studio': {
      hotspots: [
        { id: 'm2-prep-redaktion', at: 'redaktion', label: 'Redaktion: Gästeliste', kind: 'use', dialogue: redaktion.id, when: OFFEN },
        { id: 'm2-prep-regie', at: 'regie', label: 'Regie: Sendeplan', kind: 'use', dialogue: regie.id, when: OFFEN },
      ],
    },
    'quantum-foyer': {
      hotspots: [
        { id: 'm2-prep-pult', at: 'gaesteliste-pult', label: 'Gästelisten-Pult', kind: 'use', dialogue: pult.id, when: OFFEN },
      ],
    },
  },
};
