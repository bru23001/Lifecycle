import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { RoleEditPageClient } from "@/components/settings/role-edit-page-client";
import { findRoleByRouteParam } from "@/lib/role-settings-defaults";
import { loadSettingsPageData } from "@/lib/server/settings";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ roleId: string }>;
}): Promise<Metadata> {
  const { roleId } = await params;
  const initial = await loadSettingsPageData("roles_permissions");
  const role = findRoleByRouteParam(initial.rolesPermissions, roleId);
  return { title: role ? `Edit ${role.roleName}` : "Edit role" };
}

export default async function RoleEditPage({ params }: { params: Promise<{ roleId: string }> }) {
  const { roleId } = await params;
  const initial = await loadSettingsPageData("roles_permissions");
  const role = findRoleByRouteParam(initial.rolesPermissions, roleId);
  if (!role) notFound();
  return <RoleEditPageClient initial={initial} role={role} />;
}
