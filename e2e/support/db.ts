import { Prisma, PrismaClient } from "@prisma/client";

import type { GateId } from "@/lib/gateRules";
import { evaluateGateForProject } from "@/lib/gateRules";
import { indexLatestGateDecisions } from "@/lib/gateStatus";
import { canOpenGateReview } from "@/lib/phaseTransitions";
import { SOLO_WORKSPACE_USER_EMAIL } from "@/lib/server/current-user";
import { getTemplate } from "@/templates/registry";

import { buildArtifactDataForTemplate, LIFECYCLE_GATE_TEMPLATE_IDS } from "./artifact-payloads";
import { E2E_PROJECT_SLUG, GATE_IDS } from "./constants";

let prismaSingleton: PrismaClient | null = null;

function e2eDatabaseUrl(): string {
  return process.env.E2E_DATABASE_URL ?? process.env.DATABASE_URL ?? "file:./e2e.db";
}

export function getE2ePrisma(): PrismaClient {
  if (!prismaSingleton) {
    const url = e2eDatabaseUrl();
    process.env.DATABASE_URL = url;
    prismaSingleton = new PrismaClient({
      datasources: { db: { url } },
    });
  }
  return prismaSingleton;
}

export async function disconnectE2ePrisma(): Promise<void> {
  if (prismaSingleton) {
    await prismaSingleton.$disconnect();
    prismaSingleton = null;
  }
}

export async function getE2eProjectId(): Promise<string> {
  const prisma = getE2ePrisma();
  const project = await prisma.project.findUnique({
    where: { slug: E2E_PROJECT_SLUG },
    select: { id: true },
  });
  if (!project) {
    throw new Error(`E2E project "${E2E_PROJECT_SLUG}" not found. Run global setup / seed.`);
  }
  return project.id;
}

export async function getProjectPhase(projectId: string): Promise<number> {
  const prisma = getE2ePrisma();
  const row = await prisma.project.findUnique({
    where: { id: projectId },
    select: { currentPhase: true },
  });
  if (!row) throw new Error(`Project ${projectId} not found`);
  return row.currentPhase;
}

export async function getLatestGateDecision(
  projectId: string,
  gateId: GateId,
): Promise<{ decision: string; evidencePassSnapshot: boolean } | null> {
  const prisma = getE2ePrisma();
  const row = await prisma.gateDecision.findFirst({
    where: { projectId, gateId },
    orderBy: { createdAt: "desc" },
    select: { decision: true, evidencePassSnapshot: true },
  });
  return row;
}

export async function countAuditEvents(projectId: string, action: string): Promise<number> {
  const prisma = getE2ePrisma();
  return prisma.auditEntry.count({
    where: { projectId, action },
  });
}

export async function assertGateEvaluationPasses(projectId: string, gateId: GateId): Promise<void> {
  const result = await evaluateGateForProject(projectId, gateId);
  if (!result.pass) {
    const msgs = result.checks.filter((c) => !c.ok).map((c) => c.message);
    throw new Error(
      `Gate ${gateId} evaluation failed during E2E seed:\n${msgs.slice(0, 8).join("\n")}`,
    );
  }
}

export async function assertCanOpenGate(projectId: string, gateId: GateId): Promise<void> {
  const prisma = getE2ePrisma();
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new Error("Project missing");
  const decisions = await prisma.gateDecision.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
    select: { gateId: true, decision: true, evidencePassSnapshot: true, createdAt: true },
  });
  const latest = indexLatestGateDecisions(decisions);
  const eligibility = canOpenGateReview(project.currentPhase, gateId, latest);
  if (!eligibility.ok) {
    throw new Error(`Cannot open ${gateId} at phase ${project.currentPhase}: ${eligibility.reason}`);
  }
}

export async function validateE2eSeedState(projectId: string): Promise<void> {
  for (const gateId of GATE_IDS) {
    await assertGateEvaluationPasses(projectId, gateId);
  }
}

export type SeedLifecycleOptions = {
  reset?: boolean;
};

export async function seedE2eLifecycleProject(options: SeedLifecycleOptions = {}): Promise<string> {
  const prisma = getE2ePrisma();

  const user = await prisma.user.upsert({
    where: { email: SOLO_WORKSPACE_USER_EMAIL },
    create: {
      email: SOLO_WORKSPACE_USER_EMAIL,
      name: "E2E User",
      role: "Project Owner",
      initials: "E2",
    },
    update: { active: true },
  });

  const applicabilityJson = {
    data: true,
    apis: true,
    ui: true,
    modules: true,
    blueprint: false,
    waiverGranted: {
      templateId: "A-4",
      rationale: "E2E harness uses structured waiver for Business Field Report when A-4 is omitted.",
      approvedBy: "E2E Governance",
      approvedAt: "2026-05-16",
    },
  };

  let project = await prisma.project.findUnique({ where: { slug: E2E_PROJECT_SLUG } });

  if (!project || options.reset) {
    if (project) {
      await prisma.gateDecision.deleteMany({ where: { projectId: project.id } });
      await prisma.gateApproverAssignment.deleteMany({ where: { projectId: project.id } });
      await prisma.approvalComment.deleteMany({
        where: { approval: { projectId: project.id } },
      });
      await prisma.approval.deleteMany({ where: { projectId: project.id } });
      await prisma.auditEntry.deleteMany({ where: { projectId: project.id } });
      await prisma.traceLink.deleteMany({ where: { projectId: project.id } });
      await prisma.evidenceItem.deleteMany({ where: { projectId: project.id } });
      await prisma.requirement.deleteMany({ where: { projectId: project.id } });
      await prisma.feature.deleteMany({ where: { projectId: project.id } });
      await prisma.artifact.deleteMany({ where: { projectId: project.id } });
      await prisma.applicabilityRecord.deleteMany({ where: { projectId: project.id } });
    }

    project = await prisma.project.upsert({
      where: { slug: E2E_PROJECT_SLUG },
      create: {
        name: "E2E Lifecycle Project",
        slug: E2E_PROJECT_SLUG,
        ownerId: user.id,
        vaultFolder: "E2E-0001",
        currentPhase: 1,
        applicabilityJson,
        complexityLevel: "Medium",
        namingConformanceNote: "E2E naming conformance verified for gate G6.",
        initialTestSetupNote: "E2E Playwright lifecycle suite with Vitest unit guards.",
      },
      update: {
        currentPhase: 1,
        applicabilityJson,
        complexityLevel: "Medium",
        namingConformanceNote: "E2E naming conformance verified for gate G6.",
        initialTestSetupNote: "E2E Playwright lifecycle suite with Vitest unit guards.",
        archivedAt: null,
      },
    });
  }

  const projectId = project.id;

  await prisma.applicabilityRecord.deleteMany({ where: { projectId } });
  await prisma.applicabilityRecord.createMany({
    data: [
      { projectId, key: "data", applies: true },
      { projectId, key: "apis", applies: true },
      { projectId, key: "ui", applies: true },
      { projectId, key: "modules", applies: true },
      { projectId, key: "blueprint", applies: false, rationale: "E2E optional." },
    ],
  });

  const existingArtifacts = await prisma.artifact.count({ where: { projectId } });
  if (existingArtifacts === 0 || options.reset) {
    await prisma.artifact.deleteMany({ where: { projectId } });
    for (const templateId of LIFECYCLE_GATE_TEMPLATE_IDS) {
      const dataJson = buildArtifactDataForTemplate(templateId);
      const template = getTemplate(templateId);
      const parsed = template.schema.safeParse(dataJson);
      if (!parsed.success) {
        throw new Error(
          `Invalid E2E payload for ${templateId}: ${JSON.stringify(parsed.error.issues[0])}`,
        );
      }
      await prisma.artifact.create({
        data: {
          projectId,
          templateId,
          localId: `${templateId}-v1`,
          version: 1,
          status: "Approved",
          dataJson: dataJson as Prisma.InputJsonValue,
          markdownPath: `vault/E2E-0001/${templateId}-v1.md`,
        },
      });
    }
  }

  const reqCount = await prisma.requirement.count({ where: { projectId } });
  if (reqCount === 0 || options.reset) {
    const crs = await prisma.requirement.create({
      data: {
        projectId,
        localId: "CRS-E2E-001",
        kind: "CRS",
        title: "E2E lifecycle CRS",
        body: "E2E requirement body.",
        status: "Baselined",
      },
    });
    const srs = await prisma.requirement.create({
      data: {
        projectId,
        localId: "SRS-E2E-001",
        kind: "SRS_FR",
        title: "E2E SRS functional",
        body: "E2E SRS body.",
        verificationMethod: "Test",
        status: "Baselined",
      },
    });
    const feat = await prisma.feature.create({
      data: {
        projectId,
        localId: "FEAT-E2E-001",
        title: "E2E feature",
        description: "E2E",
        status: "Baselined",
        scopeStatus: "InScope",
      },
    });
    await prisma.traceLink.create({
      data: {
        projectId,
        fromKind: "requirement",
        fromId: srs.id,
        toKind: "requirement",
        toId: crs.id,
        relation: "derives",
        rationale: "E2E trace derives",
        createdByUserId: user.id,
      },
    });
    await prisma.traceLink.create({
      data: {
        projectId,
        fromKind: "feature",
        fromId: feat.id,
        toKind: "requirement",
        toId: srs.id,
        relation: "implements",
        rationale: "E2E trace implements",
        createdByUserId: user.id,
      },
    });
  }

  const evidenceCount = await prisma.evidenceItem.count({ where: { projectId } });
  if (evidenceCount < GATE_IDS.length || options.reset) {
    await prisma.evidenceItem.deleteMany({ where: { projectId } });
    for (const gateId of GATE_IDS) {
      await prisma.evidenceItem.create({
        data: {
          projectId,
          evidenceCode: `EV-E2E-${gateId}`,
          name: `E2E completion evidence for ${gateId}`,
          description: "Automated E2E gate completion evidence.",
          evidenceType: "document",
          phaseNumber: 1,
          gateCode: gateId,
          classification: "internal",
          status: "linked",
          completenessPercent: 100,
          fileTypeLabel: "document",
        },
      });
    }
  }

  await prisma.gateApproverAssignment.deleteMany({ where: { projectId } });
  for (const gateId of GATE_IDS) {
    await prisma.gateApproverAssignment.create({
      data: {
        projectId,
        gateId,
        userId: user.id,
        approverName: user.name ?? "E2E User",
        approverRole: user.role,
        assignedById: user.id,
      },
    });
  }

  if (options.reset) {
    await prisma.gateDecision.deleteMany({ where: { projectId } });
    await prisma.project.update({
      where: { id: projectId },
      data: { currentPhase: 1 },
    });
  }

  await validateE2eSeedState(projectId);
  return projectId;
}
