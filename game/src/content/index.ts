// ===========================================================================
// TESTINHALT – wird später durch den echten Nexus-Inhalt aus docs/world.md ersetzt.
//
// Klein, aber vollständig gültig: zwei Karten (test-strasse 1536×1024, test-innen 1024×768),
// Raven und Dante mit Tagesablauf, ein Dialog mit Schwellen-Check, eine Quest, drei Gegenstände,
// ein Händler, eine Begegnung mit Arena. `meta.test` kennzeichnet den Platzhalterstand.
// Diese Datei setzt nur zusammen; Inhalte stehen in den Bereichsdateien daneben.
// ===========================================================================
import type { GameContent } from '../modules/contracts';
import { APPEARANCE } from './appearance';
import { LOOKS, ORIGINS, PRESETS } from './character';
import { CYBERWARE, PERKS } from './perks';
import { ROMANCE_ENABLED } from './romance';
import { mergeParts } from './part';
import { PARTS } from './parts';
import { ACT_STARTS, ENDING, HOME, START } from './world';

const base: GameContent = {
  meta: { id: 'nexus-test', title: 'Nexus – Testinhalt', test: true },
  maps: {},
  districts: {},
  stations: {},
  dialogues: {},
  cutscenes: {},
  items: {},
  npcs: {},
  checks: {},
  perks: PERKS,
  cyberware: CYBERWARE,
  origins: ORIGINS,
  looks: LOOKS,
  appearance: APPEARANCE,
  presets: PRESETS,
  factions: {},
  quests: {},
  jobs: {},
  shops: {},
  encounters: {},
  arenas: {},
  enemies: {},
  abilities: {},
  news: {},
  phone: {},
  // Nur Figuren, die im Inhalt existieren (Tippfehler fängt romance.test.ts über ROMANCE_CANDIDATES ab); siehe unten.
  romance: new Set(),
  actStarts: ACT_STARTS,
  start: START,
  home: HOME,
  ending: ENDING,
};

/** Grundinhalt plus alle Inhaltsteile aus content/parts/** (siehe content/part.ts). */
const merged = mergeParts(base, PARTS);
export const content: GameContent = {
  ...merged,
  romance: new Set([...ROMANCE_ENABLED].filter((id) => id in merged.npcs)),
};
