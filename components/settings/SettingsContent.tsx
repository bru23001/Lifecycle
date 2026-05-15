"use client";

import { Breadcrumbs } from "@/components/lifecycle-workspace/breadcrumbs";
import { SettingsActionBar } from "@/components/settings/SettingsActionBar";
import { SettingsGrid } from "@/components/settings/SettingsGrid";
import { ErrorBanner } from "@/components/settings/shared";
import type {
  ExportSettings,
  GateRuleSetting,
  LifecycleConfigurationBlock,
  LocalStorageSettings,
  RolePermissionEntry,
  RolePermissionSetting,
  SettingsPageData,
  SettingsQuickAction,
  TemplateRegistryItem,
} from "@/types/settings.types";

export function SettingsContent({
  data,
  activeSectionLabel,
  isLoading,
  errorMessage,
  exportSettings,
  localStorageSettings,
  localStoragePathError,
  canSave,
  canReset,
  isSaving,
  blockers,
  onRetryError,
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
  onReset,
  onSave,
  navigationGuard,
}: {
  data: SettingsPageData;
  activeSectionLabel: string;
  isLoading: boolean;
  errorMessage: string | null;
  exportSettings: ExportSettings;
  localStorageSettings: LocalStorageSettings;
  localStoragePathError: string | null;
  canSave: boolean;
  canReset: boolean;
  isSaving: boolean;
  blockers: string[];
  onRetryError: () => void;
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
  onReset: () => void;
  onSave: () => void;
  navigationGuard?: {
    shouldBlock: () => boolean;
    onBlockedNavigate: (href: string) => void;
  };
}) {
  return (
    <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[var(--app-bg)]">
      <div className="mx-auto w-full max-w-[1920px] shrink-0 px-5 pb-4 pt-4 min-[901px]:px-8">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Settings", href: "/settings/lifecycle" },
            { label: activeSectionLabel },
          ]}
          navGuard={navigationGuard}
        />
        {errorMessage ? <ErrorBanner message={errorMessage} onRetry={onRetryError} /> : null}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        <SettingsGrid
          isLoading={isLoading}
          data={data}
          activeSection={data.activeSection}
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
          onQuickAction={onQuickAction}
        />
      </div>

      <SettingsActionBar
        title={data.actionState.title}
        description={data.actionState.description}
        blockers={blockers}
        canSave={canSave}
        canReset={canReset}
        isSaving={isSaving}
        onSave={onSave}
        onReset={onReset}
        navGuard={navigationGuard}
      />
    </main>
  );
}
