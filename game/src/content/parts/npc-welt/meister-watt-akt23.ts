// Meister Watt in Akt 2, Akt 3 und im Nachspiel. Kein eigener Inhaltsteil: meister-watt.ts holt die Phasen von hier.
// Spricht … weiterhin … sehr … langsam.
import { type Menue, erz, knoten, sprecher } from './_welt';
import {
  type Akt23, AKT2_NUR, AKT3_NACHT, ENDE_3B, ENDE_MEER, ENDE_NEXUS, EPILOG_FREI, MASTER, NYRA_WEG, erweitere, phasen, thema,
} from './_lz-akt23';

const ID = 'meister-watt';
const W = sprecher(ID);
const Z = [{ text: 'Noch … eine … Frage.', next: 'menue' }, { text: 'Ich … geh … dann.' }];

export function akt23(M0: Menue): Akt23 {
  const M = erweitere(M0, [
    thema(ID, 'chips', 'Sehen Sie Gechippte auf dem Markt?', 'w23-chips'),
  ], [
    knoten('w23-chips', [
      W('… Ja. … Sie … stehen … still. … Wie … ich.'),
      W('… Aber … falsch. … Ich … stehe … still … weil … ich … warte. … Sie … stehen … still … weil … keiner … mehr … drin … wartet.'),
      erz('Ein Mann mit Chip hinterm Ohr geht vorbei, lächelt Watt an und sagt: „Ausgezeichnete Pose, Master.“ Watt bewegt keinen Muskel. Die Taube auf seinem Kopf zischt.'),
    ], { choices: Z }),
  ]);

  return phasen(ID, 'watt-23', M, [
    {
      id: 'master', when: MASTER, ohneMenue: true,
      gruss: [
        erz('Meister Watt schließt die Augen, als du näherkommst. Langsam. Sehr langsam. Dann dreht er dir den Rücken zu. Es dauert eine Minute. Es ist die wütendste Minute, die der Schrottmarkt je gesehen hat.'),
        W('… Der … Strom … ist … gekommen. … Der … falsche.'),
      ],
    },
    {
      id: 'ende-3b', when: ENDE_3B, einmal: true,
      gruss: [
        W('… Du … bist … gefallen. … Und … aufgestanden.'),
        W('… Das … sind … die … ersten … zwei … Posen. … Die … meisten … lernen … nur … eine.'),
      ],
    },
    {
      id: 'ende-nexus', when: ENDE_NEXUS, einmal: true,
      gruss: [
        W('… Die … neue … Stimme … im … Radio … ist … höflich.'),
        W('… Sie … hat … gefragt … ob … sie … von … mir … Geduld … lernen … darf. … Ich … habe … gesagt: … Ja. … Sie … wartet … jetzt … auf … die … erste … Lektion. … Seit … drei … Tagen.'),
      ],
    },
    {
      id: 'ende-meer', when: ENDE_MEER, einmal: true,
      gruss: [
        W('… Das … Meer. … Ich … war … dort. … Mit … Babette.'),
        W('… Ich … stand … auf … einem … Bein. … Eine … Welle … hat … mich … umgeworfen. … Gute … Lehrerin. … Ich … gehe … wieder … hin.'),
      ],
    },
    {
      id: 'epilog', when: EPILOG_FREI, taeglich: true,
      gruss: [erz('Meister Watt steht auf einem Bein. Auf dem Kopf: eine Taube. Auf der Taube: eine Muschel. Er hat sie vom Meer mitgebracht.'), W('… Hallo.')],
      plausch: [W('… Der … Markt … ist … laut … seit … alle … wieder … sie … selbst … sind. … Gut. … Lärm … ist … Leben. … Ich … stehe … gern … im … Leben.')],
    },
    {
      id: 'akt3', when: AKT3_NACHT,
      gruss: [
        erz('Mitten in der Nacht steht Meister Watt am Schrottmarkt. Allein. Über den Dächern glitzert die Oberstadt. Er schaut hinauf.'),
        W('… Heute … Nacht … hält … die … Stadt … den … Atem … an. … Ich … auch.'),
        W('… Geh. … Schnell. … Ausnahmsweise.'),
      ],
    },
    {
      id: 'nyra', when: NYRA_WEG, einmal: true,
      gruss: [
        W('… Eine … von … euch … fehlt. … Die … Kleine … mit … den … Bildschirmen. … Ich … sehe … es … an … deinem … Gang.'),
        W('… Wer … wartet … muss … wissen … worauf. … Du … weißt … es. … Gut.'),
      ],
    },
    {
      id: 'akt2', when: AKT2_NUR, taeglich: true,
      gruss: [
        erz('Über dem Schrottmarkt kreist eine Quantum-Drohne. Sie senkt sich auf Meister Watts Kopf, als wäre er ein Laternenpfahl. Die Taube beißt sie weg.'),
        W('… Hallo. … Die … Taube … mag … keine … Drohnen. … Ich … auch … nicht.'),
      ],
      plausch: [W('… Seit … dem … Einbruch … im … Campus … laufen … alle … schneller. … Nur … ich … nicht. … Einer … muss … die … Stadt … festhalten.')],
    },
  ]);
}
