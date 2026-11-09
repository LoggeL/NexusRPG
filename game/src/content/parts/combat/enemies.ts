// Gegnertypen aller Akte (world.md §8.4) und benannte Akt-1-Gegner aus den Begegnungen (§8.7, §5.2, §6.2, §6.7).
// Werte exakt nach der Tabelle; Schaden über `foe` auf Waffenschaden + Attribut umgerechnet (siehe _foe.ts).
// Laufblätter: ohne `sprite` nimmt der Kampf `<id>-walk` (generische Blätter: design/plan/sprites-generic.md).
import type { EnemyDef } from '../../../modules/contracts';
import type { ContentPart } from '../../part';
import { byId, foe, pocket, scrap } from './_foe';

const types: EnemyDef[] = [
  // --- Straße -------------------------------------------------------------
  foe({
    id: 'abzieher', name: 'Abzieher', level: 1, hp: 18, armor: 0, ref: 4, fw: 2, morale: 50,
    dmg: [6, 8], kind: 'nahkampf', range: 1, ai: 'aggressiv', abilities: ['abzieher-abziehen'],
    credits: [5, 20], loot: [{ item: 'nougatbombe', chance: 0.25 }],
  }),
  foe({
    id: 'strassen-flitzer', name: 'Taschendieb', level: 1, hp: 14, armor: 0, ref: 7, fw: 2, morale: 30,
    dmg: [3, 5], kind: 'nahkampf', range: 1, ai: 'vorsichtig', abilities: ['strassen-flitzer-ritzer'],
    sprite: 'abzieher-walk', credits: [10, 30], loot: [{ item: 'synth-kaffee', chance: 0.3 }],
  }),
  foe({
    id: 'zerleger', name: 'Zerleger', level: 3, hp: 30, armor: 1, ref: 5, fw: 3, morale: 50,
    dmg: [6, 8], kind: 'nahkampf', range: 1, ai: 'aggressiv', abilities: ['zerleger-ausraeumen'],
    faction: 'zerleger', credits: pocket(3), loot: [scrap(0.5), { item: 'medipflaster', chance: 0.2 }],
  }),
  foe({
    id: 'rostzahn-schlaeger', name: 'Rostzahn', level: 2, hp: 26, armor: 1, ref: 4, fw: 2, morale: 60,
    dmg: [7, 9], kind: 'nahkampf', range: 2, ai: 'aggressiv', abilities: ['rostzahn-rudelhieb'],
    faction: 'rostzaehne', credits: pocket(2), loot: [{ item: 'nougatbombe', chance: 0.2 }, scrap(0.2)],
  }),
  foe({
    id: 'schrottkraehe', name: 'Schrottkrähe', level: 2, hp: 22, armor: 1, ref: 6, fw: 2, morale: 40,
    dmg: [5, 7], kind: 'fernkampf', range: 3, ai: 'vorsichtig', abilities: ['schrottkraehe-funkenregen'],
    credits: pocket(2), loot: [scrap(0.6, 2)],
  }),
  foe({
    id: 'ordnungshueter', name: 'Ordnungshüter', level: 5, hp: 40, armor: 3, ref: 5, fw: 5, morale: 80,
    dmg: [7, 9], kind: 'nahkampf', range: 1, ai: 'vorsichtig', abilities: ['ordnungshueter-platz-da'],
    faction: 'ordnungsdienst', credits: [0, 10], loot: [{ item: 'medipflaster', chance: 0.3 }],
  }),
  foe({
    id: 'staubfalke', name: 'Staubfalke', level: 6, hp: 40, armor: 2, ref: 6, fw: 3, morale: 60,
    dmg: [9, 11], kind: 'fernkampf', range: 6, ai: 'aggressiv', abilities: ['staubfalke-sandwirbel'],
    faction: 'staubfalken', credits: pocket(6), loot: [{ item: 'staubmaske', chance: 0.15 }, scrap(0.3)],
  }),

  // --- Quantum ------------------------------------------------------------
  foe({
    id: 'quantum-wachmann', name: 'Quantum-Wachmann', level: 4, hp: 34, armor: 2, ref: 5, fw: 4, morale: 70,
    dmg: [8, 10], kind: 'fernkampf', range: 6, ai: 'vorsichtig', abilities: ['quantum-wachmann-schockstufe'],
    faction: 'quantum', credits: pocket(4), loot: [{ item: 'medipflaster', chance: 0.35 }, { item: 'stoergranate', chance: 0.1 }],
  }),
  foe({
    id: 'quantum-schildtraeger', name: 'Quantum-Schildträger', level: 5, hp: 46, armor: 4, ref: 3, fw: 4, morale: 80,
    dmg: [7, 9], kind: 'nahkampf', range: 1, ai: 'vorsichtig', abilities: ['quantum-schildtraeger-schildwall'],
    faction: 'quantum', credits: pocket(5), loot: [{ item: 'medipflaster', chance: 0.3 }],
  }),
  foe({
    id: 'quantum-scharfschuetze', name: 'Quantum-Scharfschütze', level: 6, hp: 30, armor: 1, ref: 8, fw: 4, morale: 60,
    dmg: [11, 14], kind: 'fernkampf', range: 10, ai: 'vorsichtig', abilities: ['quantum-scharfschuetze-laserlinie'],
    sprite: 'quantum-wachmann-walk', faction: 'quantum', credits: pocket(6), loot: [{ item: 'nanogel', chance: 0.15 }],
  }),
  foe({
    id: 'quantum-techniker', name: 'Quantum-Technikerin', level: 5, hp: 28, armor: 1, ref: 5, fw: 7, morale: 40,
    dmg: [6, 8], kind: 'smart', range: 6, ai: 'support', abilities: ['quantum-techniker-reparatur', 'quantum-techniker-gegenhack'],
    sprite: 'quantum-wachmann-walk', faction: 'quantum', credits: pocket(5), loot: [{ item: 'reparaturset', chance: 0.3 }, scrap(0.4)],
  }),
  foe({
    id: 'quantum-betreuer', name: 'Quantum-Kundenbetreuer', level: 6, hp: 32, armor: 2, ref: 5, fw: 6, morale: 50,
    dmg: [7, 9], kind: 'nahkampf', range: 1, ai: 'support', abilities: ['quantum-betreuer-werbesprache', 'quantum-betreuer-chip-befehl'],
    sprite: 'quantum-wachmann-walk', faction: 'quantum', credits: pocket(6), loot: [{ item: 'chip-blocker', chance: 0.1 }],
  }),
  foe({
    id: 'venom-garde', name: 'Venom-Garde', level: 9, hp: 62, armor: 4, ref: 7, fw: 6, morale: 90,
    dmg: [11, 13], kind: 'nahkampf', range: 1, ai: 'aggressiv', abilities: ['venom-garde-sprungangriff'],
    sprite: 'quantum-wachmann-walk', faction: 'quantum', credits: pocket(9), loot: [{ item: 'nanogel', chance: 0.25 }],
  }),

  // --- Drohnen und Maschinen ----------------------------------------------
  foe({
    id: 'spaeherdrohne', name: 'Späherdrohne', level: 2, hp: 14, armor: 0, ref: 7, fw: 3,
    dmg: [3, 4], kind: 'fernkampf', range: 5, ai: 'vorsichtig', abilities: ['spaeherdrohne-scan'],
    faction: 'quantum', loot: [scrap(0.7)],
  }),
  foe({
    id: 'stoerdrohne', name: 'Störsender-Drohne', level: 5, hp: 20, armor: 1, ref: 6, fw: 5,
    dmg: [2, 3], kind: 'smart', range: 3, ai: 'support', abilities: ['stoerdrohne-stoerfeld'],
    sprite: 'spaeherdrohne-walk', faction: 'quantum', loot: [scrap(0.7, 2)],
  }),
  foe({
    id: 'geschuetzdrohne', name: 'Geschützdrohne', level: 7, hp: 40, armor: 4, ref: 4, fw: 6,
    dmg: [11, 13], kind: 'fernkampf', range: 7, ai: 'vorsichtig', abilities: ['geschuetzdrohne-unterdrueckungsfeuer'],
    sprite: 'spaeherdrohne-walk', faction: 'quantum', loot: [scrap(0.8, 3)],
  }),
  foe({
    id: 'sanidrohne', name: 'Sanitätsdrohne', level: 6, hp: 22, armor: 1, ref: 6, fw: 5,
    dmg: [2, 3], kind: 'smart', range: 3, ai: 'support', abilities: ['sanidrohne-flicken', 'sanidrohne-schildblase'],
    sprite: 'spaeherdrohne-walk', faction: 'quantum', loot: [{ item: 'medipflaster', chance: 0.6 }],
  }),
  foe({
    id: 'schrottdrohne', name: 'Schrottdrohne', level: 2, hp: 16, armor: 1, ref: 5, fw: 2,
    dmg: [4, 6], kind: 'fernkampf', range: 4, ai: 'aggressiv',
    sprite: 'spaeherdrohne-walk', loot: [scrap(0.9, 2)],
  }),
  foe({
    id: 'robohund', name: 'Roboterhund', level: 3, hp: 24, armor: 2, ref: 7, fw: 3,
    dmg: [6, 8], kind: 'nahkampf', range: 1, ai: 'aggressiv', abilities: ['robohund-anspringen'],
    loot: [scrap(0.6)],
  }),
  foe({
    id: 'robohund-alpha', name: 'Roboterhund-Alpha', level: 5, hp: 44, armor: 3, ref: 7, fw: 5,
    dmg: [8, 10], kind: 'nahkampf', range: 1, ai: 'aggressiv', abilities: ['robohund-alpha-heulen', 'robohund-anspringen'],
    sprite: 'robohund-walk', loot: [scrap(1, 3), { item: 'leckerli-schraube', chance: 0.5 }],
  }),
  foe({
    id: 'digitech-waechter', name: 'Digitech-Wächter', level: 4, hp: 36, armor: 3, ref: 3, fw: 4,
    dmg: [7, 9], kind: 'nahkampf', range: 1, ai: 'aggressiv', abilities: ['digitech-waechter-klammergriff'],
    faction: 'digitech', loot: [scrap(0.9, 2), { item: 'reparaturset', chance: 0.15 }],
  }),
  foe({
    id: 'windrad-drohne', name: 'Windrad-Drohne', level: 6, hp: 30, armor: 2, ref: 6, fw: 5,
    dmg: [6, 8], kind: 'nahkampf', range: 1, ai: 'aggressiv', abilities: ['windrad-drohne-rotorschlag'],
    sprite: 'spaeherdrohne-walk', loot: [scrap(0.8, 2)],
  }),
  foe({
    id: 'rohrkriecher', name: 'Rohrkriecher', level: 4, hp: 36, armor: 3, ref: 3, fw: 4,
    dmg: [5, 7], kind: 'nahkampf', range: 1, ai: 'aggressiv', abilities: ['rohrkriecher-putzen'],
    loot: [scrap(0.8, 2)],
  }),

  // --- Kanal und Ödnis ----------------------------------------------------
  foe({
    id: 'kanalratte', name: 'Kanalratte XL', level: 1, hp: 10, armor: 0, ref: 6, morale: 30,
    dmg: [3, 4], kind: 'nahkampf', range: 1, ai: 'aggressiv', attrs: { koerper: 2 },
    loot: [{ item: 'kaeseecke', chance: 0.15 }],
  }),
  foe({
    id: 'rattenschwarm', name: 'Rattenschwarm', level: 3, hp: 30, armor: 0, ref: 5,
    dmg: [5, 7], kind: 'nahkampf', range: 1, ai: 'aggressiv', abilities: ['rattenschwarm-gewimmel'],
    sprite: 'kanalratte-walk',
  }),
  foe({
    id: 'ratten-mutant', name: 'Ratten-Mutant', level: 4, hp: 40, armor: 2, ref: 4, morale: 50,
    dmg: [8, 10], kind: 'nahkampf', range: 1, ai: 'aggressiv', abilities: ['ratten-mutant-kanalmief'],
    sprite: 'kanalratte-walk', loot: [{ item: 'kaeseecke', chance: 0.4 }, scrap(0.3)],
  }),
  foe({
    id: 'kabelmolch', name: 'Kabelmolch', level: 6, hp: 34, armor: 2, ref: 5, fw: 4,
    dmg: [7, 9], kind: 'nahkampf', range: 1, ai: 'aggressiv', abilities: ['kabelmolch-entladung'],
    loot: [scrap(0.6, 2)],
  }),
  foe({
    id: 'glasskorpion', name: 'Glasskorpion', level: 7, hp: 38, armor: 4, ref: 6, morale: 40,
    dmg: [8, 10], kind: 'nahkampf', range: 1, ai: 'vorsichtig', abilities: ['glasskorpion-stich'],
  }),

  // --- Netz und Gechippte -------------------------------------------------
  foe({
    id: 'sicherheitsprogramm', name: 'Sicherheitsprogramm', level: 8, hp: 30, armor: 0, ref: 8, fw: 9,
    dmg: [8, 10], kind: 'smart', range: 4, ai: 'aggressiv', abilities: ['sicherheitsprogramm-datenstich'],
    faction: 'quantum',
  }),
  foe({
    id: 'gechippter-bewohner', name: 'Gechippter Bewohner', level: 4, hp: 30, armor: 0, ref: 3, fw: 4,
    dmg: [4, 6], kind: 'nahkampf', range: 1, ai: 'aggressiv', abilities: ['gechippter-bewohner-festhalten'],
    sprite: 'passant-arbeiterin-walk', xp: 20,
  }),
  foe({
    id: 'gechippter-partygast', name: 'Gechippter Partygast', level: 12, hp: 34, armor: 1, ref: 4, fw: 6,
    dmg: [6, 8], kind: 'nahkampf', range: 1, ai: 'aggressiv', abilities: ['gechippter-partygast-choreografie'],
    sprite: 'passant-anzug-walk', attrs: { koerper: 4 }, xp: 60,
  }),
  foe({
    id: 'gechippte-wache', name: 'Gechippte Wache', level: 13, hp: 48, armor: 3, ref: 5, fw: 7,
    dmg: [10, 12], kind: 'fernkampf', range: 6, ai: 'aggressiv', abilities: ['gechippte-wache-schockschuss'],
    sprite: 'quantum-wachmann-walk', faction: 'quantum',
  }),
  foe({
    id: 'nexus-splitter', name: 'Nexus-Splitter', level: 15, hp: 50, armor: 0, ref: 8, fw: 9,
    dmg: [10, 12], kind: 'smart', range: 6, ai: 'aggressiv', abilities: ['nexus-splitter-logikschleife'],
    portrait: 'ki-nexus',
  }),
];

// Benannte Akt-1-Gegner (Varianten der Typen oben).
const named: EnemyDef[] = [
  // Knut und Kurt am Bahnsteig (main-1-ankunft, Tutorial) und im U-Bahn-Wagen (side-abzieher, St. 3 mit 34 LP).
  foe({
    id: 'abzieher-knut', name: 'Knut', level: 1, hp: 18, armor: 0, ref: 4, fw: 2, morale: 50,
    dmg: [6, 8], kind: 'nahkampf', range: 1, ai: 'aggressiv', abilities: ['abzieher-abziehen'],
    sprite: 'abzieher-walk', credits: [5, 15],
  }),
  foe({
    id: 'abzieher-kurt', name: 'Kurt', level: 1, hp: 18, armor: 0, ref: 4, fw: 2, morale: 50,
    dmg: [6, 8], kind: 'nahkampf', range: 1, ai: 'aggressiv', abilities: ['abzieher-abziehen'],
    sprite: 'abzieher-walk', credits: [5, 15],
  }),
  foe({
    id: 'knut-ubahn', name: 'Knut', level: 3, hp: 34, armor: 1, ref: 4, fw: 2, morale: 60,
    dmg: [7, 9], kind: 'nahkampf', range: 1, ai: 'aggressiv', abilities: ['abzieher-abziehen'],
    sprite: 'abzieher-walk', credits: [20, 45], loot: [{ item: 'nougatbombe', chance: 0.5, qty: 2 }],
  }),
  foe({
    id: 'kurt-ubahn', name: 'Kurt', level: 3, hp: 34, armor: 1, ref: 4, fw: 2, morale: 60,
    dmg: [7, 9], kind: 'nahkampf', range: 1, ai: 'aggressiv', abilities: ['abzieher-abziehen'],
    sprite: 'abzieher-walk', credits: [20, 45], loot: [{ item: 'medipflaster', chance: 0.5 }],
  }),
  // Dexter auf seiner Halde (main-1-dexter): wie ein Zerleger St. 3, 60 LP, gibt bei halben LP klein bei.
  foe({
    id: 'dexter-halde', name: 'Dexter', level: 3, hp: 60, armor: 1, ref: 5, fw: 3, morale: 40,
    dmg: [6, 8], kind: 'nahkampf', range: 1, ai: 'aggressiv', abilities: ['zerleger-ausraeumen'],
    sprite: 'zerleger-walk', credits: [30, 60], loot: [scrap(1, 3)],
    phases: [{ below: 0.5, ai: 'vorsichtig', line: 'Okay, OKAY! Auszeit! Ich hab Gutscheine! Sehr gute Gutscheine!' }],
  }),
  // Raven auf der Flucht über den Schrottmarkt (main-1-raven): St. 3, 60 LP, ergibt sich bei 40 %.
  foe({
    id: 'raven-markt', name: 'Raven', level: 3, hp: 60, armor: 1, ref: 6, fw: 3, morale: 45,
    dmg: [6, 8], kind: 'nahkampf', range: 1, ai: 'vorsichtig', abilities: ['boss-raven-handschellen'],
    attrs: { koerper: 6, strasse: 5, ausstrahlung: 4 }, sprite: 'raven-walk', portrait: 'raven', xp: 60,
    phases: [{ below: 0.4, ai: 'vorsichtig', line: 'Schon gut, schon gut. Ihr seid hartnäckiger als Kessels Formulare.' }],
  }),
  // Wachmann Pfeffer (prep-zugangskarte): ein Quantum-Wachmann, der lieber Karaoke singen würde.
  foe({
    id: 'wachmann-pfeffer', name: 'Wachmann Pfeffer', level: 4, hp: 34, armor: 2, ref: 5, fw: 4, morale: 55,
    dmg: [8, 10], kind: 'fernkampf', range: 6, ai: 'vorsichtig', abilities: ['quantum-wachmann-schockstufe'],
    sprite: 'quantum-wachmann-walk', faction: 'quantum', credits: [10, 30],
  }),
  // Rostzahn-Unterbosse mit 48 LP (side-zweite-hand am Hafen, side-oma-volts-lager im Hinterhof).
  foe({
    id: 'rostzahn-vize-bolle', name: 'Bolle (Rostzahn-Vize)', level: 3, hp: 48, armor: 2, ref: 4, fw: 2, morale: 70,
    dmg: [8, 10], kind: 'nahkampf', range: 2, ai: 'aggressiv', abilities: ['rostzahn-rudelhieb', 'boss-funzel-anbruellen'],
    sprite: 'rostzahn-schlaeger-walk', faction: 'rostzaehne', credits: [30, 60], loot: [{ item: 'medipflaster', chance: 0.6 }],
  }),
  foe({
    id: 'leuchtreklamen-lutz', name: 'Leuchtreklamen-Lutz', level: 3, hp: 48, armor: 2, ref: 4, fw: 2, morale: 70,
    dmg: [8, 10], kind: 'nahkampf', range: 2, ai: 'aggressiv', abilities: ['rostzahn-rudelhieb', 'boss-funzel-anbruellen'],
    sprite: 'rostzahn-schlaeger-walk', faction: 'rostzaehne', credits: [40, 70], loot: [{ item: 'nougatbombe', chance: 0.8, qty: 2 }],
  }),
  // Falke, Quantum-Scharfschütze und Vegas Rivale (pers-vega-adlerauge).
  foe({
    id: 'falke', name: 'Falke', level: 5, hp: 34, armor: 1, ref: 8, fw: 4, morale: 60,
    dmg: [10, 13], kind: 'fernkampf', range: 10, ai: 'vorsichtig', abilities: ['quantum-scharfschuetze-laserlinie'],
    sprite: 'quantum-wachmann-walk', faction: 'quantum', credits: [30, 60], xp: 80,
  }),
  // Aufträge (§6.6): Schuldner mit Rückendeckung.
  foe({
    id: 'schuldner', name: 'Säumiger Schuldner', level: 2, hp: 22, armor: 0, ref: 5, fw: 2, morale: 35,
    dmg: [5, 7], kind: 'nahkampf', range: 1, ai: 'vorsichtig', abilities: ['strassen-flitzer-ritzer'],
    sprite: 'passant-punk-walk', credits: [20, 50],
  }),
];

// Kopfgeldziele (§6.7). Oma Turbo fehlt mit Absicht: Kampf unmöglich, sie ist zu schnell.
const bounties: EnemyDef[] = [
  foe({
    id: 'zwei-finger-zoltan', name: 'Zwei-Finger-Zoltan', level: 2, hp: 24, armor: 0, ref: 8, fw: 2, morale: 35,
    dmg: [4, 6], kind: 'nahkampf', range: 1, ai: 'vorsichtig', abilities: ['strassen-flitzer-ritzer'],
    sprite: 'abzieher-walk', credits: [40, 80], xp: 40,
  }),
  foe({
    id: 'loetkolben-lola', name: 'Lötkolben-Lola', level: 2, hp: 28, armor: 1, ref: 5, fw: 5, morale: 45,
    dmg: [6, 8], kind: 'smart', range: 4, ai: 'vorsichtig', abilities: ['hack-stoerimpuls', 'schrottkraehe-funkenregen'],
    sprite: 'passant-schrotti-walk', credits: [30, 60], xp: 40, loot: [{ item: 'reparaturset', chance: 0.5 }],
  }),
  foe({
    id: 'krawall-kalle', name: 'Krawall-Kalle', level: 2, hp: 34, armor: 1, ref: 4, fw: 2, morale: 60,
    dmg: [8, 10], kind: 'nahkampf', range: 1, ai: 'aggressiv', abilities: ['ordnungshueter-platz-da'],
    sprite: 'rostzahn-schlaeger-walk', attrs: { koerper: 6 }, credits: [20, 40], xp: 40,
  }),
  foe({
    id: 'neon-nils', name: 'Neon-Nils', level: 3, hp: 30, armor: 1, ref: 7, fw: 4, morale: 45,
    dmg: [6, 8], kind: 'fernkampf', range: 5, ai: 'vorsichtig', abilities: ['hack-lichter-aus'],
    sprite: 'passant-kurier-walk', credits: [30, 70], xp: 60,
  }),
  foe({
    id: 'der-kassierer', name: 'Der Kassierer', level: 3, hp: 32, armor: 2, ref: 5, fw: 3, morale: 50,
    dmg: [6, 8], kind: 'fernkampf', range: 5, ai: 'vorsichtig', abilities: ['quantum-wachmann-schockstufe'],
    sprite: 'passant-anzug-walk', credits: [60, 120], xp: 60,
  }),
  foe({
    id: 'toaster', name: '„Toaster“', level: 3, hp: 40, armor: 3, ref: 4, fw: 4,
    dmg: [7, 9], kind: 'nahkampf', range: 1, ai: 'aggressiv', abilities: ['digitech-waechter-klammergriff'],
    sprite: 'digitech-waechter-walk', xp: 60, loot: [scrap(1, 4)],
  }),
  foe({
    id: 'graf-gully-zwei', name: 'Graf Gully II.', level: 3, hp: 30, armor: 1, ref: 5, fw: 2, morale: 40,
    dmg: [5, 7], kind: 'nahkampf', range: 1, ai: 'vorsichtig', abilities: ['boss-nagbert-koeniglicher-befehl'],
    sprite: 'passant-kanalvolk-walk', credits: [20, 60], xp: 60, loot: [{ item: 'kaeseecke', chance: 1, qty: 2 }],
  }),
  foe({
    id: 'blech-schwester-blau', name: 'Blech-Schwester Blau', level: 6, hp: 36, armor: 2, ref: 7, fw: 5, morale: 50,
    dmg: [8, 10], kind: 'fernkampf', range: 6, ai: 'vorsichtig', abilities: ['boss-blade-charmeur'],
    sprite: 'seraphina-walk', credits: [60, 120],
  }),
  foe({
    id: 'blech-schwester-rot', name: 'Blech-Schwester Rot', level: 6, hp: 36, armor: 2, ref: 6, fw: 5, morale: 50,
    dmg: [9, 11], kind: 'nahkampf', range: 2, ai: 'aggressiv', abilities: ['barkeeper-mondschnitt'],
    sprite: 'sybella-walk', credits: [60, 120],
  }),
  foe({
    id: 'faxfaelscher', name: 'Der Faxfälscher', level: 6, hp: 34, armor: 1, ref: 5, fw: 7, morale: 40,
    dmg: [7, 9], kind: 'smart', range: 6, ai: 'support', abilities: ['quantum-techniker-gegenhack', 'hack-stoerimpuls'],
    sprite: 'passant-anzug-walk', credits: [50, 100], loot: [scrap(0.8, 2)],
  }),
  foe({
    id: 'staubbaron-broesel', name: 'Staubbaron Brösel', level: 7, hp: 52, armor: 3, ref: 5, fw: 3, morale: 60,
    dmg: [10, 12], kind: 'fernkampf', range: 6, ai: 'vorsichtig', abilities: ['staubfalke-sandwirbel'],
    sprite: 'passant-schrotti-walk', faction: 'staubfalken', credits: [80, 150], loot: [{ item: 'staubmaske', chance: 0.6 }],
  }),
  foe({
    id: 'leutnant-nadel', name: 'Leutnant Nadel', level: 10, hp: 70, armor: 4, ref: 8, fw: 6, morale: 90,
    dmg: [12, 14], kind: 'nahkampf', range: 1, ai: 'aggressiv', abilities: ['venom-garde-sprungangriff', 'boss-xion-venomkralle'],
    sprite: 'quantum-wachmann-walk', faction: 'quantum', credits: [100, 200], loot: [{ item: 'nanogel', chance: 0.6 }],
  }),
];

export const COMBAT_ENEMIES: Record<string, EnemyDef> = byId([...types, ...named, ...bounties]);

export const part: ContentPart = { enemies: COMBAT_ENEMIES };
