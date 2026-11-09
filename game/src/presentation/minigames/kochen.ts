// akt-kochen: Babettes Garküche (oder die Werkbank im Crew-Quartier). Zwei bis drei Gerichte, jedes aus Arbeitsschritten:
// Schnippeln (schnell tippen), Rühren (abwechselnd links/rechts), Hitze (im grünen Bereich stoppen), Zutat (richtige wählen).
// Kein Attribut-Einfluss (world.md §3.9). Stufe: mehr Schritte, schnellere Nadel, strengere Wertung.
import { h } from '../dom/dom';
import { choose, ending, meter, speaker } from './kit';
import type { MinigameDef, MinigameHost } from './types';
import { byLevel, clamp, gameButton, isAction, isLeft, isRight, pick, shuffle } from './util';

type Step =
  | { type: 'schnippeln'; label: string; taps: number }
  | { type: 'ruehren'; label: string; turns: number }
  | { type: 'hitze'; label: string }
  | { type: 'zutat'; label: string; right: string; wrong: string[] };

interface Recipe { name: string; steps: Step[] }

const RECIPES: Recipe[] = [
  { name: 'Bao-Dampfnudeln', steps: [
    { type: 'ruehren', label: 'Teig schlagen', turns: 12 },
    { type: 'zutat', label: 'Füllung', right: 'Synth-Schwein mit Lauch', wrong: ['Schmierfett', 'Katzenfutter „Edel“', 'Kaugummi'] },
    { type: 'hitze', label: 'Dampfkorb auf Temperatur' },
    { type: 'schnippeln', label: 'Frühlingszwiebeln hacken', taps: 14 },
  ] },
  { name: 'Synth-Nudeln „Unterstadt scharf“', steps: [
    { type: 'schnippeln', label: 'Chili zerhacken (nicht ins Auge fassen)', taps: 12 },
    { type: 'hitze', label: 'Wok glühend heiß' },
    { type: 'ruehren', label: 'Nudeln schwenken', turns: 14 },
    { type: 'zutat', label: 'Soße', right: 'Schwarze Bohnenpaste', wrong: ['Motoröl 10W-40', 'Spülmittel Zitrone', 'Ketchup aus der Oberstadt'] },
  ] },
  { name: 'Pilzsuppe aus dem Kanal', steps: [
    { type: 'zutat', label: 'Pilze', right: 'Kanalchampignons (leuchten nicht)', wrong: ['Kanalchampignons (leuchten)', 'Schimmel vom Brot', 'Plastikpilze, Deko'] },
    { type: 'schnippeln', label: 'Pilze in Scheiben', taps: 16 },
    { type: 'ruehren', label: 'Brühe rühren', turns: 12 },
    { type: 'hitze', label: 'Köcheln, nicht kochen' },
  ] },
  { name: 'Jakkos Eintopf', steps: [
    { type: 'schnippeln', label: 'Kartoffeln würfeln', taps: 15 },
    { type: 'zutat', label: 'Geheimzutat', right: 'Eine Prise Zimt', wrong: ['Eine Prise Schießpulver', 'Ein Socken', 'Rohrreiniger'] },
    { type: 'hitze', label: 'Topf auf mittlere Hitze' },
    { type: 'ruehren', label: 'Umrühren, damit nichts anbrennt', turns: 14 },
  ] },
];

const BABETTE_GOOD = ['So kocht man! Seit 2061 sag ich das.', 'Na also, Schätzchen. Das schmeckt nach Zuhause.', 'Wenn das so weitergeht, stell ich dich ein. Für ’nen Hungerlohn.'];
const BABETTE_BAD = ['Was ist DAS? Das isst nicht mal ein Rostzahn!', 'Kind, du kochst wie ein Toaster mit Liebeskummer.', 'Schmeckt nach Reue. Und nach Pfanne.'];

export const kochen: MinigameDef = {
  title: 'Kochen bei Babette',
  blurb: 'Babette Bao drückt dir eine Schürze in die Hand, die schon bessere Köche überlebt hat. „Hacken, rühren, nicht anbrennen lassen. Und wehe, du fasst meinen Wok falsch an.“',
  controls: ['Schnippeln: Leertaste/Tippen so schnell es geht', 'Rühren: ←/→ abwechselnd oder die beiden Knöpfe', 'Hitze: Leertaste/Tippen, wenn die Nadel im Grünen ist', 'Zutat: 1–4 oder antippen'],
  bonuses: () => ['Hier zählt nur Handwerk. Kein Attribut hilft.'],
  async run(host, ctx) {
    const level = ctx.level;
    const dishCount = level >= 4 ? 3 : 2;
    const stepCount = byLevel(level, [3, 3, 4, 4, 4]);
    const needle = byLevel(level, [0.75, 0.9, 1.05, 1.2, 1.4]);
    const greenWidth = byLevel(level, [0.22, 0.19, 0.16, 0.14, 0.12]);
    const threshold = byLevel(level, [0.5, 0.55, 0.6, 0.65, 0.7]);
    const stepTime = byLevel(level, [7, 6.5, 6, 5.5, 5]);
    const seconds = dishCount * stepCount * stepTime + 10;

    const kitchen = h('div', { class: 'kc-kitchen' });
    const card = h('div', { class: 'kc-card' });
    const work = h('div', { class: 'kc-work' });
    const babette = speaker('kc-babette', 'Babette');
    kitchen.append(card, work, babette.el);
    host.stage.append(h('div', { class: 'kc-wrap' }, kitchen));

    const end = ending();
    const clock = host.countdown(seconds);
    void clock.done.then(() => end.finish(false));
    const dishes = shuffle([...RECIPES]).slice(0, dishCount);
    const qualities: number[] = [];
    const report: string[] = [];
    babette.say('Erst Hände waschen. … Ach, egal. Los.');

    for (let d = 0; d < dishes.length && !end.over; d++) {
      const dish = dishes[d];
      const steps = dish.steps.slice(0, stepCount);
      card.textContent = '';
      card.append(h('div', { class: 'kc-dish' }, `${d + 1}/${dishes.length} · ${dish.name}`),
        h('ol', null, ...steps.map((s) => h('li', null, s.label, s.type === 'zutat' && level < 3 ? h('em', null, ` – ${s.right}`) : null))));
      const secret = steps.find((s): s is Extract<Step, { type: 'zutat' }> => s.type === 'zutat');
      if (secret && level >= 3) babette.say(`${secret.label} für ${dish.name}: ${secret.right}. Merk dir das, ich sag’s nicht zweimal.`);
      const stepQ: number[] = [];
      for (let i = 0; i < steps.length && !end.over; i++) {
        card.querySelectorAll('li').forEach((li, j) => { li.classList.toggle('now', j === i); li.classList.toggle('done', j < i); });
        work.textContent = '';
        const q = await runStep(host, ctx, work, steps[i], { needle, greenWidth, stepTime, level }, end);
        stepQ.push(q);
        host.pop(q >= 0.85 ? 'Perfekt!' : q >= 0.55 ? 'Gut' : q > 0.2 ? 'Naja …' : 'Verhunzt', q >= 0.85 ? 'gold' : q >= 0.55 ? 'good' : 'bad', 50, 30);
        ctx.sfx(q >= 0.55 ? 'cookie' : 'fail');
      }
      const dq = stepQ.reduce((a, b) => a + b, 0) / Math.max(1, stepQ.length);
      qualities.push(dq);
      report.push(`${dish.name}: ${Math.round(dq * 100)} %`);
      babette.say(dq >= threshold ? pick(BABETTE_GOOD) : pick(BABETTE_BAD));
      host.setScore(`Gerichte ${qualities.filter((q) => q >= threshold).length}/${dishes.length}`);
      if (!end.over) await host.wait(900);
    }
    clock.stop();
    const avg = qualities.length === dishes.length ? qualities.reduce((a, b) => a + b, 0) / qualities.length : 0;
    const won = avg >= threshold;
    end.finish(won);
    host.summary(report.length ? report.join(' · ') : 'Nichts fertig geworden.');
    host.summary(`Schnitt ${Math.round(avg * 100)} % (nötig ${Math.round(threshold * 100)} %).`);
    host.summary(won ? 'Babette probiert, schweigt, probiert nochmal. „… Nicht schlecht. Sag’s keinem.“' : 'Babette kippt es in den Eimer für die Kanalratten. Die Ratten zögern.');
    return won;
  },
};

interface StepOpts { needle: number; greenWidth: number; stepTime: number; level: number }

async function runStep(host: MinigameHost, ctx: Parameters<MinigameDef['run']>[1], work: HTMLElement, step: Step, opts: StepOpts, end: ReturnType<typeof ending>): Promise<number> {
  work.append(h('div', { class: 'kc-step' }, step.label));
  if (step.type === 'zutat') {
    const options = shuffle([step.right, ...step.wrong]);
    const row = h('div', { class: 'kc-options' });
    work.append(row);
    const timer = new Promise<number>((resolve) => { void host.wait(opts.stepTime * 1000).then(() => resolve(-1)); });
    const picked = await Promise.race([choose(host, row, options), timer]);
    if (picked < 0) return 0;
    return options[picked] === step.right ? 1 : 0;
  }
  return new Promise<number>((resolve) => {
    let done = false;
    const finish = (q: number) => { if (!done) { done = true; resolve(clamp(q, 0, 1)); } };
    let t = 0;
    if (step.type === 'schnippeln') {
      const bar = meter('kc-meter', 'Hacken!');
      let count = 0;
      const board = h('div', { class: 'kc-board' }, h('div', { class: 'kc-knife' }));
      const tap = () => {
        if (done) return;
        count++;
        board.classList.remove('chop'); void board.offsetWidth; board.classList.add('chop');
        ctx.sfx('step');
        bar.set(count / step.taps);
        if (count >= step.taps) finish(1 - Math.max(0, t - step.taps * 0.18) / opts.stepTime);
      };
      board.addEventListener('pointerdown', (event) => { event.preventDefault(); tap(); });
      work.append(board, bar.el);
      host.onKey((event, down) => { if (down && !event.repeat && isAction(event.code)) tap(); });
      host.frame((dt) => {
        if (done || end.over) { finish(0); return false; }
        t += dt;
        if (t >= opts.stepTime) { finish((count / step.taps) * 0.6); return false; }
        return true;
      });
    } else if (step.type === 'ruehren') {
      const bar = meter('kc-meter', 'Rühren!');
      let count = 0;
      let last: 'l' | 'r' | null = null;
      const pot = h('div', { class: 'kc-pot' }, h('i', { class: 'kc-spoon' }));
      const stir = (side: 'l' | 'r') => {
        if (done) return;
        if (side === last) { pot.classList.add('slosh'); setTimeout(() => pot.classList.remove('slosh'), 200); return; }
        last = side;
        count++;
        pot.style.setProperty('--turn', `${count * 45}deg`);
        bar.set(count / step.turns);
        if (count >= step.turns) finish(1 - Math.max(0, t - step.turns * 0.22) / opts.stepTime);
      };
      const left = gameButton('◀ links', () => stir('l'), 'kc-stir');
      const right = gameButton('rechts ▶', () => stir('r'), 'kc-stir');
      work.append(pot, bar.el, h('div', { class: 'mg-toolbar' }, left, right));
      host.onKey((event, down) => {
        if (!down || event.repeat) return;
        if (isLeft(event.code)) stir('l');
        else if (isRight(event.code)) stir('r');
      });
      host.frame((dt) => {
        if (done || end.over) { finish(0); return false; }
        t += dt;
        if (t >= opts.stepTime) { finish((count / step.turns) * 0.6); return false; }
        return true;
      });
    } else {
      const gauge = h('div', { class: 'kc-gauge' });
      const green = h('div', { class: 'kc-green' });
      const needleEl = h('div', { class: 'kc-needle' });
      const center = 0.3 + Math.random() * 0.4;
      green.style.left = `${(center - opts.greenWidth / 2) * 100}%`;
      green.style.width = `${opts.greenWidth * 100}%`;
      gauge.append(green, needleEl);
      const press = gameButton('JETZT!', () => stop(), 'mg-big');
      work.append(h('div', { class: 'kc-flame' }), gauge, h('div', { class: 'mg-toolbar' }, press));
      let p = 0;
      const stop = () => {
        if (done) return;
        const dist = Math.abs(p - center);
        const q = dist <= opts.greenWidth / 2 ? 1 - (dist / (opts.greenWidth / 2)) * 0.25 : clamp(1 - dist * 3.2, 0, 0.5);
        needleEl.classList.add('stopped');
        finish(q);
      };
      host.onKey((event, down) => { if (down && !event.repeat && isAction(event.code)) stop(); });
      gauge.addEventListener('pointerdown', (event) => { event.preventDefault(); stop(); });
      host.frame((dt) => {
        if (done || end.over) { finish(0); return false; }
        t += dt;
        const x = (t * opts.needle) % 2;
        p = x < 1 ? x : 2 - x;
        needleEl.style.left = `${p * 100}%`;
        if (t >= opts.stepTime) { finish(0.1); return false; }
        return true;
      });
    }
  });
}
