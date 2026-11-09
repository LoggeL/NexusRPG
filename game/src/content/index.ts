// Nexus – Das RPG: setzt den Grundinhalt (Charakter, Perks, Aussehen) und alle Inhaltsteile aus
// content/parts/** zusammen. Inhalte stehen in den Teilen, Start/Ende/Akt-Einstiege in world.ts.
import type { ExitDef, GameContent, HotspotDef, MapDef } from '../modules/contracts';
import { APPEARANCE } from './appearance';
import { LOOKS, ORIGINS, PRESETS } from './character';
import { CYBERWARE, PERKS } from './perks';
import { ROMANCE_ENABLED } from './romance';
import { mergeParts } from './part';
import { PARTS } from './parts';
import { ACT_STARTS, ENDING, HOME, START } from './world';

const base: GameContent = {
  meta: { id: 'nexus', title: 'Nexus – Das RPG' },
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

/**
 * Karten späterer Akte (world.md §3), auf die Akt-1-Karten schon gesperrte Ausgänge haben. Solange eine dieser Karten
 * fehlt, wird ihr Ausgang zu einem Hinweis-Hotspot mit dem Sperrtext; sobald die Karte existiert, ist der Ausgang
 * automatisch wieder da. Ausgänge zu anderen fehlenden Karten bleiben Inhaltsfehler (Lint).
 */
export const LATER_ACT_MAPS: readonly string[] = [
  'chrome-boulevard', 'quantum-campus', 'datentunnel', 'rennhalle-9', 'staubstrasse', 'pumpwerk-sieben',
];

function parkLaterActExits(content: GameContent): GameContent {
  const maps: Record<string, MapDef> = {};
  for (const [id, map] of Object.entries(content.maps)) {
    const parked = map.exits.filter((e) => LATER_ACT_MAPS.includes(e.to) && !content.maps[e.to]);
    if (!parked.length) { maps[id] = map; continue; }
    const hint = (e: ExitDef): HotspotDef => ({
      id: `spaeter-${e.id}`, at: [e.rect[0] + e.rect[2] / 2, e.rect[1] + e.rect[3] / 2],
      radius: Math.max(56, e.rect[2], e.rect[3]), label: e.label, kind: 'look',
      lines: [{ speaker: 'narrator', text: e.lockedText ?? 'Hier geht es erst später weiter.' }],
    });
    maps[id] = { ...map, exits: map.exits.filter((e) => !parked.includes(e)), hotspots: [...map.hotspots, ...parked.map(hint)] };
  }
  return { ...content, maps };
}

/** Grundinhalt plus alle Inhaltsteile aus content/parts/** (siehe content/part.ts). */
const merged = parkLaterActExits(mergeParts(base, PARTS));
export const content: GameContent = {
  ...merged,
  romance: new Set([...ROMANCE_ENABLED].filter((id) => id in merged.npcs)),
};
