// window.__nexus – Test-Hook (gemeinsam; neue Befehle hier ergänzen und in docs/engine-notes.md nennen).
// Lesend plus Debug-Befehle. Nur Entwicklungs- und Testwerkzeug, kein Spielweg.
import type { ActId, AttributeId, BattleOutcome, CampaignPort, EncounterId, Effect, GameState, ItemId, MapId, NpcId, TimeSlot } from '../modules/contracts';
import type { Director, Mode } from '../presentation/director';
import type { ActionKey } from '../presentation/phaser/battle/actions';
import type { BattleRunner } from '../presentation/phaser/battle/runner';
import { hasOwn } from '../presentation/guards';
import type { RandomControl } from './composition';

export interface NexusView {
  scene: Mode;
  map: MapId | null;
  busy: boolean;
  dialogue?: { speaker: string; text: string; typing: boolean; choices: { index: number; text: string; check?: string; enabled: boolean }[] | null; dialogueId?: string; nodeId?: string };
  cutscene?: { id: string; beat: number; total: number; text: string | null; speaker: string | null };
  overlay?: string;
  battle?: boolean;
  hint?: string | null;
  player?: { x: number; y: number; facing: string };
  camera?: { x: number; y: number; w: number; h: number };
  clock?: { day: number; minutes: number; slot: TimeSlot };
}

/** Laufender Rasterkampf für Tests. */
export interface NexusBattleView {
  encounter: string;
  round: number;
  /** Aktive Einheit oder null zwischen den Zügen. */
  active: string | null;
  playerTurn: boolean;
  finished: boolean;
  outcome: BattleOutcome | null;
  units: { id: string; team: string; hp: number; maxHp: number; cell: [number, number]; state: string }[];
}

export interface NexusHook {
  ready: boolean;
  state(): Readonly<GameState> | null;
  campaign: CampaignPort | null;
  warp(act: number): Promise<void>;
  travel(map: MapId, entry?: string): Promise<void>;
  interact(id: string): boolean;
  talk(npc: NpcId): boolean;
  choose(index: number): boolean;
  advance(): boolean;
  skipCutscene(): boolean;
  currentView(): NexusView;
  hotspots(): { id: string; kind: string; label: string; x: number; y: number; inRange: boolean }[];
  /** Figuren, die gerade auf der Karte stehen (Tagesablauf/Platzierung). */
  npcs(): { id: NpcId; x: number; y: number; source: string }[];
  teleport(x: number, y: number): boolean;
  startDialogue(id: string): boolean;
  /** Effekte anwenden und Requests ausführen (z. B. [{ ending: true }]). */
  runEffects(effects: Effect[]): boolean;
  playCutscene(id: string): boolean;
  /** Gegenstand ins Inventar (Menge Standard 1). */
  giveItem(item: ItemId, qty?: number): boolean;
  /** Attribut auf einen Basiswert setzen (1..10). */
  setAttr(attribute: AttributeId, value: number): boolean;
  /** Beziehungspunkte ändern (100 = 1 Herz). */
  addHearts(npc: NpcId, hearts: number): boolean;
  /** Uhr auf den Beginn einer Tageszeit stellen. */
  setTime(slot: TimeSlot): boolean;
  startBattle(encounter: EncounterId): boolean;
  /** Laufenden Kampf gewinnen (bzw. mit anderem Ausgang beenden). */
  winBattle(outcome?: BattleOutcome): boolean;
  /** Zustand des laufenden Rasterkampfs (null ohne Kampf bzw. im Platzhalter). */
  battle(): NexusBattleView | null;
  /** Aktion der Aktionsleiste wählen (wie Ziffern 1–9), z. B. 'end' oder 'attack'. */
  battleAction(key: ActionKey): boolean;
  /** Feld im Kampfraster antippen (Spalte, Zeile); Tastatur-Quelle, führt also direkt aus. */
  battleTap(col: number, row: number): boolean;
  idle(): Promise<void>;
  seed(seed: number | null): void;
  walkable(x: number, y: number): boolean | null;
  reachable(x: number, y: number): { end: [number, number]; miss: number; steps: number } | null;
  walkTo(x: number, y: number): boolean;
  background(): string | null;
  followers(): { id: string; x: number; y: number }[];
  placeholders(): string[];
  // Erkundung (explore-presentation)
  /** Passanten mit Position und aktueller Sprechblase. */
  passersby(): { id: string; sprite: string; x: number; y: number; bubble: string | null }[];
  /** Passant sprechen lassen (ohne ID: der nächste); liefert den Spruch. */
  passerbyBark(id?: string): string | null;
  /** Sichtbare Weltbeschriftungen: Namensschilder ('name'/'enemy'), Aktionslabel, Sprechblasen, Ziel. */
  worldLabels(): { id: string; kind: string; text: string }[];
  /** Zielmarker des aktiven Ziels auf dieser Karte ('here') bzw. am Ausgang dorthin ('exit'). */
  objectiveMarker(): { x: number; y: number; kind: string; label: string } | null;
  /** Tageszeit-Färbung (Farbe, Deckkraft), Zahl sichtbarer Lichtpunkte, Dunkelmaske. */
  lighting(): { tint: number; alpha: number; lights: number; darkness: boolean } | null;
  errors: string[];
}

declare global {
  interface Window { __nexus?: NexusHook }
}

export function installTestHook(director: Director | null, errors: string[], random?: RandomControl, battles?: BattleRunner): NexusHook {
  const apply = (effects: Effect[]) => {
    if (!director) return false;
    const outcome = director.campaign.apply(effects);
    void director.enqueue(() => director.handleOutcome(outcome));
    return true;
  };
  const hook: NexusHook = {
    ready: false,
    errors,
    campaign: director?.campaign ?? null,
    state: () => director?.campaign.state() ?? null,
    warp: async (act) => { await director?.warpAct(Math.min(3, Math.max(1, Math.round(act))) as ActId); },
    travel: async (map, entry) => { if (director) await director.enqueue(() => director.travel(map, entry)); },
    interact: (id) => director?.explore()?.interactById(id) ?? false,
    talk: (npc) => director?.explore()?.interactById(npc) ?? false,
    choose: (index) => director?.dialogue.choose(index) ?? false,
    advance: () => {
      if (!director) return false;
      if (director.cutsceneView()) return director.cutsceneUi.advance(true);
      return director.dialogue.advance();
    },
    skipCutscene: () => director?.skipCutscene() ?? false,
    currentView: () => {
      if (!director) return { scene: 'boot', map: null, busy: false };
      const explore = director.explore();
      const state = director.campaign.state();
      const view: NexusView = { scene: director.mode, map: director.mode === 'title' || director.mode === 'boot' ? null : state.map, busy: director.busy };
      const dialogue = director.dialogue.view();
      if (dialogue) view.dialogue = dialogue;
      const cutscene = director.cutsceneView();
      if (cutscene) view.cutscene = cutscene;
      const modal = director.shell.topModal();
      if (modal) view.overlay = modal.name;
      if (director.inBattle) view.battle = true;
      view.clock = { day: state.clock.day, minutes: state.clock.minutes, slot: director.campaign.timeSlot() };
      if (explore && director.mode === 'explore') {
        view.hint = director.hud.hintText();
        view.player = { x: Math.round(explore.player.x), y: Math.round(explore.player.y), facing: explore.player.facing };
        view.camera = explore.cameraView();
      }
      return view;
    },
    hotspots: () => director?.explore()?.visibleInteractables() ?? [],
    npcs: () => director?.explore()?.npcPositions() ?? [],
    teleport: (x, y) => {
      const explore = director?.explore();
      if (!explore) return false;
      explore.player.setPosition(x, y);
      explore.saveLocation();
      return true;
    },
    startDialogue: (id) => {
      if (!director || !hasOwn(director.content.dialogues, id)) return false;
      void director.enqueue(() => director.runDialogue(id));
      return true;
    },
    runEffects: (effects) => apply(effects),
    playCutscene: (id) => {
      if (!director || !hasOwn(director.content.cutscenes, id)) return false;
      void director.enqueue(() => director.playCutscene(id));
      return true;
    },
    giveItem: (item, qty = 1) => !!director && hasOwn(director.content.items, item) && apply([{ give: item, qty }]),
    setAttr: (attribute, value) => {
      if (!director) return false;
      const current = director.campaign.state().player.attributes[attribute];
      if (current === undefined) return false;
      return apply([{ trainAttribute: attribute, delta: Math.round(value) - current }]);
    },
    addHearts: (npc, hearts) => !!director && hasOwn(director.content.npcs, npc) && apply([{ relation: npc, delta: Math.round(hearts * 100) }]),
    setTime: (slot) => { if (!director) return false; director.setTime(slot); return true; },
    startBattle: (encounter) => {
      if (!director || !hasOwn(director.content.encounters, encounter)) return false;
      void director.enqueue(() => director.battle(encounter));
      return true;
    },
    winBattle: (outcome = 'win') => director?.resolveBattle(outcome) ?? false,
    battle: () => {
      const current = battles?.current;
      if (!current) return null;
      const { controller } = current;
      const state = controller.state;
      return {
        encounter: current.encounter,
        round: state.round,
        active: state.active,
        playerTurn: controller.isPlayerTurn,
        finished: controller.isFinished,
        outcome: state.outcome,
        units: state.units.map((unit) => ({
          id: unit.id, team: unit.team, hp: unit.hp, maxHp: unit.maxHp, cell: [unit.cell[0], unit.cell[1]], state: unit.state,
        })),
      };
    },
    battleAction: (key) => {
      const controller = battles?.current?.controller;
      if (!controller?.isPlayerTurn) return false;
      controller.action(key);
      return true;
    },
    battleTap: (col, row) => {
      const controller = battles?.current?.controller;
      if (!controller?.isPlayerTurn) return false;
      controller.tap([col, row], 'key');
      return true;
    },
    idle: async () => {
      if (!director) return;
      for (let i = 0; i < 400 && director.busy; i++) await new Promise((resolve) => setTimeout(resolve, 25));
    },
    seed: (value) => random?.seed(value),
    walkable: (x, y) => director?.explore()?.isWalkable(x, y) ?? null,
    reachable: (x, y) => director?.explore()?.probePath(x, y) ?? null,
    walkTo: (x, y) => director?.explore()?.clickAt(x, y) ?? false,
    background: () => director?.explore()?.backgroundShown() ?? null,
    followers: () => director?.explore()?.followerPositions() ?? [],
    placeholders: () => [...(director?.assets.placeholders ?? [])].sort(),
    passersby: () => director?.explore()?.passerbyPositions() ?? [],
    passerbyBark: (id) => director?.explore()?.passerbyBark(id) ?? null,
    worldLabels: () => director?.explore()?.worldLabels() ?? [],
    objectiveMarker: () => director?.explore()?.objectiveShown() ?? null,
    lighting: () => director?.explore()?.lightingView() ?? null,
  };
  window.__nexus = hook;
  return hook;
}
