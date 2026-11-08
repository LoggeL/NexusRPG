// Anzeigenamen und Porträtschlüssel (Manifest 'portrait-…').
import type { GameContent, GameState, SpeakerId } from '../contracts';
import { flagSet } from './domains/core';
import { UNKNOWN_NAME, has } from './ids';

export function displayName(content: GameContent, state: Readonly<GameState>, speaker: SpeakerId): string {
  if (speaker === 'narrator') return '';
  if (speaker === 'player') return state.player.name;
  const npc = has(content.npcs, speaker) ? content.npcs[speaker] : undefined;
  if (!npc) return UNKNOWN_NAME;
  if (npc.knownFlag && !flagSet(state, npc.knownFlag)) return npc.unknownName || UNKNOWN_NAME;
  return npc.name;
}

export const portraitKeyOf = (portrait: string): string =>
  portrait.startsWith('portrait-') ? portrait : `portrait-${portrait}`;

/** Porträt eines Sprechers; Variante über NpcDef.portraits oder als Suffix '<porträt>-<variante>'. */
export function portraitKey(content: GameContent, state: Readonly<GameState>, speaker: SpeakerId, variant?: string): string | null {
  if (speaker === 'narrator') return null;
  if (speaker === 'player') {
    // Ich-Perspektive (design.md §3.1a): kein Porträt; nur die fertige Figur (Vex) hat eines.
    const preset = state.player.preset ? content.presets?.[state.player.preset] : undefined;
    if (preset) return portraitKeyOf(preset.portrait);
    const look = has(content.looks, state.player.look) ? content.looks[state.player.look] : undefined;
    return look?.portrait ? portraitKeyOf(look.portrait) : null;
  }
  const npc = has(content.npcs, speaker) ? content.npcs[speaker] : undefined;
  if (!npc) return variant ? portraitKeyOf(variant) : null;
  if (variant) {
    if (npc.portraits && has(npc.portraits, variant)) return portraitKeyOf(npc.portraits[variant]);
    if (variant.startsWith('portrait-') || variant.startsWith(`${npc.portrait}-`)) return portraitKeyOf(variant);
    return portraitKeyOf(`${npc.portrait}-${variant}`);
  }
  return portraitKeyOf(npc.portrait);
}

/** `{name}` in Texten durch den Namen der Spielfigur ersetzen. */
export const fillName = (text: string, name: string): string => text.replace(/\{name\}/g, name);
