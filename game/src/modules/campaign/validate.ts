// Prüfhilfen für das Speicherformat. Domänen nutzen sie in ihren parse…-Funktionen.

export const SAVE_LIMITS = {
  /** Maximale Länge des Rohtexts in Zeichen. */
  chars: 512 * 1024,
  flags: 2000,
  seen: 5000,
  keyLength: 160,
  nameLength: 40,
  playTimeMs: 1e10,
  counter: 1e7,
  day: 100_000,
  phone: 500,
} as const;

const RESERVED_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
// Keine Steuerzeichen, nicht leer.
const SAFE_TEXT = /^[^\u0000-\u001f\u007f]+$/;

export type Obj = Record<string, unknown>;

export class Invalid extends Error {}
export function fail(reason: string): never { throw new Invalid(reason); }

export const isObj = (value: unknown): value is Obj => typeof value === 'object' && value !== null && !Array.isArray(value);
export const isInt = (value: unknown, min: number, max: number): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value >= min && value <= max;
export const isNum = (value: unknown, min: number, max: number): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;
export const isKey = (value: unknown): value is string =>
  typeof value === 'string' && value.length > 0 && value.length <= SAVE_LIMITS.keyLength && SAFE_TEXT.test(value) && !RESERVED_KEYS.has(value);
export const isReserved = (key: string): boolean => RESERVED_KEYS.has(key);

export function obj(value: unknown, label: string): Obj {
  if (!isObj(value)) fail(`Ungültige Angabe: ${label}.`);
  return value as Obj;
}

export function int(value: unknown, min: number, max: number, label: string): number {
  if (!isInt(value, min, max)) fail(`Ungültiger Wert: ${label}.`);
  return value as number;
}

/** Liste ohne Doppelungen, deren Einträge `valid` erfüllen. */
export function uniqueList(value: unknown, max: number, valid: (entry: unknown) => boolean, label: string): string[] {
  if (!Array.isArray(value) || value.length > max) fail(`Ungültige Liste: ${label}.`);
  const list = value as unknown[];
  if (!list.every(valid) || new Set(list).size !== list.length) fail(`Ungültige Einträge: ${label}.`);
  return [...list] as string[];
}

/** Datensatz mit geprüften Schlüsseln und Werten. */
export function record<T>(value: unknown, label: string, key: (k: string) => boolean, entry: (v: unknown, k: string) => T): Record<string, T> {
  const input = obj(value, label);
  const out: Record<string, T> = {};
  for (const [k, v] of Object.entries(input)) {
    if (isReserved(k) || !key(k)) fail(`Unbekannter Eintrag in ${label}: ${k}`);
    out[k] = entry(v, k);
  }
  return out;
}
