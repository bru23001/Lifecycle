import { SettingsPage } from "@/components/settings/settings-page";
import { loadSettingsPageData } from "@/lib/server/settings";

export default async function SettingsExportsPage() {
  const initial = await loadSettingsPageData("export_settings");
  return <SettingsPage initial={initial} />;
}
