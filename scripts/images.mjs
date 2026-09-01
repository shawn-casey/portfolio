import sharp from 'sharp';
import path from 'node:path';
import fs from 'node:fs';

// Original photos live outside the repo (they are large and unprocessed).
// Override with PHOTOS_DIR if they sit somewhere else.
const SRC = process.env.PHOTOS_DIR ?? '..';
const OUT = path.join(process.cwd(), 'public/img');
fs.mkdirSync(OUT, { recursive: true });

// The reading column is 664px wide, so ~1100px covers a 1.65x display.
// [source, outName, maxWidth, quality, cropLeftFraction?]
const jobs = [
  ['belcan-f135 engine.jpg', 'f135', 900, 74, null],
  ['boston-robitics-summit.png', 'robotics-summit', 900, 70, null],
  ['hackathon-hero.png', 'hackathon', 1100, 76, null],
  ['qpke-circut.png', 'qpke', 660, 82, null],
  ['car-detailing.png', 'detailing', 1100, 62, null],
  ['huskython.png', 'huskython', 1100, 62, null],
  ['mountain-bike.png', 'mountain-bike', 1100, 55, null],
  ['chatooga-river.jpg', 'chattooga', 1100, 62, null],
  ['tour-de-mont-blanc.png', 'mont-blanc', 1100, 64, null],
  ['big bend.png', 'big-bend', 1100, 66, null],
  ['cytrence.png', 'cytrence', 560, 80, null],
  // file-explorer sidebar cropped out of the real-vault screenshot (confidentiality)
  ['second-brain.png', 'second-brain', 1200, 78, 0.182],
];

for (const [src, name, w, q, cropLeft] of jobs) {
  let img = sharp(path.join(SRC, src));
  if (cropLeft) {
    const meta = await img.metadata();
    const left = Math.round(meta.width * cropLeft);
    img = img.extract({ left, top: 0, width: meta.width - left, height: meta.height });
  }
  await img
    .resize({ width: w, withoutEnlargement: true })
    .webp({ quality: q })
    .toFile(path.join(OUT, `${name}.webp`));
}

// Logos keep their alpha channel.
for (const [src, name] of [['visa-logo.png', 'visa'], ['us-bank-logo.png', 'usbank']]) {
  await sharp(path.join(SRC, src))
    .resize({ width: 400, withoutEnlargement: true })
    .webp({ quality: 90, alphaQuality: 100 })
    .toFile(path.join(OUT, `${name}.webp`));
}

let total = 0;
for (const f of fs.readdirSync(OUT).sort()) {
  const { size } = fs.statSync(path.join(OUT, f));
  total += size;
  const m = await sharp(path.join(OUT, f)).metadata();
  console.log(f.padEnd(24), `${m.width}x${m.height}`.padEnd(11), `${(size / 1024).toFixed(0)}K`);
}
console.log('total'.padEnd(24), ''.padEnd(11), `${(total / 1024).toFixed(0)}K`);
