// Start (gemeinsam, Änderungen absprechen): Manifest, Komposition, Phaser 960×540, Einstieg aus der URL.
import Phaser from 'phaser';
import { loadManifest } from '../platform/assets/manifest';
import { InputRouter } from '../platform/input/router';
import { createSettingsStore } from '../platform/settings';
import { Director } from '../presentation/director';
import { createTouchControls } from '../presentation/dom/touchControls';
import { GAME_H, GAME_W, installLayout, prefersTouch } from '../presentation/dom/layout';
import { createCombatSessionFactory } from '../presentation/phaser/battle/combatSession';
import { installBattleRunner } from '../presentation/phaser/battle/runner';
import { ExploreScene } from '../presentation/phaser/scenes/ExploreScene';
import { BootScene, CutsceneScene, EndingScene, TitleScene } from '../presentation/phaser/scenes/simpleScenes';
import { setDirector } from '../presentation/runtime';
import { compose } from './composition';
import { installTestHook } from './testHook';
import { parseEntry } from './urlEntry';

async function waitForFonts() {
  try {
    await Promise.race([
      Promise.all([document.fonts.load('600 16px "Chakra Petch"'), document.fonts.load('16px "Atkinson Hyperlegible"')]),
      new Promise((resolve) => setTimeout(resolve, 1500)),
    ]);
  } catch { /* Schriften optional */ }
}

export async function bootstrap(): Promise<void> {
  const root = document.getElementById('ui');
  const parent = document.getElementById('game');
  if (!root || !parent) throw new Error('Grundgerüst fehlt (#ui, #game).');
  const errors: string[] = [];
  window.addEventListener('error', (event) => errors.push(String(event.message)));
  window.addEventListener('unhandledrejection', (event) => errors.push(String(event.reason)));

  const input = new InputRouter();
  const settings = createSettingsStore();
  let game: Phaser.Game | null = null;
  installLayout((layout) => {
    if (!game) return;
    game.scale.setZoom(layout.scale);
    game.scale.refresh();
  });

  const [{ manifest, error: manifestError }] = await Promise.all([loadManifest(), waitForFonts()]);
  if (manifestError) console.warn('[assets] Manifest nicht geladen:', manifestError, '– Platzhalter aktiv.');

  const params = new URLSearchParams(window.location.search);
  const { ctx, random } = compose({ manifest, settings, input, debug: params.has('debug'), params });

  const director = new Director(ctx, root);
  setDirector(director);
  director.touch = prefersTouch();
  director.screens.boot('Lädt …', ctx.warnings);
  createTouchControls(root, input);

  game = new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: GAME_W,
    height: GAME_H,
    backgroundColor: '#0b0716',
    // Gemalte HD-Hintergründe und Figuren: weich skalieren, keine Pixelraster-Rundung.
    pixelArt: false,
    roundPixels: false,
    antialias: true,
    disableContextMenu: true,
    audio: { noAudio: true },
    input: { activePointers: 3, keyboard: false },
    banner: false,
    scale: { mode: Phaser.Scale.NONE, autoCenter: Phaser.Scale.NO_CENTER, width: GAME_W, height: GAME_H },
    scene: [BootScene, TitleScene, ExploreScene, CutsceneScene, EndingScene],
  });
  director.attach(game);
  // Rasterkampf (modules/combat + BattleScene + Kampf-Oberfläche) ersetzt den DOM-Platzhalter; die Szene
  // registriert sich beim ersten Kampf selbst. Fehlt einer Begegnung die Arena, bleibt der Platzhalter.
  const battles = installBattleRunner(director, createCombatSessionFactory(ctx.content, () => ctx.campaign.state()));
  // Erstes Layout anwenden, sobald Phaser bereit ist
  game.events.once(Phaser.Core.Events.READY, () => window.dispatchEvent(new Event('resize')));

  const { entry, errors: entryErrors } = parseEntry(window.location.search, ctx.content);
  for (const message of entryErrors) director.shell.toast(message, 'bad', 6000);
  const hook = installTestHook(director, errors, random, battles);
  window.addEventListener('pagehide', () => director.persistNow());
  // Mobil wird ein Tab oft nur in den Hintergrund gelegt und später verworfen, ohne pagehide.
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') director.persistNow(); });
  try {
    await director.start(entry);
  } catch (error) {
    // Ein defekter Einstieg darf nicht auf „Lädt …“ hängen bleiben.
    console.error('[app] Start fehlgeschlagen', error);
    director.shell.toast('Der Einstieg konnte nicht geladen werden – zurück zum Titel.', 'bad', 6000);
    director.showTitle();
  }
  hook.ready = true;
}
