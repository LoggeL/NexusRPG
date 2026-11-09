#!/usr/bin/env node
// Schreibt alle Gegenstände (id, name, category, icon, description, tags) nach design/assets/icons/items.dump.json.
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const gameDir = resolve(root, 'game');
const require = createRequire(resolve(gameDir, 'package.json'));
const esbuild = require('esbuild');
const result = await esbuild.build({ entryPoints: [resolve(gameDir, 'src/content/index.ts')], bundle: true, format: 'esm', platform: 'node', write: false, logLevel: 'silent' });
const module = await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`);
const content = module.content ?? module.default;
const items = Object.values(content.items).map((i) => ({ id: i.id, name: i.name, category: i.category, icon: i.icon, slot: i.slot, description: i.description, tags: i.giftTags ?? i.tags }));
const out = resolve(root, 'output/icons/items.dump.json');
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(items, null, 1));
const icons = new Set(items.map((i) => i.icon));
console.log(`${items.length} Gegenstände, ${icons.size} Symbole → ${out}`);
