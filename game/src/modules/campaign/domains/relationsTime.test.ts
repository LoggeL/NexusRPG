// Zusammenspiel der Bereiche Beziehungen und Zeit mit der Kampagnen-Fassade (Fixture-Inhalt).
import { describe, expect, it } from 'vitest';
import { fixtureContent } from '../../__fixtures__/content';
import type { CharacterInput, Condition, GameContent, MapDef, NpcDef, PerkDef } from '../../contracts';
import { createCampaign, findContentProblems } from '../index';

const input: CharacterInput = {
  name: 'Testfigur', look: 'a', origin: 'gosse',
  attributes: { technik: 5, koerper: 4, reflexe: 4, ausstrahlung: 3, strasse: 3 },
};

function started(content: GameContent = fixtureContent()) {
  const campaign = createCampaign(content, { storage: null, seed: 42, random: () => 0.25 });
  expect(campaign.createCharacter(input).ok).toBe(true);
  return campaign;
}

describe('Beziehungen über die Fassade', () => {
  it('meldet neue Herzstufen, Rivalitätsbeginn und -ende', () => {
    const campaign = started();
    const up = campaign.apply([{ relation: 'raven', delta: 230 }]);
    expect(up.messages).toContain('Frau in Schwarz: neue Herzstufe ♥2');
    expect(up.requests).toContainEqual({ sfx: 'heart-up' });
    const down = campaign.apply([{ relation: 'raven', delta: -600 }]);
    expect(down.messages.some(m => m.startsWith('Rivalität mit Frau in Schwarz (Stufe 3)'))).toBe(true);
    expect(down.requests).toContainEqual({ sfx: 'heart-down' });
    expect(campaign.rivalry('raven')).toBe(3);
    const worse = campaign.apply([{ relation: 'raven', delta: -200 }]);
    expect(worse.messages).toContain('Rivalität mit Frau in Schwarz: Stufe 5');
    const back = campaign.apply([{ relation: 'raven', delta: 400 }]);
    expect(back.messages).toContain('Die Rivalität mit Frau in Schwarz ist vorbei.');
  });

  it('kappt Punkte bei der Herz-Obergrenze einer Weltfigur', () => {
    const content = fixtureContent();
    (content.npcs.dante as NpcDef & { maxHearts: number }).maxHearts = 5;
    const campaign = started(content);
    campaign.apply([{ relation: 'dante', delta: 900 }]);
    expect(campaign.state().relations.dante.points).toBe(500);
    expect(campaign.hearts('dante')).toBe(5);
    expect(campaign.evaluate({ hearts: 'dante', min: 5 })).toBe(true);
    expect(campaign.evaluate({ hearts: 'dante', min: 6 })).toBe(false);
  });

  it('verdreifacht Geschenke am Geburtstag und nennt den angezeigten Namen', () => {
    const content = fixtureContent();
    (content.npcs.raven as NpcDef & { birthday: Condition }).birthday = { weekday: 'mo' };
    const campaign = started(content);
    campaign.apply([{ give: 'messer', qty: 2 }]);
    const gift = campaign.giveGift('raven', 'messer');
    expect(gift).toMatchObject({ ok: true, taste: 'loves', delta: 240, message: 'Frau in Schwarz liebt es.' });
    expect(campaign.state().relations.raven).toMatchObject({ points: 240, giftDay: 1, giftsThisWeek: 1, met: true });
    expect(campaign.state().stats.giftsGiven).toBe(1);
    campaign.sleep(); // Dienstag: kein Geburtstag mehr
    expect(campaign.giveGift('raven', 'messer').delta).toBe(80);
  });

  it('gibt beim Ansprechen den Perk-Zuschlag dazu', () => {
    const content = fixtureContent();
    (content.perks.bastler as PerkDef & { talkBonus: number }).talkBonus = 10;
    const campaign = started(content);
    campaign.apply([{ xp: 100 }]);
    expect(campaign.learnPerk('bastler').ok).toBe(true);
    campaign.talkTo('raven');
    expect(campaign.state().relations.raven.points).toBe(30);
  });

  it('lehnt Parties mit Nicht-Begleitern ab und behält die Reihenfolge', () => {
    const campaign = started();
    campaign.apply([{ recruit: 'raven' }, { recruit: 'ripper' }]);
    expect(campaign.setParty(['daria']).message).toBe('Daria ist keine Begleitfigur.');
    expect(campaign.setParty(['ripper', 'raven', 'ripper']).ok).toBe(true);
    expect(campaign.state().party).toEqual(['ripper', 'raven']);
    expect(campaign.apply([{ dismiss: 'ripper' }]).messages).toContain('Ripper bleibt zurück.');
    expect(campaign.state().recruited).toContain('ripper');
  });

  it('löst Herz-Ereignisse in Stufenfolge aus und merkt sie', () => {
    const content = fixtureContent();
    content.npcs.raven.heartEvents = [
      { id: 'he-raven-4', hearts: 4, map: 'gasse', dialogue: 'raven-nah' },
      { id: 'he-raven-2', hearts: 2, map: 'gasse', dialogue: 'raven-tag', effects: [{ xp: 25 }] },
    ];
    const campaign = started(content);
    campaign.apply([{ relation: 'raven', delta: 450 }]);
    expect(campaign.pendingHeartEvent('gasse')?.id).toBe('he-raven-2');
    const xp = campaign.state().player.xp;
    campaign.completeHeartEvent('he-raven-2');
    expect(campaign.state().player.xp).toBe(xp + 25);
    expect(campaign.state().relations.raven.events).toEqual(['he-raven-2']);
    expect(campaign.hasSeen('he-raven-2')).toBe(true);
    expect(campaign.pendingHeartEvent('gasse')?.id).toBe('he-raven-4');
    campaign.completeHeartEvent('he-raven-4');
    expect(campaign.pendingHeartEvent('gasse')).toBeNull();
    expect(campaign.completeHeartEvent('gibt-es-nicht')).toEqual({ requests: [], messages: [] });
  });

  it('kappt beim Laden Punkte über einer gesenkten Herz-Obergrenze', () => {
    const campaign = started();
    campaign.apply([{ relation: 'dante', delta: 900 }]);
    const raw = campaign.exportSave();
    const lowered = fixtureContent();
    (lowered.npcs.dante as NpcDef & { maxHearts: number }).maxHearts = 4;
    const other = createCampaign(lowered, { storage: null, seed: 1 });
    expect(other.importSave(raw)).toBe(true);
    expect(other.state().relations.dante.points).toBe(400);
  });
});

describe('Zeit über die Fassade', () => {
  it('wacht auf einem Notschlafplatz ohne Verlust auf', () => {
    const content = fixtureContent();
    (content.maps.gasse as MapDef & { shelter: object }).shelter = { entry: 'tor', when: { hearts: 'raven', min: 1 }, notes: ['Raven hat dich zugedeckt.'] };
    const campaign = started(content);
    const credits = campaign.state().credits;
    // Ohne ♥1: Unterschlupf mit Verlust
    const home = campaign.advanceClock(2000);
    expect(campaign.state().credits).toBe(credits - Math.floor(credits * 0.1));
    expect(home.requests).toContainEqual({ travel: 'bar', entry: 'start', minutes: 0 });
    // Zurück in die Gasse, Raven ♥1: Notschlafplatz
    campaign.setLocation('gasse', [200, 500], 'e');
    campaign.apply([{ relation: 'raven', delta: 100 }]);
    const before = campaign.state().credits;
    const shelter = campaign.advanceClock(2000);
    expect(campaign.state().credits).toBe(before);
    expect(shelter.requests).toContainEqual({ travel: 'gasse', entry: 'tor', minutes: 0 });
    expect(shelter.requests).toContainEqual({ sleep: 'collapse' });
    expect(shelter.messages).toContain('Raven hat dich zugedeckt.');
    expect(campaign.state().clock).toEqual({ day: 3, minutes: 360 });
    expect(campaign.state().player.hp).toBe(campaign.maxHp());
  });

  it('bucht die U-Bahn-Fahrt und bricht unterwegs um 02:00 zusammen', () => {
    const campaign = started();
    campaign.apply([{ unlockStation: 'linie-bar' }, { advanceTime: 1050 }]); // 01:30
    const ride = campaign.fastTravel('linie-bar');
    expect(ride.ok).toBe(true);
    expect(ride.outcome.requests).toContainEqual({ sleep: 'collapse' });
    expect(ride.outcome.requests.some(r => 'travel' in r && r.travel === 'bar' && r.entry === 'start')).toBe(true);
    expect(campaign.state().clock.day).toBe(2);
  });

  it('meldet Tageszeitwechsel als vollständige Änderung, Minuten dazwischen leicht', () => {
    const campaign = started();
    let notified = 0;
    campaign.subscribe(() => { notified++; });
    expect(campaign.advanceClock(1)).toEqual({ requests: [], messages: [] });
    expect(campaign.state().clock.minutes).toBe(481);
    expect(notified).toBe(1);
    campaign.advanceClock(200);
    expect(campaign.timeSlot()).toBe('tag');
  });

  it('lässt feste Platzierungen den Tagesablauf auf allen Karten überschreiben', () => {
    const content = fixtureContent();
    content.maps.bar = { ...content.maps.bar, npcs: [{ id: 'raven-verhoer', npc: 'raven', at: [500, 400], when: { flag: 'verhoer' } }] };
    const campaign = started(content);
    expect(campaign.presentNpcs('gasse').some(p => p.npc === 'raven')).toBe(true);
    campaign.apply([{ setFlag: 'verhoer' }]);
    expect(campaign.presentNpcs('gasse').some(p => p.npc === 'raven')).toBe(false);
    expect(campaign.presentNpcs('bar').find(p => p.npc === 'raven')?.source).toBe('raven-verhoer');
  });
});

describe('Inhaltsprüfung', () => {
  it('prüft Beziehungs- und Tagesablaufstruktur sowie Notschlafplätze mit', () => {
    const content = fixtureContent();
    content.npcs.raven.heartEvents = [{ id: 'he-raven-2', hearts: 12, map: 'gasse', dialogue: 'raven-tag' }];
    (content.maps.gasse as MapDef & { shelter: object }).shelter = { entry: 'fehlt', when: { hearts: 'niemand', min: 1 } };
    const problems = findContentProblems(content);
    expect(problems.some(p => p.includes('ungültige Stufe 12'))).toBe(true);
    expect(problems.some(p => p.includes('Notschlafplatz') && p.includes('gasse#fehlt'))).toBe(true);
    expect(problems.some(p => p.includes('Notschlafplatz') && p.includes('niemand'))).toBe(true);
  });
});
