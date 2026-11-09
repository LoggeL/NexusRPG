// Hintergrundstimmen (design.md §7): echte, vorab vertonte Sätze von Passanten.
// Reine Logik (Auswahl, Abklingzeit, Lautstärke), ohne Phaser testbar; Abspielen in ExploreScene.
import type { Condition } from '../../modules/contracts';
import { assetUrl } from '../../platform/assets/manifest';

export interface VoiceLine { file: string; snippet: string; line: number; speaker: string; durationMs: number; text: string }
/**
 * Spielabschnitt eines Fetzens. Akte sind `state.act` (Bedingung `act` = Akt ≥ n), das Nachspiel ist das Flag `epilog`;
 * Ende 3 „Master“ setzt zusätzlich `master_modus`/`ende_master` (3b „Doch noch ans Meer“ hebt es wieder auf).
 * akt1 = vor Akt 2 · akt2 = nur Akt 2 · akt3 = Partynacht · nachspiel = freies Nachspiel (Ende 1, 2, 3b) · master = Master-Modus.
 */
export type SnippetPhase = 'akt1' | 'akt2' | 'akt3' | 'nachspiel' | 'master';
export interface SnippetWhen {
  flag?: string;
  notFlag?: string;
  time?: string | string[];
  weather?: string | string[];
  weekday?: string | string[];
  /** Mindestens eine der Phasen. */
  phase?: SnippetPhase | SnippetPhase[];
  /** Keine der Phasen. */
  notPhase?: SnippetPhase | SnippetPhase[];
}
export interface SnippetMeta { district: string; zones?: string[]; when?: SnippetWhen }
export interface VoiceBank { snippets: Record<string, SnippetMeta>; lines: VoiceLine[] }
export interface Snippet { id: string; lines: VoiceLine[] }

let bank: Promise<VoiceBank | null> | null = null;

export function loadVoiceBank(): Promise<VoiceBank | null> {
  bank ??= fetch(assetUrl('assets/voices/manifest.json'))
    .then((r) => (r.ok ? r.json() : null))
    .then((data: Partial<VoiceBank> | null) => (data?.lines && data.snippets ? { snippets: data.snippets, lines: data.lines } : null))
    .catch(() => null);
  return bank;
}

/** Bezirks-Aliase: Karten-Bezirk → Stimmen-Bezirk. */
const DISTRICT_ALIAS: Record<string, string> = { kanal: 'kanalisation', meer: 'kueste', hafen: 'unterstadt', club: 'unterstadt' };

const EPILOG: Condition = { flag: 'epilog' };
/** Master-Modus (Ende 3 ohne 3b), wie content/parts/npc-unterstadt/_lib.ts `MASTER`. */
const MASTER: Condition = { all: [{ any: [{ flag: 'master_modus' }, { flag: 'ende_master' }] }, { notFlag: 'ende_doch_noch_meer' }] };
const VOR_ENDE: Condition = { all: [{ notFlag: 'epilog' }, { not: MASTER }] };

export const PHASE_CONDITION: Record<SnippetPhase, Condition> = {
  akt1: { all: [{ not: { act: 2 } }, VOR_ENDE] },
  akt2: { all: [{ act: 2 }, { not: { act: 3 } }, VOR_ENDE] },
  akt3: { all: [{ act: 3 }, VOR_ENDE] },
  nachspiel: { all: [EPILOG, { not: MASTER }] },
  master: MASTER,
};

/** Alte Flag-Schreibweisen: `act2`/`act3` setzt niemand (Akte stehen in `state.act`), `epilog` meint das freie Nachspiel. */
const LEGACY_FLAG: Record<string, SnippetPhase> = { act2: 'akt2', act3: 'akt3', epilog: 'nachspiel' };

function list<T extends string>(value: T | T[] | undefined): T[] {
  return value === undefined ? [] : Array.isArray(value) ? value : [value];
}

export function whenToCondition(when: SnippetWhen | undefined): Condition | null {
  if (!when) return null;
  const all: Condition[] = [];
  const phases = list(when.phase);
  const notPhases = list(when.notPhase);
  if (when.flag && LEGACY_FLAG[when.flag]) phases.push(LEGACY_FLAG[when.flag]);
  else if (when.flag) all.push({ flag: when.flag });
  if (when.notFlag && LEGACY_FLAG[when.notFlag]) notPhases.push(LEGACY_FLAG[when.notFlag]);
  else if (when.notFlag) all.push({ notFlag: when.notFlag });
  if (phases.length) all.push({ any: phases.map((phase) => PHASE_CONDITION[phase]) });
  if (notPhases.length) all.push({ not: { any: notPhases.map((phase) => PHASE_CONDITION[phase]) } });
  if (when.time) all.push({ time: when.time } as Condition);
  if (when.weekday) all.push({ weekday: when.weekday } as Condition);
  // Wetter: Bedingung `{ weather }` aus dem Wettersystem (modules/time/weather.ts, Bezirk der aktuellen Karte).
  // Die JSON-Namen sind ungeprüfte Strings; ohne Handler gilt die Form als unbekannt, der Fetzen bleibt dann stumm.
  const weather = list(when.weather);
  if (weather.length) all.push({ weather } as unknown as Condition);
  return all.length ? { all } : null;
}

export interface PickOptions {
  district: string;
  zone: string;
  /** Wie viele Passanten in Reichweite sind (Wechsel brauchen zwei). */
  speakers: number;
  test(condition: Condition): boolean;
  heard: Set<string>;
  last: string | null;
  random(): number;
}

export function pickSnippet(voices: VoiceBank, o: PickOptions): Snippet | null {
  const district = DISTRICT_ALIAS[o.district] ?? o.district;
  const byId = new Map<string, VoiceLine[]>();
  for (const line of voices.lines) {
    const list = byId.get(line.snippet) ?? [];
    list.push(line);
    byId.set(line.snippet, list);
  }
  const zoned: string[] = [];
  const general: string[] = [];
  for (const [id, meta] of Object.entries(voices.snippets)) {
    const lines = byId.get(id);
    if (!lines?.length || id === o.last) continue;
    if (lines.length > 1 && o.speakers < 2) continue;
    const cond = whenToCondition(meta.when);
    if (cond && !o.test(cond)) continue;
    if (meta.zones?.length) {
      if (meta.zones.includes(o.zone)) zoned.push(id);
    } else if (meta.district === district) general.push(id);
  }
  // Zonen-Fetzen etwa 2:1 vor Bezirksfetzen, ungehörte vor gehörten.
  const pool = zoned.length && (o.random() < 0.67 || !general.length) ? zoned : general;
  if (!pool.length) return null;
  const fresh = pool.filter((id) => !o.heard.has(id));
  const from = fresh.length ? fresh : pool;
  const id = from[Math.floor(o.random() * from.length)] ?? from[0];
  const lines = (byId.get(id) ?? []).sort((a, b) => a.line - b.line);
  return { id, lines };
}

/** Abklingzeit nach einem Fetzen (ms): 8–15 s, in ruhigen Zonen 15–25 s. */
export function voiceCooldown(quiet: boolean, random: () => number): number {
  return quiet ? 15000 + random() * 10000 : 8000 + random() * 7000;
}

/** Ein „Feld“ in Kartenpixeln (Reichweite 6 Felder ≈ Spruch-Radius). */
export const VOICE_FIELD = 56;

/** Lautstärke nach Entfernung: voll bis 2 Felder, linear auf 25 % bei 6 Feldern, darüber 0. */
export function voiceGain(distancePx: number): number {
  const fields = distancePx / VOICE_FIELD;
  if (fields <= 2) return 1;
  if (fields > 6) return 0;
  return 1 - ((fields - 2) / 4) * 0.75;
}
