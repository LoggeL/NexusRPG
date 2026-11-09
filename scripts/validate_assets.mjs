#!/usr/bin/env node
// Prüft game/public/assets/manifest.json gegen Dateien und Inhalte.
//
//   node scripts/validate_assets.mjs [--allow-missing] [--json]
//
// - Dateien existieren, PNG-Maße passen (Laufblätter frameW×cols / frameH×rows,
//   Hintergründe und UI-Bilder 640×360, Porträts quadratisch, Cutscenes 16:9).
// - Alle in content referenzierten Schlüssel (bg, cut-*, portrait-*, prop-*, Figuren-Sprites,
//   Itemsymbole) stehen im Manifest.
// --allow-missing: fehlende Schlüssel/Dateien nur als Warnung (Platzhalter greifen zur Laufzeit).
import { existsSync, readFileSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const gameDir = resolve(here, '../game');
const publicDir = resolve(gameDir, 'public');
const manifestPath = resolve(publicDir, 'assets/manifest.json');
const args = new Set(process.argv.slice(2));
const allowMissing = args.has('--allow-missing');
const asJson = args.has('--json');

const errors = [];
const warnings = [];
const missing = (message) => (allowMissing ? warnings : errors).push(message);

function pngSize(file) {
  const buffer = readFileSync(file);
  const signature = '89504e470d0a1a0a';
  if (buffer.length < 24 || buffer.subarray(0, 8).toString('hex') !== signature) return null;
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

function checkFile(key, file) {
  if (typeof file !== 'string' || !file) { errors.push(`${key}: kein Dateipfad`); return null; }
  const path = resolve(publicDir, file.replace(/^\/+/, ''));
  if (!existsSync(path)) { missing(`${key}: Datei fehlt (${file})`); return null; }
  if (!/\.png$/i.test(file)) return { width: 0, height: 0, path };
  const size = pngSize(path);
  if (!size) { errors.push(`${key}: keine gültige PNG-Datei (${file})`); return null; }
  return { ...size, path };
}

if (!existsSync(manifestPath)) {
  console.error(`Manifest fehlt: ${manifestPath}`);
  process.exit(allowMissing ? 0 : 1);
}

let manifest;
try { manifest = JSON.parse(readFileSync(manifestPath, 'utf8')); } catch (error) {
  console.error(`Manifest ist kein gültiges JSON: ${error.message}`);
  process.exit(1);
}
if (manifest.schemaVersion !== 1) errors.push(`schemaVersion ist ${manifest.schemaVersion}, erwartet 1`);
const images = manifest.images ?? {};
const sprites = manifest.sprites ?? {};
const items = manifest.items ?? { atlas: '', cell: 32, icons: {} };

// ---------------------------------------------------------------- Bilder
for (const [key, file] of Object.entries(images)) {
  const size = checkFile(key, file);
  if (!size || !size.width) continue;
  if (/^bg-/.test(key) || key === 'ui-title' || key === 'ui-island-map') {
    if (size.width !== 640 || size.height !== 360) errors.push(`${key}: ${size.width}×${size.height}, erwartet 640×360`);
  } else if (/^portrait-/.test(key)) {
    if (size.width !== size.height) errors.push(`${key}: Porträt nicht quadratisch (${size.width}×${size.height})`);
    else if (size.width < 64) warnings.push(`${key}: Porträt sehr klein (${size.width}px)`);
  } else if (/^cut-/.test(key)) {
    if (Math.abs(size.width / size.height - 16 / 9) > 0.01) errors.push(`${key}: kein 16:9-Format (${size.width}×${size.height})`);
    else if (size.width !== 1280) warnings.push(`${key}: ${size.width}×${size.height}, empfohlen 1280×720`);
    const bytes = statSync(size.path).size;
    if (bytes > 1.2 * 1024 * 1024) warnings.push(`${key}: ${(bytes / 1024 / 1024).toFixed(2)} MB (> 1,2 MB)`);
  }
}

// ---------------------------------------------------------------- Spritesheets
for (const [key, entry] of Object.entries(sprites)) {
  if (!entry || typeof entry !== 'object') { errors.push(`${key}: ungültiger Sprite-Eintrag`); continue; }
  const { frameW, frameH, cols, rows, foot, anims } = entry;
  if (![frameW, frameH, cols, rows].every((n) => Number.isInteger(n) && n > 0)) { errors.push(`${key}: frameW/frameH/cols/rows müssen positive Ganzzahlen sein`); continue; }
  if (!Array.isArray(foot) || foot.length !== 2) errors.push(`${key}: foot [x, y] fehlt`);
  else if (foot[0] < 0 || foot[0] > frameW || foot[1] < 0 || foot[1] > frameH) errors.push(`${key}: Fußanker ${foot} liegt außerhalb der Zelle`);
  const size = checkFile(key, entry.file);
  if (size && size.width && (size.width !== frameW * cols || size.height !== frameH * rows)) {
    errors.push(`${key}: ${size.width}×${size.height}, erwartet ${frameW * cols}×${frameH * rows} (${cols}×${rows} à ${frameW}×${frameH})`);
  }
  if (/-walk$/.test(key) && (cols < 4 || rows < 4)) errors.push(`${key}: Laufblatt braucht 4×4 Zellen (Süd, West, Ost, Nord)`);
  for (const [name, anim] of Object.entries(anims ?? {})) {
    const max = cols * rows;
    if (!Array.isArray(anim.frames) || anim.frames.some((frame) => !Number.isInteger(frame) || frame < 0 || frame >= max)) errors.push(`${key}: Animation „${name}“ verweist auf ungültige Frames`);
    if (!(anim.fps > 0)) errors.push(`${key}: Animation „${name}“ ohne fps`);
  }
}

// ---------------------------------------------------------------- Itematlas
let atlasCells = Infinity;
if (items.atlas) {
  const size = checkFile('items.atlas', items.atlas);
  if (size && size.width) {
    if (size.width % items.cell || size.height % items.cell) errors.push(`items.atlas: ${size.width}×${size.height} ist kein Vielfaches von ${items.cell}`);
    atlasCells = Math.floor(size.width / items.cell) * Math.floor(size.height / items.cell);
  }
} else if (Object.keys(items.icons ?? {}).length) errors.push('items.icons gesetzt, aber items.atlas fehlt');
for (const [icon, index] of Object.entries(items.icons ?? {})) {
  if (!Number.isInteger(index) || index < 0 || index >= atlasCells) errors.push(`items.icons.${icon}: Index ${index} außerhalb des Atlas`);
}

// ---------------------------------------------------------------- Inhalte
async function loadContent() {
  const entry = resolve(gameDir, 'src/content/index.ts');
  if (!existsSync(entry)) return null;
  const require = createRequire(resolve(gameDir, 'package.json'));
  const esbuild = require('esbuild');
  const result = await esbuild.build({ entryPoints: [entry], bundle: true, format: 'esm', platform: 'node', write: false, logLevel: 'silent' });
  const code = result.outputFiles[0].text;
  const module = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
  return module.content ?? module.default ?? null;
}

const canonical = (name, prefix) => (name.startsWith(`${prefix}-`) ? name : `${prefix}-${name}`);
function requireImage(name, prefix, where) {
  if (!name) return;
  if (images[name] || sprites[name]) return;
  const key = canonical(name, prefix);
  if (images[key] || sprites[key]) return;
  missing(`${where}: Bildschlüssel „${key}“ fehlt im Manifest`);
}
function requireSprite(name, where) {
  if (!name) return;
  if (sprites[name] || images[name]) return;
  missing(`${where}: Sprite „${name}“ fehlt im Manifest`);
}

let content = null;
try { content = await loadContent(); } catch (error) { warnings.push(`content/index.ts nicht ladbar: ${error.message.split('\n')[0]}`); }
if (!content) warnings.push('Inhalte fehlen – nur das Manifest wurde geprüft.');
else {
  requireImage('ui-title', 'ui', 'Titel');
  requireImage('ui-city-map', 'ui', 'Stadtkarte');
  for (const map of Object.values(content.maps ?? {})) {
    requireImage(map.bg, 'bg', `Karte ${map.id}`);
    for (const hotspot of map.hotspots ?? []) if (hotspot.prop) requireImage(hotspot.prop, 'prop', `Karte ${map.id}/Hotspot ${hotspot.id}`);
    for (const npc of map.npcs ?? []) {
      // NpcPlacement nennt die Figur `npc` (früher `actor`); Figuren ohne Laufblatt (z. B. KI) haben keins.
      const id = npc.npc ?? npc.actor;
      const def = content.npcs?.[id] ?? content.members?.[id];
      if (npc.pose) requireSprite(`${(def?.sprite ?? `${id}-walk`).replace(/-walk$/, '')}-${npc.pose}`, `Karte ${map.id}/NPC ${npc.id}`);
      else if (def?.sprite || !def) requireSprite(def?.sprite ?? `${id}-walk`, `Karte ${map.id}/NPC ${npc.id}`);
    }
  }
  for (const member of Object.values(content.members ?? {})) {
    requireSprite(member.sprite, `Figur ${member.id}`);
    requireImage(member.portrait, 'portrait', `Figur ${member.id}`);
    for (const variant of member.portraitVariants ?? []) requireImage(variant.portrait, 'portrait', `Figur ${member.id} (Variante)`);
  }
  for (const npc of Object.values(content.npcs ?? {})) {
    requireSprite(npc.sprite, `NPC ${npc.id}`);
    if (npc.portrait) requireImage(npc.portrait, 'portrait', `NPC ${npc.id}`);
  }
  for (const cut of Object.values(content.cutscenes ?? {})) {
    for (const beat of cut.beats ?? []) if (beat.image && beat.image !== 'black') requireImage(beat.image, 'cut', `Cutscene ${cut.id}`);
    for (const beat of cut.beats ?? []) for (const line of beat.lines ?? []) if (line.portrait) requireImage(line.portrait, 'portrait', `Cutscene ${cut.id}`);
  }
  for (const dialogue of Object.values(content.dialogues ?? {})) {
    for (const node of dialogue.nodes ?? []) for (const line of node.lines ?? []) if (line.portrait) requireImage(line.portrait, 'portrait', `Dialog ${dialogue.id}/${node.id}`);
  }
  for (const item of Object.values(content.items ?? {})) {
    if (!(item.icon in (items.icons ?? {}))) missing(`Gegenstand ${item.id}: Itemsymbol „${item.icon}“ fehlt in manifest.items.icons`);
  }
}

if (asJson) console.log(JSON.stringify({ errors, warnings }, null, 2));
else {
  for (const warning of warnings) console.warn(`Warnung: ${warning}`);
  for (const error of errors) console.error(`Fehler: ${error}`);
  console.log(`Assets: ${Object.keys(images).length} Bilder, ${Object.keys(sprites).length} Sprites, ${Object.keys(items.icons ?? {}).length} Itemsymbole – ${errors.length} Fehler, ${warnings.length} Warnungen.`);
}
process.exit(errors.length ? 1 : 0);
