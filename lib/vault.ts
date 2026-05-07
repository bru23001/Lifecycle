import { mkdir, writeFile } from "fs/promises";
import path from "node:path";

export function getVaultRoot(): string {
  return path.join(process.cwd(), "vault");
}

/** Writes UTF-8 markdown under `vault/`. Creates parent directories. `relativePath` uses POSIX segments (e.g. default/A-0/abc_v1.md). */
export async function writeVaultMarkdown(
  relativePath: string,
  body: string,
): Promise<void> {
  const normalized = relativePath.replace(/^\/+/, "");
  const fullPath = path.join(getVaultRoot(), ...normalized.split("/"));
  await mkdir(path.dirname(fullPath), { recursive: true });
  await writeFile(fullPath, body, "utf8");
}
