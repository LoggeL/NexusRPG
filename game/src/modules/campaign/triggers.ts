// onEnter-Auslöser einer Karte und Herz-Ereignisse: Effekte, Cutscene bzw. Dialog und erst danach „gesehen“.
import type { CampaignPort, EffectOutcome, MapDef } from '../contracts';

export interface EnterTriggerHost {
  playCutscene(id: string): Promise<unknown>;
  runDialogue(id: string): Promise<unknown>;
  handleOutcome(outcome: EffectOutcome): Promise<unknown>;
  /** Optional: false bricht vor dem nächsten Auslöser ab (z. B. Erkundung nicht mehr aktiv). */
  stillHere?(): boolean;
}

/**
 * Führt die onEnter-Auslöser einer Karte aus, danach höchstens ein fälliges Herz-Ereignis.
 *
 * Ein Auslöser gilt erst als gesehen, wenn Cutscene und Dialog vollständig gelaufen sind. Wird die Seite währenddessen
 * neu geladen, startet er beim nächsten Betreten erneut; Auslöser-Effekte müssen deshalb idempotent sein.
 */
/** Gesehen-Schlüssel eines onEnter-Auslösers (je Karte eindeutig). */
export const enterSeenKey = (map: string, trigger: string) => `enter:${map}:${trigger}`;

export async function runEnterTriggers(campaign: CampaignPort, map: MapDef, host: EnterTriggerHost): Promise<void> {
  const here = () => campaign.state().map === map.id && (!host.stillHere || host.stillHere());
  for (const trigger of map.onEnter ?? []) {
    if (!here()) return;
    if (trigger.once !== false && campaign.hasSeen(enterSeenKey(map.id, trigger.id))) continue;
    if (!campaign.evaluate(trigger.when)) continue;
    const outcome: EffectOutcome = trigger.effects?.length ? campaign.apply(trigger.effects) : { requests: [], messages: [] };
    if (trigger.cutscene) await host.playCutscene(trigger.cutscene);
    if (trigger.dialogue) await host.runDialogue(trigger.dialogue);
    campaign.markSeen(enterSeenKey(map.id, trigger.id));
    await host.handleOutcome(outcome);
  }
  if (!here()) return;
  const event = campaign.pendingHeartEvent(map.id);
  if (!event) return;
  if (event.cutscene) await host.playCutscene(event.cutscene);
  if (event.dialogue) await host.runDialogue(event.dialogue);
  await host.handleOutcome(campaign.completeHeartEvent(event.id));
}
