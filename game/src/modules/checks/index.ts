// Schwellen-Checks ohne Würfel (design.md §3.2, world.md §7).
//
//   Wert = Attribut (Basis inkl. Herkunftsbonus, Cyberware, Kleidung)
//        + Perk-, Cyberware-, Kleidungs- und Gegenstandsregeln
//        + Herkunftsregeln + Beziehungs- und Situationsboni (`CheckDef.bonuses`, Begleiter in der Party)
//        + vorübergehende Boni (CheckBuff)
//   Bestanden, wenn Wert ≥ Schwelle. Die Schwelle verschiebt sich mit der Rufstufe bei der Fraktion des Checks
//   (world.md §10.2, `checkPenalty` aus modules/reputation). Erstes Bestehen gibt einmalig XP (15 + 5 × Grundschwelle). `hiddenIfFailed` blendet nicht
//   erfüllte Optionen aus. Regeln können einen Check automatisch bestehen lassen oder ein anderes Attribut zählen lassen.
//
// Rein: keine Zustandsänderung, Bedingungen wertet der Aufrufer über `subject.evaluate` aus.
import type {
  AttributeId, CheckBonusRule, CheckDef, CheckEvaluation, CheckRef, Condition, GameContent, GameState,
} from '../contracts';
import { ATTRIBUTE_LABELS, has, isAttributeId } from '../campaign/ids';
import {
  asCheck, asItem, asNpc, asOrigin, attributeParts, effectiveAttribute, passiveSources,
  type AttributePart, type AutoPassRule, type CharacterCheckDef, type CheckBuff, type CheckRule, type SubstituteRule,
} from '../character';
import { factionTier } from '../reputation';

// ---------------------------------------------------------------------------
// Grundlagen

/** Grenzen der Schwelle laut design.md §3.2. */
export const THRESHOLD_MIN = 3;
export const THRESHOLD_MAX = 10;

/** Löst einen Verweis auf; unbekannte IDs oder kaputte Formen liefern null. */
export function resolveCheck(content: GameContent, ref: CheckRef | undefined | null): CheckDef | null {
  if (!ref) return null;
  if (typeof ref === 'string') return has(content.checks, ref) ? content.checks[ref] : null;
  return typeof ref === 'object' && typeof ref.id === 'string' && isAttributeId(ref.attribute) && Number.isFinite(ref.threshold)
    ? ref
    : null;
}

/** Schlüssel in `GameState.seen` für die einmalige XP. */
export const checkSeenKey = (id: string): string => `check:${id}`;

/** XP beim ersten Bestehen: `CheckDef.xp` oder 15 + 5 × Grundschwelle. */
export const checkXp = (check: CheckDef): number =>
  Math.max(0, Math.round(check.xp ?? 15 + 5 * check.threshold));

/**
 * Anzeigepräfix „[Technik 6]“. Mit Auswertung zeigt es die wirksame Schwelle (Ruf kann sie verschieben) und bei
 * Attributersatz das zählende Attribut. Ein eigenes `label` im Inhalt geht immer vor.
 */
export function checkLabel(check: CheckDef, evaluation?: Pick<CheckEvaluation, 'threshold'> & { usedAttribute?: AttributeId }): string {
  if (check.label) return check.label;
  const attribute = evaluation?.usedAttribute ?? check.attribute;
  const threshold = evaluation?.threshold ?? check.threshold;
  return `[${ATTRIBUTE_LABELS[attribute] ?? attribute} ${threshold}]`;
}

/** Text für gesperrte Optionen: „Es fehlen 2 Punkte Technik.“ */
export const missingText = (evaluation: Pick<CheckEvaluation, 'ok' | 'missing' | 'attributeLabel'>): string =>
  evaluation.ok ? '' : `Es ${evaluation.missing === 1 ? 'fehlt 1 Punkt' : `fehlen ${evaluation.missing} Punkte`} ${evaluation.attributeLabel}.`;

// ---------------------------------------------------------------------------
// Auswertung

/** Feinere Herkunft eines Teilwerts als `CheckEvaluation.parts[].source`. */
export type CheckPartKind =
  | 'attribut' | 'cyberware' | 'ausruestung' | 'perk' | 'gegenstand' | 'herkunft' | 'beziehung' | 'begleiter'
  | 'situation' | 'voruebergehend';

export type CheckPart = CheckEvaluation['parts'][number] & { kind: CheckPartKind };

export interface CheckResult extends CheckEvaluation {
  parts: CheckPart[];
  /** Schwelle aus dem Inhalt (für XP); `threshold` ist die wirksame Schwelle. */
  baseThreshold: number;
  /** Aufschläge auf die Schwelle (Ruf). */
  thresholdParts: { label: string; value: number }[];
  /** Tatsächlich zählendes Attribut (bei Ersatz ≠ `attribute`). */
  usedAttribute: AttributeId;
  /** Quelle, die den Check automatisch bestehen lässt, sonst null. */
  autoPass: string | null;
  /** Option anzeigen? (false nur bei `hiddenIfFailed` und nicht bestanden) */
  visible: boolean;
  /** Vorübergehende Boni, die ein Bestehen verbrauchen würde. */
  consumes: string[];
}

/** Alles, was eine Auswertung braucht. */
export interface CheckSubject {
  content: GameContent;
  state: Readonly<GameState>;
  /** Bedingungen gegen `state` auswerten (campaign: evaluateCondition). */
  evaluate(condition?: Condition): boolean;
  /** Vorübergehende Boni (noch nicht im Speicherformat, siehe Vertragswünsche). */
  buffs?: readonly CheckBuff[];
}

/** Aktuelle Karte und ihr Bezirk. */
function whereabouts(subject: CheckSubject): { map: string; district: string | null } {
  const map = subject.state.map;
  const def = has(subject.content.maps, map) ? subject.content.maps[map] : undefined;
  return { map, district: def?.district ?? null };
}

const tagsMatch = (wanted: readonly string[] | undefined, check: CheckDef): boolean =>
  !wanted?.length || wanted.some(tag => check.tags?.includes(tag) ?? false);

/** Gilt eine (erweiterte) Bonusregel für diesen Check im aktuellen Zustand? */
export function ruleApplies(rule: CheckBonusRule & Partial<CheckRule>, check: CheckDef, subject: CheckSubject): boolean {
  if (rule.attribute && rule.attribute !== check.attribute) return false;
  if (!tagsMatch(rule.tags, check)) return false;
  const here = whereabouts(subject);
  if (rule.maps?.length && !rule.maps.includes(here.map)) return false;
  if (rule.districts?.length && (here.district === null || !rule.districts.includes(here.district))) return false;
  if (rule.factions?.length) {
    const faction = asCheck(check).faction;
    if (!faction || !rule.factions.includes(faction)) return false;
  }
  return rule.when === undefined || subject.evaluate(rule.when);
}

/** Passende Regeln einer Quelle als Teilwerte: Regeln mit eigenem `label` einzeln, die übrigen unter dem Quellnamen. */
function ruleParts(
  rules: readonly (CheckBonusRule & Partial<CheckRule>)[] | undefined, check: CheckDef, subject: CheckSubject, source: string,
): { label: string; value: number }[] {
  const out: { label: string; value: number }[] = [];
  for (const rule of rules ?? []) {
    if (!rule || !Number.isFinite(rule.value) || !ruleApplies(rule, check, subject)) continue;
    const label = rule.label ?? source;
    const entry = out.find(p => p.label === label);
    if (entry) entry.value += rule.value;
    else out.push({ label, value: rule.value });
  }
  return out.filter(p => p.value !== 0);
}

const RELATION_KEYS = new Set(['hearts', 'rival', 'met', 'romance', 'romanceEnabled', 'companion', 'recruited']);

/** Ordnet einen situativen Bonus nach seiner Bedingung ein (Herkunft, Beziehung oder Situation). */
export function bonusKind(condition: Condition | undefined): 'herkunft' | 'beziehung' | 'situation' {
  const keys = new Set<string>();
  const walk = (c: Condition | undefined, depth: number) => {
    if (!c || typeof c !== 'object' || depth > 8) return;
    for (const key of Object.keys(c)) keys.add(key);
    if ('all' in c && Array.isArray(c.all)) c.all.forEach(x => walk(x, depth + 1));
    if ('any' in c && Array.isArray(c.any)) c.any.forEach(x => walk(x, depth + 1));
    if ('not' in c) walk(c.not, depth + 1);
    if ('atLeast' in c && Array.isArray(c.atLeast)) c.atLeast.forEach(x => walk(x, depth + 1));
  };
  walk(condition, 0);
  if ([...keys].some(key => RELATION_KEYS.has(key))) return 'beziehung';
  if (keys.has('origin')) return 'herkunft';
  return 'situation';
}

const SOURCE_OF: Readonly<Record<CheckPartKind, CheckEvaluation['parts'][number]['source']>> = {
  attribut: 'attribut', cyberware: 'cyberware', ausruestung: 'ausruestung', perk: 'perk', gegenstand: 'gegenstand',
  herkunft: 'herkunft', beziehung: 'beziehung', begleiter: 'begleiter', situation: 'situation', voruebergehend: 'voruebergehend',
};
const part = (label: string, value: number, kind: CheckPartKind): CheckPart => ({ label, value, source: SOURCE_OF[kind], kind });

/** Gilt ein vorübergehender Bonus für diesen Check? */
export function buffApplies(buff: CheckBuff, check: CheckDef, day: number): boolean {
  if (!Number.isFinite(buff.value) || buff.value === 0) return false;
  if (buff.untilDay !== undefined && day > buff.untilDay) return false;
  if (buff.attribute && buff.attribute !== check.attribute) return false;
  return tagsMatch(buff.tags, check);
}

/** Bestes zählendes Attribut unter Ersatzregeln (Gleichstand: das eigene). */
function chooseAttribute(check: CheckDef, subject: CheckSubject, rules: readonly SubstituteRule[]): AttributeId {
  const { content, state } = subject;
  let best: AttributeId = check.attribute;
  let bestValue = effectiveAttribute(content, state.player, best);
  for (const rule of rules) {
    if (!isAttributeId(rule.use) || (rule.for && rule.for !== check.attribute) || !tagsMatch(rule.tags, check)) continue;
    if (rule.when !== undefined && !subject.evaluate(rule.when)) continue;
    const value = effectiveAttribute(content, state.player, rule.use);
    if (value > bestValue) { best = rule.use; bestValue = value; }
  }
  return best;
}

function autoPassBy(check: CheckDef, subject: CheckSubject, sources: { name: string; rules?: readonly AutoPassRule[] }[]): string | null {
  for (const source of sources) {
    for (const rule of source.rules ?? []) {
      if (rule.attribute && rule.attribute !== check.attribute) continue;
      if (!tagsMatch(rule.tags, check) || check.threshold > rule.maxThreshold) continue;
      if (rule.when !== undefined && !subject.evaluate(rule.when)) continue;
      return source.name;
    }
  }
  return null;
}

export function evaluateCheck(subject: CheckSubject, check: CheckDef): CheckResult {
  const { content, state } = subject;
  const player = state.player;
  const def: CharacterCheckDef = asCheck(check);
  const sources = passiveSources(content, player);

  // Attribut (ggf. Ersatz) samt Cyberware- und Kleidungsanteil
  const usedAttribute = chooseAttribute(check, subject, sources.flatMap(s => s.effects.substitute ?? []));
  const attrParts: AttributePart[] = attributeParts(content, player, usedAttribute);
  const parts: CheckPart[] = attrParts.map((p, i) => part(
    i === 0 && usedAttribute !== check.attribute ? `${p.label} statt ${ATTRIBUTE_LABELS[check.attribute]}` : p.label,
    p.value,
    p.source,
  ));

  // Perks, Cyberware, getragene Kleidung
  for (const source of sources) {
    const kind: CheckPartKind = source.kind === 'perk' ? 'perk' : source.kind === 'cyberware' ? 'cyberware' : 'ausruestung';
    for (const p of ruleParts(source.effects.checkBonus, check, subject, source.name)) parts.push(part(p.label, p.value, kind));
  }

  // Gegenstände im Inventar
  for (const [id, qty] of Object.entries(state.inventory)) {
    if (!(qty > 0) || !has(content.items, id)) continue;
    const item = asItem(content.items[id]);
    for (const p of ruleParts(item.checkBonus, check, subject, item.name)) parts.push(part(p.label, p.value, 'gegenstand'));
  }

  // Herkunft
  if (player.created && has(content.origins, player.origin)) {
    const origin = asOrigin(content.origins[player.origin]);
    for (const p of ruleParts(origin.checkBonus, check, subject, origin.name)) parts.push(part(p.label, p.value, 'herkunft'));
  }

  // Begleiter in der Party
  for (const npc of state.party) {
    if (!has(content.npcs, npc)) continue;
    const companion = asNpc(content.npcs[npc]);
    for (const p of ruleParts(companion.partyCheckBonus, check, subject, companion.name)) parts.push(part(p.label, p.value, 'begleiter'));
  }

  // Situative Boni des Checks (Beziehung, Herkunft, Lage)
  for (const bonus of check.bonuses ?? []) {
    if (!bonus || !Number.isFinite(bonus.value) || !bonus.value) continue;
    if (subject.evaluate(bonus.when)) parts.push(part(bonus.label, bonus.value, bonusKind(bonus.when)));
  }

  // Vorübergehende Boni
  const consumes: string[] = [];
  for (const buff of subject.buffs ?? []) {
    if (!buffApplies(buff, check, state.clock.day)) continue;
    parts.push(part(buff.label, buff.value, 'voruebergehend'));
    if (buff.consumes !== false) consumes.push(buff.id);
  }

  // Schwelle: Grundschwelle + Ruf bei der Fraktion
  const thresholdParts: CheckResult['thresholdParts'] = [];
  if (def.faction) {
    // Rufstufen gehören dem Bereich quests+economy (modules/reputation); hier zählt nur ihr Schwellenaufschlag.
    const tier = factionTier(state, def.faction);
    if (tier.checkPenalty) thresholdParts.push({ label: `Ruf: ${tier.name}`, value: tier.checkPenalty });
  }
  const threshold = Math.max(1, check.threshold + thresholdParts.reduce((sum, p) => sum + p.value, 0));

  const autoPass = autoPassBy(check, subject, sources.map(s => ({ name: s.name, rules: s.effects.autoPass })));
  const value = parts.reduce((sum, p) => sum + p.value, 0);
  const ok = autoPass !== null || value >= threshold;
  const hiddenIfFailed = check.hiddenIfFailed === true;
  return {
    checkId: check.id,
    attribute: check.attribute,
    attributeLabel: ATTRIBUTE_LABELS[usedAttribute],
    threshold,
    value,
    ok,
    missing: ok ? 0 : threshold - value,
    parts,
    hiddenIfFailed,
    passedBefore: state.seen.includes(checkSeenKey(check.id)),
    baseThreshold: check.threshold,
    thresholdParts,
    usedAttribute,
    autoPass,
    visible: ok || !hiddenIfFailed,
    consumes: ok ? consumes : [],
  };
}

/** Kurze Aufschlüsselung für Tooltips: „Technik 5 + Bastler 1 = 6 / 6“. */
export function breakdownText(result: Pick<CheckResult, 'parts' | 'value' | 'threshold' | 'autoPass'>): string {
  if (result.autoPass) return `Automatisch bestanden (${result.autoPass})`;
  const terms = result.parts.map((p, i) => (i === 0 ? `${p.label} ${p.value}` : `${p.value < 0 ? '−' : '+'} ${p.label} ${Math.abs(p.value)}`));
  return `${terms.join(' ')} = ${result.value} / ${result.threshold}`;
}

/** Vorübergehende Boni nach einem bestandenen Check: verbrauchte und abgelaufene entfernen. */
export function remainingBuffs(buffs: readonly CheckBuff[], consumed: readonly string[], day: number): CheckBuff[] {
  return buffs.filter(buff => !consumed.includes(buff.id) && (buff.untilDay === undefined || day <= buff.untilDay));
}
