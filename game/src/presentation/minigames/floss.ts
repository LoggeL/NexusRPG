// akt-floss: Floßfahrt durch den Kanal-Sammler. Links/rechts steuern, Tonnen und Strudeln ausweichen, Treibgut einsammeln,
// am Ende vor dem großen Rechen rechtzeitig bremsen (halten) und an der Anlegestelle stoppen.
// Körper: stärkerer Rumpf (7+: +1) und kräftiges Bremsen. Reflexe: schnelleres Steuern. Treibgut kommt als Zusatzeffekt ins Gepäck.
import type { Effect } from '../../modules/contracts';
import { h } from '../dom/dom';
import { ending, holdInput, relPoint, speaker } from './kit';
import type { MinigameDef } from './types';
import { byLevel, clamp, isLeft, isRight, pick } from './util';

type Kind = 'tonne' | 'strudel' | 'rohr' | 'holz' | 'kiste' | 'ente';
interface Drift { kind: Kind; x: number; y: number; w: number; el: HTMLElement; done: boolean; phase: number }

const LENGTH = 40; // Sekunden Fahrt bei Grundtempo

export const floss: MinigameDef = {
  title: 'Floßfahrt',
  blurb: 'Ein Floß aus Ölfässern, Paletten und Gottvertrauen. Die Strömung zieht Richtung Rechen. Sammel Treibgut, weich dem Rest aus – und brems rechtzeitig, sonst bist du Teil der Sammlung.',
  controls: ['←/→ oder A/D, Maus/Finger: steuern', 'Treibgut (Holz, Kisten) mitnehmen, Tonnen und Strudel meiden', 'Am Rechen: Leertaste/Bremsknopf halten, an der Anlegestelle stoppen'],
  bonuses(ctx) {
    const lines = [`Reflexe ${ctx.attr('reflexe')}: Steuern +${Math.round(ctx.edge('reflexe') * 50)} %`, `Körper ${ctx.attr('koerper')}: Bremskraft +${Math.round(ctx.edge('koerper') * 50)} %`];
    if (ctx.attr('koerper') >= 7) lines.push('Körper 7+: Floß hält einen Treffer mehr aus');
    return lines;
  },
  async run(host, ctx) {
    const level = ctx.level;
    const reflex = ctx.edge('reflexe');
    const body = ctx.edge('koerper');
    let hull = 3 + (ctx.attr('koerper') >= 7 ? 1 : 0);
    const steer = 70 * (1 + reflex * 0.5);
    const flow = byLevel(level, [26, 30, 34, 38, 42]);
    const spawnEvery = byLevel(level, [0.95, 0.85, 0.75, 0.65, 0.55]);
    const badShare = byLevel(level, [0.5, 0.55, 0.6, 0.65, 0.7]);
    const dockWidth = byLevel(level, [16, 14, 12, 10, 9]);
    const brake = 46 * (1 + body * 0.5);

    const canal = h('div', { class: 'fl-canal' });
    const raft = h('div', { class: 'fl-raft' });
    const hullEl = h('div', { class: 'fl-hull' });
    const voice = speaker('fl-voice', 'Kanalvolk');
    const brakeButton = h('button', { type: 'button', class: 'mg-btn mg-big fl-brake', tabindex: '-1' }, 'BREMSEN (halten)');
    brakeButton.hidden = true;
    canal.append(raft, hullEl, voice.el);
    host.stage.append(h('div', { class: 'fl-wrap' }, canal), h('div', { class: 'mg-toolbar' }, brakeButton));
    const hold = holdInput(host, brakeButton);

    const end = ending();
    let x = 50, targetX: number | null = null;
    let leftHeld = false, rightHeld = false;
    let t = 0, spawnTimer = 0.6;
    let wood = 0, crates = 0, ducks = 0, hits = 0;
    let phase: 'drift' | 'rechen' = 'drift';
    let speed = flow, grateY = -20;
    const drifts: Drift[] = [];
    const renderHull = () => { hullEl.textContent = `Rumpf ${'▮'.repeat(Math.max(0, hull))}${'▯'.repeat(Math.max(0, 3 + (ctx.attr('koerper') >= 7 ? 1 : 0) - hull))}`; };
    renderHull();
    voice.say('Hinten sammeln wir Treibgut. Vorne sammelt der Rechen Leute. Viel Spaß.');

    canal.addEventListener('pointerdown', (event) => { if (event.target === brakeButton) return; event.preventDefault(); targetX = relPoint(event, canal).x; });
    canal.addEventListener('pointermove', (event) => { if (event.pointerType === 'mouse' || event.buttons) targetX = relPoint(event, canal).x; });
    host.onKey((event, down) => {
      if (isLeft(event.code)) { leftHeld = down; if (down) targetX = null; }
      else if (isRight(event.code)) { rightHeld = down; if (down) targetX = null; }
    });

    const spawn = () => {
      const bad = Math.random() < badShare;
      const kind: Kind = bad ? pick<Kind>(level >= 3 ? ['tonne', 'tonne', 'strudel', 'rohr'] : ['tonne', 'tonne', 'strudel']) : pick<Kind>(['holz', 'holz', 'kiste', Math.random() < 0.15 ? 'ente' : 'holz']);
      const w = kind === 'rohr' ? 28 : kind === 'strudel' ? 12 : 8;
      const el = h('div', { class: `fl-drift ${kind}` }, kind === 'ente' ? 'Q' : '');
      el.style.width = `${w}%`;
      canal.append(el);
      drifts.push({ kind, x: w / 2 + Math.random() * (100 - w), y: -8, w, el, done: false, phase: Math.random() * 6 });
    };

    const collide = (d: Drift) => {
      d.done = true;
      if (d.kind === 'holz' || d.kind === 'kiste' || d.kind === 'ente') {
        d.el.classList.add('taken');
        setTimeout(() => d.el.remove(), 300);
        if (d.kind === 'holz') wood++; else if (d.kind === 'kiste') crates++; else ducks++;
        ctx.sfx('pickup');
        host.pop(d.kind === 'holz' ? 'Treibholz' : d.kind === 'kiste' ? 'Kiste!' : 'Quietscheente!?', d.kind === 'ente' ? 'gold' : 'good', x, 70);
        if (d.kind === 'ente') voice.say('Eine Gummiente. Im Kanal. Lebend. Frag nicht.');
        return;
      }
      hits++; hull--;
      d.el.classList.add('bonk');
      raft.classList.remove('hit'); void raft.offsetWidth; raft.classList.add('hit');
      ctx.sfx('hurt');
      host.pop(d.kind === 'strudel' ? 'Strudel!' : 'Rums!', 'bad', x, 70);
      renderHull();
      if (hull <= 0) end.finish(false);
      else if (Math.random() < 0.5) voice.say(pick(['Das Floß hat Gefühle, du Grobian!', 'Noch so einer und du schwimmst.', 'Wer hat dir das Steuern beigebracht? Ein Gully?']));
    };

    host.frame((dt) => {
      if (end.over) return false;
      t += dt;
      if (targetX !== null) x += clamp(targetX - x, -steer * dt, steer * dt);
      else x += ((rightHeld ? 1 : 0) - (leftHeld ? 1 : 0)) * steer * dt;
      x = clamp(x, 8, 92);
      raft.style.left = `${x}%`;
      if (phase === 'drift') {
        spawnTimer -= dt;
        if (spawnTimer <= 0) { spawn(); spawnTimer = spawnEvery * (0.7 + Math.random() * 0.6); }
        host.setInfo(`Strecke ${Math.round(clamp(t / LENGTH, 0, 1) * 100)} %`);
        if (t >= LENGTH) {
          phase = 'rechen';
          grateY = -18;
          canal.append(h('div', { class: 'fl-grate' }), h('div', { class: 'fl-dock' }));
          (canal.querySelector('.fl-dock') as HTMLElement).style.height = `${dockWidth}%`;
          brakeButton.hidden = false;
          voice.say('DER RECHEN! Brems! Halt fest und brems!');
          ctx.sfx('alarm');
        }
      } else {
        // Bremsen: Halten verlangsamt, Loslassen lässt die Strömung wieder ziehen.
        speed += (hold.held ? -brake : flow * 0.9) * dt;
        speed = clamp(speed, 0, flow * 1.1);
        grateY += speed * dt;
        const grate = canal.querySelector('.fl-grate') as HTMLElement;
        const dock = canal.querySelector('.fl-dock') as HTMLElement;
        grate.style.top = `${grateY}%`;
        // Anlegestelle: das Wasserstück direkt vor dem Rechen (zwischen Rechen und Floß).
        const grateBottom = grateY + 5;
        dock.style.top = `${grateBottom}%`;
        raft.classList.toggle('braking', hold.held);
        const gapToGrate = 73.5 - grateBottom; // Oberkante Floß minus Unterkante Rechen
        if (gapToGrate <= 0) {
          hull--; renderHull(); ctx.sfx('hurt');
          host.pop('In den Rechen gekracht!', 'bad', 50, 50);
          end.finish(false);
          return false;
        }
        const inDock = gapToGrate >= 0 && gapToGrate <= dockWidth;
        if (speed <= 0.5 && inDock) {
          host.pop('Angelegt!', 'gold', 50, 50);
          end.finish(true);
          return false;
        }
        host.setInfo(speed <= 0.5 ? 'Noch nicht an der Anlegestelle – kurz treiben lassen' : hold.held ? 'Bremsen …' : 'Strömung zieht!');
      }
      for (const d of drifts) {
        if (d.done && !d.el.isConnected) continue;
        d.y += (phase === 'drift' ? flow : speed) * dt;
        if (d.kind === 'strudel') { d.phase += dt * 4; d.el.style.transform = `translate(-50%, -50%) rotate(${d.phase * 60}deg)`; }
        d.el.style.left = `${d.x}%`;
        d.el.style.top = `${d.y}%`;
        if (!d.done && d.y > 72 && d.y < 84 && Math.abs(d.x - x) < d.w / 2 + 6) collide(d);
        if (d.y > 108) { d.done = true; d.el.remove(); }
      }
      for (let i = drifts.length - 1; i >= 0; i--) if (drifts[i].done && !drifts[i].el.isConnected) drifts.splice(i, 1);
      host.setScore(`Treibgut ${wood + crates + ducks}`);
      return true;
    });

    const won = await end.done;
    const loot: Effect[] = [];
    for (let i = 0; i < Math.min(2, wood); i++) loot.push({ give: 'treibholz' });
    for (let i = 0; i < Math.min(3, crates); i++) loot.push({ give: 'schrott-ersatzteil' });
    if (won || hull > 0) host.extra(...loot);
    host.summary(`Treibholz ${wood} · Kisten ${crates}${ducks ? ` · Enten ${ducks}` : ''} · Treffer ${hits}${loot.length && (won || hull > 0) ? ' · Treibgut im Gepäck' : ''}`);
    host.summary(won ? 'Du legst an, als hättest du nie was anderes gemacht. Das Kanalvolk klatscht. Zweimal.' : hull <= 0 ? 'Das Floß zerlegt sich in seine Einzelteile. Du schwimmst. Es ist widerlich.' : 'Das Floß hängt im Rechen wie ein Fisch im Netz. Das Kanalvolk zieht dich raus und lacht.');
    return won;
  },
};
