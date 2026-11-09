// Aufbau, Kopie und Einfrieren des Spielzustands.
import type { ActId, Effect, Facing, GameContent, GameState, MapId, Point } from '../contracts';
import { defaultPlayer, levelForXp, maxHpOf, xpForLevel } from './domains/character';
import { startClock } from './domains/clock';
import { DAY_END, DAY_START } from '../time';
import { createEffectContext, settle } from './effects';
import { ACT_IDS, DEFAULT_MAP_SIZE, actFlag, clamp, has } from './ids';

export function entryPoint(content: GameContent, map: MapId, entry?: string): { at: Point; facing: Facing } {
  const def = has(content.maps, map) ? content.maps[map] : undefined;
  const found = def && entry && has(def.entries, entry) ? def.entries[entry] : undefined;
  const pick = found ?? (def ? def.entries.default ?? Object.values(def.entries)[0] : undefined);
  if (pick) return { at: [pick.at[0], pick.at[1]], facing: pick.facing };
  const [w, h] = def?.size ?? DEFAULT_MAP_SIZE;
  return { at: [w / 2, h / 2], facing: 's' };
}

/** Neue Partie: Akt 1 am Startort, Spielfigur noch nicht erstellt (Charaktererstellung folgt). */
export function createInitialState(content: GameContent, seed = 1): GameState {
  const { map, entry } = content.start;
  const spawn = entryPoint(content, map, entry);
  const state: GameState = {
    version: 2,
    seed: seed >>> 0,
    act: 1,
    map,
    position: spawn.at,
    facing: spawn.facing,
    player: defaultPlayer(content),
    party: [],
    recruited: [],
    credits: Math.max(0, Math.round(content.start.credits ?? 0)),
    reputation: {},
    relations: {},
    quests: {},
    tracked: null,
    jobs: { day: 0, taken: [], active: [], completed: 0 },
    shops: {},
    clock: startClock(content),
    flags: { [actFlag(1)]: true },
    inventory: {},
    visited: has(content.maps, map) ? [map] : [],
    seen: [],
    gallery: [],
    stations: [],
    news: [],
    phone: [],
    stats: { checksPassed: 0, battlesWon: 0, battlesLost: 0, giftsGiven: 0 },
    playTimeMs: 0,
    ended: false,
  };
  for (const [item, qty] of Object.entries(content.start.items ?? {})) {
    if (has(content.items, item) && Number.isInteger(qty) && qty > 0) state.inventory[item] = qty;
  }
  const ctx = createEffectContext(content, state, () => 0.5);
  settle(ctx);
  return state;
}

/**
 * Zustand für `?act=` bzw. Debug-Warp: frisches Spiel mit erstellter Standardfigur plus Vorgaben aus
 * `content.actStarts` (Flags, Gegenstände, Crew, Quests, Stationen …). Fehlt der Eintrag, nur die Akt-Flags.
 */
export function createActState(content: GameContent, act: ActId, seed = 1): GameState {
  const state = createInitialState(content, seed);
  state.player.created = true;
  state.act = act;
  for (const id of ACT_IDS) if (id <= act) state.flags[actFlag(id)] = true;
  const start = content.actStarts[act];
  if (!start) return state;
  const spawn = entryPoint(content, start.map, start.entry);
  if (has(content.maps, start.map)) {
    state.map = start.map;
    state.position = spawn.at;
    state.facing = spawn.facing;
    if (!state.visited.includes(start.map)) state.visited.push(start.map);
  }
  for (const map of start.visited ?? []) if (has(content.maps, map) && !state.visited.includes(map)) state.visited.push(map);
  if (start.level && start.level > 1) {
    const level = clamp(Math.floor(start.level), 1, 20);
    state.player.xp = xpForLevel(level);
    state.player.level = levelForXp(state.player.xp);
    state.player.unspentAttr = level - 1;
    state.player.perkPoints = level - 1;
  }
  if (start.day && start.day > 1) state.clock.day = Math.floor(start.day);
  if (start.minutes !== undefined && Number.isFinite(start.minutes)) {
    state.clock.minutes = clamp(Math.floor(start.minutes), DAY_START, DAY_END - 1);
  }
  const effects: Effect[] = [
    ...(start.flags ?? []).map((setFlag): Effect => ({ setFlag })),
    ...Object.entries(start.items ?? {}).map(([give, qty]): Effect => ({ give, qty })),
    ...(start.credits ? [{ credits: start.credits }] : []),
    ...Object.entries(start.relations ?? {}).map(([relation, delta]): Effect => ({ relation, delta })),
    ...(start.stations ?? []).map((unlockStation): Effect => ({ unlockStation })),
    ...(start.seen ?? []).map((markSeen): Effect => ({ markSeen })),
  ];
  const ctx = createEffectContext(content, state, () => 0.5);
  // Warps sind Debug-Hilfen: unbekannte Angaben (Inhaltsfehler) werden übersprungen statt den Warp zu verhindern.
  for (const effect of effects) ctx.run([effect]);
  // Crew direkt setzen: Warps überspringen die Rekrutierungsbedingung (CompanionDef.recruit).
  for (const npc of start.recruited ?? []) {
    if (content.npcs[npc]?.companion && !state.recruited.includes(npc)) state.recruited.push(npc);
  }
  for (const [quest, status] of Object.entries(start.quests ?? {})) {
    if (!has(content.quests, quest)) continue;
    state.quests[quest] = { status, steps: status === 'done' ? content.quests[quest].steps.map(step => step.id) : [], startedDay: 1 };
    if (status !== 'active') state.quests[quest].endedDay = 1;
  }
  if (start.party) state.party = start.party.filter(npc => state.recruited.includes(npc)).slice(0, 2);
  state.player.hp = maxHpOf(content, state.player);
  settle(ctx);
  return state;
}

/** Tiefe Kopie reiner Daten (der Zustand enthält nur JSON-Werte). */
export function cloneData<T>(value: T): T {
  if (Array.isArray(value)) return value.map(entry => cloneData(entry)) as T;
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(value as Record<string, unknown>)) out[key] = cloneData(entry);
    return out as T;
  }
  return value;
}

export const cloneState = (state: Readonly<GameState>): GameState => cloneData(state as GameState);

export function deepFreeze<T>(value: T): Readonly<T> {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value as object)) deepFreeze(child);
  }
  return value;
}
