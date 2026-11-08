// Fachaufrufe der Oberfläche über den CampaignPort (Bereich dom-ui).
// Früher lagen hier Rückfälle für Port-Methoden, die es noch nicht gab; seit der Integration bietet der Port alle
// an (installCyberwareAt, removeCyberwareAt, knownGiftTastes, sellPrice, unequip, callCompanion). Die Funktionen
// bleiben als schmale Weiterleitungen, damit die Overlays eine stabile Schnittstelle haben.
import { cyberwareItem } from '../../modules/character';
import { DEFAULT_CALL_MINUTES } from '../../modules/campaign';
import type {
  CampaignPort, CampaignResult, CyberSlot, CyberwareId, EquipSlot, GiftResult, GiftTaste, ItemId, NpcId, ShopId,
} from '../../modules/contracts';

/** Geschenk geben; die Kampagne merkt sich dabei den entdeckten Geschmack. */
export const giveGiftAndLearn = (campaign: CampaignPort, npc: NpcId, item: ItemId): GiftResult => campaign.giveGift(npc, item);

/** Bekanntes Geschenkwissen einer Figur. */
export const knownGiftTastes = (campaign: CampaignPort, npc: NpcId): { item: ItemId; taste: GiftTaste }[] => campaign.knownGiftTastes(npc);

/** Ankaufspreis eines Inventargegenstands (null: kauft der Händler nicht). */
export const sellPrice = (campaign: CampaignPort, shop: ShopId, item: ItemId): number | null => campaign.sellPrice(shop, item);

/** Einbau beim Schrauber (Gebühr außer bei `ripperdoc.freeWhen`). */
export const installCyberware = (campaign: CampaignPort, shop: ShopId, cyberware: CyberwareId): CampaignResult =>
  campaign.installCyberwareAt(shop, cyberware);

/** Ausbau beim Schrauber. */
export const removeCyberware = (campaign: CampaignPort, shop: ShopId, slot: CyberSlot): CampaignResult | null =>
  campaign.removeCyberwareAt(shop, slot);

export const canRemoveCyberware = (_campaign: CampaignPort): boolean => true;

/** Ausrüstungsplatz leeren. */
export const unequip = (campaign: CampaignPort, slot: EquipSlot): CampaignResult | null => campaign.unequip(slot);

export const canUnequip = (_campaign: CampaignPort): boolean => true;

/** Standard-Anfahrt eines gerufenen Begleiters (Figuren und Perks können sie verkürzen). */
export const CALL_MINUTES = DEFAULT_CALL_MINUTES;

/** Begleiter per Telefon rufen (Anfahrt nach Figur und passiven Wirkungen). */
export const callCompanion = (campaign: CampaignPort, npc: NpcId): CampaignResult => campaign.callCompanion(npc);

/** Begleiter nach Hause schicken (Party ohne diese Figur). */
export function sendHome(campaign: CampaignPort, npc: NpcId): CampaignResult {
  return campaign.setParty(campaign.state().party.filter((id) => id !== npc));
}

/** Gegenstand, der zu einem Cyberware-Teil gehört. */
export const itemForCyberware = (campaign: CampaignPort, cyberware: CyberwareId): ItemId | null => cyberwareItem(campaign.content, cyberware);
