// Domäne „Wetter und Ausrüstung“ (Bereich engine-welt): Wetterbedingung aus modules/time/weather.ts, Bedingung
// `{ equipped }` (angelegt statt nur im Gepäck), Ladungen von Gegenständen (`ItemDef.charges`, Effekt `{ useCharge }`)
// und eintägige Kartenhinweise.
//
// Ladungen liegen ohne neues Speicherfeld in den Flags: `ladung:<item>:<n>` = am obersten Stück sind n Ladungen
// verbraucht (fehlt das Flag, ist es voll). Der Nachlauf räumt das Flag weg, sobald kein Stück mehr im Gepäck ist.
import type { GameContent, GameState, ItemId } from '../../contracts';
import { weatherAt } from '../../time/weather';
import { asList, has } from '../ids';
import type { ConditionSpecs, EffectSpecs, SettleHook } from '../registry';
import { count, itemName, removeItem } from './core';

export const CHARGE_FLAG_PREFIX = 'ladung:';
const chargePrefix = (item: ItemId) => `${CHARGE_FLAG_PREFIX}${item}:`;

/** Ladungen je Stück laut Inhalt (0 = Gegenstand ohne Ladungen). */
export function chargesPerItem(content: GameContent, item: ItemId): number {
  const def = has(content.items, item) ? content.items[item] : undefined;
  const value = def?.charges;
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
}

/** Am obersten Stück verbrauchte Ladungen. */
export function usedCharges(state: Readonly<GameState>, item: ItemId): number {
  const prefix = chargePrefix(item);
  for (const flag of Object.keys(state.flags)) {
    if (!flag.startsWith(prefix) || !state.flags[flag]) continue;
    const used = Number(flag.slice(prefix.length));
    if (Number.isInteger(used) && used > 0) return used;
  }
  return 0;
}

function setUsedCharges(draft: GameState, item: ItemId, used: number): void {
  const prefix = chargePrefix(item);
  for (const flag of Object.keys(draft.flags)) if (flag.startsWith(prefix)) delete draft.flags[flag];
  if (used > 0) draft.flags[`${prefix}${used}`] = true;
}

export interface ChargeView {
  /** Ladungen je Stück. */
  per: number;
  /** Restladungen am obersten Stück. */
  current: number;
  /** Restladungen aller Stücke zusammen. */
  total: number;
}

/** Ladungsstand eines Gegenstands im Gepäck; null bei Gegenständen ohne Ladungen. */
export function chargeView(content: GameContent, state: Readonly<GameState>, item: ItemId): ChargeView | null {
  const per = chargesPerItem(content, item);
  if (!per) return null;
  const qty = count(state, item);
  if (qty <= 0) return { per, current: 0, total: 0 };
  const current = Math.max(1, per - Math.min(per - 1, usedCharges(state, item)));
  return { per, current, total: current + (qty - 1) * per };
}

/** Gegenstand angelegt (irgendein Ausrüstungsplatz) und noch im Gepäck. */
export const isEquipped = (state: Readonly<GameState>, item: ItemId): boolean =>
  Object.values(state.player.equipment).includes(item) && count(state, item) > 0;

export const weatherConditions: ConditionSpecs<'weather' | 'equipped'> = {
  weather: {
    test: (c, { content, state }) => asList(c.weather).includes(weatherAt(content.maps, state, c.district)),
  },
  equipped: {
    test: (c, { state }) => typeof c.equipped === 'string' && isEquipped(state, c.equipped),
    refs: c => [{ kind: 'items', id: c.equipped }],
  },
};

export const weatherEffects: EffectSpecs<'useCharge'> = {
  useCharge: {
    apply(e, { content, draft, messages }) {
      if (!has(content.items, e.useCharge)) return `Unbekannter Gegenstand: ${e.useCharge}`;
      const per = chargesPerItem(content, e.useCharge);
      if (!per || count(draft, e.useCharge) <= 0) return null;
      const name = itemName(content, e.useCharge);
      const used = usedCharges(draft, e.useCharge) + 1;
      if (used < per) {
        setUsedCharges(draft, e.useCharge, used);
        const left = per - used;
        messages.push(`${name}: noch ${left} ${left === 1 ? 'Ladung' : 'Ladungen'}.`);
        return null;
      }
      setUsedCharges(draft, e.useCharge, 0);
      const problem = removeItem(content, draft, e.useCharge, 1);
      if (problem) return problem;
      if (count(draft, e.useCharge) === 0) {
        for (const [slot, item] of Object.entries(draft.player.equipment)) {
          if (item === e.useCharge) delete draft.player.equipment[slot as keyof typeof draft.player.equipment];
        }
      }
      const rest = count(draft, e.useCharge);
      messages.push(rest > 0 ? `${name} ist durch. Du setzt die nächste auf (${rest} übrig).` : `${name} ist durch. Die letzte Ladung ist weg.`);
      return null;
    },
    refs: e => [{ kind: 'items', id: e.useCharge }],
  },
};

/**
 * Eintägige Hinweise, deren Auslöser im Inhalt ein Dauerflag setzt: Beim ersten Nachlauf danach kommt das
 * `heute_`-Flag dazu (fällt am nächsten Morgen). Gustavs Kranblick (he-opa-gustav-2) setzt `gustav_kranblick`.
 */
export const ONE_DAY_FLAGS: Readonly<Record<string, string>> = {
  gustav_kranblick: 'heute_gustav_kranblick',
};
const oneDayDone = (flag: string) => `${flag}:tag`;

/** Nachlauf: verwaiste Ladungs-Flags räumen, eintägige Hinweise starten. */
export const weatherSettle: SettleHook = (ctx) => {
  const { content, draft } = ctx;
  let changed = false;
  for (const flag of Object.keys(draft.flags)) {
    if (!flag.startsWith(CHARGE_FLAG_PREFIX)) continue;
    const item = flag.slice(CHARGE_FLAG_PREFIX.length, flag.lastIndexOf(':'));
    if (!item || (count(draft, item) > 0 && chargesPerItem(content, item) > 0)) continue;
    delete draft.flags[flag];
    changed = true;
  }
  for (const [source, daily] of Object.entries(ONE_DAY_FLAGS)) {
    if (!draft.flags[source] || draft.flags[oneDayDone(source)]) continue;
    draft.flags[daily] = true;
    draft.flags[oneDayDone(source)] = true;
    changed = true;
  }
  return changed;
};
