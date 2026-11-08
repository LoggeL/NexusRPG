// Einziger Berührungspunkt zwischen Darstellung und modules/navigation (Bereich explore-presentation).

import type { MapDef, Point } from '../../modules/contracts';
import { createNavigation } from '../../modules/navigation';

/** Halbe Fußbreite in Kartenpixeln (Figuren sind auf 1536er-Karten ~40 px breit). */
export const FOOT = 10;
/** Rasterzelle der Pfadsuche; 8 px hält A* auf 1536×1024 schnell genug. */
export const NAV_CELL_EXPLORE = 8;

export interface NavAdapter {
  /** Fußpunkt ist begehbar (in einem walk-Polygon, in keinem block-Polygon, mit Fußbreite). */
  walkable(x: number, y: number): boolean;
  /** Wegpunkte von → nach (ohne Startpunkt); bei unerreichbarem Ziel bis zur nächstgelegenen erreichbaren Stelle. */
  findPath(from: Point, to: Point): Point[];
  /** Nächster begehbarer Punkt (für Klicks auf Hindernisse und Spawnkorrektur). */
  nearestWalkable(point: Point, maxRadius?: number): Point | null;
  readonly source: 'module';
}

export function createNavAdapter(map: MapDef): NavAdapter {
  const nav = createNavigation(map, { foot: FOOT, cell: NAV_CELL_EXPLORE });
  return {
    walkable: (x, y) => nav.walkable(x, y),
    findPath: (from, to) => nav.findPath(from, to),
    nearestWalkable: (point, radius) => nav.nearestWalkable(point, radius),
    source: 'module',
  };
}
