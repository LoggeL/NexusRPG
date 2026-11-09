// akt-armdruecken: Armdrücken am Ecktisch. Im Takt drücken (Ring leuchtet = sauberer Zug), bei „Er holt Luft!“
// gedrückt HALTEN, um seinen Ruck abzufangen. Ausdauer beachten. Körper: mehr Kraft je Zug und mehr Ausdauer.
import { h } from '../dom/dom';
import type { MinigameDef } from './types';
import { byLevel, clamp, gameButton, isAction, pick } from './util';

const RIVALS = ['Spargel-Sepp', 'Kalle Kettensäge', 'Mutti Stahl', 'Der Kühlschrank', 'Brecher-Brigitte'];
const TAUNTS = ['Na, Ärmchen aus Pappe?', 'Meine Oma drückt fester!', 'Ich spür gar nix, Lauch.', 'Du schwitzt ja schon, Pfeife.', 'Gleich liegst du flach, Würstchen.'];

export const armdruecken: MinigameDef = {
  title: 'Armdrücken',
  blurb: 'Ellbogen auf den klebrigen Tisch, Hand in die Pranke. Drück im Takt – und wenn der Brocken Luft holt, halt dagegen, sonst klatscht dein Handrücken aufs Holz.',
  controls: ['Leertaste / Klick / Tippen im Takt: ziehen', 'Bei „ER HOLT LUFT!“: gedrückt halten', 'Ausdauer leer = schlappe Züge'],
  bonuses(ctx) {
    return [`Körper ${ctx.attr('koerper')}: +${Math.round(ctx.edge('koerper') * 60)} % Kraft, +${Math.round(ctx.edge('koerper') * 40)} Ausdauer`];
  },
  async run(host, ctx) {
    const level = ctx.level;
    const rival = byLevel(level, RIVALS);
    const body = ctx.edge('koerper');
    const beatMs = byLevel(level, [720, 660, 610, 570, 530]);
    const pushBase = 0.09 * (0.75 + body * 0.6);
    const drift = byLevel(level, [0.07, 0.095, 0.12, 0.145, 0.17]);
    const surgeForce = byLevel(level, [0.32, 0.4, 0.48, 0.56, 0.64]);
    const maxStamina = 100 + body * 40;
    const seconds = 45;

    let p = 0;
    let stamina = maxStamina;
    let holding = false;
    let lastPress = 0;
    let surge: 'none' | 'warn' | 'on' = 'none';
    let surgeTimer = 4 + Math.random() * 2;
    let tauntTimer = 3;
    let beatStart = performance.now();

    const arm = h('div', { class: 'ad-arm' }, h('div', { class: 'ad-fist' }));
    const ring = h('div', { class: 'ad-ring' });
    const bar = h('div', { class: 'ad-bar' }, h('i', { class: 'ad-marker' }));
    const marker = bar.firstElementChild as HTMLElement;
    const staminaFill = h('i');
    const staminaBar = h('div', { class: 'ad-stamina' }, staminaFill);
    const callout = h('div', { class: 'ad-callout' });
    const speech = h('div', { class: 'ad-speech' });
    const button = gameButton('ZIEHEN', () => press(), 'mg-big ad-button');
    host.stage.append(
      h('div', { class: 'ad-wrap' },
        h('div', { class: 'ad-names' }, h('span', { class: 'you' }, 'Du'), h('span', { class: 'rival' }, rival)),
        bar,
        h('div', { class: 'ad-table' }, arm, ring, callout, speech),
        h('div', { class: 'ad-stam-row' }, h('span', null, 'Ausdauer'), staminaBar)),
      h('div', { class: 'mg-toolbar' }, button));

    const beatOffset = (now: number) => {
      const phase = ((now - beatStart) % beatMs) / beatMs;
      return Math.min(phase, 1 - phase) * beatMs; // ms Abstand zum nächsten Schlag
    };
    const press = () => {
      const now = performance.now();
      holding = true;
      if (now - lastPress < 90) return;
      lastPress = now;
      const window = 95 + body * 40;
      const onBeat = beatOffset(now) <= window;
      const tired = stamina <= 0;
      const cost = onBeat ? 5 : 10;
      stamina = Math.max(0, stamina - cost);
      const gain = pushBase * (onBeat ? 1.55 : 0.6) * (tired ? 0.25 : 1);
      p += gain;
      if (onBeat) { ring.classList.remove('hit'); void ring.offsetWidth; ring.classList.add('hit'); }
      ctx.sfx(onBeat ? 'hit' : 'step');
      if (tired) host.pop('Kraftlos …', 'bad', 30, 70);
    };
    const release = () => { holding = false; };

    host.onKey((event, down) => {
      if (!isAction(event.code)) return;
      if (down) { if (!event.repeat) press(); else holding = true; }
      else release();
    });
    button.addEventListener('pointerup', release);
    button.addEventListener('pointerleave', release);
    button.addEventListener('pointercancel', release);

    let resolveEnd!: (won: boolean) => void;
    const end = new Promise<boolean>((resolve) => { resolveEnd = resolve; });
    let over = false;
    host.frame((dt, now) => {
      if (over) return false;
      // Takt
      const phase = ((now - beatStart) % beatMs) / beatMs;
      ring.style.setProperty('--beat', String(1 - phase));
      ring.classList.toggle('on', Math.min(phase, 1 - phase) * beatMs < 95 + body * 40);
      // Gegner
      let force = drift * (0.85 + Math.sin(now / 900) * 0.25);
      surgeTimer -= dt;
      if (surge === 'none' && surgeTimer <= 0) { surge = 'warn'; surgeTimer = 0.9; callout.textContent = 'ER HOLT LUFT! – HALTEN!'; callout.className = 'ad-callout warn'; ctx.sfx('alarm'); }
      else if (surge === 'warn' && surgeTimer <= 0) { surge = 'on'; surgeTimer = 1.6; callout.className = 'ad-callout on'; callout.textContent = 'RUCK!'; }
      else if (surge === 'on') {
        if (holding && stamina > 0) {
          force += surgeForce * 0.15;
          stamina = Math.max(0, stamina - 28 * dt);
          callout.textContent = 'HALTEN …';
        } else {
          force += surgeForce;
          callout.textContent = 'RUCK!';
        }
        if (surgeTimer <= 0) {
          surge = 'none';
          surgeTimer = byLevel(level, [7, 6.2, 5.5, 4.8, 4.2]) + Math.random() * 2.5;
          callout.className = 'ad-callout';
          callout.textContent = '';
          beatStart = now; // Takt neu anschlagen
        }
      }
      p -= force * dt;
      // Erholung, wenn nicht gedrückt
      if (!holding && now - lastPress > 280) stamina = Math.min(maxStamina, stamina + 26 * dt);
      tauntTimer -= dt;
      if (tauntTimer <= 0) {
        tauntTimer = 5 + Math.random() * 4;
        speech.textContent = p > 0.4 ? pick(['Hnnngh – Glück gehabt!', 'Das zählt nicht, ich war abgelenkt!', 'Wer hat dir das beigebracht?']) : pick(TAUNTS);
        speech.classList.remove('show'); void speech.offsetWidth; speech.classList.add('show');
      }
      p = clamp(p, -1, 1);
      arm.style.transform = `rotate(${p * 70}deg)`;
      marker.style.left = `${(p + 1) * 50}%`;
      staminaFill.style.width = `${(stamina / maxStamina) * 100}%`;
      staminaBar.classList.toggle('low', stamina < maxStamina * 0.2);
      host.setScore(p >= 0 ? `Vorsprung ${Math.round(p * 100)}` : `Rückstand ${Math.round(-p * 100)}`);
      if (p >= 1) { over = true; resolveEnd(true); return false; }
      if (p <= -1) { over = true; resolveEnd(false); return false; }
      return true;
    });

    host.setInfo(`gegen ${rival}`);
    const clock = host.countdown(seconds);
    const won = await Promise.race([end, clock.done.then(() => p > 0)]);
    over = true;
    clock.stop();
    if (won) host.summary(pick([`${rival}s Handrücken knallt aufs Holz. Der Ecktisch johlt.`, `${rival} reibt sich den Arm: „Revanche, du Biest.“`, `Klatsch! ${rival} guckt, als hätte er gerade seine Würde verloren.`]));
    else host.summary(pick([`${rival} grinst: „Komm wieder, wenn du Muckis hast.“`, 'Dein Handrücken küsst den Tisch. Der Tisch küsst zurück.', 'Autsch. Der ganze Ecktisch hat’s gesehen.']));
    return won;
  },
};
