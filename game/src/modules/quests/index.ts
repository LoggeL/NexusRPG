// Quests (design.md §3.5): Zustände, Schritte mit `done`-Bedingungen, Lösungswege, optionale Schritte, Fehlschlag,
// Belohnungen, Zielmarker und das aktive Ziel fürs HUD. Reine Rechnungen; geschrieben wird nur in
// campaign/domains/quests.ts (Effekte und Nachlauf). Zuständig: Bereich quests+economy.
//
// Lösungswege („alternative Schritte“) ohne eigenes Vertragsfeld:
//   - einfach: ein Schritt mit `done: { any: [...] }` – erledigt, sobald einer der Wege gilt;
//   - sichtbar im Questlog: optionale Schritte je Weg plus ein Pflichtschritt mit
//     `done: { any: [{ questStep: '<quest>', step: '<weg-a>' }, { questStep: '<quest>', step: '<weg-b>' }] }`.
//     Die Weg-Schritte gelten dann als Alternativen des Pflichtschritts: Sobald einer erledigt ist, sind die anderen
//     „übersprungen“, und das HUD zeigt solange alle offenen Wege als „oder“.
import { has } from '../campaign/ids';
import type {
  Condition, Effect, GameContent, GameState, MapId, ObjectiveView, Point, QuestDef, QuestId, QuestKind, QuestReward,
  QuestState, QuestStatus, QuestStepDef, QuestView,
} from '../contracts';

export type Evaluate = (condition?: Condition) => boolean;

export const QUEST_KIND_LABELS: Readonly<Record<QuestKind, string>> = {
  main: 'Hauptquest', side: 'Nebenquest', job: 'Auftrag', personal: 'Persönlich',
};
export const QUEST_STATUS_LABELS: Readonly<Record<QuestStatus, string>> = {
  inactive: 'Nicht begonnen', active: 'Aktiv', done: 'Abgeschlossen', failed: 'Gescheitert',
};
/** Reihenfolge für das automatische Ziel, wenn keine Quest verfolgt wird. */
export const QUEST_KIND_ORDER: Readonly<Record<QuestKind, number>> = { main: 0, personal: 1, side: 2, job: 3 };
const STATUS_ORDER = { active: 0, done: 1, failed: 2 } as const;

export const questStatusOf = (state: Readonly<GameState>, quest: QuestId): QuestStatus =>
  has(state.quests, quest) ? state.quests[quest].status : 'inactive';

// ---------------------------------------------------------------------------
// Belohnungen

/** Effekte einer Belohnung (Reihenfolge: XP, Credits, Gegenstände, Beziehungen, Ruf, Zusatzeffekte). */
export function rewardEffects(reward: QuestReward | undefined): Effect[] {
  if (!reward) return [];
  return [
    ...(reward.xp ? [{ xp: reward.xp }] : []),
    ...(reward.credits ? [{ credits: reward.credits }] : []),
    ...Object.entries(reward.items ?? {}).map(([give, qty]): Effect => ({ give, qty })),
    ...Object.entries(reward.relations ?? {}).map(([relation, delta]): Effect => ({ relation, delta })),
    ...Object.entries(reward.rep ?? {}).map(([rep, delta]): Effect => ({ rep, delta })),
    ...(reward.effects ?? []),
  ];
}

const signed = (value: number): string => `${value < 0 ? '−' : '+'}${Math.abs(Math.round(value))}`;

/** Lesbare Belohnungszeilen fürs Questlog: „120 XP“, „50 Credits“, „Datenchip ×2“, „Raven ♥ +40“, „Hunters Crew +5“. */
export function rewardLines(content: GameContent, reward: QuestReward | undefined): string[] {
  if (!reward) return [];
  const lines: string[] = [];
  if (reward.xp) lines.push(`${reward.xp} XP`);
  if (reward.credits) lines.push(`${reward.credits} Credits`);
  for (const [item, qty] of Object.entries(reward.items ?? {})) {
    const name = has(content.items, item) ? content.items[item].name : item;
    lines.push(qty > 1 ? `${name} ×${qty}` : name);
  }
  for (const [npc, delta] of Object.entries(reward.relations ?? {})) {
    lines.push(`${has(content.npcs, npc) ? content.npcs[npc].name : npc} ♥ ${signed(delta)}`);
  }
  for (const [faction, delta] of Object.entries(reward.rep ?? {})) {
    lines.push(`${has(content.factions, faction) ? content.factions[faction].name : faction} ${signed(delta)}`);
  }
  return lines;
}

// ---------------------------------------------------------------------------
// Lösungswege

/** Schritt-IDs derselben Quest, auf die `done` als Lösungsweg (`any` aus `questStep`) verweist. */
export function stepAlternatives(quest: QuestDef, step: QuestStepDef): string[] {
  const done = step.done as Condition | undefined;
  if (!done || typeof done !== 'object' || !('any' in done) || !Array.isArray(done.any)) return [];
  const ids: string[] = [];
  for (const option of done.any) {
    if (!option || typeof option !== 'object' || !('questStep' in option)) continue;
    if (option.questStep !== quest.id || option.step === step.id) continue;
    if (quest.steps.some(entry => entry.id === option.step) && !ids.includes(option.step)) ids.push(option.step);
  }
  return ids;
}

/** Zu welchen Pflichtschritten ein Schritt ein Lösungsweg ist. */
export function alternativeParents(quest: QuestDef, stepId: string): string[] {
  return quest.steps.filter(step => stepAlternatives(quest, step).includes(stepId)).map(step => step.id);
}

// ---------------------------------------------------------------------------
// Fortschritt (vom Nachlauf in campaign/domains/quests.ts angewandt)

export interface QuestProgress {
  /** Fehlschlag-Bedingung erfüllt (geht allem anderen vor). */
  fail: boolean;
  /** Neu erledigte Schritte in Inhaltsreihenfolge. */
  steps: string[];
  /** Alle Pflichtschritte erledigt und `autoComplete` nicht abgeschaltet. */
  complete: boolean;
}

/**
 * Was sich an einer aktiven Quest jetzt ändern würde. Ein Schritt rastet ein, sobald er sichtbar (`when`) und
 * erledigt (`done`) ist; erledigte Schritte bleiben erledigt, auch wenn `done` später nicht mehr gilt.
 */
export function questProgress(quest: QuestDef, entry: Readonly<QuestState>, evaluate: Evaluate): QuestProgress {
  if (entry.status !== 'active') return { fail: false, steps: [], complete: false };
  if (quest.fail && evaluate(quest.fail)) return { fail: true, steps: [], complete: false };
  const steps = quest.steps
    .filter(step => !entry.steps.includes(step.id) && evaluate(step.when) && evaluate(step.done))
    .map(step => step.id);
  const done = new Set([...entry.steps, ...steps]);
  const required = quest.steps.filter(step => !step.optional);
  const complete = quest.autoComplete !== false && required.length > 0 && required.every(step => done.has(step.id));
  return { fail: false, steps, complete };
}

// ---------------------------------------------------------------------------
// Questlog

export type StepState = 'open' | 'done' | 'skipped';

export interface QuestStepView {
  step: QuestStepDef;
  done: boolean;
  /** 'skipped': nicht mehr nötig (anderer Lösungsweg erledigt oder Quest beendet). */
  state: StepState;
  /** Lösungswege dieses Schritts (siehe Kopfkommentar). */
  alternatives: string[];
  /** Pflichtschritte, zu denen dieser Schritt ein Lösungsweg ist. */
  alternativeOf: string[];
}

export interface QuestLogEntry extends QuestView {
  steps: QuestStepView[];
  kindLabel: string;
  statusLabel: string;
  tracked: boolean;
  /** Name des Auftraggebers (Anzeigename ohne Vorstellung bleibt Sache der Darstellung). */
  giver?: string;
  rewards: string[];
  startedDay: number;
  endedDay?: number;
}

/** Sichtbare Schritte einer gestarteten Quest mit Zustand (erledigt, offen, übersprungen). */
export function questStepViews(quest: QuestDef, entry: Readonly<QuestState>, evaluate: Evaluate): QuestStepView[] {
  const done = new Set(entry.steps);
  const alternatives = new Map(quest.steps.map(step => [step.id, stepAlternatives(quest, step)]));
  const skippedByAlternative = (id: string) =>
    quest.steps.some(other => other.id !== id && (alternatives.get(other.id) ?? []).includes(id) && done.has(other.id))
    || quest.steps.some(other => other.id !== id && done.has(other.id) && alternativeParents(quest, other.id).some(parent => alternativeParents(quest, id).includes(parent)));
  return quest.steps
    .filter(step => done.has(step.id) || evaluate(step.when))
    .map((step) => {
      const isDone = done.has(step.id);
      let state: StepState = isDone ? 'done' : 'open';
      if (!isDone && (entry.status !== 'active' || skippedByAlternative(step.id))) state = 'skipped';
      return { step, done: isDone, state, alternatives: alternatives.get(step.id) ?? [], alternativeOf: alternativeParents(quest, step.id) };
    });
}

/** Alle gestarteten Quests: aktive zuerst, dann abgeschlossene, dann gescheiterte; innerhalb in Startreihenfolge. */
export function questLog(content: GameContent, state: Readonly<GameState>, evaluate: Evaluate): QuestLogEntry[] {
  return Object.entries(state.quests)
    .filter(([id]) => has(content.quests, id))
    .map(([id, entry], index) => ({ id, entry, index }))
    .sort((a, b) => STATUS_ORDER[a.entry.status] - STATUS_ORDER[b.entry.status] || a.index - b.index)
    .map(({ id, entry }) => {
      const quest = content.quests[id];
      const view: QuestLogEntry = {
        quest,
        status: entry.status,
        steps: questStepViews(quest, entry, evaluate),
        kindLabel: QUEST_KIND_LABELS[quest.kind] ?? quest.kind,
        statusLabel: QUEST_STATUS_LABELS[entry.status],
        tracked: state.tracked === id,
        rewards: rewardLines(content, quest.reward),
        startedDay: entry.startedDay,
      };
      if (quest.giver && has(content.npcs, quest.giver)) view.giver = content.npcs[quest.giver].name;
      if (entry.endedDay !== undefined) view.endedDay = entry.endedDay;
      return view;
    });
}

// ---------------------------------------------------------------------------
// Aktives Ziel und Zielmarker

export interface ObjectiveDetail extends ObjectiveView {
  step: string;
  kind: QuestKind;
  optional: boolean;
  /** true, wenn das Ziel aus der verfolgten Quest stammt. */
  tracked: boolean;
  /** Offene Lösungswege („oder“), jeweils mit eigenem Marker. */
  alternatives: { step: string; text: string; marker?: { map: MapId; at?: Point } }[];
}

const openSteps = (views: QuestStepView[]) => views.filter(view => view.state === 'open');

/** Nächster offener Schritt einer Quest: zuerst Pflichtschritte, sonst optionale; Lösungswege zählen zum Pflichtschritt. */
function nextStep(views: QuestStepView[]): QuestStepView | undefined {
  const open = openSteps(views);
  return open.find(view => !view.step.optional && view.alternativeOf.length === 0)
    ?? open.find(view => !view.step.optional)
    ?? open.find(view => view.alternativeOf.length === 0)
    ?? open[0];
}

/**
 * Ziel fürs HUD: die verfolgte Quest, sonst die erste aktive nach Art (Haupt, Persönlich, Neben, Auftrag) und
 * Startreihenfolge. Hat eine verfolgte Quest gerade kein sichtbares offenes Ziel, greift die Automatik.
 */
export function objectiveOf(content: GameContent, state: Readonly<GameState>, evaluate: Evaluate): ObjectiveDetail | null {
  const active = questLog(content, state, evaluate).filter(view => view.status === 'active');
  const ordered = [
    ...active.filter(view => view.tracked),
    ...active.filter(view => !view.tracked).sort((a, b) => QUEST_KIND_ORDER[a.quest.kind] - QUEST_KIND_ORDER[b.quest.kind]),
  ];
  for (const view of ordered) {
    const open = nextStep(view.steps);
    if (!open) continue;
    const alternatives = open.alternatives
      .map(id => view.steps.find(entry => entry.step.id === id))
      .filter((entry): entry is QuestStepView => !!entry && entry.state === 'open')
      .map((entry) => {
        const out: ObjectiveDetail['alternatives'][number] = { step: entry.step.id, text: entry.step.text };
        if (entry.step.marker) out.marker = entry.step.marker;
        return out;
      });
    const detail: ObjectiveDetail = {
      quest: view.quest.id,
      title: view.quest.title,
      text: open.step.text,
      step: open.step.id,
      kind: view.quest.kind,
      optional: open.step.optional === true,
      tracked: view.tracked,
      alternatives,
    };
    const marker = open.step.marker ?? alternatives.find(entry => entry.marker)?.marker;
    if (marker) detail.marker = marker;
    return detail;
  }
  return null;
}

export interface QuestMarker {
  quest: QuestId;
  step: string;
  title: string;
  text: string;
  map: MapId;
  at?: Point;
  /** Gehört zur verfolgten Quest bzw. zum HUD-Ziel (hervorheben). */
  tracked: boolean;
  optional: boolean;
}

/** Zielmarker aller offenen, sichtbaren Schritte aktiver Quests (optional nur auf einer Karte). */
export function questMarkers(content: GameContent, state: Readonly<GameState>, evaluate: Evaluate, map?: MapId): QuestMarker[] {
  const objective = objectiveOf(content, state, evaluate);
  const markers: QuestMarker[] = [];
  for (const view of questLog(content, state, evaluate)) {
    if (view.status !== 'active') continue;
    for (const step of openSteps(view.steps)) {
      const marker = step.step.marker;
      if (!marker || (map !== undefined && marker.map !== map)) continue;
      const highlighted = objective !== null && objective.quest === view.quest.id
        && (objective.step === step.step.id || objective.alternatives.some(entry => entry.step === step.step.id));
      const out: QuestMarker = {
        quest: view.quest.id, step: step.step.id, title: view.quest.title, text: step.step.text, map: marker.map,
        tracked: highlighted, optional: step.step.optional === true,
      };
      if (marker.at) out.at = marker.at;
      markers.push(out);
    }
  }
  return markers;
}

// ---------------------------------------------------------------------------
// Inhaltsprüfung (ergänzt die Verweisprüfung in campaign/lint.ts)

export function questProblems(content: GameContent): string[] {
  const problems: string[] = [];
  for (const quest of Object.values(content.quests)) {
    const at = `Quest ${quest.id}`;
    if (!quest.steps.length) problems.push(`${at}: keine Schritte`);
    else if (quest.autoComplete !== false && quest.steps.every(step => step.optional)) {
      problems.push(`${at}: nur optionale Schritte – schließt nie automatisch ab (autoComplete: false setzen)`);
    }
    for (const step of quest.steps) {
      const alternatives = stepAlternatives(quest, step);
      if (alternatives.length && !step.optional) {
        for (const id of alternatives) {
          const alt = quest.steps.find(entry => entry.id === id);
          if (alt && !alt.optional) problems.push(`${at}/${id}: Lösungsweg von „${step.id}“ sollte optional sein`);
        }
      }
    }
    const reward = quest.reward;
    if (reward) {
      if (reward.xp !== undefined && !(Number.isInteger(reward.xp) && reward.xp >= 0)) problems.push(`${at}: ungültige XP-Belohnung`);
      if (reward.credits !== undefined && !Number.isInteger(reward.credits)) problems.push(`${at}: ungültige Credit-Belohnung`);
      for (const [item, qty] of Object.entries(reward.items ?? {})) {
        if (!(Number.isInteger(qty) && qty >= 1)) problems.push(`${at}: ungültige Menge für „${item}“`);
      }
    }
  }
  return problems;
}
