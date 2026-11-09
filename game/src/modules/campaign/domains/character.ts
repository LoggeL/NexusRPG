// Domäne „Spielfigur“: Brücke zwischen den reinen Regeln in modules/character/ (Attribute, Stufen/XP, LP, Perks,
// Cyberware, Ausrüstung, Charaktererstellung – design.md §3.1) und der Kampagne (Handler, Entwurf, Speicherformat).
// Zuständig: Bereich character.
import type {
  AttributeId, CharacterInput, CheckBuff, CyberSlot, EquipSlot, GameContent, GameState, ItemDef, PlayerState, ShopId,
} from '../../contracts';
import {
  combatBonusOf, effectiveAttribute as effectiveAttributeOf, finalCreationAttributes, learnPerkProblem, levelForXp as levelOf,
  levelGains, maxHpFormula, perkCost, planInstall, planUninstall, spendAttributeProblem, startAttributes, trainedValue, validateCreation,
  xpForLevel as xpOf, asShop, type AttributePart, type CharacterCreationInput, type FullCombatBonus,
  attributeParts as attributePartsOf,
} from '../../character';
import { parseAppearance, templateAppearance } from '../../appearance';
import {
  ATTRIBUTE_IDS, ATTRIBUTE_LABELS, ATTR_MAX, ATTR_MIN, CYBER_SLOTS, DEFAULT_PLAYER_NAME, EQUIP_SLOTS, LEVEL_MAX, clamp, has,
  isAttributeId,
} from '../ids';
import type { ConditionSpecs, EffectContext, EffectSpecs } from '../registry';
import { SAVE_LIMITS, fail, int, isKey, obj, uniqueList } from '../validate';
import { addItem, count, itemName, removeItem } from './core';
import { addCredits } from './economy';

// ---------------------------------------------------------------------------
// Regeln (Weiterleitungen auf modules/character, Namen bleiben für andere Domänen stabil)

/** Kumulative XP für Stufe `level`: 100 × n × (n + 1) / 2 mit n = level − 1 (Stufe 2 bei 100, 3 bei 300 …). */
export const xpForLevel = xpOf;
export const levelForXp = levelOf;

/** Aufschlüsselung des effektiven Attributwerts: Basis, Cyberware, Kleidung. */
export const attributeParts = (content: GameContent, player: Readonly<PlayerState>, attribute: AttributeId): AttributePart[] =>
  attributePartsOf(content, player, attribute);

export const effectiveAttribute = (content: GameContent, player: Readonly<PlayerState>, attribute: AttributeId): number =>
  effectiveAttributeOf(content, player, attribute);

/** Summe der Kampfboni aus Perks, Cyberware und Kleidung (inkl. Bandbreite und Firewall). */
export const combatBonus = (content: GameContent, player: Readonly<PlayerState>): FullCombatBonus => combatBonusOf(content, player);

/** LP-Maximum = 20 + 4 × Körper + 2 × Stufe (+ Kampfboni auf LP). */
export const maxHpOf = (content: GameContent, player: Readonly<PlayerState>): number =>
  maxHpFormula(effectiveAttribute(content, player, 'koerper'), player.level, combatBonus(content, player).hp);

/**
 * Führt `change` aus und verschiebt die LP um die Änderung des LP-Maximums (Einbau, Kleidung, Training, Stufe);
 * die LP bleiben dabei in 1..Maximum. Liefert die Ablehnung von `change` oder null.
 */
export function keepHpRelative(content: GameContent, draft: GameState, change: () => string | null): string | null {
  const before = maxHpOf(content, draft.player);
  const problem = change();
  if (problem) return problem;
  const after = maxHpOf(content, draft.player);
  draft.player.hp = clamp(draft.player.hp + (after - before), 1, after);
  return null;
}

/** LP auf 1..Maximum begrenzen (z. B. nachdem Kleidung verkauft wurde). */
export function clampHp(content: GameContent, draft: GameState): void {
  draft.player.hp = clamp(draft.player.hp, 1, maxHpOf(content, draft.player));
}

export function defaultPlayer(content: GameContent): PlayerState {
  const look = Object.keys(content.looks)[0] ?? '';
  const player: PlayerState = {
    created: false,
    name: DEFAULT_PLAYER_NAME,
    look,
    appearance: templateAppearance(content, look),
    origin: Object.keys(content.origins)[0] ?? '',
    level: 1,
    xp: 0,
    attributes: startAttributes(),
    unspentAttr: 0,
    perkPoints: 0,
    perks: [],
    cyberware: {},
    equipment: {},
    hp: 0,
  };
  player.hp = maxHpOf(content, player);
  return player;
}

/** XP gutschreiben; Stufenaufstiege geben je +1 Attribut- und Perkpunkt und erhöhen die LP mit. */
export function addXp(ctx: EffectContext, amount: number): void {
  const player = ctx.draft.player;
  const before = player.level;
  const gained = Math.max(0, Math.round(amount));
  if (gained <= 0) return;
  keepHpRelative(ctx.content, ctx.draft, () => {
    player.xp = Math.min(SAVE_LIMITS.counter, player.xp + gained);
    player.level = levelForXp(player.xp);
    return null;
  });
  ctx.messages.push(`+${gained} XP`);
  if (player.level > before) {
    const gains = levelGains(before, player.level);
    player.unspentAttr += gains.attributePoints;
    player.perkPoints += gains.perkPoints;
    ctx.messages.push(`Stufe ${player.level} erreicht!`);
    ctx.requests.push({ sfx: 'levelup' });
  }
}

export function healPlayer(content: GameContent, draft: GameState, amount: number | 'full'): number {
  const max = maxHpOf(content, draft.player);
  const before = draft.player.hp;
  draft.player.hp = amount === 'full' ? max : clamp(before + amount, 1, max);
  return draft.player.hp - before;
}

/** Fertige Spielfigur (design.md §3.1b) prüfen; liefert den Grund oder null. */
export function presetProblem(content: GameContent, id: unknown): string | null {
  const preset = typeof id === 'string' && content.presets && has(content.presets, id) ? content.presets[id as 'vex'] : undefined;
  if (!preset) return 'Unbekannte fertige Spielfigur.';
  if (!has(content.origins, preset.origin)) return `${preset.name}: unbekannte Herkunft.`;
  for (const attr of ATTRIBUTE_IDS) {
    const value = preset.attributes[attr];
    if (!Number.isInteger(value) || value < ATTR_MIN || value > ATTR_MAX) return `${preset.name}: ungültiger Wert für ${ATTRIBUTE_LABELS[attr]}.`;
  }
  for (const perk of preset.perks ?? []) if (!has(content.perks, perk)) return `${preset.name}: unbekannter Perk ${perk}.`;
  for (const item of Object.keys(preset.items ?? {})) if (!has(content.items, item)) return `${preset.name}: unbekannter Gegenstand ${item}.`;
  return null;
}

/** Eingabe der Charaktererstellung prüfen; liefert den Grund oder null. `originBonus` wählt bei Herkünften mit Wahl. */
export function validateCharacter(content: GameContent, input: CharacterInput | CharacterCreationInput): string | null {
  if (input && typeof input === 'object' && input.preset !== undefined) return presetProblem(content, input.preset);
  const problem = validateCreation(content, input);
  if (problem) return problem;
  if (input.appearance !== undefined) {
    const parsed = parseAppearance(input.appearance, templateAppearance(content, input.look));
    if ('error' in parsed) return parsed.error;
    if (parsed.replaced.length) return `Unbekannte Teile im Aussehen: ${parsed.replaced.join(', ')}.`;
  }
  return null;
}

/** Herkunftsboni (Gegenstände, Credits, Beziehungen, Ruf, Flags) als Effekte. */
function originEffects(content: GameContent, originId: string) {
  const origin = content.origins[originId];
  return [
    ...Object.entries(origin.items ?? {}).map(([give, qty]) => ({ give, qty })),
    ...(origin.credits ? [{ credits: origin.credits }] : []),
    ...Object.entries(origin.relations ?? {}).map(([relation, delta]) => ({ relation, delta })),
    ...Object.entries(origin.rep ?? {}).map(([rep, delta]) => ({ rep, delta })),
    ...(origin.flags ?? []).map(setFlag => ({ setFlag })),
  ];
}

/** Wendet die Charaktererstellung auf den Entwurf an (Eingabe vorher prüfen). */
export function applyCharacter(ctx: EffectContext, input: CharacterInput | CharacterCreationInput): string | null {
  const { content, draft } = ctx;
  const player = draft.player;
  if (input.preset !== undefined) {
    const preset = content.presets![input.preset]!;
    player.created = true;
    player.name = preset.name;
    player.preset = preset.id;
    if (has(content.looks, input.look)) player.look = input.look;
    player.appearance = templateAppearance(content, player.look);
    player.origin = preset.origin;
    player.attributes = { ...preset.attributes };
    for (const perk of preset.perks ?? []) if (!player.perks.includes(perk)) player.perks.push(perk);
    player.hp = maxHpOf(content, player);
    return ctx.run([
      ...originEffects(content, preset.origin),
      ...Object.entries(preset.items ?? {}).map(([give, qty]) => ({ give, qty })),
    ]);
  }
  player.created = true;
  player.name = input.name.trim();
  player.look = input.look;
  delete player.preset;
  player.appearance = input.appearance
    ? (() => { const parsed = parseAppearance(input.appearance, templateAppearance(content, input.look)); return 'error' in parsed ? templateAppearance(content, input.look) : parsed.appearance; })()
    : templateAppearance(content, input.look);
  player.origin = input.origin;
  player.attributes = finalCreationAttributes(content, input);
  player.hp = maxHpOf(content, player);
  return ctx.run(originEffects(content, input.origin));
}

export function spendAttributeIn(draft: GameState, attribute: AttributeId): string | null {
  const problem = spendAttributeProblem(draft.player, attribute);
  if (problem) return problem;
  draft.player.attributes[attribute] += 1;
  draft.player.unspentAttr -= 1;
  return null;
}

/** Perk lernen: Attributwert, Mindeststufe und Perkpunkte; `free` (Belohnung) überspringt alles. */
export function learnPerkIn(content: GameContent, draft: GameState, perk: string, free = false): string | null {
  const problem = learnPerkProblem(content, draft.player, perk, free);
  if (problem) return problem;
  return keepHpRelative(content, draft, () => {
    if (!free) draft.player.perkPoints -= perkCost(content.perks[perk]);
    draft.player.perks.push(perk);
    return null;
  });
}

/** Ausrüstungsplatz eines Gegenstands (Waffenart bzw. Kleidung) oder null. */
export function equipSlotOf(item: ItemDef): EquipSlot | null {
  if (item.weapon) return item.weapon.kind;
  if (item.category === 'kleidung') return 'kleidung';
  return null;
}

/** Ausrüsten bzw. (bei schon ausgerüstetem Gegenstand) ablegen. */
export function equipIn(content: GameContent, draft: GameState, item: string): string | null {
  const def = has(content.items, item) ? content.items[item] : undefined;
  if (!def) return 'Unbekannter Gegenstand.';
  if (count(draft, item) <= 0) return `${def.name} ist nicht im Inventar.`;
  const slot = equipSlotOf(def);
  if (!slot) return `${def.name} lässt sich nicht ausrüsten.`;
  return keepHpRelative(content, draft, () => {
    if (draft.player.equipment[slot] === item) delete draft.player.equipment[slot];
    else draft.player.equipment[slot] = item;
    return null;
  });
}

/** Ausrüstungsplatz leeren (LP folgen einem geänderten Maximum). */
export function unequipIn(content: GameContent, draft: GameState, slot: EquipSlot): string | null {
  if (!(EQUIP_SLOTS as readonly string[]).includes(slot)) return 'Unbekannter Ausrüstungsplatz.';
  const item = draft.player.equipment[slot];
  if (!item) return 'Dort ist nichts ausgerüstet.';
  return keepHpRelative(content, draft, () => { delete draft.player.equipment[slot]; return null; });
}

/** Höchstzahl gleichzeitig gespeicherter vorübergehender Check-Boni. */
export const MAX_CHECK_BUFFS = 20;

/** Gültiger vorübergehender Check-Bonus (Effekt und Speicherformat). */
export function checkBuffProblem(buff: unknown): string | null {
  if (!buff || typeof buff !== 'object' || Array.isArray(buff)) return 'Ungültiger Check-Bonus.';
  const b = buff as Record<string, unknown>;
  if (!isKey(b.id)) return 'Check-Bonus ohne gültige ID.';
  if (typeof b.label !== 'string' || !b.label || b.label.length > 80) return 'Check-Bonus ohne gültige Beschriftung.';
  if (typeof b.value !== 'number' || !Number.isInteger(b.value) || Math.abs(b.value) > 10) return 'Ungültiger Wert des Check-Bonus.';
  if (b.attribute !== undefined && !isAttributeId(b.attribute)) return 'Unbekanntes Attribut im Check-Bonus.';
  if (b.tags !== undefined && (!Array.isArray(b.tags) || b.tags.length > 16 || b.tags.some(tag => typeof tag !== 'string' || !tag))) return 'Ungültige Stichwörter im Check-Bonus.';
  if (b.untilDay !== undefined && (typeof b.untilDay !== 'number' || !Number.isInteger(b.untilDay) || b.untilDay < 1 || b.untilDay > SAVE_LIMITS.day)) return 'Ungültige Frist des Check-Bonus.';
  if (b.consumes !== undefined && typeof b.consumes !== 'boolean') return 'Ungültige Angabe „consumes“ im Check-Bonus.';
  if (b.forDays !== undefined && (typeof b.forDays !== 'number' || !Number.isInteger(b.forDays) || b.forDays < 0 || b.forDays > 365)) return 'Ungültige Frist „forDays“ im Check-Bonus.';
  return null;
}

/** Check-Bonus geben; ein Bonus mit gleicher ID wird ersetzt. Abgelaufene Boni fallen dabei weg. */
export function addCheckBuffIn(draft: GameState, buff: CheckBuff): string | null {
  const problem = checkBuffProblem(buff);
  if (problem) return problem;
  const day = draft.clock.day;
  const kept = (draft.player.checkBuffs ?? []).filter(entry => entry.id !== buff.id && (entry.untilDay === undefined || entry.untilDay >= day));
  if (kept.length >= MAX_CHECK_BUFFS) return 'Zu viele vorübergehende Boni.';
  const copy: CheckBuff = { id: buff.id, label: buff.label, value: buff.value };
  if (buff.attribute) copy.attribute = buff.attribute;
  if (buff.tags) copy.tags = [...buff.tags];
  if (buff.untilDay !== undefined) copy.untilDay = buff.untilDay;
  if (buff.forDays !== undefined) copy.untilDay = Math.min(SAVE_LIMITS.day, Math.min(copy.untilDay ?? Infinity, day + buff.forDays));
  if (buff.consumes !== undefined) copy.consumes = buff.consumes;
  draft.player.checkBuffs = [...kept, copy];
  return null;
}

/**
 * Cyberware einbauen. Ohne Werkstatt (Effekt `installCyberware`, Belohnung): gebührenfrei, verbraucht den passenden
 * Gegenstand, falls vorhanden. Mit Werkstatt (`shop` mit `ripperdoc`, geöffnet): Gegenstand muss im Inventar liegen,
 * Gebühr außer bei `ripperdoc.freeWhen`. Das alte Teil kommt jeweils als Gegenstand zurück ins Inventar.
 */
export function installCyberwareIn(ctx: EffectContext, id: string, shop?: ShopId): string | null {
  const { content, draft } = ctx;
  const shopDef = shop !== undefined ? (has(content.shops, shop) ? content.shops[shop] : null) : undefined;
  if (shopDef === null) return 'Unbekannter Händler.';
  if (shopDef && !ctx.evaluate(shopDef.open)) return `${shopDef.name} hat gerade geschlossen.`;
  const freeWhen = shopDef ? asShop(shopDef).ripperdoc?.freeWhen : undefined;
  const plan = planInstall(content, draft.player, id, {
    inventory: draft.inventory,
    requireItem: !!shopDef,
    ...(shopDef ? { shop: shopDef, freeInstall: freeWhen !== undefined && ctx.evaluate(freeWhen) } : {}),
  });
  if (!plan.ok) return plan.reason;
  if (plan.fee > 0) {
    const paid = addCredits(ctx, -plan.fee);
    if (paid) return paid;
  }
  if (plan.consume) {
    const problem = removeItem(content, draft, plan.consume, 1);
    if (problem) return problem;
  }
  if (plan.returns) {
    addItem(draft, plan.returns, 1);
    ctx.messages.push(`Ausgebaut: ${itemName(content, plan.returns)}`);
  }
  keepHpRelative(content, draft, () => { draft.player.cyberware[plan.slot] = plan.part.id; return null; });
  ctx.messages.push(`Eingebaut: ${plan.part.name}`);
  return null;
}

/** Cyberware ausbauen: das Teil kommt als Gegenstand zurück; Einzelstücke ohne Gegenstand bleiben drin. */
export function uninstallCyberwareIn(ctx: EffectContext, slot: CyberSlot, shop?: ShopId): string | null {
  const { content, draft } = ctx;
  if (shop !== undefined) {
    const shopDef = has(content.shops, shop) ? content.shops[shop] : undefined;
    if (!shopDef) return 'Unbekannter Händler.';
    if (!shopDef.ripperdoc) return `${shopDef.name} baut keine Cyberware aus.`;
    if (!ctx.evaluate(shopDef.open)) return `${shopDef.name} hat gerade geschlossen.`;
  }
  const plan = planUninstall(content, draft.player, slot);
  if (!plan.ok) return plan.reason;
  keepHpRelative(content, draft, () => { delete draft.player.cyberware[plan.slot]; return null; });
  addItem(draft, plan.returns, 1);
  ctx.messages.push(`Ausgebaut: ${plan.part.name}`);
  return null;
}

// ---------------------------------------------------------------------------
// Handler

export const characterConditions: ConditionSpecs<'attr' | 'origin' | 'level' | 'perk' | 'cyberware' | 'playerIs'> = {
  playerIs: { test: (c, { state }) => state.player.created && state.player.preset === c.playerIs },
  attr: { test: (c, { content, state }) => isAttributeId(c.attr) && effectiveAttribute(content, state.player, c.attr) >= c.min },
  origin: { test: (c, { state }) => state.player.created && state.player.origin === c.origin, refs: c => [{ kind: 'origins', id: c.origin }] },
  level: { test: (c, { state }) => state.player.level >= c.level },
  perk: { test: (c, { state }) => state.player.perks.includes(c.perk), refs: c => [{ kind: 'perks', id: c.perk }] },
  cyberware: {
    test: (c, { state }) => Object.values(state.player.cyberware).includes(c.cyberware),
    refs: c => [{ kind: 'cyberware', id: c.cyberware }],
  },
};

export const characterEffects: EffectSpecs<
  'xp' | 'heal' | 'damage' | 'grantPerk' | 'trainAttribute' | 'installCyberware' | 'removeCyberware' | 'checkBuff'
> = {
  xp: {
    apply(e, ctx) {
      if (!Number.isInteger(e.xp) || e.xp < 0) return 'Ungültige XP.';
      if (e.xp > 0) addXp(ctx, e.xp);
      return null;
    },
  },
  heal: {
    apply(e, { content, draft, messages }) {
      if (e.heal !== 'full' && (!Number.isFinite(e.heal) || e.heal < 0)) return 'Ungültige Heilmenge.';
      const healed = healPlayer(content, draft, e.heal === 'full' ? 'full' : Math.round(e.heal));
      if (healed > 0) messages.push(`+${healed} LP`);
      return null;
    },
  },
  damage: {
    apply(e, { content, draft, messages }) {
      if (!Number.isFinite(e.damage) || e.damage < 0) return 'Ungültiger Schaden.';
      const lost = -healPlayer(content, draft, -Math.round(e.damage));
      if (lost > 0) messages.push(`−${lost} LP`);
      return null;
    },
  },
  grantPerk: {
    apply(e, { content, draft, messages }) {
      if (!has(content.perks, e.grantPerk)) return `Unbekannter Perk: ${e.grantPerk}`;
      if (draft.player.perks.includes(e.grantPerk)) return null;
      const problem = learnPerkIn(content, draft, e.grantPerk, true);
      if (problem) return problem;
      messages.push(`Neuer Perk: ${content.perks[e.grantPerk].name}`);
      return null;
    },
    refs: e => [{ kind: 'perks', id: e.grantPerk }],
  },
  trainAttribute: {
    apply(e, { content, draft, messages }) {
      if (!isAttributeId(e.trainAttribute)) return `Unbekanntes Attribut: ${e.trainAttribute}`;
      if (!Number.isInteger(e.delta)) return 'Attributänderung muss ganzzahlig sein.';
      const before = draft.player.attributes[e.trainAttribute];
      const after = trainedValue(before, e.delta);
      keepHpRelative(content, draft, () => { draft.player.attributes[e.trainAttribute] = after; return null; });
      if (after !== before) messages.push(`${ATTRIBUTE_LABELS[e.trainAttribute]} ${after > before ? '+' : '−'}${Math.abs(after - before)}`);
      return null;
    },
  },
  installCyberware: {
    apply: (e, ctx) => installCyberwareIn(ctx, e.installCyberware),
    refs: e => [{ kind: 'cyberware', id: e.installCyberware }],
  },
  removeCyberware: {
    apply(e, ctx) {
      if (!(CYBER_SLOTS as readonly string[]).includes(e.removeCyberware)) return `Unbekannter Cyberware-Platz: ${e.removeCyberware}`;
      return uninstallCyberwareIn(ctx, e.removeCyberware);
    },
  },
  checkBuff: {
    apply(e, ctx) {
      const problem = addCheckBuffIn(ctx.draft, e.checkBuff);
      if (problem) return problem;
      ctx.messages.push(`Bonus: ${e.checkBuff.label} ${e.checkBuff.value > 0 ? '+' : '−'}${Math.abs(e.checkBuff.value)}`);
      return null;
    },
  },
};

// ---------------------------------------------------------------------------
// Speicherformat

/** Obergrenze für gespeicherte LP vor dem Abgleich mit dem aktuellen Maximum. */
const HP_LIMIT = 10_000;

/**
 * Spielfigur aus dem Speicherformat. `notes` sammelt Hinweise für den Ladedialog (ersetzte Baukasten-Teile,
 * unbekannte Vorlage); unbekannte Teil-IDs zerstören den Stand nicht.
 */
export function parsePlayer(value: unknown, content: GameContent, notes: string[] = []): PlayerState {
  const p = obj(value, 'Spielfigur');
  if (typeof p.created !== 'boolean') fail('Ungültige Spielfigur.');
  if (typeof p.name !== 'string' || p.name.length === 0 || p.name.length > SAVE_LIMITS.nameLength || /[\u0000-\u001f\u007f]/.test(p.name)) {
    fail('Ungültiger Name der Spielfigur.');
  }
  const created = p.created as boolean;
  let look = p.look;
  const origin = p.origin;
  if (typeof look !== 'string' || !isKey(look)) fail('Unbekanntes Aussehen.');
  if (created && !has(content.looks, look)) {
    const fallback = has(content.looks, 'look-neonbomber') ? 'look-neonbomber' : Object.keys(content.looks)[0];
    if (!fallback) fail('Unbekanntes Aussehen.');
    notes.push(`Unbekannte Vorlage „${look as string}“ durch „${content.looks[fallback].name}“ ersetzt.`);
    look = fallback;
  }
  const appearanceIn = parseAppearance(p.appearance, templateAppearance(content, look as string));
  if ('error' in appearanceIn) fail(appearanceIn.error);
  const { appearance, replaced } = appearanceIn as Exclude<typeof appearanceIn, { error: string }>;
  if (replaced.length) notes.push(`Aussehen: ${replaced.join(', ')} gibt es nicht mehr – durch die Vorlage ersetzt.`);
  if (p.preset !== undefined && presetProblem(content, p.preset)) fail('Unbekannte fertige Spielfigur.');
  if (typeof origin !== 'string' || (created && !has(content.origins, origin))) fail('Unbekannte Herkunft.');
  const level = int(p.level, 1, LEVEL_MAX, 'Stufe');
  const xp = int(p.xp, 0, SAVE_LIMITS.counter, 'XP');
  if (levelForXp(xp) !== level) fail('Stufe passt nicht zu den XP.');
  const attrsIn = obj(p.attributes, 'Attribute');
  const attributes = {} as Record<AttributeId, number>;
  for (const id of ATTRIBUTE_IDS) attributes[id] = int(attrsIn[id], ATTR_MIN, ATTR_MAX, ATTRIBUTE_LABELS[id]);
  if (Object.keys(attrsIn).some(key => !isAttributeId(key))) fail('Unbekanntes Attribut.');
  const perks = uniqueList(p.perks, Object.keys(content.perks).length, id => isKey(id) && has(content.perks, id as string), 'Perks');
  const cyberIn = obj(p.cyberware, 'Cyberware');
  const cyberware: Partial<Record<CyberSlot, string>> = {};
  for (const [slot, id] of Object.entries(cyberIn)) {
    if (!(CYBER_SLOTS as readonly string[]).includes(slot)) fail(`Unbekannter Cyberware-Platz: ${slot}`);
    if (typeof id !== 'string' || !has(content.cyberware, id) || content.cyberware[id].slot !== slot) fail('Ungültige Cyberware.');
    cyberware[slot as CyberSlot] = id as string;
  }
  const equipIn = obj(p.equipment, 'Ausrüstung');
  const equipment: Partial<Record<EquipSlot, string>> = {};
  for (const [slot, id] of Object.entries(equipIn)) {
    if (!(EQUIP_SLOTS as readonly string[]).includes(slot)) fail(`Unbekannter Ausrüstungsplatz: ${slot}`);
    if (typeof id !== 'string' || !has(content.items, id) || equipSlotOf(content.items[id]) !== slot) fail('Ungültige Ausrüstung.');
    equipment[slot as EquipSlot] = id as string;
  }
  const player: PlayerState = {
    created,
    name: p.name as string,
    look: look as string,
    appearance,
    origin: origin as string,
    level,
    xp,
    attributes,
    unspentAttr: int(p.unspentAttr, 0, LEVEL_MAX * 2, 'Attributpunkte'),
    perkPoints: int(p.perkPoints, 0, LEVEL_MAX * 2, 'Perkpunkte'),
    perks,
    cyberware,
    equipment,
    hp: 0,
  };
  if (p.preset !== undefined) player.preset = p.preset as 'vex';
  if (p.checkBuffs !== undefined) {
    if (!Array.isArray(p.checkBuffs) || p.checkBuffs.length > MAX_CHECK_BUFFS) fail('Ungültige Check-Boni.');
    const buffs: CheckBuff[] = [];
    for (const raw of p.checkBuffs as unknown[]) {
      const problem = checkBuffProblem(raw);
      if (problem) fail(problem);
      buffs.push({ ...(raw as CheckBuff), ...((raw as CheckBuff).tags ? { tags: [...(raw as CheckBuff).tags!] } : {}) });
    }
    if (new Set(buffs.map(buff => buff.id)).size !== buffs.length) fail('Doppelte Check-Boni.');
    if (buffs.length) player.checkBuffs = buffs;
  }
  // LP über dem aktuellen Maximum (geänderte Inhalte, verkaufte Kleidung) werden gekappt statt abgelehnt.
  player.hp = Math.min(int(p.hp, 1, HP_LIMIT, 'LP'), maxHpOf(content, player));
  return player;
}
