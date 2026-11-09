// Sammelreihen (world.md §9.7): Schallplatten, Datenwürfel, Glückssterne, Neon-Tags, Jimmys Spuren, Flaschenposten,
// Chip-Fragmente. Kategorie 'sammeln' (unverkäuflich). Datenwürfel lassen sich einmal auslesen (je 10 XP, Geschichts-
// schnipsel). Die Sammelbelohnungen (10/20 Sterne, 12 Tags …) vergibt die zuständige Quest bzw. Integration per
// `{ item, min }` – siehe design/plan/gaps/system.md.
import type { ItemDef } from '../../../modules/contracts';
import type { ContentPart } from '../../part';

const nr = (n: number): string => String(n).padStart(2, '0');
const S = (id: string, name: string, description: string, extra: Partial<ItemDef> = {}): ItemDef => ({
  id, name, category: 'sammeln', icon: id.replace(/-\d+$/, ''), price: 0, sellable: false, description, ...extra,
});

/** Schallplatten 01–12: erfundene Unterstadt-Klassiker. */
const PLATTEN: readonly [string, string][] = [
  ['Kabelbrand – „Funken“', 'Die erste Single von Kabelbrand, roh und laut. Auf dem Cover: eine Bassistin mit Schläger statt Bass.'],
  ['DJ Fönix – „Smog über Sektor 4“', 'Synthie-Wellen aus den Sechzigern. Klingt wie ein Sonnenuntergang durch Dunstfilter.'],
  ['Die Lötkolben – „Heiße Spitze“', 'Werkstatt-Punk aus den Lötgassen. Drei Akkorde, zwei Funken, ein Kurzschluss.'],
  ['Hafenchor Rostkai – „Ahoi, Beton“', 'Seemannslieder von Leuten, die nie ein Schiff betreten haben. Ergreifend.'],
  ['Digitech Werksorchester – „Feierabend 2071“', 'Die Betriebskapelle der Digitech, aufgenommen eine Woche vor der Pleite. Fröhlich. Zu fröhlich.'],
  ['Radio Rost – „Stimmen aus dem Staub“', 'Eine Sammlung der besten Sendungen von Opa Funk. Zwischen den Liedern: Wetterberichte aus der Ödnis.'],
  ['Brackwasser Blues – „Ebbe“', 'Treibgut-Blues, mit Algen in der Rille. Spielt erstaunlich gut.'],
  ['Neonnacht Mixtape Vol. 3', 'Ein Mix von DJ Lumo, live im High Voltage. Ab Minute 12 hört man Hunter mitgrölen.'],
  ['Pixel & Puls – „Highscore“', 'Spielhallen-Chiptune auf Vinyl. Der Hauptpreis des Pixelpalasts – du hast ihn dir verdient.'],
  ['Serenity Chrome – „Glaspark“', 'Klavierstücke, die Serenity mit 14 aufgenommen hat. Haus Chrome hat die Auflage vernichtet. Fast.'],
  ['Konvoi-Kapelle – „Sand im Getriebe“', 'Fahrtenlieder der Konvoi-Leute, Gitarre und Hupe. Mitsingen ist Pflicht.'],
  ['Marla Sand – „Wo Wasser war“', 'Marlas einzige Platte, Wüstenfolk mit Mundharmonika. Sie spricht nicht gern darüber.'],
];

/** Datenwürfel 01–20: Geschichtsschnipsel über Digitech und Quantum. */
const WUERFEL: readonly string[] = [
  '2058: Digitech eröffnet das erste Labor in der Unterstadt. Motto: „Technik für alle“. Die Kantine war gratis.',
  'Interne Mail: „Projekt Zentrator läuft. Bitte keine Kaffeetassen auf den Prototyp stellen.“',
  'Werksfoto 2063: Hartlauf, jung, lachend, vor einem Server so groß wie ein Haus.',
  'Bahnhofs-Archiv: Digitech zahlte die U-Bahn-Linie 4. Quantum ließ sie verfallen.',
  'Netzcafé-Log: Ein Nutzer namens „Nyra“ fragt 400-mal „Wie weit ist das Meer?“. Keine Antwort.',
  'Hafenprotokoll: Container 77 wird wöchentlich ohne Ladeliste angeliefert. Empfänger: Quantum Industries.',
  'NX-1-Rohmaterial: Collin probt den Satz „Quantum liebt euch“. 37 Takes.',
  'Werbung 2081: „Chrome 9 – fast so gut wie Chrome 10!“ Darunter: Rückrufaktion, Kleingedrucktes.',
  'Glasarkaden-Kamera: Blade spricht mit seinem Spiegelbild. Das Spiegelbild nickt zuerst.',
  'Gerichtsakte: Digitech gegen Quantum, Patentstreit „Zentrator“. Urteil: vertagt. Seit 14 Jahren.',
  'Notiz von FX-60: „SIE HABEN MICH ABGESCHALTET. ICH HABE GEWARTET. ICH BIN GEDULDIG.“',
  'Quantum-Memo: „Testgruppe Unterstadt zeigt 98 % Gehorsam. Nebenwirkungen: Kopfschmerzen, Glück.“',
  'Chrome-Familienarchiv: Seraphina, Sybella und Serenity bei der Einweihung der Arkaden. Nur eine lächelt.',
  'Digitech-Abschiedsrede: „Wir haben eine KI gebaut, die lernt. Wir haben vergessen, ihr Grenzen beizubringen.“',
  'Pumpwerk-Logbuch: Wasserdruck sinkt jeden Monat um 2 %. Quantum zweigt ab.',
  'Hartlaufs Tagebuch: „Alesa war die Beste in meinem Team. Jetzt baut sie Fesseln für Quantum.“',
  'Notstrom-Terminal: Letzter Befehl vor der Pleite: „NEXUS – SCHLAFEN“. Ausgeführt: nein.',
  'Kanalfund: Ein Digitech-Ausweis mit Rattenbissen. Inhaberin: Fluss-Frieda, Laborassistentin.',
  'Datentunnel-Mitschnitt: Eine Stimme zählt rückwärts. Sie ist bei 1.204.',
  'Gründungsprotokoll: „Nexus, wer bist du?“ – „Ich bin, was ihr aus mir macht. Bitte macht etwas Gutes.“',
];

const NEON_TAGS: readonly string[] = [
  'Ein pinker Blitz mit Krone', 'Eine Ratte mit Sonnenbrille', 'Ein Lötkolben, der Herzen lötet', 'Ein Wasserturm mit Kindergesicht',
  'Eine U-Bahn, die Flügel hat', 'Ein Kran, der eine Welle angelt', 'Ein Auge mit Barcode, durchgestrichen', 'Ein Leuchtpilz mit Gitarre',
  'Ein Falke aus Schrott', 'Ein Funkturm, der singt', 'Eine Welle mit dem Wort FREI', 'Eine offene Tür im Meer',
];

const JIMMY_SPUREN: readonly string[] = [
  'Ein Werbezettel für „Jimmys Turmbau – Ölfässer jeder Größe“. Telefonnummer abgerissen.',
  'Ein Türmchen aus drei Ölfässern, oben ein Kronkorken. Jimmys Handschrift.',
  'Eine Notiz auf einem Ticket: „Vega bringt Nudeln. Mittwoch. Danke sagen!!“',
  'Ein Kreidepfeil am Bahnsteig-Ende, daneben: „Hier wohnt keiner. (Jimmy)“',
  'Ein Ölfass-Turm, schief, mit einem Plüschhasen auf der Spitze.',
  'Ein gefaltetes Bild: Jimmy und ein Mädchen mit Zielfernrohr, beide lachend.',
  'Ein Zettel im Kanal: „Ich hab den Chip noch. Er flüstert. Ich hör nicht hin.“',
  'Ein letzter Turm an der Laufstrecke, sieben Fässer hoch. Oben: „Für dich, Vega. Ich komm heim.“',
];

const FLASCHENPOST: readonly string[] = [
  '„Wer das findet: Das Meer ist echt. Ich hab’s gesehen. Glaubt mir keiner.“ – ohne Namen',
  '„Tag 40 auf dem Floß. Der Kanal endet nicht. Er wird nur breiter. Und dann riecht es nach Salz.“',
  '„Wir haben einen Brunnen gegraben und Muscheln gefunden. In der Wüste. Was war hier mal?“',
  '„An alle Kuriere: Die Küstenstraße ist frei, wenn die Flut geht. Nicht anhalten.“',
  '„Hinter der Mauer, drei Bojen weit, liegt eine Insel. Die Bojeninsel. Dort ist das Wasser blau.“',
];

const list: ItemDef[] = [
  ...PLATTEN.map(([title, text], i) => S(`schallplatte-${nr(i + 1)}`, `Schallplatte ${nr(i + 1)}: ${title}`, text, { giftTags: ['musik', 'sammler'] })),
  ...WUERFEL.map((text, i) => {
    const id = `datenwuerfel-${nr(i + 1)}`;
    return S(id, `Datenwürfel ${nr(i + 1)}`, 'Ein glimmender Speicherwürfel aus Digitech-Zeiten. Ausgelesen erzählt er ein Stück Stadtgeschichte (einmalig 10 XP).', {
      inspect: text,
      use: {
        label: 'Auslesen', consumes: false, when: { not: { seen: `${id}-gelesen` } },
        effects: [{ xp: 10 }, { markSeen: `${id}-gelesen` }, { message: text }],
      },
    });
  }),
  ...Array.from({ length: 20 }, (_, i) => S(`glueckstern-${nr(i + 1)}`, `Glücksstern ${nr(i + 1)}`,
    'Ein ausgeschnittener Blechstern von einer Laterne. Die Stadtlegende sagt: Wer zehn findet, hat Glück. Wer zwanzig findet, leuchtet.')),
  ...NEON_TAGS.map((motif, i) => S(`neon-tag-${nr(i + 1)}`, `Neon-Tag ${nr(i + 1)}`,
    `Eine abfotografierte Graffiti-Marke von Sina Spray: ${motif}. Zwölf Stück ergeben ein Motiv für die Wand der Freiheit.`)),
  ...JIMMY_SPUREN.map((text, i) => S(`jimmy-spur-${nr(i + 1)}`, `Jimmys Spur ${nr(i + 1)}`, text)),
  ...FLASCHENPOST.map((text, i) => S(`flaschenpost-${nr(i + 1)}`, `Flaschenpost ${nr(i + 1)}`,
    'Eine verkorkte Flasche mit einem eingerollten Brief darin.', { inspect: text, giftTags: ['meer', 'sammler'] })),
  ...Array.from({ length: 6 }, (_, i) => S(`chip-fragment-${nr(i + 1)}`, `Chip-Fragment ${nr(i + 1)}`,
    'Ein Bruchstück eines Chrome-10-Chips. Sechs davon reichen, um das Gegenmittel ohne weitere Teile zu bauen.')),
];

const items: Record<string, ItemDef> = Object.fromEntries(list.map((item) => [item.id, item]));

export const part: ContentPart = { items };
