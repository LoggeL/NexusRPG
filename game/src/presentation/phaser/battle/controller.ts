// Ablaufsteuerung der Kampfdarstellung: Zugschleife (Spieler ↔ Gegner-KI), Auswahlzustand, Eingabe.
// Ohne Phaser/DOM – die Szene (BattleWorldView) und die DOM-Oberfläche (BattleHudView) sind Schnittstellen,
// damit der Ablauf mit einem Test-Port vollständig in Vitest geprüft werden kann.
import type {
  BattleObjective, BattleOutcome, BattleResult, BattleUnit, Cell, DialogueLine,
  GameContent, ItemId, StatusId,
} from '../../../modules/contracts';
import type { Intent } from '../../../platform/input/types';
import { abilityEntries, ACTION_LABELS, apCost, itemEntries, mainActions, type ActionEntry, type ActionKey, type SubEntry } from './actions';
import { cellKey, cellsWithin, sameCell, stepCell } from './geometry';
import type { BattleSessionPort, ReachOption, SessionAction, SessionEvent, SessionState, TargetPreview, TargetedAction } from './rulesPort';

type BattleAction = SessionAction;
type BattleEvent = SessionEvent;
import { activeStatuses, eventLine, OUTCOME_TITLE, previewBadge, previewLines, STATUS_META, unitById } from './text';
import { ruleMarks } from '../../../modules/combat/bossRules';

// ---------------------------------------------------------------- Schnittstellen zu Szene und Oberfläche

export interface TargetMark { cell: Cell; unit?: string; badge: string; blocked: boolean; selected: boolean }

export interface Highlights {
  /** Erreichbare Felder (ap 2 = Sprint). */
  reach: { cell: Cell; ap: number }[];
  /** Reichweite einer Fähigkeit mit Feld- oder Flächenziel. */
  range: Cell[];
  /** Betroffene Felder der Flächenwirkung unter dem Cursor. */
  area: Cell[];
  targets: TargetMark[];
  /** Pfadvorschau inklusive Startfeld. */
  path: Cell[] | null;
  pathAp: number;
  cursor: Cell | null;
  active: string | null;
  inspect: string | null;
  /** Missionsziele (Erreichen, Hacken, Retten, Terminal halten). */
  goals: Cell[];
  /** Angekündigte Gefahr (Firewall-Welle der nächsten Runde). */
  danger?: Cell[];
}

export interface BattleWorldView {
  setHighlights(highlights: Highlights): void;
  /** Positionen, LP, Status und Sichtbarkeit sofort auf den Zustand bringen. */
  sync(state: Readonly<SessionState>): void;
  /** Kamera auf ein Feld oder eine Einheit richten. */
  focus(target: Cell | string, instant?: boolean): Promise<void> | void;
  /** Ein Ereignis animieren (Laufen, Treffer, Glitch …). `state` ist der Stand nach der ganzen Ereignisfolge. */
  play(event: BattleEvent, state: Readonly<SessionState>): Promise<void>;
}

export interface UnitCard {
  id: string;
  name: string;
  team: 'party' | 'enemy';
  portrait?: string;
  sprite: string;
  hp: number;
  maxHp: number;
  ap: number;
  armor: number;
  statuses: { id: StatusId; turns: number }[];
  state: BattleUnit['state'];
  overwatch: boolean;
  weapon: string;
}

export interface OrderEntry extends UnitCard { active: boolean }

export type HudPhase = 'intro' | 'player' | 'enemy' | 'busy' | 'over';

export interface HudModel {
  phase: HudPhase;
  round: number;
  order: OrderEntry[];
  active: UnitCard | null;
  inspect: UnitCard | null;
  actions: ActionEntry[];
  /** Hervorgehobene Aktion (aktueller Modus). */
  selected: ActionKey | null;
  menu: { title: string; entries: SubEntry[]; index: number } | null;
  target: { title: string; lines: string[]; tone: 'enemy' | 'ally' | 'move' | 'info' } | null;
  prompt: string;
  /** Touch: Vorschau steht, zweites Tippen oder „Bestätigen“ führt aus. */
  pending: boolean;
  objective: string;
}

export interface ResultModel {
  outcome: BattleOutcome;
  title: string;
  subtitle: string;
  rewards: { label: string; value: string }[];
  notes: string[];
}

export interface BattleHudView {
  update(model: HudModel): void;
  banner(text: string, sub?: string): Promise<void>;
  /** Gesprochene Zeile (Intro, Boss); löst bei Klick/Enter oder nach kurzer Zeit auf. */
  say(speaker: string, text: string): Promise<void>;
  log(line: string): void;
  toast(text: string, tone?: 'info' | 'good' | 'bad'): void;
  showResult(model: ResultModel): Promise<void>;
  /** Sound-Rückmeldung für Bedienung (optional). */
  sfx?(id: 'select' | 'confirm' | 'deny'): void;
}

export interface ControllerDeps {
  port: BattleSessionPort;
  content: Pick<GameContent, 'abilities' | 'items' | 'enemies'>;
  world: BattleWorldView;
  hud: BattleHudView;
  /** Kampagneninventar (Rückfall für Kampfgegenstände). */
  inventory: () => Readonly<Record<ItemId, number>>;
  speakerName?: (speaker: string) => string;
  formatText?: (text: string) => string;
  /** Touch: erstes Tippen zeigt Vorschau, zweites führt aus. */
  touch?: () => boolean;
}

type Mode =
  | { kind: 'main' }
  | { kind: 'move' }
  | { kind: 'menu'; menu: 'abilities' | 'items'; index: number }
  | { kind: 'target'; entry: TargetEntry };

/** Gewählte Aktion mit Ziel (Angriff, Fähigkeit, Gegenstand). */
interface TargetEntry { key: 'attack' | 'ability' | 'item'; label: string; action: TargetedAction; target: SubEntry['target']; range: number; radius?: number }

type InputSource = 'mouse' | 'touch' | 'key';

interface Deferred<T> { promise: Promise<T>; resolve: (value: T) => void }
function deferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => { resolve = r; });
  return { promise, resolve };
}

/** Höchstzahl Schritte je Kampf – schützt vor Endlosschleifen fehlerhafter Regeln. */
export const MAX_STEPS = 4000;
/** KI-Schritte ohne Fortschritt, bevor der Zug zwangsweise beendet wird. */
export const STALL_LIMIT = 3;

export function objectiveText(objective: BattleObjective | undefined): string {
  switch (objective?.kind) {
    case undefined:
    case 'defeat': return 'Besiege alle Gegner.';
    case 'survive': return `Halte ${objective.rounds} ${objective.rounds === 1 ? 'Runde' : 'Runden'} durch${objective.exit?.length ? ' – oder erreiche den Ausgang' : ''}.`;
    case 'reach': return 'Erreiche die markierten Felder.';
    case 'hack': return `Hacke das Terminal (${objective.ap} AP).`;
    case 'rescue': return objective.immobile ? 'Rette die markierte Person – sie ist bewusstlos (Tragen: 1 AP).' : 'Rette die markierte Person.';
  }
}

export function objectiveCells(objective: BattleObjective | undefined): Cell[] {
  switch (objective?.kind) {
    case 'reach': return [...objective.cells];
    case 'survive': return [...(objective.exit ?? [])];
    case 'hack': return [objective.cell];
    case 'rescue': return [objective.cell];
    default: return [];
  }
}

export function unitCard(unit: BattleUnit, content: Pick<GameContent, 'enemies'>): UnitCard {
  const portrait = unit.portrait ?? (unit.source.kind === 'enemy' ? content.enemies[unit.source.enemy]?.portrait : undefined);
  const weapon = unit.weapon.kind === 'nahkampf' ? 'Nahkampf' : unit.weapon.kind === 'fernkampf' ? 'Fernkampf' : 'Smart-Waffe';
  return {
    id: unit.id, name: unit.name, team: unit.team, portrait, sprite: unit.sprite, hp: unit.hp, maxHp: unit.maxHp, ap: unit.ap, armor: unit.armor,
    statuses: activeStatuses(unit), state: unit.state, overwatch: unit.overwatch, weapon: `${weapon} · Schaden ${unit.weapon.damage} · Reichweite ${unit.weapon.range}`,
  };
}

/** Zugreihenfolge ab der aktiven Einheit, nur handlungsfähige Einheiten. */
export function turnOrder(state: Readonly<SessionState>): string[] {
  const alive = state.order.filter((id) => unitById(state, id)?.state === 'active');
  const index = state.active ? alive.indexOf(state.active) : -1;
  return index > 0 ? [...alive.slice(index), ...alive.slice(0, index)] : alive;
}

export class BattleController {
  private mode: Mode = { kind: 'main' };
  private cursor: Cell | null = null;
  private pending: Cell | null = null;
  private inspect: string | null = null;
  private phase: HudPhase = 'intro';
  private waiter: Deferred<BattleAction | null> | null = null;
  private aborted = false;
  private finished = false;
  private lastRound = 0;
  private lastActive: string | null = null;
  private lastSide: 'party' | 'enemy' | null = null;
  private cache: { key: string; reach: ReachOption[]; attack: TargetPreview[] } | null = null;
  private targetCache: { key: string; previews: TargetPreview[] } | null = null;
  readonly objective: string;
  readonly goals: Cell[];
  /** Zuletzt angezeigtes Modell (Test-Hook, Tests). */
  lastModel: HudModel | null = null;

  constructor(private readonly deps: ControllerDeps) {
    this.objective = objectiveText(deps.port.encounter.objective);
    this.goals = objectiveCells(deps.port.encounter.objective);
  }

  get state(): Readonly<SessionState> { return this.deps.port.state(); }
  get isPlayerTurn(): boolean { return this.phase === 'player' && !!this.waiter; }
  get isFinished(): boolean { return this.finished; }

  /** Kampf bis zum Ergebnis laufen lassen. `null` = abgebrochen (z. B. Test-Hook beendet den Kampf). */
  async run(): Promise<BattleResult | null> {
    const { port, world, hud } = this.deps;
    world.sync(this.state);
    this.refresh();
    await world.focus(this.state.active ?? this.partyAnchor(), true);
    await hud.banner(port.encounter.name, this.objective);
    for (const line of port.encounter.intro ?? []) {
      if (this.aborted) return null;
      await this.say(line);
    }
    if (port.start) await this.play(port.start());
    let steps = 0;
    let stall = 0;
    while (!this.aborted && !this.state.outcome) {
      if (++steps > MAX_STEPS) { hud.toast('Der Kampf hängt – Abbruch.', 'bad'); break; }
      const unit = unitById(this.state, this.state.active);
      if (!unit) {
        // Kein aktiver Zug: Regeln weiterschalten lassen.
        if (!(await this.performSafe({ type: 'end' })) && ++stall > STALL_LIMIT) { hud.toast('Kein Zug möglich – Abbruch.', 'bad'); break; }
        continue;
      }
      await this.announceSide(unit);
      // Gegner und „gesteuerte“ Crew (Charmeur, Nexus-Chip) zieht die KI.
      if (unit.team === 'enemy' || unit.state !== 'active' || (unit as { controller?: string }).controller === 'ai') {
        const before = this.fingerprint();
        this.setPhase('enemy');
        const events = port.aiStep();
        await this.play(events);
        if (this.fingerprint() === before) {
          if (++stall >= STALL_LIMIT) { stall = 0; await this.performSafe({ type: 'end' }); }
        } else stall = 0;
        continue;
      }
      stall = 0;
      const action = await this.awaitPlayer(unit);
      if (!action || this.aborted) break;
      await this.execute(unit, action);
    }
    if (this.aborted) return null;
    const result = this.finalResult();
    this.setPhase('over');
    await hud.showResult(resultModel(this.deps.port, this.deps.content, result));
    this.finished = true;
    return result;
  }

  /** Ergebnis der Regeln; ohne Ausgang (Abbruch wegen Fehler) gilt Flucht mit aktuellen LP. */
  private finalResult(): BattleResult {
    const state = this.state;
    const player = state.units.find((unit) => unit.source.kind === 'player');
    const fallback: BattleResult = { encounter: this.deps.port.encounter.id, outcome: state.outcome ?? 'fled', playerHp: player?.hp ?? 1 };
    if (!state.outcome) return fallback;
    return safe(() => this.deps.port.result(), fallback);
  }

  /** Abbruch von außen (Director.resolveBattle). */
  abort() {
    this.aborted = true;
    this.waiter?.resolve(null);
    this.waiter = null;
  }

  // ---------------------------------------------------------------- Eingabe (Szene, Oberfläche, Tastatur)

  /** Maus über einem Feld (null = außerhalb). */
  hover(cell: Cell | null) {
    if (!this.isPlayerTurn) return;
    if (sameCell(cell, this.cursor)) return;
    this.cursor = cell;
    if (!sameCell(cell, this.pending)) this.pending = null;
    this.refresh();
  }

  /** Klick/Tippen auf ein Feld. */
  tap(cell: Cell, source: InputSource) {
    if (!this.isPlayerTurn) {
      const unit = this.unitAt(cell);
      if (unit) { this.inspect = unit.id; this.refresh(); }
      return;
    }
    const active = this.activeUnit();
    if (!active) return;
    this.cursor = cell;
    const confirmNow = source !== 'touch' || sameCell(this.pending, cell);
    const mode = this.mode;
    if (mode.kind === 'target') { this.tapTarget(active, mode.entry, cell, confirmNow); return; }
    if (mode.kind === 'menu') { this.mode = { kind: 'main' }; }
    const { reach, attack } = this.options(active);
    const move = reach.find((option) => sameCell(option.cell, cell));
    const target = this.mode.kind === 'main' ? attack.find((preview) => sameCell(preview.cell, cell) && !preview.blocked) : undefined;
    if (target?.unit) {
      if (confirmNow) { this.submit({ type: 'attack', target: target.unit }); return; }
      this.pending = cell;
    } else if (move) {
      if (confirmNow) { this.submit({ type: 'move', to: move.cell }); return; }
      this.pending = cell;
    } else {
      this.pending = null;
      const unit = this.unitAt(cell);
      this.inspect = unit?.id ?? null;
      if (unit && unit.id === active.id && this.mode.kind !== 'main') this.mode = { kind: 'main' };
    }
    this.refresh();
  }

  /** Aktionsleiste. */
  action(key: ActionKey) {
    if (!this.isPlayerTurn) return;
    const active = this.activeUnit();
    if (!active) return;
    const entry = this.actionEntries(active).find((candidate) => candidate.key === key);
    if (!entry) return;
    if (!entry.enabled) { this.deps.hud.toast(entry.reason ?? `${entry.label} geht gerade nicht.`, 'bad'); this.deps.hud.sfx?.('deny'); return; }
    this.pending = null;
    switch (key) {
      case 'move':
        this.mode = this.mode.kind === 'move' ? { kind: 'main' } : { kind: 'move' };
        this.cursor = active.cell;
        break;
      case 'attack': this.enterTarget(active, { key: 'attack', label: 'Angriff', action: { type: 'attack' }, target: 'enemy', range: active.weapon.range }); return;
      case 'abilities':
      case 'items':
        this.mode = this.mode.kind === 'menu' && this.mode.menu === key ? { kind: 'main' } : { kind: 'menu', menu: key, index: 0 };
        break;
      case 'overwatch': this.submit({ type: 'overwatch' }); return;
      case 'cover': this.submit({ type: 'cover' }); return;
      case 'end': this.submit({ type: 'end' }); return;
      case 'flee': this.submit({ type: 'flee' }); return;
      case 'interact':
      case 'weapon':
      case 'carry': {
        const extra = this.deps.port.extraActions?.(active.id).find((candidate) => candidate.key === key);
        if (extra) this.submit(extra.action);
        return;
      }
    }
    this.deps.hud.sfx?.('select');
    this.refresh();
  }

  /** Eintrag im Untermenü (Index ab 0). */
  pickSub(index: number) {
    if (!this.isPlayerTurn || this.mode.kind !== 'menu') return;
    const active = this.activeUnit();
    if (!active) return;
    const entries = this.menuEntries(active, this.mode.menu);
    const entry = entries[index];
    if (!entry) return;
    if (!entry.enabled) { this.deps.hud.toast(entry.reason ?? `${entry.label} geht gerade nicht.`, 'bad'); this.deps.hud.sfx?.('deny'); return; }
    const target: TargetEntry = { key: entry.kind, label: entry.label, action: entry.action, target: entry.target, range: entry.range, radius: entry.radius };
    if (entry.target === 'self') { this.submit(buildAction(target, { unit: active.id })); return; }
    this.enterTarget(active, target);
  }

  /** Zurück (Esc, Zurück-Knopf). */
  cancel(): boolean {
    if (!this.isPlayerTurn) return false;
    if (this.pending) { this.pending = null; this.refresh(); return true; }
    if (this.mode.kind !== 'main') {
      this.mode = { kind: 'main' };
      this.cursor = this.activeUnit()?.cell ?? this.cursor;
      this.refresh();
      return true;
    }
    if (this.inspect) { this.inspect = null; this.refresh(); return true; }
    return false;
  }

  /** Bestätigen (Enter, Bestätigen-Knopf): führt am Cursor aus. */
  confirm() {
    if (!this.isPlayerTurn) return;
    if (this.mode.kind === 'menu') { this.pickSub(this.mode.index); return; }
    const cell = this.pending ?? this.cursor;
    if (!cell) return;
    this.tap(cell, 'key');
  }

  /** Einheit in der Zugleiste gewählt: Kamera hin und Werte zeigen. */
  selectUnit(id: string) {
    const unit = unitById(this.state, id);
    if (!unit) return;
    this.inspect = id;
    void this.deps.world.focus(id);
    this.refresh();
  }

  /** Tastatur-/Router-Absichten. Gibt true zurück, wenn verbraucht. */
  intent(intent: Intent): boolean {
    switch (intent.type) {
      case 'nav': this.nav(intent.dir); return true;
      case 'digit': {
        if (this.mode.kind === 'menu' && this.isPlayerTurn) { this.pickSub(intent.value - 1); return true; }
        const key = (Object.keys(ACTION_LABELS) as ActionKey[]).find((candidate) => ACTION_LABELS[candidate].hotkey === intent.value);
        if (key) this.action(key);
        return true;
      }
      case 'interact': this.confirm(); return true;
      case 'cancel': this.cancel(); return true;
      default: return true;
    }
  }

  private nav(dir: 'up' | 'down' | 'left' | 'right') {
    if (!this.isPlayerTurn) return;
    const active = this.activeUnit();
    if (!active) return;
    const mode = this.mode;
    if (mode.kind === 'menu') {
      const count = this.menuEntries(active, mode.menu).length;
      if (count) this.mode = { ...mode, index: (mode.index + (dir === 'up' || dir === 'left' ? -1 : 1) + count) % count };
      this.refresh();
      return;
    }
    if (mode.kind === 'target' && (mode.entry.target === 'enemy' || mode.entry.target === 'ally')) {
      const valid = this.targetPreviews(active, mode.entry).filter((preview) => !preview.blocked);
      if (valid.length) {
        const index = valid.findIndex((preview) => sameCell(preview.cell, this.cursor));
        const next = valid[(index + (dir === 'up' || dir === 'left' ? -1 : 1) + valid.length) % valid.length];
        this.cursor = next.cell;
        this.pending = null;
        void this.deps.world.focus(next.cell);
        this.refresh();
        return;
      }
    }
    this.cursor = stepCell(this.cursor ?? active.cell, dir);
    this.pending = null;
    void this.deps.world.focus(this.cursor);
    this.refresh();
  }

  // ---------------------------------------------------------------- Ablauf

  private async awaitPlayer(unit: BattleUnit): Promise<BattleAction | null> {
    this.waiter = deferred();
    this.setPhase('player', false);
    if (!sameCell(this.cursor, unit.cell) && this.mode.kind === 'main') this.cursor = unit.cell;
    this.refresh();
    const action = await this.waiter.promise;
    this.waiter = null;
    return action;
  }

  private submit(action: BattleAction) {
    if (!this.waiter) return;
    this.deps.hud.sfx?.('confirm');
    const waiter = this.waiter;
    this.waiter = null;
    waiter.resolve(action);
  }

  private async execute(unit: BattleUnit, action: BattleAction) {
    this.setPhase('busy');
    const ok = await this.performSafe(action);
    this.pending = null;
    this.mode = { kind: 'main' };
    if (!ok) return;
    if (this.state.outcome) return;
    const after = unitById(this.state, unit.id);
    // Ohne Aktionspunkte endet der Zug automatisch (falls die Regeln ihn nicht schon weitergegeben haben).
    if (after && this.state.active === unit.id && after.ap <= 0 && action.type !== 'end') await this.performSafe({ type: 'end' });
    const next = unitById(this.state, this.state.active);
    this.cursor = next?.cell ?? null;
  }

  /** Aktion an die Regeln geben und abspielen; false bei Fehler (Meldung erscheint). */
  private async performSafe(action: BattleAction): Promise<boolean> {
    const { port, hud } = this.deps;
    let result;
    try { result = port.perform(action); } catch (error) { result = { ok: false as const, error: error instanceof Error ? error.message : String(error) }; }
    if (!result.ok) { hud.toast(result.error, 'bad'); hud.sfx?.('deny'); return false; }
    await this.play(result.events);
    return true;
  }

  /** Ereignisfolge abspielen; danach Szene und Oberfläche auf den echten Stand bringen. */
  private async play(events: readonly BattleEvent[]) {
    this.invalidate();
    const { world, hud, content } = this.deps;
    const state = this.state;
    for (const event of events) {
      if (this.aborted) return;
      const line = eventLine({ abilities: content.abilities, items: content.items }, state, event);
      if (line && event.type !== 'turn') hud.log(line);
      if (event.type === 'notice') hud.toast(event.text, event.tone === 'good' ? 'good' : event.tone === 'warn' ? 'bad' : 'info');
      await world.play(event, state);
    }
    world.sync(state);
    this.invalidate();
    this.refresh();
  }

  /** Kamera auf jede neu aktive Einheit; Banner bei Seiten- oder Rundenwechsel. */
  private async announceSide(unit: BattleUnit) {
    if (unit.id === this.lastActive && unit.team === this.lastSide && this.state.round === this.lastRound) return;
    const round = this.state.round;
    const sideChanged = unit.team !== this.lastSide;
    const roundChanged = round !== this.lastRound;
    this.lastActive = unit.id;
    this.lastSide = unit.team;
    this.lastRound = round;
    await this.deps.world.focus(unit.id);
    if (sideChanged || roundChanged) await this.deps.hud.banner(unit.team === 'party' ? 'Dein Zug' : 'Gegnerzug', `Runde ${Math.max(1, round)}`);
  }

  private async say(line: DialogueLine) {
    const name = line.speaker === 'narrator' ? '' : this.deps.speakerName?.(line.speaker) ?? line.speaker;
    const text = this.deps.formatText?.(line.text) ?? line.text;
    this.deps.hud.log(name ? `${name}: „${text}“` : text);
    await this.deps.hud.say(name, text);
  }

  private setPhase(phase: HudPhase, refresh = true) {
    this.phase = phase;
    if (phase !== 'player') { this.pending = null; }
    if (refresh) this.refresh();
  }

  private fingerprint(): string {
    const state = this.state;
    const unit = unitById(state, state.active);
    return `${state.active}|${state.round}|${state.log.length}|${state.rng}|${unit?.ap}|${unit ? cellKey(unit.cell) : ''}|${state.outcome}`;
  }

  private partyAnchor(): Cell {
    return this.state.units.find((unit) => unit.team === 'party' && unit.state === 'active')?.cell ?? [5, 4];
  }

  // ---------------------------------------------------------------- Abfragen (zwischengespeichert)

  private invalidate() { this.cache = null; this.targetCache = null; }

  private activeUnit(): BattleUnit | undefined {
    const unit = unitById(this.state, this.state.active);
    return unit && unit.team === 'party' ? unit : undefined;
  }

  private unitAt(cell: Cell): BattleUnit | undefined {
    return this.state.units.find((unit) => unit.state === 'active' && sameCell(unit.cell, cell))
      ?? this.state.units.find((unit) => sameCell(unit.cell, cell));
  }

  private keyFor(unit: BattleUnit): string {
    return `${unit.id}|${unit.ap}|${cellKey(unit.cell)}|${this.state.log.length}|${this.state.round}`;
  }

  private options(unit: BattleUnit): { reach: ReachOption[]; attack: TargetPreview[] } {
    const key = this.keyFor(unit);
    if (this.cache?.key === key) return this.cache;
    const { port, content } = this.deps;
    const canMove = unit.state === 'active' && unit.ap >= apCost(port, content, unit, { type: 'move', to: unit.cell });
    const canAttack = unit.state === 'active' && unit.ap >= apCost(port, content, unit, { type: 'attack', target: '' });
    const reach = canMove ? safe(() => port.reachable(unit.id), []) : [];
    const attack = canAttack ? safe(() => port.targets(unit.id, { type: 'attack' }), []) : [];
    this.cache = { key, reach, attack };
    return this.cache;
  }

  private targetPreviews(unit: BattleUnit, entry: TargetEntry): TargetPreview[] {
    const key = `${this.keyFor(unit)}|${JSON.stringify(entry.action)}`;
    if (this.targetCache?.key === key) return this.targetCache.previews;
    const previews = safe(() => this.deps.port.targets(unit.id, entry.action), []);
    this.targetCache = { key, previews };
    return previews;
  }

  private rangeCells(unit: BattleUnit, entry: TargetEntry): Cell[] {
    return this.deps.port.cellsInRange?.(unit.id, entry.action) ?? cellsWithin(unit.cell, entry.range);
  }

  private areaCells(entry: TargetEntry, center: Cell): Cell[] {
    if (entry.target !== 'area') return [center];
    return this.deps.port.area?.(entry.action, center) ?? cellsWithin(center, entry.radius ?? 1);
  }

  private menuEntries(unit: BattleUnit, menu: 'abilities' | 'items'): SubEntry[] {
    const { port, content } = this.deps;
    return menu === 'abilities' ? abilityEntries(port, content, unit) : itemEntries(port, content, unit, this.deps.inventory());
  }

  private actionEntries(unit: BattleUnit): ActionEntry[] {
    const { port, content } = this.deps;
    const { reach, attack } = this.options(unit);
    return mainActions({
      unit, port, content, reachable: reach.length, attackTargets: attack.filter((preview) => !preview.blocked).length,
      abilities: this.menuEntries(unit, 'abilities'), items: this.menuEntries(unit, 'items'), canFlee: port.encounter.canFlee !== false,
      extras: safe(() => port.extraActions?.(unit.id) ?? [], []),
    });
  }

  private enterTarget(unit: BattleUnit, entry: TargetEntry) {
    this.mode = { kind: 'target', entry };
    this.pending = null;
    if (entry.target === 'enemy' || entry.target === 'ally') {
      const first = this.targetPreviews(unit, entry).find((preview) => !preview.blocked);
      if (!first) this.deps.hud.toast(entry.target === 'enemy' ? 'Kein Gegner in Reichweite.' : 'Kein Ziel in Reichweite.', 'info');
      this.cursor = first?.cell ?? unit.cell;
      if (first) void this.deps.world.focus(first.cell);
    } else {
      this.cursor = unit.cell;
    }
    this.deps.hud.sfx?.('select');
    this.refresh();
  }

  private tapTarget(unit: BattleUnit, entry: TargetEntry, cell: Cell, confirmNow: boolean) {
    if (entry.target === 'cell' || entry.target === 'area') {
      const inRange = this.rangeCells(unit, entry).some((candidate) => sameCell(candidate, cell));
      if (!inRange) { this.deps.hud.toast('Außer Reichweite.', 'info'); this.pending = null; this.refresh(); return; }
      const blocked = this.deps.port.areaTargets ? safe(() => this.deps.port.areaTargets?.(unit.id, entry.action, cell)?.blocked, undefined) : undefined;
      if (blocked) { this.deps.hud.toast(blocked, 'bad'); this.pending = null; this.refresh(); return; }
      if (confirmNow) { this.submit(buildAction(entry, { cell })); return; }
      this.pending = cell;
      this.refresh();
      return;
    }
    const preview = this.targetPreviews(unit, entry).find((candidate) => sameCell(candidate.cell, cell));
    if (!preview?.unit) {
      const other = this.unitAt(cell);
      this.inspect = other?.id ?? null;
      this.pending = null;
      if (!other) this.deps.hud.toast(entry.target === 'enemy' ? 'Wähle einen Gegner.' : 'Wähle ein Crewmitglied.', 'info');
      this.refresh();
      return;
    }
    if (preview.blocked) { this.deps.hud.toast(preview.blocked, 'bad'); this.pending = null; this.refresh(); return; }
    if (confirmNow) { this.submit(buildAction(entry, { unit: preview.unit })); return; }
    this.pending = cell;
    this.refresh();
  }

  // ---------------------------------------------------------------- Modell für Szene und Oberfläche

  refresh() {
    const { world, hud, content } = this.deps;
    const state = this.state;
    const active = unitById(state, state.active);
    const playerTurn = this.isPlayerTurn && !!active && active.team === 'party';
    const highlights: Highlights = {
      reach: [], range: [], area: [], targets: [], path: null, pathAp: 0, cursor: null,
      active: state.active, inspect: this.inspect, goals: this.goals,
    };
    // Bossregeln: Terminal-Felder und angekündigte Wellenreihen (nur wenn der Zustand sie mitführt).
    const marks = ruleMarks(state as unknown as Parameters<typeof ruleMarks>[0]);
    if (marks.goals.length) highlights.goals = [...this.goals, ...marks.goals];
    if (marks.danger.length) highlights.danger = marks.danger;
    let target: HudModel['target'] = null;
    let prompt = '';
    let actions: ActionEntry[] = [];
    let menu: HudModel['menu'] = null;
    let selected: ActionKey | null = null;
    if (playerTurn && active) {
      highlights.cursor = this.cursor;
      actions = this.actionEntries(active);
      const mode = this.mode;
      if (mode.kind === 'main' || mode.kind === 'move') {
        selected = mode.kind === 'move' ? 'move' : null;
        const { reach, attack } = this.options(active);
        highlights.reach = reach.map((option) => ({ cell: option.cell, ap: option.ap ?? 1 }));
        const shown = mode.kind === 'main' ? attack : [];
        highlights.targets = shown.map((preview) => mark(preview, this.cursor));
        const move = reach.find((option) => sameCell(option.cell, this.cursor));
        const hit = shown.find((preview) => sameCell(preview.cell, this.cursor));
        if (hit) target = { title: `Angriff: ${unitById(state, hit.unit)?.name ?? 'Ziel'}`, lines: previewLines(hit), tone: 'enemy' };
        else if (move) {
          highlights.path = [active.cell, ...move.path];
          highlights.pathAp = move.ap ?? 1;
          target = { title: 'Bewegen', lines: [`${move.path.length} ${move.path.length === 1 ? 'Feld' : 'Felder'} · ${move.ap ?? 1} AP`], tone: 'move' };
        }
        prompt = mode.kind === 'move'
          ? 'Feld wählen und bestätigen · Esc: zurück'
          : reach.length || attack.length ? 'Feld zum Laufen oder Gegner zum Angreifen wählen · Ziffern wählen Aktionen' : 'Aktion wählen (Ziffern 1–9)';
      } else if (mode.kind === 'menu') {
        selected = mode.menu;
        const entries = this.menuEntries(active, mode.menu);
        const index = Math.min(mode.index, Math.max(0, entries.length - 1));
        menu = { title: ACTION_LABELS[mode.menu].label, entries, index };
        const current = entries[index];
        if (current) target = { title: current.label, lines: [current.meta, current.description, ...(current.reason ? [current.reason] : [])], tone: 'info' };
        prompt = 'Ziffer oder Pfeile + Enter wählen · Esc: zurück';
      } else {
        const entry = mode.entry;
        selected = entry.key === 'attack' ? 'attack' : entry.key === 'ability' ? 'abilities' : 'items';
        const previews = this.targetPreviews(active, entry);
        if (entry.target === 'cell' || entry.target === 'area') {
          highlights.range = this.rangeCells(active, entry);
          const cursorInRange = highlights.range.some((cell) => sameCell(cell, this.cursor));
          if (this.cursor && cursorInRange) {
            const exact = this.deps.port.areaTargets ? safe(() => this.deps.port.areaTargets?.(active.id, entry.action, this.cursor as Cell), undefined) : undefined;
            highlights.area = exact?.cells ?? this.areaCells(entry, this.cursor);
            const affected = exact?.previews ?? previews.filter((preview) => highlights.area.some((cell) => sameCell(cell, preview.cell)));
            if (exact?.blocked) affected.unshift({ cell: this.cursor, blocked: exact.blocked });
            highlights.targets = affected.filter((preview) => preview.unit).map((preview) => mark(preview, null));
            const lines = affected.map((preview) => (preview.unit ? `${unitById(state, preview.unit)?.name ?? 'Ziel'}: ${previewLines(preview).join(', ') || 'betroffen'}` : previewLines(preview).join(', ')));
            target = { title: entry.label, lines: lines.length ? lines : ['Niemand im Wirkungsbereich.'], tone: 'enemy' };
          }
          prompt = `${entry.label}: Feld in Reichweite wählen · Esc: zurück`;
        } else {
          highlights.range = this.rangeCells(active, entry);
          highlights.targets = previews.map((preview) => mark(preview, this.cursor));
          const hit = previews.find((preview) => sameCell(preview.cell, this.cursor));
          if (hit) target = { title: `${entry.label}: ${unitById(state, hit.unit)?.name ?? 'Ziel'}`, lines: previewLines(hit), tone: entry.target === 'ally' ? 'ally' : 'enemy' };
          prompt = previews.some((preview) => !preview.blocked)
            ? `${entry.label}: Ziel wählen (Pfeile wechseln, Enter bestätigt) · Esc: zurück`
            : `${entry.label}: kein Ziel in Reichweite · Esc: zurück`;
        }
      }
      if (this.pending) prompt = 'Noch einmal tippen oder „Bestätigen“ zum Ausführen';
    } else if (this.phase === 'enemy') {
      prompt = active ? `${active.name} ist am Zug …` : 'Gegnerzug …';
    } else if (this.phase === 'busy') {
      prompt = '…';
    }
    if (!playerTurn && this.phase !== 'over') actions = idleActions(this.deps.port.encounter.canFlee !== false);
    const inspectUnit = unitById(state, this.inspect);
    if (!target && inspectUnit && inspectUnit.id !== active?.id) {
      const card = unitCard(inspectUnit, content);
      target = {
        title: inspectUnit.name,
        lines: [`LP ${card.hp}/${card.maxHp} · Panzerung ${card.armor}`, card.weapon, ...card.statuses.map((status) => `${STATUS_META[status.id].label} (${status.turns} ${status.turns === 1 ? 'Runde' : 'Runden'})`)],
        tone: 'info',
      };
    }
    const order = turnOrder(state).map((id) => unitById(state, id)).filter((unit): unit is BattleUnit => !!unit)
      .map((unit) => ({ ...unitCard(unit, content), active: unit.id === state.active }));
    const model: HudModel = {
      phase: this.phase, round: Math.max(1, state.round), order,
      active: active ? unitCard(active, content) : null,
      inspect: inspectUnit ? unitCard(inspectUnit, content) : null,
      actions, selected, menu, target, prompt, pending: !!this.pending, objective: this.objective,
    };
    this.lastModel = model;
    world.setHighlights(highlights);
    hud.update(model);
  }
}

/** Gesperrte Leiste außerhalb eigener Züge (damit die Leiste nicht springt). */
function idleActions(canFlee: boolean): ActionEntry[] {
  const keys: ActionKey[] = ['move', 'attack', 'abilities', 'items', 'overwatch', 'cover', 'end', ...(canFlee ? ['flee' as const] : [])];
  return keys.map((key) => ({ key, label: ACTION_LABELS[key].label, hotkey: ACTION_LABELS[key].hotkey, ap: 0, enabled: false, reason: 'Gerade nicht am Zug.', hint: ACTION_LABELS[key].hint }));
}

function mark(preview: TargetPreview, cursor: Cell | null): TargetMark {
  return { cell: preview.cell, unit: preview.unit, badge: previewBadge(preview), blocked: !!preview.blocked, selected: sameCell(preview.cell, cursor) };
}

function safe<T>(run: () => T, fallback: T): T {
  try { return run(); } catch (error) { console.warn('[battle] Regelabfrage fehlgeschlagen', error); return fallback; }
}

/** Aktion mit Ziel zusammensetzen. Gegenstände mit Feldziel tragen `cell` zusätzlich (Vertragswunsch). */
export function buildAction(entry: Pick<TargetEntry, 'action'>, target: { unit?: string; cell?: Cell }): BattleAction {
  const action = entry.action;
  if (action.type === 'attack') return { type: 'attack', target: target.unit ?? '' };
  if (action.type === 'ability') {
    return target.cell ? { type: 'ability', ability: action.ability, cell: target.cell } : { type: 'ability', ability: action.ability, target: target.unit };
  }
  const base: BattleAction = target.unit ? { type: 'item', item: action.item, target: target.unit } : { type: 'item', item: action.item };
  return target.cell ? Object.assign(base, { cell: target.cell }) : base;
}

/** Ergebnisbildschirm: Belohnungen aus Begegnung und Kampfergebnis. */
export function resultModel(port: Pick<BattleSessionPort, 'encounter' | 'state'>, content: Pick<GameContent, 'items'>, result: BattleResult): ResultModel {
  const encounter = port.encounter;
  const state = port.state();
  const rewards: ResultModel['rewards'] = [];
  const notes: string[] = [];
  const downed = state.units.filter((unit) => unit.team === 'enemy' && unit.state !== 'active').length;
  const enemies = state.units.filter((unit) => unit.team === 'enemy').length;
  if (result.outcome === 'win') {
    const xp = (encounter.reward?.xp ?? 0) + Math.max(0, Math.round(result.xp ?? 0));
    const credits = (encounter.reward?.credits ?? 0) + Math.max(0, Math.round(result.credits ?? 0));
    if (xp > 0) rewards.push({ label: 'Erfahrung', value: `+${xp} XP` });
    if (credits > 0) rewards.push({ label: 'Credits', value: `+${credits} ¢` });
    const items: Record<string, number> = { ...(encounter.reward?.items ?? {}) };
    for (const [item, qty] of Object.entries(result.loot ?? {})) items[item] = (items[item] ?? 0) + qty;
    for (const [item, qty] of Object.entries(items)) if (qty > 0) rewards.push({ label: content.items[item]?.name ?? item, value: `${qty}×` });
    const companions = state.units.filter((unit) => unit.source.kind === 'companion');
    if (companions.length) notes.push(`${companions.map((unit) => unit.name).join(' und ')}: Beziehung +5 für den gemeinsamen Sieg.`);
  } else if (result.outcome === 'lose') {
    notes.push('Du kommst im Unterschlupf wieder zu dir – mit halben LP. Der Kampf lässt sich wiederholen.');
  } else {
    notes.push('Die Crew hat sich zurückgezogen. Die Gegner bleiben, wo sie sind.');
  }
  const used = Object.entries(result.used ?? {}).filter(([, qty]) => qty > 0);
  if (used.length) notes.push(`Verbraucht: ${used.map(([item, qty]) => `${qty}× ${content.items[item]?.name ?? item}`).join(', ')}.`);
  const rounds = Math.max(1, state.round);
  return {
    outcome: result.outcome,
    title: OUTCOME_TITLE[result.outcome],
    subtitle: `${encounter.name} · ${rounds} ${rounds === 1 ? 'Runde' : 'Runden'} · ${downed}/${enemies} Gegner ausgeschaltet`,
    rewards,
    notes,
  };
}
