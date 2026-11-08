import { describe, expect, it } from 'vitest';
import { fixtureContent } from '../__fixtures__/content';
import { createCampaign, findContentProblems } from '../campaign';
import { completeJobsForEncounterIn } from '../campaign/domains/quests';
import { createEffectContext } from '../campaign/effects';
import { cloneState } from '../campaign/state';
import type { CharacterInput, GameContent, GameState, JobTemplateDef } from '../contracts';
import {
  DEFAULT_JOB_BOARD, activeJobs, allJobBoards, availableJobOffers, drawJobOffers, expiredJobs, jobBoardRules, jobBoardView,
  jobOfferView, jobProblems, jobRank, jobTargetEffects, jobTargetsOn, jobText, jobTitle, jobsForEncounter, offerDay, offerId,
  scaleJobCredits, scaleJobXp, type JobBoardDef, type JobContentExtension,
} from './index';

const input: CharacterInput = {
  name: 'Testfigur', look: 'a', origin: 'gosse',
  attributes: { technik: 5, koerper: 4, reflexe: 4, ausstrahlung: 3, strasse: 3 },
};

const template = (id: string, extra: Partial<JobTemplateDef> = {}): JobTemplateDef => ({
  id, kind: 'eskorte', title: `${id} nach {ziel}`, text: `Lohn {credits} für {ziel}.`, boards: ['tafel'],
  targets: [{ map: 'gasse', label: 'Gasse', at: [500, 500] }, { map: 'bar', label: 'Bar' }],
  reward: { credits: [100, 200], xp: 50 },
  ...extra,
});

/** Fixture mit sechs Vorlagen an der Tafel „tafel“ und optionalen Tafel-Regeln. */
function content(boards?: Record<string, JobBoardDef>): GameContent & JobContentExtension {
  const base: GameContent & JobContentExtension = fixtureContent();
  base.jobs.kopfgeld = { ...base.jobs.kopfgeld, encounter: 'schlaeger' };
  for (const id of ['eskorte', 'bergung', 'tuer', 'schulden']) base.jobs[id] = template(id);
  base.jobs.nacht = template('nacht', { when: { time: 'nacht' } });
  if (boards) base.jobBoards = boards;
  return base;
}

function started(c: GameContent = content(), seed = 5) {
  const campaign = createCampaign(c, { storage: null, seed, random: () => 0.5 });
  expect(campaign.createCharacter(input).ok).toBe(true);
  return campaign;
}

/** Nur der Kurier hängt an „tafel“ (alle anderen Vorlagen an „andere“). */
function kurierOnly(c: GameContent): GameContent {
  for (const job of Object.values(c.jobs)) if (job.id !== 'kurier') job.boards = ['andere'];
  return c;
}

const at = (state: Readonly<GameState>, patch: Partial<GameState>): GameState => ({ ...cloneState(state), ...patch });

describe('Tafel-Regeln', () => {
  it('nutzt Standardwerte und kennt alle Tafeln', () => {
    const c = content();
    expect(jobBoardRules(c, 'tafel')).toMatchObject({ ...DEFAULT_JOB_BOARD, id: 'tafel', name: 'Auftragstafel', faction: null });
    expect(allJobBoards(c)).toEqual(['tafel', 'andere']);
    expect(allJobBoards(content({ extra: { name: 'Leer' } }))).toContain('extra');
  });

  it('bestimmt den Rang aus der Stufe oder dem Fraktionsruf', () => {
    const plain = started();
    expect(jobRank(plain.content, plain.state(), 'tafel')).toEqual({ rank: 1, title: 'Rang 1', value: 1, basis: 'stufe', toNext: 3 });
    plain.apply([{ xp: 600 }]);
    expect(jobRank(plain.content, plain.state(), 'tafel')).toMatchObject({ rank: 2, value: 4, toNext: 4 });

    const ranks = [{ min: 0, title: 'Laufbursche' }, { min: 20, title: 'Handlanger' }, { min: 40, title: 'Profi' }];
    const crew = started(content({ tafel: { faction: 'unterstadt', ranks } }));
    expect(jobRank(crew.content, crew.state(), 'tafel')).toEqual({ rank: 1, title: 'Laufbursche', value: 10, basis: 'ruf', toNext: 10 });
    crew.apply([{ rep: 'unterstadt', delta: 35 }]);
    expect(jobRank(crew.content, crew.state(), 'tafel')).toEqual({ rank: 3, title: 'Profi', value: 45, basis: 'ruf', toNext: null });
  });

  it('skaliert Lohn und XP nach Rang', () => {
    expect(scaleJobCredits(80, 1, DEFAULT_JOB_BOARD)).toBe(80);
    expect(scaleJobCredits(80, 3, DEFAULT_JOB_BOARD)).toBe(120);
    expect(scaleJobXp(50, 5, DEFAULT_JOB_BOARD)).toBe(70);
    expect(scaleJobCredits(-5, 2, DEFAULT_JOB_BOARD)).toBe(0);
  });
});

describe('Angebote', () => {
  it('zieht 3 Angebote deterministisch aus Startwert, Tag und Tafel', () => {
    const a = started();
    const b = started();
    const offers = a.jobOffers('tafel');
    expect(offers).toHaveLength(3);
    expect(b.jobOffers('tafel')).toEqual(offers);
    expect(new Set(offers.map(offer => offer.template)).size).toBe(3);
    expect(offers.every(offer => offer.id === offerId('tafel', 1, offer.template))).toBe(true);
    expect(offers.some(offer => offer.template === 'nacht')).toBe(false); // nur nachts
    for (const offer of offers) {
      const [min, max] = a.content.jobs[offer.template].reward.credits;
      expect(offer.credits).toBeGreaterThanOrEqual(min);
      expect(offer.credits).toBeLessThanOrEqual(max);
      expect(offer.target).toBeLessThan(a.content.jobs[offer.template].targets.length);
    }
    const days = new Set<string>();
    const seeds = new Set<string>();
    for (let day = 1; day <= 8; day++) {
      days.add(drawJobOffers(a.content, at(a.state(), { clock: { day, minutes: 480 } }), 'tafel', a.evaluate).map(o => o.template).join());
    }
    for (let seed = 1; seed <= 8; seed++) seeds.add(started(content(), seed).jobOffers('tafel').map(o => o.template).join());
    expect(days.size).toBeGreaterThan(1);
    expect(seeds.size).toBeGreaterThan(1);
  });

  it('bleibt über den Tag stabil, wenn eine Bedingung umschlägt', () => {
    const c = content();
    for (const job of Object.values(c.jobs)) if (job.boards.includes('tafel')) job.when = { notFlag: `ohne-${job.id}` };
    const campaign = started(c);
    const offers = campaign.jobOffers('tafel');
    campaign.apply([{ setFlag: `ohne-${offers[0].template}` }]);
    const after = campaign.jobOffers('tafel');
    expect(after).toHaveLength(3);
    expect(after.slice(0, 2)).toEqual(offers.slice(1)); // übrige Angebote unverändert
  });

  it('hängt Zusatzangebote aus, solange ihre Bedingung gilt', () => {
    const c = content({ tafel: { slots: 1, extraSlots: [{ when: { time: 'nacht' }, count: 2 }] } });
    const campaign = started(c);
    expect(campaign.jobOffers('tafel')).toHaveLength(1);
    campaign.advanceClock(13 * 60); // 21:00
    expect(campaign.jobOffers('tafel')).toHaveLength(3);
    expect(started(content({ tafel: { slots: 0 } })).jobOffers('tafel')).toEqual([]);
  });

  it('erhöht den Lohn mit dem Rang', () => {
    const c = content({ tafel: { faction: 'unterstadt' } });
    const campaign = started(c);
    const low = drawJobOffers(c, campaign.state(), 'tafel', campaign.evaluate);
    campaign.apply([{ rep: 'unterstadt', delta: 30 }]); // 40 → Rang 3
    const high = drawJobOffers(c, campaign.state(), 'tafel', campaign.evaluate);
    expect(high.map(o => [o.id, o.target])).toEqual(low.map(o => [o.id, o.target]));
    high.forEach((offer, index) => expect(offer.credits).toBe(Math.round(low[index].credits * 1.5)));
  });

  it('liest Angebotskennungen', () => {
    expect(offerId('high-voltage', 12, 'job-kurier')).toBe('high-voltage@12#job-kurier');
    expect(offerDay({ id: 'high-voltage@12#job-kurier' })).toBe(12);
    expect(offerDay({ id: 'kurier-paket@3#1' })).toBe(3);
    expect(offerDay({ id: 'tafel:3:0' })).toBeNull();
  });
});

describe('Annehmen und Abschließen', () => {
  it('gibt dem ersten Auftrag des Tages +25 % und das Paket', () => {
    const campaign = started();
    const offers = campaign.jobOffers('tafel');
    const kurier = offers.find(o => o.template === 'kurier') ?? offers[0];
    const view = jobOfferView(campaign.content, campaign.state(), kurier);
    expect(view.firstBonus).toBe(true);
    expect(view.credits).toBe(Math.round(kurier.credits * 1.25));
    const result = campaign.acceptJob(kurier.id);
    expect(result.ok).toBe(true);
    expect(result.outcome.messages[1]).toContain('Erster Auftrag des Tages');
    expect(campaign.state().jobs.active[0].credits).toBe(view.credits);
    expect(campaign.acceptJob(kurier.id)).toMatchObject({ ok: false, message: 'Dieses Angebot gibt es nicht mehr.' });
    const second = campaign.jobOffers('tafel')[0];
    expect(jobOfferView(campaign.content, campaign.state(), second).firstBonus).toBe(false);
    expect(campaign.acceptJob(second.id).ok).toBe(true);
    expect(campaign.state().jobs.active[1].credits).toBe(second.credits);
    expect(campaign.jobOffers('tafel')).toHaveLength(1);
    expect(campaign.state().jobs.taken).toEqual([kurier.id, second.id]);
  });

  it('nimmt offene Vorlagen auch an Folgetagen nicht doppelt an', () => {
    const campaign = started();
    const offer = campaign.jobOffers('tafel')[0];
    campaign.acceptJob(offer.id);
    campaign.sleep();
    expect(campaign.state().jobs.active).toHaveLength(1);
    expect(campaign.jobOffers('tafel').some(o => o.template === offer.template)).toBe(false);
    expect(campaign.jobOffers('tafel').every(o => offerDay(o) === 2)).toBe(true);
  });

  it('schließt mit Lohn, XP nach Rang und Ruf ab', () => {
    const campaign = started(kurierOnly(content()));
    const kurier = campaign.jobOffers('tafel').find(o => o.template === 'kurier');
    expect(kurier).toBeDefined();
    campaign.acceptJob(kurier?.id ?? '');
    campaign.apply([{ xp: 600 }]); // Stufe 4 → Rang 2
    const accepted = campaign.state().jobs.active[0];
    const before = campaign.state();
    const outcome = campaign.apply(jobTargetEffects(campaign.content, before, accepted.id));
    const state = campaign.state();
    expect(state.jobs.active).toEqual([]);
    expect(state.jobs.completed).toBe(1);
    expect(state.inventory.chip).toBeUndefined();
    expect(state.credits).toBe(before.credits + accepted.credits);
    expect(state.player.xp).toBe(before.player.xp + 22); // 20 × 1,1
    expect(state.reputation.unterstadt).toBe(12);
    expect(outcome.messages).toContain(`Auftrag erledigt: ${jobTitle(campaign.content, accepted)}`);
  });

  it('startet bei Kopfgeldern den Kampf und schließt nach dem Sieg ab', () => {
    const c = content();
    for (const id of ['eskorte', 'bergung', 'tuer', 'schulden', 'kurier']) c.jobs[id].boards = ['andere'];
    const campaign = started(c);
    const offer = campaign.jobOffers('tafel').find(o => o.template === 'kopfgeld');
    expect(offer).toBeDefined();
    campaign.acceptJob(offer?.id ?? '');
    const accepted = campaign.state().jobs.active[0];
    expect(jobTargetEffects(c, campaign.state(), accepted.id)).toEqual([{ battle: 'schlaeger' }]);
    expect(jobsForEncounter(c, campaign.state(), 'schlaeger')).toEqual(['kopfgeld']);
    expect(jobsForEncounter(c, campaign.state(), 'anderes')).toEqual([]);
    const draft = cloneState(campaign.state());
    const ctx = createEffectContext(c, draft, () => 0.5);
    expect(completeJobsForEncounterIn(ctx, 'schlaeger')).toBeNull();
    expect(draft.jobs.active).toEqual([]);
    expect(draft.credits).toBe(campaign.state().credits + accepted.credits);
    expect(jobTargetEffects(c, campaign.state(), 'gibtsnicht')).toEqual([]);
  });

  it('lehnt `completeJob` ohne offenen Auftrag ab', () => {
    const campaign = started();
    expect(campaign.apply([{ completeJob: 'kurier' }]).messages).toEqual(['Kein offener Auftrag dieser Art.']);
  });
});

describe('Fristen', () => {
  it('lässt Aufträge bis zum Ende des Folgetags laufen und dann verfallen', () => {
    const c = kurierOnly(content({ tafel: { faction: 'unterstadt', failRep: 3 } }));
    const campaign = started(c);
    const kurier = campaign.jobOffers('tafel').find(o => o.template === 'kurier');
    expect(kurier).toBeDefined();
    campaign.acceptJob(kurier?.id ?? '');
    expect(activeJobs(c, campaign.state())[0]).toMatchObject({ deadline: 2, daysLeft: 1, item: 'chip', kind: 'kurier' });
    campaign.sleep();
    expect(campaign.state().jobs.active).toHaveLength(1);
    expect(activeJobs(c, campaign.state())[0].daysLeft).toBe(0);
    expect(expiredJobs(c, campaign.state(), 3)).toHaveLength(1);
    const outcome = campaign.sleep();
    const state = campaign.state();
    expect(state.jobs.active).toEqual([]);
    expect(state.inventory.chip).toBeUndefined();
    expect(state.reputation.unterstadt).toBe(7);
    expect(outcome.messages).toContain(`Auftrag verfallen: ${jobTitle(c, kurier!)}`);
  });

  it('verfällt ohne Tafel-Fraktion ohne Rufverlust', () => {
    const campaign = started();
    const offer = campaign.jobOffers('tafel')[0];
    campaign.acceptJob(offer.id);
    campaign.sleep();
    campaign.sleep();
    expect(campaign.state().jobs.active).toEqual([]);
    expect(campaign.state().reputation.unterstadt).toBe(10);
  });
});

describe('Ansichten', () => {
  it('setzt Platzhalter ein und zeigt Ziele, Frist und Tafel', () => {
    const campaign = started();
    const offer = campaign.jobOffers('tafel').find(o => o.template === 'eskorte')
      ?? { id: offerId('tafel', 1, 'eskorte'), template: 'eskorte', board: 'tafel', target: 0, credits: 150 };
    const label = campaign.content.jobs.eskorte.targets[offer.target].label;
    expect(jobTitle(campaign.content, offer)).toBe(`eskorte nach ${label}`);
    expect(jobText(campaign.content, offer)).toBe(`Lohn ${offer.credits} für ${label}.`);
    expect(jobTitle(campaign.content, { ...offer, template: 'weg' })).toBe('weg');
    const view = jobOfferView(campaign.content, campaign.state(), offer);
    expect(view).toMatchObject({ kind: 'eskorte', kindLabel: 'Eskorte', xp: 50, deadline: 2 });
    expect(view.target?.label).toBe(label);

    const board = jobBoardView(campaign.content, campaign.state(), 'tafel', campaign.evaluate);
    expect(board).toMatchObject({ board: 'tafel', name: 'Auftragstafel', rank: { rank: 1 }, active: [] });
    expect(board.offers).toHaveLength(3);
    campaign.acceptJob(board.offers[0].offer.id);
    const accepted = campaign.state().jobs.active[0];
    const targetMap = campaign.content.jobs[accepted.template].targets[accepted.target].map;
    expect(jobTargetsOn(campaign.content, campaign.state(), targetMap).map(job => job.offer.id)).toEqual([accepted.id]);
    expect(jobBoardView(campaign.content, campaign.state(), 'tafel', campaign.evaluate).active).toHaveLength(1);
    expect(availableJobOffers(campaign.content, campaign.state(), 'tafel', campaign.evaluate)).toHaveLength(2);
  });
});

describe('Speicherformat und Inhaltsprüfung', () => {
  it('speichert offene Aufträge und lehnt doppelte Vorlagen ab', () => {
    const campaign = started();
    campaign.acceptJob(campaign.jobOffers('tafel')[0].id);
    const raw = campaign.exportSave();
    const other = started();
    expect(other.importSave(raw)).toBe(true);
    expect(other.state().jobs).toEqual(campaign.state().jobs);
    const data = JSON.parse(raw) as GameState;
    data.jobs.active.push({ ...data.jobs.active[0], id: 'tafel@1#kopie' });
    expect(other.importSave(JSON.stringify(data))).toBe(false);
  });

  it('meldet kaputte Vorlagen und Tafeln', () => {
    expect(jobProblems(content())).toEqual([]);
    const c = content({ geist: { faction: 'gibtsnicht', ranks: [{ min: 10, title: 'a' }, { min: 5, title: 'b' }] } });
    c.jobs.bergung.reward = { credits: [50, 10], xp: -1 };
    c.jobs['a#b'] = template('a#b');
    const problems = jobProblems(c);
    expect(problems).toEqual(expect.arrayContaining([
      'Auftrag bergung: Lohnspanne ungültig',
      'Auftrag bergung: ungültige XP',
      'Auftrag a#b: ID darf weder „@“ noch „#“ enthalten',
      'Auftragstafel geist: unbekannte Fraktion „gibtsnicht“',
      'Auftragstafel geist: Ränge nicht aufsteigend',
      'Auftragstafel geist: keine Vorlagen',
    ]));
    expect(findContentProblems(c)).toEqual(expect.arrayContaining(['Auftrag bergung: Lohnspanne ungültig']));
  });
});
