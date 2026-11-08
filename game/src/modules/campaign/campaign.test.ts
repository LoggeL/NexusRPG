import { describe, expect, it } from 'vitest';
import { fixtureContent, memoryStorage } from '../__fixtures__/content';
import type { CharacterInput, GameContent } from '../contracts';
import { createCampaign, findContentProblems, levelForXp, xpForLevel } from './index';

const baseInput = (patch: Partial<CharacterInput> = {}): CharacterInput => ({
  name: 'Testfigur', look: 'a', origin: 'gosse',
  attributes: { technik: 5, koerper: 4, reflexe: 4, ausstrahlung: 3, strasse: 3 },
  ...patch,
});

function started(content: GameContent = fixtureContent(), input = baseInput()) {
  const campaign = createCampaign(content, { storage: null, seed: 42, random: () => 0.25 });
  const created = campaign.createCharacter(input);
  expect(created.ok, created.message).toBe(true);
  return campaign;
}

describe('Fixture', () => {
  it('ist bis auf den absichtlich fehlenden Punkt gültig', () => {
    expect(findContentProblems(fixtureContent())).toEqual([expect.stringContaining('nirgends')]);
  });
});

describe('Spielfigur', () => {
  it('prüft die Eingabe der Charaktererstellung', () => {
    const campaign = createCampaign(fixtureContent(), { storage: null });
    expect(campaign.createCharacter(baseInput({ name: 'K' })).ok).toBe(false);
    expect(campaign.createCharacter(baseInput({ look: 'x' })).ok).toBe(false);
    expect(campaign.createCharacter(baseInput({ attributes: { technik: 9, koerper: 3, reflexe: 3, ausstrahlung: 3, strasse: 3 } })).ok).toBe(false);
    expect(campaign.state().player.created).toBe(false);
  });

  it('wendet Herkunftsbonus, Startgegenstände, Credits und Ruf an', () => {
    const campaign = started();
    const state = campaign.state();
    expect(state.player.attributes.strasse).toBe(4);
    expect(state.inventory.kaffee).toBe(3); // Start 1 + Herkunft 2
    expect(state.credits).toBe(150);
    expect(state.reputation.unterstadt).toBe(10);
    expect(state.player.hp).toBe(campaign.maxHp());
  });

  it('kappt den Herkunftsbonus bei 10', () => {
    const content = fixtureContent();
    content.origins.gosse.bonus = 'technik';
    const campaign = createCampaign(content, { storage: null });
    campaign.apply([]);
    const input = baseInput({ attributes: { technik: 7, koerper: 3, reflexe: 3, ausstrahlung: 3, strasse: 3 } });
    expect(campaign.createCharacter(input).ok).toBe(true);
    expect(campaign.state().player.attributes.technik).toBe(8);
  });

  it('nutzt kumulative XP-Schwellen und vergibt Punkte je Stufe', () => {
    expect([2, 3, 4].map(xpForLevel)).toEqual([100, 300, 600]);
    expect(levelForXp(299)).toBe(2);
    expect(levelForXp(1e9)).toBe(20);
    const campaign = started();
    const hp = campaign.maxHp();
    const outcome = campaign.apply([{ xp: 350 }]);
    expect(campaign.state().player.level).toBe(3);
    expect(campaign.state().player.unspentAttr).toBe(2);
    expect(campaign.state().player.perkPoints).toBe(2);
    expect(campaign.maxHp()).toBe(hp + 4);
    expect(outcome.requests).toContainEqual({ sfx: 'levelup' });
  });

  it('berechnet LP aus Körper und Stufe', () => {
    const campaign = started();
    expect(campaign.maxHp()).toBe(20 + 4 * 4 + 2 * 1);
    expect(campaign.spendAttribute('koerper').ok).toBe(false); // keine Punkte
    campaign.apply([{ xp: 100 }]);
    expect(campaign.spendAttribute('koerper').ok).toBe(true);
    expect(campaign.maxHp()).toBe(20 + 4 * 5 + 2 * 2);
  });

  it('lernt Perks nur mit Punkt und Mindestwert', () => {
    const campaign = started();
    expect(campaign.learnPerk('bastler').ok).toBe(false);
    campaign.apply([{ xp: 100 }]);
    expect(campaign.learnPerk('charmant').ok).toBe(false); // Ausstrahlung 3 < 6
    expect(campaign.learnPerk('bastler').ok).toBe(true);
    expect(campaign.learnPerk('bastler').ok).toBe(false);
  });

  it('rüstet Kleidung aus und zählt ihre Boni zum Attribut', () => {
    const campaign = started();
    campaign.apply([{ give: 'jacke' }]);
    expect(campaign.equip('jacke').ok).toBe(true);
    expect(campaign.attribute('koerper')).toBe(5);
    expect(campaign.equip('kaffee').ok).toBe(false);
  });

  it('baut Cyberware ein und ersetzt den Platz', () => {
    const campaign = started();
    campaign.apply([{ installCyberware: 'optik' }]);
    expect(campaign.attribute('reflexe')).toBe(5);
    campaign.apply([{ installCyberware: 'reflexbooster' }]);
    expect(campaign.attribute('reflexe')).toBe(6);
    expect(campaign.evaluate({ cyberware: 'optik' })).toBe(false);
  });

  it('heilt mit Verbrauchsgegenständen und verbraucht sie', () => {
    const campaign = started();
    expect(campaign.useItem('kaffee').ok).toBe(false); // volle LP
    campaign.apply([{ damage: 15 }]);
    const before = campaign.state().player.hp;
    expect(campaign.useItem('kaffee').ok).toBe(true);
    expect(campaign.state().player.hp).toBe(before + 10);
    expect(campaign.state().inventory.kaffee).toBe(2);
  });

  it('trainiert Basisattribute innerhalb 1..10', () => {
    const campaign = started();
    const before = campaign.state().player.attributes.technik;
    expect(campaign.apply([{ trainAttribute: 'technik', delta: 2 }]).messages).toContain('Technik +2');
    expect(campaign.state().player.attributes.technik).toBe(before + 2);
    campaign.apply([{ trainAttribute: 'technik', delta: 50 }]);
    expect(campaign.state().player.attributes.technik).toBe(10);
    campaign.apply([{ trainAttribute: 'strasse', delta: -50 }]);
    expect(campaign.state().player.attributes.strasse).toBe(1);
  });
});

describe('Schwellen-Checks', () => {
  it('summiert Attribut, Perk-, Gegenstands- und Situationsboni', () => {
    const campaign = started();
    let check = campaign.evaluateCheck('chip');
    expect(check).toMatchObject({ attribute: 'technik', threshold: 6, value: 5, ok: false, missing: 1 });
    campaign.apply([{ xp: 100 }]);
    campaign.learnPerk('bastler');
    check = campaign.evaluateCheck('chip');
    expect(check).toMatchObject({ value: 6, ok: true, missing: 0 });
    expect(check.parts.map(part => part.source)).toContain('perk');

    expect(campaign.evaluateCheck('schloss').value).toBe(4);
    campaign.apply([{ give: 'dietrich' }, { relation: 'raven', delta: 400 }]);
    const lock = campaign.evaluateCheck('schloss');
    expect(lock.value).toBe(7);
    expect(lock.parts.map(part => part.label)).toContain('Ravens Griff');
  });

  it('gibt beim ersten Bestehen einmalig XP (15 + 5 × Schwelle)', () => {
    const campaign = started(fixtureContent(), baseInput({ attributes: { technik: 7, koerper: 3, reflexe: 3, ausstrahlung: 3, strasse: 3 } }));
    const first = campaign.passCheck('chip');
    expect(first.evaluation.ok).toBe(true);
    expect(campaign.state().player.xp).toBe(45);
    expect(campaign.state().stats.checksPassed).toBe(1);
    campaign.passCheck('chip');
    expect(campaign.state().player.xp).toBe(45);
    expect(campaign.evaluateCheck('chip').passedBefore).toBe(true);
  });

  it('verändert bei nicht bestandenem Check nichts', () => {
    const campaign = started();
    const before = campaign.state();
    const result = campaign.passCheck('geheim');
    expect(result.evaluation.ok).toBe(false);
    expect(result.evaluation.hiddenIfFailed).toBe(true);
    expect(campaign.state()).toBe(before);
  });
});

describe('Bedingungen und Effekte', () => {
  it('wertet zusammengesetzte Bedingungen aus', () => {
    const campaign = started();
    expect(campaign.evaluate({ all: [{ attr: 'technik', min: 5 }, { origin: 'gosse' }, { level: 1 }] })).toBe(true);
    expect(campaign.evaluate({ any: [{ flag: 'x' }, { not: { item: 'messer' } }] })).toBe(true);
    expect(campaign.evaluate({ credits: 151 })).toBe(false);
    expect(campaign.evaluate({ clockBetween: [470, 500] })).toBe(true);
    expect(campaign.evaluate({ weekday: 'mo' })).toBe(true);
    expect(campaign.evaluate({ rep: 'unterstadt', min: 10 })).toBe(true);
    expect(campaign.evaluate({ unbekannt: 1 } as never)).toBe(false);
  });

  it('wendet Effekte transaktional an', () => {
    const campaign = started();
    const before = campaign.state();
    const outcome = campaign.apply([{ give: 'messer' }, { take: 'chip' }]);
    expect(outcome.messages.length).toBeGreaterThan(0);
    expect(campaign.state()).toBe(before);
    expect(campaign.state().inventory.messer).toBeUndefined();
  });

  it('liefert Anfragen für Darstellung und Audio', () => {
    const campaign = started();
    const outcome = campaign.apply([{ cutscene: 'intro' }, { sfx: 'door' }, { battle: 'schlaeger' }, { shop: 'kiosk' }, { travel: 'bar' }]);
    expect(outcome.requests).toEqual([{ cutscene: 'intro' }, { sfx: 'door' }, { battle: 'schlaeger' }, { shop: 'kiosk' }, { travel: 'bar', entry: undefined }].map(r => JSON.parse(JSON.stringify(r))));
  });

  it('friert den Zustand ein', () => {
    const campaign = started();
    expect(Object.isFrozen(campaign.state().inventory)).toBe(true);
  });
});

describe('Beziehungen', () => {
  it('gibt täglich einmal +20 fürs Ansprechen und wählt das Tagesgespräch nach Herzen', () => {
    const campaign = started();
    expect(campaign.talkTo('raven').dialogue).toBe('raven-tag');
    expect(campaign.state().relations.raven.points).toBe(20);
    campaign.talkTo('raven');
    expect(campaign.state().relations.raven.points).toBe(20);
    expect(campaign.evaluate({ met: 'raven' })).toBe(true);
    campaign.apply([{ relation: 'raven', delta: 400 }]);
    expect(campaign.talkTo('raven').dialogue).toBe('raven-nah');
  });

  it('wertet Geschenke nach Vorliebe, Stichwort und Variante', () => {
    const campaign = started();
    expect(campaign.giftTaste('raven', 'messer')).toBe('loves');
    expect(campaign.giftTaste('raven', 'kaffee')).toBe('likes');
    expect(campaign.giftTaste('raven', 'handschellen')).toBe('hates');
    expect(campaign.giftTaste('raven', 'jacke')).toBe('neutral');
    campaign.apply([{ setFlag: 'raven-kaffee-satt' }]);
    expect(campaign.giftTaste('raven', 'kaffee')).toBe('dislikes');
  });

  it('begrenzt Geschenke auf 1 pro Tag und 2 pro Woche', () => {
    const campaign = started();
    campaign.apply([{ give: 'messer', qty: 3 }]);
    expect(campaign.giveGift('raven', 'messer')).toMatchObject({ ok: true, taste: 'loves', delta: 80 });
    expect(campaign.giveGift('raven', 'messer').ok).toBe(false);
    campaign.sleep();
    expect(campaign.giveGift('raven', 'messer').ok).toBe(true);
    campaign.sleep();
    expect(campaign.giveGift('raven', 'messer').ok).toBe(false);
    expect(campaign.state().relations.raven.points).toBe(160);
    expect(campaign.giveGift('raven', 'chip').ok).toBe(false);
  });

  it('verstärkt positive Geschenke mit Perk', () => {
    const campaign = started(fixtureContent(), baseInput({ attributes: { technik: 3, koerper: 3, reflexe: 3, ausstrahlung: 7, strasse: 3 } }));
    campaign.apply([{ xp: 100 }]);
    expect(campaign.learnPerk('charmant').ok).toBe(true);
    campaign.apply([{ give: 'messer' }]);
    expect(campaign.giveGift('raven', 'messer').delta).toBe(120);
  });

  it('kennt Herzen, Grenzen und Rivalität', () => {
    const campaign = started();
    campaign.apply([{ relation: 'raven', delta: 5000 }]);
    expect(campaign.hearts('raven')).toBe(10);
    campaign.apply([{ relation: 'raven', delta: -1250 }]);
    expect(campaign.state().relations.raven.points).toBe(-250);
    expect(campaign.hearts('raven')).toBe(0);
    expect(campaign.rivalry('raven')).toBe(2);
    expect(campaign.evaluate({ rival: 'raven' })).toBe(true);
    const points = campaign.state().relations.raven.points;
    campaign.sleep();
    campaign.talkTo('raven');
    expect(campaign.state().relations.raven.points).toBe(points); // Tagesbonus nur ab 0
  });

  it('öffnet Romanzen nur über den Schalter, ab 8 Herzen und nie für Kinder', () => {
    const content = fixtureContent();
    const plain = started(content);
    plain.apply([{ relation: 'raven', delta: 900 }]);
    expect(plain.evaluate({ romance: 'raven' })).toBe(false);

    const enabled = { ...fixtureContent(), romance: new Set(['raven', 'daria']) };
    const campaign = started(enabled);
    campaign.apply([{ relation: 'raven', delta: 700 }, { relation: 'daria', delta: 900 }]);
    expect(campaign.evaluate({ romance: 'raven' })).toBe(false);
    campaign.apply([{ relation: 'raven', delta: 100 }]);
    expect(campaign.evaluate({ romance: 'raven' })).toBe(true);
    expect(campaign.evaluate({ romance: 'daria' })).toBe(false);
    expect(findContentProblems(enabled).some(p => p.includes('daria'))).toBe(true);
  });

  it('rekrutiert, setzt die Party (höchstens 2) und entlässt', () => {
    const campaign = started();
    expect(campaign.setParty(['raven']).ok).toBe(false);
    campaign.apply([{ recruit: 'raven' }, { recruit: 'ripper' }]);
    expect(campaign.apply([{ recruit: 'dante' }]).messages.join(' ')).toMatch(/Dante/);
    expect(campaign.state().recruited).not.toContain('dante');
    campaign.apply([{ setFlag: 'dante-frei' }, { recruit: 'dante' }]);
    expect(campaign.setParty(['raven', 'dante', 'ripper']).ok).toBe(false);
    expect(campaign.setParty(['raven', 'dante']).ok).toBe(true);
    expect(campaign.evaluate({ companion: 'dante' })).toBe(true);
    campaign.apply([{ dismiss: 'dante' }]);
    expect(campaign.state().party).toEqual(['raven']);
  });

  it('meldet Herz-Ereignisse einmalig zur passenden Zeit auf der Karte', () => {
    const campaign = started();
    campaign.apply([{ relation: 'raven', delta: 200 }]);
    expect(campaign.pendingHeartEvent('gasse')).toBeNull(); // morgens
    campaign.advanceClock(180);
    expect(campaign.pendingHeartEvent('gasse')?.id).toBe('he-raven-2');
    campaign.completeHeartEvent('he-raven-2');
    expect(campaign.evaluate({ flag: 'he-raven-2-done' })).toBe(true);
    expect(campaign.pendingHeartEvent('gasse')).toBeNull();
  });
});

describe('Zeit und Tagesablauf', () => {
  it('ordnet Minuten Tageszeiten zu und stellt die Uhr vor', () => {
    const campaign = started();
    expect(campaign.timeSlot()).toBe('morgen');
    campaign.advanceClock(120);
    expect(campaign.timeSlot()).toBe('tag');
    campaign.advanceClock(7 * 60);
    expect(campaign.timeSlot()).toBe('abend');
    campaign.advanceClock(4 * 60);
    expect(campaign.timeSlot()).toBe('nacht');
  });

  it('bricht um 02:00 zusammen: Unterschlupf, −10 % Credits, Notiz', () => {
    const campaign = started();
    const outcome = campaign.advanceClock(2000);
    const state = campaign.state();
    expect(state.clock).toEqual({ day: 2, minutes: 360 });
    expect(state.credits).toBe(135);
    expect(outcome.requests).toContainEqual({ travel: 'bar', entry: 'start', minutes: 0 });
    expect(outcome.requests).toContainEqual({ sleep: 'collapse' });
    expect(outcome.messages.join(' ')).toContain('C. K.');
  });

  it('schläft bis 06:00 mit vollen LP', () => {
    const campaign = started();
    campaign.apply([{ damage: 10 }]);
    campaign.sleep();
    expect(campaign.state().clock).toEqual({ day: 2, minutes: 360 });
    expect(campaign.state().player.hp).toBe(campaign.maxHp());
    expect(campaign.weekday()).toBe('di');
  });

  it('verlegt Kartenwechsel um 10 Minuten und notiert besuchte Karten', () => {
    const campaign = started();
    campaign.setLocation('bar', [100, 400], 'e');
    expect(campaign.state().clock.minutes).toBe(490);
    expect(campaign.state().visited).toContain('bar');
    campaign.setLocation('bar', [120, 400], 'e');
    expect(campaign.state().clock.minutes).toBe(490);
  });

  it('platziert Figuren nach Tageszeit und Wochentag', () => {
    const campaign = started();
    expect(campaign.presentNpcs('gasse').find(p => p.npc === 'raven')).toMatchObject({ at: [700, 400], facing: 'w' });
    expect(campaign.presentNpcs('gasse').find(p => p.npc === 'daria')?.at).toEqual([900, 600]);
    campaign.advanceClock(600); // 18:00, Montag
    expect(campaign.presentNpcs('bar').find(p => p.npc === 'raven')?.at).toEqual([600, 400]);
    campaign.apply([{ advanceTime: 300 }]);
    expect(campaign.presentNpcs('gasse').find(p => p.npc === 'daria')).toBeUndefined();
    for (let i = 0; i < 3; i++) campaign.sleep(); // Donnerstag
    campaign.advanceClock(720);
    expect(campaign.weekday()).toBe('do');
    expect(campaign.presentNpcs('bar').find(p => p.npc === 'raven')?.at).toEqual([300, 300]);
  });

  it('lässt Begleiter in der Party nicht zusätzlich am Ablaufort stehen', () => {
    const campaign = started();
    campaign.apply([{ recruit: 'raven' }]);
    campaign.setParty(['raven']);
    expect(campaign.presentNpcs('gasse').some(p => p.npc === 'raven')).toBe(false);
  });
});

describe('Quests und Aufträge', () => {
  it('startet automatisch, rastet Schritte ein und schließt mit Belohnung ab', () => {
    const campaign = started();
    campaign.apply([{ setFlag: 'angekommen' }]);
    expect(campaign.state().quests.ankunft.status).toBe('active');
    expect(campaign.objective()).toMatchObject({ quest: 'ankunft', text: 'Geh in die Bar.' });
    campaign.setLocation('bar', [100, 400], 'e');
    expect(campaign.state().quests.ankunft.steps).toContain('bar');
    const xp = campaign.state().player.xp;
    campaign.talkTo('raven');
    const state = campaign.state();
    expect(state.quests.ankunft.status).toBe('done');
    expect(state.player.xp).toBe(xp + 100);
    expect(state.relations.raven.points).toBe(20 + 30);
    expect(campaign.quests()[0].status).toBe('done');
  });

  it('kennt Lösungswege über any und Fehlschlag', () => {
    const campaign = started();
    campaign.apply([{ startQuest: 'chip' }]);
    campaign.apply([{ setFlag: 'chip-verloren' }]);
    expect(campaign.state().quests.chip.status).toBe('failed');
    const other = started();
    other.apply([{ startQuest: 'chip' }, { give: 'chip' }]);
    expect(other.state().quests.chip.status).toBe('done');
    expect(other.state().inventory.messer).toBe(1);
  });

  it('zieht deterministische Auftragsangebote und nimmt sie an', () => {
    const a = started();
    const b = started();
    const offers = a.jobOffers('tafel');
    expect(offers).toHaveLength(2);
    expect(b.jobOffers('tafel')).toEqual(offers);
    expect(a.jobOffers('andere')).toHaveLength(1);
    const kurier = offers.find(o => o.template === 'kurier');
    expect(kurier).toBeDefined();
    expect(a.acceptJob(kurier?.id ?? '').ok).toBe(true);
    expect(a.state().inventory.chip).toBe(1);
    expect(a.jobOffers('tafel').some(o => o.template === 'kurier')).toBe(false);
    // Erster Auftrag des Tages: +25 % auf den Angebotslohn
    const accepted = a.state().jobs.active.find(o => o.template === 'kurier');
    expect(accepted?.credits).toBe(Math.round((kurier?.credits ?? 0) * 1.25));
    const credits = a.state().credits;
    a.apply([{ completeJob: 'kurier' }]);
    expect(a.state().credits).toBe(credits + (accepted?.credits ?? 0));
    expect(a.evaluate({ job: 'kurier' })).toBe(false);
  });
});

describe('Handel', () => {
  it('zeigt Preise mit Rabatt, Tagesbestand und Öffnungszeit', () => {
    const campaign = started();
    const prices = campaign.prices('kiosk');
    expect(prices.map(p => p.item)).toEqual(['kaffee', 'messer']); // Jacke erst in Akt 2
    expect(prices[0]).toMatchObject({ buy: 10, sell: 4, available: 3, open: true });
    campaign.apply([{ xp: 100 }]);
    campaign.learnPerk('bastler');
    // 10 % Perk; Ruf 10 ist „Neutral“ (kein Rufrabatt, world.md 10.2)
    expect(campaign.prices('kiosk')[1].buy).toBe(90);
  });

  it('kauft und verkauft innerhalb der Grenzen', () => {
    const campaign = started();
    expect(campaign.buy('kiosk', 'kaffee', 4).ok).toBe(false);
    expect(campaign.buy('kiosk', 'kaffee', 3).ok).toBe(true);
    expect(campaign.state().credits).toBe(120);
    expect(campaign.prices('kiosk')[0].available).toBe(0);
    expect(campaign.sell('kiosk', 'kaffee', 2).ok).toBe(true);
    expect(campaign.state().credits).toBe(128);
    expect(campaign.sell('kiosk', 'chip').ok).toBe(false);
    expect(campaign.buy('kiosk', 'messer', 2).ok).toBe(false); // zu teuer
    campaign.sleep();
    expect(campaign.prices('kiosk')[0].available).toBe(3);
  });

  it('verkauft nicht bei geschlossenem Laden', () => {
    const campaign = started();
    campaign.advanceClock(600);
    expect(campaign.buy('kiosk', 'kaffee').ok).toBe(false);
  });
});

describe('Kampfabrechnung', () => {
  it('belohnt Siege, gibt Begleitern +5 und merkt den Sieg', () => {
    const campaign = started();
    campaign.apply([{ recruit: 'raven' }]);
    campaign.setParty(['raven']);
    const credits = campaign.state().credits;
    campaign.finishBattle({ encounter: 'schlaeger', outcome: 'win', playerHp: 10, loot: { kaffee: 1 }, xp: 5 });
    const state = campaign.state();
    expect(state.player.hp).toBe(10);
    expect(state.player.xp).toBe(55);
    expect(state.credits).toBe(credits + 30);
    expect(state.inventory.kaffee).toBe(4);
    expect(state.relations.raven.points).toBe(5);
    expect(campaign.evaluate({ won: 'schlaeger' })).toBe(true);
    expect(campaign.evaluate({ flag: 'schlaeger-besiegt' })).toBe(true);
  });

  it('schickt nach einer Niederlage mit halben LP heim', () => {
    const campaign = started();
    const outcome = campaign.finishBattle({ encounter: 'schlaeger', outcome: 'lose', playerHp: 0 });
    expect(campaign.state().player.hp).toBe(Math.floor(campaign.maxHp() / 2));
    expect(outcome.requests).toContainEqual({ travel: 'bar', entry: 'start', minutes: 0 });
    expect(campaign.evaluate({ won: 'schlaeger' })).toBe(false);
    expect(campaign.evaluate({ flag: 'schlaeger-verloren' })).toBe(true);
  });
});

describe('Welt', () => {
  it('schaltet Stationen beim Betreten frei und reist mit +30 Minuten', () => {
    const campaign = started();
    expect(campaign.fastTravel('linie-bar').ok).toBe(false);
    campaign.setLocation('gasse', [300, 500], 'e');
    expect(campaign.state().stations).toContain('linie-gasse');
    const minutes = campaign.state().clock.minutes;
    const result = campaign.fastTravel('linie-gasse');
    expect(result.ok).toBe(true);
    expect(result.outcome.requests).toContainEqual({ travel: 'gasse', entry: 'start', minutes: 0 });
    expect(campaign.state().clock.minutes).toBe(minutes + 30);
  });

  it('wählt die wichtigste passende Nachricht', () => {
    const campaign = started();
    expect(campaign.currentNews()?.id).toBe('morgen');
    campaign.apply([{ setFlag: 'einbruch' }]);
    expect(campaign.currentNews()?.id).toBe('eilmeldung');
  });

  it('stellt Telefonnachrichten automatisch zu und wertet Antworten einmal aus', () => {
    const campaign = started();
    campaign.apply([{ relation: 'raven', delta: 200 }]);
    expect(campaign.state().phone.map(p => p.id)).toEqual(['hallo']);
    campaign.readPhone('hallo', 0);
    campaign.readPhone('hallo', 0);
    expect(campaign.state().relations.raven.points).toBe(205);
    expect(campaign.evaluate({ flag: 'antwort' })).toBe(true);
  });

  it('zeigt Namen erst nach der Vorstellung und löst Porträtvarianten auf', () => {
    const campaign = started();
    expect(campaign.displayName('raven')).toBe('Frau in Schwarz');
    campaign.apply([{ setFlag: 'raven-known' }]);
    expect(campaign.displayName('raven')).toBe('Raven');
    expect(campaign.displayName('player')).toBe('Testfigur');
    expect(campaign.portraitKey('raven', 'wut')).toBe('portrait-raven-wut');
    expect(campaign.portraitKey('player')).toBe('portrait-player-a');
    expect(campaign.portraitKey('narrator')).toBeNull();
  });

  it('setzt Akt-Startzustände wie ein Debug-Warp', () => {
    const campaign = createCampaign(fixtureContent(), { storage: null, seed: 1 });
    campaign.warpAct(2);
    const state = campaign.state();
    expect(state.act).toBe(2);
    expect(state.player.created).toBe(true);
    expect(state.player.level).toBe(3);
    expect(state.party).toEqual(['raven']);
    expect(state.quests.ankunft.status).toBe('done');
    expect(state.inventory.messer).toBe(1);
    expect(campaign.evaluate({ act: 2 })).toBe(true);
  });
});

describe('Autosave', () => {
  it('speichert nach Änderungen und stellt beim Start wieder her', () => {
    const storage = memoryStorage();
    const campaign = createCampaign(fixtureContent(), { storage, seed: 5 });
    campaign.createCharacter(baseInput());
    expect(storage.writes).toBeGreaterThan(0);
    const again = createCampaign(fixtureContent(), { storage, seed: 9 });
    expect(again.restored).toBe(true);
    expect(again.state().player.name).toBe('Testfigur');
  });

  it('drosselt das Speichern beim Laufen', () => {
    const storage = memoryStorage();
    const campaign = createCampaign(fixtureContent(), { storage, seed: 5 });
    campaign.createCharacter(baseInput());
    const writes = storage.writes;
    campaign.setLocation('gasse', [210, 500], 'e');
    campaign.setLocation('gasse', [220, 500], 'e');
    expect(storage.writes).toBe(writes);
    campaign.addPlayTime(3000);
    expect(storage.writes).toBe(writes + 1);
  });

  it('ignoriert einen kaputten Autosave', () => {
    const campaign = createCampaign(fixtureContent(), { storage: memoryStorage('{kaputt'), seed: 5 });
    expect(campaign.restored).toBe(false);
    expect(campaign.state().player.created).toBe(false);
  });
});
