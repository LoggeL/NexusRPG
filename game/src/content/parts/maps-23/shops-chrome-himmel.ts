// Händler am Chrome-Boulevard und im Himmelsgarten (world.md §3.5, §9; act23.json shops).
// Chrome & Co. (Sybella, 10–19 Uhr), Juwelier Glanzstück (10–19 Uhr), Blumenstand im Himmelsgarten (nur Nachspiel).
// Preisregeln (ShopDef.priceRules): Seraphina ♥6 bzw. `seraphina_rabatt` gibt 10 % Rabatt in der Oberstadt
// (world.md §4.3), Sybellas Rivalität 20 % Aufschlag (`sybella_aufschlag`) bzw. Boykott bei Chrome & Co.
import type { Condition, ItemDef, ShopDef, ShopStockEntry } from '../../../modules/contracts';
import type { ContentPart } from '../../part';

const BIS_19: Condition = { clockBetween: [600, 1140] };
const RABATT: Condition = { any: [{ hearts: 'seraphina-chrome', min: 6 }, { flag: 'seraphina_rabatt' }] };
const EPILOG: Condition = { flag: 'epilog' };

/** Oberstadt-Preise: Seraphinas Rabatt, Sybellas Aufschlag aus der Rivalität – für alle Chrome-Läden. */
const CHROME_PREISE: NonNullable<ShopDef['priceRules']> = [
  { when: RABATT, discount: 10, note: 'Seraphinas Empfehlung – die Verkäuferin lächelt plötzlich echt.' },
  { when: { flag: 'sybella_aufschlag' }, discount: -20, note: 'Sybellas „Gästepreis“ für Leute, die sie nicht leiden kann.' },
];

/** Ware mit festem Tagesbestand (Preise über die Preisregeln des Ladens). */
function lux(item: string, price: number, qty?: number, when?: Condition): ShopStockEntry[] {
  return [{ item, price, ...(qty !== undefined ? { qty } : {}), ...(when ? { when } : {}) }];
}

/** Rippers Taschenuhr für pers-ripper-taschenuhr (world.md §6.5: 600 Cr in Sybellas Boutique). */
const taschenuhr: ItemDef = {
  id: 'taschenuhr-ripper', name: 'Alte Taschenuhr mit Gravur', category: 'quest', icon: 'taschenuhr-ripper', price: 0, sellable: false,
  description: 'Eine Taschenuhr aus Messing, zerkratzt, mit Sprung im Glas. Innen eine Gravur: „Für meinen Jungen. Die Zeit gehört dir.“ In Sybellas Boutique stand sie als „Vintage-Unikat, Patina echt“.',
};

const shops: Record<string, ShopDef> = {
  'chrome-und-co': {
    id: 'chrome-und-co', name: 'Chrome & Co.', owner: 'sybella-chrome', faction: 'chrome-haus', open: BIS_19, buyRate: 0.3,
    priceRules: [
      ...CHROME_PREISE,
      { when: { flag: 'sybella_boykott' }, refuse: 'Sybella dreht das Schild auf „Geschlossene Gesellschaft“. Die Gesellschaft bist nicht du.' },
    ],
    stock: [
      ...lux('seidentuch-blau', 180, 1),
      ...lux('seidentuch-rot', 180, 1),
      ...lux('seidentuch-gruen', 180, 1),
      ...lux('parfuem-ozon', 85, 3),
      ...lux('taschenspiegel-gold', 320, 1),
      ...lux('rosa-seidenhemd', 190, 1),
      ...lux('sonnenbrille-gold', 120, 2),
      ...lux('teddyfell-buerste', 75, 1),
      ...lux('kassenbuch', 65, 2),
      ...lux('edelbrause', 48, 4),
      ...lux('haut-spiegelhaut', 3000, 1),
      // Sybellas „Vintage-Unikat“: nur während pers-ripper-taschenuhr.
      { item: 'taschenuhr-ripper', price: 600, qty: 1,
        when: { all: [{ quest: 'pers-ripper-taschenuhr', state: 'active' }, { noItem: 'taschenuhr-ripper' }] } },
    ],
  },
  glanzstueck: {
    id: 'glanzstueck', name: 'Juwelier Glanzstück', faction: 'chrome-haus', open: BIS_19, buyRate: 0.35,
    priceRules: CHROME_PREISE,
    stock: [
      ...lux('taschenspiegel-gold', 300, 2),
      ...lux('perlenkette', 900, 1),
      ...lux('goldknauf-replik', 130, 2),
      ...lux('glasherz', 160, 1),
      // Selten im Sortiment: Platten aus Nachlässen, an den Festtagen des Zyklus.
      ...lux('vinyl-platte', 150, 1, { cycleDay: [7, 14, 21, 28] }),
      ...lux('schallplatte-10', 480, 1, { all: [{ cycleDay: [7, 21] }, { noItem: 'schallplatte-10' }] }),
    ],
  },
  'himmelsgarten-blumen': {
    id: 'himmelsgarten-blumen', name: 'Blumenstand im Himmelsgarten', faction: 'chrome-haus',
    open: { all: [EPILOG, { time: ['morgen', 'tag', 'abend'] }] },
    stock: [
      { item: 'orchidee', price: 55, qty: 3 },
      { item: 'blumensamen', price: 12, qty: 6 },
      { item: 'samenbombe', price: 8, qty: 6 },
      { item: 'wuestenrose', price: 25, qty: 2 },
    ],
  },
};

export const part: ContentPart = {
  shops,
  items: { 'taschenuhr-ripper': taschenuhr },
};
