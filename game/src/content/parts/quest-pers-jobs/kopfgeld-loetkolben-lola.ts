// kopfgeld-loetkolben-lola · Stufe 1 (world.md §6.7): verkauft gefährliche Bastel-Implantate. Lötgassen, tagsüber.
// Wege: `[Technik 5]` Ware als defekt nachweisen, Dante überzeugt sie (`[Dante ♥3]`, ohne Attribut-Check), Kampf, laufen lassen.
import type { ContentPart } from '../../part';
import { zusatz } from './_auftrag';
import { type Kopfgeld, kgId, vorlageKopfgeld, zielDialog, zielHotspot } from './_kopfgeld';
import { L, N, P, hearts, time } from './_lib';

export const ziel: Kopfgeld = {
  key: 'loetkolben-lola', name: 'Lötkolben-Lola', stufe: 1, map: 'loetgassen', spot: 'lola-werkbank', ortLabel: 'Lötgassen, tagsüber',
  wann: time('tag'), encounter: 'enc-kopfgeld-loetkolben-lola',
  steckbrief: 'Verkauft selbstgelötete Implantate an Kinder und Kuriere. Drei sind schon explodiert. Eins davon im Ohr eines Kunden.',
  auftritt: [N('Lola, Schutzbrille auf der Stirn, Lötkolben im Mundwinkel wie eine Zigarre. Auf ihrer Werkbank: Augenimplantate in einer Pralinenschachtel. Eins blinkt. Eins raucht.'), N('„Sonderangebot! Nachtsicht für fünfzig! Riecht ein bisschen verbrannt, das ist normal!“')],
  wege: [
    { text: 'Ein Implantat aufschrauben und ihr vor allen Kunden zeigen, warum es raucht.', check: ['technik', 5, ['elektronik', 'implantat']], ergebnis: 'gestellt',
      zeilen: [N('Kurzschluss im Akku, Masse an der Netzhautplatine. Du hältst es hoch. Die Kunden weichen zurück. Lola auch, aber nicht weit genug.'), P('Nachtsicht. Und danach für immer Nacht.')] },
    { text: '„Dante will mit dir reden.“', tag: '[Dante ♥3]', requires: hearts('dante', 3), ergebnis: 'selbst',
      zeilen: [L('dante', 'Lola. Lolalola. Wir haben zusammen gelernt, weißt du noch? Du warst die Beste. Jetzt bist du die Gefährlichste. Das ist nicht dasselbe.', 'trauer'), N('Lola legt den Lötkolben hin. Zum ersten Mal seit Jahren. Sie geht selbst zum Richter. Dante bringt ihr Kekse in die Zelle.')] },
  ],
  kampfText: 'Den Lötkolben aus der Hand schlagen. Dann den Rest.',
  info: [N('„Die Chips hab ich nicht selbst gebaut. Die kommen aus Rippers Lager im Kanal. Ausschussware von Digitech. Er sortiert, ich löte, die Kinder zahlen.“ Sie spuckt aus. „Sag ihm, das war ich. Ist mir egal.“')],
  abgabe: 'Lola gibt an der Saalwache ihren Lötkolben ab. Der Wachtmeister trägt ihn mit zwei Fingern weg, wie eine tote Ratte. Beleg, Stempel, Klingel.',
};

export const part: ContentPart = {
  jobs: { [kgId(ziel)]: vorlageKopfgeld(ziel) },
  dialogues: { [`pj-kg-${ziel.key}`]: zielDialog(ziel) },
  mapAdditions: zusatz([zielHotspot(ziel)]),
};
