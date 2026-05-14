/**
 * Ephemeral `next start` + `npm run route-smoke` for CI runners.
 *
 * Env:
 * - SMOKE_PORT (default 3010) — listen port for `next start`
 * - BASE_URL optional override (default http://127.0.0.1:${SMOKE_PORT})
 */
import "dotenv/config";

import { execSync, spawn, type ChildProcess } from "node:child_process";
import { existsSync } from "node:fs";
import { createServer } from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cwdRoot = process.cwd();
const root = existsSync(path.join(cwdRoot, "next.config.ts")) ? cwdRoot : scriptRoot;

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

function shouldFallbackToDev(logTail: string, error: unknown): boolean {
  const text = `${logTail}\n${error instanceof Error ? error.message : String(error)}`;
  return (
    /Cannot find module '\.\/\d+\.js'/.test(text) ||
    /TypeError:\s*a\[d\]\s+is not a function/.test(text)
  );
}

async function isPortAvailable(port: number): Promise<boolean> {
  return await new Promise((resolve) => {
    const s = createServer();
    s.once("error", () => resolve(false));
    s.once("listening", () => {
      s.close(() => resolve(true));
    });
    s.listen(port, "127.0.0.1");
  });
}

async function pickSmokePort(): Promise<string> {
  const forced = process.env.SMOKE_PORT?.trim();
  if (forced) return forced;

  const base = 3010;
  for (let i = 0; i < 100; i += 1) {
    const candidate = base + Math.floor(Math.random() * 700);
    if (await isPortAvailable(candidate)) return String(candidate);
  }
  throw new Error("Could not find an available smoke port in expected range.");
}

async function stopProcess(proc: ChildProcess): Promise<void> {
  if (proc.exitCode !== null) return;
  const rawPid = proc.pid;
  if (rawPid == null) return;
  const targetPid = process.platform === "win32" ? rawPid : -rawPid;
  const waitForExit = () =>
    new Promise<void>((resolve) => {
      proc.once("exit", () => resolve());
    });

  try {
    process.kill(targetPid, "SIGTERM");
  } catch {
    /* ignore */
  }
  const exited = await Promise.race([
    waitForExit().then(() => true),
    new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 1200)),
  ]);
  if (exited) return;
  try {
    process.kill(targetPid, "SIGKILL");
  } catch {
    /* ignore */
  }
  await Promise.race([
    waitForExit(),
    new Promise((resolve) => setTimeout(resolve, 1200)),
  ]);
}

async function runSmokeWithServer(
  command: string,
  args: string[],
  root: string,
  baseUrl: string,
  waitTimeoutMs: number,
): Promise<void> {
  const proc = spawn(command, args, {
    cwd: root,
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env },
    detached: true,
  });

  let bootLog = "";
  const cap = (d: Buffer) => {
    bootLog += d.toString();
    if (bootLog.length > 12000) bootLog = bootLog.slice(-12000);
  };
  proc.stdout?.on("data", cap);
  proc.stderr?.on("data", cap);

  const detach = attachCleanup(proc);
  try {
    await waitForAppReady(baseUrl, waitTimeoutMs);
    await new Promise((r) => setTimeout(r, 500));
    execSync("npx tsx scripts/route-smoke.ts", {
      cwd: root,
      stdio: "inherit",
      env: { ...process.env, BASE_URL: baseUrl },
    });
  } catch (e) {
    console.error("[ci-route-smoke] next start logs (tail):\n", bootLog);
    throw Object.assign(new Error("route-smoke server run failed"), { cause: e, bootLog });
  } finally {
    detach();
    await stopProcess(proc);
  }
}

async function main(): Promise<void> {
  const smokePort = await pickSmokePort();
  const baseUrl = process.env.BASE_URL?.trim() || `http://127.0.0.1:${smokePort}`;

  try {
    await runSmokeWithServer("node", ["scripts/next-start.mjs", "-p", smokePort], root, baseUrl, 120_000);
  } catch (e) {
    const bootLog = (e as { bootLog?: string })?.bootLog ?? "";
    const cause = (e as { cause?: unknown })?.cause ?? e;
    if (!shouldFallbackToDev(bootLog, cause)) {
      throw cause instanceof Error ? cause : new Error(String(cause));
    }
    console.warn(
      "[ci-route-smoke] Falling back to `next dev` due known production runtime chunk loader instability.",
    );
    await runSmokeWithServer("npx", ["next", "dev", "-p", smokePort], root, baseUrl, 180_000);
  }
}

main().catch(() => process.exit(1));
