// Tägliches Ansprechen (design.md §3.3): einmal am Tag +20, nur solange die Punkte nicht negativ sind
// (Rivalen und verärgerte Figuren muss man über Quests und Gesprächswahlen zurückgewinnen).
import type { Condition, DialogueId, GameContent, GameState, TalkDef } from '../contracts';
import { perkExtras } from './extras';

export const TALK_BONUS = 20;

export interface TalkCounters { points: number; talkedDay: number }

export interface DailyTalk {
  /** Erstes Gespräch an diesem Tag? */
  first: boolean;
  /** Punkte, die das Gespräch bringt (0, wenn schon gesprochen oder Punkte < 0). */
  delta: number;
}

/** Tagesbonus fürs Ansprechen (`extra`: Perk-Zuschlag). */
export function dailyTalk(rel: Readonly<TalkCounters>, day: number, extra = 0): DailyTalk {
  const first = rel.talkedDay !== day;
  const bonus = Math.max(0, TALK_BONUS + (Number.isFinite(extra) ? Math.round(extra) : 0));
  return { first, delta: first && rel.points >= 0 ? bonus : 0 };
}

/** Zuschlag aller gelernten Perks auf das tägliche Ansprechen. */
export function talkBonusExtra(content: GameContent, state: Readonly<GameState>): number {
  let extra = 0;
  for (const perk of state.player.perks) {
    const def = Object.prototype.hasOwnProperty.call(content.perks, perk) ? content.perks[perk] : undefined;
    extra += perkExtras(def).talkBonus ?? 0;
  }
  return extra;
}

/** Tagesgespräch: erster Eintrag mit erfüllter Herzstufe und Bedingung, dessen Dialog existiert. */
export function pickTalk(
  talks: readonly TalkDef[] | undefined,
  hearts: number,
  evaluate: (condition?: Condition) => boolean,
  exists: (dialogue: DialogueId) => boolean,
): DialogueId | null {
  for (const talk of talks ?? []) {
    if ((talk.minHearts ?? 0) <= hearts && evaluate(talk.when) && exists(talk.dialogue)) return talk.dialogue;
  }
  return null;
}
