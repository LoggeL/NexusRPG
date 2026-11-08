import { describe, expect, it } from 'vitest';
import { fixtureContent } from '../__fixtures__/content';
import { createInitialState, evaluateCondition } from '../campaign';
import type { CharacterCyberwareDef, CharacterItemDef, CharacterNpcDef, CharacterOriginDef, CharacterPerkDef, CheckBuff } from '../character';
import type { CheckDef, GameContent, GameState } from '../contracts';
import {
  bonusKind, breakdownText, buffApplies, checkLabel, checkSeenKey, checkXp, evaluateCheck, missingText,
  remainingBuffs, resolveCheck, ruleApplies, type CheckSubject,
} from './index';

function setup(patch: (state: GameState, content: GameContent) => void = () => undefined) {
  const content = fixtureContent();
  const state = createInitialState(content, 1);
  state.player.created = true;
  state.player.origin = 'gosse';
  state.player.attributes = { technik: 5, koerper: 4, reflexe: 4, ausstrahlung: 3, strasse: 4 };
  patch(state, content);
  return { content, state };
}

const subjectOf = (content: GameContent, state: GameState, buffs?: CheckBuff[]): CheckSubject => ({
  content, state, evaluate: c => evaluateCondition(content, state, c), ...(buffs ? { buffs } : {}),
});

const check = (patch: Partial<CheckDef> = {}): CheckDef => ({ id: 'probe', attribute: 'technik', threshold: 6, ...patch });

describe('Grundlagen', () => {
  it('löst Verweise auf und verwirft kaputte Formen', () => {
    const content = fixtureContent();
    expect(resolveCheck(content, 'chip')?.attribute).toBe('technik');
    expect(resolveCheck(content, 'nichts')).toBeNull();
    expect(resolveCheck(content, undefined)).toBeNull();
    expect(resolveCheck(content, check())?.id).toBe('probe');
    expect(resolveCheck(content, { id: 'x', attribute: 'glueck', threshold: 5 } as never)).toBeNull();
    expect(resolveCheck(content, { id: 'x', attribute: 'technik' } as never)).toBeNull();
  });

  it('vergibt 15 + 5 × Grundschwelle XP, außer der Inhalt legt sie fest', () => {
    expect(checkXp(check({ threshold: 6 }))).toBe(45);
    expect(checkXp(check({ threshold: 3 }))).toBe(30);
    expect(checkXp(check({ xp: 0 }))).toBe(0);
    expect(checkSeenKey('probe')).toBe('check:probe');
  });

  it('beschriftet mit Attribut und wirksamer Schwelle', () => {
    expect(checkLabel(check())).toBe('[Technik 6]');
    expect(checkLabel(check({ attribute: 'koerper', threshold: 5 }))).toBe('[Körper 5]');
    expect(checkLabel(check(), { threshold: 8 })).toBe('[Technik 8]');
    expect(checkLabel(check({ attribute: 'koerper' }), { threshold: 6, usedAttribute: 'ausstrahlung' })).toBe('[Ausstrahlung 6]');
    expect(checkLabel(check({ label: '[Hack]' }), { threshold: 9 })).toBe('[Hack]');
  });

  it('nennt fehlende Punkte in Einzahl und Mehrzahl', () => {
    expect(missingText({ ok: false, missing: 1, attributeLabel: 'Technik' })).toBe('Es fehlt 1 Punkt Technik.');
    expect(missingText({ ok: false, missing: 3, attributeLabel: 'Straße' })).toBe('Es fehlen 3 Punkte Straße.');
    expect(missingText({ ok: true, missing: 0, attributeLabel: 'Technik' })).toBe('');
  });
});

describe('Auswertung', () => {
  it('besteht bei Wert ≥ Schwelle und nennt fehlende Punkte', () => {
    const { content, state } = setup();
    const low = evaluateCheck(subjectOf(content, state), check());
    expect(low).toMatchObject({ value: 5, threshold: 6, baseThreshold: 6, ok: false, missing: 1, autoPass: null, visible: true, passedBefore: false });
    const exact = evaluateCheck(subjectOf(content, state), check({ threshold: 5 }));
    expect(exact).toMatchObject({ ok: true, missing: 0 });
  });

  it('schlüsselt Attribut, Cyberware, Kleidung, Perk, Gegenstand, Herkunft, Begleiter und Beziehung auf', () => {
    const { content, state } = setup((s, c) => {
      (c.perks as Record<string, CharacterPerkDef>).bastler.checkBonus = [{ tags: ['hacken'], value: 1 }];
      (c.cyberware as Record<string, CharacterCyberwareDef>).optik.attributes = { technik: 1 };
      (c.cyberware as Record<string, CharacterCyberwareDef>).optik.checkBonus = [{ tags: ['hacken'], value: 1, label: 'Zielhilfe' }];
      (c.items as Record<string, CharacterItemDef>).jacke.wear = { attributes: { technik: 1 }, checkBonus: [{ attribute: 'technik', value: 1 }] };
      (c.items as Record<string, CharacterItemDef>).dietrich.checkBonus = [{ tags: ['hacken'], value: 2 }];
      (c.origins as Record<string, CharacterOriginDef>).gosse.checkBonus = [{ attribute: 'technik', value: 1 }];
      (c.npcs as Record<string, CharacterNpcDef>).raven.partyCheckBonus = [{ tags: ['hacken'], value: 1 }];
      s.player.perks = ['bastler'];
      s.player.cyberware = { augen: 'optik' };
      s.inventory.jacke = 1;
      s.inventory.dietrich = 1;
      s.player.equipment = { kleidung: 'jacke' };
      s.recruited = ['raven'];
      s.party = ['raven'];
      s.relations.raven = { points: 450, met: true, talkedDay: 0, giftDay: 0, giftWeek: 0, giftsThisWeek: 0, events: [] };
    });
    const result = evaluateCheck(subjectOf(content, state), check({
      tags: ['hacken'],
      bonuses: [
        { when: { hearts: 'raven', min: 4 }, value: 1, label: 'Ravens Tipp' },
        { when: { origin: 'gosse' }, value: 1, label: 'Gassenwissen' },
        { when: { flag: 'nie' }, value: 5, label: 'Nie' },
        { when: { visited: 'gasse' }, value: 1, label: 'Ortskenntnis' },
      ],
    }));
    expect(result.parts.map(p => [p.label, p.value, p.source, p.kind])).toEqual([
      ['Technik', 5, 'attribut', 'attribut'],
      ['Optik-Implantat', 1, 'cyberware', 'cyberware'],
      ['Lederjacke', 1, 'ausruestung', 'ausruestung'],
      ['Bastler', 1, 'perk', 'perk'],
      ['Zielhilfe', 1, 'cyberware', 'cyberware'],
      ['Lederjacke', 1, 'ausruestung', 'ausruestung'],
      ['Lederjacke', 0, 'gegenstand', 'gegenstand'],
      ['Dietrich-Set', 2, 'gegenstand', 'gegenstand'],
      ['Gossenkind', 1, 'herkunft', 'herkunft'],
      ['Raven', 1, 'begleiter', 'begleiter'],
      ['Ravens Tipp', 1, 'beziehung', 'beziehung'],
      ['Gassenwissen', 1, 'herkunft', 'herkunft'],
      ['Ortskenntnis', 1, 'situation', 'situation'],
    ].filter(([, value]) => value !== 0));
    expect(result.value).toBe(17);
    expect(result.ok).toBe(true);
  });

  it('lässt Kontextregeln nur am passenden Ort, zur passenden Zeit und Fraktion greifen', () => {
    const { content, state } = setup((s, c) => {
      c.maps.bar.district = 'oberstadt';
      c.districts.oberstadt = { id: 'oberstadt', name: 'Oberstadt' };
      (c.perks as Record<string, CharacterPerkDef>).charmant.checkBonus = [
        { attribute: 'ausstrahlung', value: 1, districts: ['unterstadt'], label: 'Heimvorteil' },
        { attribute: 'ausstrahlung', value: 2, maps: ['bar'], label: 'Barhocker' },
        { attribute: 'ausstrahlung', value: 3, when: { time: 'nacht' }, label: 'Nachtschwärmer' },
        { attribute: 'ausstrahlung', value: 4, factions: ['crew'], label: 'Crewton' },
      ];
      s.player.perks = ['charmant'];
    });
    const talk = check({ attribute: 'ausstrahlung', threshold: 5 });
    const labels = (s: GameState, def = talk) => evaluateCheck(subjectOf(content, s), def).parts.map(p => p.label);
    expect(labels(state)).toEqual(['Ausstrahlung', 'Heimvorteil']);
    state.map = 'bar';
    expect(labels(state)).toEqual(['Ausstrahlung', 'Barhocker']);
    state.clock.minutes = 22 * 60;
    expect(labels(state)).toEqual(['Ausstrahlung', 'Barhocker', 'Nachtschwärmer']);
    expect(labels(state, { ...talk, faction: 'crew' } as CheckDef)).toContain('Crewton');
    const rule = { attribute: 'technik' as const, value: 1 };
    expect(ruleApplies(rule, talk, subjectOf(content, state))).toBe(false);
  });

  it('verschiebt die Schwelle mit schlechtem Ruf bei der Fraktion (world.md §10.2)', () => {
    const { content, state } = setup();
    const def = { ...check({ attribute: 'ausstrahlung', threshold: 5 }), faction: 'unterstadt' } as CheckDef;
    const at = (rep: number) => { state.reputation.unterstadt = rep; return evaluateCheck(subjectOf(content, state), def); };
    expect(at(0)).toMatchObject({ threshold: 5, thresholdParts: [] });
    expect(at(-1)).toMatchObject({ threshold: 6, thresholdParts: [{ label: 'Ruf: Misstrauisch', value: 1 }], missing: 3 });
    expect(at(-20)).toMatchObject({ threshold: 6 });
    expect(at(-21)).toMatchObject({ threshold: 7, thresholdParts: [{ label: 'Ruf: Feindlich', value: 2 }] });
    expect(at(-100).threshold).toBe(7);
    expect(at(80)).toMatchObject({ threshold: 5, thresholdParts: [] });
    expect(checkXp(def)).toBe(40);
  });

  it('besteht automatisch nach Regel bis zur Höchstschwelle', () => {
    const { content, state } = setup((s, c) => {
      (c.perks as Record<string, CharacterPerkDef>).bastler.autoPass = [{ attribute: 'koerper', tags: ['tuer'], maxThreshold: 6 }];
      s.player.perks = ['bastler'];
    });
    const door = (threshold: number, tags = ['tuer']) => evaluateCheck(subjectOf(content, state), check({ attribute: 'koerper', threshold, tags }));
    expect(door(6)).toMatchObject({ ok: true, missing: 0, autoPass: 'Bastler', value: 4 });
    expect(door(7)).toMatchObject({ ok: false, autoPass: null, missing: 3 });
    expect(door(6, ['kiste'])).toMatchObject({ ok: false });
    expect(breakdownText(door(6))).toBe('Automatisch bestanden (Bastler)');
  });

  it('zählt ein Ersatzattribut, wenn es höher ist', () => {
    const { content, state } = setup((s, c) => {
      (c.perks as Record<string, CharacterPerkDef>).charmant.substitute = [{ use: 'ausstrahlung', for: 'koerper', tags: ['schulden'] }];
      s.player.perks = ['charmant'];
      s.player.attributes.ausstrahlung = 7;
    });
    const debt = evaluateCheck(subjectOf(content, state), check({ attribute: 'koerper', threshold: 6, tags: ['schulden'] }));
    expect(debt).toMatchObject({ usedAttribute: 'ausstrahlung', attributeLabel: 'Ausstrahlung', attribute: 'koerper', value: 7, ok: true });
    expect(debt.parts[0].label).toBe('Ausstrahlung statt Körper');
    expect(checkLabel(check({ attribute: 'koerper', threshold: 6 }), debt)).toBe('[Ausstrahlung 6]');
    const other = evaluateCheck(subjectOf(content, state), check({ attribute: 'koerper', threshold: 6, tags: ['klettern'] }));
    expect(other).toMatchObject({ usedAttribute: 'koerper', value: 4 });
    state.player.attributes.ausstrahlung = 3;
    expect(evaluateCheck(subjectOf(content, state), check({ attribute: 'koerper', tags: ['schulden'] })).usedAttribute).toBe('koerper');
  });

  it('blendet hiddenIfFailed-Checks nur aus, solange sie nicht bestanden sind', () => {
    const { content, state } = setup();
    const secret = check({ attribute: 'strasse', threshold: 5, hiddenIfFailed: true });
    expect(evaluateCheck(subjectOf(content, state), secret)).toMatchObject({ ok: false, hiddenIfFailed: true, visible: false });
    state.player.attributes.strasse = 5;
    expect(evaluateCheck(subjectOf(content, state), secret)).toMatchObject({ ok: true, visible: true });
  });

  it('merkt sich frühere Erfolge', () => {
    const { content, state } = setup(s => { s.seen.push('check:probe'); });
    expect(evaluateCheck(subjectOf(content, state), check()).passedBefore).toBe(true);
  });

  it('nutzt vorübergehende Boni und meldet, welche ein Bestehen verbraucht', () => {
    const { content, state } = setup();
    const buffs: CheckBuff[] = [
      { id: 'nougat', label: 'Nougatbombe', value: 1, attribute: 'ausstrahlung' },
      { id: 'kuschel', label: 'Captain Kuschel', value: 1, untilDay: 1 },
      { id: 'platte', label: 'Plattenspieler', value: 1, consumes: false },
      { id: 'alt', label: 'Abgelaufen', value: 5, untilDay: 0 },
    ];
    const talk = check({ attribute: 'ausstrahlung', threshold: 6 });
    const result = evaluateCheck(subjectOf(content, state, buffs), talk);
    expect(result.parts.filter(p => p.kind === 'voruebergehend').map(p => p.label)).toEqual(['Nougatbombe', 'Captain Kuschel', 'Plattenspieler']);
    expect(result).toMatchObject({ value: 6, ok: true, consumes: ['nougat', 'kuschel'] });
    expect(evaluateCheck(subjectOf(content, state, buffs), check({ threshold: 10 })).consumes).toEqual([]);
    expect(remainingBuffs(buffs, result.consumes, 1).map(b => b.id)).toEqual(['platte']);
    expect(remainingBuffs(buffs, [], 2).map(b => b.id)).toEqual(['nougat', 'platte']);
    expect(buffApplies(buffs[0], check(), 1)).toBe(false);
  });

  it('ordnet situative Boni nach ihrer Bedingung ein', () => {
    expect(bonusKind({ hearts: 'raven', min: 2 })).toBe('beziehung');
    expect(bonusKind({ all: [{ flag: 'x' }, { companion: 'raven' }] })).toBe('beziehung');
    expect(bonusKind({ not: { origin: 'gosse' } })).toBe('herkunft');
    expect(bonusKind({ time: 'nacht' })).toBe('situation');
    expect(bonusKind(undefined)).toBe('situation');
  });

  it('schreibt eine lesbare Aufschlüsselung', () => {
    const { content, state } = setup((s, c) => {
      (c.perks as Record<string, CharacterPerkDef>).bastler.checkBonus = [{ attribute: 'technik', value: 1 }];
      (c.items as Record<string, CharacterItemDef>).dietrich.checkBonus = [{ attribute: 'technik', value: -2, label: 'Klemmt' }];
      s.player.perks = ['bastler'];
      s.inventory.dietrich = 1;
    });
    expect(breakdownText(evaluateCheck(subjectOf(content, state), check()))).toBe('Technik 5 + Bastler 1 − Klemmt 2 = 4 / 6');
  });
});
