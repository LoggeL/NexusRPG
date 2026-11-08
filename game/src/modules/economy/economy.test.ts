import { describe, expect, it } from 'vitest';
import { fixtureContent } from '../__fixtures__/content';
import { MAX_STACK, createCampaign } from '../campaign';
import type { CharacterInput, GameContent, GameState } from '../contracts';
import {
  MIN_BUY_FACTOR, buyUnitPrice, buysCategory, clampCredits, creditDeltaText, discountPercent, formatCredits,
  planPurchase, planSale, recordStockSale, sellUnitPrice, shopPrices, shopProblems, shopView, soldToday, tradeTerms,
} from './index';

const input: CharacterInput = {
  name: 'Testfigur', look: 'a', origin: 'gosse',
  attributes: { technik: 5, koerper: 4, reflexe: 4, ausstrahlung: 3, strasse: 3 },
};

function started(content: GameContent = fixtureContent()) {
  const campaign = createCampaign(content, { storage: null, seed: 3, random: () => 0.5 });
  expect(campaign.createCharacter(input).ok).toBe(true);
  return campaign;
}

const always = () => true;

describe('Credits', () => {
  it('formatiert Beträge und Änderungen', () => {
    expect(formatCredits(120)).toBe('120 ¢');
    expect(creditDeltaText(50)).toBe('+50 Credits');
    expect(creditDeltaText(-7)).toBe('−7 Credits');
    expect(clampCredits(-5)).toBe(0);
    expect(clampCredits(Number.NaN)).toBe(0);
  });

  it('lehnt Abbuchungen ohne Deckung ab und meldet Änderungen', () => {
    const campaign = started();
    expect(campaign.state().credits).toBe(150);
    expect(campaign.apply([{ credits: -200 }]).messages).toEqual(['Nicht genug Credits (150 von 200).']);
    expect(campaign.state().credits).toBe(150);
    const outcome = campaign.apply([{ credits: 25 }]);
    expect(outcome.messages).toEqual(['+25 Credits']);
    expect(outcome.requests).toContainEqual({ sfx: 'coin' });
    expect(campaign.apply([{ credits: -25 }]).messages).toEqual(['−25 Credits']);
  });
});

describe('Konditionen', () => {
  it('rechnet Normalpreis, Perkrabatt und Rufstufe zusammen', () => {
    const campaign = started();
    const content = campaign.content;
    const kiosk = content.shops.kiosk;
    expect(tradeTerms(content, campaign.state(), kiosk)).toMatchObject({ buyFactor: 1, sellRate: 0.4, refused: null, perkDiscount: 0 });
    campaign.apply([{ xp: 100 }]);
    expect(campaign.learnPerk('bastler').ok).toBe(true);
    expect(tradeTerms(content, campaign.state(), kiosk).buyFactor).toBeCloseTo(0.9);
    campaign.apply([{ rep: 'unterstadt', delta: 40 }]); // 50: Respektiert −15 %
    expect(tradeTerms(content, campaign.state(), kiosk).tier.id).toBe('respektiert');
    expect(tradeTerms(content, campaign.state(), kiosk).buyFactor).toBeCloseTo(0.75);
    expect(tradeTerms(content, campaign.state(), kiosk).sellRate).toBeCloseTo(0.5);
    expect(discountPercent(content, campaign.state(), kiosk)).toBe(25);
  });

  it('verteuert bei schlechtem Ruf und deckelt Rabatte bei 50 %', () => {
    const content = fixtureContent();
    content.perks.feilscher = { id: 'feilscher', name: 'Feilscher', description: '', attribute: 'ausstrahlung', min: 1, shopDiscount: 60, sellBonus: 80 };
    const campaign = started(content);
    campaign.apply([{ rep: 'unterstadt', delta: -40 }]); // −30: Feindlich +50 %
    expect(campaign.prices('kiosk')[0]).toMatchObject({ item: 'kaffee', buy: 15, sell: 3 });
    expect(discountPercent(content, campaign.state(), content.shops.kiosk)).toBe(-50);
    campaign.apply([{ rep: 'unterstadt', delta: 120 }, { grantPerk: 'feilscher' }]); // Verehrt + 60 % Perk
    const terms = tradeTerms(content, campaign.state(), content.shops.kiosk);
    expect(terms.buyFactor).toBe(MIN_BUY_FACTOR);
    expect(terms.sellRate).toBe(0.9);
    // Ankauf nie über dem eigenen Verkaufspreis: Kaffee kostet 5, Ankauf höchstens 4.
    expect(campaign.prices('kiosk')[0]).toMatchObject({ buy: 5, sell: 4 });
  });

  it('verweigert bei „Verhasst“ jeden Handel', () => {
    const campaign = started();
    campaign.apply([{ rep: 'unterstadt', delta: -70 }]);
    const reason = 'Kiosk handelt nicht mit dir (Ruf: Verhasst).';
    expect(campaign.buy('kiosk', 'kaffee')).toMatchObject({ ok: false, message: reason });
    expect(campaign.sell('kiosk', 'kaffee')).toMatchObject({ ok: false, message: reason });
    expect(campaign.prices('kiosk').every(price => !price.open)).toBe(true);
    expect(shopView(campaign.content, campaign.state(), 'kiosk', campaign.evaluate)?.closedReason).toBe(reason);
  });
});

describe('Sortiment und Preise', () => {
  it('zeigt nur Einträge mit erfüllter Bedingung, ohne Doppelungen', () => {
    const content = fixtureContent();
    content.shops.kiosk.stock.push({ item: 'kaffee', price: 1 }, { item: 'gibtsnicht' });
    const campaign = started(content);
    expect(campaign.prices('kiosk').map(price => price.item)).toEqual(['kaffee', 'messer']);
    expect(campaign.prices('kiosk')[0].buy).toBe(10);
    campaign.apply([{ setAct: 2 }]);
    expect(campaign.prices('kiosk').map(price => price.item)).toEqual(['kaffee', 'messer', 'jacke']);
    expect(shopPrices(content, campaign.state(), 'unbekannt', always)).toEqual([]);
  });

  it('kauft Quest-Gegenstände nie an und achtet auf `buys`', () => {
    const content = fixtureContent();
    const kiosk = content.shops.kiosk;
    expect(buysCategory(kiosk, content.items.chip)).toBe(false);
    expect(buysCategory(kiosk, content.items.messer)).toBe(true);
    expect(buysCategory({ ...kiosk, buys: ['verbrauch'] }, content.items.messer)).toBe(false);
    expect(buysCategory({ ...kiosk, buys: ['quest'] }, content.items.chip)).toBe(false);
    expect(buysCategory(kiosk, { ...content.items.kaffee, sellable: false })).toBe(false);
    const state = started(content).state();
    expect(sellUnitPrice(content, state, kiosk, 'chip', always)).toBeNull();
    expect(sellUnitPrice(content, state, kiosk, 'jacke', always)).toBe(80); // nicht im Sortiment: 40 % von 200
  });

  it('deckelt den Ankauf unter dem Verkaufspreis desselben Händlers', () => {
    const content = fixtureContent();
    content.shops.kiosk.stock[1] = { item: 'messer', price: 5 };
    const campaign = started(content);
    const messer = campaign.prices('kiosk').find(price => price.item === 'messer');
    expect(messer).toMatchObject({ buy: 5, sell: 4 });
    expect(buyUnitPrice(0, tradeTerms(content, campaign.state(), content.shops.kiosk))).toBe(1);
  });

  it('liefert eine Ladenansicht mit Ankaufsliste', () => {
    const campaign = started();
    const view = shopView(campaign.content, campaign.state(), 'kiosk', campaign.evaluate);
    expect(view).toMatchObject({ shop: 'kiosk', name: 'Kiosk', open: true, closedReason: null, discount: 0 });
    expect(view?.stock[0]).toMatchObject({ item: 'kaffee', name: 'Synth-Kaffee', soldOut: false, affordable: true, available: 3 });
    expect(view?.stock[1]).toMatchObject({ item: 'messer', affordable: true });
    expect(view?.sellable).toEqual([{ item: 'kaffee', name: 'Synth-Kaffee', qty: 3, price: 4 }]);
    campaign.advanceClock(600);
    expect(shopView(campaign.content, campaign.state(), 'kiosk', campaign.evaluate)).toMatchObject({ open: false, closedReason: 'Kiosk hat gerade geschlossen.' });
    expect(shopView(campaign.content, campaign.state(), 'nirgends', campaign.evaluate)).toBeNull();
  });
});

describe('Kaufen und Verkaufen', () => {
  it('plant Käufe mit allen Ablehnungsgründen', () => {
    const campaign = started();
    const { content } = campaign;
    const plan = (item: string, qty = 1) => planPurchase(content, campaign.state(), 'kiosk', item, qty, campaign.evaluate);
    expect(plan('kaffee', 2)).toEqual({ ok: true, item: 'kaffee', qty: 2, unit: 10, total: 20, tracked: true });
    expect(plan('messer')).toMatchObject({ ok: true, tracked: false, total: 100 });
    expect(plan('kaffee', 0)).toEqual({ ok: false, reason: 'Ungültige Menge.' });
    expect(plan('kaffee', 1.5)).toEqual({ ok: false, reason: 'Ungültige Menge.' });
    expect(plan('kaffee', 4)).toEqual({ ok: false, reason: 'Nur noch 3 vorrätig.' });
    expect(plan('jacke')).toEqual({ ok: false, reason: 'Lederjacke gibt es hier nicht.' });
    expect(plan('messer', 2)).toEqual({ ok: false, reason: 'Nicht genug Credits (150 von 200).' });
    expect(planPurchase(content, campaign.state(), 'weg', 'kaffee', 1, campaign.evaluate)).toEqual({ ok: false, reason: 'Unbekannter Händler.' });
    campaign.apply([{ give: 'kaffee', qty: MAX_STACK - 3 }]);
    expect(plan('kaffee')).toEqual({ ok: false, reason: 'So viel passt nicht ins Inventar.' });
  });

  it('führt den Tagesbestand und füllt am nächsten Tag auf', () => {
    const campaign = started();
    expect(campaign.buy('kiosk', 'kaffee', 2).ok).toBe(true);
    expect(soldToday(campaign.state(), 'kiosk', 'kaffee')).toBe(2);
    expect(campaign.buy('kiosk', 'kaffee').ok).toBe(true);
    expect(campaign.buy('kiosk', 'kaffee')).toMatchObject({ ok: false, message: 'Heute ausverkauft.' });
    expect(campaign.buy('kiosk', 'messer').ok).toBe(true); // ohne Tagesbestand
    expect(campaign.state().shops.kiosk.sold).toEqual({ kaffee: 3 });
    campaign.sleep();
    expect(soldToday(campaign.state(), 'kiosk', 'kaffee')).toBe(0);
    expect(campaign.buy('kiosk', 'kaffee').ok).toBe(true);
    expect(campaign.state().shops.kiosk).toEqual({ day: 2, sold: { kaffee: 1 } });
  });

  it('bucht Verkäufe eines neuen Tages frisch', () => {
    const shops: GameState['shops'] = { kiosk: { day: 1, sold: { kaffee: 3 } } };
    recordStockSale(shops, 'kiosk', 2, 'messer', 1);
    expect(shops.kiosk).toEqual({ day: 2, sold: { messer: 1 } });
    recordStockSale(shops, 'kiosk', 2, 'messer', 2);
    expect(shops.kiosk.sold.messer).toBe(3);
  });

  it('verkauft zum Ankaufspreis, legt Ausgerüstetes ab und bleibt transaktional', () => {
    const campaign = started();
    expect(campaign.buy('kiosk', 'messer').ok).toBe(true);
    expect(campaign.equip('messer').ok).toBe(true);
    const credits = campaign.state().credits;
    const sold = campaign.sell('kiosk', 'messer');
    expect(sold.ok).toBe(true);
    expect(sold.outcome.messages).toEqual(['Verkauft: Wurfmesser', '+48 Credits']);
    expect(campaign.state().credits).toBe(credits + 48);
    expect(campaign.state().player.equipment.nahkampf).toBeUndefined();
    const before = campaign.state();
    expect(campaign.sell('kiosk', 'kaffee', 4)).toMatchObject({ ok: false, message: 'Nicht genug: Synth-Kaffee (3 von 4)' });
    expect(campaign.sell('kiosk', 'jacke')).toMatchObject({ ok: false, message: 'Nicht im Inventar: Lederjacke' });
    expect(campaign.state()).toBe(before);
  });

  it('gleicht die LP an, wenn verkaufte Kleidung das Maximum senkt', () => {
    const campaign = started();
    campaign.apply([{ give: 'jacke' }]);
    expect(campaign.equip('jacke').ok).toBe(true);
    campaign.apply([{ heal: 'full' }]);
    const withJacket = campaign.maxHp();
    expect(campaign.state().player.hp).toBe(withJacket);
    expect(campaign.sell('kiosk', 'jacke').ok).toBe(true);
    expect(campaign.maxHp()).toBeLessThan(withJacket);
    expect(campaign.state().player.hp).toBe(campaign.maxHp());
  });

  it('plant Verkäufe nur bei geöffnetem Laden', () => {
    const campaign = started();
    const plan = () => planSale(campaign.content, campaign.state(), 'kiosk', 'kaffee', 2, campaign.evaluate);
    expect(plan()).toEqual({ ok: true, item: 'kaffee', qty: 2, unit: 4, total: 8, tracked: false });
    campaign.advanceClock(600);
    expect(plan()).toEqual({ ok: false, reason: 'Kiosk hat gerade geschlossen.' });
  });
});

describe('Inhaltsprüfung', () => {
  it('meldet kaputte Händlerdaten', () => {
    const content = fixtureContent();
    expect(shopProblems(content)).toEqual([]);
    content.shops.kiosk.buyRate = 2;
    content.shops.kiosk.stock.push({ item: 'kaffee' }, { item: 'messer', price: -1 }, { item: 'jacke', qty: 0, when: { act: 3 } });
    content.items.kaffee.price = Number.NaN;
    const problems = shopProblems(content);
    expect(problems).toEqual(expect.arrayContaining([
      expect.stringContaining('buyRate'),
      expect.stringContaining('„kaffee“ mehrfach'),
      expect.stringContaining('ungültiger Preis für „messer“'),
      expect.stringContaining('ungültiger Tagesbestand für „jacke“'),
      expect.stringContaining('Gegenstand kaffee'),
    ]));
  });
});
