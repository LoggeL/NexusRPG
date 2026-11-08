#!/usr/bin/env node
// Prüft, dass keine Darstellernamen in versionierten Dateien stehen (AGENTS.md: nur Rollennamen).
// Die Namensliste kommt zur Laufzeit aus dem privaten work/ (nie in Git); fehlt work/, wird übersprungen.
// Aufruf: node scripts/check_names.mjs [--staged]
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const refs = join(root, 'work/char_refs.json');
if (!existsSync(refs)) { console.log('check_names: work/ fehlt, übersprungen'); process.exit(0); }

const names = new Set();
for (const [k, v] of Object.entries(JSON.parse(readFileSync(refs, 'utf8')))) {
  if (!k.startsWith('_') && typeof v === 'string') names.add(v.toLowerCase());
}
const refDir = join(root, 'work/refs');
if (existsSync(refDir)) {
  for (const f of readdirSync(refDir)) {
    const m = /^character-([a-zäöüß]+)--/i.exec(f);
    if (m) names.add(m[1].toLowerCase());
  }
}
if (!names.size) { console.log('check_names: keine Namen gefunden'); process.exit(0); }

const args = process.argv.includes('--staged') ? ['diff', '--cached', '--name-only'] : ['ls-files', '-co', '--exclude-standard'];
const files = execFileSync('git', args, { cwd: root, encoding: 'utf8' }).split('\n').filter(Boolean);
const textExt = /\.(ts|tsx|js|mjs|cjs|json|md|txt|html|css|py|sh|yml|yaml|conf|svg)$/i;
// Eigennamen: großgeschrieben als ganzes Wort ("Name" oder "NAME") – so trifft es keine Code-Bezeichner
// wie max/min. Dazu jede Schreibweise in Referenz-Dateinamen (character-<name>--).
const cap = (n) => n[0].toUpperCase() + n.slice(1);
const alt = [...names].flatMap((n) => [cap(n), n.toUpperCase()]).join('|');
const reName = new RegExp(`(^|[^A-Za-zÄÖÜäöüß0-9_])(${alt})(?![A-Za-zÄÖÜäöüß0-9_])`);
const reRef = new RegExp(`character-(${[...names].join('|')})--`, 'i');
const re = { test: (s) => reName.test(s) || reRef.test(s) };
const hits = [];
for (const f of files) {
  const p = join(root, f);
  if (re.test(f)) hits.push(`${f}: Dateiname`);
  if (!textExt.test(f) || !existsSync(p)) continue;
  readFileSync(p, 'utf8').split('\n').forEach((line, i) => {
    if (re.test(line)) hits.push(`${f}:${i + 1}`);
  });
}
if (hits.length) {
  console.error(`check_names: ${hits.length} Treffer (Darstellernamen in versionierten Dateien):`);
  for (const h of hits.slice(0, 200)) console.error('  ' + h);
  process.exit(1);
}
console.log(`check_names: ok (${files.length} Dateien, ${names.size} Namen)`);
