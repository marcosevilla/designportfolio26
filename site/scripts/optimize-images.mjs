// One-shot image optimization: convert every raster in public/images over
// SIZE_THRESHOLD to WebP (max width MAX_W, quality QUALITY), emit a JSON
// map of old path → { newPath, width, height, savedBytes } for the
// reference-update pass. Originals are NOT deleted here — that happens
// after references are updated and verified.
//
// Usage: node scripts/optimize-images.mjs [--dry]

import { readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative, extname } from "node:path";
import sharp from "sharp";

const ROOT = new URL("..", import.meta.url).pathname;
const IMAGES_DIR = join(ROOT, "public/images");
const SIZE_THRESHOLD = 250 * 1024;
const MAX_W = 1600;
const QUALITY = 82;
const dry = process.argv.includes("--dry");

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) out.push(...walk(p));
    else out.push({ path: p, size: st.size });
  }
  return out;
}

const candidates = walk(IMAGES_DIR).filter(
  (f) =>
    [".png", ".jpg", ".jpeg"].includes(extname(f.path).toLowerCase()) &&
    f.size > SIZE_THRESHOLD
);

const map = {};
let savedTotal = 0;

for (const f of candidates) {
  const rel = "/" + relative(join(ROOT, "public"), f.path); // e.g. /images/checkin/details.png
  const outPath = f.path.replace(/\.(png|jpe?g)$/i, ".webp");
  const relOut = rel.replace(/\.(png|jpe?g)$/i, ".webp");

  const img = sharp(f.path);
  const meta = await img.metadata();
  const width = Math.min(meta.width ?? MAX_W, MAX_W);

  if (!dry) {
    await img
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toFile(outPath);
  }
  const outMeta = dry ? { width, height: 0 } : await sharp(outPath).metadata();
  const outSize = dry ? 0 : statSync(outPath).size;
  savedTotal += f.size - outSize;

  map[rel] = {
    newPath: relOut,
    width: outMeta.width,
    height: outMeta.height,
    oldBytes: f.size,
    newBytes: outSize,
  };
  console.log(
    `${rel} ${(f.size / 1024 / 1024).toFixed(2)}MB → ${(outSize / 1024 / 1024).toFixed(2)}MB (${outMeta.width}×${outMeta.height})`
  );
}

writeFileSync(
  join(ROOT, "scripts/image-map.json"),
  JSON.stringify(map, null, 2)
);
console.log(
  `\n${candidates.length} files, saved ${(savedTotal / 1024 / 1024).toFixed(1)}MB total. Map → scripts/image-map.json`
);
