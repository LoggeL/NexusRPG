// Zusammensetzung der Baukasten-Spielfigur (design.md §3.1a „Darstellung“, Ebenen-Vertrag §6.3): reines Canvas 2D,
// ohne Phaser. Lädt nur die benötigten Teile (Image-Promise-Cache), färbt sie per Verlaufskarte über die Farbmasken
// ein, legt sie je Richtung in der Katalog-Reihenfolge übereinander und liefert ein 512×512-Laufblatt
// (4×4 Zellen à 128, Zeilen S/W/O/N, Fußanker (64, 120)) – genutzt von Editor-Vorschau und Spiel.
import {
  CHAIN_PART, CYBER_PARTS, EMPTY_PARTS, HEADPHONES_PART, NEON_IDS, capPart, glassesPart, legPart, maskPart,
} from '../../modules/appearance';
import type { AppearanceTexts, Facing, PlayerAppearance } from '../../modules/contracts';
import { assetUrl } from '../../platform/assets/manifest';

// ---------------------------------------------------------------------------
// Katalog (game/public/assets/creator/catalog.json, erzeugt von creator_build.py)

export interface CatalogFile { file: string; mask?: string; regions?: string[]; clip?: string }
export interface CatalogPart {
  id: string;
  category: string;
  layer: string;
  bodyDependent?: boolean;
  side?: 'links' | 'rechts';
  hidden?: boolean;
  /** Je Körperbau ('schmal'/'mittel'/'kraeftig'), Kopfteile 'alle', Frisuren 'back'/'front'. Leer = Teil ohne Datei. */
  files: Record<string, CatalogFile>;
}
export interface CreatorCatalog {
  sheet: { frameW: number; frameH: number; cols: number; rows: number; rowsDir: Facing[]; foot: [number, number] };
  layerOrder: Record<Facing, string[]>;
  maskColors?: Record<string, string>;
  palette?: Record<string, string>;
  hairColors?: Record<string, string>;
  skin?: Record<string, string>;
  parts: Record<string, CatalogPart>;
}

const CATALOG_URL = 'assets/creator/catalog.json';
let catalogPromise: Promise<CreatorCatalog | null> | null = null;

/** Katalog einmalig laden; ohne Katalog bleibt die Spielfigur eine Platzhalter-Silhouette. */
export function loadCreatorCatalog(): Promise<CreatorCatalog | null> {
  if (!catalogPromise) {
    catalogPromise = fetch(assetUrl(CATALOG_URL), { cache: 'no-cache' })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: unknown) => (data && typeof data === 'object' && 'parts' in data && 'layerOrder' in data ? data as CreatorCatalog : null))
      .catch(() => null);
  }
  return catalogPromise;
}

/** Hat das Teil eine Grafik (oder braucht keine, z. B. 'jacke-keine')? Fehlende Teile blendet der Editor aus. */
export function partAvailable(catalog: CreatorCatalog | null, partId: string): boolean {
  if (EMPTY_PARTS.has(partId)) return true;
  if (!catalog) return false;
  const part = catalog.parts[partId];
  if (!part || part.hidden) return false;
  return true;
}

// ---------------------------------------------------------------------------
// Farben

type Rgb = [number, number, number];
export interface Ramp { dark: Rgb; mid: Rgb; light: Rgb }

const BG: Rgb = [0x0b, 0x07, 0x16];
const WHITE: Rgb = [255, 255, 255];

export function hexToRgb(hex: string): Rgb {
  const value = hex.replace('#', '');
  const full = value.length === 3 ? value.split('').map((c) => c + c).join('') : value;
  const n = Number.parseInt(full, 16);
  return Number.isFinite(n) ? [(n >> 16) & 255, (n >> 8) & 255, n & 255] : [128, 128, 128];
}

const mix = (a: Rgb, b: Rgb, t: number): Rgb => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

/** Drei Stufen der Verlaufskarte; fehlend: dunkel = mix(mid, #0b0716, 0,6), hell = mix(mid, #fff, 0,45) (Neon 0,7). */
export function rampOf(entry: { mid: string; dark?: string; light?: string } | string | undefined, neon = false): Ramp {
  const def = typeof entry === 'string' ? { mid: entry } : entry ?? { mid: '#808080' };
  const mid = hexToRgb(def.mid);
  return {
    mid,
    dark: def.dark ? hexToRgb(def.dark) : mix(mid, BG, 0.6),
    light: def.light ? hexToRgb(def.light) : mix(mid, WHITE, neon ? 0.7 : 0.45),
  };
}

type Region = 'colorA' | 'colorB' | 'hair' | 'skin' | 'glow';
const REGION_INDEX: Record<Region, number> = { colorA: 1, colorB: 2, hair: 3, skin: 4, glow: 5 };
const REGIONS: Region[] = ['colorA', 'colorB', 'hair', 'skin', 'glow'];

/** Farbstufen je Region für ein Aussehen. */
export function rampsFor(a: PlayerAppearance, texts: AppearanceTexts | undefined, catalog: CreatorCatalog | null): Record<Region, Ramp> {
  const neon = (id: string) => (NEON_IDS as readonly string[]).includes(id) || id === 'giftgruen';
  const color = (id: string) => rampOf(texts?.palette[id] ?? catalog?.palette?.[id], neon(id));
  return {
    colorA: color(a.colorA),
    colorB: color(a.colorB),
    glow: color(a.cyber.glow),
    hair: rampOf(texts?.hairColors[a.hairColor] ?? catalog?.hairColors?.[a.hairColor], neon(a.hairColor)),
    skin: rampOf(texts?.skin[a.skin] ?? catalog?.skin?.[a.skin]),
  };
}

const rampKey = (ramp: Ramp) => [...ramp.dark, ...ramp.mid, ...ramp.light].map((v) => Math.round(v)).join(',');

// ---------------------------------------------------------------------------
// Bilder und Pixeldaten (Caches)

const images = new Map<string, Promise<HTMLImageElement | null>>();

function loadImage(file: string): Promise<HTMLImageElement | null> {
  let pending = images.get(file);
  if (!pending) {
    pending = new Promise((resolve) => {
      const image = new Image();
      image.decoding = 'async';
      image.onload = () => resolve(image);
      image.onerror = () => resolve(null);
      image.src = assetUrl(file);
    });
    images.set(file, pending);
  }
  return pending;
}

function canvas(w: number, h: number): HTMLCanvasElement {
  const element = document.createElement('canvas');
  element.width = w;
  element.height = h;
  return element;
}

/** Pixel eines Teils plus Regionsindex je Pixel (0 = feste Farbe). */
interface PartPixels { width: number; height: number; data: Uint8ClampedArray; region: Uint8Array; regions: Set<Region> }
const pixelCache = new Map<string, Promise<PartPixels | null>>();

function readPixels(image: HTMLImageElement): ImageData {
  const c = canvas(image.naturalWidth, image.naturalHeight);
  const ctx = c.getContext('2d', { willReadFrequently: true })!;
  ctx.drawImage(image, 0, 0);
  return ctx.getImageData(0, 0, c.width, c.height);
}

/** Maskenfarbe → Region: Rot = A, Grün = B, Blau = Haar, Gelb = Haut, Magenta = Leuchten, sonst fest. */
function regionOfMask(r: number, g: number, b: number, alpha: number): number {
  if (alpha < 128) return 0;
  const R = r > 127; const G = g > 127; const B = b > 127;
  if (R && G && !B) return REGION_INDEX.skin;
  if (R && !G && B) return REGION_INDEX.glow;
  if (R && !G && !B) return REGION_INDEX.colorA;
  if (!R && G && !B) return REGION_INDEX.colorB;
  if (!R && !G && B) return REGION_INDEX.hair;
  return 0;
}

function partPixels(entry: CatalogFile): Promise<PartPixels | null> {
  const key = `${entry.file}|${entry.mask ?? ''}`;
  let pending = pixelCache.get(key);
  if (!pending) {
    pending = Promise.all([loadImage(entry.file), entry.mask ? loadImage(entry.mask) : Promise.resolve(null)]).then(([image, mask]) => {
      if (!image) return null;
      const pixels = readPixels(image);
      const region = new Uint8Array(pixels.width * pixels.height);
      const regions = new Set<Region>();
      if (mask && mask.naturalWidth === pixels.width && mask.naturalHeight === pixels.height) {
        const m = readPixels(mask).data;
        for (let i = 0, p = 0; p < region.length; p++, i += 4) {
          const index = regionOfMask(m[i], m[i + 1], m[i + 2], m[i + 3]);
          region[p] = index;
          if (index) regions.add(REGIONS[index - 1]);
        }
      }
      return { width: pixels.width, height: pixels.height, data: pixels.data, region, regions };
    });
    pixelCache.set(key, pending);
  }
  return pending;
}

/** Eingefärbte Teile je (Datei, benutzte Farben) – begrenzt, damit der Speicher im Editor nicht wächst. */
const tintCache = new Map<string, HTMLCanvasElement>();
const TINT_CACHE_MAX = 48;

function remember(key: string, value: HTMLCanvasElement) {
  tintCache.set(key, value);
  while (tintCache.size > TINT_CACHE_MAX) tintCache.delete(tintCache.keys().next().value as string);
}

function tinted(entry: CatalogFile, pixels: PartPixels, ramps: Record<Region, Ramp>): HTMLCanvasElement {
  const used = [...pixels.regions].sort();
  const key = `${entry.file}|${used.map((region) => `${region}:${rampKey(ramps[region])}`).join(';')}`;
  const hit = tintCache.get(key);
  if (hit) { tintCache.delete(key); tintCache.set(key, hit); return hit; }
  const out = canvas(pixels.width, pixels.height);
  const ctx = out.getContext('2d')!;
  const image = ctx.createImageData(pixels.width, pixels.height);
  const src = pixels.data;
  const dst = image.data;
  dst.set(src);
  if (used.length) {
    const table: (Ramp | null)[] = [null, ...REGIONS.map((region) => ramps[region])];
    for (let p = 0, i = 0; p < pixels.region.length; p++, i += 4) {
      const index = pixels.region[p];
      if (!index || src[i + 3] === 0) continue;
      const ramp = table[index]!;
      const l = src[i] / 255;
      let c0: Rgb; let c1: Rgb; let t: number;
      if (l < 0.5) { c0 = ramp.dark; c1 = ramp.mid; t = l * 2; } else { c0 = ramp.mid; c1 = ramp.light; t = (l - 0.5) * 2; }
      dst[i] = c0[0] + (c1[0] - c0[0]) * t;
      dst[i + 1] = c0[1] + (c1[1] - c0[1]) * t;
      dst[i + 2] = c0[2] + (c1[2] - c0[2]) * t;
    }
  }
  ctx.putImageData(image, 0, 0);
  remember(key, out);
  return out;
}

// ---------------------------------------------------------------------------
// Ebenen

interface LayerSource { layer: string; entry: CatalogFile; clip?: CatalogFile }

/** Katalog-Teile je Ebene für ein Aussehen (fehlende Grafiken werden übersprungen). */
export function layerSources(a: PlayerAppearance, catalog: CreatorCatalog): LayerSource[] {
  const out: LayerSource[] = [];
  const cap = capPart(a.acc.cap);
  const capDef = cap ? catalog.parts[cap] : undefined;
  // Clip-Maske der Kappe (Katalogfeld `clip`, sonst `<datei>.clip.png` daneben).
  const capFile = capDef ? Object.values(capDef.files)[0] : undefined;
  const clip = capFile ? capFile.clip ?? capFile.file.replace(/\.png$/, '.clip.png') : undefined;
  const add = (layer: string, partId: string | null, key?: string) => {
    if (!partId) return;
    const part = catalog.parts[partId];
    if (!part) return;
    const entry = key ? part.files[key] : part.files[a.body] ?? part.files.alle;
    if (entry?.file) out.push({ layer, entry, ...(clip && layer.startsWith('haar.') ? { clip: { file: clip } } : {}) });
  };
  add('haar.back', a.hair, 'back');
  add('haar.front', a.hair, 'front');
  add('koerper', 'koerper');
  if (a.tattoo !== 'tattoo-keins') add('tattoo', a.tattoo);
  add('gesicht', a.face);
  if (a.cyber.facePlate) add('cyber.platte', CYBER_PARTS.facePlate);
  if (a.cyber.eyes) add('cyber.augen', CYBER_PARTS.eyes);
  add('hose', a.pants);
  add('cyber.bein', legPart(a.cyber.leg));
  add('schuhe', a.shoes);
  add('oberteil', a.top);
  if (a.cyber.neckCable) add('cyber.kabel', CYBER_PARTS.neckCable);
  if (a.acc.chain) add('kette', CHAIN_PART);
  if (a.jacket !== 'jacke-keine') add('jacke', a.jacket);
  if (a.cyber.armL) add('cyber.arm', CYBER_PARTS.armL);
  if (a.cyber.armR) add('cyber.arm', CYBER_PARTS.armR);
  add('maske', maskPart(a.acc.mask));
  add('brille', glassesPart(a.acc.glasses));
  add('kappe', cap);
  if (a.acc.headphones) add('kopfhoerer', HEADPHONES_PART);
  return out;
}

const DEFAULT_ROWS: Facing[] = ['s', 'w', 'e', 'n'];

export interface ComposeOptions {
  catalog: CreatorCatalog;
  texts?: AppearanceTexts;
  /** Zielcanvas (wird erst gezeichnet, wenn alle Teile geladen sind); Standard: neues 512×512-Canvas. */
  target?: HTMLCanvasElement;
}

/** Setzt das Laufblatt zusammen. Gezeichnet wird in einem Zug nach dem Laden (Ziel < 30 ms aus dem Cache). */
export async function composeAppearance(a: PlayerAppearance, options: ComposeOptions): Promise<HTMLCanvasElement> {
  const { catalog } = options;
  const { frameW, frameH, cols } = catalog.sheet;
  const rows = catalog.sheet.rowsDir?.length ? catalog.sheet.rowsDir : DEFAULT_ROWS;
  const width = frameW * cols;
  const height = frameH * rows.length;
  const sources = layerSources(a, catalog);
  const ramps = rampsFor(a, options.texts, catalog);
  const loaded = await Promise.all(sources.map(async (source) => ({
    source,
    pixels: await partPixels(source.entry),
    clip: source.clip ? await loadImage(source.clip.file) : null,
  })));
  const layers = new Map<string, HTMLCanvasElement[]>();
  for (const { source, pixels, clip } of loaded) {
    if (!pixels) continue;
    let image = tinted(source.entry, pixels, ramps);
    if (clip) {
      const clipKey = `${source.entry.file}|clip:${source.clip!.file}|${rampKey(ramps.hair)}`;
      const hit = tintCache.get(clipKey);
      if (hit) image = hit;
      else {
        const cut = canvas(image.width, image.height);
        const ctx = cut.getContext('2d')!;
        ctx.drawImage(image, 0, 0);
        ctx.globalCompositeOperation = 'destination-out';
        ctx.drawImage(clip, 0, 0);
        remember(clipKey, cut);
        image = cut;
      }
    }
    const list = layers.get(source.layer) ?? [];
    list.push(image);
    layers.set(source.layer, list);
  }
  const target = options.target ?? canvas(width, height);
  if (target.width !== width || target.height !== height) { target.width = width; target.height = height; }
  const ctx = target.getContext('2d')!;
  ctx.clearRect(0, 0, width, height);
  rows.forEach((dir, row) => {
    const y = row * frameH;
    for (const layer of catalog.layerOrder[dir] ?? catalog.layerOrder.s) {
      for (const image of layers.get(layer) ?? []) ctx.drawImage(image, 0, y, width, frameH, 0, y, width, frameH);
    }
  });
  return target;
}
