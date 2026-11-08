// Kampfregeln: Bewegung und Pfadsuche auf dem Raster.
// - 4er-Nachbarschaft, jedes Feld kostet einen Schritt. Eine Bewegungsaktion (1 AP) reicht `unit.move` Felder,
//   zwei Aktionen (2 AP) das Doppelte.
// - Verbündete dürfen durchquert werden, Gegner nicht. Enden darf man nur auf freien Feldern (auch K.O.-Einheiten
//   belegen ihr Feld, damit man sie aufrichten kann).
// - Bei gleicher Länge meidet die Suche Gefahrenfelder; die Reihenfolge ist deterministisch.
import type { Cell } from '../contracts';
import { cellKey, inBounds, isHazard, isWalkable, neighbors, sameCell } from './grid';
import { isActive, isOnField, opponents } from './queries';
import type { CombatState, CombatUnit, ReachCell } from './types';

interface Node { cell: Cell; steps: number; hazards: number; prev: string | null }

/** Kosten mit Vorrang für kurze Wege, dann für wenige Gefahrenfelder. */
const cost = (node: Pick<Node, 'steps' | 'hazards'>): number => node.steps * 1000 + node.hazards;

/**
 * Alle Felder, die `unit` mit höchstens `maxSteps` Schritten erreicht (Dijkstra). Enthält auch das Startfeld und
 * belegte Durchgangsfelder; `endable` filtert auf Felder, auf denen die Einheit stehen bleiben darf.
 */
export function searchFrom(state: CombatState, unit: CombatUnit, maxSteps: number, from: Cell = unit.cell): Map<string, Node> {
  const blocked = new Set<string>();
  for (const other of state.units) {
    if (other.id !== unit.id && isActive(other) && opponents(unit, other)) blocked.add(cellKey(other.cell));
  }
  const nodes = new Map<string, Node>();
  const startKey = cellKey(from);
  nodes.set(startKey, { cell: from, steps: 0, hazards: 0, prev: null });
  const open: string[] = [startKey];
  while (open.length) {
    open.sort((a, b) => cost(nodes.get(a)!) - cost(nodes.get(b)!) || (a < b ? -1 : a > b ? 1 : 0));
    const key = open.shift()!;
    const current = nodes.get(key)!;
    if (current.steps >= maxSteps) continue;
    for (const next of neighbors(current.cell)) {
      if (!isWalkable(state.layout, next)) continue;
      const nextKey = cellKey(next);
      if (blocked.has(nextKey)) continue;
      const candidate: Node = {
        cell: next, steps: current.steps + 1, hazards: current.hazards + (isHazard(state.layout, next) ? 1 : 0), prev: key,
      };
      const known = nodes.get(nextKey);
      if (known && cost(known) <= cost(candidate)) continue;
      nodes.set(nextKey, candidate);
      if (!open.includes(nextKey)) open.push(nextKey);
    }
  }
  return nodes;
}

function pathOf(nodes: Map<string, Node>, key: string): Cell[] {
  const path: Cell[] = [];
  let node = nodes.get(key);
  while (node && node.prev !== null) {
    path.unshift(node.cell);
    node = nodes.get(node.prev);
  }
  return path;
}

/** Darf die Einheit auf diesem Feld stehen bleiben? */
export function canEndOn(state: CombatState, unit: CombatUnit, cell: Cell): boolean {
  if (!inBounds(cell) || !isWalkable(state.layout, cell)) return false;
  return !state.units.some(other => other.id !== unit.id && isOnField(other) && sameCell(other.cell, cell));
}

/**
 * Erreichbare Zielfelder mit AP-Kosten (1 bis `ap` Bewegungsaktionen), ohne Startfeld, sortiert nach Schritten.
 * `watched` nennt gegnerische Einheiten in Überwachung, deren Reichweite den Weg schneidet (Vorschau).
 */
export function reachableCells(state: CombatState, unit: CombatUnit, ap = unit.ap, from: Cell = unit.cell): ReachCell[] {
  const actions = Math.max(0, Math.min(ap, 2));
  if (actions <= 0 || unit.move <= 0) return [];
  const nodes = searchFrom(state, unit, unit.move * actions, from);
  const watchers = state.units.filter(other => isActive(other) && other.overwatch && opponents(unit, other));
  const result: ReachCell[] = [];
  for (const [key, node] of nodes) {
    if (node.steps === 0 || !canEndOn(state, unit, node.cell)) continue;
    const path = pathOf(nodes, key);
    const watched = watchers
      .filter(w => path.some(cell => Math.abs(cell[0] - w.cell[0]) + Math.abs(cell[1] - w.cell[1]) <= w.weapon.range))
      .map(w => w.id);
    result.push({ cell: node.cell, steps: node.steps, ap: Math.ceil(node.steps / unit.move), path, hazards: node.hazards, watched });
  }
  return result.sort((a, b) => a.steps - b.steps || a.cell[1] - b.cell[1] || a.cell[0] - b.cell[0]);
}

/** Weg zu einem Zielfeld oder null, wenn es mit `ap` Aktionen nicht erreichbar ist. */
export function findPath(state: CombatState, unit: CombatUnit, to: Cell, ap = unit.ap): ReachCell | null {
  return reachableCells(state, unit, ap).find(entry => sameCell(entry.cell, to)) ?? null;
}

/**
 * Entfernungsfeld (Schritte) zu den Zielfeldern, ohne Bewegungsbudget. Gegner der Einheit sperren, die
 * Zielfelder selbst dürfen belegt sein (z. B. das Feld eines anzugreifenden Gegners). Für die KI-Annäherung.
 */
export function distanceField(state: CombatState, unit: CombatUnit, goals: readonly Cell[]): Map<string, number> {
  const blocked = new Set<string>();
  for (const other of state.units) {
    if (other.id !== unit.id && isActive(other) && opponents(unit, other)) blocked.add(cellKey(other.cell));
  }
  const dist = new Map<string, number>();
  const queue: Cell[] = [];
  for (const goal of goals) {
    if (!inBounds(goal)) continue;
    dist.set(cellKey(goal), 0);
    queue.push(goal);
  }
  for (let i = 0; i < queue.length; i++) {
    const cell = queue[i];
    const d = dist.get(cellKey(cell))!;
    for (const next of neighbors(cell)) {
      const key = cellKey(next);
      if (dist.has(key) || !isWalkable(state.layout, next) || blocked.has(key)) continue;
      dist.set(key, d + 1);
      queue.push(next);
    }
  }
  return dist;
}
