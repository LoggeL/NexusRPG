// akt-pixelpalast: Spielhalle in den Glasarkaden. Drei Automaten zur Wahl: „Drohnenjagd“ (Treffer-Raster),
// „Neon-Schlange“ (Schlange), „Chipstapler“ (Stapeln). Reflexe: langsameres Tempo und länger sichtbare Ziele.
import { h } from '../dom/dom';
import { choose, ending } from './kit';
import type { MinigameContext, MinigameDef, MinigameHost } from './types';
import { byLevel, clamp, digitOf, gameButton, isAction, isDown, isLeft, isRight, isUp, pick, randInt } from './util';

export const pixelpalast: MinigameDef = {
  title: 'Pixelpalast',
  blurb: 'Blinkende Automaten, klebriger Teppich, ein Preisregal voller Plüsch, das niemand je gewonnen hat. Wirf eine Münze ein und zeig der Highscore-Liste, wer hier wohnt.',
  controls: ['Automat wählen: 1–3 oder antippen', 'Drohnenjagd: Drohnen antippen (Tasten 1–9 wie Ziffernblock)', 'Neon-Schlange: Pfeile/WASD, Wischen oder Pfeilknöpfe', 'Chipstapler: Leertaste/Tippen zum Absetzen'],
  bonuses(ctx) {
    return [`Reflexe ${ctx.attr('reflexe')}: Automaten laufen ${Math.round(ctx.edge('reflexe') * 30)} % gemütlicher`];
  },
  async run(host, ctx) {
    const menu = h('div', { class: 'pp-menu' });
    host.stage.append(h('div', { class: 'pp-hall' }, h('div', { class: 'pp-sign' }, 'PIXELPALAST'), menu));
    const labels = [
      h('span', { class: 'pp-cab' }, h('b', null, 'DROHNENJAGD'), h('small', null, 'Abschießen, bevor sie abhauen')),
      h('span', { class: 'pp-cab' }, h('b', null, 'NEON-SCHLANGE'), h('small', null, 'Fressen, wachsen, nicht beißen')),
      h('span', { class: 'pp-cab' }, h('b', null, 'CHIPSTAPLER'), h('small', null, 'Stapeln bis zur Decke')),
    ];
    const index = await choose(host, menu, labels, 'pp-choice');
    host.stage.textContent = '';
    ctx.sfx('coin');
    const won = index === 0 ? await drohnenjagd(host, ctx) : index === 1 ? await schlange(host, ctx) : await stapler(host, ctx);
    host.summary(won ? pick(['Die Kiste spuckt Preis-Tickets aus wie ein Junkie Ausreden.', 'Dein Kürzel steht jetzt auf der Highscore-Liste. Neben „ARSCH“ und „LOL“.']) : pick(['GAME OVER. Der Automat lacht in 8-Bit.', 'Die Kinder hinter dir haben das besser gemacht. Und die sind sieben.']));
    return won;
  },
};

async function drohnenjagd(host: MinigameHost, ctx: MinigameContext): Promise<boolean> {
  const level = ctx.level;
  const need = byLevel(level, [12, 15, 18, 21, 24]);
  const stay = byLevel(level, [1.3, 1.1, 0.95, 0.85, 0.75]) * (1 + ctx.edge('reflexe') * 0.3);
  const grid = h('div', { class: 'pp-screen pp-dj' });
  const holes = Array.from({ length: 9 }, (_, i) => {
    const hole = h('div', { class: 'pp-hole' }, h('span', { class: 'm2-key' }, String([7, 8, 9, 4, 5, 6, 1, 2, 3][i])));
    grid.append(hole);
    return hole;
  });
  host.stage.append(h('div', { class: 'pp-cabinet' }, h('div', { class: 'pp-title' }, 'DROHNENJAGD'), grid));
  const active: { kind: 'drohne' | 'quantum' | 'gold'; ttl: number }[] = holes.map(() => ({ kind: 'drohne', ttl: 0 }));
  let score = 0, misses = 0, spawn = 0.4;
  const end = ending();
  const whack = (i: number) => {
    if (end.over) return;
    const a = active[i];
    if (a.ttl <= 0) { misses++; return; }
    a.ttl = 0;
    holes[i].className = 'pp-hole boom';
    if (a.kind === 'quantum') { score = Math.max(0, score - 2); ctx.sfx('fail'); host.pop('Quantum-Logo! −2', 'bad', 50, 20); }
    else { score += a.kind === 'gold' ? 3 : 1; ctx.sfx(a.kind === 'gold' ? 'coin' : 'hit'); }
    host.setScore(`Abschüsse ${score}/${need}`);
    if (score >= need) end.finish(true);
  };
  holes.forEach((hole, i) => hole.addEventListener('pointerdown', (event) => { event.preventDefault(); whack(i); }));
  host.onKey((event, down) => {
    if (!down || event.repeat) return;
    const d = digitOf(event.code);
    if (d) whack([7, 8, 9, 4, 5, 6, 1, 2, 3].indexOf(d));
  });
  host.setScore(`Abschüsse 0/${need}`);
  host.frame((dt) => {
    if (end.over) return false;
    spawn -= dt;
    if (spawn <= 0) {
      spawn = stay * (0.45 + Math.random() * 0.35);
      const free = active.map((a, i) => i).filter((i) => active[i].ttl <= 0);
      if (free.length) {
        const i = pick(free);
        const roll = Math.random();
        active[i] = { kind: roll < 0.08 ? 'gold' : roll < 0.08 + level * 0.04 ? 'quantum' : 'drohne', ttl: stay };
        holes[i].className = `pp-hole up ${active[i].kind}`;
      }
    }
    active.forEach((a, i) => { if (a.ttl > 0) { a.ttl -= dt; if (a.ttl <= 0) holes[i].className = 'pp-hole'; } });
    return true;
  });
  const clock = host.countdown(35);
  const result = await Promise.race([end.done, clock.done.then(() => false)]);
  end.finish(result);
  clock.stop();
  host.summary(`Drohnenjagd: ${score} Punkte (nötig ${need}), ${misses} Luftlöcher.`);
  return result;
}

async function schlange(host: MinigameHost, ctx: MinigameContext): Promise<boolean> {
  const level = ctx.level;
  const W = 16, H = 10;
  const need = byLevel(level, [6, 8, 10, 12, 14]);
  const tick = byLevel(level, [0.2, 0.17, 0.15, 0.13, 0.11]) * (1 + ctx.edge('reflexe') * 0.3);
  const board = h('div', { class: 'pp-screen pp-snake' });
  board.style.gridTemplateColumns = `repeat(${W}, 1fr)`;
  const cells = Array.from({ length: W * H }, () => { const c = h('div', { class: 'pp-sc' }); board.append(c); return c; });
  const pad = h('div', { class: 'pp-pad' });
  host.stage.append(h('div', { class: 'pp-cabinet' }, h('div', { class: 'pp-title' }, 'NEON-SCHLANGE'), board), pad);
  let snake = [[5, 5], [4, 5], [3, 5]];
  let dir = [1, 0], next = [1, 0];
  let food = [10, 5];
  let eaten = 0, acc = 0;
  const end = ending();
  const turn = (dx: number, dy: number) => { if (dx === -dir[0] && dy === -dir[1]) return; next = [dx, dy]; };
  for (const [label, dx, dy] of [['▲', 0, -1], ['◀', -1, 0], ['▶', 1, 0], ['▼', 0, 1]] as const) pad.append(gameButton(label, () => turn(dx, dy), 'pp-arrow'));
  host.onKey((event, down) => {
    if (!down) return;
    if (isUp(event.code)) turn(0, -1);
    else if (isDown(event.code)) turn(0, 1);
    else if (isLeft(event.code)) turn(-1, 0);
    else if (isRight(event.code)) turn(1, 0);
  });
  let start: { x: number; y: number } | null = null;
  board.addEventListener('pointerdown', (event) => { event.preventDefault(); start = { x: event.clientX, y: event.clientY }; });
  board.addEventListener('pointerup', (event) => {
    if (!start) return;
    const dx = event.clientX - start.x, dy = event.clientY - start.y;
    start = null;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 18) return;
    if (Math.abs(dx) > Math.abs(dy)) turn(Math.sign(dx), 0); else turn(0, Math.sign(dy));
  });
  const placeFood = () => {
    do { food = [randInt(0, W - 1), randInt(0, H - 1)]; } while (snake.some(([x, y]) => x === food[0] && y === food[1]));
  };
  const draw = () => {
    cells.forEach((c) => { c.className = 'pp-sc'; });
    snake.forEach(([x, y], i) => { cells[y * W + x].className = `pp-sc ${i === 0 ? 'head' : 'body'}`; });
    cells[food[1] * W + food[0]].className = 'pp-sc food';
    host.setScore(`Futter ${eaten}/${need}`);
  };
  draw();
  host.frame((dt) => {
    if (end.over) return false;
    acc += dt;
    if (acc < tick * (1 - eaten * 0.015)) return true;
    acc = 0;
    dir = next;
    const head = [snake[0][0] + dir[0], snake[0][1] + dir[1]];
    if (head[0] < 0 || head[1] < 0 || head[0] >= W || head[1] >= H || snake.some(([x, y]) => x === head[0] && y === head[1])) {
      ctx.sfx('hurt');
      board.classList.add('dead');
      end.finish(false);
      return false;
    }
    snake = [head, ...snake];
    if (head[0] === food[0] && head[1] === food[1]) {
      eaten++;
      ctx.sfx('cookie');
      if (eaten >= need) { draw(); end.finish(true); return false; }
      placeFood();
    } else snake.pop();
    draw();
    return true;
  });
  const clock = host.countdown(byLevel(level, [50, 55, 60, 65, 70]));
  const result = await Promise.race([end.done, clock.done.then(() => false)]);
  end.finish(result);
  clock.stop();
  host.summary(`Neon-Schlange: ${eaten} von ${need} Futterpixeln.`);
  return result;
}

async function stapler(host: MinigameHost, ctx: MinigameContext): Promise<boolean> {
  const level = ctx.level;
  const W = 11;
  const rows = byLevel(level, [8, 9, 10, 11, 12]);
  const speed = byLevel(level, [6, 7, 8, 9.5, 11]) * (1 - ctx.edge('reflexe') * 0.25);
  const screen = h('div', { class: 'pp-screen pp-stack' });
  screen.style.gridTemplateColumns = `repeat(${W}, 1fr)`;
  screen.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
  const cells = Array.from({ length: W * rows }, () => { const c = h('div', { class: 'pp-sc' }); screen.append(c); return c; });
  const drop = gameButton('ABSETZEN', () => place(), 'mg-big');
  host.stage.append(h('div', { class: 'pp-cabinet' }, h('div', { class: 'pp-title' }, 'CHIPSTAPLER'), screen), h('div', { class: 'mg-toolbar' }, drop));
  const end = ending();
  let width = byLevel(level, [4, 4, 3, 3, 3]);
  let row = 0, pos = 0, dir = 1, acc = 0;
  let prev: [number, number] = [Math.floor((W - width) / 2), Math.floor((W - width) / 2) + width - 1];
  const settled: [number, number][] = [];
  const draw = () => {
    cells.forEach((c) => { c.className = 'pp-sc'; });
    settled.forEach(([a, b], r) => { for (let x = a; x <= b; x++) cells[(rows - 1 - r) * W + x].className = 'pp-sc chip'; });
    if (!end.over) for (let x = pos; x < pos + width; x++) if (x >= 0 && x < W) cells[(rows - 1 - row) * W + x].className = 'pp-sc live';
    host.setScore(`Höhe ${row}/${rows}`);
  };
  const place = () => {
    if (end.over) return;
    const a = pos, b = pos + width - 1;
    const lo = row === 0 ? a : Math.max(a, prev[0]);
    const hi = row === 0 ? b : Math.min(b, prev[1]);
    if (hi < lo) { ctx.sfx('fail'); end.finish(false); draw(); return; }
    const cut = width - (hi - lo + 1);
    if (cut > 0) host.pop(`−${cut}`, 'bad', 50, 20); else { host.pop('Perfekt!', 'gold', 50, 20); ctx.sfx('coin'); }
    width = hi - lo + 1;
    prev = [lo, hi];
    settled.push([lo, hi]);
    row++;
    ctx.sfx('step');
    if (row >= rows) { end.finish(true); draw(); return; }
    pos = dir > 0 ? 0 : W - width;
    draw();
  };
  host.onKey((event, down) => { if (down && !event.repeat && isAction(event.code)) place(); });
  screen.addEventListener('pointerdown', (event) => { event.preventDefault(); place(); });
  host.frame((dt) => {
    if (end.over) return false;
    acc += dt * speed * (1 + row * 0.06);
    while (acc >= 1) {
      acc -= 1;
      pos += dir;
      if (pos + width > W) { pos = W - width; dir = -1; pos += dir; }
      if (pos < 0) { pos = 0; dir = 1; pos += dir; }
      pos = clamp(pos, 0, W - width);
    }
    draw();
    return true;
  });
  const clock = host.countdown(60);
  const result = await Promise.race([end.done, clock.done.then(() => false)]);
  end.finish(result);
  clock.stop();
  host.summary(`Chipstapler: ${row} von ${rows} Reihen.`);
  return result;
}
