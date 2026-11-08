import { describe, expect, it } from 'vitest';
import { fixtureContent } from '../__fixtures__/content';
import type { ClockState, Condition, GameContent, NpcId } from '../contracts';
import {
  activePlacements, entryMatches, pickScheduleEntry, presentOn, resolveSpot, scheduleAt, scheduleProblems, weekPlan, whereIs,
} from './index';

const flags = (set: string[]) => (condition?: Condition) =>
  condition === undefined || ('flag' in condition && set.includes(condition.flag)) || ('notFlag' in condition && !set.includes(condition.notFlag));
const at = (day: number, minutes: number, party: NpcId[] = []) => ({ clock: { day, minutes } as ClockState, party });

function content(): GameContent {
  const base = fixtureContent();
  base.maps.bar = {
    ...base.maps.bar,
    spots: { tresen: { at: [400, 300], facing: 'e' } },
    npcs: [{ id: 'raven-verhoer', npc: 'raven', at: [800, 600], facing: 'n', when: { flag: 'verhoer' }, dialogue: 'raven-nah', pose: 'sitzen' }],
  };
  base.npcs.raven = {
    ...base.npcs.raven,
    schedule: [
      { slot: 'abend', days: ['do'], place: { map: 'bar', at: [300, 300] } },
      { when: { flag: 'quest-hafen' }, place: 'away' },
      { slot: ['morgen', 'tag'], place: { map: 'gasse', at: 'bar', facing: 'w' }, patrol: [[700, 400], [760, 400]] },
      { slot: 'abend', place: { map: 'bar', at: 'tresen' }, dialogue: 'raven-tag' },
      { place: 'away' },
    ],
  };
  return base;
}

describe('Tagesablauf', () => {
  it('wählt den ersten passenden Eintrag nach Tageszeit, Wochentag und Bedingung', () => {
    const entries = content().npcs.raven.schedule!;
    expect(pickScheduleEntry(entries, { slot: 'abend', weekday: 'do', evaluate: flags([]) })).toBe(entries[0]);
    expect(pickScheduleEntry(entries, { slot: 'abend', weekday: 'mi', evaluate: flags([]) })).toBe(entries[3]);
    expect(pickScheduleEntry(entries, { slot: 'tag', weekday: 'mi', evaluate: flags(['quest-hafen']) })).toBe(entries[1]);
    expect(pickScheduleEntry(entries, { slot: 'nacht', weekday: 'mi', evaluate: flags([]) })).toBe(entries[4]);
    expect(pickScheduleEntry([], { slot: 'nacht', weekday: 'mi', evaluate: flags([]) })).toBeNull();
    expect(entryMatches({ days: [], place: 'away' }, { slot: 'tag', weekday: 'so', evaluate: flags([]) })).toBe(true);
  });

  it('löst benannte Punkte auf und lehnt unbekannte ab', () => {
    const c = content();
    expect(resolveSpot(c.maps.bar, 'tresen')).toEqual({ at: [400, 300], facing: 'e' });
    expect(resolveSpot(c.maps.bar, [10, 20])).toEqual({ at: [10, 20] });
    expect(resolveSpot(c.maps.bar, 'nirgends')).toBeNull();
    expect(resolveSpot(undefined, 'tresen')).toBeNull();
  });

  it('beantwortet „wo steht Figur X jetzt?“', () => {
    const c = content();
    // Montag 08:00
    expect(whereIs(c, at(1, 480), 'raven', flags([]))).toEqual({
      kind: 'map',
      presence: { npc: 'raven', map: 'gasse', at: [700, 400], facing: 'w', source: 'schedule', patrol: [[700, 400], [760, 400]] },
    });
    // Montag 18:00, benannter Punkt mit Blickrichtung und eigenem Dialog
    expect(whereIs(c, at(1, 1080), 'raven', flags([]))).toMatchObject({ kind: 'map', presence: { map: 'bar', at: [400, 300], facing: 'e', dialogue: 'raven-tag' } });
    // Donnerstag 18:00: Wochentags-Sonderfall
    expect(whereIs(c, at(4, 1080), 'raven', flags([]))).toMatchObject({ kind: 'map', presence: { at: [300, 300] } });
    expect(whereIs(c, at(1, 1300), 'raven', flags([]))).toEqual({ kind: 'away' });
    expect(whereIs(c, at(1, 480), 'raven', flags(['quest-hafen']))).toEqual({ kind: 'away' });
    expect(whereIs(c, at(1, 480, ['raven']), 'raven', flags([]))).toEqual({ kind: 'party' });
    expect(whereIs(c, at(1, 480), 'ripper', flags([]))).toEqual({ kind: 'unknown' }); // ohne Tagesablauf
    expect(whereIs(c, at(1, 480), 'dante', flags([]))).toEqual({ kind: 'unknown' }); // unbekannter Punkt
    expect(whereIs(c, at(1, 480), 'niemand', flags([]))).toEqual({ kind: 'unknown' });
  });

  it('lässt feste Platzierungen den Tagesablauf überall überschreiben', () => {
    const c = content();
    const evaluate = flags(['verhoer']);
    expect(activePlacements(c, 'raven', evaluate)).toHaveLength(1);
    expect(whereIs(c, at(1, 480), 'raven', evaluate)).toMatchObject({ kind: 'map', presence: { map: 'bar', source: 'raven-verhoer', pose: 'sitzen' } });
    // Morgens stünde sie laut Ablauf in der Gasse – dort fehlt sie jetzt, in der Bar sitzt sie.
    expect(presentOn(c, at(1, 480), 'gasse', evaluate).some(p => p.npc === 'raven')).toBe(false);
    expect(presentOn(c, at(1, 480), 'bar', evaluate).find(p => p.npc === 'raven')).toMatchObject({ at: [800, 600], facing: 'n', dialogue: 'raven-nah' });
  });

  it('zeigt auf einer Karte nur anwesende Figuren, ohne Party-Mitglieder', () => {
    const c = content();
    const present = presentOn(c, at(1, 480), 'gasse', flags([]));
    expect(present.map(p => p.npc).sort()).toEqual(['daria', 'raven']);
    expect(presentOn(c, at(1, 480, ['raven']), 'gasse', flags([])).map(p => p.npc)).toEqual(['daria']);
    expect(presentOn(c, at(1, 1300), 'gasse', flags([])).map(p => p.npc)).toEqual([]); // Daria schläft nachts im Nest
    expect(presentOn(c, at(1, 480), 'unbekannt', flags([]))).toEqual([]);
  });

  it('liefert Tagesablauf und Wochenplan ohne Zustand', () => {
    const c = content();
    expect(scheduleAt(c, 'raven', { slot: 'abend', weekday: 'do', evaluate: flags([]) })).toMatchObject({ kind: 'map', presence: { at: [300, 300] } });
    const plan = weekPlan(c, 'raven', flags([]));
    expect(plan.mo.morgen).toEqual({ map: 'gasse', spot: 'bar' });
    expect(plan.do.abend).toEqual({ map: 'bar', spot: [300, 300] });
    expect(plan.fr.abend).toEqual({ map: 'bar', spot: 'tresen' });
    expect(plan.so.nacht).toBe('away');
    expect(weekPlan(c, 'ripper', flags([])).mo.tag).toBeNull();
  });

  it('meldet Strukturfehler in Tagesabläufen', () => {
    const c = content();
    expect(scheduleProblems(c)).toEqual([]);
    c.npcs.dante.schedule = [
      { place: 'away' },
      { slot: 'mittag' as never, place: 'away' },
      { slot: [], days: ['xx' as never], place: 'away' },
    ];
    const problems = scheduleProblems(c);
    expect(problems.some(p => p.includes('unbekannte Tageszeit'))).toBe(true);
    expect(problems.some(p => p.includes('leere Tageszeitliste'))).toBe(true);
    expect(problems.some(p => p.includes('unbekannter Wochentag'))).toBe(true);
    expect(problems.some(p => p.includes('verdeckt alle folgenden'))).toBe(true);
  });
});
