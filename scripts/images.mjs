// Downloads the Unsplash photos listed in assets/js/content.js, applies the
// house treatment (warm, slightly desaturated colour) and writes WebP files
// at three widths to assets/img/. Also makes the 1200×630 share image.
//
//   npm run images            only fetches photos that are missing
//   npm run images -- --force re-fetches everything (after changing a photo id)
//
// Optional: set UNSPLASH_ACCESS_KEY to use the official Unsplash API, which
// also registers the download with the photographer, as Unsplash asks.
// Commit the generated files so deploys don't depend on Unsplash being up.
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { loadContent, R, root } from "./build.mjs";

let sharp;
try {
  sharp = (await import("sharp")).default;
} catch {
  console.warn("sharp is not installed. Run `npm install` first. Skipping photos.");
  process.exit(0);
}

const force = process.argv.includes("--force");
const outDir = join(root, "assets/img");
mkdirSync(outDir, { recursive: true });
const C = loadContent();
const key = process.env.UNSPLASH_ACCESS_KEY;

async function download(id) {
  if (key) {
    const meta = await fetch(`https://api.unsplash.com/photos/${id}`, { headers: { Authorization: `Client-ID ${key}` } });
    if (!meta.ok) throw new Error(`Unsplash API ${meta.status}`);
    const p = await meta.json();
    fetch(`${p.links.download_location}&client_id=${key}`).catch(() => {});
    console.log(`  ${id}: photo by ${p.user && p.user.name}`);
    const r = await fetch(`${p.urls.raw}&w=2400&fm=jpg&q=88`);
    if (!r.ok) throw new Error(`download ${r.status}`);
    return Buffer.from(await r.arrayBuffer());
  }
  const r = await fetch(`https://unsplash.com/photos/${id}/download?force=true&w=2400`, { redirect: "follow" });
  if (!r.ok) throw new Error(`download ${r.status}`);
  return Buffer.from(await r.arrayBuffer());
}

// The one treatment used on every photo: a little less saturation, a little warmer.
function treat(img) {
  return img
    .modulate({ saturation: 0.78 })
    .recomb([
      [1.06, 0.02, 0.0],
      [0.01, 1.0, 0.0],
      [0.0, 0.02, 0.9]
    ]);
}

let failed = 0;
for (const [slot, info] of Object.entries(C.images || {})) {
  const conf = R.SLOTS[slot];
  if (!conf || !info.unsplash) continue;
  const done = R.WIDTHS.every((w) => existsSync(join(outDir, `${slot}-${w}.webp`)));
  if (done && !force) continue;
  console.log(`${slot}: fetching ${info.unsplash}`);
  try {
    const buf = await download(info.unsplash);
    const [rw, rh] = conf.ratio;
    for (const w of R.WIDTHS) {
      const h = Math.round((w * rh) / rw);
      await treat(sharp(buf).rotate().resize(w, h, { fit: "cover", position: sharp.strategy.attention }))
        .webp({ quality: 72, effort: 5 })
        .toFile(join(outDir, `${slot}-${w}.webp`));
    }
    if (slot === "hero") await shareImage(buf);
  } catch (e) {
    failed++;
    console.warn(`  could not fetch ${slot} (${e.message}). The page shows a plain tone block instead.`);
  }
}

// 1200×630 Open Graph / Twitter image: the hero photo with the headline.
async function shareImage(buf) {
  const W = 1200, H = 630;
  const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${W}" height="${H}" fill="#1C1A19" fill-opacity="0.58"/>
    <text x="72" y="96" font-family="Fraunces, Georgia, 'DejaVu Serif', serif" font-size="30" fill="#F7F4EF">DD Network</text>
    <text x="72" y="126" font-family="Inter, Arial, 'DejaVu Sans', sans-serif" font-size="18" fill="#F7F4EF" fill-opacity="0.8">by Decoding Draupadi</text>
    <text font-family="Fraunces, Georgia, 'DejaVu Serif', serif" font-size="62" fill="#F7F4EF">
      <tspan x="72" y="420">Tell us what you're trying to do.</tspan>
      <tspan x="72" y="500">We'll find the women who can help.</tspan>
    </text>
    <rect x="72" y="548" width="64" height="3" fill="#C9775F"/>
  </svg>`;
  await treat(sharp(buf).rotate().resize(W, H, { fit: "cover", position: sharp.strategy.attention }))
    .composite([{ input: Buffer.from(svg) }])
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(join(outDir, "og.jpg"));
}

// Favicon PNG (for browsers and apps that ignore SVG favicons).
const fav = join(outDir, "apple-touch-icon.png");
if (!existsSync(fav) || force) {
  const svg = `<svg width="180" height="180" xmlns="http://www.w3.org/2000/svg"><rect width="180" height="180" fill="#8C3B2A"/><text x="90" y="118" text-anchor="middle" font-family="Fraunces, Georgia, 'DejaVu Serif', serif" font-size="84" fill="#F7F4EF">DD</text></svg>`;
  writeFileSync(fav, await sharp(Buffer.from(svg)).png().toBuffer());
}

if (failed) console.warn(`${failed} photo(s) could not be fetched. Try again from a machine with internet access.`);
