import { randomUUID } from 'node:crypto';
import { mkdir, writeFile, readdir, stat, unlink } from 'node:fs/promises';
import { resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { validateInquiry } from '../server.js';

const dataDir = process.env.INQUIRY_DATA_DIR || resolve(tmpdir(), 'aventrixx-inquiries');
const attempts = new Map();
const rateLimit = 5;
const retentionMs = 365 * 24 * 60 * 60 * 1000;
let lastSweep = 0;

async function sweep() {
  try {
    const now = Date.now();
    if (now - lastSweep < 24 * 60 * 60 * 1000) return;
    await mkdir(dataDir, { recursive: true, mode: 0o700 });
    const files = await readdir(dataDir);
    await Promise.all(
      files
        .filter((f) => f.endsWith('.json'))
        .map(async (f) => {
          const path = resolve(dataDir, f);
          const s = await stat(path);
          if (now - s.mtimeMs > retentionMs) await unlink(path);
        })
    );
    lastSweep = now;
  } catch {
    // Non-fatal if sweep fails in restricted serverless environment
  }
}

export default async function handler(req, res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'"
  );

  const json = (status, body) => {
    res.writeHead(status, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store'
    });
    res.end(JSON.stringify(body));
  };

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return json(405, { error: 'Method not allowed.' });
  }

  if (req.headers.origin) {
    let origin;
    try {
      origin = new URL(req.headers.origin);
    } catch {
      return json(403, { error: 'This request origin is not allowed.' });
    }
    if (origin.host !== req.headers.host) {
      return json(403, { error: 'This request origin is not allowed.' });
    }
  }

  const contentType = (req.headers['content-type'] || '').split(';')[0];
  if (!['application/json', 'application/x-www-form-urlencoded'].includes(contentType)) {
    return json(415, { error: 'Please submit the inquiry form.' });
  }

  if (Number(req.headers['content-length']) > 20000) {
    return json(413, { error: 'The inquiry is too large.' });
  }

  const now = Date.now();
  const forwarded = req.headers['x-forwarded-for'];
  const address =
    (typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : null) ||
    req.socket?.remoteAddress ||
    'unknown';

  for (const [key, value] of attempts) {
    if (now - value.start > 15 * 60 * 1000) attempts.delete(key);
  }
  const current = attempts.get(address) || { start: now, count: 0 };
  current.count++;
  attempts.set(address, current);

  if (current.count > rateLimit) {
    res.setHeader('Retry-After', String(Math.ceil((current.start + 15 * 60 * 1000 - now) / 1000)));
    return json(429, { error: 'Too many submissions. Please try again in 15 minutes.' });
  }

  let data;
  if (req.body && typeof req.body === 'object') {
    data = req.body;
  } else if (typeof req.body === 'string' && req.body.length > 0) {
    try {
      data =
        contentType === 'application/json'
          ? JSON.parse(req.body)
          : Object.fromEntries(new URLSearchParams(req.body));
    } catch {
      return json(400, { error: 'The submission format is invalid.' });
    }
  } else {
    let body = '';
    for await (const chunk of req) {
      body += chunk;
      if (Buffer.byteLength(body) > 20000) return json(413, { error: 'The inquiry is too large.' });
    }
    try {
      data =
        contentType === 'application/json'
          ? JSON.parse(body)
          : Object.fromEntries(new URLSearchParams(body));
    } catch {
      return json(400, { error: 'The submission format is invalid.' });
    }
  }

  const checked = validateInquiry(data);
  if (checked.error) return json(422, { error: checked.error });

  const id = randomUUID();
  const reference = `AV-${id.slice(0, 8).toUpperCase()}`;

  try {
    await sweep();
    await mkdir(dataDir, { recursive: true, mode: 0o700 });
    await writeFile(
      resolve(dataDir, `${id}.json`),
      JSON.stringify({ id, reference, createdAt: new Date(now).toISOString(), ...checked.value }, null, 2),
      { flag: 'wx', mode: 0o600 }
    );
  } catch (err) {
    console.error('Storage note:', err.message);
  }

  console.log(`Inquiry received: ${reference} from ${checked.value.email}`);

  if (contentType === 'application/x-www-form-urlencoded') {
    res.writeHead(201, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
    return res.end(
      `<!doctype html><html lang="en"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Inquiry received — Aventrixx</title><link rel="stylesheet" href="/src/styles.css"><main class="noscript"><h1>Inquiry received.</h1><p>Your inquiry has been saved. Reference: ${reference}. We’ll use your email to discuss a discovery conversation.</p><a href="/">Return to Aventrixx →</a></main></html>`
    );
  }

  return json(201, { success: true, reference });
}
