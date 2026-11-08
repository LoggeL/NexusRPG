// TESTINHALT – Herkünfte, Vorlagen des Charakter-Baukastens und die fertige Spielfigur Vex (design.md §3.1, §3.1a, §3.1b).
import type { CharacterOriginDef } from '../modules/character/types';
import type { GameContent, LookDef, PlayerAppearance } from '../modules/contracts';

export const ORIGINS: Record<string, CharacterOriginDef> = {
  gosse: {
    id: 'gosse', name: 'Gossenkind', description: 'In der Unterstadt groß geworden. Kennt jede Abkürzung.',
    bonus: 'strasse', tag: '[Gosse]', items: { 'synth-kaffee': 2 }, credits: 20, rep: { unterstadt: 10 },
  },
  tueftler: {
    id: 'tueftler', name: 'Tüftler', description: 'Hat schon als Kind Toaster zu Drohnen umgebaut.',
    bonus: 'technik', bonusChoice: ['reflexe'], tag: '[Tüftler]', relations: { dante: 50 },
    checkBonus: [{ tags: ['reparieren'], value: 1 }],
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
 * Fertige Spielfigur Vex Schrapnell (world.md §2.1a, design.md §3.1b). Herkunft laut world.md `gossenkind`;
 * im Testinhalt heißt die Gossenkind-Herkunft noch `gosse`.
 */
export const PRESETS: GameContent['presets'] = {
  vex: {
    id: 'vex',
    name: 'Vex Schrapnell',
    description: 'Kurierfahrerin, Anfang 20, Kopf der Schrapnell-Kuriere. Burschikos, tough, trockener Humor – und loyal bis zur Dummheit.',
    origin: 'gosse',
    attributes: { reflexe: 6, strasse: 5, koerper: 4, technik: 3, ausstrahlung: 3 },
    perks: ['dachlaeuferin'],
    items: { kurierweste: 1, nagelpistole: 1 },
    sprite: 'vex-walk',
    portrait: 'vex',
    worldNpc: 'vex-schrapnell',
  },
};
