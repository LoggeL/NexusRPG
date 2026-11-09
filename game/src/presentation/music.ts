// Welche Lyria-Musik läuft wo (design.md §7): Karte vor Bezirk, Tag/Nacht-Varianten, Kampf/Boss.
import type { GameContent as Content, Condition, EncounterId, MapDef, MusicSpec } from '../modules/contracts';

/** Nacht: 20:00 bis 06:00 (Minuten ab 0:00, Spieltag läuft bis 02:00 = 1560). */
export function isNight(minutes: number): boolean {
  const m = ((minutes % 1440) + 1440) % 1440;
  return m >= 20 * 60 || m < 6 * 60;
}

function pick(spec: MusicSpec, minutes: number): string {
  return typeof spec === 'string' ? spec : isNight(minutes) ? spec.night : spec.day;
}

/** Bezirksstandard nach Namensmuster, falls weder Karte noch Bezirk Musik angeben. */
const FALLBACK: [RegExp, MusicSpec][] = [
  [/kanal/, 'kanalisation'],
  [/oednis|staub/, 'oednis'],
  [/meer|strand/, 'meer'],
  [/flutmauer/, 'flutmauer'],
  [/oberstadt|chrome|glas|himmel/, 'oberstadt'],
  [/quantum|labor|digitech/, 'quantum-labor'],
  [/mittel|stufen|eisenhof/, 'mittelring'],
  [/zell|knast|gefaengnis/, 'gefaengnis'],
];

/** `evaluate` prüft `MapDef.musicWhen` (ohne: nur die feste Kartenmusik). */
export function musicForMap(
  content: Content, map: MapDef, minutes: number, evaluate?: (condition?: Condition) => boolean,
): { id: string | null; muffled: boolean } {
  const muffled = !!map.musicMuffled;
  const variant = evaluate ? map.musicWhen?.find((entry) => evaluate(entry.when)) : undefined;
  if (variant) return { id: variant.music === null ? null : pick(variant.music, minutes), muffled };
  if (map.music === null) return { id: null, muffled };
  if (map.music) return { id: pick(map.music, minutes), muffled };
  const district = content.districts?.[map.district];
  if (district?.music) return { id: pick(district.music, minutes), muffled };
  const key = `${map.district} ${map.id}`;
  for (const [re, spec] of FALLBACK) if (re.test(key)) return { id: pick(spec, minutes), muffled };
  if (map.ambience === 'club') return { id: 'high-voltage', muffled };
  if (map.ambience === 'innen') return { id: null, muffled };
  return { id: pick({ day: 'unterstadt-tag', night: 'unterstadt-nacht' }, minutes), muffled };
}

export function musicForBattle(content: Content, encounter: EncounterId): string {
  const enc = content.encounters?.[encounter] as { boss?: unknown; id?: string } | undefined;
  return enc?.boss || /boss/.test(String(encounter)) ? 'boss' : 'kampf';
}
