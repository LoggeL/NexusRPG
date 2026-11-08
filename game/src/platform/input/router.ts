import type { Intent, IntentEvent, IntentHandler, InputSource, LayerOptions, MoveVector, NavDirection } from './types';

export * from './types';

interface Layer { id: number; name: string; handler: IntentHandler; modal: boolean }

const MOVE_CODES: Record<string, NavDirection> = {
  ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down',
  ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right',
};

const CODE_INTENTS: Record<string, Intent> = {
  KeyE: { type: 'interact' }, Space: { type: 'interact' }, Enter: { type: 'interact' }, NumpadEnter: { type: 'interact' },
  Escape: { type: 'cancel' }, KeyI: { type: 'inventory' }, KeyC: { type: 'character' }, KeyM: { type: 'map' },
  KeyQ: { type: 'quests' }, KeyR: { type: 'relations' }, KeyP: { type: 'phone' }, F1: { type: 'debugCollision' }, F2: { type: 'debugMenu' },
};

/** Ereignisse, die als Nutzergeste gelten (Audio-Freischaltung). Touch aktiviert erst bei pointerup/touchend/click. */
const GESTURE_EVENTS = ['pointerdown', 'pointerup', 'touchend', 'click', 'keydown'] as const;

function isTextField(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  if (target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) return true;
  if (target instanceof HTMLInputElement) return !['button', 'checkbox', 'radio', 'range', 'submit', 'reset'].includes(target.type);
  return false;
}

function isActivatable(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && !!target.closest('button, a[href], [role="button"], [role="tab"], [role="option"], input[type="checkbox"], input[type="radio"], summary');
}

/**
 * Eingabe-Router: Tastatur, Touch und Testbefehle werden zu Absichten.
 * Nur der oberste Layer erhält Absichten; modale Layer sperren die Bewegung.
 */
export class InputRouter {
  private layers: Layer[] = [];
  private nextId = 1;
  private keysDown = new Set<string>();
  private touchVector: MoveVector = { x: 0, y: 0 };
  private held = new Map<string, number>();
  private listeners = new Set<(event: IntentEvent) => void>();
  private disposed = false;
  private gestures = new Set<() => void>();

  constructor(private readonly target: Window = window) {
    target.addEventListener('keydown', this.onKeyDown, { capture: true });
    target.addEventListener('keyup', this.onKeyUp, { capture: true });
    target.addEventListener('blur', this.onBlur);
    for (const type of GESTURE_EVENTS) target.addEventListener(type, this.onGesture, { capture: true, passive: true });
  }

  /**
   * Rückruf bei jeder Nutzergeste (Zeiger, Touch, Klick, Taste), bis er abgemeldet wird.
   * Browser entsperren Audio nur bei bestimmten Gesten (Touch erst bei pointerup, Esc nie) –
   * deshalb nicht nur die erste Geste nutzen, sondern so lange wiederholen, bis Audio läuft.
   */
  onUserGesture(callback: () => void): () => void {
    this.gestures.add(callback);
    return () => { this.gestures.delete(callback); };
  }

  push(name: string, handler: IntentHandler, options: LayerOptions = {}): () => void {
    const layer: Layer = { id: this.nextId++, name, handler, modal: options.modal ?? true };
    this.layers.push(layer);
    this.clearMovement();
    return () => {
      const index = this.layers.findIndex((entry) => entry.id === layer.id);
      if (index >= 0) this.layers.splice(index, 1);
    };
  }

  topLayer(): string | null { return this.layers.at(-1)?.name ?? null; }
  layerNames(): string[] { return this.layers.map((layer) => layer.name); }

  /** Bewegung ist gesperrt, sobald irgendein modaler Layer (Dialog, Overlay, Cutscene) offen ist. */
  movementBlocked(): boolean { return this.layers.some((layer) => layer.modal); }

  dispatch(intent: Intent, source: InputSource = 'test', repeat = false): boolean {
    const event: IntentEvent = { intent, source, repeat };
    for (const listener of this.listeners) listener(event);
    for (let i = this.layers.length - 1; i >= 0; i--) {
      const layer = this.layers[i];
      const consumed = layer.handler(event);
      if (consumed || layer.modal) return !!consumed;
    }
    return false;
  }

  /** Beobachter für alle Absichten (z. B. Audio, Statistik) – verbrauchen nichts. */
  observe(listener: (event: IntentEvent) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  setTouchVector(vector: MoveVector): void { this.touchVector = vector; }

  /** Gedrückt-Halten einer Absicht (z. B. Esc lange halten zum Überspringen). */
  pressHeld(name: string): void { if (!this.held.has(name)) this.held.set(name, performance.now()); }
  releaseHeld(name: string): void { this.held.delete(name); }
  heldFor(name: string): number {
    const since = this.held.get(name);
    return since === undefined ? 0 : performance.now() - since;
  }

  moveVector(): MoveVector {
    if (this.movementBlocked()) return { x: 0, y: 0 };
    let x = this.touchVector.x;
    let y = this.touchVector.y;
    for (const code of this.keysDown) {
      const dir = MOVE_CODES[code];
      if (dir === 'up') y -= 1;
      if (dir === 'down') y += 1;
      if (dir === 'left') x -= 1;
      if (dir === 'right') x += 1;
    }
    x = Math.max(-1, Math.min(1, x));
    y = Math.max(-1, Math.min(1, y));
    const length = Math.hypot(x, y);
    return length > 1 ? { x: x / length, y: y / length } : { x, y };
  }

  clearMovement(): void {
    for (const code of [...this.keysDown]) if (MOVE_CODES[code]) this.keysDown.delete(code);
    this.touchVector = { x: 0, y: 0 };
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.target.removeEventListener('keydown', this.onKeyDown, { capture: true });
    this.target.removeEventListener('keyup', this.onKeyUp, { capture: true });
    this.target.removeEventListener('blur', this.onBlur);
    for (const type of GESTURE_EVENTS) this.target.removeEventListener(type, this.onGesture, { capture: true });
    this.layers = [];
    this.listeners.clear();
    this.gestures.clear();
  }

  private onGesture = () => {
    for (const callback of [...this.gestures]) {
      try { callback(); } catch { /* Audio darf das Spiel nie stoppen */ }
    }
  };

  private onBlur = () => {
    this.keysDown.clear();
    this.held.clear();
  };

  private onKeyDown = (event: KeyboardEvent) => {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    const code = event.code;
    const textField = isTextField(event.target);
    if (textField && code !== 'Escape') return;

    if (code === 'Escape') this.pressHeld('cancel');

    const nativeActivation = (code === 'Enter' || code === 'Space' || code === 'NumpadEnter') && isActivatable(event.target);
    if (nativeActivation) return; // Fokussierte Knöpfe lösen selbst aus – kein doppeltes Auslösen.

    const move = MOVE_CODES[code];
    if (move) {
      event.preventDefault();
      if (!this.movementBlocked()) this.keysDown.add(code);
      this.dispatch({ type: 'nav', dir: move }, 'keyboard', event.repeat);
      return;
    }
    if (/^Digit[1-9]$/.test(code) || /^Numpad[1-9]$/.test(code)) {
      this.dispatch({ type: 'digit', value: Number(code.slice(-1)) }, 'keyboard', event.repeat);
      return;
    }
    const intent = CODE_INTENTS[code];
    if (!intent) return;
    event.preventDefault();
    if (intent.type === 'interact' && event.repeat) return;
    this.dispatch(intent, 'keyboard', event.repeat);
  };

  private onKeyUp = (event: KeyboardEvent) => {
    this.keysDown.delete(event.code);
    if (event.code === 'Escape') this.releaseHeld('cancel');
  };
}
