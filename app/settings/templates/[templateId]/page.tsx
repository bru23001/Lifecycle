import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TemplateDetailPageClient } from "@/components/settings/template-detail-page-client";
import { findTemplateByRouteParam } from "@/lib/template-registry-defaults";
import { loadSettingsPageData } from "@/lib/server/settings";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ templateId: string }>;
}): Promise<Metadata> {
  const { templateId } = await params;
  const initial = await loadSettingsPageData("template_registry");
  const item = findTemplateByRouteParam(initial.templateRegistry, templateId);
  return { title: item ? `${item.templateCode} · Template` : "Template" };
}

export default async function TemplateDetailPage({ params }: { params: Promise<{ templateId: string }> }) {
  const { templateId } = await params;
  const initial = await loadSettingsPageData("template_registry");
  const item = findTemplateByRouteParam(initial.templateRegistry, templateId);
  if (!item) notFound();
  return <TemplateDetailPageClient initial={initial} item={item} />;
}
