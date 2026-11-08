// Ablauf der Kampfdarstellung mit einem Test-Regelport: Zugschleife, Auswahl, Tastatur, Touch, Ergebnis.
import { describe, expect, it } from 'vitest';
import type { SessionEvent, SessionState } from './rulesPort';
import { FAKE_CONTENT, FakeSession } from './__fixtures__/fakeSession';
import { BattleController, buildAction, objectiveText, resultModel, STALL_LIMIT, turnOrder, type BattleHudView, type BattleWorldView, type Highlights, type HudModel, type ResultModel } from './controller';

const tick = () => new Promise<void>((resolve) => setTimeout(resolve, 0));
async function settle(times = 6) { for (let i = 0; i < times; i++) await tick(); }

function setup(session = new FakeSession(), touch = false) {
  const played: SessionEvent[] = [];
  const toasts: string[] = [];
  const logs: string[] = [];
  const banners: string[] = [];
  let highlights: Highlights | null = null;
  let model: HudModel | null = null;
  let result: ResultModel | null = null;
  const world: BattleWorldView = {
    setHighlights: (value) => { highlights = value; },
    sync: (_state: Readonly<SessionState>) => {},
    focus: () => {},
    play: async (event) => { played.push(event); },
  };
  const hud: BattleHudView = {
    update: (value) => { model = value; },
    banner: async (text, sub) => { banners.push(`${text}|${sub ?? ''}`); },
    say: async () => {},
    log: (line) => { logs.push(line); },
    toast: (text) => { toasts.push(text); },
    showResult: async (value) => { result = value; },
  };
  const controller = new BattleController({
    port: session, content: FAKE_CONTENT, world, hud, inventory: () => ({}), touch: () => touch,
  });
  return {
    session, controller, played, toasts, logs, banners,
    get highlights() { return highlights as Highlights | null; },
    get model() { return model as HudModel | null; },
    get result() { return result as ResultModel | null; },
  };
}

describe('BattleController', () => {
  it('zeigt Startbanner, Zugbanner und die Aktionsleiste 1–8', async () => {
    const t = setup();
    void t.controller.run();
    await settle();
    expect(t.banners[0]).toBe('Testkampf|Besiege alle Gegner.');
    expect(t.banners).toContain('Dein Zug|Runde 1');
    expect(t.controller.isPlayerTurn).toBe(true);
    const actions = t.model?.actions ?? [];
    expect(actions.map((entry) => entry.hotkey)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(actions.map((entry) => entry.label)).toEqual(['Bewegen', 'Angriff', 'Fähigkeiten', 'Gegenstand', 'Überwachung', 'Deckung', 'Zug beenden', 'Fliehen']);
    // Gegner e1 steht 5 Felder entfernt: Fernkampf (Reichweite 5) erreicht ihn.
    expect(actions.find((entry) => entry.key === 'attack')?.enabled).toBe(true);
    expect(t.highlights?.reach.length).toBeGreaterThan(5);
    expect(t.model?.order.map((entry) => entry.id)).toEqual(['player', 'crew', 'e1', 'e2']);
  });

  it('Maus: Hover zeigt Pfadvorschau, Klick bewegt', async () => {
    const t = setup();
    void t.controller.run();
    await settle();
    t.controller.hover([3, 3]);
    expect(t.highlights?.path).toEqual([[1, 3], [2, 3], [3, 3]]);
    expect(t.model?.target?.lines[0]).toBe('2 Felder · 1 AP');
    t.controller.tap([3, 3], 'mouse');
    await settle();
    expect(t.session.performed[0]).toEqual({ type: 'move', to: [3, 3] });
    expect(t.played.some((event) => event.type === 'move')).toBe(true);
    expect(t.session.state().units[0].cell).toEqual([3, 3]);
  });

  it('Touch: erstes Tippen zeigt Vorschau, zweites führt aus', async () => {
    const t = setup(new FakeSession(), true);
    void t.controller.run();
    await settle();
    t.controller.tap([2, 3], 'touch');
    expect(t.session.performed).toHaveLength(0);
    expect(t.model?.pending).toBe(true);
    t.controller.tap([2, 3], 'touch');
    await settle();
    expect(t.session.performed[0]).toEqual({ type: 'move', to: [2, 3] });
  });

  it('Tastatur: 2 wählt Angriff, Pfeile wechseln Ziele, Enter greift an, Esc bricht ab', async () => {
    const t = setup();
    void t.controller.run();
    await settle();
    t.controller.intent({ type: 'digit', value: 2 });
    expect(t.model?.selected).toBe('attack');
    expect(t.highlights?.targets.map((mark) => mark.unit)).toEqual(['e1']);
    expect(t.model?.target?.lines).toContain('70 % Trefferchance');
    expect(t.model?.target?.lines).toContain('Schaden 3–5');
    expect(t.model?.target?.lines).toContain('Ziel in halbe Deckung');
    t.controller.intent({ type: 'cancel' });
    expect(t.model?.selected).toBeNull();
    t.controller.intent({ type: 'digit', value: 2 });
    t.controller.intent({ type: 'nav', dir: 'right' });
    t.controller.intent({ type: 'interact' });
    await settle();
    expect(t.session.performed[0]).toEqual({ type: 'attack', target: 'e1' });
    expect(t.logs.some((line) => line.includes('trifft e1'))).toBe(true);
  });

  it('Fähigkeiten-Menü: 3 öffnet, Ziffer wählt; Selbstziel wirkt sofort, Abklingzeit sperrt', async () => {
    const t = setup();
    void t.controller.run();
    await settle();
    t.session.state().units[0].cooldowns.aufputschen = 2;
    t.controller.intent({ type: 'digit', value: 3 });
    expect(t.model?.menu?.entries.map((entry) => entry.label)).toEqual(['Aufputschen', 'Störsignal']);
    const blocked = t.model?.menu?.entries[0];
    expect(blocked?.enabled).toBe(false);
    expect(blocked?.reason).toBe('Abklingzeit: noch 2 Runden.');
    t.controller.intent({ type: 'digit', value: 1 });
    expect(t.toasts).toContain('Abklingzeit: noch 2 Runden.');
    expect(t.session.performed).toHaveLength(0);
    t.session.state().units[0].cooldowns.aufputschen = 0;
    t.controller.intent({ type: 'digit', value: 1 });
    await settle();
    expect(t.session.performed[0]).toEqual({ type: 'ability', ability: 'aufputschen', target: 'player' });
  });

  it('Gegenstand mit Flächenziel: Reichweite, Wirkungsbereich und Feld in der Aktion', async () => {
    const t = setup();
    void t.controller.run();
    await settle();
    t.controller.intent({ type: 'digit', value: 4 });
    expect(t.model?.menu?.entries.map((entry) => entry.label)).toEqual(['Medkit', 'Splittergranate']);
    t.controller.intent({ type: 'digit', value: 2 });
    expect(t.highlights?.range.length).toBeGreaterThan(10);
    t.controller.hover([4, 3]);
    expect(t.highlights?.area).toHaveLength(5);
    t.controller.tap([4, 3], 'mouse');
    await settle();
    expect(t.session.performed[0]).toEqual({ type: 'item', item: 'rauchgranate', cell: [4, 3] });
  });

  it('beendet den Zug automatisch ohne AP und lässt die Gegner sichtbar ziehen', async () => {
    const t = setup();
    void t.controller.run();
    await settle();
    t.controller.action('cover');
    await settle();
    // cover setzt AP auf 0 → automatisches Zugende → crew ist dran
    expect(t.session.performed.map((action) => action.type)).toEqual(['cover', 'end']);
    expect(t.session.state().active).toBe('crew');
    t.controller.action('end');
    await settle(20);
    expect(t.session.aiCalls).toBeGreaterThan(0);
    expect(t.banners).toContain('Gegnerzug|Runde 1');
    expect(t.played.some((event) => event.type === 'move' && event.unit === 'e1')).toBe(true);
    expect(t.session.state().active).toBe('player');
    expect(t.banners).toContain('Dein Zug|Runde 2');
  });

  it('erzwingt das Zugende, wenn die KI keinen Fortschritt macht', async () => {
    const t = setup(new FakeSession({ stallAi: true }));
    void t.controller.run();
    await settle();
    t.controller.action('end');
    await settle();
    t.controller.action('end');
    await settle(30);
    expect(t.session.aiCalls).toBeGreaterThanOrEqual(STALL_LIMIT);
    expect(t.session.performed.filter((action) => action.type === 'end').length).toBeGreaterThanOrEqual(3);
  });

  it('Sieg zeigt Belohnungen aus Begegnung und Kampf', async () => {
    const t = setup(new FakeSession({ enemyHp: 4 }));
    const running = t.controller.run();
    await settle();
    // e1 mit zwei Treffern (Treffer, Fehlschuss, Treffer) – der Rest per Test-Hilfe
    for (const unit of t.session.state().units) if (unit.team === 'enemy' && unit.id === 'e2') unit.state = 'down';
    t.controller.action('attack');
    t.controller.tap([6, 3], 'mouse');
    await settle(10);
    const result = await running;
    expect(result?.outcome).toBe('win');
    expect(t.result?.title).toBe('Sieg!');
    expect(t.result?.rewards).toEqual([
      { label: 'Erfahrung', value: '+50 XP' },
      { label: 'Credits', value: '+30 ¢' },
      { label: 'Kaffee', value: '2×' },
    ]);
    expect(t.result?.notes[0]).toContain('crew: Beziehung +5');
  });

  it('Fliehen beendet mit „fled“; Abbruch von außen liefert null', async () => {
    const t = setup();
    const running = t.controller.run();
    await settle();
    t.controller.intent({ type: 'digit', value: 8 });
    expect((await running)?.outcome).toBe('fled');
    const u = setup();
    const aborted = u.controller.run();
    await settle();
    u.controller.abort();
    expect(await aborted).toBeNull();
  });

  it('Fehler der Regeln erscheinen als Meldung, der Zug bleibt offen', async () => {
    const t = setup();
    void t.controller.run();
    await settle();
    t.controller.tap([11, 0], 'mouse'); // nicht erreichbar → nur Auswahl, keine Aktion
    expect(t.session.performed).toHaveLength(0);
    t.session.perform = () => ({ ok: false, error: 'Feld nicht erreichbar.' });
    t.controller.tap([2, 3], 'mouse');
    await settle();
    expect(t.toasts).toContain('Feld nicht erreichbar.');
    expect(t.controller.isPlayerTurn).toBe(true);
  });
});

describe('Hilfen', () => {
  it('Missionsziel-Texte', () => {
    expect(objectiveText(undefined)).toBe('Besiege alle Gegner.');
    expect(objectiveText({ kind: 'survive', rounds: 3 })).toBe('Halte 3 Runden durch.');
    expect(objectiveText({ kind: 'hack', cell: [1, 1], ap: 2 })).toBe('Hacke das Terminal (2 AP).');
  });

  it('Zugreihenfolge beginnt bei der aktiven Einheit und überspringt Ausgeschaltete', () => {
    const session = new FakeSession();
    const state = session.state();
    state.units[2].state = 'down';
    expect(turnOrder({ ...state, active: 'crew' })).toEqual(['crew', 'e2', 'player']);
  });

  it('Aktionen mit Ziel', () => {
    expect(buildAction({ action: { type: 'attack' } }, { unit: 'e1' })).toEqual({ type: 'attack', target: 'e1' });
    expect(buildAction({ action: { type: 'ability', ability: 'x' } }, { cell: [2, 2] })).toEqual({ type: 'ability', ability: 'x', cell: [2, 2] });
    expect(buildAction({ action: { type: 'item', item: 'medkit' } }, { unit: 'crew' })).toEqual({ type: 'item', item: 'medkit', target: 'crew' });
  });

  it('Niederlage verweist auf den Unterschlupf', () => {
    const session = new FakeSession();
    const model = resultModel(session, FAKE_CONTENT, { encounter: 'fake', outcome: 'lose', playerHp: 0 });
    expect(model.title).toBe('Niederlage');
    expect(model.rewards).toEqual([]);
    expect(model.notes[0]).toContain('Unterschlupf');
  });
});
