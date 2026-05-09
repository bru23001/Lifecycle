"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { TopHeader } from "@/components/lifecycle-workspace/top-header";
import { AuthenticatedAppShell } from "@/components/lifecycle-workspace/authenticated-app-shell";
import { SettingsContent } from "@/components/settings/SettingsContent";
import { computeActionState, validateStoragePath } from "@/lib/settings-validation";
import type {
  ExportSettings,
  LocalStorageSettings,
  SettingsPageData,
  SettingsQuickAction,
  SettingsSectionId,
} from "@/types/settings.types";

function downloadBlob(filename: string, blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function snapshotForDirtyCheck(data: SettingsPageData) {
  return JSON.stringify({
    activeSection: data.activeSection,
    exportSettings: data.exportSettings,
    localStorageSettings: data.localStorageSettings,
  });
}

export function SettingsPage({
  initial,
}: {
  initial: SettingsPageData;
}) {
  const router = useRouter();
  const importFileInputRef = useRef<HTMLInputElement | null>(null);

  const [data, setData] = useState<SettingsPageData>(initial);
  const [baseline, setBaseline] = useState<SettingsPageData>(initial);
  const [exportSettings, setExportSettings] = useState<ExportSettings>(initial.exportSettings);
  const [localStorageSettings, setLocalStorageSettings] = useState<LocalStorageSettings>(initial.localStorageSettings);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [localStoragePathError, setLocalStoragePathError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const run = async () => {
      try {
        const response = await fetch(`/api/settings?section=${initial.activeSection}`, {
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error("Could not load settings data.");
        }
        const payload = (await response.json()) as { data: SettingsPageData };
        if (!active) return;
        setData(payload.data);
        setBaseline(payload.data);
        setExportSettings(payload.data.exportSettings);
        setLocalStorageSettings(payload.data.localStorageSettings);
      } catch {
        if (!active) return;
        setErrorMessage("Unable to load settings from backend. Using local defaults.");
      } finally {
        if (active) setIsLoading(false);
      }
    };
    void run();
    return () => {
      active = false;
    };
  }, [initial.activeSection]);

  useEffect(() => {
    setData((prev) => ({
      ...prev,
      exportSettings,
      localStorageSettings,
    }));
  }, [exportSettings, localStorageSettings]);

  const hasUnsavedChanges = snapshotForDirtyCheck(data) !== snapshotForDirtyCheck(baseline);
  const actionState = useMemo(
    () => computeActionState({ data, hasUnsavedChanges }),
    [data, hasUnsavedChanges],
  );

  const activeSection = data.activeSection;
  const activeSectionLabel =
    data.navigationItems.find((item) => item.section === activeSection)?.label ?? "Lifecycle Configuration";

  const updateData = (nextData: SettingsPageData) => {
    setData(nextData);
    setExportSettings(nextData.exportSettings);
    setLocalStorageSettings(nextData.localStorageSettings);
  };

  const handleSave = async () => {
    setErrorMessage(null);
    if (!actionState.canSave) return;
    setIsSaving(true);
    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const payload = (await response.json()) as { error?: string; blockers?: string[] };
        setErrorMessage(payload.error ?? payload.blockers?.join(" ") ?? "Failed to save settings.");
        return;
      }
      const payload = (await response.json()) as { data: SettingsPageData };
      updateData(payload.data);
      setBaseline(payload.data);
    } catch {
      setErrorMessage("Failed to save settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetChanges = () => {
    setErrorMessage(null);
    updateData(baseline);
    setLocalStoragePathError(null);
  };

  const handleSectionChange = (section: SettingsSectionId, href: string) => {
    setErrorMessage(null);
    setData((prev) => ({
      ...prev,
      activeSection: section,
      navigationItems: prev.navigationItems.map((item) => ({
        ...item,
        active: item.section === section,
      })),
    }));
    router.push(href);
  };

  const handleImportConfig = () => {
    importFileInputRef.current?.click();
  };

  const handleImportFileSelected = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const response = await fetch("/api/settings/import", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ payload: parsed }),
        });
        if (!response.ok) {
          throw new Error("Import failed.");
        }
        const payload = (await response.json()) as { data: SettingsPageData };
        updateData(payload.data);
        setBaseline(payload.data);
        setErrorMessage(null);
      } catch {
        setErrorMessage("Configuration import failed. Validate the schema and retry.");
      }
    };
    reader.readAsText(file);
  };

  const handleExportConfig = async () => {
    try {
      const response = await fetch("/api/settings/export", { method: "GET" });
      if (!response.ok) throw new Error("Export failed.");
      const blob = await response.blob();
      downloadBlob("settings-configuration.json", blob);
    } catch {
      setErrorMessage("Configuration export failed.");
    }
  };

  const handleResetDefaults = async () => {
    const confirmed = window.confirm(
      "This will reset your configuration defaults. This action cannot be undone. Continue?",
    );
    if (!confirmed) return;
    try {
      const response = await fetch("/api/settings/reset", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ section: data.activeSection }),
      });
      if (!response.ok) throw new Error("Reset failed.");
      const payload = (await response.json()) as { data: SettingsPageData };
      updateData(payload.data);
      setBaseline(payload.data);
      setErrorMessage(null);
    } catch {
      setErrorMessage("Reset to defaults failed.");
    }
  };

  const handleValidateConfiguration = async () => {
    try {
      const response = await fetch("/api/settings/validate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Validation endpoint unavailable.");
      }
      const payload = (await response.json()) as { valid: boolean; blockers: string[] };
      setErrorMessage(payload.valid ? null : payload.blockers.join(" "));
    } catch {
      setErrorMessage("Unable to validate configuration at this time.");
    }
  };

  const handleQuickAction = (action: SettingsQuickAction) => {
    switch (action.actionType) {
      case "import_config":
        handleImportConfig();
        return;
      case "export_config":
        void handleExportConfig();
        return;
      case "reset_defaults":
        void handleResetDefaults();
        return;
      case "validate_config":
        void handleValidateConfiguration();
        return;
      case "open_docs":
        router.push(action.href ?? "/docs/settings");
        return;
      default:
        return;
    }
  };

  const handleChangeLocalStoragePath = (key: keyof LocalStorageSettings["paths"]) => {
    const currentPath = localStorageSettings.paths[key];
    const nextPath = window.prompt("Enter a new path", currentPath);
    if (!nextPath) return;

    const error = validateStoragePath(nextPath);
    if (error) {
      setLocalStoragePathError(error);
      return;
    }

    setLocalStoragePathError(null);
    setLocalStorageSettings({
      ...localStorageSettings,
      paths: {
        ...localStorageSettings.paths,
        [key]: nextPath,
      },
    });
  };

  return (
    <AuthenticatedAppShell
      projectId="settings-hub"
      projectName="Platform Configuration"
      phaseSummary={hasUnsavedChanges ? "Unsaved configuration changes" : "Configuration overview"}
      phaseProgressPct={72}
      navActive="settings"
    >
      <TopHeader title="Settings" userInitials={data.user.initials} notificationCount={1} />
      <SettingsContent
        data={data}
        activeSectionLabel={activeSectionLabel}
        isLoading={isLoading}
        errorMessage={errorMessage}
        exportSettings={exportSettings}
        localStorageSettings={localStorageSettings}
        localStoragePathError={localStoragePathError}
        canSave={actionState.canSave}
        canReset={actionState.canReset}
        isSaving={isSaving}
        blockers={actionState.blockers}
        onRetryError={() => setErrorMessage(null)}
        onSectionChange={handleSectionChange}
        onAddPhase={() => setErrorMessage("Add Phase modal is not implemented yet.")}
        onEditPhase={() => setErrorMessage("Edit Phase drawer is not implemented yet.")}
        onCreateTemplate={() => router.push("/projects/new?intent=create-template")}
        onCreateRule={() => setErrorMessage("Gate Rule creation modal is not implemented yet.")}
        onCreateRole={() => setErrorMessage("Role creation modal is not implemented yet.")}
        onTestExport={() => setErrorMessage("Test export queued for backend processing.")}
        onUpdateExportSettings={setExportSettings}
        onUpdateLocalStorageSettings={setLocalStorageSettings}
        onChangeLocalStoragePath={handleChangeLocalStoragePath}
        onQuickAction={handleQuickAction}
        onReset={handleResetChanges}
        onSave={() => {
          void handleSave();
        }}
      />
      <input
        ref={importFileInputRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={(event) => handleImportFileSelected(event.target.files?.[0] ?? null)}
      />
    </AuthenticatedAppShell>
  );
}
