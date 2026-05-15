import type { Metadata } from "next";

import { SettingsPage } from "@/components/settings/settings-page";
import { loadSettingsPageData } from "@/lib/server/settings";

export const metadata: Metadata = {
  title: "Gate Rules",
};

export default async function SettingsGatesPage() {
  const initial = await loadSettingsPageData("gate_rules");
  return <SettingsPage initial={initial} />;
}
