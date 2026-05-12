/**
 * Restore from a backup folder produced by `scripts/backup.ts`.
 * Usage: npx tsx scripts/restore.ts vault/backups/<timestamp-folder>
 */
import { cp, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import "dotenv/config";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function main() {
  const rel = process.argv[2];
  if (!rel?.trim()) {
    console.error("Usage: npx tsx scripts/restore.ts vault/backups/<timestamp-folder>");
    process.exit(1);
  }
  const backupDir = path.isAbsolute(rel) ? rel : path.join(root, rel);
  const dbBackup = path.join(backupDir, "dev.db");

  const dbUrl = process.env.DATABASE_URL ?? "file:./dev.db";
  const dbFileMatch = dbUrl.match(/file:\.\/(.*)$/);
  const dbRel = dbFileMatch?.[1] ?? "dev.db";
  const dbPath = path.join(root, dbRel);

  await cp(dbBackup, dbPath, { force: true });

  const vaultCopy = path.join(backupDir, "vault-copy");
  const vaultDest = path.join(root, "vault");
  const manifest = await readFile(path.join(backupDir, "manifest.json"), "utf8").catch(() => "");
  if (manifest) {
    console.log("[restore] manifest:", manifest.slice(0, 240));
  }

  await cp(vaultCopy, vaultDest, { recursive: true, force: true });

  console.log(`[restore] OK from ${path.relative(root, backupDir)}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
