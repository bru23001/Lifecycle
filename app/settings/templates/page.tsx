import { SettingsPage } from "@/components/settings/settings-page";
import { buildSettingsPageData } from "@/data/settings.mock";

export default function SettingsTemplatesPage() {
  return <SettingsPage initial={buildSettingsPageData("template_registry")} />;
}
