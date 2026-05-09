"use client";

import { Breadcrumbs } from "@/components/lifecycle-workspace/breadcrumbs";
import { SettingsActionBar } from "@/components/settings/SettingsActionBar";
import { SettingsGrid } from "@/components/settings/SettingsGrid";
import { ErrorBanner } from "@/components/settings/shared";
import type {
  ExportSettings,
  LocalStorageSettings,
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
  onQuickAction: (action: SettingsQuickAction) => void;
  onReset: () => void;
  onSave: () => void;
}) {
  return (
    <main className="flex min-h-0 min-w-0 flex-1 flex-col bg-[#f8fafc]">
      <div className="mx-auto w-full max-w-[1920px] px-5 pb-4 pt-4 min-[901px]:px-8">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/dashboard" },
            { label: "Settings", href: "/settings" },
            { label: activeSectionLabel },
          ]}
        />
        {errorMessage ? <ErrorBanner message={errorMessage} onRetry={onRetryError} /> : null}
      </div>

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
        onQuickAction={onQuickAction}
      />

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
