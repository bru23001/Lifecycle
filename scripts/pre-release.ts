/**
 * Solo release gate: validate → templates → migrate → seed → DB checks → HTTP smoke → snapshot.
 * `validate` runs `npm run build`, which uses `scripts/next-build-reliable.ts` (one clean retry on known transient Next.js chunk/page flakes).
 *
 * Environment:
 * - PRE_RELEASE_FAST=1 — skip migrate, route smoke (no server), release snapshot, backup
 * - SKIP_ROUTE_SMOKE=1 — skip spawning next start + HTTP checks
 * - SKIP_RELEASE_SNAPSHOT=1 — skip vault/releases write
 * - SKIP_BACKUP=1 — skip `scripts/backup.ts` (vault/backups snapshot)
 * - SMOKE_PORT=3010 — port for ephemeral next start (default 3010)
 */
import "dotenv/config";

import { execSync, spawn, type ChildProcess } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { PreReleaseStep } from "./release-types";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export type PreReleaseReport = {
  steps: PreReleaseStep[];
  startedAt: string;
  finishedAt?: string;
};

async function waitForHttpOk(url: string, timeoutMs: number): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  let lastErr: unknown;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url, { redirect: "follow" });
      if (res.ok) {
        return;
      }
      lastErr = new Error(`HTTP ${res.status}`);
    } catch (e) {
      lastErr = e;
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  throw new Error(
    `Timed out waiting for ${url}: ${lastErr instanceof Error ? lastErr.message : String(lastErr)}`,
  );
}

function runNpm(script: string): void {
  execSync(`npm run ${script}`, { cwd: root, stdio: "inherit", env: process.env });
}

function runMigrateDeploy(): void {
  execSync("npx prisma migrate deploy", {
    cwd: root,
    stdio: "inherit",
    env: { ...process.env, PRISMA_HIDE_UPDATE_MESSAGE: "1" },
  });
}

/** Ensures ephemeral `next start` is torn down on Ctrl+C / SIGTERM (best-effort). */
function attachSmokeCleanup(proc: ChildProcess): () => void {
  const onSignal = () => {
    try {
      if (proc.exitCode === null) {
        proc.kill("SIGTERM");
      }
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

async function main() {
  const fast = process.env.PRE_RELEASE_FAST === "1";
  const skipRoute =
    process.env.SKIP_ROUTE_SMOKE === "1" || fast;
  const skipSnapshot =
    process.env.SKIP_RELEASE_SNAPSHOT === "1" || fast;
  const skipBackup = process.env.SKIP_BACKUP === "1" || fast;

  const report: PreReleaseReport = {
    steps: [],
    startedAt: new Date().toISOString(),
  };

  async function step(name: string, fn: () => void | Promise<void>): Promise<void> {
    const t0 = Date.now();
    try {
      await fn();
      report.steps.push({
        name,
        ok: true,
        durationMs: Date.now() - t0,
      });
      console.log(`[pre-release] OK ${name} (${Date.now() - t0}ms)`);
    } catch (e) {
      const err = e instanceof Error ? e.message : String(e);
      report.steps.push({
        name,
        ok: false,
        durationMs: Date.now() - t0,
        error: err,
      });
      console.error(`[pre-release] FAIL ${name}: ${err}`);
      throw e;
    }
  }

  await step("validate", () => runNpm("validate"));
  await step("check-templates", () => runNpm("check-templates"));

  if (!skipBackup) {
    await step("backup", () => {
      execSync("npx tsx scripts/backup.ts", {
        cwd: root,
        stdio: "inherit",
        env: process.env,
      });
    });
  } else {
    console.log("[pre-release] SKIP backup (PRE_RELEASE_FAST or SKIP_BACKUP)");
  }

  if (!fast) {
    await step("migrate-deploy", () => runMigrateDeploy());
    await step("db-phase-sanity", () => runNpm("db-phase-sanity"));
  } else {
    console.log("[pre-release] SKIP migrate-deploy (PRE_RELEASE_FAST=1)");
  }

  await step("seed", () => runNpm("seed"));
  await step("seed-smoke", () => runNpm("seed-smoke"));
  await step("data-integrity-check", () => runNpm("data-integrity-check"));

  if (!skipRoute) {
    const smokePort = process.env.SMOKE_PORT ?? "3010";
    const baseUrl = `http://127.0.0.1:${smokePort}`;
    await step("route-smoke", async () => {
      const proc = spawn(
        "npx",
        ["next", "start", "-H", "127.0.0.1", "-p", smokePort],
        {
          cwd: root,
          stdio: ["ignore", "pipe", "pipe"],
          env: { ...process.env },
          detached: false,
        },
      );

      let bootLog = "";
      const cap = (d: Buffer) => {
        bootLog += d.toString();
        if (bootLog.length > 8000) bootLog = bootLog.slice(-8000);
      };
      proc.stdout?.on("data", cap);
      proc.stderr?.on("data", cap);

      const detachSignals = attachSmokeCleanup(proc);
      try {
        await waitForHttpOk(`${baseUrl}/`, 120_000);
        execSync("npx tsx scripts/route-smoke.ts", {
          cwd: root,
          stdio: "inherit",
          env: { ...process.env, BASE_URL: baseUrl },
        });
      } catch (e) {
        console.error("[pre-release] next start logs (tail):\n", bootLog);
        throw e;
      } finally {
        detachSignals();
        try {
          proc.kill("SIGTERM");
        } catch {
          /* ignore */
        }
        await new Promise((r) => setTimeout(r, 800));
      }
    });
  } else {
    console.log("[pre-release] SKIP route-smoke (PRE_RELEASE_FAST or SKIP_ROUTE_SMOKE)");
  }

  report.finishedAt = new Date().toISOString();

  if (!skipSnapshot) {
    await step("release-snapshot", () => {
      execSync("npx tsx scripts/release-snapshot.ts", {
        cwd: root,
        stdio: "inherit",
        env: {
          ...process.env,
          PRE_RELEASE_REPORT_JSON: JSON.stringify(report.steps),
        },
      });
    });
  } else {
    console.log("[pre-release] SKIP release-snapshot (PRE_RELEASE_FAST or SKIP_RELEASE_SNAPSHOT)");
  }

  console.log("[pre-release] All requested steps completed.");
}

main().catch(() => process.exit(1));
