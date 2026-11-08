import Phaser from 'phaser';
import type { Facing } from '../../modules/contracts';
import { standFrame, type SceneAssets, type SheetInfo } from './assets';
import { idleBreath } from './motion';

export { facingFrom } from './motion';

/** Figur auf der Karte: Fußanker, Lauf- (8 fps) und Standbild je Richtung, Atmen im Stand, Tiefensortierung nach Fuß-y. */
export class Actor {
  readonly sprite: Phaser.GameObjects.Sprite;
  readonly info: SheetInfo | null;
  facing: Facing;
  walking = false;
  x: number;
  y: number;

  /** Kleiner Tiefenversatz bei gleicher Fuß-y (Spielfigur liegt vorn). */
  depthBias = 0;
  /** Versatz des Atemrhythmus, damit nicht alle Figuren im Gleichtakt atmen. */
  private readonly breathPhase = Math.random() * 2600;

  constructor(private readonly scene: Phaser.Scene, assets: SceneAssets, readonly key: string, x: number, y: number, facing: Facing = 's', readonly id = key) {
    this.info = assets.sheet(key);
    this.x = x;
    this.y = y;
    this.facing = facing;
    const frame = this.info ? standFrame(scene, this.info, facing) : undefined;
    this.sprite = scene.add.sprite(Math.round(x), Math.round(y), key, frame);
    const info = this.info;
    if (info) this.sprite.setOrigin(info.foot[0] / info.frameW, info.foot[1] / info.frameH);
    else this.sprite.setOrigin(0.5, 1);
    this.sprite.setDepth(y);
    this.play(false);
  }

  setPosition(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.sprite.setPosition(Math.round(x), Math.round(y));
    this.sprite.setDepth(y + this.depthBias);
  }

  setFacing(facing: Facing) {
    if (facing === this.facing) return;
    this.facing = facing;
    this.play(this.walking);
  }

  setWalking(walking: boolean) {
    if (walking === this.walking) return;
    this.walking = walking;
    this.play(walking);
  }

  /** Atmen im Stand (nur Laufblätter, nicht bei reduzierter Bewegung oder im Laufen). */
  breathe(time: number, reduced: boolean) {
    const scaleY = !this.walking && !reduced && this.info && this.info.rows >= 4 ? idleBreath(time, this.breathPhase) : 1;
    if (this.sprite.scaleY !== scaleY) this.sprite.setScale(1, scaleY);
  }

  /** Einmalige Animation (z. B. Requisiten wie Windrad). */
  playLoop(name?: string) {
    const anims = this.info?.anims ?? [];
    const key = name ? anims.find((entry) => entry.endsWith(`@${name}`)) : anims.find((entry) => !entry.includes('@walk-')) ?? undefined;
    if (key) this.sprite.play(key);
  }

  private play(walking: boolean) {
    const info = this.info;
    if (!info) return;
    const animKey = `${info.key}@walk-${this.facing}`;
    if (walking && this.scene.anims.exists(animKey)) {
      if (this.sprite.anims.currentAnim?.key !== animKey || !this.sprite.anims.isPlaying) this.sprite.play(animKey, true);
    } else {
      this.sprite.anims.stop();
      this.sprite.setFrame(standFrame(this.scene, info, this.facing));
    }
  }

  destroy() { this.sprite.destroy(); }
}
