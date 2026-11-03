/**
 * Aggregate visit counter.
 *
 * Design constraint: this endpoint must never be able to tell anyone that a
 * *particular* person visited. So the only thing that reaches storage is a
 * city name and an integer. No IP, no timestamp, no session, no user agent,
 * no referrer. The IP is read from an edge header and goes out of scope in
 * the same request.
 *
 * Storage: Upstash Redis over its REST API (works on Vercel, Netlify, Cloudflare
 * Workers, Deno Deploy, anywhere `fetch` exists). Set either pair:
 *   UPSTASH_REDIS_REST_URL  + UPSTASH_REDIS_REST_TOKEN
 *   KV_REST_API_URL         + KV_REST_API_TOKEN
 * Without them the endpoint still answers with your own geo and a zeroed
 * aggregate, and the site degrades gracefully.
 *
 *   GET  /api/visits  -> read the aggregate (no write)
 *   POST /api/visits  -> increment this city, then read
 */

const KEY = 'visits:cities';
const TOTAL_KEY = 'visits:total';

// Vercel's Upstash integration injects KV_REST_API_* on some versions and
// UPSTASH_REDIS_REST_* on others. Accept either.
const URL_BASE = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
const enabled = Boolean(URL_BASE && TOKEN);

async function redis(command) {
  const res = await fetch(URL_BASE, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(command),
  });
  if (!res.ok) throw new Error(`upstash ${res.status}`);
  const json = await res.json();
  return json.result;
}

/** Coarse geo from whatever the platform's edge already resolved. */
function geoOf(req) {
  const h = (name) => req.headers?.[name] ?? req.headers?.get?.(name) ?? '';
  const dec = (v) => {
    try {
      return decodeURIComponent(v);
    } catch {
      return v;
    }
  };
  const city = dec(h('x-vercel-ip-city') || h('cf-ipcity') || h('x-nf-geo-city') || '');
  const region = dec(h('x-vercel-ip-country-region') || h('cf-region-code') || '');
  const country = dec(h('x-vercel-ip-country') || h('cf-ipcountry') || '');
  const ip = (h('x-forwarded-for') || '').split(',')[0].trim();
  return { city, region, country, ip };
}

/** "Austin, TX, US", the only shape that is ever written down. */
function label(g) {
  return [g.city, g.region, g.country].filter(Boolean).join(', ');
}

export default async function handler(req, res) {
  const send = (status, body) => {
    res.setHeader('content-type', 'application/json');
    res.setHeader('cache-control', 'no-store');
    res.status(status).send(JSON.stringify(body));
  };

  const geo = geoOf(req);
  // Returned to this visitor only, never stored.
  const you = { city: geo.city || null, region: geo.region || null, country: geo.country || null, ip: geo.ip || null };

  if (!enabled) return send(200, { you, total: 0, cities: [], storage: 'not configured' });

  try {
    const name = label(geo);
    if (req.method === 'POST' && name) {
      await redis(['HINCRBY', KEY, name, 1]);
      await redis(['INCR', TOTAL_KEY]);
    }
    const [flat, total] = await Promise.all([redis(['HGETALL', KEY]), redis(['GET', TOTAL_KEY])]);
    const cities = [];
    for (let i = 0; i < (flat?.length ?? 0); i += 2) {
      cities.push({ city: flat[i], count: Number(flat[i + 1]) || 0 });
    }
    cities.sort((a, b) => b.count - a.count || a.city.localeCompare(b.city));
    return send(200, {
      you,
      total: Number(total) || cities.reduce((s, c) => s + c.count, 0),
      cities,
      storage: 'ok',
    });
  } catch (err) {
    return send(200, { you, total: 0, cities: [], storage: 'error', detail: String(err) });
  }
}
