// Integration: Vertragswünsche, die in contracts.ts übernommen wurden, und die erweiterten Port-Methoden.
import { describe, expect, it } from 'vitest';
import { fixtureContent } from '../__fixtures__/content';
import type { CharacterInput, GameContent } from '../contracts';
import { createCampaign } from './index';

const input: CharacterInput = {
  name: 'Testfigur', look: 'a', origin: 'gosse',
  attributes: { technik: 5, koerper: 4, reflexe: 4, ausstrahlung: 3, strasse: 3 },
};

function started(content: GameContent = fixtureContent()) {
  const campaign = createCampaign(content, { storage: null, seed: 7, random: () => 0.25 });
  expect(campaign.createCharacter(input).ok).toBe(true);
  return campaign;
}

describe('Vorübergehende Check-Boni', () => {
  it('zählen bei passenden Checks, werden beim Bestehen verbraucht und gespeichert', () => {
    const campaign = started();
    expect(campaign.evaluateCheck('chip').ok).toBe(false); // Technik 5 < 6
    campaign.apply([{ checkBuff: { id: 'nougat', label: 'Nougatbombe', value: 1, attribute: 'technik' } }]);
    const evaluation = campaign.evaluateCheck('chip');
    expect(evaluation.ok).toBe(true);
    expect(evaluation.parts.some(part => part.source === 'voruebergehend')).toBe(true);

    const copy = createCampaign(fixtureContent(), { storage: null });
    expect(copy.importSave(campaign.exportSave())).toBe(true);
    expect(copy.state().player.checkBuffs?.map(buff => buff.id)).toEqual(['nougat']);

    campaign.passCheck('chip');
    expect(campaign.state().player.checkBuffs).toBeUndefined();
    expect(campaign.evaluateCheck('chip').value).toBe(5);
  });

  it('lehnt kaputte Boni transaktional ab', () => {
    const campaign = started();
    const before = campaign.state();
    campaign.apply([{ give: 'kaffee' }, { checkBuff: { id: '', label: 'x', value: 1 } }]);
    expect(campaign.state()).toBe(before);
  });
});

describe('Neue Effekte und Bedingungen', () => {
  it('Versöhnung beendet die Rivalität', () => {
    const campaign = started();
    campaign.apply([{ relation: 'dante', delta: -400 }]);
    expect(campaign.rivalry('dante')).toBeGreaterThan(0);
    campaign.apply([{ reconcile: 'dante' }]);
    expect(campaign.rivalry('dante')).toBe(0);
    expect(campaign.state().relations.dante.points).toBe(0);
  });

  it('Ausbau per Effekt und Ablegen per Port', () => {
    const campaign = started();
    campaign.apply([{ give: 'optik-teil' }, { installCyberware: 'optik' }]);
    expect(campaign.state().player.cyberware.augen).toBe('optik');
    campaign.apply([{ removeCyberware: 'augen' }]);
    expect(campaign.state().player.cyberware.augen).toBeUndefined();
    expect(campaign.state().inventory['optik-teil']).toBe(1);

    campaign.apply([{ give: 'jacke' }]);
    expect(campaign.equip('jacke').ok).toBe(true);
    const hpWithJacket = campaign.maxHp();
    expect(campaign.unequip('kleidung').ok).toBe(true);
    expect(campaign.state().player.equipment.kleidung).toBeUndefined();
    expect(campaign.maxHp()).toBeLessThan(hpWithJacket);
    expect(campaign.unequip('kleidung').ok).toBe(false);
  });

  it('Rufstufe und Festkalender als Bedingung', () => {
    const campaign = started();
    expect(campaign.evaluate({ repTier: 'unterstadt', min: 'neutral' })).toBe(true);
    expect(campaign.evaluate({ repTier: 'unterstadt', min: 'respektiert' })).toBe(false);
    campaign.apply([{ rep: 'unterstadt', delta: 60 }]);
    expect(campaign.evaluate({ repTier: 'unterstadt', min: 'respektiert' })).toBe(true);
    expect(campaign.evaluate({ cycleDay: 1 })).toBe(true);
    expect(campaign.evaluate({ cycleDay: [2, 3] })).toBe(false);
  });

  it('failJob lässt einen Auftrag scheitern und nimmt das Paket zurück', () => {
    const campaign = started();
    const offer = campaign.jobOffers('tafel').find(entry => entry.template === 'kurier');
    expect(offer).toBeDefined();
    expect(campaign.acceptJob(offer!.id).ok).toBe(true);
    expect(campaign.state().inventory.chip).toBe(1);
    const outcome = campaign.apply([{ failJob: 'kurier' }]);
    expect(outcome.messages.some(message => message.startsWith('Auftrag gescheitert'))).toBe(true);
    expect(campaign.state().jobs.active).toEqual([]);
    expect(campaign.state().inventory.chip ?? 0).toBe(0);
  });

  it('ein Sieg schließt Kopfgeld-Aufträge der Begegnung ab', () => {
    const content = fixtureContent();
    content.jobs.kopfgeld = { ...content.jobs.kopfgeld, encounter: 'schlaeger' };
    const campaign = started(content);
    const offer = campaign.jobOffers('tafel').find(entry => entry.template === 'kopfgeld');
    expect(offer).toBeDefined();
    campaign.acceptJob(offer!.id);
    const credits = campaign.state().credits;
    const outcome = campaign.finishBattle({ encounter: 'schlaeger', outcome: 'win', playerHp: 10 });
    expect(outcome.messages.some(message => message.startsWith('Auftrag erledigt'))).toBe(true);
    expect(campaign.state().jobs.active).toEqual([]);
    expect(campaign.state().credits).toBeGreaterThan(credits + 30);
  });
});

describe('Port-Methoden der Oberfläche', () => {
  it('Begleiter rufen kostet die Anfahrt der Figur', () => {
    const content = fixtureContent();
    content.npcs.raven = { ...content.npcs.raven, companion: { ...content.npcs.raven.companion!, callMinutes: 15 } };
    const campaign = started(content);
    campaign.apply([{ recruit: 'raven' }]);
    campaign.setParty([]);
    const before = campaign.state().clock.minutes;
    const result = campaign.callCompanion('raven');
    expect(result.ok, result.message).toBe(true);
    expect(campaign.state().party).toEqual(['raven']);
    expect(campaign.state().clock.minutes - before).toBe(15);
    expect(campaign.callCompanion('raven').ok).toBe(false);
    expect(campaign.callCompanion('daria').ok).toBe(false);
  });

  it('merkt sich Geschenkwissen und liefert die Ansichten', () => {
    const campaign = started();
    expect(campaign.knownGiftTastes('raven')).toEqual([]);
    expect(campaign.giveGift('raven', 'kaffee').ok).toBe(true);
    expect(campaign.knownGiftTastes('raven')).toEqual([{ item: 'kaffee', taste: 'likes' }]);

    expect(campaign.relation('raven').npc).toBe('raven');
    expect(campaign.whereIs('raven').kind).toBe('map');
    expect(campaign.shopView('kiosk')?.shop).toBe('kiosk');
    expect(campaign.shopView('gibt-es-nicht')).toBeNull();
    expect(campaign.sellPrice('kiosk', 'kaffee')).toBeGreaterThan(0);
    expect(campaign.jobBoard('tafel').offers.length).toBeGreaterThan(0);
    expect(campaign.factionStandings().map(entry => entry.faction).sort()).toEqual(['crew', 'unterstadt']);
    expect(campaign.newsBulletin()).toHaveProperty('main');
    expect(Array.isArray(campaign.questMarkers())).toBe(true);
    const sheet = campaign.characterSheet();
    expect(sheet.progress.level).toBe(1);
    expect(sheet.cyberware).toHaveLength(6);
    expect(campaign.perkStatus('bastler')?.available).toBe(false); // Technik 5 reicht, aber kein Perkpunkt
    expect(campaign.perkStatus('gibt-es-nicht')).toBeNull();
  });
});
