// akt-dachrennen (neu, world.md §11 „rom-vexaria-luecke“: Dachsprung-Minispiel mit Aria als Gegnerin, Fr/Sa N wiederholbar).
// Seitenansicht über die Dächer der Neon-Gasse bis zu Opa Gurrmanns Taubenschlag. Springen (Lücken, Lüftungskästen),
// ducken (Wäscheleinen, Kabel). Aria rennt wie eine Abrissbirne und schlägt Gitter einfach durch.
// „Die Lücke“: Spielt man Vex ({ playerIs: 'vex' }), bleibt sie stehen und nimmt die Feuertreppe (Zeitstrafe, kein Sprung).
// Andere Spielfiguren springen sie mit langem Anlauf (Taste länger halten). Perk `dachlaeuferin`: schneller, höher.
// Reflexe: großzügigere Treffer, schneller wieder auf den Beinen. Gleichstand (Fotofinish) zählt als gewonnen.
import { h } from '../dom/dom';
import { ending, speaker } from './kit';
import type { MinigameDef } from './types';
import { byLevel, clamp, isAction, isDown, isUp, pick } from './util';

type Kind = 'gap' | 'vent' | 'line' | 'gitter' | 'luecke';
interface Ob { kind: Kind; at: number; len: number; el: HTMLElement; done: boolean }

const TRACK = 520;
const LUECKE_AT = 300;

export const dachrennen: MinigameDef = {
  title: 'Dachrennen gegen Aria',
  blurb: 'Kreidestrich am Lüftungsschacht, die Kuriere wetten, Vega meldet vom Ausguck die Meter über Funk. Aria lässt den Schläger kreisen: „Regeln: Es gibt keine. Wer zuerst am Taubenschlag ist, gewinnt.“',
  controls: ['Leertaste/↑/Tippen oben: springen (länger halten = weiter)', '↓ halten / Knopf „Ducken“: unter Leinen durch', 'Lücken und Lüftungskästen überspringen, Wäscheleinen unterducken'],
  bonuses(ctx) {
    const lines = [`Reflexe ${ctx.attr('reflexe')}: Fehler verzeihen +${Math.round(ctx.edge('reflexe') * 50)} %, schneller wieder hoch`];
    if (ctx.has({ perk: 'dachlaeuferin' })) lines.push('Dachläuferin: schneller und höher über die Dächer');
    if (ctx.has({ playerIs: 'vex' })) lines.push('Die Lücke … du weißt, was da passiert.');
    return lines;
  },
  async run(host, ctx) {
    const level = ctx.level;
    const reflex = ctx.edge('reflexe');
    const vex = ctx.has({ playerIs: 'vex' });
    const runner = ctx.has({ perk: 'dachlaeuferin' });
    const romance = ctx.has({ romance: 'aria' });
    const base = 12 * (runner ? 1.08 : 1);
    const ariaSpeed = base * byLevel(level, [0.9, 0.94, 0.97, 1.0, 1.03]);
    const forgive = 1 + reflex * 0.5;
    const jumpV = 1.7 * (runner ? 1.12 : 1);

    const roofs = h('div', { class: 'dk-roofs' });
    const track = h('div', { class: 'dk-track' });
    const me = h('div', { class: `dk-runner me${vex ? ' vex' : ''}` });
    const aria = h('div', { class: 'dk-runner aria' });
    const radio = speaker('dk-radio', 'Vega (Funk)');
    const ariaSay = speaker('dk-aria', 'Aria');
    const bar = h('div', { class: 'dk-bar' });
    const meMark = h('i', { class: 'dk-mark me' });
    const ariaMark = h('i', { class: 'dk-mark aria' });
    bar.append(h('span', { class: 'dk-goal' }, 'Taubenschlag'), meMark, ariaMark);
    roofs.append(track, aria, me, radio.el, ariaSay.el);
    const jumpButton = h('button', { type: 'button', class: 'mg-btn mg-big', tabindex: '-1' }, 'SPRINGEN');
    const duckButton = h('button', { type: 'button', class: 'mg-btn', tabindex: '-1' }, 'Ducken');
    host.stage.append(h('div', { class: 'dk-wrap' }, bar, roofs), h('div', { class: 'mg-toolbar' }, duckButton, jumpButton));

    // Strecke
    const obs: Ob[] = [];
    let at = 26;
    while (at < TRACK - 20) {
      if (at < LUECKE_AT && at + 30 > LUECKE_AT) { at = LUECKE_AT + 22; continue; }
      const kind: Kind = pick<Kind>(level >= 3 ? ['gap', 'vent', 'line', 'gitter', 'gap'] : ['gap', 'vent', 'line', 'vent']);
      const len = kind === 'gap' ? 4 + Math.random() * (level >= 4 ? 3 : 2) : 2;
      obs.push({ kind, at, len, el: h('div', { class: `dk-ob ${kind}` }), done: false });
      at += byLevel(level, [24, 21, 19, 17, 15]) * (0.75 + Math.random() * 0.6);
    }
    obs.push({ kind: 'luecke', at: LUECKE_AT, len: 7, el: h('div', { class: 'dk-ob luecke' }, h('span', null, 'DIE LÜCKE')), done: false });
    obs.sort((a, b) => a.at - b.at);
    for (const o of obs) { o.el.style.width = `${o.len * 3}%`; track.append(o.el); }
    const goal = h('div', { class: 'dk-ob goal' }, h('span', null, 'Taubenschlag'));
    track.append(goal);

    const end = ending();
    let pos = 0, ariaPos = 0, v = base, y = 0, vy = 0;
    let holdJump = false, duck = false, stumble = 0, frozen = 0, stairsTo = -1;
    let falls = 0, stumbles = 0, airTime = 0;
    let lastRadio = 0;
    const SCALE = 3; // Prozent Bildbreite je Streckeneinheit
    const ME_X = 22;

    const jump = () => { if (end.over || frozen > 0 || stumble > 0.4) return; if (y <= 0.001) { vy = jumpV; airTime = 0; ctx.sfx('step'); } };
    const press = (on: boolean) => { holdJump = on; if (on) jump(); };
    jumpButton.addEventListener('pointerdown', (e) => { e.preventDefault(); press(true); });
    jumpButton.addEventListener('pointerup', () => press(false));
    jumpButton.addEventListener('pointerleave', () => press(false));
    duckButton.addEventListener('pointerdown', (e) => { e.preventDefault(); duck = true; });
    duckButton.addEventListener('pointerup', () => { duck = false; });
    duckButton.addEventListener('pointerleave', () => { duck = false; });
    roofs.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      const rect = roofs.getBoundingClientRect();
      if (e.clientY - rect.top > rect.height * 0.7) duck = true; else press(true);
    });
    roofs.addEventListener('pointerup', () => { duck = false; press(false); });
    host.onKey((event, down) => {
      if (isAction(event.code) || isUp(event.code)) { if (down && !event.repeat) press(true); else if (!down) press(false); }
      else if (isDown(event.code)) duck = down;
    });

    ariaSay.say('Wer runterfällt, hat verloren und ist tot. In der Reihenfolge.');
    void host.wait(2600).then(() => { if (!end.over) radio.say(vex ? 'Kreide ist trocken. Los, ihr Idiotinnen.' : 'Kreide ist trocken. Los.'); });

    const radioLine = (text: string) => { const now = performance.now(); if (now - lastRadio > 2500) { lastRadio = now; radio.say(text); } };

    host.frame((dt) => {
      if (end.over) return false;
      // Aria: konstant, mit Abrissbirnen-Ruck an Gittern.
      ariaPos += ariaSpeed * dt * (1 + Math.sin(performance.now() / 700) * 0.04);
      if (frozen > 0) {
        frozen -= dt;
        if (frozen <= 0 && stairsTo >= 0) { pos = stairsTo; stairsTo = -1; me.classList.remove('stairs'); }
      } else {
        stumble = Math.max(0, stumble - dt * (1 + reflex * 0.6));
        const want = base * (stumble > 0 ? 0.45 : 1) * (duck ? 0.85 : 1);
        v += (want - v) * Math.min(1, dt * 3);
        pos += v * dt;
        // Sprungphysik (Halten verlängert)
        if (y > 0 || vy > 0) {
          airTime += dt;
          const gravity = holdJump && airTime < 0.45 ? 3.2 : 6.5;
          vy -= gravity * dt;
          y = Math.max(0, y + vy * dt);
          if (y <= 0) { y = 0; vy = 0; }
        }
      }
      // Hindernisse prüfen
      for (const o of obs) {
        if (o.done) continue;
        const rel = pos - o.at;
        if (o.kind === 'luecke') {
          if (vex && rel >= -1.5) {
            o.done = true;
            frozen = 3.4; stairsTo = o.at + o.len + 0.5; v = 0; vy = 0; y = 0;
            pos = o.at - 1.5;
            me.classList.add('stairs');
            ctx.sfx('fail');
            host.pop('Feuertreppe …', 'info', ME_X, 40);
            radio.say('Vex steht. Vex … steht. Okay. Treppe. Ist auch ein Weg.');
            void host.wait(900).then(() => { if (!end.over) ariaSay.say('Du nimmst die TREPPE?!'); });
            continue;
          }
          if (!vex && rel > 0 && rel < o.len) {
            if (y <= 0.02) { o.done = true; falls++; frozen = 2.6; pos = o.at + o.len + 0.5; ctx.sfx('hurt'); host.pop('Abgestürzt! Feuerleiter …', 'bad', ME_X, 40); radioLine('Runter, wieder rauf. Kostet dich drei Sekunden und deine Würde.'); }
          } else if (!vex && rel >= o.len) { o.done = true; host.pop('Über die Lücke!', 'gold', ME_X, 30); radioLine('Gesprungen. Respekt. Mein Herz hat kurz ausgesetzt.'); }
          continue;
        }
        if (o.kind === 'gap') {
          if (rel > 0.3 * forgive && rel < o.len - 0.3 * forgive && y <= 0.02) {
            o.done = true; falls++; frozen = 1.8; y = 0; vy = 0; pos = o.at + o.len + 0.3;
            ctx.sfx('hurt'); host.pop('Abgerutscht!', 'bad', ME_X, 40);
            radioLine(pick(['Fast hätten wir eine Beerdigung gebraucht. Weiter.', 'Kas hätte gesagt: Nicht anhalten.']));
          } else if (rel >= o.len) o.done = true;
        } else if (o.kind === 'vent' || o.kind === 'gitter') {
          const height = o.kind === 'gitter' ? 0.2 : 0.12;
          if (rel > 0 && rel < 0.8) {
            if (y < height / forgive) { o.done = true; stumbles++; stumble = 1; ctx.sfx('hit'); host.pop(o.kind === 'gitter' ? 'Gitter!' : 'Kasten!', 'bad', ME_X, 40); }
          } else if (rel >= 0.8) o.done = true;
        } else if (o.kind === 'line') {
          if (rel > 0 && rel < 0.8) {
            if (!duck && y < 0.5) { o.done = true; stumbles++; stumble = 0.9; ctx.sfx('hit'); host.pop('Wäscheleine!', 'bad', ME_X, 40); if (Math.random() < 0.5) ariaSay.say(pick(['Hahaha! Du hast da ’ne Unterhose im Gesicht!', 'Steht dir! Behalt sie!'])); }
          } else if (rel >= 0.8) o.done = true;
        }
      }
      // Aria-Ereignisse (Vega am Funk)
      const gap = Math.round(ariaPos - pos);
      if (gap > 0 && gap < 5 && Math.random() < dt * 0.6) radioLine(`Abstand ${gap} Meter. ${gap <= 2 ? 'Aria, das war ein Geländer. Das war Hunters Geländer.' : 'Aria holt sich alles, was im Weg steht.'}`);
      if (Math.random() < dt * 0.05 && ariaPos > pos) { ariaSay.say(romance ? pick(['Hör auf, beim Rennen so gut auszusehen, Postbotin. Das ist Ablenkung.', 'Wenn du gewinnst, darfst du dir was wünschen. Überleg gut.', 'Ich guck nur zurück, um zu sehen, ob du mir hinterherguckst.']) : pick(['Na, Postbotin? Siehst du meine Hacken?', 'Das ist kein Rennen, das ist ein Spaziergang mit Vorsprung!'])); }
      if (Math.random() < dt * 0.05 && ariaPos < pos) { ariaSay.say(romance ? pick(['Ich lass dich nur vorne, damit ich gucken kann.', 'Lauf ruhig weg. Ich krieg dich sowieso.']) : pick(['Das ist Betrug!', 'Ich hol dich, und dann gnade dir der Taubengott!'])); }
      // Darstellung
      track.style.transform = `translateX(${-pos * SCALE + ME_X}%)`;
      for (const o of obs) o.el.style.left = `${o.at * SCALE}%`;
      goal.style.left = `${TRACK * SCALE}%`;
      me.style.bottom = `calc(30% + ${y * 34}%)`;
      me.classList.toggle('duck', duck && y <= 0.01);
      me.classList.toggle('trip', stumble > 0.5);
      aria.style.left = `${clamp(ME_X + (ariaPos - pos) * SCALE, -8, 108)}%`;
      meMark.style.left = `${clamp(pos / TRACK, 0, 1) * 94}%`;
      ariaMark.style.left = `${clamp(ariaPos / TRACK, 0, 1) * 94}%`;
      host.setScore(gap > 0 ? `Aria vorn: ${gap} m` : gap < 0 ? `Du vorn: ${-gap} m` : 'Kopf an Kopf');
      host.setInfo(`${Math.round(clamp(pos / TRACK, 0, 1) * 100)} %`);
      if (pos >= TRACK || ariaPos >= TRACK) {
        const margin = pos - ariaPos;
        end.finish(margin >= -0.8);
        return false;
      }
      return true;
    });

    const won = await end.done;
    const margin = pos - ariaPos;
    const tie = Math.abs(margin) <= 0.8;
    host.summary(tie ? 'Vega: „Gleichstand. Auf den Zentimeter. Ich hab gemessen. Zweimal.“' : won ? `Du bist ${Math.round(margin)} m vor Aria am Taubenschlag.` : `Aria ist ${Math.round(-margin)} m vor dir am Taubenschlag und johlt.`);
    host.summary(`Stolperer ${stumbles} · Abrutscher ${falls}${vex ? ' · Feuertreppe genommen' : ''}`);
    if (vex) host.summary('Ihr landet beide in Opa Gurrmanns Wäscheleine. Aria: „Ich lieg auf dir.“ – Vex: „Merk ich.“ – „Ich steh gleich auf.“ – „Gleich ist nicht jetzt.“');
    else if (won) host.summary(romance ? 'Aria wirft sich neben dir aufs Dach, außer Atem und viel zu nah: „Nochmal. Sofort. Und diesmal guck ich nicht auf deinen Hintern.“' : 'Aria wirft sich neben dir aufs Dach: „Nochmal. Sofort. Das war Glück. Dreckiges, schönes Glück.“');
    else host.summary('Aria tippt dir mit dem Schläger auf die Brust: „Taschentuch? Für dein Ego.“');
    return won;
  },
};
