// Phasen und Bausteine für die Akt-2-, Akt-3- und Nachspiel-Fassungen der Weltfiguren a–k (world.md §5.3–5.5, act23.json).
// Kein eigener Inhaltsteil: exportiert kein `part`. Die Dateien <figur>-akt23.ts exportieren `TALK_23` (und bei Bedarf
// `SCHEDULE_23`); die Figurdatei hängt sie hinter Rivale/Erstbegegnung bzw. vor den alten Tagesablauf.
// „act: n“ heißt Akt ≥ n; das Nachspiel ist das Flag `epilog`, der Master-Modus `master_modus` ohne Ende 3b.
import type { Condition, DialogueChoice, DialogueDef, DialogueLine, Effect } from '../../../modules/contracts';
import { dialog, knoten } from './_welt';

// ------------------------------------------------------------------------------------------- Phasen

export const AKT2: Condition = { act: 2 };
export const AKT3: Condition = { act: 3 };
export const EPILOG: Condition = { flag: 'epilog' };
export const NUR_AKT2: Condition = { all: [AKT2, { not: AKT3 }] };
/** Ende 3 ohne 3b: Unterstadt feindselig. */
export const MASTER: Condition = { all: [{ flag: 'master_modus' }, { notFlag: 'ende_doch_noch_meer' }] };
export const NICHT_MASTER: Condition = { not: MASTER };
/** Partynacht: Akt 3 läuft, Nachspiel noch nicht. */
export const PARTYNACHT: Condition = { all: [AKT3, { notFlag: 'epilog' }] };
/** Dante in der Crew, Aria wach (main-2-countdown erledigt). */
export const DANTE_DA: Condition = { any: [{ flag: 'dante_beigetreten' }, { quest: 'main-2-countdown', state: 'done' }] };
/** Releaseparty beschlossen (main-2-krisensitzung). */
export const PARTY_GEPLANT: Condition = { any: [{ flag: 'releaseparty_geplant' }, { quest: 'main-2-krisensitzung', state: 'done' }] };
/** Direkt nach dem Bruch: Aria weg oder bewusstlos, Drohnen, Razzien. */
export const A2_CHAOS: Condition = { all: [NUR_AKT2, { not: DANTE_DA }] };
/** Akt 2 bis zur Party-Entscheidung. */
export const A2_OFFEN: Condition = { all: [NUR_AKT2, { not: PARTY_GEPLANT }] };
/** Party-Vorbereitungen laufen. */
export const A2_PARTY: Condition = { all: [NUR_AKT2, PARTY_GEPLANT] };
export const ARIA_GECHIPPT: Condition = { flag: 'aria_gechippt' };
/** Nachspiel nach Ende 1, 2 oder 3b. */
export const NACHSPIEL: Condition = { all: [EPILOG, NICHT_MASTER] };
export const ENDE_MEER: Condition = { any: [{ flag: 'ende_meer' }, { flag: 'ende_doch_noch_meer' }] };
export const ENDE_NEXUS: Condition = { flag: 'ende_neue_nexus' };
export const ENDE_3B: Condition = { flag: 'ende_doch_noch_meer' };
export const BLADE_GEFASST: Condition = { any: [{ flag: 'blade_gefasst' }, { flag: 'blade_angekettet' }] };
/** Strandclub eröffnet (side-strandclub). */
export const CLUB_OFFEN: Condition = { quest: 'side-strandclub', state: 'done' };
/** Fahndung ab Stufe 1. */
export const GESUCHT: Condition = { flag: 'fahndung_1' };

/** Einmal-Gespräch: noch nicht gesehen. Dazu gehört `{ markSeen: id }` im ersten Knoten. */
export const einmal = (id: string, when: Condition): Condition => ({ all: [when, { not: { seen: id } }] });
export const gesehen = (id: string): Effect => ({ markSeen: id });

// ------------------------------------------------------------------------------------------- Beta-Chips (side-ki-fluestern)

export const KI_Q = 'side-ki-fluestern';
export const KI_AKTIV: Condition = { quest: KI_Q, state: 'active' };
export const KI_OFFEN: Condition = { quest: KI_Q, state: 'inactive' };
/** Flag, das side-ki-fluestern beim Befreien setzt (`ki_fluestern_<key>_frei`). */
export const chipFrei = (key: string): Condition => ({ flag: `ki_fluestern_${key}_frei` });
/** Chipträger ab Akt 2 bis zum Nachspiel (danach schalten Ende 1/2/3b die Chips ab), solange nicht befreit. */
export const gechippt = (key: string): Condition => ({ all: [AKT2, { notFlag: 'epilog' }, { not: chipFrei(key) }] });
/** Im Master-Modus laufen die Chips weiter: Wer nicht befreit wurde, nennt die Spielfigur „Master“ – und meint es. */
export const masterChip = (key: string): Condition => ({ all: [MASTER, { not: chipFrei(key) }] });

/**
 * Wahlen im Gespräch mit einer gechippten Figur: Läuft side-ki-fluestern, führt eine Wahl direkt in den Befreiungsdialog
 * der Quest (`ki-<key>`); sonst geht es in den Knoten `hinweis` des eigenen Dialogs (Spur zu Oma Volt bzw. zum Werbestand).
 */
export function chipWahlen(key: string): DialogueChoice[] {
  return [
    { text: 'Den Chip hinterm Ohr genauer ansehen.', tag: '[Master?]', when: KI_AKTIV, effects: [{ dialogue: `ki-${key}` }] },
    { text: '„Wer hat dir das Ding hinters Ohr gepappt?“', when: { not: KI_AKTIV }, next: 'hinweis' },
  ];
}

// ------------------------------------------------------------------------------------------- Gesprächsbau

export interface Frage {
  id: string;
  text: string;
  when?: Condition;
  tag?: string;
  /** Nur einmal wählbar. */
  once?: boolean;
  /** Sichtbar, aber nur wählbar, wenn erfüllt (Geld, Gegenstand). */
  requires?: Condition;
  zeilen: DialogueLine[];
  effects?: Effect[];
}

/** Schlusswahl, die ins alte Tagesgespräch der Figur weiterleitet (Laden, Fragen, Minispiele aus Akt 1). */
export const weiter = (alt: string, text = 'Was anderes.'): DialogueChoice => ({ text, effects: [{ dialogue: alt }] });

/**
 * Phasen-Gespräch: Begrüßung, Fragen (jede kehrt ins Menü zurück), Weiterleitung ins alte Menü, Abschied.
 * `menue`: Zeile beim Zurückkehren aus einer Frage.
 */
export function folge(
  id: string,
  gruss: DialogueLine[],
  menue: DialogueLine,
  fragen: Frage[],
  alt: string | null,
  ende: string,
  effects?: Effect[],
): DialogueDef {
  const wahl: DialogueChoice[] = fragen.map((f) => {
    const c: DialogueChoice = { text: f.text, next: f.id };
    if (f.when) c.when = f.when;
    if (f.tag) c.tag = f.tag;
    if (f.requires) c.requires = f.requires;
    if (f.once) { c.once = true; c.id = f.id; }
    return c;
  });
  if (alt) wahl.push(weiter(alt));
  wahl.push({ text: ende });
  const start = knoten('start', gruss, { choices: wahl });
  if (effects?.length) start.effects = effects;
  return dialog(id, [
    start,
    knoten('menue', [menue], { choices: wahl }),
    ...fragen.map((f) => knoten(f.id, f.zeilen, f.effects?.length ? { next: 'menue', effects: f.effects } : { next: 'menue' })),
  ]);
}

/** Kurzer Dialog ohne Wahl. */
export const kurz = (id: string, lines: DialogueLine[], effects?: Effect[]): DialogueDef =>
  dialog(id, [knoten('start', lines, effects?.length ? { effects } : {})]);
