// Host der Minispiele: DOM-Overlay (Modal „minigame“) mit Einleitung, Countdown, Spielfläche und Ergebnis.
// Abbrechen (Esc zweimal oder ✕ zweimal) zählt als verloren. Tastatur, Maus und Touch laufen über die Spielfläche.
import './minigames.css';
import type { AudioPort, CampaignPort, Condition, Effect, MinigameRequest, SfxId } from '../../modules/contracts';
import type { IntentEvent } from '../../platform/input/router';
import { clear, h } from '../dom/dom';
import { Modal, type UiShell } from '../dom/shell';
import type { CountdownHandle, MinigameContext, MinigameDef, MinigameHost, MinigameResult, PopTone } from './types';
import { clamp } from './util';

export interface MinigameEnv {
  shell: UiShell;
  campaign: CampaignPort;
  audio: AudioPort;
  touch: boolean;
  reducedMotion: boolean;
}

export function createMinigameContext(env: MinigameEnv, request: MinigameRequest): MinigameContext {
  const safe = <T>(fn: () => T, fallback: T): T => { try { return fn(); } catch { return fallback; } };
  const attr: MinigameContext['attr'] = (attribute) => safe(() => env.campaign.attribute(attribute), 3);
  return {
    level: clamp(Math.round(request.level || 2), 1, 5),
    label: request.label,
    attr,
    edge: (attribute) => clamp((attr(attribute) - 3) / 7, 0, 1.3),
    has: (condition: Condition) => safe(() => env.campaign.evaluate(condition), false),
    checkOk: (check) => safe(() => env.campaign.evaluateCheck(check).ok, false),
    sfx: (id: SfxId) => { try { env.audio.sfx(id); } catch { /* Audio optional */ } },
    reducedMotion: env.reducedMotion,
    touch: env.touch,
  };
}

type Phase = 'intro' | 'count' | 'play' | 'result';

/** Spielt ein Minispiel vollständig durch (Einleitung → Spiel → Ergebnis) und liefert den Ausgang. */
export function runMinigameOverlay(env: MinigameEnv, def: MinigameDef, request: MinigameRequest): Promise<MinigameResult> {
  const ctx = createMinigameContext(env, request);
  const extra: Effect[] = [];
  const summary: string[] = [];
  const life = new AbortController();
  const cleanups: (() => void)[] = [];
  let phase: Phase = 'intro';
  let abortArmed = 0;
  let cancelGame: (() => void) | null = null;
  let introAnswer: ((start: boolean) => void) | null = null;

  const requestAbort = () => {
    if (phase === 'intro') { introAnswer?.(false); return; }
    if (phase === 'result') return;
    const now = performance.now();
    if (now - abortArmed < 2200) { cancelGame?.(); return; }
    abortArmed = now;
    banner.textContent = env.touch ? 'Nochmal ✕ = aufgeben (zählt als verloren)' : 'Nochmal Esc = aufgeben (zählt als verloren)';
    banner.classList.add('show');
    setTimeout(() => banner.classList.remove('show'), 2000);
  };

  const onIntent = (event: IntentEvent): boolean => {
    if (event.intent.type === 'cancel') { requestAbort(); return true; }
    // Während des Spiels gehören alle Absichten der Spielfläche (Rohtasten); sonst Standard-Fokusführung.
    return phase === 'play' || phase === 'count';
  };

  const modal = new Modal(env.shell, { name: 'minigame', title: request.label ?? def.title, size: 'wide', closable: false, onIntent });
  modal.el.classList.add('mg');
  modal.backdrop.classList.add('on-frame', 'mg-backdrop');
  modal.el.dataset.minigame = request.id;

  const timeFill = h('i', { class: 'mg-time-fill' });
  const timeBar = h('div', { class: 'mg-time', 'aria-hidden': 'true' }, timeFill);
  const timeText = h('span', { class: 'mg-time-text' });
  const scoreEl = h('span', { class: 'mg-score', 'aria-live': 'polite' });
  const infoEl = h('span', { class: 'mg-info' });
  const quit = h('button', { type: 'button', class: 'btn small mg-quit', tabindex: '-1', title: 'Aufgeben (Esc)', 'aria-label': 'Aufgeben', onclick: () => requestAbort() }, '✕');
  quit.addEventListener('pointerdown', (event) => event.preventDefault());
  const hud = h('div', { class: 'mg-hud' }, timeBar, timeText, scoreEl, infoEl, quit);
  const stage = h('div', { class: 'mg-stage', tabindex: '-1' });
  const layer = h('div', { class: 'mg-layer' });
  const banner = h('div', { class: 'mg-banner' });
  modal.body.append(hud, h('div', { class: 'mg-stage-wrap' }, stage, layer, banner));

  const keyHandlers: ((event: KeyboardEvent, down: boolean) => void)[] = [];
  const onKeyDown = (event: KeyboardEvent) => {
    if (phase !== 'play' || event.code === 'Escape' || event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.code === 'Space' || event.code.startsWith('Arrow')) event.preventDefault();
    for (const handler of keyHandlers) handler(event, true);
  };
  const onKeyUp = (event: KeyboardEvent) => {
    if (phase !== 'play' || event.code === 'Escape') return;
    for (const handler of keyHandlers) handler(event, false);
  };
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  cleanups.push(() => { window.removeEventListener('keydown', onKeyDown); window.removeEventListener('keyup', onKeyUp); });
  stage.addEventListener('contextmenu', (event) => event.preventDefault());

  const host: MinigameHost = {
    stage,
    signal: life.signal,
    setScore: (text) => { scoreEl.textContent = text; },
    setInfo: (text) => { infoEl.textContent = text; },
    onKey: (handler) => { keyHandlers.push(handler); },
    frame(step) {
      let last = performance.now();
      const tick = (now: number) => {
        if (life.signal.aborted) return;
        const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
        last = now;
        if (step(dt, now) === false) return;
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    },
    wait: (ms) => new Promise((resolve) => {
      const id = setTimeout(resolve, ms);
      cleanups.push(() => clearTimeout(id));
    }),
    countdown(seconds) {
      let end = performance.now() + seconds * 1000;
      let total = seconds;
      let stopped = false;
      let resolveDone!: () => void;
      const done = new Promise<void>((resolve) => { resolveDone = resolve; });
      timeBar.classList.add('on');
      const handle: CountdownHandle = {
        left: () => Math.max(0, (end - performance.now()) / 1000),
        add: (extraSeconds) => { end += extraSeconds * 1000; total += Math.max(0, extraSeconds); },
        stop: () => { stopped = true; },
        done,
      };
      host.frame(() => {
        if (stopped) return false;
        const left = handle.left();
        timeFill.style.width = `${clamp(left / total, 0, 1) * 100}%`;
        timeBar.classList.toggle('low', left < Math.min(10, total * 0.25));
        timeText.textContent = `${Math.ceil(left)} s`;
        if (left <= 0) { stopped = true; resolveDone(); return false; }
        return true;
      });
      return handle;
    },
    pop(text, tone: PopTone = 'info', x = 50, y = 40) {
      const element = h('div', { class: `mg-pop ${tone}` }, text);
      element.style.left = `${x}%`;
      element.style.top = `${y}%`;
      layer.append(element);
      setTimeout(() => element.remove(), 950);
    },
    extra: (...effects) => { extra.push(...effects); },
    summary: (line) => { summary.push(line); },
  };

  const finish = (won: boolean, aborted: boolean): Promise<MinigameResult> => {
    phase = 'result';
    life.abort();
    for (const cleanup of cleanups.splice(0)) cleanup();
    timeBar.classList.remove('on', 'low');
    timeText.textContent = '';
    ctx.sfx(won ? 'success' : 'fail');
    return new Promise((resolve) => {
      clear(layer);
      const lines = aborted ? ['Aufgegeben. Die Unterstadt merkt sich so was.'] : summary;
      const done = () => { clearTimeout(auto); modal.close(); resolve({ won, aborted, extra, played: true }); };
      const button = h('button', { type: 'button', class: 'btn primary', 'data-autofocus': true, 'data-testid': 'minigame-continue', onclick: () => done() }, 'Weiter');
      layer.append(h('div', { class: `mg-screen mg-result ${won ? 'won' : 'lost'}` },
        h('div', { class: 'mg-result-head' }, won ? 'GESCHAFFT!' : aborted ? 'AUFGEGEBEN' : 'VERKACKT.'),
        ...lines.map((line) => h('p', null, line)),
        h('div', { class: 'mg-screen-foot' }, button)));
      layer.classList.add('open');
      requestAnimationFrame(() => button.focus({ preventScroll: true }));
      const auto = setTimeout(done, won ? 5500 : 7000);
    });
  };

  return (async () => {
    // Einleitung
    const dots = '●'.repeat(ctx.level) + '○'.repeat(5 - ctx.level);
    const bonuses = def.bonuses?.(ctx) ?? [];
    const start = await new Promise<boolean>((resolve) => {
      introAnswer = resolve;
      const go = h('button', { type: 'button', class: 'btn primary', 'data-autofocus': true, 'data-testid': 'minigame-start', onclick: () => resolve(true) }, 'Los geht’s');
      const no = h('button', { type: 'button', class: 'btn', onclick: () => resolve(false) }, 'Lieber nicht');
      layer.append(h('div', { class: 'mg-screen mg-intro' },
        h('div', { class: 'mg-intro-title' }, def.title),
        h('div', { class: 'mg-level', title: 'Schwierigkeit' }, `Schwierigkeit ${dots}`),
        h('p', { class: 'lead' }, def.blurb),
        h('ul', { class: 'mg-controls' }, ...def.controls.map((line) => h('li', null, line))),
        bonuses.length ? h('ul', { class: 'mg-bonuses' }, ...bonuses.map((line) => h('li', null, line))) : null,
        h('p', { class: 'meta' }, 'Aufgeben zählt als verloren.'),
        h('div', { class: 'mg-screen-foot' }, no, go)));
      layer.classList.add('open');
      requestAnimationFrame(() => go.focus({ preventScroll: true }));
    });
    introAnswer = null;
    clear(layer);
    layer.classList.remove('open');
    if (!start) return finish(false, true);

    // Countdown
    phase = 'count';
    stage.focus({ preventScroll: true });
    const count = h('div', { class: 'mg-count' });
    layer.append(count);
    for (const step of ['3', '2', '1', 'LOS!']) {
      count.textContent = step;
      count.classList.remove('beat');
      void count.offsetWidth;
      count.classList.add('beat');
      ctx.sfx(step === 'LOS!' ? 'success' : 'switch');
      await new Promise((resolve) => setTimeout(resolve, step === 'LOS!' ? 380 : 420));
    }
    count.remove();

    // Spiel
    phase = 'play';
    const cancelled = new Promise<'cancel'>((resolve) => { cancelGame = () => resolve('cancel'); });
    let outcome: boolean | 'cancel';
    try {
      outcome = await Promise.race([def.run(host, ctx), cancelled]);
    } catch (error) {
      console.error('[minigame] Fehler im Spiel – zählt als gewonnen', error);
      outcome = true;
    }
    cancelGame = null;
    if (outcome === 'cancel') return finish(false, true);
    return finish(outcome, false);
  })();
}
