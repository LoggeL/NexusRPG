#!/usr/bin/env node
// Baut game/public/assets/manifest.json aus allen Fragmenten unter design/assets/**/*.json.
//
//   node scripts/build_manifest.mjs [--check] [--strict] [--quiet]
//
// - Fragment = JSON-Datei mit Objekt `images` und/oder `sprites` (optional `items`, `blurhash`) auf oberster Ebene.
//   Andere JSON-Dateien (Bauvorgaben wie characters.json, characters-build.json, photos-build/*) werden übersprungen.
// - Gleicher Schlüssel in mehreren Fragmenten ist erlaubt, wenn der Wert gleich ist; sonst Abbruch mit Konfliktliste.
// - Pfade sind relativ zu game/public. Fehlende Dateien sind Warnungen (zur Laufzeit greifen Platzhalter),
//   mit --strict Fehler.
// - --check schreibt nichts und endet mit Code 1, wenn die Datei veraltet ist.
// - `items` aus der bestehenden Manifest-Datei bleibt erhalten, solange kein Fragment eigene Itemsymbole liefert.
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const DEFAULT_ITEMS = { atlas: '', cell: 64, icons: {} };

const isObject = (value) => !!value && typeof value === 'object' && !Array.isArray(value);
const stable = (value) => JSON.stringify(value);
const sortObject = (object) => Object.fromEntries(Object.keys(object).sort().map((key) => [key, object[key]]));

/** Prüft ein Laufblatt; liefert Fehlertexte. */
export function spriteProblems(key, entry) {
  const problems = [];
  if (!isObject(entry)) return [`${key}: kein Objekt`];
  if (typeof entry.file !== 'string' || !entry.file) problems.push(`${key}: file fehlt`);
  for (const field of ['frameW', 'frameH', 'cols', 'rows']) {
    if (!Number.isInteger(entry[field]) || entry[field] <= 0) problems.push(`${key}: ${field} muss eine positive Ganzzahl sein`);
  }
  if (!Array.isArray(entry.foot) || entry.foot.length !== 2 || !entry.foot.every((n) => typeof n === 'number')) problems.push(`${key}: foot muss [x, y] sein`);
  return problems;
}

/**
 * Führt Fragmente zusammen.
 * @param {{ source: string, data: unknown }[]} fragments
 * @param {{ items?: object, blurhash?: object }} [base] bestehende Werte, die Fragmente ergänzen
 */
export function mergeFragments(fragments, base = {}) {
  const images = {};
  const sprites = {};
  const blurhash = { ...(isObject(base.blurhash) ? base.blurhash : {}) };
  let items = isObject(base.items) ? base.items : DEFAULT_ITEMS;
  let itemsSource = null;
  const origin = new Map();
  const conflicts = [];
  const errors = [];
  const used = [];
  const put = (table, kind, key, value, source) => {
    const id = `${kind}:${key}`;
    if (key in table && stable(table[key]) !== stable(value)) {
      conflicts.push(`${kind} „${key}“: ${origin.get(id)} ≠ ${source}`);
      return;
    }
    if (!(key in table)) origin.set(id, source);
    table[key] = value;
  };
  for (const { source, data } of fragments) {
    if (!isObject(data) || (!isObject(data.images) && !isObject(data.sprites))) continue;
    used.push(source);
    for (const [key, file] of Object.entries(data.images ?? {})) {
      if (typeof file !== 'string' || !file) { errors.push(`${source}: Bild ${key} ohne Pfad`); continue; }
      put(images, 'Bild', key, file, source);
    }
    for (const [key, entry] of Object.entries(data.sprites ?? {})) {
      const problems = spriteProblems(key, entry);
      if (problems.length) { errors.push(...problems.map((problem) => `${source}: ${problem}`)); continue; }
      put(sprites, 'Laufblatt', key, entry, source);
    }
    if (isObject(data.blurhash)) for (const [key, hash] of Object.entries(data.blurhash)) if (typeof hash === 'string') put(blurhash, 'Blurhash', key, hash, source);
    if (isObject(data.items)) {
      if (itemsSource && stable(items) !== stable(data.items)) conflicts.push(`items: ${itemsSource} ≠ ${source}`);
      items = data.items;
      itemsSource = source;
    }
  }
  const manifest = { schemaVersion: 1, images: sortObject(images), sprites: sortObject(sprites), items };
  if (Object.keys(blurhash).length) manifest.blurhash = sortObject(blurhash);
  return { manifest, conflicts, errors, used };
}

function walk(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name))
    .flatMap((entry) => (entry.isDirectory() ? walk(resolve(dir, entry.name)) : entry.name.endsWith('.json') ? [resolve(dir, entry.name)] : []));
}

/** Liest Fragmente, führt zusammen und meldet fehlende Dateien. */
export function buildManifest({ designDir = resolve(root, 'design/assets'), publicDir = resolve(root, 'game/public') } = {}) {
  const fragments = [];
  const errors = [];
  for (const file of walk(designDir)) {
    const source = relative(root, file);
    try { fragments.push({ source, data: JSON.parse(readFileSync(file, 'utf8')) }); }
    catch (error) { errors.push(`${source}: kein gültiges JSON (${error.message})`); }
  }
  const outFile = resolve(publicDir, 'assets/manifest.json');
  let base = {};
  if (existsSync(outFile)) {
    try { base = JSON.parse(readFileSync(outFile, 'utf8')); } catch { base = {}; }
  }
  const result = mergeFragments(fragments, { items: base.items, blurhash: base.blurhash });
  const missing = [];
  const files = [...Object.values(result.manifest.images), ...Object.values(result.manifest.sprites).map((entry) => entry.file)];
  if (result.manifest.items.atlas) files.push(result.manifest.items.atlas);
  for (const file of files) if (!/^(data:|https?:)/.test(file) && !existsSync(resolve(publicDir, file))) missing.push(file);
  return { ...result, errors: [...errors, ...result.errors], missing, outFile };
}

function main() {
  const args = new Set(process.argv.slice(2));
  const result = buildManifest();
  const say = (text) => { if (!args.has('--quiet')) console.log(text); };
  for (const problem of result.errors) console.error(`Fehler: ${problem}`);
  for (const conflict of result.conflicts) console.error(`Konflikt: ${conflict}`);
  for (const file of result.missing) (args.has('--strict') ? console.error : console.warn)(`${args.has('--strict') ? 'Fehler' : 'Warnung'}: Datei fehlt: ${file}`);
  if (result.errors.length || result.conflicts.length || (args.has('--strict') && result.missing.length)) process.exit(1);
  const text = `${JSON.stringify(result.manifest, null, 2)}\n`;
  const current = existsSync(result.outFile) ? readFileSync(result.outFile, 'utf8') : '';
  const summary = `${Object.keys(result.manifest.images).length} Bilder, ${Object.keys(result.manifest.sprites).length} Laufblätter aus ${result.used.length} Fragmenten`;
  if (args.has('--check')) {
    if (current !== text) { console.error(`Veraltet: ${relative(root, result.outFile)} (node scripts/build_manifest.mjs ausführen)`); process.exit(1); }
    say(`Aktuell: ${summary}.`);
    return;
  }
  if (current === text) { say(`Unverändert: ${summary}.`); return; }
  writeFileSync(result.outFile, text);
  say(`Geschrieben: ${relative(root, result.outFile)} – ${summary}.`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
