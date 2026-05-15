import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { GateEditPageClient } from "@/components/settings/gate-edit-page-client";
import { findGateRuleByRouteParam } from "@/lib/gate-rules-defaults";
import { loadSettingsPageData } from "@/lib/server/settings";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ gateRuleId: string }>;
}): Promise<Metadata> {
  const { gateRuleId } = await params;
  const initial = await loadSettingsPageData("gate_rules");
  const rule = findGateRuleByRouteParam(initial.gateRules, gateRuleId);
  return { title: rule ? `Edit ${rule.gateCode}` : "Edit gate rule" };
}

export default async function GateEditPage({ params }: { params: Promise<{ gateRuleId: string }> }) {
  const { gateRuleId } = await params;
  const initial = await loadSettingsPageData("gate_rules");
  const rule = findGateRuleByRouteParam(initial.gateRules, gateRuleId);
  if (!rule) notFound();
  return <GateEditPageClient initial={initial} rule={rule} />;
}
