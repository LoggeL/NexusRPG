// Ansprechen einer Figur (Bereich dom-ui): Reden oder Geschenk geben. Geschenkregeln in modules/campaign und
// modules/relationships; hier nur Auswahl. Das Geschenk selbst gibt der Director (giveGiftAndLearn).
import type { CampaignPort, ItemId, NpcId } from '../../modules/contracts';
import { GIFT_LIMIT_TEXT, relationView } from '../../modules/relationships';
import type { AssetCatalog } from '../../platform/assets/manifest';
import { append, h, portraitImg } from './dom';
import { openInventory } from './inventory';
import { Modal, type UiShell } from './shell';
import { giftable } from './viewModels';

export type NpcAction = 'talk' | { gift: ItemId } | null;

/** Liefert 'talk', das gewählte Geschenk oder null (abgebrochen). */
export function openNpcActions(shell: UiShell, catalog: AssetCatalog, campaign: CampaignPort, npc: NpcId): Promise<NpcAction> {
  return new Promise((resolve) => {
    let picking = false;
    const name = campaign.displayName(npc);
    const state = campaign.state();
    const view = relationView(campaign.content, state, npc);
    const modal = new Modal(shell, { name: 'npc', title: name, size: 'narrow', onClose: () => { if (!picking) resolve(null); } });
    const hasGifts = Object.entries(state.inventory).some(([id, qty]) => qty > 0 && giftable(campaign.content.items[id]?.category));
    const limit = view.giftLimit ? GIFT_LIMIT_TEXT[view.giftLimit] : null;
    const giftReason = limit ?? (hasGifts ? null : 'Du hast nichts dabei, was sich verschenken lässt.');

    const openGifts = () => {
      if (giftReason) { shell.toast(giftReason, 'bad'); return; }
      picking = true;
      modal.close();
      const picker = openInventory(shell, catalog, campaign, () => undefined, { gift: { npc, onPick: (item) => resolve({ gift: item }) } });
      // Ohne Auswahl geschlossen → abgebrochen (resolve nach onPick bleibt wirkungslos).
      void picker.closed.then(() => resolve(null));
    };

    append(modal.body, [
      h('div', { class: 'npc-card' },
        portraitImg(catalog, campaign.portraitKey(npc), name, name),
        h('div', null,
          h('strong', null, name),
          h('div', { class: view.rivalry ? 'meta rival' : 'hearts', 'aria-label': view.rivalry ? `Rivalität ${view.rivalry}` : `${view.hearts} von ${view.maxHearts} Herzen` }, view.label),
          h('div', { class: 'meta' }, view.standingLabel, view.talkedToday ? ' · heute schon gesprochen' : ''))),
      h('div', { class: 'actions stack' },
        h('button', { class: 'btn primary', type: 'button', 'data-testid': 'npc-talk', 'data-autofocus': true, onclick: () => { picking = true; modal.close(); resolve('talk'); } }, 'Reden'),
        h('button', {
          class: 'btn', type: 'button', 'data-testid': 'npc-gift', 'aria-disabled': String(!!giftReason), title: giftReason ?? `${name} etwas schenken`, onclick: openGifts,
        }, 'Geschenk geben …')),
      giftReason ? h('p', { class: 'meta', 'data-testid': 'npc-gift-reason' }, giftReason) : null]);
  });
}
