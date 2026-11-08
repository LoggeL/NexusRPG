// Reine Darstellungslogik ohne Phaser/DOM: Crew-Kette, Stellschrauben, Einstiege, Spielstände, Eingabe.
import { describe, expect, it } from 'vitest';
import { parseEntry } from '../app/urlEntry';
import { content } from '../content';
import type { Facing, MapId, Point } from '../modules/contracts';
import { createNavigation } from '../modules/navigation';
import { InputRouter } from '../platform/input/router';
import { hasOwn, isEndedSave } from './guards';
import { FOOT, NAV_CELL_EXPLORE } from './phaser/navigationAdapter';
import { FOLLOWER_SPACING, MS_PER_GAME_MINUTE, SPEED } from './phaser/tuning';
import { buildTrail, pointAlong, polylineLength } from './phaser/trail';

const mapIds = Object.keys(content.maps) as MapId[];

describe('Crew-Kette', () => {
  for (const mapId of mapIds) {
    it(`${mapId}: zwei Begleiter stehen begehbar und getrennt hinter der Spielfigur`, () => {
      const map = content.maps[mapId];
      const nav = createNavigation(map, { foot: FOOT, cell: NAV_CELL_EXPLORE });
      const spacing = FOLLOWER_SPACING;
      for (const [entryId, entry] of Object.entries(map.entries)) {
        const start: Point = nav.walkable(entry.at[0], entry.at[1]) ? entry.at : nav.nearestWalkable(entry.at, 120) ?? entry.at;
        const trail = buildTrail(start, entry.facing as Facing, 3 * spacing, (x, y) => nav.walkable(x, y), 4);
        const chain = [start, ...[1, 2].map((index) => pointAlong(trail, index * spacing, start))];
        for (const point of chain.slice(1)) expect(nav.walkable(point[0], point[1]), `${mapId}/${entryId} begehbar`).toBe(true);
        const pathLength = polylineLength(trail);
        const fits = Math.min(2, Math.floor(pathLength / spacing));
        expect(fits, `${mapId}/${entryId} Spur ${Math.round(pathLength)} px`).toBeGreaterThanOrEqual(1);
        for (let i = 1; i <= fits; i++) {
          const distance = Math.hypot(chain[i][0] - chain[i - 1][0], chain[i][1] - chain[i - 1][1]);
          expect(distance, `${mapId}/${entryId} Glied ${i}`).toBeGreaterThanOrEqual(spacing * 0.6);
        }
      }
    });
  }
});

describe('Stellschrauben der Erkundung', () => {
  it('quert eine 1536er-Karte in rund 9 Sekunden und zählt 1 Spielminute je 0,7 s', () => {
    expect(1536 / SPEED).toBeGreaterThan(7);
    expect(1536 / SPEED).toBeLessThan(11);
    expect(MS_PER_GAME_MINUTE).toBe(700);
  });
});

describe('Einstiege und Spielstände', () => {
  it('geerbte Objektschlüssel sind keine Karten oder Cutscenes', () => {
    for (const bad of ['toString', '__proto__', 'constructor', 'hasOwnProperty']) {
      expect(parseEntry(`?map=${bad}`, content).entry.kind).toBe('title');
      expect(parseEntry(`?cut=${bad}`, content).entry.kind).toBe('title');
      expect(hasOwn(content.maps, bad)).toBe(false);
    }
    expect(parseEntry('?map=test-strasse', content).entry).toEqual({ kind: 'map', map: 'test-strasse' });
  });

  it('erkennt beendete Spielstände', () => {
    expect(isEndedSave(JSON.stringify({ version: 1, ended: true }))).toBe(true);
    expect(isEndedSave(JSON.stringify({ version: 1, ended: false }))).toBe(false);
    expect(isEndedSave('kaputt')).toBe(false);
    expect(isEndedSave(null)).toBe(false);
  });
});

describe('Eingabe: Audio-Freischaltung', () => {
  it('meldet jede Geste (nicht nur die erste), bis abgemeldet wird', () => {
    const target = new EventTarget();
    const router = new InputRouter(target as unknown as Window);
    let calls = 0;
    const stop = router.onUserGesture(() => { calls++; });
    // Touch: pointerdown aktiviert Audio nicht, erst pointerup/touchend/click.
    for (const type of ['pointerdown', 'pointerup', 'touchend', 'click']) target.dispatchEvent(new Event(type));
    expect(calls).toBe(4);
    stop();
    target.dispatchEvent(new Event('click'));
    expect(calls).toBe(4);
    router.dispose();
  });
});
