// akt-graffiti: Wand der Freiheit an der Flutmauer, nachts. Motiv wählen, Schablone aussprühen, Dose schütteln,
// nicht zu lange auf einer Stelle bleiben (Tropfnasen), und bei Kessels Taschenlampe die Finger stillhalten.
// Ausstrahlung: Sina bewertet wohlwollender (Stil-Bonus). Stufe: strengere Wertung, ab 2 Streife, ab 4 kostet Erwischtwerden alles.
import { h } from '../dom/dom';
import { choose, ending, meter, relPoint, speaker } from './kit';
import type { MinigameDef } from './types';
import { byLevel, clamp, gameButton, isDown, isLeft, isRight, isUp, pick } from './util';

const COLS = 24, ROWS = 12;
const MOTIFS: { name: string; rows: string[] }[] = [
  { name: 'Schrottkrone', rows: [
    '........................',
    '...#.......##.......#...',
    '...##.....####.....##...',
    '...###...######...###...',
    '...####.########.####...',
    '...##################...',
    '...##################...',
    '...##..##..##..##..##...',
    '...##################...',
    '...##################...',
    '........................',
    '........................'] },
  { name: 'Faust der Unterstadt', rows: [
    '........................',
    '.......##.##.##.##......',
    '......############......',
    '......##############....',
    '......###############...',
    '.....################...',
    '.....###############....',
    '......#############.....',
    '.......###########......',
    '........#########.......',
    '........#########.......',
    '........#########.......'] },
  { name: 'Die Welle', rows: [
    '........................',
    '..........######........',
    '........###....###......',
    '.......##.......##......',
    '......##...###...##.....',
    '.....##...##.##..##.....',
    '....##....##....##......',
    '...##......#####........',
    '..##...............###..',
    '.##....####.....#####...',
    '###...##..###..##..##...',
    '########################'] },
];
const COLORS = ['#ff4fd8', '#3ef2ff', '#ffe14a', '#6dffb0'];

export const graffiti: MinigameDef = {
  title: 'Wand der Freiheit',
  blurb: 'Sina Spray reicht dir eine Dose und guckt, als würde sie gleich deine Seele benoten. „Schablone ist da. Füll sie. Keine Tropfnasen. Und wenn die Kessel mit der Lampe kommt: Finger weg vom Knopf.“',
  controls: ['Maus/Finger gedrückt ziehen: sprühen', 'Tastatur: Pfeile/WASD bewegen, Leertaste halten: sprühen', 'R oder Knopf: Dose schütteln (Druck auffüllen), C: Farbe wechseln', 'Taschenlampe (Kessel): sofort loslassen'],
  bonuses(ctx) {
    return [`Ausstrahlung ${ctx.attr('ausstrahlung')}: Sina gibt +${Math.round(ctx.edge('ausstrahlung') * 12)} Stilpunkte`];
  },
  async run(host, ctx) {
    const level = ctx.level;
    const need = byLevel(level, [55, 62, 68, 74, 80]);
    const seconds = byLevel(level, [55, 55, 55, 60, 60]);
    const style = Math.round(ctx.edge('ausstrahlung') * 12);
    const patrol = level >= 2;
    const harsh = level >= 4;

    // Motivwahl
    const pickRow = h('div', { class: 'gf-pick' });
    host.stage.append(h('div', { class: 'gf-choose' }, h('p', null, 'Was kommt an die Wand?'), pickRow));
    const motif = MOTIFS[await choose(host, pickRow, MOTIFS.map((m) => m.name))];
    host.stage.textContent = '';

    const wall = h('div', { class: 'gf-wall' });
    const grid = h('div', { class: 'gf-grid' });
    grid.style.gridTemplateColumns = `repeat(${COLS}, 1fr)`;
    const nozzle = h('div', { class: 'gf-nozzle' });
    const light = h('div', { class: 'gf-light' });
    const sina = speaker('gf-sina', 'Sina');
    const pressure = meter('gf-pressure', 'Druck');
    const shake = gameButton('Schütteln [R]', () => doShake(), 'gf-shake');
    grid.append(nozzle);
    wall.append(grid, light, sina.el);
    host.stage.append(h('div', { class: 'gf-wrap' }, wall), h('div', { class: 'mg-toolbar' }, pressure.el, shake));

    const target: boolean[] = [];
    const painted: boolean[] = [];
    const cells: HTMLElement[] = [];
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      const t = motif.rows[r][c] === '#';
      target.push(t); painted.push(false);
      const cell = h('div', { class: `gf-cell${t ? ' stencil' : ''}` });
      cells.push(cell);
      grid.append(cell);
    }
    const targetCount = target.filter(Boolean).length;
    const end = ending();
    let nx = COLS / 2, ny = ROWS / 2;
    let spraying = false, pointerSpray = false, keySpray = false;
    const keys = { l: false, r: false, u: false, d: false };
    let press = 1, shaking = 0;
    let mess = 0, drips = 0, caught = 0;
    let stillCell = -1, stillTime = 0;
    let patrolTimer = 9 + Math.random() * 5, patrolPhase: 'off' | 'warn' | 'sweep' = 'off', patrolT = 0;
    let color = 0;

    const doShake = () => {
      if (end.over || shaking > 0) return;
      shaking = 0.7;
      ctx.sfx('switch');
      shake.classList.add('busy');
    };
    const paint = (cx: number, cy: number) => {
      const spots: [number, number][] = [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]];
      for (const [dx, dy] of spots) {
        const x = Math.floor(cx) + dx, y = Math.floor(cy) + dy;
        if (x < 0 || y < 0 || x >= COLS || y >= ROWS) continue;
        const i = y * COLS + x;
        if (painted[i]) continue;
        painted[i] = true;
        cells[i].style.background = COLORS[(color + (x + y) % 2) % COLORS.length];
        cells[i].classList.add('paint');
        if (!target[i]) mess++;
      }
    };
    const toCell = (event: PointerEvent) => { const p = relPoint(event, grid); nx = clamp((p.x / 100) * COLS, 0, COLS - 0.01); ny = clamp((p.y / 100) * ROWS, 0, ROWS - 0.01); };
    wall.addEventListener('pointerdown', (event) => { event.preventDefault(); toCell(event); pointerSpray = true; });
    wall.addEventListener('pointermove', (event) => { if (event.pointerType === 'mouse' || event.buttons) toCell(event); });
    const stopPointer = () => { pointerSpray = false; };
    wall.addEventListener('pointerup', stopPointer);
    wall.addEventListener('pointerleave', stopPointer);
    wall.addEventListener('pointercancel', stopPointer);
    host.onKey((event, down) => {
      if (isLeft(event.code)) keys.l = down;
      else if (isRight(event.code)) keys.r = down;
      else if (isUp(event.code)) keys.u = down;
      else if (isDown(event.code)) keys.d = down;
      else if (event.code === 'Space' || event.code === 'Enter' || event.code === 'KeyE') keySpray = down;
      else if (event.code === 'KeyR' && down) doShake();
      else if (event.code === 'KeyC' && down) color = (color + 1) % COLORS.length;
    });
    sina.say(pick(['Langsam ist schnell. Schnell ist Matsch.', 'Die Wand verzeiht nix. Ich auch nicht.']));

    const rating = () => {
      const covered = target.reduce((n, t, i) => n + (t && painted[i] ? 1 : 0), 0) / targetCount;
      return Math.round(clamp(covered * 100 - mess * 1.2 - drips * 4 - caught * 12 + style, 0, 100));
    };

    host.frame((dt) => {
      if (end.over) return false;
      const speed = 12 * dt;
      nx = clamp(nx + ((keys.r ? 1 : 0) - (keys.l ? 1 : 0)) * speed, 0, COLS - 0.01);
      ny = clamp(ny + ((keys.d ? 1 : 0) - (keys.u ? 1 : 0)) * speed, 0, ROWS - 0.01);
      nozzle.style.left = `${(nx / COLS) * 100}%`;
      nozzle.style.top = `${(ny / ROWS) * 100}%`;
      if (shaking > 0) { shaking -= dt; if (shaking <= 0) { press = 1; shake.classList.remove('busy'); } }
      spraying = (pointerSpray || keySpray) && press > 0 && shaking <= 0;
      nozzle.classList.toggle('on', spraying);
      if (spraying) {
        press = Math.max(0, press - dt * 0.13);
        paint(nx, ny);
        const cell = Math.floor(ny) * COLS + Math.floor(nx);
        if (cell === stillCell) {
          stillTime += dt;
          if (stillTime > 0.75) {
            drips++; stillTime = 0;
            cells[cell].classList.add('drip');
            host.pop('Tropfnase!', 'bad', (nx / COLS) * 100, (ny / ROWS) * 100);
            ctx.sfx('fail');
            if (drips === 2) sina.say('Das tropft wie ’ne Nase im Winter. Beweg dich!');
          }
        } else { stillCell = cell; stillTime = 0; }
        if (press <= 0) host.pop('Dose leer – schütteln!', 'info', 50, 10);
      }
      pressure.set(press);
      // Streife
      if (patrol) {
        if (patrolPhase === 'off') {
          patrolTimer -= dt;
          if (patrolTimer <= 0) { patrolPhase = 'warn'; patrolT = 1.8; host.setInfo('Schritte! Kessel kommt …'); ctx.sfx('alarm'); }
        } else if (patrolPhase === 'warn') {
          patrolT -= dt;
          if (patrolT <= 0) { patrolPhase = 'sweep'; patrolT = 2.4; light.classList.add('on'); }
        } else {
          patrolT -= dt;
          light.style.left = `${(1 - patrolT / 2.4) * 120 - 10}%`;
          if (spraying) {
            caught++;
            patrolPhase = 'off'; patrolTimer = 10 + Math.random() * 5; light.classList.remove('on');
            host.pop('ERWISCHT!', 'bad', 50, 40);
            host.setInfo('');
            sina.say(harsh ? 'Lauf! LAUF!' : 'Kessel hat dich gesehen. Die Wand merkt sich das.');
            ctx.sfx('alarm');
            if (harsh && caught >= 2) { end.finish(false); return false; }
          } else if (patrolT <= 0) {
            patrolPhase = 'off'; patrolTimer = 9 + Math.random() * 5; light.classList.remove('on'); host.setInfo('');
          }
        }
      }
      host.setScore(`Sina-Wertung ${rating()}/${need}`);
      return true;
    });

    const clock = host.countdown(seconds);
    const result = await Promise.race([end.done, clock.done.then(() => null)]);
    const score = rating();
    const won = result !== false && score >= need;
    end.finish(won);
    host.summary(`${motif.name}: Wertung ${score} (nötig ${need}) · Kleckse ${mess} · Tropfnasen ${drips}${caught ? ` · erwischt ${caught}×` : ''}${style ? ` · Stilbonus +${style}` : ''}`);
    host.summary(won ? pick(['Sina tritt drei Schritte zurück und nickt. „Die bleibt. Die sieht morgen die ganze Stadt.“', 'Sina: „Hässlich-schön. Wie die Unterstadt. Genau richtig.“']) : 'Sina sprüht wortlos ein großes Fragezeichen daneben.');
    return won;
  },
};
