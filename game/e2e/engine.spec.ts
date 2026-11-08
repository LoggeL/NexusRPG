// Bleibender Integrationstest (Bereich Integration): kompletter Spielablauf mit dem Testinhalt.
// Figur erstellen → Teststraße erkunden → Raven (Check-Wahl) → Geschenk → Quest/Auftrag → Kampf gewinnen → Händler → schlafen.
// Headless, 1 Worker, Port 5201 (playwright.config.ts). Screenshots nach output/qa/engine/.
import { expect, test, type Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expectNoErrors, openGame, settle, view, waitForView } from './helpers';

const ENGINE_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '../../output/qa/engine');

async function shot(page: Page, name: string) {
  mkdirSync(ENGINE_DIR, { recursive: true });
  await page.screenshot({ path: resolve(ENGINE_DIR, `${name}.png`) });
}

interface TestState {
  map: string;
  credits: number;
  flags: Record<string, unknown>;
  inventory: Record<string, number>;
  clock: { day: number; minutes: number };
  quests: Record<string, { status?: string } | undefined>;
  jobs: { active: { template: string }[] };
  relations: Record<string, { points: number } | undefined>;
}

const gameState = (page: Page) => page.evaluate(() => window.__nexus!.state() as unknown as TestState);

/** Wartet, bis der Kampf auf einen Spielerzug steht; Kampfintro-Zeilen werden weitergeklickt. */
async function waitForPlayerTurn(page: Page) {
  for (let i = 0; i < 300; i++) {
    const battle = await page.evaluate(() => window.__nexus!.battle());
    if (battle?.playerTurn) return battle;
    if ((await view(page)).dialogue) await page.evaluate(() => window.__nexus!.advance());
    await page.waitForTimeout(50);
  }
  throw new Error('Kein Spielerzug im Kampf');
}

test('Engine: kompletter Ablauf mit Testinhalt', async ({ page }) => {
  test.setTimeout(120_000);
  await openGame(page, '?newchar&seed=7');

  // 1 · Charaktererstellung
  // Wahl „Eigene Figur bauen“ → Baukasten → Weiter (design.md §3.1a/§3.1b).
  await page.getByTestId('creation-own').click();
  await page.getByTestId('creator-next').click();
  await expect(page.getByTestId('creation-name')).toBeVisible();
  await page.getByTestId('creation-name').fill('Kira');
  for (let i = 0; i < 3; i++) await page.getByTestId('creation-plus-technik').click();
  await page.getByTestId('creation-plus-strasse').click();
  await expect(page.getByTestId('creation-points')).toContainText('Freie Punkte: 0');
  await shot(page, '01-erstellung');
  await page.getByTestId('creation-start').click();

  // 2 · Intro überspringen, Erkundung der Teststraße
  await settle(page);
  let current = await waitForView(page, (v) => v.scene === 'explore' && !v.busy && !v.overlay);
  expect(current.map).toBe('test-strasse');
  await expect(page.getByTestId('hud')).toBeVisible();
  await shot(page, '02-erkundung');
  // Zeit läuft beim Erkunden
  const t0 = (await gameState(page)).clock.minutes;
  await page.waitForTimeout(2500);
  expect((await gameState(page)).clock.minutes).toBeGreaterThan(t0);
  expect((await gameState(page)).quests['test-chip']?.status).toBe('active');

  // 3 · Raven ansprechen, Check-Wahl
  const raven = (await page.evaluate(() => window.__nexus!.npcs())).find((npc) => npc.id === 'raven');
  expect(raven, 'Raven steht auf der Teststraße').toBeDefined();
  await page.evaluate(([x, y]) => window.__nexus!.teleport(x, y), [raven!.x, raven!.y + 20] as const);
  expect(await page.evaluate(() => window.__nexus!.talk('raven'))).toBe(true);
  await expect(page.getByTestId('npc-talk')).toBeVisible();
  await shot(page, '03-npc-aktionen');
  await page.getByTestId('npc-talk').click();
  current = await waitForView(page, (v) => !!v.dialogue?.choices?.length, 15_000).catch(async () => {
    // Zeilen bis zur Wahl weiterklicken
    for (let i = 0; i < 20; i++) {
      const v = await view(page);
      if (v.dialogue?.choices?.length) return v;
      await page.evaluate(() => window.__nexus!.advance());
      await page.waitForTimeout(60);
    }
    return view(page);
  });
  const choices = current.dialogue?.choices ?? [];
  const technik = choices.find((choice) => choice.check === 'test-chip-technik');
  expect(technik, JSON.stringify(choices)).toBeDefined();
  expect(technik!.enabled).toBe(true);
  // Zeit steht im Dialog
  const tDialog = (await gameState(page)).clock.minutes;
  await page.waitForTimeout(1500);
  expect((await gameState(page)).clock.minutes).toBe(tDialog);
  await shot(page, '04-dialog-check');
  await page.evaluate((index) => window.__nexus!.choose(index), technik!.index);
  await settle(page);
  expect((await gameState(page)).flags['test-chip-entschluesselt']).toBeTruthy();

  // 4 · Geschenk
  const before = (await gameState(page)).relations.raven?.points ?? 0;
  await page.evaluate(() => window.__nexus!.giveItem('synth-kaffee'));
  await page.evaluate(() => window.__nexus!.talk('raven'));
  await page.getByTestId('npc-gift').click();
  await expect(page.getByTestId('gift-picker')).toBeVisible();
  await page.locator('[data-testid="gift-picker"] [data-item="synth-kaffee"]').click();
  await shot(page, '05-geschenk');
  await page.getByTestId('gift-give').click();
  await settle(page);
  await waitForView(page, (v) => !v.overlay && !v.busy);
  expect((await gameState(page)).relations.raven?.points ?? 0).not.toBe(before);

  // 5 · Auftrag an der Tafel (Kopfgeld auf die Schläger)
  expect(await page.evaluate(() => window.__nexus!.interact('tafel'))).toBe(true);
  await expect(page.getByTestId('job-board')).toBeVisible();
  const offerId = await page.evaluate(() => {
    const campaign = window.__nexus!.campaign as unknown as { jobOffers(board: string): { id: string; template: string }[] };
    const offers = campaign.jobOffers('test-tafel');
    return (offers.find((offer) => offer.template === 'test-kopfgeld') ?? offers[0])?.id ?? null;
  });
  expect(offerId).not.toBeNull();
  await page.getByTestId(`accept-${offerId}`).click();
  await shot(page, '06-auftragstafel');
  await page.keyboard.press('Escape');
  await waitForView(page, (v) => !v.overlay && !v.busy);
  const accepted = (await gameState(page)).jobs.active.map((job) => job.template);
  expect(accepted.length).toBe(1);

  // 6 · Kampf starten, eine echte Aktion, gewinnen
  await page.evaluate(() => window.__nexus!.startBattle('test-schlaeger'));
  await waitForView(page, (v) => v.battle === true, 15_000);
  const battle = await waitForPlayerTurn(page);
  expect(battle.units.filter((unit) => unit.team === 'enemy').length).toBe(2);
  await page.waitForTimeout(300);
  await shot(page, '07-kampf');
  expect(await page.evaluate(() => window.__nexus!.battleAction('end'))).toBe(true);
  await waitForPlayerTurn(page);
  await shot(page, '08-kampf-runde2');
  expect(await page.evaluate(() => window.__nexus!.winBattle('win'))).toBe(true);
  await settle(page);
  current = await waitForView(page, (v) => v.scene === 'explore' && !v.busy && !v.overlay, 15_000);
  expect(current.battle).toBeFalsy();
  const afterBattle = await gameState(page);
  expect(afterBattle.flags['test-schlaeger-besiegt']).toBeTruthy();
  if (accepted[0] === 'test-kopfgeld') expect(afterBattle.jobs.active).toEqual([]);
  expect((await page.evaluate(() => window.__nexus!.hotspots())).some((spot) => spot.id === 'encounter:schlaeger')).toBe(false);
  await shot(page, '09-nach-kampf');

  // 7 · Händler: Synth-Kaffee kaufen
  await page.evaluate(() => window.__nexus!.setTime('tag'));
  const coffee = (await gameState(page)).inventory['synth-kaffee'] ?? 0;
  expect(await page.evaluate(() => window.__nexus!.interact('kiosk'))).toBe(true);
  await expect(page.getByTestId('shop')).toBeVisible();
  await page.getByTestId('buy-synth-kaffee').click();
  await expect.poll(async () => (await gameState(page)).inventory['synth-kaffee'] ?? 0).toBe(coffee + 1);
  await shot(page, '10-haendler');
  await page.keyboard.press('Escape');
  await waitForView(page, (v) => !v.overlay && !v.busy);

  // 8 · Unterschlupf, schlafen
  const day = (await gameState(page)).clock.day;
  await page.evaluate(() => window.__nexus!.travel('test-innen', 'tuer'));
  await settle(page);
  await waitForView(page, (v) => v.map === 'test-innen' && !v.busy);
  await shot(page, '11-unterschlupf');
  expect(await page.evaluate(() => window.__nexus!.interact('bed'))).toBe(true);
  await page.waitForTimeout(200);
  await settle(page);
  await waitForView(page, (v) => v.scene === 'explore' && !v.busy && !v.overlay, 15_000);
  const morning = await gameState(page);
  expect(morning.clock.day).toBe(day + 1);
  expect(morning.clock.minutes).toBeLessThan(7 * 60);
  await shot(page, '12-neuer-tag');

  await expectNoErrors(page);
});
