// akt-schrottbot-rennen: Schrottbot-Rennen in der `rennhalle-9` (Mi/Sa N, world.md §3.9). Erst im Fahrerlager einen von vier
// Bots wählen (Tempo, Grip, Panzer, manchmal eine Macke), dann auf drei Spuren gegen drei Bots: Ölflecken, Schrott und
// Gegner meiden, Turbo-Felder mitnehmen, Turbo zünden. Technik: Bot-Werte erkennen (unter 5 nur Gerüchte, 5–6 grob, 7+ genau
// mit Macke). Platz je Stufe: 1–2 Podium/Top 2, ab 4 nur Sieg.
import './minigames3.css';
import { h } from '../dom/dom';
import { ending, speaker } from './kit';
import { chooseTimed } from './kit3';
import type { MinigameDef } from './types';
import { byLevel, clamp, isAction, isLeft, isRight, isUp, pick, shuffle } from './util';

type Quirk = 'montag' | 'turbo' | 'klebt' | null;
interface Bot { name: string; tempo: number; grip: number; panzer: number; quirk: Quirk }
const NAMES = ['Blechbüchse', 'Rostiger Rudi', 'Zahnrad-Zora', 'Der Toaster', 'Kettensäge-Kalle', 'Mini-Mops', 'Schraubstock-Susi', 'Gullydeckel 3000'];
const QUIRK_TEXT: Record<Exclude<Quirk, null>, string> = { montag: 'Montagsbot: bleibt einmal kurz stehen', turbo: 'Doppelturbo: ein Turbo mehr', klebt: 'Klebereifen: Öl macht ihm nichts' };
const RIVALS = ['Der Fleischwolf', 'Kleine Hexe', 'Opa Blechs Liebling'];
type Kind = 'oel' | 'schrott' | 'pad';
interface Thing { d: number; lane: number; kind: Kind; el: HTMLElement; done: boolean }
const LENGTH = 760;

function rollBot(name: string): Bot {
  const stats = [1, 1, 1];
  let points = 6 + Math.floor(Math.random() * 3);
  while (points > 0) { const i = Math.floor(Math.random() * 3); if (stats[i] < 5) { stats[i]++; points--; } }
  const quirk: Quirk = Math.random() < 0.45 ? pick<Quirk>(['montag', 'turbo', 'klebt', 'montag']) : null;
  return { name, tempo: stats[0], grip: stats[1], panzer: stats[2], quirk };
}

export const schrottbotRennen: MinigameDef = {
  title: 'Schrottbot-Rennen',
  blurb: 'Rennhalle 9, Wellblech, Zielflagge, Ölgestank. Auf der Bahn kreischen Bots aus Kühlschränken und Rasenmähern. Such dir einen aus, der nicht beim Start explodiert, und dann: Vollgas.',
  controls: ['Fahrerlager: Bot wählen (Antippen oder Ziffer)', 'Rennen: ←/→ oder links/rechts tippen = Spur wechseln', '↑ / Leertaste / „Turbo“: Turbo zünden · Öl und Schrott meiden, grüne Felder mitnehmen'],
  bonuses(ctx) {
    const t = ctx.attr('technik');
    return [`Technik ${t}: ${t >= 7 ? 'du liest Bot-Werte und Macken wie ein Buch' : t >= 5 ? 'du schätzt die Werte grob' : 'nur Gerüchte aus dem Fahrerlager'}`];
  },
  async run(host, ctx) {
    const level = ctx.level;
    const t = ctx.attr('technik');
    const need = byLevel(level, [3, 2, 2, 1, 1]);

    // --- Fahrerlager ---
    const paddock = h('div', { class: 'sb-paddock' }, h('div', { class: 'sb-title' }, 'Fahrerlager – wähl deinen Bot'));
    const mech = speaker('sb-mech', 'Ansagerin');
    paddock.append(mech.el);
    host.stage.append(paddock);
    const bots = shuffle([...NAMES]).slice(0, 4).map(rollBot);
    const bar = (v: number) => '▮'.repeat(v) + '▯'.repeat(5 - v);
    const range = (v: number) => `${Math.max(1, v - 1)}–${Math.min(5, v + 1)}`;
    const rumor = (b: Bot) => {
      const best = [['tempo', b.tempo, 'Soll schnell sein. Sagt der Besitzer.'], ['grip', b.grip, 'Klebt in den Kurven wie Kaugummi.'], ['panzer', b.panzer, 'Gepanzert wie ein Kühlschrank. War wohl mal einer.']] as const;
      const sorted = [...best].sort((a, c) => c[1] - a[1]);
      return (level >= 3 && Math.random() < 0.3 ? sorted[1] : sorted[0])[2];
    };
    const cards = bots.map((b) => h('span', { class: 'sb-card' }, h('b', null, b.name),
      t >= 7 ? h('small', null, `Tempo ${bar(b.tempo)} · Grip ${bar(b.grip)} · Panzer ${bar(b.panzer)}${b.quirk ? ` · ${QUIRK_TEXT[b.quirk]}` : ''}`)
        : t >= 5 ? h('small', null, `Tempo ~${range(b.tempo)} · Grip ~${range(b.grip)} · Panzer ~${range(b.panzer)}`)
          : h('small', null, `„${rumor(b)}“`)));
    mech.say(t >= 7 ? 'Du guckst unter die Haube, als hättest du die Dinger gebaut.' : 'Augen auf. Die Hälfte hier ist mit Klebeband zusammengehalten.');
    const choice = await chooseTimed(host, paddock, cards, 0, 'sb-choices');
    const bot = bots[Math.max(0, choice)];
    paddock.remove();

    // --- Rennen ---
    const speed = 15 + bot.tempo * 2.2;
    const laneTime = 0.42 / (0.6 + bot.grip * 0.15);
    let hp = 2 + bot.panzer;
    const hpMax = hp;
    let turbos = 2 + (bot.quirk === 'turbo' ? 1 : 0);
    const rivalBase = byLevel(level, [0.84, 0.9, 0.96, 1.01, 1.06]);
    const rivals = RIVALS.map((name, i) => ({ name, d: -6 - i * 4, lane: i === 1 ? 0 : i === 2 ? 2 : 1, v: (19 + i * 1.6) * rivalBase, bump: 0, el: h('div', { class: `sb-bot rival r${i}` }, h('span', null, name)) }));

    const track = h('div', { class: 'sb-track' });
    const me = h('div', { class: 'sb-bot me' }, h('span', null, bot.name));
    const finish = h('div', { class: 'sb-finish' });
    const hud = h('div', { class: 'sb-hud' });
    const voice = speaker('sb-voice', 'Ansagerin');
    track.append(h('i', { class: 'sb-lane l1' }), h('i', { class: 'sb-lane l2' }), finish, ...rivals.map((r) => r.el), me, hud, voice.el);
    const turboButton = h('button', { type: 'button', class: 'mg-btn mg-big', tabindex: '-1' }, 'TURBO');
    host.stage.append(h('div', { class: 'sb-wrap' }, track), h('div', { class: 'mg-toolbar' }, turboButton));

    const things: Thing[] = [];
    let at = 60;
    const gapBase = byLevel(level, [42, 36, 31, 27, 23]);
    while (at < LENGTH - 30) {
      const kind: Kind = Math.random() < 0.22 ? 'pad' : Math.random() < 0.5 ? 'oel' : 'schrott';
      const lane = Math.floor(Math.random() * 3);
      things.push({ d: at, lane, kind, el: h('div', { class: `sb-thing ${kind}` }), done: false });
      if (level >= 3 && Math.random() < 0.35) {
        const other = (lane + 1 + Math.floor(Math.random() * 2)) % 3;
        things.push({ d: at + 2, lane: other, kind: Math.random() < 0.5 ? 'oel' : 'schrott', el: h('div', { class: 'sb-thing schrott' }), done: false });
      }
      at += gapBase * (0.7 + Math.random() * 0.6);
    }
    for (const th of things) track.append(th.el);

    const end = ending();
    let pos = 0, lane = 1, laneX = 1, v = 0, boost = 0, slow = 0, stopped = 0, raceTime = 0;
    let oil = 0, junk = 0, pads = 0;
    let montagAt = bot.quirk === 'montag' ? 150 + Math.random() * 400 : -1;
    const switchLane = (dir: number) => { if (!end.over && stopped <= 0) lane = clamp(lane + dir, 0, 2); };
    const fire = () => {
      if (end.over || turbos <= 0 || boost > 0) return;
      turbos--; boost = 2; ctx.sfx('engine'); host.pop('TURBO!', 'gold', 20 + laneX * 30, 70);
    };
    turboButton.addEventListener('pointerdown', (e) => { e.preventDefault(); fire(); });
    track.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      const r = track.getBoundingClientRect();
      switchLane(e.clientX - r.left < r.width / 2 ? -1 : 1);
    });
    host.onKey((e, down) => {
      if (!down || e.repeat) return;
      if (isLeft(e.code)) switchLane(-1); else if (isRight(e.code)) switchLane(1);
      else if (isUp(e.code) || isAction(e.code)) fire();
    });
    voice.say(pick(['Und los geht’s! Möge der am wenigsten Rostige gewinnen!', 'Startschuss! Irgendwer verliert heute ein Rad, ich spür’s.']));

    const placeOf = () => 1 + rivals.filter((r) => r.d > pos).length;
    host.frame((dt) => {
      if (end.over) return false;
      raceTime += dt;
      // Spieler
      if (stopped > 0) stopped -= dt;
      if (montagAt > 0 && pos >= montagAt) { montagAt = -1; stopped = 1.3; voice.say(`${bot.name} bleibt stehen! Montagsbot! Jemand gibt ihm einen Tritt!`); ctx.sfx('fail'); }
      if (boost > 0) boost -= dt;
      if (slow > 0) slow -= dt;
      const target = stopped > 0 ? 0 : speed * (boost > 0 ? 1.4 : 1) * (slow > 0 ? 0.55 : 1) * (0.75 + 0.25 * (hp / hpMax));
      v += (target - v) * Math.min(1, dt * 2.5);
      pos += v * dt;
      laneX += clamp(lane - laneX, -dt / laneTime, dt / laneTime);
      const myLane = Math.round(laneX);
      // Dinge auf der Bahn
      for (const th of things) {
        if (th.done) continue;
        const rel = th.d - pos;
        th.el.style.top = `${82 - rel * 0.9}%`;
        th.el.style.left = `${20 + th.lane * 30}%`;
        th.el.style.display = rel < -12 || rel > 95 ? 'none' : '';
        if (Math.abs(rel) < 1.6 && myLane === th.lane && Math.abs(laneX - th.lane) < 0.45) {
          th.done = true;
          th.el.classList.add('hit');
          if (th.kind === 'pad') { pads++; boost = Math.max(boost, 1.2); ctx.sfx('pickup'); host.pop('Schub!', 'good', 20 + th.lane * 30, 70); }
          else if (th.kind === 'oel') {
            oil++;
            if (bot.quirk === 'klebt' || Math.random() < bot.grip * 0.12) { host.pop('Gehalten!', 'info', 20 + th.lane * 30, 70); }
            else { slow = 1.1; ctx.sfx('hit'); host.pop('Öl!', 'bad', 20 + th.lane * 30, 70); }
          } else {
            junk++; hp--; slow = 0.7; ctx.sfx('hurt'); host.pop('Schrott!', 'bad', 20 + th.lane * 30, 70);
            track.classList.remove('shake'); void track.offsetWidth; track.classList.add('shake');
            if (hp <= 0) { voice.say(`${bot.name} zerlegt sich in Einzelteile! Das war’s!`); end.finish(false); return false; }
          }
        } else if (rel < -3) th.done = true;
      }
      // Gegner
      for (const r of rivals) {
        if (r.bump > 0) r.bump -= dt;
        r.d += r.v * (r.bump > 0 ? 0.6 : 1) * (1 + Math.sin(raceTime * 0.7 + r.v) * 0.05) * dt;
        // Spurwechsel, wenn vorne Schrott liegt
        const danger = things.find((th) => !th.done && th.lane === r.lane && th.kind !== 'pad' && th.d - r.d > 0 && th.d - r.d < 12);
        if (danger && Math.random() < dt * 4) r.lane = clamp(r.lane + (Math.random() < 0.5 ? -1 : 1), 0, 2);
        const rel = r.d - pos;
        if (r.lane === myLane && rel > 0 && rel < 3 && v > r.v * 0.95) {
          v = r.v * 0.85; r.bump = 0.4; ctx.sfx('hit');
          if (level >= 3) { hp--; host.pop('Rempler!', 'bad', 20 + myLane * 30, 70); if (hp <= 0) { end.finish(false); return false; } }
        }
        r.el.style.top = `${82 - rel * 0.9}%`;
        r.el.style.left = `${20 + r.lane * 30}%`;
        r.el.style.display = rel < -14 || rel > 95 ? 'none' : '';
      }
      const fRel = LENGTH - pos;
      finish.style.top = `${82 - fRel * 0.9}%`;
      finish.style.display = fRel > 95 ? 'none' : '';
      me.style.left = `${20 + laneX * 30}%`;
      me.classList.toggle('boost', boost > 0);
      me.classList.toggle('slip', slow > 0);
      hud.textContent = `Panzer ${'▮'.repeat(Math.max(0, hp))}${'▯'.repeat(Math.max(0, hpMax - hp))} · Turbo ${turbos}`;
      turboButton.disabled = turbos <= 0;
      const place = placeOf();
      host.setScore(`Platz ${place}/4`);
      host.setInfo(`${Math.round(clamp(pos / LENGTH, 0, 1) * 100)} %`);
      if (Math.random() < dt * 0.15) voice.say(place === 1 ? pick([`${bot.name} vorne! Wer hat den gebaut, ein Genie?`, 'Die Führung! Das Publikum wirft Schrauben vor Begeisterung!']) : pick(['Da geht noch was! Oder auch nicht!', `${rivals[0].name} rammt alles, was sich bewegt!`, 'Kleine Hexe ist schneller als ihr Ruf!']));
      if (pos >= LENGTH) { end.finish(place <= need); return false; }
      if (rivals.filter((r) => r.d >= LENGTH).length >= need) { end.finish(false); return false; }
      return true;
    });

    const won = await end.done;
    const place = hp <= 0 ? 4 : placeOf();
    host.summary(`${bot.name}: ${hp <= 0 ? 'zerlegt' : `Platz ${place}`} · Öl ${oil} · Schrott ${junk} · Schubfelder ${pads}`);
    host.summary(won ? (place === 1 ? 'Die Ansagerin brüllt deinen Namen falsch, aber mit Liebe. Der Pokal ist ein lackierter Auspuff. Er ist wunderschön.' : 'Aufs Treppchen! Die Halle johlt, irgendwer wirft eine Mutter nach dir. Als Kompliment.')
      : hp <= 0 ? 'Dein Bot liegt in drei Teilen auf der Bahn. Ein Kind sammelt die Schrauben ein.' : 'Andere waren schneller. Dein Bot piept beleidigt und fährt allein in die Box.');
    return won;
  },
};
