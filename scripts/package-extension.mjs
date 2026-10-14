import { execFileSync } from 'node:child_process';
import { copyFile, cp, mkdir, readFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const name = 'YouTube Comments Closed';
const dist = path.join(root, 'dist');
const folder = path.join(dist, name);
const archive = path.join(dist, `${name}.zip`);
const manifest = JSON.parse(await readFile(path.join(root, 'extension', 'manifest.json'), 'utf8'));
const storeArchive = path.join(dist, `youtube-comments-closed-${manifest.version}-webstore.zip`);

await rm(folder, { recursive: true, force: true });
await rm(archive, { force: true });
await mkdir(folder, { recursive: true });
for (const file of ['manifest.json', 'content.js', 'content.css', 'INSTALL.txt']) {
  await copyFile(path.join(root, 'extension', file), path.join(folder, file));
}
await copyFile(path.join(root, 'LICENSE'), path.join(folder, 'LICENSE'));
await cp(path.join(root, 'extension', 'icons'), path.join(folder, 'icons'), { recursive: true });
execFileSync('zip', ['-q', '-r', archive, name], { cwd: dist });
await rm(storeArchive, { force: true });
execFileSync('zip', ['-q', '-r', storeArchive, 'manifest.json', 'content.js', 'content.css', 'icons', 'LICENSE'], { cwd: folder });
console.log(`Extension folder: ${folder}\nZIP: ${archive}\nWeb Store ZIP: ${storeArchive}`);
