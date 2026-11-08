import type { AssetCatalog } from '../../platform/assets/manifest';
import { canvasToDataUrl, drawPortrait } from '../placeholders';

type Child = Node | string | number | null | undefined | false;
type Attrs = Record<string, string | number | boolean | null | undefined | EventListener> & { class?: string };

/** Kleines Hyperscript für die DOM-Oberfläche. */
export function h<K extends keyof HTMLElementTagNameMap>(tag: K, attrs: Attrs | null = null, ...children: (Child | Child[])[]): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);
  if (attrs) {
    for (const [key, value] of Object.entries(attrs)) {
      if (value === null || value === undefined || value === false) continue;
      if (key.startsWith('on') && typeof value === 'function') element.addEventListener(key.slice(2).toLowerCase(), value as EventListener);
      else if (key === 'class') element.className = String(value);
      else if (key === 'text') element.textContent = String(value);
      else if (value === true) element.setAttribute(key, '');
      else element.setAttribute(key, String(value));
    }
  }
  append(element, children);
  return element;
}

export function append(parent: Element, children: (Child | Child[])[]): void {
  for (const child of children.flat()) {
    if (child === null || child === undefined || child === false) continue;
    parent.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
}

export function clear(element: Element): void {
  while (element.firstChild) element.firstChild.remove();
}

const portraitCache = new Map<string, string>();

/** Platzhalter-Porträt mit Initialen als data-URL (zwischengespeichert). */
export function placeholderPortrait(name: string, seed: string): string {
  const key = `${seed}|${name}`;
  let url = portraitCache.get(key);
  if (!url) {
    url = canvasToDataUrl(drawPortrait(name, seed));
    portraitCache.set(key, url);
  }
  return url;
}

/** Porträtbild mit automatischem Rückfall auf Initialen, wenn Schlüssel oder Datei fehlt. */
export function portraitImg(catalog: AssetCatalog, key: string | null, name: string, alt = ''): HTMLImageElement {
  const img = h('img', { class: 'portrait-thumb', alt, draggable: 'false', decoding: 'async' });
  setPortrait(img, catalog, key, name);
  return img;
}

export function setPortrait(img: HTMLImageElement, catalog: AssetCatalog, key: string | null, name: string): void {
  const resolved = key ? catalog.imageKey(key, 'portrait') : null;
  const url = catalog.imageUrl(resolved);
  const fallback = placeholderPortrait(name, key ?? name);
  img.onerror = () => { img.onerror = null; img.src = fallback; };
  img.src = url ?? fallback;
}

const atlasSizes = new Map<string, Promise<{ width: number; height: number } | null>>();
function atlasSize(url: string) {
  let pending = atlasSizes.get(url);
  if (!pending) {
    pending = new Promise((resolve) => {
      const image = new Image();
      image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
      image.onerror = () => resolve(null);
      image.src = url;
    });
    atlasSizes.set(url, pending);
  }
  return pending;
}

/** Itemsymbol aus dem Atlas (manifest.items) oder Kürzel-Platzhalter. */
export function itemIcon(catalog: AssetCatalog, icon: string, name: string, size = 32): HTMLElement {
  const element = h('span', { class: size > 32 ? 'icon big' : 'icon', 'aria-hidden': 'true' });
  const fallback = () => {
    element.classList.add('fallback');
    element.style.backgroundImage = '';
    element.textContent = name.slice(0, 2);
  };
  const entry = catalog.itemIcon(icon);
  if (!entry) { fallback(); return element; }
  void atlasSize(entry.url).then((dimensions) => {
    if (!dimensions) { fallback(); return; }
    const cols = Math.max(1, Math.floor(dimensions.width / entry.cell));
    const scale = size / entry.cell;
    const col = entry.index % cols;
    const row = Math.floor(entry.index / cols);
    element.style.backgroundImage = `url("${entry.url}")`;
    element.style.backgroundSize = `${dimensions.width * scale}px ${dimensions.height * scale}px`;
    element.style.backgroundPosition = `${-col * size}px ${-row * size}px`;
  });
  return element;
}

export function focusables(root: Element): HTMLElement[] {
  return [...root.querySelectorAll<HTMLElement>('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')]
    .filter((element) => !element.closest('[hidden]') && element.offsetParent !== null);
}

export function formatTime(ms: number): string {
  const total = Math.floor(ms / 1000);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return hours ? `${hours} h ${String(minutes).padStart(2, '0')} min` : `${minutes} min ${String(seconds).padStart(2, '0')} s`;
}

export function downloadText(filename: string, text: string): void {
  const blob = new Blob([text], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = h('a', { href: url, download: filename });
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function pickTextFile(accept = '.json,application/json'): Promise<string | null> {
  return new Promise((resolve) => {
    const input = h('input', { type: 'file', accept, class: 'sr-only', 'data-testid': 'save-file-input' });
    let settled = false;
    const done = (value: string | null) => { if (!settled) { settled = true; input.remove(); resolve(value); } };
    input.addEventListener('change', () => {
      const file = input.files?.[0];
      if (!file) { done(null); return; }
      file.text().then(done, () => done(null));
    });
    input.addEventListener('cancel', () => done(null));
    document.body.append(input);
    input.click();
  });
}

export const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
