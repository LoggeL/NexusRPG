// Prozedurale Kampfgrafik: Status-Symbole (für Szene und DOM) und Platzhalter-Arena aus dem Layout,
// solange `arena/<id>.webp` fehlt (design.md §6: erkennbare Platzhalter statt Lücken).
import type { ArenaDef, StatusId } from '../../../modules/contracts';
import { NEON } from '../../placeholders';
import { ARENA_H, ARENA_W, CELL, COLS, parseLayout, ROWS } from './geometry';
import { STATUS_META, STATUS_ORDER } from './text';

export const STATUS_ICON = 48;

function makeCanvas(width: number, height: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const element = document.createElement('canvas');
  element.width = width;
  element.height = height;
  const context = element.getContext('2d');
  if (!context) throw new Error('Canvas 2D nicht verfügbar.');
  return [element, context];
}

/** Ein Statussymbol in ein Quadrat der Größe `size` bei (x, y) zeichnen. */
export function drawStatusIcon(context: CanvasRenderingContext2D, id: StatusId, x: number, y: number, size = STATUS_ICON): void {
  const color = STATUS_META[id].color;
  const s = size / 48;
  const cx = x + size / 2;
  const cy = y + size / 2;
  context.save();
  // Grundplakette
  context.fillStyle = 'rgba(11, 7, 22, 0.92)';
  context.strokeStyle = color;
  context.lineWidth = 3 * s;
  context.beginPath();
  context.arc(cx, cy, size / 2 - 2 * s, 0, Math.PI * 2);
  context.fill();
  context.stroke();
  context.fillStyle = color;
  context.strokeStyle = color;
  context.lineCap = 'round';
  context.lineJoin = 'round';
  context.lineWidth = 3.5 * s;
  const p = (dx: number, dy: number): [number, number] => [cx + dx * s, cy + dy * s];
  const path = (points: [number, number][], close = false) => {
    context.beginPath();
    points.forEach(([px, py], index) => (index ? context.lineTo(px, py) : context.moveTo(px, py)));
    if (close) context.closePath();
  };
  switch (id) {
    case 'gehackt': // Blitz mit Glitch-Versatz
      path([p(3, -15), p(-7, 2), p(1, 2), p(-4, 15), p(9, -3), p(1, -3), p(6, -15)], true);
      context.fill();
      context.fillStyle = NEON.pink;
      context.fillRect(cx - 14 * s, cy - 6 * s, 9 * s, 3 * s);
      context.fillRect(cx + 6 * s, cy + 6 * s, 9 * s, 3 * s);
      break;
    case 'betaeubt': // Sterne im Kreis
      for (const angle of [0, 2.1, 4.2]) {
        const [sx, sy] = p(Math.cos(angle) * 9, Math.sin(angle) * 6 - 2);
        context.beginPath();
        for (let i = 0; i < 10; i++) {
          const r = (i % 2 ? 2.4 : 6) * s;
          const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
          const px = sx + Math.cos(a) * r;
          const py = sy + Math.sin(a) * r;
          if (i) context.lineTo(px, py); else context.moveTo(px, py);
        }
        context.closePath();
        context.fill();
      }
      break;
    case 'brennt': // Flamme
      context.beginPath();
      context.moveTo(...p(0, -16));
      context.bezierCurveTo(...p(12, -4), ...p(12, 8), ...p(0, 14));
      context.bezierCurveTo(...p(-12, 8), ...p(-11, -2), ...p(-4, -8));
      context.bezierCurveTo(...p(-3, -2), ...p(0, -4), ...p(0, -16));
      context.fill();
      context.fillStyle = '#ffe14a';
      context.beginPath();
      context.moveTo(...p(0, -2));
      context.bezierCurveTo(...p(6, 4), ...p(5, 11), ...p(0, 12));
      context.bezierCurveTo(...p(-5, 11), ...p(-6, 5), ...p(0, -2));
      context.fill();
      break;
    case 'blutet': // Tropfen
      context.beginPath();
      context.moveTo(...p(0, -15));
      context.bezierCurveTo(...p(4, -6), ...p(11, 0), ...p(11, 6));
      context.arc(cx, cy + 6 * s, 11 * s, 0, Math.PI, false);
      context.bezierCurveTo(...p(-11, 0), ...p(-4, -6), ...p(0, -15));
      context.fill();
      break;
    case 'markiert': // Fadenkreuz
      context.beginPath();
      context.arc(cx, cy, 10 * s, 0, Math.PI * 2);
      context.stroke();
      for (const [ax, ay, bx, by] of [[0, -17, 0, -6], [0, 6, 0, 17], [-17, 0, -6, 0], [6, 0, 17, 0]]) {
        path([p(ax, ay), p(bx, by)]);
        context.stroke();
      }
      context.beginPath();
      context.arc(cx, cy, 2.5 * s, 0, Math.PI * 2);
      context.fill();
      break;
    case 'ermutigt': // Pfeil nach oben mit Strich (Extra-Zug)
      path([p(0, -15), p(11, -3), p(4, -3), p(4, 13), p(-4, 13), p(-4, -3), p(-11, -3)], true);
      context.fill();
      break;
    case 'gesteuert': // Chip mit Fäden (Marionette)
      context.strokeRect(cx - 8 * s, cy - 3 * s, 16 * s, 14 * s);
      context.fillRect(cx - 4 * s, cy + 1 * s, 8 * s, 6 * s);
      for (const dx of [-6, 0, 6]) {
        path([p(dx, -3), p(dx, -15)]);
        context.stroke();
      }
      break;
    case 'geschuetzt': // Schild
      path([p(0, -15), p(12, -10), p(11, 3), p(0, 15), p(-11, 3), p(-12, -10)], true);
      context.stroke();
      path([p(0, -9), p(7, -6), p(6, 2), p(0, 9)], true);
      context.fill();
      break;
  }
  context.restore();
}

/** Atlas aller Statussymbole in STATUS_ORDER (für Phaser-Spritesheet). */
export function drawStatusSheet(size = STATUS_ICON): HTMLCanvasElement {
  const [element, context] = makeCanvas(size * STATUS_ORDER.length, size);
  STATUS_ORDER.forEach((id, index) => drawStatusIcon(context, id, index * size, 0, size));
  return element;
}

const iconUrls = new Map<StatusId, string>();

/** Statussymbol als data-URL für die DOM-Oberfläche (zwischengespeichert). */
export function statusIconUrl(id: StatusId): string {
  let url = iconUrls.get(id);
  if (!url) {
    const [element, context] = makeCanvas(STATUS_ICON, STATUS_ICON);
    drawStatusIcon(context, id, 0, 0);
    url = element.toDataURL('image/png');
    iconUrls.set(id, url);
  }
  return url;
}

/** Platzhalter-Arena aus dem Layout: Asphalt, Hindernisse, Deckung, Gefahrenfelder, Startzonen. */
export function drawArenaPlaceholder(arena: ArenaDef): HTMLCanvasElement {
  const [element, context] = makeCanvas(ARENA_W, ARENA_H);
  const tiles = parseLayout(arena);
  const ground = context.createLinearGradient(0, 0, ARENA_W, ARENA_H);
  ground.addColorStop(0, '#1a1430');
  ground.addColorStop(1, '#100b20');
  context.fillStyle = ground;
  context.fillRect(0, 0, ARENA_W, ARENA_H);
  // Bodenplatten mit leichter Variation (deterministisch)
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const shade = ((col * 7 + row * 13) % 5) * 3;
      context.fillStyle = `rgb(${28 + shade}, ${22 + shade}, ${46 + shade})`;
      context.fillRect(col * CELL + 4, row * CELL + 4, CELL - 8, CELL - 8);
    }
  }
  // Pfützen-Neon
  for (let i = 0; i < 6; i++) {
    const x = ((i * 389) % ARENA_W) + 60;
    const y = ((i * 251) % ARENA_H) + 50;
    const glow = context.createRadialGradient(x, y, 4, x, y, 90);
    glow.addColorStop(0, i % 2 ? 'rgba(255,63,164,0.18)' : 'rgba(62,242,255,0.16)');
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    context.fillStyle = glow;
    context.fillRect(x - 90, y - 90, 180, 180);
  }
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const x = col * CELL;
      const y = row * CELL;
      switch (tiles[row][col]) {
        case 'wall': box(context, x + 8, y + 8, CELL - 16, CELL - 16, 46, '#2b2440', '#433a63', NEON.violet); break;
        case 'full': box(context, x + 14, y + 10, CELL - 28, CELL - 20, 40, '#3a1d3a', '#5a2c56', NEON.pink); break;
        case 'half': box(context, x + 22, y + 46, CELL - 44, CELL - 62, 18, '#1f3340', '#2d4c5c', NEON.cyan); break;
        case 'hazard': {
          const glow = context.createRadialGradient(x + CELL / 2, y + CELL / 2, 6, x + CELL / 2, y + CELL / 2, CELL / 2);
          glow.addColorStop(0, 'rgba(255,150,60,0.85)');
          glow.addColorStop(1, 'rgba(255,60,40,0.1)');
          context.fillStyle = glow;
          context.fillRect(x + 6, y + 6, CELL - 12, CELL - 12);
          context.strokeStyle = 'rgba(255,225,74,0.7)';
          context.lineWidth = 6;
          for (let k = -CELL; k < CELL; k += 28) {
            context.beginPath();
            context.moveTo(x + Math.max(0, k), y + Math.max(0, -k));
            context.lineTo(x + Math.min(CELL, k + CELL), y + Math.min(CELL, CELL - k));
            context.stroke();
          }
          break;
        }
        case 'start-party':
          context.fillStyle = 'rgba(62,242,255,0.10)';
          context.fillRect(x + 4, y + 4, CELL - 8, CELL - 8);
          break;
        case 'start-enemy':
          context.fillStyle = 'rgba(255,63,164,0.10)';
          context.fillRect(x + 4, y + 4, CELL - 8, CELL - 8);
          break;
        default: break;
      }
    }
  }
  context.fillStyle = 'rgba(11, 7, 22, 0.7)';
  context.fillRect(12, ARENA_H - 52, 560, 40);
  context.font = '600 24px "Chakra Petch", sans-serif';
  context.fillStyle = NEON.cyan;
  context.textBaseline = 'middle';
  context.fillText(`${arena.name} · Platzhalter-Arena`, 24, ARENA_H - 32);
  return element;
}

/** Kiste/Mauerblock in Schrägaufsicht mit Neonkante. */
function box(context: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, depth: number, side: string, top: string, edge: string) {
  context.fillStyle = 'rgba(0,0,0,0.45)';
  context.fillRect(x + 6, y + 10, w, h);
  context.fillStyle = side;
  context.fillRect(x, y + h - depth, w, depth);
  context.fillStyle = top;
  context.fillRect(x, y, w, h - depth);
  context.strokeStyle = edge;
  context.lineWidth = 3;
  context.strokeRect(x + 1.5, y + 1.5, w - 3, h - 3);
  context.globalAlpha = 0.35;
  context.beginPath();
  context.moveTo(x, y + h - depth);
  context.lineTo(x + w, y + h - depth);
  context.stroke();
  context.globalAlpha = 1;
}
