// Integration Akt 1: Ziele, auf die Akt-1-Inhalte verweisen, die aber kein Bereichsagent angelegt hat.
// - Nebenfiguren, die nur sprechen (oder kurz auf einer Karte stehen),
// - zwei Händler am Schrottmarkt (world.md §3.5: Elektronikstand, Marlas Karawanenstand am Samstag),
// (Die sechs Akt-2-Platzhalterquests sind entfernt; die echten Quests liegen in quest-pers-23 und quest-side-23-a.)
import type { NpcDef, ShopDef } from '../../../modules/contracts';
import type { ContentPart } from '../../part';

const npc = (def: NpcDef): NpcDef => ({ maxHearts: 5, ...def });

const npcs: NpcDef[] = [
  npc({
    id: 'kabelbrand-roadie', name: 'Schrammel', unknownName: 'Roadie mit Kabelbrand-Tattoo', portrait: 'kabelbrand-roadie',
    sprite: 'passant-punk-walk',
    bio: 'Alter Roadie von „Kabelbrand“. Hütet das letzte Tour-Shirt von 2081 wie andere Leute ihre Nieren.',
  }),
  npc({
    id: 'chrome-haushaelterin', name: 'Frau Wischmann', unknownName: 'Haushälterin der Chromes', portrait: 'chrome-haushaelterin',
    bio: 'Dreißig Jahre Haus Chrome. Kämmt Teppichfransen, kennt jedes Geheimnis und erzählt alles – für den richtigen Preis.',
  }),
  npc({
    id: 'quantum-fahrer', name: 'Quantum-Fahrer', unknownName: 'Mann im Quantum-Anzug', portrait: 'quantum-fahrer',
    sprite: 'passant-anzug-walk', faction: 'quantum',
    bio: 'Chauffeur einer Quantum-Limousine. Trinkt zu viel, redet zu viel und hält das für Diskretion.',
  }),
  npc({
    id: 'wachmann-brezel', name: 'Wachmann Brezel', unknownName: 'Wachmann mit Brezel', portrait: 'wachmann-brezel',
    sprite: 'quantum-wachmann-walk', faction: 'quantum',
    bio: 'Quantum-Wachmann am Stufenplatz. Seine Pause ist heilig, seine Blase nicht.',
  }),
];

const shops: ShopDef[] = [
  {
    id: 'elektronikstand', name: 'Elektronikstand', faction: 'unterstadt', open: { time: ['morgen', 'tag', 'abend'] },
    stock: [
      { item: 'reparaturset', qty: 4 },
      { item: 'dietrich-chip', qty: 3 },
      { item: 'datenkristall', qty: 2 },
      { item: 'alter-neurochip', qty: 1 },
      { item: 'defekter-neurochip', qty: 3 },
      { item: 'drohnen-propeller', qty: 3 },
      { item: 'ersatz-rotor', qty: 1 },
      { item: 'schrott-ersatzteil', qty: 10 },
      { item: 'stirnlampe', qty: 1 },
      { item: 'hackmodul-basis', qty: 1 },
    ],
  },
  {
    id: 'marla-karawane', name: 'Marlas Karawanenstand', owner: 'marla-sand', faction: 'unterstadt',
    open: { all: [{ weekday: 'sa' }, { time: ['morgen', 'tag'] }] },
    stock: [
      { item: 'kaktusfrucht', qty: 6 },
      { item: 'staubmaske', qty: 3 },
      { item: 'hofhonig', qty: 4 },
      { item: 'echtobst-apfel', qty: 6 },
      { item: 'frisches-gemuese', qty: 4 },
      { item: 'blumensamen', qty: 4 },
      { item: 'outfit-oednis', qty: 1 },
      { item: 'alte-euromuenze', qty: 2 },
    ],
  },
];

export const part: ContentPart = {
  npcs: Object.fromEntries(npcs.map((n) => [n.id, n])),
  shops: Object.fromEntries(shops.map((s) => [s.id, s])),
};
