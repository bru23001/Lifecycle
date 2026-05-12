/**
 * Prisma-backed settings platform API (replaces JSON file + mocks).
 * Recent activity persists in `AppSetting` under `settings_recent_activity` (empty until first save/import).
 */
import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { formatDateTimeLabel } from "@/lib/server/helpers";
import { getCurrentUserDisplay } from "@/lib/server/current-user";
import {
  buildGateSeedRows,
  buildLifecycleSeedRows,
  buildRoleSeedRows,
  buildTemplateSeedRows,
  defaultExportSettings,
  defaultLocalStorageSettings,
} from "@/lib/server/settings-seed-builders";
import {
  SETTINGS_DEFAULT_ACTION_STATE,
  SETTINGS_QUICK_ACTIONS,
  SETTINGS_SYSTEM_NAV,
  withActiveSection,
} from "@/lib/server/settings-ui";
import { WORKSPACE_PHASES } from "@/lib/workspacePhases";
import type {
  ExportSettings,
  GateRuleSetting,
  LifecyclePhaseSetting,
  LocalStorageSettings,
  RolePermissionEntry,
  RolePermissionSetting,
  SettingsActivity,
  SettingsPageData,
  SettingsSectionId,
  SystemOverview,
  TemplateRegistryItem,
} from "@/types/settings.types";

export const EXPORT_SETTINGS_KEY = "export_settings";
export const LOCAL_STORAGE_SETTINGS_KEY = "local_storage_settings";
export const RECENT_ACTIVITY_KEY = "settings_recent_activity";

function phaseTitleForNumber(phaseNumber: number): string {
  const p = WORKSPACE_PHASES.find((x) => x.index === phaseNumber);
  return p?.title ?? `Phase ${phaseNumber}`;
}

function parseStringArray(json: unknown): string[] {
  if (Array.isArray(json)) return json.filter((x): x is string => typeof x === "string");
  return [];
}

function coerceDecisionRule(v: string): GateRuleSetting["decisionRule"] {
  const allowed: GateRuleSetting["decisionRule"][] = [
    "single_approver",
    "majority",
    "unanimous",
    "role_based",
  ];
  return allowed.includes(v as GateRuleSetting["decisionRule"])
    ? (v as GateRuleSetting["decisionRule"])
    : "single_approver";
}

function coerceTemplateStatus(v: string): TemplateRegistryItem["status"] {
  const allowed: TemplateRegistryItem["status"][] = ["active", "draft", "deprecated", "archived"];
  return allowed.includes(v as TemplateRegistryItem["status"])
    ? (v as TemplateRegistryItem["status"])
    : "active";
}

function coerceOutputType(v: string): TemplateRegistryItem["outputType"] {
  const allowed: TemplateRegistryItem["outputType"][] = ["markdown", "json", "both"];
  return allowed.includes(v as TemplateRegistryItem["outputType"])
    ? (v as TemplateRegistryItem["outputType"])
    : "both";
}

function coerceLifecycleStatus(v: string): LifecyclePhaseSetting["status"] {
  const allowed: LifecyclePhaseSetting["status"][] = ["active", "inactive", "draft"];
  return allowed.includes(v as LifecyclePhaseSetting["status"])
    ? (v as LifecyclePhaseSetting["status"])
    : "active";
}

function coerceGateStatus(v: string): GateRuleSetting["status"] {
  const allowed: GateRuleSetting["status"][] = ["active", "draft", "inactive"];
  return allowed.includes(v as GateRuleSetting["status"]) ? (v as GateRuleSetting["status"]) : "active";
}

function parsePermissionsJson(json: unknown): RolePermissionEntry[] {
  if (!Array.isArray(json)) return [];
  const out: RolePermissionEntry[] = [];
  for (const row of json) {
    if (!row || typeof row !== "object") continue;
    const r = row as Record<string, unknown>;
    if (typeof r.module !== "string") continue;
    out.push({
      module: r.module as RolePermissionEntry["module"],
      view: Boolean(r.view),
      create: Boolean(r.create),
      edit: Boolean(r.edit),
      delete: Boolean(r.delete),
      approve: Boolean(r.approve),
      export: Boolean(r.export),
      admin: Boolean(r.admin),
    });
  }
  return out;
}

function parseExportSettings(json: unknown): ExportSettings {
  if (!json || typeof json !== "object") return defaultExportSettings();
  const o = json as Record<string, unknown>;
  const base = defaultExportSettings();
  try {
    return {
      formats: { ...base.formats, ...(o.formats as ExportSettings["formats"]) },
      packageRules: { ...base.packageRules, ...(o.packageRules as ExportSettings["packageRules"]) },
      namingRules: { ...base.namingRules, ...(o.namingRules as ExportSettings["namingRules"]) },
    };
  } catch {
    return defaultExportSettings();
  }
}

function parseLocalStorageSettings(json: unknown): LocalStorageSettings {
  if (!json || typeof json !== "object") return defaultLocalStorageSettings();
  const o = json as Record<string, unknown>;
  const base = defaultLocalStorageSettings();
  try {
    return {
      paths: { ...base.paths, ...(o.paths as LocalStorageSettings["paths"]) },
      usage: { ...base.usage, ...(o.usage as LocalStorageSettings["usage"]) },
      retention: { ...base.retention, ...(o.retention as LocalStorageSettings["retention"]) },
      backupSync: { ...base.backupSync, ...(o.backupSync as LocalStorageSettings["backupSync"]) },
    };
  } catch {
    return defaultLocalStorageSettings();
  }
}

function parseRecentActivity(json: unknown): SettingsActivity[] {
  if (!Array.isArray(json)) return [];
  const out: SettingsActivity[] = [];
  for (const row of json) {
    if (!row || typeof row !== "object") continue;
    const r = row as Record<string, unknown>;
    if (typeof r.id !== "string" || typeof r.eventType !== "string") continue;
    out.push({
      id: r.id,
      eventType: r.eventType as SettingsActivity["eventType"],
      title: typeof r.title === "string" ? r.title : "Activity",
      actorName: typeof r.actorName === "string" ? r.actorName : "—",
      timestampLabel: typeof r.timestampLabel === "string" ? r.timestampLabel : "—",
      href: typeof r.href === "string" ? r.href : undefined,
    });
  }
  return out;
}

function countPermissionCells(entries: RolePermissionEntry[]): number {
  return entries.reduce(
    (acc, p) =>
      acc +
      (p.view ? 1 : 0) +
      (p.create ? 1 : 0) +
      (p.edit ? 1 : 0) +
      (p.delete ? 1 : 0) +
      (p.approve ? 1 : 0) +
      (p.export ? 1 : 0) +
      (p.admin ? 1 : 0),
    0,
  );
}

function formatBytesLabel(used: number, quota?: number): string {
  const mb = (n: number) => `${Math.max(0, Math.round(n / (1024 * 1024)))} MB`;
  if (quota && quota > 0) return `${mb(used)} used / ${mb(quota)} limit`;
  return `${mb(used)} used`;
}

function exportFormatsLabels(f: ExportSettings): string[] {
  const labels: Record<keyof ExportSettings["formats"], string> = {
    markdown: "Markdown",
    jsonEvidence: "JSON",
    pdf: "PDF",
    csv: "CSV",
    zip: "ZIP",
  };
  return (Object.entries(f.formats) as [keyof ExportSettings["formats"], boolean][])
    .filter(([, on]) => on)
    .map(([k]) => labels[k]);
}

async function upsertAppJson(
  tx: Prisma.TransactionClient,
  key: string,
  value: Prisma.InputJsonValue,
): Promise<void> {
  await tx.appSetting.upsert({
    where: { key },
    create: { key, value },
    update: { value },
  });
}

async function applyLifecycleDefaults(tx: Prisma.TransactionClient): Promise<void> {
  for (const row of buildLifecycleSeedRows()) {
    await tx.lifecyclePhaseConfig.upsert({
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

async function applyTemplateDefaults(tx: Prisma.TransactionClient): Promise<void> {
  for (const row of buildTemplateSeedRows()) {
    await tx.templateRegistryEntry.upsert({
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

async function applyGateDefaults(tx: Prisma.TransactionClient): Promise<void> {
  for (const row of buildGateSeedRows()) {
    await tx.gateRuleConfig.upsert({
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

async function applyRoleDefaults(tx: Prisma.TransactionClient): Promise<void> {
  for (const row of buildRoleSeedRows()) {
    await tx.roleConfig.upsert({
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

async function applyAppSettingDefaults(tx: Prisma.TransactionClient): Promise<void> {
  await upsertAppJson(tx, EXPORT_SETTINGS_KEY, defaultExportSettings() as unknown as Prisma.InputJsonValue);
  await upsertAppJson(
    tx,
    LOCAL_STORAGE_SETTINGS_KEY,
    defaultLocalStorageSettings() as unknown as Prisma.InputJsonValue,
  );
}

/**
 * Ensures platform settings tables are populated (idempotent). Cold DBs self-heal without JSON files.
 */
async function ensurePlatformSettingsSeeded(): Promise<void> {
  const n = await prisma.lifecyclePhaseConfig.count();
  if (n > 0) return;
  await prisma.$transaction(async (tx) => {
    await applyLifecycleDefaults(tx);
    await applyTemplateDefaults(tx);
    await applyGateDefaults(tx);
    await applyRoleDefaults(tx);
    await applyAppSettingDefaults(tx);
  });
}

function buildSystemOverview(input: {
  gateRules: GateRuleSetting[];
  templates: TemplateRegistryItem[];
  roles: RolePermissionSetting[];
  exportSettings: ExportSettings;
  localStorageSettings: LocalStorageSettings;
}): SystemOverview {
  const activeTemplates = input.templates.filter((t) => t.status === "active").length;
  const permCells = input.roles.reduce((acc, r) => acc + countPermissionCells(r.permissions), 0);
  return {
    lifecycleModelName: "Standard 14-Phase",
    gateCount: input.gateRules.length,
    activeTemplateCount: activeTemplates,
    roleCount: input.roles.length,
    permissionRuleCount: permCells,
    exportFormats: exportFormatsLabels(input.exportSettings),
    localStorageUsageLabel: formatBytesLabel(
      input.localStorageSettings.usage.usedBytes,
      input.localStorageSettings.usage.quotaBytes,
    ),
    overviewHref: "/settings/overview",
  };
}

function buildSettingsPageDataFromSources(input: {
  section?: SettingsSectionId;
  userDisplay: Awaited<ReturnType<typeof getCurrentUserDisplay>>;
  phaseRows: Array<{
    phaseNumber: number;
    name: string;
    description: string;
    keyDeliverablesJson: unknown;
    requiredArtifactIdsJson: unknown;
    status: string;
    updatedAt: Date;
  }>;
  templateRows: Array<{
    templateCode: string;
    name: string;
    phaseNumber: number;
    outputType: string;
    required: boolean;
    schemaVersion: string;
    status: string;
  }>;
  gateRows: Array<{
    gateCode: string;
    gateName: string;
    relatedPhaseNumber: number;
    requiredInputIdsJson: unknown;
    requiredEvidenceCount: number;
    requiredApproverRolesJson: unknown;
    decisionRule: string;
    unlocksPhaseNumber: number | null;
    status: string;
  }>;
  roleRows: Array<{
    roleId: string;
    roleName: string;
    description: string;
    systemRole: boolean;
    permissionsJson: unknown;
  }>;
  exportSettings: ExportSettings;
  localStorageSettings: LocalStorageSettings;
  recentActivity: SettingsActivity[];
}): SettingsPageData {
  const activeSection = input.section ?? "lifecycle_configuration";
  const { navigationItems } = withActiveSection(activeSection);

  const phases: LifecyclePhaseSetting[] = input.phaseRows.map((row) => ({
    id: `phase-${row.phaseNumber}`,
    phaseNumber: row.phaseNumber,
    name: row.name,
    description: row.description,
    keyDeliverables: parseStringArray(row.keyDeliverablesJson),
    requiredArtifactIds: parseStringArray(row.requiredArtifactIdsJson),
    status: coerceLifecycleStatus(row.status),
    canEdit: true,
    canReorder: row.phaseNumber <= 5,
  }));

  const templateRegistry: TemplateRegistryItem[] = input.templateRows.map((row) => ({
    id: row.templateCode.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    templateCode: row.templateCode,
    name: row.name,
    phaseNumber: row.phaseNumber,
    phaseName: phaseTitleForNumber(row.phaseNumber),
    outputType: coerceOutputType(row.outputType),
    required: row.required,
    schemaVersion: row.schemaVersion.startsWith("v") ? row.schemaVersion : `v${row.schemaVersion}`,
    status: coerceTemplateStatus(row.status),
    canEdit: true,
    canClone: true,
    canArchive: row.status !== "archived",
  }));

  const gateRules: GateRuleSetting[] = input.gateRows.map((row) => ({
    id: `gate-rule-${row.gateCode.toLowerCase()}`,
    gateCode: row.gateCode,
    gateName: row.gateName,
    relatedPhaseNumber: row.relatedPhaseNumber,
    requiredInputIds: parseStringArray(row.requiredInputIdsJson),
    requiredEvidenceCount: row.requiredEvidenceCount,
    requiredApproverRoles: parseStringArray(row.requiredApproverRolesJson),
    decisionRule: coerceDecisionRule(row.decisionRule),
    unlocksPhaseNumber: row.unlocksPhaseNumber ?? undefined,
    status: coerceGateStatus(row.status),
  }));

  const rolesPermissions: RolePermissionSetting[] = input.roleRows.map((row) => ({
    roleId: row.roleId,
    roleName: row.roleName,
    description: row.description,
    assignedUsersCount: 0,
    systemRole: row.systemRole,
    permissions: parsePermissionsJson(row.permissionsJson),
  }));

  const lastUpdated =
    input.phaseRows.length > 0
      ? new Date(Math.max(...input.phaseRows.map((r) => r.updatedAt.getTime())))
      : new Date();
  const totalArtifactRefs = new Set(phases.flatMap((p) => p.requiredArtifactIds)).size;

  return {
    user: { ...input.userDisplay },
    activeSection,
    navigationItems,
    systemNavigationItems: [...SETTINGS_SYSTEM_NAV],
    lifecycleConfiguration: {
      phases,
      totalPhases: phases.length || 14,
      totalGates: gateRules.length,
      totalArtifacts: totalArtifactRefs || templateRegistry.length,
      activeTemplates: templateRegistry.filter((t) => t.status === "active").length,
      lastUpdatedLabel: formatDateTimeLabel(lastUpdated),
    },
    templateRegistry,
    gateRules,
    rolesPermissions,
    exportSettings: input.exportSettings,
    localStorageSettings: input.localStorageSettings,
    systemOverview: buildSystemOverview({
      gateRules,
      templates: templateRegistry,
      roles: rolesPermissions,
      exportSettings: input.exportSettings,
      localStorageSettings: input.localStorageSettings,
    }),
    recentActivity: input.recentActivity,
    quickActions: [...SETTINGS_QUICK_ACTIONS],
    actionState: {
      ...SETTINGS_DEFAULT_ACTION_STATE,
      hasUnsavedChanges: false,
      canSave: false,
      canReset: false,
      blockers: [],
    },
  };
}

function buildOfflineSettingsPageData(
  section: SettingsSectionId | undefined,
  userDisplay: Awaited<ReturnType<typeof getCurrentUserDisplay>>,
): SettingsPageData {
  const now = new Date();
  return buildSettingsPageDataFromSources({
    section,
    userDisplay,
    phaseRows: buildLifecycleSeedRows().map((row) => ({ ...row, updatedAt: now })),
    templateRows: buildTemplateSeedRows().map((row) => ({ ...row })),
    gateRows: buildGateSeedRows().map((row) => ({ ...row })),
    roleRows: buildRoleSeedRows().map((row) => ({ ...row })),
    exportSettings: defaultExportSettings(),
    localStorageSettings: defaultLocalStorageSettings(),
    recentActivity: [],
  });
}

export async function loadSettingsPageData(
  section?: SettingsSectionId,
): Promise<SettingsPageData> {
  const userDisplay = await getCurrentUserDisplay();
  try {
    await ensurePlatformSettingsSeeded();

    const [phaseRows, templateRows, gateRows, roleRows, exportJson, storageJson, activityJson] =
      await Promise.all([
        prisma.lifecyclePhaseConfig.findMany({ orderBy: { phaseNumber: "asc" } }),
        prisma.templateRegistryEntry.findMany({
          orderBy: [{ phaseNumber: "asc" }, { templateCode: "asc" }],
        }),
        prisma.gateRuleConfig.findMany({ orderBy: { gateCode: "asc" } }),
        prisma.roleConfig.findMany({ orderBy: { roleName: "asc" } }),
        prisma.appSetting.findUnique({ where: { key: EXPORT_SETTINGS_KEY } }),
        prisma.appSetting.findUnique({ where: { key: LOCAL_STORAGE_SETTINGS_KEY } }),
        prisma.appSetting.findUnique({ where: { key: RECENT_ACTIVITY_KEY } }),
      ]);

    return buildSettingsPageDataFromSources({
      section,
      userDisplay,
      phaseRows,
      templateRows,
      gateRows,
      roleRows,
      exportSettings: parseExportSettings(exportJson?.value),
      localStorageSettings: parseLocalStorageSettings(storageJson?.value),
      recentActivity: parseRecentActivity(activityJson?.value),
    });
  } catch {
    // Degrade gracefully when DB is unavailable so settings pages/routes still render.
    return buildOfflineSettingsPageData(section, userDisplay);
  }
}

/**
 * Persists a full `SettingsPageData` slice to Prisma inside one transaction (no partial writes).
 * Table-backed sections are written from `data`; `recentActivity` is stored in `AppSetting`.
 */
export async function saveSettingsPageData(data: SettingsPageData): Promise<void> {
  await prisma.$transaction(async (tx) => {
    for (const p of data.lifecycleConfiguration.phases) {
      await tx.lifecyclePhaseConfig.upsert({
        where: { phaseNumber: p.phaseNumber },
        create: {
          phaseNumber: p.phaseNumber,
          name: p.name,
          description: p.description,
          keyDeliverablesJson: p.keyDeliverables,
          requiredArtifactIdsJson: p.requiredArtifactIds,
          status: p.status,
        },
        update: {
          name: p.name,
          description: p.description,
          keyDeliverablesJson: p.keyDeliverables,
          requiredArtifactIdsJson: p.requiredArtifactIds,
          status: p.status,
        },
      });
    }

    for (const t of data.templateRegistry) {
      await tx.templateRegistryEntry.upsert({
        where: { templateCode: t.templateCode },
        create: {
          templateCode: t.templateCode,
          name: t.name,
          phaseNumber: t.phaseNumber,
          outputType: t.outputType,
          required: t.required,
          schemaVersion: t.schemaVersion.replace(/^v/i, ""),
          status: t.status,
        },
        update: {
          name: t.name,
          phaseNumber: t.phaseNumber,
          outputType: t.outputType,
          required: t.required,
          schemaVersion: t.schemaVersion.replace(/^v/i, ""),
          status: t.status,
        },
      });
    }

    for (const g of data.gateRules) {
      await tx.gateRuleConfig.upsert({
        where: { gateCode: g.gateCode },
        create: {
          gateCode: g.gateCode,
          gateName: g.gateName,
          relatedPhaseNumber: g.relatedPhaseNumber,
          requiredInputIdsJson: g.requiredInputIds,
          requiredEvidenceCount: g.requiredEvidenceCount,
          requiredApproverRolesJson: g.requiredApproverRoles,
          decisionRule: g.decisionRule,
          unlocksPhaseNumber: g.unlocksPhaseNumber ?? null,
          status: g.status,
        },
        update: {
          gateName: g.gateName,
          relatedPhaseNumber: g.relatedPhaseNumber,
          requiredInputIdsJson: g.requiredInputIds,
          requiredEvidenceCount: g.requiredEvidenceCount,
          requiredApproverRolesJson: g.requiredApproverRoles,
          decisionRule: g.decisionRule,
          unlocksPhaseNumber: g.unlocksPhaseNumber ?? null,
          status: g.status,
        },
      });
    }

    for (const r of data.rolesPermissions) {
      await tx.roleConfig.upsert({
        where: { roleId: r.roleId },
        create: {
          roleId: r.roleId,
          roleName: r.roleName,
          description: r.description,
          permissionsJson: r.permissions as unknown as Prisma.InputJsonValue,
          systemRole: r.systemRole,
        },
        update: {
          roleName: r.roleName,
          description: r.description,
          permissionsJson: r.permissions as unknown as Prisma.InputJsonValue,
          systemRole: r.systemRole,
        },
      });
    }

    await upsertAppJson(tx, EXPORT_SETTINGS_KEY, data.exportSettings as unknown as Prisma.InputJsonValue);
    await upsertAppJson(
      tx,
      LOCAL_STORAGE_SETTINGS_KEY,
      data.localStorageSettings as unknown as Prisma.InputJsonValue,
    );
    await upsertAppJson(
      tx,
      RECENT_ACTIVITY_KEY,
      data.recentActivity as unknown as Prisma.InputJsonValue,
    );
  });
}

/**
 * Restores canonical defaults for the requested settings slice (seed-aligned builders).
 */
export async function resetSettingsPageData(section: SettingsSectionId): Promise<SettingsPageData> {
  await prisma.$transaction(async (tx) => {
    switch (section) {
      case "lifecycle_configuration":
        await applyLifecycleDefaults(tx);
        break;
      case "template_registry":
        await applyTemplateDefaults(tx);
        break;
      case "gate_rules":
        await applyGateDefaults(tx);
        break;
      case "roles_permissions":
        await applyRoleDefaults(tx);
        break;
      case "export_settings":
        await upsertAppJson(
          tx,
          EXPORT_SETTINGS_KEY,
          defaultExportSettings() as unknown as Prisma.InputJsonValue,
        );
        break;
      case "local_storage_settings":
        await upsertAppJson(
          tx,
          LOCAL_STORAGE_SETTINGS_KEY,
          defaultLocalStorageSettings() as unknown as Prisma.InputJsonValue,
        );
        break;
      default:
        break;
    }
  });

  return loadSettingsPageData(section);
}
