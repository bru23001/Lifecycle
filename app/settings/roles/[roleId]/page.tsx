import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { RoleDetailPageClient } from "@/components/settings/role-detail-page-client";
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
  return { title: role ? `${role.roleName} · Role` : "Role" };
}

export default async function RoleDetailPage({ params }: { params: Promise<{ roleId: string }> }) {
  const { roleId } = await params;
  const initial = await loadSettingsPageData("roles_permissions");
  const role = findRoleByRouteParam(initial.rolesPermissions, roleId);
  if (!role) notFound();
  return <RoleDetailPageClient initial={initial} role={role} />;
}
