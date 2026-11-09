// akt-schloss: Schlossknacken. Jeder Stift wippt auf und ab; drück, wenn seine Oberkante in der Scherlinie steht.
// Reflexe: breiteres Fenster und ein Dietrich mehr; `dietrich-chip` öffnet Schlösser bis Stufe 3 sofort (verbraucht).
import { h } from '../dom/dom';
import type { MinigameDef } from './types';
import { byLevel, clamp, gameButton, isAction, pick } from './util';

interface Pin { band: number; width: number; speed: number; phase: number; set: boolean; el: HTMLElement; pin: HTMLElement; shear: HTMLElement }

const tri = (t: number) => { const x = t % 1; return x < 0.5 ? x * 2 : 2 - x * 2; };

export const schloss: MinigameDef = {
  title: 'Schlossknacken',
  blurb: 'Spannung drauf, Stift für Stift hoch. Jeder Stift tanzt auf und ab – erwisch ihn genau in der Scherlinie. Daneben kostet dich einen Dietrich.',
  controls: ['Leertaste / Klick / Tippen: Stift setzen', 'Dietrich-Chip: Knopf oder C (falls im Gepäck)'],
  bonuses(ctx) {
    const lines = [`Reflexe ${ctx.attr('reflexe')}: Fenster +${Math.round(ctx.edge('reflexe') * 70)} %`];
    if (ctx.attr('reflexe') >= 7) lines.push('Reflexe 7+: ein Dietrich extra');
    if (ctx.has({ item: 'dietrich-chip' })) lines.push(ctx.level <= 3 ? 'Dietrich-Chip: öffnet dieses Schloss sofort' : 'Dietrich-Chip: zu einfach für dieses Schloss');
    return lines;
  },
  async run(host, ctx) {
    const level = ctx.level;
    const count = byLevel(level, [3, 4, 5, 6, 7]);
    const baseWidth = byLevel(level, [0.2, 0.16, 0.13, 0.11, 0.09]) * (1 + ctx.edge('reflexe') * 0.7);
    const baseSpeed = byLevel(level, [0.5, 0.62, 0.74, 0.86, 1.0]);
    let picks = 3 + (ctx.attr('reflexe') >= 7 ? 1 : 0);
    const seconds = byLevel(level, [45, 45, 50, 55, 60]) + Math.round(ctx.edge('reflexe') * 10);
    const dropOnMiss = level >= 4;

    const lock = h('div', { class: 'lk-lock' });
    const picksEl = h('div', { class: 'lk-picks' });
    const pins: Pin[] = [];
    for (let i = 0; i < count; i++) {
      const width = baseWidth * (0.85 + Math.random() * 0.3);
      const band = 0.25 + Math.random() * (0.6 - width);
      const shear = h('div', { class: 'lk-shear' });
      shear.style.bottom = `${band * 100}%`;
      shear.style.height = `${width * 100}%`;
      const pin = h('div', { class: 'lk-pin' });
      const el = h('div', { class: 'lk-col' }, shear, pin, h('span', { class: 'lk-num' }, String(i + 1)));
      lock.append(el);
      pins.push({ band, width, speed: baseSpeed * (0.9 + i * 0.06) * (Math.random() < 0.5 ? 1 : 1.12), phase: Math.random(), set: false, el, pin, shear });
    }
    const chipAllowed = level <= 3 && ctx.has({ item: 'dietrich-chip' });
    let chipUsed = false;
    const chipButton = gameButton('Dietrich-Chip einsetzen [C]', () => useChip(), 'lk-chip');
    chipButton.hidden = !chipAllowed;
    const pickButton = gameButton('STIFT SETZEN', () => attempt(), 'mg-big');
    host.stage.append(h('div', { class: 'lk-wrap' }, h('div', { class: 'lk-body' }, lock, h('div', { class: 'lk-keyway' })), picksEl),
      h('div', { class: 'mg-toolbar' }, chipButton, pickButton));

    let current = 0;
    let t = 0;
    let resolveEnd!: (won: boolean) => void;
    const end = new Promise<boolean>((resolve) => { resolveEnd = resolve; });
    let over = false;
    const finish = (won: boolean) => { if (!over) { over = true; resolveEnd(won); } };

    const heightOf = (pin: Pin) => 0.08 + tri(t * pin.speed + pin.phase) * 0.84;
    const renderPicks = () => {
      picksEl.textContent = '';
      for (let i = 0; i < picks; i++) picksEl.append(h('span', { class: 'lk-pick' }, '╱'));
      host.setScore(`Stifte ${pins.filter((p) => p.set).length}/${count}`);
    };
    const useChip = () => {
      if (!chipAllowed || chipUsed || over) return;
      chipUsed = true;
      host.extra({ take: 'dietrich-chip' });
      for (const pin of pins) { pin.set = true; pin.el.classList.add('set'); pin.pin.style.bottom = `${(pin.band + pin.width / 2) * 100}%`; }
      ctx.sfx('hack');
      host.summary('Der Dietrich-Chip summt kurz, das Schloss gibt auf. (Chip verbraucht)');
      finish(true);
    };
    const attempt = () => {
      if (over) return;
      const pin = pins[current];
      const top = heightOf(pin);
      const center = pin.band + pin.width / 2;
      if (Math.abs(top - center) <= pin.width / 2 + 0.012) {
        pin.set = true;
        pin.el.classList.add('set');
        pin.pin.style.bottom = `${center * 100}%`;
        const perfect = Math.abs(top - center) < pin.width / 5;
        ctx.sfx('switch');
        host.pop(perfect ? 'Perfekt!' : 'Klick.', perfect ? 'gold' : 'good', ((current + 0.5) / count) * 80 + 10, 20);
        current++;
        renderPicks();
        if (current >= count) finish(true);
        else pins[current].el.classList.add('active');
      } else {
        picks--;
        ctx.sfx('fail');
        lock.classList.remove('shake'); void lock.offsetWidth; lock.classList.add('shake');
        host.pop(pick(['Knack – Dietrich hin.', 'Scheiße, abgerutscht!', 'Zu früh, du Grobmotoriker!']), 'bad', 50, 20);
        if (dropOnMiss && current > 0) {
          current--;
          pins[current].set = false;
          pins[current].el.classList.remove('set');
          pins[current + 1]?.el.classList.remove('active');
          pins[current].el.classList.add('active');
          host.pop('Ein Stift fällt zurück!', 'bad', 50, 30);
        }
        renderPicks();
        if (picks <= 0) finish(false);
      }
    };

    pins[0].el.classList.add('active');
    renderPicks();
    host.onKey((event, down) => {
      if (!down || event.repeat) return;
      if (isAction(event.code)) attempt();
      else if (event.code === 'KeyC') useChip();
    });
    host.stage.addEventListener('pointerdown', (event) => {
      if ((event.target as HTMLElement).closest('.mg-btn')) return;
      event.preventDefault();
      attempt();
    });

    host.frame((dt) => {
      if (over) return false;
      t += dt;
      pins.forEach((pin, i) => {
        if (pin.set) return;
        const height = i === current ? heightOf(pin) : 0.08;
        pin.pin.style.bottom = `${clamp(height, 0, 1) * 100}%`;
        if (i === current) pin.el.classList.toggle('hot', Math.abs(height - (pin.band + pin.width / 2)) <= pin.width / 2);
      });
      return true;
    });

    const clock = host.countdown(seconds);
    const won = await Promise.race([end, clock.done.then(() => false)]);
    over = true;
    clock.stop();
    if (won && !chipUsed) host.summary(`Offen. ${picks} Dietrich${picks === 1 ? '' : 'e'} übrig – Respekt, Langfinger.`);
    if (!won) host.summary(picks <= 0 ? 'Alle Dietriche verbogen. Das Schloss lacht dich aus.' : 'Zu lange gefummelt. Irgendwo geht ein Licht an.');
    return won;
  },
};
