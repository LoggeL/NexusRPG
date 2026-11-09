// akt-gaertnern: Säen, gießen, ernten (world.md §3.9) im Dachgarten des Crew-Quartiers oder auf dem eigenen Feld am
// `aussiedlerhof`. Beete im Raster; Werkzeug wählen (Samen, Kanne, Hände), Pflanzen nur mit Wasser wachsen lassen,
// reif ernten, bevor sie faulen, Blechkäfer verscheuchen. Die Kanne ist irgendwann leer – an der Regentonne nachfüllen.
// Keine Attribute (world.md). Zusatzeffekte: `frisches-gemuese` (je zwei Gemüse eins, max. 3), `blumensamen` (je Blume, max. 2).
// `label` mit „Hof/Feld/Marla“ → Marla kommentiert, sonst Dante vom Liegestuhl im Dachgarten.
import type { Effect } from '../../modules/contracts';
import './minigames3.css';
import { h } from '../dom/dom';
import { ending, speaker } from './kit';
import type { MinigameDef } from './types';
import { byLevel, clamp, digitOf, gameButton, isAction, isDown, isLeft, isRight, isUp, pick } from './util';

type Tool = 'samen' | 'kanne' | 'hand';
type State = 'leer' | 'wachsen' | 'reif' | 'faul' | 'welk';
interface Plot { state: State; crop: Crop | null; growth: number; water: number; dry: number; ripe: number; bug: number; el: HTMLElement; icon: HTMLElement; waterEl: HTMLElement }
interface Crop { name: string; id: string; flower: boolean; speed: number }
const CROPS: Crop[] = [
  { name: 'Möhre', id: 'moehre', flower: false, speed: 1 },
  { name: 'Tomate', id: 'tomate', flower: false, speed: 0.85 },
  { name: 'Kartoffel', id: 'kartoffel', flower: false, speed: 1.1 },
  { name: 'Radieschen', id: 'radieschen', flower: false, speed: 1.35 },
  { name: 'Sonnenblume', id: 'blume', flower: true, speed: 0.9 },
];

export const gaertnern: MinigameDef = {
  title: 'Gärtnern',
  blurb: 'Ein paar Kisten Erde, eine verbeulte Kanne, Samen aus dem Aussiedlerhof. In der Stadt wächst sonst nur Schimmel. Säen, gießen, ernten – und die verdammten Blechkäfer von den Blättern hauen.',
  controls: ['Werkzeug: 1 Samen · 2 Kanne · 3 Hände (oder Knöpfe)', 'Beet antippen = Werkzeug benutzen · Tastatur: Pfeile + Leertaste', 'R / „Regentonne“: Kanne auffüllen · Käfer mit den Händen verscheuchen, Welkes rausreißen'],
  bonuses() { return ['Keine Attribute – nur Geduld und ein grüner Daumen']; },
  async run(host, ctx) {
    const level = ctx.level;
    const [cols, rows] = byLevel<[number, number]>(level, [[3, 2], [3, 2], [4, 2], [4, 3], [4, 3]]);
    const goal = byLevel(level, [5, 6, 8, 10, 12]);
    const seconds = byLevel(level, [75, 80, 85, 90, 95]);
    const drain = byLevel(level, [0.11, 0.13, 0.15, 0.17, 0.19]);
    const growRate = 0.12;
    const ripeWindow = byLevel(level, [9, 8, 7, 6, 5]);
    const bugEvery = byLevel(level, [14, 11, 9, 7, 5.5]);
    const canMax = byLevel(level, [8, 7, 6, 6, 5]);
    const hof = /hof|feld|marla/i.test(ctx.label ?? '');

    const field = h('div', { class: `gt-field${hof ? ' hof' : ''}` });
    field.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    const voice = speaker('gt-voice', hof ? 'Marla' : 'Dante (vom Liegestuhl)');
    const plots: Plot[] = [];
    for (let i = 0; i < cols * rows; i++) {
      const icon = h('span', { class: 'gt-icon' });
      const waterEl = h('i', { class: 'gt-water' });
      const el = h('div', { class: 'gt-plot' }, icon, h('b', { class: 'gt-water-bar' }, waterEl));
      field.append(el);
      plots.push({ state: 'leer', crop: null, growth: 0, water: 0, dry: 0, ripe: 0, bug: 0, el, icon, waterEl });
    }
    const toolButtons = new Map<Tool, HTMLButtonElement>();
    const canLabel = h('span', { class: 'gt-can' });
    const toolbar = h('div', { class: 'mg-toolbar' });
    (['samen', 'kanne', 'hand'] as Tool[]).forEach((t, i) => {
      const b = gameButton(`${i + 1} ${t === 'samen' ? 'Samen' : t === 'kanne' ? 'Kanne' : 'Hände'}`, () => { tool = t; render(); });
      toolButtons.set(t, b);
      toolbar.append(b);
    });
    const refillButton = gameButton('Regentonne [R]', () => refill());
    toolbar.append(refillButton, canLabel);
    host.stage.append(h('div', { class: 'gt-wrap' }, field, voice.el), toolbar);

    const end = ending();
    let tool: Tool = 'samen', cursor = 0, can = canMax, refilling = 0;
    let harvested = 0, veg = 0, flowers = 0, rotten = 0, wilted = 0, bugsShooed = 0;
    let bugTimer = bugEvery * 0.8;
    let lastSay = 0;
    const say = (text: string) => { const now = performance.now(); if (now - lastSay > 2500) { lastSay = now; voice.say(text); } };

    const render = () => {
      toolButtons.forEach((b, t) => b.classList.toggle('on', t === tool));
      canLabel.textContent = refilling > 0 ? 'Kanne füllt sich …' : `Kanne ${'▮'.repeat(can)}${'▯'.repeat(canMax - can)}`;
      plots.forEach((p, i) => {
        p.el.className = `gt-plot ${p.state}${p.bug > 0 ? ' bug' : ''}${!ctx.touch && i === cursor ? ' cursor' : ''}${p.state === 'wachsen' && p.water < 0.25 ? ' thirsty' : ''}`;
        p.icon.className = `gt-icon${p.crop && (p.state === 'reif' || p.state === 'wachsen') ? ` c-${p.crop.id}` : ''}`;
        p.icon.textContent = p.state === 'leer' ? '' : p.state === 'reif' ? p.crop!.name : p.state === 'faul' ? 'faul' : p.state === 'welk' ? 'welk' : '';
        p.icon.style.setProperty('--g', p.state === 'wachsen' ? p.growth.toFixed(2) : '1');
        p.waterEl.style.width = `${clamp(p.water, 0, 1) * 100}%`;
      });
      host.setScore(`Geerntet ${harvested}/${goal}`);
    };
    const refill = () => {
      if (end.over || refilling > 0 || can >= canMax) return;
      refilling = 1.6; ctx.sfx('pickup'); render();
    };
    const popAt = (p: Plot, text: string, tone: 'good' | 'gold' | 'bad') => {
      const r = p.el.getBoundingClientRect(), f = field.getBoundingClientRect();
      host.pop(text, tone, ((r.left + r.width / 2 - f.left) / Math.max(1, f.width)) * 100, ((r.top - f.top) / Math.max(1, f.height)) * 100);
    };
    const use = (i: number) => {
      if (end.over) return;
      const p = plots[i];
      cursor = i;
      if (p.bug > 0) {
        if (tool === 'hand') { p.bug = 0; bugsShooed++; ctx.sfx('hit'); popAt(p, 'Weg da!', 'good'); say(pick(['Hau ab, du Blechlaus!', 'Käfer weg. Gut so.'])); }
        else say('Da sitzt ein Käfer! Mit den Händen weg damit!');
        render(); return;
      }
      if (tool === 'samen') {
        if (p.state === 'leer') { p.state = 'wachsen'; p.crop = pick(CROPS); p.growth = 0; p.water = 0.35; p.dry = 0; ctx.sfx('step'); }
        else if (p.state === 'reif') say('Die ist reif! Ernten, nicht drübersäen!');
        else if (p.state === 'faul' || p.state === 'welk') say('Erst das Tote raus. Mit den Händen.');
      } else if (tool === 'kanne') {
        if (refilling > 0) { say('Die Kanne füllt sich noch.'); return; }
        if (can <= 0) { say('Kanne leer. Regentonne!'); ctx.sfx('fail'); return; }
        if (p.state === 'wachsen' || p.state === 'leer') {
          can--;
          if (p.state === 'wachsen' && p.water > 0.85) { p.growth = Math.max(0, p.growth - 0.15); say(pick(['Du ersäufst sie ja!', 'Das ist ein Beet, kein Aquarium.'])); }
          p.water = 1; ctx.sfx('switch');
        }
      } else {
        if (p.state === 'reif') {
          harvested++;
          if (p.crop!.flower) flowers++; else veg++;
          ctx.sfx('coin');
          popAt(p, `+1 ${p.crop!.name}`, 'gold');
          p.state = 'leer'; p.crop = null; p.water = 0;
          if (harvested >= goal) end.finish(true);
        } else if (p.state === 'faul' || p.state === 'welk') { p.state = 'leer'; p.crop = null; ctx.sfx('step'); }
        else if (p.state === 'wachsen') say(pick(['Finger weg, die ist noch nicht so weit.', 'Ziehen hilft nicht. Wachsen dauert.']));
      }
      render();
    };
    plots.forEach((p, i) => p.el.addEventListener('pointerdown', (e) => { e.preventDefault(); use(i); }));
    host.onKey((e, down) => {
      if (!down || e.repeat) return;
      const d = digitOf(e.code);
      if (d >= 1 && d <= 3) { tool = (['samen', 'kanne', 'hand'] as Tool[])[d - 1]; render(); return; }
      if (e.code === 'KeyR') { refill(); return; }
      if (isLeft(e.code)) cursor = (cursor % cols === 0) ? cursor + cols - 1 : cursor - 1;
      else if (isRight(e.code)) cursor = (cursor % cols === cols - 1) ? cursor - cols + 1 : cursor + 1;
      else if (isUp(e.code)) cursor = (cursor - cols + plots.length) % plots.length;
      else if (isDown(e.code)) cursor = (cursor + cols) % plots.length;
      else if (isAction(e.code)) { use(cursor); return; }
      render();
    });

    render();
    say(hof ? 'Erde ist hier draußen mehr wert als Wasser. Fast. Mach nix kaputt.' : 'Ich lieg hier und überwache. Das ist auch Arbeit.');
    const clock = host.countdown(seconds);
    let tick = 0;
    host.frame((dt) => {
      if (end.over) return false;
      if (refilling > 0) { refilling -= dt; if (refilling <= 0) { can = canMax; ctx.sfx('success'); } }
      bugTimer -= dt;
      if (bugTimer <= 0) {
        bugTimer = bugEvery * (0.7 + Math.random() * 0.6);
        const targets = plots.filter((p) => (p.state === 'wachsen' || p.state === 'reif') && p.bug <= 0);
        if (targets.length) { pick(targets).bug = 1; ctx.sfx('alarm'); say(pick(['Blechkäfer! Die fressen alles, auch Schrauben!', 'Da krabbelt was. Und es ist nicht süß.'])); }
      }
      for (const p of plots) {
        if (p.state === 'wachsen') {
          p.water = Math.max(0, p.water - drain * dt);
          if (p.bug > 0) p.growth = Math.max(0, p.growth - dt * 0.05);
          else if (p.water > 0) p.growth += growRate * p.crop!.speed * dt;
          if (p.water <= 0) { p.dry += dt; if (p.dry > 4) { p.state = 'welk'; wilted++; say('Vertrocknet. Die hatte Familie.'); } } else p.dry = 0;
          if (p.growth >= 1) { p.state = 'reif'; p.ripe = ripeWindow; ctx.sfx('pickup'); }
        } else if (p.state === 'reif') {
          p.ripe -= dt * (p.bug > 0 ? 2 : 1);
          if (p.ripe <= 0) { p.state = 'faul'; p.bug = 0; rotten++; say(pick(['Verfault. Riecht wie die Kanalisation.', 'Zu spät. Die ist jetzt Kompost.'])); }
        }
      }
      tick += dt;
      if (tick > 0.15) { tick = 0; render(); }
      return true;
    });

    const won = await Promise.race([end.done, clock.done.then(() => false)]);
    end.finish(won);
    clock.stop();
    const loot: Effect[] = [];
    const gemuese = Math.min(3, Math.floor(veg / 2));
    if (gemuese > 0) loot.push({ give: 'frisches-gemuese', qty: gemuese });
    if (flowers > 0) loot.push({ give: 'blumensamen', qty: Math.min(2, flowers) });
    host.extra(...loot);
    host.summary(`Geerntet ${harvested}/${goal} (Gemüse ${veg}, Blumen ${flowers}) · verfault ${rotten} · vertrocknet ${wilted} · Käfer ${bugsShooed}`);
    if (loot.length) host.summary(`Ins Gepäck: ${gemuese ? `${gemuese}× Frisches Gemüse` : ''}${gemuese && flowers ? ', ' : ''}${flowers ? `${Math.min(2, flowers)}× Blumensamen` : ''}`);
    host.summary(won
      ? (hof ? 'Marla nickt. Einmal. Bei Marla ist das eine Umarmung.' : 'Dante öffnet ein Auge: „Ich wusste, du kannst was Sinnvolles. Wer hätte das gedacht. Ich nicht.“')
      : (hof ? 'Marla seufzt in den Wind: „Erde verzeiht. Ich nicht so schnell.“' : 'Dante, ohne aufzusehen: „Pflanzen sind wie Menschen. Du hast sie beide hängen lassen.“'));
    return won;
  },
};
