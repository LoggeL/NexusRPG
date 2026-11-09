// Kleine Schreibhilfen für den Hauptstrang Teil 1 (keine Inhaltsdatei: exportiert kein `part`).
import type {
  Condition, DialogueChoice, DialogueLine, DialogueNode, Effect, Expression, SpeakerId, StandInDef,
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
 * Wartewahl: sichtbar zwischen `from` und `target`, stellt die Uhr per `setClock` auf `target`.
 */
export function waitChoices(
  text: string, from: number, target: number, next: string | undefined, extra: Effect[] = [],
): DialogueChoice[] {
  return [{
    id: `warten-${target}`,
    text,
    when: { clockBetween: [from, target] },
    effects: [{ setClock: target }, ...extra],
    ...(next ? { next } : {}),
  }];
}

/** Ravens Werte im Prolog (world.md §5.1): Die Spielfigur wird für den Prolog zu Raven (Effekt `standIn`). */
export const RAVEN_PROLOG: StandInDef = {
  npc: 'raven',
  name: 'Raven',
  attributes: { koerper: 6, reflexe: 6, ausstrahlung: 4, technik: 2, strasse: 5 },
  dateLabel: 'Vor 7 Jahren',
};

/** Die Wahl ist nur sichtbar, wenn man Vex spielt (eigene Antwortvariante, world.md §2.1a). */
export const VEX: Condition = { playerIs: 'vex' };
export const NICHT_VEX: Condition = { not: { playerIs: 'vex' } };

/** Abend 17–20 Uhr: Straßenkinder dürfen noch draußen sein (world.md §3.8). */
export const KINDERZEIT: Condition = { clockBetween: [UHR(6), UHR(20)] };
