"use client";

import { SettingsNavigationPanel } from "@/components/settings/SettingsNavigationPanel";
import { SettingsDetailPanel } from "@/components/settings/SettingsDetailPanel";
import { SettingsOverviewPanel } from "@/components/settings/SettingsOverviewPanel";
import { PanelSkeleton } from "@/components/settings/shared";
import type {
  ExportSettings,
  LocalStorageSettings,
  SettingsPageData,
  SettingsQuickAction,
  SettingsSectionId,
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
  onQuickAction: (action: SettingsQuickAction) => void;
}) {
  return (
    <div className="settings-page mx-auto grid w-full max-w-[1920px] min-h-[calc(100vh-76px)] grid-cols-1 gap-5 px-5 pb-[96px] min-[901px]:px-8 min-[901px]:pb-[112px] min-[901px]:[grid-template-columns:340px_minmax(0,1fr)_360px] min-[901px]:max-[1280px]:[grid-template-columns:300px_minmax(0,1fr)]">
      <div className="settings-navigation-panel min-w-0 space-y-5">
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

      <div className="settings-detail-panel min-w-0 space-y-5">
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
          />
        )}
      </div>

      <aside className="settings-overview-panel min-w-0 space-y-5 min-[901px]:max-[1280px]:col-span-full min-[901px]:max-[1280px]:grid min-[901px]:max-[1280px]:grid-cols-3 min-[901px]:max-[1280px]:gap-5">
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
