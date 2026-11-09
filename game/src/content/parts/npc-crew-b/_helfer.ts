// Hilfsfunktionen für Vega, Nyra, Captain Kuschel und Jimmy (kein eigener Inhaltsteil: exportiert kein `part`).
import type {
  AttributeId, CheckDef, Condition, CutsceneBeat, CutsceneDef, DialogueChoice, DialogueDef, DialogueLine,
  DialogueNode, Effect, Expression, PhoneMessageDef, ScheduleEntry, SpeakerId, TalkDef,
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

/** Bedingung „mindestens `k` verschiedene der Gegenstände im Inventar“ (Engine-Bedingung `atLeast`). */
export function mindestens(items: readonly string[], k: number): Condition {
  return { atLeast: items.map((item) => ({ item })), min: k };
}

/**
 * `once` gilt je Dialog-ID; geteilte Menüs stecken aber in vielen Tagesgespräch-Varianten. Damit Herz-Boni aus
 * einmaligen Wahlen nicht pro Variante neu zu holen sind, bekommt jede `once`-Wahl ein globales Flag `einmal_<prefix>_<id>`.
 */
export function einmalig(prefix: string, list: DialogueChoice[]): DialogueChoice[] {
  return list.map((choice) => {
    if (!choice.once) return choice;
    const key = `einmal_${prefix}_${(choice.id ?? choice.next ?? 'wahl').replace(/-/g, '_')}`;
    const guard: Condition = { notFlag: key };
    return {
      ...choice,
      when: choice.when ? { all: [choice.when, guard] } : guard,
      effects: [...(choice.effects ?? []), { setFlag: key }],
    };
  });
}

// ---------------------------------------------------------------------------------------------- Akt 2, Akt 3, Nachspiel

/** Akt 2 läuft (Akt ≥ 2, noch nicht Akt 3). */
export const AKT2: Condition = { all: [{ act: 2 }, { not: { act: 3 } }] };
/** Akt ≥ 2 und kein Nachspiel. */
export const AB_AKT2: Condition = { all: [{ act: 2 }, { notFlag: 'epilog' }] };
/** Die Nacht der Releaseparty (Akt 3 vor dem Nachspiel). */
export const PARTYNACHT: Condition = { all: [{ act: 3 }, { notFlag: 'epilog' }] };
/** Nachspiel (alle Enden setzen `epilog`). */
export const EPILOG: Condition = { flag: 'epilog' };
/** Ende 3 ohne 3b: Master-Modus, Crew feindselig. */
export const MASTER: Condition = { all: [{ flag: 'master_modus' }, { notFlag: 'ende_doch_noch_meer' }] };
/** Nachspiel ohne Master-Modus. */
export const NACHSPIEL: Condition = { all: [EPILOG, { not: MASTER }] };
export const ENDE_MEER: Condition = { flag: 'ende_meer' };
export const ENDE_NEXUS: Condition = { flag: 'ende_neue_nexus' };
export const ENDE_3B: Condition = { flag: 'ende_doch_noch_meer' };
/** Dante ist in der Crew (main-2-countdown). */
export const DANTE_CREW: Condition = { quest: 'main-2-countdown', state: 'done' };
/** Variante A des Bruchs, Aria noch nicht wach. */
export const ARIA_WEG: Condition = { all: [{ flag: 'aria_gechippt' }, { not: DANTE_CREW }] };
/** Aria war gechippt und ist wieder da. */
export const ARIA_ZURUECK: Condition = { all: [{ flag: 'aria_gechippt' }, DANTE_CREW] };
/** Nyra sitzt im Turm (seit main-2-bruch, bis main-3-labor). */
export const NYRA_IM_TURM: Condition = {
  all: [{ flag: 'nyra_zurueckgelassen' }, { notFlag: 'nyra_befreit' }, { not: { quest: 'main-3-labor', state: 'done' } }],
};
/** Releaseparty beschlossen (Krisensitzung). */
export const PARTY_PLAN: Condition = { any: [{ flag: 'releaseparty_geplant' }, { quest: 'main-2-krisensitzung', state: 'done' }] };
/** Alle nötigen Party-Vorbereitungen sind erledigt, die Party steht bevor. */
export const PARTY_BEREIT: Condition = { all: [{ flag: 'party_bereit' }, { not: { act: 3 } }] };
/** Irgendeine Romanze-Nacht der Spielfigur (world.md §4.7 „Morgen danach“). */
export const NAECHTE = ['aria_nacht', 'hunter_nacht', 'dante_nacht', 'collin_nacht', 'collin-charleston_nacht', 'lio-funkel_nacht', 'vexaria_nacht'] as const;
export const IRGENDEINE_NACHT: Condition = { any: NAECHTE.map((f) => ({ flag: f })) };

/** Was ein Akt-2/3-Modul einer Figur beisteuert (die Hauptdatei mischt es in NpcDef und Teil). */
export interface Akt23 {
  dialogues: DialogueDef[];
  /** Vor die Akt-1-Tagesgespräche gestellt (nach der Rivalität). */
  talk: TalkDef[];
  /** Vor die Akt-1-Tagesabläufe gestellt. */
  schedule: ScheduleEntry[];
  phone?: Record<string, PhoneMessageDef>;
  cutscenes?: Record<string, CutsceneDef>;
}
