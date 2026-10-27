import { readdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export default async function handler(req, res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    res.statusCode = 405;
    return res.end(JSON.stringify({ error: 'Method not allowed.' }));
  }
  const cwd = process.cwd();
  const dir = dirname(fileURLToPath(import.meta.url));
  const cwdFiles = await readdir(cwd).catch((e) => e.message);
  const srcFiles = await readdir(resolve(cwd, 'src')).catch((e) => e.message);
  const dirFiles = await readdir(dir).catch((e) => e.message);
  res.statusCode = 200;
  return res.end(
    req.method === 'HEAD'
      ? undefined
      : JSON.stringify({
          status: 'ok',
          cwd,
          dir,
          cwdFiles,
          srcFiles,
          dirFiles
        })
  );
}
