import Phaser from 'phaser';
import type { SpriteSheetEntry } from '../../modules/contracts';
import { assetUrl, type AssetCatalog } from '../../platform/assets/manifest';
import { drawBackground, drawCityMap, drawCutscene, drawPose, drawProp, drawTitle, drawWalkSheet, WALK_FOOT, WALK_FRAME } from '../placeholders';

export type AssetNeed =
  | { kind: 'bg'; key: string; label: string; size?: readonly [number, number] }
  | { kind: 'walk'; key: string }
  | { kind: 'pose'; key: string }
  | { kind: 'prop'; key: string }
  | { kind: 'cut'; key: string; label: string }
  | { kind: 'title'; key: string }
  | { kind: 'citymap'; key: string };

export const FACING_ROW: Record<'s' | 'w' | 'e' | 'n', number> = { s: 0, w: 1, e: 2, n: 3 };

/** Laufzeit-Laufblatt: `ensure` legt die Textur samt Frames an, `entry` beschreibt Raster und Animationen. */
export interface DynamicSheet { entry: SpriteSheetEntry; ensure(scene: Phaser.Scene): void }

/** Metadaten zu jeder Figurentextur (echt oder Platzhalter). */
export interface SheetInfo { key: string; frameW: number; frameH: number; cols: number; rows: number; foot: readonly [number, number]; placeholder: boolean; anims: string[] }

/**
 * Lädt Grafiken szenenweise nach und erzeugt für fehlende Schlüssel oder Dateien prozedurale Platzhalter.
 * Texturen sind global (Phaser-TextureManager); fehlgeschlagene Dateien werden nicht erneut versucht.
 */
export class SceneAssets {
  private missing = new Set<string>();
  private sheets = new Map<string, SheetInfo>();
  private dynamic = new Map<string, DynamicSheet>();
  readonly placeholders = new Set<string>();

  constructor(private readonly catalog: AssetCatalog) {}

  /** Zur Laufzeit erzeugtes Laufblatt (z. B. die gebackene Spielfigur 'player-walk'): erzeugt statt geladen. */
  registerDynamic(key: string, sheet: DynamicSheet): void { this.dynamic.set(key, sheet); }

  /** Für preload(): reiht fehlende Texturen in den Loader ein. */
  queue(scene: Phaser.Scene, needs: readonly AssetNeed[]): number {
    let queued = 0;
    const seen = new Set<string>();
    for (const need of needs) {
      if (seen.has(need.key) || scene.textures.exists(need.key) || this.missing.has(need.key)) continue;
      seen.add(need.key);
      const sheet = this.catalog.sprite(need.key);
      const image = this.catalog.manifest.images[need.key];
      if (sheet && (need.kind === 'walk' || need.kind === 'pose' || need.kind === 'prop')) {
        scene.load.spritesheet(need.key, assetUrl(sheet.file), { frameWidth: sheet.frameW, frameHeight: sheet.frameH });
        queued++;
      } else if (image) {
        scene.load.image(need.key, assetUrl(image));
        queued++;
      } else if (sheet) {
        scene.load.image(need.key, assetUrl(sheet.file));
        queued++;
      }
    }
    if (queued) {
      scene.load.off(Phaser.Loader.Events.FILE_LOAD_ERROR, this.onError, this);
      scene.load.on(Phaser.Loader.Events.FILE_LOAD_ERROR, this.onError, this);
    }
    return queued;
  }

  private onError(file: Phaser.Loader.File) {
    this.missing.add(file.key);
    console.warn(`[assets] Datei fehlt oder ist defekt: ${file.key} (${String(file.src)}) – Platzhalter wird verwendet.`);
  }

  /** Lädt zur Laufzeit (außerhalb von preload) und erzeugt danach Platzhalter. */
  load(scene: Phaser.Scene, needs: readonly AssetNeed[]): Promise<void> {
    return new Promise((resolve) => {
      const queued = this.queue(scene, needs);
      const finish = () => { this.ensure(scene, needs); resolve(); };
      if (!queued) { finish(); return; }
      scene.load.once(Phaser.Loader.Events.COMPLETE, finish);
      if (!scene.load.isLoading()) scene.load.start();
    });
  }

  /** Nach dem Laden: Platzhalter für alles, was fehlt; Animationen registrieren. */
  ensure(scene: Phaser.Scene, needs: readonly AssetNeed[]): void {
    for (const need of needs) {
      const dynamic = this.dynamic.get(need.key);
      if (dynamic) dynamic.ensure(scene);
      if (!scene.textures.exists(need.key)) this.makePlaceholder(scene, need);
      if (need.kind === 'walk' || need.kind === 'pose' || need.kind === 'prop') this.registerSheet(scene, need.key, need.kind);
    }
  }

  isPlaceholder(key: string): boolean { return this.placeholders.has(key); }

  sheet(key: string): SheetInfo | null { return this.sheets.get(key) ?? null; }

  private makePlaceholder(scene: Phaser.Scene, need: AssetNeed) {
    if (scene.textures.exists(need.key)) scene.textures.remove(need.key);
    let canvas: HTMLCanvasElement;
    switch (need.kind) {
      case 'bg': canvas = drawBackground(need.label, need.key, need.size?.[0], need.size?.[1]); break;
      case 'cut': canvas = drawCutscene(need.label, need.key); break;
      case 'walk': canvas = drawWalkSheet(need.key); break;
      case 'pose': {
        const match = /^(.*?)-(lying|sleeping|sitting|standing|[a-z]+)$/.exec(need.key);
        canvas = drawPose(match?.[1] ?? need.key, match?.[2] ?? 'lying');
        break;
      }
      case 'prop': canvas = drawProp(need.key); break;
      case 'title': canvas = drawTitle(); break;
      case 'citymap': canvas = drawCityMap(); break;
    }
    const texture = scene.textures.addCanvas(need.key, canvas);
    if (texture && need.kind === 'walk') {
      for (let i = 0; i < 16; i++) texture.add(i, 0, (i % 4) * WALK_FRAME, Math.floor(i / 4) * WALK_FRAME, WALK_FRAME, WALK_FRAME);
    }
    this.placeholders.add(need.key);
  }

  private registerSheet(scene: Phaser.Scene, key: string, kind: 'walk' | 'pose' | 'prop') {
    if (this.sheets.has(key)) return;
    const entry: SpriteSheetEntry | null = this.placeholders.has(key) ? null : this.catalog.sprite(key) ?? this.dynamic.get(key)?.entry ?? null;
    const texture = scene.textures.get(key);
    const source = texture.getSourceImage() as { width: number; height: number };
    let info: SheetInfo;
    if (entry) {
      info = { key, frameW: entry.frameW, frameH: entry.frameH, cols: entry.cols, rows: entry.rows, foot: entry.foot, placeholder: false, anims: [] };
    } else if (kind === 'walk') {
      info = { key, frameW: WALK_FRAME, frameH: WALK_FRAME, cols: 4, rows: 4, foot: WALK_FOOT, placeholder: this.placeholders.has(key), anims: [] };
    } else {
      info = { key, frameW: source.width, frameH: source.height, cols: 1, rows: 1, foot: [source.width / 2, source.height - (this.placeholders.has(key) && kind === 'pose' ? 6 : 2)], placeholder: this.placeholders.has(key), anims: [] };
    }
    const frameOf = (index: number): number | string => (texture.has(String(index)) ? index : '__BASE');
    if (kind === 'walk') {
      for (const [dir, row] of Object.entries(FACING_ROW)) {
        const animKey = `${key}@walk-${dir}`;
        if (!scene.anims.exists(animKey)) {
          const frames = [0, 1, 2, 3].map((col) => ({ key, frame: frameOf(row * info.cols + col) }));
          scene.anims.create({ key: animKey, frames, frameRate: 8, repeat: -1 });
        }
        info.anims.push(animKey);
      }
    }
    if (entry?.anims) {
      for (const [name, anim] of Object.entries(entry.anims)) {
        const animKey = `${key}@${name}`;
        if (!scene.anims.exists(animKey)) {
          scene.anims.create({ key: animKey, frames: anim.frames.map((frame) => ({ key, frame })), frameRate: anim.fps, repeat: anim.loop === false ? 0 : -1 });
        }
        info.anims.push(animKey);
      }
    }
    this.sheets.set(key, info);
  }
}

export function standFrame(scene: Phaser.Scene, info: SheetInfo, facing: 's' | 'w' | 'e' | 'n'): number | string {
  const index = info.rows >= 4 ? FACING_ROW[facing] * info.cols : 0;
  return scene.textures.get(info.key).has(String(index)) ? index : '__BASE';
}
