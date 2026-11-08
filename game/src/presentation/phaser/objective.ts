// Zielmarker des aktiven Ziels (QuestStepDef.marker) auf der Karte (Bereich explore-presentation), ohne Phaser testbar.
// Auf der Zielkarte zeigt der Marker auf `marker.at`; auf anderen Karten auf den Ausgang, der auf dem kürzesten Weg
// (Breitensuche über die Ausgänge aller Karten) dorthin führt.
import type { Condition, ExitDef, MapDef, MapId, ObjectiveView, Point } from '../../modules/contracts';
import { exitCenter } from './presence';

export interface ObjectiveTarget {
  point: Point;
  /** 'here': Ziel liegt auf dieser Karte; 'exit': Ausgang Richtung Zielkarte. */
  kind: 'here' | 'exit';
  label: string;
  exit?: ExitDef;
}

/** Erster Ausgang auf dem kürzesten Kartenweg von `from` nach `to` (offene Ausgänge bevorzugt). */
export function firstExitTowards(maps: Readonly<Record<MapId, MapDef>>, from: MapId, to: MapId, evaluate: (condition?: Condition) => boolean): ExitDef | null {
  if (from === to || !Object.prototype.hasOwnProperty.call(maps, from)) return null;
  for (const openOnly of [true, false]) {
    const firstStep = new Map<MapId, ExitDef>();
    const queue: MapId[] = [from];
    const visited = new Set<MapId>([from]);
    while (queue.length) {
      const current = queue.shift()!;
      const map = Object.prototype.hasOwnProperty.call(maps, current) ? maps[current] : null;
      if (!map) continue;
      for (const exit of map.exits) {
        if (openOnly && !evaluate(exit.when)) continue;
        if (visited.has(exit.to)) continue;
        visited.add(exit.to);
        const step = current === from ? exit : firstStep.get(current)!;
        if (exit.to === to) return step;
        firstStep.set(exit.to, step);
        queue.push(exit.to);
      }
    }
  }
  return null;
}

export function objectiveTarget(map: MapDef, maps: Readonly<Record<MapId, MapDef>>, objective: ObjectiveView | null, evaluate: (condition?: Condition) => boolean): ObjectiveTarget | null {
  const marker = objective?.marker;
  if (!objective || !marker) return null;
  if (marker.map === map.id) return marker.at ? { point: [marker.at[0], marker.at[1]], kind: 'here', label: objective.title } : null;
  const exit = firstExitTowards(maps, map.id, marker.map, evaluate);
  if (!exit) return null;
  return { point: exitCenter(exit), kind: 'exit', label: exit.label, exit };
}

/**
 * Randpfeil für ein Ziel außerhalb des Sichtbereichs: Punkt auf dem um `margin` eingerückten Rand der Ansicht
 * (Bildschirmkoordinaten) in Richtung des Ziels plus Winkel (Bogenmaß, 0 = rechts). `null`, wenn das Ziel sichtbar ist.
 */
export function edgeIndicator(view: { x: number; y: number; w: number; h: number }, target: Point, margin = 36): { x: number; y: number; angle: number } | null {
  const sx = target[0] - view.x;
  const sy = target[1] - view.y;
  if (sx >= 0 && sy >= 0 && sx <= view.w && sy <= view.h) return null;
  const cx = view.w / 2;
  const cy = view.h / 2;
  const dx = sx - cx;
  const dy = sy - cy;
  const angle = Math.atan2(dy, dx);
  const halfW = cx - margin;
  const halfH = cy - margin;
  const scale = Math.min(halfW / Math.max(1e-6, Math.abs(dx)), halfH / Math.max(1e-6, Math.abs(dy)));
  return { x: cx + dx * scale, y: cy + dy * scale, angle };
}
