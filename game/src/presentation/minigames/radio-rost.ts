// akt-radio-rost: Gastmoderation bei Radio Rost in der `funkturm-ruine` (world.md §3.9). Opa Funk gibt dir das Mikro.
// Sendung aus Abschnitten: Ansage (passenden Satz wählen), Pegel halten (Mikro nicht übersteuern, nicht absaufen),
// Hörertelefon (Antwort wählen), Plattenwunsch (passende Platte), Sender nachstimmen (Frequenz finden).
// Jeder Abschnitt bringt Hörerinnen und Hörer; Ziel je Stufe. Ausstrahlung: mehr Zeit, breitere Pegelzone, mehr Hörer;
// 7+: bei Ansagen fällt der schlimmste Satz weg.
import { h } from '../dom/dom';
import { ending, holdInput, meter, speaker } from './kit';
import { chooseTimed } from './kit3';
import type { MinigameDef, MinigameHost } from './types';
import { byLevel, clamp, isLeft, isRight, isAction, pick, shuffle } from './util';

interface Pick3 { prompt: string; good: string; ok: string; bad: string; goodReply: string; badReply: string }
const ANSAGEN: Pick3[] = [
  { prompt: 'Opa Funk zeigt auf dich: „Begrüß die Leute.“', good: '„Guten Morgen, Ödnis! Hier ist Radio Rost, die einzige Stimme, die lauter ist als der Sandsturm.“', ok: '„Äh. Hallo. Radio.“', bad: '„Moin, ihr staubigen Wichser.“', goodReply: 'Opa Funk hebt beide Daumen. Einer davon ist aus Blech.', badReply: 'Opa Funk zieht den Regler runter. „Wir sind ein Familiensender. Halbwegs.“' },
  { prompt: 'Wetterbericht. Opa Funk reicht dir einen Zettel: „30 Grad. Schatten: keiner.“', good: '„Heute dreißig Grad im Schatten. Schatten gibt’s leider keinen. Trinkt Wasser, ihr Kakteen.“', ok: '„Es ist … warm. Wie gestern.“', bad: '„Wetter? Guckt halt aus dem Fenster.“', goodReply: 'Irgendwo in der Ödnis lacht ein Ziegenhirte.', badReply: 'Opa Funk: „Wir haben Hörer ohne Fenster, du Pfeife.“' },
  { prompt: 'Werbepause. Rudis Diner zahlt in Pfannkuchen.', good: '„Rudis Diner: Pfannkuchen so groß wie Wagenräder. Und genauso zäh. Wir lieben sie!“', ok: '„Geht zu Rudi. Da gibt’s Essen.“', bad: '„Rudis Pfannkuchen hat mich drei Tage aufs Klo geschickt.“', goodReply: 'Das Funktelefon klingelt: Rudi weint vor Rührung.', badReply: 'Opa Funk: „Rudi hört zu. Rudi hat ein Gewehr.“' },
  { prompt: 'Kurzmeldung: Quantum-Drohnen kreisen über der Staubstraße.', good: '„Quantum-Drohnen über der Staubstraße. Winkt ihnen. Mit dem Mittelfinger, aber freundlich.“', ok: '„Da sind Drohnen. Passt auf.“', bad: '„Keine Panik! Oder doch. Eher doch.“', goodReply: 'Opa Funk kichert ins Nebenmikro.', badReply: 'Drei Aussiedler verbarrikadieren sich. Gut gemacht.' },
];
const ANRUFER: Pick3[] = [
  { prompt: 'Anruf von Ziegenhirtin Hilde: „Meine Ziege frisst wieder Wegweiser. Was soll ich machen?“', good: '„Hilde, lass sie. Wer Wegweiser frisst, findet immer nach Hause.“', ok: '„Zaun bauen?“', bad: '„Grill an, Problem gelöst.“', goodReply: 'Hilde lacht so laut, dass die Ziege mitmeckert.', badReply: 'Hilde legt auf. Die Ziege auch, irgendwie.' },
  { prompt: 'Konvoi-Fahrerin auf Kanal neun: „Hier ist es so langweilig, erzähl mir was!“', good: '„Kennst du den von dem Toaster, der Nexus heiraten wollte? Er war ihr zu warm.“', ok: '„Äh … der Himmel ist blau?“', bad: '„Dann fahr halt schneller.“', goodReply: 'Die Fahrerin hupt dreimal in den Funk. Das heißt: Liebe.', badReply: 'Sie fährt schneller. In einen Graben.' },
  { prompt: 'Ein Kind: „Stimmt es, dass am Ende der Ödnis das Meer ist?“', good: '„Das stimmt. Und eines Tages fahren wir alle hin. Mit Sonnencreme.“', ok: '„Weiß nicht. Frag deine Mama.“', bad: '„Nee, da ist nur noch mehr Sand. Für immer.“', goodReply: 'Opa Funk wischt sich heimlich die Augen.', badReply: 'Am anderen Ende fängt jemand an zu heulen. Toll.' },
  { prompt: 'Marla vom Aussiedlerhof: „Der Wind kommt von Westen. Sag’s den Leuten.“', good: '„Marla sagt: Wind von Westen. Wer jetzt Wäsche draußen hat, hat sie bald in Sektor 9.“', ok: '„Wind. Westen. Ja.“', bad: '„Interessiert doch keinen, Marla.“', goodReply: 'Marla brummt zufrieden. Mehr Lob gibt’s bei ihr nicht.', badReply: 'Marla: „Dann schreib ich’s halt wieder in den Sand.“' },
];
interface Wunsch { prompt: string; right: string; wrong: string[] }
const WUENSCHE: Wunsch[] = [
  { prompt: 'Plattenwunsch: „Was Trauriges für meine Ziege, sie hat Liebeskummer.“', right: '„Rost an meinem Herzen“ – Ballade, 3 Taschentücher', wrong: ['„Bohrmaschinen-Polka“ – Schlager, laut', '„Kabelbrand – Live in Halle 9“ – Punk, sehr laut'] },
  { prompt: 'Plattenwunsch: „Was zum Tanzen! Wir haben ein Fass aufgemacht!“', right: '„Bohrmaschinen-Polka“ – Schlager, laut', wrong: ['„Rost an meinem Herzen“ – Ballade', '„Wüstenwind, 40 Minuten Rauschen“ – Ambient'] },
  { prompt: 'Plattenwunsch: „Was zum Einschlafen, das Baby schreit seit drei Stunden.“', right: '„Wüstenwind, 40 Minuten Rauschen“ – Ambient', wrong: ['„Kabelbrand – Live in Halle 9“ – Punk', '„Bohrmaschinen-Polka“ – Schlager'] },
  { prompt: 'Plattenwunsch: „Spiel was, das Quantum hasst!“', right: '„Kabelbrand – Live in Halle 9“ – Punk, sehr laut', wrong: ['„Nexus singt Wiegenlieder“ – Werbe-Single', '„Wüstenwind“ – Ambient'] },
];

type Kind = 'ansage' | 'pegel' | 'anrufer' | 'wunsch' | 'frequenz';

export const radioRost: MinigameDef = {
  title: 'Radio Rost – Gastmoderation',
  blurb: 'Opa Funk schiebt dir das Mikro hin, das nach Kautabak und Geschichte riecht. „Du bist live, Kind. Die ganze Ödnis hört zu. Also drei Ziegen und der Konvoi.“',
  controls: ['Ansage/Anruf/Platte: Antwort antippen oder Ziffer', 'Pegel: Leertaste/Knopf halten = lauter, loslassen = leiser, Nadel im grünen Feld halten', 'Frequenz: ←/→ oder Regler ziehen, bei klarem Signal Leertaste/„Einrasten“'],
  bonuses(ctx) {
    const a = ctx.attr('ausstrahlung');
    return [`Ausstrahlung ${a}: +${(ctx.edge('ausstrahlung') * 3).toFixed(1)} s je Antwort, Pegelzone +${Math.round(ctx.edge('ausstrahlung') * 40)} %, Hörer +${Math.round(ctx.edge('ausstrahlung') * 30)} %${a >= 7 ? ', der schlimmste Satz fällt weg' : ''}`];
  },
  async run(host, ctx) {
    const level = ctx.level;
    const charm = ctx.edge('ausstrahlung');
    const smooth = ctx.attr('ausstrahlung') >= 7;
    const time = byLevel(level, [9, 8, 7, 6.5, 6]) + charm * 3;
    const goal = byLevel(level, [300, 380, 460, 540, 620]);
    const mult = 1 + charm * 0.3;
    const plan: Kind[] = byLevel<Kind[]>(level, [
      ['ansage', 'pegel', 'anrufer', 'wunsch', 'ansage'],
      ['ansage', 'pegel', 'anrufer', 'wunsch', 'frequenz', 'ansage'],
      ['ansage', 'pegel', 'anrufer', 'frequenz', 'wunsch', 'anrufer', 'ansage'],
      ['ansage', 'pegel', 'anrufer', 'frequenz', 'wunsch', 'pegel', 'anrufer'],
      ['ansage', 'frequenz', 'pegel', 'anrufer', 'wunsch', 'pegel', 'anrufer', 'ansage'],
    ]);

    const studio = h('div', { class: 'rr-studio' });
    const onAir = h('div', { class: 'rr-onair' }, 'ON AIR');
    const prompt = h('div', { class: 'rr-prompt' });
    const area = h('div', { class: 'rr-area' });
    const listeners = meter('rr-listeners', 'Hörer');
    const funk = speaker('rr-funk', 'Opa Funk');
    studio.append(onAir, listeners.el, prompt, area, funk.el);
    host.stage.append(h('div', { class: 'rr-wrap' }, studio));

    const end = ending();
    let score = 0;
    const add = (points: number) => {
      const p = Math.round(points * mult);
      score = Math.max(0, score + p);
      listeners.set(score / (goal * 1.25));
      listeners.label(`Hörer ${score} / ${goal}`);
      listeners.mark(goal / (goal * 1.25));
      if (p) host.pop(p > 0 ? `+${p} Hörer` : `${p} Hörer`, p > 0 ? 'good' : 'bad', 75, 20);
    };
    add(0);
    const ansagen = shuffle([...ANSAGEN]), anrufer = shuffle([...ANRUFER]), wuensche = shuffle([...WUENSCHE]);
    let ia = 0, ic = 0, iw = 0;

    const pick3 = async (p: Pick3) => {
      prompt.textContent = p.prompt;
      area.textContent = '';
      const opts = [{ t: p.good, v: 2 }, { t: p.ok, v: 1 }, ...(smooth ? [] : [{ t: p.bad, v: 0 }])];
      const order = shuffle(opts);
      const i = await chooseTimed(host, area, order.map((o) => o.t), time);
      const v = i < 0 ? -1 : order[i].v;
      if (v === 2) { add(110); ctx.sfx('success'); funk.say(p.goodReply); }
      else if (v === 1) { add(45); ctx.sfx('talk'); funk.say(pick(['Geht so. Die Ziegen sind nicht beeindruckt.', 'Solide. Langweilig, aber solide.'])); }
      else if (v === 0) { add(-40); ctx.sfx('fail'); funk.say(p.badReply); }
      else { add(-30); ctx.sfx('fail'); funk.say('Funkstille. Das Schlimmste, was es im Radio gibt. Gleich nach Schlager.'); }
    };

    const wunsch = async (w: Wunsch) => {
      prompt.textContent = w.prompt;
      area.textContent = '';
      const order = shuffle([w.right, ...w.wrong]);
      const i = await chooseTimed(host, area, order, time);
      if (i >= 0 && order[i] === w.right) { add(100); ctx.sfx('success'); funk.say('Passt wie Arsch auf Eimer. Lass laufen.'); }
      else { add(i < 0 ? -30 : -25); ctx.sfx('fail'); funk.say(pick(['Die Ziege hat sich gerade übergeben.', 'Falsche Platte, Kind. Ganz falsche Platte.'])); }
      await host.wait(400);
    };

    const pegel = (h_: MinigameHost) => new Promise<void>((resolve) => {
      prompt.textContent = 'Opa Funk: „Jetzt du, frei Schnauze. Aber halt den Pegel im Grünen, sonst pfeift’s.“';
      area.textContent = '';
      const zone = byLevel(level, [0.3, 0.26, 0.22, 0.19, 0.16]) * (1 + charm * 0.4);
      const lo = 0.5 - zone / 2, hi = 0.5 + zone / 2;
      const needle = h('i', { class: 'rr-needle' });
      const green = h('b', { class: 'rr-green' });
      green.style.left = `${lo * 100}%`; green.style.width = `${zone * 100}%`;
      const vu = h('div', { class: 'rr-vu' }, green, needle);
      const mic = h('button', { type: 'button', class: 'mg-btn mg-big', tabindex: '-1' }, 'REDEN (halten)');
      const prog = meter('rr-pegel-prog', 'Sendezeit');
      area.append(vu, prog.el, h('div', { class: 'mg-toolbar' }, mic));
      const hold = holdInput(h_, mic);
      let v = 0.3, vel = 0, inZone = 0, total = 0, gust = 0;
      const dur = byLevel(level, [7, 7.5, 8, 8.5, 9]);
      h_.frame((dt) => {
        if (end.over) { resolve(); return false; }
        total += dt;
        gust -= dt;
        if (gust <= 0) { gust = 1 + Math.random() * 1.5; vel += (Math.random() - 0.5) * byLevel(level, [0.6, 0.8, 1, 1.2, 1.4]); }
        vel += (hold.held ? 1.3 : -1.1) * dt;
        vel *= 1 - dt * 1.8;
        v = clamp(v + vel * dt, 0, 1);
        if (v <= 0 || v >= 1) vel = 0;
        needle.style.left = `${v * 100}%`;
        const ok = v >= lo && v <= hi;
        if (ok) inZone += dt;
        vu.classList.toggle('ok', ok);
        vu.classList.toggle('peak', v > 0.92);
        prog.set(total / dur);
        if (total >= dur) {
          const share = inZone / dur;
          add(Math.round(share * 150 - 25));
          funk.say(share > 0.7 ? 'Klar wie Wüstenluft. Respekt.' : share > 0.4 ? 'Bisschen gepfiffen, bisschen genuschelt. Geht.' : 'Das hat geklungen wie ein Sandsturm, der Schluckauf hat.');
          ctx.sfx(share > 0.4 ? 'success' : 'fail');
          resolve();
          return false;
        }
        return true;
      });
    });

    const frequenz = (h_: MinigameHost) => new Promise<void>((resolve) => {
      prompt.textContent = 'Kssscht. Der Sender driftet. Stimm nach, bevor die Hörer weg sind!';
      area.textContent = '';
      const target = 0.12 + Math.random() * 0.76;
      const width = byLevel(level, [0.07, 0.06, 0.05, 0.045, 0.04]) * (1 + charm * 0.3);
      const knob = h('i', { class: 'rr-knob' });
      const dial = h('div', { class: 'rr-dial' }, knob, h('span', { class: 'rr-scale' }, '88 · · · 92 · · · 96 · · · 100 · · · 104 · · · 108'));
      const signal = meter('rr-signal', 'Signal');
      const lock = h('button', { type: 'button', class: 'mg-btn mg-big', tabindex: '-1' }, 'EINRASTEN');
      area.append(dial, signal.el, h('div', { class: 'mg-toolbar' }, lock));
      let tgt = target;
      let f = target < 0.5 ? 0.9 : 0.1, left = false, right = false, dragging = false, t = 0, done = false;
      let drift = (Math.random() < 0.5 ? -1 : 1) * byLevel(level, [0, 0.01, 0.02, 0.03, 0.04]);
      const limit = byLevel(level, [12, 11, 10, 9, 8]);
      const setFromPointer = (e: PointerEvent) => { const r = dial.getBoundingClientRect(); f = clamp((e.clientX - r.left) / Math.max(1, r.width), 0, 1); };
      dial.addEventListener('pointerdown', (e) => { e.preventDefault(); dragging = true; setFromPointer(e); });
      dial.addEventListener('pointermove', (e) => { if (dragging) setFromPointer(e); });
      dial.addEventListener('pointerup', () => { dragging = false; });
      dial.addEventListener('pointerleave', () => { dragging = false; });
      const finish = (points: number, line: string) => { if (done) return; done = true; add(points); funk.say(line); resolve(); };
      const tryLock = () => {
        if (done) return;
        const off = Math.abs(f - tgt);
        if (off <= width) { ctx.sfx('success'); finish(Math.round(120 - t * 6), 'Glasklar! Die Ziegen tanzen.'); }
        else { ctx.sfx('fail'); host.pop('Nur Rauschen', 'bad', 50, 55); t += 1.5; }
      };
      lock.addEventListener('pointerdown', (e) => { e.preventDefault(); tryLock(); });
      h_.onKey((e, down) => {
        if (done) return;
        if (isLeft(e.code)) left = down; else if (isRight(e.code)) right = down;
        else if (down && !e.repeat && isAction(e.code)) tryLock();
      });
      h_.frame((dt) => {
        if (done || end.over) { resolve(); return false; }
        t += dt;
        f = clamp(f + ((right ? 1 : 0) - (left ? 1 : 0)) * 0.35 * dt, 0, 1);
        tgt = clamp(tgt + drift * dt, 0.05, 0.95);
        if (tgt <= 0.05 || tgt >= 0.95) drift = -drift;
        const off = Math.abs(f - tgt);
        const quality = clamp(1 - off / 0.35, 0, 1);
        signal.set(quality);
        signal.label(off <= width ? 'Signal: KLAR' : quality > 0.7 ? 'Signal: fast' : 'Signal: Rauschen');
        knob.style.left = `${f * 100}%`;
        dial.classList.toggle('clear', off <= width);
        if (t >= limit) { ctx.sfx('fail'); finish(-30, 'Weg. Die halbe Ödnis hört jetzt Quantum-Werbefunk. Danke.'); return false; }
        return true;
      });
    });

    funk.say('Das rote Licht heißt: Jetzt hört dich jemand. Das grüne heißt: Kaffee.');
    await host.wait(1500);
    for (const kind of plan) {
      if (end.over) break;
      if (kind === 'ansage') await pick3(ansagen[ia++ % ansagen.length]);
      else if (kind === 'anrufer') await pick3(anrufer[ic++ % anrufer.length]);
      else if (kind === 'wunsch') await wunsch(wuensche[iw++ % wuensche.length]);
      else if (kind === 'pegel') await pegel(host);
      else await frequenz(host);
      await host.wait(1500);
    }
    const won = score >= goal;
    end.finish(won);
    host.summary(`Hörer ${score} (Ziel ${goal})`);
    host.summary(won
      ? 'Opa Funk nimmt dir das Mikro ab: „Kind, du hast eine Stimme fürs Radio. Und ein Gesicht auch.“ Er meint es als Kompliment. Glaubt er.'
      : 'Opa Funk legt eine Platte auf und murmelt: „Nächstes Mal machst du Kaffee und ich rede.“');
    return won;
  },
};
