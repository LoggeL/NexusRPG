// akt-barschicht: Schicht hinter der Bar im High Voltage. Bestellungen lesen, Zutaten in den Shaker, servieren.
// Reflexe: Gäste warten länger; Ausstrahlung: mehr Trinkgeld. Trinkgeld gibt es als Zusatz-Credits, auch bei verpatzter Schicht.
import { h } from '../dom/dom';
import type { MinigameDef } from './types';
import { byLevel, clamp, digitOf, gameButton, isAction, pick, shuffle } from './util';

const INGREDIENTS = [
  { id: 'bier', name: 'Bier', color: '#ffc04a' },
  { id: 'gin', name: 'Synth-Gin', color: '#3ef2ff' },
  { id: 'wodka', name: 'Rostwodka', color: '#ff7a4a' },
  { id: 'sirup', name: 'Neon-Sirup', color: '#ff3fa4' },
  { id: 'zitrus', name: 'Zitrus', color: '#e6ff4a' },
  { id: 'eis', name: 'Eis', color: '#cfe8ff' },
  { id: 'algen', name: 'Algenschaum', color: '#6dffb0' },
  { id: 'wasser', name: 'Wasser', color: '#8ab4ff' },
] as const;
type IngredientId = (typeof INGREDIENTS)[number]['id'];

interface Recipe { name: string; parts: IngredientId[]; minLevel: number }
const RECIPES: Recipe[] = [
  { name: 'Ein Bier', parts: ['bier'], minLevel: 1 },
  { name: 'Neon-Sour', parts: ['gin', 'zitrus', 'sirup'], minLevel: 1 },
  { name: 'Rostiger Nagel', parts: ['wodka', 'wodka', 'eis'], minLevel: 1 },
  { name: 'Kanalwasser', parts: ['wodka', 'algen', 'eis'], minLevel: 2 },
  { name: 'Gin auf Eis', parts: ['gin', 'eis'], minLevel: 1 },
  { name: 'Glitzer-Colada', parts: ['sirup', 'algen', 'eis', 'zitrus'], minLevel: 3 },
  { name: 'Hunters Frühstück', parts: ['gin', 'wodka', 'sirup', 'zitrus'], minLevel: 4 },
  { name: 'Bierbombe', parts: ['bier', 'wodka'], minLevel: 2 },
];
const UNAUFFAELLIG: Recipe = { name: '„Was Unauffälliges“', parts: ['wasser'], minLevel: 1 };
const GUESTS = ['Schrauber-Jo', 'Zwei-Finger-Zora', 'Kabel-Kurt', 'Glitzer-Gitte', 'Der Lange', 'Rattenkönig Ralf', 'Mira mit dem Mohawk', 'Bürohengst im Ausgang', 'Oma Volt', 'Dosen-Didi'];
const RUDE = ['Das schmeckt wie Kanal, du Pfeife!', 'Hab ich DAS bestellt, du Vollpfosten?', 'Bist du blind oder nur blöd?', 'Spül damit dein Hirn, nicht meinen Magen!'];
const NICE = ['Läuft, Süße*r.', 'Genau so!', 'Du bist ein Engel mit Shaker.', 'Stimmt so.'];

const sameMix = (a: readonly string[], b: readonly string[]) => a.length === b.length && [...a].sort().join() === [...b].sort().join();

interface Guest { name: string; recipe: Recipe; patience: number; max: number; el: HTMLElement; bar: HTMLElement; done: boolean; richter: boolean }

export const barschicht: MinigameDef = {
  title: 'Schicht hinter der Bar',
  blurb: 'Freitagsgefühl, egal welcher Tag: Die Theke ist voll, die Gäste sind durstig und ungeduldig. Mix, was bestellt wird – Reihenfolge egal, Menge nicht.',
  controls: ['Zutaten: Tasten 1–8 oder antippen', 'Leertaste/Enter: an passenden Gast servieren, oder Gast antippen', 'Rücktaste/0: Shaker ausgießen'],
  bonuses(ctx) {
    return [
      `Reflexe ${ctx.attr('reflexe')}: Gäste warten ${Math.round(ctx.edge('reflexe') * 50)} % länger`,
      `Ausstrahlung ${ctx.attr('ausstrahlung')}: Trinkgeld +${Math.round(ctx.edge('ausstrahlung') * 100)} %`,
    ];
  },
  async run(host, ctx) {
    const level = ctx.level;
    const seconds = 60;
    const target = byLevel(level, [5, 6, 7, 8, 9]);
    const patienceBase = byLevel(level, [26, 22, 19, 16.5, 14.5]) * (1 + ctx.edge('reflexe') * 0.5);
    const spawnEvery = byLevel(level, [6.5, 5.6, 5, 4.4, 3.9]);
    const seats = 3;
    const tipFactor = 1 + ctx.edge('ausstrahlung');
    const menu = RECIPES.filter((recipe) => recipe.minLevel <= level);
    const richterAt = 12 + Math.random() * 25;

    const guestRow = h('div', { class: 'bs-guests' });
    const shakerEl = h('div', { class: 'bs-shaker' });
    const shakerLabel = h('div', { class: 'bs-shaker-label' });
    const card = h('div', { class: 'bs-menu' }, h('div', { class: 'bs-menu-head' }, 'Karte'),
      ...menu.map((recipe) => h('div', { class: 'bs-menu-row' }, h('b', null, recipe.name), h('span', null, recipe.parts.map((part) => INGREDIENTS.find((i) => i.id === part)!.name).join(' + ')))));
    const shelf = h('div', { class: 'bs-shelf' });
    const shaker: IngredientId[] = [];
    INGREDIENTS.forEach((ingredient, index) => {
      const button = gameButton(h('span', null, h('i', { class: 'bs-dot' }), ingredient.name, h('kbd', null, String(index + 1))), () => add(ingredient.id), 'bs-ing');
      (button.querySelector('.bs-dot') as HTMLElement).style.background = ingredient.color;
      shelf.append(button);
    });
    const dump = gameButton('Ausgießen [0]', () => clearShaker(), 'bs-dump');
    const serveButton = gameButton('SERVIEREN', () => serve(null), 'mg-big');
    host.stage.append(h('div', { class: 'bs-wrap' },
      guestRow,
      h('div', { class: 'bs-bar' }, card, h('div', { class: 'bs-mix' }, shakerEl, shakerLabel), shelf)),
      h('div', { class: 'mg-toolbar' }, dump, serveButton));

    const guests: Guest[] = [];
    let served = 0, botched = 0, walked = 0;
    let tips = 0;
    let richterDone = false;
    let elapsed = 0;
    let spawnTimer = 1;
    const names = shuffle([...GUESTS]);

    const renderShaker = () => {
      shakerEl.textContent = '';
      for (const part of shaker) {
        const layer = h('i', { class: 'bs-layer' });
        layer.style.background = INGREDIENTS.find((i) => i.id === part)!.color;
        shakerEl.append(layer);
      }
      shakerLabel.textContent = shaker.length ? shaker.map((part) => INGREDIENTS.find((i) => i.id === part)!.name).join(' + ') : 'Shaker leer';
    };
    function add(id: IngredientId) {
      if (shaker.length >= 5) { host.pop('Shaker voll!', 'bad', 50, 55); return; }
      shaker.push(id);
      ctx.sfx('pickup');
      renderShaker();
    }
    function clearShaker() { if (shaker.length) { shaker.length = 0; ctx.sfx('page'); renderShaker(); } }
    function leave(guest: Guest) {
      guest.done = true;
      guest.el.classList.add('leave');
      setTimeout(() => guest.el.remove(), 380);
    }
    function serve(target: Guest | null) {
      if (!shaker.length) { host.pop('Erst mixen, dann servieren.', 'info', 50, 55); return; }
      const open = guests.filter((g) => !g.done);
      if (!open.length) return;
      const guest = target ?? open.find((g) => sameMix(g.recipe.parts, shaker)) ?? open[0];
      const x = ((open.indexOf(guest) + 0.5) / seats) * 100;
      if (sameMix(guest.recipe.parts, shaker)) {
        served++;
        const tip = Math.round((2 + guest.recipe.parts.length * 1.5) * (0.4 + (guest.patience / guest.max) * 0.8) * tipFactor * (guest.richter ? 2 : 1));
        tips += tip;
        ctx.sfx('coin');
        host.pop(`+${tip} Cr`, 'gold', x, 18);
        guest.el.querySelector('.bs-say')!.textContent = guest.richter ? '„Danke. Wir haben uns nie gesehen.“' : pick(NICE);
        leave(guest);
      } else {
        botched++;
        guest.patience = Math.max(0, guest.patience - guest.max * 0.4);
        ctx.sfx('fail');
        host.pop('Falsch!', 'bad', x, 18);
        guest.el.querySelector('.bs-say')!.textContent = pick(RUDE);
        guest.el.classList.remove('angry'); void guest.el.offsetWidth; guest.el.classList.add('angry');
      }
      shaker.length = 0;
      renderShaker();
    }
    const spawn = () => {
      const open = guests.filter((g) => !g.done);
      if (open.length >= seats) return;
      const richter = !richterDone && elapsed >= richterAt;
      if (richter) richterDone = true;
      const recipe = richter ? UNAUFFAELLIG : pick(menu);
      const max = patienceBase * (0.9 + recipe.parts.length * 0.08);
      const bar = h('i');
      const el = h('div', { class: `bs-guest${richter ? ' richter' : ''}` },
        h('div', { class: 'bs-name' }, richter ? 'Der Richter' : names[(served + walked + botched + open.length) % names.length]),
        h('div', { class: 'bs-order' }, recipe.name),
        h('div', { class: 'bs-patience' }, bar),
        h('div', { class: 'bs-say' }, richter ? 'Etwas … Unauffälliges. Bitte.' : ''));
      const guest: Guest = { name: '', recipe, patience: max, max, el, bar, done: false, richter };
      el.addEventListener('pointerdown', (event) => { event.preventDefault(); serve(guest); });
      guests.push(guest);
      guestRow.append(el);
    };

    host.onKey((event, down) => {
      if (!down || event.repeat) return;
      const digit = digitOf(event.code);
      if (digit >= 1 && digit <= INGREDIENTS.length) add(INGREDIENTS[digit - 1].id);
      else if (event.code === 'Backspace' || event.code === 'Digit0' || event.code === 'Numpad0' || event.code === 'Delete') clearShaker();
      else if (isAction(event.code)) serve(null);
    });

    let over = false;
    host.frame((dt) => {
      if (over) return false;
      elapsed += dt;
      spawnTimer -= dt;
      if (spawnTimer <= 0) { spawnTimer = spawnEvery * (0.8 + Math.random() * 0.4); spawn(); }
      if (!guests.some((g) => !g.done) && spawnTimer > 1) spawnTimer = 1;
      for (const guest of guests) {
        if (guest.done) continue;
        guest.patience -= dt;
        const share = clamp(guest.patience / guest.max, 0, 1);
        guest.bar.style.width = `${share * 100}%`;
        guest.el.classList.toggle('low', share < 0.3);
        if (guest.patience <= 0) {
          walked++;
          guest.el.querySelector('.bs-say')!.textContent = pick(['Ich verdurste hier, ihr Penner!', 'Scheißladen.', 'Ich geh ins Nest, da gibt’s wenigstens Wasser.']);
          ctx.sfx('heart-down');
          leave(guest);
        }
      }
      for (let i = guests.length - 1; i >= 0; i--) if (guests[i].done && !guests[i].el.isConnected) guests.splice(i, 1);
      host.setScore(`Serviert ${served}/${target} · Trinkgeld ${tips} Cr`);
      return true;
    });
    renderShaker();
    const clock = host.countdown(seconds);
    await clock.done;
    over = true;
    const won = served >= target;
    if (tips > 0) host.extra({ credits: tips });
    host.summary(`Serviert ${served} · verpatzt ${botched} · abgehauen ${walked}`);
    host.summary(`Trinkgeld: ${tips} Cr${tips ? ' (gehört dir, egal wie’s lief)' : ''}`);
    host.summary(won ? 'Hunter nickt hinter der Sonnenbrille. Bei ihm ist das fast eine Umarmung.' : 'Hunter zählt die Scherben: „Das war … eine Schicht, Neuling.“');
    return won;
  },
};
