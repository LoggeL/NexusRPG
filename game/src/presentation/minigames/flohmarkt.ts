// akt-flohmarkt: Eigener Stand auf dem Schrottmarkt (So T). Kundschaft will Krempel, du nennst den Preis.
// Zu hoch → Geduld sinkt und sie machen ein Gegenangebot; zu niedrig → Geld verschenkt. Ziel: Tagesumsatz.
// Straße: Kundschaft zahlt mehr, ab 5 siehst du ihre Schmerzgrenze ungefähr, ab 7 eine Geduld mehr. Sybella (he-sybella-chrome-8): +5 %.
// Der Umsatz kommt immer als Zusatzeffekt (`credits`), auch bei verfehltem Ziel.
import { h } from '../dom/dom';
import { ending, speaker } from './kit';
import type { MinigameDef } from './types';
import { byLevel, clamp, gameButton, isAction, isDown, isLeft, isRight, isUp, pick, shuffle } from './util';

interface Ware { name: string; base: number }
const WARES: Ware[] = [
  { name: 'Toaster „Pyro 3000“', base: 30 }, { name: 'Lavalampe ohne Lava', base: 18 }, { name: 'Kabelsalat, Familienpackung', base: 12 },
  { name: 'VR-Brille (ein Auge geht)', base: 45 }, { name: 'Schallplatte „Schlager 2049“', base: 22 }, { name: 'Gartenzwerg mit Laserauge', base: 35 },
  { name: 'Stiefel, Größe Riese', base: 26 }, { name: 'Quantum-Kugelschreiber (geklaut)', base: 15 }, { name: 'Wackeldackel', base: 20 },
  { name: 'Kaffeemaschine, riecht nach Kaffee', base: 40 },
];
const BUYERS = ['Tante Tetra', 'Ein Bulle außer Dienst', 'Der Typ mit dem Kabelbart', 'Oma mit Kampfrollator', 'Zwei Kurierkids', 'Ein Oberstädter auf Slumtour', 'Rostzahn ohne Zähne', 'Lieferdrohne mit Kreditchip'];
const INSULTS = ['Spinnst du? Für den Preis kauf ich mir ’ne Niere!', 'Du Halsabschneider! Meine Oma hat dich verflucht. Vorhin. Präventiv.', 'Geh scheißen mit dem Preis.', 'Bist du von Quantum, oder warum klaust du so dreist?'];
const CLOSE = ['Fast … nur ein bisschen weniger.', 'Hmm. Hmm. Hmmmm.', 'Du machst mich arm, aber mach weiter.'];

export const flohmarkt: MinigameDef = {
  title: 'Eigener Flohmarkt-Stand',
  blurb: 'Ein Klapptisch, eine Kiste Krempel, Sonntag auf dem Schrottmarkt. Die Kundschaft feilscht, als ging’s um ihr Leben. Für manche tut es das.',
  controls: ['←/→ oder −/+: Preis ändern (↑/↓ in großen Schritten)', 'Leertaste/„Anbieten“: Preis nennen', 'G / „Gegenangebot“: deren Preis annehmen'],
  bonuses(ctx) {
    const s = ctx.attr('strasse');
    const lines = [`Straße ${s}: Kundschaft zahlt bis +${Math.round(ctx.edge('strasse') * 25)} %`];
    if (s >= 5) lines.push('Straße 5+: Du erkennst die Schmerzgrenze ungefähr');
    if (s >= 7) lines.push('Straße 7+: Kundschaft hält eine Runde länger durch');
    if (ctx.has({ any: [{ flag: 'he-sybella-chrome-8' }, { seen: 'he-sybella-chrome-8' }] })) lines.push('Sybella berät dich: +5 % auf jeden Verkauf');
    return lines;
  },
  async run(host, ctx) {
    const level = ctx.level;
    const street = ctx.edge('strasse');
    const s = ctx.attr('strasse');
    const sybella = ctx.has({ any: [{ flag: 'he-sybella-chrome-8' }, { seen: 'he-sybella-chrome-8' }] });
    const customers = byLevel(level, [5, 5, 6, 6, 7]);
    const goalFactor = byLevel(level, [0.85, 0.95, 1.05, 1.15, 1.25]);
    const patienceStart = byLevel(level, [4, 3, 3, 3, 2]) + (s >= 7 ? 1 : 0);
    const seconds = byLevel(level, [100, 100, 110, 115, 120]);

    const stall = h('div', { class: 'fm-stall' });
    const buyerEl = h('div', { class: 'fm-buyer' });
    const ware = h('div', { class: 'fm-ware' });
    const priceEl = h('div', { class: 'fm-price' });
    const hint = h('div', { class: 'fm-hint' });
    const patienceEl = h('div', { class: 'fm-patience' });
    const voice = speaker('fm-voice');
    stall.append(buyerEl, ware, priceEl, hint, patienceEl, voice.el);
    const minus = gameButton('−', () => nudge(-1), 'fm-step');
    const plus = gameButton('+', () => nudge(1), 'fm-step');
    const offer = gameButton('ANBIETEN', () => ask(), 'mg-big');
    const accept = gameButton('Gegenangebot [G]', () => takeCounter(), 'fm-accept');
    host.stage.append(h('div', { class: 'fm-wrap' }, stall), h('div', { class: 'mg-toolbar' }, minus, plus, offer, accept));

    const end = ending();
    const queue = shuffle([...WARES]).slice(0, customers);
    const people = shuffle([...BUYERS]);
    const goal = Math.round(queue.reduce((sum, w) => sum + w.base, 0) * goalFactor);
    let revenue = 0, sold = 0, walked = 0;
    let idx = -1;
    let price = 0, max = 0, counter = 0, patience = 0;
    let busy = false;

    const step = () => Math.max(1, Math.round(queue[idx].base * 0.05));
    const render = () => {
      if (idx < 0 || idx >= queue.length) return;
      priceEl.textContent = `Dein Preis: ${price} Cr`;
      patienceEl.textContent = `Geduld ${'●'.repeat(Math.max(0, patience))}${'○'.repeat(Math.max(0, patienceStart - patience))}`;
      accept.disabled = counter <= 0;
      accept.textContent = counter > 0 ? `Gegenangebot ${counter} Cr [G]` : 'Gegenangebot [G]';
      host.setScore(`Umsatz ${revenue}/${goal} Cr`);
      host.setInfo(`Kunde ${idx + 1}/${queue.length}`);
    };
    const nextCustomer = async () => {
      idx++;
      if (idx >= queue.length) { end.finish(revenue >= goal); return; }
      const w = queue[idx];
      max = Math.round(w.base * (0.95 + Math.random() * 0.6) * (1 + street * 0.25));
      price = Math.round(w.base * 1.6);
      counter = 0;
      patience = patienceStart;
      buyerEl.textContent = people[idx % people.length];
      buyerEl.classList.remove('leave'); buyerEl.classList.add('enter');
      ware.textContent = w.name;
      hint.textContent = s >= 5 ? `Zahlt wohl ${Math.round(max * 0.85)}–${Math.round(max * 1.1)} Cr` : '';
      voice.say(pick([`Was willste für ${w.name}?`, 'Mach mir ’nen Preis. Aber keinen unverschämten.', 'Das Ding da. Wie viel, und lüg nicht.']));
      render();
    };
    const sell = (amount: number) => {
      const final = Math.round(amount * (sybella ? 1.05 : 1));
      revenue += final; sold++;
      ctx.sfx('coin');
      host.pop(`+${final} Cr`, final >= queue[idx].base ? 'gold' : 'good', 50, 30);
      voice.say(pick(['Deal. Und jetzt guck nicht so zufrieden.', 'Gekauft! Ich bereu’s jetzt schon.', 'Gut. Meine Frau bringt mich um.']));
      void leave();
    };
    const leave = async () => {
      busy = true;
      buyerEl.classList.remove('enter'); buyerEl.classList.add('leave');
      render();
      await host.wait(900);
      busy = false;
      void nextCustomer();
    };
    const nudge = (dir: number, big = false) => {
      if (busy || end.over || idx >= queue.length) return;
      price = clamp(price + dir * step() * (big ? 4 : 1), 1, 999);
      ctx.sfx('step');
      render();
    };
    const ask = () => {
      if (busy || end.over || idx >= queue.length) return;
      if (price <= max) { sell(price); return; }
      patience--;
      const over = price / max - 1;
      counter = Math.max(counter, Math.round(max * (0.78 + Math.random() * 0.14)));
      voice.say(over <= 0.12 ? pick(CLOSE) : pick(INSULTS));
      ctx.sfx('fail');
      if (patience <= 0) {
        walked++;
        host.pop('Kunde weg!', 'bad', 50, 30);
        voice.say(pick(['Ich geh zu Gustav. Der ist wenigstens ehrlich teuer.', 'Vergiss es, du Raffzahn.']));
        void leave();
        return;
      }
      render();
    };
    const takeCounter = () => {
      if (busy || end.over || counter <= 0) return;
      sell(counter);
    };
    host.onKey((event, down) => {
      if (!down) return;
      if (isLeft(event.code) || event.code === 'Minus' || event.code === 'NumpadSubtract') nudge(-1);
      else if (isRight(event.code) || event.code === 'Equal' || event.code === 'NumpadAdd') nudge(1);
      else if (isUp(event.code)) nudge(1, true);
      else if (isDown(event.code)) nudge(-1, true);
      else if (event.repeat) return;
      else if (event.code === 'KeyG') takeCounter();
      else if (isAction(event.code)) ask();
    });
    void nextCustomer();

    const clock = host.countdown(seconds);
    const result = await Promise.race([end.done, clock.done.then(() => null)]);
    const won = (result ?? false) || revenue >= goal;
    end.finish(won);
    if (revenue > 0) host.extra({ credits: revenue });
    host.summary(`Verkauft ${sold} · Kundschaft vergrault ${walked} · Umsatz ${revenue} Cr (Ziel ${goal} Cr)${sybella ? ' · Sybella-Bonus drin' : ''}`);
    host.summary(won ? 'Der Klapptisch ist leer, die Tasche voll. Gustav nickt dir von gegenüber zu: Konkurrenz.' : 'Ein paar Credits, viel Krempel übrig. Der Wackeldackel nickt mitleidig.');
    return won;
  },
};
