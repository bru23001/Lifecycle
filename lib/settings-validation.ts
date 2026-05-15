import type {
  ExportSettings,
  LocalStorageSettings,
  SettingsActionState,
  SettingsPageData,
} from "@/types/settings.types";

export function validateExportSettings(settings: ExportSettings): string[] {
  const blockers: string[] = [];
  const atLeastOneFormatEnabled = Object.values(settings.formats).some(Boolean);
  if (!atLeastOneFormatEnabled) {
    blockers.push("Enable at least one export format.");
  }

  if (!settings.namingRules.filenamePattern.includes("{projectCode}")) {
    blockers.push("Filename pattern should include {projectCode} for traceability.");
  }

  if (!settings.packageRules.generateChecksums) {
    blockers.push("Checksums should be enabled for package integrity.");
  }

  return blockers;
}

export function validateLocalStorageSettings(settings: LocalStorageSettings): string[] {
  const blockers: string[] = [];
  const { paths, usage, retention } = settings;

  if (!paths.projectDataPath || !paths.evidenceFilesPath || !paths.exportPackagesPath) {
    blockers.push("All storage paths must be configured.");
  }

  if (usage.quotaBytes && usage.usedBytes > usage.quotaBytes) {
    blockers.push("Storage usage exceeds configured quota.");
  }

  if (retention.keepDraftsDays < 1) {
    blockers.push("Draft retention must be at least 1 day.");
  }

  return blockers;
}

export function validateSettingsPageData(data: SettingsPageData): string[] {
  const blockers = [
    ...validateExportSettings(data.exportSettings),
    ...validateLocalStorageSettings(data.localStorageSettings),
  ];

  if (data.lifecycleConfiguration.phases.length === 0) {
    blockers.push("At least one lifecycle phase is required.");
  }

  if (data.templateRegistry.some((template) => template.schemaVersion.trim().length === 0)) {
    blockers.push("Each template must define a schema version.");
  }

  if (data.gateRules.some((rule) => rule.requiredEvidenceCount < 1 || rule.requiredApproverRoles.length === 0)) {
    blockers.push("Each gate rule needs at least one approver and one required evidence item.");
  }

  if (data.rolesPermissions.some((role) => role.permissions.length === 0)) {
    blockers.push("Each role must have at least one permission entry.");
  }

  const roleIds = new Set<string>();
  for (const role of data.rolesPermissions) {
    if (!role.roleId.trim()) {
      blockers.push("Each role must define a non-empty role id.");
    }
    if (roleIds.has(role.roleId)) {
      blockers.push(`Duplicate role id: ${role.roleId}`);
    }
    roleIds.add(role.roleId);
  }

  return blockers;
}

export type SettingsValidationReport = {
  valid: boolean;
  summary: string;
  errors: string[];
  warnings: string[];
  informational: string[];
  affectedAreas: string[];
  recommendedFixes: string[];
};

/** Rich validation view for drawers and exportable reports (client-safe). */
export function buildSettingsValidationReport(data: SettingsPageData): SettingsValidationReport {
  const errors = validateSettingsPageData(data);
  const warnings: string[] = [];
  const informational: string[] = [];
  const affectedAreas = new Set<string>();
  const recommendedFixes: string[] = [];

  if (!data.exportSettings.formats.pdf) {
    warnings.push("PDF export format is disabled — some audit packs expect PDF output.");
  }

  if (data.lifecycleConfiguration.phases.length > 0) {
    informational.push(`${data.lifecycleConfiguration.phases.length} lifecycle phases configured.`);
  }
  informational.push(`${data.templateRegistry.length} templates in registry.`);
  informational.push(`${data.gateRules.length} gate rules.`);
  informational.push(`${data.rolesPermissions.length} roles.`);

  for (const msg of errors) {
    const m = msg.toLowerCase();
    if (m.includes("export") || m.includes("format") || m.includes("filename") || m.includes("checksum")) {
      affectedAreas.add("Export settings");
    }
    if (m.includes("storage") || m.includes("path") || m.includes("quota") || m.includes("retention")) {
      affectedAreas.add("Local storage");
    }
    if (m.includes("lifecycle") || m.includes("phase")) {
      affectedAreas.add("Lifecycle configuration");
    }
    if (m.includes("template")) {
      affectedAreas.add("Template registry");
    }
    if (m.includes("gate")) {
      affectedAreas.add("Gate rules");
    }
    if (m.includes("role")) {
      affectedAreas.add("Roles / permissions");
    }
  }

  const suggest = (match: (e: string) => boolean, fix: string) => {
    if (errors.some(match)) recommendedFixes.push(fix);
  };
  suggest((e) => e.toLowerCase().includes("export format"), "Enable at least one export format under Export settings.");
  suggest((e) => e.toLowerCase().includes("projectcode"), "Edit the filename pattern to include {projectCode}.");
  suggest((e) => e.toLowerCase().includes("checksum"), "Turn on package checksum generation under Export settings.");
  suggest((e) => e.toLowerCase().includes("storage path"), "Set project, evidence, and export paths under Local storage.");
  suggest((e) => e.toLowerCase().includes("quota"), "Raise the storage quota or free space under Local storage.");
  suggest((e) => e.toLowerCase().includes("lifecycle phase"), "Add or restore at least one lifecycle phase.");
  suggest((e) => e.toLowerCase().includes("schema version"), "Open each template and set a non-empty schema version.");
  suggest((e) => e.toLowerCase().includes("gate rule"), "Edit gate rules so each has approvers and required evidence count ≥ 1.");
  suggest((e) => e.toLowerCase().includes("role"), "Ensure each role has permission rows and unique role ids.");

  if (errors.length === 0 && warnings.length === 0) {
    informational.push("No blocking validation errors were detected for the current draft.");
  }

  const valid = errors.length === 0;
  const summary = valid
    ? warnings.length > 0
      ? `Configuration is save-ready with ${warnings.length} warning(s).`
      : "Configuration looks consistent with current validation rules."
    : `${errors.length} blocking issue(s) must be resolved before save.`;

  return {
    valid,
    summary,
    errors,
    warnings,
    informational,
    affectedAreas: Array.from(affectedAreas),
    recommendedFixes: Array.from(new Set(recommendedFixes)),
  };
}

export function computeActionState({
  data,
  hasUnsavedChanges,
}: {
  data: SettingsPageData;
  hasUnsavedChanges: boolean;
}): SettingsActionState {
  const blockers = validateSettingsPageData(data);
  return {
    title: data.actionState.title,
    description: data.actionState.description,
    hasUnsavedChanges,
    canSave: hasUnsavedChanges && blockers.length === 0,
    canReset: hasUnsavedChanges,
    blockers,
  };
}

export function validateStoragePath(pathValue: string): string | null {
  const trimmed = pathValue.trim();
  if (trimmed.length < 2) {
    return "Path is too short.";
  }
  if (!trimmed.startsWith("~/") && !trimmed.startsWith("/")) {
    return "Path must start with ~/ or /.";
  }
  return null;
}
