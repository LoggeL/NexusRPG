// kopfgeld-krawall-kalle · Stufe 1 (world.md §6.7): prügelt sich mit Türstehern. Neon-Gasse, nachts.
// Wege: `[Körper 6]` Armdrücken, `[Ausstrahlung 5]` Hausverbot verhandeln (Selbstanzeige), Kampf, laufen lassen.
import type { ContentPart } from '../../part';
import { zusatz } from './_auftrag';
import { type Kopfgeld, kgId, vorlageKopfgeld, zielDialog, zielHotspot } from './_kopfgeld';
import { N, time } from './_lib';

export const ziel: Kopfgeld = {
  key: 'krawall-kalle', name: 'Krawall-Kalle', stufe: 1, map: 'neon-gasse', spot: 'kalle-ecke', ortLabel: 'Neon-Gasse, nachts',
  wann: time('nacht'), encounter: 'enc-kopfgeld-krawall-kalle',
  steckbrief: 'Hat in einer Woche elf Türsteher verprügelt, zwei davon doppelt. Will in jeden Club, kommt in keinen. Ist darüber sehr wütend.',
  auftritt: [N('Krawall-Kalle, Nacken wie ein Kühlschrank, Fäuste wie zwei kleinere Kühlschränke. Er steht vor dem Hintereingang eines Clubs und brüllt eine geschlossene Tür an.'), N('„LASST MICH REIN! ICH WILL NUR TANZEN!“')],
  wege: [
    { text: '„Armdrücken. Gewinnst du, lass ich dich laufen. Gewinn ich, kommst du mit.“', check: ['koerper', 6, ['kraft']], ergebnis: 'gestellt',
      zeilen: [N('Ihr drückt auf einer Mülltonne. Sie verbiegt sich. Kalles Arm verbiegt sich weiter. Er starrt auf seine Hand, dann auf dich.'), N('„Du bist der Erste, der mich besiegt. Ich komm mit. Aber du musst mir später zeigen, wie das geht.“')] },
    { text: '„Wenn du dich stellst, red ich mit Hunter. Hausverbot auf drei Monate statt für immer. Danach darfst du tanzen.“', check: ['ausstrahlung', 5, ['verhandeln']], ergebnis: 'selbst',
      zeilen: [N('Kalle blinzelt. Seine Unterlippe zittert. „Drei Monate? Und dann … darf ich wirklich tanzen?“ Er geht zum Richter und erzählt allen auf dem Weg, dass er bald tanzen darf.')] },
  ],
  kampfText: '„Kalle. Hier drüben. Ich bin heute deine Tür.“',
  info: [N('„Die Rostzähne zahlen mir zwanzig pro Türsteher. Sagen, ich soll den Laden vom Kassierer in Ruhe lassen, den in der Hafenkante. Ich hab keine Ahnung, was das heißt. Ich wollte nur tanzen.“')],
  abgabe: 'Kalle schüttelt dem Wachtmeister die Hand. Der Wachtmeister schüttelt danach seine Hand sehr lange aus. Beleg, Stempel, Klingel.',
};

export const part: ContentPart = {
  jobs: { [kgId(ziel)]: vorlageKopfgeld(ziel) },
  dialogues: { [`pj-kg-${ziel.key}`]: zielDialog(ziel) },
  mapAdditions: zusatz([zielHotspot(ziel)]),
};
