// Erkundung (Bereich explore-presentation): Karte beliebiger Größe (MapDef.size) mit Kamera-Follow und Grenzen
// (kleinere Karten zentriert), Spielfigur mit Laufblatt (8 fps, Atmen im Stand), Crew auf der Spur, Figuren nach
// Tagesablauf (laufen bei Wechseln hin bzw. weg), Namensschilder beim Nähern, Hotspots mit Aktionslabel, Ausgänge,
// Vordergrund-Verdecker, sichtbare Gegnergruppen mit Patrouille (Berührung → Kampf), Passanten mit Laufrouten und
// Sprechblasen, Tageszeit-Beleuchtung (Farb-Overlay, additive Neon-Lichtpunkte, Dunkelmaske im Untergrund),
// Zielmarker des aktiven Ziels, Klick/Tippen mit Pfadsuche, Kollisionsansicht (F1) und Spieluhr.
//
// Grenzen: nur Darstellung. Zustand ändert sich ausschließlich über den Kampagnen-Port bzw. den Director.
// Erweiterungspunkte:
// - Neue Interaktionsarten: `Interactable` erweitern, in `refreshWorld` sammeln, im Director (`interact`) behandeln.
// - Tagesablauf-Quelle: `setPresenceResolver` (Standard `campaign.presentNpcs`).
// - Stellschrauben in ../tuning.ts, reine Logik in ../motion.ts, ../ambient.ts, ../lighting.ts, ../presence.ts,
//   ../objective.ts, ../labels.ts (alle ohne Phaser getestet).
import Phaser from 'phaser';
import { musicForMap } from '../../music';
import { dailyHotspotFlag } from '../../../modules/campaign';
import { RANDOM_GROUP_PREFIX, rollRandomEncounter } from '../../../modules/combat/randomEncounters';
import { VOICE_FIELD, loadVoiceBank, pickSnippet, voiceCooldown, voiceGain, type VoiceBank } from '../voices';
import type { DialogueId, ExitDef, Facing, HotspotDef, MapDef, MapEncounterDef, MapId, NpcId, NpcPresence, Point, Rect, TimeSlot } from '../../../modules/contracts';
import type { Director } from '../../director';
import { GAME_H, GAME_W } from '../../dom/layout';
import { getDirector } from '../../runtime';
import { Actor } from '../actor';
import { bubbleDuration, nextBarkDelay, pickBark, planPassersby, type PasserbyPlan } from '../ambient';
import type { AssetNeed } from '../assets';
import { cameraBounds } from '../camera';
import { BARK_RADIUS, BUBBLE_MAX, clampLabel, nearbyNameplates, onScreen } from '../labels';
import { lightAlpha, neonFlicker, parseColor, tintFor, UNDERGROUND_DARKNESS } from '../lighting';
import { distance, expandRoute, facingFrom, stepRoute, type RouteWalker } from '../motion';
import { createNavAdapter, type NavAdapter } from '../navigationAdapter';
import { edgeIndicator, objectiveTarget, type ObjectiveTarget } from '../objective';
import { absoluteMinute, diffPresences, exitCenter, nearestExit, TELEPORT_MINUTES, type PresenceResolver } from '../presence';
import { buildTrail, pointAlong } from '../trail';
import {
  CLICK_MARKER_RADIUS, DEFAULT_ENEMY_SPRITE, DEFAULT_PLAYER_SPRITE, DEFAULT_RADIUS, ENCOUNTER_RADIUS, FACING_HYSTERESIS,
  FOLLOWER_SPACING, MS_PER_GAME_MINUTE, NPC_LEAVE_TIMEOUT, NPC_RADIUS, NPC_WALK_SPEED, OCCLUDER_ALPHA, PASSERBY_PAUSE,
  PATROL_PAUSE, PATROL_SPEED, SPEED,
} from '../tuning';
import { WorldLabels, type WorldLabelSpec } from '../worldLabels';

export type Interactable =
  | { kind: 'hotspot'; id: string; label: string; x: number; y: number; radius: number; hotspot: HotspotDef }
  | { kind: 'npc'; id: string; label: string; x: number; y: number; radius: number; npc: NpcId; dialogue?: DialogueId; actor: NpcActor }
  | { kind: 'exit'; id: string; label: string; x: number; y: number; radius: number; exit: ExitDef }
  | { kind: 'encounter'; id: string; label: string; x: number; y: number; radius: number; group: MapEncounterDef; actor: GroupActor }
  | { kind: 'bed'; id: string; label: string; x: number; y: number; radius: number };

/** Figur nach Tagesablauf/Platzierung. `walker`: aktueller Weg (Ortswechsel 'once' oder Patrouille 'loop'). */
interface NpcActor { presence: NpcPresence; actor: Actor; walker: RouteWalker | null; transit: boolean }
interface LeavingNpc { npc: NpcId; actor: Actor; walker: RouteWalker; until: number; fading: boolean }
interface GroupActor { group: MapEncounterDef; actor: Actor; walker: RouteWalker | null; armed: boolean }
interface Passerby { plan: PasserbyPlan; actor: Actor; walker: RouteWalker; nextBark: number; bubble: { text: string; until: number } | null; leaving: boolean }
interface BgLayer { image: Phaser.GameObjects.Image; crop: Rect | null; baseY: number; fixed: boolean }

let debugOverlay = false;
export function isDebugOverlay() { return debugOverlay; }

let presenceOverride: PresenceResolver | null = null;
/** Tagesablauf-Quelle austauschen (Integration/Tests); `null` = `campaign.presentNpcs`. */
export function setPresenceResolver(resolver: PresenceResolver | null) { presenceOverride = resolver; }

/** Passanten-Sprüche, die in dieser Sitzung schon liefen (je Karte) – neue Sprüche haben Vorrang. */
/** Schon gehörte Stimmenfetzen (Sitzung), damit Neues Vorrang hat. */
const VOICE_HEARD = new Set<string>();
const BARK_MEMORY = new Map<string, Set<string>>();

function inRect(x: number, y: number, rect: readonly [number, number, number, number]) {
  return x >= rect[0] && y >= rect[1] && x <= rect[0] + rect[2] && y <= rect[1] + rect[3];
}

const GLOW = 'light-glow';
const OBJECTIVE_COLOR = 0xffe14a;

export class ExploreScene extends Phaser.Scene {
  private rt!: Director;
  map!: MapDef;
  private nav!: NavAdapter;
  private resolvePresence!: PresenceResolver;
  player!: Actor;
  private followers: { id: NpcId; actor: Actor }[] = [];
  private npcActors: NpcActor[] = [];
  private leavingNpcs: LeavingNpc[] = [];
  private groups: GroupActor[] = [];
  /** Zufallsgruppen, die in diesem Besuch schon angesprochen wurden (Kampf, Flucht oder Niederlage). */
  private spentGroups = new Set<string>();
  private passersby: Passerby[] = [];
  private voiceBank: VoiceBank | null = null;
  private voiceNext = 0;
  private voiceRun = 0;
  private voiceActive: { stop(): void } | null = null;
  private voiceLast: string | null = null;
  private ambientSlot: string | null = null;
  private lastBark: string | null = null;
  private presenceKey = '';
  private npcSynced = false;
  private lastMinute = 0;
  private markers = new Map<string, Phaser.GameObjects.Container>();
  private props = new Map<string, Actor>();
  private trail: Point[] = [];
  private path: Point[] = [];
  private pendingTarget: Interactable | null = null;
  private pendingExit: ExitDef | null = null;
  private interactables: Interactable[] = [];
  private focused: Interactable | null = null;
  private hinted: Interactable | null = null;
  private debugGfx!: Phaser.GameObjects.Graphics;
  private debugDyn!: Phaser.GameObjects.Graphics;
  private bgLayers: BgLayer[] = [];
  private bgKey = '';
  private tint: Phaser.GameObjects.Rectangle | null = null;
  private darkness: Phaser.GameObjects.RenderTexture | null = null;
  private eraser: Phaser.GameObjects.Image | null = null;
  private lightImages: { image: Phaser.GameObjects.Image; base: number; seed: number }[] = [];
  private labels: WorldLabels | null = null;
  private nameplates = new Set<string>();
  private objective: ObjectiveTarget | null = null;
  private objectiveText = '';
  private objectiveKey = '';
  private objectiveMarker: Phaser.GameObjects.Container | null = null;
  private objectiveArrow: Phaser.GameObjects.Graphics | null = null;
  private clickMarker: Phaser.GameObjects.Graphics | null = null;
  private exitsArmed = false;
  private lockedExit: string | null = null;
  private wasMoving = false;
  private playAccum = 0;
  private clockAccum = 0;
  private stepTimer = 0;
  private leaving = false;
  private paused = false;
  private unsubscribe: (() => void) | null = null;
  private popLayer: (() => void) | null = null;
  private pointer: Point = [0, 0];
  ready = false;

  constructor() { super('explore'); }

  init() {
    this.rt = getDirector();
    this.ready = false;
    this.leaving = false;
    this.paused = false;
    this.followers = [];
    this.npcActors = [];
    this.leavingNpcs = [];
    this.groups = [];
    this.stopVoice();
    this.passersby = [];
    this.ambientSlot = null;
    this.presenceKey = '';
    this.npcSynced = false;
    this.markers = new Map();
    this.props = new Map();
    this.trail = [];
    this.path = [];
    this.pendingTarget = null;
    this.pendingExit = null;
    this.interactables = [];
    this.focused = null;
    this.hinted = null;
    this.tint = null;
    this.darkness = null;
    this.eraser = null;
    this.lightImages = [];
    this.labels = null;
    this.nameplates = new Set();
    this.objective = null;
    this.objectiveText = '';
    this.objectiveKey = '';
    this.objectiveMarker = null;
    this.objectiveArrow = null;
    this.clickMarker = null;
    this.exitsArmed = false;
    this.lockedExit = null;
    this.wasMoving = false;
    this.clockAccum = 0;
    this.bgLayers = [];
    this.bgKey = '';
    const state = this.rt.campaign.state();
    this.map = this.rt.content.maps[state.map] ?? this.rt.content.maps[this.rt.content.start.map];
    // Zufallsbegegnung dieses Besuchs (höchstens eine, sichtbar und umgehbar; world.md §8.7).
    this.spentGroups = new Set();
    const ambush = rollRandomEncounter(this.rt.content, state, this.map.id, (condition) => this.rt.campaign.evaluate(condition));
    if (ambush) this.map = { ...this.map, encounters: [...(this.map.encounters ?? []), ambush] };
    // Begehbarkeit nach Zustand (MapDef.blockVariants), gilt für diesen Besuch.
    const variants = (this.map.blockVariants ?? []).filter((variant) => this.rt.campaign.evaluate(variant.when));
    if (variants.length) {
      this.map = {
        ...this.map,
        walk: [...this.map.walk, ...variants.flatMap((variant) => variant.walk ?? [])],
        block: [...(this.map.block ?? []), ...variants.flatMap((variant) => variant.block ?? [])],
      };
    }
    this.lastMinute = absoluteMinute(state.clock);
    this.resolvePresence = presenceOverride ?? ((map) => this.rt.campaign.presentNpcs(map));
  }

  get mapW() { return this.map.size[0]; }
  get mapH() { return this.map.size[1]; }

  // ---------------------------------------------------------------- Grafiken

  private playerSprite(): string {
    const player = this.rt.campaign.state().player;
    // Vertretung (Prolog als Raven): Laufblatt der vertretenen Figur.
    if (player.standIn) return this.npcSprite(player.standIn.npc).key;
    // Fertige Spielfigur (Vex): gemaltes Laufblatt; sonst die gebackene Baukasten-Textur 'player-walk'.
    const preset = player.preset ? this.rt.content.presets?.[player.preset] : undefined;
    if (preset) return this.rt.catalog.canonical(preset.sprite);
    const look = this.rt.content.looks[player.look];
    return this.rt.catalog.canonical(look?.sprite ?? DEFAULT_PLAYER_SPRITE);
  }

  private npcSprite(npc: NpcId, pose?: string): AssetNeed {
    const catalog = this.rt.catalog;
    if (pose) return { kind: 'pose', key: catalog.canonical(`${npc}-${pose}`) };
    const def = this.rt.content.npcs[npc];
    return { kind: 'walk', key: catalog.canonical(def?.sprite ?? `${npc}-walk`) };
  }

  /** Alle Grafiken, die diese Karte zu irgendeiner Tageszeit braucht. */
  private needs(): AssetNeed[] {
    const catalog = this.rt.catalog;
    const content = this.rt.content;
    const size = this.map.size;
    const needs: AssetNeed[] = [{ kind: 'bg', key: catalog.canonical(this.map.bg, 'bg'), label: this.map.name, size }];
    for (const variant of this.map.bgVariants ?? []) needs.push({ kind: 'bg', key: catalog.canonical(variant.bg, 'bg'), label: this.map.name, size });
    needs.push({ kind: 'walk', key: this.playerSprite() });
    for (const id of this.rt.campaign.state().party) needs.push(this.npcSprite(id));
    // Alle Figuren, die laut Platzierung oder Tagesablauf hier auftauchen können (Wechsel ohne Nachladen).
    const npcs = new Set<NpcId>();
    for (const placement of this.map.npcs ?? []) needs.push(this.npcSprite(placement.npc, placement.pose));
    for (const npc of Object.values(content.npcs)) {
      for (const entry of npc.schedule ?? []) {
        if (entry.place === 'away' || entry.place.map !== this.map.id) continue;
        npcs.add(npc.id);
        if (entry.pose) needs.push(this.npcSprite(npc.id, entry.pose));
      }
    }
    for (const id of npcs) needs.push(this.npcSprite(id));
    for (const group of this.map.encounters ?? []) needs.push({ kind: 'walk', key: catalog.canonical(group.sprite ?? DEFAULT_ENEMY_SPRITE) });
    for (const sprite of this.map.ambient?.sprites ?? []) needs.push({ kind: 'walk', key: catalog.canonical(sprite) });
    for (const hotspot of this.map.hotspots) if (hotspot.prop) needs.push({ kind: 'prop', key: this.propKey(hotspot.prop) });
    return needs;
  }

  /** Optionaler Vordergrund-Layer `fg-<map>` (transparent, gleiche Proportionen wie der Hintergrund); ohne Platzhalter. */
  private foregroundKey(): string | null {
    return this.map.foreground?.length ? this.rt.catalog.imageKey(`fg-${this.map.id}`) : null;
  }

  private propKey(prop: string) { return this.rt.catalog.canonical(prop, 'prop'); }

  private backgroundKey(): string {
    const variant = (this.map.bgVariants ?? []).find((entry) => this.rt.campaign.evaluate(entry.when));
    return this.rt.catalog.canonical(variant?.bg ?? this.map.bg, 'bg');
  }

  /** Bild auf MapDef.size gestreckt bzw. Ausschnitt `crop` (Kartenpixel) aus dem Bild. */
  private fitLayer(layer: BgLayer, key: string) {
    const source = this.textures.get(key).getSourceImage() as { width: number; height: number };
    const sx = source.width / this.mapW;
    const sy = source.height / this.mapH;
    layer.image.setTexture(key);
    if (!layer.crop) { layer.image.setDisplaySize(this.mapW, this.mapH); return; }
    const [x, y, w, h] = layer.crop;
    layer.image.setScale(1 / sx, 1 / sy).setCrop(x * sx, y * sy, w * sx, h * sy);
  }

  /** Setzt Hintergrund und – ohne eigenen Vordergrund-Layer – die Verdecker-Ausschnitte. */
  private applyBackground(key: string) {
    if (key === this.bgKey || !this.textures.exists(key)) return;
    this.bgKey = key;
    for (const layer of this.bgLayers) if (!layer.fixed) this.fitLayer(layer, key);
  }

  preload() {
    const fg = this.foregroundKey();
    this.rt.assets.queue(this, fg ? [...this.needs(), { kind: 'bg', key: fg, label: this.map.name, size: this.map.size }] : this.needs());
  }

  create() {
    const rt = this.rt;
    rt.assets.ensure(this, this.needs());
    const camera = this.cameras.main;
    camera.setBackgroundColor('#05030a');
    const bgKey = this.backgroundKey();
    this.bgLayers = [{ image: this.add.image(0, 0, bgKey).setOrigin(0).setDepth(-10000), crop: null, baseY: -10000, fixed: false }];
    const fgKey = this.foregroundKey();
    const fgReady = !!fgKey && this.textures.exists(fgKey);
    for (const fg of this.map.foreground ?? []) {
      const layer: BgLayer = { image: this.add.image(0, 0, fgReady ? fgKey! : bgKey).setOrigin(0).setDepth(fg.baseY), crop: fg.rect, baseY: fg.baseY, fixed: fgReady };
      this.bgLayers.push(layer);
      if (fgReady) this.fitLayer(layer, fgKey!);
    }
    this.applyBackground(bgKey);

    this.nav = createNavAdapter(this.map);

    const state = rt.campaign.state();
    let start: Point = state.position;
    if (!start || !this.nav.walkable(start[0], start[1])) {
      const entry = this.map.entries[rt.content.start.entry] ?? Object.values(this.map.entries)[0];
      const fallback: Point = entry?.at ?? [this.mapW / 2, this.mapH / 2];
      start = this.nav.nearestWalkable(start ?? fallback, 160) ?? fallback;
    }
    this.player = new Actor(this, rt.assets, this.playerSprite(), start[0], start[1], state.facing ?? 's', 'player');
    this.player.depthBias = 0.5;
    this.player.setPosition(start[0], start[1]);
    this.buildFollowers(state.facing ?? 's');
    this.buildGroups();
    this.buildLights();
    this.clickMarker = this.add.graphics().setDepth(8999).setVisible(false);
    this.clickMarker.lineStyle(4, 0x05030a, 0.5).strokeCircle(0, 0, CLICK_MARKER_RADIUS).lineStyle(2, 0x3ef2ff, 0.95).strokeCircle(0, 0, CLICK_MARKER_RADIUS);
    this.objectiveArrow = this.add.graphics().setScrollFactor(0).setDepth(16000).setVisible(false);
    this.labels = new WorldLabels(rt.shell.frame);
    this.refreshWorld();

    camera.setBounds(...cameraBounds(this.map.size));
    camera.startFollow(this.player.sprite, false, 0.14, 0.14);
    camera.setDeadzone(24, 16);
    camera.setRoundPixels(false);
    camera.centerOn(this.player.x, this.player.y);

    this.debugGfx = this.add.graphics().setDepth(20000);
    this.debugDyn = this.add.graphics().setDepth(20000);
    this.drawDebug();

    this.input.on('pointerdown', this.onPointerDown, this);
    this.input.on('pointermove', this.onPointerMove, this);
    this.input.on('gameout', () => rt.hud.setHover(null));

    this.popLayer = rt.input.push('explore', (event) => this.onIntent(event.intent.type), { modal: false });
    this.unsubscribe = rt.campaign.subscribe(() => this.refreshWorld());
    this.events.on(Phaser.Scenes.Events.PAUSE, this.onPause, this);
    this.events.on(Phaser.Scenes.Events.SLEEP, this.onPause, this);
    this.events.on(Phaser.Scenes.Events.RESUME, this.onResume, this);
    this.events.on(Phaser.Scenes.Events.WAKE, this.onResume, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.cleanup());

    rt.audio.setAmbience(this.map.ambience);
    this.voiceNext = this.time.now + 3000 + Math.random() * 4000;
    void loadVoiceBank().then((voices) => { this.voiceBank = voices; });
    const music = musicForMap(rt.content, this.map, rt.campaign.state().clock.minutes, (c) => rt.campaign.evaluate(c));
    rt.audio.setMusic(music.id, { muffled: music.muffled });
    rt.setMode('explore');
    camera.fadeIn(rt.settings.get().reducedMotion ? 0 : 350, 0, 0, 0);
    rt.hud.showBanner(this.map.name, this.map.subtitle);
    this.exitsArmed = !this.map.exits.some((exit) => !exit.interact && inRect(start[0], start[1], exit.rect));
    this.ready = true;
    rt.exploreReady(this);
  }

  private onPause() { this.paused = true; this.labels?.setVisible(false); this.rt.hud.setHover(null); }
  private onResume() { this.paused = false; }

  private cleanup() {
    this.unsubscribe?.();
    this.unsubscribe = null;
    this.popLayer?.();
    this.popLayer = null;
    this.input.off('pointerdown', this.onPointerDown, this);
    this.input.off('pointermove', this.onPointerMove, this);
    this.events.off(Phaser.Scenes.Events.PAUSE, this.onPause, this);
    this.events.off(Phaser.Scenes.Events.SLEEP, this.onPause, this);
    this.events.off(Phaser.Scenes.Events.RESUME, this.onResume, this);
    this.events.off(Phaser.Scenes.Events.WAKE, this.onResume, this);
    this.labels?.destroy();
    this.labels = null;
    this.rt.hud.setHover(null);
    this.rt.hud.setHint(null);
    this.rt.hud.setCoords(null);
    this.ready = false;
  }

  private onIntent(type: string): boolean {
    const rt = this.rt;
    switch (type) {
      case 'interact': if (!this.blocked()) this.interactFocused(); return true;
      case 'cancel': case 'menu': if (!rt.busy) rt.openMenu(); return true;
      case 'inventory': if (!rt.busy) rt.openInventory(); return true;
      case 'character': if (!rt.busy) rt.openCharacter(); return true;
      case 'quests': if (!rt.busy) rt.openQuests(); return true;
      case 'relations': if (!rt.busy) rt.openRelations(); return true;
      case 'phone': if (!rt.busy) void rt.openPhone(); return true;
      case 'map': if (!rt.busy) rt.openCityMap(); return true;
      case 'debugCollision': this.toggleDebug(); return true;
      case 'debugMenu': rt.openDebugMenu(); return true;
      default: return false;
    }
  }

  blocked(): boolean {
    return this.leaving || this.rt.busy || this.rt.input.movementBlocked() || !this.ready;
  }

  // ---------------------------------------------------------------- Aufbau

  private buildFollowers(facing: Facing) {
    const ids = [...this.rt.campaign.state().party];
    const start: Point = [this.player.x, this.player.y];
    this.trail = buildTrail(start, facing, (ids.length + 1) * FOLLOWER_SPACING, (x, y) => this.nav.walkable(x, y), 4);
    for (const entry of this.followers) entry.actor.destroy();
    this.followers = ids.map((id, index) => {
      const position = this.trailPoint((index + 1) * FOLLOWER_SPACING);
      const need = this.npcSprite(id);
      this.rt.assets.ensure(this, [need]);
      return { id, actor: new Actor(this, this.rt.assets, need.key, position[0], position[1], facing, id) };
    });
  }

  /** Patrouille als zyklischer Weg über die Pfadsuche; Wartezeit nur an den Original-Wegpunkten. */
  private patrolWalker(points: readonly Point[] | undefined, from: Point): RouteWalker | null {
    if (!points?.length) return null;
    const { route, anchors } = expandRoute(points, (a, b) => this.nav.findPath(a, b), true);
    // Erst zum nächstgelegenen Wegpunkt, damit niemand quer über die Karte springt.
    let index = 0;
    let best = Infinity;
    route.forEach((point, i) => { const d = distance(point, from); if (d < best) { best = d; index = i; } });
    return { route, index, waitUntil: 0, mode: 'loop', pause: (i) => (anchors[i] ? PATROL_PAUSE : 0) };
  }

  /** Einmaliger Weg (Ortswechsel nach Tagesablauf) über die Pfadsuche. */
  private transitWalker(from: Point, to: Point): RouteWalker {
    const path = this.nav.findPath(from, to);
    return { route: path.length ? path : [to], index: 0, waitUntil: 0, mode: 'once', pause: () => 0 };
  }

  private spawnNpc(presence: NpcPresence, at: Point = presence.at): NpcActor {
    const need = this.npcSprite(presence.npc, presence.pose);
    this.rt.assets.ensure(this, [need]);
    const actor = new Actor(this, this.rt.assets, need.key, at[0], at[1], presence.facing, presence.npc);
    return { presence, actor, walker: presence.pose ? null : this.patrolWalker(presence.patrol, at), transit: false };
  }

  /**
   * Figuren nach Platzierung und Tagesablauf. Beim Betreten und nach Zeitsprüngen (Schlafen, Debug-Uhr) stehen alle
   * sofort an ihrem Platz; sonst laufen sie zum neuen Ort, kommen über den nächsten Ausgang herein oder gehen hinaus.
   */
  private syncNpcs(jumped: boolean) {
    const present = this.resolvePresence(this.map.id);
    const key = present.map((entry) => `${entry.npc}@${entry.source}@${entry.at.join(',')}@${entry.facing}@${entry.pose ?? ''}@${entry.dialogue ?? ''}@${(entry.patrol ?? []).join(';')}`).join('|');
    if (key === this.presenceKey) return;
    this.presenceKey = key;
    const instant = !this.npcSynced || jumped || this.rt.settings.get().reducedMotion;
    this.npcSynced = true;
    if (instant) {
      for (const npc of this.npcActors) npc.actor.destroy();
      for (const npc of this.leavingNpcs) npc.actor.destroy();
      this.leavingNpcs = [];
      this.npcActors = present.map((presence) => this.spawnNpc(presence));
      return;
    }
    const diff = diffPresences(this.npcActors.map((entry) => entry.presence), present);
    const byNpc = new Map(this.npcActors.map((entry) => [entry.presence.npc, entry]));
    const next: NpcActor[] = [];
    for (const { after } of diff.stay) {
      const entry = byNpc.get(after.npc)!;
      entry.presence = after;
      next.push(entry);
    }
    for (const { after } of diff.rebuild) {
      byNpc.get(after.npc)!.actor.destroy();
      next.push(this.spawnNpc(after));
    }
    for (const { after } of diff.move) {
      const entry = byNpc.get(after.npc)!;
      entry.presence = after;
      entry.walker = this.transitWalker([entry.actor.x, entry.actor.y], after.at);
      entry.transit = true;
      next.push(entry);
    }
    for (const presence of diff.enter) {
      const exit = nearestExit(this.map, presence.at);
      const door = exit ? this.nav.nearestWalkable(exitCenter(exit), 120) : null;
      if (!door || presence.pose) { next.push(this.fadeIn(this.spawnNpc(presence))); continue; }
      const entry = this.fadeIn(this.spawnNpc(presence, door));
      entry.walker = this.transitWalker(door, presence.at);
      entry.transit = true;
      next.push(entry);
    }
    for (const presence of diff.leave) {
      const entry = byNpc.get(presence.npc)!;
      const exit = nearestExit(this.map, [entry.actor.x, entry.actor.y]);
      const door = exit ? this.nav.nearestWalkable(exitCenter(exit), 120) : null;
      const walker = door && !presence.pose ? this.transitWalker([entry.actor.x, entry.actor.y], door) : { route: [], index: 0, waitUntil: 0, mode: 'once' as const, pause: () => 0, finished: true };
      this.leavingNpcs.push({ npc: presence.npc, actor: entry.actor, walker, until: this.time.now + NPC_LEAVE_TIMEOUT, fading: false });
    }
    this.npcActors = next;
  }

  private fadeIn<T extends { actor: Actor }>(entry: T): T {
    entry.actor.sprite.setAlpha(0);
    this.tweens.add({ targets: entry.actor.sprite, alpha: 1, duration: 500 });
    return entry;
  }

  private buildGroups() {
    for (const group of this.map.encounters ?? []) {
      const key = this.rt.catalog.canonical(group.sprite ?? DEFAULT_ENEMY_SPRITE);
      const actor = new Actor(this, this.rt.assets, key, group.at[0], group.at[1], 's', `encounter:${group.id}`);
      this.groups.push({
        group, actor, walker: this.patrolWalker(group.patrol, group.at),
        armed: Math.hypot(group.at[0] - this.player.x, group.at[1] - this.player.y) > (group.radius ?? ENCOUNTER_RADIUS),
      });
    }
  }

  /** Passanten für die aktuelle Tageszeit: vorhandene laufen weiter, zusätzliche blenden ein, überzählige gehen. */
  private syncPassersby(slot: TimeSlot) {
    // Neu planen bei neuer Tageszeit oder wenn `ambient.when` umschlägt (Rennnacht, Bruch).
    const ambient = this.map.ambient && this.rt.campaign.evaluate(this.map.ambient.when) ? this.map.ambient : undefined;
    const key = `${slot}:${ambient ? 1 : 0}`;
    if (key === this.ambientSlot) return;
    this.ambientSlot = key;
    const state = this.rt.campaign.state();
    const plans = planPassersby(ambient, slot, {
      seed: `${this.map.id}:${state.clock.day}:${slot}`,
      size: this.map.size,
      walkable: (x, y) => this.nav.walkable(x, y),
      findPath: (a, b) => this.nav.findPath(a, b),
    });
    const active = this.passersby.filter((entry) => !entry.leaving);
    const firstBuild = !this.passersby.length;
    const now = this.time.now;
    for (let i = plans.length; i < active.length; i++) {
      const entry = active[i];
      entry.leaving = true;
      entry.bubble = null;
      this.tweens.add({ targets: entry.actor.sprite, alpha: 0, duration: 700, onComplete: () => { entry.actor.destroy(); this.passersby = this.passersby.filter((other) => other !== entry); } });
    }
    for (let i = active.length; i < plans.length; i++) {
      const plan = plans[i];
      const key = this.rt.catalog.canonical(plan.sprite);
      this.rt.assets.ensure(this, [{ kind: 'walk', key }]);
      const actor = new Actor(this, this.rt.assets, key, plan.start[0], plan.start[1], 's', plan.id);
      const anchors = plan.anchors;
      const walker: RouteWalker = { route: plan.route, index: plan.index, waitUntil: 0, mode: 'loop', pause: (index) => (anchors[index] ? PASSERBY_PAUSE * (1 + Math.random()) : 0) };
      const entry: Passerby = { plan, actor, walker, nextBark: now + 2500 + Math.random() * 6000, bubble: null, leaving: false };
      if (!firstBuild) this.fadeIn(entry);
      this.passersby.push(entry);
    }
  }

  private groupVisible(group: MapEncounterDef): boolean {
    const campaign = this.rt.campaign;
    if (this.spentGroups.has(group.id)) return false;
    if (!campaign.evaluate(group.when)) return false;
    if (group.once !== false && campaign.evaluate({ won: group.encounter })) return false;
    return !campaign.hasSeen(`avoid:${this.map.id}:${group.id}`);
  }

  /** Einmalig benutzt (`once`) oder heute schon benutzt (`daily`). */
  private hotspotUsed(hotspot: HotspotDef): boolean {
    const campaign = this.rt.campaign;
    if (hotspot.once && campaign.hasSeen(hotspot.id)) return true;
    return !!hotspot.daily && campaign.evaluate({ flag: dailyHotspotFlag(this.map.id, hotspot.id) });
  }

  private hotspotVisible(hotspot: HotspotDef): boolean {
    const campaign = this.rt.campaign;
    if (!campaign.evaluate(hotspot.when)) return false;
    return !(hotspot.hideWhen && campaign.evaluate(hotspot.hideWhen));
  }

  /** Sichtbarkeit von Hotspots, Requisiten, Figuren, Crew, Gegnern, Passanten, Licht und Zielmarker nach jeder Zustandsänderung. */
  refreshWorld() {
    if (!this.player) return;
    const campaign = this.rt.campaign;
    const state = campaign.state();
    const minute = absoluteMinute(state.clock);
    const jumped = minute < this.lastMinute || minute - this.lastMinute > TELEPORT_MINUTES;
    this.lastMinute = minute;
    this.applyBackground(this.backgroundKey());
    this.syncNpcs(jumped);
    const slot = campaign.timeSlot();
    if (jumped) this.ambientSlot = null;
    this.syncPassersby(slot);
    const list: Interactable[] = [];
    const reduced = this.rt.settings.get().reducedMotion;
    const seenMarkers = new Set<string>();
    const marker = (key: string, at: Point, color?: number) => {
      seenMarkers.add(key);
      if (!this.markers.has(key)) this.markers.set(key, this.makeMarker(at, reduced, color));
    };
    for (const hotspot of this.map.hotspots) {
      const visible = this.hotspotVisible(hotspot);
      if (hotspot.prop) {
        let prop = this.props.get(hotspot.id);
        if (visible && !prop) {
          prop = new Actor(this, this.rt.assets, this.propKey(hotspot.prop), hotspot.at[0], hotspot.at[1], 's', hotspot.id);
          prop.playLoop();
          this.props.set(hotspot.id, prop);
        }
        prop?.sprite.setVisible(visible);
      }
      if (!visible || this.hotspotUsed(hotspot)) continue;
      list.push({ kind: 'hotspot', id: hotspot.id, label: hotspot.label, x: hotspot.at[0], y: hotspot.at[1], radius: hotspot.radius ?? DEFAULT_RADIUS, hotspot });
      marker(hotspot.id, hotspot.at);
    }
    for (const exit of this.map.exits) {
      if (!exit.interact) continue;
      const [x, y, w, h] = exit.rect;
      list.push({ kind: 'exit', id: exit.id, label: exit.label, x: x + w / 2, y: y + h / 2, radius: Math.max(w, h) / 2 + 36, exit });
      marker(`exit:${exit.id}`, [x + w / 2, y + h / 2], 0x4ff8ff);
    }
    if (this.map.bed) {
      list.push({ kind: 'bed', id: 'bed', label: this.map.bed.label ?? 'Schlafen', x: this.map.bed.at[0], y: this.map.bed.at[1], radius: DEFAULT_RADIUS });
      marker('bed', this.map.bed.at, 0xb18cff);
    }
    for (const npc of this.npcActors) {
      const name = campaign.displayName(npc.presence.npc);
      list.push({
        kind: 'npc', id: npc.presence.npc, label: npc.presence.pose ? `${name} ansehen` : `Mit ${name} sprechen`,
        x: npc.actor.x, y: npc.actor.y, radius: NPC_RADIUS, npc: npc.presence.npc, ...(npc.presence.dialogue ? { dialogue: npc.presence.dialogue } : {}), actor: npc,
      });
    }
    for (const group of this.groups) {
      const visible = this.groupVisible(group.group);
      group.actor.sprite.setVisible(visible);
      if (!visible) continue;
      const name = this.rt.content.encounters[group.group.encounter]?.name ?? 'Gegner';
      list.push({ kind: 'encounter', id: `encounter:${group.group.id}`, label: `${name} – Kampf`, x: group.actor.x, y: group.actor.y, radius: group.group.radius ?? ENCOUNTER_RADIUS, group: group.group, actor: group });
    }
    for (const [id, entry] of this.markers) {
      if (!seenMarkers.has(id)) { entry.destroy(); this.markers.delete(id); }
    }
    this.interactables = list;
    const party = state.party;
    if (party.join() !== this.followers.map((entry) => entry.id).join()) this.buildFollowers(this.player.facing);
    if (this.focused && !list.some((entry) => entry.id === this.focused?.id && entry.kind === this.focused.kind)) this.focused = null;
    this.applyTimeOfDay();
    this.refreshObjective(reduced);
    this.rt.hud.update(state);
    if (debugOverlay && this.debugGfx) this.drawDebug();
  }

  private makeMarker(at: Point, reduced: boolean, color = 0xff3fa4): Phaser.GameObjects.Container {
    const ring = this.add.graphics();
    ring.lineStyle(5, 0x05030a, 0.6);
    ring.strokeCircle(0, 0, 12);
    ring.lineStyle(2, color, 1);
    ring.strokeCircle(0, 0, 12);
    ring.fillStyle(color, 1);
    ring.fillCircle(0, 0, 3);
    const glow = this.add.graphics();
    glow.lineStyle(5, 0x05030a, 0.6);
    glow.strokeCircle(0, 0, 20);
    glow.lineStyle(2, 0xffffff, 1);
    glow.strokeCircle(0, 0, 20);
    glow.fillStyle(0xffffff, 1);
    glow.fillTriangle(-8, -36, 8, -36, 0, -26);
    glow.setVisible(false);
    const container = this.add.container(at[0], at[1] - 4, [ring, glow]).setDepth(9000).setAlpha(0.8);
    container.setData('glow', glow);
    if (!reduced) {
      this.tweens.add({ targets: ring, scale: { from: 0.85, to: 1.25 }, alpha: { from: 1, to: 0.5 }, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      this.tweens.add({ targets: glow, y: { from: 0, to: -4 }, duration: 500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }
    return container;
  }

  // ---------------------------------------------------------------- Zielmarker

  /** Aktives Ziel (Questlog/HUD) auf dieser Karte oder Richtung Ausgang zur Zielkarte. */
  private refreshObjective(reduced: boolean) {
    const campaign = this.rt.campaign;
    const objective = campaign.objective();
    const target = objectiveTarget(this.map, this.rt.content.maps, objective, (condition) => campaign.evaluate(condition));
    const key = target ? `${target.kind}@${target.point.join(',')}@${objective?.quest ?? ''}` : '';
    this.objectiveText = objective ? clampLabel(target?.kind === 'exit' ? `Ziel: ${objective.title}` : objective.text, 40) : '';
    if (key === this.objectiveKey) return;
    this.objectiveKey = key;
    this.objective = target;
    this.objectiveMarker?.destroy();
    this.objectiveMarker = null;
    if (!target) return;
    const diamond = this.add.graphics();
    const shape = [new Phaser.Math.Vector2(0, -14), new Phaser.Math.Vector2(10, 0), new Phaser.Math.Vector2(0, 14), new Phaser.Math.Vector2(-10, 0)];
    diamond.fillStyle(0x05030a, 0.55).fillCircle(0, 0, 18);
    diamond.lineStyle(3, OBJECTIVE_COLOR, 1).strokePoints(shape, true);
    diamond.fillStyle(OBJECTIVE_COLOR, 0.55).fillPoints(shape, true);
    this.objectiveMarker = this.add.container(target.point[0], target.point[1] - this.objectiveLift(target), [diamond]).setDepth(9002);
    if (!reduced) this.tweens.add({ targets: diamond, y: { from: -4, to: 4 }, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }

  /** Rautenhöhe über dem Zielpunkt: über einem Bodenpunkt schwebend, am Ausgang knapp darüber. */
  private objectiveLift(target: ObjectiveTarget) { return target.kind === 'exit' ? 22 : 64; }

  private updateObjectiveArrow() {
    const arrow = this.objectiveArrow;
    if (!arrow) return;
    arrow.clear();
    const target = this.objective;
    const view = this.cameras.main.worldView;
    const edge = target ? edgeIndicator({ x: view.x, y: view.y, w: view.width, h: view.height }, [target.point[0], target.point[1] - 40]) : null;
    if (!edge || this.blocked()) { arrow.setVisible(false); return; }
    const tip = (r: number, offset = 0): [number, number] => [edge.x + Math.cos(edge.angle + offset) * r, edge.y + Math.sin(edge.angle + offset) * r];
    const [ax, ay] = tip(16);
    const [bx, by] = tip(12, 2.5);
    const [cx, cy] = tip(12, -2.5);
    arrow.fillStyle(0x05030a, 0.7).fillCircle(edge.x, edge.y, 18);
    arrow.fillStyle(OBJECTIVE_COLOR, 1).fillTriangle(ax, ay, bx, by, cx, cy);
    arrow.lineStyle(2, OBJECTIVE_COLOR, 0.9).strokeCircle(edge.x, edge.y, 18);
    arrow.setVisible(true);
  }

  // ---------------------------------------------------------------- Licht und Tageszeit

  private ensureGlowTexture() {
    if (this.textures.exists(GLOW)) return;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 256;
    const context = canvas.getContext('2d')!;
    const gradient = context.createRadialGradient(128, 128, 8, 128, 128, 128);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.5, 'rgba(255,255,255,0.6)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 256, 256);
    this.textures.addCanvas(GLOW, canvas);
  }

  private buildLights() {
    this.ensureGlowTexture();
    this.tint = this.add.rectangle(0, 0, GAME_W, GAME_H, 0x000000, 0).setOrigin(0).setScrollFactor(0).setDepth(14000);
    if (this.map.lighting === 'underground') {
      this.darkness = this.add.renderTexture(0, 0, GAME_W, GAME_H).setOrigin(0).setScrollFactor(0).setDepth(15000);
      this.eraser = this.make.image({ key: GLOW, add: false });
    }
    (this.map.lights ?? []).forEach((light, index) => {
      // Additive Lichtpunkte liegen über der Färbung (leuchten nachts sichtbar „durch“) und unter der Dunkelmaske.
      const image = this.add.image(light.at[0], light.at[1], GLOW).setDepth(14500).setBlendMode(Phaser.BlendModes.ADD)
        .setTint(parseColor(light.color)).setAlpha(0).setScale((light.radius * 2) / 256);
      this.lightImages.push({ image, base: 0, seed: index * 1.7 + light.at[0] * 0.01 });
    });
  }

  /** Farb-Overlay je Tageszeit (außen stärker), Lichtpunkte nach Tageszeit; Untergrund nutzt die Dunkelmaske. */
  private applyTimeOfDay() {
    const slot = this.rt.campaign.timeSlot();
    if (this.tint) {
      const [color, alpha] = tintFor(this.map.lighting, slot);
      this.tint.setFillStyle(color, alpha);
    }
    const lights = this.map.lights ?? [];
    this.lightImages.forEach((entry, index) => {
      const light = lights[index];
      entry.base = light && this.rt.campaign.evaluate(light.when) ? lightAlpha(light, this.map.lighting, slot) : 0;
      entry.image.setVisible(entry.base > 0).setAlpha(entry.base);
    });
  }

  private updateLights(time: number) {
    const reduced = this.rt.settings.get().reducedMotion;
    for (const entry of this.lightImages) if (entry.base > 0) entry.image.setAlpha(Math.min(1, entry.base * neonFlicker(time, entry.seed, reduced)));
  }

  private updateDarkness(time: number) {
    if (!this.darkness || !this.eraser) return;
    const camera = this.cameras.main;
    const view = camera.worldView;
    const flicker = this.rt.settings.get().reducedMotion ? 1 : 1 + Math.sin(time / 180) * 0.025 + Math.sin(time / 77) * 0.015;
    this.darkness.clear();
    this.darkness.fill(0x000000, UNDERGROUND_DARKNESS);
    const erase = (x: number, y: number, scale: number) => {
      this.eraser!.setScale(scale).setPosition(x - view.x, y - view.y);
      this.darkness!.erase(this.eraser!);
    };
    erase(this.player.x, this.player.y - 50, 2.2 * flicker);
    for (const follower of this.followers) erase(follower.actor.x, follower.actor.y - 50, 0.9);
    (this.map.lights ?? []).forEach((light, index) => { if ((this.lightImages[index]?.base ?? 0) > 0) erase(light.at[0], light.at[1], (light.radius * 2) / 256); });
  }

  /** Vordergrund-Verdecker werden halb durchsichtig, solange die Spielfigur dahinter steht. */
  private updateOccluders(dt: number) {
    const { x, y } = this.player;
    for (const layer of this.bgLayers) {
      if (!layer.crop) continue;
      const [rx, ry, rw] = layer.crop;
      const behind = y < layer.baseY && y > ry && x > rx - 16 && x < rx + rw + 16;
      const target = behind ? OCCLUDER_ALPHA : 1;
      const alpha = layer.image.alpha + (target - layer.image.alpha) * Math.min(1, dt * 8);
      layer.image.setAlpha(Math.abs(alpha - target) < 0.01 ? target : alpha);
    }
  }

  // ---------------------------------------------------------------- Debug (F1)

  toggleDebug(): boolean {
    debugOverlay = !debugOverlay;
    this.drawDebug();
    return debugOverlay;
  }

  private drawDebug() {
    const g = this.debugGfx;
    if (!g) return;
    g.clear();
    this.debugDyn?.clear();
    this.children.list.filter((child) => child.getData?.('debugText')).forEach((child) => child.destroy());
    if (!debugOverlay) { this.rt.hud.setCoords(null); return; }
    const text = (x: number, y: number, value: string, color: string, alpha = 1) => {
      this.add.text(x, y, value, { fontFamily: 'monospace', fontSize: '13px', color, backgroundColor: 'rgba(0,0,0,0.6)' }).setDepth(20001).setData('debugText', true).setAlpha(alpha);
    };
    const campaign = this.rt.campaign;
    const vectors = (polygon: readonly Point[]) => polygon.map(([x, y]) => new Phaser.Math.Vector2(x, y));
    g.lineStyle(2, 0x3cff7a, 0.9);
    g.fillStyle(0x3cff7a, 0.12);
    for (const polygon of this.map.walk) { g.fillPoints(vectors(polygon), true); g.strokePoints(vectors(polygon), true); }
    g.lineStyle(2, 0xff4040, 0.95);
    g.fillStyle(0xff4040, 0.2);
    for (const polygon of this.map.block ?? []) { g.fillPoints(vectors(polygon), true); g.strokePoints(vectors(polygon), true); }
    for (const exit of this.map.exits) {
      const open = campaign.evaluate(exit.when);
      g.lineStyle(2, exit.interact ? 0x9fe0ff : 0x4aa0ff, open ? 1 : 0.4);
      g.strokeRect(...exit.rect);
      text(exit.rect[0] + 2, exit.rect[1] + 2, `${exit.id}→${exit.to}${open ? '' : ' (gesperrt)'}${exit.check ? ' [Check]' : ''}`, '#9fd0ff', open ? 1 : 0.5);
    }
    for (const [name, entry] of Object.entries(this.map.entries)) {
      g.fillStyle(0xff9f1a, 1);
      g.fillRect(entry.at[0] - 4, entry.at[1] - 4, 8, 8);
      text(entry.at[0] + 6, entry.at[1] - 8, name, '#ffc070');
    }
    for (const [name, spot] of Object.entries(this.map.spots ?? {})) {
      g.fillStyle(0xff80ff, 1);
      g.fillRect(spot.at[0] - 3, spot.at[1] - 3, 6, 6);
      text(spot.at[0] + 6, spot.at[1] + 4, `◇ ${name}`, '#ffa0ff');
    }
    for (const hotspot of this.map.hotspots) {
      const visible = this.hotspotVisible(hotspot);
      const used = visible && this.hotspotUsed(hotspot);
      const state = !campaign.evaluate(hotspot.when) ? ' (when ✗)' : !visible ? ' (hideWhen)' : used ? ' (erledigt)' : '';
      const alpha = visible && !used ? 1 : 0.35;
      g.lineStyle(2, 0xffe040, 0.95 * alpha);
      g.strokeCircle(hotspot.at[0], hotspot.at[1], hotspot.radius ?? DEFAULT_RADIUS);
      text(hotspot.at[0] + 6, hotspot.at[1] + 4, `${hotspot.id} (${hotspot.kind})${state}`, '#ffe680', alpha);
    }
    for (const group of this.groups) {
      const visible = this.groupVisible(group.group);
      g.lineStyle(2, 0xff5050, visible ? 0.9 : 0.3);
      g.strokeCircle(group.group.at[0], group.group.at[1], group.group.radius ?? ENCOUNTER_RADIUS);
      text(group.group.at[0] + 6, group.group.at[1] + 4, `⚔ ${group.group.id}${visible ? '' : ' (weg)'}`, '#ff9090', visible ? 1 : 0.4);
      if (group.walker) this.strokeRoute(g, group.walker.route, 0xff5050, 0.6);
    }
    for (const passerby of this.passersby) this.strokeRoute(g, passerby.walker.route, 0x3ef2ff, 0.35);
    for (const npc of this.npcActors) if (npc.walker && !npc.transit) this.strokeRoute(g, npc.walker.route, 0xff80ff, 0.5);
    for (const fg of this.map.foreground ?? []) {
      g.lineStyle(2, 0xc080ff, 0.9);
      g.strokeRect(...fg.rect);
      g.lineBetween(fg.rect[0], fg.baseY, fg.rect[0] + fg.rect[2], fg.baseY);
    }
    for (const light of this.map.lights ?? []) {
      g.lineStyle(1, parseColor(light.color), 0.8);
      g.strokeCircle(light.at[0], light.at[1], light.radius);
      text(light.at[0] + 4, light.at[1] - 16, `☀ ${(light.slots ?? []).join('/') || 'Standard'}`, light.color);
    }
    this.updateCoords();
  }

  private strokeRoute(g: Phaser.GameObjects.Graphics, route: readonly Point[], color: number, alpha: number) {
    if (route.length < 2) return;
    g.lineStyle(2, color, alpha);
    g.strokePoints(route.map(([x, y]) => new Phaser.Math.Vector2(x, y)), true);
  }

  /** Bewegliche Teile der Kollisionsansicht: aktueller Pfad, Fußpunkt, Wege der Figuren. */
  private drawDebugDynamic() {
    const g = this.debugDyn;
    if (!g) return;
    g.clear();
    if (!debugOverlay) return;
    if (this.path.length) {
      g.lineStyle(2, 0xffe14a, 0.9);
      g.strokePoints([new Phaser.Math.Vector2(this.player.x, this.player.y), ...this.path.map(([x, y]) => new Phaser.Math.Vector2(x, y))], false);
    }
    g.lineStyle(1, 0x3ef2ff, 0.4).strokeCircle(this.player.x, this.player.y, BARK_RADIUS);
    g.fillStyle(0xffffff, 1).fillCircle(this.player.x, this.player.y, 3);
    for (const npc of this.npcActors) if (npc.transit && npc.walker) this.strokeRoute(g, npc.walker.route, 0xff80ff, 0.9);
  }

  private updateCoords() {
    if (!debugOverlay) return;
    const [x, y] = this.pointer;
    const walk = this.nav.walkable(x, y) ? 'begehbar' : 'gesperrt';
    const slot = this.rt.campaign.timeSlot();
    this.rt.hud.setCoords(`Karte ${this.map.id} (${this.mapW}×${this.mapH}) · Maus ${Math.round(x)}, ${Math.round(y)} (${walk}) · Figur ${Math.round(this.player.x)}, ${Math.round(this.player.y)} · ${slot} · Passanten ${this.passersby.length}`);
  }

  // ---------------------------------------------------------------- Zeiger

  /** Kartenkoordinate → Bildschirmkoordinate der Spielfläche (GAME_W × GAME_H). */
  toScreen(x: number, y: number): Point {
    const camera = this.cameras.main;
    return [(x - camera.worldView.x) * camera.zoom, (y - camera.worldView.y) * camera.zoom];
  }

  private actorHit(actor: Actor, x: number, y: number): boolean {
    return Math.abs(x - actor.x) <= 26 && y <= actor.y + 8 && y >= actor.y - 110;
  }

  private pick(x: number, y: number): Interactable | null {
    let best: Interactable | null = null;
    let bestDistance = Infinity;
    for (const target of this.interactables) {
      let hit = false;
      let gap = Math.hypot(target.x - x, target.y - y);
      if (target.kind === 'npc' || target.kind === 'encounter') {
        const actor = target.actor.actor;
        hit = this.actorHit(actor, x, y);
        gap = Math.abs(x - actor.x);
      } else if (target.kind === 'exit') {
        hit = inRect(x, y, target.exit.rect);
      } else {
        const prop = this.props.get(target.id);
        const bounds = prop?.sprite.getBounds();
        hit = gap <= 28 || (!!bounds && bounds.contains(x, y));
      }
      if (hit && gap < bestDistance) { best = target; bestDistance = gap; }
    }
    return best;
  }

  private pickPasserby(x: number, y: number): Passerby | null {
    let best: Passerby | null = null;
    let bestGap = Infinity;
    for (const entry of this.passersby) {
      if (entry.leaving || !this.actorHit(entry.actor, x, y)) continue;
      const gap = Math.abs(x - entry.actor.x);
      if (gap < bestGap) { best = entry; bestGap = gap; }
    }
    return best;
  }

  private onPointerMove(pointer: Phaser.Input.Pointer) {
    this.pointer = [pointer.worldX, pointer.worldY];
    this.updateCoords();
    if (this.blocked()) { this.rt.hud.setHover(null); return; }
    const target = this.pick(pointer.worldX, pointer.worldY);
    const exit = !target ? this.map.exits.find((entry) => !entry.interact && inRect(pointer.worldX, pointer.worldY, entry.rect) && this.rt.campaign.evaluate(entry.when)) : null;
    if (target) {
      const lift = target.kind === 'npc' || target.kind === 'encounter' ? 110 : 20;
      this.rt.hud.setHover(target.label, ...this.toScreen(target.x, target.y - lift));
    } else if (exit) this.rt.hud.setHover(exit.label, pointer.x, pointer.y - 12);
    else this.rt.hud.setHover(null);
    this.game.canvas.style.cursor = target || exit ? 'pointer' : 'default';
  }

  private onPointerDown(pointer: Phaser.Input.Pointer) {
    (document.activeElement as HTMLElement | null)?.blur?.();
    this.rt.unlockAudio();
    if (this.blocked()) return;
    this.clickAt(pointer.worldX, pointer.worldY);
  }

  /** Klick/Tippen auf einen Kartenpunkt (Kartenkoordinaten): Ziel ansteuern, Interaktionsziel oder Ausgang vormerken. */
  clickAt(x: number, y: number): boolean {
    if (this.blocked()) return false;
    const target = this.pick(x, y);
    this.pendingTarget = null;
    this.pendingExit = null;
    if (target) {
      if (this.inRange(target)) { this.path = []; this.hideClickMarker(); this.interact(target); return true; }
      this.pendingTarget = target;
      return this.walkTo([target.x, target.y]);
    }
    const passerby = this.pickPasserby(x, y);
    if (passerby && distance([passerby.actor.x, passerby.actor.y], [this.player.x, this.player.y]) <= BARK_RADIUS * 0.6) {
      return this.bark(passerby, this.time.now, true) !== null;
    }
    const exit = this.map.exits.find((entry) => !entry.interact && inRect(x, y, entry.rect));
    if (exit) this.pendingExit = exit;
    const ok = this.walkTo([x, y]);
    if (ok) this.showClickMarker(this.path[this.path.length - 1]);
    return ok;
  }

  private showClickMarker(at: Point | undefined) {
    const marker = this.clickMarker;
    if (!marker || !at) return;
    marker.setPosition(at[0], at[1]).setVisible(true).setAlpha(1).setScale(1);
    if (!this.rt.settings.get().reducedMotion) {
      this.tweens.killTweensOf(marker);
      this.tweens.add({ targets: marker, scale: { from: 1.5, to: 1 }, duration: 220, ease: 'Quad.easeOut' });
    }
  }

  private hideClickMarker() { this.clickMarker?.setVisible(false); }

  /** Test-Hook: aktuell gezeigter Hintergrund (Texturschlüssel, inkl. Variante). */
  backgroundShown(): string { return this.bgKey; }

  followerPositions(): { id: string; x: number; y: number }[] {
    return this.followers.map((entry) => ({ id: entry.id, x: Math.round(entry.actor.x), y: Math.round(entry.actor.y) }));
  }

  npcPositions(): { id: NpcId; x: number; y: number; source: string }[] {
    return this.npcActors.map((entry) => ({ id: entry.presence.npc, x: Math.round(entry.actor.x), y: Math.round(entry.actor.y), source: entry.presence.source }));
  }

  /** Test-Hook: Passanten mit Position und aktueller Sprechblase. */
  passerbyPositions(): { id: string; sprite: string; x: number; y: number; bubble: string | null }[] {
    return this.passersby.filter((entry) => !entry.leaving).map((entry) => ({ id: entry.plan.id, sprite: entry.actor.key, x: Math.round(entry.actor.x), y: Math.round(entry.actor.y), bubble: entry.bubble?.text ?? null }));
  }

  /** Test-Hook: Passant sprechen lassen (ohne ID: der nächste). Liefert den Spruch oder null. */
  passerbyBark(id?: string): string | null {
    const entry = id
      ? this.passersby.find((other) => other.plan.id === id && !other.leaving)
      : [...this.passersby].filter((other) => !other.leaving).sort((a, b) => distance([a.actor.x, a.actor.y], [this.player.x, this.player.y]) - distance([b.actor.x, b.actor.y], [this.player.x, this.player.y]))[0];
    return entry ? this.bark(entry, this.time.now, true) : null;
  }

  /** Test-Hook: sichtbare Weltbeschriftungen (Namensschilder, Aktionslabel, Sprechblasen, Ziel). */
  worldLabels(): { id: string; kind: string; text: string }[] {
    return this.labels?.list() ?? [];
  }

  /** Test-Hook: Zielmarker (Kartenpunkt, Art) oder null. */
  objectiveShown(): { x: number; y: number; kind: string; label: string } | null {
    const target = this.objective;
    return target ? { x: Math.round(target.point[0]), y: Math.round(target.point[1]), kind: target.kind, label: target.label } : null;
  }

  /** Test-Hook: Tageszeit-Färbung und sichtbare Lichtpunkte. */
  lightingView(): { tint: number; alpha: number; lights: number; darkness: boolean } {
    return {
      tint: this.tint?.fillColor ?? 0,
      alpha: Math.round((this.tint?.fillAlpha ?? 0) * 100) / 100,
      lights: this.lightImages.filter((entry) => entry.base > 0).length,
      darkness: !!this.darkness,
    };
  }

  cameraView(): { x: number; y: number; w: number; h: number } {
    const view = this.cameras.main.worldView;
    return { x: Math.round(view.x), y: Math.round(view.y), w: Math.round(view.width), h: Math.round(view.height) };
  }

  isWalkable(x: number, y: number): boolean { return this.nav.walkable(x, y); }

  navSourceName(): string { return this.nav.source; }

  probePath(x: number, y: number): { end: [number, number]; miss: number; steps: number } {
    const path = this.nav.findPath([this.player.x, this.player.y], [x, y]);
    const end: [number, number] = path.length ? [path[path.length - 1][0], path[path.length - 1][1]] : [this.player.x, this.player.y];
    const tenth = (value: number) => Math.round(value * 10) / 10;
    return { end: [tenth(end[0]), tenth(end[1])], miss: tenth(Math.hypot(end[0] - x, end[1] - y)), steps: path.length };
  }

  walkTo(point: Point): boolean {
    this.path = this.nav.findPath([this.player.x, this.player.y], point);
    if (!this.path.length && !this.pendingTarget) this.pendingExit = null;
    if (!this.path.length) this.hideClickMarker();
    return this.path.length > 0;
  }

  // ---------------------------------------------------------------- Interaktion

  inRange(target: Interactable): boolean {
    if (target.kind === 'exit') {
      const [x, y, w, h] = target.exit.rect;
      const dx = Math.max(x - this.player.x, 0, this.player.x - (x + w));
      const dy = Math.max(y - this.player.y, 0, this.player.y - (y + h));
      return Math.hypot(dx, dy) <= 44;
    }
    return Math.hypot(target.x - this.player.x, target.y - this.player.y) <= target.radius;
  }

  private interactFocused() {
    if (this.focused) this.interact(this.focused);
  }

  interact(target: Interactable) {
    this.path = [];
    this.hideClickMarker();
    this.pendingTarget = null;
    this.player.setWalking(false);
    const dx = target.x - this.player.x;
    const dy = target.y - this.player.y;
    if (Math.hypot(dx, dy) > 2) this.player.setFacing(facingFrom(dx, dy, this.player.facing));
    if (target.kind === 'npc' || target.kind === 'encounter') {
      const actor = target.actor.actor;
      actor.setWalking(false);
      if (target.kind === 'encounter' || !target.actor.presence.pose) actor.setFacing(facingFrom(this.player.x - actor.x, this.player.y - actor.y, actor.facing));
      if (target.kind === 'encounter') target.actor.armed = false;
      if (target.kind === 'encounter' && target.group.id.startsWith(RANDOM_GROUP_PREFIX)) this.spentGroups.add(target.group.id);
    }
    this.saveLocation();
    this.rt.interact(target);
  }

  /** Test-Hook: Interaktion per ID (Hotspot, NPC-ID, Ausgang, 'bed', 'encounter:<id>'), ohne hinzulaufen. */
  interactById(id: string): boolean {
    const target = this.interactables.find((entry) => entry.id === id) ?? this.interactables.find((entry) => entry.id === `encounter:${id}`);
    if (!target) return false;
    this.interact(target);
    return true;
  }

  visibleInteractables(): { id: string; kind: string; label: string; x: number; y: number; inRange: boolean }[] {
    return this.interactables.map((entry) => ({ id: entry.id, kind: entry.kind === 'hotspot' ? entry.hotspot.kind : entry.kind, label: entry.label, x: Math.round(entry.x), y: Math.round(entry.y), inRange: this.inRange(entry) }));
  }

  // ---------------------------------------------------------------- Passanten

  /** Spruch eines Passanten als Sprechblase; `forced` ignoriert Abstand und Pause (Antippen, Test-Hook). */
  private bark(entry: Passerby, now: number, forced: boolean): string | null {
    const memory = BARK_MEMORY.get(this.map.id) ?? new Set<string>();
    BARK_MEMORY.set(this.map.id, memory);
    const campaign = this.rt.campaign;
    const text = pickBark(this.map.ambient?.barks, (condition) => campaign.evaluate(condition), memory, Math.random, this.lastBark) ?? (forced ? '…' : null);
    entry.nextBark = now + nextBarkDelay(Math.random);
    if (!text) return null;
    this.lastBark = text;
    entry.bubble = { text, until: now + bubbleDuration(text) };
    if (forced || distance([entry.actor.x, entry.actor.y], [this.player.x, this.player.y]) < 160) {
      entry.actor.setWalking(false);
      entry.actor.setFacing(facingFrom(this.player.x - entry.actor.x, this.player.y - entry.actor.y, entry.actor.facing));
    }
    if (forced) this.rt.audio.sfx('talk');
    return text;
  }

  private updatePassersby(time: number, dt: number) {
    const player: Point = [this.player.x, this.player.y];
    let bubbles = this.passersby.filter((entry) => entry.bubble && entry.bubble.until > time).length;
    const quiet = this.blocked();
    for (const entry of this.passersby) {
      if (entry.bubble && entry.bubble.until <= time) entry.bubble = null;
      const near = distance([entry.actor.x, entry.actor.y], player);
      // Wer gerade spricht und nah bei der Spielfigur steht, bleibt stehen.
      if (entry.bubble && near < 160 && !entry.leaving) { entry.actor.setWalking(false); continue; }
      const step = stepRoute(entry.walker, [entry.actor.x, entry.actor.y], entry.plan.speed * dt, time);
      if (step.walking) {
        entry.actor.setPosition(step.x, step.y);
        entry.actor.setFacing(facingFrom(step.dx, step.dy, entry.actor.facing, FACING_HYSTERESIS));
      }
      entry.actor.setWalking(step.walking);
      if (quiet || entry.leaving || entry.bubble || time < entry.nextBark || bubbles >= BUBBLE_MAX) continue;
      if (near > BARK_RADIUS || !onScreen(this.toScreen(entry.actor.x, entry.actor.y), -20)) continue;
      if (this.voiceActive) continue; // gesprochene Sätze haben Vorrang vor stummen Sprüchen
      if (this.bark(entry, time, false)) bubbles++;
    }
    this.updateVoices(time, quiet);
  }

  // ---------------------------------------------------------------- Hintergrundstimmen

  private isQuietZone(): boolean {
    return /kanal|oednis|staub/.test(`${this.map.district} ${this.map.id}`);
  }

  private updateVoices(time: number, quiet: boolean) {
    if (quiet) { this.stopVoice(); return; }
    if (!this.voiceBank || this.voiceActive || time < this.voiceNext) return;
    const player: Point = [this.player.x, this.player.y];
    const near = this.passersby
      .filter((entry) => !entry.leaving && !entry.bubble && onScreen(this.toScreen(entry.actor.x, entry.actor.y), -20))
      .map((entry) => ({ entry, d: distance([entry.actor.x, entry.actor.y], player) }))
      .filter((item) => item.d <= VOICE_FIELD * 6)
      .sort((a, b) => a.d - b.d)
      .slice(0, 2);
    if (!near.length) { this.voiceNext = time + 1500; return; }
    const heard = VOICE_HEARD;
    const campaign = this.rt.campaign;
    const snippet = pickSnippet(this.voiceBank, {
      district: this.map.district, zone: this.map.id, speakers: near.length,
      test: (condition) => campaign.evaluate(condition), heard, last: this.voiceLast, random: Math.random,
    });
    if (!snippet) { this.voiceNext = time + 20000; return; }
    heard.add(snippet.id);
    this.voiceLast = snippet.id;
    const run = ++this.voiceRun;
    let current: { stop(): void } | null = null;
    const control = { stop: () => { this.voiceRun++; current?.stop(); for (const item of near) item.entry.bubble = null; } };
    this.voiceActive = control;
    const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
    void (async () => {
      for (let i = 0; i < snippet.lines.length; i++) {
        if (run !== this.voiceRun || !this.scene.isActive()) return;
        const line = snippet.lines[i];
        const speaker = near[i % near.length].entry;
        const d = distance([speaker.actor.x, speaker.actor.y], [this.player.x, this.player.y]);
        const pan = Math.max(-0.6, Math.min(0.6, (speaker.actor.x - this.player.x) / 400));
        const boost = this.map.ambience === 'club' ? 1.25 : 1;
        speaker.bubble = { text: line.text, until: this.time.now + line.durationMs + 400 };
        speaker.actor.setWalking(false);
        speaker.actor.setFacing(facingFrom(this.player.x - speaker.actor.x, this.player.y - speaker.actor.y, speaker.actor.facing));
        const handle = this.rt.audio.voice(line.file, { gain: Math.min(1, voiceGain(d) * boost), pan });
        current = handle;
        await Promise.race([handle?.ended ?? wait(line.durationMs), wait(line.durationMs + 1500)]);
        if (run !== this.voiceRun) return;
        await wait(i < snippet.lines.length - 1 ? 250 : 0);
      }
      if (run === this.voiceRun) {
        this.voiceActive = null;
        this.voiceNext = this.time.now + voiceCooldown(this.isQuietZone(), Math.random);
      }
    })();
  }

  private stopVoice() {
    if (!this.voiceActive) return;
    this.voiceActive.stop();
    this.voiceActive = null;
    this.voiceNext = this.time.now + 4000;
  }

  // ---------------------------------------------------------------- Reisen

  saveLocation() {
    this.rt.campaign.setLocation(this.map.id, [Math.round(this.player.x), Math.round(this.player.y)], this.player.facing);
  }

  flushPlayTime() {
    this.rt.flushPlayTime(this.playAccum);
    this.playAccum = 0;
  }

  /**
   * Ausblenden, Ort setzen (kostet `minutes` Spielzeit, Standard 10), Szene neu starten.
   * Resolves nach dem Einblenden der Zielkarte – oder sofort, wenn die Szene vorher beendet wird.
   */
  leave(to: MapId, entryId?: string, minutes?: number): Promise<void> {
    const target = Object.prototype.hasOwnProperty.call(this.rt.content.maps, to) ? this.rt.content.maps[to] : null;
    if (!target) return Promise.resolve();
    this.leaving = true;
    this.path = [];
    this.hideClickMarker();
    this.player.setWalking(false);
    for (const follower of this.followers) follower.actor.setWalking(false);
    this.labels?.setVisible(false);
    const entry = (entryId && target.entries[entryId]) || Object.values(target.entries)[0] || { at: [target.size[0] / 2, target.size[1] / 2] as Point, facing: 's' as Facing };
    const reduced = this.rt.settings.get().reducedMotion;
    return new Promise((resolve) => {
      const onShutdown = () => resolve();
      this.events.once(Phaser.Scenes.Events.SHUTDOWN, onShutdown);
      const go = () => {
        this.events.off(Phaser.Scenes.Events.SHUTDOWN, onShutdown);
        this.flushPlayTime();
        this.rt.campaign.setLocation(to, entry.at, entry.facing, minutes === undefined ? undefined : { minutes });
        this.rt.awaitExplore().then(() => resolve());
        this.scene.restart();
      };
      if (reduced) { go(); return; }
      this.cameras.main.fadeOut(280, 0, 0, 0);
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, go);
    });
  }

  private checkExits() {
    const x = this.player.x;
    const y = this.player.y;
    const inside = this.map.exits.find((exit) => !exit.interact && inRect(x, y, exit.rect));
    if (!inside) {
      this.exitsArmed = true;
      this.lockedExit = null;
      return;
    }
    if (!this.exitsArmed) return;
    if (!this.rt.campaign.evaluate(inside.when)) {
      if (this.lockedExit !== inside.id) {
        this.lockedExit = inside.id;
        this.rt.shell.toast(inside.lockedText ?? 'Hier geht es noch nicht weiter.', 'info');
        this.path = [];
        this.pendingExit = null;
      }
      return;
    }
    this.exitsArmed = false;
    this.path = [];
    this.pendingExit = null;
    this.rt.useExit(inside);
  }

  /** Gegnergruppe berührt: einmal je Annäherung (nach Flucht erst wieder nach Verlassen des Radius). */
  private checkGroups() {
    for (const target of this.interactables) {
      if (target.kind !== 'encounter') continue;
      const inside = Math.hypot(target.x - this.player.x, target.y - this.player.y) <= target.radius * 0.75;
      if (!inside) { target.actor.armed = true; continue; }
      if (target.actor.armed) { this.interact(target); return; }
    }
  }

  // ---------------------------------------------------------------- Schleife

  update(time: number, delta: number) {
    if (!this.ready) return;
    const dt = Math.min(delta, 50) / 1000;
    this.playAccum += delta;
    if (this.playAccum > 5000) { this.rt.flushPlayTime(this.playAccum); this.playAccum = 0; }

    const blocked = this.blocked();
    if (!blocked) {
      this.clockAccum += delta;
      if (this.clockAccum >= MS_PER_GAME_MINUTE) {
        const minutes = Math.floor(this.clockAccum / MS_PER_GAME_MINUTE);
        this.clockAccum -= minutes * MS_PER_GAME_MINUTE;
        this.rt.tickClock(minutes);
      }
    }
    let moved = false;
    let dx = 0;
    let dy = 0;
    if (!blocked) {
      const vector = this.rt.input.moveVector();
      if (vector.x || vector.y) {
        this.path = [];
        this.hideClickMarker();
        this.pendingTarget = null;
        this.pendingExit = null;
        dx = vector.x * SPEED * dt;
        dy = vector.y * SPEED * dt;
      } else if (this.path.length) {
        const [tx, ty] = this.path[0];
        const gap = Math.hypot(tx - this.player.x, ty - this.player.y);
        const step = SPEED * dt;
        if (gap <= step) {
          dx = tx - this.player.x;
          dy = ty - this.player.y;
          this.path.shift();
          if (!this.path.length) this.hideClickMarker();
        } else {
          dx = ((tx - this.player.x) / gap) * step;
          dy = ((ty - this.player.y) / gap) * step;
        }
      }
      if (dx || dy) moved = this.tryMove(dx, dy);
      if (this.path.length === 0 && this.pendingTarget) {
        const target = this.pendingTarget;
        this.pendingTarget = null;
        if (this.inRange(target) || Math.hypot(target.x - this.player.x, target.y - this.player.y) <= target.radius + 52) this.interact(target);
        else this.rt.shell.toast('Da komme ich nicht hin.', 'info', 1800);
      } else if (this.pendingTarget && this.inRange(this.pendingTarget) && this.path.length <= 1) {
        const target = this.pendingTarget;
        this.pendingTarget = null;
        this.interact(target);
      }
      if (this.path.length === 0 && this.pendingExit && !moved) {
        const exit = this.pendingExit;
        this.pendingExit = null;
        if (!inRect(this.player.x, this.player.y, exit.rect)) {
          if (this.rt.campaign.evaluate(exit.when)) this.rt.useExit(exit);
          else this.rt.shell.toast(exit.lockedText ?? 'Hier geht es noch nicht weiter.', 'info');
        }
      }
    }
    if (moved) {
      this.player.setFacing(facingFrom(dx, dy, this.player.facing, FACING_HYSTERESIS));
      this.player.setWalking(true);
      this.stepTimer -= delta;
      if (this.stepTimer <= 0) { this.rt.audio.sfx('step'); this.stepTimer = 340; }
      const last = this.trail[this.trail.length - 1];
      if (!last || Math.hypot(last[0] - this.player.x, last[1] - this.player.y) >= 3) {
        this.trail.push([this.player.x, this.player.y]);
        if (this.trail.length > 600) this.trail.splice(0, this.trail.length - 600);
      }
    } else {
      this.player.setWalking(false);
      if (this.wasMoving) this.saveLocation();
    }
    this.wasMoving = moved;

    this.updateFollowers();
    this.updateWalkers(time, dt, blocked);
    this.updatePassersby(time, dt);
    if (!blocked) { this.checkExits(); this.checkGroups(); }
    this.updateFocus(blocked);
    this.updateOccluders(dt);
    this.updateLights(time);
    if (this.darkness) this.updateDarkness(time);
    this.breathe(time);
    this.updateObjectiveArrow();
    this.updateLabels(blocked);
    if (debugOverlay) { this.drawDebugDynamic(); if (moved) this.updateCoords(); }
  }

  private breathe(time: number) {
    const reduced = this.rt.settings.get().reducedMotion;
    this.player.breathe(time, reduced);
    for (const follower of this.followers) follower.actor.breathe(time, reduced);
    for (const npc of this.npcActors) npc.actor.breathe(time, reduced);
    for (const group of this.groups) group.actor.breathe(time, reduced);
    for (const passerby of this.passersby) passerby.actor.breathe(time, reduced);
  }

  private tryMove(dx: number, dy: number): boolean {
    const { x, y } = this.player;
    const walkable = (px: number, py: number) => this.nav.walkable(px, py);
    if (walkable(x + dx, y + dy)) { this.player.setPosition(x + dx, y + dy); return true; }
    if (dx && walkable(x + dx, y)) { this.player.setPosition(x + dx, y); return true; }
    if (dy && walkable(x, y + dy)) { this.player.setPosition(x, y + dy); return true; }
    const length = Math.hypot(dx, dy);
    for (const angle of [0.6, -0.6, 1.1, -1.1]) {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const nx = (dx * cos - dy * sin) * 0.8;
      const ny = (dx * sin + dy * cos) * 0.8;
      if (length > 0 && walkable(x + nx, y + ny)) { this.player.setPosition(x + nx, y + ny); return true; }
    }
    this.path = [];
    this.hideClickMarker();
    return false;
  }

  private trailPoint(gap: number): Point {
    return pointAlong(this.trail, gap, [this.player.x, this.player.y]);
  }

  private updateFollowers() {
    const saved = this.trail.length;
    this.trail.push([this.player.x, this.player.y]);
    this.followers.forEach((follower, index) => {
      const [x, y] = this.trailPoint((index + 1) * FOLLOWER_SPACING);
      const dx = x - follower.actor.x;
      const dy = y - follower.actor.y;
      const moving = Math.hypot(dx, dy) > 0.3;
      if (moving) {
        follower.actor.setFacing(facingFrom(dx, dy, follower.actor.facing, FACING_HYSTERESIS));
        follower.actor.setPosition(x, y);
      }
      follower.actor.setWalking(moving && this.wasMoving);
    });
    this.trail.length = saved;
  }

  private stepActor(actor: Actor, walker: RouteWalker, speed: number, dt: number, time: number) {
    const step = stepRoute(walker, [actor.x, actor.y], speed * dt, time);
    if (step.walking) {
      actor.setPosition(step.x, step.y);
      actor.setFacing(facingFrom(step.dx, step.dy, actor.facing, FACING_HYSTERESIS));
    }
    actor.setWalking(step.walking);
    return step;
  }

  /**
   * Figuren (Ortswechsel und Patrouille), weggehende Figuren und Gegnergruppen. Während Dialogen, Menüs und
   * Kämpfen steht die Welt still (wie die Uhr).
   */
  private updateWalkers(time: number, dt: number, blocked: boolean) {
    if (blocked) {
      for (const npc of this.npcActors) npc.actor.setWalking(false);
      for (const npc of this.leavingNpcs) npc.actor.setWalking(false);
      for (const group of this.groups) group.actor.setWalking(false);
    } else {
      for (const npc of this.npcActors) {
        if (!npc.walker || npc.presence.pose) continue;
        this.stepActor(npc.actor, npc.walker, npc.transit ? NPC_WALK_SPEED : PATROL_SPEED, dt, time);
        if (npc.transit && npc.walker.finished) {
          npc.transit = false;
          npc.actor.setFacing(npc.presence.facing);
          npc.walker = this.patrolWalker(npc.presence.patrol, [npc.actor.x, npc.actor.y]);
        }
      }
      for (const npc of this.leavingNpcs) {
        if (npc.fading) continue;
        this.stepActor(npc.actor, npc.walker, NPC_WALK_SPEED, dt, time);
        if (npc.walker.finished || time > npc.until) {
          npc.fading = true;
          npc.actor.setWalking(false);
          this.tweens.add({
            targets: npc.actor.sprite, alpha: 0, duration: 400,
            onComplete: () => { npc.actor.destroy(); this.leavingNpcs = this.leavingNpcs.filter((other) => other !== npc); },
          });
        }
      }
      for (const group of this.groups) if (group.walker && group.actor.sprite.visible) this.stepActor(group.actor, group.walker, PATROL_SPEED, dt, time);
    }
    for (const entry of this.interactables) {
      if (entry.kind === 'npc' || entry.kind === 'encounter') { entry.x = entry.actor.actor.x; entry.y = entry.actor.actor.y; }
    }
  }

  private updateFocus(blocked: boolean) {
    let best: Interactable | null = null;
    let bestDistance = Infinity;
    if (!blocked) {
      for (const target of this.interactables) {
        if (!this.inRange(target)) continue;
        const gap = Math.hypot(target.x - this.player.x, target.y - this.player.y);
        if (gap < bestDistance) { best = target; bestDistance = gap; }
      }
    }
    // Vergleich mit dem zuletzt angezeigten Ziel: refreshWorld kann `focused` verwerfen (Figur geht weg).
    if (best !== this.hinted || (best && this.rt.hud.hintText() === null)) {
      for (const [id, marker] of this.markers) {
        const glow = marker.getData('glow') as Phaser.GameObjects.Graphics;
        const isFocus = !!best && (id === best.id || id === `exit:${best.id}`);
        glow.setVisible(isFocus);
        marker.setAlpha(isFocus ? 1 : 0.8);
      }
      this.hinted = best;
      this.rt.hud.setHint(best ? best.label : null, this.actionKey());
    }
    this.focused = best;
    if (blocked && this.rt.hud.hintText() !== null) this.rt.hud.setHint(null);
  }

  private actionKey() { return this.rt.touch ? '⬤' : 'E'; }

  // ---------------------------------------------------------------- Weltbeschriftungen

  /** Kopfhöhe einer Figur (Kartenpixel) für Schilder und Sprechblasen. */
  private headY(actor: Actor): number {
    const info = actor.info;
    if (info && info.rows >= 4) return actor.y - info.foot[1] * 0.8 - 10;
    return actor.sprite.getBounds().top - 6;
  }

  /** Namensschilder beim Nähern, Aktionslabel am fokussierten Ziel, Sprechblasen, Zieltext – als DOM über der Karte. */
  private updateLabels(blocked: boolean) {
    const labels = this.labels;
    if (!labels) return;
    const visible = !blocked && !this.paused && this.rt.mode === 'explore';
    labels.setVisible(visible);
    if (!visible) return;
    const player: Point = [this.player.x, this.player.y];
    const focused = this.focused;
    const key = this.actionKey();
    const specs: WorldLabelSpec[] = [];
    const candidates = this.interactables
      .filter((entry): entry is Extract<Interactable, { kind: 'npc' | 'encounter' }> => entry.kind === 'npc' || entry.kind === 'encounter')
      .map((entry) => ({ id: entry.id, x: entry.actor.actor.x, y: entry.actor.actor.y, entry }));
    this.nameplates = nearbyNameplates(player, candidates, this.nameplates);
    for (const candidate of candidates) {
      const isFocus = focused?.id === candidate.id && focused.kind === candidate.entry.kind;
      if (!this.nameplates.has(candidate.id) && !isFocus) continue;
      const actor = candidate.entry.actor.actor;
      const at = this.toScreen(actor.x, this.headY(actor));
      if (!onScreen(at, 40)) continue;
      if (candidate.entry.kind === 'npc') {
        const presence = candidate.entry.actor.presence;
        const name = clampLabel(this.rt.campaign.displayName(presence.npc));
        specs.push({ id: `name:${candidate.id}`, kind: 'name', text: name, at, ...(isFocus ? { sub: presence.pose ? 'Ansehen' : 'Sprechen', key } : {}) });
      } else {
        const name = clampLabel(this.rt.content.encounters[candidate.entry.group.encounter]?.name ?? 'Gegner');
        specs.push({ id: `name:${candidate.id}`, kind: 'enemy', text: name, at, ...(isFocus ? { sub: 'Kampf', key } : {}) });
      }
    }
    if (focused && focused.kind !== 'npc' && focused.kind !== 'encounter') {
      const prop = focused.kind === 'hotspot' ? this.props.get(focused.id) : undefined;
      const top = prop ? prop.sprite.getBounds().top - 4 : focused.y - 40;
      const at = this.toScreen(focused.x, top);
      if (onScreen(at, 40)) specs.push({ id: `action:${focused.kind}:${focused.id}`, kind: 'action', text: clampLabel(focused.label, 40), key, at });
    }
    for (const entry of this.passersby) {
      if (!entry.bubble || entry.leaving) continue;
      const at = this.toScreen(entry.actor.x, this.headY(entry.actor) - 4);
      if (onScreen(at, 60)) specs.push({ id: `bubble:${entry.plan.id}`, kind: 'bubble', text: entry.bubble.text, at });
    }
    const target = this.objective;
    // Zieltext in der Nähe, aber nicht, wenn die Spielfigur schon darauf steht (würde sie verdecken).
    const gap = target ? distance(player, target.point) : Infinity;
    if (target && this.objectiveText && gap < 320 && gap > 80) {
      const at = this.toScreen(target.point[0], target.point[1] - this.objectiveLift(target) - 22);
      if (onScreen(at, 0)) specs.push({ id: 'objective', kind: 'objective', text: this.objectiveText, at });
    }
    labels.sync(specs);
  }
}
