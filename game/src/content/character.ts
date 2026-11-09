// Herkünfte (world.md §2.2), Vorlagen des Charakter-Baukastens und die fertige Spielfigur Vex (design.md §3.1, §3.1a, §3.1b).
import type { CharacterOriginDef } from '../modules/character/types';
import type { GameContent, LookDef, PlayerAppearance } from '../modules/contracts';

export const ORIGINS: Record<string, CharacterOriginDef> = {
  'origin-gossenkind': {
    id: 'origin-gossenkind', name: 'Gossenkind',
    description: 'In der Unterstadt groß geworden, zwischen Suppenküche und Kanaldeckel. Kennt jede Abkürzung und jeden Abzieher beim Vornamen.',
    bonus: 'strasse', tag: '[Gosse]', items: { 'dietrich-set': 1, kartendeck: 1 }, credits: 30,
    relations: { daria: 100, freya: 100, jakko: 100, ripper: -100 }, rep: { unterstadt: 10 },
  },
  'origin-oberstadt': {
    id: 'origin-oberstadt', name: 'Oberstadt-Aussteiger',
    description: 'Aufgewachsen hinter Glas und Sicherheitsdienst. Irgendwann reichte es. Die Manieren sind geblieben, das Geld nicht.',
    bonus: 'ausstrahlung', tag: '[Oberstadt]', items: { 'alte-zugangskarte': 1, 'taschenspiegel-gold': 1 }, credits: 120,
    relations: { 'seraphina-chrome': 100, 'serenity-chrome': 100, 'sybella-chrome': 100, 'collin-charleston': 100, aria: -100 },
  },
  'origin-oednis': {
    id: 'origin-oednis', name: 'Aus der Ödnis',
    description: 'Sand in den Stiefeln, Sonne im Nacken. Draußen vor der Mauer lernt man, Wind zu lesen und Wasser zu teilen.',
    bonus: 'koerper', tag: '[Ödnis]', items: { wasserkanister: 1, 'kuestenkarte-fragment': 1, wuestenrose: 1 }, credits: 40,
    relations: { nyra: 100, 'marla-sand': 200, hunter: 100 },
  },
  'origin-ex-wache': {
    id: 'origin-ex-wache', name: 'Ex-Wache',
    description: 'Früher Uniform, heute Jacke. Du kennst die Funkcodes, die Schichtpläne und die Kollegen, die dich jetzt Verräter nennen.',
    bonus: 'reflexe', tag: '[Ex-Wache]', items: { 'alte-dienstmarke': 1, schockstab: 1 }, credits: 60,
    relations: { wache: 200, richter: 100, 'xion-venom': -100 },
  },
  'origin-schrott': {
    id: 'origin-schrott', name: 'Schrottkind',
    description: 'Großgezogen zwischen Lötdampf und Altmetall. Wenn es brummt, kannst du es reparieren. Wenn nicht, bringst du es zum Brummen.',
    bonus: 'technik', tag: '[Schrott]', items: { 'werkzeuggurt-rostig': 1, 'loetkolben-alt': 1 }, credits: 50,
    relations: { 'opa-gustav': 200, dante: 100, bolzen: 100 },
  },
  'origin-knastvogel': {
    id: 'origin-knastvogel', name: 'Knastvogel',
    description: 'Gerade raus. Der erste Morgen draußen schmeckt nach Rost, und die Leute riechen, wo du warst.',
    bonus: 'strasse', bonusChoice: ['koerper'], tag: '[Knast]', items: { 'knast-loeffel': 1, entlassungsschein: 1 }, credits: 10,
    relations: { raven: 200, wache: 100, richter: -100 },
  },
};

type Cyber = PlayerAppearance['cyber'];
type Acc = PlayerAppearance['acc'];
const NO_CYBER: Cyber = { armL: false, armR: false, eyes: false, facePlate: false, neckCable: false, leg: 'keins', glow: 'neon-cyan' };
const NO_ACC: Acc = { glasses: 'keine', mask: 'keine', chain: false, cap: 'keine', headphones: false };

/** Vorlage des Charakter-Baukastens (world.md §2.3): Laufblatt ist die gebackene Textur, kein Porträt. */
function template(
  id: string, name: string,
  base: Omit<PlayerAppearance, 'v' | 'cyber' | 'acc'>, cyber: Partial<Cyber> = {}, acc: Partial<Acc> = {},
): LookDef {
  const { tattoo, ...rest } = base;
  return {
    id, name, sprite: 'player-walk', portrait: '',
    appearance: { v: 1, ...rest, cyber: { ...NO_CYBER, ...cyber }, tattoo, acc: { ...NO_ACC, ...acc } },
  };
}

/** Die früheren 6 festen Looks sind Vorlagen (gleiche IDs, damit alte Spielstände migrieren), dazu zwei neue. */
export const LOOKS: Record<string, LookDef> = Object.fromEntries([
  template('look-neonbomber', 'Neonbomber', {
    body: 'mittel', skin: 'haut-3', face: 'gesicht-1', hair: 'haar-sidecut', hairColor: 'schwarz',
    top: 'oben-tshirt', jacket: 'jacke-bomber', pants: 'hose-cargo', shoes: 'schuhe-sneaker', colorA: 'schwarz', colorB: 'neon-pink', tattoo: 'tattoo-keins',
  }, { eyes: true, glow: 'neon-cyan' }),
  template('look-staubmantel', 'Staubmantel', {
    body: 'kraeftig', skin: 'haut-5', face: 'gesicht-4', hair: 'haar-wuschel', hairColor: 'dunkelblond',
    top: 'oben-hemd', jacket: 'jacke-langmantel', pants: 'hose-cargo', shoes: 'schuhe-kampfstiefel', colorA: 'sand', colorB: 'leder', tattoo: 'tattoo-keins',
  }, {}, { glasses: 'rund' }),
  template('look-schrottoverall', 'Schrottoverall', {
    body: 'mittel', skin: 'haut-4', face: 'gesicht-3', hair: 'haar-dutt', hairColor: 'kupfer',
    top: 'oben-tanktop', jacket: 'jacke-keine', pants: 'hose-overall', shoes: 'schuhe-kampfstiefel', colorA: 'orange', colorB: 'anthrazit', tattoo: 'tattoo-arm',
  }, { armR: true, glow: 'orange' }),
  template('look-samtsakko', 'Samtsakko', {
    body: 'schmal', skin: 'haut-2', face: 'gesicht-6', hair: 'haar-schulterlang', hairColor: 'platin',
    top: 'oben-rollkragen', jacket: 'jacke-sakko', pants: 'hose-anzug', shoes: 'schuhe-halbschuhe', colorA: 'wein', colorB: 'schwarz', tattoo: 'tattoo-keins',
  }, {}, { chain: true }),
  template('look-kapuzenschatten', 'Kapuzenschatten', {
    body: 'schmal', skin: 'haut-6', face: 'gesicht-2', hair: 'haar-buzz', hairColor: 'schwarz',
    top: 'oben-hoodie', jacket: 'jacke-kapuze', pants: 'hose-leder', shoes: 'schuhe-hightops', colorA: 'anthrazit', colorB: 'neon-violett', tattoo: 'tattoo-keins',
  }, { eyes: true, glow: 'neon-violett' }, { mask: 'tuch' }),
  template('look-flickenjeans', 'Flickenjeans', {
    body: 'mittel', skin: 'haut-1', face: 'gesicht-3', hair: 'haar-locken-kurz', hairColor: 'rot',
    top: 'oben-streifenpulli', jacket: 'jacke-jeans', pants: 'hose-flicken', shoes: 'schuhe-sneaker', colorA: 'jeansblau', colorB: 'senf', tattoo: 'tattoo-keins',
  }, {}, { cap: 'muetze', headphones: true }),
  template('look-kabelkrone', 'Kabelkrone', {
    body: 'schmal', skin: 'haut-7', face: 'gesicht-1', hair: 'haar-zwei-zoepfe', hairColor: 'neon-pink',
    top: 'oben-netzshirt', jacket: 'jacke-leder', pants: 'hose-rock', shoes: 'schuhe-plateau', colorA: 'schwarz', colorB: 'neon-pink', tattoo: 'tattoo-neonlinien',
  }, { neckCable: true, facePlate: true, glow: 'neon-pink' }),
  template('look-hafenkoloss', 'Hafenkoloss', {
    body: 'kraeftig', skin: 'haut-8', face: 'gesicht-5', hair: 'haar-glatze', hairColor: 'schwarz',
    top: 'oben-gurtshirt', jacket: 'jacke-weste', pants: 'hose-cargo', shoes: 'schuhe-kampfstiefel', colorA: 'oliv', colorB: 'chrom', tattoo: 'tattoo-hals',
  }, { armL: true, leg: 'rechts', glow: 'neon-cyan' }, { cap: 'basecap' }),
].map((look) => [look.id, look]));

/**
 * Fertige Spielfigur Vex Schrapnell (world.md §2.1a, design.md §3.1b). Herkunft `origin-gossenkind`.
 */
export const PRESETS: GameContent['presets'] = {
  vex: {
    id: 'vex',
    name: 'Vex Schrapnell',
    description: 'Kurierfahrerin, Anfang 20, Kopf der Schrapnell-Kuriere. Burschikos, tough, trockener Humor – und loyal bis zur Dummheit.',
    origin: 'origin-gossenkind',
    attributes: { reflexe: 6, strasse: 5, koerper: 4, technik: 3, ausstrahlung: 3 },
    perks: ['dachlaeuferin'],
    items: { kurierweste: 1, nagelpistole: 1 },
    sprite: 'vex-walk',
    portrait: 'vex',
    worldNpc: 'vex-schrapnell',
  },
};
