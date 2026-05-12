/**
 * Backup SQLite DB + vault tree for solo-local DR (CYBERCUBE 4.2 baseline).
 * Usage: npx tsx scripts/backup.ts
 */
import { createHash } from "node:crypto";
import { cp, mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import "dotenv/config";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function sha256File(filePath: string): Promise<string> {
  return readFile(filePath).then((buf) =>
    createHash("sha256").update(buf).digest("hex"),
  );
}

async function main() {
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const destDir = path.join(root, "vault", "backups", ts);
  await mkdir(destDir, { recursive: true });

  const dbUrl = process.env.DATABASE_URL ?? "file:./dev.db";
  const dbFileMatch = dbUrl.match(/file:\.\/(.*)$/);
  const dbRel = dbFileMatch?.[1] ?? "dev.db";
  const dbPath = path.join(root, dbRel);

  await cp(dbPath, path.join(destDir, "dev.db"), { force: true });
  const dbSha = await sha256File(path.join(destDir, "dev.db"));
  await writeFile(path.join(destDir, "dev.db.sha256"), `${dbSha}  dev.db\n`);

  const vaultSrc = path.join(root, "vault");
  const vaultDest = path.join(destDir, "vault-copy");
  await mkdir(vaultDest, { recursive: true });
  const skip = new Set(["backups"]);
  for (const name of await readdir(vaultSrc)) {
    if (skip.has(name)) continue;
    const src = path.join(vaultSrc, name);
    const st = await stat(src);
    const dest = path.join(vaultDest, name);
    if (st.isDirectory()) {
      await cp(src, dest, { recursive: true });
    } else {
      await cp(src, dest, { force: true });
    }
  }

  const manifest = {
    createdAt: new Date().toISOString(),
    database: dbRel,
    dbSha256: dbSha,
    note: "Solo-local backup: SQLite file + vault/ (excluding vault/backups).",
  };
  await writeFile(path.join(destDir, "manifest.json"), JSON.stringify(manifest, null, 2));

  console.log(`[backup] OK → ${path.relative(root, destDir)}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
