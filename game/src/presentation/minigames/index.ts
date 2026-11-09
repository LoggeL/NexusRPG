// Registry der Minispiele (world.md §3.9). Neue Spiele: Datei unter presentation/minigames/, hier eintragen.
// Aufruf aus Inhalten: Effekt { minigame: 'akt-…', level: 1..5, key?, label?, win: [...], lose: [...] }.
import type { MinigameId, MinigameRequest } from '../../modules/contracts';
import { angeln } from './angeln';
import { armdruecken } from './armdruecken';
import { barschicht } from './barschicht';
import { dachrennen } from './dachrennen';
import { drohnenrennen } from './drohnenrennen';
import { eins } from './eins';
import { fernsehen } from './fernsehen';
import { flohmarkt } from './flohmarkt';
import { floss } from './floss';
import { fotoautomat } from './fotoautomat';
import { fundbuero } from './fundbuero';
import { graffiti } from './graffiti';
import { hacken } from './hacken';
import { runMinigameOverlay, type MinigameEnv } from './host';
import { huetchen } from './huetchen';
import { karaoke } from './karaoke';
import { keksalarm } from './keksalarm';
import { kochen } from './kochen';
import { pixelpalast } from './pixelpalast';
import { schiessstand } from './schiessstand';
import { schloss } from './schloss';
import { sternegucken } from './sternegucken';
import { suppenkueche } from './suppenkueche';
import { tanz } from './tanz';
import { taubenpost } from './taubenpost';
import { ventil } from './ventil';
import { werkbank } from './werkbank';
// Teil 3
import { countdown } from './countdown';
import { etikette } from './etikette';
import { gaertnern } from './gaertnern';
import { hochstapeln } from './hochstapeln';
import { overwatch } from './overwatch';
import { radioRost } from './radio-rost';
import { schleichen } from './schleichen';
import { schrottbotRennen } from './schrottbot-rennen';
import { strandlauf } from './strandlauf';
import { wrackrennen } from './wrackrennen';
import type { MinigameDef, MinigameResult } from './types';

export type { MinigameEnv } from './host';
export type { MinigameContext, MinigameDef, MinigameHost, MinigameResult } from './types';

export const MINIGAMES: Record<MinigameId, MinigameDef> = {
  'akt-hacken': hacken,
  'akt-schloss': schloss,
  'akt-eins': eins,
  'akt-armdruecken': armdruecken,
  'akt-tanz': tanz,
  'akt-karaoke': karaoke,
  'akt-barschicht': barschicht,
  'akt-keksalarm': keksalarm,
  'akt-huetchenspiel': huetchen,
  // Teil 2
  'akt-angeln': angeln,
  'akt-schiessstand': schiessstand,
  'akt-drohnenrennen': drohnenrennen,
  'akt-kochen': kochen,
  'akt-werkbank': werkbank,
  'akt-ventil': ventil,
  'akt-floss': floss,
  'akt-fotoautomat': fotoautomat,
  'akt-graffiti': graffiti,
  'akt-pixelpalast': pixelpalast,
  'akt-flohmarkt': flohmarkt,
  'akt-sternegucken': sternegucken,
  'akt-fundbuero': fundbuero,
  'akt-suppenkueche': suppenkueche,
  'akt-fernsehen': fernsehen,
  'akt-taubenpost': taubenpost,
  // Romanze Vex × Aria (world.md „rom-vexaria-luecke“, Dachrennen Fr/Sa N wiederholbar)
  'akt-dachrennen': dachrennen,
  // Teil 3 (Akt 2/3, Ödnis, Küste)
  'akt-gaertnern': gaertnern,
  'akt-hochstapeln': hochstapeln,
  'akt-radio-rost': radioRost,
  'akt-schrottbot-rennen': schrottbotRennen,
  'akt-strandlauf': strandlauf,
  'akt-wrackrennen': wrackrennen,
  'akt-etikette': etikette,
  'akt-overwatch': overwatch,
  'akt-schleichen': schleichen,
  'akt-countdown': countdown,
};

/** Weitere Spiele zur Laufzeit anmelden (Teil 2 und später). */
export function registerMinigame(id: MinigameId, def: MinigameDef) { MINIGAMES[id] = def; }

export const hasMinigame = (id: MinigameId) => Object.prototype.hasOwnProperty.call(MINIGAMES, id);

/**
 * Minispiel zeigen. Unbekannte IDs: Platzhalter (zählt als gewonnen, Toast).
 * Liefert den Ausgang; Zusatzeffekte (`extra`) wendet der Aufrufer vor `finishMinigame` an.
 */
export async function playMinigame(env: MinigameEnv, request: MinigameRequest): Promise<MinigameResult> {
  if (!hasMinigame(request.id)) {
    env.shell.toast(`Minispiel „${request.label ?? request.id}“ (Platzhalter) – gewonnen`, 'good');
    return { won: true, aborted: false, extra: [], played: false };
  }
  return runMinigameOverlay(env, MINIGAMES[request.id], request);
}
