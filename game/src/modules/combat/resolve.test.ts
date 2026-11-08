import { describe, expect, it } from 'vitest';
import { battle, combatData, place } from './__fixtures__/combat';
import { damageOf, hitChance, strikePreview } from './resolve';
import { HIT_MAX, HIT_MIN } from './rules';

const sum = (parts: { value: number }[]) => parts.reduce((s, p) => s + p.value, 0);

describe('Trefferchance', () => {
  it('rechnet 75 + 5 × ΔReflexe auf freiem Feld', () => {
    const state = battle('duell');
    const held = place(state, 'held', [2, 4]);
    const gegner = place(state, 'schlaeger#1', [7, 4], { facing: 'w' });
    const hit = hitChance(state, held, gegner);
    expect(hit.chance).toBe(85);
    expect(hit.parts).toEqual([{ label: 'Grundwert', value: 75 }, { label: 'Reflexe', value: 10 }]);
    expect(hitChance(state, gegner, held).chance).toBe(65);
  });

  it('zieht halbe (20) und volle (40) Deckung ab', () => {
    const state = battle('deckung');
    const held = place(state, 'held', [9, 1]);
    const ziel = place(state, 'schuetze#1', [4, 1], { facing: 'e' });
    expect(hitChance(state, held, ziel).cover).toBe(20);
    expect(hitChance(state, held, ziel).chance).toBe(75 + 0 - 20);
    place(state, 'schuetze#1', [4, 2]);
    place(state, 'held', [9, 1]);
    const full = hitChance(state, held, ziel);
    expect(full.cover).toBe(40);
    expect(full.parts).toContainEqual({ label: 'Volle Deckung', value: -40 });
  });

  it('gibt +15 für die Flanke (Angriff von hinten)', () => {
    const state = battle('duell');
    const held = place(state, 'held', [2, 4]);
    const gegner = place(state, 'schlaeger#1', [5, 4], { facing: 'e' });
    const hit = hitChance(state, held, gegner);
    expect(hit.flank).toBe(true);
    expect(hit.chance).toBe(85 + 15 > HIT_MAX ? HIT_MAX : 100);
    expect(sum(hit.parts)).toBe(100);
  });

  it('berücksichtigt Markiert, Geschützt, Waffe, Fähigkeit, Bonus und Überwachungsfeuer', () => {
    const data = combatData();
    const state = battle('duell');
    const held = place(state, 'held', [2, 4], { bonus: { hit: 5, damage: 0, armor: 0, hp: 0, move: 0, initiative: 0, bandwidth: 0, firewall: 0 } });
    held.weapon = { ...held.weapon, hit: 5 };
    const gegner = place(state, 'schlaeger#1', [7, 4], { facing: 'w', status: { markiert: 1, geschuetzt: 1 } });
    const hit = hitChance(state, held, gegner, { ability: data.abilities.schnellschuss, reaction: true });
    const labels = hit.parts.map(p => p.label);
    expect(labels).toEqual(['Grundwert', 'Reflexe', 'Markiert', 'Geschützt', 'Waffe', 'Fähigkeit', 'Kampfbonus', 'Überwachungsfeuer']);
    expect(hit.chance).toBe(75 + 10 + 20 - 20 + 5 - 10 + 5 - 10);
  });

  it('begrenzt die Chance auf 5..95', () => {
    const state = battle('duell');
    const held = place(state, 'held', [2, 4], {
      attributes: { technik: 1, koerper: 1, reflexe: 1, ausstrahlung: 1, strasse: 1 },
      bonus: { hit: -30, damage: 0, armor: 0, hp: 0, move: 0, initiative: 0, bandwidth: 0, firewall: 0 },
    });
    const gegner = place(state, 'schlaeger#1', [7, 4], { attributes: { technik: 1, koerper: 1, reflexe: 10, ausstrahlung: 1, strasse: 1 }, status: { geschuetzt: 1 } });
    expect(hitChance(state, held, gegner).chance).toBe(HIT_MIN);
    expect(hitChance(state, gegner, held, {}).chance).toBe(HIT_MAX);
  });
});

describe('Schaden', () => {
  it('rechnet Waffenschaden + Attribut − Panzerung, mindestens 1', () => {
    const state = battle('duell');
    const held = state.units.find(u => u.id === 'held')!;
    const gegner = state.units.find(u => u.id === 'schlaeger#1')!;
    // Fernwaffe 5 + Reflexe 6 − Panzerung 1
    expect(damageOf(held, gegner, { crit: false }).damage).toBe(10);
    // Nahkampf: Schlagring-Schläger 4 + Körper 5 − Panzerung 1 des Helden
    expect(damageOf(gegner, held, { crit: false }).damage).toBe(8);
    gegner.armor = 50;
    expect(damageOf(held, gegner, { crit: false }).damage).toBe(1);
  });

  it('nutzt Waffenschaden nur, wenn die Fähigkeit zur Waffe passt', () => {
    const data = combatData();
    const state = battle('duell');
    const held = state.units.find(u => u.id === 'held')!;
    const gegner = state.units.find(u => u.id === 'schlaeger#1')!;
    // Schnellschuss (fernkampf) mit Fernwaffe: 5 + 1 + Reflexe 6 − 1
    expect(damageOf(held, gegner, { crit: false, ability: data.abilities.schnellschuss }).damage).toBe(11);
    // Hieb (nahkampf) mit Fernwaffe in der Hand: nur 2 + Körper 5 − 1
    expect(damageOf(held, gegner, { crit: false, ability: data.abilities.hieb }).damage).toBe(6);
    // Granate: eigener Schaden ohne Waffe und ohne Attribut
    expect(damageOf(held, gegner, { crit: false, ability: data.abilities.granate }).damage).toBe(5);
  });

  it('macht Volltreffer ×1,5 bei Flanke ohne Deckung oder auf Markiert', () => {
    const state = battle('duell');
    const held = place(state, 'held', [2, 4]);
    const gegner = place(state, 'schlaeger#1', [5, 4], { facing: 'e' });
    const flank = strikePreview(state, held, gegner);
    expect(flank.crit).toBe(true);
    expect(flank.damage).toBe(15);
    expect(flank.damageParts.at(-1)).toEqual({ label: 'Volltreffer', value: 5 });
    gegner.facing = 'w';
    expect(strikePreview(state, held, gegner).crit).toBe(false);
    gegner.status.markiert = 2;
    expect(strikePreview(state, held, gegner).crit).toBe(true);
  });
});

describe('Vorschau eines Schlags', () => {
  it('liefert Reichweite, Sicht, Chance und erwarteten Schaden', () => {
    const state = battle('deckung');
    const held = place(state, 'held', [9, 2]);
    const ziel = place(state, 'schuetze#1', [3, 2], { facing: 'e' });
    const blocked = strikePreview(state, held, ziel);
    expect(blocked.sight).toBe(false);
    expect(blocked.valid).toBe(false);
    expect(blocked.reason).toBe('Keine freie Sicht.');
    place(state, 'held', [5, 5]);
    const open = strikePreview(state, held, ziel);
    expect(open.valid).toBe(true);
    expect(Math.abs(open.expected - (open.damage * open.chance) / 100)).toBeLessThanOrEqual(0.05 + 1e-9);
    held.weapon = held.weapons[1];
    const far = strikePreview(state, held, ziel);
    expect(far.inRange).toBe(false);
    expect(far.reason).toBe('Außer Reichweite.');
  });

  it('wertet Gesprächsaktionen über die Moral aus', () => {
    const data = combatData();
    const state = battle('duell');
    const held = place(state, 'held', [2, 4]);
    const gegner = place(state, 'schlaeger#1', [5, 4]);
    const preview = strikePreview(state, held, gegner, { ability: data.abilities['drohung'] });
    expect(preview.autoHit).toBe(true);
    expect(preview.morale).toBe(40);
    gegner.morale = undefined;
    expect(strikePreview(state, held, gegner, { ability: data.abilities['drohung'] }).valid).toBe(false);
  });
});
