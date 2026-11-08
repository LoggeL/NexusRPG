import { describe, expect, it } from 'vitest';
import { fixtureContent } from '../__fixtures__/content';
import { createInitialState } from '../campaign/state';
import * as ids from '../campaign/ids';
import type { Condition, GameContent, GameState, HeartEventDef, NpcDef } from '../contracts';
import {
  GIFT_BONUS_HOOKS, GIFT_POINTS, MAX_PARTY, POINTS_MAX, POINTS_MIN, RIVAL_BELOW, ROMANCE_HEARTS, birthdayGiftBonus,
  changePoints, clampPoints, collectGiftModifiers, companionAbilities, dailyTalk, dismiss, dueHeartEvents, eventReached,
  findHeartEvent, giftLimitOf, giftPrefsProblems, giftTasteFor, giftValue, giftsLeftToday, heartEventProblems, heartLabel,
  heartProgress, heartsOf, knownRelations, maxHeartsOf, nextHeartEvent, normalizeParty, partyProblem, perkGiftBonus, pickTalk,
  reconciledPoints, recordGift, recruit, relationView, relationshipProblems, reserveOf, rivalryOf, romanceEligible,
  romanceStatus, standingOf, talkBonusExtra, tasteIn, upcomingHeartEvents,
} from './index';

const always = () => true;
const flags = (set: string[]) => (condition?: Condition) =>
  condition === undefined || ('flag' in condition && set.includes(condition.flag));

function stateWith(content: GameContent, patch: (state: GameState) => void = () => {}): GameState {
  const state = createInitialState(content, 7);
  patch(state);
  return state;
}

describe('Punkte, Herzen und Rivalität', () => {
  it('rechnet Herzen als floor(Punkte / 100) in 0..10', () => {
    expect(heartsOf(0)).toBe(0);
    expect(heartsOf(99)).toBe(0);
    expect(heartsOf(100)).toBe(1);
    expect(heartsOf(850)).toBe(8);
    expect(heartsOf(1000)).toBe(10);
    expect(heartsOf(-500)).toBe(0);
    expect(heartsOf(Number.NaN)).toBe(0);
  });

  it('beginnt Rivalität erst unter −200 mit Stufen 2..10', () => {
    expect(rivalryOf(-200)).toBe(0);
    expect(rivalryOf(-201)).toBe(2);
    expect(rivalryOf(-299)).toBe(2);
    expect(rivalryOf(-300)).toBe(3);
    expect(rivalryOf(-1000)).toBe(10);
    expect(rivalryOf(50)).toBe(0);
  });

  it('begrenzt Punkte auf −1000..1000 bzw. die Herz-Obergrenze', () => {
    expect(clampPoints(5000)).toBe(POINTS_MAX);
    expect(clampPoints(-5000)).toBe(POINTS_MIN);
    expect(clampPoints(800, 5)).toBe(500);
    expect(heartsOf(800, 5)).toBe(5);
    expect(clampPoints(12.6)).toBe(13);
  });

  it('meldet gewonnene und verlorene Herzen sowie Rivalitätswechsel', () => {
    const up = changePoints(180, 250);
    expect(up).toMatchObject({ before: 180, after: 430, applied: 250, heartsBefore: 1, heartsAfter: 4, heartsGained: [2, 3, 4], heartsLost: [] });
    const capped = changePoints(950, 200);
    expect(capped).toMatchObject({ after: 1000, applied: 50, heartsGained: [10] });
    const down = changePoints(120, -400);
    expect(down).toMatchObject({ after: -280, heartsLost: [1], rivalryStarted: true, rivalryAfter: 2 });
    expect(changePoints(-300, 150)).toMatchObject({ after: -150, rivalryEnded: true });
    expect(changePoints(10, Number.NaN)).toMatchObject({ after: 10, applied: 0 });
    expect(changePoints(450, 200, 5)).toMatchObject({ after: 500, heartsAfter: 5, heartsGained: [5] });
  });

  it('versöhnt auf 0 und lässt positive Punkte stehen', () => {
    expect(reconciledPoints(-640)).toBe(0);
    expect(reconciledPoints(320)).toBe(320);
  });

  it('beschreibt Fortschritt und Stand für Anzeigen', () => {
    expect(heartProgress(250)).toEqual({ hearts: 2, maxHearts: 10, progress: 0.5, toNext: 50 });
    expect(heartProgress(1000)).toEqual({ hearts: 10, maxHearts: 10, progress: 1, toNext: null });
    expect(heartProgress(500, 5)).toMatchObject({ hearts: 5, toNext: null });
    expect(standingOf(-500)).toBe('rivalitaet');
    expect(standingOf(-50)).toBe('angespannt');
    expect(standingOf(30)).toBe('fremd');
    expect(standingOf(350)).toBe('befreundet');
    expect(standingOf(700)).toBe('vertraut');
    expect(standingOf(1000)).toBe('seelenverwandt');
    expect(heartLabel(320)).toBe('♥ 3/10');
    expect(heartLabel(-420)).toBe('Rivalität 4');
  });

  it('stimmt mit den Konstanten der Kampagne überein', () => {
    expect(ids.POINTS_MIN).toBe(POINTS_MIN);
    expect(ids.POINTS_MAX).toBe(POINTS_MAX);
    expect(ids.RIVAL_BELOW).toBe(RIVAL_BELOW);
    expect(ids.ROMANCE_HEARTS).toBe(ROMANCE_HEARTS);
    expect(ids.MAX_PARTY).toBe(MAX_PARTY);
  });
});

describe('Tägliches Ansprechen', () => {
  it('gibt einmal am Tag +20, nur ab 0 Punkten', () => {
    expect(dailyTalk({ points: 0, talkedDay: 0 }, 1)).toEqual({ first: true, delta: 20 });
    expect(dailyTalk({ points: 40, talkedDay: 1 }, 1)).toEqual({ first: false, delta: 0 });
    expect(dailyTalk({ points: -10, talkedDay: 0 }, 1)).toEqual({ first: true, delta: 0 });
    expect(dailyTalk({ points: 0, talkedDay: 0 }, 1, 10)).toEqual({ first: true, delta: 30 });
  });

  it('wählt das Tagesgespräch nach Herzstufe, Bedingung und vorhandenem Dialog', () => {
    const talks = [
      { dialogue: 'fehlt', minHearts: 0 },
      { dialogue: 'nah', minHearts: 4 },
      { dialogue: 'quest', when: { flag: 'q' } },
      { dialogue: 'alltag' },
    ];
    const exists = (id: string) => id !== 'fehlt';
    expect(pickTalk(talks, 5, flags([]), exists)).toBe('nah');
    expect(pickTalk(talks, 1, flags(['q']), exists)).toBe('quest');
    expect(pickTalk(talks, 1, flags([]), exists)).toBe('alltag');
    expect(pickTalk(undefined, 1, flags([]), exists)).toBeNull();
  });

  it('liest den Perk-Zuschlag fürs Ansprechen (talkBonus)', () => {
    const content = fixtureContent();
    (content.perks.charmant as typeof content.perks.charmant & { talkBonus: number }).talkBonus = 10;
    const state = stateWith(content, s => { s.player.perks = ['charmant', 'bastler']; });
    expect(talkBonusExtra(content, state)).toBe(10);
  });
});

describe('Geschenke', () => {
  it('kennt die Punkte je Vorliebe', () => {
    expect(GIFT_POINTS).toEqual({ loves: 80, likes: 45, neutral: 20, dislikes: -20, hates: -40 });
  });

  it('bevorzugt Gegenstands-IDs vor Stichwörtern und Varianten vor Grundvorlieben', () => {
    const prefs = { loves: ['#essen'], dislikes: ['kaffee'] };
    expect(tasteIn(prefs, 'kaffee', ['essen'])).toBe('dislikes');
    expect(tasteIn(prefs, 'brot', ['essen'])).toBe('loves');
    expect(tasteIn(prefs, 'stein', [])).toBeNull();
    const def = fixtureContent().npcs.raven;
    expect(giftTasteFor(def, 'kaffee', ['essen'], flags([]))).toBe('likes');
    expect(giftTasteFor(def, 'kaffee', ['essen'], flags(['raven-kaffee-satt']))).toBe('dislikes');
    expect(giftTasteFor(def, 'messer', [], flags(['raven-kaffee-satt']))).toBe('loves'); // Variante ohne Treffer → Grundvorlieben
    expect(giftTasteFor(undefined, 'messer', [], always)).toBe('neutral');
  });

  it('begrenzt auf 1 pro Tag und 2 pro Woche; neue Woche setzt zurück', () => {
    let rel = { giftDay: 0, giftWeek: 0, giftsThisWeek: 0 };
    expect(giftLimitOf(rel, 1)).toBeNull();
    rel = recordGift(rel, 1);
    expect(rel).toEqual({ giftDay: 1, giftWeek: 0, giftsThisWeek: 1 });
    expect(giftLimitOf(rel, 1)).toBe('day');
    expect(giftsLeftToday(rel, 1)).toBe(0);
    rel = recordGift(rel, 3);
    expect(giftLimitOf(rel, 4)).toBe('week');
    expect(giftLimitOf(rel, 8)).toBeNull(); // Montag der zweiten Woche
    rel = recordGift(rel, 8);
    expect(rel).toEqual({ giftDay: 8, giftWeek: 1, giftsThisWeek: 1 });
  });

  it('verrechnet Perk-Bonus nur auf positive Geschenke und Geburtstag ×3 auf alle', () => {
    const perk = { source: 'perk:charmant', label: 'Charmant', percent: 50 };
    const birthday = { source: 'geburtstag', label: 'Geburtstag', multiplier: 3 };
    expect(giftValue('loves').delta).toBe(80);
    expect(giftValue('loves', [perk]).delta).toBe(120);
    expect(giftValue('hates', [perk]).delta).toBe(-40);
    expect(giftValue('likes', [perk, birthday]).delta).toBe(203); // 45 × 1,5 × 3 = 202,5
    expect(giftValue('dislikes', [birthday]).delta).toBe(-60);
    expect(giftValue('neutral', [{ source: 'x', label: 'x', flat: 5 }]).delta).toBe(25);
  });

  it('sammelt Boni über die Hooks (Perks, Geburtstag)', () => {
    const content = fixtureContent();
    (content.npcs.raven as NpcDef & { birthday: Condition }).birthday = { flag: 'raven-geburtstag' };
    const state = stateWith(content, s => { s.player.perks = ['charmant']; });
    const input = { content, state, npc: 'raven', item: 'messer', taste: 'loves' as const, evaluate: flags(['raven-geburtstag']) };
    expect(perkGiftBonus(input)).toEqual([{ source: 'perk:charmant', label: 'Charmant +50 %', percent: 50 }]);
    expect(birthdayGiftBonus(input)).toMatchObject({ multiplier: 3 });
    expect(birthdayGiftBonus({ ...input, evaluate: flags([]) })).toBeNull();
    const modifiers = collectGiftModifiers(input);
    expect(modifiers.map(m => m.source)).toEqual(['perk:charmant', 'geburtstag']);
    expect(giftValue('loves', modifiers).delta).toBe(360);
    // Eigene Hooks lassen sich anhängen.
    const extra = collectGiftModifiers(input, [...GIFT_BONUS_HOOKS, () => ({ source: 'ruf', label: 'Ruf', percent: 10 })]);
    expect(extra).toHaveLength(3);
  });

  it('findet widersprüchliche Vorlieben', () => {
    expect(giftPrefsProblems({ loves: ['a'], likes: ['b'] })).toEqual([]);
    expect(giftPrefsProblems({ loves: ['a'], hates: ['a'] })[0]).toContain('liebt und hasst');
    expect(giftPrefsProblems({ likes: ['b', 'b'] })[0]).toContain('doppelt');
  });
});

describe('Herz-Ereignisse', () => {
  const event = (patch: Partial<HeartEventDef>): HeartEventDef => ({ id: 'e', hearts: 2, map: 'gasse', ...patch });

  it('erreicht Herz- und Rivalitätsstufen', () => {
    expect(eventReached(event({ hearts: 2 }), 199)).toBe(false);
    expect(eventReached(event({ hearts: 2 }), 200)).toBe(true);
    expect(eventReached(event({ hearts: -5 }), -499)).toBe(false);
    expect(eventReached(event({ hearts: -5 }), -500)).toBe(true);
    expect(eventReached(event({ hearts: 0 }), 500)).toBe(false);
    expect(eventReached(event({ hearts: 6 }), 1000, 5)).toBe(false); // Obergrenze 5 Herzen
  });

  function eventContent(): GameContent {
    const content = fixtureContent();
    content.npcs.raven.heartEvents = [
      event({ id: 're-raven-2', hearts: -2 }),
      event({ id: 'he-raven-4', hearts: 4, time: ['abend', 'nacht'] }),
      event({ id: 'he-raven-2', hearts: 2 }),
      event({ id: 'he-raven-6', hearts: 6, when: { flag: 'dach' } }),
    ];
    content.npcs.dante.heartEvents = [event({ id: 'he-dante-2', hearts: 2, map: 'bar' })];
    return content;
  }
  const query = (points: number, seen: string[] = [], slot: 'tag' | 'abend' = 'abend', set: string[] = []) => ({
    map: 'gasse', slot, evaluate: flags(set),
    relationOf: (npc: string) => (npc === 'raven' ? { points, events: seen } : { points: 0, events: [] }),
  });

  it('löst nach Karte, Tageszeit, Bedingung und nur einmal aus – niedrigste Stufe zuerst', () => {
    const content = eventContent();
    expect(dueHeartEvents(content, query(450)).map(c => c.event.id)).toEqual(['he-raven-2', 'he-raven-4']);
    expect(nextHeartEvent(content, query(450))?.event.id).toBe('he-raven-2');
    expect(nextHeartEvent(content, query(450, ['he-raven-2']))?.event.id).toBe('he-raven-4');
    expect(nextHeartEvent(content, query(450, ['he-raven-2'], 'tag'))).toBeNull(); // falsche Tageszeit
    expect(nextHeartEvent(content, query(650, ['he-raven-2', 'he-raven-4']))).toBeNull(); // Bedingung fehlt
    expect(nextHeartEvent(content, query(650, ['he-raven-2', 'he-raven-4'], 'abend', ['dach']))?.event.id).toBe('he-raven-6');
    expect(nextHeartEvent(content, query(-250))?.event.id).toBe('re-raven-2');
    expect(nextHeartEvent(content, { ...query(450), map: 'bar' })).toBeNull(); // Dante hat 0 Herzen
  });

  it('findet Ereignisse und zeigt die nächsten an', () => {
    const content = eventContent();
    expect(findHeartEvent(content, 'he-dante-2')?.npc).toBe('dante');
    expect(findHeartEvent(content, 'gibt-es-nicht')).toBeNull();
    expect(upcomingHeartEvents(content, 'raven', ['he-raven-2']).map(e => e.id)).toEqual(['re-raven-2', 'he-raven-4', 'he-raven-6']);
  });

  it('meldet ungültige Stufen, doppelte IDs und Tageszeiten', () => {
    const content = eventContent();
    expect(heartEventProblems(content)).toEqual([]);
    content.npcs.dante.heartEvents = [event({ id: 'he-raven-2', hearts: 3 }), event({ id: 'x', hearts: 11 }), event({ id: 'y', hearts: -1, time: 'mittag' as never })];
    const problems = heartEventProblems(content);
    expect(problems.some(p => p.includes('schon bei raven'))).toBe(true);
    expect(problems.some(p => p.includes('ungültige Stufe 11'))).toBe(true);
    expect(problems.some(p => p.includes('ungültige Stufe -1'))).toBe(true);
    expect(problems.some(p => p.includes('unbekannte Tageszeit'))).toBe(true);
  });
});

describe('Crew und Party', () => {
  const content = fixtureContent();

  it('rekrutiert nur Begleitfiguren mit erfüllter Bedingung, höchstens 2 in der Party', () => {
    expect(recruit(content, { recruited: [], party: [] }, 'daria', true)).toEqual({ ok: false, reason: 'Daria ist keine Begleitfigur.' });
    expect(recruit(content, { recruited: [], party: [] }, 'dante', false)).toMatchObject({ ok: false, reason: 'Dante will noch nicht mitkommen.' });
    expect(recruit(content, { recruited: [], party: [] }, 'wer', true)).toMatchObject({ ok: false });
    const one = recruit(content, { recruited: [], party: [] }, 'raven', true);
    expect(one).toEqual({ ok: true, crew: { recruited: ['raven'], party: ['raven'] }, joinedCrew: true, joinedParty: true });
    const full = recruit(content, { recruited: ['raven', 'ripper'], party: ['raven', 'ripper'] }, 'dante', true);
    expect(full).toMatchObject({ ok: true, crew: { party: ['raven', 'ripper'] }, joinedParty: false });
    if (full.ok) expect(reserveOf(full.crew)).toEqual(['dante']);
    // Bereits rekrutiert: rückt ohne erneute Prüfung nach.
    expect(recruit(content, { recruited: ['dante'], party: [] }, 'dante', false)).toMatchObject({ ok: true, joinedCrew: false, joinedParty: true });
  });

  it('entlässt aus der Party, die Figur bleibt in der Crew', () => {
    expect(dismiss({ recruited: ['raven', 'dante'], party: ['raven', 'dante'] }, 'dante')).toEqual({ crew: { recruited: ['raven', 'dante'], party: ['raven'] }, left: true });
    expect(dismiss({ recruited: ['raven'], party: [] }, 'raven').left).toBe(false);
  });

  it('prüft Party-Wünsche', () => {
    const crew = { recruited: ['raven', 'dante', 'ripper'], party: [] };
    expect(partyProblem(content, crew, ['raven', 'dante'])).toBeNull();
    expect(partyProblem(content, crew, ['raven', 'raven'])).toBeNull();
    expect(normalizeParty(['raven', 'raven'])).toEqual(['raven']);
    expect(partyProblem(content, crew, ['raven', 'dante', 'ripper'])).toBe('Höchstens 2 Begleiter.');
    expect(partyProblem(content, { recruited: [], party: [] }, ['raven'])).toBe('Raven gehört nicht zur Crew.');
    expect(partyProblem(content, crew, ['daria'])).toBe('Daria ist keine Begleitfigur.');
  });

  it('schaltet Begleiterfähigkeiten mit Herzen frei', () => {
    const def: NpcDef = { ...content.npcs.raven, companion: { ...content.npcs.raven.companion!, heartAbilities: [{ hearts: 4, ability: 'hieb' }, { hearts: 8, ability: 'wirbel' }] } };
    expect(companionAbilities(def, 3)).toEqual(['klingenwirbel']);
    expect(companionAbilities(def, 8)).toEqual(['klingenwirbel', 'hieb', 'wirbel']);
    expect(companionAbilities(content.npcs.daria, 10)).toEqual([]);
  });
});

describe('Romanze-Schalter', () => {
  it('öffnet nur freigeschaltete, gekennzeichnete Erwachsene ab 8 Herzen', () => {
    const content = { ...fixtureContent(), romance: new Set(['raven', 'daria', 'dante']) };
    expect(romanceStatus(content, 'raven', 799)).toEqual({ open: false, eligible: true, blocked: 'herzen' });
    expect(romanceStatus(content, 'raven', 800)).toEqual({ open: true, eligible: true, blocked: null });
    expect(romanceStatus(content, 'dante', 1000)).toMatchObject({ open: false, blocked: 'nicht-romanzierbar' });
    expect(romanceStatus(content, 'wer', 1000)).toMatchObject({ open: false, blocked: 'unbekannt' });
    expect(romanceStatus(fixtureContent(), 'raven', 1000)).toMatchObject({ open: false, blocked: 'nicht-freigeschaltet' });
  });

  it('sperrt Kinder immer – auch mit Schalter und Kennzeichen', () => {
    const content = { ...fixtureContent(), romance: new Set(['daria']) };
    content.npcs.daria = { ...content.npcs.daria, romanceable: true };
    expect(romanceStatus(content, 'daria', 1000)).toMatchObject({ open: false, eligible: false, blocked: 'kind' });
    expect(romanceEligible(content.npcs.daria, content.romance)).toBe(false);
  });

  it('meldet freigeschaltete Figuren, die nie 8 Herzen erreichen', () => {
    const content = { ...fixtureContent(), romance: new Set(['raven']) };
    (content.npcs.raven as NpcDef & { maxHearts: number }).maxHearts = 5;
    expect(maxHeartsOf(content.npcs.raven)).toBe(5);
    expect(relationshipProblems(content).some(p => p.includes('höchstens 5 Herzen'))).toBe(true);
    expect(romanceStatus(content, 'raven', 1000).open).toBe(false);
  });
});

describe('Beziehungsansicht und Inhaltsprüfung', () => {
  it('fasst eine Beziehung für Menüs zusammen', () => {
    const content = { ...fixtureContent(), romance: new Set(['raven']) };
    const state = stateWith(content, (s) => {
      s.clock.day = 3;
      s.relations.raven = { points: 820, met: true, talkedDay: 3, giftDay: 2, giftWeek: 0, giftsThisWeek: 1, events: [] };
      s.relations.dante = { points: -350, met: true, talkedDay: 0, giftDay: 0, giftWeek: 0, giftsThisWeek: 0, events: [] };
      s.relations.ripper = { points: 10, met: false, talkedDay: 0, giftDay: 0, giftWeek: 0, giftsThisWeek: 0, events: [] };
      s.recruited = ['raven'];
      s.party = ['raven'];
    });
    const view = relationView(content, state, 'raven');
    expect(view).toMatchObject({
      hearts: 8, rivalry: 0, standing: 'vertraut', label: '♥ 8/10', talkedToday: true, giftsLeftToday: 1, giftsLeftThisWeek: 1,
      giftLimit: null, recruited: true, inParty: true, romance: { open: true }, nextEvent: { id: 'he-raven-2' },
    });
    expect(relationView(content, state, 'dante')).toMatchObject({ rivalry: 3, standing: 'rivalitaet', nextEvent: null });
    expect(relationView(content, state, 'daria')).toMatchObject({ points: 0, met: false, hearts: 0 });
    expect(knownRelations(content, state).map(v => v.npc)).toEqual(['raven', 'dante']);
  });

  it('meldet keine Probleme im Fixture und findet Inhaltsfehler', () => {
    const content = fixtureContent();
    expect(relationshipProblems(content)).toEqual([]);
    content.npcs.raven.gifts = { loves: ['messer'], hates: ['messer'] };
    content.npcs.raven.companion = { ...content.npcs.raven.companion!, heartAbilities: [{ hearts: 12, ability: 'klingenwirbel' }] };
    content.npcs.raven.talk = [{ dialogue: 'raven-tag', minHearts: -1 }];
    (content.npcs.dante as NpcDef & { maxHearts: number }).maxHearts = 0;
    const problems = relationshipProblems(content);
    expect(problems.some(p => p.includes('liebt und hasst'))).toBe(true);
    expect(problems.some(p => p.includes('Herzstufe 12'))).toBe(true);
    expect(problems.some(p => p.includes('Herzstufe -1'))).toBe(true);
    expect(problems.some(p => p.includes('Herz-Obergrenze 0'))).toBe(true);
  });
});
