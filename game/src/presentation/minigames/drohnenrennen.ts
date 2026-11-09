// akt-drohnenrennen: Seitenansicht durch den Kranparcours am Rostkai. Hoch/runter steuern, Masten und Möwen ausweichen,
// durch Ringe fliegen (Schub). Gegen Turbo-Tilda und zwei Hafenpiloten.
// Reflexe: Steuerung. Technik (Tuning): Höchstgeschwindigkeit und längerer Schub. Stufe 1–3: Platz 1–2 reicht, ab 4 nur Sieg.
import { h } from '../dom/dom';
import { ending, relPoint, speaker } from './kit';
import type { MinigameDef } from './types';
import { byLevel, clamp, isDown, isUp, pick } from './util';

type Kind = 'mast-top' | 'mast-bottom' | 'gate' | 'moewe' | 'ring';
interface Obstacle { kind: Kind; x: number; y: number; gap: number; el: HTMLElement; done: boolean; phase: number }
interface Rival { name: string; pos: number; speed: number; el: HTMLElement }

const TRACK = 470;

export const drohnenrennen: MinigameDef = {
  title: 'Drohnenrennen am Rostkai',
  blurb: 'Freitagabend, Kräne aus, Drohnen an. Turbo-Tilda hat seit drei Monaten nicht verloren und erzählt es jedem. Zeit, ihr den Abend zu versauen.',
  controls: ['↑/↓ oder W/S: steigen/sinken', 'Maus/Finger: Drohne folgt der Höhe', 'Ringe geben Schub, Masten und Möwen bremsen'],
  bonuses(ctx) {
    return [
      `Reflexe ${ctx.attr('reflexe')}: Steuerung +${Math.round(ctx.edge('reflexe') * 50)} %`,
      `Technik ${ctx.attr('technik')}: Tuning +${Math.round(ctx.edge('technik') * 10)} % Spitze, Schub +${Math.round(ctx.edge('technik') * 60)} %`,
    ];
  },
  async run(host, ctx) {
    const level = ctx.level;
    const reflex = ctx.edge('reflexe');
    const tech = ctx.edge('technik');
    const need = level >= 4 ? 1 : 2;
    const base = 10 * (1 + tech * 0.1);
    const steer = 95 * (1 + reflex * 0.5);
    const boostTime = 1.1 * (1 + tech * 0.6);
    const spacing = byLevel(level, [26, 23, 20, 18, 16]);
    const gateGap = byLevel(level, [36, 32, 28, 25, 22]);
    const tilda = byLevel(level, [0.88, 0.93, 0.97, 1.0, 1.04]);

    const sky = h('div', { class: 'dr-sky' });
    const course = h('div', { class: 'dr-course' });
    const drone = h('div', { class: 'dr-drone' }, h('i', { class: 'dr-rotor a' }), h('i', { class: 'dr-rotor b' }));
    const bar = h('div', { class: 'dr-bar' });
    const youMark = h('div', { class: 'dr-mark you' }, 'DU');
    bar.append(h('div', { class: 'dr-finish' }, 'ZIEL'), youMark);
    const voice = speaker('dr-voice', 'Tilda');
    sky.append(course, drone, voice.el);
    host.stage.append(h('div', { class: 'dr-wrap' }, bar, sky));

    const rivals: Rival[] = [
      { name: 'Turbo-Tilda', pos: 0, speed: base * tilda, el: h('div', { class: 'dr-mark tilda' }, 'TILDA') },
      { name: 'Möwen-Mats', pos: 0, speed: base * (tilda - 0.07), el: h('div', { class: 'dr-mark' }, 'MATS') },
      { name: 'Schrauben-Suse', pos: 0, speed: base * (tilda - 0.12), el: h('div', { class: 'dr-mark' }, 'SUSE') },
    ];
    for (const r of rivals) bar.append(r.el);

    const end = ending();
    let y = 50, targetY: number | null = null;
    let up = false, down = false;
    let pos = 0, v = base, stun = 0, boost = 0;
    let crashes = 0, rings = 0;
    let nextSpawn = 8;
    const obstacles: Obstacle[] = [];
    voice.say(pick(['Na, Frischling? Ich lass dir zwei Sekunden Vorsprung. Aus Mitleid.', 'Wenn du crashst, sammel ich deine Teile. Ich hab ’ne Vitrine.']));

    sky.addEventListener('pointerdown', (event) => { event.preventDefault(); targetY = relPoint(event, sky).y; });
    sky.addEventListener('pointermove', (event) => { if (event.pointerType === 'mouse' || event.buttons) targetY = relPoint(event, sky).y; });
    host.onKey((event, isDownKey) => {
      if (isUp(event.code)) { up = isDownKey; if (isDownKey) targetY = null; }
      else if (isDown(event.code)) { down = isDownKey; if (isDownKey) targetY = null; }
    });

    const spawn = () => {
      const roll = Math.random();
      let kind: Kind;
      if (roll < 0.22) kind = 'ring';
      else if (roll < 0.42 && level >= 2) kind = 'gate';
      else if (roll < 0.6) kind = 'moewe';
      else kind = Math.random() < 0.5 ? 'mast-top' : 'mast-bottom';
      const el = h('div', { class: `dr-ob ${kind}` });
      const ob: Obstacle = { kind, x: 106, y: 20 + Math.random() * 60, gap: gateGap, el, done: false, phase: Math.random() * 6 };
      if (kind === 'gate') {
        ob.y = 22 + Math.random() * 56;
        el.append(h('i', { class: 'dr-gate-top' }), h('i', { class: 'dr-gate-bottom' }));
        (el.children[0] as HTMLElement).style.height = `${ob.y - ob.gap / 2}%`;
        (el.children[1] as HTMLElement).style.height = `${100 - ob.y - ob.gap / 2}%`;
      }
      if (kind === 'mast-top' || kind === 'mast-bottom') ob.y = byLevel(level, [42, 46, 50, 54, 58]) + Math.random() * 8;
      if (kind === 'mast-top') el.style.height = `${ob.y}%`;
      if (kind === 'mast-bottom') el.style.height = `${ob.y}%`;
      course.append(el);
      obstacles.push(ob);
    };

    const hit = (ob: Obstacle) => {
      ob.done = true;
      if (ob.kind === 'ring') {
        rings++; boost = boostTime;
        ob.el.classList.add('taken');
        ctx.sfx('engine');
        host.pop('Schub!', 'gold', 22, y - 8);
        return;
      }
      crashes++; stun = 0.9; boost = 0;
      ob.el.classList.add('bonk');
      drone.classList.remove('crash'); void drone.offsetWidth; drone.classList.add('crash');
      ctx.sfx('hurt');
      host.pop(ob.kind === 'moewe' ? 'Möwe!' : 'Bonk!', 'bad', 22, y - 8);
      if (Math.random() < 0.5) voice.say(pick(['Hahaha! Das gibt ’ne Delle. In deinem Ego.', 'Wer hat dir den Führerschein gegeben? Ein Toaster?', 'Masten stehen still, du Pfeife. Die musst du nur nicht treffen.']));
    };

    host.frame((dt) => {
      if (end.over) return false;
      // Steuerung
      if (targetY !== null) y += clamp(targetY - y, -steer * dt, steer * dt);
      else y += ((down ? 1 : 0) - (up ? 1 : 0)) * steer * dt;
      y = clamp(y, 6, 94);
      drone.style.top = `${y}%`;
      drone.classList.toggle('boost', boost > 0);
      // Tempo
      stun = Math.max(0, stun - dt);
      boost = Math.max(0, boost - dt);
      const want = base * (boost > 0 ? 1.45 : 1) * (stun > 0 ? 0.45 : 1);
      v += (want - v) * Math.min(1, dt * (stun > 0 ? 6 : 1.8));
      pos += v * dt;
      const scroll = v * 2.3 * dt;
      // Hindernisse
      if (pos >= nextSpawn && pos < TRACK - 12) { spawn(); nextSpawn = pos + spacing * (0.7 + Math.random() * 0.6) / 2.3; }
      for (const ob of obstacles) {
        ob.x -= scroll;
        if (ob.kind === 'moewe') { ob.phase += dt * 2.2; ob.el.style.top = `${ob.y + Math.sin(ob.phase) * 12}%`; }
        else if (ob.kind === 'ring') ob.el.style.top = `${ob.y}%`;
        ob.el.style.left = `${ob.x}%`;
        if (!ob.done && ob.x < 26 && ob.x > 16) {
          const oy = ob.kind === 'moewe' ? ob.y + Math.sin(ob.phase) * 12 : ob.y;
          if (ob.kind === 'ring' && Math.abs(oy - y) < 9) hit(ob);
          else if (ob.kind === 'moewe' && Math.abs(oy - y) < 7) hit(ob);
          else if (ob.kind === 'gate' && Math.abs(ob.y - y) > ob.gap / 2 - 3) hit(ob);
          else if (ob.kind === 'mast-top' && y < ob.y + 2) hit(ob);
          else if (ob.kind === 'mast-bottom' && y > 100 - ob.y - 2) hit(ob);
        }
        if (ob.x < -10) { ob.el.remove(); ob.done = true; }
      }
      for (let i = obstacles.length - 1; i >= 0; i--) if (!obstacles[i].el.isConnected) obstacles.splice(i, 1);
      // Gegner (leichtes Gummiband, Tilda bremst nie ganz ab)
      for (const r of rivals) {
        const band = clamp((pos - r.pos) / 80, -0.12, 0.1);
        r.pos += r.speed * (1 + band + Math.sin(performance.now() / 900 + r.name.length) * 0.05) * dt;
        r.el.style.left = `${clamp(r.pos / TRACK, 0, 1) * 92}%`;
      }
      youMark.style.left = `${clamp(pos / TRACK, 0, 1) * 92}%`;
      const place = 1 + rivals.filter((r) => r.pos > pos).length;
      host.setScore(`Platz ${place}/4`);
      host.setInfo(`${Math.round(clamp(pos / TRACK, 0, 1) * 100)} % · Ringe ${rings}`);
      if (pos >= TRACK) { end.finish(place <= need); return false; }
      const leader = rivals.reduce((a, b) => (a.pos > b.pos ? a : b));
      if (leader.pos >= TRACK && rivals.filter((r) => r.pos >= TRACK).length >= need) { end.finish(false); return false; }
      return true;
    });

    const won = await end.done;
    const place = 1 + rivals.filter((r) => r.pos > pos).length;
    host.summary(`Platz ${place} von 4 · Ringe ${rings} · Crashs ${crashes}`);
    if (won && place === 1) host.summary('Tilda wirft ihre Mütze ins Hafenbecken: „Revanche. Nächsten Freitag. Und ich tune nach.“');
    else if (won) host.summary(`Platz ${place} reicht. Tilda grinst: „Für ’nen Frischling nicht übel. Für ’nen Profi ein Witz.“`);
    else host.summary(pick(['Tilda poliert ihren Pokal demonstrativ mit dem Ärmel.', 'Die Möwen haben zugeguckt. Die erzählen das rum.']));
    return won;
  },
};
