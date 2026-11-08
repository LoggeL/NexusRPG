// Charakter-Baukasten: deutsche Namen und Palette (design.md §3.1a). Teile-IDs und Dateien stehen im Katalog
// game/public/assets/creator/catalog.json (erzeugt von scripts/art/creator/creator_build.py); die Farbwerte sind
// dessen Paletten-Vorschlag. Teile ohne Grafik blendet der Editor aus.
import type { AppearanceTexts } from '../modules/contracts';

export const APPEARANCE: AppearanceTexts = {
  names: {
    // Körperbau
    schmal: 'Schmal', mittel: 'Mittel', kraeftig: 'Kräftig',
    // Gesicht
    'gesicht-1': 'Schlicht', 'gesicht-2': 'Markante Brauen', 'gesicht-3': 'Sommersprossen', 'gesicht-4': 'Dreitagebart',
    'gesicht-5': 'Vollbart', 'gesicht-6': 'Narbe und Lidschatten',
    // Frisur
    'haar-glatze': 'Glatze', 'haar-buzz': 'Buzzcut', 'haar-undercut': 'Undercut', 'haar-irokese': 'Irokese', 'haar-sidecut': 'Sidecut',
    'haar-pixie': 'Pixie', 'haar-bob': 'Bob', 'haar-locken-kurz': 'Kurze Locken', 'haar-wuschel': 'Wuschelkopf', 'haar-afro': 'Afro',
    'haar-schulterlang': 'Schulterlang', 'haar-lang-glatt': 'Lang und glatt', 'haar-lang-locken': 'Lange Locken',
    'haar-pferdeschwanz': 'Pferdeschwanz', 'haar-zwei-zoepfe': 'Zwei Zöpfe', 'haar-dutt': 'Dutt', 'haar-dreads': 'Dreads',
    // Oberteil
    'oben-tshirt': 'T-Shirt', 'oben-tanktop': 'Tanktop', 'oben-hemd': 'Hemd', 'oben-rollkragen': 'Rollkragen', 'oben-hoodie': 'Hoodie',
    'oben-netzshirt': 'Netzshirt', 'oben-streifenpulli': 'Streifenpulli', 'oben-gurtshirt': 'Shirt mit Gurtgeschirr',
    // Jacke
    'jacke-keine': 'Keine Jacke', 'jacke-bomber': 'Bomberjacke', 'jacke-leder': 'Lederjacke', 'jacke-langmantel': 'Langmantel',
    'jacke-jeans': 'Jeansjacke mit Aufnähern', 'jacke-kapuze': 'Kapuzenjacke mit Leuchtnähten', 'jacke-weste': 'Weste', 'jacke-sakko': 'Sakko',
    // Hose
    'hose-cargo': 'Cargohose', 'hose-jeans': 'Jeans', 'hose-flicken': 'Flickenhose', 'hose-leder': 'Lederhose', 'hose-anzug': 'Anzughose',
    'hose-rock': 'Kurzer Rock mit Strumpfhose', 'hose-overall': 'Overall (Ärmel um die Hüfte)',
    // Schuhe
    'schuhe-sneaker': 'Sneaker', 'schuhe-hightops': 'Hightops', 'schuhe-kampfstiefel': 'Kampfstiefel', 'schuhe-plateau': 'Plateauschuhe',
    'schuhe-halbschuhe': 'Halbschuhe',
    // Cyberware (sichtbar, rein kosmetisch)
    'cyber-arm-links': 'Cyber-Arm links', 'cyber-arm-rechts': 'Cyber-Arm rechts', 'cyber-augen': 'Augen-Leuchten',
    'cyber-platte': 'Gesichtsplatte', 'cyber-kabel': 'Halskabel', 'cyber-bein-keins': 'Kein Cyber-Bein',
    'cyber-bein-links': 'Cyber-Bein links', 'cyber-bein-rechts': 'Cyber-Bein rechts',
    // Tattoo
    'tattoo-keins': 'Kein Tattoo', 'tattoo-wange': 'Schaltkreis an der Wange', 'tattoo-hals': 'Barcode am Hals',
    'tattoo-arm': 'Ärmel links', 'tattoo-neonlinien': 'Neonlinien',
    // Accessoires
    'brille-keine': 'Keine Brille', 'brille-rund': 'Runde Brille', 'brille-sonnenbrille': 'Sonnenbrille', 'brille-visier': 'Visier',
    'maske-keine': 'Keine Maske', 'maske-tuch': 'Tuch mit Grinsen', 'maske-atemmaske': 'Atemmaske',
    'kappe-keine': 'Keine Kappe', 'kappe-basecap': 'Basecap', 'kappe-muetze': 'Mütze',
    kette: 'Kette', kopfhoerer: 'Kopfhörer',
  },
  palette: {
    schwarz: { name: 'Schwarz', mid: '#2a272f' },
    anthrazit: { name: 'Anthrazit', mid: '#41444d' },
    grau: { name: 'Grau', mid: '#80838c' },
    weiss: { name: 'Weiß', mid: '#e6e4df' },
    sand: { name: 'Sand', mid: '#c9b48a' },
    oliv: { name: 'Oliv', mid: '#6b7040' },
    leder: { name: 'Leder', mid: '#7a4a2a' },
    wein: { name: 'Wein', mid: '#6e1f33' },
    rot: { name: 'Rot', mid: '#c02a2a' },
    orange: { name: 'Orange', mid: '#e0702a' },
    senf: { name: 'Senf', mid: '#c9a12a' },
    waldgruen: { name: 'Waldgrün', mid: '#2f5a3a' },
    petrol: { name: 'Petrol', mid: '#1f6670' },
    marine: { name: 'Marine', mid: '#22305e' },
    jeansblau: { name: 'Jeansblau', mid: '#4a6a9a' },
    chrom: { name: 'Chrom', mid: '#a9b4c2' },
    'neon-pink': { name: 'Neon-Pink', mid: '#ff2fa8' },
    'neon-cyan': { name: 'Neon-Cyan', mid: '#22e8ff' },
    'neon-violett': { name: 'Neon-Violett', mid: '#a040ff' },
    'neon-gruen': { name: 'Neon-Grün', mid: '#5cff3a' },
  },
  hairColors: {
    schwarz: { name: 'Schwarz', mid: '#2a2428' },
    dunkelbraun: { name: 'Dunkelbraun', mid: '#4a3020' },
    kastanie: { name: 'Kastanie', mid: '#7a3a22' },
    kupfer: { name: 'Kupfer', mid: '#b8602c' },
    rot: { name: 'Rot', mid: '#b02a22' },
    dunkelblond: { name: 'Dunkelblond', mid: '#94743f' },
    blond: { name: 'Blond', mid: '#d8b868' },
    platin: { name: 'Platin', mid: '#e6dcc0' },
    grau: { name: 'Grau', mid: '#8f8c88' },
    weiss: { name: 'Weiß', mid: '#ece8e2' },
    'neon-pink': { name: 'Neon-Pink', mid: '#ff3fb0' },
    'neon-cyan': { name: 'Neon-Cyan', mid: '#3fe8ff' },
    'neon-violett': { name: 'Neon-Violett', mid: '#a64dff' },
    giftgruen: { name: 'Giftgrün', mid: '#7cff2e' },
  },
  skin: {
    'haut-1': { name: 'Sehr hell', mid: '#f3d6c4' },
    'haut-2': { name: 'Hell', mid: '#e8bfa0' },
    'haut-3': { name: 'Hellbraun', mid: '#d9a27e' },
    'haut-4': { name: 'Mittel', mid: '#c68a62' },
    'haut-5': { name: 'Warmbraun', mid: '#a86d48' },
    'haut-6': { name: 'Braun', mid: '#8a5636' },
    'haut-7': { name: 'Dunkelbraun', mid: '#6b3f27' },
    'haut-8': { name: 'Sehr dunkel', mid: '#4a2a1a' },
  },
};
