// Playwright-Helfer für window.__nexus (nur headless, 1 Worker, Port 5201 – siehe playwright.config.ts).
import { expect, type Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const QA_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '../../output/qa/ui');

export interface View {
  scene: string;
  map: string | null;
  busy: boolean;
  dialogue?: { speaker: string; text: string; typing: boolean; choices: { index: number; text: string; check?: string; enabled: boolean }[] | null; dialogueId?: string; nodeId?: string };
  cutscene?: { id: string; beat: number; total: number; text: string | null; speaker: string | null };
  overlay?: string;
  battle?: boolean;
  hint?: string | null;
  player?: { x: number; y: number; facing: string };
  camera?: { x: number; y: number; w: number; h: number };
  clock?: { day: number; minutes: number; slot: string };
}

export interface HotspotView { id: string; kind: string; label: string; x: number; y: number; inRange: boolean }

/** Spiel öffnen (ohne Spielstand), auf Test-Hook warten. */
export async function openGame(page: Page, query = '', options: { keepStorage?: boolean; reducedMotion?: boolean } = {}) {
  if (!options.keepStorage) {
    await page.addInitScript(() => {
      if (!sessionStorage.getItem('__nexus_cleared')) {
        localStorage.clear();
        sessionStorage.setItem('__nexus_cleared', '1');
      }
    });
  }
  if (options.reducedMotion ?? true) {
    await page.addInitScript(() => {
      try {
        const raw = localStorage.getItem('nexusrpg-settings-v1');
        const settings = raw ? JSON.parse(raw) : {};
        if (settings.reducedMotion === undefined) localStorage.setItem('nexusrpg-settings-v1', JSON.stringify({ ...settings, reducedMotion: true, textSpeed: 'sofort', music: 0, sfx: 0 }));
      } catch { /* ignorieren */ }
    });
  }
  await page.goto(`/${query}`);
  await page.waitForFunction(() => window.__nexus?.ready === true, null, { timeout: 30_000 });
}

export const view = (page: Page): Promise<View> => page.evaluate(() => window.__nexus!.currentView() as unknown as View);
export const hotspots = (page: Page): Promise<HotspotView[]> => page.evaluate(() => window.__nexus!.hotspots());
export const state = (page: Page) => page.evaluate(() => window.__nexus!.state());

export async function waitForView(page: Page, predicate: (view: View) => boolean, timeout = 10_000): Promise<View> {
  const start = Date.now();
  let last = await view(page);
  while (Date.now() - start < timeout) {
    last = await view(page);
    if (predicate(last)) return last;
    await page.waitForTimeout(50);
  }
  throw new Error(`Zeitüberschreitung beim Warten auf Ansicht. Letzte Ansicht: ${JSON.stringify(last)}`);
}

/** Räumt Blockierendes ab: Cutscenes überspringen, Dialogzeilen weiter; bei Wahlen fragt `chooser` (Standard: letzte wählbare). */
export async function settle(page: Page, options: { chooser?: (view: View) => number | null; maxSteps?: number; skipCutscenes?: boolean } = {}) {
  const maxSteps = options.maxSteps ?? 400;
  for (let step = 0; step < maxSteps; step++) {
    const current = await view(page);
    if (current.cutscene) {
      if (options.skipCutscenes ?? true) await page.evaluate(() => window.__nexus!.skipCutscene());
      else await page.evaluate(() => window.__nexus!.advance());
      await page.waitForTimeout(30);
      continue;
    }
    if (current.dialogue) {
      if (current.dialogue.choices?.length) {
        const pick = options.chooser?.(current) ?? defaultChoice(current);
        if (pick === null) return current;
        await page.evaluate((index) => window.__nexus!.choose(index), pick);
      } else {
        await page.evaluate(() => window.__nexus!.advance());
      }
      await page.waitForTimeout(20);
      continue;
    }
    if (current.overlay) return current;
    if (!current.busy && (current.scene === 'explore' || current.scene === 'title' || current.scene === 'ending')) return current;
    await page.waitForTimeout(40);
  }
  throw new Error('settle(): zu viele Schritte');
}

function defaultChoice(current: View): number | null {
  const choices = (current.dialogue?.choices ?? []).filter((choice) => choice.enabled);
  return choices.length ? choices[choices.length - 1].index : null;
}

/** Spielfigur neben einen Hotspot stellen und mit E interagieren. */
export async function interactWith(page: Page, hotspotId: string) {
  const spot = (await hotspots(page)).find((entry) => entry.id === hotspotId);
  if (!spot) throw new Error(`Hotspot ${hotspotId} nicht sichtbar`);
  await page.evaluate(([x, y]) => window.__nexus!.teleport(x, y), [spot.x, spot.y + 12] as const);
  await page.waitForTimeout(80);
  await page.keyboard.press('e');
}

/** Klick auf einen Kartenpunkt: rechnet über den Kamera-Ausschnitt in Canvas-Koordinaten (Spielfläche 960×540). */
export async function clickMap(page: Page, x: number, y: number) {
  const box = await page.locator('#game canvas').boundingBox();
  const camera = (await view(page)).camera;
  if (!box || !camera) throw new Error('Canvas oder Kamera fehlt');
  await page.mouse.click(box.x + ((x - camera.x) / camera.w) * box.width, box.y + ((y - camera.y) / camera.h) * box.height);
}

export async function holdKey(page: Page, key: string, ms: number) {
  await page.keyboard.down(key);
  await page.waitForTimeout(ms);
  await page.keyboard.up(key);
}

export async function shot(page: Page, name: string) {
  mkdirSync(QA_DIR, { recursive: true });
  await page.screenshot({ path: resolve(QA_DIR, `${name}.png`) });
}

export async function expectNoErrors(page: Page) {
  const errors = await page.evaluate(() => window.__nexus?.errors ?? []);
  expect(errors, errors.join('\n')).toEqual([]);
}

// Typen des Test-Hooks für page.evaluate (Quelle: src/app/testHook.ts).
declare global {
  interface Window {
    __nexus?: {
      ready: boolean;
      errors: string[];
      state(): unknown;
      currentView(): unknown;
      hotspots(): HotspotView[];
      npcs(): { id: string; x: number; y: number; source: string }[];
      warp(act: number): Promise<void>;
      travel(map: string, entry?: string): Promise<void>;
      interact(id: string): boolean;
      talk(id: string): boolean;
      choose(index: number): boolean;
      advance(): boolean;
      skipCutscene(): boolean;
      teleport(x: number, y: number): boolean;
      startDialogue(id: string): boolean;
      playCutscene(id: string): boolean;
      runEffects(effects: unknown[]): boolean;
      giveItem(item: string, qty?: number): boolean;
      setAttr(attribute: string, value: number): boolean;
      addHearts(npc: string, hearts: number): boolean;
      setTime(slot: 'morgen' | 'tag' | 'abend' | 'nacht'): boolean;
      startBattle(encounter: string): boolean;
      winBattle(outcome?: 'win' | 'lose' | 'fled'): boolean;
      battle(): {
        encounter: string; round: number; active: string | null; playerTurn: boolean; finished: boolean; outcome: string | null;
        units: { id: string; team: string; hp: number; maxHp: number; cell: [number, number]; state: string }[];
      } | null;
      battleAction(key: 'move' | 'attack' | 'abilities' | 'items' | 'overwatch' | 'cover' | 'end' | 'flee' | 'interact' | 'weapon'): boolean;
      battleTap(col: number, row: number): boolean;
      idle(): Promise<void>;
      seed(seed: number | null): void;
      walkable(x: number, y: number): boolean | null;
      reachable(x: number, y: number): { end: [number, number]; miss: number; steps: number } | null;
      walkTo(x: number, y: number): boolean;
      placeholders(): string[];
      background(): string | null;
      followers(): { id: string; x: number; y: number }[];
      passersby(): { id: string; sprite: string; x: number; y: number; bubble: string | null }[];
      passerbyBark(id?: string): string | null;
      worldLabels(): { id: string; kind: string; text: string }[];
      objectiveMarker(): { x: number; y: number; kind: string; label: string } | null;
      lighting(): { tint: number; alpha: number; lights: number; darkness: boolean } | null;
      campaign: { content: Record<string, unknown> } | null;
    };
  }
}
