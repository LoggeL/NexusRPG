// akt-werkbank: Basteln an der Crew-Werkbank oder bei Opa Gustav. Drei Arbeitsgänge: Teile aus der Kiste suchen,
// Schrauben im Takt anziehen, Lötstelle auf Temperatur halten. Jeder Fehler frisst Material; ist es alle, ist das Teil Schrott.
// Technik: mehr Materialpuffer („weniger Material“), breitere Schraubzone, langsamerer Lötkolben.
import { h } from '../dom/dom';
import { ending, holdInput, meter, speaker } from './kit';
import type { MinigameDef } from './types';
import { byLevel, gameButton, isAction, pick, shuffle } from './util';

interface Part { glyph: string; name: string }
const PARTS: Part[] = [
  { glyph: '⚙︎', name: 'Zahnrad' }, { glyph: '⌁', name: 'Kabel' }, { glyph: '▣', name: 'Platine' }, { glyph: '◯', name: 'Dichtring' },
  { glyph: 'ϟ', name: 'Akkuzelle' }, { glyph: '⊥', name: 'Schraube M4' }, { glyph: '≋', name: 'Feder' }, { glyph: '◫', name: 'Gehäuse' },
  { glyph: '✚', name: 'Klebeband' }, { glyph: '⊗', name: 'Ventilkappe' }, { glyph: '⌂', name: 'Kühlkörper' }, { glyph: '∿', name: 'Draht' },
];
const PROJECTS = ['Reparaturset', 'Leckerli-Schraube für Bolzen', 'Taschenlampe mit Wackelkontakt (Absicht)', 'Funkverstärker', 'Rauchmelder, der wirklich meldet'];

export const werkbank: MinigameDef = {
  title: 'Werkbank',
  blurb: 'Schraubstock, Lötkolben, eine Kiste voller Zeug, das „noch gut“ ist. Bau was Brauchbares, bevor dir das Material ausgeht.',
  controls: ['Teile: anklicken/antippen oder 1–8', 'Schrauben: Leertaste/Tippen, wenn der Zeiger im Feld ist', 'Löten: Leertaste/Finger halten, im grünen Band loslassen'],
  bonuses(ctx) {
    const extra = Math.round(ctx.edge('technik') * 3);
    return [`Technik ${ctx.attr('technik')}: ${extra ? `+${extra} Material` : 'kein Materialpuffer'}, Schraubzone +${Math.round(ctx.edge('technik') * 50)} %`];
  },
  async run(host, ctx) {
    const level = ctx.level;
    const tech = ctx.edge('technik');
    const material = { left: byLevel(level, [6, 5, 4, 4, 3]) + Math.round(tech * 3), used: 0 };
    const startMaterial = material.left;
    const needParts = byLevel(level, [3, 3, 4, 4, 5]);
    const screws = byLevel(level, [2, 3, 3, 4, 4]);
    const screwZone = byLevel(level, [70, 60, 52, 44, 38]) * (1 + tech * 0.5);
    const screwSpeed = byLevel(level, [200, 240, 280, 320, 360]);
    const solderBand = byLevel(level, [0.2, 0.17, 0.15, 0.13, 0.11]);
    const project = pick(PROJECTS);

    const bench = h('div', { class: 'wb-bench' });
    const head = h('div', { class: 'wb-head' });
    const work = h('div', { class: 'wb-work' });
    const gustav = speaker('wb-gustav', 'Gustav');
    bench.append(head, work, gustav.el);
    host.stage.append(h('div', { class: 'wb-wrap' }, bench));
    const end = ending();
    const clock = host.countdown(byLevel(level, [80, 80, 85, 90, 95]));
    void clock.done.then(() => end.finish(false));

    const renderMat = () => {
      host.setScore(`Material ${material.left}`);
      head.textContent = '';
      head.append(h('b', null, project), h('span', { class: 'wb-mat' }, ...Array.from({ length: Math.max(0, material.left) }, () => h('i', null))));
    };
    const waste = (why: string) => {
      material.left--; material.used++;
      ctx.sfx('fail');
      host.pop(`${why} −1 Material`, 'bad', 50, 30);
      renderMat();
      if (material.left < 0) end.finish(false);
    };
    renderMat();
    gustav.say(pick(['Erst denken, dann löten. Oder umgekehrt, Hauptsache es raucht nicht.', 'Material ist knapp, Kindchen. Wie Geduld.']));

    // 1) Teile suchen
    host.setInfo('1/3 Teile suchen');
    const wanted = shuffle([...PARTS]).slice(0, needParts);
    const pile = shuffle([...wanted, ...shuffle(PARTS.filter((p) => !wanted.includes(p))).slice(0, 8 - needParts)]);
    const plan = h('div', { class: 'wb-plan' }, h('span', null, 'Bauplan:'), ...wanted.map((p) => h('span', { class: 'wb-need', 'data-name': p.name }, `${p.glyph} ${p.name}`)));
    const box = h('div', { class: 'wb-box' });
    work.append(plan, box);
    await new Promise<void>((resolve) => {
      let found = 0;
      const take = (index: number, button: HTMLButtonElement) => {
        if (end.over || button.disabled) return;
        const part = pile[index];
        button.disabled = true;
        if (wanted.includes(part)) {
          found++;
          ctx.sfx('pickup');
          button.classList.add('ok');
          plan.querySelector(`[data-name="${part.name}"]`)?.classList.add('ok');
          if (found >= wanted.length) resolve();
        } else {
          button.classList.add('bad');
          waste(`${part.name} passt nicht.`);
          if (Math.random() < 0.5) gustav.say(pick(['Das ist ’ne Feder, kein Kabel, du Pfeife.', 'Brille vergessen? Ich leih dir meine. Die hat auch nur ein Glas.']));
        }
      };
      const buttons = pile.map((part, i) => {
        const button: HTMLButtonElement = gameButton(h('span', null, h('span', { class: 'm2-key' }, String(i + 1)), `${part.glyph} ${part.name}`), () => take(i, button), 'wb-part');
        return button;
      });
      box.append(...buttons);
      host.onKey((event, down) => {
        const m = /^(?:Digit|Numpad)([1-8])$/.exec(event.code);
        if (down && !event.repeat && m && found < wanted.length) take(Number(m[1]) - 1, buttons[Number(m[1]) - 1]);
      });
      void end.done.then(() => resolve());
    });
    if (end.over) return finishUp(false);
    await host.wait(500);

    // 2) Schrauben
    host.setInfo('2/3 Schrauben anziehen');
    work.textContent = '';
    const ring = h('div', { class: 'wb-ring' });
    const zoneEl = h('div', { class: 'wb-zone' });
    const hand = h('div', { class: 'wb-hand' });
    ring.append(zoneEl, hand, h('div', { class: 'wb-screw' }));
    const counter = h('div', { class: 'wb-count' });
    const tighten = gameButton('ANZIEHEN', () => press(), 'mg-big');
    work.append(ring, counter, h('div', { class: 'mg-toolbar' }, tighten));
    let angle = 0, zoneAt = 0, doneScrews = 0;
    const newZone = () => {
      zoneAt = Math.random() * 360;
      zoneEl.style.background = `conic-gradient(from ${zoneAt - screwZone / 2}deg, rgba(109,255,176,0.55) 0deg ${screwZone}deg, transparent ${screwZone}deg 360deg)`;
      counter.textContent = `Schraube ${doneScrews + 1}/${screws}`;
    };
    newZone();
    let screwResolve!: () => void;
    const screwDone = new Promise<void>((resolve) => { screwResolve = resolve; });
    const press = () => {
      if (end.over || doneScrews >= screws) return;
      const diff = Math.abs(((angle - zoneAt + 540) % 360) - 180);
      if (diff <= screwZone / 2) {
        doneScrews++;
        ctx.sfx('switch');
        host.pop('Sitzt!', 'good', 50, 30);
        if (doneScrews >= screws) { screwResolve(); return; }
        newZone();
      } else waste('Gewinde vermurkst.');
    };
    host.onKey((event, down) => { if (down && !event.repeat && isAction(event.code) && doneScrews < screws) press(); });
    ring.addEventListener('pointerdown', (event) => { event.preventDefault(); press(); });
    host.frame((dt) => {
      if (end.over || doneScrews >= screws) return false;
      angle = (angle + screwSpeed * dt * (1 + doneScrews * 0.12)) % 360;
      hand.style.transform = `rotate(${angle}deg)`;
      return true;
    });
    await Promise.race([screwDone, end.done]);
    if (end.over) return finishUp(false);
    await host.wait(500);

    // 3) Löten
    host.setInfo('3/3 Löten');
    work.textContent = '';
    const temp = meter('wb-temp', 'Temperatur');
    const center = 0.55 + Math.random() * 0.25;
    const band = h('div', { class: 'wb-band' });
    band.style.left = `${(center - solderBand / 2) * 100}%`;
    band.style.width = `${solderBand * 100}%`;
    temp.el.append(band);
    const joints = byLevel(level, [2, 2, 3, 3, 3]);
    const solderPad = h('div', { class: 'wb-pad' }, h('i', { class: 'wb-iron' }));
    const jointText = h('div', { class: 'wb-count' }, `Lötstelle 1/${joints}`);
    work.append(solderPad, temp.el, jointText);
    const hold = holdInput(host, solderPad);
    let heat = 0, joint = 0, wasHeld = false, cooling = 0;
    await new Promise<void>((resolve) => {
      host.frame((dt) => {
        if (end.over) { resolve(); return false; }
        if (cooling > 0) { cooling -= dt; heat = Math.max(0, heat - dt * 1.2); temp.set(heat); return true; }
        if (hold.held) { heat += dt * (0.38 + level * 0.04) * (1 - tech * 0.25); wasHeld = true; solderPad.classList.add('hot'); }
        else {
          solderPad.classList.remove('hot');
          if (wasHeld) {
            wasHeld = false;
            if (Math.abs(heat - center) <= solderBand / 2) {
              joint++;
              ctx.sfx('hack');
              host.pop('Glänzt wie Silber!', 'gold', 50, 30);
              if (joint >= joints) { resolve(); return false; }
              jointText.textContent = `Lötstelle ${joint + 1}/${joints}`;
            } else waste(heat < center ? 'Kalte Lötstelle.' : 'Verbrannt!');
            cooling = 0.6;
          }
        }
        if (heat >= 1) { heat = 0; wasHeld = false; hold.held = false; waste('Platine geröstet.'); cooling = 0.8; }
        temp.set(heat);
        return true;
      });
    });
    return finishUp(!end.over && material.left >= 0);

    function finishUp(won: boolean) {
      end.finish(won);
      clock.stop();
      host.summary(`${project}: ${won ? 'fertig' : 'Schrott'} · Material verbraucht ${material.used} von ${startMaterial}`);
      host.summary(won ? pick(['Gustav klopft drauf. Es hält. Er ist fast gerührt.', 'Es funktioniert! Und es riecht nur ein bisschen nach Brand.']) : 'Gustav fegt die Reste in die „Noch gut“-Kiste. Da wird es ewig liegen.');
      return won;
    }
  },
};
