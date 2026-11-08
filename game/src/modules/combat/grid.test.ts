import { describe, expect, it } from 'vitest';
import {
  bestCoverAt, cellsInRadius, coverAgainst, distance, facingToward, isWalkable, lineOfSight, parseLayout, relationTo,
} from './grid';

const LAYOUT = [
  '............',
  '.....h......',
  '.....H......',
  '.....#......',
  '............',
  '......~.....',
  '............',
  'P..........E',
];

describe('Arena-Raster', () => {
  it('prüft Layouts auf 8 × 12 bekannte Zeichen', () => {
    expect(parseLayout(LAYOUT)).toEqual(LAYOUT);
    expect(() => parseLayout(LAYOUT.slice(1))).toThrow(/8 Zeilen/);
    expect(() => parseLayout([...LAYOUT.slice(1), '...........'])).toThrow(/12 Zeichen/);
    expect(() => parseLayout([...LAYOUT.slice(1), '...........x'])).toThrow(/unbekanntes Zeichen/);
  });

  it('kennt begehbare Felder', () => {
    expect(isWalkable(LAYOUT, [0, 0])).toBe(true);
    expect(isWalkable(LAYOUT, [5, 1])).toBe(false);
    expect(isWalkable(LAYOUT, [5, 2])).toBe(false);
    expect(isWalkable(LAYOUT, [5, 3])).toBe(false);
    expect(isWalkable(LAYOUT, [6, 5])).toBe(true);
    expect(isWalkable(LAYOUT, [-1, 0])).toBe(false);
    expect(isWalkable(LAYOUT, [12, 0])).toBe(false);
  });

  it('misst Abstände in Feldern (Manhattan) und Umkreise', () => {
    expect(distance([0, 0], [3, 4])).toBe(7);
    expect(cellsInRadius([0, 0], 1)).toEqual([[0, 0], [1, 0], [0, 1]]);
    expect(cellsInRadius([5, 5], 1)).toHaveLength(5);
    expect(cellsInRadius([5, 5], 2)).toHaveLength(13);
  });

  it('sperrt die Sicht durch volle Deckung und Hindernisse, nicht durch halbe Deckung', () => {
    expect(lineOfSight(LAYOUT, [2, 1], [9, 1])).toBe(true); // halbe Deckung dazwischen
    expect(lineOfSight(LAYOUT, [2, 2], [9, 2])).toBe(false); // volle Deckung
    expect(lineOfSight(LAYOUT, [2, 3], [9, 3])).toBe(false); // Hindernis
    expect(lineOfSight(LAYOUT, [2, 4], [9, 4])).toBe(true);
  });

  it('zählt Deckung direkt neben Angreifer oder Ziel nicht als Sichtsperre', () => {
    // Ziel steht direkt hinter der vollen Deckung: sichtbar, aber gedeckt.
    expect(lineOfSight(LAYOUT, [9, 2], [4, 2])).toBe(true);
    expect(coverAgainst(LAYOUT, [4, 2], [9, 2]).value).toBe(40);
  });

  it('gibt Deckung nur gegen Angriffe aus der Richtung des Deckungsobjekts', () => {
    expect(coverAgainst(LAYOUT, [4, 1], [9, 1]).value).toBe(20);
    expect(coverAgainst(LAYOUT, [4, 1], [0, 1]).value).toBe(0);
    expect(coverAgainst(LAYOUT, [4, 2], [9, 4]).value).toBe(40); // schräg, Hauptachse waagerecht
    expect(coverAgainst(LAYOUT, [4, 2], [4, 7]).value).toBe(0);
    // Nebenachse zählt, wenn sie mindestens halb so lang ist.
    expect(coverAgainst(LAYOUT, [5, 4], [8, 1]).value).toBe(40);
    expect(coverAgainst(LAYOUT, [5, 4], [11, 2]).value).toBe(0);
    expect(bestCoverAt(LAYOUT, [4, 2])).toBe(40);
    expect(bestCoverAt(LAYOUT, [0, 7])).toBe(0);
  });

  it('bestimmt Blickrichtung und Flanke', () => {
    expect(facingToward([0, 0], [5, 1])).toBe('e');
    expect(facingToward([5, 5], [5, 1])).toBe('n');
    expect(facingToward([5, 5], [5, 5], 'w')).toBe('w');
    const target = { cell: [5, 5] as const, facing: 'e' as const };
    expect(relationTo(target, [8, 5])).toBe('front');
    expect(relationTo(target, [5, 2])).toBe('side');
    expect(relationTo(target, [3, 4])).toBe('back');
  });
});
