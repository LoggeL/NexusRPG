// akt-strandlauf: „Wer zuerst am Wasser ist!“ am `das-meer` (world.md §3.9, Aria-Kanon). Sprint über den Strand gegen Aria:
// links/rechts im Wechsel tippen (gleiche Taste zweimal = im Sand weggerutscht), über Sandburgen, Krabbe Karl und Quallen hüpfen.
// Körper: mehr Schub je Schritt. Reflexe: längerer Sprung, schneller wieder auf den Beinen. Gleichstand zählt als Sieg.
import './minigames3.css';
import { h } from '../dom/dom';
import { ending, speaker } from './kit';
import { alternateInput } from './kit3';
import type { MinigameDef } from './types';
import { byLevel, clamp, gameButton, isUp, pick } from './util';

const TRACK = 160;
type Kind = 'burg' | 'karl' | 'qualle';
interface Ob { at: number; kind: Kind; el: HTMLElement; done: boolean; x: number }

export const strandlauf: MinigameDef = {
  title: 'Wer zuerst am Wasser ist!',
  blurb: 'Sonnenuntergang, die Crew am Lagerfeuer, Aria zieht die Stiefel aus und grinst: „Wer zuerst am Wasser ist!“ Sie ist schon losgerannt, bevor sie fertig geredet hat. Natürlich.',
  controls: ['← und → (A/D) im Wechsel, oder die Knöpfe LINKS/RECHTS abwechselnd tippen', '↑ / Leertaste / „Hüpf!“: über Sandburgen, Krabbe Karl und Quallen', 'Zweimal dieselbe Seite = Fuß im Sand, langsamer'],
  bonuses(ctx) {
    return [
      `Körper ${ctx.attr('koerper')}: Schub je Schritt +${Math.round(ctx.edge('koerper') * 35)} %`,
      `Reflexe ${ctx.attr('reflexe')}: Sprung +${Math.round(ctx.edge('reflexe') * 40)} %, schneller wieder auf den Beinen`,
    ];
  },
  async run(host, ctx) {
    const level = ctx.level;
    const body = ctx.edge('koerper');
    const reflex = ctx.edge('reflexe');
    const romance = ctx.has({ romance: 'aria' });
    const vex = ctx.has({ playerIs: 'vex' });
    const impulse = 1.55 * (1 + body * 0.35);
    const airTime = 0.55 * (1 + reflex * 0.4);
    const ariaSpeed = byLevel(level, [4.9, 5.4, 5.9, 6.3, 6.7]);
    const obstacles = byLevel(level, [3, 4, 5, 6, 7]);

    const beach = h('div', { class: 'sl-beach' });
    const sea = h('div', { class: 'sl-sea' });
    const me = h('div', { class: 'sl-runner me' });
    const aria = h('div', { class: 'sl-runner aria' });
    const ariaSay = speaker('sl-aria', 'Aria');
    const crew = speaker('sl-crew', 'Vega');
    beach.append(sea, h('div', { class: 'sl-lane top' }), h('div', { class: 'sl-lane bottom' }), aria, me, ariaSay.el, crew.el);
    const leftPad = h('button', { type: 'button', class: 'mg-btn sl-pad', tabindex: '-1' }, '◀ LINKS');
    const rightPad = h('button', { type: 'button', class: 'mg-btn sl-pad', tabindex: '-1' }, 'RECHTS ▶');
    const jumpButton = gameButton('Hüpf!', () => jump(), 'sl-jump');
    host.stage.append(h('div', { class: 'sl-wrap' }, beach), h('div', { class: 'mg-toolbar sl-pads' }, leftPad, jumpButton, rightPad));

    const xOf = (pos: number) => 4 + (clamp(pos, 0, TRACK) / TRACK) * 84;
    const obs: Ob[] = [];
    for (let i = 0; i < obstacles; i++) {
      const at = 22 + ((TRACK - 34) * (i + 0.3 + Math.random() * 0.4)) / obstacles;
      const kind: Kind = at > TRACK - 30 ? 'qualle' : pick<Kind>(['burg', 'karl', 'burg']);
      const el = h('div', { class: `sl-ob ${kind}` }, kind === 'karl' ? 'Karl' : '');
      el.style.left = `${xOf(at)}%`;
      beach.append(el);
      obs.push({ at, kind, el, done: false, x: at });
    }

    const end = ending();
    let pos = 0, v = 0, y = 0, air = 0, stumble = 0, ariaPos = 0, ariaTrip = 0;
    let steps = 0, slips = 0, hits = 0;
    const ariaTripAt = level <= 3 ? 50 + Math.random() * 60 : -1;
    let lastSay = 0;
    const say = (text: string) => { const now = performance.now(); if (now - lastSay > 2200) { lastSay = now; ariaSay.say(text); } };
    const jump = () => { if (end.over || air > 0 || stumble > 0.3) return; air = airTime; ctx.sfx('step'); };
    alternateInput(host, leftPad, rightPad, (ok) => {
      if (end.over || stumble > 0 || air > 0) return;
      if (ok) { v += impulse; steps++; }
      else { v *= 0.7; slips++; if (slips % 4 === 1) host.pop('Sand!', 'bad', xOf(pos), 60); }
    });
    host.onKey((event, down) => { if (down && !event.repeat && (isUp(event.code) || event.code === 'Space')) jump(); });

    say(romance ? 'Wenn ich gewinne, trägst du mich zurück. Wenn du gewinnst … überleg ich mir was.' : 'Hopp, hopp! Das Meer wartet nicht auf Weicheier!');
    void host.wait(2400).then(() => { if (!end.over) crew.say('Ich hab nichts gesagt, aber Aria ist schon fünf Meter weg.'); });

    host.frame((dt) => {
      if (end.over) return false;
      // Spielfigur
      if (stumble > 0) stumble = Math.max(0, stumble - dt * (1 + reflex * 0.6));
      v -= v * 1.8 * dt;
      v = clamp(v, 0, 9.5);
      if (stumble > 0) v = Math.min(v, 1.5);
      pos += v * dt;
      if (air > 0) { air -= dt; y = Math.sin(clamp(1 - air / airTime, 0, 1) * Math.PI); } else y = 0;
      for (const o of obs) {
        if (o.done) continue;
        const rel = pos - o.at;
        if (rel > -0.9 && rel < 0.9 && y < 0.35) {
          o.done = true; hits++; stumble = 1; v *= 0.4;
          ctx.sfx('hit');
          o.el.classList.add('bonk');
          host.pop(o.kind === 'karl' ? 'Krabbe Karl!' : o.kind === 'qualle' ? 'Qualle! Autsch!' : 'Sandburg platt!', 'bad', xOf(pos), 55);
          if (o.kind === 'karl') say('Karl! Der hat dir eine Muschel geschenkt und du trittst ihn?!');
          else if (o.kind === 'burg') crew.say('Das war die Burg von irgendeinem Kind. Du Monster.');
        } else if (rel >= 0.9) o.done = true;
      }
      // Aria
      if (ariaTrip > 0) ariaTrip -= dt;
      else {
        ariaPos += ariaSpeed * dt * (1 + Math.sin(performance.now() / 600) * 0.06);
        if (ariaTripAt > 0 && ariaPos >= ariaTripAt) { ariaTrip = 1.3; say('KARL! Aus dem Weg, du Blechpfanne!'); }
      }
      const gap = ariaPos - pos;
      if (Math.random() < dt * 0.25) {
        if (gap > 3) say(romance ? pick(['Na, guckst du mir hinterher? Ich seh das!', 'Lauf schneller, dann darfst du mich fangen.']) : vex ? pick(['Hier gibt’s keine Lücken, Postbotin! Nur Sand!', 'Wasser ist kein Dach, was? Da bist du lahm!']) : pick(['Hast du Blei in den Hosen?', 'Ich hab Zeit! Ich setz mich gleich hin!']));
        else if (gap < -3) say(romance ? pick(['Hey! Nicht so schnell, ich will doch gewinnen!', 'Du schummelst! Mit deinem Hintern, der lenkt ab!']) : pick(['Das ist Betrug!', 'Warte! WARTE! Ich hab Sand im Auge!']));
      }
      // Darstellung
      me.style.left = `${xOf(pos)}%`;
      me.style.transform = `translate(-50%, ${-y * 60}%)`;
      me.classList.toggle('trip', stumble > 0.3);
      aria.style.left = `${xOf(ariaPos)}%`;
      aria.classList.toggle('trip', ariaTrip > 0);
      host.setScore(gap > 0.5 ? `Aria vorn: ${Math.round(gap)} m` : gap < -0.5 ? `Du vorn: ${Math.round(-gap)} m` : 'Kopf an Kopf');
      host.setInfo(`${Math.round(clamp(pos / TRACK, 0, 1) * 100)} %`);
      if (pos >= TRACK || ariaPos >= TRACK) { end.finish(pos >= ariaPos - 0.6); return false; }
      return true;
    });

    const clock = host.countdown(byLevel(level, [70, 60, 55, 50, 45]));
    const won = await Promise.race([end.done, clock.done.then(() => false)]);
    end.finish(won);
    clock.stop();
    const tie = Math.abs(pos - ariaPos) < 0.6;
    host.summary(`Schritte ${steps} · Ausrutscher ${slips} · Hindernisse erwischt ${hits}`);
    host.summary(tie ? 'Gleichzeitig ins Wasser. Platsch. Vega: „Unentschieden. Ihr seid beide nass, ihr habt beide gewonnen.“'
      : won ? (romance ? 'Du bist zuerst im Wasser. Aria springt dir hinterher, packt dich mit der Zerberster-Hand und zieht dich unter. Als ihr auftaucht, ist sie sehr nah. „Okay. Du hast gewonnen. Was willst du?“' : 'Du bist zuerst im Wasser. Aria wirft sich hinterher, spritzt dich nass: „Das war Glück! Dreckiges, salziges Glück!“')
      : (vex ? 'Aria steht bis zum Bauch im Wasser: „Endlich gewinn ich mal!“ Vex an der Wasserlinie: „Wasser ist kein Dach. Da bin ich lahm.“' : 'Aria steht schon bis zum Bauch in der Brandung und streckt dir die Zerberster-Hand hin: „Komm rein, Lahmarsch! Hier gibt’s keine Verlierer! Nur nass!“'));
    return won;
  },
};
