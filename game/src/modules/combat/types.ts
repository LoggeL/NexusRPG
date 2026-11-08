// Kampfregeln: Laufzeittypen des Rasterkampfs (design.md §3.7, world.md §8).
// Zuständig: Bereich combat-rules. Die Typen erweitern die Entwürfe aus contracts.ts (BattleUnit, BattleAction,
// BattleEvent), ohne sie umzudeuten: Jede `BattleAction` ist eine gültige `CombatAction`, jede `BattleEvent` ein
// gültiges `CombatEvent`, jede `CombatUnit` eine gültige `BattleUnit`.
import type {
  AbilityDef, AbilityId, ArenaDef, ArenaId, BattleObjective, BattleOutcome, BattleState, BattleUnit, Cell,
  CombatBonus, EncounterId, GameContent, ItemDef, ItemId, StatusId, WeaponKind, WeaponStats,
} from '../contracts';

/** Inhalte, die der Kampf liest (Teilmenge von GameContent – Tests dürfen kleinere Objekte übergeben). */
export type CombatData = Pick<GameContent, 'abilities' | 'arenas' | 'enemies' | 'encounters' | 'items' | 'npcs'>;

/** Einstieg in den Kampf (world.md §8.1): überrumpelt = Party zuerst und +15 auf den ersten Angriff. */
export type BattleStart = 'normal' | 'ueberrumpelt' | 'hinterhalt';
export type Difficulty = 'leicht' | 'normal' | 'hart';

/** KI-Profil einschließlich der internen Rolle „Schutzperson“ (flieht vor Gegnern, greift nicht an). */
export type AiRole = NonNullable<BattleUnit['ai']> | 'schutz';

/** Einheit im laufenden Kampf. */
export interface CombatUnit extends BattleUnit {
  /** 'player': die Darstellung wählt die Aktionen; 'ai': `planAiAction`. */
  controller: 'player' | 'ai';
  /** Zu schützende Person (Missionsziel `rescue`): fällt sie, ist der Kampf verloren. */
  vip: boolean;
  level: number;
  /** Mitgeführte Waffen; `weapon` ist immer `weapons[weaponIndex]`. */
  weapons: WeaponStats[];
  weaponIndex: number;
  /** Felder je Bewegungsaktion (3 + floor(Reflexe / 3) + Bonus). */
  move: number;
  /** Reflexe × 2 + Bonus. */
  initiative: number;
  /** Kampfboni (Perks, Cyberware, Kleidung, Schwierigkeit). */
  bonus: Required<CombatBonus>;
  /** Startmoral (Anzeige); `morale` ist der aktuelle Wert. */
  moraleMax?: number;
  /** In diesem Zug schon angegriffen (höchstens ein Angriff je Zug). */
  attacked: boolean;
  /** In diesem Zug schon die Waffe gewechselt (0 AP, einmal je Zug). */
  swapped: boolean;
  /** In diesem Zug eingesetzte Fähigkeiten (ihre Abklingzeit läuft erst ab dem nächsten Zug). */
  usedThisTurn: AbilityId[];
  /** Index der aktiven Bossphase (−1 = keine). */
  phase: number;
  /** Nach „Betäubt“ eine Runde immun. */
  stunImmune: number;
  /** Reihenfolge beim Aufstellen (Gleichstände). */
  spawn: number;
}

/** Belohnung nach einem Sieg (gezogen mit dem Kampf-Zufall). */
export interface CombatRewards {
  xp: number;
  credits: number;
  loot: Record<ItemId, number>;
}

/** Laufender Kampf. Reine Daten (JSON-fähig); jede Aktion liefert einen neuen Zustand. */
export interface CombatState extends Omit<BattleState, 'units' | 'log'> {
  units: CombatUnit[];
  log: CombatEvent[];
  /** Arena-Raster (8 Zeilen à 12 Zeichen, siehe ArenaDef). */
  layout: string[];
  hazard: { status?: StatusId; damage: number };
  objective: BattleObjective;
  /** Fortschritt beim Hack-Ziel (verbrauchte AP). */
  progress: number;
  canFlee: boolean;
  start: BattleStart;
  difficulty: Difficulty;
  /** Erster Angriff der Party bekommt noch den Überrumpelt-Bonus. */
  surprise: boolean;
  /** Gegenstände, die die Party im Kampf nutzen kann (Restbestand). */
  bag: Record<ItemId, number>;
  used: Record<ItemId, number>;
  rewards: CombatRewards | null;
  /** Nach so vielen Runden endet der Kampf als Flucht (Schutz gegen Endlosschleifen). */
  maxRounds: number;
}

/** Aktionen der aktiven Einheit. Obermenge von `BattleAction`. */
export type CombatAction =
  | { type: 'move'; to: Cell }
  | { type: 'attack'; target: string }
  | { type: 'ability'; ability: AbilityId; target?: string; cell?: Cell }
  | { type: 'item'; item: ItemId; target?: string; cell?: Cell }
  | { type: 'overwatch' }
  | { type: 'cover' }
  | { type: 'end' }
  | { type: 'flee' }
  /** Terminal hacken (Missionsziel `hack`): 1 AP Fortschritt, angrenzend oder auf dem Feld. */
  | { type: 'interact' }
  /** Waffe wechseln (0 AP, einmal je Zug). */
  | { type: 'weapon'; index: number };

/** Kampfereignisse für Animation und Protokoll. Obermenge von `BattleEvent`. */
export type CombatEvent =
  | { type: 'round'; round: number }
  | { type: 'turn'; unit: string; round: number }
  | { type: 'move'; unit: string; path: Cell[] }
  | {
    type: 'attack'; unit: string; target: string; hit: boolean; chance: number; damage: number; ability?: AbilityId;
    /** Volltreffer (×1,5). */
    crit?: boolean;
    /** Überwachungsfeuer. */
    reaction?: boolean;
  }
  | { type: 'ability'; unit: string; ability: AbilityId; target?: string; cell?: Cell }
  | { type: 'item'; unit: string; item: ItemId; target?: string }
  | { type: 'heal'; unit: string; target: string; amount: number }
  | { type: 'damage'; unit: string; amount: number; source: 'brennt' | 'blutet' | 'gefahr' }
  | { type: 'status'; unit: string; status: StatusId; turns: number }
  | { type: 'statusEnd'; unit: string; status: StatusId }
  | { type: 'resist'; unit: string; status: StatusId }
  | { type: 'skip'; unit: string; status: StatusId }
  | { type: 'morale'; unit: string; morale: number; delta: number }
  | { type: 'overwatch'; unit: string }
  | { type: 'cover'; unit: string }
  | { type: 'weapon'; unit: string; weapon: WeaponKind; index: number }
  | { type: 'phase'; unit: string; phase: number }
  | { type: 'revive'; unit: string; target: string; hp: number }
  | { type: 'objective'; unit: string; progress: number; needed: number }
  | { type: 'down'; unit: string }
  | { type: 'flee'; unit: string }
  | { type: 'surrender'; unit: string }
  | { type: 'bark'; unit: string; text: string }
  | { type: 'end'; outcome: BattleOutcome };

/** Ergebnis einer Aktion. Bei `error` bleibt der Zustand unverändert (`state` ist dann der alte). */
export interface ActResult {
  state: CombatState;
  events: CombatEvent[];
  error: string | null;
}

// ---------------------------------------------------------------------------
// Aufbau

/** Party-Mitglied für den Kampfaufbau (aus der Kampagne über `partyFromCampaign`). */
export interface PartyMemberSpec {
  id: string;
  name: string;
  source: BattleUnit['source'];
  sprite: string;
  portrait?: string;
  level: number;
  hp: number;
  maxHp: number;
  armor: number;
  attributes: BattleUnit['attributes'];
  /** Mindestens eine Waffe; die erste ist zu Beginn in der Hand. Leer → Fäuste. */
  weapons: WeaponStats[];
  abilities: AbilityId[];
  morale?: number;
  bonus?: CombatBonus;
  /** Standard 'player' (Darstellung steuert); Simulationen setzen 'ai'. */
  controller?: 'player' | 'ai';
}

export interface BattleSetup {
  encounter: EncounterId;
  /** Startwert des deterministischen Kampf-Zufalls. */
  seed: number;
  party: PartyMemberSpec[];
  /** Kampfgegenstände der Party (z. B. aus `bagFromInventory`). */
  bag?: Record<ItemId, number>;
  start?: BattleStart;
  difficulty?: Difficulty;
  maxRounds?: number;
}

// ---------------------------------------------------------------------------
// Vorschau für die Oberfläche

export interface HitPart { label: string; value: number }

export interface ReachCell {
  cell: Cell;
  /** Schritte vom Startfeld. */
  steps: number;
  /** Benötigte Aktionspunkte (1 oder 2). */
  ap: number;
  /** Weg ohne Startfeld, mit Zielfeld. */
  path: Cell[];
  /** Gefahrenfelder auf dem Weg (inklusive Ziel). */
  hazards: number;
  /** Gegnerische Überwachung, die diesen Weg abdeckt. */
  watched: string[];
}

export interface AttackPreview {
  attacker: string;
  target: string;
  ability?: AbilityId;
  from: Cell;
  /** Angriff möglich (Reichweite, Sicht, AP, Abklingzeit …). */
  valid: boolean;
  reason?: string;
  inRange: boolean;
  sight: boolean;
  /** Ohne Wurf (Flächen, Unterstützung, Gesprächsaktionen). */
  autoHit: boolean;
  /** Trefferchance 5..95 (100 bei autoHit). */
  chance: number;
  parts: HitPart[];
  /** Schaden bei Treffer (inklusive Volltreffer). */
  damage: number;
  damageParts: HitPart[];
  crit: boolean;
  /** Erwarteter Schaden = Chance × Schaden. */
  expected: number;
  lethal: boolean;
  cover: number;
  flank: boolean;
  /** Moralverlust (Gesprächsaktionen). */
  morale?: number;
  heal?: number;
  status?: { id: StatusId; turns: number; chance: number };
}

export interface AbilityOption {
  ability: AbilityDef;
  ready: boolean;
  reason?: string;
  /** Verbleibende Abklingzeit in eigenen Zügen. */
  cooldown: number;
  /** Verbleibende Einsätze (null = unbegrenzt). */
  uses: number | null;
}

export interface ItemOption {
  item: ItemDef;
  qty: number;
  /** Kampffähigkeit des Gegenstands (z. B. Granate) oder null für Heilgegenstände. */
  ability: AbilityDef | null;
  ready: boolean;
  reason?: string;
}

export interface ActionOptions {
  unit: string;
  ap: number;
  move: boolean;
  attack: boolean;
  overwatch: boolean;
  cover: boolean;
  interact: boolean;
  flee: boolean;
  swap: boolean;
  abilities: AbilityOption[];
  items: ItemOption[];
}

/** Flächenvorschau einer Fähigkeit oder eines Gegenstands auf ein Zielfeld. */
export interface AreaPreview {
  valid: boolean;
  reason?: string;
  cells: Cell[];
  affected: AttackPreview[];
}

export type { ArenaDef, ArenaId };
