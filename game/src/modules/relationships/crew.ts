// Crew und Party (design.md §3.3): Begleitfiguren (`NpcDef.companion`) lassen sich nach Bedingung rekrutieren;
// höchstens 2 sind aktiv in der Party, weitere warten in Reserve. Entlassen nimmt aus der Party, die Figur bleibt
// in der Crew und kann später wieder mitkommen.
import type { AbilityId, GameContent, NpcDef, NpcId } from '../contracts';

export const MAX_PARTY = 2;

export interface CrewState { recruited: readonly NpcId[]; party: readonly NpcId[] }

const own = (record: object, key: string): boolean => typeof key === 'string' && Object.prototype.hasOwnProperty.call(record, key);
const npcOf = (content: GameContent, npc: NpcId): NpcDef | undefined => (own(content.npcs, npc) ? content.npcs[npc] : undefined);

export const isCompanion = (content: GameContent, npc: NpcId): boolean => !!npcOf(content, npc)?.companion;
export const partySlotsFree = (crew: CrewState): number => Math.max(0, MAX_PARTY - crew.party.length);
/** Rekrutiert, aber gerade nicht in der Party. */
export const reserveOf = (crew: CrewState): NpcId[] => crew.recruited.filter(npc => !crew.party.includes(npc));

export type RecruitResult =
  | { ok: true; crew: { recruited: NpcId[]; party: NpcId[] }; joinedCrew: boolean; joinedParty: boolean }
  | { ok: false; reason: string };

/**
 * Aufnehmen: Begleitfigur, deren Bedingung erfüllt ist (`allowed`), kommt in die Crew und bei freiem Platz in die
 * Party. Bereits Rekrutierte rücken nur in die Party nach (ohne erneute Prüfung).
 */
export function recruit(content: GameContent, crew: CrewState, npc: NpcId, allowed: boolean): RecruitResult {
  const def = npcOf(content, npc);
  if (!def) return { ok: false, reason: `Unbekannte Figur: ${npc}` };
  if (!def.companion) return { ok: false, reason: `${def.name} ist keine Begleitfigur.` };
  const known = crew.recruited.includes(npc);
  if (!known && !allowed) return { ok: false, reason: `${def.name} will noch nicht mitkommen.` };
  const recruited = known ? [...crew.recruited] : [...crew.recruited, npc];
  const party = [...crew.party];
  const joinedParty = !party.includes(npc) && party.length < MAX_PARTY;
  if (joinedParty) party.push(npc);
  return { ok: true, crew: { recruited, party }, joinedCrew: !known, joinedParty };
}

/** Aus der Party nehmen (bleibt in der Crew). */
export function dismiss(crew: CrewState, npc: NpcId): { crew: { recruited: NpcId[]; party: NpcId[] }; left: boolean } {
  const left = crew.party.includes(npc);
  return { crew: { recruited: [...crew.recruited], party: crew.party.filter(entry => entry !== npc) }, left };
}

/**
 * Prüft eine gewünschte Party; liefert den Grund der Ablehnung oder null. `unavailable` meldet Figuren, die gerade
 * nicht mitkönnen (`CompanionDef.unavailableWhen`), mit Grund.
 */
export function partyProblem(
  content: GameContent, crew: CrewState, party: readonly NpcId[], unavailable?: (npc: NpcId) => string | null,
): string | null {
  const list = [...new Set(party)];
  if (list.length > MAX_PARTY) return `Höchstens ${MAX_PARTY} Begleiter.`;
  for (const npc of list) {
    const def = npcOf(content, npc);
    if (!def?.companion) return `${def?.name ?? npc} ist keine Begleitfigur.`;
    if (!crew.recruited.includes(npc)) return `${def.name} gehört nicht zur Crew.`;
    const reason = unavailable?.(npc);
    if (reason) return reason;
  }
  return null;
}

/** Party ohne Doppelungen in gewünschter Reihenfolge (nach erfolgreicher Prüfung). */
export const normalizeParty = (party: readonly NpcId[]): NpcId[] => [...new Set(party)];

/** Kampffähigkeiten eines Begleiters: Grundfähigkeiten plus freigeschaltete Herz-Fähigkeiten. */
export function companionAbilities(def: NpcDef | undefined, hearts: number): AbilityId[] {
  if (!def?.companion) return [];
  const out = [...def.companion.stats.abilities];
  for (const extra of def.companion.heartAbilities ?? []) {
    if (hearts >= extra.hearts && !out.includes(extra.ability)) out.push(extra.ability);
  }
  return out;
}
