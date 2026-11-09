// Planungstafel Akt 2 → Akt 3 (world.md §5.3, act23.json notes): Stand der sechs Party-Vorbereitungen. Ab drei
// erledigten bietet die Tafel „Releaseparty starten“ an: Einlass um 20:00 (Wartetreppe), dann setAct 3, Party Aria +
// Dante (Raven fährt mit Hunter vor, act23.json „act3 start“), Reise quantum-campus/party-vorplatz. main-3-einlass
// startet von selbst (PARTYNACHT). rom-aria-stirn (vexaria/npc-crew) hängt sich an party_bereit.
// Die alten Tafel-Hotspots aus quest-main-b verschwinden ab act2.
import type { ContentPart } from '../../part';
import type { DialogueChoice, DialogueDef, DialogueNode, Effect } from '../../../modules/contracts';
import {
  ACT3, DREI_PREPS, NUR_ACT2, PARTY_PREPS, PLAN_STEHT, UHR, all, dlg, flag, l, nar, node, not, partyPrepFlag, set,
  waitChoices, type PartyPrep,
} from './_lib';

const NAME: Record<PartyPrep, string> = {
  outfits: 'Outfits', ausweise: 'Ausweise', gaesteliste: 'Gästeliste', fahrzeug: 'Fluchtwagen', turm_plan: 'Turm-Plan',
  gegenmittel: 'Gegenmittel',
};
const OFFEN: Record<PartyPrep, string> = {
  outfits: 'Stylistin Gina, Salon am Stufenplatz. 300 bis 1200 Credits, je nachdem, wie sehr ihr glänzen wollt.',
  ausweise: 'Fräulein Pixel braucht Fotos (Automat Bahnhof Mitte), Druckerfolie (Quantum-Depot Hafenkante) und einen Stempel (Eisenhof).',
  gaesteliste: 'Die Gästeliste liegt im NX-1-Studio (Redaktion oder Regie). Oder direkt am Pult im Quantum-Foyer.',
  fahrzeug: 'Die Rostlaube flottmachen, ein Rennen in der Staubstraße oder in Halle 9 gewinnen, oder für 800 Credits einen Wagen am Hafen kaufen.',
  turm_plan: 'Nyras Funkpunkt im Datentunnel, die beschlagnahmten Pläne im Beweismittellager am Eisenhof oder das Archiv der Chrome-Schwestern.',
  gegenmittel: 'Dante an seiner Werkbank: Er baut Blocker aus dem defekten Nexus-Chip, aus drei Quantum-Schrott-Chips oder aus sechs Chip-Fragmenten.',
};
const ERLEDIGT: Record<PartyPrep, string> = {
  outfits: 'Die Outfits hängen im Quartier, in Folie, mit Ginas Visitenkarte am Bügel: „Nicht drin essen.“',
  ausweise: 'Die Ausweise sind fertig. Pixel hat deinen Namen falsch geschrieben. Absichtlich. Sagt sie.',
  gaesteliste: 'Ihr steht auf der Liste. Unter Namen, die so oberstädtisch klingen, dass du selbst fast salutierst.',
  fahrzeug: 'Der Fluchtwagen steht bereit. Tank voll, Kennzeichen geklaut, Kassette eingelegt.',
  turm_plan: 'Auf dem Turm-Plan ist der Weg zum Serverkern rot markiert. Mit einem kleinen Herz daneben. Nyra.',
  gegenmittel: 'Drei Chip-Blocker in einer Pillendose. Dante hat „NICHT LUTSCHEN“ draufgeschrieben.',
};

/** Startfenster: Einlass ab 20:00, bis 21:30 gerade noch rechtzeitig. */
const EINLASS = UHR(20);
const SPAETESTENS = UHR(21, 30);

const START_FX: Effect[] = [
  set('party_bereit'),
  { dismiss: 'raven' }, { dismiss: 'hunter' }, { dismiss: 'vega' }, { dismiss: 'nyra' }, { dismiss: 'jimmy' },
  { recruit: 'aria' }, { recruit: 'dante' },
  { setAct: 3 },
  { message: 'Akt 3 „Releaseparty“ beginnt.' },
  { travel: 'quantum-campus', entry: 'party-vorplatz', minutes: 0 },
];

function statusChoices(): DialogueChoice[] {
  return PARTY_PREPS.flatMap(k => [
    { id: `s-${k}-ok`, text: NAME[k], tag: '[erledigt]', when: flag(partyPrepFlag(k)), next: `ok-${k}` },
    { id: `s-${k}-offen`, text: NAME[k], tag: '[offen]', when: not(flag(partyPrepFlag(k))), next: `offen-${k}` },
  ]);
}

const detailNodes: DialogueNode[] = PARTY_PREPS.flatMap(k => [
  node(`ok-${k}`, [nar(ERLEDIGT[k])], { next: 'start' }),
  node(`offen-${k}`, [nar(OFFEN[k])], { next: 'start' }),
]);

const tafel: DialogueDef = dlg('m2p-tafel', [
  node('start', [
    nar('Die Planungstafel. Hunter hat das Chrome-10-Plakat in die Mitte gepinnt und sechs Zettel drumherum. Bei manchen ist ein Haken dran. Bei manchen ein Totenkopf.'),
  ], {
    choices: [
      ...statusChoices(),
      { id: 'party', text: 'Releaseparty starten.', when: DREI_PREPS, next: 'party' },
      { id: 'zu-wenig', text: 'Releaseparty starten.', requires: DREI_PREPS, tag: '[mind. 3 von 6]', when: not(DREI_PREPS), next: 'start' },
      { id: 'weg', text: 'Weg von der Tafel.' },
    ],
  }),
  ...detailNodes,
  node('party', [
    l('hunter', 'Drei Häkchen. Mindestens. Das ist mehr, als wir beim Bruch hatten.', 'neutral'),
    l('hunter', 'Einlass ist um acht. Wer da ist, ist da. Wer nicht da ist, ist tot oder in der Ödnis. Danach ist nichts mehr, wie es war. Also: heute?', 'neutral'),
  ], {
    choices: [
      ...waitChoices('party-warten', 'Heute Abend. Bis acht noch durchatmen.', UHR(6), EINLASS, 'los', [], 30),
      { id: 'party-jetzt', text: '„Jetzt. Wir fahren los.“', when: { clockBetween: [EINLASS, SPAETESTENS] }, next: 'los' },
      {
        id: 'party-zu-spaet', text: '„Heute noch?“', when: { clockBetween: [SPAETESTENS, UHR(26)] }, next: 'zu-spaet',
      },
      { id: 'party-nein', text: '„Noch nicht. Ich will mehr Häkchen.“' },
    ],
  }),
  node('zu-spaet', [
    l('hunter', 'Um die Zeit kommt da keiner mehr rein, der nicht schon drin ist. Morgen. Um acht. Und geh vorher schlafen, du siehst aus wie mein Kontostand.', 'neutral'),
  ]),
  node('los', [
    nar('Die Crew zieht sich um. Aria trägt ihr Shirt unter dem Kleid, „für Glück“. Dante poliert seine Brille dreimal. Raven checkt ihre Handschellen, als wären es Ohrringe.'),
    l('hunter', 'Raven und ich fahren mit dem Wagen vor. Aria, Dante: ihr geht mit dir rein. Vega sitzt oben auf der Brücke. Wie immer.', 'neutral'),
    l('vega', 'Wie immer. Und wenn ich „Regenschirm“ sage, lauft ihr. Egal wohin.', 'signatur'),
    l('aria', 'Wer zuerst am Champagner ist!', 'freude'),
  ], { effects: START_FX }),
]);

const TAFEL_WHEN = all(PLAN_STEHT, NUR_ACT2);

export const part: ContentPart = {
  dialogues: { [tafel.id]: tafel },
  mapAdditions: {
    'hv-hinterzimmer': {
      hotspots: [
        { id: 'm2p-tafel', at: 'planungstisch', radius: 64, label: 'Planungstafel: Releaseparty', kind: 'use', dialogue: tafel.id, when: TAFEL_WHEN },
      ],
    },
    'crew-quartier': {
      hotspots: [
        { id: 'm2p-pinnwand', at: 'pinnwand', label: 'Pinnwand: Releaseparty', kind: 'use', dialogue: tafel.id, when: all(TAFEL_WHEN, not(ACT3)) },
      ],
    },
  },
};
