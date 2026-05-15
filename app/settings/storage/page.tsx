import type { Metadata } from "next";

import { SettingsPage } from "@/components/settings/settings-page";
import { loadSettingsPageData } from "@/lib/server/settings";

export const metadata: Metadata = {
  title: "Local Storage Settings",
};

export default async function SettingsStoragePage() {
  const initial = await loadSettingsPageData("local_storage_settings");
  return <SettingsPage initial={initial} />;
}
