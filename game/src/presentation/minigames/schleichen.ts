// akt-schleichen: Draufsicht-Schleichen für Einbrüche, Lüftungsschächte und Hinterhöfe (world.md §3.8 Schleichen, §2 Reflexe).
// Sichtkegel von Wachen, Drohnen und Kameras meiden (Wände verdecken die Sicht), kriechen, Dosen werfen, zum Ausgang.
// Entdeckung füllt sich langsam, nicht sofort. Tageszeit: Tag +1 Feld Kegel, Nacht −1 Feld; `haut-tarnlack` −20 % (nachts doppelt);
// nachts sind Kegel nur mit `augen-restlicht` deutlich zu sehen. Reflexe: langsamere Entdeckung, `perk-ausweichrolle`: halbe Sekunde Gnade.
// Grundriss nach `label`: „Lüftung/Schacht/Rohr“ → Schacht, „Büro/Labor/Flur/Turm/Campus“ → Flur, „Lager/Halle/Depot/Container/Hof“ → Halle.
import './minigames3.css';
import { h } from '../dom/dom';
import { ending, speaker } from './kit';
import { cam, conePoints, drawWalls, inCone, inRect, insideAny, moveWithWalls, patrol, s, stepCam, stepPatrol, svgPoint, type Cam, type Patrol, type Pt, type Rect } from './sicht';
import type { MinigameDef } from './types';
import { byLevel, clamp, gameButton, isDown, isLeft, isRight, isUp, pick } from './util';

const W = 100, H = 62;

interface GuardSpec { pts: Pt[]; min: number; drone?: boolean }
interface CamSpec { x: number; y: number; base: number; amp: number; min: number }
interface Layout { name: string; kind: 'halle' | 'schacht' | 'flur'; walls: Rect[]; start: Pt; exit: Rect; guards: GuardSpec[]; cams: CamSpec[] }

const LAYOUTS: Layout[] = [
  {
    name: 'Lagerhalle', kind: 'halle',
    walls: [{ x: 20, y: 0, w: 3, h: 40 }, { x: 42, y: 22, w: 3, h: 40 }, { x: 64, y: 0, w: 3, h: 38 },
      { x: 29, y: 46, w: 6, h: 6 }, { x: 51, y: 8, w: 7, h: 6 }, { x: 77, y: 44, w: 8, h: 7 }, { x: 4, y: 14, w: 8, h: 6 }],
    start: [6, 54], exit: { x: 89, y: 3, w: 9, h: 10 },
    guards: [{ pts: [[27, 9], [38, 9], [38, 36], [27, 36]], min: 1 }, { pts: [[49, 28], [60, 28], [60, 56], [49, 56]], min: 1 },
      { pts: [[72, 12], [92, 12], [92, 34], [72, 34]], min: 2 }, { pts: [[26, 56], [40, 56]], min: 4, drone: true }],
    cams: [{ x: 65.5, y: 39.5, base: Math.PI / 2, amp: 0.8, min: 3 }],
  },
  {
    name: 'Lüftungsschacht', kind: 'schacht',
    walls: [{ x: 10, y: 10, w: 80, h: 8 }, { x: 0, y: 26, w: 40, h: 8 }, { x: 50, y: 26, w: 50, h: 8 }, { x: 10, y: 42, w: 35, h: 10 }, { x: 55, y: 42, w: 35, h: 10 }],
    start: [5, 57], exit: { x: 91, y: 0.5, w: 8.5, h: 9 },
    guards: [{ pts: [[5, 38], [95, 38]], min: 1, drone: true }, { pts: [[95, 22], [5, 22]], min: 1, drone: true },
      { pts: [[35, 57], [95, 57]], min: 2, drone: true }, { pts: [[60, 5], [95, 14], [60, 5]], min: 4, drone: true }],
    cams: [{ x: 51, y: 38, base: Math.PI, amp: 0.35, min: 3 }],
  },
  {
    name: 'Büroflur', kind: 'flur',
    walls: [{ x: 0, y: 20, w: 30, h: 3 }, { x: 38, y: 20, w: 30, h: 3 }, { x: 76, y: 20, w: 24, h: 3 },
      { x: 0, y: 40, w: 20, h: 3 }, { x: 28, y: 40, w: 44, h: 3 }, { x: 80, y: 40, w: 20, h: 3 },
      { x: 9, y: 6, w: 8, h: 5 }, { x: 50, y: 8, w: 10, h: 5 }, { x: 84, y: 27, w: 6, h: 6 }, { x: 40, y: 50, w: 10, h: 5 }, { x: 12, y: 28, w: 8, h: 6 }],
    start: [50, 58], exit: { x: 0.5, y: 0.5, w: 7, h: 8 },
    guards: [{ pts: [[8, 52], [92, 52]], min: 1 }, { pts: [[5, 31], [95, 31]], min: 1 },
      { pts: [[22, 12], [70, 14]], min: 3 }, { pts: [[95, 47], [95, 58], [70, 58]], min: 4, drone: true }],
    cams: [{ x: 34, y: 1.5, base: Math.PI / 2, amp: 0.9, min: 2 }],
  },
];

function pickLayout(label?: string): Layout {
  const l = (label ?? '').toLowerCase();
  if (/lüftung|lueftung|schacht|rohr|kanal/.test(l)) return LAYOUTS[1];
  if (/büro|buero|labor|flur|turm|campus|penthouse|praxis/.test(l)) return LAYOUTS[2];
  if (/lager|halle|depot|container|hof|garage|markt/.test(l)) return LAYOUTS[0];
  return pick(LAYOUTS);
}

export const schleichen: MinigameDef = {
  title: 'Schleichen',
  blurb: 'Rein, raus, keiner merkt was. Bleib aus den Sichtkegeln, kriech, wenn es eng wird, und wirf eine Dose, wenn dir nichts Besseres einfällt. Wer gesehen wird, fängt von vorne an – oder fliegt raus.',
  controls: ['WASD/Pfeile: gehen · Umschalt halten oder C: kriechen (langsam, schwerer zu sehen)', 'Maus/Finger: hinzeigen oder ziehen, die Figur läuft hin', 'Q / Knopf „Dose“: Dose werfen – Wachen in der Nähe sehen nach', 'Rote Kegel meiden, grünes Feld ist der Ausgang'],
  bonuses(ctx) {
    const lines = [`Reflexe ${ctx.attr('reflexe')}: Entdeckung ${Math.round(ctx.edge('reflexe') * 35)} % langsamer`];
    if (ctx.has({ perk: 'perk-ausweichrolle' })) lines.push('Ausweichrolle: Sichtkegel bemerken dich eine halbe Sekunde später');
    if (ctx.has({ cyberware: 'haut-tarnlack' })) lines.push(ctx.has({ time: 'nacht' }) ? 'Tarnlack bei Nacht: Sichtkegel 40 % kürzer' : 'Tarnlack: Sichtkegel 20 % kürzer');
    if (ctx.has({ time: 'nacht' })) lines.push(ctx.has({ cyberware: 'augen-restlicht' }) ? 'Restlicht-Linsen: Sichtkegel nachts klar sichtbar' : 'Nacht: Kegel kürzer, aber schwer zu erkennen');
    else if (ctx.has({ time: 'tag' })) lines.push('Tag: Sichtkegel ein Stück länger');
    return lines;
  },
  async run(host, ctx) {
    const level = ctx.level;
    const layout = pickLayout(ctx.label);
    const night = ctx.has({ time: 'nacht' });
    const day = ctx.has({ time: 'tag' });
    const tarn = ctx.has({ cyberware: 'haut-tarnlack' });
    const restlicht = ctx.has({ cyberware: 'augen-restlicht' });
    const grace = ctx.has({ perk: 'perk-ausweichrolle' }) ? 0.5 : 0;
    const reflex = ctx.edge('reflexe');
    let len = byLevel(level, [13, 14.5, 16, 17, 18]) + (day ? 2 : night ? -2 : 0);
    if (tarn) len *= night ? 0.6 : 0.8;
    const half = byLevel(level, [0.45, 0.5, 0.52, 0.55, 0.6]);
    const guardSpeed = byLevel(level, [6, 7, 8, 9, 10]);
    const rate = byLevel(level, [1.3, 1.6, 1.9, 2.2, 2.6]) * (1 - reflex * 0.35);
    let tries = byLevel(level, [3, 3, 2, 2, 1]);
    let cans = byLevel(level, [3, 3, 2, 2, 1]);
    const seconds = byLevel(level, [90, 85, 80, 75, 70]);

    const svg = s('svg', { class: `sk-map ${layout.kind}${night && !restlicht ? ' night' : ''}`, viewBox: `0 0 ${W} ${H}`, preserveAspectRatio: 'xMidYMid meet' });
    const gFloor = s('g'), gCones = s('g', { class: 'sk-cones' }), gWalls = s('g'), gActors = s('g');
    gFloor.append(s('rect', { x: 0, y: 0, width: W, height: H, class: 'sk-floor' }));
    const exitEl = s('rect', { x: layout.exit.x, y: layout.exit.y, width: layout.exit.w, height: layout.exit.h, class: 'sk-exit' });
    gFloor.append(exitEl, s('text', { x: layout.exit.x + layout.exit.w / 2, y: layout.exit.y + layout.exit.h / 2 + 1, class: 'sk-exit-label' }, 'RAUS'));
    drawWalls(gWalls, layout.walls);
    svg.append(gFloor, gCones, gWalls, gActors);

    const guards: { p: Patrol; cone: SVGPolygonElement; body: SVGElement; drone: boolean; seenFor: number }[] = [];
    for (const spec of layout.guards.filter((g) => g.min <= level)) {
      const p = patrol(spec.pts.map((q) => [q[0], q[1]] as Pt), guardSpeed * (spec.drone ? 1.15 : 1), spec.drone ? 0.3 : 1);
      const cone = s('polygon', { class: 'sk-cone' });
      const body = s('circle', { r: spec.drone ? 1.5 : 1.9, class: spec.drone ? 'sk-drone' : 'sk-guard' });
      gCones.append(cone); gActors.append(body);
      guards.push({ p, cone, body, drone: !!spec.drone, seenFor: 0 });
    }
    const cams: { c: Cam; cone: SVGPolygonElement; seenFor: number }[] = [];
    for (const spec of layout.cams.filter((c) => c.min <= level)) {
      const c = cam(spec.x, spec.y, spec.base, spec.amp, 0.6 + level * 0.08);
      const cone = s('polygon', { class: 'sk-cone cam' });
      gCones.append(cone);
      gActors.append(s('rect', { x: spec.x - 1.2, y: spec.y - 1.2, width: 2.4, height: 2.4, class: 'sk-cam' }));
      cams.push({ c, cone, seenFor: 0 });
    }
    const me = s('circle', { r: 1.7, class: 'sk-me' });
    const facing = s('line', { class: 'sk-facing' });
    const noiseEl = s('circle', { r: 0, class: 'sk-noise' });
    gActors.append(noiseEl, facing, me);

    const voice = speaker('sk-voice', 'Funk');
    const meterFill = h('i', { class: 'sk-detect-fill' });
    const meterEl = h('div', { class: 'sk-detect' }, meterFill, h('span', null, 'Entdeckung'));
    const field = h('div', { class: 'sk-field' }, svg, meterEl, voice.el);
    const crouchButton = gameButton('Kriechen [C]', () => { crouchToggle = !crouchToggle; renderButtons(); });
    const canButton = gameButton('', () => { if (cans > 0) { armed = !armed; renderButtons(); } });
    host.stage.append(h('div', { class: 'sk-wrap' }, field), h('div', { class: 'mg-toolbar' }, crouchButton, canButton));

    const end = ending();
    let x = layout.start[0], y = layout.start[1], dir = -Math.PI / 2;
    let detect = 0, crouchHeld = false, crouchToggle = false, armed = false;
    let target: { x: number; y: number } | null = null;
    let pointerDown = false;
    const keys = { l: false, r: false, u: false, d: false };
    let caught = 0, closeCalls = 0, thrown = 0;
    let noise: { x: number; y: number; t: number } | null = null;
    const crouching = () => crouchHeld || crouchToggle;
    const renderButtons = () => {
      crouchButton.classList.toggle('on', crouching());
      canButton.textContent = armed ? 'Wohin werfen? (tippen)' : `Dose [Q] (${cans})`;
      canButton.disabled = cans <= 0;
      canButton.classList.toggle('on', armed);
    };
    renderButtons();

    const throwAt = (tx: number, ty: number) => {
      if (cans <= 0 || end.over) return;
      cans--; thrown++; armed = false;
      tx = clamp(tx, 1, W - 1); ty = clamp(ty, 1, H - 1);
      noise = { x: tx, y: ty, t: 0.8 };
      ctx.sfx('hit');
      for (const g of guards) if (Math.hypot(g.p.x - tx, g.p.y - ty) < 28) g.p.noise = { x: tx, y: ty, left: 3.6 };
      host.pop('Klonk!', 'info', (tx / W) * 100, (ty / H) * 100);
      renderButtons();
    };
    const throwAhead = () => {
      let d = 14;
      while (d > 2 && insideAny(x + Math.cos(dir) * d, y + Math.sin(dir) * d, layout.walls)) d -= 1;
      throwAt(x + Math.cos(dir) * d, y + Math.sin(dir) * d);
    };

    svg.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      const p = svgPoint(svg, event);
      if (armed) { throwAt(p.x, p.y); return; }
      pointerDown = true; target = p;
    });
    svg.addEventListener('pointermove', (event) => { if (pointerDown) target = svgPoint(svg, event); });
    const release = () => { pointerDown = false; };
    svg.addEventListener('pointerup', release);
    svg.addEventListener('pointercancel', release);
    host.onKey((event, down) => {
      const c = event.code;
      if (isLeft(c)) keys.l = down; else if (isRight(c)) keys.r = down; else if (isUp(c)) keys.u = down; else if (isDown(c)) keys.d = down;
      else if (c === 'ShiftLeft' || c === 'ShiftRight') crouchHeld = down;
      else if (c === 'KeyC' && down && !event.repeat) crouchToggle = !crouchToggle;
      else if (c === 'KeyQ' && down && !event.repeat) throwAhead();
      if (keys.l || keys.r || keys.u || keys.d) target = null;
      renderButtons();
    });

    const reset = () => {
      x = layout.start[0]; y = layout.start[1]; detect = 0; target = null;
      for (const g of guards) g.seenFor = 0;
      for (const c of cams) c.seenFor = 0;
    };

    voice.say(pick(layout.kind === 'schacht'
      ? ['Schacht ist eng, Drohnen sind dumm. Du bist hoffentlich das Gegenteil.', 'Lüftung. Riecht nach Staub und schlechten Entscheidungen.']
      : ['Rein, Ding holen, raus. Kein Heldentum.', 'Wenn dich einer sieht: Du bist der Hausmeister. Sag „Hausmeister“.']));
    const clock = host.countdown(seconds);

    host.frame((dt) => {
      if (end.over) return false;
      // Bewegung
      const speed = crouching() ? 8 : 15;
      let mx = (keys.r ? 1 : 0) - (keys.l ? 1 : 0), my = (keys.d ? 1 : 0) - (keys.u ? 1 : 0);
      if (target && !mx && !my) {
        const dx = target.x - x, dy = target.y - y, d = Math.hypot(dx, dy);
        if (d > 0.6) { mx = dx / d; my = dy / d; } else if (!pointerDown) target = null;
      }
      const m = Math.hypot(mx, my);
      if (m > 0) {
        mx /= m; my /= m;
        dir = Math.atan2(my, mx);
        const next = moveWithWalls(x, y, mx * speed * dt, my * speed * dt, 1.7, layout.walls, W, H);
        x = next.x; y = next.y;
      }
      // Wachen und Kameras
      let seenNow = false, nearest = 99;
      for (const g of guards) {
        stepPatrol(g.p, dt, layout.walls);
        const l = g.drone ? len * 0.85 : len;
        g.cone.setAttribute('points', conePoints(g.p.x, g.p.y, g.p.dir, half, l, layout.walls));
        g.body.setAttribute('cx', g.p.x.toFixed(2)); g.body.setAttribute('cy', g.p.y.toFixed(2));
        const sees = inCone(x, y, g.p.x, g.p.y, g.p.dir, half, l, layout.walls);
        g.seenFor = sees ? g.seenFor + dt : 0;
        g.cone.classList.toggle('alert', sees);
        if (sees && g.seenFor > grace) { seenNow = true; nearest = Math.min(nearest, Math.hypot(x - g.p.x, y - g.p.y) / l); }
      }
      for (const c of cams) {
        stepCam(c.c, dt);
        c.cone.setAttribute('points', conePoints(c.c.x, c.c.y, c.c.dir, half * 0.8, len + 4, layout.walls));
        const sees = inCone(x, y, c.c.x, c.c.y, c.c.dir, half * 0.8, len + 4, layout.walls);
        c.seenFor = sees ? c.seenFor + dt : 0;
        c.cone.classList.toggle('alert', sees);
        if (sees && c.seenFor > grace) { seenNow = true; nearest = Math.min(nearest, 0.7); }
      }
      if (seenNow) detect += dt * rate * (crouching() ? 0.55 : 1) * (1.4 - nearest * 0.7);
      else detect = Math.max(0, detect - dt * 0.3);
      if (seenNow && detect > 0.5 && Math.random() < dt * 1.5) voice.say(pick(['Hä? War da was?', 'Hallo? Ist da wer?', 'Ich hab doch was gehört …', 'Wenn das wieder die Ratten sind …']));
      if (detect >= 1) {
        caught++; tries--;
        ctx.sfx('alarm');
        if (tries <= 0) { end.finish(false); return false; }
        host.pop('Erwischt! Zurück auf Anfang', 'bad', 50, 40);
        voice.say(pick(['Hey! Stehen bleiben! … Weg isser.', 'Du hast genau eine Aufgabe: nicht gesehen werden.', 'Hausmeister! Du bist der HAUSMEISTER!']));
        reset();
      }
      if (!seenNow && detect > 0.7) closeCalls++;
      // Geräusch
      if (noise) {
        noise.t -= dt;
        noiseEl.setAttribute('cx', noise.x.toFixed(2)); noiseEl.setAttribute('cy', noise.y.toFixed(2));
        noiseEl.setAttribute('r', ((0.8 - noise.t) * 10).toFixed(2));
        if (noise.t <= 0) { noise = null; noiseEl.setAttribute('r', '0'); }
      }
      // Darstellung
      me.setAttribute('cx', x.toFixed(2)); me.setAttribute('cy', y.toFixed(2));
      me.classList.toggle('crouch', crouching());
      facing.setAttribute('x1', x.toFixed(2)); facing.setAttribute('y1', y.toFixed(2));
      facing.setAttribute('x2', (x + Math.cos(dir) * 3).toFixed(2)); facing.setAttribute('y2', (y + Math.sin(dir) * 3).toFixed(2));
      meterFill.style.width = `${clamp(detect, 0, 1) * 100}%`;
      meterEl.classList.toggle('hot', detect > 0.6);
      host.setScore(`${layout.name} · Versuche ${'●'.repeat(Math.max(0, tries))}`);
      host.setInfo(seenNow ? 'GESEHEN!' : crouching() ? 'kriechst' : armed ? 'Dose: Ziel tippen' : '');
      if (inRect(x, y, layout.exit)) { end.finish(true); return false; }
      return true;
    });

    const won = await Promise.race([end.done, clock.done.then(() => false)]);
    end.finish(won);
    clock.stop();
    host.summary(`${layout.name} · erwischt ${caught}× · Dosen ${thrown}${closeCalls > 30 ? ' · ganz knapp' : ''}`);
    host.summary(won
      ? pick(['Draußen. Keiner hat was gemerkt. Du bist ein Gespenst mit Mietrückstand.', 'Raus, ohne einen Mucks. Kas wäre stolz gewesen. Oder neidisch.'])
      : caught && tries <= 0 ? 'Eine Taschenlampe im Gesicht, eine Hand im Kragen. „Na, wen haben wir denn da?“ – Dich, du Trottel.' : 'Zu lange gebraucht. Draußen geht der Alarm los, drinnen gehen die Lichter an.');
    return won;
  },
};
