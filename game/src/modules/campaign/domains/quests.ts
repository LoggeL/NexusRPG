// Domäne „Quests und Aufträge“: Status, Schritte, Belohnungen, Auftragstafel (design.md §3.5).
// Zuständig: Bereich quests+economy. Die Rechenregeln liegen in modules/quests und modules/jobs; diese Datei schreibt
// sie in den Entwurf (Effekte, Nachlauf, Fassaden-Aktionen) und prüft das Speicherformat.
import type {
  Effect, GameContent, GameState, JobBoardId, JobOffer, JobState, QuestId, QuestState, QuestStatus,
} from '../../contracts';
import {
  acceptedCredits, availableJobOffers, expiredJobs, jobBoardRules, jobCompletionReward, jobTitle as titleOf, jobsForEncounter,
} from '../../jobs';
import { questProgress, questStatusOf as statusOf, rewardEffects as effectsOf } from '../../quests';
import { asList, has } from '../ids';
import type { ConditionSpecs, EffectContext, EffectSpecs, SettleHook } from '../registry';
import { SAVE_LIMITS, fail, int, isKey, isObj, obj, record, uniqueList } from '../validate';
import { count, removeItem } from './core';

export const questStatusOf = (state: Readonly<GameState>, quest: QuestId): QuestStatus => statusOf(state, quest);

/** Effekte einer Belohnung (Reihenfolge: XP, Credits, Gegenstände, Beziehungen, Ruf, Zusatzeffekte). */
export const rewardEffects = effectsOf;

export function startQuestIn(ctx: EffectContext, quest: QuestId): string | null {
  const def = has(ctx.content.quests, quest) ? ctx.content.quests[quest] : undefined;
  if (!def) return `Unbekannte Quest: ${quest}`;
  if (has(ctx.draft.quests, quest)) return null;
  ctx.draft.quests[quest] = { status: 'active', steps: [], startedDay: ctx.draft.clock.day };
  ctx.messages.push(`Neue Quest: ${def.title}`);
  if (ctx.draft.tracked === null) ctx.draft.tracked = quest;
  return null;
}

/**
 * Effekte im Nachlauf: Ein Nachlauf kann nicht abgelehnt werden. Damit eine einzelne kaputte Belohnung nicht den Rest
 * verschluckt, läuft jeder Effekt für sich; Ablehnungen erscheinen als Meldung.
 */
function runTolerant(ctx: EffectContext, effects: readonly Effect[]): void {
  for (const effect of effects) {
    const problem = ctx.run([effect]);
    if (problem) ctx.messages.push(problem);
  }
}

function finishQuest(ctx: EffectContext, quest: QuestId, status: 'done' | 'failed'): QuestState | null {
  const current = ctx.draft.quests[quest];
  if (current && current.status !== 'active') return null;
  const next: QuestState = {
    status,
    steps: current?.steps ?? [],
    startedDay: current?.startedDay ?? ctx.draft.clock.day,
    endedDay: ctx.draft.clock.day,
  };
  ctx.draft.quests[quest] = next;
  if (ctx.draft.tracked === quest) ctx.draft.tracked = null;
  return next;
}

/** Quest abschließen und belohnen; `tolerant` im Nachlauf (Belohnungsfehler brechen nichts ab). */
export function completeQuestIn(ctx: EffectContext, quest: QuestId, tolerant = false): string | null {
  const def = has(ctx.content.quests, quest) ? ctx.content.quests[quest] : undefined;
  if (!def) return `Unbekannte Quest: ${quest}`;
  if (!finishQuest(ctx, quest, 'done')) return null;
  ctx.messages.push(`Quest abgeschlossen: ${def.title}`);
  ctx.requests.push({ sfx: 'success' });
  if (tolerant) { runTolerant(ctx, rewardEffects(def.reward)); return null; }
  return ctx.run(rewardEffects(def.reward));
}

export function failQuestIn(ctx: EffectContext, quest: QuestId): string | null {
  const def = has(ctx.content.quests, quest) ? ctx.content.quests[quest] : undefined;
  if (!def) return `Unbekannte Quest: ${quest}`;
  if (!finishQuest(ctx, quest, 'failed')) return null;
  ctx.messages.push(`Quest gescheitert: ${def.title}`);
  ctx.requests.push({ sfx: 'fail' });
  return null;
}

function markStep(ctx: EffectContext, quest: QuestId, step: string, tolerant = false): string | null {
  const def = has(ctx.content.quests, quest) ? ctx.content.quests[quest] : undefined;
  const stepDef = def?.steps.find(entry => entry.id === step);
  if (!def || !stepDef) return `Unbekannter Questschritt: ${quest}/${step}`;
  const current = ctx.draft.quests[quest];
  if (!current || current.status !== 'active' || current.steps.includes(step)) return null;
  current.steps.push(step);
  if (tolerant) { runTolerant(ctx, stepDef.effects ?? []); return null; }
  return ctx.run(stepDef.effects ?? []);
}

/**
 * Nachlauf: Auto-Start, Scheitern, Schritte festhalten (sobald `when` und `done` gelten), automatischer Abschluss.
 * Läuft nach jeder vollständigen Zustandsänderung; Folgeschritte rasten in der nächsten Runde ein.
 */
export const questSettle: SettleHook = (ctx) => {
  let changed = false;
  for (const def of Object.values(ctx.content.quests)) {
    if (!has(ctx.draft.quests, def.id) && def.autoStart && ctx.evaluate(def.autoStart)) {
      if (!startQuestIn(ctx, def.id)) changed = true;
    }
    const current = ctx.draft.quests[def.id];
    if (!current || current.status !== 'active') continue;
    const progress = questProgress(def, current, ctx.evaluate);
    if (progress.fail) { failQuestIn(ctx, def.id); changed = true; continue; }
    for (const step of progress.steps) { markStep(ctx, def.id, step, true); changed = true; }
    if (progress.complete && ctx.draft.quests[def.id]?.status === 'active') { completeQuestIn(ctx, def.id, true); changed = true; }
  }
  return changed;
};

// ---------------------------------------------------------------------------
// Auftragstafel: 3 Angebote je Tag und Tafel, deterministisch aus Seed und Tag (Regeln in modules/jobs)

/** Höchstzahl gleichzeitig offener Aufträge (Grenze des Speicherformats). */
export const MAX_ACTIVE_JOBS = 50;

export const jobOffersFor = (content: GameContent, state: Readonly<GameState>, board: JobBoardId, evaluate: EffectContext['evaluate']): JobOffer[] =>
  availableJobOffers(content, state, board, evaluate);

export function acceptJobIn(ctx: EffectContext, offer: JobOffer): string | null {
  const template = has(ctx.content.jobs, offer.template) ? ctx.content.jobs[offer.template] : undefined;
  if (!template) return 'Unbekannter Auftrag.';
  if (ctx.draft.jobs.active.some(entry => entry.template === offer.template)) return 'Diesen Auftrag hast du schon angenommen.';
  if (ctx.draft.jobs.active.length >= MAX_ACTIVE_JOBS) return `Höchstens ${MAX_ACTIVE_JOBS} offene Aufträge.`;
  const { credits, firstBonus } = acceptedCredits(ctx.content, ctx.draft, offer);
  const jobs = ctx.draft.jobs;
  if (jobs.day !== ctx.draft.clock.day) { jobs.day = ctx.draft.clock.day; jobs.taken = []; }
  jobs.taken.push(offer.id);
  jobs.active.push({ ...offer, credits });
  ctx.messages.push(`Auftrag angenommen: ${titleOf(ctx.content, offer)}`);
  if (firstBonus) ctx.messages.push(`Erster Auftrag des Tages: ${credits} statt ${offer.credits} Credits`);
  if (template.item) return ctx.run([{ give: template.item }]);
  return null;
}

/** Titel mit eingesetzten Platzhaltern {ziel} und {credits}. */
export const jobTitle = titleOf;

function completeJobIn(ctx: EffectContext, templateId: string): string | null {
  const jobs = ctx.draft.jobs;
  const index = jobs.active.findIndex(offer => offer.template === templateId);
  if (index < 0) return 'Kein offener Auftrag dieser Art.';
  const offer = jobs.active[index];
  const reward = jobCompletionReward(ctx.content, ctx.draft, offer);
  jobs.active.splice(index, 1);
  jobs.completed = Math.min(SAVE_LIMITS.counter, jobs.completed + 1);
  ctx.messages.push(`Auftrag erledigt: ${titleOf(ctx.content, offer)}`);
  ctx.requests.push({ sfx: 'success' });
  const effects: Effect[] = [{ credits: reward.credits }];
  if (reward.xp) effects.push({ xp: reward.xp });
  for (const [rep, delta] of Object.entries(reward.rep)) effects.push({ rep, delta });
  return ctx.run(effects);
}

/** Schließt nach einem Sieg alle offenen Aufträge ab, deren Vorlage diese Begegnung nennt (für die Kampfabrechnung). */
export function completeJobsForEncounterIn(ctx: EffectContext, encounter: string): string | null {
  for (const template of jobsForEncounter(ctx.content, ctx.draft, encounter)) {
    const problem = completeJobIn(ctx, template);
    if (problem) return problem;
  }
  return null;
}

/**
 * Nachlauf: Aufträge, deren Frist abgelaufen ist, verfallen – Kurierpaket zurück, Rufverlust bei der Tafel-Fraktion.
 */
export const jobSettle: SettleHook = (ctx) => {
  const expired = expiredJobs(ctx.content, ctx.draft);
  if (!expired.length) return false;
  for (const offer of expired) dropJobIn(ctx, offer, 'Auftrag verfallen');
  return true;
};

/** Offenen Auftrag entfernen: Meldung, Kurierpaket zurück (falls kein anderer Auftrag es braucht), Rufverlust. */
function dropJobIn(ctx: EffectContext, offer: JobOffer, reason: string): boolean {
  const index = ctx.draft.jobs.active.findIndex(entry => entry.id === offer.id);
  if (index < 0) return false;
  ctx.draft.jobs.active.splice(index, 1);
  ctx.messages.push(`${reason}: ${titleOf(ctx.content, offer)}`);
  const template = has(ctx.content.jobs, offer.template) ? ctx.content.jobs[offer.template] : undefined;
  const item = template?.item;
  const stillNeeded = item && ctx.draft.jobs.active.some(entry => ctx.content.jobs[entry.template]?.item === item);
  if (item && !stillNeeded && count(ctx.draft, item) > 0) removeItem(ctx.content, ctx.draft, item, 1);
  const rules = jobBoardRules(ctx.content, offer.board);
  if (rules.faction && rules.failRep > 0) runTolerant(ctx, [{ rep: rules.faction, delta: -rules.failRep }]);
  return true;
}

/** Effekt `failJob`: offenen Auftrag dieser Vorlage scheitern lassen. */
export function failJobIn(ctx: EffectContext, templateId: string): string | null {
  const offer = ctx.draft.jobs.active.find(entry => entry.template === templateId);
  if (!offer) return 'Kein offener Auftrag dieser Art.';
  dropJobIn(ctx, offer, 'Auftrag gescheitert');
  ctx.requests.push({ sfx: 'fail' });
  return null;
}

// ---------------------------------------------------------------------------
// Handler

export const questConditions: ConditionSpecs<'quest' | 'questStep' | 'job'> = {
  quest: { test: (c, { state }) => asList(c.state).includes(questStatusOf(state, c.quest)), refs: c => [{ kind: 'quests', id: c.quest }] },
  questStep: {
    test: (c, { state }) => has(state.quests, c.questStep) && state.quests[c.questStep].steps.includes(c.step),
    refs: c => [{ kind: 'questStep', id: `${c.questStep}/${c.step}` }],
  },
  job: { test: (c, { state }) => state.jobs.active.some(offer => offer.template === c.job), refs: c => [{ kind: 'jobs', id: c.job }] },
};

export const questEffects: EffectSpecs<
  'startQuest' | 'completeQuest' | 'failQuest' | 'questStep' | 'jobBoard' | 'completeJob' | 'failJob'
> = {
  startQuest: { apply: (e, ctx) => startQuestIn(ctx, e.startQuest), refs: e => [{ kind: 'quests', id: e.startQuest }] },
  completeQuest: { apply: (e, ctx) => completeQuestIn(ctx, e.completeQuest), refs: e => [{ kind: 'quests', id: e.completeQuest }] },
  failQuest: { apply: (e, ctx) => failQuestIn(ctx, e.failQuest), refs: e => [{ kind: 'quests', id: e.failQuest }] },
  questStep: { apply: (e, ctx) => markStep(ctx, e.questStep, e.step), refs: e => [{ kind: 'questStep', id: `${e.questStep}/${e.step}` }] },
  jobBoard: {
    apply(e, { requests }) {
      if (!isKey(e.jobBoard)) return 'Ungültige Auftragstafel.';
      requests.push({ jobBoard: e.jobBoard });
      return null;
    },
  },
  completeJob: {
    apply: (e, ctx) => completeJobIn(ctx, e.completeJob),
    refs: e => [{ kind: 'jobs', id: e.completeJob }],
  },
  failJob: {
    apply: (e, ctx) => failJobIn(ctx, e.failJob),
    refs: e => [{ kind: 'jobs', id: e.failJob }],
  },
};

// ---------------------------------------------------------------------------
// Speicherformat

export function parseQuests(value: unknown, content: GameContent): Record<QuestId, QuestState> {
  return record(value, 'Quests', key => has(content.quests, key), (raw, key) => {
    const q = obj(raw, `Quest ${key}`);
    if (q.status !== 'active' && q.status !== 'done' && q.status !== 'failed') fail(`Ungültiger Status: ${key}`);
    const steps = content.quests[key].steps.map(step => step.id);
    const state: QuestState = {
      status: q.status,
      steps: uniqueList(q.steps, steps.length, id => typeof id === 'string' && steps.includes(id), `Schritte ${key}`),
      startedDay: int(q.startedDay, 1, SAVE_LIMITS.day, `Starttag ${key}`),
    };
    if (q.endedDay !== undefined) state.endedDay = int(q.endedDay, 1, SAVE_LIMITS.day, `Endtag ${key}`);
    return state;
  });
}

function parseOffer(value: unknown, content: GameContent): JobOffer {
  if (!isObj(value) || !isKey(value.id) || typeof value.template !== 'string' || !has(content.jobs, value.template) || !isKey(value.board)) {
    fail('Ungültiger Auftrag.');
  }
  const v = value as Record<string, unknown>;
  const template = content.jobs[v.template as string];
  return {
    id: v.id as string,
    template: v.template as string,
    board: v.board as string,
    target: int(v.target, 0, Math.max(0, template.targets.length - 1), 'Auftragsziel'),
    credits: int(v.credits, 0, 1_000_000, 'Auftragslohn'),
  };
}

export function parseJobs(value: unknown, content: GameContent): JobState {
  const j = obj(value, 'Aufträge');
  if (!Array.isArray(j.active) || j.active.length > MAX_ACTIVE_JOBS) fail('Ungültige offene Aufträge.');
  const active = (j.active as unknown[]).map(entry => parseOffer(entry, content));
  if (new Set(active.map(offer => offer.template)).size !== active.length) fail('Doppelte offene Aufträge.');
  return {
    day: int(j.day, 0, SAVE_LIMITS.day, 'Auftragstag'),
    taken: uniqueList(j.taken, 100, isKey, 'angenommene Aufträge'),
    active,
    completed: int(j.completed, 0, SAVE_LIMITS.counter, 'erledigte Aufträge'),
  };
}
