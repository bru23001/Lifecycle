import type { SettingsPageData } from "@/types/settings.types";

/** Maps persisted JSON keys (same as `snapshotForDirtyCheck`) to settings nav section ids. */
export type SettingsSliceId =
  | "lifecycle_configuration"
  | "template_registry"
  | "gate_rules"
  | "roles_permissions"
  | "export_settings"
  | "local_storage_settings";

const SLICE_KEYS: { key: keyof Pick<
  SettingsPageData,
  | "lifecycleConfiguration"
  | "templateRegistry"
  | "gateRules"
  | "rolesPermissions"
  | "exportSettings"
  | "localStorageSettings"
>; id: SettingsSliceId }[] = [
  { key: "lifecycleConfiguration", id: "lifecycle_configuration" },
  { key: "templateRegistry", id: "template_registry" },
  { key: "gateRules", id: "gate_rules" },
  { key: "rolesPermissions", id: "roles_permissions" },
  { key: "exportSettings", id: "export_settings" },
  { key: "localStorageSettings", id: "local_storage_settings" },
];

export const SETTINGS_SLICE_LABEL: Record<SettingsSliceId, string> = {
  lifecycle_configuration: "Lifecycle configuration",
  template_registry: "Template registry",
  gate_rules: "Gate rules",
  roles_permissions: "Roles and permissions",
  export_settings: "Export settings",
  local_storage_settings: "Local storage",
};

/** Slices that differ between draft and baseline (unsaved). */
export function getChangedSettingsSlices(current: SettingsPageData, baseline: SettingsPageData): SettingsSliceId[] {
  const out: SettingsSliceId[] = [];
  for (const { key, id } of SLICE_KEYS) {
    if (JSON.stringify(current[key]) !== JSON.stringify(baseline[key])) {
      out.push(id);
    }
  }
  return out;
}

const SAVE_CONFIRM_SLICES: ReadonlySet<SettingsSliceId> = new Set([
  "lifecycle_configuration",
  "template_registry",
  "gate_rules",
  "roles_permissions",
  "local_storage_settings",
]);

/** When true, Save should show a confirmation modal before calling the API. */
export function shouldConfirmSaveForImpact(changedSlices: SettingsSliceId[]): boolean {
  return changedSlices.some((s) => SAVE_CONFIRM_SLICES.has(s));
}

export function formatImpactLevel(changedSlices: SettingsSliceId[]): "high" | "standard" {
  return shouldConfirmSaveForImpact(changedSlices) ? "high" : "standard";
}
