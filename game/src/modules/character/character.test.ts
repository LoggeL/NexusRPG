import { describe, expect, it } from 'vitest';
import { fixtureContent } from '../__fixtures__/content';
import { DEFAULT_APPEARANCE } from '../appearance';
import type { GameContent, PlayerState } from '../contracts';
import {
  ATTR_FREE_POINTS, attributeParts, characterModifiers, creationPointsLeft, cyberwareBonusText, cyberwareItem, cyberwareSlots,
  derivedStats, effectiveAttribute, effectiveAttributes, finalCreationAttributes, findCharacterProblems, hasTrait, installFee,
  learnPerkProblem, levelForXp, levelGains, levelProgress, maxHpFormula, originBonusOf, originBonusOptions, perkOverview,
  perkStatus, planInstall, planUninstall, playerCombatProfile, pointsUpToLevel, spendAttributeProblem, startAttributes,
  trainedValue, unlockedAbilities, validateCreation, xpForLevel, type CharacterCreationInput, type CharacterCyberwareDef,
  type CharacterItemDef, type CharacterOriginDef, type CharacterPerkDef, type CharacterShopDef,
} from './index';

function player(patch: Partial<PlayerState> = {}): PlayerState {
  return {
    created: true, name: 'Testfigur', look: 'a', appearance: DEFAULT_APPEARANCE, origin: 'gosse', level: 1, xp: 0,
    attributes: { technik: 5, koerper: 4, reflexe: 4, ausstrahlung: 3, strasse: 4 },
    unspentAttr: 0, perkPoints: 0, perks: [], cyberware: {}, equipment: {}, hp: 38,
    ...patch,
  };
}

/** Fixture mit Erweiterungsfeldern des Bereichs character. */
function content(): GameContent {
  const c = fixtureContent();
  const perks = c.perks as Record<string, CharacterPerkDef>;
  perks.bastler = { ...perks.bastler, level: 1, ability: 'klingenwirbel', traits: ['werkbank'] };
  perks.spaet = {
    id: 'spaet', name: 'Spätzünder', description: 'Erst ab Stufe 5.', attribute: 'technik', min: 4, level: 5,
    combat: { bandwidth: 2, firewall: 1 }, talkBonus: 10,
  };
  perks.teuer = { id: 'teuer', name: 'Teuer', description: 'Kostet 2.', attribute: 'koerper', min: 3, cost: 2, combat: { hp: 5, move: 1 } };
  const cyber = c.cyberware as Record<string, CharacterCyberwareDef>;
  cyber.optik = { ...cyber.optik, shopDiscount: 5, combat: { hit: 5, initiative: 2 }, traits: ['restlicht'] };
  cyber.splitter = { id: 'splitter', name: 'Splitter', slot: 'kopf', description: 'Einzelstück.', attributes: { technik: 1 } };
  const items = c.items as Record<string, CharacterItemDef>;
  items.jacke = { ...items.jacke, wear: { attributes: { koerper: 1 }, combat: { armor: 2 }, giftBonus: 10 } };
  items['booster-teil'] = { id: 'booster-teil', name: 'Booster', description: 'Ding.', category: 'cyberware', icon: 'booster', price: 900, cyberware: 'reflexbooster' };
  (c.origins as Record<string, CharacterOriginDef>).knast.bonusChoice = ['strasse'];
  return c;
}

describe('Stufen und XP', () => {
  it('folgt der Tabelle aus world.md §2.7', () => {
    const table: [number, number][] = [[1, 0], [2, 100], [3, 300], [4, 600], [5, 1000], [6, 1500], [7, 2100], [8, 2800],
      [9, 3600], [10, 4500], [11, 5500], [12, 6600], [13, 7800], [14, 9100], [15, 10500], [16, 12000], [17, 13600],
      [18, 15300], [19, 17100], [20, 19000]];
    for (const [level, xp] of table) {
      expect(xpForLevel(level)).toBe(xp);
      expect(levelForXp(xp)).toBe(level);
      if (xp > 0) expect(levelForXp(xp - 1)).toBe(level - 1);
    }
  });

  it('begrenzt auf Stufe 1..20 und verträgt kaputte Werte', () => {
    expect(xpForLevel(0)).toBe(0);
    expect(xpForLevel(99)).toBe(19000);
    expect(xpForLevel(Number.NaN)).toBe(0);
    expect(levelForXp(-5)).toBe(1);
    expect(levelForXp(Number.POSITIVE_INFINITY)).toBe(1);
    expect(levelForXp(1e9)).toBe(20);
  });

  it('liefert den Fortschritt zur nächsten Stufe', () => {
    expect(levelProgress(150)).toEqual({ level: 2, xp: 150, floor: 100, next: 300, into: 50, needed: 150, ratio: 0.25 });
    const max = levelProgress(25000);
    expect(max).toMatchObject({ level: 20, next: null, needed: 0, ratio: 1 });
  });

  it('gibt je Stufe einen Attribut- und einen Perkpunkt', () => {
    expect(levelGains(1, 4)).toEqual({ levels: 3, attributePoints: 3, perkPoints: 3 });
    expect(levelGains(5, 3)).toEqual({ levels: 0, attributePoints: 0, perkPoints: 0 });
    expect(pointsUpToLevel(1)).toEqual({ attributePoints: 0, perkPoints: 0 });
    expect(pointsUpToLevel(20)).toEqual({ attributePoints: 19, perkPoints: 19 });
  });

  it('berechnet das LP-Maximum als 20 + 4 × Körper + 2 × Stufe', () => {
    expect(maxHpFormula(4, 1)).toBe(38);
    expect(maxHpFormula(10, 20, 5)).toBe(105);
    expect(maxHpFormula(-20, 1)).toBe(1);
  });
});

describe('Charaktererstellung', () => {
  const input = (patch: Partial<CharacterCreationInput> = {}): CharacterCreationInput => ({
    name: 'Testfigur', look: 'a', origin: 'gosse', attributes: { technik: 5, koerper: 4, reflexe: 4, ausstrahlung: 3, strasse: 3 }, ...patch,
  });

  it('verlangt genau 4 freie Punkte auf Startwerten 3..10', () => {
    const c = content();
    expect(validateCreation(c, input())).toBeNull();
    expect(creationPointsLeft(startAttributes())).toBe(ATTR_FREE_POINTS);
    expect(validateCreation(c, input({ attributes: { technik: 4, koerper: 4, reflexe: 4, ausstrahlung: 3, strasse: 3 } }))).toContain('genau 4');
    expect(validateCreation(c, input({ attributes: { technik: 2, koerper: 5, reflexe: 5, ausstrahlung: 5, strasse: 3 } }))).toContain('zwischen 3 und 10');
    expect(validateCreation(c, input({ attributes: { technik: 3.5, koerper: 5, reflexe: 4, ausstrahlung: 3, strasse: 3 } }))).toContain('Technik');
    const extra = { ...input().attributes, glueck: 0 } as unknown as CharacterCreationInput['attributes'];
    expect(validateCreation(c, input({ attributes: extra }))).toBe('Unbekanntes Attribut.');
  });

  it('prüft Name, Aussehen und Herkunft', () => {
    const c = content();
    expect(validateCreation(c, input({ name: ' K ' }))).toContain('2 bis 16');
    expect(validateCreation(c, input({ name: 'A'.repeat(17) }))).toContain('2 bis 16');
    expect(validateCreation(c, input({ name: '<b>Neo</b>' }))).toContain('ungültige Zeichen');
    expect(validateCreation(c, input({ name: '  Ölzweig  ' }))).toBeNull();
    expect(validateCreation(c, input({ look: 'x' }))).toContain('Aussehen');
    expect(validateCreation(c, input({ origin: 'mond' }))).toContain('Herkunft');
    expect(validateCreation(c, null as unknown as CharacterCreationInput)).toBe('Ungültige Eingabe.');
  });

  it('wendet den Herkunftsbonus an, mit Wahl und Kappung bei 10', () => {
    const c = content();
    expect(originBonusOptions(c, 'knast')).toEqual(['koerper', 'strasse']);
    expect(originBonusOptions(c, 'gosse')).toEqual(['strasse']);
    expect(originBonusOptions(c, 'mond')).toEqual([]);
    expect(originBonusOf(c, { origin: 'knast' })).toBe('koerper');
    expect(originBonusOf(c, { origin: 'knast', originBonus: 'strasse' })).toBe('strasse');
    expect(validateCreation(c, input({ origin: 'knast', originBonus: 'technik' }))).toContain('Bonusattribut');
    expect(finalCreationAttributes(c, input({ origin: 'knast', originBonus: 'strasse' })).strasse).toBe(4);
    expect(finalCreationAttributes(c, input({ origin: 'knast' })).koerper).toBe(5);
    const capped = input({ attributes: { technik: 3, koerper: 3, reflexe: 3, ausstrahlung: 3, strasse: 7 } });
    capped.attributes.strasse = 10;
    expect(finalCreationAttributes(c, capped).strasse).toBe(10);
  });

  it('verteilt freie Punkte nur mit Punkt und unter 10', () => {
    expect(spendAttributeProblem(player(), 'technik')).toBe('Keine freien Attributpunkte.');
    expect(spendAttributeProblem(player({ unspentAttr: 1 }), 'technik')).toBeNull();
    expect(spendAttributeProblem(player({ unspentAttr: 1, attributes: { ...player().attributes, technik: 10 } }), 'technik')).toContain('bereits auf 10');
    expect(spendAttributeProblem(player({ unspentAttr: 1 }), 'glueck' as never)).toBe('Unbekanntes Attribut.');
    expect(trainedValue(9, 5)).toBe(10);
    expect(trainedValue(2, -5)).toBe(1);
  });
});

describe('Effektive Attribute', () => {
  it('zählt Cyberware und getragene Kleidung, aber keine Waffen', () => {
    const c = content();
    const p = player({ cyberware: { augen: 'optik' }, equipment: { kleidung: 'jacke', nahkampf: 'messer' } });
    expect(attributeParts(c, p, 'reflexe')).toEqual([
      { label: 'Reflexe', value: 4, source: 'attribut' },
      { label: 'Optik-Implantat', value: 1, source: 'cyberware' },
    ]);
    expect(effectiveAttribute(c, p, 'koerper')).toBe(5);
    expect(effectiveAttributes(c, p)).toEqual({ technik: 5, koerper: 5, reflexe: 5, ausstrahlung: 3, strasse: 4 });
  });

  it('überspringt unbekannte Cyberware und Gegenstände', () => {
    const c = content();
    const p = player({ cyberware: { kopf: 'weg' }, equipment: { kleidung: 'weg' } });
    expect(effectiveAttribute(c, p, 'technik')).toBe(5);
  });
});

describe('Perks', () => {
  it('verlangt Attributwert, Mindeststufe und Perkpunkte', () => {
    const c = content();
    expect(perkStatus(c, player(), 'bastler')).toMatchObject({ available: false, qualified: true, reason: 'Nicht genug Perkpunkte.' });
    expect(perkStatus(c, player({ perkPoints: 1 }), 'bastler')).toMatchObject({ available: true, reason: null, requirement: 'Technik 4' });
    const late = perkStatus(c, player({ perkPoints: 1, level: 4, xp: 600 }), 'spaet');
    expect(late).toMatchObject({ available: false, qualified: false, reason: 'Benötigt Stufe 5.', requirement: 'Technik 4 · Stufe 5' });
    expect(late?.missing).toEqual({ attribute: 0, level: 1, points: 0 });
    expect(perkStatus(c, player({ perkPoints: 3 }), 'charmant')).toMatchObject({ reason: 'Benötigt Ausstrahlung 6.', missing: { attribute: 3, level: 0, points: 0 } });
    expect(perkStatus(c, player({ perkPoints: 1 }), 'teuer')?.reason).toBe('Nicht genug Perkpunkte.');
    expect(perkStatus(c, player(), 'nichts')).toBeNull();
  });

  it('zählt effektive Attribute (Cyberware) für die Voraussetzung', () => {
    const c = content();
    const p = player({ perkPoints: 1, attributes: { ...player().attributes, technik: 3 } });
    expect(learnPerkProblem(c, p, 'bastler')).toContain('Technik 4');
    expect(learnPerkProblem(c, { ...p, cyberware: { kopf: 'splitter' } }, 'bastler')).toBeNull();
  });

  it('lässt freie Perks (Belohnung) ohne Voraussetzung zu, aber nie doppelt', () => {
    const c = content();
    expect(learnPerkProblem(c, player(), 'charmant', true)).toBeNull();
    expect(learnPerkProblem(c, player({ perks: ['charmant'] }), 'charmant', true)).toContain('bereits gelernt');
    expect(learnPerkProblem(c, player(), 'nichts', true)).toBe('Unbekannter Perk.');
  });

  it('sortiert die Übersicht nach Attribut und Mindestwert', () => {
    const ids = perkOverview(content(), player()).map(status => status.perk.id);
    expect(ids).toEqual(['bastler', 'spaet', 'teuer', 'charmant']);
  });
});

describe('Passive Wirkungen', () => {
  it('sammelt Rabatt, Geschenk- und Gesprächsbonus, Kampfboni und Merkmale', () => {
    const c = content();
    const p = player({ perks: ['bastler', 'charmant', 'spaet', 'teuer'], cyberware: { augen: 'optik' }, equipment: { kleidung: 'jacke' } });
    const mods = characterModifiers(c, p);
    expect(mods).toMatchObject({ shopDiscount: 15, giftBonus: 60, talkBonus: 10, sellBonus: 0 });
    expect(mods.combat).toEqual({ hit: 5, damage: 0, armor: 2, hp: 5, move: 1, initiative: 2, bandwidth: 2, firewall: 1 });
    expect(mods.traits.sort()).toEqual(['restlicht', 'werkbank']);
    expect(mods.breakdown).toContainEqual({ key: 'shopDiscount', label: 'Optik-Implantat', value: 5 });
    expect(hasTrait(c, p, 'restlicht')).toBe(true);
    expect(hasTrait(c, player(), 'restlicht')).toBe(false);
  });

  it('schaltet Kampffähigkeiten aus Perks, Cyberware und Waffen frei (ohne Doppelte)', () => {
    const c = content();
    c.items.messer.weapon = { kind: 'nahkampf', damage: 5, range: 1, ability: 'klingenwirbel' };
    c.abilities.zielen = { id: 'zielen', name: 'Zielen', description: '+20', kind: 'fernkampf', ap: 1, target: 'self', range: 0 };
    c.cyberware.optik.ability = 'zielen';
    c.cyberware.reflexbooster.ability = 'gibt-es-nicht';
    const p = player({ perks: ['bastler'], cyberware: { augen: 'optik' }, equipment: { nahkampf: 'messer' } });
    expect(unlockedAbilities(c, p)).toEqual([
      { ability: 'klingenwirbel', source: 'perk', from: 'bastler', label: 'Bastler' },
      { ability: 'zielen', source: 'cyberware', from: 'optik', label: 'Optik-Implantat' },
    ]);
    expect(unlockedAbilities(c, player({ equipment: { nahkampf: 'messer' } }))[0]).toMatchObject({ source: 'waffe', from: 'messer' });
  });
});

describe('Cyberware', () => {
  it('zeigt alle sechs Plätze', () => {
    const slots = cyberwareSlots(content(), player({ cyberware: { augen: 'optik' } }));
    expect(slots.map(s => s.slot)).toEqual(['kopf', 'augen', 'arme', 'beine', 'nervensystem', 'haut']);
    expect(slots[1].part?.id).toBe('optik');
    expect(slots[0]).toMatchObject({ label: 'Kopf', part: null });
  });

  it('findet den Gegenstand eines Teils auch über ItemDef.cyberware', () => {
    const c = content();
    expect(cyberwareItem(c, 'optik')).toBe('optik-teil');
    expect(cyberwareItem(c, 'reflexbooster')).toBe('booster-teil');
    expect(cyberwareItem(c, 'splitter')).toBeNull();
  });

  it('plant den Einbau: verbraucht den Gegenstand und gibt das alte Teil zurück', () => {
    const c = content();
    const p = player({ cyberware: { augen: 'optik' } });
    const plan = planInstall(c, p, 'reflexbooster', { inventory: { 'booster-teil': 1 } });
    expect(plan).toMatchObject({ ok: true, slot: 'augen', replaces: 'optik', consume: 'booster-teil', returns: 'optik-teil', fee: 0 });
    expect(planInstall(c, p, 'optik', { inventory: {} })).toMatchObject({ ok: false, reason: 'Optik-Implantat ist bereits eingebaut.' });
    expect(planInstall(c, p, 'weg', { inventory: {} })).toMatchObject({ ok: false });
    expect(planInstall(c, player(), 'optik', { inventory: {} })).toMatchObject({ ok: true, consume: null, returns: null });
  });

  it('verlangt beim Schrauber den Gegenstand und berechnet die Gebühr', () => {
    const c = content();
    const shop: CharacterShopDef = { id: 'werkstatt', name: 'Werkstatt', stock: [], ripperdoc: { fee: 50 } };
    const kiosk = c.shops.kiosk;
    expect(planInstall(c, player(), 'optik', { inventory: {}, requireItem: true, shop })).toMatchObject({ ok: false, reason: 'Optik-Implantat ist nicht im Inventar.' });
    expect(planInstall(c, player(), 'optik', { inventory: { 'optik-teil': 1 }, requireItem: true, shop })).toMatchObject({ ok: true, fee: 50 });
    expect(planInstall(c, player(), 'optik', { inventory: { 'optik-teil': 1 }, requireItem: true, shop, freeInstall: true })).toMatchObject({ ok: true, fee: 0 });
    expect(planInstall(c, player(), 'optik', { inventory: { 'optik-teil': 1 }, shop: kiosk })).toMatchObject({ ok: false, reason: 'Kiosk baut keine Cyberware ein.' });
    c.cyberware.optik.installFee = 120;
    expect(installFee(c, 'optik', shop)).toBe(120);
    expect(installFee(c, 'optik')).toBe(0);
    expect(installFee(c, 'reflexbooster', { ...shop, ripperdoc: {} })).toBe(0);
  });

  it('plant den Ausbau und schützt Einzelstücke ohne Gegenstand', () => {
    const c = content();
    expect(planUninstall(c, player({ cyberware: { augen: 'optik' } }), 'augen')).toMatchObject({ ok: true, returns: 'optik-teil' });
    expect(planUninstall(c, player(), 'augen')).toMatchObject({ ok: false, reason: 'Auf dem Platz Augen ist nichts eingebaut.' });
    expect(planUninstall(c, player({ cyberware: { kopf: 'splitter' } }), 'kopf')).toMatchObject({ ok: false, reason: 'Splitter lässt sich nicht ausbauen.' });
    expect(planUninstall(c, player(), 'bauch' as never)).toMatchObject({ ok: false });
  });

  it('beschreibt Attributboni', () => {
    expect(cyberwareBonusText({ id: 'x', name: 'X', slot: 'kopf', description: '', attributes: { technik: 1, reflexe: -1 } }, { technik: 'Technik', reflexe: 'Reflexe' }))
      .toBe('+1 Technik, −1 Reflexe');
  });
});

describe('Abgeleitete Werte', () => {
  it('rechnet Bewegung, Initiative, Bandbreite und Firewall nach world.md §2.4', () => {
    const c = content();
    const p = player({ attributes: { technik: 7, koerper: 4, reflexe: 6, ausstrahlung: 3, strasse: 4 } });
    expect(derivedStats(c, p)).toEqual({ maxHp: 38, move: 5, initiative: 12, bandwidth: 9, firewall: 5, armor: 0, hit: 0, damage: 0 });
    const boosted = { ...p, perks: ['spaet', 'teuer'], cyberware: { augen: 'optik' as const } };
    expect(derivedStats(c, boosted)).toEqual({ maxHp: 43, move: 6, initiative: 16, bandwidth: 11, firewall: 6, armor: 0, hit: 5, damage: 0 });
  });

  it('baut ein Kampfprofil mit Waffe (sonst Fäuste)', () => {
    const c = content();
    expect(playerCombatProfile(c, player()).weapon).toMatchObject({ kind: 'nahkampf', damage: 2 });
    const armed = playerCombatProfile(c, player({ equipment: { nahkampf: 'messer' } }));
    expect(armed.weapon.damage).toBe(5);
    expect(armed.weapons).toEqual([{ slot: 'nahkampf', item: 'messer', stats: c.items.messer.weapon }]);
    expect(armed.stats.maxHp).toBe(38);
  });
});

describe('Inhaltsprüfung (character)', () => {
  it('ist für das Fixture sauber', () => {
    expect(findCharacterProblems(content()).problems).toEqual([]);
  });

  it('meldet kaputte Erweiterungsfelder und liefert Bedingungen mit Fundort', () => {
    const c = content();
    const perks = c.perks as Record<string, CharacterPerkDef>;
    perks.bastler.level = 25;
    perks.bastler.checkBonus = [
      { tags: ['hacken'], value: 0 },
      { attribute: 'glueck' as never, value: 1, districts: ['mond'], when: { flag: 'x' } },
    ];
    perks.bastler.autoPass = [{ maxThreshold: 12 }];
    perks.bastler.substitute = [{ use: 'technik', for: 'technik' }];
    perks.charmant.min = 11;
    (c.cyberware as Record<string, CharacterCyberwareDef>).optik.attributes = { glueck: 1 } as never;
    c.items['optik-teil'].cyberware = 'reflexbooster';
    (c.origins as Record<string, CharacterOriginDef>).gosse.bonusChoice = ['mut' as never];
    (c.shops as Record<string, CharacterShopDef>).kiosk.ripperdoc = { fee: -5 };
    (c.checks.chip as { faction?: string }).faction = 'niemand';
    const { problems, conditions } = findCharacterProblems(c);
    const text = problems.join('\n');
    expect(text).toContain('Mindeststufe 25');
    expect(text).toContain('ganze Zahl ≠ 0');
    expect(text).toContain('unbekanntes Attribut „glueck“');
    expect(text).toContain('unbekannte Bezirk „mond“');
    expect(text).toContain('nicht in 3–10');
    expect(text).toContain('gilt für jeden Check');
    expect(text).toContain('Ersatzattribut entspricht');
    expect(text).toContain('Mindestwert 11');
    expect(text).toContain('verweist auf andere Cyberware');
    expect(text).toContain('Bonusattribut „mut“');
    expect(text).toContain('Händler kiosk: ungültige Einbaugebühr');
    expect(text).toContain('Check chip: unbekannte Fraktion');
    expect(conditions).toEqual([{ where: 'Perk bastler Check-Bonus 2', condition: { flag: 'x' } }]);
  });
});
