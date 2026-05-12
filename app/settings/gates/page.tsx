import { SettingsPage } from "@/components/settings/settings-page";
import { loadSettingsPageData } from "@/lib/server/settings";

export default async function SettingsGatesPage() {
  const initial = await loadSettingsPageData("gate_rules");
  return <SettingsPage initial={initial} />;
}
