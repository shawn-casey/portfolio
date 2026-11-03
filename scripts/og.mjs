import sharp from 'sharp';
import fs from 'node:fs';

// Counts come from the vault itself so the card can't drift out of date.
const dir = 'src/content/notes';
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md'));
const bodies = files.map((f) => fs.readFileSync(`${dir}/${f}`, 'utf8'));
const titleOf = (s) => (/^title:\s*(.+)$/m.exec(s) || [, ''])[1].trim().toLowerCase();
const idOf = (s) => (/^id:\s*(.+)$/m.exec(s) || [, ''])[1].trim().toLowerCase();
const keys = new Map();
bodies.forEach((b) => {
  keys.set(titleOf(b), idOf(b));
  keys.set(idOf(b), idOf(b));
  const al = /^aliases:\s*\[(.*)\]$/m.exec(b);
  if (al) al[1].split(',').map((x) => x.trim().toLowerCase()).filter(Boolean).forEach((a) => keys.set(a, idOf(b)));
});
const edges = new Set();
bodies.forEach((b) => {
  const self = idOf(b);
  for (const m of b.matchAll(/\[\[([^\]|#]+)(?:\|[^\]]*)?\]\]/g)) {
    const t = keys.get(m[1].trim().toLowerCase());
    if (t && t !== self) edges.add([self, t].sort().join(' '));
  }
});
const NOTES = files.length;
const LINKS = edges.size;
console.log(`${NOTES} notes, ${LINKS} links`);

// 1200x630 social card. Rendered offline so no font or asset fetch at runtime.
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1e1e1e"/><stop offset="100%" stop-color="#171622"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#g)"/>
  <rect x="0" y="0" width="1200" height="4" fill="#7f6df2"/>

  <g stroke="rgba(255,255,255,0.10)" stroke-width="1.5">
    <path d="M980 150 L1090 215 M980 150 L900 250 M1090 215 L1060 340 M900 250 L1060 340 M900 250 L860 400 M1060 340 L1120 450 M860 400 L1000 470 M1000 470 L1120 450 M980 150 L1060 340"/>
  </g>
  <g>
    <circle cx="980" cy="150" r="9" fill="#5da9e9"/>
    <circle cx="1090" cy="215" r="6" fill="#57b98a"/>
    <circle cx="900" cy="250" r="13" fill="#b3a4ff"/>
    <circle cx="1060" cy="340" r="8" fill="#43c3bb"/>
    <circle cx="860" cy="400" r="6" fill="#d9b44a"/>
    <circle cx="1120" cy="450" r="7" fill="#e07a5f"/>
    <circle cx="1000" cy="470" r="9" fill="#5da9e9"/>
  </g>

  <text x="84" y="250" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-size="76" font-weight="700" fill="#e9e9e9">Shawn Casey</text>
  <text x="84" y="308" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-size="30" font-weight="500" fill="#a394ff">M.S. Cybersecurity, Georgia Tech</text>
  <text x="84" y="378" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-size="25" fill="#9a9a9a">Getting into machines nothing else can reach,</text>
  <text x="84" y="414" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-size="25" fill="#9a9a9a">and putting intelligence on top of that access.</text>

  <text x="84" y="530" font-family="Menlo, Monaco, monospace" font-size="19" fill="#6a6a6a">${NOTES} notes  ·  ${LINKS} links  ·  a portfolio built as an Obsidian vault</text>
</svg>`;

await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile('public/og.png');
console.log('wrote public/og.png');
