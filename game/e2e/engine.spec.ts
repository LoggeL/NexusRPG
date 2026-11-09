// Bleibender Integrationstest (Bereich Integration): kompletter Spielablauf mit dem Akt-1-Inhalt.
// Figur erstellen → Prolog im Digitech-Areal → Bahnhof (Abzieher, Check-Wahl) → Geschenk an Oma Volt → Auftragstafel
// im Hinterzimmer → Kampf gewinnen → Volt-Eck (Händler) → im Crew-Quartier schlafen.
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

/** Klickt laufende Cutscenes und Dialogzeilen weg, bis die Erkundung frei ist (Wahlen: erste freigegebene). */
async function clearToExplore(page: Page) {
  for (let i = 0; i < 200; i++) {
    const v = await view(page);
    if (v.scene === 'explore' && !v.busy && !v.overlay && !v.dialogue) return v;
    if (v.dialogue?.choices?.length) {
      const pick = v.dialogue.choices.find((choice) => choice.enabled) ?? v.dialogue.choices[0];
      await page.evaluate((index) => window.__nexus!.choose(index), pick.index);
    } else if (!(await page.evaluate(() => window.__nexus!.advance()))) {
      await page.evaluate(() => window.__nexus!.skipCutscene());
    }
    await page.waitForTimeout(60);
  }
  return view(page);
}

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

test('Engine: kompletter Ablauf mit dem Akt-1-Inhalt', async ({ page }) => {
  test.setTimeout(150_000);
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

  // 2 · Intro und Funkspruch überspringen, Prolog im Digitech-Areal
  await settle(page);
  let current = await clearToExplore(page);
  expect(current.map).toBe('digitech-areal');
  await expect(page.getByTestId('hud')).toBeVisible();
  await shot(page, '02-erkundung');
  // Zeit läuft beim Erkunden
  const t0 = (await gameState(page)).clock.minutes;
  await page.waitForTimeout(2500);
  expect((await gameState(page)).clock.minutes).toBeGreaterThan(t0);
  expect((await gameState(page)).quests['main-0-digitech']?.status).toBe('active');

  // 3 · Prolog abschließen, Ankunft am Bahnhof: Abzieher-Dialog mit Check-Wahlen
  await page.evaluate(() => window.__nexus!.runEffects([{ setFlag: 'prolog_done' }]));
  await page.evaluate(() => window.__nexus!.travel('bahnhof-mitte', 'start'));
  await settle(page);
  current = await waitForView(page, (v) => !!v.dialogue?.choices?.length, 20_000).catch(async () => {
    // Cutscene und Zeilen bis zur Wahl weiterklicken
    for (let i = 0; i < 60; i++) {
      const v = await view(page);
      if (v.dialogue?.choices?.length) return v;
      if (!(await page.evaluate(() => window.__nexus!.advance()))) await page.evaluate(() => window.__nexus!.skipCutscene());
      await page.waitForTimeout(60);
    }
    return view(page);
  });
  expect(current.map).toBe('bahnhof-mitte');
  expect((await gameState(page)).quests['main-1-ankunft']?.status).toBe('active');
  const choices = current.dialogue?.choices ?? [];
  const checks = choices.filter((choice) => ['gc-01', 'gc-02', 'gc-03'].includes(choice.check ?? ''));
  expect(checks.length, JSON.stringify(choices)).toBe(3);
  // Zeit steht im Dialog
  const tDialog = (await gameState(page)).clock.minutes;
  await page.waitForTimeout(1500);
  expect((await gameState(page)).clock.minutes).toBe(tDialog);
  await shot(page, '04-dialog-check');
  // Bestehbarer Check, sonst der Weg ohne Check (zehn Credits)
  const pick = checks.find((choice) => choice.enabled) ?? choices.find((choice) => choice.text.includes('Zehn Credits'));
  expect(pick, JSON.stringify(choices)).toBeDefined();
  await page.evaluate((index) => window.__nexus!.choose(index), pick!.index);
  await settle(page);
  await clearToExplore(page);
  expect((await gameState(page)).flags['ankunft_abzieher_geloest']).toBeTruthy();

  // 4 · Geschenk an Oma Volt (Kiosk in der Neon-Gasse)
  await page.evaluate(() => window.__nexus!.travel('neon-gasse', 'von-bahnhof-mitte'));
  await settle(page);
  await clearToExplore(page);
  await page.evaluate(() => window.__nexus!.setTime('tag'));
  const oma = (await page.evaluate(() => window.__nexus!.npcs())).find((npc) => npc.id === 'oma-volt');
  expect(oma, 'Oma Volt steht am Kiosk').toBeDefined();
  await page.evaluate(([x, y]) => window.__nexus!.teleport(x, y), [oma!.x + 30, oma!.y + 20] as const);
  const before = (await gameState(page)).relations['oma-volt']?.points ?? 0;
  await page.evaluate(() => window.__nexus!.giveItem('synth-kaffee'));
  expect(await page.evaluate(() => window.__nexus!.talk('oma-volt'))).toBe(true);
  await expect(page.getByTestId('npc-talk')).toBeVisible();
  await shot(page, '03-npc-aktionen');
  await page.getByTestId('npc-gift').click();
  await expect(page.getByTestId('gift-picker')).toBeVisible();
  await page.locator('[data-testid="gift-picker"] [data-item="synth-kaffee"]').click();
  await shot(page, '05-geschenk');
  await page.getByTestId('gift-give').click();
  await settle(page);
  await clearToExplore(page);
  expect((await gameState(page)).relations['oma-volt']?.points ?? 0).not.toBe(before);

  // 5 · Auftrag an Hunters Tafel im Hinterzimmer (nach der Probezeit offen)
  await page.evaluate(() => window.__nexus!.runEffects([{ completeQuest: 'main-1-probezeit' }]));
  await page.evaluate(() => window.__nexus!.travel('hv-hinterzimmer', 'von-high-voltage'));
  await settle(page);
  await clearToExplore(page);
  expect(await page.evaluate(() => window.__nexus!.interact('auftragstafel'))).toBe(true);
  await expect(page.getByTestId('job-board')).toBeVisible();
  const offerId = await page.evaluate(() => {
    const campaign = window.__nexus!.campaign as unknown as { jobOffers(board: string): { id: string; template: string }[] };
    return campaign.jobOffers('auftragstafel')[0]?.id ?? null;
  });
  expect(offerId).not.toBeNull();
  await page.getByTestId(`accept-${offerId}`).click();
  await shot(page, '06-auftragstafel');
  await page.keyboard.press('Escape');
  await waitForView(page, (v) => !v.overlay && !v.busy);
  const accepted = (await gameState(page)).jobs.active.map((job) => job.template);
  expect(accepted.length).toBe(1);

  // 6 · Kampf starten (Abzieher-Brüder Knut und Kurt), eine echte Aktion, gewinnen
  await page.evaluate(() => window.__nexus!.startBattle('enc-bahnhof-abzieher'));
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
  current = await clearToExplore(page);
  expect(current.battle).toBeFalsy();
  expect(await page.evaluate(() => window.__nexus!.campaign!.evaluate({ won: 'enc-bahnhof-abzieher' }))).toBe(true);
  await shot(page, '09-nach-kampf');

  // 7 · Händler: Synth-Kaffee am Volt-Eck kaufen
  await page.evaluate(() => window.__nexus!.travel('neon-gasse', 'von-bahnhof-mitte'));
  await settle(page);
  await clearToExplore(page);
  await page.evaluate(() => window.__nexus!.setTime('tag'));
  const coffee = (await gameState(page)).inventory['synth-kaffee'] ?? 0;
  expect(await page.evaluate(() => window.__nexus!.interact('volt-eck'))).toBe(true);
  await expect(page.getByTestId('shop')).toBeVisible();
  await page.getByTestId('buy-synth-kaffee').click();
  await expect.poll(async () => (await gameState(page)).inventory['synth-kaffee'] ?? 0).toBe(coffee + 1);
  await shot(page, '10-haendler');
  await page.keyboard.press('Escape');
  await waitForView(page, (v) => !v.overlay && !v.busy);

  // 8 · Crew-Quartier, schlafen
  const day = (await gameState(page)).clock.day;
  await page.evaluate(() => window.__nexus!.travel('crew-quartier', 'aufwachen'));
  await settle(page);
  await clearToExplore(page);
  await waitForView(page, (v) => v.map === 'crew-quartier' && !v.busy);
  await shot(page, '11-unterschlupf');
  expect(await page.evaluate(() => window.__nexus!.interact('bed'))).toBe(true);
  await page.waitForTimeout(200);
  await settle(page);
  await clearToExplore(page);
  const morning = await gameState(page);
  expect(morning.clock.day).toBe(day + 1);
  expect(morning.clock.minutes).toBeLessThan(7 * 60);
  await shot(page, '12-neuer-tag');

  await expectNoErrors(page);
});
