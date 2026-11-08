import { describe, expect, it } from 'vitest';
import { clampCenter, clampLabel, NAMEPLATE_HIDE, NAMEPLATE_SHOW, nearbyNameplates, onScreen, toFramePercent } from './labels';

describe('Namensschilder', () => {
  const npcs = [{ id: 'dante', x: 150, y: 0 }, { id: 'raven', x: 210, y: 0 }, { id: 'nyra', x: 600, y: 0 }];

  it('erscheinen beim Nähern, verschwinden erst weiter weg (Hysterese)', () => {
    expect(NAMEPLATE_HIDE).toBeGreaterThan(NAMEPLATE_SHOW);
    expect(nearbyNameplates([0, 0], npcs, new Set())).toEqual(new Set(['dante']));
    expect(nearbyNameplates([0, 0], npcs, new Set(['raven']))).toEqual(new Set(['dante', 'raven']));
    expect(nearbyNameplates([-50, 0], npcs, new Set(['dante', 'raven']))).toEqual(new Set(['dante']));
  });

  it('höchstens die nächsten', () => {
    const crowd = Array.from({ length: 8 }, (_, i) => ({ id: `n${i}`, x: i * 10, y: 0 }));
    expect([...nearbyNameplates([0, 0], crowd, new Set(), 190, 230, 3)]).toEqual(['n0', 'n1', 'n2']);
  });

  it('Schilder bleiben ganz im Rahmen', () => {
    expect(clampCenter(10, 100, 400)).toBe(54);
    expect(clampCenter(395, 100, 400)).toBe(346);
    expect(clampCenter(200, 100, 400)).toBe(200);
    expect(clampCenter(10, 500, 400)).toBe(200);
  });

  it('Position in Prozent der Spielfläche, Sichtprüfung und Kürzen', () => {
    expect(toFramePercent([480, 270])).toEqual([50, 50]);
    expect(onScreen([-10, 10])).toBe(false);
    expect(onScreen([-10, 10], 20)).toBe(true);
    expect(clampLabel('kurz')).toBe('kurz');
    const long = clampLabel('Ein sehr langer Titel für ein kleines Schild', 20);
    expect(long.length).toBeLessThanOrEqual(20);
    expect(long.endsWith('…')).toBe(true);
  });
});
