import { ACT_IDS, TIME_SLOT_LABELS, TIME_SLOTS } from '../../modules/campaign';
import type { ActId, CampaignPort, MapId, TimeSlot } from '../../modules/contracts';
import { h } from './dom';
import { Modal, type UiShell } from './shell';

export interface DebugActions {
  warpAct(act: ActId): void;
  travel(map: MapId, entry?: string): void;
  heal(): void;
  toggleCollision(): boolean;
  collision(): boolean;
  cutscene(id: string): void;
  setTime(slot: TimeSlot): void;
  battle(encounter: string): void;
}

/** F2-Debug-Menü: Akte, Karten, Uhrzeit, Flags, Gegenstände, Herzen, Kämpfe, Heilen, Kollisionsansicht. */
export function openDebugMenu(shell: UiShell, campaign: CampaignPort, actions: DebugActions): Modal {
  const modal = new Modal(shell, { name: 'debug', title: 'Debug (F2)', size: 'wide' });
  const status = h('div', { class: 'status-line', role: 'status' });
  const say = (text: string) => { status.textContent = text; };
  const content = campaign.content;

  const acts = h('div', { class: 'row' }, ...ACT_IDS.map((act: ActId) =>
    h('button', { class: 'btn small', type: 'button', 'data-act': act, onclick: () => { modal.close(); actions.warpAct(act); } }, `Akt ${act}`)));

  const mapSelect = h('select', { 'aria-label': 'Karte' }, ...Object.values(content.maps).map((map) => h('option', { value: map.id }, `${map.name} (${map.id})`)));
  mapSelect.value = campaign.state().map;
  const entrySelect = h('select', { 'aria-label': 'Einstieg' });
  const fillEntries = () => {
    entrySelect.replaceChildren(...Object.keys(content.maps[mapSelect.value as MapId]?.entries ?? {}).map((entry) => h('option', { value: entry }, entry)));
  };
  mapSelect.addEventListener('change', fillEntries);
  fillEntries();

  const flagInput = h('input', { type: 'text', placeholder: 'flag-name', 'aria-label': 'Flag', list: 'debug-flags' });
  const known = new Set<string>(Object.keys(campaign.state().flags));
  const flagList = h('datalist', { id: 'debug-flags' }, ...[...known].map((flag) => h('option', { value: flag })));
  const setFlag = (value: boolean) => {
    const flag = flagInput.value.trim();
    if (!flag) return;
    const outcome = campaign.apply([{ setFlag: flag, value }]);
    say(`Flag ${flag} = ${value}${outcome.messages.length ? ` · ${outcome.messages.join(', ')}` : ''}`);
  };

  const itemSelect = h('select', { 'aria-label': 'Gegenstand' }, ...Object.values(content.items).sort((a, b) => a.name.localeCompare(b.name, 'de')).map((item) => h('option', { value: item.id }, item.name)));
  const qtyInput = h('input', { type: 'number', value: '1', min: '1', max: '99', style: 'width:64px', 'aria-label': 'Menge' });

  const times = h('div', { class: 'row' }, ...TIME_SLOTS.map((slot) =>
    h('button', { class: 'btn small', type: 'button', 'data-time': slot, onclick: () => { actions.setTime(slot); say(`Uhrzeit: ${TIME_SLOT_LABELS[slot]}`); } }, TIME_SLOT_LABELS[slot])));
  const npcSelect = h('select', { 'aria-label': 'Figur' }, ...Object.values(content.npcs).map((npc) => h('option', { value: npc.id }, npc.name)));
  const heartButton = (delta: number, label: string) => h('button', { class: 'btn small', type: 'button', onclick: () => {
    const outcome = campaign.apply([{ relation: npcSelect.value, delta }]);
    say(outcome.messages.join(', ') || `${npcSelect.value}: ${campaign.hearts(npcSelect.value)} Herzen`);
  } }, label);
  const battleSelect = h('select', { 'aria-label': 'Begegnung' }, ...Object.values(content.encounters).map((encounter) => h('option', { value: encounter.id }, encounter.name)));

  const cutSelect = h('select', { 'aria-label': 'Cutscene' }, ...Object.keys(content.cutscenes).map((id) => h('option', { value: id }, id)));

  const collisionBtn = h('button', { class: 'btn small', type: 'button', 'aria-pressed': String(actions.collision()), onclick: () => { const on = actions.toggleCollision(); collisionBtn.setAttribute('aria-pressed', String(on)); say(`Kollisionsansicht ${on ? 'an' : 'aus'}`); } }, 'Kollisionsansicht (F1)');

  modal.body.append(h('div', { class: 'debug-grid' },
    h('section', null, h('h3', null, 'Akte'), acts),
    h('section', null, h('h3', null, 'Karten'), h('div', { class: 'row' }, mapSelect, entrySelect,
      h('button', { class: 'btn small', type: 'button', onclick: () => { modal.close(); actions.travel(mapSelect.value as MapId, entrySelect.value || undefined); } }, 'Reisen'))),
    h('section', null, h('h3', null, 'Uhrzeit'), times),
    h('section', null, h('h3', null, 'Herzen'), h('div', { class: 'row' }, npcSelect, heartButton(100, '+1 ♥'), heartButton(-100, '−1 ♥'))),
    h('section', null, h('h3', null, 'Kampf'), h('div', { class: 'row' }, battleSelect,
      h('button', { class: 'btn small', type: 'button', onclick: () => { modal.close(); actions.battle(battleSelect.value); } }, 'Starten'))),
    h('section', null, h('h3', null, 'Flags'), h('div', { class: 'row' }, flagInput, flagList,
      h('button', { class: 'btn small', type: 'button', onclick: () => setFlag(true) }, 'Setzen'),
      h('button', { class: 'btn small', type: 'button', onclick: () => setFlag(false) }, 'Löschen'))),
    h('section', null, h('h3', null, 'Gegenstände'), h('div', { class: 'row' }, itemSelect, qtyInput,
      h('button', { class: 'btn small', type: 'button', onclick: () => { const outcome = campaign.apply([{ give: itemSelect.value, qty: Math.max(1, Number(qtyInput.value) || 1) }]); say(outcome.messages.join(', ') || 'Gegeben.'); } }, 'Geben'))),
    h('section', null, h('h3', null, 'Figur & Ansicht'), h('div', { class: 'row' },
      h('button', { class: 'btn small', type: 'button', onclick: () => { actions.heal(); say('Geheilt.'); } }, 'Heilen'),
      collisionBtn,
      cutSelect, h('button', { class: 'btn small', type: 'button', onclick: () => { modal.close(); actions.cutscene(cutSelect.value); } }, 'Cutscene abspielen'))),
  ), status);
  return modal;
}
