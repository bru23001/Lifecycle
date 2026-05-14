/**
 * Prisma seed — idempotent for local / CI (`npm run seed`, `prisma migrate reset`).
 *
 * **Global reset (default):** When `SEED_FULL_GLOBAL_RESET` is unset or any value other than
 * `0` / `false` / `no`, the script deletes platform-wide rows then recreates them:
 * `ApprovalComment` → `Approval` → `AuditEntry`, then all `LifecyclePhaseConfig`,
 * `TemplateRegistryEntry`, `GateRuleConfig`, `RoleConfig`, and `AppSetting`.
 *
 * **Safe mode:** `SEED_FULL_GLOBAL_RESET=0` skips that wipe and upserts lifecycle, templates,
 * gates, roles, and app settings by natural keys so approvals, audit entries, and any manual
 * platform edits outside those keyed rows are preserved.
 *
 * **Demo project only (always):** trace links, requirements, features, evidence, applicability
 * for `slug === "demo"` are replaced after the solo user + owner are ensured.
 *
 * FK order (full reset): children before parents where Prisma `deleteMany` does not cascade.
 */
import "dotenv/config";

import { Prisma, PrismaClient } from "@prisma/client";

import { SOLO_WORKSPACE_USER_EMAIL } from "../lib/server/current-user";
import {
  buildGateSeedRows,
  buildLifecycleSeedRows,
  buildRoleSeedRows,
  buildTemplateSeedRows,
  defaultExportSettings,
  defaultLocalStorageSettings,
} from "../lib/server/settings-seed-builders";

const prisma = new PrismaClient();

function isFullGlobalReset(): boolean {
  const v = process.env.SEED_FULL_GLOBAL_RESET?.trim().toLowerCase();
  if (v === "0" || v === "false" || v === "no") return false;
  return true;
}

async function wipeGlobalTables(): Promise<void> {
  await prisma.approvalComment.deleteMany();
  await prisma.approval.deleteMany();
  await prisma.auditEntry.deleteMany();
  await prisma.lifecyclePhaseConfig.deleteMany();
  await prisma.templateRegistryEntry.deleteMany();
  await prisma.gateRuleConfig.deleteMany();
  await prisma.roleConfig.deleteMany();
  await prisma.appSetting.deleteMany();
}

type LifecycleRow = ReturnType<typeof buildLifecycleSeedRows>[number];

async function upsertLifecycleRows(rows: LifecycleRow[]): Promise<void> {
  for (const row of rows) {
    await prisma.lifecyclePhaseConfig.upsert({
      where: { phaseNumber: row.phaseNumber },
      create: row,
      update: {
        name: row.name,
        description: row.description,
        keyDeliverablesJson: row.keyDeliverablesJson,
        requiredArtifactIdsJson: row.requiredArtifactIdsJson,
        status: row.status,
      },
    });
  }
}

type TemplateRow = ReturnType<typeof buildTemplateSeedRows>[number];

async function upsertTemplateRows(rows: TemplateRow[]): Promise<void> {
  for (const row of rows) {
    await prisma.templateRegistryEntry.upsert({
      where: { templateCode: row.templateCode },
      create: row,
      update: {
        name: row.name,
        phaseNumber: row.phaseNumber,
        outputType: row.outputType,
        required: row.required,
        schemaVersion: row.schemaVersion,
        status: row.status,
      },
    });
  }
}

type GateRow = ReturnType<typeof buildGateSeedRows>[number];

async function upsertGateRows(rows: GateRow[]): Promise<void> {
  for (const row of rows) {
    await prisma.gateRuleConfig.upsert({
      where: { gateCode: row.gateCode },
      create: row,
      update: {
        gateName: row.gateName,
        relatedPhaseNumber: row.relatedPhaseNumber,
        requiredInputIdsJson: row.requiredInputIdsJson,
        requiredEvidenceCount: row.requiredEvidenceCount,
        requiredApproverRolesJson: row.requiredApproverRolesJson,
        decisionRule: row.decisionRule,
        unlocksPhaseNumber: row.unlocksPhaseNumber,
        status: row.status,
      },
    });
  }
}

type RoleRow = ReturnType<typeof buildRoleSeedRows>[number];

async function upsertRoleRows(rows: RoleRow[]): Promise<void> {
  for (const row of rows) {
    await prisma.roleConfig.upsert({
      where: { roleId: row.roleId },
      create: row,
      update: {
        roleName: row.roleName,
        description: row.description,
        permissionsJson: row.permissionsJson,
        systemRole: row.systemRole,
      },
    });
  }
}

type AppSettingRow = { key: string; value: Prisma.InputJsonValue };

async function upsertAppSettingRows(rows: AppSettingRow[]): Promise<void> {
  for (const row of rows) {
    await prisma.appSetting.upsert({
      where: { key: row.key },
      create: row,
      update: { value: row.value },
    });
  }
}

async function main() {
  const fullGlobal = isFullGlobalReset();
  if (fullGlobal) {
    await wipeGlobalTables();
  } else {
    console.log(
      "[seed] SEED_FULL_GLOBAL_RESET=0 — preserving approvals/audit; upserting keyed platform rows only.",
    );
  }

  const user = await prisma.user.upsert({
    where: { email: SOLO_WORKSPACE_USER_EMAIL },
    create: {
      email: SOLO_WORKSPACE_USER_EMAIL,
      name: "Solo User",
      role: "Project Owner",
      initials: "SU",
      active: true,
    },
    update: {
      name: "Solo User",
      role: "Project Owner",
      initials: "SU",
      active: true,
    },
  });

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
      ownerId: user.id,
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
      ownerId: user.id,
      vaultFolder: "IDEA-0002",
      currentPhase: 6,
      applicabilityJson,
      complexityLevel: "Medium",
    },
  });

  const lifecycleRows = buildLifecycleSeedRows();
  const templateRows = buildTemplateSeedRows();
  const gateRows = buildGateSeedRows();
  const roleSeedRows = buildRoleSeedRows();

  const exportPayload = defaultExportSettings();
  const storagePayload = defaultLocalStorageSettings();
  const appSettingRows: AppSettingRow[] = [
    { key: "export_settings", value: exportPayload as Prisma.InputJsonValue },
    { key: "local_storage_settings", value: storagePayload as Prisma.InputJsonValue },
  ];

  if (fullGlobal) {
    await prisma.lifecyclePhaseConfig.createMany({ data: lifecycleRows });
    await prisma.templateRegistryEntry.createMany({ data: templateRows });
    await prisma.gateRuleConfig.createMany({ data: gateRows });
    await prisma.roleConfig.createMany({ data: roleSeedRows });
    await prisma.appSetting.createMany({ data: appSettingRows });
  } else {
    await upsertLifecycleRows(lifecycleRows);
    await upsertTemplateRows(templateRows);
    await upsertGateRows(gateRows);
    await upsertRoleRows(roleSeedRows);
    await upsertAppSettingRows(appSettingRows);
  }

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
      rationale: "Seed: SRS derives from CRS for demo traceability.",
      confidence: "high",
      evidenceReference: "seed:trace-srs-crs",
      createdByUserId: user.id,
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
      rationale: "Seed: feature implements SRS functional requirement.",
      confidence: "medium",
      evidenceReference: "seed:trace-feat-srs",
      createdByUserId: user.id,
    },
  });

  const templateCount = templateRows.length;
  const mode = fullGlobal ? "full-global-reset" : "demo-plus-upserts";
  console.log(
    [
      "Seed OK",
      `mode=${mode}`,
      `user=${user.email} id=${user.id}`,
      `project="${project.name}" slug=${project.slug} id=${project.id} ownerId=${project.ownerId}`,
      `lifecyclePhases=${lifecycleRows.length} templateRegistry=${templateCount} gateRules=${gateRows.length} roles=${roleSeedRows.length} appSettings=${appSettingRows.length}`,
      "demo: applicability + evidence + CRS/SRS/FEAT + trace links",
    ].join(" | "),
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
