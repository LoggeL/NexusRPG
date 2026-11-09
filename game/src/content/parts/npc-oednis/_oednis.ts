// Hilfsfunktionen für Ödnis, Kanalisation und Küste (world.md §4.4/§4.5): Kopie der Bausteine aus npc-welt/_welt.ts,
// damit dieser Ordner eigenständig bleibt. Kein eigener Inhaltsteil: exportiert kein `part`.
import type {
  AttributeId, CheckDef, Condition, DialogueChoice, DialogueDef, DialogueLine, DialogueNode, Effect, Expression,
  GiftPrefs, NpcDef, ScheduleEntry, SpeakerId, TalkDef, TimeSlot, Weekday,
} from '../../../modules/contracts';

// ------------------------------------------------------------------------------------------- Zeilen

/** Zeilenbauer je Sprecher: `B('Text')`, mit Dialogfoto-Ausdruck `B('Text', 'wut')`. */
export const sprecher = (speaker: SpeakerId) => (text: string, expr?: Expression): DialogueLine =>
  expr ? { speaker, text, expr } : { speaker, text };

export const ich = sprecher('player');
export const erz = sprecher('narrator');

// ------------------------------------------------------------------------------------------- Bausteine

/** Eingebetteter Check mit eindeutiger ID (sichtbare Schwelle im Dialog). */
export const pruefung = (id: string, attribute: AttributeId, threshold: number, tags?: string[]): CheckDef =>
  tags ? { id, attribute, threshold, tags } : { id, attribute, threshold };

export const knoten = (id: string, lines: DialogueLine[], rest: Omit<DialogueNode, 'id' | 'lines'> = {}): DialogueNode =>
  ({ id, lines, ...rest });

export const dialog = (id: string, nodes: DialogueNode[], start = 'start'): DialogueDef => ({ id, start, nodes });

export const sammle = (...list: DialogueDef[]): Record<string, DialogueDef> =>
  Object.fromEntries(list.map((d) => [d.id, d]));

export const herz = (npc: string, delta: number): Effect => ({ relation: npc, delta });
export const flag = (name: string, value = true): Effect => (value ? { setFlag: name } : { setFlag: name, value: false });
export const neu = (id: string): Condition => ({ not: { seen: id } });
export const nichtGetroffen = (npc: string): Condition => ({ not: { met: npc } });
export const VEX: Condition = { playerIs: 'vex' };
export const NICHT_VEX: Condition = { not: { playerIs: 'vex' } };

/** Hinweis für Herz-Ereignisse 8/10 in Akt 1 (world.md §11.2). */
export const ZEIT_HINWEIS = 'Diese Freundschaft braucht noch Zeit. (Weiter mit Akt 2.)';

/** Standard-Rückkehr in ein Menü bzw. Ende. */
export const zurueck = (text = 'Noch was.', ende = 'Bis dann.'): DialogueChoice[] => [
  { text, next: 'menue', id: 'zurueck' },
  { text: ende, id: 'ende' },
];

// ------------------------------------------------------------------------------------------- Tagesgespräche

/** Gemeinsames Menü aller Gesprächsvarianten einer Figur. */
export interface Menue {
  /** Zeile, wenn man aus einem Unterknoten zurückkehrt. */
  zeile: DialogueLine;
  choices: DialogueChoice[];
  nodes: DialogueNode[];
}

/** Tagesgespräch: eigene Begrüßung, gemeinsames Menü (Knoten `menue` + Unterknoten). */
export function gespraech(id: string, gruss: DialogueLine[], menue: Menue, effects?: Effect[]): DialogueDef {
  const start = knoten('start', gruss, { choices: menue.choices });
  if (effects?.length) start.effects = effects;
  return dialog(id, [start, knoten('menue', [menue.zeile], { choices: menue.choices }), ...menue.nodes]);
}

/** Talk-Eintrag. */
export const rede = (dialogue: string, when?: Condition, minHearts?: number): TalkDef => {
  const t: TalkDef = { dialogue };
  if (when) t.when = when;
  if (minHearts !== undefined) t.minHearts = minHearts;
  return t;
};

// ------------------------------------------------------------------------------------------- Tagesablauf

type Slot = 'M' | 'T' | 'A' | 'N';
const SLOT: Record<Slot, TimeSlot> = { M: 'morgen', T: 'tag', A: 'abend', N: 'nacht' };

/**
 * Kurzform für Tagesabläufe wie im ID-Plan: `ort('M,T', 'schrottmarkt', 'garkueche')`, `weg('N')`,
 * Wochentage über `days`, Sonderfälle über `when`. `'*'` = immer.
 */
export function ort(slots: string, map: string, at: string, extra: Partial<ScheduleEntry> = {}): ScheduleEntry {
  const e: ScheduleEntry = { place: { map, at }, ...extra };
  if (slots !== '*') {
    const list = slots.split(',').map((s) => SLOT[s.trim() as Slot]);
    e.slot = list.length === 1 ? list[0] : list;
  }
  return e;
}
export function weg(slots = '*', extra: Partial<ScheduleEntry> = {}): ScheduleEntry {
  const e: ScheduleEntry = { place: 'away', ...extra };
  if (slots !== '*') {
    const list = slots.split(',').map((s) => SLOT[s.trim() as Slot]);
    e.slot = list.length === 1 ? list[0] : list;
  }
  return e;
}
export const tage = (...days: Weekday[]): readonly Weekday[] => days;

// ------------------------------------------------------------------------------------------- Geschenke

const ALLGEMEIN_MAG = ['echtobst-apfel', 'hofhonig'];
const ALLGEMEIN_HASST = ['rostige-dose', 'virus-implantat'];

/** Vorlieben plus allgemeine Vorlieben (world.md §4.1), außer die Figur listet den Gegenstand schon selbst. */
export function geschenke(p: GiftPrefs): GiftPrefs {
  const genannt = new Set([...(p.loves ?? []), ...(p.likes ?? []), ...(p.dislikes ?? []), ...(p.hates ?? [])]);
  return {
    loves: [...(p.loves ?? [])],
    likes: [...(p.likes ?? []), ...ALLGEMEIN_MAG.filter((i) => !genannt.has(i))],
    dislikes: [...(p.dislikes ?? [])],
    hates: [...(p.hates ?? []), ...ALLGEMEIN_HASST.filter((i) => !genannt.has(i))],
  };
}

// ------------------------------------------------------------------------------------------- Figuren

/**
 * Weltfigur mit Kurzeintrag (world.md §4.5): höchstens 5 Herzen, Bilder unter der eigenen ID
 * (`portrait-<id>`, `<id>-walk`; fehlende Bilder zeigt das Spiel als Platzhalter).
 */
export function weltfigur(def: Omit<NpcDef, 'portrait'> & { portrait?: string }): NpcDef {
  return { portrait: def.id, sprite: `${def.id}-walk`, maxHearts: 5, ...def } as NpcDef;
}

/**
 * Antagonist als Hintergrundfigur in Akt 1 (world.md §11.2): Tagesablauf plus ein Satz, kein Herzsystem
 * (keine Herz-Ereignisse, `maxHearts: 1`, damit Geschenke in Akt 1 nicht hochzählen; ab `act2` erweitert der Akt-2-Teil).
 */
export function hintergrundfigur(def: NpcDef): NpcDef {
  return { maxHearts: 1, ...def };
}

/** Ein-Satz-Dialog ohne Wahl (Hintergrundfiguren). */
export const einSatz = (id: string, lines: DialogueLine[]): DialogueDef => dialog(id, [knoten('start', lines)]);
