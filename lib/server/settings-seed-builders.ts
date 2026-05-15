import type { Prisma } from "@prisma/client";

import type { GateId } from "@/lib/gateRules";
import { ALL_GATES } from "@/lib/server/helpers";
import {
  WORKSPACE_PHASE_OBJECTIVES,
  WORKSPACE_PHASE_PURPOSES,
  WORKSPACE_PHASES,
  gateHeaderDisplayName,
} from "@/lib/workspacePhases";
import type {
  ExportSettings,
  LocalStorageSettings,
  PermissionModule,
  RolePermissionEntry,
} from "@/types/settings.types";
import { getTemplatesForGate, getTemplatesForPhase, templateRegistry } from "@/templates/registry";
import type { LifecycleGateId } from "@/templates/types";

export const SETTINGS_PERMISSION_MODULES: PermissionModule[] = [
  "projects",
  "lifecycle",
  "templates",
  "gates",
  "artifacts",
  "evidence",
  "traceability",
  "approvals",
  "reports",
  "settings",
];

/** First workspace phase whose gate matches; G10 is not on the 14-phase rail — map to 14. */
export function relatedPhaseForGate(gate: LifecycleGateId): number {
  if (gate === "G10") return 14;
  const found = WORKSPACE_PHASES.find((p) => p.gate === gate);
  return found?.index ?? 1;
}

export function ownerPermissions(): RolePermissionEntry[] {
  return SETTINGS_PERMISSION_MODULES.map((module) => ({
    module,
    view: true,
    create: true,
    edit: true,
    delete: true,
    approve: true,
    export: true,
    admin: true,
  }));
}

export function viewerPermissions(): RolePermissionEntry[] {
  return SETTINGS_PERMISSION_MODULES.map((module) => ({
    module,
    view: true,
    create: false,
    edit: false,
    delete: false,
    approve: false,
    export: module === "reports",
    admin: false,
  }));
}

/** Default permission matrix for a new custom role (aligned with Viewer). */
export function newCustomRolePermissions(): RolePermissionEntry[] {
  return viewerPermissions().map((p) => ({ ...p }));
}

export type LifecycleSeedRow = {
  phaseNumber: number;
  name: string;
  description: string;
  keyDeliverablesJson: Prisma.InputJsonValue;
  requiredArtifactIdsJson: Prisma.InputJsonValue;
  status: string;
};

export function buildLifecycleSeedRows(): LifecycleSeedRow[] {
  return WORKSPACE_PHASES.map((phase) => {
    const i = phase.index - 1;
    const objectives = WORKSPACE_PHASE_OBJECTIVES[i] ?? [];
    const requiredIds = getTemplatesForPhase(phase.index).map((t) => t.templateId);
    return {
      phaseNumber: phase.index,
      name: phase.title,
      description: WORKSPACE_PHASE_PURPOSES[i] ?? "",
      keyDeliverablesJson: objectives as Prisma.InputJsonValue,
      requiredArtifactIdsJson: requiredIds as Prisma.InputJsonValue,
      status: "active",
    };
  });
}

export type TemplateSeedRow = {
  templateCode: string;
  name: string;
  phaseNumber: number;
  outputType: string;
  required: boolean;
  schemaVersion: string;
  status: string;
};

export function buildTemplateSeedRows(): TemplateSeedRow[] {
  return Object.values(templateRegistry).map((tmpl) => ({
    templateCode: tmpl.templateId,
    name: tmpl.title,
    phaseNumber: tmpl.phase,
    outputType: "both",
    required: true,
    schemaVersion: "1.0",
    status: "active",
  }));
}

export type GateSeedRow = {
  gateCode: string;
  gateName: string;
  relatedPhaseNumber: number;
  requiredInputIdsJson: Prisma.InputJsonValue;
  requiredEvidenceCount: number;
  requiredApproverRolesJson: Prisma.InputJsonValue;
  decisionRule: string;
  unlocksPhaseNumber: number | null;
  status: string;
};

export function buildGateSeedRows(): GateSeedRow[] {
  return ALL_GATES.map((gateCode) => {
    const g = gateCode as LifecycleGateId;
    const templates = getTemplatesForGate(g);
    return {
      gateCode,
      gateName: gateHeaderDisplayName(gateCode as GateId),
      relatedPhaseNumber: relatedPhaseForGate(g),
      requiredInputIdsJson: templates.map((t) => t.templateId) as Prisma.InputJsonValue,
      requiredEvidenceCount: Math.max(1, templates.length),
      requiredApproverRolesJson: ["Architecture Lead", "Product Owner"] as Prisma.InputJsonValue,
      decisionRule: "single_approver",
      unlocksPhaseNumber: null,
      status: "active",
    };
  });
}

export type RoleSeedRow = {
  roleId: string;
  roleName: string;
  description: string;
  permissionsJson: Prisma.InputJsonValue;
  systemRole: boolean;
};

export function buildRoleSeedRows(): RoleSeedRow[] {
  return [
    {
      roleId: "project_owner",
      roleName: "Project Owner",
      description: "Full access to the solo local workspace (seed default).",
      permissionsJson: ownerPermissions() as Prisma.InputJsonValue,
      systemRole: true,
    },
    {
      roleId: "viewer",
      roleName: "Viewer",
      description: "Read-mostly; may export reports for governance read copies.",
      permissionsJson: viewerPermissions() as Prisma.InputJsonValue,
      systemRole: false,
    },
  ];
}

/** Canonical export defaults (aligned with `prisma/seed.ts`). */
export function defaultExportSettings(): ExportSettings {
  return {
    formats: {
      markdown: true,
      jsonEvidence: true,
      pdf: false,
      csv: true,
      zip: true,
    },
    packageRules: {
      includeArtifacts: true,
      includeEvidenceFiles: true,
      includeGateDecisions: true,
      includeApprovalRecords: true,
      includeTraceabilityLinks: true,
      includeAuditManifest: true,
      generateChecksums: true,
      redactRestrictedFields: true,
    },
    namingRules: {
      filenamePattern: "{projectCode}_{templateId}_v{version}",
      dateFormat: "ISO-8601",
      projectCodePrefix: true,
      versionSuffix: true,
    },
    redactionRules: {
      restrictApiKeys: true,
      restrictInternalUrls: true,
      restrictFinancialCodes: true,
      piiEmails: true,
      piiPhones: true,
      piiNames: true,
      evidenceUploaderIdentity: true,
      evidenceLocationHints: true,
      evidenceDeviceFingerprints: true,
      exportStripWikiMarkup: false,
      exportCollapseTimestamps: false,
    },
  };
}

/** Merges persisted export JSON with current defaults (handles older payloads). */
export function ensureExportSettingsShape(input: ExportSettings | null | undefined): ExportSettings {
  const base = defaultExportSettings();
  if (!input || typeof input !== "object") return base;
  return {
    formats: { ...base.formats, ...(input.formats ?? {}) },
    packageRules: { ...base.packageRules, ...(input.packageRules ?? {}) },
    namingRules: { ...base.namingRules, ...(input.namingRules ?? {}) },
    redactionRules: { ...base.redactionRules, ...(input.redactionRules ?? {}) },
  };
}

/** Canonical local storage defaults (aligned with `prisma/seed.ts`). */
export function defaultLocalStorageSettings(): LocalStorageSettings {
  return {
    paths: {
      projectDataPath: "./vault/projects",
      evidenceFilesPath: "./vault/evidence",
      exportPackagesPath: "./vault/exports",
      cachePath: "./var/cache",
    },
    usage: {
      usedBytes: 0,
      availableBytes: 1024 * 1024 * 1024,
      cacheBytes: 0,
      evidenceBytes: 0,
      quotaBytes: 2 * 1024 * 1024 * 1024,
    },
    retention: {
      keepDraftsDays: 30,
      keepExportPackagesDays: 90,
      keepAuditSnapshotsDays: 365,
      cleanupPolicy: "weekly",
    },
    backupSync: {
      autoBackupEnabled: false,
      backupLocation: undefined,
      syncEnabled: false,
      lastBackupLabel: undefined,
      backupFrequency: "weekly",
      includeEvidenceFiles: true,
      includeAuditSnapshots: true,
    },
  };
}

/** Merges persisted local storage JSON with current defaults (handles older payloads). */
export function ensureLocalStorageSettingsShape(input: LocalStorageSettings | null | undefined): LocalStorageSettings {
  const base = defaultLocalStorageSettings();
  if (!input || typeof input !== "object") return base;
  return {
    paths: { ...base.paths, ...(input.paths ?? {}) },
    usage: { ...base.usage, ...(input.usage ?? {}) },
    retention: { ...base.retention, ...(input.retention ?? {}) },
    backupSync: { ...base.backupSync, ...(input.backupSync ?? {}) },
  };
}
