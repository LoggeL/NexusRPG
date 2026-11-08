// Darstellungsbezogene Prüfung aller Karten im Inhalt (generisch – gilt für Test- wie echten Inhalt):
// Passanten, Patrouillen, Lichtpunkte und Verdecker liegen dort, wo die Erkundung sie sinnvoll zeigen kann.
import { describe, expect, it } from 'vitest';
import { content } from '../../content';
import type { MapId, Point } from '../../modules/contracts';
import { createNavigation } from '../../modules/navigation';
import { planPassersby } from './ambient';
import { TIME_SLOTS } from './lighting';
import { FOOT, NAV_CELL_EXPLORE } from './navigationAdapter';

const mapIds = Object.keys(content.maps) as MapId[];

describe('Karten für die Erkundung', () => {
  for (const mapId of mapIds) {
    const map = content.maps[mapId];
    const nav = createNavigation(map, { foot: FOOT, cell: NAV_CELL_EXPLORE });
    const inside = ([x, y]: Point) => x >= 0 && y >= 0 && x <= map.size[0] && y <= map.size[1];

    it(`${mapId}: Passanten-Routen und Gegner-Patrouillen sind begehbar`, () => {
      for (const route of map.ambient?.routes ?? []) for (const point of route) expect(nav.walkable(point[0], point[1]), `Passant ${point}`).toBe(true);
      for (const group of map.encounters ?? []) {
        for (const point of [group.at, ...(group.patrol ?? [])]) expect(nav.walkable(point[0], point[1]), `${group.id} ${point}`).toBe(true);
      }
      for (const placement of map.npcs ?? []) for (const point of placement.patrol ?? []) expect(nav.walkable(point[0], point[1]), `${placement.id} ${point}`).toBe(true);
    });

    it(`${mapId}: geplante Passanten starten auf begehbarem Grund`, () => {
      for (const slot of TIME_SLOTS) {
        const plans = planPassersby(map.ambient, slot, {
          seed: `${mapId}:1:${slot}`, size: map.size, walkable: nav.walkable, findPath: nav.findPath,
        });
        for (const plan of plans) {
          expect(nav.walkable(plan.start[0], plan.start[1]) || nav.nearestWalkable(plan.start, 12) !== null, `${plan.id} ${plan.start}`).toBe(true);
          expect(plan.route.length).toBeGreaterThan(0);
        }
      }
    });

    it(`${mapId}: Lichtpunkte und Verdecker liegen auf der Karte`, () => {
      for (const light of map.lights ?? []) {
        expect(inside(light.at), `Licht ${light.at}`).toBe(true);
        expect(light.radius).toBeGreaterThan(0);
        expect(light.color).toMatch(/^#[0-9a-f]{3}([0-9a-f]{3})?([0-9a-f]{2})?$/i);
      }
      for (const fg of map.foreground ?? []) {
        const [x, y, w, h] = fg.rect;
        expect(inside([x, y]) && inside([x + w, y + h]), `Verdecker ${fg.rect}`).toBe(true);
        expect(fg.baseY).toBeGreaterThanOrEqual(y);
      }
    });
  }
});
