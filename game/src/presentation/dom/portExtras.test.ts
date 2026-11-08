// Tests der Port-Rückfälle und Ansichtsmodelle gegen eine echte Kampagne (Fixture, ohne DOM).
import { describe, expect, it } from 'vitest';
import { fixtureContent } from '../../modules/__fixtures__/content';
import { createCampaign } from '../../modules/campaign';
import type { CampaignPort, GameContent } from '../../modules/contracts';
import { stationModels } from './cityMap';
import { createDraft, increase, selectOrigin, toCharacterInput } from './creationModel';
import { CALL_MINUTES, callCompanion, giveGiftAndLearn, installCyberware, knownGiftTastes, sellPrice, sendHome } from './portExtras';

function campaignWith(content: GameContent = fixtureContent()): CampaignPort {
  const campaign = createCampaign(content, { storage: null, seed: 7, random: () => 0.25 });
  let draft = { ...createDraft(content), name: 'Testfigur' };
  draft = increase(increase(increase(increase(draft, 'technik'), 'technik'), 'reflexe'), 'koerper');
  const created = campaign.createCharacter(toCharacterInput(draft));
  expect(created.ok, created.message).toBe(true);
  return campaign;
}

describe('Charaktererstellung über den Port', () => {
  it('ein vollständiger Entwurf wird von der Kampagne angenommen', () => {
    const content = fixtureContent();
    const campaign = campaignWith(content);
    const player = campaign.state().player;
    expect(player.name).toBe('Testfigur');
    expect(player.attributes.technik).toBe(5);
    expect(player.attributes.strasse).toBe(4); // Herkunftsbonus Gossenkind
  });

  it('ein Entwurf mit Herkunftswechsel behält Name und Punkte', () => {
    const content = fixtureContent();
    const draft = selectOrigin(increase({ ...createDraft(content), name: 'Kim' }, 'technik'), 'knast', content);
    expect(draft).toMatchObject({ name: 'Kim', origin: 'knast' });
    expect(draft.attributes.technik).toBe(4);
  });
});

describe('Geschenkwissen', () => {
  it('ein gegebenes Geschenk wird als entdecktes Wissen gemerkt', () => {
    const campaign = campaignWith();
    campaign.apply([{ give: 'messer' }]);
    expect(knownGiftTastes(campaign, 'raven')).toEqual([]);
    const result = giveGiftAndLearn(campaign, 'raven', 'messer');
    expect(result.ok, result.message).toBe(true);
    expect(knownGiftTastes(campaign, 'raven')).toEqual([{ item: 'messer', taste: 'loves' }]);
    expect(knownGiftTastes(campaign, 'dante')).toEqual([]);
  });

  it('ein abgelehntes Geschenk lehrt nichts', () => {
    const campaign = campaignWith();
    const result = giveGiftAndLearn(campaign, 'raven', 'handschellen'); // nicht im Inventar
    expect(result.ok).toBe(false);
    expect(knownGiftTastes(campaign, 'raven')).toEqual([]);
  });
});

describe('Crew per Telefon', () => {
  it('ruft einen Begleiter in die Party und lässt die Anfahrt verstreichen', () => {
    const campaign = campaignWith();
    campaign.warpAct(2);
    const before = campaign.state().clock;
    const result = callCompanion(campaign, 'dante');
    expect(result.ok, result.message).toBe(true);
    expect(campaign.state().party).toEqual(['raven', 'dante']);
    const after = campaign.state().clock;
    expect((after.day - before.day) * 1440 + after.minutes - before.minutes).toBe(CALL_MINUTES);
    expect(callCompanion(campaign, 'dante').ok).toBe(false);
    expect(sendHome(campaign, 'raven').ok).toBe(true);
    expect(campaign.state().party).toEqual(['dante']);
  });

  it('nicht rekrutierte Figuren lassen sich nicht rufen', () => {
    const campaign = campaignWith();
    const result = callCompanion(campaign, 'ripper');
    expect(result.ok).toBe(false);
    expect(campaign.state().party).toEqual([]);
  });
});

describe('Handel und Schrauber', () => {
  it('Ankaufspreis über die reine Preisregel', () => {
    const campaign = campaignWith();
    const price = sellPrice(campaign, 'kiosk', 'messer');
    expect(price).toBeGreaterThan(0);
    expect(sellPrice(campaign, 'kiosk', 'chip')).toBeNull(); // Questgegenstand
    expect(sellPrice(campaign, 'unbekannt', 'messer')).toBeNull();
  });

  it('baut Cyberware aus dem Inventar beim Schrauber ein', () => {
    const content = fixtureContent();
    content.shops.doc = { id: 'doc', name: 'Doc', stock: [], ripperdoc: {} };
    const campaign = campaignWith(content);
    expect(installCyberware(campaign, 'doc', 'optik').ok).toBe(false); // Teil fehlt
    campaign.apply([{ give: 'optik-teil' }]);
    const result = installCyberware(campaign, 'doc', 'optik');
    expect(result.ok, result.message).toBe(true);
    expect(campaign.state().player.cyberware.augen).toBe('optik');
    expect(installCyberware(campaign, 'kiosk', 'optik').ok).toBe(false); // kein Schrauber
  });
});

describe('Stadtkarte', () => {
  it('markiert Standort, Freischaltung und Zielmarker', () => {
    const campaign = campaignWith();
    campaign.apply([{ setFlag: 'angekommen' }]);
    const models = stationModels(campaign);
    const gasse = models.find((model) => model.station.id === 'linie-gasse');
    const bar = models.find((model) => model.station.id === 'linie-bar');
    expect(gasse?.here).toBe(true);
    expect(bar?.here).toBe(false);
    expect(bar?.objective).toBe(true);
    expect(gasse?.objective).toBe(false);
    expect(bar?.unlocked).toBe(campaign.state().stations.includes('linie-bar'));
  });
});
