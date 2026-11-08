// TESTINHALT – Perks und Cyberware (design.md §3.1, world.md §2.5/§9.2). Echter Inhalt: je Attribut 4 Perks mit
// Attributwert und Mindeststufe. Die Erweiterungsfelder (Mindeststufe, Kontextregeln, Merkmale …) beschreibt
// modules/character/types.ts.
import type { CharacterCyberwareDef, CharacterPerkDef } from '../modules/character/types';

export const PERKS: Record<string, CharacterPerkDef> = {
  // Start-Perk der fertigen Spielfigur Vex (world.md §2.1a); nicht lernbar.
  dachlaeuferin: {
    id: 'dachlaeuferin', name: 'Dachläuferin', exclusive: true, attribute: 'reflexe', min: 6,
    description: 'Sprünge und Fluchtwege über Dächer ohne Check. Kurieraufträge +15 % Credits.',
    autoPass: [{ attribute: 'reflexe', tags: ['dach'], maxThreshold: 10 }], traits: ['kurier-bonus'],
  },
  'test-bastler': {
    id: 'test-bastler', name: 'Bastler', description: '+1 auf Hacken-Checks.', attribute: 'technik', min: 4,
    checkBonus: [{ tags: ['hacken'], value: 1 }],
  },
  'test-zaeh': {
    id: 'test-zaeh', name: 'Zäh', description: '+5 LP. Verklemmte Kisten bis Schwelle 5 gehen ohne Check auf.',
    attribute: 'koerper', min: 4, combat: { hp: 5 }, autoPass: [{ attribute: 'koerper', tags: ['kiste'], maxThreshold: 5 }],
  },
  'test-feilscher': {
    id: 'test-feilscher', name: 'Feilscher', description: '10 % Rabatt bei Händlern, Geschenke wirken 25 % stärker.',
    attribute: 'ausstrahlung', min: 4, level: 2, shopDiscount: 10, giftBonus: 25,
  },
};

export const CYBERWARE: Record<string, CharacterCyberwareDef> = {
  'test-optik': {
    id: 'test-optik', name: 'Test-Optik', slot: 'augen', description: '+1 Reflexe, +5 Treffer. +1 auf Schlösser in der Unterstadt.',
    attributes: { reflexe: 1 }, combat: { hit: 5 }, installFee: 200,
    checkBonus: [{ tags: ['schloss'], value: 1, districts: ['test-unterstadt'] }],
  },
};
