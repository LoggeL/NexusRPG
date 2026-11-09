// sonder-pumpwerk-pegel „Nasse Füße“ (Hunters Sonderauftrag, Rang 5): Im Kanal steigt das Wasser. Pumpwerk Sieben
// pumpt falsch herum. Ventilstand (akt-ventil, [Technik 7] oder [Körper 7]), Pegel am Terminal der Außenstelle ablesen,
// Bericht bei Bürgermeister Gully im Rathaus am Kanal-Sammler.
import type { ContentPart } from '../../part';
import type { DialogueDef, QuestDef } from '../../../modules/contracts';
import { active, all, ch, chk, dlg, flag, herz, l, n, noFlag, node, not, p, set, stepDone } from './_lib';

const Q = 'sonder-pumpwerk-pegel';
const AKTIV = active(Q);
const VENTIL = flag('spp_ventil');
const PEGEL = flag('spp_pegel');
const BERICHT = flag('spp_bericht');

const quest: QuestDef = {
  id: Q,
  kind: 'side',
  title: 'Sonderauftrag: Nasse Füße',
  summary: 'Bürgermeister Gully sagt, im Kanal steigt das Wasser. Hunter sagt, ohne Kanalvolk keine Abkürzungen. Pumpwerk Sieben ist schuld. Natürlich.',
  giver: 'hunter',
  act: 2,
  steps: [
    { id: 'ventil', text: 'Dreh im Pumpwerk Sieben das Hauptventil in die richtige Richtung.', done: VENTIL, marker: { map: 'pumpwerk-sieben', at: 'ventil-stand' } },
    { id: 'pegel', text: 'Lies am Terminal der Außenstelle ab, ob der Pegel sinkt.', done: PEGEL, when: stepDone(Q, 'ventil'), marker: { map: 'pumpwerk-sieben', at: 'aussenstelle-terminal' } },
    { id: 'bericht', text: 'Erstatte Bürgermeister Gully im Rathaus am Kanal-Sammler Bericht.', done: BERICHT, when: stepDone(Q, 'pegel'), marker: { map: 'kanal-sammler', at: 'gullys-rathaus' } },
  ],
  reward: { xp: 300, credits: 200, rep: { kanalvolk: 20, 'crew-hunter': 5 }, relations: { 'buergermeister-gully': 20, hunter: 15 } },
};

const technik = chk('spp-ventil-technik', 'technik', 7, ['maschine']);
const koerper = chk('spp-ventil-koerper', 'koerper', 7, ['kraft']);

const ventil: DialogueDef = dlg('spp-ventil', [
  node('start', [
    n('Das Hauptventil: ein Rad, so groß wie ein Autoreifen, rot lackiert, mit einem Pfeil „ZU“ und einem zweiten Pfeil „AUCH ZU“. Wer immer das beschriftet hat, wollte Ärger.'),
    n('Hinter der Wand gurgelt es. Der Kanal läuft voll, weil irgendwer die Pumpe auf „rein“ statt „raus“ gestellt hat.'),
  ], { choices: [
    ch('Die Leitungen lesen und das richtige Ventil finden.', 'technik', { check: technik, effects: [set('spp_ventil')] }),
    ch('Das Rad mit roher Gewalt herumreißen.', 'koerper', { check: koerper, effects: [set('spp_ventil'), { damage: 5 }] }),
    ch('Ausprobieren. Ventil für Ventil.', undefined, {
      effects: [{
        minigame: 'akt-ventil', level: 2, key: 'spp-ventil', label: 'Pumpwerk Sieben: Pumprichtung umkehren',
        win: [set('spp_ventil'), { message: 'Das Gurgeln wird zum Saugen. Irgendwo tief unten seufzt ein Rohr erleichtert.' }],
        lose: [{ message: 'Ein Rohr spuckt dir eine Ladung Kanalwasser ins Gesicht. Versuch es nochmal. Mund zu.' }],
      }],
    }),
    ch('Gehen.'),
  ] }),
  node('technik', [n('Rot heißt rein, blau heißt raus, und der Pfeil „AUCH ZU“ heißt in Wahrheit „AUF“. Du drehst. Das Gurgeln wird zum Saugen.')]),
  node('koerper', [
    n('Das Rad bewegt sich nicht. Dann ein bisschen. Dann gar nicht. Dann knackt etwas in deiner Schulter, und es dreht sich ganz. Das Gurgeln wird zum Saugen.'),
    p('Au. Aber au mit Ergebnis.'),
  ]),
]);

const terminal: DialogueDef = dlg('spp-terminal', [
  node('start', [
    n('Das Terminal der Außenstelle flackert. Eine Kurve, die bisher steil nach oben ging, knickt ab. Darunter blinkt: „PEGEL SINKT. GLÜCKWUNSCH. BITTE NICHT WIEDER ANFASSEN.“'),
  ], { choices: [ch('Pegelstand notieren.', undefined, { effects: [set('spp_pegel')] })] }),
]);

const gully: DialogueDef = dlg('spp-gully', [
  node('start', [
    l('buergermeister-gully', 'Und? Und? Ich hab meine Füße seit drei Tagen nicht gesehen. Ich vermisse sie. Sie waren nicht schön, aber sie waren meine.', 'besorgt'),
    p('Der Pegel sinkt. Pumpwerk Sieben pumpt wieder raus statt rein.'),
    l('buergermeister-gully', 'Raus! Das Kanalvolk dankt dir! Ich dekretiere einen Feiertag! Ich dekretiere ein Bad! In einem Fass! Wer kommt mit?', 'freude'),
  ], { choices: [
    ch('„Ich verzichte.“', 'ende', { effects: [set('spp_bericht')] }),
    ch('„Grüß Hunter von mir, wenn er das nächste Mal durchkommt.“', 'ende', { effects: [set('spp_bericht'), herz('buergermeister-gully', 5)] }),
  ] }),
  node('ende', [l('buergermeister-gully', 'Hunter kriegt einen Orden. Aus Rohr. Wie meine Krone. Du kriegst auch einen. Einen kleineren. Aus Rohr.', 'freude')]),
]);

export const part: ContentPart = {
  quests: { [Q]: quest },
  dialogues: Object.fromEntries([ventil, terminal, gully].map((d) => [d.id, d])),
  mapAdditions: {
    'pumpwerk-sieben': {
      hotspots: [
        { id: 'spp-ventil', at: 'ventil-stand', radius: 40, label: 'Hauptventil umstellen', kind: 'use', dialogue: ventil.id, when: all(AKTIV, not(VENTIL)) },
        { id: 'spp-terminal', at: 'aussenstelle-terminal', radius: 40, label: 'Pegelstand ablesen', kind: 'use', dialogue: terminal.id, when: all(AKTIV, VENTIL, noFlag('spp_pegel')) },
      ],
    },
    'kanal-sammler': {
      hotspots: [{ id: 'spp-gully', at: 'gullys-rathaus', radius: 46, label: 'Gully: Bericht vom Pumpwerk', kind: 'talk', dialogue: gully.id, when: all(AKTIV, PEGEL, not(BERICHT)) }],
    },
  },
};
