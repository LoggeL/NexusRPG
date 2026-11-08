// node --test scripts/check_architecture.test.mjs
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { checkArchitecture, formatDiagnostic, isTestPath, layerOf } from './check_architecture.mjs';

function fixture(t, files) {
  const root = mkdtempSync(join(tmpdir(), 'insel-architecture-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  for (const [name, source] of Object.entries(files)) {
    mkdirSync(dirname(join(root, name)), { recursive: true });
    writeFileSync(join(root, name), source);
  }
  return root;
}

const rules = diagnostics => diagnostics.map(d => `${d.path}:${d.rule}`);

test('erlaubt die vorgesehenen Abhängigkeiten', t => {
  const root = fixture(t, {
    'modules/contracts.ts': 'export interface State { flags: Record<string, boolean> }\nexport type Request = { a: 1 };',
    'modules/campaign/index.ts': "import type { State, Request } from '../contracts';\nexport const ready = (s: State): Request | null => (s.flags.ready ? { a: 1 } : null);\nexport const roll = () => Math.random();",
    'content/index.ts': "import type { State } from '../modules/contracts';\nimport { type Request } from '../modules/contracts';\nimport { maps } from './maps';\nexport type { State } from '../modules/contracts';\nexport const content: State = { flags: maps };\nexport type R = Request;",
    'content/maps.ts': 'export const maps = { ready: true };',
    'platform/storage.ts': "import { ready } from '../modules/campaign';\nimport { other } from './other';\nexport const read = () => window.localStorage.getItem('x') ?? ready({ flags: other });",
    'platform/other.ts': 'export const other = {};',
    'presentation/phaser/scene.ts': "import Phaser from 'phaser';\nimport { content } from '../../content';\nimport { read } from '../../platform/storage';\nimport '../../styles/main.css';\nexport const s = [Phaser, content, read];",
    'styles/main.css': 'body { color: red; }',
    'app/main.ts': "import { s } from '../presentation/phaser/scene';\nexport default s;",
    'main.ts': "import app from './app/main';\nexport default app;",
    'vite-env.d.ts': '/// <reference types="vite/client" />',
    'modules/campaign/campaign.test.ts': "import { content } from '../../content';\nimport { s } from '../../presentation/phaser/scene';\nconsole.log(content, s, window);",
    'modules/__fixtures__/content.ts': "import { content } from '../../content';\nexport const fixture = { content, at: document };",
  });
  assert.deepEqual(checkArchitecture(root), []);
});

test('meldet Grenzverletzungen mit Datei:Zeile:Spalte', t => {
  const root = fixture(t, {
    'modules/contracts.ts': 'export interface State { x: number }',
    'modules/bad.ts': "import type { Scene } from 'phaser';\nimport { content } from '../content/index';\nexport const read = () => window.localStorage.getItem('save');\n  fetch('/save');",
    'content/index.ts': "import { State } from '../modules/contracts';\nimport { read } from '../platform/storage';\nexport const content: State = { x: read() };",
    'platform/storage.ts': "import { scene } from '../presentation/scene';\nexport const read = () => scene;",
    'presentation/scene.ts': "import { boot } from '../app/boot';\nimport { main } from '../main';\nexport const scene = [boot, main];",
    'app/boot.ts': 'export const boot = 1;',
    'main.ts': 'export const main = 1;',
  });
  const diagnostics = checkArchitecture(root);
  assert.deepEqual(rules(diagnostics), [
    'content/index.ts:content-types',
    'content/index.ts:content-boundary',
    'modules/bad.ts:external-import',
    'modules/bad.ts:module-boundary',
    'modules/bad.ts:pure-code',
    'modules/bad.ts:pure-code',
    'platform/storage.ts:platform-boundary',
    'presentation/scene.ts:presentation-boundary',
    'presentation/scene.ts:presentation-boundary',
  ]);
  const fetchHit = diagnostics.find(d => d.path === 'modules/bad.ts' && d.line === 4);
  assert.equal(formatDiagnostic(fetchHit, 'src/'), 'src/modules/bad.ts:4:3 [pure-code] modules darf das Laufzeit-/DOM-/IO-Global „fetch“ nicht verwenden.');
  assert.match(formatDiagnostic(diagnostics[0]), /^content\/index\.ts:1:1 \[content-types\]/);
  assert.deepEqual(checkArchitecture(root), diagnostics, 'deterministisch');
});

test('Produktionscode darf keine Tests oder Fixtures importieren', t => {
  const root = fixture(t, {
    'modules/a.ts': "import { x } from './a.test';\nimport { f } from './__fixtures__/data';\nexport const y = [x, f];",
    'modules/a.test.ts': 'export const x = 1;',
    'modules/__fixtures__/data.ts': 'export const f = 1;',
    'presentation/b.ts': "import { x } from '../modules/a.test';\nexport const z = x;",
  });
  assert.deepEqual(rules(checkArchitecture(root)), [
    'modules/a.ts:test-import', 'modules/a.ts:test-import', 'presentation/b.ts:test-import',
  ]);
});

test('erkennt Re-Exporte, Import-Typen, dynamische Importe und ignoriert Kommentare/Strings', t => {
  const root = fixture(t, {
    'presentation/view.ts': 'export interface View { a: number }\nexport const view = 1;',
    'modules/bad.ts': [
      "// import '../presentation/view';",
      'const text = "window.fetch()";',
      "export type { View } from '../presentation/view';",
      "type Hidden = import('../presentation/view').View;",
      "const load = () => import('../presentation/view');",
      'const dynamic = (path: string) => import(path);',
      'export const all = [text, load, dynamic] as unknown as Hidden;',
    ].join('\n'),
  });
  assert.deepEqual(checkArchitecture(root).map(d => `${d.line}:${d.rule}`), [
    '3:module-boundary', '4:module-boundary', '5:module-boundary', '5:pure-load', '6:dynamic-import', '6:pure-load',
  ]);
});

test('lokale Namen und Typpositionen sind keine Globals; unbekannte Schichten und fehlende Pfade', t => {
  const root = fixture(t, {
    'modules/ok.ts': [
      "import type { Request } from './types';",
      'export const make = (location: string): Request => ({ location });',
      'export interface Box { node: Node }',
      'export const obj = { window: 1, history: [] as string[] };',
      'export const read = (o: { document: number }) => o.document;',
    ].join('\n'),
    'modules/types.ts': 'export type Request = { location: string };',
    'modules/bad.ts': "import './missing';\nexport class Bus extends EventTarget {}\nexport const t = globalThis.setTimeout;",
    'helpers/util.ts': 'export const u = 1;',
    'content/asset.ts': "import '../styles/x.css';",
    'styles/x.css': '',
  });
  assert.deepEqual(rules(checkArchitecture(root)), [
    'content/asset.ts:asset-import',
    'helpers/util.ts:unknown-layer',
    'modules/bad.ts:unresolved-import',
    'modules/bad.ts:pure-code',
    'modules/bad.ts:pure-code',
  ]);
});

test('Hilfsfunktionen', () => {
  assert.equal(layerOf('main.ts'), 'app');
  assert.equal(layerOf('presentation/dom/hud.ts'), 'presentation');
  assert.ok(isTestPath('modules/a.test.ts'));
  assert.ok(isTestPath('modules/__fixtures__/content.ts'));
  assert.ok(!isTestPath('modules/campaign/index.ts'));
});
