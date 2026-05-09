import { SettingsPage } from "@/components/settings/settings-page";
import { buildSettingsPageData } from "@/data/settings.mock";

export default function SettingsStoragePage() {
  return <SettingsPage initial={buildSettingsPageData("local_storage_settings")} />;
}
