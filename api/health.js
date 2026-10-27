export default function handler(req, res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    res.statusCode = 405;
    return res.end(JSON.stringify({ error: 'Method not allowed.' }));
  }
  res.statusCode = 200;
  return res.end(req.method === 'HEAD' ? undefined : JSON.stringify({ status: 'ok' }));
}
