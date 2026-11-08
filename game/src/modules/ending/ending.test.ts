import { describe, expect, it } from 'vitest';
import { fixtureContent } from '../__fixtures__/content';
import { createCampaign } from '../campaign';
import { endingStats, epilogueLines, formatPlayTime } from './index';

describe('Abschluss', () => {
  it('formatiert die Spielzeit', () => {
    expect(formatPlayTime(0)).toBe('0:00');
    expect(formatPlayTime(754_000)).toBe('12:34');
    expect(formatPlayTime(3_723_000)).toBe('1:02:03');
    expect(formatPlayTime(Number.NaN)).toBe('0:00');
  });

  it('zählt Quests, Orte, Galerie, Herzen und Kampfstatistik', () => {
    const content = fixtureContent();
    const campaign = createCampaign(content, { storage: null, seed: 2 });
    campaign.createCharacter({ name: 'Testfigur', look: 'a', origin: 'gosse', attributes: { technik: 5, koerper: 4, reflexe: 4, ausstrahlung: 3, strasse: 3 } });
    campaign.apply([{ startQuest: 'chip' }, { give: 'chip' }, { relation: 'raven', delta: 350 }]);
    campaign.setLocation('bar', [100, 400], 'e');
    campaign.markSeen('intro');
    campaign.finishBattle({ encounter: 'schlaeger', outcome: 'win', playerHp: 20 });
    campaign.addPlayTime(30_000);
    const stats = endingStats(content, campaign.state());
    expect(stats.quests).toEqual({ found: 1, total: 2 });
    expect(stats.places).toEqual({ found: 2, total: 2 });
    expect(stats.gallery).toEqual({ found: 1, total: 1 });
    expect(stats.hearts).toBe(3);
    expect(stats.battlesWon).toBe(1);
    expect(stats.playTimeText).toBe('0:30');
  });

  it('wählt Epilogzeilen nach Bedingung', () => {
    const content = fixtureContent();
    const campaign = createCampaign(content, { storage: null });
    expect(epilogueLines(content, c => campaign.evaluate(c))).toEqual(['Noxius schläft.']);
    campaign.apply([{ setFlag: 'chip-gesehen' }]);
    expect(epilogueLines(content, c => campaign.evaluate(c))).toHaveLength(2);
  });
});
