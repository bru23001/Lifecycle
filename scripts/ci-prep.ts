/**
 * Optional pre-CI cleanup to reduce intermittent Next.js `.next` chunk drift in automated runners.
 * Runs `npm run clean` when `CI=true`/`CI=1` (GitHub/GitLab) or `PRE_CI_CLEAN=1` is set.
 */
import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function shouldClean(): boolean {
  if (process.env.PRE_CI_CLEAN === "1") return true;
  const v = process.env.CI;
  return v === "true" || v === "1";
}

function main(): void {
  if (!shouldClean()) {
    return;
  }
  console.log("[ci-prep] CI/PRE_CI_CLEAN — running `npm run clean` before pipeline.");
  execSync("npm run clean", {
    cwd: root,
    stdio: "inherit",
    env: process.env,
  });
}

main();
