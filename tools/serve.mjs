import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, dirname, extname, sep, relative as relativePath } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const port = Number(process.env.PORT || 4173);
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg' };
const allowed = new Set(['index.html', '404.html', 'style.css', 'app.js', 'data.js']);
createServer(async (req, res) => {
  try {
    if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405, { Allow: 'GET, HEAD' }).end(); return; }
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const relative = pathname === '/' ? 'index.html' : pathname.slice(1);
    let file = resolve(root, relative);
    const inside = file.startsWith(root + sep);
    const normalized = relativePath(root, file).split(sep).join('/');
    const isPublicFile = allowed.has(normalized) || normalized.startsWith('assets/');
    let code = 200;
    if (!inside || !isPublicFile || !(await stat(file).catch(() => null))?.isFile()) { file = resolve(root, '404.html'); code = 404; }
    const body = await readFile(file);
    res.writeHead(code, { 'Content-Type': types[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch { res.writeHead(400).end('Bad request'); }
}).listen(port, '127.0.0.1', () => console.log(`nofan homepage: http://127.0.0.1:${port}`));
