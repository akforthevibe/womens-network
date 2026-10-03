// Builds the Open Graph image (1200 x 630) and favicons as SVG, then exports PNGs.
// Text is converted to outlines so the files render the same everywhere.
// Run: npm run og   (writes to public/)
import { readFileSync, writeFileSync } from "node:fs";
import opentype from "opentype.js";
import { Resvg } from "@resvg/resvg-js";

const font = (p) => {
  const buf = readFileSync(new URL(`../node_modules/${p}`, import.meta.url));
  return opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
};
const black = font("@fontsource/figtree/files/figtree-latin-900-normal.woff");
const bold = font("@fontsource/figtree/files/figtree-latin-800-normal.woff");
const script = font("@fontsource/mrs-saint-delafield/files/mrs-saint-delafield-latin-400-normal.woff");

const C = { plum: "#43123F", amber: "#EC940C", gold: "#C4C600", paper: "#FFF6EE", maroon: "#301C1D" };
const text = (f, str, x, y, size, fill, extra = "") => {
  const p = f.getPath(str, x, y, size);
  return { svg: `<path d="${p.toPathData(2)}" fill="${fill}" ${extra}/>`, width: f.getAdvanceWidth(str, size) };
};
const centred = (f, str, cx, y, size, fill) => text(f, str, cx - f.getAdvanceWidth(str, size) / 2, y, size, fill).svg;

// Open Graph image
const size = 104;
const brand = text(black, "DD NETWORK", 80, 112, 30, C.paper);
const by = text(bold, "BY DECODING DRAUPADI", 80, 138, 13, C.paper, 'opacity="0.75"');
const l1 = text(black, "The room", 80, 284, size, C.paper);
const l2 = text(black, "you've been", 80, 384, size, C.paper);
const l3 = text(script, "looking for", 92, 486, size * 1.5, C.gold, 'transform="rotate(-4 300 480)"');
const dot = text(black, ".", 92 + l3.width + 4, 480, size, C.paper);
const footText = "First chapter: Mumbai  ·  50 founding seats";
const foot = text(bold, footText, 1120 - bold.getAdvanceWidth(footText, 22), 574, 22, C.paper, 'opacity="0.85"');
const sticker = `<g transform="translate(1010 170) rotate(-8)">
  <circle r="112" fill="${C.amber}"/>
  ${centred(black, "50 FOUNDING", 0, -12, 25, C.maroon)}
  ${centred(black, "SEATS", 0, 18, 25, C.maroon)}
  <rect x="-70" y="34" width="140" height="2.5" fill="${C.maroon}" opacity="0.4"/>
  ${centred(bold, "MUMBAI · CHAPTER ONE", 0, 60, 12.5, C.maroon)}
</g>`;
const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<rect width="1200" height="630" fill="${C.plum}"/>
${brand.svg}${by.svg}${l1.svg}${l2.svg}${l3.svg}${dot.svg}${foot.svg}
${sticker}
</svg>`;
writeFileSync("public/og.svg", og);
writeFileSync("public/og.png", new Resvg(og, { fitTo: { mode: "width", value: 1200 } }).render().asPng());

// Favicon: "DD" in Figtree Black, paper on plum
const dd = black.getPath("DD", 0, 0, 32);
const bb = dd.getBoundingBox();
const dx = (64 - (bb.x2 - bb.x1)) / 2 - bb.x1;
const dy = (64 - (bb.y2 - bb.y1)) / 2 - bb.y1;
const fav = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
<rect width="64" height="64" rx="14" fill="${C.plum}"/>
<path transform="translate(${dx.toFixed(2)} ${dy.toFixed(2)})" d="${dd.toPathData(2)}" fill="${C.paper}"/>
</svg>`;
writeFileSync("public/favicon.svg", fav);
writeFileSync("public/favicon-32.png", new Resvg(fav, { fitTo: { mode: "width", value: 32 } }).render().asPng());
const touch = fav.replace('rx="14"', 'rx="0"');
writeFileSync("public/apple-touch-icon.png", new Resvg(touch, { fitTo: { mode: "width", value: 180 } }).render().asPng());

console.log("Wrote public/og.svg, og.png, favicon.svg, favicon-32.png, apple-touch-icon.png");
