// Inventar (Bereich dom-ui): Kategorien als Reiter, Details, Benutzen, Ausrüsten, Ansehen – und Geschenkmodus im Gespräch.
import type { CampaignPort, EffectOutcome, ItemCategory, ItemDef, ItemId, NpcId } from '../../modules/contracts';
import { GIFT_LIMIT_TEXT, relationView } from '../../modules/relationships';
import { chargeView } from '../../modules/campaign/domains/weather';
import type { AssetCatalog } from '../../platform/assets/manifest';
import { clear, h, itemIcon } from './dom';
import { knownGiftTastes } from './portExtras';
import { Modal, tabBar, type UiShell } from './shell';
import { CATEGORY_LABEL, CATEGORY_ORDER, GIFT_TASTE_TEXT, giftable } from './viewModels';

export { CATEGORY_LABEL, CATEGORY_ORDER } from './viewModels';

const EQUIPPABLE = (def: ItemDef) => !!def.weapon || def.category === 'kleidung';

export interface InventoryOptions {
  /** Geschenkmodus: nur verschenkbare Gegenstände, bekanntes Geschenkwissen, Auswahl beendet das Fenster. */
  readonly gift?: { readonly npc: NpcId; readonly onPick: (item: ItemId) => void };
}

type Tab = 'alle' | ItemCategory;

export function openInventory(
  shell: UiShell, catalog: AssetCatalog, campaign: CampaignPort, onOutcome: (outcome: EffectOutcome) => void, options: InventoryOptions = {},
): Modal {
  const gift = options.gift;
  const npcName = gift ? campaign.displayName(gift.npc) : '';
  const modal = new Modal(shell, { name: gift ? 'gift' : 'inventory', title: gift ? `Geschenk für ${npcName}` : 'Inventar', size: 'wide' });
  const root = h('div', { class: 'inventory', 'data-testid': gift ? 'gift-picker' : 'inventory' });
  modal.body.append(root);
  let tab: Tab = 'alle';
  let selected: ItemId | null = null;
  let comment: string | undefined;

  const itemDef = (id: string): ItemDef => campaign.content.items[id] ?? { id, name: id, description: '', category: 'sammeln', icon: id, price: 0 };
  const tasteOf = (id: ItemId) => (gift ? knownGiftTastes(campaign, gift.npc).find((entry) => entry.item === id)?.taste : undefined);

  const owned = (): ItemId[] => Object.entries(campaign.state().inventory)
    .filter(([id, qty]) => qty > 0 && (!gift || giftable(itemDef(id).category)))
    .map(([id]) => id);

  const sorted = (ids: ItemId[]) => [...ids].sort((a, b) =>
    CATEGORY_ORDER.indexOf(itemDef(a).category) - CATEGORY_ORDER.indexOf(itemDef(b).category) || itemDef(a).name.localeCompare(itemDef(b).name, 'de'));

  const render = () => {
    const focusedItem = (document.activeElement as HTMLElement | null)?.dataset?.item;
    clear(root);
    const state = campaign.state();
    const all = owned();
    const categories = CATEGORY_ORDER.filter((category) => all.some((id) => itemDef(id).category === category));
    if (tab !== 'alle' && !categories.includes(tab)) tab = 'alle';
    const shown = sorted(tab === 'alle' ? all : all.filter((id) => itemDef(id).category === tab));
    if (!selected || !shown.includes(selected)) { selected = shown[0] ?? null; comment = undefined; }

    const head = h('div', { class: 'inv-head' }, h('span', { class: 'meta', 'data-testid': 'inventory-credits' }, `Credits: ${state.credits} ¢`));
    if (gift) {
      const view = relationView(campaign.content, state, gift.npc);
      const limit = view.giftLimit ? GIFT_LIMIT_TEXT[view.giftLimit] : null;
      head.append(h('span', { class: `meta${limit ? ' warn' : ''}`, 'data-testid': 'gift-limit' },
        limit ?? `Heute noch ${view.giftsLeftToday} Geschenk, diese Woche noch ${view.giftsLeftThisWeek}.`));
    }
    root.append(head);
    if (categories.length > 1) {
      root.append(tabBar<Tab>('Kategorien', [
        { id: 'alle', label: 'Alle', badge: all.length },
        ...categories.map((category) => ({ id: category as Tab, label: CATEGORY_LABEL[category], badge: all.filter((id) => itemDef(id).category === category).length })),
      ], tab, (next) => { tab = next; render(); (root.querySelector(`[data-tab="${next}"]`) as HTMLElement | null)?.focus(); }));
    }
    const list = h('div', { class: 'list', role: 'listbox', 'aria-label': gift ? 'Verschenkbare Gegenstände' : 'Gegenstände', 'data-testid': 'inventory-list' });
    const detail = h('div', { class: 'detail', 'aria-live': 'polite', 'data-testid': 'inventory-detail' });
    root.append(h('div', { class: 'list-detail' }, list, detail));
    if (!shown.length) {
      list.append(h('p', { class: 'empty' }, gift ? 'Nichts dabei, was sich verschenken lässt.' : 'Die Taschen sind leer.'));
      return;
    }
    const equippedIds = new Set(Object.values(state.player.equipment));
    for (const id of shown) {
      const def = itemDef(id);
      const taste = tasteOf(id);
      list.append(h('button', {
        type: 'button', role: 'option', 'aria-selected': String(id === selected), 'data-item': id,
        onclick: () => { selected = id; comment = undefined; render(); },
        ondblclick: () => { if (gift) pick(id); },
      },
      itemIcon(catalog, def.icon, def.name),
      h('span', { class: 'row-main' }, def.name),
      taste ? h('span', { class: `taste ${taste}`, title: `${npcName} ${GIFT_TASTE_TEXT[taste]} das` }, GIFT_TASTE_TEXT[taste]) : null,
      equippedIds.has(id) ? h('span', { class: 'qty' }, 'angelegt') : null,
      chargeBadge(id),
      state.inventory[id] > 1 ? h('span', { class: 'qty' }, `×${state.inventory[id]}`) : null));
    }
    renderDetail(detail, selected);
    if (focusedItem) (list.querySelector(`[data-item="${CSS.escape(focusedItem)}"]`) as HTMLElement | null)?.focus({ preventScroll: true });
  };

  /** Ladungsanzeige (Staubmaske 7/10), Bereich engine-welt. */
  const chargeBadge = (id: ItemId) => {
    const charges = chargeView(campaign.content, campaign.state(), id);
    if (!charges || charges.total <= 0) return null;
    return h('span', { class: `qty charges${charges.current <= 2 ? ' low' : ''}`, title: `Ladungen: ${charges.current} von ${charges.per}`, 'data-testid': 'item-charges' },
      `${charges.current}/${charges.per}`);
  };

  const renderDetail = (detail: HTMLElement, id: ItemId | null) => {
    if (!id) return;
    const def = itemDef(id);
    const state = campaign.state();
    const qty = state.inventory[id] ?? 0;
    const facts: string[] = [CATEGORY_LABEL[def.category] ?? def.category];
    if (qty > 1) facts.push(`${qty} Stück`);
    const charges = chargeView(campaign.content, state, id);
    if (charges && qty > 0) facts.push(`Ladungen ${charges.current}/${charges.per}${qty > 1 ? ` (insgesamt ${charges.total})` : ''}`);
    if (def.weapon) facts.push(`Schaden ${def.weapon.damage}, Reichweite ${def.weapon.range}`);
    if (def.price > 0) facts.push(`Wert ${def.price} ¢`);
    detail.append(
      h('div', { class: 'detail-head' }, itemIcon(catalog, def.icon, def.name, 64), h('div', null, h('h3', null, def.name), h('div', { class: 'meta' }, facts.join(' · ')))),
      h('p', null, def.description));
    const actions = h('div', { class: 'actions' });
    if (gift) {
      const taste = tasteOf(id);
      detail.append(h('p', { class: 'meta', 'data-testid': 'gift-knowledge' }, taste
        ? `Bekannt: ${npcName} ${GIFT_TASTE_TEXT[taste]} das.`
        : `Wie ${npcName} das findet, weißt du noch nicht.`));
      actions.append(h('button', { class: 'btn primary', type: 'button', 'data-testid': 'gift-give', onclick: () => pick(id) }, `${def.name} schenken`));
    } else {
      if (def.use && def.use.world !== false && campaign.evaluate(def.use.when)) {
        actions.append(h('button', { class: 'btn primary', type: 'button', 'data-testid': 'item-use', onclick: () => finish(campaign.useItem(def.id)) }, def.use.label));
      }
      if (EQUIPPABLE(def) && !Object.values(state.player.equipment).includes(id)) {
        actions.append(h('button', { class: 'btn', type: 'button', 'data-testid': 'item-equip', onclick: () => finish(campaign.equip(def.id)) }, 'Ausrüsten'));
      }
      if (def.inspect) actions.append(h('button', { class: 'btn', type: 'button', 'data-testid': 'item-inspect', onclick: () => { comment = def.inspect; render(); } }, 'Ansehen'));
    }
    detail.append(actions);
    if (comment) detail.append(h('div', { class: 'comment', 'data-testid': 'item-comment' }, comment));
  };

  const pick = (id: ItemId) => {
    if (!gift) return;
    modal.close();
    gift.onPick(id);
  };

  const finish = (result: { ok: boolean; message: string; outcome: EffectOutcome }) => {
    shell.toast(result.message || (result.ok ? 'Erledigt.' : 'Das bringt gerade nichts.'), result.ok ? 'good' : 'bad');
    onOutcome({ requests: result.outcome.requests, messages: [] });
    render();
    if (result.outcome.requests.some((request) => !('sfx' in request))) modal.close();
  };

  const unsubscribe = campaign.subscribe(() => { if (modal.open) render(); });
  void modal.closed.then(unsubscribe);
  render();
  return modal;
}
