"use client";

import { useState } from "react";

import { SectionHeader } from "@/components/settings/shared";
import type { RolePermissionSetting } from "@/types/settings.types";

export function RolesPermissionsPanel({
  data,
  onCreateRole,
}: {
  data: RolePermissionSetting[];
  onCreateRole: () => void;
}) {
  const [selectedRoleId, setSelectedRoleId] = useState<string>(data[0]?.roleId ?? "");
  const selectedRole = data.find((row) => row.roleId === selectedRoleId);

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
                  <button
                    type="button"
                    onClick={() => setSelectedRoleId(role.roleId)}
                    className={`w-full rounded-lg border px-3 py-2 text-left ${
                      selectedRoleId === role.roleId
                        ? "border-blue-300 bg-blue-50"
                        : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                    aria-current={selectedRoleId === role.roleId ? "page" : undefined}
                  >
                    <p className="text-sm font-semibold text-slate-900">{role.roleName}</p>
                    <p className="text-xs text-slate-500">{role.assignedUsersCount} assigned users</p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <h3 className="text-sm font-semibold text-slate-900">Permission Matrix</h3>
          {selectedRole ? (
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
                              readOnly
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
          ) : (
            <p className="mt-2 text-sm text-slate-600">Select a role to view permissions.</p>
          )}
        </div>
      </div>
    </section>
  );
}
