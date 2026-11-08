// Schwellen-Checks ohne Würfel (design.md §3.2): Brücke von der Kampagne zu den reinen Regeln in modules/checks/.
// Zuständig: Bereich character. Wert = Attribut + Perk-, Cyberware-, Kleidungs-, Gegenstands-, Herkunfts-,
// Beziehungs- und Situationsboni; bestanden bei Wert ≥ Schwelle (wirksame Schwelle inkl. Ruf).
import type { CheckDef, GameContent, GameState } from '../contracts';
import type { CheckBuff } from '../contracts';
import { evaluateCheck as evaluateCheckWith, type CheckResult } from '../checks';
import { evaluateCondition } from './conditions';

export {
  breakdownText, checkLabel, checkSeenKey, checkXp, missingText, resolveCheck, type CheckPart, type CheckResult,
} from '../checks';

/** Wertet einen Check gegen den Zustand aus (Bedingungen über `evaluateCondition`). */
export function evaluateCheck(
  content: GameContent, state: Readonly<GameState>, check: CheckDef, buffs?: readonly CheckBuff[],
): CheckResult {
  return evaluateCheckWith({
    content,
    state,
    evaluate: condition => evaluateCondition(content, state, condition),
    // Vorübergehende Boni: ausdrücklich übergebene, sonst die gespeicherten der Spielfigur.
    buffs: buffs ?? state.player.checkBuffs ?? [],
  }, check);
}
