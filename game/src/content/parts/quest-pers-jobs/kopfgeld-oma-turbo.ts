// kopfgeld-oma-turbo · Stufe 2 (world.md §6.7): Rentnerin mit Beinimplantaten. Bahnhof Mitte, tagsüber.
// Kampf unmöglich (sie ist zu schnell). Wege: `[Reflexe 7]` einholen, `[Ausstrahlung 6]` Tee anbieten (Selbstanzeige),
// am Ende ihrer Runde warten (ohne Check, dauert), laufen lassen.
import type { ContentPart } from '../../part';
import { zusatz } from './_auftrag';
import { type Kopfgeld, kgId, vorlageKopfgeld, zielDialog, zielHotspot } from './_kopfgeld';
import { N, time, zeit } from './_lib';

export const ziel: Kopfgeld = {
  key: 'oma-turbo', name: 'Oma Turbo', stufe: 2, map: 'bahnhof-mitte', spot: 'oma-turbo-strecke', ortLabel: 'Bahnhof Mitte, tagsüber',
  wann: time('tag'),
  steckbrief: 'Rentnerin mit illegalen Militär-Beinimplantaten. Klaut Handtaschen im Vorbeirennen. Ist dabei schneller als die U-Bahn. Hat dreimal die U-Bahn überholt.',
  auftritt: [N('Ein Windstoß. Ein Kopftuch. Eine Handtasche weniger am Arm einer Pendlerin. Oma Turbo bremst am Ende des Bahnsteigs, sieht dich und winkt. Dann ist sie wieder weg. Funken an den Absätzen.')],
  wege: [
    { text: 'Hinterher. Volles Tempo, über die Gleise, unter dem Drehkreuz durch.', check: ['reflexe', 7, ['rennen']], ergebnis: 'gestellt',
      zeilen: [N('Du holst sie ein. Irgendwie. Sie sieht dich neben sich laufen und ist ehrlich beeindruckt. „Junges Gemüse! Na gut. Du hast gewonnen. Aber nur, weil ich heute Hüfte hab.“')] },
    { text: 'Eine Thermoskanne hochhalten: „Tee, Oma? Mit Kluntjes?“', check: ['ausstrahlung', 6, ['charme']], ergebnis: 'selbst',
      zeilen: [N('Oma Turbo bremst so hart, dass die Fliesen rauchen. „Kluntjes? Echte?“ Sie trinkt drei Tassen, erzählt von ihrem Mann, der Rennfahrer war, und geht dann selbst zum Richter. „Der hat bestimmt auch Kekse.“ Er hat.')] },
    { text: 'Am Ende ihrer Runde auf der Pendlerbank warten. Irgendwann muss auch sie sitzen.', effects: [zeit(120)], ergebnis: 'gestellt',
      zeilen: [N('Zwei Stunden. Dann setzt sich Oma Turbo neben dich, schnauft einmal und packt ein Butterbrot aus. „Pause ist Pause, Kindchen. Danach darfst du mich verhaften.“ Danach darfst du.')] },
  ],
  info: [N('„Die Beine? Von Ripper. Hat er aus einem Militärdepot. Da liegen noch mehr. Bei Container 77 an der Hafenkante, dienstags nachts. Sag ihm, Oma schickt dich.“ Sie zwinkert. Und ist weg.')],
  abgabe: 'Oma Turbo tätschelt dem Wachtmeister die Wange und überreicht ihm die Handtaschen, alle elf, sortiert nach Farbe. Beleg, Stempel, Klingel.',
};

export const part: ContentPart = {
  jobs: { [kgId(ziel)]: vorlageKopfgeld(ziel) },
  dialogues: { [`pj-kg-${ziel.key}`]: zielDialog(ziel) },
  mapAdditions: zusatz([zielHotspot(ziel)]),
};
