import sharp from 'sharp';
import path from 'node:path';

const SRC = process.env.PHOTOS_DIR ?? '..';
const OUT = 'public/img';
const p = (f) => path.join(SRC, f);

// 1. Marcel landing page hero
await sharp(p('marcel.png')).resize({ width: 1400 }).webp({ quality: 74 }).toFile(`${OUT}/marcel-hero.webp`);

// 2. Belcan lockup
await sharp(p('belcan.png')).resize({ width: 400 }).webp({ quality: 90 }).toFile(`${OUT}/belcan.webp`);

// 3. On-site photo: crop the partial bystander off the right edge
await sharp(p('me at us bank.png'))
  .extract({ left: 0, top: 0, width: 716, height: 1036 })
  .resize({ width: 700 })
  .webp({ quality: 72 })
  .toFile(`${OUT}/usbank-office.webp`);

// 4. Temporal event history. Cropped to the timeline panel only: everything
//    below it (task queue names, worker hostnames, artifact paths) carries an
//    internal prefix and does not belong on a public page.
await sharp(p('orchestration-temporal-ui.png'))
  .extract({ left: 40, top: 58, width: 2820, height: 645 })
  .resize({ width: 1800 })
  .webp({ quality: 82 })
  .toFile(`${OUT}/temporal-history.webp`);

// 5. Scaling diagram. One label names an internal platform, so paint it out
//    and drop a functional description in its place. Composite at full size
//    first, because sharp resizes before it composites.
{
  const src = sharp(p('orchestration-scaling.png'));
  const { data, info } = await src
    .clone()
    .extract({ left: 1300, top: 555, width: 500, height: 40 })
    .raw()
    .toBuffer({ resolveWithObject: true });
  let ink = [0, 0, 0];
  let best = 1e9;
  for (let i = 0; i < data.length; i += info.channels) {
    const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    if (lum < best) {
      best = lum;
      ink = [data[i], data[i + 1], data[i + 2]];
    }
  }
  const inkHex = '#' + ink.map((c) => c.toString(16).padStart(2, '0')).join('');

  const patch = `<svg xmlns="http://www.w3.org/2000/svg" width="158" height="46">
    <rect width="158" height="46" fill="rgb(250,246,237)"/>
    <text x="6" y="35" font-family="Menlo, Monaco, monospace" font-size="27" fill="${inkHex}">the cloud</text>
  </svg>`;

  const patched = await src
    .composite([{ input: Buffer.from(patch), top: 552, left: 1119 }])
    .png()
    .toBuffer();
  await sharp(patched).resize({ width: 1800 }).webp({ quality: 84 }).toFile(`${OUT}/scaling.webp`);
  console.log('redacted internal platform name, ink', inkHex);
}

// 6. Tie rod analysis plot, pulled from the public repo when it isn't cached locally
const fs = await import('node:fs');
const tieRod = process.env.TIEROD_PNG ?? '/tmp/tr-zoom.png';
if (fs.existsSync(tieRod)) {
  await sharp(tieRod).resize({ width: 1600 }).webp({ quality: 76 }).toFile(`${OUT}/tierod.webp`);
} else {
  console.log('skipped tierod: fetch zoomed.png from shawn-casey/tieRodAnalysisFSAE first');
}

for (const f of ['marcel-hero', 'belcan', 'usbank-office', 'scaling', 'tierod']) {
  if (!fs.existsSync(`${OUT}/${f}.webp`)) continue;
  const m = await sharp(`${OUT}/${f}.webp`).metadata();
  console.log(f.padEnd(20), `${m.width}x${m.height}`.padEnd(12), (fs.statSync(`${OUT}/${f}.webp`).size / 1024).toFixed(0) + 'K');
}
