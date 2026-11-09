// akt-keksalarm: Dantes Ofen spuckt Bleche aus. Fang die guten, lass die verkohlten fallen.
// Drei-Sekunden-Regel: Ein gutes Blech auf dem Boden ist drei Sekunden lang rettbar (antippen oder drüber + Leertaste).
// Reflexe: breiteres Blech in der Hand, langsamer fallende Bleche.
import { h } from '../dom/dom';
import type { MinigameDef } from './types';
import { byLevel, clamp, isAction, isDown, isLeft, isRight, pick } from './util';

interface Tray { x: number; y: number; burnt: boolean; el: HTMLElement; state: 'warn' | 'fall' | 'floor' | 'gone'; timer: number; badge?: HTMLElement }

export const keksalarm: MinigameDef = {
  title: 'Keksalarm',
  blurb: 'Dantes Ofen hat wieder einen seiner Tage: Bleche fliegen raus wie Konfetti. Fang die goldenen, lass die verkohlten fallen – und vergiss die Drei-Sekunden-Regel nicht.',
  controls: ['←/→ oder A/D: laufen, Maus/Finger: Blech folgt', 'Gefallenes Blech: antippen oder drüberstellen + Leertaste (3 s!)', 'Verkohlte Bleche nicht fangen'],
  bonuses(ctx) {
    return [`Reflexe ${ctx.attr('reflexe')}: Fanghand +${Math.round(ctx.edge('reflexe') * 45)} %, Bleche ${Math.round(ctx.edge('reflexe') * 30)} % langsamer`];
  },
  async run(host, ctx) {
    const level = ctx.level;
    const edge = ctx.edge('reflexe');
    const chutes = level >= 3 ? 5 : 4;
    const seconds = 45;
    const target = byLevel(level, [8, 10, 12, 14, 16]);
    const fallTime = byLevel(level, [3.0, 2.6, 2.3, 2.0, 1.75]) * (1 + edge * 0.3);
    const spawnEvery = byLevel(level, [1.55, 1.35, 1.15, 1.0, 0.88]);
    const burntChance = byLevel(level, [0.12, 0.16, 0.2, 0.24, 0.28]);
    const catcherWidth = 15 * (1 + edge * 0.45); // Prozent der Breite
    const FLOOR = 88;
    const CATCH_Y = 78;

    const kitchen = h('div', { class: 'kk-kitchen' });
    const oven = h('div', { class: 'kk-oven' });
    const lights: HTMLElement[] = [];
    for (let i = 0; i < chutes; i++) {
      const light = h('div', { class: 'kk-chute' });
      light.style.left = `${((i + 0.5) / chutes) * 100}%`;
      lights.push(light);
      oven.append(light);
    }
    const catcher = h('div', { class: 'kk-catcher' });
    catcher.style.width = `${catcherWidth}%`;
    const floor = h('div', { class: 'kk-floor' });
    const dante = h('div', { class: 'kk-dante' });
    kitchen.append(oven, floor, catcher, dante);
    host.stage.append(h('div', { class: 'kk-wrap' }, kitchen));

    let cx = 50;
    let pointerX: number | null = null;
    let leftHeld = false, rightHeld = false;
    let caught = 0, rescued = 0, lost = 0, burntCaught = 0;
    const trays: Tray[] = [];
    let spawnTimer = 0.8;
    const say = (text: string) => { dante.textContent = text; dante.classList.remove('show'); void dante.offsetWidth; dante.classList.add('show'); };

    const score = () => caught + rescued - burntCaught;
    const rescue = (tray: Tray) => {
      if (tray.state !== 'floor') return;
      tray.state = 'gone';
      tray.el.remove();
      rescued++;
      ctx.sfx('cookie');
      host.pop('Drei-Sekunden-Regel!', 'gold', tray.x, FLOOR - 10);
      if (Math.random() < 0.4) say(pick(['Zählt! Zählt total!', 'Boden ist sauber. Fast.', 'Puste drauf, passt.']));
    };

    const rectX = (event: PointerEvent) => {
      const rect = kitchen.getBoundingClientRect();
      return clamp(((event.clientX - rect.left) / rect.width) * 100, 0, 100);
    };
    kitchen.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      pointerX = rectX(event);
      // Gefallenes Blech direkt antippen
      const hitTray = (event.target as HTMLElement).closest('.kk-tray.floor');
      if (hitTray) { const tray = trays.find((t) => t.el === hitTray); if (tray) rescue(tray); }
    });
    kitchen.addEventListener('pointermove', (event) => { if (event.pointerType === 'mouse' || event.buttons) pointerX = rectX(event); });
    host.onKey((event, down) => {
      if (isLeft(event.code)) { leftHeld = down; if (down) pointerX = null; }
      else if (isRight(event.code)) { rightHeld = down; if (down) pointerX = null; }
      else if ((isAction(event.code) || isDown(event.code)) && down && !event.repeat) {
        const near = trays.filter((t) => t.state === 'floor' && Math.abs(t.x - cx) < catcherWidth / 2 + 4);
        if (near.length) rescue(near[0]);
      }
    });

    let over = false;
    host.frame((dt) => {
      if (over) return false;
      // Bewegung
      const speed = 95 + edge * 40;
      if (pointerX !== null) cx += clamp(pointerX - cx, -speed * dt * 1.6, speed * dt * 1.6);
      else cx += ((rightHeld ? 1 : 0) - (leftHeld ? 1 : 0)) * speed * dt;
      cx = clamp(cx, catcherWidth / 2, 100 - catcherWidth / 2);
      catcher.style.left = `${cx}%`;
      // Nachschub
      spawnTimer -= dt;
      if (spawnTimer <= 0) {
        spawnTimer = spawnEvery * (0.75 + Math.random() * 0.5);
        const chute = Math.floor(Math.random() * chutes);
        const burnt = Math.random() < burntChance;
        const el = h('div', { class: `kk-tray${burnt ? ' burnt' : ''}` });
        const tray: Tray = { x: ((chute + 0.5) / chutes) * 100, y: 8, burnt, el, state: 'warn', timer: 0.5 };
        el.style.left = `${tray.x}%`;
        el.style.top = `${tray.y}%`;
        kitchen.append(el);
        trays.push(tray);
        lights[chute].classList.remove('blink'); void lights[chute].offsetWidth; lights[chute].classList.add('blink');
      }
      for (const tray of trays) {
        if (tray.state === 'warn') { tray.timer -= dt; if (tray.timer <= 0) tray.state = 'fall'; continue; }
        if (tray.state === 'fall') {
          const prev = tray.y;
          tray.y += ((FLOOR - 8) / fallTime) * dt;
          tray.el.style.top = `${tray.y}%`;
          if (prev < CATCH_Y && tray.y >= CATCH_Y && Math.abs(tray.x - cx) <= catcherWidth / 2 + 3) {
            tray.state = 'gone';
            tray.el.remove();
            if (tray.burnt) { burntCaught++; ctx.sfx('fail'); host.pop('Bäh, verkohlt! −1', 'bad', tray.x, CATCH_Y - 8); say(pick(['Die waren doch tot, Mensch!', 'Das ist Kohle, kein Keks!'])); }
            else { caught++; ctx.sfx('cookie'); host.pop('+1', 'good', tray.x, CATCH_Y - 8); }
            continue;
          }
          if (tray.y >= FLOOR) {
            tray.y = FLOOR;
            if (tray.burnt) { tray.state = 'gone'; tray.el.classList.add('smash'); setTimeout(() => tray.el.remove(), 400); continue; }
            tray.state = 'floor';
            tray.timer = 3;
            tray.el.classList.add('floor');
            tray.badge = h('span', { class: 'kk-badge' }, '3');
            tray.el.append(tray.badge);
            ctx.sfx('hurt');
          }
          continue;
        }
        if (tray.state === 'floor') {
          tray.timer -= dt;
          if (tray.badge) tray.badge.textContent = String(Math.max(1, Math.ceil(tray.timer)));
          if (tray.timer <= 0) {
            tray.state = 'gone';
            tray.el.classList.add('lost');
            setTimeout(() => tray.el.remove(), 400);
            lost++;
            if (Math.random() < 0.5) say(pick(['NEIN! Meine Babys!', 'Der Boden frisst mehr als ich.', 'Wofür hab ich dich eigentlich?']));
          }
        }
      }
      for (let i = trays.length - 1; i >= 0; i--) if (trays[i].state === 'gone') trays.splice(i, 1);
      host.setScore(`Kekse ${score()}/${target}`);
      host.setInfo(lost ? `am Boden verloren: ${lost}` : '');
      return true;
    });
    const clock = host.countdown(seconds);
    await clock.done;
    over = true;
    const won = score() >= target;
    host.summary(`Gefangen ${caught} · gerettet ${rescued} · verkohlt erwischt ${burntCaught} · am Boden verloren ${lost}`);
    host.summary(won ? pick(['Dante strahlt mit Mehl im Bart: „Du bist offiziell Keksbeauftragte*r.“', 'Die Werkstatt riecht nach Sieg und Zimt.']) : 'Dante kehrt Krümel zusammen und seufzt sehr, sehr laut.');
    return won;
  },
};
