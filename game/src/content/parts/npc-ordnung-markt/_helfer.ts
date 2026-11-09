// Hilfsfunktionen für Richter, Kessel, Dexter, Babette und Kiki (Ordnung und Markt).
// Reine Bausteine ohne eigenen Inhaltsteil – die Figurendateien in diesem Ordner liefern die Teile.
import type {
  AttributeId, CheckDef, Condition, DialogueChoice, DialogueDef, DialogueLine, DialogueNode, Effect, Expression,
  SpeakerId, TalkDef,
} from '../../../modules/contracts';

/** Zeilenbauer je Sprecher: `R('Text', 'wut')`. */
export const sprecher = (speaker: SpeakerId) => (text: string, expr?: Expression): DialogueLine =>
  expr ? { speaker, text, expr } : { speaker, text };

export const ich = sprecher('player');
export const erz = sprecher('narrator');

/** Eingebetteter Check mit eindeutiger ID (world.md nennt für Herz-Ereignisse keine gc-IDs). */
export const pruefung = (id: string, attribute: AttributeId, threshold: number, tags?: string[]): CheckDef =>
  tags ? { id, attribute, threshold, tags } : { id, attribute, threshold };

export const knoten = (id: string, lines: DialogueLine[], rest: Omit<DialogueNode, 'id' | 'lines'> = {}): DialogueNode =>
  ({ id, lines, ...rest });

export const dialog = (id: string, nodes: DialogueNode[], start = 'start'): DialogueDef => ({ id, start, nodes });

/** Sammelt Dialoge zu einem Record (Schlüssel = id). */
export const sammle = (...list: DialogueDef[]): Record<string, DialogueDef> =>
  Object.fromEntries(list.map((d) => [d.id, d]));

/** Gemeinsames Menü der Tagesgespräche einer Figur (Wahlen + Folgeknoten). */
export interface Menue { choices: DialogueChoice[]; nodes: DialogueNode[] }

/**
 * Tagesgespräch: eigene Begrüßung und eigener Plausch je Variante, gemeinsames Menü.
 * `effects` wirken nach der Begrüßung (z. B. Herkunftsbonus einmalig).
 */
export function tagesgespraech(
  id: string, gruss: DialogueLine[], plausch: DialogueLine[], menue: Menue,
  opts: { plauschText?: string; effects?: Effect[] } = {},
): DialogueDef {
  const start = knoten('start', gruss, { choices: [{ text: opts.plauschText ?? 'Und sonst so?', next: 'plausch', id: 'plausch' }, ...menue.choices] });
  if (opts.effects) start.effects = opts.effects;
  return dialog(id, [start, knoten('plausch', plausch, { choices: menue.choices }), ...menue.nodes]);
}

/** Talk-Eintrag. */
export const rede = (dialogue: string, when?: Condition, minHearts?: number): TalkDef => {
  const t: TalkDef = { dialogue };
  if (when) t.when = when;
  if (minHearts !== undefined) t.minHearts = minHearts;
  return t;
};

/** Noch nicht gesehen. */
export const neu = (id: string): Condition => ({ not: { seen: id } });

/** Effekt-Kurzformen. */
export const herz = (npc: string, delta: number): Effect => ({ relation: npc, delta });
export const flag = (name: string, value = true): Effect => (value ? { setFlag: name } : { setFlag: name, value: false });

/** Akt 1: Herz-Ereignisse 8 und 10 erst ab act2 (world.md §11.2). */
export const AB_AKT2: Condition = { act: 2 };
export const NICHT_AKT2: Condition = { not: { act: 2 } };
export const ZEIT_HINWEIS = 'Diese Freundschaft braucht noch Zeit. (Weiter mit Akt 2.)';

/** Spielfigur ist Vex (Strang Vex × Aria). */
export const VEX: Condition = { playerIs: 'vex' };

/**
 * Schwebetaxi-Ziele: alle Akt-1-Außenzonen mit Einstieg `taxi` (world.md §3.3, §11.1).
 * Glasarkaden hat keinen Taxi-Einstieg (Drehkreuz), deshalb fehlt sie.
 */
export const TAXI_ZIELE: readonly (readonly [map: string, name: string])[] = [
  ['neon-gasse', 'Neon-Gasse'], ['schrottmarkt', 'Schrottmarkt'], ['loetgassen', 'Lötgassen'],
  ['rohrsiedlung', 'Rohrsiedlung'], ['bahnhof-mitte', 'Bahnhof Mitte'], ['hafenkante', 'Hafenkante'],
  ['stufenplatz', 'Stufenplatz'], ['eisenhof', 'Eisenhof'], ['digitech-areal', 'Digitech-Areal'],
  ['flutmauer', 'Flutmauer'],
];
