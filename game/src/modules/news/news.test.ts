import { describe, expect, it } from 'vitest';
import { fixtureContent } from '../__fixtures__/content';
import { createCampaign, evaluateCondition } from '../campaign';
import { cloneState } from '../campaign/state';
import type { CharacterInput, GameContent, GameState, NewsDef } from '../contracts';
import {
  availableNews, currentNews, duePhoneMessages, newsAvailable, newsBulletin, newsSeenKey, phoneInbox, unreadPhoneCount,
  unseenNewsCount,
} from './index';

const input: CharacterInput = {
  name: 'Testfigur', look: 'a', origin: 'gosse',
  attributes: { technik: 5, koerper: 4, reflexe: 4, ausstrahlung: 3, strasse: 3 },
};

const news = (id: string, extra: Partial<NewsDef> = {}): NewsDef => ({
  id, anchor: 'raven', headline: id, lines: [{ speaker: 'raven', text: `${id}.` }], ...extra,
});

/** Fixture plus Kurzmeldungen, ein Radiosender (Dante) und eine nur per Effekt freigeschaltete Sendung. */
function content(): GameContent {
  const base = fixtureContent();
  base.news.kurz1 = news('kurz1', { priority: -1 });
  base.news.kurz2 = news('kurz2', { priority: -1 });
  base.news.kurz3 = news('kurz3', { priority: -1 });
  base.news.kurz4 = news('kurz4', { priority: -1 });
  base.news.radio = news('radio', { anchor: 'dante', priority: 3 });
  base.news.exklusiv = news('exklusiv', { when: { flag: 'nie' }, priority: 9 });
  return base;
}

function started(c: GameContent = content(), seed = 21) {
  const campaign = createCampaign(c, { storage: null, seed, random: () => 0.5 });
  expect(campaign.createCharacter(input).ok).toBe(true);
  return campaign;
}

const seenAll = (state: Readonly<GameState>, ids: string[]): GameState => {
  const draft = cloneState(state);
  draft.seen.push(...ids.map(newsSeenKey));
  return draft;
};

describe('Sendungen', () => {
  it('laufen nach Bedingung oder Freischaltung', () => {
    const campaign = started();
    const c = campaign.content;
    expect(availableNews(c, campaign.state(), campaign.evaluate).map(n => n.id)).toEqual(['morgen', 'kurz1', 'kurz2', 'kurz3', 'kurz4', 'radio']);
    campaign.apply([{ setFlag: 'einbruch' }]);
    expect(newsAvailable(campaign.state(), c.news.eilmeldung, campaign.evaluate)).toBe(true);
    const outcome = campaign.apply([{ news: 'exklusiv' }]);
    expect(outcome.requests).toContainEqual({ news: 'exklusiv' });
    expect(newsAvailable(campaign.state(), c.news.exklusiv, campaign.evaluate)).toBe(true);
    expect(availableNews(c, campaign.state(), campaign.evaluate, { anchors: ['dante'] }).map(n => n.id)).toEqual(['radio']);
  });

  it('zeigt Neues vor Gesehenem, dann nach Priorität', () => {
    const campaign = started();
    const c = campaign.content;
    expect(campaign.currentNews()?.id).toBe('radio');
    campaign.apply([{ setFlag: 'einbruch' }]);
    expect(campaign.currentNews()?.id).toBe('eilmeldung');
    campaign.markSeen(newsSeenKey('eilmeldung'));
    expect(campaign.currentNews()?.id).toBe('radio');
    const allSeen = seenAll(campaign.state(), ['morgen', 'radio', 'kurz1', 'kurz2', 'kurz3', 'kurz4']);
    expect(currentNews(c, allSeen, campaign.evaluate)?.id).toBe('eilmeldung'); // alles gesehen: Priorität
    expect(currentNews(c, allSeen, campaign.evaluate, { anchors: ['raven'] })?.id).toBe('eilmeldung');
    expect(currentNews(c, allSeen, campaign.evaluate, { anchors: ['niemand'] })).toBeNull();
  });

  it('nimmt bei gleicher Priorität die spätere Sendung (Fortschritt steht hinten)', () => {
    const c = content();
    c.news.spaeter = news('spaeter', { priority: 3 });
    const campaign = started(c);
    expect(campaign.currentNews()?.id).toBe('spaeter');
  });

  it('mischt täglich wechselnde Kurzmeldungen, Neues zuerst', () => {
    const campaign = started();
    const c = campaign.content;
    const bulletin = newsBulletin(c, campaign.state(), campaign.evaluate);
    expect(bulletin.main?.id).toBe('radio');
    expect(bulletin.fresh).toBe(true);
    expect(bulletin.shorts).toHaveLength(2);
    expect(bulletin.shorts.some(n => n.id === 'radio')).toBe(false);
    expect(newsBulletin(c, campaign.state(), campaign.evaluate)).toEqual(bulletin);
    expect(newsBulletin(c, campaign.state(), campaign.evaluate, { shorts: 0 }).shorts).toEqual([]);

    const picks = new Set<string>();
    for (let day = 1; day <= 10; day++) {
      const state = { ...cloneState(campaign.state()), clock: { day, minutes: 480 } };
      picks.add(newsBulletin(c, state, campaign.evaluate).shorts.map(n => n.id).join());
    }
    expect(picks.size).toBeGreaterThan(1);

    const mostlySeen = seenAll(campaign.state(), ['morgen', 'kurz1', 'kurz2', 'kurz4']);
    expect(newsBulletin(c, mostlySeen, campaign.evaluate).shorts[0].id).toBe('kurz3');
    expect(newsBulletin(c, seenAll(campaign.state(), ['radio']), campaign.evaluate).fresh).toBe(true);
  });

  it('zählt ungesehene Sendungen', () => {
    const campaign = started();
    expect(unseenNewsCount(campaign.content, campaign.state(), campaign.evaluate)).toBe(6);
    campaign.markSeen(newsSeenKey('radio'));
    expect(unseenNewsCount(campaign.content, campaign.state(), campaign.evaluate)).toBe(5);
    expect(unseenNewsCount(campaign.content, campaign.state(), campaign.evaluate, { anchors: ['dante'] })).toBe(0);
  });
});

describe('Telefon', () => {
  it('findet fällige Nachrichten nach Fortschritt', () => {
    const campaign = started();
    const c = campaign.content;
    expect(duePhoneMessages(c, campaign.state(), campaign.evaluate)).toEqual([]);
    const fond = cloneState(campaign.state());
    fond.relations.raven = { points: 200, met: true, talkedDay: 0, giftDay: 0, giftWeek: 0, giftsThisWeek: 0, events: [] };
    expect(duePhoneMessages(c, fond, condition => evaluateCondition(c, fond, condition)).map(m => m.id)).toEqual(['hallo']); // „manuell“ hat keine Automatik
    // Die Kampagne stellt sie im Nachlauf zu – danach ist nichts mehr fällig.
    campaign.apply([{ relation: 'raven', delta: 200 }]);
    expect(campaign.state().phone.map(p => p.id)).toEqual(['hallo']);
    expect(duePhoneMessages(c, campaign.state(), campaign.evaluate)).toEqual([]);
  });

  it('zeigt den Posteingang neueste zuerst mit Antworten', () => {
    const campaign = started();
    campaign.apply([{ relation: 'raven', delta: 200 }]);
    campaign.apply([{ phone: 'manuell' }]);
    expect(unreadPhoneCount(campaign.state())).toBe(2);
    let inbox = phoneInbox(campaign.content, campaign.state());
    expect(inbox.map(entry => entry.id)).toEqual(['manuell', 'hallo']);
    expect(inbox[1]).toMatchObject({ from: 'raven', text: 'Wo bleibst du?', day: 1, read: false, replies: ['Komme!'] });
    campaign.readPhone('hallo', 0);
    inbox = phoneInbox(campaign.content, campaign.state());
    expect(inbox[1]).toMatchObject({ read: true, reply: 'Komme!', replies: [] });
    expect(unreadPhoneCount(campaign.state())).toBe(1);
  });
});
