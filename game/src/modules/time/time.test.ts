import { describe, expect, it } from 'vitest';
import {
  DAY_END, DAY_START, SLOT_RANGES, TIME_SLOTS, WEEKDAYS, advanceClock, clockLabel, collapseLoss, collapsePlan, cycleDayOf,
  dayChanged, formatClock, isAwakeTime, minutesUntilCollapse, minutesUntilSlot, nextMorning, normalizeClock, parseClockTime,
  pickCollapseNote, shelterOf, sleepClock, slotChanged, startClockAt, timeSlotOf, weekOf, weekdayOf,
} from './index';
import * as ids from '../campaign/ids';
import type { Condition, MapDef } from '../contracts';

const always = () => true;
const flags = (set: string[]) => (condition?: Condition) =>
  condition === undefined || ('flag' in condition && set.includes(condition.flag));

describe('Spieluhr', () => {
  it('ordnet Minuten den Tageszeiten zu (Grenzen halboffen)', () => {
    expect(timeSlotOf(360)).toBe('morgen');
    expect(timeSlotOf(599)).toBe('morgen');
    expect(timeSlotOf(600)).toBe('tag');
    expect(timeSlotOf(1019)).toBe('tag');
    expect(timeSlotOf(1020)).toBe('abend');
    expect(timeSlotOf(1259)).toBe('abend');
    expect(timeSlotOf(1260)).toBe('nacht');
    expect(timeSlotOf(1559)).toBe('nacht');
    // Die Bereiche schließen lückenlos aneinander an.
    let edge = DAY_START;
    for (const slot of TIME_SLOTS) { expect(SLOT_RANGES[slot][0]).toBe(edge); edge = SLOT_RANGES[slot][1]; }
    expect(edge).toBe(DAY_END);
  });

  it('kennt Wochentage, Wochen und den 28-Tage-Festkalender (Tag 1 = Montag)', () => {
    expect(weekdayOf(1)).toBe('mo');
    expect(weekdayOf(7)).toBe('so');
    expect(weekdayOf(8)).toBe('mo');
    expect(weekdayOf(0)).toBe('mo');
    expect(weekOf(7)).toBe(0);
    expect(weekOf(8)).toBe(1);
    expect(cycleDayOf(28)).toBe(28);
    expect(cycleDayOf(29)).toBe(1);
    expect(cycleDayOf(35)).toBe(7);
  });

  it('formatiert und liest Uhrzeiten über Mitternacht hinaus', () => {
    expect(formatClock(360)).toBe('06:00');
    expect(formatClock(845)).toBe('14:05');
    expect(formatClock(1530)).toBe('01:30');
    expect(parseClockTime('14:05')).toBe(845);
    expect(parseClockTime('01:30')).toBe(1530);
    expect(parseClockTime('03:00')).toBeNull(); // nach dem Zusammenbruch
    expect(parseClockTime('25:00')).toBeNull();
    expect(clockLabel({ day: 3, minutes: 845 })).toBe('Tag 3 · Mittwoch · 14:05');
    expect(isAwakeTime(1559)).toBe(true);
    expect(isAwakeTime(1560)).toBe(false);
  });

  it('bringt ungültige Uhren in Grenzen', () => {
    expect(normalizeClock({ day: 0, minutes: 100 })).toEqual({ day: 1, minutes: DAY_START });
    expect(normalizeClock({ day: 2.7, minutes: 9999 })).toEqual({ day: 2, minutes: DAY_END - 1 });
    expect(normalizeClock({ day: Number.NaN, minutes: Number.NaN })).toEqual({ day: 1, minutes: 480 });
    expect(startClockAt()).toEqual({ day: 1, minutes: 480 });
    expect(startClockAt(100)).toEqual({ day: 1, minutes: DAY_START });
  });

  it('rechnet Minuten bis zu Tageszeit und Zusammenbruch', () => {
    expect(minutesUntilSlot({ day: 1, minutes: 480 }, 'abend')).toBe(540);
    expect(minutesUntilSlot({ day: 1, minutes: 480 }, 'morgen')).toBe(0);
    expect(minutesUntilSlot({ day: 1, minutes: 1100 }, 'tag')).toBeNull();
    expect(minutesUntilCollapse({ day: 1, minutes: 1500 })).toBe(60);
  });

  it('meldet Tageszeitwechsel beim Vorrücken', () => {
    const step = advanceClock({ day: 1, minutes: 590 }, 500); // 09:50 → 18:10
    expect(step.clock).toEqual({ day: 1, minutes: 1090 });
    expect(step.collapsed).toBe(false);
    expect(step.events).toEqual([
      { type: 'slot', day: 1, from: 'morgen', to: 'tag', at: 600 },
      { type: 'slot', day: 1, from: 'tag', to: 'abend', at: 1020 },
    ]);
    expect(slotChanged(step.events)).toBe(true);
    expect(dayChanged(step.events)).toBe(false);
    expect(advanceClock({ day: 1, minutes: 480 }, 10).events).toEqual([]);
  });

  it('bricht um 02:00 zusammen und beginnt den nächsten Tag; der Rest verfällt', () => {
    const step = advanceClock({ day: 4, minutes: 1200 }, 2000);
    expect(step.clock).toEqual({ day: 5, minutes: DAY_START });
    expect(step.collapsed).toBe(true);
    expect(step.minutes).toBe(360);
    expect(step.events).toEqual([
      { type: 'slot', day: 4, from: 'abend', to: 'nacht', at: 1260 },
      { type: 'collapse', day: 4 },
      { type: 'day', day: 5, weekday: 'fr', reason: 'collapse' },
    ]);
    // Genau bis 02:00 reicht schon.
    expect(advanceClock({ day: 1, minutes: 1500 }, 60).collapsed).toBe(true);
    expect(advanceClock({ day: 1, minutes: 1500 }, 59).collapsed).toBe(false);
  });

  it('ignoriert ungültige oder nicht positive Angaben', () => {
    for (const minutes of [0, -5, Number.NaN, Number.POSITIVE_INFINITY]) {
      const step = advanceClock({ day: 1, minutes: 480 }, minutes);
      expect(step).toEqual({ clock: { day: 1, minutes: 480 }, events: [], minutes: 0, collapsed: false });
    }
    expect(advanceClock({ day: 1, minutes: 480 }, 0.4).clock.minutes).toBe(481); // mindestens eine Minute
  });

  it('schläft bis 06:00 des Folgetags, auch nach Mitternacht', () => {
    expect(sleepClock({ day: 2, minutes: 1300 })).toMatchObject({ clock: { day: 3, minutes: 360 }, minutes: 500, collapsed: false });
    expect(sleepClock({ day: 2, minutes: 1530 }).clock).toEqual({ day: 3, minutes: 360 });
    expect(sleepClock({ day: 2, minutes: 400 }).events).toEqual([{ type: 'day', day: 3, weekday: 'mi', reason: 'sleep' }]);
    expect(nextMorning({ day: 100_000, minutes: 900 })).toEqual({ day: 100_000, minutes: 360 });
  });

  it('stimmt mit den Konstanten der Kampagne überein', () => {
    expect(ids.DAY_START).toBe(DAY_START);
    expect(ids.DAY_END).toBe(DAY_END);
    expect(ids.TIME_SLOTS).toEqual(TIME_SLOTS);
    expect(ids.WEEKDAYS).toEqual(WEEKDAYS);
  });
});

describe('Zusammenbruch', () => {
  const home = { map: 'quartier', entry: 'bett', collapseNotes: ['Schlaf ist auch ein Plan. – C. K.', { text: 'Du hast „Ja, Master“ gemurmelt. – C. K.', when: { flag: 'act2' } }] };

  it('kostet 10 % der Credits (abgerundet, nie negativ)', () => {
    expect(collapseLoss(150)).toBe(15);
    expect(collapseLoss(9)).toBe(0);
    expect(collapseLoss(-50)).toBe(0);
    expect(collapseLoss(1000, 25)).toBe(250);
  });

  it('wählt Notizen deterministisch und nur mit erfüllter Bedingung', () => {
    expect(pickCollapseNote(home.collapseNotes, 1, 3, flags([]))).toBe('Schlaf ist auch ein Plan. – C. K.');
    const seen = new Set<string>();
    for (let day = 1; day < 40; day++) seen.add(pickCollapseNote(home.collapseNotes, 7, day, flags(['act2'])) ?? '');
    expect(seen.size).toBe(2);
    expect(pickCollapseNote(home.collapseNotes, 7, 5, always)).toBe(pickCollapseNote(home.collapseNotes, 7, 5, always));
    expect(pickCollapseNote([], 1, 1, always)).toBeNull();
    expect(pickCollapseNote(undefined, 1, 1, always)).toBeNull();
  });

  it('weckt im Unterschlupf oder auf einem Notschlafplatz ohne Verlust', () => {
    const base = { credits: 200, seed: 1, day: 2, map: 'werkstatt', home, evaluate: flags(['dante-4']) };
    expect(collapsePlan(base)).toMatchObject({ lost: 20, wake: { map: 'quartier', entry: 'bett' }, sheltered: false, heal: 'full' });
    const shelter = { entry: 'sofa', when: { flag: 'dante-4' } };
    expect(collapsePlan({ ...base, shelter })).toMatchObject({ lost: 0, wake: { map: 'werkstatt', entry: 'sofa' }, sheltered: true });
    expect(collapsePlan({ ...base, shelter: { when: { flag: 'fehlt' } } }).sheltered).toBe(false);
    expect(collapsePlan({ ...base, shelter: { keepCredits: false, heal: 10, notes: ['Sofa.'] } })).toMatchObject({ lost: 20, heal: 10, note: 'Sofa.', wake: { map: 'werkstatt' } });
  });

  it('liest den Notschlafplatz tolerant aus der Karte', () => {
    const map = { id: 'x', shelter: { entry: 'sofa' } } as unknown as MapDef;
    expect(shelterOf(map)).toEqual({ entry: 'sofa' });
    expect(shelterOf({ id: 'y' } as unknown as MapDef)).toBeNull();
    expect(shelterOf({ id: 'z', shelter: [1] } as unknown as MapDef)).toBeNull();
    expect(shelterOf(undefined)).toBeNull();
  });
});
