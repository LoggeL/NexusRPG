// Kleine Schreibhilfen für den Hauptstrang Teil 1 (keine Inhaltsdatei: exportiert kein `part`).
import type {
  Condition, DialogueChoice, DialogueLine, DialogueNode, Effect, Expression, SpeakerId,
} from '../../../modules/contracts';

/** Dialogzeile. */
export const L = (speaker: SpeakerId, text: string, expr?: Expression): DialogueLine =>
  expr ? { speaker, text, expr } : { speaker, text };

/** Erzählzeile. */
export const N = (text: string): DialogueLine => ({ speaker: 'narrator', text });

/** Dialogknoten. */
export const node = (id: string, lines: DialogueLine[], rest: Omit<DialogueNode, 'id' | 'lines'> = {}): DialogueNode =>
  ({ id, lines, ...rest });

/** Uhrzeiten in Minuten seit 0:00 (Spieluhr 06:00 = 360 … 02:00 = 1560). */
export const UHR = (h: number, m = 0): number => h * 60 + m;

/**
 * Wartewahl: Je Zeitfenster eine sichtbare Wahl, die die Uhr auf `target` (bzw. knapp dahinter) vorstellt.
 * Es gibt keinen Effekt „Uhr stellen“, darum diese Treppe; immer genau eine Stufe ist sichtbar.
 */
export function waitChoices(
  text: string, from: number, target: number, next: string | undefined, extra: Effect[] = [], step = 10,
): DialogueChoice[] {
  const out: DialogueChoice[] = [];
  for (let t = from; t < target; t += step) {
    out.push({
      id: `warten-${t}`,
      text,
      when: { clockBetween: [t, Math.min(t + step, target)] },
      effects: [{ advanceTime: target - t }, ...extra],
      ...(next ? { next } : {}),
    });
  }
  return out;
}

/** Die Wahl ist nur sichtbar, wenn man Vex spielt (eigene Antwortvariante, world.md §2.1a). */
export const VEX: Condition = { playerIs: 'vex' };
export const NICHT_VEX: Condition = { not: { playerIs: 'vex' } };

/** Abend 17–20 Uhr: Straßenkinder dürfen noch draußen sein (world.md §3.8). */
export const KINDERZEIT: Condition = { clockBetween: [UHR(6), UHR(20)] };
