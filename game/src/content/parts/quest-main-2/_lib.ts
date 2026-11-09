// Kleine Helfer für den Hauptstrang Akt 2 (quest-main-2). Keine eigene `part`-Ausfuhr: wird nur importiert.
import type {
  CheckDef, AttributeId, Condition, DialogueChoice, DialogueDef, DialogueLine, DialogueNode, Effect, Expression, SpeakerId,
} from '../../../modules/contracts';

// ---------------------------------------------------------------------------------------------- Zeilen und Knoten

/** Dialogzeile mit optionalem Ausdruck. */
export const l = (speaker: SpeakerId, text: string, expr?: Expression): DialogueLine =>
  expr ? { speaker, text, expr } : { speaker, text };
/** Erzählzeile. */
export const nar = (text: string): DialogueLine => ({ speaker: 'narrator', text });
/** Dialogknoten. */
export const node = (id: string, lines: DialogueLine[], rest: Omit<DialogueNode, 'id' | 'lines'> = {}): DialogueNode =>
  ({ id, lines, ...rest });
/** Dialog mit Startknoten „start“. */
export const dlg = (id: string, nodes: DialogueNode[], start = 'start'): DialogueDef => ({ id, start, nodes });
/** Eingebetteter Check für Wege, zu denen world.md keine gc-Nummer nennt (eigene, sprechende ID). */
export const pruef = (id: string, attribute: AttributeId, threshold: number, tags: string[] = []): CheckDef =>
  ({ id, attribute, threshold, tags });

// ---------------------------------------------------------------------------------------------- Bedingungen

export const active = (quest: string): Condition => ({ quest, state: 'active' });
export const done = (quest: string): Condition => ({ quest, state: 'done' });
export const inactive = (quest: string): Condition => ({ quest, state: 'inactive' });
export const step = (quest: string, id: string): Condition => ({ questStep: quest, step: id });
export const flag = (name: string): Condition => ({ flag: name });
export const noFlag = (name: string): Condition => ({ notFlag: name });
export const item = (id: string, min = 1): Condition => (min === 1 ? { item: id } : { item: id, min });
export const noItem = (id: string): Condition => ({ noItem: id });
export const all = (...conditions: Condition[]): Condition => ({ all: conditions });
export const any = (...conditions: Condition[]): Condition => ({ any: conditions });
export const not = (c: Condition): Condition => ({ not: c });
export const hearts = (npc: string, min: number): Condition => ({ hearts: npc, min });
export const companion = (npc: string): Condition => ({ companion: npc });
export const won = (encounter: string): Condition => ({ won: encounter });

export const ACT2: Condition = { act: 2 };
export const ACT3: Condition = { act: 3 };
/** Akt 2 läuft (Akt 3 noch nicht begonnen). */
export const NUR_ACT2: Condition = all(ACT2, not(ACT3));

/** Spielfigur ist Vex Schrapnell (world.md §2.1a). */
export const VEX: Condition = { playerIs: 'vex' };
export const NOT_VEX: Condition = not(VEX);
/** Aria-Romanze angebahnt oder zusammen (Wert-Flags nach world.md §4.7). */
export const ARIA_NAH: Condition = any(flag('aria_romanze_angebahnt'), flag('aria_romanze_zusammen'));

/** Jimmy wurde in Akt 1 gerettet (side-jimmys-chip). */
export const JIMMY_GERETTET: Condition = any(done('side-jimmys-chip'), flag('jimmy_gerettet'));

// ---------------------------------------------------------------------------------------------- Effekte

export const set = (name: string, value = true): Effect => (value ? { setFlag: name } : { setFlag: name, value: false });
export const herz = (npc: string, delta: number): Effect => ({ relation: npc, delta });
export const msg = (text: string): Effect => ({ message: text });
export const xp = (amount: number): Effect => ({ xp: amount });

/** Crew-Mitglieder des Hauptstrangs (für Herzen „alle Crew“ und das Zurücksetzen der Party). */
export const CREW = ['hunter', 'raven', 'dante', 'vega', 'aria', 'nyra', 'jimmy'] as const;
/** Alle aus der Party nehmen (bleiben in der Crew). Lehnt nie ab. */
export const PARTY_LEEREN: Effect[] = CREW.map(npc => ({ dismiss: npc }));
/** Herzen für alle, die gerade zur Crew gehören (ohne Nyra, die im Turm sitzt). */
export const CREW_HERZEN = (delta: number): Effect[] =>
  (['hunter', 'raven', 'dante', 'vega', 'aria'] as const).map(npc => herz(npc, delta));

// ---------------------------------------------------------------------------------------------- Uhr

/** Uhrzeiten in Minuten seit 0:00 (06:00 = 360 … 02:00 = 1560). */
export const UHR = (h: number, m = 0): number => h * 60 + m;

/**
 * Wartewahl: Je Zeitfenster eine sichtbare Wahl, die die Uhr auf `target` (bzw. knapp dahinter) vorstellt.
 * Es gibt keinen Effekt „Uhr stellen“, darum diese Treppe; immer genau eine Stufe ist sichtbar.
 */
export function waitChoices(
  idPrefix: string, text: string, from: number, target: number, next: string | undefined, extra: Effect[] = [], stepMin = 15,
): DialogueChoice[] {
  const out: DialogueChoice[] = [];
  for (let t = from; t < target; t += stepMin) {
    out.push({
      id: `${idPrefix}-${t}`,
      text,
      when: { clockBetween: [t, Math.min(t + stepMin, target)] },
      effects: [{ advanceTime: target - t }, ...extra],
      ...(next ? { next } : {}),
    });
  }
  return out;
}

// ---------------------------------------------------------------------------------------------- Party-Vorbereitungen

/** Die sechs Party-Vorbereitungen (world.md §5.3) und ihre Abschluss-Flags (act23.json `flags.act2`). */
export const PARTY_PREPS = ['outfits', 'ausweise', 'gaesteliste', 'fahrzeug', 'turm_plan', 'gegenmittel'] as const;
export type PartyPrep = (typeof PARTY_PREPS)[number];
export const partyPrepFlag = (key: PartyPrep): string => `prep_${key}`;
export const partyPrepQuest = (key: PartyPrep): string => `prep-${key.replace('_', '-')}`;
/** Mindestens drei der sechs Vorbereitungen erledigt. */
export const DREI_PREPS: Condition = { atLeast: PARTY_PREPS.map(k => flag(partyPrepFlag(k))), min: 3 };
/** Startbedingung aller Party-Vorbereitungen: Hunters Plan aus der Krisensitzung. */
export const PLAN_STEHT: Condition = flag('releaseparty_geplant');

/** Kurzer Hinweis für die Quest-Zusammenfassungen. */
export const PREP_HINWEIS = 'Mindestens drei von sechs Vorbereitungen, dann an der Planungstafel die Releaseparty starten.';
