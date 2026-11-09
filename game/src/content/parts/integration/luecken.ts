// Integration Akt 1: Ziele, auf die Akt-1-Inhalte verweisen, die aber kein Bereichsagent angelegt hat.
// - Nebenfiguren, die nur sprechen (oder kurz auf einer Karte stehen),
// - zwei Händler am Schrottmarkt (world.md §3.5: Elektronikstand, Marlas Karawanenstand am Samstag),
// - Platzhalter für persönliche Quests und Nebenquests, die laut world.md erst in Akt 2 spielen.
//   Sie werden in Akt 1 höchstens gestartet; ihr einziger Schritt verweist auf Akt 2. Wer Akt 2 baut, ersetzt
//   den Eintrag (gleiche ID) durch die echte Quest und löscht ihn hier.
import type { NpcDef, QuestDef, ShopDef } from '../../../modules/contracts';
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

/** Akt-2-Platzhalter: Titel und Kurztext aus world.md §5/§6, ein Schritt mit Verweis auf Akt 2. */
const later = (id: string, kind: QuestDef['kind'], title: string, summary: string, giver?: string): QuestDef => ({
  id, kind, title, summary, act: 2, ...(giver ? { giver } : {}),
  steps: [{ id: 'akt-2', text: `${summary} (Geht in Akt 2 weiter.)`, done: { flag: `${id}-akt2-gebaut` } }],
  autoComplete: true,
});

const quests: QuestDef[] = [
  later('pers-delya-quelle', 'personal', 'Delyas Quelle', 'Drei „Kanal-Schlafwandler“ finden und zu Dante bringen.', 'delya-delloraine'),
  later('pers-collin-pixel', 'personal', 'Pixel-Pete', 'Den KI-Moderator „Pixel-Pete“ entlarven – live und vor allen.', 'collin-charleston'),
  later('pers-ripper-taschenuhr', 'personal', 'Die Taschenuhr', 'Die Taschenuhr von Rippers Vater aus Sybellas Boutique holen.', 'ripper'),
  later('pers-gustav-alte-liebe', 'personal', 'Alte Liebe', 'Elsa im Aussiedlerhof finden und Gustavs Brief überbringen.', 'opa-gustav'),
  later('side-ki-fluestern', 'side', 'KI-Flüstern', 'Herausfinden, warum Oma Volts Neffe Paul so komisch höflich ist.', 'oma-volt'),
  later('side-captain-kuschel', 'side', 'Captain Kuschel', 'Wem gehört Captain Kuschel wirklich? Ein Sorgerechtsstreit um einen Teddy.', 'dante'),
];

export const part: ContentPart = {
  npcs: Object.fromEntries(npcs.map((n) => [n.id, n])),
  shops: Object.fromEntries(shops.map((s) => [s.id, s])),
  quests: Object.fromEntries(quests.map((q) => [q.id, q])),
};
