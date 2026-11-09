// kopfgeld-zwei-finger-zoltan · Stufe 1 (world.md §6.7): Taschendieb, rennt sofort. Schrottmarkt, abends.
// Wege: `[Reflexe 5]` Verfolgung, Köder-Geldbörse (ohne Check), `[Ausstrahlung 4]` Selbstanzeige, Kampf, laufen lassen.
import type { ContentPart } from '../../part';
import { zusatz } from './_auftrag';
import { type Kopfgeld, kgId, vorlageKopfgeld, zielDialog, zielHotspot } from './_kopfgeld';
import { L, N, P, cr, time } from './_lib';

export const ziel: Kopfgeld = {
  key: 'zwei-finger-zoltan', name: 'Zwei-Finger-Zoltan', stufe: 1, map: 'schrottmarkt', spot: 'zoltan-revier', ortLabel: 'Schrottmarkt, abends',
  wann: time('abend'), encounter: 'enc-kopfgeld-zwei-finger-zoltan',
  steckbrief: 'Taschendieb. Hat angeblich nur zwei Finger an der rechten Hand, braucht aber auch nicht mehr. Rennt, sobald er dich sieht.',
  auftritt: [N('Ein dürrer Typ in einem Mantel mit zu vielen Taschen schlendert durch die Menge. Er rempelt eine Oma an, entschuldigt sich höflich und hat danach ihre Geldbörse. Dann sieht er dich. Er weiß sofort, wer du bist.')],
  wege: [
    { text: 'Hinterher. Über die Stände, unter den Planen durch.', check: ['reflexe', 5, ['rennen', 'klettern']], ergebnis: 'gestellt',
      zeilen: [N('Drei Stände, eine Plane, ein Hechtsprung über Babettes Dampfkessel. Am Ende sitzt du auf Zoltan, und Zoltan sitzt in einer Kiste Röstzwiebeln.'), P('Zwei Finger. Und null Kondition.')] },
    { text: 'Eine Geldbörse aus der Tasche hängen lassen und so tun, als würdest du die Auslage anschauen. (20 Cr als Köder)', requires: { credits: 20 }, effects: [cr(-20)], ergebnis: 'gestellt',
      zeilen: [N('Zwei Minuten später zupft es an deiner Tasche. Du greifst zu. Zwischen deinen Fingern zappeln zwei andere.'), L('narrator', '„Okay. Okay! Respekt. Das war elegant.“ Zoltan seufzt. Die zwanzig Credits gibt er nicht zurück. Ehrensache.')] },
    { text: '„Zoltan. Im Knast gibt’s Frühstück. Und keiner klaut dir was.“', check: ['ausstrahlung', 4, ['ueberreden']], ergebnis: 'selbst',
      zeilen: [N('Zoltan denkt lange nach. „Mit Rührei?“ – „Mit Rührei.“ Er geht freiwillig zum Richter. Unterwegs klaut er dem Wachtmeister die Uhr und gibt sie ihm zurück. Aus Gewohnheit, sagt er.')] },
  ],
  kampfText: 'Den Fluchtweg abschneiden und zugreifen.',
  info: [N('„Okay, Deal. Pfeffer aus den Glasarkaden kauft mir alles ab, was nach Oberstadt riecht. Und in der Neon-Gasse ist ein Kurier unterwegs, der für Quantum fährt. Rote Jacke. Mehr weiß ich nicht. Ehrlich. Fast ehrlich.“')],
  abgabe: 'Der Wachtmeister an der Saalwache nimmt Zoltan in Empfang und zählt dessen Finger. Zwei. Der Richter stempelt. Das Terminal spuckt den Beleg aus.',
};

export const part: ContentPart = {
  jobs: { [kgId(ziel)]: vorlageKopfgeld(ziel) },
  dialogues: { [`pj-kg-${ziel.key}`]: zielDialog(ziel) },
  mapAdditions: zusatz([zielHotspot(ziel)]),
};
