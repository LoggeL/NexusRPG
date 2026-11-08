// Abschlussstatistik und Epilogauswahl.
import { heartsOf } from '../campaign';
import type { Condition, GameContent, GameState } from '../contracts';

export interface Tally { found: number; total: number }

export interface EndingStats {
  playTimeMs: number;
  /** „12:34“ bzw. „1:02:03“. */
  playTimeText: string;
  days: number;
  quests: Tally;
  places: Tally;
  gallery: Tally;
  /** Summe der Herzen aller Figuren. */
  hearts: number;
  checksPassed: number;
  battlesWon: number;
  level: number;
}

export function formatPlayTime(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor((Number.isFinite(ms) ? ms : 0) / 1000));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const two = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${two(m)}:${two(s)}` : `${m}:${two(s)}`;
}

export function endingStats(content: GameContent, state: Readonly<GameState>): EndingStats {
  const maps = Object.keys(content.maps);
  const quests = Object.values(content.quests).filter(quest => quest.kind !== 'job');
  const pictured = Object.values(content.cutscenes).filter(cut => cut.gallery ?? cut.beats.some(beat => beat.image && beat.image !== 'black'));
  return {
    playTimeMs: state.playTimeMs,
    playTimeText: formatPlayTime(state.playTimeMs),
    days: state.clock.day,
    quests: { found: quests.filter(quest => state.quests[quest.id]?.status === 'done').length, total: quests.length },
    places: { found: new Set(state.visited.filter(map => maps.includes(map))).size, total: maps.length },
    gallery: { found: state.gallery.filter(id => pictured.some(cut => cut.id === id)).length, total: pictured.length },
    hearts: Object.values(state.relations).reduce((sum, rel) => sum + heartsOf(rel.points), 0),
    checksPassed: state.stats.checksPassed,
    battlesWon: state.stats.battlesWon,
    level: state.player.level,
  };
}

/** Epilogzeilen in Inhaltsreihenfolge, deren Bedingung gilt. */
export function epilogueLines(content: GameContent, evaluate: (condition?: Condition) => boolean): string[] {
  return content.ending.epilogue.filter(line => evaluate(line.when)).map(line => line.text);
}
