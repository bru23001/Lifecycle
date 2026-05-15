"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { putSettingsPageData, TemplateRegistryPageShell } from "@/components/settings/template-registry-shared";
import { emptyRoleDetail } from "@/lib/role-settings-defaults";
import { newCustomRolePermissions } from "@/lib/server/settings-seed-builders";
import type { RolePermissionSetting, SettingsPageData } from "@/types/settings.types";

const ROLE_ID_PATTERN = /^[a-z][a-z0-9_-]{1,63}$/i;

export function RoleNewPageClient({ initial }: { initial: SettingsPageData }) {
  const router = useRouter();
  const [roleId, setRoleId] = useState("");
  const [roleName, setRoleName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    setError(null);
    const id = roleId.trim().toLowerCase();
    if (!ROLE_ID_PATTERN.test(id)) {
      setError("Role id must be 2–64 characters: letters, numbers, underscore, hyphen; start with a letter.");
      return;
    }
    if (initial.rolesPermissions.some((r) => r.roleId === id)) {
      setError("A role with this id already exists.");
      return;
    }
    const role: RolePermissionSetting = {
      roleId: id,
      roleName: roleName.trim() || id,
      description: description.trim() || "Custom role",
      assignedUsersCount: 0,
      systemRole: false,
      permissions: newCustomRolePermissions(),
      detail: emptyRoleDetail(),
    };
    const next: SettingsPageData = {
      ...initial,
      activeSection: "roles_permissions",
      rolesPermissions: [...initial.rolesPermissions, role],
    };
    setSaving(true);
    try {
      await putSettingsPageData(next);
      router.push(`/settings/roles/${encodeURIComponent(role.roleId)}`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create role.");
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
        { label: "New role" },
      ]}
    >
      <div className="mt-6 rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">New role</h1>
        <p className="mt-1 text-sm text-slate-600">
          Define a role id and display name. Permissions start aligned with Viewer; adjust them after save from Edit role.
        </p>
        {error ? <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p> : null}
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="block text-sm md:col-span-2">
            <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Role id (slug)</span>
            <input
              className="h-10 w-full rounded-lg border border-slate-200 px-3 font-mono text-sm"
              value={roleId}
              onChange={(e) => setRoleId(e.target.value)}
              placeholder="compliance_lead"
            />
          </label>
          <label className="block text-sm md:col-span-2">
            <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Role name</span>
            <input
              className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              placeholder="Compliance Lead"
            />
          </label>
          <label className="block text-sm md:col-span-2">
            <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Description</span>
            <textarea
              className="min-h-[80px] w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>
        </div>
        <div className="mt-8 flex flex-wrap gap-2">
          <Button type="button" onClick={() => void handleCreate()} disabled={saving}>
            {saving ? "Creating…" : "Create role"}
          </Button>
          <Link
            href="/settings/roles"
            className="inline-flex h-8 items-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium hover:bg-slate-50"
          >
            Cancel
          </Link>
        </div>
      </div>
    </TemplateRegistryPageShell>
  );
}
