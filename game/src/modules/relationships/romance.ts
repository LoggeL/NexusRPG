// Romanze-Schalter (design.md §3.3, AGENTS.md Jugendschutz): Romanzeoptionen nur für Figuren, die in
// `content/romance.ts` freigeschaltet (`GameContent.romance`), als `romanceable` gekennzeichnet, keine Kinder und
// bei mindestens 8 Herzen sind. Kinderfiguren sind nie romanzierbar – unabhängig von jedem Schalter.
import type { GameContent, NpcDef, NpcId } from '../contracts';
import { maxHeartsOf } from './extras';
import { heartsOf } from './points';

export const ROMANCE_HEARTS = 8;

export type RomanceBlock = 'unbekannt' | 'kind' | 'nicht-romanzierbar' | 'nicht-freigeschaltet' | 'herzen';
export const ROMANCE_BLOCK_TEXT: Readonly<Record<RomanceBlock, string>> = {
  unbekannt: 'Unbekannte Figur.',
  kind: 'Nur Freundschaft.',
  'nicht-romanzierbar': 'Nur Freundschaft.',
  'nicht-freigeschaltet': 'Nur Freundschaft.',
  herzen: `Ab ♥${ROMANCE_HEARTS}.`,
};

export interface RomanceStatus {
  /** Romanzeoptionen jetzt offen? */
  open: boolean;
  /** Grundsätzlich möglich (Schalter, Kennzeichen, kein Kind), unabhängig von den Herzen. */
  eligible: boolean;
  blocked: RomanceBlock | null;
}

/** Darf diese Figur grundsätzlich romanzierbar sein? (Kinder nie.) */
export function romanceEligible(def: NpcDef | undefined, enabled: ReadonlySet<NpcId>): boolean {
  return !!def && def.child !== true && def.romanceable === true && enabled.has(def.id);
}

export function romanceStatus(content: GameContent, npc: NpcId, points: number): RomanceStatus {
  const def = Object.prototype.hasOwnProperty.call(content.npcs, npc) ? content.npcs[npc] : undefined;
  if (!def) return { open: false, eligible: false, blocked: 'unbekannt' };
  if (def.child === true) return { open: false, eligible: false, blocked: 'kind' };
  if (def.romanceable !== true) return { open: false, eligible: false, blocked: 'nicht-romanzierbar' };
  if (!content.romance.has(npc)) return { open: false, eligible: false, blocked: 'nicht-freigeschaltet' };
  if (heartsOf(points, maxHeartsOf(def)) < ROMANCE_HEARTS) return { open: false, eligible: true, blocked: 'herzen' };
  return { open: true, eligible: true, blocked: null };
}

/**
 * Zusätzliche Romanzeprobleme im Inhalt. Kinder, unbekannte und nicht gekennzeichnete Figuren im Schalter meldet
 * bereits campaign/lint.ts; hier: Figuren, die wegen ihrer Herz-Obergrenze nie 8 Herzen erreichen.
 */
export function romanceProblems(content: GameContent): string[] {
  const problems: string[] = [];
  for (const npc of content.romance) {
    const def = Object.prototype.hasOwnProperty.call(content.npcs, npc) ? content.npcs[npc] : undefined;
    const cap = maxHeartsOf(def);
    if (cap !== undefined && cap < ROMANCE_HEARTS) problems.push(`Romanze: „${npc}“ erreicht höchstens ${cap} Herzen, nötig sind ${ROMANCE_HEARTS}`);
  }
  return problems;
}
