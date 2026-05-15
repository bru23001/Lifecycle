"use client";

import { SettingsNavigationPanel } from "@/components/settings/SettingsNavigationPanel";
import { SettingsDetailPanel } from "@/components/settings/SettingsDetailPanel";
import { SettingsOverviewPanel } from "@/components/settings/SettingsOverviewPanel";
import { PanelSkeleton } from "@/components/settings/shared";
import type {
  ExportSettings,
  GateRuleSetting,
  LifecycleConfigurationBlock,
  LocalStorageSettings,
  RolePermissionEntry,
  RolePermissionSetting,
  SettingsPageData,
  SettingsQuickAction,
  SettingsSectionId,
  TemplateRegistryItem,
} from "@/types/settings.types";

export function SettingsGrid({
  isLoading,
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
  onQuickAction,
}: {
  isLoading: boolean;
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
  onQuickAction: (action: SettingsQuickAction) => void;
}) {
  return (
    <div className="settings-page settings-admin-grid mx-auto w-full max-w-[1920px] min-h-0 items-stretch gap-[var(--grid-gap)] px-[var(--page-padding-mobile)] pb-6 min-[901px]:px-[var(--page-padding)]">
      <div className="settings-navigation-panel flex min-w-0 flex-col gap-5 [&>*:last-child]:flex-1 [&>*:last-child]:flex [&>*:last-child]:flex-col">
        {isLoading ? (
          <PanelSkeleton heightClass="h-52" />
        ) : (
          <SettingsNavigationPanel data={data} activeSection={activeSection} />
        )}
      </div>

      <div className="settings-detail-panel flex min-w-0 flex-col gap-5 [&>section:first-child]:flex-1 [&>section:first-child]:flex [&>section:first-child]:flex-col">
        {isLoading ? (
          <PanelSkeleton heightClass="h-64" />
        ) : (
          <SettingsDetailPanel
            data={data}
            activeSection={activeSection}
            exportSettings={exportSettings}
            localStorageSettings={localStorageSettings}
            localStoragePathError={localStoragePathError}
            onPatchLifecycle={onPatchLifecycle}
            onCreateTemplate={onCreateTemplate}
            onCreateRule={onCreateRule}
            onCreateRole={onCreateRole}
            onUpdateExportSettings={onUpdateExportSettings}
            onUpdateLocalStorageSettings={onUpdateLocalStorageSettings}
            onEditTemplate={onEditTemplate}
            onPatchTemplateRegistry={onPatchTemplateRegistry}
            onEditGateRule={onEditGateRule}
            onEditRolePermission={onEditRolePermission}
            onUpdateRole={onUpdateRole}
            onPatchRoles={onPatchRoles}
          />
        )}
      </div>

      <aside className="settings-overview-panel flex min-w-0 flex-col gap-5 [&>*:last-child]:flex-1 [&>*:last-child]:flex [&>*:last-child]:flex-col min-[901px]:max-[1280px]:col-span-full min-[901px]:max-[1280px]:grid min-[901px]:max-[1280px]:grid-cols-3 min-[901px]:max-[1280px]:gap-5 min-[901px]:max-[1280px]:[&>*:last-child]:flex-none">
        {isLoading ? (
          <>
            <PanelSkeleton heightClass="h-36" />
            <PanelSkeleton heightClass="h-36" />
            <PanelSkeleton heightClass="h-36" />
          </>
        ) : (
          <SettingsOverviewPanel data={data} onQuickAction={onQuickAction} />
        )}
      </aside>
    </div>
  );
}
