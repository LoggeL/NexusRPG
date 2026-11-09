// Hunters Sonderaufträge (world.md §6.6, Auftragstafel Rang 5 „Hunters rechte Hand“, Ruf crew-hunter ≥ 80):
// eine Mappe auf Hunters Schreibtisch im Hinterzimmer, vier persönliche Aufträge. Die Quests selbst stehen in sonder-*.ts.
import type { ContentPart } from '../../part';
import type { Condition, DialogueChoice } from '../../../modules/contracts';
import { MASTER, all, ch, dlg, inactive, n, node, not } from './_lib';

export const RANG5: Condition = all({ rep: 'crew-hunter', min: 80 }, { act: 2 }, not(MASTER));

const AUFTRAEGE: { quest: string; text: string; antwort: string }[] = [
  { quest: 'sonder-chrome-tresor', text: '„Glanzstück“ – Juwelier, Chrome-Boulevard. Ein Foto einer Perlenkette.', antwort: 'Die Kette meiner Mutter. Ich hab sie versetzt, als das High Voltage pleite war. Der Pfandschein ist abgelaufen. Ich will sie zurück.' },
  { quest: 'sonder-konvoi-nougat', text: '„Fünfzig Kisten Nougatbomben, Aussiedlerhof“. Ein Lieferschein mit Fettfleck.', antwort: 'Die Aussiedler haben mir im Winter Wasser geschickt. Ich schicke ihnen Zucker. So funktioniert Freundschaft in der Ödnis.' },
  { quest: 'sonder-pumpwerk-pegel', text: '„Pumpwerk Sieben – Pegel?“ Daneben eine Zeichnung von Gully mit nassen Füßen.', antwort: 'Bürgermeister Gully sagt, im Kanal steigt das Wasser. Wenn das Kanalvolk absäuft, haben wir keine Abkürzungen mehr. Und keinen Bürgermeister.' },
  { quest: 'sonder-letzte-runde', text: '„Rostkai Reserve 2070“. Ein altes Foto von der Fotowand, mit einem Kreuz drauf.', antwort: 'Eine Flasche. Versteckt unter der alten Bühne in der Rennhalle Neun. Für die letzte Runde. Frag nicht, mit wem. Doch, frag ruhig. Aber nicht heute.' },
];

const nodes = [
  node('start', [
    n('Auf Hunters Schreibtisch liegt eine schwarze Mappe. Auf dem Deckel, in Schönschrift: „Sonderaufträge. Nur für die rechte Hand. Wer sonst reinguckt, putzt die Toiletten.“'),
    n('Innen klebt ein Zettel: „Du bist meine rechte Hand. Also guck rein. Das sind keine Jobs. Das sind Sachen, die ich nicht allein machen will. – H.“'),
  ], { next: 'mappe' }),
  node('mappe', [], {
    choices: [
      ...AUFTRAEGE.map((a): DialogueChoice => ch(a.text, `a-${a.quest}`, { when: inactive(a.quest), id: `mappe-${a.quest}` })),
      ch('Die Mappe zuklappen.'),
    ],
  }),
  ...AUFTRAEGE.map((a) => node(`a-${a.quest}`, [n(`Darunter, in Hunters Schönschrift: „${a.antwort}“`)], {
    choices: [
      ch('Auftrag annehmen.', 'mappe', { effects: [{ startQuest: a.quest }], id: `ja-${a.quest}` }),
      ch('Zurück in die Mappe legen.', 'mappe', { id: `spaeter-${a.quest}` }),
    ],
  })),
];

const mappe = dlg('sonder-mappe', nodes);

export const part: ContentPart = {
  dialogues: { [mappe.id]: mappe },
  mapAdditions: {
    'hv-hinterzimmer': {
      hotspots: [{
        id: 'sonder-mappe', at: 'schreibtisch', radius: 44, label: 'Hunters Sonderaufträge', kind: 'use', dialogue: mappe.id,
        when: all(RANG5, { any: AUFTRAEGE.map((a) => inactive(a.quest)) }),
      }],
    },
  },
};
