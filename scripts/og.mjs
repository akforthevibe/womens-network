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
const fraunces = font("@fontsource/fraunces/files/fraunces-latin-700-normal.woff");
const frauncesItalic = font("@fontsource/fraunces/files/fraunces-latin-700-italic.woff");
const caveat = font("@fontsource/caveat/files/caveat-latin-600-normal.woff");

const C = { wine: "#400101", fire: "#BF3604", flame: "#F2913D", paper: "#FBF1E4" };
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

// Open Graph image
const size = 92;
const line1 = text(fraunces, "For women building", 80, 300, size, C.paper);
const line2a = text(fraunces, "their ", 80, 400, size, C.paper);
const line2b = text(frauncesItalic, "next chapter.", 80 + line2a.width, 400, size, C.flame);
const squiggleX = 80 + line2a.width;
const squiggle = `<path d="M${squiggleX} 430 C ${squiggleX + 60} 414, ${squiggleX + 110} 414, ${squiggleX + 160} 426 S ${squiggleX + 260} 442, ${squiggleX + 320} 424 S ${squiggleX + 420} 412, ${squiggleX + line2b.width} 426" fill="none" stroke="${C.flame}" stroke-width="7" stroke-linecap="round"/>`;
const word = text(fraunces, "DD Network", 80, 140, 40, C.paper);
const by = text(fraunces, "by Decoding Draupadi", 80, 540, 30, C.flame);
const sticker = `<g transform="translate(1020 150) rotate(-8)">
  <circle r="104" fill="${C.flame}"/>
  ${circleText(caveat, "50 FOUNDING SEATS · BY APPLICATION · MUMBAI · ", 0, 0, 80, 25, C.wine)}
  <path d="M0 -26 C 2 -8, 8 -2, 26 0 C 8 2, 2 8, 0 26 C -2 8, -8 2, -26 0 C -8 -2, -2 -8, 0 -26 Z" fill="${C.wine}"/>
</g>`;
const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<rect width="1200" height="630" fill="${C.wine}"/>
${path(word)}${path(line1)}${path(line2a)}${path(line2b)}${squiggle}${path(by)}
${sticker}
</svg>`;
writeFileSync("public/og.svg", og);
writeFileSync("public/og.png", new Resvg(og, { fitTo: { mode: "width", value: 1200 } }).render().asPng());

// Favicon: "DD" in Fraunces, paper on wine
const dd = fraunces.getPath("DD", 0, 0, 34);
const bb = dd.getBoundingBox();
const dx = (64 - (bb.x2 - bb.x1)) / 2 - bb.x1;
const dy = (64 - (bb.y2 - bb.y1)) / 2 - bb.y1;
const fav = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
<rect width="64" height="64" rx="14" fill="${C.wine}"/>
<path transform="translate(${dx.toFixed(2)} ${dy.toFixed(2)})" d="${dd.toPathData(2)}" fill="${C.paper}"/>
</svg>`;
writeFileSync("public/favicon.svg", fav);
writeFileSync("public/favicon-32.png", new Resvg(fav, { fitTo: { mode: "width", value: 32 } }).render().asPng());
const touch = fav.replace('rx="14"', 'rx="0"');
writeFileSync("public/apple-touch-icon.png", new Resvg(touch, { fitTo: { mode: "width", value: 180 } }).render().asPng());

console.log("Wrote public/og.svg, og.png, favicon.svg, favicon-32.png, apple-touch-icon.png");
