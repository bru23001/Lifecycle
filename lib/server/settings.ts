/**
 * Prisma-backed settings platform API (replaces JSON file + mocks).
 * Recent activity persists in `AppSetting` under `settings_recent_activity` (empty until first save/import).
 */
import type { Prisma } from "@prisma/client";

import {
  defaultLifecycleAuxPayload,
  ensureLifecycleConfigurationShape,
  mergePhaseExtra,
  phaseExtendedHasContent,
} from "@/lib/lifecycle-settings-defaults";
import {
  mergeGateRuleDetail,
  ensureGateRulesList,
  gateDetailHasPersistableContent,
} from "@/lib/gate-rules-defaults";
import {
  buildRoleExtPersistPayload,
  ensureRolesList,
  mergeRoleDetail,
  parseRoleExtJson,
} from "@/lib/role-settings-defaults";
import {
  mergeTemplateDetail,
  ensureTemplateRegistryList,
  templateDetailHasPersistableContent,
  templateRegistryItemId,
} from "@/lib/template-registry-defaults";
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
  ensureExportSettingsShape,
  ensureLocalStorageSettingsShape,
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
  LifecycleConfigurationBlock,
  LifecycleMilestone,
  LifecyclePhaseExtended,
  LifecyclePhaseSetting,
  LifecycleTransitionRule,
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
export const LIFECYCLE_AUX_KEY = "settings_lifecycle_aux";
export const TEMPLATE_EXT_KEY = "settings_template_registry_ext";
export const GATE_EXT_KEY = "settings_gate_rules_ext";
export const ROLES_EXT_KEY = "settings_roles_ext";

function parseLifecycleAuxJson(raw: unknown): {
  configurationEditUnlocked: boolean;
  milestones: LifecycleMilestone[];
  transitionRules: LifecycleTransitionRule[];
  phaseExtras: Record<string, LifecyclePhaseExtended>;
} {
  if (!raw || typeof raw !== "object") {
    return {
      configurationEditUnlocked: false,
      milestones: [],
      transitionRules: [],
      phaseExtras: {},
    };
  }
  const o = raw as Record<string, unknown>;
  const configurationEditUnlocked = o.configurationEditUnlocked === true;

  const milestones: LifecycleMilestone[] = [];
  if (Array.isArray(o.milestones)) {
    for (const row of o.milestones) {
      if (!row || typeof row !== "object") continue;
      const m = row as Record<string, unknown>;
      if (typeof m.id !== "string" || typeof m.name !== "string") continue;
      milestones.push({
        id: m.id,
        name: m.name,
        phaseNumber: typeof m.phaseNumber === "number" && m.phaseNumber >= 1 ? m.phaseNumber : 1,
        description: typeof m.description === "string" ? m.description : "",
        completionCriteria: typeof m.completionCriteria === "string" ? m.completionCriteria : "",
        requiredArtifactIds: Array.isArray(m.requiredArtifactIds)
          ? m.requiredArtifactIds.filter((x): x is string => typeof x === "string")
          : [],
        requiredEvidenceCount:
          typeof m.requiredEvidenceCount === "number" && Number.isFinite(m.requiredEvidenceCount)
            ? m.requiredEvidenceCount
            : 0,
      });
    }
  }

  const transitionRules: LifecycleTransitionRule[] = [];
  if (Array.isArray(o.transitionRules)) {
    for (const row of o.transitionRules) {
      if (!row || typeof row !== "object") continue;
      const t = row as Record<string, unknown>;
      if (typeof t.id !== "string") continue;
      transitionRules.push({
        id: t.id,
        fromPhaseNumber: typeof t.fromPhaseNumber === "number" ? t.fromPhaseNumber : 1,
        toPhaseNumber: typeof t.toPhaseNumber === "number" ? t.toPhaseNumber : 2,
        triggerCondition: typeof t.triggerCondition === "string" ? t.triggerCondition : "",
        requiredGateCode: typeof t.requiredGateCode === "string" ? t.requiredGateCode : "",
        requiredArtifactIds: Array.isArray(t.requiredArtifactIds)
          ? t.requiredArtifactIds.filter((x): x is string => typeof x === "string")
          : [],
        requiredEvidenceCount:
          typeof t.requiredEvidenceCount === "number" && Number.isFinite(t.requiredEvidenceCount)
            ? t.requiredEvidenceCount
            : 0,
        blockingConditions: typeof t.blockingConditions === "string" ? t.blockingConditions : "",
      });
    }
  }

  const phaseExtras: Record<string, LifecyclePhaseExtended> = {};
  if (o.phaseExtras && typeof o.phaseExtras === "object" && !Array.isArray(o.phaseExtras)) {
    for (const [k, v] of Object.entries(o.phaseExtras as Record<string, unknown>)) {
      if (!v || typeof v !== "object") continue;
      const ex = v as Record<string, unknown>;
      phaseExtras[k] = {
        entryCriteria: typeof ex.entryCriteria === "string" ? ex.entryCriteria : "",
        exitCriteria: typeof ex.exitCriteria === "string" ? ex.exitCriteria : "",
        requiredEvidenceCount:
          typeof ex.requiredEvidenceCount === "number" && Number.isFinite(ex.requiredEvidenceCount)
            ? ex.requiredEvidenceCount
            : 0,
        relatedGateCode: typeof ex.relatedGateCode === "string" ? ex.relatedGateCode : "",
        requiredTemplateIds: Array.isArray(ex.requiredTemplateIds)
          ? ex.requiredTemplateIds.filter((x): x is string => typeof x === "string")
          : [],
        transitionRulesSummary:
          typeof ex.transitionRulesSummary === "string" ? ex.transitionRulesSummary : "",
      };
    }
  }

  return { configurationEditUnlocked, milestones, transitionRules, phaseExtras };
}

function buildLifecycleAuxPersistPayload(lc: LifecycleConfigurationBlock): Prisma.InputJsonValue {
  const phaseExtras: Record<string, LifecyclePhaseExtended> = {};
  for (const p of lc.phases) {
    if (phaseExtendedHasContent(p.extended)) {
      phaseExtras[String(p.phaseNumber)] = p.extended;
    }
  }
  return {
    v: 1,
    configurationEditUnlocked: lc.configurationEditUnlocked,
    milestones: lc.milestones,
    transitionRules: lc.transitionRules,
    phaseExtras,
  } as Prisma.InputJsonValue;
}

function parseTemplateExtJson(raw: unknown): { byCode: Record<string, Record<string, unknown>> } {
  if (!raw || typeof raw !== "object") return { byCode: {} };
  const o = raw as Record<string, unknown>;
  const byCode = o.byCode;
  if (byCode && typeof byCode === "object" && !Array.isArray(byCode)) {
    return { byCode: byCode as Record<string, Record<string, unknown>> };
  }
  return { byCode: {} };
}

function parseGateExtJson(raw: unknown): { byCode: Record<string, Record<string, unknown>> } {
  if (!raw || typeof raw !== "object") return { byCode: {} };
  const o = raw as Record<string, unknown>;
  const byCode = o.byCode;
  if (byCode && typeof byCode === "object" && !Array.isArray(byCode)) {
    return { byCode: byCode as Record<string, Record<string, unknown>> };
  }
  return { byCode: {} };
}

function buildTemplateExtPersistPayload(items: TemplateRegistryItem[]): Prisma.InputJsonValue {
  const byCode: Record<string, TemplateRegistryItem["detail"]> = {};
  for (const t of items) {
    if (templateDetailHasPersistableContent(t.detail)) {
      byCode[t.templateCode] = t.detail;
    }
  }
  return { v: 1, byCode } as Prisma.InputJsonValue;
}

function buildGateExtPersistPayload(rules: GateRuleSetting[]): Prisma.InputJsonValue {
  const byCode: Record<string, GateRuleSetting["detail"]> = {};
  for (const g of rules) {
    if (gateDetailHasPersistableContent(g.detail)) {
      byCode[g.gateCode] = g.detail;
    }
  }
  return { v: 1, byCode } as Prisma.InputJsonValue;
}

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
  return ensureExportSettingsShape(json as ExportSettings);
}

function parseLocalStorageSettings(json: unknown): LocalStorageSettings {
  if (!json || typeof json !== "object") return defaultLocalStorageSettings();
  return ensureLocalStorageSettingsShape(json as LocalStorageSettings);
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
  lifecycleAuxRaw?: unknown;
  templateExtRaw?: unknown;
  gateExtRaw?: unknown;
  rolesExtRaw?: unknown;
}): SettingsPageData {
  const activeSection = input.section ?? "lifecycle_configuration";
  const { navigationItems } = withActiveSection(activeSection);

  const aux = parseLifecycleAuxJson(input.lifecycleAuxRaw);
  const tmplExt = parseTemplateExtJson(input.templateExtRaw);
  const gExt = parseGateExtJson(input.gateExtRaw);
  const rExt = parseRoleExtJson(input.rolesExtRaw);

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
    extended: mergePhaseExtra(row.phaseNumber, aux.phaseExtras),
  }));

  const templateRegistry = ensureTemplateRegistryList(
    input.templateRows.map((row) => ({
      id: templateRegistryItemId(row.templateCode),
      templateCode: row.templateCode,
      name: row.name,
      phaseNumber: row.phaseNumber,
      phaseName: phases.find((p) => p.phaseNumber === row.phaseNumber)?.name ?? phaseTitleForNumber(row.phaseNumber),
      outputType: coerceOutputType(row.outputType),
      required: row.required,
      schemaVersion: row.schemaVersion.startsWith("v") ? row.schemaVersion : `v${row.schemaVersion}`,
      status: coerceTemplateStatus(row.status),
      canEdit: true,
      canClone: true,
      canArchive: row.status !== "archived",
      detail: mergeTemplateDetail(row.templateCode, tmplExt.byCode as Record<string, unknown>),
    })),
  );

  const gateRules: GateRuleSetting[] = ensureGateRulesList(
    input.gateRows.map((row) => ({
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
      detail: mergeGateRuleDetail(row.gateCode, gExt.byCode as Record<string, unknown>),
    })),
  );

  const rolesPermissions: RolePermissionSetting[] = ensureRolesList(
    input.roleRows.map((row) => {
      const detail = mergeRoleDetail(row.roleId, rExt.byRoleId);
      return {
        roleId: row.roleId,
        roleName: row.roleName,
        description: row.description,
        assignedUsersCount: 0,
        systemRole: row.systemRole,
        permissions: parsePermissionsJson(row.permissionsJson),
        detail,
      };
    }),
  );

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
    lifecycleConfiguration: ensureLifecycleConfigurationShape({
      phases,
      totalPhases: phases.length > 0 ? phases.length : 14,
      totalGates: gateRules.length,
      totalArtifacts: totalArtifactRefs || templateRegistry.length,
      activeTemplates: templateRegistry.filter((t) => t.status === "active").length,
      lastUpdatedLabel: formatDateTimeLabel(lastUpdated),
      configurationEditUnlocked: aux.configurationEditUnlocked,
      milestones: aux.milestones,
      transitionRules: aux.transitionRules,
    }),
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

    const [phaseRows, templateRows, gateRows, roleRows, exportJson, storageJson, activityJson, lifecycleAuxRow, templateExtRow, gateExtRow, rolesExtRow] =
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
        prisma.appSetting.findUnique({ where: { key: LIFECYCLE_AUX_KEY } }),
        prisma.appSetting.findUnique({ where: { key: TEMPLATE_EXT_KEY } }),
        prisma.appSetting.findUnique({ where: { key: GATE_EXT_KEY } }),
        prisma.appSetting.findUnique({ where: { key: ROLES_EXT_KEY } }),
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
      lifecycleAuxRaw: lifecycleAuxRow?.value,
      templateExtRaw: templateExtRow?.value,
      gateExtRaw: gateExtRow?.value,
      rolesExtRaw: rolesExtRow?.value,
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

    await upsertAppJson(tx, LIFECYCLE_AUX_KEY, buildLifecycleAuxPersistPayload(data.lifecycleConfiguration));

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

    await upsertAppJson(tx, TEMPLATE_EXT_KEY, buildTemplateExtPersistPayload(data.templateRegistry));

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

    await upsertAppJson(tx, GATE_EXT_KEY, buildGateExtPersistPayload(data.gateRules));

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

    await upsertAppJson(tx, ROLES_EXT_KEY, buildRoleExtPersistPayload(data.rolesPermissions) as unknown as Prisma.InputJsonValue);

    await upsertAppJson(tx, EXPORT_SETTINGS_KEY, ensureExportSettingsShape(data.exportSettings) as unknown as Prisma.InputJsonValue);
    await upsertAppJson(
      tx,
      LOCAL_STORAGE_SETTINGS_KEY,
      ensureLocalStorageSettingsShape(data.localStorageSettings) as unknown as Prisma.InputJsonValue,
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
        await upsertAppJson(
          tx,
          LIFECYCLE_AUX_KEY,
          defaultLifecycleAuxPayload() as unknown as Prisma.InputJsonValue,
        );
        break;
      case "template_registry":
        await applyTemplateDefaults(tx);
        await upsertAppJson(tx, TEMPLATE_EXT_KEY, { v: 1, byCode: {} } as Prisma.InputJsonValue);
        break;
      case "gate_rules":
        await applyGateDefaults(tx);
        await upsertAppJson(tx, GATE_EXT_KEY, { v: 1, byCode: {} } as Prisma.InputJsonValue);
        break;
      case "roles_permissions":
        await applyRoleDefaults(tx);
        await upsertAppJson(tx, ROLES_EXT_KEY, { v: 1, byRoleId: {} } as Prisma.InputJsonValue);
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
