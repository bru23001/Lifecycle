"use client";

import { SettingsNavigationPanel } from "@/components/settings/SettingsNavigationPanel";
import { SettingsDetailPanel } from "@/components/settings/SettingsDetailPanel";
import { SettingsOverviewPanel } from "@/components/settings/SettingsOverviewPanel";
import { PanelSkeleton } from "@/components/settings/shared";
import type {
  ExportSettings,
  GateRuleSetting,
  LocalStorageSettings,
  RolePermissionEntry,
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
}: {
  isLoading: boolean;
  data: SettingsPageData;
  activeSection: SettingsSectionId;
  exportSettings: ExportSettings;
  localStorageSettings: LocalStorageSettings;
  localStoragePathError: string | null;
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
}) {
  return (
    <div className="settings-page settings-admin-grid mx-auto w-full max-w-[1920px] min-h-0 items-stretch gap-[var(--grid-gap)] px-[var(--page-padding-mobile)] pb-6 min-[901px]:px-[var(--page-padding)]">
      <div className="settings-navigation-panel flex min-w-0 flex-col gap-5 [&>*:last-child]:flex-1 [&>*:last-child]:flex [&>*:last-child]:flex-col">
        {isLoading ? (
          <PanelSkeleton heightClass="h-52" />
        ) : (
          <SettingsNavigationPanel
            data={data}
            activeSection={activeSection}
            onSectionChange={onSectionChange}
          />
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
