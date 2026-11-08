// Strukturprüfung der Beziehungsinhalte (Herz-Ereignisse, Vorlieben, Begleiter, Obergrenzen). Verweise auf IDs
// prüft campaign/lint.ts; diese Prüfungen kommen dort zusätzlich hinzu.
import type { GameContent } from '../contracts';
import { heartEventProblems } from './events';
import { npcExtras } from './extras';
import { giftPrefsProblems } from './gifts';
import { HEARTS_MAX } from './points';
import { romanceProblems } from './romance';

export function relationshipProblems(content: GameContent): string[] {
  const problems = [...heartEventProblems(content), ...romanceProblems(content)];
  for (const npc of Object.values(content.npcs)) {
    const at = `Figur ${npc.id}`;
    for (const problem of giftPrefsProblems(npc.gifts)) problems.push(`${at} Geschenke: ${problem}`);
    (npc.giftVariants ?? []).forEach((variant, index) => {
      for (const problem of giftPrefsProblems(variant.gifts)) problems.push(`${at} Geschenkvariante #${index + 1}: ${problem}`);
    });
    const extras = npcExtras(npc);
    if (extras.maxHearts !== undefined && (!Number.isInteger(extras.maxHearts) || extras.maxHearts < 1 || extras.maxHearts > HEARTS_MAX)) {
      problems.push(`${at}: Herz-Obergrenze ${extras.maxHearts} außerhalb 1…${HEARTS_MAX}`);
    }
    for (const extra of npc.companion?.heartAbilities ?? []) {
      if (!Number.isInteger(extra.hearts) || extra.hearts < 1 || extra.hearts > HEARTS_MAX) {
        problems.push(`${at} Begleiter: Herzstufe ${extra.hearts} für „${extra.ability}“ außerhalb 1…${HEARTS_MAX}`);
      }
    }
    for (const talk of npc.talk ?? []) {
      if (talk.minHearts !== undefined && (!Number.isInteger(talk.minHearts) || talk.minHearts < 0 || talk.minHearts > HEARTS_MAX)) {
        problems.push(`${at} Gespräch ${talk.dialogue}: Herzstufe ${talk.minHearts} außerhalb 0…${HEARTS_MAX}`);
      }
    }
  }
  return problems;
}
