// akt-wrackrennen: Wrackrennen auf der `staubstrasse` mit der Rostlaube gegen Krähe (side-kraehes-ehre, world.md §6 Nr. 43).
// Draufsicht, frei lenken: Wracks und Ölfässer meiden, Sandverwehungen bremsen, Staubfalken auf Motorrädern drängen ab.
// Bei zwei Dritteln die Sprungschanze: mittig treffen und im Absprung Gas geben = Abkürzung. `gc-134` [Reflexe 7] bestanden:
// die Rostlaube nimmt die Schanze von selbst perfekt. Reflexe: Lenkung und Treffer verzeihen. `reparaturset` im Gepäck: +1 Karosserie.
// Krähe nimmt die Schanze immer. Gleichstand zählt als Sieg.
import './minigames3.css';
import { h } from '../dom/dom';
import { ending, relPoint, speaker } from './kit';
import type { MinigameDef } from './types';
import { byLevel, clamp, isAction, isLeft, isRight, isUp, pick } from './util';

const LENGTH = 1150;
const RAMP_AT = 780;
const SHORTCUT = 70;
type Kind = 'wrack' | 'fass' | 'sand' | 'falke';
interface Thing { d: number; x: number; w: number; kind: Kind; el: HTMLElement; done: boolean; vx: number }

export const wrackrennen: MinigameDef = {
  title: 'Wrackrennen gegen Krähe',
  blurb: 'Die Staubstraße, flirrende Hitze, Krähe auf ihrer Kettenmaschine mit Spitzenumhang. Du in der Rostlaube, die bei jedem Gangwechsel um Gnade bettelt. „Bis zum Wrackturm. Wer verliert, schuldet dem anderen eine Geschichte.“',
  controls: ['←/→ (A/D), Maus oder Finger: lenken', 'Wracks, Fässer und Staubfalken meiden, Sand bremst', 'Sprungschanze: mittig drauf, bei „JETZT!“ Leertaste/↑/„Gas“'],
  bonuses(ctx) {
    const lines = [`Reflexe ${ctx.attr('reflexe')}: Lenkung +${Math.round(ctx.edge('reflexe') * 50)} %, Treffer verzeihen mehr`];
    lines.push(ctx.checkOk('gc-134') ? 'Sprungschanze [Reflexe 7]: Du nimmst sie perfekt, ohne nachzudenken' : 'Sprungschanze [Reflexe 7]: selbst zielen und rechtzeitig Gas geben');
    if (ctx.has({ item: 'reparaturset' })) lines.push('Reparaturset im Kofferraum: +1 Karosserie');
    return lines;
  },
  async run(host, ctx) {
    const level = ctx.level;
    const reflex = ctx.edge('reflexe');
    const autoRamp = ctx.checkOk('gc-134');
    let hp = 3 + (ctx.has({ item: 'reparaturset' }) ? 1 : 0);
    const hpMax = hp;
    const steer = 75 * (1 + reflex * 0.5);
    const forgive = 1 - reflex * 0.25;
    const base = 30;
    const kraeheSpeed = base * byLevel(level, [0.84, 0.88, 0.92, 0.95, 0.98]);

    const road = h('div', { class: 'wr-road' });
    const car = h('div', { class: 'wr-car' });
    const kraehe = h('div', { class: 'wr-kraehe' });
    const ramp = h('div', { class: 'wr-ramp' }, h('span', null, 'SCHANZE'));
    const cue = h('div', { class: 'wr-cue' }, 'JETZT!');
    const finish = h('div', { class: 'wr-finish' });
    const hud = h('div', { class: 'wr-hud' });
    const bar = h('div', { class: 'wr-bar' });
    const meMark = h('i', { class: 'wr-mark me' });
    const krMark = h('i', { class: 'wr-mark kr' });
    bar.append(h('b', { class: 'wr-ramp-mark' }), meMark, krMark);
    const kr = speaker('wr-kr', 'Krähe');
    road.append(ramp, finish, kraehe, car, cue, hud, kr.el);
    const gas = h('button', { type: 'button', class: 'mg-btn mg-big', tabindex: '-1' }, 'GAS');
    host.stage.append(h('div', { class: 'wr-wrap' }, bar, road), h('div', { class: 'mg-toolbar' }, gas));
    (bar.querySelector('.wr-ramp-mark') as HTMLElement).style.left = `${(RAMP_AT / LENGTH) * 100}%`;
    const rampX = 30 + Math.random() * 40;
    ramp.style.left = `${rampX}%`;

    const things: Thing[] = [];
    let at = 70;
    const gap = byLevel(level, [48, 42, 36, 32, 28]);
    while (at < LENGTH - 40) {
      if (Math.abs(at - RAMP_AT) < 60) { at += 30; continue; }
      const kind: Kind = Math.random() < byLevel(level, [0.1, 0.15, 0.2, 0.25, 0.3]) ? 'falke' : pick<Kind>(['wrack', 'fass', 'sand', 'wrack', 'sand']);
      const w = kind === 'wrack' ? 16 : kind === 'sand' ? 22 : kind === 'falke' ? 6 : 7;
      const x = kind === 'falke' ? (Math.random() < 0.5 ? 12 : 88) : 14 + w / 2 + Math.random() * (72 - w);
      const el = h('div', { class: `wr-thing ${kind}` });
      el.style.width = `${w}%`;
      road.append(el);
      things.push({ d: at, x, w, kind, el, done: false, vx: 0 });
      at += gap * (0.6 + Math.random() * 0.7);
    }

    const end = ending();
    let pos = 0, x = 50, targetX: number | null = null, left = false, right = false;
    let v = base, slow = 0, air = 0, jumped = false, gasPressedAt = -1, kPos = 0, kJumped = false;
    let hits = 0, sandHits = 0, rampResult = 'nicht erreicht';
    let lastSay = 0;
    const say = (text: string) => { const now = performance.now(); if (now - lastSay > 2600) { lastSay = now; kr.say(text); } };
    const press = () => { gasPressedAt = pos; };
    gas.addEventListener('pointerdown', (e) => { e.preventDefault(); press(); });
    road.addEventListener('pointerdown', (e) => { e.preventDefault(); targetX = relPoint(e, road).x; });
    road.addEventListener('pointermove', (e) => { if (e.pointerType === 'mouse' || e.buttons) targetX = relPoint(e, road).x; });
    host.onKey((e, down) => {
      if (isLeft(e.code)) { left = down; if (down) targetX = null; }
      else if (isRight(e.code)) { right = down; if (down) targetX = null; }
      else if (down && !e.repeat && (isAction(e.code) || isUp(e.code))) press();
    });
    say('Für die Ehre, Stadtkind! Und für die Geschichte!');

    const hurt = (what: string) => {
      hp--; hits++; slow = 0.9; ctx.sfx('hurt');
      host.pop(what, 'bad', x, 70);
      road.classList.remove('shake'); void road.offsetWidth; road.classList.add('shake');
      if (hp <= 0) { end.finish(false); return true; }
      if (Math.random() < 0.5) say(pick(['Fährst du oder betest du?', 'Die Ödnis frisst Leute wie dich zum Frühstück!', 'Ha! Deine Karre hustet!']));
      return false;
    };

    host.frame((dt) => {
      if (end.over) return false;
      // Lenken (in der Luft nicht)
      if (air <= 0) {
        if (targetX !== null) x += clamp(targetX - x, -steer * dt, steer * dt);
        else x += ((right ? 1 : 0) - (left ? 1 : 0)) * steer * dt;
      }
      x = clamp(x, 14, 86);
      if (slow > 0) slow -= dt;
      const target = base * (slow > 0 ? 0.6 : 1) * (0.8 + 0.2 * (hp / hpMax));
      v += (target - v) * Math.min(1, dt * 2);
      pos += v * dt;
      if (air > 0) { air -= dt; if (air <= 0) { car.classList.remove('air'); ctx.sfx('hit'); } }
      // Schanze
      const rRel = RAMP_AT - pos;
      ramp.style.top = `${80 - rRel * 0.55}%`;
      ramp.style.display = rRel > 150 || rRel < -30 ? 'none' : '';
      cue.classList.toggle('show', !autoRamp && !jumped && rRel > 0 && rRel < 14 && Math.abs(x - rampX) < 9);
      if (autoRamp && !jumped && rRel < 40 && rRel > 0) x += clamp(rampX - x, -steer * 1.5 * dt, steer * 1.5 * dt);
      if (!jumped && rRel <= 0) {
        jumped = true;
        const aligned = Math.abs(x - rampX) < 9;
        const timed = gasPressedAt >= RAMP_AT - 16 && gasPressedAt <= RAMP_AT + 1;
        if (aligned && (autoRamp || timed)) {
          rampResult = 'perfekt'; pos += SHORTCUT; air = 1.1; car.classList.add('air'); ctx.sfx('success');
          host.pop(autoRamp ? 'Perfekter Sprung!' : 'Geflogen!', 'gold', x, 50);
          say('… Respekt. Das war ein Sprung für die Lieder.');
        } else if (aligned) {
          rampResult = 'wacklig'; pos += SHORTCUT / 2; air = 0.7; car.classList.add('air');
          host.pop('Wackliger Sprung', 'info', x, 50);
          if (hurt('Bruchlandung!')) return false;
        } else {
          rampResult = 'verpasst'; host.pop('Umweg über die Piste', 'info', x, 50);
          say('Schanze verpasst! Die Falken lachen über dich bis nächsten Winter!');
        }
      }
      // Hindernisse
      for (const t of things) {
        if (t.done) continue;
        const rel = t.d - pos;
        if (t.kind === 'falke' && rel < 70 && rel > 0) { t.vx += clamp(x - t.x, -1, 1) * dt * 22; t.vx *= 1 - dt; t.x = clamp(t.x + t.vx * dt, 12, 88); }
        t.el.style.top = `${80 - rel * 0.55}%`;
        t.el.style.left = `${t.x}%`;
        t.el.style.display = rel > 150 || rel < -20 ? 'none' : '';
        if (air <= 0 && Math.abs(rel) < 2.2 && Math.abs(t.x - x) < (t.w / 2 + 4) * forgive) {
          t.done = true;
          t.el.classList.add('hit');
          if (t.kind === 'sand') { sandHits++; slow = 1.2; host.pop('Sand!', 'info', x, 70); }
          else if (hurt(t.kind === 'wrack' ? 'Wrack!' : t.kind === 'fass' ? 'Fass!' : 'Abgedrängt!')) return false;
        } else if (rel < -4) t.done = true;
      }
      // Krähe
      kPos += kraeheSpeed * (1 + Math.sin(performance.now() / 900) * 0.05) * dt;
      if (!kJumped && kPos >= RAMP_AT) { kJumped = true; kPos += SHORTCUT; say('KRAAAAH!'); }
      const kRel = kPos - pos;
      kraehe.style.top = `${80 - kRel * 0.55}%`;
      kraehe.style.display = kRel > 150 || kRel < -30 ? 'none' : '';
      const fRel = LENGTH - pos;
      finish.style.top = `${80 - fRel * 0.55}%`;
      finish.style.display = fRel > 150 ? 'none' : '';
      car.style.left = `${x}%`;
      hud.textContent = `Karosserie ${'▮'.repeat(Math.max(0, hp))}${'▯'.repeat(Math.max(0, hpMax - hp))}`;
      meMark.style.left = `${clamp(pos / LENGTH, 0, 1) * 96}%`;
      krMark.style.left = `${clamp(kPos / LENGTH, 0, 1) * 96}%`;
      host.setScore(kRel > 1 ? `Krähe vorn: ${Math.round(kRel)} m` : kRel < -1 ? `Du vorn: ${Math.round(-kRel)} m` : 'Kopf an Kopf');
      host.setInfo(`${Math.round(clamp(pos / LENGTH, 0, 1) * 100)} %`);
      if (Math.random() < dt * 0.06) say(kRel > 0 ? pick(['Siehst du meinen Staub? Atme ihn ein, er ist gratis!', 'Hinter mir ist auch schön!']) : pick(['Nicht schlecht für eine Stadtratte!', 'Das gibt eine gute Geschichte. Wenn du überlebst.']));
      if (pos >= LENGTH || kPos >= LENGTH) { end.finish(pos >= kPos - 2); return false; }
      return true;
    });

    const won = await end.done;
    host.summary(`Treffer ${hits} · Sandverwehungen ${sandHits} · Schanze ${rampResult}`);
    host.summary(won
      ? 'Krähe nimmt den Helm ab, Staub im Gesicht, Grinsen darunter: „Die Falken ehren dich. Und ich will die Geschichte, wie du fahren gelernt hast.“'
      : hp <= 0 ? 'Die Rostlaube kocht, zischt und stirbt mitten auf der Piste. Krähe dreht eine Ehrenrunde um dich. Langsam.' : 'Krähe wartet am Wrackturm, die Beine auf dem Lenker: „Du schuldest mir eine Geschichte, Stadtkind.“');
    return won;
  },
};
