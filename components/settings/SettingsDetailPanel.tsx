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
  LifecycleConfigurationBlock,
  LocalStorageSettings,
  RolePermissionEntry,
  RolePermissionSetting,
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
  onPatchLifecycle,
  onCreateTemplate,
  onCreateRule,
  onCreateRole,
  onUpdateExportSettings,
  onUpdateLocalStorageSettings,
  onEditTemplate,
  onPatchTemplateRegistry,
  onEditGateRule,
  onEditRolePermission,
  onUpdateRole,
  onPatchRoles,
}: {
  data: SettingsPageData;
  activeSection: SettingsSectionId;
  exportSettings: ExportSettings;
  localStorageSettings: LocalStorageSettings;
  localStoragePathError: string | null;
  onPatchLifecycle: (recipe: (c: LifecycleConfigurationBlock) => LifecycleConfigurationBlock) => void;
  onCreateTemplate: () => void;
  onCreateRule: () => void;
  onCreateRole: () => void;
  onUpdateExportSettings: (nextValue: ExportSettings) => void;
  onUpdateLocalStorageSettings: (nextValue: LocalStorageSettings) => void;
  onEditTemplate: (templateId: string, updater: (item: TemplateRegistryItem) => TemplateRegistryItem) => void;
  onPatchTemplateRegistry: (recipe: (items: TemplateRegistryItem[]) => TemplateRegistryItem[]) => void;
  onEditGateRule: (ruleId: string, updater: (rule: GateRuleSetting) => GateRuleSetting) => void;
  onEditRolePermission: (
    roleId: string,
    module: RolePermissionEntry["module"],
    action: keyof Omit<RolePermissionEntry, "module">,
    checked: boolean,
  ) => void;
  onUpdateRole: (roleId: string, updater: (role: RolePermissionSetting) => RolePermissionSetting) => void;
  onPatchRoles: (recipe: (roles: RolePermissionSetting[]) => RolePermissionSetting[]) => void;
}) {
  switch (activeSection) {
    case "lifecycle_configuration":
      return (
        <>
          <LifecycleConfigurationPanel
            lifecycleConfiguration={data.lifecycleConfiguration}
            gateRules={data.gateRules}
            templateRegistry={data.templateRegistry}
            onPatchLifecycle={onPatchLifecycle}
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
          onPatchTemplateRegistry={onPatchTemplateRegistry}
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
          onUpdateRole={onUpdateRole}
          onPatchRoles={onPatchRoles}
        />
      );
    case "export_settings":
      return <ExportSettingsPanel value={exportSettings} onChange={onUpdateExportSettings} />;
    case "local_storage_settings":
      return (
        <LocalStorageSettingsPanel
          value={localStorageSettings}
          pathError={localStoragePathError}
          onChange={onUpdateLocalStorageSettings}
        />
      );
    default:
      return null;
  }
}
