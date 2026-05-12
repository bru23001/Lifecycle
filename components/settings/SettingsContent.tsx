"use client";

import { Breadcrumbs } from "@/components/lifecycle-workspace/breadcrumbs";
import { SettingsActionBar } from "@/components/settings/SettingsActionBar";
import { SettingsGrid } from "@/components/settings/SettingsGrid";
import { ErrorBanner } from "@/components/settings/shared";
import type {
  ExportSettings,
  GateRuleSetting,
  LocalStorageSettings,
  RolePermissionEntry,
  TemplateRegistryItem,
  SettingsPageData,
  SettingsQuickAction,
  SettingsSectionId,
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
  onSectionChange,
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
  onQuickAction,
  onReset,
  onSave,
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
  onSectionChange: (section: SettingsSectionId, href: string) => void;
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
  onQuickAction: (action: SettingsQuickAction) => void;
  onReset: () => void;
  onSave: () => void;
}) {
  return (
    <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[var(--app-bg)]">
      <div className="mx-auto w-full max-w-[1920px] shrink-0 px-5 pb-4 pt-4 min-[901px]:px-8">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Settings", href: "/settings" },
            { label: activeSectionLabel },
          ]}
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
          onSectionChange={onSectionChange}
          onAddPhase={onAddPhase}
          onEditPhase={onEditPhase}
          onCreateTemplate={onCreateTemplate}
          onCreateRule={onCreateRule}
          onCreateRole={onCreateRole}
          onTestExport={onTestExport}
          onUpdateExportSettings={onUpdateExportSettings}
          onUpdateLocalStorageSettings={onUpdateLocalStorageSettings}
          onChangeLocalStoragePath={onChangeLocalStoragePath}
          onEditTemplate={onEditTemplate}
          onEditGateRule={onEditGateRule}
          onEditRolePermission={onEditRolePermission}
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
      />
    </main>
  );
}
