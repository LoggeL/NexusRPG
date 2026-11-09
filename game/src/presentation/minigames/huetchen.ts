// akt-huetchenspiel: Wett-Willis Hütchen auf dem Schrottmarkt. Kugel verfolgen, richtiges Hütchen wählen, zwei von drei Runden.
// Reflexe: langsameres Mischen. Willi schummelt ab Stufe 3 manchmal (Kugel im Ärmel) – wer `gc-151` schafft oder Reflexe 7+
// hat, sieht es und kann „Ärmel!“ rufen.
import { h } from '../dom/dom';
import type { MinigameDef } from './types';
import { byLevel, digitOf, gameButton, isAction, isLeft, isRight, pick, randInt } from './util';

const WILLI_SHUFFLE = ['Schön gucken, Schätzchen …', 'Links, rechts, Kugel weg – Spaß!', 'Die Hand ist schneller als dein Hirn, Kumpel.', 'Wer blinzelt, zahlt!', 'Na, schon schwindelig?'];
const WILLI_WIN = ['Ha! Daneben, du Trantüte!', 'Willi gewinnt, Willi lacht!', 'Augen auf beim Hütchenkauf!'];
const WILLI_LOSE = ['Glück. Reines, dreckiges Glück.', 'Pfft. Anfängerdusel.', 'Na schön, du Fuchs.'];

export const huetchen: MinigameDef = {
  title: 'Wett-Willis Hütchen',
  blurb: '„Drei Hütchen, eine Kugel, null Garantie!“ Wett-Willi mischt schneller, als ein Bulle Schmiergeld zählt. Behalt die Kugel im Auge – zwei von drei Runden gewinnen.',
  controls: ['Hütchen anklicken/antippen', 'Tasten 1–4 oder ←/→ + Leertaste', 'X: „Ärmel!“ – nur wenn du ihn erwischt hast'],
  bonuses(ctx) {
    const lines = [`Reflexe ${ctx.attr('reflexe')}: Willi mischt ${Math.round(ctx.edge('reflexe') * 50)} % langsamer`];
    if (ctx.checkOk('gc-151') || ctx.attr('reflexe') >= 7) lines.push('Du kennst Willis Ärmeltrick.');
    return lines;
  },
  async run(host, ctx) {
    const level = ctx.level;
    const n = level >= 4 ? 4 : 3;
    const swapMs = byLevel(level, [560, 470, 390, 320, 270]) * (1 + ctx.edge('reflexe') * 0.5);
    const swaps = byLevel(level, [5, 7, 9, 11, 13]);
    const canSee = ctx.checkOk('gc-151') || ctx.attr('reflexe') >= 7;
    const trickRound = level >= 3 && Math.random() < (canSee ? 0.7 : 0.4) ? randInt(0, 2) : -1;

    const table = h('div', { class: 'hs-table' });
    const willi = h('div', { class: 'hs-willi' });
    const sleeve = gameButton('ÄRMEL! [X]', () => callSleeve(), 'hs-sleeve');
    sleeve.hidden = true;
    host.stage.append(h('div', { class: 'hs-wrap' }, willi, table), h('div', { class: 'mg-toolbar' }, sleeve));
    const say = (text: string) => { willi.textContent = text; willi.classList.remove('show'); void willi.offsetWidth; willi.classList.add('show'); };

    // slotOf[cup] = Platz, an dem das Hütchen gerade steht
    const slotOf = Array.from({ length: n }, (_, i) => i);
    const cups = Array.from({ length: n }, (_, i) => {
      const cup = h('div', { class: 'hs-cup', 'data-cup': String(i) }, h('div', { class: 'hs-ball' }), h('div', { class: 'hs-shell' }), h('span', { class: 'hs-key' }, String(i + 1)));
      cup.style.setProperty('--dur', `${swapMs}ms`);
      table.append(cup);
      return cup;
    });
    const position = () => cups.forEach((cup, i) => { cup.style.left = `${((slotOf[i] + 0.5) / n) * 100}%`; });
    position();

    let wins = 0, losses = 0;
    let ballCup = 0;
    let choosing = false;
    let cursor = 0;
    let choose: ((slot: number | 'sleeve') => void) | null = null;
    const callSleeve = () => { if (choosing && choose) choose('sleeve'); };
    const markCursor = () => cups.forEach((cup, i) => cup.classList.toggle('cursor', choosing && slotOf[i] === cursor && !ctx.touch));

    cups.forEach((cup, i) => cup.addEventListener('pointerdown', (event) => { event.preventDefault(); if (choosing && choose) choose(slotOf[i]); }));
    host.onKey((event, down) => {
      if (!down || event.repeat || !choosing || !choose) return;
      const digit = digitOf(event.code);
      if (digit >= 1 && digit <= n) choose(digit - 1);
      else if (isLeft(event.code)) { cursor = (cursor + n - 1) % n; markCursor(); }
      else if (isRight(event.code)) { cursor = (cursor + 1) % n; markCursor(); }
      else if (isAction(event.code)) choose(cursor);
      else if (event.code === 'KeyX') callSleeve();
    });

    const lift = async (cupIndex: number, ms = 900) => {
      cups[cupIndex].classList.add('lift');
      await host.wait(ms);
      cups[cupIndex].classList.remove('lift');
      await host.wait(260);
    };

    for (let round = 0; round < 3 && wins < 2 && losses < 2; round++) {
      host.setScore(`Runde ${round + 1}/3 · ${wins}:${losses}`);
      host.setInfo('');
      ballCup = randInt(0, n - 1);
      cups.forEach((cup, i) => cup.classList.toggle('has-ball', i === ballCup));
      say(round === 0 ? 'Hier ist sie, die kleine Schönheit …' : pick(['Neue Runde, neues Pech!', 'Noch mal? Gern, Opferlamm.']));
      await lift(ballCup, 1000);
      const trick = round === trickRound;
      const trickAt = trick ? randInt(Math.floor(swaps / 3), swaps - 2) : -1;
      for (let s = 0; s < swaps + round; s++) {
        if (s === 2) say(pick(WILLI_SHUFFLE));
        if (s === trickAt) {
          cups[ballCup].classList.remove('has-ball');
          ballCup = -1;
          if (canSee) { host.setInfo('Moment … Willis Ärmel beult sich.'); host.pop('Ärmel!?', 'gold', 50, 12); }
        }
        // Zwei Plätze tauschen (auf leichten Stufen eher Nachbarn)
        const a = randInt(0, n - 1);
        let b = level <= 2 ? (a + (Math.random() < 0.5 ? 1 : n - 1)) % n : randInt(0, n - 2);
        if (level > 2 && b >= a) b++;
        const cupA = slotOf.indexOf(a), cupB = slotOf.indexOf(b);
        slotOf[cupA] = b;
        slotOf[cupB] = a;
        cups[cupA].classList.remove('arc-up', 'arc-down'); cups[cupB].classList.remove('arc-up', 'arc-down');
        void cups[cupA].offsetWidth;
        cups[cupA].classList.add('arc-up');
        cups[cupB].classList.add('arc-down');
        position();
        ctx.sfx('step');
        await host.wait(swapMs + 50);
      }
      cups.forEach((cup) => cup.classList.remove('arc-up', 'arc-down'));
      say('Na? Wo isse?');
      choosing = true;
      cursor = Math.floor(n / 2);
      sleeve.hidden = !(trick && canSee);
      markCursor();
      const picked = await new Promise<number | 'sleeve'>((resolve) => { choose = resolve; });
      choosing = false;
      choose = null;
      sleeve.hidden = true;
      markCursor();
      if (picked === 'sleeve') {
        if (ballCup === -1) {
          wins++;
          ctx.sfx('success');
          say('Äh … die muss mir … reingefallen sein. Hehe.');
          host.pop('Erwischt, Willi!', 'gold', 50, 30);
          host.summary('Du hast Willis Ärmeltrick auffliegen lassen.');
        } else {
          losses++;
          say('Mein Ärmel? Sauber wie mein Gewissen!');
        }
        await host.wait(1100);
        continue;
      }
      const cupIndex = slotOf.indexOf(picked);
      if (cupIndex === ballCup) {
        wins++;
        ctx.sfx('coin');
        await lift(cupIndex);
        say(pick(WILLI_LOSE));
        host.pop('Treffer!', 'good', ((picked + 0.5) / n) * 100, 25);
      } else {
        losses++;
        ctx.sfx('fail');
        cups[cupIndex].classList.add('lift');
        await host.wait(700);
        if (ballCup >= 0) cups[ballCup].classList.add('lift');
        say(ballCup >= 0 ? pick(WILLI_WIN) : 'Leer? Na so was. Pech, Süßer.');
        if (ballCup < 0 && !canSee) host.setInfo('Irgendwas war da faul …');
        await host.wait(1000);
        cups.forEach((cup) => cup.classList.remove('lift'));
        await host.wait(250);
      }
      host.setScore(`Runde ${round + 1}/3 · ${wins}:${losses}`);
    }
    const won = wins >= 2;
    host.summary(`Ergebnis ${wins}:${losses}.`);
    host.summary(won ? 'Willi packt grummelnd ein: „Feierabend. Du ruinierst mir das Geschäft.“' : 'Willi tätschelt dir die Wange: „Komm morgen wieder, Goldstück. Ich mag Stammkundschaft.“');
    return won;
  },
};
