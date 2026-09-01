import { useEffect, useState } from 'react';

type Row = { k: string; v: string | null };
type Visits = { total: number; cities: { city: string; count: number }[] };

// ── passive, entirely local ────────────────────────────────────────────────
function browserName(ua: string) {
  const brands = (navigator as Navigator & { userAgentData?: { brands?: { brand: string; version: string }[] } })
    .userAgentData?.brands;
  const real = brands?.find((b) => !/Not.?A.?Brand/i.test(b.brand));
  if (real) return `${real.brand} ${real.version}`;
  const m =
    /(Firefox)\/([\d.]+)/.exec(ua) ??
    /(Edg)\/([\d.]+)/.exec(ua) ??
    /(Chrome)\/([\d.]+)/.exec(ua) ??
    /Version\/([\d.]+).*(Safari)/.exec(ua);
  if (!m) return 'Unknown';
  return m[2] === 'Safari' ? `Safari ${m[1]}` : `${m[1] === 'Edg' ? 'Edge' : m[1]} ${m[2].split('.')[0]}`;
}

function osName(ua: string) {
  const p = (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData?.platform;
  if (/Mac OS X ([\d_]+)/.test(ua)) return `macOS ${/Mac OS X ([\d_]+)/.exec(ua)![1].replace(/_/g, '.')}`;
  if (/Windows NT ([\d.]+)/.test(ua)) return `Windows ${{ '10.0': '10 or 11', '6.3': '8.1', '6.1': '7' }[/Windows NT ([\d.]+)/.exec(ua)![1]] ?? ''}`.trim();
  if (/iPhone|iPad|iPod/.test(ua)) return `iOS / iPadOS`;
  if (/Android ([\d.]+)/.test(ua)) return `Android ${/Android ([\d.]+)/.exec(ua)![1]}`;
  if (/Linux/.test(ua)) return 'Linux';
  return p || 'Unknown';
}

function localRows(): Row[] {
  const ua = navigator.userAgent;
  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { effectiveType?: string };
  };
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return [
    { k: 'browser', v: browserName(ua) },
    { k: 'operating system', v: osName(ua) },
    { k: 'screen', v: `${screen.width} × ${screen.height} @ ${window.devicePixelRatio}x` },
    { k: 'browser window', v: `${window.innerWidth} × ${window.innerHeight}` },
    { k: 'time zone', v: `${tz}, and it is ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} where you are` },
    { k: 'languages', v: (navigator.languages ?? [navigator.language]).join(', ') },
    { k: 'cpu cores', v: navigator.hardwareConcurrency ? String(navigator.hardwareConcurrency) : 'not exposed' },
    { k: 'device memory', v: nav.deviceMemory ? `~${nav.deviceMemory} GB` : 'not exposed' },
    { k: 'connection', v: nav.connection?.effectiveType ?? 'not exposed' },
    { k: 'input', v: matchMedia('(pointer: coarse)').matches ? 'touch' : 'mouse / trackpad' },
    { k: 'theme preference', v: matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light' },
    {
      k: 'reduced motion',
      v: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'requested' : 'not requested',
    },
    { k: 'referrer', v: document.referrer || 'none sent, so: typed, bookmarked, or a private link' },
  ];
}

export function Fingerprint() {
  const [rows, setRows] = useState<Row[]>([]);
  const [net, setNet] = useState<Row[]>([
    { k: 'approximate location', v: null },
    { k: 'your public IP', v: null },
  ]);

  useEffect(() => {
    setRows(localRows());
    let alive = true;

    (async () => {
      // Preferred: our own function, which reads the city off an edge header
      // and throws the IP away in the same request.
      try {
        const r = await fetch('/api/visits', { headers: { accept: 'application/json' } });
        if (r.ok) {
          const j = (await r.json()) as { you?: { city?: string; region?: string; country?: string; ip?: string } };
          if (alive && j.you?.city) {
            setNet([
              {
                k: 'approximate location',
                v: [j.you.city, j.you.region, j.you.country].filter(Boolean).join(', '),
              },
              { k: 'your public IP', v: j.you.ip ?? 'read and discarded server-side' },
            ]);
            return;
          }
        }
      } catch {
        /* fall through */
      }
      // Fallback for static hosting with no function attached.
      try {
        const r = await fetch('https://ipapi.co/json/');
        const j = (await r.json()) as { city?: string; region?: string; country_name?: string; ip?: string };
        if (!alive) return;
        setNet([
          {
            k: 'approximate location',
            v: [j.city, j.region, j.country_name].filter(Boolean).join(', ') || 'could not resolve',
          },
          { k: 'your public IP', v: j.ip ?? 'could not resolve' },
        ]);
      } catch {
        if (alive)
          setNet([
            { k: 'approximate location', v: 'blocked by a content blocker' },
            { k: 'your public IP', v: 'blocked' },
          ]);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="fp-grid">
      {[...net, ...rows].map((r) => (
        <div className="fp-row" key={r.k}>
          <span className="fp-key">{r.k}</span>
          <span className={`fp-val${r.v === null ? ' pending' : ''}`}>{r.v ?? 'resolving…'}</span>
        </div>
      ))}
    </div>
  );
}

export function VisitCounter() {
  const [data, setData] = useState<Visits | null>(null);
  const [state, setState] = useState<'loading' | 'ok' | 'off'>('loading');

  useEffect(() => {
    let alive = true;
    (async () => {
      // Count a visit once per browser session; reloads read without incrementing.
      let counted = false;
      try {
        counted = sessionStorage.getItem('counted') === '1';
      } catch {
        /* private mode */
      }
      try {
        const r = await fetch('/api/visits', {
          method: counted ? 'GET' : 'POST',
          headers: { accept: 'application/json' },
        });
        if (!r.ok) throw new Error(String(r.status));
        const j = (await r.json()) as Visits;
        if (!alive) return;
        try {
          sessionStorage.setItem('counted', '1');
        } catch {
          /* ignore */
        }
        setData(j);
        setState('ok');
      } catch {
        if (alive) setState('off');
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  if (state === 'loading') return <p className="visits-total">Counting…</p>;
  if (state === 'off' || !data)
    return (
      <div className="callout callout-info">
        <div className="callout-title">
          <span>Counter not connected</span>
        </div>
        <p>
          The aggregate counter runs in a small serverless function (<code>api/visits.js</code>) that this build is not
          currently talking to. Either it is running locally, or it is deployed somewhere without functions. Everything
          above still works; it is all computed in your browser.
        </p>
      </div>
    );

  const max = Math.max(1, ...data.cities.map((c) => c.count));
  return (
    <>
      <p className="visits-total">
        <b>{data.total.toLocaleString()}</b> visits so far, from {data.cities.length} cities.
      </p>
      <div className="visits-list">
        {data.cities.slice(0, 12).map((c) => (
          <div className="visits-row" key={c.city}>
            <span className="visits-city">{c.city}</span>
            <span className="visits-bar">
              <i style={{ width: `${(c.count / max) * 100}%` }} />
            </span>
            <span className="visits-n">{c.count}</span>
          </div>
        ))}
      </div>
    </>
  );
}
