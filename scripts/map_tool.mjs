#!/usr/bin/env node
// Kartenwerkzeug ohne Browser: Erreichbarkeit prüfen und Vorschau mit Geometrie zeichnen.
//   node scripts/map_tool.mjs <mapId|all> [--flags=a,b] [--no-render]
// Ausgabe: output/qa/maps/<mapId>.png (2×, Raster, Polygone, Sprites/Requisiten an ihren Positionen)
//          output/qa/maps/<mapId>.json (Geometrie + Erreichbarkeitsbefunde)
// Exit-Code 1, wenn ein Einstieg nicht begehbar ist oder etwas unerreichbar bleibt.
import { build } from '../game/node_modules/esbuild/lib/main.js';
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'output/qa/maps');
const TMP = join(ROOT, 'output/qa/.map_tool');
mkdirSync(OUT, { recursive: true });
mkdirSync(TMP, { recursive: true });

const entry = join(TMP, 'entry.ts');
writeFileSync(entry, `export { content } from '${join(ROOT, 'game/src/content/index.ts')}';
export * as nav from '${join(ROOT, 'game/src/modules/navigation/index.ts')}';\n`);
const bundle = join(TMP, `bundle-${process.pid}.mjs`);
await build({ entryPoints: [entry], bundle: true, format: 'esm', platform: 'node', outfile: bundle, logLevel: 'error' });
const { content, nav } = await import(pathToFileURL(bundle).href);
rmSync(bundle);

const args = process.argv.slice(2);
const target = args.find(a => !a.startsWith('--')) ?? 'all';
const render = !args.includes('--no-render');
const ids = target === 'all' ? Object.keys(content.maps) : [target];
const manifest = JSON.parse((await import('node:fs')).readFileSync(join(ROOT, 'game/public/assets/manifest.json'), 'utf8'));

const FOOT = { foot: 4 };
let failed = false;

function rectCenter([x, y, w, h]) { return [x + w / 2, y + h / 2]; }
function reaches(area, from, to) {
  if (Math.hypot(from[0] - to[0], from[1] - to[1]) <= 6) return true;
  const path = nav.findPath(area, from, to, FOOT);
  if (!path || !path.length) return false;
  const last = path[path.length - 1];
  return Math.hypot(last[0] - to[0], last[1] - to[1]) <= 6;
}
function reachableNear(navigation, area, from, point, radius) {
  // Erreichbar, wenn ein begehbarer Punkt im Radius per Pfad erreichbar ist.
  const candidates = [point];
  for (let r = 4; r <= radius; r += 4) for (let a = 0; a < 16; a++) {
    candidates.push([point[0] + Math.cos(a * Math.PI / 8) * r, point[1] + Math.sin(a * Math.PI / 8) * r]);
  }
  for (const c of candidates) {
    if (!nav.isWalkable(area, c, FOOT)) continue;
    if (reaches(area, from, c)) return c;
  }
  return null;
}
function exitReachable(area, from, rect) {
  const [x, y, w, h] = rect;
  for (let px = x; px <= x + w; px += 2) for (let py = y; py <= y + h; py += 2) {
    if (!nav.isWalkable(area, [px, py], FOOT)) continue;
    if (reaches(area, from, [px, py])) return [px, py];
  }
  return null;
}

for (const id of ids) {
  const map = content.maps[id];
  if (!map) { console.error(`Unbekannte Karte: ${id}`); failed = true; continue; }
  const area = { walk: map.walk, block: map.block ?? [] };
  const problems = [];
  const entries = Object.entries(map.entries);
  for (const [name, e] of entries) {
    if (!nav.isWalkable(area, e.at, FOOT)) problems.push(`Einstieg '${name}' ${JSON.stringify(e.at)} nicht begehbar`);
  }
  const start = entries.find(([, e]) => nav.isWalkable(area, e.at, FOOT))?.[1].at;
  if (start) {
    for (const [name, e] of entries) {
      if (nav.isWalkable(area, e.at, FOOT) && !reaches(area, start, e.at)) problems.push(`Einstieg '${name}' vom Einstieg '${entries[0][0]}' nicht erreichbar`);
    }
    for (const h of map.hotspots) {
      if (!reachableNear(null, area, start, h.at, h.radius ?? 28)) problems.push(`Hotspot '${h.id}' ${JSON.stringify(h.at)} unerreichbar (Radius ${h.radius ?? 28})`);
    }
    for (const n of map.npcs ?? []) {
      if (n.pose) continue; // liegende/schlafende Figuren werden über Hotspots/Radius bedient
      if (!reachableNear(null, area, start, n.at, 32)) problems.push(`NPC '${n.id}' ${JSON.stringify(n.at)} unerreichbar`);
      for (const p of n.patrol ?? []) if (!nav.isWalkable(area, p, FOOT)) problems.push(`NPC '${n.id}' Patrouillenpunkt ${JSON.stringify(p)} nicht begehbar`);
    }
    for (const x of map.exits) {
      if (!exitReachable(area, start, x.rect)) problems.push(`Ausgang '${x.id}' ${JSON.stringify(x.rect)} nicht betretbar/erreichbar`);
    }
  } else problems.push('kein begehbarer Einstieg');
  // Fremde Einstiege, die auf diese Karte zeigen, müssen existieren.
  for (const other of Object.values(content.maps)) for (const x of other.exits) {
    if (x.to === id && !map.entries[x.entry]) problems.push(`Ausgang ${other.id}.${x.id} zeigt auf fehlenden Einstieg '${x.entry}'`);
  }
  const report = { id, name: map.name, problems, bg: manifest.images[map.bg], geometry: {
    walk: map.walk, block: map.block ?? [], exits: map.exits.map(x => ({ id: x.id, rect: x.rect, to: x.to, label: x.label, interact: !!x.interact })),
    entries: map.entries, foreground: map.foreground ?? [],
    hotspots: map.hotspots.map(h => ({ id: h.id, at: h.at, radius: h.radius ?? 28, label: h.label, prop: h.prop ?? null })),
    npcs: (map.npcs ?? []).map(n => ({ id: n.id, actor: n.actor, at: n.at, facing: n.facing ?? 's', pose: n.pose ?? null, patrol: n.patrol ?? null })),
  } };
  writeFileSync(join(OUT, `${id}.json`), JSON.stringify(report, null, 1));
  if (render) execFileSync('python3', [join(ROOT, 'scripts/map_overlay.py'), join(OUT, `${id}.json`), join(OUT, `${id}.png`)], { stdio: 'inherit' });
  console.log(`${problems.length ? '✗' : '✓'} ${id}${problems.length ? '\n  - ' + problems.join('\n  - ') : ''}`);
  if (problems.length) failed = true;
}
process.exit(failed ? 1 : 0);
