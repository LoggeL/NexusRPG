import { describe, expect, it } from 'vitest';
import { fixtureContent } from '../__fixtures__/content';
import { createCampaign } from '../campaign';
import type { GameContent } from '../contracts';
import { PLAYER_UNIT_ID, bagFromInventory, battleResult, battleSeed, companionUnitId, partyFromCampaign } from './campaign';
import { createBattle } from './setup';
import { simulateBattle } from './simulate';

function content(): GameContent {
  const c = fixtureContent();
  c.abilities.zielhilfe = { id: 'zielhilfe', name: 'Zielhilfe', description: 'Markiert.', kind: 'fernkampf', ap: 1, target: 'enemy', range: 6, status: { id: 'markiert', turns: 2 } };
  c.abilities.konter = { id: 'konter', name: 'Konter', description: 'Schlag.', kind: 'nahkampf', ap: 1, target: 'enemy', range: 1, damage: 2 };
  c.cyberware.optik.ability = 'zielhilfe';
  c.cyberware.optik.combat = { hit: 5, armor: 1 };
  c.items.pistole = { id: 'pistole', name: 'Pistole', description: 'Peng.', category: 'waffe', icon: 'pistole', price: 100, weapon: { kind: 'fernkampf', damage: 4, range: 5 } };
  c.npcs.raven.companion!.heartAbilities = [{ hearts: 2, ability: 'konter' }];
  return c;
}

function campaignInAct2(c: GameContent) {
  const campaign = createCampaign(c, { storage: null, seed: 5, random: () => 0.5 });
  campaign.warpAct(2);
  return campaign;
}

describe('Kampf ↔ Kampagne', () => {
  it('baut die Party aus Spielfigur und aktiven Begleitern', () => {
    const c = content();
    const campaign = campaignInAct2(c);
    campaign.apply([{ give: 'pistole' }, { give: 'optik-teil' }, { installCyberware: 'optik' }, { relation: 'raven', delta: 250 }]);
    campaign.equip('pistole');
    campaign.equip('messer');
    const party = partyFromCampaign(c, campaign.state());
    expect(party.map(p => p.id)).toEqual([PLAYER_UNIT_ID, companionUnitId('raven')]);
    const [player, raven] = party;
    expect(player.attributes.reflexe).toBe(campaign.attribute('reflexe'));
    expect(player.maxHp).toBe(campaign.maxHp());
    expect(player.armor).toBe(1);
    expect(player.bonus?.hit).toBe(5);
    expect(player.weapons.map(w => w.kind)).toEqual(['fernkampf', 'nahkampf']);
    expect(player.abilities).toEqual(['zielhilfe']);
    expect(raven.abilities).toEqual(['klingenwirbel', 'konter']);
    expect(raven.hp).toBe(30);
  });

  it('packt nur kampftaugliche Gegenstände ins Gepäck', () => {
    const c = content();
    expect(bagFromInventory(c, { kaffee: 3, messer: 1, chip: 1, unbekannt: 2 })).toEqual({ kaffee: 3 });
  });

  it('liefert einen stabilen Seed je Lage und Begegnung', () => {
    const campaign = campaignInAct2(content());
    const state = campaign.state();
    expect(battleSeed(state, 'schlaeger')).toBe(battleSeed(state, 'schlaeger'));
    expect(battleSeed(state, 'schlaeger')).not.toBe(battleSeed({ ...state, stats: { ...state.stats, battlesWon: 1 } }, 'schlaeger'));
  });

  it('übergibt das Kampfergebnis vollständig an finishBattle', () => {
    const c = content();
    const campaign = campaignInAct2(c);
    const state = campaign.state();
    const xpBefore = state.player.xp;
    const creditsBefore = state.credits;
    const battle = createBattle(c, {
      encounter: 'schlaeger', seed: battleSeed(state, 'schlaeger'), party: partyFromCampaign(c, state), bag: bagFromInventory(c, state.inventory),
    });
    const sim = simulateBattle(c, battle);
    expect(sim.state.outcome).toBe('win');
    const result = battleResult(sim.state);
    expect(result.encounter).toBe('schlaeger');
    expect(result.xp).toBe(20);
    campaign.finishBattle(result);
    const after = campaign.state();
    expect(after.player.xp).toBe(xpBefore + 50 + 20);
    expect(after.credits).toBe(creditsBefore + 30 + (result.credits ?? 0));
    expect(after.player.hp).toBe(Math.max(1, result.playerHp));
    expect(campaign.evaluate({ won: 'schlaeger' })).toBe(true);
    expect(after.relations.raven.points).toBeGreaterThanOrEqual(5);
  });
});
