import { SettingsPage } from "@/components/settings/settings-page";
import { buildSettingsPageData } from "@/data/settings.mock";

export default function SettingsRootPage() {
  return <SettingsPage initial={buildSettingsPageData("lifecycle_configuration")} />;
}
