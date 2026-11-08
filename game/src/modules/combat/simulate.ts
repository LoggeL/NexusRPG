// Kampfregeln: Vollautomatische Kämpfe (Tests, Balancing, Debug „Kampf automatisch auflösen“).
import { runAiTurn } from './ai';
import type { CombatData, CombatEvent, CombatState } from './types';

export interface SimulationResult {
  state: CombatState;
  events: CombatEvent[];
  turns: number;
  /** Fehler der Regeln (sollte nie auftreten). */
  error: string | null;
}

/** Übergibt alle Party-Einheiten an die KI (Autopilot). */
export function withAutopilot(state: CombatState): CombatState {
  return { ...state, units: state.units.map(unit => ({ ...unit, controller: 'ai' as const })) };
}

/** Spielt einen Kampf bis zum Ende (oder bis `maxTurns` Züge vergangen sind). */
export function simulateBattle(data: CombatData, state: CombatState, maxTurns = 400): SimulationResult {
  let current = withAutopilot(state);
  const events: CombatEvent[] = [];
  let turns = 0;
  while (!current.outcome && turns < maxTurns) {
    const result = runAiTurn(data, current);
    if (result.error) return { state: current, events, turns, error: result.error };
    events.push(...result.events);
    current = result.state;
    turns += 1;
  }
  return { state: current, events, turns, error: null };
}
