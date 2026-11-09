import { createHash } from 'node:crypto';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'game/dist');

async function commitId() {
  if (process.env.RELEASE_COMMIT) return process.env.RELEASE_COMMIT;
  try {
    const head = (await readFile(path.join(root, '.git/HEAD'), 'utf8')).trim();
    if (!head.startsWith('ref: ')) return head;
    const ref = head.slice(5);
    if (!/^refs\/heads\/[\w./-]+$/.test(ref)) throw new Error('Unsupported Git ref');
    try {
      return (await readFile(path.join(root, '.git', ref), 'utf8')).trim();
    } catch {
      const packed = await readFile(path.join(root, '.git/packed-refs'), 'utf8');
      return packed.split('\n').find((line) => line.endsWith(` ${ref}`))?.split(' ')[0];
    }
  } catch {
    return 'local-uncommitted';
  }
}

async function collect(directory, prefix = '') {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const name = path.posix.join(prefix, entry.name);
    if (name === 'release.json') continue;
    if (entry.isDirectory()) files.push(...await collect(path.join(directory, entry.name), name));
    else if (entry.isFile()) {
      const bytes = await readFile(path.join(directory, entry.name));
      files.push({ path: name, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') });
    }
  }
  return files.sort((a, b) => a.path.localeCompare(b.path, 'en'));
}

const commit = await commitId();
if (process.env.RELEASE_REQUIRE_COMMIT === '1' && commit === 'local-uncommitted') {
  throw new Error('Production release requires Git commit metadata');
}
if (commit !== 'local-uncommitted' && !/^[a-f0-9]{40}$/.test(commit ?? '')) {
  throw new Error('Release commit must be a full Git SHA');
}
const files = await collect(dist);
if (!files.some((file) => file.path === 'index.html')) throw new Error('Build has no index.html');
const artifactSha256 = createHash('sha256').update(JSON.stringify(files)).digest('hex');
await writeFile(path.join(dist, 'release.json'), `${JSON.stringify({
  schemaVersion: 1, application: 'NexusRPG', commit, artifactSha256, files,
}, null, 2)}\n`);
console.log(`Release ${commit}: ${files.length} files, artifact ${artifactSha256}`);
