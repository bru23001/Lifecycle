"use client";

import { LifecycleConfigurationPanel } from "@/components/settings/LifecycleConfigurationPanel";
import { LifecycleSummaryPanel } from "@/components/settings/LifecycleSummaryPanel";
import { TemplateRegistryPanel } from "@/components/settings/TemplateRegistryPanel";
import { GateRulesPanel } from "@/components/settings/GateRulesPanel";
import { RolesPermissionsPanel } from "@/components/settings/RolesPermissionsPanel";
import { ExportSettingsPanel } from "@/components/settings/ExportSettingsPanel";
import { LocalStorageSettingsPanel } from "@/components/settings/LocalStorageSettingsPanel";
import type {
  ExportSettings,
  GateRuleSetting,
  LocalStorageSettings,
  RolePermissionEntry,
  SettingsPageData,
  SettingsSectionId,
  TemplateRegistryItem,
} from "@/types/settings.types";

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
  onEditTemplate,
  onEditGateRule,
  onEditRolePermission,
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
  onEditTemplate: (templateId: string, updater: (item: TemplateRegistryItem) => TemplateRegistryItem) => void;
  onEditGateRule: (ruleId: string, updater: (rule: GateRuleSetting) => GateRuleSetting) => void;
  onEditRolePermission: (
    roleId: string,
    module: RolePermissionEntry["module"],
    action: keyof Omit<RolePermissionEntry, "module">,
    checked: boolean,
  ) => void;
}) {
  switch (activeSection) {
    case "lifecycle_configuration":
      return (
        <>
          <LifecycleConfigurationPanel
            phases={data.lifecycleConfiguration.phases}
            lastUpdatedLabel={data.lifecycleConfiguration.lastUpdatedLabel}
            onAddPhase={onAddPhase}
            onEditPhase={onEditPhase}
          />
          <LifecycleSummaryPanel
            totalPhases={data.lifecycleConfiguration.totalPhases}
            totalGates={data.lifecycleConfiguration.totalGates}
            totalArtifacts={data.lifecycleConfiguration.totalArtifacts}
            activeTemplates={data.lifecycleConfiguration.activeTemplates}
            lastUpdatedLabel={data.lifecycleConfiguration.lastUpdatedLabel}
          />
        </>
      );
    case "template_registry":
      return (
        <TemplateRegistryPanel
          items={data.templateRegistry}
          onCreateTemplate={onCreateTemplate}
          onUpdateTemplate={onEditTemplate}
        />
      );
    case "gate_rules":
      return <GateRulesPanel data={data.gateRules} onCreateRule={onCreateRule} onUpdateRule={onEditGateRule} />;
    case "roles_permissions":
      return (
        <RolesPermissionsPanel
          data={data.rolesPermissions}
          onCreateRole={onCreateRole}
          onUpdatePermission={onEditRolePermission}
        />
      );
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
