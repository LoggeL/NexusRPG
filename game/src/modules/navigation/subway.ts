// U-Bahn-Reisezeit (world.md §3.3; side-uebliche-verspaetung): Standard 30 Minuten je Fahrt. Wer die Verspätung
// aufgeklärt hat (Flag `ubahn_puenktlich`), fährt pünktlich und braucht nur noch 15 Minuten.
// Zuständig: Bereich Wirtschaft (Reisezeit); gebucht wird die Zeit in campaign/index.ts (fastTravel).
import type { GameState } from '../contracts';

export const SUBWAY_RIDE_MINUTES = 30;
export const SUBWAY_PUNCTUAL_MINUTES = 15;
/** Belohnung aus side-uebliche-verspaetung. */
export const SUBWAY_PUNCTUAL_FLAG = 'ubahn_puenktlich';

/** Minuten einer U-Bahn-Fahrt für diesen Spielstand. */
export const subwayMinutes = (state: Readonly<Pick<GameState, 'flags'>>): number =>
  state.flags[SUBWAY_PUNCTUAL_FLAG] === true ? SUBWAY_PUNCTUAL_MINUTES : SUBWAY_RIDE_MINUTES;
