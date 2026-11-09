// Händler des Pakets pkg-staubstrasse (world.md §3.5 „Händler“, §9 „Bezug“; Plan design/plan/act23.json → shops):
//   rudis-diner  · rudis-diner/tresen        · Rudi, M/T/A (tagsüber über die Durchreiche), nachts zu
//   konvoi       · staubstrasse/konvoi-halt  · Mo/Do tagsüber; nach side-oednis-frieden Wunschware
//   radio-rost   · funkturm-ruine/plattenarchiv · Opa Funk, immer außer nachts
// Dazu der Diner-Klassiker `hofhonig-pfannkuchen` (world.md nennt ihn als Ware, als Gegenstand gab es ihn noch nicht).
import type { Condition, ItemDef, ShopDef } from '../../../modules/contracts';
import type { ContentPart } from '../../part';

const NICHT_NACHTS: Condition = { time: ['morgen', 'tag', 'abend'] };
const KONVOI_DA: Condition = { all: [{ weekday: ['mo', 'do'] }, { time: 'tag' }] };
const FRIEDEN: Condition = { quest: 'side-oednis-frieden', state: 'done' };

const items: Record<string, ItemDef> = {
  'hofhonig-pfannkuchen': {
    id: 'hofhonig-pfannkuchen', name: 'Hofhonig-Pfannkuchen', category: 'verbrauch', icon: 'hofhonig', price: 18,
    giftTags: ['essen', 'suess', 'warm', 'oednis'],
    description: 'Drei Pfannkuchen, so groß wie Radkappen, ertränkt in Hofhonig. Rudi backt sie seit dem Absturz nach demselben Rezept. +40 LP.',
    use: { label: 'Futtern', heal: 40, text: 'Klebrig, heiß, zu groß. Du schaffst trotzdem alle drei. Rudi nickt anerkennend durch die Durchreiche.' },
  },
};

const shops: Record<string, ShopDef> = {
  'rudis-diner': {
    id: 'rudis-diner', name: 'Rudis Diner – Pfannkuchen seit dem Absturz', owner: 'rudi', faction: 'aussiedler', open: NICHT_NACHTS,
    stock: [
      { item: 'hofhonig-pfannkuchen', qty: 8 },
      { item: 'synth-kaffee', qty: 12, price: 3 },
      { item: 'volt-limo', qty: 6 },
      { item: 'medipflaster', qty: 6 },
      { item: 'reparaturset', qty: 3 },
      { item: 'staubmaske', qty: 3 },
      { item: 'sonnencreme', qty: 4 },
      { item: 'hofhonig', qty: 2, when: FRIEDEN },
    ],
  },
  konvoi: {
    id: 'konvoi', name: 'Konvoi-Halt', faction: 'aussiedler', open: KONVOI_DA,
    stock: [
      { item: 'postkarte-meer', qty: 3 },
      { item: 'vinyl-platte', qty: 1, price: 130 },
      { item: 'strandclub-prospekt', qty: 5, when: { act: 2 } },
      { item: 'schallplatte-11', qty: 1, price: 90, when: { noItem: 'schallplatte-11' } },
      { item: 'bandshirt', qty: 2 },
      { item: 'kaktusfrucht', qty: 6 },
      { item: 'muschel-frisch', qty: 2, price: 30 },
      { item: 'sandflasche', qty: 3 },
      { item: 'sonnencreme', qty: 4 },
      { item: 'wuestenrose', qty: 3 },
      { item: 'outfit-oednis', qty: 1 },
      // Wunschware nach dem Frieden (world.md §6.3, side-oednis-frieden: „Konvoi bringt Wunschware“)
      { item: 'wasserfilter', qty: 2, when: FRIEDEN },
      { item: 'nanogel', qty: 2, when: FRIEDEN },
      { item: 'vinyl-platte', qty: 2, price: 100, when: FRIEDEN },
      { item: 'edelbrause', qty: 2, when: FRIEDEN },
    ],
  },
  'radio-rost': {
    id: 'radio-rost', name: 'Radio Rost – Plattenarchiv', owner: 'opa-funk', faction: 'aussiedler', open: NICHT_NACHTS,
    stock: [
      { item: 'vinyl-platte', qty: 2, price: 115 },
      { item: 'reparaturset', qty: 3 },
      { item: 'stoersender', qty: 1 },
      { item: 'kurier-funk', qty: 1 },
      { item: 'akkordeon-balg', qty: 1 },
      { item: 'sternkarte', qty: 2 },
      { item: 'synth-kaffee', qty: 4, price: 2 },
    ],
  },
};

export const part: ContentPart = { items, shops };
