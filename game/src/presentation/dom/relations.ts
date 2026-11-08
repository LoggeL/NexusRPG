// Beziehungen (R, Bereich dom-ui): bekannte Figuren als Liste, Details mit Porträt, Herzen und Fortschritt,
// Rivalität, entdecktem Geschenkwissen, Crew/Party und Romanzehinweis. Zahlen liefert modules/relationships.
import { MAX_PARTY, knownRelations, ROMANCE_BLOCK_TEXT, type RelationView } from '../../modules/relationships';
import type { CampaignPort, NpcId } from '../../modules/contracts';
import type { AssetCatalog } from '../../platform/assets/manifest';
import { clear, h, itemIcon, portraitImg } from './dom';
import { knownGiftTastes } from './portExtras';
import { Modal, tabBar, type UiShell } from './shell';
import { GIFT_TASTE_TEXT, groupGiftKnowledge } from './viewModels';

export { heartsText } from './viewModels';

type Filter = 'alle' | 'crew' | 'rivalen';

/** Herzleiste mit Obergrenze der Figur (Weltfiguren z. B. 5). */
function heartRow(view: RelationView): HTMLElement {
  if (view.rivalry) {
    return h('span', { class: 'hearts rival', role: 'img', 'aria-label': `Rivalität ${view.rivalry}` }, '✕'.repeat(Math.min(10, view.rivalry)), h('span', { class: 'meta' }, ` Rivalität ${view.rivalry}`));
  }
  const full = Math.min(view.hearts, view.maxHearts);
  return h('span', { class: 'hearts', role: 'img', 'aria-label': `${full} von ${view.maxHearts} Herzen` },
    '♥'.repeat(full), h('span', { class: 'empty-hearts' }, '♡'.repeat(Math.max(0, view.maxHearts - full))));
}

export function openRelations(shell: UiShell, catalog: AssetCatalog, campaign: CampaignPort): Modal {
  const modal = new Modal(shell, { name: 'relations', title: 'Crew und Kontakte', size: 'wide' });
  const root = h('div', { class: 'relations', 'data-testid': 'relations' });
  modal.body.append(root);
  let filter: Filter = 'alle';
  let selected: NpcId | null = null;

  const toggleParty = (view: RelationView) => {
    const party = campaign.state().party;
    const next = view.inParty ? party.filter((npc) => npc !== view.npc) : [...party, view.npc];
    const result = campaign.setParty(next);
    shell.toast(result.message, result.ok ? 'good' : 'bad');
  };

  const renderDetail = (detail: HTMLElement, view: RelationView) => {
    const content = campaign.content;
    const def = content.npcs[view.npc];
    const name = campaign.displayName(view.npc);
    const state = campaign.state();
    const faction = def?.faction ? content.factions[def.faction]?.name : undefined;
    detail.append(h('div', { class: 'rel-head' },
      portraitImg(catalog, campaign.portraitKey(view.npc), name, name),
      h('div', null,
        h('h3', null, name),
        h('div', { class: 'meta' }, [view.standingLabel, faction].filter(Boolean).join(' · ')),
        heartRow(view),
        view.toNext !== null && !view.rivalry
          ? h('div', { class: 'heart-progress' },
            h('span', { class: 'bar', role: 'progressbar', 'aria-label': 'Fortschritt zum nächsten Herz', 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-valuenow': String(Math.round(view.progress * 100)) },
              h('span', { style: `width:${Math.round(view.progress * 100)}%` })),
            h('span', { class: 'meta' }, `noch ${view.toNext} bis zum nächsten Herz`))
          : null)));
    if (def?.bio) detail.append(h('p', { class: 'bio' }, def.bio));

    const facts: string[] = [];
    facts.push(view.talkedToday ? 'Heute schon gesprochen.' : 'Heute noch nicht gesprochen.');
    facts.push(view.giftLimit ? (view.giftLimit === 'day' ? 'Heute schon beschenkt.' : 'Diese Woche schon zweimal beschenkt.') : `Geschenke diese Woche noch: ${view.giftsLeftThisWeek}`);
    if (view.nextEvent) facts.push(view.nextEvent.hearts > 0 ? `Nächstes Herzereignis ab ♥${view.nextEvent.hearts}.` : 'Ein Rivalitätsereignis steht aus.');
    detail.append(h('ul', { class: 'facts' }, ...facts.map((fact) => h('li', null, fact))));

    // Romanze nur bei grundsätzlich möglichen Figuren erwähnen – Kinder und Freundschaftsfiguren bekommen keinen Hinweis.
    if (view.romance.eligible) {
      detail.append(h('p', { class: `badge romance${view.romance.open ? ' open' : ''}`, 'data-testid': 'rel-romance' },
        view.romance.open ? 'Romanze möglich' : `Romanze ${ROMANCE_BLOCK_TEXT[view.romance.blocked ?? 'herzen']}`));
    }

    const knowledge = groupGiftKnowledge(knownGiftTastes(campaign, view.npc));
    detail.append(h('h4', null, 'Geschenkwissen'));
    if (!knowledge.length) detail.append(h('p', { class: 'meta' }, 'Noch nichts herausgefunden. Probier ein Geschenk!'));
    else {
      detail.append(h('dl', { class: 'gift-knowledge', 'data-testid': 'rel-gifts' }, ...knowledge.flatMap(({ taste, items }) => [
        h('dt', { class: `taste ${taste}` }, GIFT_TASTE_TEXT[taste]),
        h('dd', null, ...items.map((id) => {
          const item = content.items[id];
          return h('span', { class: 'gift-chip', title: item?.name ?? id }, item ? itemIcon(catalog, item.icon, item.name, 20) : null, item?.name ?? id);
        })),
      ])));
    }

    if (view.recruited) {
      const full = !view.inParty && state.party.length >= MAX_PARTY;
      detail.append(h('div', { class: 'actions' },
        h('button', {
          class: `btn${view.inParty ? '' : ' primary'}`, type: 'button', 'data-testid': 'rel-party', 'aria-disabled': String(full),
          title: full ? `Höchstens ${MAX_PARTY} Begleiter in der Party.` : '',
          onclick: () => { if (full) { shell.toast(`Höchstens ${MAX_PARTY} Begleiter in der Party.`, 'bad'); return; } toggleParty(view); },
        }, view.inParty ? 'Aus der Party nehmen' : 'In die Party holen')));
    }
  };

  const render = () => {
    const focused = (document.activeElement as HTMLElement | null)?.dataset?.npc;
    clear(root);
    const all = knownRelations(campaign.content, campaign.state());
    if (!all.length) { root.append(h('p', { class: 'empty' }, 'Noch niemanden kennengelernt.')); return; }
    const crew = all.filter((view) => view.recruited);
    const rivals = all.filter((view) => view.rivalry > 0);
    const tabs: { id: Filter; label: string; badge?: number }[] = [{ id: 'alle', label: 'Alle', badge: all.length }];
    if (crew.length) tabs.push({ id: 'crew', label: 'Crew', badge: crew.length });
    if (rivals.length) tabs.push({ id: 'rivalen', label: 'Rivalen', badge: rivals.length });
    if (!tabs.some((entry) => entry.id === filter)) filter = 'alle';
    if (tabs.length > 1) root.append(tabBar<Filter>('Filter', tabs, filter, (next) => { filter = next; render(); (root.querySelector(`[data-tab="${next}"]`) as HTMLElement | null)?.focus(); }));
    const shown = filter === 'crew' ? crew : filter === 'rivalen' ? rivals : all;
    if (!selected || !shown.some((view) => view.npc === selected)) selected = shown[0]?.npc ?? null;

    const list = h('div', { class: 'list', role: 'listbox', 'aria-label': 'Figuren' });
    const detail = h('div', { class: 'detail', 'aria-live': 'polite', 'data-testid': 'relation-detail' });
    for (const view of shown) {
      const name = campaign.displayName(view.npc);
      list.append(h('button', {
        type: 'button', role: 'option', 'aria-selected': String(view.npc === selected), 'data-npc': view.npc,
        onclick: () => { selected = view.npc; render(); },
      },
      portraitImg(catalog, campaign.portraitKey(view.npc), name),
      h('span', { class: 'row-main' }, h('strong', null, name), h('span', { class: 'meta' }, view.label)),
      view.inParty ? h('span', { class: 'badge good' }, 'Party') : view.recruited ? h('span', { class: 'badge' }, 'Crew') : null));
    }
    root.append(h('div', { class: 'list-detail' }, list, detail));
    const current = shown.find((view) => view.npc === selected);
    if (current) renderDetail(detail, current);
    if (focused) (list.querySelector(`[data-npc="${CSS.escape(focused)}"]`) as HTMLElement | null)?.focus({ preventScroll: true });
  };

  const unsubscribe = campaign.subscribe(() => { if (modal.open) render(); });
  void modal.closed.then(unsubscribe);
  render();
  return modal;
}
