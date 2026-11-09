// Deutsche Texte der Kampfdarstellung: Statuseffekte, Protokollzeilen, schwebende Zahlen, Vorschau.
// Rein und ohne Phaser/DOM, damit Wortlaut und Zahlenformat testbar bleiben.
import type {
  AbilityDef, BattleOutcome, BattleState, BattleUnit, GameContent, StatusId,
} from '../../../modules/contracts';
import { builtinAbility } from '../../../modules/combat';
import type { CoverLevel, SessionEvent, TargetPreview } from './rulesPort';

type Lookup = Pick<GameContent, 'abilities'> & Partial<Pick<GameContent, 'items'>>;

export interface StatusMeta { label: string; color: string; description: string }

export const STATUS_META: Record<StatusId, StatusMeta> = {
  gehackt: { label: 'Gehackt', color: '#3ef2ff', description: 'Systeme gestört – setzt eine Runde aus.' },
  betaeubt: { label: 'Betäubt', color: '#ffe14a', description: 'Benommen – kann kaum handeln.' },
  brennt: { label: 'Brennt', color: '#ff7a3a', description: 'Nimmt zu Beginn jedes Zugs Schaden.' },
  markiert: { label: 'Markiert', color: '#ff3fa4', description: 'Leichter zu treffen (+20 Trefferchance).' },
  geschuetzt: { label: 'Geschützt', color: '#6dffb0', description: 'Weniger Schaden durch Treffer.' },
  blutet: { label: 'Blutet', color: '#ff4a6a', description: 'Verliert jede Runde Lebenspunkte.' },
  ermutigt: { label: 'Ermutigt', color: '#ffb84a', description: '+1 Aktionspunkt im nächsten Zug.' },
  gesteuert: { label: 'Gesteuert', color: '#9b5cff', description: 'Kämpft den nächsten Zug für die Gegenseite.' },
};

export const STATUS_ORDER: readonly StatusId[] = ['gesteuert', 'gehackt', 'betaeubt', 'brennt', 'blutet', 'markiert', 'geschuetzt', 'ermutigt'];

export const COVER_LABEL: Record<CoverLevel, string> = { none: 'keine Deckung', half: 'halbe Deckung', full: 'volle Deckung' };

export const OUTCOME_TITLE: Record<BattleOutcome, string> = { win: 'Sieg!', lose: 'Niederlage', fled: 'Entkommen' };

/** Aktive Statuseffekte einer Einheit in fester Reihenfolge (Rundenzahl > 0). */
export function activeStatuses(unit: Pick<BattleUnit, 'status'>): { id: StatusId; turns: number }[] {
  return STATUS_ORDER.filter((id) => (unit.status[id] ?? 0) > 0).map((id) => ({ id, turns: unit.status[id] ?? 0 }));
}

export function unitById(state: Pick<BattleState, 'units'>, id: string | null | undefined): BattleUnit | undefined {
  return id ? state.units.find((unit) => unit.id === id) : undefined;
}

const nameOf = (state: Pick<BattleState, 'units'>, id: string) => unitById(state, id)?.name ?? id;

export function damageText(damage: TargetPreview['damage']): string {
  if (damage === undefined) return '';
  if (typeof damage === 'number') return String(damage);
  return damage[0] === damage[1] ? String(damage[0]) : `${damage[0]}–${damage[1]}`;
}

/** Ist das ein Hack-Angriff (Glitch-Animation, Hack-Sound)? */
export function isHack(content: Lookup, attacker: BattleUnit | undefined, ability?: string): boolean {
  const def: AbilityDef | undefined = ability ? content.abilities[ability] ?? builtinAbility(ability) : undefined;
  if (def) return def.kind === 'hack';
  return attacker?.weapon.kind === 'smart';
}

export type AttackStyle = 'melee' | 'ranged' | 'hack';

/** Darstellungsart eines Angriffs aus Fähigkeit bzw. Waffe. */
export function attackStyle(content: Lookup, attacker: BattleUnit | undefined, ability?: string): AttackStyle {
  const def = ability ? content.abilities[ability] ?? builtinAbility(ability) : undefined;
  if (def) {
    if (def.kind === 'hack') return 'hack';
    if (def.kind === 'nahkampf') return 'melee';
    if (def.kind === 'fernkampf' || def.kind === 'gegenstand') return 'ranged';
    return def.range <= 1 ? 'melee' : 'ranged';
  }
  const kind = attacker?.weapon.kind;
  if (kind === 'smart') return 'hack';
  if (kind === 'nahkampf' || (attacker?.weapon.range ?? 1) <= 1) return 'melee';
  return 'ranged';
}

const turnsText = (turns: number) => `${turns} ${turns === 1 ? 'Runde' : 'Runden'}`;
const statusLabel = (status: StatusId) => STATUS_META[status]?.label ?? status;
const DOT_LABEL = { brennt: 'Feuer', blutet: 'Blutung', gefahr: 'Gefahrenfeld', welle: 'Welle' } as const;

/** Protokollzeile zu einem Ereignis (null = nichts protokollieren). */
export function eventLine(content: Lookup, state: Pick<BattleState, 'units'>, event: SessionEvent): string | null {
  const who = (id: string) => nameOf(state, id);
  switch (event.type) {
    case 'round': return `— Runde ${event.round} —`;
    case 'turn': return `Runde ${event.round}: ${who(event.unit)} ist am Zug.`;
    case 'move': return event.path.length ? `${who(event.unit)} bewegt sich ${event.path.length} ${event.path.length === 1 ? 'Feld' : 'Felder'}.` : null;
    case 'attack': {
      const how = event.ability ? ` (${(content.abilities[event.ability] ?? builtinAbility(event.ability))?.name ?? event.ability})` : '';
      const chance = Number.isFinite(event.chance) ? ` – ${Math.round(event.chance)} %` : '';
      const prefix = event.reaction ? 'Überwachungsfeuer: ' : '';
      return event.hit
        ? `${prefix}${who(event.unit)} trifft ${who(event.target)}${how}: ${event.damage} Schaden${event.crit ? ' (Volltreffer!)' : ''}${chance}.`
        : `${prefix}${who(event.unit)} verfehlt ${who(event.target)}${how}${chance}.`;
    }
    case 'ability': return `${who(event.unit)} setzt ${(content.abilities[event.ability] ?? builtinAbility(event.ability))?.name ?? event.ability} ein.`;
    case 'item': return `${who(event.unit)} benutzt ${content.items?.[event.item]?.name ?? event.item}.`;
    case 'heal': return `${who(event.target)} erhält ${event.amount} LP.`;
    case 'damage': return `${who(event.unit)} nimmt ${event.amount} Schaden (${DOT_LABEL[event.source]}).`;
    case 'status': return event.turns > 0 ? `${who(event.unit)}: ${statusLabel(event.status)} (${turnsText(event.turns)}).` : `${who(event.unit)}: ${statusLabel(event.status)} endet.`;
    case 'statusEnd': return `${who(event.unit)}: ${statusLabel(event.status)} endet.`;
    case 'resist': return `${who(event.unit)} widersteht: ${statusLabel(event.status)}.`;
    case 'skip': return `${who(event.unit)} setzt aus (${statusLabel(event.status)}).`;
    case 'morale': return event.delta < 0 ? `${who(event.unit)} verliert Mut (Moral ${event.morale}).` : null;
    case 'overwatch': return `${who(event.unit)} geht in Überwachung.`;
    case 'cover': return `${who(event.unit)} geht in Deckung.`;
    case 'weapon': return `${who(event.unit)} wechselt zur ${event.weapon === 'nahkampf' ? 'Nahkampfwaffe' : event.weapon === 'fernkampf' ? 'Fernkampfwaffe' : 'Smart-Waffe'}.`;
    case 'phase': return `${who(event.unit)} wechselt die Taktik!`;
    case 'revive': return `${who(event.unit)} richtet ${who(event.target)} wieder auf (${event.hp} LP).`;
    case 'objective': return `Terminal: ${event.progress}/${event.needed}.`;
    case 'down': return `${who(event.unit)} geht zu Boden.`;
    case 'flee': return `${who(event.unit)} flieht.`;
    case 'surrender': return `${who(event.unit)} ergibt sich.`;
    case 'bark': return `${who(event.unit)}: „${event.text}“`;
    case 'notice': return event.tone === 'warn' ? `⚠ ${event.text}` : event.text;
    case 'spawn': return `${who(event.unit)} stößt dazu.`;
    case 'end': return event.outcome === 'win' ? 'Der Kampf ist gewonnen.' : event.outcome === 'lose' ? 'Der Kampf ist verloren.' : 'Die Crew zieht sich zurück.';
  }
}

/** Schwebender Text über einer Einheit. */
export interface FloatText { unit: string; text: string; tone: 'damage' | 'miss' | 'heal' | 'status' | 'info' }

export function eventFloats(event: SessionEvent, content?: Lookup): FloatText[] {
  switch (event.type) {
    case 'attack': return [event.hit
      ? { unit: event.target, text: event.damage > 0 ? `−${event.damage}${event.crit ? '!' : ''}` : 'Treffer', tone: 'damage' }
      : { unit: event.target, text: 'Verfehlt', tone: 'miss' }];
    case 'damage': return [{ unit: event.unit, text: `−${event.amount}`, tone: 'damage' }];
    case 'heal': return [{ unit: event.target, text: `+${event.amount}`, tone: 'heal' }];
    case 'revive': return [{ unit: event.target, text: `+${event.hp}`, tone: 'heal' }];
    case 'status': return event.turns > 0 ? [{ unit: event.unit, text: statusLabel(event.status), tone: 'status' }] : [];
    case 'resist': return [{ unit: event.unit, text: 'Widersteht', tone: 'miss' }];
    case 'skip': return [{ unit: event.unit, text: `Setzt aus`, tone: 'status' }];
    case 'morale': return event.delta < 0 ? [{ unit: event.unit, text: `Moral ${event.delta}`, tone: 'info' }] : [];
    case 'overwatch': return [{ unit: event.unit, text: 'Überwachung', tone: 'info' }];
    case 'cover': return [{ unit: event.unit, text: 'Deckung', tone: 'info' }];
    case 'weapon': return [{ unit: event.unit, text: 'Waffenwechsel', tone: 'info' }];
    case 'ability': return [{ unit: event.unit, text: (content?.abilities[event.ability] ?? builtinAbility(event.ability))?.name ?? event.ability, tone: 'info' }];
    case 'item': return [{ unit: event.unit, text: content?.items?.[event.item]?.name ?? event.item, tone: 'info' }];
    case 'objective': return [{ unit: event.unit, text: `Terminal ${event.progress}/${event.needed}`, tone: 'status' }];
    case 'phase': return [{ unit: event.unit, text: 'Neue Phase!', tone: 'info' }];
    case 'flee': return [{ unit: event.unit, text: 'Flieht!', tone: 'info' }];
    case 'surrender': return [{ unit: event.unit, text: 'Ergibt sich', tone: 'info' }];
    case 'spawn': return [{ unit: event.unit, text: 'Verstärkung!', tone: 'info' }];
    default: return [];
  }
}

/** Zeilen der Zielvorschau („72 % Treffer“, „Schaden 5–7“, „halbe Deckung“, „Flanke +15“ …). */
export function previewLines(preview: TargetPreview): string[] {
  const lines: string[] = [];
  if (preview.blocked) lines.push(preview.blocked);
  if (preview.chance !== undefined) lines.push(`${Math.round(preview.chance)} % Trefferchance`);
  if (preview.damage !== undefined) lines.push(`Schaden ${damageText(preview.damage)}`);
  if (preview.heal !== undefined) lines.push(`Heilung ${preview.heal} LP`);
  if (preview.status) {
    const chance = preview.status.chance !== undefined && preview.status.chance < 1 ? ` (${Math.round(preview.status.chance * 100)} %)` : '';
    lines.push(`${STATUS_META[preview.status.id]?.label ?? preview.status.id} für ${preview.status.turns} ${preview.status.turns === 1 ? 'Runde' : 'Runden'}${chance}`);
  }
  if (preview.cover && preview.cover !== 'none') lines.push(`Ziel in ${COVER_LABEL[preview.cover]}`);
  if (preview.flank) lines.push('Flanke +15');
  if (preview.note) lines.push(preview.note);
  if (preview.breakdown?.length) lines.push(preview.breakdown.join(' · '));
  return lines;
}

/** Kurzlabel über dem Ziel im Raster. */
export function previewBadge(preview: TargetPreview): string {
  if (preview.blocked) return '–';
  if (preview.chance !== undefined) return `${Math.round(preview.chance)} %`;
  if (preview.heal !== undefined) return `+${preview.heal}`;
  return '✓';
}
