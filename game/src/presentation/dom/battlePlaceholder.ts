// Platzhalter für den Rasterkampf, bis der Bereich combat-presentation die Kampfszene liefert.
// Zeigt Begegnung und Gegner und lässt den Ausgang wählen; abgerechnet wird über CampaignPort.finishBattle.
import type { BattleOutcome, CampaignPort, EncounterId } from '../../modules/contracts';
import { h } from './dom';
import { Modal, type UiShell } from './shell';

export function openBattlePlaceholder(shell: UiShell, campaign: CampaignPort, encounterId: EncounterId): Promise<BattleOutcome> {
  return new Promise((resolve) => {
    const encounter = campaign.content.encounters[encounterId];
    let outcome: BattleOutcome = 'fled';
    const canFlee = encounter?.canFlee !== false;
    const modal = new Modal(shell, {
      name: 'battle', title: `Kampf: ${encounter?.name ?? encounterId}`, size: 'narrow', closable: canFlee,
      onClose: () => resolve(outcome),
    });
    const enemies = (encounter?.enemies ?? []).map((entry) => `${entry.count ?? 1}× ${campaign.content.enemies[entry.enemy]?.name ?? entry.enemy}`).join(', ');
    modal.body.append(
      h('p', { class: 'lead' }, 'Rasterkampf folgt (Platzhalter).'),
      h('p', null, `Gegner: ${enemies || 'unbekannt'}`),
      ...(encounter?.intro ?? []).map((line) => h('p', { class: 'meta' }, line.text)));
    const pick = (value: BattleOutcome) => { outcome = value; modal.close(); };
    modal.foot.append(
      h('button', { class: 'btn primary', type: 'button', 'data-testid': 'battle-win', 'data-autofocus': true, onclick: () => pick('win') }, 'Sieg'),
      h('button', { class: 'btn', type: 'button', 'data-testid': 'battle-lose', onclick: () => pick('lose') }, 'Niederlage'));
    if (canFlee) modal.foot.append(h('button', { class: 'btn', type: 'button', 'data-testid': 'battle-flee', onclick: () => pick('fled') }, 'Fliehen'));
  });
}
