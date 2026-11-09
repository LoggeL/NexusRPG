// Inhaltsprüfung (design.md §8): Verweise, Erreichbarkeit, Hotspots auf Laufflächen, Check-Alternativen,
// dazu ein kurzer Durchlauf der Ankunft in Akt 1 (Abzieher am Bahnsteig) über die echte Kampagnen-Fassade.
import { describe, expect, it } from 'vitest';
import { createCampaign, findContentProblems, runEnterTriggers } from '../modules/campaign';
import type { CheckDef, MapDef, Point } from '../modules/contracts';
import { createDialogueSession } from '../modules/dialogue';
import { navGrid, nearestWalkablePoint } from '../modules/navigation';
import { content } from './index';
import { PART_WARNINGS } from './part';

const NAV = { cell: 8 };
/** Orte müssen höchstens so weit von begehbarem Boden entfernt sein (NPC_RADIUS 60 − 12 Rand). */
const SPOT_REACH = 48;

/** Flutfüllung ab dem ersten Einstieg; liefert, ob ein Punkt (bzw. sein nächster begehbarer Punkt) erreichbar ist. */
function reachability(map: MapDef) {
  const grid = navGrid(map, NAV);
  const index = (p: Point) => Math.floor(p[1] / grid.cell) * grid.cols + Math.floor(p[0] / grid.cell);
  // Laufinseln sind erlaubt (z. B. Lieferhof der Glasarkaden mit eigenem Einstieg): Flutfüllung ab allen Einstiegen.
  const seen = new Uint8Array(grid.walkable.length);
  const queue = Object.values(map.entries).map((entry) => index(entry.at));
  for (const i of queue) seen[i] = 1;
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

describe('Nexus-Inhalt', () => {
  it('ist der echte Inhalt, kein Testinhalt', () => {
    expect(content.meta).toEqual({ id: 'nexus', title: 'Nexus – Das RPG' });
    const ids = (record: Record<string, unknown>) => Object.keys(record).filter((id) => id.startsWith('test-'));
    expect([...ids(content.maps), ...ids(content.dialogues), ...ids(content.quests), ...ids(content.items), ...ids(content.npcs)]).toEqual([]);
  });

  it('führt alle Inhaltsteile ohne Warnung zusammen (keine doppelten IDs, alle Spots vorhanden)', () => {
    expect(PART_WARNINGS).toEqual([]);
  });

  it('hat keine Inhaltsfehler (alle Verweise aufgelöst)', () => {
    expect(findContentProblems(content)).toEqual([]);
  });

  it('enthält die Grundbausteine von Akt 1', () => {
    expect(content.maps[content.start.map]).toBeDefined();
    expect(content.maps[content.start.map].entries[content.start.entry]).toBeDefined();
    expect(content.maps[content.home.map].entries[content.home.entry]).toBeDefined();
    expect(content.cutscenes[content.start.cutscene ?? '']).toBeDefined();
    for (const id of ['bahnhof-mitte', 'neon-gasse', 'high-voltage', 'crew-quartier', 'schrottmarkt', 'digitech-areal']) {
      expect(content.maps[id], id).toBeDefined();
    }
    for (const id of ['raven', 'dante', 'hunter', 'aria', 'vega', 'nyra']) {
      expect(content.npcs[id]?.schedule?.length, id).toBeGreaterThan(0);
    }
    for (const id of ['main-0-digitech', 'main-1-ankunft', 'main-1-probezeit', 'main-1-dexter', 'main-1-raven', 'main-1-auf-raven', 'main-1-dante', 'main-1-der-plan']) {
      expect(content.quests[id]?.kind, id).toBe('main');
    }
    expect(Object.keys(content.items).length).toBeGreaterThan(100);
    expect(Object.keys(content.shops).length).toBeGreaterThan(10);
    expect(Object.keys(content.origins).sort()).toEqual([
      'origin-ex-wache', 'origin-gossenkind', 'origin-knastvogel', 'origin-oberstadt', 'origin-oednis', 'origin-schrott',
    ]);
    expect(Object.keys(content.perks)).toHaveLength(21); // 20 lernbare Perks (world.md §2.5) + Vex' Dachläuferin
    for (const encounter of Object.values(content.encounters)) expect(content.arenas[encounter.arena], encounter.id).toBeDefined();
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
      // Orte tragen oft sitzende Figuren (Hocker, Bank, Zelle): erreichbar heißt ansprechbar (Ansprechradius 60 mit Rand).
      for (const [name, spot] of Object.entries(map.spots ?? {})) expect(ok(spot.at, SPOT_REACH), `Punkt ${name}`).toBe(true);
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

  it('lässt sich über die Fassade durchspielen (Ankunft: Check oder Weg ohne Check)', async () => {
    for (const ausstrahlung of [5, 3]) {
      const campaign = createCampaign(content, { storage: null, seed: 7, random: () => 0.5 });
      const created = campaign.createCharacter({
        name: 'Testfigur', look: 'look-neonbomber', origin: 'origin-schrott',
        attributes: { technik: 3, koerper: 5, reflexe: 3 + (5 - ausstrahlung), ausstrahlung, strasse: 3 },
      });
      expect(created.ok, created.message).toBe(true);
      campaign.apply([{ setFlag: 'prolog_done' }]);
      campaign.setLocation('bahnhof-mitte', content.maps['bahnhof-mitte'].entries.start.at, 's');
      const played: string[] = [];
      const host = {
        playCutscene: async (id: string) => { played.push(id); campaign.apply(content.cutscenes[id]?.effects ?? []); },
        runDialogue: async (id: string) => { played.push(id); },
        handleOutcome: async () => undefined,
      };
      await runEnterTriggers(campaign, content.maps['bahnhof-mitte'], host);
      expect(campaign.state().quests['main-1-ankunft']?.status).toBe('active');
      expect(played).toContain('main-1-ankunft-abzieher');

      const session = createDialogueSession(campaign, 'main-1-ankunft-abzieher');
      for (let i = 0; i < 10 && !session.view().choices?.length; i++) session.advance();
      const choices = session.view().choices ?? [];
      const talk = choices.find(c => c.check?.checkId === 'gc-02');
      expect(talk?.check?.threshold).toBe(5);
      if (ausstrahlung >= 5) {
        expect(talk?.enabled).toBe(true);
        session.choose(talk?.index ?? -1);
        expect(campaign.evaluate({ flag: 'ankunft_oma_tipp' })).toBe(true);
      } else {
        expect(talk?.enabled).toBe(false);
        expect(talk?.check?.missing).toBe(5 - ausstrahlung);
        // Weg ohne Check: zehn Credits zahlen (Schrottkind startet mit 50).
        const pay = choices.find(c => c.text.includes('Zehn Credits'));
        expect(pay?.enabled).toBe(true);
        session.choose(pay?.index ?? -1);
      }
      expect(campaign.evaluate({ flag: 'ankunft_abzieher_geloest' })).toBe(true);
      expect(campaign.evaluate({ questStep: 'main-1-ankunft', step: 'abzieher' })).toBe(true);
      expect(campaign.state().phone.some(entry => entry.id === 'ph-hunter-18-uhr')).toBe(true);
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
