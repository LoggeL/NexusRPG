// Ablaufsteuerung (Bereich explore-presentation, Overlays dom-ui): serialisiert Interaktionen, Dialoge, Cutscenes,
// Reisen und Kämpfe, führt Requests aus Effekten aus und hält Phaser-Szenen und DOM-Oberfläche synchron.
//
// Erweiterungspunkte:
// - Requests: `runRequests` – jede RequestMap-Variante hat genau einen Zweig (neue Varianten hier ergänzen).
// - Kampf: `battle()` nutzt bis zur Kampfszene (Bereich combat-presentation) den DOM-Platzhalter.
// - Overlays: `open*`-Methoden; jedes Overlay liegt als eigene Datei unter dom/.
import Phaser from 'phaser';
import { musicForBattle, musicForMap } from './music';
import { missingText, runEnterTriggers } from '../modules/campaign';
import type {
  ActId, BattleOutcome, BattleResult, CheckRef, CutsceneDef, EffectOutcome, Effect, EncounterId, ExitDef, HotspotDef, MapEncounterDef, MapId, NpcId,
  MinigameRequest, Request, TimeSlot,
} from '../modules/contracts';
import { endingStats as computeEndingStats, epilogueLines } from '../modules/ending';
import type { EndingStats, GameContext } from './context';
import { openBattlePlaceholder } from './dom/battlePlaceholder';
import { playMinigame } from './minigames';
import { openCharacterCreation, openCharacterSheet } from './dom/character';
import { openCityMap } from './dom/cityMap';
import { CutsceneUi, panFor, SKIP_HOLD_MS } from './dom/cutsceneUi';
import { openDebugMenu } from './dom/debugMenu';
import { DialogueBox } from './dom/dialogueBox';
import { downloadText, pickTextFile } from './dom/dom';
import { installGallerySync, openGallery, seenGallery } from './dom/gallery';
import { openNpcActions } from './dom/gift';
import { Hud } from './dom/hud';
import { openInventory } from './dom/inventory';
import { openMenu, openSettings } from './dom/menu';
import { openPhone } from './dom/phone';
import { giveGiftAndLearn } from './dom/portExtras';
import { openQuestLog } from './dom/questLog';
import { openRelations } from './dom/relations';
import { openSaveSlots } from './dom/saveSlots';
import { Screens } from './dom/screens';
import { openJobBoard, openShop } from './dom/shop';
import { UiShell, type Tone } from './dom/shell';
import { hasOwn, isEndedSave } from './guards';
import { PLAYER_SPRITE } from '../modules/appearance';
import { SceneAssets } from './phaser/assets';
import { PlayerTextureBaker } from './phaser/playerTexture';
import type { ExploreScene, Interactable } from './phaser/scenes/ExploreScene';
import { isDebugOverlay } from './phaser/scenes/ExploreScene';
import { canvasToDataUrl, drawCutscene } from './placeholders';
import { createSaveSlots, summarizeSave } from '../platform/storage';
import { galleryCutscenes, slotLine } from './dom/viewModels';

export { hasOwn, isEndedSave } from './guards';

export type Mode = 'boot' | 'title' | 'explore' | 'cutscene' | 'battle' | 'ending';
export type StartEntry =
  | { kind: 'title' }
  | { kind: 'newchar' }
  | { kind: 'map'; map: MapId; entry?: string; time?: TimeSlot }
  | { kind: 'act'; act: ActId; time?: TimeSlot }
  | { kind: 'battle'; encounter: EncounterId }
  | { kind: 'cut'; id: string };

const EMPTY: EffectOutcome = { requests: [], messages: [] };
/** Startminute je Tageszeit für Debug und `?time=`. */
export const SLOT_START: Record<TimeSlot, number> = { morgen: 480, tag: 720, abend: 1080, nacht: 1320 };

function toneOf(message: string): Tone {
  if (/[−-]\s?\d+|verloren|Schaden|Niederlage|fehlen|gescheitert|♥ −/i.test(message)) return 'bad';
  if (/Erhalten|\+\d+|geheilt|Sieg|Stufe|♥ \+|gehört jetzt|freigeschaltet/i.test(message)) return 'good';
  return 'info';
}

export class Director {
  readonly campaign: GameContext['campaign'];
  readonly content: GameContext['content'];
  readonly audio: GameContext['audio'];
  readonly settings: GameContext['settings'];
  readonly input: GameContext['input'];
  readonly catalog: GameContext['catalog'];
  readonly assets: SceneAssets;
  readonly shell: UiShell;
  readonly hud: Hud;
  readonly dialogue: DialogueBox;
  readonly cutsceneUi: CutsceneUi;
  readonly screens: Screens;
  game!: Phaser.Game;
  touch = false;
  mode: Mode = 'boot';
  /** Letzter Kampfausgang (Test-Hook). */
  lastBattle: { encounter: EncounterId; outcome: BattleOutcome } | null = null;
  /** Ersetzt den Kampf-Platzhalter, sobald combat-presentation eine Kampfszene registriert. */
  battleRunner: ((encounter: EncounterId) => Promise<BattleOutcome>) | null = null;
  /**
   * combat-presentation: Rasterkampf mit vollem Ergebnis (LP, Beute, XP, verbrauchte Gegenstände).
   * Hat Vorrang vor `battleRunner`; gesetzt von `installBattleRunner` (presentation/phaser/battle/runner.ts).
   */
  battleResultRunner: ((encounter: EncounterId) => Promise<BattleResult | BattleOutcome>) | null = null;
  private chain: Promise<void> = Promise.resolve();
  private running = 0;
  private exploreWaiters: ((scene: ExploreScene | null) => void)[] = [];
  private bootWaiters: (() => void)[] = [];
  private bootReady = false;
  private cutState: { id: string; beat: number; total: number } | null = null;
  private cutSkip = false;
  private inEnding = false;
  private placeholderCuts = new Map<string, string>();
  private battleResolver: ((outcome: BattleOutcome) => void) | null = null;

  constructor(readonly ctx: GameContext, root: HTMLElement) {
    this.campaign = ctx.campaign;
    this.content = ctx.content;
    this.audio = ctx.audio;
    this.settings = ctx.settings;
    this.input = ctx.input;
    this.catalog = ctx.catalog;
    this.assets = new SceneAssets(ctx.catalog);
    this.assets.registerDynamic(PLAYER_SPRITE, new PlayerTextureBaker(ctx.campaign));
    this.shell = new UiShell(root, ctx.input);
    this.hud = new Hud(this.shell, ctx.catalog, ctx.campaign, {
      inventory: () => this.openInventory(),
      character: () => this.openCharacter(),
      quests: () => this.openQuests(),
      relations: () => this.openRelations(),
      map: () => this.openCityMap(),
      phone: () => this.openPhone(),
      menu: () => this.openMenu(),
    });
    this.dialogue = new DialogueBox(this.shell, ctx.catalog, ctx.campaign, ctx.settings, ctx.audio);
    this.cutsceneUi = new CutsceneUi(this.shell, ctx.catalog);
    this.screens = new Screens(this.shell);
    document.documentElement.dataset.mode = this.mode;
    const applySettings = () => {
      const settings = ctx.settings.get();
      this.audio.setVolumes({ music: settings.music, sfx: settings.sfx, voices: settings.voices });
      this.shell.setReducedMotion(settings.reducedMotion);
      this.shell.setTextScale(settings.textScale);
    };
    ctx.settings.subscribe(applySettings);
    applySettings();
    installGallerySync(ctx.campaign);
    const stopUnlock = ctx.input.onUserGesture(() => {
      this.unlockAudio();
      if (this.audioRunning()) stopUnlock();
    });
    this.shell.onModalChange(() => this.syncHudBlocked());
    ctx.input.observe((event) => {
      if (event.intent.type === 'debugCollision' && this.mode === 'explore' && this.shell.modalOpen('debug')) this.explore()?.toggleDebug();
    });
  }

  attach(game: Phaser.Game) { this.game = game; }

  unlockAudio() {
    try { this.audio.unlock(); } catch { /* Audio optional */ }
  }

  private audioRunning(): boolean {
    try {
      const debug = (this.audio as { debug?: () => { contextState?: string | null } }).debug;
      return debug?.call(this.audio)?.contextState === 'running';
    } catch { return false; }
  }

  // ------------------------------------------------------------------ Zustand

  get busy() { return this.running > 0; }

  setMode(mode: Mode) {
    this.mode = mode;
    document.documentElement.dataset.mode = mode;
    this.hud.setVisible(mode === 'explore');
    if (mode === 'explore') this.hud.update(this.campaign.state());
    this.syncHudBlocked();
  }

  private syncHudBlocked() {
    this.hud.setBlocked(this.busy || this.shell.modalOpen());
  }

  explore(): ExploreScene | null {
    if (!this.game) return null;
    const scene = this.game.scene.getScene('explore') as ExploreScene | null;
    if (!scene) return null;
    const status = scene.sys.settings.status;
    return status >= Phaser.Scenes.RUNNING && status <= Phaser.Scenes.SLEEPING && scene.ready ? scene : null;
  }

  cutsceneView() { return this.cutState ? { ...this.cutState, text: this.cutsceneUi.current?.text ?? null, speaker: this.cutsceneUi.current?.speaker ?? null } : null; }

  /** Serialisiert Abläufe (Interaktion, onEnter, Reisen); verschachtelte Aufrufe laufen direkt. */
  enqueue(task: () => Promise<void> | void): Promise<void> {
    const run = async () => {
      this.running++;
      this.syncHudBlocked();
      try { await task(); } catch (error) { console.error('[director]', error); this.shell.toast('Da ist etwas schiefgegangen – das Spiel läuft weiter.', 'bad'); } finally { this.running--; this.syncHudBlocked(); }
    };
    const next = this.chain.then(run, run);
    this.chain = next.catch(() => undefined);
    return next;
  }

  // ------------------------------------------------------------------ Szenen

  bootSceneReady() {
    this.bootReady = true;
    for (const resolve of this.bootWaiters.splice(0)) resolve();
  }

  whenBooted(): Promise<void> {
    return this.bootReady ? Promise.resolve() : new Promise((resolve) => this.bootWaiters.push(resolve));
  }

  exploreReady(scene: ExploreScene) {
    for (const resolve of this.exploreWaiters.splice(0)) resolve(scene);
    const mapId = scene.map.id;
    void this.enqueue(() => this.runOnEnter(mapId));
  }

  awaitExplore(): Promise<ExploreScene | null> {
    return new Promise((resolve) => this.exploreWaiters.push(resolve));
  }

  private stopScenes(...keys: string[]) {
    for (const key of keys) if (this.game.scene.isActive(key) || this.game.scene.isPaused(key) || this.game.scene.isSleeping(key)) this.game.scene.stop(key);
    if (keys.includes('explore')) for (const resolve of this.exploreWaiters.splice(0)) resolve(null);
  }

  persistNow() {
    const scene = this.explore();
    scene?.saveLocation();
    scene?.flushPlayTime();
    const campaign = this.campaign as { saveNow?: () => void };
    try { campaign.saveNow?.(); } catch { /* Speichern ist Beiwerk */ }
  }

  showTitle() {
    this.shell.closeAllModals();
    this.stopScenes('explore', 'cutscene', 'ending');
    this.game.scene.start('title');
    this.setMode('title');
    this.audio.setAmbience('title');
    this.audio.setMusic('titel');
    this.screens.title({
      hasSave: () => !!this.ctx.saves.existing(),
      saveEnded: () => isEndedSave(this.ctx.saves.existing()),
      newGame: () => void this.newGame(true),
      continueGame: () => void this.continueGame(),
      loadFile: () => this.loadFromFile(),
      settings: () => this.openSettings(),
      saveSummary: () => {
        const raw = this.ctx.saves.existing();
        return raw ? slotLine(summarizeSave(raw), (map) => this.content.maps[map]?.name ?? map) : null;
      },
      slots: () => this.openSlots('load'),
      exportFile: () => {
        const raw = this.ctx.saves.existing();
        if (raw) downloadText(`nexusrpg-spielstand-${new Date().toISOString().slice(0, 10)}.json`, raw);
      },
      gallery: () => this.openGallery(),
      galleryCount: () => {
        const seen = seenGallery(this.campaign);
        const all = galleryCutscenes(this.content);
        return { seen: all.filter((cut) => seen.has(cut.id)).length, total: all.length };
      },
    });
  }

  async startExplore(force = false): Promise<void> {
    const current = this.explore();
    const state = this.campaign.state();
    if (current && !force && current.map.id === state.map) {
      if (this.game.scene.isPaused('explore')) this.game.scene.resume('explore');
      this.setMode('explore');
      return;
    }
    this.screens.close();
    this.stopScenes('title', 'ending', 'cutscene');
    const ready = this.awaitExplore();
    const scene = this.game.scene.getScene('explore');
    if (scene && (this.game.scene.isActive('explore') || this.game.scene.isPaused('explore'))) scene.scene.restart();
    else this.game.scene.start('explore');
    await ready;
  }

  async start(entry: StartEntry) {
    await this.whenBooted();
    if (entry.kind === 'title') { this.showTitle(); return; }
    // Erstellung wartet auf Eingabe – Start gilt trotzdem als fertig (Test-Hook meldet ready).
    if (entry.kind === 'newchar') { void this.newGame(false); return; }
    this.campaign.newGame();
    this.ctx.saves.begin();
    // Test-Einstiege spielen mit erstellter Standardfigur (Akt-1-Zustand), damit Checks und HUD Werte haben.
    this.campaign.warpAct(entry.kind === 'act' ? entry.act : 1);
    if (entry.kind === 'map') this.placeAt(entry.map, entry.entry);
    if (entry.kind === 'cut' || entry.kind === 'battle') this.placeAt(this.content.start.map, this.content.start.entry);
    if ((entry.kind === 'map' || entry.kind === 'act') && entry.time) this.setTime(entry.time);
    await this.enqueue(async () => {
      if (entry.kind === 'cut') await this.playCutscene(entry.id);
      await this.startExplore(true);
    });
    // Kampf läuft bis zur Eingabe – wie bei der Erstellung gilt der Start schon als fertig (Test-Hook meldet ready).
    if (entry.kind === 'battle') void this.enqueue(() => this.battle(entry.encounter));
  }

  private placeAt(map: MapId, entryId?: string, minutes?: number) {
    if (!hasOwn(this.content.maps, map)) return;
    const def = this.content.maps[map];
    const entry = (entryId && hasOwn(def.entries, entryId) && def.entries[entryId]) || def.entries[this.content.start.entry] || Object.values(def.entries)[0];
    this.campaign.setLocation(map, entry?.at ?? [def.size[0] / 2, def.size[1] / 2], entry?.facing ?? 's', minutes === undefined ? undefined : { minutes });
  }

  async newGame(confirm: boolean) {
    const existing = this.ctx.saves.existing();
    if (confirm && existing) {
      const ok = isEndedSave(existing)
        ? await this.shell.confirm('Neues Spiel', 'Die letzte Partie ist abgeschlossen. Eine neue beginnen?', 'Neu beginnen', 'Abbrechen')
        : await this.shell.confirm('Neues Spiel', 'Es gibt bereits einen Spielstand. Neu beginnen und ihn überschreiben?', 'Neu beginnen', 'Abbrechen');
      if (!ok) return;
    }
    this.shell.closeAllModals();
    await this.enqueue(async () => {
      this.screens.close();
      this.campaign.newGame();
      this.stopScenes('title', 'explore', 'ending');
      await openCharacterCreation(this.shell, this.catalog, this.campaign);
      this.ctx.saves.begin();
      this.placeAt(this.content.start.map, this.content.start.entry);
      if (this.content.start.cutscene) await this.playCutscene(this.content.start.cutscene);
      if (this.mode !== 'ending') await this.startExplore();
    });
  }

  async continueGame() {
    await this.enqueue(async () => {
      const raw = this.ctx.saves.existing();
      if (raw && !this.campaign.importSave(raw)) {
        await this.shell.alert('Spielstand beschädigt', 'Der gespeicherte Spielstand konnte nicht geladen werden. Starte ein neues Spiel oder lade eine Spielstand-Datei.');
        return;
      }
      this.ctx.saves.begin();
      await this.resumeLoaded();
    });
  }

  private async resumeLoaded() {
    if (this.campaign.state().ended) { await this.ending(); return; }
    if (!this.campaign.state().player.created) await openCharacterCreation(this.shell, this.catalog, this.campaign);
    await this.startExplore(true);
  }

  async loadFromFile(): Promise<{ ok: boolean; message: string }> {
    const raw = await pickTextFile();
    if (raw === null) return { ok: false, message: 'Kein Spielstand ausgewählt.' };
    return this.importSave(raw);
  }

  async importSave(raw: string): Promise<{ ok: boolean; message: string }> {
    let ok = false;
    await this.enqueue(async () => {
      try { ok = this.campaign.importSave(raw); } catch { ok = false; }
      if (!ok) return;
      this.ctx.saves.begin();
      this.shell.closeAllModals();
      this.shell.toast('Spielstand geladen.', 'good');
      for (const note of this.campaign.lastImportNotes?.() ?? []) this.shell.toast(note, 'info', 6000);
      await this.resumeLoaded();
    });
    if (!ok) return { ok: false, message: 'Ungültiger Spielstand – die laufende Partie bleibt unverändert.' };
    return { ok: true, message: 'Spielstand geladen.' };
  }

  exportSave() {
    const date = new Date().toISOString().slice(0, 10);
    downloadText(`nexusrpg-spielstand-${date}.json`, this.campaign.exportSave());
  }

  // ------------------------------------------------------------------ Requests

  async handleOutcome(outcome: EffectOutcome | null | undefined) {
    if (!outcome) return;
    for (const message of outcome.messages) this.shell.toast(message, toneOf(message));
    await this.runRequests(outcome.requests);
  }

  async runRequests(requests: readonly Request[]) {
    for (const request of requests) {
      if ('sfx' in request) this.audio.sfx(request.sfx);
      else if ('dialogue' in request) await this.runDialogue(request.dialogue);
      else if ('cutscene' in request) await this.playCutscene(request.cutscene);
      else if ('travel' in request) await this.travel(request.travel, request.entry, request.minutes);
      else if ('battle' in request) await this.battle(request.battle);
      else if ('minigame' in request) await this.minigame(request.minigame);
      else if ('shop' in request) await this.openShopFlow(request.shop);
      else if ('jobBoard' in request) await openJobBoard(this.shell, this.campaign, request.jobBoard).closed;
      else if ('news' in request) await this.watchNews(request.news);
      else if ('phone' in request) this.audio.sfx('phone');
      else if ('sleep' in request) await this.sleepTransition(request.sleep);
      else if ('ending' in request) { await this.ending(); return; }
    }
  }

  /** Minispiel zeigen (presentation/minigames) und abrechnen; unbekannte IDs bleiben Platzhalter (gewonnen). */
  async minigame(request: MinigameRequest) {
    const result = await playMinigame({
      shell: this.shell, campaign: this.campaign, audio: this.audio, touch: this.touch, reducedMotion: this.settings.get().reducedMotion,
    }, request);
    // Zusatzeffekte (Trinkgeld, verbrauchter Dietrich-Chip) einzeln, damit ein abgelehnter Effekt den Rest nicht kippt.
    for (const effect of result.extra) {
      try { await this.handleOutcome(this.campaign.apply([effect])); } catch { /* optional */ }
    }
    await this.handleOutcome(this.campaign.finishMinigame(request, result.won));
  }

  async runDialogue(id: string) {
    if (!hasOwn(this.content.dialogues, id)) { console.warn(`[director] Dialog fehlt: ${id}`); return; }
    const session = this.ctx.createDialogue(id);
    await this.dialogue.runSession(session, {
      onCheck: (evaluation) => { if (evaluation.ok && !evaluation.passedBefore) this.shell.toast(`Check bestanden: ${evaluation.attributeLabel} ${evaluation.value}/${evaluation.threshold}`, 'good'); },
      onMessages: (messages) => { for (const message of messages) this.shell.toast(message, toneOf(message)); },
    });
    let outcome: EffectOutcome = EMPTY;
    try { outcome = session.outcome(); } catch { /* leer */ }
    await this.runRequests(outcome.requests);
  }

  /** Welt-Check (Hotspot, Ausgang, Gegnergruppe): bestanden → true; sonst Hinweis auf fehlende Punkte und anderen Weg. */
  async worldCheck(check: CheckRef, altText?: string): Promise<boolean> {
    const evaluation = this.campaign.evaluateCheck(check);
    if (!evaluation.ok) {
      this.audio.sfx('fail');
      this.shell.toast(`${missingText(evaluation)}${altText ? ` ${altText}` : ''}`, 'info', 4500);
      return false;
    }
    const passed = this.campaign.passCheck(check);
    if (!evaluation.passedBefore) this.shell.toast(`Check bestanden: ${evaluation.attributeLabel} ${evaluation.value}/${evaluation.threshold}`, 'good');
    await this.handleOutcome(passed.outcome);
    return true;
  }

  /** Kartenwechsel; `minutes` ersetzt die Standard-Reisezeit (10 min). */
  async travel(map: MapId, entry?: string, minutes?: number) {
    if (!hasOwn(this.content.maps, map)) { console.warn(`[director] Karte fehlt: ${map}`); return; }
    const scene = this.explore();
    if (scene && this.mode !== 'ending') {
      if (this.game.scene.isPaused('explore')) this.game.scene.resume('explore');
      this.setMode('explore');
      await scene.leave(map, entry, minutes);
      return;
    }
    this.placeAt(map, entry, minutes);
    await this.startExplore(true);
  }

  // ------------------------------------------------------------------ Kampf (Platzhalter bis combat-presentation)

  /** Test-Hook/Debug: laufenden Kampf mit festem Ausgang beenden. */
  resolveBattle(outcome: BattleOutcome): boolean {
    if (!this.battleResolver) return false;
    this.battleResolver(outcome);
    return true;
  }

  get inBattle() { return this.battleResolver !== null; }

  async battle(encounter: EncounterId) {
    if (!hasOwn(this.content.encounters, encounter)) { console.warn(`[director] Begegnung fehlt: ${encounter}`); return; }
    const scene = this.explore();
    const paused = !!scene && this.game.scene.isActive('explore');
    if (paused) this.game.scene.pause('explore');
    const previous = this.mode;
    this.setMode('battle');
    this.audio.setAmbience('battle');
    this.audio.setMusic(musicForBattle(this.content, encounter));
    let outcome: BattleOutcome = 'fled';
    let full: BattleResult | null = null;
    const forced = new Promise<BattleOutcome>((resolve) => { this.battleResolver = resolve; });
    try {
      const running: Promise<BattleResult | BattleOutcome> = this.battleResultRunner
        ? this.battleResultRunner(encounter)
        : this.battleRunner ? this.battleRunner(encounter) : openBattlePlaceholder(this.shell, this.campaign, encounter);
      const settled = await Promise.race([running, forced]);
      if (typeof settled === 'string') outcome = settled;
      else { full = settled; outcome = settled.outcome; }
    } finally {
      this.battleResolver = null;
      this.shell.closeModal('battle');
      if (paused && this.explore()) this.game.scene.resume('explore');
      this.setMode(previous === 'battle' ? 'explore' : previous);
      const map = this.content.maps[this.campaign.state().map];
      if (map) {
        this.audio.setAmbience(map.ambience);
        const m = musicForMap(this.content, map, this.campaign.state().clock.minutes);
        this.audio.setMusic(m.id, { muffled: m.muffled });
      }
      if (outcome === 'win') this.audio.stinger('sieg-stinger');
    }
    this.lastBattle = { encounter, outcome };
    const state = this.campaign.state();
    const hp = outcome === 'win' ? state.player.hp : outcome === 'fled' ? state.player.hp : 0;
    await this.handleOutcome(this.campaign.finishBattle(full && full.encounter === encounter ? full : { encounter, outcome, playerHp: hp }));
  }

  // ------------------------------------------------------------------ Interaktion

  interact(target: Interactable) {
    void this.enqueue(async () => {
      if (target.kind === 'npc') { await this.talkFlow(target.npc, target.dialogue); return; }
      if (target.kind === 'exit') { await this.exitFlow(target.exit); return; }
      if (target.kind === 'encounter') { await this.encounterFlow(target.group); return; }
      if (target.kind === 'bed') { await this.handleOutcome(this.campaign.sleep()); return; }
      await this.hotspotFlow(target.hotspot);
    });
  }

  private async talkFlow(npc: NpcId, override?: string) {
    const choice = await openNpcActions(this.shell, this.catalog, this.campaign, npc);
    if (!choice) return;
    if (choice !== 'talk') {
      const result = giveGiftAndLearn(this.campaign, npc, choice.gift);
      await this.handleOutcome(result.outcome);
      return;
    }
    const talk = this.campaign.talkTo(npc);
    await this.handleOutcome(talk.outcome);
    const dialogue = override ?? talk.dialogue;
    if (dialogue) await this.runDialogue(dialogue);
    else this.shell.toast(`${this.campaign.displayName(npc)} hat gerade nichts zu sagen.`, 'info');
  }

  private async hotspotFlow(hotspot: HotspotDef) {
    if (hotspot.lines?.length) await this.dialogue.showLines(hotspot.lines);
    if (hotspot.check && !(await this.worldCheck(hotspot.check, hotspot.altText))) return;
    if (hotspot.once) this.campaign.markSeen(hotspot.id);
    const outcome = hotspot.effects?.length ? this.campaign.apply(hotspot.effects) : EMPTY;
    if (hotspot.kind === 'loot' && outcome.messages.length) this.audio.sfx('pickup');
    if (hotspot.dialogue) await this.runDialogue(hotspot.dialogue);
    await this.handleOutcome(outcome);
    switch (hotspot.kind) {
      case 'shop': if (hotspot.shop) await this.openShopFlow(hotspot.shop); break;
      case 'board': if (hotspot.board) await openJobBoard(this.shell, this.campaign, hotspot.board).closed; break;
      case 'screen': await this.watchNews(); break;
      case 'sleep': await this.handleOutcome(this.campaign.sleep()); break;
      case 'phone': await this.openPhone(true); break;
      default:
        if (!hotspot.lines?.length && !hotspot.dialogue && !hotspot.effects?.length && !hotspot.check) this.shell.toast(hotspot.label, 'info', 1600);
    }
  }

  /** Gegnergruppe: optional per Check vermeiden, sonst Kampf. */
  private async encounterFlow(group: MapEncounterDef) {
    if (group.avoid) {
      const evaluation = this.campaign.evaluateCheck(group.avoid);
      if (evaluation.ok) {
        const label = `[${evaluation.attributeLabel} ${evaluation.threshold}]`;
        if (await this.shell.confirm('Gegner', `${label} Den Kampf vermeiden?`, 'Vermeiden', 'Kämpfen')) {
          await this.worldCheck(group.avoid);
          this.campaign.markSeen(`avoid:${this.campaign.state().map}:${group.id}`);
          return;
        }
      }
    }
    await this.battle(group.encounter);
  }

  useExit(exit: ExitDef) { void this.enqueue(() => this.exitFlow(exit)); }

  private async exitFlow(exit: ExitDef) {
    if (!this.campaign.evaluate(exit.when)) {
      this.shell.toast(exit.lockedText ?? 'Gesperrt – hier geht es noch nicht weiter.', 'info');
      return;
    }
    if (exit.check && !(await this.worldCheck(exit.check, exit.lockedText))) return;
    if (exit.interact) this.audio.sfx('door');
    await this.travel(exit.to, exit.entry, exit.minutes);
  }

  private async runOnEnter(mapId: MapId) {
    const scene = this.explore();
    if (!scene || scene.map.id !== mapId || this.mode !== 'explore') return;
    await runEnterTriggers(this.campaign, scene.map, {
      playCutscene: (id) => this.playCutscene(id),
      runDialogue: (id) => this.runDialogue(id),
      handleOutcome: (outcome) => this.handleOutcome(outcome),
      stillHere: () => this.mode !== 'title' && this.mode !== 'ending' && this.campaign.state().map === mapId,
    });
  }

  flushPlayTime(ms: number) {
    if (ms > 0) this.campaign.addPlayTime(Math.round(ms));
  }

  /** Spieluhr beim Erkunden (ExploreScene ruft je 0,7 s Echtzeit mit 1 Minute). */
  tickClock(minutes: number) {
    const outcome = this.campaign.advanceClock(minutes);
    if (outcome.requests.length || outcome.messages.length) void this.enqueue(() => this.handleOutcome(outcome));
  }

  /** Debug/`?time=`: Uhr auf den Beginn einer Tageszeit stellen (notfalls über den nächsten Morgen). */
  setTime(slot: TimeSlot) {
    const target = SLOT_START[slot];
    const now = this.campaign.state().clock.minutes;
    if (target > now) { this.campaign.advanceClock(target - now); return; }
    this.campaign.sleep();
    this.campaign.advanceClock(target - this.campaign.state().clock.minutes);
  }

  private async sleepTransition(kind: 'bed' | 'collapse') {
    const scene = this.explore();
    const reduced = this.settings.get().reducedMotion;
    if (scene && !reduced) {
      scene.cameras.main.fadeOut(350, 0, 0, 0);
      await new Promise((resolve) => window.setTimeout(resolve, 380));
      scene.cameras.main.fadeIn(450, 0, 0, 0);
    }
    const state = this.campaign.state();
    // Nach einem Zusammenbruch: Unterschlupf oder Notschlafplatz (MapDef.shelter) der aktuellen Karte.
    const where = state.map === this.content.home.map ? 'im Unterschlupf' : `hier (${this.content.maps[state.map]?.name ?? state.map})`;
    // „Tag n beginnt.“ meldet die Kampagne selbst (sleepIn); hier nur der Ort nach einem Zusammenbruch.
    if (kind === 'collapse') this.shell.toast(`Du wachst ${where} auf.`, 'info');
    scene?.refreshWorld();
  }

  private async openShopFlow(shop: string) {
    if (!hasOwn(this.content.shops, shop)) return;
    await openShop(this.shell, this.catalog, this.campaign, shop).closed;
  }

  /** Nachrichtensendung als Dialogzeilen (Bildschirm-Hotspot, Telefon, Effekt `news`). */
  async watchNews(id?: string) {
    const news = id && hasOwn(this.content.news, id) ? this.content.news[id] : this.campaign.currentNews();
    if (!news) { this.shell.toast('Gerade läuft nur Werbung.', 'info'); return; }
    this.campaign.markSeen(`news:${news.id}`);
    await this.dialogue.showLines([{ speaker: 'narrator', text: news.headline }, ...news.lines]);
  }

  // ------------------------------------------------------------------ Cutscenes

  cutsceneImageUrl(def: CutsceneDef, image: string | undefined): string | null {
    if (!image || image === 'black') return null;
    const url = this.catalog.imageUrl(this.catalog.imageKey(image, 'cut'));
    return url ?? this.placeholderCut(def, image);
  }

  private placeholderCut(def: CutsceneDef, image: string): string {
    const key = `${def.id}|${image}`;
    let url = this.placeholderCuts.get(key);
    if (!url) {
      url = canvasToDataUrl(drawCutscene(def.title ?? image.replace(/^cut-/, ''), image));
      this.placeholderCuts.set(key, url);
    }
    return url;
  }

  skipCutscene(): boolean {
    if (!this.cutState) return false;
    this.cutSkip = true;
    this.cutsceneUi.advance(true);
    return true;
  }

  async playCutscene(id: string) {
    const def = hasOwn(this.content.cutscenes, id) ? this.content.cutscenes[id] : null;
    if (!def) { console.warn(`[director] Cutscene fehlt: ${id}`); return; }
    if (this.cutState) return;
    const exploreWasActive = !!this.explore() && this.game.scene.isActive('explore');
    if (exploreWasActive) this.game.scene.pause('explore');
    const previousMode = this.mode;
    this.setMode('cutscene');
    this.hud.setHover(null);
    const skippable = def.skippable !== false;
    this.cutSkip = false;
    this.cutState = { id, beat: 0, total: def.beats.length };
    this.game.scene.run('cutscene', {
      onUpdate: () => {
        if (!skippable || !this.cutState) return;
        const held = this.input.heldFor('cancel');
        this.cutsceneUi.setHold(held / SKIP_HOLD_MS);
        if (held >= SKIP_HOLD_MS) { this.input.releaseHeld('cancel'); this.skipCutscene(); }
      },
    });
    this.game.scene.bringToTop('cutscene');
    this.cutsceneUi.open(def.title, skippable, () => this.skipCutscene());
    const reduced = this.settings.get().reducedMotion;
    try {
      for (let index = 0; index < def.beats.length && !this.cutSkip; index++) {
        const beat = def.beats[index];
        this.cutState.beat = index;
        const nextImage = def.beats.slice(index + 1).find((entry) => entry.image)?.image;
        const nextUrl = this.cutsceneImageUrl(def, nextImage);
        if (nextUrl && !nextUrl.startsWith('data:')) { const preload = new Image(); preload.src = nextUrl; }
        const texts = (beat.caption ? 1 : 0) + (beat.lines?.length ?? 0);
        const duration = Math.max(beat.hold ?? 0, 5000 + texts * 2600);
        if (beat.image !== undefined) {
          const image = beat.image;
          const fade = beat.fade ?? (index > 0 ? 'cross' : 'in');
          this.cutsceneUi.showImage(this.cutsceneImageUrl(def, image), {
            pan: reduced ? undefined : panFor(beat.pan), fade, durationMs: duration, reduced, fallback: () => this.placeholderCut(def, image),
          });
        }
        if (beat.sfx) this.audio.sfx(beat.sfx);
        const hold = reduced ? 0 : beat.hold ?? 0;
        const started = performance.now();
        const remaining = () => Math.max(0, hold - (performance.now() - started));
        if (!texts) {
          this.cutsceneUi.clearText();
          await this.cutsceneUi.waitAdvance(Math.max(remaining(), reduced ? 0 : 500));
        }
        if (beat.caption && !this.cutSkip) {
          this.cutsceneUi.caption(beat.caption);
          await this.cutsceneUi.waitAdvance(Math.max(remaining(), reduced ? 0 : 300));
        }
        for (const line of beat.lines ?? []) {
          if (this.cutSkip) break;
          const shown = { ...line, text: line.text.replace(/\{name\}/g, this.campaign.state().player.name) };
          this.cutsceneUi.line(this.dialogue.toDisplay(shown));
          this.audio.sfx('talk');
          await this.cutsceneUi.waitAdvance(Math.max(remaining(), reduced ? 0 : 250));
        }
        if (beat.fade === 'out' && !this.cutSkip) await this.cutsceneUi.fadeOut(reduced);
      }
    } finally {
      this.cutsceneUi.close();
      this.stopScenes('cutscene');
      this.cutState = null;
      this.cutSkip = false;
    }
    this.campaign.markSeen(id);
    const outcome = def.effects?.length ? this.campaign.apply(def.effects) : EMPTY;
    if (exploreWasActive && this.explore()) {
      this.game.scene.resume('explore');
      this.setMode('explore');
    } else if (previousMode !== 'cutscene') this.setMode(previousMode);
    await this.handleOutcome(outcome);
  }

  // ------------------------------------------------------------------ Abspann

  async ending() {
    if (this.inEnding) return;
    this.inEnding = true;
    try {
      for (const id of this.content.ending.cutscenes) if (!this.campaign.hasSeen(id)) await this.playCutscene(id);
      this.shell.closeAllModals();
      this.stopScenes('title', 'explore', 'cutscene');
      this.game.scene.start('ending');
      this.setMode('ending');
      this.audio.setAmbience('ending');
      this.audio.setMusic('meer');
      let stats: EndingStats | null = null;
      try { stats = this.ctx.endingStats?.() ?? null; } catch { stats = null; }
      this.screens.ending(stats ?? this.computeStats(), () => this.showTitle());
    } finally {
      this.inEnding = false;
    }
  }

  computeStats(): EndingStats {
    return {
      ...computeEndingStats(this.content, this.campaign.state()),
      epilogue: epilogueLines(this.content, (condition) => this.campaign.evaluate(condition)),
    };
  }

  // ------------------------------------------------------------------ Overlays (Bereich dom-ui)

  private canOpenOverlay() { return this.mode === 'explore' && !this.busy && !this.shell.modalOpen() && !this.dialogue.active && !this.cutState; }

  private outcomeHandler = (outcome: EffectOutcome) => { void this.enqueue(() => this.handleOutcome(outcome)); };

  openInventory() {
    if (!this.canOpenOverlay()) return;
    openInventory(this.shell, this.catalog, this.campaign, this.outcomeHandler);
  }

  openCharacter() {
    if (!this.canOpenOverlay()) return;
    openCharacterSheet(this.shell, this.catalog, this.campaign);
  }

  openQuests() {
    if (!this.canOpenOverlay()) return;
    openQuestLog(this.shell, this.campaign);
  }

  openRelations() {
    if (!this.canOpenOverlay()) return;
    openRelations(this.shell, this.catalog, this.campaign);
  }

  async openPhone(fromHotspot = false) {
    if (!fromHotspot && !this.canOpenOverlay()) return;
    await openPhone(this.shell, this.campaign, this.outcomeHandler, () => { void this.enqueue(() => this.watchNews()); }, this.catalog).closed;
  }

  openCityMap() {
    if (!this.canOpenOverlay()) return;
    openCityMap(this.shell, this.catalog, this.campaign, (station) => {
      void this.enqueue(async () => {
        const result = this.campaign.fastTravel(station);
        if (!result.ok) { this.shell.toast(result.message, 'bad'); return; }
        await this.handleOutcome(result.outcome);
      });
    });
  }

  openMenu() {
    if (!this.canOpenOverlay()) return;
    openMenu(this.shell, {
      exportSave: () => this.exportSave(),
      importSave: async () => {
        const raw = await pickTextFile();
        if (raw === null) return { ok: false, message: 'Kein Spielstand ausgewählt.' };
        return this.importSave(raw);
      },
      settings: () => this.openSettings(),
      toTitle: () => { this.persistNow(); this.showTitle(); },
      newGame: () => void this.newGame(false),
      saveSlots: () => this.openSlots('save'),
      loadSlots: () => this.openSlots('load'),
      gallery: () => this.openGallery(),
    });
  }

  /** Drei Speicherplätze (Kopien des Autosaves); Laden läuft über importSave. */
  openSlots(mode: 'save' | 'load') {
    if (this.shell.modalOpen(`slots-${mode}`)) return;
    const running = this.mode === 'explore';
    openSaveSlots(this.shell, mode, {
      slots: createSaveSlots(),
      snapshot: () => { if (!running) return null; this.persistNow(); return this.campaign.exportSave(); },
      load: async (raw) => (await this.importSave(raw)).ok,
      mapName: (map) => this.content.maps[map]?.name ?? map,
      confirmLoad: running,
    });
  }

  openGallery() {
    if (this.shell.modalOpen('gallery')) return;
    openGallery(this.shell, this.catalog, this.campaign, { reducedMotion: this.settings.get().reducedMotion });
  }

  openSettings() {
    if (this.shell.modalOpen('settings')) return;
    openSettings(this.shell, this.settings);
  }

  openDebugMenu() {
    if (this.shell.modalOpen('debug')) return;
    const paused = this.mode === 'explore' && this.game.scene.isActive('explore');
    if (paused) this.game.scene.pause('explore');
    const heal: Effect[] = [{ heal: 'full' }];
    const modal = openDebugMenu(this.shell, this.campaign, {
      warpAct: (act) => void this.warpAct(act),
      travel: (map, entry) => { void this.enqueue(() => this.travel(map, entry)); },
      heal: () => { void this.handleOutcome(this.campaign.apply(heal)); },
      toggleCollision: () => this.explore()?.toggleDebug() ?? false,
      collision: () => isDebugOverlay(),
      cutscene: (id) => { void this.enqueue(() => this.playCutscene(id)); },
      setTime: (slot) => this.setTime(slot),
      battle: (encounter) => { void this.enqueue(() => this.battle(encounter)); },
    });
    void modal.closed.then(() => { if (paused && this.game.scene.isPaused('explore')) this.game.scene.resume('explore'); });
  }

  async warpAct(act: ActId) {
    this.shell.closeAllModals();
    this.ctx.saves.begin();
    this.campaign.warpAct(act);
    await this.enqueue(() => this.startExplore(true));
  }
}
