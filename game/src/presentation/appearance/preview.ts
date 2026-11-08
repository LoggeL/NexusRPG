// Laufende, drehbare Vorschau der Baukasten-Spielfigur (Editor und Erstellung). Zeichnet eine Zelle des
// zusammengesetzten Laufblatts vergrößert auf ein Canvas: Laufen 8 fps, im Kreis oder fest in eine Richtung.
import type { AppearanceTexts, Facing, PlayerAppearance } from '../../modules/contracts';
import { drawWalkSheet, WALK_FRAME } from '../placeholders';
import { composeAppearance, type CreatorCatalog } from './compose';

const ROW: Record<Facing, number> = { s: 0, w: 1, e: 2, n: 3 };
/** Drehreihenfolge im Uhrzeigersinn (von oben gesehen). */
export const TURN_ORDER: readonly Facing[] = ['s', 'w', 'n', 'e'];
/** Laufen im Kreis: Richtungswechsel alle … ms. */
const CIRCLE_MS = 1600;

export interface PreviewOptions {
  catalog: CreatorCatalog | null;
  texts?: AppearanceTexts;
  /** Vergrößerung der 128er-Zelle (×3 ≈ 290 px Figurenhöhe). */
  scale?: number;
  reducedMotion?: boolean;
}

export class FigurePreview {
  readonly canvas: HTMLCanvasElement;
  private sheet: HTMLCanvasElement = drawWalkSheet('player');
  private token = 0;
  private raf = 0;
  private start = performance.now();
  private circleStart = performance.now();
  private dirIndex = 0;
  walking: boolean;
  circling: boolean;
  private lastDraw = '';

  constructor(private readonly options: PreviewOptions) {
    const scale = options.scale ?? 3;
    this.canvas = document.createElement('canvas');
    this.canvas.width = WALK_FRAME * scale;
    this.canvas.height = WALK_FRAME * scale;
    this.canvas.className = 'figure-preview';
    this.walking = !options.reducedMotion;
    this.circling = !options.reducedMotion;
    const tick = () => { this.draw(); this.raf = requestAnimationFrame(tick); };
    this.raf = requestAnimationFrame(tick);
  }

  get facing(): Facing { return TURN_ORDER[this.dirIndex]; }

  /** Neues Aussehen zusammensetzen (veraltete Ergebnisse werden verworfen). */
  set(appearance: PlayerAppearance): void {
    const catalog = this.options.catalog;
    if (!catalog) return;
    const token = ++this.token;
    void composeAppearance(appearance, { catalog, texts: this.options.texts }).then((sheet) => {
      if (token !== this.token) return;
      this.sheet = sheet;
      this.lastDraw = '';
    });
  }

  /** ⟳ (+1) bzw. ⟲ (−1); hält das Laufen im Kreis an. */
  turn(delta: number): void {
    this.circling = false;
    this.dirIndex = (this.dirIndex + delta + TURN_ORDER.length) % TURN_ORDER.length;
    this.lastDraw = '';
  }

  setWalking(walking: boolean): void {
    this.walking = walking;
    if (walking && !this.circling) this.circleStart = performance.now();
    this.lastDraw = '';
  }

  setCircling(circling: boolean): void {
    this.circling = circling;
    this.circleStart = performance.now();
    this.lastDraw = '';
  }

  private draw() {
    const now = performance.now();
    if (this.circling && this.walking && now - this.circleStart >= CIRCLE_MS) {
      this.circleStart = now;
      this.dirIndex = (this.dirIndex + 1) % TURN_ORDER.length;
    }
    const col = this.walking ? Math.floor((now - this.start) / 125) % 4 : 0;
    const row = ROW[this.facing];
    const key = `${row}|${col}`;
    if (key === this.lastDraw) return;
    this.lastDraw = key;
    const ctx = this.canvas.getContext('2d')!;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(this.sheet, col * WALK_FRAME, row * WALK_FRAME, WALK_FRAME, WALK_FRAME, 0, 0, this.canvas.width, this.canvas.height);
  }

  destroy(): void {
    cancelAnimationFrame(this.raf);
    this.token++;
  }
}
