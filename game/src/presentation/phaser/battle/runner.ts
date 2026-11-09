// Kampfablauf zusammensetzen (Bereich combat-presentation): Regel-Sitzung + Kampfszene + DOM-Oberfläche.
//
// Einbindung (Integration, z. B. in app/bootstrap.ts nach `director.attach(game)`):
//   installBattleRunner(director, (encounter) => <BattleSessionPort aus modules/combat> ?? null);
// Damit ersetzt der Rasterkampf den DOM-Platzhalter. Liefert die Fabrik `null`, bleibt der Platzhalter.
import type Phaser from 'phaser';
import type {
  AudioPort, BattleOutcome, BattleResult, BattleUnit, CampaignPort, EncounterId, GameContent, SfxId,
} from '../../../modules/contracts';
import type { AssetCatalog } from '../../../platform/assets/manifest';
import type { SettingsStore } from '../../../platform/settings';
import { openBattlePlaceholder } from '../../dom/battlePlaceholder';
import { BattleUi } from '../../dom/battleUi';
import type { UiShell } from '../../dom/shell';
import type { Director } from '../../director';
import type { SceneAssets } from '../assets';
import { BATTLE_SCENE_KEY, BattleScene, type BattleSceneData } from '../scenes/BattleScene';
import { BattleController, type BattleHudView } from './controller';
import type { BattleSessionFactory } from './rulesPort';

export interface BattleRunnerDeps {
  game: Phaser.Game;
  shell: UiShell;
  content: GameContent;
  campaign: CampaignPort;
  catalog: AssetCatalog;
  assets: SceneAssets;
  audio: AudioPort;
  settings: SettingsStore;
  createSession: BattleSessionFactory;
  /** Touch-Bedienung: Tippen zeigt erst Vorschau; Startansicht Nah. */
  touch: () => boolean;
}

/** Laufender Kampf (für Test-Hook und Debug). */
export interface ActiveBattle {
  encounter: EncounterId;
  controller: BattleController;
  ui: BattleUi;
  scene: BattleScene;
}

type SceneSfx = Parameters<NonNullable<BattleSceneData['sfx']>>[0];
const SCENE_SFX: Record<SceneSfx, SfxId> = {
  step: 'step', shot: 'shot', hit: 'hit', hack: 'hack', hurt: 'hurt', heal: 'heal', fail: 'fail',
};
const UI_SFX: Record<'select' | 'confirm' | 'deny', SfxId> = { select: 'switch', confirm: 'talk', deny: 'fail' };

export class BattleRunner {
  /** Aktueller Kampf oder null. */
  current: ActiveBattle | null = null;
  /** Letztes vollständiges Kampfergebnis (inkl. Beute, XP, verbrauchter Gegenstände). */
  lastResult: BattleResult | null = null;

  constructor(private readonly deps: BattleRunnerDeps) {}

  /** true, wenn für diese Begegnung eine Regel-Sitzung entsteht (sonst Platzhalter). */
  canRun(encounter: EncounterId): boolean {
    const def = this.deps.content.encounters[encounter];
    return !!def && !!this.deps.content.arenas[def.arena];
  }

  /**
   * Kampf spielen. Ergebnis `null` = abgebrochen (z. B. `Director.resolveBattle`) oder keine Sitzung;
   * `'unavailable'` = Regeln fehlen für diese Begegnung (Aufrufer nutzt den Platzhalter).
   */
  async run(encounterId: EncounterId): Promise<BattleResult | null | 'unavailable'> {
    const { content, campaign, shell, catalog, assets, audio, settings, game } = this.deps;
    const encounter = content.encounters[encounterId];
    if (!encounter || !content.arenas[encounter.arena]) return 'unavailable';
    let session;
    try { session = this.deps.createSession(encounter); } catch (error) { console.warn('[battle] Sitzung konnte nicht erzeugt werden', error); session = null; }
    if (!session) return 'unavailable';
    if (this.current) this.abort();

    const reducedMotion = () => settings.get().reducedMotion;
    const initialZoom: 'fit' | 'close' = this.deps.touch() ? 'close' : 'fit';
    let controller: BattleController | null = null;
    let scene: BattleScene | null = null;
    let aborted = false;
    const ui = new BattleUi(shell, catalog, {
      action: (key) => controller?.action(key),
      pickSub: (index) => controller?.pickSub(index),
      cancel: () => controller?.cancel(),
      confirm: () => controller?.confirm(),
      selectUnit: (id) => controller?.selectUnit(id),
      intent: (event) => { controller?.intent(event.intent); },
      toggleZoom: () => scene?.toggleZoom() ?? 'fit',
      closed: () => { aborted = true; controller?.abort(); },
      reducedMotion,
      sfx: (id) => audio.sfx(UI_SFX[id]),
    }, encounter.name, initialZoom);

    const explore = game.scene.getScene('explore');
    const hideExplore = !!explore && explore.sys.isVisible();
    if (hideExplore) explore.sys.setVisible(false);
    const stopInsets = ui.onInsetsChange(() => { if (scene) scene.setInsets(ui.insets()); });

    try {
      scene = await this.startScene({
        arena: session.arena, units: session.state().units, content, catalog, assets, reducedMotion, zoom: initialZoom,
        extraSprites: reinforcementSprites(content, session.state().units),
        insets: () => ui.insets(),
        sfx: (id) => audio.sfx(SCENE_SFX[id]),
        input: {
          hover: (cell) => controller?.hover(cell),
          tap: (cell, source) => controller?.tap(cell, source),
          cancel: () => controller?.cancel(),
        },
      });
      if (aborted) return null;
      const hud: BattleHudView = {
        update: (model) => { ui.update(model); scene?.setInsets(ui.insets()); },
        banner: (text, sub) => ui.banner(text, sub),
        say: (speaker, text) => ui.say(speaker, text),
        log: (line) => ui.log(line),
        toast: (text, tone) => ui.toast(text, tone),
        showResult: (model) => {
          audio.sfx(model.outcome === 'win' ? 'success' : 'fail');
          return ui.showResult(model);
        },
        sfx: (id) => ui.sfx(id),
      };
      const playerName = campaign.state().player.name;
      controller = new BattleController({
        port: session, content, world: scene, hud,
        inventory: () => campaign.state().inventory,
        speakerName: (speaker) => campaign.displayName(speaker),
        formatText: (text) => text.replaceAll('{name}', playerName),
        touch: this.deps.touch,
      });
      this.current = { encounter: encounterId, controller, ui, scene };
      let result: BattleResult | null;
      try {
        result = await controller.run();
      } catch (error) {
        console.error('[battle] Kampfablauf fehlgeschlagen', error);
        shell.toast('Der Kampf konnte nicht fortgesetzt werden – Rückzug.', 'bad', 5000);
        const player = session.state().units.find((unit) => unit.source.kind === 'player');
        result = { encounter: encounterId, outcome: 'fled', playerHp: player?.hp ?? campaign.state().player.hp };
      }
      if (aborted) return null;
      this.lastResult = result;
      return result;
    } finally {
      stopInsets();
      this.current = null;
      ui.close();
      if (game.scene.isActive(BATTLE_SCENE_KEY) || game.scene.isPaused(BATTLE_SCENE_KEY)) game.scene.stop(BATTLE_SCENE_KEY);
      if (hideExplore && explore) explore.sys.setVisible(true);
    }
  }

  /** Laufenden Kampf ohne Ergebnis beenden. */
  abort() {
    const current = this.current;
    if (!current) return;
    current.controller.abort();
    current.ui.close();
  }

  private startScene(data: Omit<BattleSceneData, 'onReady'>): Promise<BattleScene> {
    const { game } = this.deps;
    if (!game.scene.getScene(BATTLE_SCENE_KEY)) game.scene.add(BATTLE_SCENE_KEY, BattleScene, false);
    return new Promise((resolve) => {
      game.scene.run(BATTLE_SCENE_KEY, { ...data, onReady: (scene: BattleScene) => resolve(scene) } satisfies BattleSceneData);
      game.scene.bringToTop(BATTLE_SCENE_KEY);
    });
  }
}

/**
 * Rasterkampf am Director anmelden: ersetzt den Platzhalter, sobald `createSession` eine Sitzung liefert.
 * Das volle Ergebnis (Beute, XP, LP, verbrauchte Gegenstände) liegt danach in `runner.lastResult`
 * bzw. – falls der Director es unterstützt – direkt in `director.battleResultRunner`.
 */
export function installBattleRunner(director: Director, createSession: BattleSessionFactory): BattleRunner {
  const runner = new BattleRunner({
    game: director.game, shell: director.shell, content: director.content, campaign: director.campaign, catalog: director.catalog,
    assets: director.assets, audio: director.audio, settings: director.settings, createSession, touch: () => director.touch,
  });
  const resultRunner = async (encounter: EncounterId): Promise<BattleResult | BattleOutcome> => {
    const result = await runner.run(encounter);
    if (result === 'unavailable') return openBattlePlaceholder(director.shell, director.campaign, encounter);
    // Abbruch: der Director entscheidet über den erzwungenen Ausgang (Promise.race); Flucht ist nur der Rückfall.
    return result ?? 'fled';
  };
  director.battleResultRunner = resultRunner;
  director.battleRunner = async (encounter) => {
    const result = await resultRunner(encounter);
    return typeof result === 'string' ? result : result.outcome;
  };
  return runner;
}

/** Laufblätter für Funkruf-Verstärkungen (EnemyDef.rules `reinforce`), damit sie beim Auftauchen geladen sind. */
function reinforcementSprites(content: Pick<GameContent, 'enemies'>, units: readonly BattleUnit[]): string[] {
  const out = new Set<string>();
  for (const unit of units) {
    if (unit.source.kind !== 'enemy') continue;
    for (const rule of content.enemies[unit.source.enemy]?.rules ?? []) {
      if (rule.kind !== 'reinforce') continue;
      const def = content.enemies[rule.enemy];
      if (def) out.add(def.sprite ?? `${def.id}-walk`);
    }
  }
  return [...out];
}
