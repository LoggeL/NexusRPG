// Party-Vorbereitung prep-ausweise „Papiere, bitte“ (world.md §5.3). Fräulein Pixel fälscht Oberstadt-Ausweise.
// Drei Teile:
//   Fotos     – bahnhof-mitte:fotoautomat: akt-fotoautomat (Stufe 2) oder brav lächeln (ohne Check, 20 Cr)
//   Folie     – hafenkante:quantum-depot: akt-schloss, eigener Reflexe-Check (Rolle vom Laster) oder 150 Cr am Fahrer
//   Stempel   – eisenhof:behoerden-terminal: geschenkt nach side-feierabend-fuer-kessel (kessel_frei), akt-hacken
//               oder eigener Ausstrahlung-Check beim Pförtner; sonst Wartenummer ziehen (Zeit, ohne Check)
// Abgabe bei Pixel (Fotoautomat) → party-ausweis, prep_ausweise (main-3-einlass: erste Kontrolle automatisch).
import type { ContentPart } from '../../part';
import type { DialogueDef, QuestDef } from '../../../modules/contracts';
import { PLAN_STEHT, active, all, any, dlg, done, flag, herz, l, msg, nar, node, not, pruef, set } from './_lib';

const Q = 'prep-ausweise';
const AKTIV = active(Q);
const FOTOS = flag('ausweis_fotos');
const FOLIE = flag('ausweis_folie');
const STEMPEL = flag('ausweis_stempel');
const FERTIG = flag('prep_ausweise');
const KESSEL_FREI = any(flag('kessel_frei'), done('side-feierabend-fuer-kessel'));

const folieGriff = pruef('prep-ausweise-folie-griff', 'reflexe', 6, ['stehlen', 'schleichen']);
const stempelPfoertner = pruef('prep-ausweise-pfoertner', 'ausstrahlung', 6, ['luegen', 'bluff']);

const quest: QuestDef = {
  id: Q,
  kind: 'main',
  title: 'Papiere, bitte',
  summary: 'Fräulein Pixel fälscht Oberstadt-Ausweise, die sogar Quantum glaubt. Sie braucht Fotos, Druckerfolie und einen echten Behördenstempel.',
  giver: 'fraeulein-pixel',
  act: 2,
  autoStart: PLAN_STEHT,
  steps: [
    { id: 'fotos', text: 'Passfotos am Fotoautomaten im Bahnhof Mitte.', done: any(FOTOS, FERTIG), marker: { map: 'bahnhof-mitte', at: 'fotoautomat' } },
    { id: 'folie', text: 'Hologramm-Druckerfolie aus dem Quantum-Depot an der Hafenkante.', done: any(FOLIE, FERTIG), marker: { map: 'hafenkante', at: 'quantum-depot' } },
    { id: 'stempel', text: 'Einen Behördenstempel vom Terminal am Eisenhof.', done: any(STEMPEL, FERTIG), marker: { map: 'eisenhof', at: 'behoerden-terminal' } },
    {
      id: 'pixel', text: 'Alles zu Fräulein Pixel am Fotoautomaten bringen (abends und nachts).', when: all(FOTOS, FOLIE, STEMPEL),
      done: FERTIG, marker: { map: 'bahnhof-mitte', at: 'fotoautomat' },
    },
  ],
  reward: { xp: 150, relations: { 'fraeulein-pixel': 40 } },
};

const fotos: DialogueDef = dlg('m2-prep-fotos', [
  node('start', [
    nar('Der Fotoautomat. Ein Vorhang mit Brandloch, ein Hocker, der sich dreht, wenn man es nicht will. Auf dem Bildschirm: „LÄCHELN. NICHT ZU VIEL. DAS IST VERDÄCHTIG.“'),
  ], {
    choices: [
      {
        text: 'Pixels Hologramm-Raster gleich mit einstellen.',
        effects: [{
          minigame: 'akt-fotoautomat', level: 2, key: 'prep-ausweise-fotos', label: 'Passfotos mit Hologramm',
          win: [set('ausweis_fotos'), set('ausweis_fotos_perfekt'), { xp: 30 }, msg('Vier Fotos, Hologramm sitzt. Pixel wird weinen vor Freude. Oder vor Neid.')],
          lose: [set('ausweis_fotos'), msg('Vier Fotos. Auf einem blinzelst du. Auf einem anderen bist du nur ein Ohr. Reicht.')],
        }],
      },
      { text: 'Einfach brav lächeln. (20 Cr)', requires: { credits: 20 }, effects: [{ credits: -20 }, set('ausweis_fotos')], next: 'brav' },
    ],
  }),
  node('brav', [nar('Klick. Klick. Klick. Klick. Du siehst auf allen vier Fotos aus wie jemand, der gerade erfahren hat, was Miete ist. Perfekt für die Oberstadt.')]),
]);

const folie: DialogueDef = dlg('m2-prep-folie', [
  node('start', [
    nar('Am Quantum-Depot lädt ein Fahrer Kisten aus einem weißen Laster. Auf einer steht „HOLOFOLIE – NUR FÜR BEHÖRDEN – NICHT KNICKEN“.'),
  ], {
    choices: [
      { text: 'Hinterm Laster das Kistenschloss knacken.', effects: [{ minigame: 'akt-schloss', level: 2, key: 'prep-ausweise-folie', label: 'Kistenschloss am Depot', win: [set('ausweis_folie'), msg('Eine Rolle Holofolie, noch warm vom Laster.')], lose: [msg('Der Stift springt zurück. Der Fahrer pfeift. Nochmal, aber leiser.')] }] },
      { text: 'Eine Rolle im Vorbeigehen mitnehmen.', check: folieGriff, effects: [set('ausweis_folie')], next: 'griff' },
      { text: '„Hey, Kollege. Hundertfünfzig für eine Rolle, und du hast nichts gesehen.“', requires: { credits: 150 }, effects: [{ credits: -150 }, set('ausweis_folie')], next: 'fahrer' },
      { text: 'Später wiederkommen.' },
    ],
  }),
  node('griff', [nar('Eine Drehung, ein Griff, eine Rolle unter der Jacke. Der Fahrer zählt die Kisten nach und kommt auf die richtige Zahl. Er hat sich verzählt. Glück.')]),
  node('fahrer', [
    l('player', 'Und, Kollege? Schöner Tag zum Wegsehen.', 'signatur'),
    nar('Der Fahrer steckt das Geld ein und dreht sich zur Wand. „Ich hab Rücken“, sagt er. „Ich seh nix, wenn ich Rücken hab.“'),
  ]),
]);

const stempel: DialogueDef = dlg('m2-prep-stempel', [
  node('start', [
    nar('Das Behördenterminal am Eisenhof. Ein Bildschirm, ein Stempelautomat, ein Pförtner, der seit 2079 auf seinen Feierabend wartet.'),
  ], {
    choices: [
      { text: '„Kessel schickt mich.“', tag: '[Kessel]', when: KESSEL_FREI, next: 'kessel' },
      { text: 'Den Stempelautomaten über die Wartungsbuchse ansprechen.', effects: [{ minigame: 'akt-hacken', level: 2, key: 'prep-ausweise-stempel', label: 'Stempelautomat', win: [set('ausweis_stempel'), msg('Der Automat stempelt ein Blatt „AMTLICH GEPRÜFT“. Mehrfach. Er hört nicht auf. Du nimmst eins und gehst.')], lose: [{ damage: 2 }, msg('Der Automat stempelt dir auf die Hand. „ABGELEHNT“.')] }] },
      { text: '„Ich bin vom Amt für Ämter. Stichprobe. Stempeln Sie mal.“', check: stempelPfoertner, effects: [set('ausweis_stempel')], next: 'pfoertner' },
      { text: 'Eine Wartenummer ziehen.', effects: [{ advanceTime: 180 }, set('ausweis_stempel')], next: 'warten' },
    ],
  }),
  node('kessel', [
    l('wache', 'Ach, du. Die mit dem Feierabend. Seit ich den hab, schlaf ich wie ein Baby.', 'freude'),
    nar('Die Ex-Wachtmeisterin greift über den Tresen, nimmt den Stempel und haut ihn dreimal auf ein Blatt. Echt. Amtlich. Mit Kaffeefleck.'),
    l('wache', 'Ich hab nix gesehen. Und wenn doch, war es Yoga.', 'signatur'),
  ], { effects: [set('ausweis_stempel'), herz('wache', 20)] }),
  node('pfoertner', [nar('Der Pförtner stempelt, ohne hochzusehen. „Amt für Ämter“, murmelt er. „Endlich kümmert sich mal jemand.“')]),
  node('warten', [nar('Nummer 347. Aufgerufen wird 12. Dann 13. Drei Stunden später bist du dran, und eine sehr müde Frau stempelt dein Blatt, ohne zu fragen, wofür. Bürokratie ist auch eine Art Freiheit.')]),
]);

const pixel: DialogueDef = dlg('m2-prep-pixel', [
  node('start', [
    l('fraeulein-pixel', 'Fotos. Folie. Stempel. Leg alles hin, Finger weg vom Laminiergerät, das beißt.', 'neutral'),
    nar('Pixel arbeitet hinter dem Vorhang. Es zischt, klickt, riecht nach heißem Plastik. Nach einer halben Stunde kommt sie heraus und fächelt mit vier Ausweisen.'),
    l('fraeulein-pixel', 'Oberstadt, Klasse A. Die erste Kontrolle winkt euch durch, ohne hinzusehen. Ab der zweiten müsst ihr gucken wie Leute mit Aktienpaket.', 'signatur'),
  ], {
    effects: [{ advanceTime: 30 }, { give: 'party-ausweis' }, set('prep_ausweise'), herz('fraeulein-pixel', 30), msg('Ausweise für die Releaseparty: erledigt.')],
  }),
]);

const OFFEN = all(AKTIV, not(FERTIG));

export const part: ContentPart = {
  quests: { [Q]: quest },
  dialogues: Object.fromEntries([fotos, folie, stempel, pixel].map(d => [d.id, d])),
  checks: { [folieGriff.id]: folieGriff, [stempelPfoertner.id]: stempelPfoertner },
  mapAdditions: {
    'bahnhof-mitte': {
      hotspots: [
        { id: 'm2-prep-fotos', at: 'fotoautomat', label: 'Fotoautomat: Passfotos', kind: 'use', dialogue: fotos.id, when: all(OFFEN, not(FOTOS)) },
        { id: 'm2-prep-pixel', at: 'fotoautomat', label: 'Fräulein Pixel: Ausweise fälschen', kind: 'talk', dialogue: pixel.id, when: all(OFFEN, FOTOS, FOLIE, STEMPEL, { time: ['abend', 'nacht'] }) },
      ],
    },
    hafenkante: {
      hotspots: [
        { id: 'm2-prep-folie', at: 'quantum-depot', label: 'Quantum-Laster: Holofolie', kind: 'use', dialogue: folie.id, when: all(OFFEN, not(FOLIE)) },
      ],
    },
    eisenhof: {
      hotspots: [
        { id: 'm2-prep-stempel', at: 'behoerden-terminal', label: 'Behördenterminal: Stempel', kind: 'use', dialogue: stempel.id, when: all(OFFEN, not(STEMPEL)) },
      ],
    },
  },
};
