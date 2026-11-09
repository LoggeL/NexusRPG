// akt-eins: Kartenspiel „Eins!“ gegen zwei KI-Gegner (vereinfachte Regeln im Stil des bekannten Ablegespiels).
// Farbe oder Zahl/Symbol bedienen; Aussetzen, Richtungswechsel, +2, Farbwahl, Farbwahl +4. Wer auf eine Karte kommt,
// ruft „Eins!“ – sonst +2. Straße 5+: eine Karte des nächsten Gegners sichtbar (8+: bei beiden).
// Ausstrahlung 5+: Bluffen statt Ziehen (der nächste Gegner zieht, wenn er dir glaubt).
import { h } from '../dom/dom';
import type { MinigameContext, MinigameDef, MinigameHost } from './types';
import { byLevel, clamp, gameButton, isAction, isLeft, isRight, pick, shuffle } from './util';

export type Kind = 'num' | 'skip' | 'rev' | 'plus2' | 'wild' | 'wild4';
export interface Card { id: number; color: number | null; kind: Kind; value: number }

export const COLORS = [
  { name: 'Cyan', cls: 'c0' },
  { name: 'Pink', cls: 'c1' },
  { name: 'Gelb', cls: 'c2' },
  { name: 'Violett', cls: 'c3' },
] as const;

export function makeDeck(): Card[] {
  const deck: Card[] = [];
  let id = 0;
  for (let color = 0; color < 4; color++) {
    deck.push({ id: id++, color, kind: 'num', value: 0 });
    for (let value = 1; value <= 9; value++) for (let k = 0; k < 2; k++) deck.push({ id: id++, color, kind: 'num', value });
    for (const kind of ['skip', 'rev', 'plus2'] as const) for (let k = 0; k < 2; k++) deck.push({ id: id++, color, kind, value: -1 });
  }
  for (let k = 0; k < 4; k++) deck.push({ id: id++, color: null, kind: 'wild', value: -1 }, { id: id++, color: null, kind: 'wild4', value: -1 });
  return shuffle(deck);
}

export function canPlay(card: Card, top: Card, color: number): boolean {
  if (card.color === null) return true;
  if (card.color === color) return true;
  if (card.kind === 'num' && top.kind === 'num') return card.value === top.value;
  return card.kind !== 'num' && card.kind === top.kind;
}

export function cardLabel(card: Card): string {
  switch (card.kind) {
    case 'num': return String(card.value);
    case 'skip': return '⊘';
    case 'rev': return '⇄';
    case 'plus2': return '+2';
    case 'wild': return '★';
    case 'wild4': return '+4';
  }
}
export function cardName(card: Card, chosen?: number): string {
  const kind = { num: String(card.value), skip: 'Aussetzen', rev: 'Richtungswechsel', plus2: '+2', wild: 'Farbwahl', wild4: 'Farbwahl +4' }[card.kind];
  if (card.color === null) return chosen === undefined ? kind : `${kind} (${COLORS[chosen].name})`;
  return `${COLORS[card.color].name} ${kind}`;
}

/** Häufigste Farbe auf der Hand (für Farbwahl). */
export function favouriteColor(hand: readonly Card[]): number {
  const counts = [0, 0, 0, 0];
  for (const card of hand) if (card.color !== null) counts[card.color]++;
  const max = Math.max(...counts);
  return max === 0 ? Math.floor(Math.random() * 4) : counts.indexOf(max);
}

/** KI-Zug: bester spielbarer Karten-Index oder -1 (ziehen). */
export function aiChoose(hand: readonly Card[], top: Card, color: number, level: number, nextCount: number, nextIsPlayer: boolean): number {
  const playable = hand.map((card, i) => ({ card, i })).filter(({ card }) => canPlay(card, top, color));
  if (!playable.length) return -1;
  if (level <= 2) {
    const plain = playable.filter(({ card }) => card.color !== null);
    return (plain.length && Math.random() < 0.75 ? pick(plain) : pick(playable)).i;
  }
  const fav = favouriteColor(hand);
  const danger = nextCount <= 2 ? 3 : nextCount <= 3 ? 1.5 : 0;
  const aggression = nextIsPlayer ? 1 + (level - 3) * 0.4 : 0.6;
  let best = playable[0];
  let bestScore = -Infinity;
  for (const entry of playable) {
    const { card } = entry;
    let score = 0;
    if (card.kind === 'num') score += 1 + card.value * 0.05;
    if (card.kind === 'skip' || card.kind === 'rev') score += 1.2 + danger * aggression;
    if (card.kind === 'plus2') score += 1.4 + danger * aggression * 1.3;
    if (card.kind === 'wild') score += playable.length === 1 ? 0.5 : -1.5 + danger * 0.3;
    if (card.kind === 'wild4') score += playable.length === 1 ? 0.6 : -2 + danger * aggression * 1.6;
    if (card.color === fav) score += 0.5;
    score += Math.random() * (level >= 5 ? 0.2 : 0.6);
    if (score > bestScore) { bestScore = score; best = entry; }
  }
  return best.i;
}

const RIVALS = [
  { name: 'Kralle', play: ['Friss das!', 'Na, schmeckt’s?', 'Zack.'], draw: ['Pfff.', 'Mist, verdammter.', 'Das Deck hasst mich.'] },
  { name: 'Lucky Lu', play: ['Ups, war das gemein?', 'Hehehe.', 'Für dich, Schatz.'], draw: ['Och menno.', 'Glück ist auch nur ’ne Hure.', 'Ich zieh ja schon …'] },
];

type PlayerAction = { type: 'play'; index: number } | { type: 'draw' } | { type: 'bluff' } | { type: 'keep' };

async function playEins(host: MinigameHost, ctx: MinigameContext): Promise<boolean> {
  const level = ctx.level;
  const handSize = 5;
  const peekCount = ctx.attr('strasse') >= 8 ? 2 : ctx.attr('strasse') >= 5 ? 1 : 0;
  let bluffs = ctx.attr('ausstrahlung') >= 8 ? 2 : ctx.attr('ausstrahlung') >= 5 ? 1 : 0;
  const bluffChance = clamp(0.35 + (ctx.attr('ausstrahlung') - 3) * 0.06 - (level - 1) * 0.05, 0.2, 0.85);
  const forgetChance = byLevel(level, [0.35, 0.25, 0.15, 0.08, 0.04]);

  let draw = makeDeck();
  const discard: Card[] = [];
  const hands: Card[][] = [[], [], []];
  const drawCard = (): Card | null => {
    if (!draw.length) {
      const top = discard.pop();
      draw = shuffle(discard.splice(0));
      if (top) discard.push(top);
    }
    return draw.pop() ?? null;
  };
  for (let k = 0; k < handSize; k++) for (const hand of hands) { const card = drawCard(); if (card) hand.push(card); }
  let first = drawCard()!;
  while (first.kind !== 'num') { draw.unshift(first); first = drawCard()!; }
  discard.push(first);
  let color = first.color ?? 0;
  let dir = 1;
  let turn = 0;
  let calledEins = false;
  const peeks = new Map<number, number>();
  const names = ['Du', RIVALS[0].name, RIVALS[1].name];

  // --- DOM
  const oppEls = [1, 2].map((p) => {
    const cards = h('div', { class: 'eo-cards' });
    const bubble = h('div', { class: 'eo-bubble' });
    const el = h('div', { class: `eo-opp p${p}` }, h('div', { class: 'eo-name' }, names[p]), cards, bubble);
    return { el, cards, bubble };
  });
  const topSlot = h('div', { class: 'eo-top' });
  const deckEl = h('div', { class: 'eo-card back big' }, 'EINS!');
  const colorEl = h('div', { class: 'eo-color' });
  const dirEl = h('div', { class: 'eo-dir' });
  const log = h('div', { class: 'eo-log', 'aria-live': 'polite' });
  const handEl = h('div', { class: 'eo-hand' });
  const einsButton = gameButton('EINS! [U]', () => callEins(), 'eo-eins');
  const catchButton = gameButton('ERWISCHT! [U]', () => catchAi(), 'eo-catch');
  const drawButton = gameButton('Ziehen [Z]', () => act({ type: 'draw' }), 'eo-draw');
  const keepButton = gameButton('Behalten [Z]', () => act({ type: 'keep' }), 'eo-keep');
  const bluffButton = gameButton('', () => act({ type: 'bluff' }), 'eo-bluff');
  const picker = h('div', { class: 'eo-picker' }, h('div', { class: 'eo-picker-head' }, 'Farbe wählen [1–4]'),
    ...COLORS.map((c, i) => gameButton(c.name, () => pickColor(i), `eo-pick ${c.cls}`)));
  deckEl.addEventListener('pointerdown', (event) => { event.preventDefault(); act({ type: 'draw' }); });
  host.stage.append(h('div', { class: 'eo-wrap' },
    h('div', { class: 'eo-opps' }, oppEls[0].el, oppEls[1].el),
    h('div', { class: 'eo-center' }, deckEl, topSlot, h('div', { class: 'eo-state' }, colorEl, dirEl), log),
    handEl, picker),
  h('div', { class: 'mg-toolbar' }, bluffButton, drawButton, keepButton, catchButton, einsButton));

  let cursor = 0;
  let mode: 'wait' | 'turn' | 'drawn' | 'color' = 'wait';
  let drawnCard: Card | null = null;
  let resolveAction: ((action: PlayerAction) => void) | null = null;
  let resolveColor: ((color: number) => void) | null = null;
  let aiForgot: number | null = null;
  let aiForgotUntil = 0;
  let einsDeadline = 0;

  const say = (player: number, text: string) => {
    if (player === 0) return;
    const bubble = oppEls[player - 1].bubble;
    bubble.textContent = text;
    bubble.classList.remove('show'); void bubble.offsetWidth; bubble.classList.add('show');
  };
  const cardEl = (card: Card, extra = '', chosen?: number) => {
    const cls = card.color === null ? `wild${chosen !== undefined ? ` ${COLORS[chosen].cls}` : ''}` : COLORS[card.color].cls;
    return h('div', { class: `eo-card ${cls} ${extra}`, title: cardName(card) }, h('span', null, cardLabel(card)));
  };
  const refreshPeeks = () => {
    peeks.clear();
    const targets = peekCount >= 2 ? [1, 2] : peekCount === 1 ? [(3 + dir) % 3 || 1] : [];
    for (const p of targets) if (hands[p].length) peeks.set(p, pick(hands[p]).id);
  };
  const render = () => {
    const top = discard[discard.length - 1];
    topSlot.textContent = '';
    topSlot.append(cardEl(top, 'big', color));
    colorEl.className = `eo-color ${COLORS[color].cls}`;
    colorEl.textContent = COLORS[color].name;
    dirEl.textContent = dir === 1 ? '↻' : '↺';
    [1, 2].forEach((p, i) => {
      const box = oppEls[i];
      box.cards.textContent = '';
      for (const card of hands[p]) box.cards.append(peeks.get(p) === card.id ? cardEl(card, 'small peek') : h('div', { class: 'eo-card back small' }));
      box.el.classList.toggle('active', turn === p);
      box.el.querySelector('.eo-name')!.textContent = `${names[p]} · ${hands[p].length}`;
    });
    handEl.textContent = '';
    cursor = clamp(cursor, 0, Math.max(0, hands[0].length - 1));
    hands[0].forEach((card, i) => {
      const playable = (mode === 'turn' && canPlay(card, top, color)) || (mode === 'drawn' && drawnCard?.id === card.id);
      const el = cardEl(card, `${playable ? 'playable' : 'dim'}${i === cursor && mode !== 'wait' && !ctx.touch ? ' cursor' : ''}`);
      el.addEventListener('pointerdown', (event) => { event.preventDefault(); if (playable) act({ type: 'play', index: i }); });
      handEl.append(el);
    });
    handEl.classList.toggle('active', mode === 'turn' || mode === 'drawn');
    drawButton.hidden = mode === 'drawn';
    drawButton.disabled = mode !== 'turn';
    keepButton.hidden = mode !== 'drawn';
    bluffButton.hidden = bluffs <= 0;
    bluffButton.disabled = mode !== 'turn';
    bluffButton.textContent = `Bluffen [B] × ${bluffs}`;
    const now = performance.now();
    einsButton.disabled = calledEins || !((hands[0].length === 2 && mode === 'turn') || (hands[0].length === 1 && now < einsDeadline));
    catchButton.hidden = aiForgot === null || now > aiForgotUntil;
    picker.classList.toggle('open', mode === 'color');
    host.setScore(`Deine Karten ${hands[0].length}`);
  };
  const setLog = (text: string) => { log.textContent = text; };

  function act(action: PlayerAction) {
    if (!resolveAction) return;
    if (action.type === 'draw' && mode !== 'turn') return;
    if (action.type === 'keep' && mode !== 'drawn') return;
    if (action.type === 'bluff' && (mode !== 'turn' || bluffs <= 0)) return;
    const resolve = resolveAction;
    resolveAction = null;
    resolve(action);
  }
  function pickColor(index: number) {
    if (!resolveColor) return;
    const resolve = resolveColor;
    resolveColor = null;
    resolve(index);
  }
  function callEins() {
    if (einsButton.disabled) return;
    calledEins = true;
    ctx.sfx('success');
    host.pop('EINS!', 'gold', 50, 70);
    render();
  }
  function catchAi() {
    if (aiForgot === null || performance.now() > aiForgotUntil) return;
    const p = aiForgot;
    aiForgot = null;
    for (let k = 0; k < 2; k++) { const card = drawCard(); if (card) hands[p].push(card); }
    say(p, pick(['Scheiße! Ich hab’s doch gedacht!', 'Ach, leck mich.', 'Petze!']));
    setLog(`Erwischt! ${names[p]} zieht 2.`);
    ctx.sfx('coin');
    render();
  }

  host.onKey((event, down) => {
    if (!down || event.repeat) return;
    if (mode === 'color') { const d = Number(/^(?:Digit|Numpad)([1-4])$/.exec(event.code)?.[1] ?? 0); if (d) pickColor(d - 1); return; }
    if (event.code === 'KeyU') { if (!catchButton.hidden) catchAi(); else callEins(); return; }
    if (mode !== 'turn' && mode !== 'drawn') return;
    if (isLeft(event.code)) { cursor = Math.max(0, cursor - 1); render(); }
    else if (isRight(event.code)) { cursor = Math.min(hands[0].length - 1, cursor + 1); render(); }
    else if (isAction(event.code)) {
      const card = hands[0][cursor];
      const top = discard[discard.length - 1];
      if (card && ((mode === 'turn' && canPlay(card, top, color)) || (mode === 'drawn' && drawnCard?.id === card.id))) act({ type: 'play', index: cursor });
      else ctx.sfx('fail');
    } else if (event.code === 'KeyZ' || event.code === 'KeyD') act({ type: mode === 'drawn' ? 'keep' : 'draw' });
    else if (event.code === 'KeyB') act({ type: 'bluff' });
  });

  // Ein-Karten-Wächter (Eins-Frist der Spielfigur, vergessene KI-Ansage)
  host.frame((_, now) => {
    if (einsDeadline && now >= einsDeadline) {
      einsDeadline = 0;
      if (!calledEins && hands[0].length === 1) {
        for (let k = 0; k < 2; k++) { const card = drawCard(); if (card) hands[0].push(card); }
        say(1, 'Eins? Ich hab nix gehört! Zieh zwei, Schlafmütze.');
        setLog('Nicht „Eins!“ gerufen – du ziehst 2.');
        ctx.sfx('fail');
        render();
      }
    }
    if (aiForgot !== null && now > aiForgotUntil) { aiForgot = null; render(); }
    const einsOpen = !calledEins && ((hands[0].length === 2 && mode === 'turn') || (hands[0].length === 1 && now < einsDeadline));
    if (einsButton.disabled === einsOpen) render();
    return true;
  });

  const next = (p: number) => (p + dir + 3) % 3;
  let pendingDraw = 0;
  let skip = false;
  const play = async (p: number, index: number) => {
    const card = hands[p].splice(index, 1)[0];
    discard.push(card);
    let chosen = card.color ?? 0;
    if (card.color === null) {
      if (p === 0) {
        mode = 'color';
        render();
        chosen = await new Promise<number>((resolve) => { resolveColor = resolve; });
        mode = 'wait';
      } else chosen = level >= 2 ? favouriteColor(hands[p]) : Math.floor(Math.random() * 4);
    }
    color = chosen;
    if (card.kind === 'skip') skip = true;
    if (card.kind === 'rev') dir = -dir;
    if (card.kind === 'plus2') { pendingDraw = 2; skip = true; }
    if (card.kind === 'wild4') { pendingDraw = 4; skip = true; }
    setLog(`${p === 0 ? 'Du spielst' : `${names[p]} spielt`} ${cardName(card, card.color === null ? chosen : undefined)}.`);
    ctx.sfx(card.kind === 'num' ? 'page' : 'hit');
    if (peeks.get(p) === card.id) refreshPeeks();
    // Eins-Ansage
    if (hands[p].length === 1) {
      if (p === 0) { if (!calledEins) einsDeadline = performance.now() + 2000; }
      else if (Math.random() < forgetChance) { aiForgot = p; aiForgotUntil = performance.now() + 2600; setLog(`${names[p]} hat nur noch eine Karte …`); }
      else { say(p, 'EINS!'); }
    }
    if (hands[p].length !== 1 && p === 0) calledEins = false;
  };

  const playerTurn = async () => {
    mode = 'turn';
    drawnCard = null;
    if (hands[0].length !== 1 && hands[0].length !== 2) calledEins = false;
    render();
    for (;;) {
      const action = await new Promise<PlayerAction>((resolve) => { resolveAction = resolve; });
      if (action.type === 'play') {
        const card = hands[0][action.index];
        const top = discard[discard.length - 1];
        if (!card || !(mode === 'drawn' ? drawnCard?.id === card.id : canPlay(card, top, color))) continue;
        mode = 'wait';
        await play(0, action.index);
        return;
      }
      if (action.type === 'keep') { mode = 'wait'; setLog('Du behältst die Karte.'); return; }
      if (action.type === 'bluff') {
        bluffs--;
        const target = next(0);
        if (Math.random() < bluffChance) {
          const card = drawCard();
          if (card) hands[target].push(card);
          say(target, pick(['Was? Echt? … Na gut, ich zieh.', 'Du verdammter Fuchs, ich glaub dir.']));
          setLog(`Bluff geschluckt – ${names[target]} zieht für dich.`);
          ctx.sfx('success');
        } else {
          for (let k = 0; k < 2; k++) { const card = drawCard(); if (card) hands[0].push(card); }
          say(target, pick(['Netter Versuch, Lügenbaron. Zieh zwei.', 'Ha! Dein Pokerface ist ein Witz.']));
          setLog('Bluff aufgeflogen – du ziehst 2.');
          ctx.sfx('fail');
        }
        mode = 'wait';
        return;
      }
      // ziehen
      const card = drawCard();
      if (!card) { mode = 'wait'; setLog('Stapel leer – weiter.'); return; }
      hands[0].push(card);
      calledEins = false;
      ctx.sfx('pickup');
      if (canPlay(card, discard[discard.length - 1], color)) {
        mode = 'drawn';
        drawnCard = card;
        cursor = hands[0].length - 1;
        setLog(`Gezogen: ${cardName(card)} – ausspielen oder behalten?`);
        render();
        continue;
      }
      setLog(`Gezogen: ${cardName(card)}. Passt nicht.`);
      mode = 'wait';
      return;
    }
  };

  const aiTurn = async (p: number) => {
    render();
    await host.wait(650 + Math.random() * 500);
    const nextP = next(p);
    const index = aiChoose(hands[p], discard[discard.length - 1], color, level, hands[nextP].length, nextP === 0);
    if (index >= 0) { await play(p, index); if (Math.random() < 0.35) say(p, pick(RIVALS[p - 1].play)); return; }
    const card = drawCard();
    if (!card) return;
    hands[p].push(card);
    if (canPlay(card, discard[discard.length - 1], color) && Math.random() < 0.85) {
      render();
      await host.wait(450);
      await play(p, hands[p].length - 1);
      return;
    }
    setLog(`${names[p]} zieht.`);
    if (Math.random() < 0.4) say(p, pick(RIVALS[p - 1].draw));
  };

  refreshPeeks();
  setLog('Du fängst an.');
  let winner = -1;
  for (let guard = 0; guard < 500 && winner < 0; guard++) {
    if (turn === 0) await playerTurn(); else await aiTurn(turn);
    if (hands[turn].length === 0) { winner = turn; break; }
    let following = next(turn);
    if (pendingDraw) {
      for (let k = 0; k < pendingDraw; k++) { const card = drawCard(); if (card) hands[following].push(card); }
      if (following === 0) calledEins = false;
      setLog(`${following === 0 ? 'Du ziehst' : `${names[following]} zieht`} ${pendingDraw} und setzt aus.`);
      if (following !== 0) say(following, pick(['Du Miststück!', 'Ernsthaft jetzt?!', 'Das merk ich mir.']));
      pendingDraw = 0;
    }
    if (skip) { following = next(following); skip = false; }
    turn = following;
    if (peekCount === 1) refreshPeeks();
    render();
  }
  if (winner < 0) winner = hands.map((hand, i) => ({ n: hand.length, i })).sort((a, b) => a.n - b.n)[0].i;
  mode = 'wait';
  render();
  await host.wait(700);
  if (winner === 0) {
    host.summary('Letzte Karte auf den Tisch geknallt. Die anderen gucken dumm.');
    host.summary(pick(['Kralle: „Revanche. Sofort. Und ich misch.“', 'Lucky Lu: „Du hast doch geschummelt, oder? … Bring’s mir bei.“']));
  } else {
    host.summary(`${names[winner]} gewinnt. Du hältst noch ${hands[0].length} Karte${hands[0].length === 1 ? '' : 'n'}.`);
    host.summary(winner === 1 ? 'Kralle: „Eins, zwei, Kralle vorbei!“' : 'Lucky Lu: „Glück? Nee, Talent, Herzchen.“');
  }
  return winner === 0;
}

export const eins: MinigameDef = {
  title: 'Eins!',
  blurb: 'Kartenrunde mit Kralle und Lucky Lu. Farbe oder Zahl bedienen, Gemeinheiten verteilen, bei der vorletzten Karte „Eins!“ brüllen. Wer zuerst blank ist, gewinnt.',
  controls: ['Karte antippen/klicken oder ←/→ + Leertaste', 'Z: ziehen bzw. behalten, U: „Eins!“/„Erwischt!“, B: bluffen', 'Farbwahl: 1–4'],
  bonuses(ctx) {
    const lines: string[] = [];
    const s = ctx.attr('strasse');
    lines.push(s >= 8 ? `Straße ${s}: du siehst je eine Karte beider Gegner` : s >= 5 ? `Straße ${s}: du siehst eine Karte des nächsten Gegners` : `Straße ${s}: ab 5 linst du in fremde Karten`);
    const a = ctx.attr('ausstrahlung');
    lines.push(a >= 5 ? `Ausstrahlung ${a}: ${a >= 8 ? 2 : 1}× bluffen statt ziehen` : `Ausstrahlung ${a}: ab 5 kannst du bluffen`);
    return lines;
  },
  run: playEins,
};
