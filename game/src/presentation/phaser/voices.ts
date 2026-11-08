// Hintergrundstimmen (design.md §7): echte, vorab vertonte Sätze von Passanten.
// Reine Logik (Auswahl, Abklingzeit, Lautstärke), ohne Phaser testbar; Abspielen in ExploreScene.
import type { Condition } from '../../modules/contracts';
import { assetUrl } from '../../platform/assets/manifest';

export interface VoiceLine { file: string; snippet: string; line: number; speaker: string; durationMs: number; text: string }
export interface SnippetWhen { flag?: string; notFlag?: string; time?: string | string[]; weather?: string | string[]; weekday?: string | string[] }
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

export function whenToCondition(when: SnippetWhen | undefined): Condition | null {
  if (!when) return null;
  const all: Condition[] = [];
  if (when.flag) all.push({ flag: when.flag } as Condition);
  if (when.notFlag) all.push({ notFlag: when.notFlag } as Condition);
  if (when.time) all.push({ time: when.time } as Condition);
  if (when.weekday) all.push({ weekday: when.weekday } as Condition);
  return all.length ? ({ all } as Condition) : null;
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
    if (meta.when?.weather) continue; // Wetter folgt mit dem Wettersystem
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
