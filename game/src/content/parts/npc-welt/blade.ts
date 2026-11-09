// Blade Nocturne – CEO von Quantum Industries (world.md §4.3). In Akt 1 Hintergrundfigur (§11.2): abends im Café
// Sahnehaube am eigenen Tisch, ein Satz („Kein Termin, kein Gespräch.“), kein Herzsystem. Kennt die Spielfigur noch nicht.
import type { ContentPart } from '../../part';
import { einSatz, erz, hintergrundfigur, ort, rede, sammle, sprecher, weg } from './_welt';

const ID = 'blade';
const B = sprecher(ID);

const T = {
  oberstadt: einSatz('blade-tag-oberstadt', [
    erz('Blade sieht nicht von seinem Espresso auf. Er hebt nur einen beringten Finger.'),
    B('Grüß deine Mutter. Oder lieber nicht. Kein Termin, kein Gespräch.'),
  ]),
  knast: einSatz('blade-tag-knast', [
    B('Ach, noch jemand, der Zeit hatte, über mich nachzudenken. Schmeichelhaft. Kein Termin, kein Gespräch.'),
  ]),
  standard: einSatz('blade-tag-standard', [
    erz('Ein Mann im Teddyfell-Mantel, Goldknauf-Stock am Tisch, ein Lächeln wie ein Werbeplakat. Er mustert dich, als wärst du ein Fleck auf der Tischdecke.'),
    B('Kein Termin, kein Gespräch.'),
  ]),
};

const blade = hintergrundfigur({
  id: ID,
  name: 'Blade Nocturne',
  unknownName: 'Mann im Teddyfell-Mantel',
  portrait: 'blade',
  sprite: 'blade-walk',
  faction: 'quantum',
  bio: 'CEO von Quantum Industries. Charmant, eitel, Goldknauf-Stock, Teddyfell-Mantel. Lässt sich von der KI „Master“ nennen. Abends im Café Sahnehaube.',
  gifts: {
    loves: ['goldknauf-replik', 'teddyfell-buerste', 'taschenspiegel-gold'],
    likes: ['edelbrause', 'parfuem-ozon', 'planungsbrett-glas', 'sonnenbrille-gold'],
    dislikes: ['dantes-kekse', 'vinyl-platte'],
    hates: ['beglichener-schuldschein', 'handschellen'],
  },
  schedule: [ort('A', 'cafe-sahnehaube', 'blade-tisch'), weg()],
  talk: [
    rede('blade-tag-oberstadt', { origin: 'origin-oberstadt' }),
    rede('blade-tag-knast', { origin: 'origin-knastvogel' }),
    rede('blade-tag-standard'),
  ],
});

export const part: ContentPart = {
  npcs: { [ID]: blade },
  dialogues: sammle(T.oberstadt, T.knast, T.standard),
};
