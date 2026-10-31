import { readFile, access } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
import { runInNewContext } from 'node:vm';
import { spawnSync } from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const needed = new Set(['index.html', '404.html', 'style.css', 'app.js', 'data.js']);
const fail = (message) => { throw new Error(message); };
for (const script of ['app.js', 'data.js']) {
  const result = spawnSync(process.execPath, ['--check', resolve(root, script)], { encoding: 'utf8' });
  if (result.status !== 0) fail(result.stderr);
}
for (const name of ['index.html', '404.html']) {
  const html = await readFile(resolve(root, name), 'utf8');
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
  if (new Set(ids).size !== ids.length) fail(`Duplicate IDs in ${name}`);
  for (const match of html.matchAll(/\b(?:src|href)="([^"]+)"/g)) {
    const target = match[1];
    if (target.startsWith('#')) {
      if (!ids.includes(target.slice(1))) fail(`Missing anchor: ${name} ${target}`);
    } else if (!/^(?:https?:|data:|mailto:)/.test(target)) needed.add(target);
  }
}
const context = { window: {} };
runInNewContext(await readFile(resolve(root, 'data.js'), 'utf8'), context);
const data = context.window.NOFAN_DATA;
function collect(value) {
  if (typeof value === 'string' && value.startsWith('assets/')) needed.add(value);
  else if (Array.isArray(value)) value.forEach(collect);
  else if (value && typeof value === 'object') Object.values(value).forEach(collect);
}
collect(data);
const app = await readFile(resolve(root, 'app.js'), 'utf8');
for (const m of app.matchAll(/file:'(assets\/features\/[^']+\.png)'/g)) {
  needed.add(m[1]); needed.add(m[1].replace('.png', '-detail.png'));
}
for (const name of needed) await access(resolve(root, name));
const manifest = JSON.parse(await readFile(resolve(root, 'docs/assets-manifest.json'), 'utf8'));
for (const item of manifest) {
  const hash = createHash('sha256').update(await readFile(resolve(root, item.file))).digest('hex');
  if (hash !== item.sha256) fail(`Asset changed; update manifest: ${item.file}`);
}
console.log(`OK: ${needed.size} local references, ${manifest.length} asset hashes, ${data.groups.length} emoji groups, ${data.themes.length} theme previews.`);
