// akt-suppenkueche: Morgens bei Mutter Brühe in der Rohrsiedlung. Die Schlange rückt im Takt vor; jede Person will ihre Menge
// (ein Schluck, halb, randvoll). Kelle halten = schöpfen, loslassen = Schüssel fertig. Im Takt loslassen gibt Extrapunkte.
// Kein Attribut (world.md §3.9). Stufe: schnellerer Takt, schmalere Füllmarken, mehr Leute.
import { h } from '../dom/dom';
import { ending, holdInput, speaker } from './kit';
import type { MinigameDef } from './types';
import { byLevel, pick } from './util';

const WANTS = [
  { label: 'Ein Schluck', fill: 0.3 },
  { label: 'Halbe Schüssel', fill: 0.55 },
  { label: 'Randvoll, bitte', fill: 0.88 },
];
const GUESTS = ['Rohrbieger Paul', 'Die Zwillinge Mo & Mo', 'Ein Kanalarbeiter', 'Oma Strick', 'Ein Kurier in Eile', 'Der Mann ohne Löffel', 'Schichtarbeiterin vom Pumpwerk', 'Ein Hund (bringt Schüssel im Maul)', 'Zwei Rostzähne, ganz brav', 'Ein Typ im Anzug, der so tut, als wär er nicht hier'];
const BRUEHE = ['Schöpf – und – gieß. Schöpf – und – gieß. Wie beim Tanzen.', 'Nicht kleckern, Schatz. Kleckern ist Verschwendung mit Ansage.', 'Jeder kriegt, was er braucht. Nicht, was er will.'];
const GOSSIP = ['Hab gehört, im Pumpwerk spukt’s. Ich glaub eher, da säuft einer.', 'Die Rostzähne zahlen neuerdings Schutzgeld an jemanden. Frag mich nicht, an wen.', 'Der Richter war hier. Inkognito. Mit Hut. Jeder hat ihn erkannt.', 'Die Kinder aus dem Nest haben wieder was ausgeheckt. Ich riech das.'];

export const suppenkueche: MinigameDef = {
  title: 'Suppenküche',
  blurb: 'Mutter Brühe drückt dir die Kelle in die Hand. Die Schlange reicht bis zum Rohrschacht. „Im Takt bleiben, Schatz. Die Leute haben Hunger, keine Geduld.“',
  controls: ['Leertaste / Kelle gedrückt halten: schöpfen', 'Loslassen, wenn die Schüssel die Marke erreicht', 'Im Takt loslassen: Extrapunkt'],
  bonuses: () => ['Herz zählt hier mehr als Muskeln. Kein Attribut hilft.'],
  async run(host, ctx) {
    const level = ctx.level;
    const total = byLevel(level, [8, 9, 10, 11, 12]);
    const need = byLevel(level, [5, 6, 7, 8, 9]);
    const beat = byLevel(level, [0.9, 0.8, 0.72, 0.65, 0.58]);
    const band = byLevel(level, [0.12, 0.1, 0.09, 0.08, 0.07]);
    const patienceBeats = byLevel(level, [6, 5, 5, 4, 4]);

    const kitchen = h('div', { class: 'sk-kitchen' });
    const pot = h('div', { class: 'sk-pot' });
    const ladle = h('div', { class: 'sk-ladle' });
    const bowl = h('div', { class: 'sk-bowl' });
    const soup = h('i', { class: 'sk-soup' });
    const markEl = h('b', { class: 'sk-mark' });
    bowl.append(soup, markEl);
    const guestEl = h('div', { class: 'sk-guest' });
    const wantEl = h('div', { class: 'sk-want' });
    const queueEl = h('div', { class: 'sk-queue' });
    const metro = h('div', { class: 'sk-beat' });
    const bruehe = speaker('sk-bruehe', 'Mutter Brühe');
    kitchen.append(pot, ladle, bowl, guestEl, wantEl, queueEl, metro, bruehe.el);
    host.stage.append(h('div', { class: 'sk-wrap' }, kitchen));
    const hold = holdInput(host, kitchen);

    const end = ending();
    let served = 0, good = 0, onBeat = 0, gone = 0, bonus = 0;
    let guest = 0;
    let fill = 0, pouring = false, waitBeats = 0;
    let want = WANTS[0];
    let beatT = 0;
    let cooldown = 0;
    const order = Array.from({ length: total }, (_, i) => GUESTS[i % GUESTS.length]);

    const nextGuest = () => {
      if (guest >= total) { end.finish(good + Math.floor(bonus / 3) >= need); return; }
      want = WANTS[Math.floor(Math.random() * WANTS.length)];
      fill = 0;
      waitBeats = 0;
      guestEl.textContent = order[guest];
      guestEl.classList.remove('step'); void guestEl.offsetWidth; guestEl.classList.add('step');
      wantEl.textContent = `„${want.label}“`;
      markEl.style.bottom = `${(want.fill - band) * 100}%`;
      markEl.style.height = `${band * 2 * 100}%`;
      soup.style.height = '0%';
      queueEl.textContent = '';
      for (let i = 0; i < Math.min(5, total - guest - 1); i++) queueEl.append(h('i', null));
      host.setInfo(`Person ${guest + 1}/${total}`);
    };
    const serve = () => {
      const diff = Math.abs(fill - want.fill);
      const sinceBeat = Math.min(beatT, beat - beatT);
      const inBeat = sinceBeat <= 0.14;
      served++;
      if (diff <= band) {
        good++;
        if (inBeat) { onBeat++; bonus++; host.pop('Im Takt! Perfekt!', 'gold', 50, 30); ctx.sfx('coin'); }
        else { host.pop(diff < band / 2 ? 'Genau richtig!' : 'Passt!', 'good', 50, 30); ctx.sfx('cookie'); }
      } else {
        host.pop(fill > want.fill ? 'Übergeschwappt!' : 'Zu wenig!', 'bad', 50, 30);
        ctx.sfx('fail');
        if (Math.random() < 0.5) bruehe.say(fill > want.fill ? 'Jetzt hat er Suppe in den Schuhen. Toll.' : 'Davon wird nicht mal ’ne Ratte satt.');
      }
      if (served % 3 === 0) bruehe.say(pick(GOSSIP));
      guest++;
      cooldown = 0.35;
      host.setScore(`Gut bedient ${good}/${need}${bonus ? ` · Takt +${Math.floor(bonus / 3)}` : ''}`);
    };
    bruehe.say(pick(BRUEHE));
    host.setScore(`Gut bedient 0/${need}`);
    nextGuest();

    host.frame((dt) => {
      if (end.over) return false;
      beatT += dt;
      if (beatT >= beat) {
        beatT -= beat;
        metro.classList.remove('tick'); void metro.offsetWidth; metro.classList.add('tick');
        if (cooldown <= 0 && !pouring) {
          waitBeats++;
          if (waitBeats >= patienceBeats) {
            gone++; guest++;
            host.pop('Weitergezogen …', 'bad', 50, 30);
            bruehe.say('Der ist hungrig weitergegangen. Das merk ich mir. Und du dir auch.');
            nextGuest();
          }
        }
      }
      if (cooldown > 0) { cooldown -= dt; if (cooldown <= 0) nextGuest(); return true; }
      if (hold.held) {
        pouring = true;
        fill = Math.min(1.05, fill + dt * 0.75);
        ladle.classList.add('pour');
      } else if (pouring) {
        pouring = false;
        ladle.classList.remove('pour');
        serve();
      }
      soup.style.height = `${Math.min(100, fill * 100)}%`;
      bowl.classList.toggle('spill', fill > 1);
      return true;
    });

    const clock = host.countdown(Math.round(total * beat * patienceBeats + 15));
    const result = await Promise.race([end.done, clock.done.then(() => null)]);
    const won = (result ?? false) || good + Math.floor(bonus / 3) >= need;
    end.finish(won);
    host.summary(`Gut bedient ${good} von ${served}${onBeat ? ` · ${onBeat}× im Takt` : ''}${gone ? ` · ${gone} weitergezogen` : ''}`);
    host.summary(won ? 'Mutter Brühe küsst dich auf die Stirn. Es riecht nach Zwiebeln. „Du kommst wieder, ja? Die Leute mögen dich.“' : 'Mutter Brühe nimmt dir die Kelle ab: „Morgen wieder, Schatz. Hunger macht keine Pause, du schon.“');
    return won;
  },
};
