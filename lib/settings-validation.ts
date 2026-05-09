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

  return blockers;
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
