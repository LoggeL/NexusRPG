// akt-schiessstand: Blechdosen schaukeln an Kranhaken von Kran zu Kran. Zielen, schießen, Munition zählt.
// Reflexe: weniger Fadenkreuz-Zittern, größere Trefferzone, ab 7 zwei Schuss mehr. Goldene Dose +2, Falkes Kaffeekanne −2.
// Mit Vega in der Party kommentiert sie (Herzen vergibt der Inhalt über win/lose).
import { h } from '../dom/dom';
import { ending, relPoint, speaker } from './kit';
import type { MinigameDef } from './types';
import { byLevel, clamp, isAction, isDown, isLeft, isRight, isUp, pick } from './util';

interface Can { x: number; y: number; vx: number; phase: number; kind: 'dose' | 'gold' | 'kanne'; el: HTMLElement; dead: boolean }

export const schiessstand: MinigameDef = {
  title: 'Schießstand am Rostkai',
  blurb: 'Die Kranführer hängen leere Dosen an die Haken und fahren sie hin und her. Wer trifft, kriegt Respekt. Wer Falkes Kaffeekanne trifft, kriegt Ärger.',
  controls: ['Maus: zielen, Klick: schießen', 'Touch: auf die Dose tippen', 'Tastatur: Pfeile/WASD zielen, Leertaste schießen'],
  bonuses(ctx) {
    const lines = [`Reflexe ${ctx.attr('reflexe')}: Zittern −${Math.round(ctx.edge('reflexe') * 70)} %, Trefferzone +${Math.round(ctx.edge('reflexe') * 40)} %`];
    if (ctx.attr('reflexe') >= 7) lines.push('Reflexe 7+: zwei Schuss extra');
    if (ctx.has({ companion: 'vega' })) lines.push('Vega schaut zu. Kein Druck.');
    return lines;
  },
  async run(host, ctx) {
    const level = ctx.level;
    const edge = ctx.edge('reflexe');
    const need = byLevel(level, [6, 8, 10, 12, 14]);
    const ammoStart = need + byLevel(level, [9, 8, 7, 6, 5]) + (ctx.attr('reflexe') >= 7 ? 2 : 0);
    const seconds = byLevel(level, [45, 45, 45, 50, 50]);
    const speed = byLevel(level, [11, 14, 17, 20, 23]);
    const maxCans = byLevel(level, [3, 3, 4, 4, 5]);
    const radius = 4.2 * (1 + edge * 0.4);
    const sway = 2.2 * (1 - clamp(edge, 0, 1) * 0.7) * (0.8 + level * 0.1);
    const vega = ctx.has({ companion: 'vega' });

    const yard = h('div', { class: 'ss-yard' });
    const craneL = h('div', { class: 'ss-crane left' });
    const craneR = h('div', { class: 'ss-crane right' });
    const cable = h('div', { class: 'ss-cable' });
    const cross = h('div', { class: 'ss-cross' });
    const ammoEl = h('div', { class: 'ss-ammo' });
    const voice = speaker('ss-voice', vega ? 'Vega' : 'Falke');
    yard.append(craneL, craneR, cable, cross, ammoEl, voice.el);
    host.stage.append(h('div', { class: 'ss-wrap' }, yard));

    const end = ending();
    let ammo = ammoStart;
    let points = 0, hits = 0, misses = 0, kannen = 0;
    let aimX = 50, aimY = 45;
    let swayT = 0;
    const keys = { l: false, r: false, u: false, d: false };
    const cans: Can[] = [];
    let spawnTimer = 0.2;

    const renderAmmo = () => {
      ammoEl.textContent = '';
      for (let i = 0; i < ammo; i++) ammoEl.append(h('i', null));
      host.setScore(`Treffer ${points}/${need}`);
      host.setInfo(`Munition ${ammo}`);
    };
    renderAmmo();
    voice.say(vega ? pick(['Atmen. Zielen. Ausatmen. Abdrücken. Nicht in der Reihenfolge rumpfuschen.', 'Ich zähl mit. Ich zähl immer mit.']) : 'Meine Kanne ist tabu, du Lackaffe. Die anderen kannst du durchsieben.');

    const spawn = () => {
      const fromLeft = Math.random() < 0.5;
      const roll = Math.random();
      const kind: Can['kind'] = roll < 0.1 ? 'gold' : roll < (level >= 3 ? 0.22 : 0.16) ? 'kanne' : 'dose';
      const hook = h('div', { class: 'ss-hook' });
      const el = h('div', { class: `ss-can ${kind}` }, hook);
      yard.append(el);
      const vx = (fromLeft ? 1 : -1) * speed * (0.8 + Math.random() * 0.5) * (kind === 'gold' ? 1.35 : 1);
      cans.push({ x: fromLeft ? -6 : 106, y: 26 + Math.random() * 34, vx, phase: Math.random() * 6, kind, el, dead: false });
    };

    const fire = (x: number, y: number) => {
      if (end.over || ammo <= 0) return;
      ammo--;
      ctx.sfx('shot');
      cross.classList.remove('kick'); void cross.offsetWidth; cross.classList.add('kick');
      let target: Can | null = null;
      let best = Infinity;
      for (const can of cans) {
        if (can.dead) continue;
        const cy = can.y + Math.sin(can.phase) * 5;
        // Breite in Prozent ist größer als Höhe in Prozent → leicht elliptisch prüfen.
        const d = Math.hypot((can.x - x) * 0.8, (cy - y) * 1.1);
        if (d < radius && d < best) { best = d; target = can; }
      }
      if (target) {
        target.dead = true;
        target.el.classList.add('hit');
        setTimeout(() => target?.el.remove(), 500);
        if (target.kind === 'kanne') {
          points = Math.max(0, points - 2); kannen++;
          ctx.sfx('fail');
          host.pop('Falkes Kanne! −2', 'bad', x, y - 6);
          voice.say(vega ? 'Das war die Kaffeekanne. Ich hab nichts gesehen. Lauf.' : pick(['MEINE KANNE! Du hirnamputierter Blechkopf!', 'Das war Familienbesitz, du Arsch!']));
        } else {
          const gain = target.kind === 'gold' ? 2 : 1;
          points += gain; hits++;
          ctx.sfx(target.kind === 'gold' ? 'coin' : 'hit');
          host.pop(target.kind === 'gold' ? 'Golddose! +2' : '+1', target.kind === 'gold' ? 'gold' : 'good', x, y - 6);
          if (Math.random() < 0.25) voice.say(vega ? pick(['Sauber.', 'Nicht schlecht. Für jemanden mit Augen.', 'Schulter locker lassen. Ja. So.']) : pick(['Pling! Musik für meine Ohren.', 'Na also, du Hafenratte.']));
        }
      } else {
        misses++;
        host.pop('daneben', 'info', x, y);
      }
      renderAmmo();
      if (points >= need) end.finish(true);
      else if (ammo <= 0) setTimeout(() => end.finish(points >= need), 400);
    };

    yard.addEventListener('pointermove', (event) => { const p = relPoint(event, yard); aimX = p.x; aimY = p.y; });
    yard.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      const p = relPoint(event, yard);
      aimX = p.x; aimY = p.y;
      // Touch: direkt am Tippunkt (ohne Zittern), Maus: am zitternden Fadenkreuz.
      if (event.pointerType === 'touch') fire(p.x, p.y);
      else fire(aimX + Math.sin(swayT * 2.3) * sway, aimY + Math.cos(swayT * 1.7) * sway);
    });
    host.onKey((event, down) => {
      if (isLeft(event.code)) keys.l = down;
      else if (isRight(event.code)) keys.r = down;
      else if (isUp(event.code)) keys.u = down;
      else if (isDown(event.code)) keys.d = down;
      else if (isAction(event.code) && down && !event.repeat) fire(aimX + Math.sin(swayT * 2.3) * sway, aimY + Math.cos(swayT * 1.7) * sway);
    });

    host.frame((dt) => {
      if (end.over) return false;
      swayT += dt;
      const move = 70 * dt;
      aimX = clamp(aimX + ((keys.r ? 1 : 0) - (keys.l ? 1 : 0)) * move, 0, 100);
      aimY = clamp(aimY + ((keys.d ? 1 : 0) - (keys.u ? 1 : 0)) * move, 8, 92);
      cross.style.left = `${aimX + Math.sin(swayT * 2.3) * sway}%`;
      cross.style.top = `${aimY + Math.cos(swayT * 1.7) * sway}%`;
      spawnTimer -= dt;
      if (spawnTimer <= 0 && cans.filter((c) => !c.dead).length < maxCans) { spawn(); spawnTimer = 0.7 + Math.random() * 0.9; }
      for (const can of cans) {
        if (can.dead) continue;
        can.x += can.vx * dt;
        can.phase += dt * (1.6 + level * 0.25);
        const y = can.y + Math.sin(can.phase) * 5;
        can.el.style.left = `${can.x}%`;
        can.el.style.top = `${y}%`;
        if (can.x < -10 || can.x > 110) { can.dead = true; can.el.remove(); }
      }
      for (let i = cans.length - 1; i >= 0; i--) if (cans[i].dead && !cans[i].el.isConnected) cans.splice(i, 1);
      return true;
    });

    const clock = host.countdown(seconds);
    const result = await Promise.race([end.done, clock.done.then(() => null)]);
    end.finish(result ?? points >= need);
    const won = points >= need;
    const shots = ammoStart - ammo;
    host.summary(`Treffer ${hits} von ${shots} Schuss${kannen ? ` · Kaffeekannen erlegt: ${kannen}` : ''} · Punkte ${points}/${need}`);
    if (won) host.summary(vega ? 'Vega nickt knapp. Bei ihr ist das ungefähr eine Standing Ovation.' : 'Falke spuckt ins Hafenbecken: „Nicht übel. Komm wieder, wenn du Geld brauchst.“');
    else host.summary(vega ? 'Vega: „Du hast die Luft erschossen. Gründlich.“' : 'Falke: „Die Dosen leben noch. Die Möwen lachen.“');
    return won;
  },
};
