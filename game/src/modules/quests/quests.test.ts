import { describe, expect, it } from 'vitest';
import { fixtureContent } from '../__fixtures__/content';
import { createCampaign, findContentProblems } from '../campaign';
import type { CharacterInput, GameContent, QuestDef } from '../contracts';
import {
  QUEST_KIND_LABELS, alternativeParents, objectiveOf, questLog, questMarkers, questProblems, questProgress, questStatusOf,
  questStepViews, rewardEffects, rewardLines, stepAlternatives,
} from './index';

const input: CharacterInput = {
  name: 'Testfigur', look: 'a', origin: 'gosse',
  attributes: { technik: 5, koerper: 4, reflexe: 4, ausstrahlung: 3, strasse: 3 },
};

/** Quest mit zwei Lösungswegen (reden oder schleichen), Folgeschritt und Belohnung. */
const WEG: QuestDef = {
  id: 'weg', kind: 'side', title: 'Der Weg rein', giver: 'raven',
  steps: [
    { id: 'reden', text: 'Rede dich an der Tür vorbei.', done: { flag: 'weg-reden' }, optional: true, marker: { map: 'gasse', at: [300, 300] } },
    { id: 'schleichen', text: 'Schleich durch den Hinterhof.', done: { flag: 'weg-schleichen' }, optional: true, marker: { map: 'bar', at: [200, 200] } },
    { id: 'drin', text: 'Komm ins Gebäude.', done: { any: [{ questStep: 'weg', step: 'reden' }, { questStep: 'weg', step: 'schleichen' }] } },
    { id: 'chef', text: 'Sprich mit dem Chef.', done: { flag: 'weg-chef' }, when: { questStep: 'weg', step: 'drin' }, marker: { map: 'bar' } },
    { id: 'trinkgeld', text: 'Gib Trinkgeld (optional).', done: { flag: 'weg-trinkgeld' }, optional: true },
  ],
  reward: { xp: 30, credits: 40, items: { kaffee: 2 }, relations: { raven: 10 }, rep: { unterstadt: 5 } },
};

function content(): GameContent {
  const base = fixtureContent();
  base.quests.weg = WEG;
  base.quests.kaputt = {
    id: 'kaputt', kind: 'side', title: 'Kaputte Belohnung',
    steps: [{ id: 'los', text: 'Los.', done: { flag: 'kaputt-los' } }],
    reward: { credits: 10, items: { gibtsnicht: 1 } },
  };
  base.quests.manuell = {
    id: 'manuell', kind: 'personal', title: 'Ohne Automatik', autoComplete: false,
    steps: [{ id: 'a', text: 'Erledige a.', done: { flag: 'manuell-a' } }],
    reward: { credits: 5 },
  };
  return base;
}

function started(c: GameContent = content()) {
  const campaign = createCampaign(c, { storage: null, seed: 11, random: () => 0.5 });
  expect(campaign.createCharacter(input).ok).toBe(true);
  return campaign;
}

describe('Fortschritt', () => {
  it('rastet sichtbare, erledigte Schritte ein und erkennt den Abschluss', () => {
    const quest = content().quests.ankunft;
    const entry = { status: 'active' as const, steps: [], startedDay: 1 };
    const flags = new Set<string>();
    const evaluate = (c?: unknown) => {
      if (!c) return true;
      const cond = c as Record<string, string>;
      if ('visited' in cond) return flags.has('bar');
      if ('met' in cond) return flags.has('raven');
      if ('flag' in cond) return flags.has(cond.flag);
      return false;
    };
    expect(questProgress(quest, entry, evaluate)).toEqual({ fail: false, steps: [], complete: false });
    flags.add('bar'); flags.add('raven');
    expect(questProgress(quest, entry, evaluate)).toEqual({ fail: false, steps: ['bar', 'raven'], complete: true });
    expect(questProgress(quest, { ...entry, status: 'done' }, evaluate).steps).toEqual([]);
  });

  it('lässt den Fehlschlag allem anderen vorgehen', () => {
    const campaign = started();
    campaign.apply([{ startQuest: 'chip' }]);
    campaign.apply([{ give: 'chip' }, { setFlag: 'chip-verloren' }]);
    const state = campaign.state();
    expect(state.quests.chip).toMatchObject({ status: 'failed', steps: [], endedDay: 1 });
    expect(state.inventory.messer).toBeUndefined(); // keine Belohnung
    expect(state.tracked).toBeNull();
    expect(questStatusOf(state, 'chip')).toBe('failed');
    expect(questStatusOf(state, 'weg')).toBe('inactive');
  });

  it('schließt mit `autoComplete: false` nur per Effekt ab', () => {
    const campaign = started();
    campaign.apply([{ startQuest: 'manuell' }, { setFlag: 'manuell-a' }]);
    expect(campaign.state().quests.manuell).toMatchObject({ status: 'active', steps: ['a'] });
    const credits = campaign.state().credits;
    campaign.apply([{ completeQuest: 'manuell' }]);
    expect(campaign.state().quests.manuell.status).toBe('done');
    expect(campaign.state().credits).toBe(credits + 5);
    campaign.apply([{ completeQuest: 'manuell' }]);
    expect(campaign.state().credits).toBe(credits + 5); // nur einmal
  });
});

describe('Lösungswege', () => {
  it('erkennt Alternativen eines Pflichtschritts', () => {
    expect(stepAlternatives(WEG, WEG.steps[2])).toEqual(['reden', 'schleichen']);
    expect(stepAlternatives(WEG, WEG.steps[0])).toEqual([]);
    expect(alternativeParents(WEG, 'schleichen')).toEqual(['drin']);
    expect(alternativeParents(WEG, 'chef')).toEqual([]);
  });

  it('zeigt alle offenen Wege als Ziel und überspringt die übrigen nach einer Lösung', () => {
    const campaign = started();
    campaign.apply([{ startQuest: 'weg' }]);
    const objective = objectiveOf(campaign.content, campaign.state(), campaign.evaluate);
    expect(objective).toMatchObject({
      quest: 'weg', step: 'drin', text: 'Komm ins Gebäude.', kind: 'side', optional: false, tracked: true,
      marker: { map: 'gasse', at: [300, 300] },
    });
    expect(objective?.alternatives.map(entry => entry.step)).toEqual(['reden', 'schleichen']);
    expect(questMarkers(campaign.content, campaign.state(), campaign.evaluate, 'bar')).toEqual([
      { quest: 'weg', step: 'schleichen', title: 'Der Weg rein', text: 'Schleich durch den Hinterhof.', map: 'bar', at: [200, 200], tracked: true, optional: true },
    ]);
    // Chef ist erst nach dem Eintritt sichtbar.
    expect(campaign.quests()[0].steps.map(view => view.step.id)).toEqual(['reden', 'schleichen', 'drin', 'trinkgeld']);

    campaign.apply([{ setFlag: 'weg-schleichen' }]);
    const steps = questStepViews(WEG, campaign.state().quests.weg, campaign.evaluate);
    expect(steps.map(view => [view.step.id, view.state])).toEqual([
      ['reden', 'skipped'], ['schleichen', 'done'], ['drin', 'done'], ['chef', 'open'], ['trinkgeld', 'open'],
    ]);
    expect(objectiveOf(campaign.content, campaign.state(), campaign.evaluate)).toMatchObject({ step: 'chef', marker: { map: 'bar' }, alternatives: [] });
    expect(questMarkers(campaign.content, campaign.state(), campaign.evaluate, 'gasse')).toEqual([]);
  });

  it('rastet verdeckte Schritte in Folgerunden derselben Änderung ein', () => {
    const campaign = started();
    campaign.apply([{ startQuest: 'weg' }, { setFlag: 'weg-chef' }]);
    expect(campaign.state().quests.weg.steps).toEqual([]); // „chef“ noch nicht sichtbar
    const xp = campaign.state().player.xp;
    const credits = campaign.state().credits;
    const outcome = campaign.apply([{ setFlag: 'weg-reden' }]);
    const state = campaign.state();
    expect(state.quests.weg).toMatchObject({ status: 'done', steps: ['reden', 'drin', 'chef'], endedDay: 1 });
    expect(outcome.messages).toContain('Quest abgeschlossen: Der Weg rein');
    expect(outcome.requests).toContainEqual({ sfx: 'success' });
    expect(state.player.xp).toBe(xp + 30);
    expect(state.credits).toBe(credits + 40);
    expect(state.inventory.kaffee).toBe(5);
    expect(state.relations.raven.points).toBe(10);
    expect(state.reputation.unterstadt).toBe(15);
    // Nach dem Abschluss sind offene Wege und optionale Schritte übersprungen.
    const views = questLog(campaign.content, campaign.state(), campaign.evaluate)[0].steps;
    expect(views.filter(view => view.state === 'skipped').map(view => view.step.id)).toEqual(['schleichen', 'trinkgeld']);
  });
});

describe('Belohnungen', () => {
  it('übersetzt Belohnungen in Effekte und lesbare Zeilen', () => {
    expect(rewardEffects(WEG.reward)).toEqual([
      { xp: 30 }, { credits: 40 }, { give: 'kaffee', qty: 2 }, { relation: 'raven', delta: 10 }, { rep: 'unterstadt', delta: 5 },
    ]);
    expect(rewardEffects(undefined)).toEqual([]);
    expect(rewardLines(content(), WEG.reward)).toEqual(['30 XP', '40 Credits', 'Synth-Kaffee ×2', 'Raven ♥ +10', 'Unterstadt +5']);
    expect(rewardLines(content(), { relations: { raven: -20 }, items: { chip: 1 } })).toEqual(['Chip', 'Raven ♥ −20']);
  });

  it('gibt im Nachlauf die übrigen Belohnungen, auch wenn eine kaputt ist', () => {
    const campaign = started();
    campaign.apply([{ startQuest: 'kaputt' }]);
    const credits = campaign.state().credits;
    const outcome = campaign.apply([{ setFlag: 'kaputt-los' }]);
    expect(campaign.state().quests.kaputt.status).toBe('done');
    expect(campaign.state().credits).toBe(credits + 10);
    expect(outcome.messages).toContain('Unbekannter Gegenstand: gibtsnicht');
  });

  it('lehnt `completeQuest` mit kaputter Belohnung transaktional ab', () => {
    const campaign = started();
    campaign.apply([{ startQuest: 'kaputt' }]);
    const before = campaign.state();
    campaign.apply([{ completeQuest: 'kaputt' }]);
    expect(campaign.state()).toBe(before);
    expect(campaign.state().quests.kaputt.status).toBe('active');
  });
});

describe('Questlog und Ziel', () => {
  it('sortiert aktiv, abgeschlossen, gescheitert und beschriftet', () => {
    const campaign = started();
    campaign.apply([{ startQuest: 'chip' }, { startQuest: 'weg' }, { startQuest: 'manuell' }]);
    campaign.apply([{ setFlag: 'chip-verloren' }, { completeQuest: 'manuell' }]);
    const log = questLog(campaign.content, campaign.state(), campaign.evaluate);
    expect(log.map(view => [view.quest.id, view.statusLabel])).toEqual([['weg', 'Aktiv'], ['manuell', 'Abgeschlossen'], ['chip', 'Gescheitert']]);
    expect(log[0]).toMatchObject({ kindLabel: 'Nebenquest', giver: 'Raven', tracked: false, startedDay: 1, rewards: expect.arrayContaining(['40 Credits']) });
    expect(log[1].endedDay).toBe(1);
    expect(QUEST_KIND_LABELS.main).toBe('Hauptquest');
  });

  it('folgt der verfolgten Quest, sonst der Art (Haupt vor Neben)', () => {
    const campaign = started();
    campaign.apply([{ startQuest: 'weg' }]);
    campaign.apply([{ setFlag: 'angekommen' }]);
    expect(campaign.state().tracked).toBe('weg');
    expect(campaign.objective()?.quest).toBe('weg');
    campaign.track(null);
    expect(campaign.objective()).toMatchObject({ quest: 'ankunft', text: 'Geh in die Bar.', marker: { map: 'bar' } });
    campaign.track('weg');
    expect(campaign.objective()?.quest).toBe('weg');
    campaign.track('chip'); // nicht aktiv → ignoriert
    expect(campaign.state().tracked).toBe('weg');
  });

  it('wählt optionale Schritte erst, wenn keine Pflicht mehr offen ist', () => {
    const c = content();
    c.quests.weg = { ...WEG, autoComplete: false };
    const campaign = started(c);
    campaign.apply([{ startQuest: 'weg' }, { setFlag: 'weg-reden' }]);
    campaign.apply([{ setFlag: 'weg-chef' }]);
    expect(campaign.objective()).toMatchObject({ quest: 'weg', text: 'Gib Trinkgeld (optional).' });
    expect((campaign.objective() as { optional?: boolean }).optional).toBe(true);
    campaign.apply([{ setFlag: 'weg-trinkgeld' }]);
    expect(campaign.objective()).toBeNull();
  });

  it('markiert nur offene Schritte aktiver Quests', () => {
    const campaign = started();
    campaign.apply([{ startQuest: 'weg' }, { setFlag: 'angekommen' }]);
    const all = questMarkers(campaign.content, campaign.state(), campaign.evaluate);
    expect(all.map(marker => `${marker.quest}/${marker.step}:${marker.tracked}`)).toEqual([
      'weg/reden:true', 'weg/schleichen:true', 'ankunft/bar:false',
    ]);
  });
});

describe('Inhaltsprüfung', () => {
  it('meldet unvollständige Quests und widersprüchliche Lösungswege', () => {
    expect(questProblems(content())).toEqual([]);
    const c = content();
    c.quests.leer = { id: 'leer', kind: 'side', title: 'Leer', steps: [] };
    c.quests.optional = { id: 'optional', kind: 'side', title: 'Optional', steps: [{ id: 'x', text: 'x', done: { flag: 'x' }, optional: true }] };
    c.quests.weg = { ...WEG, steps: WEG.steps.map(step => (step.id === 'reden' ? { ...step, optional: false } : step)), reward: { xp: -1, items: { kaffee: 0 } } };
    const problems = questProblems(c);
    expect(problems).toEqual(expect.arrayContaining([
      'Quest leer: keine Schritte',
      expect.stringContaining('Quest optional: nur optionale Schritte'),
      'Quest weg/reden: Lösungsweg von „drin“ sollte optional sein',
      'Quest weg: ungültige XP-Belohnung',
      'Quest weg: ungültige Menge für „kaffee“',
    ]));
    expect(findContentProblems(c)).toEqual(expect.arrayContaining(['Quest leer: keine Schritte']));
  });
});
