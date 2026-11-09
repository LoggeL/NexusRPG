// Gemeinsame Verträge zwischen Regeln (modules/), Inhalten (content/), Plattform und Darstellung.
// Grundlage: docs/design.md §3–§6. Erweitern ist erlaubt, bestehende Felder werden nicht umgedeutet.
//
// Leitlinien
// - Alle IDs sind Strings; welche es gibt, bestimmen die Inhalte (content/). Die Regeln kennen keine konkreten Figuren.
// - Bedingungen und Effekte sind über `ConditionMap` bzw. `EffectMap` definiert: Jede Variante hat genau einen
//   Unterscheidungsschlüssel (z. B. `hearts` in `{ hearts: 'raven', min: 4 }`). Wer eine Variante ergänzt, ergänzt
//   die Map – der Compiler verlangt dann einen Handler in modules/campaign (siehe docs/engine-notes.md).
// - Kartenkoordinaten sind Kartenpixel (`MapDef.size`), Kampfkoordinaten sind Rasterzellen (`Cell`).
// - Ansichten, die ein Fachmodul berechnet (Beziehungsansicht, Händleransicht …), werden hier nur per `import type`
//   eingebunden: Das Modul bleibt die einzige Quelle der Form, die Fassade reicht sie durch.

import type { CharacterSheet, PerkStatus } from './character';
import type { JobBoardDef, JobBoardView } from './jobs';
import type { NewsBulletin, NewsFilter } from './news';
import type { QuestMarker } from './quests';
import type { RelationView } from './relationships';
import type { FactionStanding, RepTierId } from './reputation';
import type { ShopView } from './economy';
import type { CollapseNote, ShelterDef } from './time/collapse';
import type { Whereabouts } from './time/schedule';

// ---------------------------------------------------------------------------
// Kennungen

export type MapId = string;
export type NpcId = string;
export type ItemId = string;
export type QuestId = string;
export type DialogueId = string;
export type CutsceneId = string;
export type CheckId = string;
export type PerkId = string;
export type CyberwareId = string;
export type ShopId = string;
export type JobTemplateId = string;
export type EncounterId = string;
export type ArenaId = string;
export type EnemyId = string;
export type AbilityId = string;
export type FactionId = string;
export type OriginId = string;
export type LookId = string;
export type DistrictId = string;
export type StationId = string;
export type NewsId = string;
export type PhoneMessageId = string;
export type HeartEventId = string;
/** Name einer Auftragstafel (z. B. 'high-voltage'), an der Vorlagen angeboten werden. */
export type JobBoardId = string;
/** Minispiel (world.md §3.9), z. B. 'hacken', 'schloss', 'eins', 'armdruecken'. */
export type MinigameId = string;

/** Sprecher einer Dialogzeile: benannte Figur, die Spielfigur oder der Erzähler. */
export type SpeakerId = NpcId | 'player' | 'narrator';

export type AttributeId = 'technik' | 'koerper' | 'reflexe' | 'ausstrahlung' | 'strasse';
export type TimeSlot = 'morgen' | 'tag' | 'abend' | 'nacht';
/** Wochentage; Spieltag 1 ist ein Montag. */
export type Weekday = 'mo' | 'di' | 'mi' | 'do' | 'fr' | 'sa' | 'so';
export type Facing = 's' | 'w' | 'e' | 'n';
/** Hauptstrang in drei Akten (Flags `act1` … `act3`). */
export type ActId = 1 | 2 | 3;

export type Point = readonly [x: number, y: number];
export type Polygon = readonly Point[];
/** x, y, Breite, Höhe in Kartenpixeln. */
export type Rect = readonly [x: number, y: number, w: number, h: number];
/** Kampfraster: Spalte 0..11, Zeile 0..7. */
export type Cell = readonly [col: number, row: number];

// ---------------------------------------------------------------------------
// Bedingungen (Dialoge, Hotspots, Ausgänge, Quests, Tagesabläufe, Händler …)

export type QuestStatus = 'inactive' | 'active' | 'done' | 'failed';

/** Alle Bedingungsvarianten, je Unterscheidungsschlüssel. Fehlende Bedingung = erfüllt. */
export interface ConditionMap {
  // Welt und Fortschritt
  flag: { flag: string };
  notFlag: { notFlag: string };
  /** Gegenstand im Inventar (Standard mindestens 1). */
  item: { item: ItemId; min?: number };
  noItem: { noItem: ItemId };
  /** Aktueller Akt ≥ act. */
  act: { act: ActId };
  visited: { visited: MapId };
  /** Ereignis/Cutscene/Hotspot wurde gesehen (`GameState.seen`). */
  seen: { seen: string };
  /** U-Bahn-Station ist freigeschaltet. */
  station: { station: StationId };
  all: { all: Condition[] };
  any: { any: Condition[] };
  not: { not: Condition };
  // Spielfigur
  /** Effektiver Attributwert (Basis + Cyberware + Ausrüstung) ≥ min. Situative Check-Boni zählen nicht. */
  attr: { attr: AttributeId; min: number };
  origin: { origin: OriginId };
  level: { level: number };
  perk: { perk: PerkId };
  cyberware: { cyberware: CyberwareId };
  /** Fertige Spielfigur gewählt (design.md §3.1b), z. B. `{ playerIs: 'vex' }` für eigene Antwortvarianten. */
  playerIs: { playerIs: PlayerPresetId };
  // Beziehungen und Crew
  /** Mindestens `min` Herzen (0–10). */
  hearts: { hearts: NpcId; min: number };
  /** Rivalität (Punkte < −200), optional ab Stufe `min` (2–10, Standard 2). */
  rival: { rival: NpcId; min?: number };
  /** Figur wurde bereits angesprochen. */
  met: { met: NpcId };
  /** Romanze möglich: Figur in `GameContent.romance`, `romanceable`, kein Kind und ≥ 8 Herzen. */
  romance: { romance: NpcId };
  /** Romanze freigeschaltet (Schalter + `romanceable` + kein Kind), Herzen egal – z. B. Flirtzeilen ab ♥6 mit `hearts`. */
  romanceEnabled: { romanceEnabled: NpcId };
  /** Figur ist aktiv in der Party. */
  companion: { companion: NpcId };
  /** Figur wurde rekrutiert (aktiv oder in Reserve). */
  recruited: { recruited: NpcId };
  // Zeit
  time: { time: TimeSlot | readonly TimeSlot[] };
  weekday: { weekday: Weekday | readonly Weekday[] };
  /** Spieltag ≥ n. */
  dayAtLeast: { dayAtLeast: number };
  /** Uhrzeit in Minuten seit 0:00 des Spieltags, `from` ≤ jetzt < `to` (06:00 = 360, 02:00 = 1560). */
  clockBetween: { clockBetween: readonly [from: number, to: number] };
  // Quests, Aufträge, Kampf
  quest: { quest: QuestId; state: QuestStatus | readonly QuestStatus[] };
  /** Questschritt wurde erledigt. */
  questStep: { questStep: QuestId; step: string };
  /** Ein Auftrag dieser Vorlage ist angenommen und offen. */
  job: { job: JobTemplateId };
  /** Begegnung wurde gewonnen. */
  won: { won: EncounterId };
  // Wirtschaft
  rep: { rep: FactionId; min: number };
  /** Rufstufe bei der Fraktion mindestens `min` (Reihenfolge Verhasst … Verehrt, world.md §10.2). */
  repTier: { repTier: FactionId; min: RepTierId };
  credits: { credits: number };
  /** Minispiel mit diesem Schlüssel wurde mindestens einmal gewonnen (`minigame.key`, sonst die Minispiel-ID). */
  wonMinigame: { wonMinigame: string };
  // Kalender
  /** Tag im 28-Tage-Festkalender (1..28, world.md §3.4). */
  cycleDay: { cycleDay: number | readonly number[] };
  /**
   * Mindestens `min` Stück aus allen Gegenständen, deren ID mit `itemsOf` beginnt (Sammelreihen: 'jimmy-spur-',
   * 'glueckstern'). `distinct: true` zählt verschiedene IDs statt Stückzahl.
   */
  itemsOf: { itemsOf: string; min: number; distinct?: boolean };
  /** Mindestens `min` der Bedingungen sind erfüllt („4 von 8 Spuren“). */
  atLeast: { atLeast: readonly Condition[]; min: number };
}
export type ConditionKey = keyof ConditionMap;
export type Condition = { [K in ConditionKey]: ConditionMap[K] }[ConditionKey];

// ---------------------------------------------------------------------------
// Effekte (transaktional: wird ein Effekt abgelehnt, ändert die ganze Liste nichts)

export interface EffectMap {
  // Welt und Ablauf
  setFlag: { setFlag: string; value?: boolean };
  give: { give: ItemId; qty?: number };
  /** Abgelehnt, wenn nicht genug vorhanden. */
  take: { take: ItemId; qty?: number };
  markSeen: { markSeen: string };
  /** Kurze Meldung als Toast. */
  message: { message: string };
  setAct: { setAct: ActId };
  cutscene: { cutscene: CutsceneId };
  dialogue: { dialogue: DialogueId };
  /** `minutes`: Reisezeit statt der Standard-10-Minuten eines Kartenwechsels (U-Bahn bucht vorher selbst, daher 0). */
  travel: { travel: MapId; entry?: string; minutes?: number };
  sfx: { sfx: SfxId };
  ending: { ending: true };
  unlockStation: { unlockStation: StationId };
  /** Sendung freischalten und anzeigen. */
  news: { news: NewsId };
  /** Telefonnachricht zustellen. */
  phone: { phone: PhoneMessageId };
  /** Stadtkarte/U-Bahn öffnen (U-Bahn-Zugänge der Zonen). */
  cityMap: { cityMap: true };
  /**
   * Fahndung (world.md §10.3) ändern, Stufe 0–3. Abgebildet auf die Flags `fahndung_1` … `fahndung_3`
   * (`{ flag: 'fahndung_2' }` heißt „Fahndung ≥ 2“).
   */
  wanted: { wanted: number };
  // Spielfigur
  xp: { xp: number };
  /** Heilt die Spielfigur (Zahl oder voll). */
  heal: { heal: number | 'full' };
  /** Schaden an der Spielfigur, nie unter 1 LP. */
  damage: { damage: number };
  /** Perk ohne Perkpunkt (Belohnung, Herz-Ereignis). */
  grantPerk: { grantPerk: PerkId };
  /** Basisattribut dauerhaft ändern (Training, Debug); bleibt in 1..10. */
  trainAttribute: { trainAttribute: AttributeId; delta: number };
  /** Baut Cyberware ein (verbraucht den passenden Gegenstand, falls vorhanden); altes Teil kommt ins Inventar. */
  installCyberware: { installCyberware: CyberwareId };
  /** Baut das Teil dieses Platzes aus (Gegenstand ins Inventar); Einzelstücke ohne Gegenstand bleiben drin. */
  removeCyberware: { removeCyberware: CyberSlot };
  /** Vorübergehender Check-Bonus („+1 auf den nächsten Ausstrahlung-Check“), verbraucht beim nächsten passenden Bestehen. */
  checkBuff: { checkBuff: CheckBuff };
  // Beziehungen und Crew
  relation: { relation: NpcId; delta: number };
  /** Versöhnung: Rivalität und negative Punkte auf 0 (world.md §4.1). */
  reconcile: { reconcile: NpcId };
  /** In die Crew aufnehmen (nur wenn CompanionDef.recruit erfüllt ist) und bei freiem Platz in die Party. */
  recruit: { recruit: NpcId };
  dismiss: { dismiss: NpcId };
  // Zeit
  advanceTime: { advanceTime: number };
  sleep: { sleep: true };
  // Quests und Aufträge
  startQuest: { startQuest: QuestId };
  completeQuest: { completeQuest: QuestId };
  failQuest: { failQuest: QuestId };
  questStep: { questStep: QuestId; step: string };
  /** Auftragstafel öffnen. */
  jobBoard: { jobBoard: JobBoardId };
  /** Offenen Auftrag dieser Vorlage abschließen (Belohnung). */
  completeJob: { completeJob: JobTemplateId };
  /** Offenen Auftrag dieser Vorlage scheitern lassen (Paket zurück, Rufverlust bei der Tafel-Fraktion). */
  failJob: { failJob: JobTemplateId };
  // Wirtschaft und Kampf
  /** Credits ändern; negative Beträge werden abgelehnt, wenn das Guthaben nicht reicht. */
  credits: { credits: number };
  rep: { rep: FactionId; delta: number };
  shop: { shop: ShopId };
  /**
   * Kampf starten. `win`/`lose`/`flee` laufen nach dem Kampf (nach onWin/onLose der Begegnung), z. B. ein
   * Folgedialog. `stay`: Niederlage ohne Heimweg ins Unterschlupf (halbe LP, man bleibt auf der Karte).
   */
  battle: { battle: EncounterId } & BattleFollowUp;
  /**
   * Minispiel starten (Darstellung zeigt es, `CampaignPort.finishMinigame` rechnet ab).
   * `level` 1–5 (Standard 2), `key` für `wonMinigame` (Standard: Minispiel-ID), `win`/`lose` danach.
   */
  minigame: { minigame: MinigameId; level?: number; key?: string; win?: Effect[]; lose?: Effect[]; label?: string };
}
export type EffectKey = keyof EffectMap;
export type Effect = { [K in EffectKey]: EffectMap[K] }[EffectKey];

export type SfxId =
  | 'step' | 'pickup' | 'success' | 'fail' | 'door' | 'talk' | 'hurt' | 'heal' | 'shot' | 'alarm' | 'engine'
  | 'switch' | 'page' | 'hack' | 'hit' | 'heart-up' | 'heart-down' | 'coin' | 'phone' | 'levelup' | 'cookie';

// ---------------------------------------------------------------------------
// Anfragen an die Darstellung (Ergebnis von Effekten)

export interface RequestMap {
  cutscene: { cutscene: CutsceneId };
  dialogue: { dialogue: DialogueId };
  /** `minutes`: Reisezeit statt der Standard-10-Minuten eines Kartenwechsels (U-Bahn bucht vorher selbst, daher 0). */
  travel: { travel: MapId; entry?: string; minutes?: number };
  sfx: { sfx: SfxId };
  ending: { ending: true };
  battle: { battle: EncounterId } & BattleFollowUp;
  minigame: { minigame: MinigameRequest };
  shop: { shop: ShopId };
  jobBoard: { jobBoard: JobBoardId };
  news: { news: NewsId };
  phone: { phone: PhoneMessageId };
  /** Stadtkarte (U-Bahn) öffnen. */
  cityMap: { cityMap: true };
  /** Schlafen bzw. Zusammenbruch: Abblende, neuer Tag. */
  sleep: { sleep: 'bed' | 'collapse' };
}
/** Nachlauf eines Kampfes aus dem Effekt `battle` (die Darstellung gibt ihn an `finishBattle` weiter). */
export interface BattleFollowUp { win?: Effect[]; lose?: Effect[]; flee?: Effect[]; stay?: boolean }
/** Laufendes Minispiel: die Darstellung gibt es unverändert an `finishMinigame` zurück. */
export interface MinigameRequest { id: MinigameId; level: number; key: string; label?: string; win: Effect[]; lose: Effect[] }
export type RequestKey = keyof RequestMap;
export type Request = { [K in RequestKey]: RequestMap[K] }[RequestKey];

export interface EffectOutcome {
  requests: Request[];
  /** Kurze Meldungen für Toasts: „Erhalten: Synth-Kaffee“, „Raven ♥ +45“. */
  messages: string[];
}

/** Ergebnis einer Aktion über die Fassade (Kauf, Perk lernen …). */
export interface CampaignResult {
  ok: boolean;
  /** Bei Ablehnung der Grund, sonst eine kurze Erfolgsmeldung. */
  message: string;
  outcome: EffectOutcome;
}

// ---------------------------------------------------------------------------
// Checks ohne Würfel: Wert = Attribut + Boni, bestanden bei Wert ≥ Schwelle (design.md §3.2)

/** Situativer Bonus eines Checks, z. B. Beziehung oder Herkunft. */
export interface CheckBonusDef { when: Condition; value: number; label: string }

/** Bonusregel für Perks, Cyberware und Gegenstände: gilt für Checks mit passendem Attribut und/oder Stichwort. */
export interface CheckBonusRule {
  attribute?: AttributeId;
  /** Mindestens eines der Stichwörter muss in `CheckDef.tags` stehen (z. B. 'hacken', 'schloss', 'einschuechtern'). */
  tags?: readonly string[];
  value: number;
  // Kontext (alle angegebenen Einschränkungen müssen gelten)
  /** Zusätzliche Bedingung gegen den Spielzustand (Tageszeit, Flag, Akt …). */
  when?: Condition;
  /** Nur, solange die Spielfigur auf einer dieser Karten steht. */
  maps?: readonly MapId[];
  /** Nur, solange die Spielfigur in einem dieser Bezirke steht („+1 Ausstrahlung in der Unterstadt“). */
  districts?: readonly DistrictId[];
  /** Nur für Checks dieser Fraktionen (`CheckDef.faction`). */
  factions?: readonly FactionId[];
  /** Abweichender Anzeigetext in der Aufschlüsselung (Standard: Name der Quelle). */
  label?: string;
}

/**
 * Check gilt ohne Rechnung als bestanden („Verklemmte Türen ohne Check öffnen, Schwelle bis 6“).
 * Greift nur, wenn Attribut/Stichwörter passen und die Grundschwelle ≤ `maxThreshold` ist.
 */
export interface AutoPassRule {
  attribute?: AttributeId;
  tags?: readonly string[];
  /** Höchste Grundschwelle, die automatisch bestanden wird (3–10). */
  maxThreshold: number;
  when?: Condition;
}

/** Ein anderes Attribut zählt für den Check („Ausstrahlung zählt auch für Körper-Checks bei Schulden“). */
export interface SubstituteRule {
  /** Attribut, das stattdessen zählen darf. */
  use: AttributeId;
  /** Nur für Checks dieses Attributs (ohne Angabe: jedes). */
  for?: AttributeId;
  tags?: readonly string[];
  when?: Condition;
}

/** Vorübergehender Check-Bonus (Nougatbombe, Captain Kuschel ♥2 …), gespeichert in `PlayerState.checkBuffs`. */
export interface CheckBuff {
  id: string;
  label: string;
  value: number;
  attribute?: AttributeId;
  tags?: readonly string[];
  /** Verfällt nach diesem Spieltag (einschließlich). */
  untilDay?: number;
  /**
   * Nur im Effekt: Frist relativ zum heutigen Tag (0 = bis Tagesende, 1 = bis morgen einschließlich); wird beim Geben
   * in `untilDay` umgerechnet.
   */
  forDays?: number;
  /** Wird beim nächsten bestandenen passenden Check verbraucht (Standard true). */
  consumes?: boolean;
}

/**
 * Passive Wirkungen von Perks, Cyberware und getragener Kleidung (Auswertung in modules/character und modules/checks).
 */
export interface PassiveEffects {
  checkBonus?: readonly CheckBonusRule[];
  autoPass?: readonly AutoPassRule[];
  substitute?: readonly SubstituteRule[];
  /** Händlerrabatt in Prozent. */
  shopDiscount?: number;
  /** Ankaufsaufschlag in Prozentpunkten. */
  sellBonus?: number;
  /** Zusätzliche Prozent auf positive Geschenkpunkte. */
  giftBonus?: number;
  /** Zusätzliche Punkte beim täglichen Ansprechen (z. B. `perk-anfeuern` +10). */
  talkBonus?: number;
  /** Höchstdauer in Minuten, bis ein per Telefon gerufener Begleiter da ist (0 = sofort, z. B. Straßenfunk). */
  callMinutes?: number;
  /**
   * Freie Merkmale für Sonderregeln (z. B. 'zusammenbruch-gratis'). Abfrage über `hasTrait()`; die Regeln kennen
   * keine konkreten Merkmale.
   */
  traits?: readonly string[];
  combat?: CombatBonus;
}

export interface CheckDef {
  /** Eindeutig; Schlüssel für die einmalige XP („check:<id>“ in `seen`). */
  id: CheckId;
  attribute: AttributeId;
  /** 3–10. */
  threshold: number;
  /** Stichwörter für Perk-/Cyberware-Boni. */
  tags?: readonly string[];
  bonuses?: readonly CheckBonusDef[];
  /** Nicht erfüllt → Option ausblenden statt ausgrauen. */
  hiddenIfFailed?: boolean;
  /** XP beim ersten Bestehen, Standard 15 + 5 × Schwelle. */
  xp?: number;
  /** Optionaler Anzeigetext, Standard „[Technik 6]“. */
  label?: string;
  /** Fraktion des Gegenübers: Die Rufstufe verschiebt die Schwelle (world.md §10.2), Fraktionsregeln greifen. */
  faction?: FactionId;
}
/** Verweis auf `GameContent.checks` oder ein eingebetteter Check (dann ebenfalls mit eindeutiger id). */
export type CheckRef = CheckId | CheckDef;

/** Aufschlüsselung eines Checks für Anzeige und Tooltip. */
export interface CheckEvaluation {
  checkId: CheckId;
  attribute: AttributeId;
  /** „Technik“ */
  attributeLabel: string;
  threshold: number;
  /** Attribut + alle Boni. */
  value: number;
  ok: boolean;
  /** Fehlende Punkte (0, wenn bestanden). */
  missing: number;
  parts: { label: string; value: number; source: CheckPartSource }[];
  hiddenIfFailed: boolean;
  /** Bereits einmal bestanden (XP schon vergeben). */
  passedBefore: boolean;
  /** Schwelle aus dem Inhalt (XP richten sich danach); `threshold` ist die wirksame Schwelle (Ruf). */
  baseThreshold?: number;
  /** Tatsächlich zählendes Attribut (bei Ersatzattribut ≠ `attribute`). */
  usedAttribute?: AttributeId;
  /** Quelle, die den Check automatisch bestehen lässt, sonst null. */
  autoPass?: string | null;
}

/** Herkunft eines Teilwerts der Check-Aufschlüsselung. */
export type CheckPartSource =
  | 'attribut' | 'cyberware' | 'ausruestung' | 'perk' | 'gegenstand' | 'situation'
  | 'herkunft' | 'beziehung' | 'begleiter' | 'voruebergehend';

// ---------------------------------------------------------------------------
// Dialoge

/** Gesichtsausdruck des fotorealen Dialogbilds (design.md §6.2, Datei `photos/<id>/<expr>.webp`). */
export type Expression =
  | 'neutral' | 'freude' | 'wut' | 'trauer' | 'ueberrascht' | 'besorgt' | 'signatur' | 'verlegen' | 'zaertlich';

export interface DialogueLine {
  speaker: SpeakerId;
  /** Porträtvariante, z. B. 'angry' (→ NpcDef.portraits.angry bzw. 'portrait-<id>-angry'). */
  portrait?: string;
  /** Ausdruck des Dialogfotos (Standard 'neutral'; fehlt das Foto, gilt das gemalte Porträt). */
  expr?: Expression;
  /** `{name}` wird durch den Namen der Spielfigur ersetzt. */
  text: string;
}

export interface DialogueChoice {
  text: string;
  /** Knoten-ID; ohne next endet der Dialog. */
  next?: string;
  /** Sichtbar nur, wenn erfüllt. */
  when?: Condition;
  /** Sichtbar, aber ausgegraut, solange nicht erfüllt (z. B. Herz-Optionen „[Raven ♥6]“). */
  requires?: Condition;
  /** Anzeigepräfix ohne Check, z. B. „[Ödnis]“ oder „[Raven ♥6]“. */
  tag?: string;
  /** Schwellen-Check: nicht bestanden → ausgegraut (oder ausgeblendet mit `hiddenIfFailed`). */
  check?: CheckRef;
  effects?: Effect[];
  /** Verschwindet, nachdem sie einmal genommen wurde. */
  once?: boolean;
  /** Einmal pro Spieltag: verschwindet bis zum nächsten Morgen (Tagesflag `heute_wahl_…`). */
  daily?: boolean;
  /** Stabile Kennung für `once`/`daily` (Standard: next, sonst text). */
  id?: string;
}

export interface DialogueNode {
  id: string;
  lines: DialogueLine[];
  /** Nach der letzten Zeile angewandt. */
  effects?: Effect[];
  choices?: DialogueChoice[];
  /** Automatische Fortsetzung ohne Wahl. */
  next?: string;
}

export interface DialogueDef {
  id: DialogueId;
  start: string;
  nodes: DialogueNode[];
}

// ---------------------------------------------------------------------------
// Cutscenes mit Schlüsselszenen-Plates (design.md §6.1)

/** Ken-Burns-Fahrt; bei reduzierter Bewegung immer 'none'. */
export type PanMode = 'in' | 'out' | 'left' | 'right' | 'none';

export interface CutsceneBeat {
  /** Bildschlüssel ('cut-<id>' bzw. '<id>', aufgelöst über das Manifest) oder 'black'. */
  image?: string;
  pan?: PanMode;
  /** Bildunterschrift unten (Display-Schrift). */
  caption?: string;
  /** Dialogzeilen mit Porträt über dem Bild. */
  lines?: DialogueLine[];
  sfx?: SfxId;
  /** Übergang zum Bild; Standard 'cross' zwischen zwei Bildern. */
  fade?: 'in' | 'out' | 'cross';
  /** Mindestdauer in ms vor „Weiter“ (bei reduzierter Bewegung ignoriert). */
  hold?: number;
  /** Nur zeigen, wenn erfüllt (geprüft beim Start der Cutscene), z. B. Varianten nach Romanze oder Ausgang. */
  when?: Condition;
}

export interface CutsceneDef {
  id: CutsceneId;
  title?: string;
  beats: CutsceneBeat[];
  /** Nach dem letzten Beat. */
  effects?: Effect[];
  /** Standard true. */
  skippable?: boolean;
  /** In die Galerie aufnehmen (Standard: ja, sobald ein Beat ein Bild hat). */
  gallery?: boolean;
}

// ---------------------------------------------------------------------------
// Karten (design.md §5)

export type Lighting = 'outdoor' | 'indoor' | 'underground';

export interface ExitDef {
  id: string;
  rect: Rect;
  to: MapId;
  /** Einstiegs-ID auf der Zielkarte. */
  entry: string;
  /** „Zum Schrottmarkt“ */
  label: string;
  when?: Condition;
  /** Text, wenn die Bedingung fehlt („Gesperrt – kommt in Akt 2“). */
  lockedText?: string;
  /** Tür/Leiter: Interaktion statt Betreten. */
  interact?: boolean;
  /** Welt-Check (z. B. Tür hacken); ohne passenden Wert muss ein anderer Weg existieren. */
  check?: CheckRef;
  /** Zusätzliche Spielminuten (Standard: Kartenwechsel +10). */
  minutes?: number;
  /** Effekte beim Durchgehen (vor der Reise; nur Zustand und Meldungen, keine Dialoge/Reisen), z. B. ein Flag. */
  effects?: Effect[];
}

export type HotspotKind = 'look' | 'talk' | 'loot' | 'use' | 'check' | 'shop' | 'board' | 'screen' | 'sleep' | 'phone';

export interface HotspotDef {
  id: string;
  at: Point;
  /** Interaktionsradius in Kartenpixeln, Standard 56. */
  radius?: number;
  /** Aktionsname im HUD. */
  label: string;
  kind: HotspotKind;
  when?: Condition;
  /** Verschwindet, sobald erfüllt. */
  hideWhen?: Condition;
  dialogue?: DialogueId;
  /** Welt-Check: bestanden → `effects`; sonst Hinweis auf fehlende Punkte (`altText`). */
  check?: CheckRef;
  /** Hinweis auf den anderen Weg, wenn der Check nicht reicht. */
  altText?: string;
  effects?: Effect[];
  /** Kurze Beschreibung ohne eigenen Dialog. */
  lines?: DialogueLine[];
  /** Requisit-Textur, die hier gezeichnet wird. */
  prop?: string;
  once?: boolean;
  /** Einmal pro Spieltag (Mülltonne, täglicher Fund): danach bis zum nächsten Morgen ausgeblendet. */
  daily?: boolean;
  /** kind 'shop' */
  shop?: ShopId;
  /** kind 'board' */
  board?: JobBoardId;
}

/** Feste Figur auf einer Karte (zusätzlich zu den Tagesabläufen). */
export interface NpcPlacement {
  id: string;
  npc: NpcId;
  at: Point;
  facing?: Facing;
  pose?: string;
  /** Standard: Tagesgespräch der Figur (NpcDef.talk). */
  dialogue?: DialogueId;
  when?: Condition;
  hideWhen?: Condition;
  patrol?: Point[];
}

/** Sichtbare Gegnergruppe auf der Karte: Berühren/Ansprechen startet den Kampf. */
export interface MapEncounterDef {
  id: string;
  encounter: EncounterId;
  at: Point;
  /** Figur, die die Gruppe darstellt (Laufblatt-Schlüssel). */
  sprite?: string;
  patrol?: Point[];
  /** Auslöseradius, Standard 48. */
  radius?: number;
  when?: Condition;
  /** Verschwindet nach Sieg, Standard true. */
  once?: boolean;
  /** Check, um vorbeizukommen bzw. den Kampf abzuwenden. */
  avoid?: CheckRef;
}

/** Passanten mit Laufrouten und Zufallssprüchen. */
export interface AmbientDef {
  count: number;
  sprites: string[];
  routes?: Point[][];
  barks?: { text: string; when?: Condition }[];
  /** Anzahl je Tageszeit (überschreibt count). */
  bySlot?: Partial<Record<TimeSlot, number>>;
  /** Passanten nur, solange erfüllt (geprüft bei Betreten und Tageszeitwechsel), z. B. Publikum nur zur Rennnacht. */
  when?: Condition;
}

/** Lichtpunkt für Abend/Nacht (additiv). */
export interface LightDef {
  at: Point;
  radius: number;
  /** CSS-Farbe, z. B. '#ff3fa4'. */
  color: string;
  intensity?: number;
  slots?: TimeSlot[];
  /** Leuchtet nur, solange erfüllt (Alarm, Stromausfall, Lagerfeuer mit Leuten). */
  when?: Condition;
}

/** Notschlafplatz einer Karte (world.md §3.8): Zusammenbruch hier ohne Credits-Verlust. Form siehe modules/time. */
export type MapShelterDef = ShelterDef;

export interface MapDef {
  id: MapId;
  name: string;
  subtitle?: string;
  /** Kartengröße in Pixeln, Standard 1536×1024. */
  size: readonly [w: number, h: number];
  district: DistrictId;
  lighting: Lighting;
  /** Manifest-Bildschlüssel, z. B. 'bg-neon-gasse'. */
  bg: string;
  /** Hintergrundvarianten nach Zustand; erste erfüllte gewinnt. */
  bgVariants?: { when: Condition; bg: string }[];
  walk: Polygon[];
  block?: Polygon[];
  /**
   * Begehbarkeit nach Bedingung (geprüft beim Betreten der Karte): `walk` kommt als Lauffläche dazu (Brücke gespannt,
   * Abkürzung offen), `block` als Hindernis (Partytische, Marktstände).
   */
  blockVariants?: { when: Condition; walk?: Polygon[]; block?: Polygon[] }[];
  exits: ExitDef[];
  entries: Record<string, { at: Point; facing: Facing }>;
  /** Benannte Punkte für Tagesabläufe ('bar', 'tresen'). */
  spots?: Record<string, { at: Point; facing?: Facing }>;
  hotspots: HotspotDef[];
  npcs?: NpcPlacement[];
  /** Vordergrundbereiche, die Figuren dahinter verdecken. */
  foreground?: { rect: Rect; baseY: number }[];
  lights?: LightDef[];
  /** U-Bahn-Station dieser Karte (Betreten schaltet sie frei). */
  station?: StationId;
  encounters?: MapEncounterDef[];
  ambient?: AmbientDef;
  /** Bett im Unterschlupf: Schlafen beendet den Tag. */
  bed?: { at: Point; label?: string };
  /** Notschlafplatz: Wer hier um 02:00 zusammenbricht, wacht hier auf (ohne Credits-Verlust, Standard). */
  shelter?: MapShelterDef;
  ambience: AmbienceId;
  /** Lyria-Musik dieser Karte; fehlt = Bezirksstandard, `null` = keine Musik. */
  music?: MusicSpec | null;
  /** Musik nach Bedingung (erste passende gewinnt, vor `music`), z. B. Schleichmusik beim Bruch; `null` = still. */
  musicWhen?: { when: Condition; music: MusicSpec | null }[];
  /** Musik gedämpft (Tiefpass), etwa Club-Musik auf der Straße davor. */
  musicMuffled?: boolean;
  onEnter?: { id: string; when?: Condition; cutscene?: CutsceneId; dialogue?: DialogueId; effects?: Effect[]; once?: boolean }[];
  /** Ziel der Schnellreise, wenn nicht diese Karte (Innenräume hinter einem Check). */
  fastTravel?: { to: MapId; entry?: string };
}

export type AmbienceId = 'unterstadt' | 'club' | 'oberstadt' | 'kanal' | 'oednis' | 'meer' | 'innen' | 'labor';

export interface DistrictDef { id: DistrictId; name: string; ambience?: AmbienceId; music?: MusicSpec }

/** Musikstück-ID aus `assets/music/manifest.json`; Tag/Nacht-Variante (Nacht = 20:00–06:00). */
export type MusicSpec = string | { day: string; night: string };

export interface StationDef {
  id: StationId;
  name: string;
  map: MapId;
  entry: string;
  /** Lage auf der Stadtkarte (Bildanteile 0..1). */
  cityPos: Point;
  when?: Condition;
}

// ---------------------------------------------------------------------------
// Spielfigur: Attribute, Perks, Cyberware, Herkunft, Aussehen (design.md §3.1)

export type CyberSlot = 'kopf' | 'augen' | 'arme' | 'beine' | 'nervensystem' | 'haut';
export type EquipSlot = 'nahkampf' | 'fernkampf' | 'smart' | 'kleidung';

/** Kampfboni aus Perks, Cyberware und Kleidung. */
export interface CombatBonus {
  hit?: number;
  damage?: number;
  armor?: number;
  hp?: number;
  move?: number;
  initiative?: number;
  /** Netz-Werte (world.md §2.4). */
  bandwidth?: number;
  firewall?: number;
}

export interface PerkDef extends PassiveEffects {
  id: PerkId;
  name: string;
  description: string;
  attribute: AttributeId;
  /** Mindestwert im Attribut (z. B. 4/6/8/10). */
  min: number;
  /** Mindeststufe der Spielfigur (world.md §2.5, Standard 1). */
  level?: number;
  /** Standard 1. */
  cost?: number;
  ability?: AbilityId;
  /** Nur als Vorgabe/Belohnung (z. B. Start-Perk der fertigen Spielfigur Vex): nicht lernbar, für andere unsichtbar. */
  exclusive?: boolean;
}

export interface CyberwareDef extends PassiveEffects {
  id: CyberwareId;
  name: string;
  slot: CyberSlot;
  description: string;
  attributes?: Partial<Record<AttributeId, number>>;
  ability?: AbilityId;
  /** Gegenstand, der beim Einbau verbraucht wird. */
  item?: ItemId;
  /** Einbaugebühr beim Ripperdoc (ohne Rabatt). */
  installFee?: number;
}

export interface OriginDef {
  id: OriginId;
  name: string;
  description: string;
  /** +1 auf dieses Attribut (höchstens 10); bei `bonusChoice` die Vorauswahl. */
  bonus: AttributeId;
  /** Wahl des Bonusattributs bei der Erstellung (z. B. Knastvogel: Straße oder Körper). */
  bonusChoice?: readonly AttributeId[];
  /** Herkunftsboni bei Checks (z. B. Ex-Wache +1 bei Checks mit Stichwort 'wache'). */
  checkBonus?: readonly CheckBonusRule[];
  /** Anzeigepräfix exklusiver Dialogoptionen, z. B. „[Ödnis]“. */
  tag: string;
  items?: Record<ItemId, number>;
  credits?: number;
  relations?: Record<NpcId, number>;
  rep?: Record<FactionId, number>;
  flags?: string[];
}

export interface LookDef {
  id: LookId;
  name: string;
  /** Laufblatt, z. B. 'player-a-walk'; Vorlagen des Baukastens: 'player-walk' (gebackene Textur). */
  sprite: string;
  /** Porträtschlüssel ohne Präfix, z. B. 'player-a'; Vorlagen des Baukastens: '' (ungenutzt, Ich-Perspektive). */
  portrait: string;
  /** Vorlage des Charakter-Baukastens (design.md §3.1a, world.md §2.3). */
  appearance?: PlayerAppearance;
}

// ---------------------------------------------------------------------------
// Charakter-Baukasten (design.md §3.1a, Ebenen-Vertrag §6.3). Namen deutsch in content/appearance.ts.

export type BodyId = 'schmal' | 'mittel' | 'kraeftig';
export type Side = 'links' | 'rechts';
/** 'haut-1' … 'haut-8'. */
export type SkinId = string;
/** 'gesicht-1' … 'gesicht-6'. */
export type FaceId = string;
/** 'haar-glatze', 'haar-buzz' … */
export type HairId = string;
/** 'schwarz', 'neon-pink' … (färbt auch Bart und Brauen). */
export type HairColorId = string;
/** Kleidungsteil: 'oben-…', 'jacke-…', 'hose-…', 'schuhe-…'. */
export type PartId = string;
/** Kleidungs- und Leuchtfarbe aus der Palette ('schwarz' … 'neon-gruen'). */
export type PaletteColorId = string;
/** 'tattoo-keins', 'tattoo-wange' … */
export type TattooId = string;
export type GlassesId = 'keine' | 'rund' | 'sonnenbrille' | 'visier';
export type MaskId = 'keine' | 'tuch' | 'atemmaske';
export type CapId = 'keine' | 'basecap' | 'muetze';

export interface PlayerCyberLook {
  armL: boolean;
  armR: boolean;
  eyes: boolean;
  facePlate: boolean;
  neckCable: boolean;
  leg: 'keins' | Side;
  /** Augen, Cyber-LEDs, Neon-Tattoo. */
  glow: PaletteColorId;
}

export interface PlayerAccessories {
  glasses: GlassesId;
  mask: MaskId;
  chain: boolean;
  cap: CapId;
  headphones: boolean;
}

export interface PlayerAppearance {
  /** Schema des Aussehens (eigene Migration über PART_ALIASES). */
  v: 1;
  body: BodyId;
  skin: SkinId;
  face: FaceId;
  hair: HairId;
  hairColor: HairColorId;
  /** Pflicht, kein „ohne“. */
  top: PartId;
  /** Inklusive 'jacke-keine'. */
  jacket: PartId;
  /** Pflicht. */
  pants: PartId;
  shoes: PartId;
  /** Hauptfarbe Kleidung. */
  colorA: PaletteColorId;
  /** Zweitfarbe Kleidung (Säume, Streifen, Sohlen, Futter). */
  colorB: PaletteColorId;
  cyber: PlayerCyberLook;
  tattoo: TattooId;
  acc: PlayerAccessories;
}

/** Kleidungsteile, die ausgerüstete Kleidung (`ItemDef.wear.look`) überlagern darf. */
export type WearLook = Partial<Pick<PlayerAppearance, 'top' | 'jacket' | 'pants' | 'shoes'>>;

/** Deutsche Namen der Baukasten-IDs und Palette (content/appearance.ts). */
export interface AppearanceTexts {
  names: Record<string, string>;
  /** Kleidungs-/Leuchtfarben: Mittelton, optional dunkle und helle Stufe der Verlaufskarte. */
  palette: Record<PaletteColorId, { name: string; mid: string; dark?: string; light?: string }>;
  hairColors: Record<HairColorId, { name: string; mid: string; dark?: string; light?: string }>;
  skin: Record<SkinId, { name: string; mid: string; dark?: string; light?: string }>;
}

/** Fertige Spielfigur (design.md §3.1b). */
export type PlayerPresetId = 'vex';

export interface PlayerPresetDef {
  id: PlayerPresetId;
  /** Fester Name, z. B. „Vex Schrapnell“. */
  name: string;
  /** Kurzbeschreibung für die Auswahlkarte. */
  description: string;
  origin: OriginId;
  /** Feste Startwerte (ohne freie Punkte, ohne Herkunftsbonus). */
  attributes: Record<AttributeId, number>;
  perks?: readonly PerkId[];
  items?: Record<ItemId, number>;
  /** Gemaltes Laufblatt statt Baukasten, z. B. 'vex-walk'. */
  sprite: string;
  /** Porträtschlüssel ohne Präfix ('vex') und Basis der Dialogfotos ('photo-vex-<ausdruck>'). */
  portrait: string;
  /** Weltfigur, die bei dieser Wahl nicht platziert wird (z. B. 'vex-schrapnell'). */
  worldNpc?: NpcId;
}

export interface FactionDef { id: FactionId; name: string; description?: string }

// ---------------------------------------------------------------------------
// Gegenstände, Händler, Aufträge (design.md §3.5, §3.6)

export type ItemCategory = 'waffe' | 'cyberware' | 'verbrauch' | 'geschenk' | 'quest' | 'sammeln' | 'kleidung';
export type WeaponKind = 'nahkampf' | 'fernkampf' | 'smart';

export interface WeaponStats {
  kind: WeaponKind;
  damage: number;
  /** Reichweite in Feldern (Nahkampf 1). */
  range: number;
  hit?: number;
  ability?: AbilityId;
}

export interface ItemDef {
  id: ItemId;
  name: string;
  description: string;
  category: ItemCategory;
  /** Schlüssel im Itematlas. */
  icon: string;
  /** Grundpreis in Credits (Ankauf 40 %). */
  price: number;
  /** Stichwörter für Geschenkvorlieben ('#essen' in NpcDef.gifts). */
  giftTags?: readonly string[];
  weapon?: WeaponStats;
  /**
   * Kleidung: Attribut-, Kampf- und passive Boni, solange angezogen. `look` überlagert Teile des Baukastens
   * (design.md §3.1a; Sonderteile tragen im Katalog `hidden: true`), `appearance` selbst bleibt unverändert.
   */
  wear?: { attributes?: Partial<Record<AttributeId, number>>; look?: WearLook } & PassiveEffects;
  /** Kategorie 'cyberware': welches Teil eingebaut wird. */
  cyberware?: CyberwareId;
  /** Gegenstand gibt Check-Boni, solange er im Inventar ist (z. B. Dietrich-Set). */
  checkBonus?: readonly CheckBonusRule[];
  use?: {
    label: string;
    /** LP für die Spielfigur. */
    heal?: number;
    effects?: Effect[];
    when?: Condition;
    /** Standard: true für 'verbrauch'. */
    consumes?: boolean;
    /** Im Kampf nutzbar als Fähigkeit. */
    battle?: AbilityId;
    /** Außerhalb des Kampfs nutzbar, Standard true. */
    world?: boolean;
    text?: string;
  };
  /** Standard: false für 'quest'. */
  sellable?: boolean;
  inspect?: string;
}

export interface ShopStockEntry {
  item: ItemId;
  /** Abweichender Grundpreis. */
  price?: number;
  /** Tagesbestand (ohne Angabe unbegrenzt). */
  qty?: number;
  when?: Condition;
}

export interface ShopDef {
  id: ShopId;
  name: string;
  owner?: NpcId;
  faction?: FactionId;
  /** Geöffnet, solange erfüllt (Öffnungszeiten über `time`/`clockBetween`). */
  open?: Condition;
  stock: ShopStockEntry[];
  /** Ankaufsquote, Standard 0,4. */
  buyRate?: number;
  /** Kauft nur diese Kategorien an (Standard: alles außer Quest). */
  buys?: ItemCategory[];
  /** Ripperdoc: baut Cyberware ein; `fee` Standardgebühr der Werkstatt, frei ab `freeWhen`. */
  ripperdoc?: { freeWhen?: Condition; fee?: number };
  /**
   * Preisregeln nach Bedingung (alle passenden gelten): `discount` in Prozentpunkten (positiv = Rabatt, negativ =
   * Aufschlag; zählt zu Perk- und Rufrabatt, Gesamtfaktor 0,5–2), `refuse` = der Händler verkauft nicht (Grund).
   */
  priceRules?: { when: Condition; discount?: number; refuse?: string }[];
}

export type JobKind = 'kurier' | 'schulden' | 'datenraub' | 'kopfgeld' | 'eskorte';

/** Vorlage für wiederholbare Aufträge; 3 pro Tag und Tafel, deterministisch aus Tag und Seed. */
export interface JobTemplateDef {
  id: JobTemplateId;
  kind: JobKind;
  /** Platzhalter {ziel} und {credits}. */
  title: string;
  text: string;
  boards: JobBoardId[];
  when?: Condition;
  /** Mögliche Ziele; eines wird je Angebot gezogen. */
  targets: { map: MapId; label: string; at?: Point }[];
  encounter?: EncounterId;
  /** Kurierpaket o. Ä., beim Annehmen ins Inventar. */
  item?: ItemId;
  reward: { credits: readonly [min: number, max: number]; xp: number; rep?: Record<FactionId, number> };
}

// ---------------------------------------------------------------------------
// Figuren, Beziehungen, Tagesablauf (design.md §3.3, §3.4)

/** Einträge sind Gegenstands-IDs oder Stichwörter mit '#', z. B. '#essen'. Gegenstands-IDs gehen vor. */
export interface GiftPrefs {
  loves?: readonly string[];
  likes?: readonly string[];
  dislikes?: readonly string[];
  hates?: readonly string[];
}
export type GiftTaste = 'loves' | 'likes' | 'neutral' | 'dislikes' | 'hates';

/** Ort im Tagesablauf: Karte + Punkt (oder Name aus MapDef.spots). */
export interface SchedulePlace { map: MapId; at: Point | string; facing?: Facing }

/** Erster passender Eintrag gewinnt – Sonderfälle (Quest, Akt, Wochentag) gehören nach vorn. */
export interface ScheduleEntry {
  slot?: TimeSlot | readonly TimeSlot[];
  days?: readonly Weekday[];
  when?: Condition;
  place: SchedulePlace | 'away';
  /** Abweichender Dialog an diesem Ort. */
  dialogue?: DialogueId;
  patrol?: Point[];
  pose?: string;
}

export interface HeartEventDef {
  id: HeartEventId;
  /** 2/4/6/8/10 Herzen; negative Werte −2/−5/−8 sind Rivalitätsereignisse. */
  hearts: number;
  /** Auslöser beim Betreten dieser Karte. */
  map: MapId;
  time?: TimeSlot | readonly TimeSlot[];
  when?: Condition;
  cutscene?: CutsceneId;
  dialogue?: DialogueId;
  effects?: Effect[];
}

/** Tagesgespräch: erster passender Eintrag gewinnt. */
export interface TalkDef { dialogue: DialogueId; when?: Condition; minHearts?: number }

/** Kampfwerte einer Einheit (Begleiter, Gegner). */
export interface UnitStats {
  hp: number;
  armor: number;
  attributes: Record<AttributeId, number>;
  weapon: WeaponStats;
  abilities: AbilityId[];
  /** Unter diesem Moralwert flieht bzw. ergibt sich die Einheit (Einschüchtern). */
  morale?: number;
}

export interface CompanionDef {
  /** Rekrutierbar, sobald erfüllt; vorher lehnt der Effekt `recruit` ab (Warps setzen die Crew direkt). */
  recruit?: Condition;
  stats: UnitStats;
  /** Zusätzliche Fähigkeiten ab Herzstufe. */
  heartAbilities?: { hearts: number; ability: AbilityId }[];
  /** Anfahrt in Minuten, wenn man die Figur per Telefon ruft (Standard 30, world.md: Aria 15). */
  callMinutes?: number;
  /** Abweichende Anfahrt, solange die Bedingung gilt (erste passende gewinnt), z. B. 15 nur im Status „zusammen“. */
  callMinutesWhen?: { when: Condition; minutes: number }[];
  /**
   * Fähigkeiten unter Bedingung (Quest-Belohnung, Variante, Sperre): `add` kommt dazu, `replace: [alt, neu]` tauscht
   * eine Grund- oder Herz-Fähigkeit aus, `remove` nimmt eine weg. Alle passenden Regeln gelten in Reihenfolge.
   */
  abilityRules?: { when: Condition; add?: AbilityId; replace?: readonly [AbilityId, AbilityId]; remove?: AbilityId }[];
  /**
   * Duo-Aktionen: Solange die Figur in der Party ist und `when` gilt, bekommt `holder` (Standard 'companion' = diese
   * Figur, 'player' = die Spielfigur) die Fähigkeit. Herzen, Spielfigur und Partner stehen in `when`.
   */
  duo?: { ability: AbilityId; when?: Condition; holder?: 'player' | 'companion' }[];
  /**
   * Gerade nicht verfügbar (gefangen, gechippt, im Turm): Solange erfüllt, verlässt die Figur die Party, lässt sich
   * weder anrufen noch einteilen; sie bleibt in der Crew. `unavailableText` erklärt den Grund im Party-Menü.
   */
  unavailableWhen?: Condition;
  unavailableText?: string;
  /**
   * Werte nach Stufe der Spielfigur (aufsteigend; alle Einträge bis zur Stufe gelten nacheinander, spätere
   * überschreiben). Ohne Einträge wachsen LP und Waffenschaden ab Stufe 6 von selbst mit (siehe combat/campaign.ts).
   */
  statsByLevel?: CompanionLevelStats[];
}

/** Werte eines Begleiters ab einer Stufe der Spielfigur (nur die genannten Felder ändern sich). */
export interface CompanionLevelStats {
  minLevel: number;
  hp?: number;
  armor?: number;
  morale?: number;
  attributes?: Partial<Record<AttributeId, number>>;
  weapon?: Partial<Pick<WeaponStats, 'damage' | 'range' | 'hit'>>;
}

export interface NpcDef {
  id: NpcId;
  name: string;
  /** Name vor der Vorstellung („Mann mit Plattenkiste“). */
  unknownName?: string;
  knownFlag?: string;
  /** Porträtschlüssel ohne Präfix ('raven'). */
  portrait: string;
  /** Varianten: 'angry' → 'ki-nexus-angry'. */
  portraits?: Record<string, string>;
  /** Laufblatt-Schlüssel; fehlt bei Figuren ohne Kartenfigur (z. B. KI). */
  sprite?: string;
  faction?: FactionId;
  /** Kinderfigur: nie romanzierbar. */
  child?: boolean;
  gifts?: GiftPrefs;
  /** Abweichende Vorlieben, solange die Bedingung gilt (erste passende gewinnt). */
  giftVariants?: { when: Condition; gifts: GiftPrefs }[];
  schedule?: ScheduleEntry[];
  heartEvents?: HeartEventDef[];
  companion?: CompanionDef;
  /** Nur Kennzeichen; freigeschaltet über content/romance.ts. */
  romanceable?: boolean;
  talk?: TalkDef[];
  /** Herz-Obergrenze (1–10, Standard 10; Weltfiguren mit Kurzeintrag 5 bzw. 6, world.md §4.1). */
  maxHearts?: number;
  /** Solange erfüllt, gibt es keine Herzpunkte dazu (Figur gefangen/abwesend); Verluste zählen weiter. */
  heartsFrozen?: Condition;
  /** Geburtstag: Geschenke zählen dreifach, solange erfüllt (z. B. `{ all: [{ cycleDay: 12 }] }`). */
  birthday?: Condition;
  /** Check-Boni, solange die Figur in der Party ist (z. B. Hunter bei Verhandlungen). */
  partyCheckBonus?: readonly CheckBonusRule[];
  /** Kurzbeschreibung für die Beziehungsansicht. */
  bio?: string;
}

// ---------------------------------------------------------------------------
// Quests (design.md §3.5)

export type QuestKind = 'main' | 'side' | 'job' | 'personal';

export interface QuestStepDef {
  id: string;
  text: string;
  /** Erledigt, sobald erfüllt (wird festgehalten). Lösungswege über `any`. */
  done: Condition;
  /** Sichtbar ab. */
  when?: Condition;
  optional?: boolean;
  /** Zielmarker; `at` darf ein Spot- oder Einstiegsname der Karte sein (wird beim Anzeigen aufgelöst). */
  marker?: { map: MapId; at?: Point | string };
  /** Beim Erledigen. */
  effects?: Effect[];
}

export interface QuestReward {
  xp?: number;
  credits?: number;
  items?: Record<ItemId, number>;
  relations?: Record<NpcId, number>;
  rep?: Record<FactionId, number>;
  effects?: Effect[];
}

export interface QuestDef {
  id: QuestId;
  kind: QuestKind;
  title: string;
  summary?: string;
  giver?: NpcId;
  act?: ActId;
  /** Startet automatisch, sobald erfüllt. */
  autoStart?: Condition;
  steps: QuestStepDef[];
  /** Scheitert, sobald erfüllt. */
  fail?: Condition;
  reward?: QuestReward;
  /** Abschluss automatisch, wenn alle Pflichtschritte erledigt sind (Standard true). */
  autoComplete?: boolean;
  /**
   * Heist/Finale: Solange die Quest aktiv ist, gibt es keinen Zusammenbruch um 02:00 – die Uhr bleibt um 01:59 stehen
   * (Erkunden, Warten, Reisen). Schlafen geht weiter.
   */
  noCollapse?: boolean;
}

// ---------------------------------------------------------------------------
// Kampf: Inhalte (design.md §3.7)

export type StatusId = 'gehackt' | 'betaeubt' | 'brennt' | 'markiert' | 'geschuetzt' | 'blutet';
export type AiProfile = 'aggressiv' | 'vorsichtig' | 'support' | 'boss';
export type AbilityKind = 'nahkampf' | 'fernkampf' | 'hack' | 'support' | 'sozial' | 'trick' | 'gegenstand';
export type AbilityTarget = 'enemy' | 'ally' | 'self' | 'cell' | 'area';

export interface AbilityDef {
  id: AbilityId;
  name: string;
  description: string;
  kind: AbilityKind;
  /** Aktionspunkte (1 oder 2). */
  ap: number;
  target: AbilityTarget;
  /** Reichweite in Feldern. */
  range: number;
  /** Flächenradius in Feldern (target 'area'). */
  radius?: number;
  damage?: number;
  /** Attribut, das Schaden bzw. Wirkung erhöht. */
  attribute?: AttributeId;
  hit?: number;
  heal?: number;
  status?: { id: StatusId; turns: number; chance?: number };
  cooldown?: number;
  /** Einsätze je Kampf. */
  uses?: number;
}

export interface EnemyDef {
  id: EnemyId;
  name: string;
  sprite?: string;
  portrait?: string;
  faction?: FactionId;
  level: number;
  stats: UnitStats;
  ai: AiProfile;
  xp: number;
  credits?: readonly [min: number, max: number];
  loot?: { item: ItemId; chance: number; qty?: number }[];
  /** Bossphasen nach verbleibenden LP (Anteil 0..1). */
  phases?: { below: number; ai?: AiProfile; abilities?: AbilityId[]; line?: string }[];
}

/**
 * Arena 12 × 8 Felder à 128 px auf einem 1536×1024-Bild. `layout` hat 8 Zeilen à 12 Zeichen:
 * '.' Boden, '#' Hindernis, 'h' halbe Deckung, 'H' volle Deckung, '~' Gefahrenfeld, 'P' Start Party, 'E' Start Gegner.
 */
export interface ArenaDef {
  id: ArenaId;
  name: string;
  bg: string;
  layout: readonly string[];
  /** Wirkung von '~'. */
  hazard?: { status?: StatusId; damage?: number };
}

export type BattleObjective =
  | { kind: 'defeat' }
  | { kind: 'survive'; rounds: number }
  | { kind: 'reach'; cells: Cell[] }
  | { kind: 'hack'; cell: Cell; ap: number }
  /** Schutzperson: NPC- oder Gegner-ID (Werte, Bild); `name`/`sprite` überschreiben die Anzeige (z. B. „Proband 47“). */
  | { kind: 'rescue'; unit: string; cell: Cell; name?: string; sprite?: string };

export interface EncounterDef {
  id: EncounterId;
  name: string;
  arena: ArenaId;
  enemies: { enemy: EnemyId; at?: Cell; count?: number }[];
  objective?: BattleObjective;
  /** Zufallsbegegnung: Karte, Tageszeit, Wahrscheinlichkeit 0..1 je Betreten. */
  random?: { maps: MapId[]; time?: TimeSlot[]; chance: number };
  when?: Condition;
  /** Fliehen erlaubt (Standard true, Bosse false). */
  canFlee?: boolean;
  onWin?: Effect[];
  onLose?: Effect[];
  /** Niederlage ohne Heimweg: halbe LP, man bleibt auf der Karte (Finale, Heist; die Begegnung bleibt wiederholbar). */
  stayOnLose?: boolean;
  reward?: { xp?: number; credits?: number; items?: Record<ItemId, number> };
  /** Gesprochene Zeilen zu Beginn. */
  intro?: DialogueLine[];
  /** Einstieg (world.md §8.1): überrumpelt = Party zuerst und +15 auf den ersten Angriff; Hinterhalt = Gegner zuerst. */
  start?: 'normal' | 'ueberrumpelt' | 'hinterhalt';
  /** Duell: nur die Spielfigur kämpft, Begleiter schauen zu. */
  solo?: boolean;
  /**
   * Zustände ab Kampfbeginn, wenn `when` gilt (Vorbereitung, Sabotage): `target` = 'party', 'enemies', 'player' oder
   * eine Gegner-ID (alle Einheiten dieses Typs). Z. B. Stromschnitt: Boss eine Runde `betaeubt`.
   */
  startStatus?: { when?: Condition; target: 'party' | 'enemies' | 'player' | EnemyId; status: StatusId; rounds: number }[];
  /** Nach so vielen Runden endet der Kampf als Flucht (Standard 60). */
  maxRounds?: number;
}

// ---------------------------------------------------------------------------
// Kampf: Laufzeit (modules/combat; Darstellung liest nur). Entwurf – der Kampfregeln-Bereich darf erweitern.

export type Team = 'party' | 'enemy';

export interface BattleUnit {
  id: string;
  name: string;
  team: Team;
  source: { kind: 'player' } | { kind: 'companion'; npc: NpcId } | { kind: 'enemy'; enemy: EnemyId };
  sprite: string;
  portrait?: string;
  cell: Cell;
  facing: Facing;
  hp: number;
  maxHp: number;
  armor: number;
  ap: number;
  attributes: Record<AttributeId, number>;
  weapon: WeaponStats;
  abilities: AbilityId[];
  cooldowns: Record<AbilityId, number>;
  /** Verbleibende Einsätze je Fähigkeit mit `AbilityDef.uses` (fehlend = unbegrenzt). */
  uses: Record<AbilityId, number>;
  status: Partial<Record<StatusId, number>>;
  ai?: AiProfile;
  morale?: number;
  state: 'active' | 'down' | 'fled' | 'surrendered';
  overwatch: boolean;
}

export type BattleAction =
  | { type: 'move'; to: Cell }
  | { type: 'attack'; target: string }
  | { type: 'ability'; ability: AbilityId; target?: string; cell?: Cell }
  /** `cell`: Wurfgegenstand (Granate) auf ein Feld. */
  | { type: 'item'; item: ItemId; target?: string; cell?: Cell }
  | { type: 'overwatch' }
  | { type: 'cover' }
  | { type: 'end' }
  | { type: 'flee' }
  /** Terminal hacken (Missionsziel `hack`): 1 AP Fortschritt, angrenzend oder auf dem Feld. */
  | { type: 'interact' }
  /** Waffe wechseln (0 AP, einmal je Zug). */
  | { type: 'weapon'; index: number };

export type BattleEvent =
  | { type: 'round'; round: number }
  | { type: 'turn'; unit: string; round: number }
  | { type: 'move'; unit: string; path: Cell[] }
  | {
    type: 'attack'; unit: string; target: string; hit: boolean; chance: number; damage: number; ability?: AbilityId;
    /** Volltreffer (×1,5). */
    crit?: boolean;
    /** Überwachungsfeuer. */
    reaction?: boolean;
  }
  | { type: 'ability'; unit: string; ability: AbilityId; target?: string; cell?: Cell }
  | { type: 'item'; unit: string; item: ItemId; target?: string }
  | { type: 'heal'; unit: string; target: string; amount: number }
  | { type: 'damage'; unit: string; amount: number; source: 'brennt' | 'blutet' | 'gefahr' }
  | { type: 'status'; unit: string; status: StatusId; turns: number }
  | { type: 'statusEnd'; unit: string; status: StatusId }
  | { type: 'resist'; unit: string; status: StatusId }
  | { type: 'skip'; unit: string; status: StatusId }
  | { type: 'morale'; unit: string; morale: number; delta: number }
  | { type: 'overwatch'; unit: string }
  | { type: 'cover'; unit: string }
  | { type: 'weapon'; unit: string; weapon: WeaponKind; index: number }
  | { type: 'phase'; unit: string; phase: number }
  | { type: 'revive'; unit: string; target: string; hp: number }
  | { type: 'objective'; unit: string; progress: number; needed: number }
  | { type: 'down'; unit: string }
  | { type: 'flee'; unit: string }
  | { type: 'surrender'; unit: string }
  | { type: 'bark'; unit: string; text: string }
  | { type: 'end'; outcome: BattleOutcome };

export type BattleOutcome = 'win' | 'lose' | 'fled';

export interface BattleState {
  encounter: EncounterId;
  arena: ArenaId;
  round: number;
  /** Einheiten-IDs nach Initiative. */
  order: string[];
  active: string | null;
  units: BattleUnit[];
  log: BattleEvent[];
  outcome: BattleOutcome | null;
  /** Zustand des deterministischen Zufalls. */
  rng: number;
}

/** Ergebnis eines Kampfs für die Kampagne (`CampaignPort.finishBattle`). */
export interface BattleResult {
  encounter: EncounterId;
  outcome: BattleOutcome;
  /** LP der Spielfigur am Ende. */
  playerHp: number;
  /** Verbrauchte Gegenstände. */
  used?: Record<ItemId, number>;
  /** Zusätzliche Beute (gezogen aus EnemyDef.loot). */
  loot?: Record<ItemId, number>;
  /** XP/Credits aus besiegten Gegnern (zusätzlich zu EncounterDef.reward). */
  xp?: number;
  credits?: number;
}

// ---------------------------------------------------------------------------
// Nachrichten und Telefon (design.md §3.8)

export interface NewsDef {
  id: NewsId;
  /** Sprecher, z. B. 'collin' oder 'delya'. */
  anchor: NpcId;
  headline: string;
  lines: DialogueLine[];
  when?: Condition;
  /** Höher = wichtiger (Standard 0). */
  priority?: number;
}

export interface PhoneMessageDef {
  id: PhoneMessageId;
  from: NpcId;
  text: string;
  /** Wird automatisch zugestellt, sobald erfüllt (ohne Angabe nur per Effekt). */
  auto?: Condition;
  /** Antwortmöglichkeiten. */
  replies?: { text: string; effects?: Effect[] }[];
  /** Beim Lesen. */
  effects?: Effect[];
}

// ---------------------------------------------------------------------------
// Spielzustand und Speicherformat (version 2: Charakter-Baukasten; version 1 wird beim Laden migriert)

export interface PlayerState {
  /** Charaktererstellung abgeschlossen. */
  created: boolean;
  name: string;
  /** Gewählte bzw. letzte Vorlage des Baukastens. */
  look: LookId;
  /** Aussehen aus dem Charakter-Baukasten (design.md §3.1a). */
  appearance: PlayerAppearance;
  /** Fertige Spielfigur (z. B. 'vex'): eigenes Laufblatt, Baukasten gesperrt. */
  preset?: PlayerPresetId;
  origin: OriginId;
  /** 1..20 */
  level: number;
  /** Kumulativ. */
  xp: number;
  /** Basiswerte 1..10 (ohne Cyberware). */
  attributes: Record<AttributeId, number>;
  unspentAttr: number;
  perkPoints: number;
  perks: PerkId[];
  cyberware: Partial<Record<CyberSlot, CyberwareId>>;
  equipment: Partial<Record<EquipSlot, ItemId>>;
  hp: number;
  /** Vorübergehende Check-Boni (Effekt `checkBuff`); verfallen nach `untilDay` bzw. beim Verbrauch. */
  checkBuffs?: CheckBuff[];
}

export interface RelationState {
  /** −1000..1000; Herzen = floor(points / 100). */
  points: number;
  met: boolean;
  /** Letzter Tag mit Tagesgespräch (0 = nie). */
  talkedDay: number;
  /** Letzter Geschenktag (0 = nie). */
  giftDay: number;
  /** Woche (floor((Tag − 1) / 7)) und Geschenke in dieser Woche. */
  giftWeek: number;
  giftsThisWeek: number;
  /** Gesehene Herz- und Rivalitätsereignisse. */
  events: HeartEventId[];
}

export interface ClockState {
  /** Spieltag ab 1 (Montag). */
  day: number;
  /** Minuten seit 0:00 des Spieltags: 360 (06:00) … 1560 (02:00 am Folgetag). */
  minutes: number;
}

export interface QuestState {
  status: Exclude<QuestStatus, 'inactive'>;
  /** Erledigte Schritte. */
  steps: string[];
  startedDay: number;
  endedDay?: number;
}

export interface JobOffer {
  /** Eindeutig je Tag, z. B. 'kurier-paket@3#1'. */
  id: string;
  template: JobTemplateId;
  board: JobBoardId;
  /** Index in JobTemplateDef.targets. */
  target: number;
  credits: number;
}

export interface JobState {
  /** Tag, für den `taken` gilt. */
  day: number;
  /** Heute bereits angenommene Angebote (verschwinden von der Tafel). */
  taken: string[];
  active: JobOffer[];
  completed: number;
}

export interface ShopState {
  /** Tag des Bestands; ein neuer Tag füllt auf. */
  day: number;
  sold: Record<ItemId, number>;
}

export interface PhoneEntry { id: PhoneMessageId; day: number; read: boolean; replied?: number }

export interface GameStats {
  checksPassed: number;
  battlesWon: number;
  battlesLost: number;
  giftsGiven: number;
}

export interface GameState {
  version: 2;
  /** Startwert für Aufträge, Wetter, Passanten. */
  seed: number;
  act: ActId;
  map: MapId;
  position: Point;
  facing: Facing;
  player: PlayerState;
  /** Aktive Begleiter (höchstens 2). */
  party: NpcId[];
  recruited: NpcId[];
  credits: number;
  /** −100..100 je Fraktion. */
  reputation: Record<FactionId, number>;
  /** Nur berührte Figuren; fehlend = 0 Punkte. */
  relations: Record<NpcId, RelationState>;
  /** Nur gestartete Quests; fehlend = inaktiv. */
  quests: Record<QuestId, QuestState>;
  /** Gewähltes Ziel im HUD. */
  tracked: QuestId | null;
  jobs: JobState;
  shops: Record<ShopId, ShopState>;
  clock: ClockState;
  flags: Record<string, boolean>;
  inventory: Record<ItemId, number>;
  visited: MapId[];
  /** Gesehene Cutscenes, Hotspots, onEnter-IDs, Check-XP („check:<id>“), Siege („sieg:<id>“). */
  seen: string[];
  /** Gesehene Schlüsselszenen für die Galerie. */
  gallery: CutsceneId[];
  stations: StationId[];
  /** Freigeschaltete Sendungen. */
  news: NewsId[];
  phone: PhoneEntry[];
  stats: GameStats;
  playTimeMs: number;
  ended: boolean;
}

// ---------------------------------------------------------------------------
// Asset-Manifest (game/public/assets/manifest.json, erzeugt von scripts/build_manifest.mjs)

export interface SpriteSheetEntry {
  /** Relativ zu game/public, z. B. 'assets/sprites/raven-walk.png'. */
  file: string;
  frameW: number;
  frameH: number;
  cols: number;
  rows: number;
  /** Fußanker innerhalb einer Zelle, z. B. (64, 120). */
  foot: Point;
  anims?: Record<string, { frames: number[]; fps: number; loop?: boolean }>;
}

export interface AssetManifest {
  schemaVersion: 1;
  /** 'bg-<map>', 'arena-<id>', 'cut-<id>', 'portrait-<id>', 'prop-<id>', 'ui-title' … → Pfad. */
  images: Record<string, string>;
  /** '<id>-walk', '<id>-pose' … */
  sprites: Record<string, SpriteSheetEntry>;
  items: { atlas: string; cell: number; icons: Record<string, number> };
  /** Blurhash-Platzhalter je Bildschlüssel (Plates). */
  blurhash?: Record<string, string>;
}

// ---------------------------------------------------------------------------
// Gesamter Inhalt (content/index.ts exportiert `export const content: GameContent`)

/** Zustand für `?act=` bzw. Debug-Warp. */
export interface ActStart {
  map: MapId;
  entry: string;
  flags?: string[];
  items?: Record<ItemId, number>;
  credits?: number;
  level?: number;
  recruited?: NpcId[];
  party?: NpcId[];
  quests?: Record<QuestId, Exclude<QuestStatus, 'inactive'>>;
  stations?: StationId[];
  relations?: Record<NpcId, number>;
  seen?: string[];
  visited?: MapId[];
  day?: number;
  /** Uhrzeit beim Start in Minuten ab 0:00 (06:00–01:59, z. B. 1200 = 20:00 für die Partynacht). */
  minutes?: number;
}

export interface GameContent {
  /** Kennzeichnung, z. B. Testinhalt. */
  meta: { id: string; title: string; test?: boolean };
  maps: Record<MapId, MapDef>;
  districts: Record<DistrictId, DistrictDef>;
  stations: Record<StationId, StationDef>;
  dialogues: Record<DialogueId, DialogueDef>;
  cutscenes: Record<CutsceneId, CutsceneDef>;
  items: Record<ItemId, ItemDef>;
  npcs: Record<NpcId, NpcDef>;
  checks: Record<CheckId, CheckDef>;
  perks: Record<PerkId, PerkDef>;
  cyberware: Record<CyberwareId, CyberwareDef>;
  origins: Record<OriginId, OriginDef>;
  looks: Record<LookId, LookDef>;
  /** Namen und Palette des Charakter-Baukastens (content/appearance.ts). */
  appearance?: AppearanceTexts;
  /** Fertige Spielfiguren (design.md §3.1b). */
  presets?: Partial<Record<PlayerPresetId, PlayerPresetDef>>;
  factions: Record<FactionId, FactionDef>;
  quests: Record<QuestId, QuestDef>;
  jobs: Record<JobTemplateId, JobTemplateDef>;
  /** Regeln je Auftragstafel (Rang aus Fraktionsruf, Zusatzangebote, Fristen); fehlend = Standardregeln. */
  jobBoards?: Record<JobBoardId, JobBoardDef>;
  shops: Record<ShopId, ShopDef>;
  encounters: Record<EncounterId, EncounterDef>;
  arenas: Record<ArenaId, ArenaDef>;
  enemies: Record<EnemyId, EnemyDef>;
  abilities: Record<AbilityId, AbilityDef>;
  news: Record<NewsId, NewsDef>;
  phone: Record<PhoneMessageId, PhoneMessageDef>;
  /** Romanze-Schalter (content/romance.ts, Standard leer). */
  romance: ReadonlySet<NpcId>;
  actStarts: Partial<Record<ActId, ActStart>>;
  start: {
    map: MapId;
    entry: string;
    cutscene?: CutsceneId;
    credits?: number;
    /** Uhrzeit beim Start, Standard 480 (08:00). */
    minutes?: number;
    items?: Record<ItemId, number>;
  };
  /** Unterschlupf: Aufwachen nach Zusammenbruch, Rückkehr nach Niederlage. */
  home: { map: MapId; entry: string; collapseNotes?: CollapseNote[] };
  /**
   * Tageswechsel-Regeln (nach Schlaf oder Zusammenbruch, Uhr schon auf dem neuen Tag): in ID-Reihenfolge der Teile,
   * `when` mit dem neuen Tag ausgewertet. Zusätzlich fallen Flags mit `heute_` jeden Morgen, `woche_` montags und
   * `zyklus_` an Zyklustag 1 von selbst.
   */
  daily?: Record<string, DailyRuleDef>;
  ending: { cutscenes: CutsceneId[]; epilogue: { when?: Condition; text: string }[] };
}

/** Regel zum Tageswechsel (`GameContent.daily`). */
export interface DailyRuleDef {
  id: string;
  when?: Condition;
  effects: Effect[];
}

// ---------------------------------------------------------------------------
// Ansichten der Kampagnen-Fassade

export interface QuestView {
  quest: QuestDef;
  status: QuestStatus;
  steps: { step: QuestStepDef; done: boolean }[];
}

export interface ObjectiveView {
  quest: QuestId;
  title: string;
  text: string;
  marker?: { map: MapId; at?: Point };
}

/** Wo eine Figur gerade ist (aus Tagesablauf oder fester Platzierung). */
export interface NpcPresence {
  npc: NpcId;
  map: MapId;
  at: Point;
  facing: Facing;
  dialogue?: DialogueId;
  patrol?: Point[];
  pose?: string;
  /** 'schedule' oder die ID der NpcPlacement. */
  source: string;
}

export interface GiftResult {
  ok: boolean;
  taste: GiftTaste | null;
  delta: number;
  message: string;
  outcome: EffectOutcome;
}

export interface CharacterInput {
  name: string;
  /** Gewählte bzw. letzte Vorlage. */
  look: LookId;
  /** Aussehen aus dem Baukasten; fehlt es, gilt die Vorlage `look`. */
  appearance?: PlayerAppearance;
  /** Fertige Spielfigur: Name, Herkunft, Attribute und Perks kommen aus `GameContent.presets`. */
  preset?: PlayerPresetId;
  origin: OriginId;
  /** Endwerte vor Herkunftsbonus (je 3 + verteilte Punkte). */
  attributes: Record<AttributeId, number>;
  /** Gewähltes Bonusattribut, nur bei Herkünften mit `bonusChoice`. */
  originBonus?: AttributeId;
}

export interface PriceView { item: ItemId; buy: number; sell: number; available: number | null; open: boolean }

export interface SaveStoragePort { read(): string | null; write(raw: string): void; clear(): void }

export interface CampaignOptions {
  storage?: SaveStoragePort | null;
  /** 0 ≤ x < 1, für Tests deterministisch. */
  random?: () => number;
  /** Startwert neuer Partien (Standard zufällig). */
  seed?: number;
}

// ---------------------------------------------------------------------------
// Kampagnen-Fassade (modules/campaign, `createCampaign(content, options)`)

export interface CampaignPort {
  readonly content: GameContent;
  state(): Readonly<GameState>;
  subscribe(listener: (state: Readonly<GameState>) => void): () => void;
  evaluate(condition?: Condition): boolean;
  /** Wendet Effekte transaktional an; abgelehnte Effekte verändern nichts. */
  apply(effects: readonly Effect[]): EffectOutcome;

  // Spielfigur
  createCharacter(input: CharacterInput): CampaignResult;
  spendAttribute(attribute: AttributeId): CampaignResult;
  learnPerk(perk: PerkId): CampaignResult;
  equip(item: ItemId): CampaignResult;
  /** Effektiver Attributwert (Basis + Cyberware + Kleidung). */
  attribute(attribute: AttributeId): number;
  maxHp(): number;
  useItem(item: ItemId): CampaignResult;
  /** Ausrüstungsplatz leeren. */
  unequip(slot: EquipSlot): CampaignResult;
  /** Cyberware beim Schrauber einbauen: Teil aus dem Inventar, Gebühr außer bei `ripperdoc.freeWhen`. */
  installCyberwareAt(shop: ShopId, cyberware: CyberwareId): CampaignResult;
  /** Cyberware beim Schrauber ausbauen; das Teil kommt als Gegenstand ins Inventar. */
  removeCyberwareAt(shop: ShopId, slot: CyberSlot): CampaignResult;
  /** Perk-Status (lernbar, Grund, Voraussetzung) oder null bei unbekanntem Perk. */
  perkStatus(perk: PerkId): PerkStatus | null;
  /** Figurbogen: Stufe/XP-Balken, abgeleitete Werte, Cyberware-Plätze, Perks, Modifikatoren. */
  characterSheet(): CharacterSheet;

  // Checks
  evaluateCheck(check: CheckRef): CheckEvaluation;
  /** Bestanden → einmalig XP; nicht bestanden → ok false, nichts ändert sich. */
  passCheck(check: CheckRef): { evaluation: CheckEvaluation; outcome: EffectOutcome };

  // Beziehungen, Crew
  hearts(npc: NpcId): number;
  /** Rivalitätsstufe 0 oder 2..10. */
  rivalry(npc: NpcId): number;
  /** Ansprechen: Tagesbonus +20 und passender Gesprächsdialog. */
  talkTo(npc: NpcId): { dialogue: DialogueId | null; outcome: EffectOutcome };
  giftTaste(npc: NpcId, item: ItemId): GiftTaste;
  giveGift(npc: NpcId, item: ItemId): GiftResult;
  /** Durch Geschenke entdeckter Geschmack einer Figur (Gegenstand → Geschmack, aktuell ausgewertet). */
  knownGiftTastes(npc: NpcId): { item: ItemId; taste: GiftTaste }[];
  setParty(party: readonly NpcId[]): CampaignResult;
  /** Begleiter per Telefon in die Party rufen; die Anfahrt kostet Spielzeit (Standard 30 min). */
  callCompanion(npc: NpcId): CampaignResult;
  /** Beziehungsansicht (Herzen, Fortschritt, Geschenke heute/Woche, nächstes Ereignis, Romanze-Status). */
  relation(npc: NpcId): RelationView;
  /** Wo die Figur gerade ist (Party, Platzierung, Tagesablauf oder unterwegs). */
  whereIs(npc: NpcId): Whereabouts;
  /** Nächstes fälliges Herz-/Rivalitätsereignis auf dieser Karte (oder null). */
  pendingHeartEvent(map: MapId): HeartEventDef | null;
  /** Markiert ein Herz-Ereignis als gesehen und wendet seine Effekte an. */
  completeHeartEvent(id: HeartEventId): EffectOutcome;

  // Zeit und Tagesablauf
  timeSlot(): TimeSlot;
  weekday(): Weekday;
  /** Uhr vorstellen (Erkunden: 1 min je 0,7 s). Um 02:00 bricht die Figur zusammen. */
  advanceClock(minutes: number): EffectOutcome;
  sleep(): EffectOutcome;
  /** Figuren, die jetzt auf dieser Karte sind. */
  presentNpcs(map: MapId): NpcPresence[];

  // Quests und Aufträge
  quests(): QuestView[];
  objective(): ObjectiveView | null;
  track(quest: QuestId | null): void;
  /** Offene Quest-Ziele (alle oder nur auf dieser Karte); das HUD-Ziel ist hervorgehoben. */
  questMarkers(map?: MapId): QuestMarker[];
  jobOffers(board: JobBoardId): JobOffer[];
  /** Tafel-Ansicht: Rang, Angebote mit Lohn, XP und Frist, offene Aufträge. */
  jobBoard(board: JobBoardId): JobBoardView;
  acceptJob(offerId: string): CampaignResult;

  // Handel und Ruf
  prices(shop: ShopId): PriceView[];
  /** Händleransicht: Konditionen, Sortiment, Ankaufsliste, Schließgrund. */
  shopView(shop: ShopId): ShopView | null;
  /** Ankaufspreis eines Inventargegenstands (null: kauft der Händler nicht). */
  sellPrice(shop: ShopId, item: ItemId): number | null;
  buy(shop: ShopId, item: ItemId, qty?: number): CampaignResult;
  sell(shop: ShopId, item: ItemId, qty?: number): CampaignResult;
  /** Ruf und Rufstufe je Fraktion. */
  factionStandings(): FactionStanding[];

  // Kampf
  /** `after`: Nachlauf aus dem Effekt `battle` (win/lose/flee, stay). */
  finishBattle(result: BattleResult, after?: BattleFollowUp): EffectOutcome;
  /** Minispiel abrechnen: gewonnen → `spiel:<key>` gesehen und `win`, sonst `lose`. */
  finishMinigame(request: MinigameRequest, won: boolean): EffectOutcome;

  // Welt
  fastTravel(station: StationId): CampaignResult;
  currentNews(): NewsDef | null;
  /** Hauptmeldung plus täglich wechselnde Kurzmeldungen (optional je Sprecher). */
  newsBulletin(filter?: NewsFilter): NewsBulletin;
  readPhone(id: PhoneMessageId, reply?: number): EffectOutcome;

  // Anzeige
  displayName(speaker: SpeakerId): string;
  /** Manifest-Schlüssel 'portrait-…' oder null (Erzähler). */
  portraitKey(speaker: SpeakerId, variant?: string): string | null;

  // Ort, Verlauf, Speicher
  /** Kartenwechsel kostet `options.minutes` Spielminuten (Standard 10); Laufen auf derselben Karte nichts. */
  setLocation(map: MapId, position: Point, facing: Facing, options?: { minutes?: number }): void;
  markSeen(id: string): void;
  hasSeen(id: string): boolean;
  addPlayTime(ms: number): void;
  newGame(): void;
  warpAct(act: ActId): void;
  exportSave(): string;
  /** false → Zustand unverändert. */
  importSave(raw: string): boolean;
  /** Hinweise zum zuletzt geladenen Stand (z. B. migrierte oder ersetzte Baukasten-Teile). */
  lastImportNotes?(): readonly string[];
}

// ---------------------------------------------------------------------------
// Dialogsitzung (modules/dialogue, `createDialogueSession(campaign, dialogueId)`)

/** Check-Anzeige einer Wahl: „[Technik 6]“, Wert, erfüllt?, fehlende Punkte. */
export interface ChoiceCheckView {
  checkId: CheckId;
  attribute: AttributeId;
  threshold: number;
  value: number;
  ok: boolean;
  missing: number;
  /** „[Technik 6]“ */
  label: string;
  parts: CheckEvaluation['parts'];
}

export interface DialogueChoiceView {
  index: number;
  text: string;
  /** Anzeigepräfix ohne Check, z. B. „[Ödnis]“. */
  tag?: string;
  check?: ChoiceCheckView;
  /** Wählbar? (Check erfüllt bzw. `requires` erfüllt). */
  enabled: boolean;
  /** Tooltip bei gesperrter Wahl („Es fehlen 2 Punkte Technik.“). */
  reason?: string;
}

export interface DialogueView {
  dialogueId: DialogueId;
  nodeId: string;
  /** Zeile mit eingesetztem Namen. */
  line: DialogueLine | null;
  speakerName: string;
  portrait: string | null;
  /** Nur nach der letzten Zeile eines Knotens mit Wahlen. */
  choices: DialogueChoiceView[] | null;
  done: boolean;
}

export interface DialogueSession {
  view(): DialogueView;
  advance(): DialogueView;
  /** Gesperrte Wahlen werden ignoriert. */
  choose(index: number): { view: DialogueView; check?: CheckEvaluation };
  /** Gesammelte Anfragen seit Beginn der Sitzung. */
  outcome(): EffectOutcome;
}

// ---------------------------------------------------------------------------
// Audio (platform/audio, `createAudio(): AudioPort`)

export interface VoiceHandle {
  /** Weich ausblenden und beenden. */
  stop(): void;
  /** Erfüllt, wenn die Zeile zu Ende ist oder gestoppt wurde. */
  readonly ended: Promise<void>;
}

export interface AudioPort {
  /** Nach erster Nutzeraktion. */
  unlock(): void;
  setAmbience(id: AmbienceId | 'title' | 'ending' | 'battle' | null): void;
  /** Lyria-Musikstück (ID aus dem Musikmanifest) mit Überblendung; null = aus. Solange ein Stück läuft, schweigen die prozeduralen Musik-Ambiences (title, ending, battle, club). */
  setMusic(id: string | null, options?: { muffled?: boolean }): void;
  /** Kurzer Stinger (herz-ereignis, quest-stinger, sieg-stinger, nachrichten-jingle); duckt die Musik. */
  stinger(id: string): void;
  /** Hintergrundstimme abspielen (Pfad relativ zu public). gain 0..1, pan −1..1. */
  voice(file: string, options?: { gain?: number; pan?: number }): VoiceHandle | null;
  sfx(id: SfxId): void;
  /** 0..1 */
  setVolumes(volumes: { music: number; sfx: number; voices?: number }): void;
  dispose(): void;
}
