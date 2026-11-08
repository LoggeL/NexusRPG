// Cyberware: sechs Plätze (kopf, augen, arme, beine, nervensystem, haut), je ein Teil. Einbau ersetzt das alte Teil
// (es kommt als Gegenstand zurück ins Inventar), Ausbau gibt das Teil zurück. Einbau beim Schrauber kostet eine
// Gebühr, frei ab der Bedingung der Werkstatt (z. B. Dante ab 2 Herzen). design.md §3.1, world.md §2.6.
//
// Die Funktionen hier planen nur (reine Regeln ohne Zustandsänderung); domains/character.ts wendet die Pläne an.
import type { CyberSlot, CyberwareId, GameContent, ItemId, PlayerState, ShopDef } from '../contracts';
import { CYBER_SLOTS, has } from '../campaign/ids';
import { asCyberware, asShop, type CharacterCyberwareDef } from './types';

export const CYBER_SLOT_LABELS: Readonly<Record<CyberSlot, string>> = {
  kopf: 'Kopf', augen: 'Augen', arme: 'Arme', beine: 'Beine', nervensystem: 'Nervensystem', haut: 'Haut',
};

export const isCyberSlot = (value: unknown): value is CyberSlot =>
  typeof value === 'string' && (CYBER_SLOTS as readonly string[]).includes(value);

export interface SlotView {
  slot: CyberSlot;
  label: string;
  part: CharacterCyberwareDef | null;
}

/** Alle sechs Plätze mit eingebautem Teil (oder null). */
export function cyberwareSlots(content: GameContent, player: Readonly<PlayerState>): SlotView[] {
  return CYBER_SLOTS.map((slot) => {
    const id = player.cyberware[slot];
    const part = id && has(content.cyberware, id) ? asCyberware(content.cyberware[id]) : null;
    return { slot, label: CYBER_SLOT_LABELS[slot], part };
  });
}

/** Gegenstand, der zu einem Teil gehört: `CyberwareDef.item` oder ein Gegenstand mit passendem `cyberware`. */
export function cyberwareItem(content: GameContent, id: CyberwareId): ItemId | null {
  const def = has(content.cyberware, id) ? content.cyberware[id] : undefined;
  if (!def) return null;
  if (def.item && has(content.items, def.item)) return def.item;
  const match = Object.values(content.items).find(item => item.cyberware === id);
  return match ? match.id : null;
}

export interface InstallOptions {
  /** Menge im Inventar (für Teile mit Gegenstand). */
  inventory: Readonly<Record<ItemId, number>>;
  /** Teil muss als Gegenstand im Inventar liegen (Einbau beim Schrauber); Effekte bauen auch ohne ein. */
  requireItem?: boolean;
  /** Werkstatt, die einbaut (Gebühr, `ripperdoc`-Angaben); ohne Werkstatt keine Gebühr. */
  shop?: ShopDef;
  /** `ripperdoc.freeWhen` ist erfüllt (vom Aufrufer ausgewertet). */
  freeInstall?: boolean;
}

export type InstallPlan =
  | { ok: false; reason: string }
  | {
    ok: true;
    part: CharacterCyberwareDef;
    slot: CyberSlot;
    /** Bisher eingebautes Teil auf diesem Platz. */
    replaces: CyberwareId | null;
    /** Zu verbrauchender Gegenstand (falls vorhanden). */
    consume: ItemId | null;
    /** Zurück ins Inventar (Gegenstand des alten Teils). */
    returns: ItemId | null;
    /** Gebühr in Credits. */
    fee: number;
  };

/** Einbaugebühr: Teilgebühr, sonst Werkstattgebühr; 0, wenn frei oder ohne Werkstatt. */
export function installFee(content: GameContent, id: CyberwareId, shop?: ShopDef, free = false): number {
  if (!shop || free || !has(content.cyberware, id)) return 0;
  const part = content.cyberware[id].installFee;
  const workshop = asShop(shop).ripperdoc?.fee;
  const fee = typeof part === 'number' ? part : typeof workshop === 'number' ? workshop : 0;
  return Math.max(0, Math.round(Number.isFinite(fee) ? fee : 0));
}

export function planInstall(content: GameContent, player: Readonly<PlayerState>, id: CyberwareId, options: InstallOptions): InstallPlan {
  const def = has(content.cyberware, id) ? asCyberware(content.cyberware[id]) : undefined;
  if (!def) return { ok: false, reason: `Unbekannte Cyberware: ${id}` };
  if (!isCyberSlot(def.slot)) return { ok: false, reason: `${def.name} passt in keinen Platz.` };
  if (options.shop && !options.shop.ripperdoc) return { ok: false, reason: `${options.shop.name} baut keine Cyberware ein.` };
  if (player.cyberware[def.slot] === id) return { ok: false, reason: `${def.name} ist bereits eingebaut.` };
  const item = cyberwareItem(content, id);
  const owned = item ? (options.inventory[item] ?? 0) > 0 : false;
  if (options.requireItem && !owned) return { ok: false, reason: `${def.name} ist nicht im Inventar.` };
  const replaces = player.cyberware[def.slot] ?? null;
  const returns = replaces ? cyberwareItem(content, replaces) : null;
  return {
    ok: true,
    part: def,
    slot: def.slot,
    replaces,
    consume: owned ? item : null,
    returns,
    fee: installFee(content, id, options.shop, options.freeInstall === true),
  };
}

export type UninstallPlan =
  | { ok: false; reason: string }
  | { ok: true; part: CharacterCyberwareDef; slot: CyberSlot; returns: ItemId };

/**
 * Ausbau eines Platzes. Teile ohne Gegenstand (Einzelstücke aus Quests) lassen sich nicht ausbauen, damit nichts
 * verloren geht.
 */
export function planUninstall(content: GameContent, player: Readonly<PlayerState>, slot: CyberSlot): UninstallPlan {
  if (!isCyberSlot(slot)) return { ok: false, reason: 'Unbekannter Cyberware-Platz.' };
  const id = player.cyberware[slot];
  if (!id) return { ok: false, reason: `Auf dem Platz ${CYBER_SLOT_LABELS[slot]} ist nichts eingebaut.` };
  const def = has(content.cyberware, id) ? asCyberware(content.cyberware[id]) : undefined;
  if (!def) return { ok: false, reason: `Unbekannte Cyberware: ${id}` };
  const returns = cyberwareItem(content, id);
  if (!returns) return { ok: false, reason: `${def.name} lässt sich nicht ausbauen.` };
  return { ok: true, part: def, slot, returns };
}

/** Kurzbeschreibung der Attributboni eines Teils, z. B. „+1 Reflexe, +2 Technik“. */
export function cyberwareBonusText(def: CharacterCyberwareDef, labels: Readonly<Record<string, string>>): string {
  return Object.entries(def.attributes ?? {})
    .filter(([, value]) => typeof value === 'number' && value !== 0)
    .map(([attribute, value]) => `${(value as number) > 0 ? '+' : '−'}${Math.abs(value as number)} ${labels[attribute] ?? attribute}`)
    .join(', ');
}
