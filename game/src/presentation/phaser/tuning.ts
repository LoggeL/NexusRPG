// Stellschrauben der Erkundung (Bereich explore-presentation), ohne Phaser-Abhängigkeit testbar.
// Alle Werte in Kartenpixeln einer 1536×1024-Karte bzw. Millisekunden Echtzeit.

/** Laufgeschwindigkeit der Spielfigur je Sekunde. */
export const SPEED = 170;
/** Standard-Interaktionsradius von Hotspots und Bett (HotspotDef.radius). */
export const DEFAULT_RADIUS = 56;
/** Standard-Auslöseradius sichtbarer Gegnergruppen (MapEncounterDef.radius). */
export const ENCOUNTER_RADIUS = 48;
/** Ansprechradius von Figuren. */
export const NPC_RADIUS = 60;
/** Pfadlänge zwischen zwei Crewmitgliedern (Figuren sind ~40–50 px breit). */
export const FOLLOWER_SPACING = 54;
/** Echtzeit je Spielminute beim Erkunden (design.md: 1 min je 0,7 s). */
export const MS_PER_GAME_MINUTE = 700;
/** Laufgeschwindigkeit patrouillierender Figuren je Sekunde. */
export const PATROL_SPEED = 60;
/** Standard-Laufblatt der Spielfigur, solange das gewählte Aussehen keines nennt. */
export const DEFAULT_PLAYER_SPRITE = 'player-walk';
/** Laufblatt für Gegnergruppen ohne eigenes `sprite`. */
export const DEFAULT_ENEMY_SPRITE = 'gegner-walk';
/** Wartezeit patrouillierender Figuren an jedem Wegpunkt (ms). */
export const PATROL_PAUSE = 1200;
/** Lauftempo von Figuren, die nach Tagesablauf den Ort wechseln (je Sekunde). */
export const NPC_WALK_SPEED = 85;
/** Weggehende Figuren verschwinden spätestens nach dieser Zeit (ms), auch wenn der Weg versperrt ist. */
export const NPC_LEAVE_TIMEOUT = 15000;
/** Verweilen eines Passanten an einem Routen-Wegpunkt (ms, zufällig bis zum Doppelten). */
export const PASSERBY_PAUSE = 1500;
/** Hysterese der Blickrichtung (0..1): verhindert Blatt-Flackern beim Diagonallaufen. */
export const FACING_HYSTERESIS = 0.3;
/** Deckkraft eines Vordergrund-Verdeckers, solange die Spielfigur dahinter steht. */
export const OCCLUDER_ALPHA = 0.45;
/** Klickziel-Ring: Radius in Kartenpixeln. */
export const CLICK_MARKER_RADIUS = 14;
