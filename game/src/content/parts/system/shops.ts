// Händler der Akt-1-Zonen (world.md §3.5 „Händler“, §3.6, §3.8 Ladenzeiten, §9 „Bezug“). Shop-IDs, Karte, Spot und
// Besitzer stehen in design/plan/shops.md; die Zonen-Agenten setzen dort Hotspots `{ kind: 'shop', shop: '<id>' }`.
// Tagesbestand `qty` füllt sich jeden Morgen auf; Preise ohne Angabe = Grundpreis des Gegenstands.
// Öffnungszeiten: Morgen 06–10, Tag 10–17, Abend 17–21, Nacht 21–02 (Uhr in Minuten: 360 … 1560).
import type { Condition, ShopDef, ShopStockEntry } from '../../../modules/contracts';
import type { ContentPart } from '../../part';

const TAGSUEBER: Condition = { time: ['morgen', 'tag', 'abend'] };
const BIS_19: Condition = { clockBetween: [600, 1140] };
const ACT2: Condition = { act: 2 };

/** Gebrauchtteil bei Ripper: 60 % des Neupreises (world.md §9.2). */
const used = (item: string, price: number, extra: Partial<ShopStockEntry> = {}): ShopStockEntry => ({ item, price: Math.round(price * 0.6), qty: 1, ...extra });

const RIPPER_HINTERZIMMER: Condition = { any: [{ flag: 'ripper_kennt_dich' }, { rep: 'unterstadt', min: 20 }] };

// --- Dauer-Belohnungen und Rivalitäts-Folgen (world.md §4.4/§4.5, gaps/quest-side-*.md, gaps/npc-ordnung-markt.md) ---
/** side-riegel-krise: Solange die Krise läuft, gibt es in der Unterstadt keine Nougatbomben. */
const NOUGAT_DA: Condition = { not: { quest: 'side-riegel-krise', state: 'active' } };
/** Master-Modus (wie npc-kinder-alte/_dsl.ts `MASTER`): Oma Volt macht den Laden für dich dicht. */
const MASTER: Condition = { all: [{ flag: 'master_modus' }, { notFlag: 'ende_doch_noch_meer' }] };
const DANTE_RIVALE: Condition = { rival: 'dante' };
const DEXTER_RIVALE: Condition = { rival: 'dexter' };
const DEXTER_EHRLICH: Condition = { not: DEXTER_RIVALE };
const BABETTE_RIVALE: Condition = { rival: 'babette-bao' };

const shops: Record<string, ShopDef> = {
  // --- Neon-Gasse ------------------------------------------------------------------------------------------
  'volt-eck': {
    id: 'volt-eck', name: 'Volt-Eck', owner: 'oma-volt', faction: 'unterstadt', open: TAGSUEBER,
    priceRules: [
      { when: MASTER, refuse: 'Am Fliegengitter hängt ein gesticktes Schild: „FÜR MASTER GESCHLOSSEN“. Oma Volt zieht das Rollo runter, bevor du „Oma“ sagen kannst.' },
      // side-oma-volts-lager: Familienrabatt auf Dauer.
      { when: { flag: 'oma_volt_rabatt' }, discount: 15, note: 'Familienrabatt – „Nicht weitersagen, Kindchen.“' },
      // Dank aus side-ki-fluestern (Akt 2).
      { when: { flag: 'oma_volt_rabatt_5' }, discount: 5, note: 'Pauls Dankeschön' },
    ],
    stock: [
      { item: 'medipflaster', qty: 8 },
      { item: 'nougatbombe', qty: 12, when: NOUGAT_DA },
      { item: 'volt-limo', qty: 8 },
      { item: 'synth-kaffee', qty: 10 },
      { item: 'u-bahn-ticket' },
      { item: 'chips-tuete', qty: 10 },
      { item: 'comic-heft', qty: 3 },
      { item: 'kartendeck', qty: 2 },
      { item: 'liebesroman', qty: 2 },
      { item: 'stickerbogen', qty: 6 },
      { item: 'neonkreide', qty: 6 },
      { item: 'nadel-und-faden', qty: 3 },
      { item: 'waschpulver', qty: 4 },
      { item: 'taxi-duftbaum', qty: 4 },
      { item: 'plastikpflanze', qty: 2 },
      { item: 'schwarzer-lippenstift', qty: 1 },
      { item: 'feuerloescher-mini', qty: 2 },
      { item: 'magnetangel', qty: 1 },
      { item: 'metalldetektor', qty: 1 },
    ],
  },
  'hv-bar': {
    id: 'hv-bar', name: 'High-Voltage-Bar', owner: 'barkeeper', faction: 'crew-hunter', open: { time: ['abend', 'nacht'] },
    stock: [
      { item: 'volt-limo', qty: 10 },
      { item: 'kuehlmittel-mocktail', qty: 8 },
      { item: 'neon-limo', qty: 6, when: { quest: 'side-neon-limo', state: 'done' } },
      { item: 'synth-kaffee', qty: 6 },
      { item: 'nougatbombe', qty: 6, price: 8, when: NOUGAT_DA },
      { item: 'poster-hv', qty: 2 },
      { item: 'vinyl-platte', qty: 1, price: 140 },
    ],
  },

  // --- Schrottmarkt ----------------------------------------------------------------------------------------
  'garkueche-babette': {
    id: 'garkueche-babette', name: 'Bao Babette – Dampfnudeln seit 2061', owner: 'babette-bao', faction: 'unterstadt',
    open: { all: [TAGSUEBER, { not: { weekday: 'mo' } }] },
    // Rivalität: kleinere Portionen zum alten Preis – macht pro Bissen die Hälfte mehr.
    priceRules: [{ when: BABETTE_RIVALE, discount: -50, note: 'Babette schneidet deine Dampfnudeln neuerdings in der Mitte durch. Der Preis bleibt ganz.' }],
    stock: [
      { item: 'bao-dampfnudel', qty: 20 },
      { item: 'synth-nudeln', qty: 12 },
      { item: 'tai-chi-tee', qty: 6 },
      { item: 'kaeseecke', qty: 6 },
      { item: 'kraeuter-gebaeck', qty: 6, when: { weekday: 'fr' } },
    ],
  },
  'gustavs-schrottkram': {
    id: 'gustavs-schrottkram', name: 'Gustavs Schrottkram', owner: 'opa-gustav', faction: 'unterstadt', open: { time: ['morgen', 'tag'] },
    stock: [
      { item: 'rohrzange', qty: 2 },
      { item: 'baseballschlaeger', qty: 2 },
      { item: 'bolzer', qty: 1 },
      { item: 'rauchtopf', qty: 4 },
      { item: 'klebegranate', qty: 4 },
      { item: 'schrott-ersatzteil', qty: 15 },
      { item: 'leckerli-schraube', qty: 5 },
      { item: 'beine-sprungfedern', qty: 1 },
      { item: 'boxbandagen', qty: 2 },
      { item: 'griffband-schlaeger', qty: 3 },
      { item: 'klingenpolitur', qty: 2 },
      { item: 'oelkaennchen', qty: 3 },
      { item: 'quietsche-mutter', qty: 6 },
      { item: 'schweissbrille-gelb', qty: 1 },
      { item: 'vhs-kassette', qty: 2 },
      { item: 'wurfmesser-poliert', qty: 1 },
      { item: 'rostige-schraube', qty: 20 },
    ],
  },
  'ripper-praxis': {
    id: 'ripper-praxis', name: 'Rippers Praxis', owner: 'ripper', faction: 'zerleger', open: { clockBetween: [600, 1260] },
    ripperdoc: { fee: 100, freeWhen: { repTier: 'zerleger', min: 'verehrt' } },
    // side-container-77 („Freund des Hauses“) bzw. das Murmel-Auge: 15 % auf Dauer.
    priceRules: [{ when: { any: [{ flag: 'ripper_rabatt' }, { flag: 'c77_ripper_rabatt' }] }, discount: 15, note: 'Freund des Hauses – Ripper fragt nicht, wo du das Geld her hast.' }],
    stock: [
      { item: 'schockpistole', qty: 2 },
      { item: 'funkenschleuder', qty: 1 },
      used('kopf-merkchip-alt', 300),
      used('augen-preisscanner', 400),
      { item: 'alter-neurochip', qty: 2 },
      { item: 'klauen-schleifstein', qty: 1 },
      { item: 'medipflaster', qty: 4, price: 30 },
      // Hinterzimmer (world.md §3.5: mit `ripper_kennt_dich` oder Ruf `unterstadt` 20)
      used('augen-adlerblick', 1400, { when: RIPPER_HINTERZIMMER }),
      used('beine-laeuferservos', 1600, { when: RIPPER_HINTERZIMMER }),
      used('haut-panzerplatten', 1800, { when: RIPPER_HINTERZIMMER }),
      used('nerven-reflexbooster', 2500, { when: { all: [RIPPER_HINTERZIMMER, ACT2] } }),
      { item: 'seltenes-implantat', qty: 1, when: RIPPER_HINTERZIMMER },
    ],
  },
  'dexters-schrott': {
    id: 'dexters-schrott', name: 'Dexters Schrott', owner: 'dexter', faction: 'unterstadt',
    open: { all: [{ time: ['tag', 'abend'] }, { quest: 'main-1-dexter', state: 'done' }] },
    // Rivalität: Dexter verkauft dir Haldenschrott zum Preis der echten Ware.
    priceRules: [{ when: DEXTER_RIVALE, note: 'Dexter grinst zu breit. Die Ware riecht verdächtig nach Halde.' }],
    stock: [
      { item: 'drohnen-propeller', qty: 4, when: DEXTER_EHRLICH },
      { item: 'ersatz-rotor', qty: 1, when: DEXTER_EHRLICH },
      { item: 'arme-greifhaken', qty: 1, when: DEXTER_EHRLICH },
      { item: 'schrott-ersatzteil', qty: 10, price: 7, when: DEXTER_EHRLICH },
      { item: 'reparaturset', qty: 2, when: DEXTER_EHRLICH },
      { item: 'rostige-schraube', qty: 4, price: 20, when: DEXTER_RIVALE },
      { item: 'glitzerschrott', qty: 1, price: 90, when: DEXTER_RIVALE },
      { item: 'rostige-dose', qty: 2, price: 35, when: DEXTER_RIVALE },
      { item: 'schrott-ersatzteil', qty: 10, price: 21, when: DEXTER_RIVALE },
    ],
  },
  'vinyl-vincent': {
    id: 'vinyl-vincent', name: 'Vinyl-Vincents Plattenkiste', owner: 'vinyl-vincent', faction: 'unterstadt', open: { time: ['tag', 'abend'] },
    stock: [
      { item: 'vinyl-platte', qty: 2, price: 150 },
      { item: 'schallplatte-01', qty: 1, price: 180 },
      { item: 'schallplatte-02', qty: 1, price: 260 },
      { item: 'vhs-kassette', qty: 2, price: 30 },
    ],
  },
  'imbiss-loetkolben': {
    id: 'imbiss-loetkolben', name: 'Imbiss „Lötkolben“', faction: 'unterstadt', open: { time: ['tag', 'abend', 'nacht'] },
    stock: [
      { item: 'synth-nudeln', qty: 15 },
      { item: 'roestzwiebeln', qty: 10 },
      { item: 'nougatbombe', qty: 10, when: NOUGAT_DA },
      { item: 'synth-kaffee', qty: 10 },
      { item: 'volt-limo', qty: 6, price: 14 },
    ],
  },
  flohmarkt: {
    id: 'flohmarkt', name: 'Sonntags-Flohmarkt', faction: 'unterstadt', open: { all: [{ weekday: 'so' }, { time: ['morgen', 'tag'] }] },
    buyRate: 0.45,
    stock: [
      { item: 'baseballschlaeger', qty: 1, price: 50 },
      { item: 'akkordeon-balg', qty: 1 },
      { item: 'alte-euromuenze', qty: 2 },
      { item: 'aufzieh-roboter', qty: 2 },
      { item: 'bandshirt', qty: 2 },
      { item: 'gesetzbuch', qty: 1, price: 25 },
      { item: 'haiku-buechlein', qty: 2 },
      { item: 'murmelbeutel', qty: 3 },
      { item: 'plueschmoehre', qty: 2 },
      { item: 'rechenfibel', qty: 2 },
      { item: 'sternkarte', qty: 1 },
      { item: 'vhs-kassette', qty: 3, price: 20 },
      { item: 'vinyl-platte', qty: 1, price: 110 },
      // Ware vom Chrome-Boulevard, die in Akt 1 nur hier auftaucht (world.md §11.6), im 28-Tage-Takt wechselnd.
      { item: 'seidentuch-rot', qty: 1, price: 200, when: { cycleDay: 7 } },
      { item: 'kassenbuch', qty: 1, price: 70, when: { cycleDay: 7 } },
      { item: 'seidentuch-blau', qty: 1, price: 200, when: { cycleDay: 14 } },
      { item: 'taschenspiegel-gold', qty: 1, price: 330, when: { cycleDay: 14 } },
      { item: 'seidentuch-gruen', qty: 1, price: 200, when: { cycleDay: 21 } },
      { item: 'planungsbrett-glas', qty: 1, price: 280, when: { cycleDay: 21 } },
      { item: 'perlenkette', qty: 1, price: 950, when: { cycleDay: 28 } },
      { item: 'seidentuch-rot', qty: 1, price: 200, when: { cycleDay: 28 } },
    ],
  },

  // --- Lötgassen -------------------------------------------------------------------------------------------
  'loetzinn-laden': {
    id: 'loetzinn-laden', name: 'Lötzinns Laden', owner: 'mira-loetzinn', faction: 'unterstadt', open: { clockBetween: [480, 1140] },
    ripperdoc: { fee: 80 },
    stock: [
      { item: 'kabelpeitsche', qty: 1 },
      { item: 'schockstab', qty: 1 },
      { item: 'schockpistole', qty: 1 },
      { item: 'netzwerfer', qty: 1 },
      { item: 'hackmodul-basis', qty: 1 },
      { item: 'stoersender', qty: 1 },
      { item: 'kopf-strassenfunk', qty: 1 },
      { item: 'augen-restlicht', qty: 1 },
      { item: 'arme-datenbuchse', qty: 1 },
      { item: 'nerven-ueberspannungsschutz', qty: 1 },
      { item: 'nanogel', qty: 4 },
      { item: 'stoergranate', qty: 4 },
      { item: 'dietrich-chip', qty: 3 },
      { item: 'reparaturset', qty: 4 },
      { item: 'stirnlampe', qty: 1 },
      { item: 'datenkristall', qty: 2 },
      { item: 'faxpapier', qty: 4 },
      { item: 'kamera-objektiv', qty: 1 },
      { item: 'loetkolben-gold', qty: 1 },
      { item: 'pinzetten-set', qty: 2 },
      { item: 'retro-tastatur', qty: 1 },
      { item: 'zerberster-oel', qty: 3 },
      { item: 'kurier-funk', qty: 1 },
    ],
  },
  'dantes-werkstatt': {
    id: 'dantes-werkstatt', name: 'Dantes Werkstatt', owner: 'dante', faction: 'crew-hunter',
    open: { all: [TAGSUEBER, { quest: 'main-1-dante', state: 'done' }] },
    ripperdoc: {
      fee: 50, freeWhen: { all: [{ hearts: 'dante', min: 2 }, { not: DANTE_RIVALE }] },
      refuseWhen: DANTE_RIVALE, refuseText: 'Dante hält den Lötkolben wie eine Waffe. „Ich bau dir nicht mal ’ne Batterie ein. Geh zu Ripper. Lass dir ein Rücklicht ins Auge schrauben.“',
    },
    // Rivalität: doppelte Preise.
    priceRules: [{ when: DANTE_RIVALE, discount: -100, note: 'Dantes „Freundschaftspreis“ für Ex-Freunde: das Doppelte.' }],
    stock: [
      { item: 'reparaturset', qty: 2, price: 30 },
      { item: 'kopf-ruhepol', qty: 1, when: { hearts: 'dante', min: 6 } },
      // Ab Akt 2 Cyberware-Rabatt bei Dante (world.md §3.5)
      { item: 'kopf-strassenfunk', qty: 1, price: 550, when: ACT2 },
      { item: 'nerven-ueberspannungsschutz', qty: 1, price: 680, when: ACT2 },
    ],
  },

  // --- Rohrsiedlung ----------------------------------------------------------------------------------------
  suppenkueche: {
    id: 'suppenkueche', name: 'Mutter Brühes Suppenküche', owner: 'mutter-bruehe', faction: 'unterstadt', open: TAGSUEBER,
    buyRate: 0.3, buys: ['verbrauch'],
    stock: [
      { item: 'bruehes-suppe', qty: 30 },
      { item: 'synth-kaffee', qty: 10, price: 2 },
    ],
  },

  // --- Bahnhof Mitte ---------------------------------------------------------------------------------------
  'fraeulein-pixel': {
    id: 'fraeulein-pixel', name: 'Fräulein Pixels Fotoautomat', owner: 'fraeulein-pixel', faction: 'unterstadt', open: { time: ['abend', 'nacht'] },
    stock: [
      { item: 'dietrich-chip', qty: 4 },
      { item: 'dietrich-set', qty: 1 },
      { item: 'ausweis-oberstadt', qty: 1, when: { noItem: 'ausweis-oberstadt' } },
    ],
  },
  fundbuero: {
    id: 'fundbuero', name: 'Fundbüro Bahnhof Mitte', owner: 'gerda-gleis', open: { time: ['morgen', 'tag'] },
    stock: [
      { item: 'handschellen', qty: 2 },
      { item: 'peilsender', qty: 2 },
      { item: 'magnet-stoerer', qty: 1 },
      { item: 'murmelbeutel', qty: 1 },
      { item: 'kapuzenpulli', qty: 1, price: 30 },
      { item: 'comic-heft', qty: 1, price: 8 },
      { item: 'feuerloescher-mini', qty: 1, price: 15 },
    ],
  },
  ticketautomat: {
    id: 'ticketautomat', name: 'Ticketautomat', buys: [],
    stock: [
      { item: 'u-bahn-ticket' },
      { item: 'monatskarte', when: { noItem: 'monatskarte' } },
    ],
  },
  'kiosk-bahnhof': {
    id: 'kiosk-bahnhof', name: 'Bahnhofskiosk', faction: 'unterstadt', open: TAGSUEBER,
    stock: [
      { item: 'zeitung-papier', qty: 10 },
      { item: 'synth-kaffee', qty: 10 },
      { item: 'chips-tuete', qty: 8 },
      { item: 'nougatbombe', qty: 8, when: NOUGAT_DA },
      { item: 'u-bahn-ticket' },
    ],
  },
  'netzcafe-datenkruemel': {
    id: 'netzcafe-datenkruemel', name: 'Netzcafé Datenkrümel', faction: 'unterstadt',
    stock: [
      { item: 'hackmodul-basis', qty: 1, price: 270 },
      { item: 'datenkristall', qty: 2 },
      { item: 'enzyklopaedie-chip', qty: 1 },
      { item: 'katzenvideo-archiv', qty: 2 },
      { item: 'logik-raetsel-modul', qty: 1 },
      { item: 'schach-modul', qty: 1 },
      { item: 'synth-kaffee', qty: 10, price: 5 },
      // „unter der Hand“: nur, wenn man in der Unterstadt bekannt ist oder als Gossenkind
      { item: 'raubkopie-stick', qty: 2, when: { any: [{ rep: 'unterstadt', min: 10 }, { origin: 'origin-gossenkind' }, { playerIs: 'vex' }] } },
    ],
  },

  // --- Hafenkante ------------------------------------------------------------------------------------------
  'salzige-grete': {
    id: 'salzige-grete', name: 'Salzige Gretes Fischstand', owner: 'salzige-grete', faction: 'unterstadt', open: { time: ['morgen', 'tag'] },
    stock: [
      { item: 'koeder', qty: 20 },
      { item: 'algen-chips', qty: 10 },
      { item: 'kaeseecke', qty: 4, price: 5 },
    ],
  },
  'rennhallen-kiosk': {
    id: 'rennhallen-kiosk', name: 'Rennhallen-Kiosk', open: { time: ['tag', 'abend', 'nacht'] },
    stock: [
      { item: 'volt-limo', qty: 10 },
      { item: 'nougatbombe', qty: 10, when: NOUGAT_DA },
      { item: 'synth-kaffee', qty: 8 },
      { item: 'gleitbrett', qty: 1 },
      { item: 'kurier-funk', qty: 1, price: 85 },
      { item: 'drohnen-propeller', qty: 2, price: 24 },
    ],
  },
  'garage-rostlaube': {
    id: 'garage-rostlaube', name: 'Garage an der Hafenkante', owner: 'kaeptn-nebelhorn', open: { time: ['tag', 'abend'] },
    stock: [
      { item: 'reparaturset', qty: 3 },
      { item: 'schrott-ersatzteil', qty: 8 },
      { item: 'oelkaennchen', qty: 2 },
      { item: 'postkarte-meer', qty: 2 },
    ],
  },

  // --- Stufenplatz -----------------------------------------------------------------------------------------
  'imbisswagen-stufenplatz': {
    id: 'imbisswagen-stufenplatz', name: 'Brezel-Imbisswagen', open: TAGSUEBER,
    stock: [
      { item: 'brezel', qty: 20 },
      { item: 'synth-kaffee', qty: 10 },
      { item: 'volt-limo', qty: 6, price: 14 },
    ],
  },
  'salon-gina': {
    id: 'salon-gina', name: 'Salon Gina', owner: 'stylistin-gina', open: BIS_19,
    stock: [
      { item: 'outfit-ordentlich', qty: 1 },
      { item: 'outfit-party', qty: 1, when: ACT2 },
      { item: 'haarspray-deluxe', qty: 3 },
      { item: 'samtfliege', qty: 1 },
      { item: 'schwarzer-lippenstift', qty: 1 },
    ],
  },
  'nx1-fanshop': {
    id: 'nx1-fanshop', name: 'NX-1-Fanshop', faction: 'nx1-medien', open: { time: ['morgen', 'tag'] },
    stock: [
      { item: 'mikrofon-puschel', qty: 3 },
      { item: 'reporter-notizbuch', qty: 3 },
      { item: 'teleprompter-chip', qty: 1 },
    ],
  },

  // --- Glasarkaden -----------------------------------------------------------------------------------------
  'satin-und-chrom': {
    id: 'satin-und-chrom', name: 'Satin & Chrom', owner: 'madame-satin', open: BIS_19,
    stock: [
      { item: 'outfit-ordentlich', qty: 1, price: 270 },
      { item: 'outfit-party', qty: 1, when: ACT2 },
      { item: 'schwarzer-lippenstift', qty: 2, price: 45 },
      { item: 'gruene-augenlinse', qty: 1 },
      { item: 'haarspray-deluxe', qty: 2 },
      { item: 'kapuzenpulli', qty: 2 },
      { item: 'parfuem-ozon', qty: 2 },
      { item: 'rosa-seidenhemd', qty: 1 },
      { item: 'samtfliege', qty: 2 },
      { item: 'sonnenbrille-gold', qty: 1 },
      { item: 'teddyfell-buerste', qty: 1 },
      { item: 'augen-preisscanner', qty: 1 },
      { item: 'haut-neonnaehte', qty: 1 },
    ],
  },
  'quantum-schauraum': {
    id: 'quantum-schauraum', name: 'Quantum-Schauraum', owner: 'herr-glanz', faction: 'quantum', open: { clockBetween: [600, 1260] },
    stock: [
      { item: 'nanogel', qty: 4, price: 95 },
      { item: 'medipflaster', qty: 6, price: 28 },
      { item: 'nexi-pluesch', qty: 5 },
      { item: 'goldknauf-replik', qty: 2 },
      { item: 'laborkittel-neu', qty: 1 },
      { item: 'chrome-10-gutschein', qty: 3, when: { weekday: 'di' } },
    ],
  },
  feinkost: {
    id: 'feinkost', name: 'Feinkost Glasarkaden', open: { clockBetween: [420, 1260] },
    stock: [
      { item: 'echtobst-apfel', qty: 6 },
      { item: 'frisches-gemuese', qty: 4 },
      { item: 'blumensamen', qty: 3 },
      { item: 'edelbrause', qty: 4 },
      { item: 'orchidee', qty: 1 },
      { item: 'hofhonig', qty: 2, price: 38 },
    ],
  },
  'cafe-sahnehaube': {
    id: 'cafe-sahnehaube', name: 'Café Sahnehaube', owner: 'barista-perle', open: TAGSUEBER,
    stock: [
      { item: 'sahnetorte-stueck', qty: 8 },
      { item: 'edelbrause', qty: 4, price: 48 },
      { item: 'synth-kaffee', qty: 10, price: 9 },
      { item: 'liebesroman', qty: 2, price: 20 },
    ],
  },
  pixelpalast: {
    id: 'pixelpalast', name: 'Pixelpalast-Preistheke',
    open: { any: [{ time: ['tag', 'abend'] }, { all: [{ weekday: ['fr', 'sa'] }, { time: 'nacht' }] }] },
    buys: [],
    stock: [
      { item: 'plueschmoehre', qty: 3 },
      { item: 'aufzieh-roboter', qty: 2 },
      { item: 'volt-limo', qty: 6, price: 15 },
    ],
  },

  // --- Eisenhof --------------------------------------------------------------------------------------------
  gerichtskantine: {
    id: 'gerichtskantine', name: 'Gerichtskantine', faction: 'ordnungsdienst', open: { time: ['morgen', 'tag'] },
    stock: [
      { item: 'synth-kaffee', qty: 15, price: 2 },
      { item: 'kraeuter-gebaeck', qty: 4 },
      { item: 'gesetzbuch', qty: 2 },
      { item: 'stempelkissen', qty: 3 },
    ],
  },

  // --- Digitech-Areal --------------------------------------------------------------------------------------
  'hartlauf-restposten': {
    id: 'hartlauf-restposten', name: 'Hartlaufs Digitech-Restposten', owner: 'direktorin-hartlauf', faction: 'digitech', open: { time: 'tag' },
    stock: [
      { item: 'stoergranate', qty: 6, price: 42 },
      { item: 'zielfernrohr-linse', qty: 1 },
      { item: 'alter-neurochip', qty: 2, price: 65 },
      { item: 'nerven-zeitlupe', qty: 1 },
      { item: 'haut-tarnlack', qty: 1, price: 1200, when: { rep: 'digitech', min: 50 } },
      { item: 'haut-tarnlack', qty: 1, when: { not: { rep: 'digitech', min: 50 } } },
      { item: 'impulsgewehr', qty: 1, when: { all: [ACT2, { rep: 'digitech', min: 20 }] } },
      { item: 'datenlanze', qty: 1, when: ACT2 },
    ],
  },

  // --- Kanal-Sammler ---------------------------------------------------------------------------------------
  'fluss-frieda': {
    id: 'fluss-frieda', name: 'Fluss-Friedas Floßladen', owner: 'fluss-frieda', faction: 'kanalvolk', open: { time: ['morgen', 'tag'] },
    stock: [
      { item: 'pilzsuppe', qty: 10 },
      { item: 'stirnlampe', qty: 2, price: 55 },
      { item: 'staubmaske', qty: 3 },
      { item: 'outfit-kanal', qty: 1 },
      { item: 'haut-filtermembran', qty: 1 },
      { item: 'schrott-ersatzteil', qty: 5, price: 9 },
    ],
  },

  // --- Flutmauer -------------------------------------------------------------------------------------------
  'henk-angler': {
    id: 'henk-angler', name: 'Henks Anglerbedarf', owner: 'henk-angler', open: TAGSUEBER,
    stock: [
      { item: 'koeder', qty: 20 },
      { item: 'angel-einfach', qty: 2 },
      { item: 'angel-profi', qty: 1, when: { hearts: 'henk-angler', min: 3 } },
      { item: 'postkarte-meer', qty: 3 },
      { item: 'sonnencreme', qty: 2 },
    ],
  },
};

export const part: ContentPart = { shops };
