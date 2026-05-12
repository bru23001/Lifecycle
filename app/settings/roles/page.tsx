import { SettingsPage } from "@/components/settings/settings-page";
import { loadSettingsPageData } from "@/lib/server/settings";

export default async function SettingsRolesPage() {
  const initial = await loadSettingsPageData("roles_permissions");
  return <SettingsPage initial={initial} />;
}
