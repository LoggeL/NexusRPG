// Party-Vorbereitung prep-fahrzeug „Fluchtwagen“ (world.md §5.3; Flucht ohne Verfolgung in Akt 3).
// Wege:
//   Rostlaube – side-rostlaube erledigt (rostlaube_faehrt / prep_fahrzeug_rostlaube): zählt sofort
//   Rennen    – staubstrasse:rennpiste-start (Staubfalken leihen nach einem Sieg ihren Buggy; Leihbuggy-Rennen
//               akt-wrackrennen) · rennhalle-9:rennbahn (Turbo-Tilda setzt ihren Transporter, akt-schrottbot-rennen;
//               nach dem Pokal ohne Rennen)
//   Geld      – 800 Cr für Hafen-Hannes’ alten Fischtransporter (hafenkante:garage-rostlaube)
// Abschluss-Flag prep_fahrzeug (+ fahrzeug_<art>).
import type { ContentPart } from '../../part';
import type { DialogueDef, Effect, QuestDef } from '../../../modules/contracts';
import { PLAN_STEHT, active, all, any, dlg, done, flag, herz, l, msg, nar, node, not, set } from './_lib';

const Q = 'prep-fahrzeug';
const AKTIV = active(Q);
const FERTIG = flag('prep_fahrzeug');
const ROSTLAUBE = any(flag('rostlaube_faehrt'), flag('prep_fahrzeug_rostlaube'), done('side-rostlaube'));
const OFFEN = all(AKTIV, not(FERTIG));

const ABSCHLUSS = (art: string): Effect[] => [set('prep_fahrzeug'), set(`fahrzeug_${art}`), msg('Fluchtwagen für die Releaseparty: erledigt.')];

const quest: QuestDef = {
  id: Q,
  kind: 'main',
  title: 'Fluchtwagen',
  summary: 'Nach der Party wird es eilig. Wir brauchen eine Karre, die schneller ist als Quantums Drohnen und nicht auf Hunter angemeldet.',
  giver: 'hunter',
  act: 2,
  autoStart: PLAN_STEHT,
  steps: [
    {
      id: 'wagen',
      text: 'Fluchtwagen besorgen: die Rostlaube, ein Rennsieg (Staubstraße oder Halle 9) oder 800 Credits am Hafen.',
      done: any(FERTIG, ROSTLAUBE),
      marker: { map: 'hafenkante', at: 'garage-rostlaube' },
      effects: [set('prep_fahrzeug')],
    },
  ],
  reward: { xp: 120 },
};

const hannes: DialogueDef = dlg('m2-prep-hannes', [
  node('start', [
    l('hafen-hannes', 'Fluchtwagen? Ich hab nur den alten Fischtransporter. Riecht nach Hering, fährt wie ein Hering, aber er fährt.', 'neutral'),
    l('hafen-hannes', 'Achthundert. Und ich will ihn nicht zurück. Nie. Egal, was ihr damit macht.', 'signatur'),
  ], {
    choices: [
      { text: '„Gekauft.“', requires: { credits: 800 }, effects: [{ credits: -800 }, ...ABSCHLUSS('fischtransporter')], next: 'gekauft' },
      { text: '„Zu teuer für Hering.“' },
    ],
  }),
  node('gekauft', [nar('Hannes wirft dir den Schlüssel zu. Am Anhänger: ein Plastikfisch, der singt, wenn man ihn drückt. Du drückst nicht. Du willst nicht wissen, was er singt.')]),
]);

const falken: DialogueDef = dlg('m2-prep-falken', [
  node('start', [
    nar('An der Startlinie lehnen die Staubfalken an einem Buggy mit Haifischmaul auf der Haube. Einer spuckt in den Staub.'),
    l('narrator', '„Fluchtwagen? Unser Buggy fährt nur für Leute, die schon mal gewonnen haben. Hier. Gegen uns.“'),
  ], {
    choices: [
      { text: '„Ich hab schon gewonnen. Erinnerst du dich?“', when: { wonMinigame: 'wrackrennen-staubstrasse' }, effects: ABSCHLUSS('buggy'), next: 'buggy' },
      {
        text: 'Leihbuggy. Einmal rum. Schanze inklusive.',
        effects: [{
          minigame: 'akt-wrackrennen', level: 3, key: 'prep-fahrzeug-buggy', label: 'Rennen um den Buggy',
          win: [...ABSCHLUSS('buggy'), { rep: 'staubfalken', delta: 3 }, msg('Erste. Die Falken heulen wie Kojoten und werfen dir die Schlüssel zu.')],
          lose: [{ damage: 3 }, msg('Die Schanze war höher als gedacht. Der Boden auch.')],
        }],
      },
      { text: '„Ein andermal.“' },
    ],
  }),
  node('buggy', [nar('Der Falke wirft dir die Schlüssel zu. „Bring ihn mit Kratzern zurück. Ohne Kratzer ist peinlich.“')]),
]);

const tilda: DialogueDef = dlg('m2-prep-tilda', [
  node('start', [
    l('turbo-tilda', 'Fluchtwagen? Ich hab einen Transporter, der vor der Polizei wegfährt, bevor sie einsteigt. Aber umsonst gibt’s nur Ärger.', 'signatur'),
  ], {
    choices: [
      { text: '„Ich hab dir den Pokal weggeschnappt. Reicht das als Referenz?“', when: { wonMinigame: 'rennhalle-pokal' }, effects: [...ABSCHLUSS('transporter'), herz('turbo-tilda', 30)], next: 'pokal' },
      {
        text: '„Ein Rennen. Ich gewinne: Transporter. Du gewinnst: ich wasch ihn. Mit der Zunge.“',
        effects: [{
          minigame: 'akt-schrottbot-rennen', level: 3, key: 'prep-fahrzeug-tilda', label: 'Rennen gegen Turbo-Tilda',
          win: [...ABSCHLUSS('transporter'), herz('turbo-tilda', 40), msg('Tilda flucht, lacht und wirft dir die Schlüssel an den Kopf. Liebe auf Rennbahnart.')],
          lose: [herz('turbo-tilda', 10), msg('Tilda überholt dich auf der Innenbahn und winkt dabei. Mit beiden Händen.')],
        }],
      },
      { text: '„Ich überleg’s mir.“' },
    ],
  }),
  node('pokal', [l('turbo-tilda', 'Reicht. Schlüssel. Tank ist voll, Kennzeichen geklaut, Kassette drin. Spul nicht vor, Lied drei ist das beste.', 'freude')]),
]);

export const part: ContentPart = {
  quests: { [Q]: quest },
  dialogues: Object.fromEntries([hannes, falken, tilda].map(d => [d.id, d])),
  mapAdditions: {
    hafenkante: {
      hotspots: [
        { id: 'm2-prep-hannes', at: 'garage-rostlaube', label: 'Hafen-Hannes: Fischtransporter (800 Cr)', kind: 'talk', dialogue: hannes.id, when: all(OFFEN, not(ROSTLAUBE)) },
      ],
    },
    staubstrasse: {
      hotspots: [
        { id: 'm2-prep-falken', at: 'rennpiste-start', label: 'Staubfalken: Buggy', kind: 'talk', dialogue: falken.id, when: OFFEN },
      ],
    },
    'rennhalle-9': {
      hotspots: [
        { id: 'm2-prep-tilda', at: 'rennbahn', label: 'Turbo-Tilda: Transporter', kind: 'talk', dialogue: tilda.id, when: OFFEN },
      ],
    },
  },
};

