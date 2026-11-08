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
import { CHECKS } from './checks';
import { DIALOGUES } from './dialogues';
import { JOBS, SHOPS } from './economy';
import { ARENAS, ENCOUNTERS } from './encounters';
import { ABILITIES, ENEMIES } from './enemies';
import { ITEMS } from './items';
import { MAPS } from './maps';
import { NEWS, PHONE } from './news';
import { NPCS } from './npcs';
import { CYBERWARE, PERKS } from './perks';
import { QUESTS } from './quests';
import { ROMANCE_ENABLED } from './romance';
import { ACT_STARTS, CUTSCENES, DISTRICTS, ENDING, FACTIONS, HOME, START, STATIONS } from './world';

export const content: GameContent = {
  meta: { id: 'nexus-test', title: 'Nexus – Testinhalt', test: true },
  maps: MAPS,
  districts: DISTRICTS,
  stations: STATIONS,
  dialogues: DIALOGUES,
  cutscenes: CUTSCENES,
  items: ITEMS,
  npcs: NPCS,
  checks: CHECKS,
  perks: PERKS,
  cyberware: CYBERWARE,
  origins: ORIGINS,
  looks: LOOKS,
  appearance: APPEARANCE,
  presets: PRESETS,
  factions: FACTIONS,
  quests: QUESTS,
  jobs: JOBS,
  shops: SHOPS,
  encounters: ENCOUNTERS,
  arenas: ARENAS,
  enemies: ENEMIES,
  abilities: ABILITIES,
  news: NEWS,
  phone: PHONE,
  // Nur Figuren, die im Inhalt existieren (Tippfehler fängt romance.test.ts über ROMANCE_CANDIDATES ab).
  romance: new Set([...ROMANCE_ENABLED].filter((id) => id in NPCS)),
  actStarts: ACT_STARTS,
  start: START,
  home: HOME,
  ending: ENDING,
};
