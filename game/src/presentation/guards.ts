// Kleine, reine Prüfungen für die Ablaufsteuerung (ohne Phaser/DOM, testbar).

/** Nur eigene Schlüssel – `toString`, `__proto__` usw. aus URL oder Spielstand zählen nicht als Inhalt. */
export function hasOwn<T extends object>(record: T, key: string): key is Extract<keyof T, string> {
  return typeof key === 'string' && Object.prototype.hasOwnProperty.call(record, key);
}

/** Spielstand ist eine bereits beendete Partie (Abspann gesehen)? */
export function isEndedSave(raw: string | null): boolean {
  if (!raw) return false;
  try { return (JSON.parse(raw) as { ended?: unknown } | null)?.ended === true; } catch { return false; }
}
