// Bausteine für das Weltleben in Akt 2, Akt 3 und im Nachspiel. Keine eigene Inhaltsdatei (exportiert keinen Teil).
// Baut auf den Akt-1-Bausteinen in ../world/_w auf (nur gelesen, nicht geändert).
import type { CheckDef, Condition, DialogueChoice, DialogueDef, DialogueLine, DialogueNode, Effect, NpcDef } from '../../../modules/contracts';
import { all, any, flag, not } from '../world/_w';

export {
  AKT1, AKT2, AKT3, GRUENDERTAG, KARTEN_TURNIER, NEONNACHT, SCHROTTPARADE, VEX, WETTER_KLAR, WETTER_NEONSCHAUER,
  WETTER_ROSTREGEN, WETTER_SMOG, active, all, any, byId, cr, cycle, day, done, flag, herz, ich, msg, nar, not, range, rep,
  say, sendung, sms, xp,
} from '../world/_w';

// ---------------------------------------------------------------------------------------------- Abschnitte der Geschichte

/** Nachspiel läuft (alle Enden setzen es). */
export const EPILOG: Condition = flag('epilog');
/** Ende 3 ohne 3b: Master-Modus (Unterstadt feindselig, Crew-Quests gesperrt). */
export const MASTER: Condition = all(any(flag('master_modus'), flag('ende_master')), { notFlag: 'ende_doch_noch_meer' });
/** Nachspiel nach Ende 1, 2 oder 3b: Bildschirme aus, Bus ans Meer. */
export const FREI: Condition = all(EPILOG, not(MASTER));
/** Akt 2, solange Akt 3 noch nicht begonnen hat. */
export const NUR_AKT2: Condition = all({ act: 2 }, not({ act: 3 }));
/** Akt 3 (Partynacht), solange das Nachspiel noch nicht läuft. */
export const NUR_AKT3: Condition = all({ act: 3 }, not(EPILOG));
/** Quantum hat die Stadt im Griff: Akt 2, Akt 3 und Master-Modus. */
export const QUANTUM_LAGE: Condition = any(all({ act: 2 }, not(EPILOG)), MASTER);
/** Freie Phase Akt 2: nach dem Bruch, vor der Party. */
export const NACH_BRUCH: Condition = all(NUR_AKT2, { quest: 'main-2-bruch', state: 'done' });

export const ABEND_NACHT: Condition = { time: ['abend', 'nacht'] };
export const TAGSUEBER: Condition = { time: ['morgen', 'tag', 'abend'] };

/** Ödnis-Wetter „Sandsturm“ (modules/time/weather.ts: Zyklustag 4/11/18/25), auch abgefragt, wenn man in der Stadt ist. */
export const SANDSTURM: Condition = { weather: 'sandsturm', district: 'oednis' };
/** Stromausfall in der Unterstadt: einmal pro Woche (Freitag), ab Akt 2 (world.md §10.6). */
export const STROMAUSFALL_TAG: Condition = { cycleDay: [5, 12, 19, 26] };
/** Meerestag (Fest, nur Nachspiel): ersetzt den Gründertag, Quantum feiert nichts mehr. */
export const MEERESTAG: Condition = { cycleDay: 21 };

// ---------------------------------------------------------------------------------------------- Bausteine

/** Eingebetteter Welt-Check Akt 2/3 (Präfix `welt23-`, kollidiert nie mit gc-… oder welt-…). */
export const wcheck23 = (id: string, attribute: CheckDef['attribute'], threshold: number, extra: Partial<CheckDef> = {}): CheckDef =>
  ({ id: `welt23-${id}`, attribute, threshold, ...extra });

export const node = (id: string, lines: DialogueLine[], rest: Omit<DialogueNode, 'id' | 'lines'> = {}): DialogueNode =>
  ({ id, lines, ...rest });
export const dlg = (id: string, nodes: DialogueNode[]): DialogueDef => ({ id, start: nodes[0]!.id, nodes });
export const ch = (text: string, next?: string, rest: Omit<DialogueChoice, 'text' | 'next'> = {}): DialogueChoice =>
  (next ? { text, next, ...rest } : { text, ...rest });

export const setFlag = (name: string, value?: boolean): Effect => (value === false ? { setFlag: name, value } : { setFlag: name });
export const give = (item: string, qty?: number): Effect => (qty ? { give: item, qty } : { give: item });

/** Schlanke Weltfigur ohne Herzen (Passanten, Promoter): nur Name, Bild und Laufblatt. */
export const passant = (id: string, name: string, sprite: string, bio: string, portrait = id): NpcDef =>
  ({ id, name, portrait, sprite, maxHearts: 1, bio });
