import { describe, expect, it } from 'vitest';
import type { MapDef, NpcPresence } from '../../modules/contracts';
import { absoluteMinute, diffPresences, exitCenter, nearestExit } from './presence';

const at = (npc: string, x: number, y: number, extra: Partial<NpcPresence> = {}): NpcPresence => ({ npc, map: 'karte', at: [x, y], facing: 's', source: 'schedule', ...extra });

describe('Tagesablauf-Wechsel', () => {
  it('ordnet Bleiben, Hinlaufen, Neuaufbau, Kommen und Gehen zu', () => {
    const before = [at('dante', 100, 100), at('raven', 200, 200), at('nyra', 300, 300), at('hunter', 400, 400, { pose: 'sitting' })];
    const after = [at('dante', 100, 100), at('raven', 250, 260), at('aria', 50, 50), at('hunter', 400, 400)];
    const diff = diffPresences(before, after);
    expect(diff.stay.map((entry) => entry.after.npc)).toEqual(['dante']);
    expect(diff.move.map((entry) => entry.after.npc)).toEqual(['raven']);
    expect(diff.rebuild.map((entry) => entry.after.npc)).toEqual(['hunter']);
    expect(diff.enter.map((entry) => entry.npc)).toEqual(['aria']);
    expect(diff.leave.map((entry) => entry.npc)).toEqual(['nyra']);
  });

  it('neuer Dialog oder neue Blickrichtung am selben Ort: bleibt (mit neuer Anwesenheit)', () => {
    const diff = diffPresences([at('dante', 100, 100)], [at('dante', 100, 100, { facing: 'n', dialogue: 'abend' })]);
    expect(diff.stay).toHaveLength(1);
    expect(diff.stay[0].after.dialogue).toBe('abend');
  });

  it('doppelte Einträge zählen einmal', () => {
    const diff = diffPresences([], [at('dante', 1, 1), at('dante', 2, 2)]);
    expect(diff.enter).toHaveLength(1);
  });

  it('nächster Ausgang meidet Türen hinter Checks', () => {
    const map = {
      exits: [
        { id: 'hinten', rect: [0, 0, 20, 20], to: 'b', entry: 'x', label: 'Hinten', check: 'schloss' },
        { id: 'vorne', rect: [500, 500, 20, 20], to: 'b', entry: 'x', label: 'Vorne' },
      ],
    } as unknown as MapDef;
    expect(nearestExit(map, [5, 5])?.id).toBe('vorne');
    expect(exitCenter(map.exits[1])).toEqual([510, 510]);
    expect(nearestExit({ exits: [] } as unknown as MapDef, [0, 0])).toBeNull();
  });

  it('fortlaufende Spielminute', () => {
    expect(absoluteMinute({ day: 2, minutes: 60 }) - absoluteMinute({ day: 1, minutes: 1380 })).toBe(120);
  });
});
