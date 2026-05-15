import type { Metadata } from "next";

import { SettingsPage } from "@/components/settings/settings-page";
import { loadSettingsPageData } from "@/lib/server/settings";

export const metadata: Metadata = {
  title: "Export Settings",
};

export default async function SettingsExportsPage() {
  const initial = await loadSettingsPageData("export_settings");
  return <SettingsPage initial={initial} />;
}
