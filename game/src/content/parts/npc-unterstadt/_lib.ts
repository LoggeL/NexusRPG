// Hilfsfunktionen für die Unterstadt-Figuren Lio, Marla, Pim, Nebelhorn, Gully und Bolzen
// (kein eigener Inhaltsteil: exportiert kein `part`).
import type {
  AttributeId, CheckDef, Condition, CutsceneBeat, CutsceneDef, DialogueChoice, DialogueDef, DialogueLine,
  DialogueNode, Effect, Expression, HeartEventDef, MapId, SpeakerId, TalkDef, TimeSlot,
} from '../../../modules/contracts';

/** Zeilenbauer je Sprecher: `L('Text', 'freude')`. */
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

/** Abblende auf Schwarz (Romanzen: Nacht nur angedeutet). */
export const abblende = (caption: string): CutsceneBeat => ({ image: 'black', fade: 'out', caption, hold: 1400 });

/** Gemeinsames Menü eines Tagesgesprächs: Wahlen plus ihre Folgeknoten. */
export interface Menue { choices: DialogueChoice[]; nodes: DialogueNode[] }

/**
 * Tagesgespräch aus Begrüßung + gemeinsamem Menü. Jede Variante hat eigene Begrüßung und eigenen Plausch
 * (Knoten `plausch`); Menü und Folgeknoten teilen sich alle Varianten einer Figur.
 */
export function tagesgespraech(
  id: string, gruss: DialogueLine[], plausch: DialogueLine[], menue: Menue,
  opts: { plauschText?: string; effects?: Effect[] } = {},
): DialogueDef {
  const start = knoten('start', gruss, { choices: [{ text: opts.plauschText ?? 'Und sonst so?', next: 'plausch', id: 'plausch' }, ...menue.choices] });
  if (opts.effects) start.effects = opts.effects;
  return dialog(id, [start, knoten('plausch', plausch, { choices: menue.choices }), ...menue.nodes]);
}

/** Talk-Eintrag (erster passender gewinnt). */
export const rede = (dialogue: string, when?: Condition, minHearts?: number): TalkDef => {
  const t: TalkDef = { dialogue };
  if (when) t.when = when;
  if (minHearts !== undefined) t.minHearts = minHearts;
  return t;
};

export const alle = (...list: Condition[]): Condition => ({ all: list });
export const eins = (...list: Condition[]): Condition => ({ any: list });
export const nicht = (c: Condition): Condition => ({ not: c });
/** Noch nicht gesehen. */
export const neu = (id: string): Condition => ({ not: { seen: id } });
export const AKT2: Condition = { act: 2 };
export const VOR_AKT2: Condition = { not: { act: 2 } };

/** Effekt-Kurzformen. */
export const herz = (npc: string, delta: number): Effect => ({ relation: npc, delta });
export const flag = (name: string, value = true): Effect => (value ? { setFlag: name } : { setFlag: name, value: false });

/** Hinweis für Herz-Ereignisse 8/10 in Akt 1 (world.md §11.2). */
export const ZEIT_HINWEIS = 'Diese Freundschaft braucht noch Zeit. (Weiter mit Akt 2.)';

/** Herz-Ereignis-Kurzform. */
export function herzEreignis(
  id: string, hearts: number, map: MapId, time: TimeSlot | TimeSlot[] | undefined, when?: Condition, cutscene?: string,
): HeartEventDef {
  const e: HeartEventDef = { id, hearts, map, dialogue: id };
  if (time) e.time = time;
  if (when) e.when = when;
  if (cutscene) e.cutscene = cutscene;
  return e;
}

/**
 * `once` gilt je Dialog-ID. Geteilte Menüs stecken in mehreren Tagesgesprächen – damit Belohnungen nicht je Variante
 * erneut abholbar sind, werden einmalige Wahlen hier auf ein Flag `<prefix>_<id>` umgestellt.
 */
export function einmalig(prefix: string, list: DialogueChoice[]): DialogueChoice[] {
  return list.map((c) => {
    if (!c.once || !c.id) return c;
    const key = `${prefix}_${c.id}`;
    const { once: _once, ...rest } = c;
    void _once;
    return {
      ...rest,
      when: c.when ? { all: [c.when, { notFlag: key }] } : { notFlag: key },
      effects: [...(c.effects ?? []), { setFlag: key }],
    };
  });
}
