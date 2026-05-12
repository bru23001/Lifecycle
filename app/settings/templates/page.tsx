import { SettingsPage } from "@/components/settings/settings-page";
import { loadSettingsPageData } from "@/lib/server/settings";

export default async function SettingsTemplatesPage() {
  const initial = await loadSettingsPageData("template_registry");
  return <SettingsPage initial={initial} />;
}
