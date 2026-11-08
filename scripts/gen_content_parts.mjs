#!/usr/bin/env node
// Erzeugt game/src/content/parts/index.ts aus allen Dateien unter content/parts/** (ohne Tests).
// Deterministisch (sortiert); paralleles Ausführen schreibt dasselbe Ergebnis.
import { readdirSync, readFileSync, writeFileSync, existsSync, renameSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = join(dirname(fileURLToPath(import.meta.url)), '../game/src/content/parts');
const files = [];
(function walk(d) {
  for (const e of readdirSync(d, { withFileTypes: true })) {
    const p = join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.ts$/.test(e.name) && !/\.test\.ts$/.test(e.name) && p !== join(dir, 'index.ts')) files.push(p);
  }
})(dir);
const rel = files.map((f) => relative(dir, f).replace(/\.ts$/, '').split('\\').join('/')).sort();
const withPart = rel.filter((r) => /export const part\b/.test(readFileSync(join(dir, r + '.ts'), 'utf8')));
const lines = [
  '// ERZEUGT von scripts/gen_content_parts.mjs – nicht von Hand ändern.',
  "import type { ContentPart } from '../part';",
  ...withPart.map((r, i) => `import { part as p${i} } from './${r}';`),
  '',
  'export const PARTS: readonly (readonly [string, ContentPart])[] = [',
  ...withPart.map((r, i) => `  ['${r}', p${i}],`),
  '];',
  '',
];
const out = join(dir, 'index.ts');
const text = lines.join('\n');
if (!existsSync(out) || readFileSync(out, 'utf8') !== text) {
  const tmp = `${out}.${process.pid}.tmp`;
  writeFileSync(tmp, text);
  renameSync(tmp, out);
}
console.log(`gen_content_parts: ${withPart.length} Teile`);
