// Writes the settings from assets/js/content.js into the HTML pages.
// Run after editing content.js:   node scripts/build.mjs
// Netlify runs it automatically (see netlify.toml).
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);

export function loadContent() {
  const sandbox = { window: {} };
  vm.runInNewContext(readFileSync(join(root, "assets/js/content.js"), "utf8"), sandbox);
  if (!sandbox.window.DD_CONTENT) throw new Error("content.js did not define window.DD_CONTENT");
  return sandbox.window.DD_CONTENT;
}

export const R = require(join(root, "assets/js/render.js"));
export { root };

if (import.meta.url === `file://${process.argv[1]}`) {
  const content = loadContent();
  for (const page of ["index.html", "privacy.html", "thank-you.html"]) {
    const file = join(root, page);
    if (!existsSync(file)) continue;
    const before = readFileSync(file, "utf8");
    const after = R.apply(before, content);
    if (after !== before) writeFileSync(file, after);
    console.log(`${page}: ${after === before ? "already up to date" : "updated from content.js"}`);
  }
  const missing = Object.keys(content.images || {}).filter((k) => !existsSync(join(root, `assets/img/${k}-1000.webp`)));
  if (missing.length) console.warn(`Photos not generated yet (${missing.join(", ")}). Run: npm run images`);
}
