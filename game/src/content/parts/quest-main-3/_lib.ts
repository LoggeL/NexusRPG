// Kleine Helfer für den Hauptstrang Akt 3 (quest-main-3). Keine eigene `part`-Ausfuhr: wird nur importiert.
import type { Condition, DialogueChoice, DialogueLine, Effect, Expression, SpeakerId } from '../../../modules/contracts';

/** Dialogzeile mit optionalem Ausdruck. */
export const l = (speaker: SpeakerId, text: string, expr?: Expression): DialogueLine =>
  expr ? { speaker, text, expr } : { speaker, text };

/** Erzählzeile. */
export const nar = (text: string): DialogueLine => ({ speaker: 'narrator', text });

/** Visier-Anzeige des Kameramanns (spricht nie). */
export const visier = (text: string): DialogueLine => ({ speaker: 'kameramann', text: `[ ${text} ]` });

export const active = (quest: string): Condition => ({ quest, state: 'active' });
export const done = (quest: string): Condition => ({ quest, state: 'done' });
export const flag = (name: string): Condition => ({ flag: name });
export const noFlag = (name: string): Condition => ({ notFlag: name });
export const all = (...conditions: Condition[]): Condition => ({ all: conditions });
export const any = (...conditions: Condition[]): Condition => ({ any: conditions });
export const not = (condition: Condition): Condition => ({ not: condition });
export const item = (id: string): Condition => ({ item: id });
export const hearts = (npc: string, min: number): Condition => ({ hearts: npc, min });
export const won = (encounter: string): Condition => ({ won: encounter });

export const set = (name: string): Effect => ({ setFlag: name });
export const herz = (npc: string, delta: number): Effect => ({ relation: npc, delta });

/** Spielfigur ist Vex Schrapnell. */
export const VEX: Condition = { playerIs: 'vex' };
export const NOT_VEX: Condition = not(VEX);
/** Vex und Aria sind zusammen (Romanzefassung des Strangs). */
export const VEX_ARIA_ZUSAMMEN: Condition = all(VEX, flag('aria_romanze_zusammen'));

/** Partynacht: Akt 3, aber noch nicht im Nachspiel. */
export const PARTYNACHT: Condition = all({ act: 3 }, noFlag('epilog'));

export const Q_EINLASS = 'main-3-einlass';
export const Q_LABOR = 'main-3-labor';
export const Q_GEDANKEN = 'main-3-gedankenkontrolle';
export const Q_NEXUS = 'main-3-nexus';
export const Q_BLADE = 'main-3-blade';

/** Die Crew, deren Herzen beim Chip zählen (world.md §5.4: „≥ 3 Crew-Figuren auf ♥6“). */
export const CREW = ['hunter', 'raven', 'dante', 'vega', 'aria', 'nyra'] as const;
export const CREW_HAELT_DICH: Condition = { atLeast: CREW.map(npc => hearts(npc, 6)), min: 3 };

/**
 * Öffentliche Meinung (`meinung` −3…+3, world.md §5.4). Akt 1/2 setzen `meinung_plus_*`-Flags; das Interview
 * rechnet sie ein und legt das Ergebnis als Flags `meinung_m3` … `meinung_p3` ab, dazu `meinung_positiv` (≥ +1),
 * `meinung_hoch` (≥ +2) und `meinung_negativ` (≤ −1).
 */
export const MEINUNG_PLUS_FLAGS = [
  'meinung_plus_blitz', 'meinung_plus_chrome10', 'meinung_plus_collin_glatze', 'meinung_plus_live',
  'meinung_plus_ki_fluestern', 'meinung_plus_schlafwandler', 'meinung_plus_kopfgeld', 'meinung_plus_pixel',
  'meinung_plus_quelle', 'meinung_plus_offene_werkstatt',
] as const;
export const MEINUNG_POSITIV: Condition = flag('meinung_positiv');
export const MEINUNG_NEGATIV: Condition = flag('meinung_negativ');

/** Welche Upload-Entscheidung gefallen ist (main-3-nexus). */
export const UPLOAD = {
  stick: flag('upload_stick'),
  umschreiben: flag('upload_umschreiben'),
  ueberzeugt: flag('upload_ueberzeugt'),
  master: flag('upload_master'),
} as const;
export const UPLOAD_GEFALLEN: Condition = any(UPLOAD.stick, UPLOAD.umschreiben, UPLOAD.ueberzeugt, UPLOAD.master);

/**
 * „Bis 20:00 warten“: eine Wahl je halbe Stunde zwischen 06:00 und 19:30, sichtbar ist genau die passende.
 * Springt auf etwa 20:00 (die Party beginnt bei Dunkelheit).
 */
export function waitUntilEvening(text: string, next: string, extra: Effect[] = []): DialogueChoice[] {
  const out: DialogueChoice[] = [];
  for (let from = 360; from < 1170; from += 30) {
    out.push({
      text,
      id: `warten-${from}`,
      when: { clockBetween: [from, from + 30] },
      next,
      effects: [{ advanceTime: Math.max(10, 1200 - from - 15) }, ...extra],
    });
  }
  return out;
}

/** Eine einzige sichtbare „Weiter“-Wahl je Bedingung (verzweigt still nach Zustand). */
export const branch = (text: string, cases: readonly { when: Condition; next: string; effects?: Effect[] }[]): DialogueChoice[] =>
  cases.map((c, i) => ({ text, id: `zweig-${c.next}-${i}`, when: c.when, next: c.next, ...(c.effects ? { effects: c.effects } : {}) }));
