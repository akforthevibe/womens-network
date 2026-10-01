// Writes the content from assets/js/content.js into index.html.
// Run after editing content.js:   node scripts/build.mjs
// Netlify runs it automatically (see netlify.toml).
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);

const sandbox = { window: {} };
vm.runInNewContext(readFileSync(join(root, "assets/js/content.js"), "utf8"), sandbox);
const content = sandbox.window.DD_CONTENT;
if (!content) throw new Error("content.js did not define window.DD_CONTENT");

const R = require(join(root, "assets/js/render.js"));
const file = join(root, "index.html");
const before = readFileSync(file, "utf8");
const after = R.apply(before, content);
writeFileSync(file, after);
console.log(after === before ? "index.html already up to date" : "index.html updated from content.js");
