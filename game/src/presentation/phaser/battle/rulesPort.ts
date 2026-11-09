// Schmale Adapter-Schnittstelle zwischen Kampfdarstellung (combat-presentation) und Kampfregeln (modules/combat).
//
// Die Darstellung liest den Kampfzustand nur (`BattleState` aus contracts.ts) und schickt Aktionen
// (`BattleAction`) zurück. Alles, was Regeln kennt – Pfade, Trefferchance, Schaden, KI –, kommt über
// diesen Port. Die Integration baut aus der Regel-API in modules/combat eine `BattleSessionPort`-Instanz
// je Kampf (siehe docs/engine-notes.md, „Vertragswünsche (combat-presentation)“).
import type { CombatAction, CombatEvent } from '../../../modules/combat';
import type {
  AbilityId, ArenaDef, BattleResult, BattleState, Cell, EncounterDef, ItemId, StatusId,
} from '../../../modules/contracts';

/** Aktionen an die Regeln: `BattleAction` aus contracts.ts plus Erweiterungen aus modules/combat (Terminal, Waffenwechsel). */
export type SessionAction = CombatAction;
/** Ereignisse aus den Regeln: `BattleEvent` plus Erweiterungen aus modules/combat (Runde, DoT, Moral, Phasen …). */
export type SessionEvent = CombatEvent;
/** Kampfzustand, wie die Darstellung ihn liest (`BattleState` mit erweitertem Protokoll). */
export type SessionState = Omit<BattleState, 'log'> & { log: readonly SessionEvent[] };

/** Ein erreichbares Feld der Einheit, inklusive Pfad ab dem aktuellen Feld (ohne Startfeld). */
export interface ReachOption {
  cell: Cell;
  /** Felder vom Nachbarn des Startfelds bis einschließlich `cell`. */
  path: Cell[];
  /** Aktionspunkte für diese Bewegung (1 = normal, 2 = Sprint), Standard 1. */
  ap?: number;
}

/** Aktionen mit Ziel, für die Ziele und Trefferchancen vorab angezeigt werden. */
export type TargetedAction =
  | { type: 'attack' }
  | { type: 'ability'; ability: AbilityId }
  | { type: 'item'; item: ItemId };

export type CoverLevel = 'none' | 'half' | 'full';

/** Vorschau für ein mögliches Ziel (Einheit oder Feld). */
export interface TargetPreview {
  /** Einheiten-ID; fehlt bei reinen Feldzielen. */
  unit?: string;
  cell: Cell;
  /** Trefferchance in Prozent (5–95); fehlt bei Wirkungen ohne Trefferwurf (Heilung, Schutz). */
  chance?: number;
  /** Erwarteter Schaden: fester Wert oder Spanne. */
  damage?: number | readonly [min: number, max: number];
  heal?: number;
  cover?: CoverLevel;
  flank?: boolean;
  status?: { id: StatusId; turns: number; chance?: number };
  /** Kurzer Zusatz („Ziel ist gehackt“, „Moral 30“). */
  note?: string;
  /** Aufschlüsselung der Trefferchance („Basis 75“, „Deckung −20“ …). */
  breakdown?: string[];
  /** Feld liegt in Reichweite, ist aber gerade kein gültiges Ziel (z. B. Sichtlinie blockiert). */
  blocked?: string;
}

export type PerformResult =
  | { ok: true; events: SessionEvent[] }
  | { ok: false; error: string };

/** Zusatzaktion der Regeln (Terminal hacken, Waffe wechseln, Bewusstlose tragen) für die Aktionsleiste. */
export interface ExtraAction {
  key: 'interact' | 'weapon' | 'carry';
  label: string;
  hint: string;
  enabled: boolean;
  reason?: string;
  ap: number;
  action: SessionAction;
}

/** Flächenvorschau auf ein Zielfeld: betroffene Felder und Einheiten. */
export interface AreaTargets { cells: Cell[]; previews: TargetPreview[]; blocked?: string }

/** Kampfgegenstand mit aktuellem Bestand (abzüglich bereits im Kampf verbrauchter Stücke). */
export interface BattleItemStock { item: ItemId; qty: number }

/**
 * Laufende Kampfsitzung. Zustandsbehaftet: `perform`/`aiStep` ändern den Zustand,
 * `state()` liefert danach den neuen Stand. Die Darstellung behandelt alle Rückgaben als unveränderlich.
 */
export interface BattleSessionPort {
  readonly encounter: EncounterDef;
  readonly arena: ArenaDef;
  /** Aktueller Zustand (nach dem letzten `perform`/`aiStep`). */
  state(): Readonly<SessionState>;
  /**
   * Startereignisse (erste `turn`-Meldung, Bossrufe …). Wird genau einmal vor dem ersten Zug abgefragt.
   * Fehlt die Methode, beginnt die Darstellung ohne Startereignisse.
   */
  start?(): SessionEvent[];
  /** Erreichbare Felder der Einheit mit ihren aktuellen Aktionspunkten. */
  reachable(unitId: string): ReachOption[];
  /** Mögliche Ziele mit Trefferchance und Schaden. Leer = keine Ziele in Reichweite. */
  targets(unitId: string, action: TargetedAction): TargetPreview[];
  /** Aktion der aktiven Einheit ausführen (`state().active`). */
  perform(action: SessionAction): PerformResult;
  /**
   * Ein Schritt der KI für die aktive Gegner-Einheit (eine Aktion oder der ganze Zug).
   * Muss Fortschritt garantieren: entweder Ereignisse liefern oder den Zug weitergeben.
   */
  aiStep(): SessionEvent[];
  /** Ergebnis für `CampaignPort.finishBattle`; gültig, sobald `state().outcome` gesetzt ist. */
  result(): BattleResult;
  // ---- optional: Feinheiten, für die die Darstellung sonst Näherungen nutzt
  /** AP-Kosten einer Aktion (Standard siehe DEFAULT_AP_COST). */
  apCost?(unitId: string, action: SessionAction): number;
  /** Kampfgegenstände im Inventar (Standard: Inventar der Kampagne mit `use.battle`). */
  items?(): BattleItemStock[];
  /** Felder in Reichweite einer Fähigkeit mit Feld-/Flächenziel (Standard: Manhattan-Abstand ≤ Reichweite). */
  cellsInRange?(unitId: string, action: TargetedAction): Cell[];
  /** Betroffene Felder einer Flächenwirkung um `center` (Standard: Manhattan-Radius). */
  area?(action: TargetedAction, center: Cell): Cell[];
  /** Genaue Flächenvorschau (Vorrang vor `area` + gefilterten `targets`). */
  areaTargets?(unitId: string, action: TargetedAction, center: Cell): AreaTargets;
  /** Grund, warum eine Aktion gerade nicht geht (null = möglich); ergänzt die eigene Prüfung. */
  blocked?(unitId: string, action: SessionAction): string | null;
  /** Zusätzliche Aktionen der aktiven Einheit (Terminal hacken, Waffe wechseln). */
  extraActions?(unitId: string): ExtraAction[];
}

/** Erzeugt je Begegnung eine Sitzung. `null` = Begegnung unbekannt oder Regeln fehlen. */
export type BattleSessionFactory = (encounter: EncounterDef) => BattleSessionPort | null;

/** Standard-AP-Kosten laut design.md §3.7 (2 AP je Einheit); Fähigkeiten nutzen `AbilityDef.ap`. */
export const DEFAULT_AP_COST = {
  move: 1,
  attack: 1,
  item: 1,
  overwatch: 1,
  cover: 1,
  end: 0,
  flee: 0,
  interact: 1,
  weapon: 0,
  carry: 1,
} as const;
