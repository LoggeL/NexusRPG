// Party-Vorbereitung prep-turm-plan „Wo ist der Kern?“ (world.md §5.3; Serverkern in Akt 3 markiert).
// Wege:
//   Nyra per Funk – datentunnel:nyra-funkpunkt: akt-hacken auf ihre Frequenz, eigener Technik-Check, oder einfach rufen
//                   und warten (zwei Stunden, ohne Check). Die Funkecke der Karte blendet sich während der Quest aus.
//   Beweismittel  – eisenhof:beweismittellager: alte Digitech-Turmpläne von 2079 (Kessel lässt rein nach
//                   side-feierabend-fuer-kessel, akt-schloss, oder eigener Straße-Check beim Lageristen)
//   Archiv        – chrome-penthouse:bibliothek: die Baupläne der Chrome-Schwestern (nach side-teekraenzchen von
//                   Serenity, sonst eine Stunde blättern)
//   Pim           – schrottmarkt:imbiss-loetkolben (abends): 300 Cr oder eigener Ausstrahlung-Check
// Abschluss-Flag prep_turm_plan (main-3-gedankenkontrolle: „Nyra: Ich kenn einen Weg.“).
import type { ContentPart } from '../../part';
import type { DialogueDef, Effect, QuestDef } from '../../../modules/contracts';
import { PLAN_STEHT, active, all, any, dlg, done, flag, herz, l, msg, nar, node, not, pruef, set } from './_lib';

const Q = 'prep-turm-plan';
const AKTIV = active(Q);
const FERTIG = flag('prep_turm_plan');
const OFFEN = all(AKTIV, not(FERTIG));
const KESSEL_FREI = any(flag('kessel_frei'), done('side-feierabend-fuer-kessel'));

const funkFrequenz = pruef('prep-turm-plan-frequenz', 'technik', 6, ['hacken', 'funk']);
const lagerist = pruef('prep-turm-plan-lagerist', 'strasse', 6, ['bestechen', 'verhandeln']);
const pimCharme = pruef('prep-turm-plan-pim', 'ausstrahlung', 5, ['ueberreden']);

const ABSCHLUSS = (quelle: string): Effect[] => [set('prep_turm_plan'), set(`turm_plan_${quelle}`), msg('Turm-Plan für die Releaseparty: erledigt.')];

const quest: QuestDef = {
  id: Q,
  kind: 'main',
  title: 'Wo ist der Kern?',
  summary: 'Der Quantum-Spire hat hundertzwölf Stockwerke und genau einen Raum, der zählt. Wer weiß, wo der Serverkern sitzt? Nyra. Oder alte Pläne.',
  giver: 'hunter',
  act: 2,
  autoStart: PLAN_STEHT,
  steps: [
    {
      id: 'plan',
      text: 'Einen Weg zum Serverkern finden: Nyra per Funk aus dem Datentunnel, alte Pläne am Eisenhof, das Archiv der Chrome-Schwestern oder Pim.',
      done: FERTIG,
      marker: { map: 'datentunnel', at: 'nyra-funkpunkt' },
    },
  ],
  reward: { xp: 120 },
};

const nyraFunk: DialogueDef = dlg('m2-prep-nyra-funk', [
  node('start', [
    nar('Die Funkecke im Datentunnel. Ein Bündel Antennen, mit Klebeband an ein Rohr gewickelt, darüber Nyras Kritzelei: „Hier hört der Turm nicht hin.“'),
  ], {
    choices: [
      {
        text: 'Ihre Frequenz suchen. Zwischen Quantum-Rauschen und Werbejingles.',
        effects: [{ minigame: 'akt-hacken', level: 3, key: 'prep-turm-plan-funk', label: 'Nyras Frequenz', win: [{ dialogue: 'm2-prep-nyra-antwort' }], lose: [msg('Rauschen. Dann Werbung: „Chrome 10 – denken Sie weniger, fühlen Sie mehr!“ Nochmal.')] }],
      },
      { text: 'Die Frequenz aus dem Kopf einstellen. Nyra benutzt immer Primzahlen.', check: funkFrequenz, effects: [{ dialogue: 'm2-prep-nyra-antwort' }] },
      { text: 'Einfach rufen. Und warten.', effects: [{ advanceTime: 120 }, { dialogue: 'm2-prep-nyra-antwort' }], next: 'warten' },
      { text: 'Später.' },
    ],
  }),
  node('warten', [nar('Du rufst. Zehnmal. Zwanzigmal. Zwei Stunden lang sitzt du auf einem Kabelstrang und sagst Nyras Namen ins Rauschen. Dann knackt es.')]),
]);

const nyraAntwort: DialogueDef = dlg('m2-prep-nyra-antwort', [
  node('start', [
    l('nyra', '… hallo? Hallo! Ich bin’s! Ich bin’s wirklich, nicht die KI, die macht keine Ähs. Äh.', 'freude'),
    l('nyra', 'Ich hab nicht viel Zeit, Alesa kommt um Viertel nach. Der Kern ist im Stock 108. Nicht der Hauptaufzug, der fragt nach Fingerabdrücken. Der Gästeaufzug, Wartungsklappe, dann die Treppe für Reinigungsdrohnen.', 'besorgt'),
    l('nyra', 'Ich mal’s euch auf. Ich schick’s als Bild. Mit einem Herz, damit ihr wisst, dass es von mir ist.', 'zaertlich'),
  ], {
    choices: [
      { text: '„Wir kommen dich holen, Nyra.“', effects: [...ABSCHLUSS('nyra'), herz('nyra', 40)], next: 'ende' },
      { text: '„Halt durch. Und fass nichts an, was ‚Master‘ sagt.“', effects: [...ABSCHLUSS('nyra'), herz('nyra', 30)], next: 'ende' },
    ],
  }),
  node('ende', [l('nyra', 'Ich weiß. Ich hab dein Gesicht gesehen, als die Tür zuging. Tschüss. Ich muss … tschüss!', 'trauer')]),
]);

const lager: DialogueDef = dlg('m2-prep-lager', [
  node('start', [
    nar('Das Beweismittellager. Regale bis zur Decke, alles mit Nummern. Irgendwo hier, unter „DIGITECH 2079“, liegen die Baupläne, die Blade damals vergessen hat.'),
  ], {
    choices: [
      { text: '„Kessel? Ich such was von 2079.“', tag: '[Kessel]', when: KESSEL_FREI, effects: ABSCHLUSS('lager'), next: 'kessel' },
      { text: 'Das Gitterschloss knacken.', effects: [{ minigame: 'akt-schloss', level: 3, key: 'prep-turm-plan-lager', label: 'Gitter im Beweismittellager', win: [...ABSCHLUSS('lager'), { xp: 30 }], lose: [msg('Ein Stift bricht. Irgendwo hustet ein Wachmann. Später.')] }] },
      { text: '(Dem Lageristen einen Fünfziger hinlegen und auf „Inventur“ machen.)', check: lagerist, effects: [{ credits: -50 }, ...ABSCHLUSS('lager')], requires: { credits: 50 }, next: 'lagerist' },
      { text: 'Später.' },
    ],
  }),
  node('kessel', [
    l('wache', 'Digitech? Regal 40, unten. Daneben liegen deine alten Akten, falls dich das interessiert. Tut’s nicht? Gut.', 'neutral'),
    nar('Ein vergilbter Ordner: „QUANTUM-SPIRE – ROHBAU – TECHNIKGESCHOSSE“. Stock 108 ist rot umrandet. Mit Kugelschreiber, von einer Hand, die zitterte.'),
  ]),
  node('lagerist', [nar('Der Lagerist murmelt „Inventur“ und guckt in eine andere Richtung. Der Ordner „QUANTUM-SPIRE – TECHNIKGESCHOSSE“ wandert unter deine Jacke.')]),
]);

const archiv: DialogueDef = dlg('m2-prep-archiv', [
  node('start', [
    nar('Die Bibliothek der Chrome-Schwestern. Ledereinbände, die nie gelesen wurden, und ein Regal, auf dem „FAMILIENBESITZ“ steht. Der Spire gehört ihnen zu dreißig Prozent. Natürlich haben sie die Pläne.'),
  ], {
    choices: [
      { text: '„Serenity? Du hast gesagt, wenn ich mal was brauche …“', when: done('side-teekraenzchen'), effects: ABSCHLUSS('archiv'), next: 'serenity' },
      { text: '(Blättern. Lange.)', effects: [{ advanceTime: 60 }, ...ABSCHLUSS('archiv')], next: 'blaettern' },
      { text: 'Lieber gehen, bevor jemand Tee anbietet.' },
    ],
  }),
  node('serenity', [
    l('serenity-chrome', 'Die Baupläne? Liebes, die liegen in der Schublade mit den Servietten. Wir benutzen sie als Untersetzer. Nimm sie mit. Wir haben Kopien. Glaube ich.', 'freude'),
  ]),
  node('blaettern', [nar('Eine Stunde, drei Niesattacken und ein Kapitel „Unser Pferd Gustav“ später: der Ordner „SPIRE – KERN – NUR FÜR AUFSICHTSRAT“. Stock 108. Du steckst ihn ein. Hier vermisst eh keiner was, das nicht glänzt.')]),
]);

const pim: DialogueDef = dlg('m2-prep-pim', [
  node('start', [
    l('pim-pinzette', 'Turmpläne? Ich hab beim Spire die Klos verkabelt. Ich weiß, wo jedes Rohr hingeht. Rohre lügen nicht.', 'signatur'),
  ], {
    choices: [
      { text: '„Dreihundert für eine Skizze.“', requires: { credits: 300 }, effects: [{ credits: -300 }, ...ABSCHLUSS('pim')], next: 'skizze' },
      { text: '„Pim. Du bist der Einzige in der Stadt, der weiß, wie ein Turm von innen aussieht. Lass mich nicht dumm sterben.“', check: pimCharme, effects: ABSCHLUSS('pim'), next: 'skizze' },
      { text: '„Ein andermal.“' },
    ],
  }),
  node('skizze', [nar('Pim zeichnet auf eine Serviette, mit Senf. Stock 108, die Reinigungstreppe, ein Kreuz. „Da ist der Kern“, sagt er. „Und da das beste Klo der Stadt. Falls ihr Zeit habt.“')]),
]);

export const part: ContentPart = {
  quests: { [Q]: quest },
  dialogues: Object.fromEntries([nyraFunk, nyraAntwort, lager, archiv, pim].map(d => [d.id, d])),
  checks: { [funkFrequenz.id]: funkFrequenz, [lagerist.id]: lagerist, [pimCharme.id]: pimCharme },
  mapAdditions: {
    datentunnel: {
      hotspots: [
        { id: 'm2-prep-nyra-funk', at: 'nyra-funkpunkt', label: 'Funkecke: Nyra rufen', kind: 'use', dialogue: nyraFunk.id, when: OFFEN },
      ],
    },
    eisenhof: {
      hotspots: [
        { id: 'm2-prep-lager', at: 'beweismittellager', label: 'Beweismittellager: Turmpläne', kind: 'use', dialogue: lager.id, when: OFFEN },
      ],
    },
    'chrome-penthouse': {
      hotspots: [
        { id: 'm2-prep-archiv', at: 'bibliothek', label: 'Archiv der Schwestern', kind: 'use', dialogue: archiv.id, when: OFFEN },
      ],
    },
    schrottmarkt: {
      hotspots: [
        { id: 'm2-prep-pim', at: 'imbiss-loetkolben', label: 'Pim Pinzette: Turmpläne', kind: 'talk', dialogue: pim.id, when: all(OFFEN, { time: 'abend' }) },
      ],
    },
  },
};
