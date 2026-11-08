// Charaktererstellung als reines Modell (ohne DOM, testbar): Entwurf, Punkteverteilung, Herkunftsboni, Prüfung.
// Die verbindliche Prüfung macht die Kampagne (CampaignPort.createCharacter); hier nur Anzeige und Vorabprüfung.
import { ATTR_FREE_POINTS, ATTR_MAX, ATTR_START, ATTRIBUTE_IDS, ATTRIBUTE_LABELS, NAME_MAX, NAME_MIN } from '../../modules/campaign';
import { finalCreationAttributes, originBonusOptions, type CharacterCreationInput } from '../../modules/character';
import { templateAppearance } from '../../modules/appearance';
import type { AttributeId, GameContent, LookId, OriginDef, OriginId, PlayerAppearance } from '../../modules/contracts';

export interface CreationDraft {
  readonly name: string;
  /** Gewählte bzw. letzte Vorlage. */
  readonly look: LookId;
  /** Aussehen aus dem Charakter-Baukasten. */
  readonly appearance: PlayerAppearance;
  readonly origin: OriginId;
  /** Werte vor dem Herkunftsbonus (je 3 + verteilte Punkte). */
  readonly attributes: Readonly<Record<AttributeId, number>>;
  /** Gewähltes Bonusattribut bei Herkünften mit Wahl (z. B. Knastvogel: Straße oder Körper). */
  readonly originBonus?: AttributeId;
}

export function createDraft(content: GameContent): CreationDraft {
  const look = Object.keys(content.looks)[0] ?? '';
  return {
    name: '',
    look,
    appearance: templateAppearance(content, look),
    origin: Object.keys(content.origins)[0] ?? '',
    attributes: Object.fromEntries(ATTRIBUTE_IDS.map((id) => [id, ATTR_START])) as Record<AttributeId, number>,
  };
}

export const spentPoints = (draft: CreationDraft): number =>
  ATTRIBUTE_IDS.reduce((sum, id) => sum + (draft.attributes[id] - ATTR_START), 0);

export const freePoints = (draft: CreationDraft): number => ATTR_FREE_POINTS - spentPoints(draft);

export const canIncrease = (draft: CreationDraft, attribute: AttributeId): boolean =>
  freePoints(draft) > 0 && draft.attributes[attribute] < ATTR_MAX;

export const canDecrease = (draft: CreationDraft, attribute: AttributeId): boolean =>
  draft.attributes[attribute] > ATTR_START;

export function increase(draft: CreationDraft, attribute: AttributeId): CreationDraft {
  if (!canIncrease(draft, attribute)) return draft;
  return { ...draft, attributes: { ...draft.attributes, [attribute]: draft.attributes[attribute] + 1 } };
}

export function decrease(draft: CreationDraft, attribute: AttributeId): CreationDraft {
  if (!canDecrease(draft, attribute)) return draft;
  return { ...draft, attributes: { ...draft.attributes, [attribute]: draft.attributes[attribute] - 1 } };
}

/** Alle verteilten Punkte zurücknehmen. */
export function resetPoints(draft: CreationDraft): CreationDraft {
  return { ...draft, attributes: Object.fromEntries(ATTRIBUTE_IDS.map((id) => [id, ATTR_START])) as Record<AttributeId, number> };
}

/** Wählbare Bonusattribute der gewählten Herkunft (erstes = Vorauswahl). */
export const bonusOptions = (draft: CreationDraft, content: GameContent): AttributeId[] => originBonusOptions(content, draft.origin);

/** Herkunft wechseln; eine nicht mehr passende Bonuswahl entfällt. */
export function selectOrigin(draft: CreationDraft, origin: OriginId, content: GameContent): CreationDraft {
  const keep = !!draft.originBonus && originBonusOptions(content, origin).includes(draft.originBonus);
  const next: CreationDraft = { name: draft.name, look: draft.look, appearance: draft.appearance, origin, attributes: draft.attributes };
  return keep ? { ...next, originBonus: draft.originBonus } : next;
}

/** Bonusattribut wählen (nur aus den Optionen der Herkunft). */
export function selectBonus(draft: CreationDraft, bonus: AttributeId, content: GameContent): CreationDraft {
  return originBonusOptions(content, draft.origin).includes(bonus) ? { ...draft, originBonus: bonus } : draft;
}

/** Tatsächlich gewährtes Bonusattribut (Wahl oder Vorgabe der Herkunft). */
export function chosenBonus(draft: CreationDraft, content: GameContent): AttributeId | null {
  const options = originBonusOptions(content, draft.origin);
  if (!options.length) return null;
  return draft.originBonus && options.includes(draft.originBonus) ? draft.originBonus : options[0];
}

/** Endwerte inklusive Herkunftsbonus (+1, höchstens 10) – so startet die Figur. */
export function finalAttributes(draft: CreationDraft, content: GameContent): Record<AttributeId, number> {
  return finalCreationAttributes(content, toCharacterInput(draft));
}

/** Grund, warum der Name nicht geht, sonst null. */
export function nameProblem(name: string): string | null {
  const trimmed = name.trim();
  if (trimmed.length < NAME_MIN) return `Der Name braucht mindestens ${NAME_MIN} Zeichen.`;
  if (trimmed.length > NAME_MAX) return `Der Name darf höchstens ${NAME_MAX} Zeichen haben.`;
  // Steuerzeichen und Zeichen, die Inhaltsplatzhalter oder Markup bilden könnten.
  if (/[\u0000-\u001f\u007f<>{}]/.test(trimmed)) return 'Der Name enthält ungültige Zeichen.';
  return null;
}

/** Alle offenen Punkte vor dem Bestätigen (leer = bereit). */
export function draftProblems(draft: CreationDraft, content: GameContent): string[] {
  const problems: string[] = [];
  const name = nameProblem(draft.name);
  if (name) problems.push(name);
  if (!content.looks[draft.look]) problems.push('Bitte ein Aussehen wählen.');
  if (!content.origins[draft.origin]) problems.push('Bitte eine Herkunft wählen.');
  const free = freePoints(draft);
  if (free > 0) problems.push(free === 1 ? 'Es ist noch 1 Attributpunkt frei.' : `Es sind noch ${free} Attributpunkte frei.`);
  return problems;
}

export const toCharacterInput = (draft: CreationDraft): CharacterCreationInput => ({
  name: draft.name.trim(),
  look: draft.look,
  appearance: draft.appearance,
  origin: draft.origin,
  attributes: { ...draft.attributes },
  ...(draft.originBonus ? { originBonus: draft.originBonus } : {}),
});

const signed = (value: number): string => (value >= 0 ? `+${value}` : `−${Math.abs(value)}`);

/** Lesbare Startboni einer Herkunft: Attribut, Gegenstände, Credits, Beziehungen, Ruf. */
export function originBoni(origin: OriginDef, content: GameContent): string[] {
  const options = originBonusOptions(content, origin.id);
  const lines = [options.length > 1 ? `+1 ${options.map((id) => ATTRIBUTE_LABELS[id]).join(' oder ')} (Wahl)` : `+1 ${ATTRIBUTE_LABELS[origin.bonus]}`];
  const items = Object.entries(origin.items ?? {})
    .filter(([, qty]) => qty > 0)
    .map(([id, qty]) => `${content.items[id]?.name ?? id}${qty > 1 ? ` ×${qty}` : ''}`);
  if (items.length) lines.push(`Start: ${items.join(', ')}`);
  if (origin.credits) lines.push(`${origin.credits} Credits`);
  for (const [npc, delta] of Object.entries(origin.relations ?? {})) {
    if (delta) lines.push(`${content.npcs[npc]?.name ?? npc} ♥ ${signed(delta)}`);
  }
  for (const [faction, delta] of Object.entries(origin.rep ?? {})) {
    if (delta) lines.push(`Ruf ${content.factions[faction]?.name ?? faction} ${signed(delta)}`);
  }
  if (origin.tag) lines.push(`Eigene Gesprächsoptionen ${origin.tag}`);
  return lines;
}
