// Kampagnen-Fassade: einziger Ort, an dem der Spielzustand verändert wird.
// Regeln liegen in den Domänen (domains/*.ts); diese Datei verbindet sie mit Speicher, Abonnenten und Nachlauf.
import type {
  ActId, AttributeId, BattleResult, CampaignOptions, CampaignPort, CampaignResult, CharacterInput, CheckEvaluation,
  CheckRef, Condition, Effect, EffectOutcome, GameContent, GameState, GiftResult, ItemId, JobOffer, NewsDef,
  MinigameRequest, NpcId, ObjectiveView, Point, QuestView, SaveStoragePort, SpeakerId,
} from '../contracts';
import { characterSheet as characterSheetOf, passiveSources, perkStatus as perkStatusOf } from '../character';
import { remainingBuffs } from '../checks';
import { shopView as shopViewOf } from '../economy';
import { jobBoardView } from '../jobs';
import { newsBulletin as newsBulletinOf } from '../news';
import { factionStandings as factionStandingsOf } from '../reputation';
import { relationView } from '../relationships';
import { whereIs as whereIsOf } from '../time';
import { checkSeenKey, checkXp, evaluateCheck, resolveCheck } from './checks';
import { evaluateCondition } from './conditions';
import {
  addXp, applyCharacter, effectiveAttribute, equipIn, healPlayer, learnPerkIn, maxHpOf, spendAttributeIn, unequipIn,
  validateCharacter,
} from './domains/character';
import { installCyberwareIn, uninstallCyberwareIn } from './domains/character';
import { advanceClockIn, sleepIn, timeSlotOf, weekdayOf } from './domains/clock';
import { finishBattleIn } from './domains/combat';
import { finishMinigameIn } from './domains/minigames';
import { count, itemName, markSeenIn, removeItem } from './domains/core';
import { buyIn, pricesOf, sellIn, sellPrice as sellPriceOf } from './domains/economy';
import { acceptJobIn, jobOffersFor } from './domains/quests';
import { allJobBoards } from '../jobs';
import { currentNews as currentNewsOf } from '../news';
import { objectiveOf, questLog, questMarkers as questMarkersOf } from '../quests';
import {
  GIFT_TASTE_LABELS, findHeartEvent, giftBlocked, giftKnowledgeKey, giftTasteOf, giftValueOf, heartsWith, knownGiftItems, markHeartEventIn,
  pendingHeartEventOf, recordGiftIn, relationOf, rivalryOf, talkDialogue, talkIn,
} from './domains/relations';
import { normalizeParty, partyProblem } from '../relationships';
import { presentNpcsOn } from './domains/schedule';
import { createEffectContext, settle } from './effects';
import { MAP_CHANGE_MINUTES, SUBWAY_MINUTES, has } from './ids';
import { displayName, portraitKey } from './names';
import type { EffectContext } from './registry';
import { parseSave, serializeState } from './save';
import { cloneState, createActState, createInitialState, deepFreeze } from './state';
import { SAVE_LIMITS } from './validate';

export { evaluateCondition } from './conditions';
export { checkLabel, checkSeenKey, checkXp, evaluateCheck, missingText, resolveCheck } from './checks';
export { choiceKeyPart, choiceSeenKey } from './dialogueKeys';
export { fastTravelDestination, findContentProblems } from './lint';
export { parseSave, serializeState, SAVE_LIMITS, SAVE_VERSION } from './save';
export { createActState, createInitialState, entryPoint } from './state';
export { enterSeenKey, runEnterTriggers } from './triggers';
export type { EnterTriggerHost } from './triggers';
export { displayName, fillName, portraitKey } from './names';
export { dailyHotspotFlag, formatClock, timeSlotOf, weekdayOf, DAILY_FLAG_PREFIX, WEEKLY_FLAG_PREFIX, CYCLE_FLAG_PREFIX } from './domains/clock';
export { heartsOf, rivalryOf, GIFT_POINTS } from './domains/relations';
export { levelForXp, xpForLevel, maxHpOf, effectiveAttribute } from './domains/character';
export { jobTitle } from './domains/quests';
export { CONDITION_SPECS } from './conditions';
export { EFFECT_SPECS, SETTLE_HOOKS } from './effects';
export * from './ids';

/** Spielzeit, nach der ein Autosave auch ohne andere Änderung geschrieben wird. */
export const PLAYTIME_SAVE_INTERVAL_MS = 10_000;

export interface Campaign extends CampaignPort {
  /** true, wenn beim Erzeugen ein gültiger Autosave geladen wurde. */
  readonly restored: boolean;
  /** Schreibt den Autosave sofort (z. B. beim Verlassen der Seite). */
  saveNow(): void;
  /** Grund der letzten Ablehnung von `importSave`, sonst null. */
  lastImportError(): string | null;
  lastImportNotes(): readonly string[];
}

/** Standard-Anfahrt eines per Telefon gerufenen Begleiters (world.md: 30 Minuten). */
export const DEFAULT_CALL_MINUTES = 30;

const EMPTY_OUTCOME = (): EffectOutcome => ({ requests: [], messages: [] });
const result = (ok: boolean, message: string, outcome: EffectOutcome = EMPTY_OUTCOME()): CampaignResult => ({ ok, message, outcome });

export function createCampaign(content: GameContent, options: CampaignOptions = {}): Campaign {
  const storage: SaveStoragePort | null = options.storage ?? null;
  const random = options.random ?? Math.random;
  const listeners = new Set<(state: Readonly<GameState>) => void>();
  const newSeed = () => (options.seed ?? Math.floor(random() * 0xffffffff)) >>> 0;
  let state: Readonly<GameState> = deepFreeze(createInitialState(content, newSeed()));
  let unsavedMs = 0;
  let dirty = false;
  let importError: string | null = null;
  let importNotes: readonly string[] = [];
  let restored = false;
  /** Zuletzt erfolgreich geschriebener (bzw. beim Start gelesener) Spielstand. */
  let lastSynced: string | null = null;

  if (storage) {
    let raw: string | null = null;
    try { raw = storage.read(); } catch { raw = null; }
    if (raw) {
      const parsed = parseSave(raw, content);
      if ('state' in parsed) { state = deepFreeze(parsed.state); restored = true; lastSynced = raw; }
    }
  }

  const persist = () => {
    dirty = false;
    unsavedMs = 0;
    if (!storage) return;
    const raw = serializeState(state);
    try { storage.write(raw); lastSynced = raw; } catch { /* Speicher voll oder gesperrt: Spiel läuft weiter. */ }
  };

  const notify = () => { for (const listener of [...listeners]) listener(state); };

  const commit = (draft: GameState) => {
    state = deepFreeze(draft);
    persist();
    notify();
  };

  /** Leichte Änderung ohne Nachlauf (Laufen, Uhrminuten): benachrichtigen, Speichern gedrosselt. */
  const light = (draft: GameState) => {
    state = deepFreeze(draft);
    dirty = true;
    notify();
  };

  const evaluate = (condition?: Condition) => evaluateCondition(content, state, condition);

  /**
   * Führt `change` auf einem Entwurf aus. Ablehnung (Text) verwirft den Entwurf; sonst Nachlauf und Übernahme.
   * Liefert die gesammelten Anfragen und Meldungen.
   */
  const mutate = (change: (ctx: EffectContext) => string | null | void, success = ''): CampaignResult => {
    const draft = cloneState(state);
    const ctx = createEffectContext(content, draft, random);
    const problem = change(ctx);
    if (typeof problem === 'string') return result(false, problem, { requests: [], messages: [problem] });
    settle(ctx);
    commit(draft);
    return result(true, success || ctx.messages[0] || '', { requests: [...ctx.requests], messages: [...ctx.messages] });
  };

  const apply = (effects: readonly Effect[]): EffectOutcome => {
    if (!effects || effects.length === 0) return EMPTY_OUTCOME();
    return mutate(ctx => ctx.run(effects)).outcome;
  };

  const requireCheckDef = (ref: CheckRef) => {
    const def = resolveCheck(content, ref);
    if (!def) throw new Error(`Unbekannter Check: ${typeof ref === 'string' ? ref : JSON.stringify(ref)}`);
    return def;
  };

  const evaluateCheckRef = (ref: CheckRef): CheckEvaluation => evaluateCheck(content, state, requireCheckDef(ref));

  const passCheck = (ref: CheckRef): { evaluation: CheckEvaluation; outcome: EffectOutcome } => {
    const def = requireCheckDef(ref);
    const evaluation = evaluateCheck(content, state, def);
    if (!evaluation.ok) return { evaluation, outcome: EMPTY_OUTCOME() };
    // Vorübergehende Boni verbraucht jedes Bestehen, das sie nutzt – auch ein wiederholtes ohne neue XP.
    if (evaluation.passedBefore && evaluation.consumes.length === 0) return { evaluation, outcome: EMPTY_OUTCOME() };
    const run = mutate((ctx) => {
      if (evaluation.consumes.length) {
        const left = remainingBuffs(ctx.draft.player.checkBuffs ?? [], evaluation.consumes, ctx.draft.clock.day);
        if (left.length) ctx.draft.player.checkBuffs = left;
        else delete ctx.draft.player.checkBuffs;
      }
      if (evaluation.passedBefore) return;
      markSeenIn(ctx.draft, checkSeenKey(def.id));
      ctx.draft.stats.checksPassed = Math.min(SAVE_LIMITS.counter, ctx.draft.stats.checksPassed + 1);
      ctx.requests.push({ sfx: 'success' });
      const xp = checkXp(def);
      if (xp > 0) addXp(ctx, xp);
    });
    return { evaluation, outcome: run.outcome };
  };

  const allBoards = (): string[] => allJobBoards(content);
  const offersOn = (board: string): JobOffer[] => jobOffersFor(content, state, board, evaluate);

  // Questlog und HUD-Ziel rechnet modules/quests (Lösungswege, übersprungene Schritte, verfolgte Quest).
  const quests = (): QuestView[] => questLog(content, state, evaluate);

  const objective = (): ObjectiveView | null => objectiveOf(content, state, evaluate);

  const campaign: Campaign = {
    content,
    get restored() { return restored; },
    state: () => state,
    subscribe(listener) {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    evaluate,
    apply,

    // ------------------------------------------------------------ Spielfigur
    createCharacter(input: CharacterInput) {
      const problem = validateCharacter(content, input);
      if (problem) return result(false, problem);
      return mutate(ctx => applyCharacter(ctx, input), `Willkommen in Noxius, ${input.name.trim()}.`);
    },
    spendAttribute: (attribute: AttributeId) => mutate(ctx => {
      const maxBefore = maxHpOf(content, ctx.draft.player);
      const problem = spendAttributeIn(ctx.draft, attribute);
      if (problem) return problem;
      ctx.draft.player.hp += maxHpOf(content, ctx.draft.player) - maxBefore;
      return null;
    }, 'Attribut erhöht.'),
    learnPerk: (perk) => mutate(ctx => learnPerkIn(content, ctx.draft, perk), `Perk gelernt: ${content.perks[perk]?.name ?? perk}`),
    equip: (item) => mutate(ctx => equipIn(content, ctx.draft, item), `${itemName(content, item)}: Ausrüstung geändert.`),
    attribute: (attribute) => effectiveAttribute(content, state.player, attribute),
    maxHp: () => maxHpOf(content, state.player),
    installCyberwareAt: (shop, cyberware) => mutate(ctx => installCyberwareIn(ctx, cyberware, shop)),
    removeCyberwareAt: (shop, slot) => mutate(ctx => uninstallCyberwareIn(ctx, slot, shop)),
    unequip: slot => mutate(ctx => unequipIn(content, ctx.draft, slot), 'Abgelegt.'),
    perkStatus: perk => perkStatusOf(content, state.player, perk),
    characterSheet: () => characterSheetOf(content, state.player),
    useItem(item: ItemId) {
      const def = has(content.items, item) ? content.items[item] : undefined;
      if (!def) return result(false, 'Unbekannter Gegenstand.');
      if (count(state, item) <= 0) return result(false, `${def.name} ist nicht im Inventar.`);
      const use = def.use;
      if (!use || use.world === false) return result(false, def.inspect || `${def.name} lässt sich hier nicht benutzen.`);
      if (!evaluate(use.when)) return result(false, `${def.name} lässt sich gerade nicht benutzen.`);
      const heal = Math.max(0, Math.round(use.heal ?? 0));
      if (heal > 0 && !use.effects?.length && state.player.hp >= maxHpOf(content, state.player)) {
        return result(false, 'Du bist bereits bei voller Gesundheit.');
      }
      return mutate((ctx) => {
        if (heal > 0) {
          const healed = healPlayer(content, ctx.draft, heal);
          if (healed > 0) ctx.messages.push(`+${healed} LP`);
          ctx.requests.push({ sfx: 'heal' });
        }
        const problem = ctx.run(use.effects ?? []);
        if (problem) return problem;
        if (use.consumes ?? def.category === 'verbrauch') {
          const removed = removeItem(content, ctx.draft, item, 1);
          if (removed) return removed;
          ctx.messages.push(`Verbraucht: ${def.name}`);
        }
        return null;
      }, use.text ?? `${use.label}: ${def.name}`);
    },

    // ------------------------------------------------------------ Checks
    evaluateCheck: evaluateCheckRef,
    passCheck,

    // ------------------------------------------------------------ Beziehungen
    hearts: npc => heartsWith(content, state, npc),
    rivalry: npc => rivalryOf(relationOf(state, npc).points),
    talkTo(npc: NpcId) {
      if (!has(content.npcs, npc)) return { dialogue: null, outcome: EMPTY_OUTCOME() };
      const dialogue = talkDialogue(content, state, npc, evaluate);
      const run = mutate(ctx => talkIn(ctx, npc));
      return { dialogue, outcome: run.outcome };
    },
    giftTaste: (npc, item) => giftTasteOf(content, state, npc, item, evaluate),
    giveGift(npc: NpcId, item: ItemId): GiftResult {
      const refuse = (message: string): GiftResult => ({ ok: false, taste: null, delta: 0, message, outcome: { requests: [], messages: [message] } });
      const def = has(content.npcs, npc) ? content.npcs[npc] : undefined;
      const itemDef = has(content.items, item) ? content.items[item] : undefined;
      if (!def || !itemDef) return refuse('Das geht nicht.');
      if (count(state, item) <= 0) return refuse(`${itemDef.name} ist nicht im Inventar.`);
      if (itemDef.category === 'quest') return refuse(`${itemDef.name} wird noch gebraucht.`);
      const blocked = giftBlocked(state, npc);
      if (blocked) return refuse(blocked);
      // Punkte samt Boni (Perks, Geburtstag …) aus modules/relationships (GIFT_BONUS_HOOKS).
      const value = giftValueOf(content, state, npc, item, evaluate);
      const { taste, delta } = value;
      const message = `${displayName(content, state, npc)} ${GIFT_TASTE_LABELS[taste]}.`;
      const run = mutate((ctx) => {
        const problem = removeItem(content, ctx.draft, item, 1);
        if (problem) return problem;
        ctx.messages.push(message);
        recordGiftIn(ctx, npc, value);
        // Geschmack ist ab jetzt bekannt (Beziehungsliste, Geschenkmenü).
        markSeenIn(ctx.draft, giftKnowledgeKey(npc, item));
        return null;
      }, message);
      return { ok: run.ok, taste: run.ok ? taste : null, delta: run.ok ? delta : 0, message: run.message, outcome: run.outcome };
    },
    knownGiftTastes: npc => knownGiftItems(state, npc)
      .filter(item => has(content.items, item))
      .map(item => ({ item, taste: giftTasteOf(content, state, npc, item, evaluate) })),
    callCompanion(npc: NpcId) {
      const def = has(content.npcs, npc) ? content.npcs[npc] : undefined;
      if (!def?.companion) return result(false, 'Diese Figur gehört nicht zur Crew.');
      const name = displayName(content, state, npc);
      if (state.party.includes(npc)) return result(false, `${name} ist schon bei dir.`);
      const party = [...state.party, npc];
      const problem = partyProblem(content, state, party);
      if (problem) return result(false, problem);
      // Anfahrt: Figur (Standard 30 min), verkürzt durch passive Wirkungen (Perks, Cyberware, Kleidung).
      const limits = passiveSources(content, state.player)
        .map(source => source.effects.callMinutes)
        .filter((value): value is number => typeof value === 'number' && Number.isFinite(value) && value >= 0);
      const own = def.companion.callMinutesWhen?.find(entry => evaluate(entry.when))?.minutes ?? def.companion.callMinutes;
      const minutes = Math.round(Math.min(own ?? DEFAULT_CALL_MINUTES, ...limits));
      return mutate((ctx) => {
        ctx.draft.party = normalizeParty(party);
        if (minutes > 0) advanceClockIn(ctx, minutes);
        ctx.requests.push({ sfx: 'phone' });
        return null;
      }, minutes > 0 ? `${name} kommt (${minutes} Minuten).` : `${name} ist sofort da.`);
    },
    relation: npc => relationView(content, state, npc),
    whereIs: npc => whereIsOf(content, state, npc, evaluate),
    setParty(party) {
      const problem = partyProblem(content, state, party);
      if (problem) return result(false, problem);
      const list = normalizeParty(party);
      return mutate((ctx) => { ctx.draft.party = list; }, 'Party geändert.');
    },
    pendingHeartEvent: map => pendingHeartEventOf(content, state, map, evaluate),
    completeHeartEvent(id) {
      const found = findHeartEvent(content, id);
      if (!found) return EMPTY_OUTCOME();
      return mutate((ctx) => {
        markHeartEventIn(ctx.draft, found.npc, id);
        markSeenIn(ctx.draft, id);
        return ctx.run(found.event.effects ?? []);
      }).outcome;
    },

    // ------------------------------------------------------------ Zeit
    timeSlot: () => timeSlotOf(state.clock.minutes),
    weekday: () => weekdayOf(state.clock.day),
    advanceClock(minutes: number) {
      if (!Number.isFinite(minutes) || minutes <= 0) return EMPTY_OUTCOME();
      const draft = cloneState(state);
      const ctx = createEffectContext(content, draft, random);
      const slot = timeSlotOf(draft.clock.minutes);
      const day = draft.clock.day;
      advanceClockIn(ctx, Math.min(minutes, 24 * 60));
      if (draft.clock.day === day && timeSlotOf(draft.clock.minutes) === slot) { light(draft); return EMPTY_OUTCOME(); }
      settle(ctx);
      commit(draft);
      return { requests: [...ctx.requests], messages: [...ctx.messages] };
    },
    sleep: () => mutate(ctx => sleepIn(ctx)).outcome,
    presentNpcs: map => presentNpcsOn(content, state, map, evaluate),

    // ------------------------------------------------------------ Quests und Aufträge
    quests,
    objective,
    questMarkers: map => questMarkersOf(content, state, evaluate, map),
    jobBoard: board => jobBoardView(content, state, board, evaluate),
    track(quest) {
      if (quest !== null && (!has(state.quests, quest) || state.quests[quest].status !== 'active')) return;
      if (state.tracked === quest) return;
      const draft = cloneState(state);
      draft.tracked = quest;
      commit(draft);
    },
    jobOffers: offersOn,
    acceptJob(offerId) {
      const offer = allBoards().flatMap(offersOn).find(entry => entry.id === offerId);
      if (!offer) return result(false, 'Dieses Angebot gibt es nicht mehr.');
      return mutate(ctx => acceptJobIn(ctx, offer));
    },

    // ------------------------------------------------------------ Handel
    prices: shop => pricesOf(content, state, shop, evaluate),
    shopView: shop => shopViewOf(content, state, shop, evaluate),
    sellPrice(shop, item) {
      const def = has(content.shops, shop) ? content.shops[shop] : undefined;
      return def ? sellPriceOf(content, state, def, item, evaluate) : null;
    },
    factionStandings: () => factionStandingsOf(content, state),
    buy: (shop, item, qty = 1) => mutate(ctx => buyIn(ctx, shop, item, qty)),
    sell: (shop, item, qty = 1) => mutate(ctx => sellIn(ctx, shop, item, qty)),

    // ------------------------------------------------------------ Kampf
    finishBattle: (battle: BattleResult) => mutate(ctx => finishBattleIn(ctx, battle)).outcome,
    finishMinigame: (request: MinigameRequest, won: boolean) => mutate(ctx => finishMinigameIn(ctx, request, won)).outcome,

    // ------------------------------------------------------------ Welt
    fastTravel(station) {
      const def = has(content.stations, station) ? content.stations[station] : undefined;
      if (!def) return result(false, 'Unbekannte Station.');
      if (!state.stations.includes(station)) return result(false, `${def.name} ist noch nicht freigeschaltet.`);
      if (!evaluate(def.when)) return result(false, `${def.name} ist gerade nicht erreichbar.`);
      return mutate((ctx) => {
        advanceClockIn(ctx, SUBWAY_MINUTES);
        if (ctx.requests.some(request => 'sleep' in request)) return null; // Zusammenbruch unterwegs
        ctx.requests.push({ travel: def.map, entry: def.entry, minutes: 0 });
        return null;
      }, `U-Bahn nach ${def.name}`);
    },
    // Hauptmeldung nach Fortschritt (modules/news): ungesehene vor gesehenen, dann Priorität.
    currentNews: (): NewsDef | null => currentNewsOf(content, state, evaluate),
    newsBulletin: filter => newsBulletinOf(content, state, evaluate, filter),
    readPhone(id, reply) {
      const index = state.phone.findIndex(entry => entry.id === id);
      const def = content.phone[id];
      if (index < 0 || !def) return EMPTY_OUTCOME();
      return mutate((ctx) => {
        const entry = ctx.draft.phone[index];
        if (!entry.read) {
          entry.read = true;
          const problem = ctx.run(def.effects ?? []);
          if (problem) return problem;
        }
        if (reply !== undefined && entry.replied === undefined && def.replies?.[reply]) {
          entry.replied = reply;
          return ctx.run(def.replies[reply].effects ?? []);
        }
        return null;
      }).outcome;
    },

    // ------------------------------------------------------------ Anzeige
    displayName: (speaker: SpeakerId) => displayName(content, state, speaker),
    portraitKey: (speaker: SpeakerId, variant?: string) => portraitKey(content, state, speaker, variant),

    // ------------------------------------------------------------ Ort und Verlauf
    setLocation(map, position, facing, opts) {
      if (!has(content.maps, map)) return;
      const point: Point = [Math.round(position[0]), Math.round(position[1])];
      if (map === state.map) {
        // Laufen innerhalb einer Karte: Speichern gedrosselt über die Spielzeit.
        light({ ...cloneState(state), position: point, facing });
        return;
      }
      const draft = cloneState(state);
      draft.map = map;
      draft.position = point;
      draft.facing = facing;
      if (!draft.visited.includes(map)) draft.visited.push(map);
      const ctx = createEffectContext(content, draft, random);
      const minutes = opts?.minutes ?? MAP_CHANGE_MINUTES;
      if (minutes > 0) advanceClockIn(ctx, minutes);
      settle(ctx);
      commit(draft);
    },
    markSeen(id: string) {
      if (!id || state.seen.includes(id) || state.seen.length >= SAVE_LIMITS.seen) return;
      const draft = cloneState(state);
      draft.seen.push(id);
      const cut = has(content.cutscenes, id) ? content.cutscenes[id] : undefined;
      const pictured = cut && (cut.gallery ?? cut.beats.some(beat => beat.image && beat.image !== 'black'));
      if (pictured && !draft.gallery.includes(id)) draft.gallery.push(id);
      commit(draft);
    },
    hasSeen: id => state.seen.includes(id),
    addPlayTime(ms: number) {
      if (!Number.isFinite(ms) || ms <= 0) return;
      const step = Math.min(ms, 60_000);
      state = Object.freeze({ ...state, playTimeMs: Math.min(SAVE_LIMITS.playTimeMs, state.playTimeMs + step) });
      unsavedMs += step;
      if (unsavedMs >= PLAYTIME_SAVE_INTERVAL_MS || (dirty && unsavedMs >= PLAYTIME_SAVE_INTERVAL_MS / 4)) persist();
    },
    newGame() {
      commit(createInitialState(content, newSeed()));
    },
    warpAct(act: ActId) {
      commit(createActState(content, act, newSeed()));
    },
    exportSave: () => serializeState(state),
    importSave(raw: string) {
      if (lastSynced !== null && raw === lastSynced) {
        // Der eigene, zuletzt geschriebene Stand (z. B. „Zum Titel“ → „Fortsetzen“): behalten und jetzt schreiben.
        importError = null;
        importNotes = [];
        commit(cloneState(state));
        return true;
      }
      const parsed = parseSave(raw, content);
      if ('error' in parsed) { importError = parsed.error; return false; }
      importError = null;
      importNotes = parsed.notes;
      commit(parsed.state);
      return true;
    },
    saveNow: persist,
    lastImportError: () => importError,
    lastImportNotes: () => importNotes,
  };
  return campaign;
}
