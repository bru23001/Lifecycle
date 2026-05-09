/**
 * Clamps Project.currentPhase into 1–14 in the database (idempotent).
 * Use when rows are corrupt or before relying on gate logic.
 * Usage: npm run repair-workspace-phases
 */
import "dotenv/config";

import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.$executeRaw(
    Prisma.sql`
      UPDATE Project
      SET currentPhase = CASE
        WHEN currentPhase < 1 THEN 1
        WHEN currentPhase > 14 THEN 14
        ELSE currentPhase
      END
      WHERE currentPhase < 1 OR currentPhase > 14
    `,
  );

  console.log(`repair-workspace-phases OK (rows updated: ${result}).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
