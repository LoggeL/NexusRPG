// Helfer für wiederholbare Aufträge (world.md §6.6) und Kopfgelder (§6.7). Kein Inhaltsteil.
// Die Engine zeigt Auftragsziele nicht auf der Karte an (jobTargetEffects ist nicht verdrahtet), deshalb bekommt jedes
// Ziel einen eigenen Hotspot, der nur bei angenommenem Auftrag (`{ job }`) sichtbar ist. Abschluss per `completeJob`.
import type { Condition, EncounterDef, Effect, JobTemplateDef } from '../../../modules/contracts';
import type { MapAddition } from '../../part';
import { neben } from './_karten';
import type { Hotspot } from './_lib';

export interface Ziel { map: string; spot: string; label: string }

/** Hotspot für ein Auftragsziel, leicht versetzt neben dem Spot. */
export const zielSpot = (id: string, z: Ziel, label: string, dialogue: string, when: Condition, dx = 0, dy = -36): [string, Hotspot] =>
  [z.map, { id, at: neben(z.map, z.spot, dx, dy), label, kind: 'use', dialogue, when }];

/** Sammelt [Karte, Hotspot]-Paare zu mapAdditions. */
export function zusatz(list: [string, Hotspot][]): Record<string, MapAddition> {
  const out: Record<string, MapAddition> = {};
  for (const [map, h] of list) (out[map] ??= { hotspots: [] }).hotspots!.push(h);
  return out;
}

/** Rivalität mit Hunter (world.md §4.2): An seiner Auftragstafel gibt es dann nur noch Botengänge (Kurier). */
export const HUNTER_GIBT_ARBEIT: Condition = { not: { rival: 'hunter' } };
/** Auftragsvorlage; alles außer Kurier an Hunters Tafel ruht, solange Hunter dein Rivale ist. */
export const vorlage = (def: JobTemplateDef): JobTemplateDef =>
  (def.kind === 'kurier' || !def.boards.includes('auftragstafel')
    ? def
    : { ...def, when: def.when ? { all: [def.when, HUNTER_GIBT_ARBEIT] } : HUNTER_GIBT_ARBEIT });
export const ziele = (list: Ziel[]): JobTemplateDef['targets'] => list.map((z) => ({ map: z.map, label: z.label }));

/** Kampf zu einem Auftrag: Sieg schließt den Auftrag ab (plus weitere Effekte). */
export const kampf = (id: string, name: string, base: Omit<EncounterDef, 'id' | 'name' | 'onWin'>, onWin: Effect[]): EncounterDef =>
  ({ id, name, ...base, onWin });

export const fertig = (job: string): Effect => ({ completeJob: job });
