import type { Metadata } from "next";

import { SettingsPage } from "@/components/settings/settings-page";
import { loadSettingsPageData } from "@/lib/server/settings";

export const metadata: Metadata = {
  title: "Lifecycle Configuration",
};

export default async function SettingsLifecyclePage() {
  const initial = await loadSettingsPageData("lifecycle_configuration");
  return <SettingsPage initial={initial} />;
}
