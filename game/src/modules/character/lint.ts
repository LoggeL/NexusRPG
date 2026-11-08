// Inhaltsprüfung für die Erweiterungsfelder des Bereichs „Spielfigur und Checks“ (Perks, Cyberware, Herkünfte,
// Kleidung, Check-Fraktionen, Begleiterboni, Werkstattgebühren). Bedingungen werden nicht hier, sondern von
// campaign/lint.ts geprüft: Die Funktion liefert sie mit Fundort zurück.
import type { AttributeId, Condition, GameContent } from '../contracts';
import { ATTR_MAX, ATTR_MIN, LEVEL_MAX, has, isAttributeId } from '../campaign/ids';
import {
  asCheck, asCyberware, asItem, asNpc, asOrigin, asPerk, asShop,
  type AutoPassRule, type CheckRule, type PassiveEffects, type SubstituteRule,
} from './types';

export interface CharacterLint {
  problems: string[];
  /** Bedingungen aus Regeln mit Fundort, zur Prüfung durch die allgemeine Inhaltsprüfung. */
  conditions: { where: string; condition: Condition }[];
}

const COMBAT_KEYS = ['hit', 'damage', 'armor', 'hp', 'move', 'initiative', 'bandwidth', 'firewall'] as const;
const NUMBER_KEYS = ['shopDiscount', 'sellBonus', 'giftBonus', 'talkBonus'] as const;

export function findCharacterProblems(content: GameContent): CharacterLint {
  const problems: string[] = [];
  const conditions: CharacterLint['conditions'] = [];
  const report = (where: string, what: string) => problems.push(`${where}: ${what}`);
  const when = (where: string, condition?: Condition) => { if (condition !== undefined) conditions.push({ where, condition }); };
  const finite = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);

  const attribute = (where: string, value: unknown, label = 'Attribut') => {
    if (value !== undefined && !isAttributeId(value)) report(where, `unbekanntes ${label} „${String(value)}“`);
  };
  const tags = (where: string, list: unknown, label = 'Stichwörter') => {
    if (list === undefined) return;
    if (!Array.isArray(list) || list.some(tag => typeof tag !== 'string' || !tag)) report(where, `${label} müssen nicht leere Texte sein`);
  };
  const idList = (where: string, list: readonly string[] | undefined, record: object, label: string) => {
    for (const id of list ?? []) if (!has(record, id)) report(where, `unbekannte ${label} „${id}“`);
  };

  const rule = (where: string, r: CheckRule) => {
    if (!r || typeof r !== 'object') { report(where, 'ungültige Check-Regel'); return; }
    attribute(where, r.attribute);
    tags(where, r.tags);
    if (!finite(r.value) || !Number.isInteger(r.value) || r.value === 0) report(where, `Check-Bonus ${String(r.value)} muss eine ganze Zahl ≠ 0 sein`);
    idList(where, r.maps, content.maps, 'Karte');
    idList(where, r.districts, content.districts, 'Bezirk');
    idList(where, r.factions, content.factions, 'Fraktion');
    when(where, r.when);
  };
  const autoPass = (where: string, r: AutoPassRule) => {
    attribute(where, r.attribute);
    tags(where, r.tags);
    if (!Number.isInteger(r.maxThreshold) || r.maxThreshold < 3 || r.maxThreshold > 10) report(where, `Automatisch bestanden bis ${String(r.maxThreshold)} nicht in 3–10`);
    if (!r.attribute && !r.tags?.length) report(where, 'Automatisch-bestanden-Regel ohne Attribut oder Stichwort gilt für jeden Check');
    when(where, r.when);
  };
  const substitute = (where: string, r: SubstituteRule) => {
    attribute(where, r.use, 'Ersatzattribut');
    attribute(where, r.for);
    if (r.use === r.for) report(where, 'Ersatzattribut entspricht dem Checkattribut');
    tags(where, r.tags);
    when(where, r.when);
  };
  const passive = (where: string, fx: PassiveEffects) => {
    (fx.checkBonus ?? []).forEach((r, i) => rule(`${where} Check-Bonus ${i + 1}`, r));
    (fx.autoPass ?? []).forEach((r, i) => autoPass(`${where} automatisch ${i + 1}`, r));
    (fx.substitute ?? []).forEach((r, i) => substitute(`${where} Ersatz ${i + 1}`, r));
    for (const key of NUMBER_KEYS) if (fx[key] !== undefined && !finite(fx[key])) report(where, `${key} ist keine Zahl`);
    for (const key of COMBAT_KEYS) {
      const value = fx.combat?.[key];
      if (value !== undefined && !finite(value)) report(where, `Kampfbonus ${key} ist keine Zahl`);
    }
    tags(where, fx.traits, 'Merkmale');
  };
  const attributeRecord = (where: string, record: Partial<Record<AttributeId, number>> | undefined) => {
    for (const [key, value] of Object.entries(record ?? {})) {
      if (!isAttributeId(key)) report(where, `unbekanntes Attribut „${key}“`);
      else if (!Number.isInteger(value)) report(where, `Attributbonus ${key} muss ganzzahlig sein`);
    }
  };

  for (const def of Object.values(content.perks)) {
    const perk = asPerk(def);
    const at = `Perk ${perk.id}`;
    if (!Number.isInteger(perk.min) || perk.min < ATTR_MIN || perk.min > ATTR_MAX) report(at, `Mindestwert ${perk.min} nicht in ${ATTR_MIN}–${ATTR_MAX}`);
    if (perk.level !== undefined && (!Number.isInteger(perk.level) || perk.level < 1 || perk.level > LEVEL_MAX)) {
      report(at, `Mindeststufe ${perk.level} nicht in 1–${LEVEL_MAX}`);
    }
    if (perk.cost !== undefined && (!Number.isInteger(perk.cost) || perk.cost < 0)) report(at, `Kosten ${perk.cost} ungültig`);
    passive(at, perk);
  }

  for (const def of Object.values(content.cyberware)) {
    const part = asCyberware(def);
    const at = `Cyberware ${part.id}`;
    attributeRecord(at, part.attributes);
    if (part.installFee !== undefined && !(finite(part.installFee) && part.installFee >= 0)) report(at, 'ungültige Einbaugebühr');
    if (part.item && has(content.items, part.item)) {
      const item = content.items[part.item];
      if (item.cyberware && item.cyberware !== part.id) report(at, `Gegenstand „${part.item}“ verweist auf andere Cyberware „${item.cyberware}“`);
    }
    passive(at, part);
  }

  for (const def of Object.values(content.origins)) {
    const origin = asOrigin(def);
    const at = `Herkunft ${origin.id}`;
    for (const choice of origin.bonusChoice ?? []) attribute(at, choice, 'Bonusattribut');
    (origin.checkBonus ?? []).forEach((r, i) => rule(`${at} Check-Bonus ${i + 1}`, r));
  }

  for (const def of Object.values(content.items)) {
    const item = asItem(def);
    const at = `Gegenstand ${item.id}`;
    (item.checkBonus ?? []).forEach((r, i) => rule(`${at} Check-Bonus ${i + 1}`, r));
    if (item.wear) {
      attributeRecord(at, item.wear.attributes);
      passive(`${at} getragen`, item.wear);
    }
  }

  for (const def of Object.values(content.checks)) {
    const check = asCheck(def);
    if (check.faction !== undefined && !has(content.factions, check.faction)) report(`Check ${check.id}`, `unbekannte Fraktion „${check.faction}“`);
    tags(`Check ${check.id}`, check.tags);
  }

  for (const def of Object.values(content.npcs)) {
    const npc = asNpc(def);
    (npc.partyCheckBonus ?? []).forEach((r, i) => rule(`Figur ${npc.id} Party-Bonus ${i + 1}`, r));
  }

  for (const def of Object.values(content.shops)) {
    const fee = asShop(def).ripperdoc?.fee;
    if (fee !== undefined && !(finite(fee) && fee >= 0)) report(`Händler ${def.id}`, 'ungültige Einbaugebühr');
  }

  for (const look of Object.values(content.looks)) {
    // Vorlagen des Baukastens haben kein Porträt (Ich-Perspektive, design.md §3.1a).
    if (!look.sprite) report(`Aussehen ${look.id}`, 'Laufblatt fehlt');
  }
  return { problems, conditions };
}
