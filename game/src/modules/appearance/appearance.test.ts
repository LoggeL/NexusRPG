import { describe, expect, it } from 'vitest';
import { appearanceKey, applyPatch, DEFAULT_APPEARANCE, normalize, parseAppearance, randomAppearance } from './index';

describe('Charakter-Baukasten (Regeln)', () => {
  it('Maske und Gesichtsplatte schließen sich aus', () => {
    const both = { ...DEFAULT_APPEARANCE, cyber: { ...DEFAULT_APPEARANCE.cyber, facePlate: true }, acc: { ...DEFAULT_APPEARANCE.acc, mask: 'tuch' as const } };
    expect(normalize(both).cyber.facePlate).toBe(false);
    const withPlate = applyPatch(DEFAULT_APPEARANCE, { cyber: { facePlate: true } }).appearance;
    const masked = applyPatch(withPlate, { acc: { mask: 'atemmaske' } });
    expect(masked.appearance.cyber.facePlate).toBe(false);
    expect(masked.dropped).toEqual(['Gesichtsplatte abgelegt']);
    const plated = applyPatch(masked.appearance, { cyber: { facePlate: true } });
    expect(plated.appearance.acc.mask).toBe('keine');
    expect(plated.dropped).toEqual(['Maske abgelegt']);
  });

  it('prüft die Struktur streng und ersetzt unbekannte Teile je Feld', () => {
    expect('error' in parseAppearance({ v: 1 }, DEFAULT_APPEARANCE)).toBe(true);
    expect('error' in parseAppearance({ ...DEFAULT_APPEARANCE, cyber: { ...DEFAULT_APPEARANCE.cyber, eyes: 'ja' } }, DEFAULT_APPEARANCE)).toBe(true);
    const parsed = parseAppearance({ ...DEFAULT_APPEARANCE, hair: 'haar-gibtsnicht', colorA: 'rot' }, DEFAULT_APPEARANCE);
    expect('appearance' in parsed && parsed.appearance.hair).toBe(DEFAULT_APPEARANCE.hair);
    expect('appearance' in parsed && parsed.appearance.colorA).toBe('rot');
    expect('replaced' in parsed && parsed.replaced).toHaveLength(1);
  });

  it('Zufall hält gesperrte Kategorien fest und bleibt gültig', () => {
    let seed = 7;
    const random = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    for (let i = 0; i < 50; i++) {
      const a = randomAppearance(random, DEFAULT_APPEARANCE, new Set(['haare', 'farben']));
      expect(a.hair).toBe(DEFAULT_APPEARANCE.hair);
      expect(a.colorB).toBe(DEFAULT_APPEARANCE.colorB);
      expect(normalize(a)).toEqual(a);
      expect('replaced' in parseAppearance(a, DEFAULT_APPEARANCE) && (parseAppearance(a, DEFAULT_APPEARANCE) as { replaced: string[] }).replaced).toEqual([]);
    }
  });

  it('appearanceKey ist stabil und berücksichtigt Ausrüstung', () => {
    expect(appearanceKey(DEFAULT_APPEARANCE)).toBe(appearanceKey(JSON.parse(JSON.stringify(DEFAULT_APPEARANCE))));
    expect(appearanceKey(DEFAULT_APPEARANCE, [{ jacket: 'jacke-leder' }])).not.toBe(appearanceKey(DEFAULT_APPEARANCE));
  });
});
