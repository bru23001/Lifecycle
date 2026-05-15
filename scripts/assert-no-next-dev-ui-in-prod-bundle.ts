/**
 * After `next build`, confirms client/server bundles do not embed Next.js dev-only UI
 * (dev overlay / dev indicators). Fails the build if forbidden markers appear — catches
 * misconfiguration where dev tooling would leak into production artifacts.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const nextDir = path.join(root, ".next");

/** Minified or source strings that should exist only in dev overlay / devtools bundles. */
const FORBIDDEN_SUBSTRINGS = [
  "@next/react-dev-overlay",
  "react-dev-overlay",
  "next-dev-overlay",
  "ReactDevOverlay",
  "__NEXT_DEV_OVERLAY",
] as const;

const MAX_FILE_BYTES = 12 * 1024 * 1024;
const EXTENSIONS = new Set([".js", ".mjs", ".cjs"]);

function walkFiles(dir: string, out: string[]): void {
  if (!fs.existsSync(dir)) return;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      walkFiles(abs, out);
    } else if (ent.isFile()) {
      const ext = path.extname(ent.name);
      if (EXTENSIONS.has(ext)) out.push(abs);
    }
  }
}

function scanFile(abs: string): string | null {
  const st = fs.statSync(abs);
  if (st.size > MAX_FILE_BYTES) return null;
  const text = fs.readFileSync(abs, "utf8");
  for (const needle of FORBIDDEN_SUBSTRINGS) {
    if (text.includes(needle)) {
      return `${path.relative(root, abs)} contains forbidden substring: ${needle}`;
    }
  }
  return null;
}

function main(): void {
  if (!fs.existsSync(nextDir)) {
    console.error("[assert-no-next-dev-ui-in-prod-bundle] Missing `.next` — run `next build` first.");
    process.exit(1);
  }

  const dirs = [
    path.join(nextDir, "static"),
    path.join(nextDir, "server"),
  ];

  const files: string[] = [];
  for (const d of dirs) walkFiles(d, files);

  const failures: string[] = [];
  for (const f of files) {
    const err = scanFile(f);
    if (err) failures.push(err);
  }

  if (failures.length > 0) {
    console.error("[assert-no-next-dev-ui-in-prod-bundle] Production bundle contains dev-only markers:\n");
    for (const line of failures) console.error(`  - ${line}`);
    process.exit(1);
  }

  console.log(
    `[assert-no-next-dev-ui-in-prod-bundle] OK — scanned ${files.length} JS files under .next/static and .next/server.`,
  );
}

main();
