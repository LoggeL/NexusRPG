// kopfgeld-graf-gully-zwei · Stufe 2 (world.md §6.7): falscher Bürgermeister im Kanal-Sammler.
// Wege: `[Straße 6]` der echte Gully entlarvt ihn, Kampf mit Ratten (auch die Kartenbegegnung 'graf-gully'), laufen lassen.
import type { ContentPart } from '../../part';
import { zusatz } from './_auftrag';
import { type Kopfgeld, kgId, vorlageKopfgeld, zielDialog, zielHotspot } from './_kopfgeld';
import { L, N } from './_lib';

export const ziel: Kopfgeld = {
  key: 'graf-gully-zwei', name: 'Graf Gully II.', stufe: 2, map: 'kanal-sammler', spot: 'graf-gully-thron', ortLabel: 'Kanal-Sammler, Thronsaal',
  wann: { all: [] }, encounter: 'enc-kopfgeld-graf-gully-zwei',
  steckbrief: 'Hält sich für den wahren Bürgermeister des Kanals. Erhebt Steuern in Kronkorken. Bürgermeister Gully hat das Kopfgeld persönlich beantragt. Zweimal.',
  auftritt: [N('Auf einem Fass, umgeben von Ratten: ein Mann mit Pappkrone und Mantel aus Rattenfell. „Halt! Wer betritt das Reich von Graf Gully dem Zweiten? Zoll: drei Kronkorken. Oder ein Lied.“')],
  wege: [
    { text: 'Bürgermeister Gully holen und die beiden vor allen Kanalleuten nebeneinanderstellen.', check: ['strasse', 6, ['geruecht', 'kontakte']], ergebnis: 'gestellt',
      zeilen: [L('buergermeister-gully', 'Das ist meine alte Amtskette! Aus der Mülltonne! Und das ist mein alter Mantel! Und DAS ist mein Cousin Bernd!', 'wut'), N('Graf Gully II. heißt Bernd. Die Ratten verlassen ihn sofort. Sie sind sehr prinzipientreu. Bernd lässt sich abführen und weint in die Pappkrone.')] },
  ],
  kampfText: '„Mein Lied heißt: Festnahme.“',
  info: [N('„Unter dem Thronsaal gibt es einen alten Fluchtweg bis hinauf ins Digitech-Areal. Den kennt nicht mal mein Cousin. Mein Cousin ist der Bürgermeister. Der falsche.“ Bernd zwinkert. Oder er hat was im Auge. Im Kanal weiß man das nie.')],
  abgabe: 'Bernd lässt sich die Krone nicht abnehmen. Der Richter erlaubt sie. „Majestätsbeleidigung ist nicht strafbar, wenn die Majestät aus Pappe ist.“ Beleg, Stempel, Klingel.',
};

export const part: ContentPart = {
  jobs: { [kgId(ziel)]: vorlageKopfgeld(ziel) },
  dialogues: { [`pj-kg-${ziel.key}`]: zielDialog(ziel) },
  mapAdditions: zusatz([zielHotspot(ziel)]),
};
