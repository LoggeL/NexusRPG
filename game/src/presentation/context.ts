import type { AudioPort, CampaignPort, DialogueSession, GameContent } from '../modules/contracts';
import type { EndingStats as ModuleEndingStats } from '../modules/ending';
import type { AssetCatalog } from '../platform/assets/manifest';
import type { InputRouter } from '../platform/input/router';
import type { SettingsStore } from '../platform/settings';

/** Abschlussstatistik aus modules/ending plus die passenden Epilogzeilen. */
export interface EndingStats extends ModuleEndingStats {
  epilogue: string[];
}

/** Alles, was die Darstellung von außen braucht. Wird in app/ zusammengesetzt. */
export interface GameContext {
  campaign: CampaignPort;
  content: GameContent;
  audio: AudioPort;
  settings: SettingsStore;
  input: InputRouter;
  catalog: AssetCatalog;
  createDialogue(dialogueId: string): DialogueSession;
  saves: {
    /** Gültiger, bereits vorhandener Spielstand (vor dem Spielbeginn). */
    existing(): string | null;
    /** Ab jetzt darf die Kampagne automatisch speichern. */
    begin(): void;
  };
  /** Statistik aus modules/ending (in app/ zusammengesetzt). */
  endingStats?: () => EndingStats | null;
  debug: boolean;
  /** Meldungen über fehlende Module (für Boot-Hinweise). */
  warnings: string[];
}
