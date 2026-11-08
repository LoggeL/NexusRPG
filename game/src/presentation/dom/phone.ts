// Telefon (P, Bereich dom-ui): Reiter Nachrichten (lesen, antworten), Crew (Begleiter rufen, heimschicken) und
// Sendung (aktuelle Nachrichtensendung ansehen). Zustellung und Effekte regelt die Kampagne.
import { MAX_PARTY } from '../../modules/relationships';
import type { CampaignPort, EffectOutcome, PhoneEntry } from '../../modules/contracts';
import type { AssetCatalog } from '../../platform/assets/manifest';
import { clear, h, portraitImg } from './dom';
import { CALL_MINUTES, callCompanion, sendHome } from './portExtras';
import { Modal, tabBar, type UiShell } from './shell';

type Tab = 'nachrichten' | 'crew' | 'sendung';

export function openPhone(
  shell: UiShell, campaign: CampaignPort, onOutcome: (outcome: EffectOutcome) => void, watchNews: () => void, catalog?: AssetCatalog,
): Modal {
  const modal = new Modal(shell, { name: 'phone', title: 'Telefon', size: 'wide' });
  modal.el.classList.add('phone');
  const root = h('div', { class: 'phone-body', 'data-testid': 'phone' });
  modal.body.append(root);
  const unreadAtStart = campaign.state().phone.some((entry) => !entry.read);
  let tab: Tab = unreadAtStart || !campaign.state().recruited.length ? 'nachrichten' : 'crew';

  const avatar = (npc: string) => (catalog ? portraitImg(catalog, campaign.portraitKey(npc), campaign.displayName(npc)) : null);

  const messageRow = (entry: PhoneEntry) => {
    const def = campaign.content.phone[entry.id];
    if (!def) return null;
    const from = campaign.displayName(def.from);
    const replied = entry.replied !== undefined ? def.replies?.[entry.replied] : undefined;
    const replies = entry.replied === undefined ? def.replies ?? [] : [];
    return h('li', { class: `msg${entry.read ? '' : ' unread'}`, 'data-message': entry.id },
      avatar(def.from),
      h('div', { class: 'msg-main' },
        h('div', { class: 'msg-head' }, h('strong', null, from), h('span', { class: 'meta' }, `Tag ${entry.day}`), entry.read ? null : h('span', { class: 'badge' }, 'neu')),
        h('p', { class: 'bubble' }, def.text),
        replied ? h('p', { class: 'bubble own' }, replied.text) : null,
        h('div', { class: 'actions' },
          ...replies.map((reply, index) => h('button', {
            class: 'btn small', type: 'button', 'data-reply': String(index),
            onclick: () => { onOutcome(campaign.readPhone(entry.id, index)); },
          }, reply.text)),
          !entry.read && !replies.length
            ? h('button', { class: 'btn small', type: 'button', 'data-testid': `phone-read-${entry.id}`, onclick: () => { onOutcome(campaign.readPhone(entry.id)); } }, 'Gelesen')
            : null)));
  };

  const renderMessages = (panel: HTMLElement) => {
    const entries = [...campaign.state().phone].reverse();
    if (!entries.length) { panel.append(h('p', { class: 'empty' }, 'Keine Nachrichten.')); return; }
    panel.append(h('ul', { class: 'msg-list', 'aria-label': 'Nachrichten' }, ...entries.map(messageRow).filter((row): row is HTMLLIElement => !!row)));
  };

  const renderCrew = (panel: HTMLElement) => {
    const state = campaign.state();
    if (!state.recruited.length) { panel.append(h('p', { class: 'empty' }, 'Noch keine Crew. Freunde findest du in Noxius.')); return; }
    panel.append(h('p', { class: 'meta' }, `Höchstens ${MAX_PARTY} Begleiter. Gerufene kommen nach etwa ${CALL_MINUTES} Minuten.`));
    const list = h('ul', { class: 'list-rows', 'aria-label': 'Crew' });
    for (const npc of state.recruited) {
      const name = campaign.displayName(npc);
      const inParty = state.party.includes(npc);
      const full = !inParty && state.party.length >= MAX_PARTY;
      list.append(h('li', { 'data-npc': npc },
        h('span', { class: 'row-main' }, avatar(npc), h('strong', null, name), inParty ? h('span', { class: 'badge good' }, 'dabei') : null),
        inParty
          ? h('button', { class: 'btn small', type: 'button', 'data-testid': `phone-home-${npc}`, onclick: () => { const r = sendHome(campaign, npc); shell.toast(r.message, r.ok ? 'good' : 'bad'); } }, 'Heimschicken')
          : h('button', {
            class: 'btn small primary', type: 'button', 'data-testid': `phone-call-${npc}`, 'aria-disabled': String(full), title: full ? 'Die Party ist voll.' : `${name} anrufen`,
            onclick: () => {
              if (full) { shell.toast('Die Party ist voll. Schick erst jemanden heim.', 'bad'); return; }
              const r = callCompanion(campaign, npc);
              shell.toast(r.message, r.ok ? 'good' : 'bad');
              if (r.ok) onOutcome({ requests: r.outcome.requests, messages: [] });
            },
          }, 'Anrufen')));
    }
    panel.append(list);
  };

  const renderNews = (panel: HTMLElement) => {
    const news = campaign.currentNews();
    if (!news) { panel.append(h('p', { class: 'empty' }, 'Gerade läuft keine Sendung.')); return; }
    panel.append(h('div', { class: 'news-card' },
      avatar(news.anchor),
      h('div', null,
        h('div', { class: 'meta' }, `Noxius Nachrichten mit ${campaign.displayName(news.anchor)}`),
        h('h3', null, news.headline),
        h('button', { class: 'btn primary', type: 'button', 'data-testid': 'phone-watch', onclick: () => { modal.close(); watchNews(); } }, 'Sendung ansehen'))));
  };

  const render = () => {
    const focused = (document.activeElement as HTMLElement | null)?.dataset?.tab;
    clear(root);
    const state = campaign.state();
    const unread = state.phone.filter((entry) => !entry.read).length;
    root.append(tabBar<Tab>('Telefon', [
      { id: 'nachrichten', label: 'Nachrichten', badge: unread || undefined },
      { id: 'crew', label: 'Crew', badge: state.recruited.length ? `${state.party.length}/${MAX_PARTY}` : undefined },
      { id: 'sendung', label: 'Sendung', badge: campaign.currentNews() ? '!' : undefined },
    ], tab, (next) => { tab = next; render(); (root.querySelector(`[data-tab="${next}"]`) as HTMLElement | null)?.focus(); }));
    const panel = h('div', { class: 'tab-panel', role: 'tabpanel', 'data-panel': tab });
    if (tab === 'nachrichten') renderMessages(panel);
    else if (tab === 'crew') renderCrew(panel);
    else renderNews(panel);
    root.append(panel);
    if (focused) (root.querySelector(`[data-tab="${focused}"]`) as HTMLElement | null)?.focus({ preventScroll: true });
  };

  const unsubscribe = campaign.subscribe(() => { if (modal.open) render(); });
  void modal.closed.then(unsubscribe);
  render();
  return modal;
}
