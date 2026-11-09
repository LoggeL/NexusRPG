// akt-overwatch: main-2-bruch, Rolle „auf der Brücke“ (world.md §5.3): Von der Fußgängerbrücke über dem Quantum-Campus
// lotst die Spielfigur Aria und Nyra per Funk zum Labor. Kameras kurz ausschalten (Störsender), Lampen ausschießen (laut:
// Wachen sehen nach), Funk-Ablenkung (Wachen glotzen aufs Funkgerät). Die beiden laufen nur auf „Los!“ von Deckung zu Deckung.
// Im Dunkeln sehen Wachen nur aus der Nähe, Kameras sehen immer. Alarm voll = verloren. Technik: längere/mehr Störimpulse,
// Reflexe 7+: ein Schuss mehr.
import './minigames3.css';
import { h } from '../dom/dom';
import { ending, speaker } from './kit';
import { cam, conePoints, drawWalls, inCone, patrol, s, stepCam, stepPatrol, type Cam, type Patrol, type Pt, type Rect } from './sicht';
import type { MinigameDef } from './types';
import { byLevel, clamp, digitOf, gameButton, isAction, pick } from './util';

const W = 100, H = 62;
const WALLS: Rect[] = [
  { x: 14, y: 0, w: 16, h: 18 }, // Verwaltung
  { x: 40, y: 24, w: 18, h: 12 }, // Brunnen mit Nexus-Skulptur
  { x: 68, y: 0, w: 14, h: 20 }, // Laborflügel
  { x: 66, y: 42, w: 20, h: 8 }, // Hecke
  { x: 20, y: 44, w: 12, h: 8 }, // Pflanzkübel
];
// Weg von Aria und Nyra; c = Deckung (hier warten sie auf „Los!“).
const PATH: { x: number; y: number; c: boolean; name: string }[] = [
  { x: 3, y: 58, c: true, name: 'Zaunloch' },
  { x: 18, y: 43, c: true, name: 'Pflanzkübel' },
  { x: 37, y: 39.5, c: true, name: 'Brunnen' },
  { x: 61, y: 39, c: true, name: 'Skulptur' },
  { x: 64, y: 23, c: true, name: 'Laborecke' },
  { x: 86, y: 24, c: true, name: 'Lieferrampe' },
  { x: 90, y: 7, c: false, name: 'Labortür' },
];
const GUARDS: { pts: Pt[]; min: number }[] = [
  { pts: [[6, 36], [34, 36]], min: 1 },
  { pts: [[62, 58], [62, 31], [90, 31], [90, 58]], min: 1 },
  { pts: [[38, 14], [62, 14]], min: 3 },
];
const CAMS: { x: number; y: number; base: number; amp: number; min: number }[] = [
  { x: 30.5, y: 18.5, base: Math.PI / 4, amp: 0.55, min: 1 },
  { x: 67.5, y: 20.5, base: (3 * Math.PI) / 4, amp: 0.6, min: 1 },
  { x: 82.5, y: 12, base: 0.2, amp: 0.6, min: 2 },
  { x: 50, y: 61, base: -Math.PI / 2, amp: 0.8, min: 4 },
];
const LAMPS: Pt[] = [[25, 37], [50, 42], [76, 27], [88, 15]];
const LAMP_R = 10;

export const overwatch: MinigameDef = {
  title: 'Overwatch auf der Brücke',
  blurb: 'Du liegst auf der Fußgängerbrücke über dem Quantum-Campus, Vega neben dir mit dem Gewehr, unten Aria und Nyra im Gebüsch. Kameras, Wachen, Flutlicht. Sag ihnen, wann sie laufen sollen. Und bitte nicht, wenn einer guckt.',
  controls: ['Leertaste / Knopf „Los!“: Aria und Nyra zur nächsten Deckung schicken (nochmal = „Halt!“)', 'Kamera antippen oder Ziffer: Störimpuls (Kamera kurz aus)', 'Lampe antippen oder Ziffer: ausschießen (dunkel, aber laut – Wachen sehen nach)', 'F / Knopf „Funk“: falscher Funkspruch, Wachen glotzen kurz aufs Gerät'],
  bonuses(ctx) {
    const t = ctx.attr('technik');
    const lines = [`Technik ${t}: Störimpuls ${Math.round(5 + ctx.edge('technik') * 5)} s${t >= 7 ? ', ein Impuls mehr' : ''}`];
    if (ctx.attr('reflexe') >= 7) lines.push(`Reflexe ${ctx.attr('reflexe')}: ein Schuss mehr`);
    return lines;
  },
  async run(host, ctx) {
    const level = ctx.level;
    const techEdge = ctx.edge('technik');
    let charges = byLevel(level, [6, 5, 4, 4, 3]) + (ctx.attr('technik') >= 7 ? 1 : 0);
    let shots = byLevel(level, [4, 3, 3, 2, 2]) + (ctx.attr('reflexe') >= 7 ? 1 : 0);
    let funks = byLevel(level, [2, 2, 1, 1, 1]);
    const hackTime = 5 + techEdge * 5;
    const len = byLevel(level, [15, 16, 17, 18, 19]);
    const half = 0.5;
    const darkFactor = 0.42;
    const rate = byLevel(level, [0.55, 0.7, 0.85, 1, 1.15]);
    const decay = byLevel(level, [0.12, 0.1, 0.08, 0.05, 0.03]);
    const seconds = byLevel(level, [120, 115, 110, 100, 95]);

    const svg = s('svg', { class: 'ow-map', viewBox: `0 0 ${W} ${H}`, preserveAspectRatio: 'xMidYMid meet' });
    const gFloor = s('g'), gLight = s('g'), gCones = s('g'), gWalls = s('g'), gActors = s('g'), gUi = s('g');
    gFloor.append(s('rect', { x: 0, y: 0, width: W, height: H, class: 'ow-floor' }));
    gFloor.append(s('polyline', { points: PATH.map((p) => `${p.x},${p.y}`).join(' '), class: 'ow-path' }));
    for (const p of PATH) if (p.c) gFloor.append(s('circle', { cx: p.x, cy: p.y, r: 1.4, class: 'ow-cover' }));
    gFloor.append(s('rect', { x: 86, y: 2, width: 8, height: 4, class: 'ow-door' }), s('text', { x: 90, y: 5, class: 'ow-door-label' }, 'LABOR'));
    drawWalls(gWalls, WALLS, 'ow-wall');
    svg.append(gFloor, gLight, gCones, gWalls, gActors, gUi);

    const lamps = LAMPS.map(([lx, ly]) => {
      const glow = s('circle', { cx: lx, cy: ly, r: LAMP_R, class: 'ow-light' });
      const bulb = s('circle', { cx: lx, cy: ly, r: 1.3, class: 'ow-bulb' });
      gLight.append(glow); gActors.append(bulb);
      return { x: lx, y: ly, on: true, glow, bulb };
    });
    const guards: { p: Patrol; cone: SVGPolygonElement; body: SVGCircleElement }[] = GUARDS.filter((g) => g.min <= level).map((g) => {
      const p = patrol(g.pts.map((q) => [q[0], q[1]] as Pt), byLevel(level, [5, 5.5, 6, 6.5, 7]), 1.2);
      const cone = s('polygon', { class: 'ow-cone' });
      const body = s('circle', { r: 1.8, class: 'ow-guard' });
      gCones.append(cone); gActors.append(body);
      return { p, cone, body };
    });
    const cams: { c: Cam; cone: SVGPolygonElement; box: SVGRectElement }[] = CAMS.filter((c) => c.min <= level).map((spec) => {
      const c = cam(spec.x, spec.y, spec.base, spec.amp, 0.45 + level * 0.07);
      const cone = s('polygon', { class: 'ow-cone cam' });
      const box = s('rect', { x: spec.x - 1.4, y: spec.y - 1.4, width: 2.8, height: 2.8, class: 'ow-cam' });
      gCones.append(cone); gActors.append(box);
      return { c, cone, box };
    });
    const aria = s('circle', { r: 1.6, class: 'ow-aria' });
    const nyra = s('circle', { r: 1.4, class: 'ow-nyra' });
    gActors.append(aria, nyra);

    // Ziele mit Nummern (Ziffern-Tasten)
    type Target = { kind: 'cam'; i: number } | { kind: 'lamp'; i: number };
    const targets: Target[] = [...cams.map((_, i) => ({ kind: 'cam', i }) as Target), ...lamps.map((_, i) => ({ kind: 'lamp', i }) as Target)];
    const targetLabels = targets.map((t, n) => {
      const pos = t.kind === 'cam' ? cams[t.i].c : lamps[t.i];
      const label = s('text', { x: pos.x + 2.2, y: pos.y - 1.6, class: 'ow-num' }, String(n + 1));
      gUi.append(label);
      return label;
    });

    const ariaSay = speaker('ow-aria-say', 'Aria (Funk)');
    const vega = speaker('ow-vega-say', 'Vega');
    const alarmFill = h('i', { class: 'sk-detect-fill' });
    const alarmEl = h('div', { class: 'sk-detect ow-alarm' }, alarmFill, h('span', null, 'Alarm'));
    host.stage.append(h('div', { class: 'sk-wrap' }, h('div', { class: 'sk-field ow-field' }, svg, alarmEl, ariaSay.el, vega.el)));
    const goButton = gameButton('LOS! [Leertaste]', () => toggleGo(), 'mg-big');
    const funkButton = gameButton('', () => funk());
    const status = h('span', { class: 'ow-status' });
    host.stage.append(h('div', { class: 'mg-toolbar' }, status, funkButton, goButton));

    const end = ending();
    let seg = 0; // Ziel-Wegpunkt-Index (die beiden stehen bei PATH[seg - 1] … unterwegs zu PATH[seg])
    let dx = PATH[0].x, dy = PATH[0].y;
    let moving = false, alarm = 0, funkLeft = 0, seenTime = 0, hacks = 0, shotsFired = 0;
    seg = 1;
    const render = () => {
      goButton.textContent = moving ? 'HALT! [Leertaste]' : 'LOS! [Leertaste]';
      goButton.classList.toggle('stop', moving);
      funkButton.textContent = `Funk [F] (${funks})`;
      funkButton.disabled = funks <= 0;
      status.textContent = `Störimpulse ${charges} · Schuss ${shots}`;
      targets.forEach((t, n) => {
        const used = t.kind === 'cam' ? charges <= 0 || cams[t.i].c.off > 0 : shots <= 0 || !lamps[t.i].on;
        targetLabels[n].classList.toggle('used', used);
      });
    };
    const toggleGo = () => {
      if (end.over) return;
      moving = !moving;
      ctx.sfx('talk');
      if (moving) ariaSay.say(pick(['Bewegung. Wehe, du hast gepennt.', 'Wir laufen. Nyra, Kopf runter.', 'Okay, okay, wir gehen. Wenn ich sterbe, kriegst du meine Platten nicht.']));
      else ariaSay.say(pick(['Stehen. Wir stehen. Nyra steht. Alles steht.', 'Halt? HALT? Wir sind mitten auf dem Rasen!']));
      render();
    };
    const hack = (i: number) => {
      const c = cams[i];
      if (end.over || charges <= 0 || c.c.off > 0) return;
      charges--; hacks++;
      c.c.off = hackTime;
      ctx.sfx('hack');
      host.pop('Kamera aus', 'info', (c.c.x / W) * 100, (c.c.y / H) * 100);
      if (Math.random() < 0.4) vega.say(pick(['Kamera schläft. Gute Nacht, Arschloch.', 'Hübsch. Weiter so.']));
      render();
    };
    const shoot = (i: number) => {
      const l = lamps[i];
      if (end.over || shots <= 0 || !l.on) return;
      shots--; shotsFired++;
      l.on = false;
      l.glow.classList.add('off'); l.bulb.classList.add('off');
      ctx.sfx('shot');
      host.pop('Peng!', 'gold', (l.x / W) * 100, (l.y / H) * 100);
      for (const g of guards) if (Math.hypot(g.p.x - l.x, g.p.y - l.y) < 26) g.p.noise = { x: l.x + (Math.random() - 0.5) * 4, y: l.y + 3, left: 3.2 };
      vega.say(pick(['Lampe ist Geschichte.', 'Ich hätte auch die Wache nehmen können. Nur so als Info.', 'Schön dunkel. Wie in meinem Herzen.']));
      if (Math.random() < 0.5) void host.wait(1100).then(() => { if (!end.over) ariaSay.say('Schöner Schuss, Vega. Bisschen LAUT, aber schön.'); });
      render();
    };
    const funk = () => {
      if (end.over || funks <= 0) return;
      funks--;
      funkLeft = 4.5;
      ctx.sfx('phone');
      vega.say('„Zentrale an alle: Kaffeemaschine im Foyer brennt.“ … Die glotzen jetzt alle aufs Funkgerät.');
      render();
    };
    const act = (t: Target) => { if (t.kind === 'cam') hack(t.i); else shoot(t.i); };

    cams.forEach((c, i) => c.box.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); hack(i); }));
    lamps.forEach((l, i) => {
      const hit = s('circle', { cx: l.x, cy: l.y, r: 3.4, class: 'ow-hit' });
      hit.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); shoot(i); });
      gUi.append(hit);
    });
    cams.forEach((c, i) => {
      const hit = s('circle', { cx: c.c.x, cy: c.c.y, r: 3.4, class: 'ow-hit' });
      hit.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); hack(i); });
      gUi.append(hit);
    });
    host.onKey((event, down) => {
      if (!down || event.repeat) return;
      const n = digitOf(event.code);
      if (n && n <= targets.length) { act(targets[n - 1]); return; }
      if (event.code === 'KeyF') funk();
      else if (isAction(event.code)) toggleGo();
    });

    const lit = (px: number, py: number) => lamps.some((l) => l.on && Math.hypot(px - l.x, py - l.y) < LAMP_R);
    render();
    ariaSay.say('Wir sind am Zaun. Sag, wann. Und sag es nicht zu früh, sonst komm ich hoch und tret dich von der Brücke.');
    void host.wait(3200).then(() => { if (!end.over) vega.say('Zwei Kameras, zwei Wachen, Flutlicht. Ich mag Flutlicht nicht.'); });
    const clock = host.countdown(seconds);

    host.frame((dt) => {
      if (end.over) return false;
      if (funkLeft > 0) funkLeft -= dt;
      // Duo bewegen
      if (moving) {
        const goal = PATH[seg];
        const ddx = goal.x - dx, ddy = goal.y - dy, d = Math.hypot(ddx, ddy);
        const step = 7 * dt;
        if (d <= step) {
          dx = goal.x; dy = goal.y;
          if (seg >= PATH.length - 1) { end.finish(true); return false; }
          seg++;
          if (goal.c) { moving = false; ctx.sfx('step'); host.pop(goal.name, 'good', (dx / W) * 100, (dy / H) * 100 - 6); render(); }
        } else { dx += (ddx / d) * step; dy += (ddy / d) * step; }
      }
      const atCover = !moving && PATH.some((p) => p.c && Math.hypot(p.x - dx, p.y - dy) < 0.5);
      // Wachen
      let seen = false;
      const inLight = lit(dx, dy);
      for (const g of guards) {
        if (funkLeft <= 0) stepPatrol(g.p, dt, WALLS);
        const reach = funkLeft > 0 ? len * 0.3 : len;
        g.cone.setAttribute('points', conePoints(g.p.x, g.p.y, g.p.dir, half, reach, WALLS));
        g.cone.classList.toggle('dim', funkLeft > 0);
        g.body.setAttribute('cx', g.p.x.toFixed(2)); g.body.setAttribute('cy', g.p.y.toFixed(2));
        const eff = inLight ? reach : reach * darkFactor;
        const sees = inCone(dx, dy, g.p.x, g.p.y, g.p.dir, half, eff, WALLS);
        g.cone.classList.toggle('alert', sees);
        if (sees) seen = true;
      }
      for (const c of cams) {
        stepCam(c.c, dt);
        const off = c.c.off > 0;
        c.cone.setAttribute('points', off ? '' : conePoints(c.c.x, c.c.y, c.c.dir, 0.42, len + 6, WALLS));
        c.box.classList.toggle('off', off);
        const sees = !off && inCone(dx, dy, c.c.x, c.c.y, c.c.dir, 0.42, len + 6, WALLS);
        c.cone.classList.toggle('alert', sees);
        if (sees) seen = true;
        if (off && c.c.off < dt * 1.5) render();
      }
      if (seen) {
        seenTime += dt;
        alarm += dt * rate * (atCover ? 0.35 : 1);
        if (Math.random() < dt * 0.8) ariaSay.say(atCover ? pick(['Da guckt einer. Ich bin ein Busch. Ich bin ein Busch.', 'Nyra hält die Luft an. Ich auch.']) : pick(['DIE SEHEN UNS!', 'Raven, die Kamera! Mach was!', 'Scheiße, Licht!']));
      } else alarm = Math.max(0, alarm - dt * decay);
      if (alarm >= 1) { ctx.sfx('alarm'); end.finish(false); return false; }
      // Darstellung
      aria.setAttribute('cx', dx.toFixed(2)); aria.setAttribute('cy', (dy - 0.9).toFixed(2));
      nyra.setAttribute('cx', (dx - 1.8).toFixed(2)); nyra.setAttribute('cy', (dy + 1).toFixed(2));
      aria.classList.toggle('lit', inLight);
      alarmFill.style.width = `${clamp(alarm, 0, 1) * 100}%`;
      alarmEl.classList.toggle('hot', alarm > 0.6);
      host.setScore(`Ziel: ${PATH[Math.min(seg, PATH.length - 1)].name}`);
      host.setInfo(seen ? 'GESEHEN!' : funkLeft > 0 ? 'Funk läuft …' : moving ? 'unterwegs' : atCover ? 'in Deckung' : '');
      return true;
    });

    const won = await Promise.race([end.done, clock.done.then(() => false)]);
    end.finish(won);
    clock.stop();
    host.summary(`Störimpulse ${hacks} · Schüsse ${shotsFired} · gesehen ${seenTime.toFixed(1)} s`);
    host.summary(won
      ? 'Aria (Funk): „Wir sind drin. Nyra hat gelächelt, glaub ich. Oder es war das Licht.“ Vega klopft dir auf die Schulter: „Gute Augen.“'
      : alarm >= 1 ? 'Sirenen. Flutlicht überall. Aria (Funk): „Na super, Brücke! Plan B heißt RENNEN!“' : 'Nyras Abschirmung bricht zusammen. Nexus (Lautsprecher): „Alarm, jemand versucht, in mein System einzudringen.“');
    return won;
  },
};
