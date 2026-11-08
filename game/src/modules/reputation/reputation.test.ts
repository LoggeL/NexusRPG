import { describe, expect, it } from 'vitest';
import { fixtureContent } from '../__fixtures__/content';
import { createCampaign } from '../campaign';
import type { CharacterInput, GameState } from '../contracts';
import {
  REP_TIERS, applyRepDelta, clampRep, factionStandings, factionTier, isHostile, repCheckPenalty, repDeltaText, repMessages,
  repOf, repTier, repTierProblems, type RepTierDef,
} from './index';

const input: CharacterInput = {
  name: 'Testfigur', look: 'a', origin: 'gosse',
  attributes: { technik: 5, koerper: 4, reflexe: 4, ausstrahlung: 3, strasse: 3 },
};

function started() {
  const campaign = createCampaign(fixtureContent(), { storage: null, seed: 7, random: () => 0.5 });
  expect(campaign.createCharacter(input).ok).toBe(true);
  return campaign;
}

const withRep = (state: Readonly<GameState>, reputation: Record<string, number>): GameState =>
  ({ ...structuredClone(state), reputation });

describe('Rufstufen', () => {
  it('ordnet jede Grenze der richtigen Stufe zu (world.md 10.2)', () => {
    const cases: [number, string][] = [
      [-100, 'verhasst'], [-51, 'verhasst'], [-50, 'feindlich'], [-21, 'feindlich'], [-20, 'misstrauisch'], [-1, 'misstrauisch'],
      [0, 'neutral'], [19, 'neutral'], [20, 'geduldet'], [49, 'geduldet'], [50, 'respektiert'], [79, 'respektiert'],
      [80, 'verehrt'], [100, 'verehrt'],
    ];
    for (const [value, tier] of cases) expect(repTier(value).id, String(value)).toBe(tier);
    expect(repTier(250).id).toBe('verehrt');
    expect(repTier(-999).id).toBe('verhasst');
    expect(repTier(Number.NaN).id).toBe('neutral');
    expect(repTier(19.6).id).toBe('geduldet'); // gerundet
  });

  it('hat deutsche Namen und Preiswirkungen', () => {
    expect(REP_TIERS.map(tier => tier.name)).toEqual(['Verhasst', 'Feindlich', 'Misstrauisch', 'Neutral', 'Geduldet', 'Respektiert', 'Verehrt']);
    expect(REP_TIERS.map(tier => tier.priceModifier)).toEqual([50, 50, 25, 0, -10, -15, -20]);
    expect(REP_TIERS.filter(tier => tier.refusesTrade).map(tier => tier.id)).toEqual(['verhasst']);
  });

  it('prüft Stufenlisten auf Lücken und Grenzen', () => {
    expect(repTierProblems(REP_TIERS)).toEqual([]);
    const broken: RepTierDef[] = [{ ...REP_TIERS[0], max: -60 }, ...REP_TIERS.slice(1, 6)];
    const problems = repTierProblems(broken);
    expect(problems).toContainEqual(expect.stringContaining('schließt nicht an'));
    expect(problems).toContainEqual(expect.stringContaining('endet nicht bei 100'));
    expect(repTierProblems([])).toEqual(['Keine Rufstufen.']);
  });

  it('begrenzt Werte auf −100 … 100', () => {
    expect(clampRep(130)).toBe(100);
    expect(clampRep(-130)).toBe(-100);
    expect(clampRep(Number.POSITIVE_INFINITY)).toBe(0);
  });
});

describe('Rufänderungen', () => {
  it('rechnet Änderung, Begrenzung und Stufenwechsel aus', () => {
    const change = applyRepDelta(15, 10);
    expect(change).toMatchObject({ before: 15, after: 25, delta: 10, tierChanged: true });
    expect(change.tierBefore.id).toBe('neutral');
    expect(change.tierAfter.id).toBe('geduldet');
    expect(applyRepDelta(95, 20)).toMatchObject({ after: 100, delta: 5, tierChanged: false });
    expect(applyRepDelta(0, Number.NaN).delta).toBe(0);
  });

  it('formuliert Banner wie „Kanalvolk +15“', () => {
    expect(repDeltaText('Kanalvolk', 15)).toBe('Kanalvolk +15');
    expect(repDeltaText('Kanalvolk', -5)).toBe('Kanalvolk −5');
    expect(repMessages('Unterstadt', applyRepDelta(10, 10))).toEqual(['Unterstadt +10', 'Unterstadt: jetzt Geduldet']);
    expect(repMessages('Unterstadt', applyRepDelta(100, 5))).toEqual([]);
  });

  it('wendet den Effekt `rep` mit Meldungen und Grenzen an', () => {
    const campaign = started();
    expect(campaign.state().reputation.unterstadt).toBe(10);
    const outcome = campaign.apply([{ rep: 'unterstadt', delta: 15 }]);
    expect(campaign.state().reputation.unterstadt).toBe(25);
    expect(outcome.messages).toEqual(['Unterstadt +15', 'Unterstadt: jetzt Geduldet']);
    campaign.apply([{ rep: 'unterstadt', delta: 500 }]);
    expect(campaign.state().reputation.unterstadt).toBe(100);
    campaign.apply([{ rep: 'crew', delta: -500 }]);
    expect(campaign.state().reputation.crew).toBe(-100);
  });

  it('lehnt unbekannte Fraktionen transaktional ab', () => {
    const campaign = started();
    const before = campaign.state();
    const outcome = campaign.apply([{ rep: 'unterstadt', delta: 5 }, { rep: 'gibtsnicht', delta: 5 }]);
    expect(outcome.messages).toEqual(['Unbekannte Fraktion: gibtsnicht']);
    expect(campaign.state()).toBe(before);
  });
});

describe('Ruf in der Welt', () => {
  it('liefert Stufe, Check-Aufschlag und Feindseligkeit je Fraktion', () => {
    const state = withRep(started().state(), { unterstadt: -30, crew: -70 });
    expect(repOf(state, 'unterstadt')).toBe(-30);
    expect(repOf(state, 'unbekannt')).toBe(0);
    expect(factionTier(state, 'unterstadt').id).toBe('feindlich');
    expect(factionTier(state, undefined).id).toBe('neutral');
    expect(repCheckPenalty(state, 'unterstadt')).toBe(2);
    expect(repCheckPenalty(withRep(state, { unterstadt: -5 }), 'unterstadt')).toBe(1);
    expect(isHostile(state, 'unterstadt')).toBe(false);
    expect(isHostile(state, 'crew')).toBe(true);
  });

  it('zeigt alle Fraktionen mit Abstand zur nächsten Stufe', () => {
    const state = withRep(started().state(), { unterstadt: 45, crew: 90 });
    const standings = factionStandings(fixtureContent(), state);
    expect(standings.map(entry => [entry.faction, entry.value, entry.tier.name, entry.toNext])).toEqual([
      ['crew', 90, 'Verehrt', null],
      ['unterstadt', 45, 'Geduldet', 5],
    ]);
  });
});
