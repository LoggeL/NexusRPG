// kopfgeld-der-kassierer · Stufe 2 (world.md §6.7): kassiert gefälschte Hafengebühren. Hafenkante, morgens.
// Wege: `[Straße 6]` Belege entlarven, die Hafenarbeiter vereinen (ohne Check, dauert), Kampf, laufen lassen.
import type { ContentPart } from '../../part';
import { zusatz } from './_auftrag';
import { type Kopfgeld, kgId, vorlageKopfgeld, zielDialog, zielHotspot } from './_kopfgeld';
import { N, P, time, zeit } from './_lib';

export const ziel: Kopfgeld = {
  key: 'der-kassierer', name: 'Der Kassierer', stufe: 2, map: 'hafenkante', spot: 'kassierer-bude', ortLabel: 'Hafenkante, morgens',
  wann: time('morgen'), encounter: 'enc-kopfgeld-der-kassierer',
  steckbrief: 'Kassiert Hafengebühren, die es nicht gibt, mit Stempeln, die er selbst geschnitzt hat. Hat zwei Rostzähne als Leibwächter.',
  auftritt: [N('Eine Bretterbude mit Schild: „AMTLICHE HAFENGEBÜHR“. Dahinter ein Mann mit Ärmelschonern und Kassenbuch. Vor der Bude: eine Schlange müder Hafenarbeiter. Neben der Bude: zwei Rostzähne.')],
  wege: [
    { text: 'Einen seiner Belege nehmen und laut vorlesen, was daran falsch ist. Alles.', check: ['strasse', 6, ['betrug', 'geruecht']], ergebnis: 'gestellt',
      zeilen: [N('„Amtliche Hafengebühr, Paragraf neun.“ Es gibt keinen Paragrafen neun. „Gestempelt vom Hafenamt.“ Das Hafenamt ist seit 2059 eine Muschelbude. Die Schlange wird still. Dann wütend. Die Rostzähne gehen. Der Kassierer bleibt. Er hat keine Wahl.')] },
    { text: 'Mit den Hafenarbeitern reden. Einzeln. Bis alle gleichzeitig nicht mehr zahlen.', effects: [zeit(90)], ergebnis: 'gestellt',
      zeilen: [N('Anderthalb Stunden. Dann stehen dreißig Hafenarbeiter vor der Bude und zahlen nichts. Die Rostzähne zählen nach, zählen noch mal und gehen frühstücken. Der Kassierer klappt das Buch zu.'), P('Gebühr für Gebühren: null.')] },
  ],
  kampfText: 'Die Bude umtreten. Leibwächter inklusive.',
  info: [N('„Die Hälfte geht an die Rostzähne, ein Viertel an einen Mann mit Quantum-Ausweis, der jeden Freitag kommt. Den Rest … hab ich verloren. Beim Hütchenspiel. Bei Wett-Willi.“')],
  abgabe: 'Der Kassierer verlangt an der Saalwache eine Abliefergebühr. Der Wachtmeister lacht so lange, bis der Richter klingelt. Beleg, Stempel, Klingel.',
};

export const part: ContentPart = {
  jobs: { [kgId(ziel)]: vorlageKopfgeld(ziel) },
  dialogues: { [`pj-kg-${ziel.key}`]: zielDialog(ziel) },
  mapAdditions: zusatz([zielHotspot(ziel)]),
};
