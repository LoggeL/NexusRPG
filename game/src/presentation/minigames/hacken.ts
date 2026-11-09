// akt-hacken: Leitungs-Hack. Kacheln drehen, bis der Datenstrom von der Quelle (links) zum Zugang (rechts) fließt.
// Technik: mehr Zeit; `arme-datenbuchse` und Technik 7+: Auto-Züge, die eine falsche Leitung richtig drehen.
// Stufe 4+: gesperrte Firewall-Kacheln, Stufe 5: ICE dreht ab und zu eine Kachel zurück.
import { h } from '../dom/dom';
import type { MinigameDef } from './types';
import { byLevel, gameButton, isAction, isDown, isLeft, isRight, isUp, pick, randInt, shuffle } from './util';

export const N = 1, E = 2, S = 4, W = 8;
const DIRS = [
  { bit: N, dx: 0, dy: -1, opp: S },
  { bit: E, dx: 1, dy: 0, opp: W },
  { bit: S, dx: 0, dy: 1, opp: N },
  { bit: W, dx: -1, dy: 0, opp: E },
] as const;

/** Maske im Uhrzeigersinn drehen. */
export function rotateMask(mask: number, turns = 1): number {
  let result = mask;
  for (let i = 0; i < ((turns % 4) + 4) % 4; i++) result = ((result << 1) | (result >> 3)) & 15;
  return result;
}

export interface HackBoard {
  w: number;
  h: number;
  /** Form in Grundstellung (vor dem Drehen). */
  shape: number[];
  /** Vierteldrehungen je Kachel (wächst nur, für flüssige Animation). */
  turns: number[];
  locked: boolean[];
  path: number[];
  entry: number;
  exit: number;
}

export const maskAt = (board: HackBoard, index: number) => rotateMask(board.shape[index], board.turns[index]);

/** Selbstvermeidender Zufallsweg von links (Zeile entry) nach rechts (Zeile exit). */
function randomPath(w: number, hgt: number, entry: number, exit: number): number[] | null {
  const seen = new Set<number>();
  const path: number[] = [];
  let budget = 4000;
  const limit = Math.floor(w * hgt * 0.75);
  const dfs = (x: number, y: number): boolean => {
    if (--budget < 0) return false;
    const index = y * w + x;
    seen.add(index);
    path.push(index);
    if (x === w - 1 && y === exit) return true;
    if (path.length < limit) {
      // Leicht nach rechts gezogen, aber mit Umwegen.
      const order = shuffle([...DIRS]);
      if (Math.random() < 0.5) order.sort((a, b) => b.dx - a.dx);
      for (const dir of order) {
        const nx = x + dir.dx, ny = y + dir.dy;
        if (nx < 0 || ny < 0 || nx >= w || ny >= hgt || seen.has(ny * w + nx)) continue;
        if (dfs(nx, ny)) return true;
      }
    }
    path.pop();
    seen.delete(index);
    return false;
  };
  return dfs(0, entry) ? path : null;
}

export function generateBoard(w: number, hgt: number, lockedShare = 0): HackBoard {
  for (let attempt = 0; attempt < 40; attempt++) {
    const entry = randInt(0, hgt - 1);
    const exit = randInt(0, hgt - 1);
    const path = randomPath(w, hgt, entry, exit);
    if (!path || path.length < w + 1) continue;
    const shape = new Array<number>(w * hgt).fill(0);
    path.forEach((index, i) => {
      const x = index % w, y = Math.floor(index / w);
      const link = (other: number | undefined, fallback: number) => {
        if (other === undefined) return fallback;
        const ox = other % w, oy = Math.floor(other / w);
        return DIRS.find((dir) => dir.dx === ox - x && dir.dy === oy - y)!.bit;
      };
      shape[index] = link(path[i - 1], W) | link(path[i + 1], E);
    });
    const decoys = [N | S, N | S, N | E, N | E, N | E | S, N | E | S, N | E | S | W];
    for (let i = 0; i < shape.length; i++) if (!shape[i]) shape[i] = pick(decoys);
    const locked = shape.map(() => Math.random() < lockedShare);
    const turns = shape.map((_, i) => (locked[i] ? 0 : randInt(0, 3)));
    const board: HackBoard = { w, h: hgt, shape, turns, locked, path, entry, exit };
    // Nie schon gelöst starten.
    if (powered(board).solved) continue;
    return board;
  }
  // Notfall: gerade Linie.
  const shape = new Array<number>(w * hgt).fill(N | S);
  const path = Array.from({ length: w }, (_, x) => x);
  for (const index of path) shape[index] = E | W;
  return { w, h: hgt, shape, turns: shape.map(() => 1), locked: shape.map(() => false), path, entry: 0, exit: 0 };
}

/** Versorgte Kacheln ab der Quelle; gelöst, wenn der Zugang (rechts, Zeile exit) erreicht ist. */
export function powered(board: HackBoard): { cells: Set<number>; solved: boolean } {
  const cells = new Set<number>();
  const start = board.entry * board.w;
  if (!(maskAt(board, start) & W)) return { cells, solved: false };
  const queue = [start];
  cells.add(start);
  while (queue.length) {
    const index = queue.shift()!;
    const x = index % board.w, y = Math.floor(index / board.w);
    const mask = maskAt(board, index);
    for (const dir of DIRS) {
      if (!(mask & dir.bit)) continue;
      const nx = x + dir.dx, ny = y + dir.dy;
      if (nx < 0 || ny < 0 || nx >= board.w || ny >= board.h) continue;
      const next = ny * board.w + nx;
      if (cells.has(next) || !(maskAt(board, next) & dir.opp)) continue;
      cells.add(next);
      queue.push(next);
    }
  }
  const exitIndex = board.exit * board.w + board.w - 1;
  return { cells, solved: cells.has(exitIndex) && !!(maskAt(board, exitIndex) & E) };
}

/** Kachel des Lösungswegs, die noch falsch steht (für Auto-Züge). */
function wrongPathCell(board: HackBoard): number | null {
  const wrong = board.path.filter((index) => maskAt(board, index) !== board.shape[index] && !board.locked[index]);
  return wrong.length ? pick(wrong) : null;
}

function pipeSvg(mask: number): SVGSVGElement {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', '0 0 100 100');
  svg.classList.add('hk-pipe');
  const ends: Record<number, [number, number]> = { [N]: [50, 0], [E]: [100, 50], [S]: [50, 100], [W]: [0, 50] };
  for (const bit of [N, E, S, W]) {
    if (!(mask & bit)) continue;
    const [x, y] = ends[bit];
    const line = document.createElementNS(ns, 'line');
    line.setAttribute('x1', '50'); line.setAttribute('y1', '50');
    line.setAttribute('x2', String(x)); line.setAttribute('y2', String(y));
    svg.append(line);
  }
  const node = document.createElementNS(ns, 'circle');
  node.setAttribute('cx', '50'); node.setAttribute('cy', '50'); node.setAttribute('r', '11');
  svg.append(node);
  return svg;
}

export const hacken: MinigameDef = {
  title: 'Leitungs-Hack',
  blurb: 'Das Terminal zickt. Dreh die Leitungen, bis der Datenstrom von deiner Buchse links bis zum Zugang rechts durchrauscht – bevor die Sicherung dich rauskickt.',
  controls: ['Kachel antippen/klicken: drehen (Rechtsklick: zurück)', 'Pfeile/WASD wählen, Leertaste dreht, Q dreht zurück', 'H: Auto-Zug (falls vorhanden)'],
  bonuses(ctx) {
    const lines = [`Technik ${ctx.attr('technik')}: +${Math.round(ctx.edge('technik') * 25)} s`];
    if (ctx.has({ cyberware: 'arme-datenbuchse' })) lines.push('Datenbuchse: +1 Auto-Zug');
    if (ctx.attr('technik') >= 7) lines.push('Technik 7+: +1 Auto-Zug (Analyse)');
    return lines;
  },
  async run(host, ctx) {
    const level = ctx.level;
    const [w, hgt] = byLevel(level, [[4, 4], [5, 4], [5, 5], [6, 5], [7, 5]] as const);
    const board = generateBoard(w, hgt, level >= 4 ? 0.12 : 0);
    let autos = (ctx.has({ cyberware: 'arme-datenbuchse' }) ? 1 : 0) + (ctx.attr('technik') >= 7 ? 1 : 0);
    let moves = 0;
    let cursor = board.entry * w;
    const seconds = byLevel(level, [70, 62, 56, 50, 46]) + Math.round(ctx.edge('technik') * 25);

    const tiles: HTMLElement[] = [];
    const grid = h('div', { class: 'hk-grid' });
    grid.style.gridTemplateColumns = `repeat(${w}, 1fr)`;
    grid.style.aspectRatio = `${w} / ${hgt}`;
    const autoButton = gameButton('', () => useAuto(), 'hk-auto');
    const source = h('div', { class: 'hk-port src' }, h('span', null, 'DU'));
    const target = h('div', { class: 'hk-port dst' }, h('span', null, '⌁'));
    source.style.top = `${((board.entry + 0.5) / hgt) * 100}%`;
    target.style.top = `${((board.exit + 0.5) / hgt) * 100}%`;
    const frame = h('div', { class: 'hk-frame' }, source, grid, target);
    host.stage.append(h('div', { class: 'hk-wrap' }, frame), h('div', { class: 'mg-toolbar' }, autoButton));

    const render = () => {
      const { cells, solved } = powered(board);
      tiles.forEach((tile, i) => {
        tile.classList.toggle('on', cells.has(i));
        tile.classList.toggle('cursor', i === cursor && !ctx.touch);
        (tile.firstElementChild as HTMLElement).style.transform = `rotate(${board.turns[i] * 90}deg)`;
      });
      target.classList.toggle('on', solved);
      autoButton.textContent = `Auto-Zug [H] × ${autos}`;
      autoButton.disabled = autos <= 0;
      autoButton.hidden = autos <= 0 && !ctx.has({ cyberware: 'arme-datenbuchse' }) && ctx.attr('technik') < 7;
      host.setScore(`Züge ${moves}`);
      return solved;
    };

    let resolveSolved!: () => void;
    const solvedPromise = new Promise<void>((resolve) => { resolveSolved = resolve; });
    const turn = (index: number, delta: number) => {
      if (board.locked[index]) { ctx.sfx('fail'); tiles[index].classList.remove('deny'); void tiles[index].offsetWidth; tiles[index].classList.add('deny'); return; }
      board.turns[index] += delta;
      moves++;
      ctx.sfx('switch');
      if (render()) resolveSolved();
    };
    const useAuto = () => {
      if (autos <= 0) return;
      const index = wrongPathCell(board);
      if (index === null) return;
      autos--;
      const shape = board.shape[index];
      // Kleinste Drehung, die die Lösungsstellung herstellt.
      let delta = 1;
      while (delta < 4 && rotateMask(shape, board.turns[index] + delta) !== shape) delta++;
      board.turns[index] += delta;
      ctx.sfx('hack');
      host.pop('Datenbuchse greift ein', 'info', 50, 10);
      if (render()) resolveSolved();
    };

    for (let i = 0; i < w * hgt; i++) {
      const tile = h('div', { class: `hk-tile${board.locked[i] ? ' locked' : ''}`, role: 'button', 'aria-label': `Kachel ${i + 1}` });
      tile.append(pipeSvg(board.shape[i]));
      tile.addEventListener('pointerdown', (event) => {
        event.preventDefault();
        cursor = i;
        turn(i, event.button === 2 ? 3 : 1);
      });
      tiles.push(tile);
      grid.append(tile);
    }

    host.onKey((event, down) => {
      if (!down || event.repeat) return;
      const x = cursor % w, y = Math.floor(cursor / w);
      if (isLeft(event.code)) cursor = y * w + Math.max(0, x - 1);
      else if (isRight(event.code)) cursor = y * w + Math.min(w - 1, x + 1);
      else if (isUp(event.code)) cursor = Math.max(0, y - 1) * w + x;
      else if (isDown(event.code)) cursor = Math.min(hgt - 1, y + 1) * w + x;
      else if (isAction(event.code)) { turn(cursor, 1); return; }
      else if (event.code === 'KeyQ') { turn(cursor, 3); return; }
      else if (event.code === 'KeyH') { useAuto(); return; }
      else return;
      render();
    });

    // ICE (Stufe 5): dreht alle 11 s eine unversorgte, freie Kachel zurück.
    if (level >= 5) {
      host.setInfo('ICE aktiv');
      let next = 11;
      host.frame((dt) => {
        next -= dt;
        if (next > 0) return true;
        next = 11;
        const { cells } = powered(board);
        const candidates = board.path.filter((i) => !cells.has(i) && !board.locked[i]);
        if (candidates.length) {
          const index = pick(candidates);
          board.turns[index] += 1;
          tiles[index].classList.add('ice');
          setTimeout(() => tiles[index].classList.remove('ice'), 600);
          ctx.sfx('alarm');
          host.pop('ICE!', 'bad', 50, 10);
          render();
        }
        return true;
      });
    } else if (level >= 4) host.setInfo('Firewall-Kacheln gesperrt');

    render();
    const clock = host.countdown(seconds);
    const result = await Promise.race([solvedPromise.then(() => true), clock.done.then(() => false)]);
    clock.stop();
    if (result) {
      host.summary(`Zugang offen – ${moves} Züge, ${Math.ceil(clock.left())} s übrig.`);
      host.summary(pick(['Das Terminal schnurrt wie ein bestochener Bulle.', 'Sauber. Nicht mal das Log hat’s gemerkt.', 'Rein wie Butter, raus wie ein Geist.']));
    } else {
      host.summary('Sicherung ausgelöst. Das Terminal piept dich beleidigt an.');
    }
    return result;
  },
};
