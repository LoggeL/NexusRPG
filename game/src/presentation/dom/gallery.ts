// Galerie gesehener Schlüsselszenen (Bereich dom-ui): Raster mit Vorschaubildern, Betrachter mit Ken Burns,
// Bildunterschrift und Vor/Zurück. Gesehene Szenen gelten über alle Spielstände (platform/storage GalleryStore).
import type { CampaignPort } from '../../modules/contracts';
import type { AssetCatalog } from '../../platform/assets/manifest';
import { createGalleryStore, type GalleryStore } from '../../platform/storage';
import { canvasToDataUrl, drawCutscene } from '../placeholders';
import { clear, h } from './dom';
import { panFor } from './plateModel';
import { applyPan } from './plateUi';
import { Modal, type UiShell } from './shell';
import { galleryEntries, type GalleryEntry, type GalleryImage } from './viewModels';

const VIEW_MS = 14000;

/**
 * Hält die spielstandübergreifende Galerie mit `state.gallery` gleich: neue Szenen wandern in den Speicher.
 * Liefert die Abmeldung. Einmal im Director-Konstruktor aufrufen.
 */
export function installGallerySync(campaign: CampaignPort, store: GalleryStore = createGalleryStore()): () => void {
  store.add(campaign.state().gallery);
  let last = campaign.state().gallery;
  return campaign.subscribe((state) => {
    if (state.gallery === last) return;
    last = state.gallery;
    store.add(state.gallery);
  });
}

/** Alle jemals gesehenen Szenen: Speicher plus laufende Partie. */
export function seenGallery(campaign: CampaignPort | null, store: GalleryStore = createGalleryStore()): Set<string> {
  return new Set([...store.ids(), ...(campaign?.state().gallery ?? [])]);
}

function imageSrc(catalog: AssetCatalog, image: GalleryImage, title: string): string {
  return catalog.imageUrl(catalog.imageKey(image.image, 'cut')) ?? canvasToDataUrl(drawCutscene(title, image.image));
}

export interface GalleryOptions { reducedMotion: boolean; store?: GalleryStore }

export function openGallery(shell: UiShell, catalog: AssetCatalog, campaign: CampaignPort, options: GalleryOptions): Modal {
  const entries = galleryEntries(campaign.content, seenGallery(campaign, options.store));
  const seen = entries.filter((entry) => entry.seen && entry.images.length);
  let viewing: { entry: GalleryEntry; index: number } | null = null;

  const step = (delta: number) => {
    if (!viewing) return;
    // Bilder der Szene durchblättern; am Ende zur nächsten gesehenen Szene.
    const next = viewing.index + delta;
    if (next >= 0 && next < viewing.entry.images.length) viewing = { entry: viewing.entry, index: next };
    else if (seen.length) {
      const pos = (seen.indexOf(viewing.entry) + (delta > 0 ? 1 : -1) + seen.length) % seen.length;
      const entry = seen[pos];
      viewing = { entry, index: delta > 0 ? 0 : entry.images.length - 1 };
    }
    render();
  };

  const modal = new Modal(shell, {
    name: 'gallery', title: 'Galerie', size: 'wide',
    onIntent: (event) => {
      const intent = event.intent;
      if (!viewing) return false;
      if (intent.type === 'cancel') { viewing = null; render(); return true; }
      if (intent.type === 'nav' && (intent.dir === 'left' || intent.dir === 'right')) { step(intent.dir === 'left' ? -1 : 1); return true; }
      return false;
    },
  });
  modal.el.classList.add('gallery');
  const root = h('div', { 'data-testid': 'gallery' });
  modal.body.append(root);
  let lastTile: string | null = null;

  const renderGrid = () => {
    modal.titleEl.textContent = 'Galerie';
    root.append(h('p', { class: 'meta', 'data-testid': 'gallery-count' }, `${seen.length} von ${entries.length} Schlüsselszenen gesehen`));
    if (!entries.length) { root.append(h('p', { class: 'empty' }, 'Noch keine Schlüsselszenen im Spiel.')); return; }
    const grid = h('ul', { class: 'gallery-grid', 'aria-label': 'Schlüsselszenen' });
    for (const entry of entries) {
      if (entry.seen && entry.images.length) {
        grid.append(h('li', null, h('button', {
          class: 'gallery-tile', type: 'button', 'data-cutscene': entry.id, 'aria-label': `${entry.title} ansehen`,
          onclick: () => { lastTile = entry.id; viewing = { entry, index: 0 }; render(); },
        },
        h('img', { src: imageSrc(catalog, entry.images[0], entry.title), alt: '', loading: 'lazy', decoding: 'async' }),
        h('span', { class: 'tile-title' }, entry.title),
        entry.images.length > 1 ? h('span', { class: 'badge' }, String(entry.images.length)) : null)));
      } else {
        grid.append(h('li', null, h('div', { class: 'gallery-tile locked', 'aria-label': 'Noch nicht gesehen' }, h('span', { class: 'tile-title' }, '???'))));
      }
    }
    root.append(grid);
    if (lastTile) requestAnimationFrame(() => (grid.querySelector(`[data-cutscene="${CSS.escape(lastTile ?? '')}"]`) as HTMLElement | null)?.focus({ preventScroll: false }));
  };

  const renderViewer = (entry: GalleryEntry, index: number) => {
    const image = entry.images[index];
    modal.titleEl.textContent = entry.title;
    const img = h('img', { class: 'gallery-image', src: imageSrc(catalog, image, entry.title), alt: image.caption ?? entry.title, draggable: 'false' });
    const pan = options.reducedMotion ? undefined : panFor(image.pan);
    img.addEventListener('load', () => applyPan(img, pan, VIEW_MS, options.reducedMotion), { once: true });
    const many = seen.length > 1 || entry.images.length > 1;
    root.append(
      h('figure', { class: 'gallery-viewer', 'data-testid': 'gallery-viewer' },
        h('div', { class: 'gallery-frame' }, img, h('div', { class: 'plate-vignette', 'aria-hidden': 'true' })),
        h('figcaption', null, image.caption ?? '', h('span', { class: 'meta' }, entry.images.length > 1 ? ` · Bild ${index + 1} von ${entry.images.length}` : ''))),
      h('div', { class: 'actions' },
        h('button', { class: 'btn', type: 'button', 'data-testid': 'gallery-prev', disabled: !many, onclick: () => step(-1), 'aria-label': 'Vorheriges Bild' }, '‹ Zurück'),
        h('button', { class: 'btn', type: 'button', 'data-testid': 'gallery-back', 'data-autofocus': true, onclick: () => { viewing = null; render(); } }, 'Übersicht'),
        h('button', { class: 'btn', type: 'button', 'data-testid': 'gallery-next', disabled: !many, onclick: () => step(1), 'aria-label': 'Nächstes Bild' }, 'Weiter ›')));
    requestAnimationFrame(() => (root.querySelector('[data-testid="gallery-next"]:not([disabled])') as HTMLElement | null ?? root.querySelector('[data-testid="gallery-back"]') as HTMLElement | null)?.focus({ preventScroll: true }));
  };

  const render = () => {
    clear(root);
    if (viewing) renderViewer(viewing.entry, viewing.index);
    else renderGrid();
  };
  render();
  return modal;
}
