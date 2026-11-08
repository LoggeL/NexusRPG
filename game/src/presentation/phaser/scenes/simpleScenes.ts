import Phaser from 'phaser';
import { GAME_H, GAME_W } from '../../dom/layout';
import { getDirector } from '../../runtime';

// Einfache Szenen (Bereich explore-presentation): Boot, Titel, Cutscene-Bühne, Abspann.

/** Boot: wartet auf Schriften und meldet Bereitschaft. Grafiken lädt jede Szene selbst nach. */
export class BootScene extends Phaser.Scene {
  constructor() { super('boot'); }
  create() {
    this.cameras.main.setBackgroundColor('#0b0716');
    getDirector().bootSceneReady();
  }
}

/** Titel: Hintergrundbild ui-title; Logo und Menü liegen als DOM darüber. */
export class TitleScene extends Phaser.Scene {
  constructor() { super('title'); }
  preload() {
    const rt = getDirector();
    rt.assets.queue(this, [{ kind: 'title', key: rt.catalog.canonical('ui-title') }]);
  }
  create() {
    const rt = getDirector();
    const key = rt.catalog.canonical('ui-title');
    rt.assets.ensure(this, [{ kind: 'title', key }]);
    this.add.image(0, 0, key).setOrigin(0).setDisplaySize(GAME_W, GAME_H);
    if (!rt.settings.get().reducedMotion) {
      const shade = this.add.rectangle(0, 0, GAME_W, GAME_H, 0x000000, 0.0).setOrigin(0);
      this.tweens.add({ targets: shade, fillAlpha: { from: 0.12, to: 0 }, duration: 3000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }
    this.cameras.main.fadeIn(rt.settings.get().reducedMotion ? 0 : 500, 0, 0, 0);
  }
}

/** Cutscene: schwarze Bühne; Bild, Kamerafahrt und Text laufen im DOM-Player (scharf in voller Auflösung). */
export class CutsceneScene extends Phaser.Scene {
  private onUpdate: ((time: number) => void) | null = null;
  constructor() { super('cutscene'); }
  init(data: { onUpdate?: (time: number) => void }) { this.onUpdate = data.onUpdate ?? null; }
  create() { this.cameras.main.setBackgroundColor('#000000'); }
  update(time: number) { this.onUpdate?.(time); }
}

/** Abspann: Hintergrund (Epilog-Bild, falls vorhanden) unter der DOM-Statistik. */
export class EndingScene extends Phaser.Scene {
  constructor() { super('ending'); }
  preload() {
    const rt = getDirector();
    rt.assets.queue(this, [{ kind: 'cut', key: rt.catalog.canonical('epilog', 'cut'), label: 'Epilog' }]);
  }
  create() {
    const rt = getDirector();
    const key = rt.catalog.canonical('epilog', 'cut');
    rt.assets.ensure(this, [{ kind: 'cut', key, label: 'Epilog' }]);
    const image = this.add.image(GAME_W / 2, GAME_H / 2, key);
    const source = image.texture.getSourceImage() as { width: number; height: number };
    image.setScale(Math.max(GAME_W / source.width, GAME_H / source.height));
    this.add.rectangle(0, 0, GAME_W, GAME_H, 0x000000, 0.45).setOrigin(0);
    this.cameras.main.fadeIn(rt.settings.get().reducedMotion ? 0 : 800, 0, 0, 0);
  }
}
