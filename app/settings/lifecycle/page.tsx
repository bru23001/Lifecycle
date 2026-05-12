import { SettingsPage } from "@/components/settings/settings-page";
import { loadSettingsPageData } from "@/lib/server/settings";

export default async function SettingsLifecyclePage() {
  const initial = await loadSettingsPageData("lifecycle_configuration");
  return <SettingsPage initial={initial} />;
}
