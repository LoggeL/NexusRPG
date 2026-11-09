// Kampfregeln: Sonderregeln für Bosse (EnemyDef.rules, contracts.ts `EnemyRule`). Datengetrieben, deterministisch.
//
// Rundenbeginn (`rulesAtRoundStart`): Funkruf-Verstärkung, Flächenwelle (Ankündigung, eine Runde später Treffer),
// Fluchtuhr (Gleiter), Charmeur (Seitenwechsel), Terminal halten, Meldung, wenn ein Schutz fällt.
// Zugbeginn (`rulesAtTurnStart`): Zögern (AP-Verlust neben einer bestimmten Figur), Flucht bei abgelaufener Uhr.
// Unverwundbarkeit und Aufgabe statt K.O. wirken direkt im Schaden (effects.ts), die Vorschau zeigt 0 Schaden.
import type { Cell } from '../contracts';
import { has } from '../campaign/ids';
import { applyStatus, dealDamage, emit, finish, leaveField, roll, type Ctx } from './effects';
import { cellsWith, distance, inBounds, isWalkable, sameCell } from './grid';
import { hasStatus, homeTeam, isActive, isInvulnerable, isOnField, ruleOpen, rulesOf } from './queries';
import { GRID_COLS, GRID_ROWS, HOLD_STATUS } from './rules';
import { emptyBossRuntime, enemyUnit, Placer } from './setup';
import type { BossRuntime, CombatState, CombatUnit } from './types';

const runtime = (ctx: Ctx): BossRuntime => (ctx.s.boss ??= emptyBossRuntime());

/** Einmalige Meldung je Schlüssel. */
function once(ctx: Ctx, key: string): boolean {
  const said = runtime(ctx).said;
  if (said.includes(key)) return false;
  said.push(key);
  return true;
}

const held = (unit: CombatUnit) => HOLD_STATUS.some(status => hasStatus(unit, status));
const rowList = (rows: readonly number[]) => {
  const names = [...rows].sort((a, b) => a - b).map(row => String(row + 1));
  return names.length > 1 ? `${names.slice(0, -1).join(', ')} und ${names[names.length - 1]}` : names[0];
};

/** Einheiten mit Regeln in fester Reihenfolge (Kopie: Verstärkungen kommen erst nach der Schleife dazu). */
const ruled = (ctx: Ctx) => ctx.s.units.filter(unit => unit.rules?.length && isActive(unit));

// ---------------------------------------------------------------------------
// Rundenbeginn

export function rulesAtRoundStart(ctx: Ctx): void {
  if (!ctx.s.boss && !ctx.s.units.some(unit => unit.rules?.length)) return;
  announceShields(ctx);
  for (const unit of ruled(ctx)) {
    if (ctx.s.outcome) return;
    if (!isActive(unit)) continue;
    for (const { rule, key } of rulesOf(unit, 'wave')) if (!ctx.s.outcome) wave(ctx, unit, rule, key);
    for (const { rule, key } of rulesOf(unit, 'countdown')) if (ruleOpen(ctx.s, unit, rule)) countdown(ctx, unit, rule, key);
    for (const { rule, key } of rulesOf(unit, 'charm')) if (ruleOpen(ctx.s, unit, rule)) charm(ctx, unit, rule, key);
    for (const { rule, key } of rulesOf(unit, 'hold')) if (!ctx.s.outcome && ruleOpen(ctx.s, unit, rule)) hold(ctx, unit, rule, key);
    for (const { rule, key } of rulesOf(unit, 'reinforce')) if (!ctx.s.outcome && ruleOpen(ctx.s, unit, rule)) reinforce(ctx, unit, rule, key);
  }
}

/** Meldet, wenn ein Schutz (Unverwundbarkeit) beginnt oder fällt. Auch nach jedem K.O. aufrufen. */
export function announceShields(ctx: Ctx): void {
  for (const unit of ruled(ctx)) {
    for (const { rule, key } of rulesOf(unit, 'invulnerable')) {
      const on = isInvulnerable(ctx.s, unit);
      if (on && rule.line && once(ctx, `${key}:an`)) emit(ctx, { type: 'bark', unit: unit.id, text: rule.line });
      if (on && once(ctx, `${key}:hinweis`)) emit(ctx, { type: 'notice', unit: unit.id, tone: 'info', text: `${unit.name} ist unverwundbar, solange ein Schutz steht.` });
      if (!on && runtime(ctx).said.includes(`${key}:hinweis`) && once(ctx, `${key}:aus`)) {
        emit(ctx, { type: 'notice', unit: unit.id, tone: 'good', text: `Der Schutz ist gefallen – ${unit.name} ist verwundbar!` });
        if (rule.endLine) emit(ctx, { type: 'bark', unit: unit.id, text: rule.endLine });
      }
    }
  }
}

function wave(ctx: Ctx, unit: CombatUnit, rule: Extract<NonNullable<CombatUnit['rules']>[number], { kind: 'wave' }>, key: string): void {
  const rt = runtime(ctx);
  const round = ctx.s.round;
  const pending = rt.wave[key];
  if (pending?.length) {
    delete rt.wave[key];
    emit(ctx, { type: 'notice', unit: unit.id, tone: 'warn', text: `${rule.name} rast durch Reihe ${rowList(pending)}!` });
    for (const target of ctx.s.units) {
      if (!isActive(target) || homeTeam(target) === homeTeam(unit) || !pending.includes(target.cell[1])) continue;
      emit(ctx, { type: 'damage', unit: target.id, amount: Math.min(target.hp, rule.damage), source: 'welle' });
      dealDamage(ctx, target, rule.damage);
      if (rule.status && isActive(target)) applyStatus(ctx, target, rule.status, rule.turns ?? 1);
    }
    announceShields(ctx);
  }
  if (!ruleOpen(ctx.s, unit, rule) || held(unit)) return;
  if (rt.since[key] === undefined) {
    rt.since[key] = round;
    if (rule.line) emit(ctx, { type: 'bark', unit: unit.id, text: rule.line });
  }
  if ((round - rt.since[key]) % Math.max(1, rule.every) !== 0) return;
  const free = Array.from({ length: GRID_ROWS }, (_, row) => row);
  const rows: number[] = [];
  for (let i = 0; i < Math.min(rule.rows, GRID_ROWS) && free.length; i++) rows.push(free.splice(Math.floor(roll(ctx) * free.length), 1)[0]);
  rt.wave[key] = rows.sort((a, b) => a - b);
  emit(ctx, {
    type: 'notice', unit: unit.id, tone: 'warn',
    text: rule.warn ? rule.warn.replace('{reihen}', rowList(rows)) : `${rule.name} lädt: Reihe ${rowList(rows)} leuchtet – raus da!`,
  });
}

function countdown(ctx: Ctx, unit: CombatUnit, rule: Extract<NonNullable<CombatUnit['rules']>[number], { kind: 'countdown' }>, key: string): void {
  const rt = runtime(ctx);
  const left = rt.countdown[key];
  if (left === undefined) {
    rt.countdown[key] = Math.max(1, rule.rounds);
    if (rule.line) emit(ctx, { type: 'bark', unit: unit.id, text: rule.line });
    emit(ctx, { type: 'notice', unit: unit.id, tone: 'warn', text: `${rule.name}: noch ${rt.countdown[key]} Runden. Betäuben oder Hacken hält ${unit.name} auf.` });
    return;
  }
  if (left <= 0) return;
  if (held(unit)) {
    emit(ctx, { type: 'notice', unit: unit.id, tone: 'good', text: rule.holdLine ?? `${unit.name} kommt nicht vom Fleck – ${rule.name} steht bei ${left}.` });
    return;
  }
  rt.countdown[key] = left - 1;
  if (left - 1 > 0) emit(ctx, { type: 'notice', unit: unit.id, tone: 'warn', text: `${rule.name}: noch ${left - 1} ${left - 1 === 1 ? 'Runde' : 'Runden'}.` });
  else emit(ctx, { type: 'notice', unit: unit.id, tone: 'warn', text: rule.readyLine ?? `${rule.name}: bereit! Haltet ${unit.name} auf, bevor ${unit.name} am Zug ist!` });
}

function charm(ctx: Ctx, unit: CombatUnit, rule: Extract<NonNullable<CombatUnit['rules']>[number], { kind: 'charm' }>, key: string): void {
  const every = Math.max(1, rule.every);
  if (ctx.s.round < every || ctx.s.round % every !== 0) return;
  const immune = rule.immuneHearts ?? 8;
  const crew = ctx.s.units.filter(other => isActive(other) && homeTeam(other) !== homeTeam(unit) && other.source.kind === 'companion' && !other.vip);
  if (!crew.length) return;
  const open = crew.filter(other => (other.hearts ?? 0) < immune).sort((a, b) => (a.hearts ?? 0) - (b.hearts ?? 0) || a.spawn - b.spawn);
  if (!open.length) {
    const loyal = [...crew].sort((a, b) => (b.hearts ?? 0) - (a.hearts ?? 0))[0];
    if (once(ctx, `${key}:immun`)) emit(ctx, { type: 'bark', unit: loyal.id, text: rule.resistLine ?? `Nicht noch mal, ${unit.name}.` });
    return;
  }
  const target = open[0];
  if (rule.line) emit(ctx, { type: 'bark', unit: unit.id, text: rule.line.replace('{name}', target.name) });
  applyStatus(ctx, target, 'gesteuert', 1);
}

function hold(ctx: Ctx, unit: CombatUnit, rule: Extract<NonNullable<CombatUnit['rules']>[number], { kind: 'hold' }>, key: string): void {
  const rt = runtime(ctx);
  const cell = rule.cell as Cell;
  if (rt.hold[key] === undefined) {
    rt.hold[key] = 0;
    if (rule.line) emit(ctx, { type: 'bark', unit: unit.id, text: rule.line });
    emit(ctx, { type: 'notice', tone: 'info', text: `${rule.name}: Haltet das markierte Feld ${rule.rounds} Runden lang – oder schaltet ${unit.name} aus.` });
    return;
  }
  const near = (other: CombatUnit) => isActive(other) && distance(other.cell, cell) <= 1;
  const ours = ctx.s.units.filter(other => near(other) && homeTeam(other) !== homeTeam(unit) && !other.vip);
  const theirs = ctx.s.units.filter(other => near(other) && homeTeam(other) === homeTeam(unit));
  if (!ours.length || theirs.length) {
    emit(ctx, { type: 'notice', tone: 'warn', text: `${rule.name}: ${theirs.length ? 'umkämpft' : 'unbesetzt'} (${rt.hold[key]}/${rule.rounds}).` });
    return;
  }
  rt.hold[key] += 1;
  emit(ctx, { type: 'objective', unit: ours[0].id, progress: rt.hold[key], needed: rule.rounds });
  if (rt.hold[key] < rule.rounds) return;
  if (rule.winLine) emit(ctx, { type: 'bark', unit: unit.id, text: rule.winLine });
  for (const other of ctx.s.units) if (isActive(other) && homeTeam(other) === homeTeam(unit)) leaveField(ctx, other, 'surrendered');
  finish(ctx, 'win');
}

function reinforce(ctx: Ctx, unit: CombatUnit, rule: Extract<NonNullable<CombatUnit['rules']>[number], { kind: 'reinforce' }>, key: string): void {
  const every = Math.max(1, rule.every);
  const from = rule.from ?? every + 1;
  const round = ctx.s.round;
  if (round < from || (round - from) % every !== 0 || held(unit)) return;
  if (!has(ctx.data.enemies, rule.enemy)) return;
  const rt = runtime(ctx);
  // Höchstzahl je rufendem Gegnertyp und Kampf (zwei Wachleute rufen zusammen höchstens `max`, Gerufene rufen nicht endlos nach).
  const callKey = unit.source.kind === 'enemy' ? `${unit.source.enemy}>${rule.enemy}` : key;
  const max = rule.max ?? Infinity;
  const count = Math.min(Math.max(1, rule.count ?? 1), max - (rt.called[callKey] ?? 0));
  if (count <= 0) return;
  const def = ctx.data.enemies[rule.enemy];
  const taken = ctx.s.units.filter(isOnField).map(other => other.cell);
  const placer = new Placer(ctx.s.layout, taken);
  const starts = cellsWith(ctx.s.layout, 'E');
  let spawned = 0;
  for (let i = 0; i < count; i++) {
    const n = ctx.s.units.filter(other => other.source.kind === 'enemy' && other.source.enemy === def.id).length + 1;
    let cell: Cell;
    try { cell = placer.place(undefined, starts, 'right'); } catch { break; }
    if (!inBounds(cell) || !isWalkable(ctx.s.layout, cell) || ctx.s.units.some(other => isOnField(other) && sameCell(other.cell, cell))) break;
    const fresh = enemyUnit(def, `${def.id}#${n}`, n > 1 ? `${def.name} ${n}` : def.name, cell, ctx.s.units.length, ctx.s.difficulty);
    fresh.facing = 'w';
    ctx.s.units.push(fresh);
    ctx.s.order.push(fresh.id);
    emit(ctx, { type: 'spawn', unit: fresh.id });
    spawned += 1;
  }
  if (!spawned) return;
  rt.called[callKey] = (rt.called[callKey] ?? 0) + spawned;
  if (rule.line) emit(ctx, { type: 'bark', unit: unit.id, text: rule.line });
  emit(ctx, { type: 'notice', unit: unit.id, tone: 'warn', text: `Funkruf: ${spawned === 1 ? `${def.name} kommt` : `${spawned} × ${def.name} kommen`} dazu.` });
}

// ---------------------------------------------------------------------------
// Zugbeginn

/** Nach dem Setzen der AP und nach „Betäubt/Gehackt“. Liefert true, wenn der Kampf dadurch endet. */
export function rulesAtTurnStart(ctx: Ctx, unit: CombatUnit): boolean {
  if (!unit.rules?.length) return false;
  for (const { rule } of rulesOf(unit, 'hesitate')) {
    if (!ruleOpen(ctx.s, unit, rule)) continue;
    const every = Math.max(1, rule.every ?? 2);
    if (ctx.s.round % every !== 0) continue;
    const near = ctx.s.units.find(other => isActive(other) && other.source.kind === 'companion' && other.source.npc === rule.near
      && homeTeam(other) !== homeTeam(unit) && distance(other.cell, unit.cell) <= 1);
    if (!near) continue;
    unit.ap = Math.max(0, unit.ap - Math.max(1, rule.ap ?? 1));
    if (rule.line) emit(ctx, { type: 'bark', unit: unit.id, text: rule.line });
    emit(ctx, { type: 'notice', unit: unit.id, tone: 'good', text: `${unit.name} zögert neben ${near.name} (−${Math.max(1, rule.ap ?? 1)} AP).` });
  }
  for (const { rule, key } of rulesOf(unit, 'countdown')) {
    if (runtime(ctx).countdown[key] !== 0) continue;
    if (rule.endLine) emit(ctx, { type: 'bark', unit: unit.id, text: rule.endLine });
    emit(ctx, { type: 'notice', unit: unit.id, tone: 'warn', text: `${unit.name} entkommt – ${rule.name} abgelaufen.` });
    leaveField(ctx, unit, 'fled');
    finish(ctx, rule.outcome);
    return true;
  }
  return false;
}

/** Felder, die die Darstellung markieren soll: angekündigte Wellenreihen und Terminals. */
export function ruleMarks(state: Pick<CombatState, 'boss' | 'units'>): { danger: Cell[]; goals: Cell[] } {
  const danger: Cell[] = [];
  const goals: Cell[] = [];
  const rt = state.boss;
  if (!rt) return { danger, goals };
  for (const rows of Object.values(rt.wave)) {
    for (const row of rows) for (let col = 0; col < GRID_COLS; col++) danger.push([col, row]);
  }
  for (const unit of state.units) {
    if (!isActive(unit)) continue;
    (unit.rules ?? []).forEach((rule, index) => {
      if (rule.kind === 'hold' && rt.hold[`${unit.id}#${index}`] !== undefined) goals.push(rule.cell as Cell);
    });
  }
  return { danger, goals };
}
