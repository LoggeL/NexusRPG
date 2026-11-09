// Cyberware als Gegenstand (world.md §9.2). Jeder Gegenstand trägt dieselbe ID wie sein Teil (`cyberware`), eingebaut
// wird beim Schrauber (Händler mit `ripperdoc`: Dante, Ripper, Mira Lötzinn). Wirkungen stehen im CyberwareDef;
// hier nur Beschreibung, Preis und Händlerangaben.
import type { CyberSlot, ItemDef } from '../../../modules/contracts';
import type { ContentPart } from '../../part';

const SLOT: Record<CyberSlot, string> = {
  kopf: 'Kopf', augen: 'Augen', arme: 'Arme', beine: 'Beine', nervensystem: 'Nervensystem', haut: 'Haut',
};

const C = (id: string, slot: CyberSlot, name: string, price: number, description: string, extra: Partial<ItemDef> = {}): ItemDef => ({
  id, name, category: 'cyberware', icon: id, price, cyberware: id, giftTags: ['cyberware', 'technik'],
  description: `${description} [Platz: ${SLOT[slot]}]`,
  ...extra,
});

const items: Record<string, ItemDef> = {
  // --- Kopf ------------------------------------------------------------------------------------------------
  'kopf-merkchip-alt': C('kopf-merkchip-alt', 'kopf', 'Merkchip (alt)', 300,
    'Ein Gedächtnischip aus der Zeit, als Gedächtnis noch ein Verkaufsargument war. Gehörte Gerüchte bleiben auf der Karte markiert, +1 Straße bei Gerüchte-Checks.'),
  'kopf-strassenfunk': C('kopf-strassenfunk', 'kopf', 'Straßenfunk', 650,
    'Ein Funkimplantat hinterm Ohr. Begleiter kommen per Telefon sofort statt nach einer halben Stunde. Im Kampf: Party +1 Initiative.'),
  'kopf-ruhepol': C('kopf-ruhepol', 'kopf', 'Ruhepol', 900,
    'Dantes Eigenbau mit Röhrenwärme. Immun gegen „Verunsichert“, einmal pro Kampf „Betäubt“ abschütteln.',
    { inspect: 'Wenn man das Ohr ganz nah dranhält, summt er leise. Dante sagt, das sei „Analogwärme“. Dante sagt viel.' }),
  'kopf-fx-60': C('kopf-fx-60', 'kopf', 'FX-60-Modul', 1200,
    'Der Kern des alten Digitech-Assistenten, in Thermopapier gewickelt. +1 Technik bei Hacks, +1 Bandbreite. Fähigkeit „Papierstau“: Ziel „Gehackt“.',
    { sellable: false, inspect: 'Beim Einschalten druckt er ein winziges Fax: „DANKE. NICHT VERKAUFEN.“' }),
  'kopf-neuro-uplink': C('kopf-neuro-uplink', 'kopf', 'Neuro-Uplink', 1800,
    'Quantum-Hardware mit kaltem Blaulicht. +2 Bandbreite. Fähigkeit „Drohnenflüstern“: eine Drohne kämpft zwei Runden für dich.'),
  'kopf-nexus-splitter': C('kopf-nexus-splitter', 'kopf', 'Nexus-Splitter', 3000,
    'Ein Splitter der KI, freiwillig abgegeben. +1 auf alle Technik-Checks; der stärkste Gegner ist zu Kampfbeginn „Markiert“.',
    { sellable: false, inspect: 'Manchmal hörst du ein höfliches „Bitte“. Das ist neu.' }),

  // --- Augen -----------------------------------------------------------------------------------------------
  'augen-preisscanner': C('augen-preisscanner', 'augen', 'Preisscanner', 400,
    'Linsen, die jedem Ding ein Preisschild anheften. Händler −5 %; nach dem ersten Geschenk siehst du, was eine Figur mag.'),
  'augen-restlicht': C('augen-restlicht', 'augen', 'Restlicht-Linsen', 600,
    'Grünstichige Nachtsicht. Licht unter Tage, gegnerische Sichtkegel nachts sichtbar.'),
  'augen-adlerblick': C('augen-adlerblick', 'augen', 'Adlerblick', 1400,
    'Scharfschützenoptik mit Fadenkreuz-Overlay. +1 Reflexe im Fernkampf. Fähigkeit „Zielen“: nächster Schuss +20.'),

  // --- Arme ------------------------------------------------------------------------------------------------
  'arme-datenbuchse': C('arme-datenbuchse', 'arme', 'Datenbuchse', 700,
    'Ein Port im Handgelenk – Kabel rein, Terminal auf. +1 Technik bei Terminal-Checks, Konsolen im Kampf kosten 0 AP.'),
  'arme-greifhaken': C('arme-greifhaken', 'arme', 'Greifhaken', 1200,
    'Dexters Bergungshaken im Unterarm, 8 Meter Stahlseil. Lücken überwinden, +1 Körper bei Welt-Checks. Fähigkeit „Heranziehen“: Ziel 3 Felder heran.'),
  'arme-zerberster-3000': C('arme-zerberster-3000', 'arme', 'Zerberster 3000', 2400,
    'Arias Arm. Silberne Spiralfedern, Ripper-Kern, Dante-Hände. +2 Körper im Nahkampf. Fähigkeit „Zerbersten“: 10–14 Schaden, zerstört Deckung. Nur Aria trägt ihn.',
    { sellable: false, giftTags: ['cyberware'], inspect: 'Wenn du ihn je in der Hand hältst, hat Aria dich sehr, sehr gern. Oder du bist tot.' }),
  'arme-zerberster-attrappe': C('arme-zerberster-attrappe', 'arme', '„Zerberster“ (Toaster)', 40,
    'Ein Toaster mit Armmanschette und aufgesprühtem Logo. Kein Passivbonus. Fähigkeit „Toast“: +5 LP, der Duft lenkt Ratten ab.',
    { sellable: false, giftTags: ['cyberware', 'kitsch', 'essen'], inspect: 'Zwei Schlitze. Ein Kabel. Null Würde. Riecht hervorragend.' }),
  'arme-venomkralle': C('arme-venomkralle', 'arme', 'Venomkralle', 2200,
    'Xions Kralle, drei Klingen, grün angelaufen. +1 Nahkampfschaden, Nahkampftreffer „Verlangsamt“.',
    { sellable: false }),
  'arme-zuendholz-kern': C('arme-zuendholz-kern', 'arme', 'Zündholz-Kern', 2000,
    'Alesas Prototyp, ein Heizkern im Handteller. Nahkampftreffer „Brennt“. Fähigkeit „Funkenhand“: Kegel 3.',
    { sellable: false }),

  // --- Beine -----------------------------------------------------------------------------------------------
  'beine-laeuferservos': C('beine-laeuferservos', 'beine', 'Läuferservos', 1600,
    'Servomotoren an Knie und Knöchel. +2 Initiative, +10 % Lauftempo. Fähigkeit „Sprint“: doppelte Bewegung, danach „Verlangsamt“.'),
  'beine-sprungfedern': C('beine-sprungfedern', 'beine', 'Sprungfedern', 900,
    'Gustavs Federbeine aus alten Lkw-Dämpfern. +1 Bewegung, Lücken überwinden. Fähigkeit „Satz“: auf erhöhte Felder ohne Kosten.'),

  // --- Nervensystem ----------------------------------------------------------------------------------------
  'nerven-reflexbooster': C('nerven-reflexbooster', 'nervensystem', 'Reflexbooster', 2500,
    'Ein Synapsenbeschleuniger, der nach Ozon riecht. +1 Reflexe, einmal pro Kampf +1 AP.'),
  'nerven-ueberspannungsschutz': C('nerven-ueberspannungsschutz', 'nervensystem', 'Überspannungsschutz', 800,
    'Ein Sicherungskasten fürs Rückenmark. Immun gegen „Kurzschluss“, Stromschaden −50 %.'),
  'nerven-zeitlupe': C('nerven-zeitlupe', 'nervensystem', 'Zeitlupe', 1500,
    'Digitech-Wahrnehmungsfilter. Minispiel-Zeit +50 %, einmal pro Kampf Überwachungsfeuer ignorieren.'),

  // --- Haut ------------------------------------------------------------------------------------------------
  'haut-panzerplatten': C('haut-panzerplatten', 'haut', 'Unterhautplatten', 1800,
    'Titanschuppen unter der Haut. Fühlt sich an wie ein Kettenhemd, das dich umarmt. +2 Panzerung.'),
  'haut-filtermembran': C('haut-filtermembran', 'haut', 'Filtermembran', 700,
    'Eine Membran in den Atemwegen. Giftschutz, immun gegen „Kanalmief“.'),
  'haut-tarnlack': C('haut-tarnlack', 'haut', 'Tarnlack', 2000,
    'Lichtbrechender Hautlack, Digitech-Restposten. Sichtkegel beim Schleichen 20 % kürzer, nachts doppelt. Einmal pro Kampf „Getarnt“.'),
  'haut-neonnaehte': C('haut-neonnaehte', 'haut', 'Neonnähte', 350,
    'Leuchtende Nahtlinien auf der Haut, pink oder cyan. +1 Ausstrahlung in der Unterstadt, Club-Eintritt gratis.',
    { giftTags: ['cyberware', 'mode'] }),
  'haut-spiegelhaut': C('haut-spiegelhaut', 'haut', 'Spiegelhaut', 3000,
    'Chrom auf der Haut, poliert bis zur Selbstverliebtheit. +1 Panzerung. Fähigkeit „Blenden“: angrenzende Gegner „Geblendet“.',
    { giftTags: ['cyberware', 'mode', 'oberstadt', 'luxus'] }),
};

export const part: ContentPart = { items };
