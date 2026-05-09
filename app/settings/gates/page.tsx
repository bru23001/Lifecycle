import { SettingsPage } from "@/components/settings/settings-page";
import { buildSettingsPageData } from "@/data/settings.mock";

export default function SettingsGatesPage() {
  return <SettingsPage initial={buildSettingsPageData("gate_rules")} />;
}
