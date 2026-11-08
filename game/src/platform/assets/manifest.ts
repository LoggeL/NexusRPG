import type { AssetManifest, SpriteSheetEntry } from '../../modules/contracts';

export function emptyManifest(): AssetManifest {
  return { schemaVersion: 1, images: {}, sprites: {}, items: { atlas: '', cell: 32, icons: {} } };
}

/** Pfade im Manifest sind relativ zu game/public; Vite stellt sie unter BASE_URL bereit. */
export function assetUrl(file: string): string {
  if (/^(data:|blob:|https?:)/.test(file)) return file;
  const base = (import.meta.env?.BASE_URL ?? '/').replace(/\/?$/, '/');
  return base + file.replace(/^\/+/, '');
}

function sanitize(raw: unknown): AssetManifest {
  const manifest = emptyManifest();
  if (!raw || typeof raw !== 'object') return manifest;
  const value = raw as Partial<AssetManifest>;
  if (value.images && typeof value.images === 'object') {
    for (const [key, file] of Object.entries(value.images)) if (typeof file === 'string' && file) manifest.images[key] = file;
  }
  if (value.sprites && typeof value.sprites === 'object') {
    for (const [key, entry] of Object.entries(value.sprites)) {
      const sheet = entry as Partial<SpriteSheetEntry>;
      if (sheet && typeof sheet.file === 'string' && sheet.frameW && sheet.frameH) {
        manifest.sprites[key] = {
          file: sheet.file,
          frameW: sheet.frameW,
          frameH: sheet.frameH,
          cols: sheet.cols ?? 1,
          rows: sheet.rows ?? 1,
          foot: (sheet.foot ?? [sheet.frameW / 2, sheet.frameH - 4]) as SpriteSheetEntry['foot'],
          anims: sheet.anims,
        };
      }
    }
  }
  if (value.items && typeof value.items === 'object') {
    manifest.items = {
      atlas: typeof value.items.atlas === 'string' ? value.items.atlas : '',
      cell: typeof value.items.cell === 'number' && value.items.cell > 0 ? value.items.cell : 32,
      icons: value.items.icons && typeof value.items.icons === 'object' ? { ...value.items.icons } : {},
    };
  }
  return manifest;
}

/** Lädt das Manifest; bei Fehlern läuft das Spiel mit Platzhaltern weiter. */
export async function loadManifest(url = assetUrl('assets/manifest.json')): Promise<{ manifest: AssetManifest; error?: string }> {
  try {
    const response = await fetch(url, { cache: 'no-cache' });
    if (!response.ok) return { manifest: emptyManifest(), error: `HTTP ${response.status}` };
    return { manifest: sanitize(await response.json()) };
  } catch (error) {
    return { manifest: emptyManifest(), error: String(error) };
  }
}

/**
 * Schlüsselauflösung mit Präfix-Toleranz: Inhalte dürfen 'honey-pot' oder 'prop-honey-pot',
 * 'erwachen' oder 'cut-erwachen' schreiben.
 */
export class AssetCatalog {
  constructor(public readonly manifest: AssetManifest) {}

  imageKey(name: string | undefined | null, prefix?: string): string | null {
    if (!name) return null;
    const candidates = [name];
    if (prefix && !name.startsWith(prefix + '-')) candidates.push(`${prefix}-${name}`);
    for (const key of candidates) if (this.manifest.images[key]) return key;
    return null;
  }

  spriteKey(name: string | undefined | null, prefix?: string): string | null {
    if (!name) return null;
    const candidates = [name];
    if (prefix && !name.startsWith(prefix + '-')) candidates.push(`${prefix}-${name}`);
    for (const key of candidates) if (this.manifest.sprites[key]) return key;
    return null;
  }

  /** Kanonischer Schlüssel, auch wenn er (noch) nicht im Manifest steht – für Platzhalter. */
  canonical(name: string, prefix?: string): string {
    return this.imageKey(name, prefix) ?? this.spriteKey(name, prefix) ?? (prefix && !name.startsWith(prefix + '-') ? `${prefix}-${name}` : name);
  }

  imageUrl(key: string | null | undefined): string | null {
    if (!key) return null;
    const file = this.manifest.images[key];
    return file ? assetUrl(file) : null;
  }

  sprite(key: string): SpriteSheetEntry | null {
    return this.manifest.sprites[key] ?? null;
  }

  /** Atlasposition eines Itemsymbols; Spaltenzahl ergibt sich erst aus der Bildbreite. */
  itemIcon(icon: string): { url: string; index: number; cell: number } | null {
    const { atlas, cell, icons } = this.manifest.items;
    const index = icons[icon];
    if (!atlas || index === undefined) return null;
    return { url: assetUrl(atlas), index, cell };
  }
}
