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

// ---------------------------------------------------------------------------------------------- Akt 2, Akt 3, Nachspiel
// Flags nach design/plan/act23.json (flags, endings). ActId kennt nur 1|2|3; das Nachspiel läuft über das Flag `epilog`.

export const AKT2: Condition = { act: 2 };
export const AKT3: Condition = { act: 3 };
export const EPILOG: Condition = { flag: 'epilog' };
export const MASTER: Condition = { flag: 'master_modus' };
export const NICHT_MASTER: Condition = { notFlag: 'master_modus' };
/** Akt 2 bis vor der Party (freie Phase). */
export const NUR_AKT2: Condition = { all: [AKT2, { not: AKT3 }] };
/** Die Nacht der Releaseparty (Akt 3 vor dem Nachspiel). */
export const PARTYNACHT: Condition = { all: [AKT3, { notFlag: 'epilog' }] };
/** Ruhige Zeit für Herz-Ereignisse: nach dem Countdown in Akt 2 oder im Nachspiel, nie in der Partynacht, nie im Master-Modus. */
export const RUHIG: Condition = {
  all: [AKT2, { not: PARTYNACHT }, NICHT_MASTER, { any: [{ quest: 'main-2-countdown', state: 'done' }, EPILOG] }],
};
export const COUNTDOWN_DONE: Condition = { quest: 'main-2-countdown', state: 'done' };
export const KRISE_DONE: Condition = { quest: 'main-2-krisensitzung', state: 'done' };
/** Releaseparty beschlossen bzw. vorbereitet (Party-Vorbereitungen laufen). */
export const PARTY_GEPLANT: Condition = { any: [{ flag: 'releaseparty_geplant' }, KRISE_DONE] };
export const NYRA_WEG: Condition = { all: [{ flag: 'nyra_zurueckgelassen' }, { notFlag: 'nyra_befreit' }] };
export const ENDE_MEER: Condition = { flag: 'ende_meer' };
export const ENDE_NEXUS: Condition = { flag: 'ende_neue_nexus' };
/** Nachspiel ohne Master-Modus (Ende 1, 2 oder 3b). */
export const EPILOG_FREI: Condition = { all: [EPILOG, NICHT_MASTER] };

/** Bedingung „Flag noch nicht gesetzt“ – für einmalige Themen-Gespräche. */
export const ohne = (name: string): Condition => ({ notFlag: name });
/** Alle Bedingungen. */
export const und = (...list: Condition[]): Condition => ({ all: list });

/**
 * Romanze-Flags der freigegebenen Figuren (eine aktive Romanze gleichzeitig, world.md §4.7). `aria_kuss` zählt nicht:
 * Der Kuss setzt immer auch `aria_romanze_zusammen`, und nach einer Trennung bleibt der Kuss gesehen.
 */
export const ZUSAMMEN_FLAGS: Record<string, string[]> = {
  hunter: ['hunter_romanze_zusammen'],
  dante: ['dante_romanze_zusammen'],
  aria: ['aria_romanze_zusammen'],
  'collin-charleston': ['collin_kuss'],
  'lio-funkel': ['lio-funkel_romanze_zusammen'],
};

// ---------------------------------------------------------------------------------------------- Eifersucht

/**
 * Eifersucht und Trennung über alle freigegebenen Romanzen (world.md §4.7 „Trennung und Eifersucht“), eine Konvention:
 * - Jede Flirt-Wahl (Flirtzeile, Flirtantwort, Date-Annäherung) an Figur X setzt das Tagesflag `heute_flirt_<X>`
 *   (fällt morgens von selbst, Engine-Präfix `heute_`).
 * - Ist die Spielfigur mit P `zusammen` und steht ein `heute_flirt_<X>` mit X ≠ P, kommt bei P beim nächsten
 *   Gespräch die Warnung (`<p>_eifersucht_gewarnt`, löscht alle fremden Flirtflags), beim zweiten Mal die Trennung.
 * - Raven ist nicht freigegeben und flirtet nicht mit (ihre Flirtzeilen ruhen).
 */
export const FLIRT_ROMANZEN = ['hunter', 'dante', 'aria', 'collin-charleston', 'lio-funkel'] as const;
export const flirtFlag = (npc: string): string => `heute_flirt_${npc}`;
/** Effekt für jede Flirt-Wahl an `npc`. */
export const geflirtet = (npc: string): Effect => ({ setFlag: flirtFlag(npc) });
/** Heute mit einer anderen freigegebenen Figur als `npc` geflirtet. */
export const fremdGeflirtet = (npc: string): Condition => ({
  any: FLIRT_ROMANZEN.filter((id) => id !== npc).map((id): Condition => ({ flag: flirtFlag(id) })),
});
/** Löscht die Flirtflags aller anderen Figuren (nach Warnung oder Trennung). */
export const fremdFlirtLoeschen = (npc: string): Effect[] =>
  FLIRT_ROMANZEN.filter((id) => id !== npc).map((id): Effect => ({ setFlag: flirtFlag(id), value: false }));
/** Keine andere Romanze als mit `npc` ist „zusammen“. */
export const frei = (npc: string): Condition => ({
  all: Object.entries(ZUSAMMEN_FLAGS).filter(([id]) => id !== npc).flatMap(([, flags]) => flags.map((f): Condition => ({ notFlag: f }))),
});
