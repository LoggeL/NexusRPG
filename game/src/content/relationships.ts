// TESTINHALT – Geschenkvorlieben und Herz-Ereignisse (design.md §3.3).
// Herz-Ereignisse lösen beim Betreten der Karte zur passenden Tageszeit aus, jedes genau einmal.
import type { GiftPrefs, HeartEventDef, NpcId } from '../modules/contracts';

export const GIFTS: Record<NpcId, GiftPrefs> = {
  raven: { loves: ['neon-messer'], likes: ['#essen'] },
  dante: { loves: ['datenchip'], likes: ['synth-kaffee'], dislikes: ['#waffe'] },
};

export const HEART_EVENTS: Record<NpcId, HeartEventDef[]> = {
  raven: [
    { id: 'test-raven-herz-2', hearts: 2, map: 'test-innen', time: 'abend', dialogue: 'test-raven-herz-2', effects: [{ relation: 'raven', delta: 10 }] },
  ],
  dante: [],
};
