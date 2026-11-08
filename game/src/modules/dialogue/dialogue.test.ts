import { describe, expect, it } from 'vitest';
import { fixtureContent } from '../__fixtures__/content';
import { createCampaign } from '../campaign';
import type { AttributeId, GameContent } from '../contracts';
import { choiceSeenKey, createDialogueSession } from './index';

function campaignWith(attributes: Partial<Record<AttributeId, number>> = {}, content: GameContent = fixtureContent()) {
  const campaign = createCampaign(content, { storage: null, seed: 3 });
  const base = { technik: 3, koerper: 3, reflexe: 3, ausstrahlung: 3, strasse: 3, ...attributes };
  const spent = Object.values(base).reduce((a, b) => a + b - 3, 0);
  base.koerper += 4 - spent;
  const created = campaign.createCharacter({ name: 'Testfigur', look: 'a', origin: 'knast', attributes: base });
  expect(created.ok, created.message).toBe(true);
  return campaign;
}

describe('Dialogablauf', () => {
  it('zeigt Zeilen mit Namen und Porträt, wendet danach Knoteneffekte an und bietet Wahlen', () => {
    const campaign = campaignWith();
    const session = createDialogueSession(campaign, 'raven');
    let view = session.view();
    expect(view.line?.text).toBe('Komm zum Punkt, Testfigur.');
    expect(view.speakerName).toBe('Frau in Schwarz');
    expect(view.portrait).toBe('portrait-raven');
    expect(view.choices).toBeNull();
    expect(campaign.state().inventory.kaffee).toBe(1);
    view = session.advance();
    expect(view.line?.speaker).toBe('player');
    expect(view.portrait).toBe('portrait-player-a');
    expect(campaign.state().inventory.kaffee).toBe(2);
    expect(view.choices?.map(c => c.text)).toEqual(['Ich sehe mir den Chip an.', 'Du hasst Handschellen.', 'Wie heißt du?', 'Tschüss.']);
  });

  it('liefert für Check-Wahlen Attribut, Schwelle, Wert, ok und fehlende Punkte', () => {
    const session = createDialogueSession(campaignWith({ technik: 4 }), 'raven');
    session.advance();
    const chip = session.view().choices?.[0];
    expect(chip?.check).toMatchObject({ checkId: 'chip', attribute: 'technik', threshold: 6, value: 4, ok: false, missing: 2, label: '[Technik 6]' });
    expect(chip?.enabled).toBe(false);
    expect(chip?.reason).toBe('Es fehlen 2 Punkte Technik.');
    const before = session.view();
    expect(session.choose(chip?.index ?? 0).view).toEqual(before);
  });

  it('blendet hiddenIfFailed-Checks aus und zeigt sie, sobald sie erfüllt sind', () => {
    const hidden = createDialogueSession(campaignWith(), 'raven');
    hidden.advance();
    expect(hidden.view().choices?.some(c => c.check?.checkId === 'geheim')).toBe(false);
    const shown = createDialogueSession(campaignWith({ strasse: 7 }), 'raven');
    shown.advance();
    // Knast-Herkunft gibt Körper, daher bleibt Straße 7 < 9: weiterhin verborgen.
    expect(shown.view().choices?.some(c => c.check?.checkId === 'geheim')).toBe(false);
    const content = fixtureContent();
    content.checks.geheim.threshold = 7;
    const visible = createDialogueSession(campaignWith({ strasse: 7 }, content), 'raven');
    visible.advance();
    expect(visible.view().choices?.find(c => c.check?.checkId === 'geheim')?.enabled).toBe(true);
  });

  it('besteht den Check beim Wählen: einmalig XP, dann Effekte und nächster Knoten', () => {
    const campaign = campaignWith({ technik: 7 });
    const session = createDialogueSession(campaign, 'raven');
    session.advance();
    const { view, check } = session.choose(0);
    expect(check?.ok).toBe(true);
    expect(campaign.state().player.xp).toBe(45);
    expect(campaign.evaluate({ flag: 'chip-gesehen' })).toBe(true);
    expect(view.nodeId).toBe('chip');
    expect(view.speakerName).toBe('');
    expect(view.portrait).toBeNull();
    expect(session.outcome().requests).toContainEqual({ sfx: 'success' });
  });

  it('graut requires-Wahlen aus, bis die Bedingung gilt', () => {
    const campaign = campaignWith();
    const session = createDialogueSession(campaign, 'raven');
    session.advance();
    const heart = session.view().choices?.find(c => c.tag === '[Raven ♥6]');
    expect(heart?.enabled).toBe(false);
    campaign.apply([{ relation: 'raven', delta: 600 }]);
    expect(session.view().choices?.find(c => c.tag === '[Raven ♥6]')?.enabled).toBe(true);
  });

  it('entfernt once-Wahlen nach dem ersten Nehmen und kehrt zurück', () => {
    const campaign = campaignWith();
    const session = createDialogueSession(campaign, 'raven');
    session.advance();
    const index = session.view().choices?.find(c => c.text === 'Wie heißt du?')?.index ?? -1;
    let view = session.choose(index).view;
    expect(view.line?.text).toBe('Raven.');
    expect(view.portrait).toBe('portrait-raven-angry');
    expect(campaign.hasSeen(choiceSeenKey('raven', { text: 'Wie heißt du?', next: 'name' }))).toBe(true);
    view = session.advance();
    expect(view.nodeId).toBe('a');
    expect(view.speakerName).toBe('Raven');
    session.advance();
    expect(session.view().choices?.some(c => c.text === 'Wie heißt du?')).toBe(false);
  });

  it('endet ohne next und sammelt Anfragen', () => {
    const session = createDialogueSession(campaignWith(), 'raven');
    session.advance();
    const bye = session.view().choices?.find(c => c.text === 'Tschüss.')?.index ?? -1;
    const { view } = session.choose(bye);
    expect(view.done).toBe(true);
    expect(view.line).toBeNull();
    expect(session.outcome().requests).toContainEqual({ sfx: 'door' });
    expect(session.advance().done).toBe(true);
  });

  it('übersteht unbekannte Dialoge und Kreise aus leeren Knoten', () => {
    const campaign = campaignWith();
    expect(createDialogueSession(campaign, 'gibtsnicht').view().done).toBe(true);
    expect(createDialogueSession(campaign, 'schleife').view().done).toBe(true);
  });
});
