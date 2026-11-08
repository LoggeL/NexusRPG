// Kampfszene (Bereich combat-presentation): Arena 1536×1024 mit Raster 12 × 8 à 128 px, Einheiten als
// Laufblatt-Sprites mit LP-Balken und Status-Symbolen, Hervorhebungen, Pfadvorschau und Animationen.
// Ablauf und Auswahl steuert BattleController; die Szene setzt nur um (BattleWorldView) und meldet Eingaben.
import Phaser from 'phaser';
import type { ArenaDef, BattleUnit, Cell, Facing, GameContent, StatusId } from '../../../modules/contracts';
import type { SessionEvent, SessionState } from '../battle/rulesPort';
import type { AssetCatalog } from '../../../platform/assets/manifest';
import { GAME_H, GAME_W } from '../../dom/layout';
import { standFrame, type AssetNeed, type SceneAssets, type SheetInfo } from '../assets';
import { drawArenaPlaceholder, drawStatusSheet, STATUS_ICON } from '../battle/art';
import type { BattleWorldView, Highlights } from '../battle/controller';
import {
  ARENA_H, ARENA_W, CELL, cellAt, cellCenter, cellFoot, closeZoom, COLS, facingBetween, fitZoom, NO_INSETS, parseLayout, ROWS,
  screenToWorld, scrollFor, type Insets,
} from '../battle/geometry';
import { attackStyle, eventFloats, STATUS_META, STATUS_ORDER, type FloatText } from '../battle/text';

export const BATTLE_SCENE_KEY = 'battle';

/** Eingaben aus der Szene an den Ablauf. */
export interface BattleSceneInput {
  hover(cell: Cell | null): void;
  tap(cell: Cell, source: 'mouse' | 'touch'): void;
  cancel(): void;
}

export interface BattleSceneData {
  arena: ArenaDef;
  units: readonly BattleUnit[];
  content: Pick<GameContent, 'abilities' | 'items'>;
  catalog: AssetCatalog;
  assets: SceneAssets;
  input: BattleSceneInput;
  reducedMotion: () => boolean;
  /** Startzoom: 'fit' ganze Arena, 'close' Nahansicht (Touch). */
  zoom?: 'fit' | 'close';
  insets?: () => Insets;
  sfx?: (id: 'step' | 'shot' | 'hit' | 'hack' | 'hurt' | 'heal' | 'fail') => void;
  onReady(scene: BattleScene): void;
}

const DEPTH = { bg: 0, grid: 5, marks: 8, highlight: 10, path: 20, cursor: 30, unitBase: 1000, fx: 4000, float: 5000, bubble: 5100 } as const;
const COLOR = { cyan: 0x3ef2ff, pink: 0xff3fa4, violet: 0x9b5cff, yellow: 0xffe14a, green: 0x6dffb0, red: 0xff4a6a, ink: 0xf4f0ff, dark: 0x0b0716 } as const;
const STATUS_SHEET_KEY = 'battle-status-icons';
const STEP_MS = 150;
const FONT = '"Chakra Petch", "Atkinson Hyperlegible", sans-serif';

/** Darstellung einer Einheit: Sprite, Ring, LP-Balken, Status-Symbole. */
class UnitView {
  readonly sprite: Phaser.GameObjects.Sprite;
  readonly ring: Phaser.GameObjects.Graphics;
  readonly bar: Phaser.GameObjects.Graphics;
  readonly icons: Phaser.GameObjects.Image[] = [];
  cell: Cell;
  facing: Facing;
  hp: number;
  maxHp: number;
  statuses: Partial<Record<StatusId, number>> = {};
  state: BattleUnit['state'];
  active = false;
  inspected = false;
  overwatch = false;
  busy = false;

  constructor(private readonly scene: BattleScene, readonly unit: BattleUnit, readonly info: SheetInfo | null) {
    this.cell = unit.cell;
    this.facing = unit.facing;
    this.hp = unit.hp;
    this.maxHp = unit.maxHp;
    this.state = unit.state;
    const [x, y] = cellFoot(unit.cell);
    this.ring = scene.add.graphics();
    this.sprite = scene.add.sprite(x, y, unit.sprite, info ? standFrame(scene, info, unit.facing) : undefined);
    if (info) this.sprite.setOrigin(info.foot[0] / info.frameW, info.foot[1] / info.frameH);
    else this.sprite.setOrigin(0.5, 1);
    // Figuren ~96 px hoch in 128-px-Zellen; zu große Blätter auf Zellhöhe begrenzen.
    const frameH = info?.frameH ?? this.sprite.height;
    if (frameH > CELL * 1.25) this.sprite.setScale((CELL * 1.1) / frameH);
    this.bar = scene.add.graphics();
    this.place(x, y);
    this.redraw();
  }

  get team() { return this.unit.team; }

  place(x: number, y: number) {
    this.sprite.setPosition(x, y);
    this.sprite.setDepth(DEPTH.unitBase + y);
    this.ring.setPosition(x, y).setDepth(DEPTH.unitBase + y - 64);
    this.bar.setPosition(x, y).setDepth(DEPTH.fx - 10 + y / 10000);
    const top = this.headY();
    STATUS_ORDER.filter((id) => (this.statuses[id] ?? 0) > 0).forEach((_, index, list) => {
      const icon = this.icons[index];
      if (icon) icon.setPosition(x + (index - (list.length - 1) / 2) * 24, y + top - 26).setDepth(DEPTH.fx - 9);
    });
  }

  headY(): number { return -Math.min(118, (this.sprite.displayHeight || 110) * 0.86 + 8); }

  face(facing: Facing, walking: boolean) {
    this.facing = facing;
    const info = this.info;
    if (!info) return;
    const anim = `${info.key}@walk-${facing}`;
    if (walking && this.scene.anims.exists(anim)) {
      if (this.sprite.anims.currentAnim?.key !== anim || !this.sprite.anims.isPlaying) this.sprite.play(anim, true);
    } else {
      this.sprite.anims.stop();
      this.sprite.setFrame(standFrame(this.scene, info, facing));
    }
  }

  redraw() {
    const ring = this.ring;
    ring.clear();
    const visible = this.state === 'active';
    if (visible && this.active) {
      const color = this.team === 'party' ? COLOR.cyan : COLOR.pink;
      ring.lineStyle(5, color, 0.95).strokeEllipse(0, -4, 92, 30);
      ring.fillStyle(color, 0.18).fillEllipse(0, -4, 92, 30);
    } else if (visible && this.inspected) {
      ring.lineStyle(3, COLOR.ink, 0.8).strokeEllipse(0, -4, 84, 26);
    } else if (visible) {
      ring.fillStyle(this.team === 'party' ? COLOR.cyan : COLOR.pink, 0.12).fillEllipse(0, -4, 76, 22);
    }
    if (visible && this.overwatch) ring.lineStyle(3, COLOR.yellow, 0.9).strokeEllipse(0, -4, 108, 38);
    // LP-Balken
    const bar = this.bar;
    bar.clear();
    if (this.state === 'active') {
      const width = 78;
      const top = this.headY() - 6;
      const ratio = Math.max(0, Math.min(1, this.hp / Math.max(1, this.maxHp)));
      const fill = ratio > 0.5 ? COLOR.green : ratio > 0.25 ? COLOR.yellow : COLOR.red;
      bar.fillStyle(COLOR.dark, 0.9).fillRect(-width / 2 - 3, top - 3, width + 6, 14);
      bar.lineStyle(2, this.team === 'party' ? COLOR.cyan : COLOR.pink, 1).strokeRect(-width / 2 - 3, top - 3, width + 6, 14);
      bar.fillStyle(fill, 1).fillRect(-width / 2, top, Math.round(width * ratio), 8);
      // Teilstriche je 5 LP
      bar.lineStyle(1, COLOR.dark, 0.7);
      for (let hp = 5; hp < this.maxHp; hp += 5) {
        const x = -width / 2 + (width * hp) / this.maxHp;
        bar.lineBetween(x, top, x, top + 8);
      }
    }
    this.syncIcons();
  }

  private syncIcons() {
    const list = this.state === 'active' ? STATUS_ORDER.filter((id) => (this.statuses[id] ?? 0) > 0) : [];
    while (this.icons.length > list.length) this.icons.pop()?.destroy();
    list.forEach((id, index) => {
      let icon = this.icons[index];
      if (!icon) {
        icon = this.scene.add.image(0, 0, STATUS_SHEET_KEY, STATUS_ORDER.indexOf(id)).setScale(22 / STATUS_ICON);
        this.icons[index] = icon;
      }
      icon.setFrame(STATUS_ORDER.indexOf(id));
    });
    this.place(this.sprite.x, this.sprite.y);
  }

  applyState(state: BattleUnit['state']) {
    this.state = state;
    const sprite = this.sprite;
    sprite.setVisible(state !== 'fled');
    if (state === 'down') { sprite.setAngle(this.team === 'party' ? -78 : 78).setAlpha(0.6).setTint(0x8a86a0); }
    else if (state === 'surrendered') { sprite.setAngle(0).setAlpha(0.7).setTint(0xd8d4ff); }
    else if (state === 'active') { sprite.setAngle(0).setAlpha(1).clearTint(); }
    this.ring.setVisible(state === 'active');
    this.redraw();
  }

  destroy() {
    this.sprite.destroy();
    this.ring.destroy();
    this.bar.destroy();
    for (const icon of this.icons) icon.destroy();
  }
}

export class BattleScene extends Phaser.Scene implements BattleWorldView {
  private cfg!: BattleSceneData;
  private views = new Map<string, UnitView>();
  private highlightGfx!: Phaser.GameObjects.Graphics;
  private pathGfx!: Phaser.GameObjects.Graphics;
  private cursorGfx!: Phaser.GameObjects.Graphics;
  private badges: Phaser.GameObjects.Text[] = [];
  private zoomMode: 'fit' | 'close' = 'fit';
  private zoom = 1;
  private targetScroll: [number, number] = [0, 0];
  private focusPoint: [number, number] = [ARENA_W / 2, ARENA_H / 2];
  private insets: Insets = NO_INSETS;
  private drag: { x: number; y: number; scroll: [number, number]; moved: boolean; id: number; at: number } | null = null;
  private pinch: { distance: number; zoom: number } | null = null;
  private ready = false;

  constructor() { super(BATTLE_SCENE_KEY); }

  init(data: BattleSceneData) {
    this.cfg = data;
    this.views = new Map();
    this.badges = [];
    this.ready = false;
    this.zoomMode = data.zoom ?? 'fit';
  }

  private arenaKey(): string { return this.cfg.catalog.canonical(this.cfg.arena.bg, 'arena'); }

  private needs(): AssetNeed[] {
    const sprites = new Set(this.cfg.units.map((unit) => unit.sprite));
    return [...sprites].map((key) => ({ kind: 'walk' as const, key }));
  }

  preload() {
    const { catalog, assets } = this.cfg;
    const key = this.arenaKey();
    const file = catalog.imageUrl(catalog.imageKey(this.cfg.arena.bg, 'arena'));
    if (file && !this.textures.exists(key)) this.load.image(key, file);
    assets.queue(this, this.needs());
  }

  create() {
    const { arena, assets } = this.cfg;
    assets.ensure(this, this.needs());
    this.cameras.main.setBackgroundColor('#0b0716');
    // Arena-Hintergrund: echtes Bild oder Platzhalter aus dem Layout
    const key = this.arenaKey();
    const placeholderKey = `battle-arena-placeholder-${arena.id}`;
    let bgKey = key;
    if (!this.textures.exists(key) || this.textures.get(key).key === '__MISSING') {
      if (!this.textures.exists(placeholderKey)) this.textures.addCanvas(placeholderKey, drawArenaPlaceholder(arena));
      bgKey = placeholderKey;
    }
    this.add.image(0, 0, bgKey).setOrigin(0).setDisplaySize(ARENA_W, ARENA_H).setDepth(DEPTH.bg);
    if (!this.textures.exists(STATUS_SHEET_KEY)) {
      const texture = this.textures.addCanvas(STATUS_SHEET_KEY, drawStatusSheet());
      if (texture) STATUS_ORDER.forEach((_, index) => texture.add(index, 0, index * STATUS_ICON, 0, STATUS_ICON, STATUS_ICON));
    }
    this.drawGrid();
    this.highlightGfx = this.add.graphics().setDepth(DEPTH.highlight);
    this.pathGfx = this.add.graphics().setDepth(DEPTH.path);
    this.cursorGfx = this.add.graphics().setDepth(DEPTH.cursor);
    for (const unit of this.cfg.units) this.addUnit(unit);
    this.setupInput();
    this.insets = this.cfg.insets?.() ?? NO_INSETS;
    this.applyZoom(true);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.teardown());
    this.ready = true;
    this.cfg.onReady(this);
  }

  update(time: number) {
    if (!this.ready) return;
    const camera = this.cameras.main;
    const lerp = this.cfg.reducedMotion() ? 1 : 0.18;
    const dx = this.targetScroll[0] - camera.scrollX;
    const dy = this.targetScroll[1] - camera.scrollY;
    if (Math.abs(dx) > 0.3 || Math.abs(dy) > 0.3) camera.setScroll(camera.scrollX + dx * lerp, camera.scrollY + dy * lerp);
    else if (dx || dy) camera.setScroll(this.targetScroll[0], this.targetScroll[1]);
    if (this.cursorGfx.visible) this.cursorGfx.setAlpha(this.cfg.reducedMotion() ? 1 : 0.65 + 0.35 * Math.sin(time / 180));
  }

  // ---------------------------------------------------------------- Aufbau

  private drawGrid() {
    const grid = this.add.graphics().setDepth(DEPTH.grid);
    grid.lineStyle(2, COLOR.cyan, 0.2);
    for (let col = 0; col <= COLS; col++) grid.lineBetween(col * CELL, 0, col * CELL, ARENA_H);
    for (let row = 0; row <= ROWS; row++) grid.lineBetween(0, row * CELL, ARENA_W, row * CELL);
    // Kleine Marken für Deckung und Gefahr (lesbar auch auf gemalten Arenen)
    const marks = this.add.graphics().setDepth(DEPTH.marks);
    const tiles = parseLayout(this.cfg.arena);
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const x = col * CELL + 10;
        const y = row * CELL + 10;
        const tile = tiles[row][col];
        if (tile === 'half' || tile === 'full') {
          marks.fillStyle(COLOR.dark, 0.75).fillRoundedRect(x - 4, y - 4, 30, 32, 6);
          marks.lineStyle(3, tile === 'full' ? COLOR.pink : COLOR.cyan, 1);
          marks.strokePoints([new Phaser.Math.Vector2(x + 11, y), new Phaser.Math.Vector2(x + 22, y + 5), new Phaser.Math.Vector2(x + 21, y + 15), new Phaser.Math.Vector2(x + 11, y + 24), new Phaser.Math.Vector2(x + 1, y + 15), new Phaser.Math.Vector2(x, y + 5)], true);
          if (tile === 'full') marks.fillStyle(COLOR.pink, 0.9).fillTriangle(x + 11, y + 4, x + 18, y + 8, x + 11, y + 19);
          else marks.fillStyle(COLOR.cyan, 0.9).fillTriangle(x + 11, y + 4, x + 11, y + 19, x + 4, y + 8);
        } else if (tile === 'hazard') {
          marks.fillStyle(COLOR.dark, 0.75).fillRoundedRect(x - 4, y - 4, 30, 30, 6);
          marks.fillStyle(COLOR.yellow, 1).fillTriangle(x + 11, y, x + 23, y + 21, x - 1, y + 21);
          marks.fillStyle(COLOR.dark, 1).fillRect(x + 10, y + 7, 3, 8).fillRect(x + 10, y + 17, 3, 3);
        }
      }
    }
  }

  private addUnit(unit: BattleUnit): UnitView {
    const info = this.cfg.assets.sheet(unit.sprite);
    const view = new UnitView(this, unit, info);
    view.statuses = { ...unit.status };
    view.overwatch = unit.overwatch;
    view.applyState(unit.state);
    this.views.set(unit.id, view);
    return view;
  }

  private teardown() {
    for (const view of this.views.values()) view.destroy();
    this.views.clear();
    for (const badge of this.badges) badge.destroy();
    this.badges = [];
    this.input.removeAllListeners();
    this.ready = false;
  }

  // ---------------------------------------------------------------- Kamera

  setInsets(insets: Insets) {
    if (insets.top === this.insets.top && insets.bottom === this.insets.bottom && insets.left === this.insets.left && insets.right === this.insets.right) return;
    this.insets = insets;
    this.applyZoom(false);
  }

  get zoomLevel(): 'fit' | 'close' { return this.zoomMode; }

  setZoomMode(mode: 'fit' | 'close') {
    this.zoomMode = mode;
    this.applyZoom(false);
  }

  toggleZoom(): 'fit' | 'close' {
    this.setZoomMode(this.zoomMode === 'fit' ? 'close' : 'fit');
    return this.zoomMode;
  }

  private view() { return { width: GAME_W, height: GAME_H }; }

  private applyZoom(instant: boolean, zoom?: number) {
    const view = this.view();
    const min = fitZoom(view, this.insets);
    const max = Math.max(min, 1);
    this.zoom = zoom !== undefined ? Math.max(min, Math.min(max, zoom)) : this.zoomMode === 'fit' ? min : closeZoom(view, this.insets);
    this.cameras.main.setZoom(this.zoom);
    this.targetScroll = scrollFor(view, this.insets, this.zoom, this.focusPoint);
    if (instant || this.cfg.reducedMotion()) this.cameras.main.setScroll(...this.targetScroll);
  }

  focus(target: Cell | string, instant = false): Promise<void> {
    const point = typeof target === 'string' ? this.unitPoint(target) : cellCenter(target);
    if (!point) return Promise.resolve();
    this.focusPoint = [point[0], point[1] - 40];
    const before = this.targetScroll;
    this.targetScroll = scrollFor(this.view(), this.insets, this.zoom, this.focusPoint);
    if (instant || this.cfg.reducedMotion()) { this.cameras.main.setScroll(...this.targetScroll); return Promise.resolve(); }
    const distance = Math.hypot(this.targetScroll[0] - before[0], this.targetScroll[1] - before[1]);
    return distance < 4 ? Promise.resolve() : this.wait(Math.min(320, 120 + distance / 4));
  }

  private unitPoint(id: string): [number, number] | null {
    const view = this.views.get(id);
    return view ? [view.sprite.x, view.sprite.y] : null;
  }

  // ---------------------------------------------------------------- Eingabe

  private pointerCell(pointer: Phaser.Input.Pointer): Cell | null {
    const [x, y] = screenToWorld(this.view(), this.zoom, [this.cameras.main.scrollX, this.cameras.main.scrollY], pointer.x, pointer.y);
    return cellAt(x, y);
  }

  private setupInput() {
    const input = this.input;
    input.mouse?.disableContextMenu();
    input.on(Phaser.Input.Events.POINTER_DOWN, (pointer: Phaser.Input.Pointer) => {
      if (pointer.rightButtonDown()) { this.cfg.input.cancel(); return; }
      const pointers = input.manager.pointers.filter((entry) => entry.isDown);
      if (pointers.length >= 2) {
        const [a, b] = pointers;
        this.pinch = { distance: Math.max(1, Phaser.Math.Distance.Between(a.x, a.y, b.x, b.y)), zoom: this.zoom };
        this.drag = null;
        return;
      }
      this.drag = { x: pointer.x, y: pointer.y, scroll: [this.cameras.main.scrollX, this.cameras.main.scrollY], moved: false, id: pointer.id, at: pointer.downTime };
    });
    input.on(Phaser.Input.Events.POINTER_MOVE, (pointer: Phaser.Input.Pointer) => {
      if (this.pinch) {
        const pointers = input.manager.pointers.filter((entry) => entry.isDown);
        if (pointers.length >= 2) {
          const [a, b] = pointers;
          const distance = Phaser.Math.Distance.Between(a.x, a.y, b.x, b.y);
          this.applyZoom(true, this.pinch.zoom * (distance / this.pinch.distance));
          this.zoomMode = this.zoom > fitZoom(this.view(), this.insets) + 0.01 ? 'close' : 'fit';
        }
        return;
      }
      const drag = this.drag;
      if (drag && pointer.isDown && pointer.id === drag.id) {
        const dx = pointer.x - drag.x;
        const dy = pointer.y - drag.y;
        if (!drag.moved && Math.hypot(dx, dy) > 10) drag.moved = true;
        if (drag.moved) this.panTo(drag.scroll[0] - dx / this.zoom, drag.scroll[1] - dy / this.zoom);
        return;
      }
      if (!pointer.wasTouch) this.cfg.input.hover(this.pointerCell(pointer));
    });
    input.on(Phaser.Input.Events.POINTER_UP, (pointer: Phaser.Input.Pointer) => {
      if (this.pinch) {
        if (!input.manager.pointers.some((entry) => entry.isDown)) this.pinch = null;
        return;
      }
      const drag = this.drag;
      this.drag = null;
      if (!drag || drag.moved || pointer.id !== drag.id || pointer.rightButtonReleased()) return;
      const cell = this.pointerCell(pointer);
      if (cell) this.cfg.input.tap(cell, pointer.wasTouch ? 'touch' : 'mouse');
    });
    input.on(Phaser.Input.Events.GAME_OUT, () => this.cfg.input.hover(null));
    input.on(Phaser.Input.Events.POINTER_WHEEL, (_pointer: Phaser.Input.Pointer, _over: unknown, _dx: number, dy: number) => {
      this.applyZoom(false, this.zoom * (dy > 0 ? 0.9 : 1.1));
      this.zoomMode = this.zoom > fitZoom(this.view(), this.insets) + 0.01 ? 'close' : 'fit';
    });
  }

  /** Verschieben per Ziehen, am Arenarand geklemmt (oder zentriert, falls die Arena passt). */
  private panTo(scrollX: number, scrollY: number) {
    const view = this.view();
    const freeCenterX = this.insets.left + (view.width - this.insets.left - this.insets.right) / 2;
    const freeCenterY = this.insets.top + (view.height - this.insets.top - this.insets.bottom) / 2;
    const [fx, fy] = screenToWorld(view, this.zoom, [scrollX, scrollY], freeCenterX, freeCenterY);
    this.focusPoint = [fx, fy];
    this.targetScroll = scrollFor(view, this.insets, this.zoom, this.focusPoint);
    this.cameras.main.setScroll(...this.targetScroll);
  }

  // ---------------------------------------------------------------- BattleWorldView

  setHighlights(highlights: Highlights) {
    if (!this.ready) return;
    const g = this.highlightGfx;
    g.clear();
    const rect = (cell: Cell, inset = 4) => [cell[0] * CELL + inset, cell[1] * CELL + inset, CELL - inset * 2, CELL - inset * 2] as const;
    for (const cell of highlights.goals) {
      g.fillStyle(COLOR.yellow, 0.14).fillRect(...rect(cell, 6));
      g.lineStyle(3, COLOR.yellow, 0.85).strokeRect(...rect(cell, 6));
    }
    for (const cell of highlights.range) g.fillStyle(COLOR.violet, 0.16).fillRect(...rect(cell));
    for (const { cell, ap } of highlights.reach) {
      const color = ap >= 2 ? COLOR.yellow : COLOR.cyan;
      g.fillStyle(color, 0.16).fillRect(...rect(cell));
      g.lineStyle(2, color, 0.55).strokeRect(...rect(cell));
    }
    for (const cell of highlights.area) {
      g.fillStyle(COLOR.pink, 0.28).fillRect(...rect(cell, 2));
      g.lineStyle(2, COLOR.pink, 0.8).strokeRect(...rect(cell, 2));
    }
    for (const badge of this.badges) badge.destroy();
    this.badges = [];
    for (const mark of highlights.targets) {
      const color = mark.blocked ? 0x8a86a0 : COLOR.pink;
      g.lineStyle(mark.selected ? 6 : 4, color, mark.selected ? 1 : 0.85).strokeRect(...rect(mark.cell, 3));
      if (mark.selected) g.fillStyle(color, 0.18).fillRect(...rect(mark.cell, 3));
      const view = mark.unit ? this.views.get(mark.unit) : undefined;
      const [cx] = cellCenter(mark.cell);
      const top = view ? view.sprite.y + view.headY() - 34 : mark.cell[1] * CELL + 18;
      const badge = this.add.text(cx, top, mark.badge, {
        fontFamily: FONT, fontSize: '26px', color: mark.blocked ? '#b8afd6' : '#ffffff', backgroundColor: mark.blocked ? '#2a2440' : '#8a1f5c',
        padding: { x: 8, y: 2 }, stroke: '#05030b', strokeThickness: 3,
      }).setOrigin(0.5, 1).setDepth(DEPTH.float - 1);
      this.badges.push(badge);
    }
    // Pfadvorschau
    const p = this.pathGfx;
    p.clear();
    if (highlights.path && highlights.path.length > 1) {
      const color = highlights.pathAp >= 2 ? COLOR.yellow : COLOR.cyan;
      const points = highlights.path.map((cell) => cellCenter(cell));
      p.lineStyle(14, COLOR.dark, 0.55);
      p.beginPath();
      p.moveTo(points[0][0], points[0][1]);
      for (const [x, y] of points.slice(1)) p.lineTo(x, y);
      p.strokePath();
      p.lineStyle(6, color, 0.95);
      p.beginPath();
      p.moveTo(points[0][0], points[0][1]);
      for (const [x, y] of points.slice(1)) p.lineTo(x, y);
      p.strokePath();
      for (const [x, y] of points.slice(1, -1)) p.fillStyle(color, 1).fillCircle(x, y, 7);
      const [ex, ey] = points[points.length - 1];
      p.lineStyle(5, color, 1).strokeCircle(ex, ey, 22);
      p.fillStyle(color, 0.35).fillCircle(ex, ey, 22);
    }
    // Cursor
    const c = this.cursorGfx;
    c.clear();
    c.setVisible(!!highlights.cursor);
    if (highlights.cursor) {
      const [x, y, w, h] = rect(highlights.cursor, 2);
      c.lineStyle(4, COLOR.ink, 1);
      const k = 26;
      for (const [ax, ay, sx, sy] of [[x, y, 1, 1], [x + w, y, -1, 1], [x, y + h, 1, -1], [x + w, y + h, -1, -1]] as const) {
        c.lineBetween(ax, ay, ax + k * sx, ay);
        c.lineBetween(ax, ay, ax, ay + k * sy);
      }
    }
    for (const [id, view] of this.views) {
      const active = id === highlights.active;
      const inspected = id === highlights.inspect;
      if (view.active !== active || view.inspected !== inspected) {
        view.active = active;
        view.inspected = inspected;
        view.redraw();
      }
    }
  }

  sync(state: Readonly<SessionState>) {
    if (!this.ready) return;
    for (const unit of state.units) {
      const view = this.views.get(unit.id) ?? this.addUnit(unit);
      if (view.busy) continue;
      view.cell = unit.cell;
      view.hp = unit.hp;
      view.maxHp = unit.maxHp;
      view.statuses = { ...unit.status };
      view.overwatch = unit.overwatch;
      view.active = unit.id === state.active;
      view.place(...cellFoot(unit.cell));
      view.face(unit.facing, false);
      if (view.state !== unit.state) view.applyState(unit.state);
      else view.redraw();
    }
  }

  async play(event: SessionEvent, state: Readonly<SessionState>): Promise<void> {
    if (!this.ready) return;
    const reduced = this.cfg.reducedMotion();
    switch (event.type) {
      case 'turn': {
        for (const [id, view] of this.views) { view.active = id === event.unit; view.redraw(); }
        return;
      }
      case 'move': await this.walk(event.unit, event.path); return;
      case 'attack': {
        const attacker = this.views.get(event.unit);
        const target = this.views.get(event.target);
        if (!attacker || !target) return;
        const style = attackStyle(this.cfg.content, state.units.find((unit) => unit.id === event.unit), event.ability);
        attacker.face(facingBetween(attacker.cell, target.cell, attacker.facing), false);
        if (style === 'melee') await this.lunge(attacker, target);
        else if (style === 'hack') { this.cfg.sfx?.('hack'); await this.hackBeam(attacker, target, event.hit); }
        else { this.cfg.sfx?.('shot'); await this.tracer(attacker, target, event.hit); }
        if (event.hit) {
          target.hp = Math.max(0, target.hp - event.damage);
          target.redraw();
          this.cfg.sfx?.(target.team === 'party' ? 'hurt' : 'hit');
          if (style === 'hack') await this.glitch(target, reduced ? 120 : 420);
          await this.shake(target);
        } else {
          this.cfg.sfx?.('fail');
          await this.dodge(target);
        }
        this.floats(eventFloats(event, this.cfg.content));
        await this.wait(reduced ? 120 : 280);
        return;
      }
      case 'heal': {
        const target = this.views.get(event.target);
        if (!target) return;
        target.hp = Math.min(target.maxHp, target.hp + event.amount);
        target.redraw();
        this.cfg.sfx?.('heal');
        this.flash(target, COLOR.green);
        this.floats(eventFloats(event, this.cfg.content));
        await this.wait(reduced ? 120 : 360);
        return;
      }
      case 'status': {
        const target = this.views.get(event.unit);
        if (!target) return;
        target.statuses = { ...target.statuses, [event.status]: event.turns };
        target.redraw();
        if (event.status === 'gehackt' && event.turns > 0) await this.glitch(target, reduced ? 100 : 360);
        this.floats(eventFloats(event, this.cfg.content));
        await this.wait(reduced ? 100 : 300);
        return;
      }
      case 'down': {
        const target = this.views.get(event.unit);
        if (!target) return;
        target.busy = true;
        target.state = 'down';
        target.redraw();
        await this.tween({ targets: target.sprite, angle: target.team === 'party' ? -78 : 78, alpha: 0.6, duration: reduced ? 1 : 360, ease: 'Quad.easeIn' });
        target.applyState('down');
        target.busy = false;
        return;
      }
      case 'flee': {
        const target = this.views.get(event.unit);
        if (!target) return;
        this.floats(eventFloats(event, this.cfg.content));
        target.busy = true;
        const toRight = target.sprite.x > ARENA_W / 2;
        target.face(toRight ? 'e' : 'w', true);
        await this.tween({ targets: target.sprite, x: target.sprite.x + (toRight ? 220 : -220), alpha: 0, duration: reduced ? 1 : 520 });
        target.applyState('fled');
        target.busy = false;
        return;
      }
      case 'surrender': {
        const target = this.views.get(event.unit);
        if (!target) return;
        this.floats(eventFloats(event, this.cfg.content));
        target.applyState('surrendered');
        await this.wait(reduced ? 100 : 420);
        return;
      }
      case 'bark': {
        await this.bubble(event.unit, event.text, reduced ? 1200 : 1600);
        return;
      }
      case 'damage': {
        // Feuer, Blutung, Gefahrenfeld
        const target = this.views.get(event.unit);
        if (!target) return;
        target.hp = Math.max(0, target.hp - event.amount);
        target.redraw();
        this.cfg.sfx?.(target.team === 'party' ? 'hurt' : 'hit');
        this.flash(target, event.source === 'blutet' ? COLOR.red : 0xff7a3a);
        this.floats(eventFloats(event, this.cfg.content));
        await this.wait(reduced ? 100 : 320);
        return;
      }
      case 'revive': {
        const target = this.views.get(event.target);
        if (!target) return;
        target.hp = event.hp;
        target.applyState('active');
        this.flash(target, COLOR.green);
        this.cfg.sfx?.('heal');
        this.floats(eventFloats(event, this.cfg.content));
        await this.wait(reduced ? 100 : 400);
        return;
      }
      case 'statusEnd': {
        const target = this.views.get(event.unit);
        if (!target) return;
        const statuses = { ...target.statuses };
        delete statuses[event.status];
        target.statuses = statuses;
        target.redraw();
        return;
      }
      case 'skip': {
        const target = this.views.get(event.unit);
        if (!target) return;
        if (event.status === 'gehackt') await this.glitch(target, reduced ? 100 : 300);
        this.floats(eventFloats(event, this.cfg.content));
        await this.wait(reduced ? 100 : 380);
        return;
      }
      case 'overwatch': {
        const target = this.views.get(event.unit);
        if (target) { target.overwatch = true; target.redraw(); }
        this.floats(eventFloats(event, this.cfg.content));
        await this.wait(reduced ? 80 : 260);
        return;
      }
      case 'ability':
      case 'item': {
        // Namensschild der Fähigkeit über dem Anwender, Blick zum Ziel
        const user = this.views.get(event.unit);
        const target = event.target ? this.views.get(event.target) : undefined;
        if (user && target && target !== user) user.face(facingBetween(user.cell, target.cell, user.facing), false);
        else if (user && event.type === 'ability' && event.cell) user.face(facingBetween(user.cell, event.cell, user.facing), false);
        this.floats(eventFloats(event, this.cfg.content));
        await this.wait(reduced ? 80 : 300);
        return;
      }
      case 'phase': {
        const target = this.views.get(event.unit);
        if (target) { await this.glitch(target, reduced ? 100 : 300); await this.shake(target); }
        this.cameras.main.flash(reduced ? 0 : 220, 255, 63, 164);
        this.floats(eventFloats(event, this.cfg.content));
        await this.wait(reduced ? 100 : 400);
        return;
      }
      case 'resist':
      case 'morale':
      case 'cover':
      case 'weapon':
      case 'objective': {
        this.floats(eventFloats(event, this.cfg.content));
        await this.wait(reduced ? 60 : 220);
        return;
      }
      case 'round':
      case 'end': return;
    }
  }

  // ---------------------------------------------------------------- Animationen

  private wait(ms: number): Promise<void> {
    return new Promise((resolve) => {
      if (ms <= 0 || !this.ready) { resolve(); return; }
      this.time.delayedCall(ms, () => resolve());
    });
  }

  private tween(config: Phaser.Types.Tweens.TweenBuilderConfig): Promise<void> {
    return new Promise((resolve) => {
      if (!this.ready) { resolve(); return; }
      this.tweens.add({ ...config, onComplete: () => resolve(), onStop: () => resolve() });
    });
  }

  private async walk(id: string, path: readonly Cell[]) {
    const view = this.views.get(id);
    if (!view || !path.length) return;
    view.busy = true;
    const reduced = this.cfg.reducedMotion();
    this.cfg.sfx?.('step');
    let from = view.cell;
    for (const cell of path) {
      const facing = facingBetween(from, cell, view.facing);
      view.face(facing, true);
      const [x, y] = cellFoot(cell);
      this.focusPoint = [x, y - 40];
      this.targetScroll = scrollFor(this.view(), this.insets, this.zoom, this.focusPoint);
      const start = { x: view.sprite.x, y: view.sprite.y };
      const proxy = { t: 0 };
      await this.tween({
        targets: proxy, t: 1, duration: reduced ? 40 : STEP_MS, ease: 'Linear',
        onUpdate: () => view.place(start.x + (x - start.x) * proxy.t, start.y + (y - start.y) * proxy.t),
      });
      view.place(x, y);
      view.cell = cell;
      from = cell;
    }
    view.face(view.facing, false);
    view.busy = false;
  }

  private async lunge(attacker: UnitView, target: UnitView) {
    const reduced = this.cfg.reducedMotion();
    const dx = target.sprite.x - attacker.sprite.x;
    const dy = target.sprite.y - attacker.sprite.y;
    const length = Math.max(1, Math.hypot(dx, dy));
    const ox = attacker.sprite.x;
    const oy = attacker.sprite.y;
    const proxy = { t: 0 };
    await this.tween({
      targets: proxy, t: 1, duration: reduced ? 1 : 110, yoyo: true, ease: 'Quad.easeOut',
      onUpdate: () => attacker.place(ox + (dx / length) * 40 * proxy.t, oy + (dy / length) * 40 * proxy.t),
    });
    attacker.place(ox, oy);
    this.slash(target);
  }

  private slash(target: UnitView) {
    const g = this.add.graphics().setDepth(DEPTH.fx);
    const x = target.sprite.x;
    const y = target.sprite.y - 60;
    g.lineStyle(6, COLOR.ink, 1).lineBetween(x - 30, y - 26, x + 30, y + 26);
    g.lineStyle(3, COLOR.pink, 1).lineBetween(x - 26, y + 22, x + 26, y - 22);
    this.tweens.add({ targets: g, alpha: 0, duration: this.cfg.reducedMotion() ? 60 : 260, onComplete: () => g.destroy() });
  }

  private async tracer(attacker: UnitView, target: UnitView, hit: boolean) {
    const reduced = this.cfg.reducedMotion();
    const sx = attacker.sprite.x;
    const sy = attacker.sprite.y - 62;
    const miss = hit ? 0 : (target.sprite.x >= sx ? 1 : -1) * 54;
    const tx = target.sprite.x + miss;
    const ty = target.sprite.y - 58 + (hit ? 0 : -30);
    const g = this.add.graphics().setDepth(DEPTH.fx);
    g.lineStyle(12, COLOR.pink, 0.3).lineBetween(sx, sy, tx, ty);
    g.lineStyle(4, 0xffffff, 1).lineBetween(sx, sy, tx, ty);
    g.fillStyle(COLOR.yellow, 1).fillCircle(sx, sy, 9);
    if (hit) g.fillStyle(0xffffff, 0.9).fillCircle(tx, ty, 14);
    await this.tween({ targets: g, alpha: 0, duration: reduced ? 60 : 240, ease: 'Quad.easeIn' });
    g.destroy();
  }

  private async hackBeam(attacker: UnitView, target: UnitView, hit: boolean) {
    const reduced = this.cfg.reducedMotion();
    const sx = attacker.sprite.x;
    const sy = attacker.sprite.y - 70;
    const tx = target.sprite.x;
    const ty = target.sprite.y - 60;
    const g = this.add.graphics().setDepth(DEPTH.fx);
    const segments = 9;
    const draw = (seed: number) => {
      g.clear();
      for (const [width, color, alpha] of [[10, COLOR.cyan, 0.25], [3, COLOR.cyan, 1], [2, COLOR.pink, 0.8]] as const) {
        g.lineStyle(width, color, alpha);
        g.beginPath();
        g.moveTo(sx, sy);
        for (let i = 1; i < segments; i++) {
          const t = i / segments;
          const jitter = ((i * 37 + seed * 11) % 17) - 8;
          g.lineTo(sx + (tx - sx) * t + jitter * (color === COLOR.pink ? -1.4 : 1.4), sy + (ty - sy) * t + jitter);
        }
        g.lineTo(hit ? tx : tx + 50, hit ? ty : ty - 30);
        g.strokePath();
      }
    };
    draw(0);
    if (!reduced) {
      for (let i = 1; i <= 4; i++) { await this.wait(55); draw(i); }
    }
    await this.tween({ targets: g, alpha: 0, duration: reduced ? 60 : 160 });
    g.destroy();
  }

  /** Hack-Glitch: Farbversatz, Zittern und Bildstreifen über der Figur. */
  private async glitch(target: UnitView, ms: number) {
    const sprite = target.sprite;
    const ox = sprite.x;
    const slices = this.add.graphics().setDepth(DEPTH.fx + 1);
    const reduced = this.cfg.reducedMotion();
    const steps = Math.max(1, Math.round(ms / 50));
    for (let i = 0; i < steps; i++) {
      sprite.setTint(i % 2 ? COLOR.cyan : COLOR.pink);
      slices.clear();
      if (!reduced) {
        sprite.x = ox + ((i * 7) % 5 - 2) * 4;
        for (let k = 0; k < 4; k++) {
          const y = sprite.y - 20 - ((i * 13 + k * 29) % 90);
          const w = 30 + ((i * 17 + k * 23) % 50);
          slices.fillStyle(k % 2 ? COLOR.cyan : COLOR.pink, 0.55).fillRect(ox - w / 2 + ((k * 31 + i * 9) % 30) - 15, y, w, 5);
        }
      }
      await this.wait(50);
    }
    sprite.x = ox;
    if (target.state === 'active') sprite.clearTint();
    slices.destroy();
  }

  private async shake(target: UnitView) {
    if (this.cfg.reducedMotion()) { this.flash(target, COLOR.red); return; }
    this.flash(target, COLOR.red);
    const ox = target.sprite.x;
    const oy = target.sprite.y;
    const proxy = { t: 0 };
    await this.tween({
      targets: proxy, t: 1, duration: 260, ease: 'Linear',
      onUpdate: () => target.place(ox + Math.sin(proxy.t * Math.PI * 8) * 9 * (1 - proxy.t), oy),
    });
    target.place(ox, oy);
  }

  private async dodge(target: UnitView) {
    if (this.cfg.reducedMotion()) return;
    const ox = target.sprite.x;
    const oy = target.sprite.y;
    const proxy = { t: 0 };
    await this.tween({
      targets: proxy, t: 1, duration: 120, yoyo: true, ease: 'Quad.easeOut',
      onUpdate: () => target.place(ox - 22 * proxy.t, oy),
    });
    target.place(ox, oy);
  }

  private flash(target: UnitView, color: number) {
    target.sprite.setTintFill(color);
    this.time.delayedCall(this.cfg.reducedMotion() ? 60 : 110, () => { if (target.state === 'active') target.sprite.clearTint(); });
  }

  private floats(list: readonly FloatText[]) {
    const reduced = this.cfg.reducedMotion();
    list.forEach((float, index) => {
      const view = this.views.get(float.unit);
      if (!view) return;
      const color = float.tone === 'damage' ? '#ff6a8a' : float.tone === 'heal' ? '#6dffb0' : float.tone === 'miss' ? '#d8d4ff' : float.tone === 'status' ? '#3ef2ff' : '#ffe14a';
      const size = float.tone === 'damage' || float.tone === 'heal' ? 44 : 30;
      const text = this.add.text(view.sprite.x, view.sprite.y + view.headY() - 20 - index * 34, float.text, {
        fontFamily: FONT, fontSize: `${size}px`, fontStyle: '700', color, stroke: '#05030b', strokeThickness: 7,
      }).setOrigin(0.5, 1).setDepth(DEPTH.float);
      if (float.tone === 'status') {
        const status = (Object.keys(STATUS_META) as StatusId[]).find((id) => STATUS_META[id].label === float.text);
        if (status) text.setColor(STATUS_META[status].color);
      }
      this.tweens.add({ targets: text, y: text.y - (reduced ? 0 : 56), alpha: { from: 1, to: 0 }, delay: reduced ? 600 : 420, duration: reduced ? 200 : 700, onComplete: () => text.destroy() });
    });
  }

  private bubble(id: string, line: string, ms: number): Promise<void> {
    const view = this.views.get(id);
    if (!view) return Promise.resolve();
    const text = this.add.text(0, 0, line, {
      fontFamily: '"Atkinson Hyperlegible", sans-serif', fontSize: '24px', color: '#f4f0ff', wordWrap: { width: 340 }, align: 'center',
    }).setOrigin(0.5, 1);
    const pad = 12;
    const width = text.width + pad * 2;
    const height = text.height + pad * 2;
    const bg = this.add.graphics();
    bg.fillStyle(0x130c26, 0.95).fillRoundedRect(-width / 2, -height, width, height, 10);
    bg.lineStyle(3, view.team === 'party' ? COLOR.cyan : COLOR.pink, 1).strokeRoundedRect(-width / 2, -height, width, height, 10);
    bg.fillStyle(0x130c26, 0.95).fillTriangle(-10, 0, 10, 0, 0, 14);
    text.setPosition(0, -pad);
    const container = this.add.container(view.sprite.x, view.sprite.y + view.headY() - 40, [bg, text]).setDepth(DEPTH.bubble);
    return this.wait(ms).then(() => {
      if (!this.ready) { container.destroy(); return; }
      this.tweens.add({ targets: container, alpha: 0, duration: 200, onComplete: () => container.destroy() });
    });
  }
}
