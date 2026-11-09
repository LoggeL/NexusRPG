// Schreibhilfen für Enden und Nachspiel (Ordner quest-enden). Keine Inhaltsdatei: nur Bausteine.
import type {
  CheckDef, Condition, CutsceneBeat, DialogueChoice, DialogueDef, DialogueLine, DialogueNode, Effect, Expression,
  SpeakerId,
} from '../../../modules/contracts';

/** Dialogzeile mit optionalem Ausdruck. */
export const l = (speaker: SpeakerId, text: string, expr?: Expression): DialogueLine =>
  expr ? { speaker, text, expr } : { speaker, text };
/** Erzählzeile. */
export const n = (text: string): DialogueLine => ({ speaker: 'narrator', text });
/** Zeile der Spielfigur. */
export const p = (text: string, expr?: Expression): DialogueLine => l('player', text, expr);

/** Dialogknoten. */
export const node = (id: string, lines: DialogueLine[], rest: Omit<DialogueNode, 'id' | 'lines'> = {}): DialogueNode =>
  ({ id, lines, ...rest });
/** Dialog mit Startknoten = erster Knoten. */
export const dlg = (id: string, nodes: DialogueNode[]): DialogueDef => ({ id, start: nodes[0].id, nodes });
/** Wahl. */
export const ch = (text: string, next?: string, rest: Omit<DialogueChoice, 'text' | 'next'> = {}): DialogueChoice =>
  next ? { text, next, ...rest } : { text, ...rest };

/** Eingebetteter Check für Wege, die world.md ohne gc-ID nennt. */
export const chk = (id: string, attribute: CheckDef['attribute'], threshold: number, tags: string[] = []): CheckDef =>
  ({ id, attribute, threshold, tags });

// Bedingungen
export const active = (quest: string): Condition => ({ quest, state: 'active' });
export const done = (quest: string): Condition => ({ quest, state: 'done' });
export const inactive = (quest: string): Condition => ({ quest, state: 'inactive' });
export const flag = (name: string): Condition => ({ flag: name });
export const noFlag = (name: string): Condition => ({ notFlag: name });
export const all = (...list: Condition[]): Condition => ({ all: list });
export const any = (...list: Condition[]): Condition => ({ any: list });
export const not = (c: Condition): Condition => ({ not: c });
export const hearts = (npc: string, min: number): Condition => ({ hearts: npc, min });
export const item = (id: string, min?: number): Condition => (min ? { item: id, min } : { item: id });
export const stepDone = (quest: string, step: string): Condition => ({ questStep: quest, step });
export const time = (...slots: ('morgen' | 'tag' | 'abend' | 'nacht')[]): Condition => ({ time: slots });
export const atLeast = (min: number, conditions: Condition[]): Condition => ({ atLeast: conditions, min });

/** Spielfigur ist Vex Schrapnell. */
export const VEX: Condition = { playerIs: 'vex' };
export const NOT_VEX: Condition = not(VEX);

// Effekte
export const set = (name: string, value?: boolean): Effect => (value === false ? { setFlag: name, value } : { setFlag: name });
export const unset = (name: string): Effect => ({ setFlag: name, value: false });
export const herz = (npc: string, delta: number): Effect => ({ relation: npc, delta });
export const msg = (text: string): Effect => ({ message: text });
export const step = (quest: string, id: string): Effect => ({ questStep: quest, step: id });

// ------------------------------------------------------------------------------------------- Weichen im Dialog

/**
 * Bedingte Fortsetzung am Ende eines Knotens: genau eine Wahl „Weiter“ ist sichtbar (erste passende gewinnt,
 * die letzte ohne Bedingung ist der Rest). So verzweigen Erzählungen nach Flags, ohne dass es nach Wahl aussieht.
 */
export function weiter(branches: readonly (readonly [Condition | null, string])[], label = 'Weiter'): DialogueChoice[] {
  const out: DialogueChoice[] = [];
  const before: Condition[] = [];
  for (const [cond, next] of branches) {
    const parts = [...before.map(not), ...(cond ? [cond] : [])];
    const when: Condition | undefined = parts.length === 0 ? undefined : parts.length === 1 ? parts[0] : all(...parts);
    out.push(when ? { text: label, next, when, id: `weiter-${next}` } : { text: label, next, id: `weiter-${next}` });
    if (cond) before.push(cond);
    else break;
  }
  return out;
}

/**
 * Tor ohne Zeilen: Gilt `cond`, erscheint eine einzige Wahl (die Schlagzeile) und führt zu `then`;
 * sonst springt der Dialog ohne Anzeige weiter zu `skip`. Für lange Ketten bedingter Meldungen.
 */
export const tor = (id: string, cond: Condition, headline: string, then: string, skip: string | undefined, extra: DialogueChoice[] = []): DialogueNode =>
  ({ id, lines: [], choices: [{ text: headline, next: then, when: cond, id: `tor-${id}` }, ...extra.map((c) => ({ ...c, when: c.when ? all(cond, c.when) : cond }))], ...(skip ? { next: skip } : {}) });

// ------------------------------------------------------------------------------------------- Cutscenes

/** Erzähltafel auf Schwarz. */
export const tafel = (caption: string, lines: DialogueLine[] = [], extra: Partial<CutsceneBeat> = {}): CutsceneBeat =>
  ({ image: 'black', caption, ...(lines.length ? { lines } : {}), ...extra });
/** Bildtafel. */
export const bild = (image: string, caption: string | undefined, lines: DialogueLine[] = [], extra: Partial<CutsceneBeat> = {}): CutsceneBeat =>
  ({ image, ...(caption ? { caption } : {}), ...(lines.length ? { lines } : {}), ...extra });

// ------------------------------------------------------------------------------------------- Gemeinsame Zustände

/** Nachspiel läuft (alle Enden setzen es). */
export const EPILOG = flag('epilog');
/** Das Meer ist erreichbar (Ende 1, Ende 2, Ende 3b). */
export const MEER_OFFEN = flag('meer_offen');
/** Ende 3 ohne 3b: Unterstadt feindselig, Crew-Quests gesperrt. */
export const MASTER = flag('master_modus');
export const ENDE_MEER = flag('ende_meer');
export const ENDE_NEXUS = flag('ende_neue_nexus');
export const ENDE_MASTER = flag('ende_master');
export const ENDE_3B = flag('ende_doch_noch_meer');

export const BLADE_GEFASST = any(flag('blade_gefasst'), flag('blade_angekettet'));
export const BLADE_WEG = flag('blade_entkommen');

/** Romanze der Spielfigur mit einer Figur ist zusammen (Kuss gesehen bzw. Paarstatus). */
export const ROM = {
  hunter: all({ romance: 'hunter' }, any(flag('hunter_romanze_zusammen'), flag('hunter_nacht'))),
  dante: all({ romance: 'dante' }, any(flag('dante_romanze_zusammen'), flag('dante_nacht'))),
  collin: all({ romance: 'collin-charleston' }, any(flag('collin_kuss'), flag('collin_nacht'), flag('collin_duett_romanze'))),
  lio: all({ romance: 'lio-funkel' }, any(flag('lio-funkel_romanze_zusammen'), flag('lio-funkel_nacht'))),
  aria: all({ romance: 'aria' }, any(flag('aria_romanze_zusammen'), flag('aria_kuss'))),
} as const;
/** Irgendeine Romanze der Spielfigur. */
export const ROM_IRGENDEINE = any(...Object.values(ROM));
/** Dante und Raven dürfen ihr Gespräch führen (nicht gestört, Spielfigur nicht mit Dante zusammen). */
export const PAAR_DANTE_RAVEN = all(noFlag('paar_dante_raven_gestoert'), not(ROM.dante));

/** Crew-Figuren, die im Nachspiel vorkommen. */
export const CREW = ['hunter', 'raven', 'dante', 'vega', 'aria', 'nyra', 'jimmy'] as const;
