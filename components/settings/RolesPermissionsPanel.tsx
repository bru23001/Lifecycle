"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { SectionHeader } from "@/components/settings/shared";
import { TemplateSettingsDialog } from "@/components/settings/template-registry-shared";
import { Button, buttonVariants } from "@/components/ui/button";
import { assignedCountFromRaw, emptyRoleDetail } from "@/lib/role-settings-defaults";
import { cn } from "@/lib/utils";
import { newCustomRolePermissions } from "@/lib/server/settings-seed-builders";
import type { RolePermissionEntry, RolePermissionSetting } from "@/types/settings.types";

function isHighRiskAction(action: keyof Omit<RolePermissionEntry, "module">): boolean {
  return action === "admin" || action === "delete" || action === "approve";
}

export function RolesPermissionsPanel({
  data,
  onCreateRole,
  onUpdatePermission,
  onUpdateRole,
  onPatchRoles,
}: {
  data: RolePermissionSetting[];
  onCreateRole: () => void;
  onUpdatePermission: (
    roleId: string,
    module: RolePermissionEntry["module"],
    action: keyof Omit<RolePermissionEntry, "module">,
    checked: boolean,
  ) => void;
  onUpdateRole: (roleId: string, updater: (r: RolePermissionSetting) => RolePermissionSetting) => void;
  onPatchRoles: (recipe: (roles: RolePermissionSetting[]) => RolePermissionSetting[]) => void;
}) {
  const [selectedRoleId, setSelectedRoleId] = useState<string>(data[0]?.roleId ?? "");
  const selectedRole = data.find((row) => row.roleId === selectedRoleId);

  const [assignRoleId, setAssignRoleId] = useState<string | null>(null);

  const [highRiskOpen, setHighRiskOpen] = useState(false);
  const [pendingPerm, setPendingPerm] = useState<{
    roleId: string;
    module: RolePermissionEntry["module"];
    action: keyof Omit<RolePermissionEntry, "module">;
    checked: boolean;
  } | null>(null);

  const [assignOpen, setAssignOpen] = useState(false);
  const [assignRaw, setAssignRaw] = useState("");
  const [assignNotes, setAssignNotes] = useState("");

  const [dupOpen, setDupOpen] = useState(false);
  const [dupSource, setDupSource] = useState<RolePermissionSetting | null>(null);
  const [dupNewId, setDupNewId] = useState("");
  const [dupNewName, setDupNewName] = useState("");
  const [dupCopyPerms, setDupCopyPerms] = useState(true);
  const [dupCopyAssign, setDupCopyAssign] = useState(false);

  const [delOpen, setDelOpen] = useState(false);
  const [delTarget, setDelTarget] = useState<RolePermissionSetting | null>(null);
  const [delConfirm, setDelConfirm] = useState("");

  const roleLinks = useMemo(
    () =>
      data.map((r) => (
        <li key={r.roleId}>
          <Link
            className="text-blue-700 underline-offset-2 hover:underline"
            href={`/settings/roles/${encodeURIComponent(r.roleId)}/edit`}
          >
            {r.roleName}
          </Link>
        </li>
      )),
    [data],
  );

  const openAssign = (role: RolePermissionSetting) => {
    setSelectedRoleId(role.roleId);
    setAssignRoleId(role.roleId);
    setAssignRaw(role.detail.assignedUsersRaw);
    setAssignNotes(role.detail.assignmentNotes);
    setAssignOpen(true);
  };

  const saveAssign = () => {
    if (!assignRoleId) return;
    onUpdateRole(assignRoleId, (r) => ({
      ...r,
      detail: { ...r.detail, assignedUsersRaw: assignRaw, assignmentNotes: assignNotes },
      assignedUsersCount: assignedCountFromRaw(assignRaw),
    }));
    setAssignRoleId(null);
    setAssignOpen(false);
  };

  const openDup = (role: RolePermissionSetting) => {
    setDupSource(role);
    setDupNewId(`${role.roleId}_copy`);
    setDupNewName(`${role.roleName} (copy)`);
    setDupCopyPerms(true);
    setDupCopyAssign(false);
    setDupOpen(true);
  };

  const saveDup = () => {
    if (!dupSource) return;
    const id = dupNewId.trim().toLowerCase();
    if (!/^[a-z][a-z0-9_-]{1,63}$/i.test(id)) {
      return;
    }
    if (data.some((r) => r.roleId === id)) {
      return;
    }
    const perms = dupCopyPerms ? dupSource.permissions.map((p) => ({ ...p })) : newCustomRolePermissions();
    const detail = dupCopyAssign ? { ...dupSource.detail } : emptyRoleDetail();
    const next: RolePermissionSetting = {
      roleId: id,
      roleName: dupNewName.trim() || id,
      description: `Duplicated from ${dupSource.roleName}.`,
      assignedUsersCount: assignedCountFromRaw(detail.assignedUsersRaw),
      systemRole: false,
      permissions: perms,
      detail,
    };
    onPatchRoles((roles) => [...roles, next]);
    setDupOpen(false);
    setDupSource(null);
    setSelectedRoleId(id);
  };

  const openDel = (role: RolePermissionSetting) => {
    setDelTarget(role);
    setDelConfirm("");
    setDelOpen(true);
  };

  const applyDel = () => {
    if (!delTarget || delTarget.systemRole) return;
    if (delConfirm.trim() !== delTarget.roleName.trim()) return;
    onPatchRoles((roles) => roles.filter((r) => r.roleId !== delTarget.roleId));
    setDelOpen(false);
    setDelTarget(null);
    setSelectedRoleId((cur) => {
      const rest = data.filter((r) => r.roleId !== delTarget.roleId);
      if (rest.some((r) => r.roleId === cur)) return cur;
      return rest[0]?.roleId ?? "";
    });
  };

  const requestPermissionChange = (
    roleId: string,
    module: RolePermissionEntry["module"],
    action: keyof Omit<RolePermissionEntry, "module">,
    checked: boolean,
  ) => {
    if (checked && isHighRiskAction(action)) {
      setPendingPerm({ roleId, module, action, checked });
      setHighRiskOpen(true);
      return;
    }
    onUpdatePermission(roleId, module, action, checked);
  };

  const confirmHighRisk = () => {
    if (!pendingPerm) return;
    onUpdatePermission(pendingPerm.roleId, pendingPerm.module, pendingPerm.action, pendingPerm.checked);
    setHighRiskOpen(false);
    setPendingPerm(null);
  };

  return (
    <section className="rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
      <SectionHeader
        title="Roles / Permissions"
        description="Manage user roles and fine-grained permissions for governance modules."
        actionLabel="New Role"
        onActionClick={onCreateRole}
      />
      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[280px_minmax(0,1fr)]">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <h3 className="text-sm font-semibold text-slate-900">Roles</h3>
          {data.length === 0 ? (
            <p className="mt-2 text-sm text-slate-600">No custom roles have been created.</p>
          ) : (
            <ul className="mt-2 space-y-2">
              {data.map((role) => (
                <li key={role.roleId}>
                  <div
                    className={`w-full rounded-lg border px-3 py-2 ${
                      selectedRoleId === role.roleId ? "border-blue-300 bg-blue-50" : "border-slate-200 bg-white"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedRoleId(role.roleId)}
                      className="w-full text-left"
                    >
                      <p className="text-sm font-semibold text-slate-900">{role.roleName}</p>
                      <p className="text-xs text-slate-500">{role.assignedUsersCount} assigned users</p>
                    </button>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Link
                        href={`/settings/roles/${encodeURIComponent(role.roleId)}`}
                        className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-7 px-2 text-xs")}
                        onClick={(e) => e.stopPropagation()}
                      >
                        Detail
                      </Link>
                      <Link
                        href={`/settings/roles/${encodeURIComponent(role.roleId)}/edit`}
                        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-7 px-2 text-xs")}
                      >
                        Edit
                      </Link>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <h3 className="text-sm font-semibold text-slate-900">Permission Matrix</h3>
          {selectedRole ? (
            <>
              <div className="mt-3 flex flex-wrap gap-2 border-b border-slate-100 pb-3">
                <Button type="button" variant="outline" size="sm" onClick={() => openAssign(selectedRole)}>
                  Assign users
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => openDup(selectedRole)}>
                  Duplicate
                </Button>
                {!selectedRole.systemRole ? (
                  <Button type="button" variant="destructive" size="sm" onClick={() => openDel(selectedRole)}>
                    Delete role
                  </Button>
                ) : null}
              </div>
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
                    {selectedRole.permissions.map((permission) => (
                      <tr key={permission.module} className="border-t border-slate-100">
                        <td className="py-2 font-semibold capitalize">{permission.module}</td>
                        {(["view", "create", "edit", "delete", "approve", "export", "admin"] as const).map((actionKey) => (
                          <td key={actionKey} className="py-2">
                            <label className="inline-flex items-center gap-1 text-xs text-slate-700">
                              <input
                                type="checkbox"
                                checked={permission[actionKey]}
                                onChange={(event) =>
                                  requestPermissionChange(
                                    selectedRole.roleId,
                                    permission.module,
                                    actionKey,
                                    event.target.checked,
                                  )
                                }
                                aria-label={`${selectedRole.roleName} ${actionKey} ${permission.module}`}
                              />
                              {permission[actionKey] ? "Yes" : "No"}
                            </label>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <p className="mt-2 text-sm text-slate-600">Select a role to view permissions.</p>
          )}
        </div>
      </div>

      {data.length > 0 ? (
        <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50/60 p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Role edit routes</h3>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-blue-800">{roleLinks}</ul>
        </div>
      ) : null}

      <TemplateSettingsDialog
        open={highRiskOpen}
        title="Confirm high-risk permission"
        onClose={() => {
          setHighRiskOpen(false);
          setPendingPerm(null);
        }}
        footer={
          <>
            <Button type="button" variant="outline" size="sm" onClick={() => { setHighRiskOpen(false); setPendingPerm(null); }}>
              Cancel
            </Button>
            <Button type="button" size="sm" onClick={confirmHighRisk}>
              Enable permission
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-700">
          Granting <strong>{pendingPerm?.action}</strong> on <strong>{pendingPerm?.module}</strong> can expand blast radius.
          Continue only if this matches governance policy.
        </p>
      </TemplateSettingsDialog>

      <TemplateSettingsDialog
        open={assignOpen}
        title="Assign users"
        onClose={() => {
          setAssignOpen(false);
          setAssignRoleId(null);
        }}
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setAssignOpen(false);
                setAssignRoleId(null);
              }}
            >
              Cancel
            </Button>
            <Button type="button" size="sm" onClick={saveAssign}>
              Save
            </Button>
          </>
        }
      >
        <label className="block text-sm">
          <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Users (comma-separated)</span>
          <textarea
            className="min-h-[72px] w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={assignRaw}
            onChange={(e) => setAssignRaw(e.target.value)}
          />
        </label>
        <label className="mt-3 block text-sm">
          <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Notes</span>
          <textarea
            className="min-h-[56px] w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={assignNotes}
            onChange={(e) => setAssignNotes(e.target.value)}
          />
        </label>
      </TemplateSettingsDialog>

      <TemplateSettingsDialog
        open={dupOpen}
        title="Duplicate role"
        onClose={() => { setDupOpen(false); setDupSource(null); }}
        wide
        footer={
          <>
            <Button type="button" variant="outline" size="sm" onClick={() => { setDupOpen(false); setDupSource(null); }}>
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={saveDup}
              disabled={
                !dupSource ||
                !/^[a-z][a-z0-9_-]{1,63}$/i.test(dupNewId.trim()) ||
                data.some((r) => r.roleId === dupNewId.trim().toLowerCase())
              }
            >
              Create copy
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">Source: {dupSource?.roleName}</p>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">New role id</span>
            <input
              className="h-9 w-full rounded-lg border border-slate-200 px-2 font-mono text-sm"
              value={dupNewId}
              onChange={(e) => setDupNewId(e.target.value)}
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">New role name</span>
            <input
              className="h-9 w-full rounded-lg border border-slate-200 px-2 text-sm"
              value={dupNewName}
              onChange={(e) => setDupNewName(e.target.value)}
            />
          </label>
        </div>
        <label className="mt-3 flex items-center gap-2 text-sm">
          <input type="checkbox" checked={dupCopyPerms} onChange={(e) => setDupCopyPerms(e.target.checked)} />
          Copy permission matrix
        </label>
        <label className="mt-2 flex items-center gap-2 text-sm">
          <input type="checkbox" checked={dupCopyAssign} onChange={(e) => setDupCopyAssign(e.target.checked)} />
          Copy assigned users list
        </label>
      </TemplateSettingsDialog>

      <TemplateSettingsDialog
        open={delOpen}
        title="Delete role"
        onClose={() => { setDelOpen(false); setDelTarget(null); }}
        footer={
          <>
            <Button type="button" variant="outline" size="sm" onClick={() => { setDelOpen(false); setDelTarget(null); }}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={applyDel}
              disabled={!delTarget || delConfirm.trim() !== delTarget.roleName.trim()}
            >
              Delete permanently
            </Button>
          </>
        }
      >
        {delTarget ? (
          <p className="text-sm text-slate-700">
            Type the role name <strong>{delTarget.roleName}</strong> to confirm deletion. This removes the role from saved
            settings when you click Save on the settings page.
          </p>
        ) : null}
        <input
          className="mt-3 h-9 w-full rounded-lg border border-slate-200 px-2 text-sm"
          value={delConfirm}
          onChange={(e) => setDelConfirm(e.target.value)}
          placeholder="Role name"
        />
      </TemplateSettingsDialog>
    </section>
  );
}
