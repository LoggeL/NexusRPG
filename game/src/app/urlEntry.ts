// URL-Einstiege für Entwicklung und Tests (gemeinsam genutzt; neue Parameter hier und in docs/engine-notes.md eintragen).
import type { ActId, EncounterId, GameContent, MapId, TimeSlot } from '../modules/contracts';
import type { StartEntry } from '../presentation/director';

const ACTS: readonly ActId[] = [1, 2, 3];
const SLOTS: readonly TimeSlot[] = ['morgen', 'tag', 'abend', 'nacht'];

/**
 * ?scene=title · ?newchar · ?act=<1..3> · ?map=<id>[&entry=] · ?battle=<encounter> · ?cut=<id>
 * Zusätzlich: &time=<morgen|tag|abend|nacht> (bei act/map), &seed=<zahl>, &debug.
 */
export function parseEntry(search: string, content: GameContent | null): { entry: StartEntry; debug: boolean; errors: string[] } {
  const params = new URLSearchParams(search);
  const debug = params.has('debug');
  const errors: string[] = [];
  if (!content) return { entry: { kind: 'title' }, debug, errors };
  const has = (record: object, key: string) => Object.prototype.hasOwnProperty.call(record, key);

  let time: TimeSlot | undefined;
  const timeParam = params.get('time');
  if (timeParam) {
    if ((SLOTS as readonly string[]).includes(timeParam)) time = timeParam as TimeSlot;
    else errors.push(`Ungültige Tageszeit: ${timeParam}`);
  }
  const withTime = <T extends object>(entry: T): T => (time ? { ...entry, time } : entry);

  if (params.get('scene') === 'title') return { entry: { kind: 'title' }, debug, errors };
  if (params.has('newchar')) return { entry: { kind: 'newchar' }, debug, errors };

  const battle = params.get('battle');
  if (battle) {
    if (has(content.encounters, battle)) return { entry: { kind: 'battle', encounter: battle as EncounterId }, debug, errors };
    errors.push(`Unbekannte Begegnung: ${battle}`);
  }
  const act = params.get('act');
  if (act) {
    const value = Number(act);
    if ((ACTS as readonly number[]).includes(value)) return { entry: withTime({ kind: 'act', act: value as ActId }), debug, errors };
    errors.push(`Ungültiger Akt: ${act}`);
  }
  const map = params.get('map');
  if (map) {
    if (has(content.maps, map)) {
      const entry = params.get('entry');
      return { entry: withTime({ kind: 'map', map: map as MapId, ...(entry ? { entry } : {}) }), debug, errors };
    }
    errors.push(`Unbekannte Karte: ${map}`);
  }
  const cut = params.get('cut');
  if (cut) {
    if (has(content.cutscenes, cut)) return { entry: { kind: 'cut', id: cut }, debug, errors };
    errors.push(`Unbekannte Cutscene: ${cut}`);
  }
  return { entry: { kind: 'title' }, debug, errors };
}
