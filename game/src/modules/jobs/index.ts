// Auftragstafel (design.md §3.5, world.md 6.6): wiederholbare Aufträge aus Vorlagen, 3 pro Tag und Tafel,
// deterministisch aus Startwert, Tag und Tafel. Rang je Tafel (aus Fraktionsruf oder Stufe der Spielfigur) skaliert
// die Belohnung; der erste angenommene Auftrag des Tages bringt einen Bonus; offene Aufträge verfallen nach einer Frist.
// Reine Rechnungen; geschrieben wird nur in campaign/domains/quests.ts. Zuständig: Bereich quests+economy.
//
// Tafel-Regeln (`JobBoardDef`) kommen aus `GameContent.jobBoards` (Vertragswunsch, siehe docs/engine-notes.md);
// solange das Feld fehlt, gelten die Standardwerte unten für jede Tafel.
import { JOBS_PER_BOARD, LEVEL_MAX, clamp, has, hashText, seededRandom } from '../campaign/ids';
import type {
  Condition, Effect, EncounterId, FactionId, GameContent, GameState, ItemId, JobBoardId, JobKind, JobOffer, JobTemplateDef,
  JobTemplateId, MapId, Point,
} from '../contracts';
import { repOf } from '../reputation';

export type Evaluate = (condition?: Condition) => boolean;

export interface JobRank {
  /** Mindestruf (Tafel mit `faction`) bzw. Mindeststufe der Spielfigur (ohne `faction`). */
  min: number;
  /** „Laufbursche“, „Profi“ … */
  title: string;
}

/** Regeln einer Auftragstafel; alle Felder optional (Standardwerte siehe `DEFAULT_JOB_BOARD`). */
export interface JobBoardDef {
  name?: string;
  /** Rang aus dem Ruf bei dieser Fraktion; ohne Angabe aus der Stufe der Spielfigur. */
  faction?: FactionId;
  /** Aufsteigend; Rang 1 ist der erste Eintrag. */
  ranks?: readonly JobRank[];
  /** Angebote pro Tag (Standard 3). */
  slots?: number;
  /** Zusätzliche Angebote, solange die Bedingung gilt (z. B. Nachtauftrag ab Rang 3). */
  extraSlots?: readonly { when: Condition; count: number }[];
  /** Aufschlag für den ersten angenommenen Auftrag des Tages (Standard 0,25 = +25 %). */
  firstJobBonus?: number;
  /** Credits je Rang über 1 (Standard 0,25 = +25 %). */
  creditStep?: number;
  /** XP je Rang über 1 (Standard 0,1 = +10 %). */
  xpStep?: number;
  /** Angenommene Aufträge laufen bis Ende des Annahmetags plus so viele Tage (Standard 1 = bis 02:00 des Folgetags). */
  expiresAfterDays?: number;
  /** Rufverlust bei `faction`, wenn ein Auftrag verfällt (Standard 2). */
  failRep?: number;
}

/** Erweiterung von `GameContent`, bis `jobBoards` im Vertrag steht. */
export interface JobContentExtension { jobBoards?: Record<JobBoardId, JobBoardDef> }

export const DEFAULT_LEVEL_RANKS: readonly JobRank[] = [
  { min: 1, title: 'Rang 1' }, { min: 4, title: 'Rang 2' }, { min: 8, title: 'Rang 3' }, { min: 12, title: 'Rang 4' }, { min: 16, title: 'Rang 5' },
];
export const DEFAULT_REP_RANKS: readonly JobRank[] = [
  { min: 0, title: 'Rang 1' }, { min: 20, title: 'Rang 2' }, { min: 40, title: 'Rang 3' }, { min: 60, title: 'Rang 4' }, { min: 80, title: 'Rang 5' },
];

export interface ResolvedJobBoard {
  id: JobBoardId;
  name: string;
  faction: FactionId | null;
  ranks: readonly JobRank[];
  slots: number;
  extraSlots: readonly { when: Condition; count: number }[];
  firstJobBonus: number;
  creditStep: number;
  xpStep: number;
  expiresAfterDays: number;
  failRep: number;
}

export const DEFAULT_JOB_BOARD: Omit<ResolvedJobBoard, 'id' | 'name' | 'faction' | 'ranks'> = {
  slots: JOBS_PER_BOARD, extraSlots: [], firstJobBonus: 0.25, creditStep: 0.25, xpStep: 0.1, expiresAfterDays: 1, failRep: 2,
};

const boardDefs = (content: GameContent): Record<JobBoardId, JobBoardDef> =>
  (content as GameContent & JobContentExtension).jobBoards ?? {};

const nonNegative = (value: number | undefined, fallback: number): number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : fallback;

/** Regeln einer Tafel mit Standardwerten. */
export function jobBoardRules(content: GameContent, board: JobBoardId): ResolvedJobBoard {
  const def = has(boardDefs(content), board) ? boardDefs(content)[board] : {};
  const faction = def.faction && has(content.factions, def.faction) ? def.faction : null;
  return {
    id: board,
    name: def.name ?? 'Auftragstafel',
    faction,
    ranks: def.ranks?.length ? def.ranks : faction ? DEFAULT_REP_RANKS : DEFAULT_LEVEL_RANKS,
    slots: Math.floor(nonNegative(def.slots, DEFAULT_JOB_BOARD.slots)),
    extraSlots: def.extraSlots ?? [],
    firstJobBonus: nonNegative(def.firstJobBonus, DEFAULT_JOB_BOARD.firstJobBonus),
    creditStep: nonNegative(def.creditStep, DEFAULT_JOB_BOARD.creditStep),
    xpStep: nonNegative(def.xpStep, DEFAULT_JOB_BOARD.xpStep),
    expiresAfterDays: Math.floor(nonNegative(def.expiresAfterDays, DEFAULT_JOB_BOARD.expiresAfterDays)),
    failRep: nonNegative(def.failRep, DEFAULT_JOB_BOARD.failRep),
  };
}

/** Alle Tafeln, an denen Vorlagen hängen oder für die Regeln existieren. */
export function allJobBoards(content: GameContent): JobBoardId[] {
  return [...new Set([...Object.values(content.jobs).flatMap(job => job.boards), ...Object.keys(boardDefs(content))])];
}

export interface JobRankView {
  /** 1-basiert. */
  rank: number;
  title: string;
  /** Wert, auf dem der Rang beruht (Ruf oder Stufe). */
  value: number;
  basis: 'ruf' | 'stufe';
  /** Fehlender Wert bis zum nächsten Rang (null auf dem höchsten). */
  toNext: number | null;
}

export function jobRank(content: GameContent, state: Readonly<GameState>, board: JobBoardId, rules = jobBoardRules(content, board)): JobRankView {
  const basis = rules.faction ? 'ruf' : 'stufe';
  const value = rules.faction ? repOf(state, rules.faction) : clamp(state.player.level, 1, LEVEL_MAX);
  let index = 0;
  rules.ranks.forEach((rank, i) => { if (value >= rank.min) index = i; });
  const next = rules.ranks[index + 1];
  return { rank: index + 1, title: rules.ranks[index]?.title ?? `Rang ${index + 1}`, value, basis, toNext: next ? next.min - value : null };
}

/** Credits nach Rang: Basis × (1 + Schritt × (Rang − 1)). */
export const scaleJobCredits = (base: number, rank: number, rules: Pick<ResolvedJobBoard, 'creditStep'>): number =>
  Math.max(0, Math.round(base * (1 + rules.creditStep * Math.max(0, rank - 1))));
/** XP nach Rang: Basis × (1 + Schritt × (Rang − 1)). */
export const scaleJobXp = (base: number, rank: number, rules: Pick<ResolvedJobBoard, 'xpStep'>): number =>
  Math.max(0, Math.round(base * (1 + rules.xpStep * Math.max(0, rank - 1))));

// ---------------------------------------------------------------------------
// Angebote

const OFFER_ID = /@(\d+)#[^@#]+$/;

/** Kennung eines Angebots: `<tafel>@<tag>#<vorlage>` – stabil über den Tag, unabhängig von anderen Vorlagen. */
export const offerId = (board: JobBoardId, day: number, template: JobTemplateId): string => `${board}@${day}#${template}`;

/** Tag, an dem ein Angebot ausgehängt (und damit angenommen) wurde; null bei fremdem Format. */
export function offerDay(offer: Pick<JobOffer, 'id'>): number | null {
  const match = OFFER_ID.exec(offer.id);
  return match ? Number(match[1]) : null;
}

/**
 * Tagesangebote einer Tafel (ohne Rücksicht auf bereits Angenommenes). Jede Vorlage bekommt aus Startwert, Tag, Tafel
 * und eigener ID einen festen Rang, ein Ziel und einen Lohn; die ersten passenden (Bedingung `when`) werden ausgehängt.
 * Ändert sich eine Bedingung im Laufe des Tages, bleiben die übrigen Angebote unverändert.
 */
export function drawJobOffers(content: GameContent, state: Readonly<GameState>, board: JobBoardId, evaluate: Evaluate): JobOffer[] {
  const rules = jobBoardRules(content, board);
  const day = state.clock.day;
  const slots = rules.slots + rules.extraSlots.reduce((sum, extra) => sum + (evaluate(extra.when) ? Math.max(0, Math.floor(extra.count)) : 0), 0);
  if (slots <= 0) return [];
  const { rank } = jobRank(content, state, board, rules);
  const drawn = Object.values(content.jobs)
    .filter(template => template.boards.includes(board) && template.targets.length > 0)
    .map((template) => {
      const random = seededRandom(hashText(`${state.seed}:${day}:${board}:${template.id}`));
      return { template, order: random(), targetRoll: random(), creditRoll: random() };
    })
    .sort((a, b) => a.order - b.order || (a.template.id < b.template.id ? -1 : 1));
  const offers: JobOffer[] = [];
  for (const entry of drawn) {
    if (offers.length >= slots) break;
    if (!evaluate(entry.template.when)) continue;
    const [min, max] = entry.template.reward.credits;
    const base = Math.round(min + entry.creditRoll * Math.max(0, max - min));
    offers.push({
      id: offerId(board, day, entry.template.id),
      template: entry.template.id,
      board,
      target: Math.min(entry.template.targets.length - 1, Math.floor(entry.targetRoll * entry.template.targets.length)),
      credits: scaleJobCredits(base, rank, rules),
    });
  }
  return offers;
}

/** Was heute an der Tafel hängt: angenommene Angebote und Vorlagen mit offenem Auftrag fehlen. */
export function availableJobOffers(content: GameContent, state: Readonly<GameState>, board: JobBoardId, evaluate: Evaluate): JobOffer[] {
  const taken = state.jobs.day === state.clock.day ? state.jobs.taken : [];
  const active = new Set(state.jobs.active.map(offer => offer.template));
  return drawJobOffers(content, state, board, evaluate).filter(offer => !taken.includes(offer.id) && !active.has(offer.template));
}

/** Erster angenommener Auftrag des Tages (über alle Tafeln)? */
export const isFirstJobToday = (state: Readonly<GameState>): boolean => state.jobs.day !== state.clock.day || state.jobs.taken.length === 0;

/** Lohn beim Annehmen: Angebotslohn plus ggf. Bonus für den ersten Auftrag des Tages. */
export function acceptedCredits(content: GameContent, state: Readonly<GameState>, offer: JobOffer): { credits: number; firstBonus: boolean } {
  const rules = jobBoardRules(content, offer.board);
  const firstBonus = isFirstJobToday(state) && rules.firstJobBonus > 0;
  const base = firstBonus ? Math.round(offer.credits * (1 + rules.firstJobBonus)) : offer.credits;
  // Merkmal 'kurier-bonus' (Perk Dachläuferin): Kurieraufträge +15 % Credits.
  const courier = has(content.jobs, offer.template) && (content.jobs[offer.template].kind ?? 'kurier') === 'kurier'
    && state.player.perks.some((id) => has(content.perks, id) && (content.perks[id].traits ?? []).includes('kurier-bonus'));
  return { credits: courier ? Math.round(base * 1.15) : base, firstBonus };
}

/** Belohnung beim Abschluss eines angenommenen Auftrags (XP nach aktuellem Rang). */
export function jobCompletionReward(content: GameContent, state: Readonly<GameState>, offer: JobOffer): { credits: number; xp: number; rep: Record<FactionId, number> } {
  const template = has(content.jobs, offer.template) ? content.jobs[offer.template] : undefined;
  if (!template) return { credits: offer.credits, xp: 0, rep: {} };
  const rules = jobBoardRules(content, offer.board);
  const { rank } = jobRank(content, state, offer.board, rules);
  return { credits: offer.credits, xp: scaleJobXp(template.reward.xp, rank, rules), rep: { ...(template.reward.rep ?? {}) } };
}

/** Letzter Tag, an dem ein angenommener Auftrag noch läuft (null, wenn der Tag unbekannt ist). */
export function jobDeadline(content: GameContent, offer: JobOffer): number | null {
  const day = offerDay(offer);
  return day === null ? null : day + jobBoardRules(content, offer.board).expiresAfterDays;
}

/** Abgelaufene offene Aufträge am Tag `day`. */
export function expiredJobs(content: GameContent, state: Readonly<GameState>, day = state.clock.day): JobOffer[] {
  return state.jobs.active.filter((offer) => {
    const deadline = jobDeadline(content, offer);
    return deadline !== null && day > deadline;
  });
}

// ---------------------------------------------------------------------------
// Texte und Ansichten

const template = (content: GameContent, id: JobTemplateId): JobTemplateDef | undefined => (has(content.jobs, id) ? content.jobs[id] : undefined);

const fill = (text: string, target: string, credits: number): string =>
  text.replace(/\{ziel\}/g, target).replace(/\{credits\}/g, String(credits));

/** Titel mit eingesetzten Platzhaltern {ziel} und {credits}. */
export function jobTitle(content: GameContent, offer: JobOffer): string {
  const def = template(content, offer.template);
  if (!def) return offer.template;
  return fill(def.title, def.targets[offer.target]?.label ?? '', offer.credits);
}

/** Beschreibung mit eingesetzten Platzhaltern {ziel} und {credits}. */
export function jobText(content: GameContent, offer: JobOffer): string {
  const def = template(content, offer.template);
  if (!def) return '';
  return fill(def.text, def.targets[offer.target]?.label ?? '', offer.credits);
}

export const JOB_KIND_LABELS: Readonly<Record<JobKind, string>> = {
  kurier: 'Kurier', schulden: 'Schulden', datenraub: 'Datenraub', kopfgeld: 'Kopfgeld', eskorte: 'Eskorte',
};

export interface JobTargetView { map: MapId; label: string; at?: Point }

export interface JobOfferView {
  offer: JobOffer;
  kind: JobKind;
  kindLabel: string;
  title: string;
  text: string;
  target: JobTargetView | null;
  /** Lohn, wenn jetzt angenommen (inklusive Bonus für den ersten Auftrag des Tages). */
  credits: number;
  firstBonus: boolean;
  xp: number;
  rep: Record<FactionId, number>;
  /** Letzter Tag der Frist bei Annahme heute. */
  deadline: number | null;
}

const targetOf = (def: JobTemplateDef | undefined, index: number): JobTargetView | null => {
  const target = def?.targets[index];
  if (!target) return null;
  const view: JobTargetView = { map: target.map, label: target.label };
  if (target.at) view.at = target.at;
  return view;
};

export function jobOfferView(content: GameContent, state: Readonly<GameState>, offer: JobOffer): JobOfferView {
  const def = template(content, offer.template);
  const { credits, firstBonus } = acceptedCredits(content, state, offer);
  const reward = jobCompletionReward(content, state, offer);
  const kind = def?.kind ?? 'kurier';
  return {
    offer,
    kind,
    kindLabel: JOB_KIND_LABELS[kind],
    title: jobTitle(content, offer),
    text: jobText(content, offer),
    target: targetOf(def, offer.target),
    credits,
    firstBonus,
    xp: reward.xp,
    rep: reward.rep,
    deadline: state.clock.day + jobBoardRules(content, offer.board).expiresAfterDays,
  };
}

export interface JobBoardView {
  board: JobBoardId;
  name: string;
  rank: JobRankView;
  offers: JobOfferView[];
  /** Offene Aufträge dieser Tafel. */
  active: ActiveJobView[];
}

export function jobBoardView(content: GameContent, state: Readonly<GameState>, board: JobBoardId, evaluate: Evaluate): JobBoardView {
  const rules = jobBoardRules(content, board);
  return {
    board,
    name: rules.name,
    rank: jobRank(content, state, board, rules),
    offers: availableJobOffers(content, state, board, evaluate).map(offer => jobOfferView(content, state, offer)),
    active: activeJobs(content, state).filter(job => job.offer.board === board),
  };
}

export interface ActiveJobView {
  offer: JobOffer;
  kind: JobKind;
  title: string;
  text: string;
  target: JobTargetView | null;
  deadline: number | null;
  /** Verbleibende Tage nach heute (0 = läuft heute bis 02:00 ab). */
  daysLeft: number | null;
  encounter?: EncounterId;
  item?: ItemId;
}

/** Angenommene, offene Aufträge (für Questlog, HUD, Telefon). */
export function activeJobs(content: GameContent, state: Readonly<GameState>): ActiveJobView[] {
  return state.jobs.active.map((offer) => {
    const def = template(content, offer.template);
    const deadline = jobDeadline(content, offer);
    const view: ActiveJobView = {
      offer,
      kind: def?.kind ?? 'kurier',
      title: jobTitle(content, offer),
      text: jobText(content, offer),
      target: targetOf(def, offer.target),
      deadline,
      daysLeft: deadline === null ? null : Math.max(0, deadline - state.clock.day),
    };
    if (def?.encounter) view.encounter = def.encounter;
    if (def?.item) view.item = def.item;
    return view;
  });
}

/** Ziele offener Aufträge auf einer Karte (für Marker und Interaktionspunkte der Erkundung). */
export const jobTargetsOn = (content: GameContent, state: Readonly<GameState>, map: MapId): ActiveJobView[] =>
  activeJobs(content, state).filter(job => job.target?.map === map);

/**
 * Effekte beim Erreichen eines Auftragsziels: mit Begegnung startet der Kampf (nach dem Sieg schließt
 * `jobsForEncounter` + `completeJob` ab); sonst wird ein mitgegebenes Paket abgegeben und der Auftrag abgeschlossen.
 */
export function jobTargetEffects(content: GameContent, state: Readonly<GameState>, offerIdValue: string): Effect[] {
  const offer = state.jobs.active.find(entry => entry.id === offerIdValue);
  const def = offer ? template(content, offer.template) : undefined;
  if (!offer || !def) return [];
  if (def.encounter) return [{ battle: def.encounter }];
  const effects: Effect[] = [];
  if (def.item && (has(state.inventory, def.item) ? state.inventory[def.item] : 0) > 0) effects.push({ take: def.item });
  effects.push({ completeJob: def.id });
  return effects;
}

/** Vorlagen offener Aufträge, die ein Sieg in dieser Begegnung erfüllt. */
export const jobsForEncounter = (content: GameContent, state: Readonly<GameState>, encounter: EncounterId): JobTemplateId[] =>
  state.jobs.active.filter(offer => template(content, offer.template)?.encounter === encounter).map(offer => offer.template);

// ---------------------------------------------------------------------------
// Inhaltsprüfung (ergänzt die Verweisprüfung in campaign/lint.ts)

export function jobProblems(content: GameContent): string[] {
  const problems: string[] = [];
  for (const job of Object.values(content.jobs)) {
    const at = `Auftrag ${job.id}`;
    const [min, max] = job.reward.credits;
    if (!(Number.isFinite(min) && Number.isFinite(max) && min >= 0 && max >= min)) problems.push(`${at}: Lohnspanne ungültig`);
    if (!(Number.isFinite(job.reward.xp) && job.reward.xp >= 0)) problems.push(`${at}: ungültige XP`);
    if (/[@#]/.test(job.id)) problems.push(`${at}: ID darf weder „@“ noch „#“ enthalten`);
  }
  for (const [board, def] of Object.entries(boardDefs(content))) {
    const at = `Auftragstafel ${board}`;
    if (def.faction && !has(content.factions, def.faction)) problems.push(`${at}: unbekannte Fraktion „${def.faction}“`);
    if (def.ranks) {
      def.ranks.forEach((rank, index) => {
        if (index > 0 && rank.min <= def.ranks![index - 1].min) problems.push(`${at}: Ränge nicht aufsteigend`);
      });
    }
    if (!Object.values(content.jobs).some(job => job.boards.includes(board))) problems.push(`${at}: keine Vorlagen`);
  }
  return problems;
}
