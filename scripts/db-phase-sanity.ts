/**
 * Fails if any Project.currentPhase is outside 1–14 (uses raw SQL so values are not transformed).
 * Run after `prisma migrate deploy`. Usage: npm run db-phase-sanity
 */
import "dotenv/config";

import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const rows = await prisma.$queryRaw<{ id: string; slug: string; currentPhase: number }[]>(
    Prisma.sql`SELECT id, slug, currentPhase FROM Project`,
  );

  let failed = false;
  for (const r of rows) {
    if (r.currentPhase < 1 || r.currentPhase > 14) {
      console.error(
        `[db-phase-sanity] Invalid currentPhase=${r.currentPhase} for project slug=${r.slug} id=${r.id}`,
      );
      failed = true;
    }
  }

  if (failed) {
    console.error(
      "[db-phase-sanity] FAIL: run `npx prisma migrate deploy` then `npm run repair-workspace-phases` if needed.",
    );
    process.exit(1);
  }

  console.log(`db-phase-sanity OK (${rows.length} project row(s)).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
