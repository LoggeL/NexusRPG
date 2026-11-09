// akt-sternegucken: Dachterrasse über der Neon-Gasse, klare Nacht, Vega am Fernrohr. Sternbilder der Unterstadt nachzeichnen:
// Stern antippen, dann den Nachbarstern – richtige Verbindungen leuchten. Die Vorlage blendet nach ein paar Sekunden aus.
// Kein Attribut (world.md §3.9). Stufe: mehr Täuschsterne, kürzere Vorlage, weniger Fehler erlaubt.
import { h } from '../dom/dom';
import { ending, speaker } from './kit';
import type { MinigameDef } from './types';
import { byLevel, isAction, isDown, isLeft, isRight, isUp, shuffle } from './util';

interface Figure { name: string; pts: [number, number][]; edges: [number, number][]; lore: string }
const FIGURES: Figure[] = [
  { name: 'Der Kran', pts: [[10, 95], [10, 10], [90, 10], [90, 35], [35, 10]], edges: [[0, 1], [1, 4], [4, 2], [2, 3]],
    lore: 'Der Kran. Die Hafenleute sagen, er hebt jede Nacht einen Toten in den Himmel. Ich sag, es ist ein Kran.' },
  { name: 'Die Ratte', pts: [[10, 60], [35, 40], [65, 45], [85, 65], [55, 75], [100, 90]], edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 1], [3, 5]],
    lore: 'Die Ratte. Kanalvolk-Sternbild. Sie zeigt nach Norden, sagen sie. Sie zeigt in Wahrheit auf Quantum.' },
  { name: 'Kabelbrand-Gitarre', pts: [[15, 85], [35, 60], [30, 95], [55, 75], [80, 25], [90, 10]], edges: [[0, 1], [1, 3], [3, 2], [2, 0], [3, 4], [4, 5]],
    lore: 'Die Gitarre. Seit dem letzten Kabelbrand-Konzert nennt man sie so. Aria guckt nie lange hin.' },
  { name: 'Das Auge', pts: [[10, 50], [50, 20], [90, 50], [50, 80], [50, 50]], edges: [[0, 1], [1, 2], [2, 3], [3, 0], [1, 4]],
    lore: 'Das Auge. Früher hieß es Fischmaul. Dann kam Quantum, und plötzlich hieß alles irgendwie Auge.' },
  { name: 'Die Feuertreppe', pts: [[15, 90], [35, 90], [35, 65], [55, 65], [55, 40], [75, 40], [75, 15]], edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6]],
    lore: 'Die Feuertreppe. Für alle, die nicht springen. Auch ein Weg nach oben.' },
];

interface Star { x: number; y: number; el: HTMLElement; fig: number }

export const sternegucken: MinigameDef = {
  title: 'Sternegucken mit Vega',
  blurb: 'Smog weg, Wind von der See, über der Neon-Gasse ist es tatsächlich mal klar. Vega reicht dir das Fernrohr. „Ich zeig’s dir einmal. Danach bist du dran.“',
  controls: ['Stern antippen, dann den nächsten: Verbindung ziehen', 'Tastatur: Pfeile springen zum nächsten Stern, Leertaste wählt', 'Falsche Verbindungen kosten Geduld'],
  bonuses: () => ['Hier hilft nur Hinsehen. Und Vega.'],
  async run(host, ctx) {
    const level = ctx.level;
    const count = level >= 3 ? 3 : 2;
    const decoys = byLevel(level, [6, 9, 12, 15, 18]);
    const preview = byLevel(level, [99, 6, 5, 4, 3]);
    const allowed = byLevel(level, [6, 5, 4, 3, 3]);
    const sky = h('div', { class: 'sg-sky' });
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'sg-lines');
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('preserveAspectRatio', 'none');
    const nameEl = h('div', { class: 'sg-name' });
    const vega = speaker('sg-vega', 'Vega');
    sky.append(svg, nameEl, vega.el);
    host.stage.append(h('div', { class: 'sg-wrap' }, sky));

    const end = ending();
    const clock = host.countdown(byLevel(level, [90, 90, 110, 110, 120]));
    void clock.done.then(() => end.finish(false));
    const figures = shuffle([...FIGURES]).slice(0, count);
    let solved = 0, mistakes = 0;
    host.setInfo(`Fehler 0/${allowed}`);

    const line = (a: Star, b: Star, cls: string) => {
      const l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      l.setAttribute('x1', String(a.x)); l.setAttribute('y1', String(a.y)); l.setAttribute('x2', String(b.x)); l.setAttribute('y2', String(b.y));
      l.setAttribute('class', cls);
      svg.append(l);
      return l;
    };

    for (let f = 0; f < figures.length && !end.over; f++) {
      const fig = figures[f];
      // Aufbau: Sternbild in einen zufälligen Ausschnitt, Täuschsterne drum herum.
      sky.querySelectorAll('.sg-star').forEach((el) => el.remove());
      while (svg.firstChild) svg.firstChild.remove();
      const ox = 12 + Math.random() * 30, oy = 12 + Math.random() * 18, size = 46;
      const stars: Star[] = fig.pts.map(([x, y], i) => ({ x: ox + (x / 100) * size, y: oy + (y / 100) * size, el: h('div', { class: 'sg-star main' }), fig: i }));
      let guard = 0;
      while (stars.length < fig.pts.length + decoys && guard++ < 500) {
        const x = 4 + Math.random() * 92, y = 6 + Math.random() * 86;
        if (stars.some((s) => Math.hypot(s.x - x, s.y - y) < 7)) continue;
        stars.push({ x, y, el: h('div', { class: 'sg-star' }), fig: -1 });
      }
      for (const s of stars) { s.el.style.left = `${s.x}%`; s.el.style.top = `${s.y}%`; s.el.style.setProperty('--tw', `${(Math.random() * 3).toFixed(2)}s`); sky.append(s.el); }
      const ghost = fig.edges.map(([a, b]) => line(stars[a], stars[b], 'ghost'));
      nameEl.textContent = `${f + 1}/${figures.length} · ${fig.name}`;
      vega.say(f === 0 ? 'Da. Siehst du’s? Merk dir die Form.' : 'Nächstes. Gleiches Spiel.');
      const done = new Set<string>();
      let selected: Star | null = null;
      let cursor = 0;
      const key = (a: number, b: number) => (a < b ? `${a}-${b}` : `${b}-${a}`);
      const edgeSet = new Set(fig.edges.map(([a, b]) => key(a, b)));
      const fade = setTimeout(() => ghost.forEach((g) => g.classList.add('gone')), preview * 1000);
      const mark = () => stars.forEach((s, i) => { s.el.classList.toggle('sel', s === selected); s.el.classList.toggle('cursor', i === cursor && !ctx.touch); });
      await new Promise<void>((resolve) => {
        const tap = (star: Star) => {
          if (end.over) return;
          if (!selected) { selected = star; ctx.sfx('switch'); mark(); return; }
          if (selected === star) { selected = null; mark(); return; }
          const a = selected.fig, b = star.fig;
          if (a >= 0 && b >= 0 && edgeSet.has(key(a, b)) && !done.has(key(a, b))) {
            done.add(key(a, b));
            line(selected, star, 'drawn');
            ctx.sfx('heart-up');
            selected = star;
            if (done.size === edgeSet.size) { resolve(); return; }
          } else {
            mistakes++;
            ctx.sfx('fail');
            host.pop('Passt nicht', 'bad', star.x, star.y - 6);
            host.setInfo(`Fehler ${mistakes}/${allowed}`);
            if (mistakes === 2) vega.say('Nicht raten. Gucken.');
            if (mistakes >= allowed) { end.finish(false); resolve(); return; }
            selected = null;
          }
          mark();
        };
        stars.forEach((s) => s.el.addEventListener('pointerdown', (event) => { event.preventDefault(); event.stopPropagation(); tap(s); }));
        const jump = (dx: number, dy: number) => {
          const from = stars[cursor];
          let best = -1, bestScore = Infinity;
          stars.forEach((s, i) => {
            if (i === cursor) return;
            const vx = s.x - from.x, vy = s.y - from.y;
            const along = vx * dx + vy * dy;
            if (along <= 0) return;
            const across = Math.abs(vx * dy - vy * dx);
            const score = along + across * 2.2;
            if (score < bestScore) { bestScore = score; best = i; }
          });
          if (best >= 0) { cursor = best; mark(); }
        };
        host.onKey((event, down) => {
          if (!down || event.repeat || end.over || done.size === edgeSet.size) return;
          if (isLeft(event.code)) jump(-1, 0);
          else if (isRight(event.code)) jump(1, 0);
          else if (isUp(event.code)) jump(0, -1);
          else if (isDown(event.code)) jump(0, 1);
          else if (isAction(event.code)) tap(stars[cursor]);
        });
        mark();
        void end.done.then(() => resolve());
      });
      clearTimeout(fade);
      if (end.over) break;
      solved++;
      sky.classList.remove('flash'); void sky.offsetWidth; sky.classList.add('flash');
      host.setScore(`Sternbilder ${solved}/${figures.length}`);
      host.pop(fig.name, 'gold', 50, 14);
      vega.say(fig.lore);
      await host.wait(3200);
    }
    const won = solved >= figures.length && !end.over;
    end.finish(won);
    clock.stop();
    host.summary(`Sternbilder ${solved}/${figures.length} · Fehler ${mistakes}`);
    host.summary(won ? 'Vega lehnt sich zurück. „Die meisten sehen da oben nur Smog. Du nicht.“ Sie lächelt. Fast.' : 'Vega klappt das Fernrohr zusammen. „Morgen wieder. Die Sterne laufen nicht weg. Anders als Leute.“');
    return won;
  },
};
