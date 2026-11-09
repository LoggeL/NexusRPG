// node --test scripts/build_manifest.test.mjs
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { buildManifest, mergeFragments, spriteProblems } from './build_manifest.mjs';

const sheet = (file) => ({ file, frameW: 128, frameH: 128, cols: 4, rows: 4, foot: [64, 120] });

test('führt Bilder und Laufblätter zusammen, sortiert und überspringt Bauvorgaben', () => {
  const { manifest, conflicts, errors, used } = mergeFragments([
    { source: 'a.json', data: { images: { 'portrait-b': 'assets/portraits/b.webp' }, sprites: { 'b-walk': sheet('assets/sprites/b-walk.png') } } },
    { source: 'build.json', data: { _info: 'nur Vorgabe', characters: {} } },
    { source: 'agg.json', data: { images: { 'portrait-a': 'assets/portraits/a.webp', 'portrait-b': 'assets/portraits/b.webp' } } },
  ]);
  assert.deepEqual(conflicts, []);
  assert.deepEqual(errors, []);
  assert.deepEqual(used, ['a.json', 'agg.json']);
  assert.deepEqual(Object.keys(manifest.images), ['portrait-a', 'portrait-b']);
  assert.equal(manifest.schemaVersion, 1);
  assert.deepEqual(manifest.items, { atlas: '', cell: 64, icons: {} });
});

test('meldet widersprüchliche Schlüssel und kaputte Laufblätter', () => {
  const { conflicts, errors } = mergeFragments([
    { source: 'a.json', data: { images: { 'bg-x': 'assets/bg/x.webp' } } },
    { source: 'b.json', data: { images: { 'bg-x': 'assets/bg/y.webp' }, sprites: { 'k-walk': { file: 'k.png', frameW: 0 } } } },
  ]);
  assert.equal(conflicts.length, 1);
  assert.match(conflicts[0], /bg-x/);
  assert.ok(errors.some((e) => e.includes('frameW')));
  assert.deepEqual(spriteProblems('ok', sheet('x.png')), []);
});

test('aktualisiert den Blurhash einer ersetzten Tafel und erkennt Konflikte zwischen Fragmenten', () => {
  const base = { blurhash: { tafel: 'vorher', archiv: 'behalten' } };
  const fragment = { source: 'cut.json', data: { images: { tafel: 'tafel.webp' }, blurhash: { tafel: 'neu' } } };
  const { manifest, conflicts } = mergeFragments([fragment], base);
  assert.deepEqual(conflicts, []);
  assert.deepEqual(manifest.blurhash, { archiv: 'behalten', tafel: 'neu' });
  const other = { source: 'other.json', data: { images: {}, blurhash: { tafel: 'anders' } } };
  assert.deepEqual(mergeFragments([fragment, other], base).conflicts, ['Blurhash „tafel“: cut.json ≠ other.json']);
});

test('behält bestehende Itemsymbole und meldet fehlende Dateien', (t) => {
  const root = mkdtempSync(join(tmpdir(), 'nexus-manifest-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const write = (name, value) => { mkdirSync(dirname(join(root, name)), { recursive: true }); writeFileSync(join(root, name), typeof value === 'string' ? value : JSON.stringify(value)); };
  write('design/assets/characters/a.json', { images: { 'portrait-a': 'assets/portraits/a.webp' }, sprites: { 'a-walk': sheet('assets/sprites/a-walk.png') } });
  write('public/assets/portraits/a.webp', 'x');
  write('public/assets/manifest.json', { schemaVersion: 1, images: {}, sprites: {}, items: { atlas: 'assets/items.png', cell: 64, icons: { kaffee: 0 } } });
  const result = buildManifest({ designDir: join(root, 'design/assets'), publicDir: join(root, 'public') });
  assert.deepEqual(result.manifest.items.icons, { kaffee: 0 });
  assert.deepEqual(result.missing.sort(), ['assets/items.png', 'assets/sprites/a-walk.png']);
});
