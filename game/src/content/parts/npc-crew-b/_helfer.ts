// Hilfsfunktionen für Vega, Nyra, Captain Kuschel und Jimmy (kein eigener Inhaltsteil: exportiert kein `part`).
import type {
  AttributeId, CheckDef, Condition, CutsceneBeat, CutsceneDef, DialogueChoice, DialogueDef, DialogueLine,
  DialogueNode, Effect, Expression, SpeakerId, TalkDef,
} from '../../../modules/contracts';

/** Zeilenbauer je Sprecher: `V('Text', 'wut')`. */
export const sprecher = (speaker: SpeakerId) => (text: string, expr?: Expression): DialogueLine =>
  expr ? { speaker, text, expr } : { speaker, text };

export const ich = sprecher('player');
export const erz = sprecher('narrator');

/** Eingebetteter Check (eindeutige ID, sichtbare Schwelle). */
export const pruefung = (id: string, attribute: AttributeId, threshold: number, tags?: string[]): CheckDef =>
  tags ? { id, attribute, threshold, tags } : { id, attribute, threshold };

export const knoten = (id: string, lines: DialogueLine[], rest: Omit<DialogueNode, 'id' | 'lines'> = {}): DialogueNode =>
  ({ id, lines, ...rest });

export const dialog = (id: string, nodes: DialogueNode[], start = 'start'): DialogueDef => ({ id, start, nodes });

export const sammle = (...list: DialogueDef[]): Record<string, DialogueDef> =>
  Object.fromEntries(list.map((d) => [d.id, d]));

export const sammleSzenen = (...list: CutsceneDef[]): Record<string, CutsceneDef> =>
  Object.fromEntries(list.map((c) => [c.id, c]));

export const abblende = (caption: string): CutsceneBeat => ({ image: 'black', fade: 'out', caption, hold: 1400 });

/** Gemeinsames Menü: Wahlen plus Folgeknoten (für alle Tagesgespräch-Varianten einer Figur gleich). */
export interface Menue { choices: DialogueChoice[]; nodes: DialogueNode[] }

/** Tagesgespräch: eigene Begrüßung und eigener Plausch je Variante, gemeinsames Menü. */
export function tagesgespraech(
  id: string, gruss: DialogueLine[], plausch: DialogueLine[], menue: Menue,
  opts: { plauschText?: string; effects?: Effect[] } = {},
): DialogueDef {
  const start = knoten('start', gruss, { choices: [{ text: opts.plauschText ?? 'Und sonst so?', next: 'plausch', id: 'plausch' }, ...menue.choices] });
  if (opts.effects) start.effects = opts.effects;
  return dialog(id, [start, knoten('plausch', plausch, { choices: menue.choices }), ...menue.nodes]);
}

export const rede = (dialogue: string, when?: Condition, minHearts?: number): TalkDef => {
  const t: TalkDef = { dialogue };
  if (when) t.when = when;
  if (minHearts !== undefined) t.minHearts = minHearts;
  return t;
};

export const neu = (id: string): Condition => ({ not: { seen: id } });
export const herz = (npc: string, delta: number): Effect => ({ relation: npc, delta });
export const flag = (name: string, value = true): Effect => (value ? { setFlag: name } : { setFlag: name, value: false });
export const gesehen = (id: string): Effect => ({ markSeen: id });

export const done = (quest: string): Condition => ({ quest, state: 'done' });
export const aktiv = (quest: string): Condition => ({ quest, state: 'active' });
export const offen = (quest: string): Condition => ({ quest, state: 'inactive' });

/** Spielt man die fertige Figur Vex Schrapnell? */
export const VEX: Condition = { playerIs: 'vex' };

/** Hinweis für Herz-Ereignisse 8/10 in Akt 1 (world.md §11.2). */
export const ZEIT_HINWEIS = 'Diese Freundschaft braucht noch Zeit. (Weiter mit Akt 2.)';

/** Alle k-Kombinationen einer Liste (für „mindestens k verschiedene Sammelobjekte“). */
function kombinationen<T>(liste: readonly T[], k: number): T[][] {
  if (k === 0) return [[]];
  if (liste.length < k) return [];
  const [kopf, ...rest] = liste;
  return [...kombinationen(rest, k - 1).map((c) => [kopf as T, ...c]), ...kombinationen(rest, k)];
}

/** Bedingung „mindestens `k` verschiedene der Gegenstände im Inventar“ (ohne Zähler-Mechanik in der Engine). */
export function mindestens(items: readonly string[], k: number): Condition {
  return { any: kombinationen(items, k).map((c) => ({ all: c.map((item) => ({ item })) })) };
}
