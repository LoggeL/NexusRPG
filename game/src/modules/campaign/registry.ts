// Erweiterungspunkte der Regel-Engine: Handler je Bedingungs- und Effektvariante.
//
// Jede Variante aus `ConditionMap`/`EffectMap` (contracts.ts) hat genau einen Handler in einer Domänendatei unter
// `campaign/domains/`. Die Domänendateien gehören den Fachbereichen (siehe docs/engine-notes.md); conditions.ts und
// effects.ts setzen sie zusammen. Fehlt ein Handler, meldet der Compiler die Lücke.
import type {
  Condition, ConditionKey, ConditionMap, Effect, EffectKey, EffectMap, GameContent, GameState, Request,
} from '../contracts';

/** Zum Auflösen durch die Inhaltsprüfung (lint.ts): Art des Verweises und ID. */
export type RefKind =
  | 'maps' | 'items' | 'npcs' | 'quests' | 'dialogues' | 'cutscenes' | 'checks' | 'perks' | 'cyberware' | 'origins'
  | 'factions' | 'shops' | 'encounters' | 'stations' | 'news' | 'phone' | 'jobs'
  /** `map#entry` */
  | 'entry'
  /** `quest/step` */
  | 'questStep';
export interface Ref { kind: RefKind; id: string }

export interface ConditionContext {
  readonly content: GameContent;
  readonly state: Readonly<GameState>;
  /** Verschachtelte Bedingungen (all/any/not). */
  evaluate(condition?: Condition): boolean;
}

export interface ConditionSpec<K extends ConditionKey> {
  test(condition: ConditionMap[K], ctx: ConditionContext): boolean;
  refs?(condition: ConditionMap[K]): Ref[];
}
export type ConditionSpecs<K extends ConditionKey = ConditionKey> = { [P in K]: ConditionSpec<P> };

export interface EffectContext {
  readonly content: GameContent;
  /** Entwurf des Zustands; wird bei Ablehnung verworfen. */
  readonly draft: GameState;
  readonly requests: Request[];
  readonly messages: string[];
  /** Bedingung gegen den Entwurf auswerten. */
  evaluate(condition?: Condition): boolean;
  /** Weitere Effekte im selben Entwurf (z. B. Questbelohnungen); liefert eine Ablehnung oder null. */
  run(effects: readonly Effect[]): string | null;
  /** Zufall 0 ≤ x < 1 (aus CampaignOptions.random). */
  random(): number;
}

export interface EffectSpec<K extends EffectKey> {
  /** null = angewandt, Text = abgelehnt (der ganze Effektblock verfällt). */
  apply(effect: EffectMap[K], ctx: EffectContext): string | null;
  refs?(effect: EffectMap[K]): Ref[];
}
export type EffectSpecs<K extends EffectKey = EffectKey> = { [P in K]: EffectSpec<P> };

/**
 * Nachlauf nach jeder vollständigen Zustandsänderung (Effekte, Kartenwechsel, Uhrzeit-Wechsel), z. B. Quest-
 * Fortschritt oder automatische Telefonnachrichten. Darf weitere Änderungen am Entwurf vornehmen und meldet, ob sich
 * etwas geändert hat (dann läuft der Nachlauf erneut, höchstens einige Male).
 */
export type SettleHook = (ctx: EffectContext) => boolean;

/** Unterscheidungsschlüssel einer Bedingung bzw. eines Effekts (erster eigener Schlüssel mit Handler). */
export function discriminant(value: object, known: Readonly<Record<string, unknown>>): string | null {
  for (const key of Object.keys(value)) if (Object.prototype.hasOwnProperty.call(known, key)) return key;
  return null;
}
