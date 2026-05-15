import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { GateDetailPageClient } from "@/components/settings/gate-detail-page-client";
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
  return { title: rule ? `${rule.gateCode} · Gate rule` : "Gate rule" };
}

export default async function GateDetailPage({ params }: { params: Promise<{ gateRuleId: string }> }) {
  const { gateRuleId } = await params;
  const initial = await loadSettingsPageData("gate_rules");
  const rule = findGateRuleByRouteParam(initial.gateRules, gateRuleId);
  if (!rule) notFound();
  return <GateDetailPageClient initial={initial} rule={rule} />;
}
