// Kartenhinweise auf der Stadtkarte (Bereich engine-welt): Opa Gustavs Kranblick (he-opa-gustav-2) zeigt einen Tag lang
// alle offenen Fundorte der Unterstadt, Kikis Klatschkarte (he-kiki-karbon-2) ihre gelben Klatsch-Sterne. Reine
// Aufbereitung (ohne DOM) plus Zeichnen auf dem Kartenbrett von cityMap.ts.
//
// Flags: Kranblick über `heute_gustav_kranblick` (fällt am nächsten Morgen; die Kampagne setzt es beim ersten Nachlauf
// nach `gustav_kranblick`, siehe campaign/domains/weather.ts ONE_DAY_FLAGS), Klatschkarte über `kiki_klatschkarte`.
import type { CampaignPort, Condition, GameContent, HotspotDef, MapId, Point } from '../../modules/contracts';
import { dailyHotspotFlag } from '../../modules/campaign';
import { h } from './dom';

export type MapHintKind = 'fund' | 'klatsch';

export interface MapHintMarker {
  kind: MapHintKind;
  map: MapId;
  /** Kurztext für Tooltip und Liste. */
  text: string;
  /** Lage auf der Stadtkarte (Bildanteile 0..1) – Station der Karte oder der nächsten Karte mit Station. */
  cityPos: Point | null;
  /** Anzahl Fundorte (nur 'fund'). */
  count?: number;
}

export const KRANBLICK_WHEN: Condition = { flag: 'heute_gustav_kranblick' };
export const KLATSCHKARTE_WHEN: Condition = { flag: 'kiki_klatschkarte' };
/** Bezirk, den Gustav vom Kran überblickt. */
export const KRANBLICK_DISTRICT = 'unterstadt';

/** Kikis Notizen aus he-kiki-karbon-2 („Auf deiner Stadtkarte blinken jetzt kleine gelbe Sterne …“). */
export const KLATSCH_NOTES: readonly { map: MapId; text: string; hideWhen?: Condition }[] = [
  { map: 'bahnhof-mitte', text: '„Blitz-Störsender hier???“', hideWhen: { won: 'enc-taxistand' } },
  { map: 'hafenkante', text: '„Container 77, Di Nacht, Licht“' },
  { map: 'bahnhof-mitte', text: '„Bahnsteig-Ende: Kritzelei, Jimmy?“', hideWhen: { seen: 'jimmy-spur-04' } },
];

/** Fundort: Beute-Hotspot oder ein Hotspot, der ein Sammelstück hergibt. */
export function isFindSpot(content: GameContent, spot: HotspotDef): boolean {
  if (spot.kind === 'loot') return true;
  return (spot.effects ?? []).some((effect) => 'give' in effect && content.items[effect.give]?.category === 'sammeln');
}

/** Noch offene, gerade sichtbare Fundorte einer Karte. */
export function openFindSpots(campaign: CampaignPort, map: MapId): HotspotDef[] {
  const def = campaign.content.maps[map];
  if (!def) return [];
  return (def.hotspots ?? []).filter((spot) => {
    if (!isFindSpot(campaign.content, spot)) return false;
    if (!campaign.evaluate(spot.when)) return false;
    if (spot.hideWhen && campaign.evaluate(spot.hideWhen)) return false;
    if (spot.once && campaign.evaluate({ seen: spot.id })) return false;
    return !(spot.daily && campaign.evaluate({ flag: dailyHotspotFlag(map, spot.id) }));
  });
}

/** Stadtkarten-Lage einer Karte: eigene Station, sonst die nächste Karte mit Station über die Ausgänge. */
export function cityPosOf(content: GameContent, map: MapId): Point | null {
  const stationAt = new Map<MapId, Point>();
  for (const station of Object.values(content.stations)) if (!stationAt.has(station.map)) stationAt.set(station.map, station.cityPos);
  const seen = new Set<MapId>([map]);
  let frontier: MapId[] = [map];
  for (let depth = 0; depth < 6 && frontier.length; depth++) {
    for (const id of frontier) {
      const pos = stationAt.get(id);
      if (pos) return pos;
    }
    const next: MapId[] = [];
    for (const id of frontier) {
      for (const exit of content.maps[id]?.exits ?? []) {
        if (seen.has(exit.to) || !content.maps[exit.to]) continue;
        seen.add(exit.to);
        next.push(exit.to);
      }
    }
    frontier = next;
  }
  return null;
}

/** Alle Markierungen, die gerade gelten. */
export function mapHintMarkers(campaign: CampaignPort): MapHintMarker[] {
  const content = campaign.content;
  const markers: MapHintMarker[] = [];
  if (campaign.evaluate(KRANBLICK_WHEN)) {
    for (const map of Object.values(content.maps)) {
      if (map.district !== KRANBLICK_DISTRICT) continue;
      const spots = openFindSpots(campaign, map.id);
      if (!spots.length) continue;
      markers.push({
        kind: 'fund', map: map.id, count: spots.length, cityPos: cityPosOf(content, map.id),
        text: `${map.name}: ${spots.length} ${spots.length === 1 ? 'Fundort' : 'Fundorte'} (${spots.map((spot) => spot.label).join(', ')})`,
      });
    }
  }
  if (campaign.evaluate(KLATSCHKARTE_WHEN)) {
    for (const note of KLATSCH_NOTES) {
      if (!content.maps[note.map] || (note.hideWhen && campaign.evaluate(note.hideWhen))) continue;
      markers.push({ kind: 'klatsch', map: note.map, text: `${content.maps[note.map].name}: ${note.text}`, cityPos: cityPosOf(content, note.map) });
    }
  }
  return markers;
}

/** Markierungen aufs Kartenbrett setzen; liefert die Liste für die Seitenleiste (null ohne Hinweise). */
export function drawMapHints(board: HTMLElement, campaign: CampaignPort): HTMLElement | null {
  const markers = mapHintMarkers(campaign);
  if (!markers.length) return null;
  // Mehrere Markierungen an derselben Station im Kreis um den Pin verteilen.
  const slots = new Map<string, number>();
  for (const marker of markers) {
    if (!marker.cityPos) continue;
    const key = marker.cityPos.join(',');
    const index = slots.get(key) ?? 0;
    slots.set(key, index + 1);
    const angle = -Math.PI / 4 + index * (Math.PI / 3);
    const x = marker.cityPos[0] * 100 + Math.cos(angle) * 2.6;
    const y = marker.cityPos[1] * 100 + Math.sin(angle) * 3.9;
    board.append(h('span', {
      class: `hint-marker ${marker.kind}`, title: marker.text, 'aria-hidden': 'true', 'data-hint': marker.kind, 'data-map': marker.map,
      style: `left:${x.toFixed(2)}%;top:${y.toFixed(2)}%`,
    }, marker.kind === 'fund' ? String(marker.count ?? '') : '★'));
  }
  const fund = markers.filter((marker) => marker.kind === 'fund');
  const klatsch = markers.filter((marker) => marker.kind === 'klatsch');
  const section = h('div', { class: 'map-hints', 'data-testid': 'city-hints' });
  if (fund.length) {
    section.append(h('h3', null, 'Gustavs Kranblick (heute)'),
      h('ul', { class: 'hint-list fund' }, ...fund.map((marker) => h('li', null, marker.text))));
  }
  if (klatsch.length) {
    section.append(h('h3', null, 'Kikis Klatschkarte'),
      h('ul', { class: 'hint-list klatsch' }, ...klatsch.map((marker) => h('li', null, marker.text))));
  }
  return section;
}
