// Kampfregeln: Arena-Raster 12 × 8 (Felder, Sichtlinie, Deckung, Blickrichtung).
//
// Zeichen (ArenaDef.layout): '.' Boden, '#' Hindernis, 'h' halbe Deckung, 'H' volle Deckung, '~' Gefahrenfeld,
// 'P' Party-Start, 'E' Gegner-Start.
// - Hindernisse und Deckungsobjekte sind nicht begehbar. Sie geben Einheiten auf den Nachbarfeldern Deckung gegen
//   Angriffe aus ihrer Richtung: 'h' halb (−20), 'H' und '#' voll (−40).
// - '#' und 'H' unterbrechen die Sichtlinie, 'h' nicht. Felder direkt neben Angreifer und Ziel zählen für die
//   Sichtlinie nicht (Um-die-Ecke-Schauen; das Deckungsobjekt am Ziel wirkt als Deckung statt als Sperre).
import type { Cell, Facing } from '../contracts';
import { COVER_FULL, COVER_HALF, GRID_COLS, GRID_ROWS } from './rules';

export interface CellInfo { walk: boolean; cover: number; blocksSight: boolean; hazard: boolean }

const FLOOR: CellInfo = { walk: true, cover: 0, blocksSight: false, hazard: false };
export const CELL_INFO: Readonly<Record<string, CellInfo>> = {
  '.': FLOOR,
  P: FLOOR,
  E: FLOOR,
  '~': { walk: true, cover: 0, blocksSight: false, hazard: true },
  '#': { walk: false, cover: COVER_FULL, blocksSight: true, hazard: false },
  h: { walk: false, cover: COVER_HALF, blocksSight: false, hazard: false },
  H: { walk: false, cover: COVER_FULL, blocksSight: true, hazard: false },
};
const OUTSIDE: CellInfo = { walk: false, cover: 0, blocksSight: true, hazard: false };

export const DIRS: readonly Cell[] = [[0, 1], [-1, 0], [1, 0], [0, -1]];
export const FACING_VECTOR: Readonly<Record<Facing, Cell>> = { s: [0, 1], w: [-1, 0], e: [1, 0], n: [0, -1] };

export const cellKey = (cell: Cell): string => `${cell[0]},${cell[1]}`;
export const sameCell = (a: Cell, b: Cell): boolean => a[0] === b[0] && a[1] === b[1];
export const inBounds = (cell: Cell): boolean =>
  Number.isInteger(cell[0]) && Number.isInteger(cell[1]) && cell[0] >= 0 && cell[1] >= 0 && cell[0] < GRID_COLS && cell[1] < GRID_ROWS;
/** Abstand in Feldern (Manhattan, 4-Nachbarschaft). */
export const distance = (a: Cell, b: Cell): number => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);

/** Prüft ein Arena-Layout; wirft mit deutscher Meldung, wenn es nicht 8 Zeilen à 12 bekannten Zeichen hat. */
export function parseLayout(layout: readonly string[], label = 'Arena'): string[] {
  if (!Array.isArray(layout) || layout.length !== GRID_ROWS) throw new Error(`${label}: Layout braucht ${GRID_ROWS} Zeilen.`);
  layout.forEach((row, index) => {
    if (typeof row !== 'string' || row.length !== GRID_COLS) throw new Error(`${label}: Zeile ${index + 1} braucht ${GRID_COLS} Zeichen.`);
    for (const char of row) if (!(char in CELL_INFO)) throw new Error(`${label}: unbekanntes Zeichen „${char}“ in Zeile ${index + 1}.`);
  });
  return [...layout];
}

export const charAt = (layout: readonly string[], cell: Cell): string =>
  inBounds(cell) ? layout[cell[1]]?.[cell[0]] ?? '#' : '#';
export const infoAt = (layout: readonly string[], cell: Cell): CellInfo =>
  inBounds(cell) ? CELL_INFO[charAt(layout, cell)] ?? OUTSIDE : OUTSIDE;
export const isWalkable = (layout: readonly string[], cell: Cell): boolean => infoAt(layout, cell).walk;
export const isHazard = (layout: readonly string[], cell: Cell): boolean => infoAt(layout, cell).hazard;

/** Alle Felder mit diesem Zeichen, zeilenweise von oben links. */
export function cellsWith(layout: readonly string[], char: string): Cell[] {
  const cells: Cell[] = [];
  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS; col++) if (layout[row]?.[col] === char) cells.push([col, row]);
  }
  return cells;
}

export function neighbors(cell: Cell): Cell[] {
  return DIRS.map(([dx, dy]) => [cell[0] + dx, cell[1] + dy] as Cell).filter(inBounds);
}

/** Felder im Umkreis (Manhattan) innerhalb der Arena, inklusive Mittelpunkt. */
export function cellsInRadius(center: Cell, radius: number): Cell[] {
  const cells: Cell[] = [];
  const r = Math.max(0, Math.floor(radius));
  for (let dy = -r; dy <= r; dy++) {
    for (let dx = -r; dx <= r; dx++) {
      const cell: Cell = [center[0] + dx, center[1] + dy];
      if (Math.abs(dx) + Math.abs(dy) <= r && inBounds(cell)) cells.push(cell);
    }
  }
  return cells;
}

const EPS = 1e-6;

/**
 * Sichtlinie zwischen zwei Feldmittelpunkten. Ein Abtastpunkt, der genau auf einer Feldgrenze liegt, sperrt nur,
 * wenn alle angrenzenden Felder sperren (großzügige Ecken).
 */
export function lineOfSight(layout: readonly string[], from: Cell, to: Cell): boolean {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const steps = Math.max(Math.abs(dx), Math.abs(dy)) * 4;
  if (steps === 0) return true;
  const ignored = (cell: Cell) =>
    Math.max(Math.abs(cell[0] - from[0]), Math.abs(cell[1] - from[1])) <= 1 ||
    Math.max(Math.abs(cell[0] - to[0]), Math.abs(cell[1] - to[1])) <= 1;
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    const x = from[0] + 0.5 + dx * t;
    const y = from[1] + 0.5 + dy * t;
    const xs = [...new Set([Math.floor(x - EPS), Math.floor(x + EPS)])];
    const ys = [...new Set([Math.floor(y - EPS), Math.floor(y + EPS)])];
    let blocked = true;
    for (const cx of xs) {
      for (const cy of ys) {
        const cell: Cell = [cx, cy];
        if (ignored(cell) || !infoAt(layout, cell).blocksSight) blocked = false;
      }
    }
    if (blocked) return false;
  }
  return true;
}

/**
 * Deckung eines Ziels gegen einen Angreifer: Deckungsobjekt auf dem Nachbarfeld in Richtung des Angreifers.
 * Ist der Angreifer schräg versetzt, zählt auch die Nebenachse, wenn sie mindestens halb so lang ist.
 */
export function coverAgainst(layout: readonly string[], target: Cell, from: Cell): { value: number; cell: Cell | null } {
  const dx = from[0] - target[0];
  const dy = from[1] - target[1];
  const candidates: Cell[] = [];
  if (dx !== 0 && Math.abs(dx) * 2 >= Math.abs(dy)) candidates.push([target[0] + Math.sign(dx), target[1]]);
  if (dy !== 0 && Math.abs(dy) * 2 >= Math.abs(dx)) candidates.push([target[0], target[1] + Math.sign(dy)]);
  let best: { value: number; cell: Cell | null } = { value: 0, cell: null };
  for (const cell of candidates) {
    if (sameCell(cell, from)) continue;
    const value = inBounds(cell) ? infoAt(layout, cell).cover : 0;
    if (value > best.value) best = { value, cell };
  }
  return best;
}

/** Höchste Deckung, die ein Feld gegen irgendeine Richtung bietet (für KI und Anzeige). */
export function bestCoverAt(layout: readonly string[], cell: Cell): number {
  return Math.max(0, ...neighbors(cell).map(n => infoAt(layout, n).cover));
}

/** Blickrichtung von `from` nach `to` (Hauptachse; bei Gleichstand waagerecht). */
export function facingToward(from: Cell, to: Cell, fallback: Facing = 's'): Facing {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  if (dx === 0 && dy === 0) return fallback;
  if (Math.abs(dx) >= Math.abs(dy)) return dx > 0 ? 'e' : 'w';
  return dy > 0 ? 's' : 'n';
}

/** Lage des Angreifers relativ zur Blickrichtung des Ziels. 'back' = Flanke. */
export function relationTo(target: { cell: Cell; facing: Facing }, from: Cell): 'front' | 'side' | 'back' {
  const [fx, fy] = FACING_VECTOR[target.facing];
  const dot = (from[0] - target.cell[0]) * fx + (from[1] - target.cell[1]) * fy;
  if (dot > 0) return 'front';
  if (dot < 0) return 'back';
  return 'side';
}
