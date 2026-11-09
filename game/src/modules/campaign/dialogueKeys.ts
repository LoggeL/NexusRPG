// Stabile Schlüssel für einmalige Dialogwahlen (`DialogueChoice.once`) in `GameState.seen`.
import type { DialogueChoice } from '../contracts';
import { hashText } from './ids';

/** Längere Kennungen werden gekürzt, damit der Schlüssel unter `SAVE_LIMITS.keyLength` bleibt. */
const MAX_KEY_PART = 100;

/** Kennung einer Wahl: unabhängig vom Knoten, damit geteilte Wahl-Listen denselben Schlüssel haben. */
export const choiceKeyPart = (choice: DialogueChoice): string => {
  const part = choice.id ?? choice.next ?? choice.text;
  return part.length <= MAX_KEY_PART ? part : `${part.slice(0, MAX_KEY_PART - 10)}~${hashText(part).toString(36)}`;
};

export const choiceSeenKey = (dialogueId: string, choice: DialogueChoice): string =>
  `dialog:${dialogueId}#${choiceKeyPart(choice)}`;

/** Tagesflag einer Wahl mit `daily: true` (fällt mit den `heute_`-Flags am nächsten Morgen). */
export const choiceDailyFlag = (dialogueId: string, choice: DialogueChoice): string =>
  `heute_wahl_${hashText(choiceSeenKey(dialogueId, choice)).toString(36)}`;
