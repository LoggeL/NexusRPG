// Stadtkarte (M, Bereich dom-ui): Stationen als Pins, Bezirkslegende, Stationsliste für Tastatur und Touch,
// aktueller Ort und Zielmarker. Schnellreise per U-Bahn (+30 min) führt der Director über die Kampagne aus.
import type { CampaignPort, DistrictId, StationDef, StationId } from '../../modules/contracts';
import type { AssetCatalog } from '../../platform/assets/manifest';
import { canvasToDataUrl, drawCityMap } from '../placeholders';
import { h } from './dom';
import { Modal, type UiShell } from './shell';

let fallback = '';

export interface StationModel {
  station: StationDef;
  district: DistrictId | null;
  unlocked: boolean;
  /** Spielfigur steht auf dieser Karte oder im selben Bezirk ohne eigene Station. */
  here: boolean;
  /** Zielmarker der verfolgten Quest liegt auf dieser Karte bzw. in diesem Bezirk. */
  objective: boolean;
}

/** Reine Aufbereitung der Stationen (ohne DOM). */
export function stationModels(campaign: CampaignPort): StationModel[] {
  const content = campaign.content;
  const state = campaign.state();
  const districtOf = (map: string | undefined): DistrictId | null => (map && content.maps[map]?.district) || null;
  const stations = Object.values(content.stations);
  const hereDistrict = districtOf(state.map);
  const hereExact = stations.some((station) => station.map === state.map);
  const marker = campaign.objective()?.marker?.map;
  const markerDistrict = districtOf(marker);
  const markerExact = !!marker && stations.some((station) => station.map === marker);
  return stations.map((station) => {
    const district = districtOf(station.map);
    return {
      station,
      district,
      unlocked: state.stations.includes(station.id) && campaign.evaluate(station.when),
      here: hereExact ? station.map === state.map : !!hereDistrict && district === hereDistrict,
      objective: !!marker && (markerExact ? station.map === marker : !!markerDistrict && district === markerDistrict),
    };
  });
}

export function openCityMap(shell: UiShell, catalog: AssetCatalog, campaign: CampaignPort, travel: (station: StationId) => void): Modal {
  const modal = new Modal(shell, { name: 'map', title: 'Stadtkarte', size: 'wide' });
  modal.el.classList.add('city');
  const content = campaign.content;
  const state = campaign.state();
  const here = content.maps[state.map];
  const objective = campaign.objective();
  if (!fallback) fallback = canvasToDataUrl(drawCityMap(768, 512));
  const models = stationModels(campaign);

  const go = (model: StationModel) => {
    if (!model.unlocked) { shell.toast('Diese Station hast du noch nicht entdeckt.', 'bad'); return; }
    if (model.here && model.station.map === state.map) { shell.toast('Hier bist du schon.', 'info'); return; }
    modal.close();
    travel(model.station.id);
  };

  const label = (model: StationModel) => [
    model.unlocked ? model.station.name : 'Unbekannte Station',
    model.district ? content.districts[model.district]?.name : '',
    model.here ? 'du bist hier' : '',
    model.objective ? 'Ziel' : '',
    model.unlocked && !model.here ? 'U-Bahn, +30 Minuten' : '',
  ].filter(Boolean).join(', ');

  const board = h('div', { class: 'city-map', 'data-testid': 'city-map' },
    h('img', { src: catalog.imageUrl(catalog.imageKey('ui-city-map')) ?? fallback, alt: 'Stadtkarte von Noxius', draggable: 'false' }));
  for (const model of models) {
    const [x, y] = model.station.cityPos;
    board.append(h('button', {
      class: `pin${model.unlocked ? '' : ' locked'}${model.here ? ' here' : ''}${model.objective ? ' goal' : ''}`,
      type: 'button', tabindex: '-1', 'data-station': model.station.id, 'data-district': model.district ?? '',
      style: `left:${(x * 100).toFixed(2)}%;top:${(y * 100).toFixed(2)}%`, title: label(model), 'aria-label': label(model),
      onclick: () => go(model),
    }, h('span', { class: 'pin-dot', 'aria-hidden': 'true' }), h('span', { class: 'pin-label' }, model.unlocked ? model.station.name : '?')));
  }

  // Bezirkslegende: alle Bezirke mit mindestens einer Station, entdeckte zuerst.
  const districts = [...new Set(models.map((model) => model.district).filter((id): id is DistrictId => !!id))]
    .sort((a, b) => Number(models.some((m) => m.district === b && m.unlocked)) - Number(models.some((m) => m.district === a && m.unlocked))
      || (content.districts[a]?.name ?? a).localeCompare(content.districts[b]?.name ?? b, 'de'));
  const legend = h('ul', { class: 'district-legend', 'aria-label': 'Bezirke' }, ...districts.map((id) => {
    const known = models.some((model) => model.district === id && model.unlocked);
    return h('li', {
      class: `${known ? '' : 'locked'}${here?.district === id ? ' here' : ''}`, 'data-district': id,
      onpointerenter: () => board.dataset.focusDistrict = id, onpointerleave: () => { delete board.dataset.focusDistrict; },
    }, h('span', { class: 'swatch', 'aria-hidden': 'true' }), known ? content.districts[id]?.name ?? id : '???');
  }));

  // Stationsliste: die eigentliche Bedienung für Tastatur, Gamepad und Screenreader.
  const list = h('ul', { class: 'station-list', 'aria-label': 'U-Bahn-Stationen' }, ...models
    .slice()
    .sort((a, b) => Number(b.unlocked) - Number(a.unlocked) || a.station.name.localeCompare(b.station.name, 'de'))
    .map((model) => h('li', null, h('button', {
      class: `btn${model.objective ? ' primary' : ''}`, type: 'button', 'data-testid': `travel-${model.station.id}`,
      'aria-disabled': String(!model.unlocked || (model.here && model.station.map === state.map)),
      'data-autofocus': model.objective && model.unlocked ? true : undefined,
      onclick: () => go(model),
      onfocus: () => board.querySelector(`[data-station="${CSS.escape(model.station.id)}"]`)?.classList.add('focus'),
      onblur: () => board.querySelector(`[data-station="${CSS.escape(model.station.id)}"]`)?.classList.remove('focus'),
    },
    h('span', { class: 'row-main' }, model.unlocked ? model.station.name : 'Unbekannt'),
    model.here ? h('span', { class: 'badge' }, 'hier') : null,
    model.objective ? h('span', { class: 'badge goal' }, 'Ziel') : null))));

  modal.body.append(
    h('p', { class: 'meta', 'data-testid': 'city-here' }, `Du bist hier: ${here?.name ?? state.map}${here?.district ? ` (${content.districts[here.district]?.name ?? here.district})` : ''}`,
      objective ? ` · Ziel: ${objective.title}${objective.marker ? ` – ${content.maps[objective.marker.map]?.name ?? objective.marker.map}` : ''}` : ''),
    h('div', { class: 'city-layout' }, board, h('div', { class: 'city-side' }, h('h3', null, 'Stationen'), list, h('h3', null, 'Bezirke'), legend)));
  return modal;
}
