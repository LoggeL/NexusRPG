// Speicherformat: JSON des GameState (version 2) mit strikter Struktur- und Inhaltsprüfung beim Import.
// Version 1 (vor dem Charakter-Baukasten) wird migriert: Aussehen = Vorlage der alten Look-ID (design.md §3.1a).
// Jede Domäne prüft ihren Teil (parse…); unbekannte Felder werden verworfen, ungültige Daten abgelehnt.
import { templateAppearance } from '../appearance';
import type { GameContent, GameState, MapId } from '../contracts';
import { parsePlayerState } from './domains/player';
import { parseClock } from './domains/clock';
import { parseFlags, parseIdList, parseInventory, parsePhone } from './domains/core';
import { isCredits, parseReputation, parseShops } from './domains/economy';
import { parseJobs, parseQuests } from './domains/quests';
import { parseCrew, parseRelations } from './domains/relations';
import { DEFAULT_MAP_SIZE, has, isActId, isFacing } from './ids';
import { Invalid, SAVE_LIMITS, fail, int, isKey, isNum, isObj, uniqueList, type Obj } from './validate';

export { SAVE_LIMITS } from './validate';
export const SAVE_VERSION = 2;
/** Ältere Versionen, die beim Laden migriert werden. */
export const MIGRATABLE_VERSIONS: readonly number[] = [1];

export function serializeState(state: Readonly<GameState>): string {
  return JSON.stringify(state);
}

/** Liefert den geprüften Zustand (mit Hinweisen für den Ladedialog) oder den Grund der Ablehnung. */
export function parseSave(raw: unknown, content: GameContent): { state: GameState; notes: string[] } | { error: string } {
  try {
    const notes: string[] = [];
    return { state: validate(raw, content, notes), notes };
  } catch (error) {
    if (error instanceof Invalid) return { error: error.message };
    return { error: 'Spielstand ist beschädigt.' };
  }
}

/** Version 1 → 2: Aussehen aus der Vorlage der alten Look-ID (unbekannt → Neonbomber). */
function migrateV1(d: Obj, content: GameContent, notes: string[]): void {
  const player = d.player;
  if (!isObj(player)) return;
  const p = player as Obj;
  if (p.appearance === undefined) {
    p.appearance = templateAppearance(content, typeof p.look === 'string' ? p.look : undefined);
    if (p.created === true) notes.push('Älterer Spielstand: Das Aussehen kommt jetzt aus dem Charakter-Baukasten (Vorlage).');
  }
  d.version = SAVE_VERSION;
}

function validate(raw: unknown, content: GameContent, notes: string[] = []): GameState {
  if (typeof raw !== 'string') fail('Spielstand ist kein Text.');
  const text = raw as string;
  if (text.length === 0 || text.length > SAVE_LIMITS.chars) fail('Spielstand hat eine ungültige Größe.');
  let data: unknown;
  try { data = JSON.parse(text); } catch { fail('Spielstand ist kein gültiges JSON.'); }
  if (!isObj(data)) fail('Spielstand hat kein gültiges Format.');
  const d = data as Obj;
  if (typeof d.version === 'number' && MIGRATABLE_VERSIONS.includes(d.version)) migrateV1(d, content, notes);
  if (d.version !== SAVE_VERSION) fail('Unbekannte Spielstandversion.');
  if (!isActId(d.act)) fail('Ungültiger Akt.');
  const seed = int(d.seed, 0, 0xffffffff, 'Startwert');

  const knownMap = (value: unknown): value is MapId => typeof value === 'string' && has(content.maps, value);
  if (!knownMap(d.map)) fail('Unbekannter Ort.');
  const [w, h] = content.maps[d.map as string].size ?? DEFAULT_MAP_SIZE;
  const pos = d.position;
  if (!Array.isArray(pos) || pos.length !== 2 || !isNum(pos[0], 0, w) || !isNum(pos[1], 0, h)) fail('Ungültige Position.');
  if (!isFacing(d.facing)) fail('Ungültige Blickrichtung.');

  const crew = parseCrew(d.recruited, d.party, content);
  if (!isCredits(d.credits)) fail('Ungültige Credits.');
  const tracked = d.tracked === null ? null : typeof d.tracked === 'string' && has(content.quests, d.tracked) ? d.tracked : fail('Ungültiges Ziel.');

  const statsIn = d.stats;
  if (!isObj(statsIn)) fail('Ungültige Statistik.');
  const s = statsIn as Obj;
  const counter = (value: unknown, label: string) => int(value, 0, SAVE_LIMITS.counter, label);

  if (!isNum(d.playTimeMs, 0, SAVE_LIMITS.playTimeMs)) fail('Ungültige Spielzeit.');
  if (typeof d.ended !== 'boolean') fail('Ungültiger Spielstatus.');

  const state: GameState = {
    version: 2,
    seed,
    act: d.act as GameState['act'],
    map: d.map as MapId,
    position: [pos[0] as number, pos[1] as number],
    facing: d.facing as GameState['facing'],
    player: parsePlayerState(d.player, content, notes),
    party: crew.party,
    recruited: crew.recruited,
    credits: d.credits as number,
    reputation: parseReputation(d.reputation, content),
    relations: parseRelations(d.relations, content),
    quests: parseQuests(d.quests, content),
    tracked,
    jobs: parseJobs(d.jobs, content),
    shops: parseShops(d.shops, content),
    clock: parseClock(d.clock),
    flags: parseFlags(d.flags),
    inventory: parseInventory(d.inventory, content),
    visited: uniqueList(d.visited, Object.keys(content.maps).length, knownMap, 'besuchte Orte'),
    seen: uniqueList(d.seen, SAVE_LIMITS.seen, isKey, 'gesehene Ereignisse'),
    gallery: parseIdList(d.gallery, content.cutscenes, 'Galerie'),
    stations: parseIdList(d.stations, content.stations, 'Stationen'),
    news: parseIdList(d.news, content.news, 'Nachrichten'),
    phone: parsePhone(d.phone, content),
    stats: {
      checksPassed: counter(s.checksPassed, 'bestandene Checks'),
      battlesWon: counter(s.battlesWon, 'gewonnene Kämpfe'),
      battlesLost: counter(s.battlesLost, 'verlorene Kämpfe'),
      giftsGiven: counter(s.giftsGiven, 'Geschenke'),
    },
    playTimeMs: d.playTimeMs as number,
    ended: d.ended as boolean,
  };
  return state;
}
