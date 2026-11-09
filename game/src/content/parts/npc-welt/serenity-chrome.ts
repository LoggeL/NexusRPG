// Serenity Chrome (Grün) – jüngste der Chrome-Schwestern, Romantikerin (world.md §4.3). In Akt 1 Hintergrundfigur (§11.2):
// morgens im Glaspark (gießt Pflanzen), abends am Ecktisch im Café Sahnehaube, nachts im grünen Schlafzimmer des
// Penthouse, solange side-alte-gewohnheiten läuft. Kein Herzsystem in Akt 1.
import type { ContentPart } from '../../part';
import type { Condition } from '../../../modules/contracts';
import { einSatz, erz, hintergrundfigur, ort, rede, sammle, sprecher, weg } from './_welt';

const ID = 'serenity-chrome';
const S = sprecher(ID);
const EINBRUCH: Condition = { quest: 'side-alte-gewohnheiten', state: 'active' };

const T = {
  oednis: einSatz('serenity-tag-oednis', [
    S('Aus der Ödnis? Wirklich? Wächst da draußen etwas? Kakteen? Blühen die? Welche Farbe? Oh, sagen Sie es mir nicht. Doch. Nein. Später.'),
  ]),
  morgen: einSatz('serenity-tag-morgen', [
    erz('Im Glaspark kniet eine Frau in Grün im Beet, die Seidenhandschuhe voller Erde. Sie flüstert mit einer Orchidee.'),
    S('Psst. Sie schläft noch. Pflanzen brauchen Ruhe. Und Liebe. Und jemanden, der ihnen sagt, dass sie schön sind.'),
  ]),
  nacht: einSatz('serenity-tag-nacht', [
    erz('Im grünen Schlafzimmer brennt eine Leselampe. Eine Frau liegt zwischen Kissen und liest „Herz aus Chrom“. Sie seufzt. Sehr laut.'),
  ]),
  standard: einSatz('serenity-tag-standard', [
    erz('Am Ecktisch des Cafés sitzt eine blonde Frau in Grün, vor sich einen Tee, den sie nicht trinkt. Sie schaut hinaus in den Glaspark.'),
    S('Hach. Haben Sie ihn gesehen? Den Mann im Teddyfell? Ein Schnuckelchen. Aber sagen Sie es nicht meinen Schwestern.'),
  ]),
};

const serenity = hintergrundfigur({
  id: ID,
  name: 'Serenity Chrome',
  unknownName: 'Blonde Frau in Grün',
  portrait: 'serenity',
  sprite: 'serenity-walk',
  faction: 'chrome-haus',
  bio: 'Jüngste der drei Chrome-Schwestern, Farbe Grün. Romantikerin, liest Liebesromane, gießt morgens im Glaspark Pflanzen und will eigentlich nur gärtnern. Findet Blade „ein Schnuckelchen“.',
  gifts: {
    loves: ['liebesroman', 'seidentuch-gruen', 'blumensamen', 'orchidee'],
    likes: ['samenbombe', 'autogrammkarte-collin', 'parfuem-ozon', 'edelbrause'],
    dislikes: ['seidentuch-rot', 'kassenbuch'],
    hates: ['plastikpflanze'],
  },
  schedule: [
    ort('N', 'chrome-penthouse', 'schlafzimmer-gruen', { when: EINBRUCH }),
    ort('M', 'glasarkaden', 'glaspark'),
    ort('A', 'cafe-sahnehaube', 'ecktisch-cafe'),
    weg(),
  ],
  talk: [
    rede('serenity-tag-nacht', { time: 'nacht' }),
    rede('serenity-tag-oednis', { origin: 'origin-oednis' }),
    rede('serenity-tag-morgen', { time: 'morgen' }),
    rede('serenity-tag-standard'),
  ],
});

export const part: ContentPart = {
  npcs: { [ID]: serenity },
  dialogues: sammle(T.oednis, T.morgen, T.nacht, T.standard),
};
