// Sybella Chrome (Rot) – die Rechnerin der Chrome-Schwestern, erfand „Chrome 10“ (world.md §4.3). In Akt 1
// Hintergrundfigur (§11.2): Di/Sa abends verkleidet auf dem Schrottmarkt beim Feilschen, nachts im roten Schlafzimmer
// des Penthouse, solange side-alte-gewohnheiten läuft. Kein Herzsystem in Akt 1.
import type { ContentPart } from '../../part';
import type { Condition } from '../../../modules/contracts';
import { einSatz, erz, hintergrundfigur, ort, rede, sammle, sprecher, weg } from './_welt';

const ID = 'sybella-chrome';
const S = sprecher(ID);
const EINBRUCH: Condition = { quest: 'side-alte-gewohnheiten', state: 'active' };

const T = {
  gosse: einSatz('sybella-tag-gosse', [
    S('Du feilschst? Richtig? Mit Zahlen und Zähnen? … Respekt. Zwölf Prozent Respekt. Mehr gibt es nicht ohne Gutschein.'),
  ]),
  oberstadt: einSatz('sybella-tag-oberstadt', [
    S('Du hast doch sicher einen Gutschein? Leute wie wir haben immer einen Gutschein.'),
  ]),
  nacht: einSatz('sybella-tag-nacht', [
    erz('Im roten Schlafzimmer brennt Licht. Eine Frau sitzt im Bett und rechnet auf einem Abakus aus Rubinen. Laut. „Achtzehn Komma vier Prozent. Unverschämt.“'),
  ]),
  standard: einSatz('sybella-tag-standard', [
    erz('Eine Frau mit Kopftuch, Sonnenbrille und einem Mantel, der eindeutig mehr kostet als der ganze Stand vor ihr, hält ein rostiges Sieb hoch.'),
    S('Drei Credits? Für DAS? Das ist ja Markenpiraterie! Zwei. Und ich nehme die Tüte gratis.'),
  ]),
};

const sybella = hintergrundfigur({
  id: ID,
  name: 'Sybella Chrome',
  unknownName: 'Verkleidete Frau mit Sonnenbrille',
  portrait: 'sybella',
  sprite: 'sybella-walk',
  faction: 'chrome-haus',
  bio: 'Die Rechnerin der Chrome-Schwestern, Rabatt-Fanatikerin, Erfinderin von „Chrome 10“. Farbe Rot. Geht dienstags und samstags verkleidet auf den Schrottmarkt feilschen.',
  gifts: {
    loves: ['seidentuch-rot', 'chrome-10-gutschein', 'kassenbuch'],
    likes: ['alte-euromuenze', 'glitzerschrott', 'bao-dampfnudel', 'edelbrause'],
    dislikes: ['seidentuch-blau', 'planungsbrett-glas'],
    hates: ['raubkopie-stick'],
  },
  schedule: [
    ort('N', 'chrome-penthouse', 'schlafzimmer-rot', { when: EINBRUCH }),
    ort('A', 'schrottmarkt', 'sybella-verkleidet', { days: ['di', 'sa'] }),
    weg(),
  ],
  talk: [
    rede('sybella-tag-nacht', { time: 'nacht' }),
    rede('sybella-tag-gosse', { origin: 'origin-gossenkind' }),
    rede('sybella-tag-oberstadt', { origin: 'origin-oberstadt' }),
    rede('sybella-tag-standard'),
  ],
});

export const part: ContentPart = {
  npcs: { [ID]: sybella },
  dialogues: sammle(T.gosse, T.oberstadt, T.nacht, T.standard),
};
