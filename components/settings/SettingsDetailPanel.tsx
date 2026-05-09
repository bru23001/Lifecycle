"use client";

import { LifecycleConfigurationPanel } from "@/components/settings/LifecycleConfigurationPanel";
import { TemplateRegistryPanel } from "@/components/settings/TemplateRegistryPanel";
import { GateRulesPanel } from "@/components/settings/GateRulesPanel";
import { RolesPermissionsPanel } from "@/components/settings/RolesPermissionsPanel";
import { ExportSettingsPanel } from "@/components/settings/ExportSettingsPanel";
import { LocalStorageSettingsPanel } from "@/components/settings/LocalStorageSettingsPanel";
import type { ExportSettings, LocalStorageSettings, SettingsPageData, SettingsSectionId } from "@/types/settings.types";

export function SettingsDetailPanel({
  data,
  activeSection,
  exportSettings,
  localStorageSettings,
  localStoragePathError,
  onAddPhase,
  onEditPhase,
  onCreateTemplate,
  onCreateRule,
  onCreateRole,
  onTestExport,
  onUpdateExportSettings,
  onUpdateLocalStorageSettings,
  onChangeLocalStoragePath,
}: {
  data: SettingsPageData;
  activeSection: SettingsSectionId;
  exportSettings: ExportSettings;
  localStorageSettings: LocalStorageSettings;
  localStoragePathError: string | null;
  onAddPhase: () => void;
  onEditPhase: (phaseId: string) => void;
  onCreateTemplate: () => void;
  onCreateRule: () => void;
  onCreateRole: () => void;
  onTestExport: () => void;
  onUpdateExportSettings: (nextValue: ExportSettings) => void;
  onUpdateLocalStorageSettings: (nextValue: LocalStorageSettings) => void;
  onChangeLocalStoragePath: (key: keyof LocalStorageSettings["paths"]) => void;
}) {
  switch (activeSection) {
    case "lifecycle_configuration":
      return (
        <LifecycleConfigurationPanel
          phases={data.lifecycleConfiguration.phases}
          totalPhases={data.lifecycleConfiguration.totalPhases}
          totalGates={data.lifecycleConfiguration.totalGates}
          totalArtifacts={data.lifecycleConfiguration.totalArtifacts}
          activeTemplates={data.lifecycleConfiguration.activeTemplates}
          lastUpdatedLabel={data.lifecycleConfiguration.lastUpdatedLabel}
          onAddPhase={onAddPhase}
          onEditPhase={onEditPhase}
        />
      );
    case "template_registry":
      return <TemplateRegistryPanel items={data.templateRegistry} onCreateTemplate={onCreateTemplate} />;
    case "gate_rules":
      return <GateRulesPanel data={data.gateRules} onCreateRule={onCreateRule} />;
    case "roles_permissions":
      return <RolesPermissionsPanel data={data.rolesPermissions} onCreateRole={onCreateRole} />;
    case "export_settings":
      return <ExportSettingsPanel value={exportSettings} onChange={onUpdateExportSettings} onTestExport={onTestExport} />;
    case "local_storage_settings":
      return (
        <LocalStorageSettingsPanel
          value={localStorageSettings}
          pathError={localStoragePathError}
          onChange={onUpdateLocalStorageSettings}
          onChangePath={onChangeLocalStoragePath}
        />
      );
    default:
      return null;
  }
}
