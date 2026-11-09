// Questgegenstände der persönlichen Quests und Aufträge, die world.md §9.6 nicht nennt (eigene, sprechende IDs).
// Kategorie 'quest': unverkäuflich, Preis 0.
import type { ItemDef } from '../../../modules/contracts';
import type { ContentPart } from '../../part';
import { byId } from './_lib';

const Q = (id: string, name: string, description: string, extra: Partial<ItemDef> = {}): ItemDef => ({
  id, name, category: 'quest', icon: id, price: 0, sellable: false, description, ...extra,
});

const list: ItemDef[] = [
  // pers-dante-erstpressung
  Q('erstpressung-samstagnacht', 'Erstpressung „Samstagnacht im Neon“',
    'Die Erstpressung, Pressnummer 0001, Hülle mit Kaffeerand und einem Autogramm, das aussieht wie ein Seismogramm. Dante hat sie vor dem Knast verkauft. Seitdem ist sie durch vier Hände gewandert.',
    { inspect: 'Auf der Rückseite, in Kugelschreiber: „Für D. – dreh lauter. – Die Funkenflieger, 2061“.' }),
  // pers-freya-fairer-lohn
  Q('preistafel-entwurf', 'Freyas Preistafel (Entwurf)',
    'Ein Stück Pappe mit Freyas Schönschrift: faire Ankaufspreise für Kinder-Implantate. Unten ist Platz für Unterschriften. Oben steht in Großbuchstaben „VERBINDLICH“, zweimal unterstrichen.'),
  // pers-jakko-kochbuch
  Q('rezeptzettel-babette', 'Rezept: Babettes Dampfnudeln', 'Babettes Dampfnudel-Grundteig, mit Mehlfingerabdrücken. Ein Absatz ist geschwärzt: „Familiengeheimnis. Frag nicht.“'),
  Q('rezeptzettel-bruehe', 'Rezept: Mutter Brühes Suppe', 'Mutter Brühes Rohrsiedlungssuppe für hundert Leute, in Kinderportionen umgerechnet. Die Umrechnung ist falsch. Die Suppe wird trotzdem gut.'),
  Q('rezeptzettel-rudi', 'Rezept: Rudis Diner-Eintopf', 'Rudis Eintopf aus der Staubstraße, gekritzelt auf eine Speisekarte. Zutat Nummer eins: „Was da ist.“ Zutat Nummer zwei: „Mehr davon.“'),
  // pers-kinder-wasserturm
  Q('dachpappe-paket', 'Paket Dachpappe und Nieten', 'Teerpappe, Blechflicken, eine Tüte Nieten und ein Eimer Dichtmasse, die riecht wie ein Streit. Reicht für ein Dach. Fast.'),
  // pers-dexter-schuldenfrei
  Q('dexters-glaeubigerbuch', 'Dexters Gläubigerbuch',
    'Ein Notizbuch mit Schulden in Dexters Handschrift. Neben jedem Namen eine nette Notiz: „Babette – macht die besten Nudeln, bald zurückzahlen!!“ Neben Hunter steht nur: „…“'),
  // pers-barkeeper-letzter-vers
  Q('gedichtbuch-bemalt', 'Das bemalte Gedichtbuch', 'Das Gedichtbuch des Barkeepers. Über jedes zweite Gedicht hat Jakko mit Wachsmalstiften Dampfnudeln, Raketen und einen Hasen mit sehr großen Ohren gemalt. Manche Verse kann man noch lesen.'),
  // pers-kiki-reichweite
  Q('taxi-akkuzelle', 'Taxi-Akkuzelle', 'Eine dicke Akkuzelle für Schwebetaxis, warm wie ein Haustier. Kiki braucht drei davon, um weiter zu kommen als bis zur Stadtgrenze.'),
  // pers-lio-album
  Q('lios-aufnahmegeraet', 'Lios Aufnahmegerät', 'Ein Taschenrekorder aus den Sechzigern mit einem Mikrofon, das mit Klebeband an einem Löffel hängt. Lio sagt, der Löffel macht den Klang wärmer.'),
  Q('profi-mikro-kameramann', 'Profi-Mikro des Kameramanns', 'Ein Richtmikrofon mit Fellpuschel, geliehen vom Kameramann. Auf dem Griff klebt ein Zettel: „[ZURÜCKGEBEN]“. Macht jede Aufnahme sauberer.'),
  // pers-kameramann-ungeschminkt
  Q('kamera-kameramann', 'Kamera des Kameramanns', 'Eine kleine, alte Fotokamera mit Sucher und Kurbel. Kein Filter, kein Zoom, keine Lügen. Acht Bilder passen drauf.'),
  // pers-nebelhorn-letzte-faehre
  Q('leuchtfeuer-lampe', 'Leuchtfeuer-Lampe', 'Eine Signallampe für ein Leuchtfeuer, faustgroß, mit Linse aus Flaschenglas. Wenn sie brennt, sieht man sie bis zur Bojeninsel. Sagt man.'),
  // pers-bolzen-bein
  Q('bolzen-beinteil', 'Hundebein-Ersatzteil', 'Ein Servo, eine Feder oder ein Stück Gelenk aus Quantum-Wachhundbeständen. Drei Teile ergeben ein Bein. Sagt Gustav. Dante sagt: zwei und ein Keks.'),
  Q('bolzen-bein', 'Neues Bein für Bolzen', 'Ein fertiges Roboterhundebein mit Federgelenk, poliert und mit einem Aufkleber „SCHNELL“. Bolzen wird es lieben.'),
];

export const part: ContentPart = { items: byId(...list) };
