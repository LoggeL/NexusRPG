// Xion Venom – Sicherheitschef von Quantum mit der Venomkralle (world.md §4.3). In Akt 1 Hintergrundfigur (§11.2):
// abends am Werbestand in der Neon-Gasse („Freiwillige gesucht – Snacks inklusive!“), dienstags nachts an Container 77
// (side-container-77 bringt dort eigene Szenen mit). Kein Herzsystem in Akt 1.
import type { ContentPart } from '../../part';
import { einSatz, erz, hintergrundfigur, ort, rede, sammle, sprecher, weg } from './_welt';

const ID = 'xion-venom';
const X = sprecher(ID);

const T = {
  exwache: einSatz('xion-tag-exwache', [
    X('Du. Du bist die, die gekündigt hat. Ich vergess keine Dienstnummer. Ich bin nicht dumm. Ich weiß, wer du bist.'),
  ]),
  gosse: einSatz('xion-tag-gosse', [
    X('„Freiwillige gesucht – Snacks inklusive!“ Was glotzt du so? Den Spruch hab ich selbst geschrieben.'),
    erz('Du kennst den Spruch. Er steht seit Wochen an jeder Ecke. Er wird nicht besser.'),
  ]),
  container: einSatz('xion-tag-container', [
    erz('Zwischen den Containern glimmt eine Zigarette. Eine Hand mit langen Metallkrallen schnippt die Asche weg.'),
    X('Verpiss dich vom Hafen. Hier ist nichts. Und wenn hier was wär, wärst du nicht hier gewesen.'),
  ]),
  standard: einSatz('xion-tag-standard', [
    erz('Ein Hüne in Quantum-Uniform lehnt an einem Werbestand voller Flyer und Snacktüten. Seine rechte Hand ist eine Kralle.'),
    X('Freiwillige gesucht! Snacks inklusive! … Du nicht. Du siehst aus, als würdest du die Snacks klauen.'),
  ]),
};

const xion = hintergrundfigur({
  id: ID,
  name: 'Xion Venom',
  unknownName: 'Hüne mit Metallkralle',
  portrait: 'xion',
  sprite: 'xion-walk',
  faction: 'quantum',
  bio: 'Sicherheitschef von Quantum mit der „Venomkralle“. Hasst es, unterschätzt zu werden. Abends am Werbestand in der Neon-Gasse, dienstags nachts am Hafen.',
  gifts: {
    loves: ['klauen-schleifstein', 'gruene-augenlinse', 'seltenes-implantat'],
    likes: ['volt-limo', 'synth-nudeln', 'algen-chips', 'drohnen-propeller'],
    dislikes: ['liebesroman', 'plueschmoehre'],
    hates: ['rechenfibel', 'logik-raetsel-modul'],
  },
  schedule: [
    ort('N', 'hafenkante', 'container-77', { days: ['di'] }),
    ort('A', 'neon-gasse', 'werbestand'),
    weg(),
  ],
  talk: [
    rede('xion-tag-exwache', { origin: 'origin-ex-wache' }),
    rede('xion-tag-container', { time: 'nacht' }),
    rede('xion-tag-gosse', { origin: 'origin-gossenkind' }),
    rede('xion-tag-standard'),
  ],
});

export const part: ContentPart = {
  npcs: { [ID]: xion },
  dialogues: sammle(T.exwache, T.gosse, T.container, T.standard),
};
