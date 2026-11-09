// Minispiel-Framework (world.md §3.9): gemeinsame Typen für Registry, Host und die einzelnen Spiele.
import type { AttributeId, Condition, Effect, SfxId } from '../../modules/contracts';

/** Was ein Spiel über die Spielfigur und die Umgebung wissen darf. */
export interface MinigameContext {
  /** Schwierigkeit 1–5 aus dem Effekt `{ minigame, level }`. */
  readonly level: number;
  readonly label?: string;
  /** Effektiver Attributwert (Basis + Cyberware + Kleidung). */
  attr(attribute: AttributeId): number;
  /** Vorteil aus einem Attribut: 0 bei Wert 3, 1 bei Wert 10, gekappt auf 0..1,3. */
  edge(attribute: AttributeId): number;
  /** Bedingung prüfen (Gegenstand, Cyberware, Perk …). */
  has(condition: Condition): boolean;
  /** Welt-Check bestanden möglich (z. B. `gc-151`); fehlende Checks zählen als nicht bestanden. */
  checkOk(check: string): boolean;
  sfx(id: SfxId): void;
  readonly reducedMotion: boolean;
  readonly touch: boolean;
}

export interface CountdownHandle {
  /** Restzeit in Sekunden. */
  left(): number;
  add(seconds: number): void;
  stop(): void;
  /** Erfüllt sich, wenn die Zeit abläuft (nicht nach `stop`). */
  readonly done: Promise<void>;
}

export type PopTone = 'good' | 'bad' | 'info' | 'gold';

/** Laufzeit-Hilfen, die der Host jedem Spiel gibt. Alles räumt sich beim Ende selbst auf. */
export interface MinigameHost {
  /** Spielfläche (position: relative, füllt das Overlay). */
  readonly stage: HTMLElement;
  /** Wird beim Abbruch und nach dem Ende ausgelöst. */
  readonly signal: AbortSignal;
  /** Kopfzeile: Punktestand und Hinweis. */
  setScore(text: string): void;
  setInfo(text: string): void;
  /** Rohtasten (keydown/keyup) während des Spiels; Escape bleibt dem Host. */
  onKey(handler: (event: KeyboardEvent, down: boolean) => void): void;
  /** requestAnimationFrame-Schleife; `dt` in Sekunden (gekappt), Rückgabe `false` beendet sie. */
  frame(step: (dt: number, now: number) => boolean | void): void;
  wait(ms: number): Promise<void>;
  /** Zeitlimit mit Balken in der Kopfzeile. */
  countdown(seconds: number): CountdownHandle;
  /** Kurzer schwebender Text über der Spielfläche (x/y in Prozent). */
  pop(text: string, tone?: PopTone, x?: number, y?: number): void;
  /** Zusätzliche Effekte (z. B. Trinkgeld), werden unabhängig vom Ausgang angewandt. */
  extra(...effects: Effect[]): void;
  /** Zeile für den Ergebnisbildschirm. */
  summary(line: string): void;
}

export interface MinigameDef {
  title: string;
  /** Ein, zwei Sätze Einleitung im Ton der Unterstadt. */
  blurb: string;
  /** Steuerungshinweise (Tastatur / Maus / Touch). */
  controls: string[];
  /** Sichtbare Attribut-Vorteile, z. B. „Technik 7: +16 s“. */
  bonuses?(ctx: MinigameContext): string[];
  /** Spiel ausführen; `true` = gewonnen. Abbruch erledigt der Host. */
  run(host: MinigameHost, ctx: MinigameContext): Promise<boolean>;
}

export interface MinigameResult {
  won: boolean;
  aborted: boolean;
  /** Zusatzeffekte aus dem Spiel (Trinkgeld, verbrauchte Dietrich-Chips). */
  extra: Effect[];
  /** false = keine Darstellung vorhanden, Platzhalter hat entschieden. */
  played: boolean;
}

export const ATTR_LABEL: Record<AttributeId, string> = {
  technik: 'Technik', koerper: 'Körper', reflexe: 'Reflexe', ausstrahlung: 'Ausstrahlung', strasse: 'Straße',
};
