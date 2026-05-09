/**
 * Writes a timestamped release bundle under vault/releases/<stamp>/.
 * Run after pre-release, or standalone: npx tsx scripts/release-snapshot.ts
 *
 * Optional: PRE_RELEASE_REPORT_JSON — JSON array of { name, ok, durationMs?, error? }
 */
import "dotenv/config";

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { PrismaClient } from "@prisma/client";

import type { PreReleaseStep } from "./release-types";

const prisma = new PrismaClient();

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function safeStamp(): string {
  return new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
}

function readPackageVersion(): string {
  const pkgPath = path.join(root, "package.json");
  const raw = fs.readFileSync(pkgPath, "utf8");
  const pkg = JSON.parse(raw) as { version?: string };
  return pkg.version ?? "0.0.0";
}

function readGitSha(): string | null {
  try {
    return execSync("git rev-parse --short HEAD", {
      cwd: root,
      encoding: "utf8",
    }).trim();
  } catch {
    return null;
  }
}

export type { PreReleaseStep } from "./release-types";

export async function writeReleaseSnapshot(steps?: PreReleaseStep[]): Promise<string> {
  const stamp = safeStamp();
  const outDir = path.join(root, "vault", "releases", stamp);
  fs.mkdirSync(outDir, { recursive: true });

  const demo = await prisma.project.findUnique({
    where: { slug: "demo" },
    include: {
      _count: {
        select: {
          artifacts: true,
          gateDecisions: true,
          requirements: true,
          features: true,
          traceLinks: true,
        },
      },
    },
  });

  const report = {
    generatedAt: new Date().toISOString(),
    appVersion: readPackageVersion(),
    gitSha: readGitSha(),
    node: process.version,
    platform: process.platform,
    preReleaseSteps: steps ?? null,
    demoProject: demo
      ? {
          id: demo.id,
          slug: demo.slug,
          name: demo.name,
          vaultFolder: demo.vaultFolder,
          currentPhase: demo.currentPhase,
          counts: demo._count,
        }
      : null,
  };

  const reportPath = path.join(outDir, "release-report.json");
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  const readmePath = path.join(outDir, "README.txt");
  fs.writeFileSync(
    readmePath,
    [
      "Lifecycle Platform — release snapshot",
      "",
      `Folder: ${outDir}`,
      `Report: release-report.json`,
      "",
      "Regenerate with: npm run release-snapshot",
      "",
    ].join("\n"),
    "utf8",
  );

  console.log(`release-snapshot OK: ${reportPath}`);
  return outDir;
}

async function main() {
  let steps: PreReleaseStep[] | undefined;
  const raw = process.env.PRE_RELEASE_REPORT_JSON?.trim();
  if (raw) {
    try {
      steps = JSON.parse(raw) as PreReleaseStep[];
    } catch {
      console.warn("release-snapshot: invalid PRE_RELEASE_REPORT_JSON, ignoring");
    }
  }
  await writeReleaseSnapshot(steps);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
