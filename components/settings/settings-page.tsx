"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { TopHeader } from "@/components/lifecycle-workspace/top-header";
import { AuthenticatedAppShell } from "@/components/lifecycle-workspace/authenticated-app-shell";
import { SettingsContent } from "@/components/settings/SettingsContent";
import {
  ExportConfigurationModal,
  ImportConfigurationWizardModal,
  ResetToDefaultModal,
  ValidationResultsDrawer,
} from "@/components/settings/settings-quick-action-modals";
import {
  ResetUnsavedChangesModal,
  SaveSettingsConfirmationModal,
  UnsavedChangesLeaveModal,
} from "@/components/settings/settings-save-guard-modals";
import {
  formatImpactLevel,
  getChangedSettingsSlices,
  shouldConfirmSaveForImpact,
} from "@/lib/settings-dirty-summary";
import { buildSettingsValidationReport, computeActionState } from "@/lib/settings-validation";
import type {
  ExportSettings,
  GateRuleSetting,
  LocalStorageSettings,
  RolePermissionEntry,
  RolePermissionSetting,
  SettingsPageData,
  SettingsQuickAction,
  TemplateRegistryItem,
} from "@/types/settings.types";

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

  const [data, setData] = useState<SettingsPageData>(initial);
  const [baseline, setBaseline] = useState<SettingsPageData>(initial);

  const [isLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [localStoragePathError, setLocalStoragePathError] = useState<string | null>(null);

  const [importModalOpen, setImportModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [validationDrawerOpen, setValidationDrawerOpen] = useState(false);

  const [saveConfirmOpen, setSaveConfirmOpen] = useState(false);
  const [resetUnsavedOpen, setResetUnsavedOpen] = useState(false);
  const [leaveGuardOpen, setLeaveGuardOpen] = useState(false);
  const [pendingNavigationHref, setPendingNavigationHref] = useState<string | null>(null);

  const validationReport = useMemo(() => buildSettingsValidationReport(data), [data]);

  const hasUnsavedChanges = snapshotForDirtyCheck(data) !== snapshotForDirtyCheck(baseline);
  const hasDirtyRef = useRef(false);
  hasDirtyRef.current = hasUnsavedChanges;
  const anyBlockingModalRef = useRef(false);
  anyBlockingModalRef.current =
    leaveGuardOpen ||
    saveConfirmOpen ||
    resetUnsavedOpen ||
    importModalOpen ||
    exportModalOpen ||
    resetModalOpen;
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

  const navigationGuard = useMemo(
    () => ({
      shouldBlock: () => hasDirtyRef.current,
      onBlockedNavigate: (href: string) => {
        setPendingNavigationHref(href);
        setLeaveGuardOpen(true);
      },
    }),
    [],
  );

  const requestNavigate = useCallback(
    (href: string) => {
      if (hasDirtyRef.current) {
        setPendingNavigationHref(href);
        setLeaveGuardOpen(true);
      } else {
        router.push(href);
      }
    },
    [router],
  );

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasDirtyRef.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  useEffect(() => {
    const onDocumentClickCapture = (e: MouseEvent) => {
      if (!hasDirtyRef.current) return;
      if (anyBlockingModalRef.current) return;
      const target = e.target;
      if (!(target instanceof Element)) return;
      if (target.closest("dialog")) return;
      const anchor = target.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      let url: URL;
      try {
        url = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      const next = url.pathname + url.search;
      const cur = window.location.pathname + window.location.search;
      if (next === cur) return;
      e.preventDefault();
      e.stopPropagation();
      setPendingNavigationHref(url.pathname + url.search + url.hash);
      setLeaveGuardOpen(true);
    };
    document.addEventListener("click", onDocumentClickCapture, true);
    return () => document.removeEventListener("click", onDocumentClickCapture, true);
  }, []);

  const patchLifecycle = (recipe: (c: SettingsPageData["lifecycleConfiguration"]) => SettingsPageData["lifecycleConfiguration"]) => {
    setData((prev) => ({
      ...prev,
      lifecycleConfiguration: recipe(prev.lifecycleConfiguration),
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

  const patchTemplateRegistry = (recipe: (items: TemplateRegistryItem[]) => TemplateRegistryItem[]) => {
    setData((prev) => ({
      ...prev,
      templateRegistry: recipe(prev.templateRegistry),
    }));
  };

  const updateGateRule = (ruleId: string, updater: (rule: GateRuleSetting) => GateRuleSetting) => {
    setData((prev) => ({
      ...prev,
      gateRules: prev.gateRules.map((rule) => (rule.id === ruleId ? updater(rule) : rule)),
    }));
  };

  const updateRole = (roleId: string, updater: (role: RolePermissionSetting) => RolePermissionSetting) => {
    setData((prev) => ({
      ...prev,
      rolesPermissions: prev.rolesPermissions.map((role) => (role.roleId === roleId ? updater(role) : role)),
    }));
  };

  const patchRoles = (recipe: (roles: RolePermissionSetting[]) => RolePermissionSetting[]) => {
    setData((prev) => ({
      ...prev,
      rolesPermissions: recipe(prev.rolesPermissions),
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

  const changedSlices = useMemo(() => getChangedSettingsSlices(data, baseline), [data, baseline]);

  const performSave = useCallback(async (): Promise<boolean> => {
    setErrorMessage(null);
    if (!actionState.canSave) return false;
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
        return false;
      }
      const payload = (await response.json()) as { data: SettingsPageData };
      updateData(payload.data);
      setBaseline(payload.data);
      return true;
    } catch {
      setErrorMessage("Failed to save settings.");
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [actionState.canSave, data]);

  const handleSaveClick = useCallback(() => {
    if (!actionState.canSave) return;
    if (shouldConfirmSaveForImpact(changedSlices)) {
      setSaveConfirmOpen(true);
    } else {
      void performSave();
    }
  }, [actionState.canSave, changedSlices, performSave]);

  const handleResetClick = useCallback(() => {
    if (!actionState.canReset) return;
    setResetUnsavedOpen(true);
  }, [actionState.canReset]);

  const handleLeaveStay = useCallback(() => {
    setLeaveGuardOpen(false);
    setPendingNavigationHref(null);
  }, []);

  const handleLeaveDiscard = useCallback(() => {
    const href = pendingNavigationHref;
    setLeaveGuardOpen(false);
    setPendingNavigationHref(null);
    if (href) router.push(href);
  }, [pendingNavigationHref, router]);

  const handleLeaveSave = useCallback(async () => {
    const href = pendingNavigationHref;
    const ok = await performSave();
    if (ok && href) {
      setLeaveGuardOpen(false);
      setPendingNavigationHref(null);
      router.push(href);
    }
  }, [performSave, pendingNavigationHref, router]);

  const handleResetChanges = () => {
    setErrorMessage(null);
    updateData(baseline);
    setLocalStoragePathError(null);
  };

  const handleResetDefaults = async (): Promise<boolean> => {
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
      return true;
    } catch {
      setErrorMessage("Reset to defaults failed.");
      return false;
    }
  };

  const handleQuickAction = (action: SettingsQuickAction) => {
    switch (action.actionType) {
      case "import_config":
        setImportModalOpen(true);
        return;
      case "export_config":
        setExportModalOpen(true);
        return;
      case "reset_defaults":
        setResetModalOpen(true);
        return;
      case "validate_config":
        setValidationDrawerOpen(true);
        return;
      case "open_docs":
        requestNavigate(action.href ?? "/help/settings");
        return;
      default:
        return;
    }
  };

  const handleCreateRule = () => {
    requestNavigate("/settings/gates/new");
  };

  const handleCreateRole = () => {
    requestNavigate("/settings/roles/new");
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
    <AuthenticatedAppShell
      projectId={null}
      navActive={data.activeSection === "template_registry" ? "template_registry" : "settings"}
    >
      <TopHeader
        title="Settings"
        userInitials={data.user.initials}
        userName={data.user.name}
        userRole={data.user.role}
      />
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
          onPatchLifecycle={patchLifecycle}
          onCreateTemplate={() => requestNavigate("/settings/templates/new")}
          onCreateRule={handleCreateRule}
          onCreateRole={handleCreateRole}
          onUpdateExportSettings={handleUpdateExportSettings}
          onUpdateLocalStorageSettings={handleUpdateLocalStorageSettings}
          onEditTemplate={updateTemplateItem}
          onPatchTemplateRegistry={patchTemplateRegistry}
          onEditGateRule={updateGateRule}
          onEditRolePermission={updateRolePermission}
          onUpdateRole={updateRole}
          onPatchRoles={patchRoles}
          onQuickAction={handleQuickAction}
          onReset={handleResetClick}
          onSave={handleSaveClick}
          navigationGuard={navigationGuard}
        />
        <ImportConfigurationWizardModal
          open={importModalOpen}
          currentData={data}
          onClose={() => setImportModalOpen(false)}
          onImported={(next) => {
            updateData(next);
            setBaseline(next);
            setErrorMessage(null);
          }}
          onError={(msg) => setErrorMessage(msg)}
        />
        <ExportConfigurationModal open={exportModalOpen} data={data} onClose={() => setExportModalOpen(false)} />
        <ResetToDefaultModal
          open={resetModalOpen}
          section={data.activeSection}
          systemOverview={data.systemOverview}
          onClose={() => setResetModalOpen(false)}
          onConfirmReset={handleResetDefaults}
        />
        <ValidationResultsDrawer
          open={validationDrawerOpen}
          report={validationReport}
          onClose={() => setValidationDrawerOpen(false)}
        />
        <SaveSettingsConfirmationModal
          open={saveConfirmOpen}
          changedSlices={changedSlices}
          impactLevel={formatImpactLevel(changedSlices)}
          systemOverview={data.systemOverview}
          isSaving={isSaving}
          onClose={() => setSaveConfirmOpen(false)}
          onConfirmSave={async () => {
            const ok = await performSave();
            if (ok) setSaveConfirmOpen(false);
          }}
        />
        <ResetUnsavedChangesModal
          open={resetUnsavedOpen}
          changedSlices={changedSlices}
          onClose={() => setResetUnsavedOpen(false)}
          onConfirmReset={() => {
            handleResetChanges();
          }}
        />
        <UnsavedChangesLeaveModal
          open={leaveGuardOpen}
          targetHref={pendingNavigationHref}
          isSaving={isSaving}
          onStay={handleLeaveStay}
          onDiscardAndLeave={handleLeaveDiscard}
          onSaveAndLeave={handleLeaveSave}
        />
      </div>
    </AuthenticatedAppShell>
  );
}
