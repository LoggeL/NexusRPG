// Hilfsfunktionen für die Crew-Figuren Hunter, Raven und Dante (kein eigener Inhaltsteil: exportiert kein `part`).
import type {
  AttributeId, CheckDef, Condition, CutsceneBeat, CutsceneDef, DialogueChoice, DialogueDef, DialogueLine,
  DialogueNode, Effect, Expression, SpeakerId, TalkDef,
} from '../../../modules/contracts';

/** Zeilenbauer je Sprecher: `H('Text', 'wut')`. */
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

/** Sammelt Dialoge zu einem Record (Schlüssel = id). */
export const sammle = (...list: DialogueDef[]): Record<string, DialogueDef> =>
  Object.fromEntries(list.map((d) => [d.id, d]));

export const sammleSzenen = (...list: CutsceneDef[]): Record<string, CutsceneDef> =>
  Object.fromEntries(list.map((c) => [c.id, c]));

/** Abblende auf Schwarz (Romanzen: Nacht nur angedeutet). */
export const abblende = (caption: string): CutsceneBeat => ({ image: 'black', fade: 'out', caption, hold: 1400 });

/**
 * Tagesgespräch aus Begrüßung + gemeinsamem Menü: Jede Variante bekommt eigene Begrüßung und eigenen Plausch
 * (Knoten `plausch`), das Menü (Wahlen und Folgeknoten) ist für alle Varianten gleich.
 */
export interface Menue { choices: DialogueChoice[]; nodes: DialogueNode[] }

export function tagesgespraech(
  id: string, gruss: DialogueLine[], plausch: DialogueLine[], menue: Menue,
  opts: { plauschText?: string; effects?: Effect[] } = {},
): DialogueDef {
  const start = knoten('start', gruss, { choices: [{ text: opts.plauschText ?? 'Und sonst so?', next: 'plausch', id: 'plausch' }, ...menue.choices] });
  if (opts.effects) start.effects = opts.effects;
  return dialog(id, [
    start,
    knoten('plausch', plausch, { choices: menue.choices }),
    ...menue.nodes,
  ]);
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

/** Hinweis für Herz-Ereignisse 8/10 in Akt 1 (world.md §11.2). */
export const ZEIT_HINWEIS = 'Diese Freundschaft braucht noch Zeit. (Weiter mit Akt 2.)';
