// akt-fundbuero: Gerda Gleis’ Fundbüro im Bahnhof Mitte. Zuordnungs-Puzzle: Fundstück wählen, dann die Person, der es gehört.
// Falsche Zuordnungen kosten Gerdas Nerven. Straße: Hinweise („wo man suchen muss“) – 4+: einer, 6+: zwei, 8+: drei.
import { h } from '../dom/dom';
import { ending, speaker } from './kit';
import type { MinigameDef } from './types';
import { byLevel, gameButton, pick, shuffle } from './util';

interface Pair { item: string; owner: string; clue: string }
const PAIRS: Pair[] = [
  { item: 'Gebiss mit Goldzahn', owner: 'Opa Knirsch', clue: 'isst seit Tagen nur Suppe und lispelt beim Schimpfen' },
  { item: 'Ein einzelner Rollschuh', owner: 'Rollschuh-Rita', clue: 'humpelt, ein Fuß fühlt sich nackt an' },
  { item: 'Taschenrechner mit Quantum-Logo', owner: 'Herr Bilanz', clue: 'Oberstädter, hat sich verlaufen, zählt nervös an den Fingern' },
  { item: 'Hundeleine ohne Hund', owner: 'Frau Wuff', clue: 'pfeift seit Stunden in jeden Gully' },
  { item: 'Brille mit nur einem Glas', owner: 'Einaug-Ede', clue: 'sagt, er braucht eh nur eins' },
  { item: 'Mikrofon mit Lippenstiftspuren', owner: 'Die Karaoke-Königin', clue: 'singt seit Freitag nur noch ins Feuerzeug' },
  { item: 'Plüsch-Handschellen, pink', owner: 'Das Pärchen aus den Glasarkaden', clue: 'kichert, wird rot, fragt sehr leise nach' },
  { item: 'XXL-Schnuller', owner: 'Türsteher Bulle', clue: 'zwei Meter Muskeln, lutscht neuerdings am Daumen' },
  { item: 'Ölkanister, halb voll', owner: 'Taxi-Toni', clue: 'seine Karre stottert seit gestern wie ein Erstklässler' },
  { item: 'Spielmodul „Champion-Edition“', owner: 'Der kleine Pixelprinz', clue: 'erzählt allen, er sei Champion, kann es aber nicht beweisen' },
  { item: 'Lila Perücke', owner: 'Glatzen-Gabi', clue: 'trägt seit Montag bei 30 Grad eine Wollmütze' },
  { item: 'Notizbuch mit Gedichten über Tauben', owner: 'Der Taubendichter', clue: 'hält jede Taube für eine Muse und jede Muse für eine Taube' },
  { item: 'Anleitung „Arm wechseln für Dummies“', owner: 'Linkshand-Lars', clue: 'frisch operiert, zwei linke Hände, eine davon aus Blech' },
  { item: 'Urne mit Aufschrift „Kurt“', owner: 'Witwe Kurt', clue: 'sucht weinend „ihren Mann“ und meint das wörtlich' },
];

export const fundbuero: MinigameDef = {
  title: 'Fundbüro',
  blurb: 'Gerda Gleis schiebt dir eine Kiste voller Fundstücke rüber. „Draußen stehen die Leute, die was verloren haben. Gib jedem das Richtige. Und wehe, einer kriegt die Urne, der sie nicht will.“',
  controls: ['Fundstück antippen, dann die Person', 'Tastatur: ↑/↓ wählen, ←/→ Spalte wechseln, Leertaste bestätigen', 'H: Hinweis (falls Straße reicht)'],
  bonuses(ctx) {
    const s = ctx.attr('strasse');
    return [`Straße ${s}: ${s >= 8 ? 'drei Hinweise' : s >= 6 ? 'zwei Hinweise' : s >= 4 ? 'ein Hinweis' : 'keine Hinweise'} – du weißt, wo man suchen muss`];
  },
  async run(host, ctx) {
    const level = ctx.level;
    const s = ctx.attr('strasse');
    const count = byLevel(level, [4, 5, 6, 7, 8]);
    const strikesMax = byLevel(level, [4, 3, 3, 2, 2]);
    let hints = s >= 8 ? 3 : s >= 6 ? 2 : s >= 4 ? 1 : 0;
    const seconds = byLevel(level, [80, 90, 100, 110, 120]);
    const pairs = shuffle([...PAIRS]).slice(0, count);
    const items = shuffle(pairs.map((p, i) => i));
    const owners = shuffle(pairs.map((p, i) => i));

    const desk = h('div', { class: 'fb-desk' });
    const left = h('div', { class: 'fb-col items' }, h('div', { class: 'fb-head' }, 'Fundstücke'));
    const right = h('div', { class: 'fb-col owners' }, h('div', { class: 'fb-head' }, 'Wartende'));
    const gerda = speaker('fb-gerda', 'Gerda');
    desk.append(left, right, gerda.el);
    const hintButton = gameButton(`Wo suchen? [H] (${hints})`, () => hint(), 'fb-hint');
    hintButton.hidden = hints <= 0;
    host.stage.append(h('div', { class: 'fb-wrap' }, desk), h('div', { class: 'mg-toolbar' }, hintButton));

    const itemEls = items.map((p) => { const el = h('div', { class: 'fb-card item' }, pairs[p].item); left.append(el); return el; });
    const ownerEls = owners.map((p) => { const el = h('div', { class: 'fb-card owner' }, h('b', null, pairs[p].owner), h('small', null, pairs[p].clue)); right.append(el); return el; });

    const end = ending();
    const matched = new Set<number>();
    let strikes = 0;
    let selected: number | null = null; // Paar-Index des gewählten Fundstücks
    let col: 0 | 1 = 0, row = 0;
    const render = () => {
      itemEls.forEach((el, i) => {
        el.classList.toggle('sel', items[i] === selected);
        el.classList.toggle('done', matched.has(items[i]));
        el.classList.toggle('cursor', !ctx.touch && col === 0 && row === i);
      });
      ownerEls.forEach((el, i) => {
        el.classList.toggle('done', matched.has(owners[i]));
        el.classList.toggle('cursor', !ctx.touch && col === 1 && row === i);
      });
      host.setScore(`Zurückgegeben ${matched.size}/${count}`);
      host.setInfo(`Gerdas Nerven ${'♥'.repeat(Math.max(0, strikesMax - strikes))}`);
    };
    const chooseItem = (pair: number) => { if (end.over || matched.has(pair)) return; selected = pair; ctx.sfx('switch'); render(); };
    const chooseOwner = (pair: number) => {
      if (end.over || matched.has(pair)) return;
      if (selected === null) { gerda.say('Erst das Fundstück, dann die Person. Ich hab da ein System.'); return; }
      if (pair === selected) {
        matched.add(pair);
        ctx.sfx('coin');
        host.pop('Richtig!', 'good', 70, 30);
        if (Math.random() < 0.5) gerda.say(pick(['Na bitte. Wer sagt’s denn.', 'Der guckt glücklich. Ekelhaft.', 'Ordnung muss sein. Sonst kommt das Chaos und klaut alles.']));
        selected = null;
        if (matched.size >= count) end.finish(true);
      } else {
        strikes++;
        ctx.sfx('fail');
        host.pop('Falsch!', 'bad', 70, 30);
        gerda.say(pick(['Nein! Der will keinen Schnuller, der will seine Würde!', 'Bist du blind oder nur blöd?', 'Gib das sofort zurück, du Trampel!']));
        ownerEls[owners.indexOf(pair)].classList.add('shake');
        setTimeout(() => ownerEls[owners.indexOf(pair)].classList.remove('shake'), 350);
        if (strikes >= strikesMax) end.finish(false);
      }
      render();
    };
    const hint = () => {
      if (hints <= 0 || end.over) return;
      const open = pairs.map((p, i) => i).filter((i) => !matched.has(i));
      if (!open.length) return;
      const pair = selected !== null && !matched.has(selected) ? selected : pick(open);
      hints--;
      hintButton.textContent = `Wo suchen? [H] (${hints})`;
      hintButton.disabled = hints <= 0;
      selected = pair;
      const el = ownerEls[owners.indexOf(pair)];
      el.classList.add('hinted');
      host.pop('Da hinten …', 'gold', 70, 20);
      render();
    };
    itemEls.forEach((el, i) => el.addEventListener('pointerdown', (event) => { event.preventDefault(); chooseItem(items[i]); }));
    ownerEls.forEach((el, i) => el.addEventListener('pointerdown', (event) => { event.preventDefault(); chooseOwner(owners[i]); }));
    host.onKey((event, down) => {
      if (!down || event.repeat) return;
      if (event.code === 'ArrowUp' || event.code === 'KeyW') row = (row + count - 1) % count;
      else if (event.code === 'ArrowDown' || event.code === 'KeyS') row = (row + 1) % count;
      else if (event.code === 'ArrowLeft' || event.code === 'KeyA') col = 0;
      else if (event.code === 'ArrowRight' || event.code === 'KeyD') col = 1;
      else if (event.code === 'Space' || event.code === 'Enter' || event.code === 'KeyE') {
        if (col === 0) { chooseItem(items[row]); col = 1; } else chooseOwner(owners[row]);
      } else if (event.code === 'KeyH') hint();
      render();
    });
    render();
    gerda.say('Und Finger weg von der Urne, wenn du dir nicht sicher bist.');

    const clock = host.countdown(seconds);
    const result = await Promise.race([end.done, clock.done.then(() => false)]);
    end.finish(result);
    clock.stop();
    host.summary(`Zurückgegeben ${matched.size}/${count} · Fehlgriffe ${strikes}`);
    host.summary(result ? 'Gerda stempelt deinen Handrücken: „Ehrenamt des Monats. Gibt nix dafür. Aber stolz darfst du sein.“' : 'Gerda nimmt dir die Kiste weg: „Ich mach das seit dreißig Jahren. Du seit drei Minuten. Merkt man.“');
    return result;
  },
};
