/**
 * Validates relational integrity beyond seed-smoke counts (dangling trace links).
 * Run: npm run data-integrity-check
 */
import "dotenv/config";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function runDataIntegrityCheck(): Promise<void> {
  const project = await prisma.project.findUnique({
    where: { slug: "demo" },
    select: { id: true },
  });

  if (!project) {
    throw new Error(
      'data-integrity-check failed: no project with slug "demo". Run: npm run seed',
    );
  }

  const projectId = project.id;

  const reqs = await prisma.requirement.findMany({
    where: { projectId },
    select: { id: true },
  });
  const feats = await prisma.feature.findMany({
    where: { projectId },
    select: { id: true },
  });
  const reqSet = new Set(reqs.map((r) => r.id));
  const featSet = new Set(feats.map((f) => f.id));

  const links = await prisma.traceLink.findMany({
    where: { projectId, deletedAt: null },
    select: {
      id: true,
      fromKind: true,
      fromId: true,
      toKind: true,
      toId: true,
    },
  });

  const dangling: string[] = [];

  for (const l of links) {
    if (l.fromKind === "requirement" && !reqSet.has(l.fromId)) {
      dangling.push(`link ${l.id}: from requirement ${l.fromId} missing`);
    }
    if (l.fromKind === "feature" && !featSet.has(l.fromId)) {
      dangling.push(`link ${l.id}: from feature ${l.fromId} missing`);
    }
    if (l.toKind === "requirement" && !reqSet.has(l.toId)) {
      dangling.push(`link ${l.id}: to requirement ${l.toId} missing`);
    }
    if (l.toKind === "feature" && !featSet.has(l.toId)) {
      dangling.push(`link ${l.id}: to feature ${l.toId} missing`);
    }
  }

  if (dangling.length > 0) {
    throw new Error(
      `data-integrity-check failed: dangling trace endpoints:\n${dangling.slice(0, 20).join("\n")}${dangling.length > 20 ? `\n… and ${dangling.length - 20} more` : ""}`,
    );
  }

  console.log(
    `data-integrity-check OK: demo project trace links (${links.length}) reference valid requirement/feature rows.`,
  );
}

async function main() {
  await runDataIntegrityCheck();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
