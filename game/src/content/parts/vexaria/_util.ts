// Hilfen für den Strang Vex × Aria „Nicht anhalten“ und Arias Akt-1-Stationen (world.md §4.7).
// Keine eigene Inhaltsdatei (kein Inhaltsteil), nur Bausteine für die Dateien in diesem Ordner.
import type {
  CheckDef, Condition, CutsceneBeat, CutsceneDef, DialogueChoice, DialogueDef, DialogueLine, DialogueNode, Effect,
  Expression, HeartEventDef, MapId, TimeSlot,
} from '../../../modules/contracts';

// ---------------------------------------------------------------------------
// Bedingungen

/** Spielfigur ist Vex (design.md §3.1b). */
export const V: Condition = { playerIs: 'vex' };
export const NOT_V: Condition = { not: V };
/** Romanze mit Aria möglich (♥8, freigeschaltet). */
export const R: Condition = { romance: 'aria' };
/** Höchstens eine Station pro Tag, beide Stränge zusammen (world.md §4.7). */
export const HEUTE_FREI: Condition = { notFlag: 'aria_heute' };
/** „Zwei Tage nach …“ ist um (siehe system.ts, Tageswechsel). */
export const WARTEN_VORBEI: Condition = { all: [{ notFlag: 'aria_warte1' }, { notFlag: 'aria_warte2' }] };
/** Noch kein Akt 2 (Akt-1-Weg des Strangs, gaps/vexaria.md). */
export const AKT1: Condition = { not: { act: 2 } };

export const ANGEBAHNT: Condition = { flag: 'aria_romanze_angebahnt' };
export const ZUSAMMEN: Condition = { flag: 'aria_romanze_zusammen' };
export const STREIT: Condition = { flag: 'aria_romanze_streit' };

/** Romanzefassung der Funken-Stationen: Vex, Romanze möglich, Date auf dem Dach war eins. */
export const ROM_AN: Condition = { all: [V, R, ANGEBAHNT] };
export const ROM_ZUSAMMEN: Condition = { all: [V, R, ZUSAMMEN] };
export const ROM_STREIT: Condition = { all: [V, R, STREIT] };

export const all = (...list: Condition[]): Condition => ({ all: list });
export const any = (...list: Condition[]): Condition => ({ any: list });
export const not = (c: Condition): Condition => ({ not: c });
export const seen = (id: string): Condition => ({ seen: id });
export const flag = (f: string): Condition => ({ flag: f });
export const noFlag = (f: string): Condition => ({ notFlag: f });

// ---------------------------------------------------------------------------
// Effekte

export const set = (f: string, value = true): Effect => (value ? { setFlag: f } : { setFlag: f, value: false });
export const herz = (delta: number): Effect => ({ relation: 'aria', delta });
export const xp = (amount: number): Effect => ({ xp: amount });
export const msg = (text: string): Effect => ({ message: text });
/** Station beginnt: Tagessperre sofort setzen (vor Reisen am Ende des Dialogs). Tageswechsel siehe system.ts. */
export const STATION_START: Effect[] = [{ setFlag: 'aria_heute' }];
/** Abschluss jeder Station: Herz-Ereignis 25 XP (world.md §4.7). */
export const STATION_ENDE: Effect[] = [{ setFlag: 'aria_heute' }, { xp: 25 }];
/** „Frühestens zwei Tage nach …“ starten. */
export const ZWEI_TAGE: Effect[] = [{ setFlag: 'aria_warte1', value: false }, { setFlag: 'aria_warte2' }];

// ---------------------------------------------------------------------------
// Zeilen

/**
 * Vex' Fotos `photo-vex-verlegen` und `photo-vex-zaertlich` fehlen noch (offener Asset-Auftrag, world.md §4.7 „Ausdrücke“).
 * Bis dahin Ersatz verlegen → ueberrascht, zaertlich → neutral. Sobald die Fotos da sind, hier umstellen.
 */
const VEX_HAS_ROMANCE_PHOTOS = false;
const vexExpr = (expr: Expression): Expression => {
  if (VEX_HAS_ROMANCE_PHOTOS) return expr;
  if (expr === 'verlegen') return 'ueberrascht';
  if (expr === 'zaertlich') return 'neutral';
  return expr;
};

/** Aria spricht. */
export const a = (text: string, expr: Expression = 'neutral'): DialogueLine => ({ speaker: 'aria', expr, text });
/** Vex (Spielfigur) spricht; Ausdruck mit Ersatzregel. */
export const v = (text: string, expr: Expression = 'neutral'): DialogueLine => ({ speaker: 'player', expr: vexExpr(expr), text });
/** Baukasten-Spielfigur spricht (kein Bild). */
export const p = (text: string): DialogueLine => ({ speaker: 'player', text });
/** Erzähltext / Gedankentext. */
export const n = (text: string): DialogueLine => ({ speaker: 'narrator', text });
/** Andere Figur. */
export const s = (speaker: string, text: string, expr?: Expression): DialogueLine => (expr ? { speaker, expr, text } : { speaker, text });

// ---------------------------------------------------------------------------
// Dialogbausteine

export const node = (id: string, lines: DialogueLine[], rest: Omit<DialogueNode, 'id' | 'lines'> = {}): DialogueNode => ({ id, lines, ...rest });
export const ch = (text: string, next?: string, extra: Omit<DialogueChoice, 'text' | 'next'> = {}): DialogueChoice =>
  (next ? { text, next, ...extra } : { text, ...extra });
export const dlg = (id: string, nodes: DialogueNode[]): DialogueDef => ({ id, start: nodes[0].id, nodes });

/** Eingebetteter Check mit eindeutiger ID (Präfix vexaria-/aria-). */
export const chk = (id: string, attribute: CheckDef['attribute'], threshold: number, tags: string[] = []): CheckDef =>
  ({ id, attribute, threshold, ...(tags.length ? { tags } : {}) });

/** `[Gosse]` – Vex ist immer Gossenkind; sonst die Herkunft der Baukasten-Spielfigur. */
export const GOSSE_VEX = { tag: '[Gosse]', when: V } as const;
export const GOSSE_ANDERE = { tag: '[Gosse]', when: all(NOT_V, { origin: 'origin-gossenkind' }) } as const;

// ---------------------------------------------------------------------------
// Cutscenes

export const beat = (b: CutsceneBeat): CutsceneBeat => b;
export const cut = (id: string, title: string, beats: CutsceneBeat[], effects?: Effect[], gallery?: boolean): CutsceneDef =>
  ({ id, title, beats, ...(effects ? { effects } : {}), ...(gallery === undefined ? {} : { gallery }) });

// ---------------------------------------------------------------------------
// Herz-Ereignisse: Romanze- und Freundschaftsfassung derselben Station

export interface StationSpec {
  id: string;
  hearts: number;
  map: MapId;
  time?: TimeSlot | readonly TimeSlot[];
  /** Grundbedingung beider Fassungen (ohne „nicht gesehen“, das kommt dazu). */
  when: Condition;
  effects?: Effect[];
  cutscene?: string;
  dialogue?: string;
}

/** Eine Station mit genau einer Fassung. */
export const station = (spec: StationSpec): HeartEventDef => ({
  id: spec.id,
  hearts: spec.hearts,
  map: spec.map,
  ...(spec.time ? { time: spec.time } : {}),
  when: all(spec.when, not(seen(spec.id))),
  ...(spec.cutscene ? { cutscene: spec.cutscene } : {}),
  ...(spec.dialogue ? { dialogue: spec.dialogue } : {}),
  effects: [...STATION_ENDE, ...(spec.effects ?? [])],
});

/**
 * Romanzefassung (ID = Stations-ID) und Freundschaftsfassung (`<id>-fs`, markiert die Stations-ID als gesehen).
 * Die Freundschaft läuft, wenn die Romanzebedingung nicht erfüllt ist (world.md §4.7 „Auslöser als Bedingungsobjekte“).
 */
export function twin(spec: StationSpec, romWhen: Condition, rom: { cutscene?: string; dialogue?: string; effects?: Effect[] },
  fs: { cutscene?: string; dialogue?: string; effects?: Effect[] }): HeartEventDef[] {
  return [
    station({ ...spec, when: all(spec.when, romWhen), ...rom, effects: [...(spec.effects ?? []), ...(rom.effects ?? [])] }),
    {
      ...station({ ...spec, id: `${spec.id}-fs`, when: all(spec.when, not(romWhen), not(seen(spec.id))), ...fs }),
      effects: [...STATION_ENDE, { markSeen: spec.id }, ...(spec.effects ?? []), ...(fs.effects ?? [])],
    },
  ];
}

export const byId = <T extends { id: string }>(list: readonly T[]): Record<string, T> => Object.fromEntries(list.map((x) => [x.id, x]));
