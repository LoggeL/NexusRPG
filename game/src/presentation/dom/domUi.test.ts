// Reine Modelle der DOM-Oberfläche (Bereich dom-ui): Erstellung, Check-Texte, Toasts, Galerie, Plates, Blurhash.
import { describe, expect, it } from 'vitest';
import { ATTR_FREE_POINTS, ATTR_START, createCampaign } from '../../modules/campaign';
import type { ChoiceCheckView, GameContent, QuestView } from '../../modules/contracts';
import { fixtureContent } from '../../modules/__fixtures__/content';
import { decodeBlurhash, isBlurhash } from './blurhash';
import {
  canDecrease, canIncrease, createDraft, decrease, draftProblems, finalAttributes, freePoints, increase, nameProblem, originBoni,
  resetPoints, toCharacterInput,
} from './creationModel';
import { panDuration, panFor, panKeyframes, panModeOf, panTransform, plateTimings, portraitTravel } from './plateModel';
import {
  checkBreakdown, checkReason, checkTooltip, classifyToast, clockModel, galleryEntries, giftedItems, giftLimitText, giftSeenKey,
  groupGiftKnowledge, groupQuests, heartProgress, heartsText, hpModel, missingLabel, savedAtText, slotLine,
} from './viewModels';

const check = (over: Partial<ChoiceCheckView> = {}): ChoiceCheckView => ({
  checkId: 'chip', attribute: 'technik', threshold: 6, value: 4, ok: false, missing: 2, label: '[Technik 6]',
  parts: [{ label: 'Technik', value: 4, source: 'attribut' }], ...over,
});

describe('Charaktererstellung (Modell)', () => {
  const content = fixtureContent();

  it('verteilt genau 4 Punkte, nie unter 3 oder über 10', () => {
    let draft = createDraft(content);
    expect(freePoints(draft)).toBe(ATTR_FREE_POINTS);
    expect(canDecrease(draft, 'technik')).toBe(false);
    expect(decrease(draft, 'technik')).toBe(draft);
    for (let i = 0; i < 6; i++) draft = increase(draft, 'technik');
    expect(draft.attributes.technik).toBe(ATTR_START + ATTR_FREE_POINTS);
    expect(freePoints(draft)).toBe(0);
    expect(canIncrease(draft, 'koerper')).toBe(false);
    draft = decrease(draft, 'technik');
    expect(freePoints(draft)).toBe(1);
    expect(resetPoints(draft).attributes.technik).toBe(ATTR_START);
  });

  it('zeigt den Herkunftsbonus in den Endwerten (höchstens 10)', () => {
    const draft = createDraft(content);
    const origin = content.origins[draft.origin];
    expect(finalAttributes(draft, content)[origin.bonus]).toBe(ATTR_START + 1);
    const maxed = { ...draft, attributes: { ...draft.attributes, [origin.bonus]: 10 } };
    expect(finalAttributes(maxed, content)[origin.bonus]).toBe(10);
  });

  it('prüft Name, Punkte und meldet offene Punkte', () => {
    expect(nameProblem('K')).toMatch(/mindestens 2/);
    expect(nameProblem('Kim')).toBeNull();
    expect(nameProblem('x'.repeat(17))).toMatch(/höchstens 16/);
    expect(nameProblem('<b>Kim')).toMatch(/ungültige/);
    const draft = createDraft(content);
    expect(draftProblems(draft, content)).toEqual(expect.arrayContaining([expect.stringMatching(/Name/), 'Es sind noch 4 Attributpunkte frei.']));
  });

  it('erzeugt eine Eingabe, die die Kampagne annimmt', () => {
    let draft = { ...createDraft(content), name: '  Kim  ' };
    for (const id of ['technik', 'technik', 'reflexe', 'strasse'] as const) draft = increase(draft, id);
    expect(draftProblems(draft, content)).toEqual([]);
    const campaign = createCampaign(content, { seed: 1 });
    const result = campaign.createCharacter(toCharacterInput(draft));
    expect(result.ok).toBe(true);
    expect(campaign.state().player.name).toBe('Kim');
  });

  it('beschreibt Herkunftsboni lesbar', () => {
    const origin = Object.values(content.origins)[0];
    const lines = originBoni({ ...origin, items: { [Object.keys(content.items)[0]]: 2 }, credits: 30, relations: { [Object.keys(content.npcs)[0]]: -100 } }, content);
    expect(lines[0]).toMatch(/^\+1 /);
    expect(lines.some((line) => line.startsWith('Start: ') && line.includes('×2'))).toBe(true);
    expect(lines).toContain('30 Credits');
    expect(lines.some((line) => line.includes('♥ −100'))).toBe(true);
  });
});

describe('Check-Anzeige', () => {
  it('nennt fehlende Punkte in Du-Form', () => {
    expect(missingLabel(1)).toBe('Dir fehlt 1 Punkt');
    expect(missingLabel(2)).toBe('Dir fehlen 2 Punkte');
    expect(missingLabel(0)).toBe('');
    expect(checkReason(check())).toBe('Dir fehlen 2 Punkte Technik');
    expect(checkTooltip(check())).toBe('Dir fehlen 2 Punkte (Wert 4 / 6). Technik 4');
  });

  it('schlüsselt Boni auf und bestätigt erfüllte Checks', () => {
    const passed = check({ ok: true, missing: 0, value: 7, parts: [
      { label: 'Technik', value: 5, source: 'attribut' }, { label: 'Ocular-Chip', value: 2, source: 'cyberware' },
    ] });
    expect(checkBreakdown(passed)).toBe('Technik 5 + Ocular-Chip 2 (Cyberware)');
    expect(checkTooltip(passed)).toBe('Check erfüllt: Wert 7 / 6. Technik 5 + Ocular-Chip 2 (Cyberware)');
    expect(checkReason(passed)).toBe('');
  });
});

describe('Toasts und HUD', () => {
  it('erkennt Herz-Meldungen mit Vorzeichen', () => {
    expect(classifyToast('Frau in Schwarz ♥ +45')).toEqual({ kind: 'heart', text: 'Frau in Schwarz ♥ +45', heart: { name: 'Frau in Schwarz', delta: 45 } });
    expect(classifyToast('Raven ♥ −20').heart).toEqual({ name: 'Raven', delta: -20 });
    expect(classifyToast('+35 XP').kind).toBe('xp');
    expect(classifyToast('−12 Credits').kind).toBe('credits');
    expect(classifyToast('Neue Quest: Probezeit').kind).toBe('quest');
    expect(classifyToast('Erhalten: Synth-Kaffee ×2').kind).toBe('item');
    expect(classifyToast('Stufe 3 erreicht!').kind).toBe('level');
    expect(classifyToast('Irgendwas').kind).toBe('info');
  });

  it('formatiert Uhr, Wochentag und LP-Stufen', () => {
    const model = clockModel(3, 1085, 'abend', 'mi');
    expect(model.time).toBe('18:05');
    expect(model.label).toBe('Mittwoch, Tag 3, 18:05 Uhr (Abend)');
    expect(clockModel(1, 1530, 'nacht', 'mo').time).toBe('01:30');
    expect(hpModel(10, 40)).toEqual({ percent: 25, level: 'crit' });
    expect(hpModel(20, 40).level).toBe('low');
    expect(hpModel(40, 40).level).toBe('ok');
    expect(hpModel(5, 0).percent).toBe(100);
  });
});

describe('Beziehungen und Geschenkwissen', () => {
  it('zeigt Herzen und Fortschritt', () => {
    expect(heartsText(3)).toBe('♥♥♥♡♡♡♡♡♡♡');
    expect(heartsText(12)).toBe('♥'.repeat(10));
    expect(heartProgress(345)).toBe(45);
    expect(heartProgress(-50)).toBeNull();
    expect(heartProgress(1000)).toBeNull();
  });

  it('liest geschenkte Gegenstände aus seen-Schlüsseln und gruppiert nach Geschmack', () => {
    const seen = [giftSeenKey('raven', 'synth-kaffee'), giftSeenKey('raven', 'blume'), giftSeenKey('dante', 'schraube'), 'check:x'];
    expect(giftedItems(seen, 'raven')).toEqual(['synth-kaffee', 'blume']);
    expect(groupGiftKnowledge([{ item: 'a', taste: 'hates' }, { item: 'b', taste: 'loves' }, { item: 'c', taste: 'loves' }]))
      .toEqual([{ taste: 'loves', items: ['b', 'c'] }, { taste: 'hates', items: ['a'] }]);
  });

  it('meldet Geschenk-Tages- und Wochenlimit', () => {
    expect(giftLimitText({ giftDay: 4, giftWeek: 0, giftsThisWeek: 1 }, 4)).toBe('Heute schon beschenkt.');
    expect(giftLimitText({ giftDay: 3, giftWeek: 0, giftsThisWeek: 2 }, 5)).toMatch(/zweimal/);
    expect(giftLimitText({ giftDay: 3, giftWeek: 0, giftsThisWeek: 2 }, 8)).toBeNull();
    expect(giftLimitText(undefined, 1)).toBeNull();
  });
});

describe('Galerie', () => {
  it('führt nur Szenen mit Bild, gesehene mit ihren Bildern und Bildunterschriften', () => {
    const content: GameContent = { ...fixtureContent() };
    content.cutscenes = {
      a: { id: 'a', title: 'Ankunft', beats: [{ image: 'cut-a', caption: 'Noxius.', pan: 'in' }, { image: 'cut-a' }, { image: 'cut-b', pan: 'left' }] },
      schwarz: { id: 'schwarz', beats: [{ image: 'black', caption: 'Ende.' }] },
      aus: { id: 'aus', gallery: false, beats: [{ image: 'cut-c' }] },
    };
    const entries = galleryEntries(content, new Set(['a']));
    expect(entries.map((entry) => entry.id)).toEqual(['a']);
    expect(entries[0].seen).toBe(true);
    expect(entries[0].images).toEqual([{ image: 'cut-a', caption: 'Noxius.', pan: 'in' }, { image: 'cut-b', caption: 'Noxius.', pan: 'left' }]);
    expect(galleryEntries(content, new Set())[0].seen).toBe(false);
  });
});

describe('Questlog', () => {
  it('gruppiert nach Status und sortiert Hauptquests nach vorn', () => {
    const view = (id: string, kind: QuestView['quest']['kind'], status: QuestView['status'], title = id): QuestView =>
      ({ quest: { id, kind, title, steps: [] }, status, steps: [] });
    const groups = groupQuests([view('n', 'side', 'active', 'B'), view('m', 'main', 'active', 'Z'), view('d', 'side', 'done'), view('x', 'job', 'inactive')]);
    expect(groups.active.map((entry) => entry.quest.id)).toEqual(['m', 'n']);
    expect(groups.done.map((entry) => entry.quest.id)).toEqual(['d']);
    expect(groups.failed).toEqual([]);
  });
});

describe('Spielstand-Anzeige', () => {
  it('fasst einen Platz zusammen', () => {
    expect(slotLine({ slot: 1, empty: true }, (id) => id)).toBe('Leer');
    expect(slotLine({ slot: 2, empty: false, corrupt: true }, (id) => id)).toBe('Beschädigt');
    expect(slotLine({ slot: 3, empty: false, name: 'Kim', level: 3, day: 4, minutes: 1100, map: 'neon-gasse' }, () => 'Neon-Gasse'))
      .toBe('Kim · Stufe 3 · Tag 4, 18:20 · Neon-Gasse');
    expect(savedAtText(new Date(2026, 10, 8, 9, 5).getTime())).toBe('08.11.2026, 09:05 Uhr');
    expect(savedAtText(undefined)).toBe('');
  });
});

describe('Plates (Ken Burns)', () => {
  it('kennt alle Fahrten und hält das Bild im Rahmen', () => {
    expect(panFor('none')).toBeUndefined();
    for (const mode of ['in', 'out', 'left', 'right'] as const) {
      const path = panFor(mode)!;
      expect(panModeOf(path)).toBe(mode);
      for (const point of [path.from, path.to]) {
        const match = /scale\(([\d.]+)\) translate\((-?[\d.]+)%, (-?[\d.]+)%\)/.exec(panTransform(point))!;
        const zoom = Number(match[1]);
        const limit = ((zoom - 1) / (2 * zoom)) * 100 + 1e-6;
        expect(Math.abs(Number(match[2]))).toBeLessThanOrEqual(limit);
        expect(Math.abs(Number(match[3]))).toBeLessThanOrEqual(limit);
      }
    }
    expect(panTransform([0.5, 0.5, 1])).toBe('scale(1) translate(0%, 0%)');
  });

  it('steht bei reduzierter Bewegung still', () => {
    const frames = panKeyframes(panFor('left'), true);
    expect(frames[0]).toEqual(frames[1]);
    expect(panKeyframes(undefined, false)).toEqual([{ transform: 'none' }, { transform: 'none' }]);
    expect(plateTimings(true)).toEqual({ letterbox: 0, fade: 0, cross: 0, glitch: 0, out: 0 });
    expect(plateTimings(false).cross).toBeGreaterThan(0);
    expect(portraitTravel('left')).toEqual(['72% 50%', '28% 50%']);
    expect(panDuration(2, 20000)).toBe(20000);
    expect(panDuration(2)).toBe(15000);
  });
});

describe('Blurhash', () => {
  it('dekodiert einen gültigen Hash zu deckenden Pixeln', () => {
    const hash = 'LEHV6nWB2yk8pyo0adR*.7kCMdnj';
    expect(isBlurhash(hash)).toBe(true);
    const pixels = decodeBlurhash(hash, 8, 6);
    expect(pixels.length).toBe(8 * 6 * 4);
    for (let i = 3; i < pixels.length; i += 4) expect(pixels[i]).toBe(255);
    expect(new Set(Array.from(pixels.filter((_, index) => index % 4 === 0))).size).toBeGreaterThan(1);
  });

  it('lehnt kaputte Hashes ab', () => {
    expect(isBlurhash('')).toBe(false);
    expect(isBlurhash('LEHV6n')).toBe(false);
    expect(isBlurhash('LEHV6nWB2yk8pyo0adR*.7kCMdn€')).toBe(false);
    expect(() => decodeBlurhash('kaputt', 4, 4)).toThrow();
  });
});
