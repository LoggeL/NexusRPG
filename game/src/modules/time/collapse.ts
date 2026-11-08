// Zusammenbruch um 02:00 (design.md §3.4, world.md §3.8): Aufwachen im Unterschlupf mit −10 % Credits und einer
// humorvollen Notiz. Notschlafplätze (z. B. Dantes Sofa ab ♥4) verhindern den Verlust: Wer dort einschläft, wacht
// dort auf.
import type { Condition, MapDef, MapId } from '../contracts';

export const COLLAPSE_CREDIT_PERCENT = 10;

/** Notiz nach dem Zusammenbruch: fester Text oder Text mit Bedingung (z. B. erst ab `act2`). */
export type CollapseNote = string | { text: string; when?: Condition };

/**
 * Notschlafplatz auf einer Karte. Bis der Vertrag `MapDef.shelter` kennt (Vertragswunsch in docs/engine-notes.md),
 * liest `shelterOf` das Feld tolerant aus der Kartendefinition.
 */
export interface ShelterDef {
  /** Einstieg auf dieser Karte zum Aufwachen (Standard: Bett bzw. aktuelle Stelle). */
  entry?: string;
  /** Nur nutzbar, wenn erfüllt (z. B. `{ hearts: 'dante', min: 4 }`). */
  when?: Condition;
  /** Credits bleiben erhalten (Standard true). */
  keepCredits?: boolean;
  /** Erholung beim Aufwachen (Standard volle LP). */
  heal?: 'full' | number;
  /** Eigene Notizen statt der Unterschlupf-Notizen. */
  notes?: readonly CollapseNote[];
}

export interface HomeDef { map: MapId; entry: string; collapseNotes?: readonly CollapseNote[] }

export interface CollapseInput {
  credits: number;
  seed: number;
  /** Spieltag, der gerade endet. */
  day: number;
  /** Karte, auf der die Spielfigur zusammenbricht. */
  map: MapId;
  home: HomeDef;
  /** Notschlafplatz der aktuellen Karte (falls vorhanden). */
  shelter?: ShelterDef | null;
  evaluate(condition?: Condition): boolean;
}

export interface CollapsePlan {
  /** Verlorene Credits (abgerundet). */
  lost: number;
  wake: { map: MapId; entry?: string };
  /** Auf einem Notschlafplatz eingeschlafen. */
  sheltered: boolean;
  heal: 'full' | number;
  note: string | null;
}

/** Verlust beim Zusammenbruch: abgerundete Prozent der Credits, nie negativ. */
export function collapseLoss(credits: number, percent = COLLAPSE_CREDIT_PERCENT): number {
  if (!Number.isFinite(credits) || credits <= 0) return 0;
  return Math.max(0, Math.floor((credits * Math.max(0, percent)) / 100));
}

/** Stabiler Hash (FNV-1a) für die Auswahl der Notiz. */
export function hashKey(text: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash >>> 0;
}

const noteText = (note: CollapseNote): string => (typeof note === 'string' ? note : note.text);

/** Deterministische Notiz aus den erfüllten Einträgen (gleiche Partie und gleicher Tag → gleiche Notiz). */
export function pickCollapseNote(notes: readonly CollapseNote[] | undefined, seed: number, day: number, evaluate: CollapseInput['evaluate']): string | null {
  const usable = (notes ?? []).filter(note => typeof note === 'string' || evaluate(note.when)).map(noteText).filter(text => text.length > 0);
  if (!usable.length) return null;
  return usable[hashKey(`${seed}:${day}`) % usable.length];
}

/** Notschlafplatz einer Karte (tolerant gelesen, bis `MapDef.shelter` im Vertrag steht). */
export function shelterOf(map: MapDef | undefined): ShelterDef | null {
  const raw = map ? (map as MapDef & { shelter?: unknown }).shelter : undefined;
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  return raw as ShelterDef;
}

/** Was beim Zusammenbruch passiert: Ort des Aufwachens, Verlust, Erholung und Notiz. */
export function collapsePlan(input: CollapseInput): CollapsePlan {
  const shelter = input.shelter && input.evaluate(input.shelter.when) ? input.shelter : null;
  if (shelter) {
    const wake: CollapsePlan['wake'] = { map: input.map };
    if (shelter.entry) wake.entry = shelter.entry;
    return {
      lost: shelter.keepCredits === false ? collapseLoss(input.credits) : 0,
      wake,
      sheltered: true,
      heal: shelter.heal ?? 'full',
      note: pickCollapseNote(shelter.notes, input.seed, input.day, input.evaluate),
    };
  }
  return {
    lost: collapseLoss(input.credits),
    wake: { map: input.home.map, entry: input.home.entry },
    sheltered: false,
    heal: 'full',
    note: pickCollapseNote(input.home.collapseNotes, input.seed, input.day, input.evaluate),
  };
}
