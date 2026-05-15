"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { putSettingsPageData, TemplateRegistryPageShell } from "@/components/settings/template-registry-shared";
import { emptyRoleDetail, assignedCountFromRaw } from "@/lib/role-settings-defaults";
import { SETTINGS_PERMISSION_MODULES } from "@/lib/server/settings-seed-builders";
import type { PermissionModule, RolePermissionEntry, RolePermissionSetting, SettingsPageData } from "@/types/settings.types";

function buildPermMap(permissions: RolePermissionEntry[]): Record<PermissionModule, RolePermissionEntry> {
  const map = {} as Record<PermissionModule, RolePermissionEntry>;
  for (const m of SETTINGS_PERMISSION_MODULES) {
    const found = permissions.find((p) => p.module === m);
    map[m] = found ?? {
      module: m,
      view: false,
      create: false,
      edit: false,
      delete: false,
      approve: false,
      export: false,
      admin: false,
    };
  }
  return map;
}

export function RoleEditPageClient({ initial, role }: { initial: SettingsPageData; role: RolePermissionSetting }) {
  const router = useRouter();
  const [roleName, setRoleName] = useState(role.roleName);
  const [description, setDescription] = useState(role.description);
  const [permByModule, setPermByModule] = useState(() => buildPermMap(role.permissions));
  const [assignedUsersRaw, setAssignedUsersRaw] = useState(role.detail.assignedUsersRaw);
  const [assignmentNotes, setAssignmentNotes] = useState(role.detail.assignmentNotes);
  const [auditHistoryNotes, setAuditHistoryNotes] = useState(role.detail.auditHistoryNotes);
  const [relatedApprovalsNotes, setRelatedApprovalsNotes] = useState(role.detail.relatedApprovalsNotes);
  const [exportPermissionsNotes, setExportPermissionsNotes] = useState(role.detail.exportPermissionsNotes);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const permissionRows = useMemo(() => SETTINGS_PERMISSION_MODULES.map((m) => permByModule[m]), [permByModule]);

  const togglePerm = (module: PermissionModule, action: keyof Omit<RolePermissionEntry, "module">, checked: boolean) => {
    setPermByModule((prev) => ({
      ...prev,
      [module]: { ...prev[module], [action]: checked },
    }));
  };

  const handleSave = async () => {
    setError(null);
    const detail = {
      ...emptyRoleDetail(),
      ...role.detail,
      assignedUsersRaw,
      assignmentNotes,
      auditHistoryNotes,
      relatedApprovalsNotes,
      exportPermissionsNotes,
    };
    const updated: RolePermissionSetting = {
      ...role,
      roleName: roleName.trim() || role.roleId,
      description: description.trim(),
      permissions: permissionRows,
      detail,
      assignedUsersCount: assignedCountFromRaw(detail.assignedUsersRaw),
    };
    const next: SettingsPageData = {
      ...initial,
      activeSection: "roles_permissions",
      rolesPermissions: initial.rolesPermissions.map((r) => (r.roleId === role.roleId ? updated : r)),
    };
    setSaving(true);
    try {
      await putSettingsPageData(next);
      router.push(`/settings/roles/${encodeURIComponent(role.roleId)}`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <TemplateRegistryPageShell
      user={initial.user}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Settings", href: "/settings/lifecycle" },
        { label: "Roles / Permissions", href: "/settings/roles" },
        { label: role.roleName, href: `/settings/roles/${encodeURIComponent(role.roleId)}` },
        { label: "Edit" },
      ]}
    >
      <div className="mt-6 rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Edit role</h1>
        <p className="mt-1 font-mono text-sm text-slate-600">{role.roleId}</p>
        {error ? <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p> : null}

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="block text-sm md:col-span-2">
            <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Role name</span>
            <input
              className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              disabled={role.systemRole}
            />
          </label>
          <label className="block text-sm md:col-span-2">
            <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Description</span>
            <textarea
              className="min-h-[72px] w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>
          <label className="block text-sm md:col-span-2">
            <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Assigned users (comma-separated)</span>
            <input
              className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
              value={assignedUsersRaw}
              onChange={(e) => setAssignedUsersRaw(e.target.value)}
            />
          </label>
          <label className="block text-sm md:col-span-2">
            <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Assignment notes</span>
            <textarea
              className="min-h-[60px] w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={assignmentNotes}
              onChange={(e) => setAssignmentNotes(e.target.value)}
            />
          </label>
          <label className="block text-sm md:col-span-2">
            <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Audit / history notes</span>
            <textarea
              className="min-h-[60px] w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={auditHistoryNotes}
              onChange={(e) => setAuditHistoryNotes(e.target.value)}
            />
          </label>
          <label className="block text-sm md:col-span-2">
            <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Related approvals notes</span>
            <textarea
              className="min-h-[60px] w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={relatedApprovalsNotes}
              onChange={(e) => setRelatedApprovalsNotes(e.target.value)}
            />
          </label>
          <label className="block text-sm md:col-span-2">
            <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Export permissions notes</span>
            <textarea
              className="min-h-[60px] w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={exportPermissionsNotes}
              onChange={(e) => setExportPermissionsNotes(e.target.value)}
            />
          </label>
        </div>

        <h2 className="mt-8 text-sm font-semibold text-slate-900">Permission matrix</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[780px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="pb-2">Module</th>
                <th className="pb-2">View</th>
                <th className="pb-2">Create</th>
                <th className="pb-2">Edit</th>
                <th className="pb-2">Delete</th>
                <th className="pb-2">Approve</th>
                <th className="pb-2">Export</th>
                <th className="pb-2">Admin</th>
              </tr>
            </thead>
            <tbody>
              {SETTINGS_PERMISSION_MODULES.map((module) => {
                const permission = permByModule[module];
                return (
                  <tr key={module} className="border-t border-slate-100">
                    <td className="py-2 font-semibold capitalize">{permission.module}</td>
                    {(["view", "create", "edit", "delete", "approve", "export", "admin"] as const).map((actionKey) => (
                      <td key={actionKey} className="py-2">
                        <label className="inline-flex items-center gap-1 text-xs text-slate-700">
                          <input
                            type="checkbox"
                            checked={permission[actionKey]}
                            onChange={(event) => togglePerm(module, actionKey, event.target.checked)}
                            aria-label={`${role.roleName} ${actionKey} ${permission.module}`}
                          />
                          {permission[actionKey] ? "Yes" : "No"}
                        </label>
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          <Button type="button" onClick={() => void handleSave()} disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
          <Link
            href={`/settings/roles/${encodeURIComponent(role.roleId)}`}
            className="inline-flex h-8 items-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium hover:bg-slate-50"
          >
            Cancel
          </Link>
        </div>
      </div>
    </TemplateRegistryPageShell>
  );
}
