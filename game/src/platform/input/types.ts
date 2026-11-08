export type NavDirection = 'up' | 'down' | 'left' | 'right';

/** Typisierte Absichten – Szenen und Oberflächen reagieren nur hierauf, nie auf rohe Tasten. */
export type Intent =
  | { type: 'interact' }          // E, Leertaste, Enter, Aktionsknopf
  | { type: 'cancel' }            // Esc, Zurück-Knopf
  | { type: 'inventory' }         // I
  | { type: 'character' }         // C: Attribute, Perks, Cyberware
  | { type: 'quests' }            // Q: Questlog
  | { type: 'relations' }         // R: Beziehungen
  | { type: 'phone' }             // P: Telefon und Nachrichten
  | { type: 'map' }               // M
  | { type: 'menu' }              // Menü-Knopf
  | { type: 'nav'; dir: NavDirection } // Pfeile/WASD in Menüs
  | { type: 'digit'; value: number }   // 1–9 für Auswahlen
  | { type: 'debugCollision' }    // F1
  | { type: 'debugMenu' };        // F2

export type IntentType = Intent['type'];
export type InputSource = 'keyboard' | 'touch' | 'pointer' | 'test';

export interface IntentEvent {
  intent: Intent;
  source: InputSource;
  repeat: boolean;
}

/** true = verbraucht. Ein modaler Layer verbraucht implizit alles. */
export type IntentHandler = (event: IntentEvent) => boolean | void;

export interface LayerOptions {
  /** Modale Layer blockieren Bewegung und alle Layer darunter. */
  modal?: boolean;
}

export interface MoveVector { x: number; y: number }
