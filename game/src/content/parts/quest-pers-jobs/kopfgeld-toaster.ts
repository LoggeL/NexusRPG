// kopfgeld-toaster · Stufe 2 (world.md §6.7): Ex-Konzernroboter, hält sich für einen Menschen. Schrottmarkt, nachts.
// Wege: `[Technik 6]` Identität klären (Selbstanzeige), Dexter bietet Arbeit (nach main-1-dexter, ohne Attribut-Check),
// Kampf, laufen lassen.
import type { ContentPart } from '../../part';
import { zusatz } from './_auftrag';
import { type Kopfgeld, kgId, vorlageKopfgeld, zielDialog, zielHotspot } from './_kopfgeld';
import { N, done, time } from './_lib';

export const ziel: Kopfgeld = {
  key: 'toaster', name: '„Toaster“', stufe: 2, map: 'schrottmarkt', spot: 'toaster-ecke', ortLabel: 'Schrottmarkt, nachts',
  wann: time('nacht'), encounter: 'enc-kopfgeld-toaster',
  steckbrief: 'Ehemaliger Digitech-Serviceroboter, Seriennummer abgekratzt. Bricht nachts in Garküchen ein und toastet alles. Digitech will ihn zurück. Er will nicht.',
  auftritt: [N('In der Ecke hinter dem Schrottberg brennt ein Feuer. Davor sitzt ein Roboter mit Hut und toastet ein Stück Brot an seiner eigenen Brust. „Guten Abend. Ich bin Herbert. Ich bin ein Mensch. Ich habe einen Ausweis.“ Der Ausweis ist ein Toastbrot.')],
  wege: [
    { text: 'Seine Speicherbank auslesen und ihm vorlesen, wer er wirklich ist.', check: ['technik', 6, ['elektronik', 'ki']], ergebnis: 'selbst',
      zeilen: [N('„Modell T-0457, Frühstücksassistenz, Digitech-Kantine Etage 34.“ Toaster ist sehr lange still. Dann: „Ich war … ein Toaster. Aber ich will mehr sein.“ Er geht zum Richter und beantragt einen Namen. Der Richter gibt ihm einen. Herbert.')] },
    { text: '„Dexter sucht jemanden, der nachts auf seinen Laden aufpasst. Mit Ausweis. Ganz legal.“', tag: '[Dexter]', when: done('main-1-dexter'), ergebnis: 'selbst',
      zeilen: [N('Toaster stellt sich, lässt sich beim Richter registrieren und steht ab morgen nachts vor Dexters Büro. Er toastet jedem Kunden ein Brot. Dexter verdoppelt seinen Umsatz. Dexter ist entsetzt.')] },
  ],
  kampfText: '„Tut mir leid, Herbert.“',
  info: [N('„Bei Digitech gibt es einen Raum, Etage minus zwei. Da reden die Maschinen nachts miteinander. Sie reden über euch. Sie haben Angst vor etwas, das „Nexus“ heißt.“ Er toastet weiter. „Ich hab keine Angst. Ich bin ein Mensch.“')],
  abgabe: 'Toaster lässt sich an der Saalwache registrieren und bietet dem Wachtmeister einen Toast an. Der Wachtmeister nimmt ihn. Beleg, Stempel, Klingel.',
};

export const part: ContentPart = {
  jobs: { [kgId(ziel)]: vorlageKopfgeld(ziel) },
  dialogues: { [`pj-kg-${ziel.key}`]: zielDialog(ziel) },
  mapAdditions: zusatz([zielHotspot(ziel)]),
};
