// Inhaltsprüfung Kampf: Arenen, Begegnungen, Gegner und Fähigkeiten aus content/ sind regelkonform und jede
// Begegnung lässt sich mit der Akt-Party vollständig durchspielen (Autopilot).
import { describe, expect, it } from 'vitest';
import { createActState } from '../modules/campaign/state';
import { bagFromInventory, createBattle, partyFromCampaign, simulateBattle, validateCombatContent } from '../modules/combat';
import { content } from './index';

describe('Kampfinhalte', () => {
  it('bestehen die Kampfprüfung', () => {
    expect(validateCombatContent(content)).toEqual([]);
  });

  it.each(Object.keys(content.encounters))('Begegnung %s läuft mit der Akt-Party bis zum Ende', (encounter) => {
    const state = createActState(content, 1, 3);
    for (const seed of [1, 2, 3, 4, 5]) {
      const battle = createBattle(content, {
        encounter, seed, party: partyFromCampaign(content, state), bag: bagFromInventory(content, state.inventory),
      });
      const result = simulateBattle(content, battle);
      expect(result.error).toBeNull();
      expect(result.state.outcome, `${encounter} / Seed ${seed}`).not.toBeNull();
    }
  });
});
