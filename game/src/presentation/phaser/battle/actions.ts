// Aktionsleiste der Kampfdarstellung: welche Aktionen die aktive Einheit gerade hat und warum eine gesperrt ist.
// Rein (ohne Phaser/DOM); die eigentliche Prüfung macht der Regelport bei `perform`.
import type {
  AbilityDef, AbilityTarget, BattleUnit, GameContent, ItemId,
} from '../../../modules/contracts';
import { chipAbility } from '../../../modules/combat';
import { DEFAULT_AP_COST, type BattleItemStock, type BattleSessionPort, type ExtraAction, type SessionAction, type TargetedAction } from './rulesPort';

type BattleAction = SessionAction;

export type ActionKey = 'move' | 'attack' | 'abilities' | 'items' | 'overwatch' | 'cover' | 'end' | 'flee' | 'interact' | 'weapon' | 'carry';

export interface ActionEntry {
  key: ActionKey;
  label: string;
  /** Zifferntaste 1–9 (0 = keine). */
  hotkey: number;
  ap: number;
  enabled: boolean;
  reason?: string;
  /** Erklärung im Tooltip. */
  hint: string;
}

/** Eintrag im Untermenü Fähigkeiten bzw. Gegenstände. */
export interface SubEntry {
  id: string;
  kind: 'ability' | 'item';
  label: string;
  description: string;
  ap: number;
  enabled: boolean;
  reason?: string;
  target: AbilityTarget;
  range: number;
  radius?: number;
  /** „1 AP · Reichweite 4 · noch 2×“ */
  meta: string;
  action: TargetedAction;
  qty?: number;
}

export const ACTION_LABELS: Record<ActionKey, { label: string; hotkey: number; hint: string }> = {
  move: { label: 'Bewegen', hotkey: 1, hint: 'Erreichbare Felder anzeigen und hinlaufen.' },
  attack: { label: 'Angriff', hotkey: 2, hint: 'Mit der ausgerüsteten Waffe angreifen.' },
  abilities: { label: 'Fähigkeiten', hotkey: 3, hint: 'Fähigkeiten aus Cyberware, Perks und Crew.' },
  items: { label: 'Gegenstand', hotkey: 4, hint: 'Heilung, Buffs und Granaten aus dem Inventar.' },
  overwatch: { label: 'Überwachung', hotkey: 5, hint: 'Abwarten und auf den ersten Gegner schießen, der sich bewegt.' },
  cover: { label: 'Deckung', hotkey: 6, hint: 'In Deckung gehen: schwerer zu treffen bis zum nächsten Zug.' },
  end: { label: 'Zug beenden', hotkey: 7, hint: 'Restliche Aktionspunkte verfallen.' },
  flee: { label: 'Fliehen', hotkey: 8, hint: 'Den Kampf abbrechen und entkommen.' },
  interact: { label: 'Terminal', hotkey: 9, hint: 'Am Terminal arbeiten (Missionsziel).' },
  weapon: { label: 'Waffe', hotkey: 0, hint: 'Waffe wechseln (0 AP, einmal je Zug).' },
  carry: { label: 'Tragen', hotkey: 0, hint: 'Bewusstlose Person auf dem Nachbarfeld schultern (1 AP) oder absetzen (0 AP).' },
};

export function apCost(port: Pick<BattleSessionPort, 'apCost'>, content: Pick<GameContent, 'abilities' | 'items'>, unit: BattleUnit, action: BattleAction): number {
  const custom = port.apCost?.(unit.id, action);
  if (typeof custom === 'number' && Number.isFinite(custom)) return custom;
  if (action.type === 'ability') return content.abilities[action.ability]?.ap ?? 1;
  if (action.type === 'item') {
    const ability = content.items[action.item]?.use?.battle;
    return ability ? content.abilities[ability]?.ap ?? DEFAULT_AP_COST.item : DEFAULT_AP_COST.item;
  }
  return DEFAULT_AP_COST[action.type];
}

const apText = (ap: number) => `${ap} AP`;

function abilityMeta(def: AbilityDef, extra: string[]): string {
  const parts = [apText(def.ap)];
  if (def.target !== 'self') parts.push(def.range <= 1 ? 'Nahkampf' : `Reichweite ${def.range}`);
  if (def.radius) parts.push(`Radius ${def.radius}`);
  return [...parts, ...extra].join(' · ');
}

/** Gesperrt, weil die Einheit ausgeschaltet oder gehackt ist? */
export function unitBlockReason(unit: BattleUnit): string | null {
  if (unit.state !== 'active') return 'Nicht mehr kampffähig.';
  if ((unit.status.gehackt ?? 0) > 0) return 'Gehackt – setzt aus.';
  return null;
}

export function abilityEntries(port: Pick<BattleSessionPort, 'apCost' | 'blocked'>, content: Pick<GameContent, 'abilities' | 'items'>, unit: BattleUnit): SubEntry[] {
  const entries: SubEntry[] = [];
  for (const id of unit.abilities) {
    const def = content.abilities[id] ?? chipAbility(id);
    if (!def) continue;
    const action: BattleAction = { type: 'ability', ability: id };
    const ap = apCost(port, content, unit, action);
    const cooldown = unit.cooldowns[id] ?? 0;
    const remaining = def.uses !== undefined ? unit.uses[id] ?? def.uses : undefined;
    const extra: string[] = [];
    if (remaining !== undefined) extra.push(`noch ${remaining}×`);
    if (cooldown > 0) extra.push(`bereit in ${cooldown} ${cooldown === 1 ? 'Runde' : 'Runden'}`);
    let reason: string | null = unitBlockReason(unit);
    if (!reason && cooldown > 0) reason = `Abklingzeit: noch ${cooldown} ${cooldown === 1 ? 'Runde' : 'Runden'}.`;
    if (!reason && remaining !== undefined && remaining <= 0) reason = 'Keine Einsätze mehr in diesem Kampf.';
    if (!reason && unit.ap < ap) reason = `Braucht ${apText(ap)} (übrig: ${unit.ap}).`;
    if (!reason) reason = port.blocked?.(unit.id, action) ?? null;
    entries.push({
      id, kind: 'ability', label: def.name, description: def.description, ap, enabled: !reason, reason: reason ?? undefined,
      target: def.target, range: def.range, radius: def.radius, meta: abilityMeta({ ...def, ap }, extra), action: { type: 'ability', ability: id },
    });
  }
  return entries;
}

/** Kampfgegenstände: aus dem Port oder aus dem Kampagneninventar (`use.battle`). */
export function battleItemStock(port: Pick<BattleSessionPort, 'items'>, content: Pick<GameContent, 'items'>, inventory: Readonly<Record<ItemId, number>>): BattleItemStock[] {
  const stock = port.items?.() ?? Object.entries(inventory).map(([item, qty]) => ({ item, qty }));
  return stock.filter((entry) => entry.qty > 0 && !!content.items[entry.item]?.use?.battle);
}

export function itemEntries(
  port: Pick<BattleSessionPort, 'apCost' | 'blocked' | 'items'>, content: Pick<GameContent, 'abilities' | 'items'>, unit: BattleUnit, inventory: Readonly<Record<ItemId, number>>,
): SubEntry[] {
  return battleItemStock(port, content, inventory).map(({ item, qty }) => {
    const def = content.items[item];
    const ability = def.use?.battle ? content.abilities[def.use.battle] : undefined;
    const action: BattleAction = { type: 'item', item };
    const ap = apCost(port, content, unit, action);
    let reason: string | null = unitBlockReason(unit);
    if (!reason && unit.ap < ap) reason = `Braucht ${apText(ap)} (übrig: ${unit.ap}).`;
    if (!reason) reason = port.blocked?.(unit.id, action) ?? null;
    const target = ability?.target ?? 'self';
    const range = ability?.range ?? 0;
    const meta = [apText(ap), target === 'self' ? 'auf dich' : range <= 1 ? 'Nahbereich' : `Reichweite ${range}`, `${qty}× im Gepäck`];
    if (ability?.radius) meta.splice(2, 0, `Radius ${ability.radius}`);
    return {
      id: item, kind: 'item' as const, label: def.name, description: def.use?.text ?? ability?.description ?? def.description,
      ap, enabled: !reason, reason: reason ?? undefined, target, range, radius: ability?.radius, meta: meta.join(' · '), action: { type: 'item' as const, item }, qty,
    };
  });
}

export interface MainActionInput {
  unit: BattleUnit;
  port: Pick<BattleSessionPort, 'apCost' | 'blocked'>;
  content: Pick<GameContent, 'abilities' | 'items'>;
  reachable: number;
  attackTargets: number;
  abilities: readonly SubEntry[];
  items: readonly SubEntry[];
  canFlee: boolean;
  /** Zusatzaktionen der Regeln (Terminal, Waffenwechsel). */
  extras?: readonly ExtraAction[];
}

/** Hauptleiste 1–7 (+ 8 Fliehen, falls erlaubt). */
export function mainActions(input: MainActionInput): ActionEntry[] {
  const { unit, port, content } = input;
  const blockedUnit = unitBlockReason(unit);
  const entry = (key: ActionKey, action: BattleAction, extra: (ap: number) => string | null): ActionEntry => {
    const meta = ACTION_LABELS[key];
    const ap = apCost(port, content, unit, action);
    let reason = blockedUnit;
    if (!reason && unit.ap < ap) reason = unit.ap <= 0 ? 'Keine Aktionspunkte mehr.' : `Braucht ${apText(ap)} (übrig: ${unit.ap}).`;
    if (!reason) reason = extra(ap);
    if (!reason) reason = port.blocked?.(unit.id, action) ?? null;
    return { key, label: meta.label, hotkey: meta.hotkey, ap, enabled: !reason, reason: reason ?? undefined, hint: meta.hint };
  };
  const list: ActionEntry[] = [
    entry('move', { type: 'move', to: unit.cell }, () => (input.reachable > 0 ? null : 'Kein freies Feld erreichbar.')),
    entry('attack', { type: 'attack', target: '' }, () => (input.attackTargets > 0 ? null : 'Kein Gegner in Reichweite.')),
    groupEntry('abilities', input.abilities, unit, blockedUnit, 'Keine Fähigkeiten.'),
    groupEntry('items', input.items, unit, blockedUnit, 'Keine Kampfgegenstände im Gepäck.'),
    entry('overwatch', { type: 'overwatch' }, () => (unit.overwatch ? 'Überwachung läuft bereits.' : null)),
    entry('cover', { type: 'cover' }, () => null),
    { key: 'end', label: ACTION_LABELS.end.label, hotkey: ACTION_LABELS.end.hotkey, ap: 0, enabled: unit.state === 'active', hint: ACTION_LABELS.end.hint },
  ];
  for (const extra of input.extras ?? []) {
    const meta = ACTION_LABELS[extra.key];
    const reason = blockedUnit ?? (extra.enabled ? null : extra.reason ?? 'Gerade nicht möglich.');
    list.push({ key: extra.key, label: extra.label || meta.label, hotkey: meta.hotkey, ap: extra.ap, enabled: !reason, reason: reason ?? undefined, hint: extra.hint || meta.hint });
  }
  if (input.canFlee) {
    const flee = entry('flee', { type: 'flee' }, () => null);
    // Fliehen kostet keine Bewegung, braucht aber eine handlungsfähige Einheit.
    list.push({ ...flee, enabled: !blockedUnit && flee.enabled });
  }
  return list.sort((a, b) => (a.hotkey || 99) - (b.hotkey || 99));
}

function groupEntry(key: 'abilities' | 'items', entries: readonly SubEntry[], unit: BattleUnit, blockedUnit: string | null, empty: string): ActionEntry {
  const meta = ACTION_LABELS[key];
  const usable = entries.filter((entry) => entry.enabled);
  const minAp = entries.length ? Math.min(...entries.map((entry) => entry.ap)) : 1;
  let reason: string | null = blockedUnit;
  if (!reason && !entries.length) reason = empty;
  if (!reason && !usable.length) reason = unit.ap <= 0 ? 'Keine Aktionspunkte mehr.' : entries[0]?.reason ?? 'Gerade nicht einsetzbar.';
  return { key, label: meta.label, hotkey: meta.hotkey, ap: minAp, enabled: !reason, reason: reason ?? undefined, hint: meta.hint };
}
