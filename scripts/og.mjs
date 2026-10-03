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
const sans = font("@fontsource/figtree/files/figtree-latin-800-normal.woff");
const script = font("@fontsource/mrs-saint-delafield/files/mrs-saint-delafield-latin-400-normal.woff");

const C = { plum: "#43123F", goldenrod: "#C4C600", paper: "#FFF6EE", amber: "#EC940C" };
const text = (f, str, x, y, size, fill) => {
  const p = f.getPath(str, x, y, size);
  return { d: p.toPathData(2), width: f.getAdvanceWidth(str, size), fill };
};
const path = (t) => `<path d="${t.d}" fill="${t.fill}"/>`;

// Glyphs placed one by one around a circle, for the sticker.
function circleText(f, str, cx, cy, r, size, fill) {
  const total = f.getAdvanceWidth(str, size);
  const spacing = (2 * Math.PI * r - total) / str.length;
  let angle = -Math.PI / 2;
  let out = "";
  for (const ch of str) {
    const w = f.getAdvanceWidth(ch, size);
    const mid = angle + (w / 2) / r;
    const x = cx + r * Math.cos(mid);
    const y = cy + r * Math.sin(mid);
    const deg = (mid * 180) / Math.PI + 90;
    const g = f.getPath(ch, -w / 2, 0, size).toPathData(2);
    out += `<path d="${g}" fill="${fill}" transform="translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${deg.toFixed(2)})"/>`;
    angle += (w + spacing) / r;
  }
  return out;
}

// Open Graph image: plum, "The room you've been" in paper sans, "looking for" in goldenrod script, sticker
const word = text(sans, "DD Network", 80, 120, 36, C.paper);
const l1 = text(sans, "The room", 80, 290, 120, C.paper);
const l2 = text(sans, "you\u2019ve been", 80, 410, 120, C.paper);
const look = script.getPath("looking for", 0, 0, 150);
const lookSvg = `<path transform="translate(150 520) rotate(-4)" d="${look.toPathData(2)}" fill="${C.goldenrod}" stroke="${C.goldenrod}" stroke-width="2"/>`;
const sticker = `<g transform="translate(1040 150) rotate(-8)">
  <circle r="100" fill="${C.goldenrod}"/>
  ${circleText(sans, "50 FOUNDING SEATS \u00b7 BY APPLICATION \u00b7 ", 0, 0, 76, 17, C.plum)}
  <path d="M0 -26 C 2 -8, 8 -2, 26 0 C 8 2, 2 8, 0 26 C -2 8, -8 2, -26 0 C -8 -2, -2 -8, 0 -26 Z" fill="${C.plum}"/>
</g>`;
const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<rect width="1200" height="630" fill="${C.plum}"/>
${path(word)}${path(l1)}${path(l2)}${lookSvg}
${sticker}
</svg>`;
writeFileSync("public/og.svg", og);
writeFileSync("public/og.png", new Resvg(og, { fitTo: { mode: "width", value: 1200 } }).render().asPng());

// Favicon: "DD" in the sans, paper on plum
const dd = sans.getPath("DD", 0, 0, 36);
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
