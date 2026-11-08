// Spielfigur über die Kampagnen-Fassade: Perks mit Mindeststufe, Herkunftswahl, LP-Abgleich, Schrauber, Speicher.
import { describe, expect, it } from 'vitest';
import { fixtureContent } from '../../__fixtures__/content';
import type { CharacterCreationInput, CharacterCyberwareDef, CharacterOriginDef, CharacterPerkDef, CharacterShopDef } from '../../character';
import type { CheckDef, GameContent } from '../../contracts';
import { createCampaign, findContentProblems } from '../index';

const input = (patch: Partial<CharacterCreationInput> = {}): CharacterCreationInput => ({
  name: 'Testfigur', look: 'a', origin: 'gosse', attributes: { technik: 5, koerper: 4, reflexe: 4, ausstrahlung: 3, strasse: 3 }, ...patch,
});

function content(): GameContent {
  const c = fixtureContent();
  const perks = c.perks as Record<string, CharacterPerkDef>;
  perks.spaet = { id: 'spaet', name: 'Spätzünder', description: 'Ab Stufe 3.', attribute: 'technik', min: 4, level: 3 };
  perks.zaeh = { id: 'zaeh', name: 'Zäh', description: '+5 LP.', attribute: 'koerper', min: 3, cost: 2, combat: { hp: 5 } };
  (c.origins as Record<string, CharacterOriginDef>).knast.bonusChoice = ['strasse'];
  const shops = c.shops as Record<string, CharacterShopDef>;
  shops.werkstatt = {
    id: 'werkstatt', name: 'Dantes Werkstatt', owner: 'dante', open: { time: ['morgen', 'tag'] }, stock: [],
    ripperdoc: { fee: 50, freeWhen: { hearts: 'dante', min: 2 } },
  };
  (c.cyberware as Record<string, CharacterCyberwareDef>).splitter = { id: 'splitter', name: 'Splitter', slot: 'augen', description: 'Einzelstück.', attributes: { technik: 1 } };
  c.items['booster-teil'] = { id: 'booster-teil', name: 'Booster', description: 'Ding.', category: 'cyberware', icon: 'booster', price: 900, cyberware: 'reflexbooster' };
  c.items.panzerjacke = { id: 'panzerjacke', name: 'Panzerjacke', description: 'Schwer.', category: 'kleidung', icon: 'jacke', price: 300, wear: { attributes: { koerper: 2 } } };
  return c;
}

function started(c = content(), patch: Partial<CharacterCreationInput> = {}) {
  const campaign = createCampaign(c, { storage: null, seed: 5, random: () => 0.5 });
  const created = campaign.createCharacter(input(patch));
  expect(created.ok, created.message).toBe(true);
  return campaign;
}

describe('Perks über die Fassade', () => {
  it('verlangt die Mindeststufe und zieht die Kosten ab', () => {
    const campaign = started();
    campaign.apply([{ xp: 100 }]);
    expect(campaign.learnPerk('spaet')).toMatchObject({ ok: false, message: 'Benötigt Stufe 3.' });
    expect(campaign.learnPerk('zaeh')).toMatchObject({ ok: false, message: 'Nicht genug Perkpunkte.' });
    campaign.apply([{ xp: 200 }]);
    expect(campaign.state().player.perkPoints).toBe(2);
    expect(campaign.learnPerk('spaet').ok).toBe(true);
    campaign.apply([{ xp: 300 }]);
    const hp = campaign.state().player.hp;
    expect(campaign.learnPerk('zaeh').ok).toBe(true);
    expect(campaign.state().player.perkPoints).toBe(0);
    expect(campaign.state().player.hp).toBe(hp + 5);
    expect(campaign.maxHp()).toBe(campaign.state().player.hp);
  });

  it('vergibt Belohnungsperks ohne Voraussetzung', () => {
    const campaign = started();
    expect(campaign.apply([{ grantPerk: 'spaet' }]).messages).toContain('Neuer Perk: Spätzünder');
    expect(campaign.state().player.perkPoints).toBe(0);
  });
});

describe('Herkunft mit Wahl', () => {
  it('nimmt das gewählte Bonusattribut und lehnt fremde ab', () => {
    expect(started(content(), { origin: 'knast', originBonus: 'strasse' }).state().player.attributes).toMatchObject({ strasse: 4, koerper: 4 });
    expect(started(content(), { origin: 'knast' }).state().player.attributes).toMatchObject({ strasse: 3, koerper: 5 });
    const campaign = createCampaign(content(), { storage: null });
    expect(campaign.createCharacter(input({ origin: 'knast', originBonus: 'technik' })).ok).toBe(false);
  });
});

describe('LP bleiben im Rahmen', () => {
  it('gleicht LP bei Training, Kleidung und Stufe ab', () => {
    const campaign = started();
    expect(campaign.state().player.hp).toBe(38);
    campaign.apply([{ trainAttribute: 'koerper', delta: -10 }]);
    expect(campaign.maxHp()).toBe(26);
    expect(campaign.state().player.hp).toBe(26);
    campaign.apply([{ give: 'panzerjacke' }]);
    campaign.equip('panzerjacke');
    expect(campaign.state().player.hp).toBe(34);
    campaign.equip('panzerjacke');
    expect(campaign.state().player.hp).toBe(26);
    const other = createCampaign(content(), { storage: null });
    expect(other.importSave(campaign.exportSave())).toBe(true);
  });

  it('kappt zu hohe LP beim Laden statt den Spielstand abzulehnen', () => {
    const campaign = started();
    const data = JSON.parse(campaign.exportSave());
    data.player.hp = 9000;
    const other = createCampaign(content(), { storage: null });
    expect(other.importSave(JSON.stringify(data))).toBe(true);
    expect(other.state().player.hp).toBe(other.maxHp());
    data.player.hp = 0;
    expect(other.importSave(JSON.stringify(data))).toBe(false);
  });
});

describe('Schrauber', () => {
  it('baut gegen Gebühr ein, verbraucht das Teil und gibt das alte zurück', () => {
    const campaign = started();
    expect(campaign.installCyberwareAt('werkstatt', 'optik')).toMatchObject({ ok: false, message: 'Optik-Implantat ist nicht im Inventar.' });
    campaign.apply([{ give: 'optik-teil' }, { give: 'booster-teil' }]);
    const credits = campaign.state().credits;
    expect(campaign.installCyberwareAt('werkstatt', 'optik').ok).toBe(true);
    expect(campaign.state().credits).toBe(credits - 50);
    expect(campaign.state().inventory['optik-teil'] ?? 0).toBe(0);
    expect(campaign.attribute('reflexe')).toBe(5);
    const result = campaign.installCyberwareAt('werkstatt', 'reflexbooster');
    expect(result.outcome.messages).toContain('Ausgebaut: Optik-Implantat');
    expect(campaign.state().inventory['optik-teil']).toBe(1);
    expect(campaign.state().player.cyberware.augen).toBe('reflexbooster');
  });

  it('baut gratis ein, sobald die Werkstatt-Bedingung gilt', () => {
    const campaign = started();
    campaign.apply([{ give: 'optik-teil' }, { relation: 'dante', delta: 200 }]);
    const credits = campaign.state().credits;
    expect(campaign.installCyberwareAt('werkstatt', 'optik').ok).toBe(true);
    expect(campaign.state().credits).toBe(credits);
  });

  it('lehnt ohne Geld, außerhalb der Öffnungszeit und bei Händlern ohne Werkstatt ab – ohne Änderung', () => {
    const campaign = started();
    campaign.apply([{ give: 'optik-teil' }, { credits: -campaign.state().credits }]);
    const before = campaign.state();
    expect(campaign.installCyberwareAt('werkstatt', 'optik').ok).toBe(false);
    expect(campaign.state()).toBe(before);
    expect(campaign.installCyberwareAt('kiosk', 'optik')).toMatchObject({ ok: false, message: 'Kiosk baut keine Cyberware ein.' });
    expect(campaign.installCyberwareAt('gibtsnicht', 'optik').ok).toBe(false);
    campaign.apply([{ credits: 500 }, { advanceTime: 10 * 60 }]);
    expect(campaign.timeSlot()).toBe('abend');
    expect(campaign.installCyberwareAt('werkstatt', 'optik')).toMatchObject({ ok: false, message: 'Dantes Werkstatt hat gerade geschlossen.' });
  });

  it('baut aus und schützt Einzelstücke', () => {
    const campaign = started();
    campaign.apply([{ installCyberware: 'optik' }]);
    expect(campaign.removeCyberwareAt('kiosk', 'augen').ok).toBe(false);
    const result = campaign.removeCyberwareAt('werkstatt', 'augen');
    expect(result.ok).toBe(true);
    expect(campaign.state().inventory['optik-teil']).toBe(1);
    expect(campaign.attribute('reflexe')).toBe(4);
    expect(campaign.removeCyberwareAt('werkstatt', 'augen').ok).toBe(false);
    campaign.apply([{ installCyberware: 'splitter' }]);
    expect(campaign.removeCyberwareAt('werkstatt', 'augen')).toMatchObject({ ok: false, message: 'Splitter lässt sich nicht ausbauen.' });
  });
});

describe('Checks über die Fassade', () => {
  it('liefert die erweiterte Auswertung und vergibt XP nach der Grundschwelle', () => {
    const c = content();
    (c.checks as Record<string, CheckDef & { faction?: string }>).tresen = { id: 'tresen', attribute: 'technik', threshold: 5, faction: 'crew' };
    const campaign = started(c);
    campaign.apply([{ rep: 'crew', delta: -30 }]);
    const evaluation = campaign.evaluateCheck('tresen') as ReturnType<typeof campaign.evaluateCheck> & { baseThreshold: number };
    expect(evaluation).toMatchObject({ threshold: 7, baseThreshold: 5, ok: false, missing: 2 });
    campaign.apply([{ rep: 'crew', delta: 30 }]);
    expect(campaign.passCheck('tresen').evaluation.ok).toBe(true);
    expect(campaign.state().player.xp).toBe(40);
  });
});

describe('Inhaltsprüfung', () => {
  it('meldet Erweiterungsfelder und prüft deren Bedingungen mit', () => {
    const c = content();
    (c.perks as Record<string, CharacterPerkDef>).spaet.checkBonus = [{ attribute: 'technik', value: 1, when: { hearts: 'niemand', min: 2 } }];
    (c.perks as Record<string, CharacterPerkDef>).zaeh.level = 0;
    const problems = findContentProblems(c).join('\n');
    expect(problems).toContain('Perk spaet Check-Bonus 1: unbekannter Verweis npcs „niemand“');
    expect(problems).toContain('Perk zaeh: Mindeststufe 0');
  });
});
