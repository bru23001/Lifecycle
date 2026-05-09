import { SettingsPage } from "@/components/settings/settings-page";
import { buildSettingsPageData } from "@/data/settings.mock";

export default function SettingsExportsPage() {
  return <SettingsPage initial={buildSettingsPageData("export_settings")} />;
}
