import type { InputRouter, NavDirection } from '../../platform/input/router';
import { h } from './dom';

/**
 * Touch-Steuerung: Steuerkreuz (8 Richtungen, Mehrfinger-fähig), Aktionsknopf, Zurück.
 * Jeder Knopf verfolgt seinen eigenen Pointer – Laufen und Interagieren gleichzeitig geht.
 */
export function createTouchControls(root: HTMLElement, input: InputRouter): HTMLElement {
  const arms: Record<NavDirection, HTMLElement> = {
    up: h('span', { class: 'arm up' }, '▲'), down: h('span', { class: 'arm down' }, '▼'),
    left: h('span', { class: 'arm left' }, '◀'), right: h('span', { class: 'arm right' }, '▶'),
  };
  const knob = h('span', { class: 'knob' });
  const dpad = h('div', { class: 'dpad', role: 'group', 'aria-label': 'Steuerkreuz', 'data-testid': 'touch-dpad' }, arms.up, arms.down, arms.left, arms.right, knob);
  const action = h('button', { class: 'touch-action', type: 'button', 'aria-label': 'Aktion (E)', 'data-testid': 'touch-action' }, 'E');
  const back = h('button', { class: 'touch-back', type: 'button', 'aria-label': 'Zurück (Esc)', 'data-testid': 'touch-back' }, 'Zurück');
  const controls = h('div', { class: 'touch', 'data-testid': 'touch-controls' }, dpad, h('div', { class: 'touch-buttons' }, back, action));

  let dpadPointer: number | null = null;
  let lastDirs = new Set<NavDirection>();
  const setVector = (x: number, y: number) => {
    const length = Math.hypot(x, y);
    const dirs = new Set<NavDirection>();
    if (length < 0.25) {
      input.setTouchVector({ x: 0, y: 0 });
    } else {
      // auf 8 Richtungen rasten
      const angle = Math.round(Math.atan2(y, x) / (Math.PI / 4)) * (Math.PI / 4);
      const vx = Math.round(Math.cos(angle) * 1000) / 1000;
      const vy = Math.round(Math.sin(angle) * 1000) / 1000;
      if (input.movementBlocked()) input.setTouchVector({ x: 0, y: 0 });
      else input.setTouchVector({ x: vx, y: vy });
      if (vy < -0.3) dirs.add('up');
      if (vy > 0.3) dirs.add('down');
      if (vx < -0.3) dirs.add('left');
      if (vx > 0.3) dirs.add('right');
    }
    for (const dir of Object.keys(arms) as NavDirection[]) arms[dir].classList.toggle('on', dirs.has(dir));
    // Menüs: Richtungswechsel als Navigationsabsicht
    for (const dir of dirs) if (!lastDirs.has(dir) && input.movementBlocked()) input.dispatch({ type: 'nav', dir }, 'touch');
    lastDirs = dirs;
    knob.style.transform = `translate(${Math.max(-1, Math.min(1, x)) * 40}px, ${Math.max(-1, Math.min(1, y)) * 40}px)`;
  };
  const fromEvent = (event: PointerEvent) => {
    const rect = dpad.getBoundingClientRect();
    const radius = rect.width / 2;
    setVector((event.clientX - rect.left - radius) / (radius * 0.6), (event.clientY - rect.top - radius) / (radius * 0.6));
  };
  dpad.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    dpadPointer = event.pointerId;
    try { dpad.setPointerCapture?.(event.pointerId); } catch { /* synthetischer Pointer */ }
    fromEvent(event);
  });
  dpad.addEventListener('pointermove', (event) => { if (event.pointerId === dpadPointer) fromEvent(event); });
  const release = (event: PointerEvent) => {
    if (event.pointerId !== dpadPointer) return;
    dpadPointer = null;
    setVector(0, 0);
  };
  dpad.addEventListener('pointerup', release);
  dpad.addEventListener('pointercancel', release);
  dpad.addEventListener('lostpointercapture', release);

  const pressButton = (button: HTMLElement, down: () => void, up?: () => void) => {
    button.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      try { button.setPointerCapture?.(event.pointerId); } catch { /* synthetischer Pointer */ }
      button.classList.add('on');
      down();
    });
    const end = () => { button.classList.remove('on'); up?.(); };
    button.addEventListener('pointerup', end);
    button.addEventListener('pointercancel', end);
    button.addEventListener('click', (event) => event.preventDefault());
    button.addEventListener('contextmenu', (event) => event.preventDefault());
  };
  pressButton(action, () => input.dispatch({ type: 'interact' }, 'touch'));
  pressButton(back, () => { input.pressHeld('cancel'); input.dispatch({ type: 'cancel' }, 'touch'); }, () => input.releaseHeld('cancel'));

  root.append(controls);
  return controls;
}
