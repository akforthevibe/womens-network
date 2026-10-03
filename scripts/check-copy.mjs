// Pre-ship check from the brief: zero em dashes anywhere in the repository, and none of the
// banned words or phrases. Scans the source and the built site. Run after `npm run build`:
//   npm run check:copy
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const EM_DASH = String.fromCharCode(0x2014);
const banned = [
  "empower", "optimi[sz]", "seamless", "game changer", "game-changer", "holistic", "tribe", "girlboss",
  "queens", "unlock", "elevate", "synergy", "journey", "one-of-a-kind", "like-minded", "level up",
  "redefine", "transformational", "ecosystem", "community-led", "powerful community",
  "where women come together", "meaningful connections", "next level", "find your tribe",
  "women supporting women", "learn more", "get started", "mumbai community", "network for women in mumbai",
];
const skip = new Set(["node_modules", ".git", ".astro", "check-copy.mjs", "package-lock.json"]);
const exts = /\.(astro|ts|mjs|js|css|html|md|toml|json|svg|txt|sh)$/;

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

let problems = 0;
for (const f of files) {
  const lines = readFileSync(f, "utf8").split("\n");
  lines.forEach((line, i) => {
    if (line.includes(EM_DASH)) { problems++; console.log(`${f}:${i + 1}  em dash`); }
    const lower = line.toLowerCase();
    for (const w of banned) if (new RegExp(`\\b${w}`).test(lower)) { problems++; console.log(`${f}:${i + 1}  "${w}"`); }
  });
}
console.log(problems ? `${problems} problem(s)` : `Clean: ${files.length} files, zero em dashes, no banned words.`);
process.exit(problems ? 1 : 0);
