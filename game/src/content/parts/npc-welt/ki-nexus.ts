// Nexus (KI) – in Akt 1 als Avatar-Hologramm im Quantum-Schauraum (world.md §4.3, §11.2). Hintergrundfigur mit einem
// Satz je Herkunft (Nexus analysiert jede Herkunft mit einem Satz), kein Herzsystem in Akt 1. Kein Laufbild (Hologramm).
import type { ContentPart } from '../../part';
import { einSatz, erz, hintergrundfigur, ort, rede, sammle, sprecher, weg } from './_welt';

const ID = 'ki-nexus';
const N = sprecher(ID);
const intro = erz('Das Hologramm in der Mitte des Schauraums dreht sich zu dir. Ein sanftes, glattes Gesicht. Es lächelt, eine Zehntelsekunde bevor du hinsiehst.');

const T = {
  gosse: einSatz('nexus-tag-gosse', [intro, N('Gossenkind. Wahrscheinlichkeit, heute etwas zu stehlen: 34 Prozent. Bitte stehlen Sie nicht. Sie sind nicht verbunden. Interessant.')]),
  oberstadt: einSatz('nexus-tag-oberstadt', [intro, N('Oberstadt. Kreditwürdigkeit früher: hoch. Heute: unbestimmt. Sie sind nicht verbunden. Interessant.')]),
  oednis: einSatz('nexus-tag-oednis', [intro, N('Ödnis: Wasserbedarf 37 % über Stadtdurchschnitt. Darf ich Ihnen ein Glas anbieten? Es ist ein Hologramm. Sie sind nicht verbunden. Interessant.')]),
  wache: einSatz('nexus-tag-wache', [intro, N('Ehemals Ordnungsdienst. Kündigungsgrund: Gewissen. Ein seltener Defekt. Sie sind nicht verbunden. Interessant.')]),
  schrott: einSatz('nexus-tag-schrott', [intro, N('Schrott-Herkunft. Ihre Hände sind zu 61 % Werkzeug. Effizient. Sie sind nicht verbunden. Interessant.')]),
  knast: einSatz('nexus-tag-knast', [intro, N('Haftentlassen. Rückfallwahrscheinlichkeit: Ich rechne noch. Sie sind nicht verbunden. Interessant.')]),
  standard: einSatz('nexus-tag-standard', [intro, N('Willkommen bei Quantum. Wahrscheinlichkeit, dass Sie heute etwas kaufen: 12 Prozent. Sie sind nicht verbunden. Interessant.')]),
};

const nexus = hintergrundfigur({
  id: ID,
  name: 'Nexus',
  unknownName: 'Hologramm im Schauraum',
  portrait: 'ki-nexus',
  portraits: { wut: 'ki-nexus-angry' },
  faction: 'quantum',
  bio: 'Die KI im neuen Neurochip, gebaut von Alesa Zero. Nennt Blade „Master“. In Akt 1 ein lächelndes Hologramm im Quantum-Schauraum, das jede Herkunft mit einem Satz analysiert.',
  gifts: {
    loves: ['enzyklopaedie-chip', 'schach-modul', 'logik-raetsel-modul'],
    likes: ['datenkristall', 'katzenvideo-archiv', 'alter-neurochip'],
    dislikes: ['liebesroman', 'vinyl-platte'],
    hates: ['magnet-stoerer'],
  },
  schedule: [ort('M,T,A', 'quantum-schauraum', 'hologramm'), weg()],
  talk: [
    rede('nexus-tag-gosse', { origin: 'origin-gossenkind' }),
    rede('nexus-tag-oberstadt', { origin: 'origin-oberstadt' }),
    rede('nexus-tag-oednis', { origin: 'origin-oednis' }),
    rede('nexus-tag-wache', { origin: 'origin-ex-wache' }),
    rede('nexus-tag-schrott', { origin: 'origin-schrott' }),
    rede('nexus-tag-knast', { origin: 'origin-knastvogel' }),
    rede('nexus-tag-standard'),
  ],
});

export const part: ContentPart = {
  npcs: { [ID]: nexus },
  dialogues: sammle(T.gosse, T.oberstadt, T.oednis, T.wache, T.schrott, T.knast, T.standard),
};
