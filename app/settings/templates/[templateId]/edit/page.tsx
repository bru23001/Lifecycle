import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TemplateEditPageClient } from "@/components/settings/template-edit-page-client";
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
  return { title: item ? `Edit ${item.templateCode}` : "Edit Template" };
}

export default async function TemplateEditPage({ params }: { params: Promise<{ templateId: string }> }) {
  const { templateId } = await params;
  const initial = await loadSettingsPageData("template_registry");
  const item = findTemplateByRouteParam(initial.templateRegistry, templateId);
  if (!item) notFound();
  return <TemplateEditPageClient initial={initial} item={item} />;
}
