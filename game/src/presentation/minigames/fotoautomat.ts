// akt-fotoautomat: Fräulein Pixels Fälscherwerkstatt im Fotoautomaten. Drei Schritte für einen Ausweis, der den Scanner übersteht:
// Passfoto-Kacheln richtig drehen, Hologramm im richtigen Farbton stempeln, Prüfziffer setzen.
// Technik: mehr Zeit, breiteres Hologramm-Fenster, ab 6 leuchten richtige Kacheln, ab 8 rechnet das Gerät die Prüfziffer vor.
import { h } from '../dom/dom';
import { choose, ending, speaker } from './kit';
import type { MinigameDef } from './types';
import { byLevel, gameButton, isAction, isDown, isLeft, isRight, isUp, pick, randInt, shuffle } from './util';

const PHOTO = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3ef2ff"/><stop offset="1" stop-color="#9b5cff"/></linearGradient></defs>
<rect width="120" height="120" fill="url(#g)"/>
<path d="M0 22 L120 10 L120 18 L0 30 Z" fill="#ff4fd8" opacity="0.6"/>
<circle cx="60" cy="52" r="22" fill="#2b1840"/><rect x="48" y="44" width="24" height="7" rx="2" fill="#ffe14a"/>
<path d="M22 120 Q26 80 60 78 Q94 80 98 120 Z" fill="#2b1840"/>
<path d="M60 78 L52 120 M60 78 L68 120" stroke="#ff4fd8" stroke-width="3"/>
<text x="8" y="112" font-family="monospace" font-size="13" fill="#f4f0ff">NX-2086</text>
<rect x="92" y="6" width="22" height="22" fill="none" stroke="#f4f0ff" stroke-width="3"/><path d="M95 22 L103 9 L111 22" fill="#f4f0ff"/>
</svg>`)}`;

export const fotoautomat: MinigameDef = {
  title: 'Fräulein Pixels Fotoautomat',
  blurb: 'Hinter dem Vorhang riecht es nach Toner und schlechten Absichten. Fräulein Pixel schiebt dir einen Rohling hin: „Foto, Hologramm, Prüfziffer. Wenn der Scanner piept, kennen wir uns nicht.“',
  controls: ['Kacheln anklicken/antippen: drehen (Tastatur: Pfeile + Leertaste)', 'Hologramm: Leertaste/Stempel, wenn die Farbe passt', 'Prüfziffer: 1–3 oder antippen'],
  bonuses(ctx) {
    const t = ctx.attr('technik');
    const lines = [`Technik ${t}: +${Math.round(ctx.edge('technik') * 20)} s, Hologramm-Fenster +${Math.round(ctx.edge('technik') * 60)} %`];
    if (t >= 6) lines.push('Technik 6+: richtig gedrehte Kacheln leuchten');
    if (t >= 8) lines.push('Technik 8+: Prüfziffer wird vorgerechnet');
    return lines;
  },
  async run(host, ctx) {
    const level = ctx.level;
    const t = ctx.attr('technik');
    const tech = ctx.edge('technik');
    const n = level >= 4 ? 4 : 3;
    const stamps = byLevel(level, [1, 2, 2, 3, 3]);
    const hueWindow = byLevel(level, [34, 28, 24, 20, 16]) * (1 + tech * 0.6);
    const hueSpeed = byLevel(level, [90, 110, 130, 150, 170]);
    const seconds = byLevel(level, [70, 70, 75, 80, 85]) + Math.round(tech * 20);
    let mistakes = 0;
    const maxMistakes = byLevel(level, [4, 3, 3, 2, 2]);

    const booth = h('div', { class: 'fa-booth' });
    const card = h('div', { class: 'fa-card' });
    const panel = h('div', { class: 'fa-panel' });
    const pixel = speaker('fa-pixel', 'Fräulein Pixel');
    booth.append(card, panel, pixel.el);
    host.stage.append(h('div', { class: 'fa-wrap' }, booth));
    const end = ending();
    const clock = host.countdown(seconds);
    void clock.done.then(() => end.finish(false));
    const flaw = (why: string) => {
      mistakes++;
      ctx.sfx('fail');
      host.pop(why, 'bad', 50, 30);
      host.setInfo(`Fehler ${mistakes}/${maxMistakes}`);
      if (mistakes >= maxMistakes) { pixel.say('Zu viele Macken. Den Rohling kannst du essen.'); end.finish(false); }
    };
    host.setInfo(`Fehler 0/${maxMistakes}`);

    // 1) Foto-Kacheln
    host.setScore('1/3 Foto');
    const grid = h('div', { class: 'fa-grid' });
    grid.style.gridTemplateColumns = `repeat(${n}, 1fr)`;
    card.append(grid, h('div', { class: 'fa-lines' }, h('i', null), h('i', null), h('i', null)), h('div', { class: 'fa-holo' }), h('div', { class: 'fa-code' }));
    const rot: number[] = [];
    const tiles: HTMLElement[] = [];
    for (let i = 0; i < n * n; i++) {
      const tile = h('div', { class: 'fa-tile' });
      tile.style.backgroundImage = `url("${PHOTO}")`;
      tile.style.backgroundSize = `${n * 100}% ${n * 100}%`;
      tile.style.backgroundPosition = `${((i % n) / (n - 1)) * 100}% ${(Math.floor(i / n) / (n - 1)) * 100}%`;
      rot.push(randInt(0, 3));
      tiles.push(tile);
      grid.append(tile);
    }
    if (!rot.some((r) => r !== 0)) rot[randInt(0, rot.length - 1)] = 2;
    let cursor = 0;
    const renderTiles = () => tiles.forEach((tile, i) => {
      tile.style.transform = `rotate(${rot[i] * 90}deg)`;
      tile.classList.toggle('ok', t >= 6 && rot[i] % 4 === 0);
      tile.classList.toggle('cursor', i === cursor && !ctx.touch);
    });
    renderTiles();
    panel.textContent = 'Dreh die Kacheln, bis das Gesicht stimmt.';
    pixel.say(pick(['Gerade Nase, gerader Blick. Lügen muss man ordentlich.', 'Der Scanner ist dumm, aber nicht blind.']));
    await new Promise<void>((resolve) => {
      const rotate = (i: number) => {
        if (end.over) return;
        rot[i] = (rot[i] + 1) % 4;
        cursor = i;
        ctx.sfx('switch');
        renderTiles();
        if (!rot.some((r) => r !== 0)) resolve();
      };
      tiles.forEach((tile, i) => tile.addEventListener('pointerdown', (event) => { event.preventDefault(); rotate(i); }));
      host.onKey((event, down) => {
        if (!down || event.repeat || !rot.some((r) => r !== 0)) return;
        if (isLeft(event.code)) cursor = (cursor + n * n - 1) % (n * n);
        else if (isRight(event.code)) cursor = (cursor + 1) % (n * n);
        else if (isUp(event.code)) cursor = (cursor + n * n - n) % (n * n);
        else if (isDown(event.code)) cursor = (cursor + n) % (n * n);
        else if (isAction(event.code)) { rotate(cursor); return; }
        renderTiles();
      });
      void end.done.then(() => resolve());
    });
    if (end.over) return wrap(false);
    grid.classList.add('done');
    host.pop('Foto sitzt!', 'good', 50, 30);
    await host.wait(500);

    // 2) Hologramm
    host.setScore('2/3 Hologramm');
    const target = randInt(0, 359);
    const swatch = h('div', { class: 'fa-swatch' });
    swatch.style.background = `hsl(${target} 90% 60%)`;
    const live = h('div', { class: 'fa-live' });
    const stampButton = gameButton('STEMPELN', () => stamp(), 'mg-big');
    panel.textContent = '';
    panel.append(h('div', { class: 'fa-holo-row' }, h('span', null, 'Soll'), swatch, h('span', null, 'Ist'), live), h('div', { class: 'mg-toolbar' }, stampButton));
    let hue = randInt(0, 359), stamped = 0;
    let holoResolve!: () => void;
    const holoDone = new Promise<void>((resolve) => { holoResolve = resolve; });
    const stamp = () => {
      if (end.over || stamped >= stamps) return;
      const diff = Math.abs(((hue - target + 540) % 360) - 180);
      if (diff <= hueWindow / 2) {
        stamped++;
        ctx.sfx('hack');
        host.pop(`Hologramm ${stamped}/${stamps}`, 'gold', 50, 30);
        card.querySelector('.fa-holo')?.classList.add('on');
        if (stamped >= stamps) holoResolve();
      } else flaw('Farbe daneben!');
    };
    host.onKey((event, down) => { if (down && !event.repeat && isAction(event.code) && stamped < stamps && !rot.some((r) => r !== 0)) stamp(); });
    host.frame((dt) => {
      if (end.over || stamped >= stamps) return false;
      hue = (hue + hueSpeed * dt * (1 + stamped * 0.2)) % 360;
      live.style.background = `hsl(${hue} 90% 60%)`;
      return true;
    });
    await Promise.race([holoDone, end.done]);
    if (end.over) return wrap(false);
    await host.wait(400);

    // 3) Prüfziffer: Quersumme der Nummer modulo 10
    host.setScore('3/3 Prüfziffer');
    const digits = Array.from({ length: byLevel(level, [5, 6, 7, 8, 9]) }, () => randInt(0, 9));
    const check = digits.reduce((a, b) => a + b, 0) % 10;
    const options = shuffle([check, (check + randInt(1, 4)) % 10, (check + randInt(5, 9)) % 10].filter((v, i, list) => list.indexOf(v) === i));
    while (options.length < 3) { const extra = randInt(0, 9); if (!options.includes(extra)) options.push(extra); }
    card.querySelector('.fa-code')!.textContent = `${digits.join('')}-?`;
    panel.textContent = '';
    panel.append(h('div', { class: 'fa-rule' }, 'Prüfziffer = Quersumme der Nummer, letzte Stelle.'), h('div', { class: 'fa-number' }, digits.join(' ')));
    if (t >= 8) panel.append(h('div', { class: 'fa-help' }, `${digits.join(' + ')} = ${digits.reduce((a, b) => a + b, 0)}`));
    const row = h('div', { class: 'fa-options' });
    panel.append(row);
    const picked = await Promise.race([choose(host, row, options.map(String)), end.done.then(() => -1)]);
    if (end.over || picked < 0) return wrap(false);
    if (options[picked] !== check) { flaw('Scanner piept!'); return wrap(false); }
    card.querySelector('.fa-code')!.textContent = `${digits.join('')}-${check}`;
    ctx.sfx('success');
    return wrap(true);

    function wrap(won: boolean) {
      end.finish(won);
      clock.stop();
      host.summary(won ? `Ausweis fertig. Fehler: ${mistakes}.` : 'Der Rohling landet im Schredder. Fräulein Pixel tut so, als hätte sie dich nie gesehen.');
      if (won) host.summary(pick(['Fräulein Pixel hält ihn gegen das Licht: „Hübsch. Fast so hübsch wie echt.“', '„Wenn dich einer fragt: Das Foto ist von 2084. Du warst dicker.“']));
      return won;
    }
  },
};
