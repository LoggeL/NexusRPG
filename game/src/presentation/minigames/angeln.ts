// akt-angeln: Auswerfen, auf den Biss warten, anschlagen, dann den Fang im Kescherfenster halten (Halten = Fenster steigt).
// Reflexe: größeres Fenster, längeres Bissfenster. `angel-profi` (+30 % seltene Fänge), `magnetangel` (Metall).
// Nachts leuchten Algen; Schrott-Fänge (Dose, Treibholz, Glitzerschrott) kommen als Zusatzeffekte ins Gepäck.
import type { Effect, ItemId } from '../../modules/contracts';
import { h } from '../dom/dom';
import { ending, holdInput, meter, speaker } from './kit';
import type { MinigameDef } from './types';
import { byLevel, clamp, pick } from './util';

interface Catch { name: string; weight: number; rare?: boolean; junk?: boolean; item?: ItemId; speed: number; jitter: number; metal?: boolean }

const FISH: Catch[] = [
  { name: 'Rostbarsch', weight: 6, speed: 0.55, jitter: 0.5 },
  { name: 'Ölaal', weight: 4, speed: 0.75, jitter: 0.8 },
  { name: 'Dreiaugen-Hering', weight: 4, speed: 0.6, jitter: 0.6 },
  { name: 'Neon-Makrele', weight: 2, rare: true, speed: 0.95, jitter: 1.0 },
  { name: 'Hafenkaiser (Monsterwels)', weight: 1, rare: true, speed: 1.15, jitter: 1.25 },
  { name: 'rostige Dose', weight: 3, junk: true, item: 'rostige-dose', speed: 0.2, jitter: 0.15 },
  { name: 'Treibholz', weight: 2, junk: true, item: 'treibholz', speed: 0.3, jitter: 0.2 },
];
const METAL: Catch = { name: 'Glitzerschrott', weight: 3, junk: true, item: 'glitzerschrott', speed: 0.35, jitter: 0.3, metal: true };
const ALGAE: Catch = { name: 'Leuchtalgen-Qualle', weight: 2, rare: true, speed: 0.85, jitter: 1.1 };

export const angeln: MinigameDef = {
  title: 'Angeln',
  blurb: 'Haken rein ins Hafenwasser, das nach Diesel und Geheimnissen riecht. Warte auf den Biss, schlag an und halt das Biest im Kescherfenster, bis es aufgibt.',
  controls: ['Leertaste / Klicken / Tippen: auswerfen und anschlagen', 'Gedrückt halten: Fenster steigt, loslassen: Fenster sinkt', 'Fisch im Fenster halten, bis der Fangbalken voll ist'],
  bonuses(ctx) {
    const lines = [`Reflexe ${ctx.attr('reflexe')}: Fenster +${Math.round(ctx.edge('reflexe') * 40)} %, Bissfenster +${Math.round(ctx.edge('reflexe') * 60)} %`];
    if (ctx.has({ item: 'angel-profi' })) lines.push('Profi-Angel: +30 % seltene Fänge');
    if (ctx.has({ item: 'magnetangel' })) lines.push('Magnetangel: zieht auch Metall');
    return lines;
  },
  async run(host, ctx) {
    const level = ctx.level;
    const edge = ctx.edge('reflexe');
    const need = byLevel(level, [2, 2, 3, 3, 4]);
    const seconds = byLevel(level, [70, 70, 80, 85, 90]);
    const zoneSize = byLevel(level, [0.34, 0.3, 0.26, 0.22, 0.19]) * (1 + edge * 0.4);
    const biteWindow = byLevel(level, [1.1, 0.95, 0.85, 0.75, 0.65]) * (1 + edge * 0.6);
    const fishBoost = byLevel(level, [0.8, 0.9, 1.0, 1.12, 1.25]);
    const profi = ctx.has({ item: 'angel-profi' });
    const magnet = ctx.has({ item: 'magnetangel' });
    const night = ctx.has({ time: 'nacht' });
    const pool: Catch[] = [...FISH.map((f) => ({ ...f, weight: f.rare && profi ? f.weight * 1.3 : f.weight })), ...(magnet ? [METAL] : []), ...(night ? [ALGAE] : [])];

    const water = h('div', { class: `ag-water${night ? ' night' : ''}` });
    const line = h('div', { class: 'ag-line' });
    const bobber = h('div', { class: 'ag-bobber' });
    const splash = h('div', { class: 'ag-splash' });
    const column = h('div', { class: 'ag-column' });
    const zone = h('div', { class: 'ag-zone' });
    const fishEl = h('div', { class: 'ag-fish' }, '><>');
    column.append(zone, fishEl);
    const progress = meter('ag-progress', 'Fang');
    const status = h('div', { class: 'ag-status' });
    const bubble = speaker('ag-henk', 'Henk');
    water.append(line, bobber, splash, column, status, bubble.el);
    host.stage.append(h('div', { class: 'ag-wrap' }, water, progress.el));
    zone.style.height = `${zoneSize * 100}%`;
    const input = holdInput(host, water);

    const end = ending();
    let caught = 0;
    const bag: string[] = [];
    let phase: 'cast' | 'wait' | 'bite' | 'reel' | 'pause' = 'cast';
    let timer = 0;
    let zoneY = 0.3, zoneV = 0;
    let fishY = 0.5, fishTarget = 0.5, fishTimer = 0;
    let fill = 0.25;
    let current: Catch = FISH[0];
    let lastPressed = 0;

    const setStatus = (text: string) => { status.textContent = text; };
    const rollCatch = (): Catch => {
      const total = pool.reduce((s, c) => s + c.weight, 0);
      let r = Math.random() * total;
      for (const c of pool) { r -= c.weight; if (r <= 0) return c; }
      return pool[0];
    };
    const show = (el: HTMLElement, on: boolean) => el.classList.toggle('on', on);
    const reset = () => {
      phase = 'cast';
      show(bobber, false); show(line, false); show(column, false); show(progress.el, false);
      setStatus('Leertaste oder Tippen: auswerfen');
    };
    reset();
    bubble.say(pick(['Nicht so zappeln, sonst beißen nur die Ratten.', 'Wasser ist ruhig. Die Fische nicht.', 'Erst warten, dann reißen. Wie beim Steuerbescheid.']));

    host.setScore(`Fänge 0/${need}`);
    host.frame((dt) => {
      if (end.over) return false;
      const pressedNow = input.pressed !== lastPressed;
      lastPressed = input.pressed;
      if (phase === 'cast') {
        if (pressedNow) {
          phase = 'wait';
          timer = 1.6 + Math.random() * 3.2;
          show(bobber, true); show(line, true);
          bobber.classList.remove('dip');
          ctx.sfx('switch');
          setStatus('Warten … nicht zucken.');
        }
      } else if (phase === 'wait') {
        timer -= dt;
        if (pressedNow) { setStatus('Zu früh! Fisch verscheucht.'); host.pop('Zu früh!', 'bad', 50, 40); ctx.sfx('fail'); phase = 'pause'; timer = 1.1; }
        else if (timer <= 0) { phase = 'bite'; timer = biteWindow; bobber.classList.add('dip'); splash.classList.remove('go'); void splash.offsetWidth; splash.classList.add('go'); ctx.sfx('hit'); setStatus('BISS! JETZT!'); }
      } else if (phase === 'bite') {
        timer -= dt;
        if (pressedNow) {
          current = rollCatch();
          phase = 'reel';
          fill = 0.3; zoneY = 0.35; zoneV = 0; fishY = 0.5; fishTarget = 0.5; fishTimer = 0;
          fishEl.textContent = current.junk ? (current.metal ? '⚙' : current.item === 'treibholz' ? '═╬═' : '[≡]') : current.rare ? '><(((°>' : '><>';
          fishEl.classList.toggle('rare', !!current.rare);
          show(column, true); show(progress.el, true); bobber.classList.remove('dip');
          setStatus(current.junk ? 'Schwer … aber zappelt nicht.' : current.rare ? 'Der zieht wie Hölle!' : 'Dran! Halt ihn im Fenster!');
          ctx.sfx('engine');
        } else if (timer <= 0) { bobber.classList.remove('dip'); setStatus('Weg. Köder geklaut.'); host.pop('Verpasst', 'bad', 50, 40); phase = 'pause'; timer = 1.1; }
      } else if (phase === 'reel') {
        // Kescherfenster: Halten hebt, Loslassen senkt (mit Trägheit).
        zoneV += (input.held ? 2.6 : -2.2) * dt;
        zoneV = clamp(zoneV, -1.2, 1.2);
        zoneY += zoneV * dt;
        if (zoneY <= 0) { zoneY = 0; zoneV = Math.max(0, zoneV) * -0.2; }
        if (zoneY >= 1 - zoneSize) { zoneY = 1 - zoneSize; zoneV = Math.min(0, zoneV) * -0.2; }
        fishTimer -= dt;
        if (fishTimer <= 0) {
          fishTimer = (0.5 + Math.random() * 1.3) / (current.jitter * fishBoost + 0.2);
          fishTarget = clamp(fishY + (Math.random() - 0.5) * current.jitter * fishBoost * 1.1, 0.04, 0.96);
        }
        fishY += clamp(fishTarget - fishY, -1, 1) * Math.min(1, dt * 3.2 * current.speed * fishBoost);
        const inside = fishY >= zoneY && fishY <= zoneY + zoneSize;
        fill += (inside ? 0.32 : -0.24 * (current.rare ? 1.15 : 1)) * dt;
        zone.classList.toggle('hit', inside);
        // Darstellung: 0 = unten
        zone.style.bottom = `${zoneY * 100}%`;
        fishEl.style.bottom = `calc(${fishY * 100}% - 0.6em)`;
        progress.set(fill);
        if (fill >= 1) {
          caught += current.junk ? 0 : 1;
          bag.push(current.name);
          if (current.item) host.extra({ give: current.item } as Effect);
          host.pop(current.junk ? `${current.name} (Schrott)` : `${current.name}!`, current.rare ? 'gold' : current.junk ? 'info' : 'good', 50, 30);
          ctx.sfx(current.junk ? 'pickup' : 'success');
          if (current.junk) bubble.say(pick(['Auch Müll will nach Hause.', 'Glückwunsch. Du hast die Stadt sauberer gemacht.', 'Kein Fisch, aber ehrliche Arbeit.']));
          else if (current.rare) bubble.say(pick(['Heilige Makrele! Den rahm ich ein.', 'So einen hab ich zuletzt 2071 gesehen. Im Fernsehen.']));
          host.setScore(`Fänge ${caught}/${need}`);
          if (caught >= need) { end.finish(true); return false; }
          reset();
        } else if (fill <= 0) {
          host.pop('Leine gerissen!', 'bad', 50, 40);
          ctx.sfx('fail');
          bubble.say(pick(['Der hat dir gerade den Mittelfinger gezeigt. Mit der Flosse.', 'Mehr Gefühl, Mensch. Das ist ein Fisch, kein Türsteher.']));
          setStatus('Abgehauen.');
          show(column, false); show(progress.el, false);
          phase = 'pause'; timer = 1.2;
        }
      } else if (phase === 'pause') {
        timer -= dt;
        if (timer <= 0) reset();
      }
      return true;
    });

    const clock = host.countdown(seconds);
    const result = await Promise.race([end.done, clock.done.then(() => null)]);
    end.finish(result ?? false);
    const won = result === true;
    host.summary(bag.length ? `Im Eimer: ${bag.join(', ')}.` : 'Der Eimer bleibt leer. Die Fische lachen.');
    host.summary(won ? 'Henk nickt anerkennend: „Du hast Gefühl in den Fingern. Und Fischschleim.“' : 'Henk: „Morgen wieder. Die Fische vergessen schnell, Menschen nicht.“');
    return won;
  },
};
