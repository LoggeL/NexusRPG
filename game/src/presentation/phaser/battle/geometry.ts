// Rastergeometrie der Kampfarena (design.md §3.7): 12 × 8 Felder à 128 px auf 1536×1024.
// Reine Rechnungen ohne Phaser/DOM – getestet in geometry.test.ts.
import type { ArenaDef, Cell } from '../../../modules/contracts';

export const CELL = 128;
export const COLS = 12;
export const ROWS = 8;
export const ARENA_W = CELL * COLS;
export const ARENA_H = CELL * ROWS;
/** Platz über der obersten Reihe für Köpfe, LP-Balken und Status-Symbole (Arenapixel). */
export const HEADROOM = 96;

export type TileKind = 'floor' | 'wall' | 'half' | 'full' | 'hazard' | 'start-party' | 'start-enemy';

const TILE_CHARS: Record<string, TileKind> = {
  '.': 'floor', '#': 'wall', h: 'half', H: 'full', '~': 'hazard', P: 'start-party', E: 'start-enemy',
};

/** Arena-Layout als Zeilen von Feldarten; unbekannte oder fehlende Zeichen gelten als Boden. */
export function parseLayout(arena: Pick<ArenaDef, 'layout'>): TileKind[][] {
  const rows: TileKind[][] = [];
  for (let row = 0; row < ROWS; row++) {
    const line = arena.layout[row] ?? '';
    const tiles: TileKind[] = [];
    for (let col = 0; col < COLS; col++) tiles.push(TILE_CHARS[line[col] ?? '.'] ?? 'floor');
    rows.push(tiles);
  }
  return rows;
}

export const cellKey = (cell: Cell): string => `${cell[0]},${cell[1]}`;
export const sameCell = (a: Cell | null | undefined, b: Cell | null | undefined): boolean => !!a && !!b && a[0] === b[0] && a[1] === b[1];
export const inArena = (cell: Cell): boolean => cell[0] >= 0 && cell[0] < COLS && cell[1] >= 0 && cell[1] < ROWS;
export const manhattan = (a: Cell, b: Cell): number => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);

/** Mittelpunkt eines Felds in Arenapixeln. */
export function cellCenter(cell: Cell): [number, number] {
  return [cell[0] * CELL + CELL / 2, cell[1] * CELL + CELL / 2];
}

/** Fußpunkt einer Figur im Feld (etwas unterhalb der Mitte, damit Kopf und Balken ins Feld passen). */
export function cellFoot(cell: Cell): [number, number] {
  return [cell[0] * CELL + CELL / 2, cell[1] * CELL + CELL - 14];
}

/** Feld unter einem Arenapunkt oder null außerhalb. */
export function cellAt(x: number, y: number): Cell | null {
  const cell: Cell = [Math.floor(x / CELL), Math.floor(y / CELL)];
  return inArena(cell) ? cell : null;
}

/** Alle Felder mit Manhattan-Abstand ≤ radius (Näherung, wenn der Regelport nichts liefert). */
export function cellsWithin(center: Cell, radius: number, includeCenter = true): Cell[] {
  const result: Cell[] = [];
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const distance = Math.abs(col - center[0]) + Math.abs(row - center[1]);
      if (distance > radius || (!includeCenter && distance === 0)) continue;
      result.push([col, row]);
    }
  }
  return result;
}

/** Cursor um ein Feld verschieben, am Rand festhalten. */
export function stepCell(cell: Cell, dir: 'up' | 'down' | 'left' | 'right'): Cell {
  const [dx, dy] = dir === 'left' ? [-1, 0] : dir === 'right' ? [1, 0] : dir === 'up' ? [0, -1] : [0, 1];
  return [Math.max(0, Math.min(COLS - 1, cell[0] + dx)), Math.max(0, Math.min(ROWS - 1, cell[1] + dy))];
}

/** Blickrichtung von a nach b (Laufblatt-Zeilen s, w, e, n). */
export function facingBetween(a: Cell, b: Cell, fallback: 's' | 'w' | 'e' | 'n' = 's'): 's' | 'w' | 'e' | 'n' {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  if (dx === 0 && dy === 0) return fallback;
  if (Math.abs(dx) >= Math.abs(dy)) return dx > 0 ? 'e' : 'w';
  return dy > 0 ? 's' : 'n';
}

// ---------------------------------------------------------------- Kamera

/** Bildschirmränder in logischen Canvas-Pixeln, die von der DOM-Oberfläche verdeckt sind. */
export interface Insets { top: number; right: number; bottom: number; left: number }
export const NO_INSETS: Insets = { top: 0, right: 0, bottom: 0, left: 0 };

export interface ViewRect { width: number; height: number }

/** Zoom, bei dem die ganze Arena in den freien Bereich passt. */
export function fitZoom(view: ViewRect, insets: Insets): number {
  const freeW = Math.max(64, view.width - insets.left - insets.right);
  const freeH = Math.max(64, view.height - insets.top - insets.bottom);
  return Math.min(freeW / ARENA_W, freeH / (ARENA_H + HEADROOM));
}

/** Nahansicht: Felder mindestens `minCell` logische Pixel groß, aber nie kleiner als die Übersicht. */
export function closeZoom(view: ViewRect, insets: Insets, minCell = 96): number {
  return Math.max(fitZoom(view, insets), Math.min(1, minCell / CELL));
}

/**
 * Kamerascroll (Phaser: Ursprung in der Kameramitte), sodass der Arenapunkt `focus` in der Mitte des freien
 * Bereichs liegt. Ist die Arena bei diesem Zoom kleiner als der freie Bereich, wird sie dort zentriert,
 * sonst wird der Scroll an den Arenarand geklemmt.
 */
export function scrollFor(view: ViewRect, insets: Insets, zoom: number, focus: readonly [number, number]): [number, number] {
  const axis = (size: number, before: number, after: number, low: number, high: number, point: number): number => {
    const free = Math.max(1, size - before - after);
    const freeCenter = before + free / 2;
    // Weltpunkt p liegt bei Bildschirm (p - scroll - size/2) * zoom + size/2.
    const scrollForPoint = (p: number) => p - (freeCenter - size / 2) / zoom - size / 2;
    if ((high - low) * zoom <= free) return scrollForPoint((low + high) / 2);
    // Ränder: Weltkante `low` an `before`, Weltkante `high` an `before + free`.
    const minScroll = low - (before - size / 2) / zoom - size / 2;
    const maxScroll = high - (before + free - size / 2) / zoom - size / 2;
    return Math.max(minScroll, Math.min(maxScroll, scrollForPoint(point)));
  };
  return [
    axis(view.width, insets.left, insets.right, 0, ARENA_W, focus[0]),
    axis(view.height, insets.top, insets.bottom, -HEADROOM, ARENA_H, focus[1]),
  ];
}

/** Bildschirmpunkt → Arenapunkt (Umkehrung der Kameraabbildung). */
export function screenToWorld(view: ViewRect, zoom: number, scroll: readonly [number, number], x: number, y: number): [number, number] {
  return [(x - view.width / 2) / zoom + scroll[0] + view.width / 2, (y - view.height / 2) / zoom + scroll[1] + view.height / 2];
}

/** Arenapunkt → Bildschirmpunkt. */
export function worldToScreen(view: ViewRect, zoom: number, scroll: readonly [number, number], x: number, y: number): [number, number] {
  return [(x - scroll[0] - view.width / 2) * zoom + view.width / 2, (y - scroll[1] - view.height / 2) * zoom + view.height / 2];
}
