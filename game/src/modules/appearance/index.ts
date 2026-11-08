// Charakter-Baukasten als reine Regeln (design.md §3.1a): IDs, Kombinationsregeln (normalize), Zufall mit Schlössern,
// Vorlagen, stabile Serialisierung (appearanceKey), Prüfung und Reparatur gespeicherter Aussehen (PART_ALIASES).
// Kennt keine Grafiken: welche Teile schon gemalt sind, gibt die Darstellung über `available` mit.
import type {
  BodyId, CapId, GameContent, GlassesId, LookId, MaskId, PlayerAccessories, PlayerAppearance, PlayerCyberLook, Side, WearLook,
} from '../contracts';

// ---------------------------------------------------------------------------
// IDs (Namen deutsch in content/appearance.ts)

export const BODY_IDS: readonly BodyId[] = ['schmal', 'mittel', 'kraeftig'];
export const SKIN_IDS = ['haut-1', 'haut-2', 'haut-3', 'haut-4', 'haut-5', 'haut-6', 'haut-7', 'haut-8'] as const;
export const FACE_IDS = ['gesicht-1', 'gesicht-2', 'gesicht-3', 'gesicht-4', 'gesicht-5', 'gesicht-6'] as const;
export const HAIR_IDS = [
  'haar-glatze', 'haar-buzz', 'haar-undercut', 'haar-irokese', 'haar-sidecut', 'haar-pixie', 'haar-bob', 'haar-locken-kurz',
  'haar-wuschel', 'haar-afro', 'haar-schulterlang', 'haar-lang-glatt', 'haar-lang-locken', 'haar-pferdeschwanz',
  'haar-zwei-zoepfe', 'haar-dutt', 'haar-dreads',
] as const;
export const HAIR_COLOR_IDS = [
  'schwarz', 'dunkelbraun', 'kastanie', 'kupfer', 'rot', 'dunkelblond', 'blond', 'platin', 'grau', 'weiss',
  'neon-pink', 'neon-cyan', 'neon-violett', 'giftgruen',
] as const;
export const TOP_IDS = ['oben-tshirt', 'oben-tanktop', 'oben-hemd', 'oben-rollkragen', 'oben-hoodie', 'oben-netzshirt', 'oben-streifenpulli', 'oben-gurtshirt'] as const;
export const JACKET_IDS = ['jacke-keine', 'jacke-bomber', 'jacke-leder', 'jacke-langmantel', 'jacke-jeans', 'jacke-kapuze', 'jacke-weste', 'jacke-sakko'] as const;
export const PANTS_IDS = ['hose-cargo', 'hose-jeans', 'hose-flicken', 'hose-leder', 'hose-anzug', 'hose-rock', 'hose-overall'] as const;
export const SHOE_IDS = ['schuhe-sneaker', 'schuhe-hightops', 'schuhe-kampfstiefel', 'schuhe-plateau', 'schuhe-halbschuhe'] as const;
export const PALETTE_IDS = [
  'schwarz', 'anthrazit', 'grau', 'weiss', 'sand', 'oliv', 'leder', 'wein', 'rot', 'orange', 'senf', 'waldgruen', 'petrol',
  'marine', 'jeansblau', 'chrom', 'neon-pink', 'neon-cyan', 'neon-violett', 'neon-gruen',
] as const;
export const NEON_IDS = ['neon-pink', 'neon-cyan', 'neon-violett', 'neon-gruen'] as const;
export const TATTOO_IDS = ['tattoo-keins', 'tattoo-wange', 'tattoo-hals', 'tattoo-arm', 'tattoo-neonlinien'] as const;
export const GLASSES_IDS: readonly GlassesId[] = ['keine', 'rund', 'sonnenbrille', 'visier'];
export const MASK_IDS: readonly MaskId[] = ['keine', 'tuch', 'atemmaske'];
export const CAP_IDS: readonly CapId[] = ['keine', 'basecap', 'muetze'];
export const LEG_IDS: readonly PlayerCyberLook['leg'][] = ['keins', 'links', 'rechts'];

/** Gebackene Laufblatt-Textur der Baukasten-Spielfigur (design.md §3.1a). */
export const PLAYER_SPRITE = 'player-walk';

/** Vorlage für alte Stände ohne bekanntes Aussehen (world.md §2.3). */
export const DEFAULT_LOOK_ID: LookId = 'look-neonbomber';

/** Umbenannte Teil-IDs (alt → neu), damit spätere Kunständerungen keine Stände zerstören. */
export const PART_ALIASES: Readonly<Record<string, string>> = {};

/** Neonbomber (world.md §2.3) – Rückfall, falls der Inhalt keine Vorlage liefert. */
export const DEFAULT_APPEARANCE: PlayerAppearance = {
  v: 1, body: 'mittel', skin: 'haut-3', face: 'gesicht-1', hair: 'haar-sidecut', hairColor: 'schwarz',
  top: 'oben-tshirt', jacket: 'jacke-bomber', pants: 'hose-cargo', shoes: 'schuhe-sneaker', colorA: 'schwarz', colorB: 'neon-pink',
  cyber: { armL: false, armR: false, eyes: true, facePlate: false, neckCable: false, leg: 'keins', glow: 'neon-cyan' },
  tattoo: 'tattoo-keins',
  acc: { glasses: 'keine', mask: 'keine', chain: false, cap: 'keine', headphones: false },
};

export const cloneAppearance = (a: PlayerAppearance): PlayerAppearance => ({ ...a, cyber: { ...a.cyber }, acc: { ...a.acc } });

// ---------------------------------------------------------------------------
// Teile im Katalog (creator/catalog.json) je Feld

/** Katalog-ID eines Accessoires bzw. Cyberteils; null = keine Ebene. */
export const glassesPart = (id: GlassesId): string | null => (id === 'keine' ? null : `brille-${id}`);
export const maskPart = (id: MaskId): string | null => (id === 'keine' ? null : `maske-${id}`);
export const capPart = (id: CapId): string | null => (id === 'keine' ? null : `kappe-${id}`);
export const legPart = (leg: PlayerCyberLook['leg']): string | null => (leg === 'keins' ? null : `cyber-bein-${leg}`);
export const CHAIN_PART = 'kette';
export const HEADPHONES_PART = 'kopfhoerer';
export const CYBER_PARTS = {
  armL: 'cyber-arm-links', armR: 'cyber-arm-rechts', eyes: 'cyber-augen', facePlate: 'cyber-platte', neckCable: 'cyber-kabel',
} as const;

/** Teile ohne eigene Datei (immer verfügbar). */
export const EMPTY_PARTS: ReadonlySet<string> = new Set(['jacke-keine', 'haar-glatze', 'gesicht-1', 'tattoo-keins']);

/** Ist dieses Teil wählbar? Ohne Angabe gilt alles als verfügbar. */
export type PartAvailable = (partId: string) => boolean;

// ---------------------------------------------------------------------------
// Kombinationsregeln

export type AppearancePatch = Partial<Omit<PlayerAppearance, 'v' | 'cyber' | 'acc'>> & {
  cyber?: Partial<PlayerCyberLook>;
  acc?: Partial<PlayerAccessories>;
};

/** Harte Regeln anwenden (Maske ⟂ Gesichtsplatte: die Maske gewinnt). Oberteil und Hose sind per Typ Pflicht. */
export function normalize(a: PlayerAppearance): PlayerAppearance {
  const out = cloneAppearance(a);
  if (out.acc.mask !== 'keine' && out.cyber.facePlate) out.cyber.facePlate = false;
  return out;
}

/** Wahl übernehmen; legt Unvereinbares ab und meldet es („Gesichtsplatte abgelegt“). */
export function applyPatch(a: PlayerAppearance, patch: AppearancePatch): { appearance: PlayerAppearance; dropped: string[] } {
  const next: PlayerAppearance = {
    ...cloneAppearance(a),
    ...patch,
    v: 1,
    cyber: { ...a.cyber, ...(patch.cyber ?? {}) },
    acc: { ...a.acc, ...(patch.acc ?? {}) },
  };
  const dropped: string[] = [];
  if (next.acc.mask !== 'keine' && next.cyber.facePlate) {
    if (patch.cyber?.facePlate) { next.acc.mask = 'keine'; dropped.push('Maske abgelegt'); }
    else { next.cyber.facePlate = false; dropped.push('Gesichtsplatte abgelegt'); }
  }
  return { appearance: next, dropped };
}

/** Warum diese Wahl etwas ablegen würde (für ausgegraute Optionen mit Hinweis), sonst null. */
export function conflictHint(a: PlayerAppearance, patch: AppearancePatch): string | null {
  if (patch.acc?.mask && patch.acc.mask !== 'keine' && a.cyber.facePlate) return 'Legt die Gesichtsplatte ab (beide sitzen am unteren Gesicht).';
  if (patch.cyber?.facePlate && a.acc.mask !== 'keine') return 'Legt die Maske ab (beide sitzen am unteren Gesicht).';
  return null;
}

/** Erlaubte, aber sichtbare Folgen der Kombination (Hinweise im Editor). */
export function softHints(a: PlayerAppearance): string[] {
  const hints: string[] = [];
  if (a.cyber.eyes && (a.acc.glasses === 'sonnenbrille' || a.acc.glasses === 'visier')) hints.push('Die Brille verdeckt das Augen-Leuchten.');
  if (a.hair === 'haar-glatze') hints.push('Glatze: Die Haarfarbe färbt nur Bart und Brauen.');
  if (a.acc.cap !== 'keine' && a.hair !== 'haar-glatze') hints.push('Die Kappe schneidet die Frisur ab.');
  return hints;
}

// ---------------------------------------------------------------------------
// Ausrüstung, Schlüssel, Vorlagen

/** Aussehen mit Überlagerung durch ausgerüstete Kleidung (`ItemDef.wear.look`). */
export function effectiveAppearance(a: PlayerAppearance, overlays: readonly (WearLook | undefined)[] = []): PlayerAppearance {
  let out = a;
  for (const look of overlays) {
    if (!look) continue;
    out = { ...out };
    if (look.top) out.top = look.top;
    if (look.jacket) out.jacket = look.jacket;
    if (look.pants) out.pants = look.pants;
    if (look.shoes) out.shoes = look.shoes;
  }
  return out;
}

/** Stabile Serialisierung (feste Feldreihenfolge) – neu gebacken wird nur, wenn sie sich ändert. */
export function appearanceKey(a: PlayerAppearance, overlays: readonly (WearLook | undefined)[] = []): string {
  const e = effectiveAppearance(a, overlays);
  const bit = (value: boolean) => (value ? '1' : '0');
  return [
    e.v, e.body, e.skin, e.face, e.hair, e.hairColor, e.top, e.jacket, e.pants, e.shoes, e.colorA, e.colorB,
    bit(e.cyber.armL), bit(e.cyber.armR), bit(e.cyber.eyes), bit(e.cyber.facePlate), bit(e.cyber.neckCable), e.cyber.leg, e.cyber.glow,
    e.tattoo, e.acc.glasses, e.acc.mask, bit(e.acc.chain), e.acc.cap, bit(e.acc.headphones),
  ].join('|');
}

/** Aussehen einer Vorlage (alte Look-IDs = Vorlagen-IDs); unbekannt → Neonbomber. */
export function templateAppearance(content: GameContent, look: LookId | undefined): PlayerAppearance {
  const own = look && Object.prototype.hasOwnProperty.call(content.looks, look) ? content.looks[look]?.appearance : undefined;
  const fallback = Object.prototype.hasOwnProperty.call(content.looks, DEFAULT_LOOK_ID) ? content.looks[DEFAULT_LOOK_ID]?.appearance : undefined;
  return cloneAppearance(own ?? fallback ?? DEFAULT_APPEARANCE);
}

/** Vorlagen mit Aussehen in Inhaltsreihenfolge. */
export const appearanceTemplates = (content: GameContent) =>
  Object.values(content.looks).filter((look): look is typeof look & { appearance: PlayerAppearance } => !!look.appearance);

// ---------------------------------------------------------------------------
// Zufall (ausgewogene Gewichte, Schlösser je Kategorie)

/** Kategorien des Editors (Reiter) – zugleich die Schlösser des Zufalls. */
export type AppearanceCategory = 'koerper' | 'haare' | 'oberteil' | 'jacke' | 'hose' | 'schuhe' | 'farben' | 'cyber' | 'extras';
export const APPEARANCE_CATEGORIES: readonly AppearanceCategory[] = ['koerper', 'haare', 'oberteil', 'jacke', 'hose', 'schuhe', 'farben', 'cyber', 'extras'];

export function randomAppearance(
  random: () => number,
  base: PlayerAppearance = DEFAULT_APPEARANCE,
  locks: ReadonlySet<AppearanceCategory> = new Set(),
  available: PartAvailable = () => true,
): PlayerAppearance {
  const pick = <T>(list: readonly T[]): T => list[Math.min(list.length - 1, Math.floor(random() * list.length))];
  const chance = (p: number) => random() < p;
  const usable = <T extends string>(list: readonly T[], part: (id: T) => string | null = (id) => id) =>
    list.filter((id) => { const p = part(id); return p === null || EMPTY_PARTS.has(p) || available(p); });
  const pickPart = <T extends string>(list: readonly T[], fallback: T, part?: (id: T) => string | null): T => {
    const options = usable(list, part);
    return options.length ? pick(options) : fallback;
  };
  const a = cloneAppearance(base);
  if (!locks.has('koerper')) {
    a.body = pick(BODY_IDS);
    a.skin = pick(SKIN_IDS);
    a.face = pickPart(FACE_IDS, 'gesicht-1');
  }
  if (!locks.has('haare')) {
    a.hair = pickPart(HAIR_IDS, 'haar-glatze');
    a.hairColor = chance(0.2) ? pick(['neon-pink', 'neon-cyan', 'neon-violett', 'giftgruen'] as const) : pick(HAIR_COLOR_IDS.slice(0, 10));
  }
  if (!locks.has('oberteil')) a.top = pickPart(TOP_IDS, a.top as typeof TOP_IDS[number]);
  if (!locks.has('jacke')) a.jacket = chance(0.25) ? 'jacke-keine' : pickPart(JACKET_IDS.slice(1), 'jacke-keine');
  if (!locks.has('hose')) a.pants = pickPart(PANTS_IDS, a.pants as typeof PANTS_IDS[number]);
  if (!locks.has('schuhe')) a.shoes = pickPart(SHOE_IDS, a.shoes as typeof SHOE_IDS[number]);
  if (!locks.has('farben')) {
    a.colorA = chance(0.1) ? pick(NEON_IDS) : pick(PALETTE_IDS.slice(0, 16));
    a.colorB = chance(0.5) ? pick(NEON_IDS) : pick(PALETTE_IDS.slice(0, 16).filter((id) => id !== a.colorA));
  }
  if (!locks.has('cyber')) {
    const part = (id: string) => available(id) && chance(0.15);
    a.cyber = {
      armL: part(CYBER_PARTS.armL), armR: part(CYBER_PARTS.armR), eyes: part(CYBER_PARTS.eyes),
      facePlate: part(CYBER_PARTS.facePlate), neckCable: part(CYBER_PARTS.neckCable),
      leg: chance(0.15) ? pickPart<Side | 'keins'>(['links', 'rechts'], 'keins', legPart) : 'keins',
      glow: chance(0.8) ? pick(NEON_IDS) : pick(['rot', 'orange', 'weiss'] as const),
    };
  }
  if (!locks.has('extras')) {
    a.tattoo = chance(0.5) ? 'tattoo-keins' : pickPart(TATTOO_IDS.slice(1), 'tattoo-keins');
    const acc = <T extends string>(list: readonly T[], part: (id: T) => string | null): T =>
      (chance(0.2) ? pickPart(list.slice(1), list[0], part) : list[0]);
    a.acc = {
      glasses: acc(GLASSES_IDS, glassesPart),
      mask: acc(MASK_IDS, maskPart),
      chain: available(CHAIN_PART) && chance(0.2),
      cap: acc(CAP_IDS, capPart),
      headphones: available(HEADPHONES_PART) && chance(0.2),
    };
  }
  return normalize(a);
}

// ---------------------------------------------------------------------------
// Speicherformat: Struktur streng, unbekannte IDs über Aliase oder je Feld durch die Vorlage ersetzt

const isRecord = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
const ID = /^[a-z0-9-]{1,40}$/;

/**
 * Prüft ein gespeichertes Aussehen. Falscher Aufbau (fehlende Felder, falsche Typen) → `error`.
 * Unbekannte IDs werden über PART_ALIASES umbenannt oder durch den Wert aus `fallback` ersetzt (`replaced`).
 */
export function parseAppearance(raw: unknown, fallback: PlayerAppearance): { appearance: PlayerAppearance; replaced: string[] } | { error: string } {
  if (!isRecord(raw) || raw.v !== 1) return { error: 'Ungültiges Aussehen.' };
  const cyberIn = raw.cyber;
  const accIn = raw.acc;
  if (!isRecord(cyberIn) || !isRecord(accIn)) return { error: 'Ungültiges Aussehen.' };
  const replaced: string[] = [];
  const id = <T extends string>(value: unknown, known: readonly T[], fb: T, label: string): T | null => {
    if (typeof value !== 'string' || !ID.test(value)) return null;
    if ((known as readonly string[]).includes(value)) return value as T;
    const alias = PART_ALIASES[value];
    if (alias && (known as readonly string[]).includes(alias)) return alias as T;
    replaced.push(`${label} „${value}“`);
    return fb;
  };
  const flag = (value: unknown): boolean | null => (typeof value === 'boolean' ? value : null);
  const out = {
    v: 1 as const,
    body: id(raw.body, BODY_IDS, fallback.body, 'Körperbau'),
    skin: id(raw.skin, SKIN_IDS, fallback.skin as typeof SKIN_IDS[number], 'Hautton'),
    face: id(raw.face, FACE_IDS, fallback.face as typeof FACE_IDS[number], 'Gesicht'),
    hair: id(raw.hair, HAIR_IDS, fallback.hair as typeof HAIR_IDS[number], 'Frisur'),
    hairColor: id(raw.hairColor, HAIR_COLOR_IDS, fallback.hairColor as typeof HAIR_COLOR_IDS[number], 'Haarfarbe'),
    top: id(raw.top, TOP_IDS, fallback.top as typeof TOP_IDS[number], 'Oberteil'),
    jacket: id(raw.jacket, JACKET_IDS, fallback.jacket as typeof JACKET_IDS[number], 'Jacke'),
    pants: id(raw.pants, PANTS_IDS, fallback.pants as typeof PANTS_IDS[number], 'Hose'),
    shoes: id(raw.shoes, SHOE_IDS, fallback.shoes as typeof SHOE_IDS[number], 'Schuhe'),
    colorA: id(raw.colorA, PALETTE_IDS, fallback.colorA as typeof PALETTE_IDS[number], 'Hauptfarbe'),
    colorB: id(raw.colorB, PALETTE_IDS, fallback.colorB as typeof PALETTE_IDS[number], 'Zweitfarbe'),
    tattoo: id(raw.tattoo, TATTOO_IDS, fallback.tattoo as typeof TATTOO_IDS[number], 'Tattoo'),
  };
  const cyber = {
    armL: flag(cyberIn.armL), armR: flag(cyberIn.armR), eyes: flag(cyberIn.eyes), facePlate: flag(cyberIn.facePlate),
    neckCable: flag(cyberIn.neckCable),
    leg: id(cyberIn.leg, LEG_IDS, fallback.cyber.leg, 'Cyber-Bein'),
    glow: id(cyberIn.glow, PALETTE_IDS, fallback.cyber.glow as typeof PALETTE_IDS[number], 'Leuchtfarbe'),
  };
  const acc = {
    glasses: id(accIn.glasses, GLASSES_IDS, fallback.acc.glasses, 'Brille'),
    mask: id(accIn.mask, MASK_IDS, fallback.acc.mask, 'Maske'),
    chain: flag(accIn.chain),
    cap: id(accIn.cap, CAP_IDS, fallback.acc.cap, 'Kappe'),
    headphones: flag(accIn.headphones),
  };
  if ([...Object.values(out), ...Object.values(cyber), ...Object.values(acc)].some((value) => value === null)) return { error: 'Ungültiges Aussehen.' };
  const { tattoo, ...rest } = out;
  // Feldreihenfolge wie im Vertrag (stabile Serialisierung beim erneuten Speichern).
  const appearance = normalize({ ...rest, cyber, tattoo, acc } as PlayerAppearance);
  return { appearance, replaced };
}
