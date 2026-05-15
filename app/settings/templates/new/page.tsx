import type { Metadata } from "next";

import { TemplateNewPageClient } from "@/components/settings/template-new-page-client";
import { loadSettingsPageData } from "@/lib/server/settings";

export const metadata: Metadata = {
  title: "New Template",
};

export default async function NewTemplatePage() {
  const initial = await loadSettingsPageData("template_registry");
  return <TemplateNewPageClient initial={initial} />;
}
