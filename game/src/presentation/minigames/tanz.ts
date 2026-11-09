// akt-tanz: Tanzfläche im High Voltage. Pfeile fallen im Takt auf die Zielleiste; triff sie mit Pfeiltasten/WASD
// oder durch Tippen auf die Spur. Reflexe: größere Trefferfenster. Groove leer = runter von der Fläche.
import { h } from '../dom/dom';
import type { MinigameDef } from './types';
import { byLevel, clamp, pick } from './util';

const LANES = [
  { glyph: '←', codes: ['ArrowLeft', 'KeyA'] },
  { glyph: '↓', codes: ['ArrowDown', 'KeyS'] },
  { glyph: '↑', codes: ['ArrowUp', 'KeyW'] },
  { glyph: '→', codes: ['ArrowRight', 'KeyD'] },
] as const;

export interface DanceNote { time: number; lane: number }

/** Schrittfolge zum Takt: Viertel, ab Stufe 2 Achtel, ab Stufe 3 Doppelpfeile. */
export function danceChart(level: number, bpm: number, seconds: number, lead = 2): DanceNote[] {
  const beat = 60 / bpm;
  const notes: DanceNote[] = [];
  const pQuarter = byLevel(level, [0.62, 0.72, 0.8, 0.86, 0.9]);
  const pEighth = byLevel(level, [0, 0.1, 0.18, 0.28, 0.38]);
  const pDouble = byLevel(level, [0, 0, 0.08, 0.13, 0.18]);
  let last = -1;
  const lane = () => { let next = Math.floor(Math.random() * 4); if (next === last && Math.random() < 0.6) next = (next + 1 + Math.floor(Math.random() * 3)) % 4; last = next; return next; };
  for (let i = 0; lead + i * beat < lead + seconds; i++) {
    const t = lead + i * beat;
    // Jeder vierte Takt etwas ruhiger, damit man atmen kann.
    const breather = i % 16 >= 14;
    if (!breather && Math.random() < pQuarter) {
      const a = lane();
      notes.push({ time: t, lane: a });
      if (Math.random() < pDouble) notes.push({ time: t, lane: (a + 2) % 4 });
    }
    if (!breather && Math.random() < pEighth) notes.push({ time: t + beat / 2, lane: lane() });
  }
  return notes;
}

export const tanz: MinigameDef = {
  title: 'Tanzfläche',
  blurb: 'DJ Lumo dreht auf, der Boden vibriert. Tritt die Pfeile, wenn sie die Leiste treffen – und blamier dich nicht vor der halben Unterstadt.',
  controls: ['Pfeiltasten oder WASD', 'Touch/Maus: auf die Spur tippen', 'Groove-Leiste leer = Abgang'],
  bonuses(ctx) {
    return [`Reflexe ${ctx.attr('reflexe')}: Trefferfenster +${Math.round(ctx.edge('reflexe') * 60)} %`];
  },
  async run(host, ctx) {
    const level = ctx.level;
    const bpm = byLevel(level, [96, 106, 116, 126, 136]);
    const seconds = 32 + level * 3;
    const lead = 2;
    const travel = byLevel(level, [1.9, 1.7, 1.5, 1.35, 1.2]);
    const edge = ctx.edge('reflexe');
    const perfectWin = 0.05 * (1 + edge * 0.6);
    const goodWin = 0.115 * (1 + edge * 0.6);
    const needed = byLevel(level, [0.5, 0.55, 0.6, 0.64, 0.68]);
    const chart = danceChart(level, bpm, seconds, lead);
    const HIT_Y = 84;

    const lanesEl: HTMLElement[] = [];
    const field = h('div', { class: 'dz-field' });
    LANES.forEach((laneDef, index) => {
      const lane = h('div', { class: 'dz-lane', 'data-lane': String(index) }, h('div', { class: 'dz-receptor' }, laneDef.glyph));
      lane.addEventListener('pointerdown', (event) => { event.preventDefault(); hit(index); });
      lanesEl.push(lane);
      field.append(lane);
    });
    const grooveFill = h('i');
    const judge = h('div', { class: 'dz-judge' });
    const comboEl = h('div', { class: 'dz-combo' });
    host.stage.append(h('div', { class: 'dz-wrap' }, field, judge, comboEl, h('div', { class: 'dz-groove' }, h('span', null, 'Groove'), h('div', { class: 'dz-groove-bar' }, grooveFill))));

    interface Live extends DanceNote { el: HTMLElement | null; done: boolean }
    const notes: Live[] = chart.map((note) => ({ ...note, el: null, done: false }));
    let score = 0;
    let combo = 0;
    let best = 0;
    let groove = 60;
    let perfects = 0, goods = 0, misses = 0;
    const start = performance.now();
    const now = () => (performance.now() - start) / 1000;

    const showJudge = (text: string, cls: string) => {
      judge.textContent = text;
      judge.className = `dz-judge ${cls}`;
      void judge.offsetWidth;
      judge.classList.add('show');
      comboEl.textContent = combo >= 5 ? `${combo} Combo` : '';
    };
    const miss = (note: Live) => {
      note.done = true;
      note.el?.remove();
      combo = 0;
      misses++;
      groove = clamp(groove - 8, 0, 100);
      showJudge('Daneben', 'miss');
    };
    function hit(lane: number) {
      const t = now();
      lanesEl[lane].classList.remove('press'); void lanesEl[lane].offsetWidth; lanesEl[lane].classList.add('press');
      let target: Live | null = null;
      for (const note of notes) {
        if (note.done || note.lane !== lane) continue;
        if (Math.abs(note.time - t) <= goodWin) { target = note; break; }
        if (note.time - t > goodWin) break;
      }
      if (!target) { groove = clamp(groove - 2, 0, 100); return; }
      target.done = true;
      target.el?.remove();
      const off = Math.abs(target.time - t);
      combo++;
      best = Math.max(best, combo);
      if (off <= perfectWin) { score += 2; perfects++; groove = clamp(groove + 3, 0, 100); showJudge('PERFEKT', 'perfect'); ctx.sfx('hit'); }
      else { score += 1; goods++; groove = clamp(groove + 1.5, 0, 100); showJudge('Gut', 'good'); ctx.sfx('step'); }
    }

    host.onKey((event, down) => {
      if (!down || event.repeat) return;
      const index = LANES.findIndex((lane) => (lane.codes as readonly string[]).includes(event.code));
      if (index >= 0) hit(index);
    });

    let resolveEnd!: (won: boolean) => void;
    const end = new Promise<boolean>((resolve) => { resolveEnd = resolve; });
    const songEnd = (chart.at(-1)?.time ?? seconds) + 1;
    const beat = 60 / bpm;
    host.frame(() => {
      const t = now();
      const phase = ((t - lead) / beat) % 1;
      field.style.setProperty('--pulse', String(phase < 0 ? 0 : 1 - phase));
      for (const note of notes) {
        if (note.done) continue;
        const dt = note.time - t;
        if (dt > travel) break;
        if (dt < -goodWin) { miss(note); continue; }
        if (!note.el) {
          note.el = h('div', { class: `dz-note l${note.lane}` }, LANES[note.lane].glyph);
          lanesEl[note.lane].append(note.el);
        }
        note.el.style.top = `${HIT_Y - (dt / travel) * HIT_Y}%`;
      }
      grooveFill.style.width = `${groove}%`;
      grooveFill.parentElement!.classList.toggle('low', groove < 25);
      host.setScore(`Punkte ${score}`);
      if (groove <= 0) { resolveEnd(false); return false; }
      if (t >= songEnd) { resolveEnd(score >= chart.length * 2 * needed); return false; }
      return true;
    });
    host.setInfo(`${bpm} BPM`);
    const won = await end;
    const rate = chart.length ? Math.round((score / (chart.length * 2)) * 100) : 0;
    host.summary(`Perfekt ${perfects} · Gut ${goods} · Daneben ${misses} · beste Combo ${best}`);
    host.summary(`Wertung ${rate} % (nötig ${Math.round(needed * 100)} %)`);
    host.summary(won
      ? pick(['Die Menge macht Platz und klatscht. Lumo nickt dir zu.', 'Du hast die Fläche zerlegt. Im guten Sinn.', 'Irgendwer filmt mit. Morgen bist du ein Meme – ein gutes.'])
      : groove <= 0 ? 'Du stolperst von der Fläche. Jemand ruft „Nächster!“.' : pick(['Solide gezappelt. Für den Ruhm reicht’s nicht.', 'Lumo dreht die Musik leiser. Aus Mitleid.']));
    return won;
  },
};
