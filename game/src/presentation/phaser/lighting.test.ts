import { describe, expect, it } from 'vitest';
import type { LightDef } from '../../modules/contracts';
import { lightAlpha, lightSlots, neonFlicker, parseColor, TIME_SLOTS, tintFor } from './lighting';

const neon: LightDef = { at: [0, 0], radius: 100, color: '#ff3fa4' };

describe('Tageszeit-Beleuchtung', () => {
  it('Tag neutral, Nacht außen am dunkelsten, innen schwächer', () => {
    expect(tintFor('outdoor', 'tag')[1]).toBeLessThanOrEqual(0.06);
    expect(tintFor('outdoor', 'nacht')[1]).toBeGreaterThan(tintFor('outdoor', 'abend')[1]);
    for (const slot of TIME_SLOTS) expect(tintFor('indoor', slot)[1]).toBeLessThanOrEqual(tintFor('outdoor', slot)[1]);
    expect(tintFor('underground', 'nacht')).toEqual([0, 0]);
  });

  it('Lichtpunkte: draußen standardmäßig abends und nachts, drinnen immer', () => {
    expect(lightSlots(neon, 'outdoor')).toEqual(['abend', 'nacht']);
    expect(lightSlots(neon, 'indoor')).toEqual(TIME_SLOTS);
    expect(lightSlots({ ...neon, slots: ['nacht'] }, 'outdoor')).toEqual(['nacht']);
  });

  it('nachts stärker als abends, tagsüber aus, im Untergrund immer an', () => {
    expect(lightAlpha(neon, 'outdoor', 'tag')).toBe(0);
    expect(lightAlpha(neon, 'outdoor', 'nacht')).toBeGreaterThan(lightAlpha(neon, 'outdoor', 'abend'));
    expect(lightAlpha({ ...neon, intensity: 0.5 }, 'underground', 'tag')).toBe(0.5);
    expect(lightAlpha({ ...neon, intensity: 3 }, 'indoor', 'tag')).toBe(1);
  });

  it('liest CSS-Farben', () => {
    expect(parseColor('#ff3fa4')).toBe(0xff3fa4);
    expect(parseColor('#3ef')).toBe(0x33eeff);
    expect(parseColor('#3ef2ff80')).toBe(0x3ef2ff);
    expect(parseColor('rot')).toBe(0xffffff);
  });

  it('Neon flackert nur ohne reduzierte Bewegung und bleibt im Rahmen', () => {
    expect(neonFlicker(1234, 2, true)).toBe(1);
    for (let t = 0; t < 20000; t += 97) {
      const value = neonFlicker(t, 1, false);
      expect(value).toBeGreaterThan(0.5);
      expect(value).toBeLessThanOrEqual(1.05);
    }
  });
});
