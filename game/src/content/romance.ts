import type { NpcId } from '../modules/contracts';

/** Positivliste: ausdrücklich erwachsene Figuren, die überhaupt romanzierbar sein dürfen (world.md §4.7). */
export const ROMANCE_CANDIDATES: readonly NpcId[] = [
  'hunter', 'raven', 'dante', 'collin-charleston', 'delya-delloraine',
  'kiki-karbon', 'marla-sand', 'lio-funkel', 'alesa-zero',
  'aria', 'vega', 'nyra'
];

export const ROMANCE_ENABLED: ReadonlySet<NpcId> = new Set<NpcId>(['aria', 'hunter', 'dante', 'collin-charleston', 'lio-funkel']);

/** Figuren, die nie romanzierbar sein dürfen (nur Freundschaft). */
export const NEVER_ROMANCE: readonly NpcId[] = ['daria', 'freya', 'jakko', 'mila', 'pim-pinzette', 'jimmy', 'vex-schrapnell'];
