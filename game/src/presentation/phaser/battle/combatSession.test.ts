// Brücke zu modules/combat mit dem echten Inhalt: ein Kampf läuft über den Controller bis zum Ergebnis.
import { describe, expect, it } from 'vitest';
import { content } from '../../../content';
import { createInitialState } from '../../../modules/campaign/state';
import { createCombatSessionFactory } from './combatSession';
import { BattleController, type BattleHudView, type BattleWorldView, type HudModel } from './controller';

const tick = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

describe('CombatSession', () => {
  const encounterId = Object.keys(content.encounters)[0];

  it('liefert Felder, Ziele und spielt einen Kampf bis zum Ergebnis', async () => {
    const state = createInitialState(content, 7);
    const factory = createCombatSessionFactory(content, () => state);
    const session = factory(content.encounters[encounterId]);
    expect(session).not.toBeNull();
    if (!session) return;
    expect(session.state().units.some((unit) => unit.team === 'enemy')).toBe(true);

    let model: HudModel | null = null;
    const world: BattleWorldView = { setHighlights: () => {}, sync: () => {}, focus: () => {}, play: async () => {} };
    const hud: BattleHudView = {
      update: (value) => { model = value; }, banner: async () => {}, say: async () => {}, log: () => {}, toast: () => {}, showResult: async () => {},
    };
    const controller = new BattleController({ port: session, content, world, hud, inventory: () => state.inventory });
    const running = controller.run();
    // Spielerzüge: angreifen, sonst auf den Gegner zulaufen, sonst Zug beenden.
    for (let step = 0; step < 400 && !controller.isFinished; step++) {
      await tick();
      if (!controller.isPlayerTurn) continue;
      const active = session.state().active;
      if (!active) continue;
      const targets = session.targets(active, { type: 'attack' }).filter((preview) => !preview.blocked);
      if (targets[0]) {
        expect(targets[0].chance).toBeGreaterThanOrEqual(5);
        controller.tap(targets[0].cell, 'mouse');
        continue;
      }
      const reach = session.reachable(active);
      const actions = (model as HudModel | null)?.actions ?? [];
      if (reach.length && actions.find((entry) => entry.key === 'move')?.enabled) {
        const foe = session.state().units.find((unit) => unit.team === 'enemy' && unit.state === 'active');
        const best = [...reach].sort((a, b) => (foe ? Math.abs(a.cell[0] - foe.cell[0]) + Math.abs(a.cell[1] - foe.cell[1]) - (Math.abs(b.cell[0] - foe.cell[0]) + Math.abs(b.cell[1] - foe.cell[1])) : 0))[0];
        controller.tap(best.cell, 'mouse');
        continue;
      }
      controller.action('end');
    }
    const result = await running;
    expect(result?.encounter).toBe(encounterId);
    expect(['win', 'lose', 'fled']).toContain(result?.outcome);
  });
});
