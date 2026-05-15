import type { Metadata } from "next";

import { GateNewPageClient } from "@/components/settings/gate-new-page-client";
import { loadSettingsPageData } from "@/lib/server/settings";

export const metadata: Metadata = {
  title: "New Gate Rule",
};

export default async function NewGateRulePage() {
  const initial = await loadSettingsPageData("gate_rules");
  return <GateNewPageClient initial={initial} />;
}
