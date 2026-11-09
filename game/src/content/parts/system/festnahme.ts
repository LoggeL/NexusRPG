// Festnahme (world.md §10.3): Fahndung 3 und Kontakt mit Ordnungshütern = eine Nacht im Zellentrakt.
// „Kontakt“ heißt hier: Betreten einer Karte mit Streifen (Stufenplatz, Glasarkaden, Eisenhof-Hof, Chrome-Boulevard;
// Neon-Gasse nur während der Razzia nach main-2-bruch). Der Auslöser läuft beim Betreten und beim Wechsel der
// Tageszeit auf derselben Karte erneut (`once: false`), wer also vor Ort auf 3 steigt, wird kurz darauf eingesammelt.
// Rivalität mit Kessel ({ rival: 'wache' }): Haft schon ab Fahndung 2.
// Die Strafe (−10 %, bei Richter-Rivalität −20 %), Fahndung 0 und die Reise nach `zellentrakt#haft` macht der Effekt
// `arrest` (modules/campaign/domains/arrest.ts); raus kommt man über die Pritsche oder morgens an der Zellentür.
// Sperren (konservativ): Prolog, Akt 3 (Partynacht, Finale, Epilog), Master-Modus, schon in Haft und laufende
// Hauptquest-Szenen mit Mittelring-Bezug (main-1-raven, main-2-krisensitzung, main-2-bruch, main-2-kanal).
import type { Condition, DialogueDef, MapDef } from '../../../modules/contracts';
import type { ContentPart } from '../../part';

const N = 'narrator' as const;

const SPERRE: Condition = {
  any: [
    { flag: 'in_haft' },
    { notFlag: 'prolog_done' },
    { act: 3 },
    { flag: 'master_modus' },
    { flag: 'ende_master' },
    { quest: 'main-1-raven', state: 'active' },
    { quest: 'main-2-krisensitzung', state: 'active' },
    { quest: 'main-2-bruch', state: 'active' },
    { quest: 'main-2-kanal', state: 'active' },
  ],
};

/** Fahndung 3 – die Streife greift zu. */
const FAELLIG: Condition = { all: [{ flag: 'fahndung_3' }, { not: SPERRE }] };
/** Kessel hat dich auf der Liste: schon bei Fahndung 2. */
const FAELLIG_KESSEL: Condition = {
  all: [{ flag: 'fahndung_2' }, { notFlag: 'fahndung_3' }, { rival: 'wache' }, { not: SPERRE }],
};
/** Razzia in der Neon-Gasse (world.md §10.6): nur nach dem Bruch in Akt 2. */
const RAZZIA: Condition = { all: [{ quest: 'main-2-bruch', state: 'done' }, { not: { act: 3 } }] };

const festnahme: DialogueDef = {
  id: 'festnahme-streife',
  start: 'start',
  nodes: [
    {
      id: 'start',
      lines: [
        { speaker: N, text: 'Zwei Ordnungshüter lösen sich aus der Menge. Einer hält das Tablet hoch, auf dem Tablet: dein Gesicht. Kein gutes Foto.' },
        { speaker: N, text: '„Hände hinter den Kopf, du Vollpfosten. Und keine Faxen, ich hab heute schon zwei Formulare zerrissen.“' },
        { speaker: N, text: 'Handschellen klicken. Die Leute gucken, einer filmt. Ab in den Transporter, ab zum Eisenhof.' },
      ],
    },
  ],
};

const festnahmeKessel: DialogueDef = {
  id: 'festnahme-kessel',
  start: 'start',
  nodes: [
    {
      id: 'start',
      lines: [
        { speaker: N, text: 'Ein Ordnungshüter tippt auf sein Funkgerät, dann auf dich. „Treffer. Die Wachtmeisterin sagt, du stehst auf ihrer Liste. Ganz oben.“' },
        { speaker: 'wache', text: 'Durchs Funkgerät, knisternd: „Ich hab gesagt, ich will dich hier nicht wiedersehen. Rate mal, wer gleich wieder hier ist.“' },
        { speaker: N, text: 'Handschellen klicken. Die Fahrt zum Eisenhof ist kurz, die Laune im Transporter ist mies.' },
      ],
    },
  ],
};

type OnEnter = NonNullable<MapDef['onEnter']>[number];

function zugriff(map: string, extra?: Condition): OnEnter[] {
  const wo = (bedingung: Condition): Condition => (extra ? { all: [extra, bedingung] } : bedingung);
  return [
    { id: `festnahme-${map}`, once: false, when: wo(FAELLIG), dialogue: festnahme.id, effects: [{ arrest: true }] },
    { id: `festnahme-kessel-${map}`, once: false, when: wo(FAELLIG_KESSEL), dialogue: festnahmeKessel.id, effects: [{ arrest: true }] },
  ];
}

export const part: ContentPart = {
  dialogues: { [festnahme.id]: festnahme, [festnahmeKessel.id]: festnahmeKessel },
  mapAdditions: {
    stufenplatz: { onEnter: zugriff('stufenplatz') },
    glasarkaden: { onEnter: zugriff('glasarkaden') },
    eisenhof: { onEnter: zugriff('eisenhof') },
    'chrome-boulevard': { onEnter: zugriff('chrome-boulevard') },
    'neon-gasse': { onEnter: zugriff('neon-gasse', RAZZIA) },
  },
};
