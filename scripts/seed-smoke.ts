/**
 * Quick DB sanity check after `npm run seed` (expects slug=demo and relational rows).
 * Run: npm run seed-smoke
 */
import "dotenv/config";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const project = await prisma.project.findUnique({
    where: { slug: "demo" },
    include: {
      _count: {
        select: {
          requirements: true,
          features: true,
          traceLinks: true,
        },
      },
    },
  });

  if (!project) {
    throw new Error(
      'seed-smoke failed: no project with slug "demo". Run: npm run seed',
    );
  }

  const { requirements, features, traceLinks } = project._count;
  if (requirements < 1) {
    throw new Error("seed-smoke failed: demo project has no requirements.");
  }
  if (features < 1) {
    throw new Error("seed-smoke failed: demo project has no features.");
  }
  if (traceLinks < 1) {
    throw new Error("seed-smoke failed: demo project has no trace links.");
  }

  console.log(
    `seed-smoke OK: demo (${project.id.slice(0, 8)}…) requirements=${requirements} features=${features} traceLinks=${traceLinks}`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
