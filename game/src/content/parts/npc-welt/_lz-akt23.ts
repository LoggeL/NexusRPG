// Akt 2, Akt 3 und Nachspiel für die Weltfiguren l–z (Madame Satin bis Wett-Willi, dazu Paul und Vex).
// Kein eigener Inhaltsteil: exportiert kein `part`. Die <figur>-akt23.ts-Dateien bauen damit Phasen-Gespräche,
// die Hauptdatei der Figur hängt sie in `talk` (nach Rivale/Erstgespräch) und ihre Dialoge in `dialogues`.
// Bedingungen wie npc-unterstadt/_lib.ts (gleiche Flags), damit alle Figuren der Stadt im selben Takt umschalten.
import type { Condition, DialogueChoice, DialogueDef, DialogueLine, DialogueNode, Effect, TalkDef } from '../../../modules/contracts';
import { type Menue, dialog, flag, herz, knoten, rede } from './_welt';

// ------------------------------------------------------------------------------------------- Bedingungen

export const alle = (...list: Condition[]): Condition => ({ all: list });
export const eins = (...list: Condition[]): Condition => ({ any: list });
export const nicht = (c: Condition): Condition => ({ not: c });

/** Nur Akt 2 (Akt ≥ 2, nicht Akt 3, kein Nachspiel). */
export const AKT2_NUR: Condition = { all: [{ act: 2 }, { not: { act: 3 } }, { notFlag: 'epilog' }] };
/** Partynacht (Akt 3 vor dem Ende). */
export const AKT3_NACHT: Condition = { all: [{ act: 3 }, { notFlag: 'epilog' }] };
/** Akt 2 oder Partynacht, kein Nachspiel. */
export const AKT23: Condition = { all: [{ act: 2 }, { notFlag: 'epilog' }] };
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
/** Nachspiel, aber nicht im Master-Modus. */
export const EPILOG_FREI: Condition = { all: [{ flag: 'epilog' }, { not: MASTER }] };
/** Variante A: Aria ist gechippt und noch nicht zurück (main-2-countdown offen). */
export const ARIA_GECHIPPT: Condition = { all: [AKT2_NUR, { flag: 'aria_gechippt' }, { not: { quest: 'main-2-countdown', state: 'done' } }] };
/** Aria ist wieder da, Dante in der Crew. */
export const COUNTDOWN_DONE: Condition = { quest: 'main-2-countdown', state: 'done' };
/** Nyra blieb im Turm zurück und ist noch nicht befreit. */
export const NYRA_WEG: Condition = { all: [AKT2_NUR, { flag: 'nyra_zurueckgelassen' }, { notFlag: 'nyra_befreit' }] };
/** Releaseparty steht an (nach der Krisensitzung, vor Akt 3). */
export const PARTY_VORB: Condition = {
  all: [AKT2_NUR, { any: [{ quest: 'main-2-krisensitzung', state: 'done' }, { flag: 'releaseparty_geplant' }] }],
};

// ------------------------------------------------------------------------------------------- Menü

/** Akt-2-Thema im Menü: einmalig über ein Flag (Varianten teilen sich das Menü, `once` gilt nur je Dialog). */
export function thema(npc: string, key: string, text: string, node: string, when: Condition = AKT2_NUR, delta = 10): DialogueChoice {
  const f = `${npc}_23_${key}`;
  return { text, next: node, when: { all: [when, { notFlag: f }] }, effects: [flag(f), herz(npc, delta)] };
}

/** Menü um Akt-2/3-Wahlen ergänzen (vor der letzten Abschiedswahl). */
export function erweitere(M: Menue, choices: DialogueChoice[], nodes: DialogueNode[]): Menue {
  return {
    zeile: M.zeile,
    choices: [...M.choices.slice(0, -1), ...choices, ...M.choices.slice(-1)],
    nodes: [...M.nodes, ...nodes],
  };
}

// ------------------------------------------------------------------------------------------- Phasen

/**
 * Phasen-Tagesgespräch: `einmal` (Flag `<npc>_k_<id>`) oder `taeglich` (Flag `heute_<npc>_<id>`, fällt morgens).
 * Ohne beides gilt die Variante, solange `when` gilt. `ohneMenue` = kurzes Gespräch ohne Menü (Master-Modus).
 * `plausch` hängt eine Wahl „Und sonst so?“ vor das Menü.
 */
export interface Phase {
  id: string; when: Condition; gruss: DialogueLine[]; plausch?: DialogueLine[];
  einmal?: boolean; taeglich?: boolean; effects?: Effect[]; ohneMenue?: boolean;
  /** Eigene Wahlen statt Menü (z. B. gechippter Paul). */
  wahlen?: { choices: DialogueChoice[]; nodes: DialogueNode[] };
}

export function phasen(npc: string, prefix: string, M: Menue, list: Phase[]): { dialogues: DialogueDef[]; talk: TalkDef[] } {
  const dialogues: DialogueDef[] = [];
  const talk: TalkDef[] = [];
  for (const p of list) {
    const id = `${prefix}-${p.id}`;
    const key = p.einmal ? `${npc}_k_${p.id}` : p.taeglich ? `heute_${npc}_${p.id}` : undefined;
    const effects: Effect[] = [...(p.effects ?? []), ...(key ? [flag(key)] : [])];
    const when: Condition = key ? { all: [p.when, { notFlag: key }] } : p.when;
    let nodes: DialogueNode[];
    if (p.ohneMenue) {
      nodes = [knoten('start', [...p.gruss, ...(p.plausch ?? [])])];
    } else {
      const basis = p.wahlen ?? { choices: M.choices, nodes: [knoten('menue', [M.zeile], { choices: M.choices }), ...M.nodes] };
      const start: DialogueChoice[] = p.plausch ? [{ text: 'Und sonst so?', next: 'plausch', id: 'plausch' }, ...basis.choices] : basis.choices;
      nodes = [knoten('start', p.gruss, { choices: start }), ...(p.plausch ? [knoten('plausch', p.plausch, { choices: basis.choices })] : []), ...basis.nodes];
    }
    if (effects.length) nodes[0].effects = effects;
    dialogues.push(dialog(id, nodes));
    talk.push(rede(id, when));
  }
  return { dialogues, talk };
}

/** Ergebnis einer <figur>-akt23.ts. */
export interface Akt23 { dialogues: DialogueDef[]; talk: TalkDef[] }
