/**
 * Ephemeral `next start` + `npm run route-smoke` for CI runners.
 *
 * Env:
 * - SMOKE_PORT (default 3010) — listen port for `next start`
 * - BASE_URL optional override (default http://127.0.0.1:${SMOKE_PORT})
 */
import "dotenv/config";

import { execSync, spawn, type ChildProcess } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function waitForAppReady(origin: string, timeoutMs: number): Promise<void> {
  const healthUrl = `${origin.replace(/\/$/, "")}/api/healthz`;
  const deadline = Date.now() + timeoutMs;
  let lastErr: unknown;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(healthUrl, { redirect: "follow" });
      const text = await res.text();
      if (res.ok && text.includes('"ok":true')) {
        return;
      }
      lastErr = new Error(`HTTP ${res.status} (healthz)`);
    } catch (e) {
      lastErr = e;
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  throw new Error(
    `Timed out waiting for ${healthUrl}: ${lastErr instanceof Error ? lastErr.message : String(lastErr)}`,
  );
}

function attachCleanup(proc: ChildProcess): () => void {
  const onSignal = () => {
    try {
      if (proc.exitCode === null) proc.kill("SIGTERM");
    } catch {
      /* ignore */
    }
  };
  process.on("SIGINT", onSignal);
  process.on("SIGTERM", onSignal);
  return () => {
    process.off("SIGINT", onSignal);
    process.off("SIGTERM", onSignal);
  };
}

async function main(): Promise<void> {
  const smokePort = process.env.SMOKE_PORT ?? "3010";
  const baseUrl = process.env.BASE_URL?.trim() || `http://127.0.0.1:${smokePort}`;

  const proc = spawn("npx", ["next", "start", "-H", "127.0.0.1", "-p", smokePort], {
    cwd: root,
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env },
    detached: false,
  });

  let bootLog = "";
  const cap = (d: Buffer) => {
    bootLog += d.toString();
    if (bootLog.length > 8000) bootLog = bootLog.slice(-8000);
  };
  proc.stdout?.on("data", cap);
  proc.stderr?.on("data", cap);

  const detach = attachCleanup(proc);
  try {
    await waitForAppReady(baseUrl, 120_000);
    // Brief settle after first OK — avoids rare "socket closed" on the first route-smoke fetch.
    await new Promise((r) => setTimeout(r, 500));
    execSync("npx tsx scripts/route-smoke.ts", {
      cwd: root,
      stdio: "inherit",
      env: { ...process.env, BASE_URL: baseUrl },
    });
  } catch (e) {
    console.error("[ci-route-smoke] next start logs (tail):\n", bootLog);
    throw e;
  } finally {
    detach();
    try {
      proc.kill("SIGTERM");
    } catch {
      /* ignore */
    }
    await new Promise((r) => setTimeout(r, 800));
  }
}

main().catch(() => process.exit(1));
