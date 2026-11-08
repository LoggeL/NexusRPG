// Integrationstest: echte (Test-)Inhalte gegen Regel-Engine, Navigation mit den Parametern der Darstellung,
// URL-Einstiege und Kamera-Hilfen – ohne Phaser.
import { describe, expect, it } from 'vitest';
import { content } from '../content';
import { createCampaign, findContentProblems } from '../modules/campaign';
import type { MapDef, Point } from '../modules/contracts';
import { createNavigation } from '../modules/navigation';
import { GAME_H, GAME_W } from '../presentation/dom/layout';
import { cameraBounds, cameraScroll } from '../presentation/phaser/camera';
import { FOOT, NAV_CELL_EXPLORE } from '../presentation/phaser/navigationAdapter';
import { createRandom, seededRandom } from './composition';
import { parseEntry } from './urlEntry';

const nav = (map: MapDef) => createNavigation(map, { foot: FOOT, cell: NAV_CELL_EXPLORE });

describe('Integration Inhalte ↔ Regeln ↔ Darstellungsparameter', () => {
  it('Engine-Lint findet keine Probleme', () => {
    expect(findContentProblems(content)).toEqual([]);
  });

  it('Einstiege, Orte, Hotspots und Bett sind mit der Fußbreite der Erkundung erreichbar', () => {
    for (const map of Object.values(content.maps)) {
      const n = nav(map);
      const entries = Object.entries(map.entries);
      expect(entries.length, map.id).toBeGreaterThan(0);
      for (const [id, entry] of entries) expect(n.walkable(entry.at[0], entry.at[1]), `${map.id}#${id}`).toBe(true);
      const from = entries[0]![1].at;
      const reach = (target: Point, radius: number, label: string) => {
        const path = n.findPath(from, target);
        const end = path.length ? path[path.length - 1]! : from;
        expect(Math.hypot(end[0] - target[0], end[1] - target[1]), label).toBeLessThanOrEqual(radius);
      };
      for (const [id, spot] of Object.entries(map.spots ?? {})) reach(spot.at, 16, `${map.id} Ort ${id}`);
      for (const hotspot of map.hotspots) reach(hotspot.at, hotspot.radius ?? 56, `${map.id} Hotspot ${hotspot.id}`);
      if (map.bed) reach(map.bed.at, 56, `${map.id} Bett`);
    }
  });

  it('Akt-Warps landen begehbar auf ihrer Startkarte', () => {
    for (const act of [1, 2, 3] as const) {
      const campaign = createCampaign(content, { storage: null, seed: 7 });
      campaign.warpAct(act);
      const state = campaign.state();
      expect(state.act).toBe(act);
      expect(state.player.created).toBe(true);
      const map = content.maps[state.map]!;
      expect(nav(map).walkable(state.position[0], state.position[1]), `Akt ${act}`).toBe(true);
    }
  });

  it('Schnellreise kostet 30 Minuten, kein zusätzlicher Kartenwechsel-Aufschlag', () => {
    const campaign = createCampaign(content, { storage: null, seed: 7 });
    campaign.warpAct(1);
    const station = Object.values(content.stations)[0]!;
    campaign.apply([{ unlockStation: station.id }]);
    const before = campaign.state().clock.minutes;
    const result = campaign.fastTravel(station.id);
    expect(result.ok, result.message).toBe(true);
    expect(result.outcome.requests).toContainEqual({ travel: station.map, entry: station.entry, minutes: 0 });
    expect(campaign.state().clock.minutes).toBe(before + 30);
  });

  it('URL-Einstiege', () => {
    expect(parseEntry('', content).entry).toEqual({ kind: 'title' });
    expect(parseEntry('?scene=title', content).entry).toEqual({ kind: 'title' });
    expect(parseEntry('?newchar', content).entry).toEqual({ kind: 'newchar' });
    expect(parseEntry('?act=2&time=nacht', content).entry).toEqual({ kind: 'act', act: 2, time: 'nacht' });
    expect(parseEntry('?map=test-innen&entry=tuer', content).entry).toEqual({ kind: 'map', map: 'test-innen', entry: 'tuer' });
    expect(parseEntry('?battle=test-schlaeger', content).entry).toEqual({ kind: 'battle', encounter: 'test-schlaeger' });
    const bad = parseEntry('?act=6&map=nirgendwo&time=mittag', content);
    expect(bad.entry).toEqual({ kind: 'title' });
    expect(bad.errors).toHaveLength(3);
    expect(parseEntry('?debug', content).debug).toBe(true);
  });

  it('Kamera: Grenzen und Ausschnitt für große und kleine Karten', () => {
    expect(cameraBounds([1536, 1024])).toEqual([0, 0, 1536, 1024]);
    expect(cameraScroll([0, 0], cameraBounds([1536, 1024]))).toEqual([0, 0]);
    expect(cameraScroll([1536, 1024], cameraBounds([1536, 1024]))).toEqual([1536 - GAME_W, 1024 - GAME_H]);
    expect(cameraScroll([768, 512], cameraBounds([1536, 1024]))).toEqual([768 - GAME_W / 2, 512 - GAME_H / 2]);
    // 800×400 ist kleiner als die Spielfläche → mittig, unabhängig von der Figur.
    const small = cameraBounds([800, 400]);
    expect(small).toEqual([-(GAME_W - 800) / 2, -(GAME_H - 400) / 2, GAME_W, GAME_H]);
    expect(cameraScroll([0, 0], small)).toEqual(cameraScroll([800, 400], small));
  });

  it('Zufall: Startwert ist deterministisch', () => {
    const a = seededRandom(5);
    const b = seededRandom(5);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
    const random = createRandom();
    random.seed(9);
    const first = [random.random(), random.random()];
    random.seed(9);
    expect([random.random(), random.random()]).toEqual(first);
  });
});
