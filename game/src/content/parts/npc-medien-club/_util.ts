// Bausteine für die Figuren Ripper, Barkeeper, Kameramann, Collin Charleston und Delya Delloraine.
// Keine Inhaltsdatei (kein `part`), nur Hilfen für die Dateien in diesem Ordner.
import type {
  AttributeId, CheckDef, Condition, CutsceneBeat, CutsceneDef, DialogueChoice, DialogueDef, DialogueLine,
  DialogueNode, Effect, Expression, SpeakerId, TalkDef,
} from '../../../modules/contracts';

/** Zeilenbauer je Sprecher: `R('Text', 'wut')`. */
export const sp = (speaker: SpeakerId) => (text: string, expr?: Expression): DialogueLine =>
  expr ? { speaker, text, expr } : { speaker, text };

export const ich = sp('player');
export const erz = sp('narrator');

/** Eingebetteter Check mit eindeutiger ID. */
export const chk = (id: string, attribute: AttributeId, threshold: number, tags?: string[]): CheckDef =>
  tags ? { id, attribute, threshold, tags } : { id, attribute, threshold };

export const node = (id: string, lines: DialogueLine[], rest: Omit<DialogueNode, 'id' | 'lines'> = {}): DialogueNode =>
  ({ id, lines, ...rest });

export const dlg = (id: string, nodes: DialogueNode[], start = 'start'): DialogueDef => ({ id, start, nodes });

export const byId = <T extends { id: string }>(list: T[]): Record<string, T> =>
  Object.fromEntries(list.map((x) => [x.id, x]));

export const talk = (dialogue: string, when?: Condition, minHearts?: number): TalkDef => {
  const t: TalkDef = { dialogue };
  if (when) t.when = when;
  if (minHearts !== undefined) t.minHearts = minHearts;
  return t;
};

// Bedingungen
export const all = (...list: Condition[]): Condition => ({ all: list });
export const any = (...list: Condition[]): Condition => ({ any: list });
export const not = (c: Condition): Condition => ({ not: c });
export const seen = (id: string): Condition => ({ seen: id });
export const flag = (f: string): Condition => ({ flag: f });
export const noFlag = (f: string): Condition => ({ notFlag: f });
export const hearts = (npc: string, min: number): Condition => ({ hearts: npc, min });
export const VEX: Condition = { playerIs: 'vex' };
export const NOT_VEX: Condition = { not: VEX };
export const AKT2: Condition = { act: 2 };
export const AKT1: Condition = { not: { act: 2 } };
/** Vex × Aria sind zusammen (Kuss gesehen oder Status zusammen). */
export const VEXARIA: Condition = { all: [VEX, { any: [{ flag: 'aria_kuss' }, { flag: 'aria_romanze_zusammen' }] }] };
/** Irgendeine gemeinsame Nacht mit einer Romanzefigur (Flags `<npc>_nacht`, world.md §4.7). */
export const IRGENDEINE_NACHT: Condition = {
  any: ['aria_nacht', 'hunter_nacht', 'dante_nacht', 'collin-charleston_nacht', 'collin_nacht', 'lio-funkel_nacht', 'lio_nacht']
    .map((f) => ({ flag: f })),
};

// Effekte
export const rel = (npc: string, delta: number): Effect => ({ relation: npc, delta });
export const set = (f: string, value = true): Effect => (value ? { setFlag: f } : { setFlag: f, value: false });
export const xp = (n: number): Effect => ({ xp: n });
export const msg = (text: string): Effect => ({ message: text });
export const rep = (faction: string, delta: number): Effect => ({ rep: faction, delta });

/** Abblende auf Schwarz (Romanzen: Nacht nur angedeutet). */
export const abblende = (caption: string): CutsceneBeat => ({ image: 'black', fade: 'out', caption, hold: 1600 });

export const cut = (id: string, title: string, beats: CutsceneBeat[], effects?: Effect[]): CutsceneDef =>
  effects ? { id, title, beats, effects } : { id, title, beats };

/** Hinweis für Herz-Ereignisse 8/10 in Akt 1 (world.md §11.2). */
export const ZEIT_HINWEIS = 'Diese Freundschaft braucht noch Zeit. (Weiter mit Akt 2.)';

/** Menü eines Tagesgesprächs: gemeinsame Wahlen und Folgeknoten. */
export interface Menu { choices: DialogueChoice[]; nodes: DialogueNode[] }

/**
 * Tagesgespräch: eigene Begrüßung + eigener Plausch je Variante, gemeinsames Menü.
 * Knoten: start (Gruß) → plausch → Menü-Knoten.
 */
export function daily(
  id: string, gruss: DialogueLine[], plausch: DialogueLine[], menu: Menu,
  opts: { plauschText?: string; effects?: Effect[] } = {},
): DialogueDef {
  const start = node('start', gruss, { choices: [{ text: opts.plauschText ?? 'Und sonst so?', next: 'plausch', id: 'plausch' }, ...menu.choices] });
  if (opts.effects) start.effects = opts.effects;
  return dlg(id, [start, node('plausch', plausch, { choices: menu.choices }), ...menu.nodes]);
}

// ------------------------------------------------------------------------------------------- Akt 2, Akt 3, Nachspiel
// Bedingungen nach design/plan/act23.json (flags, endings) und world.md §5.3–5.5.

/** Akt 3 (Releaseparty) und später. */
export const AKT3: Condition = { act: 3 };
/** Nur Akt 2 (vor der Party). */
export const NUR_AKT2: Condition = { all: [{ act: 2 }, { not: { act: 3 } }] };
/** Nachspiel (alle Enden setzen `epilog`). */
export const EPILOG: Condition = { flag: 'epilog' };
/** Partynacht: Akt 3, Nachspiel noch nicht erreicht. */
export const PARTYNACHT: Condition = { all: [{ act: 3 }, { notFlag: 'epilog' }] };
/** Vor dem Nachspiel. */
export const VOR_EPILOG: Condition = { notFlag: 'epilog' };
export const ENDE_MEER: Condition = { flag: 'ende_meer' };
export const ENDE_NEXUS: Condition = { flag: 'ende_neue_nexus' };
export const ENDE_3B: Condition = { flag: 'ende_doch_noch_meer' };
/** Ende 3 ohne 3b: Master-Modus (Unterstadt feindselig). */
export const MASTER: Condition = { all: [{ any: [{ flag: 'master_modus' }, { flag: 'ende_master' }] }, { notFlag: 'ende_doch_noch_meer' }] };
/** Ein Ende mit dem Meer (1, 2 oder 3b). */
export const MEER_ENDE: Condition = { any: [{ flag: 'ende_meer' }, { flag: 'ende_neue_nexus' }, { flag: 'ende_doch_noch_meer' }] };
/** Freie Phase Akt 2: der Bruch ist gelaufen. */
export const NACH_BRUCH: Condition = { all: [{ act: 2 }, { quest: 'main-2-bruch', state: 'done' }] };
/** Variante A: Aria gechippt und noch nicht zurück (bis main-2-countdown). */
export const ARIA_WEG: Condition = { all: [{ flag: 'aria_gechippt' }, { not: { quest: 'main-2-countdown', state: 'done' } }] };
/** Aria ist nach dem Countdown wieder da. */
export const ARIA_ZURUECK: Condition = { all: [{ act: 2 }, { quest: 'main-2-countdown', state: 'done' }] };
/** Nyra sitzt im Turm. */
export const NYRA_WEG: Condition = { all: [{ flag: 'nyra_zurueckgelassen' }, { notFlag: 'nyra_befreit' }, { notFlag: 'epilog' }] };
/** Dante ist in der Crew. */
export const DANTE_CREW: Condition = { any: [{ flag: 'dante_beigetreten' }, { quest: 'main-2-countdown', state: 'done' }] };
/** Die Releaseparty ist beschlossen, Akt 3 hat noch nicht begonnen. */
export const PARTY_PLAN: Condition = { all: [{ any: [{ flag: 'releaseparty_geplant' }, { quest: 'main-2-krisensitzung', state: 'done' }] }, { not: { act: 3 } }] };

/**
 * Bedingte Fortsetzung ohne echte Wahl: genau ein „Weiter“ ist sichtbar (erste passende Bedingung gewinnt,
 * `null` = Rest). Für Zeilen, die vom Spielstand abhängen (Aria da oder weg, Romanze, Ende).
 */
export function weiter(branches: readonly (readonly [Condition | null, string])[], label = 'Weiter'): DialogueChoice[] {
  const out: DialogueChoice[] = [];
  const before: Condition[] = [];
  for (const [cond, next] of branches) {
    const parts: Condition[] = [...before.map((c) => ({ not: c })), ...(cond ? [cond] : [])];
    const when: Condition | undefined = parts.length === 0 ? undefined : parts.length === 1 ? parts[0] : { all: parts };
    out.push(when ? { text: label, next, when, id: `weiter-${next}` } : { text: label, next, id: `weiter-${next}` });
    if (cond) before.push(cond);
    else break;
  }
  return out;
}

/** Menü erweitern: zusätzliche Wahlen vorn, eigene Folgeknoten dazu. */
export const mehr = (m: Menu, choices: DialogueChoice[], nodes: DialogueNode[] = []): Menu =>
  ({ choices: [...choices, ...m.choices], nodes: [...nodes, ...m.nodes] });

/** Einfacher Einzeiler-Dialog ohne Menü (Sonderlagen wie Master-Modus oder Partynacht). */
export const kurz = (id: string, lines: DialogueLine[], choices?: DialogueChoice[], effects?: Effect[]): DialogueDef =>
  dlg(id, [node('start', lines, { ...(choices ? { choices } : {}), ...(effects ? { effects } : {}) })]);
