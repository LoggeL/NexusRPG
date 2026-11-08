// Questlog (Q, Bereich dom-ui): Reiter Aktiv / Abgeschlossen / Gescheitert, Liste und Details mit Schritten,
// Belohnung und Ziel fürs HUD; dazu laufende Aufträge der Auftragstafel.
import { jobTitle } from '../../modules/campaign';
import type { CampaignPort, QuestId, QuestStatus, QuestView } from '../../modules/contracts';
import { append, clear, h } from './dom';
import { Modal, tabBar, type UiShell } from './shell';
import { groupQuests, QUEST_KIND_LABEL, QUEST_STATUS_LABEL, visibleSteps } from './viewModels';

type Status = Exclude<QuestStatus, 'inactive'>;
const STATUSES: readonly Status[] = ['active', 'done', 'failed'];

function rewardText(campaign: CampaignPort, view: QuestView): string {
  const reward = view.quest.reward;
  if (!reward) return '';
  const parts: string[] = [];
  if (reward.xp) parts.push(`${reward.xp} XP`);
  if (reward.credits) parts.push(`${reward.credits} ¢`);
  for (const [item, qty] of Object.entries(reward.items ?? {})) parts.push(`${campaign.content.items[item]?.name ?? item}${qty > 1 ? ` ×${qty}` : ''}`);
  return parts.join(' · ');
}

export function openQuestLog(shell: UiShell, campaign: CampaignPort): Modal {
  const modal = new Modal(shell, { name: 'quests', title: 'Quests', size: 'wide' });
  const root = h('div', { class: 'quest-log', 'data-testid': 'quest-log' });
  modal.body.append(root);
  let tab: Status = 'active';
  let selected: QuestId | null = campaign.state().tracked;

  const render = () => {
    const focused = (document.activeElement as HTMLElement | null)?.dataset?.quest;
    clear(root);
    const state = campaign.state();
    const groups = groupQuests(campaign.quests());
    const jobs = state.jobs.active;
    root.append(tabBar<Status>('Queststatus', STATUSES.map((status) => ({
      id: status, label: QUEST_STATUS_LABEL[status], badge: status === 'active' ? groups.active.length + jobs.length : groups[status].length,
    })), tab, (next) => { tab = next; selected = null; render(); (root.querySelector(`[data-tab="${next}"]`) as HTMLElement | null)?.focus(); }));

    const views = groups[tab];
    if (!selected || !views.some((view) => view.quest.id === selected)) selected = views[0]?.quest.id ?? null;
    const list = h('div', { class: 'list', role: 'listbox', 'aria-label': `Quests: ${QUEST_STATUS_LABEL[tab]}` });
    const detail = h('div', { class: 'detail', 'aria-live': 'polite', 'data-testid': 'quest-detail' });
    root.append(h('div', { class: 'list-detail' }, list, detail));

    if (!views.length && !(tab === 'active' && jobs.length)) {
      list.append(h('p', { class: 'empty' }, tab === 'active' ? 'Noch keine Quests. Sprich mit den Leuten in Noxius!' : 'Hier steht noch nichts.'));
    }
    for (const view of views) {
      const id = view.quest.id;
      list.append(h('button', {
        type: 'button', role: 'option', 'aria-selected': String(id === selected), 'data-quest': id, 'data-kind': view.quest.kind,
        onclick: () => { selected = id; render(); },
      },
      h('span', { class: `kind-dot ${view.quest.kind}`, 'aria-hidden': 'true' }),
      h('span', { class: 'row-main' }, view.quest.title),
      state.tracked === id ? h('span', { class: 'badge', title: 'Im HUD verfolgt' }, 'Ziel') : null));
    }
    if (tab === 'active' && jobs.length) {
      list.append(h('div', { class: 'cat', role: 'presentation' }, 'Laufende Aufträge'));
      for (const job of jobs) {
        const template = campaign.content.jobs[job.template];
        const target = template?.targets[job.target];
        list.append(h('div', { class: 'job-row', 'data-job': job.id },
          h('strong', null, jobTitle(campaign.content, job)),
          h('span', { class: 'meta' }, [target?.label, `${job.credits} ¢`].filter(Boolean).join(' · '))));
      }
    }

    const view = views.find((entry) => entry.quest.id === selected);
    if (view) {
      const steps = visibleSteps(view, campaign.evaluate.bind(campaign));
      const reward = rewardText(campaign, view);
      const giver = view.quest.giver ? campaign.displayName(view.quest.giver) : '';
      append(detail, [
        h('h3', null, view.quest.title),
        h('div', { class: 'meta' }, [QUEST_KIND_LABEL[view.quest.kind], giver && `von ${giver}`, QUEST_STATUS_LABEL[tab]].filter(Boolean).join(' · ')),
        view.quest.summary ? h('p', null, view.quest.summary) : null,
        h('ol', { class: 'steps', 'aria-label': 'Schritte' }, ...steps.map(({ step, done }) =>
          h('li', { class: done ? 'done' : '', 'data-step': step.id },
            h('span', { class: 'step-mark', 'aria-hidden': 'true' }, done ? '✓' : '○'),
            h('span', null, step.text, done ? h('span', { class: 'sr-only' }, ' (erledigt)') : null),
            step.optional ? h('span', { class: 'meta' }, ' optional') : null))),
        reward ? h('p', { class: 'meta' }, `Belohnung: ${reward}`) : null]);
      if (tab === 'active') {
        const tracked = state.tracked === view.quest.id;
        detail.append(h('div', { class: 'actions' }, h('button', {
          class: `btn${tracked ? '' : ' primary'}`, type: 'button', 'aria-pressed': String(tracked), 'data-testid': 'quest-track',
          onclick: () => { campaign.track(tracked ? null : view.quest.id); render(); },
        }, tracked ? 'Ziel nicht mehr verfolgen' : 'Als Ziel verfolgen')));
      }
    }
    if (focused) (list.querySelector(`[data-quest="${CSS.escape(focused)}"]`) as HTMLElement | null)?.focus({ preventScroll: true });
  };

  const unsubscribe = campaign.subscribe(() => { if (modal.open) render(); });
  void modal.closed.then(unsubscribe);
  render();
  return modal;
}
