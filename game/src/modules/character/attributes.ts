// Attribute der Spielfigur: Basiswerte, effektive Werte (Cyberware, Kleidung), Charaktererstellung, Punkte verteilen.
// design.md §3.1: Start je 3, 4 freie Punkte, Herkunftsbonus +1 (höchstens 10), Maximum 10.
import type { AttributeId, GameContent, ItemDef, PlayerState } from '../contracts';
import {
  ATTRIBUTE_IDS, ATTRIBUTE_LABELS, ATTR_FREE_POINTS, ATTR_MAX, ATTR_MIN, ATTR_START, CYBER_SLOTS, EQUIP_SLOTS, NAME_MAX,
  NAME_MIN, has, isAttributeId,
} from '../campaign/ids';
import { asOrigin, type CharacterCreationInput, type CharacterCyberwareDef, type CharacterItemDef } from './types';

/** Teil eines effektiven Attributwerts (Quelle wie in `CheckEvaluation.parts`). */
export interface AttributePart {
  label: string;
  value: number;
  source: 'attribut' | 'cyberware' | 'ausruestung';
}

/** Eingebaute Cyberware in Platzreihenfolge (unbekannte IDs werden übersprungen). */
export function installedParts(content: GameContent, player: Readonly<PlayerState>): CharacterCyberwareDef[] {
  const parts: CharacterCyberwareDef[] = [];
  for (const slot of CYBER_SLOTS) {
    const id = player.cyberware[slot];
    if (id && has(content.cyberware, id)) parts.push(content.cyberware[id]);
  }
  return parts;
}

/** Ausgerüstete Gegenstände (Waffen und Kleidung) in Platzreihenfolge. */
export function equippedItems(content: GameContent, player: Readonly<PlayerState>): CharacterItemDef[] {
  const items: CharacterItemDef[] = [];
  for (const slot of EQUIP_SLOTS) {
    const id = player.equipment[slot];
    if (id && has(content.items, id)) items.push(content.items[id] as CharacterItemDef);
  }
  return items;
}

/** Getragene Kleidung (Gegenstände mit `wear`). */
export const wornItems = (content: GameContent, player: Readonly<PlayerState>): CharacterItemDef[] =>
  equippedItems(content, player).filter((item: ItemDef) => !!item.wear);

/** Aufschlüsselung des effektiven Attributwerts: Basis (inkl. Herkunftsbonus), Cyberware, Kleidung. */
export function attributeParts(content: GameContent, player: Readonly<PlayerState>, attribute: AttributeId): AttributePart[] {
  const parts: AttributePart[] = [
    { label: ATTRIBUTE_LABELS[attribute], value: player.attributes[attribute] ?? 0, source: 'attribut' },
  ];
  for (const def of installedParts(content, player)) {
    const value = def.attributes?.[attribute] ?? 0;
    if (value) parts.push({ label: def.name, value, source: 'cyberware' });
  }
  for (const item of wornItems(content, player)) {
    const value = item.wear?.attributes?.[attribute] ?? 0;
    if (value) parts.push({ label: item.name, value, source: 'ausruestung' });
  }
  return parts;
}

/** Effektiver Attributwert = Basis + Cyberware + Kleidung (situative Check-Boni zählen nicht). */
export const effectiveAttribute = (content: GameContent, player: Readonly<PlayerState>, attribute: AttributeId): number =>
  attributeParts(content, player, attribute).reduce((sum, part) => sum + part.value, 0);

export function effectiveAttributes(content: GameContent, player: Readonly<PlayerState>): Record<AttributeId, number> {
  const out = {} as Record<AttributeId, number>;
  for (const id of ATTRIBUTE_IDS) out[id] = effectiveAttribute(content, player, id);
  return out;
}

/** Startwerte vor dem Verteilen (je 3). */
export function startAttributes(): Record<AttributeId, number> {
  const out = {} as Record<AttributeId, number>;
  for (const id of ATTRIBUTE_IDS) out[id] = ATTR_START;
  return out;
}

/** Bei der Erstellung verteilte Punkte (Summe über Startwert). */
export const creationPointsSpent = (attributes: Readonly<Record<AttributeId, number>>): number =>
  ATTRIBUTE_IDS.reduce((sum, id) => sum + ((attributes[id] ?? ATTR_START) - ATTR_START), 0);

/** Noch freie Punkte der Erstellung. */
export const creationPointsLeft = (attributes: Readonly<Record<AttributeId, number>>): number =>
  ATTR_FREE_POINTS - creationPointsSpent(attributes);

/** Wählbare Bonusattribute einer Herkunft (erste = Vorauswahl). */
export function originBonusOptions(content: GameContent, origin: string): AttributeId[] {
  if (!has(content.origins, origin)) return [];
  const def = asOrigin(content.origins[origin]);
  const options = [def.bonus, ...(def.bonusChoice ?? [])].filter(isAttributeId);
  return [...new Set(options)];
}

/** Tatsächliches Bonusattribut: gewähltes (falls erlaubt), sonst die Vorgabe der Herkunft. */
export function originBonusOf(content: GameContent, input: Pick<CharacterCreationInput, 'origin' | 'originBonus'>): AttributeId | null {
  const options = originBonusOptions(content, input.origin);
  if (!options.length) return null;
  return input.originBonus && options.includes(input.originBonus) ? input.originBonus : options[0];
}

/** Endwerte nach Herkunftsbonus (gekappt bei 10). */
export function finalCreationAttributes(content: GameContent, input: CharacterCreationInput): Record<AttributeId, number> {
  const out = {} as Record<AttributeId, number>;
  for (const id of ATTRIBUTE_IDS) out[id] = input.attributes[id];
  const bonus = originBonusOf(content, input);
  if (bonus) out[bonus] = Math.min(ATTR_MAX, out[bonus] + 1);
  return out;
}

const NAME_FORBIDDEN = /[\u0000-\u001f\u007f<>{}]/;

/** Prüft die Eingabe der Charaktererstellung; liefert den Grund oder null. */
export function validateCreation(content: GameContent, input: CharacterCreationInput): string | null {
  if (!input || typeof input !== 'object') return 'Ungültige Eingabe.';
  const name = typeof input.name === 'string' ? input.name.trim() : '';
  if (name.length < NAME_MIN || name.length > NAME_MAX) return `Der Name muss ${NAME_MIN} bis ${NAME_MAX} Zeichen lang sein.`;
  if (NAME_FORBIDDEN.test(name)) return 'Der Name enthält ungültige Zeichen.';
  if (typeof input.look !== 'string' || !has(content.looks, input.look)) return 'Bitte ein Aussehen wählen.';
  if (typeof input.origin !== 'string' || !has(content.origins, input.origin)) return 'Bitte eine Herkunft wählen.';
  if (input.originBonus !== undefined && !originBonusOptions(content, input.origin).includes(input.originBonus)) {
    return 'Dieses Bonusattribut passt nicht zur Herkunft.';
  }
  if (!input.attributes || typeof input.attributes !== 'object') return 'Bitte die Attribute verteilen.';
  if (Object.keys(input.attributes).some(key => !isAttributeId(key))) return 'Unbekanntes Attribut.';
  let spent = 0;
  for (const id of ATTRIBUTE_IDS) {
    const value = input.attributes[id];
    if (!Number.isInteger(value) || value < ATTR_START || value > ATTR_MAX) {
      return `${ATTRIBUTE_LABELS[id]} muss zwischen ${ATTR_START} und ${ATTR_MAX} liegen.`;
    }
    spent += value - ATTR_START;
  }
  if (spent !== ATTR_FREE_POINTS) return `Es müssen genau ${ATTR_FREE_POINTS} Punkte verteilt sein (verteilt: ${spent}).`;
  return null;
}

/** Grund, warum ein freier Attributpunkt nicht ausgegeben werden kann, sonst null. */
export function spendAttributeProblem(player: Readonly<PlayerState>, attribute: AttributeId): string | null {
  if (!isAttributeId(attribute)) return 'Unbekanntes Attribut.';
  if (player.unspentAttr <= 0) return 'Keine freien Attributpunkte.';
  if (player.attributes[attribute] >= ATTR_MAX) return `${ATTRIBUTE_LABELS[attribute]} ist bereits auf ${ATTR_MAX}.`;
  return null;
}

/** Neuer Basiswert nach Training um `delta`, begrenzt auf 1..10. */
export function trainedValue(before: number, delta: number): number {
  return Math.min(ATTR_MAX, Math.max(ATTR_MIN, before + delta));
}
