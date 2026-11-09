// Questgegenstände aller Akte (world.md §9.6) einschließlich der Herkunfts-Startgegenstände (§2.2). Kategorie 'quest':
// unverkäuflich, Preis 0 (Ausnahme `ausweis-oberstadt`, bei Fräulein Pixel käuflich). Quests und Dialoge fragen sie per
// `{ item }` ab und geben/nehmen sie per `give`/`take`.
import type { ItemDef } from '../../../modules/contracts';
import type { ContentPart } from '../../part';

const Q = (id: string, name: string, description: string, extra: Partial<ItemDef> = {}): ItemDef => ({
  id, name, category: 'quest', icon: id, price: 0, sellable: false, description, ...extra,
});

const list: ItemDef[] = [
  // --- Hauptstrang Akt 1 -----------------------------------------------------------------------------------
  Q('partyfoto-raven', 'Partyfoto von Raven', 'Ein Foto aus dem High Voltage, aufgenommen kurz vor Ravens Verhaftung. Im Hintergrund ein Gesicht, das dort nicht hätte sein dürfen.'),
  Q('geruecht-master', 'Gerücht: „Master“', 'Ein Zettel aus dem Club: Gechippte flüstern im Schlaf „Ja, Master“. Wer oder was ist der Master?'),
  Q('wissen-zentrator', 'Wissen: Zentrator', 'Dantes Skizze auf einer Serviette: Wie der Quantum-Zentrator funktioniert – und wo er verwundbar ist.'),
  Q('grundriss-labor', 'Grundriss des Labors', 'Ein Digitech-Bauplan des Quantum-Labors mit Lüftungsschächten. Ein Kaffeefleck verdeckt den Notausgang.'),
  Q('presseausweis', 'Presseausweis', 'Ein NX-1-Presseausweis auf deinen Namen (fast). Öffnet das Drehkreuz zu den Glasarkaden und manche Türen, hinter denen gelogen wird.'),
  Q('opa-blech-fernbedienung', 'Opa-Blech-Fernbedienung', 'Eine klobige Fernbedienung mit einem einzigen roten Knopf. Im Kampf ruft sie Opa Blech: drei Runden lang ein Geschütz, das schimpft. Einmal pro Kampf.',
    { inspect: 'Auf dem Knopf steht „NUR IM NOTFALL“. Darunter, kleiner: „oder wenn’s lustig ist“.' }),
  Q('captain-kuschel', 'Captain Kuschel (in der Tasche)', 'Captain Kuschel, zusammengerollt in deiner Tasche, schnurrend wie ein Kühlschrank. Kämpft mit, wenn Dante dabei ist. Lässt sich nicht verkaufen. Würde dich auch verklagen.',
    { giftTags: ['tier'] }),
  Q('rostlaube-zuendkerze', 'Zündkerze der Rostlaube', 'Eine originale Zündkerze für den Kombi „Rostlaube“. Teil 1 von 3.'),
  Q('rostlaube-kuehlerpumpe', 'Kühlerpumpe der Rostlaube', 'Eine Kühlerpumpe, die angeblich mal in einem Pumpwerk steckte. Teil 2 von 3.'),
  Q('rostlaube-batterie', 'Batterie der Rostlaube', 'Eine Digitech-Notstrombatterie, frisch gelötet. Teil 3 von 3.'),
  Q('karte-lieferzone', 'Karte der Lieferzone', 'Ein Lageplan der Quantum-Lieferzone mit Schichtwechseln, mit Bleistift ergänzt: „Laster 3 hat kein Schloss“.'),
  Q('kinderbild', 'Kinderbild', 'Ein Buntstiftbild der Straßenkinder: die ganze Crew, Captain Kuschel größer als alle. Du bist auch drauf. Mit Krone.',
    { giftTags: ['kinder', 'kunst'] }),
  Q('kuestenkarte-fragment', 'Küstenkarten-Fragment', 'Ein Stück einer alten Seekarte mit Küstenlinie und Bojen. Vier Stück ergeben den Weg zum Meer.',
    { inspect: 'Am Rand eine Notiz in verwaschener Tinte: „… hinter der dritten Boje ist das Wasser blau.“' }),

  // --- Herkunfts-Startgegenstände -------------------------------------------------------------------------
  Q('alte-zugangskarte', 'Alte Zugangskarte', 'Deine Zugangskarte aus der Oberstadt, längst gesperrt. Das Foto zeigt jemanden, der noch an Upgrades glaubte.'),
  Q('alte-dienstmarke', 'Alte Dienstmarke', 'Deine Marke aus dem Ordnungsdienst, mit Kratzer quer über der Nummer. Wachen sehen sie und werden kurz höflich: +1 bei Checks gegenüber dem Ordnungsdienst.',
    { checkBonus: [{ factions: ['ordnungsdienst'], value: 1, label: 'Alte Dienstmarke' }] }),
  Q('entlassungsschein', 'Entlassungsschein', 'Dein Entlassungsschein aus dem Zellentrakt, gestempelt, gefaltet, zerknittert. Beweis, dass du bezahlt hast.'),
  Q('knast-loeffel', 'Knast-Löffel', 'Ein Blechlöffel aus dem Zellentrakt, der Stiel spitz gefeilt. Nie benutzt. Wirklich. Fast.'),
  Q('werkzeuggurt-rostig', 'Rostiger Werkzeuggurt', 'Dein Werkzeuggurt vom Schrottplatz, jedes Werkzeug mit eigener Geschichte. +1 Technik bei Reparatur-Checks.',
    { checkBonus: [{ attribute: 'technik', tags: ['reparieren'], value: 1, label: 'Rostiger Werkzeuggurt' }] }),
  Q('loetkolben-alt', 'Alter Lötkolben', 'Dein erster Lötkolben, mit Isolierband am Griff. Wird heiß, wenn er will, nicht, wenn du willst.'),
  Q('wasserkanister', 'Wasserkanister', 'Ein zerbeulter Kanister aus der Ödnis, halb voll. Wasser ist dort Währung. Hier ist es eine Erinnerung.'),

  // --- Akt 2 und 3 ----------------------------------------------------------------------------------------
  Q('zugangskarte-quantum', 'Quantum-Zugangskarte', 'Eine aktive Mitarbeiterkarte des Quantum-Campus. Das Foto zeigt einen Mann namens Dr. Pflaume. Gute Reise, Dr. Pflaume.'),
  Q('wachplan-campus', 'Wachplan des Campus', 'Vegas Notizen von der Fußgängerbrücke: jede Streife, jede Pause, jeder Kaffee.'),
  Q('behoerdenkarte', 'Behördenkarte', 'Eine Karte des Ordnungsdienstes mit Zugang zum Beweismittellager. Kessel weiß davon nichts. Offiziell.'),
  Q('dienstplan-2079', 'Dienstplan 2079', 'Ein alter Quantum-Dienstplan vom Abend des Kabelbrand-Unfalls. Ein Name ist durchgestrichen: Xion Venom.'),
  Q('echter-chrome-10-code', 'Echter Chrome-10-Code', 'Der echte Freischaltcode für Chrome 10. Ein einziger Satz Zahlen, für den Leute bereit wären zu töten.'),
  Q('richters-gefallen', 'Richters Gefallen', 'Ein handgeschriebener Zettel des Richters: „Ein Gefallen. Einer. Nicht übertreiben.“'),
  Q('goldene-plus-vier', 'Goldene Plus-Vier', 'Eine vergoldete „Plus vier“-Karte für Eins!, Turnierpreis. Ein Zubehör für Siegertypen: +1 bei Eins!-Checks.',
    { checkBonus: [{ tags: ['eins', 'karten', 'bluff'], value: 1, label: 'Goldene Plus-Vier' }], giftTags: ['spiel'] }),
  Q('plattenspieler-tragbar', 'Tragbarer Plattenspieler', 'Ein Koffer-Plattenspieler mit Batterie. Im Kampf legt er auf und ein Begleiter ist „Ermutigt“.',
    { giftTags: ['musik', 'retro'] }),
  Q('xion-passierschein', 'Xions Passierschein', 'Ein Passierschein mit Xions grüner Unterschrift. Öffnet Türen auf dem Campus, solange niemand genau hinschaut.'),
  Q('blades-visitenkarte', 'Blades Visitenkarte', 'Schwarzes Papier, goldene Prägung: „Blade Nocturne – Termine nach Vereinbarung“. Riecht nach Leder und Ehrgeiz.'),
  Q('schottschluessel', 'Schottschlüssel', 'Ein schwerer Vierkantschlüssel für die Schotts unter der Stadt. Öffnet den Weg zum Datentunnel.'),
  Q('ausweis-oberstadt', 'Oberstadt-Ausweis', 'Ein gefälschter Oberstadt-Ausweis von Fräulein Pixel. Der Panoramaaufzug bringt dich damit zum Chrome-Boulevard.', { price: 400 }),
  Q('chrome-einladung', 'Chrome-Einladung', 'Eine Einladung auf Büttenpapier zur Releaseparty, mit Chrome-Siegel. Unverschämt schwer für ein Stück Papier.'),
  Q('party-ausweis', 'Party-Ausweis', 'Ein Gästebändchen für die Releaseparty im Himmelsgarten. Fräulein Pixel schwört, er hält jeder Prüfung stand.'),
  Q('stick-hunter', 'Hunters Stick', 'Ein Datenstick, den Hunter dir anvertraut hat, versiegelt mit Nagellack. „Nicht reinschauen. Ernsthaft.“'),
  Q('quest-nexus-chip', 'Nexus-Chip', 'Der Chip. Klein, schwarz, warm. Manchmal flackert ein blaues Licht darin, als würde jemand zurückschauen.'),
  Q('nexus-chip-defekt', 'Defekter Nexus-Chip', 'Ein zerbrochener Nexus-Chip. Zwei Hälften, die nicht mehr miteinander reden.'),
  Q('nexus-forschungsdaten', 'Nexus-Forschungsdaten', 'Ein Datenkristall voller Quantum-Forschung: Protokolle, Testpersonen, Fehlerraten. Die Fehlerraten sind Menschen.'),
  Q('quantum-chip-schrott', 'Quantum-Chip-Schrott', 'Ausschuss aus der Chipfertigung, im Kanal angeschwemmt. Wer genau hinsieht, erkennt Chrome 10.'),
];

const items: Record<string, ItemDef> = Object.fromEntries(list.map((item) => [item.id, item]));

export const part: ContentPart = { items };
