"use client";

import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";

import { TopHeader } from "@/components/lifecycle-workspace/top-header";
import { AuthenticatedAppShell } from "@/components/lifecycle-workspace/authenticated-app-shell";
import { SettingsContent } from "@/components/settings/SettingsContent";
import { computeActionState, validateStoragePath } from "@/lib/settings-validation";
import type {
  ExportSettings,
  GateRuleSetting,
  LifecyclePhaseSetting,
  LocalStorageSettings,
  RolePermissionEntry,
  RolePermissionSetting,
  SettingsPageData,
  SettingsQuickAction,
  SettingsSectionId,
  TemplateRegistryItem,
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
    lifecycleConfiguration: data.lifecycleConfiguration,
    templateRegistry: data.templateRegistry,
    gateRules: data.gateRules,
    rolesPermissions: data.rolesPermissions,
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

  const [isLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [localStoragePathError, setLocalStoragePathError] = useState<string | null>(null);

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
  };

  const updateLifecyclePhase = (phaseId: string, updater: (phase: LifecyclePhaseSetting) => LifecyclePhaseSetting) => {
    setData((prev) => ({
      ...prev,
      lifecycleConfiguration: {
        ...prev.lifecycleConfiguration,
        phases: prev.lifecycleConfiguration.phases.map((phase) =>
          phase.id === phaseId ? updater(phase) : phase,
        ),
      },
    }));
  };

  const updateTemplateItem = (
    templateId: string,
    updater: (item: TemplateRegistryItem) => TemplateRegistryItem,
  ) => {
    setData((prev) => ({
      ...prev,
      templateRegistry: prev.templateRegistry.map((item) =>
        item.id === templateId ? updater(item) : item,
      ),
    }));
  };

  const updateGateRule = (ruleId: string, updater: (rule: GateRuleSetting) => GateRuleSetting) => {
    setData((prev) => ({
      ...prev,
      gateRules: prev.gateRules.map((rule) => (rule.id === ruleId ? updater(rule) : rule)),
    }));
  };

  const updateRolePermission = (
    roleId: string,
    module: RolePermissionEntry["module"],
    action: keyof Omit<RolePermissionEntry, "module">,
    checked: boolean,
  ) => {
    setData((prev) => ({
      ...prev,
      rolesPermissions: prev.rolesPermissions.map((role): RolePermissionSetting => {
        if (role.roleId !== roleId) return role;
        return {
          ...role,
          permissions: role.permissions.map((permission) =>
            permission.module === module
              ? {
                  ...permission,
                  [action]: checked,
                }
              : permission,
          ),
        };
      }),
    }));
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
    const currentPath = data.localStorageSettings.paths[key];
    const nextPath = window.prompt("Enter a new path", currentPath);
    if (!nextPath) return;

    const error = validateStoragePath(nextPath);
    if (error) {
      setLocalStoragePathError(error);
      return;
    }

    setLocalStoragePathError(null);
    setData((prev) => ({
      ...prev,
      localStorageSettings: {
        ...prev.localStorageSettings,
        paths: {
          ...prev.localStorageSettings.paths,
          [key]: nextPath,
        },
      },
    }));
  };

  const handleAddPhase = () => {
    const name = window.prompt("Phase name");
    if (!name) return;
    const description = window.prompt("Phase description", "New lifecycle phase") ?? "New lifecycle phase";
    setData((prev) => {
      const nextNumber = prev.lifecycleConfiguration.phases.length + 1;
      const nextId = `phase-${Date.now()}`;
      const nextPhase: LifecyclePhaseSetting = {
        id: nextId,
        phaseNumber: nextNumber,
        name,
        description,
        keyDeliverables: ["Define deliverables"],
        requiredArtifactIds: [],
        status: "draft",
        canEdit: true,
        canReorder: true,
      };
      return {
        ...prev,
        lifecycleConfiguration: {
          ...prev.lifecycleConfiguration,
          phases: [...prev.lifecycleConfiguration.phases, nextPhase],
          totalPhases: prev.lifecycleConfiguration.totalPhases + 1,
        },
      };
    });
  };

  const handleEditPhase = (phaseId: string) => {
    const target = data.lifecycleConfiguration.phases.find((phase) => phase.id === phaseId);
    if (!target) return;
    const nextDescription = window.prompt(`Update description for ${target.name}`, target.description);
    if (!nextDescription) return;
    updateLifecyclePhase(phaseId, (phase) => ({ ...phase, description: nextDescription }));
  };

  const handleCreateRule = () => {
    const code = window.prompt("Gate code", `G${data.gateRules.length + 1}`);
    if (!code) return;
    setData((prev) => ({
      ...prev,
      gateRules: [
        ...prev.gateRules,
        {
          id: `gate-rule-${Date.now()}`,
          gateCode: code.toUpperCase(),
          gateName: `New ${code.toUpperCase()} Gate`,
          relatedPhaseNumber: 1,
          requiredInputIds: [],
          requiredEvidenceCount: 1,
          requiredApproverRoles: ["Governance Admin"],
          decisionRule: "single_approver",
          status: "draft",
        },
      ],
    }));
  };

  const handleCreateRole = () => {
    const roleName = window.prompt("Role name");
    if (!roleName) return;
    setData((prev) => ({
      ...prev,
      rolesPermissions: [
        ...prev.rolesPermissions,
        {
          roleId: `custom-role-${Date.now()}`,
          roleName,
          description: "Custom role",
          assignedUsersCount: 0,
          systemRole: false,
          permissions: [
            {
              module: "settings",
              view: true,
              create: false,
              edit: false,
              delete: false,
              approve: false,
              export: false,
              admin: false,
            },
          ],
        },
      ],
    }));
  };

  const handleUpdateExportSettings = (nextValue: ExportSettings) => {
    setData((prev) => ({
      ...prev,
      exportSettings: nextValue,
    }));
  };

  const handleUpdateLocalStorageSettings = (nextValue: LocalStorageSettings) => {
    setData((prev) => ({
      ...prev,
      localStorageSettings: nextValue,
    }));
  };

  return (
    <AuthenticatedAppShell projectId={null} navActive="settings">
      <TopHeader title="Settings" userInitials={data.user.initials} notificationCount={1} />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <SettingsContent
          data={data}
          activeSectionLabel={activeSectionLabel}
          isLoading={isLoading}
          errorMessage={errorMessage}
          exportSettings={data.exportSettings}
          localStorageSettings={data.localStorageSettings}
          localStoragePathError={localStoragePathError}
          canSave={actionState.canSave}
          canReset={actionState.canReset}
          isSaving={isSaving}
          blockers={actionState.blockers}
          onRetryError={() => setErrorMessage(null)}
          onSectionChange={handleSectionChange}
          onAddPhase={handleAddPhase}
          onEditPhase={handleEditPhase}
          onCreateTemplate={() => router.push("/projects/new?intent=create-template")}
          onCreateRule={handleCreateRule}
          onCreateRole={handleCreateRole}
          onTestExport={() => setErrorMessage("Test export queued for backend processing.")}
          onUpdateExportSettings={handleUpdateExportSettings}
          onUpdateLocalStorageSettings={handleUpdateLocalStorageSettings}
          onChangeLocalStoragePath={handleChangeLocalStoragePath}
          onEditTemplate={updateTemplateItem}
          onEditGateRule={updateGateRule}
          onEditRolePermission={updateRolePermission}
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
      </div>
    </AuthenticatedAppShell>
  );
}
