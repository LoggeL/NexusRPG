// akt-ventil: Ventilrätsel im Kanal-Sammler. Jedes Ventil drückt Wasser in eine oder mehrere Leitungen;
// alle Druckanzeigen müssen genau auf ihrer Marke stehen. Logikrätsel ohne Reflexdruck, aber mit Zeitlimit.
// Technik: Hinweise (5+: einer, 8+: zwei) zeigen die richtige Stellung eines Ventils; Technik 7+: Rohrplan sichtbar.
import { h } from '../dom/dom';
import { ending, speaker } from './kit';
import type { MinigameDef } from './types';
import { byLevel, digitOf, gameButton, isAction, isDown, isLeft, isRight, isUp, pick, randInt, shuffle } from './util';

interface Valve { links: { gauge: number; weight: number }[]; pos: number; el: HTMLElement; wheel: HTMLElement; label: HTMLElement }
const POS_LABEL = ['zu', 'halb', 'auf'];

export const ventil: MinigameDef = {
  title: 'Ventilrätsel',
  blurb: 'Rostige Räder, quietschende Rohre, Druckanzeigen aus der Kaiserzeit. Bring jede Anzeige genau auf ihre Marke, sonst flutet das Kanalvolk dir die Schuhe.',
  controls: ['Ventil anklicken/antippen: weiterdrehen', 'Tastatur: ←/→ Ventil wählen (oder 1–6), ↑/Leertaste aufdrehen, ↓ zudrehen', 'H: Hinweis (falls Technik reicht)'],
  bonuses(ctx) {
    const t = ctx.attr('technik');
    const lines = [`Technik ${t}: ${t >= 8 ? 'zwei Hinweise' : t >= 5 ? 'ein Hinweis' : 'keine Hinweise'}`];
    if (t >= 7) lines.push('Technik 7+: Du liest den Rohrplan (welches Ventil wohin drückt).');
    return lines;
  },
  async run(host, ctx) {
    const level = ctx.level;
    const t = ctx.attr('technik');
    const valveCount = byLevel(level, [3, 4, 4, 5, 6]);
    const gaugeCount = byLevel(level, [3, 3, 4, 4, 5]);
    const positions = level >= 3 ? 3 : 2;
    const seconds = byLevel(level, [90, 100, 110, 120, 130]);
    let hints = t >= 8 ? 2 : t >= 5 ? 1 : 0;
    const showPlan = t >= 7;

    // Rätsel erzeugen: zufällige Verbindungen, zufällige Lösung, Startstellung ≠ Lösung.
    const links: Valve['links'][] = [];
    for (let v = 0; v < valveCount; v++) {
      const n = Math.min(gaugeCount, level >= 3 && Math.random() < 0.35 ? 3 : randInt(1, 2));
      const gauges = shuffle(Array.from({ length: gaugeCount }, (_, i) => i)).slice(0, n);
      links.push(gauges.map((gauge) => ({ gauge, weight: level >= 4 && Math.random() < 0.3 ? 2 : 1 })));
    }
    for (let g = 0; g < gaugeCount; g++) if (!links.some((l) => l.some((x) => x.gauge === g))) links[randInt(0, valveCount - 1)].push({ gauge: g, weight: 1 });
    let solution: number[];
    do { solution = Array.from({ length: valveCount }, () => randInt(0, positions - 1)); } while (solution.filter((p) => p > 0).length < Math.min(2, valveCount));
    const maxOf = (g: number) => links.reduce((sum, l) => sum + l.filter((x) => x.gauge === g).reduce((s, x) => s + x.weight * (positions - 1), 0), 0);
    const valueOf = (pos: number[], g: number) => links.reduce((sum, l, v) => sum + l.filter((x) => x.gauge === g).reduce((s, x) => s + x.weight * pos[v], 0), 0);
    const targets = Array.from({ length: gaugeCount }, (_, g) => valueOf(solution, g));
    const maxes = Array.from({ length: gaugeCount }, (_, g) => Math.max(1, maxOf(g)));

    const room = h('div', { class: 'vt-room' });
    const gaugeRow = h('div', { class: 'vt-gauges' });
    const valveRow = h('div', { class: 'vt-valves' });
    const voice = speaker('vt-voice', 'Kanalvolk');
    const hintButton = gameButton(`Hinweis [H] (${hints})`, () => hint(), 'vt-hint');
    hintButton.hidden = hints <= 0;
    room.append(gaugeRow, valveRow, voice.el);
    host.stage.append(h('div', { class: 'vt-wrap' }, room), h('div', { class: 'mg-toolbar' }, hintButton));

    const gauges = targets.map((target, g) => {
      const fill = h('i', { class: 'vt-fill' });
      const mark = h('b', { class: 'vt-mark' });
      mark.style.bottom = `${(target / maxes[g]) * 100}%`;
      const value = h('span', { class: 'vt-value' });
      const tube = h('div', { class: 'vt-tube' }, fill, mark);
      const el = h('div', { class: 'vt-gauge' }, h('span', { class: 'vt-name' }, String.fromCharCode(65 + g)), tube, value);
      gaugeRow.append(el);
      return { el, fill, value };
    });
    const valves: Valve[] = links.map((l, v) => {
      const wheel = h('div', { class: 'vt-wheel' });
      const label = h('span', { class: 'vt-pos' });
      const plan = showPlan ? h('span', { class: 'vt-plan' }, `→ ${l.map((x) => `${String.fromCharCode(65 + x.gauge)}${x.weight > 1 ? '×2' : ''}`).join(' ')}`) : null;
      const el = h('div', { class: 'vt-valve' }, h('span', { class: 'm2-key' }, String(v + 1)), wheel, label, plan);
      valveRow.append(el);
      return { links: l, pos: 0, el, wheel, label };
    });

    const end = ending();
    let cursor = 0;
    let moves = 0;
    const render = () => {
      const pos = valves.map((v) => v.pos);
      let ok = 0;
      gauges.forEach((gauge, g) => {
        const value = valueOf(pos, g);
        gauge.fill.style.height = `${(value / maxes[g]) * 100}%`;
        gauge.value.textContent = `${value}/${targets[g]}`;
        const match = value === targets[g];
        gauge.el.classList.toggle('ok', match);
        gauge.el.classList.toggle('over', value > targets[g]);
        if (match) ok++;
      });
      valves.forEach((v, i) => {
        v.wheel.style.transform = `rotate(${v.pos * (positions === 3 ? 120 : 180)}deg)`;
        v.label.textContent = positions === 3 ? POS_LABEL[v.pos] : v.pos ? 'auf' : 'zu';
        v.el.classList.toggle('cursor', i === cursor && !ctx.touch);
      });
      host.setScore(`Anzeigen ${ok}/${gaugeCount}`);
      host.setInfo(`Züge ${moves}`);
      if (ok === gaugeCount) {
        ctx.sfx('success');
        end.finish(true);
      }
    };
    const turn = (index: number, delta: number) => {
      if (end.over || index < 0 || index >= valves.length) return;
      const v = valves[index];
      v.pos = (v.pos + delta + positions) % positions;
      cursor = index;
      moves++;
      ctx.sfx('switch');
      v.el.classList.remove('turn'); void v.el.offsetWidth; v.el.classList.add('turn');
      render();
      if (moves === 12 && !end.over) voice.say(pick(['Dreh nicht wie ’n Affe, denk wie ’ne Ratte.', 'Ein Ventil drückt in mehrere Rohre. Schon mal gehört?']));
    };
    const hint = () => {
      if (hints <= 0 || end.over) return;
      const wrong = valves.map((v, i) => i).filter((i) => valves[i].pos !== solution[i]);
      if (!wrong.length) return;
      const i = pick(wrong);
      hints--;
      valves[i].pos = solution[i];
      valves[i].el.classList.add('hinted');
      hintButton.textContent = `Hinweis [H] (${hints})`;
      hintButton.disabled = hints <= 0;
      host.pop(`Ventil ${i + 1}: ${positions === 3 ? POS_LABEL[solution[i]] : solution[i] ? 'auf' : 'zu'}`, 'gold', 50, 20);
      moves++;
      render();
    };
    valves.forEach((v, i) => v.el.addEventListener('pointerdown', (event) => { event.preventDefault(); turn(i, 1); }));
    host.onKey((event, down) => {
      if (!down || event.repeat) return;
      const d = digitOf(event.code);
      if (d >= 1 && d <= valves.length) turn(d - 1, 1);
      else if (isLeft(event.code)) { cursor = (cursor + valves.length - 1) % valves.length; render(); }
      else if (isRight(event.code)) { cursor = (cursor + 1) % valves.length; render(); }
      else if (isUp(event.code) || isAction(event.code)) turn(cursor, 1);
      else if (isDown(event.code)) turn(cursor, -1);
      else if (event.code === 'KeyH') hint();
    });
    render();
    voice.say('Die Marken stimmen. Die Ventile nicht. Mach was draus.');

    const clock = host.countdown(seconds);
    const result = await Promise.race([end.done, clock.done.then(() => false)]);
    end.finish(result);
    clock.stop();
    host.summary(`${moves} Züge · ${valves.filter((v, i) => v.pos === solution[i]).length}/${valveCount} Ventile wie im Lehrbuch`);
    host.summary(result ? 'Die Rohre hören auf zu heulen. Irgendwo jubelt das Kanalvolk – leise, wie immer.' : 'Ein Rohr pfeift wie ein Teekessel. Das Kanalvolk guckt dich sehr enttäuscht an.');
    return result;
  },
};
