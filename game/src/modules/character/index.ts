// Reine Regeln der Spielfigur (design.md §3.1, world.md §2): Attribute, Erstellung, Stufen/XP, LP und abgeleitete
// Werte, Perks mit passiven Wirkungen, Cyberware. Keine Zustandsänderung – die Kampagne (campaign/domains/character.ts)
// wendet die Ergebnisse auf ihren Entwurf an. Darstellung und andere Bereiche dürfen alles hier direkt lesen.
export * from './types';
export * from './progression';
export * from './attributes';
export * from './perks';
export * from './cyberware';
export * from './derived';
export * from './sheet';
export { findCharacterProblems, type CharacterLint } from './lint';
export {
  ATTRIBUTE_IDS, ATTRIBUTE_LABELS, ATTR_FREE_POINTS, ATTR_MAX, ATTR_MIN, ATTR_START, CYBER_SLOTS, EQUIP_SLOTS, LEVEL_MAX,
  NAME_MAX, NAME_MIN,
} from '../campaign/ids';
