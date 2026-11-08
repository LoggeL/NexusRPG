// Charakterbogen (C) und Charaktererstellung (Bereich dom-ui). Regeln liegen in modules/character und
// modules/campaign (Bereich character); hier nur Anzeige, Eingabe und Aufrufe über den CampaignPort.
import { ATTR_FREE_POINTS, ATTR_MAX, ATTRIBUTE_IDS, ATTRIBUTE_LABELS, EQUIP_SLOTS, maxHpOf } from '../../modules/campaign';
import {
  attributeParts, CYBER_SLOT_LABELS, cyberwareBonusText, cyberwareSlots, derivedStats, levelProgress, perkOverview, type PerkStatus,
} from '../../modules/character';
import type { AttributeId, CampaignPort, EquipSlot } from '../../modules/contracts';
import type { AssetCatalog } from '../../platform/assets/manifest';
import {
  bonusOptions, canDecrease, canIncrease, chosenBonus, createDraft, decrease, draftProblems, finalAttributes, freePoints, increase,
  originBoni, resetPoints, selectBonus, selectOrigin, toCharacterInput, type CreationDraft,
} from './creationModel';
import { monogramUrl, playerAccent } from '../appearance/accent';
import { loadCreatorCatalog, type CreatorCatalog } from '../appearance/compose';
import { FigurePreview } from '../appearance/preview';
import { mountCreator, type CreatorHandle } from './creator';
import { clear, h, itemIcon, portraitImg, setPortrait } from './dom';
import { canUnequip, unequip } from './portExtras';
import { Modal, tabBar, type UiShell } from './shell';

const EQUIP_LABEL: Record<EquipSlot, string> = { nahkampf: 'Nahkampf', fernkampf: 'Fernkampf', smart: 'Smart (Hack)', kleidung: 'Kleidung' };

/** Zehn Segmente je Attribut: Basis gefüllt, Boni hervorgehoben, Vorschau (Erstellung) schraffiert. */
function attrBar(base: number, bonus: number, attribute: AttributeId, preview = 0): HTMLElement {
  const bar = h('span', { class: 'attr-bar', 'data-attr': attribute, 'aria-hidden': 'true' });
  for (let i = 1; i <= ATTR_MAX; i++) {
    const cls = i <= base ? 'on' : i <= base + bonus ? 'bonus' : i <= base + bonus + preview ? 'preview' : '';
    bar.append(h('span', { class: `pip ${cls}` }));
  }
  return bar;
}

type SheetTab = 'werte' | 'perks' | 'cyberware' | 'ausruestung';

/** Charakterbogen: Werte (Punkte verteilen), Perks lernen, Cyberware-Plätze, Ausrüstung. */
export function openCharacterSheet(shell: UiShell, catalog: AssetCatalog, campaign: CampaignPort): Modal {
  const modal = new Modal(shell, { name: 'character', title: 'Figur', size: 'wide' });
  const root = h('div', { class: 'sheet', 'data-testid': 'character-sheet' });
  modal.body.append(root);
  let tab: SheetTab = 'werte';
  const say = (message: string, ok: boolean) => shell.toast(message, ok ? 'good' : 'bad');
  /** Vex: Foto bzw. Porträt; eigene Figur: Monogramm (kein Bild der Spielfigur, design.md §3.1a). */
  const playerPicture = () => {
    const player = campaign.state().player;
    const key = campaign.portraitKey('player');
    if (key) {
      const img = portraitImg(catalog, key, player.name, player.name);
      const base = key.replace(/^portrait-/, '');
      const photo = player.preset ? catalog.imageUrl(catalog.imageKey(`photo-${base}-neutral`)) : null;
      if (photo) { img.src = photo; img.classList.add('sheet-photo'); }
      return img;
    }
    return h('img', { class: 'portrait-thumb monogram', alt: player.name, src: monogramUrl(player.name, playerAccent(campaign.content, player)), draggable: 'false' });
  };

  const header = () => {
    const state = campaign.state();
    const player = state.player;
    const content = campaign.content;
    const progress = levelProgress(player.xp);
    const derived = derivedStats(content, player);
    return h('div', { class: 'sheet-head' },
      playerPicture(),
      h('div', { class: 'sheet-id' },
        h('h3', null, player.name),
        h('div', { class: 'meta' }, [content.origins[player.origin]?.name ?? 'Ohne Herkunft', player.preset ? content.presets?.[player.preset]?.name : null].filter(Boolean).join(' · ')),
        h('div', { class: 'xp', title: progress.next ? `${progress.needed} XP bis Stufe ${progress.level + 1}` : 'Höchststufe' },
          h('span', { class: 'lvl' }, `Stufe ${player.level}`),
          h('span', { class: 'xp-bar', role: 'progressbar', 'aria-label': 'Erfahrung', 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-valuenow': String(Math.round(progress.ratio * 100)) },
            h('span', { style: `width:${Math.round(progress.ratio * 100)}%` })),
          h('span', { class: 'meta' }, progress.next ? `${player.xp} / ${progress.next} XP` : `${player.xp} XP`))),
      h('dl', { class: 'derived' },
        h('dt', null, 'LP'), h('dd', null, `${player.hp}/${campaign.maxHp()}`),
        h('dt', null, 'Bewegung'), h('dd', null, String(derived.move)),
        h('dt', null, 'Initiative'), h('dd', null, String(derived.initiative)),
        h('dt', null, 'Bandbreite'), h('dd', null, String(derived.bandwidth)),
        h('dt', null, 'Firewall'), h('dd', null, String(derived.firewall)),
        h('dt', null, 'Panzerung'), h('dd', null, String(derived.armor))));
  };

  const renderValues = (panel: HTMLElement) => {
    const player = campaign.state().player;
    const content = campaign.content;
    panel.append(h('p', { class: 'points', 'data-testid': 'sheet-attr-points' }, player.unspentAttr > 0
      ? `Freie Attributpunkte: ${player.unspentAttr}` : 'Keine freien Attributpunkte. Jede neue Stufe bringt einen.'));
    const list = h('ul', { class: 'attr-list', 'aria-label': 'Attribute' });
    for (const id of ATTRIBUTE_IDS) {
      const base = player.attributes[id];
      const effective = campaign.attribute(id);
      const parts = attributeParts(content, player, id).slice(1).map((part) => `${part.label} ${part.value > 0 ? '+' : '−'}${Math.abs(part.value)}`);
      list.append(h('li', { class: 'attr-row', 'data-attr': id },
        h('span', { class: 'check-tag', 'data-attr': id }, ATTRIBUTE_LABELS[id]),
        attrBar(base, Math.max(0, effective - base), id),
        h('span', { class: 'value', title: parts.length ? parts.join(', ') : 'ohne Boni' }, String(effective)),
        h('span', { class: 'meta parts' }, parts.join(', ')),
        player.unspentAttr > 0
          ? h('button', {
            class: 'btn small', type: 'button', 'data-testid': `spend-${id}`, disabled: base >= ATTR_MAX, 'aria-label': `${ATTRIBUTE_LABELS[id]} um 1 erhöhen`,
            onclick: () => { const r = campaign.spendAttribute(id); say(r.message, r.ok); },
          }, '+1')
          : null));
    }
    panel.append(list);
  };

  const perkRow = (status: PerkStatus) => {
    const perk = status.perk;
    const state = status.learned ? 'gelernt' : status.available ? 'lernbar' : status.qualified ? 'punkte' : 'gesperrt';
    return h('li', { class: `perk ${state}`, 'data-perk': perk.id },
      h('div', { class: 'perk-main' },
        h('strong', null, perk.name), ' ',
        h('span', { class: 'check-tag', 'data-attr': perk.attribute }, status.requirement),
        h('div', { class: 'meta' }, perk.description)),
      status.learned
        ? h('span', { class: 'badge good' }, 'Gelernt')
        : h('button', {
          class: `btn small${status.available ? ' primary' : ''}`, type: 'button', 'data-testid': `perk-${perk.id}`, 'aria-disabled': String(!status.available),
          title: status.reason ?? `Kostet ${status.cost} Perkpunkt${status.cost === 1 ? '' : 'e'}`,
          onclick: () => {
            if (!status.available) { say(status.reason ?? 'Nicht lernbar.', false); return; }
            const r = campaign.learnPerk(perk.id);
            say(r.message, r.ok);
          },
        }, status.available ? 'Lernen' : status.reason ?? 'Gesperrt'));
  };

  const renderPerks = (panel: HTMLElement) => {
    const player = campaign.state().player;
    panel.append(h('p', { class: 'points', 'data-testid': 'sheet-perk-points' }, `Perkpunkte: ${player.perkPoints}`));
    const overview = perkOverview(campaign.content, player);
    if (!overview.length) { panel.append(h('p', { class: 'empty' }, 'Noch keine Perks bekannt.')); return; }
    for (const id of ATTRIBUTE_IDS) {
      const group = overview.filter((status) => status.perk.attribute === id);
      if (!group.length) continue;
      panel.append(h('h4', { class: 'check-tag', 'data-attr': id }, ATTRIBUTE_LABELS[id]), h('ul', { class: 'perk-list', 'aria-label': `Perks ${ATTRIBUTE_LABELS[id]}` }, ...group.map(perkRow)));
    }
  };

  const renderCyber = (panel: HTMLElement) => {
    const state = campaign.state();
    const content = campaign.content;
    panel.append(h('p', { class: 'meta' }, 'Einbau und Ausbau nur bei einem Schrauber (Ripperdoc). Cyberware-Boni zählen bei Checks mit.'));
    const grid = h('ul', { class: 'cyber-grid', 'aria-label': 'Cyberware-Plätze' });
    for (const view of cyberwareSlots(content, state.player)) {
      const part = view.part;
      grid.append(h('li', { class: `cyber-slot${part ? ' filled' : ''}`, 'data-slot': view.slot },
        h('span', { class: 'slot-name' }, view.label),
        part
          ? h('div', null, h('strong', null, part.name), h('div', { class: 'meta' }, [cyberwareBonusText(part, ATTRIBUTE_LABELS), part.description].filter(Boolean).join(' · ')))
          : h('span', { class: 'meta' }, 'frei')));
    }
    panel.append(grid);
    const owned = Object.entries(state.inventory).filter(([id, qty]) => qty > 0 && content.items[id]?.category === 'cyberware');
    if (owned.length) {
      panel.append(h('h4', null, 'Im Gepäck (einbaubar beim Schrauber)'), h('ul', { class: 'list-rows' },
        ...owned.map(([id, qty]) => {
          const item = content.items[id];
          const part = item.cyberware ? content.cyberware[item.cyberware] : undefined;
          return h('li', null, h('span', { class: 'row-main' }, itemIcon(catalog, item.icon, item.name), item.name, qty > 1 ? ` ×${qty}` : ''),
            h('span', { class: 'meta' }, part ? CYBER_SLOT_LABELS[part.slot] : ''));
        })));
    }
  };

  const renderGear = (panel: HTMLElement) => {
    const state = campaign.state();
    const content = campaign.content;
    const list = h('ul', { class: 'gear-list', 'aria-label': 'Ausrüstung' });
    for (const slot of EQUIP_SLOTS) {
      const current = state.player.equipment[slot];
      const def = current ? content.items[current] : undefined;
      const options = Object.entries(state.inventory)
        .filter(([id, qty]) => qty > 0 && id !== current && (() => { const item = content.items[id]; return !!item && (slot === 'kleidung' ? item.category === 'kleidung' : item.weapon?.kind === slot); })())
        .map(([id]) => content.items[id]);
      list.append(h('li', { class: 'gear-slot', 'data-slot': slot },
        h('span', { class: 'slot-name' }, EQUIP_LABEL[slot]),
        h('span', { class: 'row-main' }, def ? itemIcon(catalog, def.icon, def.name) : null,
          def ? h('span', null, h('strong', null, def.name), def.weapon ? h('span', { class: 'meta' }, ` Schaden ${def.weapon.damage}, Reichweite ${def.weapon.range}`) : null) : h('span', { class: 'meta' }, '—')),
        h('span', { class: 'row-actions' },
          ...options.map((item) => h('button', {
            class: 'btn small', type: 'button', 'data-equip': item.id,
            onclick: () => { const r = campaign.equip(item.id); say(r.message, r.ok); },
          }, `${item.name} anlegen`)),
          def && canUnequip(campaign)
            ? h('button', { class: 'btn small', type: 'button', onclick: () => { const r = unequip(campaign, slot); if (r) say(r.message, r.ok); } }, 'Ablegen')
            : null)));
    }
    panel.append(list);
  };

  const render = () => {
    const focusedTab = (document.activeElement as HTMLElement | null)?.dataset?.tab;
    clear(root);
    const player = campaign.state().player;
    const tabs = tabBar<SheetTab>('Bereiche des Figurbogens', [
      { id: 'werte', label: 'Werte', badge: player.unspentAttr || undefined },
      { id: 'perks', label: 'Perks', badge: player.perkPoints || undefined },
      { id: 'cyberware', label: 'Cyberware' },
      { id: 'ausruestung', label: 'Ausrüstung' },
    ], tab, (next) => { tab = next; render(); (root.querySelector(`[data-tab="${next}"]`) as HTMLElement | null)?.focus(); });
    const panel = h('div', { class: 'tab-panel', role: 'tabpanel', 'data-panel': tab });
    if (tab === 'werte') renderValues(panel);
    else if (tab === 'perks') renderPerks(panel);
    else if (tab === 'cyberware') renderCyber(panel);
    else renderGear(panel);
    root.append(header(), tabs, panel);
    if (focusedTab) (root.querySelector(`[data-tab="${focusedTab}"]`) as HTMLElement | null)?.focus({ preventScroll: true });
  };

  const unsubscribe = campaign.subscribe(() => { if (modal.open) render(); });
  void modal.closed.then(unsubscribe);
  render();
  return modal;
}

/**
 * Charaktererstellung in Schritten: Wahl („Eigene Figur bauen“ oder „Als Vex spielen“, design.md §3.1b) →
 * Charakter-Baukasten (§3.1a) → Name, Herkunft, 4 freie Attributpunkte. Vex: feste Werte, nur Bestätigen.
 * Liefert erst, wenn die Kampagne die Figur angenommen hat (kein Abbrechen – der Spielbeginn braucht eine Figur).
 */
export function openCharacterCreation(shell: UiShell, catalog: AssetCatalog, campaign: CampaignPort): Promise<void> {
  return new Promise((resolve) => {
    const content = campaign.content;
    type Step = 'wahl' | 'aussehen' | 'werte' | 'vex';
    let step: Step = 'wahl';
    let editor: CreatorHandle | null = null;
    let miniPreview: FigurePreview | null = null;
    let creatorCatalog: CreatorCatalog | null = null;
    const modal = new Modal(shell, {
      name: 'creation', title: 'Neue Figur', size: 'wide', closable: false,
      onIntent: (event) => {
        if (event.intent.type === 'cancel') {
          if (step === 'aussehen' && vex) show('wahl');
          else if (step === 'werte') show('aussehen');
          else if (step === 'vex') show('wahl');
          return true;
        }
        // Im Baukasten übernimmt der Editor die Tasten selbst (Pfeile, Q/E, R, Enter).
        return step === 'aussehen';
      },
    });
    modal.el.classList.add('creation');
    const vex = content.presets?.vex;
    const origins = Object.values(content.origins);
    let draft: CreationDraft = createDraft(content);
    let tried = false;
    const focusAfter = (selector: string) => requestAnimationFrame(() => (modal.el.querySelector(selector) as HTMLElement | null)?.focus({ preventScroll: true }));
    const finish = (input: Parameters<CampaignPort['createCharacter']>[0], status: HTMLElement) => {
      const result = campaign.createCharacter(input);
      if (!result.ok) { status.textContent = result.message; status.className = 'status-line bad'; return; }
      cleanup();
      modal.close();
      shell.toast(result.message, 'good');
      resolve();
    };
    const cleanup = () => { editor?.destroy(); editor = null; miniPreview?.destroy(); miniPreview = null; };
    const catalogReady = loadCreatorCatalog().then((loaded) => { creatorCatalog = loaded; });

    // ---------------------------------------------------------- Schritt 1: Wahl
    const renderChoice = () => {
      modal.titleEl.textContent = 'Neue Figur';
      const card = (testid: string, title: string, text: string, onclick: () => void, media?: HTMLElement | null) =>
        h('button', { class: 'creation-choice', type: 'button', 'data-testid': testid, onclick }, media ?? null, h('strong', null, title), h('span', { class: 'meta' }, text));
      const vexMedia = vex ? h('img', { alt: '', draggable: 'false', decoding: 'async' }) : null;
      if (vex && vexMedia) {
        const photo = catalog.imageUrl(catalog.imageKey(`photo-${vex.portrait}-neutral`));
        if (photo) vexMedia.src = photo; else setPortrait(vexMedia, catalog, `portrait-${vex.portrait}`, vex.name);
      }
      modal.body.append(h('div', { class: 'creation-choices', role: 'group', 'aria-label': 'Wie willst du spielen?' },
        card('creation-own', 'Eigene Figur bauen', 'Charakter-Baukasten: Körper, Haare, Kleidung, Farben, Cyberware und Extras. Danach Name, Herkunft und Attribute.', () => show('aussehen'),
          h('span', { class: 'choice-glyph', 'aria-hidden': 'true' }, '✦')),
        vex ? card('creation-vex', 'Als Vex spielen', vex.description, () => show('vex'), vexMedia) : null));
      modal.foot.append(h('p', { class: 'meta creation-foot-note' }, 'Die eigene Figur ist volljährig (Anfang zwanzig) und zeigt sich nur in der Welt – du siehst die Stadt mit ihren Augen.'));
    };

    // ---------------------------------------------------------- Schritt 2: Baukasten
    const renderEditor = () => {
      modal.titleEl.textContent = 'Aussehen';
      const holder = h('div', { class: 'creator-holder' }, h('p', { class: 'boot-status' }, 'Teile werden geladen …'));
      modal.body.append(holder);
      const back = vex ? h('button', { class: 'btn', type: 'button', 'data-testid': 'creator-back', onclick: () => show('wahl') }, 'Zurück') : null;
      const next = h('button', { class: 'btn primary', type: 'button', 'data-testid': 'creator-next', onclick: () => leaveEditor() }, 'Weiter');
      modal.foot.append(h('span', { class: 'meta creator-keys' }, 'Bild↑/↓ Reiter · ↑/↓ Zeile · ←/→ Option · Q/E drehen · R Zufall · Strg+Z/Y · Enter weiter'), ...(back ? [back] : []), next);
      void catalogReady.then(() => {
        if (step !== 'aussehen') return;
        clear(holder);
        editor = mountCreator({
          content, catalog: creatorCatalog, initial: draft.appearance, look: draft.look, reducedMotion: shell.reducedMotion,
          onNext: () => leaveEditor(), isActive: () => shell.topModal() === modal && step === 'aussehen',
        });
        holder.append(editor.el);
        requestAnimationFrame(() => editor?.focus());
      });
    };
    const leaveEditor = () => {
      if (editor) draft = { ...draft, appearance: editor.appearance(), look: editor.look() };
      show('werte');
    };

    // ---------------------------------------------------------- Schritt 3: Name, Herkunft, Attribute
    const renderValues = () => {
      modal.titleEl.textContent = 'Name, Herkunft, Attribute';
      const status = h('div', { class: 'status-line', role: 'status', 'aria-live': 'polite', 'data-testid': 'creation-status' });
      const nameInput = h('input', {
        type: 'text', maxlength: '16', placeholder: 'Wie heißt du?', 'aria-label': 'Name', autocomplete: 'off', spellcheck: 'false',
        'data-testid': 'creation-name', 'data-autofocus': true, value: draft.name,
      });
      nameInput.addEventListener('input', () => { draft = { ...draft, name: nameInput.value }; renderStatus(); });
      const originBox = h('div', { class: 'origin-list', role: 'radiogroup', 'aria-label': 'Herkunft' });
      const originDetail = h('div', { class: 'origin-detail', 'aria-live': 'polite', 'data-testid': 'creation-origin-detail' });
      const attrBox = h('ul', { class: 'attr-list', 'aria-label': 'Attribute' });
      const pointsEl = h('p', { class: 'points', 'data-testid': 'creation-points' });
      miniPreview = new FigurePreview({ catalog: creatorCatalog, texts: content.appearance, scale: 1.5, reducedMotion: shell.reducedMotion });
      miniPreview.set(draft.appearance);

      const renderOrigins = () => {
        clear(originBox);
        for (const origin of origins) {
          const selected = origin.id === draft.origin;
          originBox.append(h('button', {
            class: 'origin-card', type: 'button', role: 'radio', 'aria-checked': String(selected), 'data-origin': origin.id,
            onclick: () => { draft = selectOrigin(draft, origin.id, content); renderOrigins(); renderAttributes(); focusAfter(`[data-origin="${CSS.escape(origin.id)}"]`); },
          }, h('strong', null, origin.name), h('span', { class: 'check-tag tag' }, origin.tag)));
        }
        clear(originDetail);
        const origin = content.origins[draft.origin];
        if (!origin) return;
        originDetail.append(h('h4', null, origin.name), h('p', null, origin.description), h('ul', { class: 'boni' }, ...originBoni(origin, content).map((line) => h('li', null, line))));
        const options = bonusOptions(draft, content);
        if (options.length > 1) {
          const chosen = chosenBonus(draft, content);
          originDetail.append(h('div', { class: 'seg', role: 'radiogroup', 'aria-label': 'Bonusattribut wählen' },
            ...options.map((id) => h('button', {
              class: 'btn small', type: 'button', role: 'radio', 'aria-checked': String(id === chosen), 'data-bonus': id,
              onclick: () => { draft = selectBonus(draft, id, content); renderOrigins(); renderAttributes(); focusAfter(`[data-bonus="${id}"]`); },
            }, `+1 ${ATTRIBUTE_LABELS[id]}`))));
        }
      };

      const renderAttributes = () => {
        clear(attrBox);
        const final = finalAttributes(draft, content);
        const bonus = chosenBonus(draft, content);
        for (const id of ATTRIBUTE_IDS) {
          const value = draft.attributes[id];
          attrBox.append(h('li', { class: 'attr-row', 'data-attr': id },
            h('span', { class: 'check-tag', 'data-attr': id }, ATTRIBUTE_LABELS[id]),
            attrBar(3, value - 3, id, final[id] - value),
            h('span', { class: 'stepper' },
              h('button', {
                class: 'btn small', type: 'button', 'aria-label': `${ATTRIBUTE_LABELS[id]} senken`, 'data-testid': `creation-minus-${id}`, disabled: !canDecrease(draft, id),
                onclick: () => { draft = decrease(draft, id); renderAttributes(); focusAfter(canDecrease(draft, id) ? `[data-testid="creation-minus-${id}"]` : `[data-testid="creation-plus-${id}"]`); },
              }, '−'),
              h('span', { class: 'value', 'aria-live': 'polite', 'aria-label': `${ATTRIBUTE_LABELS[id]} ${final[id]}` }, String(final[id])),
              h('button', {
                class: 'btn small', type: 'button', 'aria-label': `${ATTRIBUTE_LABELS[id]} erhöhen`, 'data-testid': `creation-plus-${id}`, disabled: !canIncrease(draft, id),
                onclick: () => { draft = increase(draft, id); renderAttributes(); focusAfter(canIncrease(draft, id) ? `[data-testid="creation-plus-${id}"]` : `[data-testid="creation-minus-${id}"]`); },
              }, '+')),
            bonus === id ? h('span', { class: 'badge', title: 'Herkunftsbonus' }, '+1') : h('span', { class: 'badge ghost', 'aria-hidden': 'true' })));
        }
        const free = freePoints(draft);
        const hp = maxHpOf(content, { ...campaign.state().player, attributes: final, level: 1, cyberware: {}, equipment: {} });
        pointsEl.textContent = `Freie Punkte: ${free} von ${ATTR_FREE_POINTS} · Start-LP ${hp}`;
        pointsEl.classList.toggle('done', free === 0);
        renderStatus();
      };

      const renderStatus = () => {
        const problems = draftProblems(draft, content);
        start.setAttribute('aria-disabled', String(problems.length > 0));
        status.className = `status-line${tried && problems.length ? ' bad' : ''}`;
        status.textContent = tried ? problems.join(' ') : problems.length ? `Noch offen: ${problems.length}` : 'Bereit für Noxius.';
      };

      const start = h('button', {
        class: 'btn primary', type: 'button', 'data-testid': 'creation-start',
        onclick: () => {
          tried = true;
          draft = { ...draft, name: nameInput.value };
          const problems = draftProblems(draft, content);
          if (problems.length) { renderStatus(); if (problems[0].includes('Name')) nameInput.focus(); return; }
          finish(toCharacterInput(draft), status);
        },
      }, 'Los geht’s');
      const reset = h('button', { class: 'btn small', type: 'button', 'data-testid': 'creation-reset', onclick: () => { draft = resetPoints(draft); renderAttributes(); } }, 'Zurücksetzen');
      const lookName = content.looks[draft.look]?.name;

      modal.body.append(h('div', { class: 'creation-grid' },
        h('section', { class: 'col-look', 'aria-label': 'Name und Aussehen' },
          h('h3', null, 'Name'), nameInput,
          h('h3', null, 'Aussehen'),
          h('div', { class: 'look-preview creator-mini' }, miniPreview.canvas, lookName ? h('span', { class: 'meta' }, `Vorlage: ${lookName} (angepasst möglich)`) : null),
          h('button', { class: 'btn small', type: 'button', 'data-testid': 'creation-edit-look', onclick: () => show('aussehen') }, 'Aussehen ändern')),
        h('section', { class: 'col-origin', 'aria-label': 'Herkunft' }, h('h3', null, 'Herkunft'), originBox, originDetail),
        h('section', { class: 'col-attr', 'aria-label': 'Attribute' }, h('h3', null, 'Attribute'), pointsEl, attrBox, reset)));
      modal.foot.append(status, h('button', { class: 'btn', type: 'button', 'data-testid': 'creation-back', onclick: () => show('aussehen') }, 'Zurück'), start);
      renderOrigins();
      renderAttributes();
    };

    // ---------------------------------------------------------- Vex
    const renderVex = () => {
      if (!vex) { show('wahl'); return; }
      modal.titleEl.textContent = 'Als Vex spielen';
      const status = h('div', { class: 'status-line', role: 'status', 'aria-live': 'polite', 'data-testid': 'creation-status' });
      const photo = h('img', { class: 'vex-photo', alt: vex.name, draggable: 'false', decoding: 'async' });
      const url = catalog.imageUrl(catalog.imageKey(`photo-${vex.portrait}-signatur`)) ?? catalog.imageUrl(catalog.imageKey(`photo-${vex.portrait}-neutral`));
      if (url) photo.src = url; else setPortrait(photo, catalog, `portrait-${vex.portrait}`, vex.name);
      const origin = content.origins[vex.origin];
      const attrs = h('ul', { class: 'attr-list', 'aria-label': 'Feste Attribute' },
        ...ATTRIBUTE_IDS.map((id) => h('li', { class: 'attr-row', 'data-attr': id },
          h('span', { class: 'check-tag', 'data-attr': id }, ATTRIBUTE_LABELS[id]),
          attrBar(vex.attributes[id], 0, id),
          h('span', { class: 'value' }, String(vex.attributes[id])))));
      const perks = (vex.perks ?? []).map((id) => content.perks[id]).filter(Boolean);
      const items = Object.entries(vex.items ?? {}).map(([id, qty]) => content.items[id] ? `${content.items[id].name}${qty > 1 ? ` ×${qty}` : ''}` : id);
      modal.body.append(h('div', { class: 'creation-vex' },
        h('div', { class: 'vex-media' }, photo),
        h('div', { class: 'vex-info' },
          h('h3', null, vex.name),
          h('p', null, vex.description),
          h('dl', { class: 'vex-facts' },
            h('dt', null, 'Herkunft'), h('dd', null, origin ? `${origin.name} ${origin.tag}` : vex.origin),
            perks.length ? [h('dt', null, 'Perk'), h('dd', null, ...perks.map((perk) => h('span', null, h('strong', null, perk.name), ` – ${perk.description}`)))] : null,
            items.length ? [h('dt', null, 'Start'), h('dd', null, items.join(', '))] : null),
          h('h4', null, 'Attribute (fest)'), attrs,
          h('p', { class: 'meta' }, 'Name, Aussehen, Herkunft, Attribute und Perk sind fest; der Baukasten ist für Vex gesperrt.'))));
      modal.foot.append(status,
        h('button', { class: 'btn', type: 'button', 'data-testid': 'creation-back', onclick: () => show('wahl') }, 'Zurück'),
        h('button', {
          class: 'btn primary', type: 'button', 'data-testid': 'creation-start-vex', 'data-autofocus': true,
          onclick: () => finish({ name: vex.name, look: draft.look, origin: vex.origin, attributes: { ...vex.attributes }, preset: vex.id }, status),
        }, 'Als Vex starten'));
    };

    const show = (next: Step) => {
      editor?.destroy(); editor = null;
      miniPreview?.destroy(); miniPreview = null;
      step = next;
      clear(modal.body);
      clear(modal.foot);
      modal.el.dataset.step = next;
      if (next === 'wahl') renderChoice();
      else if (next === 'aussehen') renderEditor();
      else if (next === 'werte') renderValues();
      else renderVex();
      requestAnimationFrame(() => modal.focusFirst());
    };
    show(vex ? 'wahl' : 'aussehen');
  });
}
