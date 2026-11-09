// Vorbereitung prep-grundriss „Laborgrundriss“ (world.md §5.2). Bonus im Bruch: Karte von Anfang an, 2 Lüftungsschächte.
// Wege: gc-22 Lieferdrohne umleiten (oder Leitungs-Hack ohne Check) · Pim am Imbiss gc-104 · Kameramann 300 Cr oder
// kostenlos nach side-live-dabei · [Ex-Wache] Digitech-Pläne im Archiv.
import type { ContentPart } from '../../part';
import type { DialogueDef, QuestDef } from '../../../modules/contracts';
import { active, all, any, done, flag, l, nar } from './_lib';

const Q = 'prep-grundriss';
const OFFEN = all(active(Q), { noItem: 'grundriss-labor' });
const GEFUNDEN = (weg: string) => [{ give: 'grundriss-labor' }, { setFlag: weg }] as const;

const quest: QuestDef = {
  id: Q,
  kind: 'main',
  title: 'Vorbereitung: Laborgrundriss',
  summary: 'Ohne Grundriss laufen wir im Labor im Kreis, bis uns einer erschießt. – Hunter',
  giver: 'hunter',
  act: 1,
  autoStart: flag('plan_gefasst'),
  steps: [
    {
      id: 'grundriss',
      text: 'Besorge einen Grundriss des Quantum-Labors.',
      done: any({ item: 'grundriss-labor' }, { questStep: Q, step: 'weg-drohne' }, { questStep: Q, step: 'weg-pim' }, { questStep: Q, step: 'weg-kameramann' }, { questStep: Q, step: 'weg-archiv' }),
    },
    {
      id: 'weg-drohne',
      text: 'Weg: Am Quantum-Depot der Hafenkante lädt eine Lieferdrohne mit Planungsunterlagen. Route umschreiben?',
      done: flag('grundriss_drohne'),
      optional: true,
      marker: { map: 'hafenkante', at: 'quantum-depot' },
    },
    {
      id: 'weg-pim',
      text: 'Weg: Pim Pinzette, Laborassistentin bei Quantum, sitzt abends am Imbiss „Lötkolben“ auf dem Schrottmarkt.',
      done: flag('grundriss_pim'),
      optional: true,
      marker: { map: 'schrottmarkt', at: 'imbiss-loetkolben' },
    },
    {
      id: 'weg-kameramann',
      text: 'Weg: Der Kameramann filmt abends auf dem Schrottmarkt. Er war beim Pressetermin im Labor (300 Cr).',
      done: flag('grundriss_kameramann'),
      optional: true,
      marker: { map: 'schrottmarkt', at: 'filmposten' },
    },
    {
      id: 'weg-archiv',
      text: 'Weg [Ex-Wache]: Du kennst die alten Digitech-Archivschränke. Digitech hat das Labor gebaut.',
      when: { origin: 'origin-ex-wache' },
      done: flag('grundriss_archiv'),
      optional: true,
      marker: { map: 'digitech-areal', at: 'archiv' },
    },
  ],
  reward: {
    xp: 50,
    effects: [
      { setFlag: 'prep_grundriss' },
      { message: 'Planungstafel: Grundriss abgehakt. Im Bruch: Karte von Anfang an, zwei Lüftungsschächte.' },
    ],
  },
};

const drohne: DialogueDef = {
  id: 'prep-grundriss-drohne',
  start: 'start',
  nodes: [
    {
      id: 'start',
      lines: [
        nar('Am Quantum-Depot hängt eine Lieferdrohne in der Ladestation und summt zufrieden vor sich hin. Auf ihrem Bauch klebt ein Etikett: „Campus · Labor 0 · Planungsunterlagen · VERTRAULICH“.'),
        nar('Quantum beschriftet wirklich alles.'),
      ],
      choices: [
        { text: '(Wartungsklappe auf, Zielkoordinaten umschreiben: nächster Halt – dein Dach.)', check: 'gc-22', next: 'umgeleitet' },
        {
          text: '(Mit roher Gewalt in die Steuerung hacken.)',
          effects: [{
            minigame: 'akt-hacken', level: 4, key: 'prep-grundriss-drohne', label: 'Lieferdrohne umleiten',
            win: [...GEFUNDEN('grundriss_drohne'), { message: 'Die Drohne liefert brav. An dich.' }],
            lose: [{ message: 'Die Drohne piept beleidigt und fliegt ohne dich los. Morgen hängt die nächste hier.' }],
          }],
        },
        { text: 'Lieber nicht. Die Kamera am Tor guckt schon so.' },
      ],
    },
    {
      id: 'umgeleitet',
      lines: [
        nar('Drei Drähte, ein Fingernagel, eine neue Zieladresse. Die Drohne zirpt, steigt auf, dreht eine elegante Kurve über das Hafenbecken und setzt den Behälter vor deinen Füßen ab.'),
        nar('Darin: ein gefalteter Grundriss des Labortrakts. Zwei Lüftungsschächte sind rot markiert, mit der Notiz „Wartung? Wer?“.'),
      ],
      effects: [...GEFUNDEN('grundriss_drohne')],
    },
  ],
};

const pim: DialogueDef = {
  id: 'prep-grundriss-pim',
  start: 'start',
  nodes: [
    {
      id: 'start',
      lines: [
        nar('Pim Pinzette sitzt über einer Schale Lötkolben-Nudeln und sieht aus, als hätte sie seit Tagen nicht geschlafen. Auf ihrem Quantum-Kittel prangt ein Kaffeefleck in der Form eines kleinen Kontinents.'),
        l('pim-pinzette', 'Oh. Hallo. Entschuldigung. Ich sitz hier nur. Ich darf hier sitzen, oder? Entschuldigung.'),
      ],
      choices: [
        { text: '„Harter Tag im Labor? Erzähl. Ich hab Zeit.“', check: 'gc-104', next: 'mitgefuehl' },
        { text: '„Ich brauch einen Grundriss von eurem Labor. Was kostet der?“', next: 'direkt' },
        { text: '„Guten Appetit.“' },
      ],
    },
    {
      id: 'direkt',
      lines: [
        l('pim-pinzette', 'Was? Nein! Ich weiß nicht mal, was ein Grundriss ist! Ich zeichne nur Moleküle! Kleine! Harmlose!'),
        nar('Sie versteckt sich hinter ihrer Nudelschale. Vielleicht ein andermal, freundlicher.'),
      ],
    },
    {
      id: 'mitgefuehl',
      lines: [
        l('pim-pinzette', 'Harter Tag? Harte Woche. Hartes Jahr. Frau Zero sagt, Schlaf ist was für Leute ohne Deadline. Und jetzt dieses Ding im Labor null, das nachts mit sich selbst redet, und keiner darf drüber reden, und ich muss jeden Abend die Lüftungsklappen kontrollieren, weil es da drin so warm wird, und –'),
        l('pim-pinzette', 'Entschuldigung. Ich red zu viel.'),
        l('player', 'Wo sind denn die Lüftungsklappen?'),
        l('pim-pinzette', 'Na hier und hier, und der Gang geht so, und dann kommt die Schleuse, und da ist die Tür, die immer klemmt –'),
        nar('Sie zeichnet. Auf eine Serviette. Mit Sojasoße. Labor, Gänge, Schleuse, zwei Lüftungsschächte. Dann merkt sie, was sie getan hat, und wird kreidebleich.'),
        l('pim-pinzette', 'Aber Sie haben das nicht von mir! Ich hab hier nur gegessen! Ich esse immer! Ich bin quasi eine Esserin!'),
      ],
      effects: [...GEFUNDEN('grundriss_pim'), { relation: 'pim-pinzette', delta: 40 }],
    },
  ],
};

const kameramann: DialogueDef = {
  id: 'prep-grundriss-kameramann',
  start: 'start',
  nodes: [
    {
      id: 'start',
      lines: [
        nar('Der Kameramann filmt einen Händler, der einen Toaster anschreit. Als du näherkommst, schwenkt sein Helm zu dir.'),
        l('kameramann', '[AUFNAHME LÄUFT]'),
        l('player', 'Du warst beim Pressetermin im Quantum-Labor, oder? Hast du da zufällig … alles gefilmt?'),
        l('kameramann', '[ALLES]'),
        l('kameramann', '[300 CR]'),
      ],
      choices: [
        { text: 'Bezahlen (300 Cr).', requires: { credits: 300 }, effects: [{ credits: -300 }], next: 'standbild' },
        { text: '„Wir haben zusammen live gedreht. Gilt das was?“', tag: '[Live dabei]', when: done('side-live-dabei'), next: 'gratis' },
        { text: '„Zu teuer.“', next: 'teuer' },
      ],
    },
    {
      id: 'teuer',
      lines: [l('kameramann', '[ : ( ]')],
    },
    {
      id: 'gratis',
      lines: [l('kameramann', '[ : ) ]'), l('kameramann', '[FÜR KOLLEGEN: 0 CR]')],
      next: 'standbild',
    },
    {
      id: 'standbild',
      lines: [
        nar('Er spult. Sein Visier zeigt Standbilder: Gänge, Schleusen, ein Wachmann, der in der Nase bohrt. Dann druckt ein Schlitz an seinem Gürtel einen Thermostreifen aus – den Grundriss, zusammengesetzt aus vierzig Einzelbildern.'),
        l('kameramann', '[GRUNDRISS.JPG]'),
        l('kameramann', '[NICHT VON MIR]'),
      ],
      effects: [...GEFUNDEN('grundriss_kameramann'), { relation: 'kameramann', delta: 20 }],
    },
  ],
};

export const part: ContentPart = {
  quests: { [Q]: quest },
  dialogues: { [drohne.id]: drohne, [pim.id]: pim, [kameramann.id]: kameramann },
  mapAdditions: {
    hafenkante: {
      hotspots: [
        { id: 'prep-grundriss-drohne', at: 'quantum-depot', label: 'Quantum-Lieferdrohne', kind: 'use', dialogue: drohne.id, when: OFFEN },
      ],
    },
    schrottmarkt: {
      hotspots: [
        { id: 'prep-grundriss-pim', at: 'imbiss-loetkolben', label: 'Pim Pinzette ansprechen', kind: 'talk', dialogue: pim.id, when: all(OFFEN, { time: 'abend' }) },
        { id: 'prep-grundriss-kameramann', at: 'filmposten', label: 'Kameramann: Labor-Aufnahmen', kind: 'talk', dialogue: kameramann.id, when: all(OFFEN, { time: 'abend' }) },
      ],
    },
    'digitech-areal': {
      hotspots: [
        {
          id: 'prep-grundriss-archiv',
          at: 'archiv',
          label: 'Alte Digitech-Pläne',
          kind: 'use',
          when: all(OFFEN, { origin: 'origin-ex-wache' }),
          once: true,
          lines: [
            nar('Du kennst diese Schränke. Du hast sie früher bewacht, nachts, mit einer Thermoskanne und zu viel Zeit. Dritte Schublade, unter den Kantinenplänen.'),
            nar('„Quantum-Campus · Labortrakt · Bauabschnitt 0 · ausgeführt durch Digitech“. Digitech hat das Labor gebaut, bevor Quantum Digitech geschluckt hat. Mit allen Lüftungsschächten.'),
          ],
          effects: [...GEFUNDEN('grundriss_archiv')],
        },
      ],
    },
  },
};
