// Zusatzangaben für Beziehungen, die world.md verlangt, der Vertrag (contracts.ts) aber noch nicht kennt.
// Sie werden tolerant aus den Definitionen gelesen; sobald die Felder im Vertrag stehen (Vertragswünsche in
// docs/engine-notes.md), wirken Inhalte ohne weitere Änderung hier.
import type { Condition, NpcDef, PerkDef } from '../contracts';

export interface NpcRelationExtras {
  /** Herz-Obergrenze für Weltfiguren mit Kurzeintrag (world.md §4.1: höchstens 5, erweitert 6). Standard 10. */
  maxHearts?: number;
  /** Geburtstag: Geschenke zählen dreifach, solange erfüllt (z. B. `{ weekday: 'sa' }` oder ein Kalendertag). */
  birthday?: Condition;
}

export interface PerkRelationExtras {
  /** Zusätzliche Punkte beim täglichen Ansprechen (z. B. `perk-anfeuern` +10). */
  talkBonus?: number;
}

const isObject = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const finite = (value: unknown): number | undefined => (typeof value === 'number' && Number.isFinite(value) ? value : undefined);

export function npcExtras(def: NpcDef | undefined): NpcRelationExtras {
  if (!def) return {};
  const raw = def as NpcDef & Record<string, unknown>;
  const out: NpcRelationExtras = {};
  const maxHearts = finite(raw.maxHearts);
  if (maxHearts !== undefined) out.maxHearts = maxHearts;
  if (isObject(raw.birthday)) out.birthday = raw.birthday as Condition;
  return out;
}

export function perkExtras(def: PerkDef | undefined): PerkRelationExtras {
  if (!def) return {};
  const raw = def as PerkDef & Record<string, unknown>;
  const talkBonus = finite(raw.talkBonus);
  return talkBonus !== undefined ? { talkBonus } : {};
}

/** Herz-Obergrenze einer Figur (undefined = 10). */
export const maxHeartsOf = (def: NpcDef | undefined): number | undefined => npcExtras(def).maxHearts;
