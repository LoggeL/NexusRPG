// Gebackene Spielfigur (design.md §3.1a „Darstellung“): Das Aussehen aus dem Baukasten wird einmalig in die
// Canvas-Textur 'player-walk' gezeichnet (16 Frames, Animationen walk-*/idle-* wie jedes Laufblatt). Ändert sich
// appearanceKey (Editor, Stylistin, Kleidungswechsel), wird dasselbe Canvas neu gezeichnet und refresh() gerufen –
// Frames und Animationen bleiben gültig. Bis die Teile geladen sind, zeigt das Canvas eine Platzhalter-Silhouette.
import type Phaser from 'phaser';
import { appearanceKey, effectiveAppearance, PLAYER_SPRITE } from '../../modules/appearance';
import type { CampaignPort, GameState, SpriteSheetEntry, WearLook } from '../../modules/contracts';
import { composeAppearance, loadCreatorCatalog } from '../appearance/compose';
import { drawWalkSheet, WALK_FOOT, WALK_FRAME } from '../placeholders';
import type { DynamicSheet } from './assets';

const anims: NonNullable<SpriteSheetEntry['anims']> = {};
(['s', 'w', 'e', 'n'] as const).forEach((dir, row) => {
  anims[`walk-${dir}`] = { frames: [0, 1, 2, 3].map((col) => row * 4 + col), fps: 8 };
  anims[`idle-${dir}`] = { frames: [row * 4 + 1], fps: 1 };
});

export const PLAYER_SHEET: SpriteSheetEntry = {
  file: '', frameW: WALK_FRAME, frameH: WALK_FRAME, cols: 4, rows: 4, foot: WALK_FOOT, anims,
};

/** Ausrüstungs-Überlagerung (`ItemDef.wear.look`) der angezogenen Kleidung. */
export function wearOverlays(campaign: CampaignPort, state: Readonly<GameState>): (WearLook | undefined)[] {
  return Object.values(state.player.equipment).map((id) => (id ? campaign.content.items[id]?.wear?.look : undefined));
}

export class PlayerTextureBaker implements DynamicSheet {
  readonly entry = PLAYER_SHEET;
  private readonly canvas: HTMLCanvasElement;
  private texture: Phaser.Textures.CanvasTexture | null = null;
  private key = '';
  private token = 0;

  constructor(private readonly campaign: CampaignPort) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = WALK_FRAME * 4;
    this.canvas.height = WALK_FRAME * 4;
    this.drawPlaceholder();
    campaign.subscribe(() => this.update());
  }

  private drawPlaceholder() {
    const ctx = this.canvas.getContext('2d')!;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.drawImage(drawWalkSheet('player'), 0, 0);
  }

  /** Textur (einmalig) anlegen und bei Bedarf neu backen. Texturen sind global, also für alle Szenen gültig. */
  ensure(scene: Phaser.Scene): void {
    const textures = scene.textures;
    const existing = textures.exists(PLAYER_SPRITE) ? textures.get(PLAYER_SPRITE) : null;
    if (!existing || existing !== this.texture) {
      if (existing) textures.remove(PLAYER_SPRITE);
      const texture = textures.addCanvas(PLAYER_SPRITE, this.canvas);
      if (!texture) return;
      for (let i = 0; i < 16; i++) texture.add(i, 0, (i % 4) * WALK_FRAME, Math.floor(i / 4) * WALK_FRAME, WALK_FRAME, WALK_FRAME);
      this.texture = texture;
    }
    this.update();
  }

  private update() {
    if (!this.texture) return;
    const state = this.campaign.state();
    if (state.player.preset) return; // Vex: gemaltes Laufblatt statt Baukasten
    const key = appearanceKey(state.player.appearance, wearOverlays(this.campaign, state));
    if (key === this.key) return;
    this.key = key;
    const token = ++this.token;
    const appearance = state.player.appearance;
    const overlays = wearOverlays(this.campaign, state);
    void (async () => {
      const catalog = await loadCreatorCatalog();
      if (!catalog || token !== this.token) return;
      const scratch = await composeAppearance(effectiveAppearance(appearance, overlays), { catalog, texts: this.campaign.content.appearance });
      if (token !== this.token || !this.texture) return;
      const ctx = this.canvas.getContext('2d')!;
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      ctx.drawImage(scratch, 0, 0);
      this.texture.refresh();
    })();
  }
}
