// Brücke von den Kampfregeln (modules/combat, reine Funktionen auf unveränderlichen Zuständen) zur
// zustandsbehafteten BattleSessionPort-Schnittstelle der Kampfdarstellung.
//
//   installBattleRunner(director, createCombatSessionFactory(director.content, () => director.campaign.state()));
import {
  abilityDef, abilityOptions, act, actionOptions, areaPreview, attackTargets, bagFromInventory, battleResult, battleSeed, carryCandidate,
  createBattle, findUnit, itemAbility, itemOptions, moveOptions, partyFromCampaign, planAiAction, startStatusFromCampaign,
  type ActionOptions, type AttackPreview, type BattleSetup, type CombatState, type HitPart,
} from '../../../modules/combat';
import type { AbilityDef, Cell, EncounterDef, GameContent, GameState } from '../../../modules/contracts';
import type {
  AreaTargets, BattleSessionFactory, BattleSessionPort, ExtraAction, PerformResult, ReachOption, SessionAction, SessionEvent,
  TargetPreview, TargetedAction,
} from './rulesPort';

export interface CombatSessionOptions {
  start?: BattleSetup['start'];
  difficulty?: BattleSetup['difficulty'];
}

const signed = (value: number) => (value > 0 ? `+${value}` : `−${Math.abs(value)}`);
const partsText = (parts: readonly HitPart[]) => parts.map((part, index) => (index === 0 ? `${part.label} ${part.value}` : `${part.label} ${signed(part.value)}`));

/** AttackPreview der Regeln → Zielvorschau der Darstellung. */
export function toTargetPreview(state: CombatState, preview: AttackPreview, def: AbilityDef | null | undefined): TargetPreview {
  const target = findUnit(state, preview.target);
  const result: TargetPreview = { unit: preview.target, cell: target?.cell ?? preview.from };
  const harmful = !def || ((def.damage ?? 0) > 0) || def.kind === 'nahkampf' || def.kind === 'fernkampf' || def.kind === 'hack';
  if (!preview.autoHit) result.chance = preview.chance;
  if (harmful && preview.damage > 0) result.damage = preview.damage;
  if (preview.heal) result.heal = preview.heal;
  if (preview.cover) result.cover = preview.cover >= 40 ? 'full' : 'half';
  if (preview.flank) result.flank = true;
  if (preview.status) result.status = { id: preview.status.id, turns: preview.status.turns, chance: preview.status.chance };
  const notes: string[] = [];
  if (preview.crit) notes.push('Volltreffer (×1,5)');
  if (preview.lethal) notes.push('Schaltet aus');
  if (preview.morale) notes.push(`Moral −${preview.morale}`);
  if (notes.length) result.note = notes.join(' · ');
  if (!preview.autoHit && preview.parts.length > 1) result.breakdown = partsText(preview.parts);
  if (!preview.valid) result.blocked = preview.reason ?? 'Gerade nicht möglich.';
  return result;
}

const queryOf = (action: TargetedAction) => (action.type === 'ability' ? { ability: action.ability } : action.type === 'item' ? { item: action.item } : {});

/** Kampfsitzung über modules/combat. */
export class CombatSession implements BattleSessionPort {
  private s: CombatState;
  private optionsCache: { state: CombatState; value: ActionOptions | null } | null = null;
  private startEvents: SessionEvent[];

  constructor(private readonly content: GameContent, readonly encounter: EncounterDef, setup: BattleSetup) {
    this.s = createBattle(content, setup);
    this.startEvents = [...this.s.log];
  }

  get arena() { return this.content.arenas[this.encounter.arena]; }

  state(): Readonly<CombatState> { return this.s; }

  start(): SessionEvent[] {
    const events = this.startEvents;
    this.startEvents = [];
    return events;
  }

  reachable(unitId: string): ReachOption[] {
    return moveOptions(this.s, unitId).map((reach) => ({ cell: reach.cell, path: reach.path, ap: reach.ap }));
  }

  targets(unitId: string, action: TargetedAction): TargetPreview[] {
    const def = this.defOf(action);
    return attackTargets(this.content, this.s, unitId, queryOf(action)).map((preview) => toTargetPreview(this.s, preview, def));
  }

  areaTargets(unitId: string, action: TargetedAction, center: Cell): AreaTargets {
    const def = this.defOf(action);
    const area = areaPreview(this.content, this.s, unitId, queryOf(action), center);
    return {
      cells: area.cells,
      previews: area.affected.map((preview) => toTargetPreview(this.s, preview, def)),
      blocked: area.valid ? undefined : area.reason ?? 'Hier nicht möglich.',
    };
  }

  perform(action: SessionAction): PerformResult {
    const result = act(this.content, this.s, action);
    if (result.error) return { ok: false, error: result.error };
    this.s = result.state;
    return { ok: true, events: result.events };
  }

  aiStep(): SessionEvent[] {
    if (this.s.outcome) return [];
    let result = act(this.content, this.s, planAiAction(this.content, this.s));
    if (result.error) result = act(this.content, this.s, { type: 'end' });
    if (result.error) return [];
    this.s = result.state;
    return result.events;
  }

  result() { return battleResult(this.s); }

  apCost(unitId: string, action: SessionAction): number {
    const unit = findUnit(this.s, unitId);
    switch (action.type) {
      case 'ability': return abilityDef(this.content, action.ability)?.ap ?? 1;
      case 'item': {
        const item = this.content.items[action.item];
        return item ? itemAbility(this.content, item)?.ap ?? 1 : 1;
      }
      case 'flee': case 'end': case 'weapon': return 0;
      case 'carry': return unit?.carrying ? 0 : 1;
      case 'overwatch': return Math.max(1, unit?.ap ?? 1);
      default: return 1;
    }
  }

  items() { return Object.entries(this.s.bag).map(([item, qty]) => ({ item, qty })); }

  area(action: TargetedAction, center: Cell): Cell[] {
    const unit = this.s.active ?? '';
    return areaPreview(this.content, this.s, unit, queryOf(action), center).cells;
  }

  blocked(unitId: string, action: SessionAction): string | null {
    const options = this.actionOptions();
    if (!options || options.unit !== unitId) return 'Nicht am Zug.';
    const unit = findUnit(this.s, unitId);
    switch (action.type) {
      case 'move': return options.move ? null : 'Kein Feld erreichbar.';
      case 'attack': return unit?.attacked ? 'In diesem Zug wurde schon angegriffen.' : null;
      case 'overwatch': return options.overwatch ? null : 'Keine Aktionspunkte mehr.';
      case 'cover': return options.cover ? null : 'Keine Aktionspunkte mehr.';
      case 'flee': return options.flee ? null : this.s.canFlee ? 'Die Schutzperson kann nicht allein fliehen.' : 'Aus diesem Kampf gibt es keine Flucht.';
      case 'ability': return abilityOptions(this.content, this.s, unitId).find((entry) => entry.ability.id === action.ability)?.reason ?? null;
      case 'item': return itemOptions(this.content, this.s, unitId).find((entry) => entry.item.id === action.item)?.reason ?? null;
      default: return null;
    }
  }

  extraActions(unitId: string): ExtraAction[] {
    const options = this.actionOptions();
    const unit = findUnit(this.s, unitId);
    if (!options || options.unit !== unitId || !unit) return [];
    const extras: ExtraAction[] = [];
    if (this.s.objective.kind === 'hack') {
      extras.push({
        key: 'interact', label: 'Terminal', hint: `Am Terminal hacken (${this.s.progress}/${this.s.objective.ap}).`, ap: 1,
        enabled: options.interact, reason: options.interact ? undefined : unit.ap < 1 ? 'Keine Aktionspunkte mehr.' : 'Zu weit vom Terminal entfernt.',
        action: { type: 'interact' },
      });
    }
    // Bewusstlose Schutzperson (Missionsziel `rescue.immobile`): schultern bzw. absetzen.
    if (this.s.objective.kind === 'rescue' && this.s.objective.immobile && !unit.vip) {
      const carried = unit.carrying ? findUnit(this.s, unit.carrying) : undefined;
      const candidate = carried ? undefined : carryCandidate(this.s, unit);
      extras.push(carried ? {
        key: 'carry', label: 'Absetzen', hint: `${carried.name} ablegen (0 AP).`, ap: 0, enabled: true, action: { type: 'carry' },
      } : {
        key: 'carry', label: 'Tragen', hint: 'Die bewusstlose Person auf dem Nachbarfeld schultern (1 AP). Sie folgt jedem Schritt.', ap: 1,
        enabled: !!candidate && unit.ap >= 1,
        reason: candidate ? (unit.ap >= 1 ? undefined : 'Keine Aktionspunkte mehr.') : 'Niemand Bewusstloses auf dem Nachbarfeld.',
        action: { type: 'carry' },
      });
    }
    if (unit.weapons.length > 1) {
      const next = (unit.weaponIndex + 1) % unit.weapons.length;
      const kind = unit.weapons[next].kind;
      extras.push({
        key: 'weapon', label: 'Waffe', hint: `Wechsel zur ${kind === 'nahkampf' ? 'Nahkampfwaffe' : kind === 'fernkampf' ? 'Fernkampfwaffe' : 'Smart-Waffe'} (0 AP).`, ap: 0,
        enabled: options.swap, reason: options.swap ? undefined : 'Die Waffe wurde in diesem Zug schon gewechselt.',
        action: { type: 'weapon', index: next },
      });
    }
    return extras;
  }

  private actionOptions(): ActionOptions | null {
    if (this.optionsCache?.state !== this.s) this.optionsCache = { state: this.s, value: actionOptions(this.content, this.s) };
    return this.optionsCache.value;
  }

  private defOf(action: TargetedAction): AbilityDef | null | undefined {
    if (action.type === 'ability') return abilityDef(this.content, action.ability) ?? null;
    if (action.type === 'item') {
      const item = this.content.items[action.item];
      return item ? itemAbility(this.content, item) : null;
    }
    return undefined;
  }
}

/** Sitzungsfabrik aus dem aktuellen Spielstand: Party, Kampfgepäck und Seed aus der Kampagne. */
export function createCombatSessionFactory(content: GameContent, state: () => Readonly<GameState>, options: CombatSessionOptions = {}): BattleSessionFactory {
  return (encounter) => {
    if (!content.arenas[encounter.arena]) return null;
    const current = state();
    return new CombatSession(content, encounter, {
      encounter: encounter.id,
      seed: battleSeed(current, encounter.id),
      party: partyFromCampaign(content, current, encounter),
      bag: bagFromInventory(content, current.inventory),
      start: options.start,
      difficulty: options.difficulty,
      startStatus: startStatusFromCampaign(content, current, encounter),
    });
  };
}
