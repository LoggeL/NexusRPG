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

// ---------------------------------------------------------------------------------------------- Akt 2, Akt 3, Nachspiel

/** Nur Akt 2 (Akt ≥ 2, nicht Akt 3, kein Nachspiel). */
export const AKT2_NUR: Condition = { all: [{ act: 2 }, { not: { act: 3 } }, { notFlag: 'epilog' }] };
/** Partynacht (Akt 3 vor dem Ende). */
export const AKT3_NACHT: Condition = { all: [{ act: 3 }, { notFlag: 'epilog' }] };
/** Nachspiel (alle Enden setzen `epilog`). */
export const EPILOG: Condition = { flag: 'epilog' };
/** Ende 3 „Master“ ohne 3b (wie maps-23/server-kern.ts). */
export const MASTER: Condition = { all: [{ any: [{ flag: 'master_modus' }, { flag: 'ende_master' }] }, { notFlag: 'ende_doch_noch_meer' }] };
/** Ende 3b „Doch noch ans Meer“. */
export const ENDE_3B: Condition = { flag: 'ende_doch_noch_meer' };
/** Ende 2 „Die neue Nexus“. */
export const ENDE_NEXUS: Condition = { all: [{ flag: 'epilog' }, { flag: 'ende_neue_nexus' }] };
/** Ende 1 „Das Meer“ (auch Rückfall für ein Nachspiel ohne Endflag). */
export const ENDE_MEER: Condition = { all: [{ flag: 'epilog' }, { not: MASTER }, { notFlag: 'ende_neue_nexus' }, { notFlag: 'ende_doch_noch_meer' }] };
/** Nachspiel, aber nicht im Master-Modus (Unterstadt freundlich). */
export const EPILOG_FREI: Condition = { all: [{ flag: 'epilog' }, { not: MASTER }] };
/** Variante A: Aria ist gechippt und noch nicht zurück (main-2-countdown offen). */
export const ARIA_GECHIPPT: Condition = { all: [AKT2_NUR, { flag: 'aria_gechippt' }, { not: { quest: 'main-2-countdown', state: 'done' } }] };
/** Aria ist wieder da, Dante in der Crew (main-2-countdown erledigt). */
export const COUNTDOWN_DONE: Condition = { quest: 'main-2-countdown', state: 'done' };
/** Nyra blieb im Turm zurück und ist noch nicht befreit. */
export const NYRA_WEG: Condition = { all: [AKT2_NUR, { flag: 'nyra_zurueckgelassen' }, { notFlag: 'nyra_befreit' }] };
/** Releaseparty steht an (nach der Krisensitzung, vor Akt 3). */
export const PARTY_VORB: Condition = {
  all: [AKT2_NUR, { any: [{ quest: 'main-2-krisensitzung', state: 'done' }, { flag: 'releaseparty_geplant' }] }],
};

/**
 * Phasen-Tagesgespräch: `einmal` (Flag `<npc>_k_<id>`) oder `taeglich` (Flag `heute_<npc>_<id>`, fällt morgens).
 * Ohne beides gilt die Variante, solange `when` gilt. `menue: null` = kurzes Gespräch ohne Menü (Master-Modus).
 */
export interface Phase {
  id: string; when: Condition; gruss: DialogueLine[]; plausch?: DialogueLine[];
  einmal?: boolean; taeglich?: boolean; effects?: Effect[]; ohneMenue?: boolean;
}

export function phasen(npc: string, prefix: string, menue: Menue, list: Phase[]): { dialogues: DialogueDef[]; talk: TalkDef[] } {
  const dialogues: DialogueDef[] = [];
  const talk: TalkDef[] = [];
  for (const p of list) {
    const id = `${prefix}-${p.id}`;
    const key = p.einmal ? `${npc}_k_${p.id}` : p.taeglich ? `heute_${npc}_${p.id}` : undefined;
    const effects: Effect[] = [...(p.effects ?? []), ...(key ? [flag(key)] : [])];
    const when: Condition = key ? { all: [p.when, { notFlag: key }] } : p.when;
    if (p.ohneMenue) {
      const node = knoten('start', [...p.gruss, ...(p.plausch ?? [])]);
      if (effects.length) node.effects = effects;
      dialogues.push(dialog(id, [node]));
    } else {
      dialogues.push(tagesgespraech(id, p.gruss, p.plausch ?? p.gruss.slice(-1), menue, effects.length ? { effects } : {}));
    }
    talk.push(rede(id, when));
  }
  return { dialogues, talk };
}

/** Menü um Akt-2/3-Wahlen ergänzen (vor der letzten Abschiedswahl). */
export function erweitere(menue: Menue, extra: Menue): Menue {
  const choices = [...menue.choices.slice(0, -1), ...extra.choices, ...menue.choices.slice(-1)];
  const nodes = [...menue.nodes, ...extra.nodes].map((n) => (n.id === 'menue' ? { ...n, choices } : n));
  return { choices, nodes };
}
