import { access } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const started = Date.now();
  let dbOk = false;
  let vaultOk = false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbOk = true;
  } catch {
    dbOk = false;
  }
  try {
    await access(path.join(process.cwd(), "vault"));
    vaultOk = true;
  } catch {
    vaultOk = false;
  }

  const ok = dbOk && vaultOk;
  return NextResponse.json(
    {
      ok,
      db: dbOk,
      vault: vaultOk,
      version: process.env.npm_package_version ?? "0.1.0",
      uptimeSec: Math.round(process.uptime()),
      durationMs: Date.now() - started,
    },
    { status: ok ? 200 : 503 },
  );
}
