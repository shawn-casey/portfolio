import sharp from 'sharp';

// Studio headshot on a white sweep. Flood-fill the *border-connected* white so
// the (also white) shirt is left alone, then feather the edge.
const src = `${process.env.PHOTOS_DIR ?? '..'}/headshot.jpg`;
const out = 'public/img/headshot.webp';

const img = sharp(src).resize({ width: 560, withoutEnlargement: true });
const { data, info } = await img.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H, channels: C } = info;

const lum = (i) => 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
const HARD = 246; // definitely background
const SOFT = 205; // feather band

const alpha = new Float32Array(W * H).fill(1);
const seen = new Uint8Array(W * H);
const stack = [];
const push = (x, y) => {
  if (x < 0 || y < 0 || x >= W || y >= H) return;
  const p = y * W + x;
  if (seen[p]) return;
  if (lum(p * C) < SOFT) return;
  seen[p] = 1;
  stack.push(p);
};
for (let x = 0; x < W; x++) { push(x, 0); push(x, H - 1); }
for (let y = 0; y < H; y++) { push(0, y); push(W - 1, y); }

while (stack.length) {
  const p = stack.pop();
  const l = lum(p * C);
  alpha[p] = l >= HARD ? 0 : Math.max(0, 1 - (l - SOFT) / (HARD - SOFT));
  const x = p % W, y = (p / W) | 0;
  push(x + 1, y); push(x - 1, y); push(x, y + 1); push(x, y - 1);
}

for (let p = 0; p < W * H; p++) data[p * C + 3] = Math.round(alpha[p] * 255);

await sharp(data, { raw: { width: W, height: H, channels: C } })
  .webp({ quality: 86, alphaQuality: 100 })
  .toFile(out);
console.log('wrote', out);
