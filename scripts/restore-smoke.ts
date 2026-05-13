/**
 * CI smoke drill for backup/restore flow:
 * 1) create backup, 2) restore from latest backup, 3) verify seed-smoke.
 */
import { execSync } from "node:child_process";
import { readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function latestBackupDir(): Promise<string> {
  const backupsRoot = path.join(root, "vault", "backups");
  const entries = await readdir(backupsRoot, { withFileTypes: true });
  const dirs = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  const latest = dirs.at(-1);
  if (!latest) {
    throw new Error("No backup directories found under vault/backups.");
  }
  return path.join("vault", "backups", latest);
}

async function main() {
  execSync("npx tsx scripts/backup.ts", {
    cwd: root,
    stdio: "inherit",
    env: process.env,
  });

  const latest = await latestBackupDir();
  execSync(`npx tsx scripts/restore.ts ${latest}`, {
    cwd: root,
    stdio: "inherit",
    env: process.env,
  });

  execSync("npm run seed-smoke", {
    cwd: root,
    stdio: "inherit",
    env: process.env,
  });

  console.log(`[restore-smoke] OK using ${latest}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
