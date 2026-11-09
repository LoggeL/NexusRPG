// Seraphina Chrome (Blau) – älteste der Chrome-Schwestern (world.md §4.3). In Akt 1 Hintergrundfigur (§11.2): abends im
// Glaspark der Glasarkaden, wo sie Reden vor Tauben hält; nachts im Penthouse-Schlafzimmer, solange side-alte-gewohnheiten
// läuft (Einbruch). Kein Herzsystem in Akt 1.
import type { ContentPart } from '../../part';
import type { Condition } from '../../../modules/contracts';
import { einSatz, erz, hintergrundfigur, ort, rede, sammle, sprecher, weg } from './_welt';

const ID = 'seraphina-chrome';
const S = sprecher(ID);
const EINBRUCH: Condition = { quest: 'side-alte-gewohnheiten', state: 'active' };

const T = {
  oberstadt: einSatz('seraphina-tag-oberstadt', [
    S('Ah, endlich jemand mit Haltung. Man erkennt die gute Schule am Rücken. Wir verschenken nichts. Aber wir erinnern uns an Namen.'),
  ]),
  gosse: einSatz('seraphina-tag-gosse', [
    S('Wie … authentisch.'),
    erz('Sie wendet sich wieder den Tauben zu, als hättest du nie existiert.'),
  ]),
  nacht: einSatz('seraphina-tag-nacht', [
    erz('Hinter einer Glastür im blauen Schlafzimmer: eine Silhouette im Seidenmantel, ein Tablet in der Hand, Kurse im Gesicht. Sie schläft nicht. Sie plant.'),
  ]),
  standard: einSatz('seraphina-tag-standard', [
    erz('Eine Frau in Blau steht auf einer Parkbank im Glaspark. Vor ihr: zweihundert Tauben. Sie hält eine Rede.'),
    S('… und darum, meine Damen und Herren, wird Quantum in fünf Jahren die Welt nicht verändern. Quantum wird die Welt SEIN. … Sie stören. Wir verschenken nichts. Auch keine Aufmerksamkeit.'),
  ]),
};

const seraphina = hintergrundfigur({
  id: ID,
  name: 'Seraphina Chrome',
  unknownName: 'Frau in Blau',
  portrait: 'seraphina',
  sprite: 'seraphina-walk',
  faction: 'chrome-haus',
  bio: 'Älteste der drei Chrome-Schwestern, Investorin und Strategin von Quantum. Farbe Blau. Hält abends im Glaspark Reden vor Tauben. „Wir verschenken nichts.“',
  gifts: {
    loves: ['seidentuch-blau', 'planungsbrett-glas', 'perlenkette'],
    likes: ['zeitung-papier', 'parfuem-ozon', 'edelbrause', 'taschenspiegel-gold'],
    dislikes: ['seidentuch-rot', 'seidentuch-gruen', 'chrome-10-gutschein'],
    hates: ['synth-nudeln'],
  },
  schedule: [
    ort('N', 'chrome-penthouse', 'schlafzimmer-blau', { when: EINBRUCH }),
    ort('A', 'glasarkaden', 'glaspark-tauben'),
    weg(),
  ],
  talk: [
    rede('seraphina-tag-nacht', { time: 'nacht' }),
    rede('seraphina-tag-oberstadt', { origin: 'origin-oberstadt' }),
    rede('seraphina-tag-gosse', { origin: 'origin-gossenkind' }),
    rede('seraphina-tag-standard'),
  ],
});

export const part: ContentPart = {
  npcs: { [ID]: seraphina },
  dialogues: sammle(T.oberstadt, T.gosse, T.nacht, T.standard),
};
