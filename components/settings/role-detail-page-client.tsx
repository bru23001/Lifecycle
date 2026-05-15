"use client";

import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { TemplateRegistryPageShell } from "@/components/settings/template-registry-shared";
import { cn } from "@/lib/utils";
import type { RolePermissionSetting, SettingsPageData } from "@/types/settings.types";

function Block({ title, body }: { title: string; body: string }) {
  return (
    <section className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</h3>
      <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap text-xs text-slate-800">{body.trim() || "—"}</pre>
    </section>
  );
}

export function RoleDetailPageClient({ initial, role }: { initial: SettingsPageData; role: RolePermissionSetting }) {
  const { detail } = role;

  return (
    <TemplateRegistryPageShell
      user={initial.user}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Settings", href: "/settings/lifecycle" },
        { label: "Roles / Permissions", href: "/settings/roles" },
        { label: role.roleName },
      ]}
    >
      <div className="mt-6 space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">{role.roleName}</h1>
            <p className="mt-1 text-sm text-slate-600">
              <span className="font-mono font-semibold text-slate-800">{role.roleId}</span>
              <span className="mx-2 text-slate-300">·</span>
              {role.systemRole ? "System role" : "Custom role"}
              <span className="mx-2 text-slate-300">·</span>
              {role.assignedUsersCount} assigned users
            </p>
            <p className="mt-2 max-w-2xl text-sm text-slate-700">{role.description || "—"}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/settings/roles/${encodeURIComponent(role.roleId)}/edit`}
              className={cn(buttonVariants({ variant: "default", size: "sm" }))}
            >
              Edit role
            </Link>
            <Link href="/settings/roles" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
              Back to roles
            </Link>
          </div>
        </div>

        <div className="rounded-lg border border-slate-100 bg-white px-4 py-3 text-sm text-slate-700">
          <span className="font-semibold text-slate-900">Assigned users: </span>
          {detail.assignedUsersRaw.trim().length > 0 ? detail.assignedUsersRaw : "None listed"}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Block title="Assignment notes" body={detail.assignmentNotes} />
          <Block title="Audit / history notes" body={detail.auditHistoryNotes} />
          <Block title="Related approvals" body={detail.relatedApprovalsNotes} />
          <Block title="Export permissions notes" body={detail.exportPermissionsNotes} />
        </div>
      </div>
    </TemplateRegistryPageShell>
  );
}
