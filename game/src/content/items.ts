// TESTINHALT – Gegenstände (design.md §3.6). Symbole im Itematlas (ui/items.png) über `icon`.
import type { ItemDef } from '../modules/contracts';

export const ITEMS: Record<string, ItemDef> = {
  // Startgegenstand der fertigen Spielfigur Vex (world.md §2.1a). Tragplätze gibt es noch nicht; das Gurtzeug ist Kleidung (ID bleibt `kurierweste`).
  kurierweste: {
    id: 'kurierweste', name: "Kas' Gurtzeug", description: "Kas' altes Kurier-Gurtzeug aus schwarzem Leder, zwei Löcher zu weit geschnallt. Ringe und Karabiner für alles: Inventar +4 Plätze.",
    category: 'kleidung', icon: 'kurierweste', price: 90, giftTags: ['kleidung'], sellable: false,
    wear: { traits: ['tragplaetze-4'] },
  },
  // Startwaffe der fertigen Spielfigur Vex (Kas' Nagelpistole, world.md §2.1a/§4.7).
  nagelpistole: {
    id: 'nagelpistole', name: 'Nagelpistole', description: 'Kas\' alte Nagelpistole. Laut, zuverlässig, nagelt Pakete zu – und Stiefel fest.',
    category: 'waffe', icon: 'nagelpistole', price: 150, giftTags: ['waffe'], sellable: false,
    weapon: { kind: 'fernkampf', damage: 5, range: 4, hit: 5 },
  },
  'synth-kaffee': {
    id: 'synth-kaffee', name: 'Synth-Kaffee', description: 'Schmeckt nach Kaffee. Fast.',
    category: 'verbrauch', icon: 'synth-kaffee', price: 12, giftTags: ['essen', 'warm'],
    use: { label: 'Trinken', heal: 15, text: 'Du fühlst dich wacher.' },
  },
  'neon-messer': {
    id: 'neon-messer', name: 'Neon-Messer', description: 'Leuchtet pink. Schneidet trotzdem.',
    category: 'waffe', icon: 'neon-messer', price: 140, giftTags: ['waffe'],
    weapon: { kind: 'nahkampf', damage: 5, range: 1, hit: 5 },
  },
  datenchip: {
    id: 'datenchip', name: 'Datenchip', description: 'Verschlüsselt. Irgendwer will ihn sehr dringend zurück.',
    category: 'quest', icon: 'datenchip', price: 0, inspect: 'Auf der Rückseite klebt ein Sticker: „Nicht öffnen!“',
  },
};
