// Fraktionsruf −100 … 100 mit Stufen (design.md §3.5, world.md 10.2). Reine Regeln ohne Inhaltsbezug.
// Zuständig: Bereich quests+economy. Die Kampagnen-Domäne (campaign/domains/economy.ts) schreibt den Zustand,
// dieses Modul rechnet: Begrenzung, Stufe, Preis- und Check-Wirkung, Meldungstexte, Übersicht für die Oberfläche.
import { REP_MAX, REP_MIN, clamp, has } from '../campaign/ids';
import type { FactionId, GameContent, GameState } from '../contracts';

export type RepTierId = 'verhasst' | 'feindlich' | 'misstrauisch' | 'neutral' | 'geduldet' | 'respektiert' | 'verehrt';

/** Eine Rufstufe mit ihrem Wertebereich (beide Grenzen einschließlich) und ihrer Wirkung. */
export interface RepTierDef {
  id: RepTierId;
  /** Anzeigename, z. B. „Geduldet“. */
  name: string;
  min: number;
  max: number;
  /** Preisaufschlag beim Kauf in Prozent (negativ = Rabatt), z. B. −10 bei „Geduldet“. */
  priceModifier: number;
  /** Zusätzliche Prozentpunkte auf die Ankaufsquote (negativ = schlechterer Ankauf). */
  sellBonus: number;
  /** Erhöhung der Schwelle bei Gesprächs-Checks mit Mitgliedern der Fraktion. */
  checkPenalty: number;
  /** Händler der Fraktion verweigern den Handel. */
  refusesTrade: boolean;
  /** Mitglieder greifen an (Begegnung bei Betreten). */
  hostile: boolean;
}

/** Rufstufen nach world.md 10.2, aufsteigend und lückenlos von −100 bis 100. */
export const REP_TIERS: readonly RepTierDef[] = [
  { id: 'verhasst', name: 'Verhasst', min: -100, max: -51, priceModifier: 50, sellBonus: -20, checkPenalty: 2, refusesTrade: true, hostile: true },
  { id: 'feindlich', name: 'Feindlich', min: -50, max: -21, priceModifier: 50, sellBonus: -10, checkPenalty: 2, refusesTrade: false, hostile: false },
  { id: 'misstrauisch', name: 'Misstrauisch', min: -20, max: -1, priceModifier: 25, sellBonus: -5, checkPenalty: 1, refusesTrade: false, hostile: false },
  { id: 'neutral', name: 'Neutral', min: 0, max: 19, priceModifier: 0, sellBonus: 0, checkPenalty: 0, refusesTrade: false, hostile: false },
  { id: 'geduldet', name: 'Geduldet', min: 20, max: 49, priceModifier: -10, sellBonus: 5, checkPenalty: 0, refusesTrade: false, hostile: false },
  { id: 'respektiert', name: 'Respektiert', min: 50, max: 79, priceModifier: -15, sellBonus: 10, checkPenalty: 0, refusesTrade: false, hostile: false },
  { id: 'verehrt', name: 'Verehrt', min: 80, max: 100, priceModifier: -20, sellBonus: 15, checkPenalty: 0, refusesTrade: false, hostile: false },
];

const NEUTRAL: RepTierDef = REP_TIERS[3];

/** Ruf auf den gültigen Bereich begrenzen und runden; ungültige Zahlen gelten als 0. */
export const clampRep = (value: number): number => (Number.isFinite(value) ? clamp(Math.round(value), REP_MIN, REP_MAX) : 0);

/** Aktueller Ruf bei einer Fraktion (fehlend = 0). */
export const repOf = (state: Readonly<GameState>, faction: FactionId): number =>
  has(state.reputation, faction) ? clampRep(state.reputation[faction]) : 0;

/** Stufe zu einem Rufwert. Eigene Stufenlisten müssen aufsteigend sein (siehe `repTierProblems`). */
export function repTier(value: number, tiers: readonly RepTierDef[] = REP_TIERS): RepTierDef {
  const rep = clampRep(value);
  return tiers.find(tier => rep >= tier.min && rep <= tier.max) ?? NEUTRAL;
}

/** Stufe einer Fraktion; ohne Fraktion (Händler ohne Zugehörigkeit) gilt „Neutral“. */
export function factionTier(state: Readonly<GameState>, faction: FactionId | undefined, tiers: readonly RepTierDef[] = REP_TIERS): RepTierDef {
  return faction ? repTier(repOf(state, faction), tiers) : (tiers.find(tier => tier.id === 'neutral') ?? NEUTRAL);
}

export interface RepChange {
  before: number;
  after: number;
  /** Tatsächliche Änderung nach Begrenzung. */
  delta: number;
  tierBefore: RepTierDef;
  tierAfter: RepTierDef;
  tierChanged: boolean;
}

/** Rechnet eine Rufänderung aus (ohne Zustand zu schreiben). */
export function applyRepDelta(before: number, delta: number, tiers: readonly RepTierDef[] = REP_TIERS): RepChange {
  const start = clampRep(before);
  const after = clampRep(start + (Number.isFinite(delta) ? Math.round(delta) : 0));
  const tierBefore = repTier(start, tiers);
  const tierAfter = repTier(after, tiers);
  return { before: start, after, delta: after - start, tierBefore, tierAfter, tierChanged: tierBefore.id !== tierAfter.id };
}

/** Banner-Text wie in world.md 10.1: „Kanalvolk +15“ bzw. „Kanalvolk −5“. */
export function repDeltaText(factionName: string, delta: number): string {
  const amount = Math.abs(Math.round(delta));
  return `${factionName} ${delta < 0 ? '−' : '+'}${amount}`;
}

/** Meldung bei Stufenwechsel: „Kanalvolk: jetzt Geduldet“. */
export const repTierText = (factionName: string, tier: RepTierDef): string => `${factionName}: jetzt ${tier.name}`;

/** Meldungen zu einer Änderung (leer, wenn sich nichts geändert hat). */
export function repMessages(factionName: string, change: RepChange): string[] {
  if (change.delta === 0) return [];
  const out = [repDeltaText(factionName, change.delta)];
  if (change.tierChanged) out.push(repTierText(factionName, change.tierAfter));
  return out;
}

export interface FactionStanding {
  faction: FactionId;
  name: string;
  description?: string;
  value: number;
  tier: RepTierDef;
  /** Abstand zur nächsthöheren Stufe (null auf der höchsten). */
  toNext: number | null;
}

/** Übersicht aller Fraktionen für die Oberfläche (Reihenfolge wie im Inhalt). */
export function factionStandings(content: GameContent, state: Readonly<GameState>, tiers: readonly RepTierDef[] = REP_TIERS): FactionStanding[] {
  return Object.values(content.factions).map((faction) => {
    const value = repOf(state, faction.id);
    const tier = repTier(value, tiers);
    const next = tiers.find(entry => entry.min > tier.max);
    const standing: FactionStanding = { faction: faction.id, name: faction.name, value, tier, toNext: next ? next.min - value : null };
    if (faction.description) standing.description = faction.description;
    return standing;
  });
}

/** Schwellen-Aufschlag für Checks mit Mitgliedern einer Fraktion (Feindlich +2, Misstrauisch +1). */
export const repCheckPenalty = (state: Readonly<GameState>, faction: FactionId | undefined, tiers: readonly RepTierDef[] = REP_TIERS): number =>
  factionTier(state, faction, tiers).checkPenalty;

/** Ist die Fraktion der Spielfigur feindlich gesinnt (Angriff beim Betreten)? */
export const isHostile = (state: Readonly<GameState>, faction: FactionId | undefined, tiers: readonly RepTierDef[] = REP_TIERS): boolean =>
  factionTier(state, faction, tiers).hostile;

/** Prüft eine Stufenliste: aufsteigend, lückenlos, deckt −100 … 100 ab. */
export function repTierProblems(tiers: readonly RepTierDef[]): string[] {
  const problems: string[] = [];
  if (!tiers.length) return ['Keine Rufstufen.'];
  if (tiers[0].min !== REP_MIN) problems.push(`Erste Rufstufe beginnt nicht bei ${REP_MIN}.`);
  if (tiers[tiers.length - 1].max !== REP_MAX) problems.push(`Letzte Rufstufe endet nicht bei ${REP_MAX}.`);
  tiers.forEach((tier, index) => {
    if (tier.min > tier.max) problems.push(`Rufstufe ${tier.id}: min > max.`);
    const prev = tiers[index - 1];
    if (prev && tier.min !== prev.max + 1) problems.push(`Rufstufe ${tier.id} schließt nicht an ${prev.id} an.`);
  });
  return problems;
}
