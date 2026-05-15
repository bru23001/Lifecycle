import type { Metadata } from "next";

import { RoleNewPageClient } from "@/components/settings/role-new-page-client";
import { loadSettingsPageData } from "@/lib/server/settings";

export const metadata: Metadata = {
  title: "New Role",
};

export default async function NewRolePage() {
  const initial = await loadSettingsPageData("roles_permissions");
  return <RoleNewPageClient initial={initial} />;
}
