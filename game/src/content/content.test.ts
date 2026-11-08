// Inhaltsprüfung (design.md §8): Verweise, Erreichbarkeit, Hotspots auf Laufflächen, Check-Alternativen,
// dazu ein kurzer Durchlauf des Testinhalts über die echte Kampagnen-Fassade.
import { describe, expect, it } from 'vitest';
import { createCampaign, findContentProblems, runEnterTriggers } from '../modules/campaign';
import type { CheckDef, MapDef, Point } from '../modules/contracts';
import { createDialogueSession } from '../modules/dialogue';
import { navGrid, nearestWalkablePoint } from '../modules/navigation';
import { content } from './index';

const NAV = { cell: 8 };

/** Flutfüllung ab dem ersten Einstieg; liefert, ob ein Punkt (bzw. sein nächster begehbarer Punkt) erreichbar ist. */
function reachability(map: MapDef) {
  const grid = navGrid(map, NAV);
  const index = (p: Point) => Math.floor(p[1] / grid.cell) * grid.cols + Math.floor(p[0] / grid.cell);
  const startEntry = Object.values(map.entries)[0];
  const seen = new Uint8Array(grid.walkable.length);
  const queue = [index(startEntry.at)];
  seen[queue[0]] = 1;
  while (queue.length) {
    const i = queue.pop() as number;
    const c = i % grid.cols;
    const neighbours = [c > 0 ? i - 1 : -1, c < grid.cols - 1 ? i + 1 : -1, i - grid.cols, i + grid.cols];
    for (const n of neighbours) {
      if (n < 0 || n >= grid.walkable.length || seen[n] || !grid.walkable[n]) continue;
      seen[n] = 1;
      queue.push(n);
    }
  }
  return (p: Point, radius: number) => {
    const near = nearestWalkablePoint(map, p, NAV);
    if (!near || Math.hypot(near[0] - p[0], near[1] - p[1]) > radius) return false;
    const inner = nearestWalkablePoint(map, [near[0], near[1]], NAV) ?? near;
    return seen[index(inner)] === 1 || [[0, 4], [0, -4], [4, 0], [-4, 0]].some(([dx, dy]) => seen[index([inner[0] + dx, inner[1] + dy])] === 1);
  };
}

describe('Testinhalt', () => {
  it('ist als Testinhalt gekennzeichnet', () => {
    expect(content.meta.test).toBe(true);
  });

  it('hat keine Inhaltsfehler (alle Verweise aufgelöst)', () => {
    expect(findContentProblems(content)).toEqual([]);
  });

  it('enthält die geforderten Grundbausteine', () => {
    expect(content.maps['test-strasse'].size).toEqual([1536, 1024]);
    expect(content.maps['test-innen'].size).toEqual([1024, 768]);
    expect(content.npcs.raven.schedule?.length).toBeGreaterThan(0);
    expect(content.npcs.dante.schedule?.length).toBeGreaterThan(0);
    expect(Object.keys(content.items)).toHaveLength(5); // inkl. Nagelpistole, Kurierweste (Vex)
    expect(Object.keys(content.shops)).toHaveLength(1);
    expect(Object.keys(content.quests)).toHaveLength(1);
    const encounter = Object.values(content.encounters)[0];
    expect(content.arenas[encounter.arena]).toBeDefined();
    const hasCheck = Object.values(content.dialogues).some(d => d.nodes.some(n => n.choices?.some(c => c.check)));
    expect(hasCheck).toBe(true);
  });

  it('erreicht jede Karte über Ausgänge vom Start aus', () => {
    const reached = new Set([content.start.map]);
    const queue = [content.start.map];
    while (queue.length) {
      const map = content.maps[queue.pop() as string];
      for (const exit of map.exits) if (!reached.has(exit.to)) { reached.add(exit.to); queue.push(exit.to); }
    }
    expect([...reached].sort()).toEqual(Object.keys(content.maps).sort());
  });

  for (const map of Object.values(content.maps)) {
    it(`${map.id}: Einstiege, Punkte, Hotspots, Ausgänge und Bett sind begehbar erreichbar`, () => {
      const ok = reachability(map);
      for (const [name, entry] of Object.entries(map.entries)) expect(ok(entry.at, 1), `Einstieg ${name}`).toBe(true);
      for (const [name, spot] of Object.entries(map.spots ?? {})) expect(ok(spot.at, 1), `Punkt ${name}`).toBe(true);
      for (const spot of map.hotspots) expect(ok(spot.at, spot.radius ?? 56), `Hotspot ${spot.id}`).toBe(true);
      for (const exit of map.exits) {
        const [x, y, w, h] = exit.rect;
        expect(ok([x + w / 2, y + h / 2], Math.max(w, h)), `Ausgang ${exit.id}`).toBe(true);
      }
      for (const group of map.encounters ?? []) expect(ok(group.at, 1), `Gegnergruppe ${group.id}`).toBe(true);
      if (map.bed) expect(ok(map.bed.at, 56), 'Bett').toBe(true);
    });
  }

  it('bietet zu jeder Check-Option einen anderen Weg (Wahl ohne Check im selben Knoten)', () => {
    for (const dialogue of Object.values(content.dialogues)) {
      for (const node of dialogue.nodes) {
        if (!node.choices?.some(choice => choice.check)) continue;
        const free = node.choices.filter(choice => !choice.check && !choice.requires && !choice.when);
        expect(free.length, `${dialogue.id}/${node.id}`).toBeGreaterThan(0);
      }
    }
  });

  it('hat für jeden Welt-Check an Ausgängen einen offenen Zugang zur selben Zielkarte', () => {
    for (const map of Object.values(content.maps)) {
      for (const exit of map.exits.filter(e => e.check)) {
        const open = Object.values(content.maps).some(m => m.exits.some(e => e.to === exit.to && !e.check && !e.when));
        expect(open, `${map.id}/${exit.id}`).toBe(true);
      }
    }
  });

  it('startet als Vex mit festen Werten, Perk und Kurierweste', () => {
    const campaign = createCampaign(content, { storage: null, seed: 3 });
    const created = campaign.createCharacter({ name: '', look: 'look-neonbomber', origin: '', attributes: { technik: 3, koerper: 3, reflexe: 3, ausstrahlung: 3, strasse: 3 }, preset: 'vex' });
    expect(created.ok, created.message).toBe(true);
    const player = campaign.state().player;
    expect(player.name).toBe('Vex Schrapnell');
    expect(player.attributes).toEqual({ technik: 3, koerper: 4, reflexe: 6, ausstrahlung: 3, strasse: 5 });
    expect(player.perks).toContain('dachlaeuferin');
    expect(campaign.state().inventory.kurierweste).toBe(1);
    expect(campaign.evaluate({ playerIs: 'vex' })).toBe(true);
    expect(campaign.portraitKey('player')).toBe('portrait-vex');
    const other = createCampaign(content, { storage: null });
    expect(other.importSave(campaign.exportSave())).toBe(true);
    expect(other.state().player.preset).toBe('vex');
  });

  it('nutzt nur Checks mit Schwelle 3–10', () => {
    const all: CheckDef[] = Object.values(content.checks);
    for (const check of all) expect(check.threshold).toBeGreaterThanOrEqual(3);
    for (const check of all) expect(check.threshold).toBeLessThanOrEqual(10);
  });

  it('lässt sich über die Fassade durchspielen (beide Lösungswege der Quest)', async () => {
    for (const technik of [7, 3]) {
      const campaign = createCampaign(content, { storage: null, seed: 7, random: () => 0.5 });
      const rest = 4 - (technik - 3);
      const created = campaign.createCharacter({
        name: 'Testfigur', look: 'look-neonbomber', origin: 'tueftler',
        attributes: { technik, koerper: 3 + rest, reflexe: 3, ausstrahlung: 3, strasse: 3 },
      });
      expect(created.ok, created.message).toBe(true);
      campaign.setLocation('test-strasse', [240, 760], 'e');
      const host = { playCutscene: async () => undefined, runDialogue: async () => undefined, handleOutcome: async () => undefined };
      await runEnterTriggers(campaign, content.maps['test-strasse'], host);
      expect(campaign.state().quests['test-chip']?.status).toBe('active');

      const talk = campaign.talkTo('raven');
      expect(talk.dialogue).toBe('test-raven-chip');
      const session = createDialogueSession(campaign, 'test-raven-chip');
      session.advance();
      const choices = session.view().choices ?? [];
      const techChoice = choices.find(c => c.check?.checkId === 'test-chip-technik');
      expect(techChoice?.check?.threshold).toBe(6);
      if (technik + 1 >= 6) {
        // Tüftler: +1 Technik aus der Herkunft.
        expect(techChoice?.enabled).toBe(true);
        session.choose(techChoice?.index ?? -1);
      } else {
        expect(techChoice?.enabled).toBe(false);
        expect(techChoice?.check?.missing).toBe(6 - (technik + 1));
        const alt = choices.find(c => c.text.includes('Dante'));
        session.choose(alt?.index ?? -1);
        expect(campaign.state().inventory.datenchip).toBe(1);
        const scan = createDialogueSession(campaign, 'test-dante-alltag');
        const scanChoice = scan.view().choices?.find(c => c.text.includes('Chip'));
        expect(scanChoice?.enabled).toBe(true);
        scan.choose(scanChoice?.index ?? -1);
      }
      const quest = campaign.state().quests['test-chip'];
      expect(quest?.status).toBe('done');
      expect(campaign.state().phone.some(entry => entry.id === 'test-raven-hallo')).toBe(true);
    }
  });

  it('startet jeden Akt aus actStarts ohne Fehler', () => {
    const campaign = createCampaign(content, { storage: null, seed: 3 });
    for (const act of [1, 2, 3] as const) {
      campaign.warpAct(act);
      const state = campaign.state();
      expect(state.act).toBe(act);
      expect(content.maps[state.map]).toBeDefined();
    }
  });
});
