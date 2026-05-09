import { SettingsPage } from "@/components/settings/settings-page";
import { buildSettingsPageData } from "@/data/settings.mock";

export default function SettingsRolesPage() {
  return <SettingsPage initial={buildSettingsPageData("roles_permissions")} />;
}
