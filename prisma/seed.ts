import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const applicabilityJson = {
    data: true,
    apis: true,
    ui: true,
    modules: true,
    blueprint: false,
  };

  const project = await prisma.project.upsert({
    where: { slug: "demo" },
    create: {
      name: "Demo project",
      slug: "demo",
      vaultFolder: "IDEA-0002",
      currentPhase: 6,
      applicabilityJson,
      complexityLevel: "Medium",
      namingConformanceNote:
        "Follow Namespace M (STD-ENG-001); artifact IDs match Master Lifecycle vocabulary.",
      initialTestSetupNote:
        "Target: Vitest unit + Playwright smoke; CI runs lint, typecheck, tests.",
    },
    update: {
      name: "Demo project",
      vaultFolder: "IDEA-0002",
      currentPhase: 6,
      applicabilityJson,
      complexityLevel: "Medium",
    },
  });

  await prisma.traceLink.deleteMany({ where: { projectId: project.id } });
  await prisma.requirement.deleteMany({ where: { projectId: project.id } });
  await prisma.feature.deleteMany({ where: { projectId: project.id } });
  await prisma.evidenceItem.deleteMany({ where: { projectId: project.id } });
  await prisma.applicabilityRecord.deleteMany({ where: { projectId: project.id } });

  await prisma.applicabilityRecord.createMany({
    data: [
      { projectId: project.id, key: "data", applies: true },
      { projectId: project.id, key: "apis", applies: true },
      { projectId: project.id, key: "ui", applies: true },
      { projectId: project.id, key: "modules", applies: true },
      { projectId: project.id, key: "blueprint", applies: false, rationale: "Optional for demo workspace." },
    ],
  });

  await prisma.evidenceItem.create({
    data: {
      projectId: project.id,
      evidenceCode: `EV-${new Date().getFullYear()}-0001`,
      name: "[Seed] Governance readiness excerpt",
      description: "Sample persisted evidence row for Evidence Center + exports.",
      evidenceType: "document",
      phaseNumber: 6,
      gateCode: "G5",
      classification: "internal",
      status: "linked",
      completenessPercent: 100,
      fileTypeLabel: "document",
    },
  });

  const crs = await prisma.requirement.create({
    data: {
      projectId: project.id,
      localId: "CRS-001",
      kind: "CRS",
      title: "[Seed] Platform captures lifecycle evidence",
      body: "Demonstration CRS row from prisma seed.",
      status: "Baselined",
    },
  });

  const srs = await prisma.requirement.create({
    data: {
      projectId: project.id,
      localId: "SRS-FR-001",
      kind: "SRS_FR",
      title: "[Seed] User can save artifacts to vault",
      body: "",
      verificationMethod: "Integration test",
      status: "Baselined",
    },
  });

  await prisma.traceLink.create({
    data: {
      projectId: project.id,
      fromKind: "requirement",
      fromId: srs.id,
      toKind: "requirement",
      toId: crs.id,
      relation: "derives",
    },
  });

  const feat = await prisma.feature.create({
    data: {
      projectId: project.id,
      localId: "FEAT-001",
      title: "[Seed] Artifact save flow",
      description: "Maps to SRS-FR-001",
      priority: "P1",
      status: "Baselined",
      scopeStatus: "InScope",
    },
  });

  await prisma.traceLink.create({
    data: {
      projectId: project.id,
      fromKind: "feature",
      fromId: feat.id,
      toKind: "requirement",
      toId: srs.id,
      relation: "implements",
    },
  });

  console.log(
    `Seed OK: project "${project.name}" (slug=${project.slug}, vault=${project.vaultFolder}, phase=${project.currentPhase}, id=${project.id}) — sample CRS/SRS/Feature + trace links.`,
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
