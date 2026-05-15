import type { Metadata } from "next";

import { SettingsPage } from "@/components/settings/settings-page";
import { loadSettingsPageData } from "@/lib/server/settings";

export const metadata: Metadata = {
  title: "Template Registry",
};

export default async function SettingsTemplatesPage() {
  const initial = await loadSettingsPageData("template_registry");
  return <SettingsPage initial={initial} />;
}
