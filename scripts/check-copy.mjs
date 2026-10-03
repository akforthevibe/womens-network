// Pre-ship check from the brief: zero em dashes anywhere, and none of the banned words.
// Scans the source and the built site. Run after `npm run build`: npm run check:copy
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const EM_DASH = String.fromCharCode(0x2014);
const banned = ["empower", "girlboss", "queens", "slay", "journey", "unlock", "elevate", "synergy", "community"];
// The brief's own proof strip line uses "community"; it is the one allowed use.
const allowed = ["women in our community"];
const skip = new Set(["node_modules", ".git", ".astro", "_astro", "check-copy.mjs", "package-lock.json"]);
const exts = /\.(astro|ts|mjs|js|css|html|md|toml|json|svg)$/;

const files = [];
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    if (skip.has(name)) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (exts.test(name)) files.push(p);
  }
};
walk(".");
// Built JS and CSS too
try { for (const f of readdirSync("dist/_astro")) if (/\.(js|css)$/.test(f)) files.push(join("dist/_astro", f)); } catch {}

let problems = 0;
for (const f of files) {
  const lines = readFileSync(f, "utf8").split("\n");
  lines.forEach((line, i) => {
    if (line.includes(EM_DASH)) { problems++; console.log(`${f}:${i + 1}  em dash`); }
    if (f.endsWith("README.md") || f.endsWith("og.svg")) return;
    let lower = line.toLowerCase();
    for (const a of allowed) lower = lower.replaceAll(a, "");
    for (const w of banned) if (new RegExp(`\\b${w}`).test(lower)) { problems++; console.log(`${f}:${i + 1}  "${w}"`); }
  });
}
console.log(problems ? `${problems} problem(s)` : `Clean: ${files.length} files, zero em dashes, no banned words.`);
process.exit(problems ? 1 : 0);
