// TESTINHALT als Inhaltsteil (wird mit dem echten Akt-1-Inhalt gelöscht). Liegt in `_test`, damit er zuerst
// zusammengeführt wird und echte Teile mit gleicher ID ihn überschreiben.
import type { ContentPart } from '../../part';
import { CHECKS } from '../../checks';
import { DIALOGUES } from '../../dialogues';
import { JOBS, SHOPS } from '../../economy';
import { ARENAS, ENCOUNTERS } from '../../encounters';
import { ABILITIES, ENEMIES } from '../../enemies';
import { ITEMS } from '../../items';
import { MAPS } from '../../maps';
import { NEWS, PHONE } from '../../news';
import { NPCS } from '../../npcs';
import { QUESTS } from '../../quests';
import { CUTSCENES, DISTRICTS, FACTIONS, STATIONS } from '../../world';

export const part: ContentPart = {
  maps: MAPS, districts: DISTRICTS, stations: STATIONS, dialogues: DIALOGUES, cutscenes: CUTSCENES, items: ITEMS,
  npcs: NPCS, checks: CHECKS, factions: FACTIONS, quests: QUESTS, jobs: JOBS, shops: SHOPS, encounters: ENCOUNTERS,
  arenas: ARENAS, enemies: ENEMIES, abilities: ABILITIES, news: NEWS, phone: PHONE,
};
