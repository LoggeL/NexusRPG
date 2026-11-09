// Kampfregeln: Stellschrauben (design.md §3.7, world.md §8). Alle Zahlen an einer Stelle, damit Tests und
// Feinschliff nicht in der Logik suchen müssen.
import type { AbilityDef, AttributeId, StatusId, WeaponKind, WeaponStats } from '../contracts';

export const GRID_COLS = 12;
export const GRID_ROWS = 8;
/** Pixel je Feld auf dem 1536×1024-Arenabild. */
export const CELL_PX = 128;

export const AP_PER_TURN = 2;
/** Bewegung = 3 + floor(Reflexe / 3) Felder je Aktionspunkt. */
export const MOVE_BASE = 3;
export const MOVE_REFLEX_DIVISOR = 3;
/** Initiative = Reflexe × 2 + Bonus. */
export const INITIATIVE_REFLEX_FACTOR = 2;

export const HIT_BASE = 75;
export const HIT_PER_REFLEX = 5;
export const HIT_MIN = 5;
export const HIT_MAX = 95;
export const COVER_HALF = 20;
export const COVER_FULL = 40;
export const FLANK_BONUS = 15;
export const MARKED_BONUS = 20;
export const PROTECTED_PENALTY = 20;
export const OVERWATCH_PENALTY = 10;
export const SURPRISE_BONUS = 15;
export const EASY_HIT_BONUS = 10;

/** Volltreffer bei Flanke ohne Deckung oder auf „Markiert“ (kein zufälliger Krit). */
export const CRIT_MULTIPLIER = 1.5;
export const MIN_DAMAGE = 1;

export const BURN_DAMAGE = 4;
export const BLEED_DAMAGE = 2;
/** Gefahrenfeld ohne eigene Angabe in ArenaDef.hazard. */
export const DEFAULT_HAZARD_DAMAGE = 3;

/** Moral (0–100): unter 30 Flucht, unter 15 Aufgabe. */
export const MORALE_FLEE_BELOW = 30;
export const MORALE_SURRENDER_BELOW = 15;
export const MORALE_ALLY_DOWN = 20;
export const MORALE_CRIT = 10;
/** Gesprächsaktionen: Moralverlust = Fähigkeitsschaden + Faktor × Attribut. */
export const SOCIAL_ATTRIBUTE_FACTOR = 4;

/** Aufrichten: K.O.-Verbündeter steht mit diesem LP-Anteil wieder auf. */
export const REVIVE_FRACTION = 0.25;

export const DIFFICULTY_HP: Readonly<Record<'leicht' | 'normal' | 'hart', number>> = { leicht: 0.75, normal: 1, hart: 1.25 };

export const DEFAULT_MAX_ROUNDS = 60;

/** Fliehende Gegner geben die Hälfte ihrer XP. */
export const FLED_XP_FACTOR = 0.5;

/** Schadensattribut je Waffenart (Nahkampf Körper, Fernkampf Reflexe, Smart/Hack Technik). */
export const WEAPON_ATTRIBUTE: Readonly<Record<WeaponKind, AttributeId>> = {
  nahkampf: 'koerper', fernkampf: 'reflexe', smart: 'technik',
};

/** Fähigkeitsart → passende Waffenart (Waffenschaden zählt mit). */
export const ABILITY_WEAPON: Readonly<Partial<Record<AbilityDef['kind'], WeaponKind>>> = {
  nahkampf: 'nahkampf', fernkampf: 'fernkampf', hack: 'smart',
};

/** Ohne Waffe: Fäuste. */
export const UNARMED: WeaponStats = { kind: 'nahkampf', damage: 2, range: 1 };

/** Positive Zustände (für KI und Flächenwirkung auf Verbündete). */
export const POSITIVE_STATUS: ReadonlySet<StatusId> = new Set<StatusId>(['geschuetzt', 'ermutigt']);
/** „Ermutigt“: zusätzliche AP im nächsten eigenen Zug. */
export const ENCOURAGED_AP = 1;
/** Zustände, die eine Fluchtuhr anhalten (der Boss kommt nicht vom Fleck). */
export const HOLD_STATUS: readonly StatusId[] = ['betaeubt', 'gehackt'];
/** Zustände, die den eigenen Zug aussetzen lassen. */
export const SKIP_STATUS: readonly StatusId[] = ['gehackt', 'betaeubt'];

export const STATUS_LABELS: Readonly<Record<StatusId, string>> = {
  gehackt: 'Gehackt', betaeubt: 'Betäubt', brennt: 'Brennt', markiert: 'Markiert', geschuetzt: 'Geschützt', blutet: 'Angeschlagen',
  ermutigt: 'Ermutigt', gesteuert: 'Gesteuert',
};

/** Fähigkeiten, die jede Party-Einheit kennt. Inhalte dürfen sie unter derselben ID überschreiben. */
export const ABILITY_INTIMIDATE = 'kampf-einschuechtern';
export const ABILITY_REVIVE = 'kampf-aufrichten';

export const BUILTIN_ABILITIES: Readonly<Record<string, AbilityDef>> = {
  [ABILITY_INTIMIDATE]: {
    id: ABILITY_INTIMIDATE, name: 'Einschüchtern',
    description: 'Senkt die Moral eines Gegners (Ausstrahlung). Wer zu tief sinkt, flieht oder ergibt sich.',
    kind: 'sozial', ap: 1, target: 'enemy', range: 5, damage: 10, attribute: 'ausstrahlung', cooldown: 1,
  },
  [ABILITY_REVIVE]: {
    id: ABILITY_REVIVE, name: 'Aufrichten',
    description: 'Hilft einem angeschlagenen Verbündeten auf dem Nachbarfeld wieder auf die Beine.',
    kind: 'support', ap: 1, target: 'ally', range: 1,
  },
};

/** Fähigkeiten, die jede Party-Einheit zusätzlich zu ihren eigenen bekommt. */
export const PARTY_BUILTINS: readonly string[] = [ABILITY_INTIMIDATE, ABILITY_REVIVE];

/**
 * Gechippte (EnemyRule `chipped`): Chip ruhigstellen bzw. ziehen. Nur in Kämpfen mit Gechippten (auch per Funkruf).
 * Chip-Ruhe ist der Fernzugriff `hack-chip-ruhe` aus dem Inhalt; die Fassung hier gilt nur, wenn der Inhalt sie nicht kennt.
 */
export const ABILITY_CHIP_CALM = 'hack-chip-ruhe';
export const ABILITY_CHIP_FREE = 'kampf-chip-ziehen';
export const CHIP_BUILTINS: readonly string[] = [ABILITY_CHIP_CALM, ABILITY_CHIP_FREE];
/** Anzeigenamen der Fraktionen für Kampfhinweise (Rufverlust); sonst die ID. */
export const REP_LABELS: Readonly<Record<string, string>> = {
  unterstadt: 'Unterstadt', 'chrome-haus': 'Chrome-Haus', quantum: 'Quantum', kanalvolk: 'Kanalvolk', staubfalken: 'Staubfalken',
};
/** Befreien geht ohne Betäubung/Hack ab diesem LP-Anteil abwärts. */
export const CHIP_FREE_BELOW = 0.5;
/** Trefferbonus Gechippter, solange ein Nexus-Knoten steht (Standard der Regel `chipped`). */
export const CHIPPED_HIT_BONUS = 10;

export const CHIP_ABILITIES: Readonly<Record<string, AbilityDef>> = {
  [ABILITY_CHIP_CALM]: {
    id: ABILITY_CHIP_CALM, name: 'Chip-Ruhe',
    description: 'Störsignal auf die Chip-Frequenz: Der Chip hält zwei Runden die Klappe (Gehackt). Danach lässt er sich ziehen.',
    kind: 'hack', ap: 1, target: 'enemy', range: 6, status: { id: 'gehackt', turns: 2, chance: 0.8 }, cooldown: 3, chippedOnly: true,
  },
  [ABILITY_CHIP_FREE]: {
    id: ABILITY_CHIP_FREE, name: 'Chip ziehen',
    description: 'Den Chip hinterm Ohr rausziehen – befreien statt umhauen, ohne Rufverlust. Geht nur, wenn die Person stillhält: betäubt, gehackt oder angeschlagen (höchstens halbe LP).',
    kind: 'trick', ap: 1, target: 'enemy', range: 1, special: 'free', chippedOnly: true,
  },
};

/** Chip-Fähigkeit (Chip-Ruhe, Chip ziehen) oder undefined – die Aktionsleiste listet sie neben den Inhaltsfähigkeiten. */
export const chipAbility = (id: string): AbilityDef | undefined =>
  Object.prototype.hasOwnProperty.call(CHIP_ABILITIES, id) ? CHIP_ABILITIES[id] : undefined;

/** Eingebaute Kampffähigkeit (Einschüchtern, Aufrichten, Chip-Ruhe, Chip ziehen) oder undefined. */
export function builtinAbility(id: string): AbilityDef | undefined {
  if (Object.prototype.hasOwnProperty.call(BUILTIN_ABILITIES, id)) return BUILTIN_ABILITIES[id];
  return Object.prototype.hasOwnProperty.call(CHIP_ABILITIES, id) ? CHIP_ABILITIES[id] : undefined;
}
