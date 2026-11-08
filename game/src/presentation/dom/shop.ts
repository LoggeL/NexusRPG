// Händler und Auftragstafel (Bereich dom-ui). Preise, Bestand, Öffnungszeiten und Einbauregeln rechnen
// modules/campaign (economy, quests) und modules/character (cyberware); hier Anzeige und Aufrufe.
import { jobTitle } from '../../modules/campaign';
import { discountPercent } from '../../modules/campaign/domains/economy';
import { CYBER_SLOT_LABELS, cyberwareBonusText, cyberwareSlots, planInstall, planUninstall } from '../../modules/character';
import { ATTRIBUTE_LABELS } from '../../modules/campaign';
import type { CampaignPort, CyberwareId, JobBoardId, ShopId } from '../../modules/contracts';
import type { AssetCatalog } from '../../platform/assets/manifest';
import { clear, h, itemIcon } from './dom';
import { canRemoveCyberware, installCyberware, removeCyberware, sellPrice } from './portExtras';
import { Modal, tabBar, type UiShell } from './shell';
import { CATEGORY_LABEL } from './viewModels';

type ShopTab = 'kaufen' | 'verkaufen' | 'einbau';

export function openShop(shell: UiShell, catalog: AssetCatalog, campaign: CampaignPort, shopId: ShopId): Modal {
  const def = campaign.content.shops[shopId];
  const modal = new Modal(shell, { name: 'shop', title: def?.name ?? 'Händler', size: 'wide' });
  const root = h('div', { class: 'shop', 'data-testid': 'shop' });
  modal.body.append(root);
  let tab: ShopTab = 'kaufen';
  const say = (r: { ok: boolean; message: string }) => shell.toast(r.message, r.ok ? 'good' : 'bad');

  const renderBuy = (panel: HTMLElement) => {
    const state = campaign.state();
    const list = h('ul', { class: 'list-rows trade', 'aria-label': 'Kaufen' });
    for (const price of campaign.prices(shopId)) {
      const item = campaign.content.items[price.item];
      if (!item) continue;
      const soldOut = price.available === 0;
      const poor = state.credits < price.buy;
      const owned = state.inventory[price.item] ?? 0;
      list.append(h('li', { 'data-item': price.item, class: soldOut ? 'sold-out' : '' },
        h('span', { class: 'row-main' }, itemIcon(catalog, item.icon, item.name),
          h('span', null, h('strong', null, item.name), h('span', { class: 'meta' }, ` ${CATEGORY_LABEL[item.category]}${owned ? ` · im Gepäck ${owned}` : ''}`),
            h('span', { class: 'desc' }, item.description))),
        h('span', { class: 'price' }, `${price.buy} ¢`, price.available !== null ? h('span', { class: 'meta' }, soldOut ? ' ausverkauft' : ` · noch ${price.available}`) : null),
        h('button', {
          class: 'btn small', type: 'button', 'data-testid': `buy-${price.item}`, 'aria-disabled': String(soldOut || poor),
          title: soldOut ? 'Ausverkauft – morgen kommt Nachschub.' : poor ? `Dir fehlen ${price.buy - state.credits} ¢.` : `${item.name} für ${price.buy} ¢ kaufen`,
          onclick: () => {
            if (soldOut) { shell.toast('Ausverkauft.', 'bad'); return; }
            if (poor) { shell.toast(`Dir fehlen ${price.buy - campaign.state().credits} ¢.`, 'bad'); return; }
            say(campaign.buy(shopId, price.item));
          },
        }, 'Kaufen')));
    }
    panel.append(list.childElementCount ? list : h('p', { class: 'empty' }, 'Heute nichts im Angebot.'));
  };

  const renderSell = (panel: HTMLElement) => {
    const state = campaign.state();
    const equipped = new Set(Object.values(state.player.equipment));
    const list = h('ul', { class: 'list-rows trade', 'aria-label': 'Verkaufen' });
    const owned = Object.entries(state.inventory).filter(([, qty]) => qty > 0)
      .sort(([a], [b]) => (campaign.content.items[a]?.name ?? a).localeCompare(campaign.content.items[b]?.name ?? b, 'de'));
    for (const [id, qty] of owned) {
      const item = campaign.content.items[id];
      if (!item) continue;
      const price = sellPrice(campaign, shopId, id);
      if (price === null) continue;
      list.append(h('li', { 'data-item': id },
        h('span', { class: 'row-main' }, itemIcon(catalog, item.icon, item.name), h('strong', null, item.name), qty > 1 ? h('span', { class: 'qty' }, `×${qty}`) : null,
          equipped.has(id) ? h('span', { class: 'qty' }, 'angelegt') : null),
        h('span', { class: 'price' }, `${price} ¢`),
        h('button', { class: 'btn small', type: 'button', 'data-testid': `sell-${id}`, onclick: () => say(campaign.sell(shopId, id)) }, 'Verkaufen')));
    }
    panel.append(list.childElementCount ? list : h('p', { class: 'empty' }, 'Nichts dabei, was hier jemand ankauft.'));
  };

  const renderInstall = (panel: HTMLElement) => {
    const state = campaign.state();
    const content = campaign.content;
    const free = !!def?.ripperdoc?.freeWhen && campaign.evaluate(def.ripperdoc.freeWhen);
    if (free) panel.append(h('p', { class: 'badge good' }, 'Einbau für dich kostenlos.'));
    const slots = h('ul', { class: 'cyber-grid', 'aria-label': 'Eingebaut' });
    for (const view of cyberwareSlots(content, state.player)) {
      const plan = view.part ? planUninstall(content, state.player, view.slot) : null;
      slots.append(h('li', { class: `cyber-slot${view.part ? ' filled' : ''}`, 'data-slot': view.slot },
        h('span', { class: 'slot-name' }, view.label),
        view.part ? h('strong', null, view.part.name) : h('span', { class: 'meta' }, 'frei'),
        view.part && canRemoveCyberware(campaign)
          ? h('button', {
            class: 'btn small', type: 'button', 'data-testid': `uninstall-${view.slot}`, 'aria-disabled': String(!plan?.ok), title: plan && !plan.ok ? plan.reason : 'Ausbauen (kommt ins Inventar)',
            onclick: () => { if (plan && !plan.ok) { shell.toast(plan.reason, 'bad'); return; } const r = removeCyberware(campaign, shopId, view.slot); if (r) say(r); },
          }, 'Ausbauen')
          : null));
    }
    panel.append(h('h4', null, 'Eingebaut'), slots);

    const parts = Object.entries(state.inventory)
      .filter(([id, qty]) => qty > 0 && content.items[id]?.category === 'cyberware' && content.items[id]?.cyberware)
      .map(([id]) => content.items[id].cyberware as CyberwareId);
    panel.append(h('h4', null, 'Einbaubar aus deinem Inventar'));
    if (!parts.length) { panel.append(h('p', { class: 'empty' }, 'Keine Cyberware im Gepäck. Kauf erst ein Teil.')); return; }
    const list = h('ul', { class: 'list-rows trade', 'aria-label': 'Einbauen' });
    for (const id of parts) {
      const part = content.cyberware[id];
      if (!part) continue;
      const plan = planInstall(content, state.player, id, { inventory: state.inventory, requireItem: true, shop: def, freeInstall: free });
      const poor = plan.ok && plan.fee > state.credits;
      const replaces = plan.ok && plan.replaces ? content.cyberware[plan.replaces]?.name ?? plan.replaces : null;
      list.append(h('li', { 'data-cyberware': id },
        h('span', { class: 'row-main' }, h('span', null, h('strong', null, part.name),
          h('span', { class: 'meta' }, ` ${CYBER_SLOT_LABELS[part.slot]} · ${cyberwareBonusText(part, ATTRIBUTE_LABELS)}${replaces ? ` · ersetzt ${replaces}` : ''}`))),
        h('span', { class: 'price' }, plan.ok ? (plan.fee ? `${plan.fee} ¢` : 'frei') : ''),
        h('button', {
          class: 'btn small primary', type: 'button', 'data-testid': `install-${id}`, 'aria-disabled': String(!plan.ok || poor),
          title: !plan.ok ? plan.reason : poor ? `Dir fehlen ${plan.fee - state.credits} ¢.` : 'Einbauen',
          onclick: () => {
            if (!plan.ok) { shell.toast(plan.reason, 'bad'); return; }
            if (poor) { shell.toast(`Dir fehlen ${plan.fee - campaign.state().credits} ¢.`, 'bad'); return; }
            say(installCyberware(campaign, shopId, id));
          },
        }, 'Einbauen')));
    }
    panel.append(list);
  };

  const render = () => {
    const focused = (document.activeElement as HTMLElement | null)?.dataset?.testid;
    clear(root);
    if (!def) { root.append(h('p', { class: 'empty' }, 'Dieser Laden existiert nicht.')); return; }
    const state = campaign.state();
    const prices = campaign.prices(shopId);
    const discount = discountPercent(campaign.content, state, def);
    root.append(h('div', { class: 'shop-head' },
      def.owner ? h('span', { class: 'meta' }, campaign.displayName(def.owner)) : null,
      h('span', { class: 'credits', 'data-testid': 'shop-credits' }, `Deine Credits: ${state.credits} ¢`),
      discount ? h('span', { class: `badge ${discount > 0 ? 'good' : 'bad'}` }, discount > 0 ? `${discount} % Rabatt` : `${-discount} % Aufschlag`) : null));
    if (prices.length && !prices[0].open) { root.append(h('p', { class: 'empty' }, 'Geschlossen. Komm zu den Öffnungszeiten wieder.')); return; }
    const tabs: { id: ShopTab; label: string }[] = [{ id: 'kaufen', label: 'Kaufen' }, { id: 'verkaufen', label: 'Verkaufen' }];
    if (def.ripperdoc) tabs.push({ id: 'einbau', label: 'Einbau' });
    root.append(tabBar<ShopTab>('Handel', tabs, tab, (next) => { tab = next; render(); (root.querySelector(`[data-tab="${next}"]`) as HTMLElement | null)?.focus(); }));
    const panel = h('div', { class: 'tab-panel', role: 'tabpanel', 'data-panel': tab });
    if (tab === 'kaufen') renderBuy(panel);
    else if (tab === 'verkaufen') renderSell(panel);
    else renderInstall(panel);
    root.append(panel);
    if (focused) (root.querySelector(`[data-testid="${CSS.escape(focused)}"]`) as HTMLElement | null)?.focus({ preventScroll: true });
  };

  const unsubscribe = campaign.subscribe(() => { if (modal.open) render(); });
  void modal.closed.then(unsubscribe);
  render();
  return modal;
}

export function openJobBoard(shell: UiShell, campaign: CampaignPort, board: JobBoardId): Modal {
  const modal = new Modal(shell, { name: 'jobs', title: 'Auftragstafel', size: 'wide' });
  const root = h('div', { class: 'job-board', 'data-testid': 'job-board' });
  modal.body.append(root);
  const render = () => {
    clear(root);
    const content = campaign.content;
    const offers = campaign.jobOffers(board);
    const list = h('ul', { class: 'list-rows', 'aria-label': 'Angebote' });
    for (const offer of offers) {
      const template = content.jobs[offer.template];
      const target = template?.targets[offer.target];
      const reward = template ? [`${offer.credits} ¢`, `${template.reward.xp} XP`].join(' · ') : `${offer.credits} ¢`;
      list.append(h('li', { 'data-offer': offer.id },
        h('span', { class: 'row-main' }, h('span', null,
          h('strong', null, jobTitle(content, offer)),
          h('span', { class: 'desc' }, template?.text.replace('{credits}', String(offer.credits)).replace('{ziel}', target?.label ?? '') ?? ''),
          h('span', { class: 'meta' }, [target ? (content.maps[target.map]?.name ?? target.map) : '', reward].filter(Boolean).join(' · ')))),
        h('button', { class: 'btn small primary', type: 'button', 'data-testid': `accept-${offer.id}`, onclick: () => { const r = campaign.acceptJob(offer.id); shell.toast(r.message, r.ok ? 'good' : 'bad'); render(); } }, 'Annehmen')));
    }
    root.append(h('h3', null, 'Angebote'), offers.length ? list : h('p', { class: 'empty' }, 'Heute keine neuen Aufträge. Morgen wieder vorbeischauen.'));
    const active = campaign.state().jobs.active;
    if (active.length) {
      root.append(h('h3', null, 'Laufende Aufträge'), h('ul', { class: 'list-rows', 'aria-label': 'Laufende Aufträge' }, ...active.map((job) => {
        const target = content.jobs[job.template]?.targets[job.target];
        return h('li', { 'data-job': job.id }, h('strong', null, jobTitle(content, job)),
          h('span', { class: 'meta' }, [target?.label, target ? content.maps[target.map]?.name : '', `${job.credits} ¢`].filter(Boolean).join(' · ')));
      })));
    }
  };
  render();
  return modal;
}
