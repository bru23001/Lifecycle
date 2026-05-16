/**
 * Removes `.next`, then runs `prisma generate && next build` once; on known transient Next.js
 * cache/chunk failures, runs `npm run clean` and retries exactly once.
 *
 * Usage: npm run build (see package.json). For a single attempt without retry: npm run build:direct
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const prismaEnv = {
  ...process.env,
  PRISMA_HIDE_UPDATE_MESSAGE: "1",
};

function formatExecError(e: unknown): string {
  const err = e as NodeJS.ErrnoException & {
    stdout?: string | Buffer;
    stderr?: string | Buffer;
  };
  const stdout = err.stdout != null ? String(err.stdout) : "";
  const stderr = err.stderr != null ? String(err.stderr) : "";
  const msg = err.message ?? "";
  return stdout + stderr + msg;
}

/** Run command and capture combined stderr/stdout on failure (no shell — portable across Node typings). */
function execCapture(cmd: string, env: NodeJS.ProcessEnv): { ok: boolean; output: string } {
  try {
    execSync(cmd, {
      cwd: root,
      encoding: "utf8",
      maxBuffer: 24 * 1024 * 1024,
      env,
    });
    return { ok: true, output: "" };
  } catch (e: unknown) {
    return { ok: false, output: formatExecError(e) };
  }
}

function captureBuild(): { ok: boolean; output: string } {
  const gen = execCapture("npx prisma generate", prismaEnv);
  if (!gen.ok) return gen;
  const next = execCapture("npx next build", process.env);
  if (!next.ok) return next;
  return { ok: true, output: "" };
}

/**
 * Narrow patterns observed when `.next` output is inconsistent (clean rebuild usually fixes).
 * Do not broaden — non-transient failures must fail fast without retry.
 */
function isTransientNextBuildFailure(output: string): boolean {
  if (!output) return false;

  if (/Cannot find module '\.\/[0-9]+\.js'/.test(output)) return true;

  if (/MODULE_NOT_FOUND/.test(output) && /\.next[/\\]/.test(output)) return true;

  if (
    /PageNotFoundError/.test(output) &&
    /Cannot find module for page/.test(output)
  ) {
    return true;
  }

  // Stale/partial `.next` (interrupted build) or FS races (e.g. cloud sync on `~/Documents`)
  // can make "Finalizing page optimization" look for `_ssgManifest.js` under the wrong build id.
  if (
    /ENOENT: no such file or directory/.test(output) &&
    /\.next[/\\]static[/\\]/.test(output) &&
    /_ssgManifest\.js/.test(output)
  ) {
    return true;
  }

  return false;
}

function printTail(output: string, maxChars = 14_000): void {
  const tail = output.length > maxChars ? output.slice(-maxChars) : output;
  console.error(tail);
}

function main(): void {
  // Always drop prior `.next` so BUILD_ID and `static/<id>/` stay in sync (avoids ENOENT on
  // manifests after interrupted builds; `node_modules/.cache` is left for faster prisma/tsc).
  const nextOut = path.join(root, ".next");
  fs.rmSync(nextOut, { recursive: true, force: true });

  const first = captureBuild();
  if (first.ok) {
    execSync("npx tsx scripts/assert-no-next-dev-ui-in-prod-bundle.ts", {
      cwd: root,
      stdio: "inherit",
      env: process.env,
    });
    console.log("[next-build-reliable] OK (first attempt)");
    process.exit(0);
  }

  console.error("[next-build-reliable] First attempt failed.\n");
  printTail(first.output);

  if (!isTransientNextBuildFailure(first.output)) {
    console.error(
      "\n[next-build-reliable] Non-transient failure — not retrying (fix the error above).",
    );
    process.exit(1);
  }

  console.warn(
    "\n[next-build-reliable] Transient signature detected — running `npm run clean` and retrying once.\n",
  );

  execSync("npm run clean", {
    cwd: root,
    stdio: "inherit",
    env: process.env,
  });

  const second = captureBuild();
  if (second.ok) {
    execSync("npx tsx scripts/assert-no-next-dev-ui-in-prod-bundle.ts", {
      cwd: root,
      stdio: "inherit",
      env: process.env,
    });
    console.log("[next-build-reliable] OK (after clean + retry)");
    process.exit(0);
  }

  console.error("[next-build-reliable] Second attempt failed.\n");
  printTail(second.output);
  if (isTransientNextBuildFailure(second.output)) {
    console.error(
      "\n[next-build-reliable] Second failure still matches transient signatures (unusual after clean). Try a full clean checkout, set PRE_CI_CLEAN=1 before `npm run ci`, or run `npm run clean && npm run build:direct` to capture a stable log.",
    );
  }
  console.error("\n[next-build-reliable] FAIL — still broken after clean + retry.");
  process.exit(1);
}

main();
