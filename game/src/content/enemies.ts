// TESTINHALT – Gegner und Kampffähigkeiten (design.md §3.7). Deckt alle Kampfsysteme ab (Nah-/Fernkampf, Hack,
// Unterstützung, Fläche, Zustände, Moral, Bossphasen), bis der echte Inhalt aus world.md §8 kommt.
import type { AbilityDef, EnemyDef } from '../modules/contracts';

export const ABILITIES: Record<string, AbilityDef> = {
  'test-hieb': {
    id: 'test-hieb', name: 'Harter Hieb', description: 'Kräftiger Nahkampfschlag.',
    kind: 'nahkampf', ap: 1, target: 'enemy', range: 1, damage: 2, attribute: 'koerper',
  },
  'test-schnellschuss': {
    id: 'test-schnellschuss', name: 'Schnellschuss', description: 'Zwei schnelle Schüsse mit etwas weniger Präzision.',
    kind: 'fernkampf', ap: 1, target: 'enemy', range: 5, damage: 2, attribute: 'reflexe', hit: -10, cooldown: 1,
  },
  'test-stoersignal': {
    id: 'test-stoersignal', name: 'Störsignal', description: 'Hackt das Ziel, das eine Runde aussetzt.',
    kind: 'hack', ap: 2, target: 'enemy', range: 4, attribute: 'technik', status: { id: 'gehackt', turns: 1, chance: 0.6 }, cooldown: 2,
  },
  'test-laserlinie': {
    id: 'test-laserlinie', name: 'Laserlinie', description: 'Zielt sichtbar vor: Das Ziel ist zwei Runden markiert.',
    kind: 'fernkampf', ap: 1, target: 'enemy', range: 8, status: { id: 'markiert', turns: 2 }, cooldown: 2,
  },
  'test-flicken': {
    id: 'test-flicken', name: 'Flicken', description: 'Repariert einen Verbündeten in der Nähe.',
    kind: 'support', ap: 1, target: 'ally', range: 4, heal: 8, cooldown: 1,
  },
  'test-schildblase': {
    id: 'test-schildblase', name: 'Schildblase', description: 'Ein Verbündeter ist eine Runde geschützt.',
    kind: 'support', ap: 1, target: 'ally', range: 3, status: { id: 'geschuetzt', turns: 1 }, cooldown: 2,
  },
  'test-funkenregen': {
    id: 'test-funkenregen', name: 'Funkenregen', description: 'Funken auf ein Feld und alle Nachbarn – es brennt.',
    kind: 'fernkampf', ap: 2, target: 'area', range: 5, radius: 1, damage: 3, status: { id: 'brennt', turns: 2 }, cooldown: 3,
  },
  'test-rundumschlag': {
    id: 'test-rundumschlag', name: 'Rundumschlag', description: 'Trifft alle angrenzenden Gegner.',
    kind: 'nahkampf', ap: 2, target: 'area', range: 0, radius: 1, damage: 1, attribute: 'koerper',
  },
  'test-anbruellen': {
    id: 'test-anbruellen', name: 'Anbrüllen', description: 'Lässt die Party kurz zusammenzucken: Ziel ist eine Runde betäubt.',
    kind: 'trick', ap: 1, target: 'enemy', range: 3, status: { id: 'betaeubt', turns: 1, chance: 0.5 }, uses: 1,
  },
};

export const ENEMIES: Record<string, EnemyDef> = {
  'test-schlaeger': {
    id: 'test-schlaeger', name: 'Schläger', sprite: 'wache-walk', faction: 'unterstadt', level: 1,
    stats: {
      hp: 16, armor: 1, morale: 50,
      attributes: { technik: 2, koerper: 5, reflexe: 4, ausstrahlung: 2, strasse: 4 },
      weapon: { kind: 'nahkampf', damage: 4, range: 1 },
      abilities: ['test-hieb'],
    },
    ai: 'aggressiv', xp: 15, credits: [5, 12], loot: [{ item: 'synth-kaffee', chance: 0.3 }],
  },
  'test-schuetze': {
    id: 'test-schuetze', name: 'Scharfschützin', sprite: 'vega-walk', faction: 'unterstadt', level: 2,
    stats: {
      hp: 14, armor: 0, morale: 40,
      attributes: { technik: 3, koerper: 3, reflexe: 7, ausstrahlung: 2, strasse: 4 },
      weapon: { kind: 'fernkampf', damage: 4, range: 7 },
      abilities: ['test-laserlinie'],
    },
    ai: 'vorsichtig', xp: 20, credits: [8, 15],
  },
  'test-drohne': {
    id: 'test-drohne', name: 'Wachdrohne', level: 2,
    stats: {
      hp: 12, armor: 2,
      attributes: { technik: 5, koerper: 2, reflexe: 6, ausstrahlung: 1, strasse: 1 },
      weapon: { kind: 'smart', damage: 3, range: 4 },
      abilities: [],
    },
    ai: 'aggressiv', xp: 15,
  },
  'test-sani': {
    id: 'test-sani', name: 'Flickerin', sprite: 'alesa-walk', level: 2,
    stats: {
      hp: 14, armor: 1, morale: 40,
      attributes: { technik: 6, koerper: 3, reflexe: 5, ausstrahlung: 3, strasse: 2 },
      weapon: { kind: 'smart', damage: 2, range: 4 },
      abilities: ['test-flicken', 'test-schildblase'],
    },
    ai: 'support', xp: 15, credits: [5, 10],
  },
  'test-boss': {
    id: 'test-boss', name: 'Ripper', sprite: 'ripper-walk', portrait: 'ripper', faction: 'unterstadt', level: 3,
    stats: {
      hp: 45, armor: 2,
      attributes: { technik: 5, koerper: 5, reflexe: 6, ausstrahlung: 4, strasse: 6 },
      weapon: { kind: 'fernkampf', damage: 5, range: 5 },
      abilities: ['test-anbruellen'],
    },
    ai: 'boss', xp: 60, credits: [40, 60], loot: [{ item: 'synth-kaffee', chance: 1, qty: 2 }],
    phases: [{ below: 0.5, ai: 'aggressiv', abilities: ['test-funkenregen', 'test-rundumschlag'], line: 'Das ist mir zu heiß!' }],
  },
};
