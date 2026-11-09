// akt-countdown: main-2-countdown „Zehn, neun, acht …“ (world.md §5.3). Nexus startet die Selbstzerstörung des Chips auf
// Dantes Tisch. Die Leitungen sind verknotet; die richtige (die zum ZÜNDER) durchknipsen, bevor die Zeit abläuft.
// 10 s Grundzeit, `dante_notfall` +3 s (Dante hat das Notfall-Werkzeug griffbereit), Technik bis +2 s; Technik 5+: die gewählte
// Leitung leuchtet über die ganze Länge. Falsch geknipst: Funken und Zeitabzug, auf hohen Stufen sofort vorbei.
import './minigames3.css';
import { h } from '../dom/dom';
import { ending, speaker } from './kit';
import { s } from './sicht';
import type { MinigameDef } from './types';
import { byLevel, isAction, isDown, isLeft, isRight, isUp, digitOf, pick, shuffle } from './util';

const COLORS = ['#ff4f6a', '#3ef2ff', '#ffe14a', '#6dffb0', '#ff4fd8', '#b07aff', '#ff9a3a'];
const DECOYS = ['MASSE', 'TAKT', 'KÜHLUNG', 'NEXUS-KERN', 'LÜFTER', 'KEKSZÄHLER', 'BLADES EGO', 'SPEICHER'];

export const countdown: MinigameDef = {
  title: 'Zehn, neun, acht …',
  blurb: 'Der Chip auf Dantes Tisch piept. Nexus, sehr höflich: „Selbstzerstörung eingeleitet.“ Ein Knäuel Leitungen, eine davon führt zum Zünder. Dante drückt dir den Seitenschneider in die Hand: „Die richtige. Nicht fluchen!“',
  controls: ['Leitung antippen/anklicken: durchknipsen', 'Tastatur: ↑/↓ oder Ziffer wählen, Leertaste knipsen', 'Folge der Leitung, die rechts am ZÜNDER endet'],
  bonuses(ctx) {
    const lines: string[] = [];
    if (ctx.has({ flag: 'dante_notfall' })) lines.push('Dantes Notfallkoffer: +3 Sekunden');
    const t = ctx.attr('technik');
    lines.push(`Technik ${t}: +${(ctx.edge('technik') * 2).toFixed(1)} s${t >= 5 ? ', gewählte Leitung leuchtet ganz' : ''}`);
    return lines;
  },
  async run(host, ctx) {
    const level = ctx.level;
    const n = byLevel(level, [3, 4, 5, 6, 7]);
    const strikesAllowed = byLevel(level, [2, 1, 1, 0, 0]);
    const tracer = ctx.attr('technik') >= 5;
    const notfall = ctx.has({ flag: 'dante_notfall' });
    const seconds = 10 + (notfall ? 3 : 0) + ctx.edge('technik') * 2;

    // Leitungen: links Anschluss i, rechts Ziel perm[i]
    const perm = shuffle([...Array(n).keys()]);
    const labels = shuffle([...DECOYS]).slice(0, n);
    const fuseRight = Math.floor(Math.random() * n);
    labels[fuseRight] = 'ZÜNDER';
    const colors = level >= 3 ? [...Array(n)].map(() => pick(COLORS.slice(0, 4))) : shuffle([...COLORS]).slice(0, n);
    const yL = (i: number) => 8 + (i + 0.5) * (44 / n);

    const svg = s('svg', { class: 'cd-board', viewBox: '0 0 100 60', preserveAspectRatio: 'xMidYMid meet' });
    svg.append(s('rect', { x: 0, y: 0, width: 100, height: 60, class: 'cd-pcb' }));
    svg.append(s('rect', { x: 2, y: 6, width: 8, height: 48, class: 'cd-chip' }), s('text', { x: 6, y: 4.5, class: 'cd-chip-label' }, 'NEXUS'));
    const wires: { path: SVGPathElement; hit: SVGPathElement; knob: SVGCircleElement; cut: boolean }[] = [];
    for (let i = 0; i < n; i++) {
      const y1 = yL(i), y2 = yL(perm[i]);
      const c1 = 8 + Math.random() * 44, c2 = 8 + Math.random() * 44;
      const d = `M 12 ${y1} C ${30 + Math.random() * 10} ${c1}, ${60 + Math.random() * 10} ${c2}, 86 ${y2}`;
      const path = s('path', { d, class: 'cd-wire', stroke: colors[i] });
      const hit = s('path', { d, class: 'cd-wire-hit' });
      const knob = s('circle', { cx: 12, cy: y1, r: 1.8, class: 'cd-knob', fill: colors[i] });
      svg.append(path);
      wires.push({ path, hit, knob, cut: false });
    }
    for (let i = 0; i < n; i++) {
      svg.append(wires[i].hit, wires[i].knob, s('text', { x: 8.6, y: yL(i) + 1.1, class: 'cd-num' }, String(i + 1)));
      const y = yL(i);
      svg.append(s('rect', { x: 86, y: y - 2.6, width: 13, height: 5.2, class: `cd-term${labels[i] === 'ZÜNDER' ? ' fuse' : ''}` }),
        s('text', { x: 92.5, y: y + 1, class: 'cd-term-label' }, labels[i]));
    }
    const big = h('div', { class: 'cd-big' }, '10');
    const nexus = speaker('cd-nexus', 'Nexus');
    const dante = speaker('cd-dante', 'Dante');
    host.stage.append(h('div', { class: 'cd-wrap' }, svg, big, nexus.el, dante.el));

    const end = ending();
    let sel = 0, strikes = 0, penalty = 0;
    const correct = perm.indexOf(fuseRight);
    const render = () => wires.forEach((w, i) => {
      w.knob.classList.toggle('sel', i === sel);
      w.path.classList.toggle('trace', tracer && i === sel && !w.cut);
      w.path.classList.toggle('dim', tracer && i !== sel && !w.cut);
    });
    const cutWire = (i: number) => {
      if (end.over || wires[i].cut) return;
      wires[i].cut = true;
      wires[i].path.classList.add('cut');
      ctx.sfx('switch');
      if (i === correct) { host.pop('KLICK.', 'gold', 50, 40); end.finish(true); return; }
      strikes++;
      ctx.sfx('hurt');
      host.pop('Funken!', 'bad', 50, 40);
      svg.classList.remove('zap'); void svg.getBoundingClientRect(); svg.classList.add('zap');
      dante.say(pick(['Nicht die! NICHT DIE!', 'Das war die Kekszähler-Leitung, du Vollpfosten!', 'Nicht fluchen. Nicht fluchen. SCHEISSE!']));
      if (strikes > strikesAllowed) end.finish(false);
      else penalty += 2;
      render();
    };
    wires.forEach((w, i) => {
      const press = (e: Event) => { e.preventDefault(); sel = i; cutWire(i); };
      w.hit.addEventListener('pointerdown', press);
      w.knob.addEventListener('pointerdown', press);
      w.hit.addEventListener('pointerenter', () => { sel = i; render(); });
    });
    host.onKey((event, down) => {
      if (!down || event.repeat) return;
      const d = digitOf(event.code);
      if (d && d <= n) { sel = d - 1; render(); cutWire(d - 1); return; }
      if (isUp(event.code) || isLeft(event.code)) { sel = (sel + n - 1) % n; render(); }
      else if (isDown(event.code) || isRight(event.code)) { sel = (sel + 1) % n; render(); }
      else if (isAction(event.code)) cutWire(sel);
    });
    render();
    if (notfall) dante.say('Notfallkoffer ist offen. Drei Sekunden extra. Mehr hab ich nicht, ich bin kein Gott, ich bin Elektriker.');
    const start = performance.now();
    let lastSec = -1;
    host.frame((_, now) => {
      if (end.over) return false;
      const left = seconds - penalty - (now - start) / 1000;
      const sec = Math.max(0, Math.ceil(left));
      if (sec !== lastSec) {
        lastSec = sec;
        big.textContent = String(sec);
        big.classList.remove('tick'); void big.offsetWidth; big.classList.add('tick');
        const words = ['Null', 'Eins', 'Zwei', 'Drei', 'Vier', 'Fünf', 'Sechs', 'Sieben', 'Acht', 'Neun', 'Zehn', 'Elf', 'Zwölf', 'Dreizehn'];
        if (sec <= 10 && sec > 0) { nexus.say(`${words[sec]}.${sec === 5 ? ' Es war mir eine Freude, Master.' : sec === 3 ? ' Bitte entfernen Sie sich vom Tisch.' : ''}`); ctx.sfx('switch'); }
      }
      host.setScore(`${n} Leitungen`);
      host.setInfo(strikes ? `Fehlschnitte ${strikes}` : '');
      if (left <= 0) { end.finish(false); return false; }
      return true;
    });

    const won = await end.done;
    const left = Math.max(0, seconds - penalty - (performance.now() - start) / 1000);
    big.textContent = won ? '✂' : '0';
    host.summary(won ? `Durchgeknipst bei ${left.toFixed(1)} s. Nexus: „Selbstzerstörung … abgebrochen. Wie unhöflich.“` : 'Kein Klick. Nur ein immer schnelleres Piepen.');
    host.summary(won
      ? 'Dante wischt sich die Stirn: „Genie und Wahnsinn. Und du. Ab heute bin ich wieder im Dienst.“'
      : 'Dante reißt den Chip vom Tisch und wirft ihn aus dem Fenster. Draußen fliegt eine Mülltonne, Konfetti-Funken regnen auf die Gasse.');
    return won;
  },
};
