// Opa Gurrmann in Akt 2, Akt 3 und im Nachspiel. Kein eigener Inhaltsteil: opa-gurrmann.ts holt die Phasen von hier.
import { type Menue, erz, knoten, sprecher } from './_welt';
import {
  type Akt23, AKT2_NUR, AKT3_NACHT, ENDE_3B, ENDE_MEER, ENDE_NEXUS, EPILOG_FREI, MASTER, NYRA_WEG, erweitere, phasen, thema,
} from './_lz-akt23';

const ID = 'opa-gurrmann';
const G = sprecher(ID);
const Z = [{ text: 'Noch was, Opa.', next: 'menue' }, { text: 'Gurr gurr.' }];

export function akt23(M0: Menue): Akt23 {
  const M = erweitere(M0, [
    thema(ID, 'drohnen', 'Kommen deine Tauben noch an den Quantum-Drohnen vorbei?', 'g23-drohnen'),
  ], [
    knoten('g23-drohnen', [
      G('Die Drohnen fangen meine Tauben ab. Lesen die Briefe. Kleben ein Etikett drauf: „Geprüft. Ausgezeichnete Korrespondenz.“ Und lassen sie weiterfliegen.', 'wut'),
      G('Aber Tauben sind schlau. Halb schlau. Die Hälfte mit den Federn. Erna fliegt jetzt unter den Brücken durch. Und Horst hat einer Drohne ins Objektiv geschissen. Absichtlich. Ich bin so stolz.', 'freude'),
      G('Wenn du was zu verschicken hast, das keiner lesen soll: Sag Bescheid. Ich schick Horst. Horst ist zu dumm, um abgefangen zu werden.'),
    ], { choices: Z }),
  ]);

  return phasen(ID, 'gurrmann-23', M, [
    {
      id: 'master', when: MASTER, ohneMenue: true,
      gruss: [
        erz('Als du dich dem Taubenschlag näherst, fliegen alle Tauben gleichzeitig auf. Alle. Auch die mit Rotor. Sie setzen sich auf das Dach gegenüber und starren dich an.'),
        G('Die Tauben mögen dich nicht mehr. Keine einzige. Auch Horst nicht, und Horst mag Mülltonnen.', 'wut'),
        G('Und ich mag, was die Tauben mögen. Gurr. Verpiss dich.'),
      ],
    },
    {
      id: 'ende-3b', when: ENDE_3B, einmal: true,
      gruss: [
        erz('Eine Taube landet auf deiner Schulter. Klein, mit einem Rotor so groß wie ein Fingerhut. Sie pickt dir ins Ohr. Zärtlich. Für eine Taube.'),
        G('Siehste. Sie hat dich wiedererkannt. Tauben vergessen nie, wer sie zuerst angeschaut hat. Auch wenn der zwischendurch ein Arschloch war.', 'freude'),
      ],
    },
    {
      id: 'ende-nexus', when: ENDE_NEXUS, einmal: true,
      gruss: [
        G('Die neue KI will Taubenpost lernen. Sie sagt, Briefe, die man nicht abfangen kann, sind „ein faszinierendes Konzept“. Ich hab ihr erklärt, dass man sie eben nicht abfängt. Dann war sie still.', 'ueberrascht'),
        G('Ich glaub, sie übt. Gestern kam ein Brief bei mir an. Ohne Taube. Ohne Drohne. Einfach im Schlag. Da stand nur: „Gurr?“'),
      ],
    },
    {
      id: 'ende-meer', when: ENDE_MEER, einmal: true,
      gruss: [
        G('Erna ist ans Meer geflogen. Hinter euch her. Ist drei Tage weggeblieben. Jetzt ist sie zurück und hat sich in eine Möwe verliebt.', 'freude'),
        G('Die Möwe kommt sie jeden Abend besuchen. Sie klaut mir das Brot. Das ist bei Möwen Brautwerbung. Ich hab zugestimmt.'),
      ],
    },
    {
      id: 'epilog', when: EPILOG_FREI, taeglich: true,
      gruss: [G('Gurr. Oh, Verzeihung. Guten Tag. Die Tauben sagen, heute wird’s schön. Die Drohnen sagen nichts mehr. Die sind weg. Ich sag: endlich.')],
      plausch: [G('Ich hab so viele Briefe wie noch nie. Die Leute schreiben sich wieder. Liebesbriefe, Entschuldigungen, Rechnungen. Vor allem Entschuldigungen. Die Tauben sind ganz erschöpft.')],
    },
    {
      id: 'akt3', when: AKT3_NACHT,
      gruss: [
        erz('Nacht über den Lötgassen. Opa Gurrmann sitzt auf dem Dach seines Taubenschlags, alle Tauben um ihn herum. Keine schläft. Sie schauen zur Oberstadt.'),
        G('Die spüren das. Wenn was Großes passiert, sind Tauben die Ersten, die’s wissen. Und die Letzten, die abhauen.', 'besorgt'),
        G('Erna und Horst sind startklar. Wenn ihr da oben jemandem was sagen müsst: Ein Pfiff reicht.'),
      ],
    },
    {
      id: 'nyra', when: NYRA_WEG, einmal: true,
      gruss: [
        G('Die Kleine mit den Bildschirmen. Die bei euch fehlt. Ich hab Horst zum Turm geschickt. Er ist bis zum zwanzigsten Stock gekommen und hat an jedes Fenster geklopft.', 'trauer'),
        G('Keiner hat aufgemacht. Aber hinter einem Fenster hat’s geblinkt. Dreimal kurz. Horst ist dumm. Aber er hat’s gesehen.'),
      ],
    },
    {
      id: 'akt2', when: AKT2_NUR, taeglich: true,
      gruss: [G('Gurr. Psst. Nicht so laut. Die Drohnen hören mit. Die Tauben auch, aber die verraten nichts. Die können nur gurren.', 'besorgt')],
      plausch: [G('Seit dem Einbruch im Campus schickt Quantum doppelt so viele Drohnen. Meine Tauben haben jetzt einen Wachdienst. Abwechselnd. Horst schläft dabei ein.')],
    },
  ]);
}
