// Strandclub-Bar am `das-meer` (world.md §3.5 „Händler: Strandclub-Bar (nach Ausbau)“, act23.json shops.strandclub-bar:
// Besitzer Hunter, nach side-strandclub, Getränke, Neon-Limo, Fisch vom Grill; Mixi kann aushelfen).
// Der Hotspot steht auf das-meer:strandclub-bar (maps-23/das-meer.ts) und erscheint erst, wenn side-strandclub erledigt ist.
// „Fisch vom Grill“ hat in world.md §9.3 keine ID: neu als `fisch-vom-grill` (Verbrauch, sprechend benannt).
import type { ItemDef, ShopDef } from '../../../modules/contracts';
import type { ContentPart } from '../../part';

const fisch: ItemDef = {
  id: 'fisch-vom-grill', name: 'Fisch vom Grill', category: 'verbrauch', icon: 'fisch-vom-grill', price: 18,
  giftTags: ['essen', 'warm', 'meer'],
  description: 'Frischer Fisch aus dem echten Meer, über Treibholz gegrillt, mit Zitrone, die Hunter „aus Prinzip“ teuer einkauft. +35 LP.',
  use: { label: 'Essen', heal: 35, text: 'Salz, Rauch, Sonne. Du hattest vergessen, dass Essen nach Ort schmecken kann.' },
};

const bar: ShopDef = {
  id: 'strandclub-bar', name: 'Strandclub-Bar', owner: 'hunter', faction: 'crew-hunter',
  open: { all: [{ quest: 'side-strandclub', state: 'done' }, { time: ['tag', 'abend', 'nacht'] }] },
  stock: [
    { item: 'neon-limo', qty: 10 },
    { item: 'kuehlmittel-mocktail', qty: 8 },
    { item: 'volt-limo', qty: 8 },
    { item: 'synth-kaffee', qty: 6 },
    { item: 'fisch-vom-grill', qty: 6 },
    { item: 'algen-chips', qty: 6 },
    { item: 'edelbrause', qty: 3 },
    { item: 'sonnencreme', qty: 4 },
    { item: 'postkarte-meer', qty: 5 },
    { item: 'strandclub-prospekt', qty: 5 },
    { item: 'muschel-glas', qty: 2 },
    { item: 'medipflaster', qty: 4 },
  ],
};

export const part: ContentPart = {
  items: { [fisch.id]: fisch },
  shops: { [bar.id]: bar },
};
