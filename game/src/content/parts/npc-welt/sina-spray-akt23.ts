// Sina Spray in Akt 2, Akt 3 und im Nachspiel. Kein eigener Inhaltsteil: sina-spray.ts holt Phasen und
// Tagesablauf-Vorsatz von hier. Im Nachspiel malt sie auch abends: Die Mauer bekommt ihr Meer.
import type { ScheduleEntry } from '../../../modules/contracts';
import { type Menue, erz, knoten, ort, sprecher } from './_welt';
import {
  type Akt23, AKT2_NUR, AKT3_NACHT, ENDE_3B, ENDE_MEER, ENDE_NEXUS, EPILOG_FREI, MASTER, erweitere, phasen, thema,
} from './_lz-akt23';

const ID = 'sina-spray';
const S = sprecher(ID);
const Z = [{ text: 'Noch was, Sina.', next: 'menue' }, { text: 'Bleib bunt.' }];

export function akt23(M0: Menue): Akt23 & { schedule: ScheduleEntry[] } {
  const M = erweitere(M0, [
    thema(ID, 'werbung', 'Was ist mit der Mauer passiert?', 's23-werbung'),
  ], [
    knoten('s23-werbung', [
      erz('Über den Wal hat Quantum ein Plakat geklebt, zehn Meter breit: ein lächelndes Gesicht, ein Chip hinterm Ohr, „CHROME 10 – Endlich zufrieden“. Am Rand hängen schon wieder Fetzen.'),
      S('Kleben die über Nacht hin. Mit Drohnen. Ich reiß es tagsüber runter. Mit Zähnen, wenn’s sein muss.', 'wut'),
      S('Das Beste: Unter dem Plakat ist der Wal noch da. Kleister hält keine Farbe auf. Die kriegen das Meer nicht weg. Die können’s nur zukleben.'),
    ], { choices: Z }),
  ]);

  const p = phasen(ID, 'sina-23', M, [
    {
      id: 'master', when: MASTER, ohneMenue: true,
      gruss: [
        erz('An der Wand der Freiheit ist ein neues Bild. Du. Mit Krone. Mit Eselsohren. Mit einem Chip im Hintern. Darunter in Neonpink: „SO SIEHT VERRAT AUS.“'),
        S('Gefällt’s dir? Hab drei Nächte gebraucht. Für dich nehm ich mir Zeit.', 'wut'),
        S('Und jetzt verpiss dich, bevor ich dich grau sprühe. Grau steht dir. Ist ja jetzt deine Farbe.'),
      ],
    },
    {
      id: 'ende-3b', when: ENDE_3B, einmal: true,
      gruss: [
        S('Ich hab dein Bild übermalt. Das mit der Krone. Weißt du, womit?', 'signatur'),
        S('Mit nichts. Einfach grau. Keine Kunst. Weil ich will, dass du dich jedes Mal dran erinnerst, wenn du vorbeigehst. Und dann hab ich daneben was Neues gemalt. Dich, am Strand. Zu spät, aber da.', 'freude'),
      ],
    },
    {
      id: 'ende-nexus', when: ENDE_NEXUS, einmal: true,
      gruss: [
        S('Die neue KI hat gefragt, ob sie mitmalen darf. Mit den Scheinwerfern an der Flutmauer. Ich hab gesagt, Licht ist keine Farbe.', 'ueberrascht'),
        S('Dann hat sie den Wal angeleuchtet. Nachts. In Blau. Okay. Licht ist eine Farbe. Sag’s ihr nicht, sie wird eingebildet.'),
      ],
    },
    {
      id: 'ende-meer', when: ENDE_MEER, einmal: true,
      gruss: [
        S('Ich war da. Am Meer. Ich hab mich hingesetzt und Farbe gemischt, bis sie stimmte. Vier Stunden. Es gibt kein Blau, das da rankommt. Ich hab’s trotzdem versucht.', 'freude'),
        S('Jetzt mal ich die ganze Mauer neu. Von innen. Damit jeder, der hier steht, weiß, was dahinter ist. Nicht irgendwann. Jetzt.'),
      ],
    },
    {
      id: 'epilog', when: EPILOG_FREI, taeglich: true,
      gruss: [S('Hey! Halt mal die Leiter. Ich mach Wellen. Echte. Also gemalte echte. Also … halt einfach die Leiter.', 'freude')],
      plausch: [S('Kurt kommt jetzt jeden Abend. Er malt Tauben. Nur Tauben. Hunderte. Ich hab gesagt, das ist zu viel. Er hat gesagt: „Wie das Meer.“ Der Mann ist ein Genie.')],
    },
    {
      id: 'akt3', when: AKT3_NACHT,
      gruss: [
        erz('Sina hängt in einem Klettergurt an der Flutmauer, eine Dose in jeder Hand, die Stirnlampe auf maximal. Sie malt ein Gesicht, so groß wie ein Haus. Es lacht.'),
        S('Wenn die Stadt morgen aufwacht, soll sie wissen, wer heute Nacht oben war. Und wie es ausgegangen ist.', 'signatur'),
        S('Sieh zu, dass ich das Gesicht nicht umsonst lachend gemalt hab. Sonst übermal ich’s mit Heulen. Und das sieht scheiße aus.'),
      ],
    },
    {
      id: 'akt2', when: AKT2_NUR, taeglich: true,
      gruss: [S('Hey! Duck dich! Nee, Spaß. Die Drohne da oben filmt nur. Aber ich hab ihr letzte Nacht die Linse pink gesprüht. Seitdem filmt sie alles in Rosa.', 'freude')],
      plausch: [S('Die Gechippten kommen manchmal an die Mauer. Stehen da. Gucken. Einer hat geweint, glaub ich. Hat „Ausgezeichnete Entscheidung“ gesagt und dabei geweint. Ich hab ihm eine Dose geschenkt.', 'trauer')],
    },
  ]);

  const schedule: ScheduleEntry[] = [ort('A', 'flutmauer', 'wand-der-freiheit', { when: EPILOG_FREI })];
  return { ...p, schedule };
}
